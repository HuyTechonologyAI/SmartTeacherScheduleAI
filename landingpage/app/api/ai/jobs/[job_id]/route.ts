import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * CANONICAL JOB STATUS API — EDUVIET
 * Target: GET /api/ai/jobs/:job_id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { job_id: string } }
) {
  try {
    const jobId = params.job_id;
    if (!jobId) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

    // 1. Tìm bản ghi edu_generation_requests (hỗ trợ cả tìm theo id hoặc ai_task_id)
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

    // 2. Lấy thông tin ai_tasks và artifacts hiện có
    const { data: task } = await supabaseAdmin
      .from("ai_tasks")
      .select("*")
      .eq("id", eduReq.ai_task_id)
      .maybeSingle();

    const { data: artifacts } = await supabaseAdmin
      .from("edu_generation_artifacts")
      .select("artifact_type, quality_status, created_at")
      .eq("request_id", eduReq.id);

    const completedOutputs = (artifacts || []).map((a: any) => a.artifact_type);
    const requestedOutputs = eduReq.requested_outputs || [];
    const pendingOutputs = requestedOutputs.filter((o: string) => !completedOutputs.includes(o));

    // 3. Tính toán Tiến độ & Stage dựa trên task state
    const taskStatus = task?.status || eduReq.status;
    let progress = 10;
    let currentStage = "QUEUED";

    switch (taskStatus) {
      case "QUEUED":
        progress = 10;
        currentStage = "QUEUED";
        break;
      case "CLAIMED":
        progress = 25;
        currentStage = "SOURCE_RETRIEVAL";
        break;
      case "RUNNING":
      case "PLANNING":
        progress = 40;
        currentStage = "PLANNING";
        break;
      case "GENERATING_LESSON_PLAN":
        progress = 55;
        currentStage = "LESSON_PLAN_GENERATION";
        break;
      case "GENERATING_SLIDES":
        progress = 68;
        currentStage = "SLIDE_GENERATION";
        break;
      case "GENERATING_MINDMAP":
        progress = 78;
        currentStage = "MINDMAP_GENERATION";
        break;
      case "GENERATING_MINIGAME":
        progress = 85;
        currentStage = "MINIGAME_GENERATION";
        break;
      case "EDUCATION_QA":
      case "REVIEWING":
        progress = 90;
        currentStage = "EDUCATION_QA";
        break;
      case "FINALIZING":
        progress = 95;
        currentStage = "PACKAGING";
        break;
      case "COMPLETED":
        progress = 100;
        currentStage = "COMPLETED";
        break;
      case "FAILED":
      case "REJECTED":
        progress = 100;
        currentStage = "FAILED";
        break;
    }

    return NextResponse.json({
      job_id: eduReq.id,
      task_id: eduReq.ai_task_id,
      status: taskStatus,
      progress,
      current_stage: currentStage,
      lesson_title: eduReq.lesson_title,
      subject: eduReq.subject,
      standard: eduReq.standard,
      completed_outputs: completedOutputs,
      pending_outputs: pendingOutputs,
      quality: {
        source_check: progress >= 25 ? "PASS" : "PENDING",
        education_qa: progress >= 90 ? "PASS" : "PENDING",
      },
      created_at: eduReq.created_at,
      updated_at: eduReq.updated_at,
    });

  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Lỗi kiểm tra trạng thái job", message: error.message }, { status: 500 });
  }
}
