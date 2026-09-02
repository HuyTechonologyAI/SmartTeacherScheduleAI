package com.smartteacher.schedule.core.alarms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.NotificationLogEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_LOCKED_BOOT_COMPLETED ||
            action == "android.intent.action.QUICKBOOT_POWERON" ||
            action == "com.htc.intent.action.QUICKBOOT_POWERON" ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED
        ) {
            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val db = SmartTeacherDatabase.getInstance(context)
                    db.notificationLogDao().insertLog(
                        NotificationLogEntity(
                            event = "DEVICE_REBOOT_DETECTED",
                            title = "Phát hiện khởi động lại thiết bị",
                            details = "Action: $action. Bắt đầu khôi phục báo động..."
                        )
                    )

                    // Arm 00:00 midnight alarm and perform refresh
                    DailyRefreshManager.scheduleNextMidnightAlarm(context)
                    DailyRefreshManager.performDailyMidnightRefresh(context)

                    // Enqueue RescheduleWorker immediately
                    val workRequest = OneTimeWorkRequestBuilder<RescheduleWorker>().build()
                    WorkManager.getInstance(context).enqueue(workRequest)
                } catch (e: Exception) {
                    e.printStackTrace()
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}
