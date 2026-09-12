"use client";

import React, { useMemo } from "react";
import {
  Clock, MapPin, Users, BookOpen, AlertCircle, CheckCircle2,
  Sparkles, Calendar, ArrowRight, ShieldCheck, HelpCircle, FileText
} from "lucide-react";

export interface NextClassInfo {
  id?: string;
  title: string;
  subject: string;
  className: string;
  room: string;
  startTime: string;
  endTime: string;
  date: string;
  sessionType?: string;
  notes?: string;
}

interface TodayCommandCenterProps {
  todayEvents: NextClassInfo[];
  allTodayCount: number;
  completedCount: number;
  totalStudentsPresent?: number;
  totalStudentsAbsent?: number;
  onQuickAttendance?: (classInfo: NextClassInfo) => void;
  onOpenPedagogyAI?: (subject: string, topic?: string) => void;
  onSwitchToCalendar?: () => void;
}

export default function TodayCommandCenter({
  todayEvents,
  allTodayCount,
  completedCount,
  totalStudentsPresent = 0,
  totalStudentsAbsent = 0,
  onQuickAttendance,
  onOpenPedagogyAI,
  onSwitchToCalendar
}: TodayCommandCenterProps) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const { nextClass, minutesUntilNext, currentClass } = useMemo(() => {
    let upcoming: NextClassInfo | null = null;
    let ongoing: NextClassInfo | null = null;
    let minDiff = Infinity;

    for (const ev of todayEvents) {
      const [sh, sm] = ev.startTime.split(":").map(Number);
      const [eh, em] = (ev.endTime || "17:00").split(":").map(Number);
      const startM = (sh || 0) * 60 + (sm || 0);
      const endM = (eh || 0) * 60 + (em || 0);

      if (currentMinutes >= startM && currentMinutes <= endM) {
        ongoing = ev;
      } else if (startM > currentMinutes) {
        const diff = startM - currentMinutes;
        if (diff < minDiff) {
          minDiff = diff;
          upcoming = ev;
        }
      }
    }

    return {
      nextClass: upcoming,
      minutesUntilNext: minDiff === Infinity ? null : minDiff,
      currentClass: ongoing
    };
  }, [todayEvents, currentMinutes]);

  const prepList = useMemo(() => {
    const target = currentClass || nextClass;
    if (!target) return [];
    const isPractice = target.sessionType?.toLowerCase().includes("hành") || target.title?.toLowerCase().includes("thực hành");
    return [
      { id: "1", title: "Kế hoạch bài dạy (Giáo án chuẩn CV 5512)", done: true },
      { id: "2", title: isPractice ? "Kiểm tra thiết bị & an toàn thực hành 5S" : "Sách giáo khoa & Bài trình chiếu (Slide)", done: true },
      { id: "3", title: "Danh sách lớp & Sổ điểm danh 1 chạm", done: false },
      { id: "4", title: isPractice ? "Phiếu rubric đánh giá thực hành" : "Trò chơi / Hoạt động khởi động 5 phút đầu giờ", done: false }
    ];
  }, [currentClass, nextClass]);

  const remainingClasses = Math.max(0, allTodayCount - completedCount);

  return (
    <div className="space-y-4 mb-6 animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/60 border border-rose-200/80 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Trung Tâm Điều Hành Giảng Dạy
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>

            {currentClass ? (
              <div>
                <div className="text-xs text-amber-700 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  Đang trong giờ giảng:
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {currentClass.title || currentClass.subject} • <span className="text-rose-600">Lớp {currentClass.className}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 mt-2">
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {currentClass.startTime} - {currentClass.endTime}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Phòng: {currentClass.room || "Phòng học chính"}
                  </span>
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs text-rose-700 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                    {currentClass.sessionType || "Lý thuyết"}
                  </span>
                </div>
              </div>
            ) : nextClass ? (
              <div>
                <div className="text-xs text-rose-600 font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Tiết dạy kế tiếp (còn {minutesUntilNext} phút nữa):
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {nextClass.title || nextClass.subject} • <span className="text-rose-600">Lớp {nextClass.className}</span>
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 mt-2">
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    Bắt đầu lúc: <strong>{nextClass.startTime}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Phòng: {nextClass.room || "Chưa xếp phòng"}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Hôm Nay Đã Hoàn Thành Toàn Bộ Ca Dạy!</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Thầy/Cô đã kết thúc các tiết dạy trong ngày an toàn và trọn vẹn. Chúc Thầy/Cô có buổi tối thư thái!
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-center px-3 py-1.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900">{allTodayCount}</div>
              <div className="text-[10px] text-slate-500 font-medium">Tổng Tiết</div>
            </div>
            <div className="text-center px-3 py-1.5 border-x border-slate-100">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">{completedCount}</div>
              <div className="text-[10px] text-slate-500 font-medium">Đã Dạy</div>
            </div>
            <div className="text-center px-3 py-1.5">
              <div className="text-xl sm:text-2xl font-black text-rose-600">{remainingClasses}</div>
              <div className="text-[10px] text-slate-500 font-medium">Còn Lại</div>
            </div>
          </div>
        </div>

        {(currentClass || nextClass) && (
          <div className="mt-5 pt-4 border-t border-rose-100/80 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                  Nhiệm vụ chuẩn bị lên lớp:
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Chuẩn hóa CV 5512</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {prepList.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200/60 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <button
                onClick={() => {
                  const target = currentClass || nextClass;
                  if (target && onQuickAttendance) onQuickAttendance(target);
                }}
                className="flex-1 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
              >
                <Users className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Mở Điểm Danh Lớp Nhanh</span>
              </button>

              <button
                onClick={() => {
                  const target = currentClass || nextClass;
                  if (target && onOpenPedagogyAI) onOpenPedagogyAI(target.subject, target.title);
                }}
                className="flex-1 p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-rose-600 group-hover:rotate-12 transition-transform" />
                <span>AI Soạn Giáo Án / Khởi Động</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}