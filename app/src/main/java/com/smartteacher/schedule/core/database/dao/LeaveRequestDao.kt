package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.LeaveRequestEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LeaveRequestDao {
    @Query("SELECT * FROM leave_requests ORDER BY createdAt DESC")
    fun getAllLeaveRequestsFlow(): Flow<List<LeaveRequestEntity>>

    @Query("SELECT * FROM leave_requests ORDER BY createdAt DESC")
    suspend fun getAllLeaveRequests(): List<LeaveRequestEntity>

    @Query("SELECT * FROM leave_requests WHERE status = 'PENDING' ORDER BY createdAt DESC")
    fun getPendingLeaveRequestsFlow(): Flow<List<LeaveRequestEntity>>

    @Query("SELECT COUNT(*) FROM leave_requests WHERE status = 'PENDING'")
    fun getPendingCountFlow(): Flow<Int>

    @Query("SELECT COUNT(*) FROM leave_requests WHERE status = 'PENDING'")
    suspend fun getPendingCount(): Int

    @Query("SELECT * FROM leave_requests WHERE id = :id LIMIT 1")
    suspend fun getLeaveRequestById(id: String): LeaveRequestEntity?

    @Query("SELECT * FROM leave_requests WHERE LOWER(className) = LOWER(:className) ORDER BY createdAt DESC")
    fun getLeaveRequestsByClassFlow(className: String): Flow<List<LeaveRequestEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLeaveRequest(request: LeaveRequestEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLeaveRequests(requests: List<LeaveRequestEntity>)

    @Update
    suspend fun updateLeaveRequest(request: LeaveRequestEntity)

    @Query("UPDATE leave_requests SET status = :status, reviewedAt = :reviewedAt, teacherNote = :teacherNote WHERE id = :id")
    suspend fun updateStatus(id: String, status: String, reviewedAt: Long = System.currentTimeMillis(), teacherNote: String? = null)

    @Delete
    suspend fun deleteLeaveRequest(request: LeaveRequestEntity)

    @Query("DELETE FROM leave_requests WHERE id = :id")
    suspend fun deleteLeaveRequestById(id: String)
}
