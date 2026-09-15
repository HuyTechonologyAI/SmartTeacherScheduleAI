"use client";

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Cpu, Layers, Volume2, Video, Presentation, GitFork, ArrowUpRight } from 'lucide-react';
import { dispatchAiCentralHubTool, AiCentralHubDispatchRecommendation, AI_CENTRAL_HUB_TOOLS } from '../lib/aiCentralHubDispatcher';

interface AiCentralHubDispatcherCardProps {
  category: 'SLIDES' | 'MINDMAP' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'LESSON' | 'EXAM';
  lessonTitle: string;
  subject?: string;
  grade?: string;
  customPrompt?: string;
  className?: string;
}

export default function AiCentralHubDispatcherCard({
  category,
  lessonTitle,
  subject = 'Công nghệ',
  grade = '12',
  customPrompt = '',
  className = ''
}: AiCentralHubDispatcherCardProps) {
  const [copied, setCopied] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const dispatchResult: AiCentralHubDispatchRecommendation = dispatchAiCentralHubTool({
    category,
    lessonTitle,
    subject,
    grade,
    userPrompt: customPrompt
  });

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(dispatchResult.optimizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'SLIDES':
        return <Presentation className="w-4 h-4 text-sky-400" />;
      case 'MINDMAP':
        return <GitFork className="w-4 h-4 text-indigo-400" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-amber-400" />;
      case 'VOICE':
        return <Volume2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border-2 border-amber-500/40 shadow-xl space-y-3.5 ${className}`}>
      {/* Header Hub Badge */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
            {getCategoryIcon()}
            <span>AI CENTRAL HUB • HUYCNCDSAI.IO.VN</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
            TỰ ĐỘNG ĐIỀU PHỐI
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
            {dispatchResult.primaryTool.license}
          </span>
        </div>
      </div>

      {/* Main Selected AI Tool Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="md:col-span-2 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Công cụ Chủ Lực:</span>
              <span className="text-sky-400 underline decoration-sky-500/50 underline-offset-2">
                {dispatchResult.primaryTool.name}
              </span>
            </h4>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-semibold border border-sky-500/30">
              {dispatchResult.primaryTool.clusterName}
            </span>
            {dispatchResult.secondaryTool && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                Bổ trợ: {dispatchResult.secondaryTool.name}
              </span>
            )}
            {dispatchResult.voiceToolCompanion && (
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] border border-emerald-700">
                Giọng đọc: {dispatchResult.voiceToolCompanion.name}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 font-medium">
            {dispatchResult.primaryTool.headline}
          </p>

          <p className="text-[11px] text-emerald-400 italic">
            🎯 <strong>Cơ sở điều phối sư phạm:</strong> {dispatchResult.selectionReason}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
          <a
            href={dispatchResult.directHubLaunchUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
            title="Mở trực tiếp trên cổng Trung Tâm Điều Phối AI của huycncdsai.io.vn"
          >
            <span>Mở Trên AI Central Hub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-xs flex items-center justify-center gap-2 border border-indigo-400/40 transition-all cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép Prompt AI!' : 'Sao chép Prompt Tối Ưu'}</span>
          </button>
        </div>
      </div>

      {/* Accordion: Chi tiết Prompt Tối Ưu & Quy Trình 3 Bước */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={() => setShowPromptDetails(!showPromptDetails)}
          className="text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{showPromptDetails ? '▼ Ẩn kịch bản prompt & quy trình' : '▶ Xem trước câu lệnh Prompt chuyên biệt'}</span>
        </button>

        <span className="text-[10px] text-slate-500">
          Engine: {dispatchResult.primaryTool.supportedEngines.join(', ')}
        </span>
      </div>

      {showPromptDetails && (
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5 animate-fade-in">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              📝 Câu lệnh Prompt đã được tinh chỉnh cho {dispatchResult.primaryTool.name}:
            </span>
            <pre className="p-2.5 rounded-lg bg-black/60 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 border border-white/5">
              {dispatchResult.optimizedPrompt}
            </pre>
          </div>

          <div className="pt-1.5 border-t border-white/5">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">
              ⚡ 3 bước triển khai nhanh:
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
              {dispatchResult.executionSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
