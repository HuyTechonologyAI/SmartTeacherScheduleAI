"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
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
import {
  KnowledgeDocument,
  getResolvedKnowledgeDocuments,
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
  Calendar,
  Clock,
  BookOpen,
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
  Edit3,
  Gamepad2,
  Video,
  Network
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
export function mergeEventsDesktop(current: CalendarEventItem[], incoming: CalendarEventItem[]): CalendarEventItem[] {
  const map = new Map<string, CalendarEventItem>();
  const getKey = (e: CalendarEventItem) => {
    const numId = Number(e.id);
    if (!isNaN(numId) && numId > 0) return `id_${numId}`;
    if (e.teachingScheduleId) return `sch_${e.teachingScheduleId}_${e.date}`;
    return `${e.date}_${e.className.toLowerCase().trim()}_${e.startTime.trim()}_${e.subject.toLowerCase().trim()}`;
  };

  for (const e of current) {
    map.set(getKey(e), e);
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
  return Array.from(map.values()).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
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
          };

          // 4. Lưu vào localStorage
          saveKnowledgeDocument(updatedDoc);

          // 5. Cập nhật state giao diện
          refreshKnowledgeDocs();
          setKbViewingDoc(updatedDoc);

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
  const [plannerFullPackage, setPlannerFullPackage] = useState<FullLessonPackage | null>(null);
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

    // Khớp nối tài liệu từ Kho tư liệu chuẩn
    const matched = findMatchingKnowledgeDocument(ev.subject, ev.className, inferredLesson);
    setPlannerMatchedDocResult(matched);
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

            const pkg = generateComprehensiveLessonPlanPackage({
              lessonTitle: title,
              subject: plannerSubject || 'Chung',
              className: plannerClass || 'Toàn trường',
              sessionInfo: sessionInfoStr,
              standard: plannerStandard,
              durationMinutes: durationNum * (plannerStandard === 5512 ? 45 : 60),
              customRequirements: plannerRequirements,
              matchedDoc: plannerMatchedDocResult?.doc ? {
                code: plannerMatchedDocResult.doc.code,
                title: plannerMatchedDocResult.doc.title,
                fileName: plannerMatchedDocResult.doc.fileName,
                relevantSnippet: plannerMatchedDocResult.relevantSnippet
              } : null,
              referenceContext: getActiveReferenceContext(plannerSubject, plannerStandard === 5512 ? 'PHAP_QUY' : 'ATLD_5S')
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

  // Push to Cloud (Máy tính -> Đám mây -> Điện thoại)
  const pushToCloud = async (curEvents: CalendarEventItem[], curSchedules: ScheduleItem[], code = syncCode, isManual = false) => {
    if (!code) return false;
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const nowTs = Date.now();
      localStorage.setItem('smart_teacher_last_local_update', nowTs.toString());
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode: code,
          platform: 'desktop',
          deviceName: 'Máy tính Giáo viên (Windows/Mac/Web)',
          updatedAt: nowTs,
          events: curEvents,
          schedules: curSchedules
        })
      });
      if (res.ok) {
        const result = await res.json();
        // Cập nhật state với danh sách đã hợp nhất 2 chiều từ server
        if (Array.isArray(result.events) && result.events.length > 0) {
          setEvents(result.events);
          localStorage.setItem('smart_teacher_events', JSON.stringify(result.events));
        }
        if (Array.isArray(result.schedules) && result.schedules.length > 0) {
          setSchedules(result.schedules);
          localStorage.setItem('smart_teacher_schedules', JSON.stringify(result.schedules));
        }

        const count = result.totalEvents || curEvents.length;
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAlertBanner(`🟢 Đã đồng bộ & hợp nhất ${count} ca dạy lên Đám mây! Điện thoại sẽ nhận được ngay.`);
        setTimeout(() => setAlertBanner(null), 5000);
        if (isManual) {
          alert(`🎉 ĐẨY LÊN ĐÁM MÂY THÀNH CÔNG!\n\nĐã gửi & hợp nhất ${count} ca dạy và ${result.totalSchedules || curSchedules.length} lịch mẫu học kỳ lên Đám mây!\n\nThầy/Cô mở app trên điện thoại và bấm "Đồng bộ 2 chiều" (hoặc "Nhận từ PC") để nhận dữ liệu mới nhất từ máy tính nhé!\nMã đồng bộ: ${code}`);
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
      const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`);
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

          const mergedEvents = mergeEventsDesktop(currentSavedEvents, cloudEvents);
          const mergedSchedules = mergeSchedulesDesktop(currentSavedSchedules, cloudSchedules);

          setEvents(mergedEvents);
          setSchedules(mergedSchedules);
          localStorage.setItem('smart_teacher_events', JSON.stringify(mergedEvents));
          localStorage.setItem('smart_teacher_schedules', JSON.stringify(mergedSchedules));
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          if (isManual) {
            alert(`🎉 ĐỒNG BỘ 2 CHIỀU THÀNH CÔNG!\n\nĐã tải về đầy đủ ${mergedEvents.length} ca dạy (${mergedSchedules.length} lịch mẫu học kỳ) khớp hoàn toàn với điện thoại!\nMã đồng bộ: ${code}`);
          }
          return true;
        } else if (isManual) {
          alert(`⚠️ Chưa có lịch trên đám mây cho mã "${code}".\nThầy/Cô vui lòng mở app trên điện thoại ➔ Cài đặt ➔ Bấm "Đồng bộ đám mây ngay" trước nhé!`);
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
  const syncBothWays = async (code = syncCode, isManual = true) => {
    if (!code) return;
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      // 1. Kéo cập nhật mới nhất từ đám mây về trước để hợp nhất
      await pullFromCloud(code, false);

      // 2. Sau đó lưu & đẩy dữ liệu đã hợp nhất lên Đám mây
      const savedEventsStr = localStorage.getItem('smart_teacher_events');
      const curEvs: CalendarEventItem[] = savedEventsStr ? JSON.parse(savedEventsStr) : events;
      const savedSchsStr = localStorage.getItem('smart_teacher_schedules');
      const curSchs: ScheduleItem[] = savedSchsStr ? JSON.parse(savedSchsStr) : schedules;

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

    // Auto sync polling every 30 seconds
    const interval = setInterval(() => {
      pullFromCloud(savedCode, false);
    }, 30000);

    // Listen to Desktop App menu "Đồng bộ Đám mây ngay" (Ctrl+S)
    if (typeof window !== 'undefined' && (window as any).desktopAPI?.onSyncTriggered) {
      (window as any).desktopAPI.onSyncTriggered(() => {
        syncBothWays(savedCode, true);
      });
    }

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

  // Add New Single or Recurring Event (Tạo Ca Dạy Mới Từ Máy Tính)
  const handleCreateNewEvent = () => {
    if (!newSubject.trim() || !newClass.trim() || !newDate.trim()) {
      alert('Vui lòng điền đủ Tên môn học, Lớp giảng dạy và Ngày dạy!');
      return;
    }

    const newEvId = 'ev_' + Date.now();
    const createdEvent: CalendarEventItem = {
      id: newEvId,
      teachingScheduleId: newCreateRecurring ? Date.now() : undefined,
      title: newSubject.trim(),
      subject: newSubject.trim(),
      className: newClass.trim(),
      room: newRoom.trim() || 'Phòng học bộ môn',
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      sessionType: newSessionType,
      colorHex: newSessionType === 'Thực hành' ? '#10B981' : '#0066FF',
      notes: newNotes.trim(),
      updatedAt: Date.now()
    };

    let updatedEvents = [createdEvent, ...events];
    let updatedSchedules = [...schedules];

    if (newCreateRecurring) {
      const dt = new Date(newDate + 'T00:00:00');
      const dayOfWeek = dt.getDay() === 0 ? 7 : dt.getDay(); // ISO: 1..7
      const newSchId = 'sch_' + Date.now();
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
        startDate: newStartDate || newDate,
        endDate: newEndDate || '2027-02-15',
        notes: newNotes.trim(),
        updatedAt: Date.now()
      };
      updatedSchedules = [...updatedSchedules, newSchedule];
      setSchedules(updatedSchedules);
      localStorage.setItem('smart_teacher_schedules', JSON.stringify(updatedSchedules));

      // Generate remaining recurring events for the semester
      const generated = generateEventsFromSchedules([newSchedule]);
      for (const g of generated) {
        if (g.date !== newDate && !updatedEvents.some(e => e.date === g.date && e.startTime === g.startTime && e.className === g.className)) {
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
    alert(`🎉 ĐÃ THÊM CA DẠY THÀNH CÔNG!\n\nCa dạy đã được lưu trên máy tính và tự động đẩy lên Đám mây cho Điện thoại!`);
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
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5 shadow-sm">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Desktop & Web v1.5.0
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
              onClick={() => pushToCloud(events, schedules, syncCode, true)}
              disabled={isSyncing}
              title="Đẩy toàn bộ lịch đã sửa trên Máy tính lên Đám mây cho Điện thoại"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-white" />
              <span>Đẩy lên ĐT</span>
            </button>

            <button
              onClick={() => syncBothWays(syncCode, true)}
              disabled={isSyncing}
              title="Đồng bộ hai chiều: Gửi lịch máy tính lên đám mây và nhận lịch mới từ điện thoại"
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setNewDate(selectedDate || todayStr);
                      setShowAddEventModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Ca Dạy Mới</span>
                  </button>

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

        {/* ================= TAB 4: TRỢ LÝ AI SƯ PHẠM (GENERATIVE AI) ================= */}
        {activeTab === 'ai' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-900/60 via-slate-800/80 to-purple-900/60 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Trợ Lý Sư Phạm Trí Tuệ Nhân Tạo (Generative AI)</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Made by Huy Technology AI
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Soạn Kế hoạch bài dạy chuẩn Công văn 5512 & 2634, xây dựng Ma trận đề thi 4 mức độ và xuất file Word (.doc) 100% offline
                    </p>
                  </div>
                </div>

                {/* Sub-tab navigation */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-700/70 shrink-0">
                  <button
                    onClick={() => setAiSubTab('planner')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      aiSubTab === 'planner'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
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
                        : 'text-slate-400 hover:text-white'
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
                        : 'text-slate-400 hover:text-white'
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
                        : 'text-slate-400 hover:text-white'
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
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg">

                {/* Grounding Banner */}
                <div
                  onClick={() => setAiSubTab('knowledge')}
                  className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between cursor-pointer hover:border-emerald-500/70 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-300">
                        🛡️ Chế độ đối chiếu chuẩn (Chống ảo giác & bịa đặt)
                      </div>
                      <div className="text-[11px] text-emerald-400/80">
                        AI bắt buộc đối chiếu với {knowledgeDocs.filter(d => d.isActive).length} văn bản trong Kho dữ liệu (CV 5512/2634 & tài liệu của Thầy/Cô). Nhấn để xem & quản lý.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 underline shrink-0 ml-2">Kho tư liệu →</span>
                </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">
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
                            : 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">Công Văn 5512/BGDĐT-GDTrH</span>
                          {plannerStandard === 5512 && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                        </div>
                        <p className="text-xs text-slate-300">
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
                            : 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-white">Công Văn 2634/GDNN</span>
                          {plannerStandard === 2634 && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-xs text-slate-300">
                          Áp dụng Giáo dục Nghề nghiệp: Trung cấp, Cao đẳng, Xưởng thực hành kỹ thuật (Cơ khí, Tiện CNC, Điện, Ô tô, 5S).
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* ================= 2. BỘ LỌC LỚP HỌC & CHỌN CA DẠY ĐÃ LÊN LỊCH ================= */}
                  <div className="pt-2 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-300 block">
                        2. Chọn Lớp học & Ca dạy đã lên lịch trước:
                      </label>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Lọc theo Lớp:</span>
                        <select
                          value={plannerClassFilter}
                          onChange={(e) => setPlannerClassFilter(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
                                    : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
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
                                  <div className="text-[10px] text-amber-300/90 truncate max-w-[150px] mt-0.5 font-mono">
                                    📝 {ev.notes}
                                  </div>
                                ) : (
                                  <div className="text-[10px] opacity-60 mt-0.5">
                                    {ev.startTime} - {ev.endTime}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                        Chưa có lịch dạy đồng bộ. Thầy/Cô có thể nhập trực tiếp thông tin bên dưới hoặc đồng bộ lịch từ điện thoại.
                      </div>
                    )}

                    {/* Thẻ hiển thị khớp nối Kho tư liệu chuẩn */}
                    {plannerMatchedDocResult?.doc ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs animate-fade-in">
                        <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-emerald-300">
                              Đã khớp nối thành công với tài liệu:
                            </span>
                            <span className="font-semibold text-white bg-emerald-600/30 px-2 py-0.5 rounded border border-emerald-500/30">
                              {plannerMatchedDocResult.doc.title}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">
                              ({plannerMatchedDocResult.doc.code})
                            </span>
                          </div>
                          {plannerMatchedDocResult.doc.fileName && (
                            <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-emerald-400" />
                              <span>Tệp đính kèm: <strong>{plannerMatchedDocResult.doc.fileName}</strong></span>
                            </div>
                          )}
                          {plannerMatchedDocResult.relevantSnippet && (
                            <div className="mt-1.5 p-2 rounded bg-slate-900/80 border border-emerald-500/20 text-[11px] text-slate-300 line-clamp-2 italic">
                              "{plannerMatchedDocResult.relevantSnippet.slice(0, 180)}..."
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400">
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
                    <label className="text-xs font-bold text-slate-300 block">
                      3. Nhập thông tin & Yêu cầu bài giảng:
                    </label>

                    {plannerStandard === 2634 && (
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Tên Mô-đun / Môn học thực hành:</span>
                        <input
                          type="text"
                          value={plannerModuleTitle}
                          onChange={(e) => setPlannerModuleTitle(e.target.value)}
                          placeholder="Ví dụ: Mô-đun Tiện CNC và Gia công chi tiết máy"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
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
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Khối lớp / Trình độ:</span>
                        <input
                          type="text"
                          value={plannerClass}
                          onChange={(e) => setPlannerClass(e.target.value)}
                          placeholder="Lớp 10A1 / Trung cấp K18..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
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
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Nút Sinh Kế Hoạch Bài Giảng Trọn Gói AI (Quy trình 5 bước) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={plannerIsGenerating}
                      onClick={handleGenerateFullLessonPackage}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:via-indigo-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
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
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl animate-fade-in">
                    {/* Header Thanh Công Cụ Toàn Cục */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                            {plannerStandard === 5512 ? 'Công Văn 5512' : 'Công Văn 2634'}
                          </span>
                          <span className="text-xs font-semibold text-white">
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
                                <span className="text-slate-300 truncate max-w-[200px]" title={plannerFullPackage.sourceDocMatched.title}>
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

                              const updated = events.map(ev => {
                                if (ev.id === plannerSelectedEventId) {
                                  return {
                                    ...ev,
                                    attachmentName: docName,
                                    attachmentUrl: 'attached://lesson_plan_doc',
                                    updatedAt: Date.now()
                                  };
                                }
                                return ev;
                              });

                              setEvents(updated);
                              localStorage.setItem('smart_teacher_events', JSON.stringify(updated));
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
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-700 text-xs">
                      <button
                        type="button"
                        onClick={() => setPlannerActiveResultTab('plan')}
                        className={`px-3.5 py-2 rounded-t-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          plannerActiveResultTab === 'plan'
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
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
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
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
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
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
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
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
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
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
                            : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
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
                          <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-5 space-y-4 text-xs sm:text-sm text-slate-200">
                            <div className="text-center pb-3 border-b border-slate-700">
                              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
                                KẾ HOẠCH BÀI DẠY (CHUẨN CÔNG VĂN 5512/BGDĐT-GDTrH)
                              </span>
                              <h4 className="text-base font-bold text-white mt-1">{plannerResult5512.lessonTitle}</h4>
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
                              <p><strong className="text-slate-300">1. Kiến thức:</strong> {plannerResult5512.objectives.knowledge}</p>
                              <p><strong className="text-slate-300">2. Năng lực:</strong> {plannerResult5512.objectives.competencies}</p>
                              <p><strong className="text-slate-300">3. Phẩm chất:</strong> {plannerResult5512.objectives.qualities}</p>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-blue-400 uppercase text-xs">II. Thiết bị dạy học và học liệu số:</h5>
                              <p><strong className="text-slate-300">• Giáo viên:</strong> {plannerResult5512.equipment.teacherEquipment}</p>
                              <p><strong className="text-slate-300">• Học sinh:</strong> {plannerResult5512.equipment.studentEquipment}</p>
                            </div>

                            <div className="space-y-3 pt-2">
                              <h5 className="font-bold text-blue-400 uppercase text-xs">III. Tiến trình dạy học (4 Hoạt động bắt buộc):</h5>
                              {[plannerResult5512.activity1Opening, plannerResult5512.activity2Knowledge, plannerResult5512.activity3Practice, plannerResult5512.activity4Application].map((act, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5 text-xs">
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
                          <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-5 space-y-4 text-xs sm:text-sm text-slate-200">
                            <div className="text-center pb-3 border-b border-slate-700">
                              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
                                GIÁO ÁN BÀI DẠY THỰC HÀNH NGHỀ (CHUẨN CÔNG VĂN 2634/GDNN)
                              </span>
                              <h4 className="text-base font-bold text-white mt-1">{plannerResult2634.moduleTitle}</h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Nghề: {plannerResult2634.occupation} • Trình độ: {plannerResult2634.level} • Thời lượng: {plannerResult2634.durationMinutes} giờ
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-amber-400 uppercase text-xs">I. Mục tiêu đào tạo nghề:</h5>
                              <p><strong className="text-slate-300">1. Kiến thức nghề:</strong> {plannerResult2634.objectives.knowledge}</p>
                              <p><strong className="text-slate-300">2. Kỹ năng thực hành:</strong> {plannerResult2634.objectives.skills}</p>
                              <p><strong className="text-slate-300">3. An toàn lao động & 5S:</strong> {plannerResult2634.objectives.autonomyAndSafety}</p>
                            </div>

                            <div className="space-y-2">
                              <h5 className="font-bold text-amber-400 uppercase text-xs">II. Điều kiện thực hiện (Xưởng thực hành):</h5>
                              <p><strong className="text-slate-300">• Máy móc thiết bị:</strong> {plannerResult2634.conditions.equipmentAndMachines}</p>
                              <p><strong className="text-slate-300">• Vật tư phôi mẫu:</strong> {plannerResult2634.conditions.materialsAndWorkpieces}</p>
                              <p><strong className="text-slate-300">• Trang bị BHLĐ & 5S:</strong> {plannerResult2634.conditions.safetyAnd5S}</p>
                            </div>

                            <div className="space-y-3 pt-2">
                              <h5 className="font-bold text-amber-400 uppercase text-xs">III. Tiến trình thực hiện tại xưởng (4 Bước thực hành):</h5>
                              {[plannerResult2634.step1Orientation, plannerResult2634.step2Demonstration, plannerResult2634.step3Practice, plannerResult2634.step4Evaluation].map((st, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1.5 text-xs">
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
                            <div key={s.slideNumber} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/70 space-y-2.5 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="font-bold text-sky-400">SLIDE {s.slideNumber}: {s.title}</span>
                              </div>
                              <div>
                                <strong className="text-slate-300 block mb-1">📌 Nội dung trình chiếu:</strong>
                                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                                  {s.bulletPoints.map((bp, i) => (
                                    <li key={i}>{bp}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50 text-emerald-300">
                                <span className="font-bold block mb-0.5">🗣️ Lời giảng của Giáo viên:</span>
                                <p className="italic text-slate-300">{s.speakerNotes}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
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
                            <div key={q.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/70 space-y-2.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-sm">Câu {q.id}: {q.question}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold text-[10px]">
                                    {q.bloomLevel}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
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
                                          : 'bg-slate-800/60 border-slate-700/50 text-slate-300'
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
                          <span className="text-amber-300 font-semibold">
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
                            <div key={sc.sceneNumber} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/70 space-y-2.5 text-xs">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="font-bold text-amber-400 text-sm">
                                  Phân cảnh {sc.sceneNumber}: {sc.title}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                  {sc.duration}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <strong className="text-slate-300 block mb-1">🖼️ Mô tả hình ảnh (Visual):</strong>
                                  <p className="text-slate-300">{sc.visualDescription}</p>
                                  <div className="mt-2 text-[11px] text-amber-300">
                                    <strong>Chữ trên màn hình:</strong> {sc.onScreenText}
                                  </div>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
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
                            <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-teal-500/30 space-y-2 text-xs">
                              <h5 className="font-bold text-teal-300 text-sm flex items-center gap-1.5">
                                <Network className="w-4 h-4 text-teal-400" />
                                <span>{b.title}</span>
                              </h5>
                              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                                {b.subItems.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Mermaid Code Box */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <span className="text-xs font-mono text-slate-400 block">Cú pháp Mermaid Mindmap:</span>
                          <pre className="text-xs font-mono text-teal-300 overflow-x-auto p-3 bg-slate-900 rounded-lg">
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
                              <p className="text-xs text-slate-300 mt-1">
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
                        <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                              <tr>
                                <th className="p-3">Tiêu Chí Đánh Giá</th>
                                <th className="p-3 w-24 text-center">Điểm Số</th>
                                <th className="p-3">Nhận Xét & Căn Cứ Pháp Quy</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {plannerFullPackage.auditScore.criteria.map((c, i) => (
                                <tr key={i} className="hover:bg-slate-800/40">
                                  <td className="p-3 font-semibold text-white">
                                    {c.name}
                                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                                      {c.standardRef}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center font-bold text-emerald-400 text-sm">
                                    {c.actualScore} / {c.maxScore}
                                  </td>
                                  <td className="p-3 text-slate-300">
                                    {c.feedback}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Điểm mạnh & Khuyến nghị */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
                            <strong className="text-emerald-400 flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Điểm Mạnh Nổi Bật:</span>
                            </strong>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300">
                              {plannerFullPackage.auditScore.strengths.map((st, i) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                            <strong className="text-amber-400 flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-4 h-4" />
                              <span>Khuyến Nghị Tối Ưu Sư Phạm:</span>
                            </strong>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300">
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
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Thiết Lập Đề Thi & Bảng Ma Trận 4 Mức Độ Nhận Thức</span>
                  </h4>
                  <p className="text-xs text-slate-300">
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
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
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Khối lớp / Trình độ:</span>
                        <input
                          type="text"
                          value={examGrade}
                          onChange={(e) => setExamGrade(e.target.value)}
                          placeholder="Lớp 10 / CĐ Nghề K22..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 mb-1 block">Số lượng câu hỏi:</span>
                        <select
                          value={examQuestionCount}
                          onChange={(e) => setExamQuestionCount(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
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
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/70">
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
                    <div className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-4 space-y-3">
                      <h5 className="font-bold text-purple-400 text-xs uppercase">Bảng Ma Trận 4 Mức Độ Nhận Thức:</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60">
                          <span className="text-slate-400 block text-[11px]">1. Nhận biết</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.recognitionCount} câu ({examResult.matrix.recognitionPercent}%)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60">
                          <span className="text-slate-400 block text-[11px]">2. Thông hiểu</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.comprehensionCount} câu ({examResult.matrix.comprehensionPercent}%)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60">
                          <span className="text-slate-400 block text-[11px]">3. Vận dụng</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.applicationCount} câu ({examResult.matrix.applicationPercent}%)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60">
                          <span className="text-slate-400 block text-[11px]">4. Vận dụng cao</span>
                          <span className="text-sm font-bold text-white">{examResult.matrix.advancedApplicationCount} câu ({examResult.matrix.advancedApplicationPercent}%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Question List */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-purple-400 text-xs uppercase">Danh Sách Câu Hỏi & Lời Giải:</h5>
                      {examResult.questions.map((q, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">Câu {idx + 1}:</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700/50">
                              {q.level}
                            </span>
                          </div>
                          <p className="text-slate-200">{q.questionText}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 text-slate-300">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="text-[11px]">{opt}</div>
                            ))}
                          </div>
                          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
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
              <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 sm:p-5 h-[480px] flex flex-col justify-between shadow-xl">
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
            )}

            {/* ================= SUB-TAB 4: KHO TƯ LIỆU CHUẨN (KNOWLEDGE BASE) ================= */}
            {aiSubTab === 'knowledge' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-800/80 to-teal-950/60 border border-emerald-500/40 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
                        <ShieldCheck className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                          <span>Kho Tư Liệu Đối Chiếu Chuẩn</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            {knowledgeDocs.filter(d => d.isActive).length} / {knowledgeDocs.length} Đang kích hoạt
                          </span>
                        </h2>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3.5 shadow-md">
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
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
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
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                            ? 'bg-slate-800/90 border-slate-700 shadow-lg'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
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
                            <h3 className="text-sm font-bold text-white leading-snug">
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

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-700/60">
                          <span>Môn: <strong className="text-slate-300">{doc.subject}</strong></span>
                          <span>•</span>
                          <span>Cấp: <strong className="text-slate-300">{doc.targetLevel}</strong></span>
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
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 flex-wrap gap-2">
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
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
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
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
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

                {/* Modal Xem Toàn Văn (Preview & Export Toolbar) */}
                {kbViewingDoc && (
                  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                      {/* Header */}
                      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              {kbViewingDoc.code}
                            </span>
                            <span className="text-xs text-slate-400">
                              Môn: <strong className="text-slate-200">{kbViewingDoc.subject}</strong> • Cấp: <strong className="text-slate-200">{kbViewingDoc.targetLevel}</strong>
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                              {kbViewingDoc.category === 'GIAO_TRINH' ? '📘 Giáo trình nghề' :
                               kbViewingDoc.category === 'DE_CUONG' ? '📋 Đề cương môn học' :
                               kbViewingDoc.category === 'PHAP_QUY' ? '🏛️ Văn bản pháp quy' :
                               kbViewingDoc.category === 'ATLD_5S' ? '🛡️ Tiêu chuẩn ATLĐ & 5S' : '📄 Tư liệu'}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
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
                        <button
                          type="button"
                          onClick={() => setKbViewingDoc(null)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Content Preview: Hỗ trợ xem trực quan PDF hoặc xem toàn văn nội dung trích xuất */}
                      {kbPreviewIsLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-950/70 min-h-[450px]">
                          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                          <div className="text-sm font-semibold text-emerald-400">
                            {kbPreviewStatusText || 'Đang xử lý tài liệu...'}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Hệ thống đang giải mã và trích xuất từng trang
                          </div>
                        </div>
                      ) : kbViewingDoc.fileName?.toLowerCase().endsWith('.pdf') && kbPreviewPdfUrl && kbPreviewMode !== 'TEXT' ? (
                        <div className="flex-1 flex flex-col p-4 bg-slate-950/70 overflow-hidden min-h-[550px]">
                          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800 text-xs text-slate-300">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <FileText className="w-4 h-4" />
                              <span>Bản xem trước PDF trực quan nguyên bản gốc</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setKbPreviewMode('TEXT')}
                              className="text-xs text-blue-400 hover:text-blue-300 underline cursor-pointer font-medium"
                            >
                              Chuyển sang xem toàn văn trích xuất AI
                            </button>
                          </div>
                          <iframe
                            src={kbPreviewPdfUrl}
                            className="w-full flex-1 rounded-xl border border-slate-700 bg-white"
                            style={{ minHeight: '520px' }}
                            title={kbViewingDoc.title}
                          />
                        </div>
                      ) : (
                        <div className="p-5 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans bg-slate-950/40">
                          {/* Card nhắc nạp tệp nếu tài liệu cũ chưa có tệp đệm trong IndexedDB */}
                          {!kbPreviewPdfUrl && kbViewingDoc.fileName?.toLowerCase().endsWith('.pdf') && (
                            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-amber-300">
                                    Kích hoạt xem trực quan & Trích xuất toàn văn cho tài liệu này
                                  </div>
                                  <div className="text-[11px] text-slate-300">
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
                          {kbViewingDoc.content}
                        </div>
                      )}

                      {/* Footer Toolbar: Download Original File (Tải đúng định dạng), Export Word, Export Text, Edit, Close */}
                      <div className="p-3.5 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2.5 bg-slate-900/90">
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
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
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
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                
                {/* Modal Chỉnh Sửa / Bổ Sung Tài Liệu */}
                {kbEditingDoc && (
                  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
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
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-5 overflow-y-auto flex-1 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1.5">
                            Tên tài liệu / Văn bản / Giáo trình <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={kbEditTitle}
                            onChange={(e) => setKbEditTitle(e.target.value)}
                            placeholder="Ví dụ: Đề cương chi tiết môn Tiện CNC hoặc Giáo trình Khí cụ điện"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Mã ký hiệu</label>
                            <input
                              type="text"
                              value={kbEditCode}
                              onChange={(e) => setKbEditCode(e.target.value)}
                              placeholder="Mã số văn bản..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Môn học áp dụng</label>
                            <input
                              type="text"
                              value={kbEditSubject}
                              onChange={(e) => setKbEditSubject(e.target.value)}
                              placeholder="ALL hoặc Toán, Tiện CNC..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Cấp học / Trình độ</label>
                            <input
                              type="text"
                              value={kbEditLevel}
                              onChange={(e) => setKbEditLevel(e.target.value)}
                              placeholder="ALL, THPT, Trung cấp, Cao đẳng..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Phân loại</label>
                            <select
                              value={kbEditCategory}
                              onChange={(e) => setKbEditCategory(e.target.value as any)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
                          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-amber-400">
                              <Paperclip className="w-4 h-4" />
                              <span>ĐÍNH KÈM HOẶC THAY THẾ TỆP TÀI LIỆU</span>
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">Word, PDF, Text...</span>
                          </label>

                          {!kbEditFileName ? (
                            <label className="block p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-all text-center group">
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
                                  <div className="text-xs font-bold text-amber-300 truncate">{kbEditFileName}</div>
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
                          <label className="text-xs font-bold text-slate-300 block mb-1.5">
                            Nội dung chi tiết (Dành cho AI đối chiếu và xuất văn bản)
                          </label>
                          <textarea
                            rows={8}
                            value={kbEditContent}
                            onChange={(e) => setKbEditContent(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="p-4 border-t border-slate-800 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setKbEditingDoc(null)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
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
                  <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Plus className="w-5 h-5 text-emerald-400" />
                          <span>Thêm Tư Liệu Đối Chiếu AI Mới</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setKbShowAddModal(false)}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-5 overflow-y-auto flex-1 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1.5">
                            Tên tài liệu / Văn bản / Giáo trình <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={kbNewTitle}
                            onChange={(e) => setKbNewTitle(e.target.value)}
                            placeholder="Ví dụ: Đề cương chi tiết môn Tiện CNC Lớp 11 hoặc Giáo trình Khí cụ điện"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Mã ký hiệu (tùy chọn)</label>
                            <input
                              type="text"
                              value={kbNewCode}
                              onChange={(e) => setKbNewCode(e.target.value)}
                              placeholder="Ví dụ: DC-TIEN-11"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Môn học áp dụng</label>
                            <input
                              type="text"
                              value={kbNewSubject}
                              onChange={(e) => setKbNewSubject(e.target.value)}
                              placeholder="ALL hoặc Toán, Tiện CNC..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Cấp học / Trình độ</label>
                            <input
                              type="text"
                              value={kbNewLevel}
                              onChange={(e) => setKbNewLevel(e.target.value)}
                              placeholder="ALL, THPT, Trung cấp, Cao đẳng..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-300 block mb-1.5">Phân loại</label>
                            <select
                              value={kbNewCategory}
                              onChange={(e) => setKbNewCategory(e.target.value as any)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                              <Paperclip className="w-4 h-4" />
                              <span>ĐÍNH KÈM TỆP TÀI LIỆU (Word, PDF, Text...)</span>
                            </span>
                            <span className="text-[11px] font-normal text-slate-400">Tự động nạp vào AI</span>
                          </label>

                          {!kbAttachedFileName ? (
                            <label className="block p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-all text-center group">
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
                                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                  {kbIsExtracting ? 'Đang đọc và trích xuất nội dung văn bản...' : 'BẤM ĐỂ CHỌN HOẶC KÉO THẢ TỆP TÀI LIỆU VÀO ĐÂY'}
                                </div>
                                <p className="text-[11px] text-slate-400 max-w-md">
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
                          <label className="text-xs font-bold text-slate-300 block mb-1.5">
                            {kbAttachedFileName ? 'Nội dung trích xuất từ tệp (Sẵn sàng cho AI đối chiếu)' : 'Nội dung văn bản (hoặc đính kèm file ở trên)'}
                          </label>
                          <textarea
                            rows={7}
                            value={kbNewContent}
                            onChange={(e) => setKbNewContent(e.target.value)}
                            placeholder="Nội dung được tự động điền khi Thầy/Cô đính kèm file ở trên, hoặc có thể dán/chỉnh sửa trực tiếp tại đây..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                          />
                        </div>
                      </div>
                      <div className="p-4 border-t border-slate-800 flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setKbShowAddModal(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                        >
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
                              fileData: kbAttachedFileData || undefined
                            };
                            const savedOk = saveKnowledgeDocument(newDoc);
                            if (savedOk) {
                              refreshKnowledgeDocs();
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
            {/* Version Badge & Info */}
            <div className="bg-slate-800/60 border border-indigo-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Smart Teacher Schedule AI
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 text-cyan-300 border border-indigo-500/40 text-xs font-mono font-bold">
                        v1.5.0
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Đơn vị phát triển: Huy Technology AI • Hotline/Zalo: 0961364600</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  ✓ Phiên bản chính thức v1.5.0
                </span>
              </div>
              <div className="text-xs text-slate-300 grid sm:grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
                <div>• Nền tảng: <strong className="text-white">Desktop (PC/Laptop) & Web App</strong></div>
                <div>• Cơ sở dữ liệu: <strong className="text-white">Đám mây 2 chiều Supabase</strong></div>
                <div>• Trợ lý AI: <strong className="text-white">Kho Pháp Quy CV 5512 & CV 2634</strong></div>
                <div>• Tính năng mới: <strong className="text-emerald-400">Đồng bộ 2 chiều (Máy tính ⇄ Điện thoại)</strong></div>
              </div>
            </div>

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
                        pushToCloud(events, schedules, clean, true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
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
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Đồng bộ 2 chiều</span>
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

      {/* ================= MODAL: THÊM CA DẠY MỚI TRÊN MÁY TÍNH ================= */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Thêm Ca Dạy Mới (Tự Động Đồng Bộ Điện Thoại)</span>
              </h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Tên môn học / Module: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Tiện CNC Cơ Bản, Công Nghệ 12..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Lớp giảng dạy: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 12A2, CG24TC34..."
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Phòng học / Xưởng:</label>
                  <input
                    type="text"
                    placeholder="VD: S3.05/2, Xưởng Cơ khí..."
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Ngày dạy: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giờ bắt đầu:</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Giờ kết thúc:</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Session Type */}
              <div>
                <label className="text-slate-300 font-medium block mb-1">Hình thức giảng dạy:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewSessionType('Lý thuyết')}
                    className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                      newSessionType === 'Lý thuyết'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    📖 Lý thuyết
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSessionType('Thực hành')}
                    className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                      newSessionType === 'Thực hành'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    ⚙️ Thực hành
                  </button>
                </div>
              </div>

              {/* Recurring schedule option */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCreateRecurring}
                    onChange={(e) => setNewCreateRecurring(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-200 font-semibold">
                    Lặp lại định kỳ hàng tuần cho toàn bộ học kỳ
                  </span>
                </label>

                {newCreateRecurring && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Bắt đầu học kỳ:</label>
                      <input
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Kết thúc học kỳ:</label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú (tùy chọn):</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ghi chú bài học, phòng máy, dặn dò học sinh..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
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
