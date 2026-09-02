package com.smartteacher.schedule.feature.settings

import android.content.Intent
import android.net.Uri
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
    onOpenNotificationTest: () -> Unit,
    onExportJson: () -> Unit,
    onExportCsv: () -> Unit,
    telegramEnabled: Boolean,
    onToggleTelegram: (Boolean) -> Unit,
    onSaveTelegramCreds: (token: String, chatId: String) -> Unit,
    geminiApiKey: String,
    onSaveGeminiApiKey: (String) -> Unit
) {
    var showTelegramDialog by remember { mutableStateOf(false) }
    var showGeminiDialog by remember { mutableStateOf(false) }
    var showZaloDialog by remember { mutableStateOf(false) }

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
                    Divider()
                    SettingsItem(
                        title = "Kiểm tra thông báo tức thì (Test Bench)",
                        subtitle = "Thử nghiệm báo động trong 10s, 1 phút",
                        icon = Icons.Default.NotificationsActive,
                        onClick = onOpenNotificationTest
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
                        subtitle = "Đồng bộ hai chiều với tài khoản Google",
                        icon = Icons.Default.Sync,
                        onClick = { /* Google Calendar OAuth flow */ }
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

            // Group 4: Data & Backup
            SettingsGroupHeader("SAO LƯU & XUẤT DỮ LIỆU")
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
                    Divider()
                    SettingsItem(
                        title = "Xuất dữ liệu ra bảng tính CSV",
                        subtitle = "Dễ dàng mở bằng Microsoft Excel hoặc Google Sheets",
                        icon = Icons.Default.TableChart,
                        onClick = onExportCsv
                    )
                }
            }

            // Group 5: App Info & Developer Contact
            val context = LocalContext.current
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
                                "Phiên bản 1.2.0 • Android 15 Ready",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer
                        ) {
                            Text(
                                "v1.2.0",
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
