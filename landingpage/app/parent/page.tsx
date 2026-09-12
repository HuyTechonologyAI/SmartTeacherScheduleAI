"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Send,
  User,
  Phone,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  FileText,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Plus,
  X,
  MessageSquare,
  Lock,
  Star,
  Users,
  School,
  Check
} from 'lucide-react';
import { Language, getStoredLanguage, saveStoredLanguage } from '../app/i18n';
import { getStoredStudentProfile, StudentProfile } from '../student/studentProfileData';

interface StudentInfo {
  id: string;
  studentCode?: string;
  fullName: string;
  avatar?: string;
  className: string;
  schoolName?: string;
  homeroomTeacher?: string;
  academicYear?: string;
  gender: string;
  kudosPoints: number;
  parentName: string;
  parentPhone: string;
  teacherNotes?: string;
  bioQuote?: string;
}

interface AttendanceRecordItem {
  id: string;
  date: string;
  className: string;
  status: 'PRESENT' | 'ABSENT_EXCUSED' | 'ABSENT_UNEXCUSED' | 'LATE';
  note?: string;
  kudosDelta?: number;
  updatedAt?: number;
}

interface LeaveRequestItem {
  id: string;
  studentId: string;
  studentCode?: string;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  date: string;
  reason: string;
  type: 'SICK' | 'FAMILY' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  teacherNote?: string;
}

interface EventItem {
  id: string | number;
  title: string;
  subject: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  sessionType?: string;
  teacherName?: string;
  notes?: string;
}

const DEFAULT_PARENT_STUDENT: StudentInfo = {
  id: '001208012345',
  studentCode: '001208012345',
  fullName: 'Nguyễn Bảo An',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidCat',
  className: 'Lớp 3A1',
  schoolName: 'Trường Tiểu Học Việt Nam',
  homeroomTeacher: 'Cô Trần Thị Mai',
  academicYear: '2025 - 2026',
  gender: 'Nam',
  kudosPoints: 125,
  parentName: 'Nguyễn Văn Hải',
  parentPhone: '0961364600',
  teacherNotes: 'Bảo An tiếp thu bài nhanh, chăm chỉ phát biểu và rất hòa đồng với bạn bè.',
  bioQuote: 'Chăm ngoan, học giỏi, vâng lời thầy cô và cha mẹ!'
};

const SAVED_CHILDREN_STORAGE_KEY = 'smart_parent_saved_children';
const LEAVE_REQUESTS_STORAGE_KEY = 'smart_parent_leave_requests';

export default function ParentPortalPage() {
  const [lang, setLang] = useState<Language>('vi');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Tra cứu
  const [syncCode, setSyncCode] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('0961364600');
  const [studentCode, setStudentCode] = useState<string>('001208012345');
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'schedule' | 'leave_requests' | 'notices'>('overview');

  // Dữ liệu học sinh
  const [student, setStudent] = useState<StudentInfo | null>(DEFAULT_PARENT_STUDENT);
  const [savedChildren, setSavedChildren] = useState<StudentInfo[]>([DEFAULT_PARENT_STUDENT]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecordItem[]>([
    { id: 'att_1', date: new Date().toISOString().split('T')[0], className: 'Lớp 3A1', status: 'PRESENT', note: 'Đi học đúng giờ, hăng hái phát biểu' },
    { id: 'att_2', date: '2026-09-11', className: 'Lớp 3A1', status: 'PRESENT', note: 'Hoàn thành bài tập tốt' },
    { id: 'att_3', date: '2026-09-10', className: 'Lớp 3A1', status: 'PRESENT', note: 'Tích cực tham gia giờ Mỹ thuật' },
    { id: 'att_4', date: '2026-09-09', className: 'Lớp 3A1', status: 'ABSENT_EXCUSED', note: 'Gia đình có gửi đơn xin phép nghỉ ốm' },
    { id: 'att_5', date: '2026-09-08', className: 'Lớp 3A1', status: 'PRESENT', note: 'Trực nhật tốt' },
    { id: 'att_6', date: '2026-09-05', className: 'Lớp 3A1', status: 'LATE', note: 'Đến muộn 10 phút do kẹt xe' }
  ]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([
    {
      id: 'lr_sample',
      studentId: '001208012345',
      studentCode: '001208012345',
      studentName: 'Nguyễn Bảo An',
      className: 'Lớp 3A1',
      parentName: 'Nguyễn Văn Hải',
      parentPhone: '0961364600',
      date: '2026-09-09',
      reason: 'Cháu bị cảm sốt nhẹ, gia đình xin phép cho cháu nghỉ 1 buổi học để theo dõi.',
      type: 'SICK',
      status: 'APPROVED',
      createdAt: Date.now() - 3 * 86400000,
      teacherNote: 'Cô đã nhận đơn và duyệt cho con nghỉ có phép. Chúc con sớm khỏe lại nhé!'
    }
  ]);
  const [scheduleEvents, setScheduleEvents] = useState<EventItem[]>([
    { id: 'e1', title: 'Toán học', subject: 'Toán học', className: 'Lớp 3A1', date: new Date().toISOString().split('T')[0], startTime: '07:30', endTime: '08:15', room: 'Phòng 204', sessionType: 'Tiết 1', teacherName: 'Cô Trần Thị Mai' },
    { id: 'e2', title: 'Tiếng Việt', subject: 'Tiếng Việt', className: 'Lớp 3A1', date: new Date().toISOString().split('T')[0], startTime: '08:25', endTime: '09:10', room: 'Phòng 204', sessionType: 'Tiết 2', teacherName: 'Thầy Lê Minh Đức' },
    { id: 'e3', title: 'Tiếng Anh', subject: 'Tiếng Anh', className: 'Lớp 3A1', date: new Date().toISOString().split('T')[0], startTime: '09:30', endTime: '10:15', room: 'Phòng Lab 1', sessionType: 'Tiết 3', teacherName: 'Cô Sarah Nguyen' },
    { id: 'e4', title: 'Mỹ thuật', subject: 'Mỹ thuật', className: 'Lớp 3A1', date: new Date().toISOString().split('T')[0], startTime: '10:25', endTime: '11:10', room: 'Phòng Mỹ thuật', sessionType: 'Tiết 4', teacherName: 'Cô Phạm Thu Hà' }
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Đơn xin phép nghỉ học
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveDate, setLeaveDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<'SICK' | 'FAMILY' | 'OTHER'>('SICK');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [parentSignName, setParentSignName] = useState<string>('Nguyễn Văn Hải');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState<boolean>(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isEn = lang === 'en';

  // Toggle Theme & Language & Local Data
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

      const savedLang = getStoredLanguage();
      setLang(savedLang);

      setLeaveDate(todayStr);

      // Load local stored student profile if present
      const localSt = getStoredStudentProfile();
      if (localSt && localSt.studentCode) {
        const enriched: StudentInfo = {
          id: localSt.id,
          studentCode: localSt.studentCode,
          fullName: localSt.fullName,
          avatar: localSt.avatar,
          className: localSt.className,
          schoolName: localSt.schoolName,
          homeroomTeacher: localSt.homeroomTeacher || 'Cô Trần Thị Mai',
          academicYear: localSt.academicYear || '2025 - 2026',
          gender: localSt.gender,
          kudosPoints: localSt.kudosPoints,
          parentName: 'Phụ huynh ' + localSt.fullName.split(' ').pop(),
          parentPhone: localSt.parentPhone || '0961364600',
          teacherNotes: localSt.teacherNotes || DEFAULT_PARENT_STUDENT.teacherNotes,
          bioQuote: localSt.bioQuote
        };
        setStudent(enriched);
        setStudentCode(localSt.studentCode);
        if (localSt.parentPhone) setParentPhone(localSt.parentPhone);
      }

      // Load saved children list from storage
      const rawChildren = localStorage.getItem(SAVED_CHILDREN_STORAGE_KEY);
      if (rawChildren) {
        const parsed = JSON.parse(rawChildren);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedChildren(parsed);
        }
      }

      // Load leave requests from storage
      const rawRequests = localStorage.getItem(LEAVE_REQUESTS_STORAGE_KEY);
      if (rawRequests) {
        const parsedReq = JSON.parse(rawRequests);
        if (Array.isArray(parsedReq) && parsedReq.length > 0) {
          setLeaveRequests(parsedReq);
        }
      }

      // Check URL params
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code') || localStorage.getItem('smart_parent_sync_code') || '';
      const phoneFromUrl = params.get('phone') || '';
      const stCodeFromUrl = params.get('studentCode') || '';

      if (codeFromUrl) setSyncCode(codeFromUrl);
      if (phoneFromUrl) setParentPhone(phoneFromUrl);
      if (stCodeFromUrl) setStudentCode(stCodeFromUrl);

      if (codeFromUrl && (phoneFromUrl || stCodeFromUrl)) {
        fetchParentData(codeFromUrl, phoneFromUrl, stCodeFromUrl);
      }
    } catch (e) {
      console.error('Error initializing Parent portal:', e);
    }
  }, [todayStr]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('smart_teacher_theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const toggleLanguage = () => {
    const next: Language = lang === 'vi' ? 'en' : 'vi';
    setLang(next);
    saveStoredLanguage(next);
  };

  // Tra cứu dữ liệu con từ API Portal
  const fetchParentData = async (code: string, phone: string, stCode: string) => {
    if (!code || (!phone && !stCode)) {
      setErrorMessage(isEn ? 'Please enter School/Class Code and Parent Phone or Student CCCD.' : 'Vui lòng nhập Mã lớp/trường và Số điện thoại phụ huynh hoặc Số CCCD của con.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const url = `/api/portal?code=${encodeURIComponent(code)}&role=parent${phone ? `&phone=${encodeURIComponent(phone)}` : ''}${stCode ? `&studentCode=${encodeURIComponent(stCode)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || (isEn ? 'Student record not found.' : 'Không tìm thấy thông tin học sinh.'));
        setIsLoading(false);
        return;
      }

      if (data.student) {
        const fetchedStudent: StudentInfo = {
          ...data.student,
          avatar: data.student.avatar || (student?.avatar ?? DEFAULT_PARENT_STUDENT.avatar),
          homeroomTeacher: data.classroom?.homeroomTeacher || student?.homeroomTeacher || 'Cô Trần Thị Mai',
          academicYear: '2025 - 2026',
          schoolName: student?.schoolName || 'Trường Tiểu Học Việt Nam'
        };
        setStudent(fetchedStudent);

        // Lưu vào danh sách con đã tra cứu trên máy
        setSavedChildren(prev => {
          const list = prev.filter(c => c.studentCode !== fetchedStudent.studentCode && c.id !== fetchedStudent.id);
          const nextList = [fetchedStudent, ...list].slice(0, 5);
          localStorage.setItem(SAVED_CHILDREN_STORAGE_KEY, JSON.stringify(nextList));
          return nextList;
        });
      }

      if (data.attendance) setAttendanceList(data.attendance);
      if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
      if (data.upcomingEvents && data.upcomingEvents.length > 0) setScheduleEvents(data.upcomingEvents);

      setSuccessMessage(isEn ? 'Synchronized with School Roster successfully!' : 'Đồng bộ dữ liệu sổ liên lạc thành công!');
      setTimeout(() => setSuccessMessage(null), 3500);

      localStorage.setItem('smart_parent_sync_code', code);
      if (phone) localStorage.setItem('smart_parent_phone', phone);
      if (stCode) localStorage.setItem('smart_parent_st_code', stCode);
    } catch (err: any) {
      setErrorMessage(isEn ? 'Server connection error: ' + err.message : 'Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Chuyển đổi giữa các con đã lưu trên máy
  const handleSelectChild = (child: StudentInfo) => {
    setStudent(child);
    if (child.studentCode) setStudentCode(child.studentCode);
    if (child.parentPhone) setParentPhone(child.parentPhone);
  };

  // Nộp đơn xin nghỉ học trực tuyến
  const handleSubmitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !leaveDate || !leaveReason.trim()) {
      alert(isEn ? 'Please fill in leave date and reason.' : 'Vui lòng điền đầy đủ ngày nghỉ và lý do xin phép.');
      return;
    }

    setIsSubmittingLeave(true);
    const newReq: LeaveRequestItem = {
      id: 'lr_' + Date.now(),
      studentId: student.id,
      studentCode: student.studentCode,
      studentName: student.fullName,
      className: student.className,
      parentName: parentSignName || student.parentName,
      parentPhone: parentPhone || student.parentPhone,
      date: leaveDate,
      type: leaveType,
      reason: leaveReason.trim(),
      status: 'PENDING',
      createdAt: Date.now()
    };

    try {
      if (syncCode) {
        await fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syncCode,
            ...newReq
          })
        });
      }

      // Cập nhật state và lưu vào LocalStorage
      const updated = [newReq, ...leaveRequests];
      setLeaveRequests(updated);
      localStorage.setItem(LEAVE_REQUESTS_STORAGE_KEY, JSON.stringify(updated));

      setSuccessMessage(isEn ? 'Leave request sent to teacher successfully!' : 'Đã gửi đơn xin nghỉ thành công tới Thầy/Cô chủ nhiệm!');
      setShowLeaveModal(false);
      setLeaveReason('');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(isEn ? 'Error submitting leave request: ' + err.message : 'Có lỗi khi nộp đơn: ' + err.message);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Tính trạng thái chuyên cần hôm nay
  const todayRecord = useMemo(() => {
    return attendanceList.find(a => a.date === todayStr);
  }, [attendanceList, todayStr]);

  // Thống kê chuyên cần tổng quát
  const stats = useMemo(() => {
    const present = attendanceList.filter(a => a.status === 'PRESENT').length;
    const excused = attendanceList.filter(a => a.status === 'ABSENT_EXCUSED').length;
    const unexcused = attendanceList.filter(a => a.status === 'ABSENT_UNEXCUSED').length;
    const late = attendanceList.filter(a => a.status === 'LATE').length;
    const total = attendanceList.length || 1;
    const rate = Math.round((present / total) * 100);
    return { present, excused, unexcused, late, total: attendanceList.length, rate };
  }, [attendanceList]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0B101E] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-rose-200 selection:text-rose-900 pb-16">
      
      {/* 1. Header Sổ Liên Lạc Gia Đình */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111728]/95 backdrop-blur-md border-b border-rose-100 dark:border-slate-800 px-3.5 sm:px-6 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo EduViet Parent */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-1.5 shadow-md shadow-rose-500/20 flex items-center justify-center text-white shrink-0">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-rose-500 tracking-tight">Edu</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">Viet</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] sm:text-xs font-black border border-rose-300 dark:border-rose-800">
                  {isEn ? 'Parent Space 🏡' : 'Sổ Liên Lạc 🏡'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {isEn ? 'Home & School Connection • Supporting our children every step' : 'Gia đình kết nối Nhà trường • Đồng hành cùng con mỗi ngày'}
              </p>
            </div>
          </div>

          {/* Right Tools: Language, Theme, Switch to Student Portal / Teacher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              title={isEn ? "Chuyển sang Tiếng Việt" : "Switch to English"}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isEn ? '🇬🇧 EN' : '🇻🇳 VI'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-400 transition-all cursor-pointer shadow-xs"
              title={theme === 'dark' ? "Chế độ Sáng" : "Chế độ Tối"}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Link to Student */}
            <Link
              href={syncCode ? `/student?code=${syncCode}` : '/student'}
              className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <span>{isEn ? 'Student Portal' : 'Cổng Học Sinh'}</span>
            </Link>

            {/* Link to Teacher App */}
            <Link
              href="/app"
              className="px-3 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1"
            >
              <span>{isEn ? 'Teacher' : 'Giáo viên'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 space-y-4 sm:space-y-5">
        
        {/* 2. Tra cứu & Chuyển đổi con (Lookup & Child Switcher Bar) */}
        <section className="bg-white dark:bg-[#111728] border border-rose-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-rose-500" />
                <span>{isEn ? "Student Lookup & Verified Connection" : "Tra Cứu Thông Tin Học Sinh & Kết Nối Sổ Lớp"}</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn 
                  ? "Look up by Parent Phone or Child's 12-digit Citizen ID (CCCD) linked with school database." 
                  : "Tra cứu bằng Số điện thoại phụ huynh hoặc Số CCCD/Mã định danh 12 số của con đã đăng ký với nhà trường."}
              </p>
            </div>

            {/* Multi-child switch buttons */}
            {savedChildren.length > 1 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{isEn ? "Children:" : "Chọn con:"}</span>
                {savedChildren.map(c => (
                  <button
                    key={c.studentCode || c.id}
                    onClick={() => handleSelectChild(c)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      student?.studentCode === c.studentCode
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {c.fullName.split(' ').pop()} ({c.className})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                {isEn ? "School / Class Code" : "Mã trường / Lớp"}
              </label>
              <input
                type="text"
                placeholder={isEn ? "e.g. ST-2025" : "VD: ST-2025"}
                value={syncCode}
                onChange={e => setSyncCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                {isEn ? "Parent Phone" : "Số ĐT Phụ Huynh"}
              </label>
              <input
                type="tel"
                placeholder="0961364600"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                {isEn ? "Child's CCCD / ID" : "Số CCCD của Con (12 số)"}
              </label>
              <input
                type="text"
                placeholder="001208012345"
                value={studentCode}
                onChange={e => setStudentCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fetchParentData(syncCode, parentPhone, studentCode)}
                disabled={isLoading || (!syncCode && !studentCode && !parentPhone)}
                className="w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer transition-transform active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isEn ? "Tra Cứu & Đồng Bộ" : "Tra Cứu & Đồng Bộ"}</span>
              </button>
            </div>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </section>

        {/* 3. Hero Card: Thông tin Học sinh & Lớp học chính thức */}
        {student && (
          <section className="relative rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-rose-100/90 via-pink-50 to-amber-100/80 dark:from-[#171b2d] dark:via-[#19223c] dark:to-[#171b2d] border-2 border-rose-200/80 dark:border-slate-800 shadow-md flex flex-col gap-4 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 text-center sm:text-left flex-1">
                {/* Child Avatar */}
                <div className="relative shrink-0">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 p-1 shadow-lg shadow-rose-500/20 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={student.avatar || DEFAULT_PARENT_STUDENT.avatar}
                      alt={student.fullName}
                      className="w-full h-full object-cover rounded-2xl bg-white"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black shadow-xs">
                    {student.gender}
                  </span>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {student.fullName}
                    </h2>
                    <span className="text-lg">🌟</span>

                    {/* CCCD Badge */}
                    <span 
                      className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-xs font-mono font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shadow-2xs"
                      title={isEn ? "Unique National Citizen ID" : "Mã số định danh CCCD quốc gia duy nhất"}
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>CCCD: {student.studentCode || student.id}</span>
                    </span>
                  </div>

                  {/* School & Official Class (Proposal 1 & 2) */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-xs font-bold text-rose-700 dark:text-rose-400">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{isEn ? "Official Class:" : "Lớp chính thức:"} {student.className}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {student.schoolName || (isEn ? "Vietnam Elementary School" : "Trường Tiểu Học Việt Nam")}
                    </span>
                    <span className="text-slate-300 hidden sm:inline">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                      GVCN: {student.homeroomTeacher || 'Cô Trần Thị Mai'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    &ldquo;{student.bioQuote || (isEn ? "Curious learner, bright future!" : "Chăm ngoan, học giỏi, vâng lời thầy cô!")}&rdquo;
                  </p>
                </div>
              </div>

              {/* Action Button: Nộp đơn xin nghỉ học */}
              <div className="flex sm:flex-col items-center justify-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEn ? "Online Leave Request" : "Nộp Đơn Xin Nghỉ Học"}</span>
                </button>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                  {isEn ? "Direct to Homeroom Teacher" : "Gửi trực tiếp đến Giáo viên chủ nhiệm"}
                </span>
              </div>
            </div>

            {/* Dải tổng kết chuyên cần & Lời phê của giáo viên (Proposal 2) */}
            <div className="pt-2 border-t border-rose-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isEn ? "Attendance Rate:" : "Tỷ lệ chuyên cần:"}</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{stats.rate}%</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {stats.present} {isEn ? "Present" : "Có mặt"} / {stats.total} {isEn ? "Total" : "Buổi"}
                </span>
              </div>

              {student.teacherNotes && (
                <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium italic flex items-center gap-1">
                  <span>💬 {isEn ? "Teacher Remarks:" : "Lời phê của cô:"} {student.teacherNotes}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. Dashboard 4 Thẻ Trực Quan (Overview Cards) */}
        {student && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Card 1: Hôm nay (Today Status) */}
            <div className="bg-white dark:bg-[#111728] border border-rose-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>{isEn ? "Today's Attendance" : "Điểm danh hôm nay"}</span>
              </span>
              <div>
                {todayRecord ? (
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border ${
                    todayRecord.status === 'PRESENT'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                      : todayRecord.status === 'ABSENT_EXCUSED'
                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                      : todayRecord.status === 'LATE'
                      ? 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300'
                      : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {todayRecord.status === 'PRESENT' ? (isEn ? 'Present at School' : 'Đã có mặt tại lớp') :
                       todayRecord.status === 'ABSENT_EXCUSED' ? (isEn ? 'Excused Absence' : 'Nghỉ có phép') :
                       todayRecord.status === 'LATE' ? (isEn ? 'Late' : 'Đi trễ') : (isEn ? 'Unexcused Absence' : 'Vắng không phép')}
                    </span>
                  </span>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {isEn ? "Not yet checked in today." : "Chưa tới giờ hoặc chưa điểm danh."}
                  </p>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isEn ? "Updated live by teaching teacher" : "Cập nhật trực tiếp từ giờ dạy trên lớp"}
              </p>
            </div>

            {/* Card 2: Điểm rèn luyện thi đua (Kudos Stars) */}
            <div className="bg-white dark:bg-[#111728] border border-rose-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{isEn ? "Kudos Stars" : "Sao thi đua rèn luyện"}</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {student.kudosPoints} ⭐
                </span>
                <span className="text-xs text-slate-500 font-semibold">{isEn ? "points" : "sao tích lũy"}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isEn ? "Honors homework, participation & etiquette" : "Khen thưởng phát biểu, bài tập & nề nếp"}
              </p>
            </div>

            {/* Card 3: Thống kê chuyên cần (Monthly summary) */}
            <div className="bg-white dark:bg-[#111728] border border-rose-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isEn ? "Chuyên cần" : "Tổng kết chuyên cần"}</span>
              </span>
              <div className="flex items-center gap-2 text-xs font-bold pt-0.5">
                <span className="text-emerald-600 dark:text-emerald-400">{stats.present} {isEn ? "Pres." : "Có mặt"}</span>
                <span className="text-amber-600 dark:text-amber-400">{stats.excused} {isEn ? "Exc." : "Có phép"}</span>
                {stats.late > 0 && <span className="text-orange-600">{stats.late} {isEn ? "Late" : "Trễ"}</span>}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isEn ? `Tracked ${stats.total} sessions` : `Theo dõi ${stats.total} buổi học gần nhất`}
              </p>
            </div>

            {/* Card 4: Giáo viên chủ nhiệm & Hotline */}
            <div className="bg-white dark:bg-[#111728] border border-rose-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-rose-500" />
                <span>{isEn ? "Homeroom Teacher" : "Giáo viên chủ nhiệm"}</span>
              </span>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                {student.homeroomTeacher || 'Cô Trần Thị Mai'}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                <Phone className="w-3 h-3" />
                <span>Hotline: 0961.364.600</span>
              </div>
            </div>

          </div>
        )}

        {/* 5. Main Tabbed Navigation: Overview, Schedule, Attendance, Leave Requests, Notices */}
        {student && (
          <div className="space-y-4">
            
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
              {[
                { id: 'overview' as const, label: isEn ? 'Overview 📊' : 'Tổng quan 📊' },
                { id: 'schedule' as const, label: isEn ? 'Timetable 📅' : 'Thời khóa biểu 📅' },
                { id: 'attendance' as const, label: isEn ? 'Attendance 📋' : 'Sổ Chuyên Cần 📋' },
                { id: 'leave_requests' as const, label: `${isEn ? 'Leave Requests 📝' : 'Đơn Xin Nghỉ 📝'} (${leaveRequests.length})` },
                { id: 'notices' as const, label: isEn ? 'Notices 💌' : 'Lời Dặn Dò 💌' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1 & 2: Thời khóa biểu & Lịch học của con */}
            {(activeTab === 'overview' || activeTab === 'schedule') && (
              <div className="bg-white dark:bg-[#111728] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{isEn ? "Class Timetable & Periods Today:" : "Thời Khóa Biểu & Các Tiết Học Hôm Nay:"}</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                    {todayStr} ({student.className})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {scheduleEvents.map((ev, idx) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {ev.subject}
                          </h4>
                          {ev.sessionType && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                              {ev.sessionType}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ev.teacherName && <span>GV: <strong>{ev.teacherName}</strong> • </span>}
                          <span>Phòng: <strong>{ev.room}</strong></span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                          {ev.startTime} - {ev.endTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Sổ Chuyên Cần & Lịch sử điểm danh chi tiết */}
            {(activeTab === 'overview' || activeTab === 'attendance') && (
              <div className="bg-white dark:bg-[#111728] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isEn ? "Attendance History:" : "Lịch Sử Điểm Danh Chuyên Cần:"}</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                    {attendanceList.length} {isEn ? "sessions" : "buổi học"}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {attendanceList.map(rec => (
                    <div key={rec.id} className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{rec.date}</span>
                        <span className={`px-2.5 py-0.5 rounded-xl text-[11px] font-bold border ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                            : rec.status === 'ABSENT_EXCUSED'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300'
                            : rec.status === 'LATE'
                            ? 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                        }`}>
                          {rec.status === 'PRESENT' ? (isEn ? 'Present' : 'Có mặt') :
                           rec.status === 'ABSENT_EXCUSED' ? (isEn ? 'Excused' : 'Nghỉ có phép') :
                           rec.status === 'LATE' ? (isEn ? 'Late' : 'Đi trễ') : (isEn ? 'Unexcused' : 'Nghỉ không phép')}
                        </span>
                      </div>

                      <div className="text-right">
                        {rec.note && <span className="text-slate-500 dark:text-slate-400 italic mr-2 text-[11px]">&ldquo;{rec.note}&rdquo;</span>}
                        {rec.kudosDelta && rec.kudosDelta > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">+{rec.kudosDelta} ⭐</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Đơn xin nghỉ học trực tuyến */}
            {(activeTab === 'overview' || activeTab === 'leave_requests') && (
              <div className="bg-white dark:bg-[#111728] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {isEn ? "Online Leave Requests:" : "Đơn Xin Nghỉ Học Trực Tuyến:"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEn ? "New Request" : "Tạo Đơn Mới"}</span>
                  </button>
                </div>

                {leaveRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    {isEn ? "No leave requests submitted." : "Chưa có đơn xin nghỉ học nào."}
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {leaveRequests.map(req => (
                      <div key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {isEn ? "Leave Date:" : "Nghỉ ngày:"} {req.date}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                            }`}>
                              {req.status === 'APPROVED' ? (isEn ? 'Approved (Excused)' : 'Đã duyệt (Có phép)') :
                               req.status === 'REJECTED' ? (isEn ? 'Rejected' : 'Từ chối') : (isEn ? 'Pending Teacher Review' : 'Đang chờ giáo viên duyệt')}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                            {isEn ? "Reason:" : "Lý do:"} &ldquo;{req.reason}&rdquo;
                          </p>
                          {req.teacherNote && (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 italic">
                              ↳ {isEn ? "Teacher Note:" : "Lời nhắn của cô:"} &ldquo;{req.teacherNote}&rdquo;
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Lời dặn dò của Thầy/Cô & Bảng tin */}
            {(activeTab === 'overview' || activeTab === 'notices') && (
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-3xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xl shadow-xs">
                  💌
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                    <span>{isEn ? "Homeroom Teacher's Daily Notice:" : "Lời Dặn Dò & Thông Báo Của Cô Giáo Chủ Nhiệm:"}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                      {isEn ? "Important" : "Cần nhớ"}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {isEn 
                      ? "🌟 Kính gửi quý phụ huynh: Ngày mai lớp 3A1 có tiết học trải nghiệm ngoài trời và tiết Mỹ thuật. Kính nhờ quý phụ huynh chuẩn bị cho các con trang phục thể thao thoải mái, bình nước cá nhân và hộp màu vẽ nhé!"
                      : "🌟 Kính gửi quý phụ huynh: Ngày mai lớp 3A1 có tiết học trải nghiệm ngoài trời và tiết Mỹ thuật. Kính nhờ quý phụ huynh chuẩn bị cho các con trang phục thể thao thoải mái, bình nước cá nhân và hộp sáp màu nhé!"}
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* 6. Modal Nộp Đơn Xin Phép Nghỉ Học Trực Tuyến */}
      {showLeaveModal && student && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111728] border-2 border-rose-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    {isEn ? "Online Leave Request" : "Đơn Xin Nghỉ Học Trực Tuyến"}
                  </h3>
                  <p className="text-xs text-white/90 font-medium">
                    {isEn ? `Student: ${student.fullName} (${student.className})` : `Học sinh: ${student.fullName} (${student.className})`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitLeaveRequest} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isEn ? "Leave Date *" : "Ngày xin phép nghỉ *"}
                </label>
                <input
                  type="date"
                  required
                  value={leaveDate}
                  onChange={e => setLeaveDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isEn ? "Absence Category *" : "Hình thức xin nghỉ *"}
                </label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="SICK">{isEn ? "Health / Sick leave" : "Nghỉ ốm / Sức khỏe không tốt"}</option>
                  <option value="FAMILY">{isEn ? "Important family matter" : "Việc gia đình quan trọng"}</option>
                  <option value="OTHER">{isEn ? "Other legitimate reason" : "Lý do chính đáng khác"}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isEn ? "Detailed Reason *" : "Lý do chi tiết gửi Thầy/Cô *"}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={isEn 
                    ? "Dear Teacher, my child has a fever today, so our family asks for permission for him to take the day off..." 
                    : "Kính gửi Thầy/Cô, hôm nay cháu bị sốt nhẹ nên gia đình xin phép cho cháu nghỉ 1 buổi học để theo dõi sức khỏe..."}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isEn ? "Parent / Guardian Signature Name" : "Họ và tên Phụ huynh làm đơn"}
                </label>
                <input
                  type="text"
                  required
                  value={parentSignName}
                  onChange={e => setParentSignName(e.target.value)}
                  placeholder={isEn ? "Parent Name" : "Họ tên bố / mẹ"}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  {isEn ? "Cancel" : "Hủy bỏ"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingLeave ? (isEn ? "Sending..." : "Đang gửi...") : (isEn ? "Submit to Teacher" : "Gửi Đơn Cho Giáo Viên")}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
