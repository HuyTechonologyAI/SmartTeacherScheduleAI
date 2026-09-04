package com.smartteacher.schedule.core.util

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.widget.Toast
import androidx.core.content.FileProvider
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStreamWriter
import java.nio.charset.StandardCharsets
import java.time.LocalDate
import java.util.Locale

/**
 * Trợ lý xuất hồ sơ chuyên môn & báo cáo giảng dạy theo chuẩn Bộ GD&ĐT Việt Nam
 * 1. Sổ Báo Giảng Hàng Tuần (PDF Khổ A4 Ngang / Excel)
 * 2. Bảng Kê Giờ Dạy & Thù Lao Thanh Toán (PDF Khổ A4 Dọc / Excel)
 */
object PedagogicalReportHelper {

    private const val REPORTS_DIR = "teaching_reports"

    data class TeacherReportProfile(
        val teacherName: String = "Giáo viên",
        val schoolName: String = "Trường THPT / Cao đẳng",
        val departmentName: String = "Tổ / Khoa Chuyên môn",
        val academicYear: String = "2025 - 2026",
        val semester: String = "Học kỳ I"
    )

    fun getReportsDir(context: Context): File {
        val dir = File(context.filesDir, REPORTS_DIR)
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }

    /**
     * Ước tính số tiết dạy dựa trên giờ bắt đầu và kết thúc
     */
    fun calculateTeachingPeriods(startTime: String, endTime: String): Int {
        return try {
            val startParts = startTime.split(":").map { it.toInt() }
            val endParts = endTime.split(":").map { it.toInt() }
            val startMinutes = startParts[0] * 60 + startParts[1]
            val endMinutes = endParts[0] * 60 + endParts[1]
            val durationMinutes = endMinutes - startMinutes
            if (durationMinutes <= 0) 1
            else if (durationMinutes <= 50) 1
            else if (durationMinutes <= 95) 2
            else if (durationMinutes <= 140) 3
            else if (durationMinutes <= 190) 4
            else if (durationMinutes <= 250) 5
            else (durationMinutes / 45)
        } catch (e: Exception) {
            1
        }
    }

    /**
     * Xác định tên tiết học (Ví dụ: Tiết 1-2, Tiết 3-4...)
     */
    fun getPeriodLabel(startTime: String, periods: Int): String {
        return try {
            val startParts = startTime.split(":").map { it.toInt() }
            val hour = startParts[0]
            val basePeriod = when {
                hour < 8 -> 1
                hour < 9 -> 2
                hour < 10 -> 3
                hour < 11 -> 4
                hour < 12 -> 5
                hour < 14 -> 6
                hour < 15 -> 7
                hour < 16 -> 8
                hour < 17 -> 9
                else -> 10
            }
            if (periods <= 1) "Tiết $basePeriod"
            else "Tiết $basePeriod - ${basePeriod + periods - 1}"
        } catch (e: Exception) {
            "Tiết dạy"
        }
    }

    // =========================================================================
    // 1. SỔ BÁO GIẢNG TUẦN (PDF KHỔ A4 NGANG - LANDSCAPE 842 x 595)
    // =========================================================================
    fun generateTeachingRegisterPdf(
        context: Context,
        events: List<CalendarEventEntity>,
        profile: TeacherReportProfile,
        weekNumber: Int,
        fromDate: String,
        toDate: String
    ): File {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(842, 595, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas

        val paintText = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = 10f
        }
        val paintTitle = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = 14f
            isFakeBoldText = true
        }
        val paintSubTitle = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = 10f
            isFakeBoldText = true
        }
        val paintBorder = Paint().apply {
            color = Color.BLACK
            style = Paint.Style.STROKE
            strokeWidth = 1f
        }
        val paintHeaderBg = Paint().apply {
            color = Color.rgb(235, 240, 250)
            style = Paint.Style.FILL
        }

        var y = 40f
        val leftMargin = 40f
        val rightMargin = 802f

        // HEADER TRÁI: Tên trường, Tổ chuyên môn
        paintSubTitle.textAlign = Paint.Align.LEFT
        canvas.drawText(profile.schoolName.uppercase(Locale.getDefault()), leftMargin, y, paintSubTitle)
        y += 15f
        paintText.textAlign = Paint.Align.LEFT
        canvas.drawText("Tổ / Khoa: ${profile.departmentName}", leftMargin, y, paintText)
        y += 15f
        canvas.drawText("Họ và tên GV: ${profile.teacherName}", leftMargin, y, paintText)

        // HEADER PHẢI: Quốc hiệu tiêu ngữ
        val rightHeaderX = 640f
        var rightY = 40f
        paintSubTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", rightHeaderX, rightY, paintSubTitle)
        rightY += 15f
        paintText.textAlign = Paint.Align.CENTER
        canvas.drawText("Độc lập - Tự do - Hạnh phúc", rightHeaderX, rightY, paintText)
        rightY += 5f
        canvas.drawLine(rightHeaderX - 60f, rightY, rightHeaderX + 60f, rightY, paintBorder)

        // TIÊU ĐỀ CHÍNH GIỮA
        y = 95f
        paintTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("SỔ BÁO GIẢNG VÀ THEO DÕI TIẾN ĐỘ DẠY HỌC", 421f, y, paintTitle)
        y += 18f
        paintSubTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("Tuần thứ: $weekNumber • Từ ngày $fromDate đến ngày $toDate • Năm học: ${profile.academicYear}", 421f, y, paintSubTitle)

        // BẢNG SỔ BÁO GIẢNG
        y += 20f
        val tableTop = y
        val colWidths = floatArrayOf(80f, 65f, 65f, 130f, 210f, 85f, 127f)
        val headers = arrayOf("Thứ / Ngày", "Tiết", "Lớp", "Môn học / Module", "Tên bài giảng / Nội dung giảng dạy", "Phòng học", "Ghi chú")

        val headerHeight = 24f
        canvas.drawRect(leftMargin, tableTop, rightMargin, tableTop + headerHeight, paintHeaderBg)
        canvas.drawRect(leftMargin, tableTop, rightMargin, tableTop + headerHeight, paintBorder)

        var curColX = leftMargin
        for (i in headers.indices) {
            paintSubTitle.textAlign = Paint.Align.CENTER
            val centerX = curColX + colWidths[i] / 2f
            canvas.drawText(headers[i], centerX, tableTop + 16f, paintSubTitle)
            if (i > 0) {
                canvas.drawLine(curColX, tableTop, curColX, tableTop + headerHeight, paintBorder)
            }
            curColX += colWidths[i]
        }

        val sortedEvents = events.sortedWith(compareBy({ it.date }, { it.startTime }))
        var rowY = tableTop + headerHeight
        val rowHeight = 22f

        paintText.textAlign = Paint.Align.LEFT
        paintText.textSize = 9f

        for (e in sortedEvents) {
            if (rowY + rowHeight > 510f) break

            canvas.drawRect(leftMargin, rowY, rightMargin, rowY + rowHeight, paintBorder)

            val periods = calculateTeachingPeriods(e.startTime, e.endTime)
            val periodStr = getPeriodLabel(e.startTime, periods)

            val dayOfWeekStr = try {
                val d = LocalDate.parse(e.date)
                when (d.dayOfWeek.value) {
                    1 -> "Thứ 2"
                    2 -> "Thứ 3"
                    3 -> "Thứ 4"
                    4 -> "Thứ 5"
                    5 -> "Thứ 6"
                    6 -> "Thứ 7"
                    else -> "Chủ nhật"
                } + " (${e.date.takeLast(5)})"
            } catch (ex: Exception) {
                e.date
            }

            var cellX = leftMargin
            val textBaseY = rowY + 15f

            // Cột 0: Thứ / Ngày
            paintText.textAlign = Paint.Align.CENTER
            canvas.drawText(dayOfWeekStr, cellX + colWidths[0] / 2f, textBaseY, paintText)
            cellX += colWidths[0]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            // Cột 1: Tiết
            canvas.drawText(periodStr, cellX + colWidths[1] / 2f, textBaseY, paintText)
            cellX += colWidths[1]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            // Cột 2: Lớp
            canvas.drawText(e.className.ifBlank { "Toàn trường" }, cellX + colWidths[2] / 2f, textBaseY, paintText)
            cellX += colWidths[2]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            // Cột 3: Môn học
            paintText.textAlign = Paint.Align.LEFT
            val subjectTitle = truncateString(e.subject.ifBlank { e.title }, 24)
            canvas.drawText(subjectTitle, cellX + 6f, textBaseY, paintText)
            cellX += colWidths[3]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            // Cột 4: Tên bài dạy
            val lessonTitle = truncateString(e.notes.ifBlank { e.description.ifBlank { "Theo phân phối chương trình" } }, 45)
            canvas.drawText(lessonTitle, cellX + 6f, textBaseY, paintText)
            cellX += colWidths[4]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            // Cột 5: Phòng học
            paintText.textAlign = Paint.Align.CENTER
            canvas.drawText(e.room.ifBlank { "Phòng học" }, cellX + colWidths[5] / 2f, textBaseY, paintText)
            cellX += colWidths[5]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            // Cột 6: Ghi chú
            paintText.textAlign = Paint.Align.LEFT
            val noteStr = if (e.title.contains("thực hành", true) || e.room.contains("xưởng", true)) "Thực hành" else "Lý thuyết"
            canvas.drawText(noteStr, cellX + 6f, textBaseY, paintText)

            rowY += rowHeight
        }

        // KÝ TÊN
        val signY = 525f
        paintSubTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("XÁC NHẬN CỦA TỔ TRƯỞNG CHUYÊN MÔN", 200f, signY, paintSubTitle)
        canvas.drawText("GIÁO VIÊN BÁO GIẢNG", 640f, signY, paintSubTitle)

        paintText.textAlign = Paint.Align.CENTER
        canvas.drawText("(Ký và ghi rõ họ tên)", 200f, signY + 14f, paintText)
        canvas.drawText("(Ký và ghi rõ họ tên)", 640f, signY + 14f, paintText)

        canvas.drawText(profile.teacherName, 640f, signY + 48f, paintSubTitle)

        pdfDocument.finishPage(page)

        val outputFile = File(getReportsDir(context), "SoBaoGiang_Tuan${weekNumber}_${System.currentTimeMillis()}.pdf")
        FileOutputStream(outputFile).use { out ->
            pdfDocument.writeTo(out)
        }
        pdfDocument.close()
        return outputFile
    }

    // =========================================================================
    // 2. BẢNG KÊ GIỜ DẠY & THÙ LAO (PDF KHỔ A4 DỌC - PORTRAIT 595 x 842)
    // =========================================================================
    fun generateTeachingHoursPdf(
        context: Context,
        events: List<CalendarEventEntity>,
        profile: TeacherReportProfile,
        timePeriodLabel: String
    ): File {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas

        val paintText = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = 9.5f
        }
        val paintTitle = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = 13.5f
            isFakeBoldText = true
        }
        val paintSubTitle = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            textSize = 9.5f
            isFakeBoldText = true
        }
        val paintBorder = Paint().apply {
            color = Color.BLACK
            style = Paint.Style.STROKE
            strokeWidth = 1f
        }
        val paintHeaderBg = Paint().apply {
            color = Color.rgb(240, 244, 255)
            style = Paint.Style.FILL
        }

        var y = 45f
        val leftMargin = 35f
        val rightMargin = 560f

        paintSubTitle.textAlign = Paint.Align.LEFT
        canvas.drawText(profile.schoolName.uppercase(Locale.getDefault()), leftMargin, y, paintSubTitle)
        y += 14f
        paintText.textAlign = Paint.Align.LEFT
        canvas.drawText("Khoa / Bộ môn: ${profile.departmentName}", leftMargin, y, paintText)

        val rightHeaderX = 430f
        var rightY = 45f
        paintSubTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", rightHeaderX, rightY, paintSubTitle)
        rightY += 14f
        paintText.textAlign = Paint.Align.CENTER
        canvas.drawText("Độc lập - Tự do - Hạnh phúc", rightHeaderX, rightY, paintText)

        y = 95f
        paintTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("BẢNG KÊ KHỐI LƯỢNG GIỜ DẠY & THANH TOÁN THÙ LAO", 297f, y, paintTitle)
        y += 16f
        paintSubTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("Thời gian: $timePeriodLabel • Năm học: ${profile.academicYear}", 297f, y, paintSubTitle)

        y += 16f
        paintText.textAlign = Paint.Align.LEFT
        canvas.drawText("Họ và tên giảng viên/giáo viên: ${profile.teacherName}", leftMargin, y, paintSubTitle)

        y += 16f
        val tableTop = y
        val colWidths = floatArrayOf(30f, 65f, 135f, 65f, 75f, 50f, 50f, 55f)
        val headers = arrayOf("STT", "Ngày", "Môn học / Module", "Lớp", "Phòng", "L.Thuyết", "T.Hành", "Quy đổi")

        val headerHeight = 22f
        canvas.drawRect(leftMargin, tableTop, rightMargin, tableTop + headerHeight, paintHeaderBg)
        canvas.drawRect(leftMargin, tableTop, rightMargin, tableTop + headerHeight, paintBorder)

        var curColX = leftMargin
        for (i in headers.indices) {
            paintSubTitle.textAlign = Paint.Align.CENTER
            val centerX = curColX + colWidths[i] / 2f
            canvas.drawText(headers[i], centerX, tableTop + 15f, paintSubTitle)
            if (i > 0) {
                canvas.drawLine(curColX, tableTop, curColX, tableTop + headerHeight, paintBorder)
            }
            curColX += colWidths[i]
        }

        val sortedEvents = events.sortedWith(compareBy({ it.date }, { it.startTime }))
        var rowY = tableTop + headerHeight
        val rowHeight = 20f

        var totalTheory = 0
        var totalPractice = 0
        var stt = 1

        for (e in sortedEvents) {
            if (rowY + rowHeight > 700f) break

            canvas.drawRect(leftMargin, rowY, rightMargin, rowY + rowHeight, paintBorder)

            val periods = calculateTeachingPeriods(e.startTime, e.endTime)
            val isPractice = e.title.contains("thực hành", true) || e.room.contains("xưởng", true) || e.notes.contains("thực hành", true)
            val theoryPeriods = if (isPractice) 0 else periods
            val practicePeriods = if (isPractice) periods else 0

            totalTheory += theoryPeriods
            totalPractice += practicePeriods

            var cellX = leftMargin
            val textBaseY = rowY + 14f

            paintText.textAlign = Paint.Align.CENTER
            canvas.drawText(stt.toString(), cellX + colWidths[0] / 2f, textBaseY, paintText)
            cellX += colWidths[0]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            canvas.drawText(e.date, cellX + colWidths[1] / 2f, textBaseY, paintText)
            cellX += colWidths[1]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            paintText.textAlign = Paint.Align.LEFT
            canvas.drawText(truncateString(e.subject.ifBlank { e.title }, 20), cellX + 4f, textBaseY, paintText)
            cellX += colWidths[2]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            paintText.textAlign = Paint.Align.CENTER
            canvas.drawText(e.className.ifBlank { "Lớp ghép" }, cellX + colWidths[3] / 2f, textBaseY, paintText)
            cellX += colWidths[3]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            canvas.drawText(e.room.ifBlank { "Giảng đường" }, cellX + colWidths[4] / 2f, textBaseY, paintText)
            cellX += colWidths[4]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            canvas.drawText(if (theoryPeriods > 0) "$theoryPeriods" else "-", cellX + colWidths[5] / 2f, textBaseY, paintText)
            cellX += colWidths[5]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            canvas.drawText(if (practicePeriods > 0) "$practicePeriods" else "-", cellX + colWidths[6] / 2f, textBaseY, paintText)
            cellX += colWidths[6]
            canvas.drawLine(cellX, rowY, cellX, rowY + rowHeight, paintBorder)

            val converted = theoryPeriods + practicePeriods
            canvas.drawText("$converted", cellX + colWidths[7] / 2f, textBaseY, paintText)

            stt++
            rowY += rowHeight
        }

        // TỔNG CỘNG
        canvas.drawRect(leftMargin, rowY, rightMargin, rowY + rowHeight, paintHeaderBg)
        canvas.drawRect(leftMargin, rowY, rightMargin, rowY + rowHeight, paintBorder)

        paintSubTitle.textAlign = Paint.Align.CENTER
        val totalLabelWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4]
        canvas.drawText("TỔNG CỘNG TIẾT GIẢNG DẠY", leftMargin + totalLabelWidth / 2f, rowY + 14f, paintSubTitle)

        var sumCellX = leftMargin + totalLabelWidth
        canvas.drawLine(sumCellX, rowY, sumCellX, rowY + rowHeight, paintBorder)

        canvas.drawText("$totalTheory", sumCellX + colWidths[5] / 2f, rowY + 14f, paintSubTitle)
        sumCellX += colWidths[5]
        canvas.drawLine(sumCellX, rowY, sumCellX, rowY + rowHeight, paintBorder)

        canvas.drawText("$totalPractice", sumCellX + colWidths[6] / 2f, rowY + 14f, paintSubTitle)
        sumCellX += colWidths[6]
        canvas.drawLine(sumCellX, rowY, sumCellX, rowY + rowHeight, paintBorder)

        val grandTotal = totalTheory + totalPractice
        canvas.drawText("$grandTotal tiết", sumCellX + colWidths[7] / 2f, rowY + 14f, paintSubTitle)

        // CHỮ KÝ
        val signY = 740f
        paintSubTitle.textAlign = Paint.Align.CENTER
        canvas.drawText("TRƯỞNG KHOA / TỔ TRƯỞNG", 130f, signY, paintSubTitle)
        canvas.drawText("PHÒNG ĐÀO TẠO", 297f, signY, paintSubTitle)
        canvas.drawText("NGƯỜI KÊ KHAI", 460f, signY, paintSubTitle)

        paintText.textAlign = Paint.Align.CENTER
        canvas.drawText("(Ký và ghi rõ họ tên)", 130f, signY + 12f, paintText)
        canvas.drawText("(Ký duyệt)", 297f, signY + 12f, paintText)
        canvas.drawText("(Ký và ghi rõ họ tên)", 460f, signY + 12f, paintText)

        canvas.drawText(profile.teacherName, 460f, signY + 45f, paintSubTitle)

        pdfDocument.finishPage(page)

        val outputFile = File(getReportsDir(context), "BangKeGioDay_${System.currentTimeMillis()}.pdf")
        FileOutputStream(outputFile).use { out ->
            pdfDocument.writeTo(out)
        }
        pdfDocument.close()
        return outputFile
    }

    // =========================================================================
    // 3. XUẤT EXCEL SỔ BÁO GIẢNG
    // =========================================================================
    fun generateTeachingRegisterExcel(
        context: Context,
        events: List<CalendarEventEntity>,
        profile: TeacherReportProfile,
        weekNumber: Int,
        fromDate: String,
        toDate: String
    ): File {
        val sortedEvents = events.sortedWith(compareBy({ it.date }, { it.startTime }))
        val sb = StringBuilder()

        sb.append("<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\">\n")
        sb.append("<head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n")
        sb.append("<style>\n")
        sb.append("body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }\n")
        sb.append("table { border-collapse: collapse; width: 100%; }\n")
        sb.append("th, td { border: 1px solid black; padding: 6px; text-align: left; }\n")
        sb.append("th { background-color: #D9E1F2; font-weight: bold; text-align: center; }\n")
        sb.append(".center { text-align: center; }\n")
        sb.append(".header-table td { border: none; }\n")
        sb.append("</style></head><body>\n")

        sb.append("<table class=\"header-table\" style=\"margin-bottom: 15px;\">\n")
        sb.append("<tr>\n")
        sb.append("<td style=\"width: 50%;\"><b>${profile.schoolName.uppercase(Locale.getDefault())}</b><br>Tổ / Khoa: ${profile.departmentName}<br>Giáo viên: <b>${profile.teacherName}</b></td>\n")
        sb.append("<td style=\"width: 50%; text-align: center;\"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập - Tự do - Hạnh phúc</b><br>-------------</td>\n")
        sb.append("</tr>\n")
        sb.append("</table>\n")

        sb.append("<div style=\"text-align: center; margin-bottom: 15px;\">\n")
        sb.append("<h2 style=\"margin: 0; color: #1F4E79;\">SỔ BÁO GIẢNG VÀ TIẾN ĐỘ DẠY HỌC</h2>\n")
        sb.append("<div><b>Tuần thứ: $weekNumber</b> (Từ ngày $fromDate đến ngày $toDate) - Năm học: ${profile.academicYear}</div>\n")
        sb.append("</div>\n")

        sb.append("<table>\n")
        sb.append("<tr>\n")
        sb.append("<th style=\"width: 100px;\">Thứ / Ngày</th>\n")
        sb.append("<th style=\"width: 80px;\">Tiết dạy</th>\n")
        sb.append("<th style=\"width: 90px;\">Lớp học</th>\n")
        sb.append("<th style=\"width: 160px;\">Môn học / Module</th>\n")
        sb.append("<th>Tên bài giảng / Nội dung chi tiết</th>\n")
        sb.append("<th style=\"width: 100px;\">Phòng học</th>\n")
        sb.append("<th style=\"width: 110px;\">Ghi chú</th>\n")
        sb.append("</tr>\n")

        for (e in sortedEvents) {
            val periods = calculateTeachingPeriods(e.startTime, e.endTime)
            val periodStr = getPeriodLabel(e.startTime, periods)
            val dayOfWeekStr = try {
                val d = LocalDate.parse(e.date)
                when (d.dayOfWeek.value) {
                    1 -> "Thứ Hai"
                    2 -> "Thứ Ba"
                    3 -> "Thứ Tư"
                    4 -> "Thứ Năm"
                    5 -> "Thứ Sáu"
                    6 -> "Thứ Bảy"
                    else -> "Chủ Nhật"
                } + "<br><small>${e.date}</small>"
            } catch (ex: Exception) {
                e.date
            }

            val note = if (e.title.contains("thực hành", true) || e.room.contains("xưởng", true)) "Thực hành / Xưởng" else "Lý thuyết"
            val content = e.notes.ifBlank { e.description.ifBlank { "Giảng dạy theo phân phối chương trình" } }

            sb.append("<tr>\n")
            sb.append("<td class=\"center\">$dayOfWeekStr</td>\n")
            sb.append("<td class=\"center\">$periodStr</td>\n")
            sb.append("<td class=\"center\"><b>${e.className.ifBlank { "Lớp" }}</b></td>\n")
            sb.append("<td><b>${e.subject.ifBlank { e.title }}</b></td>\n")
            sb.append("<td>$content</td>\n")
            sb.append("<td class=\"center\">${e.room.ifBlank { "-" }}</td>\n")
            sb.append("<td class=\"center\">$note</td>\n")
            sb.append("</tr>\n")
        }

        sb.append("</table>\n")

        sb.append("<table class=\"header-table\" style=\"margin-top: 30px;\">\n")
        sb.append("<tr>\n")
        sb.append("<td style=\"width: 50%; text-align: center;\"><b>TỔ TRƯỞNG CHUYÊN MÔN</b><br><i>(Ký duyệt)</i><br><br><br><br></td>\n")
        sb.append("<td style=\"width: 50%; text-align: center;\"><i>Ngày .... tháng .... năm 202...</i><br><b>GIÁO VIÊN BÁO GIẢNG</b><br><i>(Ký và ghi rõ họ tên)</i><br><br><br><b>${profile.teacherName}</b></td>\n")
        sb.append("</tr>\n")
        sb.append("</table>\n")

        sb.append("</body></html>")

        val outputFile = File(getReportsDir(context), "SoBaoGiang_Tuan${weekNumber}_${System.currentTimeMillis()}.xls")
        OutputStreamWriter(FileOutputStream(outputFile), StandardCharsets.UTF_8).use { writer ->
            writer.write(sb.toString())
        }
        return outputFile
    }

    // =========================================================================
    // 4. XUẤT EXCEL BẢNG KÊ GIỜ DẠY
    // =========================================================================
    fun generateTeachingHoursExcel(
        context: Context,
        events: List<CalendarEventEntity>,
        profile: TeacherReportProfile,
        timePeriodLabel: String
    ): File {
        val sortedEvents = events.sortedWith(compareBy({ it.date }, { it.startTime }))
        val sb = StringBuilder()

        sb.append("<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\">\n")
        sb.append("<head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n")
        sb.append("<style>\n")
        sb.append("body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; }\n")
        sb.append("table { border-collapse: collapse; width: 100%; }\n")
        sb.append("th, td { border: 1px solid black; padding: 6px; text-align: left; }\n")
        sb.append("th { background-color: #C6E0B4; font-weight: bold; text-align: center; }\n")
        sb.append(".center { text-align: center; }\n")
        sb.append(".total-row { background-color: #FFF2CC; font-weight: bold; }\n")
        sb.append(".header-table td { border: none; }\n")
        sb.append("</style></head><body>\n")

        sb.append("<table class=\"header-table\" style=\"margin-bottom: 15px;\">\n")
        sb.append("<tr>\n")
        sb.append("<td style=\"width: 50%;\"><b>${profile.schoolName.uppercase(Locale.getDefault())}</b><br>Khoa / Tổ: ${profile.departmentName}</td>\n")
        sb.append("<td style=\"width: 50%; text-align: center;\"><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br><b>Độc lập - Tự do - Hạnh phúc</b></td>\n")
        sb.append("</tr>\n")
        sb.append("</table>\n")

        sb.append("<div style=\"text-align: center; margin-bottom: 15px;\">\n")
        sb.append("<h2 style=\"margin: 0; color: #385723;\">BẢNG KÊ KHỐI LƯỢNG GIỜ GIẢNG DẠY</h2>\n")
        sb.append("<div>Thời gian: <b>$timePeriodLabel</b> - Năm học: ${profile.academicYear}</div>\n")
        sb.append("<div>Giảng viên / Giáo viên kê khai: <b>${profile.teacherName}</b></div>\n")
        sb.append("</div>\n")

        sb.append("<table>\n")
        sb.append("<tr>\n")
        sb.append("<th style=\"width: 40px;\">STT</th>\n")
        sb.append("<th style=\"width: 90px;\">Ngày dạy</th>\n")
        sb.append("<th>Môn học / Module</th>\n")
        sb.append("<th style=\"width: 90px;\">Lớp</th>\n")
        sb.append("<th style=\"width: 100px;\">Phòng / Xưởng</th>\n")
        sb.append("<th style=\"width: 75px;\">Tiết L.Thuyết</th>\n")
        sb.append("<th style=\"width: 75px;\">Tiết T.Hành</th>\n")
        sb.append("<th style=\"width: 80px;\">Tổng tiết</th>\n")
        sb.append("</tr>\n")

        var stt = 1
        var sumTheory = 0
        var sumPractice = 0

        for (e in sortedEvents) {
            val periods = calculateTeachingPeriods(e.startTime, e.endTime)
            val isPractice = e.title.contains("thực hành", true) || e.room.contains("xưởng", true) || e.notes.contains("thực hành", true)
            val theoryPeriods = if (isPractice) 0 else periods
            val practicePeriods = if (isPractice) periods else 0

            sumTheory += theoryPeriods
            sumPractice += practicePeriods

            sb.append("<tr>\n")
            sb.append("<td class=\"center\">$stt</td>\n")
            sb.append("<td class=\"center\">${e.date}</td>\n")
            sb.append("<td><b>${e.subject.ifBlank { e.title }}</b></td>\n")
            sb.append("<td class=\"center\">${e.className.ifBlank { "Lớp" }}</td>\n")
            sb.append("<td class=\"center\">${e.room.ifBlank { "-" }}</td>\n")
            sb.append("<td class=\"center\">${if (theoryPeriods > 0) theoryPeriods else "-"}</td>\n")
            sb.append("<td class=\"center\">${if (practicePeriods > 0) practicePeriods else "-"}</td>\n")
            sb.append("<td class=\"center\"><b>${theoryPeriods + practicePeriods}</b></td>\n")
            sb.append("</tr>\n")
            stt++
        }

        sb.append("<tr class=\"total-row\">\n")
        sb.append("<td colspan=\"5\" class=\"center\">TỔNG CỘNG TIẾT GIẢNG DẠY</td>\n")
        sb.append("<td class=\"center\">$sumTheory</td>\n")
        sb.append("<td class=\"center\">$sumPractice</td>\n")
        sb.append("<td class=\"center\" style=\"color: #C00000; font-size: 12pt;\">${sumTheory + sumPractice}</td>\n")
        sb.append("</tr>\n")

        sb.append("</table>\n")

        sb.append("<table class=\"header-table\" style=\"margin-top: 35px;\">\n")
        sb.append("<tr>\n")
        sb.append("<td style=\"width: 33%; text-align: center;\"><b>TRƯỞNG KHOA / TỔ TRƯỞNG</b><br><i>(Ký duyệt)</i><br><br><br><br></td>\n")
        sb.append("<td style=\"width: 33%; text-align: center;\"><b>PHÒNG ĐÀO TẠO</b><br><i>(Kiểm tra)</i><br><br><br><br></td>\n")
        sb.append("<td style=\"width: 34%; text-align: center;\"><i>Ngày .... tháng .... năm 202...</i><br><b>NGƯỜI KÊ KHAI</b><br><i>(Ký và ghi rõ họ tên)</i><br><br><br><b>${profile.teacherName}</b></td>\n")
        sb.append("</tr>\n")
        sb.append("</table>\n")

        sb.append("</body></html>")

        val outputFile = File(getReportsDir(context), "BangKeGioDay_${System.currentTimeMillis()}.xls")
        OutputStreamWriter(FileOutputStream(outputFile), StandardCharsets.UTF_8).use { writer ->
            writer.write(sb.toString())
        }
        return outputFile
    }

    // =========================================================================
    // 5. TIỆN ÍCH MỞ & CHIA SẺ FILE
    // =========================================================================
    fun openFile(context: Context, file: File) {
        try {
            val authority = "${context.packageName}.fileprovider"
            val uri = FileProvider.getUriForFile(context, authority, file)
            val mimeType = if (file.name.endsWith(".pdf", ignoreCase = true)) {
                "application/pdf"
            } else {
                "application/vnd.ms-excel"
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, mimeType)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, "Thầy/Cô vui lòng cài đặt WPS Office hoặc ứng dụng đọc PDF/Excel!", Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
            Toast.makeText(context, "Không thể mở file: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    fun shareFile(context: Context, file: File, subject: String) {
        try {
            val authority = "${context.packageName}.fileprovider"
            val uri = FileProvider.getUriForFile(context, authority, file)
            val mimeType = if (file.name.endsWith(".pdf", ignoreCase = true)) {
                "application/pdf"
            } else {
                "application/vnd.ms-excel"
            }

            val sendIntent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_SUBJECT, subject)
                putExtra(Intent.EXTRA_TEXT, "Báo cáo giảng dạy từ ứng dụng Smart Teacher Schedule AI")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val chooser = Intent.createChooser(sendIntent, "Gửi báo cáo qua Zalo, Gmail, Messenger")
            chooser.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(chooser)
        } catch (e: Exception) {
            Toast.makeText(context, "Không thể chia sẻ file: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun truncateString(str: String, maxLen: Int): String {
        return if (str.length <= maxLen) str else str.take(maxLen - 3) + "..."
    }
}

