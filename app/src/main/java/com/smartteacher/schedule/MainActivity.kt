package com.smartteacher.schedule

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.smartteacher.schedule.core.ai.GeminiAIServiceImpl
import com.smartteacher.schedule.core.alarms.AndroidAlarmScheduler
import com.smartteacher.schedule.core.database.SmartTeacherDatabase
import com.smartteacher.schedule.core.database.entity.CalendarEventEntity
import com.smartteacher.schedule.core.database.entity.TaskEntity
import com.smartteacher.schedule.core.model.TaskStatus
import com.smartteacher.schedule.core.util.DataExportHelper
import com.smartteacher.schedule.feature.ai.AIAssistantScreen
import com.smartteacher.schedule.feature.calendar.CalendarScreen
import com.smartteacher.schedule.feature.reliability.NotificationTestScreen
import com.smartteacher.schedule.feature.reliability.ReliabilityCenterScreen
import com.smartteacher.schedule.feature.schedule.AddTeachingScheduleScreen
import com.smartteacher.schedule.feature.settings.SettingsScreen
import com.smartteacher.schedule.feature.today.TodayScreen
import com.smartteacher.schedule.feature.widget.ScheduleWidgetReceiver
import com.smartteacher.schedule.ui.navigation.Screen
import com.smartteacher.schedule.ui.navigation.bottomNavScreens
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.smartteacher.schedule.core.alarms.DailyRefreshManager
import com.smartteacher.schedule.feature.lockscreen.LockScreenGlanceManager
import com.smartteacher.schedule.ui.theme.SmartTeacherScheduleTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalDate

class MainActivity : ComponentActivity() {

    private lateinit var database: SmartTeacherDatabase
    private lateinit var alarmScheduler: AndroidAlarmScheduler
    private lateinit var aiService: GeminiAIServiceImpl

    private var geminiApiKey by mutableStateOf("")

    // Runtime Permission Request for Android 13+
    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            Toast.makeText(this, "Đã cấp quyền thông báo nhắc lịch!", Toast.LENGTH_SHORT).show()
            LockScreenGlanceManager.updateLockScreenGlance(this)
            ScheduleWidgetReceiver.updateAllWidgets(this)
        } else {
            Toast.makeText(this, "Lưu ý: Nếu không cấp quyền, điện thoại sẽ không thể nhắc trước giờ dạy.", Toast.LENGTH_LONG).show()
        }
    }

    private val requestCalendarPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val writeGranted = permissions[android.Manifest.permission.WRITE_CALENDAR] == true
        if (writeGranted) {
            syncAllEventsToGoogleCalendar()
        } else {
            Toast.makeText(this, "Cần cấp quyền Lịch để đồng bộ với Google Calendar!", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        database = SmartTeacherDatabase.getInstance(this)
        alarmScheduler = AndroidAlarmScheduler(this)
        aiService = GeminiAIServiceImpl(this) { geminiApiKey }

        checkNotificationPermission()
        LockScreenGlanceManager.updateLockScreenGlance(this)
        ScheduleWidgetReceiver.updateAllWidgets(this)

        setContent {
            SmartTeacherScheduleTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                // Reactive DB State flows synchronized with live phone date
                var currentDate by remember { mutableStateOf(LocalDate.now()) }
                val todayStr = remember(currentDate) { currentDate.toString() }

                val context = this@MainActivity
                DisposableEffect(Unit) {
                    val filter = IntentFilter().apply {
                        addAction(Intent.ACTION_TIME_TICK)
                        addAction(Intent.ACTION_TIME_CHANGED)
                        addAction(Intent.ACTION_DATE_CHANGED)
                        addAction(Intent.ACTION_TIMEZONE_CHANGED)
                    }
                    val timeReceiver = object : BroadcastReceiver() {
                        override fun onReceive(c: Context?, intent: Intent?) {
                            val now = LocalDate.now()
                            if (now != currentDate) {
                                currentDate = now
                                lifecycleScope.launch(Dispatchers.IO) {
                                    DailyRefreshManager.performDailyMidnightRefresh(context)
                                }
                            }
                        }
                    }
                    context.registerReceiver(timeReceiver, filter)
                    onDispose {
                        context.unregisterReceiver(timeReceiver)
                    }
                }

                val todayEvents by database.calendarEventDao().getEventsForDate(todayStr).collectAsState(initial = emptyList())
                val allEvents by database.calendarEventDao().getAllEvents().collectAsState(initial = emptyList())
                val todayTasks by database.taskDao().getTasksForDate(todayStr).collectAsState(initial = emptyList())
                val allTasks by database.taskDao().getAllTasks().collectAsState(initial = emptyList())
                val allSchedules by database.teachingScheduleDao().getAllActiveSchedules().collectAsState(initial = emptyList())
                val notificationLogs by database.notificationLogDao().getRecentLogs().collectAsState(initial = emptyList())

                var aiWarnings by remember { mutableStateOf<List<String>>(emptyList()) }

                // Collect AI risks for today
                LaunchedEffect(todayEvents, todayTasks) {
                    val risks = aiService.detectScheduleRisks(todayEvents, todayTasks)
                    aiWarnings = risks.map { it.description }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        // Only show bottom bar on core top-level tabs
                        if (bottomNavScreens.any { it.route == currentRoute }) {
                            NavigationBar {
                                bottomNavScreens.forEach { screen ->
                                    NavigationBarItem(
                                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                                        label = { Text(screen.title) },
                                        selected = currentRoute == screen.route,
                                        onClick = {
                                            if (currentRoute != screen.route) {
                                                navController.navigate(screen.route) {
                                                    popUpTo(Screen.Today.route) { saveState = true }
                                                    launchSingleTop = true
                                                    restoreState = true
                                                }
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = Screen.Today.route,
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        // 1. TODAY SCREEN
                        composable(Screen.Today.route) {
                            TodayScreen(
                                todayEvents = todayEvents,
                                todayTasks = todayTasks,
                                aiWarnings = aiWarnings,
                                onEventClick = { },
                                onEditEvent = { updatedEvent ->
                                    updateEventAndReschedule(updatedEvent)
                                },
                                onDeleteEvent = { event ->
                                    deleteEventAndCancelAlarms(event)
                                },
                                onTaskToggle = { task ->
                                    toggleTaskCompletion(task)
                                },
                                onAddScheduleClick = {
                                    navController.navigate(Screen.AddSchedule.route)
                                },
                                onOpenAIClick = {
                                    navController.navigate(Screen.AIAssistant.route)
                                }
                            )
                        }

                        // 2. CALENDAR SCREEN
                        composable(Screen.Calendar.route) {
                            CalendarScreen(
                                events = allEvents,
                                onEventClick = { },
                                onEditEvent = { updatedEvent ->
                                    updateEventAndReschedule(updatedEvent)
                                },
                                onDeleteEvent = { event ->
                                    deleteEventAndCancelAlarms(event)
                                }
                            )
                        }

                        // 3. TASKS SCREEN
                        composable(Screen.Tasks.route) {
                            com.smartteacher.schedule.feature.tasks.TasksScreen(
                                tasks = allTasks,
                                onToggleTask = { task ->
                                    toggleTaskCompletion(task)
                                },
                                onAddTask = { newTask ->
                                    lifecycleScope.launch(Dispatchers.IO) {
                                        database.taskDao().insertTask(newTask)
                                    }
                                },
                                onDeleteTask = { task ->
                                    lifecycleScope.launch(Dispatchers.IO) {
                                        database.taskDao().deleteTask(task)
                                    }
                                }
                            )
                        }

                        // 4. AI ASSISTANT SCREEN
                        composable(Screen.AIAssistant.route) {
                            AIAssistantScreen(
                                aiService = aiService,
                                events = todayEvents,
                                tasks = allTasks,
                                onSaveImportedSchedule = { schedule ->
                                    saveTeachingSchedule(schedule)
                                },
                                onMoveUnfinishedTasks = {
                                    lifecycleScope.launch(Dispatchers.IO) {
                                        val today = LocalDate.now().toString()
                                        val tomorrow = LocalDate.now().plusDays(1).toString()
                                        database.taskDao().moveUnfinishedTasksToDate(today, tomorrow)
                                    }
                                }
                            )
                        }

                        // 5. SETTINGS SCREEN
                        composable(Screen.Settings.route) {
                            var showReportDialogInSettings by remember { mutableStateOf(false) }

                            if (showReportDialogInSettings) {
                                com.smartteacher.schedule.feature.schedule.components.ExportPedagogicalReportDialog(
                                    onDismiss = { showReportDialogInSettings = false },
                                    allEvents = allEvents
                                )
                            }

                            SettingsScreen(
                                onOpenReliabilityCenter = {
                                    navController.navigate(Screen.ReliabilityCenter.route)
                                },
                                onTriggerDailyRefresh = {
                                    lifecycleScope.launch(Dispatchers.IO) {
                                        DailyRefreshManager.performDailyMidnightRefresh(this@MainActivity)
                                        withContext(Dispatchers.Main) {
                                            Toast.makeText(this@MainActivity, "Đã làm mới lịch dạy, công việc và Widget hôm nay!", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                },
                                onExportJson = {
                                    lifecycleScope.launch(Dispatchers.IO) {
                                        val json = DataExportHelper.exportEventsToJson(todayEvents)
                                        withContext(Dispatchers.Main) {
                                            Toast.makeText(this@MainActivity, "Đã sao lưu JSON (${json.length} ký tự)", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                },
                                onExportCsv = {
                                    lifecycleScope.launch(Dispatchers.IO) {
                                        val csv = DataExportHelper.exportEventsToCsv(todayEvents)
                                        withContext(Dispatchers.Main) {
                                            Toast.makeText(this@MainActivity, "Đã xuất CSV thời khóa biểu", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                },
                                onOpenReportDialog = {
                                    showReportDialogInSettings = true
                                },
                                telegramEnabled = true,
                                onToggleTelegram = { },
                                onSaveTelegramCreds = { token, chatId -> },
                                geminiApiKey = geminiApiKey,
                                onSaveGeminiApiKey = { key -> geminiApiKey = key },
                                onSyncGoogleCalendar = { syncAllEventsToGoogleCalendar() }
                            )
                        }

                        // SUB-SCREENS
                        composable(Screen.AddSchedule.route) {
                            AddTeachingScheduleScreen(
                                onBack = { navController.popBackStack() },
                                existingSchedules = allSchedules,
                                onSave = { schedule, attachments ->
                                    saveTeachingSchedule(schedule, attachments)
                                    navController.popBackStack()
                                    Toast.makeText(this@MainActivity, "Đã tạo lịch và lưu giáo án đính kèm!", Toast.LENGTH_SHORT).show()
                                }
                            )
                        }

                        composable(Screen.ReliabilityCenter.route) {
                            ReliabilityCenterScreen(
                                onBack = { navController.popBackStack() },
                                logs = notificationLogs
                            )
                        }

                        composable(Screen.NotificationTest.route) {
                            NotificationTestScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val permissionStatus = ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            )
            if (permissionStatus != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun toggleTaskCompletion(task: TaskEntity) {
        lifecycleScope.launch(Dispatchers.IO) {
            val newStatus = if (task.status == TaskStatus.COMPLETED) TaskStatus.TODO else TaskStatus.COMPLETED
            val completedTime = if (newStatus == TaskStatus.COMPLETED) System.currentTimeMillis() else null
            database.taskDao().updateTaskStatus(task.id, newStatus, completedTime)
        }
    }

    override fun onResume() {
        super.onResume()
        LockScreenGlanceManager.updateLockScreenGlance(this)
        ScheduleWidgetReceiver.updateAllWidgets(this)
        lifecycleScope.launch(Dispatchers.IO) {
            DailyRefreshManager.scheduleNextMidnightAlarm(this@MainActivity)
        }
    }

    private fun saveTeachingSchedule(
        schedule: com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity,
        attachments: List<com.smartteacher.schedule.core.database.entity.LessonAttachmentEntity> = emptyList()
    ) {
        lifecycleScope.launch(Dispatchers.IO) {
            val scheduleId = database.teachingScheduleDao().insertSchedule(schedule)

            // Calculate date matching the target dayOfWeek (1 = Monday, 7 = Sunday)
            val today = LocalDate.now()
            val daysUntilTarget = (schedule.dayOfWeek - today.dayOfWeek.value + 7) % 7
            val targetDate = if (daysUntilTarget == 0) today else today.plusDays(daysUntilTarget.toLong())
            val targetDateStr = targetDate.toString()

            val event = CalendarEventEntity(
                teachingScheduleId = scheduleId,
                title = schedule.subject,
                subject = schedule.subject,
                className = schedule.className,
                room = schedule.room,
                date = targetDateStr,
                startTime = schedule.startTime,
                endTime = schedule.endTime,
                notes = schedule.notes,
                reminder1Minutes = schedule.reminder1Minutes,
                reminder2Minutes = schedule.reminder2Minutes,
                reminder1Enabled = schedule.reminder1Enabled,
                reminder2Enabled = schedule.reminder2Enabled
            )

            val eventId = database.calendarEventDao().insertEvent(event)
            val insertedEvent = event.copy(id = eventId)

            // Lưu các tệp giáo án & tài liệu đính kèm liên kết với cả eventId và scheduleId
            if (attachments.isNotEmpty()) {
                val toInsert = attachments.map {
                    it.copy(eventId = eventId, teachingScheduleId = scheduleId)
                }
                database.lessonAttachmentDao().insertAttachments(toInsert)
            }

            // Schedule dual reminders via AlarmManager
            alarmScheduler.scheduleEventReminders(insertedEvent)

            // Update Home Screen Widget & Lock Screen Glance
            ScheduleWidgetReceiver.updateAllWidgets(this@MainActivity)
            LockScreenGlanceManager.updateLockScreenGlance(this@MainActivity)
        }
    }

    private fun updateEventAndReschedule(event: CalendarEventEntity) {
        lifecycleScope.launch(Dispatchers.IO) {
            database.calendarEventDao().updateEvent(event)
            // If linked to teachingSchedule, also update parent (including new day of week!)
            if (event.teachingScheduleId != null) {
                val newDayOfWeek = try { LocalDate.parse(event.date).dayOfWeek.value } catch (e: Exception) { null }
                val schedule = database.teachingScheduleDao().getScheduleById(event.teachingScheduleId)
                if (schedule != null) {
                    database.teachingScheduleDao().updateSchedule(
                        schedule.copy(
                            dayOfWeek = newDayOfWeek ?: schedule.dayOfWeek,
                            subject = event.subject,
                            className = event.className,
                            room = event.room,
                            startTime = event.startTime,
                            endTime = event.endTime,
                            notes = event.notes,
                            reminder1Enabled = event.reminder1Enabled,
                            reminder2Enabled = event.reminder2Enabled
                        )
                    )
                }
            }
            // Reschedule alarms
            alarmScheduler.cancelEventReminders(event.id)
            if (event.reminder1Enabled || event.reminder2Enabled) {
                alarmScheduler.scheduleEventReminders(event)
            }
            ScheduleWidgetReceiver.updateAllWidgets(this@MainActivity)
            withContext(Dispatchers.Main) {
                Toast.makeText(this@MainActivity, "Đã cập nhật lịch dạy thành công!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun syncAllEventsToGoogleCalendar() {
        if (!com.smartteacher.schedule.core.sync.GoogleCalendarManager.hasCalendarPermissions(this)) {
            requestCalendarPermissionLauncher.launch(
                arrayOf(android.Manifest.permission.READ_CALENDAR, android.Manifest.permission.WRITE_CALENDAR)
            )
            return
        }
        lifecycleScope.launch(Dispatchers.IO) {
            val manager = com.smartteacher.schedule.core.sync.GoogleCalendarManager(this@MainActivity)
            val count = manager.exportAllEvents()
            withContext(Dispatchers.Main) {
                if (count > 0) {
                    Toast.makeText(this@MainActivity, "Đã đồng bộ thành công $count ca dạy sang Google Calendar!", Toast.LENGTH_LONG).show()
                } else {
                    Toast.makeText(this@MainActivity, "Tất cả lịch dạy đã được đồng bộ lên Google Calendar!", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun deleteEventAndCancelAlarms(event: CalendarEventEntity) {
        lifecycleScope.launch(Dispatchers.IO) {
            database.calendarEventDao().deleteEvent(event)
            alarmScheduler.cancelEventReminders(event.id)
            ScheduleWidgetReceiver.updateAllWidgets(this@MainActivity)
            withContext(Dispatchers.Main) {
                Toast.makeText(this@MainActivity, "Đã xóa lịch dạy!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
