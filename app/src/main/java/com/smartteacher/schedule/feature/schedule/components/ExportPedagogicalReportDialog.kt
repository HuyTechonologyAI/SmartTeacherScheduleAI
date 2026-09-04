package com.smartteacher.schedule.feature.schedule.components

import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.window.DialogProperties
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.util.PedagogicalReportHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.time.LocalDate
import java.time.temporal.ChronoField
import java.time.temporal.IsoFields
import java.time.temporal.TemporalAdjusters

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExportPedagogicalReportDialog(
    onDismiss: () -> Unit,
    allEvents: List<CalendarEventEntity>
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val prefs = remember { context.getSharedPreferences("teacher_report_profile", Context.MODE_PRIVATE) }

    // Thông tin giáo viên & trường lưu nhớ tự động
    var teacherName by remember { mutableStateOf(prefs.getString("teacher_name", "Nguyễn Văn A") ?: "Nguyễn Văn A") }
    var schoolName by remember { mutableStateOf(prefs.getString("school_name", "Trường THPT / Cao đẳng") ?: "Trường THPT / Cao đẳng") }
    var departmentName by remember { mutableStateOf(prefs.getString("department_name", "Tổ Tự Nhiên / Khoa Chuyên Môn") ?: "Tổ Tự Nhiên / Khoa Chuyên Môn") }
    var academicYear by remember { mutableStateOf(prefs.getString("academic_year", "2025 - 2026") ?: "2025 - 2026") }

    // Loại báo cáo: 0 = Sổ Báo Giảng Tuần, 1 = Bảng Kê Giờ Dạy
    var reportType by remember { mutableStateOf(0) }

    // Khoảng thời gian
    val today = remember { LocalDate.now() }
    val currentWeek = remember { today.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR) }
    var selectedWeek by remember { mutableStateOf(currentWeek) }

    var selectedMonth by remember { mutableStateOf(today.monthValue) }
    var selectedYear by remember { mutableStateOf(today.year) }

    // Kết quả xuất file
    var isExporting by remember { mutableStateOf(false) }
    var generatedFile by remember { mutableStateOf<File?>(null) }
    var generatedFileName by remember { mutableStateOf("") }

    // Tính toán ngày tuần hiện tại
    val weekStart = remember(selectedWeek, selectedYear) {
        LocalDate.of(selectedYear, 1, 4)
            .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, selectedWeek.toLong())
            .with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
    }
    val weekEnd = remember(weekStart) { weekStart.plusDays(6) }

    // Lọc sự kiện cho báo cáo tuần
    val weekEvents = remember(allEvents, weekStart, weekEnd) {
        allEvents.filter { event ->
            try {
                val d = LocalDate.parse(event.date)
                !d.isBefore(weekStart) && !d.isAfter(weekEnd)
            } catch (e: Exception) {
                false
            }
        }.sortedWith(compareBy({ it.date }, { it.startTime }))
    }

    // Lọc sự kiện cho báo cáo tháng
    val monthEvents = remember(allEvents, selectedMonth, selectedYear) {
        allEvents.filter { event ->
            try {
                val d = LocalDate.parse(event.date)
                d.monthValue == selectedMonth && d.year == selectedYear
            } catch (e: Exception) {
                false
            }
        }.sortedWith(compareBy({ it.date }, { it.startTime }))
    }

    // Sự kiện được chọn dựa vào loại báo cáo
    val targetEvents = if (reportType == 0) weekEvents else monthEvents

    // Tính thống kê nhanh
    val totalTheoryPeriods = remember(targetEvents) {
        targetEvents.sumOf { e ->
            val isPractice = e.title.contains("thực hành", true) || e.room.contains("xưởng", true) || e.notes.contains("thực hành", true)
            if (!isPractice) PedagogicalReportHelper.calculateTeachingPeriods(e.startTime, e.endTime) else 0
        }
    }
    val totalPracticePeriods = remember(targetEvents) {
        targetEvents.sumOf { e ->
            val isPractice = e.title.contains("thực hành", true) || e.room.contains("xưởng", true) || e.notes.contains("thực hành", true)
            if (isPractice) PedagogicalReportHelper.calculateTeachingPeriods(e.startTime, e.endTime) else 0
        }
    }

    fun saveProfile() {
        prefs.edit()
            .putString("teacher_name", teacherName.trim())
            .putString("school_name", schoolName.trim())
            .putString("department_name", departmentName.trim())
            .putString("academic_year", academicYear.trim())
            .apply()
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f),
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Summarize,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                "Hồ Sơ Chuyên Môn & Báo Cáo",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                "Xuất Sổ Báo Giảng & Bảng Kê Giờ Dạy Chuẩn Bộ GD&ĐT",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Đóng")
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // 1. Chọn loại báo cáo Tab
                    PrimaryTabRow(selectedTabIndex = reportType) {
                        Tab(
                            selected = reportType == 0,
                            onClick = {
                                reportType = 0
                                generatedFile = null
                            },
                            text = { Text("📄 Sổ Báo Giảng (Tuần)", fontWeight = FontWeight.SemiBold) }
                        )
                        Tab(
                            selected = reportType == 1,
                            onClick = {
                                reportType = 1
                                generatedFile = null
                            },
                            text = { Text("📊 Bảng Kê Giờ Dạy (Tháng)", fontWeight = FontWeight.SemiBold) }
                        )
                    }

                    // 2. Chọn khoảng thời gian
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (reportType == 0) {
                                Text("Khoảng thời gian: Tuần học số $selectedWeek", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    OutlinedButton(
                                        onClick = { if (selectedWeek > 1) selectedWeek-- },
                                        contentPadding = PaddingValues(horizontal = 12.dp)
                                    ) {
                                        Icon(Icons.Default.ChevronLeft, contentDescription = null)
                                        Text("Tuần trước")
                                    }
                                    Text(
                                        "${weekStart.dayOfMonth}/${weekStart.monthValue} ➔ ${weekEnd.dayOfMonth}/${weekEnd.monthValue}/${weekEnd.year}",
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    OutlinedButton(
                                        onClick = { if (selectedWeek < 52) selectedWeek++ },
                                        contentPadding = PaddingValues(horizontal = 12.dp)
                                    ) {
                                        Text("Tuần sau")
                                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                                    }
                                }
                            } else {
                                Text("Khoảng thời gian: Tháng $selectedMonth / $selectedYear", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    OutlinedButton(
                                        onClick = {
                                            if (selectedMonth > 1) selectedMonth--
                                            else { selectedMonth = 12; selectedYear-- }
                                        }
                                    ) {
                                        Icon(Icons.Default.ChevronLeft, contentDescription = null)
                                        Text("Tháng trước")
                                    }
                                    Text("Tháng $selectedMonth / $selectedYear", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                    OutlinedButton(
                                        onClick = {
                                            if (selectedMonth < 12) selectedMonth++
                                            else { selectedMonth = 1; selectedYear++ }
                                        }
                                    ) {
                                        Text("Tháng sau")
                                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                                    }
                                }
                            }
                        }
                    }

                    // 3. Xem trước thống kê
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceAround,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("${targetEvents.size}", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = MaterialTheme.colorScheme.primary)
                                Text("Buổi lên lớp", style = MaterialTheme.typography.labelSmall)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("$totalTheoryPeriods", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF0284C7))
                                Text("Tiết Lý thuyết", style = MaterialTheme.typography.labelSmall)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("$totalPracticePeriods", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFF10B981))
                                Text("Tiết Thực hành", style = MaterialTheme.typography.labelSmall)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("${totalTheoryPeriods + totalPracticePeriods}", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color(0xFFD97706))
                                Text("Tổng tiết dạy", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }

                    // 4. Thông tin cá nhân & Đơn vị (được lưu nhớ)
                    Text("Thông Tin Báo Cáo Sư Phạm", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelLarge)

                    OutlinedTextField(
                        value = teacherName,
                        onValueChange = { teacherName = it },
                        label = { Text("Họ và tên Giáo viên / Giảng viên") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = schoolName,
                            onValueChange = { schoolName = it },
                            label = { Text("Tên Trường / Cơ sở đào tạo") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = departmentName,
                            onValueChange = { departmentName = it },
                            label = { Text("Khoa / Tổ Bộ môn") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    OutlinedTextField(
                        value = academicYear,
                        onValueChange = { academicYear = it },
                        label = { Text("Năm học (Ví dụ: 2025 - 2026)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    // 5. Kết quả sau khi xuất file (nếu có)
                    if (generatedFile != null && generatedFile!!.exists()) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981))
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF059669))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Đã tạo báo cáo thành công!", fontWeight = FontWeight.Bold, color = Color(0xFF065F46))
                                }
                                Text(generatedFileName, style = MaterialTheme.typography.bodySmall, color = Color(0xFF047857))

                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Button(
                                        onClick = { PedagogicalReportHelper.openFile(context, generatedFile!!) },
                                        modifier = Modifier.weight(1f),
                                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669))
                                    ) {
                                        Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Xem file ngay")
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            PedagogicalReportHelper.shareFile(
                                                context,
                                                generatedFile!!,
                                                if (reportType == 0) "Sổ báo giảng tuần $selectedWeek - $teacherName" else "Bảng kê giờ dạy tháng $selectedMonth - $teacherName"
                                            )
                                        },
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Gửi Zalo/Email")
                                    }
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))

                // 2 Nút xuất: Xuất PDF & Xuất Excel
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Nút xuất PDF
                    Button(
                        onClick = {
                            saveProfile()
                            isExporting = true
                            coroutineScope.launch(Dispatchers.IO) {
                                val profile = PedagogicalReportHelper.TeacherReportProfile(
                                    teacherName = teacherName.trim(),
                                    schoolName = schoolName.trim(),
                                    departmentName = departmentName.trim(),
                                    academicYear = academicYear.trim()
                                )

                                val file = if (reportType == 0) {
                                    PedagogicalReportHelper.generateTeachingRegisterPdf(
                                        context = context,
                                        events = weekEvents,
                                        profile = profile,
                                        weekNumber = selectedWeek,
                                        fromDate = "${weekStart.dayOfMonth}/${weekStart.monthValue}/${weekStart.year}",
                                        toDate = "${weekEnd.dayOfMonth}/${weekEnd.monthValue}/${weekEnd.year}"
                                    )
                                } else {
                                    PedagogicalReportHelper.generateTeachingHoursPdf(
                                        context = context,
                                        events = monthEvents,
                                        profile = profile,
                                        timePeriodLabel = "Tháng $selectedMonth / $selectedYear"
                                    )
                                }

                                withContext(Dispatchers.Main) {
                                    isExporting = false
                                    generatedFile = file
                                    generatedFileName = file.name
                                    Toast.makeText(context, "Đã xuất PDF khổ A4 chuẩn Bộ GD&ĐT!", Toast.LENGTH_SHORT).show()
                                }
                            }
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                        enabled = !isExporting
                    ) {
                        Icon(Icons.Default.PictureAsPdf, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Xuất File PDF (A4)", fontWeight = FontWeight.Bold)
                    }

                    // Nút xuất Excel
                    Button(
                        onClick = {
                            saveProfile()
                            isExporting = true
                            coroutineScope.launch(Dispatchers.IO) {
                                val profile = PedagogicalReportHelper.TeacherReportProfile(
                                    teacherName = teacherName.trim(),
                                    schoolName = schoolName.trim(),
                                    departmentName = departmentName.trim(),
                                    academicYear = academicYear.trim()
                                )

                                val file = if (reportType == 0) {
                                    PedagogicalReportHelper.generateTeachingRegisterExcel(
                                        context = context,
                                        events = weekEvents,
                                        profile = profile,
                                        weekNumber = selectedWeek,
                                        fromDate = "${weekStart.dayOfMonth}/${weekStart.monthValue}/${weekStart.year}",
                                        toDate = "${weekEnd.dayOfMonth}/${weekEnd.monthValue}/${weekEnd.year}"
                                    )
                                } else {
                                    PedagogicalReportHelper.generateTeachingHoursExcel(
                                        context = context,
                                        events = monthEvents,
                                        profile = profile,
                                        timePeriodLabel = "Tháng $selectedMonth / $selectedYear"
                                    )
                                }

                                withContext(Dispatchers.Main) {
                                    isExporting = false
                                    generatedFile = file
                                    generatedFileName = file.name
                                    Toast.makeText(context, "Đã xuất bảng tính Excel chuẩn Bộ GD&ĐT!", Toast.LENGTH_SHORT).show()
                                }
                            }
                        },
                        modifier = Modifier.weight(1f).height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF15803D)),
                        enabled = !isExporting
                    ) {
                        Icon(Icons.Default.TableChart, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Xuất File Excel", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

