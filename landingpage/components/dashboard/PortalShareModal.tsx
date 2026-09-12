"use client";

import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  GraduationCap, 
  Users, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface PortalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
  className?: string;
}

export default function PortalShareModal({
  isOpen,
  onClose,
  syncCode,
  className = ''
}: PortalShareModalProps) {
  const [activeTab, setActiveTab] = useState<'parent' | 'student'>('parent');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const studentUrl = `${origin}/student?code=${encodeURIComponent(syncCode || '')}`;
  const parentUrl = `${origin}/parent?code=${encodeURIComponent(syncCode || '')}`;

  const currentUrl = activeTab === 'parent' ? parentUrl : studentUrl;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&bgcolor=1e293b&color=38bdf8`;

  const parentZaloTemplate = `📢 THÔNG BÁO TỪ GIÁO VIÊN CHỦ NHIỆM\n` +
    `Kính gửi Quý Phụ huynh học sinh${className ? ` lớp ${className}` : ''},\n\n` +
    `Để thuận tiện theo dõi tình hình học tập, chuyên cần và nộp đơn xin nghỉ học trực tuyến nhanh chóng, Thầy/Cô gửi đường link Sổ liên lạc điện tử:\n` +
    `👉 Link truy cập: ${parentUrl}\n` +
    `🔑 Mã lớp của Thầy/Cô: ${syncCode}\n\n` +
    `📌 Hướng dẫn tra cứu:\n` +
    `- Bước 1: Bấm vào link trên hoặc quét mã QR\n` +
    `- Bước 2: Nhập số điện thoại của Phụ huynh đã đăng ký với GVCN để tra cứu chuyên cần và nộp đơn xin nghỉ học.\n\n` +
    `Trân trọng thông báo!`;

  const studentZaloTemplate = `✨ HỌC LIỆU & THỜI KHÓA BIỂU DÀNH CHO HỌC SINH${className ? ` LỚP ${className.toUpperCase()}` : ''} ✨\n\n` +
    `Các em truy cập Không gian Học tập thông minh để xem trước Thời khóa biểu, sơ đồ tư duy Mindmap, Slide bài giảng và các câu đố Mini-game củng cố bài học nhé:\n` +
    `🚀 Link Không gian Học tập: ${studentUrl}\n` +
    `🔑 Mã ghép nối: ${syncCode}\n\n` +
    `Chúc các em có những tiết học thật bổ ích và đạt nhiều điểm tích lũy thi đua Kudos!`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Chia sẻ Cổng Học sinh & Phụ huynh
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cloud Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gửi đường dẫn và mã QR đến nhóm Zalo của lớp để học sinh và phụ huynh truy cập tức thì
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Sync Code Reminder Card */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">Mã ghép nối cá nhân của bạn</p>
                <p className="text-base font-mono font-bold text-white tracking-wider">{syncCode || 'Chưa thiết lập'}</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              Tự động điền trong link
            </span>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => setActiveTab('parent')}
              className={`py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'parent'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Cổng Phụ Huynh</span>
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Cổng Học Sinh</span>
            </button>
          </div>

          {/* Content for Parent Portal */}
          {activeTab === 'parent' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300/90 leading-relaxed">
                👨‍👩‍👧 <strong>Tính năng cho Phụ huynh:</strong> Tra cứu chuyên cần thời gian thực của con, xem biểu đồ điểm rèn luyện Kudos, lịch sử điểm danh 30 ngày và nộp đơn xin nghỉ học trực tuyến gửi thẳng đến điện thoại/máy tính của Thầy/Cô.
              </div>

              {/* Direct Link Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Đường dẫn Sổ liên lạc điện tử cho Phụ huynh:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={parentUrl}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(parentUrl, 'parent-url')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedType === 'parent-url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'parent-url' ? 'Đã chép' : 'Chép link'}</span>
                  </button>
                  <a
                    href={parentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở thử</span>
                  </a>
                </div>
              </div>

              {/* QR Code & Zalo Template */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt="Mã QR Cổng Phụ Huynh"
                      className="w-32 h-32 rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Quét mã mở Cổng PH</p>
                </div>

                <div className="sm:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        Mẫu tin nhắn gửi nhóm Zalo Phụ huynh
                      </span>
                    </div>
                    <textarea
                      readOnly
                      rows={5}
                      value={parentZaloTemplate}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-sans focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={() => copyToClipboard(parentZaloTemplate, 'parent-zalo')}
                    className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    {copiedType === 'parent-zalo' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'parent-zalo' ? '✓ Đã sao chép tin nhắn Zalo!' : 'Sao chép tin nhắn gửi Zalo'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content for Student Portal */}
          {activeTab === 'student' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/40 text-xs text-blue-300/90 leading-relaxed">
                🎒 <strong>Tính năng cho Học sinh:</strong> Tra cứu Thời khóa biểu hôm nay và cả tuần, xem trước Slide bài giảng, sơ đồ tư duy Mindmap tóm tắt, thử sức câu hỏi trắc nghiệm Mini-game và theo dõi Bảng vàng thi đua nề nếp Kudos.
              </div>

              {/* Direct Link Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Đường dẫn Không gian Học tập cho Học sinh:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={studentUrl}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-blue-400 font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(studentUrl, 'student-url')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedType === 'student-url' ? <Check className="w-4 h-4 text-blue-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'student-url' ? 'Đã chép' : 'Chép link'}</span>
                  </button>
                  <a
                    href={studentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở thử</span>
                  </a>
                </div>
              </div>

              {/* QR Code & Zalo Template */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-1 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700 mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt="Mã QR Cổng Học Sinh"
                      className="w-32 h-32 rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Quét mã mở Cổng HS</p>
                </div>

                <div className="sm:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        Mẫu tin nhắn gửi nhóm Học sinh
                      </span>
                    </div>
                    <textarea
                      readOnly
                      rows={5}
                      value={studentZaloTemplate}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 font-sans focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={() => copyToClipboard(studentZaloTemplate, 'student-zalo')}
                    className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    {copiedType === 'student-zalo' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === 'student-zalo' ? '✓ Đã sao chép tin nhắn Zalo!' : 'Sao chép tin nhắn gửi Zalo'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between rounded-b-3xl">
          <p className="text-xs text-slate-500">
            Học sinh và phụ huynh không cần cài app, mở được trên mọi điện thoại & trình duyệt.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
