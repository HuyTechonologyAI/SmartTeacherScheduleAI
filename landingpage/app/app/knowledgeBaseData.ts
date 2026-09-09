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
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileData?: string;
}

export const BUILT_IN_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'builtin-cv-5512',
    code: 'CV 5512/BGDĐT-GDTrH',
    title: 'Công văn 5512/BGDĐT-GDTrH - Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường',
    category: 'PHAP_QUY',
    subject: 'ALL',
    targetLevel: 'THCS, THPT, GDTX',
    content: `CÔNG VĂN SỐ 5512/BGDĐT-GDTrH NGÀY 18/12/2020 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO:
V/v XÂY DỰNG VÀ TỔ CHỨC THỰC HIỆN KẾ HOẠCH GIÁO DỤC CỦA NHÀ TRƯỜNG
(Quy định chuẩn hóa về khung Kế hoạch bài dạy / Giáo án theo Chương trình GDPT 2018)

I. MỤC TIÊU BÀI DẠY (BẮT BUỘC 3 THÀNH TỐ):
1. Kiến thức: Nêu rõ các đơn vị kiến thức cốt lõi, khái niệm, quy tắc, định luật mà học sinh cần chiếm lĩnh hoặc vận dụng sau bài học.
2. Năng lực:
- Năng lực chung: Tự chủ và tự học; Giao tiếp và hợp tác; Giải quyết vấn đề và sáng tạo.
- Năng lực đặc thù: Gắn liền với từng môn học (Năng lực tính toán, ngôn ngữ, khoa học tự nhiên, công nghệ, tin học, thẩm mỹ...).
3. Phẩm chất: Bồi dưỡng 5 phẩm chất chủ yếu: Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm.

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
- Giáo viên: Kế hoạch bài dạy, bài trình chiếu slide, máy tính, bảng tương tác/tivi, tranh ảnh, mô hình, video thí nghiệm trực quan, phiếu học tập.
- Học sinh: Sách giáo khoa, vở ghi bài, đồ dùng học tập bộ môn, sản phẩm học tập hoặc phiếu chuẩn bị bài trước ở nhà.

III. TIẾN TRÌNH DẠY HỌC (BẮT BUỘC ĐỦ 4 HOẠT ĐỘNG SƯ PHẠM):
1. Hoạt động 1: Xác định vấn đề / Khởi động (Mở đầu bài học)
   - Mục tiêu: Kích hoạt kiến thức nền tảng, tạo tình huống mâu thuẫn nhận thức, khơi gợi trí tò mò của học sinh.
   - Nội dung: Tình huống thực tế, câu đố, video ngắn, câu hỏi mở đầu.
   - Sản phẩm: Câu trả lời, dự đoán hoặc kết quả thao tác ban đầu của học sinh.
   - Tổ chức thực hiện (4 bước): Chuyển giao nhiệm vụ -> HS thực hiện -> Báo cáo, thảo luận -> GV kết luận, nhận định và dẫn dắt vào bài mới.
2. Hoạt động 2: Hình thành kiến thức mới (Khám phá và giải quyết nhiệm vụ)
   - Mục tiêu: Giúp học sinh chiếm lĩnh tri thức cốt lõi, quy tắc, định luật hoặc kỹ năng trọng tâm của bài.
   - Nội dung: Đọc tài liệu SGK, phân tích biểu đồ/mô hình, tiến hành thí nghiệm, thảo luận nhóm theo phiếu học tập.
   - Sản phẩm: Ghi chép nội dung chính trong vở, sơ đồ tư duy hoặc kết quả phiếu học tập đã hoàn thành.
   - Tổ chức thực hiện (4 bước): Chuyển giao nhiệm vụ -> HS làm việc cá nhân/nhóm -> Đại diện báo cáo, tranh biện -> GV chuẩn hóa kiến thức khoa học.
3. Hoạt động 3: Luyện tập (Củng cố, khắc sâu kiến thức vừa học)
   - Mục tiêu: Rèn luyện kỹ năng thực hành, áp dụng trực tiếp kiến thức vừa học để giải quyết bài tập.
   - Nội dung: Hệ thống câu hỏi trắc nghiệm khách quan, bài tập định lượng/định tính, câu hỏi tự luận ngắn.
   - Sản phẩm: Lời giải chính xác của học sinh trong vở hoặc bài trình bày trên bảng.
   - Tổ chức thực hiện (4 bước): GV giao bài tập -> HS độc lập giải quyết -> Báo cáo, nhận xét chéo -> GV chấm chữa và phân tích lỗi sai điển hình.
4. Hoạt động 4: Vận dụng (Gắn kết tri thức vào đời sống thực tế)
   - Mục tiêu: Phát triển tư duy bậc cao, sáng tạo, giải quyết tình huống thực tế và định hướng phát triển bản thân.
   - Nội dung: Dự án học tập mini, bài tập nghiên cứu nhỏ tại gia đình/địa phương, thiết kế sản phẩm ứng dụng.
   - Sản phẩm: Bản báo cáo thu hoạch, poster, video ngắn hoặc sản phẩm thực tế nộp vào tiết học sau.
   - Tổ chức thực hiện: GV giao nhiệm vụ, hướng dẫn tiêu chí đánh giá -> HS thực hiện ngoài giờ lên lớp -> Đánh giá vào buổi tiếp theo.`,
    isBuiltIn: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'builtin-cv-3456',
    code: 'CV 3456/BGDĐT-GDPT',
    title: 'Công văn 3456/BGDĐT-GDPT - Triển khai Khung năng lực số cho học sinh phổ thông và GDTX',
    category: 'PHAP_QUY',
    subject: 'ALL',
    targetLevel: 'Tiểu học, THCS, THPT, GDTX',
    content: `CÔNG VĂN SỐ 3456/BGDĐT-GDPT NGÀY 27/06/2025 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO:
V/v HƯỚNG DẪN TRIỂN KHAI THỰC HIỆN KHUNG NĂNG LỰC SỐ CHO HỌC SINH PHỔ THÔNG VÀ HỌC VIÊN GIÁO DỤC THƯỜNG XUYÊN
(Căn cứ Thông tư số 02/2025/TT-BGDĐT ngày 24/01/2025 của Bộ trưởng Bộ GD&ĐT quy định Khung năng lực số cho người học trong hệ thống giáo dục quốc dân)

I. MỤC TIÊU VÀ NGUYÊN TẮC TÍCH HỢP NĂNG LỰC SỐ:
1. Phát triển toàn diện các kỹ năng số cho người học nhằm thích ứng với kỷ nguyên chuyển đổi số quốc gia và xã hội số.
2. Tích hợp năng lực số vào tất cả các môn học, hoạt động giáo dục theo từng cấp học (Tiểu học, THCS, THPT, GDTX) mà không làm phát sinh môn học mới hay gây quá tải chương trình.
3. Giáo viên đối chiếu các miền năng lực số và bảng mã chỉ báo (Phụ lục 1) để xác định mục tiêu bài dạy và thiết kế các hoạt động học tập phù hợp.

II. 6 MIỀN NĂNG LỰC SỐ CỐT LÕI (THEO KHUNG NĂNG LỰC SỐ QUỐC GIA):
1. Miền 1 - VẬN HÀNH THIẾT BỊ VÀ PHẦN MỀM:
   - Nhận biết, kết nối và sử dụng an toàn các thiết bị số cá nhân và học đường (máy tính, máy tính bảng, điện thoại thông minh, bảng tương tác, thiết bị nghe nhìn).
   - Khởi động, cài đặt, cập nhật và thao tác phần mềm văn phòng, ứng dụng học tập số, trình duyệt web, nền tảng học trực tuyến.
   - Nhận biết và xử lý được các sự cố kỹ thuật đơn giản trong quá trình vận hành thiết bị số.
2. Miền 2 - KHAI THÁC THÔNG TIN VÀ DỮ LIỆU:
   - Xác định nhu cầu thông tin, xây dựng từ khóa và thực hiện tìm kiếm, tra cứu dữ liệu học tập có định hướng trên Internet.
   - Đánh giá tính chính xác, độ tin cậy và nguồn gốc của dữ liệu, thông tin số; phân biệt thông tin thật và tin đồn/tin sai lệch.
   - Lưu trữ, phân loại, sắp xếp và sao lưu dữ liệu học tập khoa học trong các thư mục hoặc dịch vụ đám mây (Google Drive, OneDrive...).
3. Miền 3 - GIAO TIẾP VÀ HỢP TÁC TRONG MÔI TRƯỜNG SỐ:
   - Sử dụng các phương tiện và nền tảng số để giao tiếp, trao đổi học tập (Email, phòng học trực tuyến Zoom/Teams/Meet, hệ thống LMS, mạng xã hội học tập).
   - Tuân thủ quy tắc văn hóa ứng xử trực tuyến (Netiquette), thể hiện sự tôn trọng, chuẩn mực ngôn từ và tính nhân văn khi tương tác số.
   - Hợp tác học tập nhóm, cùng chỉnh sửa văn bản/bảng tính trực tuyến, quản lý dự án học tập số.
4. Miền 4 - SÁNG TẠO NỘI DUNG SỐ:
   - Tạo mới, chỉnh sửa và trình bày các sản phẩm học tập số đa phương tiện (văn bản tài liệu, bài trình chiếu slide, video clip ngắn, infographic, sơ đồ tư duy số).
   - Tích hợp và tái cấu trúc nội dung số có đạo đức; biết trích dẫn nguồn tài liệu và tôn trọng bản quyền sở hữu trí tuệ kỹ thuật số.
   - Khám phá lập trình cơ bản hoặc tự động hóa các tác vụ học tập đơn giản.
5. Miền 5 - AN TOÀN TRONG MÔI TRƯỜNG SỐ:
   - Bảo vệ thiết bị số trước các nguy cơ mã độc, virus, phần mềm độc hại; tạo mật khẩu an toàn và xác thực hai yếu tố.
   - Bảo vệ thông tin và dữ liệu cá nhân, quyền riêng tư của bản thân và người khác trên không gian mạng.
   - Nhận diện và phòng tránh các hành vi lừa đảo trực tuyến, bắt nạt trên mạng (Cyberbullying), nội dung độc hại, lôi kéo tiêu cực.
   - Bảo vệ sức khỏe thể chất (tư thế ngồi, khoảng cách mắt, công thái học) và sức khỏe tâm lý trước áp lực công nghệ, cân bằng thời gian sử dụng màn hình.
6. Miền 6 - GIẢI QUYẾT VẤN ĐỀ VỚI SỰ HỖ TRỢ CỦA CÔNG NGHỆ SỐ:
   - Nhận diện nhu cầu công nghệ, lựa chọn phần mềm hoặc công cụ số tối ưu nhất để giải quyết một nhiệm vụ học tập cụ thể.
   - Vận dụng tư duy máy tính (Computational Thinking): Chia nhỏ vấn đề, nhận diện quy luật, tư duy trừu tượng và thiết kế thuật toán từng bước.
   - Sử dụng phần mềm mô phỏng, bảng tính số liệu để phân tích hiện tượng khoa học và kiểm chứng giả thuyết.

III. QUY ĐỊNH TÍCH HỢP VÀO KẾ HOẠCH BÀI DẠY (GIÁO ÁN):
- Tại Mục I.2 (Năng lực): Giáo viên trích dẫn mã chỉ báo năng lực số tương ứng vào Năng lực đặc thù hoặc Năng lực chung.
- Tại Mục II (Thiết bị và học liệu): Liệt kê thiết bị số, phần mềm, liên kết học liệu số giao cho học sinh.
- Tại Mục III (Tiến trình dạy học): Bố trí hoạt động cho học sinh trực tiếp thao tác công nghệ số (tra cứu số liệu, làm bài tập tương tác, tạo báo cáo số).`,
    isBuiltIn: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'builtin-qd-2422',
    code: 'QĐ 2422/QĐ-BGDĐT',
    title: 'Quyết định 2422/QĐ-BGDĐT - Khung nội dung giáo dục Trí tuệ nhân tạo (AI) cho học sinh phổ thông',
    category: 'PHAP_QUY',
    subject: 'ALL',
    targetLevel: 'Tiểu học, THCS, THPT',
    content: `QUYẾT ĐỊNH SỐ 2422/QĐ-BGDĐT NGÀY 18/08/2026 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO:
V/v BAN HÀNH KHUNG NỘI DUNG GIÁO DỤC TRÍ TUỆ NHÂN TẠO (AI) CHO HỌC SINH PHỔ THÔNG
(Ký bởi Thứ trưởng Bộ Giáo dục và Đào tạo Phạm Ngọc Thưởng; Cụ thể hóa Nghị quyết số 71-NQ/TW của Bộ Chính trị)

I. MỤC TIÊU VÀ LỘ TRÌNH TRIỂN KHAI:
1. Mục tiêu: Hình thành và phát triển năng lực Trí tuệ nhân tạo (AI) cho học sinh Việt Nam; trang bị tư duy phản biện, kỹ năng kiểm chứng thông tin, năng lực làm chủ công nghệ, sử dụng AI an toàn, có đạo đức và trách nhiệm, chuẩn bị nhân lực cho kỷ nguyên số.
2. Lộ trình triển khai:
   - Năm học 2025 - 2026: Tổ chức thí điểm tại các cơ sở giáo dục phổ thông đại diện.
   - Từ năm học 2026 - 2027: Chính thức triển khai ĐẠI TRÀ tại tất cả các cơ sở giáo dục phổ thông trên phạm vi TOÀN QUỐC.
3. Thời lượng quy định:
   - Thời lượng cốt lõi: 12 tiết/lớp/năm học.
   - Phương thức thực hiện: Lồng ghép linh hoạt trong kế hoạch dạy học 2 buổi/ngày, tích hợp vào môn Tin học, Công nghệ, Hoạt động trải nghiệm, hướng nghiệp và các môn học có liên quan; đảm bảo tính khoa học, vừa sức và không gây quá tải cho học sinh.

II. 4 MẠCH KIẾN THỨC CỐT LÕI CỦA GIÁO DỤC AI:
1. Mạch 1: TƯ DUY LẤY CON NGƯỜI LÀM TRUNG TÂM (Human-Centered AI Thinking):
   - Nhận thức sâu sắc rằng AI là công cụ do con người tạo ra để phục vụ con người; con người luôn giữ vai trò quyết định và chịu trách nhiệm đạo đức, pháp lý cao nhất.
   - Rèn luyện tư duy phản biện: Tuyệt đối không phó mặc hoàn toàn cho AI, luôn thẩm định, đối chiếu và kiểm chứng các kết quả do AI cung cấp trước khi sử dụng.
   - Đánh giá tác động của AI đối với bản thân, xã hội, thị trường lao động và nhân loại.
2. Mạch 2: ĐẠO ĐỨC AI VÀ TRÁCH NHIỆM SỐ (AI Ethics & Responsibility):
   - Đảm bảo tính trung thực, liêm chính học thuật: Không sao chép nguyên văn sản phẩm của AI để nhận là của mình; tuân thủ quy tắc trích dẫn khi có AI trợ giúp.
   - Bảo vệ quyền riêng tư và dữ liệu cá nhân: Không cung cấp thông tin bí mật, dữ liệu định danh cá nhân hoặc của người khác vào các nền tảng AI công cộng.
   - Nhận diện các tác hại tiềm ẩn của AI: Tin giả (Deepfake), thông tin sai lệch có định hướng (Hallucination/Disinformation), định kiến thuật toán (Algorithmic Bias); cam kết không dùng AI để quấy rối, lừa đảo hoặc vi phạm pháp luật.
3. Mạch 3: CÁC KỸ THUẬT VÀ ỨNG DỤNG AI (AI Techniques & Applications):
   - Khái niệm nền tảng: Dữ liệu huấn luyện, mô hình học máy (Machine Learning), mạng nơ-ron nhân tạo, xử lý ngôn ngữ tự nhiên (NLP), thị giác máy tính (Computer Vision), AI tạo sinh (Generative AI).
   - Kỹ năng giao tiếp và ra lệnh cho AI (Prompt Engineering): Thiết lập bối cảnh, câu lệnh rõ ràng, cung cấp dữ liệu tham chiếu để AI sinh kết quả tối ưu.
   - Ứng dụng AI trợ giúp cá nhân hóa học tập: Tóm tắt bài học, ôn luyện kiểm tra, phân tích dữ liệu nghiên cứu khoa học học sinh.
4. Mạch 4: THIẾT KẾ HỆ THỐNG AI VÀ ĐỊNH HƯỚNG NGHỀ NGHIỆP (AI Systems Design):
   - Trải nghiệm quy trình xây dựng ứng dụng AI đơn giản: Thu thập dữ liệu -> Tiền xử lý -> Huấn luyện mô hình -> Đánh giá độ chính xác -> Triển khai ứng dụng.
   - Vận dụng AI giải quyết vấn đề thực tế: Ứng dụng AI trong bảo vệ môi trường, nông nghiệp thông minh, giao thông, y tế học đường.
   - Hướng nghiệp thời đại AI: Tìm hiểu các ngành nghề mới xuất hiện, kỹ năng cần thiết trong thị trường lao động tương lai.

III. PHÂN KỲ NỘI DUNG THEO CẤP HỌC:
1. Giai đoạn Giáo dục cơ bản (Tiểu học và THCS):
   - Tiểu học: Làm quen với sự hiện diện của AI trong đời sống (trợ lý ảo, nhận diện giọng nói); ý thức an toàn cơ bản khi dùng thiết bị thông minh.
   - THCS: Hiểu cách AI học hỏi từ dữ liệu; trải nghiệm ứng dụng AI trong học tập; phân biệt AI tốt và AI có hại; thực hành đạo đức số.
2. Giai đoạn Giáo dục định hướng nghề nghiệp (THPT):
   - Đi sâu nguyên lý hoạt động của các hệ thống AI; sử dụng kỹ thuật câu lệnh nâng cao; thiết kế giải pháp ứng dụng AI liên môn; định hướng lựa chọn nghề nghiệp tương thích kỷ nguyên AI.`,
    isBuiltIn: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'builtin-cv-2634',
    code: 'CV 2634/TCGDNN-ĐTCQ',
    title: 'Công văn 2634/TCGDNN-ĐTCQ - Hướng dẫn biên soạn giáo án tích hợp và thực hành nghề xưởng',
    category: 'PHAP_QUY',
    subject: 'ALL',
    targetLevel: 'Trung cấp, Cao đẳng, Dạy nghề',
    content: `CÔNG VĂN SỐ 2634/TCGDNN-ĐTCQ CỦA TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP:
(VỤ ĐÀO TẠO CHÍNH QUY - BỘ LAO ĐỘNG - THƯƠNG BINH VÀ XÃ HỘI)
V/v HƯỚNG DẪN XÂY DỰNG KẾ HOẠCH BÀI DẠY, GIÁO ÁN TÍCH HỢP VÀ THỰC HÀNH NGHỀ XƯỞNG

I. MỤC TIÊU BÀI DẠY NGHỀ (3 YẾU TỐ CHUẨN ĐẦU RA):
1. Kiến thức: Nắm vững bản vẽ kỹ thuật, quy trình công nghệ gia công/lắp ráp, thông số kỹ thuật (vận tốc cắt, bước tiến dao, chiều sâu cắt, áp lực, dòng hàn, điện áp...), cấu tạo và nguyên lý vận hành của máy móc thiết bị.
2. Kỹ năng nghề: Thực hiện đúng tư thế và cử động thao tác kỹ thuật; gia công đạt kích thước, hình dáng, dung sai và độ nhám bề mặt theo bản vẽ; thao tác đo kiểm thành thạo bằng thước cặp, panme, dưỡng đo.
3. Năng lực tự chủ và trách nhiệm: Ý thức chấp hành kỷ luật xưởng, tuân thủ quy chuẩn An toàn lao động (ATLĐ), thực hiện phương pháp 5S, bảo vệ môi trường, tiết kiệm vật tư phôi liệu, tác phong công nghiệp.

II. ĐIỀU KIỆN THỰC HIỆN BÀI DẠY (XƯỞNG THỰC HÀNH):
- Thiết bị công nghệ: Máy tiện, máy phay, máy hàn, máy CNC, bàn nguội, máy nén khí, bảng điện động lực; công tắc dừng khẩn cấp (E-Stop) hoạt động chuẩn xác.
- Vật tư, phôi mẫu: Đủ chủng loại và số lượng theo bài tập (Thép C45, Nhôm A6061, que hàn...), dao cụ sắc bén, dầu mỡ bôi trơn làm mát.
- Trang bị Bảo hộ lao động (BHLĐ): Quần áo bảo hộ vừa vặn, kính chống phoi, giày mũi thép chống đinh, chụp tai chống ồn (nếu ở khu vực máy dập/mài).

III. TIẾN TRÌNH DẠY HỌC THỰC HÀNH (4 BƯỚC BẮT BUỘC):
1. Bước 1: Hướng dẫn ban đầu & Phổ biến ATLĐ xưởng (~10% thời lượng):
   - Ổn định lớp, điểm danh, kiểm tra trang phục BHLĐ.
   - Nhắc lại lý thuyết liên quan và phân tích chi tiết bản vẽ gia công.
   - Phổ biến mục tiêu, yêu cầu kỹ thuật và cảnh báo các nguy cơ tai nạn (văng phoi, kẹp tay, giật điện).
2. Bước 2: Hướng dẫn thường xuyên & Thao tác mẫu của Giáo viên (~15% thời lượng):
   - GV thao tác mẫu quy chuẩn: Lần 1 tốc độ bình thường; Lần 2 thao tác chậm kèm giải thích rõ tư thế và góc đặt dao; Lần 3 nhấn mạnh các lỗi sai hỏng nguy hiểm và biện pháp khắc phục.
   - Gọi 1-2 học viên lên thao tác thử để kiểm tra mức độ tiếp thu và uốn nắn ngay cử động sai.
3. Bước 3: Học sinh phân nhóm luyện tập tại máy & GV giám sát uốn nắn (~65% thời lượng):
   - Phân chia vị trí máy và bàn giao phôi liệu, bản vẽ cho từng học viên.
   - Học viên vận hành máy theo đúng phiếu hướng dẫn công nghệ.
   - GV liên tục tuần tra xưởng, kiểm soát an toàn 100%, kịp thời uốn nắn thao tác cầm dụng cụ, tư thế đứng, dừng máy trước khi đo kiểm.
4. Bước 4: Hướng dẫn kết thúc, Đánh giá sản phẩm & Thu dọn 5S (~10% thời lượng):
   - Cho dừng máy trước 15-20 phút; thu gom chi tiết gia công.
   - Tổ chức đo kiểm kích thước, đánh giá sản phẩm theo phiếu chấm điểm kỹ năng nghề.
   - Phân tích nguyên nhân sản phẩm hỏng, rút kinh nghiệm buổi học, tuyên dương học viên làm tốt.
   - Thực hiện nghiêm ngặt quy trình 5S: Ngắt cầu dao tổng, thu dọn phoi kim loại, lau chùi máy, tra dầu mỡ chống gỉ trục trượt, cất dụng cụ đo vào tủ khóa.

QUY TẮC ATLĐ SỐNG CÒN TRONG XƯỞNG:
- TUYỆT ĐỐI KHÔNG ĐƯỢC ĐEO GĂNG TAY khi vận hành các máy có trục quay (máy tiện, máy phay, máy khoan, máy mài) để tránh nguy cơ bị cuốn tay vào trục máy gây tai nạn nghiêm trọng.
- Bắt buộc phải đội mũ gom gọn tóc dài; tháo đồng hồ, nhẫn, vòng tay kim loại trước khi vào máy.`,
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
    targetLevel: 'THCS, THPT, GDTX',
    content: `THÔNG TƯ SỐ 22/2021/TT-BGDĐT NGÀY 20/07/2021 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO:
V/v QUY ĐỊNH VỀ ĐÁNH GIÁ HỌC SINH TRUNG HỌC CƠ SỞ VÀ HỌC SINH TRUNG HỌC PHỔ THÔNG
(Chuẩn hóa khung ma trận kiểm tra đánh giá định kỳ theo 4 mức độ nhận thức của Bộ GD&ĐT)

I. QUY CHUẨN MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ THEO 4 MỨC ĐỘ NHẬN THỨC:
1. Mức độ 1: NHẬN BIẾT (Tỉ lệ chuẩn ~40% tổng điểm đề kiểm tra)
   - Yêu cầu năng lực: Học sinh nhận diện, nhắc lại, tái hiện hoặc kể tên được các định nghĩa, khái niệm, công thức toán học/khoa học, sự kiện lịch sử, ký hiệu hoặc dữ liệu cơ bản đã học.
   - Động từ sư phạm đặc trưng: Nhận biết, chỉ ra, nêu được, kể tên, phát biểu, liệt kê, viết lại, xác định.
   - Hình thức câu hỏi: Dạng trắc nghiệm 4 lựa chọn trực diện hoặc tự luận ngắn trực tiếp; không đòi hỏi tính toán nhiều bước hay suy luận phức tạp.
2. Mức độ 2: THÔNG HIỂU (Tỉ lệ chuẩn ~30% tổng điểm đề kiểm tra)
   - Yêu cầu năng lực: Học sinh hiểu được ý nghĩa bản chất của kiến thức; biết giải thích bằng ngôn ngữ của bản thân; phân biệt, so sánh các khái niệm; chuyển đổi giữa các hình thức biểu đạt (sơ đồ, đồ thị, văn bản, công thức); giải thích được nguyên nhân hiện tượng.
   - Động từ sư phạm đặc trưng: Giải thích được, làm rõ bản chất, phân biệt, so sánh, minh họa, tóm tắt, phân loại, trình bày nguyên nhân.
   - Hình thức câu hỏi: Câu hỏi trắc nghiệm đòi hỏi suy luận logic đơn giản hoặc câu hỏi tự luận yêu cầu lý giải "Tại sao?", "Ý nghĩa là gì?".
3. Mức độ 3: VẬN DỤNG (Tỉ lệ chuẩn ~20% tổng điểm đề kiểm tra)
   - Yêu cầu năng lực: Học sinh biết vận dụng kiến thức, kỹ năng đã học để giải quyết các vấn đề, bài toán hoặc tình huống quen thuộc tương tự như đã học trong chương trình.
   - Động từ sư phạm đặc trưng: Vận dụng, tính toán, xác định kết quả, áp dụng quy trình, chứng minh, giải quyết tình huống.
   - Hình thức câu hỏi: Bài tập định lượng kết hợp 2-3 bước tính toán hoặc câu hỏi tự luận liên hệ thực tế gần gũi với nội dung bài học.
4. Mức độ 4: VẬN DỤNG CAO (Tỉ lệ chuẩn ~10% tổng điểm đề kiểm tra)
   - Yêu cầu năng lực: Học sinh tổng hợp kiến thức liên môn, phân tích sâu sắc, sáng tạo và đề xuất giải pháp tối ưu để giải quyết các vấn đề mới lạ, bài toán phức tạp hoặc tình huống thực tiễn sinh động.
   - Động từ sư phạm đặc trưng: Đề xuất giải pháp, thiết kế mô hình, tối ưu hóa, đánh giá phản biện, phân tích tổng hợp, sáng tạo.
   - Hình thức câu hỏi: Câu hỏi phân loại học sinh giỏi, câu hỏi mở đòi hỏi tư duy phản biện và năng lực giải quyết vấn đề sáng tạo.

II. NGUYÊN TẮC BIÊN SOẠN BỘ ĐỀ KIỂM TRA CHUẨN SƯ PHẠM:
- Đảm bảo độ bao phủ kiến thức theo đúng phân phối chương trình và kế hoạch dạy học.
- Tỉ lệ phân bổ mức độ nhận thức cân đối (40% - 30% - 20% - 10% hoặc điều chỉnh nhẹ tùy đặc thù môn học).
- Câu hỏi trắc nghiệm phải có câu dẫn rõ ràng, không mập mờ, các phương án nhiễu phải có tính hợp lý sư phạm.
- Luôn có đáp án chính xác kèm biểu điểm và hướng dẫn chấm/lời giải chi tiết.`,
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
