package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.AIInsightEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AIInsightDao {
    @Query("SELECT * FROM ai_insights WHERE isDismissed = 0 ORDER BY createdAt DESC")
    fun getActiveInsights(): Flow<List<AIInsightEntity>>

    @Query("SELECT * FROM ai_insights WHERE isDismissed = 0 ORDER BY createdAt DESC")
    suspend fun getActiveInsightsList(): List<AIInsightEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInsight(insight: AIInsightEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertInsights(insights: List<AIInsightEntity>)

    @Query("UPDATE ai_insights SET isDismissed = 1 WHERE id = :id")
    suspend fun dismissInsight(id: Long)

    @Query("DELETE FROM ai_insights WHERE createdAt < :beforeTime")
    suspend fun deleteOldInsights(beforeTime: Long)
}
