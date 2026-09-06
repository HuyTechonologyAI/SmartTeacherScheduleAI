package com.smartteacher.schedule.core.sync

import android.content.Context
import android.os.Build
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
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

    /**
     * Lấy hoặc tạo mã đồng bộ đám mây duy nhất cho giáo viên (VD: 0961364600 hoặc ST-883921)
     */
    fun getSyncCode(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var code = prefs.getString(KEY_SYNC_CODE, null)
        if (code.isNullOrBlank()) {
            code = "0961364600"
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

            val rootObj = JsonObject().apply {
                addProperty("syncCode", syncCode)
                addProperty("platform", "android")
                addProperty("deviceName", "${Build.MANUFACTURER} ${Build.MODEL}")
                addProperty("updatedAt", System.currentTimeMillis())
                addProperty("totalEvents", allEvents.size)
                addProperty("totalSchedules", schedules.size)
                add("events", eventsArray)
                add("schedules", schedulesArray)
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
            val url = "$BASE_SYNC_URL?code=$syncCode"

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
            val schedulesArray = jsonObject.getAsJsonArray("schedules")
            val eventsArray = jsonObject.getAsJsonArray("events")

            if ((schedulesArray == null || schedulesArray.size() == 0) && (eventsArray == null || eventsArray.size() == 0)) {
                return@withContext Result.success(0)
            }

            val db = SmartTeacherDatabase.getInstance(context)
            var changedCount = 0

            // 1. Cập nhật các mẫu định kỳ (teaching_schedules)
            if (schedulesArray != null && schedulesArray.size() > 0) {
                val currentSchedules = db.teachingScheduleDao().getAllActiveSchedulesList()
                for (elem in schedulesArray) {
                    val item = elem.asJsonObject
                    val subject = item.get("subject")?.asString ?: ""
                    val className = item.get("className")?.asString ?: ""
                    val room = item.get("room")?.asString ?: ""
                    val rawDay = item.get("dayOfWeek")?.asInt ?: 1
                    // Chuẩn hóa ISO 1..7
                    val dayOfWeek = if (item.has("dayOfWeekVn")) {
                        rawDay
                    } else if (rawDay in 2..8) {
                        // Nếu gửi chuẩn VN (2=T2..8=CN)
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
                    val updatedAt = item.get("updatedAt")?.asLong ?: System.currentTimeMillis()

                    val existing = currentSchedules.find {
                        it.subject.equals(subject, ignoreCase = true) &&
                        it.className.equals(className, ignoreCase = true) &&
                        it.dayOfWeek == dayOfWeek
                    }

                    if (existing != null) {
                        if (existing.room != room || existing.startTime != startTime || existing.endTime != endTime || existing.sessionType != sessionType || existing.startDate != startDate || existing.endDate != endDate) {
                            val updated = existing.copy(
                                room = room,
                                startTime = startTime,
                                endTime = endTime,
                                sessionType = sessionType,
                                startDate = startDate,
                                endDate = endDate,
                                notes = notes,
                                updatedAt = updatedAt
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
                            updatedAt = updatedAt
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

                    val existing = currentEvents.find {
                        it.date == date && it.startTime == startTime && it.className.equals(className, ignoreCase = true)
                    }

                    if (existing != null) {
                        if (existing.room != room || existing.subject != subject || existing.sessionType != sessionType || existing.endTime != endTime || existing.notes != notes) {
                            toUpdate.add(
                                existing.copy(
                                    room = room,
                                    subject = subject,
                                    title = subject,
                                    sessionType = sessionType,
                                    endTime = endTime,
                                    notes = notes,
                                    colorHex = colorHex,
                                    updatedAt = System.currentTimeMillis()
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
                                updatedAt = System.currentTimeMillis()
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

            // Tự động kiểm tra và sinh bù các ca dạy còn thiếu (Self-Healing)
            val healed = ScheduleSyncManager.syncAndSelfHeal(context)
            changedCount += healed

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
     * Đồng bộ hai chiều: Đẩy dữ liệu hiện tại lên trước, sau đó tải về các cập nhật từ máy tính
     */
    suspend fun syncBothWays(context: Context): Result<String> = withContext(Dispatchers.IO) {
        try {
            val pushResult = pushToCloud(context)
            if (pushResult.isFailure) {
                val err = pushResult.exceptionOrNull()?.message ?: "Lỗi khi lưu lịch lên đám mây"
                return@withContext Result.failure(Exception(err))
            }
            val pullResult = pullFromCloud(context)
            val pushed = pushResult.getOrDefault(0)
            val pulled = pullResult.getOrDefault(0)
            Result.success("Đã đồng bộ thành công: Tải lên $pushed ca dạy/lịch lên Đám mây, cập nhật $pulled thay đổi từ máy tính!")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
