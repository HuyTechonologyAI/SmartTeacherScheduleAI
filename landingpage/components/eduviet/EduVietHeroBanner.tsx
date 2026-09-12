"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Award, Heart } from 'lucide-react';
import { Language } from '@/app/app/i18n';

interface EduVietHeroBannerProps {
  onActionClick?: () => void;
  lang?: Language;
}

export default function EduVietHeroBanner({ onActionClick, lang = 'vi' }: EduVietHeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isEn = lang === 'en';

  const slidesVi = [
    {
      titleRed: "Tri thức hôm nay",
      titleGreen: "Tương lai ngày mai",
      quote: "Học để trưởng thành và làm điều tốt đẹp hơn!",
      badge: "VÌ MỘT THẾ HỆ VIỆT NAM TRI THỨC - NHÂN ÁI - VỮNG MẠNH",
      cta: "Cùng học tốt hơn",
      subSlogan: "Tri thức Kiến tạo ước mơ"
    },
    {
      titleRed: "Tâm huyết người thầy",
      titleGreen: "Nâng cánh ước mơ",
      quote: "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!",
      badge: "ĐỔI MỚI SÁNG TẠO DẠY VÀ HỌC THEO CHƯƠNG TRÌNH GDPT MỚI",
      cta: "Soạn giáo án AI 5512",
      subSlogan: "Sư phạm tích cực 4.0"
    }
  ];

  const slidesEn = [
    {
      titleRed: "Knowledge Today",
      titleGreen: "Future Tomorrow",
      quote: "Learn to grow, inspire, and create a better world!",
      badge: "NURTURING KNOWLEDGE - COMPASSION - RESILIENCE",
      cta: "Learn Together",
      subSlogan: "Knowledge Shapes Dreams"
    },
    {
      titleRed: "Teacher's Heart",
      titleGreen: "Elevating Dreams",
      quote: "Every teaching hour is a journey of inspiring young minds!",
      badge: "INNOVATIVE PEDAGOGY & CURRICULUM EXCELLENCE",
      cta: "AI Lesson Planner",
      subSlogan: "Empowering Pedagogy 4.0"
    }
  ];

  const slides = isEn ? slidesEn : slidesVi;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-amber-200/60 dark:border-slate-800 bg-gradient-to-r from-amber-50 via-orange-50/70 to-rose-50/80 dark:from-slate-900 dark:via-slate-900/95 dark:to-rose-950/40 p-5 sm:p-7 transition-all">
      {/* Background Vietnamese Cultural Motifs */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/15 rounded-full blur-2xl pointer-events-none"></div>

      {/* Decorative Vietnamese National Flag Silhouette in background */}
      <div className="absolute right-2 sm:right-16 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none select-none">
        <div className="w-36 h-24 bg-rose-600 rounded-lg flex items-center justify-center shadow-md rotate-3">
          <Star className="w-12 h-12 text-amber-400 fill-amber-400" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left text content */}
        <div className="space-y-2.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{isEn ? "Vietnam Education" : "Giáo Dục Việt Nam"}</span>
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">|</span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hidden sm:inline">
              {slide.subSlogan}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-rose-600 dark:text-rose-400 block sm:inline">{slide.titleRed} </span>
            <span className="text-emerald-700 dark:text-emerald-400 block sm:inline">{slide.titleGreen}</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium italic">
            &ldquo;{slide.quote}&rdquo;
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onActionClick}
              className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-rose-600/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{slide.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Stamp/Badge */}
        <div className="hidden md:flex flex-col items-center justify-center p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700 shadow-sm text-center max-w-[210px]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center mb-1.5 shadow-sm">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight leading-snug">
            {slide.badge}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            <span>{isEn ? "Devoted to students" : "Vì học sinh thân yêu"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
