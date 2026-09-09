package com.smartteacher.schedule.feature.students

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
import com.smartteacher.schedule.core.sync.CloudSyncManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentManagementScreen(
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val db = remember { SmartTeacherDatabase.getInstance(context) }

    val classrooms by db.classroomDao().getAllClassroomsFlow().collectAsState(initial = emptyList())
    var selectedClass by remember { mutableStateOf<ClassroomEntity?>(null) }

    LaunchedEffect(classrooms) {
        if (selectedClass == null && classrooms.isNotEmpty()) {
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

    var showAddDialog by remember { mutableStateOf(false) }
    var newStudentName by remember { mutableStateOf("") }
    var newStudentCode by remember { mutableStateOf("") }
    var newStudentPhone by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(text = "Quản lý Lớp & Học Sinh", fontWeight = FontWeight.Bold)
                        Text(text = "Hệ sinh thái Giáo viên ⇄ Học sinh", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Quay lại")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        coroutineScope.launch(Dispatchers.IO) {
                            CloudSyncManager.syncBothWays(context)
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Đã đồng bộ dữ liệu học sinh với đám mây!", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }) {
                        Icon(imageVector = Icons.Default.Sync, contentDescription = "Đồng bộ")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(imageVector = Icons.Default.PersonAdd, contentDescription = "Thêm học sinh")
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Class selector tabs
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(vertical = 8.dp)
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

            // Summary Card
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f))
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        val cName = selectedClass?.name ?: "Tất cả"
                        Text(text = "Lớp: $cName", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(text = "Sĩ số: ${students.size} học sinh", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                    }
                    val totalKudos = students.sumOf { it.kudosPoints }
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFF59E0B).copy(alpha = 0.2f)
                    ) {
                        Text(
                            text = "⭐ +$totalKudos nề nếp",
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFFD97706),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Students List
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(top = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(students, key = { it.id }) { st ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
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
                                        .size(36.dp)
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
                                    Text(text = st.fullName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    val phoneStr = if (st.parentPhone.isNotBlank()) st.parentPhone else "Chưa có"
                                    Text(text = "Mã: ${st.studentCode} • SĐT: $phoneStr", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                                }
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = Color(0xFF10B981).copy(alpha = 0.15f),
                                    modifier = Modifier.clickable {
                                        coroutineScope.launch(Dispatchers.IO) {
                                            db.studentDao().updateKudosPoints(st.id, 1)
                                        }
                                        Toast.makeText(context, "+1 điểm cho ${st.fullName}", Toast.LENGTH_SHORT).show()
                                    }
                                ) {
                                    Text(
                                        text = "+1 Khen",
                                        fontSize = 11.sp,
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
                                        text = "⭐ ${st.kudosPoints}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color(0xFFD97706),
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Add Student Dialog
    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text(text = "Thêm học sinh mới") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newStudentName,
                        onValueChange = { newStudentName = it },
                        label = { Text("Họ và tên") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newStudentCode,
                        onValueChange = { newStudentCode = it },
                        label = { Text("Mã số HS (Tùy chọn)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newStudentPhone,
                        onValueChange = { newStudentPhone = it },
                        label = { Text("SĐT Phụ huynh") },
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
                            val code = newStudentCode.ifBlank { "$cName-${String.format("%02d", students.size + 1)}" }
                            val newEntity = StudentEntity(
                                id = "std_${System.currentTimeMillis()}",
                                classId = selectedClass?.id ?: "cls_cg24tc34",
                                className = cName,
                                studentCode = code,
                                fullName = newStudentName.trim(),
                                parentPhone = newStudentPhone.trim(),
                                kudosPoints = 5
                            )
                            coroutineScope.launch(Dispatchers.IO) {
                                db.studentDao().insertStudent(newEntity)
                            }
                            newStudentName = ""
                            newStudentCode = ""
                            newStudentPhone = ""
                            showAddDialog = false
                            Toast.makeText(context, "Đã thêm học sinh!", Toast.LENGTH_SHORT).show()
                        }
                    }
                ) {
                    Text("Lưu")
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
