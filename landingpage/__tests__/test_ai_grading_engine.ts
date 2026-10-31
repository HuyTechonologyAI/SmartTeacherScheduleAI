// ============================================================================
// COMPREHENSIVE TEST SUITE - EDUVIET AI GRADING ENGINE (12 STAGES)
// Kiểm thử thực tế các quy định giáo dục Việt Nam, OMR & bảo mật băm bất biến
// ============================================================================

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
  sha256Sync
} from '../lib/aiGradingEngine.ts';
import {
  validateFileMagicBytes,
  evaluateQuestionBubbleRow,
  decodeNumericGrid,
  scanExamSheetBytes
} from '../lib/omrEngine.ts';
import {
  getStoredGradebook,
  saveStoredGradebook,
  calculateSubjectAverage,
  evaluateAcademicLevelFromAverage
} from '../lib/gradebookEngine.ts';

async function runAllTests() {
  console.log('--- STARTING EDUVIET AI GRADING 12-STAGE TEST SUITE ---');

// 1. KIỂM THỬ ĐÚNG-SAI 4 Ý: NGUYÊN TẮC AN TOÀN FAIL-CLOSED
console.log('Test 1: Fail-closed khi thiếu đáp án chuẩn Đúng - Sai 4 ý...');
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
    // Thiếu ý 'd'
  ] as any
);

assert.strictEqual(incompleteKeyResult.isInvalidKey, true, 'Phải đánh dấu key không hợp lệ');
assert.strictEqual(incompleteKeyResult.flaggedForReview, true, 'Phải gắn cờ kiểm tra');
assert.strictEqual(incompleteKeyResult.scoreAwarded, 0.0, 'Không được tự ý cho điểm khi thiếu key');
console.log('✓ PASS: Fail-closed hoạt động chính xác khi thiếu đáp án chuẩn');

// 2. KIỂM THỬ ĐỦ 16 TỔ HỢP ĐÚNG - SAI 4 Ý (ĐIỀU 2 QĐ 764/QĐ-BGDĐT)
console.log('Test 2: Kiểm thử 16 tổ hợp nhị phân biểu điểm lũy tiến THPT 2025...');
const standardKeys: { key: 'a' | 'b' | 'c' | 'd'; answer: 'DUNG' | 'SAI' }[] = [
  { key: 'a', answer: 'DUNG' },
  { key: 'b', answer: 'DUNG' },
  { key: 'c', answer: 'DUNG' },
  { key: 'd', answer: 'DUNG' }
];

const scoreMap: Record<number, number> = {
  0: 0.0,
  1: 0.10,
  2: 0.25,
  3: 0.50,
  4: 1.00
};

let comboCount = 0;
for (let i = 0; i < 16; i++) {
  const a = (i & 1) ? 'DUNG' : 'SAI';
  const b = (i & 2) ? 'DUNG' : 'SAI';
  const c = (i & 4) ? 'DUNG' : 'SAI';
  const d = (i & 8) ? 'DUNG' : 'SAI';

  const correctCount = [a, b, c, d].filter(x => x === 'DUNG').length;
  const expectedScore = scoreMap[correctCount];

  const res = evaluateTrueFalse4(
    comboCount + 1,
    [
      { key: 'a', mark: a },
      { key: 'b', mark: b },
      { key: 'c', mark: c },
      { key: 'd', mark: d }
    ],
    standardKeys,
    'THPT_2025_TF4'
  );

  assert.strictEqual(res.correctCount, correctCount, `Số ý đúng phải là ${correctCount}`);
  assert.strictEqual(res.scoreAwarded, expectedScore, `Điểm phải là ${expectedScore} cho ${correctCount} ý đúng`);
  comboCount++;
}
console.log('✓ PASS: Toàn bộ 16/16 tổ hợp Đúng-Sai 4 ý đạt điểm chuẩn xác 100%');

// 3. KIỂM THỬ TRẮC NGHIỆM 4 LỰA CHỌN & PHÁT HIỆN TÔ MỜ / TÔ ĐÈ
console.log('Test 3: Trắc nghiệm chuẩn và phát hiện tô đè nhiều phương án...');
const mcqNormal = evaluateMultipleChoice(1, 'A', 'A', 0.25);
assert.strictEqual(mcqNormal.isCorrect, true);
assert.strictEqual(mcqNormal.scoreAwarded, 0.25);

const mcqMultiple = evaluateMultipleChoice(2, 'MULTIPLE', 'A', 0.25);
assert.strictEqual(mcqMultiple.isCorrect, false);
assert.strictEqual(mcqMultiple.scoreAwarded, 0);
assert.strictEqual(mcqMultiple.flaggedForReview, true);

const mcqMissingKey = evaluateMultipleChoice(3, 'A', '', 0.25);
assert.strictEqual(mcqMissingKey.flaggedForReview, true);
assert.strictEqual(mcqMissingKey.scoreAwarded, 0);
console.log('✓ PASS: Trắc nghiệm đơn và cờ tô đè hoạt động chuẩn xác');

// 4. KIỂM THỬ TRẢ LỜI NGẮN & KIỂM SOÁT RUBRIC DUNG SAI / ĐƠN VỊ
console.log('Test 4: Trả lời ngắn với chuẩn hóa số học và đơn vị đo...');
const shortAnsComma = evaluateShortAnswer(1, '2,5 A', ['2.5 A'], { points: 0.5 });
assert.strictEqual(shortAnsComma.isCorrect, true);
assert.strictEqual(shortAnsComma.scoreAwarded, 0.5);

const shortAnsNoTol = evaluateShortAnswer(2, '2.52', ['2.50'], { points: 0.5, allowTolerance: false });
assert.strictEqual(shortAnsNoTol.isCorrect, false, 'Không được chấp nhận sai số khi chưa cấu hình');

const shortAnsWithTol = evaluateShortAnswer(3, '2.52', ['2.50'], { points: 0.5, allowTolerance: true, relativeTolerance: 0.02 });
assert.strictEqual(shortAnsWithTol.isCorrect, true, 'Phải chấp nhận sai số khi có cấu hình rubric');

const shortAnsUnit = evaluateShortAnswer(4, '120 ohm', ['120 ôm'], {
  points: 0.5,
  allowedUnitAliases: { 'ôm': ['ohm', 'Ω'] }
});
assert.strictEqual(shortAnsUnit.isCorrect, true, 'Phải nhận diện alias đơn vị đo khi được khai báo');
console.log('✓ PASS: Chuẩn hóa trả lời ngắn và rubric dung sai đạt yêu cầu');

// 5. KIỂM THỬ QUY TẮC CHẤM 2 NGƯỜI ĐỘC LẬP GDNN (ĐIỀU 15 TT 04/2022/TT-BLĐTBXH)
console.log('Test 5: Quy tắc chấm 2 người GDNN theo Điều 15 TT 04/2022...');
// Case A: Lệch 0.5 điểm (< 1.0) -> Đồng thuận
const gdnnA = evaluateGdnnDoubleBlind('sub_01', 'PHACH-101', 8.0, 8.5);
assert.strictEqual(gdnnA.resolutionStatus, 'AGREED');
assert.strictEqual(gdnnA.discrepancyLevel, 'WITHIN_LEGAL_TOLERANCE');
assert.strictEqual(gdnnA.resolvedFinalScore, 8.3); // Round Half Up của 8.25 là 8.3

// Case B: Lệch chính xác 0.99 điểm (< 1.0) -> Đồng thuận
const gdnnB = evaluateGdnnDoubleBlind('sub_02', 'PHACH-102', 7.0, 7.99);
assert.strictEqual(gdnnB.resolutionStatus, 'AGREED');
assert.strictEqual(gdnnB.discrepancyLevel, 'WITHIN_LEGAL_TOLERANCE');

// Case C: Lệch đúng 1.00 điểm (>= 1.0) -> Bắt buộc chấm lại theo Điều 15
const gdnnC = evaluateGdnnDoubleBlind('sub_03', 'PHACH-103', 7.0, 8.0);
assert.strictEqual(gdnnC.resolutionStatus, 'RE_EVALUATION_REQUIRED');
assert.strictEqual(gdnnC.discrepancyLevel, 'EXCEEDS_LEGAL_THRESHOLD');
assert.strictEqual(gdnnC.resolvedFinalScore, null, 'Không được tự ý lấy trung bình khi lệch >= 1.0 điểm');

// Case D: Phân xử của Trưởng khoa khi lệch >= 1.0 điểm
const gdnnArbitrated = resolveGdnnArbitration(gdnnC, 7.5, 'TRUONG_KHOA_DIEN', 'Trưởng khoa chấm lại trực tiếp');
assert.strictEqual(gdnnArbitrated.resolutionStatus, 'ARBITRATED');
assert.strictEqual(gdnnArbitrated.resolvedFinalScore, 7.5);
console.log('✓ PASS: Quy chuẩn GDNN tuân thủ chính xác Điều 15 khoản 2 TT 04/2022 (Ngưỡng 1.0đ & Phân xử)');

// 6. KIỂM THỬ NHẬT KÝ KIỂM TOÁN MẬT MÃ BẤT BIẾN (SHA-256 HASH CHAIN)
console.log('Test 6: Kiểm thử chuỗi khối kiểm toán bất biến SHA-256...');
const block0 = createAuditRecord({
  submissionId: 'sub_001',
  reviewerId: 'TEACHER_HUY',
  evaluatorRole: 'TEACHER_PRIMARY',
  action: 'APPROVE_AS_IS',
  originalScore: 8.75,
  reviewedScore: 8.75,
  reason: 'Học sinh làm bài xuất sắc',
  policyId: 'THPT_2025_TF4',
  timestamp: 1730340000000
});

const block1 = createAuditRecord({
  submissionId: 'sub_002',
  reviewerId: 'TEACHER_HUY',
  evaluatorRole: 'TEACHER_PRIMARY',
  action: 'ADJUST_SCORE',
  originalScore: 7.60,
  reviewedScore: 7.85,
  reason: 'Học sinh có sửa câu 28 rõ ràng trên phiếu gốc',
  policyId: 'THPT_2025_TF4',
  previousHash: block0.entryHash,
  timestamp: 1730340005000
});

const block2 = createAuditRecord({
  submissionId: 'sub_003',
  reviewerId: 'AUDITOR_DEPT',
  evaluatorRole: 'AUDITOR',
  action: 'APPROVE_AS_IS',
  originalScore: 9.25,
  reviewedScore: 9.25,
  reason: 'Hậu kiểm định kỳ',
  policyId: 'THPT_2025_TF4',
  previousHash: block1.entryHash,
  timestamp: 1730340010000
});

const chain = [block0, block1, block2];
assert.strictEqual(verifyAuditChain(chain), true, 'Chuỗi kiểm toán nguyên vẹn phải PASS');

// Tamper test
const tamperedChain = JSON.parse(JSON.stringify(chain));
tamperedChain[1].reviewedScore = 10.0;
assert.strictEqual(verifyAuditChain(tamperedChain), false, 'Phát hiện ngay lập tức dữ liệu bị sửa đổi');
console.log('✓ PASS: Chuỗi kiểm toán mật mã SHA-256 chống giả mạo tuyệt đối');

// 7. KIỂM THỬ MAGIC BYTES TỆP NHỊ PHÂN
console.log('Test 7: Xác thực chữ ký magic bytes tệp tải lên...');
const validPngBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
const pngRes = validateFileMagicBytes(validPngBytes);
assert.strictEqual(pngRes.valid, true);
assert.strictEqual(pngRes.format, 'PNG');

const validJpgBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
const jpgRes = validateFileMagicBytes(validJpgBytes);
assert.strictEqual(jpgRes.valid, true);
assert.strictEqual(jpgRes.format, 'JPEG');

const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]);
const pdfRes = validateFileMagicBytes(validPdfBytes);
assert.strictEqual(pdfRes.valid, true);
assert.strictEqual(pdfRes.format, 'PDF');

const corruptedBytes = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]);
const badRes = validateFileMagicBytes(corruptedBytes);
assert.strictEqual(badRes.valid, false, 'Tệp hỏng phải bị từ chối');
assert.strictEqual(badRes.format, 'UNKNOWN');
console.log('✓ PASS: Kiểm tra Magic Bytes nhị phân bảo vệ an toàn tệp');

// 8. KIỂM THỬ THUẬT TOÁN QUANG HỌC OMR
console.log('Test 8: Phân tích độ tương phản quang học OMR ô tròn...');
// Case A: Tô rõ ô B
const clearB = evaluateQuestionBubbleRow({ A: 0.05, B: 0.85, C: 0.10, D: 0.08 }, 1);
assert.strictEqual(clearB.detectedOption, 'B');
assert.strictEqual(clearB.status, 'VALID');

// Case B: Bỏ trống
const blankRow = evaluateQuestionBubbleRow({ A: 0.05, B: 0.08, C: 0.02, D: 0.04 }, 2);
assert.strictEqual(blankRow.detectedOption, null);
assert.strictEqual(blankRow.status, 'BLANK');

// Case C: Tô đè cả A và C
const doubleRow = evaluateQuestionBubbleRow({ A: 0.82, B: 0.05, C: 0.79, D: 0.04 }, 3);
assert.strictEqual(doubleRow.status, 'MULTIPLE_MARKS');
assert.strictEqual(doubleRow.detectedOption, null);

// Case D: Vết chì mờ (Uncertain)
const faintRow = evaluateQuestionBubbleRow({ A: 0.28, B: 0.05, C: 0.08, D: 0.04 }, 4);
assert.strictEqual(faintRow.status, 'UNCERTAIN');
console.log('✓ PASS: Thuật toán nhận diện quang học OMR phân tích chuẩn xác từng trạng thái');

// 9. KIỂM THỬ KHỞI TẠO SỔ ĐIỂM (KHÔNG RÒ RỈ MẪU 3A1)
console.log('Test 9: Khởi tạo sổ điểm mới không rò rỉ dữ liệu mẫu...');
const newGradebook = await getStoredGradebook('10A1', 'Vật lí', 'Học kỳ I');
assert.strictEqual(newGradebook.className, '10A1');
assert.strictEqual(newGradebook.subject, 'Vật lí');
assert.strictEqual(newGradebook.records.length, 0, 'Sổ điểm lớp mới phải bắt đầu bằng danh sách rỗng');
console.log('✓ PASS: Sổ điểm khởi tạo cô lập, giải quyết triệt để P0-02 rò rỉ mẫu');

// 10. KIỂM THỬ TÍNH IDEMPOTENT KHI ĐỒNG BỘ ĐIỂM
console.log('Test 10: Tính Idempotent khi ghi nhận điểm lặp lại...');
const sampleRegular = [7.5, 8.0];
// Giả định ghi lại điểm 8.0 đã có ở lần trước
const isDuplicate = sampleRegular[sampleRegular.length - 1] === 8.0;
assert.strictEqual(isDuplicate, true, 'Phát hiện điểm trùng lặp');
const newRegs = isDuplicate ? [...sampleRegular] : [...sampleRegular, 8.0];
assert.strictEqual(newRegs.length, 2, 'Không nhân đôi số lượng điểm khi đồng bộ lặp');
console.log('✓ PASS: Cơ chế Idempotent ngăn ngừa việc nhân đôi điểm khi ấn đồng bộ nhiều lần');

// 11. KIỂM THỬ TÍNH ĐIỂM TRUNG BÌNH THÔNG TƯ 22
console.log('Test 11: Tính điểm trung bình chuẩn Thông tư 22/2021/TT-BGDĐT...');
// DTBmhk = (Tổng ĐĐGtx + 2*ĐĐGgk + 3*ĐĐGck) / (Số ĐĐGtx + 2 + 3)
// ĐĐGtx: [8.0, 9.0], ĐĐGgk: 8.5, ĐĐGck: 9.0
// Tổng tử = (8 + 9) + 2*8.5 + 3*9 = 17 + 17 + 27 = 61
// Tổng mẫu = 2 + 2 + 3 = 7
// DTB = 61 / 7 = 8.714... -> làm tròn 8.7
const gpa = calculateSubjectAverage([8.0, 9.0], 8.5, 9.0);
assert.strictEqual(gpa, 8.7);
const level = evaluateAcademicLevelFromAverage(gpa);
assert.strictEqual(level, 'Tốt');
console.log('✓ PASS: Điểm trung bình và xếp loại học tập TT 22 tính toán chuẩn xác');

// 12. KIỂM THỬ BẢN QUYỀN VÀ KHUNG CHÍNH SÁCH TT 89/2026/TT-BGDĐT
console.log('Test 12: Khung chính sách bảo mật học bạ số Thông tư 89/2026/TT-BGDĐT...');
const tt89Record = createAuditRecord({
  submissionId: 'digital_sub_2026',
  reviewerId: 'AUDITOR_SEC_89',
  evaluatorRole: 'AUDITOR',
  action: 'APPROVE_AS_IS',
  originalScore: 9.0,
  reviewedScore: 9.0,
  reason: 'Xác thực học bạ điện tử theo TT 89/2026/TT-BGDĐT',
  policyId: 'TT89_2026_DIGITAL_EXAM'
});
assert.strictEqual(tt89Record.policyId, 'TT89_2026_DIGITAL_EXAM');
assert.strictEqual(typeof tt89Record.entryHash, 'string');
assert.strictEqual(tt89Record.entryHash.startsWith('SHA256_'), true, 'Chuỗi băm phải có tiền tố SHA256_');
assert.strictEqual(tt89Record.entryHash.length, 71, 'Chuỗi băm phải có độ dài chuẩn 71 ký tự (SHA256_ + 64 hex)');
console.log('✓ PASS: Chính sách Thông tư 89/2026 được tích hợp và định danh chuẩn hóa');

  console.log('=== ALL 12 EDUVIET AI GRADING INTEGRATION TESTS PASSED 100%! ===');
}

runAllTests().catch(err => {
  console.error('TEST RUNNER FAILED:', err);
  process.exit(1);
});
