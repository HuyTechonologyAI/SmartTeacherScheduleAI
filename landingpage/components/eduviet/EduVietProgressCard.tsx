"use client";

import React from 'react';
import { BarChart2, ChevronRight, TrendingUp, CheckCircle2 } from 'lucide-react';

interface EduVietProgressCardProps {
  title?: string;
  percent?: number;
  encouragementTitle?: string;
  encouragementSubtitle?: string;
  lessonCount?: string;
  exerciseCount?: string;
  topicCount?: string;
  onViewDetails?: () => void;
}

export default function EduVietProgressCard({
  title = "Tiến độ học tập",
  percent = 75,
  encouragementTitle = "Bạn đang học rất tốt!",
  encouragementSubtitle = "Tiếp tục cố gắng để đạt mục tiêu nhé!",
  lessonCount = "8/10",
  exerciseCount = "6/8",
  topicCount = "4/5",
  onViewDetails
}: EduVietProgressCardProps) {
  // SVG circular progress calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {title}
          </h3>
        </div>
        <button
          onClick={onViewDetails}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>Xem chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Circular Progress Gauge */}
      <div className="flex flex-col items-center justify-center my-1 text-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-emerald-500 transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-extrabold text-slate-900">{percent}%</span>
          </div>
        </div>

        <div className="mt-2 space-y-0.5">
          <p className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{encouragementTitle}</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {encouragementSubtitle}
          </p>
        </div>
      </div>

      {/* 3 Metric Pills matching design */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100/80">
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2 text-center">
          <p className="text-xs sm:text-sm font-black text-emerald-700">{lessonCount}</p>
          <p className="text-[10px] font-semibold text-emerald-600/80">Bài giảng</p>
        </div>
        <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-2 text-center">
          <p className="text-xs sm:text-sm font-black text-amber-700">{exerciseCount}</p>
          <p className="text-[10px] font-semibold text-amber-600/80">Bài tập</p>
        </div>
        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-2 text-center">
          <p className="text-xs sm:text-sm font-black text-rose-700">{topicCount}</p>
          <p className="text-[10px] font-semibold text-rose-600/80">Chủ đề</p>
        </div>
      </div>
    </div>
  );
}
