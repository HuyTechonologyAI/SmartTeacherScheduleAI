"use client";

import React, { useState } from "react";
import { X, ShieldCheck, KeyRound, RefreshCw, Smartphone, Copy, Check, Lock, AlertTriangle, ArrowRight } from "lucide-react";

interface SyncSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSyncCode: string;
  currentPin: string;
  onSaveCredentials: (newCode: string, newPin: string) => Promise<boolean>;
  onPerformSync: () => void;
  isSyncing: boolean;
  lastSyncTime?: number;
}

export default function SyncSecurityModal({
  isOpen,
  onClose,
  currentSyncCode,
  currentPin,
  onSaveCredentials,
  onPerformSync,
  isSyncing,
  lastSyncTime
}: SyncSecurityModalProps) {
  const [code, setCode] = useState<string>(currentSyncCode);
  const [pin, setPin] = useState<string>(currentPin);
  const [copied, setCopied] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  if (!isOpen) return null;

  const handleGenerateNewCode = () => {
    const random6 = Math.floor(100000 + Math.random() * 900000);
    setCode("ST-" + random6);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = async () => {
    if (!code.trim()) {
      setSaveStatus("Mã đồng bộ không được để trống.");
      return;
    }
    setSaveStatus("Đang lưu...");
    const ok = await onSaveCredentials(code.trim(), pin.trim());
    if (ok) {
      setSaveStatus("Đã lưu mã ghép nối & mã PIN an toàn!");
      setTimeout(() => setSaveStatus(""), 2500);
    } else {
      setSaveStatus("Có lỗi khi lưu, vui lòng thử lại.");
    }
  };

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
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Bảo Mật Ghép Nối Đám Mây Đa Nền Tảng</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Mã Ghép Nối & Mã PIN Bảo Vệ
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Dữ liệu lịch dạy và sổ lớp của Thầy/Cô được lưu trữ an toàn riêng biệt trên Supabase Cloud. Dùng mã ghép nối này để đồng bộ tức thì sang điện thoại Android, máy tính Windows hoặc iPad.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>MÃ GHÉP NỐI THIẾT BỊ (PAIRING CODE)</span>
            <button
              onClick={handleGenerateNewCode}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tạo mã mới</span>
            </button>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: ST-882910 hoặc số điện thoại"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-xs"
              title="Sao chép mã"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Đã chép" : "Chép"}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Mỗi giáo viên nên sở hữu 1 mã riêng biệt (dạng ST-xxxxxx hoặc số điện thoại cá nhân). Tránh dùng mã chung của người khác.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>MÃ PIN BẢO MẬT (4 - 6 KÝ TỰ - TÙY CHỌN)</span>
          </label>
          <input
            type="password"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Để trống nếu không muốn khóa PIN"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-mono text-base focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
          <p className="text-[11px] text-slate-500">
            Khi đặt mã PIN, bất kỳ ai có mã ghép nối cũng không thể xem hoặc ghi đè thời khóa biểu của Thầy/Cô nếu không có mã PIN này.
          </p>
        </div>

        {saveStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            {saveStatus}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {lastSyncTime ? (
              <span>Đồng bộ gần nhất: {new Date(lastSyncTime).toLocaleTimeString("vi-VN")}</span>
            ) : (
              <span>Chưa đồng bộ phiên này</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Lưu Cài Đặt
            </button>
            <button
              onClick={onPerformSync}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Đang Đồng Bộ..." : "Đồng Bộ Ngay"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}