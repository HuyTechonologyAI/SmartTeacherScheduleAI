package com.smartteacher.schedule.core.util

import android.content.Context
import com.smartteacher.schedule.core.alarms.AndroidAlarmScheduler
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.feature.lockscreen.LockScreenGlanceManager
import com.smartteacher.schedule.feature.widget.ScheduleWidgetReceiver
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDate

object ScheduleSyncManager {

    /**
     * Tự động đồng bộ và tự chữa lành (Self-Healing):
     * Quét toàn bộ bảng teaching_schedules để đảm bảo tất cả các môn dạy định kỳ
     * đều có đầy đủ các ca dạy cụ thể trong calendar_events cho tuần này và toàn bộ học kỳ.
     * Ngăn chặn tuyệt đối tình trạng "mất lịch đã lưu" khi app cập nhật hoặc sau 00:00.
     */
    suspend fun syncAndSelfHeal(context: Context): Int = withContext(Dispatchers.IO) {
        try {
            val db = SmartTeacherDatabase.getInstance(context)
            val schedules = db.teachingScheduleDao().getAllActiveSchedulesList()
            if (schedules.isEmpty()) return@withContext 0

            val today = LocalDate.now()
            val allEvents = db.calendarEventDao().getAllEventsSync()
            var insertedCount = 0

            for (schedule in schedules) {
                val matchingEvents = allEvents.filter { it.teachingScheduleId == schedule.id }
                val hasFutureEvents = matchingEvents.any { ev ->
                    try {
                        !LocalDate.parse(ev.date).isBefore(today)
                    } catch (e: Exception) {
                        false
                    }
                }

                // Nếu thời khóa biểu chưa có sự kiện nào hoặc thiếu các sự kiện tương lai
                if (matchingEvents.isEmpty() || !hasFutureEvents) {
                    val fullSemesterEvents = ScheduleGenerator.generateEventsForSchedule(schedule, schedule.id)
                    val existingDates = matchingEvents.map { it.date }.toSet()
                    val toInsert = fullSemesterEvents.filter { it.date !in existingDates }
                    if (toInsert.isNotEmpty()) {
                        db.calendarEventDao().insertEvents(toInsert)
                        insertedCount += toInsert.size
                    }
                }
            }

            // Đặt lại chuông báo thức cho các ca dạy hôm nay nếu chưa có
            val todayStr = today.toString()
            val todayEvents = db.calendarEventDao().getEventsForDateList(todayStr)
            val scheduler = AndroidAlarmScheduler(context)
            for (ev in todayEvents) {
                if (ev.reminder1Enabled || ev.reminder2Enabled) {
                    runCatching {
                        scheduler.scheduleEventReminders(ev)
                    }
                }
            }

            // Cập nhật Widget và Màn hình khóa
            if (insertedCount > 0) {
                runCatching {
                    ScheduleWidgetReceiver.updateAllWidgets(context)
                    LockScreenGlanceManager.updateLockScreenGlance(context)
                }
            }

            insertedCount
        } catch (e: Exception) {
            e.printStackTrace()
            0
        }
    }
}
