package com.smartteacher.schedule.core.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.smartteacher.schedule.core.database.dao.*
import com.smartteacher.schedule.core.database.entity.*

@Database(
    entities = [
        TeachingScheduleEntity::class,
        CalendarEventEntity::class,
        TaskEntity::class,
        ReminderEntity::class,
        AIInsightEntity::class,
        NotificationLogEntity::class,
        IntegrationConfigEntity::class,
        LessonAttachmentEntity::class
    ],
    version = 4,
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

    companion object {
        @Volatile
        private var INSTANCE: SmartTeacherDatabase? = null

        val MIGRATION_1_2 = object : androidx.room.migration.Migration(1, 2) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
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
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                // Safe migration: ensures tables exist without destructive wiping
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

        val MIGRATION_1_3 = object : androidx.room.migration.Migration(1, 3) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                MIGRATION_1_2.migrate(db)
            }
        }

        val MIGRATION_3_4 = object : androidx.room.migration.Migration(3, 4) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE `calendar_events` ADD COLUMN `sessionType` TEXT NOT NULL DEFAULT 'Lý thuyết'")
            }
        }

        val MIGRATION_1_4 = object : androidx.room.migration.Migration(1, 4) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                MIGRATION_1_2.migrate(db)
                MIGRATION_3_4.migrate(db)
            }
        }

        val MIGRATION_2_4 = object : androidx.room.migration.Migration(2, 4) {
            override fun migrate(db: androidx.sqlite.db.SupportSQLiteDatabase) {
                MIGRATION_2_3.migrate(db)
                MIGRATION_3_4.migrate(db)
            }
        }

        fun getInstance(context: Context): SmartTeacherDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SmartTeacherDatabase::class.java,
                    "smart_teacher_database"
                )
                    .addMigrations(MIGRATION_1_2, MIGRATION_2_3, MIGRATION_1_3, MIGRATION_3_4, MIGRATION_1_4, MIGRATION_2_4)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
