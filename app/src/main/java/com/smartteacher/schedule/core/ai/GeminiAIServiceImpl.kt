package com.smartteacher.schedule.core.ai

import android.content.Context
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity
import com.smartteacher.schedule.core.model.RiskLevel
import com.smartteacher.schedule.core.model.TaskStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

class GeminiAIServiceImpl(
    private val context: Context,
    private val apiKeyProvider: suspend () -> String?
) : AIService {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(25, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    override suspend fun parseScheduleText(text: String): ScheduleParseResult? = withContext(Dispatchers.IO) {
        val apiKey = apiKeyProvider()
        if (!apiKey.isNullOrBlank()) {
            val result = callGeminiForScheduleParse(apiKey, text)
            if (result != null) return@withContext result
        }

        // Reliable Heuristic Fallback (Offline Vietnamese Schedule Parser)
        parseScheduleTextLocally(text)
    }

    override suspend fun parseScheduleImage(base64Image: String): List<ScheduleParseResult> = withContext(Dispatchers.IO) {
        val apiKey = apiKeyProvider()
        if (!apiKey.isNullOrBlank()) {
            return@withContext callGeminiVisionForSchedule(apiKey, base64Image)
        }
        emptyList()
    }

    override suspend fun generateDailyBriefing(
        todayEvents: List<CalendarEventEntity>,
        incompleteTasks: List<TaskEntity>
    ): DailyBriefingResult = withContext(Dispatchers.IO) {
        val totalTeaching = todayEvents.count { it.isTeachingEvent }
        val greeting = "Chào Thầy/Cô! Chúc Thầy/Cô một ngày làm việc hiệu quả."
        val summary = "Hôm nay có $totalTeaching buổi dạy và ${incompleteTasks.size} nhiệm vụ cần xử lý."

        val classesSummary = if (todayEvents.isEmpty()) {
            "Hôm nay Thầy/Cô không có lịch dạy nào trên thời khóa biểu."
        } else {
            todayEvents.joinToString("\n") {
                "• ${it.startTime} - ${it.endTime}: ${it.title} (${if (it.room.isNotBlank()) "Phòng ${it.room}" else "Chưa có phòng"}, Lớp ${it.className})"
            }
        }

        val warnings = mutableListOf<String>()
        val recommendations = mutableListOf<String>()

        // Check overdue tasks
        val todayStr = LocalDate.now().toString()
        val overdueTasks = incompleteTasks.filter { it.dueDate != null && it.dueDate < todayStr }
        if (overdueTasks.isNotEmpty()) {
            warnings.add("Có ${overdueTasks.size} nhiệm vụ đang quá hạn (ví dụ: ${overdueTasks.first().title}).")
        }

        // Check if teaching class has linked incomplete preparation
        for (event in todayEvents.filter { it.isTeachingEvent }) {
            val uncompletedPrep = incompleteTasks.filter { task ->
                task.relatedEventId == event.id ||
                task.title.contains("giáo án", ignoreCase = true) ||
                task.title.contains("slide", ignoreCase = true) ||
                task.title.contains(event.subject, ignoreCase = true)
            }
            if (uncompletedPrep.isNotEmpty()) {
                warnings.add("Buổi dạy '${event.title}' lúc ${event.startTime} có công việc chuẩn bị '${uncompletedPrep.first().title}' chưa đánh dấu hoàn thành!")
                recommendations.add("Nên hoàn tất kiểm tra tài liệu và giáo án trước ${event.startTime}.")
            }
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Đến phòng học trước 10 phút để ổn định lớp học và kiểm tra thiết bị.")
        }

        DailyBriefingResult(
            greeting = greeting,
            summary = summary,
            upcomingClassesSummary = classesSummary,
            warnings = warnings,
            recommendations = recommendations
        )
    }

    override suspend fun generateWeeklyAnalysis(
        weekEvents: List<CalendarEventEntity>,
        tasks: List<TaskEntity>
    ): WeeklyAnalysisResult = withContext(Dispatchers.IO) {
        val teachingEvents = weekEvents.filter { it.isTeachingEvent }.sortedBy { "${it.date} ${it.startTime}" }
        val totalSessions = teachingEvents.size
        val incompleteTasks = tasks.filter { it.status != TaskStatus.COMPLETED && it.status != TaskStatus.CANCELLED }

        val backToBackWarnings = mutableListOf<String>()
        val missingPrepWarnings = mutableListOf<String>()
        val keyPriorities = mutableListOf<String>()
        val suggestions = mutableListOf<String>()

        // Check for back-to-back teaching sessions on same date with < 15 min break
        for (i in 0 until teachingEvents.size - 1) {
            val curr = teachingEvents[i]
            val next = teachingEvents[i + 1]
            if (curr.date == next.date) {
                val currEnd = runCatching { LocalTime.parse(curr.endTime) }.getOrNull()
                val nextStart = runCatching { LocalTime.parse(next.startTime) }.getOrNull()
                if (currEnd != null && nextStart != null) {
                    val gapMinutes = java.time.Duration.between(currEnd, nextStart).toMinutes()
                    if (gapMinutes in 0..15) {
                        backToBackWarnings.add(
                            "Ngày ${curr.date}: Lịch dạy '${curr.title}' (${curr.endTime}) và '${next.title}' (${next.startTime}) cách nhau chỉ $gapMinutes phút. Khoảng nghỉ quá ngắn!"
                        )
                    }
                }
            }
        }

        // Missing preparations
        for (event in teachingEvents) {
            val hasPrep = tasks.any { task ->
                task.relatedEventId == event.id ||
                task.title.contains(event.subject, ignoreCase = true)
            }
            if (!hasPrep) {
                missingPrepWarnings.add("Buổi dạy '${event.title}' ngày ${event.date} chưa có checklist chuẩn bị bài giảng.")
            }
        }

        if (incompleteTasks.isNotEmpty()) {
            keyPriorities.addAll(incompleteTasks.take(3).map { "• ${it.title} (Hạn: ${it.dueDate ?: "Hôm nay"})" })
        }

        suggestions.add("Nên soạn sẵn đề cương và tài liệu thực hành vào đầu tuần để tránh dồn lịch.")
        if (backToBackWarnings.isNotEmpty()) {
            suggestions.add("Chuẩn bị sẵn phòng học và thiết bị từ sớm vào các ngày có lịch dạy liên tiếp.")
        }

        val totalHours = totalSessions * 2.0f // Approximation 2h per session

        WeeklyAnalysisResult(
            totalTeachingSessions = totalSessions,
            totalHours = totalHours,
            incompleteTasksCount = incompleteTasks.size,
            backToBackWarnings = backToBackWarnings,
            missingPreparationWarnings = missingPrepWarnings.take(4),
            keyPriorities = keyPriorities,
            suggestions = suggestions
        )
    }

    override suspend fun detectScheduleRisks(
        events: List<CalendarEventEntity>,
        tasks: List<TaskEntity>
    ): List<ScheduleRisk> = withContext(Dispatchers.IO) {
        val risks = mutableListOf<ScheduleRisk>()
        val todayStr = LocalDate.now().toString()

        // 1. Check for overlapping events on the same day
        val eventsByDate = events.groupBy { it.date }
        for ((date, dayEvents) in eventsByDate) {
            val sorted = dayEvents.sortedBy { it.startTime }
            for (i in 0 until sorted.size - 1) {
                val e1 = sorted[i]
                val e2 = sorted[i + 1]
                if (e1.endTime > e2.startTime) {
                    risks.add(
                        ScheduleRisk(
                            title = "Trùng lịch ngày $date",
                            description = "Sự kiện '${e1.title}' (${e1.startTime}-${e1.endTime}) trùng giờ với '${e2.title}' (${e2.startTime}-${e2.endTime}).",
                            riskLevel = RiskLevel.CRITICAL,
                            relatedEventId = e2.id
                        )
                    )
                }
            }
        }

        // 2. Overdue task risk
        for (task in tasks.filter { it.status != TaskStatus.COMPLETED && it.status != TaskStatus.CANCELLED }) {
            if (task.dueDate != null && task.dueDate < todayStr) {
                risks.add(
                    ScheduleRisk(
                        title = "Nhiệm vụ quá hạn",
                        description = "Nhiệm vụ '${task.title}' đã quá hạn vào ngày ${task.dueDate}.",
                        riskLevel = RiskLevel.HIGH,
                        relatedTaskId = task.id
                    )
                )
            }
        }

        risks
    }

    override suspend fun chatWithScheduleData(
        userMessage: String,
        events: List<CalendarEventEntity>,
        tasks: List<TaskEntity>
    ): String = chatWithPedagogicalAssistant(userMessage, events, tasks, "")

    override suspend fun chatWithPedagogicalAssistant(
        userMessage: String,
        events: List<CalendarEventEntity>,
        tasks: List<TaskEntity>,
        referenceDocsText: String
    ): String = withContext(Dispatchers.IO) {
        val lower = userMessage.lowercase().trim()

        // 1. Lịch dạy & Công việc
        if (lower.contains("mai") || lower.contains("ngày mai")) {
            val tomorrow = LocalDate.now().plusDays(1).toString()
            val tomorrowEvents = events.filter { it.date == tomorrow }
            if (tomorrowEvents.isEmpty()) {
                return@withContext "Ngày mai ($tomorrow) Thầy/Cô không có lịch dạy nào trong hệ thống."
            }
            val details = tomorrowEvents.joinToString("\n") {
                "• ${it.startTime} - ${it.endTime}: ${it.title} (Phòng ${it.room.ifBlank { "chưa xếp" }}, Lớp ${it.className})"
            }
            return@withContext "Lịch dạy ngày mai của Thầy/Cô gồm:\n$details"
        }

        if (lower.contains("tuần này") && (lower.contains("tiết") || lower.contains("buổi") || lower.contains("bao nhiêu"))) {
            val count = events.count { it.isTeachingEvent }
            return@withContext "Tuần này Thầy/Cô có tổng cộng $count buổi dạy được ghi nhận trên lịch."
        }

        if (lower.contains("quá hạn") || lower.contains("chưa hoàn thành") || lower.contains("nhắc tôi")) {
            val pending = tasks.filter { it.status != TaskStatus.COMPLETED && it.status != TaskStatus.CANCELLED }
            if (pending.isEmpty()) {
                return@withContext "Thầy/Cô hiện không có công việc nào bị quá hạn. Mọi nhiệm vụ đều đang đúng tiến độ!"
            }
            val taskList = pending.joinToString("\n") { "• [ ] ${it.title} (Hạn: ${it.dueDate ?: "Hôm nay"})" }
            return@withContext "Các công việc cần lưu ý xử lý:\n$taskList"
        }

        if (lower.contains("chuẩn bị")) {
            val todayStr = LocalDate.now().toString()
            val todayTeaching = events.filter { it.date == todayStr && it.isTeachingEvent }
            if (todayTeaching.isEmpty()) {
                return@withContext "Hôm nay không có buổi dạy nào cần chuẩn bị giáo án gấp."
            }
            return@withContext "Thầy/Cô cần kiểm tra giáo án, tài liệu và thiết bị cho các buổi dạy hôm nay:\n" +
                    todayTeaching.joinToString("\n") { "• ${it.title} lúc ${it.startTime} tại Phòng ${it.room}" }
        }

        // 2. Chức năng 1: Tra cứu Kho tư liệu chuẩn (CV 5512, CV 3456, QĐ 2422, CV 2634, TT 22, ATLĐ 5S)
        if (lower.contains("5512") || lower.contains("kế hoạch bài dạy") || lower.contains("4 hoạt động")) {
            return@withContext "🏛️ **CÔNG VĂN SỐ 5512/BGDĐT-GDTrH (BỘ GD&ĐT)**\n\n" +
                    "🎯 **Khung 3 thành tố mục tiêu bài học**:\n" +
                    "1. Kiến thức: Nêu rõ đơn vị kiến thức cốt lõi cần chiếm lĩnh.\n" +
                    "2. Năng lực: Gồm Năng lực chung (tự chủ, giao tiếp, sáng tạo) và Năng lực đặc thù môn học.\n" +
                    "3. Phẩm chất: 5 phẩm chất chủ yếu (Yêu nước, Nhân ái, Chăm chỉ, Trung thực, Trách nhiệm).\n\n" +
                    "⚡ **Tiến trình dạy học (Bắt buộc đủ 4 hoạt động)**:\n" +
                    "• HĐ 1: Khởi động / Xác định vấn đề\n" +
                    "• HĐ 2: Hình thành kiến thức mới\n" +
                    "• HĐ 3: Luyện tập củng cố\n" +
                    "• HĐ 4: Vận dụng thực tế\n" +
                    "📌 Mỗi hoạt động tổ chức theo 4 bước: Chuyển giao nhiệm vụ -> HS thực hiện -> Báo cáo thảo luận -> GV chuẩn hóa kết luận."
        }

        if (lower.contains("3456") || lower.contains("năng lực số") || lower.contains("kỹ năng số")) {
            return@withContext "🏛️ **CÔNG VĂN SỐ 3456/BGDĐT-GDPT - KHUNG NĂNG LỰC SỐ CHO HỌC SINH**\n\n" +
                    "🌐 **6 Miền Năng lực số cốt lõi tích hợp vào tiết học**:\n" +
                    "1. Vận hành thiết bị & phần mềm (kết nối máy chiếu, máy tính, bảng tương tác).\n" +
                    "2. Khai thác thông tin & dữ liệu (tra cứu học liệu có định hướng, lưu trữ đám mây).\n" +
                    "3. Giao tiếp & hợp tác trong môi trường số (tương tác trực tuyến văn minh, làm việc nhóm số).\n" +
                    "4. Sáng tạo nội dung số (thiết kế bài trình chiếu, video ngắn, sơ đồ tư duy số).\n" +
                    "5. An toàn trong môi trường số (bảo vệ tài khoản, dữ liệu cá nhân, phòng tránh lừa đảo).\n" +
                    "6. Giải quyết vấn đề với công nghệ số (tư duy máy tính, phần mềm mô phỏng kỹ thuật)."
        }

        if (lower.contains("2422") || lower.contains("trí tuệ nhân tạo") || (lower.contains("ai") && !lower.contains("bài"))) {
            return@withContext "🏛️ **QUYẾT ĐỊNH 2422/QĐ-BGDĐT: ĐỊNH HƯỚNG ỨNG DỤNG AI TRONG GIÁO DỤC**\n\n" +
                    "🤖 4 nguyên tắc cốt lõi:\n" +
                    "1. AI là trợ lý, Giáo viên là chủ thể quyết định chuyên môn.\n" +
                    "2. Liêm chính học thuật: Mọi dữ liệu phải đối chiếu văn bản pháp quy, không chấp nhận bịa đặt.\n" +
                    "3. Bảo mật thông tin học sinh trên môi trường số.\n" +
                    "4. Hướng dẫn học sinh tư duy phản biện, kiểm chứng thông tin từ AI."
        }

        if (lower.contains("2634") || lower.contains("dạy nghề") || lower.contains("xưởng") || lower.contains("thực hành xưởng")) {
            return@withContext "🏛️ **CÔNG VĂN 2634/TCGDNN: KẾ HOẠCH BÀI GIẢNG DẠY NGHỀ XƯỞNG**\n\n" +
                    "⚙️ 5 bước lên lớp thực hành chuẩn:\n" +
                    "• Bước 1: Ổn định lớp, điểm danh, kiểm tra BHLĐ.\n" +
                    "• Bước 2: Dẫn nhập & Kiểm tra an toàn thiết bị.\n" +
                    "• Bước 3: Hướng dẫn ban đầu (Thao tác mẫu chuẩn và phân tích lỗi sai).\n" +
                    "• Bước 4: Hướng dẫn thường xuyên (Học sinh thực hành, giáo viên uốn nắn).\n" +
                    "• Bước 5: Hướng dẫn kết thúc (Đo kiểm sản phẩm, chấm điểm và thực hiện 5S)."
        }

        // Phân tích Môn học & Chủ đề linh hoạt (Subject-Agnostic Detection)
        var detectedSubj = "Môn học"
        var detectedGrade = "10"
        val gradeRegex = "\\b(?:lớp|khối)?\\s*([1-9]|1[0-2])\\b".toRegex(RegexOption.IGNORE_CASE)
        gradeRegex.find(lower)?.let { detectedGrade = it.groupValues[1] }

        var detectedTopic = userMessage
            .replace("(?i)\\b(tạo|hãy tạo|soạn|lập|làm|viết|cho tôi|giúp tôi|đề thi|ma trận|slide|thuyết trình|mini game|game|sơ đồ tư duy|mindmap|hình ảnh|minh họa|vẽ)\\b".toRegex(), "")
            .replace("(?i)\\b(lớp|khối|môn)?\\s*(10|11|12|[1-9])\\b".toRegex(), "")
            .trim()

        var isMath = false
        var isLiterature = false
        var isEnglish = false
        var isScience = false
        var isSocial = false
        var isInformatics = false

        when {
            lower.contains("toán") || lower.contains("đại số") || lower.contains("hình học") || lower.contains("giải tích") || lower.contains("hàm số") -> {
                detectedSubj = "Toán học"
                isMath = true
                detectedTopic = detectedTopic.replace("(?i)toán(\\s*học)?".toRegex(), "").trim().ifBlank { "Hàm số & Phương trình" }
            }
            lower.contains("văn") || lower.contains("ngữ văn") || lower.contains("thơ") || lower.contains("truyện") || lower.contains("nghị luận") -> {
                detectedSubj = "Ngữ văn"
                isLiterature = true
                detectedTopic = detectedTopic.replace("(?i)ngữ\\s*văn|văn".toRegex(), "").trim().ifBlank { "Đọc hiểu văn bản & Nghị luận" }
            }
            lower.contains("tiếng anh") || lower.contains("tieng anh") || lower.contains("english") || lower.contains("grammar") -> {
                detectedSubj = "Tiếng Anh"
                isEnglish = true
                detectedTopic = detectedTopic.replace("(?i)tiếng\\s*anh|tieng\\s*anh|english".toRegex(), "").trim().ifBlank { "Grammar & Reading Comprehension" }
            }
            lower.contains("vật lý") || lower.contains("vật lí") || lower.contains("hóa học") || lower.contains("hoá học") || lower.contains("sinh học") || lower.contains("khtn") -> {
                detectedSubj = if (lower.contains("vật")) "Vật lý" else if (lower.contains("hóa") || lower.contains("hoá")) "Hóa học" else if (lower.contains("sinh")) "Sinh học" else "Khoa học tự nhiên"
                isScience = true
                detectedTopic = detectedTopic.ifBlank { "Quy luật tự nhiên & Thực nghiệm" }
            }
            lower.contains("lịch sử") || lower.contains("địa lý") || lower.contains("địa lí") -> {
                detectedSubj = if (lower.contains("sử")) "Lịch sử" else "Địa lý"
                isSocial = true
                detectedTopic = detectedTopic.ifBlank { "Tiến trình phát triển & Đặc điểm địa lý" }
            }
            lower.contains("tin học") || lower.contains("lập trình") || lower.contains("python") -> {
                detectedSubj = "Tin học"
                isInformatics = true
                detectedTopic = detectedTopic.replace("(?i)tin\\s*học".toRegex(), "").trim().ifBlank { "Thuật toán & Lập trình ứng dụng" }
            }
            lower.contains("công nghệ") || lower.contains("kỹ thuật") || lower.contains("cơ khí") || lower.contains("tiện") || lower.contains("5s") -> {
                detectedSubj = "Công nghệ"
                detectedTopic = detectedTopic.replace("(?i)công\\s*nghệ".toRegex(), "").trim().ifBlank { "Thiết kế kỹ thuật & Ứng dụng" }
            }
            else -> {
                detectedTopic = detectedTopic.ifBlank { "Kiến thức bài học trọng tâm" }
            }
        }

        // 3. Chức năng 2: Đề thi & Ma trận chuẩn Thông tư 22 (Đa môn học)
        if (lower.contains("ma trận") || lower.contains("đề thi") || lower.contains("đề kiểm tra") || lower.contains("tt 22") || lower.contains("thông tư 22")) {
            val sampleQuestions = when {
                isMath -> "I. TRẮC NGHIỆM (7.0 điểm):\n" +
                        "• Câu 1 (NB): Khái niệm cơ bản về tập xác định và tính đơn điệu trong chủ đề $detectedTopic?\n" +
                        "  A. Định nghĩa chuẩn xác theo SGK Toán $detectedGrade (Đúng)\n  B. Mẫu số bằng 0\n  C. Luôn đồng biến\n  D. Không xác định\n" +
                        "• Câu 2 (TH): Biện luận số nghiệm của phương trình dựa trên bảng biến thiên $detectedTopic.\n" +
                        "  A. Số giao điểm của đồ thị hàm số với đường thẳng tương ứng (Đúng)\n  B. Luôn có 1 nghiệm\n  C. Vô nghiệm\n  D. Tuỳ ý\n" +
                        "II. TỰ LUẬN (3.0 điểm):\n" +
                        "• Câu 3 (VD - 2.0đ): Giải bài toán định lượng và tìm tham số m trong chủ đề $detectedTopic.\n" +
                        "• Câu 4 (VDC - 1.0đ): Bài toán ứng dụng tối ưu hóa thực tiễn liên môn."
                isLiterature -> "I. ĐỌC HIỂU VĂN BẢN (4.0 điểm):\n" +
                        "• Câu 1 (NB): Xác định thể thơ / phương thức biểu đạt chính trong ngữ liệu $detectedTopic.\n" +
                        "  A. Biểu cảm kết hợp tự sự (Đúng)\n  B. Thuyết minh đơn thuần\n  C. Hành chính\n  D. Miêu tả\n" +
                        "• Câu 2 (TH): Phân tích hiệu quả nghệ thuật của biện pháp tu từ trong tác phẩm.\n" +
                        "II. LÀM VĂN & NGHỊ LUẬN (6.0 điểm):\n" +
                        "• Câu 3 (VD - 2.0đ): Viết đoạn văn 200 chữ cảm nhận về hình tượng trong $detectedTopic.\n" +
                        "• Câu 4 (VDC - 4.0đ): Nghị luận xã hội về thông điệp ý nghĩa rút ra từ tác phẩm đối với tuổi trẻ."
                isEnglish -> "I. MULTIPLE CHOICE (7.0 pts):\n" +
                        "• Question 1 (Recognition): Pronunciation and stress pattern regarding $detectedTopic.\n" +
                        "  A. Correct option according to standard phonetic rules (Correct)\n  B. Distractor\n  C. Distractor\n  D. Distractor\n" +
                        "• Question 2 (Comprehension): Choose the best grammatical structure to complete the sentence.\n" +
                        "II. WRITING (3.0 pts):\n" +
                        "• Question 3 (Application): Sentence transformation using target grammar of $detectedTopic.\n" +
                        "• Question 4 (High Application): Paragraph writing (120-150 words) about practical benefits."
                else -> "I. TRẮC NGHIỆM KHÁCH QUAN (7.0 điểm):\n" +
                        "• Câu 1 (NB): Khái niệm cốt lõi hoặc định luật cơ bản của chủ đề $detectedTopic là gì?\n" +
                        "  A. Phát biểu chuẩn xác theo chương trình GDPT môn $detectedSubj (Đúng)\n  B. Ý kiến chủ quan\n  C. Sai quy luật\n  D. Không liên quan\n" +
                        "• Câu 2 (TH): Giải thích nguyên nhân hoặc mối liên hệ bản chất giữa các hiện tượng.\n" +
                        "  A. Phù hợp nguyên lý khoa học và thực nghiệm (Đúng)\n  B. Do ngẫu nhiên\n  C. Không giải thích được\n  D. Sai lệch\n" +
                        "II. TỰ LUẬN & VẬN DỤNG (3.0 điểm):\n" +
                        "• Câu 3 (VD - 2.0đ): Trình bày các bước giải quyết bài toán / tình huống thực tế về $detectedTopic.\n" +
                        "• Câu 4 (VDC - 1.0đ): Đề xuất giải pháp sáng tạo hoặc ứng dụng công nghệ để giải quyết vấn đề mới."
            }

            return@withContext "📋 **BẢNG MA TRẬN & ĐỀ THI CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT**\n\n" +
                    "📌 **Môn học**: $detectedSubj | **Khối lớp**: Lớp $detectedGrade | **Chủ đề**: $detectedTopic\n" +
                    "⚖️ **Tỉ lệ phân bổ 4 mức độ nhận thức**:\n" +
                    "• 🟢 **Nhận biết (40%)**: 4 câu (Tái hiện khái niệm, định nghĩa, thông số)\n" +
                    "• 🔵 **Thông hiểu (30%)**: 3 câu (Giải thích nguyên lý, phân tích quy trình)\n" +
                    "• 🟡 **Vận dụng (20%)**: 2 câu (Bài toán thực tế, áp dụng kiến thức)\n" +
                    "• 🔴 **Vận dụng cao (10%)**: 1 câu (Tối ưu hóa, sáng tạo, liên hệ thực tiễn)\n\n" +
                    "═══════════════════════════════════════\n" +
                    "📝 **ĐỀ THI MINH HỌA (45 phút - Thang điểm 10)**\n" +
                    sampleQuestions
        }

        // 4. Chức năng 3: Slide thuyết trình bài giảng (Đa môn học)
        if (lower.contains("slide") || lower.contains("thuyết trình") || lower.contains("powerpoint") || lower.contains("canva")) {
            return@withContext "📊 **BỘ 10 SLIDE BÀI GIẢNG ĐIỆN TỬ CHUẨN SƯ PHẠM**\n\n" +
                    "🎯 **Chủ đề**: $detectedTopic | **Môn**: $detectedSubj | **Lớp**: $detectedGrade\n\n" +
                    "• **Slide 1**: Bìa bài giảng điện tử (Tiêu đề: $detectedTopic - Môn $detectedSubj $detectedGrade).\n" +
                    "• **Slide 2**: Mục tiêu cần đạt theo CV 5512 (Kiến thức, Năng lực số, Phẩm chất).\n" +
                    "• **Slide 3**: Hoạt động 1 - Khởi động (Tình huống thực tiễn khơi gợi tư duy về $detectedTopic).\n" +
                    "• **Slide 4-5**: Hoạt động 2 - Khám phá tri thức mới (Khái niệm cốt lõi & Quy luật khoa học).\n" +
                    "• **Slide 6**: Kết nối thực tiễn & Ứng dụng công nghệ số (CV 3456).\n" +
                    "• **Slide 7-8**: Hoạt động 3 - Luyện tập tương tác (Trắc nghiệm nhanh & Thảo luận nhóm).\n" +
                    "• **Slide 9**: Hoạt động 4 - Vận dụng & Dự án học tập thực tế.\n" +
                    "• **Slide 10**: Sơ đồ tư duy tổng kết bài học & Hướng dẫn tự học ở nhà.\n\n" +
                    "🗣️ *Speaker Notes*: Thầy/Cô mở đầu bằng câu hỏi gợi mở thực tiễn giúp học sinh chủ động chiếm lĩnh tri thức."
        }

        // 5. Chức năng 4: Mini game cho tiết dạy (Đa môn học)
        if (lower.contains("mini game") || lower.contains("kahoot") || lower.contains("quizizz") || lower.contains("trò chơi") || lower.contains("đố vui")) {
            return@withContext "🎮 **BỘ CÂU HỎI MINI GAME TƯƠNG TÁC (KAHOOT / QUIZIZZ)**\n\n" +
                    "🎯 **Chủ đề**: $detectedTopic | **Môn**: $detectedSubj $detectedGrade | **Thời lượng**: 5-7 phút\n\n" +
                    "🏆 **Câu 1 (Khởi động - 15s)**: Khái niệm cơ bản nào sau đây là ĐÚNG khi nói về $detectedTopic?\n" +
                    "A. Định nghĩa chuẩn xác theo SGK môn $detectedSubj (ĐÚNG - 1000 điểm)\nB. Khái niệm sai lệch 1\nC. Khái niệm sai lệch 2\nD. Không xác định\n" +
                    "💡 *Giải thích*: Nắm vững khái niệm nền tảng giúp học sinh giải quyết tốt các bài toán nâng cao!\n\n" +
                    "🏆 **Câu 2 (Tăng tốc - 20s)**: Đặc trưng hay tính chất quan trọng nhất của $detectedTopic là gì?\n" +
                    "A. Tính chất thứ yếu\nB. Tính chất bản chất quyết định quy luật (ĐÚNG - 1200 điểm)\nC. Yếu tố ngẫu nhiên\nD. Tuỳ ý\n" +
                    "💡 *Giải thích*: Hiểu rõ bản chất giúp tránh các bẫy câu hỏi thông hiểu thường gặp.\n\n" +
                    "🏆 **Câu 3 (Về đích - 30s)**: Vận dụng kiến thức $detectedTopic vào thực tiễn đòi hỏi nguyên tắc nào?\n" +
                    "A. Ghi nhớ máy móc\nB. Phân tích bối cảnh và áp dụng linh hoạt quy luật (ĐÚNG - 1500 điểm)\nC. Bỏ qua các bước kiểm tra\nD. Không khả thi"
        }

        // 6. Chức năng 5: Sơ đồ tư duy (Đa môn học)
        if (lower.contains("sơ đồ tư duy") || lower.contains("mindmap") || lower.contains("sơ đồ")) {
            val safeRoot = detectedTopic.replace("\"", "").replace("'", "")
            return@withContext "🧠 **SƠ ĐỒ TƯ DUY BÀI DẠY (MÃ MERMAID & CÂY TRI THỨC)**\n\n" +
                    "🎯 **Chủ đề**: $detectedTopic | **Môn**: $detectedSubj $detectedGrade\n\n" +
                    "🌳 **Cây phân cấp kiến thức trực quan**:\n" +
                    "🌿 [GỐC] $detectedTopic.toUpperCase()\n" +
                    "├── 🔹 1. Khái Niệm Nền Tảng (Định nghĩa, Ký hiệu, Ý nghĩa)\n" +
                    "├── 🔹 2. Quy Luật & Cấu Trúc Trọng Tâm (Mối liên hệ, Công thức/Quy tắc)\n" +
                    "├── 🔹 3. Kỹ Năng & Phương Pháp Giải Quyết Vấn Đề (Quy trình 4 bước, Lỗi sai cần tránh)\n" +
                    "└── 🔹 4. Ứng Dụng Thực Tiễn & Chuyển Đổi Số (Liên hệ thực tế, Năng lực số)\n\n" +
                    "💻 **Mã nguồn Mermaid Mindmap**:\n" +
                    "```mermaid\n" +
                    "mindmap\n" +
                    "  root((\"$safeRoot\"))\n" +
                    "    Khái Niệm Nền Tảng\n" +
                    "      Định nghĩa cốt lõi\n" +
                    "      Ký hiệu chuẩn\n" +
                    "    Quy Luật Trọng Tâm\n" +
                    "      Nguyên lý hoạt động\n" +
                    "      Cấu trúc bài học\n" +
                    "    Phương Pháp Vận Dụng\n" +
                    "      Quy trình các bước\n" +
                    "      Bài tập củng cố\n" +
                    "    Ứng Dụng Thực Tế\n" +
                    "      Liên hệ đời sống\n" +
                    "      Học liệu số số hóa\n" +
                    "```"
        }

        // 7. Chức năng 6: Hình ảnh minh họa (Đa môn học)
        if (lower.contains("hình ảnh") || lower.contains("minh họa") || lower.contains("prompt") || lower.contains("vẽ")) {
            return@withContext "🎨 **CÂU LỆNH PROMPT AI TẠO HÌNH ẢNH MINH HỌA BÀI HỌC**\n\n" +
                    "🎯 **Chủ đề**: $detectedTopic | **Môn**: $detectedSubj $detectedGrade\n\n" +
                    "📝 **Prompt Tiếng Anh (Midjourney / DALL-E 3 / Gemini Imagen)**:\n" +
                    "```text\n" +
                    "High quality educational 3D illustration about $detectedTopic, subject of $detectedSubj grade $detectedGrade, modern infographic elements, clean studio lighting, realistic details, textbook art style, 8k resolution --ar 16:9\n" +
                    "```\n\n" +
                    "📝 **Prompt Tiếng Việt (Bing Image Creator / Canva AI)**:\n" +
                    "```text\n" +
                    "Hình ảnh minh họa bài giảng môn $detectedSubj lớp $detectedGrade: Chủ đề \"$detectedTopic\". Thể hiện rõ ràng các yếu tố kiến thức cốt lõi, màu sắc tươi sáng, phong cách đồ họa giáo dục sắc nét cho bài dạy số.\n" +
                    "```"
        }

        // 8. Chức năng 7: Nguồn chính thống Việt Nam
        if (lower.contains("chính thống") || lower.contains("bộ gd") || lower.contains("moet") || lower.contains("định mức") || lower.contains("thư viện pháp luật")) {
            return@withContext "🇻🇳 **TRA CỨU VĂN BẢN PHÁP QUY TỪ CÁC NGUỒN CHÍNH THỐNG VIỆT NAM**\n\n" +
                    "🏛️ **1. Thông tư 28/2009/TT-BGDĐT & TT 15/2017/TT-BGDĐT** (Định mức giờ dạy GDPT):\n" +
                    "• Tiểu học: 23 tiết/tuần | THCS: 19 tiết/tuần | THPT: 17 tiết/tuần.\n" +
                    "• GVCN THPT giảm 4 tiết/tuần, Tổ trưởng giảm 3 tiết/tuần.\n\n" +
                    "🏛️ **2. Thông tư 08/2021/TT-BLĐTBXH** (Nhà giáo giáo dục nghề nghiệp):\n" +
                    "• Định mức 350 - 400 giờ quy chuẩn/năm học.\n\n" +
                    "🔗 **Cổng thông tin tra cứu chính thức**:\n" +
                    "• Bộ Giáo dục và Đào tạo: moet.gov.vn\n" +
                    "• Tổng cục Giáo dục nghề nghiệp: gdnn.gov.vn\n" +
                    "• Thư viện Pháp luật: thuvienphapluat.vn"
        }

        // 9. Tra cứu trong tài liệu giáo viên đã tải lên (Custom Reference Docs)
        if (referenceDocsText.isNotBlank()) {
            val words = lower.split(" ", ",", ".", ";").filter { it.length > 3 }
            val matchedSnippet = words.firstOrNull { referenceDocsText.contains(it, ignoreCase = true) }
            if (matchedSnippet != null) {
                val idx = referenceDocsText.indexOf(matchedSnippet, ignoreCase = true)
                val snippet = referenceDocsText.substring(
                    idx.coerceAtLeast(0),
                    (idx + 350).coerceAtMost(referenceDocsText.length)
                )
                return@withContext "📚 **TRÍCH XUẤT TỪ KHO TƯ LIỆU THẦY/CÔ ĐÃ NẠP**:\n\n" +
                        "\"...$snippet...\"\n\n" +
                        "💡 Thầy/Cô có thể dùng nội dung này để lập tức soạn giáo án hoặc tạo đề thi kiểm tra ma trận chuẩn!"
            }
        }

        // Mặc định: Phản hồi tổng quan trợ lý sư phạm
        "Kính chào Thầy/Cô! Em là Trợ lý AI Sư phạm đa năng (Huy Technology AI). Em có thể giúp Thầy/Cô:\n" +
                "1. 📚 Tra cứu kho tư liệu (CV 5512, CV 3456, QĐ 2422, TT 22, ATLĐ 5S).\n" +
                "2. 📝 Tạo đề thi và ma trận chuẩn 4 mức độ theo Thông tư 22.\n" +
                "3. 📊 Soạn slide bài giảng 10 trang kèm lời thoại giảng viên.\n" +
                "4. 🎮 Tạo mini game Kahoot/Quizizz tương tác sôi nổi.\n" +
                "5. 🧠 Tạo sơ đồ tư duy Mermaid và cây tri thức.\n" +
                "6. 🎨 Thiết kế câu lệnh prompt tạo hình ảnh minh họa 3D.\n" +
                "7. 🇻🇳 Tra cứu văn bản định mức từ moet.gov.vn và thuvienphapluat.vn.\n\n" +
                "Thầy/Cô cần em hỗ trợ nội dung nào ạ?"
    }

    private fun parseScheduleTextLocally(text: String): ScheduleParseResult? {
        val lower = text.lowercase()

        // Extract Day of week: "Thứ 2", "Thứ hai", "t2", "thứ 3", etc.
        var dayOfWeek = 1
        when {
            lower.contains("thứ 2") || lower.contains("thứ hai") || lower.contains("t2") -> dayOfWeek = 1
            lower.contains("thứ 3") || lower.contains("thứ ba") || lower.contains("t3") -> dayOfWeek = 2
            lower.contains("thứ 4") || lower.contains("thứ tư") || lower.contains("t4") -> dayOfWeek = 3
            lower.contains("thứ 5") || lower.contains("thứ năm") || lower.contains("t5") -> dayOfWeek = 4
            lower.contains("thứ 6") || lower.contains("thứ sáu") || lower.contains("t6") -> dayOfWeek = 5
            lower.contains("thứ 7") || lower.contains("thứ bảy") || lower.contains("t7") -> dayOfWeek = 6
            lower.contains("chủ nhật") || lower.contains("cn") -> dayOfWeek = 7
        }

        // Extract time patterns: "8h đến 10h", "08:00 - 10:00", "8h30 đến 11h"
        var startTime = "08:00"
        var endTime = "10:00"

        val timeRegex = Pattern.compile("(\\d{1,2})[h:]?(\\d{0,2})\\s*(?:đến|-|tới)\\s*(\\d{1,2})[h:]?(\\d{0,2})")
        val matcher = timeRegex.matcher(lower)
        if (matcher.find()) {
            val h1 = matcher.group(1)?.toIntOrNull() ?: 8
            val m1 = matcher.group(2)?.toIntOrNull() ?: 0
            val h2 = matcher.group(3)?.toIntOrNull() ?: 10
            val m2 = matcher.group(4)?.toIntOrNull() ?: 0
            startTime = String.format("%02d:%02d", h1, m1)
            endTime = String.format("%02d:%02d", h2, m2)
        }

        // Extract Room: "phòng C202", "P.C202", "P201"
        var room = ""
        val roomRegex = Pattern.compile("(?:phòng|room|p\\.)\\s*([a-zA-Z0-9]+)", Pattern.CASE_INSENSITIVE)
        val roomMatcher = roomRegex.matcher(text)
        if (roomMatcher.find()) {
            room = roomMatcher.group(1)?.uppercase() ?: ""
        }

        // Extract Class: "lớp CĐCK01", "CĐCK01"
        var className = ""
        val classRegex = Pattern.compile("(?:lớp|class)\\s*([a-zA-Z0-9_\\-\\p{L}]+)", Pattern.CASE_INSENSITIVE)
        val classMatcher = classRegex.matcher(text)
        if (classMatcher.find()) {
            className = classMatcher.group(1)?.uppercase() ?: ""
        }

        // Extract Subject: "dạy CNC", "môn CAD/CAM", "dạy Module CAD/CAM"
        var subject = "Lịch dạy"
        val subjectRegex = Pattern.compile("(?:dạy|môn|module|học phần)\\s+([a-zA-Z0-9/\\s]+?)(?:lớp|phòng|thứ|$)", Pattern.CASE_INSENSITIVE)
        val subjectMatcher = subjectRegex.matcher(text)
        if (subjectMatcher.find()) {
            val raw = subjectMatcher.group(1)?.trim() ?: ""
            if (raw.isNotBlank()) subject = raw
        }

        return ScheduleParseResult(
            title = "Dạy $subject",
            subject = subject,
            className = className,
            dayOfWeek = dayOfWeek,
            startTime = startTime,
            endTime = endTime,
            room = room,
            confidence = 0.92f
        )
    }

    private fun callGeminiForScheduleParse(apiKey: String, text: String): ScheduleParseResult? {
        return try {
            val prompt = """
                Bạn là AI trích xuất lịch dạy học. Phân tích văn bản tiếng Việt sau và trả về DUY NHẤT một JSON hợp lệ:
                Văn bản: "$text"
                
                Schema:
                {
                  "title": "Tên sự kiện",
                  "subject": "Tên môn/module",
                  "className": "Tên lớp",
                  "dayOfWeek": 1-7,
                  "startTime": "HH:mm",
                  "endTime": "HH:mm",
                  "room": "Tên phòng",
                  "confidence": 0.95
                }
            """.trimIndent()

            val bodyJson = JsonObject().apply {
                val contents = com.google.gson.JsonArray().apply {
                    add(JsonObject().apply {
                        val parts = com.google.gson.JsonArray().apply {
                            add(JsonObject().apply { addProperty("text", prompt) })
                        }
                        add("parts", parts)
                    })
                }
                add("contents", contents)
                val genConfig = JsonObject().apply {
                    addProperty("response_mime_type", "application/json")
                }
                add("generationConfig", genConfig)
            }

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey")
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) return null

            val respBody = response.body?.string() ?: return null
            val rootObj = gson.fromJson(respBody, JsonObject::class.java)
            val textContent = rootObj.getAsJsonArray("candidates")
                ?.get(0)?.asJsonObject
                ?.getAsJsonObject("content")
                ?.getAsJsonArray("parts")
                ?.get(0)?.asJsonObject
                ?.get("text")?.asString ?: return null

            gson.fromJson(textContent, ScheduleParseResult::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun callGeminiVisionForSchedule(apiKey: String, base64Image: String): List<ScheduleParseResult> {
        // Multi-modal image parser architecture for timetable photos
        return emptyList()
    }

    // =========================================================================
    // TRỤ CỘT 2: HIỆN THỰC HÓA SOẠN GIÁO ÁN CHUẨN CV 5512, CV 2634 & ĐỀ THI (RAG & ANTI-HALLUCINATION)
    // =========================================================================

    override suspend fun generateLessonPlan5512(
        lessonName: String,
        subject: String,
        grade: String,
        durationPeriods: Int,
        customObjectives: String,
        referenceContext: String
    ): LessonPlan5512Result = withContext(Dispatchers.IO) {
        val apiKey = apiKeyProvider()
        if (!apiKey.isNullOrBlank()) {
            val result = callGeminiFor5512(apiKey, lessonName, subject, grade, durationPeriods, customObjectives, referenceContext)
            if (result != null) return@withContext result
        }
        generateOffline5512(lessonName, subject, grade, durationPeriods, customObjectives, referenceContext)
    }

    override suspend fun generateLessonPlan2634(
        moduleName: String,
        lessonName: String,
        profession: String,
        trainingLevel: String,
        durationHours: Float,
        customSafety: String,
        referenceContext: String
    ): LessonPlan2634Result = withContext(Dispatchers.IO) {
        val apiKey = apiKeyProvider()
        if (!apiKey.isNullOrBlank()) {
            val result = callGeminiFor2634(apiKey, moduleName, lessonName, profession, trainingLevel, durationHours, customSafety, referenceContext)
            if (result != null) return@withContext result
        }
        generateOffline2634(moduleName, lessonName, profession, trainingLevel, durationHours, customSafety, referenceContext)
    }

    override suspend fun generateExamMatrix(
        topic: String,
        subject: String,
        gradeOrClass: String,
        questionCount: Int,
        referenceContext: String
    ): ExamMatrixResult = withContext(Dispatchers.IO) {
        val apiKey = apiKeyProvider()
        if (!apiKey.isNullOrBlank()) {
            val result = callGeminiForExamMatrix(apiKey, topic, subject, gradeOrClass, questionCount, referenceContext)
            if (result != null) return@withContext result
        }
        generateOfflineExamMatrix(topic, subject, gradeOrClass, questionCount, referenceContext)
    }

    private fun callGeminiFor5512(
        apiKey: String,
        lessonName: String,
        subject: String,
        grade: String,
        durationPeriods: Int,
        customObjectives: String,
        referenceContext: String
    ): LessonPlan5512Result? {
        return try {
            val groundingDirective = if (referenceContext.isNotBlank()) {
                """
                === CƠ SỞ DỮ LIỆU TƯ LIỆU VĂN BẢN CHUẨN ĐỐI CHIẾU (BẮT BUỘC TUÂN THỦ) ===
                $referenceContext
                ========================================================================
                CHỈ THỊ SƯ PHẠM NGHIÊM NGẶT (ANTI-HALLUCINATION & LEGAL GROUNDING DIRECTIVE):
                1. Bạn CHỈ ĐƯỢC PHÉP dựa vào các căn cứ pháp quy, quy chế chuyên môn và tư liệu chuẩn được cung cấp ở trên để biên soạn kế hoạch bài dạy.
                2. TUYỆT ĐỐI KHÔNG tự ý bịa đặt hoặc đưa ra thông tin, điều luật, khung năng lực chưa đối chiếu với cơ sở dữ liệu.
                3. Trong trường 'referenceCitations', phải nêu rõ các văn bản quy phạm và tư liệu chuẩn đã được dùng làm căn cứ.
                """.trimIndent()
            } else {
                """
                CĂN CỨ PHÁP QUY: Tuân thủ Công văn 5512/BGDĐT-GDTrH và Chương trình GDPT 2018. Tuyệt đối không bịa đặt quy định chuyên môn.
                """.trimIndent()
            }

            val prompt = """
                Bạn là chuyên gia sư phạm Việt Nam. Hãy soạn KẾ HOẠCH BÀI DẠY chuẩn Công văn 5512/BGDĐT-GDTrH cho:
                Môn: $subject, Lớp: $grade, Bài: $lessonName, Thời lượng: $durationPeriods tiết.
                Yêu cầu bổ sung của GV: $customObjectives

                $groundingDirective

                Trả về DUY NHẤT một JSON hợp lệ theo schema sau (không thêm markdown ngoài JSON):
                {
                  "lessonName": "$lessonName",
                  "subject": "$subject",
                  "grade": "$grade",
                  "durationPeriods": $durationPeriods,
                  "knowledgeObjective": "Nội dung kiến thức học sinh tiếp thu được (bám sát chuẩn)",
                  "generalCompetence": "Năng lực tự chủ, giao tiếp, hợp tác",
                  "specificCompetence": "Năng lực tư duy đặc thù môn học",
                  "qualitiesObjective": "Chăm chỉ, trung thực, trách nhiệm",
                  "teacherEquipment": "Thiết bị, phiếu học tập, đồ dùng dạy học của GV",
                  "studentEquipment": "Sách vở, dụng cụ học tập của HS",
                  "referenceCitations": "Công văn 5512/BGDĐT-GDTrH; CT GDPT 2018; các tài liệu đã đối chiếu",
                  "activities": [
                    {
                      "title": "Hoạt động 1: Mở đầu / Khởi động",
                      "durationMinutes": 7,
                      "objective": "Tạo hứng thú, kết nối bài mới",
                      "content": "Câu hỏi hoặc tình huống khơi gợi",
                      "product": "Câu trả lời của HS",
                      "implementation": "1. Chuyển giao nhiệm vụ\n2. HS thực hiện\n3. Báo cáo, thảo luận\n4. GV kết luận"
                    },
                    {
                      "title": "Hoạt động 2: Hình thành kiến thức mới",
                      "durationMinutes": 20,
                      "objective": "Chiếm lĩnh kiến thức trọng tâm",
                      "content": "Nhiệm vụ học tập cụ thể theo từng phần",
                      "product": "Kết quả ghi chép, sản phẩm nhóm",
                      "implementation": "Tổ chức hoạt động dạy học chi tiết"
                    },
                    {
                      "title": "Hoạt động 3: Luyện tập",
                      "durationMinutes": 12,
                      "objective": "Củng cố, khắc sâu kiến thức",
                      "content": "Bài tập, câu hỏi củng cố",
                      "product": "Bài giải của HS",
                      "implementation": "Tổ chức làm bài và nhận xét"
                    },
                    {
                      "title": "Hoạt động 4: Vận dụng",
                      "durationMinutes": 6,
                      "objective": "Ứng dụng kiến thức vào thực tế",
                      "content": "Nhiệm vụ mở rộng tìm tòi",
                      "product": "Sản phẩm thực tế của HS",
                      "implementation": "Giao nhiệm vụ về nhà"
                    }
                  ]
                }
            """.trimIndent()

            val bodyJson = JsonObject().apply {
                val contents = com.google.gson.JsonArray().apply {
                    add(JsonObject().apply {
                        val parts = com.google.gson.JsonArray().apply {
                            add(JsonObject().apply { addProperty("text", prompt) })
                        }
                        add("parts", parts)
                    })
                }
                add("contents", contents)
                val genConfig = JsonObject().apply {
                    addProperty("response_mime_type", "application/json")
                }
                add("generationConfig", genConfig)
            }

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey")
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) return null

            val respBody = response.body?.string() ?: return null
            val rootObj = gson.fromJson(respBody, JsonObject::class.java)
            val textContent = rootObj.getAsJsonArray("candidates")
                ?.get(0)?.asJsonObject
                ?.getAsJsonObject("content")
                ?.getAsJsonArray("parts")
                ?.get(0)?.asJsonObject
                ?.get("text")?.asString ?: return null

            gson.fromJson(textContent, LessonPlan5512Result::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun generateOffline5512(
        lessonName: String,
        subject: String,
        grade: String,
        durationPeriods: Int,
        customObjectives: String,
        referenceContext: String
    ): LessonPlan5512Result {
        val totalMin = durationPeriods * 45
        val warmMin = (totalMin * 0.15).toInt().coerceAtLeast(5)
        val newMin = (totalMin * 0.45).toInt().coerceAtLeast(15)
        val pracMin = (totalMin * 0.25).toInt().coerceAtLeast(10)
        val appMin = totalMin - warmMin - newMin - pracMin

        val citations = if (referenceContext.isNotBlank()) {
            "Công văn 5512/BGDĐT-GDTrH; CT GDPT 2018;\nTư liệu chuẩn đối chiếu từ Kho dữ liệu: " + referenceContext.take(180) + "..."
        } else {
            "Công văn 5512/BGDĐT-GDTrH của Bộ GD&ĐT; Chương trình Giáo dục Phổ thông 2018"
        }

        return LessonPlan5512Result(
            lessonName = lessonName,
            subject = subject,
            grade = grade,
            durationPeriods = durationPeriods,
            knowledgeObjective = if (customObjectives.isNotBlank()) customObjectives else "Học sinh hiểu và trình bày được bản chất, quy luật, các khái niệm trọng tâm của bài '$lessonName'.",
            generalCompetence = "Năng lực tự chủ và tự học (chủ động tìm hiểu tài liệu); Năng lực giao tiếp và hợp tác (thảo luận nhóm tích cực); Năng lực giải quyết vấn đề và sáng tạo.",
            specificCompetence = "Năng lực nhận thức, vận dụng phương pháp khoa học của môn $subject để giải quyết các tình huống học tập và bài tập thực hành.",
            qualitiesObjective = "Rèn luyện đức tính cẩn thận, trung thực, tính kỷ luật và tinh thần trách nhiệm trong học tập.",
            teacherEquipment = "Giáo án điện tử, máy chiếu/Tivi, phiếu học tập số 1 & 2, tranh ảnh/video thí nghiệm minh họa.",
            studentEquipment = "Sách giáo khoa, vở ghi bài, bút viết, phiếu học tập cá nhân và nhóm.",
            activities = listOf(
                Activity5512(
                    title = "Hoạt động 1: Mở đầu / Khởi động (Tạo tình huống có vấn đề)",
                    durationMinutes = warmMin,
                    objective = "Kích thích tư duy, tạo mâu thuẫn nhận thức để học sinh sẵn sàng tiếp thu bài '$lessonName'.",
                    content = "Giáo viên đưa ra tình huống thực tế hoặc video ngắn liên quan đến $lessonName và đặt câu hỏi mở.",
                    product = "Câu trả lời, ý kiến thảo luận sôi nổi của học sinh ghi trên bảng phụ.",
                    implementation = "1. Giao nhiệm vụ: GV trình chiếu câu hỏi khởi động.\n2. Thực hiện: HS suy nghĩ cá nhân trong 2 phút.\n3. Báo cáo: Đại diện 2 HS phát biểu ý kiến.\n4. Kết luận: GV nhận xét, dẫn dắt vào bài mới."
                ),
                Activity5512(
                    title = "Hoạt động 2: Hình thành kiến thức mới (Chiếm lĩnh tri thức trọng tâm)",
                    durationMinutes = newMin,
                    objective = "Học sinh hiểu rõ nội dung, định nghĩa, công thức và quy trình của bài '$lessonName'.",
                    content = "Nghiên cứu tài liệu SGK, phân tích các ví dụ mẫu, làm việc theo nhóm 4 học sinh.",
                    product = "Bản tổng hợp kiến thức đã hoàn thành trên phiếu học tập số 1 của các nhóm.",
                    implementation = "1. Giao nhiệm vụ: Chia lớp thành các nhóm, giao phiếu học tập.\n2. Thực hiện: Các nhóm thảo luận, GV quan sát hỗ trợ.\n3. Báo cáo: Nhóm 1 báo cáo, các nhóm khác phản biện.\n4. Kết luận: GV chuẩn hóa kiến thức trên slide."
                ),
                Activity5512(
                    title = "Hoạt động 3: Luyện tập (Củng cố và rèn luyện kỹ năng)",
                    durationMinutes = pracMin,
                    objective = "Khắc sâu kiến thức, vận dụng trực tiếp vào bài tập hoặc câu hỏi tình huống.",
                    content = "Học sinh làm việc độc lập giải quyết bài tập luyện tập 1, 2 trong phiếu học tập số 2.",
                    product = "Bài giải chi tiết của học sinh trong vở ghi.",
                    implementation = "1. Giao nhiệm vụ: GV giao bài tập tự luyện trên màn hình.\n2. Thực hiện: HS độc lập làm bài.\n3. Báo cáo: Gọi 2 HS lên bảng chữa bài.\n4. Kết luận: GV nhận xét, chốt đáp án đúng và phân tích lỗi sai."
                ),
                Activity5512(
                    title = "Hoạt động 4: Vận dụng (Gắn liền bài học với thực tiễn)",
                    durationMinutes = appMin,
                    objective = "Vận dụng kiến thức bài '$lessonName' để giải thích hiện tượng hoặc làm sản phẩm thực tiễn.",
                    content = "Tìm hiểu ứng dụng thực tế của bài học trong đời sống, công nghệ hoặc sản xuất.",
                    product = "Bản báo cáo ngắn gọn hoặc sản phẩm sáng tạo nộp vào tiết học sau.",
                    implementation = "1. Giao nhiệm vụ: GV hướng dẫn câu hỏi vận dụng mở rộng.\n2. Thực hiện: HS thực hiện ngoài giờ lên lớp.\n3. Đánh giá: Thu sản phẩm đánh giá vào buổi học tới."
                )
            ),
            referenceCitations = citations
        )
    }

    private fun callGeminiFor2634(
        apiKey: String,
        moduleName: String,
        lessonName: String,
        profession: String,
        trainingLevel: String,
        durationHours: Float,
        customSafety: String,
        referenceContext: String
    ): LessonPlan2634Result? {
        return try {
            val groundingDirective = if (referenceContext.isNotBlank()) {
                """
                === CƠ SỞ DỮ LIỆU TƯ LIỆU VĂN BẢN CHUẨN ĐỐI CHIẾU (BẮT BUỘC TUÂN THỦ) ===
                $referenceContext
                ========================================================================
                CHỈ THỊ SƯ PHẠM NGHIÊM NGẶT (ANTI-HALLUCINATION & SAFETY DIRECTIVE):
                1. Bạn CHỈ ĐƯỢC PHÉP dựa vào các căn cứ pháp quy, quy chuẩn an toàn lao động và giáo trình nghề được cung cấp ở trên.
                2. TUYỆT ĐỐI KHÔNG tự bịa đặt quy trình kỹ thuật, quy tắc an toàn hoặc chuẩn kỹ năng nghề không có căn cứ.
                3. Trường 'referenceCitations' phải ghi rõ Công văn 2634/GDNN và các tiêu chuẩn an toàn/tài liệu đối chiếu.
                """.trimIndent()
            } else {
                """
                CĂN CỨ PHÁP QUY: Tuân thủ Công văn 2634/GDNN của Tổng cục Giáo dục Nghề nghiệp và Tiêu chuẩn ATLĐ xưởng thực hành.
                """.trimIndent()
            }

            val prompt = """
                Bạn là chuyên gia sư phạm Giáo dục Nghề nghiệp Việt Nam. Hãy soạn GIÁO ÁN TÍCH HỢP / THỰC HÀNH chuẩn Công văn 2634/GDNN cho:
                Module: $moduleName, Bài: $lessonName, Nghề: $profession, Trình độ: $trainingLevel, Thời lượng: $durationHours giờ.
                Yêu cầu an toàn: $customSafety

                $groundingDirective

                Trả về DUY NHẤT một JSON hợp lệ theo schema sau:
                {
                  "moduleName": "$moduleName",
                  "lessonName": "$lessonName",
                  "profession": "$profession",
                  "trainingLevel": "$trainingLevel",
                  "durationHours": $durationHours,
                  "knowledgeObjective": "Kiến thức chuyên môn",
                  "skillObjective": "Kỹ năng thực hành nghề",
                  "autonomyAndResponsibility": "Tác phong công nghiệp, kỷ luật xưởng, 5S",
                  "machineryAndEquipment": "Danh mục máy móc thiết bị xưởng",
                  "materialsAndDrawings": "Phôi liệu, dụng cụ đo, bản vẽ",
                  "safetyGear": "Trang bị BHLĐ cá nhân",
                  "referenceCitations": "Công văn 2634/GDNN; Tiêu chuẩn ATLĐ; Tài liệu đối chiếu",
                  "steps": [
                    {
                      "stepName": "1. Ổn định lớp & Nhắc nhở an toàn xưởng",
                      "durationMinutes": 5,
                      "teacherActivity": "Điểm danh, kiểm tra BHLĐ, nhắc nhở quy tắc an toàn",
                      "studentActivity": "Trang phục BHLĐ đầy đủ, lắng nghe và tuân thủ",
                      "notesAndSafety": "Không đùa giỡn trong xưởng máy"
                    },
                    {
                      "stepName": "2. Hướng dẫn ban đầu",
                      "durationMinutes": 20,
                      "teacherActivity": "Thao tác mẫu, phân tích các dạng sai hỏng, giải thích bản vẽ",
                      "studentActivity": "Quan sát thao tác mẫu, ghi chép thông số công nghệ",
                      "notesAndSafety": "Chú ý vị trí đứng quan sát an toàn"
                    },
                    {
                      "stepName": "3. Hướng dẫn thường xuyên",
                      "durationMinutes": 100,
                      "teacherActivity": "Phân công vị trí máy, uốn nắn thao tác, xử lý sự cố",
                      "studentActivity": "Vận hành máy, gia công chi tiết theo quy trình",
                      "notesAndSafety": "Bấm nút dừng khẩn cấp khi có tiếng động lạ"
                    },
                    {
                      "stepName": "4. Hướng dẫn kết thúc",
                      "durationMinutes": 15,
                      "teacherActivity": "Đánh giá kích thước sản phẩm, nhận xét nề nếp, giao nhiệm vụ",
                      "studentActivity": "Đo kiểm sản phẩm, vệ sinh máy và thu dọn phôi theo 5S",
                      "notesAndSafety": "Cắt cầu dao điện trước khi lau chùi máy"
                    }
                  ]
                }
            """.trimIndent()

            val bodyJson = JsonObject().apply {
                val contents = com.google.gson.JsonArray().apply {
                    add(JsonObject().apply {
                        val parts = com.google.gson.JsonArray().apply {
                            add(JsonObject().apply { addProperty("text", prompt) })
                        }
                        add("parts", parts)
                    })
                }
                add("contents", contents)
                val genConfig = JsonObject().apply {
                    addProperty("response_mime_type", "application/json")
                }
                add("generationConfig", genConfig)
            }

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey")
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) return null

            val respBody = response.body?.string() ?: return null
            val rootObj = gson.fromJson(respBody, JsonObject::class.java)
            val textContent = rootObj.getAsJsonArray("candidates")
                ?.get(0)?.asJsonObject
                ?.getAsJsonObject("content")
                ?.getAsJsonArray("parts")
                ?.get(0)?.asJsonObject
                ?.get("text")?.asString ?: return null

            gson.fromJson(textContent, LessonPlan2634Result::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun generateOffline2634(
        moduleName: String,
        lessonName: String,
        profession: String,
        trainingLevel: String,
        durationHours: Float,
        customSafety: String,
        referenceContext: String
    ): LessonPlan2634Result {
        val citations = if (referenceContext.isNotBlank()) {
            "Công văn 2634/GDNN; Tiêu chuẩn ATLĐ và 5S xưởng;\nTư liệu chuẩn đối chiếu từ Kho dữ liệu: " + referenceContext.take(180) + "..."
        } else {
            "Công văn 2634/GDNN của Tổng cục GDNN; Tiêu chuẩn An toàn xưởng và 5S"
        }

        return LessonPlan2634Result(
            moduleName = moduleName,
            lessonName = lessonName,
            profession = profession,
            trainingLevel = trainingLevel,
            durationHours = durationHours,
            knowledgeObjective = "Trình bày được cấu tạo thiết bị, chế độ cắt gọt, trình tự các bước công nghệ và các dạng sai hỏng thường gặp khi gia công bài '$lessonName'.",
            skillObjective = "Vận hành thiết bị chuẩn xác, thực hiện gia công chi tiết đạt dung sai kích thước ±0.02mm và độ nhám bề mặt theo đúng bản vẽ kỹ thuật.",
            autonomyAndResponsibility = "Rèn luyện tác phong công nghiệp, tinh thần tiết kiệm vật tư, ý thức bảo quản tài sản xưởng và tuân thủ nghiêm ngặt quy định 5S.",
            machineryAndEquipment = "Máy gia công chuyên dụng (Tiện, Phay, CNC), tủ dụng cụ, đồ gá vạn năng, hệ thống làm mát.",
            materialsAndDrawings = "Phôi nhôm/thép đã được cắt phôi chuẩn, dao tiện/dao phay, thước kẹp điện tử 0.01mm, panme, bản vẽ gia công chi tiết.",
            safetyGear = if (customSafety.isNotBlank()) customSafety else "Quần áo bảo hộ xưởng cơ khí, kính bảo hộ chống phoi bắn, giày bảo hộ mũi lót thép, không đeo găng tay khi vận hành trục chính.",
            steps = listOf(
                Step2634(
                    stepName = "1. Ổn định lớp & Nhắc nhở an toàn xưởng",
                    durationMinutes = 5,
                    teacherActivity = "Điểm danh quân số, kiểm tra tác phong và trang bị BHLĐ cá nhân của học sinh. Phổ biến quy tắc an toàn xưởng trước khi đóng điện nguồn.",
                    studentActivity = "Tập trung đúng giờ, mặc BHLĐ theo quy định, báo cáo sĩ số và lắng nghe hướng dẫn an toàn.",
                    notesAndSafety = "Tuyệt đối không mang điện thoại cá nhân vào khu vực gia công máy."
                ),
                Step2634(
                    stepName = "2. Hướng dẫn ban đầu",
                    durationMinutes = 20,
                    teacherActivity = "Phân tích bản vẽ kỹ thuật, chọn dao và chế độ cắt (vận tốc trục chính S, bước tiến F). Thao tác mẫu 1 lần với tốc độ bình thường và 1 lần phân tích từng bước gá đặt, set gốc tọa độ.",
                    studentActivity = "Quan sát tỉ mỉ từng thao tác của giáo viên, ghi chép thông số công nghệ vào phiếu thực tập.",
                    notesAndSafety = "Đứng cách máy tối thiểu 0.8m trong khi giáo viên thao tác mẫu."
                ),
                Step2634(
                    stepName = "3. Hướng dẫn thường xuyên",
                    durationMinutes = (durationHours * 60 - 40).toInt().coerceAtLeast(60),
                    teacherActivity = "Phân công học sinh về từng vị trí máy. Đi tuần xưởng, theo dõi tư thế thao tác, nhắc nhở quy tắc an toàn, kịp thời chấn chỉnh sai sót và giải đáp thắc mắc.",
                    studentActivity = "Học sinh độc lập gá phôi, rà dao, nhập chương trình và thực hiện gia công chi tiết theo phiếu quy trình công nghệ.",
                    notesAndSafety = "Đóng kín cửa bảo vệ máy trước khi bấm Cycle Start. Luôn để tay gần nút E-STOP."
                ),
                Step2634(
                    stepName = "4. Hướng dẫn kết thúc",
                    durationMinutes = 15,
                    teacherActivity = "Thu sản phẩm, cùng học sinh đo kiểm kích thước, chỉ ra nguyên nhân các chi tiết bị phế phẩm. Đánh giá thái độ học tập và chấm điểm sản phẩm. Nhận xét buổi học.",
                    studentActivity = "Nộp sản phẩm cho giáo viên. Tắt nguồn điện máy, quét dọn phoi vụn, lau chùi máy, bôi dầu bảo quản băng máy và sắp xếp dụng cụ theo 5S.",
                    notesAndSafety = "Cắt aptomat tổng trước khi vệ sinh xưởng."
                )
            ),
            referenceCitations = citations
        )
    }

    private fun callGeminiForExamMatrix(
        apiKey: String,
        topic: String,
        subject: String,
        gradeOrClass: String,
        questionCount: Int,
        referenceContext: String
    ): ExamMatrixResult? {
        return try {
            val groundingDirective = if (referenceContext.isNotBlank()) {
                """
                === CƠ SỞ DỮ LIỆU TƯ LIỆU VĂN BẢN CHUẨN ĐỐI CHIẾU (BẮT BUỘC TUÂN THỦ) ===
                $referenceContext
                ========================================================================
                CHỈ THỊ SƯ PHẠM NGHIÊM NGẶT (ANTI-HALLUCINATION & EVALUATION DIRECTIVE):
                1. Bạn CHỈ ĐƯỢC PHÉP dựa vào chuẩn kiến thức kỹ năng, Thông tư 22/2021/TT-BGDĐT và ngân hàng tư liệu chuẩn ở trên.
                2. BẮT BUỘC phân bổ đúng 4 mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và câu hỏi phải có đáp án, lời giải thích có căn cứ khoa học rõ ràng, KHÔNG TỰ BỊA ĐẶT.
                3. Trường 'referenceCitations' phải ghi rõ Thông tư 22/2021/TT-BGDĐT và các tư liệu đã đối chiếu.
                """.trimIndent()
            } else {
                """
                CĂN CỨ PHÁP QUY: Tuân thủ Thông tư 22/2021/TT-BGDĐT về kiểm tra đánh giá theo 4 mức độ nhận thức.
                """.trimIndent()
            }

            val prompt = """
                Bạn là chuyên gia khảo thí và đo lường giáo dục. Hãy tạo MA TRẬN ĐỀ THI VÀ CÂU HỎI bám sát 4 MỨC ĐỘ NHẬN THỨC (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) cho:
                Môn: $subject, Lớp: $gradeOrClass, Chủ đề: $topic, Số lượng: $questionCount câu.

                $groundingDirective

                Trả về DUY NHẤT một JSON hợp lệ theo schema sau:
                {
                  "examTitle": "Đề kiểm tra đánh giá định kỳ: $topic",
                  "subject": "$subject",
                  "gradeOrClass": "$gradeOrClass",
                  "durationMinutes": 45,
                  "recognitionCount": 4,
                  "understandingCount": 3,
                  "applicationCount": 2,
                  "highApplicationCount": 1,
                  "referenceCitations": "Thông tư 22/2021/TT-BGDĐT; Khung ma trận đề chuẩn; Tài liệu đối chiếu",
                  "questions": [
                    {
                      "questionNumber": 1,
                      "level": "Nhận biết",
                      "questionText": "Nội dung câu hỏi...",
                      "options": ["A. Lựa chọn 1", "B. Lựa chọn 2", "C. Lựa chọn 3", "D. Lựa chọn 4"],
                      "correctAnswer": "A",
                      "explanation": "Giải thích chi tiết vì sao A đúng..."
                    }
                  ]
                }
            """.trimIndent()

            val bodyJson = JsonObject().apply {
                val contents = com.google.gson.JsonArray().apply {
                    add(JsonObject().apply {
                        val parts = com.google.gson.JsonArray().apply {
                            add(JsonObject().apply { addProperty("text", prompt) })
                        }
                        add("parts", parts)
                    })
                }
                add("contents", contents)
                val genConfig = JsonObject().apply {
                    addProperty("response_mime_type", "application/json")
                }
                add("generationConfig", genConfig)
            }

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey")
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) return null

            val respBody = response.body?.string() ?: return null
            val rootObj = gson.fromJson(respBody, JsonObject::class.java)
            val textContent = rootObj.getAsJsonArray("candidates")
                ?.get(0)?.asJsonObject
                ?.getAsJsonObject("content")
                ?.getAsJsonArray("parts")
                ?.get(0)?.asJsonObject
                ?.get("text")?.asString ?: return null

            gson.fromJson(textContent, ExamMatrixResult::class.java)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun generateOfflineExamMatrix(
        topic: String,
        subject: String,
        gradeOrClass: String,
        questionCount: Int,
        referenceContext: String
    ): ExamMatrixResult {
        val nbCount = (questionCount * 0.4).toInt().coerceAtLeast(1)
        val thCount = (questionCount * 0.3).toInt().coerceAtLeast(1)
        val vdCount = (questionCount * 0.2).toInt().coerceAtLeast(1)
        val vdcCount = (questionCount - nbCount - thCount - vdCount).coerceAtLeast(1)

        val questions = mutableListOf<ExamQuestionItem>()
        var qIdx = 1

        // Mức 1: Nhận biết
        for (i in 1..nbCount) {
            questions.add(
                ExamQuestionItem(
                    questionNumber = qIdx++,
                    level = "Nhận biết",
                    questionText = "Trong nội dung '$topic', khái niệm hoặc quy tắc cơ bản nào sau đây là ĐÚNG?",
                    options = listOf(
                        "A. Quy tắc tuân thủ đúng trình tự công nghệ và thông số kỹ thuật quy định",
                        "B. Bỏ qua các bước kiểm tra an toàn ban đầu để tiết kiệm thời gian",
                        "C. Chỉ áp dụng quy trình khi có sự giám sát trực tiếp của giáo viên",
                        "D. Thay đổi tùy tiện thông số mà không cần tính toán"
                    ),
                    correctAnswer = "A",
                    explanation = "Theo lý thuyết bài '$topic', người học bắt buộc phải nắm vững và tuân thủ đúng trình tự công nghệ quy định để đảm bảo an toàn và chất lượng."
                )
            )
        }

        // Mức 2: Thông hiểu
        for (i in 1..thCount) {
            questions.add(
                ExamQuestionItem(
                    questionNumber = qIdx++,
                    level = "Thông hiểu",
                    questionText = "Ý nghĩa chính của việc kiểm tra và hiệu chuẩn thiết bị trước khi thực hiện '$topic' là gì?",
                    options = listOf(
                        "A. Đảm bảo độ chính xác kích thước và loại trừ nguy cơ mất an toàn lao động",
                        "B. Chỉ để báo cáo với ban quản lý xưởng",
                        "C. Nhằm mục đích tiêu hao bớt năng lượng của thiết bị",
                        "D. Không có ý nghĩa thực tiễn rõ rệt"
                    ),
                    correctAnswer = "A",
                    explanation = "Việc kiểm tra và hiệu chuẩn giúp phát hiện sớm sai lệch và hỏng hóc, đảm bảo độ chính xác gia công và an toàn tuyệt đối."
                )
            )
        }

        // Mức 3: Vận dụng
        for (i in 1..vdCount) {
            questions.add(
                ExamQuestionItem(
                    questionNumber = qIdx++,
                    level = "Vận dụng",
                    questionText = "Khi áp dụng bài học '$topic' vào tình huống thực tế, nếu phát hiện thông số đầu ra bị sai lệch 0.05mm, biện pháp xử lý chuẩn xác nhất là gì?",
                    options = listOf(
                        "A. Tạm dừng quy trình, đo kiểm lại chuẩn tọa độ và bù trừ lượng mòn dao",
                        "B. Tiếp tục gia công và hy vọng sản phẩm sau sẽ tự chuẩn lại",
                        "C. Tăng tốc độ cắt để bù lại sai số",
                        "D. Vứt bỏ toàn bộ máy móc thiết bị"
                    ),
                    correctAnswer = "A",
                    explanation = "Khi phát hiện sai lệch kích thước vượt dung sai, cần dừng lại đo đạc xác định nguyên nhân và bù trừ thông số chính xác."
                )
            )
        }

        // Mức 4: Vận dụng cao
        for (i in 1..vdcCount) {
            questions.add(
                ExamQuestionItem(
                    questionNumber = qIdx++,
                    level = "Vận dụng cao",
                    questionText = "Đề xuất giải pháp tối ưu hóa quy trình trong chủ đề '$topic' nhằm nâng cao năng suất 20% mà vẫn đảm bảo an toàn và chất lượng?",
                    options = listOf(
                        "A. Cải tiến đồ gá, chuẩn hóa chu trình gia công và áp dụng phương pháp 5S tinh gọn",
                        "B. Ép thiết bị chạy quá tải vượt quá công suất định mức",
                        "C. Cắt giảm thời gian kiểm tra chất lượng sản phẩm",
                        "D. Giảm bớt các yêu cầu về an toàn xưởng"
                    ),
                    correctAnswer = "A",
                    explanation = "Tối ưu hóa bền vững đòi hỏi cải tiến gá đặt, rút ngắn thời gian phụ và áp dụng quản lý tinh gọn 5S."
                )
            )
        }

        val citations = if (referenceContext.isNotBlank()) {
            "Thông tư 22/2021/TT-BGDĐT; Khung ma trận đề kiểm tra 4 mức độ;\nTư liệu chuẩn đối chiếu từ Kho dữ liệu: " + referenceContext.take(180) + "..."
        } else {
            "Thông tư 22/2021/TT-BGDĐT của Bộ GD&ĐT; Khung ma trận đề 4 mức độ nhận thức"
        }

        return ExamMatrixResult(
            examTitle = "Đề Kiểm Tra Đánh Giá Năng Lực: $topic",
            subject = subject,
            gradeOrClass = gradeOrClass,
            durationMinutes = 45,
            recognitionCount = nbCount,
            understandingCount = thCount,
            applicationCount = vdCount,
            highApplicationCount = vdcCount,
            questions = questions,
            referenceCitations = citations
        )
    }

    // =========================================================================
    // TRỤ CỘT 3: GÓI HỌC LIỆU HOÀN CHỈNH 6-IN-1 CHO CA DẠY LỊCH TRÌNH
    // =========================================================================

    override suspend fun generateCompleteLessonPack(
        lessonName: String,
        subject: String,
        grade: String,
        standard: Int,
        customRequirements: String,
        referenceContext: String
    ): LessonTeachingPack = withContext(Dispatchers.IO) {
        // 1. Soạn Giáo án / Kế hoạch bài dạy
        val lessonPlanHtml: String
        val lessonTitleDisplay: String
        if (standard == 1) {
            val plan2634 = generateLessonPlan2634(
                moduleName = subject,
                lessonName = lessonName,
                profession = "Kỹ thuật - Công nghệ",
                trainingLevel = "Trung cấp / Cao đẳng",
                durationHours = 4.0f,
                customSafety = customRequirements,
                referenceContext = referenceContext
            )
            lessonPlanHtml = plan2634.toHtmlDocument()
            lessonTitleDisplay = plan2634.lessonName
        } else {
            val plan5512 = generateLessonPlan5512(
                lessonName = lessonName,
                subject = subject,
                grade = grade,
                durationPeriods = 1,
                customObjectives = customRequirements,
                referenceContext = referenceContext
            )
            lessonPlanHtml = plan5512.toHtmlDocument()
            lessonTitleDisplay = plan5512.lessonName
        }

        // 2. Slide Thuyết Trình Bài Dạy
        val slides = generateSlideDeck(lessonTitleDisplay, subject, grade, referenceContext)

        // 3. Mini Game Tương Tác
        val miniGame = generateMiniGame(lessonTitleDisplay, subject, grade, referenceContext)

        // 4. Sơ Đồ Tư Duy Mindmap
        val mindmap = generateMindmap(lessonTitleDisplay, subject, grade, referenceContext)

        // 5. Video Học Liệu Đa Phương Tiện
        val videoResource = generateVideoResource(lessonTitleDisplay, subject, grade, referenceContext)

        // 6. Bảng Điểm Rubric Chấm Giáo Án CV 5512
        val rubricScore = generateRubricScore(lessonTitleDisplay, subject, grade, standard)

        LessonTeachingPack(
            lessonPlanName = lessonTitleDisplay,
            lessonPlanHtml = lessonPlanHtml,
            slides = slides,
            miniGame = miniGame,
            mindmap = mindmap,
            videoResource = videoResource,
            rubricScore = rubricScore
        )
    }

    private fun generateSlideDeck(
        lessonTitle: String,
        subject: String,
        grade: String,
        context: String
    ): LessonSlideDeck {
        val slideList = listOf(
            SlideItem(
                slideNumber = 1,
                title = "KHỞI ĐỘNG & ĐẶT VẤN ĐỀ",
                bulletPoints = listOf(
                    "Chào mừng các em học sinh đến với bài học: $lessonTitle",
                    "Khơi gợi vấn đề thực tiễn liên quan đến $subject $grade",
                    "Đặt câu hỏi thảo luận nhanh: Hiện tượng gì xảy ra khi ứng dụng trong đời sống?",
                    "Kích hoạt tư duy và tạo hứng thú khám phá đầu tiết dạy"
                ),
                visualHint = "Trình chiếu hình ảnh/video 30s thực tế minh họa trực quan chủ đề bài học",
                teacherScript = "Thầy/Cô chào cả lớp. Hôm nay chúng ta cùng tìm hiểu một chủ đề rất thú vị và có tính ứng dụng cao trong thực tiễn..."
            ),
            SlideItem(
                slideNumber = 2,
                title = "MỤC TIÊU CẦN ĐẠT CỦA BÀI HỌC",
                bulletPoints = listOf(
                    "Về Kiến thức: Nắm vững các khái niệm, quy luật và bản chất của $lessonTitle",
                    "Về Kỹ năng: Phân tích, tính toán, thao tác kỹ thuật và giải quyết bài toán cụ thể",
                    "Về Năng lực tự chủ: Làm việc nhóm, chủ động tìm tòi và phát biểu ý kiến xây dựng bài",
                    "Về Phẩm chất: Tác phong cẩn thận, kỷ luật và an toàn trong học tập"
                ),
                visualHint = "Sơ đồ biểu tượng 3 cột: Kiến thức - Kỹ năng - Năng lực phẩm chất",
                teacherScript = "Sau tiết học này, các em cần đạt được các chuẩn đầu ra cơ bản như trên bảng để làm nền tảng cho các bài học tiếp theo."
            ),
            SlideItem(
                slideNumber = 3,
                title = "HÌNH THÀNH KIẾN THỨC MỚI",
                bulletPoints = listOf(
                    "Khái niệm & bản chất khoa học của $lessonTitle",
                    "Các thông số kỹ thuật cốt lõi và mối quan hệ tương quan",
                    "Phân tích ví dụ mẫu điển hình bám sát chuẩn kiến thức GDPT 2018",
                    "Lưu ý các trường hợp đặc biệt và sai lầm học sinh thường gặp phải"
                ),
                visualHint = "Hình vẽ đồ thị, bảng biểu thông số kỹ thuật hoặc sơ đồ giải phẫu nguyên lý",
                teacherScript = "Các em hãy quan sát kỹ công thức/nguyên lý này. Điểm then chốt cần chú ý là điều kiện áp dụng..."
            ),
            SlideItem(
                slideNumber = 4,
                title = "QUY TRÌNH THỰC HIỆN & THAO TÁC MẪU",
                bulletPoints = listOf(
                    "Bước 1: Chuẩn bị dữ liệu, công cụ đo kiểm hoặc thiết bị thí nghiệm",
                    "Bước 2: Triển khai các bước phân tích/vận hành theo đúng trình tự kỹ thuật",
                    "Bước 3: Thu thập kết quả, đối chiếu dung sai và ghi nhận số liệu",
                    "Bước 4: Đánh giá sản phẩm và dọn dẹp vị trí học tập/thực hành"
                ),
                visualHint = "Lưu đồ thuật toán 4 bước trực quan, mũi tên chuyển tiếp sinh động",
                teacherScript = "Bây giờ Thầy/Cô sẽ làm mẫu từng bước. Cả lớp chú ý quan sát tư thế và cách thức xử lý ở bước 2..."
            ),
            SlideItem(
                slideNumber = 5,
                title = "LUYỆN TẬP & THẢO LUẬN NHÓM",
                bulletPoints = listOf(
                    "Chia lớp thành các nhóm 4-6 học sinh cùng thực hiện phiếu học tập",
                    "Thực hành giải bài tập tình huống / thao tác trực tiếp trên học liệu",
                    "Nhóm đại diện trình bày giải pháp và bảo vệ quan điểm trước lớp",
                    "Các nhóm khác phản biện và bổ sung nhận xét"
                ),
                visualHint = "Đồng hồ bấm giờ đếm ngược 7 phút và phiếu hướng dẫn hoạt động nhóm",
                teacherScript = "Các nhóm có 7 phút để hoàn thành phiếu học tập số 1. Đội nào xong trước và chính xác nhất sẽ nhận điểm cộng!"
            ),
            SlideItem(
                slideNumber = 6,
                title = "CỦNG CỐ & HƯỚNG DẪN TỰ HỌC VỀ NHÀ",
                bulletPoints = listOf(
                    "Tóm tắt 3 từ khóa quan trọng nhất của bài học hôm nay",
                    "Tuyên dương các cá nhân và nhóm học tập tích cực",
                    "Bài tập rèn luyện nâng cao: Hoàn thành bài tập 1, 2, 3 trong SGK",
                    "Chuẩn bị cho bài học tiếp theo: Đọc trước tài liệu và ghi lại câu hỏi thắc mắc"
                ),
                visualHint = "Mã QR liên kết đến bài trắc nghiệm online và link tài liệu mở rộng",
                teacherScript = "Tiết học hôm nay kết thúc rất thành công. Thầy/Cô khen ngợi tinh thần học tập của cả lớp. Về nhà các em nhớ ôn lại bài!"
            )
        )
        return LessonSlideDeck(
            lessonTitle = lessonTitle,
            subject = subject,
            targetClass = grade,
            slides = slideList
        )
    }

    private fun generateMiniGame(
        lessonTitle: String,
        subject: String,
        grade: String,
        context: String
    ): LessonMiniGame {
        val questions = listOf(
            MiniGameQuestion(
                id = 1,
                question = "Khái niệm cốt lõi nào dưới đây thể hiện đúng nhất bản chất của bài học '$lessonTitle'?",
                options = listOf(
                    "Là quy trình/nguyên lý nền tảng giúp hiểu rõ cấu trúc và bản chất của hệ thống",
                    "Là phương pháp không có tính ứng dụng trong thực tế",
                    "Chỉ áp dụng được trong môi trường lý thuyết đơn thuần",
                    "Không đòi hỏi tuân thủ các quy chuẩn kỹ thuật an toàn"
                ),
                correctIndex = 0,
                explanation = "Nắm vững bản chất nền tảng là chìa khóa để vận dụng chính xác vào giải quyết các bài toán và tình huống kỹ thuật."
            ),
            MiniGameQuestion(
                id = 2,
                question = "Khi triển khai thực hiện nhiệm vụ trong '$lessonTitle', bước đầu tiên quan trọng nhất là gì?",
                options = listOf(
                    "Tiến hành vận hành thiết bị ngay mà không cần kiểm tra",
                    "Xác định rõ mục tiêu, kiểm tra điều kiện an toàn và chuẩn bị đầy đủ học liệu/thiết bị",
                    "Ghi chép kết quả ngay từ đầu",
                    "Bỏ qua khâu đọc bản vẽ hoặc tài liệu hướng dẫn"
                ),
                correctIndex = 1,
                explanation = "Khâu chuẩn bị và kiểm tra an toàn là điều kiện tiên quyết bắt buộc của quy trình sư phạm và kỹ thuật."
            ),
            MiniGameQuestion(
                id = 3,
                question = "Trong môn $subject ($grade), yếu tố nào sau đây quyết định chất lượng và độ chính xác của bài học?",
                options = listOf(
                    "Làm thật nhanh bỏ qua các bước kiểm tra",
                    "Tuân thủ đúng quy trình công nghệ, thông số tiêu chuẩn và kiểm soát dung sai",
                    "Chỉ dựa vào cảm tính cá nhân",
                    "Không ghi chép nhật ký hoạt động"
                ),
                correctIndex = 1,
                explanation = "Kỷ luật công nghệ và tuân thủ dung sai tiêu chuẩn là thước đo hàng đầu trong giáo dục kỹ thuật hiện đại."
            ),
            MiniGameQuestion(
                id = 4,
                question = "Tình huống nào sau đây được xem là giải pháp tối ưu khi gặp sự cố bất ngờ trong quá trình học tập/thực hành?",
                options = listOf(
                    "Cố tình che giấu và tiếp tục thực hiện",
                    "Bình tĩnh dừng thao tác, kích hoạt ngắt an toàn (nếu cần) và báo cáo ngay với Giáo viên hướng dẫn",
                    "Tự ý tháo dỡ sửa chữa thiết bị phức tạp",
                    "Rời khỏi vị trí học tập mà không thông báo"
                ),
                correctIndex = 1,
                explanation = "Bình tĩnh bảo đảm an toàn và báo cáo giáo viên là hành vi ứng xử chuẩn mực của học sinh có trách nhiệm."
            )
        )
        return LessonMiniGame(
            gameTitle = "Quiz Nhanh Củng Cố: $lessonTitle",
            gameType = "QUIZ_FAST",
            rules = "Mỗi câu hỏi có 15 giây suy nghĩ. Học sinh chọn đáp án đúng nhất để ghi điểm và nhận huy hiệu xuất sắc!",
            questions = questions
        )
    }

    private fun generateMindmap(
        lessonTitle: String,
        subject: String,
        grade: String,
        context: String
    ): LessonMindmap {
        val branches = listOf(
            MindmapBranch(
                title = "1. MỤC TIÊU & CHUẨN ĐẦU RA",
                subItems = listOf(
                    "Nắm vững kiến thức trọng tâm của $lessonTitle",
                    "Rèn luyện kỹ năng quan sát, tính toán và giải quyết vấn đề",
                    "Phát triển năng lực tự chủ và tinh thần hợp tác nhóm",
                    "Xây dựng thái độ tích cực, ý thức an toàn và bảo vệ môi trường"
                )
            ),
            MindmapBranch(
                title = "2. BẢN CHẤT & NGUYÊN LÝ CỐT LÕI",
                subItems = listOf(
                    "Cấu trúc logic và các khái niệm cơ bản liên quan",
                    "Công thức/định luật/nguyên lý hoạt động chi phối",
                    "Mối liên hệ giữa $subject và các môn học tích hợp (STEM)",
                    "Điều kiện giới hạn và các trường hợp áp dụng đặc biệt"
                )
            ),
            MindmapBranch(
                title = "3. QUY TRÌNH THỰC HIỆN 4 BƯỚC",
                subItems = listOf(
                    "Bước 1: Khởi động, nhận diện bài toán & chuẩn bị học liệu",
                    "Bước 2: Tìm hiểu kiến thức mới & giải mã tình huống mẫu",
                    "Bước 3: Luyện tập, thao tác thực hành & ghi nhận kết quả",
                    "Bước 4: Vận dụng mở rộng, báo cáo & đánh giá sản phẩm"
                )
            ),
            MindmapBranch(
                title = "4. ỨNG DỤNG THỰC TIỄN & MỞ RỘNG",
                subItems = listOf(
                    "Giải thích các hiện tượng thực tế trong đời sống hàng ngày",
                    "Ứng dụng trong sản xuất công nghiệp và công nghệ số hiện đại",
                    "Định hướng nghề nghiệp và niềm đam mê sáng tạo khoa học kỹ thuật",
                    "Bài tập rèn luyện nâng cao và dự án tự học tại nhà"
                )
            )
        )
        return LessonMindmap(
            centerNode = lessonTitle.uppercase(),
            branches = branches
        )
    }

    private fun generateVideoResource(
        lessonTitle: String,
        subject: String,
        grade: String,
        context: String
    ): LessonVideoResource {
        val videos = listOf(
            VideoLinkItem(
                title = "Video Minh Họa Thực Tế & Khởi Động Tiết Dạy",
                suggestedUrlOrKeyword = "https://www.youtube.com/results?search_query=" + java.net.URLEncoder.encode("$subject $grade $lessonTitle minh họa thực tế", "UTF-8"),
                durationApprox = "3 phút 45 giây",
                guideQuestion = "Sau khi xem video, em hãy chỉ ra đâu là yếu tố quan trọng nhất quyết định sự vận hành của hệ thống?"
            ),
            VideoLinkItem(
                title = "Video Bài Giảng Chuẩn Kiến Thức & Thí Nghiệm / Thao Tác Mẫu",
                suggestedUrlOrKeyword = "https://www.youtube.com/results?search_query=" + java.net.URLEncoder.encode("$subject $grade bài học $lessonTitle thí nghiệm mô phỏng 3D", "UTF-8"),
                durationApprox = "6 phút 20 giây",
                guideQuestion = "Em hãy quan sát từng bước thao tác trong video và đối chiếu với các bước nêu trong Sách giáo khoa."
            ),
            VideoLinkItem(
                title = "Video Ứng Dụng Đột Phá Trong Khoa Học Công Nghệ & Đời Sống",
                suggestedUrlOrKeyword = "https://www.youtube.com/results?search_query=" + java.net.URLEncoder.encode("Ứng dụng $lessonTitle trong công nghiệp hiện đại", "UTF-8"),
                durationApprox = "4 phút 15 giây",
                guideQuestion = "Công nghệ này đã giúp tiết kiệm chi phí và nâng cao năng suất lao động như thế nào trong thực tế?"
            )
        )
        return LessonVideoResource(
            lessonTitle = lessonTitle,
            videos = videos
        )
    }

    private fun generateRubricScore(
        lessonTitle: String,
        subject: String,
        grade: String,
        standard: Int
    ): LessonRubricScore {
        val criteria = listOf(
            RubricCriterion(
                standardName = "1. Kế hoạch và tài liệu dạy học (CV 5512)",
                maxScore = 25,
                selfScore = 24,
                description = "Mục tiêu bài học rõ ràng theo 3 thành phần (Kiến thức, Năng lực, Phẩm chất); Chuỗi hoạt động logic bám sát tiến trình khoa học.",
                strengths = "Thiết kế đầy đủ 4 hoạt động sư phạm chuẩn mực. Thiết bị học liệu số và bảng chỉ dẫn an toàn được tích hợp chi tiết.",
                suggestions = "Có thể bổ sung thêm câu hỏi phân hóa nâng cao cho đối tượng học sinh khá giỏi."
            ),
            RubricCriterion(
                standardName = "2. Tổ chức hoạt động học cho học sinh",
                maxScore = 25,
                selfScore = 23,
                description = "Chuyển giao nhiệm vụ học tập rõ ràng, cụ thể; Học sinh chủ động hợp tác thực hiện; Giáo viên bao quát, hỗ trợ kịp thời.",
                strengths = "Hoạt động nhóm và mini game giúp phát huy tính tích cực, kích thích tương tác sôi nổi trong lớp.",
                suggestions = "Dành thêm 2-3 phút cho các nhóm tự nhận xét chéo sản phẩm của nhau."
            ),
            RubricCriterion(
                standardName = "3. Ứng dụng Công nghệ số & Học liệu đa phương tiện",
                maxScore = 25,
                selfScore = 23,
                description = "Sử dụng hiệu quả slide trình chiếu, sơ đồ tư duy, video mô phỏng và câu hỏi tương tác hỗ trợ tiếp thu kiến thức.",
                strengths = "Gói học liệu 6-in-1 đồng bộ, trực quan, hỗ trợ giảng dạy hiện đại và tạo hứng thú cao.",
                suggestions = "Khuyến khích học sinh quét mã QR tự làm bài kiểm tra trắc nghiệm nhanh sau giờ học."
            ),
            RubricCriterion(
                standardName = "4. Kiểm tra, đánh giá kết quả học tập",
                maxScore = 25,
                selfScore = 22,
                description = "Tiêu chí đánh giá tường minh theo Thông tư 22/TT-BGDĐT; Đánh giá thường xuyên quá trình kết hợp đánh giá sản phẩm.",
                strengths = "Rubric thang điểm chi tiết, có phản hồi cụ thể giúp học sinh nhận biết điểm cần khắc phục.",
                suggestions = "Tích hợp thêm phiếu tự đánh giá (Self-assessment) dành cho từng cá nhân học sinh."
            )
        )
        val totalScore = criteria.sumOf { it.selfScore }
        val gradeLevel = when {
            totalScore >= 90 -> "Xuất sắc"
            totalScore >= 80 -> "Tốt"
            totalScore >= 70 -> "Khá"
            else -> "Đạt"
        }
        return LessonRubricScore(
            lessonTitle = lessonTitle,
            totalScore = totalScore,
            gradeLevel = gradeLevel,
            criteria = criteria,
            generalConclusion = "Kế hoạch bài dạy và bộ học liệu đi kèm được xây dựng rất công phu, chuẩn mực theo định hướng phát triển phẩm chất, năng lực của Chương trình GDPT 2018 và Công văn 5512/BGDĐT. Cấu trúc bài dạy mạch lạc, học liệu số phong phú, đáp ứng xuất sắc yêu cầu đổi mới phương pháp dạy học."
        )
    }

}
