// R4: teacher-approved answer keys from the DB (versioned, 4-eyes approval, immutable once approved).
import { NextRequest } from 'next/server';
import { authenticate, errorResponse, HttpError } from '@/lib/gradingServer/auth';
import { approveKey, getApprovedKey, revokeKey, saveDraftKey } from '@/lib/gradingServer/service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const ctx = await authenticate(req);
    const sp = new URL(req.url).searchParams;
    const k = await getApprovedKey(ctx, sp.get('classId') ?? '', sp.get('subjectId') ?? '', sp.get('examCode') ?? '');
    return Response.json({ success: true, key: k });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await authenticate(req);
    let b: any;
    try { b = await req.json(); } catch { throw new HttpError(400, 'Body không phải JSON hợp lệ'); }
    if (b.op === 'approve') return Response.json({ success: true, key: await approveKey(ctx, b.classId, b.subjectId, b.examCode) });
    if (b.op === 'revoke') { await revokeKey(ctx, b.classId, b.subjectId, b.examCode); return Response.json({ success: true }); }
    if (b.op === 'draft') return Response.json({ success: true, key: await saveDraftKey(ctx, b) });
    throw new HttpError(400, 'op phải là draft | approve | revoke');
  } catch (e) {
    return errorResponse(e);
  }
}
