package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.ReminderEntity
import com.smartteacher.schedule.core.model.TargetType
import kotlinx.coroutines.flow.Flow

@Dao
interface ReminderDao {
    @Query("SELECT * FROM reminders WHERE triggerTimeMillis >= :fromTime AND isCancelled = 0 AND isDelivered = 0 ORDER BY triggerTimeMillis ASC")
    suspend fun getUpcomingActiveReminders(fromTime: Long): List<ReminderEntity>

    @Query("SELECT * FROM reminders WHERE id = :id")
    suspend fun getReminderById(id: Long): ReminderEntity?

    @Query("SELECT * FROM reminders WHERE targetType = :targetType AND targetId = :targetId AND isCancelled = 0")
    suspend fun getRemindersForTarget(targetType: TargetType, targetId: Long): List<ReminderEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminder(reminder: ReminderEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReminders(reminders: List<ReminderEntity>): List<Long>

    @Update
    suspend fun updateReminder(reminder: ReminderEntity)

    @Query("UPDATE reminders SET isDelivered = 1 WHERE id = :id")
    suspend fun markDelivered(id: Long)

    @Query("UPDATE reminders SET isAcknowledged = 1 WHERE id = :id")
    suspend fun markAcknowledged(id: Long)

    @Query("UPDATE reminders SET isCancelled = 1 WHERE targetType = :targetType AND targetId = :targetId")
    suspend fun cancelRemindersForTarget(targetType: TargetType, targetId: Long)

    @Query("SELECT * FROM reminders ORDER BY triggerTimeMillis DESC LIMIT 100")
    fun getAllReminders(): Flow<List<ReminderEntity>>
}
