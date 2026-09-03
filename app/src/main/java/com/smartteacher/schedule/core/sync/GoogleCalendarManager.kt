package com.smartteacher.schedule.core.sync

import android.Manifest
import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.CalendarContract
import androidx.core.content.ContextCompat
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.model.EventSource
import com.smartteacher.schedule.core.model.SyncStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.util.TimeZone

class GoogleCalendarManager(private val context: Context) {

    private val database = SmartTeacherDatabase.getInstance(context)

    companion object {
        val TEACHING_KEYWORDS = listOf(
            "dạy", "giảng", "lecture", "class", "teaching", "module",
            "lesson", "workshop", "thực hành", "cnc", "cad", "cam"
        )

        fun hasCalendarPermissions(context: Context): Boolean {
            val read = ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CALENDAR)
            val write = ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_CALENDAR)
            return read == PackageManager.PERMISSION_GRANTED && write == PackageManager.PERMISSION_GRANTED
        }

        fun openGoogleCalendarApp(context: Context) {
            try {
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("content://com.android.calendar/time")
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                // Fallback to web calendar
                val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://calendar.google.com")).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(webIntent)
            }
        }

        fun insertEventViaIntent(context: Context, event: CalendarEventEntity) {
            try {
                val startMillis = calculateEpochMillis(event.date, event.startTime)
                val endMillis = calculateEpochMillis(event.date, event.endTime)

                val intent = Intent(Intent.ACTION_INSERT).apply {
                    data = CalendarContract.Events.CONTENT_URI
                    putExtra(CalendarContract.Events.TITLE, event.title.ifBlank { event.subject })
                    putExtra(CalendarContract.Events.EVENT_LOCATION, "Phòng ${event.room}")
                    putExtra(
                        CalendarContract.Events.DESCRIPTION,
                        "Lớp: ${event.className}\n${event.notes}\n[Đồng bộ từ Smart Teacher Schedule AI]"
                    )
                    putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, startMillis)
                    putExtra(CalendarContract.EXTRA_EVENT_END_TIME, endMillis)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        private fun calculateEpochMillis(dateStr: String, timeStr: String): Long {
            return try {
                val date = LocalDate.parse(dateStr)
                val time = LocalTime.parse(timeStr)
                val zoneId = ZoneId.systemDefault()
                date.atTime(time).atZone(zoneId).toInstant().toEpochMilli()
            } catch (e: Exception) {
                System.currentTimeMillis()
            }
        }
    }

    /**
     * Gets primary calendar ID from device ContentResolver
     */
    private fun getPrimaryCalendarId(): Long? {
        if (!hasCalendarPermissions(context)) return null

        val projection = arrayOf(
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.IS_PRIMARY,
            CalendarContract.Calendars.ACCOUNT_NAME
        )

        return try {
            val cursor = context.contentResolver.query(
                CalendarContract.Calendars.CONTENT_URI,
                projection,
                null,
                null,
                null
            )
            cursor?.use {
                var firstId: Long? = null
                while (it.moveToNext()) {
                    val id = it.getLong(0)
                    val isPrimary = it.getInt(1)
                    if (firstId == null) firstId = id
                    if (isPrimary == 1) return id
                }
                firstId
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Exports a single event directly to Android Calendar Provider
     */
    suspend fun exportEventToCalendar(event: CalendarEventEntity): Long? = withContext(Dispatchers.IO) {
        if (!hasCalendarPermissions(context)) return@withContext null
        val calendarId = getPrimaryCalendarId() ?: return@withContext null

        val startMillis = calculateEpochMillis(event.date, event.startTime)
        val endMillis = calculateEpochMillis(event.date, event.endTime)
        val timeZone = TimeZone.getDefault().id

        try {
            val values = ContentValues().apply {
                put(CalendarContract.Events.CALENDAR_ID, calendarId)
                put(CalendarContract.Events.TITLE, event.title.ifBlank { event.subject })
                put(CalendarContract.Events.DESCRIPTION, "Lớp: ${event.className}\n${event.notes}\n[Smart Teacher Schedule AI]")
                put(CalendarContract.Events.EVENT_LOCATION, "Phòng ${event.room}")
                put(CalendarContract.Events.DTSTART, startMillis)
                put(CalendarContract.Events.DTEND, endMillis)
                put(CalendarContract.Events.EVENT_TIMEZONE, timeZone)
                put(CalendarContract.Events.HAS_ALARM, 1)
            }

            val uri = context.contentResolver.insert(CalendarContract.Events.CONTENT_URI, values)
            val eventId = uri?.lastPathSegment?.toLongOrNull()

            if (eventId != null) {
                // Add dual reminders (60m and 15m) to Google Calendar
                if (event.reminder1Enabled) {
                    addReminder(eventId, event.reminder1Minutes)
                }
                if (event.reminder2Enabled) {
                    addReminder(eventId, event.reminder2Minutes)
                }

                // Update event in local DB with externalId
                val updated = event.copy(
                    externalId = eventId.toString(),
                    syncStatus = SyncStatus.SYNCED
                )
                database.calendarEventDao().updateEvent(updated)
            }
            eventId
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun addReminder(eventId: Long, minutesBefore: Int) {
        try {
            val reminderValues = ContentValues().apply {
                put(CalendarContract.Reminders.EVENT_ID, eventId)
                put(CalendarContract.Reminders.MINUTES, minutesBefore)
                put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT)
            }
            context.contentResolver.insert(CalendarContract.Reminders.CONTENT_URI, reminderValues)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Exports all teaching events to Google Calendar.
     * Returns count of successfully exported events.
     */
    suspend fun exportAllEvents(): Int = withContext(Dispatchers.IO) {
        if (!hasCalendarPermissions(context)) return@withContext 0
        val allEvents = database.calendarEventDao().getAllEventsSync()
        var count = 0
        for (event in allEvents) {
            val id = exportEventToCalendar(event)
            if (id != null) count++
        }
        count
    }

    fun isTeachingEvent(title: String, description: String): Boolean {
        val combined = "$title $description".lowercase()
        return TEACHING_KEYWORDS.any { combined.contains(it) }
    }
}
