import { NextRequest, NextResponse } from 'next/server';
import { deepParseLessonDocument } from '@/app/app/deepRagPedagogicalParser';
import { buildPedagogicalSkillPrompt } from '@/lib/pedagogicalSkills';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * FAÇADE COMPATIBILITY ENDPOINT — POST /api/ai/lesson-plan
 * Bridge old EduViet client calls into the Canonical Education AI Pipeline (HuyAI)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lessonTitle = body.lessonTitle || 'Bài học chuyên đề';
    const subject = body.subject || 'Chung';
    const grade = body.grade || body.className || 'Phổ thông';
    const standard = Number(body.standard) === 2634 ? 2634 : 5512;
    const durationMinutes = Number(body.durationMinutes) || (standard === 5512 ? 45 : 180);
    const customRequirements = body.customRequirements || '';
    const rawDocumentText = body.rawDocumentText || body.referenceContext || body.matchedDoc?.relevantSnippet || '';
    const selectedSkillId = body.selectedSkillId || (standard === 2634 ? 'SKILL_WORKSHOP' : 'SKILL_5E');
    const teachingStyleId = body.teachingStyleId || (standard === 2634 ? 'STYLE_INDUSTRIAL' : 'STYLE_INTERACTIVE');
    const customStyleNote = body.customStyleNote || '';

    // 1. Phân tách ngữ nghĩa tài liệu với Deep-RAG Sư Phạm v2.1
    const extracted = deepParseLessonDocument(rawDocumentText, lessonTitle, subject, grade);

    // 2. Tạo Canonical Task & Durable Queue trên Supabase HuyAI
    const requestId = crypto.randomUUID();
    const taskId = crypto.randomUUID();
    const conversationId = crypto.randomUUID();
    const eduRequestId = crypto.randomUUID();
    const idempotencyKey = `eduviet:legacy:${requestId}`;

    try {
      await supabaseAdmin.from('ai_tasks').insert({
        id: taskId,
        conversation_id: conversationId,
        organization_id: 'org-02-aischool',
        department_id: 'dept-02-teacher-copilot',
        source_app: 'eduviet',
        intent: 'EDU_LESSON_PLAN',
        priority: 1,
        status: 'QUEUED',
        idempotency_key: idempotencyKey,
        assigned_capability: 'education_generation',
        assigned_agent_id: null,
        depends_on: [],
        parallel_group: null,
        completion_condition: {},
        risk_level: 0,
        risk_context: {},
        approval_required: false,
        approval_status: 'NOT_REQUIRED',
        budget_config: {},
        estimated_cost_usd: 0,
        actual_cost_usd: 0,
        token_usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
        runtime_ms: 0,
        constraints: {},
        input_refs: [],
        expected_outputs: ['LESSON_PLAN'],
        input: {
          request_id: requestId,
          education_context: {
            lesson_title: lessonTitle,
            subject,
            grade_or_level: grade,
            standard: String(standard),
            duration_minutes: durationMinutes,
            custom_requirements: customRequirements,
          },
          source_refs: [{ type: 'INLINE_TEXT', snippet: rawDocumentText.slice(0, 25000) }],
        },
        data_classification: 'INTERNAL',
        cost_center_code: 'CC-02-AISCHOOL',
        requested_by_organization_id: 'org-02-aischool',
        state_version: 1,
        retry_count: 0,
        max_retries: 3,
        review_cycle: 0,
      });

      await supabaseAdmin.from('edu_generation_requests').insert({
        id: eduRequestId,
        ai_task_id: taskId,
        request_type: 'LESSON_PLAN',
        requested_outputs: ['LESSON_PLAN'],
        lesson_title: lessonTitle,
        subject,
        education_level: grade,
        standard: String(standard),
        duration_minutes: durationMinutes,
        source_app: 'eduviet',
        source_request_id: requestId,
        input_snapshot: body,
        status: 'QUEUED',
      });

      await supabaseAdmin.rpc('haip_enqueue_job', {
        p_task_id: taskId,
        p_message_type: 'EDU_GENERATION_REQUEST',
        p_envelope: {
          request_id: requestId,
          job_id: eduRequestId,
          request_type: 'LESSON_PLAN',
          requested_outputs: ['LESSON_PLAN'],
          education_context: { lesson_title: lessonTitle, subject, standard: String(standard) },
        },
      });
    } catch (bridgeErr) {
      console.warn('[EduViet Façade] Ghi nhận canonical task có cảnh báo (vẫn tiếp tục):', bridgeErr);
    }

    // 3. Nếu có Gemini API Key, tạo bản thảo nội dung đồng bộ tức thì cho giao diện client
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const pedagogicalDirectives = buildPedagogicalSkillPrompt({
      selectedSkillId,
      teachingStyleId,
      customStyleNote
    });

    if (geminiApiKey) {
      try {
        const documentContext = (extracted.rawContextSnippet || rawDocumentText).slice(0, 25000);
        const promptText = standard === 5512
          ? `BẠN LÀ CHUYÊN GIA SƯ PHẠM CAO CẤP BỘ GIÁO DỤC & ĐÀO TẠO VIỆT NAM.
Hãy soạn Kế hoạch bài dạy (Giáo án) chuyên sâu theo chuẩn Công văn 5512/BGDĐT-GDTrH.
TÀI LIỆU BÀI GIẢNG: ${documentContext || 'Tài liệu môn ' + subject + ' bài ' + lessonTitle}
TÊN BÀI: ${lessonTitle} | MÔN: ${subject} | LỚP: ${grade} | THỜI LƯỢNG: ${durationMinutes} phút
${customRequirements ? `- YÊU CẦU BỔ SUNG: ${customRequirements}` : ''}
${pedagogicalDirectives}

Trả về JSON thuần túy theo cấu trúc:
{
  "objectives": { "knowledge": "...", "competencies": "...", "qualities": "..." },
  "equipment": { "teacherEquipment": "...", "studentEquipment": "..." },
  "activity1Opening": { "name": "Hoạt động 1: Mở đầu / Khởi động", "objective": "...", "content": "...", "product": "...", "implementation": "..." },
  "activity2Knowledge": { "name": "Hoạt động 2: Hình thành kiến thức mới", "objective": "...", "content": "...", "product": "...", "implementation": "..." },
  "activity3Practice": { "name": "Hoạt động 3: Luyện tập", "objective": "...", "content": "...", "product": "...", "implementation": "..." },
  "activity4Application": { "name": "Hoạt động 4: Vận dụng & Mở rộng", "objective": "...", "content": "...", "product": "...", "implementation": "..." }
}`
          : `BẠN LÀ CHUYÊN GIA SƯ PHẠM DẠY NGHỀ VÀ THỰC HÀNH TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP VIỆT NAM.
Hãy soạn Kế hoạch bài dạy thực hành theo chuẩn Công văn 2634/GDNN.
TÀI LIỆU THỰC HÀNH: ${documentContext || 'Tài liệu chuyên môn ' + subject + ' bài ' + lessonTitle}
TÊN BÀI: ${lessonTitle} | NGHỀ: ${subject} | LỚP: ${grade} | THỜI LƯỢNG: ${durationMinutes} phút
${customRequirements ? `- YÊU CẦU BỔ SUNG: ${customRequirements}` : ''}
${pedagogicalDirectives}

Trả về JSON thuần túy theo cấu trúc:
{
  "objectives": { "knowledge": "...", "skills": "...", "autonomyAndSafety": "..." },
  "conditions": { "equipmentAndMachines": "...", "materialsAndWorkpieces": "...", "safetyAnd5S": "..." },
  "step1Orientation": { "name": "Bước 1: Hướng dẫn ban đầu & Phổ biến ATLĐ", "teacherActivity": "...", "studentActivity": "...", "safetyAndKeyPoints": "..." },
  "step2Demonstration": { "name": "Bước 2: Hướng dẫn thường xuyên & Thao tác mẫu", "teacherActivity": "...", "studentActivity": "...", "safetyAndKeyPoints": "..." },
  "step3Practice": { "name": "Bước 3: Học sinh thực hành luyện tập tại xưởng", "teacherActivity": "...", "studentActivity": "...", "safetyAndKeyPoints": "..." },
  "step4Evaluation": { "name": "Bước 4: Hướng dẫn kết thúc, Đánh giá & Thu dọn 5S", "teacherActivity": "...", "studentActivity": "...", "safetyAndKeyPoints": "..." }
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.2,
                topP: 0.8,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (geminiRes.ok) {
          const aiJson = await geminiRes.json();
          const candidateText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText);
            return NextResponse.json({
              success: true,
              mode: 'CANONICAL_HYBRID_AI',
              job_id: eduRequestId,
              task_id: taskId,
              status_url: `/api/ai/jobs/${eduRequestId}`,
              plan: parsed,
              data: parsed,
              extractedKnowledge: extracted
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to Deep-RAG Synthesizer:', geminiErr);
      }
    }

    // 4. Fallback: Trả về dữ liệu đã bóc tách từ Deep-RAG Sư Phạm + Metadata job
    return NextResponse.json({
      success: true,
      mode: 'CANONICAL_DEEP_RAG_SYNTHESIZER',
      job_id: eduRequestId,
      task_id: taskId,
      status_url: `/api/ai/jobs/${eduRequestId}`,
      extractedKnowledge: extracted
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
