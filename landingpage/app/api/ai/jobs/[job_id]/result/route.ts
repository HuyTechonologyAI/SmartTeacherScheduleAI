import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * CANONICAL JOB RESULT API — EDUVIET
 * Target: GET /api/ai/jobs/:job_id/result
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const { job_id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

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

    // 2. Kiểm tra task
    const { data: task } = await supabaseAdmin
      .from("ai_tasks")
      .select("status, output, completed_at")
      .eq("id", eduReq.ai_task_id)
      .maybeSingle();

    const isCompleted = (task?.status === "COMPLETED" || eduReq.status === "COMPLETED");

    // 3. Lấy artifacts liên kết
    const { data: artifacts } = await supabaseAdmin
      .from("edu_generation_artifacts")
      .select("*")
      .eq("request_id", eduReq.id);

    // Lấy ai_outputs
    const { data: aiOutputs } = await supabaseAdmin
      .from("ai_outputs")
      .select("*")
      .eq("task_id", eduReq.ai_task_id);

    if (!isCompleted) {
      return NextResponse.json({
        job_id: eduReq.id,
        status: task?.status || eduReq.status,
        message: "Tác vụ đang trong quá trình thực thi trên Node-01...",
        progress: 60,
      }, { status: 202 });
    }

    // Ghép các outputs hoàn chỉnh
    const structuredOutputs = (artifacts || []).map((art: any) => {
      const matchedOutput = (aiOutputs || []).find((o: any) => o.id === art.ai_output_id);
      return {
        type: art.artifact_type,
        output_id: art.id,
        ai_output_id: art.ai_output_id,
        format: art.mime_type,
        storage_ref: art.storage_ref,
        preview_ref: art.preview_ref,
        quality_status: art.quality_status,
        version: art.version,
        payload: matchedOutput?.metadata || task?.output?.artifacts?.[art.artifact_type] || null,
      };
    });

    return NextResponse.json({
      status: "COMPLETED",
      job_id: eduReq.id,
      task_id: eduReq.ai_task_id,
      lesson_title: eduReq.lesson_title,
      subject: eduReq.subject,
      standard: eduReq.standard,
      completed_at: task?.completed_at || eduReq.updated_at,
      outputs: structuredOutputs.length > 0 ? structuredOutputs : task?.output?.artifacts || [],
      full_output: task?.output || null,
    });

  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "Lỗi lấy kết quả job", message: error.message }, { status: 500 });
  }
}
