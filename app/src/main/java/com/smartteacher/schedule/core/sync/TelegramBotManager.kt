package com.smartteacher.schedule.core.sync

import android.content.Context
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class TelegramBotManager(private val context: Context) {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val database = SmartTeacherDatabase.getInstance(context)

    suspend fun isEnabled(): Boolean = withContext(Dispatchers.IO) {
        val config = database.integrationConfigDao().getConfig("TELEGRAM")
        config?.isEnabled == true
    }

    suspend fun getCredentials(): Pair<String, String>? = withContext(Dispatchers.IO) {
        val config = database.integrationConfigDao().getConfig("TELEGRAM") ?: return@withContext null
        try {
            val json = JSONObject(config.configJson)
            val token = json.optString("bot_token")
            val chatId = json.optString("chat_id")
            if (token.isNotBlank() && chatId.isNotBlank()) {
                Pair(token, chatId)
            } else null
        } catch (e: Exception) {
            null
        }
    }

    suspend fun sendMessage(messageText: String): Boolean = withContext(Dispatchers.IO) {
        val creds = getCredentials() ?: return@withContext false
        val token = creds.first
        val chatId = creds.second

        try {
            val payload = JSONObject().apply {
                put("chat_id", chatId)
                put("text", messageText)
                put("parse_mode", "Markdown")
            }

            val request = Request.Builder()
                .url("https://api.telegram.org/bot$token/sendMessage")
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = httpClient.newCall(request).execute()
            response.isSuccessful
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
