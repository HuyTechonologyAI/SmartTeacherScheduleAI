package com.smartteacher.schedule.core.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.util.UUID
import java.util.zip.ZipInputStream

/**
 * Trợ thủ quản lý và trích xuất nội dung văn bản từ tệp đính kèm (Word, PDF, Text...)
 * cho Kho Tư Liệu Chuẩn Sư Phạm (Grounding Knowledge Base), giúp AI đối chiếu chính xác
 * mà Thầy/Cô không cần phải copy - dán nội dung thủ công.
 */
object KnowledgeFileHelper {

    private const val KNOWLEDGE_DIR = "knowledge_docs"

    data class KnowledgeAttachedFileInfo(
        val fileName: String,
        val localFilePath: String,
        val fileSizeBytes: Long,
        val fileExtension: String,
        val extractedText: String
    )

    /**
     * Sao chép tệp từ Content URI vào thư mục nội bộ và tự động trích xuất nội dung văn bản.
     */
    fun copyAndExtractKnowledgeFile(context: Context, sourceUri: Uri): KnowledgeAttachedFileInfo? {
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

            val extension = getExtensionFromFileName(displayName).lowercase()

            // Thư mục lưu trữ tài liệu tri thức nội bộ
            val storageDir = File(context.filesDir, KNOWLEDGE_DIR)
            if (!storageDir.exists()) {
                storageDir.mkdirs()
            }

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

            // Trích xuất nội dung văn bản từ tệp
            val extractedText = extractTextFromFile(targetFile, extension, displayName)

            KnowledgeAttachedFileInfo(
                fileName = displayName,
                localFilePath = targetFile.absolutePath,
                fileSizeBytes = fileSize,
                fileExtension = extension,
                extractedText = extractedText
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Tự động trích xuất nội dung văn bản dựa trên định dạng tệp tin.
     */
    private fun extractTextFromFile(file: File, extension: String, originalName: String): String {
        return try {
            when (extension) {
                "txt", "md", "csv", "json", "xml", "html", "htm" -> {
                    file.readText(Charsets.UTF_8).ifBlank {
                        file.readText(Charsets.ISO_8859_1)
                    }
                }

                "docx" -> {
                    // Giải nén cấu trúc file .docx để đọc trực tiếp word/document.xml
                    var docXml = ""
                    ZipInputStream(FileInputStream(file)).use { zip ->
                        var entry = zip.nextEntry
                        while (entry != null) {
                            if (entry.name == "word/document.xml") {
                                docXml = zip.bufferedReader(Charsets.UTF_8).readText()
                                break
                            }
                            entry = zip.nextEntry
                        }
                    }

                    if (docXml.isNotBlank()) {
                        cleanWordXmlToPlainText(docXml)
                    } else {
                        "Tài liệu Word DOCX: $originalName (Dung lượng: ${formatFileSize(file.length())})"
                    }
                }

                "pdf" -> {
                    // Trích xuất văn bản cơ bản từ stream PDF
                    extractBasicPdfText(file, originalName)
                }

                else -> {
                    "Tài liệu đính kèm: $originalName (Định dạng: $extension, dung lượng: ${formatFileSize(file.length())})"
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            "Tài liệu đính kèm: $originalName (Dung lượng: ${formatFileSize(file.length())})"
        }
    }

    /**
     * Chuyển đổi mã XML của Word (.docx) thành văn bản thuần có ngắt dòng và cấu trúc sạch sẽ.
     */
    private fun cleanWordXmlToPlainText(xml: String): String {
        return xml
            .replace(Regex("<w:p[ >]"), "\n")
            .replace(Regex("<w:br[ />]"), "\n")
            .replace(Regex("<w:tab[ />]"), "\t")
            .replace(Regex("<[^>]+>"), "")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", "\"")
            .replace("&apos;", "'")
            .replace(Regex("[ \t]+"), " ")
            .replace(Regex("\n{3,}"), "\n\n")
            .trim()
    }

    /**
     * Đọc các chuỗi ký tự văn bản có trong file PDF đơn giản.
     */
    private fun extractBasicPdfText(file: File, originalName: String): String {
        return try {
            val bytes = file.readBytes()
            val contentStr = String(bytes, Charsets.ISO_8859_1)

            // Tìm các đoạn text trong khối BT ... ET của PDF
            val textBlocks = StringBuilder()
            val regex = Regex("\\(([^\\(\\)]+)\\)\\s*T[jJ]")
            val matches = regex.findAll(contentStr)

            for (match in matches) {
                val segment = match.groupValues[1]
                if (segment.isNotBlank()) {
                    textBlocks.append(segment).append(" ")
                }
            }

            val extracted = textBlocks.toString().trim()
            if (extracted.length > 50) {
                extracted
            } else {
                "Tài liệu PDF: $originalName (Dung lượng: ${formatFileSize(file.length())})\nNội dung được lưu trữ trong tệp đính kèm để xem trực tiếp."
            }
        } catch (e: Exception) {
            "Tài liệu PDF: $originalName (Dung lượng: ${formatFileSize(file.length())})"
        }
    }

    /**
     * Mở tệp đính kèm bằng ứng dụng chuyên dụng trên máy (WPS Office, Microsoft Word, Adobe Reader...).
     */
    fun openAttachedFile(context: Context, filePath: String) {
        val file = File(filePath)
        if (!file.exists()) {
            Toast.makeText(context, "Không tìm thấy tệp đính kèm trên máy!", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val authority = "${context.packageName}.fileprovider"
            val contentUri = FileProvider.getUriForFile(context, authority, file)
            val extension = getExtensionFromFileName(file.name).lowercase()
            val mimeType = getMimeType(extension)

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(Intent.createChooser(intent, "Mở tài liệu bằng:"))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "Không có ứng dụng nào hỗ trợ mở tệp này!", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Lỗi khi mở tệp: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    fun formatFileSize(bytes: Long): String {
        if (bytes <= 0) return "0 B"
        val kb = bytes / 1024.0
        val mb = kb / 1024.0
        return when {
            mb >= 1.0 -> String.format("%.2f MB", mb)
            kb >= 1.0 -> String.format("%.1f KB", kb)
            else -> "$bytes B"
        }
    }

    fun getExtensionFromFileName(name: String): String {
        val lastDot = name.lastIndexOf('.')
        return if (lastDot != -1 && lastDot < name.length - 1) {
            name.substring(lastDot + 1).lowercase()
        } else {
            ""
        }
    }

    private fun getMimeType(extension: String): String {
        return when (extension) {
            "pdf" -> "application/pdf"
            "doc" -> "application/msword"
            "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            "xls" -> "application/vnd.ms-excel"
            "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            "ppt" -> "application/vnd.ms-powerpoint"
            "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            "txt" -> "text/plain"
            "csv" -> "text/csv"
            "md" -> "text/markdown"
            else -> "*/*"
        }
    }
}
