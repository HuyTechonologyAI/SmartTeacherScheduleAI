import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * CANONICAL FEEDBACK API — EDUVIET
 * Target: POST /api/ai/jobs/:job_id/feedback
 * Flywheel: Feeds into edu_generation_feedback & edu_learning_candidates
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { job_id: string } }
) {
  try {
    const jobId = params.job_id;
    if (!jobId) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

    const body = await req.json();
    const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
    const accepted = body.accepted ?? (rating >= 3);
    const edited = body.edited ?? false;
    const feedbackText = body.feedback_text || "";
    const userId = body.user_id || null;

    // 1. Tìm edu_generation_requests
    let eduReq: any = null;
    const { data: byJobId } = await supabaseAdmin
      .from("edu_generation_requests")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();

    if (byJobId) {
      eduReq = byJobId;
    } else {
      const { data: byTaskId } = await supabaseAdmin
        .from("edu_generation_requests")
        .select("*")
        .eq("ai_task_id", jobId)
        .maybeSingle();
      eduReq = byTaskId;
    }

    if (!eduReq) {
      return NextResponse.json({ error: "Job không tồn tại" }, { status: 404 });
    }

    // 2. Lưu vào bảng edu_generation_feedback
    const feedbackId = crypto.randomUUID();
    const { error: fbErr } = await supabaseAdmin.from("edu_generation_feedback").insert({
      id: feedbackId,
      request_id: eduReq.id,
      user_id: userId || eduReq.user_id,
      rating,
      accepted,
      edited,
      feedback_text: feedbackText,
    });

    if (fbErr) {
      console.error("[EduViet Feedback] Lỗi ghi feedback:", fbErr);
    }

    // 3. Data Flywheel: Ingest candidate nếu đủ điều kiện (Student data guard / consent checked)
    if (eduReq.consent_learning_use && eduReq.actor_role !== "STUDENT") {
      const candidateType = rating >= 4 ? "POSITIVE_FEEDBACK" : "REPAIR_CORRECTION_CANDIDATE";
      await supabaseAdmin.from("edu_learning_candidates").insert({
        id: crypto.randomUUID(),
        request_id: eduReq.id,
        candidate_type: candidateType,
        deidentification_status: "PENDING_DEIDENTIFICATION",
        consent_status: "CONSENT_VERIFIED",
        quality_score: rating * 20, // 0 - 100
        human_feedback_score: rating,
        policy_status: "PENDING_REVIEW",
      });
    }

    // 4. Ghi nhận Trace vào ai_task_steps
    await supabaseAdmin.from("ai_task_steps").insert({
      task_id: eduReq.ai_task_id,
      message_id: crypto.randomUUID(),
      haip_version: "1.0",
      message_type: "EVENT",
      intent: "EDU_FEEDBACK_RECEIVED",
      sender_type: "client",
      sender_id: "EDUVIET_USER",
      recipient_type: "supervisor",
      recipient_id: "ANTIGRAVITY_L1_GROUP_SUPERVISOR",
      capability: "user_feedback_curation",
      envelope: {
        feedback_id: feedbackId,
        rating,
        accepted,
        edited,
        has_text: Boolean(feedbackText),
      },
      status: "COMPLETED",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      status: "RECORDED",
      feedback_id: feedbackId,
      job_id: eduReq.id,
      rating,
      message: "Cảm ơn bạn đã đóng góp phản hồi để nâng cấp chất lượng sư phạm!",
    });

  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Lỗi ghi nhận feedback", message: error.message }, { status: 500 });
  }
}
