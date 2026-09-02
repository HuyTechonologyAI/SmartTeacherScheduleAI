# Hướng dẫn tạo bản build phát hành Google Play (RELEASE_GUIDE.md)

## 1. Kiểm tra mã nguồn & Chạy Unit Tests
Trước khi tạo bản build phát hành, đảm bảo toàn bộ unit test đều vượt qua:
```powershell
.\gradlew test
```

## 2. Tạo Keystore ký ứng dụng (Signing Key)
Tạo file keystore để ký bản phát hành:
```powershell
keytool -genkey -v -keystore release-key.jks -alias smartteacher -keyalg RSA -keysize 2048 -validity 10000
```

## 3. Tạo Debug APK (Để cài đặt test thử nghiệm)
Chạy lệnh Gradle:
```powershell
.\gradlew assembleDebug
```
File APK kết quả sẽ nằm tại:
`app/build/outputs/apk/debug/app-debug.apk`

Cài đặt trực tiếp lên thiết bị Android thật qua ADB:
```powershell
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## 4. Tạo Release Android App Bundle (AAB - Chuẩn Google Play)
Google Play bắt buộc xuất bản dưới định dạng **Android App Bundle (.aab)**:
```powershell
.\gradlew bundleRelease
```
File AAB kết quả sẽ nằm tại:
`app/build/outputs/bundle/release/app-release.aab`

File này sẵn sàng để tải lên Google Play Console trong các đợt phát hành:
- Internal Testing (Thử nghiệm nội bộ)
- Closed Testing (Thử nghiệm đóng)
- Production Release (Phát hành chính thức)
