'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Tv,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Gamepad2,
  Clock,
  ListFilter,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { MiniGameQuestion, miniGameToTxt } from './lessonPlanAi';

interface InteractiveMiniGameProps {
  questions: MiniGameQuestion[];
  lessonTitle: string;
  subject?: string;
}

export const InteractiveMiniGame: React.FC<InteractiveMiniGameProps> = ({
  questions = [],
  lessonTitle,
  subject = 'Bộ môn'
}) => {
  // Chế độ xem: 'slide' (Trình chiếu từng câu trên lớp) | 'list' (Danh sách tất cả câu)
  const [viewMode, setViewMode] = useState<'slide' | 'list'>('slide');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedTxt, setCopiedTxt] = useState<boolean>(false);

  // Trạng thái mở đáp án cho từng câu hỏi (Mặc định: TẤT CẢ ĐỀU ẨN để chiếu cho học sinh)
  const [revealedMap, setRevealedMap] = useState<{ [id: number]: boolean }>({});

  // Lựa chọn tạm thời của học sinh (để thử chọn trước khi giáo viên bấm mở đáp án)
  const [selectedMap, setSelectedMap] = useState<{ [id: number]: string }>({});

  // Đồng hồ đếm ngược cho câu hỏi hiện tại trong chế độ Slide
  const currentQ = questions[currentIdx] || null;
  const initialTime = currentQ?.timeLimitSeconds || 30;
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Reset timer khi đổi câu hỏi
  useEffect(() => {
    if (currentQ) {
      setTimeLeft(currentQ.timeLimitSeconds || 30);
      setIsTimerRunning(false);
    }
  }, [currentIdx, currentQ]);

  // Bộ đếm ngược thời gian
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        Chưa có dữ liệu câu hỏi Mini Game.
      </div>
    );
  }

  // Chuyển đổi trạng thái mở đáp án
  const toggleReveal = (qId: number) => {
    setRevealedMap((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Chọn phương án trả lời
  const handleSelectOption = (qId: number, optKey: string) => {
    setSelectedMap((prev) => ({
      ...prev,
      [qId]: optKey
    }));
  };

  // Tải file .txt cho Kahoot / Quizizz
  const handleDownloadTxt = () => {
    const txt = miniGameToTxt(questions, lessonTitle);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MiniGame_${(lessonTitle || 'Bai_Hoc').replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyTxt = () => {
    const txt = miniGameToTxt(questions, lessonTitle);
    navigator.clipboard.writeText(txt);
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2000);
  };

  const currentRevealed = currentQ ? !!revealedMap[currentQ.id] : false;
  const currentSelected = currentQ ? selectedMap[currentQ.id] : '';

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-auto flex flex-col justify-between' : ''}`}>
      {/* THANH ĐIỀU KHIỂN & CHỨC NĂNG */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 backdrop-blur shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Đấu Trí Tương Tác Mini Game</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {questions.length} Câu Hỏi Chuẩn Sư Phạm
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Tách riêng câu hỏi và đáp án để giáo viên trình chiếu cho học sinh thảo luận và trả lời trực tiếp.
            </p>
          </div>
        </div>

        {/* CÁC NÚT TÁC VỤ */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chuyển chế độ: Slide vs List */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('slide')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'slide' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Trình Chiếu Trên Lớp</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Xem Toàn Bộ</span>
            </button>
          </div>

          {/* Nút Toàn màn hình */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
            }`}
            title="Trình chiếu trên màn hình lớn của lớp học"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'Thu Nhỏ' : 'Toàn Màn Hình'}</span>
          </button>

          {/* Sao chép câu hỏi */}
          <button
            type="button"
            onClick={handleCopyTxt}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedTxt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedTxt ? 'Đã Chép' : 'Chép Text'}</span>
          </button>

          {/* Tải file .txt cho Kahoot/Quizizz */}
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải File Kahoot (.txt)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 1: TRÌNH CHIẾU TỪNG CÂU TRÊN LỚP (SLIDE PRESENTATION MODE)          */}
      {/* ========================================================================= */}
      {viewMode === 'slide' && currentQ && (
        <div className="space-y-4">
          {/* THANH ĐIỀU HƯỚNG CÂU HỎI TRÊN LỚP */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu Trước</span>
            </button>

            {/* Các nút chuyển nhanh câu 1, 2, 3, 4 */}
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const isAct = idx === currentIdx;
                const isRev = !!revealedMap[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isAct
                        ? 'bg-purple-600 text-white scale-110 shadow-lg ring-2 ring-purple-400'
                        : isRev
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <span>Câu Tiếp Theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* BẢNG CÂU HỎI TRÌNH CHIẾU TÁCH RỜI CHUYÊN NGHIỆP */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-purple-500/40 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* 1. KHU VỰC CÂU HỎI PHÍA TRÊN (QUESTION BOARD) */}
            <div className="space-y-4 pb-6 border-b border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-extrabold text-xs tracking-wider shadow">
                    CÂU {currentIdx + 1} / {questions.length}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs">
                    {currentQ.bloomLevel.toUpperCase()}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>+{currentQ.points} Điểm</span>
                  </span>
                </div>

                {/* ĐỒNG HỒ ĐẾM NGƯỢC THỜI GIAN DÀNH CHO LỚP HỌC */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <div className={`px-3 py-1 rounded-xl font-mono font-extrabold text-sm flex items-center gap-1.5 transition-all ${
                    timeLeft <= 5 && timeLeft > 0
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse'
                      : timeLeft <= 10
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-700 text-slate-200'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{timeLeft}s</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`p-1.5 rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-all ${
                      isTimerRunning
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                    }`}
                    title={isTimerRunning ? 'Tạm dừng đếm ngược' : 'Bắt đầu đếm ngược'}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimeLeft(currentQ.timeLimitSeconds || 30);
                    }}
                    className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                    title="Đặt lại thời gian"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* NỘI DUNG CÂU HỎI CHỮ TO RÕ RÀNG */}
              <h3 className="text-lg sm:text-2xl font-bold text-white leading-relaxed tracking-wide">
                {currentQ.question}
              </h3>

              {/* Thông báo hết giờ nếu timer = 0 */}
              {timeLeft === 0 && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>ĐÃ HẾT THỜI GIAN SUY NGHĨ! Giáo viên chuẩn bị mở đáp án chính xác.</span>
                </div>
              )}
            </div>

            {/* 2. KHU VỰC CÁC PHƯƠNG ÁN LỰA CHỌN A, B, C, D (OPTIONS BOARD) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Chọn hoặc nhấn để đánh dấu phương án trả lời của học sinh:</span>
                <span className={currentRevealed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {currentRevealed ? '🟢 Đã công bố kết quả' : '🔒 Đang khóa đáp án (chờ học sinh trả lời)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {currentQ.options.map((opt, i) => {
                  const optLetter = opt.trim().charAt(0); // 'A', 'B', 'C', 'D'
                  const isCorrect = optLetter === currentQ.correctAnswer;
                  const isSelected = currentSelected === optLetter;

                  // TRẠNG THÁI HIỂN THỊ KHI ĐÃ MỞ ĐÁP ÁN vs CHƯA MỞ ĐÁP ÁN
                  let cardStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600';
                  let badgeStyle = 'bg-slate-700 text-slate-300';

                  if (currentRevealed) {
                    if (isCorrect) {
                      cardStyle = 'bg-emerald-500/20 border-2 border-emerald-500 text-white shadow-lg ring-2 ring-emerald-500/30 scale-[1.01]';
                      badgeStyle = 'bg-emerald-500 text-white';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'bg-rose-500/15 border border-rose-500/60 text-slate-300 opacity-60';
                      badgeStyle = 'bg-rose-500 text-white';
                    } else {
                      cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-40';
                      badgeStyle = 'bg-slate-800 text-slate-500';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-purple-500/20 border-2 border-purple-500 text-white shadow-md ring-2 ring-purple-500/30';
                    badgeStyle = 'bg-purple-600 text-white';
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optLetter)}
                      className={`p-4 sm:p-5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow ${badgeStyle}`}>
                          {optLetter}
                        </span>
                        <span className="text-sm sm:text-base font-medium leading-snug">
                          {opt.substring(2).trim() || opt}
                        </span>
                      </div>

                      {/* Huy hiệu chỉ dẫn */}
                      {currentRevealed && isCorrect && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-md shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ĐÁP ÁN ĐÚNG</span>
                        </span>
                      )}
                      {currentRevealed && isSelected && !isCorrect && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold shrink-0">
                          ✗ Chưa đúng
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. KHU VỰC TÁCH RỜI: BẢNG ĐIỀU KHIỂN & MỞ ĐÁP ÁN CỦA GIÁO VIÊN */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                  <span><strong>Quyền thao tác giáo viên:</strong> Nhấp vào nút bên cạnh để công bố đáp án cho học sinh sau khi thảo luận.</span>
                </div>

                {/* NÚT MỞ HOẶC ẨN ĐÁP ÁN */}
                <button
                  type="button"
                  onClick={() => toggleReveal(currentQ.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                    currentRevealed
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white animate-pulse'
                  }`}
                >
                  {currentRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{currentRevealed ? '🔒 Ẩn Lại Đáp Án' : '👁️ HIỆN ĐÁP ÁN & GIẢI THÍCH'}</span>
                </button>
              </div>

              {/* HỘP GIẢI THÍCH SƯ PHẠM (CHỈ XUẤT HIỆN KHI ĐÃ MỞ ĐÁP ÁN) */}
              {currentRevealed && (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/40 text-xs sm:text-sm text-slate-200 space-y-2 animate-fade-in shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>💡 HƯỚNG DẪN & GIẢI THÍCH SƯ PHẠM CHI TIẾT:</span>
                  </div>
                  <p className="leading-relaxed pl-6 text-slate-300">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 2: DANH SÁCH TOÀN BỘ CÂU HỎI (ALL QUESTIONS LIST MODE)             */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4 animate-fade-in">
          {questions.map((q, idx) => {
            const isRev = !!revealedMap[q.id];
            const sel = selectedMap[q.id];

            return (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-md transition-all"
              >
                {/* Header câu hỏi */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs">
                      CÂU {idx + 1}
                    </span>
                    <span className="text-xs text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20 font-semibold">
                      {q.bloomLevel.toUpperCase()}
                    </span>
                    <span className="text-xs text-amber-400 font-mono">
                      ⏱️ {q.timeLimitSeconds}s • 🏆 {q.points}đ
                    </span>
                  </div>

                  {/* Nút mở đáp án từng câu */}
                  <button
                    type="button"
                    onClick={() => toggleReveal(q.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isRev
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                    }`}
                  >
                    {isRev ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isRev ? 'Ẩn đáp án' : 'Hiện đáp án'}</span>
                  </button>
                </div>

                {/* Câu hỏi */}
                <p className="text-base font-semibold text-white leading-relaxed">
                  {q.question}
                </p>

                {/* 4 phương án */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const optKey = opt.trim().charAt(0);
                    const isCorrect = optKey === q.correctAnswer;
                    const isSelected = sel === optKey;

                    let cStyle = 'bg-slate-800/60 border-slate-700 text-slate-300';
                    if (isRev) {
                      if (isCorrect) {
                        cStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        cStyle = 'bg-rose-500/15 border-rose-500/40 text-slate-400';
                      } else {
                        cStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-50';
                      }
                    } else if (isSelected) {
                      cStyle = 'bg-purple-500/20 border-purple-500 text-purple-200 font-semibold';
                    }

                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(q.id, optKey)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${cStyle}`}
                      >
                        <span>{opt}</span>
                        {isRev && isCorrect && (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                            ✓ Đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Giải thích sư phạm */}
                {isRev && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-300 space-y-1 animate-fade-in">
                    <strong className="text-emerald-300 block">💡 Giải thích sư phạm:</strong>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};