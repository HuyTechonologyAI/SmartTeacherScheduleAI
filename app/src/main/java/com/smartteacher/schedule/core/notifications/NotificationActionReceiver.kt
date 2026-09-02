package com.smartteacher.schedule.core.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.smartteacher.schedule.core.alarms.AndroidAlarmScheduler
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.NotificationLogEntity
import com.smartteacher.schedule.core.database.entity.ReminderEntity
import com.smartteacher.schedule.core.model.ReminderType
import com.smartteacher.schedule.core.model.TargetType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NotificationActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val reminderId = intent.getLongExtra(NotificationHelper.EXTRA_REMINDER_ID, -1L)
        val eventId = intent.getLongExtra(NotificationHelper.EXTRA_EVENT_ID, -1L)
        val notificationId = intent.getIntExtra(NotificationHelper.EXTRA_NOTIFICATION_ID, 0)

        val notificationHelper = NotificationHelper(context)
        notificationHelper.cancelNotification(notificationId)

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val db = SmartTeacherDatabase.getInstance(context)

                when (action) {
                    NotificationHelper.ACTION_ACKNOWLEDGE -> {
                        if (reminderId > 0) {
                            db.reminderDao().markAcknowledged(reminderId)
                        }
                        db.notificationLogDao().insertLog(
                            NotificationLogEntity(event = "ACKNOWLEDGED", title = "Đã xem thông báo", details = "ID: $reminderId")
                        )
                    }

                    NotificationHelper.ACTION_SNOOZE -> {
                        val subject = intent.getStringExtra("subject") ?: "Lịch dạy"
                        val room = intent.getStringExtra("room") ?: ""
                        val className = intent.getStringExtra("className") ?: ""
                        val startTime = intent.getStringExtra("startTime") ?: ""
                        val endTime = intent.getStringExtra("endTime") ?: ""

                        // Schedule snooze alarm 10 minutes from now
                        val snoozeTrigger = System.currentTimeMillis() + (10 * 60 * 1000L)
                        val snoozeReminder = ReminderEntity(
                            targetType = TargetType.EVENT,
                            targetId = if (eventId > 0) eventId else reminderId,
                            title = subject,
                            details = "Hoãn 10 phút",
                            room = room,
                            className = className,
                            triggerTimeMillis = snoozeTrigger,
                            minutesBefore = 10,
                            reminderType = ReminderType.SNOOZE
                        )

                        val scheduler = AndroidAlarmScheduler(context)
                        scheduler.scheduleCustomReminder(snoozeReminder)

                        db.notificationLogDao().insertLog(
                            NotificationLogEntity(event = "SNOOZED", title = "Hoãn 10 phút", details = "Môn: $subject")
                        )
                    }

                    NotificationHelper.ACTION_DISMISS -> {
                        db.notificationLogDao().insertLog(
                            NotificationLogEntity(event = "DISMISSED", title = "Bỏ qua thông báo", details = "ID: $reminderId")
                        )
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                pendingResult.finish()
            }
        }
    }
}
