"use client";

import React from 'react';
import { Star, Heart } from 'lucide-react';

export default function EduVietFooterDecoration() {
  return (
    <div className="relative w-full overflow-hidden pt-6 pb-20 pointer-events-none select-none">
      <div className="max-w-4xl mx-auto flex items-end justify-between px-4 sm:px-6 relative">
        {/* Left: Waving Vietnamese National Flag */}
        <div className="relative flex items-center gap-2 transform -translate-x-2 translate-y-2">
          <div className="w-20 sm:w-28 h-12 sm:h-16 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 rounded-tr-3xl rounded-tl-xl rounded-br-2xl shadow-lg flex items-center justify-center border border-amber-300/40 transform -rotate-3 animate-flag">
            <Star className="w-6 sm:w-8 h-6 sm:h-8 text-amber-300 fill-amber-300 drop-shadow" />
          </div>
        </div>

        {/* Right: Artistic Calligraphy Signature */}
        <div className="text-right space-y-0.5">
          <p className="font-calligraphy text-base sm:text-xl font-bold text-rose-600 flex items-center justify-end gap-1.5 drop-shadow-xs">
            <span>Giáo dục kiến tạo con người Việt Nam</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse inline" />
          </p>
          <p className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">
            Hệ sinh thái Giáo dục Thông minh 4.0
          </p>
        </div>
      </div>
    </div>
  );
}
