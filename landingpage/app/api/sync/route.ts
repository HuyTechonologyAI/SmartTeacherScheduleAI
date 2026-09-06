import { NextRequest, NextResponse } from 'next/server';

const GIST_ID = process.env.SYNC_GIST_ID || '41b9d5b2c31bd3c543622a04b92188d3';
const GITHUB_TOKEN = process.env.SYNC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';

interface SchedulePayload {
  id: string;
  subject: string;
  className: string;
  room: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type?: 'theory' | 'practice';
  sessionType?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  updatedAt?: number;
}

interface SyncPayload {
  syncCode: string;
  deviceName?: string;
  platform?: 'android' | 'ios' | 'windows' | 'mac' | 'linux' | 'web';
  updatedAt: number;
  schedules: SchedulePayload[];
}

const memoryCache = new Map<string, { data: SyncPayload; timestamp: number }>();

async function getFromGist(syncCode: string): Promise<SyncPayload | null> {
  const cleanCode = syncCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `teacher_${cleanCode}.json`;

  const cached = memoryCache.get(cleanCode);
  if (cached && Date.now() - cached.timestamp < 3000) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'User-Agent': 'SmartTeacherScheduleSync',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Gist fetch error:', res.status);
      return null;
    }

    const json = await res.json();
    const file = json.files?.[fileName];
    if (!file || !file.content) {
      return null;
    }

    const parsed: SyncPayload = JSON.parse(file.content);
    memoryCache.set(cleanCode, { data: parsed, timestamp: Date.now() });
    return parsed;
  } catch (error) {
    console.error('Error reading from Gist:', error);
    return null;
  }
}

async function saveToGist(payload: SyncPayload): Promise<boolean> {
  const cleanCode = payload.syncCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const fileName = `teacher_${cleanCode}.json`;

  memoryCache.set(cleanCode, { data: payload, timestamp: Date.now() });

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'User-Agent': 'SmartTeacherScheduleSync',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          [fileName]: {
            content: JSON.stringify(payload, null, 2)
          }
        }
      })
    });

    return res.ok;
  } catch (error) {
    console.error('Error saving to Gist:', error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Thiếu mã đồng bộ (code parameter is required)' },
      { status: 400 }
    );
  }

  const data = await getFromGist(code);
  if (!data) {
    return NextResponse.json(
      { message: 'Chưa có dữ liệu đồng bộ cho mã này', syncCode: code, schedules: [] },
      { status: 200 }
    );
  }

  return NextResponse.json({
    success: true,
    syncCode: data.syncCode,
    updatedAt: data.updatedAt,
    platform: data.platform,
    deviceName: data.deviceName,
    schedules: data.schedules
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: SyncPayload = await req.json();

    if (!body.syncCode || !Array.isArray(body.schedules)) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ: Cần syncCode và danh sách schedules' },
        { status: 400 }
      );
    }

    const payload: SyncPayload = {
      syncCode: body.syncCode.trim(),
      deviceName: body.deviceName || 'Smart Device',
      platform: body.platform || 'web',
      updatedAt: body.updatedAt || Date.now(),
      schedules: body.schedules
    };

    const saved = await saveToGist(payload);
    if (!saved) {
      return NextResponse.json(
        { error: 'Không thể lưu dữ liệu đồng bộ đám mây' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã đồng bộ thành công ${payload.schedules.length} lịch dạy lên Đám mây!`,
      syncCode: payload.syncCode,
      updatedAt: payload.updatedAt,
      count: payload.schedules.length
    });
  } catch (error) {
    console.error('POST /api/sync error:', error);
    return NextResponse.json(
      { error: 'Lỗi xử lý yêu cầu đồng bộ' },
      { status: 500 }
    );
  }
}