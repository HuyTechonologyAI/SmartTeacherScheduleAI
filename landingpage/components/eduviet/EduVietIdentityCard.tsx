"use client";

import React from 'react';
import { ChevronRight, Sprout, GraduationCap, School } from 'lucide-react';
import { Language, t } from '@/app/app/i18n';

interface EduVietIdentityCardProps {
  name?: string;
  classNameOrSubject?: string;
  schoolName?: string;
  avatar?: string;
  subjects?: string[];
  schools?: string[];
  role?: 'teacher' | 'student';
  quote?: string;
  lang?: Language;
  onCardClick?: () => void;
}

export default function EduVietIdentityCard({
  name = "Nguyễn Minh Anh",
  classNameOrSubject = "Lớp 10A1",
  schoolName = "Trường THPT Việt Nam",
  avatar,
  subjects,
  schools,
  role = 'teacher',
  quote,
  lang = 'vi',
  onCardClick
}: EduVietIdentityCardProps) {
  const displaySubject = subjects && subjects.length > 0 ? subjects.join(', ') : classNameOrSubject;
  const multipleSuffix = lang === 'en' 
    ? `(+${(schools?.length || 1) - 1} schools)` 
    : `(+${(schools?.length || 1) - 1} trường)`;

  const displaySchool = schools && schools.length > 0 
    ? (schools.length > 1 ? `${schools[0]} ${multipleSuffix}` : schools[0])
    : schoolName;

  const finalQuote = quote || t('default_quote', lang);

  return (
    <div 
      onClick={onCardClick}
      title={lang === 'en' ? "Click to view and edit teacher profile" : "Bấm để xem và chỉnh sửa thông tin hồ sơ giáo viên"}
      className="w-full bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
    >
      {/* Left: Avatar & Personal Info */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-950 dark:to-teal-900 border-2 border-emerald-400 p-0.5 overflow-hidden shadow-sm flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=VietnameseTeacher"}
              alt={name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-slate-800 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full block"></span>
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {name}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 group-hover:text-emerald-600 transition-colors">
              {t('edit_badge', lang)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{displaySubject}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <School className="w-3 h-3 text-slate-400" />
              <span>{displaySchool}</span>
            </span>
          </p>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{role === 'teacher' ? t('teacher_role', lang) : (lang === 'en' ? 'Student' : 'Học sinh')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Inspirational Quote with Sprout Leaf */}
      <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-50/80 dark:bg-slate-800/40 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 dark:border-slate-800 sm:border-0">
        <div className="flex items-center gap-2 max-w-xs text-right">
          <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 animate-bounce" />
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">
            &ldquo;{finalQuote}&rdquo;
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </div>
  );
}
