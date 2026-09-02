package com.smartteacher.schedule.core.database.dao

import androidx.room.*
import com.smartteacher.schedule.core.database.entity.IntegrationConfigEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface IntegrationConfigDao {
    @Query("SELECT * FROM integration_configs WHERE serviceName = :serviceName")
    suspend fun getConfig(serviceName: String): IntegrationConfigEntity?

    @Query("SELECT * FROM integration_configs WHERE serviceName = :serviceName")
    fun getConfigFlow(serviceName: String): Flow<IntegrationConfigEntity?>

    @Query("SELECT * FROM integration_configs")
    fun getAllConfigs(): Flow<List<IntegrationConfigEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun setConfig(config: IntegrationConfigEntity)

    @Query("UPDATE integration_configs SET isEnabled = :isEnabled WHERE serviceName = :serviceName")
    suspend fun setEnabled(serviceName: String, isEnabled: Boolean)
}
