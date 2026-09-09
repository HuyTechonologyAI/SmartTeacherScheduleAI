package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "attendance_records",
    indices = [
        Index(value = ["date", "studentId", "eventId"]),
        Index(value = ["className", "date"])
    ]
)
data class AttendanceRecordEntity(
    @PrimaryKey
    val id: String,
    val date: String, // YYYY-MM-DD
    val eventId: String = "",
    val scheduleId: String = "",
    val studentId: String,
    val className: String,
    val status: String = "PRESENT", // PRESENT, ABSENT_EXCUSED, ABSENT_UNEXCUSED, LATE
    val kudosDelta: Int = 0,
    val note: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)
