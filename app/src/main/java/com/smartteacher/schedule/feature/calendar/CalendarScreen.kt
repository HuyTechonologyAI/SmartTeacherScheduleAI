package com.smartteacher.schedule.feature.calendar

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.unit.sp
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.model.EventSource
import com.smartteacher.schedule.core.sync.GoogleCalendarManager
import com.smartteacher.schedule.feature.schedule.EditEventDialog
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalendarScreen(
    events: List<CalendarEventEntity>,
    onEventClick: (CalendarEventEntity) -> Unit,
    onEditEvent: (CalendarEventEntity) -> Unit,
    onDeleteEvent: (CalendarEventEntity) -> Unit
) {
    val context = LocalContext.current
    var viewMode by remember { mutableStateOf(0) } // 0 = Lịch trình tổng thể (Agenda Timeline), 1 = Xem theo ngày
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    var selectedFilter by remember { mutableStateOf("Tất cả") } // "Tất cả", "Tuần này", "Tuần tới", "Lý thuyết", "Thực hành"

    var editingEvent by remember { mutableStateOf<CalendarEventEntity?>(null) }
    var deletingEvent by remember { mutableStateOf<CalendarEventEntity?>(null) }

    if (editingEvent != null) {
        EditEventDialog(
            event = editingEvent!!,
            existingEvents = events,
            onDismiss = { editingEvent = null },
            onSave = { updated ->
                editingEvent = null
                onEditEvent(updated)
            },
            onDelete = { ev ->
                editingEvent = null
                onDeleteEvent(ev)
            }
        )
    }

    if (deletingEvent != null) {
        val ev = deletingEvent!!
        AlertDialog(
            onDismissRequest = { deletingEvent = null },
            title = { Text("Xác nhận xóa lịch dạy", fontWeight = FontWeight.Bold) },
            text = { Text("Thầy/Cô có chắc muốn xóa lịch dạy '${ev.title}' không? Chuông báo thức nhắc giờ sẽ được tự động hủy.") },
            confirmButton = {
                Button(
                    onClick = {
                        deletingEvent = null
                        onDeleteEvent(ev)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Xóa lịch", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { deletingEvent = null }) {
                    Text("Hủy")
                }
            }
        )
    }

    val today = LocalDate.now()
    val startOfThisWeek = today.minusDays((today.dayOfWeek.value - 1).toLong())
    val endOfThisWeek = startOfThisWeek.plusDays(6)
    val startOfNextWeek = endOfThisWeek.plusDays(1)
    val endOfNextWeek = startOfNextWeek.plusDays(6)

    // Lọc sự kiện cho chế độ xem tổng thể (Agenda)
    val agendaEvents = remember(events, selectedFilter) {
        events.filter { event ->
            val eventDate = try { LocalDate.parse(event.date) } catch (e: Exception) { null }
            if (eventDate == null) return@filter false

            when (selectedFilter) {
                "Tuần này" -> !eventDate.isBefore(startOfThisWeek) && !eventDate.isAfter(endOfThisWeek)
                "Tuần tới" -> !eventDate.isBefore(startOfNextWeek) && !eventDate.isAfter(endOfNextWeek)
                "Lý thuyết" -> !event.title.contains("thực hành", ignoreCase = true) && !event.notes.contains("thực hành", ignoreCase = true)
                "Thực hành" -> event.title.contains("thực hành", ignoreCase = true) || event.notes.contains("thực hành", ignoreCase = true) || event.room.contains("xưởng", ignoreCase = true)
                else -> !eventDate.isBefore(today.minusDays(1)) // Mặc định hiển thị từ hôm nay trở đi
            }
        }.sortedWith(compareBy({ it.date }, { it.startTime }))
    }

    // Nhóm theo ngày
    val groupedAgendaEvents = remember(agendaEvents) {
        agendaEvents.groupBy { it.date }
    }

    // Sự kiện cho chế độ xem theo ngày đơn lẻ
    val singleDayEvents = remember(events, selectedDate) {
        val dateStr = selectedDate.toString()
        events.filter { it.date == dateStr }.sortedBy { it.startTime }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Lịch giảng dạy & Sự kiện", fontWeight = FontWeight.Bold)
                        Text(
                            text = if (viewMode == 0) "Dòng thời gian lịch trình liên tục" else "Xem theo từng ngày",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                },
                actions = {
                    // Nút chuyển chế độ xem
                    IconButton(onClick = { viewMode = if (viewMode == 0) 1 else 0 }) {
                        Icon(
                            imageVector = if (viewMode == 0) Icons.Default.CalendarMonth else Icons.Default.ViewAgenda,
                            contentDescription = "Chuyển chế độ xem",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Mode switcher tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = viewMode == 0,
                    onClick = { viewMode = 0 },
                    label = { Text("📋 Lịch trình tổng thể (${agendaEvents.size} ca)") },
                    leadingIcon = { Icon(Icons.Default.ViewAgenda, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = viewMode == 1,
                    onClick = { viewMode = 1 },
                    label = { Text("📅 Xem theo ngày") },
                    leadingIcon = { Icon(Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(16.dp)) },
                    modifier = Modifier.weight(1f)
                )
            }

            // =========================================================================
            // CHẾ ĐỘ 1: LỊCH TRÌNH TỔNG THỂ (AGENDA TIMELINE - KHÔNG CẦN BẤM TỪNG NGÀY)
            // =========================================================================
            if (viewMode == 0) {
                // Filter chips row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("Tất cả", "Tuần này", "Tuần tới", "Lý thuyết", "Thực hành").forEach { filterName ->
                        FilterChip(
                            selected = selectedFilter == filterName,
                            onClick = { selectedFilter = filterName },
                            label = { Text(filterName, fontSize = 12.sp) }
                        )
                    }
                }

                if (groupedAgendaEvents.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Icon(
                                Icons.Default.EventAvailable,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
                            )
                            Text(
                                text = "Không có lịch dạy nào trong giai đoạn này",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Thầy/Cô có thể bấm dấu (+) ở màn hình chính hoặc dùng Gemini AI để nhập nhanh lịch dạy từ tin nhắn Zalo.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        groupedAgendaEvents.forEach { (dateStr, dayEventList) ->
                            val localDate = try { LocalDate.parse(dateStr) } catch (e: Exception) { today }
                            val isToday = localDate == today
                            val isTomorrow = localDate == today.plusDays(1)

                            val dateHeaderTitle = when {
                                isToday -> "HÔM NAY"
                                isTomorrow -> "NGÀY MAI"
                                else -> localDate.format(DateTimeFormatter.ofPattern("EEEE", Locale("vi", "VN"))).replaceFirstChar { it.uppercase() }
                            }
                            val dateSub = localDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))

                            // Sticky date group header
                            item {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 8.dp, bottom = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = if (isToday) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
                                        ) {
                                            Text(
                                                text = dateHeaderTitle,
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 12.sp,
                                                color = if (isToday) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                        Text(
                                            text = dateSub,
                                            fontWeight = FontWeight.Bold,
                                            style = MaterialTheme.typography.titleMedium
                                        )
                                    }
                                    Text(
                                        text = "${dayEventList.size} ca dạy",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                }
                            }

                            // Event items for this date
                            items(dayEventList) { event ->
                                ScheduleAgendaCard(
                                    event = event,
                                    onEdit = { editingEvent = event },
                                    onDelete = { deletingEvent = event },
                                    onSyncGoogle = {
                                        GoogleCalendarManager.insertEventViaIntent(context, event)
                                    }
                                )
                            }
                        }
                    }
                }
            } else {
                // =========================================================================
                // CHẾ ĐỘ 2: XEM THEO TỪNG NGÀY (CÓ BỘ CHUYỂN NGÀY)
                // =========================================================================
                val formattedDate = remember(selectedDate) {
                    val formatter = DateTimeFormatter.ofPattern("EEEE, dd/MM/yyyy", Locale("vi", "VN"))
                    selectedDate.format(formatter).replaceFirstChar { it.uppercase() }
                }

                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { selectedDate = selectedDate.minusDays(1) }) {
                            Icon(Icons.Default.ChevronLeft, contentDescription = "Ngày trước")
                        }
                        Text(
                            text = formattedDate,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        IconButton(onClick = { selectedDate = selectedDate.plusDays(1) }) {
                            Icon(Icons.Default.ChevronRight, contentDescription = "Ngày sau")
                        }
                    }
                }

                if (singleDayEvents.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize().padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "Không có lịch dạy trong ngày này",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        contentPadding = PaddingValues(vertical = 8.dp)
                    ) {
                        items(singleDayEvents) { event ->
                            ScheduleAgendaCard(
                                event = event,
                                onEdit = { editingEvent = event },
                                onDelete = { deletingEvent = event },
                                onSyncGoogle = {
                                    GoogleCalendarManager.insertEventViaIntent(context, event)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ScheduleAgendaCard(
    event: CalendarEventEntity,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onSyncGoogle: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            // Header Row: Time & Room
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = MaterialTheme.colorScheme.primaryContainer
                    ) {
                        Text(
                            text = "${event.startTime} - ${event.endTime}",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    if (event.room.isNotBlank()) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = MaterialTheme.colorScheme.secondaryContainer
                        ) {
                            Text(
                                text = "Phòng ${event.room}",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSecondaryContainer
                            )
                        }
                    }
                }

                // Quick Action buttons
                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                    IconButton(onClick = onSyncGoogle, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Sync, contentDescription = "Đồng bộ Google Calendar", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onEdit, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.EditCalendar, contentDescription = "Đổi ngày / Sửa", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                    }
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Delete, contentDescription = "Xóa", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                    }
                }
            }

            // Subject Title
            Text(
                text = event.title.ifBlank { event.subject },
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            // Class and Details
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (event.className.isNotBlank()) {
                    Text(
                        text = "Lớp: ${event.className}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
                if (event.reminder1Enabled || event.reminder2Enabled) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Icon(Icons.Default.Alarm, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                        Text(
                            text = "Báo thức 60m & 15m",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            if (event.notes.isNotBlank()) {
                Text(
                    text = event.notes,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    maxLines = 2
                )
            }
        }
    }
}
