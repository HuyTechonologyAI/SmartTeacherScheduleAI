"use client";

import React, { useState } from 'react';
import { Download, Volume2, VolumeX, Eye, Maximize2, Check, Sparkles, Shield, Cpu, Layers } from 'lucide-react';
import { TechnicalDiagramItem } from './lessonPlanAi';
import { speakVietnamese, stopSpeaking } from '@/lib/voiceAiService';

interface InteractiveTechnicalImagesProps {
  diagrams: TechnicalDiagramItem[];
  lessonTitle: string;
  subject: string;
}

export function InteractiveTechnicalImages({
  diagrams,
  lessonTitle,
  subject
}: InteractiveTechnicalImagesProps) {
  const [selectedStep, setSelectedStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [zoomDiagram, setZoomDiagram] = useState<TechnicalDiagramItem | null>(null);

  if (!diagrams || diagrams.length === 0) return null;

  const active = diagrams[selectedStep] || diagrams[0];

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = active.title + '. ' + active.description + '. Các thông số: ' + active.parameters.map(p => p.label + ': ' + p.value).join(', ') + '. Lưu ý an toàn: ' + active.keySafetyNotes;

    setIsSpeaking(true);
    speakVietnamese(textToSpeak, {
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleDownloadSvg = (diag: TechnicalDiagramItem) => {
    const blob = new Blob([diag.svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Anh_KyThuat_' + diag.step + '_' + lessonTitle.replace(/[^a-zA-Z0-9]/g, '_') + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs sm:text-sm">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-600/15 to-sky-600/20 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>🖼️ BỘ 4 ẢNH KỸ THUẬT CHU TRÌNH (COMFYUI AI HUB)</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              TỰ ĐỘNG THI CÔNG 100%
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Hệ thống AI Central Hub đã tự động sinh trọn bộ 4 ảnh vector kỹ thuật độ phân giải cao theo đúng chu trình bài học: <strong className="text-emerald-300">{lessonTitle}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSpeak}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? 'Dừng Giọng Đọc' : 'Nghe Thuyết Minh (VietTTS)'}</span>
          </button>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {diagrams.map((diag, idx) => (
          <button
            key={diag.step}
            type="button"
            onClick={() => {
              setSelectedStep(idx);
              if (isSpeaking) {
                stopSpeaking();
                setIsSpeaking(false);
              }
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
              selectedStep === idx
                ? 'bg-indigo-600/25 border-indigo-400/80 shadow-md ring-1 ring-indigo-400 text-white'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 font-bold">
                ẢNH {diag.step}/4
              </span>
              {selectedStep === idx && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <span className="font-bold text-xs line-clamp-1 text-slate-200">
              {diag.phase}
            </span>
          </button>
        ))}
      </div>

      {/* Main Active Diagram Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
              {active.phase}
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {active.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomDiagram(active)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              title="Phóng to toàn màn hình"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Phóng to</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadSvg(active)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Tải ảnh định dạng vector SVG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Vector (.svg)</span>
            </button>
          </div>
        </div>

        {/* SVG Graphic Box */}
        <div
          className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2 sm:p-4 shadow-inner flex justify-center cursor-zoom-in"
          onClick={() => setZoomDiagram(active)}
          title="Bấm để phóng to hình ảnh"
        >
          <div
            dangerouslySetInnerHTML={{ __html: active.svgContent }}
            className="w-full max-w-2xl"
          />
        </div>

        {/* Details & Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="md:col-span-2 space-y-2">
            <h5 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Thuyết Minh Quy Trình Sư Phạm:</span>
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {active.description}
            </p>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong>Lưu ý An Toàn & 5S:</strong> {active.keySafetyNotes}
              </div>
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h5 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Thông Số Kỹ Thuật (Params):</span>
            </h5>
            <div className="space-y-1.5">
              {active.parameters.map((param, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] pb-1 border-b border-white/5">
                  <span className="text-slate-400">{param.label}:</span>
                  <span className="font-mono text-emerald-300 font-bold">{param.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomDiagram && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomDiagram(null)}
        >
          <div
            className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 max-w-4xl w-full space-y-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {zoomDiagram.phase}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {zoomDiagram.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomDiagram(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: zoomDiagram.svgContent }}
              className="w-full flex justify-center py-2"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs">
              <p className="text-slate-400 italic">
                {zoomDiagram.description}
              </p>
              <button
                type="button"
                onClick={() => handleDownloadSvg(zoomDiagram)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Bản Gốc Vector (.svg)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
