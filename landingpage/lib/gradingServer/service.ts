// ============================================================================
// EDUVIET GRADING R4 — authoritative grading service (audit append, chain verify,
// score verification + atomic commit, answer-key lifecycle). Every failure path throws => caller fails closed.
// ============================================================================
import { validateAnswerKey } from '../gradingKey';
import { AuthContext, HttpError, assertClassAccess, assertRole, getRepo } from './auth';
import { GENESIS_HASH, GradingConfigError, canonicalize, loadHmacKeys, sealEntry, sha256Hex, verifyEntrySeal } from './crypto';
import { AnswerKeyRow, AuditEntryRow, Blueprint, ScoreRow, UniqueViolation } from './types';

const ID_RE = /^[A-Za-z0-9_.\-]{1,64}$/;
const ACTIONS = new Set(['APPROVE_AS_IS', 'ADJUST_SCORE']);
const SCORE_ACTIONS_OK = ACTIONS;

function reqId(v: unknown, name: string): string {
  if (typeof v !== 'string' || !ID_RE.test(v)) throw new HttpError(400, `${name} thiếu hoặc sai định dạng`);
  return v;
}
function reqScore(v: unknown, name: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 10) throw new HttpError(400, `${name} phải nằm trong [0, 10]`);
  if (Math.abs(v * 100 - Math.round(v * 100)) > 1e-9) throw new HttpError(400, `${name} tối đa 2 chữ số thập phân`);
  return v;
}

// ---------- audit ----------
export interface AuditInput {
  classId: string; subjectId: string; assessmentId: string; submissionId: string;
  studentCode: string; examCode: string; action: string;
  originalScore: number; reviewedScore: number; reason: string; policyId?: string;
}

export async function appendAudit(ctx: AuthContext, input: AuditInput): Promise<AuditEntryRow> {
  const classId = reqId(input.classId, 'classId');
  const subjectId = reqId(input.subjectId, 'subjectId');
  const assessmentId = reqId(input.assessmentId, 'assessmentId');
  const submissionId = reqId(input.submissionId, 'submissionId');
  const studentCode = reqId(input.studentCode, 'studentCode');
  const examCode = reqId(input.examCode, 'examCode');
  if (!ACTIONS.has(input.action)) throw new HttpError(400, 'action không hợp lệ');
  const originalScore = reqScore(input.originalScore, 'originalScore');
  const reviewedScore = reqScore(input.reviewedScore, 'reviewedScore');
  const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
  if (reason.length < 3 || reason.length > 500) throw new HttpError(400, 'reason bắt buộc (3–500 ký tự)');
  if (input.action === 'ADJUST_SCORE' && reason.length < 10) throw new HttpError(400, 'Điều chỉnh điểm cần lý do ≥ 10 ký tự');
  const policyId = reqId(input.policyId ?? 'GDPT_2018_TT22', 'policyId');

  assertClassAccess(ctx, classId); // schoolId ALWAYS from DB staff record, never from the request
  const repo = getRepo();
  if (!(await repo.hasStudent(ctx.schoolId, classId, studentCode))) throw new HttpError(422, 'SBD/mã học sinh không có trong danh sách lớp');
  const key = await repo.getKey(ctx.schoolId, classId, subjectId, examCode);
  if (!key || key.status !== 'APPROVED') throw new HttpError(422, 'Chưa có đáp án chuẩn đã duyệt cho mã đề này');

  const { active } = loadHmacKeys(); // throws GradingConfigError if secrets missing => 503
  for (let attempt = 0; attempt < 12; attempt++) {
    const head = await repo.auditHead(ctx.schoolId);
    const unsealed = {
      seq: (head?.seq ?? 0) + 1, schoolId: ctx.schoolId, classId, subjectId, assessmentId, submissionId, studentCode,
      examCode, keyVersion: key.version, reviewerId: ctx.userId, reviewerRole: ctx.role, action: input.action,
      originalScore, reviewedScore, reason, policyId, serverTimestamp: Date.now(),
      prevHash: head?.entryHash ?? GENESIS_HASH, hmacKeyVersion: active
    };
    const row: AuditEntryRow = { ...unsealed, ...sealEntry(unsealed) };
    try {
      await repo.insertAudit(row); // errors other than UniqueViolation propagate => never reports success
      return row;
    } catch (e) {
      if (!(e instanceof UniqueViolation)) throw e;
      await new Promise(r => setTimeout(r, Math.random() * 10 * (attempt + 1)));
    }
  }
  throw new HttpError(503, 'Hàng đợi ghi nhật ký quá tải, vui lòng thử lại');
}

export interface ChainVerdict { valid: boolean; length: number; reason?: string; brokenAtSeq?: number }

export function verifyChain(chain: AuditEntryRow[]): ChainVerdict {
  let prev = GENESIS_HASH;
  for (let i = 0; i < chain.length; i++) {
    const e = chain[i];
    if (e.seq !== i + 1) return { valid: false, length: chain.length, reason: 'seq không liên tục (mất/chen bản ghi)', brokenAtSeq: e.seq };
    if (e.prevHash !== prev) return { valid: false, length: chain.length, reason: 'prevHash không khớp', brokenAtSeq: e.seq };
    if (!verifyEntrySeal(e)) return { valid: false, length: chain.length, reason: 'hash/HMAC không hợp lệ hoặc thiếu chữ ký', brokenAtSeq: e.seq };
    prev = e.entryHash;
  }
  return { valid: true, length: chain.length };
}

export async function readAudit(ctx: AuthContext, q: { classId: string; assessmentId?: string; studentCode?: string }) {
  const classId = reqId(q.classId, 'classId'); // no unscoped listing
  assertClassAccess(ctx, classId);
  const chain = await getRepo().auditChain(ctx.schoolId);
  const verdict = verifyChain(chain);
  const entries = chain
    .filter(e => e.classId === classId && (!q.assessmentId || e.assessmentId === q.assessmentId) && (!q.studentCode || e.studentCode === q.studentCode))
    .slice(-200);
  return { verdict, entries };
}

// ---------- scores ----------
export interface ScorePayload {
  classId: string; subjectId: string; assessmentId: string;
  records: { studentCode: string; score: number; auditEntryHash: string }[];
}
export interface RecordVerdict { studentCode: string; ok: boolean; problem?: string }

export async function verifyScores(ctx: AuthContext, p: ScorePayload): Promise<{ allOk: boolean; verdicts: RecordVerdict[]; examCodes: Record<string, string> }> {
  const classId = reqId(p.classId, 'classId');
  const subjectId = reqId(p.subjectId, 'subjectId');
  const assessmentId = reqId(p.assessmentId, 'assessmentId');
  assertClassAccess(ctx, classId);
  if (!Array.isArray(p.records) || p.records.length === 0 || p.records.length > 500) throw new HttpError(400, 'records phải có 1–500 phần tử');
  const seen = new Set<string>();
  for (const r of p.records) {
    reqId(r.studentCode, 'studentCode');
    reqScore(r.score, 'score');
    if (seen.has(r.studentCode)) throw new HttpError(400, `Trùng studentCode ${r.studentCode}`);
    seen.add(r.studentCode);
  }
  const repo = getRepo();
  const chain = await repo.auditChain(ctx.schoolId);
  const verdict = verifyChain(chain);
  if (!verdict.valid) throw new HttpError(409, `Chuỗi kiểm toán không toàn vẹn (${verdict.reason}) — chặn ghi điểm`);

  const latest = new Map<string, AuditEntryRow>();
  for (const e of chain) {
    if (e.classId === classId && e.subjectId === subjectId && e.assessmentId === assessmentId) latest.set(e.studentCode, e);
  }
  const verdicts: RecordVerdict[] = [];
  const examCodes: Record<string, string> = {};
  for (const r of p.records) {
    const fail = (problem: string) => verdicts.push({ studentCode: r.studentCode, ok: false, problem });
    const e = latest.get(r.studentCode);
    if (!e) { fail('Không có bản ghi kiểm toán đã ký cho học sinh/bài thi này'); continue; }
    if (!SCORE_ACTIONS_OK.has(e.action)) { fail('Hành động kiểm toán không phải phê duyệt điểm'); continue; }
    if (e.entryHash !== r.auditEntryHash) { fail('auditEntryHash không phải bản ghi mới nhất (đã bị thay thế hoặc sai)'); continue; }
    if (Math.abs(e.reviewedScore - r.score) > 1e-9) { fail(`Điểm ${r.score} ≠ điểm đã ký duyệt ${e.reviewedScore}`); continue; }
    if (e.reviewerId !== ctx.userId && ctx.role === 'TEACHER') { fail('Giáo viên chỉ được ghi điểm do chính mình phê duyệt'); continue; }
    if (!(await repo.hasStudent(ctx.schoolId, classId, r.studentCode))) { fail('Học sinh không thuộc danh sách lớp'); continue; }
    const key = await repo.getKey(ctx.schoolId, classId, subjectId, e.examCode);
    if (!key || key.status !== 'APPROVED' || key.version !== e.keyVersion) { fail('Đáp án chuẩn đã bị thu hồi/thay đổi so với lúc duyệt điểm'); continue; }
    examCodes[r.studentCode] = e.examCode;
    verdicts.push({ studentCode: r.studentCode, ok: true });
  }
  return { allOk: verdicts.every(v => v.ok), verdicts, examCodes };
}

export async function commitScores(ctx: AuthContext, p: ScorePayload): Promise<ScoreRow[]> {
  const v = await verifyScores(ctx, p);
  if (!v.allOk) throw new HttpError(422, `Xác minh thất bại, KHÔNG ghi sổ điểm: ${JSON.stringify(v.verdicts.filter(x => !x.ok))}`);
  const repo = getRepo();
  const now = Date.now();
  const rows = p.records.map(r => ({
    schoolId: ctx.schoolId, classId: p.classId, subjectId: p.subjectId, assessmentId: p.assessmentId,
    studentCode: r.studentCode, score: r.score, examCode: v.examCodes[r.studentCode],
    auditEntryHash: r.auditEntryHash, committedBy: ctx.userId, committedAt: now
  }));
  const written = await repo.commitScores(rows); // atomic; throws => nothing persisted
  const readBack = await repo.getScores(ctx.schoolId, p.classId, p.subjectId, p.assessmentId);
  const byStudent = new Map(readBack.map(r => [r.studentCode, r]));
  for (const r of rows) {
    const rb = byStudent.get(r.studentCode);
    if (!rb || Math.abs(rb.score - r.score) > 1e-9 || rb.auditEntryHash !== r.auditEntryHash) {
      throw new Error(`Read-after-write thất bại cho ${r.studentCode}`);
    }
  }
  return written;
}

// ---------- answer keys ----------
export interface KeyInput {
  classId: string; subjectId: string; examCode: string; blueprint: Blueprint;
  part1Key: AnswerKeyRow['part1Key']; part2Key: AnswerKeyRow['part2Key']; part3Key: AnswerKeyRow['part3Key'];
}

export async function saveDraftKey(ctx: AuthContext, k: KeyInput): Promise<AnswerKeyRow> {
  const classId = reqId(k.classId, 'classId'); const subjectId = reqId(k.subjectId, 'subjectId'); const examCode = reqId(k.examCode, 'examCode');
  assertClassAccess(ctx, classId);
  const errs = validateAnswerKey(k);
  if (errs.length) throw new HttpError(422, `Đáp án chưa hợp lệ: ${errs.slice(0, 10).join('; ')}`);
  const repo = getRepo();
  const prev = await repo.getKey(ctx.schoolId, classId, subjectId, examCode);
  if (prev && prev.status === 'APPROVED') throw new HttpError(409, 'Đáp án đã duyệt là bất biến — phải thu hồi trước khi tạo phiên bản mới');
  const row: AnswerKeyRow = {
    schoolId: ctx.schoolId, classId, subjectId, examCode, version: (prev?.version ?? 0) + 1,
    blueprint: k.blueprint, part1Key: k.part1Key, part2Key: k.part2Key, part3Key: k.part3Key,
    status: 'DRAFT', createdBy: ctx.userId
  };
  await repo.saveKey(row);
  return row;
}

function keyDigest(k: AnswerKeyRow) {
  return sha256Hex(canonicalize({ s: k.schoolId, c: k.classId, sub: k.subjectId, e: k.examCode, v: k.version, b: k.blueprint, p1: k.part1Key, p2: k.part2Key, p3: k.part3Key, by: k.createdBy }));
}

export async function approveKey(ctx: AuthContext, classId: string, subjectId: string, examCode: string): Promise<AnswerKeyRow> {
  assertRole(ctx, 'HEAD_OF_DEPARTMENT', 'SCHOOL_ADMIN');
  reqId(classId, 'classId'); reqId(subjectId, 'subjectId'); reqId(examCode, 'examCode');
  assertClassAccess(ctx, classId);
  const repo = getRepo();
  const k = await repo.getKey(ctx.schoolId, classId, subjectId, examCode);
  if (!k || k.status !== 'DRAFT') throw new HttpError(404, 'Không có bản nháp đáp án để duyệt');
  if (k.createdBy === ctx.userId) throw new HttpError(403, 'Người tạo không được tự duyệt đáp án (nguyên tắc 4 mắt)');
  const errs = validateAnswerKey(k);
  if (errs.length) throw new HttpError(422, `Đáp án chưa hợp lệ: ${errs.join('; ')}`);
  const approved: AnswerKeyRow = { ...k, status: 'APPROVED', approvedBy: ctx.userId, approvedAt: Date.now(), approvalHash: keyDigest(k) };
  await repo.saveKey(approved);
  return approved;
}

export async function revokeKey(ctx: AuthContext, classId: string, subjectId: string, examCode: string): Promise<void> {
  assertRole(ctx, 'HEAD_OF_DEPARTMENT', 'SCHOOL_ADMIN');
  assertClassAccess(ctx, reqId(classId, 'classId'));
  const repo = getRepo();
  const k = await repo.getKey(ctx.schoolId, classId, reqId(subjectId, 'subjectId'), reqId(examCode, 'examCode'));
  if (!k) throw new HttpError(404, 'Không tìm thấy đáp án');
  await repo.saveKey({ ...k, status: 'REVOKED' });
}

export async function getApprovedKey(ctx: AuthContext, classId: string, subjectId: string, examCode: string): Promise<AnswerKeyRow> {
  assertClassAccess(ctx, reqId(classId, 'classId'));
  const k = await getRepo().getKey(ctx.schoolId, classId, reqId(subjectId, 'subjectId'), reqId(examCode, 'examCode'));
  if (!k || k.status !== 'APPROVED') throw new HttpError(404, 'Không có đáp án chuẩn đã duyệt cho mã đề này');
  return k;
}

export async function upsertRoster(ctx: AuthContext, classId: string, codes: string[]): Promise<number> {
  assertRole(ctx, 'HEAD_OF_DEPARTMENT', 'SCHOOL_ADMIN');
  assertClassAccess(ctx, reqId(classId, 'classId'));
  if (!Array.isArray(codes) || codes.length === 0 || codes.length > 2000) throw new HttpError(400, 'Danh sách học sinh 1–2000');
  codes.forEach(c => reqId(c, 'studentCode'));
  return getRepo().upsertRoster(ctx.schoolId, classId, codes);
}

export { GradingConfigError };
