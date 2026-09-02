package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.smartteacher.schedule.core.model.RecurrenceType

@Entity(tableName = "teaching_schedules")
data class TeachingScheduleEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val subject: String,
    val className: String,
    val classCode: String = "",
    val dayOfWeek: Int = 1, // 1 = Monday .. 7 = Sunday
    val recurrenceType: RecurrenceType = RecurrenceType.WEEKLY,
    val startDate: String, // YYYY-MM-DD
    val endDate: String? = null, // YYYY-MM-DD
    val startTime: String, // HH:mm
    val endTime: String, // HH:mm
    val room: String = "",
    val campus: String = "",
    val sessionType: String = "Lý thuyết",
    val instructor: String = "",
    val content: String = "",
    val notes: String = "",
    val colorHex: String = "#0066FF",
    val reminder1Minutes: Int = 60,
    val reminder2Minutes: Int = 15,
    val reminder1Enabled: Boolean = true,
    val reminder2Enabled: Boolean = true,
    val isArchived: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
