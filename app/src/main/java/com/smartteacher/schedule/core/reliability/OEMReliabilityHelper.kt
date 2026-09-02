package com.smartteacher.schedule.core.reliability

import android.app.AlarmManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat

object OEMReliabilityHelper {

    enum class OEM(val brandName: String) {
        TECNO("Tecno / Infinix / Itel (HiOS)"),
        SAMSUNG("Samsung"),
        XIAOMI("Xiaomi"),
        OPPO("OPPO"),
        VIVO("Vivo"),
        REALME("Realme"),
        HUAWEI("Huawei"),
        ONEPLUS("OnePlus"),
        GENERIC("Android Chuẩn")
    }

    fun getDeviceOEM(): OEM {
        val manufacturer = Build.MANUFACTURER.lowercase()
        return when {
            manufacturer.contains("tecno") || manufacturer.contains("infinix") || manufacturer.contains("itel") || manufacturer.contains("transsion") -> OEM.TECNO
            manufacturer.contains("samsung") -> OEM.SAMSUNG
            manufacturer.contains("xiaomi") || manufacturer.contains("redmi") || manufacturer.contains("poco") -> OEM.XIAOMI
            manufacturer.contains("oppo") -> OEM.OPPO
            manufacturer.contains("vivo") -> OEM.VIVO
            manufacturer.contains("realme") -> OEM.REALME
            manufacturer.contains("huawei") || manufacturer.contains("honor") -> OEM.HUAWEI
            manufacturer.contains("oneplus") -> OEM.ONEPLUS
            else -> OEM.GENERIC
        }
    }

    fun isNotificationPermissionGranted(context: Context): Boolean {
        return NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    fun isExactAlarmPermissionGranted(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            alarmManager.canScheduleExactAlarms()
        } else {
            true
        }
    }

    fun isIgnoringBatteryOptimizations(context: Context): Boolean {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return powerManager.isIgnoringBatteryOptimizations(context.packageName)
    }

    fun getNotificationSettingsIntent(context: Context): Intent {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
            }
        } else {
            getAppDetailsSettingsIntent(context)
        }
    }

    fun getExactAlarmSettingsIntent(context: Context): Intent {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                data = Uri.parse("package:${context.packageName}")
            }
        } else {
            getAppDetailsSettingsIntent(context)
        }
    }

    fun getBatteryOptimizationSettingsIntent(context: Context): Intent {
        return Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = Uri.parse("package:${context.packageName}")
        }
    }

    fun getAppDetailsSettingsIntent(context: Context): Intent {
        return Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.parse("package:${context.packageName}")
        }
    }

    /**
     * Attempts to open OEM-specific auto-start or battery management activity
     */
    fun openOEMAutoStartSettings(context: Context): Boolean {
        val oem = getDeviceOEM()
        val intents = mutableListOf<Intent>()

        when (oem) {
            OEM.TECNO -> {
                intents.add(Intent().setComponent(ComponentName("com.transsion.phonemaster", "com.transsion.phonemaster.autostart.AutoStartActivity")))
                intents.add(Intent().setComponent(ComponentName("com.transsion.phonemaster", "com.transsion.phonemaster.MainActivity")))
                intents.add(Intent().setComponent(ComponentName("com.transsion.phonemanager", "com.transsion.phonemanager.MainActivity")))
            }
            OEM.XIAOMI -> {
                intents.add(Intent().setComponent(ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity")))
                intents.add(Intent().setComponent(ComponentName("com.miui.securitycenter", "com.miui.powercenter.PowerSettings")))
            }
            OEM.SAMSUNG -> {
                intents.add(Intent().setComponent(ComponentName("com.samsung.android.lool", "com.samsung.android.sm.battery.ui.BatteryActivity")))
                intents.add(Intent().setComponent(ComponentName("com.samsung.android.sm", "com.samsung.android.sm.battery.ui.BatteryActivity")))
            }
            OEM.OPPO -> {
                intents.add(Intent().setComponent(ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity")))
                intents.add(Intent().setComponent(ComponentName("com.oppo.safe", "com.oppo.safe.permission.startup.StartupAppListActivity")))
            }
            OEM.VIVO -> {
                intents.add(Intent().setComponent(ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity")))
                intents.add(Intent().setComponent(ComponentName("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity")))
            }
            OEM.HUAWEI -> {
                intents.add(Intent().setComponent(ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity")))
                intents.add(Intent().setComponent(ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity")))
            }
            OEM.REALME -> {
                intents.add(Intent().setComponent(ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity")))
            }
            else -> {}
        }

        // Fallback to app details
        intents.add(getAppDetailsSettingsIntent(context))

        for (intent in intents) {
            try {
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
                return true
            } catch (ignored: Exception) {
                // Try next intent in sequence
            }
        }
        return false
    }

    fun getOEMInstructions(oem: OEM): String {
        return when (oem) {
            OEM.TECNO -> "Tecno HiOS / Infinix XOS: Mở ứng dụng 'Phone Master' → Hộp công cụ → Quản lý tự khởi chạy → Bật cho Smart Teacher Schedule AI. Vào Cài đặt máy → Pin → Tối ưu hóa pin → Chọn 'Không tối ưu hóa' (Không hạn chế). Tại màn hình đa nhiệm (vuốt lên), bấm biểu tượng Ổ khóa 🔒 vào ứng dụng để chống bị dọn dẹp khi bấm xóa RAM."
            OEM.SAMSUNG -> "Samsung One UI: Vào Cài đặt → Ứng dụng → Smart Teacher Schedule → Pin → Chọn 'Không hạn chế' (Unrestricted). Tắt tính năng 'Đặt ứng dụng vào chế độ ngủ'."
            OEM.XIAOMI -> "Xiaomi MIUI/HyperOS: Vào Cài đặt → Quản lý ứng dụng → Smart Teacher Schedule → Bật 'Tự khởi chạy' (Autostart) và chọn Tiết kiệm pin là 'Không giới hạn'."
            OEM.OPPO -> "OPPO ColorOS: Vào Cài đặt → Quản lý ứng dụng → Smart Teacher Schedule → Bật 'Cho phép tự động chạy' và 'Cho phép chạy ngầm'."
            OEM.VIVO -> "Vivo FuntouchOS: Vào Cài đặt → Pin → Tiết kiệm pin / Chạy ngầm → Tìm Smart Teacher Schedule và bật 'Cho phép sử dụng pin ngầm'."
            OEM.HUAWEI -> "Huawei EMUI/HarmonyOS: Vào Cài đặt → Pin → Khởi chạy ứng dụng → Chuyển Smart Teacher Schedule sang Quản lý thủ công (Bật Tự động khởi chạy, Khởi chạy thứ cấp, Chạy ngầm)."
            OEM.REALME -> "Realme UI: Bật Tự khởi chạy và cho phép chạy ngầm trong mục Quản lý ứng dụng."
            else -> "Thiết bị Android: Tắt Tối ưu hóa pin (Battery Optimization) cho ứng dụng này để đảm bảo thông báo nhắc dạy không bị trì hoãn bởi chế độ Doze."
        }
    }
}
