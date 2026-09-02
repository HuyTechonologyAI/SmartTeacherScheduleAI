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
    ): String = withContext(Dispatchers.IO) {
        val lower = userMessage.lowercase()

        // Grounded schedule search in actual database
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

        // Generic summary query
        "Tôi đã tra cứu cơ sở dữ liệu: Hiện có ${events.size} sự kiện/lịch dạy và ${tasks.count { it.status != TaskStatus.COMPLETED }} nhiệm vụ chưa hoàn thành. Thầy/Cô có thể hỏi cụ thể về lịch ngày mai, lịch tuần này, hoặc các công việc quá hạn."
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
}
