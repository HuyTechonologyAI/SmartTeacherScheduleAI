package com.smartteacher.schedule.feature.schedule.components

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
import com.smartteacher.schedule.core.util.AttachmentFileHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Khối UI trực quan cho phép giáo viên Đính kèm Giáo án, Slide, Đề thi, Bảng điểm
 * hoặc Link Google Drive/Canva trực tiếp vào tiết dạy.
 */
@Composable
fun LessonAttachmentSection(
    modifier: Modifier = Modifier,
    attachments: List<LessonAttachmentEntity>,
    onAddAttachments: (List<LessonAttachmentEntity>) -> Unit,
    onRemoveAttachment: (LessonAttachmentEntity) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var isImporting by remember { mutableStateOf(false) }
    var showAddLinkDialog by remember { mutableStateOf(false) }

    // Bộ chọn tệp hệ thống (PDF, Word, PPTX, Excel, Images)
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
                        Toast.makeText(context, "Đã đính kèm ${newAttachments.size} tài liệu thành công!", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    // Dialog thêm Link Google Drive / Canva / Web
    if (showAddLinkDialog) {
        var linkUrl by remember { mutableStateOf("") }
        var linkTitle by remember { mutableStateOf("") }
        var linkError by remember { mutableStateOf<String?>(null) }

        AlertDialog(
            onDismissRequest = { showAddLinkDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Link, contentDescription = null, tint = Color(0xFF0284C7))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Thêm Link Tài Liệu / Google Drive", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        "Dán link tài liệu bài giảng online (Google Drive, OneDrive, Canva, Video bài giảng...)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )

                    OutlinedTextField(
                        value = linkTitle,
                        onValueChange = { linkTitle = it },
                        label = { Text("Tên tài liệu / Bài giảng") },
                        placeholder = { Text("Ví dụ: Slide bài 3 Google Drive") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = linkUrl,
                        onValueChange = {
                            linkUrl = it
                            linkError = null
                        },
                        label = { Text("Đường link (URL)") },
                        placeholder = { Text("https://drive.google.com/...") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = linkError != null,
                        supportingText = linkError?.let { { Text(it, color = MaterialTheme.colorScheme.error) } }
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (linkUrl.isBlank()) {
                            linkError = "Vui lòng nhập đường link!"
                            return@Button
                        }
                        val title = if (linkTitle.isNotBlank()) linkTitle.trim() else "Tài liệu Google Drive"
                        val newAttachment = LessonAttachmentEntity(
                            fileName = title,
                            webUrl = linkUrl.trim(),
                            fileExtension = "link",
                            attachmentType = LessonAttachmentEntity.TYPE_WEB_LINK
                        )
                        onAddAttachments(listOf(newAttachment))
                        showAddLinkDialog = false
                        Toast.makeText(context, "Đã thêm liên kết tài liệu!", Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Text("Lưu liên kết")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddLinkDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AttachFile,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Giáo án & Tài liệu đính kèm",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (attachments.isNotEmpty()) {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "${attachments.size} tài liệu",
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Đính kèm giáo án Word, slide PowerPoint, PDF bài tập hoặc link Google Drive để mở nhanh khi lên lớp.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        // Cho phép chọn tất cả các định dạng tài liệu văn phòng phổ biến
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
                    modifier = Modifier.weight(1f).height(38.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.FileUpload, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Đính kèm tệp", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }

                OutlinedButton(
                    onClick = { showAddLinkDialog = true },
                    modifier = Modifier.weight(1f).height(38.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.Link, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Link Drive / Web", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }

            if (isImporting) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                    Text("Đang sao chép tệp vào bộ nhớ an toàn...", style = MaterialTheme.typography.bodySmall)
                }
            }

            // Danh sách tài liệu đính kèm
            AnimatedVisibility(visible = attachments.isNotEmpty()) {
                Column(
                    modifier = Modifier.padding(top = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    attachments.forEach { item ->
                        AttachmentItemCard(
                            attachment = item,
                            onOpen = { AttachmentFileHelper.openAttachment(context, item) },
                            onDelete = { onRemoveAttachment(item) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AttachmentItemCard(
    attachment: LessonAttachmentEntity,
    onOpen: () -> Unit,
    onDelete: () -> Unit
) {
    val visualMeta = AttachmentFileHelper.getFileVisualMeta(attachment.fileExtension, attachment.isWebLink)
    val sizeText = AttachmentFileHelper.formatFileSize(attachment.fileSizeBytes)

    Surface(
        shape = RoundedCornerShape(10.dp),
        color = MaterialTheme.colorScheme.surface,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
            .clickable(onClick = onOpen)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(visualMeta.color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = visualMeta.icon,
                    contentDescription = null,
                    tint = visualMeta.color,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = attachment.fileName,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = visualMeta.color.copy(alpha = 0.1f)
                    ) {
                        Text(
                            text = visualMeta.typeBadge,
                            color = visualMeta.color,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                        )
                    }
                    if (sizeText.isNotBlank()) {
                        Text(
                            text = sizeText,
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                }
            }

            IconButton(
                onClick = onDelete,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Xóa tệp",
                    tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f),
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
