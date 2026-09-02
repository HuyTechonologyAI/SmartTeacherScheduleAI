package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "integration_configs")
data class IntegrationConfigEntity(
    @PrimaryKey
    val serviceName: String, // "TELEGRAM", "ZALO", "GOOGLE_CALENDAR", "GEMINI"
    val isEnabled: Boolean = false,
    val configJson: String = "{}",
    val lastSyncTime: Long? = null,
    val statusMessage: String? = null
)
