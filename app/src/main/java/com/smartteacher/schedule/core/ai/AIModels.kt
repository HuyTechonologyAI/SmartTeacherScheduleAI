package com.smartteacher.schedule.core.ai

import com.smartteacher.schedule.core.model.RiskLevel

data class ScheduleParseResult(
    val title: String,
    val subject: String,
    val className: String,
    val classCode: String = "",
    val dayOfWeek: Int = 1,
    val date: String? = null,
    val startTime: String,
    val endTime: String,
    val room: String = "",
    val notes: String = "",
    val confidence: Float = 0.9f
)

data class DailyBriefingResult(
    val greeting: String,
    val summary: String,
    val upcomingClassesSummary: String,
    val warnings: List<String>,
    val recommendations: List<String>
)

data class WeeklyAnalysisResult(
    val totalTeachingSessions: Int,
    val totalHours: Float,
    val incompleteTasksCount: Int,
    val backToBackWarnings: List<String>,
    val missingPreparationWarnings: List<String>,
    val keyPriorities: List<String>,
    val suggestions: List<String>
)

data class ScheduleRisk(
    val title: String,
    val description: String,
    val riskLevel: RiskLevel,
    val relatedEventId: Long? = null,
    val relatedTaskId: Long? = null
)

// =========================================================================
// TRỤ CỘT 2: GIÁO ÁN KẾ HOẠCH BÀI DẠY CHUẨN CÔNG VĂN 5512 & 2634 VÀ ĐỀ THI
// =========================================================================

/**
 * Cấu trúc 4 hoạt động bắt buộc theo Công văn 5512/BGDĐT-GDTrH
 */
data class Activity5512(
    val title: String, // VD: "Hoạt động 1: Mở đầu / Khởi động"
    val durationMinutes: Int = 7,
    val objective: String, // a) Mục tiêu
    val content: String, // b) Nội dung
    val product: String, // c) Sản phẩm
    val implementation: String // d) Tổ chức thực hiện
)

/**
 * Kế hoạch bài dạy chuẩn Công văn 5512/BGDĐT-GDTrH (THCS, THPT, GDTX)
 */
data class LessonPlan5512Result(
    val lessonName: String,
    val subject: String,
    val grade: String,
    val durationPeriods: Int = 1,
    val knowledgeObjective: String,
    val generalCompetence: String,
    val specificCompetence: String,
    val qualitiesObjective: String,
    val teacherEquipment: String,
    val studentEquipment: String,
    val activities: List<Activity5512>,
    val referenceCitations: String = "Công văn 5512/BGDĐT-GDTrH của Bộ GD&ĐT; Chương trình Giáo dục Phổ thông 2018"
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>")
        sb.append("body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.5; color: #000; padding: 20px; }")
        sb.append("h1, h2, h3 { text-align: center; margin: 5px 0; }")
        sb.append("h1 { font-size: 16pt; font-weight: bold; text-transform: uppercase; }")
        sb.append("h2 { font-size: 14pt; font-weight: bold; }")
        sb.append("h3 { font-size: 13pt; font-style: italic; }")
        sb.append(".header-table { width: 100%; border: none; margin-bottom: 20px; }")
        sb.append(".header-table td { border: none; vertical-align: top; }")
        sb.append(".section-title { font-weight: bold; text-transform: uppercase; margin-top: 15px; }")
        sb.append(".activity-box { border: 1px solid #333; padding: 12px; margin: 10px 0; border-radius: 4px; background: #fafafa; }")
        sb.append(".citation-box { background-color: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 6px; padding: 10px 14px; margin: 15px 0; font-size: 11pt; color: #166534; }")
        sb.append("</style></head><body>")

        sb.append("<table class='header-table'><tr>")
        sb.append("<td style='width: 45%; text-align: center;'>TRƯỜNG: ....................................<br>TỔ BỘ MÔN: ...............................</td>")
        sb.append("<td style='width: 55%; text-align: center;'><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><u>Độc lập - Tự do - Hạnh phúc</u></td>")
        sb.append("</tr></table>")

        sb.append("<h1>KẾ HOẠCH BÀI DẠY (GIÁO ÁN CHUẨN CV 5512)</h1>")
        sb.append("<h2>MÔN: ${subject.uppercase()} - KHỐI/LỚP: $grade</h2>")
        sb.append("<h3>Tên bài dạy: $lessonName (Thời lượng: $durationPeriods tiết)</h3>")

        if (referenceCitations.isNotBlank()) {
            sb.append("<div class='citation-box'>")
            sb.append("<b>🛡️ CĂN CỨ PHÁP LÝ & TƯ LIỆU ĐỐI CHIẾU CHUẨN (KHÔNG ẢO GIÁC/BỊA ĐẶT):</b><br>")
            sb.append(referenceCitations.replace("\n", "<br>"))
            sb.append("</div>")
        }

        sb.append("<div class='section-title'>I. MỤC TIÊU BÀI HỌC</div>")
        sb.append("<p><b>1. Về kiến thức:</b> $knowledgeObjective</p>")
        sb.append("<p><b>2. Về năng lực:</b><br>")
        sb.append("• <i>Năng lực chung:</i> $generalCompetence<br>")
        sb.append("• <i>Năng lực đặc thù:</i> $specificCompetence</p>")
        sb.append("<p><b>3. Về phẩm chất:</b> $qualitiesObjective</p>")

        sb.append("<div class='section-title'>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</div>")
        sb.append("<p><b>1. Giáo viên:</b> $teacherEquipment</p>")
        sb.append("<p><b>2. Học sinh:</b> $studentEquipment</p>")

        sb.append("<div class='section-title'>III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHUẨN)</div>")
        activities.forEachIndexed { idx, act ->
            sb.append("<div class='activity-box'>")
            sb.append("<h4 style='margin: 0 0 8px 0; color: #003399;'>${act.title} (${act.durationMinutes} phút)</h4>")
            sb.append("<p><b>a) Mục tiêu:</b> ${act.objective}</p>")
            sb.append("<p><b>b) Nội dung:</b> ${act.content}</p>")
            sb.append("<p><b>c) Sản phẩm học tập:</b> ${act.product}</p>")
            sb.append("<p><b>d) Tổ chức thực hiện:</b><br>${act.implementation.replace("\n", "<br>")}</p>")
            sb.append("</div>")
        }

        sb.append("<br><table style='width: 100%; border: none; text-align: center; margin-top: 30px;'><tr>")
        sb.append("<td style='width: 50%;'><b>XÁC NHẬN CỦA TỔ CHUYÊN MÔN</b><br><br><br><br>................................................</td>")
        sb.append("<td style='width: 50%;'><i>Ngày ..... tháng ..... năm 2026</i><br><b>GIÁO VIÊN SOẠN BÀI</b><br><br><br><br>................................................</td>")
        sb.append("</tr></table>")

        sb.append("</body></html>")
        return sb.toString()
    }
}

/**
 * Cấu trúc các bước tích hợp/thực hành xưởng theo Công văn 2634/GDNN
 */
data class Step2634(
    val stepName: String, // 1. Ổn định lớp & An toàn, 2. Hướng dẫn ban đầu, 3. Hướng dẫn thường xuyên, 4. Hướng dẫn kết thúc
    val durationMinutes: Int,
    val teacherActivity: String,
    val studentActivity: String,
    val notesAndSafety: String
)

/**
 * Kế hoạch bài giảng chuẩn Công văn 2634/GDNN (Giáo dục Nghề nghiệp, Trung cấp, Cao đẳng)
 */
data class LessonPlan2634Result(
    val moduleName: String,
    val lessonName: String,
    val profession: String,
    val trainingLevel: String = "Trung cấp",
    val durationHours: Float = 4.0f,
    val knowledgeObjective: String,
    val skillObjective: String,
    val autonomyAndResponsibility: String,
    val machineryAndEquipment: String,
    val materialsAndDrawings: String,
    val safetyGear: String,
    val steps: List<Step2634>,
    val referenceCitations: String = "Công văn 2634/GDNN của Tổng cục GDNN; Tiêu chuẩn An toàn xưởng và 5S"
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>")
        sb.append("body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000; padding: 20px; }")
        sb.append("h1, h2, h3 { text-align: center; margin: 4px 0; }")
        sb.append("h1 { font-size: 15pt; font-weight: bold; text-transform: uppercase; }")
        sb.append(".header-table { width: 100%; border: none; margin-bottom: 15px; }")
        sb.append(".header-table td { border: none; vertical-align: top; }")
        sb.append(".step-table { width: 100%; border-collapse: collapse; margin-top: 10px; }")
        sb.append(".step-table th, .step-table td { border: 1px solid #000; padding: 8px; font-size: 12pt; }")
        sb.append(".step-table th { background-color: #f2f2f2; text-align: center; }")
        sb.append(".citation-box { background-color: #fefce8; border: 1.5px solid #ca8a04; border-radius: 6px; padding: 10px 14px; margin: 15px 0; font-size: 11pt; color: #854d0e; }")
        sb.append("</style></head><body>")

        sb.append("<table class='header-table'><tr>")
        sb.append("<td style='width: 45%; text-align: center;'>KHOA: CƠ KHÍ - ĐỘNG LỰC<br>TỔ BỘ MÔN: THỰC HÀNH CÔNG NGHỆ</td>")
        sb.append("<td style='width: 55%; text-align: center;'><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><u>Độc lập - Tự do - Hạnh phúc</u></td>")
        sb.append("</tr></table>")

        sb.append("<h1>GIÁO ÁN TÍCH HỢP / THỰC HÀNH (CHUẨN CÔNG VĂN 2634/GDNN)</h1>")
        sb.append("<h2 style='text-align: center;'>MODULE/MÔN: ${moduleName.uppercase()}</h2>")
        sb.append("<h3 style='text-align: center;'>Bài học: $lessonName</h3>")
        sb.append("<p style='text-align: center;'><i>Nghề: $profession • Trình độ: $trainingLevel • Thời lượng: $durationHours giờ</i></p>")

        if (referenceCitations.isNotBlank()) {
            sb.append("<div class='citation-box'>")
            sb.append("<b>🛡️ CĂN CỨ VĂN BẢN & TIÊU CHUẨN XƯỞNG ĐỐI CHIẾU (KHÔNG ẢO GIÁC/BỊA ĐẶT):</b><br>")
            sb.append(referenceCitations.replace("\n", "<br>"))
            sb.append("</div>")
        }

        sb.append("<p><b>I. MỤC TIÊU BÀI HỌC:</b></p>")
        sb.append("<p><b>1. Kiến thức:</b> $knowledgeObjective</p>")
        sb.append("<p><b>2. Kỹ năng nghề:</b> $skillObjective</p>")
        sb.append("<p><b>3. Năng lực tự chủ và trách nhiệm:</b> $autonomyAndResponsibility</p>")

        sb.append("<p><b>II. ĐIỀU KIỆN THỰC HIỆN BÀI HỌC:</b></p>")
        sb.append("<p>• <b>Máy móc, thiết bị xưởng:</b> $machineryAndEquipment</p>")
        sb.append("<p>• <b>Phôi mẫu, dụng cụ cắt & bản vẽ:</b> $materialsAndDrawings</p>")
        sb.append("<p>• <b>Trang bị bảo hộ lao động (BHLĐ):</b> $safetyGear</p>")

        sb.append("<p><b>III. TIẾN TRÌNH THỰC HIỆN BÀI HỌC:</b></p>")
        sb.append("<table class='step-table'>")
        sb.append("<tr><th style='width: 20%;'>Các bước thực hiện</th><th style='width: 8%;'>Thời gian</th><th style='width: 36%;'>Hoạt động của Giáo viên</th><th style='width: 36%;'>Hoạt động của Học sinh / Sinh viên</th></tr>")

        steps.forEach { st ->
            sb.append("<tr>")
            sb.append("<td><b>${st.stepName}</b><br><small style='color: red;'>⚠️ ${st.notesAndSafety}</small></td>")
            sb.append("<td style='text-align: center;'>${st.durationMinutes}p</td>")
            sb.append("<td>${st.teacherActivity.replace("\n", "<br>")}</td>")
            sb.append("<td>${st.studentActivity.replace("\n", "<br>")}</td>")
            sb.append("</tr>")
        }
        sb.append("</table>")

        sb.append("<br><table style='width: 100%; border: none; text-align: center; margin-top: 25px;'><tr>")
        sb.append("<td style='width: 50%;'><b>TRƯỞNG KHOA / TỔ TRƯỞNG DUYỆT</b><br><br><br><br>................................................</td>")
        sb.append("<td style='width: 50%;'><i>Ngày ..... tháng ..... năm 2026</i><br><b>GIÁO VIÊN SOẠN GIÁO ÁN</b><br><br><br><br>................................................</td>")
        sb.append("</tr></table>")

        sb.append("</body></html>")
        return sb.toString()
    }
}

/**
 * Mục câu hỏi kiểm tra phân loại theo 4 mức độ nhận thức của Bộ GD&ĐT
 */
data class ExamQuestionItem(
    val questionNumber: Int,
    val level: String, // "Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"
    val questionText: String,
    val options: List<String> = emptyList(), // A, B, C, D
    val correctAnswer: String,
    val explanation: String
)

/**
 * Ma trận đề thi và ngân hàng câu hỏi chuẩn Bộ GD&ĐT
 */
data class ExamMatrixResult(
    val examTitle: String,
    val subject: String,
    val gradeOrClass: String,
    val durationMinutes: Int = 45,
    val recognitionCount: Int, // Nhận biết
    val understandingCount: Int, // Thông hiểu
    val applicationCount: Int, // Vận dụng
    val highApplicationCount: Int, // Vận dụng cao
    val questions: List<ExamQuestionItem>,
    val referenceCitations: String = "Thông tư 22/2021/TT-BGDĐT; Khung ma trận 4 mức độ nhận thức của Bộ GD&ĐT"
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><style>")
        sb.append("body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; color: #000; padding: 20px; }")
        sb.append("h1, h2, h3 { text-align: center; margin: 4px 0; }")
        sb.append(".header-table { width: 100%; border: none; margin-bottom: 15px; }")
        sb.append(".matrix-table { width: 100%; border-collapse: collapse; margin: 15px 0; }")
        sb.append(".matrix-table th, .matrix-table td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 11pt; }")
        sb.append(".matrix-table th { background: #eee; }")
        sb.append(".citation-box { background-color: #faf5ff; border: 1.5px solid #9333ea; border-radius: 6px; padding: 10px 14px; margin: 15px 0; font-size: 11pt; color: #6b21a8; }")
        sb.append(".q-level { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10pt; font-weight: bold; }")
        sb.append(".lv-nb { background: #e3f2fd; color: #0d47a1; }")
        sb.append(".lv-th { background: #e8f5e9; color: #1b5e20; }")
        sb.append(".lv-vd { background: #fff3e0; color: #e65100; }")
        sb.append(".lv-vdc { background: #fce4ec; color: #880e4f; }")
        sb.append("</style></head><body>")

        sb.append("<table class='header-table'><tr>")
        sb.append("<td style='width: 45%; text-align: center;'>TRƯỜNG: ....................................<br>TỔ BỘ MÔN: ...............................</td>")
        sb.append("<td style='width: 55%; text-align: center;'><b>ĐỀ KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ</b><br>MÔN: ${subject.uppercase()} - LỚP: $gradeOrClass<br><i>Thời gian làm bài: $durationMinutes phút</i></td>")
        sb.append("</tr></table>")

        sb.append("<h2 style='text-align: center; text-transform: uppercase;'>$examTitle</h2>")

        if (referenceCitations.isNotBlank()) {
            sb.append("<div class='citation-box'>")
            sb.append("<b>🛡️ CĂN CỨ THÔNG TƯ & MA TRẬN ĐỐI CHIẾU CHUẨN (KHÔNG ẢO GIÁC):</b><br>")
            sb.append(referenceCitations.replace("\n", "<br>"))
            sb.append("</div>")
        }

        sb.append("<h3>I. MA TRẬN ĐỀ THI THEO 4 MỨC ĐỘ NHẬN THỨC</h3>")
        sb.append("<table class='matrix-table'>")
        sb.append("<tr><th>Mức độ</th><th>Số câu</th><th>Tỉ lệ %</th><th>Ghi chú</th></tr>")
        val totalQ = recognitionCount + understandingCount + applicationCount + highApplicationCount
        val safeTotal = if (totalQ == 0) 1 else totalQ
        sb.append("<tr><td>Mức 1: Nhận biết</td><td>$recognitionCount</td><td>${recognitionCount * 100 / safeTotal}%</td><td>Nhớ kiến thức, công thức</td></tr>")
        sb.append("<tr><td>Mức 2: Thông hiểu</td><td>$understandingCount</td><td>${understandingCount * 100 / safeTotal}%</td><td>Giải thích, so sánh nguyên lý</td></tr>")
        sb.append("<tr><td>Mức 3: Vận dụng</td><td>$applicationCount</td><td>${applicationCount * 100 / safeTotal}%</td><td>Tính toán, giải bài toán cụ thể</td></tr>")
        sb.append("<tr><td>Mức 4: Vận dụng cao</td><td>$highApplicationCount</td><td>${highApplicationCount * 100 / safeTotal}%</td><td>Ứng dụng thực tiễn, phân tích lỗi</td></tr>")
        sb.append("<tr><th>TỔNG CỘNG</th><th>$totalQ câu</th><th>100%</th><th>Phân hóa toàn diện</th></tr>")
        sb.append("</table>")

        sb.append("<h3>II. NỘI DUNG CÂU HỎI ĐỀ THI</h3>")
        questions.forEach { q ->
            val lvClass = when (q.level) {
                "Nhận biết" -> "lv-nb"
                "Thông hiểu" -> "lv-th"
                "Vận dụng" -> "lv-vd"
                else -> "lv-vdc"
            }
            sb.append("<div style='margin-bottom: 15px;'>")
            sb.append("<p><b>Câu ${q.questionNumber}</b> <span class='q-level $lvClass'>[${q.level}]</span>: ${q.questionText}</p>")
            if (q.options.isNotEmpty()) {
                sb.append("<div style='margin-left: 20px;'>")
                q.options.forEach { opt -> sb.append("<p style='margin: 4px 0;'>$opt</p>") }
                sb.append("</div>")
            }
            sb.append("<p style='margin-left: 20px; color: #006600;'><b>✓ Đáp án đúng:</b> ${q.correctAnswer}</p>")
            sb.append("<p style='margin-left: 20px; color: #555; font-style: italic;'><b>Hướng dẫn giải:</b> ${q.explanation}</p>")
            sb.append("</div>")
        }

        sb.append("</body></html>")
        return sb.toString()
    }
}

// ==========================================
// TRỤ CỘT 3: GÓI HỌC LIỆU 6-IN-1 CHO CA DẠY
// ==========================================

data class SlideItem(
    val slideNumber: Int,
    val title: String,
    val bulletPoints: List<String>,
    val visualHint: String = "",
    val teacherScript: String = ""
)

data class LessonSlideDeck(
    val lessonTitle: String,
    val subject: String,
    val targetClass: String,
    val slides: List<SlideItem>
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>")
        sb.append("<style>")
        sb.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; margin: 0; }")
        sb.append(".slide-card { background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }")
        sb.append(".slide-num { display: inline-block; background: #3b82f6; color: #fff; font-weight: bold; font-size: 12px; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px; }")
        sb.append(".slide-title { font-size: 20px; font-weight: bold; color: #60a5fa; margin: 0 0 16px 0; border-bottom: 2px solid #334155; padding-bottom: 8px; }")
        sb.append(".bullet-list { list-style-type: none; padding-left: 0; }")
        sb.append(".bullet-list li { margin: 10px 0; font-size: 15px; line-height: 1.5; padding-left: 24px; position: relative; color: #e2e8f0; }")
        sb.append(".bullet-list li::before { content: '✦'; position: absolute; left: 0; color: #38bdf8; font-size: 14px; }")
        sb.append(".note-box { background: rgba(59, 130, 246, 0.1); border-left: 4px solid #38bdf8; padding: 10px 14px; border-radius: 4px; font-size: 13px; color: #94a3b8; margin-top: 14px; }")
        sb.append(".script-box { background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; font-size: 13px; color: #6ee7b7; margin-top: 10px; }")
        sb.append("</style></head><body>")
        sb.append("<h2 style='text-align:center; color: #38bdf8; margin-bottom: 4px;'>BỘ SLIDE THUYẾT TRÌNH BÀI DẠY</h2>")
        sb.append("<p style='text-align:center; color: #94a3b8; margin-top:0;'>Bài học: ${lessonTitle} | Môn: ${subject} - Lớp: ${targetClass}</p>")
        
        slides.forEach { s ->
            sb.append("<div class='slide-card'>")
            sb.append("<span class='slide-num'>SLIDE ${s.slideNumber}/${slides.size}</span>")
            sb.append("<h3 class='slide-title'>${s.title}</h3>")
            sb.append("<ul class='bullet-list'>")
            s.bulletPoints.forEach { pt -> sb.append("<li>${pt}</li>") }
            sb.append("</ul>")
            if (s.visualHint.isNotBlank()) {
                sb.append("<div class='note-box'><b>🖼️ Gợi ý hình ảnh/trực quan:</b> ${s.visualHint}</div>")
            }
            if (s.teacherScript.isNotBlank()) {
                sb.append("<div class='script-box'><b>🎙️ Lời thoại gợi ý của giáo viên:</b> ${s.teacherScript}</div>")
            }
            sb.append("</div>")
        }
        sb.append("</body></html>")
        return sb.toString()
    }
}

data class MiniGameQuestion(
    val id: Int,
    val question: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)

data class LessonMiniGame(
    val gameTitle: String,
    val gameType: String = "QUIZ_FAST",
    val rules: String = "Trả lời nhanh trong 15 giây mỗi câu, chọn đáp án chính xác nhất để ghi điểm xuất sắc.",
    val questions: List<MiniGameQuestion>
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>")
        sb.append("<style>")
        sb.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #faf5ff; color: #1e1b4b; padding: 20px; }")
        sb.append(".game-header { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); }")
        sb.append(".q-box { background: #fff; border: 2px solid #e9d5ff; border-radius: 12px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }")
        sb.append(".q-title { font-weight: bold; font-size: 16px; color: #581c87; margin-bottom: 12px; }")
        sb.append(".opt { background: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: 8px; padding: 10px 14px; margin: 6px 0; font-size: 14px; }")
        sb.append(".opt.correct { background: #dcfce7; border-color: #22c55e; color: #15803d; font-weight: bold; }")
        sb.append(".rule-box { background: #fdf4ff; border-left: 4px solid #c026d3; padding: 12px; border-radius: 6px; font-size: 13px; color: #701a75; margin-bottom: 20px; }")
        sb.append("</style></head><body>")
        sb.append("<div class='game-header'>")
        sb.append("<h2>🎮 ${gameTitle}</h2>")
        sb.append("<p style='margin:0; opacity: 0.9;'>Mini Game Khởi động & Củng cố kiến thức tương tác</p>")
        sb.append("</div>")
        sb.append("<div class='rule-box'><b>⚡ Luật chơi:</b> ${rules}</div>")

        questions.forEachIndexed { idx, q ->
            sb.append("<div class='q-box'>")
            sb.append("<div class='q-title'>Câu ${idx + 1}: ${q.question}</div>")
            q.options.forEachIndexed { oIdx, opt ->
                val isCorrect = oIdx == q.correctIndex
                val optCls = if (isCorrect) "opt correct" else "opt"
                val prefix = listOf("A", "B", "C", "D").getOrElse(oIdx) { "${oIdx + 1}" }
                val mark = if (isCorrect) " ✓ [ĐÁP ÁN ĐÚNG]" else ""
                sb.append("<div class='${optCls}'><b>${prefix}.</b> ${opt}${mark}</div>")
            }
            if (q.explanation.isNotBlank()) {
                sb.append("<p style='font-size: 12px; color: #64748b; margin-top: 8px; font-style: italic;'>💡 Giải thích: ${q.explanation}</p>")
            }
            sb.append("</div>")
        }
        sb.append("</body></html>")
        return sb.toString()
    }
}

data class MindmapBranch(
    val title: String,
    val subItems: List<String>
)

data class LessonMindmap(
    val centerNode: String,
    val branches: List<MindmapBranch>
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>")
        sb.append("<style>")
        sb.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #0f172a; padding: 20px; }")
        sb.append(".center-box { background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; padding: 18px 24px; border-radius: 16px; text-align: center; font-size: 20px; font-weight: bold; margin: 10px auto 30px auto; max-width: 450px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); }")
        sb.append(".branches-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }")
        sb.append(".branch-card { background: #fff; border: 1.5px solid #e2e8f0; border-top: 4px solid #0284c7; border-radius: 10px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }")
        sb.append(".branch-title { font-size: 16px; font-weight: bold; color: #0369a1; margin-top: 0; margin-bottom: 10px; }")
        sb.append(".sub-list { list-style: none; padding-left: 0; margin: 0; }")
        sb.append(".sub-list li { padding: 6px 0 6px 20px; position: relative; font-size: 14px; border-bottom: 1px dashed #f1f5f9; color: #334155; }")
        sb.append(".sub-list li::before { content: '↳'; position: absolute; left: 0; color: #0ea5e9; font-weight: bold; }")
        sb.append("</style></head><body>")
        sb.append("<h3 style='text-align:center; color: #64748b; margin-bottom: 8px;'>SƠ ĐỒ TƯ DUY KIẾN THỨC BÀI DẠY (MINDMAP)</h3>")
        sb.append("<div class='center-box'>🧠 ${centerNode}</div>")
        sb.append("<div class='branches-grid'>")
        branches.forEach { br ->
            sb.append("<div class='branch-card'>")
            sb.append("<h4 class='branch-title'>🌿 ${br.title}</h4>")
            sb.append("<ul class='sub-list'>")
            br.subItems.forEach { item -> sb.append("<li>${item}</li>") }
            sb.append("</ul>")
            sb.append("</div>")
        }
        sb.append("</div>")
        sb.append("</body></html>")
        return sb.toString()
    }
}

data class VideoLinkItem(
    val title: String,
    val suggestedUrlOrKeyword: String,
    val durationApprox: String,
    val guideQuestion: String
)

data class LessonVideoResource(
    val lessonTitle: String,
    val videos: List<VideoLinkItem>
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>")
        sb.append("<style>")
        sb.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff5f5; color: #2d3748; padding: 20px; }")
        sb.append(".video-card { background: #fff; border: 1.5px solid #fed7d7; border-radius: 12px; padding: 18px; margin-bottom: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }")
        sb.append(".video-title { font-size: 16px; font-weight: bold; color: #c53030; margin-top: 0; margin-bottom: 8px; }")
        sb.append(".tag { display: inline-block; background: #feebc8; color: #c05621; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 12px; margin-bottom: 8px; }")
        sb.append(".search-box { background: #edf2f7; padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #2b6cb0; word-break: break-all; margin: 8px 0; }")
        sb.append(".guide { background: #ebf8ff; border-left: 3px solid #3182ce; padding: 8px 12px; border-radius: 4px; font-size: 13px; color: #2c5282; margin-top: 8px; }")
        sb.append("</style></head><body>")
        sb.append("<h2 style='text-align:center; color: #e53e3e;'>🎬 KHO VIDEO HỌC LIỆU & HƯỚNG DẪN TRỰC QUAN</h2>")
        sb.append("<p style='text-align:center; color: #718096; margin-top: 0;'>Bài học: ${lessonTitle}</p>")
        videos.forEachIndexed { idx, v ->
            sb.append("<div class='video-card'>")
            sb.append("<span class='tag'>⏱️ Thời lượng: ${v.durationApprox}</span>")
            sb.append("<h3 class='video-title'>Video ${idx + 1}: ${v.title}</h3>")
            sb.append("<div class='search-box'>🔍 Từ khóa/Link: ${v.suggestedUrlOrKeyword}</div>")
            if (v.guideQuestion.isNotBlank()) {
                sb.append("<div class='guide'><b>❓ Câu hỏi định hướng khi cho HS xem:</b> ${v.guideQuestion}</div>")
            }
            sb.append("</div>")
        }
        sb.append("</body></html>")
        return sb.toString()
    }
}

data class RubricCriterion(
    val standardName: String,
    val maxScore: Int,
    val selfScore: Int,
    val description: String,
    val strengths: String,
    val suggestions: String
)

data class LessonRubricScore(
    val lessonTitle: String,
    val totalScore: Int,
    val gradeLevel: String,
    val criteria: List<RubricCriterion>,
    val generalConclusion: String
) {
    fun toHtmlDocument(): String {
        val sb = StringBuilder()
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>")
        sb.append("<style>")
        sb.append("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0fdf4; color: #14532d; padding: 20px; }")
        sb.append(".header-score { background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); }")
        sb.append(".score-big { font-size: 42px; font-weight: 900; margin: 6px 0; }")
        sb.append(".rubric-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; }")
        sb.append(".rubric-table th, .rubric-table td { border: 1px solid #bbf7d0; padding: 10px 12px; font-size: 13px; vertical-align: top; }")
        sb.append(".rubric-table th { background: #dcfce7; color: #166534; font-weight: bold; }")
        sb.append(".conclusion-card { background: #fff; border: 2px solid #86efac; border-radius: 12px; padding: 18px; }")
        sb.append("</style></head><body>")
        sb.append("<div class='header-score'>")
        sb.append("<h2 style='margin:0;'>📋 KẾT QUẢ ĐÁNH GIÁ & CHẤM ĐIỂM GIÁO ÁN</h2>")
        sb.append("<p style='margin: 4px 0 0 0; opacity: 0.9;'>Bài học: ${lessonTitle} (Theo chuẩn Công văn 5512/BGDĐT)</p>")
        sb.append("<div class='score-big'>${totalScore}/100</div>")
        sb.append("<div style='font-size: 18px; font-weight: bold; background: rgba(255,255,255,0.2); display: inline-block; padding: 4px 16px; border-radius: 20px;'>XẾP LOẠI: ${gradeLevel.uppercase()}</div>")
        sb.append("</div>")

        sb.append("<table class='rubric-table'>")
        sb.append("<tr><th style='width: 30%;'>Tiêu chí đánh giá</th><th style='width: 15%; text-align:center;'>Điểm đạt</th><th style='width: 25%;'>Ưu điểm nổi bật</th><th style='width: 30%;'>Gợi ý cải tiến</th></tr>")
        criteria.forEach { c ->
            sb.append("<tr>")
            sb.append("<td><b>${c.standardName}</b><br><small style='color: #4b5563;'>${c.description}</small></td>")
            sb.append("<td style='text-align:center; font-weight: bold; font-size: 15px; color: #15803d;'>${c.selfScore}/${c.maxScore}</td>")
            sb.append("<td style='color: #166534;'>${c.strengths}</td>")
            sb.append("<td style='color: #854d0e;'>${c.suggestions}</td>")
            sb.append("</tr>")
        }
        sb.append("</table>")

        sb.append("<div class='conclusion-card'>")
        sb.append("<h3 style='color: #15803d; margin-top: 0;'>🎖️ Nhận xét & Kết luận Sư phạm</h3>")
        sb.append("<p style='line-height: 1.5; color: #1f2937;'>${generalConclusion}</p>")
        sb.append("</div>")
        sb.append("</body></html>")
        return sb.toString()
    }
}

/**
 * Gói học liệu hoàn chỉnh 6 thành phần của 1 tiết dạy
 */
data class LessonTeachingPack(
    val lessonPlanName: String,
    val lessonPlanHtml: String,
    val slides: LessonSlideDeck,
    val miniGame: LessonMiniGame,
    val mindmap: LessonMindmap,
    val videoResource: LessonVideoResource,
    val rubricScore: LessonRubricScore
)

