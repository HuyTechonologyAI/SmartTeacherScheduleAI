"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Menu, X, Sparkles, CheckCircle2, Shield, Apple } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <a href="#" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-indigo-500/50 group-hover:ring-indigo-400 transition-all shadow-lg shadow-indigo-500/20">
              <Image
                src="/app_icon.jpg"
                alt="Smart Teacher Schedule AI Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  Smart Teacher AI
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.3.2
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Made in Huy Technology AI
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#download" className="hover:text-indigo-400 transition-colors">
              Tải App
            </a>
            <a href="#features" className="hover:text-indigo-400 transition-colors">
              Tính Năng
            </a>
            <a href="#expert" className="hover:text-indigo-400 transition-colors">
              Chuyên Gia
            </a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">
              Bảng Giá
            </a>
            <a href="#support" className="hover:text-indigo-400 transition-colors">
              Nhận Hỗ Trợ
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => {
                const event = new CustomEvent("open-ai-assistant");
                window.dispatchEvent(event);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-cyan-300 hover:text-white font-semibold text-xs transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Hỏi AI 24/7</span>
            </button>

            <Link
              href="/app"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all shadow-sm hover:scale-105"
            >
              <Apple className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bản iPhone (iOS)</span>
            </Link>

            <a
              href="https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v1.3.2/SmartTeacherSchedule_v1.3.2_Release.apk"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Tải APK v1.3.2</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 pt-3 pb-6 space-y-3">
          <a
            href="#download"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            📥 Tải App Ngay (v1.3.2)
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            ⚡ Tính Năng Nổi Bật
          </a>
          <a
            href="#expert"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            👨‍💻 Chuyên Gia Phát Triển
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            💎 Các Gói Nâng Cấp
          </a>
          <a
            href="#support"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/5"
          >
            🎁 Nhận Hỗ Trợ & Prompt AI
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              const event = new CustomEvent("open-ai-assistant");
              window.dispatchEvent(event);
            }}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold text-cyan-300 hover:bg-indigo-500/10 transition-colors text-left"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Trợ Lý AI 24/7 (Giải đáp về App)</span>
          </button>
          <div className="pt-2 space-y-2">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-slate-850 border border-indigo-500/40 text-white font-semibold text-center shadow-lg"
            >
              <Apple className="w-4 h-4 text-indigo-400" />
              <span>Mở Bản Cho iPhone (iOS PWA)</span>
            </Link>

            <a
              href="https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v1.3.2/SmartTeacherSchedule_v1.3.2_Release.apk"
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-center shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Tải APK Miễn Phí (v1.3.2)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
