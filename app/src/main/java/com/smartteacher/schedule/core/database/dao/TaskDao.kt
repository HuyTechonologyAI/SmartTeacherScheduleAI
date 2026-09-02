package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.TaskEntity
import com.smartteacher.schedule.core.model.TaskStatus
import kotlinx.coroutines.flow.Flow

@Dao
interface TaskDao {
    @Query("SELECT * FROM tasks ORDER BY status ASC, dueDate ASC, priority DESC")
    fun getAllTasks(): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE status != 'COMPLETED' AND status != 'CANCELLED' ORDER BY dueDate ASC, priority DESC")
    fun getIncompleteTasks(): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE status != 'COMPLETED' AND status != 'CANCELLED' ORDER BY dueDate ASC, priority DESC")
    suspend fun getIncompleteTasksList(): List<TaskEntity>

    @Query("SELECT * FROM tasks WHERE dueDate = :date ORDER BY status ASC, priority DESC")
    fun getTasksForDate(date: String): Flow<List<TaskEntity>>

    @Query("SELECT * FROM tasks WHERE dueDate < :today AND status != 'COMPLETED' AND status != 'CANCELLED'")
    suspend fun getOverdueTasks(today: String): List<TaskEntity>

    @Query("SELECT * FROM tasks WHERE relatedEventId = :eventId")
    suspend fun getTasksForEvent(eventId: Long): List<TaskEntity>

    @Query("SELECT * FROM tasks WHERE id = :id")
    suspend fun getTaskById(id: Long): TaskEntity?

    @Query("SELECT * FROM tasks WHERE title LIKE '%' || :query || '%'")
    fun searchTasks(query: String): Flow<List<TaskEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTask(task: TaskEntity): Long

    @Update
    suspend fun updateTask(task: TaskEntity)

    @Delete
    suspend fun deleteTask(task: TaskEntity)

    @Query("UPDATE tasks SET status = :status, completedAt = :completedAt WHERE id = :id")
    suspend fun updateTaskStatus(id: Long, status: TaskStatus, completedAt: Long?)

    @Query("UPDATE tasks SET dueDate = :newDate WHERE dueDate = :oldDate AND status != 'COMPLETED' AND status != 'CANCELLED'")
    suspend fun moveUnfinishedTasksToDate(oldDate: String, newDate: String): Int

    @Query("DELETE FROM tasks WHERE title IN ('Soạn giáo án Module CAD/CAM', 'Chuẩn bị phôi nhôm thực hành CNC')")
    suspend fun deleteDemoTasks()
}
