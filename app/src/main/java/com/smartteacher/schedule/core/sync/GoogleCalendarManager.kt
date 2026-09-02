package com.smartteacher.schedule.core.sync

import android.content.Context
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.model.EventSource
import com.smartteacher.schedule.core.model.SyncStatus
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GoogleCalendarManager(private val context: Context) {

    private val database = SmartTeacherDatabase.getInstance(context)

    companion object {
        val TEACHING_KEYWORDS = listOf(
            "dạy", "giảng", "lecture", "class", "teaching", "module",
            "lesson", "workshop", "thực hành", "cnc", "cad", "cam"
        )
    }

    fun isTeachingEvent(title: String, description: String): Boolean {
        val combined = "$title $description".lowercase()
        return TEACHING_KEYWORDS.any { combined.contains(it) }
    }

    suspend fun importEvent(
        googleEventId: String,
        title: String,
        description: String,
        date: String,
        startTime: String,
        endTime: String,
        location: String
    ): Boolean = withContext(Dispatchers.IO) {
        val existing = database.calendarEventDao().getEventByExternalId(googleEventId, EventSource.GOOGLE_CALENDAR)
        val isTeaching = isTeachingEvent(title, description)

        if (existing != null) {
            // Update existing event
            val updated = existing.copy(
                title = title,
                description = description,
                date = date,
                startTime = startTime,
                endTime = endTime,
                location = location,
                room = extractRoom(location),
                isTeachingEvent = isTeaching,
                syncStatus = SyncStatus.SYNCED,
                updatedAt = System.currentTimeMillis()
            )
            database.calendarEventDao().updateEvent(updated)
            return@withContext false
        } else {
            // Create new imported event
            val newEvent = CalendarEventEntity(
                title = title,
                description = description,
                date = date,
                startTime = startTime,
                endTime = endTime,
                location = location,
                room = extractRoom(location),
                source = EventSource.GOOGLE_CALENDAR,
                externalId = googleEventId,
                syncStatus = SyncStatus.SYNCED,
                isTeachingEvent = isTeaching
            )
            database.calendarEventDao().insertEvent(newEvent)
            return@withContext true
        }
    }

    private fun extractRoom(location: String): String {
        val regex = Regex("""(?:phòng|p\.|p)\s*([a-zA-Z0-9]+)""", RegexOption.IGNORE_CASE)
        return regex.find(location)?.groupValues?.get(1)?.uppercase() ?: location
    }
}
