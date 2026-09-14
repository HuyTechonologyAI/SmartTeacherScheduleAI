'use client';

import React, { useState } from 'react';
import { ExternalLink, Sparkles, Layers, ShieldCheck, ChevronDown, Check } from 'lucide-react';

interface EcosystemItem {
  name: string;
  url: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: string;
  isActive?: boolean;
}

const ECOSYSTEM_SERVICES: EcosystemItem[] = [
  {
    name: 'Huy Technology AI Hub',
    url: 'https://huycncdsai.io.vn',
    badge: 'Tổng Bộ AI',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Cổng điều hành & Nền tảng Chuyển đổi số Doanh nghiệp',
    icon: '⚡',
    isActive: false
  },
  {
    name: 'SmartTax AI',
    url: 'https://smarttax-ai.vercel.app',
    badge: 'Kê Khai Thuế & HĐĐT',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Trợ lý Kê khai Thuế & Hóa đơn điện tử AI chuẩn Tổng cục Thuế',
    icon: '📊',
    isActive: false
  },
  {
    name: 'Smart Teacher Schedule AI',
    url: '/',
    badge: 'Sư Phạm & Giáo Dục AI',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Nền tảng Giáo án 5512, Đề thi TT 22 & Lịch dạy thông minh',
    icon: '🎓',
    isActive: true
  }
];

export default function EcosystemMegaBar({ className = '' }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`w-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-slate-200 border-b border-slate-800 text-[11px] select-none ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left: Ecosystem Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white">
              ⚡
            </span>
            <span className="hidden sm:inline text-slate-300">HỆ SINH THÁI</span>
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-indigo-300 bg-clip-text text-transparent font-black">
              HUY TECHNOLOGY AI
            </span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-slate-400 text-[10px]">
            Liên kết đồng bộ 3 nền tảng Sư phạm - Kê khai Thuế - Công nghệ AI
          </span>
        </div>

        {/* Right: Quick Links to 3 Platforms */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Link 1: Huy Technology Hub */}
          <a
            href="https://huycncdsai.io.vn"
            target="_blank"
            rel="noopener noreferrer"
            title="Đến Trang chủ Tổng bộ Huy Technology AI (huycncdsai.io.vn)"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-rose-400 transition-all cursor-pointer font-medium hover:text-white"
          >
            <span>🏢</span>
            <span className="font-semibold">Huy Tech AI</span>
            <span className="hidden sm:inline px-1 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Hub</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          {/* Link 2: SmartTax AI */}
          <a
            href="https://smarttax-ai.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            title="Đến Nền tảng Trợ lý Kê khai Thuế & Hóa đơn điện tử SmartTax AI (smarttax-ai.vercel.app)"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-emerald-400 transition-all cursor-pointer font-medium hover:text-white"
          >
            <span>📊</span>
            <span className="font-semibold">SmartTax AI</span>
            <span className="hidden sm:inline px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Hóa đơn & Thuế</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          {/* Active Platform Badge: Smart Teacher */}
          <div
            className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700 font-bold"
            title="Bạn đang ở nền tảng Giáo Dục & Sư Phạm Thông Minh EduViet"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>EduViet AI (Đang mở)</span>
          </div>

          {/* Ecosystem details toggle modal/dropdown */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-0.5"
            title="Xem chi tiết toàn bộ Hệ sinh thái 3 nền tảng"
          >
            <Layers className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Hệ Sinh Thái</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Modal / Dropdown */}
      {isOpen && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 shadow-2xl animate-fade-in">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Hệ Sinh Thái 3 Nền Tảng Huy Technology AI Đồng Bộ Chéo
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
              >
                ✕ Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {ECOSYSTEM_SERVICES.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target={item.url.startsWith('http') ? '_blank' : '_self'}
                  rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`p-3 rounded-xl border transition-all cursor-pointer block ${
                    item.isActive
                      ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <div className="text-[9px] text-indigo-300 flex items-center gap-1 font-mono font-bold">
                    <span>{item.url}</span>
                    {item.url.startsWith('http') && <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />}
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Bảo chứng tài khoản thụ hưởng đồng nhất: <strong>ACB - 37780997 (NGO QUOC HUY)</strong>
                </span>
              </div>
              <div>
                <span>Đồng bộ hóa đơn điện tử VAT tự động kết nối qua <strong>SmartTax AI</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
