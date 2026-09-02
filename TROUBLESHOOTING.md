# Hướng dẫn xử lý sự cố thường gặp (TROUBLESHOOTING.md)

## 1. Không nhận được thông báo nhắc trước giờ dạy khi tắt màn hình
- **Nguyên nhân**: Hệ điều hành của nhà sản xuất (Samsung, Xiaomi, OPPO, Vivo, Huawei...) bật chế độ tiết kiệm pin nghiêm ngặt (Doze Mode / App Killer).
- **Cách khắc phục**:
  1. Mở ứng dụng **Smart Teacher Schedule AI**.
  2. Vào **Cài đặt** → **Trung tâm tin cậy thông báo**.
  3. Kiểm tra mục **Tối ưu hóa Pin** và nhấn nút **Fix** màu đỏ để chuyển sang trạng thái "Không hạn chế" (Unrestricted).
  4. Nếu sử dụng điện thoại Xiaomi: Bật thêm quyền "Tự khởi chạy" (Autostart).
  5. Nếu sử dụng điện thoại Samsung: Tắt tính năng "Đặt ứng dụng chưa dùng vào chế độ ngủ".

## 2. Thông báo nhắc bị trễ 5 - 10 phút
- **Nguyên nhân**: Quyền "Báo động chính xác" (Exact Alarm) chưa được cấp trên Android 12+.
- **Cách khắc phục**:
  1. Vào **Cài đặt** → **Ứng dụng** → **Smart Teacher Schedule**.
  2. Chọn **Báo động & lời nhắc** (Alarms & reminders).
  3. Bật tùy chọn **Cho phép đặt báo động chính xác**.

## 3. Không kết nối được với Gemini AI
- **Nguyên nhân**: Chưa nhập API Key hoặc API Key không hợp lệ.
- **Cách khắc phục**:
  1. Kiểm tra lại API Key tại Google AI Studio (`aistudio.google.com`).
  2. Lưu ý rằng khi chưa có internet hoặc chưa có API Key, ứng dụng vẫn tự động phân tích lịch bằng bộ xử lý Tiếng Việt Offline mà không gặp bất kỳ lỗi gián đoạn nào.

## 4. Kiểm tra xem điện thoại có báo động được không
- Sử dụng màn hình **Kiểm tra thông báo (Test Bench)** trong mục Cài đặt.
- Bấm nút **Báo động sau 10 giây** hoặc **Báo động sau 1 phút**, sau đó khóa màn hình điện thoại để kiểm chứng âm thanh và thông báo xuất hiện.
