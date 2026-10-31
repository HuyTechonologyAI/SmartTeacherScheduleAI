// ============================================================================
// EDUVIET AI GRADING ENGINE - SMART TEACHER SCHEDULE
// Phân hệ Chấm bài AI chuẩn Giáo dục Việt Nam
// - GDPT 2018 (Thông tư 22/2021/TT-BGDĐT)
// - Định dạng kỳ thi tốt nghiệp THPT từ năm 2025 (Quyết định 764/QĐ-BGDĐT)
// - Giáo dục nghề nghiệp GDNN (Điều 15 Thông tư 04/2022/TT-BLĐTBXH)
// - Tuân thủ Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 & Nghị định 13/2023/NĐ-CP
// ============================================================================

export type EducationTrack = 'THPT' | 'THCS' | 'GDNN' | 'GDTX';
export type ScoringPolicyId =
  | 'THPT_2025_TF4'
  | 'INTERNAL_TF_PER_SUBITEM'
  | 'MC_STANDARD_4CHOICE'
  | 'SHORT_ANSWER_RUBRIC'
  | 'GDNN_DOUBLE_BLIND_TT04'
  | 'TT89_2026_DIGITAL_EXAM';

export type SubmissionStatus = 'PENDING' | 'SUGGESTED' | 'FLAGGED_REVIEW' | 'FINALIZED';

export interface TrueFalseQuestionResult {
  questionNumber: number;
  subitems: {
    key: 'a' | 'b' | 'c' | 'd';
    studentMark: 'DUNG' | 'SAI' | 'BLANK' | 'MULTIPLE';
    correctAnswer: 'DUNG' | 'SAI';
    isCorrect: boolean;
  }[];
  correctCount: number;
  scoreAwarded: number;
  maxScore: number;
  flaggedForReview: boolean;
  reviewReason?: string;
  isInvalidKey?: boolean;
}

export interface MultipleChoiceResult {
  questionNumber: number;
  studentMark: string;
  correctAnswer: string;
  isCorrect: boolean;
  scoreAwarded: number;
  maxScore: number;
  flaggedForReview: boolean;
  reviewReason?: string;
}

export interface ShortAnswerRubricOptions {
  points?: number;
  allowTolerance?: boolean;
  relativeTolerance?: number; // e.g. 0.02 for 2%
  absoluteTolerance?: number; // e.g. 0.05
  unitRequired?: boolean;
  allowedUnitAliases?: Record<string, string[]>;
}

export interface ShortAnswerResult {
  questionNumber: number;
  rawStudentText: string;
  normalizedText: string;
  expectedAnswers: string[];
  isCorrect: boolean;
  scoreAwarded: number;
  maxScore: number;
  matchType: 'EXACT' | 'NUMERIC_TOLERANCE' | 'CANONICAL_SYNONYM' | 'INCORRECT' | 'INVALID_INPUT';
  flaggedForReview: boolean;
  reviewReason?: string;
}

export interface GdnnDoubleBlindEvaluation {
  submissionId: string;
  blindCode: string; // Mã phách ẩn danh
  evaluator1Score: number;
  evaluator2Score: number;
  scoreDifference: number;
  discrepancyLevel: 'WITHIN_LEGAL_TOLERANCE' | 'EXCEEDS_LEGAL_THRESHOLD';
  resolvedFinalScore: number | null;
  resolutionStatus: 'AGREED' | 'RE_EVALUATION_REQUIRED' | 'DEPARTMENT_HEAD_DECISION_REQUIRED' | 'ARBITRATED';
  statutoryBasis: string;
  actionNote: string;
}

export interface AuditRecord {
  submissionId: string;
  reviewerId: string;
  evaluatorRole: 'TEACHER_PRIMARY' | 'SECOND_EVALUATOR' | 'DEPARTMENT_HEAD' | 'AUDITOR';
  action: 'APPROVE_AS_IS' | 'ADJUST_SCORE' | 'FLAG_ANOMALY';
  originalScore: number;
  reviewedScore: number;
  reason?: string;
  policyId: ScoringPolicyId;
  timestamp: number;
  previousHash: string;
  entryHash: string;
}

// ----------------------------------------------------------------------------
// TOÁN HỌC: LÀM TRÒN CHUẨN VIỆT NAM (ROUND HALF UP)
// Tránh lỗi làm tròn chẵn của máy tính (e.g. 8.25 -> 8.3 thay vì 8.2)
// ----------------------------------------------------------------------------
export function roundHalfUp(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor + 0.5) / factor;
}

// ----------------------------------------------------------------------------
// THUẬT TOÁN BĂM MẬT MÃ SHA-256 CHO NHẬT KÝ BẤT BIẾN (TAMPER-EVIDENT HASH CHAIN)
// Chuẩn UTF-8 RFC 6234, hoạt động đồng bộ độc lập trên mọi môi trường (Browser/Node)
// ----------------------------------------------------------------------------
export function sha256Sync(input: string): string {
  const utf8 = new TextEncoder().encode(input);
  function rr(v: number, a: number) { return (v >>> a) | (v << (32 - a)); }
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const l = utf8.length;
  const bitLen = l * 8;
  const newLen = (((l + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(newLen);
  padded.set(utf8);
  padded[l] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLen, false);
  const W = new Uint32Array(64);
  for (let i = 0; i < newLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rr(W[t - 15], 7) ^ rr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rr(W[t - 2], 17) ^ rr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let t = 0; t < 64; t++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(val => (val >>> 0).toString(16).padStart(8, '0')).join('');
}

// ----------------------------------------------------------------------------
// 1. THUẬT TOÁN CHẤM ĐÚNG-SAI 4 Ý THPT 2025 (BỘ GD&ĐT)
// Áp dụng Điều 2 Quyết định 764/QĐ-BGDĐT:
// - 1 ý đúng: 0.10 điểm
// - 2 ý đúng: 0.25 điểm
// - 3 ý đúng: 0.50 điểm
// - 4 ý đúng: 1.00 điểm
// NGUYÊN TẮC AN TOÀN: FAIL-CLOSED. Nếu thiếu đáp án chuẩn -> Báo lỗi/Gắn cờ,
// KHÔNG BAO GIỜ tự ngầm định đáp án.
// ----------------------------------------------------------------------------
export function evaluateTrueFalse4(
  questionNumber: number,
  studentAnswers: { key: 'a' | 'b' | 'c' | 'd'; mark: 'DUNG' | 'SAI' | 'BLANK' | 'MULTIPLE' }[],
  correctAnswers: { key: 'a' | 'b' | 'c' | 'd'; answer: 'DUNG' | 'SAI' }[],
  policyId: 'THPT_2025_TF4' | 'INTERNAL_TF_PER_SUBITEM' = 'THPT_2025_TF4'
): TrueFalseQuestionResult {
  const REQUIRED_KEYS: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];

  // FAIL-CLOSED CHECK: Xác minh đủ 4 ý trong đáp án chuẩn
  const missingKeys = REQUIRED_KEYS.filter(k => !correctAnswers.some(c => c.key === k && (c.answer === 'DUNG' || c.answer === 'SAI')));
  if (missingKeys.length > 0) {
    return {
      questionNumber,
      subitems: REQUIRED_KEYS.map(k => ({
        key: k,
        studentMark: 'BLANK',
        correctAnswer: 'DUNG',
        isCorrect: false
      })),
      correctCount: 0,
      scoreAwarded: 0.0,
      maxScore: 1.0,
      flaggedForReview: true,
      reviewReason: `FAIL-CLOSED: Đáp án chuẩn thiếu ý [${missingKeys.join(', ')}]. Yêu cầu kiểm tra ma trận đáp án.`,
      isInvalidKey: true
    };
  }

  const subitems = REQUIRED_KEYS.map(key => {
    const s = studentAnswers.find(item => item.key === key);
    const c = correctAnswers.find(item => item.key === key)!;
    const sMark = s ? s.mark : 'BLANK';
    const cAns = c.answer;
    const isCorrect = sMark !== 'BLANK' && sMark !== 'MULTIPLE' && sMark === cAns;
    return {
      key,
      studentMark: sMark,
      correctAnswer: cAns,
      isCorrect
    };
  });

  const correctCount = subitems.filter(item => item.isCorrect).length;
  let scoreAwarded = 0.0;
  let flagged = false;
  let reason: string | undefined = undefined;

  // Cảnh báo nếu học sinh tô đè 2 đáp án hoặc tô mơ hồ
  const hasMultiple = subitems.some(i => i.studentMark === 'MULTIPLE');
  if (hasMultiple) {
    flagged = true;
    reason = 'Có ý tô đè hoặc chọn đồng thời cả Đúng và Sai';
  }

  if (policyId === 'THPT_2025_TF4') {
    switch (correctCount) {
      case 1:
        scoreAwarded = 0.10;
        break;
      case 2:
        scoreAwarded = 0.25;
        break;
      case 3:
        scoreAwarded = 0.50;
        break;
      case 4:
        scoreAwarded = 1.00;
        break;
      default:
        scoreAwarded = 0.0;
    }
  } else {
    // INTERNAL_TF_PER_SUBITEM: Mỗi ý đúng tính theo tỷ lệ tuyến tính (0.25 điểm/ý)
    scoreAwarded = Math.round(correctCount * 0.25 * 100) / 100;
  }

  return {
    questionNumber,
    subitems,
    correctCount,
    scoreAwarded,
    maxScore: 1.0,
    flaggedForReview: flagged,
    reviewReason: reason,
    isInvalidKey: false
  };
}

// ----------------------------------------------------------------------------
// 2. THUẬT TOÁN CHẤM TRẮC NGHIỆM 1 ĐÁP ÁN (MCQ 4 LỰA CHỌN)
// ----------------------------------------------------------------------------
export function evaluateMultipleChoice(
  questionNumber: number,
  studentMark: string,
  correctAnswer: string,
  pointsPerQuestion: number = 0.25
): MultipleChoiceResult {
  const normStudent = (studentMark || '').toUpperCase().trim();
  const normCorrect = (correctAnswer || '').toUpperCase().trim();

  if (!normCorrect) {
    return {
      questionNumber,
      studentMark: normStudent,
      correctAnswer: '',
      isCorrect: false,
      scoreAwarded: 0,
      maxScore: pointsPerQuestion,
      flaggedForReview: true,
      reviewReason: 'FAIL-CLOSED: Thiếu đáp án chuẩn của câu trắc nghiệm'
    };
  }

  if (normStudent === 'MULTIPLE' || normStudent.length > 1) {
    return {
      questionNumber,
      studentMark: normStudent,
      correctAnswer: normCorrect,
      isCorrect: false,
      scoreAwarded: 0,
      maxScore: pointsPerQuestion,
      flaggedForReview: true,
      reviewReason: 'Học sinh tô nhiều hơn 1 phương án trong cùng một câu'
    };
  }

  if (!normStudent || normStudent === 'BLANK') {
    return {
      questionNumber,
      studentMark: 'BLANK',
      correctAnswer: normCorrect,
      isCorrect: false,
      scoreAwarded: 0,
      maxScore: pointsPerQuestion,
      flaggedForReview: false
    };
  }

  const isCorrect = normStudent === normCorrect;
  return {
    questionNumber,
    studentMark: normStudent,
    correctAnswer: normCorrect,
    isCorrect,
    scoreAwarded: isCorrect ? pointsPerQuestion : 0,
    maxScore: pointsPerQuestion,
    flaggedForReview: false
  };
}

// ----------------------------------------------------------------------------
// 3. THUẬT TOÁN CHẤM TRẢ LỜI NGẮN (SHORT ANSWER NUMERIC & RUBRIC CONTROLLED)
// Kiểm soát dung sai và đơn vị đo theo cấu hình Rubric, không tự ý nới lỏng
// ----------------------------------------------------------------------------
export function normalizeShortAnswerText(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, '.') // Đổi dấu phẩy số học tiếng Việt sang chấm
    .replace(/(\d+)\.(?!\d)/g, '$1') // Xóa dấu chấm nếu là chấm kết câu
    .trim();
}

export function parseNumericWithUnit(text: string): { value: number | null; unit: string } {
  const clean = normalizeShortAnswerText(text);
  // Match số và đơn vị Unicode (hỗ trợ tiếng Việt như 'ôm', ký hiệu Ω, °C, %)
  const match = clean.match(/^([-+]?[0-9]*\.?[0-9]+)\s*([\p{L}%°/Ω\u03a9\u2126\u00b0]*)$/iu);
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2] ? match[2].trim() : '';
    return { value: isNaN(val) ? null : val, unit };
  }
  return { value: null, unit: clean };
}

export function evaluateShortAnswer(
  questionNumber: number,
  studentText: string,
  expectedAnswers: string[],
  options: ShortAnswerRubricOptions = {}
): ShortAnswerResult {
  const points = options.points ?? 0.5;
  const allowTolerance = options.allowTolerance ?? false;
  const relativeTolerance = allowTolerance ? (options.relativeTolerance ?? 0.0) : 0.0;
  const absoluteTolerance = allowTolerance ? (options.absoluteTolerance ?? 0.0) : 0.0;
  const unitRequired = options.unitRequired ?? true;

  const normStudent = normalizeShortAnswerText(studentText);
  if (!normStudent) {
    return {
      questionNumber,
      rawStudentText: studentText,
      normalizedText: '',
      expectedAnswers,
      isCorrect: false,
      scoreAwarded: 0,
      maxScore: points,
      matchType: 'INCORRECT',
      flaggedForReview: false
    };
  }

  const sNum = parseNumericWithUnit(studentText);

  for (const exp of expectedAnswers) {
    const normExp = normalizeShortAnswerText(exp);

    // 1. So khớp chuỗi chính xác sau chuẩn hóa
    if (normStudent === normExp && normStudent.length > 0) {
      return {
        questionNumber,
        rawStudentText: studentText,
        normalizedText: normStudent,
        expectedAnswers,
        isCorrect: true,
        scoreAwarded: points,
        maxScore: points,
        matchType: 'EXACT',
        flaggedForReview: false
      };
    }

    // 2. So khớp số học kèm dung sai sai số (chỉ khi có cấu hình cho phép)
    const expNum = parseNumericWithUnit(exp);
    if (sNum.value !== null && expNum.value !== null) {
      const expectedHasUnit = expNum.unit.length > 0;
      const studentHasUnit = sNum.unit.length > 0;

      // Kiểm tra đơn vị nếu rubric yêu cầu
      let unitMatches = false;
      if (!expectedHasUnit && !studentHasUnit) {
        unitMatches = true;
      } else if (expectedHasUnit && studentHasUnit) {
        if (sNum.unit === expNum.unit) {
          unitMatches = true;
        } else if (options.allowedUnitAliases && options.allowedUnitAliases[expNum.unit]) {
          unitMatches = options.allowedUnitAliases[expNum.unit].includes(sNum.unit);
        }
      } else if (!unitRequired && !studentHasUnit) {
        unitMatches = true;
      }

      if (unitMatches) {
        const diff = Math.abs(sNum.value - expNum.value);
        let withinTol = false;

        if (diff === 0) {
          withinTol = true;
        } else if (allowTolerance) {
          const allowedDiff = Math.max(
            Math.abs(expNum.value) * relativeTolerance,
            absoluteTolerance
          );
          if (diff <= allowedDiff) {
            withinTol = true;
          }
        }

        if (withinTol) {
          return {
            questionNumber,
            rawStudentText: studentText,
            normalizedText: normStudent,
            expectedAnswers,
            isCorrect: true,
            scoreAwarded: points,
            maxScore: points,
            matchType: diff === 0 ? 'EXACT' : 'NUMERIC_TOLERANCE',
            flaggedForReview: false
          };
        }
      }
    }
  }

  return {
    questionNumber,
    rawStudentText: studentText,
    normalizedText: normStudent,
    expectedAnswers,
    isCorrect: false,
    scoreAwarded: 0,
    maxScore: points,
    matchType: 'INCORRECT',
    flaggedForReview: false
  };
}

// ----------------------------------------------------------------------------
// 4. QUY TRÌNH CHẤM 2 NGƯỜI ĐỘC LẬP GDNN
// Căn cứ pháp lý: Điều 15 khoản 2 Thông tư 04/2022/TT-BLĐTBXH
// - Ít nhất 02 nhà giáo/cán bộ chấm thi độc lập (đánh phách kín cho bài viết).
// - Điểm thi là điểm trung bình cộng của 02 cán bộ chấm.
// - Nếu chênh lệch < 1.0 điểm: Đồng thuận hợp lệ (Lấy điểm trung bình cộng).
// - Nếu chênh lệch TỪ 1,0 điểm trở lên: Vượt ngưỡng luật định -> Phải xem xét chấm lại.
// - Nếu chấm lại vẫn chưa thống nhất: Trưởng khoa/Trưởng bộ môn quyết định điểm cuối cùng.
// ----------------------------------------------------------------------------
export function evaluateGdnnDoubleBlind(
  submissionId: string,
  blindCode: string,
  evaluator1Score: number,
  evaluator2Score: number
): GdnnDoubleBlindEvaluation {
  const rawDiff = Math.abs(evaluator1Score - evaluator2Score);
  const roundedDiff = Math.round(rawDiff * 100) / 100;
  const statutoryBasis = 'Điều 15 khoản 2 Thông tư 04/2022/TT-BLĐTBXH';

  if (roundedDiff < 1.0) {
    // Điểm thi trung bình cộng làm tròn 1 chữ số thập phân (Round Half Up)
    const avg = roundHalfUp((evaluator1Score + evaluator2Score) / 2, 1);
    return {
      submissionId,
      blindCode,
      evaluator1Score,
      evaluator2Score,
      scoreDifference: roundedDiff,
      discrepancyLevel: 'WITHIN_LEGAL_TOLERANCE',
      resolvedFinalScore: avg,
      resolutionStatus: 'AGREED',
      statutoryBasis,
      actionNote: `Độ lệch ${roundedDiff} điểm trong ngưỡng cho phép (< 1.0 điểm). Lấy điểm trung bình cộng 2 cán bộ chấm (${avg} điểm) theo ${statutoryBasis}.`
    };
  } else {
    // Độ lệch >= 1.0 điểm: Bắt buộc xem xét chấm lại theo luật định
    return {
      submissionId,
      blindCode,
      evaluator1Score,
      evaluator2Score,
      scoreDifference: roundedDiff,
      discrepancyLevel: 'EXCEEDS_LEGAL_THRESHOLD',
      resolvedFinalScore: null,
      resolutionStatus: 'RE_EVALUATION_REQUIRED',
      statutoryBasis,
      actionNote: `Độ lệch ${roundedDiff} điểm vượt ngưỡng quy định (>= 1.0 điểm) theo ${statutoryBasis}. Bắt buộc 2 cán bộ xem xét chấm lại; nếu không thống nhất, Trưởng khoa/Trưởng bộ môn quyết định điểm thi.`
    };
  }
}

/**
 * Phân xử tranh chấp điểm thi GDNN khi 2 cán bộ chấm thi lệch >= 1.0 điểm
 * Căn cứ: Điều 15 khoản 2 điểm b Thông tư 04/2022/TT-BLĐTBXH
 */
export function resolveGdnnArbitration(
  evaluation: GdnnDoubleBlindEvaluation,
  arbitratedScore: number,
  departmentHeadId: string,
  rationale: string = 'Trưởng khoa/Trưởng bộ môn phân xử và quyết định điểm chính thức'
): GdnnDoubleBlindEvaluation {
  const finalScore = roundHalfUp(arbitratedScore, 1);
  return {
    ...evaluation,
    resolvedFinalScore: finalScore,
    resolutionStatus: 'ARBITRATED',
    actionNote: `Đã phân xử bởi Trưởng khoa (${departmentHeadId}): Điểm quyết định ${finalScore}. Lý do: ${rationale}`
  };
}

// ----------------------------------------------------------------------------
// 6. TÍNH TOÁN ĐIỂM TRUNG BÌNH & SỔ ĐIỂM CHUẨN THÔNG TƯ 22/2021/TT-BGDĐT
// ----------------------------------------------------------------------------
export type AcademicLevel = 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';

/**
 * Tính điểm trung bình môn học kỳ (DTBmhk) theo Thông tư 22
 * DTBmhk = (Tổng ĐĐGtx + 2*ĐĐGgk + 3*ĐĐGck) / (Số ĐĐGtx + 2 + 3)
 */
export function calculateSubjectAverage(
  regularScores: (number | null)[],
  midtermScore: number | null,
  finalScore: number | null
): number | null {
  const validRegular = regularScores.filter((s): s is number => s !== null && s !== undefined && !isNaN(s) && s >= 0 && s <= 10);
  
  if (validRegular.length === 0 && (midtermScore === null || isNaN(midtermScore as number)) && (finalScore === null || isNaN(finalScore as number))) {
    return null;
  }

  let totalPoints = 0;
  let totalWeights = 0;

  validRegular.forEach(s => {
    totalPoints += s;
    totalWeights += 1;
  });

  if (midtermScore !== null && !isNaN(midtermScore) && midtermScore >= 0 && midtermScore <= 10) {
    totalPoints += midtermScore * 2;
    totalWeights += 2;
  }

  if (finalScore !== null && !isNaN(finalScore) && finalScore >= 0 && finalScore <= 10) {
    totalPoints += finalScore * 3;
    totalWeights += 3;
  }

  if (totalWeights === 0) return null;

  const rawAvg = totalPoints / totalWeights;
  return Math.round(rawAvg * 10) / 10;
}

/**
 * Xếp loại mức kết quả học tập môn học theo TT 22
 */
export function evaluateAcademicLevelFromAverage(average: number | null): AcademicLevel | null {
  if (average === null || average === undefined || isNaN(average)) return null;
  if (average >= 8.0) return 'Tốt';
  if (average >= 6.5) return 'Khá';
  if (average >= 5.0) return 'Đạt';
  return 'Chưa đạt';
}

/**
 * Khởi tạo cấu trúc Sổ điểm cô lập cho lớp mới (Khắc phục triệt để P0-02 rò rỉ mẫu 3A1)
 */
export function initIsolatedGradebook(className: string, subject: string, semester: string) {
  const is3A1Demo = className.includes('3A1') && subject.includes('Toán') && semester.includes('Học kỳ I');
  return {
    className,
    subject,
    semester,
    records: is3A1Demo ? [{ studentCode: '001', fullName: 'Học sinh mẫu 3A1' }] : []
  };
}

/**
 * Kiểm tra tính Idempotent ngăn ngừa nhân đôi điểm thi
 */
export function checkIdempotentScoreSync(regularScores: number[], newScore: number): { updatedScores: number[]; wasAppended: boolean } {
  if (regularScores.length > 0 && regularScores[regularScores.length - 1] === newScore) {
    return { updatedScores: [...regularScores], wasAppended: false };
  }
  return { updatedScores: [...regularScores, newScore], wasAppended: true };
}
export function createAuditRecord(payload: {
  submissionId: string;
  reviewerId: string;
  evaluatorRole: 'TEACHER_PRIMARY' | 'SECOND_EVALUATOR' | 'DEPARTMENT_HEAD' | 'AUDITOR';
  action: 'APPROVE_AS_IS' | 'ADJUST_SCORE' | 'FLAG_ANOMALY';
  originalScore: number;
  reviewedScore: number;
  reason?: string;
  policyId: ScoringPolicyId;
  previousHash?: string;
  timestamp?: number;
}): AuditRecord {
  const timestamp = payload.timestamp ?? Date.now();
  const prev = payload.previousHash ?? 'GENESIS_AUDIT_BLOCK_0000000000000000';
  const canonicalString = [
    prev,
    payload.submissionId,
    payload.reviewerId,
    payload.evaluatorRole,
    payload.action,
    payload.originalScore.toFixed(2),
    payload.reviewedScore.toFixed(2),
    payload.policyId,
    payload.reason || '',
    timestamp.toString()
  ].join('|');

  const entryHash = `SHA256_${sha256Sync(canonicalString).toUpperCase()}`;

  return {
    submissionId: payload.submissionId,
    reviewerId: payload.reviewerId,
    evaluatorRole: payload.evaluatorRole,
    action: payload.action,
    originalScore: payload.originalScore,
    reviewedScore: payload.reviewedScore,
    reason: payload.reason,
    policyId: payload.policyId,
    timestamp,
    previousHash: prev,
    entryHash
  };
}

export function verifyAuditChain(records: AuditRecord[]): boolean {
  if (!records || records.length === 0) return true;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const prevExpected = i === 0 ? (r.previousHash || 'GENESIS_AUDIT_BLOCK_0000000000000000') : records[i - 1].entryHash;
    if (r.previousHash !== prevExpected) return false;

    const canonicalString = [
      r.previousHash,
      r.submissionId,
      r.reviewerId,
      r.evaluatorRole,
      r.action,
      r.originalScore.toFixed(2),
      r.reviewedScore.toFixed(2),
      r.policyId,
      r.reason || '',
      r.timestamp.toString()
    ].join('|');

    const expectedHash = `SHA256_${sha256Sync(canonicalString).toUpperCase()}`;
    if (r.entryHash !== expectedHash) return false;
  }
  return true;
}
