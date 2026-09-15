"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Download, 
  Edit3, 
  Save, 
  X, 
  Sparkles, 
  RefreshCw, 
  Award,
  Sun, 
  Moon
} from 'lucide-react';
import { LessonSlideItem } from './lessonPlanAi';
import { speakVietnamese, stopSpeaking, PEDAGOGICAL_VOICES } from '@/lib/voiceAiService';

interface InteractiveSlidePlayerProps {
  slides: LessonSlideItem[];
  lessonTitle: string;
  subject: string;
  className?: string;
  teacherName?: string;
  schoolName?: string;
  onUpdateSlides?: (newSlides: LessonSlideItem[]) => void;
  onExportPptx?: () => Promise<void>;
  isExportingPptx?: boolean;
}

export function InteractiveSlidePlayer({
  slides,
  lessonTitle,
  subject,
  className = 'Lớp 12',
  teacherName = 'Giáo viên bộ môn',
  schoolName = 'Trường THPT',
  onUpdateSlides,
  onExportPptx,
  isExportingPptx = false
}: InteractiveSlidePlayerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<'hoaimy' | 'namminh' | 'google' | 'auto'>('hoaimy');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBullets, setEditBullets] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const totalSlides = slides?.length || 0;
  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Initialize edit form when slide changes
  useEffect(() => {
    if (activeSlide) {
      setEditTitle(activeSlide.title);
      setEditBullets([...activeSlide.bulletPoints]);
      setEditNotes(activeSlide.speakerNotes || '');
    }
  }, [currentSlideIndex, activeSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides, isEditing, isFullscreen]);

  const goToPrevSlide = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setCurrentSlideIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const goToNextSlide = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setCurrentSlideIndex(prev => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const toggleVoiceNarration = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const narrationText = activeSlide.speakerNotes || activeSlide.bulletPoints.join('. ');
    setIsSpeaking(true);
    speakVietnamese(narrationText, {
      voiceId: selectedVoiceId,
      rate: 0.95,
      pitch: 1.0,
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleSaveEdit = () => {
    if (!onUpdateSlides) {
      setIsEditing(false);
      return;
    }
    const updated = [...slides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      title: editTitle,
      bulletPoints: editBullets.filter(b => b.trim().length > 0),
      speakerNotes: editNotes
    };
    onUpdateSlides(updated);
    setIsEditing(false);
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400">
        Chưa có dữ liệu bài giảng slide thuyết trình.
      </div>
    );
  }

  // Determine slide visual decoration card
  const renderVisualDecorCard = () => {
    const isElectric = (subject || '').toLowerCase().includes('điện') || (lessonTitle || '').toLowerCase().includes('ôm') || (lessonTitle || '').toLowerCase().includes('ohm');
    const isEngine = (subject || '').toLowerCase().includes('động cơ') || (lessonTitle || '').toLowerCase().includes('piston') || (lessonTitle || '').toLowerCase().includes('kỳ');
    const isMachining = (subject || '').toLowerCase().includes('tiện') || (subject || '').toLowerCase().includes('cơ khí') || (lessonTitle || '').toLowerCase().includes('cắt gọt');

    if (currentSlideIndex === 0) {
      return (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/40 text-center space-y-3 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-2xl mx-auto">
            {isElectric ? '⚡' : isEngine ? '⚙️' : isMachining ? '🔧' : '🎓'}
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30 uppercase">
              CHUẨN GDPT 2018
            </span>
            <h4 className="text-white font-bold text-xs mt-1.5">{subject}</h4>
            <p className="text-[11px] text-slate-400">{className} • {schoolName}</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-medium">
            GV: {teacherName}
          </div>
        </div>
      );
    }

    if (currentSlideIndex === 1) {
      return (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-2.5 shadow-lg text-xs">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold border-b border-emerald-500/20 pb-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>4 KHUNG NĂNG LỰC:</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="p-1.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-200">
              📖 <strong>Kiến thức:</strong> Bản chất quy luật
            </div>
            <div className="p-1.5 rounded bg-sky-950/30 border border-sky-800/40 text-sky-200">
              ⚙️ <strong>Kỹ năng:</strong> Đọc sơ đồ & Thao tác
            </div>
            <div className="p-1.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200">
              💻 <strong>Năng lực số:</strong> Mô phỏng số hóa
            </div>
            <div className="p-1.5 rounded bg-purple-950/30 border border-purple-800/40 text-purple-200">
              ⭐ <strong>Phẩm chất:</strong> Kỷ luật & An toàn 5S
            </div>
          </div>
        </div>
      );
    }

    // Default pedagogical highlights card
    return (
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30 space-y-2 shadow-lg text-xs">
        <div className="flex items-center gap-1.5 text-sky-300 font-bold border-b border-sky-500/20 pb-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>ĐIỂM NHẤN SƯ PHẠM</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed italic">
          "{activeSlide.visualSuggestion || 'Kết nối nội dung với bài tập và tình huống thực tế cho học sinh.'}"
        </p>
        <div className="pt-2 border-t border-slate-800 text-[10px] text-sky-400 font-mono flex items-center justify-between">
          <span>TỈ LỆ 16:9 4K</span>
          <span className="text-emerald-400">EDITABLE OPENXML</span>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`space-y-3.5 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto' : ''}`}
    >
      {/* Top Toolbar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-sky-500/30 flex items-center justify-between gap-3 flex-wrap shadow-lg">
        {/* Left: Info badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                TRÌNH CHIẾU BÀI GIẢNG SỐ 16:9
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                SLIDE {currentSlideIndex + 1} / {totalSlides}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
              {lessonTitle} • {subject}
            </p>
          </div>
        </div>

        {/* Center: Teacher Voice Selector (Khắc phục Issue 2) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <label className="text-[11px] text-slate-300 font-medium">Giọng giảng:</label>
            <select
              value={selectedVoiceId}
              onChange={(e) => {
                setSelectedVoiceId(e.target.value as any);
                if (isSpeaking) {
                  stopSpeaking();
                  setIsSpeaking(false);
                }
              }}
              className="bg-slate-900 text-amber-300 text-xs font-bold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {PEDAGOGICAL_VOICES.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id === 'hoaimy' ? '👩‍🏫 ' : v.id === 'namminh' ? '👨‍🏫 ' : '🤖 '}
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Narrator Button */}
          <button
            type="button"
            onClick={toggleVoiceNarration}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
            title="Đọc thuyết minh slide này bằng giọng chuẩn sư phạm"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Dừng Giọng' : 'Phát Thuyết Minh'}</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            type="button"
            onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title={themeMode === 'dark' ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
          >
            {themeMode === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
          </button>

          {/* Edit Slide Button */}
          {onUpdateSlides && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Chỉnh sửa nội dung slide này"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
              <span>Sửa Slide</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
            title="Trình chiếu toàn màn hình (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* 1-Click Export PPTX */}
          {onExportPptx && (
            <button
              type="button"
              disabled={isExportingPptx}
              onClick={onExportPptx}
              className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer ${
                isExportingPptx ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isExportingPptx ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPptx ? 'Đang tạo...' : 'Tải .PPTX'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 16:9 Presentation Canvas Screen */}
      <div 
        className={`relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 transition-all shadow-2xl flex flex-col justify-between p-6 sm:p-8 ${
          themeMode === 'dark'
            ? 'bg-gradient-to-br from-slate-950 via-[#0a1128] to-slate-900 border-sky-500/40 text-white'
            : 'bg-gradient-to-br from-white via-slate-50 to-sky-50 border-sky-300 text-slate-900'
        }`}
      >
        {/* Top Header Banner in Canvas */}
        <div className="flex items-center justify-between border-b pb-3 border-sky-500/20">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-bold uppercase tracking-wider">
              {subject}
            </span>
            <span className={`text-xs font-semibold ${themeMode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              {lessonTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-sky-400 font-mono text-[11px] font-bold border border-sky-500/30">
              TRANG {currentSlideIndex + 1} / {totalSlides}
            </span>
          </div>
        </div>

        {/* Slide Body: 2 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-center">
          {/* Left Column (8 cols): Title & Structured Content */}
          <div className="md:col-span-8 space-y-3.5">
            <h2 className={`text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug ${
              themeMode === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {activeSlide.title}
            </h2>

            <div className="space-y-2.5">
              {activeSlide.bulletPoints.map((bp, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                    themeMode === 'dark'
                      ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                      : 'bg-white/80 border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <span className="text-sky-400 font-bold shrink-0 mt-0.5">
                    {i === 0 ? '🎯' : i === 1 ? '📌' : i === 2 ? '⚙️' : '💡'}
                  </span>
                  <p className="leading-relaxed">{bp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (4 cols): Dynamic Visual Decorative Card */}
          <div className="md:col-span-4 flex flex-col justify-center">
            {renderVisualDecorCard()}
          </div>
        </div>

        {/* Canvas Footer Bar */}
        <div className="flex items-center justify-between border-t pt-2.5 border-sky-500/20 text-[10px] sm:text-xs">
          <span className={themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
            🏫 {schoolName} • Giáo viên: <strong>{teacherName}</strong>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">● Chuẩn GDPT 2018</span>
            <span className={themeMode === 'dark' ? 'text-slate-500' : 'text-slate-400'}>|</span>
            <span className={themeMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
              Bản quyền Huy Technology AI
            </span>
          </div>
        </div>

        {/* Large Navigation Arrow Overlays */}
        <button
          type="button"
          disabled={currentSlideIndex === 0}
          onClick={goToPrevSlide}
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-sky-600 text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xl ${
            currentSlideIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
          }`}
          title="Slide trước (Phím ←)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          disabled={currentSlideIndex === totalSlides - 1}
          onClick={goToNextSlide}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-sky-600 text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xl ${
            currentSlideIndex === totalSlides - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
          }`}
          title="Slide kế tiếp (Phím → / Phím Space)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Speaker Notes Drawer (Collapsible) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-xs space-y-2 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>🗣️ LỜI GIẢNG GIÁO VIÊN (SPEAKER NOTES)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              (Hiển thị trên màn hình phụ của giáo viên)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSpeakerNotes(prev => !prev)}
            className="text-[10px] text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
          >
            {showSpeakerNotes ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>

        {showSpeakerNotes && (
          <p className="text-slate-200 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-slate-800 font-medium">
            "{activeSlide.speakerNotes || 'Giáo viên nhấn mạnh các trọng tâm kiến thức và đặt câu hỏi gợi mở cho học sinh.'}"
          </p>
        )}
      </div>

      {/* Slide Thumbnails Navigation Carousel */}
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
          <span>DANH SÁCH 8 SLIDE TRÌNH CHIẾU:</span>
          <span>Nhấp chuột vào slide để chuyển nhanh</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.slideNumber}
              type="button"
              onClick={() => {
                stopSpeaking();
                setIsSpeaking(false);
                setCurrentSlideIndex(idx);
              }}
              className={`p-2 rounded-xl text-left transition-all border cursor-pointer relative ${
                currentSlideIndex === idx
                  ? 'bg-sky-600/30 border-sky-400 shadow-lg shadow-sky-600/20 scale-105'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span className={`text-[9px] font-bold block ${
                currentSlideIndex === idx ? 'text-sky-300' : 'text-slate-500'
              }`}>
                SLIDE {s.slideNumber}
              </span>
              <p className={`text-[10px] font-semibold truncate ${
                currentSlideIndex === idx ? 'text-white' : 'text-slate-300'
              }`}>
                {s.title.replace(/^BÀI DẠY:\s*/i, '').replace(/^HOẠT ĐỘNG \d+:\s*/i, '')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Inline Slide Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/40 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-sky-400" />
                <span>Chỉnh Sửa Nội Dung Slide {currentSlideIndex + 1}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Tiêu đề slide:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Nội dung trình chiếu (Mỗi dòng 1 ý):</label>
                <textarea
                  rows={4}
                  value={editBullets.join('\n')}
                  onChange={(e) => setEditBullets(e.target.value.split('\n'))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Lời giảng giáo viên (Speaker Notes):</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400 italic"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-600/30 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
