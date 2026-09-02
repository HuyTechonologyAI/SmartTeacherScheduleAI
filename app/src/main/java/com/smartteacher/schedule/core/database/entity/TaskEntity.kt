package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.smartteacher.schedule.core.model.TaskPriority
import com.smartteacher.schedule.core.model.TaskStatus

@Entity(
    tableName = "tasks",
    indices = [
        Index(value = ["dueDate"]),
        Index(value = ["status"]),
        Index(value = ["relatedEventId"])
    ]
)
data class TaskEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String = "",
    val dueDate: String? = null, // YYYY-MM-DD
    val dueTime: String? = null, // HH:mm
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val category: String = "Giáo án",
    val status: TaskStatus = TaskStatus.TODO,
    val relatedEventId: Long? = null,
    val reminderMinutesBefore: Int? = 30,
    val createdAt: Long = System.currentTimeMillis(),
    val completedAt: Long? = null
)
