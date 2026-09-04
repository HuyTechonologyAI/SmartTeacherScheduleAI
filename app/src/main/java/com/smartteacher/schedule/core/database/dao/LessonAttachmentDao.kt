package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LessonAttachmentDao {
    @Query("SELECT * FROM lesson_attachments WHERE eventId = :eventId ORDER BY createdAt DESC")
    fun getAttachmentsForEvent(eventId: Long): Flow<List<LessonAttachmentEntity>>

    @Query("SELECT * FROM lesson_attachments WHERE eventId = :eventId ORDER BY createdAt DESC")
    suspend fun getAttachmentsForEventList(eventId: Long): List<LessonAttachmentEntity>

    @Query("SELECT * FROM lesson_attachments WHERE teachingScheduleId = :scheduleId ORDER BY createdAt DESC")
    fun getAttachmentsForSchedule(scheduleId: Long): Flow<List<LessonAttachmentEntity>>

    @Query("SELECT * FROM lesson_attachments WHERE teachingScheduleId = :scheduleId ORDER BY createdAt DESC")
    suspend fun getAttachmentsForScheduleList(scheduleId: Long): List<LessonAttachmentEntity>

    @Query("SELECT * FROM lesson_attachments ORDER BY createdAt DESC")
    fun getAllAttachments(): Flow<List<LessonAttachmentEntity>>

    @Query("SELECT * FROM lesson_attachments WHERE id = :id LIMIT 1")
    suspend fun getAttachmentById(id: Long): LessonAttachmentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttachment(attachment: LessonAttachmentEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttachments(attachments: List<LessonAttachmentEntity>): List<Long>

    @Update
    suspend fun updateAttachment(attachment: LessonAttachmentEntity)

    @Delete
    suspend fun deleteAttachment(attachment: LessonAttachmentEntity)

    @Query("DELETE FROM lesson_attachments WHERE id = :id")
    suspend fun deleteAttachmentById(id: Long)

    @Query("DELETE FROM lesson_attachments WHERE eventId = :eventId")
    suspend fun deleteAttachmentsForEvent(eventId: Long)

    @Query("DELETE FROM lesson_attachments WHERE teachingScheduleId = :scheduleId")
    suspend fun deleteAttachmentsForSchedule(scheduleId: Long)
}
