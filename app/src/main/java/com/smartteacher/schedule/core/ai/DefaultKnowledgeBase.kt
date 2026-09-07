package com.smartteacher.schedule.core.ai

import com.smartteacher.schedule.core.database.entity.KnowledgeDocumentEntity

/**
 * Kho dữ liệu văn bản pháp quy và tiêu chuẩn sư phạm cốt lõi tích hợp sẵn,
 * làm nền tảng đối chiếu (Grounding) tuyệt đối cho AI để chống ảo giác / bịa đặt.
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
                    
                    I. QUY ĐỊNH VỀ MỤC TIÊU KẾ HOẠCH BÀI DẠY (GIÁO ÁN):
                    1. Kiến thức: Nêu cụ thể nội dung kiến thức, khái niệm, định lý, quy luật mà học sinh cần tiếp thu, phát hiện hoặc vận dụng trong bài học theo Chương trình GDPT 2018.
                    2. Năng lực:
                       - Năng lực chung: Năng lực tự chủ và tự học (chủ động khám phá, chuẩn bị bài); Năng lực giao tiếp và hợp tác (thảo luận nhóm, phản biện); Năng lực giải quyết vấn đề và sáng tạo.
                       - Năng lực đặc thù môn học: Ngôn ngữ, tính toán, khoa học, thẩm mỹ, công nghệ tùy theo từng môn học.
                    3. Phẩm chất: Yêu nước, nhân ái, chăm chỉ (có ý thức vượt khó hoàn thành nhiệm vụ), trung thực (trong học tập và báo cáo kết quả), trách nhiệm (với bản thân, nhóm và cộng đồng).
                    
                    II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
                    - Giáo viên: Kế hoạch bài dạy, bài giảng điện tử, máy chiếu/ti vi, thiết bị thí nghiệm, tranh ảnh, mô hình trực quan, phiếu học tập.
                    - Học sinh: Sách giáo khoa, vở ghi, dụng cụ học tập theo môn học, bảng phụ hoạt động nhóm.
                    
                    III. TIẾN TRÌNH DẠY HỌC - 4 HOẠT ĐỘNG BẮT BUỘC:
                    1. Hoạt động 1: Xác định vấn đề / Nhiệm vụ học tập / Mở đầu (Khởi động)
                       - Mục tiêu: Kích hoạt kiến thức nền tảng, tạo mâu thuẫn nhận thức hoặc hứng thú tiếp nhận bài mới.
                       - Nội dung: Câu hỏi, bài tập, tình huống thực tế hoặc trò chơi gợi mở.
                       - Sản phẩm: Câu trả lời, ý kiến phán đoán ban đầu của học sinh.
                       - Tổ chức thực hiện: 4 bước (Chuyển giao nhiệm vụ -> HS thực hiện -> Báo cáo thảo luận -> GV kết luận, dẫn vào bài mới).
                    2. Hoạt động 2: Hình thành kiến thức mới (Giải quyết vấn đề / Khám phá)
                       - Mục tiêu: Giúp học sinh chiếm lĩnh được kiến thức trọng tâm của bài.
                       - Nội dung: Hoạt động đọc tài liệu, khai thác kênh hình, làm thí nghiệm, thảo luận nhóm theo phiếu học tập.
                       - Sản phẩm: Kết quả ghi bảng, phiếu trả lời của các nhóm học sinh.
                       - Tổ chức thực hiện: 4 bước chi tiết, phân rõ vai trò chủ động của học sinh, GV làm người hướng dẫn, chuẩn hóa kiến thức.
                    3. Hoạt động 3: Luyện tập
                       - Mục tiêu: Khắc sâu, củng cố và rèn luyện kỹ năng thực hành kiến thức vừa học.
                       - Nội dung: Hệ thống bài tập trắc nghiệm và tự luận từ cơ bản đến thông hiểu.
                       - Sản phẩm: Lời giải chính xác trong vở hoặc trên bảng của học sinh.
                       - Tổ chức thực hiện: Giao bài, HS làm bài cá nhân/cặp đôi, chữa bài và sửa lỗi sai điển hình.
                    4. Hoạt động 4: Vận dụng
                       - Mục tiêu: Phát triển năng lực vận dụng kiến thức vào thực tiễn đời sống, phát triển tư duy sáng tạo mở rộng.
                       - Nội dung: Tình huống thực tế, nhiệm vụ nghiên cứu nhỏ tại gia đình/địa phương.
                       - Sản phẩm: Bản báo cáo, mô hình, poster hoặc bài thu hoạch của học sinh nộp vào tiết học sau.
                       - Tổ chức thực hiện: GV giao nhiệm vụ rõ ràng về tiêu chí và hạn nộp, HS thực hiện ngoài giờ lên lớp.
                       
                    NGHIÊM CẤM: Tuyệt đối không biến kế hoạch bài dạy thành kịch bản hỏi - đáp máy móc giữa giáo viên và học sinh. Mọi hoạt động phải hướng vào sự chủ động của người học.
                """.trimIndent(),
                isBuiltIn = true,
                isActive = true,
                createdAt = now,
                updatedAt = now
            ),

            KnowledgeDocumentEntity(
                code = "CV_2634",
                title = "Công văn 2634/GDNN của Tổng cục Giáo dục Nghề nghiệp",
                category = KnowledgeDocumentEntity.CAT_PHAP_QUY,
                subject = "ALL",
                targetLevel = "Nghề nghiệp",
                summary = "Khung Giáo án bài dạy thực hành nghề và tích hợp chuẩn Tổng cục GDNN với quy trình 4 bước xưởng, ATLĐ và 5S.",
                content = """
                    CÔNG VĂN SỐ 2634/GDNN CỦA TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP
                    Quy chuẩn về Hồ sơ bài giảng thực hành và tích hợp trong các cơ sở Giáo dục Nghề nghiệp (Trung cấp, Cao đẳng)
                    
                    I. MỤC TIÊU BÀI DẠY NGHỀ:
                    1. Kiến thức: Nắm vững nguyên lý hoạt động của máy móc, quy trình công nghệ gia công/lắp ráp, thông số kỹ thuật (vận tốc cắt, bước tiến dao, áp lực, điện áp...), cấu tạo chi tiết máy.
                    2. Kỹ năng nghề: Thực hiện đúng tư thế thao tác chuẩn kỹ thuật; gia công đạt dung sai, kích thước và độ nhám bề mặt theo bản vẽ; sử dụng thành thạo dụng cụ đo kiểm chuyên dụng (Thước cặp cơ/điện tử, Panme, Đồng hồ so, Kính phóng hình...).
                    3. Năng lực tự chủ, kỷ luật và An toàn lao động (ATLĐ): Ý thức tuân thủ kỷ luật xưởng, bảo vệ tài sản máy móc, tiết kiệm vật tư phôi liệu, chủ động xử lý sự cố kỹ thuật thông thường.
                    
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
                title = "Thông tư 22/2021/TT-BGDĐT & Chuẩn Ma Trận 4 Mức Độ Nhận Thức",
                category = KnowledgeDocumentEntity.CAT_PHAP_QUY,
                subject = "ALL",
                targetLevel = "ALL",
                summary = "Định nghĩa pháp lý và chuẩn ma trận kiểm tra đánh giá 4 mức độ nhận thức: Nhận biết, Thông hiểu, Vận dụng và Vận dụng cao.",
                content = """
                    THÔNG TƯ SỐ 22/2021/TT-BGDĐT CỦA BỘ GIÁO DỤC VÀ ĐÀO TẠO
                    Quy định về đánh giá học sinh trung học cơ sở và trung học phổ thông
                    
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
            )
        )
    }
}
