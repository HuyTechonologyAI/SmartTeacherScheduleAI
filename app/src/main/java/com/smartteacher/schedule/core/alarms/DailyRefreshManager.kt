package com.smartteacher.schedule.core.alarms

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.NotificationLogEntity
import com.smartteacher.schedule.feature.widget.ScheduleWidgetReceiver
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

object DailyRefreshManager {

    const val ACTION_DAILY_MIDNIGHT_REFRESH = "com.smartteacher.schedule.ACTION_DAILY_MIDNIGHT_REFRESH"
    private const val REQUEST_CODE_MIDNIGHT = 999900

    /**
     * Lập lịch báo thức chính xác vào lúc 00:00:00 của ngày tiếp theo.
     * Khi đến 00:00, Android sẽ đánh thức CPU để cập nhật lịch dạy và widget cho ngày mới.
     */
    fun scheduleNextMidnightAlarm(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, DailyMidnightReceiver::class.java).apply {
            action = ACTION_DAILY_MIDNIGHT_REFRESH
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_MIDNIGHT,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val now = LocalDateTime.now()
        val nextMidnight = now.toLocalDate().plusDays(1).atStartOfDay()
        val nextMidnightMillis = nextMidnight.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    nextMidnightMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    nextMidnightMillis,
                    pendingIntent
                )
            }
        } catch (e: SecurityException) {
            alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                nextMidnightMillis,
                pendingIntent
            )
        }
    }

    /**
     * Thực hiện làm mới toàn bộ hệ thống lúc 00:00 hàng ngày:
     * 1. Tạo sự kiện lịch dạy hôm nay từ các thời khóa biểu định kỳ của giáo viên.
     * 2. Kích hoạt chuông báo nhắc giờ cho toàn bộ ca dạy trong ngày.
     * 3. Chuyển các công việc chưa hoàn thành của ngày hôm qua sang hôm nay.
     * 4. Cập nhật lại giao diện Widget trên màn hình chính.
     * 5. Ghi nhật ký vào NotificationLogEntity.
     */
    suspend fun performDailyMidnightRefresh(context: Context) = withContext(Dispatchers.IO) {
        try {
            val db = SmartTeacherDatabase.getInstance(context)
            val scheduler = AndroidAlarmScheduler(context)

            val today = LocalDate.now()
            val todayStr = today.toString()
            val dayOfWeekNum = today.dayOfWeek.value // 1 = Monday, 7 = Sunday

            // 1. Tự động kiểm tra thời khóa biểu định kỳ của thứ hôm nay
            val recurringSchedules = db.teachingScheduleDao().getSchedulesByDayList(dayOfWeekNum)
            var generatedCount = 0

            for (schedule in recurringSchedules) {
                val existingEvent = db.calendarEventDao().getEventByScheduleIdAndDate(schedule.id, todayStr)
                if (existingEvent == null) {
                    val newEvent = CalendarEventEntity(
                        teachingScheduleId = schedule.id,
                        title = schedule.subject,
                        subject = schedule.subject,
                        className = schedule.className,
                        room = schedule.room,
                        date = todayStr,
                        startTime = schedule.startTime,
                        endTime = schedule.endTime,
                        notes = schedule.notes,
                        reminder1Minutes = schedule.reminder1Minutes,
                        reminder2Minutes = schedule.reminder2Minutes,
                        reminder1Enabled = schedule.reminder1Enabled,
                        reminder2Enabled = schedule.reminder2Enabled
                    )
                    val newEventId = db.calendarEventDao().insertEvent(newEvent)
                    scheduler.scheduleEventReminders(newEvent.copy(id = newEventId))
                    generatedCount++
                } else {
                    scheduler.scheduleEventReminders(existingEvent)
                }
            }

            // 2. Kích hoạt lại chuông báo cho tất cả lịch dạy đã nhập trong ngày
            val todayEvents = db.calendarEventDao().getEventsForDateList(todayStr)
            for (ev in todayEvents) {
                if (ev.reminder1Enabled || ev.reminder2Enabled) {
                    scheduler.scheduleEventReminders(ev)
                }
            }

            // 3. Tự động chuyển các việc chưa làm của ngày hôm qua sang ngày mới
            val yesterdayStr = today.minusDays(1).toString()
            val movedTasks = db.taskDao().moveUnfinishedTasksToDate(yesterdayStr, todayStr)

            // 4. Cập nhật Widget ngoài màn hình chính ngay lập tức
            ScheduleWidgetReceiver.updateAllWidgets(context)

            // 5. Ghi nhật ký hệ thống
            db.notificationLogDao().insertLog(
                NotificationLogEntity(
                    event = "MIDNIGHT_AUTO_REFRESH_00:00",
                    title = "Tự động làm mới 00:00",
                    details = "Ngày $todayStr: Khởi tạo $generatedCount ca dạy, chuyển tiếp $movedTasks việc, cập nhật Widget."
                )
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
