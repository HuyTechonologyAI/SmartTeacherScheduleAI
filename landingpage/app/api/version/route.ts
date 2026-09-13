import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    versionName: '1.8.0',
    versionCode: 18,
    minRequiredVersion: 15,
    releaseDate: '2026-09-14',
    title: 'Bản Cập Nhật v1.8.0 - Đồng Bộ Đám Mây & Bộ Cài Desktop EXE',
    releaseNotes: [
      'Đóng gói bộ cài chính thức Windows Installer (.exe) và Portable (.exe) có biểu tượng chính thức.',
      'Bổ sung phân hệ Quản lý Đơn xin nghỉ phép của phụ huynh học sinh (tự động cập nhật chuyên cần).',
      'Bổ sung Sổ Báo Giảng tự động hóa theo chuẩn mẫu biểu A4 sư phạm.',
      'Sửa triệt để lỗi ép kiểu danh sách đồng bộ đám mây trên thiết bị di động.',
      'Tích hợp cơ chế tự động kiểm tra và thông báo cập nhật phiên bản mới In-App OTA.'
    ],
    platforms: {
      android: {
        versionName: '1.8.0',
        versionCode: 18,
        downloadUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_v1.8.0.apk',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v1.8.0/SmartTeacherSchedule_v1.8.0.apk',
        fileName: 'SmartTeacherSchedule_v1.8.0.apk',
        fileSizeMb: 15.12,
        isForceUpdate: false
      },
      windows: {
        versionName: '1.8.0',
        versionCode: 18,
        setupUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_Setup_v1.8.0.exe',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v1.8.0/SmartTeacherSchedule_Setup_v1.8.0.exe',
        fileName: 'SmartTeacherSchedule_Setup_v1.8.0.exe',
        isForceUpdate: false
      },
      web: {
        versionName: '1.8.0',
        url: 'https://www.gvcncdsai.io.vn/app'
      }
    }
  });
}
