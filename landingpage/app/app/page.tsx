"use client";

export const STORAGE_DELETED_EVENTS_KEY = 'smart_teacher_deleted_event_ids_v1';

export function getDeletedEventIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_EVENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function recordDeletedEventIds(ids: (string | number)[]): void {
  if (typeof window === 'undefined' || !Array.isArray(ids) || ids.length === 0) return;
  try {
    const current = new Set(getDeletedEventIds());
    ids.forEach(id => {
      if (id !== undefined && id !== null) current.add(String(id).trim());
    });
    localStorage.setItem(STORAGE_DELETED_EVENTS_KEY, JSON.stringify(Array.from(current)));
  } catch (e) {
    console.error('Error recording deleted event IDs:', e);
  }
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import TodayCommandCenter from '@/components/dashboard/TodayCommandCenter';
import SyncSecurityModal from '@/components/dashboard/SyncSecurityModal';
import PortalShareModal from '@/components/dashboard/PortalShareModal';
import LeaveRequestsModal from '@/components/dashboard/LeaveRequestsModal';
import EduVietHomeView from '@/components/eduviet/EduVietHomeView';
import {
  LessonPlan5512Data,
  LessonPlan2634Data,
  ExamMatrixData,
  LessonSlideItem,
  MiniGameQuestion,
  VideoStoryboardScene,
  LessonMindmapData,
  LessonPlanAuditResult,
  FullLessonPackage,
  generateLessonPlan5512,
  generateLessonPlan2634,
  generateExamMatrix,
  lessonPlan5512ToHtml,
  lessonPlan2634ToHtml,
  examMatrixToHtml,
  generateComprehensiveLessonPlanPackage,
  slidesToHtml,
  miniGameToTxt,
  videoScriptToHtml,
  fullPackageToDocHtml,
  downloadWordDoc
} from './lessonPlanAi';
import { isTestData, cleanAllTestData, countTestData } from './testDataSanitizer';
import {
  KnowledgeDocument,
  getResolvedKnowledgeDocuments,
  mergeKnowledgeDocumentsFromCloud,
  getDeletedKnowledgeDocKeys,
  saveKnowledgeDocument,
  deleteCustomKnowledgeDocument,
  toggleKnowledgeDocumentActive,
  getActiveReferenceContext,
  updateKnowledgeDocument,
  exportKnowledgeDocToWord,
  exportKnowledgeDocToTxt,
  findMatchingKnowledgeDocument,
  MatchedDocResult
} from './knowledgeBaseData';
import {
  extractFullTextFromFile,
  downloadOriginalUploadedFile,
  getOriginalFileFromStorage,
  saveOriginalFileToStorage,
  dataUrlToBlobUrl
} from './knowledgeFileStorage';
import {
  Classroom,
  Student,
  AttendanceRecord,
  AttendanceStatus,
  getStoredClassrooms,
  saveClassroom,
  deleteClassroom,
  getStoredStudents,
  getStudentsByClass,
  saveStudent,
  deleteStudent,
  deleteStudentsByClass,
  addKudosToStudent,
  importStudentsFromText,
  getStoredAttendance,
  getAttendanceForSession,
  saveAttendanceRecords,
  exportAttendanceToCsv,
  parseStudentFile,
  purgeTestRosterData,
  getDeletedStudentIds,
  getDeletedClassroomIds,
  recordDeletedStudentId,
  recordDeletedClassroomId,
  LeaveRequest,
  getStoredLeaveRequests,
  saveLeaveRequests
} from './studentRosterData';
import { isTestStudent, isTestClassroom, isTestSyncData } from './testDataSanitizer';

import AIAssistantWidget from '@/components/AIAssistantWidget';
import { AiPedagogyMode, processPedagogicalAiQuery } from '@/components/aiPedagogyEngine';

import {
  Calendar,
  Clock,
  BookOpen,
  Home,
  GraduationCap,
  Plus,
  Eye,
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
  Upload,
  Loader2,
  Printer,
  ChevronLeft,
  CalendarDays,
  ExternalLink,
  CheckSquare,
  UserPlus,
  Trophy,
  Star,
  UserX,
  UserCheck,
  Edit3,
  Gamepad2,
  Video,
  Network,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
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
  attachmentContent?: string;
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

// Helper: Add months to a YYYY-MM-DD date string
export function addMonthsToDate(dateStr: string, months: number): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '2027-02-15';
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // Handle month-end overflow
    if (d.getDate() !== day) {
      d.setDate(0);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dt = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dt}`;
  } catch {
    return '2027-02-15';
  }
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

// Merge schedules based on updatedAt (Last-Write-Wins per item)
export function mergeSchedulesDesktop(current: ScheduleItem[], incoming: ScheduleItem[]): ScheduleItem[] {
  const map = new Map<string, ScheduleItem>();
  const getKey = (s: ScheduleItem) => {
    const cleanId = s.id ? s.id.replace(/^sch_/, '') : '';
    if (cleanId && !isNaN(Number(cleanId))) return `id_${cleanId}`;
    return `${s.subject.toLowerCase().trim()}__${s.className.toLowerCase().trim()}__${s.dayOfWeek}`;
  };

  for (const s of current) {
    map.set(getKey(s), s);
  }
  for (const inc of incoming) {
    const k = getKey(inc);
    const prev = map.get(k);
    if (!prev) {
      map.set(k, inc);
    } else {
      const prevTs = Number(prev.updatedAt) || 0;
      const incTs = Number(inc.updatedAt) || 0;
      if (incTs >= prevTs) {
        map.set(k, inc);
      }
    }
  }
  return Array.from(map.values());
}

// Merge events based on updatedAt (Last-Write-Wins per item)
export function mergeEventsDesktop(
  current: CalendarEventItem[],
  incoming: CalendarEventItem[],
  deletedIds: Set<string> = new Set()
): CalendarEventItem[] {
  const map = new Map<string, CalendarEventItem>();
  const getKey = (e: CalendarEventItem) => {
    const numId = Number(e.id);
    if (!isNaN(numId) && numId > 0) return `id_${numId}`;
    if (e.teachingScheduleId) return `sch_${e.teachingScheduleId}_${e.date}`;
    return `${e.date}_${(e.className || '').toLowerCase().trim()}_${(e.startTime || '').trim()}_${(e.subject || '').toLowerCase().trim()}`;
  };

  for (const e of current) {
    if (!e || isTestSyncData(e)) continue;
    if (e.id && deletedIds.has(String(e.id).trim())) continue;
    map.set(getKey(e), e);
  }
  for (const inc of incoming) {
    if (!inc || isTestSyncData(inc)) continue;
    if (inc.id && deletedIds.has(String(inc.id).trim())) continue;
    const k = getKey(inc);
    const prev = map.get(k);
    if (!prev) {
      map.set(k, inc);
    } else {
      const prevTs = Number(prev.updatedAt) || 0;
      const incTs = Number(inc.updatedAt) || 0;
      if (incTs >= prevTs) {
        map.set(k, inc);
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export default function UnifiedTeacherScheduleApp() {
  const [activeTab, setActiveTab] = useState<'eduviet' | 'today' | 'calendar' | 'roster' | 'report' | 'ai' | 'settings'>('eduviet');
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('smart_teacher_theme') as 'light' | 'dark' | null;
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('smart_teacher_theme', next);
    } catch (e) {}
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  // ================= PHASE 1: CLASS ROSTER & ATTENDANCE STATES =================
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRosterClass, setSelectedRosterClass] = useState<string>('');
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentCode, setNewStudentCode] = useState<string>('');
  const [newStudentGender, setNewStudentGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('');
  const [newStudentNotes, setNewStudentNotes] = useState<string>('');
  const [showImportRosterModal, setShowImportRosterModal] = useState<boolean>(false);
  const [importRosterText, setImportRosterText] = useState<string>('');
  const [showAddClassModal, setShowAddClassModal] = useState<boolean>(false);
  const [newClassName, setNewClassName] = useState<string>('');
  const [newClassGrade, setNewClassGrade] = useState<string>('');

  const rosterFileInputRef = useRef<HTMLInputElement>(null);
  const [isImportingFile, setIsImportingFile] = useState(false);


  // 1-Tap Attendance Session Modal
  const [attendanceEvent, setAttendanceEvent] = useState<CalendarEventItem | null>(null);
  const [sessionAttendanceMap, setSessionAttendanceMap] = useState<Record<string, AttendanceRecord>>({});

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
  const [syncCode, setSyncCode] = useState<string>('');
  const [syncInput, setSyncInput] = useState<string>('');
  const [syncPin, setSyncPin] = useState<string>('');
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'synced' | 'syncing' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Vừa xong');
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showPortalShareModal, setShowPortalShareModal] = useState<boolean>(false);
  const [showLeaveRequestsModal, setShowLeaveRequestsModal] = useState<boolean>(false);

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

  // New Ca Day (Add Event) Modal States
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('07:00');
  const [newEndTime, setNewEndTime] = useState('07:45');
  const [newSessionType, setNewSessionType] = useState<'Lý thuyết' | 'Thực hành'>('Lý thuyết');
  const [newNotes, setNewNotes] = useState('');
  const [newCreateRecurring, setNewCreateRecurring] = useState(false);
  const [newStartDate, setNewStartDate] = useState('2026-09-07');
  const [newEndDate, setNewEndDate] = useState('2027-02-15');

  // Attachment Modal
  const [attachingEvent, setAttachingEvent] = useState<CalendarEventItem | null>(null);
  const [attachFileName, setAttachFileName] = useState('');
  const [attachFileUrl, setAttachFileUrl] = useState('');

  // Audio & Notification States
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notify60m, setNotify60m] = useState(true);
  const [notify15m, setNotify15m] = useState(true);
  const audioCtxRef = useRef<any>(null);

  // Lesson Planner & Exam Matrix AI States
  const [aiSubTab, setAiSubTab] = useState<'planner' | 'exam' | 'chat' | 'knowledge'>('planner');
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [kbSearch, setKbSearch] = useState('');
  const [kbFilter, setKbFilter] = useState<'ALL' | 'GIAO_TRINH' | 'DE_CUONG' | 'PHAP_QUY' | 'ATLD_5S' | 'CUSTOM'>('ALL');
  const [kbViewingDoc, setKbViewingDoc] = useState<KnowledgeDocument | null>(null);
  const [kbShowAddModal, setKbShowAddModal] = useState(false);
  const [kbNewTitle, setKbNewTitle] = useState('');
  const [kbNewCode, setKbNewCode] = useState('');
  const [kbNewCategory, setKbNewCategory] = useState<'GIAO_TRINH' | 'DE_CUONG' | 'PHAP_QUY' | 'ATLD_5S'>('GIAO_TRINH');
  const [kbNewSubject, setKbNewSubject] = useState('ALL');
  const [kbNewLevel, setKbNewLevel] = useState('ALL');
  const [kbNewContent, setKbNewContent] = useState('');
  const [kbAttachedFileName, setKbAttachedFileName] = useState('');
  const [kbAttachedFileSize, setKbAttachedFileSize] = useState(0);
  const [kbAttachedFileType, setKbAttachedFileType] = useState('');
  const [kbAttachedFileData, setKbAttachedFileData] = useState('');
  const [kbIsExtracting, setKbIsExtracting] = useState(false);

  // Edit / Update Knowledge Document States
  const [kbEditingDoc, setKbEditingDoc] = useState<KnowledgeDocument | null>(null);
  const [kbEditTitle, setKbEditTitle] = useState('');
  const [kbEditCode, setKbEditCode] = useState('');
  const [kbEditCategory, setKbEditCategory] = useState<'GIAO_TRINH' | 'DE_CUONG' | 'PHAP_QUY' | 'ATLD_5S'>('GIAO_TRINH');
  const [kbEditSubject, setKbEditSubject] = useState('ALL');
  const [kbEditLevel, setKbEditLevel] = useState('ALL');
  const [kbEditContent, setKbEditContent] = useState('');
  const [kbEditFileName, setKbEditFileName] = useState('');
  const [kbEditFileSize, setKbEditFileSize] = useState(0);
  const [kbEditFileType, setKbEditFileType] = useState('');
  const [kbEditFileData, setKbEditFileData] = useState('');
  const [kbEditIsExtracting, setKbEditIsExtracting] = useState(false);
  const [kbPreviewPdfUrl, setKbPreviewPdfUrl] = useState<string | null>(null);
  const [kbPreviewMode, setKbPreviewMode] = useState<'AUTO' | 'TEXT' | 'PDF'>('AUTO');
  const [kbPreviewIsLoading, setKbPreviewIsLoading] = useState(false);
  const [kbPreviewStatusText, setKbPreviewStatusText] = useState('');
  const [kbPreviewFullScreen, setKbPreviewFullScreen] = useState(false);
  const [kbPreviewZoom, setKbPreviewZoom] = useState(100);
  const [kbPreviewSearchTerm, setKbPreviewSearchTerm] = useState('');
  const [kbCopied, setKbCopied] = useState(false);

  useEffect(() => {
    let activeBlobUrl: string | null = null;
    if (kbViewingDoc) {
      const isPdf = kbViewingDoc.fileName?.toLowerCase().endsWith('.pdf') || kbViewingDoc.fileType?.includes('pdf');
      if (isPdf) {
        setKbPreviewIsLoading(true);
        setKbPreviewStatusText('Đang nạp dữ liệu xem trước...');
        getOriginalFileFromStorage(kbViewingDoc.id).then(rawUrl => {
          const finalUrl = rawUrl || kbViewingDoc.fileData || null;
          if (finalUrl) {
            const blobUrl = dataUrlToBlobUrl(finalUrl);
            activeBlobUrl = blobUrl;
            setKbPreviewPdfUrl(blobUrl);
          } else {
            setKbPreviewPdfUrl(null);
          }
          setKbPreviewIsLoading(false);
        }).catch(() => {
          setKbPreviewPdfUrl(null);
          setKbPreviewIsLoading(false);
        });
      } else {
        setKbPreviewPdfUrl(null);
      }
    } else {
      setKbPreviewPdfUrl(null);
    }

    return () => {
      if (activeBlobUrl && activeBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [kbViewingDoc]);

  const handleAttachFileToCurrentDoc = async (file: File, doc: KnowledgeDocument) => {
    if (!file || !doc) return;
    try {
      setKbPreviewIsLoading(true);
      setKbPreviewStatusText('Đang nạp tệp và trích xuất toàn văn từng trang...');
      const fileName = file.name;
      const fileSize = file.size;
      const fileType = file.type || fileName.split('.').pop()?.toLowerCase() || '';

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          // 1. Lưu ngay tệp gốc vào IndexedDB
          await saveOriginalFileToStorage(doc.id, dataUrl);

          // 2. Trích xuất toàn văn với PDF.js / JSZip
          setKbPreviewStatusText('Đang giải mã văn bản với AI...');
          const fullText = await extractFullTextFromFile(file);

          // 3. Cập nhật bản ghi document
          const updatedDoc: KnowledgeDocument = {
            ...doc,
            fileName,
            fileSize,
            fileType,
            content: fullText,
            updatedAt: Date.now()
          };

          // 4. Lưu vào localStorage
          saveKnowledgeDocument(updatedDoc);

          // 5. Cập nhật state giao diện
          refreshKnowledgeDocs();
          setKbViewingDoc(updatedDoc);

          // 6. Tự động đồng bộ lên Đám mây để điện thoại nhận được ngay
          pushToCloud(events, schedules, syncCode, false);

          if (fileName.toLowerCase().endsWith('.pdf') || fileType.includes('pdf')) {
            const blobUrl = dataUrlToBlobUrl(dataUrl);
            setKbPreviewPdfUrl(blobUrl);
            setKbPreviewMode('AUTO');
          }
          setKbPreviewIsLoading(false);
        } catch (subErr) {
          console.error('Lỗi khi xử lý trích xuất tệp', subErr);
          setKbPreviewIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Lỗi khi nạp tệp cho tài liệu', err);
      setKbPreviewIsLoading(false);
      alert('Có lỗi khi nạp tệp: ' + String(err));
    }
  };

  const processAttachedKnowledgeFile = async (file: File, isEdit: boolean) => {
    if (!file) return;
    const fileName = file.name;
    const fileSize = file.size;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (isEdit) {
      setKbEditIsExtracting(true);
      setKbEditFileName(fileName);
      setKbEditFileSize(fileSize);
      setKbEditFileType(file.type || ext);
      if (!kbEditTitle.trim()) setKbEditTitle(fileName.replace(/\.[^/.]+$/, ''));
    } else {
      setKbIsExtracting(true);
      setKbAttachedFileName(fileName);
      setKbAttachedFileSize(fileSize);
      setKbAttachedFileType(file.type || ext);
      if (!kbNewTitle.trim()) setKbNewTitle(fileName.replace(/\.[^/.]+$/, ''));
      if (!kbNewCode.trim()) {
        setKbNewCode('DOC_' + fileName.substring(0, 8).replace(/[^a-zA-Z0-9]/g, '_').toUpperCase());
      }
    }

    const dataReader = new FileReader();
    dataReader.onload = () => {
      const dataUrl = dataReader.result as string;
      if (isEdit) setKbEditFileData(dataUrl);
      else setKbAttachedFileData(dataUrl);
    };
    dataReader.readAsDataURL(file);

    try {
      const fullText = await extractFullTextFromFile(file);
      if (isEdit) {
        setKbEditContent(fullText);
        setKbEditIsExtracting(false);
      } else {
        setKbNewContent(fullText);
        setKbIsExtracting(false);
      }
    } catch (err) {
      console.error('Error extracting text from file', err);
      if (isEdit) setKbEditIsExtracting(false);
      else setKbIsExtracting(false);
    }
  };

  const openKbEditModal = (doc: KnowledgeDocument) => {
    setKbEditingDoc(doc);
    setKbEditTitle(doc.title);
    setKbEditCode(doc.code);
    setKbEditCategory(doc.category as any);
    setKbEditSubject(doc.subject);
    setKbEditLevel(doc.targetLevel);
    setKbEditContent(doc.content);
    setKbEditFileName(doc.fileName || '');
    setKbEditFileSize(doc.fileSize || 0);
    setKbEditFileType(doc.fileType || '');
    setKbEditFileData(doc.fileData || '');
  };

  const handleSaveKbEditDoc = () => {
    if (!kbEditingDoc) return;
    if (!kbEditTitle.trim() || (!kbEditContent.trim() && !kbEditFileName)) {
      alert('Vui lòng nhập Tên tài liệu hoặc đính kèm tệp!');
      return;
    }
    const updatedDoc: KnowledgeDocument = {
      ...kbEditingDoc,
      title: kbEditTitle.trim(),
      code: kbEditCode.trim() || kbEditingDoc.code,
      category: kbEditCategory,
      subject: kbEditSubject.trim() || 'ALL',
      targetLevel: kbEditLevel.trim() || 'ALL',
      content: kbEditContent.trim() || ('Tài liệu: ' + kbEditFileName),
      fileName: kbEditFileName || undefined,
      fileSize: kbEditFileSize || undefined,
      fileType: kbEditFileType || undefined,
      fileData: kbEditFileData || undefined
    };
    const saved = updateKnowledgeDocument(updatedDoc);
    if (saved) {
      refreshKnowledgeDocs();
      pushToCloud(events, schedules, syncCode, false);
      if (kbViewingDoc && kbViewingDoc.id === updatedDoc.id) {
        setKbViewingDoc(updatedDoc);
      }
      setKbEditingDoc(null);
    } else {
      alert('Có lỗi khi lưu cập nhật tài liệu!');
    }
  };

  const refreshKnowledgeDocs = () => {
    setKnowledgeDocs(getResolvedKnowledgeDocuments());
  };

  useEffect(() => {
    refreshKnowledgeDocs();
  }, []);
  const [plannerStandard, setPlannerStandard] = useState<5512 | 2634>(5512);
  const [plannerLessonTitle, setPlannerLessonTitle] = useState('');
  const [plannerModuleTitle, setPlannerModuleTitle] = useState('');
  const [plannerSubject, setPlannerSubject] = useState('');
  const [plannerClass, setPlannerClass] = useState('');
  const [plannerDuration, setPlannerDuration] = useState('1');
  const [plannerRequirements, setPlannerRequirements] = useState('');
  const [plannerSelectedEventId, setPlannerSelectedEventId] = useState('');
  const [plannerResult5512, setPlannerResult5512] = useState<LessonPlan5512Data | null>(null);
  const [plannerResult2634, setPlannerResult2634] = useState<LessonPlan2634Data | null>(null);
  const [plannerIsGenerating, setPlannerIsGenerating] = useState(false);

  // New Multi-Modal Planner & Digital Competency States
  const [plannerClassFilter, setPlannerClassFilter] = useState('ALL');
  const [plannerMatchedDocResult, setPlannerMatchedDocResult] = useState<MatchedDocResult | null>(null);
  const [plannerSelectedDocId, setPlannerSelectedDocId] = useState<string>('AUTO');
  const [plannerFullPackage, setPlannerFullPackage] = useState<FullLessonPackage | null>(null);
  // Viewing state for the 6-in-1 Unified Lesson Package Modal
  const [viewingLessonPackage, setViewingLessonPackage] = useState<FullLessonPackage | null>(null);
  const [viewingLessonEvent, setViewingLessonEvent] = useState<CalendarEventItem | null>(null);
  const [lessonPackageActiveTab, setLessonPackageActiveTab] = useState<'plan' | 'slides' | 'game' | 'video' | 'mindmap' | 'audit' | 'all'>('plan');
  const [lessonPackageFullScreen, setLessonPackageFullScreen] = useState(false);
  const [lessonPackageCopied, setLessonPackageCopied] = useState(false);

  // Chế độ Chỉnh sửa Giáo án AI
  const [isEditingLessonPackage, setIsEditingLessonPackage] = useState(false);
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonSubject, setEditLessonSubject] = useState('');
  const [editLessonClass, setEditLessonClass] = useState('');
  const [editLessonDuration, setEditLessonDuration] = useState(45);
  const [editKnowledgeObj, setEditKnowledgeObj] = useState('');
  const [editCompetenciesObj, setEditCompetenciesObj] = useState('');
  const [editQualitiesObj, setEditQualitiesObj] = useState('');
  const [editTeacherEquip, setEditTeacherEquip] = useState('');
  const [editStudentEquip, setEditStudentEquip] = useState('');
  const [editAct1Name, setEditAct1Name] = useState('');
  const [editAct1Content, setEditAct1Content] = useState('');
  const [editAct1Implementation, setEditAct1Implementation] = useState('');
  const [editAct2Name, setEditAct2Name] = useState('');
  const [editAct2Content, setEditAct2Content] = useState('');
  const [editAct2Implementation, setEditAct2Implementation] = useState('');
  const [editAct3Name, setEditAct3Name] = useState('');
  const [editAct3Content, setEditAct3Content] = useState('');
  const [editAct3Implementation, setEditAct3Implementation] = useState('');
  const [editAct4Name, setEditAct4Name] = useState('');
  const [editAct4Content, setEditAct4Content] = useState('');
  const [editAct4Implementation, setEditAct4Implementation] = useState('');

  // Bộ lọc an toàn dữ liệu thử nghiệm (Test Data Filter & Safety Hook)
  const [excludeTestData, setExcludeTestData] = useState(true);
  const [testDataCount, setTestDataCount] = useState(0);
  const [dismissTestBanner, setDismissTestBanner] = useState(false);
  const [plannerActiveResultTab, setPlannerActiveResultTab] = useState<'plan' | 'slides' | 'game' | 'video' | 'mindmap' | 'audit'>('plan');
  const [plannerStepProgress, setPlannerStepProgress] = useState('');

  // Hàm chọn ca dạy và tự động trích xuất tiết học, tên bài và khớp nối tài liệu giáo trình
  const selectPlannerEvent = (ev: CalendarEventItem) => {
    setPlannerSelectedEventId(ev.id);
    setPlannerSubject(ev.subject || '');
    setPlannerClass(ev.className || '');
    setPlannerDuration(ev.sessionType?.includes('Thực hành') ? '4' : '1');

    const rawNote = ev.notes || '';
    const rawTitle = ev.title || '';
    const combined = (rawNote + ' ' + rawTitle).trim();

    let inferredLesson = '';
    const lessonMatch = combined.match(/(?:bài\s*[0-9]+[^:\-]*[:\-]\s*)([^,\n\r]+)/i);
    if (lessonMatch) {
      inferredLesson = lessonMatch[0].trim();
    } else if (rawNote.trim()) {
      inferredLesson = rawNote.trim();
    } else {
      inferredLesson = ev.title || ev.subject;
    }

    setPlannerLessonTitle(inferredLesson);
    setPlannerModuleTitle(inferredLesson);

    // Khớp nối tài liệu từ Kho tư liệu chuẩn nếu đang ở chế độ AUTO
    if (plannerSelectedDocId === 'AUTO') {
      const matched = findMatchingKnowledgeDocument(ev.subject, ev.className, inferredLesson);
      setPlannerMatchedDocResult(matched);
    }
  };

  // Hàm sinh kế hoạch bài giảng trọn gói đa phương tiện 5 bước
  const handleGenerateFullLessonPackage = () => {
    const title = plannerLessonTitle.trim();
    if (!title) {
      alert('Vui lòng nhập hoặc chọn Tên bài dạy!');
      return;
    }

    setPlannerIsGenerating(true);
    setPlannerStepProgress('Bước 1/5: Thiết lập Kế hoạch bài dạy chuẩn quy chuẩn...');

    setTimeout(() => {
      setPlannerStepProgress('Bước 2/5: Soạn thảo kịch bản Slide thuyết trình PowerPoint...');
      setTimeout(() => {
        setPlannerStepProgress('Bước 3/5: Thiết kế bộ câu hỏi Mini Game tương tác...');
        setTimeout(() => {
          setPlannerStepProgress('Bước 4/5: Xây dựng kịch bản Video bài giảng vi mô...');
          setTimeout(() => {
            setPlannerStepProgress('Bước 5/5: Vẽ Sơ đồ tư duy & Chấm điểm Năng lực số...');

            const durationNum = Number(plannerDuration) || (plannerStandard === 5512 ? 1 : 4);
            const selectedEv = events.find(e => e.id === plannerSelectedEventId);
            const sessionInfoStr = selectedEv
              ? `${selectedEv.date} • Ca: ${selectedEv.startTime}-${selectedEv.endTime} (Phòng: ${selectedEv.room || 'Lớp học'})`
              : 'Theo phân phối chương trình';

            // Xác định tài liệu đối chiếu theo chỉ định thủ công hoặc tự động
            let freshMatched: MatchedDocResult | null = null;
            if (plannerSelectedDocId === 'AUTO') {
              freshMatched = findMatchingKnowledgeDocument(plannerSubject, plannerClass, title);
            } else if (plannerSelectedDocId === 'NONE') {
              freshMatched = null;
            } else {
              const explicitDoc = knowledgeDocs.find(d => d.id === plannerSelectedDocId);
              if (explicitDoc) {
                freshMatched = {
                  doc: explicitDoc,
                  relevantSnippet: explicitDoc.content.slice(0, 1400),
                  confidence: 100
                };
              }
            }
            setPlannerMatchedDocResult(freshMatched);

            const pkg = generateComprehensiveLessonPlanPackage({
              lessonTitle: title,
              subject: plannerSubject || 'Chung',
              className: plannerClass || 'Toàn trường',
              sessionInfo: sessionInfoStr,
              standard: plannerStandard,
              durationMinutes: durationNum * (plannerStandard === 5512 ? 45 : 60),
              customRequirements: plannerRequirements,
              matchedDoc: freshMatched?.doc ? {
                code: freshMatched.doc.code,
                title: freshMatched.doc.title,
                fileName: freshMatched.doc.fileName,
                relevantSnippet: freshMatched.relevantSnippet
              } : null,
              referenceContext: freshMatched?.relevantSnippet || getActiveReferenceContext(plannerSubject, plannerStandard === 5512 ? 'PHAP_QUY' : 'ATLD_5S')
            });

            setPlannerFullPackage(pkg);
            if (plannerStandard === 5512) {
              setPlannerResult5512(pkg.plan5512 || null);
              setPlannerResult2634(null);
            } else {
              setPlannerResult2634(pkg.plan2634 || null);
              setPlannerResult5512(null);
            }
            setPlannerActiveResultTab('plan');
            setPlannerIsGenerating(false);
            setPlannerStepProgress('');
          }, 350);
        }, 350);
      }, 350);
    }, 350);
  };

  // Exam Matrix States
  const [examTopic, setExamTopic] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examGrade, setExamGrade] = useState('');
  const [examQuestionCount, setExamQuestionCount] = useState(10);
  const [examResult, setExamResult] = useState<ExamMatrixData | null>(null);
  const [examIsGenerating, setExamIsGenerating] = useState(false);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'ai' | 'user';
    text: string;
    mode?: AiPedagogyMode;
    svgContent?: string;
    mermaidCode?: string;
    wordExportableHtml?: string;
    sourceReferences?: { title: string; code?: string; url?: string; snippet?: string }[];
  }>>([
    {
      role: 'ai',
      text: 'Kính chào Thầy/Cô! Em là Trợ lý AI Sư phạm chuyên sâu (Made by Huy Technology AI). Em hỗ trợ Thầy/Cô với 7 năng lực sư phạm chuyên sâu: Tra cứu kho tư liệu chuẩn (CV 5512, CV 3456, QĐ 2422, TT 22, ATLĐ 5S), Tạo đề thi & ma trận TT 22, Tạo slide bài giảng 10 trang, Tạo mini game Kahoot/Quizizz, Tạo sơ đồ tư duy Mermaid, Thiết kế hình minh họa SVG và Tra cứu nguồn chính thống Việt Nam (moet.gov.vn, thuvienphapluat.vn).'
    }
  ]);
  const [chatSelectedMode, setChatSelectedMode] = useState<AiPedagogyMode>('ALL');
  const [chatCopiedId, setChatCopiedId] = useState<string | null>(null);
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



  // Handle direct file upload for class roster (.xlsx, .xls, .csv, .docx, .txt)
  const handleRosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImportingFile(true);
    try {
      const targetClass = selectedRosterClass || 'CG24TC34';
      const result = await parseStudentFile(targetClass, targetClass, file);
      if (result.success) {
        // Refresh local student state
        const allStudents = getStoredStudents();
        setStudents(allStudents);
        setAlertBanner(`🎉 ${result.message}`);
        setTimeout(() => setAlertBanner(null), 5000);
        // Automatically sync to cloud
        pushToCloud(events, schedules, syncCode, false);
      } else {
        alert(result.message);
      }
    } catch (err: any) {
      alert('Lỗi khi đọc tệp danh sách: ' + (err?.message || String(err)));
    } finally {
      setIsImportingFile(false);
      if (rosterFileInputRef.current) rosterFileInputRef.current.value = '';
    }
  };

  // Open 1-Tap Attendance Modal for an Event
  const openAttendanceModal = (ev: CalendarEventItem) => {
    const classStudents = getStudentsByClass(ev.className);
    const existingRecs = getAttendanceForSession(ev.date, ev.className, ev.id);
    const map: Record<string, AttendanceRecord> = {};

    classStudents.forEach(st => {
      const found = existingRecs.find(r => r.studentId === st.id);
      if (found) {
        map[st.id] = { ...found };
      } else {
        // Default: PRESENT
        map[st.id] = {
          id: `att_${Date.now()}_${st.id}`,
          date: ev.date,
          eventId: ev.id,
          studentId: st.id,
          className: ev.className,
          status: 'PRESENT',
          kudosDelta: 0,
          updatedAt: Date.now()
        };
      }
    });

    setSessionAttendanceMap(map);
    setAttendanceEvent(ev);
  };

  // 1-Tap cycle status: PRESENT -> ABSENT_EXCUSED -> ABSENT_UNEXCUSED -> LATE -> PRESENT
  const cycleAttendanceStatus = (studentId: string) => {
    setSessionAttendanceMap(prev => {
      const cur = prev[studentId];
      if (!cur) return prev;
      let nextStatus: AttendanceStatus = 'PRESENT';
      if (cur.status === 'PRESENT') nextStatus = 'ABSENT_EXCUSED';
      else if (cur.status === 'ABSENT_EXCUSED') nextStatus = 'ABSENT_UNEXCUSED';
      else if (cur.status === 'ABSENT_UNEXCUSED') nextStatus = 'LATE';
      else nextStatus = 'PRESENT';

      return {
        ...prev,
        [studentId]: {
          ...cur,
          status: nextStatus,
          updatedAt: Date.now()
        }
      };
    });
  };

  // Add Kudos Praise directly in session
  const addSessionKudos = (studentId: string, points: number, reason: string) => {
    setSessionAttendanceMap(prev => {
      const cur = prev[studentId];
      if (!cur) return prev;
      return {
        ...prev,
        [studentId]: {
          ...cur,
          kudosDelta: (cur.kudosDelta || 0) + points,
          note: reason,
          updatedAt: Date.now()
        }
      };
    });
    // Also increment student total kudos points
    const updated = addKudosToStudent(studentId, points, reason);
    setStudents(updated);
  };

  // Save Attendance to LocalStorage and Cloud
  const handleSaveAttendance = () => {
    if (!attendanceEvent) return;
    const recordsToSave = Object.values(sessionAttendanceMap);
    const updatedAll = saveAttendanceRecords(recordsToSave);
    setAttendanceRecords(updatedAll);
    setAttendanceEvent(null);
    setAlertBanner(`🟢 Đã lưu điểm danh lớp ${attendanceEvent.className} (${recordsToSave.length} học sinh)!`);
    setTimeout(() => setAlertBanner(null), 4000);
    // Push update to cloud
    pushToCloud(events, schedules, syncCode, false);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setSessionAttendanceMap(prev => {
      const next: Record<string, AttendanceRecord> = {};
      for (const [sId, rec] of Object.entries(prev)) {
        next[sId] = { ...rec, status: 'PRESENT', updatedAt: Date.now() };
      }
      return next;
    });
  };

  // Copy Attendance to Zalo / Clipboard
  const handleCopyAttendanceZalo = () => {
    if (!attendanceEvent) return;
    const classStudents = getStudentsByClass(attendanceEvent.className);
    const recs = Object.values(sessionAttendanceMap);
    const presentCount = recs.filter(r => r.status === 'PRESENT').length;
    const excusedCount = recs.filter(r => r.status === 'ABSENT_EXCUSED').length;
    const unexcusedCount = recs.filter(r => r.status === 'ABSENT_UNEXCUSED').length;
    const lateCount = recs.filter(r => r.status === 'LATE').length;

    let msg = `📢 [BÁO CÁO ĐIỂM DANH] Lớp: ${attendanceEvent.className}\n`;
    msg += `📅 Tiết dạy: ${attendanceEvent.subject} (${attendanceEvent.startTime} - ${attendanceEvent.endTime}, Ngày ${attendanceEvent.date})\n`;
    msg += `📍 Phòng: ${attendanceEvent.room}\n`;
    msg += `👥 Sĩ số: ${presentCount}/${classStudents.length} Có mặt\n`;
    if (excusedCount > 0) {
      const names = classStudents.filter(s => sessionAttendanceMap[s.id]?.status === 'ABSENT_EXCUSED').map(s => s.fullName).join(', ');
      msg += `🟡 Vắng có phép (${excusedCount}): ${names}\n`;
    }
    if (unexcusedCount > 0) {
      const names = classStudents.filter(s => sessionAttendanceMap[s.id]?.status === 'ABSENT_UNEXCUSED').map(s => s.fullName).join(', ');
      msg += `🔴 Vắng không phép (${unexcusedCount}): ${names}\n`;
    }
    if (lateCount > 0) {
      const names = classStudents.filter(s => sessionAttendanceMap[s.id]?.status === 'LATE').map(s => s.fullName).join(', ');
      msg += `🟠 Đi trễ (${lateCount}): ${names}\n`;
    }
    msg += `✨ Smart Teacher Schedule AI - Đồng bộ sư phạm thông minh`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg);
      alert('Đã sao chép nội dung điểm danh để gửi Zalo cho GVCN / Phụ huynh!');
    }
  };

  // Push to Cloud (Máy tính -> Đám mây -> Điện thoại)
  const pushToCloud = async (curEvents: CalendarEventItem[], curSchedules: ScheduleItem[], code = syncCode, isManual = false, purgeTestData = false) => {
    if (!code) return false;
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const nowTs = Date.now();
      localStorage.setItem('smart_teacher_last_local_update', nowTs.toString());
      const allKnowledgeDocs = getResolvedKnowledgeDocuments();
      const docsPayload = allKnowledgeDocs.map(d => ({
        id: d.id,
        code: d.code,
        title: d.title,
        category: d.category,
        subject: d.subject,
        targetLevel: d.targetLevel,
        content: d.content,
        isBuiltIn: d.isBuiltIn,
        isActive: d.isActive,
        fileName: d.fileName,
        fileSize: d.fileSize,
        fileType: d.fileType,
        updatedAt: d.updatedAt || nowTs
      }));

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode: code,
          pin: syncPin,
          platform: 'desktop',
          deviceName: 'Máy tính Giáo viên (Windows/Mac/Web)',
          updatedAt: nowTs,
          events: curEvents,
          schedules: curSchedules,
          knowledgeDocs: docsPayload,
          classrooms: getStoredClassrooms(),
          students: getStoredStudents(),
          attendanceRecords: getStoredAttendance(),
          deletedKnowledgeDocKeys: getDeletedKnowledgeDocKeys(),
          deletedEventIds: getDeletedEventIds(),
          deletedStudentIds: getDeletedStudentIds(),
          deletedClassroomIds: getDeletedClassroomIds(),
          purgeTestData: purgeTestData,
          leaveRequests: getStoredLeaveRequests()
        })
      });
      if (res.ok) {
        const result = await res.json();
        // Cập nhật state với danh sách đã hợp nhất 2 chiều từ server
        if (Array.isArray(result.events)) {
          const deletedEvents = new Set(getDeletedEventIds());
          const cleanEvents = result.events.filter((e: any) => !isTestSyncData(e) && !deletedEvents.has(String(e.id)));
          setEvents(cleanEvents);
          localStorage.setItem('smart_teacher_events', JSON.stringify(cleanEvents));
        }
        if (Array.isArray(result.schedules) && result.schedules.length > 0) {
          setSchedules(result.schedules);
          localStorage.setItem('smart_teacher_schedules', JSON.stringify(result.schedules));
        }

        if (Array.isArray(result.classrooms)) {
          const deletedClasses = new Set(getDeletedClassroomIds());
          const cleanClassrooms = result.classrooms.filter((c: any) => !isTestClassroom(c) && !deletedClasses.has(c.id) && !deletedClasses.has((c.name || '').toLowerCase()));
          setClassrooms(cleanClassrooms);
          localStorage.setItem('smart_teacher_classrooms_v1', JSON.stringify(cleanClassrooms));
          if (!selectedRosterClass && cleanClassrooms.length > 0) {
            setSelectedRosterClass(cleanClassrooms[0].name);
          }
        }
        if (Array.isArray(result.students)) {
          const deletedIds = new Set(getDeletedStudentIds());
          const deletedClasses = new Set(getDeletedClassroomIds());
          const cleanStudents = result.students.filter((s: any) => !isTestStudent(s) && !deletedIds.has(s.id) && !deletedClasses.has((s.className || '').toLowerCase()));
          setStudents(cleanStudents);
          localStorage.setItem('smart_teacher_students_v1', JSON.stringify(cleanStudents));
        }
        if (Array.isArray(result.leaveRequests)) {
          setLeaveRequests(result.leaveRequests);
          saveLeaveRequests(result.leaveRequests);
        }
        if (Array.isArray(result.attendanceRecords) && result.attendanceRecords.length > 0) {
          setAttendanceRecords(result.attendanceRecords);
          localStorage.setItem('smart_teacher_attendance_v1', JSON.stringify(result.attendanceRecords));
        }

        if (Array.isArray(result.knowledgeDocs)) {
          mergeKnowledgeDocumentsFromCloud(result.knowledgeDocs, result.deletedKnowledgeDocKeys || []);
          refreshKnowledgeDocs();
        }

        const count = result.totalEvents || curEvents.length;
        const totalDocs = result.totalKnowledgeDocs || allKnowledgeDocs.length;
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAlertBanner(`🟢 Đã đồng bộ & hợp nhất ${count} ca dạy và ${totalDocs} tài liệu/giáo trình lên Đám mây! Điện thoại sẽ nhận được ngay.`);
        setTimeout(() => setAlertBanner(null), 5000);
        if (isManual) {
          alert(`🎉 ĐẨY LÊN ĐÁM MÂY THÀNH CÔNG!\n\nĐã gửi & hợp nhất ${count} ca dạy, ${result.totalSchedules || curSchedules.length} lịch mẫu học kỳ và ${totalDocs} tài liệu giáo trình/pháp quy lên Đám mây!\n\nThầy/Cô mở app trên điện thoại và bấm "Đồng bộ 2 chiều" (hoặc "Nhận từ PC") để nhận dữ liệu mới nhất từ máy tính nhé!\nMã đồng bộ: ${code}`);
        }
        return true;
      } else {
        setSyncStatus('error');
        if (isManual) alert('Lỗi khi gửi dữ liệu lên đám mây: Mã lỗi ' + res.status);
        return false;
      }
    } catch (e) {
      console.error('pushToCloud error:', e);
      setSyncStatus('error');
      if (isManual) alert('Lỗi kết nối máy chủ đám mây: ' + (e as any)?.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull from Cloud (Đám mây -> Máy tính)
  const pullFromCloud = async (code = syncCode, isManual = false) => {
    if (!code) return false;
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}${syncPin ? `&pin=${encodeURIComponent(syncPin)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        const cloudUpdatedAt = Number(data.updatedAt) || 0;
        const lastLocalUpdate = Number(localStorage.getItem('smart_teacher_last_local_update') || 0);

        // Bảo vệ dữ liệu vừa sửa trên máy tính trong vòng 30 giây tránh bị kéo đè
        if (!isManual && lastLocalUpdate > 0 && cloudUpdatedAt < lastLocalUpdate && (Date.now() - lastLocalUpdate < 30000)) {
          console.log('Skipping cloud pull because local changes are fresher than cloud data');
          setIsSyncing(false);
          return true;
        }

        let cloudEvents: CalendarEventItem[] = Array.isArray(data.events) ? data.events : [];
        let cloudSchedules: ScheduleItem[] = Array.isArray(data.schedules) ? data.schedules : [];

        // If cloud only has schedules, generate the 288 events
        if (cloudEvents.length === 0 && cloudSchedules.length > 0) {
          cloudEvents = generateEventsFromSchedules(cloudSchedules);
        }

        // Cập nhật lớp học, học sinh, điểm danh nếu có từ cloud
        if (Array.isArray(data.classrooms)) {
          const deletedClasses = new Set(getDeletedClassroomIds());
          const cleanClassrooms = data.classrooms.filter((c: any) => !isTestClassroom(c) && !deletedClasses.has(c.id) && !deletedClasses.has((c.name || '').toLowerCase()));
          setClassrooms(cleanClassrooms);
          localStorage.setItem('smart_teacher_classrooms_v1', JSON.stringify(cleanClassrooms));
          if (!selectedRosterClass && cleanClassrooms.length > 0) {
            setSelectedRosterClass(cleanClassrooms[0].name);
          }
        }
        if (Array.isArray(data.students)) {
          const deletedIds = new Set(getDeletedStudentIds());
          const deletedClasses = new Set(getDeletedClassroomIds());
          const cleanStudents = data.students.filter((s: any) => !isTestStudent(s) && !deletedIds.has(s.id) && !deletedClasses.has((s.className || '').toLowerCase()));
          setStudents(cleanStudents);
          localStorage.setItem('smart_teacher_students_v1', JSON.stringify(cleanStudents));
        }
        if (Array.isArray(data.leaveRequests)) {
          setLeaveRequests(data.leaveRequests);
          saveLeaveRequests(data.leaveRequests);
        }
        if (Array.isArray(data.attendanceRecords) && data.attendanceRecords.length > 0) {
          setAttendanceRecords(data.attendanceRecords);
          localStorage.setItem('smart_teacher_attendance_v1', JSON.stringify(data.attendanceRecords));
        }

        if (Array.isArray(data.knowledgeDocs)) {
          mergeKnowledgeDocumentsFromCloud(data.knowledgeDocs, data.deletedKnowledgeDocKeys || []);
          refreshKnowledgeDocs();
        }

        if (cloudEvents.length > 0) {
          // Hợp nhất thông minh với các sự kiện hiện tại trên máy tính theo updatedAt
          const currentSavedEvents: CalendarEventItem[] = (() => {
            try {
              const str = localStorage.getItem('smart_teacher_events');
              return str ? JSON.parse(str) : events;
            } catch (e) {
              return events;
            }
          })();

          const currentSavedSchedules: ScheduleItem[] = (() => {
            try {
              const str = localStorage.getItem('smart_teacher_schedules');
              return str ? JSON.parse(str) : schedules;
            } catch (e) {
              return schedules;
            }
          })();

          const deletedEvents = new Set(getDeletedEventIds());
          const cleanCloudEvents = cloudEvents.filter((e: any) => !isTestSyncData(e) && !deletedEvents.has(String(e.id)));
          const cleanSavedEvents = currentSavedEvents.filter((e: any) => !isTestSyncData(e) && !deletedEvents.has(String(e.id)));
          const mergedEvents = mergeEventsDesktop(cleanSavedEvents, cleanCloudEvents, deletedEvents);
          const mergedSchedules = mergeSchedulesDesktop(currentSavedSchedules, cloudSchedules);

          setEvents(mergedEvents);
          setSchedules(mergedSchedules);
          localStorage.setItem('smart_teacher_events', JSON.stringify(mergedEvents));
          localStorage.setItem('smart_teacher_schedules', JSON.stringify(mergedSchedules));

          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          if (isManual) {
            alert(`🎉 ĐỒNG BỘ 2 CHIỀU THÀNH CÔNG!\n\nĐã tải về đầy đủ ${mergedEvents.length} ca dạy (${mergedSchedules.length} lịch mẫu học kỳ), ${data.students?.length || 0} học sinh và cập nhật tài liệu giáo trình khớp hoàn toàn với điện thoại!\nMã đồng bộ: ${code}`);
          }
          return true;
        } else {
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          if (isManual) {
            alert(`🎉 ĐÃ ĐỒNG BỘ DỮ LIỆU TỪ ĐIỆN THOẠI!\n\nĐã nhận và đồng bộ danh sách lớp, học sinh và ${data.knowledgeDocs?.length || 0} tài liệu giáo trình từ điện thoại!\nMã đồng bộ: ${code}`);
          }
          return true;
        }
      }
    } catch (e) {
      console.error('pullFromCloud error:', e);
      if (isManual) alert('Lỗi kết nối đồng bộ: ' + (e as any)?.message);
    } finally {
      setIsSyncing(false);
    }
    return false;
  };

  // Đồng bộ 2 chiều toàn diện (Two-Way Cloud Sync)
  
  // Phê duyệt đơn xin nghỉ học trực tuyến
  const handleApproveLeaveRequest = async (request: LeaveRequest, teacherNote?: string) => {
    const nowTs = Date.now();
    const updatedRequests = leaveRequests.map(r => {
      if (r.id === request.id) {
        return {
          ...r,
          status: 'APPROVED' as const,
          teacherNote: teacherNote !== undefined && teacherNote.trim() ? teacherNote.trim() : (r.teacherNote || 'Đã duyệt có phép'),
          updatedAt: nowTs
        };
      }
      return r;
    });
    setLeaveRequests(updatedRequests);
    saveLeaveRequests(updatedRequests);

    // Tự động cập nhật điểm danh Nghỉ có phép (ABSENT_EXCUSED)
    const dates: string[] = [];
    try {
      const start = new Date(request.fromDate);
      const end = new Date(request.toDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }
    } catch (_) {
      dates.push(request.fromDate);
    }

    const curAttendance = getStoredAttendance();
    const newAttendance = [...curAttendance];
    dates.forEach(dStr => {
      const existingIdx = newAttendance.findIndex(a => a.studentId === request.studentId && a.date === dStr);
      const noteText = request.reason ? `Nghỉ có phép (Đơn PH: ${request.reason})` : 'Nghỉ có phép (Đơn trực tuyến)';
      if (existingIdx >= 0) {
        newAttendance[existingIdx] = {
          ...newAttendance[existingIdx],
          status: 'ABSENT_EXCUSED',
          note: noteText,
          updatedAt: nowTs
        };
      } else {
        newAttendance.push({
          id: `att_${nowTs}_${Math.random().toString(36).substring(2, 7)}`,
          className: request.className,
          studentId: request.studentId,
          studentName: request.studentName,
          studentCode: request.studentCode,
          date: dStr,
          status: 'ABSENT_EXCUSED',
          note: noteText,
          updatedAt: nowTs
        });
      }
    });

    saveAttendanceRecords(newAttendance);
    setAttendanceRecords(newAttendance);

    setAlertBanner(`🟢 Đã duyệt đơn xin nghỉ học của học sinh ${request.studentName} và tự động cập nhật điểm danh Nghỉ có phép!`);
    setTimeout(() => setAlertBanner(null), 5000);

    // Đẩy ngay lên Cloud để phụ huynh xem được kết quả tức thì
    await pushToCloud(events, schedules, syncCode, false);
  };

  const handleRejectLeaveRequest = async (request: LeaveRequest, teacherNote?: string) => {
    const nowTs = Date.now();
    const updatedRequests = leaveRequests.map(r => {
      if (r.id === request.id) {
        return {
          ...r,
          status: 'REJECTED' as const,
          teacherNote: teacherNote !== undefined && teacherNote.trim() ? teacherNote.trim() : (r.teacherNote || 'Không duyệt'),
          updatedAt: nowTs
        };
      }
      return r;
    });
    setLeaveRequests(updatedRequests);
    saveLeaveRequests(updatedRequests);
    setAlertBanner(`ℹ️ Đã từ chối đơn xin nghỉ học của học sinh ${request.studentName}`);
    setTimeout(() => setAlertBanner(null), 4000);
    await pushToCloud(events, schedules, syncCode, false);
  };

  const handleDeleteLeaveRequest = async (requestId: string) => {
    const updatedRequests = leaveRequests.filter(r => r.id !== requestId);
    setLeaveRequests(updatedRequests);
    saveLeaveRequests(updatedRequests);
    await pushToCloud(events, schedules, syncCode, false);
  };

  const syncBothWays = async (code = syncCode, isManual = true) => {
    if (!code) return;
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      // 1. Kéo cập nhật mới nhất từ đám mây về trước để hợp nhất
      await pullFromCloud(code, false);

      // 2. Sau đó lưu & đẩy dữ liệu đã hợp nhất lên Đám mây
      const savedEventsStr = localStorage.getItem('smart_teacher_events');
      let curEvs: CalendarEventItem[] = events;
      try { if (savedEventsStr) curEvs = JSON.parse(savedEventsStr); } catch (_) {}
      const savedSchsStr = localStorage.getItem('smart_teacher_schedules');
      let curSchs: ScheduleItem[] = schedules;
      try { if (savedSchsStr) curSchs = JSON.parse(savedSchsStr); } catch (_) {}

      await pushToCloud(curEvs, curSchs, code, false);

      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (isManual) {
        alert(`🎉 ĐỒNG BỘ 2 CHIỀU THÀNH CÔNG!\n\n• Đã đồng bộ thông suốt ${curEvs.length} ca dạy giữa Máy tính và Điện thoại.\n• Dữ liệu trên 2 thiết bị hiện tại đã hoàn toàn trùng khớp.\nMã đồng bộ: ${code}`);
      }
    } catch (e) {
      console.error('syncBothWays error:', e);
      if (isManual) alert('Lỗi đồng bộ 2 chiều: ' + (e as any)?.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    setIsClient(true);
    setSelectedDate(todayStr);

    // Tự động quét và thanh lọc dữ liệu kiểm thử (mock / sample test data)
    const rosterPurge = purgeTestRosterData();
    const storedCls = getStoredClassrooms();
    const storedSts = getStoredStudents();
    const storedLeaves = getStoredLeaveRequests();
    setLeaveRequests(storedLeaves);
    setClassrooms(storedCls);
    setStudents(storedSts);
    if (storedCls.length > 0) {
      setSelectedRosterClass(storedCls[0].name);
    }
    const initialTest = countTestData();
    setTestDataCount(initialTest.total);

    let savedCode = localStorage.getItem('smart_teacher_sync_code');
    if (!savedCode || savedCode === '0961364600') {
      savedCode = 'ST-' + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem('smart_teacher_sync_code', savedCode);
    }
    setSyncCode(savedCode);
    setSyncInput(savedCode);

    const savedPin = localStorage.getItem('smart_teacher_sync_pin') || '';
    setSyncPin(savedPin);

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
    let hasLocalData = false;
    if (savedEvStr) {
      try {
        const parsed = JSON.parse(savedEvStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
          hasLocalData = true;
        }
      } catch (e) {}
    }
    if (savedSchStr) {
      try {
        const parsed = JSON.parse(savedSchStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSchedules(parsed);
        }
      } catch (e) {}
    }

    // Pull from cloud immediately
    pullFromCloud(savedCode, false);

    // ================= CHẾ ĐỘ ĐỒNG BỘ MỚI THEO YÊU CẦU =================
    // 1/ Người dùng chủ động tự đồng bộ (bấm "Đồng bộ ngay" hoặc Ctrl+S)
    // 2/ Tự động đồng bộ đúng lúc 00h00 phút hàng ngày (không đồng bộ liên tục 30s để tránh phiền toái)
    const getMsUntilMidnight = (): number => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      return Math.max(1000, nextMidnight.getTime() - now.getTime());
    };

    let midnightInterval: NodeJS.Timeout | null = null;
    const midnightTimer = setTimeout(() => {
      console.log('⏰ Đã đến 00h00: Tự động đồng bộ lịch dạy ngày mới...');
      pullFromCloud(savedCode, false);
      setSelectedDate(new Date().toISOString().split('T')[0]);

      // Thiết lập chu kỳ 24h đồng bộ đúng 00h00 cho các ngày tiếp theo
      midnightInterval = setInterval(() => {
        console.log('⏰ Tự động đồng bộ lúc 00h00 hàng ngày...');
        pullFromCloud(savedCode, false);
        setSelectedDate(new Date().toISOString().split('T')[0]);
      }, 24 * 60 * 60 * 1000);
    }, getMsUntilMidnight());

    // Listen to Desktop App menu "Đồng bộ Đám mây ngay" (Ctrl+S)
    if (typeof window !== 'undefined' && (window as any).desktopAPI?.onSyncTriggered) {
      (window as any).desktopAPI.onSyncTriggered(() => {
        syncBothWays(savedCode, true);
      });
    }

    return () => {
      clearTimeout(midnightTimer);
      if (midnightInterval) clearInterval(midnightInterval);
    };
  }, []);

  // Today's Events
  const todayEvents = useMemo(() => {
    return events
      .filter((e) => (!excludeTestData || !isTestData(e)) && e.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, todayStr, excludeTestData]);

  const todaySessionItems = useMemo(() => {
    if (!todayEvents || todayEvents.length === 0) return undefined;
    const now = new Date();
    const curHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return todayEvents.map(e => {
      const isNow = curHM >= e.startTime && curHM <= e.endTime;
      return {
        id: String(e.id),
        timeRange: `${e.startTime} – ${e.endTime}`,
        subject: e.subject,
        room: e.room || 'Phòng học',
        className: e.className,
        isActive: isNow,
        statusText: isNow ? 'Đang diễn ra' : undefined
      };
    });
  }, [todayEvents]);

  // Selected Date Events
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return todayEvents;
    return events
      .filter((e) => (!excludeTestData || !isTestData(e)) && e.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDate, todayEvents, excludeTestData]);

  // Filtered Events for Calendar Agenda
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (excludeTestData && isTestData(e)) return false;
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
      if (excludeTestData && isTestData(ev)) continue;
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

  // Add New Single or Recurring Event (Tạo Ca Dạy Mới Từ Máy Tính)
  const handleCreateNewEvent = () => {
    const effectiveStartDate = newStartDate || newDate;
    if (!newSubject.trim() || !newClass.trim() || !effectiveStartDate) {
      alert('Vui lòng điền đủ Tên môn học, Lớp giảng dạy và Ngày bắt đầu ca dạy!');
      return;
    }

    if (newCreateRecurring && newEndDate && newEndDate < effectiveStartDate) {
      alert('Ngày kết thúc ca dạy không được trước ngày bắt đầu!');
      return;
    }

    const effectiveDate = effectiveStartDate;
    const newEvId = 'ev_' + Date.now();
    const createdEvent: CalendarEventItem = {
      id: newEvId,
      teachingScheduleId: newCreateRecurring ? Date.now() : undefined,
      title: newSubject.trim(),
      subject: newSubject.trim(),
      className: newClass.trim(),
      room: newRoom.trim() || 'Phòng học bộ môn',
      date: effectiveDate,
      startTime: newStartTime,
      endTime: newEndTime,
      sessionType: newSessionType,
      colorHex: newSessionType === 'Thực hành' ? '#10B981' : '#0066FF',
      notes: newNotes.trim(),
      updatedAt: Date.now()
    };

    let updatedEvents = [createdEvent, ...events.filter(e => e.id !== newEvId)];
    let updatedSchedules = [...schedules];

    if (newCreateRecurring) {
      const dt = new Date(effectiveStartDate + 'T00:00:00');
      const dayOfWeek = dt.getDay() === 0 ? 7 : dt.getDay(); // ISO: 1..7
      const newSchId = 'sch_' + Date.now();
      const finalEndDate = newEndDate || addMonthsToDate(effectiveStartDate, 5);
      const newSchedule: ScheduleItem = {
        id: newSchId,
        subject: newSubject.trim(),
        className: newClass.trim(),
        room: newRoom.trim() || 'Phòng học bộ môn',
        dayOfWeek: dayOfWeek,
        dayOfWeekVn: dayOfWeek === 7 ? 8 : dayOfWeek + 1,
        startTime: newStartTime,
        endTime: newEndTime,
        type: newSessionType === 'Thực hành' ? 'practice' : 'theory',
        sessionType: newSessionType,
        startDate: effectiveStartDate,
        endDate: finalEndDate,
        notes: newNotes.trim(),
        updatedAt: Date.now()
      };
      updatedSchedules = [...updatedSchedules, newSchedule];
      setSchedules(updatedSchedules);
      localStorage.setItem('smart_teacher_schedules', JSON.stringify(updatedSchedules));

      // Generate remaining recurring events for the semester
      const generated = generateEventsFromSchedules([newSchedule]);
      for (const g of generated) {
        if (g.date !== effectiveDate && !updatedEvents.some(e => e.date === g.date && e.startTime === g.startTime && e.className === g.className)) {
          updatedEvents.push(g);
        }
      }
    }

    setEvents(updatedEvents);
    localStorage.setItem('smart_teacher_events', JSON.stringify(updatedEvents));
    pushToCloud(updatedEvents, updatedSchedules, syncCode, false);
    setShowAddEventModal(false);
    setNewSubject('');
    setNewClass('');
    setNewRoom('');
    setNewNotes('');
    alert(`🎉 ĐÃ THÊM CA DẠY THÀNH CÔNG!\n\nLịch dạy (${newCreateRecurring ? `Từ ${effectiveStartDate} đến ${newEndDate || addMonthsToDate(effectiveStartDate, 5)}` : effectiveStartDate}) đã được lưu trên máy tính và tự động đẩy lên Đám mây cho Điện thoại!`);
  };

  // Delete Single Event
  const handleDeleteEvent = (id: string) => {
    if (!confirm('Thầy/Cô có chắc chắn muốn xoá ca dạy này không? Thao tác này sẽ xoá vĩnh viễn trên máy và Đám mây Supabase.')) return;
    recordDeletedEventIds([id]);
    const updated = events.filter((e) => String(e.id) !== String(id));
    setEvents(updated);
    localStorage.setItem('smart_teacher_events', JSON.stringify(updated));
    setAlertBanner('🟢 Đã xoá ca dạy thành công!');
    setTimeout(() => setAlertBanner(null), 3500);
    // Đồng bộ ngay lên Đám mây kèm deletedEventIds để xoá vĩnh viễn
    pushToCloud(updated, schedules, syncCode, false, true);
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

  // Xoá / Gỡ bỏ hoàn toàn giáo án AI khỏi ca dạy
  const handleRemoveEventAttachment = (targetEvent?: CalendarEventItem, targetPkg?: FullLessonPackage | null) => {
    const ev = targetEvent || viewingLessonEvent;
    if (!ev) {
      if (confirm('Thầy/Cô có chắc chắn muốn đóng và xoá gói học liệu này khỏi bộ nhớ tạm không?')) {
        setViewingLessonPackage(null);
        setViewingLessonEvent(null);
        setIsEditingLessonPackage(false);
      }
      return;
    }

    const confirmMsg = `Thầy/Cô có chắc chắn muốn gỡ bỏ hoàn toàn giáo án và bộ học liệu AI khỏi ca dạy '${ev.subject} - Lớp ${ev.className}' không?\n\n• Tệp đính kèm: ${ev.attachmentName || 'Giáo án bài dạy'}\n• Thời gian: ${ev.date} (${ev.startTime} - ${ev.endTime})\n\nHành động này sẽ huỷ đính kèm và làm sạch bộ nhớ cho ca học này.`;
    if (!confirm(confirmMsg)) return;

    // 1. Cập nhật ca dạy trong state và localStorage
    const updatedEvents = events.map(e => {
      if (e.id === ev.id) {
        const copy = { ...e };
        delete copy.attachmentName;
        delete copy.attachmentUrl;
        delete copy.attachmentContent;
        copy.updatedAt = Date.now();
        return copy;
      }
      return e;
    });

    setEvents(updatedEvents);
    localStorage.setItem('smart_teacher_events', JSON.stringify(updatedEvents));

    // 2. Xoá bộ nhớ đệm AI liên quan
    try {
      localStorage.removeItem(`smart_teacher_ai_pack_${ev.id}`);
      localStorage.removeItem(`smart_teacher_ai_plan_${ev.id}`);
      if (ev.attachmentName) {
        localStorage.removeItem(`smart_teacher_ai_pack_${ev.attachmentName}`);
        localStorage.removeItem(`smart_teacher_ai_plan_${ev.attachmentName}`);
      }
    } catch (_) {}

    // 3. Đồng bộ lên Cloud Supabase
    pushToCloud(updatedEvents, schedules, syncCode, false);

    // 4. Đóng modal xem bài giảng
    setViewingLessonPackage(null);
    setViewingLessonEvent(null);
    setIsEditingLessonPackage(false);

    alert(`✅ Đã gỡ bỏ giáo án khỏi ca dạy '${ev.subject} - Lớp ${ev.className}' thành công!`);
  };

  // Khởi động chế độ Chỉnh sửa Giáo án AI
  const handleStartEditLessonPackage = (pkg: FullLessonPackage) => {
    setEditLessonTitle(pkg.lessonTitle || '');
    setEditLessonSubject(pkg.subject || '');
    setEditLessonClass(pkg.className || '');
    if (pkg.standard === 5512 && pkg.plan5512) {
      setEditLessonDuration(pkg.plan5512.durationMinutes || 45);
      setEditKnowledgeObj(pkg.plan5512.objectives.knowledge || '');
      setEditCompetenciesObj(pkg.plan5512.objectives.competencies || '');
      setEditQualitiesObj(pkg.plan5512.objectives.qualities || '');
      setEditTeacherEquip(pkg.plan5512.equipment.teacherEquipment || '');
      setEditStudentEquip(pkg.plan5512.equipment.studentEquipment || '');
      setEditAct1Name(pkg.plan5512.activity1Opening.name || '');
      setEditAct1Content(pkg.plan5512.activity1Opening.content || '');
      setEditAct1Implementation(pkg.plan5512.activity1Opening.implementation || '');
      setEditAct2Name(pkg.plan5512.activity2Knowledge.name || '');
      setEditAct2Content(pkg.plan5512.activity2Knowledge.content || '');
      setEditAct2Implementation(pkg.plan5512.activity2Knowledge.implementation || '');
      setEditAct3Name(pkg.plan5512.activity3Practice.name || '');
      setEditAct3Content(pkg.plan5512.activity3Practice.content || '');
      setEditAct3Implementation(pkg.plan5512.activity3Practice.implementation || '');
      setEditAct4Name(pkg.plan5512.activity4Application.name || '');
      setEditAct4Content(pkg.plan5512.activity4Application.content || '');
      setEditAct4Implementation(pkg.plan5512.activity4Application.implementation || '');
    } else if (pkg.plan2634) {
      setEditLessonDuration(pkg.plan2634.durationMinutes || 180);
      setEditKnowledgeObj(pkg.plan2634.objectives.knowledge || '');
      setEditCompetenciesObj(pkg.plan2634.objectives.skills || '');
      setEditQualitiesObj(pkg.plan2634.objectives.autonomyAndSafety || '');
      setEditTeacherEquip(pkg.plan2634.conditions.equipmentAndMachines || '');
      setEditStudentEquip(pkg.plan2634.conditions.materialsAndWorkpieces || '');
      setEditAct1Name(pkg.plan2634.step1Orientation.name || '');
      setEditAct1Content(pkg.plan2634.step1Orientation.teacherActivity || '');
      setEditAct1Implementation(pkg.plan2634.step1Orientation.studentActivity || '');
      setEditAct2Name(pkg.plan2634.step2Demonstration.name || '');
      setEditAct2Content(pkg.plan2634.step2Demonstration.teacherActivity || '');
      setEditAct2Implementation(pkg.plan2634.step2Demonstration.studentActivity || '');
      setEditAct3Name(pkg.plan2634.step3Practice.name || '');
      setEditAct3Content(pkg.plan2634.step3Practice.teacherActivity || '');
      setEditAct3Implementation(pkg.plan2634.step3Practice.studentActivity || '');
      setEditAct4Name(pkg.plan2634.step4Evaluation.name || '');
      setEditAct4Content(pkg.plan2634.step4Evaluation.teacherActivity || '');
      setEditAct4Implementation(pkg.plan2634.step4Evaluation.studentActivity || '');
    }
    setIsEditingLessonPackage(true);
  };

  // Lưu các nội dung đã chỉnh sửa vào Giáo án AI & Ca dạy
  const handleSaveLessonPackageEdit = () => {
    if (!viewingLessonPackage) return;
    const updatedPkg: FullLessonPackage = JSON.parse(JSON.stringify(viewingLessonPackage));
    updatedPkg.lessonTitle = editLessonTitle.trim() || updatedPkg.lessonTitle;
    updatedPkg.subject = editLessonSubject.trim() || updatedPkg.subject;
    updatedPkg.className = editLessonClass.trim() || updatedPkg.className;

    if (updatedPkg.standard === 5512 && updatedPkg.plan5512) {
      updatedPkg.plan5512.lessonTitle = updatedPkg.lessonTitle;
      updatedPkg.plan5512.subject = updatedPkg.subject;
      updatedPkg.plan5512.grade = updatedPkg.className;
      updatedPkg.plan5512.durationMinutes = Number(editLessonDuration) || 45;
      updatedPkg.plan5512.objectives.knowledge = editKnowledgeObj;
      updatedPkg.plan5512.objectives.competencies = editCompetenciesObj;
      updatedPkg.plan5512.objectives.qualities = editQualitiesObj;
      updatedPkg.plan5512.equipment.teacherEquipment = editTeacherEquip;
      updatedPkg.plan5512.equipment.studentEquipment = editStudentEquip;
      if (editAct1Name) updatedPkg.plan5512.activity1Opening.name = editAct1Name;
      if (editAct1Content) updatedPkg.plan5512.activity1Opening.content = editAct1Content;
      if (editAct1Implementation) updatedPkg.plan5512.activity1Opening.implementation = editAct1Implementation;
      if (editAct2Name) updatedPkg.plan5512.activity2Knowledge.name = editAct2Name;
      if (editAct2Content) updatedPkg.plan5512.activity2Knowledge.content = editAct2Content;
      if (editAct2Implementation) updatedPkg.plan5512.activity2Knowledge.implementation = editAct2Implementation;
      if (editAct3Name) updatedPkg.plan5512.activity3Practice.name = editAct3Name;
      if (editAct3Content) updatedPkg.plan5512.activity3Practice.content = editAct3Content;
      if (editAct3Implementation) updatedPkg.plan5512.activity3Practice.implementation = editAct3Implementation;
      if (editAct4Name) updatedPkg.plan5512.activity4Application.name = editAct4Name;
      if (editAct4Content) updatedPkg.plan5512.activity4Application.content = editAct4Content;
      if (editAct4Implementation) updatedPkg.plan5512.activity4Application.implementation = editAct4Implementation;
    } else if (updatedPkg.plan2634) {
      updatedPkg.plan2634.moduleTitle = updatedPkg.lessonTitle;
      updatedPkg.plan2634.occupation = updatedPkg.subject;
      updatedPkg.plan2634.level = updatedPkg.className;
      updatedPkg.plan2634.durationMinutes = Number(editLessonDuration) || 180;
      updatedPkg.plan2634.objectives.knowledge = editKnowledgeObj;
      updatedPkg.plan2634.objectives.skills = editCompetenciesObj;
      updatedPkg.plan2634.objectives.autonomyAndSafety = editQualitiesObj;
      updatedPkg.plan2634.conditions.equipmentAndMachines = editTeacherEquip;
      updatedPkg.plan2634.conditions.materialsAndWorkpieces = editStudentEquip;
    }

    setViewingLessonPackage(updatedPkg);

    // Cập nhật vào ca dạy và lưu trữ localStorage
    if (viewingLessonEvent) {
      const newHtmlContent = fullPackageToDocHtml(updatedPkg);
      const updatedEvents = events.map(e => {
        if (e.id === viewingLessonEvent.id) {
          return {
            ...e,
            title: updatedPkg.lessonTitle,
            subject: updatedPkg.subject,
            className: updatedPkg.className,
            attachmentContent: newHtmlContent,
            updatedAt: Date.now()
          };
        }
        return e;
      });
      setEvents(updatedEvents);
      localStorage.setItem('smart_teacher_events', JSON.stringify(updatedEvents));

      try {
        localStorage.setItem(`smart_teacher_ai_pack_${viewingLessonEvent.id}`, JSON.stringify(updatedPkg));
        if (viewingLessonEvent.attachmentName) {
          localStorage.setItem(`smart_teacher_ai_pack_${viewingLessonEvent.attachmentName}`, JSON.stringify(updatedPkg));
        }
      } catch (_) {}

      pushToCloud(updatedEvents, schedules, syncCode, false);
    }

    setIsEditingLessonPackage(false);
    alert('🎉 Đã lưu cập nhật giáo án và đồng bộ thành công!');
  };

  // Dọn dẹp & Xoá sạch toàn bộ Dữ liệu thử nghiệm (One-click Purge Test Data)
  const handlePurgeTestData = () => {
    if (!confirm('Thầy/Cô có chắc chắn muốn quét và xoá sạch toàn bộ dữ liệu thử nghiệm (Test Data) khỏi hệ thống không?\n\n• Mọi ca dạy thử, học sinh test và tài liệu mẫu sẽ được lọc sạch hoàn toàn.\n• Dữ liệu thật của Thầy/Cô sẽ được giữ nguyên 100%.\n• Thao tác này sẽ đồng bộ ngay lên Đám mây để làm sạch cả trên điện thoại.')) {
      return;
    }

    const report = cleanAllTestData();

    // Cập nhật lại state trong bộ nhớ
    const rawEv = localStorage.getItem('smart_teacher_events');
    let cleanEvents: CalendarEventItem[] = [];
    try { if (rawEv) cleanEvents = JSON.parse(rawEv); } catch (_) {}
    setEvents(cleanEvents);

    const rawSch = localStorage.getItem('smart_teacher_schedules');
    let cleanSchedules: ScheduleItem[] = [];
    try { if (rawSch) cleanSchedules = JSON.parse(rawSch); } catch (_) {}
    setSchedules(cleanSchedules);

    const rawTasks = localStorage.getItem('smart_teacher_tasks');
    let cleanTasks: TaskItem[] = [];
    try { if (rawTasks) cleanTasks = JSON.parse(rawTasks); } catch (_) {}
    setTasks(cleanTasks);

    setTestDataCount(0);
    setDismissTestBanner(true);

    // Đồng bộ ngay lên Cloud Supabase (với cờ purgeTestData=true)
    pushToCloud(cleanEvents, cleanSchedules, syncCode, false, true);

    alert(`🧹 ĐÃ DỌN DẸP SẠCH DỮ LIỆU THỬ NGHIỆM!\n\n• Ca dạy test đã xoá: ${report.eventsRemoved}\n• Thời khóa biểu test: ${report.schedulesRemoved}\n• Nhắc việc test: ${report.tasksRemoved}\n• Học sinh test: ${report.studentsRemoved}\n• Tài liệu mẫu test: ${report.docsRemoved}\n• Tổng mục đã làm sạch: ${report.totalRemoved}\n\nHệ thống hiện tại hoàn toàn sạch sẽ, sẵn sàng cho giảng dạy và xuất bản!`);
  };

  // Open / Preview Event Attachment - Unified 6-in-1 Teaching Kit Viewer
  const handleOpenEventAttachment = (ev: CalendarEventItem) => {
    if (!ev.attachmentName) return;
    const url = (ev.attachmentUrl || '').trim();
    if (url.startsWith('http://') || url.startsWith('https://') || url.includes('drive.google.com') || url.includes('docs.google.com')) {
      window.open(url, '_blank');
      return;
    }

    // 1. Kiểm tra xem sự kiện đã có gói học liệu FullLessonPackage lưu sẵn chưa
    let pkg: FullLessonPackage | null = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`smart_teacher_ai_pack_${ev.id}`) ||
                       localStorage.getItem(`smart_teacher_ai_pack_${ev.attachmentName}`);
        if (stored) {
          pkg = JSON.parse(stored);
        }
      } catch (_) {}
    }

    // Nếu attachmentName là file giáo án AI (CV 5512, CV 2634, GiaoAn_, HoSo_, attached://) hoặc người dùng muốn mở bộ học liệu ca dạy
    const isAiLessonDoc = ev.attachmentName.includes('5512') ||
                          ev.attachmentName.includes('2634') ||
                          ev.attachmentName.startsWith('GiaoAn_') ||
                          ev.attachmentName.startsWith('HoSo_') ||
                          ev.attachmentUrl?.startsWith('attached://') ||
                          (!ev.attachmentName.toLowerCase().endsWith('.pdf') && !ev.attachmentName.toLowerCase().endsWith('.xlsx'));

    if (isAiLessonDoc) {
      if (!pkg) {
        // Làm sạch tên bài học, xử lý các ký tự replacement (e.g. "Công ngh\uFFFD\uFFFD\uFFFD" -> "Công nghệ")
        const rawTitle = ev.notes || ev.title || 'Bài 1. Thiết kế và Công nghệ';
        const cleanTitle = rawTitle
          .replace(/[\uFFFD\?]+/g, 'ệ')
          .replace(/^[^\w\s\u00C0-\u1EF9]+/, '')
          .trim();

        const is2634 = ev.attachmentName.includes('2634') || ev.sessionType === 'Thực hành';
        pkg = generateComprehensiveLessonPlanPackage({
          lessonTitle: cleanTitle,
          subject: ev.subject || 'Công nghệ',
          className: ev.className || '10A1',
          sessionInfo: `${ev.date} (${ev.startTime || 'Ca dạy'} - ${ev.endTime || ''})`,
          standard: is2634 ? 2634 : 5512,
          durationMinutes: is2634 ? 3 : 45,
          customRequirements: ev.notes || undefined
        });

        // Lưu lại để các lần sau mở siêu tốc
        try {
          localStorage.setItem(`smart_teacher_ai_pack_${ev.id}`, JSON.stringify(pkg));
          localStorage.setItem(`smart_teacher_ai_pack_${ev.attachmentName}`, JSON.stringify(pkg));
        } catch (_) {}
      }

      setViewingLessonPackage(pkg);
      setViewingLessonEvent(ev);
      setLessonPackageActiveTab('plan');
      setLessonPackageFullScreen(false);
      return;
    }

    // Nếu là tệp thông thường (PDF, DOCX tải lên thủ công), mở qua Document Viewer chung:
    let realContent = ev.attachmentContent || '';
    if (!realContent && typeof window !== 'undefined') {
      try {
        realContent = localStorage.getItem(`smart_teacher_ai_plan_${ev.id}`) ||
                      localStorage.getItem(`smart_teacher_ai_plan_${ev.attachmentName}`) || '';
      } catch (_) {}
    }
    if (!realContent) {
      const matchDoc = knowledgeDocs.find(d => 
        d.fileName === ev.attachmentName || 
        d.id === `event-att-${ev.id}` || 
        d.id === `kb_giaoan_${ev.id}` ||
        (ev.attachmentName && d.title && d.title.toLowerCase().includes(ev.attachmentName.toLowerCase().replace('.doc', '').replace('giaoan_5512_', '').replace(/_/g, ' ')))
      );
      if (matchDoc && matchDoc.content) {
        realContent = matchDoc.content;
      }
    }
    if (!realContent) {
      realContent = `KẾ HOẠCH BÀI DẠY & HỌC LIỆU\n\n• Tên bài giảng: ${ev.title}\n• Môn học: ${ev.subject}\n• Lớp giảng dạy: ${ev.className}\n• Thời gian: ${ev.date} (${ev.startTime || 'Ca dạy'} - ${ev.endTime || ''})\n• Phòng học: ${ev.room}\n• Tệp đính kèm: ${ev.attachmentName}\n\n${ev.notes ? `Ghi chú chuyên môn:\n${ev.notes}\n\n` : ''}Tài liệu này đã được lưu trữ và liên kết với lịch dạy của Thầy/Cô.`;
    }

    setKbViewingDoc({
      id: `event-att-${ev.id}`,
      title: `Tài liệu: ${ev.notes ? ev.notes.replace(/[\uFFFD\?]+/g, 'ệ') : ev.title} - Lớp ${ev.className}`,
      code: `GA-${ev.className || '5512'}`,
      category: 'GIAO_TRINH',
      subject: ev.subject,
      targetLevel: ev.className,
      content: realContent,
      fileName: ev.attachmentName,
      fileType: ev.attachmentName.split('.').pop()?.toLowerCase() || 'doc',
      isActive: true,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: ev.updatedAt || Date.now()
    });
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

  // AI Chat Send with 7 Pedagogical Capabilities
  const handleSendAiMessage = async (customPrompt?: string, overrideMode?: AiPedagogyMode) => {
    const userText = (customPrompt || aiInput).trim();
    if (!userText) return;
    if (!customPrompt) setAiInput('');
    const targetMode = overrideMode || chatSelectedMode;

    const newMsgs = [...chatMessages, { role: 'user' as const, text: userText, mode: targetMode }];
    setChatMessages(newMsgs);
    setIsAiLoading(true);

    try {
      setTimeout(() => {
        const resp = processPedagogicalAiQuery(userText, targetMode, knowledgeDocs);
        setChatMessages([
          ...newMsgs,
          {
            role: 'ai',
            text: resp.text,
            mode: resp.mode,
            svgContent: resp.svgContent,
            mermaidCode: resp.mermaidCode,
            wordExportableHtml: resp.wordExportableHtml,
            sourceReferences: resp.sourceReferences
          }
        ]);
        setIsAiLoading(false);
      }, 650);
    } catch (e) {
      setIsAiLoading(false);
    }
  };

  const handleCopyChatText = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setChatCopiedId(id);
      setTimeout(() => setChatCopiedId(null), 2000);
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


  const getAttendanceBadgeForEvent = (ev: CalendarEventItem) => {
    const classStudents = getStudentsByClass(ev.className);
    if (classStudents.length === 0) return null;
    const recs = getAttendanceForSession(ev.date, ev.className, ev.id);
    if (recs.length === 0) return null;
    const present = recs.filter(r => r.status === 'PRESENT').length;
    return `${present}/${classStudents.length}`;
  };

  if (!isClient) return null;

  const todayDayInfo = getDayInfo(todayStr);
  const selectedDayInfo = getDayInfo(selectedDate);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. TOP HEADER (CHỈ HIỂN THỊ KHI Ở CÁC TAB CON ĐỂ ĐIỀU HƯỚNG MƯỢT MÀ) */}
      {activeTab !== 'eduviet' && (
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5 shadow-xs transition-colors">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Brand Logo & Back to EduViet Home */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('eduviet')}
                className="flex items-center gap-2 group cursor-pointer text-left"
                title="Quay lại Trang chủ EduViet"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-2 shadow-md shadow-indigo-950/10 flex items-center justify-center border border-indigo-400/30">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1 leading-none">
                    <span className="text-xl font-black tracking-tight text-rose-600">Edu</span>
                    <span className="text-xl font-black tracking-tight text-emerald-600">Viet</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold group-hover:text-rose-600 transition-colors flex items-center gap-1 mt-0.5">
                    <span>← Trang chủ</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400 font-normal">{todayDayInfo.dayName}, {todayStr.split('-').reverse().join('/')}</span>
                  </p>
                </div>
              </button>
            </div>

            {/* Actions: Sync, Zalo Share, Leave Requests */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full px-3 py-1.5 flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </span>
                <span className="font-semibold text-slate-700">
                  {events.length > 0 ? `${events.length} ca dạy` : 'Đang tải...'}
                </span>
                <span className="text-slate-300">|</span>
                <button onClick={() => setShowSyncModal(true)} className="text-indigo-600 hover:text-indigo-700 font-mono font-bold cursor-pointer" title="Cài đặt mã ghép nối">Mã: {syncCode}</button>
              </div>

              <button
                onClick={() => syncBothWays(syncCode, true)}
                disabled={isSyncing}
                title="Đồng bộ hai chiều: Gửi lịch máy tính lên đám mây và nhận lịch mới từ điện thoại"
                className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ 2 chiều'}</span>
              </button>

              <button
                onClick={() => setShowPortalShareModal(true)}
                className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Chia sẻ link & mã QR Cổng Học sinh & Phụ huynh vào nhóm Zalo"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Gửi Zalo</span>
              </button>

              {(() => {
                const pendingCount = leaveRequests.filter(r => r.status === 'PENDING').length;
                return (
                  <button
                    onClick={() => setShowLeaveRequestsModal(true)}
                    className={`relative px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pendingCount > 0 
                        ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    title="Xem và xét duyệt đơn xin nghỉ học trực tuyến từ phụ huynh"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Đơn xin nghỉ</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })()}

              {/* Theme Toggle Button (Light / Dark) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all cursor-pointer shadow-xs"
                title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
                aria-label="Chuyển chế độ sáng/tối"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Alert Banner */}
      {alertBanner && (
        <div className="bg-emerald-600 text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{alertBanner}</span>
        </div>
      )}

      {/* 2. NAVIGATION BAR (EDUVIET UNIFIED LIGHT TABS - CHỈ HIỆN KHI Ở TAB CON) */}
      {activeTab !== 'eduviet' && (
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 sticky top-14 z-30 px-4 shadow-xs transition-colors">
          <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('eduviet')}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-rose-600" />
              <span>Trang chủ EduViet</span>
            </button>

            <button
              onClick={() => setActiveTab('today')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hôm nay</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'today' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {todayEvents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch dạy</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'calendar' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Lớp & Học Sinh</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'roster' ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Sổ Báo Giảng</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Soạn Giáo Án AI</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Cài đặt</span>
            </button>
          </div>
        </nav>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <main className={activeTab === "eduviet" ? "w-full" : "flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6"}>

        {/* ================= TAB 0: EDUVIET TRANG CHỦ (VIETNAMESE DESIGN) ================= */}
        {activeTab === 'eduviet' && (
          <EduVietHomeView
            theme={theme}
            onToggleTheme={toggleTheme}
            teacherName={selectedRosterClass ? `GVCN Lớp ${selectedRosterClass}` : "Nguyễn Minh Anh"}
            schoolName="Trường THPT Việt Nam"
            classNameOrSubject={selectedRosterClass ? `Lớp ${selectedRosterClass}` : "Lớp 10A1"}
            syncCode={syncCode}
            leaveRequestCount={leaveRequests.filter(r => r.status === 'PENDING').length}
            todaySessions={todaySessionItems}
            progressPercent={(() => {
              if (todayEvents.length === 0) return 75;
              const now = new Date();
              const curHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              const done = todayEvents.filter(e => e.endTime < curHM).length;
              return Math.round((done / todayEvents.length) * 100) || 75;
            })()}
            stats={(() => {
              const now = new Date();
              const curHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              const done = todayEvents.filter(e => e.endTime < curHM).length;
              return {
                lessons: `${done}/${todayEvents.length || 10}`,
                exercises: `${Math.min(6, todayEvents.length || 6)}/8`,
                topics: '4/5'
              };
            })()}
            onSelectAction={(actionId) => {
              if (actionId === 'calendar') setActiveTab('calendar');
              else if (actionId === 'lesson_package') { setActiveTab('ai'); setAiSubTab('planner'); }
              else if (actionId === 'ai_plan') { setActiveTab('ai'); setAiSubTab('planner'); }
              else if (actionId === 'stats') setActiveTab('report');
              else if (actionId === 'leave_requests') setShowLeaveRequestsModal(true);
              else if (actionId === 'knowledge') { setActiveTab('ai'); setAiSubTab('knowledge'); }
              else if (actionId === 'attendance') setActiveTab('roster');
              else if (actionId === 'share_portal') setShowPortalShareModal(true);
              else if (actionId === 'profile') setActiveTab('settings');
            }}
            onOpenSync={() => setShowSyncModal(true)}
            onOpenPortalShare={() => setShowPortalShareModal(true)}
            onOpenNotifications={() => setShowLeaveRequestsModal(true)}
            onSyncBothWays={() => syncBothWays(syncCode, true)}
            isSyncing={isSyncing}
            totalEventsCount={events.length}
            onViewAllSessions={() => setActiveTab('today')}
            onSelectSession={(session) => {
              const found = events.find(e => String(e.id) === session.id);
              if (found) setEditingEvent(found);
            }}
          />
        )}

        {/* ================= TAB 1: HÔM NAY (TODAY SCREEN) ================= */}
        {activeTab === 'today' && (
          <div className="space-y-6 animate-fade-in">
            {/* Teacher Command Center (Trung tâm điều hành hôm nay) */}
            <TodayCommandCenter
              todayEvents={todayEvents.map(e => ({
                id: e.id,
                title: e.title || e.subject,
                subject: e.subject,
                className: e.className,
                room: e.room,
                startTime: e.startTime,
                endTime: e.endTime,
                date: e.date,
                sessionType: e.sessionType,
                notes: e.notes
              }))}
              allTodayCount={todayEvents.length}
              completedCount={todayEvents.filter(e => {
                const nowM = (new Date()).getHours() * 60 + (new Date()).getMinutes();
                const [eh, em] = (e.endTime || '17:00').split(':').map(Number);
                return nowM > (eh * 60 + em);
              }).length}
              onQuickAttendance={(cl) => {
                const targetEv = todayEvents.find(e => e.id === cl.id) || todayEvents[0];
                if (targetEv) openAttendanceModal(targetEv);
              }}
              onOpenPedagogyAI={(subj) => {
                setActiveTab('ai');
              }}
              onSwitchToCalendar={() => setActiveTab('calendar')}
            />
            {/* Pedagogical Motivation Card */}
            <div className="bg-gradient-to-r from-amber-50/80 via-rose-50/50 to-orange-50/80 border border-amber-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden text-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
                  <Sun className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Lời chúc sư phạm hôm nay
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                      {todayDayInfo.dayName}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed italic">
                    "{quote}"
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time Countdown Banner */}
            {nextSession && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-xs ${
                nextSession.status === 'ongoing'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    nextSession.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {nextSession.status === 'ongoing' ? 'Đang trong tiết dạy' : `Sắp vào lớp (Còn ${nextSession.diffMinutes} phút)`}
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {nextSession.event.subject} • Lớp {nextSession.event.className} ({nextSession.event.room})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-slate-900">
                    {nextSession.event.startTime} - {nextSession.event.endTime}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Teaching Timeline (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-rose-600" />
                    <span>Lịch giảng dạy hôm nay ({todayEvents.length} ca dạy)</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const initDate = todayStr || new Date().toISOString().slice(0, 10);
                        setNewDate(initDate);
                        setNewStartDate(initDate);
                        setNewEndDate(addMonthsToDate(initDate, 5));
                        setNewCreateRecurring(true);
                        setShowAddEventModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Ca Dạy</span>
                    </button>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      Chuẩn thời gian ISO & Giờ Việt Nam
                    </span>
                  </div>
                </div>

                {todayEvents.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center space-y-3 shadow-sm">
                    <Coffee className="w-12 h-12 text-slate-400 mx-auto" />
                    <p className="text-base font-semibold text-slate-800">Hôm nay Thầy/Cô không có lịch dạy trên lớp!</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                          className="bg-white hover:border-rose-300 border border-slate-200/80 rounded-2xl p-4 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4">
                            {/* Period Number / Time badge */}
                            <div className="text-center shrink-0 w-16 bg-slate-50 border border-slate-200 rounded-xl p-2">
                              <span className="text-xs font-bold text-slate-500">Ca #{index + 1}</span>
                              <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">{ev.startTime}</p>
                              <p className="text-xs text-slate-500 font-mono">{ev.endTime}</p>
                            </div>

                            {/* Session Details */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-bold text-slate-900">{ev.subject}</h4>
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                                    isPractice
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {ev.sessionType}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-slate-600">
                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                  <Users className="w-3.5 h-3.5 text-blue-600" /> Lớp: {ev.className}
                                </span>
                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                  <MapPin className="w-3.5 h-3.5 text-rose-600" /> Phòng: {ev.room}
                                </span>
                              </div>

                              {ev.notes && (
                                <p className="text-xs text-amber-950 font-medium bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 flex items-start gap-1.5 shadow-xs">
                                  <span className="font-bold text-amber-800 shrink-0">📝 Ghi chú:</span>
                                  <span className="text-slate-800 font-medium">{ev.notes}</span>
                                </p>
                              )}

                              {ev.attachmentName && (
                                <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-1 font-medium">
                                  <Paperclip className="w-3 h-3 text-rose-600 shrink-0" />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEventAttachment(ev);
                                    }}
                                    className="underline cursor-pointer hover:text-rose-700 text-left truncate max-w-[200px]"
                                    title="Nhấn để xem trước tài liệu đính kèm này"
                                  >
                                    {ev.attachmentName}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons (Unified: Sửa, Xoá, Đính kèm file) */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">

                            <button
                              onClick={() => openAttendanceModal(ev)}
                              title="Điểm danh 1-chạm & Tích điểm nề nếp cho ca dạy này"
                              className="p-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Điểm danh</span>
                              {getAttendanceBadgeForEvent(ev) && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                  {getAttendanceBadgeForEvent(ev)}
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setAttachingEvent(ev);
                                setAttachFileName(ev.attachmentName || '');
                                setAttachFileUrl(ev.attachmentUrl || '');
                              }}
                              title="Đính kèm file giáo án"
                              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Paperclip className="w-4 h-4 text-slate-500" />
                              <span className="hidden sm:inline">File</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(ev)}
                              title="Chỉnh sửa ca dạy này"
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Edit3 className="w-4 h-4 text-blue-600" />
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              title="Xoá ca dạy"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all text-xs cursor-pointer shadow-xs"
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
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Trợ lý An Toàn & Rủi Ro Lịch Dạy</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Không phát hiện trùng lặp phòng học hay chồng chéo thời gian hôm nay.</span>
                    </div>
                    {todayEvents.some((e) => e.sessionType.includes('hành')) && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Hôm nay có tiết thực hành xưởng: Thầy/Cô chú ý nhắc nhở học sinh đeo kính bảo hộ và kiểm tra phôi mẫu.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tasks Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-600" />
                      <span>Việc cần làm hôm nay</span>
                    </h4>
                    <button
                      onClick={handleAddTask}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
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
                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs font-medium">
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500/20 cursor-pointer w-4 h-4"
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
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-600" />
                    <span>Lịch trình Giảng dạy Chi tiết ({events.length} ca dạy toàn học kỳ)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đồng bộ 2 chiều chuẩn xác từng ngày, từng phòng học và hình thức lý thuyết/thực hành
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const initDate = selectedDate || todayStr || new Date().toISOString().slice(0, 10);
                      setNewDate(initDate);
                      setNewStartDate(initDate);
                      setNewEndDate(addMonthsToDate(initDate, 5));
                      setNewCreateRecurring(true);
                      setShowAddEventModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Ca Dạy Mới</span>
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setCalendarViewMode('day')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        calendarViewMode === 'day' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Xem theo ngày
                    </button>
                    <button
                      onClick={() => setCalendarViewMode('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        calendarViewMode === 'all' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Xem toàn bộ 288 ca
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                {/* Date Picker */}
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-medium">Chọn ngày cụ thể:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono shadow-xs"
                  />
                </div>

                {/* Subject Dropdown */}
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-medium">Lọc môn học:</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-xs"
                  >
                    <option value="ALL">Tất cả môn ({subjectList.length} môn)</option>
                    {subjectList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Class Dropdown */}
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-medium">Lọc lớp:</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-xs"
                  >
                    <option value="ALL">Tất cả lớp ({classList.length} lớp)</option>
                    {classList.map((c) => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>

                {/* Search Box */}
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-medium">Tìm kiếm nhanh:</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tên môn, lớp, phòng..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* List of Filtered Events */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  Hiển thị: <strong className="text-slate-900">{filteredEvents.length}</strong> ca dạy phù hợp
                </span>
                {calendarViewMode === 'day' && (
                  <span className="text-rose-600 font-semibold">
                    Đang xem ngày: {selectedDayInfo.dayName}, {selectedDate.split('-').reverse().join('/')}
                  </span>
                )}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-2 shadow-sm">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-800">Không tìm thấy ca dạy nào phù hợp với bộ lọc!</p>
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
                        className={`bg-white border rounded-2xl p-4 transition-all hover:border-rose-300 shadow-sm flex flex-col justify-between gap-3 ${
                          isPast ? 'border-slate-200/60 opacity-80' : 'border-slate-200/90'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                                  {dayInfo.dayName}
                                </span>
                                <span className="text-xs font-mono text-slate-700 font-semibold">
                                  {ev.date.split('-').reverse().join('/')}
                                </span>
                                {isPast && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                    Đã dạy
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{ev.subject}</h4>
                            </div>

                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0 border ${
                                isPractice
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {ev.sessionType}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs text-slate-700 pt-1">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                              <span className="text-slate-500 block text-[10px]">Giờ dạy</span>
                              <span className="font-mono font-bold text-slate-900">{ev.startTime} - {ev.endTime}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                              <span className="text-slate-500 block text-[10px]">Lớp học</span>
                              <span className="font-bold text-slate-900">{ev.className}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                              <span className="text-slate-500 block text-[10px]">Phòng dạy</span>
                              <span className="font-bold text-slate-900">{ev.room}</span>
                            </div>
                          </div>

                          {ev.notes && (
                            <p className="text-xs text-amber-950 font-medium bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 flex items-start gap-1.5 shadow-xs">
                              <span className="font-bold text-amber-800 shrink-0">📝</span>
                              <span className="text-slate-800 font-medium line-clamp-2">{ev.notes}</span>
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                          {ev.attachmentName ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEventAttachment(ev)}
                                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 truncate max-w-[150px] text-xs cursor-pointer underline font-medium text-left"
                                title="Bấm để xem trước toàn bộ học liệu 6-in-1"
                              >
                                <Paperclip className="w-3 h-3 shrink-0" /> {ev.attachmentName}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveEventAttachment(ev);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Gỡ bỏ giáo án khỏi ca dạy này"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">Chưa đính kèm giáo án</span>
                          )}

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setAttachingEvent(ev);
                                setAttachFileName(ev.attachmentName || '');
                                setAttachFileUrl(ev.attachmentUrl || '');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer shadow-xs"
                            >
                              File
                            </button>
                            <button
                              onClick={() => handleOpenEdit(ev)}
                              className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold cursor-pointer shadow-xs"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-medium cursor-pointer shadow-xs"
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

        
        {/* ================= TAB 2.5: LỚP HỌC & DANH SÁCH HỌC SINH (ROSTER & KUDOS) ================= */}
        {activeTab === 'roster' && (
          <div className="space-y-6 animate-fade-in">
            {/* Hidden File Input for Excel / Word / CSV Upload */}
            <input
              type="file"
              ref={rosterFileInputRef}
              onChange={handleRosterFileUpload}
              accept=".xlsx,.xls,.csv,.docx,.txt"
              className="hidden"
            />

            {/* Header / Intro Card */}
            <div className="bg-gradient-to-r from-rose-50 via-sky-50/40 to-amber-50/60 border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Quản Lý Lớp Học & Danh Sách Học Sinh (Teacher Cockpit)
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-semibold">
                      Phase 1
                    </span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Quản lý danh sách lớp, nề nếp, điểm danh 1-chạm theo ca dạy và khen thưởng tích cực (Kudos) đồng bộ Đám mây.
                  </p>
                </div>
              </div>

              {/* Action Buttons with Prominent File Upload */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* 1. NÚT TẢI FILE DANH SÁCH CHÍNH (EXCEL, WORD, CSV) */}
                <button
                  onClick={() => rosterFileInputRef.current?.click()}
                  disabled={isImportingFile}
                  title="Tải lên tệp danh sách học sinh từ máy tính (.xlsx, .xls, .csv, .docx)"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Upload className={`w-4 h-4 ${isImportingFile ? 'animate-bounce' : ''}`} />
                  <span>{isImportingFile ? 'Đang đọc tệp...' : 'Tải file Excel / Word (.xlsx, .docx)'}</span>
                </button>

                {/* 2. Thêm học sinh thủ công */}
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm học sinh</span>
                </button>

                {/* 3. Dán danh sách nhanh */}
                <button
                  onClick={() => setShowImportRosterModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  <span>Dán văn bản</span>
                </button>

                {/* 4. Thêm Lớp mới */}
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Thêm Lớp</span>
                </button>
              </div>
            </div>

            {/* Class Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {classrooms.map(c => {
                const isSelected = selectedRosterClass.toLowerCase() === c.name.toLowerCase();
                const classStudentCount = students.filter(s => s.className.toLowerCase() === c.name.toLowerCase()).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedRosterClass(c.name)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isSelected ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {classStudentCount} HS
                    </span>
                    {c.grade && <span className="text-[10px] opacity-70">({c.grade})</span>}
                  </button>
                );
              })}
            </div>

            {/* Class Overview Statistics & Top Kudos Podium */}
            {(() => {
              const currentClassStudents = students.filter(s => s.className.toLowerCase() === selectedRosterClass.toLowerCase());
              const totalKudos = currentClassStudents.reduce((sum, s) => sum + (s.kudosPoints || 0), 0);
              const sortedByKudos = [...currentClassStudents].sort((a, b) => (b.kudosPoints || 0) - (a.kudosPoints || 0));
              const topThree = sortedByKudos.slice(0, 3);

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stat Card 1: Total Students */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Sĩ số lớp {selectedRosterClass}</p>
                      <p className="text-2xl font-black text-slate-900">{currentClassStudents.length} <span className="text-xs font-normal text-slate-500">học sinh</span></p>
                    </div>
                  </div>

                  {/* Stat Card 2: Total Kudos Points */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Điểm thi đua nề nếp (Kudos)</p>
                      <p className="text-2xl font-black text-amber-600">+{totalKudos} <span className="text-xs font-normal text-slate-500">điểm tích lũy</span></p>
                    </div>
                  </div>

                  {/* Stat Card 3: Top Students Honor Podium */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-bold text-slate-700">Gương mẫu tuần này</span>
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {topThree.map((st, i) => (
                        <div key={st.id} className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5 shrink-0">
                          <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                          <span className="font-semibold text-slate-800">{st.fullName.split(' ').slice(-2).join(' ')}</span>
                          <span className="text-amber-600 font-bold">+{st.kudosPoints}đ</span>
                        </div>
                      ))}
                      {topThree.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Chưa có dữ liệu học sinh</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Students Table Section */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              {/* Search & Action Bar */}
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="Tìm theo tên, mã HS..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedRosterClass && (
                    <>
                      <button
                        onClick={() => {
                          if (confirm(`Thầy/Cô có chắc muốn xóa toàn bộ học sinh của lớp ${selectedRosterClass}? Thao tác này sẽ xóa vĩnh viễn cả trên máy và Cloud.`)) {
                            const updated = deleteStudentsByClass(selectedRosterClass);
                            setStudents(updated);
                            pushToCloud(events, schedules, syncCode, false, true);
                            setAlertBanner(`🟢 Đã xóa toàn bộ học sinh lớp ${selectedRosterClass} và đồng bộ lên Đám mây!`);
                            setTimeout(() => setAlertBanner(null), 4000);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        title="Xóa toàn bộ học sinh của lớp này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa hết HS lớp</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Thầy/Cô có chắc muốn xóa lớp ${selectedRosterClass} và toàn bộ học sinh? Thao tác này sẽ xóa vĩnh viễn cả trên máy và Cloud.`)) {
                            const updatedClasses = deleteClassroom(selectedRosterClass);
                            setClassrooms(updatedClasses);
                            const updatedStudents = deleteStudentsByClass(selectedRosterClass);
                            setStudents(updatedStudents);
                            setSelectedRosterClass(updatedClasses.length > 0 ? updatedClasses[0].name : '');
                            pushToCloud(events, schedules, syncCode, false, true);
                            setAlertBanner(`🟢 Đã xóa lớp ${selectedRosterClass} thành công!`);
                            setTimeout(() => setAlertBanner(null), 4000);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        title="Xóa lớp này khỏi hệ thống"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Lớp</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => rosterFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Nạp file danh sách lớp</span>
                  </button>
                  <span className="text-xs text-slate-500 font-mono pl-2">
                    {students.filter(s => s.className.toLowerCase() === selectedRosterClass.toLowerCase()).length} học sinh
                  </span>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 w-12 text-center">STT</th>
                      <th className="py-3 px-4 w-28">Mã HS</th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4 w-20 text-center">Giới tính</th>
                      <th className="py-3 px-4 w-36 text-center">Nề nếp (Kudos)</th>
                      <th className="py-3 px-4">Khen thưởng 1-chạm</th>
                      <th className="py-3 px-4 w-36">SĐT Phụ huynh</th>
                      <th className="py-3 px-4 w-20 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {students
                      .filter(s => s.className.toLowerCase() === selectedRosterClass.toLowerCase())
                      .filter(s => !rosterSearch.trim() || s.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) || s.studentCode.toLowerCase().includes(rosterSearch.toLowerCase()))
                      .map((st, idx) => (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-rose-600">{st.studentCode}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                st.gender === 'Nữ' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {st.fullName.trim().charAt(st.fullName.trim().lastIndexOf(' ') + 1) || 'A'}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{st.fullName}</p>
                                {st.notes && <p className="text-[10.5px] text-amber-950 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1 font-medium shadow-xs"><span>📝</span> <span>{st.notes}</span></p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              st.gender === 'Nữ' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {st.gender}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold font-mono">
                              ⭐ +{st.kudosPoints || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const updated = addKudosToStudent(st.id, 1, 'Phát biểu hăng hái');
                                  setStudents(updated);
                                }}
                                title="Thưởng +1 điểm: Phát biểu xây dựng bài"
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                              >
                                +1 Phát biểu
                              </button>
                              <button
                                onClick={() => {
                                  const updated = addKudosToStudent(st.id, 2, 'Làm bài tập tốt');
                                  setStudents(updated);
                                }}
                                title="Thưởng +2 điểm: Bài tập / Thao tác kỹ thuật tốt"
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                              >
                                +2 Bài tốt
                              </button>
                              <button
                                onClick={() => {
                                  const updated = addKudosToStudent(st.id, 2, 'Thực hiện chuẩn 5S');
                                  setStudents(updated);
                                }}
                                title="Thưởng +2 điểm: Vệ sinh xưởng & An toàn 5S"
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
                              >
                                +2 5S Xưởng
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono">
                            {st.parentPhone ? (
                              <a
                                href={`tel:${st.parentPhone}`}
                                className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                📞 {st.parentPhone}
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">--</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                if (confirm(`Xóa học sinh ${st.fullName} khỏi danh sách? Thao tác này sẽ xóa vĩnh viễn trên máy và Đám mây Supabase.`)) {
                                  const updated = deleteStudent(st.id);
                                  setStudents(updated);
                                  pushToCloud(events, schedules, syncCode, false, true);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {students.filter(s => s.className.toLowerCase() === selectedRosterClass.toLowerCase()).length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <div className="max-w-md mx-auto space-y-3">
                            <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
                            <p className="font-semibold text-slate-800 text-sm">Lớp {selectedRosterClass} chưa có danh sách học sinh</p>
                            <p className="text-xs text-slate-500">
                              Thầy/Cô có thể bấm tải file Excel (.xlsx, .xls) hoặc file Word (.docx) của trường để hệ thống tự động nhận diện danh sách:
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-2">
                              <button
                                onClick={() => rosterFileInputRef.current?.click()}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Tải file Excel / Word (.xlsx, .docx)</span>
                              </button>
                              <button
                                onClick={() => setShowImportRosterModal(true)}
                                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold cursor-pointer shadow-xs"
                              >
                                Dán văn bản
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ================= TAB 3: SỔ BÁO GIẢNG (PEDAGOGICAL REPORT) ================= */}
        {activeTab === 'report' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Export actions */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Sổ Báo Giảng & Thống Kê Tiến Độ Giảng Dạy</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp {events.length} ca dạy • Tiến độ từng môn học & lớp theo chuẩn báo cáo nhà trường
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Xuất Excel / CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> In Báo Cáo
                </button>
              </div>
            </div>

            {/* Summary Statistics Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
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
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportStats.map((st, idx) => {
                      const pct = Math.round((st.done / (st.total || 1)) * 100);
                      return (
                        <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                          <td className="p-3.5 font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{st.subject}</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                              {st.className}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600">{st.room}</td>
                          <td className="p-3.5 text-center font-bold text-slate-900 font-mono">{st.total}</td>
                          <td className="p-3.5 text-center font-bold text-emerald-600 font-mono">{st.done}</td>
                          <td className="p-3.5 text-center font-bold text-amber-600 font-mono">{st.remaining}</td>
                          <td className="p-3.5 text-center">
                            <span className="text-blue-600 font-mono font-medium">{st.theory} LT</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-emerald-600 font-mono font-medium">{st.practice} TH</span>
                          </td>
                          <td className="p-3.5">
                            <div className="w-32 mx-auto space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{pct}%</span>
                                <span>{st.done}/{st.total}</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                <div
                                  className="bg-gradient-to-r from-rose-500 to-emerald-500 h-full rounded-full transition-all"
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

        {/* ================= TAB 4: TRỢ LÝ AI SƯ PHẠM (GENERATIVE AI) ================= */}
        {activeTab === 'ai' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50/80 border border-rose-200/80 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-rose-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>Trợ Lý Sư Phạm Trí Tuệ Nhân Tạo (Generative AI)</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        Made by Huy Technology AI
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Soạn Kế hoạch bài dạy chuẩn Công văn 5512 & 2634, xây dựng Ma trận đề thi 4 mức độ và xuất file Word (.doc) 100% offline
                    </p>
                  </div>
                </div>

                {/* Sub-tab navigation */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
                  <button
                    onClick={() => setAiSubTab('planner')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      aiSubTab === 'planner'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Soạn Giáo Án (5512/2634)</span>
                  </button>
                  <button
                    onClick={() => setAiSubTab('exam')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      aiSubTab === 'exam'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Đề Thi & Ma Trận</span>
                  </button>
                  <button
                    onClick={() => setAiSubTab('chat')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      aiSubTab === 'chat'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tư Vấn Chat AI</span>
                  </button>
                  <button
                    onClick={() => setAiSubTab('knowledge')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      aiSubTab === 'knowledge'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>📚 Kho Tư Liệu Chuẩn</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ================= SUB-TAB 1: SOẠN GIÁO ÁN (CV 5512 & CV 2634) ================= */}
            {aiSubTab === 'planner' && (
              <div className="space-y-6">
                {/* Framework Selector & Input Form */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">

                {/* Grounding Banner */}
                <div
                  onClick={() => setAiSubTab('knowledge')}
                  className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-800">
                        🛡️ Chế độ đối chiếu chuẩn (Chống ảo giác & bịa đặt)
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        AI bắt buộc đối chiếu với {knowledgeDocs.filter(d => d.isActive).length} văn bản trong Kho dữ liệu (CV 5512/2634 & tài liệu của Thầy/Cô). Nhấn để xem & quản lý.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 underline shrink-0 ml-2">Kho tư liệu →</span>
                </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      1. Chọn khung pháp quy chuẩn của bài giảng:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPlannerStandard(5512);
                          setPlannerDuration('1');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          plannerStandard === 5512
                            ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-800">Công Văn 5512/BGDĐT-GDTrH</span>
                          {plannerStandard === 5512 && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                        </div>
                        <p className="text-xs text-slate-500">
                          Áp dụng Phổ thông: THCS, THPT, GDTX. Chuẩn 4 hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlannerStandard(2634);
                          setPlannerDuration('4.0');
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          plannerStandard === 2634
                            ? 'bg-amber-600/20 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-slate-800">Công Văn 2634/GDNN</span>
                          {plannerStandard === 2634 && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-xs text-slate-500">
                          Áp dụng Giáo dục Nghề nghiệp: Trung cấp, Cao đẳng, Xưởng thực hành kỹ thuật (Cơ khí, Tiện CNC, Điện, Ô tô, 5S).
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* ================= 2. BỘ LỌC LỚP HỌC & CHỌN CA DẠY ĐÃ LÊN LỊCH ================= */}
                  <div className="pt-2 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        2. Chọn Lớp học & Ca dạy đã lên lịch trước:
                      </label>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Lọc theo Lớp:</span>
                        <select
                          value={plannerClassFilter}
                          onChange={(e) => setPlannerClassFilter(e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          <option value="ALL">Tất cả các lớp ({events.length} ca dạy)</option>
                          {Array.from(new Set(events.map(ev => ev.className).filter(Boolean))).sort().map(cls => (
                            <option key={cls} value={cls}>Lớp {cls} ({events.filter(e => e.className === cls).length} ca)</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {events.length > 0 ? (
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 text-xs">
                        {(plannerClassFilter === 'ALL' ? events : events.filter(e => e.className === plannerClassFilter))
                          .slice(0, 16)
                          .map((ev) => {
                            const isSel = plannerSelectedEventId === ev.id;
                            return (
                              <button
                                key={ev.id}
                                type="button"
                                onClick={() => selectPlannerEvent(ev)}
                                className={`px-3.5 py-2 rounded-xl border text-left transition-all shrink-0 cursor-pointer ${
                                  isSel
                                    ? 'bg-blue-600 text-white border-blue-400 font-semibold shadow-lg shadow-blue-500/25 ring-1 ring-white/30'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/20'
                                }`}
                                style={{ minWidth: '170px' }}
                              >
                                <div className="font-bold flex items-center justify-between gap-1">
                                  <span className="truncate max-w-[130px]">{ev.title || ev.subject}</span>
                                  {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                                </div>
                                <div className="text-[10.5px] opacity-85 mt-0.5">
                                  {ev.className} • {ev.date}
                                </div>
                                {ev.notes ? (
                                  <div className={`text-[10.5px] truncate max-w-[160px] mt-1 font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                                    isSel
                                      ? 'bg-white/25 text-white'
                                      : 'bg-amber-100 text-amber-950 border border-amber-300 shadow-xs'
                                  }`}>
                                    <span className="shrink-0">📝</span>
                                    <span className="truncate">{ev.notes}</span>
                                  </div>
                                ) : (
                                  <div className={`text-[10px] mt-1 ${isSel ? 'text-white/80' : 'text-slate-500'}`}>
                                    🕒 {ev.startTime} - {ev.endTime}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                        Chưa có lịch dạy đồng bộ. Thầy/Cô có thể nhập trực tiếp thông tin bên dưới hoặc đồng bộ lịch từ điện thoại.
                      </div>
                    )}

                    {/* Thẻ hiển thị khớp nối Kho tư liệu chuẩn */}
                    {plannerMatchedDocResult?.doc ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs animate-fade-in">
                        <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-emerald-800">
                              Đã khớp nối thành công với tài liệu:
                            </span>
                            <span className="font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                              {plannerMatchedDocResult.doc.title}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">
                              ({plannerMatchedDocResult.doc.code})
                            </span>
                          </div>
                          {plannerMatchedDocResult.doc.fileName && (
                            <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-emerald-400" />
                              <span>Tệp đính kèm: <strong>{plannerMatchedDocResult.doc.fileName}</strong></span>
                            </div>
                          )}
                          {plannerMatchedDocResult.relevantSnippet && (
                            <div className="mt-1.5 p-2 rounded bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-800 line-clamp-2 italic">
                              "{plannerMatchedDocResult.relevantSnippet.slice(0, 180)}..."
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>AI sẽ tự động dò tìm giáo trình trong Kho tư liệu tương ứng với Môn học và Khối lớp.</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setAiSubTab('knowledge')}
                          className="text-blue-400 hover:text-blue-300 underline cursor-pointer shrink-0 font-medium"
                        >
                          Mở Kho Tư Liệu
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inputs */}
                  <div className="pt-2 space-y-3">
                    <label className="text-xs font-bold text-slate-700 block">
                      3. Nhập thông tin & Yêu cầu bài giảng:
                    </label>

                    {plannerStandard === 2634 && (
                      <div>
                        <span className="text-[11px] text-slate-600 mb-1 block">Tên Mô-đun / Môn học thực hành:</span>
                        <input
                          type="text"
                          value={plannerModuleTitle}
                          onChange={(e) => setPlannerModuleTitle(e.target.value)}
                          placeholder="Ví dụ: Mô-đun Tiện CNC và Gia công chi tiết máy"
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                    )}

                    <div>
                      <span className="text-[11px] text-slate-400 mb-1 block">
                        {plannerStandard === 5512 ? 'Tên bài dạy (CV 5512):' : 'Tên bài thực hành / Thao tác xưởng (CV 2634):'}
                      </span>
                      <input
                        type="text"
                        value={plannerLessonTitle}
                        onChange={(e) => {
                          setPlannerLessonTitle(e.target.value);
                          if (plannerSubject) {
                            const matched = findMatchingKnowledgeDocument(plannerSubject, plannerClass, e.target.value);
                            setPlannerMatchedDocResult(matched);
                          }
                        }}
                        placeholder={plannerStandard === 5512 ? 'Ví dụ: Bài 1: Khái quát về công nghệ' : 'Ví dụ: Gia công tiện ren tam giác hệ mét trên máy tiện CNC'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Môn học / Nghề đào tạo:</span>
                        <input
                          type="text"
                          value={plannerSubject}
                          onChange={(e) => {
                            setPlannerSubject(e.target.value);
                            if (e.target.value) {
                              const matched = findMatchingKnowledgeDocument(e.target.value, plannerClass, plannerLessonTitle);
                              setPlannerMatchedDocResult(matched);
                            }
                          }}
                          placeholder="Công nghệ, Toán, Cắt gọt kim loại..."
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Khối lớp / Trình độ:</span>
                        <input
                          type="text"
                          value={plannerClass}
                          onChange={(e) => {
                            setPlannerClass(e.target.value);
                            const matched = findMatchingKnowledgeDocument(plannerSubject, e.target.value, plannerLessonTitle);
                            setPlannerMatchedDocResult(matched);
                          }}
                          placeholder="Lớp 10A1 / Trung cấp K18..."
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">
                          {plannerStandard === 5512 ? 'Thời lượng (tiết):' : 'Thời lượng (giờ xưởng):'}
                        </span>
                        <input
                          type="text"
                          value={plannerDuration}
                          onChange={(e) => setPlannerDuration(e.target.value)}
                          placeholder={plannerStandard === 5512 ? '1 hoặc 2' : '4.0 hoặc 6.0'}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 mb-1 block">
                        {plannerStandard === 5512 ? 'Yêu cầu sư phạm bổ sung / Thiết bị dạy học số:' : 'Yêu cầu ATLĐ, Máy móc thiết bị, Phôi mẫu & Quy chuẩn 5S:'}
                      </span>
                      <input
                        type="text"
                        value={plannerRequirements}
                        onChange={(e) => setPlannerRequirements(e.target.value)}
                        placeholder={plannerStandard === 5512 ? 'Tivi tương tác, video mô phỏng, phần mềm Kahoot, phiếu học tập số...' : 'Máy tiện vạn năng T616, kính bảo hộ, quy trình 5S xưởng...'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    {/* Mục lựa chọn tài liệu đối chiếu đưa vào AI */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-rose-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Tài liệu đối chiếu AI (Kho tư liệu chuẩn):
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Chủ động chọn tài liệu để tránh nhầm giáo trình
                        </span>
                      </div>

                      <select
                        value={plannerSelectedDocId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlannerSelectedDocId(val);
                          if (val === 'AUTO') {
                            const matched = findMatchingKnowledgeDocument(plannerSubject, plannerClass, plannerLessonTitle);
                            setPlannerMatchedDocResult(matched);
                          } else if (val === 'NONE') {
                            setPlannerMatchedDocResult(null);
                          } else {
                            const found = knowledgeDocs.find(d => d.id === val);
                            if (found) {
                              setPlannerMatchedDocResult({
                                doc: found,
                                relevantSnippet: found.content.slice(0, 1400),
                                confidence: 100
                              });
                            }
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-rose-500 cursor-pointer"
                      >
                        <option value="AUTO">🤖 [Tự động] Nhận diện & so khớp thông minh theo Môn & Khối lớp</option>

                        <optgroup label="Sách giáo viên & Giáo trình theo khối lớp">
                          {knowledgeDocs
                            .filter(d => d.isActive && (d.category === 'GIAO_TRINH' || d.category === 'DE_CUONG' || !d.isBuiltIn))
                            .map(doc => (
                              <option key={doc.id} value={doc.id}>
                                📘 {doc.title} ({doc.targetLevel || 'Toàn trường'} • Môn: {doc.subject})
                              </option>
                            ))}
                        </optgroup>

                        <optgroup label="Văn bản quy chuẩn pháp quy & An toàn chung">
                          {knowledgeDocs
                            .filter(d => d.isActive && (d.category === 'PHAP_QUY' || d.category === 'ATLD_5S'))
                            .map(doc => (
                              <option key={doc.id} value={doc.id}>
                                📜 [{doc.code}] {doc.title}
                              </option>
                            ))}
                        </optgroup>

                        <option value="NONE">🚫 Không dùng giáo trình (Chỉ căn cứ khung chuẩn CV 5512 thuần túy)</option>
                      </select>

                      {/* Huy hiệu hiển thị trạng thái đối chiếu thực tế */}
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200">
                        {plannerMatchedDocResult?.doc ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <span>✅ Căn cứ AI sử dụng:</span>
                            <span className="font-semibold text-emerald-300 truncate max-w-[340px]" title={plannerMatchedDocResult.doc.title}>
                              {plannerMatchedDocResult.doc.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({plannerSelectedDocId === 'AUTO' ? `Khớp tự động ${plannerMatchedDocResult.confidence}%` : 'Chỉ định thủ công 100%'})
                            </span>
                          </div>
                        ) : (
                          <div className="text-slate-400 flex items-center gap-1">
                            <span>ℹ️ Căn cứ mặc định:</span>
                            <span className="text-slate-600">Khung Kế hoạch bài dạy CV 5512/BGDĐT-GDTrH</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setAiSubTab('knowledge')}
                          className="text-blue-400 hover:text-blue-300 text-[11px] underline ml-2 whitespace-nowrap cursor-pointer"
                        >
                          Quản lý Kho tư liệu →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nút Sinh Kế Hoạch Bài Giảng Trọn Gói AI (Quy trình 5 bước) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={plannerIsGenerating}
                      onClick={handleGenerateFullLessonPackage}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:via-rose-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {plannerIsGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span className="font-semibold">{plannerStepProgress || 'AI đang xử lý quy trình 5 bước...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>
                            ⚡ KÍCH HOẠT SINH BÀI GIẢNG TRỌN GÓI AI (GIÁO ÁN • SLIDE • GAME • VIDEO • MINDMAP • CHẤM ĐIỂM)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ================= KHUNG KẾT QUẢ ĐA PHƯƠNG TIỆN 6 TAB ================= */}
                {(plannerFullPackage || plannerResult5512 || plannerResult2634) && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-fade-in">
                    {/* Header Thanh Công Cụ Toàn Cục */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                            {plannerStandard === 5512 ? 'Công Văn 5512' : 'Công Văn 2634'}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">
                            {plannerFullPackage?.lessonTitle || plannerLessonTitle}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({plannerClass} • Môn {plannerSubject})
                          </span>
                        </div>
                        {plannerFullPackage?.auditScore && (
                          <div className="flex items-center gap-2 mt-1.5 text-xs">
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <Award className="w-3.5 h-3.5" />
                              <span>Điểm Năng Lực Số: {plannerFullPackage.auditScore.totalScore}/100</span>
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-emerald-300 font-semibold">
                              Xếp loại: {plannerFullPackage.auditScore.rating}
                            </span>
                            {plannerFullPackage.sourceDocMatched && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600 truncate max-w-[200px]" title={plannerFullPackage.sourceDocMatched.title}>
                                  📘 {plannerFullPackage.sourceDocMatched.title}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Các Nút Xuất Bản Nhanh */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Tải Trọn Bộ Hồ Sơ Word */}
                        {plannerFullPackage && (
                          <button
                            type="button"
                            onClick={() => {
                              setViewingLessonPackage(plannerFullPackage);
                              setViewingLessonEvent(null);
                              setLessonPackageActiveTab('plan');
                              setLessonPackageFullScreen(false);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                            title="Mở giao diện giảng dạy 6-in-1 đầy đủ các tab tài liệu"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Mở Trình Giảng Dạy 6-in-1</span>
                          </button>
                        )}
                        {plannerFullPackage && (
                          <button
                            type="button"
                            onClick={() => {
                              const html = fullPackageToDocHtml(plannerFullPackage);
                              const fName = `HoSo_BaiGiang_${plannerFullPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
                              downloadWordDoc(fName, html);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                            title="Tải toàn bộ Hồ sơ gồm Giáo án, Slide, Game, Video Script và Bảng chấm điểm vào 1 file Word duy nhất"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải Trọn Bộ Hồ Sơ (.doc)</span>
                          </button>
                        )}

                        {/* Tải Giáo án Word đơn lẻ */}
                        <button
                          type="button"
                          onClick={() => {
                            if (plannerResult5512) {
                              const html = lessonPlan5512ToHtml(plannerResult5512);
                              const fName = `GiaoAn_5512_${plannerResult5512.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
                              downloadWordDoc(fName, html);
                            } else if (plannerResult2634) {
                              const html = lessonPlan2634ToHtml(plannerResult2634);
                              const fName = `GiaoAn_2634_${plannerResult2634.moduleTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
                              downloadWordDoc(fName, html);
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                          title="Tải riêng file Kế hoạch bài dạy chuẩn Word"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Tải Giáo Án (.doc)</span>
                        </button>

                        {/* Đính kèm vào ca dạy */}
                        {plannerSelectedEventId && (
                          <button
                            type="button"
                            onClick={() => {
                              const docName = plannerResult5512
                                ? `GiaoAn_5512_${plannerResult5512.lessonTitle.slice(0, 25)}.doc`
                                : `GiaoAn_2634_${plannerResult2634?.moduleTitle.slice(0, 25)}.doc`;

                              const contentToSave = plannerFullPackage
                                ? fullPackageToDocHtml(plannerFullPackage)
                                : plannerResult5512
                                ? lessonPlan5512ToHtml(plannerResult5512)
                                : plannerResult2634
                                ? lessonPlan2634ToHtml(plannerResult2634)
                                : '';

                              const updated = events.map(ev => {
                                if (ev.id === plannerSelectedEventId) {
                                  return {
                                    ...ev,
                                    attachmentName: docName,
                                    attachmentUrl: 'attached://lesson_plan_doc',
                                    attachmentContent: contentToSave,
                                    updatedAt: Date.now()
                                  };
                                }
                                return ev;
                              });

                              setEvents(updated);
                              localStorage.setItem('smart_teacher_events', JSON.stringify(updated));

                              try {
                                if (plannerFullPackage) {
                                  localStorage.setItem(`smart_teacher_ai_pack_${plannerSelectedEventId}`, JSON.stringify(plannerFullPackage));
                                  localStorage.setItem(`smart_teacher_ai_pack_${docName}`, JSON.stringify(plannerFullPackage));
                                }
                                if (contentToSave) {
                                  localStorage.setItem(`smart_teacher_ai_plan_${plannerSelectedEventId}`, contentToSave);
                                  localStorage.setItem(`smart_teacher_ai_plan_${docName}`, contentToSave);
                                }
                              } catch (_) {}

                              // Đồng bộ vào kho tài liệu số hóa
                              if (contentToSave) {
                                const targetEv = events.find(e => e.id === plannerSelectedEventId);
                                const newKbDoc: KnowledgeDocument = {
                                  id: `kb_giaoan_${plannerSelectedEventId}`,
                                  code: `GA-${targetEv?.className || '5512'}`,
                                  title: `Kế hoạch bài dạy: ${plannerResult5512?.lessonTitle || plannerResult2634?.moduleTitle || targetEv?.title || docName}`,
                                  category: 'GIAO_TRINH',
                                  subject: targetEv?.subject || plannerResult5512?.subject || 'Chung',
                                  targetLevel: targetEv?.className || plannerResult5512?.grade || 'Phổ thông',
                                  content: contentToSave,
                                  fileName: docName,
                                  fileSize: contentToSave.length,
                                  fileType: 'doc',
                                  isBuiltIn: false,
                                  isActive: true,
                                  createdAt: new Date().toISOString(),
                                  updatedAt: Date.now()
                                };
                                const updatedDocs = [newKbDoc, ...knowledgeDocs.filter(d => d.id !== newKbDoc.id)];
                                setKnowledgeDocs(updatedDocs);
                                localStorage.setItem('smart_teacher_knowledge_docs_v2', JSON.stringify(updatedDocs));
                              }

                              if (syncCode) pushToCloud(updated, schedules, syncCode);
                              alert(`Đã đính kèm '${docName}' trực tiếp vào ca dạy và tự động đồng bộ đám mây 2 chiều!`);
                            }}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                            title="Lưu kèm vào ca dạy đã chọn và đồng bộ sang điện thoại"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Đính kèm ca dạy</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Thanh Điều Hướng 6 Tab Kết Quả */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setPlannerActiveResultTab('plan')}
                        className={`px-3.5 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plannerActiveResultTab === 'plan'
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>1. Giáo Án Chuẩn</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlannerActiveResultTab('slides')}
                        className={`px-3.5 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plannerActiveResultTab === 'slides'
                            ? 'bg-sky-600 text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>2. Slide Thuyết Trình ({plannerFullPackage?.slides.length || 8})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlannerActiveResultTab('game')}
                        className={`px-3.5 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plannerActiveResultTab === 'game'
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>3. Mini Game Tương Tác</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlannerActiveResultTab('video')}
                        className={`px-3.5 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plannerActiveResultTab === 'video'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>4. Video Bài Giảng</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlannerActiveResultTab('mindmap')}
                        className={`px-3.5 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plannerActiveResultTab === 'mindmap'
                            ? 'bg-teal-600 text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Network className="w-3.5 h-3.5" />
                        <span>5. Sơ Đồ Tư Duy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlannerActiveResultTab('audit')}
                        className={`px-3.5 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plannerActiveResultTab === 'audit'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>6. Chấm Điểm Năng Lực Số ({plannerFullPackage?.auditScore.totalScore || 96}đ)</span>
                      </button>
                    </div>

                    {/* ================= TAB 1: KẾ HOẠCH BÀI DẠY (GIÁO ÁN) ================= */}
                    {plannerActiveResultTab === 'plan' && (
                      <div className="space-y-4">
                        {plannerResult5512 && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs sm:text-sm text-slate-800">
                            <div className="text-center pb-3 border-b border-slate-200">
                              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
                                KẾ HOẠCH BÀI DẠY (CHUẨN CÔNG VĂN 5512/BGDĐT-GDTrH)
                              </span>
                              <h4 className="text-base font-bold text-slate-900 mt-1">{plannerResult5512.lessonTitle}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Môn: {plannerResult5512.subject} • Khối: {plannerResult5512.grade} • Thời lượng: {plannerResult5512.durationMinutes} tiết
                              </p>
                              {plannerFullPackage?.sourceDocMatched && (
                                <div className="mt-2 text-xs text-emerald-400 font-medium">
                                  📘 Căn cứ đối chiếu: {plannerFullPackage.sourceDocMatched.title}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-blue-400 uppercase text-xs">I. Mục tiêu bài học:</h5>
                              <p><strong className="text-slate-700">1. Kiến thức:</strong> {plannerResult5512.objectives.knowledge}</p>
                              <p><strong className="text-slate-700">2. Năng lực:</strong> {plannerResult5512.objectives.competencies}</p>
                              <p><strong className="text-slate-700">3. Phẩm chất:</strong> {plannerResult5512.objectives.qualities}</p>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-blue-400 uppercase text-xs">II. Thiết bị dạy học và học liệu số:</h5>
                              <p><strong className="text-slate-700">• Giáo viên:</strong> {plannerResult5512.equipment.teacherEquipment}</p>
                              <p><strong className="text-slate-700">• Học sinh:</strong> {plannerResult5512.equipment.studentEquipment}</p>
                            </div>

                            <div className="space-y-3 pt-2">
                              <h5 className="font-bold text-blue-400 uppercase text-xs">III. Tiến trình dạy học (4 Hoạt động bắt buộc):</h5>
                              {[plannerResult5512.activity1Opening, plannerResult5512.activity2Knowledge, plannerResult5512.activity3Practice, plannerResult5512.activity4Application].map((act, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-800">
                                  <span className="font-bold text-white text-xs block">{act.name}</span>
                                  <p><strong className="text-slate-400">• Mục tiêu:</strong> {act.objective}</p>
                                  <p><strong className="text-slate-400">• Nội dung:</strong> {act.content}</p>
                                  <p><strong className="text-slate-400">• Sản phẩm:</strong> {act.product}</p>
                                  <p><strong className="text-slate-400">• Tổ chức thực hiện:</strong> {act.implementation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {plannerResult2634 && (
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-4 text-xs sm:text-sm text-slate-800">
                            <div className="text-center pb-3 border-b border-slate-200">
                              <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold block">
                                GIÁO ÁN BÀI DẠY THỰC HÀNH NGHỀ (CHUẨN CÔNG VĂN 2634/GDNN)
                              </span>
                              <h4 className="text-base font-bold text-slate-900 mt-1">{plannerResult2634.moduleTitle}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Nghề: {plannerResult2634.occupation} • Trình độ: {plannerResult2634.level} • Thời lượng: {plannerResult2634.durationMinutes} giờ
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-amber-800 uppercase text-xs">I. Mục tiêu đào tạo nghề:</h5>
                              <p><strong className="text-slate-700">1. Kiến thức nghề:</strong> {plannerResult2634.objectives.knowledge}</p>
                              <p><strong className="text-slate-700">2. Kỹ năng thực hành:</strong> {plannerResult2634.objectives.skills}</p>
                              <p><strong className="text-slate-700">3. An toàn lao động & 5S:</strong> {plannerResult2634.objectives.autonomyAndSafety}</p>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-amber-400 uppercase text-xs">II. Điều kiện thực hiện (Xưởng thực hành):</h5>
                              <p><strong className="text-slate-700">• Máy móc thiết bị:</strong> {plannerResult2634.conditions.equipmentAndMachines}</p>
                              <p><strong className="text-slate-700">• Vật tư phôi mẫu:</strong> {plannerResult2634.conditions.materialsAndWorkpieces}</p>
                              <p><strong className="text-slate-700">• Trang bị BHLĐ & 5S:</strong> {plannerResult2634.conditions.safetyAnd5S}</p>
                            </div>

                            <div className="space-y-3 pt-2">
                              <h5 className="font-bold text-amber-400 uppercase text-xs">III. Tiến trình thực hiện tại xưởng (4 Bước thực hành):</h5>
                              {[plannerResult2634.step1Orientation, plannerResult2634.step2Demonstration, plannerResult2634.step3Practice, plannerResult2634.step4Evaluation].map((st, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-800">
                                  <span className="font-bold text-white text-xs block">{st.name}</span>
                                  <p><strong className="text-slate-400">• Hoạt động GV:</strong> {st.teacherActivity}</p>
                                  <p><strong className="text-slate-400">• Hoạt động HS:</strong> {st.studentActivity}</p>
                                  <p className="text-red-400 font-semibold">• Lưu ý ATLĐ & 5S: {st.safetyAndKeyPoints}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ================= TAB 2: KỊCH BẢN SLIDE THUYẾT TRÌNH ================= */}
                    {plannerActiveResultTab === 'slides' && plannerFullPackage && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs">
                          <span className="text-sky-300 font-semibold">
                            🖥️ Kịch bản bài giảng gồm {plannerFullPackage.slides.length} slide trình chiếu PowerPoint đồng bộ.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const html = slidesToHtml(plannerFullPackage.slides, plannerFullPackage.lessonTitle, plannerFullPackage.subject);
                              downloadWordDoc(`Slide_${plannerFullPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`, html);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải Kịch Bản Slide (.doc)</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {plannerFullPackage.slides.map((s) => (
                            <div key={s.slideNumber} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-800">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="font-bold text-sky-400">SLIDE {s.slideNumber}: {s.title}</span>
                              </div>
                              <div>
                                <strong className="text-slate-700 block mb-1">📌 Nội dung trình chiếu:</strong>
                                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                                  {s.bulletPoints.map((bp, i) => (
                                    <li key={i}>{bp}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                                <span className="font-bold block mb-0.5">🗣️ Lời giảng của Giáo viên:</span>
                                <p className="italic text-slate-600">{s.speakerNotes}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-medium text-xs">
                                <strong>🖼️ Gợi ý hình ảnh:</strong> {s.visualSuggestion}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ================= TAB 3: CÂU HỎI MINI GAME ================= */}
                    {plannerActiveResultTab === 'game' && plannerFullPackage && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                          <span className="text-purple-300 font-semibold">
                            🎮 Bộ {plannerFullPackage.miniGame.length} câu hỏi tương tác sẵn sàng nạp vào Kahoot, Quizizz, Blooket.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const txt = miniGameToTxt(plannerFullPackage.miniGame, plannerFullPackage.lessonTitle);
                              const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `MiniGame_${plannerFullPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải File Câu Hỏi (.txt)</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {plannerFullPackage.miniGame.map((q) => (
                            <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-800">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-sm">Câu {q.id}: {q.question}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold text-[10px]">
                                    {q.bloomLevel}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-mono text-[10px] font-bold border border-amber-200">
                                    ⏱️ {q.timeLimitSeconds}s • {q.points}đ
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt, i) => {
                                  const optKey = opt.charAt(0);
                                  const isCorrect = optKey === q.correctAnswer;
                                  return (
                                    <div
                                      key={i}
                                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                        isCorrect
                                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px]">
                                <strong>💡 Giải thích sư phạm:</strong> {q.explanation}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ================= TAB 4: KỊCH BẢN VIDEO VI MÔ ================= */}
                    {plannerActiveResultTab === 'video' && plannerFullPackage && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                          <span className="text-amber-800 font-bold">
                            🎬 Kịch bản Video vi mô (Microlearning) gồm {plannerFullPackage.videoScript.length} phân cảnh chi tiết (3-5 phút).
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const html = videoScriptToHtml(plannerFullPackage.videoScript, plannerFullPackage.lessonTitle, plannerFullPackage.subject);
                              downloadWordDoc(`KichBan_Video_${plannerFullPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`, html);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Tải Kịch Bản Video (.doc)</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {plannerFullPackage.videoScript.map((sc) => (
                            <div key={sc.sceneNumber} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-800">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="font-bold text-amber-800 text-sm">
                                  Phân cảnh {sc.sceneNumber}: {sc.title}
                                </span>
                                <span className="text-[11px] font-mono text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                                  {sc.duration}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <strong className="text-slate-700 block mb-1">🖼️ Mô tả hình ảnh (Visual):</strong>
                                  <p className="text-slate-600">{sc.visualDescription}</p>
                                  <div className="mt-2 text-xs text-amber-950 font-medium">
                                    <strong>Chữ trên màn hình:</strong> {sc.onScreenText}
                                  </div>
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-slate-200">
                                  <strong className="text-emerald-300 block mb-1">🎙️ Lời bình thuyết minh (Voiceover):</strong>
                                  <p className="italic text-slate-200">"{sc.voiceover}"</p>
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] flex items-center justify-between gap-2">
                                <div>
                                  <strong>AI Video Prompt:</strong> <i>{sc.aiPromptSuggestion}</i>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(sc.aiPromptSuggestion);
                                    alert('Đã sao chép Prompt tạo video AI!');
                                  }}
                                  className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0 cursor-pointer"
                                >
                                  Copy Prompt
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ================= TAB 5: SƠ ĐỒ TƯ DUY (MINDMAP) ================= */}
                    {plannerActiveResultTab === 'mindmap' && plannerFullPackage && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
                          <span className="text-teal-300 font-semibold">
                            🧠 Cấu trúc Sơ đồ tư duy bài học phân cấp mạch lạc.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(plannerFullPackage.mindmap.mermaidCode);
                              alert('Đã sao chép mã Mermaid Mindmap vào bộ nhớ tạm!');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao Chép Mã Mermaid</span>
                          </button>
                        </div>

                        {/* Mindmap Tree Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {plannerFullPackage.mindmap.branches.map((b, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-2 text-xs text-slate-800">
                              <h5 className="font-bold text-teal-300 text-sm flex items-center gap-1.5">
                                <Network className="w-4 h-4 text-teal-400" />
                                <span>{b.title}</span>
                              </h5>
                              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                                {b.subItems.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Mermaid Code Box */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="text-xs font-mono text-slate-400 block">Cú pháp Mermaid Mindmap:</span>
                          <pre className="text-xs font-mono text-teal-800 overflow-x-auto p-3 bg-white border border-slate-200 rounded-lg">
                            {plannerFullPackage.mindmap.mermaidCode}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* ================= TAB 6: RÀ SOÁT & CHẤM ĐIỂM NĂNG LỰC SỐ ================= */}
                    {plannerActiveResultTab === 'audit' && plannerFullPackage && (
                      <div className="space-y-4 animate-fade-in">
                        {/* Tổng quan Điểm Số */}
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-blue-600/20 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-2xl shrink-0">
                              {plannerFullPackage.auditScore.totalScore}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-white">
                                  ĐÁNH GIÁ: XẾP LOẠI {plannerFullPackage.auditScore.rating.toUpperCase()}
                                </h4>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                                  {plannerFullPackage.auditScore.totalScore}/100 ĐIỂM
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {plannerFullPackage.auditScore.digitalCompetencyReview.levelAchieved}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const html = fullPackageToDocHtml(plannerFullPackage);
                                downloadWordDoc(`HoSo_DanhGia_${plannerFullPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`, html);
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Xuất Biên Bản Rà Soát (.doc)</span>
                            </button>
                          </div>
                        </div>

                        {/* Bảng Chi Tiết 4 Tiêu Chí */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
                              <tr>
                                <th className="p-3">Tiêu Chí Đánh Giá</th>
                                <th className="p-3 w-24 text-center">Điểm Số</th>
                                <th className="p-3">Nhận Xét & Căn Cứ Pháp Quy</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {plannerFullPackage.auditScore.criteria.map((c, i) => (
                                <tr key={i} className="hover:bg-rose-50/30 transition-colors">
                                  <td className="p-3 font-semibold text-white">
                                    {c.name}
                                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                                      {c.standardRef}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-bold text-emerald-400 text-sm">
                                    {c.actualScore} / {c.maxScore}
                                  </td>
                                  <td className="p-3 text-slate-700">
                                    {c.feedback}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Điểm mạnh & Khuyến nghị */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                            <strong className="text-emerald-400 flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Điểm Mạnh Nổi Bật:</span>
                            </strong>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                              {plannerFullPackage.auditScore.strengths.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                            <strong className="text-amber-800 flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-4 h-4" />
                              <span>Khuyến Nghị Tối Ưu Sư Phạm:</span>
                            </strong>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                              {plannerFullPackage.auditScore.suggestions.map((sg, i) => (
                                <li key={i}>{sg}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ================= SUB-TAB 2: ĐỀ THI & MA TRẬN 4 MỨC ĐỘ ================= */}
            {aiSubTab === 'exam' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>Thiết Lập Đề Thi & Bảng Ma Trận 4 Mức Độ Nhận Thức</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Phân hóa câu hỏi chuẩn 4 mức độ: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%) kèm đáp án và lời giải chi tiết.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <span className="text-[11px] text-slate-400 mb-1 block">Chủ đề kiểm tra / Tên bài học:</span>
                      <input
                        type="text"
                        value={examTopic}
                        onChange={(e) => setExamTopic(e.target.value)}
                        placeholder="Ví dụ: Kiểm tra 15 phút - An toàn xưởng và Quy trình tiện CNC"
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Môn học:</span>
                        <input
                          type="text"
                          value={examSubject}
                          onChange={(e) => setExamSubject(e.target.value)}
                          placeholder="Toán, Công nghệ, Cơ khí..."
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Khối lớp / Trình độ:</span>
                        <input
                          type="text"
                          value={examGrade}
                          onChange={(e) => setExamGrade(e.target.value)}
                          placeholder="Lớp 10 / CĐ Nghề K22..."
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Số lượng câu hỏi:</span>
                        <select
                          value={examQuestionCount}
                          onChange={(e) => setExamQuestionCount(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                          <option value={10}>10 câu (Kiểm tra 15 phút / Thường xuyên)</option>
                          <option value={20}>20 câu (Kiểm tra 45 phút / Định kỳ)</option>
                          <option value={40}>40 câu (Đề thi Học kỳ / Tốt nghiệp)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={examIsGenerating}
                        onClick={() => {
                          const top = examTopic.trim();
                          if (!top) {
                            alert('Vui lòng nhập Chủ đề kiểm tra!');
                            return;
                          }
                          setExamIsGenerating(true);
                          setTimeout(() => {
                            const res = generateExamMatrix(top, examSubject, examGrade, examQuestionCount);
                            setExamResult(res);
                            setExamIsGenerating(false);
                          }, 400);
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {examIsGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>AI đang xây dựng đề thi & ma trận 4 mức độ...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>⚡ Sinh Đề Thi & Bảng Ma Trận 4 Mức Độ Nhận Thức</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exam Result Preview */}
                {examResult && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        <span>Đã tạo {examResult.questions.length} câu hỏi phân hóa 4 mức độ kèm đáp án!</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const html = examMatrixToHtml(examResult);
                            const fName = `DeThi_MaTran_${examResult.topic.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
                            downloadWordDoc(fName, html);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Tải Đề Thi Word (.doc)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(examResult, null, 2));
                            alert('Đã sao chép đề thi vào bộ nhớ tạm!');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </button>
                      </div>
                    </div>

                    {/* Matrix Distribution Table */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <h5 className="font-bold text-purple-400 text-xs uppercase">Bảng Ma Trận 4 Mức Độ Nhận Thức:</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">1. Nhận biết</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.recognitionCount} câu ({examResult.matrix.recognitionPercent}%)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">2. Thông hiểu</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.comprehensionCount} câu ({examResult.matrix.comprehensionPercent}%)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">3. Vận dụng</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.applicationCount} câu ({examResult.matrix.applicationPercent}%)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-slate-400 block text-[11px]">4. Vận dụng cao</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.advancedApplicationCount} câu ({examResult.matrix.advancedApplicationPercent}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Question List */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-purple-400 text-xs uppercase">Danh Sách Câu Hỏi & Lời Giải:</h5>
                      {examResult.questions.map((q, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">Câu {idx + 1}:</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700/50">
                              {q.level}
                            </span>
                          </div>
                          <p className="text-slate-200">{q.questionText}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 text-slate-600">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="text-[11px]">{opt}</div>
                            ))}
                          </div>
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-emerald-400 font-bold">Đáp án đúng: {q.correctAnswer}</span>
                            <span className="text-slate-400 italic">{q.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= SUB-TAB 3: TƯ VẤN CHAT AI ================= */}
            {aiSubTab === 'chat' && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 h-[620px] flex flex-col justify-between shadow-sm">
                {/* 7 Mode Selector Bar */}
                <div className="pb-3 mb-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-thin">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'KNOWLEDGE', label: '📚 Kho tư liệu' },
                    { id: 'EXAM_MATRIX', label: '📝 Đề thi & Ma trận (TT22)' },
                    { id: 'SLIDES', label: '📊 Slide bài giảng' },
                    { id: 'MINI_GAME', label: '🎮 Mini game' },
                    { id: 'MINDMAP', label: '🧠 Sơ đồ tư duy' },
                    { id: 'ILLUSTRATION', label: '🎨 Hình minh họa SVG' },
                    { id: 'OFFICIAL_VN', label: '🇻🇳 Nguồn chính thống' },
                  ].map((tab) => {
                    const isSel = chatSelectedMode === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setChatSelectedMode(tab.id as AiPedagogyMode)}
                        className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isSel
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Messages scrollable area */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
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
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[90%] whitespace-pre-line leading-relaxed shadow ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}

                        {/* Inline SVG Vector Graphics */}
                        {msg.svgContent && (
                          <div className="mt-3 rounded-xl overflow-hidden border border-cyan-200 shadow-sm bg-slate-50 p-2">
                            <div
                              dangerouslySetInnerHTML={{ __html: msg.svgContent }}
                              className="w-full flex justify-center"
                            />
                          </div>
                        )}

                        {/* Mermaid Mindmap Code */}
                        {msg.mermaidCode && (
                          <div className="mt-3 rounded-xl bg-slate-50 border border-indigo-200 p-2.5 space-y-1.5 text-slate-800">
                            <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                              <span>MÃ NGUỒN MERMAID MINDMAP:</span>
                              <button
                                type="button"
                                onClick={() => handleCopyChatText(msg.mermaidCode!, 'm-' + i)}
                                className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-white/5 cursor-pointer"
                              >
                                {chatCopiedId === 'm-' + i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{chatCopiedId === 'm-' + i ? 'Đã chép' : 'Chép mã'}</span>
                              </button>
                            </div>
                            <pre className="text-[11px] text-slate-800 font-mono overflow-x-auto p-1.5 bg-slate-100 rounded border border-slate-200">
                              {msg.mermaidCode}
                            </pre>
                          </div>
                        )}

                        {/* Source citations */}
                        {msg.sourceReferences && msg.sourceReferences.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                            <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                              <span>CĂN CỨ VĂN BẢN CHÍNH THỐNG:</span>
                            </div>
                            {msg.sourceReferences.map((ref, idx) => (
                              <div key={idx} className="text-xs bg-indigo-50/50 rounded-lg p-1.5 border border-indigo-200 text-indigo-900 flex items-center justify-between">
                                <span>🏛️ {ref.title} {ref.code ? `(${ref.code})` : ''}</span>
                                {ref.url && (
                                  <a
                                    href={ref.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                                  >
                                    <span>Tra cứu</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Message Actions */}
                        {msg.role === 'ai' && (
                          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-end gap-2 text-xs">
                            {msg.wordExportableHtml && (
                              <button
                                type="button"
                                onClick={() => {
                                  downloadWordDoc(msg.wordExportableHtml!, 'De_Thi_Ma_Tran_TT22.doc');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Xuất Word (.doc)</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyChatText(msg.text, 't-' + i)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
                            >
                              {chatCopiedId === 't-' + i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{chatCopiedId === 't-' + i ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      <span>Trợ lý AI đang đối chiếu kho tư liệu chuẩn và soạn thảo chuyên môn...</span>
                    </div>
                  )}
                </div>

                {/* Suggestions chips & Input Bar */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Soạn giáo án Công nghệ theo Công văn 5512', 'KNOWLEDGE')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                    >
                      📜 4 hoạt động CV 5512
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Tạo đề thi và ma trận 10 câu theo Thông tư 22', 'EXAM_MATRIX')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                    >
                      📝 Ma trận đề chuẩn TT 22
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Tạo bộ slide 10 trang cho bài học này', 'SLIDES')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                    >
                      📊 Tạo Slide thuyết trình
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Tạo mini game tương tác Kahoot 4 câu', 'MINI_GAME')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                    >
                      🎮 Mini game Kahoot
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Tạo sơ đồ tư duy Mermaid bài học', 'MINDMAP')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                    >
                      🧠 Sơ đồ Mermaid
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Vẽ hình minh họa SVG nguyên lý máy gia công', 'ILLUSTRATION')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                    >
                      🎨 Hình minh họa SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage('Tra cứu định mức giờ dạy theo Thông tư 28 và 15', 'OFFICIAL_VN')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 whitespace-nowrap cursor-pointer"
                    >
                      🇻🇳 Định mức giờ dạy
                    </button>
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Hỏi trợ lý AI (CV 5512, TT 22, năng lực số, tạo slide, ma trận đề, mini game)..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendAiMessage()}
                      disabled={isAiLoading || !aiInput.trim()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= SUB-TAB 4: KHO TƯ LIỆU CHUẨN (KNOWLEDGE BASE) ================= */}
            {aiSubTab === 'knowledge' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-200/80 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm text-emerald-600">
                        <ShieldCheck className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                          <span>Kho Tư Liệu Đối Chiếu Chuẩn</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            {knowledgeDocs.filter(d => d.isActive).length} / {knowledgeDocs.length} Đang kích hoạt
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                          AI bắt buộc đối chiếu các tài liệu đang BẬT dưới đây khi sinh Kế hoạch bài dạy & Đề thi. Tuyệt đối không tự bịa đặt điều luật, thông số kỹ thuật hoặc quy chuẩn ngoài nguồn chuẩn.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setKbNewTitle('');
                          setKbNewCode('');
                          setKbNewContent('');
                          setKbShowAddModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Tài Liệu Mới</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
                    {(['ALL', 'GIAO_TRINH', 'DE_CUONG', 'PHAP_QUY', 'ATLD_5S', 'CUSTOM'] as const).map((cat) => {
                      const labels = {
                        ALL: 'Tất cả (' + knowledgeDocs.length + ')',
                        GIAO_TRINH: 'Giáo trình (' + knowledgeDocs.filter(d => d.category === 'GIAO_TRINH').length + ')',
                        DE_CUONG: 'Đề cương (' + knowledgeDocs.filter(d => d.category === 'DE_CUONG').length + ')',
                        PHAP_QUY: 'Pháp quy BGDĐT & GDNN',
                        ATLD_5S: 'ATLĐ & 5S Xưởng',
                        CUSTOM: 'Tài liệu Thầy/Cô nạp (' + knowledgeDocs.filter(d => !d.isBuiltIn).length + ')'
                      };
                      const isSel = kbFilter === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setKbFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                            isSel
                              ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow'
                              : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {labels[cat]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={kbSearch}
                      onChange={(e) => setKbSearch(e.target.value)}
                      placeholder="Tìm theo tên, mã số, môn học..."
                      className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Document List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {knowledgeDocs
                    .filter((doc) => {
                      if (kbFilter === 'GIAO_TRINH' && doc.category !== 'GIAO_TRINH') return false;
                      if (kbFilter === 'DE_CUONG' && doc.category !== 'DE_CUONG') return false;
                      if (kbFilter === 'PHAP_QUY' && doc.category !== 'PHAP_QUY') return false;
                      if (kbFilter === 'ATLD_5S' && doc.category !== 'ATLD_5S') return false;
                      if (kbFilter === 'CUSTOM' && doc.isBuiltIn) return false;
                      if (kbSearch.trim()) {
                        const s = kbSearch.toLowerCase();
                        return (
                          doc.title.toLowerCase().includes(s) ||
                          doc.code.toLowerCase().includes(s) ||
                          doc.subject.toLowerCase().includes(s)
                        );
                      }
                      return true;
                    })
                    .map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3.5 ${
                          doc.isActive
                            ? 'bg-white border-slate-200/90 shadow-sm'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  doc.isBuiltIn
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                }`}
                              >
                                {doc.isBuiltIn ? '🏛️ PHÁP QUY GỐC' : '👤 THẦY/CÔ NẠP THÊM'}
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                {doc.code}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {doc.title}
                            </h3>
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <button
                              type="button"
                              onClick={() => {
                                toggleKnowledgeDocumentActive(doc.id, !doc.isActive);
                                refreshKnowledgeDocs();
                                pushToCloud(events, schedules, syncCode, false);
                              }}
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                doc.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  doc.isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className={`text-[10px] font-semibold mt-1 ${doc.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {doc.isActive ? 'Đang dùng' : 'Tạm tắt'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <span>Môn: <strong className="text-slate-700">{doc.subject}</strong></span>
                          <span>•</span>
                          <span>Cấp: <strong className="text-slate-700">{doc.targetLevel}</strong></span>
                          <span>•</span>
                          <span>{doc.content.length.toLocaleString()} ký tự</span>
                        </div>

                        {doc.fileName && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                            <Paperclip className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                            <span className="truncate font-semibold flex-1">{doc.fileName}</span>
                            {doc.fileSize ? (
                              <span className="text-[10px] text-slate-400 shrink-0">
                                ({(doc.fileSize / 1024).toFixed(0)} KB)
                              </span>
                            ) : null}
                          </div>
                        )}

                        {/* Actions: Xem trước, Tải đúng định dạng tệp gốc, Xuất Word/Text, Sửa, Xóa */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setKbViewingDoc(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Xem toàn văn nội dung tài liệu"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem trước</span>
                            </button>

                            {doc.fileName ? (
                              <button
                                type="button"
                                onClick={() => downloadOriginalUploadedFile(doc)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                                title={`Tải về đúng file gốc ${doc.fileName} đã tải lên`}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Tải .{doc.fileName.split('.').pop()?.toUpperCase()}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => exportKnowledgeDocToWord(doc)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                                title="Xuất file Microsoft Word (.doc) quy chuẩn"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Tải Word</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => exportKnowledgeDocToTxt(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Tải về file văn bản thuần (.txt)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Text</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openKbEditModal(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="Chỉnh sửa hoặc bổ sung tệp đính kèm mới"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Sửa</span>
                            </button>

                            {!doc.isBuiltIn && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Xác nhận xóa tài liệu '${doc.title}' khỏi cơ sở dữ liệu đối chiếu?`)) {
                                    deleteCustomKnowledgeDocument(doc.id);
                                    refreshKnowledgeDocs();
                                    pushToCloud(events, schedules, syncCode, false);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs cursor-pointer transition-colors"
                                title="Xóa tài liệu nạp thêm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                                {/* Modal Chỉnh Sửa / Bổ Sung Tài Liệu */}
                {kbEditingDoc && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white border border-slate-200/80 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-amber-400" />
                            <span>Cập Nhật / Bổ Sung Tư Liệu</span>
                          </h3>
                          {kbEditingDoc.isBuiltIn && (
                            <p className="text-[11px] text-amber-400/90 mt-1">
                              🏛️ Bạn đang hiệu chỉnh văn bản pháp quy/tiêu chuẩn gốc. Hệ thống sẽ lưu thành phiên bản bổ sung cho đơn vị của bạn.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setKbEditingDoc(null)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-5 overflow-y-auto flex-1 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            Tên tài liệu / Văn bản / Giáo trình <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={kbEditTitle}
                            onChange={(e) => setKbEditTitle(e.target.value)}
                            placeholder="Ví dụ: Đề cương chi tiết môn Tiện CNC hoặc Giáo trình Khí cụ điện"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Mã ký hiệu</label>
                            <input
                              type="text"
                              value={kbEditCode}
                              onChange={(e) => setKbEditCode(e.target.value)}
                              placeholder="Mã số văn bản..."
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Môn học áp dụng</label>
                            <input
                              type="text"
                              value={kbEditSubject}
                              onChange={(e) => setKbEditSubject(e.target.value)}
                              placeholder="ALL hoặc Toán, Tiện CNC..."
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Cấp học / Trình độ</label>
                            <input
                              type="text"
                              value={kbEditLevel}
                              onChange={(e) => setKbEditLevel(e.target.value)}
                              placeholder="ALL, THPT, Trung cấp, Cao đẳng..."
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Phân loại</label>
                            <select
                              value={kbEditCategory}
                              onChange={(e) => setKbEditCategory(e.target.value as any)}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                            >
                              <option value="GIAO_TRINH">Giáo trình nghề</option>
                              <option value="DE_CUONG">Đề cương môn học</option>
                              <option value="PHAP_QUY">Văn bản pháp quy</option>
                              <option value="ATLD_5S">Tiêu chuẩn ATLĐ & 5S</option>
                            </select>
                          </div>
                        </div>

                        {/* Đính kèm / Đổi tệp tài liệu mới */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-amber-400">
                              <Paperclip className="w-4 h-4" />
                              <span>ĐÍNH KÈM HOẶC THAY THẾ TỆP TÀI LIỆU</span>
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">Word, PDF, Text...</span>
                          </label>

                          {!kbEditFileName ? (
                            <label className="block p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all text-center group">
                              <input
                                type="file"
                                accept=".docx,.doc,.pdf,.txt,.md,.rtf,.xlsx,.xls,.pptx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) processAttachedKnowledgeFile(file, true);
                                }}
                                className="hidden"
                              />
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                  {kbEditIsExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                </div>
                                <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                                  {kbEditIsExtracting ? 'Đang trích xuất nội dung...' : 'BẤM ĐỂ ĐÍNH KÈM TỆP VĂN BẢN'}
                                </div>
                              </div>
                            </label>
                          ) : (
                            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                                  <Paperclip className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-amber-950 truncate">{kbEditFileName}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {(kbEditFileSize / 1024).toFixed(1)} KB • {kbEditContent.length.toLocaleString()} ký tự
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <label className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors">
                                  Đổi tệp
                                  <input
                                    type="file"
                                    accept=".docx,.doc,.pdf,.txt,.md,.rtf,.xlsx,.xls,.pptx"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) processAttachedKnowledgeFile(file, true);
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setKbEditFileName('');
                                    setKbEditFileSize(0);
                                    setKbEditFileType('');
                                    setKbEditFileData('');
                                  }}
                                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                                  title="Gỡ tệp"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            Nội dung chi tiết (Dành cho AI đối chiếu và xuất văn bản)
                          </label>
                          <textarea
                            rows={8}
                            value={kbEditContent}
                            onChange={(e) => setKbEditContent(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="p-4 border-t border-slate-100 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setKbEditingDoc(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveKbEditDoc}
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Lưu Cập Nhật</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Thêm Tài Liệu Mới */}
                {kbShowAddModal && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white border border-slate-200/80 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-emerald-400" />
                          <span>Thêm Tư Liệu Đối Chiếu AI Mới</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setKbShowAddModal(false)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-5 overflow-y-auto flex-1 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            Tên tài liệu / Văn bản / Giáo trình <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={kbNewTitle}
                            onChange={(e) => setKbNewTitle(e.target.value)}
                            placeholder="Ví dụ: Đề cương chi tiết môn Tiện CNC Lớp 11 hoặc Giáo trình Khí cụ điện"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Mã ký hiệu (tùy chọn)</label>
                            <input
                              type="text"
                              value={kbNewCode}
                              onChange={(e) => setKbNewCode(e.target.value)}
                              placeholder="Ví dụ: DC-TIEN-11"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Môn học áp dụng</label>
                            <input
                              type="text"
                              value={kbNewSubject}
                              onChange={(e) => setKbNewSubject(e.target.value)}
                              placeholder="ALL hoặc Toán, Tiện CNC..."
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Cấp học / Trình độ</label>
                            <input
                              type="text"
                              value={kbNewLevel}
                              onChange={(e) => setKbNewLevel(e.target.value)}
                              placeholder="ALL, THPT, Trung cấp, Cao đẳng..."
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1.5">Phân loại</label>
                            <select
                              value={kbNewCategory}
                              onChange={(e) => setKbNewCategory(e.target.value as any)}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="GIAO_TRINH">Giáo trình nghề</option>
                              <option value="DE_CUONG">Đề cương môn học</option>
                              <option value="PHAP_QUY">Văn bản pháp quy</option>
                              <option value="ATLD_5S">Tiêu chuẩn ATLĐ & 5S</option>
                            </select>
                          </div>
                        </div>

                        {/* Khu vực đính kèm file tài liệu thông minh */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <Paperclip className="w-4 h-4" />
                              <span>ĐÍNH KÈM TỆP TÀI LIỆU (Word, PDF, Text...)</span>
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">Tự động nạp vào AI</span>
                          </label>

                          {!kbAttachedFileName ? (
                            <label className="block p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all text-center group">
                              <input
                                type="file"
                                accept=".docx,.doc,.pdf,.txt,.md,.rtf,.xlsx,.xls,.pptx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) processAttachedKnowledgeFile(file, false);
                                }}
                                className="hidden"
                              />
                              <div className="flex flex-col items-center justify-center gap-2">
                                <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                  {kbIsExtracting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                </div>
                                <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                                  {kbIsExtracting ? 'Đang đọc và trích xuất nội dung văn bản...' : 'BẤM ĐỂ CHỌN HOẶC KÉO THẢ TỆP TÀI LIỆU VÀO ĐÂY'}
                                </div>
                                <p className="text-[11px] text-slate-500 max-w-md">
                                  Hỗ trợ Word (.docx, .doc), PDF (.pdf), Text (.txt, .md)... Hệ thống tự động trích xuất nội dung và lấy tên file làm tiêu đề (Không cần copy - paste).
                                </p>
                              </div>
                            </label>
                          ) : (
                            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                                  <Paperclip className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs sm:text-sm font-bold text-emerald-300 truncate">{kbAttachedFileName}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {(kbAttachedFileSize / 1024).toFixed(1)} KB • Đã trích xuất {kbNewContent.length.toLocaleString()} ký tự cho AI
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <label className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                                  Đổi tệp
                                  <input
                                    type="file"
                                    accept=".docx,.doc,.pdf,.txt,.md,.rtf,.xlsx,.xls,.pptx"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) processAttachedKnowledgeFile(file, false);
                                    }}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setKbAttachedFileName('');
                                    setKbAttachedFileSize(0);
                                    setKbAttachedFileType('');
                                    setKbAttachedFileData('');
                                    setKbNewContent('');
                                  }}
                                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                                  title="Gỡ tệp"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">
                            {kbAttachedFileName ? 'Nội dung trích xuất từ tệp (Sẵn sàng cho AI đối chiếu)' : 'Nội dung văn bản (hoặc đính kèm file ở trên)'}
                          </label>
                          <textarea
                            rows={7}
                            value={kbNewContent}
                            onChange={(e) => setKbNewContent(e.target.value)}
                            placeholder="Nội dung được tự động điền khi Thầy/Cô đính kèm file ở trên, hoặc có thể dán/chỉnh sửa trực tiếp tại đây..."
                            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                          />
                        </div>
                      </div>
                      <div className="p-4 border-t border-slate-100 flex justify-end gap-2.5">
                        <button type="button" onClick={() => setKbShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer">
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!kbNewTitle.trim() || (!kbNewContent.trim() && !kbAttachedFileName)) {
                              alert('Vui lòng nhập Tên tài liệu hoặc đính kèm tệp!');
                              return;
                            }
                            const newDoc: KnowledgeDocument = {
                              id: 'custom-' + Date.now(),
                              code: kbNewCode.trim() || ('DOC_' + (Date.now() % 10000)),
                              title: kbNewTitle.trim(),
                              category: kbNewCategory,
                              subject: kbNewSubject.trim() || 'ALL',
                              targetLevel: kbNewLevel.trim() || 'ALL',
                              content: kbNewContent.trim() || ('Tài liệu đính kèm: ' + kbAttachedFileName),
                              isBuiltIn: false,
                              isActive: true,
                              createdAt: new Date().toISOString(),
                              fileName: kbAttachedFileName || undefined,
                              fileSize: kbAttachedFileSize || undefined,
                              fileType: kbAttachedFileType || undefined,
                              fileData: kbAttachedFileData || undefined,
                              updatedAt: Date.now()
                            };
                            const savedOk = saveKnowledgeDocument(newDoc);
                            if (savedOk) {
                              refreshKnowledgeDocs();
                              pushToCloud(events, schedules, syncCode, false);
                              setKbFilter('ALL'); // Reset filter to ALL so document is immediately displayed!
                              setKbSearch('');    // Clear any search term
                              setKbShowAddModal(false);
                              setKbNewTitle('');
                              setKbNewCode('');
                              setKbNewContent('');
                              setKbAttachedFileName('');
                              setKbAttachedFileSize(0);
                              setKbAttachedFileType('');
                              setKbAttachedFileData('');
                              alert('Đã lưu thành công tài liệu vào kho tư liệu đối chiếu chuẩn của AI!');
                            } else {
                              alert('Lỗi: Bộ nhớ trình duyệt không thể lưu tài liệu! Vui lòng thử lại.');
                            }
                          }}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
                        >
                          Lưu Vào Kho Tư Liệu
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: CÀI ĐẶT & ĐỒNG BỘ ĐÁM MÂY ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Theme Selector Card */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Giao Diện Ứng Dụng (Chế Độ Sáng / Tối)
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {theme === 'dark' ? 'Đang bật Giao diện Tối' : 'Đang bật Giao diện Sáng'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tùy chỉnh tone màu làm việc phù hợp điều kiện ánh sáng và bảo vệ mắt giáo viên khi làm việc ban đêm</p>
                  </div>
                </div>
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Giao diện Sáng</span>
                  </button>
                  <button
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-900 text-amber-400 shadow-xs border border-slate-700'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Giao diện Tối</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                💡 Cài đặt giao diện được lưu tự động trên thiết bị này. Khi chuyển đổi, toàn bộ văn bản, thẻ tính năng, lịch giảng dạy và trợ lý AI sẽ tự động đồng bộ tone màu tương phản cao sắc nét.
              </p>
            </div>
            {/* Version Badge & Info */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-rose-500/20">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      Smart Teacher Schedule AI
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                        v1.5.0
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Đơn vị phát triển: Huy Technology AI • Hotline/Zalo: 0961364600</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  ✓ Phiên bản chính thức v1.5.0
                </span>
              </div>
              <div className="text-xs text-slate-600 grid sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Nền tảng: <strong className="text-slate-800">Desktop (PC/Laptop), Android & Web App</strong></div>
                <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Cơ sở dữ liệu: <strong className="text-slate-800">Supabase Cloud Sync & Local Offline</strong></div>
                <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Trợ lý AI: <strong className="text-slate-800">Soạn giáo án CV 5512, Đề thi TT 22, Slide, Mindmap</strong></div>
                <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Tính năng v1.5.0: <strong className="text-emerald-700 font-semibold">Sổ lớp, Điểm danh 1 chạm, Command Center & Khóa PIN</strong></div>
              </div>
            </div>

            {/* Cloud Sync Settings */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-sm">
                  <Cloud className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Đồng Bộ Đám Mây Đa Nền Tảng</h3>
                  <p className="text-xs text-slate-500">Kết nối tức thời Máy tính (Windows/Mac) và Điện thoại Android (Tecno, Samsung...)</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-medium text-slate-700 block">
                  Mã đồng bộ cá nhân của Thầy/Cô (Số điện thoại hoặc mã định danh):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={syncInput}
                    onChange={(e) => setSyncInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-sm"
                  />
                  <button
                    onClick={() => {
                      const clean = syncInput.trim();
                      if (clean) {
                        setSyncCode(clean);
                        localStorage.setItem('smart_teacher_sync_code', clean);
                        pushToCloud(events, schedules, clean, true);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Đẩy lên ĐT</span>
                  </button>
                  <button
                    onClick={() => {
                      const clean = syncInput.trim();
                      if (clean) {
                        setSyncCode(clean);
                        localStorage.setItem('smart_teacher_sync_code', clean);
                        syncBothWays(clean, true);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Đồng bộ 2 chiều</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" /> Hướng dẫn đồng bộ với điện thoại Android:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                    <li>Mở ứng dụng <strong className="text-slate-800">Smart Teacher Schedule</strong> trên điện thoại.</li>
                    <li>Vào mục <strong className="text-slate-800">Cài đặt</strong> ➔ Kiểm tra mã đồng bộ có khớp <strong className="text-rose-600 font-mono font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{syncCode}</strong> chưa.</li>
                    <li>Bấm nút <strong className="text-slate-800">Đồng bộ đám mây ngay</strong> trên điện thoại.</li>
                    <li>Toàn bộ {events.length} ca dạy sẽ tự động hiển thị đầy đủ trên cả máy tính và điện thoại.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Sound & Notifications */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-sm">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Chuông Báo & Thông Báo Tiết Dạy</h3>
                    <p className="text-xs text-slate-500">Âm thanh Crystal Chime nhắc giờ 60p và 15p</p>
                  </div>
                </div>

                <button
                  onClick={() => playChime('bell')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-600" /> Thử chuông
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-medium text-slate-800">Nhắc nhở trước 60 phút (Chuẩn bị giáo án & vật tư)</span>
                  <input
                    type="checkbox"
                    checked={notify60m}
                    onChange={(e) => setNotify60m(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500/20 cursor-pointer w-4 h-4"
                  />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs font-medium text-slate-800">Chuông báo khẩn cấp trước 15 phút (Vào phòng học/xưởng)</span>
                  <input
                    type="checkbox"
                    checked={notify15m}
                    onChange={(e) => setNotify15m(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500/20 cursor-pointer w-4 h-4"
                  />
                </div>
              </div>
            </div>

            {/* Data Backup */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Sao lưu & Xuất Dữ Liệu Máy Tính</span>
              </h4>
              <p className="text-xs text-slate-500">
                Xuất file sao lưu JSON chứa toàn bộ {events.length} ca dạy để lưu trữ an toàn trên ổ đĩa máy tính.
              </p>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify({ events, schedules, syncCode, exportedAt: new Date().toISOString() }, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `SmartTeacher_Backup_${events.length}Ca_${todayStr}.json`;
                  a.click();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-700" /> Tải file sao lưu JSON ({events.length} ca)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: THÊM CA DẠY MỚI TRÊN MÁY TÍNH ================= */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Thêm Ca Dạy Mới (Tự Động Đồng Bộ Điện Thoại)</span>
              </h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Tên môn học / Module: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Tiện CNC Cơ Bản, Công Nghệ 12..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Lớp giảng dạy: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 12A2, CG24TC34..."
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Phòng học / Xưởng:</label>
                  <input
                    type="text"
                    placeholder="VD: S3.05/2, Xưởng Cơ khí..."
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Giờ bắt đầu: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Giờ kết thúc: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Khung giờ chọn nhanh */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 mr-1">Khung giờ:</span>
                <button
                  type="button"
                  onClick={() => { setNewStartTime('07:00'); setNewEndTime('08:35'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Tiết 1-2 (07:00-08:35)
                </button>
                <button
                  type="button"
                  onClick={() => { setNewStartTime('08:50'); setNewEndTime('10:25'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Tiết 3-4 (08:50-10:25)
                </button>
                <button
                  type="button"
                  onClick={() => { setNewStartTime('13:00'); setNewEndTime('14:35'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Tiết 7-8 (13:00-14:35)
                </button>
                <button
                  type="button"
                  onClick={() => { setNewStartTime('07:00'); setNewEndTime('11:00'); setNewSessionType('Thực hành'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Ca xưởng sáng (07:00-11:00)
                </button>
                <button
                  type="button"
                  onClick={() => { setNewStartTime('13:00'); setNewEndTime('17:00'); setNewSessionType('Thực hành'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Ca xưởng chiều (13:00-17:00)
                </button>
              </div>

              {/* Session Type */}
              <div>
                <label className="text-slate-700 font-medium block mb-1">Hình thức giảng dạy:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewSessionType('Lý thuyết')}
                    className={`py-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      newSessionType === 'Lý thuyết'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    📖 Lý thuyết
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSessionType('Thực hành')}
                    className={`py-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                      newSessionType === 'Thực hành'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚙️ Thực hành
                  </button>
                </div>
              </div>

              {/* ================= KHUNG CHỌN LỊCH: NGÀY BẮT ĐẦU & NGÀY KẾT THÚC ================= */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Thời gian hiệu lực ca dạy
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {newCreateRecurring ? 'Lặp định kỳ hàng tuần' : 'Chỉ 1 buổi duy nhất'}
                  </span>
                </div>

                {/* Chọn kiểu lặp */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewCreateRecurring(true)}
                    className={`py-1.5 px-2 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCreateRecurring
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🔄 Toàn học kỳ (Lặp lại)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCreateRecurring(false);
                      setNewEndDate(newStartDate || newDate);
                    }}
                    className={`py-1.5 px-2 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                      !newCreateRecurring
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>📌 Chỉ 1 buổi duy nhất</span>
                  </button>
                </div>

                {/* Lưới Ngày Bắt Đầu & Ngày Kết Thúc */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-700 font-semibold block mb-1 flex items-center gap-1">
                      <span>Ngày bắt đầu:</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={newStartDate || newDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewStartDate(val);
                        setNewDate(val);
                        if (newEndDate && val > newEndDate) {
                          setNewEndDate(addMonthsToDate(val, 5));
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
                      🗓️ {getDayInfo(newStartDate || newDate).dayName}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-700 font-semibold block mb-1">
                      <span>Ngày kết thúc:</span>
                      {newCreateRecurring && <span className="text-rose-400"> *</span>}
                    </label>
                    <input
                      type="date"
                      disabled={!newCreateRecurring}
                      value={newCreateRecurring ? (newEndDate || addMonthsToDate(newStartDate || newDate, 5)) : (newStartDate || newDate)}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className={`w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${
                        !newCreateRecurring ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {newCreateRecurring ? `🗓️ ${getDayInfo(newEndDate || addMonthsToDate(newStartDate || newDate, 5)).dayName}` : 'Cùng ngày bắt đầu'}
                    </span>
                  </div>
                </div>

                {/* Phím tắt chọn nhanh chu kỳ học kỳ */}
                {newCreateRecurring && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 mr-1">Chọn nhanh:</span>
                    <button
                      type="button"
                      onClick={() => setNewEndDate(addMonthsToDate(newStartDate || newDate, 5))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 cursor-pointer transition-all"
                    >
                      Học kỳ 1 (+5 tháng)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEndDate(addMonthsToDate(newStartDate || newDate, 9))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 cursor-pointer transition-all"
                    >
                      Cả năm (+9 tháng)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEndDate(addMonthsToDate(newStartDate || newDate, 2.5))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 cursor-pointer transition-all"
                    >
                      Nửa kỳ (+10 tuần)
                    </button>
                  </div>
                )}

                {/* Banner tóm tắt trực quan */}
                {(() => {
                  const curStart = newStartDate || newDate || todayStr;
                  const curEnd = newEndDate || addMonthsToDate(curStart, 5);
                  const dayInfo = getDayInfo(curStart);
                  const endInfo = getDayInfo(curEnd);
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">ℹ️</span>
                      <div>
                        {newCreateRecurring ? (
                          <span>
                            Ca dạy sẽ bắt đầu từ <strong>{dayInfo.dayName} ({curStart})</strong>, tự động xếp lịch vào mỗi <strong>{dayInfo.dayName}</strong> hàng tuần cho đến hết ngày <strong>{endInfo.dayName} ({curEnd})</strong> và đồng bộ sang Điện thoại.
                          </span>
                        ) : (
                          <span>
                            Ca dạy chỉ diễn ra <strong>1 buổi duy nhất</strong> vào <strong>{dayInfo.dayName}</strong>, ngày <strong>{curStart}</strong>.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Ghi chú (tùy chọn):</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ghi chú bài học, phòng máy, dặn dò học sinh..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleCreateNewEvent}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                Lưu & Đẩy lên Đám Mây
              </button>
            </div>
          </div>
        </div>
      )}

            {/* ================= MODAL: CHỈNH SỬA CA DẠY (UNIFIED EDIT MODAL) ================= */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <span>Chỉnh Sửa Ca Dạy & Tiến Độ</span>
              </h3>
              <button onClick={() => setEditingEvent(null)} className="text-slate-400 hover:text-slate-700">
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
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Lớp giảng dạy:</label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Phòng học / Xưởng:</label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
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
                        : 'bg-slate-100 text-slate-700 border-slate-200'
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
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ⚙️ Thực hành
                  </button>
                </div>
              </div>

              {/* Date range update (User Request 2) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
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
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block">Kết thúc:</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-mono text-xs"
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
                    className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-0"
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
                    className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-0"
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
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-600/25 cursor-pointer"
              >
                Lưu thay đổi & Đồng bộ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ĐÍNH KÈM TÀI LIỆU (ATTACH FILE) ================= */}
      {attachingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-blue-400" />
                <span>Đính Kèm Giáo Án / Tài Liệu</span>
              </h3>
              <button onClick={() => setAttachingEvent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 font-medium">
                Ca dạy: <span className="text-white font-bold">{attachingEvent.subject}</span> ({attachingEvent.className})
              </p>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Tên tài liệu / Giáo án:</label>
                <input
                  type="text"
                  placeholder="VD: Giao_an_Module_Tien_CNC_Bai_1.pdf"
                  value={attachFileName}
                  onChange={(e) => setAttachFileName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Đường dẫn tài liệu (Drive / Link file):</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/..."
                  value={attachFileUrl}
                  onChange={(e) => setAttachFileUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAttachingEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
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
      <AIAssistantWidget />

      {/* ================= 1-TAP ATTENDANCE SESSION MODAL ================= */}
      {attendanceEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in text-slate-800">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-white flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    📋 ĐIỂM DANH 1-CHẠM
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {attendanceEvent.startTime} - {attendanceEvent.endTime} • Ngày {attendanceEvent.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {attendanceEvent.subject} - Lớp {attendanceEvent.className}
                </h3>
                <p className="text-xs text-slate-400">
                  Phòng: {attendanceEvent.room} • Thao tác: Chạm 1 lần vào thẻ học sinh để đổi trạng thái Có mặt / Vắng / Đi trễ.
                </p>
              </div>

              <button
                onClick={() => setAttendanceEvent(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance Status Summary Counters */}
            {(() => {
              const recs = Object.values(sessionAttendanceMap);
              const presentCount = recs.filter(r => r.status === 'PRESENT').length;
              const excusedCount = recs.filter(r => r.status === 'ABSENT_EXCUSED').length;
              const unexcusedCount = recs.filter(r => r.status === 'ABSENT_UNEXCUSED').length;
              const lateCount = recs.filter(r => r.status === 'LATE').length;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b border-slate-100 bg-slate-50">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2.5 text-center">
                    <p className="text-[11px] text-emerald-400 font-semibold">🟢 Có mặt</p>
                    <p className="text-xl font-black text-emerald-300">{presentCount}/{recs.length}</p>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 text-center">
                    <p className="text-[11px] text-amber-700 font-semibold">🟡 Vắng có phép</p>
                    <p className="text-xl font-black text-amber-800">{excusedCount}</p>
                  </div>
                  <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-2.5 text-center">
                    <p className="text-[11px] text-rose-400 font-semibold">🔴 Vắng không phép</p>
                    <p className="text-xl font-black text-rose-300">{unexcusedCount}</p>
                  </div>
                  <div className="bg-orange-950/30 border border-orange-500/30 rounded-xl p-2.5 text-center">
                    <p className="text-[11px] text-orange-400 font-semibold">🟠 Đi trễ</p>
                    <p className="text-xl font-black text-orange-300">{lateCount}</p>
                  </div>
                </div>
              );
            })()}

            {/* Students Grid */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {getStudentsByClass(attendanceEvent.className).map(st => {
                const rec = sessionAttendanceMap[st.id] || { status: 'PRESENT', kudosDelta: 0 };
                const isPresent = rec.status === 'PRESENT';
                const isExcused = rec.status === 'ABSENT_EXCUSED';
                const isUnexcused = rec.status === 'ABSENT_UNEXCUSED';
                const isLate = rec.status === 'LATE';

                return (
                  <div
                    key={st.id}
                    className={`border rounded-2xl p-3.5 transition-all flex flex-col justify-between gap-2.5 cursor-pointer select-none ${
                      isPresent
                        ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                        : isExcused
                        ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400'
                        : isUnexcused
                        ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400'
                        : 'bg-orange-950/20 border-orange-500/50 hover:border-orange-400'
                    }`}
                  >
                    <div
                      onClick={() => cycleAttendanceStatus(st.id)}
                      className="flex items-start justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isPresent ? 'bg-emerald-500/20 text-emerald-300' : isExcused ? 'bg-amber-500/20 text-amber-300' : isUnexcused ? 'bg-rose-500/20 text-rose-300' : 'bg-orange-500/20 text-orange-300'
                        }`}>
                          {st.fullName.trim().charAt(st.fullName.trim().lastIndexOf(' ') + 1) || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white">{st.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{st.studentCode}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                        isPresent
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : isExcused
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : isUnexcused
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      }`}>
                        {isPresent ? '🟢 Có mặt' : isExcused ? '🟡 Vắng (CP)' : isUnexcused ? '🔴 Vắng (KP)' : '🟠 Đi trễ'}
                      </span>
                    </div>

                    {/* Quick Kudos Praise Buttons in Session */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addSessionKudos(st.id, 1, 'Phát biểu trong ca học');
                          }}
                          className="px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-[10px] font-bold"
                        >
                          +1 Phát biểu
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addSessionKudos(st.id, 2, 'Làm bài xuất sắc');
                          }}
                          className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[10px] font-bold"
                        >
                          +2 Bài tốt
                        </button>
                      </div>

                      {(rec.kudosDelta || 0) > 0 && (
                        <span className="text-[11px] text-amber-700 font-bold">+{rec.kudosDelta}đ</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Action Bar */}
            <div className="p-4 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Tất cả có mặt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const classStudents = getStudentsByClass(attendanceEvent.className);
                    exportAttendanceToCsv(attendanceEvent.subject, attendanceEvent.className, attendanceEvent.date, classStudents, sessionAttendanceMap);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV / Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAttendanceZalo}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Báo cáo Zalo</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceEvent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu & Đồng bộ Cloud</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM HỌC SINH MỚI ================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-white">Thêm Học Sinh Mới</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Lớp học</label>
                <select
                  value={selectedRosterClass}
                  onChange={(e) => setSelectedRosterClass(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                >
                  {classrooms.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Họ và tên học sinh *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="VD: Nguyễn Hoàng Nam"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mã số HS</label>
                  <input
                    type="text"
                    value={newStudentCode}
                    onChange={(e) => setNewStudentCode(e.target.value)}
                    placeholder="VD: CG24-10"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Giới tính</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">SĐT Phụ huynh</label>
                <input
                  type="tel"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="VD: 0981234567"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Ghi chú</label>
                <input
                  type="text"
                  value={newStudentNotes}
                  onChange={(e) => setNewStudentNotes(e.target.value)}
                  placeholder="VD: Tổ trưởng, khéo tay..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!newStudentName.trim()) {
                    alert('Vui lòng nhập họ và tên học sinh!');
                    return;
                  }
                  const code = newStudentCode.trim() || `${selectedRosterClass}-${String(students.length + 1).padStart(2, '0')}`;
                  const newStd: Student = {
                    id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    classId: selectedRosterClass,
                    className: selectedRosterClass,
                    studentCode: code,
                    fullName: newStudentName.trim(),
                    gender: newStudentGender,
                    parentPhone: newStudentPhone.trim(),
                    kudosPoints: 5,
                    notes: newStudentNotes.trim(),
                    updatedAt: Date.now()
                  };
                  const updated = saveStudent(newStd);
                  setStudents(updated);
                  setNewStudentName('');
                  setNewStudentCode('');
                  setNewStudentPhone('');
                  setNewStudentNotes('');
                  setShowAddStudentModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Lưu học sinh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DÁN DANH SÁCH HỌC SINH TỪ EXCEL/WORD ================= */}
      {showImportRosterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Nhập Danh Sách Nhanh Cho Lớp {selectedRosterClass}</span>
              </h3>
              <button onClick={() => setShowImportRosterModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* File Dropzone / Upload Box */}
            <div
              onClick={() => rosterFileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/30 rounded-2xl p-4 text-center cursor-pointer transition-all mb-3"
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-emerald-300">
                Bấm vào đây để Chọn file Excel (.xlsx, .xls) hoặc Word (.docx)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hệ thống tự động trích xuất Họ tên, Mã số HS, Giới tính và SĐT Phụ huynh
              </p>
            </div>
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Hoặc dán trực tiếp danh sách</span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            <p className="text-xs text-slate-400 mb-2">
              Dán danh sách học sinh từ Excel, Word hoặc văn bản. Mỗi học sinh một dòng. Có thể dán cột Họ tên hoặc các cột: Mã HS [tab] Họ tên [tab] Giới tính [tab] SĐT.
            </p>
            <textarea
              rows={8}
              value={importRosterText}
              onChange={(e) => setImportRosterText(e.target.value)}
              placeholder="1. Nguyễn Văn An
2. Trần Thị Bích
3. Lê Hoàng Dũng..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowImportRosterModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!importRosterText.trim()) {
                    alert('Vui lòng dán danh sách học sinh vào ô văn bản!');
                    return;
                  }
                  const updated = importStudentsFromText(selectedRosterClass, selectedRosterClass, importRosterText);
                  setStudents(updated);
                  setImportRosterText('');
                  setShowImportRosterModal(false);
                  alert(`Đã nhập thành công danh sách học sinh vào lớp ${selectedRosterClass}!`);
                }}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Nhập danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM LỚP HỌC MỚI ================= */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-white">Thêm Lớp Học Mới</h3>
              <button onClick={() => setShowAddClassModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tên lớp học * (VD: 11A2, CĐCK03)</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="VD: 11A2"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Khối / Bậc đào tạo</label>
                <input
                  type="text"
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(e.target.value)}
                  placeholder="VD: Khối 11 hoặc Cao đẳng K03"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowAddClassModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!newClassName.trim()) {
                    alert('Vui lòng nhập tên lớp!');
                    return;
                  }
                  const newCls: Classroom = {
                    id: `cls_${newClassName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                    name: newClassName.trim().toUpperCase(),
                    grade: newClassGrade.trim(),
                    totalStudents: 0,
                    academicYear: '2024-2025',
                    updatedAt: Date.now()
                  };
                  const updated = saveClassroom(newCls);
                  setClassrooms(updated);
                  setSelectedRosterClass(newCls.name);
                  setNewClassName('');
                  setNewClassGrade('');
                  setShowAddClassModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Tạo lớp
              </button>
            </div>
          </div>
        </div>
      )}

    
      {/* Modal Xem Toàn Văn (Preview & Export Toolbar) */}
                {kbViewingDoc && (
                  <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className={`bg-white border border-slate-200/80 rounded-2xl flex flex-col shadow-2xl transition-all ${kbPreviewFullScreen ? 'fixed inset-2 z-50 max-w-none max-h-none h-[calc(100vh-16px)]' : 'max-w-4xl w-full max-h-[90vh]'}`}>
                      {/* Header */}
                      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              {kbViewingDoc.code}
                            </span>
                            <span className="text-xs text-slate-400">
                              Môn: <strong className="text-slate-200">{kbViewingDoc.subject}</strong> • Cấp: <strong className="text-slate-200">{kbViewingDoc.targetLevel}</strong>
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                              {kbViewingDoc.category === 'GIAO_TRINH' ? '📘 Giáo trình nghề' :
                               kbViewingDoc.category === 'DE_CUONG' ? '📋 Đề cương môn học' :
                               kbViewingDoc.category === 'PHAP_QUY' ? '🏛️ Văn bản pháp quy' :
                               kbViewingDoc.category === 'ATLD_5S' ? '🛡️ Tiêu chuẩn ATLĐ & 5S' : '📄 Tư liệu'}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                            {kbViewingDoc.title}
                          </h3>
                          {kbViewingDoc.fileName && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg w-fit border border-emerald-500/20">
                              <Paperclip className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="font-semibold">{kbViewingDoc.fileName}</span>
                              {kbViewingDoc.fileSize ? (
                                <span className="text-slate-400 text-[11px]">
                                  ({(kbViewingDoc.fileSize / 1024).toFixed(0)} KB)
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>

                        {/* Actions: Zoom, Copy, Print, Fullscreen, Close */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Zoom Controls */}
                          <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setKbPreviewZoom(z => Math.max(70, z - 15))}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                              title="Thu nhỏ (-)"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setKbPreviewZoom(100)}
                              className="text-[11px] text-slate-700 font-mono px-1.5 hover:text-slate-900 cursor-pointer"
                              title="Tỷ lệ 100%"
                            >
                              {kbPreviewZoom}%
                            </button>
                            <button
                              type="button"
                              onClick={() => setKbPreviewZoom(z => Math.min(180, z + 15))}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                              title="Phóng to (+)"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Copy Text */}
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(kbViewingDoc.content);
                              setKbCopied(true);
                              setTimeout(() => setKbCopied(false), 2000);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-1 text-xs"
                            title="Sao chép toàn bộ văn bản"
                          >
                            {kbCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden md:inline text-[11px] font-medium">{kbCopied ? 'Đã chép' : 'Chép'}</span>
                          </button>

                          {/* Print */}
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
                            title="In / Xuất PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Fullscreen Toggle */}
                          <button
                            type="button"
                            onClick={() => setKbPreviewFullScreen(f => !f)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
                            title={kbPreviewFullScreen ? "Thu nhỏ cửa sổ" : "Phóng to toàn màn hình"}
                          >
                            {kbPreviewFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Close */}
                          <button
                            type="button"
                            onClick={() => {
                              setKbViewingDoc(null);
                              setKbPreviewFullScreen(false);
                              setKbPreviewSearchTerm('');
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer ml-0.5"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Preview: Hỗ trợ xem trực quan PDF hoặc xem toàn văn nội dung trích xuất */}
                      {kbPreviewIsLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 min-h-[450px]">
                          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                          <div className="text-sm font-semibold text-emerald-400">
                            {kbPreviewStatusText || 'Đang xử lý tài liệu...'}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Hệ thống đang giải mã và trích xuất từng trang
                          </div>
                        </div>
                      ) : kbViewingDoc.fileName?.toLowerCase().endsWith('.pdf') && kbPreviewPdfUrl && kbPreviewMode !== 'TEXT' ? (
                        <div className="flex-1 flex flex-col p-4 bg-slate-50 overflow-hidden min-h-[550px]">
                          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 text-xs text-slate-300">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <FileText className="w-4 h-4" />
                              <span>Bản xem trước PDF trực quan nguyên bản gốc</span>
                            </span>
                            <div className="flex items-center gap-3">
                              {kbPreviewPdfUrl && (
                                <button
                                  type="button"
                                  onClick={() => window.open(kbPreviewPdfUrl, '_blank')}
                                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
                                  title="Mở PDF trong tab mới của trình duyệt"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Mở tab riêng</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setKbPreviewMode('TEXT')}
                                className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer font-medium"
                              >
                                Chuyển sang xem toàn văn trích xuất AI
                              </button>
                            </div>
                          </div>
                          <iframe
                            src={kbPreviewPdfUrl}
                            className="w-full flex-1 rounded-xl border border-slate-200 bg-white"
                            style={{ minHeight: '520px' }}
                            title={kbViewingDoc.title}
                          />
                        </div>
                      ) : (
                        <div className="p-5 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50">
                          {/* Search inside doc bar */}
                          <div className="mb-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={kbPreviewSearchTerm}
                              onChange={(e) => setKbPreviewSearchTerm(e.target.value)}
                              placeholder="Tìm kiếm từ khoá trong văn bản (ví dụ: 'Điều 1', 'Mục tiêu', 'Thời lượng')..."
                              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 font-sans"
                            />
                            {kbPreviewSearchTerm && (
                              <button
                                type="button"
                                onClick={() => setKbPreviewSearchTerm('')}
                                className="text-slate-400 hover:text-white text-xs cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Card nhắc nạp tệp nếu tài liệu cũ chưa có tệp đệm trong IndexedDB */}
                          {!kbPreviewPdfUrl && kbViewingDoc.fileName?.toLowerCase().endsWith('.pdf') && (
                            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-amber-950">
                                    Kích hoạt xem trực quan & Trích xuất toàn văn cho tài liệu này
                                  </div>
                                  <div className="text-[11px] text-slate-600">
                                    Tài liệu này được lưu từ phiên bản trước. Thầy/Cô hãy chọn tệp <strong>{kbViewingDoc.fileName}</strong> một lần để nạp bộ nhớ đệm và hiển thị PDF trực quan!
                                  </div>
                                </div>
                              </div>
                              <label className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>Chọn tệp để xem ngay</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.docx,.doc,.txt"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAttachFileToCurrentDoc(file, kbViewingDoc);
                                  }}
                                />
                              </label>
                            </div>
                          )}

                          {kbViewingDoc.fileName?.toLowerCase().endsWith('.pdf') && (
                            <div className="mb-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                              <span className="text-xs text-blue-300 font-medium">Đang hiển thị toàn văn nội dung văn bản trích xuất cho AI</span>
                              {kbPreviewPdfUrl && (
                                <button
                                  type="button"
                                  onClick={() => setKbPreviewMode('AUTO')}
                                  className="text-xs text-emerald-400 hover:text-emerald-300 underline cursor-pointer font-semibold"
                                >
                                  Chuyển sang xem PDF trực quan
                                </button>
                              )}
                            </div>
                          )}

                          <div style={{ fontSize: `${kbPreviewZoom}%` }} className="leading-relaxed selection:bg-emerald-500/30">
                            {kbPreviewSearchTerm.trim() ? (
                              <div>
                                <div className="mb-2.5 text-xs text-emerald-400 font-semibold border-b border-slate-100 pb-1.5 flex items-center justify-between">
                                  <span>Đoạn trích chứa từ khoá: &quot;{kbPreviewSearchTerm}&quot;</span>
                                  <button
                                    type="button"
                                    onClick={() => setKbPreviewSearchTerm('')}
                                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                                  >
                                    Xem toàn bộ văn bản
                                  </button>
                                </div>
                                {kbViewingDoc.content
                                  .split('\n')
                                  .filter(line => line.toLowerCase().includes(kbPreviewSearchTerm.toLowerCase()))
                                  .map((matchingLine, idx) => (
                                    <div key={idx} className="p-2 mb-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                                      {matchingLine}
                                    </div>
                                  ))}
                                {kbViewingDoc.content.toLowerCase().indexOf(kbPreviewSearchTerm.toLowerCase()) === -1 && (
                                  <div className="text-xs text-slate-400 italic">Không tìm thấy đoạn văn nào chứa từ khóa này.</div>
                                )}
                              </div>
                            ) : kbViewingDoc.content && (kbViewingDoc.content.includes('<table') || kbViewingDoc.content.includes('<html') || kbViewingDoc.content.includes('<div') || kbViewingDoc.content.includes('<!DOCTYPE')) ? (
                              <div
                                className="bg-white text-slate-900 p-6 rounded-xl overflow-x-auto shadow-inner font-sans selection:bg-blue-100"
                                dangerouslySetInnerHTML={{ __html: kbViewingDoc.content }}
                              />
                            ) : (
                              kbViewingDoc.content
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer Toolbar: Download Original File (Tải đúng định dạng), Export Word, Export Text, Edit, Close */}
                      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2.5 bg-white">
                        <div className="flex items-center gap-2 flex-wrap">
                          {kbViewingDoc.fileName ? (
                            <button
                              type="button"
                              onClick={() => downloadOriginalUploadedFile(kbViewingDoc)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/25 transition-all"
                              title={`Tải về đúng file gốc ${kbViewingDoc.fileName} đã tải lên`}
                            >
                              <Download className="w-4 h-4" />
                              <span>Tải về file gốc .{kbViewingDoc.fileName.split('.').pop()?.toUpperCase()}</span>
                            </button>
                          ) : null}

                                                    <button
                            type="button"
                            onClick={() => {
                              downloadWordDoc(kbViewingDoc.fileName || `${kbViewingDoc.title}.doc`, kbViewingDoc.content);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/25 transition-all"
                            title="Tải giáo án chuẩn Microsoft Word (.doc)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Tải Word (.doc)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => exportKnowledgeDocToWord(kbViewingDoc)}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20 transition-all"
                            title="Xuất file Microsoft Word (.doc) có quốc hiệu, trích yếu sư phạm"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Xuất bản Word (.doc)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => exportKnowledgeDocToTxt(kbViewingDoc)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Tải bản văn bản thô (.txt)"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Xuất Text (.txt)</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              openKbEditModal(kbViewingDoc);
                            }}
                            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            title="Cập nhật nội dung hoặc đính kèm tệp mới"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Chỉnh sửa / Cập nhật</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setKbViewingDoc(null)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                



      {/* MODAL TRÌNH GIẢNG DẠY & HỌC LIỆU 6-IN-1 (GIÁO ÁN, SLIDE, MINI GAME, MINDMAP, VIDEO, RUBRIC) */}
      {viewingLessonPackage && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
          <div className={`bg-white border border-slate-200/80 rounded-2xl flex flex-col shadow-2xl transition-all overflow-hidden ${
            lessonPackageFullScreen ? 'fixed inset-2 z-50 max-w-none max-h-none h-[calc(100vh-16px)]' : 'max-w-5xl w-full max-h-[92vh]'
          }`}>
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-xs text-purple-300 font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    HỒ SƠ BÀI GIẢNG 6-IN-1
                  </span>
                  <span className="text-xs text-sky-300 font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                    {viewingLessonPackage.standard === 5512 ? 'Chuẩn CV 5512/BGDĐT' : 'Chuẩn CV 2634/GDNN'}
                  </span>
                  <span className="text-xs text-slate-600">
                    Môn: <strong className="text-slate-900">{viewingLessonPackage.subject}</strong> • Lớp: <strong className="text-slate-900">{viewingLessonPackage.className}</strong>
                  </span>
                  {viewingLessonEvent && (
                    <span className="text-xs text-slate-400">
                      • {viewingLessonEvent.date} ({viewingLessonEvent.startTime || 'Ca dạy'} - {viewingLessonEvent.endTime || ''})
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-snug truncate">
                  BÀI DẠY: {viewingLessonPackage.lessonTitle.toUpperCase()}
                </h3>
              </div>

              {/* Action Toolbar Header */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Edit Lesson Plan Button */}
                <button
                  type="button"
                  onClick={() => handleStartEditLessonPackage(viewingLessonPackage)}
                  className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 cursor-pointer text-xs flex items-center gap-1.5"
                  title="Chỉnh sửa nội dung giáo án AI"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden md:inline font-semibold">Chỉnh sửa</span>
                </button>

                {/* Delete / Detach Lesson Plan Button */}
                <button
                  type="button"
                  onClick={() => handleRemoveEventAttachment(viewingLessonEvent || undefined, viewingLessonPackage)}
                  className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 cursor-pointer text-xs flex items-center gap-1.5"
                  title="Gỡ bỏ hoàn toàn giáo án này khỏi ca dạy"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden md:inline font-semibold">Gỡ bỏ</span>
                </button>

                {/* Print */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer text-xs flex items-center gap-1"
                  title="In tài liệu / Xuất PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden md:inline">In / PDF</span>
                </button>

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={() => setLessonPackageFullScreen(f => !f)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 cursor-pointer"
                  title={lessonPackageFullScreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
                >
                  {lessonPackageFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => {
                    setViewingLessonPackage(null);
                    setViewingLessonEvent(null);
                    setLessonPackageFullScreen(false);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer ml-1"
                  title="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TAB NAVIGATION BAR (7 HẠNG MỤC SƯ PHẠM ĐỒNG BỘ) */}
            <div className="flex items-center gap-1 px-3 sm:px-5 pt-2.5 border-b border-slate-100 bg-slate-50 overflow-x-auto shrink-0 scrollbar-thin">
              <button
                type="button"
                onClick={() => setLessonPackageActiveTab('plan')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  lessonPackageActiveTab === 'plan'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. Giáo Án Chuẩn</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonPackageActiveTab('slides')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  lessonPackageActiveTab === 'slides'
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>2. Slide Thuyết Trình ({viewingLessonPackage.slides.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonPackageActiveTab('game')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  lessonPackageActiveTab === 'game'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>3. Mini Game ({viewingLessonPackage.miniGame.length} Câu)</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonPackageActiveTab('mindmap')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  lessonPackageActiveTab === 'mindmap'
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>4. Sơ Đồ Tư Duy</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonPackageActiveTab('video')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  lessonPackageActiveTab === 'video'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>5. Video Học Liệu ({viewingLessonPackage.videoScript.length} Cảnh)</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonPackageActiveTab('audit')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  lessonPackageActiveTab === 'audit'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>6. Bảng Điểm Rubric ({viewingLessonPackage.auditScore.totalScore}đ)</span>
              </button>

              <button
                type="button"
                onClick={() => setLessonPackageActiveTab('all')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  lessonPackageActiveTab === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Toàn Bộ Hồ Sơ (All-in-One)</span>
              </button>
            </div>

            {/* TAB CONTENTS (Scrollable area) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 space-y-5">

              {/* FORM CHỈNH SỬA GIÁO ÁN AI (KHI ĐANG Ở EDIT MODE) */}
              {isEditingLessonPackage && (
                <div className="p-5 sm:p-6 bg-white border-2 border-purple-200 rounded-2xl shadow-sm space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-purple-400" />
                      <h4 className="text-base sm:text-lg font-bold text-white">Chỉnh Sửa Nội Dung Giáo Án AI Sư Phạm</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveLessonPackageEdit}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Lưu Thay Đổi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingLessonPackage(false)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Tên bài giảng / Kế hoạch bài dạy:</label>
                      <input
                        type="text"
                        value={editLessonTitle}
                        onChange={(e) => setEditLessonTitle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Môn học / Chuyên ngành:</label>
                      <input
                        type="text"
                        value={editLessonSubject}
                        onChange={(e) => setEditLessonSubject(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Lớp / Thời lượng (tiết/phút):</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editLessonClass}
                          onChange={(e) => setEditLessonClass(e.target.value)}
                          placeholder="10A1"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                        <input
                          type="number"
                          value={editLessonDuration}
                          onChange={(e) => setEditLessonDuration(Number(e.target.value))}
                          placeholder="45"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mục tiêu bài học */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-blue-400 uppercase">I. Mục tiêu bài dạy:</h5>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-0.5">1. Về Kiến thức:</label>
                        <textarea
                          rows={2}
                          value={editKnowledgeObj}
                          onChange={(e) => setEditKnowledgeObj(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-0.5">2. Về Năng lực:</label>
                        <textarea
                          rows={2}
                          value={editCompetenciesObj}
                          onChange={(e) => setEditCompetenciesObj(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-0.5">3. Về Phẩm chất:</label>
                        <textarea
                          rows={2}
                          value={editQualitiesObj}
                          onChange={(e) => setEditQualitiesObj(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thiết bị dạy học */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-blue-400 uppercase">II. Thiết bị dạy học và học liệu:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-0.5">Giáo viên:</label>
                        <textarea
                          rows={2}
                          value={editTeacherEquip}
                          onChange={(e) => setEditTeacherEquip(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-0.5">Học sinh:</label>
                        <textarea
                          rows={2}
                          value={editStudentEquip}
                          onChange={(e) => setEditStudentEquip(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Hoạt động dạy học */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h5 className="text-xs font-bold text-blue-400 uppercase">III. Tiến trình 4 Hoạt động dạy học:</h5>
                    
                    {/* HĐ 1 */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-white text-xs">1. Khởi động (Xác định vấn đề):</span>
                      <input
                        type="text"
                        value={editAct1Name}
                        onChange={(e) => setEditAct1Name(e.target.value)}
                        placeholder="Tên hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs mb-1"
                      />
                      <textarea
                        rows={2}
                        value={editAct1Content}
                        onChange={(e) => setEditAct1Content(e.target.value)}
                        placeholder="Nội dung hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs"
                      />
                    </div>

                    {/* HĐ 2 */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-white text-xs">2. Hình thành kiến thức mới:</span>
                      <input
                        type="text"
                        value={editAct2Name}
                        onChange={(e) => setEditAct2Name(e.target.value)}
                        placeholder="Tên hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs mb-1"
                      />
                      <textarea
                        rows={2}
                        value={editAct2Content}
                        onChange={(e) => setEditAct2Content(e.target.value)}
                        placeholder="Nội dung hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs"
                      />
                    </div>

                    {/* HĐ 3 */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-white text-xs">3. Luyện tập &amp; Củng cố:</span>
                      <input
                        type="text"
                        value={editAct3Name}
                        onChange={(e) => setEditAct3Name(e.target.value)}
                        placeholder="Tên hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs mb-1"
                      />
                      <textarea
                        rows={2}
                        value={editAct3Content}
                        onChange={(e) => setEditAct3Content(e.target.value)}
                        placeholder="Nội dung hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs"
                      />
                    </div>

                    {/* HĐ 4 */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-white text-xs">4. Vận dụng &amp; Mở rộng:</span>
                      <input
                        type="text"
                        value={editAct4Name}
                        onChange={(e) => setEditAct4Name(e.target.value)}
                        placeholder="Tên hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs mb-1"
                      />
                      <textarea
                        rows={2}
                        value={editAct4Content}
                        onChange={(e) => setEditAct4Content(e.target.value)}
                        placeholder="Nội dung hoạt động"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingLessonPackage(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLessonPackageEdit}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Lưu Thay Đổi &amp; Cập Nhật Giáo Án</span>
                    </button>
                  </div>
                </div>
              )}

              
              {/* ===== TAB 1: KẾ HOẠCH BÀI DẠY (GIÁO ÁN CHUẨN CV 5512 / CV 2634) ===== */}
              {lessonPackageActiveTab === 'plan' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        📄 Văn bản Giáo án Sư phạm chính thức
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const html = viewingLessonPackage.standard === 5512 && viewingLessonPackage.plan5512
                            ? lessonPlan5512ToHtml(viewingLessonPackage.plan5512)
                            : viewingLessonPackage.plan2634
                            ? lessonPlan2634ToHtml(viewingLessonPackage.plan2634)
                            : '';
                          downloadWordDoc(`GiaoAn_${viewingLessonPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`, html);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tải Giáo Án (.doc)</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl font-sans overflow-x-auto selection:bg-blue-100">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: viewingLessonPackage.standard === 5512 && viewingLessonPackage.plan5512
                          ? lessonPlan5512ToHtml(viewingLessonPackage.plan5512)
                          : viewingLessonPackage.plan2634
                          ? lessonPlan2634ToHtml(viewingLessonPackage.plan2634)
                          : '<p>Không có nội dung giáo án khả dụng.</p>'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ===== TAB 2: SLIDE THUYẾT TRÌNH POWERPOINT ===== */}
              {lessonPackageActiveTab === 'slides' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <p className="text-xs sm:text-sm text-sky-300 font-medium">
                      🖥️ Kịch bản bài giảng gồm <strong>{viewingLessonPackage.slides.length} slide trình chiếu</strong> PowerPoint chuẩn trực quan.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const html = slidesToHtml(viewingLessonPackage.slides, viewingLessonPackage.lessonTitle, viewingLessonPackage.subject);
                        downloadWordDoc(`Slide_${viewingLessonPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`, html);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Kịch Bản Slide (.doc)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingLessonPackage.slides.map((s) => (
                      <div
                        key={s.slideNumber}
                        className="bg-white border-2 border-sky-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:border-sky-300 transition-all space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
                            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                              SLIDE {s.slideNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 italic">Môn {viewingLessonPackage.subject}</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-white mb-2 leading-snug">
                            {s.title}
                          </h4>
                          <p className="text-xs font-semibold text-slate-700 mb-1.5">📌 Nội dung chiếu màn hình:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs text-slate-200 pl-1">
                            {s.bulletPoints.map((b, idx) => (
                              <li key={idx} className="leading-relaxed">{b}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                            <strong className="block text-emerald-400 font-semibold mb-0.5">🗣️ Lời giảng của Giáo viên (Speaker Notes):</strong>
                            <p className="italic leading-relaxed">{s.speakerNotes}</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
                            <strong className="block text-amber-800 font-semibold mb-0.5">🖼️ Gợi ý Đồ họa / Video:</strong>
                            <p className="leading-relaxed">{s.visualSuggestion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 3: MINI GAME TƯƠNG TÁC (KAHOOT / QUIZIZZ / BLOOKET) ===== */}
              {lessonPackageActiveTab === 'game' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <p className="text-xs sm:text-sm text-purple-300 font-medium">
                      🎮 Bộ <strong>{viewingLessonPackage.miniGame.length} câu hỏi tương tác</strong> sẵn sàng nạp trực tiếp vào Kahoot, Quizizz, Blooket.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const txt = miniGameToTxt(viewingLessonPackage.miniGame, viewingLessonPackage.lessonTitle);
                          navigator.clipboard.writeText(txt);
                          setLessonPackageCopied(true);
                          setTimeout(() => setLessonPackageCopied(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                      >
                        {lessonPackageCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{lessonPackageCopied ? 'Đã sao chép' : 'Chép câu hỏi'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const txt = miniGameToTxt(viewingLessonPackage.miniGame, viewingLessonPackage.lessonTitle);
                          const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `MiniGame_${viewingLessonPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải File Câu Hỏi (.txt)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {viewingLessonPackage.miniGame.map((q) => (
                      <div
                        key={q.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                            CÂU {q.id} • {q.bloomLevel.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            ⏱️ {q.timeLimitSeconds} giây • 🏆 {q.points} điểm
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white leading-relaxed">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, i) => {
                            const optLetter = opt.trim().charAt(0);
                            const isCorrect = optLetter === q.correctAnswer;
                            return (
                              <div
                                key={i}
                                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0 ml-1">
                                    ✓ Đáp án đúng
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <strong className="text-purple-300">💡 Giải thích sư phạm:</strong> {q.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 4: SƠ ĐỒ TƯ DUY (MINDMAP) ===== */}
              {lessonPackageActiveTab === 'mindmap' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <p className="text-xs sm:text-sm text-teal-300 font-medium">
                      🧠 Sơ đồ tư duy trực quan <strong>4 nhánh bài học</strong> &amp; Cấu trúc phân cấp chuẩn.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(viewingLessonPackage.mindmap.mermaidCode);
                          setLessonPackageCopied(true);
                          setTimeout(() => setLessonPackageCopied(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      >
                        {lessonPackageCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{lessonPackageCopied ? 'Đã sao chép' : 'Chép mã Mermaid'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Nhánh chính trực quan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingLessonPackage.mindmap.branches.map((b, idx) => {
                      const colors = [
                        'border-blue-500/40 bg-blue-500/5 text-blue-300',
                        'border-purple-500/40 bg-purple-500/5 text-purple-300',
                        'border-amber-500/40 bg-amber-500/5 text-amber-300',
                        'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                      ];
                      const c = colors[idx % colors.length];
                      return (
                        <div key={idx} className={`p-4 sm:p-5 rounded-2xl border-2 ${c} space-y-2.5 shadow-lg`}>
                          <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono font-bold">
                              {idx + 1}
                            </span>
                            {b.title}
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-200 pl-2">
                            {b.subItems.map((sub, sIdx) => (
                              <li key={sIdx} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                <span>{sub}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  {/* Khung Mermaid Code */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-700">📊 Mã nguồn Mermaid.js (Hỗ trợ nhúng vào Notion, Canva, Obsidian):</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-50 font-mono text-xs text-teal-800 overflow-x-auto whitespace-pre leading-relaxed border border-slate-200">
                      {viewingLessonPackage.mindmap.mermaidCode}
                    </pre>
                  </div>
                </div>
              )}

              {/* ===== TAB 5: VIDEO HỌC LIỆU (MICROLEARNING STORYBOARD) ===== */}
              {lessonPackageActiveTab === 'video' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <p className="text-xs sm:text-sm text-amber-950 font-medium">
                      🎬 Kịch bản Video vi mô (Microlearning) gồm <strong>{viewingLessonPackage.videoScript.length} phân cảnh</strong> chi tiết (3-5 phút).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const html = videoScriptToHtml(viewingLessonPackage.videoScript, viewingLessonPackage.lessonTitle, viewingLessonPackage.subject);
                        downloadWordDoc(`KichBan_Video_${viewingLessonPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`, html);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Kịch Bản Video (.doc)</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {viewingLessonPackage.videoScript.map((sc) => (
                      <div
                        key={sc.sceneNumber}
                        className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            CẢNH {sc.sceneNumber}: {sc.title}
                          </span>
                          <span className="text-xs font-mono text-slate-400">⏱️ Thời lượng: {sc.duration}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <strong className="text-slate-700 block">🖼️ Mô tả Hình ảnh &amp; Hiệu ứng (Visual):</strong>
                            <p className="text-slate-200 leading-relaxed">{sc.visualDescription}</p>
                            <div className="mt-2 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px]">
                              <strong>Prompt AI Video / Ảnh:</strong> <em>{sc.aiPromptSuggestion}</em>
                            </div>
                          </div>

                          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between">
                            <div>
                              <strong className="text-amber-800 block mb-1">🎙️ Lời bình thuyết minh (Voiceover):</strong>
                              <p className="italic text-slate-800 leading-relaxed">&quot;{sc.voiceover}&quot;</p>
                            </div>
                            <div className="pt-2 border-t border-slate-200 text-[11px] text-amber-700 font-semibold">
                              📺 Chữ trên màn hình: {sc.onScreenText}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== TAB 6: CHẤM ĐIỂM SƯ PHẠM NĂNG LỰC SỐ (RUBRIC EVALUATION) ===== */}
              {lessonPackageActiveTab === 'audit' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <p className="text-xs sm:text-sm text-emerald-300 font-medium">
                      📊 Bảng đánh giá Sư phạm theo <strong>Quyết định 2422/QĐ-BGDĐT</strong> &amp; <strong>Công văn 3456/BGDĐT</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const html = fullPackageToDocHtml(viewingLessonPackage);
                        downloadWordDoc(`HoSo_DanhGia_${viewingLessonPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`, html);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Bảng Đánh Giá (.doc)</span>
                    </button>
                  </div>

                  {/* Tổng điểm Hero Card */}
                  <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/15 to-emerald-600/10 border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/30">
                        {viewingLessonPackage.auditScore.totalScore}
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          ĐÁNH GIÁ: XẾP LOẠI {viewingLessonPackage.auditScore.rating.toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                          {viewingLessonPackage.auditScore.totalScore}/100 ĐIỂM ĐẠT CHUẨN
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mức độ Năng lực số: <strong className="text-emerald-300">{viewingLessonPackage.auditScore.digitalCompetencyReview.levelAchieved}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bảng chi tiết 4 tiêu chí */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chi tiết 4 tiêu chuẩn sư phạm &amp; Năng lực số:</h4>
                    {viewingLessonPackage.auditScore.criteria.map((c, i) => (
                      <div
                        key={i}
                        className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({c.standardRef})</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{c.feedback}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-sm font-bold text-emerald-400">
                            {c.actualScore}/{c.maxScore} điểm
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 2 cột: Điểm mạnh & Khuyến nghị */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Điểm Mạnh Nổi Bật:
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {viewingLessonPackage.auditScore.strengths.map((st, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Khuyến Nghị Sư Phạm:
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-200">
                        {viewingLessonPackage.auditScore.suggestions.map((sg, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{sg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 7: TOÀN BỘ HỒ SƠ (ALL-IN-ONE) ===== */}
              {lessonPackageActiveTab === 'all' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <p className="text-xs sm:text-sm text-indigo-300 font-medium">
                      📑 Toàn bộ 6 hạng mục bài giảng được kết xuất liên tục trên 1 trang để giảng dạy &amp; in ấn trọn gói.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const html = fullPackageToDocHtml(viewingLessonPackage);
                        const fName = `HoSo_BaiGiang_${viewingLessonPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
                        downloadWordDoc(fName, html);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải Trọn Bộ Hồ Sơ (.doc)</span>
                    </button>
                  </div>

                  <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-xl font-sans overflow-x-auto selection:bg-blue-100">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: fullPackageToDocHtml(viewingLessonPackage)
                      }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* FOOTER TOOLBAR */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex items-center justify-between flex-wrap gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const html = fullPackageToDocHtml(viewingLessonPackage);
                    const fName = `HoSo_BaiGiang_${viewingLessonPackage.lessonTitle.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
                    downloadWordDoc(fName, html);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                  title="Tải toàn bộ hồ sơ gồm cả 6 hạng mục vào 1 file Word duy nhất"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Trọn Bộ Hồ Sơ 6-in-1 (.doc)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-pointer transition-colors"
                  title="In tài liệu hoặc lưu dạng PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">In ấn / Lưu PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEditLessonPackage(viewingLessonPackage)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                  title="Chỉnh sửa giáo án và học liệu bài dạy"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa giáo án</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveEventAttachment(viewingLessonEvent || undefined, viewingLessonPackage)}
                  className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Xoá và huỷ liên kết giáo án khỏi ca dạy"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Gỡ bỏ giáo án</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewingLessonPackage(null);
                    setViewingLessonEvent(null);
                    setLessonPackageFullScreen(false);
                    setIsEditingLessonPackage(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Sync Security & Pairing Modal */}
      <SyncSecurityModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        currentSyncCode={syncCode}
        currentPin={syncPin}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime ? Date.now() : undefined}
        onSaveCredentials={async (newCode, newPin) => {
          setSyncCode(newCode);
          setSyncInput(newCode);
          setSyncPin(newPin);
          localStorage.setItem('smart_teacher_sync_code', newCode);
          localStorage.setItem('smart_teacher_sync_pin', newPin);
          return true;
        }}
        onPerformSync={() => {
          syncBothWays(syncCode, true);
        }}
      />

      {/* Student & Parent Portal Sharing Modal */}
      <PortalShareModal
        isOpen={showPortalShareModal}
        onClose={() => setShowPortalShareModal(false)}
        syncCode={syncCode}
        className={selectedRosterClass || ''}
      />

      {/* Online Absence Leave Requests Modal */}
      <LeaveRequestsModal
        isOpen={showLeaveRequestsModal}
        onClose={() => setShowLeaveRequestsModal(false)}
        leaveRequests={leaveRequests}
        onApprove={handleApproveLeaveRequest}
        onReject={handleRejectLeaveRequest}
        onDelete={handleDeleteLeaveRequest}
        onTriggerSync={() => syncBothWays(syncCode, true)}
      />
    </div>
  );
}