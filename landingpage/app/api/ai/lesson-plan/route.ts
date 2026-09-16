import { NextRequest, NextResponse } from 'next/server';
import { deepParseLessonDocument } from '@/app/app/deepRagPedagogicalParser';
import { buildPedagogicalSkillPrompt } from '@/lib/pedagogicalSkills';

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

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 2. Xây dựng chỉ thị Sư Phạm và Phong Cách Giảng Dạy bắt buộc
    const pedagogicalDirectives = buildPedagogicalSkillPrompt({
      selectedSkillId,
      teachingStyleId,
      customStyleNote
    });

    // 3. Nếu có Gemini API Key, gọi trực tiếp mô hình Gemini AI với Strict Grounding
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

${pedagogicalDirectives}

CHỈ THỊ SƯ PHẠM VÀ BỐ CỤC CHIA CỘT NGHIÊM NGẶT (CHUẨN BỘ GD&ĐT):
1. Tuyệt đối KHÔNG viết các câu chung chung vô nghĩa như "Học sinh đọc SGK", "GV giao bài tập", "GV đưa ra tình huống", "HS thảo luận nhóm".
2. BẮT BUỘC phải trích dẫn tên chính xác của các khái niệm, cấu tạo, định nghĩa, công thức toán/khoa học, thông số kỹ thuật và bài tập cụ thể lấy từ tài liệu trên.
3. BỐ CỤC BẢNG 2 CỘT CHO "TỔ CHỨC THỰC HIỆN":
   - Trường "implementation" (Cột trái): BẮT BUỘC chia thành 4 bước đánh dấu rõ ràng:
     * Bước 1: Chuyển giao nhiệm vụ: [GV phát vấn/giao nhiệm vụ cụ thể gì? HS tiếp nhận thế nào?]
     * Bước 2: Thực hiện nhiệm vụ: [HS nghiên cứu, tính toán, thảo luận thế nào? GV quan sát, gợi mở gì?]
     * Bước 3: Báo cáo, thảo luận: [HS/đại diện nhóm trình bày gì? Các HS khác nhận xét, phản biện ra sao?]
     * Bước 4: Kết luận, nhận định: [GV chuẩn hóa kiến thức gì? Rút ra kết luận khoa học nào?]
   - Trường "product" (Cột phải - Sản phẩm dự kiến / Nội dung cần đạt): Phải nêu chi tiết nội dung kiến thức cốt lõi, công thức, định nghĩa, cùng với lời giải/đáp số cụ thể của các câu hỏi/bài tập để giáo viên đối chiếu nghiệm thu.
4. Hoạt động Khởi động: Nêu rõ câu hỏi tình huống dẫn nhập cụ thể liên quan trực tiếp đến bài học.
5. Hoạt động Luyện tập: Soạn cụ thể ít nhất 2 câu hỏi/bài tập có đề bài, số liệu và đáp án chi tiết.
6. Hoạt động Vận dụng: Nêu rõ bài toán hoặc đề án thực tiễn cụ thể để học sinh giải quyết.

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
    "product": "Kiến thức trọng tâm cần đạt và sản phẩm dự đoán/câu trả lời của học sinh...",
    "implementation": "* Bước 1: Chuyển giao nhiệm vụ: GV...\\n* Bước 2: Thực hiện nhiệm vụ: HS...\\n* Bước 3: Báo cáo, thảo luận: HS...\\n* Bước 4: Kết luận, nhận định: GV..."
  },
  "activity2Knowledge": {
    "name": "Hoạt động 2: Hình thành kiến thức mới (Chiếm lĩnh tri thức trọng tâm)",
    "objective": "...",
    "content": "...",
    "product": "Các định nghĩa, công thức, quy luật khoa học cần ghi nhớ và phiếu học tập hoàn thành...",
    "implementation": "* Bước 1: Chuyển giao nhiệm vụ: GV...\\n* Bước 2: Thực hiện nhiệm vụ: HS...\\n* Bước 3: Báo cáo, thảo luận: HS...\\n* Bước 4: Kết luận, nhận định: GV..."
  },
  "activity3Practice": {
    "name": "Hoạt động 3: Luyện tập (Củng cố và rèn luyện kỹ năng)",
    "objective": "...",
    "content": "...",
    "product": "Hệ thống bài tập có đề bài và lời giải chi tiết, đáp số cụ thể...",
    "implementation": "* Bước 1: Chuyển giao nhiệm vụ: GV...\\n* Bước 2: Thực hiện nhiệm vụ: HS...\\n* Bước 3: Báo cáo, thảo luận: HS...\\n* Bước 4: Kết luận, nhận định: GV..."
  },
  "activity4Application": {
    "name": "Hoạt động 4: Vận dụng & Mở rộng (Gắn kết tri thức vào đời sống)",
    "objective": "...",
    "content": "...",
    "product": "Bản thiết kế giải pháp thực tiễn hoặc bài thu hoạch dự án ứng dụng...",
    "implementation": "* Bước 1: Chuyển giao nhiệm vụ: GV...\\n* Bước 2: Thực hiện nhiệm vụ: HS...\\n* Bước 3: Báo cáo, thảo luận: HS...\\n* Bước 4: Kết luận, nhận định: GV..."
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

${pedagogicalDirectives}

CHỈ THỊ SƯ PHẠM NGHỀ NGHIỆP NGHIÊM NGẶT (BẢNG 6 CỘT CHUẨN XƯỞNG CV 2634):
1. Bám sát tuyệt đối quy trình công nghệ, thông số máy, trang bị BHLĐ, các bước thao tác mẫu và quy tắc 5S từ tài liệu.
2. Thao tác mẫu của giáo viên (Bước 2): BẮT BUỘC ghi rõ quy trình làm mẫu 3 lần (Lần 1: Tốc độ bình thường để HS quan sát tổng thể; Lần 2: Thao tác chậm kèm giải thích các điểm dừng quan trọng; Lần 3: Gọi 1 HS thao tác thử dưới sự uốn nắn của GV).
3. Thực hành xưởng của học sinh (Bước 3): Ghi rõ quy cách phôi, dung sai kích thước bản vẽ, dụng cụ đo kiểm và điểm dừng an toàn.
4. Nghiệm thu & 5S (Bước 4): Nêu rõ tiêu chí chấm điểm sản phẩm và quy trình vệ sinh công nghiệp 5S xưởng.

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
    "safetyAnd5S": "Trang bị BHLĐ, bình cứu hỏa, tủ thuốc..."
  },
  "step1Orientation": {
    "name": "Bước 1: Hướng dẫn ban đầu & Phổ biến ATLĐ",
    "teacherActivity": "...",
    "studentActivity": "...",
    "safetyAndKeyPoints": "..."
  },
  "step2Demonstration": {
    "name": "Bước 2: Hướng dẫn thường xuyên & Thao tác mẫu",
    "teacherActivity": "Giáo viên thực hiện thao tác mẫu 3 lần: Lần 1 tốc độ bình thường; Lần 2 làm chậm phân tích điểm dừng kỹ thuật; Lần 3 kiểm tra nhận thức học sinh...",
    "studentActivity": "...",
    "safetyAndKeyPoints": "..."
  },
  "step3Practice": {
    "name": "Bước 3: Học sinh thực hành luyện tập tại xưởng",
    "teacherActivity": "Phân chia vị trí máy, tuần tra giám sát, uốn nắn sai sót kỹ thuật kịp thời...",
    "studentActivity": "...",
    "safetyAndKeyPoints": "..."
  },
  "step4Evaluation": {
    "name": "Bước 4: Hướng dẫn kết thúc, Đánh giá & Thu dọn 5S",
    "teacherActivity": "Nghiệm thu sản phẩm đối chiếu bản vẽ, nhận xét ưu khuyết điểm, hướng dẫn 5S...",
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
