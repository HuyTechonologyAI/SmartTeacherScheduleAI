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
import com.smartteacher.schedule.core.database.entity.KnowledgeDocumentEntity
import kotlinx.coroutines.launch

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

    val filteredList = remember(allDocuments, selectedFilter, searchQuery) {
        allDocuments.filter { doc ->
            val matchFilter = when (selectedFilter) {
                "BUILT_IN" -> doc.isBuiltIn
                "CUSTOM" -> !doc.isBuiltIn
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
                "PHAP_QUY" -> 1
                "ATLD" -> 2
                "CUSTOM" -> 3
                else -> 0
            },
            edgePadding = 4.dp,
            divider = {}
        ) {
            Tab(selected = selectedFilter == "ALL", onClick = { selectedFilter = "ALL" }, text = { Text("Tất cả (${allDocuments.size})") })
            Tab(selected = selectedFilter == "PHAP_QUY", onClick = { selectedFilter = "PHAP_QUY" }, text = { Text("Pháp quy (CV 5512/2634/TT22)") })
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
                        onDelete = {
                            documentToDelete = doc
                        }
                    )
                }
            }
        }
    }

    // Dialog Xem Nội Dung Chi Tiết
    viewingDocument?.let { doc ->
        Dialog(onDismissRequest = { viewingDocument = null }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.85f)
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
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = doc.title,
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                text = "Mã: ${doc.code} • Phân loại: ${doc.category}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        IconButton(onClick = { viewingDocument = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Đóng")
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = doc.content,
                            style = MaterialTheme.typography.bodyMedium,
                            lineHeight = 22.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        Button(onClick = { viewingDocument = null }) {
                            Text("Đã hiểu")
                        }
                    }
                }
            }
        }
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
                    showAddDialog = false
                    Toast.makeText(context, "Đã lưu tài liệu vào kho tư liệu chuẩn!", Toast.LENGTH_SHORT).show()
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
    onDelete: () -> Unit
) {
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

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = onViewContent,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Đọc tài liệu (${doc.content.length} ký tự)", fontSize = 12.sp)
                }

                if (!doc.isBuiltIn) {
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Xóa",
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(18.dp)
                        )
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
    var title by remember { mutableStateOf("") }
    var code by remember { mutableStateOf("") }
    var category by remember { mutableStateOf<String>(KnowledgeDocumentEntity.CAT_GIAO_TRINH) }
    var subject by remember { mutableStateOf("ALL") }
    var targetLevel by remember { mutableStateOf("ALL") }
    var content by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
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
                    Text(
                        "➕ Thêm Tư Liệu Đối Chiếu AI",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = null)
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
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
                            placeholder = { Text("ALL hoặc Toán, Lý...") },
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
                            placeholder = { Text("ALL, THPT, Trung cấp...") },
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
                        label = { Text("Nội dung văn bản / Chuẩn kiến thức kỹ năng *") },
                        placeholder = { Text("Dán toàn bộ nội dung giáo trình, chuẩn kiến thức, quy trình hoặc điều luật mà Thầy/Cô muốn AI căn cứ vào đây để sinh giáo án...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        maxLines = 20
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
                            if (title.isBlank() || content.isBlank()) return@Button
                            val generatedCode = code.ifBlank { "DOC_${System.currentTimeMillis() % 10000}" }
                            val newDoc = KnowledgeDocumentEntity(
                                code = generatedCode,
                                title = title.trim(),
                                category = category.trim(),
                                subject = subject.trim(),
                                targetLevel = targetLevel.trim(),
                                content = content.trim(),
                                isBuiltIn = false,
                                isActive = true
                            )
                            onSave(newDoc)
                        },
                        enabled = title.isNotBlank() && content.isNotBlank()
                    ) {
                        Text("Lưu Vào Kho Tư Liệu")
                    }
                }
            }
        }
    }
}
