package com.smartteacher.schedule.feature.lockscreen

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartteacher.schedule.MainActivity
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity
import com.smartteacher.schedule.ui.theme.SmartTeacherScheduleTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

/**
 * Chế độ Đồng hồ Lịch dạy Toàn màn hình khi Khóa máy (Lock Screen & Desk Clock Mode)
 * Cho phép giáo viên xem giờ to rõ và lịch dạy ngay trên màn hình khóa mà không cần mở khóa điện thoại.
 * Hoạt động hoàn hảo trên Tecno Spark Go (HiOS) và tất cả các dòng Android 8 - 15.
 */
class LockScreenClockActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Cấu hình hiển thị đè lên màn hình khóa mà không cần mở khóa điện thoại
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(false)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
        }

        // Giữ màn hình sáng theo mặc định để giáo viên tiện canh giờ trên bục giảng
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        setContent {
            SmartTeacherScheduleTheme(darkTheme = true) {
                LockScreenClockContent(
                    onClose = { finish() },
                    onOpenApp = {
                        val intent = Intent(this, MainActivity::class.java).apply {
                            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                        }
                        startActivity(intent)
                        finish()
                    },
                    onToggleKeepScreenOn = { keepOn ->
                        if (keepOn) {
                            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                        } else {
                            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun LockScreenClockContent(
    onClose: () -> Unit,
    onOpenApp: () -> Unit,
    onToggleKeepScreenOn: (Boolean) -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    var currentTime by remember { mutableStateOf(LocalTime.now()) }
    var currentDate by remember { mutableStateOf(LocalDate.now()) }
    var keepScreenOn by remember { mutableStateOf(true) }

    var todayEvents by remember { mutableStateOf<List<CalendarEventEntity>>(emptyList()) }
    var tasks by remember { mutableStateOf<List<TaskEntity>>(emptyList()) }

    // Đồng hồ đếm giây thời gian thực
    LaunchedEffect(Unit) {
        val db = SmartTeacherDatabase.getInstance(context)
        val todayStr = LocalDate.now().toString()
        todayEvents = db.calendarEventDao().getEventsForDateList(todayStr).sortedBy { it.startTime }
        tasks = db.taskDao().getIncompleteTasksList()

        while (isActive) {
            currentTime = LocalTime.now()
            val now = LocalDate.now()
            if (now != currentDate) {
                currentDate = now
                todayEvents = db.calendarEventDao().getEventsForDateList(now.toString()).sortedBy { it.startTime }
            }
            delay(1000L)
        }
    }

    // Tìm ca dạy hiện tại hoặc tiếp theo
    val currentOrNextEvent = remember(todayEvents, currentTime) {
        todayEvents.firstOrNull {
            runCatching { LocalTime.parse(it.endTime).isAfter(currentTime) }.getOrDefault(false)
        }
    }

    val dayOfWeekVi = when (currentDate.dayOfWeek) {
        DayOfWeek.MONDAY -> "Thứ Hai"
        DayOfWeek.TUESDAY -> "Thứ Ba"
        DayOfWeek.WEDNESDAY -> "Thứ Tư"
        DayOfWeek.THURSDAY -> "Thứ Năm"
        DayOfWeek.FRIDAY -> "Thứ Sáu"
        DayOfWeek.SATURDAY -> "Thứ Bảy"
        DayOfWeek.SUNDAY -> "Chủ Nhật"
    }
    val dateVi = "$dayOfWeekVi, ngày ${currentDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))}"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF070913),
                        Color(0xFF0F172A),
                        Color(0xFF05070E)
                    )
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header Top Bar: Badge Màn hình khóa, Giữ màn hình sáng toggle, Đóng
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFF1E1B4B))
                        .border(1.dp, Color(0xFF6366F1).copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Icon(
                        Icons.Default.LockClock,
                        contentDescription = null,
                        tint = Color(0xFFA5B4FC),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        "ĐỒNG HỒ MÀN HÌNH KHÓA",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFA5B4FC),
                        letterSpacing = 1.sp
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            keepScreenOn = !keepScreenOn
                            onToggleKeepScreenOn(keepScreenOn)
                        }
                    ) {
                        Icon(
                            if (keepScreenOn) Icons.Default.LightMode else Icons.Default.DarkMode,
                            contentDescription = "Giữ sáng màn hình",
                            tint = if (keepScreenOn) Color(0xFFFBBF24) else Color(0xFF94A3B8),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    IconButton(onClick = onClose) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Đóng",
                            tint = Color.White.copy(alpha = 0.8f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // GIỜ TO RÕ NHƯ ĐỒNG HỒ BỤC GIẢNG
            Text(
                text = currentTime.format(DateTimeFormatter.ofPattern("HH:mm:ss")),
                fontSize = 58.sp,
                fontWeight = FontWeight.ExtraBold,
                fontFamily = FontFamily.Monospace,
                color = Color.White,
                textAlign = TextAlign.Center,
                letterSpacing = 2.sp
            )

            // NGÀY THÁNG TIẾNG VIỆT
            Text(
                text = dateVi,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF94A3B8),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(20.dp))

            // THẺ LỊCH DẠY NỔI BẬT NHẤT (HERO CARD)
            if (currentOrNextEvent != null) {
                val start = runCatching { LocalTime.parse(currentOrNextEvent.startTime) }.getOrNull()
                val end = runCatching { LocalTime.parse(currentOrNextEvent.endTime) }.getOrNull()

                val isOngoing = start != null && end != null && !currentTime.isBefore(start) && currentTime.isBefore(end)
                val remainingMins = if (start != null && currentTime.isBefore(start)) {
                    ChronoUnit.MINUTES.between(currentTime, start)
                } else 0L

                val badgeText = if (isOngoing) "🔴 ĐANG LÊN LỚP (Tan lúc ${currentOrNextEvent.endTime})"
                else if (remainingMins >= 60) "⏳ Còn ${remainingMins / 60}h ${remainingMins % 60}p vào lớp"
                else if (remainingMins > 0) "⏳ Còn $remainingMins phút vào lớp"
                else "⏳ Sắp bắt đầu"

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .border(
                            1.5.dp,
                            if (isOngoing) Color(0xFFEF4444) else Color(0xFF6366F1),
                            RoundedCornerShape(20.dp)
                        ),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF131726)
                    )
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "TIẾT GIẢNG DẠY",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFA5B4FC),
                                letterSpacing = 1.sp
                            )
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isOngoing) Color(0xFFEF4444).copy(alpha = 0.2f) else Color(0xFFFBBF24).copy(alpha = 0.2f),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isOngoing) Color(0xFFEF4444).copy(alpha = 0.5f) else Color(0xFFFBBF24).copy(alpha = 0.5f)
                                )
                            ) {
                                Text(
                                    text = badgeText,
                                    color = if (isOngoing) Color(0xFFF87171) else Color(0xFFFBBF24),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = currentOrNextEvent.title,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.AccessTime, contentDescription = null, tint = Color(0xFF818CF8), modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    "${currentOrNextEvent.startTime} - ${currentOrNextEvent.endTime}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFFE2E8F0)
                                )
                            }

                            if (currentOrNextEvent.room.isNotBlank()) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.MeetingRoom, contentDescription = null, tint = Color(0xFF34D399), modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        "Phòng: ${currentOrNextEvent.room}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color(0xFF34D399)
                                    )
                                }
                            }
                        }

                        if (currentOrNextEvent.className.isNotBlank()) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.School, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    "Lớp: ${currentOrNextEvent.className}",
                                    fontSize = 12.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                        }
                    }
                }
            } else {
                // Không còn lịch hôm nay
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .border(1.dp, Color(0xFF10B981).copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF062319))
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Đã Hoàn Thành Giờ Giảng Hôm Nay",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Color.White
                        )
                        Text(
                            "Thầy/Cô không còn tiết dạy nào còn lại trong ngày hôm nay.",
                            fontSize = 12.sp,
                            color = Color(0xFFA7F3D0),
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // DANH SÁCH CÁC TIẾT KHÁC VÀ NHIỆM VỤ
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (todayEvents.size > 1) {
                    item {
                        Text(
                            "TẤT CẢ CA DẠY HÔM NAY (${todayEvents.size} CA)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF94A3B8),
                            letterSpacing = 1.sp
                        )
                    }
                    items(todayEvents) { ev ->
                        val isCurrent = ev.id == currentOrNextEvent?.id
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isCurrent) Color(0xFF1E293B) else Color(0xFF0F172A))
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    ev.title,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp,
                                    color = if (isCurrent) Color(0xFF818CF8) else Color.White
                                )
                                Text(
                                    "P.${ev.room} • Lớp ${ev.className}",
                                    fontSize = 11.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                            Text(
                                "${ev.startTime} - ${ev.endTime}",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFCBD5E1)
                            )
                        }
                    }
                }

                if (tasks.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "VIỆC CẦN LÀM (${tasks.size} VIỆC)",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF94A3B8),
                            letterSpacing = 1.sp
                        )
                    }
                    items(tasks.take(3)) { t ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFF0F172A))
                                .padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.TaskAlt, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(t.title, fontSize = 12.sp, color = Color(0xFFE2E8F0))
                        }
                    }
                }
            }

            // FOOTER NÚT HÀNH ĐỘNG
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onClose,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White)
                ) {
                    Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Khóa Máy", fontSize = 13.sp)
                }

                Button(
                    onClick = onOpenApp,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1))
                ) {
                    Icon(Icons.Default.CalendarMonth, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Mở Lịch Trình", fontSize = 13.sp, color = Color.White)
                }
            }
        }
    }
}
