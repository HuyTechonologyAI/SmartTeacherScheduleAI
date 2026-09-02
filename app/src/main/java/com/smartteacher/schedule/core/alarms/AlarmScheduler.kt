package com.smartteacher.schedule.core.alarms

import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.ReminderEntity

interface AlarmScheduler {
    suspend fun scheduleEventReminders(event: CalendarEventEntity)
    suspend fun scheduleCustomReminder(reminder: ReminderEntity)
    suspend fun cancelEventReminders(eventId: Long)
    suspend fun cancelReminder(reminderId: Long)
    fun canScheduleExactAlarms(): Boolean
}
