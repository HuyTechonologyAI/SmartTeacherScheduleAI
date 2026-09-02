package com.smartteacher.schedule.core.sync

import android.content.Context
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

/**
 * Zalo Integration Architecture (Compliance with Official Zalo OpenAPI & OA Policies).
 *
 * NOTE: As strictly mandated by Android & Google Play privacy policies:
 * 1. Personal Zalo messages CANNOT and MUST NOT be intercepted or scraped.
 * 2. Integration is performed via official Zalo Official Account (OA) Webhook and ZBS Template API.
 */
class ZaloIntegrationManager(private val context: Context) {

    private val database = SmartTeacherDatabase.getInstance(context)

    suspend fun getStatus(): ZaloIntegrationStatus = withContext(Dispatchers.IO) {
        val config = database.integrationConfigDao().getConfig("ZALO")
        if (config == null || !config.isEnabled) {
            return@withContext ZaloIntegrationStatus.Disabled
        }
        try {
            val json = JSONObject(config.configJson)
            val appId = json.optString("app_id")
            val secretKey = json.optString("secret_key")
            val oaId = json.optString("oa_id")

            if (appId.isNotBlank() && secretKey.isNotBlank() && oaId.isNotBlank()) {
                ZaloIntegrationStatus.Configured(oaId = oaId, appId = appId)
            } else {
                ZaloIntegrationStatus.RequiresConfiguration("Chưa cấu hình đầy đủ App ID / Secret Key / OA ID.")
            }
        } catch (e: Exception) {
            ZaloIntegrationStatus.RequiresConfiguration("Lỗi phân tích cấu hình Zalo.")
        }
    }

    sealed class ZaloIntegrationStatus {
        object Disabled : ZaloIntegrationStatus()
        data class RequiresConfiguration(val reason: String) : ZaloIntegrationStatus()
        data class Configured(val oaId: String, val appId: String) : ZaloIntegrationStatus()
    }
}
