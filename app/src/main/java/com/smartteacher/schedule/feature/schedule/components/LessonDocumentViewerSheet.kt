package com.smartteacher.schedule.feature.schedule.components

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
import com.smartteacher.schedule.core.util.AttachmentFileHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * BottomSheet hiển thị danh sách giáo án và tài liệu của tiết học,
 * cho phép Thầy/Cô mở đọc 1 chạm, chia sẻ nhanh qua Zalo cho sinh viên,
 * hoặc đính kèm thêm tài liệu mới ngay tại chỗ.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonDocumentViewerSheet(
    event: CalendarEventEntity,
    attachments: List<LessonAttachmentEntity>,
    onDismiss: () -> Unit,
    onAddAttachments: (List<LessonAttachmentEntity>) -> Unit,
    onDeleteAttachment: (LessonAttachmentEntity) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var isImporting by remember { mutableStateOf(false) }
    var showAddLinkDialog by remember { mutableStateOf(false) }
    var itemToDelete by remember { mutableStateOf<LessonAttachmentEntity?>(null) }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments()
    ) { uris: List<Uri> ->
        if (uris.isNotEmpty()) {
            isImporting = true
            coroutineScope.launch(Dispatchers.IO) {
                val newAttachments = mutableListOf<LessonAttachmentEntity>()
                uris.forEach { uri ->
                    val info = AttachmentFileHelper.copyUriToInternalStorage(context, uri)
                    if (info != null) {
                        newAttachments.add(
                            LessonAttachmentEntity(
                                eventId = event.id,
                                teachingScheduleId = event.teachingScheduleId,
                                fileName = info.fileName,
                                filePath = info.localFilePath,
                                mimeType = info.mimeType,
                                fileSizeBytes = info.fileSize,
                                fileExtension = info.extension,
                                attachmentType = LessonAttachmentEntity.TYPE_FILE
                            )
                        )
                    }
                }
                withContext(Dispatchers.Main) {
                    isImporting = false
                    if (newAttachments.isNotEmpty()) {
                        onAddAttachments(newAttachments)
                        Toast.makeText(context, "Đã thêm ${newAttachments.size} tài liệu vào tiết dạy!", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    if (showAddLinkDialog) {
        var linkUrl by remember { mutableStateOf("") }
        var linkTitle by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddLinkDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Link, contentDescription = null, tint = Color(0xFF0284C7))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Thêm Link Google Drive / Canva", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = linkTitle,
                        onValueChange = { linkTitle = it },
                        label = { Text("Tên tài liệu / Bài giảng") },
                        placeholder = { Text("Slide bài giảng Google Drive") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = linkUrl,
                        onValueChange = { linkUrl = it },
                        label = { Text("Đường link") },
                        placeholder = { Text("https://drive.google.com/...") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (linkUrl.isNotBlank()) {
                            val title = if (linkTitle.isNotBlank()) linkTitle.trim() else "Tài liệu Google Drive"
                            val newAttachment = LessonAttachmentEntity(
                                eventId = event.id,
                                teachingScheduleId = event.teachingScheduleId,
                                fileName = title,
                                webUrl = linkUrl.trim(),
                                fileExtension = "link",
                                attachmentType = LessonAttachmentEntity.TYPE_WEB_LINK
                            )
                            onAddAttachments(listOf(newAttachment))
                            showAddLinkDialog = false
                            Toast.makeText(context, "Đã thêm link tài liệu!", Toast.LENGTH_SHORT).show()
                        }
                    }
                ) {
                    Text("Lưu")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddLinkDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }

    if (itemToDelete != null) {
        val item = itemToDelete!!
        AlertDialog(
            onDismissRequest = { itemToDelete = null },
            title = { Text("Xác nhận gỡ tài liệu", fontWeight = FontWeight.Bold) },
            text = { Text("Thầy/Cô có chắc muốn gỡ tài liệu '${item.fileName}' khỏi tiết học này không?") },
            confirmButton = {
                Button(
                    onClick = {
                        itemToDelete = null
                        onDeleteAttachment(item)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Gỡ tài liệu", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { itemToDelete = null }) {
                    Text("Hủy")
                }
            }
        )
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.MenuBook,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = event.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                    Text(
                        text = "${event.startTime} - ${event.endTime} • Phòng ${if (event.room.isNotBlank()) event.room else "Chưa xếp"} • Lớp ${event.className}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Text(
                        text = "${attachments.size} tài liệu",
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.labelMedium,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Buttons to Add More Documents
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        filePickerLauncher.launch(
                            arrayOf(
                                "application/pdf",
                                "application/msword",
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                "application/vnd.ms-powerpoint",
                                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                "application/vnd.ms-excel",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                "image/*",
                                "*/*"
                            )
                        )
                    },
                    modifier = Modifier.weight(1f).height(40.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Đính kèm tệp", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }

                OutlinedButton(
                    onClick = { showAddLinkDialog = true },
                    modifier = Modifier.weight(1f).height(40.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Link, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Link Drive / Web", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                }
            }

            if (isImporting) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                    Text("Đang lưu tệp vào máy...", style = MaterialTheme.typography.bodySmall)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Document List
            if (attachments.isEmpty()) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.FolderOpen,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Chưa có giáo án hoặc tài liệu nào",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Text(
                            text = "Bấm nút 'Đính kèm tệp' ở trên để thêm giáo án Word, Slide PowerPoint hoặc link Google Drive cho tiết dạy này.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(attachments, key = { it.id }) { item ->
                        val visualMeta = AttachmentFileHelper.getFileVisualMeta(item.fileExtension, item.isWebLink)
                        val sizeText = AttachmentFileHelper.formatFileSize(item.fileSizeBytes)

                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(42.dp)
                                            .clip(CircleShape)
                                            .background(visualMeta.color.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = visualMeta.icon,
                                            contentDescription = null,
                                            tint = visualMeta.color,
                                            modifier = Modifier.size(22.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = item.fileName,
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = FontWeight.Bold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                                            modifier = Modifier.padding(top = 2.dp)
                                        ) {
                                            Surface(
                                                shape = RoundedCornerShape(4.dp),
                                                color = visualMeta.color.copy(alpha = 0.12f)
                                            ) {
                                                Text(
                                                    text = visualMeta.typeBadge,
                                                    color = visualMeta.color,
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp)
                                                )
                                            }
                                            if (sizeText.isNotBlank()) {
                                                Text(
                                                    text = sizeText,
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                                )
                                            }
                                        }
                                    }

                                    IconButton(
                                        onClick = { itemToDelete = item },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.DeleteOutline,
                                            contentDescription = "Gỡ tệp",
                                            tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f),
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                // Quick Action Buttons (Open + Share)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Button(
                                        onClick = { AttachmentFileHelper.openAttachment(context, item) },
                                        modifier = Modifier.weight(1f).height(36.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = visualMeta.color),
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(if (item.isWebLink) "Mở Link Drive" else "Mở tài liệu đọc ngay", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    }

                                    OutlinedButton(
                                        onClick = { AttachmentFileHelper.shareAttachment(context, item) },
                                        modifier = Modifier.height(36.dp),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                        shape = RoundedCornerShape(10.dp)
                                    ) {
                                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Chia sẻ Zalo", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
