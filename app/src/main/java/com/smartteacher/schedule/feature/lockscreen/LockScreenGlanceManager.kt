package com.smartteacher.schedule.feature.lockscreen

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import com.smartteacher.schedule.MainActivity
import com.smartteacher.schedule.R
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.notifications.NotificationHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

object LockScreenGlanceManager {

    const val LOCKSCREEN_GLANCE_NOTIF_ID = 9999
    private const val PREFS_NAME = "smart_teacher_lockscreen_prefs"
    private const val KEY_LOCKSCREEN_GLANCE_ENABLED = "lockscreen_glance_enabled"

    const val ACTION_UPDATE_LOCKSCREEN_GLANCE = "com.smartteacher.schedule.ACTION_UPDATE_LOCKSCREEN_GLANCE"
    const val ACTION_TOGGLE_LOCKSCREEN_GLANCE = "com.smartteacher.schedule.ACTION_TOGGLE_LOCKSCREEN_GLANCE"

    fun isLockScreenGlanceEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getBoolean(KEY_LOCKSCREEN_GLANCE_ENABLED, true)
    }

    fun setLockScreenGlanceEnabled(context: Context, enabled: Boolean) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putBoolean(KEY_LOCKSCREEN_GLANCE_ENABLED, enabled).apply()
        if (enabled) {
            updateLockScreenGlance(context)
        } else {
            removeLockScreenGlance(context)
        }
    }

    fun removeLockScreenGlance(context: Context) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        notificationManager?.cancel(LOCKSCREEN_GLANCE_NOTIF_ID)
    }

    fun updateLockScreenGlance(context: Context) {
        if (!isLockScreenGlanceEnabled(context)) {
            removeLockScreenGlance(context)
            return
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val db = SmartTeacherDatabase.getInstance(context)
                val today = LocalDate.now()
                val todayStr = today.toString()
                val now = LocalTime.now()

                val dayOfWeekVi = when (today.dayOfWeek) {
                    DayOfWeek.MONDAY -> "Thứ 2"
                    DayOfWeek.TUESDAY -> "Thứ 3"
                    DayOfWeek.WEDNESDAY -> "Thứ 4"
                    DayOfWeek.THURSDAY -> "Thứ 5"
                    DayOfWeek.FRIDAY -> "Thứ 6"
                    DayOfWeek.SATURDAY -> "Thứ 7"
                    DayOfWeek.SUNDAY -> "Chủ Nhật"
                }
                val dateVi = "$dayOfWeekVi, ${today.format(DateTimeFormatter.ofPattern("dd/MM"))}"

                val todayEvents = db.calendarEventDao().getEventsForDateList(todayStr)
                    .sortedBy { it.startTime }
                val tasks = db.taskDao().getIncompleteTasksList()

                // Tìm ca dạy đang diễn ra hoặc ca tiếp theo sắp tới
                val currentOrNextEvent = todayEvents.firstOrNull {
                    runCatching { LocalTime.parse(it.endTime).isAfter(now) }.getOrDefault(false)
                }

                val otherUpcomingEvents = todayEvents.filter {
                    it.id != currentOrNextEvent?.id && runCatching { LocalTime.parse(it.startTime).isAfter(now) }.getOrDefault(false)
                }

                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                    ?: return@launch

                // 1. PendingIntent mở App
                val openIntent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val contentPendingIntent = PendingIntent.getActivity(
                    context,
                    9991,
                    openIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                // 2. PendingIntent Cập nhật nhanh
                val refreshIntent = Intent(context, LockScreenGlanceReceiver::class.java).apply {
                    action = ACTION_UPDATE_LOCKSCREEN_GLANCE
                }
                val refreshPendingIntent = PendingIntent.getBroadcast(
                    context,
                    9992,
                    refreshIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                // 3. Xây dựng nội dung hiển thị trên Màn hình khóa
                val title: String
                val summaryText: String
                val subText: String
                val bigTextBuilder = StringBuilder()

                if (currentOrNextEvent != null) {
                    val start = runCatching { LocalTime.parse(currentOrNextEvent.startTime) }.getOrNull()
                    val end = runCatching { LocalTime.parse(currentOrNextEvent.endTime) }.getOrNull()

                    val isOngoing = start != null && end != null && !now.isBefore(start) && now.isBefore(end)
                    val remainingMins = if (start != null && now.isBefore(start)) {
                        ChronoUnit.MINUTES.between(now, start)
                    } else 0L

                    val countdownBadge = if (isOngoing) {
                        "🔴 Đang dạy (Tan: ${currentOrNextEvent.endTime})"
                    } else if (remainingMins >= 60) {
                        "⏳ Còn ${remainingMins / 60}h ${remainingMins % 60}p"
                    } else if (remainingMins > 0) {
                        "⏳ Còn $remainingMins phút vào lớp"
                    } else {
                        "⏳ Sắp bắt đầu"
                    }

                    val roomStr = if (currentOrNextEvent.room.isNotBlank()) "P.${currentOrNextEvent.room}" else "Chưa xếp phòng"
                    val classStr = if (currentOrNextEvent.className.isNotBlank()) "Lớp ${currentOrNextEvent.className}" else ""

                    title = "⏰ [${currentOrNextEvent.startTime} - ${currentOrNextEvent.endTime}] ${currentOrNextEvent.title}"
                    summaryText = "$countdownBadge • $roomStr • $classStr"
                    subText = dateVi

                    bigTextBuilder.append("📖 Môn: ${currentOrNextEvent.title}\n")
                    bigTextBuilder.append("🏫 Lớp: ${currentOrNextEvent.className} • Phòng: $roomStr\n")
                    bigTextBuilder.append("⏱️ Thời gian: ${currentOrNextEvent.startTime} - ${currentOrNextEvent.endTime} ($countdownBadge)\n")
                    if (currentOrNextEvent.notes.isNotBlank()) {
                        bigTextBuilder.append("📝 Ghi chú: ${currentOrNextEvent.notes}\n")
                    }

                    if (otherUpcomingEvents.isNotEmpty()) {
                        bigTextBuilder.append("\n📋 Các ca tiếp theo hôm nay:\n")
                        otherUpcomingEvents.take(2).forEach {
                            bigTextBuilder.append(" • ${it.startTime} - ${it.endTime}: ${it.title} (${it.room})\n")
                        }
                    }

                    if (tasks.isNotEmpty()) {
                        bigTextBuilder.append("\n📌 Nhiệm vụ: ${tasks.size} việc cần làm (1. ${tasks.first().title})")
                    }
                } else {
                    // Kiểm tra lịch ngày mai
                    val tomorrowStr = today.plusDays(1).toString()
                    val tomorrowEvents = db.calendarEventDao().getEventsForDateList(tomorrowStr).sortedBy { it.startTime }

                    if (tomorrowEvents.isNotEmpty()) {
                        val firstTomorrow = tomorrowEvents.first()
                        title = "✨ Xong ca hôm nay • Mai có ${tomorrowEvents.size} ca dạy"
                        summaryText = "Mai (${firstTomorrow.startTime}): ${firstTomorrow.title} (P.${firstTomorrow.room})"
                        subText = dateVi

                        bigTextBuilder.append("🎉 Thầy/Cô đã hoàn thành tất cả giờ giảng hôm nay!\n\n")
                        bigTextBuilder.append("📆 Ca dạy sáng mai (${firstTomorrow.startTime} - ${firstTomorrow.endTime}):\n")
                        bigTextBuilder.append(" • Môn: ${firstTomorrow.title}\n")
                        bigTextBuilder.append(" • Lớp: ${firstTomorrow.className} • Phòng: ${firstTomorrow.room}\n")
                        if (tasks.isNotEmpty()) {
                            bigTextBuilder.append("\n📌 Việc cần xử lý tối nay: ${tasks.size} việc")
                        }
                    } else {
                        title = "✨ Hoàn thành tất cả giờ giảng hôm nay"
                        summaryText = if (tasks.isNotEmpty()) "Thầy/Cô có ${tasks.size} việc cần làm" else "Chúc Thầy/Cô nghỉ ngơi vui vẻ!"
                        subText = dateVi

                        bigTextBuilder.append("Thầy/Cô không còn lịch dạy hôm nay.\n")
                        if (tasks.isNotEmpty()) {
                            bigTextBuilder.append("📌 Danh sách việc cần làm: ${tasks.size} việc\n")
                            tasks.take(3).forEach {
                                bigTextBuilder.append(" • ${it.title}\n")
                            }
                        } else {
                            bigTextBuilder.append("Chúc Thầy/Cô một ngày làm việc hiệu quả và tràn đầy năng lượng! ✨")
                        }
                    }
                }

                // 4. Tạo Notification với VISIBILITY_PUBLIC hiển thị ngay trên màn hình khóa
                val notification = NotificationCompat.Builder(context, NotificationHelper.CHANNEL_LOCKSCREEN_GLANCE)
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(summaryText)
                    .setSubText(subText)
                    .setStyle(NotificationCompat.BigTextStyle().bigText(bigTextBuilder.toString()))
                    .setContentIntent(contentPendingIntent)
                    .setOngoing(true) // Ghim cố định không bị gạt mất
                    .setNotificationSilent() // Im lặng hoàn toàn để không phiền giáo viên
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC) // Hiển thị đầy đủ trên màn hình khóa kể cả khi chưa mở khóa
                    .setPriority(NotificationCompat.PRIORITY_LOW)
                    .setCategory(NotificationCompat.CATEGORY_EVENT)
                    .addAction(
                        R.drawable.ic_widget_refresh,
                        context.getString(R.string.lockscreen_action_refresh),
                        refreshPendingIntent
                    )
                    .addAction(
                        R.mipmap.ic_launcher,
                        context.getString(R.string.lockscreen_action_view),
                        contentPendingIntent
                    )
                    .build()

                notificationManager.notify(LOCKSCREEN_GLANCE_NOTIF_ID, notification)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Hỗ trợ mở cài đặt Màn hình khóa của hệ thống (Samsung, Xiaomi, Oppo, Android)
     */
    fun openLockScreenSystemSettings(context: Context) {
        runCatching {
            // Thử mở cài đặt màn hình khóa chuyên sâu
            val intent = Intent("android.settings.LOCK_SCREEN_SETTINGS").apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }.recoverCatching {
            // Fallback mở cài đặt thông báo ứng dụng
            val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        }
    }
}
