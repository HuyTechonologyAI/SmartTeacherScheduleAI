package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "leave_requests",
    indices = [
        Index(value = ["className", "date"]),
        Index(value = ["status"])
    ]
)
data class LeaveRequestEntity(
    @PrimaryKey
    val id: String,
    val studentId: String,
    val studentCode: String = "",
    val studentName: String,
    val className: String,
    val parentName: String,
    val parentPhone: String,
    val date: String, // YYYY-MM-DD
    val reason: String,
    val type: String = "OTHER", // SICK, FAMILY, OTHER
    val status: String = "PENDING", // PENDING, APPROVED, REJECTED
    val createdAt: Long = System.currentTimeMillis(),
    val reviewedAt: Long? = null,
    val teacherNote: String? = null
)
