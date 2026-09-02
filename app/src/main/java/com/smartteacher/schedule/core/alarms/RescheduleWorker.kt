package com.smartteacher.schedule.core.alarms

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.NotificationLogEntity
import java.time.LocalDate

class RescheduleWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        return try {
            val db = SmartTeacherDatabase.getInstance(applicationContext)
            val scheduler = AndroidAlarmScheduler(applicationContext)

            val today = LocalDate.now().toString()
            val upcomingEvents = db.calendarEventDao().getUpcomingEvents(today)

            var rearmedCount = 0
            for (event in upcomingEvents) {
                scheduler.scheduleEventReminders(event)
                rearmedCount++
            }

            db.notificationLogDao().insertLog(
                NotificationLogEntity(
                    event = "RESCHEDULE_COMPLETED",
                    title = "Khôi phục lịch nhắc nền",
                    details = "Đã re-arm $rearmedCount sự kiện"
                )
            )

            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }
}
