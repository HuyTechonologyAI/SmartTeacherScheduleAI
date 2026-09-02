package com.smartteacher.schedule.core.ai

import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity

interface AIService {
    suspend fun parseScheduleText(text: String): ScheduleParseResult?
    suspend fun parseScheduleImage(base64Image: String): List<ScheduleParseResult>
    suspend fun generateDailyBriefing(
        todayEvents: List<CalendarEventEntity>,
        incompleteTasks: List<TaskEntity>
    ): DailyBriefingResult
    suspend fun generateWeeklyAnalysis(
        weekEvents: List<CalendarEventEntity>,
        tasks: List<TaskEntity>
    ): WeeklyAnalysisResult
    suspend fun detectScheduleRisks(
        events: List<CalendarEventEntity>,
        tasks: List<TaskEntity>
    ): List<ScheduleRisk>
    suspend fun chatWithScheduleData(
        userMessage: String,
        events: List<CalendarEventEntity>,
        tasks: List<TaskEntity>
    ): String
}
