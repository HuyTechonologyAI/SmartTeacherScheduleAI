// ============================================================================
// EDUVIET AI GRADING ENGINE - SMART TEACHER SCHEDULE
// Phân hệ Chấm bài AI chuẩn Giáo dục Việt Nam (GDPT 2018, THPT 2025+, TT 22, GDNN TT 04)
// Tuân thủ Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 & Nghị định 13/2023/NĐ-CP
// ============================================================================

export type EducationTrack = 'THPT' | 'THCS' | 'GDNN' | 'GDTX';
export type ScoringPolicyId =
  | 'THPT_2025_TF4'
  | 'INTERNAL_TF_PER_SUBITEM'
  | 'MC_STANDARD_4CHOICE'
  | 'SHORT_ANSWER_NUMERIC_TOLERANCE'
  | 'GDNN_DOUBLE_BLIND_TT04';

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

export interface ShortAnswerResult {
  questionNumber: number;
  rawStudentText: string;
  normalizedText: string;
  expectedAnswers: string[];
  isCorrect: boolean;
  scoreAwarded: number;
  maxScore: number;
  matchType: 'EXACT' | 'NUMERIC_TOLERANCE' | 'CANONICAL_SYNONYM' | 'INCORRECT';
  flaggedForReview: boolean;
  reviewReason?: string;
}

export interface RubricCriterionEvaluation {
  criterionId: string;
  criterionName: string;
  maxPoints: number;
  suggestedScore: number;
  level: string;
  evidenceQuotes: string[];
  feedbackComment: string;
}

export interface EssayEvaluationResult {
  questionNumber: number;
  totalSuggestedScore: number;
  totalMaxScore: number;
  criteriaScores: RubricCriterionEvaluation[];
  overallPedagogicalComment: string;
  confidenceScore: number; // 0.0 - 1.0
  flaggedForReview: boolean;
  reviewReason?: string;
}

export interface GdnnDoubleBlindEvaluation {
  submissionId: string;
  blindCode: string; // Mã phách ẩn danh
  evaluator1Score: number;
  evaluator2Score: number;
  scoreDifference: number;
  discrepancyLevel: 'TOLERABLE' | 'MODERATE_DIALOGUE_REQUIRED' | 'CRITICAL_THIRD_EVALUATOR_REQUIRED';
  resolvedFinalScore: number | null;
  resolutionStatus: 'AGREED' | 'NEEDS_DIALOGUE' | 'TRANSFERRED_TO_COMMITTEE';
  actionNote: string;
}

export interface TeacherReviewRecord {
  submissionId: string;
  reviewerId: string;
  evaluatorRole: 'PRIMARY_TEACHER' | 'SECOND_EVALUATOR' | 'ARBITRATOR';
  action: 'APPROVE_AS_IS' | 'ADJUST_SCORE';
  originalScore: number;
  reviewedScore: number;
  reason?: string;
  teacherComment: string;
  auditHash: string;
  reviewedAt: number;
}

// ----------------------------------------------------------------------------
// 1. THUẬT TOÁN CHẤM ĐÚNG-SAI 4 Ý THPT 2025 (BỘ GD&ĐT)
// Bảng điểm lũy tiến phân hóa: [0: 0.0, 1: 0.10, 2: 0.25, 3: 0.50, 4: 1.00]
// ----------------------------------------------------------------------------
export function evaluateTrueFalse4(
  questionNumber: number,
  studentAnswers: { key: 'a' | 'b' | 'c' | 'd'; mark: 'DUNG' | 'SAI' | 'BLANK' | 'MULTIPLE' }[],
  correctAnswers: { key: 'a' | 'b' | 'c' | 'd'; answer: 'DUNG' | 'SAI' }[],
  policyId: 'THPT_2025_TF4' | 'INTERNAL_TF_PER_SUBITEM' = 'THPT_2025_TF4'
): TrueFalseQuestionResult {
  const subitems = ['a', 'b', 'c', 'd'].map(k => {
    const key = k as 'a' | 'b' | 'c' | 'd';
    const s = studentAnswers.find(item => item.key === key);
    const c = correctAnswers.find(item => item.key === key);
    const sMark = s ? s.mark : 'BLANK';
    const cAns = c ? c.answer : 'DUNG';
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

  // Kiểm tra cờ xem có ý nào tô mơ hồ hoặc tô 2 đáp án không
  const hasMultiple = subitems.some(i => i.studentMark === 'MULTIPLE');
  if (hasMultiple) {
    flagged = true;
    reason = 'Có ý tô đè hoặc chọn nhiều hơn 1 phương án';
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
    // INTERNAL_TF_PER_SUBITEM: Mỗi ý đúng 0.25 điểm
    scoreAwarded = Math.round(correctCount * 0.25 * 100) / 100;
  }

  return {
    questionNumber,
    subitems,
    correctCount,
    scoreAwarded,
    maxScore: 1.0,
    flaggedForReview: flagged,
    reviewReason: reason
  };
}

// ----------------------------------------------------------------------------
// 2. THUẬT TOÁN CHẤM TRẮC NGHIỆM 1 ĐÁP ÁN (MCQ)
// Hỗ trợ đa mã đề, kiểm tra tô trống, tô đè 2 đáp án
// ----------------------------------------------------------------------------
export function evaluateMultipleChoice(
  questionNumber: number,
  studentMark: string,
  correctAnswer: string,
  pointsPerQuestion: number = 0.25
): MultipleChoiceResult {
  const normStudent = (studentMark || '').toUpperCase().trim();
  const normCorrect = (correctAnswer || '').toUpperCase().trim();

  let flagged = false;
  let reason: string | undefined = undefined;

  if (normStudent === 'MULTIPLE' || normStudent.length > 1) {
    flagged = true;
    reason = 'Học sinh tô nhiều hơn 1 phương án trong cùng một câu';
    return {
      questionNumber,
      studentMark: normStudent,
      correctAnswer: normCorrect,
      isCorrect: false,
      scoreAwarded: 0,
      maxScore: pointsPerQuestion,
      flaggedForReview: true,
      reviewReason: reason
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
// 3. THUẬT TOÁN CHẤM TRẢ LỜI NGẮN (SHORT ANSWER NUMERIC & TOLERANCE)
// Chuẩn hóa dấu phẩy/chấm, đơn vị, dung sai sai số tỷ đối/tuyệt đối
// ----------------------------------------------------------------------------
export function normalizeShortAnswerText(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, '.') // Đổi dấu phẩy thập phân kiểu VN sang dấu chấm
    .replace(/(\d+)\.(?!\d)/g, '$1') // Bỏ dấu chấm nếu là ký tự kết thúc câu
    .trim();
}

export function parseNumericWithUnit(text: string): { value: number | null; unit: string } {
  const clean = normalizeShortAnswerText(text);
  // Match số (bao gồm số âm, số thập phân) và đơn vị đằng sau
  const match = clean.match(/^([-+]?[0-9]*\.?[0-9]+)\s*([a-z%°/]*)$/i);
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
  points: number = 0.5,
  relativeTolerance: number = 0.01 // Dung sai 1%
): ShortAnswerResult {
  const normStudent = normalizeShortAnswerText(studentText);
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

    // 2. So khớp số học kèm dung sai sai số
    const expNum = parseNumericWithUnit(exp);
    if (sNum.value !== null && expNum.value !== null) {
      const unitsMatch = sNum.unit === expNum.unit || (sNum.unit === '' && expNum.unit !== '');
      if (unitsMatch) {
        const diff = Math.abs(sNum.value - expNum.value);
        const allowedDiff = Math.max(Math.abs(expNum.value) * relativeTolerance, 0.001);
        if (diff <= allowedDiff) {
          return {
            questionNumber,
            rawStudentText: studentText,
            normalizedText: normStudent,
            expectedAnswers,
            isCorrect: true,
            scoreAwarded: points,
            maxScore: points,
            matchType: 'NUMERIC_TOLERANCE',
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
// 4. QUY TRÌNH CHẤM 2 NGƯỜI ĐỘC LẬP GDNN (THÔNG TƯ 04/2022/TT-BLĐTBXH)
// Phách mã hóa, so lệch điểm, tự động phân luồng hội đồng thẩm định
// ----------------------------------------------------------------------------
export function evaluateGdnnDoubleBlind(
  submissionId: string,
  blindCode: string,
  evaluator1Score: number,
  evaluator2Score: number,
  minorThreshold: number = 0.5,
  criticalThreshold: number = 1.5
): GdnnDoubleBlindEvaluation {
  const diff = Math.abs(evaluator1Score - evaluator2Score);
  const roundedDiff = Math.round(diff * 100) / 100;

  if (roundedDiff <= minorThreshold) {
    const avg = Math.round(((evaluator1Score + evaluator2Score) / 2) * 10) / 10;
    return {
      submissionId,
      blindCode,
      evaluator1Score,
      evaluator2Score,
      scoreDifference: roundedDiff,
      discrepancyLevel: 'TOLERABLE',
      resolvedFinalScore: avg,
      resolutionStatus: 'AGREED',
      actionNote: `Độ lệch ${roundedDiff} điểm trong ngưỡng cho phép (<= ${minorThreshold}). Lấy điểm trung bình 2 cán bộ chấm.`
    };
  } else if (roundedDiff <= criticalThreshold) {
    return {
      submissionId,
      blindCode,
      evaluator1Score,
      evaluator2Score,
      scoreDifference: roundedDiff,
      discrepancyLevel: 'MODERATE_DIALOGUE_REQUIRED',
      resolvedFinalScore: null,
      resolutionStatus: 'NEEDS_DIALOGUE',
      actionNote: `Độ lệch ${roundedDiff} điểm vượt ngưỡng ${minorThreshold} nhưng <= ${criticalThreshold}. Yêu cầu 2 cán bộ đối thoại thống nhất hoặc báo cáo Trưởng bộ môn.`
    };
  } else {
    return {
      submissionId,
      blindCode,
      evaluator1Score,
      evaluator2Score,
      scoreDifference: roundedDiff,
      discrepancyLevel: 'CRITICAL_THIRD_EVALUATOR_REQUIRED',
      resolvedFinalScore: null,
      resolutionStatus: 'TRANSFERRED_TO_COMMITTEE',
      actionNote: `Độ lệch nghiêm trọng ${roundedDiff} điểm (> ${criticalThreshold}). Bắt buộc chuyển Hội đồng thi chấm thẩm định độc lập lần 3 theo Điều 15 TT 04/2022.`
    };
  }
}

// ----------------------------------------------------------------------------
// 5. TẠO HASH NHẬT KÝ KIỂM TOÁN BẤT BIẾN (TAMPER-EVIDENT AUDIT TRAIL)
// ----------------------------------------------------------------------------
export function generateAuditHash(payload: {
  submissionId: string;
  reviewerId: string;
  originalScore: number;
  reviewedScore: number;
  reason?: string;
  timestamp: number;
}): string {
  const str = `${payload.submissionId}|${payload.reviewerId}|${payload.originalScore}|${payload.reviewedScore}|${payload.reason || ''}|${payload.timestamp}`;
  // Simple deterministic DJB2 / Murmur hash string representation for client/offline audit
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return `AUDIT_${Math.abs(hash).toString(16).toUpperCase()}_${payload.timestamp}`;
}
