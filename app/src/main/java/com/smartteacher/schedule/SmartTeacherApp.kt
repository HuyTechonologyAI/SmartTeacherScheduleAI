package com.smartteacher.schedule

import android.app.Application
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.notifications.NotificationHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class SmartTeacherApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // 1. Initialize Notification Channels
        val notificationHelper = NotificationHelper(this)
        notificationHelper.createNotificationChannels()

        // 2. Setup Self-Healing Periodic Reschedule Worker (every 15 minutes)
        setupSelfHealingRescheduleWorker()

        // 3. Clear demo test items so app runs purely with teacher's real entries
        cleanUpDemoData()

        // 4. Setup 00:00 Daily Midnight Auto-Refresh
        com.smartteacher.schedule.core.alarms.DailyRefreshManager.scheduleNextMidnightAlarm(this)
        CoroutineScope(Dispatchers.IO).launch {
            com.smartteacher.schedule.core.alarms.DailyRefreshManager.performDailyMidnightRefresh(this@SmartTeacherApp)
        }
    }

    private fun setupSelfHealingRescheduleWorker() {
        try {
            val rescheduleWork = androidx.work.PeriodicWorkRequestBuilder<com.smartteacher.schedule.core.alarms.RescheduleWorker>(
                15, java.util.concurrent.TimeUnit.MINUTES
            ).build()

            androidx.work.WorkManager.getInstance(this).enqueueUniquePeriodicWork(
                "SmartTeacherSelfHealingWork",
                androidx.work.ExistingPeriodicWorkPolicy.KEEP,
                rescheduleWork
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun cleanUpDemoData() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val db = SmartTeacherDatabase.getInstance(this@SmartTeacherApp)
                db.calendarEventDao().deleteDemoEvents()
                db.taskDao().deleteDemoTasks()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
