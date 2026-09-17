import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    versionName: '2.3.0',
    versionCode: 23,
    minRequiredVersion: 18,
    releaseDate: '2026-09-17',
    title: 'Bản Cập Nhật v2.3.0 - Nâng Cấp Trải Nghiệm AI Sư Phạm & Giao Diện Tương Tác Trực Quan',
    releaseNotes: [
      'Bổ sung hiệu ứng Skeleton Shimmer Loading trực quan trong lúc AI soạn kế hoạch bài dạy và đóng gói học liệu 6-in-1, khắc phục hoàn toàn cảm giác chờ đợi.',
      'Tích hợp AiStatusBanner: Phân định minh bạch chế độ trực tuyến Gemini AI (Online) và chế độ dự phòng chuyên môn (Offline).',
      'Nâng cấp In-App Document Reader: Thanh tiến trình tải LinearProgressIndicator, bộ nhớ đệm thông minh LOAD_CACHE_ELSE_NETWORK tải trang siêu tốc.',
      'Hỗ trợ toàn diện Dark Mode cho Kế hoạch bài dạy HTML (Công văn 5512 & 2634) bảo vệ thị lực giáo viên khi soạn bài ban đêm.',
      'Hệ sinh thái Web: Bổ sung PWA Offline Banner tức thời khi mất kết nối internet, chuẩn hóa SEO Sitemap.xml và OpenGraph thẻ chia sẻ mạng xã hội.'
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
        versionName: '2.3.0',
        versionCode: 23,
        downloadUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_v2.3.0.apk',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.3.0/SmartTeacherSchedule_v2.3.0.apk',
        fileName: 'SmartTeacherSchedule_v2.3.0.apk',
        fileSizeMb: 15.15,
        isForceUpdate: false
      },
      windows: {
        versionName: '2.3.0',
        versionCode: 23,
        setupUrl: 'https://www.gvcncdsai.io.vn/downloads/SmartTeacherSchedule_Setup_v2.3.0.exe',
        backupUrl: 'https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v2.3.0/SmartTeacherSchedule_Setup_v2.3.0.exe',
        fileName: 'SmartTeacherSchedule_Setup_v2.3.0.exe',
        isForceUpdate: false
      },
      web: {
        versionName: '2.3.0',
        url: 'https://www.gvcncdsai.io.vn/app'
      }
    }
  });
}

