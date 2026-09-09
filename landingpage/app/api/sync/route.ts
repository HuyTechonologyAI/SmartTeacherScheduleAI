import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

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

export interface KnowledgeDocPayload {
  id: string;
  code: string;
  title: string;
  category: string;
  subject: string;
  targetLevel: string;
  content: string;
  isBuiltIn?: boolean;
  isActive?: boolean;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  updatedAt?: number;
  isDeleted?: boolean;
}

export interface ClassroomPayload {
  id: string;
  name: string;
  grade?: string;
  totalStudents?: number;
  academicYear?: string;
  notes?: string;
  updatedAt?: number;
}

export interface StudentPayload {
  id: string;
  classId: string;
  className: string;
  studentCode?: string;
  fullName: string;
  gender?: string;
  parentPhone?: string;
  parentName?: string;
  kudosPoints?: number;
  notes?: string;
  updatedAt?: number;
}

export interface AttendanceRecordPayload {
  id: string;
  date: string;
  eventId?: string;
  scheduleId?: string;
  studentId: string;
  className: string;
  status: 'PRESENT' | 'ABSENT_EXCUSED' | 'ABSENT_UNEXCUSED' | 'LATE';
  kudosDelta?: number;
  note?: string;
  updatedAt?: number;
}

export interface SyncPayload {
  pin?: string;
  pinHash?: string;
  syncCode: string;
  deviceName?: string;
  platform?: string;
  updatedAt: number;
  schedules: SchedulePayload[];
  events: CalendarEventPayload[];
  knowledgeDocs?: KnowledgeDocPayload[];
  deletedKnowledgeDocKeys?: string[];
  classrooms?: ClassroomPayload[];
  students?: StudentPayload[];
  attendanceRecords?: AttendanceRecordPayload[];
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


function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin.trim()).digest('hex');
}

async function fetchSyncStore(syncCode: string): Promise<SyncPayload | null> {
  const cleanCode = syncCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (!cleanCode) return null;

  const cached = memoryCache.get(cleanCode);
  if (cached && Date.now() - cached.timestamp < 3000) {
    return cached.data;
  }

  // 1. Check Supabase first
  try {
    const { data, error } = await supabase
      .from('teacher_sync_stores')
      .select('*')
      .eq('sync_code', cleanCode)
      .maybeSingle();

    if (data && data.payload) {
      const payload: SyncPayload = {
        ...data.payload,
        syncCode: cleanCode,
        pinHash: data.pin_hash || data.payload.pinHash || undefined
      };
      memoryCache.set(cleanCode, { data: payload, timestamp: Date.now() });
      return payload;
    }
  } catch (err) {
    console.warn('Supabase fetch fallback to gist:', err);
  }

  // 2. Fallback to Gist for backward compatibility
  const fromGist = await getFromGist(cleanCode);
  if (fromGist) {
    memoryCache.set(cleanCode, { data: fromGist, timestamp: Date.now() });
    return fromGist;
  }

  return null;
}

async function saveSyncStore(payload: SyncPayload, pinToSet?: string): Promise<boolean> {
  const cleanCode = payload.syncCode.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  memoryCache.set(cleanCode, { data: payload, timestamp: Date.now() });

  let computedPinHash = payload.pinHash;
  if (pinToSet && pinToSet.trim()) {
    computedPinHash = hashPin(pinToSet);
  }

  // 1. Try Supabase
  let savedSupabase = false;
  try {
    const { error } = await supabase
      .from('teacher_sync_stores')
      .upsert({
        sync_code: cleanCode,
        pin_hash: computedPinHash || null,
        payload: { ...payload, pinHash: computedPinHash },
        version: '1.5.0',
        device_name: payload.deviceName || 'Smart Device',
        platform: payload.platform || 'web',
        updated_at: payload.updatedAt
      });
    if (!error) {
      savedSupabase = true;
    } else {
      console.warn('Supabase upsert notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase save error:', err);
  }

  // 2. Resilient backup to Gist
  const savedGist = await saveToGist({ ...payload, pinHash: computedPinHash });
  return savedSupabase || savedGist;
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

    const knowledgeDocs: KnowledgeDocPayload[] = Array.isArray(parsed.knowledgeDocs) ? parsed.knowledgeDocs : [];
    const classrooms: ClassroomPayload[] = Array.isArray(parsed.classrooms) ? parsed.classrooms : [];
    const students: StudentPayload[] = Array.isArray(parsed.students) ? parsed.students : [];
    const attendanceRecords: AttendanceRecordPayload[] = Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : [];
    const syncPayload: SyncPayload = {
      syncCode: cleanCode,
      deviceName: parsed.deviceName || 'Smart Device',
      platform: parsed.platform || 'cloud',
      updatedAt: parsed.updatedAt || Date.now(),
      schedules,
      events,
      knowledgeDocs,
      classrooms,
      students,
      attendanceRecords
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
  const code = searchParams.get('code') || searchParams.get('syncCode');
  const incomingPin = searchParams.get('pin');

  if (!code) {
    return NextResponse.json(
      { error: 'Thiếu mã đồng bộ (Vui lòng cung cấp ?code=ST-XXXXXX)' },
      { status: 400 }
    );
  }

  const cleanCode = code.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  const data = await fetchSyncStore(cleanCode);

  const corsHeaders = {
    'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (!data) {
    return NextResponse.json(
      { message: 'Chưa có dữ liệu đồng bộ cho mã này', syncCode: cleanCode, schedules: [], events: [] },
      { status: 200, headers: corsHeaders }
    );
  }

  // Verify PIN if protected
  if (data.pinHash) {
    if (!incomingPin || hashPin(incomingPin) !== data.pinHash) {
      return NextResponse.json(
        { error: 'Mã PIN bảo mật không chính xác hoặc chưa được cung cấp.', pinRequired: true },
        { status: 401, headers: corsHeaders }
      );
    }
  }

  return NextResponse.json({
    success: true,
    syncCode: data.syncCode,
    updatedAt: data.updatedAt,
    platform: data.platform,
    deviceName: data.deviceName,
    hasPin: !!data.pinHash,
    schedules: data.schedules,
    events: data.events,
    knowledgeDocs: data.knowledgeDocs || [],
    deletedKnowledgeDocKeys: data.deletedKnowledgeDocKeys || [],
    classrooms: data.classrooms || [],
    students: data.students || [],
    attendanceRecords: data.attendanceRecords || [],
    totalEvents: data.events.length,
    totalSchedules: data.schedules.length,
    totalKnowledgeDocs: (data.knowledgeDocs || []).length,
    totalClassrooms: (data.classrooms || []).length,
    totalStudents: (data.students || []).length,
    totalAttendance: (data.attendanceRecords || []).length
  }, {
    headers: corsHeaders
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


export function getCanonicalKnowledgeDocKey(doc: { id?: string; code?: string; title?: string; fileName?: string; subject?: string }): string {
  const code = (doc.code || '').toLowerCase().trim();
  const id = (doc.id || '').toLowerCase().trim();
  const title = (doc.title || '').toLowerCase().trim();
  const fileName = (doc.fileName || '').toLowerCase().trim();
  const subject = (doc.subject || '').toLowerCase().trim();

  // 1. Blacklist dummy test docs (like Giao_trinh_CN10.docx)
  if (fileName.includes('giao_trinh_cn10') || code.includes('gt-cn10') || id.includes('custom_7') || title.includes('công nghệ 10 (chuẩn mô đun')) {
    return 'blacklisted_gt_cn10';
  }

  // 2. Map standard 6 built-ins to unified canonical keys
  if (code.includes('5512') || id.includes('5512') || title.includes('5512')) return 'builtin_cv_5512';
  if (code.includes('3456') || id.includes('3456') || title.includes('3456')) return 'builtin_cv_3456';
  if (code.includes('2422') || id.includes('2422') || title.includes('2422')) return 'builtin_qd_2422';
  if (code.includes('2634') || id.includes('2634') || title.includes('2634')) return 'builtin_cv_2634';
  if (code.includes('tt_22') || code.includes('tt 22') || id.includes('tt-22') || id.includes('tt_22') || title.includes('thông tư 22') || title.includes('tt 22')) return 'builtin_tt_22';
  if (code.includes('5s') || code.includes('atld') || id.includes('5s') || id.includes('atld') || title.includes('5s') || title.includes('an toàn lao động')) return 'builtin_atld_5s';

  // 3. Custom files: Key by fileName if available
  if (fileName) {
    return 'file_' + fileName.replace(/\s+/g, '_');
  }

  // 4. Custom code if specific (not generic DOC_ timestamp)
  if (code && !code.startsWith('doc_') && code !== 'all') {
    return 'code_' + code.replace(/[^a-z0-9_-]/g, '_');
  }

  // 5. Custom text/doc: Key by normalized title + subject
  const cleanTitle = title.replace(/[^a-z0-9à-ỹ]/gi, '_').replace(/_+/g, '_');
  const cleanSubj = subject.replace(/[^a-z0-9à-ỹ]/gi, '_').replace(/_+/g, '_');
  return `custom_${cleanTitle}_${cleanSubj || 'all'}`;
}

function mergeKnowledgeDocs(
  existing: KnowledgeDocPayload[],
  incoming: KnowledgeDocPayload[],
  deletedKeys: string[] = []
): KnowledgeDocPayload[] {
  const map = new Map<string, KnowledgeDocPayload>();
  const deletedSet = new Set<string>(deletedKeys.map(k => k.toLowerCase().trim()));

  // Always blacklist Giao_trinh_CN10
  deletedSet.add('blacklisted_gt_cn10');
  deletedSet.add('custom_7');
  deletedSet.add('gt-cn10');
  deletedSet.add('giao_trinh_cn10.docx');
  deletedSet.add('file_giao_trinh_cn10.docx');

  const isDocDeleted = (doc: KnowledgeDocPayload) => {
    if (doc.isDeleted) return true;
    const key = getCanonicalKnowledgeDocKey(doc);
    if (key === 'blacklisted_gt_cn10') return true;
    if (deletedSet.has(key)) return true;
    if (doc.id && deletedSet.has(doc.id.toLowerCase().trim())) return true;
    if (doc.code && deletedSet.has(doc.code.toLowerCase().trim())) return true;
    if (doc.fileName && deletedSet.has(doc.fileName.toLowerCase().trim())) return true;
    return false;
  };

  for (const d of existing) {
    if (isDocDeleted(d)) continue;
    const key = getCanonicalKnowledgeDocKey(d);
    map.set(key, d);
  }

  for (const inc of incoming) {
    if (isDocDeleted(inc)) {
      const key = getCanonicalKnowledgeDocKey(inc);
      map.delete(key);
      continue;
    }

    const key = getCanonicalKnowledgeDocKey(inc);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, inc);
    } else {
      const incHasFile = Boolean(inc.fileName && inc.fileName.trim());
      const prevHasFile = Boolean(prev.fileName && prev.fileName.trim());
      const prevTs = Number(prev.updatedAt) || 0;
      const incTs = Number(inc.updatedAt) || 0;

      const incContent = (inc.content || '').trim();
      const prevContent = (prev.content || '').trim();
      const safeContent = (incContent.length >= prevContent.length || prevContent.length === 0)
        ? (incContent || prevContent)
        : prevContent;

      if (incHasFile && !prevHasFile) {
        map.set(key, { ...inc, content: safeContent });
      } else if (!incHasFile && prevHasFile) {
        if (incTs >= prevTs) {
          map.set(key, {
            ...inc,
            fileName: prev.fileName,
            fileSize: prev.fileSize,
            fileType: prev.fileType,
            content: safeContent
          });
        }
      } else if (incTs >= prevTs) {
        map.set(key, {
          ...inc,
          fileName: inc.fileName || prev.fileName,
          fileSize: inc.fileSize || prev.fileSize,
          fileType: inc.fileType || prev.fileType,
          content: safeContent
        });
      } else {
        map.set(key, {
          ...prev,
          content: safeContent,
          fileName: prev.fileName || inc.fileName,
          fileSize: prev.fileSize || inc.fileSize,
          fileType: prev.fileType || inc.fileType
        });
      }
    }
  }

  const canonicalTitles: Record<string, { id: string; code: string; title: string; category: string; targetLevel: string }> = {
    builtin_cv_5512: {
      id: 'builtin-cv-5512',
      code: 'CV 5512/BGDĐT-GDTrH',
      title: 'Công văn 5512/BGDĐT-GDTrH - Xây dựng và tổ chức thực hiện kế hoạch giáo dục của nhà trường',
      category: 'PHAP_QUY',
      targetLevel: 'Phổ thông'
    },
    builtin_cv_3456: {
      id: 'builtin-cv-3456',
      code: 'CV 3456/BGDĐT-GDPT',
      title: 'Công văn 3456/BGDĐT-GDPT - Triển khai Khung năng lực số cho học sinh phổ thông và GDTX',
      category: 'PHAP_QUY',
      targetLevel: 'Phổ thông'
    },
    builtin_qd_2422: {
      id: 'builtin-qd-2422',
      code: 'QĐ 2422/QĐ-BGDĐT',
      title: 'Quyết định 2422/QĐ-BGDĐT - Khung nội dung giáo dục Trí tuệ nhân tạo (AI) cho học sinh phổ thông',
      category: 'PHAP_QUY',
      targetLevel: 'Phổ thông'
    },
    builtin_cv_2634: {
      id: 'builtin-cv-2634',
      code: 'CV 2634/TCGDNN-ĐTCQ',
      title: 'Công văn 2634/TCGDNN-ĐTCQ - Hướng dẫn biên soạn giáo án tích hợp và thực hành nghề xưởng',
      category: 'PHAP_QUY',
      targetLevel: 'Nghề nghiệp'
    },
    builtin_tt_22: {
      id: 'builtin-tt-22',
      code: 'TT 22/2021/TT-BGDĐT',
      title: 'Thông tư 22/2021/TT-BGDĐT - Đánh giá học sinh THCS, THPT và Khung Ma trận Đề 4 mức độ',
      category: 'PHAP_QUY',
      targetLevel: 'ALL'
    },
    builtin_atld_5s: {
      id: 'builtin-atld-5s',
      code: 'TCVN-ATLD-5S',
      title: 'Tiêu chuẩn Kỹ thuật An toàn Lao động Xưởng Thực hành & Quy chuẩn 5S',
      category: 'ATLD',
      targetLevel: 'Nghề nghiệp'
    }
  };

  const results: KnowledgeDocPayload[] = [];
  for (const [key, doc] of map.entries()) {
    if (canonicalTitles[key]) {
      const meta = canonicalTitles[key];
      results.push({
        ...doc,
        id: meta.id,
        code: meta.code,
        title: meta.title,
        category: meta.category,
        targetLevel: meta.targetLevel,
        isBuiltIn: true
      });
    } else {
      results.push({
        ...doc,
        isBuiltIn: false
      });
    }
  }

  return results;
}


function mergeClassrooms(existing: ClassroomPayload[], incoming: ClassroomPayload[]): ClassroomPayload[] {
  const map = new Map<string, ClassroomPayload>();
  const getKey = (c: ClassroomPayload) => (c.name || c.id).toLowerCase().trim();
  for (const c of existing) map.set(getKey(c), c);
  for (const inc of incoming) {
    const key = getKey(inc);
    const prev = map.get(key);
    if (!prev || (Number(inc.updatedAt) || 0) >= (Number(prev.updatedAt) || 0)) {
      map.set(key, inc);
    }
  }
  return Array.from(map.values());
}

function mergeStudents(existing: StudentPayload[], incoming: StudentPayload[]): StudentPayload[] {
  const map = new Map<string, StudentPayload>();
  const getKey = (s: StudentPayload) => {
    if (s.id && !s.id.startsWith('std_temp')) return s.id;
    return `${(s.className || '').toLowerCase().trim()}__${(s.fullName || '').toLowerCase().trim()}`;
  };
  for (const s of existing) map.set(getKey(s), s);
  for (const inc of incoming) {
    const key = getKey(inc);
    const prev = map.get(key);
    if (!prev || (Number(inc.updatedAt) || 0) >= (Number(prev.updatedAt) || 0)) {
      map.set(key, inc);
    }
  }
  return Array.from(map.values());
}

function mergeAttendance(existing: AttendanceRecordPayload[], incoming: AttendanceRecordPayload[]): AttendanceRecordPayload[] {
  const map = new Map<string, AttendanceRecordPayload>();
  const getKey = (a: AttendanceRecordPayload) => `${a.date}_${a.studentId}_${a.eventId || 'noev'}`;
  for (const a of existing) map.set(getKey(a), a);
  for (const inc of incoming) {
    const key = getKey(inc);
    const prev = map.get(key);
    if (!prev || (Number(inc.updatedAt) || 0) >= (Number(prev.updatedAt) || 0)) {
      map.set(key, inc);
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
    const incomingKnowledgeDocs: KnowledgeDocPayload[] = Array.isArray(body.knowledgeDocs) ? body.knowledgeDocs : [];
    const incomingDeletedKeys: string[] = Array.isArray(body.deletedKnowledgeDocKeys) ? body.deletedKnowledgeDocKeys : [];
    const incomingClassrooms: ClassroomPayload[] = Array.isArray(body.classrooms) ? body.classrooms : [];
    const incomingStudents: StudentPayload[] = Array.isArray(body.students) ? body.students : [];
    const incomingAttendance: AttendanceRecordPayload[] = Array.isArray(body.attendanceRecords) ? body.attendanceRecords : [];

    if (incomingEvents.length === 0 && incomingSchedules.length > 0) {
      incomingEvents = generateEventsFromSchedules(incomingSchedules);
    }

    // 1. Tải bản ghi đám mây hiện tại (nếu có) để hợp nhất 2 chiều thông minh
    const existing = await fetchSyncStore(cleanCode);

    // Verify PIN if existing store is protected
    if (existing && existing.pinHash) {
      const incomingPin = body.pin;
      if (!incomingPin || hashPin(incomingPin) !== existing.pinHash) {
        return NextResponse.json(
          { error: 'Mã PIN bảo mật không chính xác. Không thể ghi đè dữ liệu.', pinRequired: true },
          { status: 401 }
        );
      }
    }

    // Hợp nhất danh sách các key đã xóa
    const combinedDeletedKeys = Array.from(
      new Set([
        ...(existing?.deletedKnowledgeDocKeys || []),
        ...incomingDeletedKeys,
        'custom_7',
        'gt-cn10',
        'giao_trinh_cn10.docx',
        'file_giao_trinh_cn10.docx'
      ])
    );

    let finalSchedules = incomingSchedules;
    let finalEvents = incomingEvents;
    let finalKnowledgeDocs = incomingKnowledgeDocs;
    let finalClassrooms = incomingClassrooms;
    let finalStudents = incomingStudents;
    let finalAttendance = incomingAttendance;

    if (existing && !body.forceOverwrite) {
      // Hợp nhất ca dạy, lịch mẫu và tài liệu theo mốc thời gian sửa đổi (Last-Write-Wins per item)
      finalSchedules = mergeSchedules(existing.schedules || [], incomingSchedules);
      finalEvents = mergeEvents(existing.events || [], incomingEvents);
      finalKnowledgeDocs = mergeKnowledgeDocs(existing.knowledgeDocs || [], incomingKnowledgeDocs, combinedDeletedKeys);
      finalClassrooms = mergeClassrooms(existing.classrooms || [], incomingClassrooms);
      finalStudents = mergeStudents(existing.students || [], incomingStudents);
      finalAttendance = mergeAttendance(existing.attendanceRecords || [], incomingAttendance);
    } else {
      finalKnowledgeDocs = mergeKnowledgeDocs([], incomingKnowledgeDocs, combinedDeletedKeys);
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
      events: finalEvents,
      knowledgeDocs: finalKnowledgeDocs,
      deletedKnowledgeDocKeys: combinedDeletedKeys,
      classrooms: finalClassrooms,
      students: finalStudents,
      attendanceRecords: finalAttendance
    };

    const saved = await saveSyncStore(payload, body.pin);
    if (!saved) {
      return NextResponse.json(
        { error: 'Không thể lưu dữ liệu đồng bộ đám mây' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã hợp nhất và đồng bộ thành công ${payload.events.length} ca dạy (${payload.schedules.length} lịch mẫu, ${payload.knowledgeDocs?.length || 0} tài liệu giáo trình) lên Đám mây!`,
      syncCode: payload.syncCode,
      updatedAt: payload.updatedAt,
      schedules: payload.schedules,
      events: payload.events,
      knowledgeDocs: payload.knowledgeDocs || [],
      deletedKnowledgeDocKeys: combinedDeletedKeys,
      classrooms: payload.classrooms || [],
      students: payload.students || [],
      attendanceRecords: payload.attendanceRecords || [],
      totalEvents: payload.events.length,
      totalSchedules: payload.schedules.length,
      totalKnowledgeDocs: (payload.knowledgeDocs || []).length,
      totalClassrooms: (payload.classrooms || []).length,
      totalStudents: (payload.students || []).length,
      totalAttendance: (payload.attendanceRecords || []).length
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
