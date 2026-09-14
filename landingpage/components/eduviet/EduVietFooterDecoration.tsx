'use client';

import React, { useState } from 'react';
import { Star, Heart, ExternalLink, Layers, ShieldCheck, FileText } from 'lucide-react';
import EcosystemBrochureModal from '../EcosystemBrochureModal';

export default function EduVietFooterDecoration() {
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);

  return (
    <>
      <div className="relative w-full pt-8 pb-16 select-none">
        {/* Decorative Top Line */}
        <div className="max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800/80 mb-6" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Top Row: National Flag & Slogan */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Vietnamese National Flag */}
            <div className="flex items-center gap-3">
              <div className="w-20 sm:w-24 h-12 sm:h-14 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 rounded-2xl shadow-md flex items-center justify-center border border-amber-300/40 transform -rotate-2 animate-flag">
                <Star className="w-6 sm:w-7 h-6 sm:h-7 text-amber-300 fill-amber-300 drop-shadow" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Giáo dục kiến tạo con người Việt Nam
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Chuẩn hóa Công văn 5512, Thông tư 22 & Nghị định 123
                </p>
              </div>
            </div>

            {/* Right: Brochure Action Button */}
            <button
              onClick={() => setIsBrochureOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Hồ Sơ Năng Lực AI & Báo Chí</span>
            </button>
          </div>

          {/* Middle: SEO Triangle Matrix Links (Huy Technology - SmartTax - Smart Teacher) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <a
              href="https://huycncdsai.io.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-rose-600 font-bold block uppercase">Master Hub</span>
                <strong className="text-slate-900 dark:text-white font-bold group-hover:text-rose-600 transition-colors">
                  Huy Technology AI
                </strong>
                <span className="text-[10px] text-slate-500 block">Tổng Bộ Chuyển Đổi Số AI</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </a>

            <a
              href="https://smarttax-ai.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-emerald-600 font-bold block uppercase">Thuế & Hóa Đơn</span>
                <strong className="text-slate-900 dark:text-white font-bold group-hover:text-emerald-600 transition-colors">
                  SmartTax AI
                </strong>
                <span className="text-[10px] text-slate-500 block">Kê Khai & HĐĐT Tự Động</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </a>

            <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block uppercase">Sư Phạm Số</span>
                <strong className="text-indigo-900 dark:text-indigo-200 font-bold">
                  EduViet AI Tutor
                </strong>
                <span className="text-[10px] text-slate-500 block">Trợ Lý Giáo Viên 4.0</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Bottom Copyright & Unified Banking Authority */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
            <div>
              <span>Bản quyền sở hữu trí tuệ © 2026 <strong>Huy Technology AI Hub</strong> (All rights reserved)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tài khoản bảo chứng: <strong>ACB - 37780997 (NGO QUOC HUY)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Brochure Modal */}
      <EcosystemBrochureModal
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
      />
    </>
  );
}
