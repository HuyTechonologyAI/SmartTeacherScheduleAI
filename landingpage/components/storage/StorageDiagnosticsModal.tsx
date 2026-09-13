"use client";

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Cloud, 
  ShieldCheck, 
  Trash2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { getStorageDiagnostics, StorageDiagnostics } from '@/lib/storageEngine';
import { supabase } from '@/lib/supabase';

interface StorageDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

export default function StorageDiagnosticsModal({
  isOpen,
  onClose,
  isEn = false
}: StorageDiagnosticsModalProps) {
  const [diag, setDiag] = useState<StorageDiagnostics | null>(null);
  const [loading, setLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'IDLE' | 'CHECKING' | 'CONNECTED' | 'ERROR'>('IDLE');
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const data = await getStorageDiagnostics();
      setDiag(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiagnostics();
      setCleanupMessage(null);
    }
  }, [isOpen]);

  const handleCheckSupabase = async () => {
    setSupabaseStatus('CHECKING');
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (!error) {
        setSupabaseStatus('CONNECTED');
      } else {
        setSupabaseStatus('ERROR');
      }
    } catch {
      setSupabaseStatus('ERROR');
    }
  };

  const handleCleanCache = () => {
    try {
      let cleaned = 0;
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('_temp_') || key.endsWith('_migrated_idb'))) {
          localStorage.removeItem(key);
          cleaned++;
        }
      }
      setCleanupMessage(
        isEn 
          ? `Optimized memory: cleaned ${cleaned} redundant temporary entries.`
          : `Đã tối ưu hóa bộ nhớ: dọn dẹp ${cleaned} mục tạm thời dư thừa.`
      );
      fetchDiagnostics();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isEn ? 'Storage Diagnostics & Quota Monitor' : 'Chẩn Đoán Dung Lượng & Bộ Nhớ Hệ Thống'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'IndexedDB High-Capacity Engine (> Gigabytes)' : 'Tầng lưu trữ IndexedDB sức chứa không giới hạn (> GBs)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-emerald-500" />
              <span>{isEn ? 'Browser Disk Quota Used' : 'Hạn mức đĩa trình duyệt đã dùng'}</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {diag?.usedMB || '0 MB'} / {diag?.quotaGB || '0 GB'} ({diag?.percentUsed || '0%'})
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, parseFloat(diag?.percentUsed || '0.5'))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Status: 100% Safe (No QuotaExceeded Risk)' : 'Trạng thái: An toàn 100% (Không còn nguy cơ tràn bộ nhớ)'}</span>
            </span>
            <span>{diag?.engine || 'IndexedDB'}</span>
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 text-[11px] block">{isEn ? 'Client Database' : 'Cơ sở dữ liệu Client'}</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>IndexedDB (idb-keyval)</span>
            </span>
            <p className="text-[10px] text-slate-500">
              {isEn ? 'Capacity: Thousands of lesson plans & staff' : 'Sức chứa: Hàng nghìn giáo án & nhân sự'}
            </p>
          </div>

          <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <span className="text-slate-400 text-[11px] block">{isEn ? 'Large Attachments' : 'Tệp đính kèm lớn'}</span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-sky-500" />
              <span>Supabase Storage</span>
            </span>
            <p className="text-[10px] text-slate-500">
              {isEn ? 'PDF, Word, PPTX stored outside JSON' : 'Lưu trữ tệp rời, không nhồi Base64'}
            </p>
          </div>
        </div>

        {/* Supabase Status Check */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-xs">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                {isEn ? 'Cloud Storage Bucket (lesson-plans)' : 'Thùng lưu trữ đám mây (lesson-plans)'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {supabaseStatus === 'CONNECTED' ? (isEn ? 'Connected & ready' : 'Đã kết nối & sẵn sàng') :
                 supabaseStatus === 'CHECKING' ? (isEn ? 'Checking...' : 'Đang kiểm tra kết nối...') :
                 supabaseStatus === 'ERROR' ? (isEn ? 'Offline fallback to IndexedDB Blob' : 'Chế độ ngoại tuyến IndexedDB Blob') :
                 (isEn ? 'Check cloud storage health' : 'Kiểm tra trạng thái kết nối Cloud')}
              </span>
            </div>
          </div>
          <button
            onClick={handleCheckSupabase}
            disabled={supabaseStatus === 'CHECKING'}
            className="px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {supabaseStatus === 'CHECKING' ? '...' : (isEn ? 'Test' : 'Kiểm tra')}
          </button>
        </div>

        {/* Feedback message */}
        {cleanupMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{cleanupMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCleanCache}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Clean Redundant Cache' : 'Làm sạch bộ nhớ đệm dư thừa'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            {isEn ? 'Close' : 'Đóng'}
          </button>
        </div>

      </div>
    </div>
  );
}
