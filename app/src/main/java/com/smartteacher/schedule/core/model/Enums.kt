package com.smartteacher.schedule.core.model

enum class EventSource {
    LOCAL,
    GOOGLE_CALENDAR,
    TELEGRAM,
    ZALO,
    AI_IMPORTED,
    MANUAL
}

enum class SyncStatus {
    SYNCED,
    PENDING,
    FAILED,
    CONFLICT
}

enum class TaskPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

enum class TaskStatus {
    TODO,
    IN_PROGRESS,
    COMPLETED,
    OVERDUE,
    CANCELLED
}

enum class ReminderType {
    FIRST_60M,
    SECOND_15M,
    CUSTOM,
    SNOOZE
}

enum class TargetType {
    EVENT,
    TASK
}

enum class InsightType {
    WARNING,
    SUGGESTION,
    DAILY_BRIEFING,
    WEEKLY_ANALYSIS,
    TASK_CONFLICT
}

enum class RiskLevel {
    INFO,
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

enum class RecurrenceType {
    ONCE,
    DAILY,
    WEEKLY,
    MONTHLY,
    CUSTOM
}
