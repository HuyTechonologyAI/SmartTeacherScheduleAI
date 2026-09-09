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
        KnowledgeDocumentEntity::class
    ],
    version = 5,
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

        fun getInstance(context: Context): SmartTeacherDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SmartTeacherDatabase::class.java,
                    "smart_teacher_database"
                )
                    .addMigrations(MIGRATION_1_2, MIGRATION_2_3, MIGRATION_3_4, MIGRATION_4_5)
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
                        }
                    })
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
