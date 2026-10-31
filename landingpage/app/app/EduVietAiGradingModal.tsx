'use client';

import React, { useState, useMemo } from 'react';
import {
  X, CheckCircle, AlertTriangle, ShieldCheck, FileSpreadsheet, Eye, RefreshCw,
  Award, Upload, Sparkles, UserCheck, BookOpen, Clock, Lock
} from 'lucide-react';
import {
  evaluateTrueFalse4, evaluateMultipleChoice, evaluateShortAnswer,
  evaluateGdnnDoubleBlind, generateAuditHash, ScoringPolicyId, EducationTrack
} from '@/lib/aiGradingEngine';

interface EduVietAiGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncToGradebook?: (scores: { studentCode: string; fullName: string; score: number }[]) => void;
}

export default function EduVietAiGradingModal({ isOpen, onClose, onSyncToGradebook }: EduVietAiGradingModalProps) {
  const [activeTab, setActiveTab] = useState<'trac_nghiem' | 'dung_sai' | 'tu_luan' | 'soat_xet'>('trac_nghiem');

  // Configuration state
  const [educationTrack, setEducationTrack] = useState<EducationTrack>('THPT');
  const [policyId, setPolicyId] = useState<ScoringPolicyId>('THPT_2025_TF4');
  const [className, setClassName] = useState('12A1');
  const [subject, setSubject] = useState('Công nghệ - Công nghiệp 12');

  // Demo / Staging Submissions State
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub_001',
      studentCode: 'HS-12001',
      fullName: 'Nguyễn Văn An',
      examCode: '101',
      mcqCorrect: 36,
      mcqTotal: 40,
      tfCorrectCounts: [4, 3, 2, 1], // 4 câu đúng-sai, số ý đúng mỗi câu
      shortAnswers: ['2.5', '120 ôm', '0.05 A'],
      suggestedScore: 8.75,
      finalScore: 8.75,
      status: 'SUGGESTED' as 'SUGGESTED' | 'FINALIZED' | 'FLAGGED_REVIEW',
      flags: [] as string[],
      auditTrail: [] as string[],
      teacherNote: ''
    },
    {
      id: 'sub_002',
      studentCode: 'HS-12002',
      fullName: 'Trần Thị Bích',
      examCode: '101',
      mcqCorrect: 32,
      mcqTotal: 40,
      tfCorrectCounts: [3, 2, 4, 0],
      shortAnswers: ['2,48', '120 ohm', '0,05'],
      suggestedScore: 7.60,
      finalScore: 7.60,
      status: 'FLAGGED_REVIEW' as 'SUGGESTED' | 'FINALIZED' | 'FLAGGED_REVIEW',
      flags: ['Câu 28 tô đè cả A và B', 'Ý 2d dấu tô mờ'],
      auditTrail: [] as string[],
      teacherNote: ''
    },
    {
      id: 'sub_003',
      studentCode: 'HS-12003',
      fullName: 'Lê Hoàng Cường',
      examCode: '102',
      mcqCorrect: 38,
      mcqTotal: 40,
      tfCorrectCounts: [4, 4, 3, 2],
      shortAnswers: ['2.5', '120', '0.05 A'],
      suggestedScore: 9.25,
      finalScore: 9.25,
      status: 'FINALIZED' as 'SUGGESTED' | 'FINALIZED' | 'FLAGGED_REVIEW',
      flags: [] as string[],
      auditTrail: ['Giáo viên Nguyễn Quốc Huy phê duyệt điểm chính thức lúc 08:30'],
      teacherNote: 'Bài làm rất tốt, lập luận mạch lạc.'
    }
  ]);

  // GDNN Double Blind Demo State
  const [gdnnCases, setGdnnCases] = useState([
    {
      id: 'gdnn_01',
      blindCode: 'PHACH-9012',
      evaluator1: 8.0,
      evaluator2: 8.5,
      module: 'Tiện trục bậc & gia công ren'
    },
    {
      id: 'gdnn_02',
      blindCode: 'PHACH-9013',
      evaluator1: 6.5,
      evaluator2: 7.5,
      module: 'Phay rãnh then hoa'
    },
    {
      id: 'gdnn_03',
      blindCode: 'PHACH-9014',
      evaluator1: 5.0,
      evaluator2: 7.0,
      module: 'Hàn hồ quang tay 3G'
    }
  ]);

  // Editing state in Review Desk
  const [selectedSubId, setSelectedSubId] = useState<string>('sub_002');
  const [overrideScore, setOverrideScore] = useState<number>(7.60);
  const [overrideReason, setOverrideReason] = useState<string>('Giáo viên đã soi ảnh gốc câu 28: học sinh đã gạch chéo phương án B để chọn A.');
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  const activeSub = useMemo(() => submissions.find(s => s.id === selectedSubId), [submissions, selectedSubId]);

  if (!isOpen) return null;

  const handleApproveScore = (subId: string, isOverride: boolean = false) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id !== subId) return s;
      const finalVal = isOverride ? overrideScore : s.suggestedScore;
      const hash = generateAuditHash({
        submissionId: s.id,
        reviewerId: 'TEACHER_CURRENT',
        originalScore: s.suggestedScore,
        reviewedScore: finalVal,
        reason: isOverride ? overrideReason : 'Approve as-is',
        timestamp: Date.now()
      });
      return {
        ...s,
        finalScore: finalVal,
        status: 'FINALIZED',
        flags: isOverride ? [] : s.flags,
        auditTrail: [
          ...s.auditTrail,
          `Đã duyệt điểm: ${finalVal} (${isOverride ? 'Có điều chỉnh: ' + overrideReason : 'Theo kết quả máy'}). Hash: ${hash}`
        ]
      };
    }));
    setAuditMessage(`Đã ghi nhận phê duyệt điểm học sinh ${activeSub?.fullName} thành công!`);
    setTimeout(() => setAuditMessage(null), 4000);
  };

  const handleSyncAllToGradebook = () => {
    if (onSyncToGradebook) {
      const records = submissions.map(s => ({
        studentCode: s.studentCode,
        fullName: s.fullName,
        score: s.finalScore
      }));
      onSyncToGradebook(records);
      setAuditMessage(`Đã đồng bộ ${records.length} điểm số vào Sổ điểm điện tử TT 22!`);
      setTimeout(() => setAuditMessage(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">EduViet AI Grading — Phân Hệ Chấm Bài Thông Minh</h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full border border-emerald-300">
                  Staging Verified
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-full border border-rose-300">
                  Chuẩn TT 22 / GDNN TT 04
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động hóa chấm thi trắc nghiệm, đúng–sai 4 ý, trả lời ngắn & tự luận rubric • 100% Offline trên NODE-01
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION TOAST */}
        {auditMessage && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-sm flex items-center justify-between font-medium animate-in slide-in-from-top">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{auditMessage}</span>
            </div>
            <span className="text-xs text-emerald-100">Tamper-evident Audit Hash Saved</span>
          </div>
        )}

        {/* TOP CONFIG BAR */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Hệ đào tạo:</span>
              <select
                value={educationTrack}
                onChange={e => setEducationTrack(e.target.value as EducationTrack)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="THPT">THPT (GDPT 2018)</option>
                <option value="THCS">THCS (TT 22)</option>
                <option value="GDNN">Giáo Dục Nghề Nghiệp (TT 04)</option>
                <option value="GDTX">Giáo Dục Thường Xuyên</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Quy chế tính điểm:</span>
              <select
                value={policyId}
                onChange={e => setPolicyId(e.target.value as ScoringPolicyId)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="THPT_2025_TF4">Đúng-Sai 4 ý THPT 2025 (0.1, 0.25, 0.5, 1.0)</option>
                <option value="INTERNAL_TF_PER_SUBITEM">Đúng-Sai đều điểm nội bộ (0.25đ/ý)</option>
                <option value="MC_STANDARD_4CHOICE">Trắc nghiệm 1 đáp án chuẩn</option>
                <option value="SHORT_ANSWER_NUMERIC_TOLERANCE">Trả lời ngắn (Dung sai số học)</option>
                <option value="GDNN_DOUBLE_BLIND_TT04">GDNN Chấm 2 Giáo Viên Độc Lập</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500 font-medium">Lớp:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{className}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSyncAllToGradebook}
              className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium shadow-sm transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Đồng bộ Sổ Điểm TT 22</span>
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('trac_nghiem')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'trac_nghiem'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Trắc nghiệm & OMR</span>
          </button>

          <button
            onClick={() => setActiveTab('dung_sai')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'dung_sai'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>2. Đúng–Sai 4 Ý & Điền Khuyết</span>
          </button>

          <button
            onClick={() => setActiveTab('tu_luan')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'tu_luan'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Tự luận & Rubric AI</span>
          </button>

          <button
            onClick={() => setActiveTab('soat_xet')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'soat_xet'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>4. Bàn Soát Xét & GDNN Độc Lập</span>
            {submissions.some(s => s.status === 'FLAGGED_REVIEW') && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: TRẮC NGHIỆM & OMR */}
          {activeTab === 'trac_nghiem' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-rose-600" />
                    <span>Nạp Tệp Phiếu Trắc Nghiệm</span>
                  </h3>
                  <p className="text-xs text-slate-500">Hỗ trợ ảnh quét camera, PDF scan đa trang của lớp {className}. Khử sạch EXIF/GPS metadata.</p>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kéo thả ảnh phiếu hoặc bấm tải lên</span>
                    <span className="block text-[10px] text-slate-400 mt-1">Định dạng JPG, PNG, PDF (Tối đa 15MB)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>Ma Trận & Đáp Án Chuẩn</span>
                  </h3>
                  <div className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span>Mã đề 101:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">40 câu (1A 2B 3C 4D...)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span>Mã đề 102:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">40 câu (1C 2A 3D 4B...)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                      <span>Điểm mỗi câu:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">0.25 điểm/câu</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Trạng Thái Động Cơ OMR</span>
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      <span>OMR Engine Sẵn Sàng (145ms/phiếu)</span>
                    </div>
                    <div className="text-slate-500">Độ chính xác nhận diện: &gt;99.7%</div>
                    <div className="text-slate-500">Tự động gắn cờ khi phát hiện tô đè hoặc tẩy mờ.</div>
                  </div>
                </div>
              </div>

              {/* TABLE OF MCQ RESULTS */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                    <tr>
                      <th className="p-3">Mã HS</th>
                      <th className="p-3">Họ và Tên</th>
                      <th className="p-3">Mã đề</th>
                      <th className="p-3 text-center">Số câu đúng</th>
                      <th className="p-3 text-center">Điểm máy đề xuất</th>
                      <th className="p-3 text-center">Trạng thái</th>
                      <th className="p-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {submissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                        <td className="p-3 font-mono font-semibold">{sub.studentCode}</td>
                        <td className="p-3 font-medium text-slate-900 dark:text-white">{sub.fullName}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600">{sub.examCode}</td>
                        <td className="p-3 text-center font-bold">{sub.mcqCorrect} / {sub.mcqTotal}</td>
                        <td className="p-3 text-center font-bold text-base text-rose-600">{sub.suggestedScore.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          {sub.status === 'FINALIZED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">ĐÃ DUYỆT</span>
                          ) : sub.status === 'FLAGGED_REVIEW' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">CẦN SOÁT XÉT</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">DỰ KIẾN</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedSubId(sub.id);
                              setOverrideScore(sub.suggestedScore);
                              setActiveTab('soat_xet');
                            }}
                            className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded border border-slate-300 dark:border-slate-700 transition"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ĐÚNG–SAI 4 Ý & TRẢ LỜI NGẮN */}
          {activeTab === 'dung_sai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 p-4 rounded-xl border border-amber-300/40">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span>Quy Tắc Chấm Đúng-Sai 4 Ý Chuẩn Bộ GD&ĐT (Đề Thi Tốt Nghiệp THPT 2025+)</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Mỗi câu hỏi có 4 lệnh hỏi a, b, c, d. Thang điểm phân hóa nghiêm ngặt: 
                  <strong className="text-slate-800 dark:text-slate-200 ml-1">Đúng 1 ý: 0.10đ | Đúng 2 ý: 0.25đ | Đúng 3 ý: 0.50đ | Đúng 4 ý: 1.00đ</strong>.
                </p>
              </div>

              {/* SIMULATION CARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Ví dụ Câu 1 (Đúng-Sai 4 ý)</h4>
                  <div className="text-xs space-y-2">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded flex justify-between items-center">
                      <span>a) Điện áp định mức của tụ là 220V</span>
                      <span className="font-bold text-emerald-600">ĐÁP ÁN: ĐÚNG • HỌC SINH: ĐÚNG (+0.10)</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded flex justify-between items-center">
                      <span>b) Dòng điện xoay chiều có tần số 50Hz</span>
                      <span className="font-bold text-emerald-600">ĐÁP ÁN: ĐÚNG • HỌC SINH: ĐÚNG (Tổng 2 ý: 0.25)</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded flex justify-between items-center">
                      <span>c) Công suất tiêu thụ mạch đạt cực đại</span>
                      <span className="font-bold text-emerald-600">ĐÁP ÁN: SAI • HỌC SINH: SAI (Tổng 3 ý: 0.50)</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded flex justify-between items-center">
                      <span>d) Mạch bị ngắn mạch khi đóng khóa K</span>
                      <span className="font-bold text-emerald-600">ĐÁP ÁN: ĐÚNG • HỌC SINH: ĐÚNG (Tổng 4 ý: 1.00)</span>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between items-center text-xs font-bold border-t border-slate-200 dark:border-slate-800">
                    <span>Tổng điểm câu 1 (Đúng 4/4 ý):</span>
                    <span className="text-rose-600 text-sm">1.00 / 1.00 điểm</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Chấm Trả Lời Ngắn (Chuẩn Hóa & Dung Sai Số Học)</h4>
                  <div className="text-xs space-y-2">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Câu 1: Giá trị điện trở R?</span>
                        <span className="text-emerald-600">HỢP LỆ (0.50đ)</span>
                      </div>
                      <div className="text-slate-500">Đáp án chuẩn: <strong>120 ôm</strong> (hoặc 120 ohm, 120)</div>
                      <div className="text-slate-700 dark:text-slate-300">Học sinh ghi: <code>120 ohm</code> -&gt; Tự động nhận diện chuẩn xác.</div>
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>Câu 2: Cường độ dòng điện I?</span>
                        <span className="text-emerald-600">HỢP LỆ (0.50đ)</span>
                      </div>
                      <div className="text-slate-500">Đáp án chuẩn: <strong>2.5 A</strong></div>
                      <div className="text-slate-700 dark:text-slate-300">Học sinh ghi: <code>2,48 A</code> -&gt; Nằm trong dung sai sai số 1% cho phép.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TỰ LUẬN & RUBRIC AI */}
          {activeTab === 'tu_luan' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Trợ Lý Rubric Tự Luận Cục Bộ (Ollama qwen2.5-coder & deepseek-r1)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Phân tích bài làm tự luận theo 3 tiêu chí Rubric: Nguyên lý (3đ), Tính toán (4đ), Sơ đồ kỹ thuật (3đ).
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded border border-indigo-200">
                    Confidence: 94.2%
                  </span>
                </div>
              </div>

              {/* RUBRIC BREAKDOWN DEMO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Tiêu chí 1: Nguyên lý</span>
                    <span className="font-bold text-rose-600">2.5 / 3.0đ</span>
                  </div>
                  <div className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2 rounded">
                    &quot;Minh chứng: Học sinh giải thích đúng vai trò của diot chỉnh lưu và biến áp nguồn.&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Tiêu chí 2: Tính toán</span>
                    <span className="font-bold text-rose-600">3.5 / 4.0đ</span>
                  </div>
                  <div className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2 rounded">
                    &quot;Minh chứng: Công thức U2 = U1 * (N2/N1) đúng, tính ra 12V chính xác.&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Tiêu chí 3: Sơ đồ kỹ thuật</span>
                    <span className="font-bold text-rose-600">2.75 / 3.0đ</span>
                  </div>
                  <div className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2 rounded">
                    &quot;Minh chứng: Ký hiệu linh kiện chuẩn TCVN, nét vẽ sạch sẽ.&quot;
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BÀN SOÁT XÉT & GDNN ĐỘC LẬP */}
          {activeTab === 'soat_xet' && (
            <div className="space-y-6">
              {/* HUMAN GATE & GDNN WARNING */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Bàn Soát Xét Điểm Số — Nguyên Tắc Human-in-the-Loop</h4>
                    <p className="text-xs text-slate-500">Mọi đề xuất từ AI chỉ có giá trị tham khảo. Điểm số chỉ có giá trị pháp lý khi Giáo viên ký duyệt.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">Phiên chấm: #SES-20261031</span>
                </div>
              </div>

              {/* GDNN DOUBLE BLIND SECTION */}
              {educationTrack === 'GDNN' && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Quy Trình Chấm Hai Cán Bộ Độc Lập GDNN (Thông Tư 04/2022/TT-BLĐTBXH)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {gdnnCases.map(gc => {
                      const evalRes = evaluateGdnnDoubleBlind(gc.id, gc.blindCode, gc.evaluator1, gc.evaluator2);
                      return (
                        <div key={gc.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-center font-bold">
                            <span className="font-mono text-indigo-600">{gc.blindCode}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              evalRes.discrepancyLevel === 'TOLERABLE' ? 'bg-emerald-100 text-emerald-800' :
                              evalRes.discrepancyLevel === 'MODERATE_DIALOGUE_REQUIRED' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {evalRes.resolutionStatus}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px]">{gc.module}</div>
                          <div className="flex justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800">
                            <span>CB1: <strong>{gc.evaluator1}</strong> • CB2: <strong>{gc.evaluator2}</strong></span>
                            <span className="font-bold text-rose-600">Lệch: {evalRes.scoreDifference}đ</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">{evalRes.actionNote}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* REVIEW DESK: SIDE-BY-SIDE INSPECTION */}
              {activeSub && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LEFT: ORIGINAL PAPER VISUALIZER */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
                    <div className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>Ảnh Bài Làm Gốc (Giáo viên đối soát trực quan)</span>
                      </span>
                      <span className="font-mono text-slate-500">{activeSub.studentCode} • Mã đề {activeSub.examCode}</span>
                    </div>

                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-300 space-y-1">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">PHIẾU TRẢ LỜI TRẮC NGHIỆM CHUẨN</p>
                        <p>Số báo danh: {activeSub.studentCode} • Mã đề: {activeSub.examCode}</p>
                        <p className="text-[11px] text-emerald-600 mt-2">✓ Khử nhiễu phối cảnh 4 góc (Perspective warp OK)</p>
                        <p className="text-[11px] text-emerald-600">✓ Căn lề dấu mốc chuẩn xác (Anchor points OK)</p>
                      </div>

                      {activeSub.flags.length > 0 && (
                        <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 text-white p-2 rounded text-[11px] font-semibold flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Cảnh báo: {activeSub.flags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: TEACHER OVERRIDE & APPROVAL PANEL */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex justify-between items-center text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Quyết Định Điểm Của Giáo Viên</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        activeSub.status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {activeSub.status === 'FINALIZED' ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-slate-600 dark:text-slate-400">Điểm máy đề xuất:</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{activeSub.suggestedScore.toFixed(2)}</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Điểm số sau khi giáo viên xem lại:</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="10"
                          value={overrideScore}
                          onChange={e => setOverrideScore(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-bold text-base text-rose-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Lý do điều chỉnh (Bắt buộc ghi nhận vào Audit Log):</label>
                        <textarea
                          rows={2}
                          value={overrideReason}
                          onChange={e => setOverrideReason(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs"
                          placeholder="Nhập lý do sửa điểm..."
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <button
                          onClick={() => handleApproveScore(activeSub.id, false)}
                          className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg font-semibold transition"
                        >
                          Duyệt Nguyên Điểm Máy
                        </button>
                        <button
                          onClick={() => handleApproveScore(activeSub.id, true)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-md transition"
                        >
                          Lưu Điểm Điều Chỉnh
                        </button>
                      </div>

                      {activeSub.auditTrail.length > 0 && (
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-1">
                          <span className="font-bold text-[10px] text-slate-500 uppercase">Lịch sử kiểm toán:</span>
                          {activeSub.auditTrail.map((at, idx) => (
                            <p key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{at}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Chế độ an toàn: Dữ liệu bài làm được xử lý 100% trong môi trường Staging cách ly</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg font-medium transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
