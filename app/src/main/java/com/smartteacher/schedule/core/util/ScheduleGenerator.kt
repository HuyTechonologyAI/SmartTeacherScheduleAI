package com.smartteacher.schedule.core.util

import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.model.RecurrenceType
import java.time.LocalDate

object ScheduleGenerator {

    /**
     * Tạo danh sách tất cả các buổi dạy cụ thể (CalendarEventEntity) cho toàn bộ học kỳ
     * dựa trên cấu hình thời khóa biểu định kỳ (TeachingScheduleEntity).
     */
    fun generateEventsForSchedule(
        schedule: TeachingScheduleEntity,
        scheduleId: Long = schedule.id
    ): List<CalendarEventEntity> {
        val events = mutableListOf<CalendarEventEntity>()
        val today = LocalDate.now()
        val parsedStart = try {
            LocalDate.parse(schedule.startDate)
        } catch (e: Exception) {
            today
        }

        val parsedEnd = schedule.endDate?.let {
            try {
                LocalDate.parse(it)
            } catch (e: Exception) {
                null
            }
        } ?: parsedStart.plusMonths(5) // Mặc định 1 học kỳ khoảng 5 tháng (~20-22 tuần)

        if (schedule.recurrenceType == RecurrenceType.ONCE) {
            events.add(
                createEventEntity(
                    schedule = schedule,
                    scheduleId = scheduleId,
                    dateStr = parsedStart.toString()
                )
            )
            return events
        }

        // Lặp định kỳ theo tuần (WEEKLY)
        // Tìm ngày đầu tiên >= parsedStart trùng với dayOfWeek đã chọn (1 = T2 ... 7 = CN)
        var current = parsedStart
        val targetDayOfWeek = schedule.dayOfWeek.coerceIn(1, 7)
        while (current.dayOfWeek.value != targetDayOfWeek) {
            current = current.plusDays(1)
        }

        // Tạo sự kiện cho từng tuần liên tiếp cho đến khi vượt quá parsedEnd
        var weekCount = 0
        val maxWeeks = 52 // Giới hạn an toàn tối đa 1 năm học
        while (!current.isAfter(parsedEnd) && weekCount < maxWeeks) {
            events.add(
                createEventEntity(
                    schedule = schedule,
                    scheduleId = scheduleId,
                    dateStr = current.toString()
                )
            )
            current = current.plusWeeks(1)
            weekCount++
        }

        return events
    }

    private fun createEventEntity(
        schedule: TeachingScheduleEntity,
        scheduleId: Long,
        dateStr: String
    ): CalendarEventEntity {
        return CalendarEventEntity(
            teachingScheduleId = scheduleId,
            title = schedule.subject,
            subject = schedule.subject,
            className = schedule.className,
            room = schedule.room,
            date = dateStr,
            startTime = schedule.startTime,
            endTime = schedule.endTime,
            sessionType = schedule.sessionType,
            notes = schedule.notes,
            reminder1Minutes = schedule.reminder1Minutes,
            reminder2Minutes = schedule.reminder2Minutes,
            reminder1Enabled = schedule.reminder1Enabled,
            reminder2Enabled = schedule.reminder2Enabled
        )
    }
}
