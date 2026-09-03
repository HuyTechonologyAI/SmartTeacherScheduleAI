package com.smartteacher.schedule.core.util

data class PeriodPreset(
    val name: String,
    val type: String, // "Lý thuyết" | "Thực hành"
    val startTime: String,
    val endTime: String,
    val durationLabel: String
)

object TeachingPeriodPresets {

    // Danh sách khung giờ chuẩn Lý Thuyết (45 phút / tiết)
    val THEORY_PRESETS = listOf(
        PeriodPreset("Tiết 1-2 (Sáng)", "Lý thuyết", "07:00", "08:30", "90 phút (2 tiết)"),
        PeriodPreset("Tiết 3-4 (Sáng)", "Lý thuyết", "08:45", "10:15", "90 phút (2 tiết)"),
        PeriodPreset("Tiết 5-6 (Trưa)", "Lý thuyết", "10:30", "12:00", "90 phút (2 tiết)"),
        PeriodPreset("Tiết 7-8 (Chiều)", "Lý thuyết", "13:00", "14:30", "90 phút (2 tiết)"),
        PeriodPreset("Tiết 9-10 (Chiều)", "Lý thuyết", "14:45", "16:15", "90 phút (2 tiết)"),
        PeriodPreset("Tiết 11-12 (Tối)", "Lý thuyết", "16:30", "18:00", "90 phút (2 tiết)"),
        PeriodPreset("Tiết 13-14 (Tối)", "Lý thuyết", "18:00", "19:30", "90 phút (2 tiết)")
    )

    // Danh sách khung giờ chuẩn Thực Hành (60 phút / tiết hoặc Ca xưởng)
    val PRACTICAL_PRESETS = listOf(
        PeriodPreset("Ca TH Sáng (4 Tiết)", "Thực hành", "07:30", "11:30", "4 tiếng (4 tiết x 60p)"),
        PeriodPreset("Ca TH Chiều (4 Tiết)", "Thực hành", "13:00", "17:00", "4 tiếng (4 tiết x 60p)"),
        PeriodPreset("Ca TH Tối (3 Tiết)", "Thực hành", "18:00", "21:00", "3 tiếng (3 tiết x 60p)"),
        PeriodPreset("Ca TH 2 Tiết Sáng", "Thực hành", "07:30", "09:30", "2 tiếng (2 tiết x 60p)"),
        PeriodPreset("Ca TH 2 Tiết Chiều", "Thực hành", "13:30", "15:30", "2 tiếng (2 tiết x 60p)")
    )

    /**
     * Tự động tính giờ kết thúc dựa trên giờ bắt đầu và số phút cộng thêm.
     */
    fun calculateEndTime(startTime: String, addMinutes: Int): String {
        return try {
            val parts = startTime.trim().split(":")
            if (parts.size >= 2) {
                var hour = parts[0].toInt()
                var min = parts[1].toInt()
                val totalMinutes = hour * 60 + min + addMinutes
                val newHour = (totalMinutes / 60) % 24
                val newMin = totalMinutes % 60
                String.format("%02d:%02d", newHour, newMin)
            } else startTime
        } catch (e: Exception) {
            startTime
        }
    }
}
