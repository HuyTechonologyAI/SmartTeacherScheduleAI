package com.smartteacher.schedule.feature.schedule.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color as AndroidColor
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity
import com.smartteacher.schedule.core.util.AttachmentFileHelper
import com.smartteacher.schedule.core.util.KnowledgeFileHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.util.zip.ZipInputStream

/**
 * Hộp thoại Xem trước Tài liệu / Kế hoạch bài dạy ĐỘC LẬP NGAY TRONG ỨNG DỤNG (In-App Document Reader).
 * Hỗ trợ hiển thị trực quan:
 * 1. PDF nguyên bản: Dùng Android PdfRenderer kết xuất từng trang với độ phân giải cao, xem được 100% offline không cần cài thêm bất kỳ app nào.
 * 2. Kế hoạch bài dạy HTML / Word (.doc): Hiển thị bảng biểu, mục tiêu, 4 hoạt động chuẩn CV 5512 / CV 2634 với WebView nhúng nội bộ mượt mà.
 * 3. Văn bản thuần / Word .docx / Markdown: Trích xuất đoạn văn, bảng và ngắt dòng rõ ràng, hỗ trợ chọn & sao chép văn bản.
 * 4. Tệp hình ảnh (.png, .jpg): Hiển thị trực quan.
 * 5. Tích hợp thanh công cụ: Phóng to, Thu nhỏ, Sao chép văn bản, Chia sẻ Zalo, Mở app ngoài (WPS / Word / Drive).
 */
@Composable
fun DocumentReaderDialog(
    title: String,
    filePath: String? = null,
    webUrl: String? = null,
    textContent: String? = null,
    fileExtension: String? = null,
    onFileSelected: ((String) -> Unit)? = null,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var currentFilePath by remember(filePath) { mutableStateOf(filePath) }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri: Uri? ->
        if (uri != null) {
            coroutineScope.launch {
                val fileInfo = withContext(Dispatchers.IO) {
                    KnowledgeFileHelper.copyAndExtractKnowledgeFile(context, uri)
                }
                if (fileInfo != null) {
                    currentFilePath = fileInfo.localFilePath
                    onFileSelected?.invoke(fileInfo.localFilePath)
                    Toast.makeText(context, "Đã nạp tệp PDF thành công! Đang hiển thị trực quan...", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Không thể đọc tệp đã chọn!", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    val ext = remember(currentFilePath, fileExtension, title) {
        val path = currentFilePath
        val rawExt = if (!fileExtension.isNullOrBlank()) {
            fileExtension
        } else if (!path.isNullOrBlank()) {
            AttachmentFileHelper.getExtensionFromFileName(path)
        } else {
            AttachmentFileHelper.getExtensionFromFileName(title)
        }
        rawExt.lowercase().trim()
    }

    val isScannedPdfNotice = remember(textContent, ext) {
        textContent?.contains("TÀI LIỆU DẠNG HÌNH ẢNH / SCAN", ignoreCase = true) == true ||
        textContent?.contains("không chứa lớp văn bản vector", ignoreCase = true) == true ||
        (ext == "pdf" && (textContent.isNullOrBlank() || textContent.length < 400))
    }

    // Xác định nội dung tệp
    var resolvedText by remember { mutableStateOf(textContent ?: "") }
    var isHtmlFile by remember { mutableStateOf(false) }
    var htmlContent by remember { mutableStateOf("") }
    var pdfPages by remember { mutableStateOf<List<Bitmap>>(emptyList()) }
    var pdfError by remember { mutableStateOf<String?>(null) }
    var isCloudSyncedDoc by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(true) }
    var zoomScale by remember { mutableFloatStateOf(1.0f) }

    LaunchedEffect(currentFilePath, webUrl, textContent) {
        isLoading = true
        pdfError = null
        isCloudSyncedDoc = false

        withContext(Dispatchers.IO) {
            try {
                var fileReadSuccess = false
                val localPath = currentFilePath
                if (!localPath.isNullOrBlank()) {
                    val file = File(localPath)
                    if (file.exists() && file.length() > 0L) {
                        fileReadSuccess = true
                        when (ext) {
                            "pdf" -> {
                                try {
                                    val pfd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
                                    val renderer = PdfRenderer(pfd)
                                    val count = renderer.pageCount
                                    val bitmaps = mutableListOf<Bitmap>()

                                    // Render tối đa 60 trang đầu tiên với RGB_565 (tiết kiệm 50% RAM, chống OOM)
                                    val maxPages = minOf(count, 60)
                                    for (i in 0 until maxPages) {
                                        val page = renderer.openPage(i)
                                        val targetWidth = 1080
                                        val targetHeight = ((page.height.toFloat() / page.width.toFloat()) * targetWidth).toInt().coerceAtLeast(400)
                                        val bitmap = Bitmap.createBitmap(targetWidth, targetHeight, Bitmap.Config.RGB_565)
                                        val canvas = Canvas(bitmap)
                                        canvas.drawColor(AndroidColor.WHITE)
                                        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                                        page.close()
                                        bitmaps.add(bitmap)
                                    }

                                    renderer.close()
                                    pfd.close()
                                    pdfPages = bitmaps
                                    pdfError = null
                                } catch (t: Throwable) {
                                    t.printStackTrace()
                                    pdfError = "Không thể hiển thị trực quan PDF này (${t.localizedMessage ?: "Tệp bị khoá hoặc định dạng không chuẩn"}). Thầy/Cô có thể mở bằng ứng dụng chuyên dụng."
                                }
                            }

                            "doc", "html", "htm", "" -> {
                                val raw = try {
                                    file.readText(Charsets.UTF_8).ifBlank { file.readText(Charsets.ISO_8859_1) }
                                } catch (_: Exception) { "" }
                                if (raw.contains("<html", ignoreCase = true) ||
                                    raw.contains("<!DOCTYPE html", ignoreCase = true) ||
                                    raw.contains("<body", ignoreCase = true) ||
                                    raw.contains("<table", ignoreCase = true) ||
                                    raw.contains("<div", ignoreCase = true) ||
                                    ext == "html" || ext == "htm") {
                                    isHtmlFile = true
                                    htmlContent = wrapHtmlForMobile(raw)
                                    resolvedText = extractPlainTextFromHtml(raw)
                                } else {
                                    resolvedText = raw
                                }
                            }

                            "docx" -> {
                                // Trích xuất Word .docx
                                var docXml = ""
                                try {
                                    ZipInputStream(FileInputStream(file)).use { zip ->
                                        var entry = zip.nextEntry
                                        while (entry != null) {
                                            val norm = entry.name.replace("\\", "/").trimStart('/')
                                            if (norm.equals("word/document.xml", ignoreCase = true)) {
                                                docXml = zip.bufferedReader(Charsets.UTF_8).readText()
                                                break
                                            }
                                            entry = zip.nextEntry
                                        }
                                    }
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }

                                if (docXml.isNotBlank()) {
                                    val cleaned = cleanDocxXml(docXml)
                                    resolvedText = cleaned
                                    // Tạo bản HTML sạch cho hiển thị
                                    isHtmlFile = true
                                    htmlContent = wrapDocxTextToHtml(title, cleaned)
                                } else {
                                    resolvedText = "Tài liệu Word DOCX: ${file.name}\nDung lượng: ${AttachmentFileHelper.formatFileSize(file.length())}"
                                }
                            }

                            "txt", "md", "csv", "json", "xml" -> {
                                resolvedText = file.readText(Charsets.UTF_8).ifBlank { file.readText(Charsets.ISO_8859_1) }
                            }

                            else -> {
                                try {
                                    val raw = file.readText(Charsets.UTF_8)
                                    if (raw.contains("<html", ignoreCase = true) ||
                                        raw.contains("<!DOCTYPE html", ignoreCase = true) ||
                                        raw.contains("<table", ignoreCase = true) ||
                                        raw.contains("<div", ignoreCase = true)) {
                                        isHtmlFile = true
                                        htmlContent = wrapHtmlForMobile(raw)
                                        resolvedText = extractPlainTextFromHtml(raw)
                                    } else if (raw.isNotBlank() && raw.length < 500000 && raw.none { it.code == 0 }) {
                                        resolvedText = raw
                                    }
                                } catch (_: Exception) {}

                                if (resolvedText.isBlank()) {
                                    resolvedText = "Tài liệu đính kèm: ${file.name}\nĐịnh dạng: .$ext\nDung lượng: ${AttachmentFileHelper.formatFileSize(file.length())}\n\nThầy/Cô hãy nhấn nút 'Mở app ngoài' để xem đầy đủ bằng WPS Office hoặc Word."
                                }
                            }
                        }
                    }
                }

                // Nếu không đọc được từ tệp cục bộ (tệp lưu trên PC/Cloud hoặc đường dẫn khác): Tự động hiển thị nội dung trích xuất số hoá!
                if (!fileReadSuccess || (ext == "pdf" && pdfPages.isEmpty())) {
                    if (isScannedPdfNotice) {
                        isCloudSyncedDoc = true
                        isHtmlFile = false
                        pdfError = null
                        resolvedText = textContent ?: ""
                    } else if (!textContent.isNullOrBlank()) {
                        isCloudSyncedDoc = true
                        pdfError = null
                        if (textContent.contains("<html", ignoreCase = true) || textContent.contains("<!DOCTYPE html", ignoreCase = true)) {
                            isHtmlFile = true
                            htmlContent = wrapHtmlForMobile(textContent)
                            resolvedText = extractPlainTextFromHtml(textContent)
                        } else {
                            isHtmlFile = true
                            htmlContent = wrapDocxTextToHtml(title, textContent)
                            resolvedText = textContent
                        }
                    } else if (!fileReadSuccess) {
                        resolvedText = "Không tìm thấy tệp cục bộ trên thiết bị và chưa có nội dung số hóa.\nĐường dẫn tệp gốc: ${currentFilePath ?: "N/A"}"
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                if (!textContent.isNullOrBlank()) {
                    isCloudSyncedDoc = true
                    resolvedText = textContent
                } else {
                    resolvedText = "Lỗi khi đọc tệp: ${e.localizedMessage}"
                }
            } finally {
                isLoading = false
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = false
        )
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding(),
            color = MaterialTheme.colorScheme.background
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header Bar
                TopAppBarView(
                    title = title,
                    extension = ext,
                    isWebLink = !webUrl.isNullOrBlank(),
                    zoomScale = zoomScale,
                    onZoomIn = { if (zoomScale < 2.0f) zoomScale += 0.2f },
                    onZoomOut = { if (zoomScale > 0.6f) zoomScale -= 0.2f },
                    onZoomReset = { zoomScale = 1.0f },
                    onPickLocalFile = {
                        filePickerLauncher.launch(arrayOf("application/pdf", "*/*"))
                    },
                    onCopyText = {
                        val textToCopy = if (resolvedText.isNotBlank()) resolvedText else title
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("TaiLieu", textToCopy))
                        Toast.makeText(context, "Đã sao chép toàn bộ văn bản!", Toast.LENGTH_SHORT).show()
                    },
                    onOpenExternal = {
                        val localPath = currentFilePath
                        val file = if (!localPath.isNullOrBlank()) File(localPath) else null
                        if (!webUrl.isNullOrBlank()) {
                            openWeb(context, webUrl)
                        } else if (file != null && file.exists()) {
                            openExternalFile(context, file, ext)
                        } else if (resolvedText.isNotBlank()) {
                            val tempDoc = KnowledgeFileHelper.exportDocumentToDoc(
                                context = context,
                                title = title,
                                code = "DOC",
                                category = "TAI_LIEU",
                                subject = "ALL",
                                targetLevel = "ALL",
                                content = resolvedText
                            )
                            if (tempDoc != null) {
                                KnowledgeFileHelper.openOrShareFile(context, tempDoc, "application/msword", title)
                            } else {
                                shareText(context, title, resolvedText)
                            }
                        }
                    },
                    onShare = {
                        val localPath = currentFilePath
                        val file = if (!localPath.isNullOrBlank()) File(localPath) else null
                        if (!webUrl.isNullOrBlank()) {
                            shareText(context, title, "Tài liệu học tập: $title\nLink: $webUrl")
                        } else if (file != null && file.exists()) {
                            shareLocalFile(context, file, title, ext)
                        } else if (resolvedText.isNotBlank()) {
                            shareText(context, title, resolvedText)
                        }
                    },
                    onDismiss = onDismiss
                )

                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                if (isCloudSyncedDoc) {
                    Surface(
                        color = Color(0xFFEFF6FF),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CloudDone, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "Nội dung văn bản số hóa đồng bộ từ Đám mây (Tệp gốc lưu trên máy tính)",
                                fontSize = 11.sp,
                                color = Color(0xFF1E40AF),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                // Body Content
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .background(Color(0xFFF1F5F9))
                ) {
                    when {
                        isLoading -> {
                            Column(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.Center,
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary, strokeWidth = 3.dp)
                                Spacer(modifier = Modifier.height(12.dp))
                                Text(
                                    "Đang nạp và xử lý tài liệu...",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        !webUrl.isNullOrBlank() -> {
                            WebLinkViewer(
                                webUrl = webUrl,
                                onOpenBrowser = { openWeb(context, webUrl) }
                            )
                        }

                        ext == "pdf" && pdfPages.isNotEmpty() -> {
                            PdfDocumentViewer(
                                pages = pdfPages,
                                zoomScale = zoomScale
                            )
                        }

                        ext == "pdf" && isScannedPdfNotice && pdfPages.isEmpty() -> {
                            ScannedPdfReaderView(
                                title = title,
                                textContent = textContent,
                                onPickFile = {
                                    filePickerLauncher.launch(arrayOf("application/pdf", "*/*"))
                                },
                                onExportDoc = {
                                    val tempDoc = KnowledgeFileHelper.exportDocumentToDoc(
                                        context = context,
                                        title = title,
                                        code = "DOC",
                                        category = "TAI_LIEU",
                                        subject = "ALL",
                                        targetLevel = "ALL",
                                        content = resolvedText
                                    )
                                    if (tempDoc != null) {
                                        KnowledgeFileHelper.openOrShareFile(context, tempDoc, "application/msword", title)
                                    } else {
                                        shareText(context, title, resolvedText)
                                    }
                                }
                            )
                        }

                        ext == "pdf" && pdfError != null -> {
                            PdfErrorFallback(
                                errorMsg = pdfError!!,
                                onOpenExternal = {
                                    val localPath = currentFilePath
                                    if (!localPath.isNullOrBlank()) openExternalFile(context, File(localPath), ext)
                                }
                            )
                        }

                        isHtmlFile && htmlContent.isNotBlank() -> {
                            HtmlDocumentViewer(htmlContent = htmlContent)
                        }

                        else -> {
                            TextDocumentViewer(
                                content = resolvedText,
                                zoomScale = zoomScale
                            )
                        }
                    }
                }

                // Bottom Footer Info
                BottomFooterBar(
                    title = title,
                    extension = ext,
                    pdfPageCount = if (ext == "pdf") pdfPages.size else 0,
                    filePath = currentFilePath,
                    onOpenExternal = {
                        val localPath = currentFilePath
                        if (!webUrl.isNullOrBlank()) {
                            openWeb(context, webUrl)
                        } else if (!localPath.isNullOrBlank()) {
                            openExternalFile(context, File(localPath), ext)
                        }
                    }
                )
            }
        }
    }
}

/**
 * Thanh tiêu đề chuyên nghiệp với các thao tác nhanh
 */
@Composable
private fun TopAppBarView(
    title: String,
    extension: String,
    isWebLink: Boolean,
    zoomScale: Float,
    onZoomIn: () -> Unit,
    onZoomOut: () -> Unit,
    onZoomReset: () -> Unit,
    onPickLocalFile: () -> Unit,
    onCopyText: () -> Unit,
    onOpenExternal: () -> Unit,
    onShare: () -> Unit,
    onDismiss: () -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 3.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onDismiss, modifier = Modifier.size(36.dp)) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Đóng", tint = MaterialTheme.colorScheme.onSurface)
            }

            Spacer(modifier = Modifier.width(4.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = when (extension) {
                            "pdf" -> Color(0xFFDC2626)
                            "doc", "docx" -> Color(0xFF2563EB)
                            "ppt", "pptx" -> Color(0xFFEA580C)
                            "xls", "xlsx" -> Color(0xFF16A34A)
                            else -> if (isWebLink) Color(0xFF0284C7) else Color(0xFF475569)
                        }.copy(alpha = 0.15f),
                        modifier = Modifier.padding(end = 6.dp)
                    ) {
                        Text(
                            text = if (isWebLink) "DRIVE" else extension.ifBlank { "DOC" }.uppercase(),
                            color = when (extension) {
                                "pdf" -> Color(0xFFDC2626)
                                "doc", "docx" -> Color(0xFF2563EB)
                                "ppt", "pptx" -> Color(0xFFEA580C)
                                "xls", "xlsx" -> Color(0xFF16A34A)
                                else -> if (isWebLink) Color(0xFF0284C7) else Color(0xFF475569)
                            },
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                        )
                    }

                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Text(
                    text = "Chế độ đọc trực quan trong ứng dụng",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Zoom Controls
            IconButton(onClick = onZoomOut, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.ZoomOut, contentDescription = "Thu nhỏ", modifier = Modifier.size(18.dp))
            }
            IconButton(onClick = onZoomIn, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.ZoomIn, contentDescription = "Phóng to", modifier = Modifier.size(18.dp))
            }

            // Sao chép văn bản
            IconButton(onClick = onCopyText, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.ContentCopy, contentDescription = "Sao chép", modifier = Modifier.size(18.dp))
            }

            // Chia sẻ Zalo / ngoài
            IconButton(onClick = onShare, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.Share, contentDescription = "Chia sẻ", modifier = Modifier.size(18.dp))
            }
        }
    }
}

/**
 * Trình kết xuất PDF đa trang bằng Android PdfRenderer
 */
@Composable
private fun PdfDocumentViewer(
    pages: List<Bitmap>,
    zoomScale: Float
) {
    val listState = rememberLazyListState()

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(12.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        itemsIndexed(pages) { index, bitmap ->
            Card(
                shape = RoundedCornerShape(8.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth(zoomScale.coerceIn(0.7f, 1.0f))
                    .wrapContentHeight()
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Image(
                        bitmap = bitmap.asImageBitmap(),
                        contentDescription = "Trang ${index + 1}",
                        modifier = Modifier
                            .fillMaxWidth()
                            .wrapContentHeight()
                    )

                    Surface(
                        color = Color(0xFFF1F5F9),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "— Trang ${index + 1} / ${pages.size} —",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF64748B),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }
                }
            }
        }
    }
}

/**
 * Trình kết xuất tài liệu HTML (Kế hoạch bài dạy CV 5512, CV 2634)
 */
@Composable
private fun HtmlDocumentViewer(htmlContent: String) {
    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    builtInZoomControls = true
                    displayZoomControls = false
                    defaultTextEncodingName = "utf-8"
                    cacheMode = WebSettings.LOAD_NO_CACHE
                }
                webViewClient = WebViewClient()
                setBackgroundColor(AndroidColor.parseColor("#F8FAFC"))
                loadDataWithBaseURL("file:///android_asset/", htmlContent, "text/html", "UTF-8", null)
            }
        },
        update = { webView ->
            webView.loadDataWithBaseURL("file:///android_asset/", htmlContent, "text/html", "UTF-8", null)
        },
        modifier = Modifier.fillMaxSize()
    )
}

/**
 * Trình xem văn bản thuần / Word DOCX trích xuất
 */
@Composable
private fun TextDocumentViewer(
    content: String,
    zoomScale: Float
) {
    val scrollState = rememberScrollState()
    val baseFontSize = (14 * zoomScale).coerceIn(11f, 24f).sp

    Box(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Card(
            shape = RoundedCornerShape(12.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            SelectionContainer(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = content.ifBlank { "(Tài liệu trống)" },
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontSize = baseFontSize,
                        lineHeight = (baseFontSize.value * 1.55f).sp
                    ),
                    color = Color(0xFF1E293B)
                )
            }
        }
    }
}

/**
 * Giao diện xem liên kết Web / Google Drive
 */
@Composable
private fun WebLinkViewer(
    webUrl: String,
    onOpenBrowser: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            shape = CircleShape,
            color = Color(0xFFE0F2FE),
            modifier = Modifier.size(72.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    Icons.Default.CloudQueue,
                    contentDescription = null,
                    tint = Color(0xFF0284C7),
                    modifier = Modifier.size(36.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Liên kết Google Drive / Đám mây",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF0F172A)
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = webUrl,
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF0284C7),
            textAlign = TextAlign.Center,
            maxLines = 3,
            overflow = TextOverflow.Ellipsis
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = onOpenBrowser,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Mở liên kết trên trình duyệt", fontWeight = FontWeight.Bold)
        }
    }
}

/**
 * Giao diện báo lỗi PDF & đề xuất giải pháp
 */
@Composable
private fun PdfErrorFallback(
    errorMsg: String,
    onOpenExternal: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.PictureAsPdf,
            contentDescription = null,
            tint = Color(0xFFDC2626),
            modifier = Modifier.size(56.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Không thể xem trước trang PDF trực tiếp",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF0F172A)
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = errorMsg,
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF64748B),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(18.dp))

        Button(
            onClick = onOpenExternal,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Mở bằng ứng dụng đọc PDF ngoài", fontWeight = FontWeight.Bold)
        }
    }
}

/**
 * Thanh chân trang với nút mở app ngoài chuyên dụng
 */
@Composable
private fun BottomFooterBar(
    title: String,
    extension: String,
    pdfPageCount: Int,
    filePath: String?,
    onOpenExternal: () -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 6.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = when {
                    pdfPageCount > 0 -> "Tổng số: $pdfPageCount trang"
                    !filePath.isNullOrBlank() -> {
                        val size = File(filePath).length()
                        "Dung lượng: ${AttachmentFileHelper.formatFileSize(size)}"
                    }
                    else -> "Văn bản số hoá"
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Medium
            )

            Button(
                onClick = onOpenExternal,
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = when (extension) {
                        "doc", "docx" -> Color(0xFF2563EB)
                        "pdf" -> Color(0xFFDC2626)
                        else -> MaterialTheme.colorScheme.primary
                    }
                )
            ) {
                Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = when (extension) {
                        "doc", "docx" -> "Mở sửa bằng Word / WPS"
                        "pdf" -> "Mở bằng Adobe / Drive"
                        else -> "Mở ứng dụng ngoài"
                    },
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}


/**
 * Giao diện xem trước chuyên biệt cho Tài liệu Scan / Bản chụp nguyên bản (PDF)
 */
@Composable
private fun ScannedPdfReaderView(
    title: String,
    textContent: String?,
    onPickFile: () -> Unit,
    onExportDoc: () -> Unit
) {
    val scrollState = rememberScrollState()
    val fileSizeStr = remember(textContent) {
        val match = Regex("Dung lượng:\\s*([0-9.]+\\s*[KMG]B)", RegexOption.IGNORE_CASE).find(textContent ?: "")
        match?.groupValues?.get(1) ?: "10 - 15 MB"
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color(0xFFFEE2E2),
                    modifier = Modifier.size(64.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            Icons.Default.PictureAsPdf,
                            contentDescription = null,
                            tint = Color(0xFFDC2626),
                            modifier = Modifier.size(34.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color(0xFFFEF3C7)
                ) {
                    Text(
                        text = "TÀI LIỆU SCAN NGUYÊN BẢN (PDF)",
                        color = Color(0xFFB45309),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Định dạng: Adobe PDF • Dung lượng: $fileSizeStr",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B)
                )
            }
        }

        Surface(
            shape = RoundedCornerShape(14.dp),
            color = Color(0xFFEFF6FF),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBFDBFE)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.CloudSync,
                        contentDescription = null,
                        tint = Color(0xFF2563EB),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Tệp gốc lưu trên Máy tính giáo viên",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E40AF)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Tài liệu này là sách/giáo trình dạng ảnh scan dung lượng lớn được đồng bộ từ Máy tính. Để xem trực quan từng trang PDF sắc nét ngay trên điện thoại:",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF1E3A8A),
                    lineHeight = 18.sp
                )
            }
        }

        Button(
            onClick = onPickFile,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2563EB))
        ) {
            Icon(Icons.Default.FolderOpen, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "CHỌN TỆP PDF TRÊN ĐIỆN THOẠI ĐỂ XEM NGAY",
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "💡 Hướng dẫn mở tài liệu PDF:",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF334155)
                )

                Text(
                    text = "• Bước 1: Gửi file PDF này qua Zalo (Cloud của tôi), Telegram hoặc Google Drive về máy điện thoại.\n" +
                           "• Bước 2: Bấm nút xanh 'CHỌN TỆP PDF' ở trên và chọn tệp vừa tải về.\n" +
                           "• Bước 3: Hệ thống sẽ tự động lưu và mở toàn bộ các trang PDF trực quan, phóng to/thu nhỏ mượt mà không cần mạng.\n" +
                           "• Thầy/Cô cũng có thể mở máy tính tại www.gvcncdsai.io.vn để xem bản PDF trực quan trên màn hình lớn.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF64748B),
                    lineHeight = 19.sp
                )
            }
        }

        OutlinedButton(
            onClick = onExportDoc,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.Description, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Xuất thông tin tài liệu sang Word (.doc)", fontSize = 12.sp)
        }
    }
}

// ---------------------- TIỆN ÍCH HỖ TRỢ ĐỌC VÀ CHIA SẺ ----------------------

private fun wrapHtmlForMobile(rawHtml: String): String {
    val metaViewport = "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes\">"
    val customStyles = """
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Times New Roman", Times, serif;
                font-size: 15px;
                line-height: 1.6;
                color: #1e293b;
                background-color: #ffffff;
                padding: 16px 14px 40px 14px;
                margin: 0;
            }
            table {
                width: 100% !important;
                border-collapse: collapse;
                margin: 12px 0;
                font-size: 13px;
                display: block;
                overflow-x: auto;
            }
            th, td {
                border: 1px solid #cbd5e1;
                padding: 8px 10px;
                text-align: left;
                vertical-align: top;
            }
            th {
                background-color: #f1f5f9;
                font-weight: bold;
            }
            h1, h2, h3, h4 {
                color: #0f172a;
                margin-top: 18px;
                margin-bottom: 8px;
            }
            h1 { font-size: 18px; text-align: center; }
            h2 { font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            h3 { font-size: 15px; }
            strong { color: #0f172a; }
            p { margin: 6px 0; }
        </style>
    """.trimIndent()

    return if (rawHtml.contains("<head>", ignoreCase = true)) {
        rawHtml.replace("<head>", "<head>$metaViewport$customStyles", ignoreCase = true)
    } else {
        "<!DOCTYPE html><html><head>$metaViewport$customStyles</head><body>$rawHtml</body></html>"
    }
}

private fun wrapDocxTextToHtml(title: String, text: String): String {
    val escapedTitle = escapeHtml(title)
    val paragraphs = text.split("\n\n").filter { it.isNotBlank() }
    val body = buildString {
        append("<h2 style=\"text-align:center; color:#1e40af;\">$escapedTitle</h2>")
        for (p in paragraphs) {
            val trimmed = p.trim()
            if (trimmed.startsWith("I.") || trimmed.startsWith("II.") || trimmed.startsWith("III.") || trimmed.startsWith("IV.")) {
                append("<h3 style=\"color:#0369a1; border-bottom: 1px solid #e0f2fe; padding-bottom: 2px;\">${escapeHtml(trimmed)}</h3>")
            } else if (trimmed.startsWith("1.") || trimmed.startsWith("2.") || trimmed.startsWith("3.") || trimmed.startsWith("4.")) {
                append("<p style=\"font-weight:bold; margin-top:8px;\">${escapeHtml(trimmed)}</p>")
            } else {
                append("<p>${escapeHtml(trimmed)}</p>")
            }
        }
    }
    return wrapHtmlForMobile(body)
}

private fun cleanDocxXml(xml: String): String {
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
        .replace(Regex("[ \\t]+"), " ")
        .replace(Regex("\n{3,}"), "\n\n")
        .trim()
}

private fun extractPlainTextFromHtml(html: String): String {
    return html
        .replace(Regex("<style[^>]*>.*?</style>", RegexOption.DOT_MATCHES_ALL), "")
        .replace(Regex("<script[^>]*>.*?</script>", RegexOption.DOT_MATCHES_ALL), "")
        .replace(Regex("<br[ /]*>"), "\n")
        .replace(Regex("</p>"), "\n\n")
        .replace(Regex("</tr>"), "\n")
        .replace(Regex("</td>"), "\t")
        .replace(Regex("<[^>]+>"), "")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace("&nbsp;", " ")
        .trim()
}

private fun escapeHtml(text: String): String {
    return text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;")
}

private fun openWeb(context: Context, url: String) {
    try {
        var valid = url.trim()
        if (!valid.startsWith("http://") && !valid.startsWith("https://")) {
            valid = "https://$valid"
        }
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(valid)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    } catch (e: Exception) {
        Toast.makeText(context, "Không thể mở liên kết: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
    }
}

private fun openExternalFile(context: Context, file: File, extension: String) {
    if (!file.exists()) {
        Toast.makeText(context, "Không tìm thấy tệp trên máy!", Toast.LENGTH_SHORT).show()
        return
    }
    try {
        val authority = "${context.packageName}.fileprovider"
        val uri = FileProvider.getUriForFile(context, authority, file)
        val mime = AttachmentFileHelper.getMimeTypeFromExtension(file.name)

        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, mime)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val chooser = Intent.createChooser(intent, "Mở tài liệu bằng:")
        chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(chooser)
    } catch (e: Exception) {
        Toast.makeText(context, "Lỗi khi mở bằng app ngoài: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
    }
}

private fun shareLocalFile(context: Context, file: File, title: String, extension: String) {
    if (!file.exists()) {
        Toast.makeText(context, "Không tìm thấy tệp để chia sẻ!", Toast.LENGTH_SHORT).show()
        return
    }
    try {
        val authority = "${context.packageName}.fileprovider"
        val uri = FileProvider.getUriForFile(context, authority, file)
        val mime = AttachmentFileHelper.getMimeTypeFromExtension(file.name)

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = mime
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, title)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val chooser = Intent.createChooser(intent, "Chia sẻ tài liệu qua:")
        chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(chooser)
    } catch (e: Exception) {
        Toast.makeText(context, "Lỗi khi chia sẻ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
    }
}

private fun shareText(context: Context, title: String, content: String) {
    try {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, title)
            putExtra(Intent.EXTRA_TEXT, content)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        val chooser = Intent.createChooser(intent, "Chia sẻ văn bản qua:")
        chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(chooser)
    } catch (e: Exception) {
        Toast.makeText(context, "Lỗi khi chia sẻ: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
    }
}
