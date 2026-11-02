// In-memory repository: used ONLY by tests (enforced in getRepo). Mirrors DB constraints
// (unique seq per school, atomic commit, append-only) so concurrency logic is exercised.
import {
  AnswerKeyRow, AuditEntryRow, GradingRepo, ScoreRow, StaffRecord, UniqueViolation
} from './types';

export class MemoryRepo implements GradingRepo {
  staff = new Map<string, StaffRecord>();
  roster = new Set<string>();
  audit: AuditEntryRow[] = [];
  keys = new Map<string, AnswerKeyRow>();
  scores = new Map<string, ScoreRow>();
  scoreHistory: ScoreRow[] = [];
  failNextInsertAudit = false;
  failNextCommit = false;

  async getStaff(userId: string) { return this.staff.get(userId) ?? null; }
  async hasStudent(s: string, c: string, code: string) { return this.roster.has(`${s}#${c}#${code}`); }
  async upsertRoster(s: string, c: string, codes: string[]) {
    codes.forEach(code => this.roster.add(`${s}#${c}#${code}`));
    return codes.length;
  }

  async insertAudit(row: AuditEntryRow) {
    await Promise.resolve(); // yield: lets concurrent callers interleave like a real DB
    if (this.failNextInsertAudit) { this.failNextInsertAudit = false; throw new Error('simulated storage failure'); }
    if (this.audit.some(r => r.schoolId === row.schoolId && r.seq === row.seq)) throw new UniqueViolation();
    this.audit.push({ ...row });
  }
  async auditHead(schoolId: string) {
    await Promise.resolve();
    const rows = this.audit.filter(r => r.schoolId === schoolId);
    return rows.length ? { ...rows.reduce((a, b) => (b.seq > a.seq ? b : a)) } : null;
  }
  async auditChain(schoolId: string) {
    return this.audit.filter(r => r.schoolId === schoolId).sort((a, b) => a.seq - b.seq).map(r => ({ ...r }));
  }

  private kk(s: string, c: string, sub: string, e: string) { return `${s}#${c}#${sub}#${e}`; }
  async getKey(s: string, c: string, sub: string, e: string) { return this.keys.get(this.kk(s, c, sub, e)) ?? null; }
  async saveKey(k: AnswerKeyRow) { this.keys.set(this.kk(k.schoolId, k.classId, k.subjectId, k.examCode), { ...k }); }

  async commitScores(rows: Omit<ScoreRow, 'revision'>[]) {
    if (this.failNextCommit) { this.failNextCommit = false; throw new Error('simulated commit failure'); }
    const staged = new Map(this.scores);
    const history: ScoreRow[] = [];
    const out: ScoreRow[] = [];
    for (const r of rows) {
      const k = `${r.schoolId}#${r.classId}#${r.subjectId}#${r.assessmentId}#${r.studentCode}`;
      const prev = staged.get(k);
      const next: ScoreRow = { ...r, revision: prev ? (prev.score === r.score && prev.auditEntryHash === r.auditEntryHash ? prev.revision : prev.revision + 1) : 1 };
      if (prev && next.revision !== prev.revision) history.push(prev);
      staged.set(k, next);
      out.push(next);
    }
    this.scores = staged; // atomic swap
    this.scoreHistory.push(...history);
    return out;
  }
  async getScores(s: string, c: string, sub: string, a: string) {
    return [...this.scores.values()].filter(r => r.schoolId === s && r.classId === c && r.subjectId === sub && r.assessmentId === a);
  }
}
