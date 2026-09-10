package com.smartteacher.schedule.feature.ai

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.style.TextOverflow
import com.smartteacher.schedule.core.ai.*
import com.smartteacher.schedule.core.database.dao.KnowledgeDocumentDao
import com.smartteacher.schedule.core.database.entity.KnowledgeDocumentEntity
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
import com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity
import com.smartteacher.schedule.core.util.AttachmentFileHelper
import kotlinx.coroutines.launch

/**
 * Giao diện Soạn Kế Hoạch Bài Dạy Chuẩn Pháp Quy:
 * - CV 5512/BGDĐT-GDTrH (Phổ thông THCS, THPT, GDTX)
 * - CV 2634/GDNN (Giáo dục Nghề nghiệp, Thực hành xưởng kỹ thuật, Trung cấp, Cao đẳng)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AILessonPlannerView(
    aiService: AIService,
    events: List<CalendarEventEntity>,
    schedules: List<TeachingScheduleEntity>,
    knowledgeDao: KnowledgeDocumentDao? = null,
    onSaveAttachment: (LessonAttachmentEntity) -> Unit,
    onNavigateToKnowledgeBase: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current

    // 0: CV 5512 (Phổ thông), 1: CV 2634 (Dạy nghề / Xưởng thực hành)
    var selectedStandard by remember { mutableStateOf(0) }

    var lessonTitle by remember { mutableStateOf("") }
    var moduleTitle by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("") }
    var className by remember { mutableStateOf("") }
    var durationText by remember { mutableStateOf("1") }
    var specialRequirements by remember { mutableStateOf("") }

    var selectedEvent by remember { mutableStateOf<CalendarEventEntity?>(null) }
    var isGenerating by remember { mutableStateOf(false) }

    var result5512 by remember { mutableStateOf<LessonPlan5512Result?>(null) }
    var result2634 by remember { mutableStateOf<LessonPlan2634Result?>(null) }
    var currentAttachment by remember { mutableStateOf<LessonAttachmentEntity?>(null) }

    val activeDocsFlow = knowledgeDao?.getAllActiveDocumentsFlow()?.collectAsState(initial = emptyList())
    val allActiveDocs = activeDocsFlow?.value ?: emptyList()
    var selectedDocId by remember { mutableStateOf(-1L) }
    var showDocSelectDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Trợ Lý Soạn Giáo Án Generative AI",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Sinh tự động Kế hoạch bài dạy chuẩn quy định Bộ GD&ĐT (CV 5512) hoặc Tổng cục GDNN (CV 2634). Xuất tệp Word (.doc) mở 100% offline bằng WPS Office / Word và tự động đính kèm vào lịch dạy.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                    )
                }
            }
        }


        item {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFECFDF5),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF6EE7B7)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToKnowledgeBase() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.VerifiedUser,
                        contentDescription = null,
                        tint = Color(0xFF059669),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "🛡️ Chế độ đối chiếu chuẩn (Chống ảo giác & bịa đặt)",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFF065F46)
                        )
                        Text(
                            text = "AI bắt buộc đối chiếu với Kho tư liệu (CV 5512/2634 & tài liệu của Thầy/Cô). Bấm để quản lý tư liệu.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF047857)
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ArrowForwardIos,
                        contentDescription = null,
                        tint = Color(0xFF059669),
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }

        // Chọn khung công văn
        item {
            Text("1. Chọn khung công văn pháp quy:", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
            Spacer(modifier = Modifier.height(8.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = selectedStandard == 0,
                    onClick = {
                        selectedStandard = 0
                        durationText = "1"
                    },
                    label = { Text("CV 5512 (Phổ thông)") },
                    leadingIcon = if (selectedStandard == 0) {
                        { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    } else null,
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = selectedStandard == 1,
                    onClick = {
                        selectedStandard = 1
                        durationText = "4.0"
                    },
                    label = { Text("CV 2634 (GD Nghề nghiệp)") },
                    leadingIcon = if (selectedStandard == 1) {
                        { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                    } else null,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Chọn nhanh ca dạy từ lịch trình có sẵn
        if (events.isNotEmpty()) {
            item {
                Text("2. Gợi ý điền nhanh từ ca dạy của Thầy/Cô:", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(events.take(10)) { ev ->
                        val isPicked = selectedEvent?.id == ev.id
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isPicked) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                            border = if (isPicked) androidx.compose.foundation.BorderStroke(1.5.dp, MaterialTheme.colorScheme.primary) else null,
                            modifier = Modifier.clickable {
                                selectedEvent = ev
                                lessonTitle = ev.title
                                moduleTitle = ev.title
                                subject = ev.subject
                                className = ev.className
                                durationText = if (ev.sessionType.contains("Thực hành", true)) "4.0" else "1"
                            }
                        ) {
                            Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                                Text(
                                    text = ev.title.ifBlank { ev.subject },
                                    fontWeight = FontWeight.Bold,
                                    style = MaterialTheme.typography.bodySmall,
                                    maxLines = 1
                                )
                                Text(
                                    text = "${ev.className} • ${ev.date}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Nhập thông tin bài dạy
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("3. Thông tin bài dạy & Yêu cầu:", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)

                if (selectedStandard == 1) {
                    OutlinedTextField(
                        value = moduleTitle,
                        onValueChange = { moduleTitle = it },
                        label = { Text("Tên Mô-đun / Môn thực hành") },
                        placeholder = { Text("Ví dụ: Mô-đun Tiện CNC cơ bản") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = lessonTitle,
                    onValueChange = { lessonTitle = it },
                    label = { Text(if (selectedStandard == 0) "Tên bài dạy (CV 5512)" else "Tên bài học thực hành xưởng (CV 2634)") },
                    placeholder = { Text(if (selectedStandard == 0) "Ví dụ: Bài 10: Quy luật Menđen và Di truyền học" else "Ví dụ: Gia công Tiện mặt trụ ngoài bậc trên máy tiện CNC") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        label = { Text(if (selectedStandard == 0) "Môn học" else "Nghề đào tạo") },
                        placeholder = { Text(if (selectedStandard == 0) "Toán, Lý..." else "Cắt gọt kim loại...") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = className,
                        onValueChange = { className = it },
                        label = { Text(if (selectedStandard == 0) "Khối lớp" else "Trình độ đào tạo") },
                        placeholder = { Text(if (selectedStandard == 0) "Lớp 10A1" else "Trung cấp / Cao đẳng") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = durationText,
                        onValueChange = { durationText = it },
                        label = { Text(if (selectedStandard == 0) "Số tiết (tiết)" else "Thời lượng (giờ)") },
                        placeholder = { Text(if (selectedStandard == 0) "1 hoặc 2" else "4.0 hoặc 6.0") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = specialRequirements,
                        onValueChange = { specialRequirements = it },
                        label = { Text(if (selectedStandard == 0) "Yêu cầu / Ghi chú" else "Máy móc, BHLĐ & 5S") },
                        placeholder = { Text(if (selectedStandard == 0) "Thiết bị dạy học..." else "Dao tiện P20, kính BHLĐ, quy trình 5S...") },
                        modifier = Modifier.weight(2f),
                        singleLine = true
                    )
                }
            }
        }

        // Lựa chọn tài liệu đối chiếu cho AI
        item {
            val selectedDoc = allActiveDocs.find { it.id == selectedDocId }
            val docLabel = when {
                selectedDocId == -2L -> "🚫 Không dùng giáo trình (Chỉ theo khung chuẩn)"
                selectedDoc != null -> "📚 ${selectedDoc.title} (${selectedDoc.code})"
                else -> "🤖 [Tự động] Nhận diện thông minh theo Môn & Khối lớp"
            }
            val docSubtitle = when {
                selectedDocId == -2L -> "AI sẽ sinh bài hoàn toàn từ logic chuẩn, không đối chiếu sách giáo trình nào"
                selectedDoc != null -> "Đang ép buộc AI bám sát chính xác giáo trình này (${selectedDoc.subject}, ${selectedDoc.targetLevel})"
                else -> "AI tự tìm kiếm và lọc tài liệu phù hợp nhất trong Kho Tri Thức (${allActiveDocs.size} tài liệu khả dụng)"
            }

            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (selectedDocId > 0L) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                    else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showDocSelectDialog = true }
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        if (selectedDocId > 0L) Icons.Default.MenuBook else Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = if (selectedDocId > 0L) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Tài liệu căn cứ đối chiếu:",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = docLabel,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = if (selectedDocId > 0L) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = docSubtitle,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.outline,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    TextButton(onClick = { showDocSelectDialog = true }) {
                        Text("Thay đổi")
                    }
                }
            }
        }

        // Nút bấm Sinh Giáo Án AI
        item {
            Button(
                onClick = {
                    if (lessonTitle.isBlank()) {
                        Toast.makeText(context, "Vui lòng nhập tên bài dạy!", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    isGenerating = true
                    result5512 = null
                    result2634 = null
                    currentAttachment = null

                    coroutineScope.launch {
                        if (selectedStandard == 0) {
                            val periods = durationText.toIntOrNull() ?: 1
                            val activeDocs = knowledgeDao?.getAllActiveDocuments() ?: emptyList()
                            val refContext = when {
                                selectedDocId == -2L -> ""
                                selectedDocId > 0L -> {
                                    val explicitDoc = activeDocs.find { it.id == selectedDocId }
                                    if (explicitDoc != null) "【${explicitDoc.title} (${explicitDoc.code})】\n${explicitDoc.content}" else ""
                                }
                                else -> {
                                    val targetGrade = extractGradeNum(className)
                                    val relevantDocs = activeDocs.filter { doc ->
                                        isDocGradeCompatible(doc, targetGrade) && (
                                            doc.category == KnowledgeDocumentEntity.CAT_PHAP_QUY ||
                                            doc.subject == "ALL" ||
                                            doc.subject.contains(subject.trim(), ignoreCase = true)
                                        )
                                    }
                                    relevantDocs.joinToString("\n\n---\n") { doc ->
                                        "【${doc.title} (${doc.code})】\n${doc.content}"
                                    }
                                }
                            }

                            val res = aiService.generateLessonPlan5512(
                                lessonName = lessonTitle.trim(),
                                subject = subject.ifBlank { "Chung" }.trim(),
                                grade = className.ifBlank { "Phổ thông" }.trim(),
                                durationPeriods = periods,
                                customObjectives = specialRequirements,
                                referenceContext = refContext
                            )
                            result5512 = res
                            // Auto-save .doc and prepare attachment
                            val docHtml = res.toHtmlDocument()
                            val cleanName = "GiaoAn_5512_${res.lessonName.take(30).replace(" ", "_")}.doc"
                            val fileInfo = AttachmentFileHelper.saveLessonPlanToStorage(context, cleanName, docHtml)
                            if (fileInfo != null) {
                                val entity = LessonAttachmentEntity(
                                    eventId = selectedEvent?.id,
                                    teachingScheduleId = selectedEvent?.teachingScheduleId,
                                    fileName = fileInfo.fileName,
                                    filePath = fileInfo.localFilePath,
                                    mimeType = fileInfo.mimeType,
                                    fileSizeBytes = fileInfo.fileSize,
                                    fileExtension = fileInfo.extension,
                                    attachmentType = LessonAttachmentEntity.TYPE_FILE
                                )
                                currentAttachment = entity
                                onSaveAttachment(entity)
                            }
                        } else {
                            val hours = durationText.toFloatOrNull() ?: 4.0f
                            val activeDocs = knowledgeDao?.getAllActiveDocuments() ?: emptyList()
                            val refContext = when {
                                selectedDocId == -2L -> ""
                                selectedDocId > 0L -> {
                                    val explicitDoc = activeDocs.find { it.id == selectedDocId }
                                    if (explicitDoc != null) "【${explicitDoc.title} (${explicitDoc.code})】\n${explicitDoc.content}" else ""
                                }
                                else -> {
                                    val targetGrade = extractGradeNum(className)
                                    val relevantDocs = activeDocs.filter { doc ->
                                        isDocGradeCompatible(doc, targetGrade) && (
                                            doc.category == KnowledgeDocumentEntity.CAT_PHAP_QUY ||
                                            doc.category == KnowledgeDocumentEntity.CAT_QUY_CHUAN_XUONG ||
                                            doc.category == KnowledgeDocumentEntity.CAT_GIAO_TRINH ||
                                            doc.subject == "ALL" ||
                                            doc.subject.contains(subject.trim(), ignoreCase = true)
                                        )
                                    }
                                    relevantDocs.joinToString("\n\n---\n") { doc ->
                                        "【${doc.title} (${doc.code})】\n${doc.content}"
                                    }
                                }
                            }

                            val res = aiService.generateLessonPlan2634(
                                moduleName = moduleTitle.ifBlank { lessonTitle }.trim(),
                                lessonName = lessonTitle.trim(),
                                profession = subject.ifBlank { "Kỹ thuật Công nghệ" }.trim(),
                                trainingLevel = className.ifBlank { "Trung cấp" }.trim(),
                                durationHours = hours,
                                customSafety = specialRequirements.ifBlank { "Máy móc gia công, thiết bị đo kiểm, trang bị BHLĐ cá nhân" },
                                referenceContext = refContext
                            )
                            result2634 = res
                            val docHtml = res.toHtmlDocument()
                            val cleanName = "GiaoAn_2634_${res.lessonName.take(30).replace(" ", "_")}.doc"
                            val fileInfo = AttachmentFileHelper.saveLessonPlanToStorage(context, cleanName, docHtml)
                            if (fileInfo != null) {
                                val entity = LessonAttachmentEntity(
                                    eventId = selectedEvent?.id,
                                    teachingScheduleId = selectedEvent?.teachingScheduleId,
                                    fileName = fileInfo.fileName,
                                    filePath = fileInfo.localFilePath,
                                    mimeType = fileInfo.mimeType,
                                    fileSizeBytes = fileInfo.fileSize,
                                    fileExtension = fileInfo.extension,
                                    attachmentType = LessonAttachmentEntity.TYPE_FILE
                                )
                                currentAttachment = entity
                                onSaveAttachment(entity)
                            }
                        }
                        isGenerating = false
                    }
                },
                enabled = !isGenerating,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp)
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("AI đang thiết kế Kế hoạch bài dạy chuẩn...")
                } else {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        if (selectedStandard == 0) "⚡ Sinh Kế Hoạch Bài Dạy Chuẩn CV 5512" else "⚡ Sinh Kế Hoạch Bài Dạy Chuẩn CV 2634",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Action Toolbar khi đã có kết quả
        if (currentAttachment != null || result5512 != null || result2634 != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFEFF6FF)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3B82F6)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF1D4ED8))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "Đã tạo & đính kèm file Word (.doc)!",
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1D4ED8)
                                )
                            }
                            Text(
                                if (currentAttachment != null) AttachmentFileHelper.formatFileSize(currentAttachment!!.fileSizeBytes) else "",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF1D4ED8)
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            currentAttachment?.let { att ->
                                Button(
                                    onClick = { AttachmentFileHelper.openAttachment(context, att) },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
                                ) {
                                    Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Mở Word / WPS", fontSize = 12.sp)
                                }
                                OutlinedButton(
                                    onClick = { AttachmentFileHelper.shareAttachment(context, att) },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Gửi Zalo", fontSize = 12.sp)
                                }
                            }
                            IconButton(
                                onClick = {
                                    val textToCopy = if (result5512 != null) {
                                        val p = result5512!!
                                        """
                                        KẾ HOẠCH BÀI DẠY (CV 5512)
                                        Tên bài: ${p.lessonName}
                                        Môn: ${p.subject} - Khối: ${p.grade} - Thời lượng: ${p.durationPeriods} tiết
                                        I. MỤC TIÊU:
                                        - Kiến thức: ${p.knowledgeObjective}
                                        - Năng lực: ${p.generalCompetence} • ${p.specificCompetence}
                                        - Phẩm chất: ${p.qualitiesObjective}
                                        II. THIẾT BỊ DẠY HỌC:
                                        - GV: ${p.teacherEquipment}
                                        - HS: ${p.studentEquipment}
                                        III. CÁC HOẠT ĐỘNG DẠY HỌC:
                                        ${p.activities.joinToString("\n") { "${it.title}: ${it.objective}" }}
                                        """.trimIndent()
                                    } else if (result2634 != null) {
                                        val p = result2634!!
                                        """
                                        GIÁO ÁN BÀI DẠY THỰC HÀNH NGHỀ (CV 2634)
                                        Tên bài: ${p.lessonName} (Module: ${p.moduleName})
                                        Nghề: ${p.profession} - Khóa: ${p.trainingLevel} - Thời lượng: ${p.durationHours} giờ
                                        I. MỤC TIÊU BÀI DẠY:
                                        - Kiến thức: ${p.knowledgeObjective}
                                        - Kỹ năng nghề: ${p.skillObjective}
                                        - An toàn & Tự chủ: ${p.autonomyAndResponsibility}
                                        II. ĐIỀU KIỆN MÁY MÓC & 5S:
                                        - Thiết bị: ${p.machineryAndEquipment}
                                        - Phôi mẫu: ${p.materialsAndDrawings}
                                        - An toàn & 5S: ${p.safetyGear}
                                        III. CÁC BƯỚC THỰC HIỆN TẠI XƯỞNG:
                                        ${p.steps.joinToString("\n") { "${it.stepName}: ${it.teacherActivity}" }}
                                        """.trimIndent()
                                    } else ""

                                    clipboardManager.setText(AnnotatedString(textToCopy))
                                    Toast.makeText(context, "Đã sao chép nội dung giáo án!", Toast.LENGTH_SHORT).show()
                                }
                            ) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Sao chép")
                            }
                        }
                    }
                }
            }
        }

        // Preview chi tiết CV 5512
        result5512?.let { plan ->
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(
                            "KẾ HOẠCH BÀI DẠY: ${plan.lessonName}",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            "Môn: ${plan.subject} • Lớp: ${plan.grade} • Thời lượng: ${plan.durationPeriods} tiết",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )

                        Divider()

                        Text("I. MỤC TIÊU BÀI DẠY", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        Text("1. Kiến thức: ${plan.knowledgeObjective}", style = MaterialTheme.typography.bodySmall)
                        Text("2. Năng lực chung: ${plan.generalCompetence}", style = MaterialTheme.typography.bodySmall)
                        Text("• Năng lực đặc thù: ${plan.specificCompetence}", style = MaterialTheme.typography.bodySmall)
                        Text("3. Phẩm chất: ${plan.qualitiesObjective}", style = MaterialTheme.typography.bodySmall)

                        Divider()

                        Text("II. THIẾT BỊ DẠY HỌC & HỌC LIỆU", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        Text("• Giáo viên: ${plan.teacherEquipment}", style = MaterialTheme.typography.bodySmall)
                        Text("• Học sinh: ${plan.studentEquipment}", style = MaterialTheme.typography.bodySmall)

                        Divider()

                        Text("III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG BẮT BUỘC)", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        plan.activities.forEach { act ->
                            Activity5512Item(act.title, act)
                        }
                    }
                }
            }
        }

        // Preview chi tiết CV 2634
        result2634?.let { plan ->
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(
                            "GIÁO ÁN THỰC HÀNH NGHỀ: ${plan.lessonName}",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleMedium,
                            color = Color(0xFFD97706)
                        )
                        Text(
                            "Mô-đun: ${plan.moduleName} • Nghề: ${plan.profession} • Trình độ: ${plan.trainingLevel} • Thời lượng: ${plan.durationHours} giờ",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )

                        Divider()

                        Text("I. MỤC TIÊU BÀI DẠY", fontWeight = FontWeight.Bold, color = Color(0xFFD97706))
                        Text("1. Kiến thức: ${plan.knowledgeObjective}", style = MaterialTheme.typography.bodySmall)
                        Text("2. Kỹ năng nghề: ${plan.skillObjective}", style = MaterialTheme.typography.bodySmall)
                        Text("3. Năng lực tự chủ, An toàn & 5S: ${plan.autonomyAndResponsibility}", style = MaterialTheme.typography.bodySmall)

                        Divider()

                        Text("II. ĐIỀU KIỆN THỰC HIỆN BÀI DẠY", fontWeight = FontWeight.Bold, color = Color(0xFFD97706))
                        Text("• Máy móc thiết bị: ${plan.machineryAndEquipment}", style = MaterialTheme.typography.bodySmall)
                        Text("• Vật tư phôi mẫu: ${plan.materialsAndDrawings}", style = MaterialTheme.typography.bodySmall)
                        Text("• Trang bị BHLĐ & 5S: ${plan.safetyGear}", style = MaterialTheme.typography.bodySmall)

                        Divider()

                        Text("III. TIẾN TRÌNH THỰC HIỆN TẠI XƯỞNG (4 BƯỚC THỰC HÀNH)", fontWeight = FontWeight.Bold, color = Color(0xFFD97706))
                        plan.steps.forEach { step ->
                            Step2634Item(step.stepName, step)
                        }
                    }
                }
            }
        }
    }

    if (showDocSelectDialog) {
        AlertDialog(
            onDismissRequest = { showDocSelectDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.MenuBook, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Chọn tài liệu làm căn cứ cho AI", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                }
            },
            text = {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 420.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    selectedDocId = -1L
                                    showDocSelectDialog = false
                                }
                                .padding(vertical = 8.dp, horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = (selectedDocId == -1L),
                                onClick = {
                                    selectedDocId = -1L
                                    showDocSelectDialog = false
                                }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("🤖 [Tự động] Nhận diện theo Môn & Lớp", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                Text("Hệ thống tự đối chiếu và dùng tài liệu phù hợp", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
                            }
                        }
                        Divider(modifier = Modifier.padding(vertical = 4.dp))
                    }

                    if (allActiveDocs.isEmpty()) {
                        item {
                            Text(
                                "Chưa có tài liệu nào trong Kho Tri Thức. Bạn có thể thêm tài liệu ở tab Kho Tri Thức.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.outline,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    } else {
                        items(allActiveDocs.size) { idx ->
                            val doc = allActiveDocs[idx]
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        selectedDocId = doc.id
                                        showDocSelectDialog = false
                                    }
                                    .padding(vertical = 6.dp, horizontal = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = (selectedDocId == doc.id),
                                    onClick = {
                                        selectedDocId = doc.id
                                        showDocSelectDialog = false
                                    }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(doc.title, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.bodyMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text(
                                        "${doc.code} • ${doc.subject} • ${doc.targetLevel}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.outline
                                    )
                                }
                            }
                        }
                    }

                    item {
                        Divider(modifier = Modifier.padding(vertical = 4.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    selectedDocId = -2L
                                    showDocSelectDialog = false
                                }
                                .padding(vertical = 8.dp, horizontal = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = (selectedDocId == -2L),
                                onClick = {
                                    selectedDocId = -2L
                                    showDocSelectDialog = false
                                }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text("🚫 Không dùng giáo trình đối chiếu", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodyMedium)
                                Text("Chỉ sinh giáo án thuần túy theo cấu trúc chuẩn công văn", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showDocSelectDialog = false }) {
                    Text("Đóng")
                }
            }
        )
    }
}

@Composable
fun Activity5512Item(stepLabel: String, activity: Activity5512) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stepLabel, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp)
            Text("• Thời gian: ${activity.durationMinutes} phút", style = MaterialTheme.typography.labelSmall)
            Text("• Mục tiêu: ${activity.objective}", style = MaterialTheme.typography.bodySmall)
            Text("• Nội dung: ${activity.content}", style = MaterialTheme.typography.bodySmall)
            Text("• Sản phẩm: ${activity.product}", style = MaterialTheme.typography.bodySmall)
            Text("• Tổ chức thực hiện: ${activity.implementation}", style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
fun Step2634Item(stepLabel: String, step: Step2634) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = Color(0xFFFEF3C7).copy(alpha = 0.5f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stepLabel, fontWeight = FontWeight.Bold, color = Color(0xFFB45309), fontSize = 13.sp)
            Text("• Thời gian: ${step.durationMinutes} phút", style = MaterialTheme.typography.labelSmall)
            Text("• Hoạt động của GV: ${step.teacherActivity}", style = MaterialTheme.typography.bodySmall)
            Text("• Hoạt động của HS: ${step.studentActivity}", style = MaterialTheme.typography.bodySmall)
            Text("• Lưu ý & ATLĐ: ${step.notesAndSafety}", style = MaterialTheme.typography.bodySmall, color = Color(0xFFDC2626))
        }
    }
}

/**
 * Giao diện Tạo Đề Thi & Ma Trận 4 Mức Độ Nhận Thức:
 * (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIExamMatrixView(
    aiService: AIService,
    events: List<CalendarEventEntity>,
    knowledgeDao: KnowledgeDocumentDao? = null,
    onSaveAttachment: (LessonAttachmentEntity) -> Unit,
    onNavigateToKnowledgeBase: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var examTopic by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("") }
    var grade by remember { mutableStateOf("") }
    var questionCount by remember { mutableStateOf("10") }

    var isGenerating by remember { mutableStateOf(false) }
    var examResult by remember { mutableStateOf<ExamMatrixResult?>(null) }
    var currentAttachment by remember { mutableStateOf<LessonAttachmentEntity?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF3E8FF)),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Quiz,
                            contentDescription = null,
                            tint = Color(0xFF7E22CE),
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Kho Đề Thi & Ma Trận 4 Mức Độ",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleMedium,
                            color = Color(0xFF7E22CE)
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        "Tự động xây dựng bảng ma trận kiểm tra và bộ câu hỏi phân hóa 4 mức độ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao kèm đáp án và lời giải chi tiết. Xuất tệp Word (.doc) mở 100% offline.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                    )
                }
            }
        }


        item {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFFF0FDF4),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF86EFAC)),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToKnowledgeBase() }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.VerifiedUser,
                        contentDescription = null,
                        tint = Color(0xFF16A34A),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "🛡️ Căn cứ Thông tư 22 & Ngân hàng đề chuẩn",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFF166534)
                        )
                        Text(
                            text = "Đề thi và ma trận được đối chiếu khoa học, không tự bịa kiến thức ngoài chuẩn.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF15803D)
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ArrowForwardIos,
                        contentDescription = null,
                        tint = Color(0xFF16A34A),
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = examTopic,
                    onValueChange = { examTopic = it },
                    label = { Text("Chủ đề kiểm tra / Tên bài học") },
                    placeholder = { Text("Ví dụ: Kiểm tra 15 phút - Căn bậc hai và Hằng đẳng thức") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        label = { Text("Môn học") },
                        placeholder = { Text("Toán, Lý, Hóa...") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = grade,
                        onValueChange = { grade = it },
                        label = { Text("Lớp / Khóa") },
                        placeholder = { Text("Lớp 9, Lớp 12...") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                }

                OutlinedTextField(
                    value = questionCount,
                    onValueChange = { questionCount = it },
                    label = { Text("Số lượng câu hỏi") },
                    placeholder = { Text("10 (Mặc định)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
            }
        }

        item {
            Button(
                onClick = {
                    if (examTopic.isBlank()) {
                        Toast.makeText(context, "Vui lòng nhập chủ đề kiểm tra!", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    isGenerating = true
                    examResult = null
                    currentAttachment = null

                    coroutineScope.launch {
                        val count = questionCount.toIntOrNull() ?: 10
                        val activeDocs = knowledgeDao?.getAllActiveDocuments() ?: emptyList()
                        val targetGrade = extractGradeNum(grade)
                        val relevantDocs = activeDocs.filter { doc ->
                            isDocGradeCompatible(doc, targetGrade) && (
                                doc.category == KnowledgeDocumentEntity.CAT_PHAP_QUY ||
                                doc.category == KnowledgeDocumentEntity.CAT_DE_CUONG ||
                                doc.subject == "ALL" ||
                                doc.subject.contains(subject.trim(), ignoreCase = true)
                            )
                        }
                        val refContext = relevantDocs.joinToString("\n\n---\n") { doc ->
                            "【${doc.title} (${doc.code})】\n${doc.content}"
                        }

                        val res = aiService.generateExamMatrix(
                            topic = examTopic.trim(),
                            subject = subject.ifBlank { "Chung" }.trim(),
                            gradeOrClass = grade.ifBlank { "Phổ thông" }.trim(),
                            questionCount = count,
                            referenceContext = refContext
                        )
                        examResult = res

                        val docHtml = res.toHtmlDocument()
                        val cleanName = "DeThi_MaTran_${res.examTitle.take(30).replace(" ", "_")}.doc"
                        val fileInfo = AttachmentFileHelper.saveLessonPlanToStorage(context, cleanName, docHtml)
                        if (fileInfo != null) {
                            val entity = LessonAttachmentEntity(
                                fileName = fileInfo.fileName,
                                filePath = fileInfo.localFilePath,
                                mimeType = fileInfo.mimeType,
                                fileSizeBytes = fileInfo.fileSize,
                                fileExtension = fileInfo.extension,
                                attachmentType = LessonAttachmentEntity.TYPE_FILE
                            )
                            currentAttachment = entity
                            onSaveAttachment(entity)
                        }
                        isGenerating = false
                    }
                },
                enabled = !isGenerating,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7E22CE))
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("AI đang xây dựng đề thi & ma trận 4 mức độ...")
                } else {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("⚡ Sinh Đề Thi & Ma Trận 4 Mức Độ", fontWeight = FontWeight.Bold)
                }
            }
        }

        // Toolbar xuất tệp Word & Share
        if (currentAttachment != null || examResult != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF3E8FF)),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF9333EA)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF7E22CE))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "Đã lưu tệp Đề thi Word (.doc)!",
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF7E22CE)
                                )
                            }
                            Text(
                                if (currentAttachment != null) AttachmentFileHelper.formatFileSize(currentAttachment!!.fileSizeBytes) else "",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF7E22CE)
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            currentAttachment?.let { att ->
                                Button(
                                    onClick = { AttachmentFileHelper.openAttachment(context, att) },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7E22CE))
                                ) {
                                    Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Mở Word / WPS", fontSize = 12.sp)
                                }
                                OutlinedButton(
                                    onClick = { AttachmentFileHelper.shareAttachment(context, att) },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Gửi Zalo", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }

        // Bảng ma trận 4 mức độ & Bộ câu hỏi
        examResult?.let { res ->
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            "MA TRẬN ĐỀ THI: ${res.examTitle}",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleMedium,
                            color = Color(0xFF7E22CE)
                        )
                        Text(
                            "Môn: ${res.subject} • Khối lớp: ${res.gradeOrClass} • Thời lượng: ${res.durationMinutes}p • Tổng số câu: ${res.questions.size}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                        )

                        Divider()

                        Text("Phân bổ 4 mức độ nhận thức:", fontWeight = FontWeight.Bold)
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("1. Nhận biết: ${res.recognitionCount} câu", style = MaterialTheme.typography.bodySmall)
                            Text("2. Thông hiểu: ${res.understandingCount} câu", style = MaterialTheme.typography.bodySmall)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("3. Vận dụng: ${res.applicationCount} câu", style = MaterialTheme.typography.bodySmall)
                            Text("4. Vận dụng cao: ${res.highApplicationCount} câu", style = MaterialTheme.typography.bodySmall)
                        }

                        Divider()

                        Text("Danh sách câu hỏi & Đáp án:", fontWeight = FontWeight.Bold)
                        res.questions.forEach { q ->
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text("Câu ${q.questionNumber}:", fontWeight = FontWeight.Bold, color = Color(0xFF7E22CE))
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = Color(0xFFE9D5FF)
                                        ) {
                                            Text(
                                                q.level,
                                                fontSize = 11.sp,
                                                color = Color(0xFF6B21A8),
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                    Text(q.questionText, style = MaterialTheme.typography.bodySmall)
                                    q.options.forEach { opt ->
                                        Text(opt, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f))
                                    }
                                    Text("Đáp án: ${q.correctAnswer}", fontWeight = FontWeight.Bold, color = Color(0xFF059669), fontSize = 12.sp)
                                    Text("Giải thích: ${q.explanation}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun extractGradeNum(text: String): String {
    if (text.isBlank()) return ""
    val regex = Regex("""(?:\b|khối|lớp|k|grade)\s*(10|11|12|[1-9])(?=[a-zA-Z\s._\-/]|$)""", RegexOption.IGNORE_CASE)
    val m = regex.find(text)
    if (m != null) return m.groupValues[1]
    val m2 = Regex("""\b(10|11|12|[1-9])\b""").find(text)
    return m2?.groupValues?.get(1) ?: ""
}

private fun isDocGradeCompatible(doc: KnowledgeDocumentEntity, targetGrade: String): Boolean {
    if (targetGrade.isBlank()) return true
    if (doc.category == KnowledgeDocumentEntity.CAT_PHAP_QUY || doc.category == KnowledgeDocumentEntity.CAT_QUY_CHUAN_XUONG) {
        val targetLvl = doc.targetLevel.lowercase()
        if (targetLvl.contains("thcs") || targetLvl.contains("thpt") || targetLvl.contains("all") || targetLvl == "phổ thông") {
            return true
        }
    }
    val docGrade = extractGradeNum("${doc.targetLevel} ${doc.title}")
    if (docGrade.isBlank()) return true
    return docGrade == targetGrade
}
