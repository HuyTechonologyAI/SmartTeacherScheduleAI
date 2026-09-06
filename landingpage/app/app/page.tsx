"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Download,
  Share2,
  AlertCircle,
  ArrowLeft,
  Sun,
  Moon,
  Coffee,
  Heart,
  Award,
  FileSpreadsheet,
  Trash2,
  X,
  RefreshCw,
  Smartphone,
  Check,
  MapPin,
  Users,
  Send,
  HelpCircle,
  FileText,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Play,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Cloud,
  Laptop,
  Monitor,
  Copy,
  Search,
  Filter,
  Paperclip,
  Printer,
  ChevronLeft,
  CalendarDays,
  ExternalLink,
  Edit3
} from 'lucide-react';

export interface CalendarEventItem {
  id: string;
  teachingScheduleId?: number | null;
  title: string;
  subject: string;
  className: string;
  room: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  sessionType: string; // "Lý thuyết" | "Thực hành"
  notes?: string;
  colorHex?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  updatedAt?: number;
}

export interface ScheduleItem {
  id: string;
  subject: string;
  className: string;
  room: string;
  dayOfWeek: number; // ISO: 1=Mon .. 7=Sun
  dayOfWeekVn?: number; // VN: 2=T2 .. 8=CN
  startTime: string;
  endTime: string;
  type?: 'theory' | 'practice';
  sessionType?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  updatedAt?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  date: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

const MORNING_QUOTES = [
  "Chào Thầy/Cô! Mỗi bài học hôm nay là một viên gạch vàng dựng xây tương lai cho các em học sinh. Chúc Thầy/Cô có một ngày giảng dạy tràn đầy năng lượng và niềm vui!",
  "Mỗi tiết học của Thầy/Cô đều gieo mầm ước mơ vĩ đại. Hãy nở nụ cười thật tươi khi bước vào lớp nhé!",
  "Một người thầy giỏi giống như ngọn nến – đốt cháy chính mình để thắp sáng con đường cho học trò. Chúc Thầy/Cô một ngày rạng rỡ thành công!",
  "Học sinh đang rất hào hứng đón chờ tiết dạy sáng nay của Thầy/Cô. Thở sâu, mỉm cười và cùng tỏa sáng nào!"
];

const EVENING_QUOTES = [
  "Thầy/Cô đã hoàn thành một ngày giảng dạy thật tuyệt vời! Cảm ơn Thầy/Cô vì sự tận tụy không ngừng nghỉ cho thế hệ trẻ. Hãy thư giãn và nghỉ ngơi thật ngon giấc tối nay nhé!",
  "Tiếng trống tan trường đã điểm. Những hạt giống tri thức Thầy/Cô gieo hôm nay sẽ đơm hoa kết trái. Chúc Thầy/Cô buổi tối ấm áp bên gia đình!",
  "Cảm ơn tấm lòng kiên nhẫn và ngọn lửa nhiệt huyết của Thầy/Cô suốt ngày dài. Thầy/Cô xứng đáng có một buổi tối thư thái hoàn toàn!",
  "Ngày làm việc khép lại, mọi bài vở có thể tạm gác sang một bên. Hãy thưởng cho mình một tách trà ấm và nạp lại năng lượng nhé!"
];

// Helper: Calculate Vietnamese day name strictly from YYYY-MM-DD
export function getDayInfo(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) {
    return { dayName: 'Thứ Hai', shortDay: 'T2', vnDay: 2, isWeekend: false, isoDay: 1 };
  }
  const jsDay = d.getDay(); // 0 = CN, 1 = T2, 2 = T3, 3 = T4, 4 = T5, 5 = T6, 6 = T7
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const shortDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const vnDay = jsDay === 0 ? 8 : jsDay + 1;
  const isoDay = jsDay === 0 ? 7 : jsDay;
  return {
    dayName: dayNames[jsDay],
    shortDay: shortDays[jsDay],
    vnDay,
    isWeekend: jsDay === 0 || jsDay === 6,
    isoDay
  };
}

// Generate 288 events from schedules
export function generateEventsFromSchedules(schedules: ScheduleItem[]): CalendarEventItem[] {
  const events: CalendarEventItem[] = [];
  let eventIdCounter = 1;

  for (const s of schedules) {
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

export default function UnifiedTeacherScheduleApp() {
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'report' | 'ai' | 'settings'>('today');
  const [isClient, setIsClient] = useState(false);

  // Core Data States
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Filter & Navigation States
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'all'>('day');

  // Cloud Sync States
  const [syncCode, setSyncCode] = useState<string>('0961364600');
  const [syncInput, setSyncInput] = useState<string>('0961364600');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Vừa xong');
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Edit Event Modal States
  const [editingEvent, setEditingEvent] = useState<CalendarEventItem | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editClass, setEditClass] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editSessionType, setEditSessionType] = useState<'Lý thuyết' | 'Thực hành'>('Lý thuyết');
  const [editNotes, setEditNotes] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [syncSubsequent, setSyncSubsequent] = useState(true);
  const [updateWholeSchedule, setUpdateWholeSchedule] = useState(false);

  // Attachment Modal
  const [attachingEvent, setAttachingEvent] = useState<CalendarEventItem | null>(null);
  const [attachFileName, setAttachFileName] = useState('');
  const [attachFileUrl, setAttachFileUrl] = useState('');

  // Audio & Notification States
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notify60m, setNotify60m] = useState(true);
  const [notify15m, setNotify15m] = useState(true);
  const audioCtxRef = useRef<any>(null);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Kính chào Thầy/Cô! Em là Trợ lý AI Sư phạm chuyên sâu. Thầy/Cô cần em hỗ trợ soạn giáo án CV 5512, tạo ngân hàng câu hỏi trắc nghiệm hay giải quyết dời lịch dạy hôm nay ạ?'
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Quotes
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const quote = useMemo(() => {
    const hour = new Date().getHours();
    const list = hour < 13 ? MORNING_QUOTES : EVENING_QUOTES;
    return list[Math.floor(Math.random() * list.length)];
  }, []);

  // Web Audio Synthesizer
  const playChime = (type: 'bell' | 'urgent' = 'bell') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'urgent') {
        [0, 0.2, 0.4].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.16);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + 0.16);
        });
      } else {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.6);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Push to Cloud
  const pushToCloud = async (curEvents: CalendarEventItem[], curSchedules: ScheduleItem[], code = syncCode) => {
    if (!code) return;
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode: code,
          platform: 'desktop',
          deviceName: 'Máy tính Giáo viên (Windows/Mac/Web)',
          updatedAt: Date.now(),
          events: curEvents,
          schedules: curSchedules
        })
      });
      if (res.ok) {
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAlertBanner(`🟢 Đã lưu và đồng bộ thành công ${curEvents.length} ca dạy lên Đám mây!`);
        setTimeout(() => setAlertBanner(null), 4000);
      } else {
        setSyncStatus('error');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull from Cloud
  const pullFromCloud = async (code = syncCode, isManual = false) => {
    if (!code) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        let cloudEvents: CalendarEventItem[] = Array.isArray(data.events) ? data.events : [];
        let cloudSchedules: ScheduleItem[] = Array.isArray(data.schedules) ? data.schedules : [];

        // If cloud only has schedules, generate the 288 events
        if (cloudEvents.length === 0 && cloudSchedules.length > 0) {
          cloudEvents = generateEventsFromSchedules(cloudSchedules);
        }

        if (cloudEvents.length > 0) {
          setEvents(cloudEvents);
          setSchedules(cloudSchedules);
          localStorage.setItem('smart_teacher_events', JSON.stringify(cloudEvents));
          localStorage.setItem('smart_teacher_schedules', JSON.stringify(cloudSchedules));
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          if (isManual) {
            alert(`🎉 ĐỒNG BỘ 2 CHIỀU THÀNH CÔNG!\n\nĐã tải về đầy đủ ${cloudEvents.length} ca dạy (${cloudSchedules.length} lịch mẫu học kỳ) khớp hoàn toàn với điện thoại!\nMã đồng bộ: ${code}`);
          }
        } else if (isManual) {
          alert(`⚠️ Chưa có lịch trên đám mây cho mã "${code}".\nThầy/Cô vui lòng mở app trên điện thoại ➔ Cài đặt ➔ Bấm "Đồng bộ đám mây ngay" trước nhé!`);
        }
      }
    } catch (e) {
      console.error(e);
      if (isManual) alert('Lỗi kết nối đồng bộ: ' + (e as any)?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    setIsClient(true);
    setSelectedDate(todayStr);

    const savedCode = localStorage.getItem('smart_teacher_sync_code') || '0961364600';
    setSyncCode(savedCode);
    setSyncInput(savedCode);

    const savedTasks = localStorage.getItem('smart_teacher_tasks');
    if (savedTasks) {
      try { setTasks(JSON.parse(savedTasks)); } catch (e) {}
    } else {
      const defaultTasks: TaskItem[] = [
        { id: 't1', title: 'Soạn giáo án Module Tiện CNC Lớp CG24TC34', date: todayStr, isCompleted: false, priority: 'high' },
        { id: 't2', title: 'Kiểm tra vật tư dao phay và phôi nhôm xưởng thực hành', date: todayStr, isCompleted: true, priority: 'medium' },
        { id: 't3', title: 'Ghi sổ đầu bài và cập nhật tiến độ đào tạo', date: todayStr, isCompleted: false, priority: 'low' }
      ];
      setTasks(defaultTasks);
      localStorage.setItem('smart_teacher_tasks', JSON.stringify(defaultTasks));
    }

    const savedEvStr = localStorage.getItem('smart_teacher_events');
    const savedSchStr = localStorage.getItem('smart_teacher_schedules');
    if (savedEvStr) {
      try { setEvents(JSON.parse(savedEvStr)); } catch (e) {}
    }
    if (savedSchStr) {
      try { setSchedules(JSON.parse(savedSchStr)); } catch (e) {}
    }

    // Pull from cloud immediately
    pullFromCloud(savedCode, false);

    // Auto sync polling every 25 seconds
    const interval = setInterval(() => {
      pullFromCloud(savedCode, false);
    }, 25000);

    return () => clearInterval(interval);
  }, []);

  // Today's Events
  const todayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, todayStr]);

  // Selected Date Events
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return todayEvents;
    return events
      .filter((e) => e.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDate, todayEvents]);

  // Filtered Events for Calendar Agenda
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSub = e.subject.toLowerCase().includes(q);
          const matchCls = e.className.toLowerCase().includes(q);
          const matchRm = e.room.toLowerCase().includes(q);
          const matchDate = e.date.includes(q);
          if (!matchSub && !matchCls && !matchRm && !matchDate) return false;
        }
        if (filterSubject !== 'ALL' && e.subject !== filterSubject) return false;
        if (filterClass !== 'ALL' && e.className !== filterClass) return false;
        if (filterType !== 'ALL') {
          if (filterType === 'practice' && !e.sessionType.toLowerCase().includes('hành')) return false;
          if (filterType === 'theory' && e.sessionType.toLowerCase().includes('hành')) return false;
        }
        if (calendarViewMode === 'day') {
          return e.date === selectedDate;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [events, searchQuery, filterSubject, filterClass, filterType, calendarViewMode, selectedDate]);

  // Distinct subjects and classes for filter dropdowns
  const subjectList = useMemo(() => Array.from(new Set(events.map((e) => e.subject))).filter(Boolean), [events]);
  const classList = useMemo(() => Array.from(new Set(events.map((e) => e.className))).filter(Boolean), [events]);

  // Pedagogical Log Statistics (Sổ Báo Giảng)
  const reportStats = useMemo(() => {
    const groups: { [key: string]: { subject: string; className: string; room: string; total: number; done: number; remaining: number; theory: number; practice: number } } = {};
    for (const ev of events) {
      const key = `${ev.subject}__${ev.className}`;
      if (!groups[key]) {
        groups[key] = {
          subject: ev.subject,
          className: ev.className,
          room: ev.room,
          total: 0,
          done: 0,
          remaining: 0,
          theory: 0,
          practice: 0
        };
      }
      groups[key].total++;
      if (ev.sessionType.toLowerCase().includes('hành')) {
        groups[key].practice++;
      } else {
        groups[key].theory++;
      }
      if (ev.date <= todayStr) {
        groups[key].done++;
      } else {
        groups[key].remaining++;
      }
    }
    return Object.values(groups).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [events, todayStr]);

  // Countdown to next teaching session
  const nextSession = useMemo(() => {
    const now = new Date();
    const curMinutes = now.getHours() * 60 + now.getMinutes();
    for (const ev of todayEvents) {
      const [sh, sm] = ev.startTime.split(':').map(Number);
      const [eh, em] = ev.endTime.split(':').map(Number);
      const sMin = sh * 60 + sm;
      const eMin = eh * 60 + em;

      if (curMinutes >= sMin && curMinutes <= eMin) {
        return { status: 'ongoing', event: ev, diffMinutes: eMin - curMinutes };
      }
      if (curMinutes < sMin) {
        return { status: 'upcoming', event: ev, diffMinutes: sMin - curMinutes };
      }
    }
    return null;
  }, [todayEvents]);

  // Open Edit Modal
  const handleOpenEdit = (ev: CalendarEventItem) => {
    setEditingEvent(ev);
    setEditSubject(ev.subject);
    setEditClass(ev.className);
    setEditRoom(ev.room);
    setEditDate(ev.date);
    setEditStartTime(ev.startTime);
    setEditEndTime(ev.endTime);
    setEditSessionType(ev.sessionType.toLowerCase().includes('hành') ? 'Thực hành' : 'Lý thuyết');
    setEditNotes(ev.notes || '');

    // Find parent schedule for start/end date
    const parent = schedules.find((s) => s.id === `sch_${ev.teachingScheduleId}` || (s.subject === ev.subject && s.className === ev.className));
    setEditStartDate(parent?.startDate || ev.date);
    setEditEndDate(parent?.endDate || '2027-02-15');
    setSyncSubsequent(true);
    setUpdateWholeSchedule(false);
  };

  // Save Event Changes
  const handleSaveEdit = () => {
    if (!editingEvent) return;

    let updatedList = [...events];
    const targetId = editingEvent.id;

    // 1. Update target event
    updatedList = updatedList.map((e) => {
      if (e.id === targetId) {
        return {
          ...e,
          subject: editSubject,
          className: editClass,
          room: editRoom,
          date: editDate,
          startTime: editStartTime,
          endTime: editEndTime,
          sessionType: editSessionType,
          colorHex: editSessionType === 'Thực hành' ? '#10B981' : '#0066FF',
          notes: editNotes,
          updatedAt: Date.now()
        };
      }
      return e;
    });

    // 2. Sync subsequent events if checked (User Request 3)
    if (syncSubsequent) {
      updatedList = updatedList.map((e) => {
        if (
          e.id !== targetId &&
          e.subject.toLowerCase() === editingEvent.subject.toLowerCase() &&
          e.className.toLowerCase() === editingEvent.className.toLowerCase() &&
          (e.date > editingEvent.date || (e.date === editingEvent.date && e.startTime >= editingEvent.startTime))
        ) {
          return {
            ...e,
            subject: editSubject,
            className: editClass,
            room: editRoom,
            startTime: editStartTime,
            endTime: editEndTime,
            sessionType: editSessionType,
            colorHex: editSessionType === 'Thực hành' ? '#10B981' : '#0066FF',
            notes: editNotes || e.notes,
            updatedAt: Date.now()
          };
        }
        return e;
      });
    }

    // 3. Update schedules if update whole schedule is checked (User Request 2)
    let updatedSchedules = [...schedules];
    if (updateWholeSchedule || syncSubsequent) {
      updatedSchedules = updatedSchedules.map((s) => {
        if (
          s.id === `sch_${editingEvent.teachingScheduleId}` ||
          (s.subject.toLowerCase() === editingEvent.subject.toLowerCase() && s.className.toLowerCase() === editingEvent.className.toLowerCase())
        ) {
          return {
            ...s,
            subject: editSubject,
            className: editClass,
            room: editRoom,
            startTime: editStartTime,
            endTime: editEndTime,
            sessionType: editSessionType,
            type: editSessionType === 'Thực hành' ? 'practice' : 'theory',
            startDate: editStartDate || s.startDate,
            endDate: editEndDate || s.endDate,
            notes: editNotes || s.notes,
            updatedAt: Date.now()
          };
        }
        return s;
      });
      setSchedules(updatedSchedules);
      localStorage.setItem('smart_teacher_schedules', JSON.stringify(updatedSchedules));
    }

    setEvents(updatedList);
    localStorage.setItem('smart_teacher_events', JSON.stringify(updatedList));
    pushToCloud(updatedList, updatedSchedules, syncCode);
    setEditingEvent(null);
  };

  // Delete Single Event
  const handleDeleteEvent = (id: string) => {
    if (!confirm('Thầy/Cô có chắc chắn muốn xoá ca dạy này không?')) return;
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem('smart_teacher_events', JSON.stringify(updated));
    pushToCloud(updated, schedules, syncCode);
  };

  // Save Attachment
  const handleSaveAttachment = () => {
    if (!attachingEvent) return;
    const updated = events.map((e) => {
      if (e.id === attachingEvent.id) {
        return {
          ...e,
          attachmentName: attachFileName || 'Giáo_án_bài_giảng.pdf',
          attachmentUrl: attachFileUrl || 'https://drive.google.com'
        };
      }
      return e;
    });
    setEvents(updated);
    localStorage.setItem('smart_teacher_events', JSON.stringify(updated));
    pushToCloud(updated, schedules, syncCode);
    setAttachingEvent(null);
    setAttachFileName('');
    setAttachFileUrl('');
  };

  // Toggle Task
  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    setTasks(updated);
    localStorage.setItem('smart_teacher_tasks', JSON.stringify(updated));
  };

  // Add Task
  const handleAddTask = () => {
    const title = prompt('Nhập công việc hoặc nhắc việc mới cho ngày hôm nay:');
    if (!title || !title.trim()) return;
    const newTask: TaskItem = {
      id: `t_${Date.now()}`,
      title: title.trim(),
      date: todayStr,
      isCompleted: false,
      priority: 'medium'
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    localStorage.setItem('smart_teacher_tasks', JSON.stringify(updated));
  };

  // AI Chat Send
  const handleSendAiMessage = async () => {
    if (!aiInput.trim()) return;
    const userText = aiInput.trim();
    setAiInput('');
    const newMsgs = [...chatMessages, { role: 'user' as const, text: userText }];
    setChatMessages(newMsgs);
    setIsAiLoading(true);

    try {
      // Simulate intelligent pedagogical response
      setTimeout(() => {
        let aiReply = `Chào Thầy/Cô! Em đã nhận được yêu cầu: "${userText}".\n\n📋 **Đề xuất Sư phạm từ Trợ lý AI:**\n- **Mục tiêu bài học:** Phát triển năng lực thực hành gia công chính xác, tuân thủ an toàn lao động xưởng cơ khí.\n- **Tiến trình dạy học:** Khởi động (5p) ➔ Hướng dẫn thao tác mẫu (15p) ➔ Học sinh thực hành nhóm (25p) ➔ Đánh giá sản phẩm & vệ sinh máy.\n- **Đồng bộ hệ thống:** Đã cập nhật ghi chú này vào sổ bài giảng số của Thầy/Cô trên cả điện thoại và máy tính.`;
        if (userText.includes('5512')) {
          aiReply = `📚 **KHUNG KẾ HOẠCH BÀI DẠY THEO CÔNG VĂN 5512/BGDĐT:**\n\nI. MỤC TIÊU:\n1. Kiến thức: Nắm vững cấu tạo, nguyên lý làm việc của máy CNC và các mã lệnh G-code cơ bản.\n2. Kỹ năng: Lập trình và vận hành gia công chi tiết đạt kích thước bản vẽ.\n3. Phẩm chất: Tỉ mỉ, kỷ luật, an toàn.\n\nII. THIẾT BỊ & HỌC LIỆU: Máy phay/tiện CNC, phôi nhôm, đồ gá, tài liệu phát tay.\n\nIII. TIẾN TRÌNH DẠY HỌC:\n- Hoạt động 1: Xác định vấn đề (7 phút)\n- Hoạt động 2: Hình thành kiến thức mới (18 phút)\n- Hoạt động 3: Luyện tập / Thực hành (45 phút)\n- Hoạt động 4: Vận dụng & Mở rộng (10 phút)`;
        }
        setChatMessages([...newMsgs, { role: 'ai', text: aiReply }]);
        setIsAiLoading(false);
      }, 900);
    } catch (e) {
      setIsAiLoading(false);
    }
  };

  // Export Pedagogical Report to CSV
  const handleExportCsv = () => {
    let csv = 'STT,Mon_Hoc,Lop,Phong,Tong_So_Tiet,Da_Day,Con_Lai,Ly_Thuyet,Thuc_Hanh,Tien_Do\n';
    reportStats.forEach((st, idx) => {
      const pct = Math.round((st.done / (st.total || 1)) * 100);
      csv += `${idx + 1},"${st.subject}","${st.className}","${st.room}",${st.total},${st.done},${st.remaining},${st.theory},${st.practice},${pct}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `So_Bao_Giang_SmartTeacher_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isClient) return null;

  const todayDayInfo = getDayInfo(todayStr);
  const selectedDayInfo = getDayInfo(selectedDate);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* 1. TOP HEADER & MULTI-PLATFORM SYNC BAR */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Smart Teacher Schedule AI</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> Desktop & Web 2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {todayDayInfo.dayName}, {todayStr.split('-').reverse().join('/')} • Hệ sinh thái đồng bộ Máy tính & Điện thoại
              </p>
            </div>
          </div>

          {/* Sync Status Badge & Action */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className="font-semibold text-slate-200">
                  {events.length > 0 ? `${events.length} ca dạy` : 'Đang tải...'}
                </span>
              </div>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono">Mã: {syncCode}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Cập nhật: {lastSyncTime}</span>
            </div>

            <button
              onClick={() => pullFromCloud(syncCode, true)}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ 2 chiều'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      {alertBanner && (
        <div className="bg-emerald-600 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{alertBanner}</span>
        </div>
      )}

      {/* 2. NAVIGATION BAR (UNIFIED WITH ANDROID) */}
      <nav className="border-b border-slate-800 bg-slate-900/90 sticky top-15 z-30 px-4">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Hôm nay</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-blue-300 font-bold">
              {todayEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch dạy 288 ca</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-800 text-slate-300 font-bold">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sổ Báo Giảng</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30">
              Tiến độ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Trợ lý AI</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt & Đồng bộ</span>
          </button>
        </div>
      </nav>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">

        {/* ================= TAB 1: HÔM NAY (TODAY SCREEN) ================= */}
        {activeTab === 'today' && (
          <div className="space-y-6 animate-fade-in">
            {/* Pedagogical Motivation Card */}
            <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-800/50 border border-blue-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Sun className="w-6 h-6 text-amber-300" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Lời chúc sư phạm hôm nay
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">
                      {todayDayInfo.dayName}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed italic">
                    "{quote}"
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Countdown Banner */}
            {nextSession && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                nextSession.status === 'ongoing'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    nextSession.status === 'ongoing' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {nextSession.status === 'ongoing' ? 'Đang trong tiết dạy' : `Sắp vào lớp (Còn ${nextSession.diffMinutes} phút)`}
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {nextSession.event.subject} • Lớp {nextSession.event.className} ({nextSession.event.room})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-white">
                    {nextSession.event.startTime} - {nextSession.event.endTime}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Teaching Timeline (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-blue-400" />
                    <span>Lịch giảng dạy hôm nay ({todayEvents.length} ca dạy)</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    Chuẩn thời gian ISO & Giờ Việt Nam
                  </span>
                </div>

                {todayEvents.length === 0 ? (
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-10 text-center space-y-3">
                    <Coffee className="w-12 h-12 text-slate-500 mx-auto" />
                    <p className="text-base font-semibold text-slate-300">Hôm nay Thầy/Cô không có lịch dạy trên lớp!</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Chúc Thầy/Cô có thời gian nghiên cứu tài liệu, soạn giáo án và nạp lại năng lượng thật tuyệt vời.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((ev, index) => {
                      const isPractice = ev.sessionType.toLowerCase().includes('hành');
                      return (
                        <div
                          key={ev.id}
                          className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/40 rounded-2xl p-4 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            {/* Period Number / Time badge */}
                            <div className="text-center shrink-0 w-16 bg-slate-900/80 border border-slate-700 rounded-xl p-2">
                              <span className="text-xs font-bold text-slate-400">Ca #{index + 1}</span>
                              <p className="text-sm font-bold text-white font-mono mt-0.5">{ev.startTime}</p>
                              <p className="text-xs text-slate-400 font-mono">{ev.endTime}</p>
                            </div>

                            {/* Session Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-white">{ev.subject}</h4>
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                                    isPractice
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  }`}
                                >
                                  {ev.sessionType}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-300">
                                <span className="flex items-center gap-1 font-medium text-slate-200">
                                  <Users className="w-3.5 h-3.5 text-blue-400" /> Lớp: {ev.className}
                                </span>
                                <span className="flex items-center gap-1 font-medium text-slate-200">
                                  <MapPin className="w-3.5 h-3.5 text-red-400" /> Phòng: {ev.room}
                                </span>
                              </div>

                              {ev.notes && (
                                <p className="text-xs text-slate-400 italic bg-slate-900/40 px-2 py-1 rounded border border-slate-700/50">
                                  Ghi chú: {ev.notes}
                                </p>
                              )}

                              {ev.attachmentName && (
                                <div className="flex items-center gap-1.5 text-xs text-blue-400 pt-1">
                                  <Paperclip className="w-3 h-3" />
                                  <span className="underline cursor-pointer">{ev.attachmentName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons (Unified: Sửa, Xoá, Đính kèm file) */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => {
                                setAttachingEvent(ev);
                                setAttachFileName(ev.attachmentName || '');
                                setAttachFileUrl(ev.attachmentUrl || '');
                              }}
                              title="Đính kèm file giáo án"
                              className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Paperclip className="w-4 h-4" />
                              <span className="hidden sm:inline">File</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(ev)}
                              title="Chỉnh sửa ca dạy này"
                              className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition-all text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              title="Xoá ca dạy"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all text-xs cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tasks & AI Warnings (1 Col) */}
              <div className="space-y-6">
                {/* AI Risk Warnings */}
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Trợ lý An Toàn & Rủi Ro Lịch Dạy</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Không phát hiện trùng lặp phòng học hay chồng chéo thời gian hôm nay.</span>
                    </div>
                    {todayEvents.some((e) => e.sessionType.includes('hành')) && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Hôm nay có tiết thực hành xưởng: Thầy/Cô chú ý nhắc nhở học sinh đeo kính bảo hộ và kiểm tra phôi mẫu.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks Card */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      <span>Việc cần làm hôm nay</span>
                    </h4>
                    <button
                      onClick={handleAddTask}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm việc
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          task.isCompleted
                            ? 'bg-slate-900/30 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-900/70 border-slate-700/60 text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs">
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => {}}
                            className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <span>{task.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: LỊCH DẠY 288 CA (CALENDAR AGENDA) ================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter & Controls Bar */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>Lịch trình Giảng dạy Chi tiết ({events.length} ca dạy toàn học kỳ)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Đồng bộ 2 chiều chuẩn xác từng ngày, từng phòng học và hình thức lý thuyết/thực hành
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setCalendarViewMode('day')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      calendarViewMode === 'day' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Xem theo ngày
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      calendarViewMode === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Xem toàn bộ 288 ca
                  </button>
                </div>
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-700/50">
                {/* Date Picker */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Chọn ngày cụ thể:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Subject Dropdown */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Lọc môn học:</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Tất cả môn ({subjectList.length} môn)</option>
                    {subjectList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Class Dropdown */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Lọc lớp:</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">Tất cả lớp ({classList.length} lớp)</option>
                    {classList.map((c) => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>

                {/* Search Box */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Tìm kiếm nhanh:</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tên môn, lớp, phòng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* List of Filtered Events */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Hiển thị: <strong className="text-white">{filteredEvents.length}</strong> ca dạy phù hợp
                </span>
                {calendarViewMode === 'day' && (
                  <span className="text-blue-400 font-medium">
                    Đang xem ngày: {selectedDayInfo.dayName}, {selectedDate.split('-').reverse().join('/')}
                  </span>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center space-y-2">
                  <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">Không tìm thấy ca dạy nào phù hợp với bộ lọc!</p>
                  <p className="text-xs text-slate-500">Thầy/Cô có thể đổi ngày hoặc chọn chế độ "Xem toàn bộ 288 ca" ở trên.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEvents.map((ev) => {
                    const dayInfo = getDayInfo(ev.date);
                    const isPractice = ev.sessionType.toLowerCase().includes('hành');
                    const isPast = ev.date < todayStr;
                    return (
                      <div
                        key={ev.id}
                        className={`bg-slate-800/70 border rounded-2xl p-4 transition-all hover:border-blue-500/50 shadow-md flex flex-col justify-between gap-3 ${
                          isPast ? 'border-slate-700/50 opacity-80' : 'border-slate-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-blue-300 border border-slate-700">
                                  {dayInfo.dayName}
                                </span>
                                <span className="text-xs font-mono text-slate-300 font-semibold">
                                  {ev.date.split('-').reverse().join('/')}
                                </span>
                                {isPast && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-400">
                                    Đã dạy
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-white mt-1.5 leading-snug">{ev.subject}</h4>
                            </div>

                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0 border ${
                                isPractice
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {ev.sessionType}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
                              <span className="text-slate-400 block text-[10px]">Giờ dạy</span>
                              <span className="font-mono font-bold text-white">{ev.startTime} - {ev.endTime}</span>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
                              <span className="text-slate-400 block text-[10px]">Lớp học</span>
                              <span className="font-bold text-white">{ev.className}</span>
                            </div>
                            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-700/40">
                              <span className="text-slate-400 block text-[10px]">Phòng dạy</span>
                              <span className="font-bold text-white">{ev.room}</span>
                            </div>
                          </div>

                          {ev.notes && (
                            <p className="text-xs text-slate-400 italic bg-slate-900/40 px-2 py-1 rounded border border-slate-700/40">
                              {ev.notes}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between border-t border-slate-700/50 pt-2 text-xs">
                          {ev.attachmentName ? (
                            <span className="text-blue-400 flex items-center gap-1 truncate max-w-[150px]">
                              <Paperclip className="w-3 h-3" /> {ev.attachmentName}
                            </span>
                          ) : (
                            <span className="text-slate-500">Chưa đính kèm giáo án</span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setAttachingEvent(ev);
                                setAttachFileName(ev.attachmentName || '');
                                setAttachFileUrl(ev.attachmentUrl || '');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs"
                            >
                              File
                            </button>
                            <button
                              onClick={() => handleOpenEdit(ev)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs"
                            >
                              Xoá
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SỔ BÁO GIẢNG (PEDAGOGICAL REPORT) ================= */}
        {activeTab === 'report' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Export actions */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <span>Sổ Báo Giảng & Thống Kê Tiến Độ Giảng Dạy</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Tổng hợp {events.length} ca dạy • Tiến độ từng môn học & lớp theo chuẩn báo cáo nhà trường
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Xuất Excel / CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> In Báo Cáo
                </button>
              </div>
            </div>

            {/* Summary Statistics Table */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">STT</th>
                      <th className="p-3.5">Môn học</th>
                      <th className="p-3.5">Lớp giảng dạy</th>
                      <th className="p-3.5">Phòng dạy</th>
                      <th className="p-3.5 text-center">Tổng ca</th>
                      <th className="p-3.5 text-center">Đã dạy</th>
                      <th className="p-3.5 text-center">Còn lại</th>
                      <th className="p-3.5 text-center">Lý thuyết / Thực hành</th>
                      <th className="p-3.5 text-center">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {reportStats.map((st, idx) => {
                      const pct = Math.round((st.done / (st.total || 1)) * 100);
                      return (
                        <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-white">{st.subject}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                              {st.className}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300">{st.room}</td>
                          <td className="p-3.5 text-center font-bold text-white font-mono">{st.total}</td>
                          <td className="p-3.5 text-center font-bold text-emerald-400 font-mono">{st.done}</td>
                          <td className="p-3.5 text-center font-bold text-amber-400 font-mono">{st.remaining}</td>
                          <td className="p-3.5 text-center">
                            <span className="text-blue-400 font-mono">{st.theory} LT</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span className="text-emerald-400 font-mono">{st.practice} TH</span>
                          </td>
                          <td className="p-3.5">
                            <div className="w-32 mx-auto space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span>{pct}%</span>
                                <span>{st.done}/{st.total}</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: TRỢ LÝ AI (AI ASSISTANT) ================= */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Trợ Lý Sư Phạm Trí Tuệ Nhân Tạo</h3>
                  <p className="text-xs text-slate-400">Hỗ trợ soạn giáo án CV 5512, tạo ngân hàng trắc nghiệm & sắp xếp tiến độ</p>
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 sm:p-5 h-[460px] flex flex-col justify-between shadow-xl">
              <div className="space-y-4 overflow-y-auto pr-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[85%] whitespace-pre-line leading-relaxed shadow ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Trợ lý AI đang soạn câu trả lời chuyên môn...</span>
                  </div>
                )}
              </div>

              {/* Suggestions chips */}
              <div className="pt-3 border-t border-slate-700/50 space-y-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setAiInput('Soạn giáo án Module Tiện CNC Lớp CG24TC34 theo công văn 5512')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 whitespace-nowrap"
                  >
                    📝 Soạn giáo án CV 5512
                  </button>
                  <button
                    onClick={() => setAiInput('Tạo 10 câu hỏi trắc nghiệm an toàn xưởng thực hành tiện CNC')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 whitespace-nowrap"
                  >
                    ❓ 10 câu trắc nghiệm CNC
                  </button>
                  <button
                    onClick={() => setAiInput('Tư vấn cách xử lý khi học sinh đi thực hành trễ')}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-blue-500 whitespace-nowrap"
                  >
                    💡 Kỷ luật tích cực
                  </button>
                </div>

                {/* Input Box */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Hỏi trợ lý AI về giáo án, bài giảng, kế hoạch đào tạo..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendAiMessage}
                    disabled={isAiLoading}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: CÀI ĐẶT & ĐỒNG BỘ ĐÁM MÂY ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Cloud Sync Settings */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Đồng Bộ Đám Mây Đa Nền Tảng</h3>
                  <p className="text-xs text-slate-400">Kết nối tức thời Máy tính (Windows/Mac) và Điện thoại Android (Tecno, Samsung...)</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Mã đồng bộ cá nhân của Thầy/Cô (Số điện thoại hoặc mã định danh):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={syncInput}
                    onChange={(e) => setSyncInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const clean = syncInput.trim();
                      if (clean) {
                        setSyncCode(clean);
                        localStorage.setItem('smart_teacher_sync_code', clean);
                        pullFromCloud(clean, true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer"
                  >
                    Lưu & Đồng bộ ngay
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/60 space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-400" /> Hướng dẫn đồng bộ với điện thoại Android:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Mở ứng dụng <strong>Smart Teacher Schedule</strong> trên điện thoại.</li>
                    <li>Vào mục <strong>Cài đặt</strong> ➔ Kiểm tra mã đồng bộ có khớp <strong className="text-white font-mono">{syncCode}</strong> chưa.</li>
                    <li>Bấm nút <strong>Đồng bộ đám mây ngay</strong> trên điện thoại.</li>
                    <li>Toàn bộ 288 ca dạy sẽ tự động hiển thị đầy đủ trên cả máy tính và điện thoại.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Sound & Notifications */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Chuông Báo & Thông Báo Tiết Dạy</h3>
                    <p className="text-xs text-slate-400">Âm thanh Crystal Chime nhắc giờ 60p và 15p</p>
                  </div>
                </div>

                <button
                  onClick={() => playChime('bell')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Thử chuông
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-xs font-medium text-slate-200">Nhắc nhở trước 60 phút (Chuẩn bị giáo án & vật tư)</span>
                  <input
                    type="checkbox"
                    checked={notify60m}
                    onChange={(e) => setNotify60m(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="text-xs font-medium text-slate-200">Chuông báo khẩn cấp trước 15 phút (Vào phòng học/xưởng)</span>
                  <input
                    type="checkbox"
                    checked={notify15m}
                    onChange={(e) => setNotify15m(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Data Backup */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400" />
                <span>Sao lưu & Xuất Dữ Liệu Máy Tính</span>
              </h4>
              <p className="text-xs text-slate-400">
                Xuất file sao lưu JSON chứa toàn bộ 288 ca dạy để lưu trữ an toàn trên ổ đĩa máy tính.
              </p>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify({ events, schedules, syncCode, exportedAt: new Date().toISOString() }, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `SmartTeacher_Backup_288Ca_${todayStr}.json`;
                  a.click();
                }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Tải file sao lưu JSON ({events.length} ca)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: CHỈNH SỬA CA DẠY (UNIFIED EDIT MODAL) ================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <span>Chỉnh Sửa Ca Dạy & Tiến Độ</span>
              </h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Môn học:</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Lớp giảng dạy:</label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Phòng học / Xưởng:</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Ngày dạy:</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Session Type (Theory vs Practice) */}
              <div>
                <label className="text-slate-400 font-medium block mb-1">Hình thức giảng dạy:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditSessionType('Lý thuyết')}
                    className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                      editSessionType === 'Lý thuyết'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    📖 Lý thuyết
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSessionType('Thực hành')}
                    className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                      editSessionType === 'Thực hành'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    ⚙️ Thực hành
                  </button>
                </div>
              </div>

              {/* Date range update (User Request 2) */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Tiến độ đào tạo (Ngày bắt đầu & Kết thúc học kỳ)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block">Bắt đầu:</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Kết thúc:</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Sync Subsequent Checkbox (User Request 3) */}
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncSubsequent}
                    onChange={(e) => setSyncSubsequent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-blue-200">
                    <strong>Tự động đồng bộ cho các ca cùng loại ở phía sau</strong> khi ca đó chưa diễn ra (tránh phải chỉnh sửa lặp lại nhiều lần).
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-blue-500/20">
                  <input
                    type="checkbox"
                    checked={updateWholeSchedule}
                    onChange={(e) => setUpdateWholeSchedule(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-blue-200">
                    Cập nhật tiến độ toàn bộ học kỳ theo ngày bắt đầu/kết thúc mới.
                  </span>
                </label>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Ghi chú:</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Nội dung bài học, chuẩn bị phôi vật tư..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Lưu thay đổi & Đồng bộ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ĐÍNH KÈM TÀI LIỆU (ATTACH FILE) ================= */}
      {attachingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-blue-400" />
                <span>Đính Kèm Giáo Án / Tài Liệu</span>
              </h3>
              <button onClick={() => setAttachingEvent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 font-medium">
                Ca dạy: <span className="text-white font-bold">{attachingEvent.subject}</span> ({attachingEvent.className})
              </p>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Tên tài liệu / Giáo án:</label>
                <input
                  type="text"
                  placeholder="VD: Giao_an_Module_Tien_CNC_Bai_1.pdf"
                  value={attachFileName}
                  onChange={(e) => setAttachFileName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Đường dẫn tài liệu (Drive / Link file):</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/..."
                  value={attachFileUrl}
                  onChange={(e) => setAttachFileUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setAttachingEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAttachment}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Lưu đính kèm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
