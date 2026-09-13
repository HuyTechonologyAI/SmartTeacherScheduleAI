import { NextRequest, NextResponse } from 'next/server';

// Bộ đếm lưu lượng thực tế bắt đầu từ 0
const uniqueVisitorsSet = new Set<string>();
const deviceCounts = {
  mobile: 0,
  desktop: 0,
  tablet: 0
};

let trafficStats = {
  totalPageviews: 0,
  uniqueVisitors: 0,
  activeTeachersToday: 0,
  activationRate: 0,
  avgSessionDuration: '0m 00s',
  pages: [
    { path: '/app', name: 'Cổng Nghiệp Vụ Giáo Viên', views: 0, percentage: 0 },
    { path: '/', name: 'Trang Chủ & Tải Ứng Dụng', views: 0, percentage: 0 },
    { path: '/student', name: 'Cổng Học Sinh & Gia Sư AI', views: 0, percentage: 0 },
    { path: '/parent', name: 'Sổ Liên Lạc Phụ Huynh', views: 0, percentage: 0 },
    { path: '/school', name: 'Cổng Quản Lý Nhà Trường', views: 0, percentage: 0 }
  ],
  deviceBreakdown: {
    mobile: 0,
    desktop: 0,
    tablet: 0
  },
  hourlyTraffic: [] as Array<{ hour: string; views: number }>
};

export async function GET() {
  return NextResponse.json({
    success: true,
    ...trafficStats
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = body.page || '/app';
    const ua = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anon';

    // 1. Tăng lượt xem trang thực tế
    trafficStats.totalPageviews += 1;

    // 2. Định danh khách truy cập độc lập
    const visitorKey = `${ip}_${ua.slice(0, 40)}`;
    if (!uniqueVisitorsSet.has(visitorKey)) {
      uniqueVisitorsSet.add(visitorKey);
      trafficStats.uniqueVisitors = uniqueVisitorsSet.size;
    }

    // 3. Phân loại thiết bị
    const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /iPad|Tablet/i.test(ua);
    if (isTablet) deviceCounts.tablet += 1;
    else if (isMobile) deviceCounts.mobile += 1;
    else deviceCounts.desktop += 1;

    const totalDevices = deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet;
    if (totalDevices > 0) {
      trafficStats.deviceBreakdown = {
        mobile: Number(((deviceCounts.mobile / totalDevices) * 100).toFixed(1)),
        desktop: Number(((deviceCounts.desktop / totalDevices) * 100).toFixed(1)),
        tablet: Number(((deviceCounts.tablet / totalDevices) * 100).toFixed(1))
      };
    }

    // 4. Cập nhật lượt xem từng trang và tính tỷ trọng thật
    let pageItem = trafficStats.pages.find(p => p.path === page);
    if (!pageItem) {
      pageItem = { path: page, name: page, views: 0, percentage: 0 };
      trafficStats.pages.push(pageItem);
    }
    pageItem.views += 1;

    trafficStats.pages.forEach(p => {
      p.percentage = trafficStats.totalPageviews > 0
        ? Number(((p.views / trafficStats.totalPageviews) * 100).toFixed(1))
        : 0;
    });

    // 5. Cập nhật phân bổ theo giờ thực tế
    const currentHour = `${String(new Date().getHours()).padStart(2, '0')}:00`;
    const hourItem = trafficStats.hourlyTraffic.find(h => h.hour === currentHour);
    if (hourItem) {
      hourItem.views += 1;
    } else {
      trafficStats.hourlyTraffic.push({ hour: currentHour, views: 1 });
      if (trafficStats.hourlyTraffic.length > 24) {
        trafficStats.hourlyTraffic.shift();
      }
    }

    return NextResponse.json({
      success: true,
      totalPageviews: trafficStats.totalPageviews,
      uniqueVisitors: trafficStats.uniqueVisitors
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}