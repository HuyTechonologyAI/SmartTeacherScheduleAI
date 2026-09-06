# Smart Teacher Schedule AI - Desktop (Windows, macOS, Linux)
Phiên bản: v1.4.0
Tác giả: Huy Technology AI (Hotline: 0961364600)

## Hướng dẫn sử dụng trên Máy tính (PC / Laptop):

### Cách 1: Chạy ngay không cần cài đặt (Khuyên dùng trên Windows)
- Bấm đúp chuột vào file `SmartTeacherSchedule_Windows.bat` (hoặc `Run_Desktop_Silent.vbs`).
- Ứng dụng sẽ tự động mở trong cửa sổ ứng dụng Desktop độc lập (sử dụng Edge hoặc Chrome có sẵn trên Windows), đầy đủ thanh tiêu đề và không có thanh địa chỉ trình duyệt.
- Dữ liệu đồng bộ đám mây thời gian thực 2 chiều với điện thoại Android và iPhone qua Mã Đồng Bộ Giáo Viên.

### Cách 2: Cài đặt dạng Desktop PWA trực tiếp từ trình duyệt
1. Mở trình duyệt Chrome hoặc Edge trên máy tính, truy cập: https://gvcncdsai.io.vn/app
2. Bấm vào biểu tượng **Cài đặt ứng dụng** (Install App) trên thanh địa chỉ hoặc bấm nút **"Cài đặt App vào máy tính"** ở đầu trang.
3. Ứng dụng sẽ tự động tạo Shortcut trên Desktop và Start Menu như một phần mềm Windows/macOS/Linux chính thống.

### Cách 3: Chạy bằng Electron (Dành cho Developer hoặc đóng gói bộ cài)
1. Cài đặt Node.js: https://nodejs.org
2. Mở terminal tại thư mục này và chạy:
   ```bash
   npm install
   npm start
   ```
3. Đóng gói file cài đặt (.exe, .deb, .dmg):
   ```bash
   npm run build:win      # Tạo bộ cài Windows Setup (.exe) & Portable (.exe)
   npm run build:linux    # Tạo bộ cài Linux (.AppImage, .deb)
   npm run build:mac      # Tạo bộ cài macOS (.dmg, .zip)
   ```
