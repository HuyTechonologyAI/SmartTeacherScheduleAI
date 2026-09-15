import { NextRequest, NextResponse } from 'next/server';
import { deepParseLessonDocument } from '@/app/app/deepRagPedagogicalParser';

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

    // 1. Phân tách ngữ nghĩa tài liệu với Deep-RAG Sư Phạm v2.1
    const extracted = deepParseLessonDocument(rawDocumentText, lessonTitle, subject, grade);

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 2. Nếu có Gemini API Key, gọi trực tiếp mô hình Gemini AI với Strict Grounding
    if (geminiApiKey) {
      try {
        const documentContext = (extracted.rawContextSnippet || rawDocumentText).slice(0, 25000);

        const promptText = standard === 5512
          ? `
BẠN LÀ CHUYÊN GIA SƯ PHẠM CAO CẤP BỘ GIÁO DỤC & ĐÀO TẠO VIỆT NAM.
Hãy soạn Kế hoạch bài dạy (Giáo án) chuyên sâu theo chuẩn Công văn 5512/BGDĐT-GDTrH (Chương trình GDPT 2018).

=== TÀI LIỆU BÀI GIẢNG GIÁO VIÊN CUNG CẤP (BẮT BUỘC BÁM SÁT 100%) ===
${documentContext || 'Tài liệu môn ' + subject + ' bài ' + lessonTitle}
========================================================================

THÔNG TIN BÀI DẠY:
- Tên bài: ${lessonTitle}
- Môn học: ${subject}
- Lớp: ${grade}
- Thời lượng: ${durationMinutes} phút
${customRequirements ? `- Yêu cầu sư phạm bổ sung: ${customRequirements}` : ''}

CHỈ THỊ SƯ PHẠM NGHIÊM NGẶT (STRICT ANTI-HALLUCINATION & PEDAGOGICAL GROUNDING):
1. Tuyệt đối KHÔNG viết các câu chung chung vô nghĩa như "Học sinh đọc SGK", "GV giao bài tập", "GV đưa ra tình huống", "HS thảo luận nhóm".
2. BẮT BUỘC phải trích dẫn tên chính xác của các khái niệm, cấu tạo, định nghĩa, công thức toán/khoa học, thông số kỹ thuật và bài tập cụ thể lấy từ tài liệu trên vào nội dung từng hoạt động.
3. Hoạt động Khởi động: Nêu rõ câu hỏi tình huống dẫn nhập cụ thể liên quan trực tiếp đến nội dung chuyên môn bài học.
4. Hoạt động Hình thành kiến thức: Nêu rõ từng mục kiến thức cốt lõi, công thức, định nghĩa khoa học từ tài liệu.
5. Hoạt động Luyện tập: Soạn cụ thể ít nhất 2 câu hỏi/bài tập có đề bài, số liệu/tình huống và đáp án/hướng dẫn chi tiết.
6. Hoạt động Vận dụng: Nêu rõ bài toán hoặc tình huống thực tiễn cụ thể để học sinh giải quyết.

Trả về duy nhất định dạng JSON thuần túy (không bọc markdown \`\`\`json) theo cấu trúc:
{
  "objectives": {
    "knowledge": "Mục tiêu kiến thức chi tiết trích xuất từ bài...",
    "competencies": "Năng lực chung và đặc thù môn ${subject}...",
    "qualities": "Phẩm chất chăm chỉ, trung thực, trách nhiệm..."
  },
  "equipment": {
    "teacherEquipment": "Giáo án điện tử, thiết bị cụ thể...",
    "studentEquipment": "Sách giáo khoa, dụng cụ học tập..."
  },
  "activity1Opening": {
    "name": "Hoạt động 1: Mở đầu / Khởi động (Xác định vấn đề học tập)",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\\n2. Thực hiện: ...\\n3. Báo cáo: ...\\n4. Kết luận: ..."
  },
  "activity2Knowledge": {
    "name": "Hoạt động 2: Hình thành kiến thức mới (Chiếm lĩnh tri thức trọng tâm)",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\\n2. Thực hiện: ...\\n3. Báo cáo: ...\\n4. Kết luận: ..."
  },
  "activity3Practice": {
    "name": "Hoạt động 3: Luyện tập (Củng cố và rèn luyện kỹ năng)",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\\n2. Thực hiện: ...\\n3. Báo cáo: ...\\n4. Kết luận: ..."
  },
  "activity4Application": {
    "name": "Hoạt động 4: Vận dụng & Mở rộng (Gắn kết tri thức vào đời sống)",
    "objective": "...",
    "content": "...",
    "product": "...",
    "implementation": "1. Giao nhiệm vụ: ...\\n2. Thực hiện: ...\\n3. Đánh giá: ..."
  }
}
`.trim()
          : `
BẠN LÀ CHUYÊN GIA SƯ PHẠM DẠY NGHỀ VÀ THỰC HÀNH TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP VIỆT NAM.
Hãy soạn Kế hoạch bài dạy (Giáo án) thực hành chuyên sâu theo chuẩn Công văn 2634/GDNN.

=== TÀI LIỆU BÀI GIẢNG / GIÁO TRÌNH THỰC HÀNH (BẮT BUỘC BÁM SÁT 100%) ===
${documentContext || 'Tài liệu chuyên môn ' + subject + ' bài ' + lessonTitle}
========================================================================

THÔNG TIN BÀI DẠY:
- Tên module/bài học: ${lessonTitle}
- Nghề/Chuyên ngành: ${subject}
- Trình độ/Lớp: ${grade}
- Thời lượng: ${durationMinutes} phút
${customRequirements ? `- Yêu cầu sư phạm bổ sung: ${customRequirements}` : ''}

CHỈ THỊ SƯ PHẠM NGHỀ NGHIỆP NGHIÊM NGẶT:
1. Bám sát tuyệt đối quy trình công nghệ, thông số máy, trang bị BHLĐ, các bước thao tác mẫu và quy tắc 5S từ tài liệu.
2. Nêu rõ các lỗi hỏng thường gặp, nguyên nhân và cách khắc phục an toàn.

Trả về duy nhất định dạng JSON thuần túy (không bọc markdown \`\`\`json) theo cấu trúc:
{
  "objectives": {
    "knowledge": "Kiến thức về quy trình, cấu tạo, thông số...",
    "skills": "Kỹ năng thao tác, đo kiểm, đạt dung sai...",
    "autonomyAndSafety": "Ý thức tuân thủ ATLĐ, PCCN, 5S..."
  },
  "conditions": {
    "equipmentAndMachines": "Máy móc, đồ gá, dụng cụ đo...",
    "materialsAndWorkpieces": "Phôi mẫu, dầu bôi trơn, dao cắt...",
    "safetyAnd5S": "Trang bị BHLĐ, bình cứu hỏa..."
  },
  "step1Orientation": {
    "name": "Bước 1: Hướng dẫn ban đầu & Phổ biến ATLĐ",
    "teacherActivity": "...",
    "studentActivity": "...",
    "safetyAndKeyPoints": "..."
  },
  "step2Demonstration": {
    "name": "Bước 2: Hướng dẫn thường xuyên & Thao tác mẫu",
    "teacherActivity": "...",
    "studentActivity": "...",
    "safetyAndKeyPoints": "..."
  },
  "step3Practice": {
    "name": "Bước 3: Học sinh thực hành luyện tập tại xưởng",
    "teacherActivity": "...",
    "studentActivity": "...",
    "safetyAndKeyPoints": "..."
  },
  "step4Evaluation": {
    "name": "Bước 4: Hướng dẫn kết thúc, Đánh giá & Thu dọn 5S",
    "teacherActivity": "...",
    "studentActivity": "...",
    "safetyAndKeyPoints": "..."
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
