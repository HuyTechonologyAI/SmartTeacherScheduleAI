"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Scan, 
  ChevronDown, 
  GraduationCap, 
  User, 
  ShieldCheck,
  Share2,
  CalendarDays,
  RefreshCw,
  Sun,
  Moon,
  School,
  BookOpen,
  LogIn,
  LogOut,
  Edit3
} from 'lucide-react';

interface EduVietHeaderProps {
  userName?: string;
  userRole?: string;
  schoolName?: string;
  userAvatar?: string;
  teacherPhone?: string;
  teacherEmail?: string;
  teacherSchools?: string[];
  teacherSubjects?: string[];
  onSearch?: (query: string) => void;
  onOpenNotifications?: () => void;
  onOpenPortalShare?: () => void;
  onOpenSync?: () => void;
  onSyncBothWays?: () => void;
  isSyncing?: boolean;
  totalEventsCount?: number;
  syncCode?: string;
  unreadCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenProfile?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export default function EduVietHeader({
  userName = "Nguyễn Minh Anh",
  userRole = "Giáo viên",
  schoolName = "Trường THPT Việt Nam",
  userAvatar,
  teacherPhone,
  teacherEmail,
  teacherSchools,
  teacherSubjects,
  onSearch,
  onOpenNotifications,
  onOpenPortalShare,
  onOpenSync,
  onSyncBothWays,
  isSyncing = false,
  totalEventsCount,
  syncCode = "",
  unreadCount = 0,
  theme = 'light',
  onToggleTheme,
  onOpenProfile,
  onOpenLogin,
  onLogout
}: EduVietHeaderProps) {
  const [searchVal, setSearchVal] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="w-full bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Top bar: Brand + Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-2 shadow-md shadow-indigo-950/20 flex items-center justify-center border border-indigo-400/30">
              <div className="relative">
                <GraduationCap className="w-6 h-6 text-indigo-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-2xl font-black tracking-tight text-rose-600">Edu</span>
                <span className="text-2xl font-black tracking-tight text-emerald-600">Viet</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight mt-0.5">
                Cùng tri thức – Vững tương lai
              </p>
            </div>
          </div>

          {/* Right Action Icons: Theme Toggle, Notification, Share, User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Sun / Moon button */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-700 dark:text-amber-400 transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            )}

            {/* Sync Code Badge button (Desktop/Cloud) */}
            {syncCode && (
              <button
                onClick={onOpenSync}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Mã đồng bộ đám mây"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{syncCode}</span>
              </button>
            )}

            {/* Cloud Sync 2-Way button */}
            {onSyncBothWays && (
              <button
                onClick={onSyncBothWays}
                disabled={isSyncing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer disabled:opacity-50"
                title="Đồng bộ hai chiều với điện thoại"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : (totalEventsCount ? `${totalEventsCount} ca dạy` : 'Đồng bộ')}</span>
              </button>
            )}

            {/* Portal Share button */}
            {onOpenPortalShare && (
              <button
                onClick={onOpenPortalShare}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
                title="Chia sẻ link vào nhóm Zalo Học sinh & Phụ huynh"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Gửi Zalo</span>
              </button>
            )}

            {/* Notification Bell: CHỈ BÁO KHI CÓ ĐƠN YÊU CẦU TỪ PHỤ HUYNH */}
            <button
              onClick={onOpenNotifications}
              className="relative w-10 h-10 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title={unreadCount > 0 ? `${unreadCount} đơn yêu cầu từ phụ huynh cần xử lý` : "Đơn yêu cầu từ phụ huynh (Không có đơn mới)"}
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 pl-1 cursor-pointer group focus:outline-none"
                title={`Tài khoản: ${userName}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-900/60 border-2 border-emerald-500/70 p-0.5 overflow-hidden shadow-sm flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=EduVietTeacher"}
                    alt={userName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Popup */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-3 animate-fade-in text-left">
                    {/* User Card */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-500 overflow-hidden shrink-0 bg-emerald-50 dark:bg-emerald-950">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={userAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=EduVietTeacher"}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {userName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {teacherEmail || teacherPhone || "Giáo viên"}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <GraduationCap className="w-3 h-3" />
                          <span>{userRole}</span>
                        </span>
                      </div>
                    </div>

                    {/* Schools & Subjects Summary */}
                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {teacherSchools && teacherSchools.length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <School className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{teacherSchools.join(', ')}</span>
                        </div>
                      )}
                      {teacherSubjects && teacherSubjects.length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">Môn: {teacherSubjects.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Menu Items */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenProfile) onOpenProfile();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                      >
                        <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Chỉnh sửa thông tin hồ sơ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onOpenLogin) onOpenLogin();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                      >
                        <LogIn className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Đổi tài khoản / Đăng nhập</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar matching design */}
        <div className="relative">
          <div className="flex items-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-full px-4 py-2.5 shadow-sm transition-all">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm bài giảng, tài liệu, lớp học, giáo án..."
              value={searchVal}
              onChange={handleSearchChange}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
            <button 
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Quét mã QR học liệu hoặc lớp học"
            >
              <Scan className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
