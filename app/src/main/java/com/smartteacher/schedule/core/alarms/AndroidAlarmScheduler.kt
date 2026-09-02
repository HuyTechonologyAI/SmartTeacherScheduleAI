package com.smartteacher.schedule.core.alarms

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.NotificationLogEntity
import com.smartteacher.schedule.core.database.entity.ReminderEntity
import com.smartteacher.schedule.core.model.ReminderType
import com.smartteacher.schedule.core.model.TargetType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId

class AndroidAlarmScheduler(private val context: Context) : AlarmScheduler {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    private val database = SmartTeacherDatabase.getInstance(context)

    companion object {
        const val ACTION_TRIGGER_REMINDER = "com.smartteacher.schedule.ACTION_TRIGGER_REMINDER"
        const val EXTRA_REMINDER_ID = "extra_reminder_id"
        const val EXTRA_EVENT_ID = "extra_event_id"
        const val EXTRA_TARGET_TYPE = "extra_target_type"
        const val EXTRA_SUBJECT = "extra_subject"
        const val EXTRA_CLASS = "extra_class"
        const val EXTRA_ROOM = "extra_room"
        const val EXTRA_START_TIME = "extra_start_time"
        const val EXTRA_END_TIME = "extra_end_time"
        const val EXTRA_MINUTES_REMAINING = "extra_minutes_remaining"
    }

    override fun canScheduleExactAlarms(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager.canScheduleExactAlarms()
        } else {
            true
        }
    }

    override suspend fun scheduleEventReminders(event: CalendarEventEntity) = withContext(Dispatchers.IO) {
        // Cancel existing reminders for this event first to prevent duplication
        cancelEventReminders(event.id)

        val eventDateTime = parseDateTime(event.date, event.startTime) ?: return@withContext
        val eventEpochMillis = eventDateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli()
        val nowMillis = System.currentTimeMillis()

        // 1. Reminder 1: 60 minutes prior (or customized)
        if (event.reminder1Enabled && event.reminder1Minutes > 0) {
            val trigger1 = eventEpochMillis - (event.reminder1Minutes * 60 * 1000L)
            if (trigger1 > nowMillis) {
                val reminder1 = ReminderEntity(
                    targetType = TargetType.EVENT,
                    targetId = event.id,
                    title = event.title,
                    details = event.description,
                    room = event.room,
                    className = event.className,
                    triggerTimeMillis = trigger1,
                    minutesBefore = event.reminder1Minutes,
                    reminderType = ReminderType.FIRST_60M
                )
                val id = database.reminderDao().insertReminder(reminder1)
                scheduleExactAlarm(
                    reminderId = id,
                    triggerMillis = trigger1,
                    eventId = event.id,
                    subject = event.subject.ifBlank { event.title },
                    className = event.className,
                    room = event.room,
                    startTime = event.startTime,
                    endTime = event.endTime,
                    minutesRemaining = event.reminder1Minutes
                )
            }
        }

        // 2. Reminder 2: 15 minutes prior (or customized)
        if (event.reminder2Enabled && event.reminder2Minutes > 0) {
            val trigger2 = eventEpochMillis - (event.reminder2Minutes * 60 * 1000L)
            if (trigger2 > nowMillis) {
                val reminder2 = ReminderEntity(
                    targetType = TargetType.EVENT,
                    targetId = event.id,
                    title = event.title,
                    details = event.description,
                    room = event.room,
                    className = event.className,
                    triggerTimeMillis = trigger2,
                    minutesBefore = event.reminder2Minutes,
                    reminderType = ReminderType.SECOND_15M
                )
                val id = database.reminderDao().insertReminder(reminder2)
                scheduleExactAlarm(
                    reminderId = id,
                    triggerMillis = trigger2,
                    eventId = event.id,
                    subject = event.subject.ifBlank { event.title },
                    className = event.className,
                    room = event.room,
                    startTime = event.startTime,
                    endTime = event.endTime,
                    minutesRemaining = event.reminder2Minutes
                )
            }
        }
    }

    override suspend fun scheduleCustomReminder(reminder: ReminderEntity) = withContext(Dispatchers.IO) {
        val id = if (reminder.id == 0L) {
            database.reminderDao().insertReminder(reminder)
        } else {
            reminder.id
        }

        scheduleExactAlarm(
            reminderId = id,
            triggerMillis = reminder.triggerTimeMillis,
            eventId = reminder.targetId,
            subject = reminder.title,
            className = reminder.className,
            room = reminder.room,
            startTime = "",
            endTime = "",
            minutesRemaining = reminder.minutesBefore
        )
    }

    override suspend fun cancelEventReminders(eventId: Long) {
        withContext(Dispatchers.IO) {
            val reminders = database.reminderDao().getRemindersForTarget(TargetType.EVENT, eventId)
            reminders.forEach { reminder ->
                cancelAlarmPendingIntent(reminder.id)
            }
            database.reminderDao().cancelRemindersForTarget(TargetType.EVENT, eventId)
            database.notificationLogDao().insertLog(
                NotificationLogEntity(event = "CANCELLED", title = "Hủy nhắc lịch", details = "Event ID: $eventId")
            )
        }
    }

    override suspend fun cancelReminder(reminderId: Long) {
        withContext(Dispatchers.IO) {
            cancelAlarmPendingIntent(reminderId)
            database.reminderDao().markAcknowledged(reminderId)
        }
    }

    private fun scheduleExactAlarm(
        reminderId: Long,
        triggerMillis: Long,
        eventId: Long,
        subject: String,
        className: String,
        room: String,
        startTime: String,
        endTime: String,
        minutesRemaining: Int
    ) {
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = ACTION_TRIGGER_REMINDER
            putExtra(EXTRA_REMINDER_ID, reminderId)
            putExtra(EXTRA_EVENT_ID, eventId)
            putExtra(EXTRA_SUBJECT, subject)
            putExtra(EXTRA_CLASS, className)
            putExtra(EXTRA_ROOM, room)
            putExtra(EXTRA_START_TIME, startTime)
            putExtra(EXTRA_END_TIME, endTime)
            putExtra(EXTRA_MINUTES_REMAINING, minutesRemaining)
        }

        val requestCode = (reminderId % Int.MAX_VALUE).toInt()
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val showIntent = Intent(context, com.smartteacher.schedule.MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val showPendingIntent = PendingIntent.getActivity(
            context,
            requestCode + 500000,
            showIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            val alarmClockInfo = AlarmManager.AlarmClockInfo(triggerMillis, showPendingIntent)
            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)

            logScheduling(
                event = "SCHEDULED_ALARM_CLOCK",
                title = "Đặt báo thức AlarmClock: $subject",
                details = "ID=$reminderId, In=$minutesRemaining min, Time=$triggerMillis"
            )
        } catch (e: SecurityException) {
            // Fallback if setAlarmClock permission is restricted
            try {
                if (canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerMillis,
                        pendingIntent
                    )
                }
            } catch (e2: Exception) {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerMillis,
                    pendingIntent
                )
            }
            logScheduling("EXACT_ALARM_FALLBACK", "Báo động fallback: $subject", e.message ?: "")
        }
    }

    private fun cancelAlarmPendingIntent(reminderId: Long) {
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = ACTION_TRIGGER_REMINDER
        }
        val requestCode = (reminderId % Int.MAX_VALUE).toInt()
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
    }

    private fun logScheduling(event: String, title: String, details: String) {
        kotlinx.coroutines.CoroutineScope(Dispatchers.IO).launch {
            runCatching {
                database.notificationLogDao().insertLog(
                    NotificationLogEntity(event = event, title = title, details = details)
                )
            }
        }
    }

    private fun parseDateTime(date: String, time: String): LocalDateTime? {
        return runCatching {
            val localDate = LocalDate.parse(date)
            val localTime = LocalTime.parse(time)
            LocalDateTime.of(localDate, localTime)
        }.getOrNull()
    }
}
