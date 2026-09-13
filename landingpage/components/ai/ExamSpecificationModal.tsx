"use client";

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Printer,
  Check,
  X,
  Layers,
  Award,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  ExamPackage,
  ExamDurationType,
  generateExamSpecificationPackage,
  exportExamPackageToDocHtml,
  downloadWordExamDoc
} from '@/lib/examMatrixEngine';

interface ExamSpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  defaultSubject?: string;
  defaultGrade?: string;
  isEn?: boolean;
}

export default function ExamSpecificationModal({
  isOpen,
  onClose,
  defaultTopic = '',
  defaultSubject = 'Toán học',
  defaultGrade = 'Lớp 9',
  isEn = false
}: ExamSpecificationModalProps) {
  const [topic, setTopic] = useState(defaultTopic || 'Phương trình bậc hai & Định lý Vi-ét');
  const [subject, setSubject] = useState(defaultSubject);
  const [grade, setGrade] = useState(defaultGrade);
  const [schoolName, setSchoolName] = useState('TRƯỜNG THCS & THPT NGUYỄN TẤT THÀNH');
  const [departmentName, setDepartmentName] = useState('TỔ CHUYÊN MÔN KHOA HỌC TỰ NHIÊN');
  const [schoolYear, setSchoolYear] = useState('2025 - 2026');
  const [semester, setSemester] = useState('HỌC KỲ I');
  const [durationType, setDurationType] = useState<ExamDurationType>('45_MIN_MIDTERM');
  const [formatPref, setFormatPref] = useState<'MULTIPLE_CHOICE_ONLY' | 'HYBRID_MC_ESSAY'>('HYBRID_MC_ESSAY');

  const [activeTab, setActiveTab] = useState<'matrix' | 'exam' | 'answers'>('matrix');
  const [isGenerating, setIsGenerating] = useState(false);
  const [examPackage, setExamPackage] = useState<ExamPackage | null>(() => {
    return generateExamSpecificationPackage({
      topic: defaultTopic || 'Phương trình bậc hai & Định lý Vi-ét',
      subject: defaultSubject,
      grade: defaultGrade,
      durationType: '45_MIN_MIDTERM',
      questionFormatPreference: 'HYBRID_MC_ESSAY'
    });
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const pkg = generateExamSpecificationPackage({
        topic: topic.trim(),
        subject,
        grade,
        schoolName,
        departmentName,
        schoolYear,
        semester,
        durationType,
        questionFormatPreference: formatPref
      });
      setExamPackage(pkg);
      setIsGenerating(false);
    }, 400);
  };

  const handleDownloadDoc = () => {
    if (!examPackage) return;
    const html = exportExamPackageToDocHtml(examPackage);
    const safeName = `DeThi_MaTran_${examPackage.subject}_${examPackage.grade}_${examPackage.durationType}`.replace(/\s+/g, '_');
    downloadWordExamDoc(safeName, html);
  };

  const handleCopyExam = () => {
    if (!examPackage) return;
    const text = `${examPackage.title}\n${examPackage.schoolName} - Năm học ${examPackage.schoolYear}\nThời gian: ${examPackage.durationMinutes} phút\n\nI. TRẮC NGHIỆM:\n` +
      examPackage.studentExam.partA_MultipleChoice.map(q => `Câu ${q.order} (${q.points}đ) [${q.levelLabel}]: ${q.questionText}\n${(q.options || []).join('   ')}`).join('\n\n') +
      '\n\nII. TỰ LUẬN:\n' +
      examPackage.studentExam.partB_Essay.map(q => `Câu ${q.order} (${q.points}đ) [${q.levelLabel}]: ${q.questionText}`).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl my-4 bg-white dark:bg-[#101726] border border-purple-300 dark:border-purple-900/60 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isEn ? "AI Exam Generator & Specification Matrix (Circular 22)" : "Trợ Lý AI Soạn Đề Thi Chuẩn Ma Trận Đặc Tả (Thông Tư 22)"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black">
                  GDPT 2018 🇻🇳
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isEn 
                  ? "4-tier cognitive matrix (Recognition, Comprehension, Application, High Application) • Official school Word doc" 
                  : "Chuẩn ma trận 4 mức độ nhận thức • Phân tách đề thi học sinh & barem chấm chi tiết • Xuất file Word chuẩn in"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Form Cấu Hình Đề Thi */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* Chủ đề kiểm tra */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chủ đề / Đơn vị kiến thức kiểm tra:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="VD: Phương trình bậc hai, Định lý Pytago, Quang hợp..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none font-medium"
                />
              </div>

              {/* Môn học */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Môn học:
                </label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none font-semibold"
                >
                  <option value="Toán học">📐 Toán học</option>
                  <option value="Ngữ văn">✍️ Ngữ văn</option>
                  <option value="Tiếng Anh">🌍 Tiếng Anh</option>
                  <option value="Khoa học tự nhiên">🔬 Khoa học tự nhiên</option>
                  <option value="Vật lí">⚡ Vật lí</option>
                  <option value="Hóa học">🧪 Hóa học</option>
                  <option value="Sinh học">🌿 Sinh học</option>
                  <option value="Lịch sử & Địa lý">📜 Lịch sử & Địa lý</option>
                  <option value="Tin học">💻 Tin học</option>
                  <option value="Giáo dục công dân">⚖️ Giáo dục công dân</option>
                </select>
              </div>

              {/* Khối lớp */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Khối lớp:
                </label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none font-semibold"
                >
                  <option value="Lớp 6">Khối 6</option>
                  <option value="Lớp 7">Khối 7</option>
                  <option value="Lớp 8">Khối 8</option>
                  <option value="Lớp 9">Khối 9</option>
                  <option value="Lớp 10">Khối 10</option>
                  <option value="Lớp 11">Khối 11</option>
                  <option value="Lớp 12">Khối 12</option>
                  <option value="Tiểu học (Lớp 1-5)">Tiểu học (Lớp 1-5)</option>
                  <option value="Cao đẳng / Nghề">Cao đẳng / Nghề</option>
                </select>
              </div>
            </div>

            {/* Hàng 2: Thời lượng & Hình thức thi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Thời lượng & Loại bài kiểm tra:
                </label>
                <select
                  value={durationType}
                  onChange={e => setDurationType(e.target.value as ExamDurationType)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none font-semibold"
                >
                  <option value="15_MIN">⚡ 15 phút (Kiểm tra thường xuyên)</option>
                  <option value="45_MIN_MIDTERM">📝 45 - 60 phút (Định kỳ Giữa kỳ)</option>
                  <option value="SEMESTER_FINAL">🏆 90 phút (Kiểm tra Cuối kỳ / Học kỳ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cơ cấu trắc nghiệm & tự luận:
                </label>
                <select
                  value={formatPref}
                  onChange={e => setFormatPref(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-400 focus:outline-none font-semibold"
                >
                  <option value="HYBRID_MC_ESSAY">Kết hợp: Trắc nghiệm (6-7đ) + Tự luận (3-4đ)</option>
                  <option value="MULTIPLE_CHOICE_ONLY">100% Trắc nghiệm khách quan (10đ)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  disabled={isGenerating || !topic.trim()}
                  onClick={handleGenerate}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? "AI Đang Soạn Đề & Ma Trận..." : "⚡ Sinh Đề Thi Chuẩn TT22"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Tab Điều Hướng Kết Quả */}
          {examPackage && (
            <div className="space-y-4">
              
              {/* Action bar with tab selector and export buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('matrix')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'matrix'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    📋 1. Ma Trận Đặc Tả (TT 22)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('exam')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'exam'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    📝 2. Đề Thi Học Sinh ({examPackage.studentExam.partA_MultipleChoice.length + examPackage.studentExam.partB_Essay.length} câu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('answers')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'answers'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🔑 3. Đáp Án & Hướng Dẫn Chấm
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyExam}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Đã sao chép!" : "Sao chép"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDoc}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File Word (.doc)</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: BẢNG MA TRẬN ĐẶC TẢ ĐỀ THI */}
              {activeTab === 'matrix' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  
                  {/* Tỷ lệ 4 mức độ nhận thức */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">1. Nhận biết</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{examPackage.matrix.totalRecognition} câu</span>
                        <span className="text-xs font-bold text-blue-600">{examPackage.matrix.recognitionPercent}%</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-1">
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">2. Thông hiểu</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{examPackage.matrix.totalComprehension} câu</span>
                        <span className="text-xs font-bold text-teal-600">{examPackage.matrix.comprehensionPercent}%</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">3. Vận dụng</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{examPackage.matrix.totalApplication} câu</span>
                        <span className="text-xs font-bold text-amber-600">{examPackage.matrix.applicationPercent}%</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1">
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">4. Vận dụng cao</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{examPackage.matrix.totalAdvanced} câu</span>
                        <span className="text-xs font-bold text-rose-600">{examPackage.matrix.advancedPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Bảng Kẻ Ma Trận Đặc Tả */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                          <th className="p-3 w-12 text-center">TT</th>
                          <th className="p-3">Chủ đề & Yêu cầu cần đạt (GDPT 2018)</th>
                          <th className="p-3 text-center w-24">Nhận biết</th>
                          <th className="p-3 text-center w-24">Thông hiểu</th>
                          <th className="p-3 text-center w-24">Vận dụng</th>
                          <th className="p-3 text-center w-24">VD cao</th>
                          <th className="p-3 text-center w-24">Tổng điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {examPackage.matrix.topics.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-3 space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white">{t.topicName}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">{t.curriculumStandard}</div>
                            </td>
                            <td className="p-3 text-center font-semibold text-blue-600">{t.recognitionQuestions} câu</td>
                            <td className="p-3 text-center font-semibold text-teal-600">{t.comprehensionQuestions} câu</td>
                            <td className="p-3 text-center font-semibold text-amber-600">{t.applicationQuestions} câu</td>
                            <td className="p-3 text-center font-semibold text-rose-600">{t.advancedApplicationQuestions} câu</td>
                            <td className="p-3 text-center font-black text-purple-600">{t.totalScore} đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ĐỀ THI DÀNH CHO HỌC SINH */}
              {activeTab === 'exam' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  
                  {/* Paper Exam Container */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    
                    {/* Header chuẩn Bộ GD&ĐT */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-3">
                      <div className="text-center space-y-0.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 uppercase">{examPackage.schoolName}</div>
                        <div className="text-[11px] text-slate-500">Khối: {examPackage.grade} • Lớp: ..........</div>
                      </div>
                      <div className="text-center space-y-0.5">
                        <div className="font-black text-sm text-slate-900 dark:text-white uppercase">{examPackage.title}</div>
                        <div className="text-[11px] text-slate-500">Thời gian làm bài: {examPackage.durationMinutes} phút (Không kể phát đề)</div>
                      </div>
                    </div>

                    {/* Lời dặn */}
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 italic text-center">
                      {examPackage.studentExam.instructions}
                    </div>

                    {/* Phần 1: Trắc nghiệm */}
                    {examPackage.studentExam.partA_MultipleChoice.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide border-b border-slate-200 dark:border-slate-800 pb-1">
                          PHẦN I. TRẮC NGHIỆM KHÁCH QUAN ({examPackage.studentExam.partA_MultipleChoice.length} CÂU - {(examPackage.studentExam.partA_MultipleChoice.reduce((a, b) => a + b.points, 0)).toFixed(1)} ĐIỂM)
                        </h4>
                        
                        <div className="space-y-3">
                          {examPackage.studentExam.partA_MultipleChoice.map(q => (
                            <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Câu {q.order} ({q.points} điểm): {q.questionText}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold shrink-0">
                                  {q.levelLabel}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                                {(q.options || []).map((opt, oIdx) => (
                                  <div key={oIdx} className="text-slate-700 dark:text-slate-300 font-medium">
                                    {opt}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Phần 2: Tự luận */}
                    {examPackage.studentExam.partB_Essay.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide border-b border-slate-200 dark:border-slate-800 pb-1">
                          PHẦN II. TỰ LUẬN ({examPackage.studentExam.partB_Essay.length} CÂU - {(examPackage.studentExam.partB_Essay.reduce((a, b) => a + b.points, 0)).toFixed(1)} ĐIỂM)
                        </h4>

                        <div className="space-y-3">
                          {examPackage.studentExam.partB_Essay.map(q => (
                            <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Câu {q.order} ({q.points} điểm):
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold shrink-0">
                                  {q.levelLabel}
                                </span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                {q.questionText}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* TAB 3: ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM */}
              {activeTab === 'answers' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  
                  {/* Bảng Đáp Án Trắc Nghiệm */}
                  {examPackage.answerKeyAndRubric.multipleChoiceAnswers.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                      <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bảng Đáp Án Trắc Nghiệm Khách Quan</span>
                      </h4>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {examPackage.answerKeyAndRubric.multipleChoiceAnswers.map(a => (
                          <div key={a.order} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
                            <span className="text-[10px] text-slate-400 block font-semibold">Câu {a.order}</span>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{a.answer}</span>
                            <span className="text-[10px] text-slate-500 block">({a.points}đ)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Barem Hướng Dẫn Chấm Tự Luận */}
                  {examPackage.answerKeyAndRubric.essayRubrics.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                      <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm uppercase flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span>Biểu Điểm & Hướng Dẫn Chấm Tự Luận Chi Tiết</span>
                      </h4>

                      <div className="space-y-3">
                        {examPackage.answerKeyAndRubric.essayRubrics.map(e => (
                          <div key={e.order} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">Câu {e.order} ({e.totalPoints} điểm)</span>
                            </div>
                            <div className="space-y-1.5 pl-2">
                              {e.steps.map((st, stIdx) => (
                                <div key={stIdx} className="flex items-start justify-between gap-3 text-slate-700 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-700/60 pb-1">
                                  <span className="leading-relaxed font-medium">Bước {stIdx + 1}: {st.content}</span>
                                  <span className="font-black text-purple-600 dark:text-purple-400 shrink-0">{st.score} đ</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Đã căn chỉnh chuẩn font Times New Roman theo thể thức văn bản hành chính Việt Nam.</span>
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
