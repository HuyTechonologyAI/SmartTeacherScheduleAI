import { NextRequest, NextResponse } from 'next/server';
import { deepParseLessonDocument } from '@/app/app/deepRagPedagogicalParser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lessonTitle = 'Bài học chuyên đề',
      subject = 'Chung',
      grade = 'Phổ thông',
      standard = 5512,
      durationMinutes = 45,
      customRequirements = '',
      rawDocumentText = ''
    } = body;

    // 1. Phân tách ngữ nghĩa tài liệu với Deep-RAG Sư Phạm
    const extracted = deepParseLessonDocument(rawDocumentText, lessonTitle, subject, grade);

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 2. Nếu có Gemini API Key, gọi trực tiếp mô hình Gemini AI với Strict Grounding
    if (geminiApiKey) {
      try {
        const promptText = `
BẠN LÀ CHUYÊN GIA SƯ PHẠM CAO CẤP BỘ GIÁO DỤC & ĐÀO TẠO VIỆT NAM.
Hãy soạn Kế hoạch bài dạy (Giáo án) chuyên sâu theo chuẩn ${standard === 5512 ? 'Công văn 5512/BGDĐT-GDTrH (Phổ thông)' : 'Công văn 2634/GDNN (Dạy nghề/Thực hành)'}.

=== TÀI LIỆU BÀI GIẢNG GIÁO VIÊN CUNG CẤP (BẮT BUỘC BÁM SÁT 100%) ===
${extracted.rawContextSnippet || rawDocumentText.slice(0, 3500)}
========================================================================

THÔNG TIN BÀI DẠY:
- Tên bài: ${lessonTitle}
- Môn học: ${subject}
- Lớp: ${grade}
- Thời lượng: ${durationMinutes} phút
${customRequirements ? `- Yêu cầu sư phạm bổ sung: ${customRequirements}` : ''}

CHỈ THỊ SƯ PHẠM NGHIÊM NGẶT (STRICT ANTI-HALLUCINATION & LEGAL GROUNDING):
1. Tuyệt đối KHÔNG viết các câu chung chung như "Học sinh đọc SGK", "GV giao bài tập", "GV đưa ra tình huống", "HS thảo luận nhóm".
2. BẮT BUỘC phải trích dẫn tên chính xác của các khái niệm, định nghĩa, công thức toán/khoa học, quy trình thao tác và bài tập cụ thể lấy từ tài liệu trên vào nội dung từng hoạt động.
3. Hoạt động Khởi động: Nêu rõ câu hỏi tình huống dẫn nhập cụ thể liên quan trực tiếp đến bài.
4. Hoạt động Hình thành kiến thức: Nêu rõ từng mục kiến thức cốt lõi, công thức, định nghĩa khoa học từ tài liệu.
5. Hoạt động Luyện tập: Soạn cụ thể ít nhất 2 câu hỏi/bài tập có đề bài, số liệu và đáp án chi tiết.
6. Hoạt động Vận dụng: Nêu rõ bài toán hoặc tình huống thực tiễn cụ thể để học sinh giải quyết.

Trả về duy nhất định dạng JSON thuần túy (không bọc markdown \`\`\`json) theo cấu trúc sau:
{
  "objectives": {
    "knowledge": "Mục tiêu kiến thức chi tiết lấy từ bài...",
    "competencies": "Năng lực chung và đặc thù môn ${subject}...",
    "qualities": "Phẩm chất chăm chỉ, trung thực, trách nhiệm..."
  },
  "equipment": {
    "teacherEquipment": "Giáo án điện tử, thiết bị cụ thể...",
    "studentEquipment": "Sách giáo khoa, dụng cụ học tập..."
  },
  "activity1Opening": {
    "name": "Khởi động (Tạo tình huống có vấn đề)",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\n2. Thực hiện: ...\n3. Báo cáo: ...\n4. Kết luận: ..."
  },
  "activity2Knowledge": {
    "name": "Hình thành kiến thức mới",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\n2. Thực hiện: ...\n3. Báo cáo: ...\n4. Kết luận: ..."
  },
  "activity3Practice": {
    "name": "Luyện tập & Củng cố",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\n2. Thực hiện: ...\n3. Báo cáo: ...\n4. Kết luận: ..."
  },
  "activity4Application": {
    "name": "Vận dụng & Mở rộng",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\n2. Thực hiện: ...\n3. Đánh giá: ..."
  }
}
        `.trim();

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
              mode: 'GEMINI_CLOUD_AI',
              data: parsed,
              extractedKnowledge: extracted
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to Deep-RAG Synthesizer:', geminiErr);
      }
    }

    // 3. Fallback: Trả về dữ liệu đã bóc tách từ Deep-RAG Sư Phạm
    return NextResponse.json({
      success: true,
      mode: 'DEEP_RAG_SYNTHESIZER',
      extractedKnowledge: extracted
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
