package com.smartteacher.schedule.feature.ai

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.smartteacher.schedule.core.ai.DefaultKnowledgeBase
import com.smartteacher.schedule.core.database.dao.KnowledgeDocumentDao
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.ui.text.style.TextOverflow
import com.smartteacher.schedule.core.util.KnowledgeFileHelper
import com.smartteacher.schedule.feature.schedule.components.DocumentReaderDialog
import com.smartteacher.schedule.core.database.entity.KnowledgeDocumentEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Màn hình Quản Lý Kho Dữ Liệu & Tư Liệu Sư Phạm Chuẩn:
 * Nơi lưu trữ căn cứ pháp quy (CV 5512, CV 2634, TT 22, ATLĐ) và tài liệu giáo viên nạp thêm.
 * AI sẽ bắt buộc đối chiếu các tài liệu này để sinh giáo án, chống ảo giác và bịa đặt thông tin.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIKnowledgeBaseScreen(
    knowledgeDao: KnowledgeDocumentDao
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val allDocuments by knowledgeDao.getAllDocumentsFlow().collectAsState(initial = emptyList())

    var selectedFilter by remember { mutableStateOf("ALL") }
    var searchQuery by remember { mutableStateOf("") }
    var showAddDialog by remember { mutableStateOf(false) }
    var viewingDocument by remember { mutableStateOf<KnowledgeDocumentEntity?>(null) }
    var documentToDelete by remember { mutableStateOf<KnowledgeDocumentEntity?>(null) }
    var documentToEdit by remember { mutableStateOf<KnowledgeDocumentEntity?>(null) }

    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            val docs = knowledgeDao.getAllDocumentsList()
            val blacklisted = docs.filter {
                it.code.contains("sgv_cn10_gdpt", ignoreCase = true) ||
                it.code.contains("sgv-cn10-gdpt", ignoreCase = true) ||
                it.code.contains("gt-cn10", ignoreCase = true) ||
                it.fileName.contains("giao_trinh_cn10", ignoreCase = true) ||
                it.title.contains("sgv - công nghệ 10 - công nghệ và đời sống", ignoreCase = true) ||
                it.title.contains("công nghệ 10 (chuẩn mô đun", ignoreCase = true)
            }
            for (b in blacklisted) {
                knowledgeDao.deleteDocument(b)
            }
        }
    }

    val filteredList = remember(allDocuments, selectedFilter, searchQuery) {
        allDocuments.filter { doc ->
            val matchFilter = when (selectedFilter) {
                "BUILT_IN" -> doc.isBuiltIn
                "CUSTOM" -> !doc.isBuiltIn
                "GIAO_TRINH" -> doc.category == KnowledgeDocumentEntity.CAT_GIAO_TRINH
                "DE_CUONG" -> doc.category == KnowledgeDocumentEntity.CAT_DE_CUONG
                "PHAP_QUY" -> doc.category == KnowledgeDocumentEntity.CAT_PHAP_QUY
                "ATLD" -> doc.category == KnowledgeDocumentEntity.CAT_QUY_CHUAN_XUONG
                else -> true
            }
            val matchSearch = if (searchQuery.isBlank()) true else {
                doc.title.contains(searchQuery, ignoreCase = true) ||
                        doc.code.contains(searchQuery, ignoreCase = true) ||
                        doc.subject.contains(searchQuery, ignoreCase = true)
            }
            matchFilter && matchSearch
        }
    }

    val activeCount = allDocuments.count { it.isActive }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Banner giải thích cơ chế Grounding & Anti-Hallucination
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.VerifiedUser,
                        contentDescription = null,
                        tint = Color(0xFF059669),
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Kho Tư Liệu Đối Chiếu Chuẩn (Anti-Hallucination)",
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF065F46),
                        style = MaterialTheme.typography.titleMedium
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "AI sẽ bắt buộc đối chiếu với các văn bản đang 'BẬT' dưới đây để soạn Kế hoạch bài dạy & Đề thi. Tuyệt đối không tự bịa đặt điều luật, thông số kỹ thuật hay kiến thức ngoài nguồn chuẩn.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF047857)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Đang kích hoạt: $activeCount / ${allDocuments.size} tài liệu",
                        fontWeight = FontWeight.SemiBold,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF065F46)
                    )
                    TextButton(
                        onClick = {
                            coroutineScope.launch {
                                val defaults = DefaultKnowledgeBase.getDefaultBuiltInDocuments()
                                knowledgeDao.insertDocuments(defaults)
                                Toast.makeText(context, "Đã khôi phục các văn bản pháp quy gốc!", Toast.LENGTH_SHORT).show()
                            }
                        }
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Nạp lại mẫu gốc", fontSize = 12.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search and Add Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Tìm theo tên, mã số, môn học...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = if (searchQuery.isNotBlank()) {
                    {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = null)
                        }
                    }
                } else null,
                singleLine = true,
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp)
            )

            Button(
                onClick = { showAddDialog = true },
                shape = RoundedCornerShape(12.dp),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 12.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("Thêm mới")
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Filter chips
        ScrollableTabRow(
            selectedTabIndex = when (selectedFilter) {
                "ALL" -> 0
                "GIAO_TRINH" -> 1
                "DE_CUONG" -> 2
                "PHAP_QUY" -> 3
                "ATLD" -> 4
                "CUSTOM" -> 5
                else -> 0
            },
            edgePadding = 4.dp,
            divider = {}
        ) {
            Tab(selected = selectedFilter == "ALL", onClick = { selectedFilter = "ALL" }, text = { Text("Tất cả (${allDocuments.size})") })
            Tab(selected = selectedFilter == "GIAO_TRINH", onClick = { selectedFilter = "GIAO_TRINH" }, text = { Text("Giáo trình (${allDocuments.count { it.category == KnowledgeDocumentEntity.CAT_GIAO_TRINH }})") })
            Tab(selected = selectedFilter == "DE_CUONG", onClick = { selectedFilter = "DE_CUONG" }, text = { Text("Đề cương (${allDocuments.count { it.category == KnowledgeDocumentEntity.CAT_DE_CUONG }})") })
            Tab(selected = selectedFilter == "PHAP_QUY", onClick = { selectedFilter = "PHAP_QUY" }, text = { Text("Pháp quy BGDĐT & GDNN") })
            Tab(selected = selectedFilter == "ATLD", onClick = { selectedFilter = "ATLD" }, text = { Text("ATLĐ & 5S") })
            Tab(selected = selectedFilter == "CUSTOM", onClick = { selectedFilter = "CUSTOM" }, text = { Text("Tài liệu tự nạp (${allDocuments.count { !it.isBuiltIn }})") })
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Document list
        if (filteredList.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.FolderOpen,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Không tìm thấy tài liệu phù hợp",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredList, key = { it.id }) { doc ->
                    KnowledgeDocumentCard(
                        doc = doc,
                        onToggleActive = { isAct ->
                            coroutineScope.launch {
                                knowledgeDao.setDocumentActive(doc.id, isAct)
                            }
                        },
                        onViewContent = {
                            viewingDocument = doc
                        },
                        onEdit = {
                            documentToEdit = doc
                        },
                        onDelete = {
                            documentToDelete = doc
                        }
                    )
                }
            }
        }
    }

    // Dialog Xem Trước Nội Dung Tài Liệu (Hỗ trợ PDF trực quan, Word HTML, Zoom, Copy, Chia sẻ)
    viewingDocument?.let { doc ->
        DocumentReaderDialog(
            title = doc.title,
            filePath = doc.filePath.takeIf { it.isNotBlank() },
            textContent = doc.content,
            fileExtension = doc.fileExtension.takeIf { it.isNotBlank() },
            onDismiss = { viewingDocument = null }
        )
    }

    // Dialog Xác nhận Xóa
    documentToDelete?.let { doc ->
        AlertDialog(
            onDismissRequest = { documentToDelete = null },
            icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
            title = { Text("Xác nhận xóa tài liệu") },
            text = { Text("Thầy/Cô có chắc chắn muốn xóa tài liệu '${doc.title}' khỏi cơ sở dữ liệu đối chiếu không?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        coroutineScope.launch {
                            knowledgeDao.deleteCustomDocumentById(doc.id)
                            documentToDelete = null
                            Toast.makeText(context, "Đã xóa tài liệu!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Xóa vĩnh viễn")
                }
            },
            dismissButton = {
                TextButton(onClick = { documentToDelete = null }) {
                    Text("Hủy")
                }
            }
        )
    }

    // Dialog Thêm Tài Liệu Mới
    if (showAddDialog) {
        AddKnowledgeDocumentDialog(
            onDismiss = { showAddDialog = false },
            onSave = { newDoc ->
                coroutineScope.launch {
                    knowledgeDao.insertDocument(newDoc)
                    selectedFilter = "ALL"
                    searchQuery = ""
                    showAddDialog = false
                    Toast.makeText(context, "Đã lưu tài liệu '${newDoc.title}' vào kho tư liệu chuẩn!", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }

    // Dialog Chỉnh Sửa / Bổ Sung Tài Liệu
    documentToEdit?.let { doc ->
        EditKnowledgeDocumentDialog(
            doc = doc,
            onDismiss = { documentToEdit = null },
            onSave = { updatedDoc ->
                coroutineScope.launch {
                    knowledgeDao.updateDocument(updatedDoc)
                    if (viewingDocument?.id == updatedDoc.id) {
                        viewingDocument = updatedDoc
                    }
                    documentToEdit = null
                    Toast.makeText(context, "Đã cập nhật tài liệu '${updatedDoc.title}'!", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }
}

@Composable
fun KnowledgeDocumentCard(
    doc: KnowledgeDocumentEntity,
    onToggleActive: (Boolean) -> Unit,
    onViewContent: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (doc.isActive) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (doc.isActive) 2.dp else 0.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (doc.isBuiltIn) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFFDCFCE7),
                                modifier = Modifier.padding(end = 6.dp)
                            ) {
                                Text(
                                    text = "🏛️ PHÁP QUY",
                                    color = Color(0xFF166534),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        } else {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = Color(0xFFE0E7FF),
                                modifier = Modifier.padding(end = 6.dp)
                            ) {
                                Text(
                                    text = "👤 GV NẠP THÊM",
                                    color = Color(0xFF3730A3),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = doc.code,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = doc.title,
                        fontWeight = FontWeight.SemiBold,
                        style = MaterialTheme.typography.titleSmall,
                        color = if (doc.isActive) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Môn: ${doc.subject}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "•",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Cấp: ${doc.targetLevel}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Switch Bật/Tắt đối chiếu RAG
                Column(horizontalAlignment = Alignment.End) {
                    Switch(
                        checked = doc.isActive,
                        onCheckedChange = onToggleActive
                    )
                    Text(
                        text = if (doc.isActive) "Đang dùng" else "Tạm tắt",
                        fontSize = 11.sp,
                        color = if (doc.isActive) Color(0xFF16A34A) else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (doc.fileName.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Surface(
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.45f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            onViewContent()
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = when (doc.fileExtension.lowercase()) {
                                "docx", "doc" -> Icons.Default.Description
                                "pdf" -> Icons.Default.PictureAsPdf
                                else -> Icons.Default.AttachFile
                            },
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "${doc.fileName} (${KnowledgeFileHelper.formatFileSize(doc.fileSizeBytes)})",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.primary,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f)
                        )
                        Icon(
                            imageVector = Icons.Default.OpenInNew,
                            contentDescription = "Mở tệp gốc",
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons: Xem trước, Tải Word, Sửa, Xóa
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    TextButton(
                        onClick = onViewContent,
                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(3.dp))
                        Text("Xem trước", fontSize = 11.sp)
                    }

                    if (doc.fileName.isNotBlank()) {
                        TextButton(
                            onClick = {
                                KnowledgeFileHelper.shareOrSaveOriginalFile(context, doc.filePath, doc.fileName)
                            },
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(15.dp))
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Tải .${doc.fileExtension.ifBlank { "FILE" }.uppercase()}", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    } else {
                        TextButton(
                            onClick = {
                                val docFile = KnowledgeFileHelper.exportDocumentToDoc(
                                    context = context,
                                    title = doc.title,
                                    code = doc.code,
                                    category = doc.category,
                                    subject = doc.subject,
                                    targetLevel = doc.targetLevel,
                                    content = doc.content
                                )
                                if (docFile != null) {
                                    KnowledgeFileHelper.openOrShareFile(context, docFile, "application/msword", doc.title)
                                } else {
                                    Toast.makeText(context, "Không thể xuất file Word!", Toast.LENGTH_SHORT).show()
                                }
                            },
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(15.dp))
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Tải Word", fontSize = 11.sp)
                        }
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    IconButton(
                        onClick = onEdit,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = "Sửa / Bổ sung",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    if (!doc.isBuiltIn) {
                        IconButton(
                            onClick = onDelete,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                Icons.Default.Delete,
                                contentDescription = "Xóa",
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AddKnowledgeDocumentDialog(
    onDismiss: () -> Unit,
    onSave: (KnowledgeDocumentEntity) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var title by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var category by remember { mutableStateOf<String>(KnowledgeDocumentEntity.CAT_GIAO_TRINH) }
    var subject by remember { mutableStateOf("ALL") }
    var targetLevel by remember { mutableStateOf("ALL") }
    var content by remember { mutableStateOf("") }

    // Thông tin file đính kèm
    var isExtracting by remember { mutableStateOf(false) }
    var attachedFileName by remember { mutableStateOf("") }
    var attachedFilePath by remember { mutableStateOf("") }
    var attachedFileSize by remember { mutableStateOf(0L) }
    var attachedFileExtension by remember { mutableStateOf("") }

    // Trình chọn tệp hệ thống (Word, PDF, Text...)
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            isExtracting = true
            coroutineScope.launch(Dispatchers.IO) {
                val fileInfo = KnowledgeFileHelper.copyAndExtractKnowledgeFile(context, uri)
                withContext(Dispatchers.Main) {
                    isExtracting = false
                    if (fileInfo != null) {
                        attachedFileName = fileInfo.fileName
                        attachedFilePath = fileInfo.localFilePath
                        attachedFileSize = fileInfo.fileSizeBytes
                        attachedFileExtension = fileInfo.fileExtension
                        content = fileInfo.extractedText
                        if (title.isBlank()) {
                            title = fileInfo.fileName.substringBeforeLast(".")
                        }
                        if (code.isBlank()) {
                            code = "DOC_" + fileInfo.fileName.take(8).replace("[^a-zA-Z0-9]".toRegex(), "_").uppercase()
                        }
                        Toast.makeText(context, "Đã đính kèm và trích xuất tài liệu thành công!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(context, "Không thể đọc tệp tài liệu này!", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.92f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.AttachFile,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Thêm Tư Liệu Đối Chiếu AI",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleMedium
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = null)
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Khu vực đính kèm file tài liệu
                    if (attachedFileName.isBlank()) {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(enabled = !isExtracting) {
                                    filePickerLauncher.launch(
                                        arrayOf(
                                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                            "application/msword",
                                            "application/pdf",
                                            "text/plain",
                                            "text/markdown",
                                            "text/*",
                                            "*/*"
                                        )
                                    )
                                }
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                if (isExtracting) {
                                    CircularProgressIndicator(modifier = Modifier.size(28.dp), strokeWidth = 2.5.dp)
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(
                                        "Đang đọc và trích xuất nội dung văn bản...",
                                        fontWeight = FontWeight.SemiBold,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                } else {
                                    Icon(
                                        Icons.Default.CloudUpload,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(36.dp)
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        "BẤM ĐỂ ĐÍNH KÈM TỆP TÀI LIỆU",
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        "Hỗ trợ Word (.docx, .doc), PDF (.pdf), Text (.txt, .md)...",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        "Hệ thống tự động trích xuất nội dung — Không cần dán chữ thủ công",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Color(0xFF059669),
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    } else {
                        // Thẻ hiển thị file đã đính kèm thành công
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = when (attachedFileExtension) {
                                        "docx", "doc" -> Icons.Default.Description
                                        "pdf" -> Icons.Default.PictureAsPdf
                                        else -> Icons.Default.InsertDriveFile
                                    },
                                    contentDescription = null,
                                    tint = Color(0xFF059669),
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = attachedFileName,
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = Color(0xFF065F46),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "Kích thước: ${KnowledgeFileHelper.formatFileSize(attachedFileSize)} • Đã nạp ${content.length} ký tự",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF047857)
                                    )
                                }
                                TextButton(
                                    onClick = {
                                        filePickerLauncher.launch(arrayOf("*/*"))
                                    }
                                ) {
                                    Text("Đổi file", fontSize = 12.sp)
                                }
                                IconButton(
                                    onClick = {
                                        attachedFileName = ""
                                        attachedFilePath = ""
                                        attachedFileSize = 0L
                                        attachedFileExtension = ""
                                        content = ""
                                    },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Xóa tệp",
                                        tint = Color(0xFFDC2626),
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }

                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Tên tài liệu / Văn bản / Giáo trình *") },
                        placeholder = { Text("Ví dụ: Đề cương chi tiết môn Tiện CNC Lớp 11") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = code,
                            onValueChange = { code = it },
                            label = { Text("Mã hiệu (tùy chọn)") },
                            placeholder = { Text("DC-TIEN-11") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = subject,
                            onValueChange = { subject = it },
                            label = { Text("Môn học áp dụng") },
                            placeholder = { Text("ALL hoặc Toán, Tiện...") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = targetLevel,
                            onValueChange = { targetLevel = it },
                            label = { Text("Cấp học / Trình độ") },
                            placeholder = { Text("ALL, THPT, Nghề...") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = category,
                            onValueChange = { category = it },
                            label = { Text("Phân loại") },
                            placeholder = { Text("GIAO_TRINH, DE_CUONG...") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    OutlinedTextField(
                        value = content,
                        onValueChange = { content = it },
                        label = { Text(if (attachedFileName.isNotBlank()) "Nội dung trích xuất từ tệp (Sẵn sàng cho AI)" else "Nội dung văn bản (hoặc đính kèm file ở trên)") },
                        placeholder = { Text("Nội dung được tự động điền khi Thầy/Cô đính kèm file ở trên, hoặc có thể dán/chỉnh sửa trực tiếp tại đây...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp),
                        maxLines = 15
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Hủy")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (title.isBlank() || (content.isBlank() && attachedFilePath.isBlank())) return@Button
                            val generatedCode = if (code.isNotBlank()) code.trim() else "DOC_${System.currentTimeMillis()}"
                            val newDoc = KnowledgeDocumentEntity(
                                code = generatedCode,
                                title = title.trim(),
                                category = category.trim(),
                                subject = subject.trim(),
                                targetLevel = targetLevel.trim(),
                                content = content.trim().ifBlank { "Tài liệu đính kèm: $attachedFileName" },
                                isBuiltIn = false,
                                isActive = true,
                                fileName = attachedFileName,
                                filePath = attachedFilePath,
                                fileSizeBytes = attachedFileSize,
                                fileExtension = attachedFileExtension
                            )
                            onSave(newDoc)
                        },
                        enabled = title.isNotBlank() && (content.isNotBlank() || attachedFilePath.isNotBlank())
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Lưu Vào Kho Tư Liệu")
                    }
                }
            }
        }
    }
}

@Composable
fun EditKnowledgeDocumentDialog(
    doc: KnowledgeDocumentEntity,
    onDismiss: () -> Unit,
    onSave: (KnowledgeDocumentEntity) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var title by remember { mutableStateOf(doc.title) }
    var code by remember { mutableStateOf(doc.code) }
    var category by remember { mutableStateOf(doc.category) }
    var subject by remember { mutableStateOf(doc.subject) }
    var targetLevel by remember { mutableStateOf(doc.targetLevel) }
    var content by remember { mutableStateOf(doc.content) }

    // Thông tin file đính kèm
    var isExtracting by remember { mutableStateOf(false) }
    var attachedFileName by remember { mutableStateOf(doc.fileName) }
    var attachedFilePath by remember { mutableStateOf(doc.filePath) }
    var attachedFileSize by remember { mutableStateOf(doc.fileSizeBytes) }
    var attachedFileExtension by remember { mutableStateOf(doc.fileExtension) }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            isExtracting = true
            coroutineScope.launch(Dispatchers.IO) {
                val fileInfo = KnowledgeFileHelper.copyAndExtractKnowledgeFile(context, uri)
                withContext(Dispatchers.Main) {
                    isExtracting = false
                    if (fileInfo != null) {
                        attachedFileName = fileInfo.fileName
                        attachedFilePath = fileInfo.localFilePath
                        attachedFileSize = fileInfo.fileSizeBytes
                        attachedFileExtension = fileInfo.fileExtension
                        content = fileInfo.extractedText
                        Toast.makeText(context, "Đã đính kèm tệp mới thành công!", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(context, "Không thể đọc tệp tài liệu này!", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.92f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                "Chỉnh Sửa / Bổ Sung Tư Liệu",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleMedium
                            )
                            if (doc.isBuiltIn) {
                                Text(
                                    "🏛️ Cập nhật văn bản gốc",
                                    fontSize = 11.sp,
                                    color = Color(0xFF16A34A),
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = null)
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Đính kèm / Thay đổi tệp
                    if (attachedFileName.isBlank()) {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(enabled = !isExtracting) {
                                    filePickerLauncher.launch(
                                        arrayOf(
                                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                            "application/msword",
                                            "application/pdf",
                                            "text/plain",
                                            "text/markdown",
                                            "text/*",
                                            "*/*"
                                        )
                                    )
                                }
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                if (isExtracting) {
                                    CircularProgressIndicator(modifier = Modifier.size(26.dp), strokeWidth = 2.dp)
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text("Đang đọc tệp mới...", style = MaterialTheme.typography.bodySmall)
                                } else {
                                    Icon(
                                        Icons.Default.AttachFile,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(30.dp)
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        "BẤM ĐỂ ĐÍNH KÈM TỆP VĂN BẢN (WORD, PDF, TXT)",
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.labelMedium,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                        }
                    } else {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = when (attachedFileExtension) {
                                        "docx", "doc" -> Icons.Default.Description
                                        "pdf" -> Icons.Default.PictureAsPdf
                                        else -> Icons.Default.InsertDriveFile
                                    },
                                    contentDescription = null,
                                    tint = Color(0xFF059669),
                                    modifier = Modifier.size(30.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = attachedFileName,
                                        fontWeight = FontWeight.Bold,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = Color(0xFF065F46),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "${KnowledgeFileHelper.formatFileSize(attachedFileSize)} • ${content.length} ký tự",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF047857)
                                    )
                                }
                                TextButton(
                                    onClick = {
                                        filePickerLauncher.launch(arrayOf("*/*"))
                                    }
                                ) {
                                    Text("Đổi file", fontSize = 12.sp)
                                }
                                IconButton(
                                    onClick = {
                                        attachedFileName = ""
                                        attachedFilePath = ""
                                        attachedFileSize = 0L
                                        attachedFileExtension = ""
                                    },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Close,
                                        contentDescription = "Gỡ tệp",
                                        tint = Color(0xFFDC2626),
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }

                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Tên tài liệu / Văn bản / Giáo trình *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = code,
                            onValueChange = { code = it },
                            label = { Text("Mã hiệu") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = subject,
                            onValueChange = { subject = it },
                            label = { Text("Môn học áp dụng") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = targetLevel,
                            onValueChange = { targetLevel = it },
                            label = { Text("Cấp học / Trình độ") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )

                        OutlinedTextField(
                            value = category,
                            onValueChange = { category = it },
                            label = { Text("Phân loại") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    OutlinedTextField(
                        value = content,
                        onValueChange = { content = it },
                        label = { Text("Nội dung chi tiết (Dành cho AI đối chiếu và xuất văn bản)") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp),
                        maxLines = 15
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Hủy")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (title.isBlank() || (content.isBlank() && attachedFilePath.isBlank())) return@Button
                            val updatedDoc = doc.copy(
                                title = title.trim(),
                                code = if (code.isNotBlank()) code.trim() else doc.code,
                                category = category.trim(),
                                subject = subject.trim(),
                                targetLevel = targetLevel.trim(),
                                content = content.trim().ifBlank { "Tài liệu đính kèm: $attachedFileName" },
                                fileName = attachedFileName,
                                filePath = attachedFilePath,
                                fileSizeBytes = attachedFileSize,
                                fileExtension = attachedFileExtension,
                                updatedAt = System.currentTimeMillis()
                            )
                            onSave(updatedDoc)
                        },
                        enabled = title.isNotBlank() && (content.isNotBlank() || attachedFilePath.isNotBlank())
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Lưu Cập Nhật")
                    }
                }
            }
        }
    }
}
