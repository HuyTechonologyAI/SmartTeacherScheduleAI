"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  Plus, 
  Trash2, 
  Presentation, 
  Sparkles, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { LessonSlideItem } from './lessonPlanAi';

interface SlideEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: LessonSlideItem[];
  initialSlideIndex?: number;
  onSaveSlides: (newSlides: LessonSlideItem[]) => void;
}

export function SlideEditorModal({
  isOpen,
  onClose,
  slides = [],
  initialSlideIndex = 0,
  onSaveSlides
}: SlideEditorModalProps) {
  const [editSlides, setEditSlides] = useState<LessonSlideItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isBulkBulletMode, setIsBulkBulletMode] = useState<boolean>(false);

  // Initialize and reset local copy
  useEffect(() => {
    if (slides && slides.length > 0) {
      setEditSlides(JSON.parse(JSON.stringify(slides)));
      const safeIdx = Math.max(0, Math.min(initialSlideIndex, slides.length - 1));
      setActiveIdx(safeIdx);
    }
  }, [slides, initialSlideIndex, isOpen]);

  if (!isOpen || !editSlides || editSlides.length === 0) return null;

  const currentSlide = editSlides[activeIdx] || editSlides[0];

  const handleUpdateTitle = (val: string) => {
    setEditSlides(prev => {
      const next = [...prev];
      next[activeIdx] = { ...next[activeIdx], title: val };
      return next;
    });
  };

  const handleUpdateBullet = (bulletIdx: number, val: string) => {
    setEditSlides(prev => {
      const next = [...prev];
      const newBullets = [...(next[activeIdx].bulletPoints || [])];
      newBullets[bulletIdx] = val;
      next[activeIdx] = { ...next[activeIdx], bulletPoints: newBullets };
      return next;
    });
  };

  const handleAddBullet = () => {
    setEditSlides(prev => {
      const next = [...prev];
      const currentBullets = next[activeIdx].bulletPoints || [];
      next[activeIdx] = { 
        ...next[activeIdx], 
        bulletPoints: [...currentBullets, 'Ý trình chiếu mới #' + (currentBullets.length + 1)] 
      };
      return next;
    });
  };

  const handleDeleteBullet = (bulletIdx: number) => {
    setEditSlides(prev => {
      const next = [...prev];
      const currentBullets = next[activeIdx].bulletPoints || [];
      if (currentBullets.length <= 1) return prev;
      const newBullets = currentBullets.filter((_, i) => i !== bulletIdx);
      next[activeIdx] = { ...next[activeIdx], bulletPoints: newBullets };
      return next;
    });
  };

  const handleBulkBulletsChange = (rawText: string) => {
    const lines = rawText.split('\n').map(l => l.replace(/^[•\-\*\d\.\)\s]+/, '').trim()).filter(l => l.length > 0);
    setEditSlides(prev => {
      const next = [...prev];
      next[activeIdx] = { ...next[activeIdx], bulletPoints: lines.length > 0 ? lines : ['Ý trọng tâm'] };
      return next;
    });
  };

  const handleUpdateNotes = (val: string) => {
    setEditSlides(prev => {
      const next = [...prev];
      next[activeIdx] = { ...next[activeIdx], speakerNotes: val };
      return next;
    });
  };

  const handleUpdateVisual = (val: string) => {
    setEditSlides(prev => {
      const next = [...prev];
      next[activeIdx] = { ...next[activeIdx], visualSuggestion: val };
      return next;
    });
  };

  const handleSaveAll = () => {
    onSaveSlides(editSlides);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-sky-500/40 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-fade-in text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Chỉnh Sửa Toàn Diện Bài Giảng Slide (16:9)</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-500/30">
                  {editSlides.length} Slide
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Thầy/Cô chọn slide cần sửa bên dưới để điều chỉnh tiêu đề, các ý trình chiếu và lời thuyết minh trước khi tải file .pptx
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Navigation Strip Tabs */}
        <div className="flex items-center gap-1.5 px-4 pt-3 border-b border-slate-800 overflow-x-auto shrink-0 bg-slate-950/40">
          {editSlides.map((s, idx) => {
            const isActive = activeIdx === idx;
            return (
              <button
                key={s.slideNumber || idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>Slide {idx + 1}</span>
                <span className={`text-[10px] truncate max-w-[90px] font-normal ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                  {s.title.replace(/^BÀI DẠY:\s*/i, '').replace(/^HOẠT ĐỘNG \d+:\s*/i, '')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Slide Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          
          {/* Active slide badge & quick switch */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-sky-500/30">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-mono font-bold text-xs border border-sky-500/40">
                SLIDE {activeIdx + 1} / {editSlides.length}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {activeIdx === 0 ? 'Trang bìa giới thiệu bài học' : activeIdx === 1 ? 'Khung mục tiêu & năng lực' : activeIdx === editSlides.length - 1 ? 'Tổng kết & Dặn dò' : 'Nội dung hoạt động sư phạm'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={activeIdx === 0}
                onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
              <button
                type="button"
                disabled={activeIdx === editSlides.length - 1}
                onClick={() => setActiveIdx(prev => Math.min(editSlides.length - 1, prev + 1))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 1. Slide Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-sky-300 text-xs flex items-center gap-1.5">
              <Presentation className="w-3.5 h-3.5" />
              <span>Tiêu đề Slide:</span>
            </label>
            <input
              type="text"
              value={currentSlide.title}
              onChange={(e) => handleUpdateTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-sky-500 shadow-inner"
              placeholder="VD: HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI..."
            />
          </div>

          {/* 2. Bullet Points Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sky-300 text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Nội dung các ý trình chiếu (Bullet Points hiển thị trên bảng):</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkBulletMode(!isBulkBulletMode)}
                  className="text-[11px] text-slate-400 hover:text-sky-300 underline cursor-pointer"
                >
                  {isBulkBulletMode ? 'Chuyển sang chỉnh từng ô' : 'Chỉnh nhanh toàn bộ (Nhiều dòng)'}
                </button>

                {!isBulkBulletMode && (
                  <button
                    type="button"
                    onClick={handleAddBullet}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm ý</span>
                  </button>
                )}
              </div>
            </div>

            {isBulkBulletMode ? (
              <div className="space-y-1">
                <textarea
                  rows={5}
                  value={currentSlide.bulletPoints.join('\n')}
                  onChange={(e) => handleBulkBulletsChange(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed font-mono focus:outline-none focus:border-sky-500 resize-none shadow-inner"
                  placeholder="Mỗi dòng là một ý trình chiếu..."
                />
                <p className="text-[10px] text-slate-400 italic">Mẹo: Mỗi dòng xuống hàng sẽ được tính là một ý gạch đầu dòng riêng trên slide.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(currentSlide.bulletPoints || []).map((bp, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 group focus-within:border-sky-500/60 transition-all">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {bIdx === 0 ? '🎯' : bIdx === 1 ? '📌' : bIdx === 2 ? '⚙️' : '💡'}
                    </span>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                      className="flex-1 bg-transparent border-none text-white text-xs focus:outline-none"
                      placeholder={'Nội dung ý ' + (bIdx + 1)}
                    />
                    {currentSlide.bulletPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBullet(bIdx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all cursor-pointer shrink-0 opacity-80 group-hover:opacity-100"
                        title="Xóa ý này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Speaker Notes Section (Voiceover narration) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Lời giảng giáo viên (Speaker Notes / Thuyết minh VietTTS):</span>
              </label>
              <span className="text-[10px] text-slate-400 italic">Hiển thị màn hình giáo viên và đọc khi bật giọng giảng AI</span>
            </div>
            <textarea
              rows={3}
              value={currentSlide.speakerNotes || ''}
              onChange={(e) => handleUpdateNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none text-xs leading-relaxed shadow-inner"
              placeholder="Nhập lời giải thích chi tiết, câu hỏi gợi mở của giáo viên cho học sinh khi chiếu slide này..."
            />
          </div>

          {/* 4. Visual Suggestion */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Gợi ý hình ảnh / Đồ họa sư phạm (Visual Suggestion):</span>
            </label>
            <input
              type="text"
              value={currentSlide.visualSuggestion || ''}
              onChange={(e) => handleUpdateVisual(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-teal-400"
              placeholder="Gợi ý sơ đồ mạch, hình ảnh thực tế hoặc hình minh họa kỹ thuật..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/70 rounded-b-2xl">
          <div className="text-xs text-slate-400">
            Đang chỉnh sửa: <strong className="text-white">Slide {activeIdx + 1}/{editSlides.length}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Tất Cả Slide</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
