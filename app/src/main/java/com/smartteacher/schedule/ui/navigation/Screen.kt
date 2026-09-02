package com.smartteacher.schedule.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Today : Screen("today", "Hôm nay", Icons.Default.Today)
    object Calendar : Screen("calendar", "Lịch dạy", Icons.Default.CalendarMonth)
    object Tasks : Screen("tasks", "Nhiệm vụ", Icons.Default.Checklist)
    object AIAssistant : Screen("ai_assistant", "AI Trợ lý", Icons.Default.AutoAwesome)
    object Settings : Screen("settings", "Cài đặt", Icons.Default.Settings)

    // Secondary screens
    object AddSchedule : Screen("add_schedule", "Thêm lịch dạy", Icons.Default.Add)
    object ReliabilityCenter : Screen("reliability_center", "Độ tin cậy thông báo", Icons.Default.HealthAndSafety)
    object NotificationTest : Screen("notification_test", "Kiểm tra thông báo", Icons.Default.NotificationsActive)
}

val bottomNavScreens = listOf(
    Screen.Today,
    Screen.Calendar,
    Screen.Tasks,
    Screen.AIAssistant,
    Screen.Settings
)
