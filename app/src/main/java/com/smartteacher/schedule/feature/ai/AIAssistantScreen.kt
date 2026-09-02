package com.smartteacher.schedule.feature.ai

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.smartteacher.schedule.core.ai.*
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity
import kotlinx.coroutines.launch
import java.time.LocalDate

data class ChatMessage(val text: String, val isUser: Boolean)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIAssistantScreen(
    aiService: AIService,
    events: List<CalendarEventEntity>,
    tasks: List<TaskEntity>,
    onSaveImportedSchedule: (TeachingScheduleEntity) -> Unit,
    onMoveUnfinishedTasks: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Trợ lý Chat", "Nhập lịch AI", "Phân tích tuần", "Rà soát ngày")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("AI Schedule Intelligence", fontWeight = FontWeight.Bold)
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            ScrollableTabRow(
                selectedTabIndex = selectedTab,
                edgePadding = 16.dp
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }

            when (selectedTab) {
                0 -> AIChatView(aiService = aiService, events = events, tasks = tasks)
                1 -> AIImportScheduleView(aiService = aiService, onConfirm = onSaveImportedSchedule)
                2 -> AIWeeklyAnalysisView(aiService = aiService, events = events, tasks = tasks)
                3 -> AIDailyReviewView(
                    aiService = aiService,
                    events = events,
                    tasks = tasks,
                    onMoveTasks = onMoveUnfinishedTasks
                )
            }
        }
    }
}

@Composable
fun AIChatView(
    aiService: AIService,
    events: List<CalendarEventEntity>,
    tasks: List<TaskEntity>
) {
    var inputText by remember { mutableStateOf("") }
    val messages = remember {
        mutableStateListOf(
            ChatMessage("Xin chào Thầy/Cô! Tôi là Trợ lý AI Lịch dạy. Thầy/Cô có thể hỏi tôi về lịch ngày mai, số tiết tuần này hoặc kiểm tra công việc quá hạn.", false)
        )
    }
    val coroutineScope = rememberCoroutineScope()
    var isThinking by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Quick Prompt Suggestions
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            SuggestionChip(
                onClick = { inputText = "Tôi có lịch gì ngày mai?" },
                label = { Text("Lịch ngày mai?") }
            )
            SuggestionChip(
                onClick = { inputText = "Tuần này tôi có bao nhiêu tiết dạy?" },
                label = { Text("Số tiết tuần này?") }
            )
            SuggestionChip(
                onClick = { inputText = "Việc nào đang quá hạn?" },
                label = { Text("Việc quá hạn?") }
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Chat List
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages) { msg ->
                val align = if (msg.isUser) Alignment.End else Alignment.Start
                val bg = if (msg.isUser) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                val textColor = if (msg.isUser) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = align
                ) {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = bg,
                        modifier = Modifier.widthIn(max = 300.dp)
                    ) {
                        Text(
                            text = msg.text,
                            modifier = Modifier.padding(12.dp),
                            color = textColor,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            if (isThinking) {
                item {
                    Text(
                        text = "AI đang tra cứu dữ liệu...",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Input Field
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Nhập câu hỏi về lịch dạy...") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    val query = inputText.trim()
                    if (query.isNotBlank()) {
                        messages.add(ChatMessage(query, true))
                        inputText = ""
                        isThinking = true
                        coroutineScope.launch {
                            val answer = aiService.chatWithScheduleData(query, events, tasks)
                            messages.add(ChatMessage(answer, false))
                            isThinking = false
                        }
                    }
                }
            ) {
                Icon(Icons.Default.Send, contentDescription = "Gửi", tint = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
fun AIImportScheduleView(
    aiService: AIService,
    onConfirm: (TeachingScheduleEntity) -> Unit
) {
    var rawText by remember { mutableStateOf("") }
    var parsedResult by remember { mutableStateOf<ScheduleParseResult?>(null) }
    var isAnalyzing by remember { mutableStateOf(false) }
    var saveSuccessMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text(
            text = "Nhập thời khóa biểu từ văn bản",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Dán đoạn văn bản chứa thông tin lịch dạy (ví dụ tin nhắn Zalo, email, ghi chú). AI sẽ tự động trích xuất thành sự kiện.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )

        OutlinedTextField(
            value = rawText,
            onValueChange = { rawText = it },
            placeholder = { Text("Dán nội dung lịch dạy của Thầy/Cô vào đây (ví dụ: Thứ 2 từ 8h đến 10h dạy Toán lớp 10A1 phòng 201)...") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        Button(
            onClick = {
                if (rawText.isNotBlank()) {
                    isAnalyzing = true
                    coroutineScope.launch {
                        parsedResult = aiService.parseScheduleText(rawText)
                        isAnalyzing = false
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isAnalyzing) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("AI đang phân tích...")
            } else {
                Icon(Icons.Default.AutoAwesome, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Phân tích lịch dạy")
            }
        }

        // Preview Card
        parsedResult?.let { result ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Kết quả trích xuất (Preview)",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Độ tin cậy: ${(result.confidence * 100).toInt()}%",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("• Môn học: ${result.subject}")
                    Text("• Lớp: ${result.className}")
                    Text("• Thứ: ${result.dayOfWeek}")
                    Text("• Thời gian: ${result.startTime} - ${result.endTime}")
                    Text("• Phòng: ${result.room}")

                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = {
                            val entity = TeachingScheduleEntity(
                                subject = result.subject,
                                className = result.className,
                                dayOfWeek = result.dayOfWeek,
                                startDate = LocalDate.now().toString(),
                                startTime = result.startTime,
                                endTime = result.endTime,
                                room = result.room,
                                reminder1Minutes = 60,
                                reminder2Minutes = 15
                            )
                            onConfirm(entity)
                            saveSuccessMessage = "Đã lưu lịch dạy thành công và kích hoạt bộ nhắc 60m & 15m!"
                            parsedResult = null
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Xác nhận & Lưu lịch")
                    }
                }
            }
        }

        saveSuccessMessage?.let {
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
    }
}

@Composable
fun AIWeeklyAnalysisView(
    aiService: AIService,
    events: List<CalendarEventEntity>,
    tasks: List<TaskEntity>
) {
    var analysisResult by remember { mutableStateOf<WeeklyAnalysisResult?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(events, tasks) {
        analysisResult = aiService.generateWeeklyAnalysis(events, tasks)
        isLoading = false
    }

    if (isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    } else {
        val result = analysisResult ?: return
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Text("Phân tích tuần thông minh", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Tổng buổi dạy", style = MaterialTheme.typography.labelSmall)
                            Text("${result.totalTeachingSessions} buổi", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                        }
                    }
                    Card(modifier = Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("Nhiệm vụ chưa xong", style = MaterialTheme.typography.labelSmall)
                            Text("${result.incompleteTasksCount} việc", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
                        }
                    }
                }
            }

            if (result.backToBackWarnings.isNotEmpty()) {
                item {
                    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF2F2))) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("⚠️ Cảnh báo lịch quá dày (Dưới 15 phút nghỉ)", fontWeight = FontWeight.Bold, color = Color(0xFFB91C1C))
                            Spacer(modifier = Modifier.height(4.dp))
                            for (w in result.backToBackWarnings) {
                                Text("• $w", style = MaterialTheme.typography.bodySmall, color = Color(0xFF991B1B))
                            }
                        }
                    }
                }
            }

            item {
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text("Gợi ý từ AI", fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(6.dp))
                        for (s in result.suggestions) {
                            Text("💡 $s", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AIDailyReviewView(
    aiService: AIService,
    events: List<CalendarEventEntity>,
    tasks: List<TaskEntity>,
    onMoveTasks: () -> Unit
) {
    val pendingTasks = remember(tasks) { tasks.filter { it.status != com.smartteacher.schedule.core.model.TaskStatus.COMPLETED } }
    var movedMessage by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("Rà soát cuối ngày (Daily Review)", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(
            "Hôm nay Thầy/Cô còn ${pendingTasks.size} nhiệm vụ chưa hoàn thành. Thầy/Cô có muốn chuyển các công việc này sang ngày mai?",
            style = MaterialTheme.typography.bodyMedium
        )

        for (task in pendingTasks.take(4)) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Text(
                    text = "• ${task.title}",
                    modifier = Modifier.padding(12.dp),
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Button(
            onClick = {
                onMoveTasks()
                movedMessage = "Đã chuyển toàn bộ các công việc chưa hoàn tất sang ngày mai!"
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Chuyển các việc chưa hoàn thành sang ngày mai")
        }

        movedMessage?.let {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFD1FAE5)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(it, color = Color(0xFF065F46), modifier = Modifier.padding(12.dp), fontWeight = FontWeight.Bold)
            }
        }
    }
}
