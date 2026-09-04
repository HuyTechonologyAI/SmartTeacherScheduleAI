package com.smartteacher.schedule.feature.schedule

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.model.RecurrenceType
import com.smartteacher.schedule.core.util.ScheduleConflictChecker
import com.smartteacher.schedule.core.util.TeachingPeriodPresets
import com.smartteacher.schedule.feature.schedule.components.LessonAttachmentSection
import java.time.LocalDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTeachingScheduleScreen(
    onBack: () -> Unit,
    onSave: (TeachingScheduleEntity, List<LessonAttachmentEntity>) -> Unit,
    existingSchedules: List<TeachingScheduleEntity> = emptyList()
) {
    var subject by remember { mutableStateOf("") }
    var className by remember { mutableStateOf("") }
    var classCode by remember { mutableStateOf("") }
    var dayOfWeek by remember { mutableStateOf(1) } // 1 = Monday
    var startTime by remember { mutableStateOf("07:00") }
    var endTime by remember { mutableStateOf("08:30") }
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

    var selectedPresetTab by remember { mutableStateOf(0) } // 0 = Lý thuyết, 1 = Thực hành
    var allowSaveConflict by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var attachments by remember { mutableStateOf<List<LessonAttachmentEntity>>(emptyList()) }

    // Kiểm tra trùng lịch theo thời gian thực
    val conflictResult = remember(dayOfWeek, startTime, endTime, room, existingSchedules) {
        if (startTime.isNotBlank() && endTime.isNotBlank()) {
            ScheduleConflictChecker.checkScheduleConflict(
                dayOfWeek = dayOfWeek,
                startTime = startTime,
                endTime = endTime,
                room = room,
                existingSchedules = existingSchedules
            )
        } else {
            null
        }
    }

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
            // Cảnh báo lỗi xác thực form
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

            // =========================================================================
            // ⚠️ CẢNH BÁO TRÙNG LỊCH THỜI GIAN THỰC
            // =========================================================================
            AnimatedVisibility(visible = conflictResult != null && conflictResult.hasConflict) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.WarningAmber, contentDescription = null, tint = Color(0xFFD97706))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "CẢNH BÁO TRÙNG LỊCH DẠY",
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFB45309),
                                style = MaterialTheme.typography.labelLarge
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = conflictResult?.warningMessage ?: "",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF92400E)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                "Vẫn tiếp tục lưu dù trùng lịch",
                                style = MaterialTheme.typography.labelMedium,
                                color = Color(0xFF78350F)
                            )
                            Switch(
                                checked = allowSaveConflict,
                                onCheckedChange = { allowSaveConflict = it }
                            )
                        }
                    }
                }
            }

            OutlinedTextField(
                value = subject,
                onValueChange = { subject = it },
                label = { Text("Tên môn học / Module *") },
                placeholder = { Text("Ví dụ: Lập trình Phay CNC") },
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
                    placeholder = { Text("CK2026") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            // Day of week selector
            Text("Thứ trong tuần:", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
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
                        label = { Text(name) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                }
            }

            // =========================================================================
            // ⏰ KHUNG GIỜ CỐ ĐỊNH CHỌN NHANH (LÝ THUYẾT 45P & THỰC HÀNH 60P)
            // =========================================================================
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Khung giờ cố định chuẩn",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                        // Tab switcher
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            FilterChip(
                                selected = selectedPresetTab == 0,
                                onClick = {
                                    selectedPresetTab = 0
                                    sessionType = "Lý thuyết"
                                },
                                label = { Text("📘 Lý thuyết (45p/T)") }
                            )
                            FilterChip(
                                selected = selectedPresetTab == 1,
                                onClick = {
                                    selectedPresetTab = 1
                                    sessionType = "Thực hành"
                                },
                                label = { Text("🛠️ Thực hành (60p/T)") }
                            )
                        }
                    }

                    // Danh sách preset khung giờ
                    val presets = if (selectedPresetTab == 0) TeachingPeriodPresets.THEORY_PRESETS else TeachingPeriodPresets.PRACTICAL_PRESETS
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        presets.forEach { preset ->
                            val isChosen = startTime == preset.startTime && endTime == preset.endTime
                            FilterChip(
                                selected = isChosen,
                                onClick = {
                                    startTime = preset.startTime
                                    endTime = preset.endTime
                                    sessionType = preset.type
                                },
                                label = {
                                    Text("${preset.name}: ${preset.startTime}-${preset.endTime}", fontSize = 11.sp, fontWeight = if (isChosen) FontWeight.Bold else FontWeight.Normal)
                                }
                            )
                        }
                    }

                    // Nút cộng dồn thời lượng nhanh
                    Text("Cộng nhanh thời lượng từ giờ bắt đầu ($startTime):", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf(
                            "+45p (1 tiết LT)" to 45,
                            "+90p (2 tiết LT)" to 90,
                            "+135p (3 tiết LT)" to 135,
                            "+60p (1 tiết TH)" to 60,
                            "+120p (2 tiết TH)" to 120,
                            "+240p (Ca 4 tiếng)" to 240
                        ).forEach { (label, minutes) ->
                            AssistChip(
                                onClick = {
                                    endTime = TeachingPeriodPresets.calculateEndTime(startTime, minutes)
                                },
                                label = { Text(label, fontSize = 11.sp) }
                            )
                        }
                    }
                }
            }

            // Time Range Inputs
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = startTime,
                    onValueChange = { startTime = it },
                    label = { Text("Giờ bắt đầu *") },
                    placeholder = { Text("07:00") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = endTime,
                    onValueChange = { endTime = it },
                    label = { Text("Giờ kết thúc *") },
                    placeholder = { Text("08:30") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            // Location & Room
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = room,
                    onValueChange = { room = it },
                    label = { Text("Phòng học / Xưởng *") },
                    placeholder = { Text("Xưởng CNC A1") },
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
                        Text("Nhắc trước 60 phút (Chuẩn bị giáo án)")
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
                        Text("Nhắc trước 15 phút (Di chuyển vào lớp)")
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
                label = { Text("Ghi chú / Bài giảng") },
                placeholder = { Text("Chuẩn bị phôi nhôm 50x50, dao phay ngón phi 10...") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Phần Đính Kèm Giáo Án & Tài Liệu Trực Tiếp
            LessonAttachmentSection(
                attachments = attachments,
                onAddAttachments = { newItems ->
                    attachments = attachments + newItems
                },
                onRemoveAttachment = { itemToRemove ->
                    attachments = attachments - itemToRemove
                }
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

                    // Chặn nếu có trùng lịch và giáo viên chưa bật switch cho phép
                    if (conflictResult != null && conflictResult.hasConflict && !allowSaveConflict) {
                        errorMessage = "Lịch dạy đang trùng với môn khác! Vui lòng điều chỉnh giờ hoặc bật công tắc 'Vẫn tiếp tục lưu dù trùng lịch'."
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
                    onSave(schedule, attachments)
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
