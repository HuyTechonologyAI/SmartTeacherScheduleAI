"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  School,
  Users,
  BookOpen,
  Calendar,
  FileText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Check,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  Award,
  Layers,
  Phone,
  Mail,
  Lock,
  ChevronRight,
  ExternalLink,
  Printer,
  Copy,
  Clock,
  X,
  Send,
  Building,
  Briefcase,
  Sliders,
  FolderOpen,
  Database
} from 'lucide-react';
import { Language, getStoredLanguage, saveStoredLanguage } from '../app/i18n';
import StorageDiagnosticsModal from '@/components/storage/StorageDiagnosticsModal';
import {
  TeacherStaffItem,
  SchoolLessonPlanItem,
  SchoolWorkScheduleItem,
  LegalDocumentItem,
  SchoolClassroomItem,
  FacilityRoomItem,
  StaffCategory,
  AcademicYear,
  SemesterType,
  LessonPlanStatus,
  DocumentSource,
  getStoredStaffList,
  saveStoredStaffList,
  getStoredLessonPlans,
  saveStoredLessonPlans,
  getStoredWorkSchedules,
  saveStoredWorkSchedules,
  getStoredLegalDocuments,
  saveStoredLegalDocuments,
  getStoredSchoolClasses,
  saveStoredSchoolClasses,
  getStoredFacilities
} from './schoolManagementData';
import SchoolAiAnalyticsAssistant from '@/components/school/SchoolAiAnalyticsAssistant';

export default function SchoolManagementPage() {
  const [lang, setLang] = useState<Language>('vi');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'plans' | 'staff' | 'schedule' | 'documents' | 'sync' | 'ai_analytics' | 'classes' | 'facilities'>('plans');

  // Dữ liệu quản trị nhà trường
  const [staffList, setStaffList] = useState<TeacherStaffItem[]>([]);
  const [lessonPlans, setLessonPlans] = useState<SchoolLessonPlanItem[]>([]);
  const [workSchedules, setWorkSchedules] = useState<SchoolWorkScheduleItem[]>([]);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocumentItem[]>([]);
  const [classList, setClassList] = useState<SchoolClassroomItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityRoomItem[]>([]);

  // Bộ lọc Tab A: Giáo án
  const [filterYear, setFilterYear] = useState<AcademicYear>('2025 - 2026');
  const [filterSemester, setFilterSemester] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterPlanStatus, setFilterPlanStatus] = useState<string>('ALL');
  const [searchPlanQuery, setSearchPlanQuery] = useState<string>('');

  // Bộ lọc Tab B: Nhân sự
  const [staffCategoryTab, setStaffCategoryTab] = useState<StaffCategory | 'ALL'>('ALL');
  const [searchStaffQuery, setSearchStaffQuery] = useState<string>('');

  // Bộ lọc Tab D: Văn bản pháp quy
  const [documentSourceTab, setDocumentSourceTab] = useState<DocumentSource | 'ALL'>('ALL');
  const [searchDocQuery, setSearchDocQuery] = useState<string>('');

  // Modals State
  const [selectedPlanForReview, setSelectedPlanForReview] = useState<SchoolLessonPlanItem | null>(null);
  const [showStorageModal, setShowStorageModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffCategory, setNewStaffCategory] = useState<StaffCategory>('TENURED_TEACHER');
  const [newStaffDept, setNewStaffDept] = useState<string>('Tổ Tiểu Học');
  const [newStaffRole, setNewStaffRole] = useState<string>('Giáo viên bộ môn');
  const [newStaffPhone, setNewStaffPhone] = useState<string>('');
  const [newStaffHours, setNewStaffHours] = useState<number>(18);

  const [notification, setNotification] = useState<string | null>(null);

  const isEn = lang === 'en';

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

      setLang(getStoredLanguage());

      // Load initial data
      setStaffList(getStoredStaffList());
      setLessonPlans(getStoredLessonPlans());
      setWorkSchedules(getStoredWorkSchedules());
      setLegalDocuments(getStoredLegalDocuments());
      setClassList(getStoredSchoolClasses());
      setFacilities(getStoredFacilities());
    } catch (e) {
      console.error('Error loading school management data:', e);
    }
  }, []);

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

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Phê duyệt hoặc Yêu cầu sửa giáo án
  const handleReviewLessonPlan = (status: LessonPlanStatus) => {
    if (!selectedPlanForReview) return;
    const updated = lessonPlans.map(p => {
      if (p.id === selectedPlanForReview.id) {
        return {
          ...p,
          status,
          reviewedBy: 'TS. Nguyễn Văn Thành (Hiệu trưởng)',
          reviewedAt: Date.now(),
          reviewNotes: reviewComment || (status === 'APPROVED' ? 'Kế hoạch bài dạy đạt chuẩn CV 5512/BGDĐT.' : 'Đề nghị điều chỉnh theo góp ý của BGH.')
        };
      }
      return p;
    });

    setLessonPlans(updated);
    saveStoredLessonPlans(updated);
    setShowReviewModal(false);
    setSelectedPlanForReview(null);
    setReviewComment('');
    showToast(status === 'APPROVED' ? 'Đã phê duyệt và ký số giáo án thành công!' : 'Đã gửi yêu cầu chỉnh sửa tới Giáo viên!');
  };

  // 2. Thêm nhân sự mới
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newStaff: TeacherStaffItem = {
      id: 'staff_' + Date.now(),
      staffCode: 'GV-' + Math.floor(100 + Math.random() * 900),
      fullName: newStaffName.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newStaffName)}`,
      category: newStaffCategory,
      department: newStaffDept,
      roleTitle: newStaffRole,
      degree: 'Cử nhân Sư phạm',
      teachingSubjects: ['Toán học'],
      seniorityYears: 3,
      weeklyTeachingHours: newStaffHours,
      assignedClasses: ['Khối 3'],
      phone: newStaffPhone || '0912345678',
      email: newStaffName.toLowerCase().replace(/\s+/g, '') + '@eduviet.edu.vn',
      status: 'ACTIVE'
    };

    const updated = [newStaff, ...staffList];
    setStaffList(updated);
    saveStoredStaffList(updated);
    setShowAddStaffModal(false);
    setNewStaffName('');
    showToast('Đã thêm nhân sự mới vào danh sách toàn trường thành công!');
  };

  // Lọc danh sách Giáo án đa chiều (Tab A)
  const filteredLessonPlans = useMemo(() => {
    return lessonPlans.filter(p => {
      const matchYear = p.academicYear === filterYear;
      const matchSemester = filterSemester === 'ALL' || p.semester === filterSemester;
      const matchDept = filterDepartment === 'ALL' || p.department === filterDepartment;
      const matchSubject = filterSubject === 'ALL' || p.subject === filterSubject;
      const matchStatus = filterPlanStatus === 'ALL' || p.status === filterPlanStatus;
      const matchSearch = !searchPlanQuery || 
        p.lessonTitle.toLowerCase().includes(searchPlanQuery.toLowerCase()) ||
        p.teacherName.toLowerCase().includes(searchPlanQuery.toLowerCase()) ||
        p.planCode.toLowerCase().includes(searchPlanQuery.toLowerCase());
      return matchYear && matchSemester && matchDept && matchSubject && matchStatus && matchSearch;
    });
  }, [lessonPlans, filterYear, filterSemester, filterDepartment, filterSubject, filterPlanStatus, searchPlanQuery]);

  // Lọc danh sách Nhân sự (Tab B)
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchCat = staffCategoryTab === 'ALL' || s.category === staffCategoryTab;
      const matchSearch = !searchStaffQuery ||
        s.fullName.toLowerCase().includes(searchStaffQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchStaffQuery.toLowerCase()) ||
        s.roleTitle.toLowerCase().includes(searchStaffQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [staffList, staffCategoryTab, searchStaffQuery]);

  // Lọc danh sách Văn bản pháp quy (Tab D)
  const filteredDocuments = useMemo(() => {
    return legalDocuments.filter(d => {
      const matchSrc = documentSourceTab === 'ALL' || d.source === documentSourceTab;
      const matchSearch = !searchDocQuery ||
        d.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
        d.documentNumber.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
        d.summary.toLowerCase().includes(searchDocQuery.toLowerCase());
      return matchSrc && matchSearch;
    });
  }, [legalDocuments, documentSourceTab, searchDocQuery]);

  // Danh sách các khoa/tổ để lọc
  const departmentsList = useMemo(() => {
    const set = new Set(staffList.map(s => s.department));
    return Array.from(set);
  }, [staffList]);

  // Danh sách môn học để lọc
  const subjectsList = useMemo(() => {
    const set = new Set(lessonPlans.map(p => p.subject));
    return Array.from(set);
  }, [lessonPlans]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 selection:bg-indigo-200 selection:text-indigo-900 pb-16">
      
      {/* 1. Header Điều Hành Nhà Trường */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-md border-b border-indigo-100 dark:border-slate-800 px-3.5 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo EduViet School */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-1.5 shadow-md shadow-indigo-500/20 flex items-center justify-center text-white shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Edu</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-500 tracking-tight">Viet</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 text-[10px] sm:text-xs font-black border border-indigo-200 dark:border-indigo-800">
                  {isEn ? "School Executive 🏛️" : "Quản Trị Nhà Trường 🏛️"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {isEn 
                  ? "Integrated Educational Management System • Standards GDPT 2018 & MOET" 
                  : "Hệ Thống Quản Trị Giáo Dục & Điều Hành Toàn Diện • Chuẩn GDPT 2018"}
              </p>
            </div>
          </div>

          {/* Right Navigation Hub: Cross-portal switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Link: Teacher App */}
            <Link
              href="/app"
              className="px-2.5 sm:px-3 py-2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1"
              title="Cổng dành cho Giáo viên"
            >
              <span>👩‍🏫</span>
              <span className="hidden md:inline">{isEn ? "Teacher" : "Giáo viên"}</span>
            </Link>

            {/* Quick Link: Student Portal */}
            <Link
              href="/student"
              className="px-2.5 sm:px-3 py-2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1"
              title="Cổng dành cho Học sinh"
            >
              <span>🎈</span>
              <span className="hidden md:inline">{isEn ? "Student" : "Học sinh"}</span>
            </Link>

            {/* Quick Link: Parent Portal */}
            <Link
              href="/parent"
              className="px-2.5 sm:px-3 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1"
              title="Cổng dành cho Phụ huynh"
            >
              <span>🏡</span>
              <span className="hidden md:inline">{isEn ? "Parent" : "Phụ huynh"}</span>
            </Link>

            {/* Storage Quota Diagnostics Badge */}
            <button
              onClick={() => setShowStorageModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title={isEn ? "IndexedDB Storage Engine & Disk Quota Monitor" : "Giám sát Dung lượng Bộ nhớ IndexedDB"}
            >
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isEn ? "Storage: GBs Safe" : "Bộ nhớ: GBs An Toàn"}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isEn ? "🇬🇧 EN" : "🇻🇳 VI"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-amber-400 transition-all cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 space-y-5">
        
        {/* Toast Notification */}
        {notification && (
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* 2. Executive KPI Summary Cards (Tổng quan chỉ số toàn trường) */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Card 1: Giáo viên & Nhân sự */}
          <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isEn ? "Faculty & Staff" : "Đội ngũ CB - GV - NV"}</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {staffList.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">đồng chí</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {staffList.filter(s => s.category === 'TENURED_TEACHER').length} biên chế • {staffList.filter(s => s.category === 'CONTRACT_TEACHER').length} hợp đồng
            </p>
          </div>

          {/* Card 2: Học sinh & Lớp học */}
          <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isEn ? "Classes & Students" : "Lớp học & Học sinh"}</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {classList.reduce((a, c) => a + c.studentCount, 0)}
              </span>
              <span className="text-xs text-slate-500 font-medium">em ({classList.length} lớp)</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Sĩ số bình quân: 34 em/lớp đạt chuẩn
            </p>
          </div>

          {/* Card 3: Giáo án chờ duyệt */}
          <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-rose-500" />
              <span>{isEn ? "Lesson Plans CV 5512" : "Giáo án CV 5512"}</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {lessonPlans.filter(p => p.status === 'PENDING').length}
              </span>
              <span className="text-xs text-slate-500 font-medium">chờ ký duyệt</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {lessonPlans.filter(p => p.status === 'APPROVED').length} đã duyệt ({lessonPlans.length > 0 ? Math.round((lessonPlans.filter(p => p.status === 'APPROVED').length / lessonPlans.length) * 100) : 100}%)
            </p>
          </div>

          {/* Card 4: Tỷ lệ Chuyên cần */}
          <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>{isEn ? "School Attendance" : "Chuyên cần toàn trường"}</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
                98.4%
              </span>
              <span className="text-xs text-slate-500 font-medium">hôm nay</span>
            </div>
            <p className="text-[10px] text-slate-400">
              01 nghỉ ốm có phép • 0 vắng không phép
            </p>
          </div>

          {/* Card 5: Văn bản pháp quy */}
          <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? "Legal Documents" : "Văn bản & Pháp quy"}</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {legalDocuments.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">văn bản lưu trữ</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Bộ GD&ĐT • Sở GD&ĐT • Trường • Chi bộ
            </p>
          </div>

        </section>

        {/* 3. Primary Navigation Tabs: 8 Phân hệ Quản trị Chuyên sâu */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
          {[
            { id: 'plans' as const, label: isEn ? "Lesson Plans (CV 5512) 📚" : "Quản Lý Giáo Án (CV 5512) 📚", count: lessonPlans.filter(p => p.status === 'PENDING').length },
            { id: 'staff' as const, label: isEn ? "Staff & Faculty 👥" : "Nhân Sự & Giáo Viên 👥", count: staffList.length },
            { id: 'schedule' as const, label: isEn ? "Master Schedules & Events 📅" : "TKB & Lịch Công Tác 📅" },
            { id: 'documents' as const, label: isEn ? "Legal Documents 📜" : "Văn Bản & Pháp Quy 📜", count: legalDocuments.length },
            { id: 'sync' as const, label: isEn ? "Unified Sync Hub 🔄" : "Đồng Bộ 4 Cổng 🔄" },
            { id: 'ai_analytics' as const, label: isEn ? "AI Risk Analytics 🤖✨" : "AI Phân Tích & Cảnh Báo 🤖✨" },
            { id: 'classes' as const, label: isEn ? "Classes & Homeroom 🏫" : "Lớp Học & Phân Công GVCN 🏫" },
            { id: 'facilities' as const, label: isEn ? "Smart Facilities 🔬" : "Phòng Học Chức Năng 🔬" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === tab.id ? 'bg-black/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ================= TAB A: QUẢN LÝ GIÁO ÁN (LESSON PLANS) ================= */}
        {activeTab === 'plans' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Filters Bar: Năm học, Học kỳ, Tổ chuyên môn, Môn học, Trạng thái */}
            <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>{isEn ? "Lesson Plan Inspection & Digital Approval" : "Hệ Thống Kiểm Duyệt & Ký Số Kế Hoạch Bài Dạy (CV 5512/BGDĐT)"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sắp xếp & lọc linh hoạt theo năm học, học kỳ, tổ bộ môn, giáo viên và trạng thái phê duyệt.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">
                    Tìm thấy: {filteredLessonPlans.length} kế hoạch bài dạy
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                {/* 1. Năm học */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Năm học</label>
                  <select
                    value={filterYear}
                    onChange={(e: any) => setFilterYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="2025 - 2026">2025 - 2026</option>
                    <option value="2024 - 2025">2024 - 2025</option>
                  </select>
                </div>

                {/* 2. Học kỳ */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Học kỳ</label>
                  <select
                    value={filterSemester}
                    onChange={e => setFilterSemester(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="ALL">Tất cả học kỳ</option>
                    <option value="SEMESTER_1">Học kỳ I</option>
                    <option value="SEMESTER_2">Học kỳ II</option>
                  </select>
                </div>

                {/* 3. Tổ chuyên môn */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tổ chuyên môn</label>
                  <select
                    value={filterDepartment}
                    onChange={e => setFilterDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="ALL">Tất cả các tổ</option>
                    {departmentsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Môn học */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Môn học</label>
                  <select
                    value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="ALL">Tất cả môn học</option>
                    {subjectsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Trạng thái duyệt */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Trạng thái</label>
                  <select
                    value={filterPlanStatus}
                    onChange={e => setFilterPlanStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã phê duyệt</option>
                    <option value="NEEDS_REVISION">Yêu cầu bổ sung</option>
                  </select>
                </div>

                {/* 6. Tìm kiếm từ khóa */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tên bài dạy, giáo viên..."
                      value={searchPlanQuery}
                      onChange={e => setSearchPlanQuery(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách giáo án hiển thị */}
            <div className="space-y-3">
              {filteredLessonPlans.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 text-center text-slate-400 italic">
                  Không tìm thấy kế hoạch bài dạy phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredLessonPlans.map(plan => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-3xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {plan.planCode}
                        </span>
                        <span className="px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {plan.subject} ({plan.gradeLevel})
                        </span>
                        <span className="px-2 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                          {plan.department}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          plan.status === 'APPROVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                            : plan.status === 'NEEDS_REVISION'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                        }`}>
                          {plan.status === 'APPROVED' ? 'Đã ký duyệt điện tử ✅' :
                           plan.status === 'NEEDS_REVISION' ? 'Yêu cầu sửa đổi ⚠️' : 'Chờ Ban Giám Hiệu duyệt 🟡'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {plan.lessonTitle}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>GV soạn: <strong>{plan.teacherName}</strong></span>
                        <span>•</span>
                        <span>Thời lượng: <strong>{plan.durationPeriods} tiết</strong></span>
                        <span>•</span>
                        <span>Lớp: <strong>{plan.targetClass}</strong></span>
                        <span>•</span>
                        <span>Chuẩn: <strong>{plan.curriculumStandard === 'CV_5512' ? 'CV 5512/BGDĐT' : 'CV 2634'}</strong></span>
                      </div>

                      {plan.reviewNotes && (
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 italic bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          💬 <strong>Ý kiến người duyệt:</strong> {plan.reviewNotes} {plan.reviewedBy && <span>({plan.reviewedBy})</span>}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => {
                          setSelectedPlanForReview(plan);
                          setShowReviewModal(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ký Duyệt & Nhận Xét</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ================= TAB B: DANH SÁCH CÁN BỘ & GIÁO VIÊN 4 NHÓM ================= */}
        {activeTab === 'staff' && (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>{isEn ? "Staff & Faculty Roster" : "Danh Sách Nhân Sự & Cán Bộ Giáo Viên Toàn Trường"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Phân loại chuẩn 4 nhóm: Giáo viên cơ hữu (Biên chế), Giáo viên hợp đồng, Nhân viên, Người lao động theo Khoa/Tổ.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? "Add Staff Member" : "Tiếp Nhận Nhân Sự Mới"}</span>
                </button>
              </div>

              {/* 4 Nhóm nhân sự Tab Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'ALL', label: `Tất cả (${staffList.length})` },
                  { id: 'TENURED_TEACHER', label: `1. Giáo viên Cơ hữu (${staffList.filter(s => s.category === 'TENURED_TEACHER').length})` },
                  { id: 'CONTRACT_TEACHER', label: `2. Giáo viên Hợp đồng (${staffList.filter(s => s.category === 'CONTRACT_TEACHER').length})` },
                  { id: 'STAFF', label: `3. Nhân viên Nhà trường (${staffList.filter(s => s.category === 'STAFF').length})` },
                  { id: 'WORKER', label: `4. Người lao động (${staffList.filter(s => s.category === 'WORKER').length})` }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setStaffCategoryTab(cat.id as any)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                      staffCategoryTab === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid danh sách cán bộ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredStaff.map(member => (
                <div
                  key={member.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={member.avatar} alt={member.fullName} className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 object-cover shadow-xs" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{member.fullName}</h4>
                          {member.isPartyMember && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold" title="Đảng viên Đảng Cộng sản Việt Nam">
                              ★ Đảng viên
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{member.roleTitle}</p>
                        <span className="text-[10px] text-slate-400 font-mono">Mã số: {member.staffCode}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      member.category === 'TENURED_TEACHER' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      member.category === 'CONTRACT_TEACHER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      member.category === 'STAFF' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {member.category === 'TENURED_TEACHER' ? 'Cơ hữu' :
                       member.category === 'CONTRACT_TEACHER' ? 'Hợp đồng' :
                       member.category === 'STAFF' ? 'Nhân viên' : 'Lao động'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl">
                    <p>🏛️ <strong>Tổ/Khoa:</strong> {member.department}</p>
                    <p>🎓 <strong>Trình độ:</strong> {member.degree} (Thâm niên: {member.seniorityYears} năm)</p>
                    {member.weeklyTeachingHours > 0 && (
                      <p>⏱️ <strong>Định mức:</strong> {member.weeklyTeachingHours} tiết/tuần (Phụ trách: {member.assignedClasses.join(', ') || 'Chưa xếp'})</p>
                    )}
                    <p>📞 <strong>SĐT:</strong> {member.phone} • ✉️ {member.email}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB C: THỜI KHÓA BIỂU & LỊCH CÔNG TÁC ================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{isEn ? "Master Work Schedule & Official Teaching Timetable" : "Lịch Công Tác Ban Giám Hiệu, Chi Bộ, Công Đoàn & Thời Khóa Biểu"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Theo dõi lịch công tác tuần, hội nghị sư phạm, điều hành phân công dạy thay / dạy bù không bị gián đoạn.
                  </p>
                </div>
              </div>

              {/* Lưới các sự kiện công tác tuần */}
              <div className="space-y-3">
                {workSchedules.map(ev => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          📅 {ev.date} ({ev.startTime} - {ev.endTime})
                        </span>
                        <span className="px-2 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                          {ev.department}
                        </span>
                        {ev.isImportant && (
                          <span className="px-2 py-0.2 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px]">
                            Trọng tâm
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {ev.contentSummary}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                        <span>📍 Địa điểm: <strong>{ev.location}</strong></span>
                        <span>•</span>
                        <span>Chủ trì: <strong>{ev.chairPerson}</strong></span>
                        <span>•</span>
                        <span>Thành phần: <strong>{ev.participants}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB D: VĂN BẢN & PHÁP QUY 4 NGUỒN ================= */}
        {activeTab === 'documents' && (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>{isEn ? "Legal & Administrative Documents Archive" : "Hệ Thống Văn Bản, Nghị Quyết & Hồ Sơ Pháp Quy"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Phân loại 4 nguồn: Văn bản Trường ban hành, Văn bản Sở GD&ĐT, Văn bản Bộ GD&ĐT, Văn bản Chi bộ & Đảng ủy.
                  </p>
                </div>
              </div>

              {/* 4 Nguồn Văn bản Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'ALL', label: `Tất cả (${legalDocuments.length})` },
                  { id: 'SCHOOL', label: `1. Trường ban hành (${legalDocuments.filter(d => d.source === 'SCHOOL').length})` },
                  { id: 'DOET', label: `2. Sở GD&ĐT (${legalDocuments.filter(d => d.source === 'DOET').length})` },
                  { id: 'MOET', label: `3. Bộ GD&ĐT (${legalDocuments.filter(d => d.source === 'MOET').length})` },
                  { id: 'PARTY', label: `4. Chi bộ & Đảng (${legalDocuments.filter(d => d.source === 'PARTY').length})` }
                ].map(src => (
                  <button
                    key={src.id}
                    onClick={() => setDocumentSourceTab(src.id as any)}
                    className={`px-3 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                      documentSourceTab === src.id
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách văn bản */}
            <div className="space-y-3">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-400 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                        Số: {doc.documentNumber}
                      </span>
                      <span className="px-2 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        {doc.source === 'SCHOOL' ? 'Nhà trường' :
                         doc.source === 'DOET' ? 'Sở GD&ĐT' :
                         doc.source === 'MOET' ? 'Bộ GD&ĐT' : 'Chi bộ Đảng'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Ban hành: {doc.issueDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {doc.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {doc.summary}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Người ký: <strong>{doc.signerName}</strong> ({doc.signerTitle})</span>
                      {doc.fileAttachmentName && (
                        <span>• Tệp: <strong className="text-indigo-600 dark:text-indigo-400">{doc.fileAttachmentName}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto flex justify-end">
                    <button
                      onClick={() => showToast(`Đang mở tệp đính kèm ${doc.fileAttachmentName || doc.documentNumber}...`)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>Xem & Tải Về</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB E: TRUNG TÂM ĐỒNG BỘ 4 CỔNG ================= */}
        {activeTab === 'sync' && (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-indigo-700/60 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-white/20">
                      <RefreshCw className="w-5 h-5 text-amber-400" />
                    </span>
                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                      Trung Tâm Đồng Bộ Nhất Quán 4 Cổng Thông Tin
                    </h3>
                  </div>
                  <p className="text-xs text-indigo-200">
                    Cơ chế Single Source of Truth: Dữ liệu nhập 1 lần tại trường, tự động đồng bộ xuyên suốt đến Giáo viên, Học sinh và Phụ huynh.
                  </p>
                </div>

                <button
                  onClick={() => showToast('Đã đồng bộ hóa 100% dữ liệu 4 cổng thời gian thực!')}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95 shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Đồng Bộ Tức Thì (Push & Pull)</span>
                </button>
              </div>

              {/* Mô hình 4 Cổng liên kết */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <span className="text-xl">🏛️</span>
                  <h4 className="text-xs font-black uppercase text-amber-300">1. Nhà Trường (/school)</h4>
                  <p className="text-[11px] text-indigo-200">
                    Xếp lớp, phân công GVCN, duyệt giáo án, phát động đợt thu và ban hành thông báo chỉ đạo.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <span className="text-xl">👩‍🏫</span>
                  <h4 className="text-xs font-black uppercase text-rose-300">2. Giáo Viên (/app)</h4>
                  <p className="text-[11px] text-indigo-200">
                    Nhận thời khóa biểu, sổ điểm danh lớp, duyệt đơn xin nghỉ học và nộp giáo án CV 5512.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <span className="text-xl">🎈</span>
                  <h4 className="text-xs font-black uppercase text-amber-300">3. Học Sinh (/student)</h4>
                  <p className="text-[11px] text-indigo-200">
                    Nhận lớp chính thức, theo dõi bài tập, sao khen thưởng và tương tác với Gia sư AI.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
                  <span className="text-xl">🏡</span>
                  <h4 className="text-xs font-black uppercase text-emerald-300">4. Phụ Huynh (/parent)</h4>
                  <p className="text-[11px] text-indigo-200">
                    Theo dõi điểm danh trực tiếp, nộp đơn xin nghỉ, đóng các khoản phí qua VietQR và gửi kiến nghị.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB F: AI PHÂN TÍCH & CẢNH BÁO RỦI RO ================= */}
        {activeTab === 'ai_analytics' && (
          <div className="space-y-4 animate-fade-in">
            <SchoolAiAnalyticsAssistant
              lang={lang}
              staffList={staffList}
              lessonPlans={lessonPlans}
              classList={classList}
            />
          </div>
        )}

        {/* ================= TAB G: QUẢN LÝ LỚP HỌC & PHÂN CÔNG GVCN ================= */}
        {activeTab === 'classes' && (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-600" />
                    <span>Quản Lý Lớp Học & Phân Công Giáo Viên Chủ Nhiệm (GVCN)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Trường xếp lớp chính thức chống sai lệch khối lớp, tự động liên kết danh sách học sinh và giáo viên.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classList.map(c => (
                  <div
                    key={c.id}
                    className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{c.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        {c.studentCount} học sinh
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                      <p>👩‍🏫 <strong>GVCN:</strong> <span className="text-indigo-600 dark:text-indigo-400 font-bold">{c.homeroomTeacherName || 'Chưa phân công'}</span></p>
                      <p>📍 <strong>Phòng học:</strong> {c.roomLocation}</p>
                      <p>📊 <strong>Chuyên cần hôm nay:</strong> <strong className="text-emerald-600">{c.attendanceRateToday || 98}%</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB H: CƠ SỞ VẬT CHẤT & PHÒNG CHỨC NĂNG ================= */}
        {activeTab === 'facilities' && (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-white dark:bg-[#101726] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Cơ Sở Vật Chất, Phòng Học Chức Năng & Thiết Bị Dạy Học Số</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Quản lý phòng Smart Lab, phòng Ngoại ngữ, Thư viện số và Nhà đa năng không bị trùng lịch dạy.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {facilities.map(f => (
                  <div
                    key={f.id}
                    className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{f.name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        f.status === 'READY' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300' :
                        f.status === 'IN_USE' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300' :
                        'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {f.status === 'READY' ? '✅ Đang trống (Sẵn sàng)' :
                         f.status === 'IN_USE' ? '🔵 Đang có tiết học' : '⚠️ Bảo trì'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {f.equipmentSummary}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <span>Sức chứa: <strong>{f.capacity} chỗ</strong></span>
                      {f.currentClassUsing && (
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {f.currentClassUsing} ({f.currentTeacherUsing})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: Phê duyệt Kế hoạch bài dạy CV 5512 */}
      {showReviewModal && selectedPlanForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#111728] border-2 border-indigo-300 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Phê Duyệt & Ký Số Kế Hoạch Bài Dạy</h3>
                <p className="text-xs text-white/80">{selectedPlanForReview.lessonTitle}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-1">
                <p>👤 <strong>Giáo viên soạn:</strong> {selectedPlanForReview.teacherName} ({selectedPlanForReview.department})</p>
                <p>📘 <strong>Môn học:</strong> {selectedPlanForReview.subject} - {selectedPlanForReview.gradeLevel} (Thời lượng: {selectedPlanForReview.durationPeriods} tiết)</p>
                <p>📋 <strong>Tiêu chuẩn:</strong> CV 5512/BGDĐT (Đủ 4 hoạt động: Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng)</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nhận xét & Chỉ đạo của Ban Giám Hiệu / Tổ Trưởng Chuyên Môn:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Ghi nhận xét đánh giá, góp ý phương pháp dạy học số hoặc xác nhận đạt chuẩn..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleReviewLessonPlan('NEEDS_REVISION')}
                  className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold cursor-pointer"
                >
                  Yêu Cầu Sửa Đổi
                </button>
                <button
                  onClick={() => handleReviewLessonPlan('APPROVED')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ký Duyệt Đạt Chuẩn CV 5512</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Tiếp nhận Nhân sự mới */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111728] border-2 border-indigo-300 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
            
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-black">Tiếp Nhận Cán Bộ / Giáo Viên Mới</h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Họ và tên cán bộ/giáo viên *</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  placeholder="VD: Thầy Hoàng Văn Nam"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Nhóm nhân sự *</label>
                <select
                  value={newStaffCategory}
                  onChange={(e: any) => setNewStaffCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="TENURED_TEACHER">1. Giáo viên Cơ hữu (Biên chế)</option>
                  <option value="CONTRACT_TEACHER">2. Giáo viên Hợp đồng</option>
                  <option value="STAFF">3. Nhân viên Nhà trường (Kế toán, Y tế, Thư viện)</option>
                  <option value="WORKER">4. Người lao động (Bảo vệ, Tạp vụ)</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Khoa / Tổ chuyên môn *</label>
                <input
                  type="text"
                  required
                  value={newStaffDept}
                  onChange={e => setNewStaffDept(e.target.value)}
                  placeholder="VD: Tổ Tự Nhiên & Khoa Học"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Chức danh / Nhiệm vụ *</label>
                <input
                  type="text"
                  required
                  value={newStaffRole}
                  onChange={e => setNewStaffRole(e.target.value)}
                  placeholder="VD: Giáo viên bộ môn Toán"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newStaffPhone}
                    onChange={e => setNewStaffPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Tiết dạy / tuần</label>
                  <input
                    type="number"
                    value={newStaffHours}
                    onChange={e => setNewStaffHours(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Thêm Nhân Sự
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <StorageDiagnosticsModal
        isOpen={showStorageModal}
        onClose={() => setShowStorageModal(false)}
        isEn={isEn}
      />
    </div>
  );
}
