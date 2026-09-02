package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.smartteacher.schedule.core.model.ReminderType
import com.smartteacher.schedule.core.model.TargetType

@Entity(
    tableName = "reminders",
    indices = [
        Index(value = ["targetType", "targetId"]),
        Index(value = ["triggerTimeMillis"]),
        Index(value = ["isDelivered"])
    ]
)
data class ReminderEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val targetType: TargetType = TargetType.EVENT,
    val targetId: Long,
    val title: String,
    val details: String = "",
    val room: String = "",
    val className: String = "",
    val triggerTimeMillis: Long,
    val minutesBefore: Int,
    val reminderType: ReminderType = ReminderType.FIRST_60M,
    val isDelivered: Boolean = false,
    val isAcknowledged: Boolean = false,
    val isCancelled: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
