package com.smartteacher.schedule.feature.lockscreen

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast
import com.smartteacher.schedule.feature.widget.ScheduleWidgetReceiver

class LockScreenGlanceReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            LockScreenGlanceManager.ACTION_UPDATE_LOCKSCREEN_GLANCE -> {
                LockScreenGlanceManager.updateLockScreenGlance(context)
                ScheduleWidgetReceiver.updateAllWidgets(context)
                Toast.makeText(context, "Đã cập nhật lịch trên màn hình khóa & widget!", Toast.LENGTH_SHORT).show()
            }
            LockScreenGlanceManager.ACTION_TOGGLE_LOCKSCREEN_GLANCE -> {
                val current = LockScreenGlanceManager.isLockScreenGlanceEnabled(context)
                LockScreenGlanceManager.setLockScreenGlanceEnabled(context, !current)
            }
        }
    }
}
