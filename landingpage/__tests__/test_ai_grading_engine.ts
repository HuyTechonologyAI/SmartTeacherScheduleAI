// ============================================================================
// COMPREHENSIVE TEST SUITE - EDUVIET AI GRADING ENGINE
// Kiểm thử thực tế các quy định giáo dục Việt Nam & bảo mật băm bất biến
// ============================================================================

import assert from 'node:assert';
import {
  evaluateTrueFalse4,
  evaluateMultipleChoice,
  evaluateShortAnswer,
  evaluateGdnnDoubleBlind,
  createAuditRecord,
  verifyAuditChain,
  roundHalfUp,
  sha256Sync
} from '../lib/aiGradingEngine.ts';

console.log('--- STARTING EDUVIET AI GRADING TEST SUITE ---');

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
console.log(`✓ PASS: Toàn bộ 16/16 tổ hợp Đúng-Sai 4 ý đạt điểm chuẩn xác 100%`);

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
// Exact with Vietnamese comma
const shortAnsComma = evaluateShortAnswer(1, '2,5 A', ['2.5 A'], { points: 0.5 });
assert.strictEqual(shortAnsComma.isCorrect, true);
assert.strictEqual(shortAnsComma.scoreAwarded, 0.5);

// Tolerance blocked when not allowed
const shortAnsNoTol = evaluateShortAnswer(2, '2.52', ['2.50'], { points: 0.5, allowTolerance: false });
assert.strictEqual(shortAnsNoTol.isCorrect, false, 'Không được chấp nhận sai số khi chưa cấu hình');

// Tolerance accepted when explicitly allowed (relative 2%)
const shortAnsWithTol = evaluateShortAnswer(3, '2.52', ['2.50'], { points: 0.5, allowTolerance: true, relativeTolerance: 0.02 });
assert.strictEqual(shortAnsWithTol.isCorrect, true, 'Phải chấp nhận sai số khi có cấu hình rubric');

// Unit alias matching
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

// Case D: Lệch 2.50 điểm (> 1.0) -> Bắt buộc chấm lại
const gdnnD = evaluateGdnnDoubleBlind('sub_04', 'PHACH-104', 5.0, 7.5);
assert.strictEqual(gdnnD.resolutionStatus, 'RE_EVALUATION_REQUIRED');
assert.strictEqual(gdnnD.discrepancyLevel, 'EXCEEDS_LEGAL_THRESHOLD');
assert.strictEqual(gdnnD.resolvedFinalScore, null);
console.log('✓ PASS: Quy chuẩn GDNN tuân thủ chính xác Điều 15 khoản 2 TT 04/2022 (Ngưỡng 1.0đ)');

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

// Thử nghiệm tấn công sửa đổi dữ liệu (Tamper Test): Thay đổi điểm sửa đổi của block1
const tamperedChain = JSON.parse(JSON.stringify(chain));
tamperedChain[1].reviewedScore = 10.0; // Sửa trộm điểm
assert.strictEqual(verifyAuditChain(tamperedChain), false, 'Phát hiện ngay lập tức dữ liệu bị sửa đổi');

// Thử nghiệm tấn công cắt chuỗi (Broken Chain Test): Sửa previousHash
const brokenChain = JSON.parse(JSON.stringify(chain));
brokenChain[2].previousHash = 'FAKE_PREV_HASH';
assert.strictEqual(verifyAuditChain(brokenChain), false, 'Phát hiện ngay lập tức chuỗi liên kết bị đứt gãy');
console.log('✓ PASS: Chuỗi kiểm toán mật mã SHA-256 chống giả mạo tuyệt đối');

console.log('--- ALL 6 EDUVIET AI GRADING TESTS PASSED SUCCESSFULLY! ---');
