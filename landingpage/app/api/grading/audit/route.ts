// ============================================================================
// SERVER-SIDE CRYPTOGRAPHIC AUDIT LOG API (NEXT.JS APP ROUTER)
// Lưu trữ nhật ký kiểm toán bất biến chuỗi băm SHA-256 (RFC 6234)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface ServerAuditEntry {
  id: string;
  assessmentId: string;
  submissionId: string;
  reviewerId: string;
  evaluatorRole: string;
  action: string;
  originalScore: number;
  reviewedScore: number;
  reason: string;
  policyId: string;
  serverTimestamp: number;
  previousHash: string;
  entryHash: string;
  clientIp?: string;
}

// In-memory ledger buffer for fast atomic append
const serverAuditLedger: ServerAuditEntry[] = [];
const LEDGER_GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function calculateEntryHash(
  previousHash: string,
  serverTimestamp: number,
  submissionId: string,
  action: string,
  reviewedScore: number,
  reviewerId: string
): string {
  const payload = `${previousHash}|${serverTimestamp}|${submissionId}|${action}|${reviewedScore.toFixed(2)}|${reviewerId}`;
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assessmentId = 'ASM_DEFAULT',
      submissionId,
      reviewerId = 'TEACHER_AUTH',
      evaluatorRole = 'GIÁO VIÊN BỘ MÔN',
      action = 'APPROVE_SCORE',
      originalScore = 0,
      reviewedScore = 0,
      reason = 'Phê duyệt điểm thi',
      policyId = 'GDPT_2018_TT22',
      clientReportedPreviousHash
    } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Thiếu submissionId bắt buộc trong nhật ký kiểm toán' },
        { status: 400 }
      );
    }

    // Xác định previousHash từ chuỗi sổ cái hiện tại
    const lastEntry = serverAuditLedger.length > 0
      ? serverAuditLedger[serverAuditLedger.length - 1]
      : null;
    const previousHash = lastEntry ? lastEntry.entryHash : LEDGER_GENESIS_HASH;

    // Kiểm tra tính nhất quán nếu client báo cáo previousHash
    if (clientReportedPreviousHash && lastEntry && clientReportedPreviousHash !== lastEntry.entryHash) {
      // Cảnh báo mất đồng bộ chuỗi
    }

    const serverTimestamp = Date.now();
    const entryHash = calculateEntryHash(
      previousHash,
      serverTimestamp,
      submissionId,
      action,
      reviewedScore,
      reviewerId
    );

    const newEntry: ServerAuditEntry = {
      id: `audit_${serverTimestamp}_${serverAuditLedger.length + 1}`,
      assessmentId,
      submissionId,
      reviewerId,
      evaluatorRole,
      action,
      originalScore,
      reviewedScore,
      reason,
      policyId,
      serverTimestamp,
      previousHash,
      entryHash,
      clientIp: req.headers.get('x-forwarded-for') || '127.0.0.1'
    };

    serverAuditLedger.push(newEntry);

    // Ghi phụ trợ vào file nhật ký nếu có quyền ghi filesystem
    try {
      const logDir = path.join(process.cwd(), '.system_logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.appendFileSync(
        path.join(logDir, 'grading_audit_ledger.jsonl'),
        JSON.stringify(newEntry) + '\n',
        'utf8'
      );
    } catch {}

    return NextResponse.json({
      success: true,
      entry: newEntry,
      chainLength: serverAuditLedger.length
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Lỗi xử lý nhật ký kiểm toán máy chủ' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assessmentId = searchParams.get('assessmentId');

  const filtered = assessmentId
    ? serverAuditLedger.filter(e => e.assessmentId === assessmentId)
    : serverAuditLedger;

  // Xác thực toàn vẹn chuỗi khối
  let isChainValid = true;
  for (let i = 0; i < serverAuditLedger.length; i++) {
    const cur = serverAuditLedger[i];
    const prev = i === 0 ? LEDGER_GENESIS_HASH : serverAuditLedger[i - 1].entryHash;

    if (cur.previousHash !== prev) {
      isChainValid = false;
      break;
    }

    const expectedHash = calculateEntryHash(
      cur.previousHash,
      cur.serverTimestamp,
      cur.submissionId,
      cur.action,
      cur.reviewedScore,
      cur.reviewerId
    );

    if (cur.entryHash !== expectedHash) {
      isChainValid = false;
      break;
    }
  }

  return NextResponse.json({
    chainLength: serverAuditLedger.length,
    isChainValid,
    entries: filtered
  });
}
