// Supabase/Postgres repository. Service-role only; URL + key MUST come from env (no embedded fallbacks).
// NOTE: not yet exercised against a live database (no staging DB provisioned) — see R4 report.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GradingConfigError } from './crypto';
import {
  AnswerKeyRow, AuditEntryRow, GradingRepo, ScoreRow, StaffRecord, UniqueViolation
} from './types';

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.GRADING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.GRADING_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.GRADING_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new GradingConfigError('GRADING_SUPABASE_URL/GRADING_SUPABASE_SERVICE_KEY chưa cấu hình.');
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

const toAudit = (r: any): AuditEntryRow => ({
  seq: Number(r.seq), schoolId: r.school_id, classId: r.class_id, subjectId: r.subject_id,
  assessmentId: r.assessment_id, submissionId: r.submission_id, studentCode: r.student_code,
  examCode: r.exam_code, keyVersion: r.key_version, reviewerId: r.reviewer_id, reviewerRole: r.reviewer_role,
  action: r.action, originalScore: Number(r.original_score), reviewedScore: Number(r.reviewed_score),
  reason: r.reason, policyId: r.policy_id, serverTimestamp: Number(r.server_timestamp),
  prevHash: r.prev_hash, hmacKeyVersion: r.hmac_key_version, entryHash: r.entry_hash, hmac: r.hmac
});
const fromAudit = (r: AuditEntryRow) => ({
  school_id: r.schoolId, seq: r.seq, class_id: r.classId, subject_id: r.subjectId, assessment_id: r.assessmentId,
  submission_id: r.submissionId, student_code: r.studentCode, exam_code: r.examCode, key_version: r.keyVersion,
  reviewer_id: r.reviewerId, reviewer_role: r.reviewerRole, action: r.action, original_score: r.originalScore,
  reviewed_score: r.reviewedScore, reason: r.reason, policy_id: r.policyId, server_timestamp: r.serverTimestamp,
  prev_hash: r.prevHash, hmac_key_version: r.hmacKeyVersion, entry_hash: r.entryHash, hmac: r.hmac
});
const toScore = (r: any): ScoreRow => ({
  schoolId: r.school_id, classId: r.class_id, subjectId: r.subject_id, assessmentId: r.assessment_id,
  studentCode: r.student_code, score: Number(r.score), examCode: r.exam_code, auditEntryHash: r.audit_entry_hash,
  committedBy: r.committed_by, committedAt: Number(r.committed_at), revision: r.revision
});

export class SupabaseRepo implements GradingRepo {
  async getStaff(userId: string): Promise<StaffRecord | null> {
    const { data, error } = await db().from('grading_staff').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw new Error(`getStaff: ${error.message}`);
    return data ? { userId: data.user_id, schoolId: data.school_id, role: data.role, allowedClasses: data.allowed_classes ?? [], active: data.active } : null;
  }
  async hasStudent(schoolId: string, classId: string, studentCode: string) {
    const { data, error } = await db().from('grading_roster').select('student_code')
      .eq('school_id', schoolId).eq('class_id', classId).eq('student_code', studentCode).maybeSingle();
    if (error) throw new Error(`hasStudent: ${error.message}`);
    return !!data;
  }
  async upsertRoster(schoolId: string, classId: string, codes: string[]) {
    const { error } = await db().from('grading_roster').upsert(codes.map(c => ({ school_id: schoolId, class_id: classId, student_code: c })));
    if (error) throw new Error(`upsertRoster: ${error.message}`);
    return codes.length;
  }
  async insertAudit(row: AuditEntryRow) {
    const { error } = await db().from('grading_audit_ledger').insert(fromAudit(row));
    if (error) {
      if (error.code === '23505') throw new UniqueViolation();
      throw new Error(`insertAudit: ${error.message}`);
    }
  }
  async auditHead(schoolId: string) {
    const { data, error } = await db().from('grading_audit_ledger').select('*').eq('school_id', schoolId)
      .order('seq', { ascending: false }).limit(1);
    if (error) throw new Error(`auditHead: ${error.message}`);
    return data && data.length ? toAudit(data[0]) : null;
  }
  async auditChain(schoolId: string) {
    const out: AuditEntryRow[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db().from('grading_audit_ledger').select('*').eq('school_id', schoolId)
        .order('seq', { ascending: true }).range(from, from + 999);
      if (error) throw new Error(`auditChain: ${error.message}`);
      out.push(...(data ?? []).map(toAudit));
      if (!data || data.length < 1000) break;
    }
    return out;
  }
  async getKey(schoolId: string, classId: string, subjectId: string, examCode: string): Promise<AnswerKeyRow | null> {
    const { data, error } = await db().from('grading_answer_keys').select('*')
      .eq('school_id', schoolId).eq('class_id', classId).eq('subject_id', subjectId).eq('exam_code', examCode).maybeSingle();
    if (error) throw new Error(`getKey: ${error.message}`);
    if (!data) return null;
    return {
      schoolId: data.school_id, classId: data.class_id, subjectId: data.subject_id, examCode: data.exam_code,
      version: data.version, blueprint: data.blueprint, part1Key: data.part1_key, part2Key: data.part2_key,
      part3Key: data.part3_key, status: data.status, createdBy: data.created_by, approvedBy: data.approved_by ?? undefined,
      approvedAt: data.approved_at ? Date.parse(data.approved_at) : undefined, approvalHash: data.approval_hash ?? undefined
    };
  }
  async saveKey(k: AnswerKeyRow) {
    const { error } = await db().from('grading_answer_keys').upsert({
      school_id: k.schoolId, class_id: k.classId, subject_id: k.subjectId, exam_code: k.examCode, version: k.version,
      blueprint: k.blueprint, part1_key: k.part1Key, part2_key: k.part2Key, part3_key: k.part3Key, status: k.status,
      created_by: k.createdBy, approved_by: k.approvedBy ?? null,
      approved_at: k.approvedAt ? new Date(k.approvedAt).toISOString() : null, approval_hash: k.approvalHash ?? null
    });
    if (error) throw new Error(`saveKey: ${error.message}`);
  }
  async commitScores(rows: Omit<ScoreRow, 'revision'>[]) {
    const { data, error } = await db().rpc('grading_commit_scores', {
      p_rows: rows.map(r => ({
        school_id: r.schoolId, class_id: r.classId, subject_id: r.subjectId, assessment_id: r.assessmentId,
        student_code: r.studentCode, score: r.score, exam_code: r.examCode, audit_entry_hash: r.auditEntryHash,
        committed_by: r.committedBy, committed_at: r.committedAt
      }))
    });
    if (error) throw new Error(`commitScores: ${error.message}`);
    return (data as any[]).map(toScore);
  }
  async getScores(schoolId: string, classId: string, subjectId: string, assessmentId: string) {
    const { data, error } = await db().from('grading_scores').select('*').eq('school_id', schoolId)
      .eq('class_id', classId).eq('subject_id', subjectId).eq('assessment_id', assessmentId);
    if (error) throw new Error(`getScores: ${error.message}`);
    return (data ?? []).map(toScore);
  }
}
