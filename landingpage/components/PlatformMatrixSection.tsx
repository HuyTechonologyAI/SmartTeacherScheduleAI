"use client";

import React from "react";
import { Check, Minus, Smartphone, Monitor, Globe, Apple, ShieldCheck, Zap, Bell, WifiOff } from "lucide-react";

export default function PlatformMatrixSection() {
  const features = [
    {
      title: "Báo thức ca dạy chuông lớn (Bất chấp chế độ im lặng/pin)",
      android: "Chuông lớn toàn diện (Foreground Service)",
      desktop: "Thông báo hệ thống Windows Notification",
      web: "Thông báo Web Push / Web Audio",
      ios: "Thông báo PWA Web Push (iOS 16.4+)",
      highlight: true
    },
    {
      title: "Khả năng hoạt động Ngoại Tuyến (100% Offline)",
      android: true,
      desktop: true,
      web: true,
      ios: true,
      desc: "Không cần Internet vẫn tra cứu thời khóa biểu & danh sách lớp"
    },
    {
      title: "Trợ lý AI Soạn giáo án CV 5512 & Ma trận đề",
      android: true,
      desktop: true,
      web: true,
      ios: true,
      desc: "Tích hợp AI Gemini & Bộ quy tắc sư phạm chuẩn"
    },
    {
      title: "Quản lý Học sinh & Điểm danh 1 chạm",
      android: true,
      desktop: true,
      web: true,
      ios: true,
      desc: "Điểm cộng Kudos, ghi chú chuyên cần theo buổi"
    },
    {
      title: "Nhập danh sách học sinh từ file Excel (.xlsx) / Word (.docx)",
      android: true,
      desktop: true,
      web: true,
      ios: true,
      desc: "Trích xuất danh sách lớp tự động bằng thuật toán nhận diện cột"
    },
    {
      title: "Đồng bộ Đám mây Đa Nền Tảng (Supabase Cloud Sync)",
      android: true,
      desktop: true,
      web: true,
      ios: true,
      desc: "Đồng bộ tức thì giữa Điện thoại, Máy tính để bàn và Máy tính bảng"
    },
    {
      title: "Bảo mật Ghép Nối Thiết Bị & Khóa PIN Cá Nhân",
      android: true,
      desktop: true,
      web: true,
      ios: true,
      desc: "Mỗi thầy cô sở hữu mã ghép riêng, không lộ dữ liệu"
    },
    {
      title: "Cài đặt trực tiếp",
      android: "File APK (v1.6.0)",
      desktop: "File Setup (.exe / portable)",
      web: "Truy cập trực tiếp qua trình duyệt",
      ios: "PWA Safari (Thêm vào MH chính)",
      isInstall: true
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden bg-slate-900/40 border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hệ Sinh Thái Toàn Diện</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ma Trận Tính Năng Đa Nền Tảng
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Dù Thầy/Cô sử dụng điện thoại Android, máy tính Windows hay iPhone/iPad, Smart Teacher Schedule AI luôn mang lại trải nghiệm nhất quán, mượt mà và an toàn.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/10 glass-panel shadow-2xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th scope="col" className="py-5 px-6 font-bold text-white w-2/5">
                  Tính năng cốt lõi
                </th>
                <th scope="col" className="py-5 px-4 text-center font-bold text-emerald-400">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>Android App</span>
                  </div>
                </th>
                <th scope="col" className="py-5 px-4 text-center font-bold text-blue-400">
                  <div className="flex flex-col items-center gap-1">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <span>Windows Desktop</span>
                  </div>
                </th>
                <th scope="col" className="py-5 px-4 text-center font-bold text-indigo-400">
                  <div className="flex flex-col items-center gap-1">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    <span>Web App (PWA)</span>
                  </div>
                </th>
                <th scope="col" className="py-5 px-4 text-center font-bold text-purple-400">
                  <div className="flex flex-col items-center gap-1">
                    <Apple className="w-5 h-5 text-purple-400" />
                    <span>iPhone / iPad</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/30">
              {features.map((item, index) => (
                <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{item.title}</div>
                    {item.desc && <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {typeof item.android === "boolean" ? (
                      item.android ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <Minus className="w-5 h-5 text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-xs font-bold text-emerald-300 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        {item.android}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {typeof item.desktop === "boolean" ? (
                      item.desktop ? <Check className="w-5 h-5 text-blue-400 mx-auto" /> : <Minus className="w-5 h-5 text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-xs font-bold text-blue-300 bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-500/30">
                        {item.desktop}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {typeof item.web === "boolean" ? (
                      item.web ? <Check className="w-5 h-5 text-indigo-400 mx-auto" /> : <Minus className="w-5 h-5 text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                        {item.web}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {typeof item.ios === "boolean" ? (
                      item.ios ? <Check className="w-5 h-5 text-purple-400 mx-auto" /> : <Minus className="w-5 h-5 text-slate-600 mx-auto" />
                    ) : (
                      <span className="text-xs font-bold text-purple-300 bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-500/30">
                        {item.ios}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}