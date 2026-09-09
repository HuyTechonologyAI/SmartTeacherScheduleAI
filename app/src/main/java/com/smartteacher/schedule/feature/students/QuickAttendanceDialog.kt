package com.smartteacher.schedule.feature.students

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.AttendanceRecordEntity
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.StudentEntity
import com.smartteacher.schedule.core.sync.CloudSyncManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun QuickAttendanceDialog(
    event: CalendarEventEntity,
    onDismiss: () -> Unit,
    onOpenStudentManagement: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val db = remember { SmartTeacherDatabase.getInstance(context) }

    var students by remember { mutableStateOf<List<StudentEntity>>(emptyList()) }
    var attendanceMap by remember { mutableStateOf<Map<String, AttendanceRecordEntity>>(emptyMap()) }
    var isLoading by remember { mutableStateOf(true) }

    // Load students and existing attendance records
    LaunchedEffect(event.className, event.date) {
        withContext(Dispatchers.IO) {
            var loadedStudents = db.studentDao().getStudentsByClass(event.className)
            if (loadedStudents.isEmpty()) {
                val cleanName = event.className.replace("Lớp", "", ignoreCase = true).replace("Lop", "", ignoreCase = true).trim()
                if (cleanName.isNotBlank()) {
                    loadedStudents = db.studentDao().getStudentsByClass(cleanName)
                }
            }
            if (loadedStudents.isEmpty()) {
                val allStudents = db.studentDao().getAllStudents()
                loadedStudents = allStudents.filter {
                    it.className.contains(event.className, ignoreCase = true) ||
                    event.className.contains(it.className, ignoreCase = true)
                }
            }
            val existing = db.attendanceDao().getAttendanceForSession(
                date = event.date,
                className = event.className,
                eventId = event.id.toString()
            )
            val map = mutableMapOf<String, AttendanceRecordEntity>()
            loadedStudents.forEach { st ->
                val found = existing.find { it.studentId == st.id }
                if (found != null) {
                    map[st.id] = found
                } else {
                    map[st.id] = AttendanceRecordEntity(
                        id = "att_${System.currentTimeMillis()}_${st.id}",
                        date = event.date,
                        eventId = event.id.toString(),
                        scheduleId = event.teachingScheduleId?.toString() ?: "",
                        studentId = st.id,
                        className = event.className,
                        status = "PRESENT",
                        kudosDelta = 0,
                        note = ""
                    )
                }
            }
            withContext(Dispatchers.Main) {
                students = loadedStudents
                attendanceMap = map
                isLoading = false
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.88f),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Color(0xFF10B981).copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = "📋 ĐIỂM DANH 1-CHẠM",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color(0xFF059669),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Text(
                                text = "${event.startTime} - ${event.endTime}",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                        Text(
                            text = "${event.title} - Lớp ${event.className}",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                        Text(
                            text = "Phòng ${event.room} • Ngày ${event.date}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Đóng")
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Stats Summary
                val recs = attendanceMap.values
                val presentCount = recs.count { it.status == "PRESENT" }
                val excusedCount = recs.count { it.status == "ABSENT_EXCUSED" }
                val unexcusedCount = recs.count { it.status == "ABSENT_UNEXCUSED" }
                val lateCount = recs.count { it.status == "LATE" }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    StatusBox(title = "Có mặt", count = "$presentCount/${students.size}", color = Color(0xFF10B981), modifier = Modifier.weight(1f))
                    StatusBox(title = "Vắng CP", count = "$excusedCount", color = Color(0xFFF59E0B), modifier = Modifier.weight(1f))
                    StatusBox(title = "Vắng KP", count = "$unexcusedCount", color = Color(0xFFEF4444), modifier = Modifier.weight(1f))
                    StatusBox(title = "Đi trễ", count = "$lateCount", color = Color(0xFFF97316), modifier = Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Student list
                if (isLoading) {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(modifier = Modifier.size(36.dp))
                    }
                } else if (students.isEmpty()) {
                    Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = "Lớp ${event.className} chưa có danh sách học sinh.",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Thầy/Cô có thể mở Sổ quản lý để nhập file Excel/Word hoặc tạo nhanh danh sách mẫu:",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = {
                                        onDismiss()
                                        onOpenStudentManagement()
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                                ) {
                                    Icon(Icons.Default.GroupAdd, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Quản lý học sinh")
                                }
                                OutlinedButton(
                                    onClick = {
                                        coroutineScope.launch(Dispatchers.IO) {
                                            val sampleNames = listOf(
                                                "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Cường", "Phạm Thị Dung",
                                                "Hoàng Văn Em", "Đỗ Thị Gấm", "Vũ Hải Đăng", "Bùi Thu Hà",
                                                "Đặng Quốc Huy", "Ngô Mai Khôi", "Dương Minh Long", "Lý Thị Mai",
                                                "Mai Trọng Nam", "Hồ Bích Ngọc", "Phan Thanh Phong"
                                            )
                                            val created = sampleNames.mapIndexed { idx, name ->
                                                StudentEntity(
                                                    id = "std_${System.currentTimeMillis()}_$idx",
                                                    classId = event.className,
                                                    className = event.className,
                                                    studentCode = "${event.className}_${String.format("%02d", idx + 1)}",
                                                    fullName = name,
                                                    gender = if (name.contains("Thị") || name.contains("Bích") || name.contains("Mai") || name.contains("Ngọc")) "Nữ" else "Nam",
                                                    parentPhone = "09000000${String.format("%02d", idx + 1)}",
                                                    parentName = "Phụ huynh $name",
                                                    kudosPoints = 10,
                                                    notes = ""
                                                )
                                            }
                                            db.studentDao().insertStudents(created)
                                            val map = mutableMapOf<String, AttendanceRecordEntity>()
                                            created.forEach { st ->
                                                map[st.id] = AttendanceRecordEntity(
                                                    id = "att_${System.currentTimeMillis()}_${st.id}",
                                                    date = event.date,
                                                    eventId = event.id.toString(),
                                                    scheduleId = event.teachingScheduleId?.toString() ?: "",
                                                    studentId = st.id,
                                                    className = event.className,
                                                    status = "PRESENT",
                                                    kudosDelta = 0,
                                                    note = ""
                                                )
                                            }
                                            withContext(Dispatchers.Main) {
                                                students = created
                                                attendanceMap = map
                                                Toast.makeText(context, "Đã tạo 15 học sinh mẫu cho lớp ${event.className}!", Toast.LENGTH_SHORT).show()
                                            }
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Tạo mẫu nhanh")
                                }
                            }
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(students, key = { it.id }) { student ->
                            val record = attendanceMap[student.id] ?: AttendanceRecordEntity(
                                id = "temp",
                                date = event.date,
                                studentId = student.id,
                                className = event.className,
                                status = "PRESENT"
                            )

                            StudentAttendanceRow(
                                student = student,
                                record = record,
                                onCycleStatus = {
                                    val nextStatus = when (record.status) {
                                        "PRESENT" -> "ABSENT_EXCUSED"
                                        "ABSENT_EXCUSED" -> "ABSENT_UNEXCUSED"
                                        "ABSENT_UNEXCUSED" -> "LATE"
                                        else -> "PRESENT"
                                    }
                                    attendanceMap = attendanceMap + (student.id to record.copy(
                                        status = nextStatus,
                                        updatedAt = System.currentTimeMillis()
                                    ))
                                },
                                onAddKudos = { points, reason ->
                                    attendanceMap = attendanceMap + (student.id to record.copy(
                                        kudosDelta = record.kudosDelta + points,
                                        note = reason,
                                        updatedAt = System.currentTimeMillis()
                                    ))
                                    coroutineScope.launch(Dispatchers.IO) {
                                        db.studentDao().updateKudosPoints(student.id, points)
                                    }
                                    Toast.makeText(context, "+${points}đ cho ${student.fullName}", Toast.LENGTH_SHORT).show()
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Bottom Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = {
                            val map = mutableMapOf<String, AttendanceRecordEntity>()
                            attendanceMap.forEach { (sId, rec) ->
                                map[sId] = rec.copy(status = "PRESENT", updatedAt = System.currentTimeMillis())
                            }
                            attendanceMap = map
                        },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(text = "Tất cả có mặt", fontSize = 12.sp)
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        IconButton(
                            onClick = {
                                val msg = StringBuilder().apply {
                                    append("📢 [ĐIỂM DANH] Lớp: ${event.className}\n")
                                    append("📅 Tiết: ${event.title} (${event.startTime}-${event.endTime}, ${event.date})\n")
                                    append("👥 Có mặt: ${presentCount}/${students.size}\n")
                                    if (excusedCount > 0) {
                                        val names = students.filter { attendanceMap[it.id]?.status == "ABSENT_EXCUSED" }.joinToString(", ") { it.fullName }
                                        append("🟡 Vắng có phép ($excusedCount): $names\n")
                                    }
                                    if (unexcusedCount > 0) {
                                        val names = students.filter { attendanceMap[it.id]?.status == "ABSENT_UNEXCUSED" }.joinToString(", ") { it.fullName }
                                        append("🔴 Vắng không phép ($unexcusedCount): $names\n")
                                    }
                                    if (lateCount > 0) {
                                        val names = students.filter { attendanceMap[it.id]?.status == "LATE" }.joinToString(", ") { it.fullName }
                                        append("🟠 Đi trễ ($lateCount): $names\n")
                                    }
                                    append("✨ Smart Teacher Schedule AI")
                                }.toString()

                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("Báo cáo điểm danh", msg)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "Đã sao chép báo cáo Zalo!", Toast.LENGTH_SHORT).show()
                            }
                        ) {
                            Icon(imageVector = Icons.Default.Share, contentDescription = "Chia sẻ Zalo", tint = Color(0xFF0068FF))
                        }

                        Button(
                            onClick = {
                                coroutineScope.launch(Dispatchers.IO) {
                                    db.attendanceDao().insertRecords(attendanceMap.values.toList())
                                    // Trigger cloud sync in background
                                    CloudSyncManager.pushToCloud(context)
                                    withContext(Dispatchers.Main) {
                                        Toast.makeText(context, "Đã lưu & đồng bộ điểm danh!", Toast.LENGTH_SHORT).show()
                                        onDismiss()
                                    }
                                }
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Lưu điểm danh", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StatusBox(title: String, count: String, color: Color, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        color = color.copy(alpha = 0.12f),
        border = androidx.compose.foundation.BorderStroke(1.dp, color.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = title, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = color)
            Text(text = count, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = color)
        }
    }
}

@Composable
private fun StudentAttendanceRow(
    student: StudentEntity,
    record: AttendanceRecordEntity,
    onCycleStatus: () -> Unit,
    onAddKudos: (Int, String) -> Unit
) {
    val statusColor = when (record.status) {
        "PRESENT" -> Color(0xFF10B981)
        "ABSENT_EXCUSED" -> Color(0xFFF59E0B)
        "ABSENT_UNEXCUSED" -> Color(0xFFEF4444)
        else -> Color(0xFFF97316)
    }

    val statusText = when (record.status) {
        "PRESENT" -> "Có mặt"
        "ABSENT_EXCUSED" -> "Vắng (CP)"
        "ABSENT_UNEXCUSED" -> "Vắng (KP)"
        else -> "Đi trễ"
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .border(1.dp, statusColor.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
            .clickable(onClick = onCycleStatus),
        color = statusColor.copy(alpha = 0.08f),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier.padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(statusColor.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = student.fullName.takeLast(1),
                        fontWeight = FontWeight.Bold,
                        color = statusColor,
                        fontSize = 13.sp
                    )
                }

                Column {
                    Text(
                        text = student.fullName,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = student.studentCode,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // Mini Kudos
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFF0066FF).copy(alpha = 0.15f),
                    modifier = Modifier.clickable { onAddKudos(1, "Phát biểu tích cực") }
                ) {
                    Text(
                        text = "+1đ",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0066FF),
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                    )
                }

                // Status Badge
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = statusColor
                ) {
                    Text(
                        text = statusText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}
