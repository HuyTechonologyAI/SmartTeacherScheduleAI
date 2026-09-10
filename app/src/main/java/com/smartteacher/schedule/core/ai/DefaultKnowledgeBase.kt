package com.smartteacher.schedule.core.ai

import com.smartteacher.schedule.core.database.entity.KnowledgeDocumentEntity

/**
 * Kho dữ liệu văn bản pháp quy và tiêu chuẩn sư phạm cốt lõi tích hợp sẵn,
 * làm nền tảng đối chiếu (Grounding) tuyệt đối cho AI để chống ảo giác / bịa đặt.
 * Bao gồm các văn bản chính thống từ Bộ GD&ĐT và Tổng cục GDNN:
 * 1. CV 5512/BGDĐT-GDTrH (Kế hoạch bài dạy 4 hoạt động)
 * 2. CV 3456/BGDĐT-GDPT (Khung năng lực số học sinh phổ thông và GDTX)
 * 3. QĐ 2422/QĐ-BGDĐT (Khung nội dung giáo dục Trí tuệ nhân tạo AI phổ thông)
 * 4. CV 2634/TCGDNN-ĐTCQ (Giáo án tích hợp và thực hành nghề xưởng)
 * 5. TT 22/2021/TT-BGDĐT (Đánh giá HS & Ma trận đề 4 mức độ nhận thức)
 * 6. Tiêu chuẩn Kỹ thuật ATLĐ xưởng và Quy chuẩn 5S
 */
object DefaultKnowledgeBase {

    fun getDefaultBuiltInDocuments(): List<KnowledgeDocumentEntity> {
        val now = System.currentTimeMillis()
        return listOf(
            KnowledgeDocumentEntity(
                code = "CV_5512",
                title = "Công văn 5512/BGDĐT-GDTrH của Bộ GD&ĐT",
                category = KnowledgeDocumentEntity.CAT_PHAP_QUY,
                subject = "ALL",
                targetLevel = "Phổ thông",
                summary = "Khung Kế hoạch bài dạy chuẩn cấp THCS, THPT và GDTX với 3 thành tố mục tiêu và 4 hoạt động bắt buộc.",
                content = """
                    CÔNG VĂN SỐ 5512/BGDĐT-GDTrH NGÀY 18/12/2020 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO
                    V/v Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường
                    (Khung Kế hoạch bài dạy / Giáo án chuẩn Chương trình GDPT 2018)
                    
                    I. QUY ĐỊNH VỀ MỤC TIÊU KẾ HOẠCH BÀI DẠY (BẮT BUỘC 3 THÀNH TỐ):
                    1. Kiến thức: Nêu cụ thể nội dung kiến thức, khái niệm, quy tắc, định luật mà học sinh cần tiếp thu, phát hiện hoặc vận dụng sau bài học.
                    2. Năng lực:
                       - Năng lực chung: Tự chủ và tự học (tự giác tìm hiểu, chuẩn bị bài); Giao tiếp và hợp tác (thảo luận nhóm, phản biện, thuyết trình); Giải quyết vấn đề và sáng tạo (đề xuất giải pháp mới).
                       - Năng lực đặc thù: Gắn liền với từng môn học (tính toán, ngôn ngữ, khoa học tự nhiên, công nghệ, tin học, thẩm mỹ...).
                    3. Phẩm chất: Bồi dưỡng 5 phẩm chất chủ yếu: Yêu nước, Nhân ái, Chăm chỉ (ý thức vượt khó), Trung thực (liêm chính học thuật), Trách nhiệm (với bản thân, gia đình và tập thể).
                    
                    II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
                    - Giáo viên: Kế hoạch bài dạy, bài trình chiếu slide, máy tính, máy chiếu/tivi, thiết bị thí nghiệm, tranh ảnh, mô hình trực quan, phiếu học tập số 1, 2, 3...
                    - Học sinh: Sách giáo khoa, vở ghi, dụng cụ học tập theo bộ môn, bảng phụ thảo luận nhóm hoặc phiếu chuẩn bị trước ở nhà.
                    
                    III. TIẾN TRÌNH DẠY HỌC - 4 HOẠT ĐỘNG BẮT BUỘC:
                    1. Hoạt động 1: Xác định vấn đề / Khởi động (Mở đầu bài học)
                       - Mục tiêu: Kích hoạt kiến thức nền tảng, tạo mâu thuẫn nhận thức hoặc khơi gợi hứng thú tiếp nhận bài học mới.
                       - Nội dung: Tình huống thực tế, câu đố, video ngắn, câu hỏi gợi mở.
                       - Sản phẩm: Câu trả lời, ý kiến phán đoán ban đầu của học sinh.
                       - Tổ chức thực hiện: 4 bước chuẩn (Chuyển giao nhiệm vụ -> HS thực hiện -> Báo cáo, thảo luận -> GV kết luận, dẫn dắt vào bài mới).
                    2. Hoạt động 2: Hình thành kiến thức mới (Khám phá và giải quyết nhiệm vụ)
                       - Mục tiêu: Giúp học sinh chiếm lĩnh được tri thức trọng tâm, quy tắc, định luật hoặc kỹ năng cốt lõi.
                       - Nội dung: Đọc tài liệu SGK, khai thác kênh hình/mô hình, tiến hành thí nghiệm, thảo luận nhóm theo phiếu học tập.
                       - Sản phẩm: Ghi chép nội dung chính trong vở, sơ đồ tư duy hoặc kết quả phiếu học tập đã hoàn thành.
                       - Tổ chức thực hiện: 4 bước chi tiết, phát huy vai trò chủ động của học sinh, GV làm người hướng dẫn và chuẩn hóa kiến thức.
                    3. Hoạt động 3: Luyện tập (Củng cố và khắc sâu kiến thức)
                       - Mục tiêu: Khắc sâu, củng cố và rèn luyện kỹ năng thực hành kiến thức vừa học.
                       - Nội dung: Hệ thống bài tập trắc nghiệm khách quan, bài tập định lượng/định tính từ cơ bản đến nâng cao.
                       - Sản phẩm: Lời giải chính xác của học sinh trong vở hoặc trên bảng lớp.
                       - Tổ chức thực hiện: Giao bài tập, HS làm bài độc lập/theo cặp, báo cáo chữa bài và phân tích lỗi sai điển hình.
                    4. Hoạt động 4: Vận dụng (Gắn kết tri thức vào đời sống thực tế)
                       - Mục tiêu: Phát triển năng lực vận dụng kiến thức vào thực tiễn đời sống, phát triển tư duy sáng tạo bậc cao.
                       - Nội dung: Nhiệm vụ nghiên cứu nhỏ tại gia đình/địa phương, dự án học tập mini, thiết kế sản phẩm ứng dụng.
                       - Sản phẩm: Bản báo cáo thu hoạch, poster, video ngắn hoặc sản phẩm thực tế nộp vào tiết học sau.
                       - Tổ chức thực hiện: GV giao nhiệm vụ rõ ràng về tiêu chí và hạn nộp, HS thực hiện ngoài giờ lên lớp.
                    
                    NGHIÊM CẤM: Tuyệt đối không biến kế hoạch bài dạy thành kịch bản hỏi - đáp máy móc giữa giáo viên và học sinh. Mọi hoạt động phải hướng vào sự chủ động của người học.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            ),

            KnowledgeDocumentEntity(
                code = "CV_3456_BGDDT",
                title = "Công văn 3456/BGDĐT-GDPT của Bộ GD&ĐT",
                category = KnowledgeDocumentEntity.CAT_PHAP_QUY,
                subject = "ALL",
                targetLevel = "Phổ thông",
                summary = "Khung Năng lực số cho học sinh phổ thông và GDTX (theo TT 02/2025/TT-BGDĐT) với 6 miền năng lực cốt lõi và mã chỉ báo tích hợp vào giáo án.",
                content = """
                    CÔNG VĂN SỐ 3456/BGDĐT-GDPT NGÀY 27/06/2025 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO
                    V/v Hướng dẫn triển khai thực hiện Khung năng lực số cho học sinh phổ thông và học viên giáo dục thường xuyên
                    (Căn cứ Thông tư số 02/2025/TT-BGDĐT ngày 24/01/2025 của Bộ GD&ĐT quy định Khung năng lực số cho người học trong hệ thống giáo dục quốc dân)
                    
                    I. NGUYÊN TẮC TÍCH HỢP NĂNG LỰC SỐ VÀO DẠY HỌC:
                    1. Phát triển toàn diện năng lực số cho học sinh nhằm đáp ứng yêu cầu chuyển đổi số quốc gia và hội nhập quốc tế.
                    2. Tích hợp linh hoạt vào kế hoạch bài dạy các môn học và hoạt động giáo dục theo từng cấp học (Tiểu học, THCS, THPT, GDTX); không tạo áp lực quá tải cho người học.
                    3. Đối chiếu 6 miền năng lực số và bảng mã chỉ báo chuẩn (Phụ lục 1) để xác định mục tiêu và thiết kế hoạt động học tập ứng dụng công nghệ.
                    
                    II. 6 MIỀN NĂNG LỰC SỐ CỐT LÕI (BẮT BUỘC ĐỐI CHIẾU):
                    1. Miền 1: Vận hành thiết bị và phần mềm
                       - Thao tác an toàn các thiết bị số cá nhân và học đường (máy tính, máy tính bảng, điện thoại, bảng tương tác thông minh).
                       - Cài đặt, cập nhật, khởi chạy phần mềm văn phòng, ứng dụng học tập, trình duyệt web, nền tảng học trực tuyến.
                       - Nhận diện và tự xử lý các sự cố kỹ thuật thông thường (kết nối mạng, âm thanh, trình chiếu).
                    2. Miền 2: Khai thác thông tin và dữ liệu
                       - Xây dựng từ khóa tìm kiếm chính xác, tra cứu dữ liệu học tập có mục đích trên Internet.
                       - Đánh giá độ tin cậy, tính xác thực và nguồn gốc dữ liệu số; phân biệt thông tin chính thống và tin sai lệch/tin giả.
                       - Quản lý, phân loại, sắp xếp và sao lưu dữ liệu học tập an toàn trên thiết bị và dịch vụ lưu trữ đám mây.
                    3. Miền 3: Giao tiếp và hợp tác trong môi trường số
                       - Sử dụng các kênh số để tương tác học tập (Email, phòng học trực tuyến, hệ thống LMS, diễn đàn học tập).
                       - Tuân thủ quy tắc ứng xử văn hóa trực tuyến (Netiquette), giữ chuẩn mực đạo đức, tôn trọng người khác khi giao tiếp số.
                       - Làm việc nhóm trực tuyến, cùng biên soạn văn bản/bảng tính, chia sẻ tài nguyên số hợp pháp.
                    4. Miền 4: Sáng tạo nội dung số
                       - Biên tập, tạo mới các sản phẩm học tập đa phương tiện (văn bản tài liệu, slide thuyết trình, sơ đồ tư duy, video clip, đồ họa số).
                       - Hiểu và tuân thủ bản quyền tác giả kỹ thuật số, trích dẫn nguồn học liệu chuẩn xác khi tái sử dụng nội dung số.
                       - Ứng dụng lập trình cơ bản và công cụ số để mô phỏng, tự động hóa nhiệm vụ học tập.
                    5. Miền 5: An toàn trong môi trường số
                       - Bảo vệ thiết bị trước virus, mã độc; thiết lập mật khẩu mạnh và xác thực đa yếu tố.
                       - Bảo vệ thông tin bí mật cá nhân và quyền riêng tư; không tùy tiện chia sẻ dữ liệu nhạy cảm trên mạng.
                       - Nhận diện và chủ động phòng chống lừa đảo trực tuyến, bắt nạt trên không gian mạng (Cyberbullying).
                       - Bảo vệ sức khỏe thể chất (tư thế ngồi đúng, khoảng cách mắt) và tâm lý; cân bằng thời lượng sử dụng thiết bị số.
                    6. Miền 6: Giải quyết vấn đề với sự hỗ trợ của công nghệ số
                       - Lựa chọn phần mềm, ứng dụng số phù hợp nhất để giải quyết yêu cầu bài toán hoặc dự án học tập.
                       - Vận dụng tư duy máy tính (Computational Thinking): Chia nhỏ bài toán, nhận diện quy luật, thiết kế thuật toán logic.
                       - Khai thác công cụ mô phỏng để phân tích dữ liệu, kiểm chứng các định luật khoa học.
                    
                    III. CÁCH THỨC TÍCH HỢP VÀO GIÁO ÁN:
                    - Đưa chỉ báo năng lực số vào Mục Mục tiêu năng lực (chung hoặc đặc thù).
                    - Bổ sung thiết bị/học liệu số vào Mục Thiết bị dạy học.
                    - Thiết kế hoạt động cho học sinh thao tác số trực tiếp trong Tiến trình dạy học.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            ),

            KnowledgeDocumentEntity(
                code = "QD_2422_BGDDT",
                title = "Quyết định 2422/QĐ-BGDĐT của Bộ GD&ĐT",
                category = KnowledgeDocumentEntity.CAT_PHAP_QUY,
                subject = "ALL",
                targetLevel = "Phổ thông",
                summary = "Khung nội dung giáo dục Trí tuệ nhân tạo (AI) cho học sinh phổ thông đại trà từ năm học 2026-2027 với 4 mạch kiến thức, 12 tiết/năm.",
                content = """
                    QUYẾT ĐỊNH SỐ 2422/QĐ-BGDĐT NGÀY 18/08/2026 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO
                    V/v Ban hành Khung nội dung giáo dục Trí tuệ nhân tạo (AI) cho học sinh phổ thông
                    (Ký bởi Thứ trưởng Bộ GD&ĐT Phạm Ngọc Thưởng; Cụ thể hóa Nghị quyết số 71-NQ/TW của Bộ Chính trị)
                    
                    I. MỤC TIÊU VÀ LỘ TRÌNH TRIỂN KHAI:
                    1. Mục tiêu: Phát triển năng lực Trí tuệ nhân tạo (AI), tư duy phản biện, kỹ năng kiểm chứng thông tin, năng lực làm chủ công nghệ, sử dụng AI an toàn, liêm chính và có trách nhiệm cho học sinh phổ thông.
                    2. Lộ trình thực hiện:
                       - Năm học 2025 - 2026: Hoàn thành thí điểm tại các trường phổ thông được lựa chọn.
                       - Từ năm học 2026 - 2027: Triển khai ĐẠI TRÀ tại tất cả các cơ sở giáo dục phổ thông trên TOÀN QUỐC.
                    3. Thời lượng quy định:
                       - Thời lượng cốt lõi: 12 tiết/lớp/năm học.
                       - Hình thức triển khai: Lồng ghép linh hoạt trong kế hoạch dạy học 2 buổi/ngày, tích hợp vào môn Tin học, Công nghệ, Hoạt động trải nghiệm, hướng nghiệp và các môn khoa học; không gây quá tải chương trình.
                    
                    II. 4 MẠCH KIẾN THỨC CỐT LÕI CỦA GIÁO DỤC AI:
                    1. Mạch 1: Tư duy lấy con người làm trung tâm (Human-Centered AI Thinking)
                       - Con người làm chủ công nghệ, AI là công cụ hỗ trợ nâng cao hiệu suất và năng lực con người; con người giữ quyền quyết định cuối cùng.
                       - Luôn duy trì tư duy phản biện: Đối chiếu, kiểm chứng nguồn tin và kết quả do AI sinh ra trước khi sử dụng.
                       - Đánh giá tác động đa chiều của AI đối với xã hội, đạo đức và cuộc sống con người.
                    2. Mạch 2: Đạo đức AI và trách nhiệm số (AI Ethics & Responsibility)
                       - Liêm chính học thuật: Tuyệt đối không sao chép nguyên văn sản phẩm của AI để nhận là của mình; tuân thủ nguyên tắc ghi nhận đóng góp khi có AI hỗ trợ.
                       - Bảo vệ quyền riêng tư và dữ liệu cá nhân: Không nhập dữ liệu mật, thông tin cá nhân định danh vào các công cụ AI công cộng.
                       - Nhận diện và cảnh giác trước tin giả tạo sinh (Deepfake), thông tin sai lệch do AI tạo ra (Hallucination), định kiến thuật toán; không sử dụng AI vào mục đích xấu.
                    3. Mạch 3: Các kỹ thuật và ứng dụng AI (AI Techniques & Applications)
                       - Nắm bắt khái niệm cơ bản: Dữ liệu huấn luyện, mô hình học máy (Machine Learning), xử lý ngôn ngữ tự nhiên (NLP), thị giác máy tính, AI tạo sinh (Generative AI).
                       - Kỹ năng ra lệnh cho AI (Prompt Engineering): Thiết lập bối cảnh rõ ràng, câu lệnh chuẩn xác, cung cấp tài liệu đối chiếu (Grounding).
                       - Ứng dụng AI vào học tập cá nhân hóa, tóm tắt kiến thức, luyện tập và phân tích dữ liệu nghiên cứu khoa học.
                    4. Mạch 4: Thiết kế hệ thống AI và định hướng nghề nghiệp (AI Systems Design)
                       - Trải nghiệm quy trình xây dựng ứng dụng AI đơn giản: Thu thập dữ liệu mẫu -> Huấn luyện -> Đánh giá mô hình -> Ứng dụng.
                       - Vận dụng AI giải quyết bài toán thực tế (bảo vệ môi trường, học tập thông minh, năng lượng sạch).
                       - Hướng nghiệp thời đại AI: Nhận diện cơ hội nghề nghiệp số, rèn luyện kỹ năng thích ứng với chuyển đổi nghề nghiệp.
                    
                    III. PHÂN KỲ THEO CẤP HỌC:
                    - Tiểu học: Làm quen khái niệm AI qua trợ lý thông minh, hình thành ý thức sử dụng thiết bị an toàn.
                    - THCS: Hiểu nguyên lý AI học từ dữ liệu, trải nghiệm ứng dụng AI hỗ trợ học tập, rèn luyện đạo đức AI.
                    - THPT: Nắm vững kỹ thuật Prompt Engineering nâng cao, phân tích thuật toán, phát triển giải pháp AI liên môn, định hướng nghề nghiệp tương lai.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            ),

            KnowledgeDocumentEntity(
                code = "CV_2634",
                title = "Công văn 2634/TCGDNN-ĐTCQ của Tổng cục GDNN",
                category = KnowledgeDocumentEntity.CAT_PHAP_QUY,
                subject = "ALL",
                targetLevel = "Nghề nghiệp",
                summary = "Khung Giáo án bài dạy thực hành nghề và tích hợp chuẩn Tổng cục GDNN với quy trình 4 bước xưởng, ATLĐ và 5S.",
                content = """
                    CÔNG VĂN SỐ 2634/TCGDNN-ĐTCQ CỦA TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP
                    (Vụ Đào tạo chính quy - Bộ Lao động - Thương binh và Xã hội)
                    Quy chuẩn về Hồ sơ bài giảng thực hành và tích hợp trong các cơ sở Giáo dục Nghề nghiệp (Trung cấp, Cao đẳng)
                    
                    I. MỤC TIÊU BÀI DẠY NGHỀ (3 YẾU TỐ CHUẨN ĐẦU RA):
                    1. Kiến thức: Nắm vững nguyên lý hoạt động của máy móc thiết bị, quy trình công nghệ gia công/lắp ráp, thông số kỹ thuật (vận tốc cắt, bước tiến dao, chiều sâu cắt, áp lực, dòng hàn, điện áp...), cấu tạo chi tiết máy.
                    2. Kỹ năng nghề: Thực hiện đúng tư thế và cử động thao tác chuẩn kỹ thuật; gia công đạt dung sai, kích thước và độ nhám bề mặt theo bản vẽ; sử dụng thành thạo dụng cụ đo kiểm chuyên dụng (Thước cặp, Panme, Đồng hồ so, Kính phóng hình...).
                    3. Năng lực tự chủ, kỷ luật và An toàn lao động (ATLĐ): Ý thức tuân thủ kỷ luật xưởng, bảo vệ tài sản máy móc, tiết kiệm vật tư phôi liệu, tác phong công nghiệp, chủ động xử lý sự cố kỹ thuật thông thường.
                    
                    II. ĐIỀU KIỆN THỰC HIỆN BÀI DẠY (XƯỞNG THỰC HÀNH):
                    1. Thiết bị, máy móc: Máy công cụ vận hành tốt, công tắc khẩn cấp (E-Stop) hoạt động chuẩn xác, nguồn điện ổn định, đủ dầu mỡ bôi trơn làm mát.
                    2. Vật tư, phôi mẫu: Đúng mác vật liệu (Thép C45, Nhôm A6061, Phôi nhựa...), đủ số lượng cho từng học viên, bản vẽ kỹ thuật tỷ lệ chuẩn.
                    3. Trang bị BHLĐ cá nhân: Quần áo BHLĐ cài cúc gọn gàng, giày bảo hộ mũi lót thép chống đinh, kính bảo hộ mắt chống phoi kim loại bắn, nút bịt tai chống ồn (nếu ở khu vực máy dập/mài).
                    
                    III. TIẾN TRÌNH 4 BƯỚC THỰC HÀNH TẠI XƯỞNG (QUY CHUẨN THỜI GIAN):
                    1. Bước 1: Hướng dẫn ban đầu & Phổ biến ATLĐ xưởng (~10% thời lượng bài)
                       - Kiểm tra sĩ số, trang phục BHLĐ.
                       - Phổ biến mục tiêu, yêu cầu kỹ thuật của bài thực hành.
                       - Cảnh báo các nguy cơ tai nạn đặc thù (kẹp phoi, văng chi tiết, điện giật, dầu trơn trượt).
                    2. Bước 2: Hướng dẫn thường xuyên & Thao tác mẫu của Giáo viên (~15% thời lượng bài)
                       - GV làm mẫu quy trình 3 lần: Lần 1 tốc độ sản xuất bình thường; Lần 2 làm chậm từng cử động kèm giải thích lý do; Lần 3 nhấn mạnh các sai hỏng nguy hiểm và biện pháp phòng ngừa.
                       - Gọi 1-2 học sinh lên làm thử để kiểm tra mức độ nắm bắt và chỉnh sửa ngay cử động tay sai.
                    3. Bước 3: Học sinh phân nhóm luyện tập tại máy & GV giám sát uốn nắn (~65% thời lượng bài)
                       - Học sinh về vị trí máy được phân công, kiểm tra máy trước khi bật nguồn.
                       - Tiến hành gia công phôi mẫu theo phiếu hướng dẫn công nghệ.
                       - GV liên tục tuần tra kiểm tra, giám sát an toàn 100%, kịp thời uốn nắn thao tác cầm dao, tư thế đứng, dừng máy trước khi đo kiểm.
                    4. Bước 4: Hướng dẫn kết thúc, Đánh giá sản phẩm & Thu dọn 5S (~10% thời lượng bài)
                       - Tổ chức nghiệm thu sản phẩm của học sinh, đối chiếu kích thước trên bản vẽ kỹ thuật.
                       - Nhận xét ưu/nhược điểm buổi thực hành, đánh giá tay nghề từng học viên.
                       - Giám sát thực hiện nghiêm ngặt quy trình 5S: Ngắt cầu dao điện tổng, lau chùi máy, thu dọn phoi vụn, xếp dụng cụ đo về tủ khóa, quét dọn xưởng sạch sẽ.
                        
                    QUY TẮC ATLĐ SỐNG CÒN TRONG XƯỞNG:
                    - TUYỆT ĐỐI KHÔNG ĐEO GĂNG TAY khi vận hành các loại máy có trục quay (Máy tiện, máy phay, máy khoan, máy mài) để tránh bị cuốn tay vào trục máy.
                    - Bắt buộc phải đội mũ bảo hộ gom gọn tóc dài; tháo bỏ đồng hồ, dây chuyền kim loại trước khi vào máy.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            ),

            KnowledgeDocumentEntity(
                code = "TT_22_BGDDT",
                title = "Thông tư 22/2021/TT-BGDĐT của Bộ GD&ĐT",
                category = KnowledgeDocumentEntity.CAT_PHAP_QUY,
                subject = "ALL",
                targetLevel = "ALL",
                summary = "Định nghĩa pháp lý và chuẩn ma trận kiểm tra đánh giá 4 mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng và Vận dụng cao.",
                content = """
                    THÔNG TƯ SỐ 22/2021/TT-BGDĐT NGÀY 20/07/2021 CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO
                    V/v Quy định về đánh giá học sinh trung học cơ sở và trung học phổ thông
                    
                    I. ĐỊNH NGHĨA CHUẨN XÁC 4 MỨC ĐỘ NHẬN THỨC THEO BỘ GD&ĐT:
                    1. Mức độ 1: Nhận biết (Recognition) - Chiếm ~40% đề kiểm tra
                       - Học sinh nhận ra, nhớ lại, tái hiện hoặc nêu được các khái niệm, định nghĩa, định lý, công thức, dữ liệu, sự kiện cơ bản đã học.
                       - Động từ hành động đặc trưng: Nêu được, kể tên, nhận biết, chỉ ra, viết lại, xác định, liệt kê.
                       - Câu hỏi kiểm tra trực tiếp kiến thức đã học, không đòi hỏi biến đổi hay suy luận phức tạp.
                    2. Mức độ 2: Thông hiểu (Comprehension) - Chiếm ~30% đề kiểm tra
                       - Học sinh hiểu được ý nghĩa, bản chất của kiến thức; biết diễn đạt lại theo cách của mình; phân biệt, so sánh, giải thích mối quan hệ nhân quả.
                       - Động từ hành động đặc trưng: Giải thích được, phân biệt, so sánh, tóm tắt, minh họa, làm rõ bản chất, phân loại.
                       - Câu hỏi yêu cầu học sinh lý giải "Tại sao?", "Vì sao?", "Điểm khác biệt là gì?".
                    3. Mức độ 3: Vận dụng (Application) - Chiếm ~20% đề kiểm tra
                       - Học sinh biết áp dụng kiến thức, quy tắc, công thức đã học để giải quyết các vấn đề, bài toán hoặc tình huống quen thuộc tương tự.
                       - Động từ hành động đặc trưng: Vận dụng, tính toán, giải quyết, thực hiện quy trình, xác định kết quả trong điều kiện cụ thể.
                       - Yêu cầu học sinh xử lý được bài tập có kết hợp 2-3 bước tính toán hoặc quy trình công nghệ chuẩn.
                    4. Mức độ 4: Vận dụng cao (Advanced Application / Synthesis) - Chiếm ~10% đề kiểm tra
                       - Học sinh biết tổng hợp kiến thức liên môn, phân tích sâu, đánh giá và sáng tạo giải pháp để xử lý các vấn đề mới, tình huống thực tế phức tạp.
                       - Động từ hành động đặc trưng: Đề xuất giải pháp, tối ưu hóa, đánh giá phê phán, thiết kế quy trình cải tiến, dự đoán xu hướng.
                       - Câu hỏi mang tính phân hóa sâu sắc, phát hiện học sinh có tư duy phản biện và năng lực xuất sắc.
                        
                    II. NGUYÊN TẮC BIÊN SOẠN CÂU HỎI TRẮC NGHIỆM KHÁCH QUAN:
                    - Mỗi câu hỏi chỉ đo lường một mục tiêu nhận thức xác định.
                    - Phần dẫn phải rõ ràng, không dùng cấu trúc phủ định kép.
                    - Các phương án nhiễu phải có tính hợp lý, bắt nguồn từ các lỗi sai hoặc ngộ nhận điển hình của học sinh.
                    - Luôn có đáp án đúng duy nhất kèm lời giải thích sư phạm cặn kẽ để phục vụ ôn tập.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            ),

            KnowledgeDocumentEntity(
                code = "QUY_CHUAN_5S_ATLD",
                title = "Quy Chuẩn An Toàn Lao Động & Tiêu Chuẩn Vệ Sinh Công Nghiệp 5S",
                category = KnowledgeDocumentEntity.CAT_QUY_CHUAN_XUONG,
                subject = "ALL",
                targetLevel = "Nghề nghiệp",
                summary = "Quy định bắt buộc về phương pháp 5S (Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng) và an toàn phòng chống cháy nổ xưởng.",
                content = """
                    TIÊU CHUẨN 5S VÀ AN TOÀN VỆ SINH LAO ĐỘNG TRONG MÔI TRƯỜNG ĐÀO TẠO KỸ THUẬT
                    
                    I. 5 BƯỚC TIÊU CHUẨN 5S TẠI XƯỞNG THỰC HÀNH:
                    1. Seiri (Sàng lọc): Tách biệt vật dụng cần thiết và không cần thiết. Loại bỏ phôi thừa, phoi rác, đồ gá hỏng khỏi bàn máy.
                    2. Seiton (Sắp xếp): Đặt mọi dụng cụ đúng vị trí quy định có dán nhãn; dao cụ, thước cặp, cờ lê để ngăn nắp theo nguyên tắc 'Dễ tìm - Dễ thấy - Dễ lấy - Dễ trả'.
                    3. Seiso (Sạch sẽ): Lau chùi dầu mỡ bôi trơn rớt trên sàn, quét dọn phoi kim loại sau mỗi ca học, bảo dưỡng máy sạch bóng.
                    4. Seiketsu (Săn sóc): Duy trì và chuẩn hóa 3 chữ S đầu tiên thành nội quy thường xuyên mỗi ngày.
                    5. Shitsuke (Sẵn sàng): Hình thành thói quen kỷ luật tự giác tuân thủ 100% nội quy xưởng cho học sinh/sinh viên.
                    
                    II. QUY ĐỊNH AN TOÀN PHÒNG CHÁY CHỮA CHÁY (PCCC):
                    - Nghiêm cấm hút thuốc, sử dụng lửa hở trong khu vực kho vật tư và xưởng gia công.
                    - Bình cứu hỏa khí CO2 và bình bọt phải được đặt tại nơi dễ tiếp cận, kiểm tra áp suất định kỳ.
                    - Cuối mỗi buổi thực hành, giáo viên cùng ban cán sự lớp phải kiểm tra ngắt toàn bộ cầu dao điện trước khi đóng cửa xưởng.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            ),

            KnowledgeDocumentEntity(
                code = "SGV_CN10_GDPT",
                title = "SGV - Công nghệ 10 - Công nghệ và Đời sống (GDPT 2018)",
                category = KnowledgeDocumentEntity.CAT_GIAO_TRINH,
                subject = "Công nghệ",
                targetLevel = "Lớp 10",
                summary = "Sách giáo viên Công nghệ 10 - Chương I Khái quát về công nghệ: Bài 1 Công nghệ và đời sống (Khái niệm KH-KT-CN, vai trò và tác động của công nghệ).",
                content = """
                    SÁCH GIÁO VIÊN CÔNG NGHỆ 10 - THIẾT KẾ VÀ CÔNG NGHỆ (CHƯƠNG TRÌNH GDPT 2018)
                    BỘ GIÁO DỤC VÀ ĐÀO TẠO
                    
                    CHƯƠNG I: KHÁI QUÁT VỀ CÔNG NGHỆ
                    BÀI 1: CÔNG NGHỆ VÀ ĐỜI SỐNG (Thời lượng: 2 tiết)
                    
                    I. MỤC TIÊU BÀI HỌC (CHUẨN CV 5512):
                    1. Kiến thức:
                    - Nêu được khái niệm khoa học, kỹ thuật, công nghệ và phân tích được mối quan hệ biện chứng giữa chúng.
                    - Trình bày và làm rõ vai trò, tác động đa diện của công nghệ đối với đời sống con người, sự phát triển kinh tế, xã hội và bảo vệ môi trường.
                    - Nhận biết và kể tên được một số lĩnh vực công nghệ phổ biến trong đời sống và sản xuất hiện đại (công nghệ cơ khí, điện - điện tử, công nghệ thông tin và truyền thông, tự động hóa, công nghệ sinh học).
                    
                    2. Năng lực:
                    - Năng lực nhận thức công nghệ: Phân biệt chính xác khoa học, kỹ thuật và công nghệ thông qua các ví dụ trực quan trong thực tiễn đời sống.
                    - Năng lực giao tiếp công nghệ: Sử dụng đúng thuật ngữ công nghệ khi thảo luận nhóm và trình bày báo cáo.
                    - Năng lực sử dụng công nghệ: Nhận thức mặt tích cực và tác động tiêu cực tiềm ẩn của công nghệ; có thói quen lựa chọn sản phẩm an toàn, tiết kiệm điện năng.
                    - Năng lực số: Vận dụng công cụ tìm kiếm trên mạng để tra cứu tư liệu, hình ảnh về các thành tựu công nghệ tiêu biểu làm thay đổi thế giới.
                    
                    3. Phẩm chất:
                    - Chăm chỉ: Tích cực nghiên cứu SGK, chủ động chuẩn bị bài và tìm tòi khám phá tri thức mới.
                    - Trách nhiệm: Có ý thức sử dụng công nghệ an toàn, tiết kiệm và thân thiện với môi trường.
                    
                    II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU SỐ:
                    - Giáo viên: Kế hoạch bài dạy, slide trình chiếu đa phương tiện (PowerPoint), video ngắn giới thiệu về các cuộc cách mạng công nghiệp; phiếu học tập số 1 và số 2.
                    - Học sinh: SGK Công nghệ 10, vở ghi, dụng cụ học tập.
                    
                    III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN CV 5512):
                    1. Hoạt động 1: Mở đầu / Khởi động (Xác định vấn đề)
                    - Mục tiêu: Tạo tình huống nhận thức khơi gợi hứng thú tìm hiểu vai trò của công nghệ trong cuộc sống.
                    - Nội dung: Chiếu hình ảnh so sánh cuộc sống xưa và nay; đặt câu hỏi gợi mở về vai trò của máy móc và công nghệ.
                    
                    2. Hoạt động 2: Hình thành kiến thức mới
                    - Khái niệm: Khoa học là hệ thống tri thức về tự nhiên, xã hội; Kỹ thuật là ứng dụng tri thức khoa học để thiết kế công trình, máy móc; Công nghệ là giải pháp, quy trình và thiết bị kỹ thuật để tạo ra sản phẩm.
                    - Mối quan hệ: Khoa học là nền tảng cho kỹ thuật và công nghệ; công nghệ tạo ra công cụ hỗ trợ khoa học.
                    - Vai trò: Tăng năng suất lao động, nâng cao chất lượng cuộc sống, thúc đẩy kinh tế.
                    
                    3. Hoạt động 3: Luyện tập
                    - Bài tập phân biệt các hiện tượng thuộc Khoa học, Kỹ thuật hay Công nghệ.
                    
                    4. Hoạt động 4: Vận dụng
                    - Khảo sát các thiết bị công nghệ tiêu thụ điện trong gia đình và đề xuất giải pháp sử dụng tiết kiệm năng lượng.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            )
        )
    }
}
