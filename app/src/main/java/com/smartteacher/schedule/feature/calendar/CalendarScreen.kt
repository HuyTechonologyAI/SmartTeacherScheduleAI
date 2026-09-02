package com.smartteacher.schedule.feature.calendar

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.model.EventSource
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
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    var selectedSourceFilter by remember { mutableStateOf<EventSource?>(null) }

    var editingEvent by remember { mutableStateOf<CalendarEventEntity?>(null) }
    var deletingEvent by remember { mutableStateOf<CalendarEventEntity?>(null) }

    if (editingEvent != null) {
        EditEventDialog(
            event = editingEvent!!,
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

    val formattedDate = remember(selectedDate) {
        val formatter = DateTimeFormatter.ofPattern("EEEE, dd/MM/yyyy", Locale("vi", "VN"))
        selectedDate.format(formatter).replaceFirstChar { it.uppercase() }
    }

    val filteredEvents = remember(events, selectedDate, selectedSourceFilter) {
        val dateStr = selectedDate.toString()
        events.filter { event ->
            event.date == dateStr && (selectedSourceFilter == null || event.source == selectedSourceFilter)
        }.sortedBy { it.startTime }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Lịch dạy & Sự kiện", fontWeight = FontWeight.Bold) }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Date Navigation Header
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp),
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

            Spacer(modifier = Modifier.height(12.dp))

            // Source Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedSourceFilter == null,
                    onClick = { selectedSourceFilter = null },
                    label = { Text("Tất cả") }
                )
                FilterChip(
                    selected = selectedSourceFilter == EventSource.LOCAL,
                    onClick = { selectedSourceFilter = EventSource.LOCAL },
                    label = { Text("Trực tiếp") }
                )
                FilterChip(
                    selected = selectedSourceFilter == EventSource.GOOGLE_CALENDAR,
                    onClick = { selectedSourceFilter = EventSource.GOOGLE_CALENDAR },
                    label = { Text("Google") }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (filteredEvents.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Không có sự kiện nào vào ngày này.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredEvents) { event ->
                        CalendarEventRow(
                            event = event,
                            onClick = { editingEvent = event },
                            onEdit = { editingEvent = event },
                            onDelete = { deletingEvent = event }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun CalendarEventRow(
    event: CalendarEventEntity,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.width(56.dp)) {
                Text(
                    text = event.startTime,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = event.endTime,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = event.title,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold
                )
                if (event.room.isNotBlank() || event.className.isNotBlank()) {
                    Text(
                        text = "${if (event.room.isNotBlank()) "Phòng ${event.room}" else ""} ${if (event.className.isNotBlank()) "• Lớp ${event.className}" else ""}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
            }

            // Edit and Delete Buttons
            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                IconButton(
                    onClick = onEdit,
                    modifier = Modifier.size(34.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Chỉnh sửa",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(18.dp)
                    )
                }
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(34.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Xóa",
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
