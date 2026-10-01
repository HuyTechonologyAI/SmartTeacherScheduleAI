import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    versionName: '2.4.0',
    versionCode: 24,
    minRequiredVersion: 18,
    releaseDate: '2026-10-01',
    title: 'Bản Cập Nhật v2.4.0 - Bảo Vệ Hồ Sơ Giáo Viên, Đồng Bộ An Toàn Đa Nền Tảng & Giao Diện Sạch Chuẩn Hóa',
    releaseNotes: [
      'Bảo vệ vĩnh viễn thông tin cá nhân & chuyên môn của Thầy Ngô Quốc Huy (Trường CĐ Kỹ Thuật - Công Nghệ Đồng Nai), ngăn chặn việc dữ liệu mẫu đè dữ liệu thật.',
      'Cơ chế Safe Two-Way Reconciliation: Phòng chống xóa trắng đám mây khi thiết bị mới kết nối gửi mảng sự kiện rỗng, tự động đối chiếu theo ID và mốc thời gian cập nhật.',
      'Clean Slate Onboarding: Thiết lập giao diện sạch 0 sự kiện cho người dùng mới trên toàn bộ nền tảng (Android, Web, Windows, Mac, iOS), hoàn toàn tách biệt dữ liệu với tài khoản Quản trị.',
      'Hệ thống tự động phát hiện phiên bản v2.4.0 và hiển thị thông báo cập nhật đồng bộ tức thời trên ứng dụng Android, Desktop và Web.'
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
        versionName: '2.4.0',
        versionCode: 24,
        downloadUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_v2.4.0.apk',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.4.0/SmartTeacherSchedule_v2.4.0.apk',
        fileName: 'SmartTeacherSchedule_v2.4.0.apk',
        fileSizeMb: 15.15,
        isForceUpdate: false
      },
      windows: {
        versionName: '2.4.0',
        versionCode: 24,
        setupUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_Setup_v2.4.0.exe',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.4.0/SmartTeacherSchedule_Setup_v2.4.0.exe',
        fileName: 'SmartTeacherSchedule_Setup_v2.4.0.exe',
        isForceUpdate: false
      },
      web: {
        versionName: '2.4.0',
        url: 'https://www.gvcncdsai.io.vn/app'
      }
    }
  });
}

