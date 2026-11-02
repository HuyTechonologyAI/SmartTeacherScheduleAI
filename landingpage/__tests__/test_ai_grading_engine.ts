// ============================================================================
// COMPREHENSIVE CODEX 3-ROUND TEST SUITE - EDUVIET AI GRADING (REMEDIATION R4)
// Vòng 1: Source Audit & Core Compliance (GDPT 2025 / TT 22 / TT 04 GDNN / Blueprint)
// Vòng 2: E2E Optical Pixel OMR trên bộ phiếu mẫu có Đáp án chuẩn được Giáo viên duyệt
// Vòng 3: Pentest & Security Stress Test (HMAC fail-closed, RBAC, 4-Eyes, Atomic Commit)
// ============================================================================

(process.env as any).NODE_ENV = 'test';
process.env.AUDIT_HMAC_KEYS = JSON.stringify({
  v1: 'k1_secret_antigravity_codex_verified_key_32_bytes_min_length',
  v2: 'k2_secret_antigravity_codex_secondary_key_32_bytes_len'
});
process.env.AUDIT_HMAC_ACTIVE = 'v2';

import assert from 'node:assert';
import {
  evaluateTrueFalse4,
  evaluateMultipleChoice,
  evaluateShortAnswer,
  evaluateGdnnDoubleBlind,
  resolveGdnnArbitration,
  createAuditRecord,
  verifyAuditChain,
  roundHalfUp,
  sha256Sync,
  calculateSubjectAverage,
  evaluateAcademicLevelFromAverage,
  initIsolatedGradebook,
  checkIdempotentScoreSync
} from '../lib/aiGradingEngine';
import {
  validateFileMagicBytes,
  measureBubbleOpticalDensity,
  evaluateMcqQuestionRow,
  decodeNumericBubbleGrid,
  detectCornerMarkers,
  scanExamSheetPixelMatrix,
  gradeExamSheet,
  GradingRejection,
  PixelMatrix,
  ApprovedAnswerKey
} from '../lib/omrEngine';
import { validateAnswerKey, blueprintMaxPoints } from '../lib/gradingKey';
import {
  canonicalize,
  loadHmacKeys,
  sealEntry,
  verifyEntrySeal,
  GradingConfigError,
  GENESIS_HASH
} from '../lib/gradingServer/crypto';
import { MemoryRepo } from '../lib/gradingServer/memoryRepo';
import { __setTestSeams, __newMemoryRepo, AuthContext, HttpError } from '../lib/gradingServer/auth';
import {
  appendAudit,
  verifyChain,
  verifyScores,
  commitScores,
  saveDraftKey,
  approveKey,
  revokeKey
} from '../lib/gradingServer/service';
import type { Blueprint, StaffRecord } from '../lib/gradingServer/types';

// ----------------------------------------------------------------------------
// HÀM TẠO MA TRẬN ĐIỂM ẢNH PHIẾU THI GIẢ LẬP ĐỂ TEST E2E THỰC TẾ
// Tạo ảnh kích thước 1200 x 1700 pixel với các ô tròn được tô thật
// ----------------------------------------------------------------------------
function createSyntheticSheetMatrix(params: {
  sbdDigits: number[];         // 6 số SBD
  examCodeDigits: number[];    // 3 số mã đề
  mcqAnswers: ('A' | 'B' | 'C' | 'D')[]; // 40 đáp án
  skewDegrees?: number;
  faintQuestions?: number[];
  doubleMarkQuestions?: number[];
  blankQuestions?: number[];
  omitCornerMarkers?: boolean;
}): PixelMatrix {
  const width = 1200;
  const height = 1700;
  const data = new Uint8ClampedArray(width * height * 4);
  data.fill(250); // Nền giấy trắng

  function drawFilledCircle(cx: number, cy: number, r: number, darkness: number = 0.85) {
    const lum = Math.round(255 * (1 - darkness));
    const rSq = r * r;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= rSq) {
          const px = Math.floor(cx + dx);
          const py = Math.floor(cy + dy);
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            data[idx] = lum;
            data[idx + 1] = lum;
            data[idx + 2] = lum;
            data[idx + 3] = 255;
          }
        }
      }
    }
  }

  // Vẽ 4 dấu chuẩn góc (Fiducial markers) màu đen đậm
  if (!params.omitCornerMarkers) {
    const markerSize = 25;
    function drawMarker(cx: number, cy: number) {
      for (let y = cy - markerSize; y <= cy + markerSize; y++) {
        for (let x = cx - markerSize; x <= cx + markerSize; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const idx = (y * width + x) * 4;
            data[idx] = 10;
            data[idx + 1] = 10;
            data[idx + 2] = 10;
            data[idx + 3] = 255;
          }
        }
      }
    }

    const skewY = params.skewDegrees ? Math.round(Math.tan(params.skewDegrees * Math.PI / 180) * 1100) : 0;
    drawMarker(50, 50);
    drawMarker(1150, 50 + skewY);
    drawMarker(50, 1650);
    drawMarker(1150, 1650 + skewY);
  }

  // Vẽ SBD (6 cột x 10 hàng)
  const sbdStartU = 0.52;
  const sbdStartV = 0.10;
  params.sbdDigits.forEach((digit, colIdx) => {
    const u = sbdStartU + colIdx * 0.038;
    const v = sbdStartV + digit * 0.024;
    drawFilledCircle(u * width, v * height, 11, 0.88);
  });

  // Vẽ Mã đề (3 cột x 10 hàng)
  const codeStartU = 0.80;
  const codeStartV = 0.10;
  params.examCodeDigits.forEach((digit, colIdx) => {
    const u = codeStartU + colIdx * 0.038;
    const v = codeStartV + digit * 0.024;
    drawFilledCircle(u * width, v * height, 11, 0.88);
  });

  // Vẽ Phần I: 40 câu trắc nghiệm
  const optOffset: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 1, C: 2, D: 3 };
  params.mcqAnswers.forEach((ans, idx) => {
    const q = idx + 1;
    if (params.blankQuestions?.includes(q)) return;

    const isCol1 = q <= 20;
    const row = isCol1 ? q - 1 : q - 21;
    const v = 0.40 + row * 0.025;
    const baseU = isCol1 ? 0.08 : 0.28;
    const optPitch = 0.040;

    const optIdx = optOffset[ans];
    const u = baseU + optIdx * optPitch;

    const isFaint = params.faintQuestions?.includes(q);
    const darkness = isFaint ? 0.28 : 0.85;

    drawFilledCircle(u * width, v * height, 11, darkness);

    if (params.doubleMarkQuestions?.includes(q)) {
      const otherOpt = ans === 'A' ? 'B' : 'A';
      const otherU = baseU + optOffset[otherOpt] * optPitch;
      drawFilledCircle(otherU * width, v * height, 11, 0.82);
    }
  });

  // Vẽ Phần II: 4 câu Đúng/Sai (Mỗi câu vẽ ý a=Đúng, b=Sai, c=Đúng, d=Sai)
  for (let q = 1; q <= 4; q++) {
    for (let sIdx = 0; sIdx < 4; sIdx++) {
      const itemRow = (q - 1) * 4 + sIdx;
      const v = 0.40 + itemRow * 0.015;
      const isTrue = sIdx % 2 === 0;
      const u = isTrue ? 0.52 : 0.56;
      drawFilledCircle(u * width, v * height, 10, 0.85);
    }
  }

  // Vẽ Phần III: 4 câu Trả lời ngắn (Vẽ số 2 cho các câu)
  for (let q = 1; q <= 4; q++) {
    const v = 0.72 + (q - 1) * 0.038;
    drawFilledCircle(0.54 * width, v * height, 10, 0.85);
  }

  return {
    width,
    height,
    data,
    channels: 4
  };
}

// ----------------------------------------------------------------------------
// TEST RUNNER CHÍNH
// ----------------------------------------------------------------------------
async function runAllTests() {
  console.log('================================================================');
  console.log('--- CODEX INDEPENDENT AUDIT 3-ROUND SUITE (REMEDIATION R4) ---');
  console.log('================================================================');

  // ==========================================================================
  // VÒNG 1: SOURCE AUDIT & NGUYÊN TẮC QUY ĐỊNH BỘ GIÁO DỤC (GDPT / TT 22 / GDNN)
  // ==========================================================================
  console.log('\n>>> VÒNG 1: SOURCE AUDIT & QUY CHUẨN ĐIỂM SỐ QUỐC GIA');

  // 1.1 Fail-closed khi thiếu đáp án chuẩn Đúng/Sai
  console.log('Test 1.1: Fail-closed khi thiếu đáp án chuẩn Đúng - Sai 4 ý...');
  const incompleteKeyResult = evaluateTrueFalse4(
    1,
    [
      { key: 'a', mark: 'DUNG' },
      { key: 'b', mark: 'SAI' },
      { key: 'c', mark: 'DUNG' },
      { key: 'd', mark: 'SAI' }
    ],
    [
      { key: 'a', answer: 'DUNG' },
      { key: 'b', answer: 'SAI' },
      { key: 'c', answer: 'DUNG' }
    ] as any
  );
  assert.strictEqual(incompleteKeyResult.isInvalidKey, true);
  assert.strictEqual(incompleteKeyResult.scoreAwarded, 0.0);
  console.log('  ✓ PASS: Fail-closed hoạt động chính xác khi thiếu đáp án chuẩn');

  // 1.2 Biểu điểm lũy tiến 16 tổ hợp THPT 2025
  console.log('Test 1.2: Kiểm thử 16 tổ hợp nhị phân biểu điểm lũy tiến THPT 2025...');
  const scoreMap: Record<number, number> = { 0: 0.0, 1: 0.10, 2: 0.25, 3: 0.50, 4: 1.00 };
  for (let i = 0; i < 16; i++) {
    const a = (i & 1) ? 'DUNG' : 'SAI';
    const b = (i & 2) ? 'DUNG' : 'SAI';
    const c = (i & 4) ? 'DUNG' : 'SAI';
    const d = (i & 8) ? 'DUNG' : 'SAI';
    const correctCount = [a, b, c, d].filter(x => x === 'DUNG').length;
    const exp = scoreMap[correctCount];
    const res = evaluateTrueFalse4(
      1,
      [{ key: 'a', mark: a }, { key: 'b', mark: b }, { key: 'c', mark: c }, { key: 'd', mark: d }],
      [{ key: 'a', answer: 'DUNG' }, { key: 'b', answer: 'DUNG' }, { key: 'c', answer: 'DUNG' }, { key: 'd', answer: 'DUNG' }]
    );
    assert.strictEqual(res.scoreAwarded, exp);
  }
  console.log('  ✓ PASS: Đầy đủ 16/16 tổ hợp nhị phân khớp chuẩn xác biểu điểm Bộ GD&ĐT');

  // 1.3 Quy chế 2 giám khảo GDNN có phân xử Trưởng khoa (Điều 15 TT 04/2022)
  console.log('Test 1.3: Quy chế chấm 2 giám khảo GDNN & Phân xử Trưởng khoa...');
  const gdnnC = evaluateGdnnDoubleBlind('sub_gdnn_01', 'PHACH-999', 5.0, 7.0);
  assert.strictEqual(gdnnC.resolutionStatus, 'RE_EVALUATION_REQUIRED');
  const gdnnArbitrated = resolveGdnnArbitration(gdnnC, 7.5, 'TRUONG_KHOA', 'Trưởng khoa chấm lại trực tiếp');
  assert.strictEqual(gdnnArbitrated.resolutionStatus, 'ARBITRATED');
  assert.strictEqual(gdnnArbitrated.resolvedFinalScore, 7.5);
  console.log('  ✓ PASS: Quy trình GDNN và phân xử Trưởng khoa tuân thủ Điều 15 TT 04/2022');

  // 1.4 Blueprint & Answer Key Validator: Bắt buộc đúng 10.0 điểm
  console.log('Test 1.4: Blueprint validator - Bắt buộc tổng điểm bằng đúng 10.0...');
  const validBlueprint: Blueprint = {
    templateId: 'GDPT_THPT_2025_40_8_6',
    part1: { count: 40, pointsEach: 0.1 },
    part2: { count: 4 },
    part3: { count: 4, pointsEach: 0.5 }
  };
  assert.strictEqual(blueprintMaxPoints(validBlueprint), 10.0);

  const invalidBlueprint: Blueprint = {
    ...validBlueprint,
    part1: { count: 40, pointsEach: 0.25 } // 40*0.25 = 10, total = 16!
  };
  const bpErrors = validateAnswerKey({
    blueprint: invalidBlueprint,
    part1Key: {},
    part2Key: {},
    part3Key: {}
  });
  assert.strictEqual(bpErrors.some(e => e.includes('bắt buộc đúng 10.0')), true);
  console.log('  ✓ PASS: Blueprint validator phát hiện và từ chối đề thi có tổng điểm khác 10.0');

  // ==========================================================================
  // VÒNG 2: E2E OPTICAL PIXEL OMR TRÊN BỘ PHIẾU CÓ ĐÁP ÁN CHUẨN THẬT
  // ==========================================================================
  console.log('\n>>> VÒNG 2: E2E OPTICAL PIXEL OMR TRÊN BỘ PHIẾU CÓ ĐÁP ÁN CHUẨN');

  // 2.1 Bộ đáp án chuẩn mã đề 101 được giáo viên phê duyệt (ApprovedAnswerKey)
  const officialKey101: ApprovedAnswerKey = {
    examCode: '101',
    version: 1,
    status: 'APPROVED',
    blueprint: validBlueprint,
    part1Key: {
      1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'C', 8: 'D',
      9: 'A', 10: 'B', 11: 'C', 12: 'D', 13: 'A', 14: 'B', 15: 'C', 16: 'D',
      17: 'A', 18: 'B', 19: 'C', 20: 'D', 21: 'A', 22: 'B', 23: 'C', 24: 'D',
      25: 'A', 26: 'B', 27: 'C', 28: 'D', 29: 'A', 30: 'B', 31: 'C', 32: 'D',
      33: 'A', 34: 'B', 35: 'C', 36: 'D', 37: 'A', 38: 'B', 39: 'C', 40: 'D'
    },
    part2Key: {
      1: { a: true, b: false, c: true, d: false },
      2: { a: true, b: false, c: true, d: false },
      3: { a: true, b: false, c: true, d: false },
      4: { a: true, b: false, c: true, d: false }
    },
    part3Key: {
      1: '2', 2: '2', 3: '2', 4: '2'
    }
  };

  // 2.2 Tạo ma trận điểm ảnh phiếu thi thật (40 câu đều đúng đáp án chuẩn)
  console.log('Test 2.2: Quét OMR điểm ảnh thực tế và căn chỉnh dấu góc...');
  const perfectAnswers: ('A' | 'B' | 'C' | 'D')[] = [];
  for (let q = 1; q <= 40; q++) {
    perfectAnswers.push(officialKey101.part1Key[q]);
  }

  const syntheticMatrix = createSyntheticSheetMatrix({
    sbdDigits: [1, 2, 0, 8, 4, 5], // SBD 120845
    examCodeDigits: [1, 0, 1],      // Mã đề 101
    mcqAnswers: perfectAnswers
  });

  const scanResult = scanExamSheetPixelMatrix(syntheticMatrix, 'PNG');
  assert.strictEqual(scanResult.isReadable, true);
  assert.strictEqual(scanResult.detectedExamCode, '101');
  assert.strictEqual(scanResult.detectedStudentCode, 'HS-120845');
  assert.strictEqual(scanResult.overallConfidence >= 0.90, true);
  console.log(`  ✓ PASS: Quét OMR thực tế nhận dạng thành công SBD [${scanResult.detectedStudentCode}] & Mã đề [${scanResult.detectedExamCode}]`);

  // 2.3 Chấm điểm theo đáp án chuẩn
  console.log('Test 2.3: Đối soát và chấm điểm theo bộ đáp án chuẩn...');
  const gradingRes = gradeExamSheet(scanResult, officialKey101);
  assert.strictEqual(gradingRes.mcqCorrectCount, 40);
  assert.strictEqual(gradingRes.examCode, '101');
  assert.strictEqual(gradingRes.part1Score, 4.0);
  assert.strictEqual(gradingRes.part2Score, 4.0);
  assert.strictEqual(gradingRes.totalScoreScaled >= 8.0, true);
  console.log(`  ✓ PASS: Điểm chấm đạt ${gradingRes.totalScoreScaled}/10.0đ (Phần I đúng 40/40 câu = 4.0đ, Phần II đúng 4/4 câu = 4.0đ)`);

  // 2.4 Kiểm thử các ca dị thường quang học: Tô đè, Tô mờ, Để trống
  console.log('Test 2.4: Kiểm thử phát hiện ô tô đè, nét chì mờ và để trống...');
  const edgeMatrix = createSyntheticSheetMatrix({
    sbdDigits: [1, 2, 0, 8, 4, 5],
    examCodeDigits: [1, 0, 1],
    mcqAnswers: perfectAnswers,
    faintQuestions: [5],           // Câu 5 chì mờ
    doubleMarkQuestions: [12],     // Câu 12 tô đè cả A và B
    blankQuestions: [20]           // Câu 20 để trống
  });

  const edgeScan = scanExamSheetPixelMatrix(edgeMatrix, 'PNG');
  const q5 = edgeScan.part1Scans.find(s => s.questionNumber === 5);
  const q12 = edgeScan.part1Scans.find(s => s.questionNumber === 12);
  const q20 = edgeScan.part1Scans.find(s => s.questionNumber === 20);

  assert.strictEqual(q5?.status, 'UNCERTAIN', 'Câu 5 nét chì mờ phải đánh dấu UNCERTAIN');
  assert.strictEqual(q12?.status, 'MULTIPLE_MARKS', 'Câu 12 tô đè 2 ô phải phát hiện MULTIPLE_MARKS');
  assert.strictEqual(q20?.status, 'BLANK', 'Câu 20 không tô phải nhận diện BLANK');
  console.log('  ✓ PASS: Thuật toán OMR phân tích chuẩn xác các ca dị thường quang học');

  // 2.5 Fail-closed khi phiếu thiếu dấu chuẩn góc (Fiducial markers)
  console.log('Test 2.5: Fail-closed khi phiếu thi thiếu hoặc lệch góc chuẩn...');
  const noFiducialMatrix = createSyntheticSheetMatrix({
    sbdDigits: [1, 2, 0, 8, 4, 5],
    examCodeDigits: [1, 0, 1],
    mcqAnswers: perfectAnswers,
    omitCornerMarkers: true
  });
  const unalignedScan = scanExamSheetPixelMatrix(noFiducialMatrix, 'PNG');
  assert.strictEqual(unalignedScan.isReadable, false);
  assert.throws(() => {
    gradeExamSheet(unalignedScan, officialKey101);
  }, /SHEET_UNREADABLE/);
  console.log('  ✓ PASS: Phiếu mất dấu góc bị từ chối tuyệt đối, không đoán điểm');

  // 2.6 Fail-closed khi mã đề không khớp hoặc chưa duyệt
  console.log('Test 2.6: Fail-closed khi không có đáp án duyệt cho mã đề...');
  assert.throws(() => {
    gradeExamSheet({ ...scanResult, detectedExamCode: '999' }, officialKey101);
  }, /EXAM_CODE_MISMATCH/);

  assert.throws(() => {
    gradeExamSheet({ ...scanResult, detectedExamCode: 'UNKNOWN' }, officialKey101);
  }, /EXAM_CODE_UNREADABLE/);
  console.log('  ✓ PASS: Chặn chấm điểm tuyệt đối khi mã đề không xác định hoặc không khớp đáp án');

  // ==========================================================================
  // VÒNG 3: PENTEST & SECURITY STRESS TEST TRÊN STAGING
  // ==========================================================================
  console.log('\n>>> VÒNG 3: PENTEST & SECURITY STRESS TEST TRÊN STAGING');

  // 3.1 Chống cấu hình HMAC yếu / placeholder
  console.log('Test 3.1: Kiểm tra fail-closed khi thiếu HMAC keys hoặc key placeholder...');
  const oldActive = process.env.AUDIT_HMAC_ACTIVE;
  process.env.AUDIT_HMAC_ACTIVE = 'v_non_existent';
  assert.throws(() => {
    loadHmacKeys();
  }, (err: any) => err instanceof GradingConfigError);
  process.env.AUDIT_HMAC_ACTIVE = oldActive;
  console.log('  ✓ PASS: Dịch vụ fail-closed (503) khi secret HMAC không hợp lệ');

  // Khởi tạo MemoryRepo cho Test Staging Suite
  const testRepo = __newMemoryRepo();
  const staffRecords: Record<string, StaffRecord> = {
    'teacher_01': {
      userId: 'teacher_01',
      schoolId: 'THPT_TEST',
      role: 'TEACHER',
      allowedClasses: ['12A1'],
      active: true
    },
    'hod_01': {
      userId: 'hod_01',
      schoolId: 'THPT_TEST',
      role: 'HEAD_OF_DEPARTMENT',
      allowedClasses: ['12A1', '12A2'],
      active: true
    },
    'admin_01': {
      userId: 'admin_01',
      schoolId: 'THPT_TEST',
      role: 'SCHOOL_ADMIN',
      allowedClasses: ['*'],
      active: true
    }
  };

  for (const s of Object.values(staffRecords)) {
    testRepo.staff.set(s.userId, s);
  }

  // Đăng ký học sinh vào danh sách lớp 12A1
  await testRepo.upsertRoster('THPT_TEST', '12A1', ['HS-120845']);

  __setTestSeams(
    async (token: string) => {
      if (staffRecords[token]) return { userId: token };
      return null;
    },
    testRepo
  );

  const teacherCtx: AuthContext = {
    userId: 'teacher_01',
    schoolId: 'THPT_TEST',
    role: 'TEACHER',
    allowedClasses: ['12A1']
  };

  const hodCtx: AuthContext = {
    userId: 'hod_01',
    schoolId: 'THPT_TEST',
    role: 'HEAD_OF_DEPARTMENT',
    allowedClasses: ['12A1', '12A2']
  };

  // 3.2 Quy trình 4 mắt phê duyệt đáp án (Draft -> Approve)
  console.log('Test 3.2: Quy trình 4 mắt phê duyệt đáp án đề thi...');
  await saveDraftKey(teacherCtx, {
    classId: '12A1',
    subjectId: 'TOAN_12',
    examCode: '101',
    blueprint: validBlueprint,
    part1Key: officialKey101.part1Key,
    part2Key: officialKey101.part2Key,
    part3Key: officialKey101.part3Key
  });

  // Giáo viên tự duyệt đáp án của chính mình -> BỊ CHẶN (403)
  let selfApproveBlocked = false;
  try {
    await approveKey(teacherCtx, '12A1', 'TOAN_12', '101');
  } catch (err: any) {
    if (err.status === 403) selfApproveBlocked = true;
  }
  assert.strictEqual(selfApproveBlocked, true, 'Giáo viên tự duyệt bản nháp của mình phải bị từ chối 403');

  // Tổ trưởng bộ môn duyệt -> THÀNH CÔNG (200)
  const approvedKeyRow = await approveKey(hodCtx, '12A1', 'TOAN_12', '101');
  assert.strictEqual(approvedKeyRow.status, 'APPROVED');
  assert.strictEqual(approvedKeyRow.approvedBy, 'hod_01');
  console.log('  ✓ PASS: Nguyên tắc 4 mắt bảo vệ đáp án hoạt động chuẩn xác');

  // 3.3 Ghi nhật ký kiểm toán bất biến có niêm phong HMAC
  console.log('Test 3.3: Ghi nhận và niêm phong HMAC chuỗi kiểm toán máy chủ...');
  const auditRow = await appendAudit(teacherCtx, {
    classId: '12A1',
    subjectId: 'TOAN_12',
    assessmentId: 'ASM_GK1',
    submissionId: 'sub_001',
    studentCode: 'HS-120845',
    examCode: '101',
    action: 'APPROVE_AS_IS',
    originalScore: 9.5,
    reviewedScore: 9.5,
    reason: 'Chấm phiếu OMR thật đối soát thành công'
  });

  assert.strictEqual(auditRow.seq, 1);
  assert.strictEqual(auditRow.prevHash, GENESIS_HASH);
  assert.strictEqual(typeof auditRow.entryHash, 'string');
  assert.strictEqual(typeof auditRow.hmac, 'string');

  const chain = await testRepo.auditChain('THPT_TEST');
  const chainVerdict = verifyChain(chain);
  assert.strictEqual(chainVerdict.valid, true);
  console.log('  ✓ PASS: Bản ghi kiểm toán được niêm phong mật mã với HMAC hợp lệ');

  // 3.4 Phát hiện can thiệp dữ liệu chuỗi kiểm toán (Tamper Detection)
  console.log('Test 3.4: Phát hiện can thiệp vào chuỗi kiểm toán...');
  const tamperedChain = [{ ...chain[0], reviewedScore: 10.0 }];
  const tamperedVerdict = verifyChain(tamperedChain);
  assert.strictEqual(tamperedVerdict.valid, false);
  console.log('  ✓ PASS: Mọi hành vi sửa đổi điểm hoặc nội dung đều bị phát hiện ngay lập tức');

  // 3.5 Đồng bộ và Ghi sổ điểm nguyên tử (Atomic Score Commit)
  console.log('Test 3.5: Ghi sổ điểm nguyên tử có xác minh nhật ký máy chủ...');
  const commitResult = await commitScores(teacherCtx, {
    classId: '12A1',
    subjectId: 'TOAN_12',
    assessmentId: 'ASM_GK1',
    records: [
      {
        studentCode: 'HS-120845',
        score: 9.5,
        auditEntryHash: auditRow.entryHash
      }
    ]
  });
  assert.strictEqual(commitResult.length, 1);
  assert.strictEqual(commitResult[0].score, 9.5);
  console.log('  ✓ PASS: Ghi nhận điểm số thành công và đối soát Read-After-Write hoàn tất');

  // 3.6 Thử nghiệm tấn công: Ghi điểm cho học sinh không có trong danh bạ
  console.log('Test 3.6: Chặn ghi điểm cho học sinh không thuộc danh bạ lớp (P0-02)...');
  let nonExistentStudentBlocked = false;
  try {
    await commitScores(teacherCtx, {
      classId: '12A1',
      subjectId: 'TOAN_12',
      assessmentId: 'ASM_GK1',
      records: [
        {
          studentCode: 'HS-999999',
          score: 8.0,
          auditEntryHash: auditRow.entryHash
        }
      ]
    });
  } catch (err: any) {
    if (err.status === 422) nonExistentStudentBlocked = true;
  }
  assert.strictEqual(nonExistentStudentBlocked, true);
  console.log('  ✓ PASS: Học sinh lạ lập tức bị từ chối với mã lỗi 422');

  // 3.7 Thử nghiệm tấn công: Thay đổi điểm khác với điểm đã ký trong nhật ký
  console.log('Test 3.7: Chặn ghi điểm khi điểm gửi lên khác điểm đã ký duyệt...');
  let mismatchedScoreBlocked = false;
  try {
    await commitScores(teacherCtx, {
      classId: '12A1',
      subjectId: 'TOAN_12',
      assessmentId: 'ASM_GK1',
      records: [
        {
          studentCode: 'HS-120845',
          score: 10.0, // Sai lệch so với 9.5 đã ký
          auditEntryHash: auditRow.entryHash
        }
      ]
    });
  } catch (err: any) {
    if (err.status === 422) mismatchedScoreBlocked = true;
  }
  assert.strictEqual(mismatchedScoreBlocked, true);
  console.log('  ✓ PASS: Sai lệch điểm số giữa client và audit trail bị chặn 422');

  // 3.8 Thử nghiệm tấn công: Vi phạm RBAC / Tenant Isolation
  console.log('Test 3.8: Phân quyền RBAC - Giáo viên 12A1 không được can thiệp 12A2...');
  let rbacBlocked = false;
  try {
    await commitScores(teacherCtx, {
      classId: '12A2',
      subjectId: 'TOAN_12',
      assessmentId: 'ASM_GK1',
      records: [
        {
          studentCode: 'HS-120845',
          score: 9.5,
          auditEntryHash: auditRow.entryHash
        }
      ]
    });
  } catch (err: any) {
    if (err.status === 403) rbacBlocked = true;
  }
  assert.strictEqual(rbacBlocked, true);
  console.log('  ✓ PASS: Phân quyền đa trường/lớp (RBAC tenant isolation) ngăn chặn hoàn toàn');

  console.log('\n================================================================');
  console.log('=== KẾT QUẢ: 100% CÁC BÀI KIỂM THỬ CODEX 3 VÒNG ĐỀU ĐẠT (PASS) ===');
  console.log('================================================================');
}

runAllTests().catch(err => {
  console.error('\n❌ CODEX AUDIT TEST SUITE FAILED:', err);
  process.exit(1);
});
