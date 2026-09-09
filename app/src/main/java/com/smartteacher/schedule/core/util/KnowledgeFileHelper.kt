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
                            val normalized = entry.name.replace("\\", "/").trimStart('/')
                            if (normalized.equals("word/document.xml", ignoreCase = true)) {
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
            .replace(Regex("<w:p[ >]"), "\n\n")
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

    /**
     * Xuất nội dung tài liệu thành tệp Microsoft Word (.doc) theo chuẩn văn bản sư phạm
     */
    fun exportDocumentToDoc(
        context: Context,
        title: String,
        code: String,
        category: String,
        subject: String,
        targetLevel: String,
        content: String
    ): File? {
        return try {
            val exportDir = File(context.cacheDir, "exported_docs")
            if (!exportDir.exists()) exportDir.mkdirs()

            val sanitizedTitle = title.replace("[^a-zA-Z0-9_ -]".toRegex(), "").trim().replace("\\s+".toRegex(), "_")
            val fileName = "${code}_${sanitizedTitle}.doc"
            val targetFile = File(exportDir, fileName)

            val categoryLabel = when (category) {
                "GIAO_TRINH" -> "GIÁO TRÌNH CHUYÊN MÔN / TÀI LIỆU GIẢNG DẠY"
                "DE_CUONG" -> "ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN / MÔN HỌC"
                "PHAP_QUY" -> "VĂN BẢN QUY PHẠM PHÁP LUẬT / CÔNG VĂN CHUYÊN MÔN"
                "QUY_CHUAN_XUONG" -> "TIÊU CHUẨN AN TOÀN LAO ĐỘNG & QUY TẮC 5S"
                else -> "TƯ LIỆU SƯ PHẠM ĐỐI CHIẾU AI"
            }

            val htmlContent = buildString {
                append("<!DOCTYPE html><html xmlns:w=\"urn:schemas-microsoft-com:office:word\"><head><meta charset=\"utf-8\">")
                append("<title>").append(escapeHtml(title)).append("</title>")
                append("<style>")
                append("@page { size: A4 portrait; margin: 2cm 2cm 2cm 2cm; }")
                append("body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000; }")
                append(".header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }")
                append(".header-table td { vertical-align: top; font-size: 12pt; border: none; padding: 0; }")
                append(".doc-title { font-size: 15pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 20px 0 10px 0; }")
                append(".doc-meta { width: 100%; border-collapse: collapse; margin: 15px 0 25px 0; }")
                append(".doc-meta td { border: 1px solid #777; padding: 6px 10px; font-size: 11pt; }")
                append(".content { text-align: justify; white-space: pre-wrap; word-break: break-word; font-size: 13pt; line-height: 1.5; }")
                append(".footer-sign { width: 100%; margin-top: 40px; border-collapse: collapse; }")
                append(".footer-sign td { width: 50%; text-align: center; font-size: 12pt; border: none; vertical-align: top; }")
                append("</style></head><body>")

                append("<table class=\"header-table\"><tr>")
                append("<td style=\"width: 45%; text-align: center;\">")
                append("<strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>")
                append("<strong>CƠ SỞ DỮ LIỆU ĐỐI CHIẾU AI</strong><br/>")
                append("Số / Mã: <strong>").append(escapeHtml(code)).append("</strong>")
                append("</td>")
                append("<td style=\"width: 55%; text-align: center;\">")
                append("<strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>")
                append("<strong><u>Độc lập - Tự do - Hạnh phúc</u></strong>")
                append("</td></tr></table>")

                append("<div class=\"doc-title\">").append(escapeHtml(title)).append("</div>")

                append("<table class=\"doc-meta\">")
                append("<tr><td><strong>Phân loại:</strong> ").append(escapeHtml(categoryLabel)).append("</td>")
                append("<td><strong>Môn học:</strong> ").append(escapeHtml(subject)).append("</td></tr>")
                append("<tr><td><strong>Trình độ / Cấp học:</strong> ").append(escapeHtml(targetLevel)).append("</td>")
                append("<td><strong>Mã ký hiệu:</strong> ").append(escapeHtml(code)).append("</td></tr>")
                append("</table>")

                append("<div class=\"content\">").append(escapeHtml(content)).append("</div>")

                append("<table class=\"footer-sign\"><tr>")
                append("<td><strong>CÁN BỘ / TỔ BỘ MÔN</strong><br/><em>(Ký, ghi rõ họ tên)</em><br/><br/><br/><br/></td>")
                append("<td><em>Ngày ..... tháng ..... năm 20...</em><br/><strong>NGƯỜI DUYỆT / LÃNH ĐẠO ĐƠN VỊ</strong><br/><em>(Ký, đóng dấu)</em><br/><br/><br/><br/></td>")
                append("</tr></table>")

                append("</body></html>")
            }

            targetFile.writeText(htmlContent, Charsets.UTF_8)
            targetFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Xuất nội dung tài liệu thành tệp văn bản thuần (.txt)
     */
    fun exportDocumentToTxt(
        context: Context,
        title: String,
        code: String,
        content: String
    ): File? {
        return try {
            val exportDir = File(context.cacheDir, "exported_docs")
            if (!exportDir.exists()) exportDir.mkdirs()

            val sanitizedTitle = title.replace("[^a-zA-Z0-9_ -]".toRegex(), "").trim().replace("\\s+".toRegex(), "_")
            val fileName = "${code}_${sanitizedTitle}.txt"
            val targetFile = File(exportDir, fileName)

            targetFile.writeText(content, Charsets.UTF_8)
            targetFile
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Chia sẻ hoặc mở file đã xuất bằng ứng dụng hỗ trợ
     */
    fun openOrShareFile(context: Context, file: File, mimeType: String, title: String) {
        try {
            val authority = "${context.packageName}.fileprovider"
            val uri = FileProvider.getUriForFile(context, authority, file)

            val intent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, title)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            context.startActivity(Intent.createChooser(intent, "Mở / Tải về: $title"))
        } catch (e: Exception) {
            Toast.makeText(context, "Lỗi khi mở file: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Tải về / Chia sẻ đúng tệp gốc nguyên bản (Word, PDF, Text...) mà Thầy/Cô đã tải lên
     */
    fun shareOrSaveOriginalFile(context: Context, filePath: String, originalName: String) {
        val file = File(filePath)
        if (!file.exists()) {
            Toast.makeText(context, "Không tìm thấy tệp gốc đính kèm trên bộ nhớ máy!", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val authority = "${context.packageName}.fileprovider"
            val contentUri = FileProvider.getUriForFile(context, authority, file)
            val extension = getExtensionFromFileName(originalName.ifBlank { file.name }).lowercase()
            val mimeType = getMimeType(extension)

            val intent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, contentUri)
                putExtra(Intent.EXTRA_SUBJECT, originalName)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            context.startActivity(Intent.createChooser(intent, "Tải về / Chia sẻ tệp gốc: $originalName"))
        } catch (e: Exception) {
            Toast.makeText(context, "Lỗi khi chia sẻ tệp gốc: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun escapeHtml(text: String): String {
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;")
    }
}
