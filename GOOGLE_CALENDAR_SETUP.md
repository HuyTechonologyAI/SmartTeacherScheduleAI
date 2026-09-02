# Hướng dẫn cấu hình Google Calendar OAuth (GOOGLE_CALENDAR_SETUP.md)

## Bước 1: Tạo dự án trên Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo dự án mới: `Smart Teacher Schedule AI`.
3. Vào **APIs & Services** → **Library**, tìm kiếm và bật **Google Calendar API**.

## Bước 2: Cấu hình OAuth Consent Screen
1. Chọn loại người dùng: **External** (hoặc Internal nếu dùng tài khoản trường đại học / Google Workspace).
2. Điền thông tin App Name: `Smart Teacher Schedule AI`, User support email.
3. Thêm Scope tối thiểu cần thiết:
   - `https://www.googleapis.com/auth/calendar.events.readonly`
   - `https://www.googleapis.com/auth/calendar.events`

## Bước 3: Tạo OAuth 2.0 Client ID
1. Vào mục **Credentials** → **Create Credentials** → **OAuth client ID**.
2. Loại ứng dụng: **Android**.
3. Điền thông tin:
   - Package Name: `com.smartteacher.schedule`
   - SHA-1 Certificate Fingerprint: lấy từ keystore debug hoặc release qua lệnh:
     ```powershell
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
4. Lưu Client ID nhận được vào `local.properties`:
   ```properties
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```
