import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Khởi tạo bộ đếm chuẩn thực tế bắt đầu từ 0
let inMemoryStats = {
  total: 0,
  platforms: {
    android: 0,
    windows_setup: 0,
    windows_portable: 0,
    ios: 0,
    web_pwa: 0
  },
  dailySeries: [] as Array<{ date: string; android: number; windows: number; ios: number }>,
  recentEvents: [] as Array<{ platform: string; version: string; source: string; time: string }>
};

export async function GET() {
  try {
    const { data: dbRows, error } = await supabase
      .from('download_events')
      .select('platform, version, source, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && dbRows && dbRows.length > 0) {
      const counts: Record<string, number> = {
        android: 0,
        windows_setup: 0,
        windows_portable: 0,
        ios: 0,
        web_pwa: 0
      };

      // Đếm theo từng nền tảng thực tế
      dbRows.forEach((r: any) => {
        if (counts[r.platform] !== undefined) {
          counts[r.platform] += 1;
        } else if (r.platform === 'android_aab') {
          counts.android += 1;
        }
      });

      // Tạo chuỗi ngày thực tế từ dbRows
      const dateMap = new Map<string, { android: number; windows: number; ios: number }>();
      dbRows.forEach((r: any) => {
        const d = r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'Hôm nay';
        if (!dateMap.has(d)) {
          dateMap.set(d, { android: 0, windows: 0, ios: 0 });
        }
        const item = dateMap.get(d)!;
        if (r.platform === 'android' || r.platform === 'android_aab') item.android += 1;
        else if (r.platform.startsWith('windows')) item.windows += 1;
        else if (r.platform === 'ios') item.ios += 1;
      });

      const series = Array.from(dateMap.entries()).map(([date, val]) => ({
        date,
        ...val
      }));

      // Danh sách sự kiện thực tế
      const events = dbRows.slice(0, 15).map((r: any) => ({
        platform: r.platform || 'android',
        version: r.version || '2.1.0',
        source: r.source || 'Website',
        time: r.created_at ? new Date(r.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'
      }));

      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      return NextResponse.json({
        success: true,
        total,
        platforms: counts,
        dailySeries: series,
        recentEvents: events
      });
    }
  } catch (e) {
    // Không có kết nối DB, dùng bộ đếm in-memory thật
  }

  return NextResponse.json({
    success: true,
    ...inMemoryStats
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const platform = body.platform || 'android';
    const source = body.source || 'Website Direct';
    const version = body.version || '2.1.0';

    if ((inMemoryStats.platforms as any)[platform] !== undefined) {
      (inMemoryStats.platforms as any)[platform] += 1;
    }
    inMemoryStats.total += 1;

    const currentTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    inMemoryStats.recentEvents.unshift({
      platform,
      version,
      source,
      time: currentTimeStr
    });
    if (inMemoryStats.recentEvents.length > 20) {
      inMemoryStats.recentEvents.pop();
    }

    try {
      await supabase.from('download_events').insert([
        {
          platform,
          version,
          source,
          user_agent: req.headers.get('user-agent') || 'Unknown'
        }
      ]);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Ghi nhận lượt tải thành công',
      currentTotal: inMemoryStats.total
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}