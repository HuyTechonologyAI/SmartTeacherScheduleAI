// Knowledge Base Data & RAG Anti-Hallucination Grounding Engine
// Dành cho phiên bản Web & Desktop (Windows, macOS, Linux)

export interface KnowledgeDocument {
  id: string;
  code: string;
  title: string;
  category: 'PHAP_QUY' | 'GIAO_TRINH' | 'DE_CUONG' | 'ATLD_5S' | 'NGAN_HANG_DE';
  subject: string;
  targetLevel: string;
  content: string;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: string;
}

export const BUILT_IN_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'builtin-cv-5512',
    code: 'CV 5512/BGDĐT-GDTrH',
    title: 'Công văn 5512/BGDĐT-GDTrH - Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường',
    category: 'PHAP_QUY',
    subject: 'ALL',
    targetLevel: 'THCS, THPT, GDTX',
    content: `CÔNG VĂN 5512/BGDĐT-GDTrH CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO:
QUY ĐỊNH BẮT BUỘC VỀ CẤU TRÚC KẾ HOẠCH BÀI DẠY (GIÁO ÁN):
I. MỤC TIÊU BÀI DẠY:
1. Kiến thức: Nêu rõ các đơn vị kiến thức cốt lõi học sinh cần chiếm lĩnh sau bài học.
2. Năng lực:
- Năng lực chung: Tự chủ và tự học; Giao tiếp và hợp tác; Giải quyết vấn đề và sáng tạo.
- Năng lực đặc thù: Gắn liền với môn học (năng lực tính toán, ngôn ngữ, thực nghiệm khoa học, thẩm mỹ, tin học...).
3. Phẩm chất: Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm (phù hợp với nội dung bài học).

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
- Giáo viên: Thiết bị trình chiếu, tranh ảnh, mô hình, video thí nghiệm, phiếu học tập số 1, 2, 3...
- Học sinh: SGK, vở ghi chép, đồ dùng học tập bộ môn, sản phẩm chuẩn bị trước ở nhà.

III. TIẾN TRÌNH DẠY HỌC (BẮT BUỘC ĐỦ 4 HOẠT ĐỘNG SƯ PHẠM):
1. Hoạt động 1: Mở đầu / Khởi động (Xác định vấn đề / nhiệm vụ học tập).
   - Mục tiêu: Kích thích tò mò, tạo mâu thuẫn nhận thức, liên hệ thực tế.
   - Nội dung: Tình huống, câu đố, video, câu hỏi gợi mở.
   - Sản phẩm: Câu trả lời, phán đoán của học sinh.
   - Tổ chức thực hiện: Chuyển giao -> Thực hiện -> Báo cáo -> Kết luận/Dẫn dắt.
2. Hoạt động 2: Hình thành kiến thức mới (Giải quyết vấn đề / thực thi nhiệm vụ).
   - Mục tiêu: Tiếp thu kiến thức cốt lõi, khái niệm, định lý, quy tắc.
   - Nội dung: Đọc tài liệu SGK, phân tích mô hình, thảo luận nhóm, giải bài tập mẫu.
   - Sản phẩm: Ghi chép tổng kết, sơ đồ tư duy, phiếu học tập đã hoàn thành.
   - Tổ chức thực hiện: Tổ chức làm việc cá nhân / nhóm, giáo viên chuẩn hóa tri thức.
3. Hoạt động 3: Luyện tập (Củng cố, khắc sâu kiến thức vừa học).
   - Mục tiêu: Rèn luyện kỹ năng giải quyết bài tập tương tự.
   - Nội dung: Hệ thống bài tập định lượng / câu hỏi trắc nghiệm / câu hỏi tự luận.
   - Sản phẩm: Lời giải chi tiết của học sinh trong vở.
   - Tổ chức thực hiện: Giao bài tập, học sinh làm, chữa bài và nhận xét lỗi sai.
4. Hoạt động 4: Vận dụng (Gắn bài học vào thực tế cuộc sống).
   - Mục tiêu: Phát triển tư duy bậc cao, sáng tạo, giải quyết tình huống thực tế.
   - Nội dung: Dự án học tập mini, bài tập thực tế, tìm hiểu ứng dụng công nghệ.
   - Sản phẩm: Bản báo cáo ngắn, tranh ảnh, mô hình hoặc bài viết thu hoạch.
   - Tổ chức thực hiện: Giao nhiệm vụ về nhà, nộp và đánh giá vào tiết học sau.`,
    isBuiltIn: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'builtin-cv-2634',
    code: 'CV 2634/GDNN',
    title: 'Công văn 2634/GDNN - Hướng dẫn biên soạn giáo án tích hợp và thực hành nghề xưởng',
    category: 'PHAP_QUY',
    subject: 'ALL',
    targetLevel: 'Trung cấp, Cao đẳng, Dạy nghề',
    content: `CÔNG VĂN 2634/GDNN CỦA TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP:
QUY ĐỊNH BẮT BUỘC VỀ GIÁO ÁN TÍCH HỢP / THỰC HÀNH TẠI XƯỞNG:
I. VỊ TRÍ, Ý NGHĨA VÀ MỤC TIÊU BÀI GIẢNG:
1. Kiến thức: Trình bày được bản vẽ kỹ thuật, quy trình công nghệ, chế độ cắt gọt/vận hành, các dạng sai hỏng nguyên nhân và cách khắc phục.
2. Kỹ năng nghề: Thao tác sử dụng máy móc an toàn, đạt kích thước dung sai theo bản vẽ, đảm bảo độ nhám bề mặt, năng suất định mức.
3. Năng lực tự chủ và trách nhiệm: Ý thức kỷ luật xưởng, thực hiện 5S, bảo vệ môi trường, tinh thần làm việc nhóm và bảo quản vật tư, thiết bị.

II. ĐIỀU KIỆN THỰC HIỆN BÀI GIẢNG:
- Trang thiết bị xưởng: Máy tiện, phay, bào, hàn, CNC, bàn nguội, máy nén khí, bảng điện...
- Phôi liệu, dụng cụ: Phôi sắt, phôi nhôm, dao tiện, dao phay, que hàn, thước kẹp, panme, dưỡng đo...
- Bảo hộ lao động (BHLĐ): Quần áo bảo hộ, kính che mắt, giày mũi thép, găng tay (tùy vị trí, cấm dùng găng tay với máy có trục quay).

III. TIẾN TRÌNH DẠY HỌC THỰC HÀNH (4 BƯỚC BẮT BUỘC):
1. Hướng dẫn ban đầu:
   - Ổn định lớp, điểm danh, kiểm tra BHLĐ và quy tắc an toàn xưởng.
   - Nhắc lại lý thuyết liên quan và phân tích bản vẽ gia công.
   - Giáo viên thao tác mẫu (Lần 1: Tốc độ bình thường; Lần 2: Thao tác chậm và phân tích từng động tác, cách cầm dụng cụ, tư thế đứng).
   - Chỉ ra các dạng sai hỏng thường gặp, nguy cơ mất an toàn và cách phòng ngừa.
   - Cho 1-2 học sinh lên thao tác thử để kiểm tra mức độ tiếp thu.
2. Hướng dẫn thường xuyên:
   - Phân chia vị trí máy và bàn giao phôi liệu, bản vẽ cho từng học sinh.
   - Học sinh độc lập hoặc theo cặp tiến hành gia công chi tiết theo phiếu công nghệ.
   - Giáo viên đi tuần xưởng liên tục, quan sát tư thế thao tác, nhắc nhở quy chuẩn ATLĐ.
   - Uốn nắn thao tác sai, phát hiện và can thiệp kịp thời các nguy cơ sự cố máy.
3. Hướng dẫn kết thúc:
   - Giáo viên cho dừng máy trước 15-20 phút.
   - Thu gom sản phẩm, cùng học sinh dùng thước kẹp/panme đo kiểm kích thước.
   - Đánh giá sản phẩm theo thang điểm phiếu đánh giá kỹ năng nghề.
   - Phân tích nguyên nhân sản phẩm hỏng, tuyên dương học sinh làm tốt.
   - Nhận xét tinh thần, ý thức chấp hành an toàn và vệ sinh công nghiệp trong ca học.
4. Thu dọn và bảo dưỡng thiết bị (Quy chuẩn 5S):
   - Cắt toàn bộ cầu dao điện và aptomat nguồn của từng máy.
   - Quét dọn phoi vụn, lau chùi dung dịch làm mát bằng giẻ lau chuyên dụng.
   - Tra dầu mỡ bôi trơn lên các băng trượt và trục vitme để chống gỉ sét.
   - Sắp xếp dao cụ, thước đo về đúng vị trí trong tủ dụng cụ.`,
    isBuiltIn: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'builtin-tt-22',
    code: 'TT 22/2021/TT-BGDĐT',
    title: 'Thông tư 22/2021/TT-BGDĐT - Đánh giá học sinh THCS, THPT và Khung Ma trận Đề 4 mức độ',
    category: 'PHAP_QUY',
    subject: 'ALL',
    targetLevel: 'THCS, THPT',
    content: `THÔNG TƯ 22/2021/TT-BGDĐT CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO:
QUY ĐỊNH VỀ KIỂM TRA ĐÁNH GIÁ VÀ XÂY DỰNG MA TRẬN ĐỀ THEO 4 MỨC ĐỘ NHẬN THỨC:
1. Mức độ 1: NHẬN BIẾT (Tỉ lệ chuẩn 40%)
   - Yêu cầu: Học sinh nhận diện, nhắc lại, tái hiện được các định nghĩa, quy tắc, công thức, dữ kiện lịch sử hoặc ký hiệu cơ bản đã học.
   - Câu hỏi: Dạng trắc nghiệm hoặc tự luận ngắn đơn giản, trực diện, không đòi hỏi suy luận phức tạp.
2. Mức độ 2: THÔNG HIỂU (Tỉ lệ chuẩn 30%)
   - Yêu cầu: Học sinh giải thích được ý nghĩa bản chất của kiến thức, so sánh, phân biệt, chuyển đổi giữa các hình thức biểu đạt (lời nói, sơ đồ, công thức), giải thích nguyên nhân hiện tượng.
   - Câu hỏi: Yêu cầu phân tích ngắn, giải thích lý do tại sao đúng/sai.
3. Mức độ 3: VẬN DỤNG (Tỉ lệ chuẩn 20%)
   - Yêu cầu: Học sinh vận dụng kiến thức, kỹ năng đã học để giải quyết một bài toán, tình huống mới quen thuộc tương tự như đã học trong chương trình.
   - Câu hỏi: Yêu cầu kết hợp 2-3 bước tính toán hoặc áp dụng vào tình huống cụ thể trong cuộc sống.
4. Mức độ 4: VẬN DỤNG CAO (Tỉ lệ chuẩn 10%)
   - Yêu cầu: Vận dụng tổng hợp kiến thức liên môn, tư duy sáng tạo để giải quyết các vấn đề mới lạ, bài toán tối ưu hoặc tình huống thực tế phức tạp.
   - Câu hỏi: Dạng câu hỏi phân loại học sinh khá - giỏi, đòi hỏi đề xuất giải pháp, nhận định phản biện.`,
    isBuiltIn: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'builtin-atld-5s',
    code: 'TCVN-ATLD-5S',
    title: 'Tiêu chuẩn Kỹ thuật An toàn Lao động Xưởng Thực hành & Quy chuẩn 5S',
    category: 'ATLD_5S',
    subject: 'ALL',
    targetLevel: 'Xưởng thực hành kỹ thuật',
    content: `TIÊU CHUẨN KỸ THUẬT AN TOÀN LAO ĐỘNG (ATLĐ) VÀ NGUYÊN TẮC 5S XƯỞNG MÁY:
1. NGUYÊN TẮC AN TOÀN TRỤC QUAY VÀ TRỤC CHÍNH (Tiện, Phay, Khoan):
   - TUYỆT ĐỐI KHÔNG ĐƯỢC ĐEO GĂNG TAY khi vận hành máy công cụ có trục quay hở (tránh nguy cơ bị cuốn ngón tay).
   - Tóc dài phải được búi gọn và đội mũ bảo hộ kín.
   - Không đeo đồng hồ, vòng tay, dây chuyền hoặc mặc áo tay thụng dài lùng thùng.
   - Phải rút tay quay mâm cặp ra khỏi mâm cặp NGAY LẬP TỨC sau khi gá phôi (tránh khởi động văng tay quay gây tai nạn nghiêm trọng).
   - Không được chạm tay vào phoi đang xoắn; bắt buộc dùng móc sắt cời phoi chuyên dụng.
2. QUY CHUẨN AN TOÀN ĐIỆN VÀ KHẨN CẤP:
   - Luôn biết rõ vị trí nút dừng khẩn cấp (E-STOP) màu đỏ trước khi mở máy.
   - Khi mất điện đột ngột, phải gạt công tắc máy về vị trí TẮT (OFF) để tránh máy tự khởi động lại khi có điện trở lại.
   - Cắt cầu dao tổng trước khi vệ sinh, lau chùi hoặc sửa chữa thiết bị.
3. NGUYÊN TẮC 5S TRONG XƯỞNG HỌC TẬP:
   - S1 (Seiri - Sàng lọc): Phân loại và loại bỏ các phôi hỏng, giẻ rách bẩn khỏi bàn làm việc.
   - S2 (Seiton - Sắp xếp): Dụng cụ đo và dao cắt phải được để đúng khay, ngăn nắp, dễ tìm, dễ lấy.
   - S3 (Seiso - Sạch sẽ): Lau sạch dầu mỡ, quét dọn phoi vụn trên băng trượt và sàn xưởng.
   - S4 (Seiketsu - Săn sóc): Duy trì thường xuyên trạng thái sạch sẽ, chuẩn mực sau mỗi ca học.
   - S5 (Shitsuke - Sẵn sàng): Tạo thói quen kỷ luật, tự giác tuân thủ nội quy xưởng.`,
    isBuiltIn: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  }
];

const STORAGE_KEY = 'smart_teacher_knowledge_docs_custom';

export function getAllKnowledgeDocuments(): KnowledgeDocument[] {
  if (typeof window === 'undefined') {
    return BUILT_IN_KNOWLEDGE_DOCUMENTS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const customDocs: KnowledgeDocument[] = raw ? JSON.parse(raw) : [];
    return [...BUILT_IN_KNOWLEDGE_DOCUMENTS, ...customDocs];
  } catch (e) {
    console.error('Failed to parse knowledge docs from localStorage', e);
    return BUILT_IN_KNOWLEDGE_DOCUMENTS;
  }
}

export function saveKnowledgeDocument(doc: KnowledgeDocument): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const customDocs: KnowledgeDocument[] = raw ? JSON.parse(raw) : [];
    const index = customDocs.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      customDocs[index] = doc;
    } else {
      customDocs.push(doc);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customDocs));
  } catch (e) {
    console.error('Failed to save knowledge document', e);
  }
}

export function deleteCustomKnowledgeDocument(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const customDocs: KnowledgeDocument[] = raw ? JSON.parse(raw) : [];
    const filtered = customDocs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete knowledge document', e);
  }
}

export function toggleKnowledgeDocumentActive(id: string, isActive: boolean): void {
  if (typeof window === 'undefined') return;
  // If it's a built-in doc, track override in localStorage
  const BUILTIN_OVERRIDE_KEY = 'smart_teacher_builtin_overrides';
  try {
    let overrides: Record<string, boolean> = {};
    const raw = localStorage.getItem(BUILTIN_OVERRIDE_KEY);
    if (raw) overrides = JSON.parse(raw);
    overrides[id] = isActive;
    localStorage.setItem(BUILTIN_OVERRIDE_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to update builtin status override', e);
  }

  // Also check if it's in customDocs
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const customDocs: KnowledgeDocument[] = JSON.parse(raw);
      const doc = customDocs.find(d => d.id === id);
      if (doc) {
        doc.isActive = isActive;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customDocs));
      }
    }
  } catch (e) {
    console.error('Failed to update custom doc status', e);
  }
}

export function getResolvedKnowledgeDocuments(): KnowledgeDocument[] {
  if (typeof window === 'undefined') return BUILT_IN_KNOWLEDGE_DOCUMENTS;
  const BUILTIN_OVERRIDE_KEY = 'smart_teacher_builtin_overrides';
  let overrides: Record<string, boolean> = {};
  try {
    const raw = localStorage.getItem(BUILTIN_OVERRIDE_KEY);
    if (raw) overrides = JSON.parse(raw);
  } catch (e) {}

  const builtins = BUILT_IN_KNOWLEDGE_DOCUMENTS.map(doc => {
    if (doc.id in overrides) {
      return { ...doc, isActive: overrides[doc.id] };
    }
    return doc;
  });

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const customDocs: KnowledgeDocument[] = raw ? JSON.parse(raw) : [];
    return [...builtins, ...customDocs];
  } catch (e) {
    return builtins;
  }
}

export function getActiveReferenceContext(subject: string = '', category: string = ''): string {
  const allDocs = getResolvedKnowledgeDocuments();
  const activeDocs = allDocs.filter(d => d.isActive);
  const relevantDocs = activeDocs.filter(d => {
    if (d.category === 'PHAP_QUY') return true;
    if (category && d.category === category) return true;
    if (d.subject === 'ALL') return true;
    if (subject && d.subject.toLowerCase().includes(subject.toLowerCase())) return true;
    return false;
  });

  if (relevantDocs.length === 0) return '';

  return relevantDocs.map(d => `【${d.title} (${d.code})】\n${d.content}`).join('\n\n---\n');
}
