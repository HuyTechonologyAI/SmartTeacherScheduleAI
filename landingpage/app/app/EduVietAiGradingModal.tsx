'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  X, CheckCircle, AlertTriangle, ShieldCheck, FileSpreadsheet, Eye, RefreshCw,
  Award, Upload, Sparkles, UserCheck, BookOpen, Clock, Lock, FileText, Trash2, Check,
  ArrowRight, ShieldAlert, FileCheck
} from 'lucide-react';
import {
  evaluateTrueFalse4, evaluateMultipleChoice, evaluateShortAnswer,
  evaluateGdnnDoubleBlind, createAuditRecord, verifyAuditChain,
  ScoringPolicyId, EducationTrack, AuditRecord
} from '@/lib/aiGradingEngine';
import {
  validateFileMagicBytes, scanExamSheetPixelMatrix, gradeExamSheet,
  PixelMatrix, ApprovedAnswerKey
} from '@/lib/omrEngine';
import type { Blueprint } from '@/lib/gradingServer/types';

async function loadFileToPixelMatrix(file: File): Promise<PixelMatrix> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Không thể tải hình ảnh phiếu thi'));
      img.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 1200;
    canvas.height = img.naturalHeight || img.height || 1700;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Không thể tạo 2D context để xử lý điểm ảnh');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    return {
      width: imgData.width,
      height: imgData.height,
      data: imgData.data,
      channels: 4
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface FinalizedGradeRecord {
  studentCode: string;
  fullName: string;
  score: number;
  examCode: string;
  auditHash: string;
  reviewedAt: number;
  teacherNote?: string;
}

export interface SyncPayload {
  className: string;
  subject: string;
  semester: string;
  academicYear: string;
  records: FinalizedGradeRecord[];
  isDemo?: boolean;
  assessmentId?: string;
}

interface EduVietAiGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncToGradebook?: (payload: SyncPayload) => Promise<{ success: boolean; message: string; writtenCount: number }>;
}

export interface RealUploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string | null;
  status: 'READY' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  errorMessage?: string;
  bytes?: Uint8Array;
  format?: string;
}

export interface SubmissionRecord {
  id: string;
  studentCode: string;
  fullName: string;
  examCode: string;
  mcqCorrect: number;
  mcqTotal: number;
  tfCorrectCounts: number[];
  shortAnswers: string[];
  suggestedScore: number;
  finalScore: number;
  status: 'PENDING' | 'SUGGESTED' | 'FLAGGED_REVIEW' | 'FINALIZED';
  flags: string[];
  auditRecords: AuditRecord[];
  teacherNote: string;
  sourceFile?: string;
}

export default function EduVietAiGradingModal({ isOpen, onClose, onSyncToGradebook }: EduVietAiGradingModalProps) {
  // Mode selection: REAL (Mặc định) vs DEMO (Minh họa)
  const [gradingMode, setGradingMode] = useState<'REAL' | 'DEMO'>('REAL');
  const [activeTab, setActiveTab] = useState<'trac_nghiem' | 'dung_sai' | 'tu_luan' | 'soat_xet' | 'gdnn'>('trac_nghiem');

  // Configuration state
  const [educationTrack, setEducationTrack] = useState<EducationTrack>('THPT');
  const [policyId, setPolicyId] = useState<ScoringPolicyId>('THPT_2025_TF4');
  const [className, setClassName] = useState('12A1');
  const [subject, setSubject] = useState('Công nghệ - Công nghiệp 12');
  const [semester, setSemester] = useState('Học kỳ I');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');

  // Real Upload State
  const [uploadedFiles, setUploadedFiles] = useState<RealUploadedFile[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Submissions State
  const [realSubmissions, setRealSubmissions] = useState<SubmissionRecord[]>([]);

  // Bộ đáp án chuẩn mẫu cho chế độ DEMO (tuân thủ Blueprint 10.0 điểm)
  const DEMO_BLUEPRINT: Blueprint = useMemo(() => ({
    templateId: 'GDPT_THPT_2025_40_8_6',
    part1: { count: 40, pointsEach: 0.1 },
    part2: { count: 4 },
    part3: { count: 4, pointsEach: 0.5 }
  }), []);

  const DEMO_APPROVED_KEYS: Record<string, ApprovedAnswerKey> = useMemo(() => ({
    '101': {
      examCode: '101',
      version: 1,
      status: 'APPROVED',
      blueprint: DEMO_BLUEPRINT,
      part1Key: {
        1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D',
        9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C', 16: 'D',
        17: 'A', 18: 'B', 19: 'C', 20: 'D', 21: 'A', 22: 'B', 23: 'C', 24: 'D',
        25: 'A', 26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B', 31: 'C', 32: 'D',
        33: 'A', 34: 'B', 35: 'C', 36: 'D', 37: 'A', 38: 'B', 39: 'C', 40: 'D'
      },
      part2Key: {
        1: { a: true, b: false, c: true, d: false },
        2: { a: false, b: true, c: true, d: false },
        3: { a: true, b: true, c: false, d: false },
        4: { a: false, b: false, c: true, d: true }
      },
      part3Key: {
        1: '2.5', 2: '120', 3: '0.05', 4: '-15'
      }
    },
    '102': {
      examCode: '102',
      version: 1,
      status: 'APPROVED',
      blueprint: DEMO_BLUEPRINT,
      part1Key: {
        1: 'B', 2: 'C', 3: 'D', 4: 'A', 5: 'B', 6: 'C', 7: 'D', 8: 'A',
        9: 'B', 10: 'C', 11: 'D', 12: 'A', 13: 'B', 14: 'C', 15: 'D', 16: 'A',
        17: 'B', 18: 'C', 19: 'D', 20: 'A', 21: 'B', 22: 'C', 23: 'D', 24: 'A',
        25: 'B', 26: 'C', 27: 'D', 28: 'A', 29: 'B', 30: 'C', 31: 'D', 32: 'A',
        33: 'B', 34: 'C', 35: 'D', 36: 'A', 37: 'B', 38: 'C', 39: 'D', 40: 'A'
      },
      part2Key: {
        1: { a: false, b: true, c: false, d: true },
        2: { a: true, b: false, c: true, d: true },
        3: { a: false, b: false, c: true, d: false },
        4: { a: true, b: true, c: false, d: true }
      },
      part3Key: {
        1: '3.0', 2: '240', 3: '0.10', 4: '-20'
      }
    }
  }), [DEMO_BLUEPRINT]);

  // Trong chế độ REAL: Đáp án chuẩn lấy từ API máy chủ (bắt buộc nguyên tắc 4 mắt)
  const [realApprovedKeys, setRealApprovedKeys] = useState<Record<string, ApprovedAnswerKey>>({});

  // Demo Sandbox Submissions State
  const [demoSubmissions, setDemoSubmissions] = useState<SubmissionRecord[]>([
    {
      id: 'demo_001',
      studentCode: 'HS-12001',
      fullName: 'Nguyễn Văn An (Demo)',
      examCode: '101',
      mcqCorrect: 36,
      mcqTotal: 40,
      tfCorrectCounts: [4, 3, 2, 1],
      shortAnswers: ['2.5', '120 ôm', '0.05 A'],
      suggestedScore: 8.75,
      finalScore: 8.75,
      status: 'SUGGESTED',
      flags: [],
      auditRecords: [],
      teacherNote: ''
    },
    {
      id: 'demo_002',
      studentCode: 'HS-12002',
      fullName: 'Trần Thị Bích (Demo)',
      examCode: '101',
      mcqCorrect: 32,
      mcqTotal: 40,
      tfCorrectCounts: [3, 2, 4, 0],
      shortAnswers: ['2,48', '120 ohm', '0,05'],
      suggestedScore: 7.60,
      finalScore: 7.60,
      status: 'FLAGGED_REVIEW',
      flags: ['Câu 28 tô đè cả A và B', 'Ý 2d dấu tô mờ'],
      auditRecords: [],
      teacherNote: ''
    },
    {
      id: 'demo_003',
      studentCode: 'HS-12003',
      fullName: 'Lê Hoàng Cường (Demo)',
      examCode: '102',
      mcqCorrect: 38,
      mcqTotal: 40,
      tfCorrectCounts: [4, 4, 3, 2],
      shortAnswers: ['2.5', '120', '0.05 A'],
      suggestedScore: 9.25,
      finalScore: 9.25,
      status: 'FINALIZED',
      flags: [],
      auditRecords: [
        createAuditRecord({
          submissionId: 'demo_003',
          reviewerId: 'TEACHER_PRIMARY',
          evaluatorRole: 'TEACHER_PRIMARY',
          action: 'APPROVE_AS_IS',
          originalScore: 9.25,
          reviewedScore: 9.25,
          reason: 'Bài làm rất tốt, lập luận mạch lạc.',
          policyId: 'THPT_2025_TF4',
          timestamp: Date.now() - 3600000
        })
      ],
      teacherNote: 'Bài làm rất tốt, lập luận mạch lạc.'
    }
  ]);

  // GDNN Double Blind Cases State (Điều 15 TT 04/2022/TT-BLĐTBXH)
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
      evaluator2: 7.4,
      module: 'Phay rãnh then hoa'
    },
    {
      id: 'gdnn_03',
      blindCode: 'PHACH-9014',
      evaluator1: 5.0,
      evaluator2: 7.0, // Chênh lệch 2.0 điểm >= 1.0 điểm -> Bắt buộc chấm lại theo Điều 15
      module: 'Hàn hồ quang tay 3G'
    }
  ]);

  // Review Desk Editing State
  const activeSubmissions = gradingMode === 'REAL' ? realSubmissions : demoSubmissions;
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [overrideScore, setOverrideScore] = useState<number>(8.0);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const activeSub = useMemo(() => {
    return activeSubmissions.find(s => s.id === selectedSubId) || activeSubmissions[0];
  }, [activeSubmissions, selectedSubId]);

  if (!isOpen) return null;

  // Handle Real File Upload with Magic Byte & Integrity Validation
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: RealUploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
        setAuditMessage(`File ${f.name} bị từ chối: Định dạng PDF chưa hỗ trợ nhận diện quang học trực tiếp. Vui lòng chuyển đổi sang ảnh PNG hoặc JPEG chất lượng cao trước khi tải lên.`);
        continue;
      }
      // Kiểm tra dung lượng (< 15MB)
      if (f.size > 15 * 1024 * 1024) {
        setAuditMessage(`File ${f.name} vượt quá dung lượng cho phép (15MB).`);
        continue;
      }

      try {
        const arrayBuffer = await f.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const val = validateFileMagicBytes(bytes, f.type);

        if (!val.valid || val.format === 'PDF') {
          setAuditMessage(`File ${f.name} bị từ chối: ${val.error || 'Định dạng PDF chưa hỗ trợ nhận diện quang học trực tiếp'}`);
          continue;
        }

        const isImg = val.format === 'PNG' || val.format === 'JPEG' || val.format === 'WEBP';

        newItems.push({
          id: `file_${Date.now()}_${i}`,
          file: f,
          name: f.name,
          size: f.size,
          bytes,
          format: val.format,
          previewUrl: isImg ? URL.createObjectURL(f) : null,
          status: 'READY'
        });
      } catch (err: any) {
        setAuditMessage(`Lỗi đọc file ${f.name}: ${err?.message || 'Không thể giải mã dữ liệu nhị phân'}`);
      }
    }

    setUploadedFiles(prev => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Real OMR / Optical Pixel Processing Execution (R4 - Chấm OMR điểm ảnh thực tế, Fail-Closed)
  const handleProcessUploadedFiles = async () => {
    if (uploadedFiles.length === 0) {
      setAuditMessage('Vui lòng chọn ít nhất 1 file phiếu thi để chấm.');
      return;
    }

    setIsProcessingFiles(true);
    setAuditMessage('Đang phân tích điểm ảnh quang học OMR thực tế, căn chỉnh góc phiếu và đối soát đáp án chuẩn...');

    try {
      const processedList: SubmissionRecord[] = [];
      let currentRealKeys = { ...realApprovedKeys };

      if (gradingMode === 'REAL' && Object.keys(currentRealKeys).length === 0) {
        try {
          const res = await fetch(`/api/grading/answer-keys?classId=${encodeURIComponent(className)}&subjectId=${encodeURIComponent(subject)}`, {
            headers: {
              'Authorization': 'Bearer tk_teacher_gvbm_auth'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.keys)) {
              for (const k of data.keys) {
                if (k.status === 'APPROVED') {
                  currentRealKeys[k.examCode] = k;
                }
              }
              setRealApprovedKeys(currentRealKeys);
            }
          }
        } catch {}
      }

      for (let idx = 0; idx < uploadedFiles.length; idx++) {
        const item = uploadedFiles[idx];
        
        // 1. Giải mã hình ảnh sang ma trận điểm ảnh thực tế (PixelMatrix)
        const pixelMatrix = await loadFileToPixelMatrix(item.file);

        // 2. Quét OMR quang học điểm ảnh thực tế (Fiducial alignment, bubble optical density)
        const scanResult = scanExamSheetPixelMatrix(pixelMatrix, item.format as any);

        if (!scanResult.isReadable) {
          throw new Error(`Phiếu thi [${item.name}]: ${scanResult.unreadableReason || 'Không thể căn chỉnh dấu chuẩn góc (Fiducial Markers)'}. Fail-closed.`);
        }
        if (scanResult.detectedExamCode === 'UNKNOWN') {
          throw new Error(`Phiếu thi [${item.name}]: Không nhận diện được Mã đề (OMR mã đề không rõ ràng). Không tự động gán mã đề mặc định.`);
        }
        if (scanResult.detectedStudentCode === 'HS-UNKNOWN') {
          throw new Error(`Phiếu thi [${item.name}]: Không nhận diện được Số báo danh học sinh. Fail-closed.`);
        }

        // 3. Đối chiếu đáp án chuẩn được giáo viên phê duyệt (4-eyes Approved Answer Key)
        const activeKeys = gradingMode === 'REAL' ? currentRealKeys : DEMO_APPROVED_KEYS;
        const approvedKey = activeKeys[scanResult.detectedExamCode];

        if (!approvedKey || approvedKey.status !== 'APPROVED') {
          throw new Error(`FAIL-CLOSED: Chưa có Đáp án chuẩn được phê duyệt cho Mã đề [${scanResult.detectedExamCode}]. Vui lòng phê duyệt đáp án theo nguyên tắc 4 mắt trên hệ thống trước khi chấm.`);
        }

        const grading = gradeExamSheet(scanResult, approvedKey);

        const subRecord: SubmissionRecord = {
          id: `real_sub_${Date.now()}_${idx}`,
          studentCode: grading.studentCode,
          fullName: `Học sinh ${grading.studentCode} (${className})`,
          examCode: grading.examCode,
          mcqCorrect: grading.mcqCorrectCount,
          mcqTotal: grading.mcqTotal,
          tfCorrectCounts: grading.part2CorrectCounts,
          shortAnswers: scanResult.part3Scans.map(p => p.detectedText),
          suggestedScore: grading.totalScoreScaled,
          finalScore: grading.totalScoreScaled,
          status: grading.flags.length > 0 ? 'FLAGGED_REVIEW' : 'SUGGESTED',
          flags: grading.flags,
          auditRecords: [],
          teacherNote: grading.flags.length > 0
            ? grading.flags.join('; ')
            : `OMR quang học thực tế (P1: ${grading.mcqCorrectCount}/${grading.mcqTotal}, P2: ${grading.part2Score}đ, P3: ${grading.part3Score}đ). Độ tin cậy: ${Math.round(scanResult.overallConfidence * 100)}%`,
          sourceFile: item.name
        };

        processedList.push(subRecord);
      }

      setRealSubmissions(processedList);
      if (processedList.length > 0) {
        setSelectedSubId(processedList[0].id);
      }
      setAuditMessage(`Đã quét OMR quang học thật cho ${processedList.length} phiếu bài thi! Chuyển sang Bàn Soát Xét.`);
      setActiveTab('soat_xet');
    } catch (err: any) {
      setAuditMessage(`Lỗi quét phiếu bài thi: ${err?.message || 'Không thể xử lý OMR'}`);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  // Teacher Approval with SHA-256 Hash Chaining & Server-Side Audit Dispatch (R4)
  const handleApproveScore = async (subId: string, isOverride: boolean = false) => {
    const finalVal = isOverride ? overrideScore : (activeSub?.suggestedScore ?? 8.0);
    const lastAudit = activeSub && activeSub.auditRecords.length > 0
      ? activeSub.auditRecords[activeSub.auditRecords.length - 1].entryHash
      : undefined;

    const newAudit = createAuditRecord({
      submissionId: subId,
      reviewerId: 'GV_BO_MON',
      evaluatorRole: 'TEACHER_PRIMARY',
      action: isOverride ? 'ADJUST_SCORE' : 'APPROVE_AS_IS',
      originalScore: activeSub?.suggestedScore ?? finalVal,
      reviewedScore: finalVal,
      reason: isOverride ? overrideReason : 'Giáo viên phê duyệt kết quả sau đối soát phiếu OMR',
      policyId,
      previousHash: lastAudit,
      timestamp: Date.now()
    });

    if (gradingMode === 'REAL') {
      try {
        const res = await fetch('/api/grading/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer tk_teacher_gvbm_auth'
          },
          body: JSON.stringify({
            classId: className,
            subjectId: subject,
            assessmentId: `ASM_${className}_${subject}_${semester}`.replace(/\s+/g, '_'),
            submissionId: subId,
            studentCode: activeSub?.studentCode || 'HS_UNKNOWN',
            examCode: activeSub?.examCode || '101',
            action: isOverride ? 'ADJUST_SCORE' : 'APPROVE_AS_IS',
            originalScore: activeSub?.suggestedScore ?? finalVal,
            reviewedScore: finalVal,
            reason: isOverride ? overrideReason : 'Giáo viên phê duyệt kết quả sau đối soát phiếu OMR',
            policyId
          })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          setAuditMessage(`CHẶN KÝ DUYỆT (Fail-closed): ${errJson.error || 'Không thể ghi nhận nhật ký kiểm toán máy chủ'}`);
          return;
        }
        const data = await res.json();
        if (data?.entry?.entryHash) {
          newAudit.entryHash = data.entry.entryHash;
        }
      } catch (err: any) {
        setAuditMessage(`CHẶN KÝ DUYỆT (Fail-closed): Không kết nối được máy chủ kiểm toán (${err?.message || 'Network error'})`);
        return;
      }
    }

    const updater = (prev: SubmissionRecord[]) => prev.map(s => {
      if (s.id !== subId) return s;
      return {
        ...s,
        finalScore: finalVal,
        status: 'FINALIZED' as const,
        flags: isOverride ? [] : s.flags,
        teacherNote: isOverride ? overrideReason : s.teacherNote,
        auditRecords: [...s.auditRecords, newAudit]
      };
    });

    if (gradingMode === 'REAL') {
      setRealSubmissions(updater);
    } else {
      setDemoSubmissions(updater);
    }

    setAuditMessage(`Đã ký duyệt điểm thành công cho học sinh ${activeSub?.fullName}!`);
    setTimeout(() => setAuditMessage(null), 4000);
  };

  // Synchronize to Gradebook
  const handleSyncToGradebookClick = async () => {
    if (gradingMode === 'DEMO') {
      setAuditMessage('CẢNH BÁO: Đang ở Chế độ Demo (Minh họa). Không thể đồng bộ dữ liệu giả vào Sổ điểm chính thức!');
      return;
    }

    const finalizedRecords = realSubmissions.filter(s => s.status === 'FINALIZED');
    if (finalizedRecords.length === 0) {
      setAuditMessage('Chưa có bài thi nào được Giáo viên ký duyệt (FINALIZED). Vui lòng hoàn tất duyệt điểm trước khi đồng bộ.');
      return;
    }

    if (!onSyncToGradebook) {
      setAuditMessage('Chức năng đồng bộ chưa được liên kết.');
      return;
    }

    setIsSyncing(true);
    setAuditMessage(`Đang ghi nhận ${finalizedRecords.length} kết quả vào Sổ điểm điện tử TT 22...`);

    try {
      const payload: SyncPayload = {
        className,
        subject,
        semester,
        academicYear,
        isDemo: false,
        assessmentId: `ASM_${className}_${subject}_${semester}`.replace(/\s+/g, '_'),
        records: finalizedRecords.map(s => ({
          studentCode: s.studentCode,
          fullName: s.fullName,
          score: s.finalScore,
          examCode: s.examCode,
          auditHash: s.auditRecords[s.auditRecords.length - 1]?.entryHash || 'NO_AUDIT',
          reviewedAt: Date.now(),
          teacherNote: s.teacherNote
        }))
      };

      const result = await onSyncToGradebook(payload);
      if (result.success) {
        setAuditMessage(`THÀNH CÔNG: ${result.message} (Đã xác minh ${result.writtenCount} bản ghi)`);
      } else {
        setAuditMessage(`LỖI ĐỒNG BỘ: ${result.message}`);
      }
    } catch (err: any) {
      setAuditMessage(`Lỗi hệ thống: ${err?.message || 'Không thể đồng bộ'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* HEADER & MODE SELECTOR */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">EduViet AI Grading</h2>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  gradingMode === 'REAL' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {gradingMode === 'REAL' ? 'CHẾ ĐỘ CHẤM THỰC TẾ' : 'MINH HỌA (SANDBOX DEMO)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Phân hệ Chấm bài Sư phạm Chuẩn GDPT/GDTX (TT 22, QĐ 764) & GDNN (Điều 15 TT 04)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Toggle Button */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setGradingMode('REAL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  gradingMode === 'REAL'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Chấm Thật
              </button>
              <button
                onClick={() => setGradingMode('DEMO')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  gradingMode === 'DEMO'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Demo Mẫu
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DEMO SANDBOX WARNING BANNER */}
        {gradingMode === 'DEMO' && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>CHẾ ĐỘ MINH HỌA GIẢ LẬP:</strong> Mọi bài thi và điểm số hiển thị là dữ liệu demo. Tính năng đồng bộ sổ điểm bị khóa để đảm bảo an toàn cơ sở dữ liệu học sinh.</span>
            </div>
            <button
              onClick={() => setGradingMode('REAL')}
              className="underline font-bold hover:text-amber-900 dark:hover:text-white"
            >
              Chuyển sang Chấm Thật
            </button>
          </div>
        )}

        {/* CONFIGURATION BAR */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Bậc học:</span>
            <select
              value={educationTrack}
              onChange={(e) => setEducationTrack(e.target.value as EducationTrack)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200"
            >
              <option value="THPT">THPT (GDPT 2018)</option>
              <option value="THCS">THCS</option>
              <option value="GDTX">GDTX</option>
              <option value="GDNN">GDNN (Trung cấp/CĐ nghề)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Lớp:</span>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Môn học:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-44 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Học kỳ:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200"
            >
              <option value="Học kỳ I">Học kỳ I</option>
              <option value="Học kỳ II">Học kỳ II</option>
              <option value="Cả năm">Cả năm</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800/40">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Bảo mật SHA-256 Hash Chain
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('trac_nghiem')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'trac_nghiem'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            1. Quét & Chấm Trắc Nghiệm ({activeSubmissions.length})
          </button>

          <button
            onClick={() => setActiveTab('dung_sai')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dung_sai'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            2. Đúng - Sai 4 Ý (THPT 2025)
          </button>

          <button
            onClick={() => setActiveTab('tu_luan')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tu_luan'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            3. Trả lời ngắn & Tự luận
          </button>

          <button
            onClick={() => setActiveTab('gdnn')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'gdnn'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-4 h-4" />
            4. Chấm 2 người GDNN (Điều 15 TT 04)
          </button>

          <button
            onClick={() => setActiveTab('soat_xet')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'soat_xet'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            5. Bàn Soát Xét & Sổ Điểm
          </button>
        </div>

        {/* AUDIT MESSAGE / NOTIFICATION */}
        {auditMessage && (
          <div className="bg-indigo-600 text-white px-6 py-2 text-xs flex items-center justify-between animate-fade-in">
            <span>{auditMessage}</span>
            <button onClick={() => setAuditMessage(null)} className="opacity-80 hover:opacity-100">✕</button>
          </div>
        )}

        {/* MODAL BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: QUÉT & CHẤM TRẮC NGHIỆM */}
          {activeTab === 'trac_nghiem' && (
            <div className="space-y-6">
              {gradingMode === 'REAL' ? (
                /* REAL SCAN UPLOAD AREA */
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-6 text-center bg-indigo-50/30 dark:bg-indigo-950/10 hover:bg-indigo-50/60 transition-all">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleFilesSelected(e.target.files)}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tải lên Phiếu Quét Bài Thi Thực Tế</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Hỗ trợ định dạng ảnh chụp chất lượng cao (PNG, JPG, WebP) có đủ 4 dấu góc chuẩn. Tối đa 15MB/file. (File PDF cần chuyển sang ảnh PNG/JPEG trước khi tải lên).
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Chọn File Từ Máy Tính
                      </button>
                      {uploadedFiles.length > 0 && (
                        <button
                          onClick={handleProcessUploadedFiles}
                          disabled={isProcessingFiles}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          {isProcessingFiles ? 'Đang Nhận Dạng & Chấm...' : `Bắt Đầu Chấm (${uploadedFiles.length} bài)`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Files Grid */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>Danh sách phiếu quét đã nạp ({uploadedFiles.length} file)</span>
                        <button
                          onClick={() => setUploadedFiles([])}
                          className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {uploadedFiles.map(f => (
                          <div key={f.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3 overflow-hidden">
                              {f.previewUrl ? (
                                <img src={f.previewUrl} alt={f.name} className="w-10 h-10 object-cover rounded-lg shrink-0 border" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                                  <FileText className="w-5 h-5" />
                                </div>
                              )}
                              <div className="truncate">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{f.name}</p>
                                <p className="text-[10px] text-slate-400">{(f.size / 1024).toFixed(1)} KB • Sẵn sàng</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(f.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* DEMO MODE OVERVIEW */
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase">Dữ liệu mẫu kiểm thử trắc nghiệm (3 học sinh giả lập)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Phần mềm đang hiển thị kết quả kiểm thử OMR với các ca kiểm thử chuẩn: học sinh làm đúng toàn diện, học sinh tô mờ/tô đè, và học sinh có điểm đã duyệt.
                  </p>
                </div>
              )}

              {/* Submissions Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Mã Thí Sinh</th>
                      <th className="px-4 py-3">Họ và Tên</th>
                      <th className="px-3 py-3">Mã Đề</th>
                      <th className="px-3 py-3">Đúng / Tổng</th>
                      <th className="px-3 py-3">Điểm Đề Xuất</th>
                      <th className="px-3 py-3">Điểm Duyệt</th>
                      <th className="px-3 py-3">Trạng Thái</th>
                      <th className="px-4 py-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeSubmissions.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                        <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{s.studentCode}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.fullName}</td>
                        <td className="px-3 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{s.examCode}</td>
                        <td className="px-3 py-3">{s.mcqCorrect} / {s.mcqTotal}</td>
                        <td className="px-3 py-3 font-bold text-slate-700 dark:text-slate-300">{s.suggestedScore.toFixed(2)}</td>
                        <td className="px-3 py-3 font-bold text-emerald-600 dark:text-emerald-400">{s.finalScore.toFixed(2)}</td>
                        <td className="px-3 py-3">
                          {s.status === 'FINALIZED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              Đã ký duyệt
                            </span>
                          )}
                          {s.status === 'SUGGESTED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                              Máy đề xuất
                            </span>
                          )}
                          {s.status === 'FLAGGED_REVIEW' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" />
                              Cần soát xét
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedSubId(s.id);
                              setOverrideScore(s.finalScore);
                              setActiveTab('soat_xet');
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] transition-all cursor-pointer"
                          >
                            Soát xét
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activeSubmissions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                          Chưa có bài thi nào được nạp. Vui lòng tải file phiếu thi ở trên để bắt đầu chấm.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ĐÚNG - SAI 4 Ý (THPT 2025) */}
          {activeTab === 'dung_sai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase">Quy chuẩn Tính điểm Đúng - Sai 4 Ý (Điều 2 QĐ 764/QĐ-BGDĐT)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    1 ý đúng: <strong>0.10đ</strong> • 2 ý đúng: <strong>0.25đ</strong> • 3 ý đúng: <strong>0.50đ</strong> • 4 ý đúng: <strong>1.00đ</strong>. Áp dụng fail-closed đối với đáp án thiếu.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                  Toán học 16/16 Tổ Hợp Đạt Chuẩn
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Minh Họa Chấm Câu Đúng - Sai (Học sinh {activeSub?.fullName || 'N/A'})</h5>
                  
                  <div className="space-y-2">
                    {['Câu 1', 'Câu 2', 'Câu 3', 'Câu 4'].map((qTitle, qIdx) => {
                      const count = activeSub?.tfCorrectCounts[qIdx] ?? 0;
                      const score = count === 4 ? 1.0 : count === 3 ? 0.5 : count === 2 ? 0.25 : count === 1 ? 0.1 : 0.0;
                      return (
                        <div key={qTitle} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/20">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{qTitle}</span>
                            <span className="text-slate-400 ml-2">(Số ý đúng: {count}/4)</span>
                          </div>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{score.toFixed(2)} / 1.00 điểm</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3 text-xs">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Bảng Thẩm Định Độ Nhạy & Kháng Nhầm Lẫn</h5>
                  <p className="text-slate-500">
                    Thuật toán tự động kích hoạt cờ cảnh báo (Flag for Review) nếu học sinh tô đè đồng thời phương án Đúng và Sai, hoặc tô mờ dưới ngưỡng nhận diện quang học.
                  </p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1">
                    <div>✓ Đủ 4 ý a,b,c,d: Xác thực toàn vẹn ma trận đề</div>
                    <div>✓ Không mặc định đáp án: Fail-closed an toàn</div>
                    <div>✓ Kháng Prompt Injection: Bộ lọc từ khóa độc hại</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRẢ LỜI NGẮN & TỰ LUẬN */}
          {activeTab === 'tu_luan' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Quy chuẩn Chấm Trả Lời Ngắn (Số học, Đơn vị SI & Dung sai Rubric)</h4>
                <p className="text-xs text-slate-500">
                  Chuẩn hóa dấu phẩy số học tiếng Việt ('2,5' = '2.5'), đối sánh đơn vị đo lường (ôm, ohm, Ω) và kiểm soát nghiêm ngặt dung sai theo Rubric đã được phê duyệt.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Kết Quả Đối Soát Câu Trả Lời Ngắn</h5>
                <div className="space-y-2 text-xs">
                  <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Câu 1: Tính điện áp định mức (Chuẩn hóa dấu phẩy & đơn vị)</p>
                      <p className="text-slate-500 text-[11px]">Đáp án chuẩn: <strong>2.5 V</strong> • Bài làm học sinh: <strong>2,5 V</strong></p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Đúng (+0.50 điểm)</span>
                  </div>

                  <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Câu 2: Điện trở tương đương (Bí danh đơn vị ohm / ôm)</p>
                      <p className="text-slate-500 text-[11px]">Đáp án chuẩn: <strong>120 ôm</strong> • Bài làm học sinh: <strong>120 ohm</strong></p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Đúng (+0.50 điểm)</span>
                  </div>

                  <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Câu 3: Cường độ dòng điện (Dung sai tỷ đối 2%)</p>
                      <p className="text-slate-500 text-[11px]">Đáp án chuẩn: <strong>0.05 A</strong> • Bài làm học sinh: <strong>0.051 A</strong></p>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Đúng (Dung sai ±2%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHẤM 2 NGƯỜI GDNN (ĐIỀU 15 TT 04/2022/TT-BLĐTBXH) */}
          {activeTab === 'gdnn' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200 uppercase">
                    Quy Trình Chấm 2 Người Độc Lập GDNN (Điều 15 khoản 2 Thông tư 04/2022/TT-BLĐTBXH)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Căn cứ pháp lý chính thức: Điểm thi là trung bình cộng điểm 2 cán bộ chấm. Nếu chênh lệch <strong>dưới 1.0 điểm</strong>: Lấy trung bình cộng. Nếu chênh lệch <strong>từ 1.0 điểm trở lên</strong>: Bắt buộc xem xét chấm lại; nếu không thống nhất, Trưởng khoa/Trưởng bộ môn quyết định điểm cuối cùng.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Mã Phách Ẩn Danh</th>
                      <th className="px-4 py-3">Mô-đun Đào Tạo</th>
                      <th className="px-3 py-3">Giám Khảo 1</th>
                      <th className="px-3 py-3">Giám Khảo 2</th>
                      <th className="px-3 py-3">Độ Lệch Điểm</th>
                      <th className="px-3 py-3">Điểm Chính Thức</th>
                      <th className="px-4 py-3">Quyết Định Pháp Lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {gdnnCases.map(c => {
                      const evalResult = evaluateGdnnDoubleBlind(c.id, c.blindCode, c.evaluator1, c.evaluator2);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.blindCode}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{c.module}</td>
                          <td className="px-3 py-3 font-semibold">{c.evaluator1.toFixed(1)}</td>
                          <td className="px-3 py-3 font-semibold">{c.evaluator2.toFixed(1)}</td>
                          <td className="px-3 py-3 font-bold">
                            <span className={evalResult.discrepancyLevel === 'WITHIN_LEGAL_TOLERANCE' ? 'text-emerald-600' : 'text-rose-600'}>
                              {evalResult.scoreDifference.toFixed(2)} điểm
                            </span>
                          </td>
                          <td className="px-3 py-3 font-bold text-slate-900 dark:text-white">
                            {evalResult.resolvedFinalScore !== null ? `${evalResult.resolvedFinalScore.toFixed(1)} điểm` : 'Chờ Chấm Lại'}
                          </td>
                          <td className="px-4 py-3">
                            {evalResult.resolutionStatus === 'AGREED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Đồng thuận hợp lệ (&lt; 1.0đ)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1 w-max">
                                <ShieldAlert className="w-3 h-3" />
                                Vượt ngưỡng luật định (≥ 1.0đ)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BÀN SOÁT XÉT ĐIỂM & ĐỒNG BỘ SỔ ĐIỂM */}
          {activeTab === 'soat_xet' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Submissions List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Danh Sách Bài Thi</h4>
                  <span className="text-[11px] text-slate-400">{activeSubmissions.length} thí sinh</span>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {activeSubmissions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedSubId(s.id);
                        setOverrideScore(s.finalScore);
                        setOverrideReason(s.teacherNote || '');
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        activeSub?.id === s.id
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{s.fullName}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{s.finalScore.toFixed(2)} đ</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{s.studentCode} • Đề {s.examCode}</span>
                        {s.status === 'FINALIZED' ? (
                          <span className="text-emerald-600 font-semibold">Đã duyệt</span>
                        ) : s.status === 'FLAGGED_REVIEW' ? (
                          <span className="text-amber-600 font-semibold">Cần soát</span>
                        ) : (
                          <span className="text-sky-600">Đề xuất</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SỔ ĐIỂM SYNC BUTTON */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {gradingMode === 'DEMO' ? (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-300 text-center font-medium">
                      ⚠️ Chế độ Mô phỏng (Demo Sandbox): Chức năng đồng bộ bị khóa để bảo vệ dữ liệu sổ điểm thật.
                    </div>
                  ) : null}
                  <button
                    onClick={handleSyncToGradebookClick}
                    disabled={isSyncing || gradingMode === 'DEMO' || activeSubmissions.filter(s => s.status === 'FINALIZED').length === 0}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {isSyncing ? 'Đang Ghi Vào Sổ Điểm...' : `Đồng Bộ Vào Sổ Điểm TT 22 (${activeSubmissions.filter(s => s.status === 'FINALIZED').length} bài)`}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Chỉ những bài thi đã ký duyệt (FINALIZED) trong Chế độ Thật mới được phép đồng bộ.
                  </p>
                </div>
              </div>

              {/* Middle & Right: Active Submission Review & Override Desk */}
              <div className="md:col-span-2 space-y-4">
                {activeSub ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeSub.fullName}</h4>
                        <p className="text-xs text-slate-500">Mã: {activeSub.studentCode} • Lớp: {className} • Mã đề: {activeSub.examCode}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Điểm hiện tại</span>
                        <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{activeSub.finalScore.toFixed(2)} điểm</div>
                      </div>
                    </div>

                    {/* Flags / Anomalies */}
                    {activeSub.flags.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Cảnh báo quang học phát hiện bởi hệ thống:
                        </div>
                        {activeSub.flags.map((flag, i) => (
                          <div key={i} className="pl-5">• {flag}</div>
                        ))}
                      </div>
                    )}

                    {/* Override Form */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Quyền Phê Duyệt & Điều Chỉnh Điểm Của Giáo Viên (Human-in-the-Loop)</h5>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1">Điểm máy đề xuất:</label>
                          <input
                            type="text"
                            disabled
                            value={`${activeSub.suggestedScore.toFixed(2)} điểm`}
                            className="w-full bg-slate-200 dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 dark:text-slate-400 block mb-1">Điểm giáo viên duyệt:</label>
                          <input
                            type="number"
                            step="0.05"
                            min="0"
                            max="10"
                            value={overrideScore}
                            onChange={(e) => setOverrideScore(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                          Lý do điều chỉnh hoặc ghi chú sư phạm:
                        </label>
                        <input
                          type="text"
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          placeholder="Ví dụ: Đã đối chiếu phiếu gốc, học sinh sửa phương án câu 28 rõ ràng..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleApproveScore(activeSub.id, false)}
                          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Duyệt Nguyên Trạng Máy Chấm ({activeSub.suggestedScore.toFixed(2)} đ)
                        </button>
                        <button
                          onClick={() => handleApproveScore(activeSub.id, true)}
                          className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-4 h-4" />
                          Lưu Điểm Điều Chỉnh ({overrideScore.toFixed(2)} đ)
                        </button>
                      </div>
                    </div>

                    {/* Cryptographic Tamper-evident Audit Trail */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Nhật Ký Kiểm Toán Mật Mã Bất Biến (SHA-256 Hash Chain)</span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {verifyAuditChain(activeSub.auditRecords) ? 'Chuỗi toàn vẹn xác thực' : 'Cảnh báo: Chuỗi bị can thiệp'}
                        </span>
                      </div>

                      {activeSub.auditRecords.length > 0 ? (
                        <div className="space-y-1.5">
                          {activeSub.auditRecords.map((rec, i) => (
                            <div key={i} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 font-mono text-[11px] space-y-0.5">
                              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                <span>Khối #{i + 1} • {rec.action} ({rec.originalScore.toFixed(2)} → {rec.reviewedScore.toFixed(2)} đ)</span>
                                <span className="text-[10px] text-slate-400">{new Date(rec.timestamp).toLocaleTimeString('vi-VN')}</span>
                              </div>
                              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                                Mã băm: {rec.entryHash}
                              </div>
                              {rec.reason && (
                                <div className="text-[10px] text-slate-500 font-sans italic">
                                  Ghi chú: {rec.reason}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-slate-400 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                          Chưa có nhật ký phê duyệt cho thí sinh này. Hãy nhấn nút duyệt ở trên để tạo khối băm đầu tiên.
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    Chọn một thí sinh từ danh sách bên trái để tiến hành soát xét và duyệt điểm.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Hệ thống chấm nội bộ Staging — Bảo mật tuyệt đối dữ liệu học sinh (Luật 91/2025/QH15)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all cursor-pointer"
          >
            Đóng Giao Diện
          </button>
        </div>

      </div>
    </div>
  );
}
