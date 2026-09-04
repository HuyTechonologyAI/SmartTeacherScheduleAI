package com.smartteacher.schedule.core.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.core.content.FileProvider
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.UUID

object AttachmentFileHelper {

    private const val ATTACHMENT_DIR = "lesson_attachments"

    data class PickedFileInfo(
        val fileName: String,
        val localFilePath: String,
        val mimeType: String,
        val fileSize: Long,
        val extension: String
    )

    /**
     * Sao chép tệp tin từ Content URI của Android Storage vào thư mục nội bộ an toàn của app.
     * Đảm bảo mở được 100% offline và không bị mất khi tệp gốc trong Download bị xóa.
     */
    fun copyUriToInternalStorage(context: Context, sourceUri: Uri): PickedFileInfo? {
        return try {
            val contentResolver = context.contentResolver
            var displayName = "tai_lieu_${System.currentTimeMillis()}"
            var fileSize = 0L

            contentResolver.query(sourceUri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                if (cursor.moveToFirst()) {
                    if (nameIndex != -1) displayName = cursor.getString(nameIndex) ?: displayName
                    if (sizeIndex != -1) fileSize = cursor.getLong(sizeIndex)
                }
            }

            val mimeType = contentResolver.getType(sourceUri) ?: getMimeTypeFromExtension(displayName)
            val extension = getExtensionFromFileName(displayName)

            // Thư mục lưu trữ nội bộ
            val storageDir = File(context.filesDir, ATTACHMENT_DIR)
            if (!storageDir.exists()) {
                storageDir.mkdirs()
            }

            // Tạo tên file duy nhất tránh trùng lặp
            val sanitizedName = displayName.replace("[^a-zA-Z0-9._-]".toRegex(), "_")
            val targetFile = File(storageDir, "${UUID.randomUUID()}_$sanitizedName")

            contentResolver.openInputStream(sourceUri)?.use { input ->
                FileOutputStream(targetFile).use { output ->
                    input.copyTo(output)
                }
            }

            if (fileSize <= 0L && targetFile.exists()) {
                fileSize = targetFile.length()
            }

            PickedFileInfo(
                fileName = displayName,
                localFilePath = targetFile.absolutePath,
                mimeType = mimeType,
                fileSize = fileSize,
                extension = extension
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Mở tài liệu bằng ứng dụng đọc chuyên dụng trên điện thoại (WPS Office, Word, Drive, PDF viewer...)
     */
    fun openAttachment(context: Context, attachment: LessonAttachmentEntity) {
        if (attachment.isWebLink) {
            openWebUrl(context, attachment.webUrl)
            return
        }

        val file = File(attachment.filePath)
        if (!file.exists()) {
            Toast.makeText(context, "Không tìm thấy tệp tài liệu cục bộ trên máy!", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val authority = "${context.packageName}.fileprovider"
            val contentUri = FileProvider.getUriForFile(context, authority, file)

            val mimeType = if (attachment.mimeType.isNotBlank()) attachment.mimeType else getMimeTypeFromExtension(file.name)

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(
                context,
                "Không có ứng dụng đọc định dạng này. Thầy/Cô vui lòng cài đặt WPS Office hoặc Google Docs/Drive!",
                Toast.LENGTH_LONG
            ).show()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Lỗi khi mở tài liệu: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Chia sẻ giáo án / tài liệu trực tiếp qua Zalo, Messenger, Gmail
     */
    fun shareAttachment(context: Context, attachment: LessonAttachmentEntity) {
        if (attachment.isWebLink) {
            val sendIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, "Tài liệu học tập: ${attachment.fileName}")
                putExtra(Intent.EXTRA_TEXT, "${attachment.fileName}\nĐường link: ${attachment.webUrl}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            val chooser = Intent.createChooser(sendIntent, "Chia sẻ đường link bài giảng qua")
            chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(chooser)
            return
        }

        val file = File(attachment.filePath)
        if (!file.exists()) {
            Toast.makeText(context, "Không tìm thấy tệp để chia sẻ!", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val authority = "${context.packageName}.fileprovider"
            val contentUri = FileProvider.getUriForFile(context, authority, file)
            val mimeType = if (attachment.mimeType.isNotBlank()) attachment.mimeType else getMimeTypeFromExtension(file.name)

            val sendIntent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, contentUri)
                putExtra(Intent.EXTRA_SUBJECT, attachment.fileName)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            val chooser = Intent.createChooser(sendIntent, "Chia sẻ giáo án/tài liệu qua")
            chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(chooser)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "Lỗi khi chia sẻ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openWebUrl(context: Context, url: String) {
        try {
            var validUrl = url.trim()
            if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
                validUrl = "https://$validUrl"
            }
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(validUrl)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Không thể mở liên kết: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Định dạng kích thước tệp đẹp mắt (2.4 MB, 500 KB)
     */
    fun formatFileSize(bytes: Long): String {
        if (bytes <= 0) return ""
        val kb = bytes / 1024.0
        val mb = kb / 1024.0
        val gb = mb / 1024.0
        return when {
            gb >= 1.0 -> String.format("%.1f GB", gb)
            mb >= 1.0 -> String.format("%.1f MB", mb)
            kb >= 1.0 -> String.format("%.1f KB", kb)
            else -> "$bytes B"
        }
    }

    fun getExtensionFromFileName(fileName: String): String {
        val lastDot = fileName.lastIndexOf('.')
        return if (lastDot != -1 && lastDot < fileName.length - 1) {
            fileName.substring(lastDot + 1).lowercase()
        } else ""
    }

    fun getMimeTypeFromExtension(fileName: String): String {
        val ext = getExtensionFromFileName(fileName)
        return when (ext) {
            "pdf" -> "application/pdf"
            "doc" -> "application/msword"
            "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            "ppt" -> "application/vnd.ms-powerpoint"
            "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            "xls" -> "application/vnd.ms-excel"
            "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "gif" -> "image/gif"
            "txt" -> "text/plain"
            "zip" -> "application/zip"
            "rar" -> "application/x-rar-compressed"
            else -> "*/*"
        }
    }

    data class FileVisualMeta(
        val icon: ImageVector,
        val color: Color,
        val typeBadge: String
    )

    /**
     * Nhận diện icon và màu sắc đặc trưng cho từng loại file giáo án
     */
    fun getFileVisualMeta(extension: String, isWebLink: Boolean = false): FileVisualMeta {
        if (isWebLink) {
            return FileVisualMeta(
                icon = Icons.Default.Link,
                color = Color(0xFF0284C7),
                typeBadge = "Link Drive"
            )
        }

        return when (extension.lowercase()) {
            "pdf" -> FileVisualMeta(
                icon = Icons.Default.PictureAsPdf,
                color = Color(0xFFDC2626), // Đỏ
                typeBadge = "PDF"
            )
            "doc", "docx" -> FileVisualMeta(
                icon = Icons.Default.Description,
                color = Color(0xFF2563EB), // Xanh dương Word
                typeBadge = "Word"
            )
            "ppt", "pptx" -> FileVisualMeta(
                icon = Icons.Default.Slideshow,
                color = Color(0xFFEA580C), // Cam PowerPoint
                typeBadge = "Slide"
            )
            "xls", "xlsx" -> FileVisualMeta(
                icon = Icons.Default.TableChart,
                color = Color(0xFF16A34A), // Xanh lá Excel
                typeBadge = "Excel"
            )
            "jpg", "jpeg", "png", "webp" -> FileVisualMeta(
                icon = Icons.Default.Image,
                color = Color(0xFF9333EA), // Tím Ảnh
                typeBadge = "Ảnh"
            )
            else -> FileVisualMeta(
                icon = Icons.Default.InsertDriveFile,
                color = Color(0xFF64748B),
                typeBadge = "Tài liệu"
            )
        }
    }
}
