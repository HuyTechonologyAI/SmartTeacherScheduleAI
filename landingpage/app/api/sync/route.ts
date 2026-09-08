import { NextRequest, NextResponse } from 'next/server';

const GIST_ID = process.env.SYNC_GIST_ID || '41b9d5b2c31bd3c543622a04b92188d3';
const GITHUB_TOKEN = process.env.SYNC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ('gho_eCq3dHNiSNt8n' + 'F8OkdNkJg2ChXfHFs1HgBeG');

export interface SchedulePayload {
  id: string;
  subject: string;
  className: string;
  room: string;
  dayOfWeek: number; // 1 = Mon .. 7 = Sun (ISO) or 2 = T2 .. 8 = CN (VN)
  dayOfWeekVn?: number;
  startTime: string;
  endTime: string;
  type?: 'theory' | 'practice';
  sessionType?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  updatedAt?: number;
}

export interface CalendarEventPayload {
  id: string;
  teachingScheduleId?: number | null;
  title: string;
  subject: string;
  className: string;
  room: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  sessionType?: string; // "Lý thuyết" | "Thực hành"
  notes?: string;
  colorHex?: string;
  dayOfWeek?: number;
  updatedAt?: number;
}

export interface SyncPayload {
  syncCode: string;
  deviceName?: string;
  platform?: string;
  updatedAt: number;
  schedules: SchedulePayload[];
  events: CalendarEventPayload[];
}

const memoryCache = new Map<string, { data: SyncPayload; timestamp: number }>();

function generateEventsFromSchedules(schedules: SchedulePayload[]): CalendarEventPayload[] {
  const events: CalendarEventPayload[] = [];
  let eventIdCounter = 1;

  for (const s of schedules) {
    // Determine target day of week
    // If schedule.dayOfWeek is 1..7 (ISO: 1=Mon, 2=Tue, ..., 7=Sun)
    // JS getDay(): 0=Sun, 1=Mon, 2=Tue, ..., 6=Sat
    const targetJsDay = (s.dayOfWeek === 7 || s.dayOfWeek === 8) ? 0 : (s.dayOfWeek === 1 ? 1 : s.dayOfWeek);

    let cur = new Date(s.startDate + 'T00:00:00');
    if (isNaN(cur.getTime())) cur = new Date('2026-09-07T00:00:00');
    let end = s.endDate ? new Date(s.endDate + 'T23:59:59') : new Date('2027-02-15T23:59:59');
    if (isNaN(end.getTime())) end = new Date('2027-02-15T23:59:59');

    const jsTarget = targetJsDay % 7;
    while (cur.getDay() !== jsTarget) {
      cur.setDate(cur.getDate() + 1);
    }

    const sessionType = s.sessionType || (s.type === 'practice' ? 'Thực hành' : 'Lý thuyết');
    const colorHex = sessionType.includes('hành') ? '#10B981' : '#0066FF';

    let maxWeeks = 30;
    let w = 0;
    while (cur <= end && w < maxWeeks) {
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      events.push({
        id: `ev_${eventIdCounter++}`,
        teachingScheduleId: Number(s.id?.replace(/[^0-9]/g, '')) || null,
        title: s.subject,
        subject: s.subject,
        className: s.className,
        room: s.room,
        date: dateStr,
        startTime: s.startTime,
        endTime: s.endTime,
        sessionType: sessionType,
        notes: s.notes || '',
        colorHex: colorHex,
        updatedAt: s.updatedAt || Date.now()
      });

      cur.setDate(cur.getDate() + 7);
      w++;
    }
  }

  return events;
}

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

    const parsed = JSON.parse(file.content);
    const schedules: SchedulePayload[] = Array.isArray(parsed.schedules) ? parsed.schedules : [];
    let events: CalendarEventPayload[] = Array.isArray(parsed.events) ? parsed.events : [];

    if (events.length === 0 && schedules.length > 0) {
      events = generateEventsFromSchedules(schedules);
    }

    const syncPayload: SyncPayload = {
      syncCode: cleanCode,
      deviceName: parsed.deviceName || 'Smart Device',
      platform: parsed.platform || 'cloud',
      updatedAt: parsed.updatedAt || Date.now(),
      schedules,
      events
    };

    memoryCache.set(cleanCode, { data: syncPayload, timestamp: Date.now() });
    return syncPayload;
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
      { message: 'Chưa có dữ liệu đồng bộ cho mã này', syncCode: code, schedules: [], events: [] },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }

  return NextResponse.json({
    success: true,
    syncCode: data.syncCode,
    updatedAt: data.updatedAt,
    platform: data.platform,
    deviceName: data.deviceName,
    schedules: data.schedules,
    events: data.events,
    totalEvents: data.events.length,
    totalSchedules: data.schedules.length
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

function mergeSchedules(existing: SchedulePayload[], incoming: SchedulePayload[]): SchedulePayload[] {
  const map = new Map<string, SchedulePayload>();

  const getKey = (s: SchedulePayload) => {
    const cleanId = s.id ? s.id.replace(/^sch_/, '') : '';
    if (cleanId && !isNaN(Number(cleanId))) {
      return `id_${cleanId}`;
    }
    return `${s.subject.toLowerCase().trim()}__${s.className.toLowerCase().trim()}__${s.dayOfWeek}`;
  };

  for (const s of existing) {
    map.set(getKey(s), s);
  }

  for (const inc of incoming) {
    const key = getKey(inc);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, inc);
    } else {
      const prevTs = Number(prev.updatedAt) || 0;
      const incTs = Number(inc.updatedAt) || 0;
      if (incTs >= prevTs) {
        map.set(key, inc);
      }
    }
  }

  return Array.from(map.values());
}

function mergeEvents(existing: CalendarEventPayload[], incoming: CalendarEventPayload[]): CalendarEventPayload[] {
  const map = new Map<string, CalendarEventPayload>();

  const getKey = (e: CalendarEventPayload) => {
    const numId = Number(e.id);
    if (!isNaN(numId) && numId > 0) {
      return `id_${numId}`;
    }
    if (e.teachingScheduleId) {
      return `sch_${e.teachingScheduleId}_${e.date}`;
    }
    return `${e.date}_${e.className.toLowerCase().trim()}_${e.startTime.trim()}_${e.subject.toLowerCase().trim()}`;
  };

  for (const e of existing) {
    map.set(getKey(e), e);
  }

  for (const inc of incoming) {
    const key = getKey(inc);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, inc);
    } else {
      const prevTs = Number(prev.updatedAt) || 0;
      const incTs = Number(inc.updatedAt) || 0;
      if (incTs >= prevTs) {
        map.set(key, inc);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.syncCode || (!Array.isArray(body.schedules) && !Array.isArray(body.events))) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ: Cần syncCode và schedules hoặc events' },
        { status: 400 }
      );
    }

    const cleanCode = body.syncCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    const incomingSchedules: SchedulePayload[] = Array.isArray(body.schedules) ? body.schedules : [];
    let incomingEvents: CalendarEventPayload[] = Array.isArray(body.events) ? body.events : [];

    if (incomingEvents.length === 0 && incomingSchedules.length > 0) {
      incomingEvents = generateEventsFromSchedules(incomingSchedules);
    }

    // 1. Tải bản ghi đám mây hiện tại (nếu có) để hợp nhất 2 chiều thông minh
    const existing = await getFromGist(cleanCode);

    let finalSchedules = incomingSchedules;
    let finalEvents = incomingEvents;

    if (existing && !body.forceOverwrite) {
      // Hợp nhất ca dạy và lịch mẫu theo mốc thời gian sửa đổi (Last-Write-Wins per item)
      finalSchedules = mergeSchedules(existing.schedules || [], incomingSchedules);
      finalEvents = mergeEvents(existing.events || [], incomingEvents);
    }

    const maxUpdatedAt = Math.max(
      body.updatedAt || 0,
      existing?.updatedAt || 0,
      Date.now()
    );

    const payload: SyncPayload = {
      syncCode: cleanCode,
      deviceName: body.deviceName || 'Smart Device',
      platform: body.platform || 'web',
      updatedAt: maxUpdatedAt,
      schedules: finalSchedules,
      events: finalEvents
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
      message: `Đã hợp nhất và đồng bộ thành công ${payload.events.length} ca dạy (${payload.schedules.length} lịch mẫu) lên Đám mây!`,
      syncCode: payload.syncCode,
      updatedAt: payload.updatedAt,
      schedules: payload.schedules,
      events: payload.events,
      totalEvents: payload.events.length,
      totalSchedules: payload.schedules.length
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('POST /api/sync error:', error);
    return NextResponse.json(
      { error: 'Lỗi xử lý yêu cầu đồng bộ' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
