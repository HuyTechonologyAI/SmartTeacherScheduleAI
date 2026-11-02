// R4: server-authoritative, transactional score commit. Verification failure => NOTHING is written.
import { NextRequest } from 'next/server';
import { authenticate, errorResponse, HttpError } from '@/lib/gradingServer/auth';
import { commitScores } from '@/lib/gradingServer/service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ctx = await authenticate(req);
    let b: any;
    try { b = await req.json(); } catch { throw new HttpError(400, 'Body không phải JSON hợp lệ'); }
    const rows = await commitScores(ctx, b);
    return Response.json({ success: true, writtenCount: rows.length, rows });
  } catch (e) {
    return errorResponse(e);
  }
}
