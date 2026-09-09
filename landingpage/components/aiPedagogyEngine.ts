// ============================================================================
// SMART TEACHER SCHEDULE AI - PEDAGOGICAL AI BRAIN ENGINE
// Made by Huy Technology AI - SĐT: 0961364600
// Hỗ trợ toàn diện 7 năng lực sư phạm chuyên sâu cho Giáo viên Việt Nam
// ============================================================================

import {
  KnowledgeDocument,
  getResolvedKnowledgeDocuments,
  findMatchingKnowledgeDocument,
  BUILT_IN_KNOWLEDGE_DOCUMENTS
} from '../app/app/knowledgeBaseData';

export type AiPedagogyMode =
  | 'ALL'
  | 'KNOWLEDGE'      // 1. Tra cứu kho tư liệu chuẩn
  | 'EXAM_MATRIX'    // 2. Đề thi & Ma trận chuẩn TT 22
  | 'SLIDES'         // 3. Slide thuyết trình
  | 'MINI_GAME'      // 4. Mini game tương tác
  | 'MINDMAP'        // 5. Sơ đồ tư duy
  | 'ILLUSTRATION'   // 6. Hình ảnh minh hoạ & SVG
  | 'OFFICIAL_VN'    // 7. Nguồn chính thống Việt Nam
  | 'SCHEDULE';      // Lịch dạy & công việc

export interface AiPedagogyResponse {
  text: string;
  mode: AiPedagogyMode;
  quickActions?: { label: string; action: string; mode?: AiPedagogyMode }[];
  svgContent?: string;      // Đồ họa SVG minh họa trực quan
  mermaidCode?: string;     // Mã nguồn Mermaid cho sơ đồ tư duy
  wordExportableHtml?: string; // HTML định dạng chuẩn để xuất file Word .doc
  sourceReferences?: {
    title: string;
    code?: string;
    url?: string;
    snippet?: string;
  }[];
}

// ----------------------------------------------------------------------------
// 1. TRA CỨU KHO TƯ LIỆU CHUẨN (KNOWLEDGE BASE GROUNDING)
// ----------------------------------------------------------------------------
export function answerKnowledgeBaseQuery(
  userQuery: string,
  customDocs?: KnowledgeDocument[]
): AiPedagogyResponse {
  const docs = customDocs && customDocs.length > 0 ? customDocs : getResolvedKnowledgeDocuments();
  const query = userQuery.toLowerCase().trim();

  // 1.1 Công văn 5512/BGDĐT-GDTrH
  if (query.includes('5512') || query.includes('kế hoạch bài dạy') || query.includes('giáo án') || query.includes('4 hoạt động')) {
    const doc5512 = docs.find(d => d.code.includes('5512')) || BUILT_IN_KNOWLEDGE_DOCUMENTS[0];
    return {
      mode: 'KNOWLEDGE',
      text: `🏛️ **CÔNG VĂN SỐ 5512/BGDĐT-GDTrH - BỘ GIÁO DỤC VÀ ĐÀO TẠO**\n*(Quy định chuẩn hóa Kế hoạch bài dạy / Giáo án Chương trình GDPT 2018)*\n\n🎯 **I. KHUNG MỤC TIÊU BÀI DẠY (BẮT BUỘC 3 THÀNH TỐ):**\n1. **Kiến thức**: Xác định rõ đơn vị kiến thức cốt lõi, quy tắc, định luật hoặc kỹ năng học sinh cần lĩnh hội.\n2. **Năng lực**:\n   • *Năng lực chung*: Tự chủ & tự học; Giao tiếp & hợp tác; Giải quyết vấn đề & sáng tạo.\n   • *Năng lực đặc thù*: Gắn liền môn học (Khoa học tự nhiên, Công nghệ, Tin học, Ngôn ngữ, Toán học...).\n3. **Phẩm chất**: Bồi dưỡng 5 phẩm chất chủ yếu (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm).\n\n⚡ **II. TIẾN TRÌNH DẠY HỌC (BẮT BUỘC ĐỦ 4 HOẠT ĐỘNG):**\n1. **Hoạt động 1: Mở đầu / Khởi động (Xác định vấn đề)**: Kích hoạt tư duy, đặt tình huống mâu thuẫn nhận thức.\n2. **Hoạt động 2: Hình thành kiến thức mới**: Hướng dẫn học sinh khám phá tài liệu, phân tích quy luật, chuẩn hóa tri thức.\n3. **Hoạt động 3: Luyện tập**: Giải bài tập củng cố, câu hỏi trắc nghiệm, bài toán thao tác kỹ thuật.\n4. **Hoạt động 4: Vận dụng**: Liên hệ thực tiễn đời sống, dự án nhỏ, tình huống sản xuất.\n\n📌 **Lưu ý mỗi hoạt động phải tổ chức đủ 4 bước**: *Chuyển giao nhiệm vụ ➔ Học sinh thực hiện ➔ Báo cáo thảo luận ➔ Giáo viên kết luận, chuẩn hóa*.`,
      quickActions: [
        { label: '📝 Soạn giáo án mẫu theo CV 5512', action: 'soan_giao_an_5512', mode: 'KNOWLEDGE' },
        { label: '📊 Tạo slide cho bài giảng này', action: 'tao_slide_5512', mode: 'SLIDES' },
        { label: '🧠 Tạo sơ đồ tư duy bài học', action: 'tao_mindmap_5512', mode: 'MINDMAP' },
        { label: '📄 Xuất khung CV 5512 ra Word', action: 'xuat_word_5512', mode: 'KNOWLEDGE' }
      ],
      sourceReferences: [
        {
          title: doc5512.title,
          code: doc5512.code,
          url: 'https://moet.gov.vn',
          snippet: 'Khung kế hoạch bài dạy chuẩn 4 hoạt động và 3 thành tố mục tiêu theo CV 5512/BGDĐT-GDTrH'
        }
      ]
    };
  }

  // 1.2 Công văn 3456/BGDĐT-GDPT (Khung Năng Lực Số)
  if (query.includes('3456') || query.includes('năng lực số') || query.includes('kỹ năng số') || query.includes('chuyển đổi số')) {
    const doc3456 = docs.find(d => d.code.includes('3456')) || BUILT_IN_KNOWLEDGE_DOCUMENTS[1];
    return {
      mode: 'KNOWLEDGE',
      text: `🏛️ **CÔNG VĂN SỐ 3456/BGDĐT-GDPT - KHUNG NĂNG LỰC SỐ CHO NGƯỜI HỌC**\n*(Căn cứ Thông tư 02/2025/TT-BGDĐT của Bộ GD&ĐT)*\n\n🌐 **6 MIỀN NĂNG LỰC SỐ CỐT LÕI TÍCH HỢP VÀO TIẾT HỌC:**\n\n1. 🖥️ **Miền 1: Vận hành thiết bị và phần mềm**: Khởi động, kết nối an toàn máy tính, tivi thông minh, máy chiếu, cài đặt app học tập, xử lý sự cố thiết bị cơ bản.\n2. 🔍 **Miền 2: Khai thác thông tin và dữ liệu**: Xác định từ khóa tra cứu học liệu trên Internet, đánh giá nguồn tin chính thống, phân loại và lưu trữ tài liệu đám mây (Drive, OneDrive).\n3. 💬 **Miền 3: Giao tiếp và hợp tác trong môi trường số**: Tương tác lịch sự (Netiquette), trao đổi bài qua Zalo/LMS/Teams, làm việc nhóm trên bảng tính/tài liệu trực tuyến.\n4. 🎨 **Miền 4: Sáng tạo nội dung số**: Thiết kế slide bài giảng điện tử, video clip ngắn, infographic, sơ đồ tư duy số; tôn trọng bản quyền sở hữu trí tuệ.\n5. 🛡️ **Miền 5: An toàn trong môi trường số**: Đặt mật khẩu mạnh, bảo vệ dữ liệu cá nhân, phòng chống lừa đảo mạng (Phishing) và cân bằng thời gian sử dụng màn hình.\n6. 🧩 **Miền 6: Giải quyết vấn đề với công nghệ số**: Tư duy máy tính (Computational Thinking), ứng dụng phần mềm mô phỏng kỹ thuật, khai thác AI Sư phạm có trách nhiệm.\n\n💡 **Cách đưa vào giáo án**: Ghi rõ mã chỉ báo vào mục *Năng lực đặc thù* hoặc *Thiết bị & Học liệu* để minh chứng tiết dạy đạt chuẩn trường học số!`,
      quickActions: [
        { label: '🤖 Quyết định 2422 về Giáo dục AI?', action: 'xem_qd_2422', mode: 'KNOWLEDGE' },
        { label: '📝 Mẫu giáo án tích hợp Năng lực số', action: 'mau_giao_an_so', mode: 'KNOWLEDGE' },
        { label: '🎮 Tạo mini game phát triển kỹ năng số', action: 'game_so', mode: 'MINI_GAME' }
      ],
      sourceReferences: [
        {
          title: doc3456.title,
          code: doc3456.code,
          url: 'https://moet.gov.vn',
          snippet: 'Khung năng lực số 6 miền theo Công văn 3456/BGDĐT-GDPT và TT 02/2025/TT-BGDĐT'
        }
      ]
    };
  }

  // 1.3 Quyết định 2422/QĐ-BGDĐT (Ứng dụng AI Sư phạm)
  if (query.includes('2422') || query.includes('trí tuệ nhân tạo') || query.includes('gemini') || (query.includes('ai') && !query.includes('bài'))) {
    return {
      mode: 'KNOWLEDGE',
      text: `🏛️ **QUYẾT ĐỊNH SỐ 2422/QĐ-BGDĐT CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO**\n*(Định hướng ứng dụng Trí tuệ nhân tạo (AI) và Năng lực số trong Sư phạm)*\n\n🤖 **4 NGUYÊN TẮC VÀNG KHI ỨNG DỤNG AI DẠY HỌC:**\n1. **AI là Trợ lý hỗ trợ, Giáo viên là Trung tâm quyết định**: AI gợi ý ý tưởng, soạn khung giáo án, thiết kế câu hỏi; Thầy/Cô trực tiếp thẩm định, phê duyệt và điều chỉnh theo thực tế lớp học.\n2. **Liêm chính học thuật & Chống ảo tưởng (Anti-Hallucination)**: Mọi dữ liệu trích dẫn phải đối chiếu văn bản pháp quy (CV 5512, TT 22) hoặc giáo trình chính thống, không sử dụng tài liệu không rõ nguồn gốc.\n3. **Đạo đức AI & Bảo vệ dữ liệu cá nhân**: Không nhập thông tin đời tư nhạy cảm của học sinh lên các công cụ AI công cộng.\n4. **Phát triển Năng lực tư duy phản biện cho học sinh**: Hướng dẫn học sinh đặt câu hỏi cho AI, phân tích đúng/sai và tái cấu trúc thông tin thay vì sao chép thụ động.`,
      quickActions: [
        { label: '🔍 Xem Kho tư liệu chuẩn hiện có', action: 'xem_kho_tu_lieu', mode: 'KNOWLEDGE' },
        { label: '📝 Tạo đề thi ma trận chuẩn TT 22', action: 'tao_de_thi_tt22', mode: 'EXAM_MATRIX' }
      ]
    };
  }

  // 1.4 Công văn 2634/TCGDNN (Giáo án Nghề xưởng thực hành)
  if (query.includes('2634') || query.includes('dạy nghề') || query.includes('thực hành xưởng') || query.includes('xưởng')) {
    return {
      mode: 'KNOWLEDGE',
      text: `🏛️ **CÔNG VĂN SỐ 2634/TCGDNN - TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP**\n*(Quy chuẩn Kế hoạch bài giảng Đào tạo Nghề & Thực hành Sản xuất)*\n\n⚙️ **5 BƯỚC LÊN LỚP THỰC HÀNH CHUẨN XƯỞNG:**\n1. **Bước 1: Ổn định lớp & Điểm danh - Kiểm tra BHLĐ**: Kiểm tra quần áo bảo hộ, giày mũi sắt, kính mắt an toàn, tóc tai gọn gàng.\n2. **Bước 2: Dẫn nhập & Kiểm tra an toàn thiết bị**: Nhắc nhở quy tắc an toàn máy cắt, máy tiện, máy phay, nguồn điện.\n3. **Bước 3: Hướng dẫn ban đầu (Thao tác mẫu)**:\n   • Thầy/Cô thao tác mẫu ở tốc độ bình thường.\n   • Thao tác mẫu chậm kèm giải thích các điểm then chốt và lỗi sai thường gặp.\n   • Gọi 1-2 học sinh lên thao tác thử để uốn nắn.\n4. **Bước 4: Hướng dẫn thường xuyên (Học sinh luyện tập)**: Học sinh gia công phôi/thực hành, giáo viên đi lại quan sát, phát hiện sai sót, can thiệp kịp thời.\n5. **Bước 5: Hướng dẫn kết thúc (Đánh giá & 5S)**: Đo kiểm sản phẩm, chấm điểm theo barem, vệ sinh máy, thu dọn dụng cụ và thực hiện 5S xưởng.`,
      quickActions: [
        { label: '🛠️ Tiêu chuẩn ATLĐ & 5S xưởng?', action: 'xem_atld_5s', mode: 'KNOWLEDGE' },
        { label: '📝 Soạn bài giảng nghề theo CV 2634', action: 'soan_giao_an_2634', mode: 'KNOWLEDGE' }
      ]
    };
  }

  // 1.5 Tìm kiếm khớp tài liệu trong kho
  const match = findMatchingKnowledgeDocument('', '', userQuery);
  if (match.doc && match.confidence >= 15) {
    return {
      mode: 'KNOWLEDGE',
      text: `📚 **KHO TƯ LIỆU ĐỐI CHIẾU CHUẨN - TRÍCH XUẤT TỰ ĐỘNG**\n\n📌 **Tài liệu nguồn**: [${match.doc.code}] ${match.doc.title}\n🏷️ **Phân loại**: ${match.doc.category} | **Khối/Lớp**: ${match.doc.targetLevel}\n🎯 **Độ khớp tin cậy**: ${match.confidence}%\n\n📖 **Nội dung trích dẫn trọng tâm**:\n\`\`\`\n${match.relevantSnippet}\n\`\`\`\n\n💡 **Khuyến nghị áp dụng**: Thầy/Cô có thể sử dụng trực tiếp đoạn ngữ cảnh này để tạo Kế hoạch bài dạy, Slide bài giảng hoặc Đề kiểm tra ma trận chuẩn mực!`,
      quickActions: [
        { label: '📝 Tạo Đề thi & Ma trận từ tài liệu này', action: 'tao_de_thi_tu_kho', mode: 'EXAM_MATRIX' },
        { label: '📊 Tạo Slide từ tài liệu này', action: 'tao_slide_tu_kho', mode: 'SLIDES' },
        { label: '🧠 Tạo Sơ đồ tư duy', action: 'tao_mindmap_tu_kho', mode: 'MINDMAP' }
      ],
      sourceReferences: [
        {
          title: match.doc.title,
          code: match.doc.code,
          snippet: match.relevantSnippet.slice(0, 150) + '...'
        }
      ]
    };
  }

  // Fallback tổng quan kho
  return {
    mode: 'KNOWLEDGE',
    text: `📚 **KHO TƯ LIỆU PHÁP QUY & GIÁO TRÌNH ĐỐI CHIẾU CHUẨN**\n\nHiện tại hệ thống đang kích hoạt **${docs.filter(d => d.isActive).length} tài liệu đối chiếu chuẩn**:\n1. 📜 **CV 5512/BGDĐT-GDTrH**: Chuẩn hóa 4 hoạt động bài dạy và 3 thành tố mục tiêu.\n2. 💻 **CV 3456/BGDĐT-GDPT**: 6 miền năng lực số tích hợp vào giáo án.\n3. 🤖 **QĐ 2422/QĐ-BGDĐT**: Định hướng ứng dụng AI Sư phạm và bảo mật số.\n4. ⚙️ **CV 2634/TCGDNN**: Quy chuẩn bài giảng nghề xưởng thực hành 5 bước.\n5. 📝 **TT 22/2021/TT-BGDĐT**: Đánh giá học sinh, ma trận 4 mức độ.\n6. 🛡️ **TCVN ATLĐ & 5S**: Quy chuẩn an toàn sản xuất và 5S xưởng đào tạo.\n${docs.filter(d => !d.isBuiltIn).map(d => `• 📘 **${d.title}** (${d.fileName || 'Tài liệu giáo viên nạp'})`).join('\n')}\n\nThầy/Cô muốn em tra cứu chi tiết điều khoản nào ạ?`,
    quickActions: [
      { label: '📜 Tra cứu Công văn 5512', action: 'tra_cuu_5512', mode: 'KNOWLEDGE' },
      { label: '💻 Tra cứu Khung năng lực số 3456', action: 'tra_cuu_3456', mode: 'KNOWLEDGE' },
      { label: '📝 Hướng dẫn ma trận Thông tư 22', action: 'tra_cuu_tt22', mode: 'EXAM_MATRIX' }
    ]
  };
}

// ----------------------------------------------------------------------------
// 2. TẠO ĐỀ THI & MA TRẬN CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT
// ----------------------------------------------------------------------------
export function generateExamAndMatrixPackage(
  topicOrSubject: string = 'Công nghệ 10',
  grade: string = '10',
  questionCount: number = 10
): AiPedagogyResponse {
  const cleanTopic = topicOrSubject.replace(/đề thi|ma trận|tạo|cho tôi/gi, '').trim() || 'Công nghệ Cơ khí & Thiết kế Kỹ thuật';

  // 4 mức độ: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao
  const nbCount = Math.max(1, Math.round(questionCount * 0.4));
  const thCount = Math.max(1, Math.round(questionCount * 0.3));
  const vdCount = Math.max(1, Math.round(questionCount * 0.2));
  const vdcCount = Math.max(1, questionCount - nbCount - thCount - vdCount);

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Đề thi & Ma trận chuẩn TT 22 - ${cleanTopic}</title>
    <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.4;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #000;padding:6px;font-size:10pt;} th{background:#f0f0f0;text-align:center;}</style>
    </head>
    <body>
      <h3 style="text-align:center;">MA TRẬN ĐỀ KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ</h3>
      <p style="text-align:center;"><i>(Theo Thông tư số 22/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo)</i></p>
      <p><b>Môn:</b> ${cleanTopic} | <b>Khối lớp:</b> ${grade} | <b>Thời gian:</b> 45 phút</p>
      <table>
        <tr><th>TT</th><th>Mạch kiến thức / Chủ đề</th><th>Nhận biết (40%)</th><th>Thông hiểu (30%)</th><th>Vận dụng (20%)</th><th>Vận dụng cao (10%)</th><th>Tổng số câu</th><th>Điểm số</th></tr>
        <tr><td>1</td><td>Chủ đề trọng tâm: ${cleanTopic}</td><td>${nbCount} câu TN</td><td>${thCount} câu TN</td><td>${vdCount} câu TL</td><td>${vdcCount} câu TL</td><td>${questionCount} câu</td><td>10.0 đ</td></tr>
      </table>
      <h3 style="text-align:center;margin-top:20pt;">ĐỀ THI KIỂM TRA CHẤT LƯỢNG MÔN ${cleanTopic.toUpperCase()}</h3>
      <p><b>I. PHẦN TRẮC NGHIỆM KHÁCH QUAN (${(nbCount + thCount) * 0.5} điểm)</b></p>
      <p><b>Câu 1 (Nhận biết):</b> Trong quy trình kỹ thuật ${cleanTopic}, yếu tố nào là quan trọng nhất?<br/>A. Dụng cụ đo kiểm<br/>B. Bản vẽ kỹ thuật<br/>C. Vật liệu phôi<br/>D. Năng lượng máy</p>
      <p><b>II. PHẦN TỰ LUẬN (${10 - (nbCount + thCount) * 0.5} điểm)</b></p>
      <p><b>Câu ${nbCount + thCount + 1} (Vận dụng):</b> Hãy phân tích quy trình xử lý an toàn khi vận hành máy trong thực tế sản xuất.</p>
    </body>
    </html>
  `;

  return {
    mode: 'EXAM_MATRIX',
    text: `📋 **BẢNG MA TRẬN & ĐỀ THI ĐÁNH GIÁ CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT**\n\n📌 **Chủ đề**: ${cleanTopic} | **Khối**: Lớp ${grade} | **Thời gian**: 45 phút\n⚖️ **Tỉ lệ phân bổ 4 mức độ nhận thức**:\n• 🟢 **Nhận biết (40%)**: ${nbCount} câu (Tái hiện kiến thức cơ bản, định nghĩa, thông số)\n• 🔵 **Thông hiểu (30%)**: ${thCount} câu (Giải thích nguyên lý, so sánh, phân tích mối quan hệ)\n• 🟡 **Vận dụng (20%)**: ${vdCount} câu (Bài toán thực tế, chọn thông số công nghệ)\n• 🔴 **Vận dụng cao (10%)**: ${vdcCount} câu (Tối ưu hóa quy trình, xử lý sự cố phức tạp)\n\n═══════════════════════════════════════════════════════════\n📊 **BẢNG MA TRẬN ĐẶC TẢ ĐỀ THI**\n\n| Mạch kiến thức | Nhận biết (40%) | Thông hiểu (30%) | Vận dụng (20%) | Vận dụng cao (10%) | Tổng điểm |\n| :--- | :---: | :---: | :---: | :---: | :---: |\n| 1. Khái niệm & Nguyên lý cốt lõi | ${nbCount} câu | - | - | - | 4.0 đ |\n| 2. Quy trình kỹ thuật & Phân tích | - | ${thCount} câu | - | - | 3.0 đ |\n| 3. Xử lý tình huống thực tiễn | - | - | ${vdCount} câu | - | 2.0 đ |\n| 4. Sáng tạo & Tối ưu hóa hệ thống | - | - | - | ${vdcCount} câu | 1.0 đ |\n\n═══════════════════════════════════════════════════════════\n📝 **ĐỀ THI MINH HOẠ KÈM ĐÁP ÁN**\n\n**PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN (${(nbCount + thCount) * 0.5} điểm)**\n• **Câu 1 (NB)**: Ký hiệu tiêu chuẩn trên bản vẽ kỹ thuật thể hiện điều gì?\n  *A. Kích thước và dung sai chi tiết (Đáp án đúng)*\n  *B. Màu sắc của thiết bị*\n  *C. Giá thành sản phẩm*\n  *D. Trọng lượng đóng gói*\n• **Câu 2 (TH)**: Vì sao cần áp dụng quy tắc 5S trước khi tiến hành thực hành?\n  *A. Để tránh bụi bẩn thông thường*\n  *B. Nhằm đảm bảo an toàn lao động và tăng năng suất gia công (Đáp án đúng)*\n  *C. Theo yêu cầu chụp ảnh báo cáo*\n  *D. Giảm thời gian học lý thuyết*\n\n**PHẦN 2: TỰ LUẬN & VẬN DỤNG THỰC HÀNH (${10 - (nbCount + thCount) * 0.5} điểm)**\n• **Câu 3 (VD - 2.0 điểm)**: Nêu quy trình 4 bước khắc phục sự cố sai lệch kích thước phôi khi gia công.\n• **Câu 4 (VDC - 1.0 điểm)**: Đề xuất một giải pháp chuyển đổi số hoặc áp dụng cảm biến an toàn để tự động ngắt điện khi có nguy cơ tai nạn xưởng.`,
    quickActions: [
      { label: '📄 Xuất đề thi ra Word (.doc)', action: 'xuat_word_de_thi', mode: 'EXAM_MATRIX' },
      { label: '📋 Sao chép đề thi & ma trận', action: 'copy_de_thi', mode: 'EXAM_MATRIX' },
      { label: '📊 Tạo slide bài giảng củng cố', action: 'tao_slide_tu_de', mode: 'SLIDES' },
      { label: '🎮 Chuyển đề thành Mini game Kahoot', action: 'chuyen_kahoot', mode: 'MINI_GAME' }
    ],
    wordExportableHtml: wordHtml,
    sourceReferences: [
      {
        title: 'Thông tư 22/2021/TT-BGDĐT',
        code: 'TT 22/2021/TT-BGDĐT',
        url: 'https://thuvienphapluat.vn',
        snippet: 'Quy định về đánh giá học sinh THCS và THPT; xây dựng ma trận đặc tả đề kiểm tra 4 mức độ'
      }
    ]
  };
}

// ----------------------------------------------------------------------------
// 3. TẠO SLIDE THUYẾT TRÌNH BÀI GIẢNG (PRESENTATION SLIDES)
// ----------------------------------------------------------------------------
export function generateSlideDeckPackage(
  lessonTitle: string = 'Công nghệ gia công cắt gọt',
  grade: string = '10',
  subject: string = 'Công nghệ'
): AiPedagogyResponse {
  const cleanTitle = lessonTitle.replace(/slide|thuyết trình|tạo|bài giảng/gi, '').trim() || 'Gia công Cơ khí Hiện đại';

  return {
    mode: 'SLIDES',
    text: `📊 **BỘ SLIDE THUYẾT TRÌNH BÀI GIẢNG CHUẨN SƯ PHẠM (10 SLIDES)**\n\n🎯 **Chủ đề**: ${cleanTitle} | **Môn**: ${subject} | **Lớp**: ${grade}\n\n═══════════════════════════════════════════════════════════\n**SLIDE 1: BÌA BÀI GIẢNG**\n• **Tiêu đề**: BÀI DẠY: ${cleanTitle.toUpperCase()}\n• **Nội dung**: Môn học: ${subject} • Lớp: ${grade} • Ứng dụng CNTT & AI Sư phạm\n• **Gợi ý thị giác**: Ảnh vector công nghệ sắc nét, logo trường học số, tiêu đề nổi bật.\n• 🗣️ **Lời giảng viên (Speaker Notes)**: *"Nhiệt liệt chào mừng các em đến với tiết học hôm nay! Chúng ta sẽ cùng khám phá những công nghệ đột phá của ${cleanTitle}."*\n\n**SLIDE 2: MỤC TIÊU BÀI HỌC CẦN ĐẠT**\n• **Kiến thức**: Nắm vững khái niệm, nguyên lý vận hành và cấu tạo hệ thống.\n• **Năng lực số**: Khai thác mô hình 3D tương tác, tra cứu thông số kỹ thuật trực tuyến.\n• **Phẩm chất**: Kỷ luật an toàn, tỉ mỉ và tinh thần làm việc nhóm trách nhiệm.\n• **Gợi ý thị giác**: Sơ đồ 3 mảnh ghép tương hỗ: Kiến thức - Kỹ năng số - Phẩm chất.\n\n**SLIDE 3: KHỞI ĐỘNG (HOẠT ĐỘNG 1)**\n• **Tình huống dẫn nhập**: *"Quan sát chi tiết cơ khí bị lỗi bề mặt. Nguyên nhân do đâu?"*\n• **Câu hỏi gợi mở**: Tốc độ cắt hay chế độ tưới nguội đóng vai trò quyết định?\n• 🗣️ **Lời giảng viên**: *"Thầy/Cô dành cho các em 2 phút suy nghĩ và ghi dự đoán vào phiếu học tập số nhé!"*\n\n**SLIDE 4-5: HÌNH THÀNH KIẾN THỨC MỚI (PHẦN 1 & 2)**\n• Cấu tạo nguyên lý máy và các thông số công nghệ then chốt (vận tốc cắt, lượng chạy dao, chiều sâu cắt).\n• Bảng tra cứu chế độ làm việc tối ưu cho từng loại vật liệu (Nhôm, Thép, Đồng).\n• **Gợi ý thị giác**: Sơ đồ giải phẫu thiết bị có chú thích mũi tên chuyển động chính và chuyển động phụ.\n\n**SLIDE 6: NGUYÊN TẮC AN TOÀN LAO ĐỘNG & 5S**\n• 5 nguyên tắc an toàn tuyệt đối khi đứng máy.\n• Quy trình 5S: Sàng lọc - Sắp xếp - Sạch sẽ - Săn sóc - Sẵn sàng.\n\n**SLIDE 7-8: LUYỆN TẬP & THỰC HÀNH CỦNG CỐ**\n• Bài tập tình huống: Tính toán thông số gia công chi tiết theo bản vẽ kỹ thuật.\n• Thi đấu tương tác nhanh qua ứng dụng Mini game (4 câu hỏi trắc nghiệm).\n\n**SLIDE 9: VẬN DỤNG & DỰ ÁN THỰC TIỄN**\n• Dự án nhóm: Thiết kế quy trình chế tạo sản phẩm phục vụ đời sống gia đình.\n• Tiêu chí đánh giá: Tính chính xác (40%), Tính sáng tạo (30%), An toàn & thẩm mỹ (30%).\n\n**SLIDE 10: TỔNG KẾT & HƯỚNG DẪN VỀ NHÀ**\n• Sơ đồ tư duy tóm tắt 3 từ khóa cốt lõi của bài học.\n• Nhiệm vụ: Đọc trước bài tiếp theo trên nền tảng học tập số của lớp.`,
    quickActions: [
      { label: '📋 Sao chép Slide dạng Markdown', action: 'copy_slides_md', mode: 'SLIDES' },
      { label: '🎮 Tạo Mini game khởi động', action: 'tao_mini_game', mode: 'MINI_GAME' },
      { label: '🧠 Tạo Sơ đồ tư duy bài này', action: 'tao_mindmap', mode: 'MINDMAP' },
      { label: '🎨 Tạo hình ảnh minh họa cho slide', action: 'tao_hinh_anh', mode: 'ILLUSTRATION' }
    ]
  };
}

// ----------------------------------------------------------------------------
// 4. TẠO MINI GAME CHO TIẾT DẠY (INTERACTIVE LEARNING GAMES)
// ----------------------------------------------------------------------------
export function generateMiniGamePackage(
  topic: string = 'An toàn xưởng & Công nghệ tiện',
  grade: string = '10'
): AiPedagogyResponse {
  const clean = topic.replace(/mini game|game|trò chơi|tạo/gi, '').trim() || 'Công nghệ & An toàn xưởng';

  return {
    mode: 'MINI_GAME',
    text: `🎮 **BỘ CÂU HỎI MINI GAME TƯƠNG TÁC (KAHOOT / QUIZIZZ / RUNG CHUÔNG VÀNG)**\n\n🎯 **Chủ đề**: ${clean} | **Môn**: Công nghệ ${grade} | **Thời lượng**: 5 - 7 phút\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 1: [Khởi động nhanh - 15 giây]**\n❓ **Câu hỏi**: Trước khi bấm nút khởi động máy gia công, hành động nào sau đây BẮT BUỘC phải làm trước tiên?\n• A. Bật đèn chiếu sáng tối đa\n• B. Kiểm tra bảo hộ cá nhân (kính mắt, tóc tai, trang phục gọn gàng) *(ĐÁP ÁN ĐÚNG - 1000 điểm)*\n• C. Chụp ảnh lưu niệm gửi nhóm lớp\n• D. Gọi bạn bên cạnh sang xem\n💡 **Lời giải thích sư phạm**: An toàn là sinh mệnh! BHLĐ đầy đủ giúp bảo vệ mắt khỏi phoi tiện văng và ngăn ngừa kẹt trang phục vào trục quay.\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 2: [Tăng tốc tư duy - 20 giây]**\n❓ **Câu hỏi**: Trong phương pháp 5S xưởng thực hành, chữ "S" thứ hai (SEITON - SẮP XẾP) có ý nghĩa cốt lõi là gì?\n• A. Vứt hết đồ cũ ra bãi rác\n• B. Để dụng cụ ở vị trí dễ tìm, dễ thấy, dễ lấy, dễ trả lại *(ĐÁP ÁN ĐÚNG - 1200 điểm)*\n• C. Sơn lại tường xưởng thật đẹp\n• D. Đeo găng tay khi quét sàn\n💡 **Lời giải thích**: "Dễ tìm, dễ thấy, dễ lấy, dễ trả lại" giúp tiết kiệm 15-20% thời gian tìm đồ nghề và loại bỏ nguy cơ vấp ngã!\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 3: [Thử thách chuyên gia - 30 giây]**\n❓ **Câu hỏi**: Khi đang tiện chi tiết bằng máy tiện vạn năng, nếu phôi phát ra tiếng rít chói tai và phoi đổi sang màu xanh tím đậm, hiện tượng này báo hiệu điều gì?\n• A. Máy chạy rất êm, đạt tốc độ cao\n• B. Tốc độ cắt quá cao hoặc thiếu dung dịch trơn nguội làm dao bị mòn cháy *(ĐÁP ÁN ĐÚNG - 1500 điểm)*\n• C. Dao đang tự mài bén lại\n• D. Phôi đã hoàn thiện xong\n💡 **Lời giải thích**: Phoi màu xanh tím chứng tỏ nhiệt độ vùng cắt vượt quá 600°C! Phải giảm vận tốc cắt và cấp ngay dung dịch tưới nguội.\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 4: [Về đích ngoạn mục - 30 giây]**\n❓ **Câu hỏi**: Ứng dụng công nghệ nào giúp giáo viên giám sát từ xa sự an toàn của học sinh trong xưởng?\n• A. Camera thông minh tích hợp AI cảnh báo vùng nguy hiểm *(ĐÁP ÁN ĐÚNG - 2000 điểm)*\n• B. Loa phóng thanh công suất lớn\n• C. Chuông báo giờ thủ công\n• D. Kính lúp cầm tay\n💡 **Lời giải thích**: Camera AI nhận diện học sinh không đội mũ hoặc bước vào ranh giới nguy hiểm để cảnh báo tức thì!`,
    quickActions: [
      { label: '📋 Sao chép bảng câu hỏi Kahoot', action: 'copy_game_kahoot', mode: 'MINI_GAME' },
      { label: '🧠 Tạo Sơ đồ tư duy bài học', action: 'tao_mindmap_game', mode: 'MINDMAP' },
      { label: '📊 Tạo Slide bài giảng hoàn chỉnh', action: 'tao_slide_game', mode: 'SLIDES' }
    ]
  };
}

// ----------------------------------------------------------------------------
// 5. TẠO SƠ ĐỒ TƯ DUY CHO TIẾT DẠY (MINDMAP & VISUAL TREE)
// ----------------------------------------------------------------------------
export function generateMindmapPackage(
  topic: string = 'Hệ thống Công nghệ Gia công Cơ khí',
  grade: string = '10'
): AiPedagogyResponse {
  const clean = topic.replace(/sơ đồ tư duy|mindmap|sơ đồ|tạo/gi, '').trim() || 'Hệ Thống Cơ Khí Chế Tạo';

  const mermaid = `mindmap
  root(("${clean}"))
    Khái Niệm Cốt Lõi
      Định nghĩa quy trình
      Bản vẽ kỹ thuật
      Vật liệu phôi
    Các Phương Pháp Gia Công
      Cắt gọt truyền thống
        Tiện mặt trụ ngoài
        Phay mặt phẳng & rãnh
        Khoan khoét doa lỗ
      Gia công hiện đại CNC
        Máy tiện CNC
        Trung tâm phay 3-5 trục
        Cắt dây EDM & Laser
    Chế Độ Công Nghệ
      Vận tốc cắt Vc
      Lượng chạy dao S
      Chiều sâu cắt t
      Dung dịch tưới nguội
    An Toàn Lao Động & 5S
      Trang bị BHLĐ cá nhân
      Quy trình 5S xưởng
      Xử lý sự cố khẩn cấp
    Ứng Dụng Thực Tiễn
      Ngành ô tô & hàng không
      Thiết bị y tế chính xác
      Sản phẩm dân dụng`;

  return {
    mode: 'MINDMAP',
    text: `🧠 **SƠ ĐỒ TƯ DUY BÀI DẠY (MINDMAP & KNOWLEDGE TREE)**\n\n🎯 **Chủ đề**: ${clean} | **Khối lớp**: ${grade}\n\n═══════════════════════════════════════════════════════════\n🌳 **CÂY HỆ THỐNG KIẾN THỨC TRỰC QUAN (VISUAL TREE):**\n\n🌿 **[GỐC] ${clean.toUpperCase()}**\n├── 🔹 **1. Khái Niệm Cốt Lõi**\n│   ├── • Bản chất quy trình tạo hình chi tiết cơ khí\n│   ├── • Đọc hiểu bản vẽ thiết kế kỹ thuật (Kích thước, Dung sai)\n│   └── • Lựa chọn vật liệu phôi (Thép carbon, Nhôm hợp kim, Đồng thau)\n├── 🔹 **2. Phương Pháp Gia Công Hiện Đại**\n│   ├── • Cắt gọt truyền thống: Tiện trục tròn, Phay mặt phẳng, Bào rãnh, Khoan lỗ\n│   └── • Gia công kỹ thuật số: Máy CNC 3 trục, Cắt Plasma, Cắt Laser sợi quang\n├── 🔹 **3. Chế Độ Công Nghệ Tối Ưu**\n│   ├── • Vận tốc cắt (v - m/phút)\n│   ├── • Lượng chạy dao (s - mm/vòng)\n│   ├── • Chiều sâu cắt (t - mm)\n│   └── • Bôi trơn làm mát vùng cắt\n└── 🔹 **4. Tiêu Chuẩn ATLĐ & 5S Xưởng**\n    ├── • Kính bảo hộ, giày bảo hộ, không đeo găng khi đứng máy quay\n    └── • 5S: Sàng lọc ➔ Sắp xếp ➔ Sạch sẽ ➔ Săn sóc ➔ Sẵn sàng`,
    mermaidCode: mermaid,
    quickActions: [
      { label: '📋 Sao chép mã Mermaid Mindmap', action: 'copy_mermaid', mode: 'MINDMAP' },
      { label: '📊 Chuyển thành Slide thuyết trình', action: 'mindmap_to_slides', mode: 'SLIDES' },
      { label: '🎨 Tạo hình ảnh minh hoạ sơ đồ', action: 'mindmap_to_art', mode: 'ILLUSTRATION' },
      { label: '📝 Tạo đề thi kiểm tra phần này', action: 'mindmap_to_exam', mode: 'EXAM_MATRIX' }
    ]
  };
}

// ----------------------------------------------------------------------------
// 6. TẠO HÌNH ẢNH MINH HOẠ CHO TIẾT DẠY (PROMPT & SVG VECTOR)
// ----------------------------------------------------------------------------
export function generateIllustrationPackage(
  topic: string = 'Nguyên lý chuyển động máy tiện cơ khí',
  subject: string = 'Công nghệ'
): AiPedagogyResponse {
  const clean = topic.replace(/hình ảnh|minh họa|ảnh|tạo/gi, '').trim() || 'Cấu tạo & Nguyên lý máy gia công cơ khí';

  // Vector SVG illustration sắc nét, chuẩn responsive, hiển thị ngay trên chat
  const svg = `<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;border-radius:16px;background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0284c7 100%);box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.15);">
    <defs>
      <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8" />
        <stop offset="50%" stop-color="#cbd5e1" />
        <stop offset="100%" stop-color="#64748b" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#818cf8" />
      </linearGradient>
    </defs>
    <!-- Background grid -->
    <path d="M0 40 H600 M0 80 H600 M0 120 H600 M0 160 H600 M0 200 H600 M0 240 H600 M0 280 H600" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    <path d="M50 0 V320 M100 0 V320 M150 0 V320 M200 0 V320 M250 0 V320 M300 0 V320 M350 0 V320 M400 0 V320 M450 0 V320 M500 0 V320 M550 0 V320" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    
    <!-- Title banner -->
    <rect x="20" y="16" width="560" height="34" rx="10" fill="rgba(15,23,42,0.7)" stroke="#38bdf8" stroke-width="1"/>
    <text x="300" y="38" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">⚙️ SƠ ĐỒ NGUYÊN LÝ GIA CÔNG: ${clean.toUpperCase()}</text>

    <!-- Chuck (Mâm cặp) -->
    <rect x="60" y="110" width="70" height="120" rx="8" fill="url(#metalGrad)" stroke="#334155" stroke-width="2"/>
    <rect x="130" y="135" width="20" height="70" fill="#475569"/>
    <text x="95" y="175" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">MÂM CẶP</text>

    <!-- Workpiece (Phôi xoay tròn) -->
    <rect x="150" y="145" width="220" height="50" rx="4" fill="url(#accentGrad)" stroke="#0284c7" stroke-width="2"/>
    <!-- Turning rotation arrow -->
    <path d="M 230 130 A 25 25 0 0 1 270 130" fill="none" stroke="#f59e0b" stroke-width="3"/>
    <text x="250" y="120" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">Chuyển động chính (Vòng xoay Vc)</text>
    <text x="260" y="175" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">PHÔI GIA CÔNG</text>

    <!-- Tool (Dao tiện) -->
    <polygon points="310,215 340,185 365,225 330,245" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="330" y="225" width="80" height="40" rx="4" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
    <text x="370" y="250" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">ĐÀI DAO</text>
    <!-- Feed arrow -->
    <path d="M 330 200 L 260 200" fill="none" stroke="#ef4444" stroke-width="3"/>
    <polygon points="260,195 250,200 260,205" fill="#ef4444"/>
    <text x="300" y="215" fill="#f87171" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">Chạy dao (S)</text>

    <!-- Tailstock (Ụ động) -->
    <polygon points="430,135 400,170 430,205" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
    <rect x="430" y="125" width="80" height="90" rx="8" fill="url(#metalGrad)" stroke="#334155" stroke-width="2"/>
    <text x="470" y="175" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">Ụ ĐỘNG</text>

    <!-- Badges footer -->
    <rect x="40" y="275" width="520" height="30" rx="8" fill="rgba(0,0,0,0.4)"/>
    <text x="300" y="295" fill="#a5f3fc" font-size="11" text-anchor="middle" font-family="sans-serif">🔒 Chuẩn An Toàn: Luôn gá kẹp phôi chắc chắn & đóng nắp che chắn trước khi mở máy!</text>
  </svg>`;

  return {
    mode: 'ILLUSTRATION',
    text: `🎨 **THIẾT KẾ HÌNH ẢNH MINH HỌA BÀI HỌC & CÂU LỆNH PROMPT AI**\n\n🎯 **Chủ đề**: ${clean} | **Môn học**: ${subject}\n\n═══════════════════════════════════════════════════════════\n🖼️ **1. HÌNH MINH HỌA VECTOR SVG TRỰC QUAN (Hiển thị ngay tại đây):**\n*(Thầy/Cô có thể chiếu trực tiếp lên tivi/bảng tương tác cho học sinh quan sát nguyên lý)*\n\n═══════════════════════════════════════════════════════════\n🤖 **2. CÂU LỆNH PROMPT AI CAO CẤP (Dành cho Midjourney / DALL-E 3 / Gemini Imagen):**\n\n📝 **Prompt Tiếng Anh (Khuyến nghị dùng để đạt chất lượng ảnh 3D đẹp nhất):**\n\`\`\`text\nEducational 3D isometric cutaway diagram of ${clean}, precision CNC lathe machine mechanism, showing rotating steel workpiece in 3-jaw chuck, carbide cutting tool generating sharp metallic chips, blue cooling fluid spray, technical blueprint overlay, clean studio lighting, realistic industrial design, 8k resolution, educational textbook quality, infographic callouts --ar 16:9 --v 6.0\n\`\`\`\n\n📝 **Prompt Tiếng Việt (Dành cho Bing Image Creator / Canva AI):**\n\`\`\`text\nBản vẽ sơ đồ kỹ thuật 3D minh họa bài giảng môn ${subject}: ${clean}. Thể hiện rõ chi tiết máy, nguyên lý làm việc, có mũi tên chỉ hướng chuyển động, phong cách đồ họa công nghệ hiện đại, rõ nét cho bài giảng số.\n\`\`\``,
    svgContent: svg,
    quickActions: [
      { label: '📋 Sao chép Prompt Tiếng Anh', action: 'copy_prompt_en', mode: 'ILLUSTRATION' },
      { label: '📋 Sao chép Prompt Tiếng Việt', action: 'copy_prompt_vn', mode: 'ILLUSTRATION' },
      { label: '📊 Đưa hình ảnh này vào Slide', action: 'art_to_slide', mode: 'SLIDES' },
      { label: '🧠 Tạo Sơ đồ tư duy bài học', action: 'art_to_mindmap', mode: 'MINDMAP' }
    ]
  };
}

// ----------------------------------------------------------------------------
// 7. TÌM KIẾM THÔNG TIN TỪ CÁC NGUỒN CHÍNH THỐNG VIỆT NAM (OFFICIAL VN SOURCES)
// ----------------------------------------------------------------------------
export function searchOfficialVietnameseSources(
  userQuery: string
): AiPedagogyResponse {
  const query = userQuery.toLowerCase().trim();

  // 7.1 Quy định về định mức tiết dạy, chế độ giáo viên
  if (query.includes('định mức') || query.includes('tiết dạy') || query.includes('giờ dạy') || query.includes('phụ cấp') || query.includes('lương')) {
    return {
      mode: 'OFFICIAL_VN',
      text: `🇻🇳 **TRA CỨU VĂN BẢN PHÁP QUY CHÍNH THỐNG: ĐỊNH MỨC GIỜ DẠY & CHẾ ĐỘ NHÀ GIÁO**\n\n🏛️ **1. THÔNG TƯ SỐ 28/2009/TT-BGDĐT & THÔNG TƯ 15/2017/TT-BGDĐT (BỘ GD&ĐT):**\n• **Định mức tiết dạy phổ thông**:\n  - Giáo viên Tiểu học: 23 tiết/tuần.\n  - Giáo viên THCS: 19 tiết/tuần.\n  - Giáo viên THPT: 17 tiết/tuần.\n  - Giáo viên trường PTDT nội trú: Giảm 2 tiết/tuần so với định mức cùng cấp.\n• **Chế độ giảm trừ tiết dạy chuyên môn**:\n  - Giáo viên chủ nhiệm lớp THPT: Giảm 4 tiết/tuần; THCS & Tiểu học: Giảm 3-4 tiết/tuần.\n  - Tổ trưởng chuyên môn: Giảm 3 tiết/tuần; Tổ phó: Giảm 1 tiết/tuần.\n  - Phụ trách phòng bộ môn/thực hành: Giảm 3 tiết/tuần/môn.\n\n🏛️ **2. THÔNG TƯ SỐ 07/2017/TT-BLĐTBXH & THÔNG TƯ 08/2021/TT-BLĐTBXH (TỔNG CỤC GDNN):**\n• Định mức giờ giảng của nhà giáo dạy nghề: Từ 350 đến 400 giờ quy chuẩn/năm học (tùy trình độ đào tạo Cao đẳng hoặc Trung cấp).\n• Tỷ lệ tiết thực hành/lý thuyết được nhân hệ số quy đổi theo đặc thù xưởng máy.\n\n🔗 **CỔNG THÔNG TIN TRA CỨU CHÍNH THỐNG:**\n• Cổng TTĐT Bộ Giáo dục & Đào tạo: [moet.gov.vn](https://moet.gov.vn)\n• Tổng cục Giáo dục Nghề nghiệp: [gdnn.gov.vn](https://gdnn.gov.vn)\n• Cơ sở dữ liệu Thư viện Pháp luật: [thuvienphapluat.vn](https://thuvienphapluat.vn)`,
      quickActions: [
        { label: '🌐 Mở trang Thư viện Pháp luật', action: 'open_thuvienphapluat', mode: 'OFFICIAL_VN' },
        { label: '🌐 Mở Cổng thông tin Bộ GD&ĐT', action: 'open_moet', mode: 'OFFICIAL_VN' },
        { label: '📄 Xuất Sổ Báo Giảng & Bảng Kê Giờ Dạy', action: 'xuat_so_bao_giang', mode: 'SCHEDULE' }
      ],
      sourceReferences: [
        {
          title: 'Thông tư 28/2009/TT-BGDĐT & TT 15/2017/TT-BGDĐT',
          code: 'TT 28/2009/TT-BGDĐT',
          url: 'https://moet.gov.vn',
          snippet: 'Quy định về chế độ làm việc đối với giáo viên phổ thông'
        },
        {
          title: 'Thông tư 08/2021/TT-BLĐTBXH',
          code: 'TT 08/2021/TT-BLĐTBXH',
          url: 'https://gdnn.gov.vn',
          snippet: 'Quy định tiêu chuẩn, định mức giờ giảng của nhà giáo giáo dục nghề nghiệp'
        }
      ]
    };
  }

  // 7.2 Đánh giá học sinh (Thông tư 22/2021/TT-BGDĐT)
  if (query.includes('thông tư 22') || query.includes('đánh giá học sinh') || query.includes('xếp loại') || query.includes('điểm số')) {
    return {
      mode: 'OFFICIAL_VN',
      text: `🇻🇳 **TRA CỨU VĂN BẢN CHÍNH THỐNG: QUY ĐỊNH ĐÁNH GIÁ HỌC SINH THCS VÀ THPT**\n\n🏛️ **CĂN CỨ: THÔNG TƯ SỐ 22/2021/TT-BGDĐT NGÀY 20/07/2021 CỦA BỘ GD&ĐT**\n\n📊 **1. HÌNH THỨC ĐÁNH GIÁ:**\n• **Đánh giá thường xuyên (ĐGTX)**: Thực hiện qua hỏi - đáp, viết, thuyết trình, thực hành, thí nghiệm, sản phẩm học tập.\n• **Đánh giá định kỳ (ĐGĐK)**: Gồm kiểm tra giữa kỳ và kiểm tra cuối kỳ, xây dựng theo ma trận 4 mức độ nhận thức.\n\n📈 **2. MỨC ĐÁNH GIÁ KẾT QUẢ RÈN LUYỆN & HỌC TẬP:**\n• Gồm 4 mức: **Tốt, Khá, Đạt, Chưa đạt** (thay thế cho xếp loại Giỏi, Khá, TB, Yếu cũ).\n• Khen thưởng cuối năm: Danh hiệu *Học sinh Xuất sắc* và *Học sinh Giỏi*.\n\n🔗 **CỔNG TRA CỨU CHÍNH THỨC**: Văn bản toàn văn tại Thư viện Pháp luật: [thuvienphapluat.vn](https://thuvienphapluat.vn)`,
      quickActions: [
        { label: '📝 Tạo đề thi và ma trận chuẩn TT 22', action: 'tao_de_thi_tt22', mode: 'EXAM_MATRIX' },
        { label: '🌐 Mở liên kết Thông tư 22 chính thức', action: 'open_tt22', mode: 'OFFICIAL_VN' }
      ],
      sourceReferences: [
        {
          title: 'Thông tư 22/2021/TT-BGDĐT',
          code: 'TT 22/2021/TT-BGDĐT',
          url: 'https://thuvienphapluat.vn',
          snippet: 'Quy định về đánh giá học sinh trung học cơ sở và học sinh trung học phổ thông'
        }
      ]
    };
  }

  // 7.3 Tra cứu tổng quan nguồn chính thống
  return {
    mode: 'OFFICIAL_VN',
    text: `🇻🇳 **CỔNG TÌM KIẾM THÔNG TIN PHÁP QUY & CHÍNH THỐNG VIỆT NAM**\n\nSmart Teacher Schedule AI liên kết và đối chiếu trực tiếp dữ liệu từ 5 cơ quan chủ quản quốc gia:\n\n1. 🏛️ **Bộ Giáo dục và Đào tạo** ([moet.gov.vn](https://moet.gov.vn)):\n   - Thông tư 22/2021/TT-BGDĐT (Đánh giá học sinh)\n   - Công văn 5512/BGDĐT-GDTrH (Khung kế hoạch bài dạy 4 hoạt động)\n   - Công văn 3456/BGDĐT-GDPT (Khung năng lực số 6 miền)\n   - Quyết định 2422/QĐ-BGDĐT (Ứng dụng AI Sư phạm)\n\n2. ⚙️ **Tổng cục Giáo dục Nghề nghiệp** ([gdnn.gov.vn](https://gdnn.gov.vn)):\n   - Công văn 2634/TCGDNN (Bài giảng thực hành xưởng)\n   - Định mức giờ giảng và danh mục thiết bị đào tạo tối thiểu.\n\n3. 📜 **Cơ sở Dữ liệu Quốc gia Thư viện Pháp luật** ([thuvienphapluat.vn](https://thuvienphapluat.vn)):\n   - Tra cứu văn bản còn hiệu lực, văn bản sửa đổi bổ sung và án lệ sư phạm.\n\n4. 🏛️ **Cổng Thông tin Điện tử Chính phủ** ([chinhphu.vn](https://chinhphu.vn)):\n   - Nghị định về tiền lương, phụ cấp ưu đãi nhà giáo và chính sách thu hút nhân tài.\n\n5. 📰 **Báo Giáo dục và Thời đại** ([giaoducthoidai.vn](https://giaoducthoidai.vn)):\n   - Cơ quan ngôn luận của Bộ GD&ĐT về đổi mới phương pháp giảng dạy.\n\nThầy/Cô cần em tìm kiếm thông tư hoặc hướng dẫn nào cụ thể ạ?`,
    quickActions: [
      { label: '📜 Tra cứu CV 5512 (Bài dạy)', action: 'tra_cuu_5512', mode: 'KNOWLEDGE' },
      { label: '📊 Tra cứu TT 22 (Ma trận đề)', action: 'tra_cuu_tt22', mode: 'EXAM_MATRIX' },
      { label: '💻 Tra cứu CV 3456 (Năng lực số)', action: 'tra_cuu_3456', mode: 'KNOWLEDGE' },
      { label: '🌐 Mở cổng Bộ GD&ĐT (moet.gov.vn)', action: 'open_moet', mode: 'OFFICIAL_VN' }
    ]
  };
}

// ----------------------------------------------------------------------------
// HÀM ĐIỀU PHỐI TRUNG TÂM (MASTER DISPATCHER)
// ----------------------------------------------------------------------------
export function processPedagogicalAiQuery(
  userQuery: string,
  preferredMode: AiPedagogyMode = 'ALL',
  customDocs?: KnowledgeDocument[]
): AiPedagogyResponse {
  const query = userQuery.toLowerCase().trim();

  // 1. Nếu người dùng chỉ định mode hoặc từ khóa khớp rõ
  if (preferredMode === 'EXAM_MATRIX' || query.includes('ma trận') || query.includes('đề thi') || query.includes('đề kiểm tra') || query.includes('tt 22') || query.includes('thông tư 22')) {
    return generateExamAndMatrixPackage(userQuery);
  }

  if (preferredMode === 'SLIDES' || query.includes('slide') || query.includes('thuyết trình') || query.includes('powerpoint') || query.includes('canva')) {
    return generateSlideDeckPackage(userQuery);
  }

  if (preferredMode === 'MINI_GAME' || query.includes('mini game') || query.includes('kahoot') || query.includes('quizizz') || query.includes('trò chơi') || query.includes('đố vui')) {
    return generateMiniGamePackage(userQuery);
  }

  if (preferredMode === 'MINDMAP' || query.includes('sơ đồ tư duy') || query.includes('mindmap') || query.includes('sơ đồ cây')) {
    return generateMindmapPackage(userQuery);
  }

  if (preferredMode === 'ILLUSTRATION' || query.includes('hình ảnh') || query.includes('minh họa') || query.includes('vẽ') || query.includes('prompt')) {
    return generateIllustrationPackage(userQuery);
  }

  if (preferredMode === 'OFFICIAL_VN' || query.includes('chính thống') || query.includes('bộ gd') || query.includes('moet') || query.includes('chính phủ') || query.includes('thư viện pháp luật') || query.includes('định mức')) {
    return searchOfficialVietnameseSources(userQuery);
  }

  if (preferredMode === 'KNOWLEDGE' || query.includes('kho tư liệu') || query.includes('công văn') || query.includes('5512') || query.includes('3456') || query.includes('2422') || query.includes('2634') || query.includes('giáo trình') || query.includes('sgv')) {
    return answerKnowledgeBaseQuery(userQuery, customDocs);
  }

  // 2. Tra cứu kho tư liệu xem có tài liệu nào khớp cao không
  const kbMatch = findMatchingKnowledgeDocument('', '', userQuery);
  if (kbMatch.doc && kbMatch.confidence >= 25) {
    return answerKnowledgeBaseQuery(userQuery, customDocs);
  }

  // 3. Phân loại theo từ khóa nghiệp vụ mặc định
  if (query.includes('an toàn') || query.includes('5s') || query.includes('tiện') || query.includes('phay') || query.includes('cơ khí')) {
    return generateIllustrationPackage(userQuery);
  }

  // Mặc định: Trả lời qua Knowledge Base Grounding
  return answerKnowledgeBaseQuery(userQuery, customDocs);
}
