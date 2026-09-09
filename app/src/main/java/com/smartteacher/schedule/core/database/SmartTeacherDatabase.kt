package com.smartteacher.schedule.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.smartteacher.schedule.core.ai.DefaultKnowledgeBase
import com.smartteacher.schedule.core.database.dao.*
import com.smartteacher.schedule.core.database.entity.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        TeachingScheduleEntity::class,
        CalendarEventEntity::class,
        TaskEntity::class,
        ReminderEntity::class,
        AIInsightEntity::class,
        NotificationLogEntity::class,
        IntegrationConfigEntity::class,
        LessonAttachmentEntity::class,
        KnowledgeDocumentEntity::class,
        ClassroomEntity::class,
        StudentEntity::class,
        AttendanceRecordEntity::class
    ],
    version = 7,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class SmartTeacherDatabase : RoomDatabase() {
    abstract fun teachingScheduleDao(): TeachingScheduleDao
    abstract fun calendarEventDao(): CalendarEventDao
    abstract fun taskDao(): TaskDao
    abstract fun reminderDao(): ReminderDao
    abstract fun aiInsightDao(): AIInsightDao
    abstract fun notificationLogDao(): NotificationLogDao
    abstract fun integrationConfigDao(): IntegrationConfigDao
    abstract fun lessonAttachmentDao(): LessonAttachmentDao
    abstract fun knowledgeDocumentDao(): KnowledgeDocumentDao
    abstract fun classroomDao(): ClassroomDao
    abstract fun studentDao(): StudentDao
    abstract fun attendanceDao(): AttendanceDao

    companion object {
        @Volatile
        private var INSTANCE: SmartTeacherDatabase? = null

        val MIGRATION_1_2 = object : androidx.room.migration.Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS `lesson_attachments` (
                        `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        `eventId` INTEGER,
                        `teachingScheduleId` INTEGER,
                        `fileName` TEXT NOT NULL,
                        `fileUri` TEXT NOT NULL,
                        `fileType` TEXT NOT NULL,
                        `fileSizeBytes` INTEGER NOT NULL,
                        `title` TEXT NOT NULL,
                        `description` TEXT NOT NULL,
                        `createdAt` INTEGER NOT NULL
                    )
                """.trimIndent())
            }
        }

        val MIGRATION_2_3 = object : androidx.room.migration.Migration(2, 3) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS `lesson_attachments` (
                        `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        `eventId` INTEGER,
                        `teachingScheduleId` INTEGER,
                        `fileName` TEXT NOT NULL,
                        `fileUri` TEXT NOT NULL,
                        `fileType` TEXT NOT NULL,
                        `fileSizeBytes` INTEGER NOT NULL,
                        `title` TEXT NOT NULL,
                        `description` TEXT NOT NULL,
                        `createdAt` INTEGER NOT NULL
                    )
                """.trimIndent())
            }
        }

        val MIGRATION_3_4 = object : androidx.room.migration.Migration(3, 4) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE `calendar_events` ADD COLUMN `sessionType` TEXT NOT NULL DEFAULT 'Lý thuyết'")
            }
        }

        val MIGRATION_4_5 = object : androidx.room.migration.Migration(4, 5) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS `knowledge_documents` (
                        `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                        `code` TEXT NOT NULL,
                        `title` TEXT NOT NULL,
                        `category` TEXT NOT NULL,
                        `subject` TEXT NOT NULL,
                        `targetLevel` TEXT NOT NULL,
                        `summary` TEXT NOT NULL,
                        `content` TEXT NOT NULL,
                        `isBuiltIn` INTEGER NOT NULL,
                        `isActive` INTEGER NOT NULL,
                        `createdAt` INTEGER NOT NULL,
                        `updatedAt` INTEGER NOT NULL
                    )
                """.trimIndent())
                db.execSQL("CREATE UNIQUE INDEX IF NOT EXISTS `index_knowledge_documents_code` ON `knowledge_documents` (`code`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_knowledge_documents_category` ON `knowledge_documents` (`category`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_knowledge_documents_subject` ON `knowledge_documents` (`subject`)")
            }
        }

        val MIGRATION_5_6 = object : androidx.room.migration.Migration(5, 6) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE `knowledge_documents` ADD COLUMN `fileName` TEXT NOT NULL DEFAULT ''")
                db.execSQL("ALTER TABLE `knowledge_documents` ADD COLUMN `filePath` TEXT NOT NULL DEFAULT ''")
                db.execSQL("ALTER TABLE `knowledge_documents` ADD COLUMN `fileSizeBytes` INTEGER NOT NULL DEFAULT 0")
                db.execSQL("ALTER TABLE `knowledge_documents` ADD COLUMN `fileExtension` TEXT NOT NULL DEFAULT ''")
            }
        }

        val MIGRATION_6_7 = object : androidx.room.migration.Migration(6, 7) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS `classrooms` (
                        `id` TEXT PRIMARY KEY NOT NULL,
                        `name` TEXT NOT NULL,
                        `grade` TEXT NOT NULL DEFAULT '',
                        `totalStudents` INTEGER NOT NULL DEFAULT 0,
                        `academicYear` TEXT NOT NULL DEFAULT '2024-2025',
                        `notes` TEXT NOT NULL DEFAULT '',
                        `updatedAt` INTEGER NOT NULL DEFAULT 0
                    )
                """.trimIndent())

                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS `students` (
                        `id` TEXT PRIMARY KEY NOT NULL,
                        `classId` TEXT NOT NULL,
                        `className` TEXT NOT NULL,
                        `studentCode` TEXT NOT NULL,
                        `fullName` TEXT NOT NULL,
                        `gender` TEXT NOT NULL DEFAULT 'Nam',
                        `parentPhone` TEXT NOT NULL DEFAULT '',
                        `parentName` TEXT NOT NULL DEFAULT '',
                        `kudosPoints` INTEGER NOT NULL DEFAULT 0,
                        `notes` TEXT NOT NULL DEFAULT '',
                        `updatedAt` INTEGER NOT NULL DEFAULT 0
                    )
                """.trimIndent())
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_students_classId` ON `students` (`classId`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_students_className` ON `students` (`className`)")

                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS `attendance_records` (
                        `id` TEXT PRIMARY KEY NOT NULL,
                        `date` TEXT NOT NULL,
                        `eventId` TEXT NOT NULL DEFAULT '',
                        `scheduleId` TEXT NOT NULL DEFAULT '',
                        `studentId` TEXT NOT NULL,
                        `className` TEXT NOT NULL,
                        `status` TEXT NOT NULL DEFAULT 'PRESENT',
                        `kudosDelta` INTEGER NOT NULL DEFAULT 0,
                        `note` TEXT NOT NULL DEFAULT '',
                        `updatedAt` INTEGER NOT NULL DEFAULT 0
                    )
                """.trimIndent())
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_attendance_records_date_studentId_eventId` ON `attendance_records` (`date`, `studentId`, `eventId`)")
                db.execSQL("CREATE INDEX IF NOT EXISTS `index_attendance_records_className_date` ON `attendance_records` (`className`, `date`)")
            }
        }

        fun getInstance(context: Context): SmartTeacherDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SmartTeacherDatabase::class.java,
                    "smart_teacher_database"
                )
                    .addMigrations(MIGRATION_1_2, MIGRATION_2_3, MIGRATION_3_4, MIGRATION_4_5, MIGRATION_5_6, MIGRATION_6_7)
                    .fallbackToDestructiveMigration()
                    .addCallback(object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            super.onCreate(db)
                            // Populate default official knowledge base on first database creation
                            CoroutineScope(Dispatchers.IO).launch {
                                INSTANCE?.let { database ->
                                    database.knowledgeDocumentDao().insertDocuments(DefaultKnowledgeBase.getDefaultBuiltInDocuments())
                                }
                            }
                        }

                        override fun onOpen(db: SupportSQLiteDatabase) {
                            super.onOpen(db)
                            // Ensure all built-in decrees are always present and up-to-date
                            CoroutineScope(Dispatchers.IO).launch {
                                INSTANCE?.let { database ->
                                    val defaultDocs = DefaultKnowledgeBase.getDefaultBuiltInDocuments()
                                    defaultDocs.forEach { defaultDoc ->
                                        val existing = database.knowledgeDocumentDao().getDocumentByCode(defaultDoc.code)
                                        if (existing == null) {
                                            database.knowledgeDocumentDao().insertDocument(defaultDoc)
                                        }
                                    }
                                }
                            }

                            CoroutineScope(Dispatchers.IO).launch {
                                INSTANCE?.let { database ->
                                    try {
                                        val existingClasses = database.classroomDao().getAllClassrooms()
                                        if (existingClasses.isEmpty()) {
                                            val defaultClasses = listOf(
                                                ClassroomEntity(
                                                    id = "cls_cg24tc34",
                                                    name = "CG24TC34",
                                                    grade = "Trung cấp K24",
                                                    totalStudents = 32,
                                                    academicYear = "2024-2025",
                                                    notes = "Lớp Chế tạo máy & Cơ điện tử - Tiết thực hành xưởng X1"
                                                ),
                                                ClassroomEntity(
                                                    id = "cls_cdck02",
                                                    name = "CĐCK02",
                                                    grade = "Cao đẳng K02",
                                                    totalStudents = 28,
                                                    academicYear = "2024-2025",
                                                    notes = "Lớp Cơ khí Chế tạo - Phòng lý thuyết P204"
                                                ),
                                                ClassroomEntity(
                                                    id = "cls_10a1",
                                                    name = "10A1",
                                                    grade = "Khối 10",
                                                    totalStudents = 40,
                                                    academicYear = "2024-2025",
                                                    notes = "Môn Công nghệ 10 (Công nghiệp & Năng lực số)"
                                                )
                                            )
                                            database.classroomDao().insertClassrooms(defaultClasses)

                                            val defaultStudents = listOf(
                                                StudentEntity("std_01", "cls_cg24tc34", "CG24TC34", "CG24-01", "Nguyễn Văn An", "Nam", "0981234567", "Nguyễn Văn Bình", 12, "Lớp trưởng, gương mẫu 5S"),
                                                StudentEntity("std_02", "cls_cg24tc34", "CG24TC34", "CG24-02", "Trần Thị Bích", "Nữ", "0912345678", "Trần Văn Cường", 8, "Tổ trưởng tổ 1"),
                                                StudentEntity("std_03", "cls_cg24tc34", "CG24TC34", "CG24-03", "Lê Hoàng Dũng", "Nam", "0978901234", "Lê Văn Đạt", 15, "Thao tác máy tiện rất chuẩn xác"),
                                                StudentEntity("std_04", "cls_cg24tc34", "CG24TC34", "CG24-04", "Phạm Minh Đức", "Nam", "0903456789", "Phạm Văn Giang", 6, "Cần nhắc nhở mang kính BHLĐ"),
                                                StudentEntity("std_05", "cls_cg24tc34", "CG24TC34", "CG24-05", "Vũ Quốc Huy", "Nam", "0934567890", "Vũ Đình Hải", 10, "Hăng hái phát biểu"),
                                                StudentEntity("std_06", "cls_cg24tc34", "CG24TC34", "CG24-06", "Hoàng Kim Loan", "Nữ", "0965432109", "Hoàng Văn Khanh", 9, "Ghi chép sổ tay công nghệ cẩn thận"),
                                                StudentEntity("std_07", "cls_cg24tc34", "CG24TC34", "CG24-07", "Đặng Tuấn Kiệt", "Nam", "0943219876", "Đặng Quốc Lâm", 7, "Tích cực vệ sinh máy sau giờ học"),
                                                StudentEntity("std_08", "cls_cg24tc34", "CG24TC34", "CG24-08", "Bùi Thị Mai", "Nữ", "0922334455", "Bùi Văn Nam", 11, "Khéo tay trong việc lắp ráp"),
                                                StudentEntity("std_101", "cls_10a1", "10A1", "10A1-01", "Đỗ Hải Phong", "Nam", "0988776655", "Đỗ Văn Phát", 14, "Học tốt Năng lực số & AI"),
                                                StudentEntity("std_102", "cls_10a1", "10A1", "10A1-02", "Ngô Thùy Trang", "Nữ", "0977665544", "Ngô Quang Tuyến", 16, "Thuyết trình slide công nghệ xuất sắc"),
                                                StudentEntity("std_103", "cls_10a1", "10A1", "10A1-03", "Phan Tuấn Tú", "Nam", "0911223344", "Phan Văn Tùng", 8, "Sáng tạo trong sơ đồ tư duy"),
                                                StudentEntity("std_104", "cls_10a1", "10A1", "10A1-04", "Lý Diệu Linh", "Nữ", "0900112233", "Lý Thành Long", 10, "Làm mini game đạt điểm tuyệt đối")
                                            )
                                            database.studentDao().insertStudents(defaultStudents)
                                        }
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                    }
                                }
                            }

                        }
                    })
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
