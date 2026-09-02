package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TeachingScheduleDao {
    @Query("SELECT * FROM teaching_schedules WHERE isArchived = 0 ORDER BY dayOfWeek ASC, startTime ASC")
    fun getAllActiveSchedules(): Flow<List<TeachingScheduleEntity>>

    @Query("SELECT * FROM teaching_schedules WHERE isArchived = 0 ORDER BY dayOfWeek ASC, startTime ASC")
    suspend fun getAllActiveSchedulesList(): List<TeachingScheduleEntity>

    @Query("SELECT * FROM teaching_schedules WHERE dayOfWeek = :dayOfWeek AND isArchived = 0 ORDER BY startTime ASC")
    fun getSchedulesByDay(dayOfWeek: Int): Flow<List<TeachingScheduleEntity>>

    @Query("SELECT * FROM teaching_schedules WHERE dayOfWeek = :dayOfWeek AND isArchived = 0 ORDER BY startTime ASC")
    suspend fun getSchedulesByDayList(dayOfWeek: Int): List<TeachingScheduleEntity>

    @Query("SELECT * FROM teaching_schedules WHERE id = :id")
    suspend fun getScheduleById(id: Long): TeachingScheduleEntity?

    @Query("SELECT * FROM teaching_schedules WHERE (subject LIKE '%' || :query || '%' OR className LIKE '%' || :query || '%' OR room LIKE '%' || :query || '%') AND isArchived = 0")
    fun searchSchedules(query: String): Flow<List<TeachingScheduleEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSchedule(schedule: TeachingScheduleEntity): Long

    @Update
    suspend fun updateSchedule(schedule: TeachingScheduleEntity)

    @Delete
    suspend fun deleteSchedule(schedule: TeachingScheduleEntity)

    @Query("UPDATE teaching_schedules SET isArchived = 1 WHERE id = :id")
    suspend fun archiveSchedule(id: Long)
}
