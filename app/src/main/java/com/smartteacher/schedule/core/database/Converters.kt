package com.smartteacher.schedule.core.database

import androidx.room.TypeConverter
import com.smartteacher.schedule.core.model.*

class Converters {
    @TypeConverter
    fun fromEventSource(value: EventSource): String = value.name

    @TypeConverter
    fun toEventSource(value: String): EventSource = runCatching { EventSource.valueOf(value) }.getOrDefault(EventSource.LOCAL)

    @TypeConverter
    fun fromSyncStatus(value: SyncStatus): String = value.name

    @TypeConverter
    fun toSyncStatus(value: String): SyncStatus = runCatching { SyncStatus.valueOf(value) }.getOrDefault(SyncStatus.SYNCED)

    @TypeConverter
    fun fromTaskPriority(value: TaskPriority): String = value.name

    @TypeConverter
    fun toTaskPriority(value: String): TaskPriority = runCatching { TaskPriority.valueOf(value) }.getOrDefault(TaskPriority.MEDIUM)

    @TypeConverter
    fun fromTaskStatus(value: TaskStatus): String = value.name

    @TypeConverter
    fun toTaskStatus(value: String): TaskStatus = runCatching { TaskStatus.valueOf(value) }.getOrDefault(TaskStatus.TODO)

    @TypeConverter
    fun fromReminderType(value: ReminderType): String = value.name

    @TypeConverter
    fun toReminderType(value: String): ReminderType = runCatching { ReminderType.valueOf(value) }.getOrDefault(ReminderType.FIRST_60M)

    @TypeConverter
    fun fromTargetType(value: TargetType): String = value.name

    @TypeConverter
    fun toTargetType(value: String): TargetType = runCatching { TargetType.valueOf(value) }.getOrDefault(TargetType.EVENT)

    @TypeConverter
    fun fromInsightType(value: InsightType): String = value.name

    @TypeConverter
    fun toInsightType(value: String): InsightType = runCatching { InsightType.valueOf(value) }.getOrDefault(InsightType.WARNING)

    @TypeConverter
    fun fromRiskLevel(value: RiskLevel): String = value.name

    @TypeConverter
    fun toRiskLevel(value: String): RiskLevel = runCatching { RiskLevel.valueOf(value) }.getOrDefault(RiskLevel.INFO)

    @TypeConverter
    fun fromRecurrenceType(value: RecurrenceType): String = value.name

    @TypeConverter
    fun toRecurrenceType(value: String): RecurrenceType = runCatching { RecurrenceType.valueOf(value) }.getOrDefault(RecurrenceType.WEEKLY)
}
