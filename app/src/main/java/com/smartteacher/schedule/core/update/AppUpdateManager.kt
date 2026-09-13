package com.smartteacher.schedule.core.update

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.util.Log
import androidx.core.content.FileProvider
import com.google.gson.Gson
import com.smartteacher.schedule.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.util.concurrent.TimeUnit

data class VersionResponse(
    val versionName: String? = null,
    val versionCode: Int? = null,
    val minRequiredVersion: Int? = null,
    val releaseDate: String? = null,
    val title: String? = null,
    val releaseNotes: List<String>? = null,
    val platforms: PlatformMap? = null
)

data class PlatformMap(
    val android: AndroidPlatformInfo? = null,
    val windows: WindowsPlatformInfo? = null
)

data class AndroidPlatformInfo(
    val versionName: String? = null,
    val versionCode: Int? = null,
    val downloadUrl: String? = null,
    val backupUrl: String? = null,
    val fileName: String? = null,
    val fileSizeMb: Double? = null,
    val isForceUpdate: Boolean? = null
)

data class WindowsPlatformInfo(
    val versionName: String? = null,
    val setupUrl: String? = null
)

object AppUpdateManager {
    private const val TAG = "AppUpdateManager"
    private const val VERSION_API_URL = "https://www.gvcncdsai.io.vn/api/version"

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    suspend fun checkUpdate(): VersionResponse? = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(VERSION_API_URL)
                .build()
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val body = response.body?.string()
                if (!body.isNullOrBlank()) {
                    return@withContext Gson().fromJson(body, VersionResponse::class.java)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking app updates", e)
        }
        return@withContext null
    }

    fun isUpdateAvailable(versionResponse: VersionResponse?): Boolean {
        if (versionResponse == null) return false
        val remoteVersionCode = versionResponse.platforms?.android?.versionCode ?: versionResponse.versionCode ?: 0
        return remoteVersionCode > BuildConfig.VERSION_CODE
    }

    fun startDownloadAndInstall(context: Context, downloadUrl: String, fileName: String = "SmartTeacherSchedule_Update.apk") {
        try {
            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
                ?: return

            val destinationFile = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)
            if (destinationFile.exists()) {
                destinationFile.delete()
            }

            val uri = Uri.parse(downloadUrl)
            val request = DownloadManager.Request(uri).apply {
                setTitle("Đang tải bản cập nhật Smart Teacher")
                setDescription("Đang tải $fileName")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationUri(Uri.fromFile(destinationFile))
                setMimeType("application/vnd.android.package-archive")
            }

            val downloadId = downloadManager.enqueue(request)

            val onCompleteReceiver = object : BroadcastReceiver() {
                override fun onReceive(recvContext: Context?, intent: Intent?) {
                    val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
                    if (id == downloadId) {
                        installApk(context, destinationFile)
                        try {
                            context.unregisterReceiver(this)
                        } catch (_: Exception) {}
                    }
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(
                    onCompleteReceiver,
                    IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                    Context.RECEIVER_EXPORTED
                )
            } else {
                context.registerReceiver(
                    onCompleteReceiver,
                    IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
                )
            }
        } catch (e: Exception) {
            Log.e(TAG, "Download error: ${e.message}", e)
            try {
                val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(browserIntent)
            } catch (_: Exception) {}
        }
    }

    fun installApk(context: Context, apkFile: File) {
        try {
            if (!apkFile.exists()) return
            val authority = "${context.packageName}.fileprovider"
            val contentUri = FileProvider.getUriForFile(context, authority, apkFile)

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
            }
            context.startActivity(installIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Error launching installer", e)
        }
    }
}