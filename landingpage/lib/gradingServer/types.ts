// ============================================================================
// EDUVIET GRADING R4 — domain types + repository contract (server authoritative)
// ============================================================================
export type StaffRole = 'TEACHER' | 'HEAD_OF_DEPARTMENT' | 'SCHOOL_ADMIN';

export interface StaffRecord {
  userId: string;
  schoolId: string;
  role: StaffRole;
  allowedClasses: string[]; // explicit list; '*' is NOT honoured
  active: boolean;
}

export interface AuditEntryRow {
  seq: number;
  schoolId: string;
  classId: string;
  subjectId: string;
  assessmentId: string;
  submissionId: string;
  studentCode: string;
  examCode: string;
  keyVersion: number;
  reviewerId: string;
  reviewerRole: string;
  action: string;
  originalScore: number;
  reviewedScore: number;
  reason: string;
  policyId: string;
  serverTimestamp: number;
  prevHash: string;
  hmacKeyVersion: string;
  entryHash: string;
  hmac: string;
}

export interface Blueprint {
  templateId: string; // e.g. GDPT_THPT_2025_40_8_6
  part1: { count: number; pointsEach: number };
  part2: { count: number }; // THPT 2025 progressive scheme, 1.0 max per question
  part3: { count: number; pointsEach: number };
}

export interface AnswerKeyRow {
  schoolId: string;
  classId: string;
  subjectId: string;
  examCode: string;
  version: number;
  blueprint: Blueprint;
  part1Key: Record<string, 'A' | 'B' | 'C' | 'D'>;
  part2Key: Record<string, Record<'a' | 'b' | 'c' | 'd', boolean>>;
  part3Key: Record<string, string>;
  status: 'DRAFT' | 'APPROVED' | 'REVOKED';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: number;
  approvalHash?: string;
}

export interface ScoreRow {
  schoolId: string;
  classId: string;
  subjectId: string;
  assessmentId: string;
  studentCode: string;
  score: number;
  examCode: string;
  auditEntryHash: string;
  committedBy: string;
  committedAt: number;
  revision: number;
}

export class UniqueViolation extends Error {
  constructor(msg = 'unique violation') {
    super(msg);
    this.name = 'UniqueViolation';
  }
}

export interface GradingRepo {
  getStaff(userId: string): Promise<StaffRecord | null>;
  hasStudent(schoolId: string, classId: string, studentCode: string): Promise<boolean>;
  upsertRoster(schoolId: string, classId: string, studentCodes: string[]): Promise<number>;

  /** Insert with unique(school_id, seq); throws UniqueViolation on race. Append-only. */
  insertAudit(row: AuditEntryRow): Promise<void>;
  auditHead(schoolId: string): Promise<AuditEntryRow | null>;
  auditChain(schoolId: string): Promise<AuditEntryRow[]>; // ordered by seq

  getKey(schoolId: string, classId: string, subjectId: string, examCode: string): Promise<AnswerKeyRow | null>;
  saveKey(key: AnswerKeyRow): Promise<void>;

  /** Atomic all-or-nothing upsert on unique(school,class,subject,assessment,student); keeps history. */
  commitScores(rows: Omit<ScoreRow, 'revision'>[]): Promise<ScoreRow[]>;
  getScores(schoolId: string, classId: string, subjectId: string, assessmentId: string): Promise<ScoreRow[]>;
}
