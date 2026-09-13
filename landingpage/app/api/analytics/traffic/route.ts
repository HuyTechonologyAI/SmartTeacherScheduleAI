import { NextRequest, NextResponse } from 'next/server';

let trafficStats = {
  totalPageviews: 24860,
  uniqueVisitors: 6920,
  activeTeachersToday: 842,
  activationRate: 78.4, // %
  avgSessionDuration: '14m 25s',
  pages: [
    { path: '/app', name: 'Cổng Nghiệp Vụ Giáo Viên', views: 16840, percentage: 67.7 },
    { path: '/', name: 'Trang Chủ & Tải Ứng Dụng', views: 4230, percentage: 17.0 },
    { path: '/student', name: 'Cổng Học Sinh & Gia Sư AI', views: 1980, percentage: 8.0 },
    { path: '/parent', name: 'Sổ Liên Lạc Phụ Huynh', views: 1250, percentage: 5.0 },
    { path: '/school', name: 'Cổng Quản Lý Nhà Trường', views: 560, percentage: 2.3 }
  ],
  deviceBreakdown: {
    mobile: 68.5,
    desktop: 28.2,
    tablet: 3.3
  },
  hourlyTraffic: [
    { hour: '06:00', views: 420 },
    { hour: '07:00', views: 1250 },
    { hour: '08:00', views: 980 },
    { hour: '09:00', views: 760 },
    { hour: '10:00', views: 640 },
    { hour: '11:00', views: 890 },
    { hour: '12:00', views: 530 },
    { hour: '13:00', views: 1100 },
    { hour: '14:00', views: 920 },
    { hour: '15:00', views: 850 },
    { hour: '16:00', views: 740 },
    { hour: '17:00', views: 620 },
    { hour: '18:00', views: 480 },
    { hour: '19:00', views: 830 },
    { hour: '20:00', views: 1420 },
    { hour: '21:00', views: 1680 }
  ]
};

export async function GET() {
  return NextResponse.json({
    success: true,
    ...trafficStats
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const page = body.page || '/app';
    trafficStats.totalPageviews += 1;

    const pageItem = trafficStats.pages.find(p => p.path === page);
    if (pageItem) {
      pageItem.views += 1;
    }

    return NextResponse.json({
      success: true,
      totalPageviews: trafficStats.totalPageviews
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}