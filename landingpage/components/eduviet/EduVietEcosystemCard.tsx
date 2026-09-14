'use client';

import React from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Gift, ArrowRight, FileSpreadsheet, Building } from 'lucide-react';

interface EduVietEcosystemCardProps {
  onOpenSchoolQuote?: () => void;
}

export default function EduVietEcosystemCard({ onOpenSchoolQuote }: EduVietEcosystemCardProps) {
  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-[#0B1120] text-white p-5 sm:p-6 border border-indigo-500/30 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background glow circle */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold shadow-md shadow-rose-500/20 text-white shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm sm:text-base text-white tracking-tight">
                Đặc Quyền Hệ Sinh Thái Huy Technology AI
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Combo Độc Quyền
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Liên kết chuyển giao công nghệ giữa Sư Phạm Thông Minh & Kê Khai Thuế Số
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            Mã ưu đãi: <strong className="text-amber-300 font-mono">HUYTECH-EDU</strong>
          </span>
        </div>
      </div>

      {/* 2 Cột Giải pháp Kinh doanh: Giáo viên Dạy Thêm & Nhà Trường */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
        {/* Cột 1: Dành cho Giáo viên Dạy Thêm / Luyện Thi */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span>📊</span>
              <span>Dành Cho Giáo Viên Dạy Thêm</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Giảm 30%
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Thầy/Cô có mở lớp dạy kèm hoặc trung tâm bồi dưỡng văn hóa? Đăng ký <strong>SmartTax AI</strong> để tự động xuất Hóa đơn điện tử học phí cho phụ huynh và kê khai thuế TNCN giảm trừ gia cảnh chuẩn Nghị định 123.
          </p>
          <a
            href="https://smarttax-ai.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1 group"
          >
            <span>Kê khai thuế dạy thêm tại smarttax-ai.vercel.app</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Cột 2: Gói Combo Trường Học (Tài trợ 3.5 Triệu SmartTax AI) */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/50 transition-all space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gói Combo Hợp Đồng Trường Học</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Tài Trợ 3.5 Tr
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Khi ký hợp đồng <strong>Gói Nhà Trường</strong>, nhà trường được tặng kèm <strong>01 năm bản quyền SmartTax AI Pro</strong> (Trị giá 3.500.000 đ) phục vụ công tác tài chính, xuất hóa đơn học phí và quyết toán thuế Kho bạc.
          </p>
          {onOpenSchoolQuote ? (
            <button
              onClick={onOpenSchoolQuote}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 pt-1 cursor-pointer group"
            >
              <span>Xem dự toán & quyền lợi tài trợ trường học</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 pt-1 group"
            >
              <span>Xem bảng dự toán kinh phí tại Cổng Quản Trị</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>
      </div>

      {/* Footer bảo chứng thanh toán đồng nhất */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tài khoản giao dịch chính thức toàn hệ sinh thái: <strong>ACB - 37780997 (NGO QUOC HUY)</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Hotline tư vấn gói Combo: <strong className="text-white font-mono">0961.364.600</strong></span>
        </div>
      </div>
    </div>
  );
}
