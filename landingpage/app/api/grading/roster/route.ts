// R4: class roster (valid SBD/student codes) managed by HOD/SCHOOL_ADMIN only.
import { NextRequest } from 'next/server';
import { authenticate, errorResponse, HttpError } from '@/lib/gradingServer/auth';
import { upsertRoster } from '@/lib/gradingServer/service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ctx = await authenticate(req);
    let b: any;
    try { b = await req.json(); } catch { throw new HttpError(400, 'Body không phải JSON hợp lệ'); }
    const n = await upsertRoster(ctx, b.classId, b.studentCodes);
    return Response.json({ success: true, count: n });
  } catch (e) {
    return errorResponse(e);
  }
}
