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
// HỆ THỐNG PHÂN LOẠI MÔN HỌC & CHỦ ĐỀ SƯ PHẠM ĐỘNG (SUBJECT INTEL DETECTOR)
// ----------------------------------------------------------------------------
export interface DetectedSubjectInfo {
  subject: string;
  grade: string;
  topic: string;
  category: 'MATH' | 'LITERATURE' | 'ENGLISH' | 'NATURAL_SCIENCES' | 'SOCIAL_SCIENCES' | 'INFORMATICS' | 'TECHNOLOGY' | 'CIVIC' | 'GENERAL';
}

export function detectSubjectAndTopic(query: string, fallbackSubject: string = '', fallbackGrade: string = '10'): DetectedSubjectInfo {
  const lower = (query + ' ' + fallbackSubject).toLowerCase();

  const gradeMatch = lower.match(/\b(?:lớp|khối|grade)?\s*([1-9]|1[0-2])\b/);
  const grade = gradeMatch ? gradeMatch[1] : (fallbackGrade || '10');

  let cleanTopic = query
    .replace(/(?:tạo|hãy tạo|soạn|lập|làm|viết|cho tôi|giúp tôi|hướng dẫn|đề thi|ma trận|slide|thuyết trình|mini game|game|trò chơi|sơ đồ tư duy|mindmap|hình ảnh|minh họa|vẽ|tra cứu)\b/gi, '')
    .replace(/(?:môn|khối|lớp)?\s*(?:10|11|12|[1-9])\b/gi, '')
    .trim();

  if (lower.includes('toán') || lower.includes('đại số') || lower.includes('hình học') || lower.includes('giải tích') || lower.includes('xác suất') || lower.includes('thống kê') || lower.includes('hàm số') || lower.includes('vectơ') || lower.includes('phương trình')) {
    cleanTopic = cleanTopic.replace(/toán(?: học)?/gi, '').trim() || 'Hàm số & Phương trình';
    return { subject: 'Toán học', grade, topic: cleanTopic, category: 'MATH' };
  }

  if (lower.includes('văn') || lower.includes('ngữ văn') || lower.includes('tiếng việt') || lower.includes('thơ') || lower.includes('truyện') || lower.includes('nghị luận') || lower.includes('đọc hiểu') || lower.includes('tác phẩm')) {
    cleanTopic = cleanTopic.replace(/ngữ văn|văn/gi, '').trim() || 'Đọc hiểu văn bản & Nghị luận';
    return { subject: 'Ngữ văn', grade, topic: cleanTopic, category: 'LITERATURE' };
  }

  if (lower.includes('tiếng anh') || lower.includes('tieng anh') || lower.includes('english') || lower.includes('grammar') || lower.includes('vocabulary') || lower.includes('ngoại ngữ')) {
    cleanTopic = cleanTopic.replace(/tiếng anh|tieng anh|english|ngoại ngữ/gi, '').trim() || 'English Grammar & Vocabulary';
    return { subject: 'Tiếng Anh', grade, topic: cleanTopic, category: 'ENGLISH' };
  }

  if (lower.includes('vật lý') || lower.includes('vật lí') || lower.includes('physics') || lower.includes('động lực học') || lower.includes('điện từ') || lower.includes('quang học')) {
    cleanTopic = cleanTopic.replace(/vật lý|vật lí/gi, '').trim() || 'Chuyển động & Lực tương tác';
    return { subject: 'Vật lý', grade, topic: cleanTopic, category: 'NATURAL_SCIENCES' };
  }

  if (lower.includes('hóa học') || lower.includes('hoá học') || lower.includes('chemistry') || lower.includes('nguyên tử') || lower.includes('phản ứng') || lower.includes('axit') || lower.includes('bazơ')) {
    cleanTopic = cleanTopic.replace(/hóa học|hoá học/gi, '').trim() || 'Cấu tạo chất & Phản ứng hóa học';
    return { subject: 'Hóa học', grade, topic: cleanTopic, category: 'NATURAL_SCIENCES' };
  }

  if (lower.includes('sinh học') || lower.includes('biology') || lower.includes('tế bào') || lower.includes('di truyền') || lower.includes('quang hợp') || lower.includes('adn')) {
    cleanTopic = cleanTopic.replace(/sinh học/gi, '').trim() || 'Sinh học tế bào & Di truyền học';
    return { subject: 'Sinh học', grade, topic: cleanTopic, category: 'NATURAL_SCIENCES' };
  }

  if (lower.includes('khoa học tự nhiên') || lower.includes('khtn')) {
    cleanTopic = cleanTopic.replace(/khoa học tự nhiên|khtn/gi, '').trim() || 'Khoa học tự nhiên ứng dụng';
    return { subject: 'Khoa học tự nhiên', grade, topic: cleanTopic, category: 'NATURAL_SCIENCES' };
  }

  if (lower.includes('lịch sử') || lower.includes('history') || lower.includes('chiến tranh') || lower.includes('cách mạng') || lower.includes('kháng chiến')) {
    cleanTopic = cleanTopic.replace(/lịch sử/gi, '').trim() || 'Lịch sử Việt Nam và Thế giới';
    return { subject: 'Lịch sử', grade, topic: cleanTopic, category: 'SOCIAL_SCIENCES' };
  }

  if (lower.includes('địa lý') || lower.includes('địa lí') || lower.includes('geography') || lower.includes('khí hậu') || lower.includes('dân số') || lower.includes('kinh tế vùng')) {
    cleanTopic = cleanTopic.replace(/địa lý|địa lí/gi, '').trim() || 'Địa lý tự nhiên và Kinh tế - Xã hội';
    return { subject: 'Địa lý', grade, topic: cleanTopic, category: 'SOCIAL_SCIENCES' };
  }

  if (lower.includes('tin học') || lower.includes('lập trình') || lower.includes('python') || lower.includes('thuật toán') || lower.includes('cơ sở dữ liệu')) {
    cleanTopic = cleanTopic.replace(/tin học/gi, '').trim() || 'Thuật toán & Lập trình ứng dụng';
    return { subject: 'Tin học', grade, topic: cleanTopic, category: 'INFORMATICS' };
  }

  if (lower.includes('công dân') || lower.includes('gdcd') || lower.includes('kinh tế & pháp luật') || lower.includes('ktpl') || lower.includes('pháp luật')) {
    cleanTopic = cleanTopic.replace(/giáo dục công dân|gdcd|ktpl/gi, '').trim() || 'Pháp luật và Trách nhiệm công dân';
    return { subject: 'Giáo dục công dân', grade, topic: cleanTopic, category: 'CIVIC' };
  }

  if (lower.includes('công nghệ') || lower.includes('cơ khí') || lower.includes('tiện') || lower.includes('phay') || lower.includes('5s') || lower.includes('xưởng') || lower.includes('kỹ thuật')) {
    cleanTopic = cleanTopic.replace(/công nghệ/gi, '').trim() || 'Thiết kế kỹ thuật & Công nghệ';
    return { subject: 'Công nghệ', grade, topic: cleanTopic, category: 'TECHNOLOGY' };
  }

  const subj = fallbackSubject.trim() || 'Môn học phổ thông';
  cleanTopic = cleanTopic || 'Kiến thức bài học trọng tâm';
  return { subject: subj, grade, topic: cleanTopic, category: 'GENERAL' };
}

// ----------------------------------------------------------------------------
// 2. TẠO ĐỀ THI & MA TRẬN CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT (ĐA MÔN HỌC)
// ----------------------------------------------------------------------------
export function generateExamAndMatrixPackage(
  topicOrSubject: string = 'Công nghệ 10',
  grade: string = '10',
  questionCount: number = 10
): AiPedagogyResponse {
  const info = detectSubjectAndTopic(topicOrSubject, '', grade);
  const detectedSubj = info.subject;
  const detectedGrade = info.grade;
  const cleanTopic = info.topic;
  const category = info.category;

  const nbCount = Math.max(1, Math.round(questionCount * 0.4));
  const thCount = Math.max(1, Math.round(questionCount * 0.3));
  const vdCount = Math.max(1, Math.round(questionCount * 0.2));
  const vdcCount = Math.max(1, questionCount - nbCount - thCount - vdCount);

  let sampleQuestions = '';
  if (category === 'MATH') {
    sampleQuestions = `**PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN (${(nbCount + thCount) * 0.5} điểm)**
• **Câu 1 (NB)**: Cho hàm số y = f(x) xác định trên tập D. Điểm x0 ∈ D là điểm cực đại của hàm số khi nào?
  *A. f(x0) ≥ f(x) với mọi x thuộc một lân cận của x0 (Đáp án đúng)*
  *B. f'(x0) > 0*
  *C. f(x0) = 0*
  *D. f(x0) luôn là giá trị lớn nhất trên D*
• **Câu 2 (TH)**: Tập xác định của biểu thức chứa ẩn ở mẫu hoặc dưới dấu căn liên quan đến ${cleanTopic} được xác định bởi điều kiện nào?
  *A. Mẫu số khác 0 và biểu thức dưới căn bậc hai không âm (Đáp án đúng)*
  *B. Mẫu số lớn hơn 0*
  *C. Biểu thức luôn dương*
  *D. Không cần điều kiện*

**PHẦN 2: TỰ LUẬN & VẬN DỤNG (${10 - (nbCount + thCount) * 0.5} điểm)**
• **Câu 3 (VD - 2.0 điểm)**: Giải phương trình / tính giá trị biểu thức và biện luận tham số trong bài toán: ${cleanTopic}.
• **Câu 4 (VDC - 1.0 điểm)**: Một bài toán tối ưu hóa thực tiễn (tìm chi phí nhỏ nhất hoặc lợi nhuận lớn nhất) ứng dụng mô hình toán học vừa học.`;
  } else if (category === 'LITERATURE') {
    sampleQuestions = `**PHẦN 1: ĐỌC HIỂU VĂN BẢN (${(nbCount + thCount) * 0.5} điểm)**
• **Câu 1 (NB)**: Xác định thể thơ / phương thức biểu đạt chính được sử dụng trong ngữ liệu về chủ đề ${cleanTopic}.
  *A. Biểu cảm kết hợp tự sự (Đáp án đúng)*
  *B. Thuyết minh đơn thuần*
  *C. Hành chính công vụ*
  *D. Miêu tả trực diện*
• **Câu 2 (TH)**: Phân tích hiệu quả nghệ thuật của biện pháp tu từ trong việc thể hiện thông điệp tác phẩm.
  *A. Làm nổi bật chiều sâu tư tưởng và gợi cảm xúc thẩm mỹ cho người đọc (Đáp án đúng)*
  *B. Chỉ để tạo vần điệu cho câu thơ*
  *C. Tăng số lượng từ ngữ*
  *D. Giúp bài viết dài hơn*

**PHẦN 2: NGHỊ LUẬN (${10 - (nbCount + thCount) * 0.5} điểm)**
• **Câu 3 (VD - 2.0 điểm)**: Viết đoạn văn (khoảng 200 chữ) trình bày suy nghĩ của em về ý nghĩa bài học rút ra từ chủ đề: ${cleanTopic}.
• **Câu 4 (VDC - 1.0 điểm)**: Từ nội dung văn bản, hãy liên hệ với lối sống và trách nhiệm của thế hệ trẻ hôm nay.`;
  } else if (category === 'ENGLISH') {
    sampleQuestions = `**SECTION 1: MULTIPLE CHOICE (${(nbCount + thCount) * 0.5} pts)**
• **Question 1 (Recognition)**: Choose the word whose underlined part is pronounced differently regarding ${cleanTopic}:
  *A. achieve (Correct)*   *B. chemical*   *C. mechanic*   *D. character*
• **Question 2 (Comprehension)**: Choose the best answer to complete the sentence: "If students practice ${cleanTopic} regularly, they ______ significant progress."
  *A. will make (Correct)*   *B. would make*   *C. made*   *D. had made*

**SECTION 2: WRITING & APPLICATION (${10 - (nbCount + thCount) * 0.5} pts)**
• **Question 3 (Application - 2.0 pts)**: Rewrite sentences using inversion or conditional clauses based on ${cleanTopic}.
• **Question 4 (High Application - 1.0 pts)**: Write a short paragraph (120-150 words) giving opinions on the practical importance of ${cleanTopic} in modern society.`;
  } else if (category === 'NATURAL_SCIENCES') {
    sampleQuestions = `**PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN (${(nbCount + thCount) * 0.5} điểm)**
• **Câu 1 (NB)**: Phát biểu đúng về định luật / nguyên lý cơ bản của chủ đề ${cleanTopic} là:
  *A. Bảo toàn năng lượng và phù hợp quy luật tự nhiên đã thực nghiệm (Đáp án đúng)*
  *B. Năng lượng tự sinh ra và mất đi*
  *C. Không phụ thuộc vào điều kiện môi trường*
  *D. Luôn biến thiên không theo quy luật*
• **Câu 2 (TH)**: Giải thích hiện tượng thực tế khi thay đổi điều kiện thí nghiệm trong ${cleanTopic}.
  *A. Do sự tương tác trực tiếp của các yếu tố cấu thành làm thay đổi trạng thái cân bằng (Đáp án đúng)*
  *B. Do ngẫu nhiên*
  *C. Do tác dụng của trọng lực đơn thuần*
  *D. Hiện tượng không đổi*

**PHẦN 2: TỰ LUẬN & BÀI TẬP ĐỊNH LƯỢNG (${10 - (nbCount + thCount) * 0.5} điểm)**
• **Câu 3 (VD - 2.0 điểm)**: Vận dụng công thức để tính toán thông số định lượng trong bài toán ${cleanTopic}.
• **Câu 4 (VDC - 1.0 điểm)**: Thiết kế phương án thí nghiệm hoặc đề xuất giải pháp xử lý một vấn đề khoa học liên quan.`;
  } else if (category === 'SOCIAL_SCIENCES') {
    sampleQuestions = `**PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN (${(nbCount + thCount) * 0.5} điểm)**
• **Câu 1 (NB)**: Sự kiện / đặc điểm địa lý - lịch sử mang tính bước ngoặt của ${cleanTopic} diễn ra vào thời gian nào hoặc ở khu vực nào?
  *A. Cột mốc lịch sử / vị trí địa lý chuẩn xác theo sách giáo khoa (Đáp án đúng)*
  *B. Dữ liệu ngẫu nhiên*
  *C. Thế kỷ 15*
  *D. Không xác định được*
• **Câu 2 (TH)**: Ý nghĩa lịch sử hoặc vai trò kinh tế then chốt của ${cleanTopic} đối với sự phát triển là gì?
  *A. Mở ra bước ngoặt phát triển bền vững và khẳng định độc lập/thế mạnh vùng (Đáp án đúng)*
  *B. Chỉ mang tính chất tạm thời*
  *C. Không ảnh hưởng đến đời sống nhân dân*
  *D. Làm gián đoạn giao thương*

**PHẦN 2: TỰ LUẬN TỔNG HỢP (${10 - (nbCount + thCount) * 0.5} điểm)**
• **Câu 3 (VD - 2.0 điểm)**: Phân tích nguyên nhân thắng lợi / tiềm năng phát triển của ${cleanTopic}.
• **Câu 4 (VDC - 1.0 điểm)**: Bài học kinh nghiệm quý báu cho công cuộc xây dựng và phát triển đất nước hiện nay.`;
  } else if (category === 'INFORMATICS') {
    sampleQuestions = `**PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN (${(nbCount + thCount) * 0.5} điểm)**
• **Câu 1 (NB)**: Cú pháp chuẩn hoặc kiểu dữ liệu cơ bản trong lập trình liên quan đến ${cleanTopic} là:
  *A. Khai báo đúng quy tắc chuẩn ngữ nghĩa ngôn ngữ lập trình (Đáp án đúng)*
  *B. Cú pháp tuỳ biến không theo chuẩn*
  *C. Dùng từ khoá bất kỳ*
  *D. Không cần định kiểu dữ liệu*
• **Câu 2 (TH)**: Độ phức tạp thuật toán hoặc chức năng chính của cấu trúc dữ liệu trong ${cleanTopic} là gì?
  *A. Tối ưu hoá thời gian xử lý và tài nguyên bộ nhớ khi thực thi (Đáp án đúng)*
  *B. Tăng dung lượng lưu trữ tối đa*
  *C. Giảm tốc độ chạy chương trình*
  *D. Làm phức tạp mã nguồn*

**PHẦN 2: TỰ LUẬN & THỰC HÀNH MÃ NGUỒN (${10 - (nbCount + thCount) * 0.5} điểm)**
• **Câu 3 (VD - 2.0 điểm)**: Viết đoạn chương trình xử lý thuật toán sắp xếp, tìm kiếm hoặc thao tác dữ liệu: ${cleanTopic}.
• **Câu 4 (VDC - 1.0 điểm)**: Tối ưu thuật toán để chương trình chạy với thời gian tối ưu và xử lý ngoại lệ an toàn.`;
  } else {
    sampleQuestions = `**PHẦN 1: TRẮC NGHIỆM KHÁCH QUAN (${(nbCount + thCount) * 0.5} điểm)**
• **Câu 1 (NB)**: Khái niệm cốt lõi hoặc nguyên tắc cơ bản của chủ đề ${cleanTopic} được xác định như thế nào?
  *A. Tuân thủ tiêu chuẩn kỹ thuật và quy định hiện hành (Đáp án đúng)*
  *B. Thực hiện tuỳ ý cá nhân*
  *C. Bỏ qua các bước kiểm tra*
  *D. Chỉ áp dụng trong phòng thí nghiệm*
• **Câu 2 (TH)**: Tại sao cần thực hiện quy trình chuẩn hóa khi nghiên cứu hoặc thao tác ${cleanTopic}?
  *A. Đảm bảo an toàn, nâng cao chất lượng và tối ưu hóa hiệu quả thực thi (Đáp án đúng)*
  *B. Để đối phó kiểm tra*
  *C. Không đem lại lợi ích thiết thực*
  *D. Tăng chi phí vận hành*

**PHẦN 2: TỰ LUẬN & VẬN DỤNG THỰC TẾ (${10 - (nbCount + thCount) * 0.5} điểm)**
• **Câu 3 (VD - 2.0 điểm)**: Trình bày quy trình các bước xử lý một tình huống thực tiễn gắn với ${cleanTopic}.
• **Câu 4 (VDC - 1.0 điểm)**: Đề xuất giải pháp đổi mới sáng tạo hoặc ứng dụng công nghệ số để nâng cao hiệu quả.`;
  }

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Đề thi & Ma trận chuẩn TT 22 - ${detectedSubj} ${detectedGrade} - ${cleanTopic}</title>
    <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.4;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #000;padding:6px;font-size:10pt;} th{background:#f0f0f0;text-align:center;}</style>
    </head>
    <body>
      <h3 style="text-align:center;">MA TRẬN ĐỀ KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ</h3>
      <p style="text-align:center;"><i>(Theo Thông tư số 22/2021/TT-BGDĐT của Bộ Giáo dục và Đào tạo)</i></p>
      <p><b>Môn học:</b> ${detectedSubj} | <b>Khối lớp:</b> ${detectedGrade} | <b>Chủ đề:</b> ${cleanTopic} | <b>Thời gian:</b> 45 phút</p>
      <table>
        <tr><th>TT</th><th>Mạch kiến thức / Chủ đề</th><th>Nhận biết (40%)</th><th>Thông hiểu (30%)</th><th>Vận dụng (20%)</th><th>Vận dụng cao (10%)</th><th>Tổng số câu</th><th>Điểm số</th></tr>
        <tr><td>1</td><td>${cleanTopic}</td><td>${nbCount} câu TN</td><td>${thCount} câu TN</td><td>${vdCount} câu TL</td><td>${vdcCount} câu TL</td><td>${questionCount} câu</td><td>10.0 đ</td></tr>
      </table>
      <h3 style="text-align:center;margin-top:20pt;">ĐỀ KIỂM TRA ĐÁNH GIÁ MÔN ${detectedSubj.toUpperCase()} - LỚP ${detectedGrade}</h3>
      <p><b>Chủ đề:</b> ${cleanTopic}</p>
      <hr/>
      ${sampleQuestions.replace(/\n/g, '<br/>')}
    </body>
    </html>
  `;

  return {
    mode: 'EXAM_MATRIX',
    text: `📋 **BẢNG MA TRẬN & ĐỀ THI ĐÁNH GIÁ CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT**\n\n📌 **Môn học**: ${detectedSubj} | **Khối lớp**: Lớp ${detectedGrade} | **Thời gian**: 45 phút\n🎯 **Chủ đề**: ${cleanTopic}\n⚖️ **Tỉ lệ phân bổ 4 mức độ nhận thức**:\n• 🟢 **Nhận biết (40%)**: ${nbCount} câu (Tái hiện kiến thức cơ bản, định nghĩa, thông số)\n• 🔵 **Thông hiểu (30%)**: ${thCount} câu (Giải thích nguyên lý, so sánh, phân tích mối quan hệ)\n• 🟡 **Vận dụng (20%)**: ${vdCount} câu (Bài toán thực tế, áp dụng kiến thức)\n• 🔴 **Vận dụng cao (10%)**: ${vdcCount} câu (Tối ưu hóa, sáng tạo, liên hệ thực tiễn)\n\n═══════════════════════════════════════════════════════════\n📊 **BẢNG MA TRẬN ĐẶC TẢ ĐỀ THI**\n\n| Mạch kiến thức | Nhận biết (40%) | Thông hiểu (30%) | Vận dụng (20%) | Vận dụng cao (10%) | Tổng điểm |\n| :--- | :---: | :---: | :---: | :---: | :---: |\n| 1. Khái niệm & Nguyên lý cơ sở | ${nbCount} câu | - | - | - | 4.0 đ |\n| 2. Phân tích & Thông hiểu kiến thức | - | ${thCount} câu | - | - | 3.0 đ |\n| 3. Vận dụng giải quyết bài toán | - | - | ${vdCount} câu | - | 2.0 đ |\n| 4. Sáng tạo & Vận dụng thực tế | - | - | - | ${vdcCount} câu | 1.0 đ |\n\n═══════════════════════════════════════════════════════════\n📝 **ĐỀ THI MINH HOẠ KÈM ĐÁP ÁN**\n\n${sampleQuestions}`,
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
// 3. TẠO SLIDE THUYẾT TRÌNH BÀI GIẢNG (PRESENTATION SLIDES - ĐA MÔN HỌC)
// ----------------------------------------------------------------------------
export function generateSlideDeckPackage(
  lessonTitle: string = 'Bài học trọng tâm',
  grade: string = '10',
  subject: string = ''
): AiPedagogyResponse {
  const info = detectSubjectAndTopic(lessonTitle, subject, grade);
  const detectedSubj = info.subject;
  const detectedGrade = info.grade;
  const cleanTitle = info.topic;

  return {
    mode: 'SLIDES',
    text: `📊 **BỘ SLIDE THUYẾT TRÌNH BÀI GIẢNG CHUẨN SƯ PHẠM (10 SLIDES)**\n\n🎯 **Chủ đề**: ${cleanTitle} | **Môn**: ${detectedSubj} | **Lớp**: ${detectedGrade}\n\n═══════════════════════════════════════════════════════════\n**SLIDE 1: BÌA BÀI GIẢNG ĐIỆN TỬ**\n• **Tiêu đề**: BÀI DẠY: ${cleanTitle.toUpperCase()}\n• **Nội dung**: Môn học: ${detectedSubj} • Lớp: ${detectedGrade} • Ứng dụng CNTT & AI Sư phạm\n• **Gợi ý thị giác**: Ảnh đồ họa chuyên nghiệp biểu trưng môn ${detectedSubj}, tiêu đề nổi bật.\n• 🗣️ **Lời giảng viên (Speaker Notes)**: *"Nhiệt liệt chào mừng các em đến với tiết học hôm nay! Chúng ta sẽ cùng khám phá những tri thức cốt lõi của bài: ${cleanTitle}."*\n\n**SLIDE 2: MỤC TIÊU BÀI HỌC CẦN ĐẠT (CV 5512)**\n• **Kiến thức**: Nắm vững khái niệm, nguyên lý và phương pháp vận dụng của ${cleanTitle}.\n• **Năng lực số**: Khai thác tài nguyên số, tra cứu học liệu và tương tác trực tuyến.\n• **Phẩm chất**: Kỷ luật, chăm chỉ và tinh thần làm việc nhóm trách nhiệm.\n• **Gợi ý thị giác**: Sơ đồ 3 mảnh ghép tương hỗ: Kiến thức - Năng lực số - Phẩm chất.\n\n**SLIDE 3: KHỞI ĐỘNG (HOẠT ĐỘNG 1)**\n• **Tình huống dẫn nhập**: *"Quan sát hiện tượng / bài toán thực tế liên quan đến ${cleanTitle}."*\n• **Câu hỏi gợi mở**: Nguyên nhân dẫn đến hiện tượng này là gì? Chúng ta giải quyết như thế nào?\n• 🗣️ **Lời giảng viên**: *"Thầy/Cô dành cho các em 2 phút suy nghĩ và ghi dự đoán vào phiếu học tập nhé!"*\n\n**SLIDE 4-5: HÌNH THÀNH KIẾN THỨC MỚI (PHẦN 1 & 2)**\n• Nội dung trọng tâm 1: Khái niệm bản chất, định lý hoặc quy tắc cơ bản của ${cleanTitle}.\n• Nội dung trọng tâm 2: Phân tích ví dụ điển hình và sơ đồ cấu trúc kiến thức.\n• **Gợi ý thị giác**: Sơ đồ cấu trúc trực quan có chú thích rõ ràng các thành phần.\n\n**SLIDE 6: NĂNG LỰC SỐ & KẾT NỐI ĐỜI SỐNG (CV 3456)**\n• Ứng dụng thực tiễn của ${cleanTitle} trong đời sống xã hội.\n• Khai thác phần mềm mô phỏng hoặc nền tảng số để tìm hiểu sâu hơn.\n\n**SLIDE 7-8: LUYỆN TẬP & THỰC HÀNH CỦNG CỐ**\n• Hệ thống 4 câu hỏi trắc nghiệm tương tác nhanh kiểm tra mức độ tiếp thu.\n• Bài tập tình huống vận dụng: Thảo luận nhóm trong 5 phút.\n\n**SLIDE 9: VẬN DỤNG & DỰ ÁN HỌC TẬP**\n• Dự án nhóm: Ứng dụng kiến thức bài học giải quyết một tình huống thực tế.\n• Tiêu chí đánh giá: Tính chính xác (40%), Tính sáng tạo (30%), Tinh thần hợp tác (30%).\n\n**SLIDE 10: TỔNG KẾT & HƯỚNG DẪN VỀ NHÀ**\n• Sơ đồ tư duy tóm tắt 3 từ khóa cốt lõi của bài học.\n• Nhiệm vụ: Hoàn thành bài tập củng cố và xem trước bài tiếp theo.`,
    quickActions: [
      { label: '📋 Sao chép Slide dạng Markdown', action: 'copy_slides_md', mode: 'SLIDES' },
      { label: '🎮 Tạo Mini game khởi động', action: 'tao_mini_game', mode: 'MINI_GAME' },
      { label: '🧠 Tạo Sơ đồ tư duy bài này', action: 'tao_mindmap', mode: 'MINDMAP' },
      { label: '🎨 Tạo hình ảnh minh họa cho slide', action: 'tao_hinh_anh', mode: 'ILLUSTRATION' }
    ]
  };
}

// ----------------------------------------------------------------------------
// 4. TẠO MINI GAME CHO TIẾT DẠY (INTERACTIVE LEARNING GAMES - ĐA MÔN HỌC)
// ----------------------------------------------------------------------------
export function generateMiniGamePackage(
  topic: string = 'Kiến thức trọng tâm',
  grade: string = '10'
): AiPedagogyResponse {
  const info = detectSubjectAndTopic(topic, '', grade);
  const detectedSubj = info.subject;
  const detectedGrade = info.grade;
  const clean = info.topic;

  return {
    mode: 'MINI_GAME',
    text: `🎮 **BỘ CÂU HỎI MINI GAME TƯƠNG TÁC (KAHOOT / QUIZIZZ / RUNG CHUÔNG VÀNG)**\n\n🎯 **Chủ đề**: ${clean} | **Môn**: ${detectedSubj} ${detectedGrade} | **Thời lượng**: 5 - 7 phút\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 1: [Khởi động nhanh - 15 giây]**\n❓ **Câu hỏi**: Khái niệm cơ bản hoặc dấu hiệu nhận biết nào sau đây là ĐÚNG khi nói về ${clean}?\n• A. Khái niệm chuẩn xác theo chương trình môn ${detectedSubj} *(ĐÁP ÁN ĐÚNG - 1000 điểm)*\n• B. Khái niệm sai lệch đối lập\n• C. Phương án nhiễu dễ gây nhầm lẫn 1\n• D. Phương án nhiễu dễ gây nhầm lẫn 2\n💡 **Lời giải thích sư phạm**: Nắm vững khái niệm nền tảng giúp học sinh giải quyết tự tin các câu hỏi nâng cao!\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 2: [Tăng tốc tư duy - 20 giây]**\n❓ **Câu hỏi**: Trong các đặc điểm của ${clean}, yếu tố nào đóng vai trò QUYẾT ĐỊNH nhất?\n• A. Yếu tố ngẫu nhiên\n• B. Bản chất quy luật quyết định tính chất cốt lõi *(ĐÁP ÁN ĐÚNG - 1200 điểm)*\n• C. Yếu tố hình thức bên ngoài\n• D. Tùy ý cá nhân\n💡 **Lời giải thích**: Hiểu rõ bản chất giúp học sinh tránh được 80% bẫy câu hỏi thông hiểu!\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 3: [Thử thách chuyên gia - 30 giây]**\n❓ **Câu hỏi**: Khi áp dụng kiến thức ${clean} vào thực tế có điều kiện thay đổi, hiện tượng/kết quả sẽ như thế nào?\n• A. Không thay đổi bất chấp điều kiện\n• B. Biến đổi phù hợp với quy luật khoa học đã học *(ĐÁP ÁN ĐÚNG - 1500 điểm)*\n• C. Mất hoàn toàn tác dụng\n• D. Không thể dự đoán\n💡 **Lời giải thích**: Vận dụng quy luật vào thực tiễn đòi hỏi tư duy phân tích và khả năng thích ứng linh hoạt.\n\n═══════════════════════════════════════════════════════════\n🏆 **CÂU 4: [Về đích ngoạn mục - 30 giây]**\n❓ **Câu hỏi**: Để phát triển năng lực tự học môn ${detectedSubj} với chủ đề ${clean}, học sinh nên áp dụng phương pháp nào?\n• A. Ứng dụng sơ đồ tư duy, thảo luận nhóm và học liệu số có hướng dẫn *(ĐÁP ÁN ĐÚNG - 2000 điểm)*\n• B. Học thuộc máy móc thụ động\n• C. Chỉ học trước ngày thi\n• D. Bỏ qua các bài tập thực hành\n💡 **Lời giải thích**: Học tập chủ động và sáng tạo là kim chỉ nam của Chương trình GDPT 2018!`,
    quickActions: [
      { label: '📋 Sao chép bảng câu hỏi Kahoot', action: 'copy_game_kahoot', mode: 'MINI_GAME' },
      { label: '🧠 Tạo Sơ đồ tư duy bài học', action: 'tao_mindmap_game', mode: 'MINDMAP' },
      { label: '📊 Tạo Slide bài giảng hoàn chỉnh', action: 'tao_slide_game', mode: 'SLIDES' }
    ]
  };
}

// ----------------------------------------------------------------------------
// 5. TẠO SƠ ĐỒ TƯ DUY CHO TIẾT DẠY (MINDMAP & VISUAL TREE - ĐA MÔN HỌC)
// ----------------------------------------------------------------------------
export function generateMindmapPackage(
  topic: string = 'Kiến thức bài học',
  grade: string = '10'
): AiPedagogyResponse {
  const info = detectSubjectAndTopic(topic, '', grade);
  const detectedSubj = info.subject;
  const detectedGrade = info.grade;
  const clean = info.topic;
  const safeRoot = clean.replace(/["()]/g, '');

  const mermaid = `mindmap
  root(("${safeRoot}"))
    1. Khái Niệm Nền Tảng
      Định nghĩa cốt lõi
      Đặc điểm bản chất
      Ký hiệu chuẩn
    2. Quy Luật & Cấu Trúc
      Nguyên lý hoạt động
      Mối quan hệ tương hỗ
      Phân loại thành phần
    3. Phương Pháp Vận Dụng
      Quy trình các bước giải
      Các dạng bài tập điển hình
      Lỗi sai thường gặp
    4. Ứng Dụng Thực Tiễn
      Liên hệ đời sống
      Tích hợp liên môn
      Định hướng chuyển đổi số`;

  return {
    mode: 'MINDMAP',
    text: `🧠 **SƠ ĐỒ TƯ DUY BÀI DẠY (MINDMAP & KNOWLEDGE TREE)**\n\n🎯 **Chủ đề**: ${clean} | **Môn**: ${detectedSubj} | **Khối lớp**: ${detectedGrade}\n\n═══════════════════════════════════════════════════════════\n🌳 **CÂY HỆ THỐNG KIẾN THỨC TRỰC QUAN (VISUAL TREE):**\n\n🌿 **[GỐC] ${clean.toUpperCase()} (${detectedSubj.toUpperCase()} ${detectedGrade})**\n├── 🔹 **1. Khái Niệm Nền Tảng**\n│   ├── • Bản chất quy luật và định nghĩa cốt lõi\n│   ├── • Ký hiệu, đơn vị đo hoặc quy ước chuẩn\n│   └── • Bối cảnh xuất hiện và ý nghĩa\n├── 🔹 **2. Quy Luật & Cấu Trúc Trọng Tâm**\n│   ├── • Mối liên hệ bản chất giữa các thành phần\n│   └── • Các trường hợp đặc biệt và điều kiện áp dụng\n├── 🔹 **3. Kỹ Năng & Phương Pháp Giải Quyết Vấn Đề**\n│   ├── • Quy trình thao tác 4 bước chuẩn mực\n│   └── • Nhận diện các lỗi sai kinh điển cần tránh\n└── 🔹 **4. Ứng Dụng Thực Tiễn & Năng Lực Số**\n    ├── • Kết nối các tình huống sinh động trong đời sống\n    └── • Khai thác công cụ số và sơ đồ tư duy củng cố`,
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
// 6. TẠO HÌNH ẢNH MINH HOẠ CHO TIẾT DẠY (PROMPT & SVG VECTOR ĐA MÔN HỌC)
// ----------------------------------------------------------------------------
export function generateIllustrationPackage(
  topic: string = 'Kiến thức minh họa',
  subject: string = ''
): AiPedagogyResponse {
  const info = detectSubjectAndTopic(topic, subject);
  const detectedSubj = info.subject;
  const detectedGrade = info.grade;
  const clean = info.topic;

  const svg = `<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;border-radius:16px;background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0369a1 100%);box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.15);">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#818cf8" />
      </linearGradient>
    </defs>
    <path d="M0 40 H600 M0 80 H600 M0 120 H600 M0 160 H600 M0 200 H600 M0 240 H600 M0 280 H600" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    <path d="M60 0 V320 M120 0 V320 M180 0 V320 M240 0 V320 M300 0 V320 M360 0 V320 M420 0 V320 M480 0 V320 M540 0 V320" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    
    <rect x="20" y="16" width="560" height="36" rx="10" fill="rgba(15,23,42,0.8)" stroke="#38bdf8" stroke-width="1.2"/>
    <text x="300" y="40" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">📚 HỌC LIỆU SỐ TRỰC QUAN: ${detectedSubj.toUpperCase()} ${detectedGrade} - ${clean.toUpperCase()}</text>

    <rect x="180" y="80" width="240" height="150" rx="16" fill="rgba(30,41,59,0.9)" stroke="url(#cardGrad)" stroke-width="2"/>
    <circle cx="300" cy="130" r="32" fill="#0284c7" opacity="0.8"/>
    <text x="300" y="137" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle" font-family="sans-serif">💡</text>
    <text x="300" y="185" fill="#f8fafc" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">${clean.length > 25 ? clean.substring(0, 25) + '...' : clean}</text>
    <text x="300" y="208" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="sans-serif">Môn: ${detectedSubj} - Lớp ${detectedGrade}</text>

    <rect x="35" y="110" width="115" height="40" rx="8" fill="rgba(15,23,42,0.85)" stroke="#38bdf8" stroke-width="1"/>
    <text x="92" y="135" fill="#e2e8f0" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">Khái Niệm</text>
    <path d="M150 130 L180 130" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4"/>

    <rect x="35" y="170" width="115" height="40" rx="8" fill="rgba(15,23,42,0.85)" stroke="#34d399" stroke-width="1"/>
    <text x="92" y="195" fill="#e2e8f0" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">Phương Pháp</text>
    <path d="M150 190 L180 170" stroke="#34d399" stroke-width="2" stroke-dasharray="4"/>

    <rect x="450" y="110" width="115" height="40" rx="8" fill="rgba(15,23,42,0.85)" stroke="#fbbf24" stroke-width="1"/>
    <text x="507" y="135" fill="#e2e8f0" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">Luyện Tập</text>
    <path d="M420 130 L450 130" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4"/>

    <rect x="450" y="170" width="115" height="40" rx="8" fill="rgba(15,23,42,0.85)" stroke="#f43f5e" stroke-width="1"/>
    <text x="507" y="195" fill="#e2e8f0" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">Vận Dụng</text>
    <path d="M420 170 L450 190" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4"/>

    <rect x="40" y="260" width="520" height="32" rx="8" fill="rgba(0,0,0,0.5)"/>
    <text x="300" y="281" fill="#a5f3fc" font-size="11" text-anchor="middle" font-family="sans-serif">✨ Học liệu số chuẩn hóa theo định hướng Chương trình GDPT 2018</text>
  </svg>`;

  return {
    mode: 'ILLUSTRATION',
    text: `🎨 **THIẾT KẾ HÌNH ẢNH MINH HỌA BÀI HỌC & CÂU LỆNH PROMPT AI**\n\n🎯 **Chủ đề**: ${clean} | **Môn học**: ${detectedSubj} | **Lớp**: ${detectedGrade}\n\n═══════════════════════════════════════════════════════════\n🖼️ **1. HÌNH MINH HỌA VECTOR SVG TRỰC QUAN (Hiển thị ngay tại đây):**\n*(Thầy/Cô có thể chiếu trực tiếp lên tivi/bảng tương tác cho học sinh quan sát nguyên lý)*\n\n═══════════════════════════════════════════════════════════\n🤖 **2. CÂU LỆNH PROMPT AI CAO CẤP (Dành cho Midjourney / DALL-E 3 / Gemini Imagen):**\n\n📝 **Prompt Tiếng Anh (Khuyến nghị dùng để đạt chất lượng ảnh 3D đẹp nhất):**\n\`\`\`text\nHigh quality educational 3D illustration about ${clean}, subject of ${detectedSubj} grade ${detectedGrade}, modern infographic elements, clean studio lighting, realistic details, textbook art style, 8k resolution --ar 16:9 --v 6.0\n\`\`\`\n\n📝 **Prompt Tiếng Việt (Dành cho Bing Image Creator / Canva AI):**\n\`\`\`text\nHình ảnh minh họa bài giảng môn ${detectedSubj} lớp ${detectedGrade}: Chủ đề "${clean}". Thể hiện rõ ràng các yếu tố kiến thức cốt lõi, màu sắc tươi sáng, phong cách đồ họa giáo dục sắc nét cho bài dạy số.\n\`\`\``,
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
