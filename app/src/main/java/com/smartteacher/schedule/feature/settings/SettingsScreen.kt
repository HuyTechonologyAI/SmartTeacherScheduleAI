package com.smartteacher.schedule.feature.settings

import android.content.Intent
import android.net.Uri
import com.smartteacher.schedule.core.sync.GoogleCalendarManager
import com.smartteacher.schedule.feature.lockscreen.LockScreenGlanceManager
import com.smartteacher.schedule.feature.widget.ScheduleWidgetReceiver
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onOpenReliabilityCenter: () -> Unit,
    onTriggerDailyRefresh: () -> Unit,
    onExportJson: () -> Unit,
    onExportCsv: () -> Unit,
    onOpenReportDialog: () -> Unit = {},
    telegramEnabled: Boolean,
    onToggleTelegram: (Boolean) -> Unit,
    onSaveTelegramCreds: (token: String, chatId: String) -> Unit,
    geminiApiKey: String,
    onSaveGeminiApiKey: (String) -> Unit,
    onSyncGoogleCalendar: () -> Unit = {}
) {
    var showGoogleCalendarDialog by remember { mutableStateOf(false) }
    var showTelegramDialog by remember { mutableStateOf(false) }
    var showGeminiDialog by remember { mutableStateOf(false) }
    var showZaloDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current
    var lockScreenGlanceEnabled by remember { mutableStateOf(LockScreenGlanceManager.isLockScreenGlanceEnabled(context)) }
    var showLockScreenGuideDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Cài đặt hệ thống", fontWeight = FontWeight.Bold) }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Group 1: Notification & Reliability
            SettingsGroupHeader("ĐỘ TIN CẬY & THÔNG BÁO")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column {
                    SettingsItem(
                        title = "Trung tâm tin cậy thông báo (OEM)",
                        subtitle = "Kiểm tra quyền Exact Alarm & Tối ưu hóa pin",
                        icon = Icons.Default.HealthAndSafety,
                        onClick = onOpenReliabilityCenter
                    )
                    HorizontalDivider()
                    SettingsItem(
                        title = "Tự động làm mới 00:00 hằng ngày",
                        subtitle = "Tự động kích hoạt lịch hẹn, công việc và Widget mỗi ngày (Chạm để làm mới ngay)",
                        icon = Icons.Default.Autorenew,
                        onClick = onTriggerDailyRefresh
                    )
                }
            }

            // Group: Lock Screen & Widgets
            SettingsGroupHeader("MÀN HÌNH KHÓA & TIỆN ÍCH WIDGET")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LockClock,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Hiển thị lịch trên Màn hình khóa",
                                style = MaterialTheme.typography.bodyLarge,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                "Hiện ca dạy tiếp theo, đếm ngược và phòng học ngay dưới đồng hồ màn hình khóa (không cần mở khóa máy)",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        Switch(
                            checked = lockScreenGlanceEnabled,
                            onCheckedChange = { isChecked ->
                                lockScreenGlanceEnabled = isChecked
                                LockScreenGlanceManager.setLockScreenGlanceEnabled(context, isChecked)
                            }
                        )
                    }
                    HorizontalDivider()
                    SettingsItem(
                        title = "Mở Chế độ Đồng hồ Bục giảng (Toàn màn hình)",
                        subtitle = "Hiển thị đồng hồ to rõ và thời khóa biểu khi để máy trên bàn dạy học",
                        icon = Icons.Default.HourglassBottom,
                        onClick = {
                            LockScreenGlanceManager.openLockScreenClock(context)
                        }
                    )
                    HorizontalDivider()
                    SettingsItem(
                        title = "Cài đặt Màn hình khóa Tecno Spark Go (HiOS)",
                        subtitle = "Mở cài đặt để bật quyền 'Hiển thị trên màn hình khóa' cho máy Tecno",
                        icon = Icons.Default.PhoneAndroid,
                        onClick = {
                            LockScreenGlanceManager.openLockScreenSystemSettings(context)
                        }
                    )
                    HorizontalDivider()
                    SettingsItem(
                        title = "Ghim Widget ra Màn hình chính",
                        subtitle = "Hiển thị thời khóa biểu và việc cần làm (Kích thước 4x2)",
                        icon = Icons.Default.Widgets,
                        onClick = {
                            ScheduleWidgetReceiver.pinWidgetToHomeScreen(context)
                        }
                    )
                    HorizontalDivider()
                    SettingsItem(
                        title = "Hướng dẫn Màn hình khóa (Tecno / Samsung / Xiaomi)",
                        subtitle = "Mẹo hiển thị rõ nội dung và widget trên từng dòng máy",
                        icon = Icons.Default.HelpOutline,
                        onClick = { showLockScreenGuideDialog = true }
                    )
                }
            }

            // Group 2: Integrations
            SettingsGroupHeader("KẾT NỐI BÊN NGOÀI")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column {
                    SettingsItem(
                        title = "Google Calendar",
                        subtitle = "Đồng bộ hai chiều với tài khoản Google & Smartwatch",
                        icon = Icons.Default.Sync,
                        onClick = { showGoogleCalendarDialog = true }
                    )
                    Divider()
                    SettingsItem(
                        title = "Telegram Bot",
                        subtitle = if (telegramEnabled) "Đang hoạt động (Gửi nhắc lịch tự động)" else "Chưa bật cấu hình",
                        icon = Icons.Default.Send,
                        onClick = { showTelegramDialog = true }
                    )
                    Divider()
                    SettingsItem(
                        title = "Zalo Official Account",
                        subtitle = "Kiến trúc tích hợp qua Zalo OpenAPI chính thức",
                        icon = Icons.Default.Chat,
                        onClick = { showZaloDialog = true }
                    )
                }
            }

            // Group 3: AI & Privacy
            SettingsGroupHeader("TRÍ TUỆ NHÂN TẠO & BẢO MẬT")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column {
                    SettingsItem(
                        title = "Google Gemini API Key",
                        subtitle = if (geminiApiKey.isNotBlank()) "Đã cài đặt API Key" else "Chưa nhập (Dùng thuật toán Offline)",
                        icon = Icons.Default.AutoAwesome,
                        onClick = { showGeminiDialog = true }
                    )
                }
            }

            // Group 4: Pedagogical Reports (Sổ Báo Giảng & Bảng Kê Giờ Dạy Chuẩn Bộ GD&ĐT)
            SettingsGroupHeader("HỒ SƠ CHUYÊN MÔN & BÁO CÁO GIẢNG DẠY (CHUẨN BỘ GD&ĐT)")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column {
                    SettingsItem(
                        title = "Xuất Sổ Báo Giảng Tuần (PDF / Excel)",
                        subtitle = "Khổ A4 ngang chuẩn Bộ GD&ĐT, đầy đủ thứ, tiết, lớp, môn, tên bài và chữ ký",
                        icon = Icons.Default.Summarize,
                        onClick = onOpenReportDialog
                    )
                    HorizontalDivider()
                    SettingsItem(
                        title = "Xuất Bảng Kê Giờ Dạy & Thù Lao (PDF / Excel)",
                        subtitle = "Thống kê tiết Lý thuyết & Thực hành, tổng tiết quy chuẩn và bảng chữ ký duyệt",
                        icon = Icons.Default.Assessment,
                        onClick = onOpenReportDialog
                    )
                }
            }

            // Group 5: Data & Backup
            SettingsGroupHeader("SAO LƯU & XUẤT DỮ LIỆU THÔ")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column {
                    SettingsItem(
                        title = "Xuất dữ liệu ra file JSON",
                        subtitle = "Sao lưu toàn bộ thời khóa biểu và nhiệm vụ",
                        icon = Icons.Default.FileDownload,
                        onClick = onExportJson
                    )
                    HorizontalDivider()
                    SettingsItem(
                        title = "Xuất dữ liệu ra bảng tính CSV",
                        subtitle = "Dễ dàng mở bằng Microsoft Excel hoặc Google Sheets",
                        icon = Icons.Default.TableChart,
                        onClick = onExportCsv
                    )
                }
            }

            // Group 5: App Info & Developer Contact
            SettingsGroupHeader("THÔNG TIN ỨNG DỤNG & NHÀ PHÁT TRIỂN")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Smart Teacher Schedule AI",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                "Phiên bản 1.3.0 • Sổ Báo Giảng & Bảng Kê Chuẩn Bộ GD&ĐT",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer
                        ) {
                            Text(
                                "v1.3.0",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "\"Dạy đúng giờ – Làm đúng việc – Không bỏ sót\"",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    Divider()
                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        "LIÊN HỆ NHÀ LẬP TRÌNH",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // 1. Made in Huy Technology AI
                    Row(
                        modifier = Modifier.padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                "Tác giả / Bản quyền",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                            Text(
                                "Made in Huy Technology AI",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    // 2. SĐT / Zalo: 0961364600
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                runCatching {
                                    val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:0961364600"))
                                    context.startActivity(intent)
                                }
                            }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Phone,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "SĐT / Zalo",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                            Text(
                                "0961364600",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF10B981)
                            )
                        }
                        Text(
                            "Gọi / Zalo ➔",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF10B981)
                        )
                    }

                    // 3. Mail: huytechnologyai2025@gmail.com
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                runCatching {
                                    val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:huytechnologyai2025@gmail.com")).apply {
                                        putExtra(Intent.EXTRA_SUBJECT, "[Smart Teacher Schedule AI] Liên hệ hỗ trợ")
                                    }
                                    context.startActivity(intent)
                                }
                            }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Email,
                            contentDescription = null,
                            tint = Color(0xFF3B82F6),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Email",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                            Text(
                                "huytechnologyai2025@gmail.com",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF3B82F6)
                            )
                        }
                        Text(
                            "Gửi mail ➔",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFF3B82F6)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    if (showLockScreenGuideDialog) {
        LockScreenGuideDialog(
            onDismiss = { showLockScreenGuideDialog = false },
            onOpenSystemSettings = {
                showLockScreenGuideDialog = false
                LockScreenGlanceManager.openLockScreenSystemSettings(context)
            }
        )
    }

    if (showGoogleCalendarDialog) {
        GoogleCalendarSyncDialog(
            onDismiss = { showGoogleCalendarDialog = false },
            onSyncAll = {
                showGoogleCalendarDialog = false
                onSyncGoogleCalendar()
            },
            onOpenCalendarApp = {
                showGoogleCalendarDialog = false
                GoogleCalendarManager.openGoogleCalendarApp(context)
            }
        )
    }

    if (showTelegramDialog) {
        TelegramConfigDialog(
            onDismiss = { showTelegramDialog = false },
            onSave = { token, chatId ->
                onSaveTelegramCreds(token, chatId)
                onToggleTelegram(true)
                showTelegramDialog = false
            }
        )
    }

    if (showGeminiDialog) {
        GeminiApiKeyDialog(
            currentKey = geminiApiKey,
            onDismiss = { showGeminiDialog = false },
            onSave = { key ->
                onSaveGeminiApiKey(key)
                showGeminiDialog = false
            }
        )
    }

    if (showZaloDialog) {
        AlertDialog(
            onDismissRequest = { showZaloDialog = false },
            title = { Text("Tích hợp Zalo Official API", fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "Theo chính sách bảo mật của Android & Zalo, ứng dụng không đọc tin nhắn Zalo cá nhân trái phép. Thay vào đó, ứng dụng cung cấp kiến trúc nhận lịch qua Zalo OA Webhook và ZBS Template Message. Xem tài liệu ZALO_SETUP.md trong thư mục dự án để cấu hình App ID & OA Secret."
                )
            },
            confirmButton = {
                Button(onClick = { showZaloDialog = false }) {
                    Text("Đã hiểu")
                }
            }
        )
    }
}

@Composable
fun SettingsGroupHeader(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.labelSmall,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(start = 4.dp, top = 6.dp)
    )
}

@Composable
fun SettingsItem(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.SemiBold)
            Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
        )
    }
}

@Composable
fun TelegramConfigDialog(onDismiss: () -> Unit, onSave: (String, String) -> Unit) {
    var token by remember { mutableStateOf("") }
    var chatId by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Cấu hình Telegram Bot", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Tạo bot bằng @BotFather trên Telegram, lấy Token và Chat ID để bot gửi thông báo nhắc lịch dạy lên điện thoại.", style = MaterialTheme.typography.bodySmall)
                OutlinedTextField(
                    value = token,
                    onValueChange = { token = it },
                    label = { Text("Bot Token") },
                    placeholder = { Text("123456:ABC-DEF1234...") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = chatId,
                    onValueChange = { chatId = it },
                    label = { Text("Chat ID của bạn") },
                    placeholder = { Text("987654321") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(onClick = { onSave(token.trim(), chatId.trim()) }) {
                Text("Lưu & Kích hoạt")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Hủy")
            }
        }
    )
}

@Composable
fun GeminiApiKeyDialog(currentKey: String, onDismiss: () -> Unit, onSave: (String) -> Unit) {
    var key by remember { mutableStateOf(currentKey) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Google Gemini API Key", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Nhập API Key từ Google AI Studio (aistudio.google.com). Nếu để trống, ứng dụng sẽ tự động dùng bộ xử lý NLP cục bộ (Offline).", style = MaterialTheme.typography.bodySmall)
                OutlinedTextField(
                    value = key,
                    onValueChange = { key = it },
                    label = { Text("Gemini API Key") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(onClick = { onSave(key.trim()) }) {
                Text("Lưu")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Hủy")
            }
        }
    )
}

@Composable
fun GoogleCalendarSyncDialog(
    onDismiss: () -> Unit,
    onSyncAll: () -> Unit,
    onOpenCalendarApp: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.Sync, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Text("Đồng bộ Google Calendar", fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    "Đồng bộ toàn bộ lịch dạy sang Google Calendar trên máy để nhận nhắc nhở 60m & 15m và hiển thị lên Đồng hồ thông minh (Smartwatch).",
                    style = MaterialTheme.typography.bodySmall
                )

                Button(
                    onClick = onSyncAll,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.CloudSync, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Đồng bộ toàn bộ lịch dạy ngay")
                }

                OutlinedButton(
                    onClick = onOpenCalendarApp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.CalendarMonth, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Mở ứng dụng Google Calendar")
                }

                Text(
                    "💡 Mẹo: Khi tạo hoặc sửa lịch dạy, Thầy/Cô cũng có thể bấm biểu tượng đồng bộ để đưa từng ca dạy vào Google Calendar.",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Đóng")
            }
        }
    )
}

@Composable
fun LockScreenGuideDialog(
    onDismiss: () -> Unit,
    onOpenSystemSettings: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.LockClock, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Text("Cài đặt Màn hình khóa", fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    "Smart Teacher Schedule AI sử dụng công nghệ Live Glance và Keyguard Widget để giáo viên xem lịch dạy ngay dưới đồng hồ màn hình khóa mà không cần mở khóa điện thoại.",
                    style = MaterialTheme.typography.bodySmall
                )

                HorizontalDivider()

                Text("📱 1. Tecno Spark Go (HiOS 14 / 15 trên Android 15):", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = Color(0xFF10B981))
                Text("• Bước 1 (Hiển thị nội dung): Vào Cài đặt máy > Trung tâm thông báo > Màn hình khóa > Định dạng: Chọn 'Hiển thị thông báo và nội dung' (nếu để 'Ẩn nội dung' thì HiOS sẽ giấu chữ).", style = MaterialTheme.typography.bodySmall)
                Text("• Bước 2 (Quyền ứng dụng): Vào Cài đặt > Ứng dụng > Smart Teacher Schedule AI > Thông báo > Bật 'Hiển thị trên màn hình khóa' và 'Biểu ngữ'.", style = MaterialTheme.typography.bodySmall)
                Text("• Bước 3 (Chế độ Đồng hồ Bục giảng): Bấm nút 'Đồng hồ bục giảng' trong app để hiển thị đồng hồ to rõ và thời khóa biểu đè lên màn hình khóa mà không cần mở khóa!", style = MaterialTheme.typography.bodySmall)

                HorizontalDivider()

                Text("📱 2. Samsung Galaxy (One UI 5 / 6 / 6.1):", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Text("• Cách 1 (Widget Màn hình khóa): Vào Cài đặt máy > Màn hình khóa > Tiện ích (Widgets) > Bật Smart Teacher Schedule.", style = MaterialTheme.typography.bodySmall)
                Text("• Cách 2 (Hiện thông báo): Cài đặt > Màn hình khóa > Thông báo > Chọn 'Hiển thị nội dung chi tiết'.", style = MaterialTheme.typography.bodySmall)

                HorizontalDivider()

                Text("📱 3. Xiaomi / Redmi / POCO (MIUI & HyperOS):", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Text("• Vào Cài đặt > Thông báo & Trung tâm điều khiển > Màn hình khóa > Định dạng: Chọn 'Hiển thị thông báo và nội dung'.", style = MaterialTheme.typography.bodySmall)

                HorizontalDivider()

                Text("📱 3. OPPO / Realme / OnePlus (ColorOS):", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Text("• Vào Cài đặt > Thông báo & Thanh trạng thái > Màn hình khóa > Bật 'Hiển thị thông tin ứng dụng và nội dung'.", style = MaterialTheme.typography.bodySmall)

                HorizontalDivider()

                Text("📱 4. Vivo / iQOO (FuntouchOS):", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                Text("• Vào Cài đặt > Màn hình khóa & Hình nền > Cài đặt màn hình khóa > Mở thông báo.", style = MaterialTheme.typography.bodySmall)

                Button(
                    onClick = onOpenSystemSettings,
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                ) {
                    Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Mở Cài đặt Màn hình khóa của máy")
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Đã hiểu")
            }
        }
    )
}
