package com.smartteacher.schedule.feature.reliability

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartteacher.schedule.core.database.entity.NotificationLogEntity
import com.smartteacher.schedule.core.reliability.OEMReliabilityHelper
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReliabilityCenterScreen(
    onBack: () -> Unit,
    logs: List<NotificationLogEntity>
) {
    val context = LocalContext.current
    var isNotifGranted by remember { mutableStateOf(OEMReliabilityHelper.isNotificationPermissionGranted(context)) }
    var isExactGranted by remember { mutableStateOf(OEMReliabilityHelper.isExactAlarmPermissionGranted(context)) }
    var isBatteryIgnored by remember { mutableStateOf(OEMReliabilityHelper.isIgnoringBatteryOptimizations(context)) }

    val oem = remember { OEMReliabilityHelper.getDeviceOEM() }
    val oemGuide = remember { OEMReliabilityHelper.getOEMInstructions(oem) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Độ tin cậy thông báo", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Quay lại")
                    }
                }
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Notification Reliability Center",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Để đảm bảo điện thoại luôn đổ chuông đúng 60 phút và 15 phút trước giờ dạy (kể cả khi tắt màn hình hoặc đóng app), vui lòng kiểm tra các quyền hệ thống dưới đây.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                        )
                    }
                }
            }

            // 1. Notification Permission
            item {
                PermissionStatusCard(
                    title = "Quyền hiển thị thông báo",
                    statusText = if (isNotifGranted) "Đã bật (ON)" else "Đang tắt (OFF)",
                    isOk = isNotifGranted,
                    onFix = {
                        runCatching { context.startActivity(OEMReliabilityHelper.getNotificationSettingsIntent(context)) }
                    }
                )
            }

            // 2. Exact Alarm Permission
            item {
                PermissionStatusCard(
                    title = "Báo động chính xác (Exact Alarm)",
                    statusText = if (isExactGranted) "Khả dụng (Available)" else "Chưa cấp quyền (Unavailable)",
                    isOk = isExactGranted,
                    onFix = {
                        runCatching { context.startActivity(OEMReliabilityHelper.getExactAlarmSettingsIntent(context)) }
                    }
                )
            }

            // 3. Battery Optimization
            item {
                PermissionStatusCard(
                    title = "Tối ưu hóa Pin (Doze Mode)",
                    statusText = if (isBatteryIgnored) "Không hạn chế (Unrestricted)" else "Đang bị tối ưu (Optimized)",
                    isOk = isBatteryIgnored,
                    onFix = {
                        runCatching { context.startActivity(OEMReliabilityHelper.getBatteryOptimizationSettingsIntent(context)) }
                    }
                )
            }

            // 4. OEM Specific Guidance Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.PhoneAndroid, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Thiết bị phát hiện: ${oem.brandName}",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = oemGuide,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedButton(
                            onClick = { OEMReliabilityHelper.openOEMAutoStartSettings(context) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Mở cài đặt chạy nền của hãng (${oem.brandName})")
                        }
                    }
                }
            }

            // 5. Diagnostics Log
            item {
                Text(
                    text = "Nhật ký chẩn đoán báo động (Diagnostics Log)",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold
                )
            }

            if (logs.isEmpty()) {
                item {
                    Text(
                        text = "Chưa có log báo động nào được ghi nhận.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            } else {
                items(logs.take(20)) { log ->
                    LogItemRow(log = log)
                }
            }
        }
    }
}

@Composable
fun PermissionStatusCard(
    title: String,
    statusText: String,
    isOk: Boolean,
    onFix: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isOk) MaterialTheme.colorScheme.surface else Color(0xFFFEF2F2)
        )
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (isOk) Icons.Default.CheckCircle else Icons.Default.Warning,
                contentDescription = null,
                tint = if (isOk) Color(0xFF10B981) else Color(0xFFEF4444),
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                Text(
                    text = statusText,
                    style = MaterialTheme.typography.bodySmall,
                    color = if (isOk) Color(0xFF059669) else Color(0xFFDC2626)
                )
            }
            if (!isOk) {
                Button(
                    onClick = onFix,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text("Fix", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun LogItemRow(log: NotificationLogEntity) {
    val dateStr = remember(log.timestamp) {
        val sdf = SimpleDateFormat("HH:mm:ss dd/MM", Locale.getDefault())
        sdf.format(Date(log.timestamp))
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = dateStr,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
            modifier = Modifier.width(90.dp)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "${log.event}: ${log.title}",
                style = MaterialTheme.typography.bodySmall,
                fontWeight = FontWeight.SemiBold
            )
            if (log.details.isNotBlank()) {
                Text(
                    text = log.details,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }
        }
    }
}
