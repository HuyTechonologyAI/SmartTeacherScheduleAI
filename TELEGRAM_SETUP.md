# Hướng dẫn tạo Bot Telegram & cấu hình (TELEGRAM_SETUP.md)

## Bước 1: Tạo Telegram Bot qua @BotFather
1. Mở ứng dụng Telegram và tìm kiếm bot chính thức: `@BotFather`.
2. Gửi lệnh: `/newbot`.
3. Nhập tên hiển thị cho bot: `Lịch Dạy Smart Teacher Bot`.
4. Nhập username (kết thúc bằng đuôi `bot`, ví dụ: `SmartTeacherSchedule_bot`).
5. `@BotFather` sẽ gửi lại cho bạn một đoạn mã **HTTP API Token** (ví dụ: `7123456789:AAFn_...`). Hãy lưu lại mã này.

## Bước 2: Lấy Chat ID của bạn
1. Tìm bot `@userinfobot` trên Telegram và nhấn **Start**.
2. Bot sẽ gửi cho bạn thông tin **Id** (ví dụ: `987654321`). Đây chính là Chat ID của bạn.
3. Mở bot bạn vừa tạo ở Bước 1 và nhấn **Start** để kích hoạt cuộc trò chuyện.

## Bước 3: Cấu hình trong ứng dụng Smart Teacher Schedule
1. Mở app **Smart Teacher Schedule AI** trên điện thoại.
2. Vào tab **Cài đặt** → chọn **Telegram Bot**.
3. Điền **Bot Token** và **Chat ID** của bạn.
4. Bấm **Lưu & Kích hoạt**.
5. Kể từ thời điểm này, mỗi khi có lịch dạy sắp diễn ra (trước 60p và 15p), ứng dụng sẽ tự động gửi tin nhắn báo động lên Telegram của bạn!
