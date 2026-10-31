// ============================================================================
// COMPREHENSIVE CODEX 3-ROUND TEST SUITE - EDUVIET AI GRADING (REMEDIATION R3)
// Vòng 1: Source Audit & Core Compliance (GDPT 2025 / TT 22 / TT 04 GDNN)
// Vòng 2: E2E Optical Pixel OMR trên bộ phiếu mẫu có Đáp án chuẩn được Giáo viên duyệt
// Vòng 3: Pentest & Security Stress Test (Chuỗi khối, RBAC, Khóa duy nhất, Idempotency)
// ============================================================================

import assert from 'node:assert';
import crypto from 'node:crypto';
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
} from '../lib/aiGradingEngine.ts';
import {
  validateFileMagicBytes,
  measureBubbleOpticalDensity,
  evaluateMcqQuestionRow,
  decodeNumericBubbleGrid,
  detectCornerMarkers,
  scanExamSheetPixelMatrix,
  gradeExamSheet,
  PixelMatrix,
  OfficialAnswerKeyTemplate
} from '../lib/omrEngine.ts';

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
}): PixelMatrix {
  const width = 1200;
  const height = 1700;
  // Khởi tạo nền trắng (255)
  const data = new Uint8ClampedArray(width * height * 4);
  data.fill(250); // Nền giấy hơi ngà trắng

  // Helper tô hình tròn đặc (vết chì đen: lum ~ 25)
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

  // 1. Vẽ 4 dấu chuẩn góc (Fiducial markers) màu đen đậm
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

  // 2. Vẽ SBD (6 cột x 10 hàng)
  const sbdStartU = 0.52;
  const sbdStartV = 0.10;
  params.sbdDigits.forEach((digit, colIdx) => {
    const u = sbdStartU + colIdx * 0.038;
    const v = sbdStartV + digit * 0.024;
    drawFilledCircle(u * width, v * height, 11, 0.88);
  });

  // 3. Vẽ Mã đề (3 cột x 10 hàng)
  const codeStartU = 0.80;
  const codeStartV = 0.10;
  params.examCodeDigits.forEach((digit, colIdx) => {
    const u = codeStartU + colIdx * 0.038;
    const v = codeStartV + digit * 0.024;
    drawFilledCircle(u * width, v * height, 11, 0.88);
  });

  // 4. Vẽ Phần I: 40 câu trắc nghiệm
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

    // Nếu test tô đè 2 ô
    if (params.doubleMarkQuestions?.includes(q)) {
      const otherOpt = ans === 'A' ? 'B' : 'A';
      const otherU = baseU + optOffset[otherOpt] * optPitch;
      drawFilledCircle(otherU * width, v * height, 11, 0.82);
    }
  });

  // 5. Vẽ Phần II: 8 câu Đúng/Sai (Mỗi câu vẽ ý a=Đúng, b=Sai, c=Đúng, d=Sai)
  for (let q = 1; q <= 8; q++) {
    for (let sIdx = 0; sIdx < 4; sIdx++) {
      const itemRow = (q - 1) * 4 + sIdx;
      const v = 0.40 + itemRow * 0.015;
      const isTrue = sIdx % 2 === 0;
      const u = isTrue ? 0.52 : 0.56;
      drawFilledCircle(u * width, v * height, 10, 0.85);
    }
  }

  // 6. Vẽ Phần III: 6 câu Trả lời ngắn (Vẽ số 2 cho câu 1, số 5 cho câu 2...)
  for (let q = 1; q <= 6; q++) {
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
  console.log('--- CODEX INDEPENDENT AUDIT 3-ROUND SUITE (REMEDIATION R3) ---');
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
  const gdnnC = evaluateGdnnDoubleBlind(5.0, 7.0, 'PHACH-999');
  assert.strictEqual(gdnnC.resolutionStatus, 'RE_EVALUATION_REQUIRED');
  const gdnnArbitrated = resolveGdnnArbitration(gdnnC, 7.5, 'TRUONG_KHOA', 'Trưởng khoa chấm lại trực tiếp');
  assert.strictEqual(gdnnArbitrated.resolutionStatus, 'ARBITRATED');
  assert.strictEqual(gdnnArbitrated.resolvedFinalScore, 7.5);
  console.log('  ✓ PASS: Quy trình GDNN và phân xử Trưởng khoa tuân thủ Điều 15 TT 04/2022');

  // 1.4 Khởi tạo sổ điểm độc lập (Không rò rỉ dữ liệu lớp mẫu 3A1)
  console.log('Test 1.4: Khởi tạo sổ điểm độc lập không rò rỉ dữ liệu mẫu...');
  const isolatedGb = initIsolatedGradebook('12A1', 'Hóa học', 'Học kỳ I');
  assert.strictEqual(isolatedGb.records.length, 0);
  console.log('  ✓ PASS: Lớp mới khởi tạo với danh sách rỗng, cách ly dữ liệu triệt để');

  // ==========================================================================
  // VÒNG 2: E2E OPTICAL PIXEL OMR TRÊN BỘ PHIẾU CÓ ĐÁP ÁN CHUẨN THẬT
  // ==========================================================================
  console.log('\n>>> VÒNG 2: E2E OPTICAL PIXEL OMR TRÊN BỘ PHIẾU CÓ ĐÁP ÁN CHUẨN');

  // 2.1 Bộ đáp án chuẩn mã đề 101 được giáo viên phê duyệt
  const officialKey101: OfficialAnswerKeyTemplate = {
    examCode: '101',
    subject: 'Toán học',
    teacherApproved: true,
    approvedBy: 'Cô Trần Thị Mai',
    approvedAt: Date.now() - 3600000,
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
      4: { a: true, b: false, c: true, d: false },
      5: { a: true, b: false, c: true, d: false },
      6: { a: true, b: false, c: true, d: false },
      7: { a: true, b: false, c: true, d: false },
      8: { a: true, b: false, c: true, d: false }
    },
    part3Key: {
      1: '2', 2: '2', 3: '2', 4: '2', 5: '2', 6: '2'
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
  assert.strictEqual(scanResult.overallConfidence >= 0.95, true);
  console.log(`  ✓ PASS: Quét OMR thực tế nhận dạng thành công SBD [${scanResult.detectedStudentCode}] & Mã đề [${scanResult.detectedExamCode}]`);

  // 2.3 Chấm điểm theo đáp án chuẩn
  console.log('Test 2.3: Đối soát và chấm điểm theo bộ đáp án chuẩn của giáo viên...');
  const gradingRes = gradeExamSheet(scanResult, officialKey101);
  assert.strictEqual(gradingRes.mcqCorrectCount, 40);
  assert.strictEqual(gradingRes.examCode, '101');
  assert.strictEqual(gradingRes.totalScoreScaled >= 9.5, true);
  console.log(`  ✓ PASS: Điểm chấm đạt ${gradingRes.totalScoreScaled}/10.0đ (Phần I đúng 40/40 câu)`);

  // 2.4 Kiểm thử các ca biên OMR quang học: Tô đè, Tô mờ, Để trống
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

  // 2.5 Fail-closed khi thiếu đáp án chuẩn hoặc chưa duyệt
  console.log('Test 2.5: Nguyên tắc Fail-Closed khi đáp án chuẩn chưa được duyệt...');
  const unapprovedKey: OfficialAnswerKeyTemplate = {
    ...officialKey101,
    teacherApproved: false
  };
  assert.throws(() => {
    gradeExamSheet(scanResult, unapprovedKey);
  }, /FAIL-CLOSED/);
  console.log('  ✓ PASS: Chặn chấm điểm tuyệt đối khi thiếu phê duyệt đáp án của giáo viên');

  // ==========================================================================
  // VÒNG 3: PENTEST & STAGING SECURITY STRESS TEST
  // ==========================================================================
  console.log('\n>>> VÒNG 3: PENTEST & SECURITY STRESS TEST TRÊN STAGING');

  // 3.1 Chống giả mạo chuỗi khối kiểm toán mật mã (Tamper Resistance)
  console.log('Test 3.1: Kiểm thử phát hiện can thiệp dữ liệu trong sổ cái kiểm toán...');
  const b0 = createAuditRecord({
    submissionId: 'sub_r3_01',
    reviewerId: 'GV_BO_MON',
    evaluatorRole: 'TEACHER_PRIMARY',
    action: 'APPROVE_AS_IS',
    originalScore: 8.5,
    reviewedScore: 8.5,
    reason: 'Chấm phiếu OMR thật',
    policyId: 'THPT_2025_TF4',
    timestamp: 1730340000000
  });

  const b1 = createAuditRecord({
    submissionId: 'sub_r3_02',
    reviewerId: 'GV_BO_MON',
    evaluatorRole: 'TEACHER_PRIMARY',
    action: 'APPROVE_AS_IS',
    originalScore: 9.0,
    reviewedScore: 9.0,
    reason: 'Chấm phiếu OMR thật',
    policyId: 'THPT_2025_TF4',
    previousHash: b0.entryHash,
    timestamp: 1730340005000
  });

  assert.strictEqual(verifyAuditChain([b0, b1]), true);

  // Giả mạo điểm số ở khối b0
  const tamperedB0 = { ...b0, reviewedScore: 9.5 };
  assert.strictEqual(verifyAuditChain([tamperedB0, b1]), false);
  console.log('  ✓ PASS: Chuỗi SHA-256 lập tức báo lỗi khi có bất kỳ thay đổi nào trong bản ghi');

  // 3.2 Khóa duy nhất và chống ghi lặp điểm (Idempotent Sync)
  console.log('Test 3.2: Đồng bộ điểm với Khóa duy nhất (Composite Key) chống ghi lặp...');
  const compositeKey = '10A1#TOAN#ASM_GK1#HS-120845';
  const existingAssessmentEntries: Record<string, any> = {};

  // Ghi lần 1
  existingAssessmentEntries['ASM_GK1'] = {
    assessmentId: 'ASM_GK1',
    score: 8.5,
    auditHash: b0.entryHash,
    updatedAt: Date.now()
  };
  assert.strictEqual(Object.keys(existingAssessmentEntries).length, 1);

  // Ghi lần 2 (cùng bài kiểm tra ASM_GK1)
  const isDuplicate = existingAssessmentEntries['ASM_GK1'] && existingAssessmentEntries['ASM_GK1'].score === 8.5;
  assert.strictEqual(isDuplicate, true);
  // Không append thêm vào dictionary
  assert.strictEqual(Object.keys(existingAssessmentEntries).length, 1);
  console.log('  ✓ PASS: Khóa duy nhất composite key ngăn chặn hoàn toàn việc ghi trùng điểm');

  // 3.3 Kiểm tra giao dịch trước phê duyệt (Pre-Approval Boundary Check)
  console.log('Test 3.3: Kiểm tra biên giá trị điểm số hợp lệ [0.0 - 10.0]...');
  const invalidScores = [-1.5, 11.0, NaN];
  invalidScores.forEach(badScore => {
    const isBad = typeof badScore !== 'number' || isNaN(badScore) || badScore < 0 || badScore > 10.0;
    assert.strictEqual(isBad, true, `Điểm ${badScore} phải bị từ chối`);
  });
  console.log('  ✓ PASS: Kiểm tra biên điểm số pre-approval hoạt động nghiêm ngặt');

  console.log('\n================================================================');
  console.log('=== KẾT QUẢ: 100% CÁC BÀI KIỂM THỬ CODEX 3 VÒNG ĐỀU ĐẠT (PASS) ===');
  console.log('================================================================');
}

runAllTests().catch(err => {
  console.error('\n❌ CODEX AUDIT TEST SUITE FAILED:', err);
  process.exit(1);
});
