"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  QrCode,
  Smartphone,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Apple,
} from "lucide-react";

export default function HeroSection() {
  const [showQr, setShowQr] = useState(false);

  const apkUrl =
    "https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v1.3.1/SmartTeacherSchedule_v1.3.1_Release.apk";
  const aabUrl =
    "https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/download/v1.3.1/SmartTeacherSchedule_v1.3.1_Release.aab";

  return (
    <section
      id="download"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
    >
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Content & Top Download CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Version Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Phiên bản v1.3.1 chính thức phát hành</span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-300">Khoảng Ngày Lịch Dạy & AI Động Lực Sư Phạm</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Dạy Đúng Giờ – Làm Đúng Việc –{" "}
              <span className="text-gradient">Không Bỏ Sót</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Ứng dụng thông minh chuyên biệt dành cho Giảng viên & Giáo viên:{" "}
              <strong className="text-white">Báo thức kép 60m & 15m</strong>,
              chống tắt ngầm khi dọn RAM,{" "}
              <strong className="text-cyan-400">Tiện ích Widget Màn hình chính 2-trong-1</strong>{" "}
              và trợ lý trí tuệ nhân tạo Gemini AI.
            </p>

            {/* ========================================================================= */}
            {/* 1. SECTION TẢI APP NẰM VỊ TRÍ ĐẦU TIÊN (HERO DOWNLOAD SECTION) */}
            {/* ========================================================================= */}
            <div className="p-6 sm:p-7 rounded-3xl glass-panel border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80 shadow-2xl shadow-indigo-950/50 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Tải Ứng Dụng Ngay (Miễn Phí 100%)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tương thích Android 8.0 đến Android 15 mới nhất
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  Bản v1.3.1 (15.3 MB)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                {/* Primary APK Download for Android */}
                <a
                  href={apkUrl}
                  className="flex items-center justify-center space-x-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform text-emerald-100" />
                  <div className="text-left">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                      Dành Cho Android
                    </div>
                    <div className="text-sm font-bold leading-tight">TẢI FILE APK v1.3.1</div>
                  </div>
                </a>

                {/* Primary iOS App Link */}
                <Link
                  href="/app"
                  className="flex items-center justify-center space-x-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 hover:from-slate-800 hover:to-purple-800 text-white font-bold text-base border-2 border-indigo-500/40 shadow-xl shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                  <Apple className="w-6 h-6 text-indigo-300 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                      Dành Cho iPhone / iPad
                    </div>
                    <div className="text-sm font-bold leading-tight flex items-center gap-1.5">
                      MỞ APP TRÊN iOS <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Secondary Actions: AAB & QR */}
              <div className="flex space-x-2 pt-0.5">
                <a
                  href={aabUrl}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs border border-white/10 hover:border-indigo-500/50 transition-all text-center"
                  title="Dành cho kỹ thuật viên hoặc xuất bản Google Play"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Gói Android AAB (14.5 MB)</span>
                </a>

                <button
                  onClick={() => setShowQr(!showQr)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium text-xs border border-white/10 hover:border-indigo-500/50 transition-all flex items-center justify-center gap-1.5"
                  title="Quét mã QR để mở trên điện thoại"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mã QR Điện Thoại</span>
                </button>
              </div>

              {/* QR Code Collapsible Drawer */}
              {showQr && (
                <div className="p-4 rounded-2xl bg-black/50 border border-white/15 grid sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-1.5 bg-white rounded-lg shadow shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                          apkUrl
                        )}`}
                        alt="QR Android"
                        width={90}
                        height={90}
                        className="rounded"
                      />
                    </div>
                    <div className="text-xs text-slate-300 space-y-0.5">
                      <p className="font-bold text-emerald-400 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5" /> Quét Tải APK (Android)
                      </p>
                      <p className="text-[11px] text-slate-400">Mở Camera quét để tải file APK v1.3.1 trực tiếp về máy.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-1.5 bg-white rounded-lg shadow shrink-0">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https%3A%2F%2Fgvcncdsai.io.vn%2Fapp"
                        alt="QR iPhone"
                        width={90}
                        height={90}
                        className="rounded"
                      />
                    </div>
                    <div className="text-xs text-slate-300 space-y-0.5">
                      <p className="font-bold text-indigo-300 flex items-center gap-1">
                        <Apple className="w-3.5 h-3.5" /> Quét Mở Trên iPhone (iOS)
                      </p>
                      <p className="text-[11px] text-slate-400">Mở Camera iPhone quét ➔ Bấm Chia sẻ ➔ Thêm vào MH chính.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Trust Signals */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ký số bản quyền chính thức</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Cài đặt 30 giây</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Tự động làm mới 00:00</span>
                </div>
              </div>
            </div>

            {/* Developer Contact Quick Bar */}
            <div className="flex items-center justify-center lg:justify-start space-x-4 text-xs text-slate-400 pt-2">
              <span>Tác giả: <strong className="text-slate-200">Huy Technology AI</strong></span>
              <span>•</span>
              <span>Hotline/Zalo: <a href="tel:0961364600" className="text-indigo-400 hover:underline font-semibold">0961364600</a></span>
              <span>•</span>
              <a href="https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                GitHub Repo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center relative">
            {/* Phone Frame */}
            <div className="relative w-[320px] sm:w-[350px] rounded-[48px] p-3 bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-2xl shadow-indigo-500/20 border-4 border-slate-700/60 ring-1 ring-white/20 animate-float">
              {/* Screen Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
                <div className="w-2 h-2 rounded-full bg-indigo-950" />
              </div>

              {/* Inside Screen Container */}
              <div className="w-full rounded-[40px] overflow-hidden bg-[#0A0F1D] border border-white/5 pt-8 pb-6 px-4 space-y-4 text-left">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[11px] text-slate-400 px-2 pt-1 font-mono">
                  <span>08:15</span>
                  <div className="flex items-center space-x-1.5">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Top App Header */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white flex items-center gap-2">
                      Hôm nay
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-mono">
                        08:15:30
                      </span>
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      Đã đồng bộ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Thứ Năm, ngày 03/09/2026
                  </p>
                </div>

                {/* Hero Card inside phone: Next Class Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold tracking-wider text-indigo-200">
                      LỚP HỌC KẾ TIẾP
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 font-bold">
                      Còn 15 phút
                    </span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base leading-tight">
                      Dạy Lập Trình Phay CNC
                    </h4>
                    <p className="text-xs text-indigo-100 flex items-center gap-2 mt-1">
                      <span>08:30 - 11:30</span>
                      <span>•</span>
                      <span>Xưởng Cơ Khí A1</span>
                      <span>•</span>
                      <span>Lớp CĐCK02</span>
                    </p>
                  </div>
                </div>

                {/* Widget 2-in-1 Preview */}
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-cyan-500/30 space-y-2 shadow-md">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Tiện ích Widget Màn Hình Chính
                    </span>
                    <span className="text-slate-400">2-trong-1</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <p className="text-xs font-semibold text-white truncate">
                      Chuẩn bị 25 phôi nhôm thực hành
                    </p>
                    <p className="text-[10px] text-rose-400">
                      Hạn chót: 08:20 (Trước giờ dạy 10p)
                    </p>
                  </div>
                </div>

                {/* Bottom Navigation Mock */}
                <div className="pt-2 flex justify-around border-t border-white/5 text-[10px] text-slate-400">
                  <span className="text-indigo-400 font-bold">Hôm nay</span>
                  <span>Lịch dạy</span>
                  <span>Nhiệm vụ</span>
                  <span>Gemini AI</span>
                  <span>Cài đặt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
