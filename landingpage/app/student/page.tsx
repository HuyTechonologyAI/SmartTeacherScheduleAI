"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Award,
  ChevronRight,
  Search,
  FileText,
  HelpCircle,
  Gamepad2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  Sun,
  Moon,
  Star,
  Heart,
  Smile,
  Check,
  ArrowRight,
  ExternalLink,
  Volume2,
  Play,
  RotateCcw,
  Globe,
  BellRing,
  Edit3,
  LogIn,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Layers,
  IdCard,
  Lock
} from 'lucide-react';
import { Language, t, getStoredLanguage, saveStoredLanguage } from '../app/i18n';
import StudentAuthModal from '@/components/student/StudentAuthModal';
import StudentProfileEditModal from '@/components/student/StudentProfileEditModal';
import {
  StudentProfile,
  DEFAULT_STUDENT_PROFILE,
  EDUCATION_LEVELS,
  EducationLevel,
  getStoredStudentProfile,
  saveStudentProfile,
  getSchoolApprovedClassrooms,
  syncStudentWithTeacherRoster
} from './studentProfileData';

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
  notes?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  teacherName?: string;
}

interface StudentKudos {
  id: string;
  studentCode?: string;
  fullName: string;
  className: string;
  gender: string;
  kudosPoints: number;
  badge?: string;
}

interface HomeworkTask {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  points: number;
  isCompleted: boolean;
  notes: string;
}

const KID_AVATARS = [
  { id: 'cat', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidCat', name: 'Mèo Thông Thái' },
  { id: 'bear', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidBear', name: 'Gấu Chăm Chỉ' },
  { id: 'fox', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidFox', name: 'Cáo Nhanh Trí' },
  { id: 'bunny', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidBunny', name: 'Thỏ Hoạt Bát' },
  { id: 'astro', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidAstro', name: 'Phi Hành Gia' },
  { id: 'owl', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidOwl', name: 'Cú Học Giỏi' }
];

export default function StudentPortalPage() {
  const [lang, setLang] = useState<Language>('vi');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Student Profile State (CCCD, Full info, Education Level)
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>('primary');
  const [collegeCustomClass, setCollegeCustomClass] = useState<string>('CNTT-K24');

  // School Approved Classes (Proposal 1 & 2: Quản lý bởi Nhà trường)
  const [approvedSchoolClasses, setApprovedSchoolClasses] = useState<{ id: string; name: string; grade?: string; homeroomTeacher?: string }[]>(() => getSchoolApprovedClassrooms());

  // Student Info State
  const [studentName, setStudentName] = useState<string>('Nguyễn Bảo An');
  const [studentAvatar, setStudentAvatar] = useState<string>(KID_AVATARS[0].url);
  const [studentStars, setStudentStars] = useState<number>(125);
  const [isChangingAvatar, setIsChangingAvatar] = useState<boolean>(false);

  // Connection & Class State
  const [syncCode, setSyncCode] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('Lớp 3A1');
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string }[]>([
    { id: '1', name: 'Lớp 1A' },
    { id: '2', name: 'Lớp 2B' },
    { id: '3', name: 'Lớp 3A1' },
    { id: '4', name: 'Lớp 4A' },
    { id: '5', name: 'Lớp 5A' }
  ]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [kudosList, setKudosList] = useState<StudentKudos[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Main Tab: 'timetable' | 'homework' | 'materials' | 'kudos'
  const [studentTab, setStudentTab] = useState<'timetable' | 'homework' | 'materials' | 'kudos'>('timetable');

  // Completed Homework State (saved locally)
  const [homeworkList, setHomeworkList] = useState<HomeworkTask[]>([
    {
      id: 'hw1',
      subject: 'Toán học',
      title: 'Luyện tập bảng nhân 7 và bài tập trang 24 SGK',
      dueDate: 'Hôm nay',
      points: 10,
      isCompleted: false,
      notes: 'Làm bài vào vở ô ly nộp cho cô vào sáng mai nhé!'
    },
    {
      id: 'hw2',
      subject: 'Tiếng Việt',
      title: 'Luyện đọc diễn cảm bài "Mùa hoa phượng vĩ" và trả lời 3 câu hỏi',
      dueDate: 'Ngày mai',
      points: 15,
      isCompleted: true,
      notes: 'Đọc to, rõ ràng và truyền cảm cho bố mẹ cùng nghe.'
    },
    {
      id: 'hw3',
      subject: 'Tiếng Anh',
      title: 'Học 5 từ mới chủ đề School Items & nghe phát âm audio bài 4',
      dueDate: 'Thứ Năm',
      points: 10,
      isCompleted: false,
      notes: 'Ôn luyện mẫu câu: "What is this? - It is a pencil."'
    }
  ]);

  const [cheerMsg, setCheerMsg] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isEn = lang === 'en';

  // Toggle Theme & Language
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

      // Load stored student profile and sync with teacher roster
      const storedProf = getStoredStudentProfile();
      setStudentProfile(storedProf);
      setStudentName(storedProf.fullName);
      setStudentAvatar(storedProf.avatar);
      setSelectedClass(storedProf.className);
      setSelectedLevel(storedProf.educationLevel);
      setApprovedSchoolClasses(getSchoolApprovedClassrooms());
      if (storedProf.educationLevel === 'college') {
        setCollegeCustomClass(storedProf.className);
      }

      const savedStars = localStorage.getItem('smart_student_stars');
      if (savedStars) setStudentStars(parseInt(savedStars, 10) || storedProf.kudosPoints || 125);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAuthSuccess = (newProfile: StudentProfile) => {
    const synced = syncStudentWithTeacherRoster(newProfile);
    setStudentProfile(synced);
    setStudentName(synced.fullName);
    setStudentAvatar(synced.avatar);
    setSelectedClass(synced.className);
    setSelectedLevel(synced.educationLevel);
    setStudentStars(synced.kudosPoints || 125);
    if (synced.educationLevel === 'college') {
      setCollegeCustomClass(synced.className);
    }
    if (syncCode) fetchClassData(syncCode, synced.className);
    setCheerMsg(isEn ? `🔗 Connected with School Roster: ${synced.className}` : `🔗 Đã kết nối Sổ lớp Nhà trường: ${synced.className}`);
    setTimeout(() => setCheerMsg(null), 4000);
  };

  const handleSaveProfile = (updatedProfile: StudentProfile) => {
    const synced = syncStudentWithTeacherRoster(updatedProfile);
    setStudentProfile(synced);
    setStudentName(synced.fullName);
    setStudentAvatar(synced.avatar);
    setSelectedClass(synced.className);
    setSelectedLevel(synced.educationLevel);
    setStudentStars(synced.kudosPoints || 125);
    if (synced.educationLevel === 'college') {
      setCollegeCustomClass(synced.className);
    }
    if (syncCode) fetchClassData(syncCode, synced.className);
    setApprovedSchoolClasses(getSchoolApprovedClassrooms());
  };

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

  // Load from URL / LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code') || localStorage.getItem('smart_student_sync_code') || '';
      const classFromUrl = params.get('class') || localStorage.getItem('smart_student_class') || '';

      if (codeFromUrl) {
        setSyncCode(codeFromUrl);
        if (classFromUrl) setSelectedClass(classFromUrl);
        fetchClassData(codeFromUrl, classFromUrl);
      } else {
        // Fallback default elementary mock events if no sync code provided
        setEvents(getDefaultElementarySchedule(isEn));
      }
    }
  }, [isEn]);

  const fetchClassData = async (code: string, cName?: string) => {
    if (!code) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const url = `/api/portal?code=${encodeURIComponent(code)}&role=student${studentProfile.studentCode ? `&studentCode=${encodeURIComponent(studentProfile.studentCode)}` : ''}${cName ? `&class=${encodeURIComponent(cName)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || (isEn ? 'Class timetable data not found.' : 'Không tìm thấy dữ liệu lớp học.'));
        setIsLoading(false);
        return;
      }

      if (data.matchedStudent) {
        setStudentProfile(prev => ({
          ...prev,
          kudosPoints: data.matchedStudent.kudosPoints ?? prev.kudosPoints,
          attendanceSummary: data.matchedStudent.attendanceSummary || prev.attendanceSummary,
          teacherNotes: data.matchedStudent.notes || prev.teacherNotes,
          isSchoolVerified: true,
          schoolAssignedClass: data.matchedStudent.className || prev.className
        }));
        if (typeof data.matchedStudent.kudosPoints === 'number') {
          setStudentStars(data.matchedStudent.kudosPoints);
        }
      }

      if (data.availableClasses && data.availableClasses.length > 0) {
        setAvailableClasses(data.availableClasses);
        setApprovedSchoolClasses(data.availableClasses);
      }
      const matchedClass = data.officialAssignedClass || data.currentClass || (data.availableClasses?.[0]?.name) || cName || 'Lớp 3A1';
      setSelectedClass(matchedClass);
      
      if (data.events && data.events.length > 0) {
        setEvents(data.events);
      } else {
        setEvents(getDefaultElementarySchedule(isEn));
      }

      if (data.kudosLeaderboard && data.kudosLeaderboard.length > 0) {
        setKudosList(data.kudosLeaderboard);
      }

      localStorage.setItem('smart_student_sync_code', code);
      if (matchedClass) localStorage.setItem('smart_student_class', matchedClass);
    } catch (err: any) {
      setErrorMessage(isEn ? 'Server connection error: ' + err.message : 'Lỗi kết nối máy chủ: ' + err.message);
      setEvents(getDefaultElementarySchedule(isEn));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClass = (clsName: string) => {
    setSelectedClass(clsName);
    if (syncCode) fetchClassData(syncCode, clsName);
  };

  const handleToggleHomework = (hwId: string) => {
    setHomeworkList(prev => prev.map(hw => {
      if (hw.id === hwId) {
        const nextState = !hw.isCompleted;
        if (nextState) {
          // Add stars
          const added = hw.points || 10;
          setStudentStars(s => {
            const nextTotal = s + added;
            localStorage.setItem('smart_student_stars', String(nextTotal));
            return nextTotal;
          });
          setCheerMsg(isEn ? `🎉 Hooray! You earned +${added} stars!` : `🎉 Tuyệt vời! Bạn nhận được +${added} ngôi sao chăm chỉ! ⭐`);
          setTimeout(() => setCheerMsg(null), 3500);
        }
        return { ...hw, isCompleted: nextState };
      }
      return hw;
    }));
  };

  const handlePickAvatar = (avatarUrl: string) => {
    setStudentAvatar(avatarUrl);
    localStorage.setItem('smart_student_avatar', avatarUrl);
    setIsChangingAvatar(false);
  };

  function getDefaultElementarySchedule(english: boolean): EventItem[] {
    if (english) {
      return [
        {
          id: 'e1',
          title: 'Mathematics',
          subject: 'Mathematics',
          className: 'Class 3A1',
          date: todayStr,
          startTime: '07:30',
          endTime: '08:15',
          room: 'Room 204',
          sessionType: 'Period 1',
          notes: 'Multiplication table 7, practice arithmetic exercises in workbooks.',
          teacherName: 'Ms. Tran Thi Mai'
        },
        {
          id: 'e2',
          title: 'Vietnamese Reading',
          subject: 'Vietnamese',
          className: 'Class 3A1',
          date: todayStr,
          startTime: '08:25',
          endTime: '09:10',
          room: 'Room 204',
          sessionType: 'Period 2',
          notes: 'Reading comprehension & vocabulary practice.',
          teacherName: 'Mr. Le Minh Duc'
        },
        {
          id: 'e3',
          title: 'English Fun Time',
          subject: 'English',
          className: 'Class 3A1',
          date: todayStr,
          startTime: '09:30',
          endTime: '10:15',
          room: 'English Lab 1',
          sessionType: 'Period 3',
          notes: 'Unit 4: Our School Objects - Singing and interactive games.',
          teacherName: 'Teacher Sarah'
        },
        {
          id: 'e4',
          title: 'Creative Arts',
          subject: 'Arts & Crafts',
          className: 'Class 3A1',
          date: todayStr,
          startTime: '10:25',
          endTime: '11:10',
          room: 'Art Room B',
          sessionType: 'Period 4',
          notes: 'Draw your favorite dream landscape with color pencils.',
          teacherName: 'Ms. Pham Thu Ha'
        }
      ];
    }

    return [
      {
        id: 'e1',
        title: 'Toán học',
        subject: 'Toán học',
        className: 'Lớp 3A1',
        date: todayStr,
        startTime: '07:30',
        endTime: '08:15',
        room: 'Phòng 204',
        sessionType: 'Tiết 1',
        notes: 'Học bảng nhân 7, làm các bài toán thực hành đố vui có thưởng.',
        teacherName: 'Cô Trần Thị Mai'
      },
      {
        id: 'e2',
        title: 'Tiếng Việt',
        subject: 'Tiếng Việt',
        className: 'Lớp 3A1',
        date: todayStr,
        startTime: '08:25',
        endTime: '09:10',
        room: 'Phòng 204',
        sessionType: 'Tiết 2',
        notes: 'Tập đọc bài "Mùa hoa phượng", trả lời câu hỏi và thi đọc diễn cảm.',
        teacherName: 'Thầy Lê Minh Đức'
      },
      {
        id: 'e3',
        title: 'Tiếng Anh (English)',
        subject: 'Tiếng Anh',
        className: 'Lớp 3A1',
        date: todayStr,
        startTime: '09:30',
        endTime: '10:15',
        room: 'Phòng Ngoại ngữ 1',
        sessionType: 'Tiết 3',
        notes: 'Chủ đề: Trường học thân thiện (Our School). Hát và chơi đố chữ.',
        teacherName: 'Cô Sarah & Cô Thu Trang'
      },
      {
        id: 'e4',
        title: 'Mỹ thuật',
        subject: 'Mỹ thuật',
        className: 'Lớp 3A1',
        date: todayStr,
        startTime: '10:25',
        endTime: '11:10',
        room: 'Phòng Mỹ thuật',
        sessionType: 'Tiết 4',
        notes: 'Vẽ tranh phong cảnh trường em bằng sáp màu và đất nặn.',
        teacherName: 'Cô Phạm Thu Hà'
      }
    ];
  }

  // Get color per subject
  const getSubjectTheme = (sub: string) => {
    const s = sub.toLowerCase();
    if (s.includes('toán') || s.includes('math')) {
      return {
        bg: 'from-amber-400 to-orange-500',
        lightBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-300',
        icon: '📐'
      };
    }
    if (s.includes('việt') || s.includes('văn') || s.includes('literat')) {
      return {
        bg: 'from-emerald-400 to-teal-600',
        lightBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-700 dark:text-emerald-300',
        icon: '📖'
      };
    }
    if (s.includes('anh') || s.includes('english')) {
      return {
        bg: 'from-blue-500 to-indigo-600',
        lightBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        icon: '🌍'
      };
    }
    if (s.includes('mỹ thuật') || s.includes('art')) {
      return {
        bg: 'from-pink-400 to-rose-500',
        lightBg: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800',
        text: 'text-pink-700 dark:text-pink-300',
        icon: '🎨'
      };
    }
    return {
      bg: 'from-purple-400 to-indigo-600',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      icon: '⭐'
    };
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] dark:bg-[#0A0E1A] text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-200 selection:text-amber-900 pb-16 transition-colors duration-200">
      
      {/* 1. Header thân thiện, rực rỡ */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#101726]/95 backdrop-blur-md border-b border-amber-100 dark:border-slate-800 px-3.5 sm:px-6 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Logo EduViet Kid */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-pink-500 p-1.5 shadow-md shadow-orange-500/20 flex items-center justify-center text-white shrink-0 animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-rose-500 tracking-tight">Edu</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">Viet</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] sm:text-xs font-black border border-amber-300 dark:border-amber-700">
                  {isEn ? 'Student Space 🎈' : 'Góc Học Sinh 🎈'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {isEn ? 'Fun learning every day • Reaching for the stars' : 'Mỗi ngày đến trường là một ngày vui • Vươn tới ước mơ'}
              </p>
            </div>
          </div>

          {/* Right Tools: Language, Theme, Switch to Parent / Teacher, Student Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Student Account Login / Switcher */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 dark:from-amber-950/70 dark:to-orange-950/70 dark:hover:from-amber-900 dark:hover:to-orange-900 border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 transition-all cursor-pointer shadow-xs"
              title={isEn ? "Student Account / Citizen ID Login" : "Đăng nhập học sinh bằng CCCD / Đổi tài khoản"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={studentAvatar} alt={studentName} className="w-5 h-5 rounded-full bg-white object-cover shadow-2xs" />
              <span className="hidden sm:inline font-black truncate max-w-[85px]">{studentName.split(' ').pop()}</span>
              <span className="hidden md:inline px-1.5 py-0.2 rounded bg-amber-500 text-white font-mono text-[9px] font-bold">
                {studentProfile.studentCode.slice(-4)}
              </span>
              <LogIn className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              title={isEn ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
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

            {/* Link to Parent */}
            <Link
              href={syncCode ? `/parent?code=${syncCode}` : '/parent'}
              className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <span>{isEn ? 'Parents' : 'Phụ huynh'}</span>
            </Link>

            {/* Link to Teacher App */}
            <Link
              href="/app"
              className="px-3 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1"
            >
              <span>{isEn ? 'Teacher App' : 'Giáo viên'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Cheer Banner upon completing homework */}
      {cheerMsg && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white text-center py-2.5 px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg animate-fade-in sticky top-14 z-30">
          <Star className="w-4 h-4 fill-white animate-spin" />
          <span>{cheerMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 space-y-4 sm:space-y-5">
        
        {/* 2. Hero Student Profile Card: Avatar + Name + CCCD + School-Verified Class + Learning Journey */}
        <section className="relative rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-amber-100/90 via-orange-50 to-pink-100/80 dark:from-slate-900 dark:via-[#161f36] dark:to-slate-900 border-2 border-amber-200/80 dark:border-slate-800 shadow-md flex flex-col gap-4 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left flex-1">
              {/* Avatar with click to change or edit */}
              <div className="relative group cursor-pointer" onClick={() => setIsProfileEditOpen(true)} title={isEn ? "Click to update profile & avatar" : "Nhấp để chỉnh sửa hồ sơ & ảnh đại diện"}>
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-400 p-1 shadow-lg shadow-amber-500/20 overflow-hidden group-hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={studentAvatar}
                    alt={studentName}
                    className="w-full h-full object-cover rounded-2xl bg-white"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-sm flex items-center gap-0.5">
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>{isEn ? 'Edit' : 'Sửa'}</span>
                </span>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {studentName}
                  </h2>
                  <span className="text-lg">⭐</span>

                  {/* CCCD / Mã định danh badge (Khóa duy nhất) */}
                  <span 
                    className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-xs font-mono font-bold border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shadow-2xs"
                    title={isEn ? "National Citizen ID / Unique Student Key" : "Mã số định danh CCCD liên kết sổ lớp giáo viên"}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>CCCD: {studentProfile.studentCode}</span>
                  </span>

                  {/* Edit profile button */}
                  <button
                    onClick={() => setIsProfileEditOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title={isEn ? "Edit profile & personal info" : "Chỉnh sửa thông tin cá nhân"}
                  >
                    <Edit3 className="w-3 h-3 text-amber-500" />
                    <span>{isEn ? "Edit Info" : "Sửa thông tin"}</span>
                  </button>
                </div>

                {/* Official School Class & Teacher Badge (Proposal 1 & 2) */}
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isEn ? "Official Class:" : "Lớp chính thức:"} {studentProfile.className}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {studentProfile.schoolName || (isEn ? "Vietnam School" : "Trường Tiểu Học Việt Nam")}
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                    GVCN: {studentProfile.homeroomTeacher || 'Cô Trần Thị Mai'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  &ldquo;{studentProfile.bioQuote || (isEn ? "Curious learner, bright future!" : "Chăm ngoan, học giỏi, vâng lời thầy cô!")}&rdquo;
                </p>
              </div>
            </div>

            {/* Star Kudos Reward Box & Account Switcher */}
            <div className="flex sm:flex-col items-center justify-center gap-3 sm:gap-1.5 bg-white/90 dark:bg-slate-800/90 p-3 sm:p-4 rounded-2xl border border-amber-200 dark:border-slate-700 shadow-sm w-full sm:w-auto shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-md animate-bounce">
                  <Star className="w-5 h-5 fill-white text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    {isEn ? "Kudos Stars" : "Sao rèn luyện"}
                  </p>
                  <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 leading-none">
                    {studentStars} ⭐
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 w-full justify-center">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  {isEn ? "Rank: Little Star 🏆" : "Hạng: Ngôi Sao Nhí 🏆"}
                </span>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                  title={isEn ? "Switch or login with student ID" : "Đổi tài khoản học sinh hoặc đăng nhập mã mới"}
                >
                  <LogIn className="w-2.5 h-2.5 text-amber-500" />
                  <span>{isEn ? "Switch" : "Đổi TK"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Learning Journey & Attendance Tracking Strip (Proposal 2: Đồng bộ & Quản lý xuyên suốt) */}
          <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEn ? "Attendance Tracking:" : "Theo dõi Chuyên cần:"}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                {studentProfile.attendanceSummary?.present ?? 36} {isEn ? "Present" : "Có mặt"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                {studentProfile.attendanceSummary?.absent ?? 1} {isEn ? "Excused" : "Nghỉ phép"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                {studentProfile.attendanceSummary?.late ?? 0} {isEn ? "Late" : "Đi trễ"}
              </span>
            </div>

            {studentProfile.teacherNotes && (
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium italic flex items-center gap-1">
                <span>💬 {isEn ? "Teacher Note:" : "Nhận xét của cô:"} {studentProfile.teacherNotes}</span>
              </div>
            )}
          </div>
        </section>

        {/* 3. Official School-Approved Class Roster & Schedule Tracking (Proposal 1 & 2) */}
        <div className="bg-white dark:bg-[#111827] border border-amber-200 dark:border-slate-800 p-3 sm:p-4 rounded-3xl shadow-xs space-y-3">
          
          {/* Header Bar: School Management Badge & Quick Sync Code */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-2xs">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isEn ? "School-Approved Class Roster" : "Danh Mục Lớp Học Do Nhà Trường Xếp Duyệt"}</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {isEn ? "Verified" : "Chính thức"}
                  </span>
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEn 
                  ? "Configured by School Administration to ensure students track authorized classes and verified timetables." 
                  : "Bộ phận quản lý nhà trường đã thiết lập danh sách lớp chính thức để các em theo dõi đúng thời khóa biểu, tránh việc thêm khối lớp không chính xác."}
              </p>
            </div>

            {/* Quick sync code lookup */}
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              <input
                type="text"
                placeholder={isEn ? "School code..." : "Mã trường/lớp..."}
                value={syncCode}
                onChange={e => setSyncCode(e.target.value.toUpperCase())}
                className="px-2.5 py-1 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono w-24 sm:w-28 focus:outline-none"
              />
              <button
                onClick={() => fetchClassData(syncCode, selectedClass)}
                disabled={isLoading || !syncCode}
                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer disabled:opacity-40"
                title={isEn ? "Fetch official class timetable" : "Tải thời khóa biểu chính thức"}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Official Approved Classes Pills */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEn ? "Select Approved Class to View Schedule:" : "Chọn Lớp chính thức để xem Thời khóa biểu:"}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {isEn ? "Click to view class schedule" : "Bấm để xem lịch học của lớp"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {approvedSchoolClasses.map(c => {
                const isSelected = selectedClass.toLowerCase() === c.name.toLowerCase();
                const isMyOfficialClass = (studentProfile.className || '').toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.id || c.name}
                    onClick={() => handleSelectClass(c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs ring-2 ring-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{c.name}</span>
                    {isMyOfficialClass && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 text-[9px] font-black">
                        {isEn ? "My Class 🛡️" : "Lớp của em 🛡️"}
                      </span>
                    )}
                    {c.homeroomTeacher && !isMyOfficialClass && (
                      <span className="text-[9px] opacity-75 hidden sm:inline">({c.homeroomTeacher.split(' ').pop()})</span>
                    )}
                  </button>
                );
              })}

              {/* Also show any teacher-synced classes if different */}
              {availableClasses.filter(c => !approvedSchoolClasses.some(a => a.name.toLowerCase() === c.name.toLowerCase())).map(c => (
                <button
                  key={c.id || c.name}
                  onClick={() => handleSelectClass(c.name)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedClass.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Teacher's Friendly Note of the Day */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-3xl p-3.5 sm:p-4 flex items-start gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm text-lg">
            💌
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <span>{isEn ? "Teacher's Daily Note" : "Lời Dặn Dò Của Cô Giáo Chủ Nhiệm"}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">
                {isEn ? "Important" : "Cần nhớ"}
              </span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {isEn 
                ? "🌟 You all did great in math today! Please remember to bring your 12-color crayons and safe scissors for tomorrow's Art class!"
                : "🌟 Hôm nay cả lớp học rất ngoan và sôi nổi! Ngày mai có tiết Mỹ thuật, các con nhớ chuẩn bị sẵn hộp sáp màu 12 màu và kéo thủ công an toàn nhé!"}
            </p>
          </div>
        </div>

        {/* 5. 4 Primary Fun Action Tabs (Big icon cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          
          {/* Tab 1: Timetable */}
          <button
            onClick={() => setStudentTab('timetable')}
            className={`p-3 sm:p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              studentTab === 'timetable'
                ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-400'
            }`}
          >
            <span className="text-2xl">📅</span>
            <span className="text-xs sm:text-sm font-black tracking-tight">
              {isEn ? "Today's Lessons" : "Thời Khóa Biểu"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${studentTab === 'timetable' ? 'bg-black/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'}`}>
              {events.length} {isEn ? "periods" : "tiết"}
            </span>
          </button>

          {/* Tab 2: Homework */}
          <button
            onClick={() => setStudentTab('homework')}
            className={`p-3 sm:p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              studentTab === 'homework'
                ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-102'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-rose-400'
            }`}
          >
            <span className="text-2xl">📝</span>
            <span className="text-xs sm:text-sm font-black tracking-tight">
              {isEn ? "Homework Tasks" : "Bài Tập Về Nhà"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${studentTab === 'homework' ? 'bg-black/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
              {homeworkList.filter(h => !h.isCompleted).length} {isEn ? "to-do" : "cần làm"}
            </span>
          </button>

          {/* Tab 3: Materials & Games */}
          <button
            onClick={() => setStudentTab('materials')}
            className={`p-3 sm:p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              studentTab === 'materials'
                ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-102'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-400'
            }`}
          >
            <span className="text-2xl">🎮</span>
            <span className="text-xs sm:text-sm font-black tracking-tight">
              {isEn ? "Games & Books" : "Học Liệu & Game"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${studentTab === 'materials' ? 'bg-black/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'}`}>
              {isEn ? "Fun reading" : "Đọc truyện"}
            </span>
          </button>

          {/* Tab 4: Kudos Garden */}
          <button
            onClick={() => setStudentTab('kudos')}
            className={`p-3 sm:p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              studentTab === 'kudos'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-400'
            }`}
          >
            <span className="text-2xl">🌸</span>
            <span className="text-xs sm:text-sm font-black tracking-tight">
              {isEn ? "Star Garden" : "Vườn Sao Điểm 10"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${studentTab === 'kudos' ? 'bg-black/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'}`}>
              {isEn ? "Leaderboard" : "Bảng vinh danh"}
            </span>
          </button>
        </div>

        {/* 6. TAB CONTENT */}

        {/* ================= TAB 1: THỜI KHÓA BIỂU TRỰC QUAN ================= */}
        {studentTab === 'timetable' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📚</span>
                <span>{isEn ? "Lessons for Today" : "Các Tiết Học Hôm Nay"}</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {todayStr}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {events.map((ev, idx) => {
                const theme = getSubjectTheme(ev.subject);
                const isFirst = idx === 0;
                return (
                  <div
                    key={ev.id || idx}
                    className="bg-white dark:bg-[#111827] border-2 border-slate-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      {/* Top bar with period & time */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{ev.startTime} - {ev.endTime}</span>
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          {ev.sessionType || (isEn ? `Period ${idx + 1}` : `Tiết ${idx + 1}`)}
                        </span>
                      </div>

                      {/* Subject Name with big icon */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${theme.bg} text-white flex items-center justify-center text-xl shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                          {theme.icon}
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {ev.subject}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{ev.room || (isEn ? "Room 204" : "Phòng 204")}</span>
                            <span className="text-slate-300">•</span>
                            <span>{ev.teacherName || (isEn ? "Teacher" : "Cô giáo phụ trách")}</span>
                          </p>
                        </div>
                      </div>

                      {/* Notes / Tips */}
                      {ev.notes && (
                        <div className={`mt-3 p-2.5 rounded-2xl ${theme.lightBg} text-xs ${theme.text} flex items-start gap-2 font-medium`}>
                          <span className="text-sm shrink-0">💡</span>
                          <span className="leading-relaxed">{ev.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{isFirst ? (isEn ? "Current Class" : "Tiết tiếp theo") : (isEn ? "Upcoming" : "Sắp tới")}</span>
                      </span>
                      <button className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold transition-colors cursor-pointer flex items-center gap-1">
                        <span>{isEn ? "Open Book" : "Mở bài học"}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BÀI TẬP VỀ NHÀ VUI NHỘN ================= */}
        {studentTab === 'homework' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>📝</span>
                  <span>{isEn ? "Homework Quests for You" : "Nhiệm Vụ Bài Tập Về Nhà"}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? "Complete tasks to earn golden stars!" : "Hoàn thành bài tập để nhận thêm sao chăm chỉ nhé!"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {homeworkList.map((hw) => {
                const theme = getSubjectTheme(hw.subject);
                return (
                  <div
                    key={hw.id}
                    className={`p-4 rounded-3xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      hw.isCompleted
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 opacity-90'
                        : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${theme.bg} text-white flex items-center justify-center text-xl shrink-0 shadow-sm mt-0.5`}>
                        {theme.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-700 dark:text-slate-300">
                            {hw.subject}
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{isEn ? `Due: ${hw.dueDate}` : `Hạn nộp: ${hw.dueDate}`}</span>
                          </span>
                          <span className="px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                            +{hw.points} ⭐
                          </span>
                        </div>

                        <h4 className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white ${hw.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                          {hw.title}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {hw.notes}
                        </p>
                      </div>
                    </div>

                    {/* Checkbox button */}
                    <button
                      onClick={() => handleToggleHomework(hw.id)}
                      className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 ${
                        hw.isCompleted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25 active:scale-95'
                      }`}
                    >
                      {hw.isCompleted ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{isEn ? "Done! ⭐" : "Đã làm xong! ⭐"}</span>
                        </>
                      ) : (
                        <>
                          <span>{isEn ? "Mark Done" : "Bấm khi làm xong"}</span>
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: HỌC LIỆU & GAME ĐỌC SÁCH ================= */}
        {studentTab === 'materials' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>📖</span>
                  <span>{isEn ? "Digital Bookshelf & Interactive Games" : "Tủ Sách Điện Tử & Trò Chơi Học Tập"}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? "Read illustrated storybooks and play quiz challenges!" : "Đọc truyện tranh giáo dục và ôn tập qua các trò chơi thú vị!"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Card 1: Math Quiz Game */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-amber-950/40 border-2 border-amber-200 dark:border-amber-800/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md">
                    🎯
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {isEn ? "Quick Math Duel" : "Đố Vui Toán Học"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isEn ? "Speed arithmetic mini-game to sharpen multiplication!" : "Trò chơi tính nhanh vượt chướng ngại vật bảng cửu chương!"}
                  </p>
                </div>
                <button
                  onClick={() => alert(isEn ? "Game starting! Get ready to calculate fast!" : "Trò chơi đang khởi động! Hãy sẵn sàng tính nhẩm nhanh nhé!")}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isEn ? "Play Game" : "Chơi Ngay"}</span>
                </button>
              </div>

              {/* Card 2: Interactive Storybook */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-900 dark:to-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
                    📚
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {isEn ? "Storybook: Brave Animals" : "Truyện Tranh: Muông Thú"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isEn ? "Animated bilingual story with friendly voiceover." : "Truyện cổ tích song ngữ có giọng đọc truyền cảm và tranh vẽ."}
                  </p>
                </div>
                <button
                  onClick={() => alert(isEn ? "Opening illustrated book..." : "Đang mở sách tranh hoạt họa...")}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isEn ? "Read Story" : "Đọc Truyện"}</span>
                </button>
              </div>

              {/* Card 3: English Song & Vocabulary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950/40 border-2 border-blue-200 dark:border-blue-800/80 rounded-3xl p-4 shadow-sm flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md">
                    🎵
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {isEn ? "English ABC Song" : "Góc Hát Tiếng Anh"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isEn ? "Sing along to learn school objects and cheerful words!" : "Hát và học phát âm chuẩn bản xứ các đồ dùng học tập."}
                  </p>
                </div>
                <button
                  onClick={() => alert(isEn ? "Playing English song..." : "Đang phát bài hát tiếng Anh...")}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "Listen & Sing" : "Nghe & Hát"}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 4: VƯỜN HOA ĐIỂM MƯỜI & BẢNG THI ĐUA ================= */}
        {studentTab === 'kudos' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>🏆</span>
                  <span>{isEn ? "Classroom Star Leaderboard" : "Bảng Vàng Thi Đua Lớp 3A1"}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEn ? "Honoring hardworking and kind friends in class!" : "Tuyên dương những bạn nhỏ chăm ngoan, tiến bộ và tích cực nhất!"}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
              {[
                { rank: 1, name: 'Nguyễn Bảo An (Bạn)', stars: studentStars, badge: '⭐ Kiện Tướng Chăm Chỉ', icon: '👑' },
                { rank: 2, name: 'Trần Minh Khang', stars: 118, badge: '🌟 Búp Sen Xanh', icon: '🥈' },
                { rank: 3, name: 'Lê Thùy Chi', stars: 112, badge: '🌸 Hoa Điểm Mười', icon: '🥉' },
                { rank: 4, name: 'Phạm Tuấn Hưng', stars: 105, badge: '🚀 Thần Đồng Tính Nhanh', icon: '4' },
                { rank: 5, name: 'Vũ Ngọc Hân', stars: 98, badge: '📖 Bạn Nhỏ Yêu Sách', icon: '5' }
              ].map((item) => (
                <div
                  key={item.rank}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    item.rank === 1
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                      item.rank === 1 ? 'bg-amber-400 text-white text-base shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.icon}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.rank === 1 && (
                          <span className="px-2 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                            {isEn ? "You" : "Bạn"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {item.badge}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                      {item.stars} ⭐
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Student Authentication Modal (CCCD / School ID) */}
      <StudentAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentProfile={studentProfile}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
      />

      {/* Student Profile Edit Modal (CCCD, Level, Grades 1-12 & College Codes) */}
      <StudentProfileEditModal
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        profile={studentProfile}
        onSave={handleSaveProfile}
        lang={lang}
      />
    </div>
  );
}
