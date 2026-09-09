package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "classrooms")
data class ClassroomEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val grade: String = "",
    val totalStudents: Int = 0,
    val academicYear: String = "2024-2025",
    val notes: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)
