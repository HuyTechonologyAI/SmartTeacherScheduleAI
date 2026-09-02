package com.smartteacher.schedule

import android.app.Application
import com.smartteacher.schedule.core.alarms.AndroidAlarmScheduler
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity
import com.smartteacher.schedule.core.model.EventSource
import com.smartteacher.schedule.core.model.TaskPriority
import com.smartteacher.schedule.core.notifications.NotificationHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.LocalDate

class SmartTeacherApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // 1. Initialize Notification Channels
        val notificationHelper = NotificationHelper(this)
        notificationHelper.createNotificationChannels()

        // 2. Setup Self-Healing Periodic Reschedule Worker (every 15 minutes)
        setupSelfHealingRescheduleWorker()

        // 3. Prepopulate demo data if fresh install
        prepopulateDemoDataIfEmpty()
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

    private fun prepopulateDemoDataIfEmpty() {
        CoroutineScope(Dispatchers.IO).launch {
            val db = SmartTeacherDatabase.getInstance(this@SmartTeacherApp)
            val todayStr = LocalDate.now().toString()
            val existingEvents = db.calendarEventDao().getEventsForDateList(todayStr)

            if (existingEvents.isEmpty()) {
                val scheduler = AndroidAlarmScheduler(this@SmartTeacherApp)

                // Demo Class 1: CAD/CAM
                val event1 = CalendarEventEntity(
                    title = "Dạy Module CAD/CAM",
                    subject = "CAD/CAM",
                    className = "CĐCK01",
                    room = "C202",
                    date = todayStr,
                    startTime = "08:00",
                    endTime = "10:00",
                    source = EventSource.LOCAL,
                    notes = "Xưởng thực hành cơ khí CNC"
                )
                val id1 = db.calendarEventDao().insertEvent(event1)
                scheduler.scheduleEventReminders(event1.copy(id = id1))

                // Demo Class 2: CNC
                val event2 = CalendarEventEntity(
                    title = "Thực hành gia công CNC",
                    subject = "CNC",
                    className = "CĐCK01",
                    room = "Xưởng CNC",
                    date = todayStr,
                    startTime = "14:00",
                    endTime = "16:30",
                    source = EventSource.LOCAL,
                    notes = "Kiểm tra dao phay và đồ gá trước giờ"
                )
                val id2 = db.calendarEventDao().insertEvent(event2)
                scheduler.scheduleEventReminders(event2.copy(id = id2))

                // Demo Tasks
                db.taskDao().insertTask(
                    TaskEntity(
                        title = "Soạn giáo án Module CAD/CAM",
                        description = "Cập nhật bài tập vẽ chi tiết trục",
                        dueDate = todayStr,
                        dueTime = "07:30",
                        category = "Giáo án",
                        priority = TaskPriority.HIGH,
                        relatedEventId = id1
                    )
                )

                db.taskDao().insertTask(
                    TaskEntity(
                        title = "Chuẩn bị phôi nhôm thực hành CNC",
                        description = "Liên hệ kho vật tư nhận 25 phôi nhôm",
                        dueDate = todayStr,
                        dueTime = "13:30",
                        category = "Vật tư",
                        priority = TaskPriority.URGENT,
                        relatedEventId = id2
                    )
                )

                db.taskDao().insertTask(
                    TaskEntity(
                        title = "Chấm bài kiểm tra giữa kỳ Lớp CĐCK02",
                        description = "Nhập điểm vào phần mềm quản lý đào tạo",
                        dueDate = todayStr,
                        dueTime = "18:00",
                        category = "Chấm bài",
                        priority = TaskPriority.MEDIUM
                    )
                )
            }
        }
    }
}
