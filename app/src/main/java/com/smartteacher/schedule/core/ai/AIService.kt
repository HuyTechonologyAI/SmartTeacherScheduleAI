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

    suspend fun chatWithPedagogicalAssistant(
        userMessage: String,
        events: List<CalendarEventEntity>,
        tasks: List<TaskEntity>,
        referenceDocsText: String = ""
    ): String

    // TRỤ CỘT 2: Soạn Kế Hoạch Bài Dạy Chuẩn CV 5512 & CV 2634 và Ma Trận Đề Thi
    suspend fun generateLessonPlan5512(
        lessonName: String,
        subject: String,
        grade: String,
        durationPeriods: Int = 1,
        customObjectives: String = "",
        referenceContext: String = ""
    ): LessonPlan5512Result

    suspend fun generateLessonPlan2634(
        moduleName: String,
        lessonName: String,
        profession: String,
        trainingLevel: String = "Trung cấp",
        durationHours: Float = 4.0f,
        customSafety: String = "",
        referenceContext: String = ""
    ): LessonPlan2634Result

    suspend fun generateExamMatrix(
        topic: String,
        subject: String,
        gradeOrClass: String,
        questionCount: Int = 10,
        referenceContext: String = ""
    ): ExamMatrixResult
}
