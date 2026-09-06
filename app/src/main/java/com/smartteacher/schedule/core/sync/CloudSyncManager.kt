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
 */
object CloudSyncManager {

    private const val PREFS_NAME = "smart_teacher_cloud_sync"
    private const val KEY_SYNC_CODE = "sync_code"
    private const val KEY_LAST_SYNC_TIME = "last_sync_timestamp"
    private const val KEY_AUTO_SYNC = "auto_sync_enabled"
    private const val BASE_SYNC_URL = "https://gvcncdsai.io.vn/api/sync"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    /**
     * Lấy hoặc tạo mã đồng bộ đám mây duy nhất cho giáo viên (VD: ST-883921 hoặc Số điện thoại)
     */
    fun getSyncCode(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var code = prefs.getString(KEY_SYNC_CODE, null)
        if (code.isNullOrBlank()) {
            val randomDigits = (100000..999999).random()
            code = "ST-$randomDigits"
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
     * ĐẨY (PUSH): Gửi toàn bộ lịch dạy hiện tại trên Android lên Đám mây
     */
    suspend fun pushToCloud(context: Context): Result<Int> = withContext(Dispatchers.IO) {
        try {
            val db = SmartTeacherDatabase.getInstance(context)
            val syncCode = getSyncCode(context)
            val schedules = db.teachingScheduleDao().getAllActiveSchedulesList()

            val schedulesArray = JsonArray()
            for (s in schedules) {
                val item = JsonObject().apply {
                    addProperty("id", "sch_${s.id}")
                    addProperty("subject", s.subject)
                    addProperty("className", s.className)
                    addProperty("room", s.room)
                    addProperty("dayOfWeek", s.dayOfWeek)
                    addProperty("startTime", s.startTime)
                    addProperty("endTime", s.endTime)
                    addProperty("type", if (s.sessionType.contains("thực hành", true)) "practice" else "theory")
                    addProperty("sessionType", s.sessionType)
                    addProperty("startDate", s.startDate)
                    addProperty("endDate", s.endDate)
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
                add("schedules", schedulesArray)
            }

            val requestBody = rootObj.toString().toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(BASE_SYNC_URL)
                .post(requestBody)
                .build()

            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                    .edit()
                    .putLong(KEY_LAST_SYNC_TIME, System.currentTimeMillis())
                    .apply()
                Result.success(schedules.size)
            } else {
                Result.failure(Exception("Lỗi máy chủ đám mây: ${response.code}"))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    /**
     * KÉO (PULL): Tải dữ liệu lịch dạy mới nhất từ Đám mây về Android
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
                return@withContext Result.failure(Exception("Không thể kết nối máy chủ đám mây: ${response.code}"))
            }

            val responseBody = response.body?.string() ?: ""
            if (responseBody.isBlank()) {
                return@withContext Result.success(0)
            }

            val jsonObject = gson.fromJson(responseBody, JsonObject::class.java)
            val schedulesArray = jsonObject.getAsJsonArray("schedules")
            if (schedulesArray == null || schedulesArray.size() == 0) {
                return@withContext Result.success(0)
            }

            val db = SmartTeacherDatabase.getInstance(context)
            val currentSchedules = db.teachingScheduleDao().getAllActiveSchedulesList()
            var changedCount = 0

            for (elem in schedulesArray) {
                val item = elem.asJsonObject
                val subject = item.get("subject")?.asString ?: ""
                val className = item.get("className")?.asString ?: ""
                val room = item.get("room")?.asString ?: ""
                val dayOfWeek = item.get("dayOfWeek")?.asInt ?: 2
                val startTime = item.get("startTime")?.asString ?: "07:00"
                val endTime = item.get("endTime")?.asString ?: "07:45"
                val sessionType = item.get("sessionType")?.asString ?: if (item.get("type")?.asString == "practice") "Thực hành" else "Lý thuyết"
                val startDate = item.get("startDate")?.asString ?: "2026-09-07"
                val endDate = item.get("endDate")?.asString ?: "2027-01-25"
                val notes = item.get("notes")?.asString ?: ""
                val updatedAt = item.get("updatedAt")?.asLong ?: System.currentTimeMillis()

                val existing = currentSchedules.find {
                    it.subject.equals(subject, ignoreCase = true) &&
                    it.className.equals(className, ignoreCase = true) &&
                    it.dayOfWeek == dayOfWeek
                }

                if (existing != null) {
                    if (existing.room != room || existing.startTime != startTime || existing.endTime != endTime || existing.sessionType != sessionType) {
                        val updated = existing.copy(
                            room = room,
                            startTime = startTime,
                            endTime = endTime,
                            sessionType = sessionType,
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

            if (changedCount > 0) {
                ScheduleSyncManager.syncAndSelfHeal(context)
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
     * Đồng bộ hai chiều: Tải về các thay đổi trước, sau đó gửi lịch lên đám mây
     */
    suspend fun syncBothWays(context: Context): Result<String> = withContext(Dispatchers.IO) {
        try {
            val pullResult = pullFromCloud(context)
            val pushResult = pushToCloud(context)
            val pulled = pullResult.getOrDefault(0)
            val pushed = pushResult.getOrDefault(0)
            Result.success("Đồng bộ thành công: Tải $pulled thay đổi, lưu $pushed lịch lên Đám mây!")
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}