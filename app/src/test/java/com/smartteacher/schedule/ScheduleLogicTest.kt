package com.smartteacher.schedule

import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity
import com.smartteacher.schedule.core.model.EventSource
import com.smartteacher.schedule.core.model.TaskPriority
import com.smartteacher.schedule.core.model.TaskStatus
import org.junit.Assert.*
import org.junit.Test
import java.time.LocalDate
import java.time.LocalTime
import java.time.temporal.ChronoUnit
import java.util.regex.Pattern

class ScheduleLogicTest {

    @Test
    fun testReminderCalculation_60MinAnd15Min() {
        val eventStartTime = LocalTime.of(8, 0)
        val reminder60 = eventStartTime.minusMinutes(60)
        val reminder15 = eventStartTime.minusMinutes(15)

        assertEquals("07:00", reminder60.toString())
        assertEquals("07:45", reminder15.toString())
    }

    @Test
    fun testScheduleConflictDetection() {
        val event1 = CalendarEventEntity(
            title = "Module CAD/CAM",
            date = "2026-09-02",
            startTime = "08:00",
            endTime = "10:00"
        )
        val event2Conflicting = CalendarEventEntity(
            title = "Thực hành CNC",
            date = "2026-09-02",
            startTime = "09:30",
            endTime = "11:30"
        )
        val event3NonConflicting = CalendarEventEntity(
            title = "Họp khoa",
            date = "2026-09-02",
            startTime = "10:30",
            endTime = "11:30"
        )

        // Overlap condition: event1.startTime < event2.endTime && event2.startTime < event1.endTime
        val hasConflict1And2 = event1.startTime < event2Conflicting.endTime && event2Conflicting.startTime < event1.endTime
        val hasConflict1And3 = event1.startTime < event3NonConflicting.endTime && event3NonConflicting.startTime < event1.endTime

        assertTrue("Event 1 and Event 2 must conflict", hasConflict1And2)
        assertFalse("Event 1 and Event 3 must not conflict", hasConflict1And3)
    }

    @Test
    fun testOverdueTaskDetection() {
        val today = LocalDate.of(2026, 9, 2)
        val overdueTask = TaskEntity(
            title = "Soạn giáo án CNC",
            dueDate = "2026-09-01",
            status = TaskStatus.TODO
        )
        val futureTask = TaskEntity(
            title = "Chấm bài",
            dueDate = "2026-09-05",
            status = TaskStatus.TODO
        )

        val isOverdue = overdueTask.dueDate != null && LocalDate.parse(overdueTask.dueDate).isBefore(today)
        val isFutureOverdue = futureTask.dueDate != null && LocalDate.parse(futureTask.dueDate).isBefore(today)

        assertTrue(isOverdue)
        assertFalse(isFutureOverdue)
    }

    @Test
    fun testVietnameseScheduleTextParsing() {
        val input = "Thứ 2 8h đến 10h dạy CNC lớp CĐCK01 phòng C202"

        // Test day extraction
        val lower = input.lowercase()
        val isMonday = lower.contains("thứ 2")
        assertTrue(isMonday)

        // Test room extraction
        val roomPattern = Pattern.compile("(?:phòng|room|p\\.)\\s*([a-zA-Z0-9]+)", Pattern.CASE_INSENSITIVE)
        val roomMatcher = roomPattern.matcher(input)
        assertTrue(roomMatcher.find())
        assertEquals("C202", roomMatcher.group(1)?.uppercase())

        // Test class extraction
        val classPattern = Pattern.compile("(?:lớp|class)\\s*([a-zA-Z0-9_\\-\\p{L}]+)", Pattern.CASE_INSENSITIVE)
        val classMatcher = classPattern.matcher(input)
        assertTrue(classMatcher.find())
        assertEquals("CĐCK01", classMatcher.group(1)?.uppercase())
    }

    @Test
    fun testBackToBackTeachingBreakDetection() {
        val class1End = LocalTime.parse("10:00")
        val class2Start = LocalTime.parse("10:10")

        val gapMinutes = ChronoUnit.MINUTES.between(class1End, class2Start)
        assertEquals(10, gapMinutes)
        assertTrue("Gap of 10 minutes should trigger tight interval warning", gapMinutes in 0..15)
    }
}
