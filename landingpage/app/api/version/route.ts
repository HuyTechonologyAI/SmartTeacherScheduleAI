import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    versionName: '2.1.0',
    versionCode: 21,
    minRequiredVersion: 18,
    releaseDate: '2026-09-15',
    title: 'Bản Cập Nhật v2.1.0 - Hệ Sinh Thái Giáo Dục Thông Minh & Điều Phối 14 AI Toàn Diện',
    releaseNotes: [
      'Điều phối tự động 14 công cụ AI trong AI Central Hub (huycncdsai.io.vn) theo từng cấu phần giáo án: Slide, Sơ đồ tư duy, 4 ảnh kỹ thuật ComfyUI, Video vi mô và VietTTS.',
      'Trình chiếu Slide 16:9 Widescreen Canvas tương tác trực tiếp trên trình duyệt web, hiển thị 2 cột chuẩn mực sư phạm, điều hướng bàn phím, thumbnail và chế độ toàn màn hình.',
      'Động cơ Giọng Đọc Sư Phạm Đa Tầng (VietTTS Neural Voice) với 4 hồ sơ giọng chuẩn (Cô Hoài My, Thầy Nam Minh, Cô Mai Linh) và cơ chế tự động Audio Fallback.',
      'Tính năng Chỉnh Sửa Trực Tiếp Toàn Diện trên cả 6 cấu phần học liệu trước khi xuất bản file (.doc, .pptx, .txt, .svg).',
      'Công cụ SlideEditorModal hỗ trợ chỉnh sửa nhanh nội dung từng slide trực tiếp trên thẻ slide hoặc từ thanh trình chiếu.',
      'Cổng thanh toán tự động VietQR Napas 24/7 & Webhook 3 giây (ACB STK: 37780997 NGO QUOC HUY).',
      'Liên thông dữ liệu đồng bộ chéo giữa Master Hub huycncdsai.io.vn, SmartTax AI và Smart Teacher Schedule AI.'
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
        versionName: '2.1.0',
        versionCode: 21,
        downloadUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_v2.1.0.apk',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.1.0/SmartTeacherSchedule_v2.1.0.apk',
        fileName: 'SmartTeacherSchedule_v2.1.0.apk',
        fileSizeMb: 15.85,
        isForceUpdate: false
      },
      windows: {
        versionName: '2.1.0',
        versionCode: 21,
        setupUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_Setup_v2.1.0.exe',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.1.0/SmartTeacherSchedule_Setup_v2.1.0.exe',
        fileName: 'SmartTeacherSchedule_Setup_v2.1.0.exe',
        isForceUpdate: false
      },
      web: {
        versionName: '2.1.0',
        url: 'https://www.gvcncdsai.io.vn/app'
      }
    }
  });
}
