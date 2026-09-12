"use client";

import React from 'react';
import { 
  Home, 
  GraduationCap, 
  BookOpen, 
  BarChart2, 
  User 
} from 'lucide-react';

export type EduVietNavTab = 'home' | 'classes' | 'knowledge' | 'stats' | 'profile';

interface EduVietBottomNavProps {
  activeTab: EduVietNavTab;
  onChangeTab: (tab: EduVietNavTab) => void;
}

export default function EduVietBottomNav({
  activeTab,
  onChangeTab
}: EduVietBottomNavProps) {
  const navItems = [
    { id: 'home' as EduVietNavTab, label: 'Trang chủ', icon: Home },
    { id: 'classes' as EduVietNavTab, label: 'Lớp học', icon: GraduationCap },
    { id: 'knowledge' as EduVietNavTab, label: 'Học liệu', icon: BookOpen },
    { id: 'stats' as EduVietNavTab, label: 'Thống kê', icon: BarChart2 },
    { id: 'profile' as EduVietNavTab, label: 'Cá nhân', icon: User }
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-full px-4 sm:px-6 py-2 flex items-center justify-around gap-4 sm:gap-8 pointer-events-auto max-w-md w-full transition-all">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all py-1 px-2 rounded-2xl cursor-pointer group ${
                isActive ? 'text-rose-600 scale-105' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'stroke-[2.5px] text-rose-600' : 'stroke-[1.75px]'}`} />
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-rose-600 mx-auto mt-0.5 block"></span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight ${isActive ? 'text-rose-600 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
