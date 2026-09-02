package com.smartteacher.schedule.core.alarms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.notifications.NotificationHelper
import com.smartteacher.schedule.core.sync.TelegramBotManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != AndroidAlarmScheduler.ACTION_TRIGGER_REMINDER) return

        val reminderId = intent.getLongExtra(AndroidAlarmScheduler.EXTRA_REMINDER_ID, -1L)
        val eventId = intent.getLongExtra(AndroidAlarmScheduler.EXTRA_EVENT_ID, -1L)
        val subject = intent.getStringExtra(AndroidAlarmScheduler.EXTRA_SUBJECT) ?: "Lịch dạy"
        val className = intent.getStringExtra(AndroidAlarmScheduler.EXTRA_CLASS) ?: ""
        val room = intent.getStringExtra(AndroidAlarmScheduler.EXTRA_ROOM) ?: ""
        val startTime = intent.getStringExtra(AndroidAlarmScheduler.EXTRA_START_TIME) ?: ""
        val endTime = intent.getStringExtra(AndroidAlarmScheduler.EXTRA_END_TIME) ?: ""
        val minutesRemaining = intent.getIntExtra(AndroidAlarmScheduler.EXTRA_MINUTES_REMAINING, 15)

        val powerManager = context.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
        val wakeLock = powerManager.newWakeLock(
            android.os.PowerManager.PARTIAL_WAKE_LOCK,
            "SmartTeacher:AlarmReceiverWakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(60000L) // 60 seconds max
        }

        val notificationHelper = NotificationHelper(context)
        notificationHelper.showTeachingReminderNotification(
            reminderId = reminderId,
            eventId = eventId,
            subject = subject,
            className = className,
            room = room,
            startTime = startTime,
            endTime = endTime,
            minutesRemaining = minutesRemaining
        )

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val db = SmartTeacherDatabase.getInstance(context)
                if (reminderId > 0) {
                    db.reminderDao().markDelivered(reminderId)
                }

                // If Telegram integration is enabled, forward reminder to Telegram Bot!
                val telegramManager = TelegramBotManager(context)
                if (telegramManager.isEnabled()) {
                    val roomText = if (room.isNotBlank()) "Phòng: $room" else ""
                    val classText = if (className.isNotBlank()) "Lớp: $className" else ""
                    val msg = """
                        ⏰ *NHẮC LỊCH DẠY* (Còn $minutesRemaining phút)
                        
                        *Môn*: $subject
                        $classText
                        $roomText
                        *Thời gian*: $startTime - $endTime
                    """.trimIndent()
                    telegramManager.sendMessage(msg)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                try {
                    if (wakeLock.isHeld) {
                        wakeLock.release()
                    }
                } catch (ignored: Exception) {}
                pendingResult.finish()
            }
        }
    }
}
