import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    versionName: '2.2.0',
    versionCode: 22,
    minRequiredVersion: 18,
    releaseDate: '2026-09-16',
    title: 'Bản Cập Nhật v2.2.0 - Khung Skill Sư Phạm Toàn Diện & Kế Hoạch Bài Dạy Chuẩn Chia Cột CV 5512 / CV 2634',
    releaseNotes: [
      'Chuẩn hóa Kế hoạch bài dạy (Giáo án) theo bố cục BẢNG 2 CỘT CHUẨN BỘ GD&ĐT (Công văn 5512/BGDĐT-GDTrH): Cột trái 4 bước sư phạm GV-HS mạch lạc, Cột phải kiến thức trọng tâm & sản phẩm học sinh cần đạt.',
      'Bổ sung Bảng Ma Trận Tiến Trình Dạy Học Tổng Thể (5 cột) ở đầu Mục III: Phân bổ khoa học tên hoạt động, mục tiêu, phương pháp, phương án đánh giá và hồ sơ sản phẩm.',
      'Chuẩn hóa Giáo án thực hành nghề nghiệp (Công văn 2634/GDNN) theo BẢNG 6 CỘT CHUẨN XƯỞNG: Thao tác mẫu 3 lần, giám sát phân đoạn & tổng hợp, nghiệm thu định lượng và kỷ luật ATLĐ - 5S xưởng.',
      'Bộ Kỹ Năng Sư Phạm Đa Phương Pháp (Pedagogical Skills Framework) với 7 quy trình giảng dạy tân tiến (5E, Trạm, STEM, PBL, KWLH, Bàn tay nặn bột, Thực hành 5S) và 4 phong cách sư phạm cá nhân hóa.',
      'Cơ chế Quản Lý & Tặng Mã Voucher Khuyến Mãi cho Admin Hub: Tạo, sửa, cấp quyền, cấu hình chiết khấu và theo dõi lịch sử quy đổi trực tiếp.',
      'Khắc phục triệt để lỗi tải file rỗng bằng Universal Parameter Auto-Detection trên toàn bộ các tệp Word (.doc).',
      'Đồng bộ hóa giao diện hiển thị bảng biểu Dark/Light mode trên toàn bộ hệ sinh thái Web, Android và Windows Desktop.'
    ],
    ecosystem: {
      masterHub: 'https://huycncdsai.io.vn',
      smartTaxAi: 'https://smarttax-ai.vercel.app',
      smartTeacherAi: 'https://www.gvcncdsai.io.vn',
      bankRails: 'ACB - 37780997 (NGO QUOC HUY) - Chi nhánh Tân Mai',
      supportHotline: '0961.364.600'
    },
    platforms: {
      android: {
        versionName: '2.2.0',
        versionCode: 22,
        downloadUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_v2.2.0.apk',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.2.0/SmartTeacherSchedule_v2.2.0.apk',
        fileName: 'SmartTeacherSchedule_v2.2.0.apk',
        fileSizeMb: 15.85,
        isForceUpdate: false
      },
      windows: {
        versionName: '2.2.0',
        versionCode: 22,
        setupUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_Setup_v2.2.0.exe',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.2.0/SmartTeacherSchedule_Setup_v2.2.0.exe',
        fileName: 'SmartTeacherSchedule_Setup_v2.2.0.exe',
        isForceUpdate: false
      },
      web: {
        versionName: '2.2.0',
        url: 'https://www.gvcncdsai.io.vn/app'
      }
    }
  });
}
