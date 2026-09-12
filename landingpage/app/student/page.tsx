"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Award,
  ChevronRight,
  Search,
  Share2,
  FileText,
  HelpCircle,
  Gamepad2,
  Presentation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Smartphone,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';

interface EventItem {
  id: string | number;
  title: string;
  subject: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  sessionType?: string;
  notes?: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

interface StudentKudos {
  id: string;
  studentCode?: string;
  fullName: string;
  className: string;
  gender: string;
  kudosPoints: number;
}

export default function StudentPortalPage() {
  const [syncCode, setSyncCode] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string; grade?: string }[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [kudosList, setKudosList] = useState<StudentKudos[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'today' | 'week' | 'kudos'>('today');
  const [selectedEventForDoc, setSelectedEventForDoc] = useState<EventItem | null>(null);
  const [docModalTab, setDocModalTab] = useState<'mindmap' | 'slide' | 'game' | 'summary'>('mindmap');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Đọc tham số từ URL khi nạp trang
  useEffect(() => {
    setViewDate(todayStr);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code') || localStorage.getItem('smart_student_sync_code') || '';
      const classFromUrl = params.get('class') || localStorage.getItem('smart_student_class') || '';

      if (codeFromUrl) {
        setSyncCode(codeFromUrl);
        if (classFromUrl) setSelectedClass(classFromUrl);
        fetchClassData(codeFromUrl, classFromUrl);
      }
    }
  }, [todayStr]);

  // Tải dữ liệu lớp học từ API Portal
  const fetchClassData = async (code: string, cName?: string) => {
    if (!code) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const url = `/api/portal?code=${encodeURIComponent(code)}${cName ? `&class=${encodeURIComponent(cName)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Không tìm thấy dữ liệu lớp học.');
        setIsLoading(false);
        return;
      }

      setAvailableClasses(data.availableClasses || []);
      const matchedClass = data.currentClass || (data.availableClasses?.[0]?.name) || cName || '';
      setSelectedClass(matchedClass);
      setEvents(data.events || []);
      setKudosList(data.kudosLeaderboard || []);

      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_student_sync_code', code);
        if (matchedClass) localStorage.setItem('smart_student_class', matchedClass);
      }
    } catch (err: any) {
      setErrorMessage('Lỗi kết nối máy chủ: ' + (err?.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Đổi lớp học
  const handleSelectClass = (clsName: string) => {
    setSelectedClass(clsName);
    if (syncCode) fetchClassData(syncCode, clsName);
  };

  // Ca học hôm nay
  const todayEvents = useMemo(() => {
    return events.filter(e => e.date === todayStr);
  }, [events, todayStr]);

  // Ca học theo ngày chọn
  const filteredEvents = useMemo(() => {
    if (viewMode === 'today') {
      return events.filter(e => e.date === todayStr);
    }
    return events;
  }, [events, viewMode, todayStr]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">Student Space</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                  Cổng Học Sinh
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Xem thời khóa biểu, tài liệu bài học & thi đua rèn luyện</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={syncCode ? `/parent?code=${syncCode}` : '/parent'}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <span>Dành cho Phụ huynh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/app"
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold hidden md:flex items-center gap-1"
            >
              <span>Giáo viên</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Class Selection & Link Code Bar */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Lớp của bạn:</span>
            </span>

            {availableClasses.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableClasses.map(c => (
                  <button
                    key={c.id || c.name}
                    onClick={() => handleSelectClass(c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedClass.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-xl">
                {selectedClass || 'Chưa chọn lớp'}
              </span>
            )}
          </div>

          {/* Sync Code Input for direct lookup */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập mã lớp / trường..."
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-blue-500 w-36 sm:w-44"
            />
            <button
              onClick={() => fetchClassData(syncCode, selectedClass)}
              disabled={isLoading || !syncCode}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Xem TKB</span>
            </button>
          </div>
        </section>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Không tìm thấy dữ liệu thời khóa biểu</p>
              <p className="mt-0.5 opacity-90">{errorMessage}</p>
              <p className="mt-2 text-slate-400">Gợi ý: Thầy/Cô hãy bấm &ldquo;Đồng bộ Đám mây&rdquo; trên ứng dụng giáo viên để học sinh có thể tra cứu ngay.</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Hôm nay / Cả tuần / Bảng vàng thi đua) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'today'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tiết học Hôm nay ({todayEvents.length})</span>
            </button>

            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Cả tuần ({events.length})</span>
            </button>

            <button
              onClick={() => setViewMode('kudos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'kudos'
                  ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Bảng vàng thi đua Kudos</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
            Hôm nay: {todayStr}
          </span>
        </div>

        {/* TAB 1 & 2: TIẾT HỌC HÔM NAY / CẢ TUẦN */}
        {(viewMode === 'today' || viewMode === 'week') && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="font-bold text-slate-300 text-sm">
                  {viewMode === 'today' ? 'Hôm nay lớp không có tiết học nào' : 'Chưa có lịch học nào cho lớp này'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Bạn có thể chọn xem tab &ldquo;Cả tuần&rdquo; hoặc liên hệ Giáo viên để cập nhật thời khóa biểu mới nhất nhé.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((ev, idx) => {
                  const isToday = ev.date === todayStr;
                  return (
                    <div
                      key={ev.id || idx}
                      className={`bg-slate-900/80 border rounded-2xl p-4 shadow-lg transition-all hover:border-slate-600 flex flex-col justify-between gap-3 ${
                        isToday ? 'border-blue-500/40 shadow-blue-950/20' : 'border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{ev.startTime} - {ev.endTime}</span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ev.sessionType?.toLowerCase().includes('hành')
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {ev.sessionType || 'Lý thuyết'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-base text-white tracking-tight leading-snug">
                            {ev.subject}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1 font-mono text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{ev.room || 'Phòng học'}</span>
                            </span>
                            <span>•</span>
                            <span className="text-slate-400 font-mono">
                              Ngày {ev.date}
                            </span>
                          </div>
                        </div>

                        {ev.notes && (
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{ev.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Bar for Study Materials */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {ev.attachmentName ? (
                          <button
                            onClick={() => {
                              setSelectedEventForDoc(ev);
                              setDocModalTab('mindmap');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/50 hover:to-cyan-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Xem trước bài học (Slide / Mindmap)</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Chưa có tệp học liệu đính kèm
                          </span>
                        )}

                        <span className="text-[11px] font-mono text-slate-400">
                          Lớp {ev.className}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BẢNG VÀNG THI ĐUA NỀ NẾP KUDOS */}
        {viewMode === 'kudos' && (
          <div className="space-y-6">
            {/* Podium Top 3 */}
            <div className="bg-gradient-to-b from-amber-500/10 via-slate-900/80 to-slate-900/60 border border-amber-500/20 rounded-3xl p-6 shadow-xl text-center space-y-4">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Bảng Vinh Danh Nề Nếp & 5S Tuần Này</span>
                </span>
                <h3 className="text-lg font-black text-white">Gương Mẫu Lớp {selectedClass}</h3>
                <p className="text-xs text-slate-400">Điểm thi đua tích lũy từ tinh thần phát biểu, thực hành 5S xưởng và làm việc nhóm</p>
              </div>

              {kudosList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-2xl mx-auto">
                  {kudosList.slice(0, 3).map((st, i) => (
                    <div
                      key={st.id}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${
                        i === 0
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10 order-1 sm:order-2 sm:-translate-y-2'
                          : i === 1
                          ? 'bg-slate-800/80 border-slate-700 order-2 sm:order-1'
                          : 'bg-slate-800/80 border-slate-700 order-3'
                      }`}
                    >
                      <span className="text-2xl">{i === 0 ? '👑 🥇' : i === 1 ? '🥈' : '🥉'}</span>
                      <p className="font-bold text-sm text-white text-center leading-tight">{st.fullName}</p>
                      <span className="text-xs text-slate-400 font-mono">{st.studentCode || 'HS'}</span>
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-sm border border-amber-500/30">
                        +{st.kudosPoints}đ
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6">Chưa có dữ liệu khen thưởng nề nếp cho lớp này.</p>
              )}
            </div>

            {/* Full Leaderboard Table */}
            {kudosList.length > 3 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">Danh Sách Thi Đua Chi Tiết</h4>
                  <span className="text-xs font-mono text-slate-400">{kudosList.length} học sinh</span>
                </div>
                <div className="divide-y divide-slate-800 text-xs">
                  {kudosList.slice(3).map((st, idx) => (
                    <div key={st.id} className="p-3 px-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400 font-bold w-6 text-center">{idx + 4}</span>
                        <div>
                          <p className="font-semibold text-white">{st.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{st.studentCode || 'HS'}</p>
                        </div>
                      </div>
                      <span className="font-bold text-amber-400 font-mono">
                        +{st.kudosPoints}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Xem Trước Học Liệu Bài Dạy (Slide / Mindmap / Mini Game) */}
      {selectedEventForDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                    Học Liệu Số
                  </span>
                  <h3 className="font-bold text-sm text-white truncate max-w-md">
                    {selectedEventForDoc.subject}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  {selectedEventForDoc.attachmentName || 'Kế hoạch bài học'}
                </p>
              </div>
              <button
                onClick={() => setSelectedEventForDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Material Tabs */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
              <button
                onClick={() => setDocModalTab('mindmap')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                  docModalTab === 'mindmap'
                    ? 'text-cyan-400 border-cyan-400 bg-cyan-500/10'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sơ đồ tư duy Mindmap</span>
              </button>
              <button
                onClick={() => setDocModalTab('slide')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                  docModalTab === 'slide'
                    ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Slide thuyết trình</span>
              </button>
              <button
                onClick={() => setDocModalTab('game')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 border-b-2 ${
                  docModalTab === 'game'
                    ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Mini Game ôn tập</span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
              {docModalTab === 'mindmap' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                    <p className="font-bold text-cyan-300 text-sm">🧠 Sơ đồ cấu trúc nội dung bài học</p>
                    <p className="text-slate-400 text-xs">Hãy xem trước sơ đồ này để nắm chắc các nhánh kiến thức chính trước giờ vào lớp:</p>
                    <div className="font-mono bg-slate-950 p-4 rounded-xl text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800">
{`📌 CHỦ ĐỀ: ${selectedEventForDoc.subject}
├── 1. Khái niệm & Mục tiêu chuẩn đầu ra
│   ├── Nắm vững nguyên lý và thuật ngữ
│   └── Ứng dụng thực tiễn trong nghề nghiệp
├── 2. Quy trình thực hành & Thao tác an toàn
│   ├── Quy tắc an toàn BHLĐ & vệ sinh 5S xưởng
│   └── Các bước vận hành chuẩn xác
└── 3. Đánh giá kết quả & Bảng Rubric`}
                    </div>
                  </div>
                </div>
              )}

              {docModalTab === 'slide' && (
                <div className="space-y-3">
                  <p className="font-bold text-white text-sm">📊 Kịch bản Slide bài giảng chính:</p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="font-bold text-blue-400">Slide 1: Khởi động & Đặt vấn đề</p>
                      <p className="text-slate-400 mt-1">Quan sát tình huống thực tế và kích thích tư duy phát hiện vấn đề.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="font-bold text-blue-400">Slide 2: Hình thành kiến thức cốt lõi</p>
                      <p className="text-slate-400 mt-1">Phân tích tài liệu đối chiếu, các bước kỹ thuật chính xác.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <p className="font-bold text-blue-400">Slide 3: Luyện tập & Đánh giá Rubric</p>
                      <p className="text-slate-400 mt-1">Làm bài tập nhóm, đối chiếu tiêu chí chất lượng và vệ sinh 5S.</p>
                    </div>
                  </div>
                </div>
              )}

              {docModalTab === 'game' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Gamepad2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">Bộ câu hỏi trắc nghiệm thử thách</h4>
                    <p className="text-slate-400 max-w-sm mx-auto text-xs">
                      5 câu hỏi nhanh giúp bạn kiểm tra kiến thức trước giờ học để ghi điểm cộng Kudos!
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
                    <p className="font-bold text-slate-200">Câu 1: Nguyên tắc nào là bắt buộc trước khi vận hành máy móc thiết bị xưởng?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors text-slate-300">
                        A. Đeo găng tay vải rộng
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 font-semibold cursor-pointer">
                        B. Kiểm tra che chắn an toàn & mang kính BHLĐ (Đúng)
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors text-slate-300">
                        C. Khởi động máy ở tốc độ tối đa
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors text-slate-300">
                        D. Vừa ăn uống vừa thao tác
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedEventForDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
