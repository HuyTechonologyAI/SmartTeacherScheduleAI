package com.smartteacher.schedule.core.util

import com.google.gson.GsonBuilder
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity

object DataExportHelper {

    private val gson = GsonBuilder().setPrettyPrinting().create()

    fun exportSchedulesToJson(schedules: List<TeachingScheduleEntity>): String {
        return gson.toJson(schedules)
    }

    fun exportEventsToJson(events: List<CalendarEventEntity>): String {
        return gson.toJson(events)
    }

    fun exportTasksToJson(tasks: List<TaskEntity>): String {
        return gson.toJson(tasks)
    }

    fun exportEventsToCsv(events: List<CalendarEventEntity>): String {
        val sb = java.lang.StringBuilder()
        sb.append("Ngày,Bắt đầu,Kết thúc,Môn học/Tiêu đề,Lớp,Phòng học,Ghi chú,Nguồn\n")
        for (e in events) {
            sb.append("\"${e.date}\",")
            sb.append("\"${e.startTime}\",")
            sb.append("\"${e.endTime}\",")
            sb.append("\"${e.title.replace("\"", "\"\"")}\",")
            sb.append("\"${e.className.replace("\"", "\"\"")}\",")
            sb.append("\"${e.room.replace("\"", "\"\"")}\",")
            sb.append("\"${e.notes.replace("\"", "\"\"")}\",")
            sb.append("\"${e.source.name}\"\n")
        }
        return sb.toString()
    }

    fun exportTasksToCsv(tasks: List<TaskEntity>): String {
        val sb = java.lang.StringBuilder()
        sb.append("Tiêu đề,Mô tả,Hạn chót,Giờ,Độ ưu tiên,Trạng thái,Danh mục\n")
        for (t in tasks) {
            sb.append("\"${t.title.replace("\"", "\"\"")}\",")
            sb.append("\"${t.description.replace("\"", "\"\"")}\",")
            sb.append("\"${t.dueDate ?: ""}\",")
            sb.append("\"${t.dueTime ?: ""}\",")
            sb.append("\"${t.priority.name}\",")
            sb.append("\"${t.status.name}\",")
            sb.append("\"${t.category}\"\n")
        }
        return sb.toString()
    }
}
