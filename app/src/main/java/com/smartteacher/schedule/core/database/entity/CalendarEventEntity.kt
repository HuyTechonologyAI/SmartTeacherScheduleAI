package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.smartteacher.schedule.core.model.EventSource
import com.smartteacher.schedule.core.model.SyncStatus

@Entity(
    tableName = "calendar_events",
    indices = [
        Index(value = ["date"]),
        Index(value = ["externalId"], unique = false),
        Index(value = ["teachingScheduleId"])
    ]
)
data class CalendarEventEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val teachingScheduleId: Long? = null,
    val title: String,
    val description: String = "",
    val date: String, // YYYY-MM-DD
    val startTime: String, // HH:mm
    val endTime: String, // HH:mm
    val location: String = "",
    val room: String = "",
    val className: String = "",
    val subject: String = "",
    val notes: String = "",
    val source: EventSource = EventSource.LOCAL,
    val externalId: String? = null,
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val colorHex: String = "#0066FF",
    val isTeachingEvent: Boolean = true,
    val isAllDay: Boolean = false,
    val reminder1Minutes: Int = 60,
    val reminder2Minutes: Int = 15,
    val reminder1Enabled: Boolean = true,
    val reminder2Enabled: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
