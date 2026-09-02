package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.model.EventSource
import kotlinx.coroutines.flow.Flow

@Dao
interface CalendarEventDao {
    @Query("SELECT * FROM calendar_events ORDER BY date ASC, startTime ASC")
    fun getAllEvents(): Flow<List<CalendarEventEntity>>

    @Query("SELECT * FROM calendar_events WHERE date = :date ORDER BY startTime ASC")
    fun getEventsForDate(date: String): Flow<List<CalendarEventEntity>>

    @Query("SELECT * FROM calendar_events WHERE date = :date ORDER BY startTime ASC")
    suspend fun getEventsForDateList(date: String): List<CalendarEventEntity>

    @Query("SELECT * FROM calendar_events WHERE date BETWEEN :startDate AND :endDate ORDER BY date ASC, startTime ASC")
    fun getEventsBetweenDates(startDate: String, endDate: String): Flow<List<CalendarEventEntity>>

    @Query("SELECT * FROM calendar_events WHERE date BETWEEN :startDate AND :endDate ORDER BY date ASC, startTime ASC")
    suspend fun getEventsBetweenDatesList(startDate: String, endDate: String): List<CalendarEventEntity>

    @Query("SELECT * FROM calendar_events WHERE date >= :date ORDER BY date ASC, startTime ASC")
    suspend fun getUpcomingEvents(date: String): List<CalendarEventEntity>

    @Query("SELECT * FROM calendar_events WHERE id = :id")
    suspend fun getEventById(id: Long): CalendarEventEntity?

    @Query("SELECT * FROM calendar_events WHERE externalId = :externalId AND source = :source LIMIT 1")
    suspend fun getEventByExternalId(externalId: String, source: EventSource): CalendarEventEntity?

    @Query("SELECT * FROM calendar_events WHERE teachingScheduleId = :scheduleId AND date >= :fromDate")
    suspend fun getEventsByScheduleId(scheduleId: Long, fromDate: String): List<CalendarEventEntity>

    @Query("SELECT * FROM calendar_events WHERE title LIKE '%' || :query || '%' OR room LIKE '%' || :query || '%' OR className LIKE '%' || :query || '%'")
    fun searchEvents(query: String): Flow<List<CalendarEventEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: CalendarEventEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvents(events: List<CalendarEventEntity>): List<Long>

    @Update
    suspend fun updateEvent(event: CalendarEventEntity)

    @Delete
    suspend fun deleteEvent(event: CalendarEventEntity)

    @Query("DELETE FROM calendar_events WHERE teachingScheduleId = :scheduleId AND date >= :fromDate")
    suspend fun deleteFutureEventsForSchedule(scheduleId: Long, fromDate: String)
}
