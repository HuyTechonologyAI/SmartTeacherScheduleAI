"use client";

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Save,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Users,
  Award,
  BookOpen,
  Calendar,
  Share2,
  ShieldCheck
} from 'lucide-react';
import {
  ClassGradebook,
  StudentScoreRecord,
  AcademicLevel,
  ConductLevel,
  calculateSubjectAverage,
  evaluateAcademicLevelFromAverage,
  getStoredGradebook,
  saveStoredGradebook,
  exportClassGradebookToExcel
} from '@/lib/gradebookEngine';

interface ClassGradebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  subjectName?: string;
  isEn?: boolean;
}

export default function ClassGradebookModal({
  isOpen,
  onClose,
  className = 'Lớp 3A1',
  subjectName = 'Toán học',
  isEn = false
}: ClassGradebookModalProps) {
  const [gradebook, setGradebook] = useState<ClassGradebook | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectName);
  const [selectedSemester, setSelectedSemester] = useState<'Học kỳ I' | 'Học kỳ II' | 'Cả năm'>('Học kỳ I');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, className, selectedSubject, selectedSemester]);

  const loadData = async () => {
    const data = await getStoredGradebook(className, selectedSubject, selectedSemester);
    setGradebook(data);
  };

  if (!isOpen || !gradebook) return null;

  // Cập nhật điểm số của học sinh trong bảng
  const handleScoreChange = (
    studentId: string,
    field: 'reg0' | 'reg1' | 'reg2' | 'midterm' | 'final',
    valueStr: string
  ) => {
    let numVal: number | null = null;
    if (valueStr.trim() !== '') {
      const parsed = parseFloat(valueStr);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
        numVal = parsed;
      } else {
        return; // Không nhận giá trị ngoài 0 - 10
      }
    }

    setGradebook(prev => {
      if (!prev) return prev;
      const updatedRecords = prev.records.map(r => {
        if (r.studentId !== studentId) return r;

        const regCopy = [...r.regularScores];
        let mid = r.midtermScore;
        let fin = r.finalScore;

        if (field === 'reg0') regCopy[0] = numVal;
        if (field === 'reg1') regCopy[1] = numVal;
        if (field === 'reg2') regCopy[2] = numVal;
        if (field === 'midterm') mid = numVal;
        if (field === 'final') fin = numVal;

        const avg = calculateSubjectAverage(regCopy, mid, fin);
        const level = evaluateAcademicLevelFromAverage(avg);

        return {
          ...r,
          regularScores: regCopy,
          midtermScore: mid,
          finalScore: fin,
          averageScore: avg,
          academicLevel: level
        };
      });

      return {
        ...prev,
        records: updatedRecords
      };
    });
  };

  // Cập nhật mức rèn luyện (Hạnh kiểm)
  const handleConductChange = (studentId: string, conduct: ConductLevel) => {
    setGradebook(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        records: prev.records.map(r => r.studentId === studentId ? { ...r, conductLevel: conduct } : r)
      };
    });
  };

  // Cập nhật lời nhận xét của giáo viên
  const handleCommentsChange = (studentId: string, comments: string) => {
    setGradebook(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        records: prev.records.map(r => r.studentId === studentId ? { ...r, teacherComments: comments } : r)
      };
    });
  };

  // Lưu sổ điểm vào IndexedDB & LocalStorage (tự động đồng bộ sang Phụ huynh & Nhà trường)
  const handleSave = async () => {
    if (!gradebook) return;
    setIsSaving(true);
    await saveStoredGradebook(gradebook);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // 1-Click Xuất Excel
  const handleExportExcel = () => {
    if (!gradebook) return;
    exportClassGradebookToExcel(gradebook);
  };

  // Tính thống kê nhanh của lớp
  const totalStudents = gradebook.records.length;
  const validAvgs = gradebook.records.map(r => r.averageScore).filter((s): s is number => s !== null);
  const classGpa = validAvgs.length > 0 ? (validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(1) : '0.0';
  const totCount = gradebook.records.filter(r => r.academicLevel === 'Tốt').length;
  const khaCount = gradebook.records.filter(r => r.academicLevel === 'Khá').length;
  const datCount = gradebook.records.filter(r => r.academicLevel === 'Đạt').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl my-4 bg-white dark:bg-[#101726] border border-emerald-300 dark:border-emerald-900/60 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isEn ? "Smart Gradebook & Digital Transcripts (Circular 22)" : "Sổ Điểm & Học Bạ Điện Tử (Thông Tư 22/2021/TT-BGDĐT)"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-black">
                  Tự Động Tính ĐTB ✨
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isEn 
                  ? "Auto-calculates subject averages • Live 3-way sync to Parent & School portals • 1-click Excel export" 
                  : "Hệ số 1 - 2 - 3 chuẩn Bộ GD&ĐT • Tự động liên thông Cổng Phụ huynh & Báo cáo Nhà trường"}
              </p>
            </div>
          </div>

          {/* Action buttons & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              title="Xuất Sổ gọi tên và ghi điểm chuẩn Bộ GD&ĐT (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEn ? "Export Excel (.xlsx)" : "Xuất File Excel"}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Đang lưu..." : saveSuccess ? "Đã lưu thành công! ✅" : "Lưu & Đồng Bộ"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span>Lớp:</span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400">
                {className}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span>Môn học:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="Toán học">📐 Toán học</option>
                <option value="Tiếng Việt">✍️ Tiếng Việt / Ngữ văn</option>
                <option value="Tiếng Anh">🌍 Tiếng Anh</option>
                <option value="Khoa học tự nhiên">🔬 Khoa học tự nhiên</option>
                <option value="Lịch sử & Địa lý">📜 Lịch sử & Địa lý</option>
                <option value="Tin học">💻 Tin học</option>
                <option value="Giáo dục thể chất">⚽ Giáo dục thể chất</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <span>Học kỳ:</span>
              <select
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value as any)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option value="Học kỳ I">Học kỳ I</option>
                <option value="Học kỳ II">Học kỳ II</option>
                <option value="Cả năm">Cả năm học</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 flex-wrap font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px]">
              Sĩ số: {totalStudents} HS
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[11px]">
              ĐTB Lớp: {classGpa}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px]">
              Tốt: {totCount} | Khá: {khaCount} | Đạt: {datCount}
            </span>
          </div>
        </div>

        {/* Data Grid Body */}
        <div className="flex-1 overflow-auto p-4 text-xs">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-[11px]">
                  <th className="p-2.5 text-center w-10">STT</th>
                  <th className="p-2.5 w-28">Mã HS</th>
                  <th className="p-2.5 w-40">Họ và tên</th>
                  <th className="p-2.5 text-center w-16">Phái</th>
                  <th className="p-2.5 text-center w-16">ĐĐGtx 1 (Miệng)</th>
                  <th className="p-2.5 text-center w-16">ĐĐGtx 2 (15p)</th>
                  <th className="p-2.5 text-center w-16">ĐĐGtx 3 (15p)</th>
                  <th className="p-2.5 text-center w-20 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">ĐĐGgk (hs 2)</th>
                  <th className="p-2.5 text-center w-20 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200">ĐĐGck (hs 3)</th>
                  <th className="p-2.5 text-center w-20 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">ĐTB Môn</th>
                  <th className="p-2.5 text-center w-24">Mức đạt</th>
                  <th className="p-2.5 text-center w-24">Rèn luyện</th>
                  <th className="p-2.5 min-w-[180px]">Nhận xét của Giáo viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {gradebook.records.map((r, idx) => (
                  <tr key={r.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2 font-mono text-slate-600 dark:text-slate-400 text-[10px]">{r.studentCode}</td>
                    <td className="p-2 font-bold text-slate-900 dark:text-white whitespace-nowrap">{r.fullName}</td>
                    <td className="p-2 text-center text-slate-500">{r.gender}</td>

                    {/* ĐĐGtx 1 */}
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={r.regularScores[0] ?? ''}
                        onChange={e => handleScoreChange(r.studentId, 'reg0', e.target.value)}
                        className="w-12 px-1 py-1 text-center font-bold text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </td>

                    {/* ĐĐGtx 2 */}
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={r.regularScores[1] ?? ''}
                        onChange={e => handleScoreChange(r.studentId, 'reg1', e.target.value)}
                        className="w-12 px-1 py-1 text-center font-bold text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </td>

                    {/* ĐĐGtx 3 */}
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={r.regularScores[2] ?? ''}
                        onChange={e => handleScoreChange(r.studentId, 'reg2', e.target.value)}
                        className="w-12 px-1 py-1 text-center font-bold text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </td>

                    {/* ĐĐGgk (Giữa kỳ) */}
                    <td className="p-1.5 text-center bg-amber-50/40 dark:bg-amber-950/20">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={r.midtermScore ?? ''}
                        onChange={e => handleScoreChange(r.studentId, 'midterm', e.target.value)}
                        className="w-14 px-1 py-1 text-center font-black text-xs rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                    </td>

                    {/* ĐĐGck (Cuối kỳ) */}
                    <td className="p-1.5 text-center bg-rose-50/40 dark:bg-rose-950/20">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={r.finalScore ?? ''}
                        onChange={e => handleScoreChange(r.studentId, 'final', e.target.value)}
                        className="w-14 px-1 py-1 text-center font-black text-xs rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                      />
                    </td>

                    {/* ĐTB Môn */}
                    <td className="p-2 text-center bg-blue-50/40 dark:bg-blue-950/20">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {r.averageScore !== null ? r.averageScore : '--'}
                      </span>
                    </td>

                    {/* Mức học tập */}
                    <td className="p-2 text-center">
                      {r.academicLevel ? (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          r.academicLevel === 'Tốt'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
                            : r.academicLevel === 'Khá'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                            : r.academicLevel === 'Đạt'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
                        }`}>
                          {r.academicLevel}
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    {/* Mức rèn luyện */}
                    <td className="p-1.5 text-center">
                      <select
                        value={r.conductLevel}
                        onChange={e => handleConductChange(r.studentId, e.target.value as ConductLevel)}
                        className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <option value="Tốt">Tốt</option>
                        <option value="Khá">Khá</option>
                        <option value="Đạt">Đạt</option>
                        <option value="Chưa đạt">Chưa đạt</option>
                      </select>
                    </td>

                    {/* Nhận xét */}
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={r.teacherComments}
                        onChange={e => handleCommentsChange(r.studentId, e.target.value)}
                        placeholder="Nhập nhận xét sự tiến bộ của em..."
                        className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Điểm số sau khi Lưu sẽ tự động cập nhật ngay trên Cổng Phụ Huynh và Báo cáo Tổng kết Nhà trường.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            {isEn ? "Close" : "Đóng"}
          </button>
        </div>

      </div>
    </div>
  );
}
