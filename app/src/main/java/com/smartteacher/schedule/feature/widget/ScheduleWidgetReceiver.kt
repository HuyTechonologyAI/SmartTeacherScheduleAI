package com.smartteacher.schedule.feature.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.appwidget.AppWidgetProviderInfo
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.view.View
import android.widget.RemoteViews
import android.widget.Toast
import com.smartteacher.schedule.MainActivity
import com.smartteacher.schedule.R
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.feature.lockscreen.LockScreenGlanceManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

class ScheduleWidgetReceiver : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                for (appWidgetId in appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, appWidgetId)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                pendingResult.finish()
            }
        }
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        updateAllWidgets(context)
    }

    companion object {
        fun updateAllWidgets(context: Context) {
            // Cập nhật cả Màn hình khóa và Widget màn hình chính
            LockScreenGlanceManager.updateLockScreenGlance(context)

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, ScheduleWidgetReceiver::class.java)
            )
            if (ids.isNotEmpty()) {
                CoroutineScope(Dispatchers.IO).launch {
                    for (id in ids) {
                        updateAppWidget(context, appWidgetManager, id)
                    }
                }
            }
        }

        fun pinWidgetToHomeScreen(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val myProvider = ComponentName(context, ScheduleWidgetReceiver::class.java)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (appWidgetManager.isRequestPinAppWidgetSupported) {
                    val pinnedWidgetCallbackIntent = Intent(context, ScheduleWidgetReceiver::class.java).apply {
                        action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    }
                    val successCallback = PendingIntent.getBroadcast(
                        context, 0,
                        pinnedWidgetCallbackIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    val success = appWidgetManager.requestPinAppWidget(myProvider, null, successCallback)
                    if (success) {
                        Toast.makeText(context, "Hệ thống đang mở hộp thoại ghim Widget. Vui lòng bấm 'Thêm'!", Toast.LENGTH_SHORT).show()
                        return
                    }
                }
            }

            Toast.makeText(
                context,
                "Vui lòng ra Màn hình chính > Nhấn giữ khoảng trống > Chọn 'Tiện ích' (Widgets) > Kéo Smart Teacher ra màn hình",
                Toast.LENGTH_LONG
            ).show()
        }

        private suspend fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val widgetOptions = appWidgetManager.getAppWidgetOptions(appWidgetId)
            val category = widgetOptions.getInt(
                AppWidgetManager.OPTION_APPWIDGET_HOST_CATEGORY,
                AppWidgetProviderInfo.WIDGET_CATEGORY_HOME_SCREEN
            )
            val isKeyguard = category == AppWidgetProviderInfo.WIDGET_CATEGORY_KEYGUARD
            val layoutId = if (isKeyguard) R.layout.widget_lockscreen_compact else R.layout.widget_next_class
            val views = RemoteViews(context.packageName, layoutId)

            // 1. Click on widget opens MainActivity
            val openIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

            // 2. Click on Refresh Button updates this widget immediately
            val refreshIntent = Intent(context, ScheduleWidgetReceiver::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, intArrayOf(appWidgetId))
            }
            val refreshPendingIntent = PendingIntent.getBroadcast(
                context,
                appWidgetId + 200000,
                refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_refresh_btn, refreshPendingIntent)

            // 3. Current Vietnamese formatted date
            val today = LocalDate.now()
            val dayOfWeekVi = when (today.dayOfWeek) {
                DayOfWeek.MONDAY -> "Thứ 2"
                DayOfWeek.TUESDAY -> "Thứ 3"
                DayOfWeek.WEDNESDAY -> "Thứ 4"
                DayOfWeek.THURSDAY -> "Thứ 5"
                DayOfWeek.FRIDAY -> "Thứ 6"
                DayOfWeek.SATURDAY -> "Thứ 7"
                DayOfWeek.SUNDAY -> "Chủ Nhật"
            }
            val dateFormatted = "$dayOfWeekVi, ${today.format(DateTimeFormatter.ofPattern("dd/MM"))}"
            views.setTextViewText(R.id.widget_date, dateFormatted)

            // Push base view immediately so widget renders synchronously
            appWidgetManager.updateAppWidget(appWidgetId, views)

            // 4. Load data from Room Database
            try {
                val db = SmartTeacherDatabase.getInstance(context)
                val todayStr = today.toString()
                val events = db.calendarEventDao().getEventsForDateList(todayStr)
                val tasks = db.taskDao().getIncompleteTasksList()
                val now = LocalTime.now()

                val nextEvent = events.firstOrNull {
                    runCatching { LocalTime.parse(it.endTime).isAfter(now) }.getOrDefault(false)
                }

                if (nextEvent != null) {
                    val remainingMins = runCatching {
                        val start = LocalTime.parse(nextEvent.startTime)
                        if (now.isBefore(start)) ChronoUnit.MINUTES.between(now, start) else 0L
                    }.getOrDefault(0L)

                    val countdownText = if (remainingMins >= 60) {
                        "Còn ${remainingMins / 60}h ${remainingMins % 60}p"
                    } else if (remainingMins > 0) {
                        "Còn $remainingMins phút"
                    } else {
                        "Đang diễn ra"
                    }
                    val roomText = if (nextEvent.room.isNotBlank()) "P.${nextEvent.room}" else "Chưa xếp phòng"
                    val classText = if (nextEvent.className.isNotBlank()) "Lớp ${nextEvent.className}" else ""
                    val detailsText = "${nextEvent.startTime} - ${nextEvent.endTime} • $roomText • $classText"

                    views.setTextViewText(R.id.widget_subject, nextEvent.title)
                    views.setTextViewText(R.id.widget_countdown, countdownText)
                    views.setTextViewText(R.id.widget_details, detailsText)
                } else {
                    views.setTextViewText(R.id.widget_subject, "Hôm nay không còn tiết dạy")
                    views.setTextViewText(R.id.widget_countdown, "Xong ca")
                    views.setTextViewText(R.id.widget_details, "Thầy/Cô đã hoàn thành tất cả giờ giảng hôm nay")
                }

                // 5. Populate Tasks Section
                if (tasks.isNotEmpty()) {
                    views.setTextViewText(R.id.widget_tasks_count, "${tasks.size} việc")
                    val task1 = tasks.getOrNull(0)
                    val task2 = tasks.getOrNull(1)

                    if (task1 != null) {
                        val due = if (task1.dueDate == todayStr) "Hôm nay" else task1.dueDate
                        views.setTextViewText(R.id.widget_task1, "📌 ${task1.title} ($due)")
                        views.setViewVisibility(R.id.widget_task1, View.VISIBLE)
                    }

                    if (task2 != null) {
                        val due = if (task2.dueDate == todayStr) "Hôm nay" else task2.dueDate
                        views.setTextViewText(R.id.widget_task2, "📌 ${task2.title} ($due)")
                        views.setViewVisibility(R.id.widget_task2, View.VISIBLE)
                    } else {
                        views.setViewVisibility(R.id.widget_task2, View.GONE)
                    }
                } else {
                    views.setTextViewText(R.id.widget_tasks_count, "0 việc")
                    views.setTextViewText(R.id.widget_task1, "✨ Không có nhiệm vụ nào cần làm")
                    views.setViewVisibility(R.id.widget_task2, View.GONE)
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
