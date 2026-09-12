"use client";

import React from 'react';
import { ChevronRight, Sprout, GraduationCap, School } from 'lucide-react';

interface EduVietIdentityCardProps {
  name?: string;
  classNameOrSubject?: string;
  schoolName?: string;
  role?: 'teacher' | 'student';
  quote?: string;
  onCardClick?: () => void;
}

export default function EduVietIdentityCard({
  name = "Nguyễn Minh Anh",
  classNameOrSubject = "Lớp 10A1",
  schoolName = "Trường THPT Việt Nam",
  role = 'teacher',
  quote = "Nỗ lực hôm nay để chạm tới ước mơ!",
  onCardClick
}: EduVietIdentityCardProps) {
  return (
    <div 
      onClick={onCardClick}
      className="w-full bg-white border border-slate-100 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
    >
      {/* Left: Avatar & Personal Info */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 border-2 border-emerald-400 p-0.5 overflow-hidden shadow-sm flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=VietnameseTeacher"
              alt={name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full block"></span>
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span>{classNameOrSubject}</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">
              <School className="w-3 h-3 text-slate-400" />
              {schoolName}
            </span>
          </p>
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <GraduationCap className="w-3 h-3 text-emerald-600" />
              <span>{role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Inspirational Quote with Sprout Leaf */}
      <div className="flex items-center justify-between sm:justify-end gap-2 bg-slate-50/80 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-0">
        <div className="flex items-center gap-2 max-w-xs text-right">
          <Sprout className="w-4 h-4 text-emerald-600 flex-shrink-0 animate-bounce" />
          <p className="text-xs font-semibold text-slate-700 italic">
            &ldquo;{quote}&rdquo;
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </div>
  );
}
