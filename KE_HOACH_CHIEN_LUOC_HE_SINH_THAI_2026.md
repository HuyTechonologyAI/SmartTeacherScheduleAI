# KẾ HOẠCH CHIẾN LƯỢC & THIẾT KẾ KỸ THUẬT NÂNG CẤP TOÀN DIỆN HỆ SINH THÁI SMART TEACHER SCHEDULE AI (2026 - 2027)

> **Dự án**: Smart Teacher Schedule AI (Hệ sinh thái Quản lý Sư phạm, Lịch Dạy & Trợ lý AI Giáo viên)  
> **Đơn vị phát triển**: Huy Technology AI  
> **Nền tảng mục tiêu**: Android (APK/AAB), Windows Desktop (.EXE), Web App PWA (gvcncdsai.io.vn), iOS (PWA/Safari)  
> **Phiên bản kế hoạch**: v2.0 Enterprise Release  

---

## MỤC LỤC
1. [Trụ cột 1: Khắc phục phiên bản Máy tính Desktop (Windows Installer .EXE & Logo App)](#trụ-cột-1-khắc-phục-phiên-bản-máy-tính-desktop-windows-installer-exe--logo-app)
2. [Trụ cột 2: Cổng Quản Trị Hệ Thống Toàn Diện (Super Admin Portal)](#trụ-cột-2-cổng-quản-trị-hệ-thống-toàn-diện-super-admin-portal)
3. [Trụ cột 3: Hệ Thống Tự Động Cập Nhật OTA (In-App & Desktop Auto-Update Engine)](#trụ-cột-3-hệ-thống-tự-động-cập-nhật-ota-in-app--desktop-auto-update-engine)
4. [Trụ cột 4: Đột Phá AI Soạn Giáo Án Bám Sát Dữ Liệu Giáo Viên (RAG Sư Phạm Chuyên Sâu)](#trụ-cột-4-đột-phá-ai-soạn-giáo-án-bám-sát-dữ-liệu-giáo-viên-rag-sư-phạm-chuyên-sâu)
5. [Trụ cột 5: Cổng Thanh Toán Tự Động (VietQR/Webhook) & Xuất Hóa Đơn Điện Tử](#trụ-cột-5-cổng-thanh-toán-tự-động-vietqrwebhook--xuất-hóa-đơn-điện-tử)
6. [Trụ cột 6: Mô Hình Định Giá Theo User, Kế Hoạch Tài Chính & Phân Tích Đối Thủ](#trụ-cột-6-mô-hình-định-giá-theo-user-kế-hoạch-tài-chính--phân-tích-đối-thủ)
7. [Lộ Trình Triển Khai Chi Tiết (Phân Kỳ 5 Giai Đoạn)](#lộ-trình-triển-khai-chi-tiết-phân-kỳ-5-giai-đoạn)

---

## TRỤ CỘT 1: KHẮC PHỤC PHIÊN BẢN MÁY TÍNH DESKTOP (WINDOWS INSTALLER .EXE & LOGO APP)

### 1. Phân tích nguyên nhân hiện trạng:
- **Nguyên nhân không tìm thấy file `.exe`**: Bản tải desktop hiện tại (`SmartTeacherSchedule_v1.7.0_Desktop.zip`) chỉ đóng gói mã nguồn Electron gồm `main.js`, `package.json`, và các file script thực thi `.bat` / `.vbs`. Chưa được compile và đóng gói thành file binary cài đặt Windows PE (`.exe`).
- **Nguyên nhân file `.bat` không hiện logo**: File batch script (`.bat`) là kịch bản dòng lệnh của Windows CMD, hệ điều hành Windows không hỗ trợ nhúng Icon Resource (ICO 256x256 đa lớp) trực tiếp vào file `.bat`. Khi chạy, Windows hiển thị cửa sổ Command Prompt màu đen làm giảm tính chuyên nghiệp của sản phẩm.

### 2. Phương án giải quyết dứt điểm:

```
[Mã nguồn Electron] + [icon.ico] + [Electron-Builder]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[SmartTeacherSchedule_Setup.exe]   [SmartTeacherSchedule_Portable.exe]
(Trình cài đặt Wizard NSIS)       (Chạy ngay không cần cài đặt)
- Nhúng Icon chuẩn 256x256        - Nhúng Icon chuẩn 256x256
- Tự tạo Shortcut Desktop         - Dành cho máy trường học bị khóa quyền Admin
- Tự tạo Menu Start Windows       - Lưu dữ liệu ngay tại thư mục ứng dụng
```

#### A. Đóng gói Bộ cài đặt Windows Installer (`.exe`):
- Sử dụng **Electron-Builder** với target **NSIS** để tạo file cài đặt chính thức: `SmartTeacherSchedule_Setup_v1.8.0.exe`.
- **Cấu hình NSIS tối ưu cho môi trường giáo dục**:
  - Hỗ trợ cài đặt ở chế độ `per-user` (không đòi hỏi quyền Administrator của Windows, giúp giáo viên cài được trên máy tính của trường học ở phòng hội đồng hoặc phòng tin học).
  - Tự động tạo Shortcut ngoài Desktop mang tên: `Smart Teacher Schedule AI` có gắn biểu tượng `icon.ico` thương hiệu.
  - Tự động tạo lối tắt trong Windows Start Menu và Add/Remove Programs.
  - Cho phép tùy chọn thư mục cài đặt (`allowToChangeInstallationDirectory: true`).

#### B. Đóng gói Bản Chạy Ngay Portable (`.exe`):
- Tạo bản `SmartTeacherSchedule_v1.8.0_Portable.exe`:
  - 1 file duy nhất, giáo viên chỉ cần copy vào USB hoặc tải về là click đúp mở ngay.
  - Không cần cài đặt, không cần internet khi khởi động ban đầu.

#### C. Tích hợp Icon PE Header đa kích thước:
- Biên tập file `icon.ico` chứa đầy đủ 6 layer kích thước chuẩn Microsoft Windows: `16x16`, `24x24`, `32x32`, `48x48`, `64x64`, `128x128`, `256x256` pixel với độ sâu màu 32-bit (RGBA).
- Đảm bảo biểu tượng hiển thị sắc nét ở mọi chế độ hiển thị của Windows: Taskbar, Alt+Tab, Desktop icon, và Start Menu tiles.

---

## TRỤ CỘT 2: CỔNG QUẢN TRỊ HỆ THỐNG TOÀN DIỆN (SUPER ADMIN PORTAL)

### 1. Kiến trúc Cổng Admin (`/admin` trên `gvcncdsai.io.vn`):
Xây dựng phân hệ Quản trị Trung tâm với thanh điều hướng độc lập, giao diện Dashboard hiện đại chuẩn Executive Analytics.

```
                  ┌─────────────────────────────────────┐
                  │    SUPER ADMIN DASHBOARD (/admin)   │
                  └──────────────────┬──────────────────┘
                                     │
     ┌────────────────┬──────────────┴───────────────┬────────────────┐
     ▼                ▼                               ▼                ▼
[Hệ Thống & API] [Bộ Đếm Lượt Tải]            [Thống Kê Traffic]  [Quản Lý Gói Cước]
- Trạng thái DB   - Android APK (1-click/Direct) - Lượt xem trang - Gói Cá nhân / Pro
- Uptime Supabase - Windows EXE                  - Khách độc lập  - Gói Trường học
- Tốc độ API Sync - Mac DMG / Linux / PWA        - Thiết bị / OS  - Hóa đơn & Doanh thu
```

### 2. Các mô-đun chức năng cốt lõi của Cổng Admin:

| Mô-đun | Chức năng chi tiết | Chỉ số theo dõi |
| :--- | :--- | :--- |
| **📊 Dashboard Tổng Quan** | Trung tâm chỉ huy theo dõi sức khỏe toàn hệ thống | Số giáo viên hoạt động hôm nay, tổng số ca dạy đã đồng bộ, tỷ lệ đồng bộ thành công, doanh thu trong ngày/tháng. |
| **📥 Bộ Đếm Lượt Tải (Download Analytics)** | Theo dõi chính xác số lượt tải trên từng nền tảng qua API `/api/analytics/downloads` | - Android APK (`/downloads/android`)<br>- Windows Installer `.exe` (`/downloads/windows`)<br>- Portable Windows `.exe`<br>- Web PWA / iOS Shortcut<br>- Phân tích theo ngày, tuần, tháng, tỉnh thành. |
| **🌐 Traffic & Telemetry Tracker** | Phân tích lưu lượng truy cập hệ sinh thái không phụ thuộc vào bên thứ ba | - Số lượt xem trang (Pageviews)<br>- Số khách độc lập (Unique Visitors - UV)<br>- Tỷ lệ chuyển đổi từ khách truy cập sang tạo lịch dạy<br>- Nền tảng truy cập (Mobile 70%, Desktop 30%). |
| **💳 Quản Trị Gói Cước & Doanh Thu** | Giám sát các gói dịch vụ và dòng tiền tự động | - Danh sách khách hàng đã nâng cấp (Pro, School)<br>- Trạng thái giao dịch (Thành công, Chờ xử lý, Thất bại)<br>- Doanh thu định kỳ tháng (MRR) và hàng năm (ARR)<br>- Bộ lọc theo trường học và khu vực. |
| **👥 Quản Lý Người Dùng & Dữ Liệu** | Quản lý tài khoản giáo viên và nhà trường | - Tìm kiếm theo Mã đồng bộ (`ST-XXXXXX`) hoặc SĐT<br>- Xem số lượng học sinh, số lớp, dung lượng lưu trữ<br>- Hỗ trợ đặt lại mã PIN bảo mật khi giáo viên quên<br>- Khóa/Kích hoạt tài khoản vi phạm hoặc hết hạn. |
| **⚙️ Cấu Hình Hệ Thống & Cờ Tính Năng (Feature Flags)** | Điều khiển từ xa tính năng trên toàn bộ App điện thoại và Web | - Bật/Tắt chế độ bảo trì máy chủ đồng bộ<br>- Bật/Tắt các gói cước khuyến mãi theo mùa khai giảng<br>- Cấu hình thông điệp thông báo nổi (Banner Notification) toàn quốc. |

---

## TRỤ CỘT 3: HỆ THỐNG TỰ ĐỘNG CẬP NHẬT OTA (IN-APP & DESKTOP AUTO-UPDATE ENGINE)

### 1. Mục tiêu:
Người dùng khi đã cài đặt ứng dụng (trên Android hoặc Desktop) sẽ **không bao giờ bị kẹt lại ở phiên bản cũ** hoặc phải vào website tìm link tải thủ công mỗi khi có bản vá lỗi.

### 2. Cơ chế hoạt động của Hệ thống Cập nhật Tự động:

```
[Khởi động Ứng dụng]
        │
        ▼
[Gọi API /api/version] ────► [Máy chủ API gvcncdsai.io.vn]
        │                     - Trả về: latestVersion, versionCode, 
        │                               minRequiredVersion, downloadUrl,
        │                               releaseNotes, isForceUpdate
        ▼
[So sánh với Phiên bản hiện tại]
        │
        ├── Phiên bản đã là mới nhất ──► [Tiếp tục sử dụng bình thường]
        │
        └── Phát hiện Bản cập nhật mới!
                │
                ▼
        [Hiển thị Dialog Cập Nhật Mới]
        - Hiển thị danh sách tính năng mới (Changelog)
        - Nút "Cập nhật ngay" (1-Chạm)
                │
                ▼
        [Tiến trình Tải ngầm & Tự động cài đặt]
        - Android: DownloadManager -> FileProvider -> PackageInstaller Intent
        - Desktop: Background Download -> Chạy trình Setup yên lặng
```

### 3. Thiết kế chi tiết cho từng nền tảng:

#### A. Ứng dụng Android (APK):
1. **Endpoint kiểm tra**: `GET https://www.gvcncdsai.io.vn/api/version?platform=android&currentVersionCode=18`
2. **Cơ chế cập nhật tự động trong App**:
   - Sử dụng `Android DownloadManager` tải file APK mới nhất về thư mục riêng an toàn (`context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)`).
   - Thanh tiến trình tải hiển thị trực quan phần trăm (%) và tốc độ tải.
   - Khi tải xong, ứng dụng tự động gọi `FileProvider` kích hoạt `Intent.ACTION_INSTALL_PACKAGE` hoặc `ACTION_VIEW` với MIME type `application/vnd.android.package-archive` để người dùng bấm "Cập nhật" mà không phải cấp lại quyền.
   - **Tùy chọn Cập nhật Bắt buộc (Force Update)**: Đối với các bản cập nhật có thay đổi cấu trúc database hoặc giao thức API bảo mật quan trọng, hệ thống sẽ chặn sử dụng bản cũ và yêu cầu cập nhật lên bản mới để đảm bảo an toàn dữ liệu.

#### B. Ứng dụng Máy tính Desktop (Windows):
1. Tích hợp cơ chế **Auto-Updater của Electron** kết nối trực tiếp với GitHub Releases hoặc máy chủ phân phối:
   - Khi có bản phát hành mới, ứng dụng tự động tải gói cập nhật nén về trong nền.
   - Hiển thị thông báo nhỏ ở góc phải màn hình: *"Đã tải xong phiên bản 1.8.x - Bấm Khởi động lại để áp dụng"*.
   - Hoặc cung cấp nút 1-chạm: Tải và tự động chạy bộ cài `Setup.exe`.

#### C. Phiên bản Web / PWA (gvcncdsai.io.vn):
- Đăng ký Service Worker với sự kiện `onupdatefound`.
- Khi có bản build web mới (sau khi push GitHub), hiển thị Toast thông báo: *"Đã có bản cập nhật mới nhất - Bấm để làm mới"* -> tự động xóa cache cũ và nạp bản mới.

---

## TRỤ CỘT 4: ĐỘT PHÁ AI SOẠN GIÁO ÁN BÁM SÁT DỮ LIỆU GIÁO VIÊN (RAG SƯ PHẠM CHUYÊN SÂU)

### 1. Phân tích nguyên nhân AI soạn chung chung:
- **Vấn đề 1 - Trích xuất tài liệu hời hợt**: Trước đây hệ thống chỉ lấy 180 ký tự đầu tiên của tài liệu (`referenceContext.take(180)`) làm bằng chứng ngữ cảnh. Do đó AI hoàn toàn không đọc được nội dung bài học chi tiết ở các trang tiếp theo!
- **Vấn đề 2 - Mẫu Prompt tạo kẽ hở cho sự chung chung**: Trong cấu trúc JSON mẫu, các hướng dẫn như `"content": "Câu hỏi hoặc tình huống khơi gợi"`, `"implementation": "1. Chuyển giao nhiệm vụ..."` khiến mô hình AI lười biếng sinh ra các câu khẩu hiệu chung chung của phương pháp dạy học thay vì đưa kiến thức thực tế của bài học vào.
- **Vấn đề 3 - Thiếu Semantic Filtering theo Tên bài dạy**: Khi giáo viên tải cả quyển sách 300 trang, nếu không có bộ lọc chỉ mục tìm đúng chương/mục của bài đó, AI sẽ bị quá tải token hoặc lấy nhầm kiến thức của bài khác.

### 2. Kiến trúc Giải pháp RAG Sư Phạm Chuyên Sâu (Pedagogical Deep-RAG Pipeline):

```
[Giáo viên tải File Giáo Trình / SGK / Tài liệu (.docx, .pdf, .txt)]
                            │
                            ▼
           [Bộ Bóc Tách Cấu Trúc Tài Liệu Chuyên Nghiệp]
           - Nhận diện Chương, Mục, Tiêu đề bài học
           - Giữ nguyên Bảng số liệu, Công thức, Định nghĩa, Quy trình
                            │
                            ▼
              [Bộ Chỉ Mục & Vector Semantic Search]
           - Tìm kiếm chính xác đoạn văn bản khớp với:
             Tên bài học + Bộ môn + Khối lớp
                            │
                            ▼
   [Đoạn Kiến Thức Cốt Lõi Trích Xuất Thực Tế (2.000 - 6.000 từ)]
                            │
                            ▼
        [Bộ Prompt Sư Phạm Khắt Khe Của EduViet AI]
        - Bắt buộc trích xuất:
          + Định nghĩa, khái niệm gốc trong sách
          + Công thức, thông số kỹ thuật thực tế
          + 4 Hoạt động chuẩn CV 5512/2634 với câu hỏi & bài tập cụ thể
          + Phiếu học tập đính kèm có đáp án chi tiết
                            │
                            ▼
       [Kế Hoạch Bài Dạy Chuẩn Chuyên Môn 100% Đi Vào Chi Tiết]
       (Xuất Word .doc định dạng chuẩn căn lề, bảng biểu, in ấn)
```

### 3. Các quy tắc sư phạm bắt buộc áp dụng trong Prompt Engine mới:
1. **Chỉ thị Cấm Dùng Mẫu Khung Vô Nghĩa**:
   - Nghiêm cấm xuất hiện các câu sáo rỗng như: *"GV yêu cầu HS đọc sách giáo khoa"*, *"HS thảo luận nhóm và trả lời"*, *"GV nhận xét và kết luận"*.
   - Mọi hoạt động phải ghi rõ:
     - **Câu hỏi phát vấn cụ thể là gì?**
     - **Tình huống đưa ra có số liệu/dữ kiện gì trích từ tài liệu?**
     - **Nội dung ghi bảng chi tiết gồm những ý nào?**
     - **Sản phẩm của học sinh phải là câu trả lời cụ thể có đáp án kèm theo.**
2. **Mô-đun Phiếu Học Tập & Bài Tập Đi Kèm**:
   - Tự động sinh ít nhất 2 Phiếu học tập (Worksheet) có câu hỏi vận dụng thực tế bám sát bài đọc.
   - 5 câu hỏi trắc nghiệm củng cố cuối giờ và 1 bài tập tình huống thực tiễn.
3. **Chế độ Đối Chiếu Song Song (Proof of Context)**:
   - Giáo viên có thể bấm nút *"Xem tài liệu nguồn đã dùng"* để hiển thị chính xác các đoạn văn bản trong sách mà AI đã dùng để soạn từng hoạt động.

---

## TRỤ CỘT 5: CỔNG THANH TOÁN TỰ ĐỘNG (VIETQR/WEBHOOK) & XUẤT HÓA ĐƠN ĐIỆN TỬ

### 1. Kiến trúc Cổng Thanh Toán Tự Động:

```
[Giáo viên / Trường học chọn gói] ──► [Chọn thời hạn & số User]
                                              │
                                              ▼
                                 [Sinh Mã VietQR Động]
                                 - Số tài khoản ngân hàng chính thức
                                 - Ngân hàng: MBBank / Vietcombank / BIDV
                                 - Số tiền chính xác từng đồng
                                 - Cú pháp chuẩn: ST <Mã_Đồng_Bộ> <Mã_Gói>
                                              │
                                              ▼
                                 [Khách quét mã trên App Ngân Hàng]
                                              │
                                              ▼
                                 [Hệ Thống Ngân Hàng / Webhook Gateway]
                                 (SePay / PayOS / VietQR Open API)
                                              │
                                              ▼
                                 [Webhook Server /api/payment/webhook]
                                 - Kiểm tra số tiền & mã đồng bộ
                                 - Cập nhật License key sang "PRO / SCHOOL"
                                 - Ghi nhận Transaction vào cơ sở dữ liệu
                                              │
                                              ▼
                                 [KÍCH HOẠT GÓI NGAY TRONG 3 GIÂY!]
                                 - Gửi thông báo trên App điện thoại & Web
                                 - Tự động sinh Hóa đơn / Biên lai điện tử
```

### 2. Hệ thống Hóa Đơn & Biên Lai Thu Phí Tự Động:
- **Tự động xuất biên lai điện tử PDF ngay sau khi thanh toán**:
  - Tiêu đề: *Biên Lai Thu Phí Bản Quyền Phần Mềm Smart Teacher Schedule AI*.
  - Mã biên lai: `BL-2026-XXXXX` (Mã hash chống giả mạo).
  - Thông tin người mua: Tên giáo viên, Trường học, Mã đồng bộ, SĐT.
  - Chi tiết dịch vụ: Tên gói cước, số lượng User, thời hạn sử dụng, tổng tiền.
  - Chữ ký số điện tử của Đơn vị phát triển: *Huy Technology AI*.
- **Hỗ trợ xuất Hóa đơn GTGT (VAT) điện tử cho Khách hàng Trường học**:
  - Cung cấp form nhập thông tin doanh nghiệp / đơn vị sự nghiệp công lập: Tên trường, Mã số thuế, Địa chỉ, Email nhận hóa đơn.
  - Kết nối API xuất hóa đơn điện tử hợp lệ phục vụ công tác thanh quyết toán ngân sách nhà nước hoặc quỹ nhà trường.

---

## TRỤ CỘT 6: MÔ HÌNH ĐỊNH GIÁ THEO USER, KẾ HOẠCH TÀI CHÍNH & PHÂN TÍCH ĐỐI THỦ

### 1. Phân tích đối thủ cạnh tranh trên thị trường Giáo dục số Việt Nam:

| Đối thủ | Thế mạnh | Điểm yếu | Mức giá trên thị trường | So sánh với Smart Teacher Schedule AI |
| :--- | :--- | :--- | :--- | :--- |
| **VnEdu (VNPT)** | Phổ cập trường công lập, tích hợp quản lý điểm và sổ học bạ quốc gia. | Giao diện cũ, trải nghiệm di động kém, không có AI soạn giáo án 5512/2634, không có Voice AI, cồng kềnh. | Thu theo trường hoặc gói phụ huynh ~15.000 - 30.000 đ/tháng/HS (qua SMS/App). | Smart Teacher Schedule AI vượt trội hoàn toàn về AI Sư phạm, thời khóa biểu thông minh cá nhân hóa, giao diện hiện đại 4.0. |
| **SMAS (Viettel)** | Hạ tầng viễn thông mạnh, mạng lưới trường học sâu rộng. | Nặng về hành chính, ít công cụ hỗ trợ trực tiếp giờ lên lớp của giáo viên bộ môn và GVCN. | Thu theo dự án cấp Sở/Phòng hoặc gói Sổ liên lạc ~120.000 đ/năm/HS. | Smart Teacher tập trung giải phóng sức lao động cho giáo viên, quản lý nề nếp chuyên cần 1-chạm mượt mà. |
| **K12Online** | Chuyên sâu về dạy học trực tuyến, thi và kiểm tra đánh giá. | Chi phí triển khai toàn trường đắt đỏ, phức tạp, không tối ưu cho giáo viên quản lý lịch dạy hàng ngày. | 200.000 - 500.000 đ/học sinh/năm hoặc gói trường từ 20 - 50 triệu/năm. | Smart Teacher linh hoạt hơn, chi phí theo user rẻ hơn 50-70%, dùng được cả online lẫn offline. |
| **Shub Classroom / Azota** | Giao bài tập, tạo đề thi trắc nghiệm và chấm bài nhanh chóng. | Không có thời khóa biểu cá nhân, không có AI soạn kế hoạch bài dạy chuẩn quy chuẩn Bộ GD, thiếu cổng trường học chuyên sâu. | Bản Pro GV: 50.000 - 99.000 đ/tháng. Gói trường học tính theo đầu HS. | Smart Teacher tích hợp đầy đủ 4 cổng liên thông (GV, Học sinh, Phụ huynh, Nhà trường) và AI Sư phạm 6-in-1. |

---

### 2. Bảng định giá dịch vụ theo User (User-Based Pricing Model):

Triết lý định giá: **Chi phí siêu tiết kiệm trên mỗi cá nhân, cực kỳ dễ quyết định mua, nhưng đem lại doanh thu ổn định và bền vững theo quy mô người dùng (Volume-based Recurring Revenue).**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   HỆ THỐNG GÓI CƯỚC THEO USER NGƯỜI DÙNG                        │
├──────────────────┬──────────────────┬──────────────────┬────────────────────────┤
│ ĐỐI TƯỢNG        │ GÓI MIỄN PHÍ     │ GÓI CÁ NHÂN VIP  │ GÓI TRƯỜNG HỌC THEO QUY│
│                  │ (STARTER)        │ (PRO USER)       │ MÔ USER TOÀN TRƯỜNG    │
├──────────────────┼──────────────────┼──────────────────┼────────────────────────┤
│ 👨‍🏫 GIÁO VIÊN    │ 0 đ / vĩnh viễn  │ 29.000 đ / tháng │ Tính gộp theo gói      │
│ (GVBM & GVCN)    │ Lịch dạy cơ bản, │ hoặc             │ trường học (cấp tài    │
│                  │ 1 lớp, AI cơ bản │ 199.000 đ / năm  │ khoản Pro đầy đủ cho   │
│                  │                  │ (Tiết kiệm 43%)  │ toàn bộ giáo viên)     │
├──────────────────┼──────────────────┼──────────────────┼────────────────────────┤
│ 👨‍👩‍👧 PHỤ HUYNH & │ 0 đ / vĩnh viễn  │ 15.000 đ / tháng │ Bao gồm trong tài trợ  │
│ 🎒 HỌC SINH      │ Xem TKB, gửi đơn │ hoặc             │ của gói trường học     │
│                  │ xin nghỉ học     │ 99.000 đ / năm   │ (hoặc phụ huynh tự     │
│                  │ trực tuyến       │ Báo cáo AI, SMS  │ nâng cấp gói VIP)      │
├──────────────────┼──────────────────┼──────────────────┼────────────────────────┤
│ 🏫 NHÀ TRƯỜNG &  │ Dùng thử 30 ngày │ ───────────────  │ 4.000 - 8.000 đ /      │
│ 🏢 CƠ SỞ GD      │ toàn bộ tính năng│                  │ USER / THÁNG           │
│ (Trường học,     │ cho 1 khối lớp   │                  │ (Tính theo tổng số HS  │
│ Trung tâm GD)    │                  │                  │ & GV toàn trường)      │
└──────────────────┴──────────────────┴──────────────────┴────────────────────────┘
```

#### Chi tiết bảng giá Gói Trường Học theo bậc quy mô User:
- **Trường Quy mô Nhỏ (< 500 users)**: 8.000 đ / user / tháng (hoặc 75.000 đ / user / năm học).
- **Trường Quy mô Vừa (500 - 1.500 users)**: 6.000 đ / user / tháng (hoặc 55.000 đ / user / năm học).
- **Trường Quy mô Lớn (> 1.500 users)**: 4.500 đ / user / tháng (hoặc 40.000 đ / user / năm học).
- **Đặc quyền Gói Trường Học**:
  - Cổng Quản lý Trường học riêng biệt (`/school`).
  - Bảng điều khiển Giám thị / Ban Giám hiệu theo dõi chuyên cần và tiến độ giờ dạy toàn trường thời gian thực.
  - Cấp tài khoản Giáo viên Pro không giới hạn cho toàn bộ giáo viên trong trường.
  - Miễn phí cổng nạp dữ liệu danh sách học sinh từ file Excel của trường và đào tạo tập huấn trực tuyến.

---

### 3. Kế hoạch tài chính & Dự phóng doanh thu - chi phí (Financial Projections):

#### A. Dự phóng Chi phí Vận hành (Cost Structure / OPEX hàng tháng):
- **Chi phí Máy chủ & Cơ sở dữ liệu (Supabase Pro + Vercel Pro + Cloudflare)**: ~1.200.000 đ / tháng.
- **Chi phí Token AI (Google Gemini Flash/Pro qua API tối ưu caching)**: ~2.000.000 đ / tháng (cho ~10.000 lượt sinh giáo án).
- **Chi phí Cổng Webhook Ngân hàng & SMS Gateway (SePay / VietQR)**: ~300.000 đ / tháng.
- **Chi phí Duy trì Tên miền & Chứng chỉ số**: ~150.000 đ / tháng.
- **Chi phí Tiếp thị & Chăm sóc khách hàng cơ bản**: ~3.000.000 đ / tháng.
- **👉 TỔNG CHI PHÍ VẬN HÀNH THÁNG (OPEX)**: **~6.650.000 đ / tháng** (~80.000.000 đ / năm).

#### B. Kịch bản Doanh thu (Revenue Scenarios):

##### Kịch bản 1: Khởi động (Mục tiêu 6 tháng đầu)
- 500 Giáo viên Pro cá nhân: $500 \times 199.000\text{ đ} = 99.500.000\text{ đ/năm}$.
- 3 Trường học cỡ vừa (bình quân 800 users/trường = 2.400 users): $2.400 \times 55.000\text{ đ} = 132.000.000\text{ đ/năm}$.
- 1.000 Phụ huynh VIP: $1.000 \times 99.000\text{ đ} = 99.000.000\text{ đ/năm}$.
- **👉 TỔNG DOANH THU NĂM**: **330.500.000 đ**.
- **👉 LỢI NHUẬN RÒNG (Sau chi phí OPEX)**: **250.500.000 đ** (Biên lợi nhuận: **75.8%**).

##### Kịch bản 2: Mở rộng (Năm thứ 2 - Tăng trưởng quy mô)
- 2.500 Giáo viên Pro cá nhân: $2.500 \times 199.000\text{ đ} = 497.500.000\text{ đ/năm}$.
- 15 Trường học (bình quân 1.000 users/trường = 15.000 users): $15.000 \times 50.000\text{ đ} = 750.000.000\text{ đ/năm}$.
- 8.000 Phụ huynh VIP: $8.000 \times 99.000\text{ đ} = 792.000.000\text{ đ/năm}$.
- **👉 TỔNG DOANH THU NĂM**: **2.039.500.000 đ** (~2.04 Tỷ đồng).
- **👉 CHI PHÍ VẬN HÀNH DỰ KIẾN**: ~200.000.000 đ / năm.
- **👉 LỢI NHUẬN RÒNG**: **~1.84 Tỷ đồng** (Biên lợi nhuận: **90.2%**).

#### C. Điểm hòa vốn (Break-Even Point):
- Với chi phí cố định tối thiểu ~6.650.000 đ/tháng, hệ thống **đạt điểm hòa vốn chỉ cần**:
  - Hoặc **34 giáo viên đăng ký gói năm** mỗi tháng.
  - Hoặc **1 trường học 1.200 học sinh** ký kết hợp đồng năm.
- Điều này chứng minh mô hình kinh doanh có **độ rủi ro tài chính cực kỳ thấp** và khả năng sinh lời vượt trội nhờ đòn bẩy công nghệ số.

---

## LỘ TRÌNH TRIỂN KHAI CHI TIẾT (PHÂN KỲ 5 GIAI ĐOẠN)

```
[Giai đoạn 1] ──► [Giai đoạn 2] ──► [Giai đoạn 3] ──► [Giai đoạn 4] ──► [Giai đoạn 5]
Desktop .EXE      Admin Portal     AI Soạn Giáo Án   Cổng Thanh Toán  Go-to-Market &
& Auto-Update     & Telemetry      Deep-RAG           & Hóa Đơn VAT    Mở Rộng Trường
(Tuần 1)          (Tuần 2)         (Tuần 3)           (Tuần 4)         (Tuần 5 trở đi)
```

### Giai đoạn 1: Đóng gói Bộ cài đặt Windows .EXE & Cơ chế Auto-Update (Tuần 1)
- [x] Tạo file cấu hình và kịch bản đóng gói `electron-builder` xuất `SmartTeacherSchedule_Setup_v1.8.0.exe` (NSIS) và Portable `.exe`.
- [x] Nhúng bộ Icon đa phân giải chuẩn PE vào file binary `.exe`.
- [x] Xây dựng API `/api/version` quản lý phiên bản tập trung.
- [x] Tích hợp In-App Updater kiểm tra và tải ngầm APK trên Android.
- [x] Cập nhật liên kết tải trực tiếp trên website `gvcncdsai.io.vn`.

### Giai đoạn 2: Xây dựng Phân hệ Super Admin Portal `/admin` (Tuần 2)
- [x] Thiết kế layout giao diện `/admin` bảo mật, chuyên nghiệp.
- [x] Xây dựng API bộ đếm lượt tải `/api/analytics/downloads` cho từng nền tảng (Android, Windows, Mac, Linux, PWA).
- [x] Xây dựng hệ thống đo lường lưu lượng truy cập (Visitors, Pageviews, Active Devices).
- [x] Xây dựng bảng giám sát người dùng, mã đồng bộ, trường học đối tác và dung lượng lưu trữ.
- [x] Bổ sung cơ chế bảo mật đăng nhập Admin với xác thực mã PIN quản trị.

### Giai đoạn 3: Nâng cấp AI Soạn Giáo Án Bám Sát Dữ Liệu Thực Tế (Deep-RAG) (Tuần 3)
- [x] Xây dựng module trích xuất văn bản nâng cao đọc file Word (`.docx`), PDF giáo trình không bị cắt xén.
- [x] Cải tiến thuật toán Semantic Chunking tìm đúng chương bài học tương ứng với tên bài giáo viên chọn.
- [x] Tái cấu trúc bộ Prompt System của Gemini AI: Bắt buộc nhúng định nghĩa, công thức, số liệu, bài tập cụ thể từ sách vào 4 hoạt động của CV 5512 và CV 2634.
- [x] Bổ sung tính năng sinh Phiếu học tập và câu hỏi trắc nghiệm kiểm tra cuối bài kèm đáp án.
- [x] Bổ sung giao diện xem đối chiếu song song giữa giáo án và tài liệu gốc.

### Giai đoạn 4: Tích hợp Cổng Thanh Toán VietQR Tự Động & Hóa Đơn Điện Tử (Tuần 4)
- [x] Tích hợp API sinh mã VietQR động với cú pháp nạp tiền chuẩn theo Mã giáo viên/Mã trường.
- [x] Xây dựng Webhook tiếp nhận thanh toán tự động, nâng hạng mức License ngay trong 3 giây.
- [x] Thiết kế mẫu Biên lai điện tử PDF tự động gửi cho khách hàng cá nhân qua Zalo / Email.
- [x] Xây dựng form nhập thông tin doanh nghiệp xuất Hóa đơn GTGT điện tử cho các trường học.

### Giai đoạn 5: Chiến Lược Bán Hàng & Mở Rộng Hệ Sinh Thái (Tuần 5 trở đi)
- [x] Cập nhật bảng giá gói cước mới theo User trên trang chủ và tab Cài đặt của toàn bộ các nền tảng.
- [x] Phát hành tài liệu giới thiệu giải pháp dành cho Ban Giám hiệu trường học (Proposal & Pitch Deck).
- [x] Kích hoạt chương trình *"Dùng thử 30 ngày cho các trường học đối tác"*.
- [x] Đo lường chỉ số chuyển đổi, tối ưu hóa dịch vụ và liên tục nâng cấp hệ sinh thái.

---

> **Kết luận**: Kế hoạch này là kim chỉ nam toàn diện kết hợp giữa **Năng lực Kỹ thuật vững chắc**, **Trải nghiệm Người dùng đột phá** và **Mô hình Kinh doanh siêu tối ưu**. Việc triển khai theo từng trụ cột sẽ đưa Smart Teacher Schedule AI trở thành hệ sinh thái công nghệ giáo dục số hàng đầu tại Việt Nam!
