package com.smartteacher.schedule.feature.settings

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.shape.CircleShape
import com.smartteacher.schedule.core.sync.CloudSyncManager
import com.smartteacher.schedule.core.sync.GoogleCalendarManager
import com.smartteacher.schedule.feature.lockscreen.LockScreenGlanceManager
import com.smartteacher.schedule.feature.widget.ScheduleWidgetReceiver
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import androidx.compose.foundation.background
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
import androidx.compose.ui.unit.sp

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
    onSyncGoogleCalendar: () -> Unit = {},
    currentThemeMode: String = "system",
    onThemeModeChange: (String) -> Unit = {},
    currentLanguage: String = "vi",
    onLanguageChange: (String) -> Unit = {}
) {
    var showGoogleCalendarDialog by remember { mutableStateOf(false) }
    var showTelegramDialog by remember { mutableStateOf(false) }
    var showGeminiDialog by remember { mutableStateOf(false) }
    var showZaloDialog by remember { mutableStateOf(false) }
    var showStudentManagementDialog by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var lockScreenGlanceEnabled by remember { mutableStateOf(LockScreenGlanceManager.isLockScreenGlanceEnabled(context)) }
    var showLockScreenGuideDialog by remember { mutableStateOf(false) }

    var syncCode by remember { mutableStateOf(CloudSyncManager.getSyncCode(context)) }
    var isSyncing by remember { mutableStateOf(false) }
    var showEditSyncCodeDialog by remember { mutableStateOf(false) }
    var showPlatformGuide by remember { mutableStateOf<String?>(null) }
    var showEditProfileDialog by remember { mutableStateOf(false) }
    var showSubscriptionTierDialog by remember { mutableStateOf<String?>(null) }

    val profilePref = context.getSharedPreferences("smart_teacher_profile_v1", Context.MODE_PRIVATE)
    var teacherName by remember { mutableStateOf(profilePref.getString("name", "Thầy/Cô Giáo Viên") ?: "Thầy/Cô Giáo Viên") }
    var schoolName by remember { mutableStateOf(profilePref.getString("school", "Trường THPT / THCS") ?: "Trường THPT / THCS") }
    var departmentName by remember { mutableStateOf(profilePref.getString("department", "Tổ Khoa Học Tự Nhiên & Công Nghệ") ?: "Tổ Khoa Học Tự Nhiên & Công Nghệ") }
    var teacherPhone by remember { mutableStateOf(profilePref.getString("phone", "0961364600") ?: "0961364600") }
    var teacherEmail by remember { mutableStateOf(profilePref.getString("email", "giaovien@moet.edu.vn") ?: "giaovien@moet.edu.vn") }
    var bioQuote by remember { mutableStateOf(profilePref.getString("bioQuote", "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!") ?: "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!") }
    var teacherGender by remember { mutableStateOf(profilePref.getString("gender", "Nam") ?: "Nam") }
    var newSyncCodeInput by remember { mutableStateOf("") }
    var lastSyncTime by remember { mutableStateOf(CloudSyncManager.getLastSyncTime(context)) }
    var autoSyncEnabled by remember { mutableStateOf(CloudSyncManager.isAutoSyncEnabled(context)) }

    fun refreshProfileState() {
        val p = context.getSharedPreferences("smart_teacher_profile_v1", Context.MODE_PRIVATE)
        teacherName = p.getString("name", "Thầy/Cô Giáo Viên") ?: "Thầy/Cô Giáo Viên"
        schoolName = p.getString("school", "Trường THPT / THCS") ?: "Trường THPT / THCS"
        departmentName = p.getString("department", "Tổ Khoa Học Tự Nhiên & Công Nghệ") ?: "Tổ Khoa Học Tự Nhiên & Công Nghệ"
        teacherPhone = p.getString("phone", "0961364600") ?: "0961364600"
        teacherEmail = p.getString("email", "giaovien@moet.edu.vn") ?: "giaovien@moet.edu.vn"
        bioQuote = p.getString("bioQuote", "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!") ?: "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!"
        teacherGender = p.getString("gender", "Nam") ?: "Nam"
    }

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
            // Teacher Profile Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.weight(1f)) {
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (teacherName.isNotBlank()) teacherName.takeLast(1) else "G",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 20.sp,
                                    color = Color.White
                                )
                            }
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(teacherName, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Surface(shape = RoundedCornerShape(4.dp), color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)) {
                                        Text(teacherGender, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp))
                                    }
                                }
                                Text(schoolName, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.75f))
                                Text(departmentName, fontSize = 11.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
                            }
                        }

                        OutlinedButton(
                            onClick = { showEditProfileDialog = true },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(32.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Sửa hồ sơ", fontSize = 11.sp)
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("📞 $teacherPhone", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                        Text("✉️ $teacherEmail", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                    }

                    if (bioQuote.isNotBlank()) {
                        Text(
                            "\"$bioQuote\"",
                            fontSize = 11.sp,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.9f)
                        )
                    }
                }
            }

            // Group: GIAO DIỆN & NGÔN NGỮ
            SettingsGroupHeader("GIAO DIỆN & NGÔN NGỮ")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // 1. Chế độ giao diện (Sáng / Tối / Hệ thống)
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(
                                if (currentThemeMode == "dark") Icons.Default.DarkMode else if (currentThemeMode == "light") Icons.Default.LightMode else Icons.Default.SettingsBrightness,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Column {
                                Text("Chế độ giao diện (Sáng / Tối)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("Tùy biến màu sắc khi làm việc ban ngày hoặc ban đêm", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            // Sáng
                            Surface(
                                modifier = Modifier.weight(1f).clickable { onThemeModeChange("light") },
                                shape = RoundedCornerShape(8.dp),
                                color = if (currentThemeMode == "light") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (currentThemeMode == "light") MaterialTheme.colorScheme.primary else Color.Transparent)
                            ) {
                                Row(modifier = Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.LightMode, contentDescription = null, modifier = Modifier.size(14.dp), tint = if (currentThemeMode == "light") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Sáng", fontSize = 11.sp, fontWeight = if (currentThemeMode == "light") FontWeight.Bold else FontWeight.Normal)
                                }
                            }
                            // Tối
                            Surface(
                                modifier = Modifier.weight(1f).clickable { onThemeModeChange("dark") },
                                shape = RoundedCornerShape(8.dp),
                                color = if (currentThemeMode == "dark") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (currentThemeMode == "dark") MaterialTheme.colorScheme.primary else Color.Transparent)
                            ) {
                                Row(modifier = Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.DarkMode, contentDescription = null, modifier = Modifier.size(14.dp), tint = if (currentThemeMode == "dark") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Tối", fontSize = 11.sp, fontWeight = if (currentThemeMode == "dark") FontWeight.Bold else FontWeight.Normal)
                                }
                            }
                            // Hệ thống
                            Surface(
                                modifier = Modifier.weight(1f).clickable { onThemeModeChange("system") },
                                shape = RoundedCornerShape(8.dp),
                                color = if (currentThemeMode == "system") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (currentThemeMode == "system") MaterialTheme.colorScheme.primary else Color.Transparent)
                            ) {
                                Row(modifier = Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.SettingsBrightness, contentDescription = null, modifier = Modifier.size(14.dp), tint = if (currentThemeMode == "system") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Hệ thống", fontSize = 11.sp, fontWeight = if (currentThemeMode == "system") FontWeight.Bold else FontWeight.Normal)
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))

                    // 2. Ngôn ngữ hiển thị
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(
                                Icons.Default.Translate,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Column {
                                Text("Ngôn ngữ hiển thị (Language)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Text("Lựa chọn ngôn ngữ sử dụng trên ứng dụng", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            // Tiếng Việt
                            Surface(
                                modifier = Modifier.weight(1f).clickable {
                                    onLanguageChange("vi")
                                    Toast.makeText(context, "Đã chuyển sang Tiếng Việt", Toast.LENGTH_SHORT).show()
                                },
                                shape = RoundedCornerShape(8.dp),
                                color = if (currentLanguage == "vi") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (currentLanguage == "vi") MaterialTheme.colorScheme.primary else Color.Transparent)
                            ) {
                                Row(modifier = Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                                    Text("🇻🇳 Tiếng Việt", fontSize = 12.sp, fontWeight = if (currentLanguage == "vi") FontWeight.Bold else FontWeight.Normal)
                                }
                            }
                            // English
                            Surface(
                                modifier = Modifier.weight(1f).clickable {
                                    onLanguageChange("en")
                                    Toast.makeText(context, "Switched to English", Toast.LENGTH_SHORT).show()
                                },
                                shape = RoundedCornerShape(8.dp),
                                color = if (currentLanguage == "en") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, if (currentLanguage == "en") MaterialTheme.colorScheme.primary else Color.Transparent)
                            ) {
                                Row(modifier = Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                                    Text("🇬🇧 English", fontSize = 12.sp, fontWeight = if (currentLanguage == "en") FontWeight.Bold else FontWeight.Normal)
                                }
                            }
                        }
                    }
                }
            }
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
                    HorizontalDivider()
                    SettingsItem(
                        title = "Telegram Bot",
                        subtitle = if (telegramEnabled) "Đang hoạt động (Gửi nhắc lịch tự động)" else "Chưa bật cấu hình",
                        icon = Icons.Default.Send,
                        onClick = { showTelegramDialog = true }
                    )
                    HorizontalDivider()
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
                        title = "Sổ Lớp & Quản Lý Học Sinh",
                        subtitle = "Điểm danh 1-chạm, điểm nề nếp Kudos, nhập file Excel/Word danh sách lớp",
                        icon = Icons.Default.Groups,
                        onClick = { showStudentManagementDialog = true }
                    )
                    HorizontalDivider()
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

            // Group: HỆ SINH THÁI ĐA NỀN TẢNG (v2.0.0)
            SettingsGroupHeader("HỆ SINH THÁI ĐA NỀN TẢNG (v2.0.0)")
            Text(
                "💡 Nhấp vào bất kỳ lựa chọn nào để xem hướng dẫn cài đặt chi tiết:",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )

            // 5 Platform Cards Grid
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // 1. Android APK
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showPlatformGuide = "android" },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                            Box(modifier = Modifier.size(36.dp).background(Color(0xFF10B981).copy(alpha = 0.15f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.PhoneAndroid, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(20.dp))
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("Android APK", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Surface(shape = RoundedCornerShape(4.dp), color = Color(0xFF10B981).copy(alpha = 0.15f)) {
                                        Text("v2.0.0 • ~15.8 MB", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                    }
                                }
                                Text("Cài trực tiếp Samsung, Tecno, Xiaomi, Oppo...", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }
                        Text("Hướng dẫn ➔", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669))
                    }
                }

                // 2. iOS / iPhone
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showPlatformGuide = "ios" },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                            Box(modifier = Modifier.size(36.dp).background(Color(0xFF8B5CF6).copy(alpha = 0.15f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.PhoneIphone, contentDescription = null, tint = Color(0xFF8B5CF6), modifier = Modifier.size(20.dp))
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("Bản iOS / iPhone & iPad", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Surface(shape = RoundedCornerShape(4.dp), color = Color(0xFF8B5CF6).copy(alpha = 0.15f)) {
                                        Text("PWA iOS Safari", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7C3AED), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                    }
                                }
                                Text("3 bước thêm vào Màn hình chính qua Safari", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }
                        Text("Hướng dẫn ➔", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7C3AED))
                    }
                }

                // 3. Desktop Windows / Mac
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showPlatformGuide = "desktop" },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF6366F1).copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                            Box(modifier = Modifier.size(36.dp).background(Color(0xFF6366F1).copy(alpha = 0.15f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Laptop, contentDescription = null, tint = Color(0xFF6366F1), modifier = Modifier.size(20.dp))
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("Máy tính Desktop", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Surface(shape = RoundedCornerShape(4.dp), color = Color(0xFF6366F1).copy(alpha = 0.15f)) {
                                        Text("Portable • ~2.4 MB", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4F46E5), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                    }
                                }
                                Text("Cửa sổ bục giảng thu nhỏ PiP & chuông Crystal Chime", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }
                        Text("Hướng dẫn ➔", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF4F46E5))
                    }
                }

                // 4. Web App PWA
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showPlatformGuide = "web" },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF43F5E).copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                            Box(modifier = Modifier.size(36.dp).background(Color(0xFFF43F5E).copy(alpha = 0.15f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Language, contentDescription = null, tint = Color(0xFFF43F5E), modifier = Modifier.size(20.dp))
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("Web App PWA", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Surface(shape = RoundedCornerShape(4.dp), color = Color(0xFFF43F5E).copy(alpha = 0.15f)) {
                                        Text("Trực tiếp • Offline", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE11D48), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                    }
                                }
                                Text("Truy cập gvcncdsai.io.vn/app trên Chrome, Edge", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }
                        Text("Hướng dẫn ➔", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE11D48))
                    }
                }

                // 5. Google Play AAB
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showPlatformGuide = "googleplay" },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF0284C7).copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                            Box(modifier = Modifier.size(36.dp).background(Color(0xFF0284C7).copy(alpha = 0.15f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Shop, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(20.dp))
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text("Google Play AAB", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Surface(shape = RoundedCornerShape(4.dp), color = Color(0xFF0284C7).copy(alpha = 0.15f)) {
                                        Text("Signed Release", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0284C7), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                    }
                                }
                                Text("Gói App Bundle chuẩn triển khai MDM Nhà trường", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                        }
                        Text("Chi tiết ➔", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0284C7))
                    }
                }
            }

            // Group: BẢN QUYỀN & PHÁP LÝ GIÁO DỤC
            SettingsGroupHeader("BẢN QUYỀN & PHÁP LÝ GIÁO DỤC")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Text("Giấy Phép Bản Quyền Số: VN-EDU-2026-STSAI", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    Text(
                        "• Bản quyền tác giả & Đơn vị phát triển: Huy Technology AI\n• Chứng nhận sở hữu trí tuệ: Giải pháp Trợ lý Lịch dạy & Sư phạm số\n• Tiêu chuẩn an toàn thông tin: Đáp ứng Khung năng lực số giáo viên (CV 3456/BGDĐT-CNTT) & Bảo mật dữ liệu học sinh (Nghị định 13/2023/NĐ-CP).",
                        fontSize = 11.sp,
                        lineHeight = 16.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
            }

            // Group: BẢNG GÓI CƯỚC & DỊCH VỤ
            SettingsGroupHeader("BẢNG GÓI CƯỚC & DỊCH VỤ")
            Text(
                "💡 Nhấp vào từng gói cước bên dưới để xem chi tiết tính năng & bảng giá:",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // Tier 1: Free
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showSubscriptionTierDialog = "free" },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                ) {
                    Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Gói Cá Nhân (Miễn Phí)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                Surface(shape = RoundedCornerShape(4.dp), color = Color(0xFF10B981).copy(alpha = 0.15f)) {
                                    Text("0 đ", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                }
                            }
                            Text("Thời khóa biểu, Báo thức chuông lớn, Điểm danh cơ bản", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                        Text("Xem chi tiết ➔", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFF059669))
                    }
                }

                // Tier 2: Pro
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showSubscriptionTierDialog = "pro" },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.4f))
                ) {
                    Row(modifier = Modifier.padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Gói Giáo Viên Pro (VIP)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF7C3AED))
                                Surface(shape = RoundedCornerShape(4.dp), color = Color(0xFF8B5CF6).copy(alpha = 0.15f)) {
                                    Text("Khuyên Dùng", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7C3AED), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                }
                            }
                            Text("Full AI Giáo án 5512, Đề thi TT 22, Voice AI Tutor, Sổ điểm TT 22", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("59k/tháng", fontWeight = FontWeight.ExtraBold, fontSize = 11.sp, color = Color(0xFF7C3AED))
                            Text("Xem chi tiết ➔", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFF7C3AED))
                        }
                    }
                }

                // Tier 3: School
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showSubscriptionTierDialog = "school" },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF0284C7).copy(alpha = 0.4f))
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Gói Toàn Trường (School Campus)", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF0284C7))
                                Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFF0284C7).copy(alpha = 0.15f)) {
                                    Text("BGH & Sở", fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0284C7), modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                                }
                            }
                            Text("Xem chi tiết ➔", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = Color(0xFF0284C7))
                        }
                        Text(
                            "Liên hệ nhận bảng phí theo số lượng User toàn trường. Kết nối 4 cổng: Nhà trường - Giáo viên - Học sinh - Phụ huynh.",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f)
                        )
                    }
                }
            }

            // Group: ĐỒNG BỘ ĐÁM MÂY ĐA NỀN TẢNG (PC, MAC, LINUX, IPHONE, WEB)
            SettingsGroupHeader("ĐỒNG BỘ ĐÁM MÂY ĐA NỀN TẢNG (PC, MAC, LINUX, IPHONE, WEB)")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(Color(0xFF0284C7).copy(alpha = 0.15f), RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CloudSync, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(22.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Mã Đồng Bộ Đám Mây", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                            Text("Dùng chung mã này trên Máy tính và Điện thoại để liên kết dữ liệu tự động.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("MÃ ĐỒNG BỘ CỦA THẦY/CÔ:", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                Text(syncCode, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.onSurface)
                            }
                            OutlinedButton(
                                onClick = {
                                    newSyncCodeInput = syncCode
                                    showEditSyncCodeDialog = true
                                },
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.height(34.dp),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Đổi mã", fontSize = 12.sp)
                            }
                        }
                    }

                    if (lastSyncTime > 0L) {
                        val formattedTime = try {
                            val instant = Instant.ofEpochMilli(lastSyncTime)
                            val formatter = DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy").withZone(ZoneId.systemDefault())
                            formatter.format(instant)
                        } catch (e: Exception) { "" }

                        if (formattedTime.isNotBlank()) {
                            Text("🟢 Lần đồng bộ gần nhất: $formattedTime", style = MaterialTheme.typography.labelSmall, color = Color(0xFF059669), fontWeight = FontWeight.SemiBold)
                        }
                    }

                    // Smart 2-Way Sync Button
                    Button(
                        onClick = {
                            if (isSyncing) return@Button
                            isSyncing = true
                            coroutineScope.launch {
                                val result = CloudSyncManager.syncBothWays(context)
                                isSyncing = false
                                if (result.isSuccess) {
                                    lastSyncTime = CloudSyncManager.getLastSyncTime(context)
                                    refreshProfileState()
                                    Toast.makeText(context, result.getOrNull() ?: "Đồng bộ đám mây thành công!", Toast.LENGTH_LONG).show()
                                } else {
                                    Toast.makeText(context, "Lỗi đồng bộ: ${result.exceptionOrNull()?.message}", Toast.LENGTH_LONG).show()
                                }
                            }
                        },
                        enabled = !isSyncing,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(if (isSyncing) Icons.Default.Sync else Icons.Default.CloudSync, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(if (isSyncing) "Đang đồng bộ..." else "⚡ Đồng bộ 2 chiều thông minh")
                    }

                    // Explicit Actions: Pull from PC vs Push to PC
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                if (isSyncing) return@OutlinedButton
                                isSyncing = true
                                coroutineScope.launch {
                                    val result = CloudSyncManager.pullFromCloudExplicit(context)
                                    isSyncing = false
                                    if (result.isSuccess) {
                                        lastSyncTime = CloudSyncManager.getLastSyncTime(context)
                                        refreshProfileState()
                                        Toast.makeText(context, result.getOrNull() ?: "Đã nhận lịch & hồ sơ từ Máy tính thành công!", Toast.LENGTH_LONG).show()
                                    } else {
                                        Toast.makeText(context, "Lỗi tải lịch: ${result.exceptionOrNull()?.message}", Toast.LENGTH_LONG).show()
                                    }
                                }
                            },
                            enabled = !isSyncing,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Nhận từ PC", fontSize = 12.sp)
                        }

                        OutlinedButton(
                            onClick = {
                                if (isSyncing) return@OutlinedButton
                                isSyncing = true
                                coroutineScope.launch {
                                    val result = CloudSyncManager.pushToCloudExplicit(context)
                                    isSyncing = false
                                    if (result.isSuccess) {
                                        lastSyncTime = CloudSyncManager.getLastSyncTime(context)
                                        Toast.makeText(context, result.getOrNull() ?: "Đã đẩy lịch lên Máy tính thành công!", Toast.LENGTH_LONG).show()
                                    } else {
                                        Toast.makeText(context, "Lỗi đẩy lịch: ${result.exceptionOrNull()?.message}", Toast.LENGTH_LONG).show()
                                    }
                                }
                            },
                            enabled = !isSyncing,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Đẩy lên PC", fontSize = 12.sp)
                        }
                    }

                    Text(
                        text = "💡 Thầy/Cô mở trình duyệt trên Máy tính (Windows, Mac, Linux) vào địa chỉ: gvcncdsai.io.vn/app và nhập mã trên để toàn bộ lịch dạy được đồng bộ 2 chiều tức thì!",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f)
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
                                "Phiên bản ${com.smartteacher.schedule.BuildConfig.VERSION_NAME} • Tự Động Phục Hồi & Bảo Vệ Toàn Diện Lịch Dạy",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.primaryContainer
                        ) {
                            Text(
                                "v${com.smartteacher.schedule.BuildConfig.VERSION_NAME}",
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
                    HorizontalDivider()
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

    if (showStudentManagementDialog) {
        androidx.compose.ui.window.Dialog(
            onDismissRequest = { showStudentManagementDialog = false },
            properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)
        ) {
            com.smartteacher.schedule.feature.students.StudentManagementScreen(
                onNavigateBack = { showStudentManagementDialog = false }
            )
        }
    }

    if (showEditSyncCodeDialog) {
        AlertDialog(
            onDismissRequest = { showEditSyncCodeDialog = false },
            title = { Text("Đổi Mã Đồng Bộ Đám Mây", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Thầy/Cô có thể nhập Số điện thoại hoặc Mã đồng bộ từ Máy tính (Windows/Mac/Web) để kết nối chung dữ liệu:")
                    OutlinedTextField(
                        value = newSyncCodeInput,
                        onValueChange = { newSyncCodeInput = it.trim() },
                        label = { Text("Nhập Số điện thoại hoặc Mã đồng bộ") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newSyncCodeInput.isNotBlank()) {
                            CloudSyncManager.setSyncCode(context, newSyncCodeInput)
                            syncCode = newSyncCodeInput
                            showEditSyncCodeDialog = false
                            Toast.makeText(context, "Đã lưu mã đồng bộ mới: $newSyncCodeInput", Toast.LENGTH_SHORT).show()
                            coroutineScope.launch {
                                CloudSyncManager.pullFromCloud(context)
                            }
                        }
                    }
                ) {
                    Text("Lưu & Kết nối")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditSyncCodeDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }

    if (showPlatformGuide != null) {
        val platform = showPlatformGuide!!
        AlertDialog(
            onDismissRequest = { showPlatformGuide = null },
            title = {
                val titleText = when (platform) {
                    "android" -> "Hướng Dẫn Cài Đặt Android APK"
                    "ios" -> "Hướng Dẫn Bản iOS / iPhone (Safari)"
                    "desktop" -> "Hướng Dẫn Máy Tính Desktop (Windows/Mac)"
                    "web" -> "Hướng Dẫn Web App PWA Trực Tiếp"
                    "googleplay" -> "Thông Tin Google Play App Bundle"
                    else -> "Hướng Dẫn Nền Tảng"
                }
                Text(titleText, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    when (platform) {
                        "android" -> {
                            Text("1️⃣ Bấm 'Tải APK v2.0.0' bên dưới để tải tệp cài đặt chính thức.")
                            Text("2️⃣ Nếu máy báo 'Tệp có thể gây hại', bấm 'Vẫn tải xuống' (Do cài ngoài Google Play, file đã ký số tuyệt đối an toàn).")
                            Text("3️⃣ Bấm mở file vừa tải và chọn 'Cài đặt'.")
                            Text("4️⃣ Cực kỳ quan trọng: Vào Cài đặt điện thoại > Ứng dụng > Smart Teacher > Pin > Chọn 'Không hạn chế' để chống tắt ngầm chuông báo!")
                        }
                        "ios" -> {
                            Text("1️⃣ Mở trình duyệt Safari trên iPhone hoặc iPad.")
                            Text("2️⃣ Truy cập: gvcncdsai.io.vn/app")
                            Text("3️⃣ Bấm biểu tượng Chia sẻ (ô vuông có mũi tên lên ở dưới cùng).")
                            Text("4️⃣ Chọn 'Thêm vào MH chính' (Add to Home Screen) rồi nhấn 'Thêm'.")
                        }
                        "desktop" -> {
                            Text("1️⃣ Tải tệp SmartTeacherSchedule_v2.0.0_Desktop.zip từ gvcncdsai.io.vn")
                            Text("2️⃣ Chuột phải vào file zip và chọn 'Extract All...' (Giải nén tất cả).")
                            Text("3️⃣ Nhấp đúp vào file 'SmartTeacherSchedule.exe' để chạy ngay.")
                            Text("💡 Bật tính năng 'Cửa sổ thu nhỏ bục giảng' để xem đếm ngược ca dạy nổi đè lên slide PowerPoint!")
                        }
                        "web" -> {
                            Text("1️⃣ Mở Google Chrome hoặc Microsoft Edge trên máy tính/điện thoại.")
                            Text("2️⃣ Truy cập: gvcncdsai.io.vn/app")
                            Text("3️⃣ Bấm biểu tượng 'Cài đặt ứng dụng' ở góc phải thanh địa chỉ.")
                            Text("4️⃣ Chọn 'Ghim vào Taskbar / Start' để mở 1-chạm không cần mạng.")
                        }
                        "googleplay" -> {
                            Text("• Tệp Android App Bundle (AAB) đã ký số Release Keystore SHA-256.")
                            Text("• Chuẩn đóng gói tối ưu dung lượng và bảo mật cao nhất của Google.")
                            Text("• Dành cho Quản trị viên Phòng CNTT nhà trường triển khai diện rộng qua Google Workspace for Education (MDM).")
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (platform == "android") {
                            runCatching {
                                val url = "https://gvcncdsai.io.vn/SmartTeacherSchedule_v2.0.0_Release.apk"
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                context.startActivity(intent)
                            }
                        } else {
                            runCatching {
                                val url = if (platform == "desktop") "https://gvcncdsai.io.vn/releases/SmartTeacherSchedule_v2.0.0_Desktop.zip" else "https://gvcncdsai.io.vn/app"
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                context.startActivity(intent)
                            }
                        }
                        showPlatformGuide = null
                    }
                ) {
                    val btnLabel = when (platform) {
                        "android" -> "Tải APK Ngay"
                        "desktop" -> "Tải Zip Desktop"
                        "ios" -> "Mở Safari Ngay"
                        else -> "Mở Website"
                    }
                    Text(btnLabel)
                }
            },
            dismissButton = {
                TextButton(onClick = { showPlatformGuide = null }) {
                    Text("Đóng")
                }
            }
        )
    }

    if (showEditProfileDialog) {
        var tempName by remember { mutableStateOf(teacherName) }
        var tempSchool by remember { mutableStateOf(schoolName) }
        var tempDept by remember { mutableStateOf(departmentName) }
        var tempPhone by remember { mutableStateOf(teacherPhone) }
        var tempEmail by remember { mutableStateOf(teacherEmail) }
        var tempBio by remember { mutableStateOf(bioQuote) }
        var tempGender by remember { mutableStateOf(teacherGender) }

        AlertDialog(
            onDismissRequest = { showEditProfileDialog = false },
            title = { Text("Chỉnh Sửa Hồ Sơ Giáo Viên", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(value = tempName, onValueChange = { tempName = it }, label = { Text("Họ và Tên") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = tempSchool, onValueChange = { tempSchool = it }, label = { Text("Trường học công tác") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = tempDept, onValueChange = { tempDept = it }, label = { Text("Tổ bộ môn giảng dạy") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = tempPhone, onValueChange = { tempPhone = it }, label = { Text("Số điện thoại liên hệ") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = tempEmail, onValueChange = { tempEmail = it }, label = { Text("Email liên hệ") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = tempBio, onValueChange = { tempBio = it }, label = { Text("Châm ngôn sư phạm") }, maxLines = 2, modifier = Modifier.fillMaxWidth())

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("Giới tính:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        listOf("Nam", "Nữ", "Khác").forEach { g ->
                            FilterChip(
                                selected = tempGender == g,
                                onClick = { tempGender = g },
                                label = { Text(g, fontSize = 11.sp) }
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        teacherName = tempName.trim()
                        schoolName = tempSchool.trim()
                        departmentName = tempDept.trim()
                        teacherPhone = tempPhone.trim()
                        teacherEmail = tempEmail.trim()
                        bioQuote = tempBio.trim()
                        teacherGender = tempGender
                        profilePref.edit()
                            .putString("name", teacherName)
                            .putString("school", schoolName)
                            .putString("department", departmentName)
                            .putString("phone", teacherPhone)
                            .putString("email", teacherEmail)
                            .putString("bioQuote", bioQuote)
                            .putString("gender", teacherGender)
                            .putLong("updatedAt", System.currentTimeMillis())
                            .apply()
                        showEditProfileDialog = false
                        Toast.makeText(context, "Đã lưu hồ sơ giáo viên!", Toast.LENGTH_SHORT).show()

                        if (autoSyncEnabled) {
                            coroutineScope.launch {
                                CloudSyncManager.pushToCloud(context)
                            }
                        }
                    }
                ) {
                    Text("Lưu Hồ Sơ")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditProfileDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }

    if (showSubscriptionTierDialog != null) {
        val tier = showSubscriptionTierDialog!!
        AlertDialog(
            onDismissRequest = { showSubscriptionTierDialog = null },
            title = {
                val tTitle = when (tier) {
                    "free" -> "Gói Cá Nhân (Miễn Phí)"
                    "pro" -> "Gói Giáo Viên Pro (VIP)"
                    "school" -> "Gói Toàn Trường (School Campus)"
                    else -> "Chi Tiết Gói Cước"
                }
                Text(tTitle, fontWeight = FontWeight.Bold, fontSize = 17.sp)
            },
            text = {
                Column(modifier = Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    when (tier) {
                        "free" -> {
                            Surface(shape = RoundedCornerShape(8.dp), color = Color(0xFF10B981).copy(alpha = 0.12f), modifier = Modifier.fillMaxWidth()) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text("0 đ / Vĩnh Viễn", fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = Color(0xFF059669))
                                    Text("Trải nghiệm trợ lý giảng dạy cơ bản không giới hạn thời gian", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                                }
                            }
                            Text("✨ Tính năng bao gồm:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("✓ Quản lý thời khóa biểu 288 ca dạy cụ thể trong học kỳ", fontSize = 11.sp)
                            Text("✓ Báo thức chuông lớn 105dB & nhắc trước giờ vào lớp", fontSize = 11.sp)
                            Text("✓ Điểm danh học sinh & thi đua nề nếp Kudos cơ bản", fontSize = 11.sp)
                            Text("✓ Đồng bộ đám mây 2 chiều giữa Điện thoại và Máy tính", fontSize = 11.sp)
                            Text("✓ Hoạt động ngoại tuyến 100% khi mất mạng với Room DB", fontSize = 11.sp)
                            Text("✓ Xuất báo cáo Sổ Báo Giảng tuần chuẩn khổ A4", fontSize = 11.sp)
                        }
                        "pro" -> {
                            Surface(shape = RoundedCornerShape(8.dp), color = Color(0xFF8B5CF6).copy(alpha = 0.12f), modifier = Modifier.fillMaxWidth()) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text("59.000 đ/tháng • 490.000 đ/năm", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = Color(0xFF7C3AED))
                                    Text("Tiết kiệm 35% khi đăng ký theo năm • Tặng 1 tháng VIP", fontSize = 10.sp, color = Color(0xFF7C3AED))
                                }
                            }
                            Text("✨ Toàn bộ quyền lợi Gói Cá Nhân và thêm:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("✓ Soạn Kế hoạch bài dạy (Giáo án) chuẩn Công văn 5512 bằng AI", fontSize = 11.sp)
                            Text("✓ Soạn Đề kiểm tra ma trận & bảng đặc tả chuẩn Thông tư 22", fontSize = 11.sp)
                            Text("✓ Sổ điểm điện tử Thông tư 22 tự động tính ĐTBmhk & xếp loại Tốt/Khá/Đạt", fontSize = 11.sp)
                            Text("✓ Trợ lý giọng nói Voice AI sư phạm & giải đáp tình huống tức thì", fontSize = 11.sp)
                            Text("✓ Xuất Bảng kê giờ dạy & thù lao (PDF/Excel) có chữ ký duyệt", fontSize = 11.sp)
                            Text("✓ Không giới hạn lưu trữ giáo trình, tài liệu chuyên môn", fontSize = 11.sp)
                            Text("✓ Hỗ trợ kỹ thuật VIP 24/7 trực tiếp qua Zalo kỹ sư", fontSize = 11.sp)
                        }
                        "school" -> {
                            Surface(shape = RoundedCornerShape(8.dp), color = Color(0xFF0284C7).copy(alpha = 0.12f), modifier = Modifier.fillMaxWidth()) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text("Liên Hệ Để Nhận Bảng Phí", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = Color(0xFF0284C7))
                                    Text("Tính linh hoạt theo số lượng User toàn trường, không áp giá cố định", fontSize = 10.sp, color = Color(0xFF0284C7))
                                }
                            }
                            Text("✨ Giải pháp số hóa toàn diện cấp Trường / Sở:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("✓ Cấp tài khoản quản trị tập trung cho Ban Giám Hiệu & Tổ trưởng chuyên môn", fontSize = 11.sp)
                            Text("✓ Tự động phân công chuyên môn, xếp thời khóa biểu tự động toàn trường", fontSize = 11.sp)
                            Text("✓ Kết nối thông suốt 4 Cổng: Nhà Trường - Giáo Viên - Học Sinh - Phụ Huynh", fontSize = 11.sp)
                            Text("✓ Quản lý học bạ điện tử, sổ điểm điện tử Thông tư 22 toàn diện", fontSize = 11.sp)
                            Text("✓ Duyệt đơn xin nghỉ học trực tuyến, gửi thông báo tức thời tới phụ huynh", fontSize = 11.sp)
                            Text("✓ Hỗ trợ triển khai MDM qua Google Workspace for Education", fontSize = 11.sp)
                            Text("✓ Ký hợp đồng dịch vụ giáo dục, xuất hóa đơn VAT điện tử & đào tạo tập huấn", fontSize = 11.sp)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (tier == "pro" || tier == "school") {
                            runCatching {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://zalo.me/0961364600"))
                                context.startActivity(intent)
                            }
                        } else {
                            Toast.makeText(context, "Thầy/Cô đang sử dụng gói trải nghiệm miễn phí!", Toast.LENGTH_SHORT).show()
                        }
                        showSubscriptionTierDialog = null
                    }
                ) {
                    val label = when (tier) {
                        "pro" -> "Nâng Cấp Qua Zalo"
                        "school" -> "Liên Hệ Báo Phí Qua Zalo"
                        else -> "Đang Sử Dụng"
                    }
                    Text(label)
                }
            },
            dismissButton = {
                TextButton(onClick = { showSubscriptionTierDialog = null }) {
                    Text("Đóng")
                }
            }
        )
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
