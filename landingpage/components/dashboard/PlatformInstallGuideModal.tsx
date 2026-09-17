"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Apple,
  Laptop,
  Globe,
  Download,
  Share,
  PlusSquare,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Bell,
  BatteryCharging,
  Clock,
  Layers,
  Copy,
  Check,
  FileArchive,
  Sparkles,
  HelpCircle,
  FolderOpen
} from "lucide-react";
import { trackDownload } from "@/lib/analytics";

export type PlatformType = "android" | "ios" | "desktop" | "portable" | "web" | "googleplay";

interface PlatformInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: PlatformType;
}

export default function PlatformInstallGuideModal({
  isOpen,
  onClose,
  initialPlatform = "android",
}: PlatformInstallGuideModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(initialPlatform);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (isOpen && initialPlatform) {
      setSelectedPlatform(initialPlatform);
    }
  }, [isOpen, initialPlatform]);

  if (!isOpen) return null;

  const handleCopyAppUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("https://gvcncdsai.io.vn/app");
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const platforms = [
    {
      id: "android" as PlatformType,
      name: "Android APK",
      icon: Smartphone,
      badge: "v2.3.0 • ~15.2 MB",
      color: "emerald",

      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      borderActive: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    {
      id: "ios" as PlatformType,
      name: "Bản iOS / iPhone",
      icon: Apple,
      badge: "PWA iOS (Safari)",
      color: "purple",
      btnClass: "bg-purple-600 hover:bg-purple-700 text-white",
      borderActive: "border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-400",
    },
    {
      id: "desktop" as PlatformType,
      name: "Máy tính Desktop",
      icon: Laptop,
      badge: "Windows • ~83.2 MB",
      color: "indigo",
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
      borderActive: "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    },
    {
      id: "web" as PlatformType,
      name: "Web App PWA",
      icon: Sparkles,
      badge: "Chrome/Edge/Cốc Cốc",
      color: "rose",
      btnClass: "bg-rose-600 hover:bg-rose-700 text-white",
      borderActive: "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
    {
      id: "googleplay" as PlatformType,
      name: "Google Play AAB",
      icon: Globe,
      badge: "Signed App Bundle",
      color: "blue",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
      borderActive: "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between relative">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Hướng Dẫn Cài Đặt & Sử Dụng Toàn Diện</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Lựa Chọn Thiết Bị Của Thầy Cô
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Chỉ 1-2 phút thiết lập để sử dụng mượt mà, đầy đủ chuông báo tiết và đồng bộ đa thiết bị.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Platform Selector Tabs */}
        <div className="px-6 pt-3 pb-2 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {platforms.map((p) => {
              const Icon = p.icon;
              const isActive = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isActive
                      ? p.borderActive + " shadow-xs ring-1 ring-emerald-500/20"
                      : "border-transparent bg-white/70 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Content for each platform */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          
          {/* ================= TAB 1: ANDROID APK ================= */}
          {selectedPlatform === "android" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                      Phiên bản Android APK chính thức v2.3.0
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                      Mới Nhất
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Tương thích: Samsung (OneUI), Tecno (HiOS), Xiaomi (HyperOS), Oppo (ColorOS), Realme, Vivo, Android 8.0 - 15+
                  </p>
                </div>
                <a
                  href="/downloads/SmartTeacherSchedule_v2.3.0.apk"
                  download="SmartTeacherSchedule_v2.3.0.apk"
                  onClick={() => trackDownload('android', '2.3.0', 'Modal Android APK')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải APK v2.3.0 (~15.2 MB)</span>
                </a>
              </div>

              {/* 4 Steps */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  4 Bước Cài Đặt Trực Tiếp Trên Điện Thoại:
                </h4>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Bấm nút Tải APK v2.3.0
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Bấm nút màu xanh phía trên hoặc trên trang chủ. Trình duyệt sẽ bắt đầu tải tệp <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold text-emerald-600">SmartTeacherSchedule_v2.3.0.apk</code>.
                    </p>
                  </div>
                </div>


                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Xác nhận thông báo tải an toàn
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Nếu trình duyệt hiện cảnh báo <em>"Tệp có thể gây hại"</em> (cảnh báo mặc định của Android với mọi file APK ngoài Google Play), Thầy/Cô yên tâm bấm <strong className="text-emerald-700 dark:text-emerald-400">"Vẫn tải xuống" (Download anyway)</strong>. File đã được ký số Keystore chính hãng tuyệt đối an toàn.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Mở tệp và cho phép cài đặt nguồn này
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Bấm vào tệp vừa tải xong ➔ Nhấn <strong>"Cài đặt"</strong>. Nếu máy chuyển sang màn hình bảo mật, hãy gạt bật <strong className="text-purple-700 dark:text-purple-400">"Cho phép từ nguồn này" (Allow from this source)</strong> cho Chrome/Cốc Cốc rồi bấm Cài đặt.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    4
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-1.5">
                      <span>Cấu hình Chống Tắt Ngầm & Chuông Báo (Cực kỳ quan trọng)</span>
                    </p>
                    <div className="space-y-1 text-amber-800 dark:text-amber-300 leading-relaxed">
                      <p>
                        • <strong>Chống tắt ngầm</strong>: Vào <em>Cài đặt điện thoại ➔ Ứng dụng ➔ Smart Teacher ➔ Pin ➔ Chọn "Không hạn chế" (Unrestricted)</em> để hệ điều hành không tự động tắt chuông báo tiết khi tắt màn hình.
                      </p>
                      <p>
                        • <strong>Màn hình khóa (Đồng hồ bục giảng)</strong>: Bật <em>"Cho phép thông báo trên màn hình khóa"</em>. Khi đến giờ dạy, điện thoại sẽ hiển thị đồng hồ đếm ngược to rõ ngay cả khi khóa máy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: IOS / IPHONE & IPAD ================= */}
          {selectedPlatform === "ios" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-purple-900 dark:text-purple-200">
                    Ứng dụng Web PWA Tối Ưu Cho iOS 16.4+
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                    Không Cần App Store
                  </span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                  Do chính sách Apple không hỗ trợ cài đặt tệp ngoài, giải pháp Web App (PWA) chính thức được Apple chứng nhận giúp Thầy/Cô cài ứng dụng lên màn hình iPhone/iPad mượt mà như app gốc, không chiếm bộ nhớ và tự động cập nhật.
                </p>
              </div>

              {/* 3 Steps */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  3 Bước Thêm Vào Màn Hình Chính iPhone/iPad:
                </h4>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Mở trình duyệt Safari trên iPhone / iPad
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Bắt buộc sử dụng trình duyệt <strong>Safari</strong> (mặc định của Apple), truy cập địa chỉ: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-purple-600">gvcncdsai.io.vn/app</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <span>Bấm nút Chia sẻ (Share)</span>
                      <Share className="w-4 h-4 text-indigo-600 inline" />
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Tìm biểu tượng ô vuông có mũi tên chỉ lên (ở cạnh dưới màn hình iPhone hoặc góc trên bên phải iPad).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                      <span>Chọn "Thêm vào MH chính" (Add to Home Screen)</span>
                      <PlusSquare className="w-4 h-4 text-emerald-600 inline" />
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Cuộn menu chia sẻ xuống dưới, chọn <strong>"Thêm vào MH chính"</strong> rồi nhấn <strong>"Thêm" (Add)</strong> ở góc trên bên phải. Biểu tượng Smart Teacher sẽ xuất hiện ngay ngoài màn hình điện thoại!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyAppUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedUrl ? "Đã sao chép link Safari!" : "Sao chép link mở trên Safari"}</span>
                </button>
                <a
                  href="/app"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <span>Mở Cổng Giáo Viên Ngay</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* ================= TAB 3: DESKTOP WINDOWS/MAC ================= */}
          {(selectedPlatform === "desktop" || selectedPlatform === "portable") && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200">
                      Bộ Cài Đặt Chính Thức Windows (.EXE) Có Logo
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                      v2.3.0 Chuẩn PE
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    Tự động tạo lối tắt (Shortcut) ra màn hình Desktop có Icon phần mềm đầy đủ, chuông Crystal Chime và cửa sổ thu nhỏ (Mini PiP).
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <a
                    href="/downloads/SmartTeacherSchedule_Setup_v2.3.0.exe"
                    download="SmartTeacherSchedule_Setup_v2.3.0.exe"
                    onClick={() => trackDownload('windows_setup', '2.3.0', 'Modal Windows Setup')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Bản Cài Đặt (.exe)</span>
                  </a>
                  <a
                    href="/downloads/SmartTeacherSchedule_v2.3.0_Portable.exe"
                    download="SmartTeacherSchedule_v2.3.0_Portable.exe"
                    onClick={() => trackDownload('windows_portable', '2.3.0', 'Modal Windows Portable')}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-bold transition-all shrink-0 cursor-pointer"
                    title="Chạy trực tiếp không cần cài đặt"
                  >
                    <span>Bản Portable</span>
                  </a>
                </div>
              </div>

              {/* 3 Steps */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  3 Bước Cài Đặt Dễ Dàng Trên Máy Tính Windows:
                </h4>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Tải tệp cài đặt chính thức .exe
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Bấm nút <strong className="text-indigo-600">"Tải Bản Cài Đặt (.exe)"</strong> ở trên để tải file <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold">SmartTeacherSchedule_Setup_v2.3.0.exe</code> về máy tính.
                    </p>
                  </div>
                </div>


                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Nhấp đúp mở file để cài đặt tự động
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Mở file vừa tải về ➔ Chọn thư mục cài đặt ➔ Nhấn <strong>"Install" (Cài đặt)</strong>. Trình cài đặt NSIS sẽ tự động tạo biểu tượng logo phần mềm trên màn hình Desktop và Start Menu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Mở biểu tượng trên màn hình & Tự động cập nhật
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Thầy cô mở biểu tượng <strong className="text-emerald-700 dark:text-emerald-400">Smart Teacher Schedule AI</strong> ngoài màn hình. Phần mềm có cơ chế Auto-Update tự động kiểm tra bản phát hành mới nhất mỗi khi khởi động.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Mẹo giảng dạy với Cửa sổ thu nhỏ bục giảng (Mini PiP):</span>
                </p>
                <p className="leading-relaxed">
                  Khi trình chiếu bài giảng PowerPoint, Thầy/Cô chỉ cần bấm nút <em>"Cửa sổ thu nhỏ"</em> ở góc trên ứng dụng. Đồng hồ đếm ngược ca dạy sẽ nổi đè lên góc màn hình trình chiếu, giúp quản lý thời gian giảng dạy cực kỳ chuyên nghiệp!
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 4: WEB APP PWA ================= */}
          {selectedPlatform === "web" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-rose-900 dark:text-rose-200">
                    Cài Đặt Web App PWA Tức Thì (Không Cần Tải Tệp)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-300">
                    Online & Offline
                  </span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  Công nghệ Progressive Web App (PWA) cho phép cài ứng dụng trực tiếp từ trình duyệt Google Chrome, Microsoft Edge, Cốc Cốc lên thanh tác vụ máy tính hoặc màn hình điện thoại mà không tốn dung lượng ổ đĩa.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Cách Cài Đặt Trực Tiếp Từ Trình Duyệt:
                </h4>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Mở địa chỉ Cổng Giáo Viên trên trình duyệt
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Sử dụng <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong> trên máy tính, hoặc trình duyệt trên điện thoại và truy cập <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold text-rose-600">gvcncdsai.io.vn/app</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Bấm biểu tượng Cài đặt trên thanh địa chỉ
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Nhìn vào góc phải thanh địa chỉ (URL) của trình duyệt ➔ Bấm vào biểu tượng <strong>"Cài đặt ứng dụng" (Install App / Máy tính có mũi tên xuống)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Xác nhận cài đặt và ghim thanh Taskbar
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Bấm <strong>"Cài đặt"</strong>. Ứng dụng sẽ mở ra trong cửa sổ độc lập không viền, tự động xuất hiện trong Start Menu và Taskbar của Windows để Thầy/Cô mở bất kỳ lúc nào kể cả khi không có mạng (nhờ IndexedDB Offline).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href="/app"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sử Dụng Web App Ngay (Đang Hoạt Động)</span>
                </a>
              </div>
            </div>
          )}

          {/* ================= TAB 5: GOOGLE PLAY AAB ================= */}
          {selectedPlatform === "googleplay" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-blue-900 dark:text-blue-200">
                      Gói Android App Bundle (AAB) Đã Ký Số Chính Thức
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                      Signed Release
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Chuẩn đóng gói tối ưu của Google Play Store, giảm 35% dung lượng và tương thích mọi kích cỡ thiết bị.
                  </p>
                </div>
                <a
                  href="/releases/SmartTeacherSchedule_v2.3.0_Release.aab"
                  download="SmartTeacherSchedule_v2.3.0_Release.aab"
                  onClick={() => trackDownload('android', '2.3.0', 'Modal Android AAB')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải Tệp AAB (~15.2 MB)</span>
                </a>
              </div>

              {/* Information Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Thông Tin Hướng Dẫn Kỹ Thuật:
                </h4>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Dành cho Bộ phận CNTT Nhà trường & Quản trị viên (MDM):</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tệp <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold text-blue-600">SmartTeacherSchedule_v2.3.0_Release.aab</code> được biên dịch trực tiếp từ mã nguồn Android Studio với chữ ký số phát hành chính thức (Release Keystore SHA-256).
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Phòng CNTT hoặc quản trị viên nhà trường có thể upload trực tiếp lên <strong>Google Play Console</strong> (Internal Testing / Closed Testing track) hoặc phân phối hàng loạt cho giáo viên thông qua <strong>Google Workspace for Education MDM</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <p className="font-bold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Khuyến nghị dành cho Thầy/Cô cá nhân:</span>
                  </p>
                  <p className="leading-relaxed">
                    Nếu Thầy/Cô muốn cài đặt ngay lên điện thoại mà không thông qua quản trị viên, vui lòng chọn tab <strong>"Android APK"</strong> hoặc <strong>"Bản iOS / iPhone"</strong> để cài đặt trực tiếp chỉ trong 30 giây!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Security & Privacy Guarantee Footer Note */}
          <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Bảo mật tuyệt đối:</strong> Ứng dụng hoạt động theo cơ chế lưu trữ cục bộ (Local-first IndexedDB). Mọi dữ liệu thời khóa biểu, điểm số và giáo án được mã hóa riêng trên thiết bị của Thầy Cô.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Hệ sinh thái Smart Teacher Schedule AI • Phiên bản 2.3.0
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Đã Hiểu
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
