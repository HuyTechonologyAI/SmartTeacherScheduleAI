# Hướng dẫn thiết lập môi trường phát triển (SETUP.md)

## Yêu cầu hệ thống
- Hệ điều hành: Windows 10/11, macOS, hoặc Linux
- JDK: OpenJDK 17 hoặc 21 (Đã cài đặt tại `C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot` trên máy)
- Android SDK: Command Line Tools hoặc Android Studio
- Android SDK Platform: API 36 (Android 16)
- Build Tools: 35.0.0 hoặc 36.0.0

## Cấu hình môi trường

1. **Biến môi trường JAVA_HOME**:
   ```powershell
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot", "User")
   $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
   ```

2. **Biến môi trường ANDROID_HOME**:
   ```powershell
   [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
   $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   ```

3. **Cấu hình file local.properties**:
   Tạo file `local.properties` trong thư mục gốc của project:
   ```properties
   sdk.dir=C:\\Users\\Admin\\AppData\\Local\\Android\\Sdk
   ```

## Mở dự án bằng Android Studio
1. Khởi động Android Studio.
2. Chọn **Open** và dẫn tới thư mục `SmartTeacherSchedule`.
3. Đợi Gradle Sync hoàn tất các thư viện.
4. Chọn thiết bị ảo (Emulator) hoặc thiết bị thật đã bật USB Debugging.
5. Nhấn **Run (Shift + F10)** để cài đặt ứng dụng.
