// ============================================================================
// SERVER-SIDE GRADEBOOK SYNC VERIFICATION API (NEXT.JS APP ROUTER)
// Đối soát và xác thực tính hợp lệ của điểm số trước khi đồng bộ vào sổ điểm
// Yêu cầu: Khóa duy nhất (studentCode + classId + subjectId + assessmentId)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SyncRecordItem {
  studentCode: string;
  fullName?: string;
  score: number;
  auditHash: string;
  examCode?: string;
}

interface VerifySyncPayload {
  schoolId?: string;
  classId: string;
  subjectId: string;
  assessmentId: string;
  records: SyncRecordItem[];
}

function getLedgerFilePath(): string {
  if (process.env.AUDIT_STORAGE_PATH) {
    return process.env.AUDIT_STORAGE_PATH;
  }
  const standardPath = path.join(process.cwd(), '.system_logs', 'grading_audit_ledger.jsonl');
  if (fs.existsSync(standardPath)) return standardPath;
  const tmpPath = path.join('/tmp', '.system_logs', 'grading_audit_ledger.jsonl');
  return tmpPath;
}

export async function POST(req: NextRequest) {
  try {
    const body: VerifySyncPayload = await req.json();
    const { schoolId = 'THPT_DEFAULT', classId, subjectId, assessmentId, records } = body;

    if (!classId || !assessmentId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Dữ liệu đối soát không đầy đủ: yêu cầu classId, assessmentId và mảng records' },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'Danh sách bản ghi điểm đối soát rỗng' },
        { status: 400 }
      );
    }

    // Đọc sổ cái kiểm toán máy chủ
    const filePath = getLedgerFilePath();
    const auditMap = new Map<string, { score: number; studentCode: string; hash: string }>();

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const entry = JSON.parse(line.trim());
          if (entry.assessmentId === assessmentId) {
            // Lưu bản ghi kiểm toán mới nhất theo khóa duy nhất
            const key = `${entry.classId || classId}#${entry.studentCode}#${entry.assessmentId}`;
            auditMap.set(key, {
              score: entry.reviewedScore,
              studentCode: entry.studentCode,
              hash: entry.entryHash
            });
          }
        } catch {}
      }
    }

    const unverifiedList: { studentCode: string; reason: string }[] = [];
    const verifiedKeys: string[] = [];

    for (const rec of records) {
      // Khóa duy nhất (Composite unique key)
      const compositeKey = `${classId}#${rec.studentCode}#${assessmentId}`;
      const auditRec = auditMap.get(compositeKey);

      // Nếu có audit hash và có lưu trong hệ thống kiểm toán
      if (rec.auditHash && rec.auditHash !== 'NO_AUDIT') {
        if (auditRec) {
          if (Math.abs(auditRec.score - rec.score) > 0.001) {
            unverifiedList.push({
              studentCode: rec.studentCode,
              reason: `Điểm đồng bộ (${rec.score}) không khớp với điểm đã ký duyệt trong nhật ký kiểm toán (${auditRec.score})`
            });
            continue;
          }
        }
      }

      // Xác thực khoảng điểm hợp lệ
      if (typeof rec.score !== 'number' || rec.score < 0 || rec.score > 10.0) {
        unverifiedList.push({
          studentCode: rec.studentCode,
          reason: `Điểm số [${rec.score}] không hợp lệ (ngoài thang điểm 0 - 10)`
        });
        continue;
      }

      verifiedKeys.push(compositeKey);
    }

    if (unverifiedList.length > 0) {
      return NextResponse.json({
        verified: false,
        error: `Phát hiện ${unverifiedList.length} bản ghi điểm không hợp lệ hoặc thiếu kiểm toán xác thực`,
        unverifiedList
      }, { status: 422 });
    }

    return NextResponse.json({
      verified: true,
      classId,
      assessmentId,
      verifiedCount: verifiedKeys.length,
      timestamp: Date.now(),
      serverVerified: true
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Lỗi hệ thống đối soát điểm số' },
      { status: 500 }
    );
  }
}
