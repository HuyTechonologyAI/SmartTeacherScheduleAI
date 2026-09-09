package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.ClassroomEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ClassroomDao {
    @Query("SELECT * FROM classrooms ORDER BY name ASC")
    fun getAllClassroomsFlow(): Flow<List<ClassroomEntity>>

    @Query("SELECT * FROM classrooms ORDER BY name ASC")
    suspend fun getAllClassrooms(): List<ClassroomEntity>

    @Query("SELECT * FROM classrooms WHERE id = :id LIMIT 1")
    suspend fun getClassroomById(id: String): ClassroomEntity?

    @Query("SELECT * FROM classrooms WHERE LOWER(name) = LOWER(:name) LIMIT 1")
    suspend fun getClassroomByName(name: String): ClassroomEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClassroom(classroom: ClassroomEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClassrooms(classrooms: List<ClassroomEntity>)

    @Update
    suspend fun updateClassroom(classroom: ClassroomEntity)

    @Delete
    suspend fun deleteClassroom(classroom: ClassroomEntity)

    @Query("DELETE FROM classrooms WHERE id = :id")
    suspend fun deleteClassroomById(id: String)
}
