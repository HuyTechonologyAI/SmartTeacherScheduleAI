"use client";

import React from 'react';
import { 
  GraduationCap, 
  ChevronRight, 
  Users, 
  Bell, 
  Megaphone, 
  FileText, 
  BookOpen,
  CalendarDays
} from 'lucide-react';

interface EduVietFeaturedCardsProps {
  onViewAllClasses?: () => void;
  onViewAllAnnouncements?: () => void;
  onSelectClass?: (className: string) => void;
}

export default function EduVietFeaturedCards({
  onViewAllClasses,
  onViewAllAnnouncements,
  onSelectClass
}: EduVietFeaturedCardsProps) {
  const featuredClasses = [
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

  const announcements = [
    {
      id: 'a1',
      icon: <Megaphone className="w-4 h-4 text-rose-500" />,
      iconBg: 'bg-rose-50 border-rose-100',
      title: 'Thông báo về kỳ thi giữa kỳ',
      time: '2 giờ trước',
      isUnread: true
    },
    {
      id: 'a2',
      icon: <FileText className="w-4 h-4 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border-emerald-100',
      title: 'Đã có bài giảng mới: Hàm số bậc hai',
      time: '5 giờ trước',
      isUnread: true
    },
    {
      id: 'a3',
      icon: <Users className="w-4 h-4 text-amber-500" />,
      iconBg: 'bg-amber-50 border-amber-100',
      title: 'Lớp 10A1: Lịch học tuần mới',
      time: '1 ngày trước',
      isUnread: false
    },
    {
      id: 'a4',
      icon: <BookOpen className="w-4 h-4 text-blue-500" />,
      iconBg: 'bg-blue-50 border-blue-100',
      title: 'Kết quả bài kiểm tra đánh giá định kỳ',
      time: '1 ngày trước',
      isUnread: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
      {/* 1. Left Card: Lớp học nổi bật */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Lớp học nổi bật
            </h3>
          </div>
          <button
            onClick={onViewAllClasses}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>Xem thêm</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Classes Horizontal Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
          {featuredClasses.map((cls) => (
            <div
              key={cls.id}
              onClick={() => onSelectClass && onSelectClass(cls.title)}
              className="group rounded-2xl overflow-hidden border border-slate-100 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col"
            >
              {/* Cover thumbnail */}
              <div className={`h-16 sm:h-20 bg-gradient-to-tr ${cls.coverBg} p-2 flex flex-col justify-between text-white relative overflow-hidden`}>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs self-start">
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
                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  <Users className="w-2.5 h-2.5" />
                  <span>{cls.students}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Right Card: Thông báo mới */}
      <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Thông báo mới
            </h3>
          </div>
          <button
            onClick={onViewAllAnnouncements}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Announcements List matching design */}
        <div className="space-y-2.5">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${ann.iconBg}`}>
                  {ann.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {ann.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {ann.time}
                  </p>
                </div>
              </div>

              {ann.isUnread && (
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
