package com.smartteacher.schedule.core.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Thực thể lưu trữ tệp đính kèm giáo án, bài giảng, tài liệu, bảng điểm hoặc link Google Drive
 * được liên kết với ca dạy (CalendarEventEntity) hoặc thời khóa biểu định kỳ (TeachingScheduleEntity).
 */
@Entity(
    tableName = "lesson_attachments",
    indices = [
        Index(value = ["eventId"]),
        Index(value = ["teachingScheduleId"])
    ]
)
data class LessonAttachmentEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val eventId: Long? = null,
    val teachingScheduleId: Long? = null,
    val fileName: String,
    val filePath: String = "", // Đường dẫn file nội bộ trong context.filesDir/lesson_attachments/
    val mimeType: String = "",
    val fileSizeBytes: Long = 0,
    val fileExtension: String = "", // pdf, docx, pptx, xlsx, jpg, png, link
    val webUrl: String = "", // Google Drive link, OneDrive, Canva, website
    val attachmentType: String = TYPE_FILE, // "FILE" hoặc "WEB_LINK"
    val createdAt: Long = System.currentTimeMillis()
) {
    companion object {
        const val TYPE_FILE = "FILE"
        const val TYPE_WEB_LINK = "WEB_LINK"
    }

    val isWebLink: Boolean
        get() = attachmentType == TYPE_WEB_LINK || webUrl.isNotBlank()
}
