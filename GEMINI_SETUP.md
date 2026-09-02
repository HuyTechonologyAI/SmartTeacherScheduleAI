# Hướng dẫn cấu hình Google Gemini API (GEMINI_SETUP.md)

## Bước 1: Lấy API Key từ Google AI Studio
1. Truy cập [Google AI Studio](https://aistudio.google.com/).
2. Đăng nhập bằng tài khoản Google của bạn.
3. Nhấp vào nút **Get API key** ở góc trên bên trái.
4. Chọn **Create API key in new project** (hoặc chọn project có sẵn).
5. Sao chép chuỗi ký tự API Key nhận được (ví dụ: `AIzaSy...`).

## Bước 2: Kích hoạt trong ứng dụng Smart Teacher Schedule
Bạn có thể cấu hình bằng 1 trong 2 cách:

### Cách 1: Cấu hình trực tiếp trên ứng dụng (Khuyến nghị)
1. Mở ứng dụng **Smart Teacher Schedule AI**.
2. Vào tab **Cài đặt** → chọn **Google Gemini API Key**.
3. Dán mã API Key của bạn vào và nhấn **Lưu**.

### Cách 2: Cấu hình qua local.properties khi build
Thêm dòng sau vào file `local.properties`:
```properties
GEMINI_API_KEY=AIzaSy...
```

> **Lưu ý**: Nếu bạn không nhập API Key, ứng dụng vẫn hoạt động bình thường! Bộ phân tích ngôn ngữ tự nhiên tiếng Việt cục bộ (Offline NLP Engine) tích hợp sẵn trong ứng dụng sẽ tự động trích xuất các thông tin lịch học, thứ, giờ, phòng học và lớp học mà không cần kết nối internet.
