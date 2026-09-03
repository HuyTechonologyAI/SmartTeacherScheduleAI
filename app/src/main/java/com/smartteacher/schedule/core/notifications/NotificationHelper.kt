package com.smartteacher.schedule.core.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.smartteacher.schedule.MainActivity
import com.smartteacher.schedule.R
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.NotificationLogEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NotificationHelper(private val context: Context) {

    private val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    companion object {
        const val CHANNEL_TEACHING = "channel_teaching_schedule"
        const val CHANNEL_TASKS = "channel_tasks"
        const val CHANNEL_AI = "channel_ai_insights"
        const val CHANNEL_LOCKSCREEN_GLANCE = "channel_lockscreen_glance_v2"

        const val ACTION_VIEW = "com.smartteacher.schedule.ACTION_VIEW"
        const val ACTION_ACKNOWLEDGE = "com.smartteacher.schedule.ACTION_ACKNOWLEDGE_NOTIFICATION"
        const val ACTION_SNOOZE = "com.smartteacher.schedule.ACTION_SNOOZE_NOTIFICATION"
        const val ACTION_DISMISS = "com.smartteacher.schedule.ACTION_DISMISS_NOTIFICATION"

        const val EXTRA_REMINDER_ID = "extra_reminder_id"
        const val EXTRA_EVENT_ID = "extra_event_id"
        const val EXTRA_NOTIFICATION_ID = "extra_notification_id"
    }

    init {
        createNotificationChannels()
    }

    fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()

            // 1. High Priority Channel for Teaching Schedule Reminders
            val teachingChannel = NotificationChannel(
                CHANNEL_TEACHING,
                context.getString(R.string.channel_teaching_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.channel_teaching_desc)
                enableLights(true)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500, 200, 500)
                setSound(soundUri, audioAttributes)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setBypassDnd(true)
            }

            // 2. Tasks & Deadlines Channel
            val tasksChannel = NotificationChannel(
                CHANNEL_TASKS,
                context.getString(R.string.channel_tasks_name),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.channel_tasks_desc)
                enableVibration(true)
            }

            // 3. AI Insights Channel
            val aiChannel = NotificationChannel(
                CHANNEL_AI,
                context.getString(R.string.channel_ai_name),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.channel_ai_desc)
            }

            // 4. Lock Screen Live Glance Channel (HIGH importance for Tecno/Android 15 lockscreen visibility, silent sound)
            runCatching {
                notificationManager.deleteNotificationChannel("channel_lockscreen_glance")
            }

            val lockscreenChannel = NotificationChannel(
                CHANNEL_LOCKSCREEN_GLANCE,
                context.getString(R.string.channel_lockscreen_name),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = context.getString(R.string.channel_lockscreen_desc)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setSound(null, null)
                enableVibration(false)
                setShowBadge(false)
            }

            notificationManager.createNotificationChannels(
                listOf(teachingChannel, tasksChannel, aiChannel, lockscreenChannel)
            )
        }
    }

    fun showTeachingReminderNotification(
        reminderId: Long,
        eventId: Long,
        subject: String,
        className: String,
        room: String,
        startTime: String,
        endTime: String,
        minutesRemaining: Int
    ) {
        val notificationId = (reminderId % Int.MAX_VALUE).toInt()

        // 1. Deep Link Intent to Event Details
        val viewIntent = Intent(
            Intent.ACTION_VIEW,
            Uri.parse("smartteacher://schedule/$eventId"),
            context,
            MainActivity::class.java
        ).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val viewPendingIntent = PendingIntent.getActivity(
            context,
            notificationId * 10 + 1,
            viewIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 2. Action: Đã xem (Acknowledge)
        val ackIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = ACTION_ACKNOWLEDGE
            putExtra(EXTRA_REMINDER_ID, reminderId)
            putExtra(EXTRA_NOTIFICATION_ID, notificationId)
        }
        val ackPendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId * 10 + 2,
            ackIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 3. Action: Hoãn 10 phút (Snooze)
        val snoozeIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = ACTION_SNOOZE
            putExtra(EXTRA_REMINDER_ID, reminderId)
            putExtra(EXTRA_EVENT_ID, eventId)
            putExtra(EXTRA_NOTIFICATION_ID, notificationId)
            putExtra("subject", subject)
            putExtra("room", room)
            putExtra("className", className)
            putExtra("startTime", startTime)
            putExtra("endTime", endTime)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId * 10 + 3,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 4. Action: Bỏ qua (Dismiss)
        val dismissIntent = Intent(context, NotificationActionReceiver::class.java).apply {
            action = ACTION_DISMISS
            putExtra(EXTRA_REMINDER_ID, reminderId)
            putExtra(EXTRA_NOTIFICATION_ID, notificationId)
        }
        val dismissPendingIntent = PendingIntent.getBroadcast(
            context,
            notificationId * 10 + 4,
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val roomInfo = if (room.isNotBlank()) "Phòng: $room" else "Chưa xếp phòng"
        val classInfo = if (className.isNotBlank()) "Lớp: $className" else ""
        val subtitle = "$startTime - $endTime • $roomInfo"
        val remainingText = if (minutesRemaining > 0) "Còn $minutesRemaining phút." else "Đang diễn ra."
        val bigText = """
            $startTime - $endTime
            Module: $subject
            $classInfo
            $roomInfo
            
            $remainingText
        """.trimIndent()

        val notification = NotificationCompat.Builder(context, CHANNEL_TEACHING)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("SẮP ĐẾN GIỜ DẠY: $subject")
            .setSubText(subtitle)
            .setContentText("$roomInfo • $remainingText")
            .setStyle(NotificationCompat.BigTextStyle().bigText(bigText))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(viewPendingIntent, true)
            .setAutoCancel(true)
            .setContentIntent(viewPendingIntent)
            .addAction(0, context.getString(R.string.action_view_schedule), viewPendingIntent)
            .addAction(0, context.getString(R.string.action_mark_viewed), ackPendingIntent)
            .addAction(0, context.getString(R.string.action_snooze), snoozePendingIntent)
            .addAction(0, context.getString(R.string.action_dismiss), dismissPendingIntent)
            .build()

        notificationManager.notify(notificationId, notification)

        // Log notification to Database
        logNotification("DELIVERED", "Nhắc lịch: $subject", "ID=$reminderId, Phút=$minutesRemaining")
    }

    fun showTaskDeadlineNotification(taskId: Long, title: String, dueTime: String) {
        val notificationId = (taskId % Int.MAX_VALUE).toInt() + 100000

        val viewIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val viewPendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            viewIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_TASKS)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("HẠN CHÓT CÔNG VIỆC")
            .setContentText("$title (Hạn: $dueTime)")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(viewPendingIntent)
            .build()

        notificationManager.notify(notificationId, notification)
        logNotification("DELIVERED", "Hạn công việc: $title", "Due: $dueTime")
    }

    fun showAIInsightNotification(title: String, message: String) {
        val notificationId = 200001
        val viewIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val viewPendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            viewIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_AI)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("✨ $title")
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(viewPendingIntent)
            .build()

        notificationManager.notify(notificationId, notification)
        logNotification("DELIVERED", "AI Insight: $title", message)
    }

    fun cancelNotification(notificationId: Int) {
        notificationManager.cancel(notificationId)
    }

    private fun logNotification(event: String, title: String, details: String) {
        CoroutineScope(Dispatchers.IO).launch {
            runCatching {
                val db = SmartTeacherDatabase.getInstance(context)
                db.notificationLogDao().insertLog(
                    NotificationLogEntity(event = event, title = title, details = details)
                )
            }
        }
    }
}
