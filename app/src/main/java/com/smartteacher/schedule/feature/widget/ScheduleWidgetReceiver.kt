package com.smartteacher.schedule.feature.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.smartteacher.schedule.MainActivity
import com.smartteacher.schedule.R
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.temporal.ChronoUnit

class ScheduleWidgetReceiver : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val ids = appWidgetManager.getAppWidgetIds(
                ComponentName(context, ScheduleWidgetReceiver::class.java)
            )
            for (id in ids) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }

        private fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_next_class)

            // Intent to open app when clicked
            val openIntent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_root, pendingIntent)

            // Load data asynchronously from Room
            CoroutineScope(Dispatchers.IO).launch {
                val db = SmartTeacherDatabase.getInstance(context)
                val todayStr = LocalDate.now().toString()
                val events = db.calendarEventDao().getEventsForDateList(todayStr)
                val now = LocalTime.now()

                val nextEvent = events.firstOrNull {
                    runCatching { LocalTime.parse(it.endTime).isAfter(now) }.getOrDefault(false)
                }

                if (nextEvent != null) {
                    val remainingMins = runCatching {
                        val start = LocalTime.parse(nextEvent.startTime)
                        if (now.isBefore(start)) ChronoUnit.MINUTES.between(now, start) else 0L
                    }.getOrDefault(0L)

                    val countdownText = if (remainingMins > 0) "Còn $remainingMins phút" else "Đang diễn ra"
                    val roomText = if (nextEvent.room.isNotBlank()) "Phòng ${nextEvent.room}" else ""
                    val classText = if (nextEvent.className.isNotBlank()) "Lớp ${nextEvent.className}" else ""
                    val detailsText = "${nextEvent.startTime} - ${nextEvent.endTime} • $roomText • $classText"

                    views.setTextViewText(R.id.widget_subject, nextEvent.title)
                    views.setTextViewText(R.id.widget_countdown, countdownText)
                    views.setTextViewText(R.id.widget_details, detailsText)
                    views.setTextViewText(R.id.widget_next_reminder, "⏰ Báo động 60m & 15m trước giờ dạy")
                } else {
                    views.setTextViewText(R.id.widget_subject, "Hôm nay không còn lớp")
                    views.setTextViewText(R.id.widget_countdown, "")
                    views.setTextViewText(R.id.widget_details, "Tất cả các buổi dạy hôm nay đã hoàn thành")
                    views.setTextViewText(R.id.widget_next_reminder, "Chạm để mở ứng dụng")
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
            }
        }
    }
}
