# Hướng dẫn cấu hình toàn bộ API bên ngoài (API_SETUP.md)

Ứng dụng **Smart Teacher Schedule AI** kết nối với 4 dịch vụ API chính:
1. Google Gemini API (Phân tích lịch, tóm tắt công việc)
2. Google Calendar API (Đồng bộ thời khóa biểu)
3. Telegram Bot API (Gửi thông báo và lịch học lên Telegram)
4. Zalo OpenAPI (Kết nối qua Zalo Official Account)

> **LƯU Ý BẢO MẬT QUAN TRỌNG:**
> Toàn bộ API Key, Token và Secret không được commit vào Git. Bạn có thể cấu hình thông qua file `local.properties` cho quá trình build hoặc nhập trực tiếp trong mục **Cài đặt** của ứng dụng trên thiết bị.

Xem chi tiết hướng dẫn cho từng API tại:
- [GEMINI_SETUP.md](GEMINI_SETUP.md)
- [GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md)
- [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md)
- [ZALO_SETUP.md](ZALO_SETUP.md)
