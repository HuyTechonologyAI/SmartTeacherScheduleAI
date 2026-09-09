package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.AttendanceRecordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AttendanceDao {
    @Query("SELECT * FROM attendance_records ORDER BY date DESC, updatedAt DESC")
    fun getAllAttendanceFlow(): Flow<List<AttendanceRecordEntity>>

    @Query("SELECT * FROM attendance_records ORDER BY date DESC, updatedAt DESC")
    suspend fun getAllAttendance(): List<AttendanceRecordEntity>

    @Query("SELECT * FROM attendance_records WHERE date = :date AND (LOWER(className) = LOWER(:className) OR eventId = :eventId)")
    fun getAttendanceForSessionFlow(date: String, className: String, eventId: String): Flow<List<AttendanceRecordEntity>>

    @Query("SELECT * FROM attendance_records WHERE date = :date AND (LOWER(className) = LOWER(:className) OR eventId = :eventId)")
    suspend fun getAttendanceForSession(date: String, className: String, eventId: String): List<AttendanceRecordEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: AttendanceRecordEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecords(records: List<AttendanceRecordEntity>)

    @Update
    suspend fun updateRecord(record: AttendanceRecordEntity)

    @Query("DELETE FROM attendance_records WHERE id = :id")
    suspend fun deleteRecordById(id: String)
}
