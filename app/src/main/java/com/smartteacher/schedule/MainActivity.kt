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
        } else {
            Toast.makeText(this, "Lưu ý: Nếu không cấp quyền, điện thoại sẽ không thể nhắc trước giờ dạy.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        database = SmartTeacherDatabase.getInstance(this)
        alarmScheduler = AndroidAlarmScheduler(this)
        aiService = GeminiAIServiceImpl(this) { geminiApiKey }

        checkNotificationPermission()
        ScheduleWidgetReceiver.updateAllWidgets(this)

        setContent {
            SmartTeacherScheduleTheme {
                val navController = rememberNavController()
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                // Reactive DB State flows
                val todayStr = remember { LocalDate.now().toString() }
                val todayEvents by database.calendarEventDao().getEventsForDate(todayStr).collectAsState(initial = emptyList())
                val allEvents by database.calendarEventDao().getAllEvents().collectAsState(initial = emptyList())
                val todayTasks by database.taskDao().getTasksForDate(todayStr).collectAsState(initial = emptyList())
                val allTasks by database.taskDao().getAllTasks().collectAsState(initial = emptyList())
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
                            SettingsScreen(
                                onOpenReliabilityCenter = {
                                    navController.navigate(Screen.ReliabilityCenter.route)
                                },
                                onOpenNotificationTest = {
                                    navController.navigate(Screen.NotificationTest.route)
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
                                telegramEnabled = true,
                                onToggleTelegram = { },
                                onSaveTelegramCreds = { token, chatId -> },
                                geminiApiKey = geminiApiKey,
                                onSaveGeminiApiKey = { key -> geminiApiKey = key }
                            )
                        }

                        // SUB-SCREENS
                        composable(Screen.AddSchedule.route) {
                            AddTeachingScheduleScreen(
                                onBack = { navController.popBackStack() },
                                onSave = { schedule ->
                                    saveTeachingSchedule(schedule)
                                    navController.popBackStack()
                                    Toast.makeText(this@MainActivity, "Đã tạo lịch và hẹn giờ nhắc 60m & 15m!", Toast.LENGTH_SHORT).show()
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

    private fun saveTeachingSchedule(schedule: com.smartteacher.schedule.core.database.entity.TeachingScheduleEntity) {
        lifecycleScope.launch(Dispatchers.IO) {
            val scheduleId = database.teachingScheduleDao().insertSchedule(schedule)

            // Convert to concrete CalendarEventEntity for today / recurrence
            val todayStr = LocalDate.now().toString()
            val event = CalendarEventEntity(
                teachingScheduleId = scheduleId,
                title = schedule.subject,
                subject = schedule.subject,
                className = schedule.className,
                room = schedule.room,
                date = todayStr,
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

            // Schedule dual reminders via AlarmManager
            alarmScheduler.scheduleEventReminders(insertedEvent)

            // Update Home Screen Widget
            ScheduleWidgetReceiver.updateAllWidgets(this@MainActivity)
        }
    }

    private fun updateEventAndReschedule(event: CalendarEventEntity) {
        lifecycleScope.launch(Dispatchers.IO) {
            database.calendarEventDao().updateEvent(event)
            // If linked to teachingSchedule, also update parent
            if (event.teachingScheduleId != null) {
                val schedule = database.teachingScheduleDao().getScheduleById(event.teachingScheduleId)
                if (schedule != null) {
                    database.teachingScheduleDao().updateSchedule(
                        schedule.copy(
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
