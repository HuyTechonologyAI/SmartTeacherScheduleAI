package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import com.smartteacher.schedule.core.model.InsightType
import com.smartteacher.schedule.core.model.RiskLevel

@Entity(
    tableName = "ai_insights",
    indices = [
        Index(value = ["createdAt"]),
        Index(value = ["isDismissed"])
    ]
)
data class AIInsightEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val type: InsightType,
    val title: String,
    val content: String,
    val riskLevel: RiskLevel = RiskLevel.INFO,
    val actionPayload: String? = null,
    val isDismissed: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
