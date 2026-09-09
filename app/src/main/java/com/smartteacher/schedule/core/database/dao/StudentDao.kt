package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.StudentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StudentDao {
    @Query("SELECT * FROM students ORDER BY className ASC, studentCode ASC")
    fun getAllStudentsFlow(): Flow<List<StudentEntity>>

    @Query("SELECT * FROM students ORDER BY className ASC, studentCode ASC")
    suspend fun getAllStudents(): List<StudentEntity>

    @Query("SELECT * FROM students WHERE LOWER(className) = LOWER(:className) OR LOWER(classId) = LOWER(:className) ORDER BY studentCode ASC")
    fun getStudentsByClassFlow(className: String): Flow<List<StudentEntity>>

    @Query("SELECT * FROM students WHERE LOWER(className) = LOWER(:className) OR LOWER(classId) = LOWER(:className) ORDER BY studentCode ASC")
    suspend fun getStudentsByClass(className: String): List<StudentEntity>

    @Query("SELECT * FROM students WHERE id = :id LIMIT 1")
    suspend fun getStudentById(id: String): StudentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudent(student: StudentEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudents(students: List<StudentEntity>)

    @Update
    suspend fun updateStudent(student: StudentEntity)

    @Query("UPDATE students SET kudosPoints = MAX(0, kudosPoints + :delta), updatedAt = :updatedAt WHERE id = :studentId")
    suspend fun updateKudosPoints(studentId: String, delta: Int, updatedAt: Long = System.currentTimeMillis())

    @Delete
    suspend fun deleteStudent(student: StudentEntity)

    @Query("DELETE FROM students WHERE id = :id")
    suspend fun deleteStudentById(id: String)
}
