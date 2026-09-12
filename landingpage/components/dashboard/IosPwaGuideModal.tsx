"use client";

import React from "react";
import { X, Share, PlusSquare, Smartphone, CheckCircle, ExternalLink } from "lucide-react";

interface IosPwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IosPwaGuideModal({ isOpen, onClose }: IosPwaGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Dành Riêng Cho iPhone & iPad (iOS)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Cài Đặt Web App Mượt Như Bản Gốc
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Do chính sách bảo mật của Apple không hỗ trợ cài APK, Thầy/Cô chỉ cần 3 bước đơn giản để đưa ứng dụng ra màn hình chính với tốc độ cực nhanh:
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-slate-900">Mở trên trình duyệt Safari</p>
              <p className="text-xs text-slate-600">
                Truy cập địa chỉ <code className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono font-bold border border-rose-200">gvcncdsai.io.vn/app</code> bằng ứng dụng <strong>Safari</strong> trên iPhone/iPad.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
              2
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <span>Bấm nút Chia sẻ</span>
                <Share className="w-4 h-4 text-indigo-600 inline" />
                <span>ở thanh công cụ</span>
              </div>
              <p className="text-xs text-slate-600">
                Bấm vào biểu tượng hình vuông có mũi tên hướng lên (nằm ở thanh dưới cùng trên iPhone hoặc góc trên trên iPad).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
              3
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <span>Chọn "Thêm vào MH chính"</span>
                <PlusSquare className="w-4 h-4 text-emerald-600 inline" />
              </div>
              <p className="text-xs text-slate-600">
                Cuộn menu xuống và bấm <strong className="text-emerald-700 font-semibold">"Thêm vào MH chính" (Add to Home Screen)</strong>, sau đó nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Biểu tượng app sẽ xuất hiện ngay trên màn hình chính, mở không viền trình duyệt, ghi nhớ dữ liệu tự động!</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Đã Hiểu
          </button>
          <a
            href="/app"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Mở Web App Ngay</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}