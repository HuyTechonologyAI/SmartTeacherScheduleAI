# Smart Teacher Schedule AI - Desktop (Windows, macOS, Linux)
Phiên bản: v1.4.0
Tác giả: Huy Technology AI (Hotline: 0961364600)

## Hướng dẫn sử dụng trên Máy tính (PC / Laptop):

### Cách 1: Khởi chạy ngay bằng Biểu tượng Logo chính thức (Khuyên dùng trên Windows)
- Bấm đúp chuột vào biểu tượng **`Smart Teacher Schedule AI`** (file shortcut có gắn sẵn **Logo chính thức** của App).
- Hoặc bấm đúp vào file **`Tao_Bieu_Tuong_Desktop.bat`** để tạo ngay biểu tượng có Logo chính thức ra Màn hình chính (Desktop) của máy tính.
- Ứng dụng sẽ tự động mở trong cửa sổ ứng dụng Desktop độc lập (sử dụng Edge hoặc Chrome có sẵn trên Windows), đầy đủ thanh tiêu đề, biểu tượng Logo trên Taskbar và không có thanh địa chỉ trình duyệt.
- Dữ liệu đồng bộ đám mây thời gian thực 2 chiều với điện thoại Android và iPhone qua Mã Đồng Bộ Giáo Viên.

### Cách 2: Cài đặt dạng Desktop PWA trực tiếp từ trình duyệt
1. Mở trình duyệt Chrome hoặc Edge trên máy tính, truy cập: https://gvcncdsai.io.vn/app
2. Bấm vào biểu tượng **Cài đặt ứng dụng** (Install App) trên thanh địa chỉ hoặc bấm nút **"Cài đặt App vào máy tính"** ở đầu trang.
3. Trình duyệt sẽ tự động gắn Logo chính thức và tạo Shortcut trên Desktop và Start Menu như một phần mềm Windows/macOS/Linux chính thống.

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
