import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    versionName: '2.0.0',
    versionCode: 20,
    minRequiredVersion: 18,
    releaseDate: '2026-09-14',
    title: 'Bản Cập Nhật v2.0.0 (Golden Release) - Hệ Sinh Thái Chuyển Đổi Số Hợp Nhất 3 Nền Tảng',
    releaseNotes: [
      'Trụ Cột 5: Cổng thanh toán tự động VietQR Napas 24/7 & Webhook 3 giây (ACB STK: 37780997 NGO QUOC HUY).',
      'Trụ Cột 5: Biên lai điện tử PDF bảo mật SHA-256 có mộc đỏ và Form đăng ký xuất Hóa đơn GTGT (VAT).',
      'Trụ Cột 6: Động cơ AI Tài chính, Mô hình định giá theo User và Bộ quản lý Báo giá dự toán tự động (A4 PDF).',
      'Hệ Sinh Thái 3 Nền Tảng: Liên thông dữ liệu chéo giữa huycncdsai.io.vn (Master Hub), smarttax-ai.vercel.app (Thuế & HĐĐT) và EduViet (Sư phạm).',
      'Trụ Cột 1 (Kinh Doanh): Gói Combo Trường học tài trợ 1 năm SmartTax AI Pro (3.5 Triệu) và Ưu đãi 30% cho GV dạy thêm (HUYTECH-EDU).',
      'Trụ Cột 2 (Truyền Thông): Tối ưu Google Schema JSON-LD SEO ma trận tam giác và Bộ ấn phẩm Hồ Sơ Năng Lực 4.0 in PDF A4.',
      'Trụ Cột 3 (Vận Hành): Webhook xuất Hóa đơn điện tử sang SmartTax AI, Đăng nhập một lần Huy Tech ID SSO và Bảng giám sát OPEX 66.5%.'
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
        versionName: '2.0.0',
        versionCode: 20,
        downloadUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_v2.0.0.apk',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.0.0/SmartTeacherSchedule_v2.0.0.apk',
        fileName: 'SmartTeacherSchedule_v2.0.0.apk',
        fileSizeMb: 15.65,
        isForceUpdate: false
      },
      windows: {
        versionName: '2.0.0',
        versionCode: 20,
        setupUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_Setup_v2.0.0.exe',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.0.0/SmartTeacherSchedule_Setup_v2.0.0.exe',
        fileName: 'SmartTeacherSchedule_Setup_v2.0.0.exe',
        isForceUpdate: false
      },
      web: {
        versionName: '2.0.0',
        url: 'https://www.gvcncdsai.io.vn/app'
      }
    }
  });
}
