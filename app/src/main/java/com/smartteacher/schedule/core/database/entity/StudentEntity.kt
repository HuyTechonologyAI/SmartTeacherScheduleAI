package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "students",
    indices = [
        Index(value = ["classId"]),
        Index(value = ["className"])
    ]
)
data class StudentEntity(
    @PrimaryKey
    val id: String,
    val classId: String,
    val className: String,
    val studentCode: String,
    val fullName: String,
    val gender: String = "Nam",
    val parentPhone: String = "",
    val parentName: String = "",
    val kudosPoints: Int = 0,
    val notes: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)
