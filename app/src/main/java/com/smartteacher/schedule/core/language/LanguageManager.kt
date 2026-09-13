package com.smartteacher.schedule.core.language

import android.content.Context

object LanguageManager {
    private const val PREFS_NAME = "smart_teacher_language_prefs"
    private const val KEY_APP_LANG = "app_language"

    const val LANG_VI = "vi"
    const val LANG_EN = "en"

    fun getLanguage(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_APP_LANG, LANG_VI) ?: LANG_VI
    }

    fun setLanguage(context: Context, lang: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_APP_LANG, lang).apply()
    }
}
