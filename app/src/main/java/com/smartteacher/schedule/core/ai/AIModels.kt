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
    val activities: List<Activity5512>
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
        sb.append("</style></head><body>")

        sb.append("<table class='header-table'><tr>")
        sb.append("<td style='width: 45%; text-align: center;'>TRƯỜNG: ....................................<br>TỔ BỘ MÔN: ...............................</td>")
        sb.append("<td style='width: 55%; text-align: center;'><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><u>Độc lập - Tự do - Hạnh phúc</u></td>")
        sb.append("</tr></table>")

        sb.append("<h1>KẾ HOẠCH BÀI DẠY (GIÁO ÁN CHUẨN CV 5512)</h1>")
        sb.append("<h2>MÔN: ${subject.uppercase()} - KHỐI/LỚP: $grade</h2>")
        sb.append("<h3>Tên bài dạy: $lessonName (Thời lượng: $durationPeriods tiết)</h3>")

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
    val steps: List<Step2634>
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
        sb.append("</style></head><body>")

        sb.append("<table class='header-table'><tr>")
        sb.append("<td style='width: 45%; text-align: center;'>KHOA: CƠ KHÍ - ĐỘNG LỰC<br>TỔ BỘ MÔN: THỰC HÀNH CÔNG NGHỆ</td>")
        sb.append("<td style='width: 55%; text-align: center;'><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><u>Độc lập - Tự do - Hạnh phúc</u></td>")
        sb.append("</tr></table>")

        sb.append("<h1>GIÁO ÁN TÍCH HỢP / THỰC HÀNH (CHUẨN CÔNG VĂN 2634/GDNN)</h1>")
        sb.append("<h2 style='text-align: center;'>MODULE/MÔN: ${moduleName.uppercase()}</h2>")
        sb.append("<h3 style='text-align: center;'>Bài học: $lessonName</h3>")
        sb.append("<p style='text-align: center;'><i>Nghề: $profession • Trình độ: $trainingLevel • Thời lượng: $durationHours giờ</i></p>")

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
    val questions: List<ExamQuestionItem>
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

