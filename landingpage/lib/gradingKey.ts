// Pure answer-key / blueprint validation (shared by server routes, OMR grader and tests).
import type { Blueprint } from './gradingServer/types';

export const SHEET_TEMPLATES: Record<string, { maxPart1: number; maxPart2: number; maxPart3: number }> = {
  // Physical sheet geometry in omrEngine supports up to 40 MCQ / 8 TF4 / 6 short answers.
  GDPT_THPT_2025_40_8_6: { maxPart1: 40, maxPart2: 8, maxPart3: 6 }
};

const EPS = 1e-9;

export function blueprintMaxPoints(b: Blueprint): number {
  return b.part1.count * b.part1.pointsEach + b.part2.count * 1.0 + b.part3.count * b.part3.pointsEach;
}

export interface KeyShape {
  blueprint: Blueprint;
  part1Key: Record<string, string>;
  part2Key: Record<string, Record<string, boolean>>;
  part3Key: Record<string, string>;
}

/** Returns a list of problems; empty list == complete, valid, sums to exactly 10 points. */
export function validateAnswerKey(k: KeyShape): string[] {
  const errs: string[] = [];
  const b = k?.blueprint;
  if (!b) return ['Thiếu blueprint'];
  const tpl = SHEET_TEMPLATES[b.templateId];
  if (!tpl) return [`Mẫu phiếu không hỗ trợ: ${b.templateId}`];
  const ints = [b.part1?.count, b.part2?.count, b.part3?.count];
  if (ints.some(n => !Number.isInteger(n) || n < 0)) errs.push('Số câu mỗi phần phải là số nguyên ≥ 0');
  if (b.part1.count > tpl.maxPart1 || b.part2.count > tpl.maxPart2 || b.part3.count > tpl.maxPart3) {
    errs.push('Số câu vượt quá khả năng của mẫu phiếu');
  }
  if (!(b.part1.pointsEach >= 0) || !(b.part3.pointsEach >= 0)) errs.push('Điểm mỗi câu không hợp lệ');
  if (Math.abs(blueprintMaxPoints(b) - 10) > EPS) {
    errs.push(`Tổng điểm tối đa của đề = ${blueprintMaxPoints(b)} (bắt buộc đúng 10.0)`);
  }
  for (let q = 1; q <= b.part1.count; q++) {
    if (!['A', 'B', 'C', 'D'].includes(k.part1Key?.[q])) errs.push(`Phần I câu ${q} thiếu/không hợp lệ`);
  }
  for (let q = 1; q <= b.part2.count; q++) {
    for (const s of ['a', 'b', 'c', 'd']) {
      if (typeof k.part2Key?.[q]?.[s] !== 'boolean') errs.push(`Phần II câu ${q} ý ${s} thiếu`);
    }
  }
  for (let q = 1; q <= b.part3.count; q++) {
    const v = k.part3Key?.[q];
    if (typeof v !== 'string' || v.trim() === '' || !Number.isFinite(Number(v.replace(',', '.')))) {
      errs.push(`Phần III câu ${q} thiếu/không phải số`);
    }
  }
  return errs;
}
