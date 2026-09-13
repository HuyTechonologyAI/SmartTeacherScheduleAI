package com.smartteacher.schedule.feature.students

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.ClassroomEntity
import com.smartteacher.schedule.core.database.entity.StudentEntity
import com.smartteacher.schedule.core.gradebook.GradebookManager
import com.smartteacher.schedule.core.gradebook.StudentScoreRecord
import com.smartteacher.schedule.core.sync.CloudSyncManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentManagementScreen(
    onNavigateBack: () -> Unit = {}
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val db = remember { SmartTeacherDatabase.getInstance(context) }

    val classrooms by db.classroomDao().getAllClassroomsFlow().collectAsState(initial = emptyList())
    var selectedClass by remember { mutableStateOf<ClassroomEntity?>(null) }

    // Screen sub-tab: 0 = Danh sách & Điểm danh, 1 = Sổ điểm Thông tư 22
    var selectedSubTab by remember { mutableStateOf(0) }
    var selectedSemester by remember { mutableStateOf("Học kỳ I") }

    LaunchedEffect(classrooms) {
        if (classrooms.isEmpty()) {
            coroutineScope.launch(Dispatchers.IO) {
                val defaultCls = ClassroomEntity(
                    id = "cls_cg24tc34",
                    name = "CG24TC34",
                    grade = "Khóa 24",
                    totalStudents = 0,
                    academicYear = "2024-2027",
                    notes = "Lớp thực hành kỹ thuật",
                    updatedAt = System.currentTimeMillis()
                )
                db.classroomDao().insertClassroom(defaultCls)
            }
        } else if (selectedClass == null) {
            selectedClass = classrooms.first()
        }
    }

    val studentsFlow = remember(selectedClass?.name) {
        if (selectedClass != null) {
            db.studentDao().getStudentsByClassFlow(selectedClass!!.name)
        } else {
            db.studentDao().getAllStudentsFlow()
        }
    }
    val students by studentsFlow.collectAsState(initial = emptyList())

    // Gradebook state
    var gradeRecords by remember { mutableStateOf<List<StudentScoreRecord>>(emptyList()) }
    var editingScoreRecord by remember { mutableStateOf<StudentScoreRecord?>(null) }

    // Sync student list to grade records
    LaunchedEffect(students, selectedClass?.name, selectedSemester) {
        val cName = selectedClass?.name ?: "CG24TC34"
        val saved = GradebookManager.getGradebook(context, cName, selectedSemester)
        val savedMap = saved.associateBy { it.studentId }

        val synced = students.map { st ->
            savedMap[st.id] ?: StudentScoreRecord(
                studentId = st.id,
                studentCode = st.studentCode,
                fullName = st.fullName,
                gender = st.gender
            )
        }
        synced.forEach { it.recalculate() }
        gradeRecords = synced
    }

    var showAddDialog by remember { mutableStateOf(false) }
    var newStudentName by remember { mutableStateOf("") }
    var newStudentCode by remember { mutableStateOf("") }
    var newStudentPhone by remember { mutableStateOf("") }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            coroutineScope.launch(Dispatchers.IO) {
                try {
                    val rawText = context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() } ?: ""
                    if (rawText.isNotBlank()) {
                        val cName = selectedClass?.name ?: "CG24TC34"
                        val cId = selectedClass?.id ?: "cls_cg24tc34"
                        val lines = rawText.split("\n").map { it.trim() }.filter { it.isNotBlank() }
                        val toInsert = mutableListOf<StudentEntity>()
                        var count = students.size + 1

                        for (line in lines) {
                            val parts = line.split(Regex("[\\t,;]")).map { it.trim() }.filter { it.isNotBlank() }
                            if (parts.isEmpty()) continue
                            var name = parts[0].replace(Regex("^[0-9]+[.\\-)\\s]+"), "").trim()
                            var code = ""
                            var phone = ""
                            var gender = "Nam"

                            if (parts.size > 1) {
                                if (parts[0].matches(Regex("^[A-Za-z0-9_-]+$"))) {
                                    code = parts[0]
                                    name = parts[1].replace(Regex("^[0-9]+[.\\-)\\s]+"), "").trim()
                                    if (parts.getOrNull(2)?.contains("nữ", ignoreCase = true) == true) gender = "Nữ"
                                    if (parts.size > 3) phone = parts[3].replace(Regex("[^0-9]"), "")
                                } else {
                                    name = parts[0].replace(Regex("^[0-9]+[.\\-)\\s]+"), "").trim()
                                    if (parts.getOrNull(1)?.contains("nữ", ignoreCase = true) == true) gender = "Nữ"
                                    if (parts.size > 2) phone = parts[2].replace(Regex("[^0-9]"), "")
                                }
                            }

                            if (name.length >= 2 && !name.contains("họ và tên", ignoreCase = true)) {
                                val stCode = if (code.isNotBlank()) code else "$cName-" + String.format("%02d", count++)
                                toInsert.add(StudentEntity(
                                    id = "std_" + System.currentTimeMillis() + "_" + toInsert.size,
                                    classId = cId,
                                    className = cName,
                                    studentCode = stCode,
                                    fullName = name,
                                    gender = gender,
                                    parentPhone = phone,
                                    kudosPoints = 5
                                ))
                            }
                        }

                        if (toInsert.isNotEmpty()) {
                            db.studentDao().insertStudents(toInsert)
                            CloudSyncManager.pushToCloud(context)
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Đã nạp thành công " + toInsert.size + " học sinh từ tệp!", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Không nhận diện được danh sách học sinh từ tệp", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Lỗi đọc tệp: " + e.message, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(text = "Học Sinh & Sổ Điểm Điện Tử", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        Text(text = "Thông tư 22/2021/TT-BGDĐT • Liên thông 4 cổng", fontSize = 11.sp, color = MaterialTheme.colorScheme.primary)
                    }
                },
                actions = {
                    IconButton(onClick = { filePickerLauncher.launch("*/*") }) {
                        Icon(imageVector = Icons.Default.UploadFile, contentDescription = "Tải file danh sách", tint = Color(0xFF10B981))
                    }
                    IconButton(onClick = {
                        coroutineScope.launch(Dispatchers.IO) {
                            CloudSyncManager.syncBothWays(context)
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Đã đồng bộ dữ liệu học sinh với đám mây!", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }) {
                        Icon(imageVector = Icons.Default.Sync, contentDescription = "Đồng bộ", tint = MaterialTheme.colorScheme.primary)
                    }
                }
            )
        },
        floatingActionButton = {
            if (selectedSubTab == 0) {
                FloatingActionButton(
                    onClick = { showAddDialog = true },
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    Icon(imageVector = Icons.Default.PersonAdd, contentDescription = "Thêm học sinh")
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 14.dp)
        ) {
            // Sub-Tab Switcher: 0 = Danh sách & Chuyên cần | 1 = Sổ Điểm TT 22
            TabRow(
                selectedTabIndex = selectedSubTab,
                modifier = Modifier.padding(bottom = 6.dp)
            ) {
                Tab(
                    selected = selectedSubTab == 0,
                    onClick = { selectedSubTab = 0 },
                    text = { Text("📋 Danh Sách & Nề Nếp", fontWeight = FontWeight.Bold, fontSize = 13.sp) }
                )
                Tab(
                    selected = selectedSubTab == 1,
                    onClick = { selectedSubTab = 1 },
                    text = { Text("📊 Sổ Điểm TT 22", fontWeight = FontWeight.Bold, fontSize = 13.sp) }
                )
            }

            // Class selector tabs
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(vertical = 4.dp)
            ) {
                items(classrooms) { cls ->
                    val isSelected = selectedClass?.id == cls.id
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedClass = cls },
                        label = {
                            Text(text = cls.name, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal)
                        },
                        leadingIcon = if (isSelected) {
                            { Icon(imageVector = Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp)) }
                        } else null
                    )
                }
            }

            // ================= TAB 0: DANH SÁCH & NỀ NẾP =================
            if (selectedSubTab == 0) {
                // File Upload & Quick Add Action Row
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { filePickerLauncher.launch("*/*") },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(imageVector = Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Nạp danh sách (.csv, .txt)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = { showAddDialog = true },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Thêm HS", fontSize = 11.sp)
                    }
                }

                // Summary Card
                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f))
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            val cName = selectedClass?.name ?: "Tất cả"
                            Text(text = "Lớp: $cName", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text(text = "Sĩ số: " + students.size + " học sinh", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                        }
                        val totalKudos = students.sumOf { it.kudosPoints }
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFFF59E0B).copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "⭐ +" + totalKudos + " nề nếp",
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFFD97706),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                // Students List
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(top = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(students, key = { it.id }) { st ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(34.dp)
                                            .clip(CircleShape)
                                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = st.fullName.takeLast(1),
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }

                                    Column {
                                        Text(text = st.fullName, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        val phoneStr = if (st.parentPhone.isNotBlank()) st.parentPhone else "Chưa có"
                                        Text(text = "Mã: " + st.studentCode + " • SĐT: " + phoneStr, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = Color(0xFF10B981).copy(alpha = 0.15f),
                                        modifier = Modifier.clickable {
                                            coroutineScope.launch(Dispatchers.IO) {
                                                db.studentDao().updateKudosPoints(st.id, 1)
                                            }
                                            Toast.makeText(context, "+1 điểm cho " + st.fullName, Toast.LENGTH_SHORT).show()
                                        }
                                    ) {
                                        Text(
                                            text = "+1 Khen",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF059669),
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                        )
                                    }

                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = Color(0xFFF59E0B).copy(alpha = 0.15f)
                                    ) {
                                        Text(
                                            text = "⭐ " + st.kudosPoints,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFFD97706),
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ================= TAB 1: SỔ ĐIỂM THÔNG TƯ 22 =================
            if (selectedSubTab == 1) {
                // Semester selector & action bar
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        listOf("Học kỳ I", "Học kỳ II", "Cả năm").forEach { sem ->
                            FilterChip(
                                selected = selectedSemester == sem,
                                onClick = { selectedSemester = sem },
                                label = { Text(sem, fontSize = 11.sp, fontWeight = if (selectedSemester == sem) FontWeight.Bold else FontWeight.Normal) }
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        IconButton(
                            onClick = {
                                val cName = selectedClass?.name ?: "CG24TC34"
                                val text = GradebookManager.exportGradebookToText(cName, selectedSemester, gradeRecords)
                                val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                cm.setPrimaryClip(ClipData.newPlainText("BangDiemTT22", text))
                                Toast.makeText(context, "Đã sao chép bảng điểm vào bộ nhớ tạm!", Toast.LENGTH_SHORT).show()
                            }
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Sao chép", modifier = Modifier.size(20.dp), tint = MaterialTheme.colorScheme.primary)
                        }

                        IconButton(
                            onClick = {
                                val cName = selectedClass?.name ?: "CG24TC34"
                                val text = GradebookManager.exportGradebookToText(cName, selectedSemester, gradeRecords)
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, text)
                                    type = "text/plain"
                                }
                                context.startActivity(Intent.createChooser(sendIntent, "Chia sẻ bảng điểm"))
                            }
                        ) {
                            Icon(Icons.Default.Share, contentDescription = "Chia sẻ", modifier = Modifier.size(20.dp), tint = Color(0xFF059669))
                        }
                    }
                }

                // Stats Banner
                val graded = gradeRecords.count { it.dtb != null }
                Card(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Tổng sĩ số: " + gradeRecords.size + " | Đã có ĐTB: $graded", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            val avgClass = if (graded > 0) {
                                (gradeRecords.mapNotNull { it.dtb }.sum() / graded * 10).toInt() / 10f
                            } else 0f
                            Text("ĐTB Lớp: " + (if (avgClass > 0) avgClass.toString() else "--"), fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                        }

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            val tot = gradeRecords.count { it.academicLevel == "Tốt" }
                            val kha = gradeRecords.count { it.academicLevel == "Khá" }
                            val dat = gradeRecords.count { it.academicLevel == "Đạt" }
                            val chuaDat = gradeRecords.count { it.academicLevel == "Chưa đạt" }

                            Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFF10B981).copy(alpha = 0.15f), modifier = Modifier.weight(1f)) {
                                Text("Tốt: $tot", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669), modifier = Modifier.padding(4.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                            }
                            Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFF3B82F6).copy(alpha = 0.15f), modifier = Modifier.weight(1f)) {
                                Text("Khá: $kha", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1D4ED8), modifier = Modifier.padding(4.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                            }
                            Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFFF59E0B).copy(alpha = 0.15f), modifier = Modifier.weight(1f)) {
                                Text("Đạt: $dat", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFFD97706), modifier = Modifier.padding(4.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                            }
                            Surface(shape = RoundedCornerShape(6.dp), color = Color(0xFFEF4444).copy(alpha = 0.15f), modifier = Modifier.weight(1f)) {
                                Text("Chưa: $chuaDat", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDC2626), modifier = Modifier.padding(4.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                            }
                        }
                    }
                }

                // Header column guide
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 6.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Học sinh (Chạm để nhập điểm)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    Text("ĐGTX(hs1) • ĐGGK(hs2) • ĐGCK(hs3) ➔ ĐTB", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }

                // Score list
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(gradeRecords) { record ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { editingScoreRecord = record.copy() },
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(text = record.fullName, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 2.dp)) {
                                        Text("TX1: " + (record.tx1?.toString() ?: "-"), fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                                        Text("TX2: " + (record.tx2?.toString() ?: "-"), fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                                        Text("TX3: " + (record.tx3?.toString() ?: "-"), fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                                        Text("GK: " + (record.gk?.toString() ?: "-"), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0284C7))
                                        Text("CK: " + (record.ck?.toString() ?: "-"), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF7C3AED))
                                    }
                                }

                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Column(horizontalAlignment = Alignment.End) {
                                        val dtbText = record.dtb?.toString() ?: "--"
                                        val dtbColor = when {
                                            (record.dtb ?: 0f) >= 8.0f -> Color(0xFF059669)
                                            (record.dtb ?: 0f) >= 6.5f -> Color(0xFF1D4ED8)
                                            (record.dtb ?: 0f) >= 5.0f -> Color(0xFFD97706)
                                            else -> Color(0xFFDC2626)
                                        }
                                        Text(text = "ĐTB: $dtbText", fontWeight = FontWeight.ExtraBold, fontSize = 13.sp, color = dtbColor)
                                        Text(text = record.academicLevel, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = dtbColor)
                                    }
                                    Icon(Icons.Default.EditNote, contentDescription = "Nhập điểm", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Dialog: Edit Score for a student
    if (editingScoreRecord != null) {
        val st = editingScoreRecord!!
        var tx1Input by remember { mutableStateOf(st.tx1?.toString() ?: "") }
        var tx2Input by remember { mutableStateOf(st.tx2?.toString() ?: "") }
        var tx3Input by remember { mutableStateOf(st.tx3?.toString() ?: "") }
        var gkInput by remember { mutableStateOf(st.gk?.toString() ?: "") }
        var ckInput by remember { mutableStateOf(st.ck?.toString() ?: "") }

        AlertDialog(
            onDismissRequest = { editingScoreRecord = null },
            title = {
                Column {
                    Text(text = "Nhập Điểm Thông Tư 22", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text(text = st.fullName + " (" + st.studentCode + ")", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Đánh giá thường xuyên (Hệ số 1):", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedTextField(
                            value = tx1Input,
                            onValueChange = { tx1Input = it.take(4) },
                            label = { Text("TX 1") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = tx2Input,
                            onValueChange = { tx2Input = it.take(4) },
                            label = { Text("TX 2") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = tx3Input,
                            onValueChange = { tx3Input = it.take(4) },
                            label = { Text("TX 3") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Text("Định kỳ: Giữa kỳ (Hệ số 2) & Cuối kỳ (Hệ số 3):", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        OutlinedTextField(
                            value = gkInput,
                            onValueChange = { gkInput = it.take(4) },
                            label = { Text("Giữa kỳ (x2)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = ckInput,
                            onValueChange = { ckInput = it.take(4) },
                            label = { Text("Cuối kỳ (x3)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val updated = gradeRecords.map { item ->
                            if (item.studentId == st.studentId) {
                                item.copy(
                                    tx1 = tx1Input.toFloatOrNull(),
                                    tx2 = tx2Input.toFloatOrNull(),
                                    tx3 = tx3Input.toFloatOrNull(),
                                    gk = gkInput.toFloatOrNull(),
                                    ck = ckInput.toFloatOrNull()
                                ).apply { recalculate() }
                            } else item
                        }
                        gradeRecords = updated
                        val cName = selectedClass?.name ?: "CG24TC34"
                        GradebookManager.saveGradebook(context, cName, selectedSemester, updated)
                        editingScoreRecord = null
                        Toast.makeText(context, "Đã lưu điểm cho " + st.fullName, Toast.LENGTH_SHORT).show()
                    }
                ) {
                    Text("Lưu Điểm")
                }
            },
            dismissButton = {
                TextButton(onClick = { editingScoreRecord = null }) {
                    Text("Hủy")
                }
            }
        )
    }

    // Dialog: Add new student
    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text(text = "Thêm Học Sinh Mới", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    val cName = selectedClass?.name ?: "CG24TC34"
                    Text(text = "Thêm vào lớp: $cName", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                    OutlinedTextField(
                        value = newStudentName,
                        onValueChange = { newStudentName = it },
                        label = { Text("Họ và Tên") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newStudentCode,
                        onValueChange = { newStudentCode = it },
                        label = { Text("Mã học sinh (bỏ trống để tự tạo)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newStudentPhone,
                        onValueChange = { newStudentPhone = it },
                        label = { Text("Số điện thoại phụ huynh") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newStudentName.isNotBlank()) {
                            val cName = selectedClass?.name ?: "CG24TC34"
                            val cId = selectedClass?.id ?: "cls_cg24tc34"
                            val stCode = if (newStudentCode.isNotBlank()) newStudentCode else "$cName-" + String.format("%02d", students.size + 1)
                            val newSt = StudentEntity(
                                id = "std_" + System.currentTimeMillis(),
                                classId = cId,
                                className = cName,
                                studentCode = stCode,
                                fullName = newStudentName.trim(),
                                parentPhone = newStudentPhone.trim(),
                                kudosPoints = 5
                            )
                            coroutineScope.launch(Dispatchers.IO) {
                                db.studentDao().insertStudent(newSt)
                                CloudSyncManager.pushToCloud(context)
                            }
                            showAddDialog = false
                            newStudentName = ""
                            newStudentCode = ""
                            newStudentPhone = ""
                            Toast.makeText(context, "Đã thêm học sinh thành công!", Toast.LENGTH_SHORT).show()
                        }
                    }
                ) {
                    Text("Thêm")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }
}
