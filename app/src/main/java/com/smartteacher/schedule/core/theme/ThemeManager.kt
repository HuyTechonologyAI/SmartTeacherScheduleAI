package com.smartteacher.schedule.core.theme

import android.content.Context

object ThemeManager {
    private const val PREFS_NAME = "smart_teacher_theme_prefs"
    private const val KEY_THEME_MODE = "theme_mode"

    const val MODE_SYSTEM = "system"
    const val MODE_LIGHT = "light"
    const val MODE_DARK = "dark"

    fun getThemeMode(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_THEME_MODE, MODE_SYSTEM) ?: MODE_SYSTEM
    }

    fun setThemeMode(context: Context, mode: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_THEME_MODE, mode).apply()
    }

    fun isDarkTheme(context: Context, isSystemDark: Boolean): Boolean {
        return when (getThemeMode(context)) {
            MODE_DARK -> true
            MODE_LIGHT -> false
            else -> isSystemDark
        }
    }
}
