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

class TimeChangedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        if (action == Intent.ACTION_TIME_CHANGED ||
            action == Intent.ACTION_TIMEZONE_CHANGED ||
            action == Intent.ACTION_DATE_CHANGED
        ) {
            val pendingResult = goAsync()
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val db = SmartTeacherDatabase.getInstance(context)
                    db.notificationLogDao().insertLog(
                        NotificationLogEntity(
                            event = "TIME_OR_TIMEZONE_CHANGED",
                            title = "Thay đổi thời gian hệ thống",
                            details = "Action: $action. Cập nhật lại lịch báo động..."
                        )
                    )

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
