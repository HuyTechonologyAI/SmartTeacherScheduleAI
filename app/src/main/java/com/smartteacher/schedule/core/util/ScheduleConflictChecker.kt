package com.smartteacher.schedule.core.util

import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity

enum class ConflictType {
    NONE,
    TIME_CONFLICT,      // Trùng giờ dạy của giáo viên
    ROOM_CONFLICT,      // Trùng phòng học
    TIME_AND_ROOM       // Trùng cả giờ dạy và phòng học
}

data class ConflictResult(
    val hasConflict: Boolean = false,
    val type: ConflictType = ConflictType.NONE,
    val conflictingTitle: String = "",
    val conflictingRoom: String = "",
    val conflictingTime: String = "",
    val warningMessage: String = ""
)

object ScheduleConflictChecker {

    /**
     * Checks if two time strings "HH:mm" overlap.
     * Overlap occurs if startA < endB && endA > startB
     */
    fun isTimeOverlap(startA: String, endA: String, startB: String, endB: String): Boolean {
        val minA = timeToMinutes(startA)
        val maxA = timeToMinutes(endA)
        val minB = timeToMinutes(startB)
        val maxB = timeToMinutes(endB)

        if (minA == -1 || maxA == -1 || minB == -1 || maxB == -1) return false
        return minA < maxB && maxA > minB
    }

    private fun timeToMinutes(timeStr: String): Int {
        return try {
            val parts = timeStr.trim().split(":")
            if (parts.size >= 2) {
                parts[0].toInt() * 60 + parts[1].toInt()
            } else -1
        } catch (e: Exception) {
            -1
        }
    }

    /**
     * Checks conflict for an event on a specific date.
     */
    fun checkEventConflict(
        targetDate: String,
        startTime: String,
        endTime: String,
        room: String,
        existingEvents: List<CalendarEventEntity>,
        excludeEventId: Long = -1L
    ): ConflictResult {
        val sameDateEvents = existingEvents.filter {
            it.date == targetDate && it.id != excludeEventId
        }

        for (event in sameDateEvents) {
            if (isTimeOverlap(startTime, endTime, event.startTime, event.endTime)) {
                val isSameRoom = room.isNotBlank() && event.room.isNotBlank() &&
                        room.trim().equals(event.room.trim(), ignoreCase = true)

                val timeStr = "${event.startTime} - ${event.endTime}"
                val titleStr = event.title.ifBlank { event.subject }

                return if (isSameRoom) {
                    ConflictResult(
                        hasConflict = true,
                        type = ConflictType.TIME_AND_ROOM,
                        conflictingTitle = titleStr,
                        conflictingRoom = event.room,
                        conflictingTime = timeStr,
                        warningMessage = "Trùng cả giờ dạy và phòng học (${event.room}) với môn '$titleStr' ($timeStr)!"
                    )
                } else {
                    ConflictResult(
                        hasConflict = true,
                        type = ConflictType.TIME_CONFLICT,
                        conflictingTitle = titleStr,
                        conflictingRoom = event.room,
                        conflictingTime = timeStr,
                        warningMessage = "Trùng giờ giảng dạy ($timeStr) với môn '$titleStr' tại phòng ${event.room.ifBlank { "chưa xếp phòng" }}!"
                    )
                }
            }
        }

        return ConflictResult(hasConflict = false)
    }

    /**
     * Checks conflict for a recurring teaching schedule by dayOfWeek (1..7).
     */
    fun checkScheduleConflict(
        dayOfWeek: Int,
        startTime: String,
        endTime: String,
        room: String,
        existingSchedules: List<TeachingScheduleEntity>,
        excludeScheduleId: Long = -1L
    ): ConflictResult {
        val sameDaySchedules = existingSchedules.filter {
            it.dayOfWeek == dayOfWeek && it.id != excludeScheduleId
        }

        val dayNames = mapOf(1 to "Thứ Hai", 2 to "Thứ Ba", 3 to "Thứ Tư", 4 to "Thứ Năm", 5 to "Thứ Sáu", 6 to "Thứ Bảy", 7 to "Chủ Nhật")
        val dayName = dayNames[dayOfWeek] ?: "Thứ $dayOfWeek"

        for (sch in sameDaySchedules) {
            if (isTimeOverlap(startTime, endTime, sch.startTime, sch.endTime)) {
                val isSameRoom = room.isNotBlank() && sch.room.isNotBlank() &&
                        room.trim().equals(sch.room.trim(), ignoreCase = true)

                val timeStr = "${sch.startTime} - ${sch.endTime}"
                val titleStr = sch.subject

                return if (isSameRoom) {
                    ConflictResult(
                        hasConflict = true,
                        type = ConflictType.TIME_AND_ROOM,
                        conflictingTitle = titleStr,
                        conflictingRoom = sch.room,
                        conflictingTime = timeStr,
                        warningMessage = "Trùng giờ và phòng học ($dayName, $timeStr, ${sch.room}) với môn '$titleStr'!"
                    )
                } else {
                    ConflictResult(
                        hasConflict = true,
                        type = ConflictType.TIME_CONFLICT,
                        conflictingTitle = titleStr,
                        conflictingRoom = sch.room,
                        conflictingTime = timeStr,
                        warningMessage = "Trùng giờ dạy vào $dayName ($timeStr) với môn '$titleStr' (Phòng ${sch.room})!"
                    )
                }
            }
        }

        return ConflictResult(hasConflict = false)
    }
}
