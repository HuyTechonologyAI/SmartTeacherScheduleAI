// ============================================================================
// EDUVIET GRADING R4 — HMAC + canonical serialization for the audit ledger.
// Secrets come ONLY from environment/secret manager. No default, no fallback:
// missing/weak key => GradingConfigError => request fails closed (HTTP 503).
// ============================================================================
import crypto from 'node:crypto';

export class GradingConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GradingConfigError';
  }
}

export const GENESIS_HASH = '0'.repeat(64);

const PLACEHOLDER_PATTERNS = [/changeme/i, /example/i, /placeholder/i, /HAC_EDUVIET_AUDIT_SECRET/i, /^(.)\1+$/];

/** AUDIT_HMAC_KEYS = JSON {"v1":"<>=32-byte secret>", "v2":"..."}; AUDIT_HMAC_ACTIVE = "v2". */
export function loadHmacKeys(env: NodeJS.ProcessEnv = process.env): { keys: Record<string, string>; active: string } {
  const raw = env.AUDIT_HMAC_KEYS;
  const active = env.AUDIT_HMAC_ACTIVE;
  if (!raw || !active) {
    throw new GradingConfigError('AUDIT_HMAC_KEYS/AUDIT_HMAC_ACTIVE chưa được cấu hình (không có khóa mặc định).');
  }
  let keys: Record<string, string>;
  try {
    keys = JSON.parse(raw);
  } catch {
    throw new GradingConfigError('AUDIT_HMAC_KEYS không phải JSON hợp lệ.');
  }
  if (!keys[active]) throw new GradingConfigError(`Khóa HMAC active "${active}" không tồn tại.`);
  for (const [version, secret] of Object.entries(keys)) {
    if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32) {
      throw new GradingConfigError(`Khóa HMAC "${version}" quá ngắn (<32 bytes).`);
    }
    if (PLACEHOLDER_PATTERNS.some(p => p.test(secret))) {
      throw new GradingConfigError(`Khóa HMAC "${version}" là giá trị mẫu/không an toàn.`);
    }
  }
  return { keys, active };
}

/** Deterministic JSON: sorted keys, no undefined. Covers EVERY field passed in. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite number in canonical record');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(canonicalize).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter(k => obj[k] !== undefined).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
}

export interface SealableEntry {
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
}

export function sealEntry(entry: SealableEntry, env: NodeJS.ProcessEnv = process.env): { entryHash: string; hmac: string } {
  const { keys } = loadHmacKeys(env);
  const secret = keys[entry.hmacKeyVersion];
  if (!secret) throw new GradingConfigError(`Không có khóa HMAC cho phiên bản ${entry.hmacKeyVersion}`);
  const canonical = canonicalize(entry);
  const entryHash = crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
  const hmac = crypto.createHmac('sha256', secret).update(`${canonical}|${entryHash}`, 'utf8').digest('hex');
  return { entryHash, hmac };
}

export function verifyEntrySeal(
  entry: SealableEntry & { entryHash: string; hmac: string },
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (!entry.hmac || !entry.entryHash) return false; // empty signature is NEVER valid
  const { keys } = loadHmacKeys(env);
  if (!keys[entry.hmacKeyVersion]) return false;
  const { entryHash, hmac, ...rest } = entry;
  const expected = sealEntry(rest as SealableEntry, env);
  const a = Buffer.from(expected.hmac, 'hex');
  const b = Buffer.from(hmac, 'hex');
  return expected.entryHash === entryHash && a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function sha256Hex(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}
