package com.smartteacher.schedule.core.ai

import com.smartteacher.schedule.core.model.RiskLevel

data class ScheduleParseResult(
    val title: String,
    val subject: String,
    val className: String,
    val classCode: String = "",
    val dayOfWeek: Int = 1,
    val date: String? = null,
    val startTime: String,
    val endTime: String,
    val room: String = "",
    val notes: String = "",
    val confidence: Float = 0.9f
)

data class DailyBriefingResult(
    val greeting: String,
    val summary: String,
    val upcomingClassesSummary: String,
    val warnings: List<String>,
    val recommendations: List<String>
)

data class WeeklyAnalysisResult(
    val totalTeachingSessions: Int,
    val totalHours: Float,
    val incompleteTasksCount: Int,
    val backToBackWarnings: List<String>,
    val missingPreparationWarnings: List<String>,
    val keyPriorities: List<String>,
    val suggestions: List<String>
)

data class ScheduleRisk(
    val title: String,
    val description: String,
    val riskLevel: RiskLevel,
    val relatedEventId: Long? = null,
    val relatedTaskId: Long? = null
)
