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
  Moon
} from 'lucide-react';

interface EduVietHeaderProps {
  userName?: string;
  userRole?: string;
  schoolName?: string;
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
}

export default function EduVietHeader({
  userName = "Nguyễn Minh Anh",
  userRole = "Giáo viên",
  schoolName = "Trường THPT Việt Nam",
  onSearch,
  onOpenNotifications,
  onOpenPortalShare,
  onOpenSync,
  onSyncBothWays,
  isSyncing = false,
  totalEventsCount,
  syncCode = "",
  unreadCount = 3,
  theme = 'light',
  onToggleTheme
}: EduVietHeaderProps) {
  const [searchVal, setSearchVal] = useState('');

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

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative w-10 h-10 rounded-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-1 pl-1 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 border-2 border-emerald-500/70 p-0.5 overflow-hidden shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://api.dicebear.com/7.x/bottts/svg?seed=EduVietTeacher"
                  alt={userName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
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
