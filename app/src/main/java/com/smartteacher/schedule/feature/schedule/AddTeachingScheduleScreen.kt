package com.smartteacher.schedule.feature.schedule

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.model.RecurrenceType
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTeachingScheduleScreen(
    onBack: () -> Unit,
    onSave: (TeachingScheduleEntity) -> Unit
) {
    var subject by remember { mutableStateOf("") }
    var className by remember { mutableStateOf("") }
    var classCode by remember { mutableStateOf("") }
    var dayOfWeek by remember { mutableStateOf(1) } // 1 = Monday
    var startTime by remember { mutableStateOf("08:00") }
    var endTime by remember { mutableStateOf("10:00") }
    var room by remember { mutableStateOf("") }
    var campus by remember { mutableStateOf("Cơ sở chính") }
    var sessionType by remember { mutableStateOf("Lý thuyết") }
    var instructor by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var recurrenceType by remember { mutableStateOf(RecurrenceType.WEEKLY) }

    var reminder1Minutes by remember { mutableStateOf(60) }
    var reminder2Minutes by remember { mutableStateOf(15) }
    var reminder1Enabled by remember { mutableStateOf(true) }
    var reminder2Enabled by remember { mutableStateOf(true) }

    var errorMessage by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Thêm lịch dạy", fontWeight = FontWeight.Bold) },
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
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            if (errorMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFDC2626))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(errorMessage ?: "", color = Color(0xFF991B1B))
                    }
                }
            }

            OutlinedTextField(
                value = subject,
                onValueChange = { subject = it },
                label = { Text("Tên môn học / Module *") },
                placeholder = { Text("Ví dụ: Module CAD/CAM") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = className,
                    onValueChange = { className = it },
                    label = { Text("Tên lớp *") },
                    placeholder = { Text("CĐCK01") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = classCode,
                    onValueChange = { classCode = it },
                    label = { Text("Mã lớp") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            // Day of week selector
            Text("Thứ trong tuần:", style = MaterialTheme.typography.labelMedium)
            val dayNames = listOf("T2", "T3", "T4", "T5", "T6", "T7", "CN")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                dayNames.forEachIndexed { index, name ->
                    val dayNum = index + 1
                    val isSelected = dayOfWeek == dayNum
                    FilterChip(
                        selected = isSelected,
                        onClick = { dayOfWeek = dayNum },
                        label = { Text(name) }
                    )
                }
            }

            // Time Range
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = startTime,
                    onValueChange = { startTime = it },
                    label = { Text("Giờ bắt đầu *") },
                    placeholder = { Text("08:00") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = endTime,
                    onValueChange = { endTime = it },
                    label = { Text("Giờ kết thúc *") },
                    placeholder = { Text("10:00") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            // Location & Room
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = room,
                    onValueChange = { room = it },
                    label = { Text("Phòng học *") },
                    placeholder = { Text("C202") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = campus,
                    onValueChange = { campus = it },
                    label = { Text("Cơ sở") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            // Session type & Instructor
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = sessionType,
                    onValueChange = { sessionType = it },
                    label = { Text("Loại buổi học") },
                    placeholder = { Text("Lý thuyết / Thực hành") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = instructor,
                    onValueChange = { instructor = it },
                    label = { Text("Giảng viên") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            // Recurrence selection
            Text("Quy luật lặp:", style = MaterialTheme.typography.labelMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = recurrenceType == RecurrenceType.WEEKLY,
                    onClick = { recurrenceType = RecurrenceType.WEEKLY },
                    label = { Text("Hàng tuần") }
                )
                FilterChip(
                    selected = recurrenceType == RecurrenceType.ONCE,
                    onClick = { recurrenceType = RecurrenceType.ONCE },
                    label = { Text("Một lần") }
                )
                FilterChip(
                    selected = recurrenceType == RecurrenceType.DAILY,
                    onClick = { recurrenceType = RecurrenceType.DAILY },
                    label = { Text("Hàng ngày") }
                )
            }

            // Reminders Configuration Section
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Hệ thống tự động nhắc lịch (Dual Reminders)",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Nhắc trước $reminder1Minutes phút")
                        Switch(
                            checked = reminder1Enabled,
                            onCheckedChange = { reminder1Enabled = it }
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Nhắc trước $reminder2Minutes phút")
                        Switch(
                            checked = reminder2Enabled,
                            onCheckedChange = { reminder2Enabled = it }
                        )
                    }
                }
            }

            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Ghi chú / Chuẩn bị dụng cụ") },
                placeholder = { Text("Ví dụ: Mang chìa khóa xưởng, kiểm tra máy tính...") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2
            )

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = {
                    if (subject.isBlank()) {
                        errorMessage = "Vui lòng nhập tên môn học/module."
                        return@Button
                    }
                    if (className.isBlank()) {
                        errorMessage = "Vui lòng nhập tên lớp."
                        return@Button
                    }
                    if (room.isBlank()) {
                        errorMessage = "Vui lòng nhập phòng học."
                        return@Button
                    }

                    val schedule = TeachingScheduleEntity(
                        subject = subject.trim(),
                        className = className.trim(),
                        classCode = classCode.trim(),
                        dayOfWeek = dayOfWeek,
                        recurrenceType = recurrenceType,
                        startDate = LocalDate.now().toString(),
                        startTime = startTime.trim(),
                        endTime = endTime.trim(),
                        room = room.trim(),
                        campus = campus.trim(),
                        sessionType = sessionType.trim(),
                        instructor = instructor.trim(),
                        notes = notes.trim(),
                        reminder1Minutes = reminder1Minutes,
                        reminder2Minutes = reminder2Minutes,
                        reminder1Enabled = reminder1Enabled,
                        reminder2Enabled = reminder2Enabled
                    )
                    onSave(schedule)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                Text("Lưu lịch dạy", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
        }
    }
}
