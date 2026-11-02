// R4: authenticated, tenant-scoped, durable, HMAC-sealed audit ledger. Fail-closed on every error.
import { NextRequest } from 'next/server';
import { authenticate, errorResponse, HttpError } from '@/lib/gradingServer/auth';
import { appendAudit, readAudit } from '@/lib/gradingServer/service';

export const dynamic = 'force-dynamic';

async function json(req: Request) {
  try { return await req.json(); } catch { throw new HttpError(400, 'Body không phải JSON hợp lệ'); }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await authenticate(req);
    const b = await json(req);
    // Deliberately ignores any schoolId/reviewerId/role sent by the client.
    const entry = await appendAudit(ctx, b);
    return Response.json({ success: true, entry });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await authenticate(req);
    const sp = new URL(req.url).searchParams;
    const out = await readAudit(ctx, {
      classId: sp.get('classId') ?? '',
      assessmentId: sp.get('assessmentId') ?? undefined,
      studentCode: sp.get('studentCode') ?? undefined
    });
    return Response.json({ success: true, chain: out.verdict, entries: out.entries });
  } catch (e) {
    return errorResponse(e);
  }
}
