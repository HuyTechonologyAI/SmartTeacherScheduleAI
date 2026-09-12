"use client";

import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Language } from '@/app/app/i18n';

export interface TimelineSessionItem {
  id: string;
  timeRange: string;
  subject: string;
  room: string;
  className?: string;
  isActive?: boolean;
  statusText?: string;
}

interface EduVietTimelineTodayProps {
  sessions?: TimelineSessionItem[];
  title?: string;
  onViewAll?: () => void;
  onSelectSession?: (item: TimelineSessionItem) => void;
  lang?: Language;
}

export default function EduVietTimelineToday({
  sessions,
  title,
  onViewAll,
  onSelectSession,
  lang = 'vi'
}: EduVietTimelineTodayProps) {
  const isEn = lang === 'en';

  const defaultSessionsVi: TimelineSessionItem[] = [
    {
      id: 's1',
      timeRange: '07:00 – 07:45',
      subject: 'Toán học',
      room: 'Phòng A101',
      isActive: false
    },
    {
      id: 's2',
      timeRange: '08:00 – 08:45',
      subject: 'Ngữ văn',
      room: 'Phòng A101',
      isActive: true,
      statusText: 'Đang diễn ra'
    },
    {
      id: 's3',
      timeRange: '09:00 – 09:45',
      subject: 'Tiếng Anh',
      room: 'Phòng A102',
      isActive: false
    },
    {
      id: 's4',
      timeRange: '10:00 – 10:45',
      subject: 'Vật lý',
      room: 'Phòng A103',
      isActive: false
    }
  ];

  const defaultSessionsEn: TimelineSessionItem[] = [
    {
      id: 's1',
      timeRange: '07:00 – 07:45',
      subject: 'Mathematics',
      room: 'Room A101',
      isActive: false
    },
    {
      id: 's2',
      timeRange: '08:00 – 08:45',
      subject: 'Literature',
      room: 'Room A101',
      isActive: true,
      statusText: 'In Progress'
    },
    {
      id: 's3',
      timeRange: '09:00 – 09:45',
      subject: 'English',
      room: 'Room A102',
      isActive: false
    },
    {
      id: 's4',
      timeRange: '10:00 – 10:45',
      subject: 'Physics',
      room: 'Room A103',
      isActive: false
    }
  ];

  const defaultSessions = isEn ? defaultSessionsEn : defaultSessionsVi;
  const items = (sessions && sessions.length > 0) ? sessions : defaultSessions;
  const displayTitle = title || (isEn ? "Today's Teaching Schedule" : "Lịch dạy hôm nay");

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {displayTitle}
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>{isEn ? "View all" : "Xem tất cả"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800 before:z-0">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelectSession && onSelectSession(item)}
            className={`relative z-10 flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
              item.isActive
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            {/* Timeline Dot & Time */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-4">
                {item.isActive ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                )}
              </div>

              <span className={`text-xs font-semibold font-mono ${item.isActive ? 'text-emerald-900 dark:text-emerald-300 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.timeRange}
              </span>
            </div>

            {/* Subject & Room */}
            <div className="text-right">
              <p className={`text-xs sm:text-sm font-bold ${item.isActive ? 'text-emerald-950 dark:text-emerald-200 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                {item.subject}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {item.room} {item.className ? `• ${item.className}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
