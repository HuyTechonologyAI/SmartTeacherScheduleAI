import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * CANONICAL EDUCATION AI GATEWAY — EDUVIET
 * Target: POST /api/ai/generate
 * Plan: HUY AI CENTER × EDUVIET CANONICAL EDUCATION AI BRIDGE V1.0
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validation & Chuẩn hóa đầu vào
    const requestId = body.request_id || crypto.randomUUID();
    const requestType = body.request_type || "LESSON_PACKAGE";
    let requestedOutputs = Array.isArray(body.requested_outputs) ? body.requested_outputs : [];
    if (requestedOutputs.length === 0) {
      if (requestType === "LESSON_PACKAGE") {
        requestedOutputs = ["LESSON_PLAN", "SLIDES", "MINDMAP", "MINI_GAME"];
      } else {
        requestedOutputs = [requestType];
      }
    }

    const actor = {
      role: body.actor?.role === "STUDENT" ? "STUDENT" : "TEACHER",
      user_id: body.actor?.user_id || null,
    };

    const educationContext = {
      lesson_title: body.education_context?.lesson_title || body.lessonTitle || "Bài học chuyên đề",
      subject: body.education_context?.subject || body.subject || "Chung",
      grade_or_level: body.education_context?.grade_or_level || body.grade || body.className || "Phổ thông",
      class_name: body.education_context?.class_name || body.className || "",
      standard: String(body.education_context?.standard || body.standard || "5512") === "2634" ? "2634" : "5512",
      duration_minutes: Number(body.education_context?.duration_minutes || body.durationMinutes) || (body.standard === 2634 ? 180 : 45),
      teaching_style_id: body.education_context?.teaching_style_id || body.teachingStyleId || "",
      skill_id: body.education_context?.skill_id || body.selectedSkillId || "",
      custom_requirements: body.education_context?.custom_requirements || body.customRequirements || "",
    };

    const sourceRefs = Array.isArray(body.source_refs) ? body.source_refs : [];
    if (body.rawDocumentText || body.referenceContext) {
      sourceRefs.push({
        type: "INLINE_TEXT",
        snippet: (body.rawDocumentText || body.referenceContext).slice(0, 30000),
      });
    }

    const options = {
      language: body.options?.language || "vi",
      local_ai_preferred: body.options?.local_ai_preferred ?? true,
      include_answer_key: body.options?.include_answer_key ?? true,
    };

    const consent = {
      store_for_history: body.consent?.store_for_history ?? true,
      allow_deidentified_learning_use: body.consent?.allow_deidentified_learning_use ?? false,
    };

    // 2. Kiểm tra Idempotency chống gửi trùng lặp (Double submit protection)
    const idempotencyKey = `eduviet:${actor.user_id || "anon"}:${requestId}`;
    const { data: existingTask } = await supabaseAdmin
      .from("ai_tasks")
      .select("id, status, created_at")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (existingTask) {
      const { data: existingEduReq } = await supabaseAdmin
        .from("edu_generation_requests")
        .select("id, status")
        .eq("ai_task_id", existingTask.id)
        .maybeSingle();

      const jobId = existingEduReq?.id || existingTask.id;
      return NextResponse.json({
        request_id: requestId,
        job_id: jobId,
        task_id: existingTask.id,
        status: existingEduReq?.status || existingTask.status,
        status_url: `/api/ai/jobs/${jobId}`,
        realtime_channel: `edu-job:${jobId}`,
        idempotent_replay: true,
      });
    }

    // 3. Khởi tạo Tác vụ Chuẩn Canonical ai_tasks trong HuyAI
    const taskId = crypto.randomUUID();
    const conversationId = crypto.randomUUID();
    const departmentId = actor.role === "STUDENT" ? "dept-02-student-tutor" : "dept-02-teacher-copilot";

    const { error: taskErr } = await supabaseAdmin.from("ai_tasks").insert({
      id: taskId,
      conversation_id: conversationId,
      owner_user_id: actor.user_id,
      organization_id: "org-02-aischool",
      department_id: departmentId,
      source_app: "eduviet",
      intent: `EDU_${requestType}`,
      priority: 1,
      status: "QUEUED",
      idempotency_key: idempotencyKey,
      assigned_capability: "education_generation",
      assigned_agent_id: null,
      depends_on: [],
      parallel_group: null,
      completion_condition: {},
      risk_level: 0,
      risk_context: {},
      approval_required: false,
      approval_status: "NOT_REQUIRED",
      budget_config: {},
      estimated_cost_usd: 0,
      actual_cost_usd: 0,
      token_usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
      runtime_ms: 0,
      constraints: {},
      input_refs: [],
      expected_outputs: requestedOutputs,
      input: {
        request_id: requestId,
        actor,
        education_context: educationContext,
        source_refs: sourceRefs,
        options,
        consent,
      },
      data_classification: actor.role === "STUDENT" ? "RESTRICTED" : "INTERNAL",
      cost_center_code: "CC-02-AISCHOOL",
      requested_by_organization_id: "org-02-aischool",
      state_version: 1,
      retry_count: 0,
      max_retries: 3,
      review_cycle: 0,
    });

    if (taskErr) {
      console.error("[EduViet Gateway] Lỗi tạo ai_tasks:", taskErr);
      return NextResponse.json({ error: "Không thể tạo tác vụ giáo dục", details: taskErr.message }, { status: 500 });
    }

    // 4. Tạo bản ghi chi tiết edu_generation_requests
    const eduRequestId = crypto.randomUUID();
    const { error: eduErr } = await supabaseAdmin.from("edu_generation_requests").insert({
      id: eduRequestId,
      ai_task_id: taskId,
      user_id: actor.user_id,
      actor_role: actor.role,
      request_type: requestType,
      requested_outputs: requestedOutputs,
      lesson_title: educationContext.lesson_title,
      subject: educationContext.subject,
      education_level: educationContext.grade_or_level,
      standard: educationContext.standard,
      duration_minutes: educationContext.duration_minutes,
      source_app: "eduviet",
      source_request_id: requestId,
      input_snapshot: body,
      consent_store_history: consent.store_for_history,
      consent_learning_use: consent.allow_deidentified_learning_use,
      status: "QUEUED",
    });

    if (eduErr) {
      console.error("[EduViet Gateway] Lỗi tạo edu_generation_requests:", eduErr);
    }

    // 5. Ghi nhận Trace đầu tiên vào ai_task_steps (INTAKE)
    const stepIntakeId = crypto.randomUUID();
    await supabaseAdmin.from("ai_task_steps").insert({
      task_id: taskId,
      message_id: stepIntakeId,
      haip_version: "1.0",
      message_type: "EVENT",
      intent: "EDU_REQUEST_RECEIVED",
      sender_type: "client",
      sender_id: "EDUVIET_GATEWAY",
      recipient_type: "supervisor",
      recipient_id: "ANTIGRAVITY_L1_GROUP_SUPERVISOR",
      capability: "education_generation",
      envelope: {
        request_id: requestId,
        job_id: eduRequestId,
        outputs: requestedOutputs,
        standard: educationContext.standard,
      },
      status: "COMPLETED",
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    // 6. Đẩy vào hàng đợi bền vững PGMQ qua RPC haip_enqueue_job
    try {
      await supabaseAdmin.rpc("haip_enqueue_job", {
        p_task_id: taskId,
        p_message_type: "EDU_GENERATION_REQUEST",
        p_envelope: {
          request_id: requestId,
          job_id: eduRequestId,
          request_type: requestType,
          requested_outputs: requestedOutputs,
          education_context: educationContext,
        },
      });
    } catch (queueErr) {
      console.warn("[EduViet Gateway] haip_enqueue_job warning:", queueErr);
    }

    return NextResponse.json({
      request_id: requestId,
      job_id: eduRequestId,
      task_id: taskId,
      status: "QUEUED",
      status_url: `/api/ai/jobs/${eduRequestId}`,
      realtime_channel: `edu-job:${eduRequestId}`,
    }, { status: 202 });

  } catch (err: unknown) {
    const error = err as Error;
    console.error("[EduViet Gateway] Exception:", error);
    return NextResponse.json({ error: "Lỗi nội bộ hệ thống", message: error.message }, { status: 500 });
  }
}
