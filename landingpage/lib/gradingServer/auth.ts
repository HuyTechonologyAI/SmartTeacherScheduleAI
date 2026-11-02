// ============================================================================
// EDUVIET GRADING R4 — server-side authentication + RBAC/tenant isolation.
// Identity = a token verified by the Supabase Auth server (signature/expiry/revocation).
// Role/school/classes = read from grading_staff in the DB. NOTHING from client headers/body is trusted.
// ============================================================================
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { GradingConfigError } from './crypto';
import { MemoryRepo } from './memoryRepo';
import { SupabaseRepo } from './supabaseRepo';
import type { GradingRepo, StaffRecord, StaffRole } from './types';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type TokenVerifier = (token: string) => Promise<{ userId: string } | null>;

let overrideVerifier: TokenVerifier | null = null;
let overrideRepo: GradingRepo | null = null;
let prodRepo: GradingRepo | null = null;

/** Test seams — refuse to work outside NODE_ENV=test so they cannot weaken production. */
export function __setTestSeams(v: TokenVerifier | null, r: GradingRepo | null) {
  if (process.env.NODE_ENV !== 'test') throw new Error('test seams are disabled outside NODE_ENV=test');
  overrideVerifier = v;
  overrideRepo = r;
}
export function __newMemoryRepo() {
  if (process.env.NODE_ENV !== 'test') throw new Error('MemoryRepo is test-only');
  return new MemoryRepo();
}

export function getRepo(): GradingRepo {
  if (overrideRepo) return overrideRepo;
  return (prodRepo ??= new SupabaseRepo());
}

async function supabaseAuthVerifier(token: string): Promise<{ userId: string } | null> {
  const url = process.env.GRADING_SUPABASE_URL;
  const anon = process.env.GRADING_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new GradingConfigError('GRADING_SUPABASE_URL/GRADING_SUPABASE_ANON_KEY chưa cấu hình.');
  const c = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await c.auth.getUser(token); // server round-trip: validates signature + expiry
  if (error || !data?.user?.id) return null;
  return { userId: data.user.id };
}

export interface AuthContext {
  userId: string;
  schoolId: string;
  role: StaffRole;
  allowedClasses: string[];
}

export async function authenticate(req: NextRequest | Request): Promise<AuthContext> {
  const header = req.headers.get('authorization') || '';
  const m = /^Bearer\s+([A-Za-z0-9._~+\-/]+=*)$/.exec(header);
  if (!m) throw new HttpError(401, 'Thiếu hoặc sai định dạng Authorization Bearer token');
  const verifier = overrideVerifier ?? supabaseAuthVerifier;
  const ident = await verifier(m[1]);
  if (!ident) throw new HttpError(401, 'Token không hợp lệ hoặc đã hết hạn');
  const staff: StaffRecord | null = await getRepo().getStaff(ident.userId);
  if (!staff || !staff.active) throw new HttpError(403, 'Tài khoản chưa được cấp quyền chấm điểm');
  return { userId: staff.userId, schoolId: staff.schoolId, role: staff.role, allowedClasses: staff.allowedClasses.filter(c => c !== '*') };
}

/** Deny-by-default class access inside the caller's own school. */
export function assertClassAccess(ctx: AuthContext, classId: string) {
  if (ctx.role === 'SCHOOL_ADMIN') return; // whole own school only (schoolId always from DB)
  if (!ctx.allowedClasses.includes(classId)) throw new HttpError(403, `Không có quyền với lớp ${classId}`);
}

export function assertRole(ctx: AuthContext, ...roles: StaffRole[]) {
  if (!roles.includes(ctx.role)) throw new HttpError(403, 'Vai trò không đủ quyền cho thao tác này');
}

export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) return Response.json({ success: false, error: err.message }, { status: err.status });
  if (err instanceof GradingConfigError) {
    console.error('[grading] config error:', err.message);
    return Response.json({ success: false, error: 'Dịch vụ chấm điểm chưa được cấu hình an toàn (fail-closed).' }, { status: 503 });
  }
  console.error('[grading] internal error:', err);
  return Response.json({ success: false, error: 'Lỗi hệ thống; thao tác bị chặn (fail-closed).' }, { status: 500 });
}
