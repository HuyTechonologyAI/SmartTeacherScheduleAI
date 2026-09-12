"use client";

import React from 'react';
import { Calendar, ChevronRight, Clock, MapPin, BookOpen } from 'lucide-react';

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
}

export default function EduVietTimelineToday({
  sessions,
  title = "Lịch học hôm nay",
  onViewAll,
  onSelectSession
}: EduVietTimelineTodayProps) {
  // Default mock schedule matching exactly the reference image if no sessions passed
  const defaultSessions: TimelineSessionItem[] = [
    {
      id: 's1',
      timeRange: '07:00 – 07:45',
      subject: 'Toán',
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

  const items = (sessions && sessions.length > 0) ? sessions : defaultSessions;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {title}
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-100 before:z-0">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => onSelectSession && onSelectSession(item)}
            className={`relative z-10 flex items-center justify-between p-2 rounded-2xl transition-all cursor-pointer ${
              item.isActive
                ? 'bg-emerald-50/80 border border-emerald-200/80 shadow-xs'
                : 'hover:bg-slate-50'
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
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                )}
              </div>

              <span className={`text-xs font-semibold font-mono ${item.isActive ? 'text-emerald-900' : 'text-slate-500'}`}>
                {item.timeRange}
              </span>
            </div>

            {/* Subject & Room */}
            <div className="text-right">
              <p className={`text-xs sm:text-sm font-bold ${item.isActive ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                {item.subject}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {item.room} {item.className ? `• ${item.className}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
