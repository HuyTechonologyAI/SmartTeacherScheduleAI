package com.smartteacher.schedule.core.sync

import android.content.Context
import android.os.Build
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.database.entity.KnowledgeDocumentEntity
import com.smartteacher.schedule.core.database.entity.ClassroomEntity
import com.smartteacher.schedule.core.database.entity.StudentEntity
import com.smartteacher.schedule.core.database.entity.AttendanceRecordEntity
import com.smartteacher.schedule.core.util.ScheduleSyncManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.time.LocalDate
import java.util.concurrent.TimeUnit

/**
 * Động cơ Đồng bộ Đám mây Hai Chiều Thời Gian Thực (Two-Way Real-Time Cloud Sync)
 * Kết nối tự động giữa Điện thoại Android, Máy tính (Windows, Mac, Linux), iPhone và Web.
 * Đồng bộ toàn bộ 288 ca dạy cụ thể trong học kỳ và 16 lịch mẫu định kỳ.
 */
object CloudSyncManager {

    private const val PREFS_NAME = "smart_teacher_cloud_sync"
    private const val KEY_SYNC_CODE = "sync_code"
    private const val KEY_LAST_SYNC_TIME = "last_sync_timestamp"
    private const val KEY_AUTO_SYNC = "auto_sync_enabled"
    private const val BASE_SYNC_URL = "https://www.gvcncdsai.io.vn/api/sync"

    private val httpClient = OkHttpClient.Builder()
        .followRedirects(true)
        .followSslRedirects(true)
        .retryOnConnectionFailure(true)
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(25, TimeUnit.SECONDS)
        .writeTimeout(25, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private const val KEY_SYNC_PIN = "sync_pin"

    /**
     * Lấy hoặc tạo mã đồng bộ đám mây duy nhất cho giáo viên (VD: ST-883921 hoặc mã cá nhân)
     */
    fun getSyncCode(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var code = prefs.getString(KEY_SYNC_CODE, null)
        if (code.isNullOrBlank() || code == "0961364600") {
            val randomNum = (100000..999999).random()
            code = "ST-$randomNum"
            prefs.edit().putString(KEY_SYNC_CODE, code).apply()
        }
        return code
    }

    /**
     * Đặt mã đồng bộ đám mây tùy chọn (ví dụ: Số điện thoại hoặc mã từ máy tính)
     */
    fun setSyncCode(context: Context, newCode: String) {
        val clean = newCode.trim()
        if (clean.isNotBlank()) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_SYNC_CODE, clean)
                .apply()
        }
    }

    fun getSyncPin(context: Context): String? {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_SYNC_PIN, null)
    }

    fun setSyncPin(context: Context, pin: String?) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_SYNC_PIN, pin?.trim())
            .apply()
    }

    fun getLastSyncTime(context: Context): Long {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getLong(KEY_LAST_SYNC_TIME, 0L)
    }

    fun isAutoSyncEnabled(context: Context): Boolean {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getBoolean(KEY_AUTO_SYNC, true)
    }

    fun setAutoSyncEnabled(context: Context, enabled: Boolean) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_AUTO_SYNC, enabled)
            .apply()
    }

    /**
     * ĐẨY (PUSH): Gửi toàn bộ 288 ca dạy cụ thể và 16 lịch mẫu trên Android lên Đám mây
     */
    suspend fun pushToCloud(context: Context): Result<Int> = withContext(Dispatchers.IO) {
        try {
            val db = SmartTeacherDatabase.getInstance(context)
            val syncCode = getSyncCode(context)

            // Đảm bảo các ca dạy đã được sinh đầy đủ
            var allEvents = db.calendarEventDao().getAllEventsSync()
            val schedules = db.teachingScheduleDao().getAllActiveSchedulesList()
            if (allEvents.isEmpty() && schedules.isNotEmpty()) {
                ScheduleSyncManager.syncAndSelfHeal(context)
                allEvents = db.calendarEventDao().getAllEventsSync()
            }

            // 1. Đóng gói 288 ca dạy cụ thể
            val eventsArray = JsonArray()
            for (ev in allEvents) {
                val item = JsonObject().apply {
                    addProperty("id", ev.id.toString())
                    if (ev.teachingScheduleId != null) addProperty("teachingScheduleId", ev.teachingScheduleId)
                    addProperty("title", ev.title)
                    addProperty("subject", ev.subject)
                    addProperty("className", ev.className)
                    addProperty("room", ev.room)
                    addProperty("date", ev.date) // YYYY-MM-DD
                    addProperty("startTime", ev.startTime) // HH:mm
                    addProperty("endTime", ev.endTime) // HH:mm
                    addProperty("sessionType", ev.sessionType) // Lý thuyết / Thực hành
                    addProperty("notes", ev.notes)
                    addProperty("colorHex", ev.colorHex)
                    addProperty("updatedAt", ev.updatedAt)
                }
                eventsArray.add(item)
            }

            // 2. Đóng gói 16 mẫu lịch tuần
            val schedulesArray = JsonArray()
            for (s in schedules) {
                val item = JsonObject().apply {
                    addProperty("id", "sch_${s.id}")
                    addProperty("subject", s.subject)
                    addProperty("className", s.className)
                    addProperty("room", s.room)
                    addProperty("dayOfWeek", s.dayOfWeek) // ISO: 1=Mon .. 7=Sun
                    addProperty("dayOfWeekVn", if (s.dayOfWeek == 7) 8 else s.dayOfWeek + 1) // VN: 2=T2 .. 8=CN
                    addProperty("startTime", s.startTime)
                    addProperty("endTime", s.endTime)
                    addProperty("type", if (s.sessionType.contains("thực hành", true)) "practice" else "theory")
                    addProperty("sessionType", s.sessionType)
                    addProperty("startDate", s.startDate)
                    addProperty("endDate", s.endDate ?: "")
                    addProperty("notes", s.notes)
                    addProperty("updatedAt", s.updatedAt)
                }
                schedulesArray.add(item)
            }

            // 3. Đóng gói danh sách giáo trình, đề cương và tài liệu chuẩn (Knowledge Documents)
            val knowledgeDocsArray = JsonArray()
            val allDocs = db.knowledgeDocumentDao().getAllDocumentsList()
            for (doc in allDocs) {
                // Ignore blacklisted dummy test documents
                if (doc.fileName.contains("giao_trinh_cn10", ignoreCase = true) ||
                    doc.code.contains("gt-cn10", ignoreCase = true) ||
                    doc.title.contains("công nghệ 10 (chuẩn mô đun", ignoreCase = true)) {
                    continue
                }
                val item = JsonObject().apply {
                    addProperty("id", if (doc.isBuiltIn) doc.code else "custom_${doc.id}")
                    addProperty("code", doc.code)
                    addProperty("title", doc.title)
                    addProperty("category", doc.category)
                    addProperty("subject", doc.subject)
                    addProperty("targetLevel", doc.targetLevel)
                    addProperty("content", doc.content)
                    addProperty("isBuiltIn", doc.isBuiltIn)
                    addProperty("isActive", doc.isActive)
                    addProperty("fileName", doc.fileName)
                    addProperty("fileSize", doc.fileSizeBytes)
                    addProperty("fileType", doc.fileExtension)
                    addProperty("updatedAt", doc.updatedAt)
                }
                knowledgeDocsArray.add(item)
            }


            val classroomsArray = JsonArray()
            val allClassrooms = db.classroomDao().getAllClassrooms()
            for (c in allClassrooms) {
                classroomsArray.add(JsonObject().apply {
                    addProperty("id", c.id)
                    addProperty("name", c.name)
                    addProperty("grade", c.grade)
                    addProperty("totalStudents", c.totalStudents)
                    addProperty("academicYear", c.academicYear)
                    addProperty("notes", c.notes)
                    addProperty("updatedAt", c.updatedAt)
                })
            }

            val studentsArray = JsonArray()
            val allStudents = db.studentDao().getAllStudents()
            for (st in allStudents) {
                studentsArray.add(JsonObject().apply {
                    addProperty("id", st.id)
                    addProperty("classId", st.classId)
                    addProperty("className", st.className)
                    addProperty("studentCode", st.studentCode)
                    addProperty("fullName", st.fullName)
                    addProperty("gender", st.gender)
                    addProperty("parentPhone", st.parentPhone)
                    addProperty("parentName", st.parentName)
                    addProperty("kudosPoints", st.kudosPoints)
                    addProperty("notes", st.notes)
                    addProperty("updatedAt", st.updatedAt)
                })
            }

            val attendanceArray = JsonArray()
            val allAttendance = db.attendanceDao().getAllAttendance()
            for (att in allAttendance) {
                attendanceArray.add(JsonObject().apply {
                    addProperty("id", att.id)
                    addProperty("date", att.date)
                    addProperty("eventId", att.eventId)
                    addProperty("scheduleId", att.scheduleId)
                    addProperty("studentId", att.studentId)
                    addProperty("className", att.className)
                    addProperty("status", att.status)
                    addProperty("kudosDelta", att.kudosDelta)
                    addProperty("note", att.note)
                    addProperty("updatedAt", att.updatedAt)
                })
            }

            val deletedKeysArray = JsonArray().apply {
                add("custom_7")
                add("gt-cn10")
                add("giao_trinh_cn10.docx")
                add("file_giao_trinh_cn10.docx")
            }

            val pin = getSyncPin(context)
            val rootObj = JsonObject().apply {
                addProperty("syncCode", syncCode)
                if (!pin.isNullOrBlank()) {
                    addProperty("pin", pin)
                }
                addProperty("platform", "android")
                addProperty("deviceName", "${Build.MANUFACTURER} ${Build.MODEL}")
                addProperty("updatedAt", System.currentTimeMillis())
                addProperty("totalEvents", allEvents.size)
                addProperty("totalSchedules", schedules.size)
                addProperty("totalKnowledgeDocs", knowledgeDocsArray.size())
                add("events", eventsArray)
                add("schedules", schedulesArray)
                add("knowledgeDocs", knowledgeDocsArray)
                add("deletedKnowledgeDocKeys", deletedKeysArray)
                add("classrooms", classroomsArray)
                add("students", studentsArray)
                add("attendanceRecords", attendanceArray)
            }

            val requestBody = rootObj.toString().toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(BASE_SYNC_URL)
                .post(requestBody)
                .build()

            val response = httpClient.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""
            if (response.isSuccessful) {
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .putLong(KEY_LAST_SYNC_TIME, System.currentTimeMillis())
                    .apply()
                Result.success(allEvents.size.coerceAtLeast(schedules.size))
            } else {
                Result.failure(Exception("Lỗi máy chủ đám mây (${response.code}): $responseBody"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    /**
     * KÉO (PULL): Tải dữ liệu lịch dạy mới nhất (cả 288 ca và mẫu tuần) từ Đám mây về Android
     */
    suspend fun pullFromCloud(context: Context): Result<Int> = withContext(Dispatchers.IO) {
        try {
            val syncCode = getSyncCode(context)
            val pin = getSyncPin(context)
            val url = if (!pin.isNullOrBlank()) {
                "$BASE_SYNC_URL?code=$syncCode&pin=$pin"
            } else {
                "$BASE_SYNC_URL?code=$syncCode"
            }

            val request = Request.Builder()
                .url(url)
                .get()
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                val errorBody = response.body?.string() ?: ""
                return@withContext Result.failure(Exception("Lỗi kết nối máy chủ (${response.code}): $errorBody"))
            }

            val responseBody = response.body?.string() ?: ""
            if (responseBody.isBlank()) {
                return@withContext Result.success(0)
            }

            val jsonObject = gson.fromJson(responseBody, JsonObject::class.java)
            val db = SmartTeacherDatabase.getInstance(context)
            val schedulesArray = jsonObject.getAsJsonArray("schedules")
            val eventsArray = jsonObject.getAsJsonArray("events")

            val classroomsArray = jsonObject.getAsJsonArray("classrooms")
            if (classroomsArray != null && classroomsArray.size() > 0) {
                val list = mutableListOf<ClassroomEntity>()
                for (i in 0 until classroomsArray.size()) {
                    val obj = classroomsArray.get(i).asJsonObject
                    list.add(ClassroomEntity(
                        id = obj.get("id")?.asString ?: "cls_${System.currentTimeMillis()}",
                        name = obj.get("name")?.asString ?: "",
                        grade = obj.get("grade")?.asString ?: "",
                        totalStudents = obj.get("totalStudents")?.asInt ?: 0,
                        academicYear = obj.get("academicYear")?.asString ?: "2024-2025",
                        notes = obj.get("notes")?.asString ?: "",
                        updatedAt = obj.get("updatedAt")?.asLong ?: System.currentTimeMillis()
                    ))
                }
                db.classroomDao().insertClassrooms(list)
            }

            val studentsArray = jsonObject.getAsJsonArray("students")
            if (studentsArray != null && studentsArray.size() > 0) {
                val list = mutableListOf<StudentEntity>()
                for (i in 0 until studentsArray.size()) {
                    val obj = studentsArray.get(i).asJsonObject
                    list.add(StudentEntity(
                        id = obj.get("id")?.asString ?: "std_${System.currentTimeMillis()}",
                        classId = obj.get("classId")?.asString ?: "",
                        className = obj.get("className")?.asString ?: "",
                        studentCode = obj.get("studentCode")?.asString ?: "",
                        fullName = obj.get("fullName")?.asString ?: "",
                        gender = obj.get("gender")?.asString ?: "Nam",
                        parentPhone = obj.get("parentPhone")?.asString ?: "",
                        parentName = obj.get("parentName")?.asString ?: "",
                        kudosPoints = obj.get("kudosPoints")?.asInt ?: 0,
                        notes = obj.get("notes")?.asString ?: "",
                        updatedAt = obj.get("updatedAt")?.asLong ?: System.currentTimeMillis()
                    ))
                }
                db.studentDao().insertStudents(list)
            }

            val attendanceArray = jsonObject.getAsJsonArray("attendanceRecords")
            if (attendanceArray != null && attendanceArray.size() > 0) {
                val list = mutableListOf<AttendanceRecordEntity>()
                for (i in 0 until attendanceArray.size()) {
                    val obj = attendanceArray.get(i).asJsonObject
                    list.add(AttendanceRecordEntity(
                        id = obj.get("id")?.asString ?: "att_${System.currentTimeMillis()}",
                        date = obj.get("date")?.asString ?: "",
                        eventId = obj.get("eventId")?.asString ?: "",
                        scheduleId = obj.get("scheduleId")?.asString ?: "",
                        studentId = obj.get("studentId")?.asString ?: "",
                        className = obj.get("className")?.asString ?: "",
                        status = obj.get("status")?.asString ?: "PRESENT",
                        kudosDelta = obj.get("kudosDelta")?.asInt ?: 0,
                        note = obj.get("note")?.asString ?: "",
                        updatedAt = obj.get("updatedAt")?.asLong ?: System.currentTimeMillis()
                    ))
                }
                db.attendanceDao().insertRecords(list)
            }

            val docsArray = jsonObject.getAsJsonArray("knowledgeDocs")

            var changedCount = (classroomsArray?.size() ?: 0) + (studentsArray?.size() ?: 0) + (attendanceArray?.size() ?: 0)

            if ((schedulesArray == null || schedulesArray.size() == 0) &&
                (eventsArray == null || eventsArray.size() == 0) &&
                (docsArray == null || docsArray.size() == 0) &&
                changedCount == 0) {
                return@withContext Result.success(0)
            }

            // 1. Cập nhật các mẫu định kỳ (teaching_schedules)
            if (schedulesArray != null && schedulesArray.size() > 0) {
                val currentSchedules = db.teachingScheduleDao().getAllActiveSchedulesList()
                for (elem in schedulesArray) {
                    val item = elem.asJsonObject
                    val rawIdStr = item.get("id")?.asString?.replace("sch_", "")?.trim() ?: ""
                    val numId = rawIdStr.toLongOrNull()
                    val subject = item.get("subject")?.asString ?: ""
                    val className = item.get("className")?.asString ?: ""
                    val room = item.get("room")?.asString ?: ""
                    val rawDay = item.get("dayOfWeek")?.asInt ?: 1
                    val dayOfWeek = if (item.has("dayOfWeekVn")) {
                        rawDay
                    } else if (rawDay in 2..8) {
                        if (rawDay == 8) 7 else rawDay - 1
                    } else {
                        rawDay.coerceIn(1, 7)
                    }

                    val startTime = item.get("startTime")?.asString ?: "07:00"
                    val endTime = item.get("endTime")?.asString ?: "07:45"
                    val sessionType = item.get("sessionType")?.asString ?: if (item.get("type")?.asString == "practice") "Thực hành" else "Lý thuyết"
                    val startDate = item.get("startDate")?.asString ?: "2026-09-07"
                    val endDate = item.get("endDate")?.asString ?: "2027-02-15"
                    val notes = item.get("notes")?.asString ?: ""
                    val itemUpdatedAt = item.get("updatedAt")?.asLong ?: System.currentTimeMillis()

                    val existing = (if (numId != null && numId > 0) currentSchedules.find { it.id == numId } else null)
                        ?: currentSchedules.find {
                            it.subject.equals(subject, ignoreCase = true) &&
                            it.className.equals(className, ignoreCase = true) &&
                            it.dayOfWeek == dayOfWeek
                        }

                    if (existing != null) {
                        val isDiff = existing.room != room ||
                                     existing.startTime != startTime ||
                                     existing.endTime != endTime ||
                                     existing.sessionType != sessionType ||
                                     existing.startDate != startDate ||
                                     existing.endDate != endDate ||
                                     existing.notes != notes ||
                                     existing.subject != subject ||
                                     existing.className != className ||
                                     existing.dayOfWeek != dayOfWeek

                        if (isDiff && itemUpdatedAt >= existing.updatedAt) {
                            val updated = existing.copy(
                                subject = subject,
                                className = className,
                                dayOfWeek = dayOfWeek,
                                room = room,
                                startTime = startTime,
                                endTime = endTime,
                                sessionType = sessionType,
                                startDate = startDate,
                                endDate = endDate,
                                notes = notes,
                                updatedAt = itemUpdatedAt
                            )
                            db.teachingScheduleDao().updateSchedule(updated)
                            changedCount++
                        }
                    } else {
                        val newSchedule = TeachingScheduleEntity(
                            subject = subject,
                            className = className,
                            room = room,
                            dayOfWeek = dayOfWeek,
                            startTime = startTime,
                            endTime = endTime,
                            sessionType = sessionType,
                            startDate = startDate,
                            endDate = endDate,
                            notes = notes,
                            updatedAt = itemUpdatedAt
                        )
                        db.teachingScheduleDao().insertSchedule(newSchedule)
                        changedCount++
                    }
                }
            }

            // 2. Cập nhật các ca dạy cụ thể (calendar_events)
            if (eventsArray != null && eventsArray.size() > 0) {
                val currentEvents = db.calendarEventDao().getAllEventsSync()
                val toInsert = mutableListOf<CalendarEventEntity>()
                val toUpdate = mutableListOf<CalendarEventEntity>()

                for (elem in eventsArray) {
                    val item = elem.asJsonObject
                    val rawIdStr = item.get("id")?.asString?.replace("ev_", "")?.trim() ?: ""
                    val numId = rawIdStr.toLongOrNull()
                    val subject = item.get("subject")?.asString ?: item.get("title")?.asString ?: ""
                    val className = item.get("className")?.asString ?: ""
                    val room = item.get("room")?.asString ?: ""
                    val date = item.get("date")?.asString ?: ""
                    val startTime = item.get("startTime")?.asString ?: ""
                    val endTime = item.get("endTime")?.asString ?: ""
                    val sessionType = item.get("sessionType")?.asString ?: "Lý thuyết"
                    val notes = item.get("notes")?.asString ?: ""
                    val colorHex = item.get("colorHex")?.asString ?: (if (sessionType.contains("thực hành", true)) "#10B981" else "#0066FF")
                    val tId = if (item.has("teachingScheduleId") && !item.get("teachingScheduleId").isJsonNull) item.get("teachingScheduleId").asLong else null
                    val itemUpdatedAt = item.get("updatedAt")?.asLong ?: System.currentTimeMillis()

                    // Đối soát thông minh: ưu tiên ID nguyên bản, sau đó cặp khóa lịch (tId + date), cuối cùng là (date + startTime + class)
                    val existing = (if (numId != null && numId > 0) currentEvents.find { it.id == numId } else null)
                        ?: (if (tId != null) currentEvents.find { it.teachingScheduleId == tId && it.date == date } else null)
                        ?: currentEvents.find { it.date == date && it.startTime == startTime && it.className.equals(className, ignoreCase = true) }

                    if (existing != null) {
                        val isDiff = existing.room != room ||
                                     existing.subject != subject ||
                                     existing.className != className ||
                                     existing.date != date ||
                                     existing.startTime != startTime ||
                                     existing.endTime != endTime ||
                                     existing.sessionType != sessionType ||
                                     existing.notes != notes ||
                                     existing.colorHex != colorHex

                        if (isDiff && itemUpdatedAt >= existing.updatedAt) {
                            toUpdate.add(
                                existing.copy(
                                    title = subject,
                                    subject = subject,
                                    className = className,
                                    room = room,
                                    date = date,
                                    startTime = startTime,
                                    endTime = endTime,
                                    sessionType = sessionType,
                                    notes = notes,
                                    colorHex = colorHex,
                                    updatedAt = itemUpdatedAt
                                )
                            )
                        }
                    } else if (date.isNotBlank() && startTime.isNotBlank()) {
                        toInsert.add(
                            CalendarEventEntity(
                                teachingScheduleId = tId,
                                title = subject,
                                subject = subject,
                                className = className,
                                room = room,
                                date = date,
                                startTime = startTime,
                                endTime = endTime,
                                sessionType = sessionType,
                                notes = notes,
                                colorHex = colorHex,
                                updatedAt = itemUpdatedAt
                            )
                        )
                    }
                }

                if (toUpdate.isNotEmpty()) {
                    db.calendarEventDao().updateEvents(toUpdate)
                    changedCount += toUpdate.size
                }
                if (toInsert.isNotEmpty()) {
                    db.calendarEventDao().insertEvents(toInsert)
                    changedCount += toInsert.size
                }
            }

            // 3. Cập nhật tài liệu giáo trình, đề cương và văn bản chuẩn (knowledge_documents)
            var currentDocs = db.knowledgeDocumentDao().getAllDocumentsList()

            // A. Purge any blacklisted documents (e.g. Giao_trinh_CN10.docx)
            val blacklistedDocs = currentDocs.filter {
                it.fileName.contains("giao_trinh_cn10", ignoreCase = true) ||
                it.code.contains("gt-cn10", ignoreCase = true) ||
                it.title.contains("công nghệ 10 (chuẩn mô đun", ignoreCase = true)
            }
            for (b in blacklistedDocs) {
                db.knowledgeDocumentDao().deleteDocument(b)
                changedCount++
            }

            // B. Purge any duplicate non-builtin clones of built-in documents (e.g. older -UPDATED copies)
            val duplicateClones = currentDocs.filter {
                !it.isBuiltIn && (
                    it.code.contains("-UPDATED", ignoreCase = true) ||
                    it.code.equals("CV_5512", ignoreCase = true) ||
                    it.code.equals("CV_3456_BGDDT", ignoreCase = true) ||
                    it.code.equals("QD_2422_BGDDT", ignoreCase = true) ||
                    it.code.equals("CV_2634", ignoreCase = true) ||
                    it.code.equals("TT_22_BGDDT", ignoreCase = true) ||
                    it.code.equals("QUY_CHUAN_5S_ATLD", ignoreCase = true) ||
                    it.title.contains("5512", ignoreCase = true) ||
                    it.title.contains("3456", ignoreCase = true) ||
                    it.title.contains("2422", ignoreCase = true)
                )
            }
            for (dup in duplicateClones) {
                db.knowledgeDocumentDao().deleteDocument(dup)
                changedCount++
            }

            // C. Process deleted keys from cloud
            val deletedDocsArray = jsonObject.getAsJsonArray("deletedKnowledgeDocKeys")
            if (deletedDocsArray != null && deletedDocsArray.size() > 0) {
                val deletedKeySet = mutableSetOf<String>()
                for (delElem in deletedDocsArray) {
                    deletedKeySet.add(delElem.asString.trim().lowercase())
                }
                val toDelete = currentDocs.filter {
                    !it.isBuiltIn && (
                        deletedKeySet.contains(it.id.toString()) ||
                        deletedKeySet.contains("custom_${it.id}".lowercase()) ||
                        deletedKeySet.contains(it.code.lowercase()) ||
                        deletedKeySet.contains(it.fileName.lowercase())
                    )
                }
                for (del in toDelete) {
                    db.knowledgeDocumentDao().deleteDocument(del)
                    changedCount++
                }
            }

            // Refresh currentDocs after deletions
            currentDocs = db.knowledgeDocumentDao().getAllDocumentsList()

            if (docsArray != null && docsArray.size() > 0) {
                for (elem in docsArray) {
                    val item = elem.asJsonObject
                    val rawCode = item.get("code")?.asString ?: item.get("id")?.asString ?: ""
                    val title = item.get("title")?.asString ?: ""
                    if (rawCode.isBlank() && title.isBlank()) continue

                    val fileName = item.get("fileName")?.asString ?: ""
                    // Skip blacklisted
                    if (fileName.contains("giao_trinh_cn10", ignoreCase = true) || rawCode.contains("gt-cn10", ignoreCase = true)) {
                        continue
                    }

                    val category = item.get("category")?.asString ?: "GIAO_TRINH"
                    val subject = item.get("subject")?.asString ?: "ALL"
                    val targetLevel = item.get("targetLevel")?.asString ?: "ALL"
                    val content = item.get("content")?.asString ?: ""
                    val isBuiltIn = item.get("isBuiltIn")?.asBoolean ?: false
                    val isActive = if (item.has("isActive")) item.get("isActive").asBoolean else true
                    val fileSize = item.get("fileSize")?.asLong ?: 0L
                    val fileType = item.get("fileType")?.asString ?: ""
                    val itemUpdatedAt = item.get("updatedAt")?.asLong ?: System.currentTimeMillis()

                    // Check if it matches one of the 6 canonical built-in documents in Android
                    val targetBuiltinCode = when {
                        rawCode.contains("5512", ignoreCase = true) || title.contains("5512", ignoreCase = true) -> "CV_5512"
                        rawCode.contains("3456", ignoreCase = true) || title.contains("3456", ignoreCase = true) -> "CV_3456_BGDDT"
                        rawCode.contains("2422", ignoreCase = true) || title.contains("2422", ignoreCase = true) -> "QD_2422_BGDDT"
                        rawCode.contains("2634", ignoreCase = true) || title.contains("2634", ignoreCase = true) -> "CV_2634"
                        rawCode.contains("tt_22", ignoreCase = true) || rawCode.contains("tt 22", ignoreCase = true) || title.contains("22/2021", ignoreCase = true) || title.contains("thông tư 22", ignoreCase = true) -> "TT_22_BGDDT"
                        rawCode.contains("5s", ignoreCase = true) || rawCode.contains("atld", ignoreCase = true) || title.contains("5s", ignoreCase = true) || title.contains("an toàn", ignoreCase = true) -> "QUY_CHUAN_5S_ATLD"
                        else -> null
                    }

                    if (targetBuiltinCode != null) {
                        val builtinDoc = currentDocs.find { it.code == targetBuiltinCode }
                        if (builtinDoc != null) {
                            val isDiff = (fileName.isNotBlank() && builtinDoc.fileName != fileName) ||
                                         (content.length > 500 && builtinDoc.content != content) ||
                                         builtinDoc.isActive != isActive
                            if (isDiff) {
                                val updated = builtinDoc.copy(
                                    isActive = isActive,
                                    fileName = if (fileName.isNotBlank()) fileName else builtinDoc.fileName,
                                    fileSizeBytes = if (fileSize > 0) fileSize else builtinDoc.fileSizeBytes,
                                    fileExtension = if (fileType.isNotBlank()) fileType else builtinDoc.fileExtension,
                                    content = if (content.length > 500) content else builtinDoc.content,
                                    updatedAt = itemUpdatedAt
                                )
                                db.knowledgeDocumentDao().updateDocument(updated)
                                changedCount++
                            }
                        }
                        continue
                    }

                    // Custom document matching
                    val existing = currentDocs.find {
                        !it.isBuiltIn && (
                            (fileName.isNotBlank() && it.fileName.equals(fileName, ignoreCase = true)) ||
                            (rawCode.isNotBlank() && !rawCode.startsWith("DOC_") && it.code.equals(rawCode, ignoreCase = true)) ||
                            (title.isNotBlank() && it.title.equals(title, ignoreCase = true) && subject.isNotBlank() && it.subject.equals(subject, ignoreCase = true))
                        )
                    }

                    if (existing != null) {
                        // Protect rich content: never overwrite with shorter/empty text
                        val preservedContent = if (content.isNotBlank() && (content.length >= existing.content.length || existing.content.isBlank())) {
                            content
                        } else {
                            existing.content
                        }

                        val isDiff = existing.title != title ||
                                     existing.category != category ||
                                     existing.subject != subject ||
                                     existing.targetLevel != targetLevel ||
                                     existing.content != preservedContent ||
                                     existing.isActive != isActive ||
                                     (fileName.isNotBlank() && existing.fileName != fileName)

                        if (isDiff && itemUpdatedAt >= existing.updatedAt) {
                            val updated = existing.copy(
                                title = title,
                                category = category,
                                subject = subject,
                                targetLevel = targetLevel,
                                content = preservedContent,
                                isActive = isActive,
                                fileName = if (fileName.isNotBlank()) fileName else existing.fileName,
                                fileSizeBytes = if (fileSize > 0) fileSize else existing.fileSizeBytes,
                                fileExtension = if (fileType.isNotBlank()) fileType else existing.fileExtension,
                                updatedAt = itemUpdatedAt
                            )
                            db.knowledgeDocumentDao().updateDocument(updated)
                            changedCount++
                        }
                    } else if (category != "PHAP_QUY") {
                        val newDoc = KnowledgeDocumentEntity(
                            code = if (rawCode.isNotBlank()) rawCode else "DOC_${System.currentTimeMillis()}",
                            title = title,
                            category = category,
                            subject = subject,
                            targetLevel = targetLevel,
                            content = content,
                            isBuiltIn = false,
                            isActive = isActive,
                            fileName = fileName,
                            fileSizeBytes = fileSize,
                            fileExtension = fileType,
                            updatedAt = itemUpdatedAt
                        )
                        db.knowledgeDocumentDao().insertDocument(newDoc)
                        changedCount++
                    }
                }
            }

            // Tự động kiểm tra và sinh bù các ca dạy còn thiếu (Self-Healing)
            val healed = ScheduleSyncManager.syncAndSelfHeal(context)
            changedCount += healed

            // Làm mới chuông báo thức, Widget và Màn hình khóa nếu có cập nhật
            if (changedCount > 0) {
                runCatching {
                    val today = LocalDate.now()
                    val upcomingEvents = db.calendarEventDao().getEventsForDateList(today.toString()) +
                                         db.calendarEventDao().getEventsForDateList(today.plusDays(1).toString())
                    val scheduler = com.smartteacher.schedule.core.alarms.AndroidAlarmScheduler(context)
                    for (ev in upcomingEvents) {
                        scheduler.cancelEventReminders(ev.id)
                        if (ev.reminder1Enabled || ev.reminder2Enabled) {
                            scheduler.scheduleEventReminders(ev)
                        }
                    }
                    com.smartteacher.schedule.feature.widget.ScheduleWidgetReceiver.updateAllWidgets(context)
                    com.smartteacher.schedule.feature.lockscreen.LockScreenGlanceManager.updateLockScreenGlance(context)
                }
            }

            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putLong(KEY_LAST_SYNC_TIME, System.currentTimeMillis())
                .apply()

            Result.success(changedCount)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    /**
     * Đồng bộ hai chiều thông minh (Smart 2-Way Sync):
     * 1. KÉO TRƯỚC (PULL FIRST): Tải dữ liệu mới nhất từ Đám mây về máy và hợp nhất vào Room DB.
     * 2. KIỂM TRA ĐỔI MỚI (CHECK LOCAL EDITS): Kiểm tra xem trên điện thoại có ca dạy nào
     *    được giáo viên sửa đổi mới hơn mốc đồng bộ trước đó hay không.
     * 3. ĐẨY SAU (PUSH AFTER): Chỉ gửi dữ liệu lên Đám mây khi có thay đổi thực tế trên điện thoại
     *    (hoặc khi đám mây đang trống), ngăn chặn triệt để việc dữ liệu cũ đè lên dữ liệu mới của máy tính!
     */
    suspend fun syncBothWays(context: Context): Result<String> = withContext(Dispatchers.IO) {
        try {
            val lastSync = getLastSyncTime(context)

            // Bước 1: Kéo cập nhật từ đám mây về trước
            val pullResult = pullFromCloud(context)
            if (pullResult.isFailure) {
                val err = pullResult.exceptionOrNull()?.message ?: "Lỗi khi kết nối Đám mây"
                return@withContext Result.failure(Exception(err))
            }
            val pulledChanges = pullResult.getOrDefault(0)

            // Bước 2: Kiểm tra xem điện thoại có chỉnh sửa nào mới hơn mốc đồng bộ không
            val db = SmartTeacherDatabase.getInstance(context)
            val currentEvents = db.calendarEventDao().getAllEventsSync()
            val currentSchedules = db.teachingScheduleDao().getAllActiveSchedulesList()
            val currentDocs = db.knowledgeDocumentDao().getAllDocumentsList()

            val hasLocalNewerEdits = currentEvents.any { it.updatedAt > lastSync } ||
                                     currentSchedules.any { it.updatedAt > lastSync } ||
                                     currentDocs.any { it.updatedAt > lastSync }

            var pushedCount = 0
            if (hasLocalNewerEdits || lastSync == 0L) {
                val pushResult = pushToCloud(context)
                if (pushResult.isSuccess) {
                    pushedCount = pushResult.getOrDefault(0)
                }
            }

            val msg = when {
                pulledChanges > 0 && pushedCount > 0 ->
                    "Đồng bộ 2 chiều thành công: Đã nhận $pulledChanges mục mới (lịch dạy/tài liệu) từ Máy tính & Đẩy $pushedCount mục từ Điện thoại!"
                pulledChanges > 0 ->
                    "Đồng bộ thành công: Đã cập nhật $pulledChanges mục mới nhất (lịch dạy/giáo trình) từ Máy tính về Điện thoại!"
                pushedCount > 0 ->
                    "Đồng bộ thành công: Đã lưu & đẩy $pushedCount mục từ Điện thoại lên Đám mây!"
                else ->
                    "Dữ liệu giữa Điện thoại và Máy tính đã hoàn toàn khớp nhau (${currentEvents.size} ca dạy, ${currentDocs.size} tài liệu giáo trình)!"
            }

            Result.success(msg)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    /**
     * Kéo chủ động: Nhận toàn bộ cập nhật mới từ Máy tính về Điện thoại
     */
    suspend fun pullFromCloudExplicit(context: Context): Result<String> = withContext(Dispatchers.IO) {
        val res = pullFromCloud(context)
        if (res.isSuccess) {
            val count = res.getOrDefault(0)
            Result.success(if (count > 0) "Đã nhận và cập nhật thành công $count ca dạy từ Máy tính!" else "Lịch dạy trên Điện thoại đã khớp hoàn toàn với Máy tính!")
        } else {
            Result.failure(res.exceptionOrNull() ?: Exception("Lỗi khi tải lịch từ Máy tính"))
        }
    }

    /**
     * Đẩy chủ động: Lưu và đẩy toàn bộ lịch dạy hiện tại của Điện thoại lên Máy tính
     */
    suspend fun pushToCloudExplicit(context: Context): Result<String> = withContext(Dispatchers.IO) {
        val res = pushToCloud(context)
        if (res.isSuccess) {
            val count = res.getOrDefault(0)
            Result.success("Đã đẩy thành công $count ca dạy lên Đám mây cho Máy tính!")
        } else {
            Result.failure(res.exceptionOrNull() ?: Exception("Lỗi khi gửi lịch lên Đám mây"))
        }
    }
}
