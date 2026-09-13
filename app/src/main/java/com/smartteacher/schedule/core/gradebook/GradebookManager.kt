package com.smartteacher.schedule.core.gradebook

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import java.util.Locale

data class StudentScoreRecord(
    val studentId: String,
    val studentCode: String,
    val fullName: String,
    val gender: String = "Nam",
    var tx1: Float? = null,
    var tx2: Float? = null,
    var tx3: Float? = null,
    var gk: Float? = null,
    var ck: Float? = null,
    var dtb: Float? = null,
    var academicLevel: String = "Chưa xét",
    var conductLevel: String = "Tốt",
    var comments: String = ""
) {
    fun recalculate() {
        val txScores = listOfNotNull(tx1, tx2, tx3)
        if (gk != null && ck != null && txScores.isNotEmpty()) {
            val sum = txScores.sum() + (gk!! * 2f) + (ck!! * 3f)
            val weight = txScores.size + 2f + 3f
            val calculated = (sum / weight * 10).toInt() / 10f
            dtb = calculated

            academicLevel = when {
                calculated >= 8.0f && (ck ?: 0f) >= 6.5f -> "Tốt"
                calculated >= 6.5f && (ck ?: 0f) >= 5.0f -> "Khá"
                calculated >= 5.0f && (ck ?: 0f) >= 3.5f -> "Đạt"
                else -> "Chưa đạt"
            }
        } else if (txScores.isNotEmpty() || gk != null || ck != null) {
            var sum = txScores.sum()
            var weight = txScores.size.toFloat()
            if (gk != null) {
                sum += gk!! * 2f
                weight += 2f
            }
            if (ck != null) {
                sum += ck!! * 3f
                weight += 3f
            }
            if (weight > 0) {
                dtb = (sum / weight * 10).toInt() / 10f
            }
        }
    }
}

object GradebookManager {
    private const val PREF_NAME = "smart_teacher_gradebook_v1"
    private val gson = Gson()

    fun getGradebook(context: Context, className: String, semester: String = "Học kỳ I"): List<StudentScoreRecord> {
        val sp = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val key = "grade_" + className.trim() + "_" + semester.trim()
        val json = sp.getString(key, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<StudentScoreRecord>>() {}.type
            gson.fromJson<List<StudentScoreRecord>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveGradebook(context: Context, className: String, semester: String = "Học kỳ I", records: List<StudentScoreRecord>) {
        val sp = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val key = "grade_" + className.trim() + "_" + semester.trim()
        records.forEach { it.recalculate() }
        val json = gson.toJson(records)
        sp.edit().putString(key, json).apply()
    }

    fun exportGradebookToText(className: String, semester: String, records: List<StudentScoreRecord>): String {
        val sb = StringBuilder()
        sb.append("BẢNG ĐIỂM & HỌC BẠ ĐIỆN TỬ (THÔNG TƯ 22/2021/TT-BGDĐT)\n")
        sb.append("Lớp: " + className + " • " + semester + "\n")
        sb.append("Hệ thống: Smart Teacher Schedule AI\n")
        sb.append("--------------------------------------------------\n")
        sb.append(String.format(Locale.getDefault(), "%-4s | %-20s | %-5s | %-5s | %-5s | %-5s | %-5s | %-5s | %-8s\n", "STT", "Họ và Tên", "TX1", "TX2", "TX3", "GK", "CK", "ĐTB", "Xếp loại"))
        sb.append("--------------------------------------------------\n")

        records.forEachIndexed { idx, st ->
            val tx1Str = st.tx1?.toString() ?: "-"
            val tx2Str = st.tx2?.toString() ?: "-"
            val tx3Str = st.tx3?.toString() ?: "-"
            val gkStr = st.gk?.toString() ?: "-"
            val ckStr = st.ck?.toString() ?: "-"
            val dtbStr = st.dtb?.toString() ?: "-"
            sb.append(String.format(Locale.getDefault(), "%-4d | %-20s | %-5s | %-5s | %-5s | %-5s | %-5s | %-5s | %-8s\n",
                idx + 1,
                if (st.fullName.length > 20) st.fullName.substring(0, 19) else st.fullName,
                tx1Str, tx2Str, tx3Str, gkStr, ckStr, dtbStr, st.academicLevel
            ))
        }

        val gradedCount = records.count { it.dtb != null }
        if (gradedCount > 0) {
            val goodCount = records.count { it.academicLevel == "Tốt" }
            val fairCount = records.count { it.academicLevel == "Khá" }
            val passCount = records.count { it.academicLevel == "Đạt" }
            val failCount = records.count { it.academicLevel == "Chưa đạt" }
            sb.append("--------------------------------------------------\n")
            sb.append("Thống kê: Tổng sĩ số: " + records.size + " | Đã có điểm: " + gradedCount + "\n")
            sb.append("Tốt: " + goodCount + " (" + ((goodCount * 100f / gradedCount).toInt()) + "%) | ")
            sb.append("Khá: " + fairCount + " (" + ((fairCount * 100f / gradedCount).toInt()) + "%) | ")
            sb.append("Đạt: " + passCount + " (" + ((passCount * 100f / gradedCount).toInt()) + "%) | ")
            sb.append("Chưa đạt: " + failCount + "\n")
        }

        return sb.toString()
    }
}