package com.smartteacher.schedule.feature.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import android.widget.Toast
import com.smartteacher.schedule.core.ai.*
import com.smartteacher.schedule.core.database.dao.KnowledgeDocumentDao
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
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
    schedules: List<TeachingScheduleEntity> = emptyList(),
    tasks: List<TaskEntity>,
    knowledgeDao: KnowledgeDocumentDao? = null,
    onSaveImportedSchedule: (TeachingScheduleEntity) -> Unit,
    onMoveUnfinishedTasks: () -> Unit,
    onSaveAttachment: (LessonAttachmentEntity) -> Unit = {}
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Soạn Giáo Án (5512/2634)", "Đề Thi & Ma Trận", "📚 Kho Tư Liệu Chuẩn", "Trợ lý Chat", "Nhập lịch AI", "Phân tích tuần", "Rà soát ngày")

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
                        Text("AI Sư Phạm & Trợ Lý Giáo Viên", fontWeight = FontWeight.Bold)
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
                0 -> AILessonPlannerView(
                    aiService = aiService,
                    events = events,
                    schedules = schedules,
                    knowledgeDao = knowledgeDao,
                    onSaveAttachment = onSaveAttachment,
                    onNavigateToKnowledgeBase = { selectedTab = 2 }
                )
                1 -> AIExamMatrixView(
                    aiService = aiService,
                    events = events,
                    knowledgeDao = knowledgeDao,
                    onSaveAttachment = onSaveAttachment,
                    onNavigateToKnowledgeBase = { selectedTab = 2 }
                )
                2 -> {
                    if (knowledgeDao != null) {
                        AIKnowledgeBaseScreen(knowledgeDao = knowledgeDao)
                    } else {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("Kho tư liệu không khả dụng")
                        }
                    }
                }
                3 -> AIChatView(
                    aiService = aiService,
                    events = events,
                    tasks = tasks,
                    knowledgeDao = knowledgeDao
                )
                4 -> AIImportScheduleView(aiService = aiService, onConfirm = onSaveImportedSchedule)
                5 -> AIWeeklyAnalysisView(aiService = aiService, events = events, tasks = tasks)
                6 -> AIDailyReviewView(
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
    tasks: List<TaskEntity>,
    knowledgeDao: KnowledgeDocumentDao? = null
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    var inputText by remember { mutableStateOf("") }
    var selectedModeIndex by remember { mutableStateOf(0) }

    val modeTabs = listOf(
        "Tất cả",
        "📚 Kho tư liệu",
        "📝 Đề thi & Ma trận",
        "📊 Slide bài giảng",
        "🎮 Mini game",
        "🧠 Sơ đồ tư duy",
        "🎨 Hình minh họa",
        "🇻🇳 Nguồn chính thống",
        "⏰ Lịch dạy"
    )

    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                "Xin chào Thầy/Cô! Em là Trợ lý AI Sư phạm đa năng 24/7 (Made by Huy Technology AI).\n\n" +
                "Em hỗ trợ toàn diện 7 năng lực sư phạm chuyên sâu:\n" +
                "1. 📚 Tra cứu kho tư liệu chuẩn (CV 5512, CV 3456, QĐ 2422, TT 22, ATLĐ 5S, SGV đã upload).\n" +
                "2. 📝 Tạo đề thi & ma trận 4 mức độ theo Thông tư 22.\n" +
                "3. 📊 Tạo slide thuyết trình 10 trang kèm lời thoại giảng viên.\n" +
                "4. 🎮 Thiết kế mini game Kahoot / Quizizz tương tác.\n" +
                "5. 🧠 Tạo sơ đồ tư duy Mermaid & Cây phân cấp kiến thức.\n" +
                "6. 🎨 Prompt tạo hình ảnh minh họa 3D cho bài dạy.\n" +
                "7. 🇻🇳 Tra cứu văn bản định mức từ moet.gov.vn & thuvienphapluat.vn.\n\n" +
                "Thầy/Cô hãy chọn nhanh danh mục hoặc gõ câu hỏi bất kỳ ạ!",
                false
            )
        )
    }
    val coroutineScope = rememberCoroutineScope()
    var isThinking by remember { mutableStateOf(false) }

    // Dynamic prompt suggestions based on selected mode
    val currentSuggestions = when (selectedModeIndex) {
        1 -> listOf(
            "Quy định 4 hoạt động của CV 5512",
            "6 miền năng lực số theo CV 3456",
            "QĐ 2422 về ứng dụng AI giáo dục",
            "5 bước thực hành xưởng theo CV 2634"
        )
        2 -> listOf(
            "Tạo đề thi và ma trận 10 câu môn Công nghệ 10 theo TT 22",
            "Tỉ lệ 4 mức độ nhận thức theo TT 22",
            "Bảng đặc tả đề kiểm tra học kỳ"
        )
        3 -> listOf(
            "Tạo bộ 10 slide thuyết trình môn Công nghệ",
            "Cấu trúc slide bài giảng tích hợp năng lực số",
            "Gợi ý lời thoại giáo viên (Speaker notes)"
        )
        4 -> listOf(
            "Tạo mini game tương tác Kahoot 4 câu",
            "Câu hỏi đố vui Rung chuông vàng",
            "Trò chơi khởi động bài học"
        )
        5 -> listOf(
            "Tạo sơ đồ tư duy bài học Công nghệ",
            "Mã nguồn Mermaid Mindmap",
            "Cây phân cấp kiến thức bài giảng"
        )
        6 -> listOf(
            "Prompt tạo ảnh 3D máy gia công cơ khí",
            "Hình minh họa nguyên lý cắt gọt",
            "Sơ đồ an toàn lao động xưởng"
        )
        7 -> listOf(
            "Định mức giờ dạy theo Thông tư 28 và Thông tư 15",
            "Thông tư 22/2021 về đánh giá học sinh",
            "Tra cứu cổng Bộ Giáo dục moet.gov.vn"
        )
        8 -> listOf(
            "Tôi có lịch gì ngày mai?",
            "Tuần này tôi có bao nhiêu tiết dạy?",
            "Việc nào đang quá hạn?",
            "Hôm nay cần chuẩn bị những gì?"
        )
        else -> listOf(
            "📜 4 hoạt động CV 5512",
            "📝 Ma trận đề chuẩn TT 22",
            "📊 Slide bài giảng 10 trang",
            "🎮 Mini game Kahoot",
            "🧠 Sơ đồ Mermaid",
            "🎨 Prompt tạo ảnh 3D",
            "🇻🇳 Định mức giờ dạy"
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        // Mode Selector Chips (Horizontal Scrolling)
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(modeTabs.size) { index ->
                val isSelected = selectedModeIndex == index
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedModeIndex = index },
                    label = {
                        Text(
                            text = modeTabs[index],
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            style = MaterialTheme.typography.bodySmall
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                        selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Quick Suggestion Chips
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(currentSuggestions) { suggestion ->
                SuggestionChip(
                    onClick = { inputText = suggestion },
                    label = { Text(suggestion, style = MaterialTheme.typography.bodySmall) }
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

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
                        modifier = Modifier.widthIn(max = 330.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = msg.text,
                                color = textColor,
                                style = MaterialTheme.typography.bodyMedium
                            )

                            // Nút sao chép nội dung tin nhắn của AI
                            if (!msg.isUser) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 8.dp),
                                    horizontalArrangement = Arrangement.End
                                ) {
                                    TextButton(
                                        onClick = {
                                            clipboardManager.setText(AnnotatedString(msg.text))
                                            Toast.makeText(context, "Đã sao chép nội dung!", Toast.LENGTH_SHORT).show()
                                        },
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.ContentCopy,
                                            contentDescription = "Sao chép",
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Sao chép", style = MaterialTheme.typography.labelSmall)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (isThinking) {
                item {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "AI Sư phạm đang đối chiếu kho tư liệu chuẩn và soạn thảo...",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Input Field
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = {
                    Text(
                        when (selectedModeIndex) {
                            1 -> "Tra cứu CV 5512, 3456, giáo trình..."
                            2 -> "Nhập môn để tạo ma trận đề TT 22..."
                            3 -> "Nhập bài học để tạo slide bài giảng..."
                            4 -> "Nhập chủ đề tạo mini game Kahoot..."
                            5 -> "Nhập chủ đề tạo sơ đồ tư duy..."
                            6 -> "Nhập bài dạy để tạo prompt hình ảnh..."
                            7 -> "Hỏi về thông tư, định mức giờ dạy..."
                            else -> "Hỏi AI Sư phạm (7 chức năng chuyên sâu)..."
                        },
                        style = MaterialTheme.typography.bodySmall
                    )
                },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    val query = inputText.trim()
                    if (query.isNotBlank() && !isThinking) {
                        messages.add(ChatMessage(query, true))
                        inputText = ""
                        isThinking = true
                        coroutineScope.launch {
                            var refDocsText = ""
                            try {
                                val activeDocs = knowledgeDao?.getAllActiveDocuments() ?: emptyList()
                                if (activeDocs.isNotEmpty()) {
                                    refDocsText = activeDocs.joinToString("\n\n") {
                                        "[${it.code}] ${it.title}:\n${it.content.take(500)}"
                                    }
                                }
                            } catch (e: Exception) {
                                // fallback empty
                            }
                            val answer = aiService.chatWithPedagogicalAssistant(query, events, tasks, refDocsText)
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
