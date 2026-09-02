# Hướng dẫn tích hợp Zalo Official Account & OpenAPI (ZALO_SETUP.md)

## Nguyên tắc tuân thủ bảo mật
Theo chính sách bảo mật của hệ điều hành Android và Google Play:
1. Ứng dụng **không bao giờ** sử dụng các thủ thuật bất hợp pháp như can thiệp ngầm, scraping tin nhắn cá nhân hoặc đọc trộm thông báo riêng tư của người dùng từ Zalo.
2. Tích hợp Zalo được thực hiện thông qua **Zalo Official Account (OA)** và **Zalo OpenAPI** chính thức.

## Các bước cấu hình Zalo OA
1. Đăng ký Zalo Official Account dành cho trường học / cơ sở giáo dục tại [Zalo OA Portal](https://oa.zalo.me/).
2. Đăng ký tài khoản nhà phát triển tại [Zalo Developers](https://developers.zalo.me/).
3. Tạo ứng dụng mới và liên kết với Zalo OA của trường.
4. Lấy các thông số:
   - **App ID**
   - **Secret Key**
   - **OA ID**
5. Cấu hình Webhook URL nếu muốn tiếp nhận thông báo lịch công tác tự động từ phòng đào tạo gửi tới tài khoản của giảng viên.
6. Nhập thông tin cấu hình vào file `local.properties`:
   ```properties
   ZALO_APP_ID=your_app_id
   ZALO_APP_SECRET=your_app_secret
   ```
   hoặc cấu hình trực tiếp trong menu **Cài đặt** của ứng dụng.
