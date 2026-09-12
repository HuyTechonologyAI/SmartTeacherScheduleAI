"use client";

import React from 'react';
import { 
  Calendar, 
  Play, 
  FileEdit, 
  BarChart3, 
  Bell, 
  BookOpen, 
  UserCheck, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  badge?: number | string;
  onClick: () => void;
}

interface EduVietQuickGridProps {
  onSelectAction: (actionId: string) => void;
  leaveRequestCount?: number;
}

export default function EduVietQuickGrid({
  onSelectAction,
  leaveRequestCount = 0
}: EduVietQuickGridProps) {
  const actions: QuickActionItem[] = [
    {
      id: 'calendar',
      label: 'Thời khóa biểu',
      icon: <Calendar className="w-5 h-5 text-white" />,
      bgColor: 'bg-rose-500 shadow-rose-500/25',
      onClick: () => onSelectAction('calendar')
    },
    {
      id: 'lesson_package',
      label: 'Bài giảng',
      icon: <Play className="w-5 h-5 text-white fill-white ml-0.5" />,
      bgColor: 'bg-amber-500 shadow-amber-500/25',
      onClick: () => onSelectAction('lesson_package')
    },
    {
      id: 'ai_plan',
      label: 'Bài tập',
      icon: <FileEdit className="w-5 h-5 text-white" />,
      bgColor: 'bg-emerald-500 shadow-emerald-500/25',
      onClick: () => onSelectAction('ai_plan')
    },
    {
      id: 'stats',
      label: 'Điểm số',
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      bgColor: 'bg-blue-500 shadow-blue-500/25',
      onClick: () => onSelectAction('stats')
    },
    {
      id: 'leave_requests',
      label: 'Thông báo',
      icon: <Bell className="w-5 h-5 text-white" />,
      bgColor: 'bg-rose-500 shadow-rose-500/25',
      badge: leaveRequestCount > 0 ? leaveRequestCount : 3,
      onClick: () => onSelectAction('leave_requests')
    },
    {
      id: 'knowledge',
      label: 'Học liệu',
      icon: <BookOpen className="w-5 h-5 text-white" />,
      bgColor: 'bg-teal-600 shadow-teal-600/25',
      onClick: () => onSelectAction('knowledge')
    },
    {
      id: 'attendance',
      label: 'Điểm danh',
      icon: <UserCheck className="w-5 h-5 text-white" />,
      bgColor: 'bg-amber-500 shadow-amber-500/25',
      onClick: () => onSelectAction('attendance')
    },
    {
      id: 'share_portal',
      label: 'Trao đổi',
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      bgColor: 'bg-pink-500 shadow-pink-500/25',
      onClick: () => onSelectAction('share_portal')
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full">
      {actions.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className="eduviet-action-btn bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800/90 p-2.5 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer group shadow-xs hover:shadow-md transition-all"
        >
          <div className="relative mb-2">
            <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-md ${item.bgColor} transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
            {item.badge !== undefined && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
