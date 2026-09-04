package com.smartteacher.schedule.feature.reliability

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartteacher.schedule.core.alarms.AndroidAlarmScheduler
import com.smartteacher.schedule.core.database.entity.ReminderEntity
import com.smartteacher.schedule.core.model.ReminderType
import com.smartteacher.schedule.core.model.TargetType
import com.smartteacher.schedule.core.notifications.NotificationHelper
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationTestScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var statusMessage by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Kiểm tra thông báo (Test Bench)", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Quay lại")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Thử nghiệm báo động trên thiết bị thực",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Bấm nút test, sau đó khóa màn hình hoặc chuyển sang ứng dụng khác để kiểm tra xem hệ thống có đổ chuông và hiển thị Heads-up notification chuẩn không.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }

            statusMessage?.let {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFD1FAE5)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = it,
                        color = Color(0xFF065F46),
                        modifier = Modifier.padding(12.dp),
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // 1. Instant test
            Button(
                onClick = {
                    val notif = NotificationHelper(context)
                    notif.showTeachingReminderNotification(
                        reminderId = 999901L,
                        eventId = 1L,
                        subject = "Test: Công nghệ CNC",
                        className = "CĐCK01",
                        room = "C202",
                        startTime = "08:00",
                        endTime = "10:00",
                        minutesRemaining = 15
                    )
                    statusMessage = "Đã phát thông báo tức thì lên thanh trạng thái!"
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Hiển thị thông báo ngay lập tức")
            }

            // 2. Test in 10 seconds
            OutlinedButton(
                onClick = {
                    coroutineScope.launch {
                        val trigger = System.currentTimeMillis() + 10_000L
                        val scheduler = AndroidAlarmScheduler(context)
                        scheduler.scheduleCustomReminder(
                            ReminderEntity(
                                targetType = TargetType.EVENT,
                                targetId = 999902L,
                                title = "Test Báo động (10 giây)",
                                room = "Phòng Lab",
                                className = "CĐCK01",
                                triggerTimeMillis = trigger,
                                minutesBefore = 10,
                                reminderType = ReminderType.CUSTOM
                            )
                        )
                        statusMessage = "⏰ Đã đặt báo động hẹn giờ trong 10 GIÂY. Bạn có thể khóa màn hình ngay bây giờ để thử nghiệm!"
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Timer, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Báo động sau 10 giây (AlarmManager)")
            }

            // 3. Test in 1 minute
            OutlinedButton(
                onClick = {
                    coroutineScope.launch {
                        val trigger = System.currentTimeMillis() + 60_000L
                        val scheduler = AndroidAlarmScheduler(context)
                        scheduler.scheduleCustomReminder(
                            ReminderEntity(
                                targetType = TargetType.EVENT,
                                targetId = 999903L,
                                title = "Test Báo động (1 phút)",
                                room = "Xưởng Cơ Khí",
                                className = "CĐCK02",
                                triggerTimeMillis = trigger,
                                minutesBefore = 1,
                                reminderType = ReminderType.CUSTOM
                            )
                        )
                        statusMessage = "⏰ Đã đặt báo động hẹn giờ trong 1 PHÚT. Vui lòng khóa màn hình điện thoại để kiểm tra Doze Mode!"
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Timer, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Báo động sau 1 phút (Test Doze Mode)")
            }

            // 4. Test 60-minute reminder
            OutlinedButton(
                onClick = {
                    val notif = NotificationHelper(context)
                    notif.showTeachingReminderNotification(
                        reminderId = 999904L,
                        eventId = 1L,
                        subject = "Module CAD/CAM",
                        className = "CĐCK01",
                        room = "C202",
                        startTime = "08:00",
                        endTime = "10:00",
                        minutesRemaining = 60
                    )
                    statusMessage = "Đã hiển thị thông báo mô phỏng lời nhắc 60 phút!"
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Mô phỏng lời nhắc 60 phút")
            }

            // 5. Test 15-minute reminder
            OutlinedButton(
                onClick = {
                    val notif = NotificationHelper(context)
                    notif.showTeachingReminderNotification(
                        reminderId = 999905L,
                        eventId = 1L,
                        subject = "Module CAD/CAM",
                        className = "CĐCK01",
                        room = "C202",
                        startTime = "08:00",
                        endTime = "10:00",
                        minutesRemaining = 15
                    )
                    statusMessage = "Đã hiển thị thông báo mô phỏng lời nhắc 15 phút!"
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Mô phỏng lời nhắc 15 phút")
            }

            // 6. Test AI Morning Motivation Notification (v1.3.1)
            Button(
                onClick = {
                    val quote = com.smartteacher.schedule.core.ai.TeacherMotivationHelper.getRandomOfflineQuote(com.smartteacher.schedule.core.ai.TeacherMotivationHelper.TimePhase.MORNING)
                    val notif = NotificationHelper(context)
                    notif.showMorningMotivationNotification(
                        title = quote.greetingTitle,
                        message = "${quote.quoteContent}\n— ${quote.authorOrSource}"
                    )
                    statusMessage = "☀️ Đã phát thông báo Động Lực Buổi Sáng lên màn hình!"
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD97706)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("☀️ Thử nghiệm Thông báo Động Lực Buổi Sáng")
            }

            // 7. Test AI Evening Gratitude Notification (v1.3.1)
            Button(
                onClick = {
                    val quote = com.smartteacher.schedule.core.ai.TeacherMotivationHelper.getRandomOfflineQuote(com.smartteacher.schedule.core.ai.TeacherMotivationHelper.TimePhase.EVENING)
                    val notif = NotificationHelper(context)
                    notif.showEveningGratitudeNotification(
                        title = quote.greetingTitle,
                        message = "${quote.quoteContent}\n— ${quote.authorOrSource}"
                    )
                    statusMessage = "🌙 Đã phát thông báo Lời Cảm Ơn Buổi Tối lên màn hình!"
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("🌙 Thử nghiệm Thông báo Cảm Ơn Buổi Tối")
            }
        }
    }
}
