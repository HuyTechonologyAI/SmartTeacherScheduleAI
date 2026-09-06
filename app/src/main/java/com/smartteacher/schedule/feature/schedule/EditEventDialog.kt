package com.smartteacher.schedule.feature.schedule

import android.app.DatePickerDialog
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.util.ScheduleConflictChecker
import com.smartteacher.schedule.core.util.TeachingPeriodPresets
import com.smartteacher.schedule.feature.schedule.components.LessonAttachmentSection
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import androidx.compose.foundation.BorderStroke
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditEventDialog(
    event: CalendarEventEntity,
    onDismiss: () -> Unit,
    onSave: (
        updatedEvent: CalendarEventEntity,
        syncSubsequent: Boolean,
        updateWholeSchedule: Boolean,
        newStartDate: String,
        newEndDate: String
    ) -> Unit,
    onDelete: (CalendarEventEntity) -> Unit,
    existingEvents: List<CalendarEventEntity> = emptyList()
) {
    var title by remember { mutableStateOf(event.title) }
    var className by remember { mutableStateOf(event.className) }
    var room by remember { mutableStateOf(event.room) }
    var date by remember { mutableStateOf(event.date) }
    var startTime by remember { mutableStateOf(event.startTime) }
    var endTime by remember { mutableStateOf(event.endTime) }
    var notes by remember { mutableStateOf(event.notes) }
    var reminder1Enabled by remember { mutableStateOf(event.reminder1Enabled) }
    var reminder2Enabled by remember { mutableStateOf(event.reminder2Enabled) }

    // Hình thức giảng dạy: Lý thuyết vs Thực hành (v1.3.4)
    var sessionType by remember {
        mutableStateOf(
            if (event.sessionType.isNotBlank() && event.sessionType != "Lý thuyết") {
                event.sessionType
            } else if (event.title.contains("thực hành", ignoreCase = true) ||
                event.notes.contains("thực hành", ignoreCase = true) ||
                event.room.contains("xưởng", ignoreCase = true)
            ) {
                "Thực hành"
            } else {
                "Lý thuyết"
            }
        )
    }
    var selectedPresetTab by remember { mutableStateOf(if (sessionType == "Thực hành") 1 else 0) }

    // Đồng bộ các lịch cùng loại phía sau chưa diễn ra (v1.3.5)
    var syncSubsequentEvents by remember { mutableStateOf(true) }
    var subsequentCount by remember { mutableStateOf(0) }
    var subsequentNextDate by remember { mutableStateOf("") }
    var subsequentEndDate by remember { mutableStateOf("") }

    // Tiến độ học kỳ: Ngày bắt đầu & Ngày kết thúc (v1.3.4)
    var startDate by remember { mutableStateOf(event.date) }
    var endDate by remember { mutableStateOf("") }
    var applyToWholeSchedule by remember { mutableStateOf(event.teachingScheduleId != null) }
    var parentSchedule by remember { mutableStateOf<TeachingScheduleEntity?>(null) }

    var allowSaveConflict by remember { mutableStateOf(false) }
    var showDeleteConfirm by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val db = remember { SmartTeacherDatabase.getInstance(context) }

    // Tự động quét và đếm số buổi học cùng môn/lớp tiếp theo chưa diễn ra (v1.3.5)
    LaunchedEffect(event.id, event.date) {
        withContext(Dispatchers.IO) {
            try {
                val todayStr = LocalDate.now().toString()
                val curTimeStr = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
                val allEvents = db.calendarEventDao().getAllEventsSync()
                val matching = allEvents.filter { other ->
                    other.id != event.id &&
                    ((event.teachingScheduleId != null && other.teachingScheduleId == event.teachingScheduleId) ||
                     (other.subject.equals(event.subject, ignoreCase = true) && other.className.equals(event.className, ignoreCase = true))) &&
                    (other.date > event.date || (other.date == event.date && other.startTime >= event.startTime)) &&
                    (other.date > todayStr || (other.date == todayStr && (curTimeStr.isBlank() || other.endTime >= curTimeStr)))
                }.sortedBy { it.date }

                subsequentCount = matching.size
                if (matching.isNotEmpty()) {
                    subsequentNextDate = matching.first().date
                    subsequentEndDate = matching.last().date
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    // Tự động tải thông tin TeachingScheduleEntity gốc nếu sự kiện liên kết với thời khóa biểu
    LaunchedEffect(event.teachingScheduleId) {
        if (event.teachingScheduleId != null) {
            withContext(Dispatchers.IO) {
                val sched = db.teachingScheduleDao().getScheduleById(event.teachingScheduleId)
                if (sched != null) {
                    parentSchedule = sched
                    startDate = sched.startDate
                    endDate = sched.endDate ?: ""
                    if (sessionType == "Lý thuyết" && sched.sessionType == "Thực hành") {
                        sessionType = "Thực hành"
                        selectedPresetTab = 1
                    }
                }
            }
        }
    }

    // DatePicker Dialogs cho Ngày bắt đầu & Ngày kết thúc
    val startDatePickerDialog = remember(startDate) {
        val parsed = try { LocalDate.parse(startDate) } catch (e: Exception) { LocalDate.now() }
        DatePickerDialog(
            context,
            { _, year, month, dayOfMonth ->
                val picked = LocalDate.of(year, month + 1, dayOfMonth)
                startDate = picked.toString()
                if (event.teachingScheduleId == null) {
                    date = picked.toString()
                }
            },
            parsed.year,
            parsed.monthValue - 1,
            parsed.dayOfMonth
        )
    }

    val endDatePickerDialog = remember(endDate, startDate) {
        val parsed = try {
            if (endDate.isNotBlank()) LocalDate.parse(endDate) else LocalDate.parse(startDate).plusMonths(5)
        } catch (e: Exception) {
            LocalDate.now().plusMonths(5)
        }
        DatePickerDialog(
            context,
            { _, year, month, dayOfMonth ->
                val picked = LocalDate.of(year, month + 1, dayOfMonth)
                val startLocal = try { LocalDate.parse(startDate) } catch (e: Exception) { null }
                if (startLocal != null && picked.isBefore(startLocal)) {
                    errorMessage = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!"
                } else {
                    endDate = picked.toString()
                    errorMessage = null
                }
            },
            parsed.year,
            parsed.monthValue - 1,
            parsed.dayOfMonth
        )
    }
    val attachments by db.lessonAttachmentDao().getAttachmentsForEvent(event.id).collectAsState(initial = emptyList())

    // Kiểm tra trùng lịch
    val conflictResult = remember(date, startTime, endTime, room, existingEvents) {
        if (date.isNotBlank() && startTime.isNotBlank() && endTime.isNotBlank()) {
            ScheduleConflictChecker.checkEventConflict(
                targetDate = date,
                startTime = startTime,
                endTime = endTime,
                room = room,
                existingEvents = existingEvents,
                excludeEventId = event.id
            )
        } else {
            null
        }
    }

    // Định dạng thứ ngày tiếng Việt
    val formattedDateDisplay = remember(date) {
        try {
            val localDate = LocalDate.parse(date)
            val formatter = DateTimeFormatter.ofPattern("EEEE, dd/MM/yyyy", Locale("vi", "VN"))
            localDate.format(formatter).replaceFirstChar { it.uppercase() }
        } catch (e: Exception) {
            date
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("Xác nhận xóa lịch dạy", fontWeight = FontWeight.Bold) },
            text = {
                Text("Thầy/Cô có chắc chắn muốn xóa tiết dạy '${event.title}' không? Các chuông báo thức liên quan sẽ được tự động hủy.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteConfirm = false
                        onDelete(event)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Xóa lịch", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("Hủy")
                }
            }
        )
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f, fill = false),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.EditCalendar,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "Chỉnh sửa / Đổi lịch dạy",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                    IconButton(
                        onClick = { showDeleteConfirm = true },
                        colors = IconButtonDefaults.iconButtonColors(contentColor = MaterialTheme.colorScheme.error)
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Xóa lịch")
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                // Scrollable Form
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // =========================================================================
                    // ⚠️ CẢNH BÁO TRÙNG LỊCH KHI ĐỔI NGÀY / GIỜ
                    // =========================================================================
                    AnimatedVisibility(visible = conflictResult != null && conflictResult.hasConflict) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.WarningAmber, contentDescription = null, tint = Color(0xFFD97706))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        "CẢNH BÁO TRÙNG LỊCH DẠY!",
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFB45309),
                                        style = MaterialTheme.typography.labelLarge
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = conflictResult?.warningMessage ?: "",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFF92400E)
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        "Vẫn lưu dù trùng lịch",
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

                    if (errorMessage != null) {
                        Text(
                            text = errorMessage ?: "",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Tên môn học / Tiết dạy *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = className,
                            onValueChange = { className = it },
                            label = { Text("Lớp học *") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = room,
                            onValueChange = { room = it },
                            label = { Text("Phòng học *") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    // =========================================================================
                    // 🔄 TỰ ĐỘNG ĐỒNG BỘ CÁC LỊCH CÙNG LOẠI PHÍA SAU (CHƯA DIỄN RA) (v1.3.5)
                    // =========================================================================
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                        ),
                        shape = RoundedCornerShape(14.dp),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.45f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Icon(
                                            Icons.Default.Sync,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Text(
                                            "Tự động đồng bộ các lịch phía sau",
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        "Tự động cập nhật phòng học, hình thức (LT/TH), giờ dạy... cho tất cả các buổi tiếp theo của môn này chưa diễn ra.",
                                        style = MaterialTheme.typography.bodySmall,
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                                    )
                                }
                                Switch(
                                    checked = syncSubsequentEvents,
                                    onCheckedChange = { syncSubsequentEvents = it }
                                )
                            }

                            if (subsequentCount > 0) {
                                Surface(
                                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.7f),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.AutoAwesome,
                                            contentDescription = null,
                                            tint = Color(0xFF10B981),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Text(
                                            text = if (syncSubsequentEvents) {
                                                "Sẽ tự động cập nhật $subsequentCount buổi dạy tiếp theo (đến ${try { LocalDate.parse(subsequentEndDate).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) } catch (e: Exception) { subsequentEndDate }})"
                                            } else {
                                                "Đã tắt: Chỉ cập nhật riêng lẻ buổi học này"
                                            },
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.SemiBold,
                                            color = if (syncSubsequentEvents) Color(0xFF059669) else Color.Gray
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // =========================================================================
                    // 📅 TIẾN ĐỘ HỌC KỲ (NGÀY BẮT ĐẦU & NGÀY KẾT THÚC)
                    // =========================================================================
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.25f)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Icon(Icons.Default.DateRange, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                                    Text(
                                        "Tiến độ học kỳ & Thời gian áp dụng",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Text(
                                "Cập nhật ngày bắt đầu và kết thúc môn học theo tiến độ điều chỉnh của nhà trường.",
                                style = MaterialTheme.typography.bodySmall,
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Nút chọn Ngày Bắt Đầu
                                OutlinedCard(
                                    onClick = { startDatePickerDialog.show() },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Text("Ngày bắt đầu *", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.height(3.dp))
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = try { LocalDate.parse(startDate).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) } catch (e: Exception) { startDate },
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp
                                            )
                                        }
                                    }
                                }

                                // Nút chọn Ngày Kết Thúc
                                OutlinedCard(
                                    onClick = { endDatePickerDialog.show() },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Column(modifier = Modifier.padding(8.dp)) {
                                        Text("Ngày kết thúc", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                                        Spacer(modifier = Modifier.height(3.dp))
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.EventBusy, contentDescription = null, modifier = Modifier.size(14.dp), tint = if (endDate.isNotBlank()) MaterialTheme.colorScheme.primary else Color.Gray)
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                text = if (endDate.isNotBlank()) {
                                                    try { LocalDate.parse(endDate).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) } catch (e: Exception) { endDate }
                                                } else "Vô thời hạn",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp,
                                                color = if (endDate.isNotBlank()) MaterialTheme.colorScheme.onSurface else Color.Gray
                                            )
                                        }
                                    }
                                }
                            }

                            // Phím tắt chọn nhanh thời lượng học kỳ
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                val startParsed = try { LocalDate.parse(startDate) } catch(e: Exception) { LocalDate.now() }
                                AssistChip(
                                    onClick = { endDate = startParsed.plusWeeks(10).toString() },
                                    label = { Text("+10 tuần", fontSize = 10.sp) }
                                )
                                AssistChip(
                                    onClick = { endDate = startParsed.plusWeeks(15).toString() },
                                    label = { Text("+15 tuần", fontSize = 10.sp) }
                                )
                                AssistChip(
                                    onClick = { endDate = startParsed.plusMonths(5).toString() },
                                    label = { Text("Kỳ 1 (+5 tháng)", fontSize = 10.sp) }
                                )
                                AssistChip(
                                    onClick = { endDate = startParsed.plusMonths(9).toString() },
                                    label = { Text("Cả năm (+9 tháng)", fontSize = 10.sp) }
                                )
                                if (endDate.isNotBlank()) {
                                    AssistChip(
                                        onClick = { endDate = "" },
                                        label = { Text("Xóa kết thúc", fontSize = 10.sp) }
                                    )
                                }
                            }

                            // Tùy chọn cập nhật toàn bộ học kỳ môn này
                            if (event.teachingScheduleId != null) {
                                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            "Cập nhật tiến độ toàn bộ học kỳ",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                        Text(
                                            "Tự động đồng bộ các buổi dạy tương lai theo mốc ngày và hình thức mới.",
                                            style = MaterialTheme.typography.bodySmall,
                                            fontSize = 10.sp,
                                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                                        )
                                    }
                                    Switch(
                                        checked = applyToWholeSchedule,
                                        onCheckedChange = { applyToWholeSchedule = it }
                                    )
                                }
                            }
                        }
                    }

                    // =========================================================================
                    // 📅 ĐỔI NGÀY DẠY TRỰC TIẾP TRÊN LỊCH CŨ (ĐỔI QUA NGÀY KHÁC 1-CHẠM)
                    // =========================================================================
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Đổi ngày dạy buổi này (Dời lịch):", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                                    Text(
                                        text = formattedDateDisplay,
                                        style = MaterialTheme.typography.titleSmall,
                                        color = MaterialTheme.colorScheme.primary,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                                Text(date, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }

                            // Phím tắt đổi ngày nhanh
                            Text("Chuyển nhanh ngày:", style = MaterialTheme.typography.labelSmall)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                val today = LocalDate.now()
                                AssistChip(
                                    onClick = { date = today.toString() },
                                    label = { Text("Hôm nay") },
                                    leadingIcon = { Icon(Icons.Default.Today, contentDescription = null, modifier = Modifier.size(16.dp)) }
                                )
                                AssistChip(
                                    onClick = { date = today.plusDays(1).toString() },
                                    label = { Text("Ngày mai") }
                                )
                                AssistChip(
                                    onClick = {
                                        try {
                                            val cur = LocalDate.parse(date)
                                            date = cur.plusDays(1).toString()
                                        } catch (e: Exception) {}
                                    },
                                    label = { Text("+1 ngày") }
                                )
                                AssistChip(
                                    onClick = {
                                        try {
                                            val cur = LocalDate.parse(date)
                                            date = cur.minusDays(1).toString()
                                        } catch (e: Exception) {}
                                    },
                                    label = { Text("-1 ngày") }
                                )
                                AssistChip(
                                    onClick = {
                                        try {
                                            val cur = LocalDate.parse(date)
                                            date = cur.plusWeeks(1).toString()
                                        } catch (e: Exception) {}
                                    },
                                    label = { Text("Tuần sau (+7 ngày)") }
                                )
                            }

                            // Chuyển theo Thứ trong tuần (T2 đến CN)
                            Text("Hoặc dời sang Thứ:", style = MaterialTheme.typography.labelSmall)
                            val dayNames = listOf(
                                "T2" to DayOfWeek.MONDAY,
                                "T3" to DayOfWeek.TUESDAY,
                                "T4" to DayOfWeek.WEDNESDAY,
                                "T5" to DayOfWeek.THURSDAY,
                                "T6" to DayOfWeek.FRIDAY,
                                "T7" to DayOfWeek.SATURDAY,
                                "CN" to DayOfWeek.SUNDAY
                            )
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                dayNames.forEach { (label, targetDow) ->
                                    val isCurrentDow = try {
                                        LocalDate.parse(date).dayOfWeek == targetDow
                                    } catch (e: Exception) { false }

                                    FilterChip(
                                        selected = isCurrentDow,
                                        onClick = {
                                            try {
                                                val cur = LocalDate.parse(date)
                                                val daysToAdd = (targetDow.value - cur.dayOfWeek.value + 7) % 7
                                                val newDate = if (daysToAdd == 0) cur.plusWeeks(1) else cur.plusDays(daysToAdd.toLong())
                                                date = newDate.toString()
                                            } catch (e: Exception) {}
                                        },
                                        label = { Text(label, fontSize = 11.sp) },
                                        modifier = Modifier.padding(horizontal = 1.dp)
                                    )
                                }
                            }
                        }
                    }

                    // =========================================================================
                    // 🛠️ HÌNH THỨC GIẢNG DẠY (LÝ THUYẾT & THỰC HÀNH) & KHUNG GIỜ CHUẨN
                    // =========================================================================
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Hình thức giảng dạy *", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                FilterChip(
                                    selected = sessionType == "Lý thuyết",
                                    onClick = {
                                        sessionType = "Lý thuyết"
                                        selectedPresetTab = 0
                                    },
                                    label = { Text("📘 Lý thuyết (45p/T)") },
                                    modifier = Modifier.weight(1f)
                                )
                                FilterChip(
                                    selected = sessionType == "Thực hành",
                                    onClick = {
                                        sessionType = "Thực hành"
                                        selectedPresetTab = 1
                                    },
                                    label = { Text("🛠️ Thực hành (60p/T)") },
                                    modifier = Modifier.weight(1f)
                                )
                            }

                            Text("Khung giờ chuẩn đề xuất:", style = MaterialTheme.typography.labelSmall)
                            val presets = if (selectedPresetTab == 0) TeachingPeriodPresets.THEORY_PRESETS else TeachingPeriodPresets.PRACTICAL_PRESETS
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                presets.forEach { preset ->
                                    SuggestionChip(
                                        onClick = {
                                            startTime = preset.startTime
                                            endTime = preset.endTime
                                        },
                                        label = { Text("${preset.name}: ${preset.startTime}-${preset.endTime}", fontSize = 10.sp) }
                                    )
                                }
                            }

                            // Nút cộng dồn thời lượng
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                listOf("+45p" to 45, "+90p" to 90, "+60p" to 60, "+120p" to 120, "+240p" to 240).forEach { (lbl, mins) ->
                                    AssistChip(
                                        onClick = { endTime = TeachingPeriodPresets.calculateEndTime(startTime, mins) },
                                        label = { Text(lbl, fontSize = 10.sp) }
                                    )
                                }
                            }
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = startTime,
                            onValueChange = { startTime = it },
                            label = { Text("Giờ vào lớp (HH:mm) *") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = endTime,
                            onValueChange = { endTime = it },
                            label = { Text("Giờ tan lớp (HH:mm) *") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Ghi chú giảng dạy / Bài giảng") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    // Đính Kèm Giáo Án & Tài Liệu Trực Tiếp
                    LessonAttachmentSection(
                        attachments = attachments,
                        onAddAttachments = { newItems ->
                            coroutineScope.launch(Dispatchers.IO) {
                                val toInsert = newItems.map { it.copy(eventId = event.id, teachingScheduleId = event.teachingScheduleId) }
                                db.lessonAttachmentDao().insertAttachments(toInsert)
                            }
                        },
                        onRemoveAttachment = { item ->
                            coroutineScope.launch(Dispatchers.IO) {
                                db.lessonAttachmentDao().deleteAttachment(item)
                            }
                        }
                    )

                    // Reminders
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Cài đặt nhắc nhở", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Báo thức trước 60 phút", style = MaterialTheme.typography.bodySmall)
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
                                Text("Báo thức trước 15 phút", style = MaterialTheme.typography.bodySmall)
                                Switch(
                                    checked = reminder2Enabled,
                                    onCheckedChange = { reminder2Enabled = it }
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = { showDeleteConfirm = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Xóa lịch", fontWeight = FontWeight.Bold)
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        TextButton(onClick = onDismiss) {
                            Text("Hủy")
                        }
                        Button(
                            onClick = {
                                if (title.isBlank()) {
                                    errorMessage = "Vui lòng nhập tên tiết dạy / môn học."
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

                                // Chặn nếu có trùng lịch và giáo viên chưa xác nhận
                                if (conflictResult != null && conflictResult.hasConflict && !allowSaveConflict) {
                                    errorMessage = "Lịch dạy đang bị trùng! Vui lòng điều chỉnh hoặc bật 'Vẫn lưu dù trùng lịch'."
                                    return@Button
                                }

                                val updated = event.copy(
                                    title = title.trim(),
                                    subject = title.trim(),
                                    className = className.trim(),
                                    room = room.trim(),
                                    date = date.trim(),
                                    startTime = startTime.trim(),
                                    endTime = endTime.trim(),
                                    sessionType = sessionType,
                                    notes = notes.trim(),
                                    reminder1Enabled = reminder1Enabled,
                                    reminder2Enabled = reminder2Enabled,
                                    updatedAt = System.currentTimeMillis()
                                )
                                onSave(updated, syncSubsequentEvents, applyToWholeSchedule, startDate.trim(), endDate.trim())
                            }
                        ) {
                            Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Cập nhật lịch")
                        }
                    }
                }
            }
        }
    }
}
