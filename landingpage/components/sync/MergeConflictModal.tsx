"use client";

import React, { useState } from 'react';
import { 
  GitMerge, 
  Laptop, 
  Cloud, 
  Sparkles, 
  Check, 
  ArrowRight, 
  X, 
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { ConflictItem, ResolutionChoice } from '@/lib/conflictResolver';

interface MergeConflictModalProps {
  isOpen: boolean;
  conflicts: ConflictItem[];
  onResolve: (resolvedItems: ConflictItem[]) => void;
  onCancel: () => void;
  isEn?: boolean;
}

export default function MergeConflictModal({
  isOpen,
  conflicts,
  onResolve,
  onCancel,
  isEn = false
}: MergeConflictModalProps) {
  const [items, setItems] = useState<ConflictItem[]>(conflicts);
  const [expandedId, setExpandedId] = useState<string | null>(conflicts[0]?.id || null);

  if (!isOpen || conflicts.length === 0) return null;

  const handleSetChoice = (id: string, choice: ResolutionChoice) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, chosenResolution: choice } : item));
  };

  const handleApplyAllChoice = (choice: ResolutionChoice) => {
    setItems(prev => prev.map(item => ({ ...item, chosenResolution: choice })));
  };

  const handleConfirm = () => {
    onResolve(items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#101726] border border-amber-300 dark:border-amber-900/60 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEn ? 'Offline Merge Conflict Detected' : 'Phát Hiện Xung Đột Dữ Liệu Ngoại Tuyến'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-black">
                  {items.length} {isEn ? 'items' : 'mục'}
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {isEn 
                  ? 'Both Local and Cloud data have diverged. Choose how you want to merge to prevent data loss.' 
                  : 'Dữ liệu trên máy và trên Đám mây đều có sửa đổi. Hãy chọn phương án hợp nhất an toàn để không mất thông tin.'}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Batch Action Bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400">
            {isEn ? 'Quick Apply All:' : 'Áp dụng nhanh cho toàn bộ:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleApplyAllChoice('SMART_MERGE')}
              className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEn ? 'Smart Merge All (Recommended)' : '✨ Hợp nhất Thông minh (Khuyên dùng)'}</span>
            </button>
            <button
              onClick={() => handleApplyAllChoice('KEEP_LOCAL')}
              className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all cursor-pointer"
            >
              {isEn ? 'Keep Local All' : 'Giữ bản trên máy'}
            </button>
            <button
              onClick={() => handleApplyAllChoice('KEEP_REMOTE')}
              className="px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-all cursor-pointer"
            >
              {isEn ? 'Keep Cloud All' : 'Chấp nhận Đám mây'}
            </button>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {items.map((conflict, idx) => {
            const isExpanded = expandedId === conflict.id;
            const currentChoice = conflict.chosenResolution || 'SMART_MERGE';

            return (
              <div 
                key={conflict.id}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#131b2e] shadow-xs"
              >
                {/* Accordion Title Bar */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : conflict.id)}
                  className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {conflict.title}
                      </h4>
                      {conflict.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {conflict.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      currentChoice === 'SMART_MERGE' 
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200' 
                        : currentChoice === 'KEEP_LOCAL'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                        : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200'
                    }`}>
                      {currentChoice === 'SMART_MERGE' ? (isEn ? 'Smart Merge' : 'Hợp nhất') :
                       currentChoice === 'KEEP_LOCAL' ? (isEn ? 'Keep Local' : 'Bản máy tính') : (isEn ? 'Keep Cloud' : 'Bản Đám mây')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Diff Comparison Body */}
                {isExpanded && (
                  <div className="p-4 space-y-3.5 border-t border-slate-100 dark:border-slate-800">
                    
                    {/* Side-by-Side Comparison Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      
                      {/* Left: Local */}
                      <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                        <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-100 dark:border-emerald-900/40 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Laptop className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Local Device Changes' : 'Bản sửa trên Máy tính này'}</span>
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          {conflict.divergentFields.map(diff => (
                            <div key={diff.fieldName} className="flex justify-between gap-2">
                              <span className="text-slate-500">{diff.fieldLabel}:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[150px]" title={diff.localValue}>
                                {diff.localValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Remote */}
                      <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 space-y-2">
                        <div className="flex items-center justify-between font-bold text-sky-800 dark:text-sky-300 border-b border-sky-100 dark:border-sky-900/40 pb-1.5">
                          <span className="flex items-center gap-1.5">
                            <Cloud className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Remote Cloud Changes' : 'Bản sửa trên Đám mây'}</span>
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          {conflict.divergentFields.map(diff => (
                            <div key={diff.fieldName} className="flex justify-between gap-2">
                              <span className="text-slate-500">{diff.fieldLabel}:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[150px]" title={diff.remoteValue}>
                                {diff.remoteValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Resolution Choice Radios */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-slate-500 font-bold">{isEn ? 'Choose for this item:' : 'Lựa chọn mục này:'}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSetChoice(conflict.id, 'SMART_MERGE')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                            currentChoice === 'SMART_MERGE'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          ✨ {isEn ? 'Smart Merge' : 'Hợp nhất'}
                        </button>
                        <button
                          onClick={() => handleSetChoice(conflict.id, 'KEEP_LOCAL')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                            currentChoice === 'KEEP_LOCAL'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          💻 {isEn ? 'Local' : 'Máy này'}
                        </button>
                        <button
                          onClick={() => handleSetChoice(conflict.id, 'KEEP_REMOTE')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                            currentChoice === 'KEEP_REMOTE'
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          ☁️ {isEn ? 'Cloud' : 'Đám mây'}
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isEn ? 'Cancel Sync' : 'Hủy đồng bộ'}
          </button>

          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isEn ? 'Apply Resolutions & Complete Sync' : 'Áp Dụng Lựa Chọn & Hoàn Tất Đồng Bộ'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
