"use client";

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ChevronRight, 
  Users, 
  Bell, 
  Megaphone, 
  FileText, 
  BookOpen,
  CalendarDays,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { Language } from '@/app/app/i18n';

export interface FeaturedClassItem {
  id: string;
  title: string;
  teacher: string;
  students: string;
  coverBg: string;
  badge: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  time: string;
  type: 'exam' | 'lesson' | 'schedule' | 'grade';
  isUnread?: boolean;
}

interface EduVietFeaturedCardsProps {
  onViewAllClasses?: () => void;
  onViewAllAnnouncements?: () => void;
  onSelectClass?: (className: string) => void;
  lang?: Language;
}

const DEFAULT_CLASSES_VI: FeaturedClassItem[] = [
  {
    id: 'c1',
    title: 'Toán 10',
    teacher: 'Cô Trần Thị Mai',
    students: '1.2K học viên',
    coverBg: 'from-emerald-800 to-teal-950',
    badge: 'Chương trình mới'
  },
  {
    id: 'c2',
    title: 'Ngữ văn 10',
    teacher: 'Thầy Lê Minh Đức',
    students: '980 học viên',
    coverBg: 'from-amber-700 to-orange-900',
    badge: 'Văn học Việt Nam'
  },
  {
    id: 'c3',
    title: 'Tiếng Anh 10',
    teacher: 'Cô Nguyễn Thu Trang',
    students: '1.5K học viên',
    coverBg: 'from-blue-700 to-indigo-950',
    badge: 'Global Success'
  }
];

const DEFAULT_CLASSES_EN: FeaturedClassItem[] = [
  {
    id: 'c1',
    title: 'Mathematics 10',
    teacher: 'Ms. Tran Thi Mai',
    students: '1.2K students',
    coverBg: 'from-emerald-800 to-teal-950',
    badge: 'New Curriculum'
  },
  {
    id: 'c2',
    title: 'Literature 10',
    teacher: 'Mr. Le Minh Duc',
    students: '980 students',
    coverBg: 'from-amber-700 to-orange-900',
    badge: 'Vietnamese Literature'
  },
  {
    id: 'c3',
    title: 'English 10',
    teacher: 'Ms. Nguyen Thu Trang',
    students: '1.5K students',
    coverBg: 'from-blue-700 to-indigo-950',
    badge: 'Global Success'
  }
];

const DEFAULT_ANNOUNCEMENTS_VI: AnnouncementItem[] = [
  {
    id: 'a1',
    type: 'exam',
    title: 'Thông báo về kỳ thi giữa kỳ',
    time: '2 giờ trước',
    isUnread: true
  },
  {
    id: 'a2',
    type: 'lesson',
    title: 'Đã có bài giảng mới: Hàm số bậc hai',
    time: '5 giờ trước',
    isUnread: true
  },
  {
    id: 'a3',
    type: 'schedule',
    title: 'Lớp 10A1: Lịch học tuần mới',
    time: '1 ngày trước',
    isUnread: false
  },
  {
    id: 'a4',
    type: 'grade',
    title: 'Kết quả bài kiểm tra đánh giá định kỳ',
    time: '1 ngày trước',
    isUnread: false
  }
];

const DEFAULT_ANNOUNCEMENTS_EN: AnnouncementItem[] = [
  {
    id: 'a1',
    type: 'exam',
    title: 'Notice regarding Midterm Examination',
    time: '2 hours ago',
    isUnread: true
  },
  {
    id: 'a2',
    type: 'lesson',
    title: 'New lecture available: Quadratic Functions',
    time: '5 hours ago',
    isUnread: true
  },
  {
    id: 'a3',
    type: 'schedule',
    title: 'Class 10A1: Schedule for the new week',
    time: '1 day ago',
    isUnread: false
  },
  {
    id: 'a4',
    type: 'grade',
    title: 'Periodic Assessment Test Results',
    time: '1 day ago',
    isUnread: false
  }
];

const STORAGE_KEY_CLASSES = 'eduviet_featured_classes_custom';
const STORAGE_KEY_ANNOUNCEMENTS = 'eduviet_featured_announcements_custom';

export default function EduVietFeaturedCards({
  onViewAllClasses,
  onViewAllAnnouncements,
  onSelectClass,
  lang = 'vi'
}: EduVietFeaturedCardsProps) {
  const isEn = lang === 'en';

  // Classes State
  const [classes, setClasses] = useState<FeaturedClassItem[]>([]);
  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Editing Class Modal State
  const [editingClass, setEditingClass] = useState<FeaturedClassItem | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);

  // Editing Announcement Modal State
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);

  // Load custom or default on mount or language change
  useEffect(() => {
    try {
      const storedClasses = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (storedClasses) {
        setClasses(JSON.parse(storedClasses));
      } else {
        setClasses(isEn ? DEFAULT_CLASSES_EN : DEFAULT_CLASSES_VI);
      }

      const storedAnnouncements = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      if (storedAnnouncements) {
        setAnnouncements(JSON.parse(storedAnnouncements));
      } else {
        setAnnouncements(isEn ? DEFAULT_ANNOUNCEMENTS_EN : DEFAULT_ANNOUNCEMENTS_VI);
      }
    } catch (e) {
      console.error("Error loading featured cards data:", e);
      setClasses(isEn ? DEFAULT_CLASSES_EN : DEFAULT_CLASSES_VI);
      setAnnouncements(isEn ? DEFAULT_ANNOUNCEMENTS_EN : DEFAULT_ANNOUNCEMENTS_VI);
    }
  }, [isEn]);

  // Save Classes to Storage
  const updateClasses = (newList: FeaturedClassItem[]) => {
    setClasses(newList);
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(newList));
    } catch (e) {
      console.error("Error saving classes:", e);
    }
  };

  // Save Announcements to Storage
  const updateAnnouncements = (newList: AnnouncementItem[]) => {
    setAnnouncements(newList);
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(newList));
    } catch (e) {
      console.error("Error saving announcements:", e);
    }
  };

  // Delete Class
  const handleDeleteClass = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isEn ? "Are you sure you want to delete this class card?" : "Bạn có chắc chắn muốn xóa lớp học này không?")) {
      const filtered = classes.filter(c => c.id !== id);
      updateClasses(filtered);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isEn ? "Are you sure you want to delete this notice?" : "Bạn có chắc chắn muốn xóa thông báo này không?")) {
      const filtered = announcements.filter(a => a.id !== id);
      updateAnnouncements(filtered);
    }
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (confirm(isEn ? "Reset all featured classes and notices to defaults?" : "Khôi phục lại danh sách lớp học và thông báo mặc định?")) {
      localStorage.removeItem(STORAGE_KEY_CLASSES);
      localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENTS);
      setClasses(isEn ? DEFAULT_CLASSES_EN : DEFAULT_CLASSES_VI);
      setAnnouncements(isEn ? DEFAULT_ANNOUNCEMENTS_EN : DEFAULT_ANNOUNCEMENTS_VI);
    }
  };

  const getAnnouncementIcon = (type: AnnouncementItem['type']) => {
    switch (type) {
      case 'exam':
        return {
          icon: <Megaphone className="w-4 h-4 text-rose-500" />,
          iconBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900/50'
        };
      case 'lesson':
        return {
          icon: <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900/50'
        };
      case 'schedule':
        return {
          icon: <Users className="w-4 h-4 text-amber-500" />,
          iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-100 dark:border-amber-900/50'
        };
      case 'grade':
      default:
        return {
          icon: <BookOpen className="w-4 h-4 text-blue-500" />,
          iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/50'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
      {/* ================= 1. LEFT CARD: LỚP HỌC NỔI BẬT ================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {isEn ? "Featured Classes" : "Lớp học nổi bật"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Add new class button */}
            <button
              onClick={() => {
                setIsAddingClass(true);
                setEditingClass({
                  id: 'c_' + Date.now(),
                  title: isEn ? 'Physics 10' : 'Vật lý 10',
                  teacher: isEn ? 'Mr. Hoang Nam' : 'Thầy Hoàng Nam',
                  students: isEn ? '850 students' : '850 học viên',
                  coverBg: 'from-purple-700 to-indigo-950',
                  badge: isEn ? 'STEM 2026' : 'GDPT Mới'
                });
              }}
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isEn ? "Add new featured class" : "Thêm lớp học nổi bật mới"}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onViewAllClasses}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>{isEn ? "View more" : "Xem thêm"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Classes Horizontal Cards */}
        {classes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <p>{isEn ? "No featured classes." : "Chưa có lớp học nào."}</p>
            <button 
              onClick={handleResetDefaults}
              className="mt-2 text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEn ? "Reset defaults" : "Khôi phục mặc định"}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => onSelectClass && onSelectClass(cls.title)}
                className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col"
              >
                {/* Edit & Delete Action Buttons */}
                <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddingClass(false);
                      setEditingClass(cls);
                    }}
                    className="p-1 rounded-md bg-black/60 hover:bg-emerald-600 text-white transition-colors cursor-pointer shadow-sm"
                    title={isEn ? "Edit class" : "Chỉnh sửa lớp"}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClass(cls.id, e)}
                    className="p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-sm"
                    title={isEn ? "Delete class" : "Xóa lớp"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Cover thumbnail */}
                <div className={`h-16 sm:h-20 bg-gradient-to-tr ${cls.coverBg} p-2 flex flex-col justify-between text-white relative overflow-hidden`}>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs self-start max-w-[80%] truncate">
                    {cls.badge}
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold truncate drop-shadow-sm">
                    {cls.title}
                  </p>
                </div>

                {/* Info */}
                <div className="p-2 bg-white dark:bg-[#1E293B] flex-1 flex flex-col justify-between">
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {cls.teacher}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <Users className="w-2.5 h-2.5" />
                    <span>{cls.students}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= 2. RIGHT CARD: THÔNG BÁO MỚI ================= */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {isEn ? "Recent Notices" : "Thông báo mới"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Add announcement button */}
            <button
              onClick={() => {
                setIsAddingAnnouncement(true);
                setEditingAnnouncement({
                  id: 'a_' + Date.now(),
                  type: 'general' as any,
                  title: isEn ? 'New Announcement' : 'Thông báo hoạt động mới',
                  time: isEn ? 'Just now' : 'Vừa xong',
                  isUnread: true
                });
              }}
              className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isEn ? "Add new notice" : "Thêm thông báo mới"}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onViewAllAnnouncements}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>{isEn ? "View all" : "Xem tất cả"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <p>{isEn ? "No recent notices." : "Chưa có thông báo nào."}</p>
            <button 
              onClick={handleResetDefaults}
              className="mt-2 text-emerald-600 dark:text-emerald-400 font-semibold underline cursor-pointer inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEn ? "Reset defaults" : "Khôi phục mặc định"}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((ann) => {
              const { icon, iconBg } = getAnnouncementIcon(ann.type);
              return (
                <div
                  key={ann.id}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBg}`}>
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {ann.title}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {ann.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {ann.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 mr-1 animate-pulse"></span>
                    )}
                    {/* Action buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddingAnnouncement(false);
                        setEditingAnnouncement(ann);
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                      title={isEn ? "Edit notice" : "Chỉnh sửa thông báo"}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteAnnouncement(ann.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                      title={isEn ? "Delete notice" : "Xóa thông báo"}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= CLASS EDIT / ADD MODAL ================= */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>{isAddingClass ? (isEn ? "Add Featured Class" : "Thêm Lớp Học Mới") : (isEn ? "Edit Class Card" : "Chỉnh Sửa Thẻ Lớp Học")}</span>
              </h3>
              <button
                onClick={() => setEditingClass(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isEn ? "Class Name / Subject" : "Tên lớp / Môn học"}
                </label>
                <input
                  type="text"
                  value={editingClass.title}
                  onChange={e => setEditingClass({ ...editingClass, title: e.target.value })}
                  placeholder={isEn ? "e.g., Mathematics 10" : "Ví dụ: Toán 10"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isEn ? "Teacher In Charge" : "Giáo viên phụ trách"}
                </label>
                <input
                  type="text"
                  value={editingClass.teacher}
                  onChange={e => setEditingClass({ ...editingClass, teacher: e.target.value })}
                  placeholder={isEn ? "e.g., Ms. Tran Thi Mai" : "Ví dụ: Cô Trần Thị Mai"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {isEn ? "Students Count" : "Số lượng học viên"}
                  </label>
                  <input
                    type="text"
                    value={editingClass.students}
                    onChange={e => setEditingClass({ ...editingClass, students: e.target.value })}
                    placeholder={isEn ? "e.g., 1.2K students" : "Ví dụ: 1.2K học viên"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    {isEn ? "Badge Label" : "Nhãn huy hiệu"}
                  </label>
                  <input
                    type="text"
                    value={editingClass.badge}
                    onChange={e => setEditingClass({ ...editingClass, badge: e.target.value })}
                    placeholder={isEn ? "e.g., New Program" : "Ví dụ: Chương trình mới"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {!isAddingClass && (
                <button
                  type="button"
                  onClick={(e) => {
                    handleDeleteClass(editingClass.id, e);
                    setEditingClass(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "Delete" : "Xóa thẻ"}</span>
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  {isEn ? "Cancel" : "Hủy"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isAddingClass) {
                      updateClasses([...classes, editingClass]);
                    } else {
                      updateClasses(classes.map(c => c.id === editingClass.id ? editingClass : c));
                    }
                    setEditingClass(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEn ? "Save" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ANNOUNCEMENT EDIT / ADD MODAL ================= */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>{isAddingAnnouncement ? (isEn ? "Add Notice" : "Thêm Thông Báo Mới") : (isEn ? "Edit Notice" : "Chỉnh Sửa Thông Báo")}</span>
              </h3>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isEn ? "Notice Content" : "Nội dung thông báo"}
                </label>
                <input
                  type="text"
                  value={editingAnnouncement.title}
                  onChange={e => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  placeholder={isEn ? "Notice title..." : "Nội dung thông báo..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isEn ? "Time Display" : "Thời gian hiển thị"}
                </label>
                <input
                  type="text"
                  value={editingAnnouncement.time}
                  onChange={e => setEditingAnnouncement({ ...editingAnnouncement, time: e.target.value })}
                  placeholder={isEn ? "e.g., 2 hours ago" : "Ví dụ: 2 giờ trước, 1 ngày trước"}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingAnnouncement.isUnread}
                    onChange={e => setEditingAnnouncement({ ...editingAnnouncement, isUnread: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>{isEn ? "Mark as unread (red badge)" : "Đánh dấu chưa đọc (chấm đỏ)"}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {!isAddingAnnouncement && (
                <button
                  type="button"
                  onClick={(e) => {
                    handleDeleteAnnouncement(editingAnnouncement.id, e);
                    setEditingAnnouncement(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isEn ? "Delete" : "Xóa"}</span>
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  {isEn ? "Cancel" : "Hủy"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isAddingAnnouncement) {
                      updateAnnouncements([editingAnnouncement, ...announcements]);
                    } else {
                      updateAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? editingAnnouncement : a));
                    }
                    setEditingAnnouncement(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEn ? "Save" : "Lưu thay đổi"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
