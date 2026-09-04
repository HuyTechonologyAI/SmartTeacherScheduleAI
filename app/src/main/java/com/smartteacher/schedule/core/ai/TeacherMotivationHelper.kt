package com.smartteacher.schedule.core.ai

import android.content.Context
import android.content.Intent
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.time.LocalTime
import java.util.concurrent.TimeUnit
import kotlin.random.Random

/**
 * TeacherMotivationHelper:
 * Trợ lý AI sư phạm đồng hành cùng giáo viên 24/7.
 * - Buổi sáng (05:00 - 11:59): Câu động lực, truyền cảm hứng bục giảng để bắt đầu ngày mới tràn đầy nhiệt huyết.
 * - Buổi chiều (12:00 - 17:59): Lời khích lệ, tiếp sức bền bỉ cho các tiết học và hướng dẫn học sinh.
 * - Buổi tối / Cuối ngày (18:00 - 04:59): Lời cảm ơn, tri ân tận tâm và lời chúc thư giãn, tái tạo năng lượng sau một ngày làm việc.
 */
object TeacherMotivationHelper {

    enum class TimePhase {
        MORNING,    // 05:00 - 11:59
        AFTERNOON,  // 12:00 - 17:59
        EVENING     // 18:00 - 04:59
    }

    data class MotivationMessage(
        val timePhase: TimePhase,
        val greetingTitle: String,
        val quoteContent: String,
        val authorOrSource: String,
        val badgeLabel: String,
        val icon: String,
        val isAIGenerated: Boolean = false
    )

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    fun getCurrentTimePhase(time: LocalTime = LocalTime.now()): TimePhase {
        val hour = time.hour
        return when {
            hour in 5..11 -> TimePhase.MORNING
            hour in 12..17 -> TimePhase.AFTERNOON
            else -> TimePhase.EVENING
        }
    }

    // =========================================================================
    // 📚 KHO DANH NGÔN SƯ PHẠM & TRI ÂN VIỆT NAM CHỌN LỌC (OFFLINE HIGH QUALITY)
    // =========================================================================

    private val MORNING_QUOTES = listOf(
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Chào buổi sáng Thầy/Cô! ☀️",
            quoteContent = "Dạy học là nghề đặt nền móng cho mọi nghề nghiệp khác trong xã hội. Chúc Thầy/Cô một ngày lên lớp tràn ngập niềm vui và năng lượng tích cực!",
            authorOrSource = "Danh ngôn Sư phạm",
            badgeLabel = "Khởi đầu ngày mới",
            icon = "☀️"
        ),
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Khởi đầu rực rỡ! 🌅",
            quoteContent = "Giáo dục là vũ khí mạnh nhất mà bạn có thể dùng để thay đổi thế giới. Mỗi bài học hôm nay là một bước tiến của tương lai.",
            authorOrSource = "Nelson Mandela",
            badgeLabel = "Sứ mệnh trồng người",
            icon = "🌱"
        ),
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Năng lượng bục giảng ✨",
            quoteContent = "Người thầy giỏi khơi gợi hy vọng, thổi bùng trí tưởng tượng và thấm nhuần niềm đam mê học hỏi suốt đời cho học trò.",
            authorOrSource = "Brad Henry",
            badgeLabel = "Truyền cảm hứng",
            icon = "✨"
        ),
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Tâm huyết nhà giáo 🌿",
            quoteContent = "Một nụ cười khích lệ và ánh mắt tin tưởng của Thầy/Cô có sức mạnh nâng đỡ một học trò vượt qua mọi giới hạn bản thân.",
            authorOrSource = "Thư viện Giáo dục",
            badgeLabel = "Gieo mầm tri thức",
            icon = "💫"
        ),
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Chào ngày mới an lành! ☀️",
            quoteContent = "Muốn sang thì bắc cầu Kiều / Muốn con hay chữ phải yêu lấy thầy. Chúc Thầy/Cô một ngày gieo chữ bình an, học trò chăm ngoan, bài giảng cuốn hút!",
            authorOrSource = "Ca dao Việt Nam",
            badgeLabel = "Nét đẹp Tôn sư trọng đạo",
            icon = "📖"
        ),
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Chào buổi sáng Thầy/Cô! 🌈",
            quoteContent = "Thầy cô là người mở cánh cửa tri thức, nhưng chính học trò sẽ tự tin bước qua. Hãy vững tâm dẫn dắt các em hôm nay!",
            authorOrSource = "Triết lý Giáo dục",
            badgeLabel = "Ngọn hải đăng dẫn lối",
            icon = "⛵"
        ),
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Tự hào nghề giáo 🌟",
            quoteContent = "Không có nghề nào cao quý hơn nghề dạy học. Mỗi phút giây trên bục giảng hôm nay đều mang giá trị vô giá cho mai sau.",
            authorOrSource = "Vạn thế sư biểu",
            badgeLabel = "Cao quý & Nhân văn",
            icon = "🌟"
        ),
        MotivationMessage(
            timePhase = TimePhase.MORNING,
            greetingTitle = "Động lực buổi sáng ☀️",
            quoteContent = "Hãy bắt đầu buổi dạy hôm nay với tất cả sự say mê. Học trò không chỉ học kiến thức từ sách vở, mà học cả tình yêu nghề từ Thầy/Cô!",
            authorOrSource = "Trợ lý Sư phạm AI",
            badgeLabel = "Năng lượng bục giảng",
            icon = "🎯"
        )
    )

    private val AFTERNOON_QUOTES = listOf(
        MotivationMessage(
            timePhase = TimePhase.AFTERNOON,
            greetingTitle = "Tiếp sức buổi chiều! 🌤️",
            quoteContent = "Uống một ngụm trà ấm và hít thật sâu. Sự kiên nhẫn và ân cần của Thầy/Cô trong từng tiết thực hành chính là chìa khóa thành công của học sinh.",
            authorOrSource = "Trợ lý Sư phạm AI",
            badgeLabel = "Năng lượng buổi chiều",
            icon = "☕"
        ),
        MotivationMessage(
            timePhase = TimePhase.AFTERNOON,
            greetingTitle = "Vững vàng & Bền bỉ 🌿",
            quoteContent = "Nửa chặng đường trong ngày đã hoàn thành xuất sắc. Chúc Thầy/Cô có buổi chiều làm việc nhẹ nhàng, hướng dẫn học viên mượt mà!",
            authorOrSource = "Lời chúc Sư phạm",
            badgeLabel = "Đồng hành tin cậy",
            icon = "🌤️"
        ),
        MotivationMessage(
            timePhase = TimePhase.AFTERNOON,
            greetingTitle = "Cảm hứng giảng dạy ✨",
            quoteContent = "Một người thầy tận tâm biến những khái niệm khô khan phức tạp thành những bài học thực tế sống động và đáng nhớ.",
            authorOrSource = "Albert Einstein",
            badgeLabel = "Sáng tạo bài giảng",
            icon = "💡"
        )
    )

    private val EVENING_QUOTES = listOf(
        MotivationMessage(
            timePhase = TimePhase.EVENING,
            greetingTitle = "Cảm ơn Thầy/Cô! 🌙",
            quoteContent = "Cảm ơn Thầy/Cô vì một ngày đã cống hiến hết mình trên bục giảng! Giờ là lúc Thầy/Cô gác lại giáo án, thư giãn tâm trí và tận hưởng bữa cơm đầm ấm bên gia đình.",
            authorOrSource = "Trợ lý Tri ân Sư phạm",
            badgeLabel = "Tri ân cuối ngày",
            icon = "🌙"
        ),
        MotivationMessage(
            timePhase = TimePhase.EVENING,
            greetingTitle = "Thầy/Cô đã vất vả rồi! 🛋️",
            quoteContent = "Sau bao nhiêu tiết giảng và lời dặn dò học trò, Thầy/Cô xứng đáng được nghỉ ngơi trọn vẹn tối nay. Chúc Thầy/Cô có một giấc ngủ thật sâu và êm dịu.",
            authorOrSource = "Lời tri ân chân thành",
            badgeLabel = "Thư giãn & Tái tạo",
            icon = "✨"
        ),
        MotivationMessage(
            timePhase = TimePhase.EVENING,
            greetingTitle = "Biết ơn & Tự hào 🌟",
            quoteContent = "Dù công việc dạy học còn nhiều bộn bề, hãy luôn tự hào về sứ mệnh cao cả Thầy/Cô đang gánh vác. Những hạt mầm Thầy/Cô gieo hôm nay sẽ nở hoa rực rỡ ngày mai.",
            authorOrSource = "Góc Nhìn Sư Phạm",
            badgeLabel = "Tâm sự nghề giáo",
            icon = "🌟"
        ),
        MotivationMessage(
            timePhase = TimePhase.EVENING,
            greetingTitle = "Thả lỏng & An yên 🍃",
            quoteContent = "Gác lại những bộn bề sổ sách điểm số. Buổi tối hôm nay là món quà dành riêng cho Thầy/Cô: đọc trang sách yêu thích, nghe bài nhạc êm đềm và yêu thương chính mình.",
            authorOrSource = "Lời chúc Bình an",
            badgeLabel = "Chăm sóc bản thân",
            icon = "🍵"
        ),
        MotivationMessage(
            timePhase = TimePhase.EVENING,
            greetingTitle = "Tri ân người lái đò thầm lặng 🚣‍♂️",
            quoteContent = "Cảm ơn Thầy/Cô đã kiên nhẫn chở từng chuyến đò tri thức qua sông. Chúc Thầy/Cô một buổi tối an lành, thanh thản và ngập tràn tình yêu thương gia đình.",
            authorOrSource = "Khúc tri ân sư phạm",
            badgeLabel = "Ấm áp gia đình",
            icon = "🕯️"
        ),
        MotivationMessage(
            timePhase = TimePhase.EVENING,
            greetingTitle = "Chúc Thầy/Cô ngủ ngon 😴",
            quoteContent = "Một ngày làm việc hiệu quả và ý nghĩa đã hoàn thành. Hãy khép lại đôi mắt với nụ cười tự hào. Ngày mai sẽ đón chào Thầy/Cô với nhiều điều tuyệt vời mới!",
            authorOrSource = "Trợ lý Sư phạm AI",
            badgeLabel = "Giấc ngủ ngon",
            icon = "💤"
        )
    )

    /**
     * Lấy câu ngẫu nhiên phù hợp với thời điểm hiện tại từ kho offline.
     */
    fun getRandomOfflineQuote(timePhase: TimePhase = getCurrentTimePhase()): MotivationMessage {
        val list = when (timePhase) {
            TimePhase.MORNING -> MORNING_QUOTES
            TimePhase.AFTERNOON -> AFTERNOON_QUOTES
            TimePhase.EVENING -> EVENING_QUOTES
        }
        return list[Random.nextInt(list.size)]
    }

    /**
     * Tạo câu động lực / tri ân mới qua Gemini AI (nếu có API Key), tự động fallback về offline nếu lỗi hoặc không có mạng.
     */
    suspend fun getMotivationalQuote(
        apiKey: String?,
        teachingCountToday: Int = 0,
        timePhase: TimePhase = getCurrentTimePhase()
    ): MotivationMessage = withContext(Dispatchers.IO) {
        if (apiKey.isNullOrBlank()) {
            return@withContext getRandomOfflineQuote(timePhase)
        }

        try {
            val promptPhase = when (timePhase) {
                TimePhase.MORNING -> "Hãy viết 1 câu chúc chào buổi sáng và động lực truyền cảm hứng sư phạm cho giáo viên Việt Nam bắt đầu ngày dạy mới (hôm nay có $teachingCountToday ca dạy). Giọng điệu ấm áp, hào hứng, sâu sắc, ngắn gọn dưới 45 từ."
                TimePhase.AFTERNOON -> "Hãy viết 1 câu tiếp thêm năng lượng buổi chiều cho giáo viên Việt Nam sau giờ dạy mệt mỏi. Giọng điệu ân cần, khích lệ, dưới 40 từ."
                TimePhase.EVENING -> "Hãy viết 1 lời cảm ơn tri ân chân thành và lời chúc nghỉ ngơi thư giãn cuối ngày dành cho giáo viên Việt Nam đã cống hiến hết mình trên bục giảng hôm nay. Giọng điệu ấm áp, chạm đến trái tim, thư thái, dưới 45 từ."
            }

            val fullPrompt = """
                Bạn là trợ lý AI sư phạm tận tâm của Smart Teacher Schedule.
                $promptPhase
                Trả về JSON định dạng chuẩn duy nhất:
                {
                   "title": "Tiêu đề ngắn gọn kèm emoji (ví dụ: Chào buổi sáng Thầy/Cô! ☀️)",
                   "content": "Nội dung câu nói",
                   "badge": "Nhãn ngắn (ví dụ: Động lực bục giảng / Tri ân cuối ngày)"
                }
            """.trimIndent()

            val bodyJson = JsonObject().apply {
                val contents = com.google.gson.JsonArray().apply {
                    add(JsonObject().apply {
                        val parts = com.google.gson.JsonArray().apply {
                            add(JsonObject().apply { addProperty("text", fullPrompt) })
                        }
                        add("parts", parts)
                    })
                }
                add("contents", contents)
                val genConfig = JsonObject().apply {
                    addProperty("response_mime_type", "application/json")
                }
                add("generationConfig", genConfig)
            }

            val request = Request.Builder()
                .url("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey")
                .post(bodyJson.toString().toRequestBody(jsonMediaType))
                .build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext getRandomOfflineQuote(timePhase)
            }

            val respBody = response.body?.string() ?: return@withContext getRandomOfflineQuote(timePhase)
            val rootObj = gson.fromJson(respBody, JsonObject::class.java)
            val textContent = rootObj.getAsJsonArray("candidates")
                ?.get(0)?.asJsonObject
                ?.getAsJsonObject("content")
                ?.getAsJsonArray("parts")
                ?.get(0)?.asJsonObject
                ?.get("text")?.asString ?: return@withContext getRandomOfflineQuote(timePhase)

            val parsed = gson.fromJson(textContent, JsonObject::class.java)
            val title = parsed.get("title")?.asString ?: when(timePhase) {
                TimePhase.MORNING -> "Chào buổi sáng Thầy/Cô! ☀️"
                TimePhase.AFTERNOON -> "Tiếp sức buổi chiều 🌤️"
                TimePhase.EVENING -> "Cảm ơn Thầy/Cô! 🌙"
            }
            val content = parsed.get("content")?.asString ?: return@withContext getRandomOfflineQuote(timePhase)
            val badge = parsed.get("badge")?.asString ?: "Gemini AI Sư Phạm"

            MotivationMessage(
                timePhase = timePhase,
                greetingTitle = title,
                quoteContent = content,
                authorOrSource = "Trợ lý Sư phạm AI (Gemini)",
                badgeLabel = badge,
                icon = if (timePhase == TimePhase.MORNING) "☀️" else if (timePhase == TimePhase.AFTERNOON) "🌤️" else "🌙",
                isAIGenerated = true
            )
        } catch (e: Exception) {
            e.printStackTrace()
            getRandomOfflineQuote(timePhase)
        }
    }

    /**
     * Mở hộp thoại chia sẻ của hệ thống (Zalo, Tin nhắn, Facebook, Ghi chú)
     */
    fun shareMotivationMessage(context: Context, message: MotivationMessage) {
        val shareText = """
            ${message.greetingTitle}
            
            "${message.quoteContent}"
            — ${message.authorOrSource} —
            
            (Chia sẻ từ Smart Teacher Schedule - Trợ lý số Giáo viên)
        """.trimIndent()

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, message.greetingTitle)
            putExtra(Intent.EXTRA_TEXT, shareText)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(Intent.createChooser(intent, "Chia sẻ cảm hứng sư phạm qua:"))
    }
}
