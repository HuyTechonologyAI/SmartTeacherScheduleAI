// R4: authenticated DRY-RUN verification (no writes). Use /api/grading/commit-scores to persist.
import { NextRequest } from 'next/server';
import { authenticate, errorResponse, HttpError } from '@/lib/gradingServer/auth';
import { verifyScores } from '@/lib/gradingServer/service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ctx = await authenticate(req);
    let b: any;
    try { b = await req.json(); } catch { throw new HttpError(400, 'Body không phải JSON hợp lệ'); }
    const v = await verifyScores(ctx, b);
    return Response.json({ success: v.allOk, verified: v.allOk, verdicts: v.verdicts }, { status: v.allOk ? 200 : 422 });
  } catch (e) {
    return errorResponse(e);
  }
}
