// ============================================================================
// EDUVIET AI GRADING — RECONCILIATION & AUDIT DISCREPANCY SCANNER (R3)
// Quét rà soát toàn bộ điểm số có thể đã được tạo từ bản OMR lỗi
// Xuất danh sách đối soát chi tiết cho Giáo viên (KHÔNG TỰ Ý SỬA ĐIỂM CHÍNH THỨC)
// ============================================================================

import fs from 'fs';
import path from 'path';

export interface SuspectScoreEntry {
  schoolId: string;
  className: string;
  subject: string;
  studentCode: string;
  studentName: string;
  assessmentId: string;
  score: number;
  auditHash: string;
  suspectReason: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  recommendation: string;
}

export function runReconciliationScan(): {
  suspectCount: number;
  totalScanned: number;
  suspectEntries: SuspectScoreEntry[];
  markdownReport: string;
  csvContent: string;
} {
  const suspectEntries: SuspectScoreEntry[] = [];
  let totalScanned = 0;

  // 1. Quét sổ cái kiểm toán nếu tồn tại trên máy chủ
  const ledgerPath = path.join(process.cwd(), '.system_logs', 'grading_audit_ledger.jsonl');
  const auditEntries: any[] = [];
  if (fs.existsSync(ledgerPath)) {
    const raw = fs.readFileSync(ledgerPath, 'utf8');
    raw.split('\n').forEach(line => {
      if (line.trim()) {
        try { auditEntries.push(JSON.parse(line.trim())); } catch {}
      }
    });
  }

  // 2. Mẫu nhận diện các bài thi được chấm từ logic cũ (R2 / R1)
  // Các bài thi có hash kiểm toán chứa chuỗi thử nghiệm hoặc không có chữ ký số HMAC
  auditEntries.forEach(entry => {
    totalScanned++;
    const isMockScore = entry.action === 'AUDIT_PROD_VERIFY' || entry.submissionId?.includes('PROD_VERIFY');
    const isMissingSignature = !entry.signature || entry.signature.length !== 64;
    const isOddEvenPattern = entry.reason?.includes('đối soát phiếu OMR') && !entry.signature;

    if (isMockScore) {
      suspectEntries.push({
        schoolId: entry.schoolId || 'THPT_DEFAULT',
        className: entry.classId || '10A1',
        subject: entry.subjectId || 'TOAN',
        studentCode: entry.studentCode || 'HS_VERIFY',
        studentName: 'Bản ghi kiểm thử nghiệm thu Production',
        assessmentId: entry.assessmentId || 'ASM_DEFAULT',
        score: entry.reviewedScore || 0,
        auditHash: entry.entryHash,
        suspectReason: 'Bản ghi tạo từ lệnh kiểm thử live smoke test trên Production',
        severity: 'INFO',
        recommendation: 'Lưu trữ nhật ký kiểm tra hệ thống, không tính vào điểm tổng kết học sinh.'
      });
    } else if (isMissingSignature || isOddEvenPattern) {
      suspectEntries.push({
        schoolId: entry.schoolId || 'THPT_DEFAULT',
        className: entry.classId || '10A1',
        subject: entry.subjectId || 'TOAN',
        studentCode: entry.studentCode || 'HS-UNKNOWN',
        studentName: `Học sinh ${entry.studentCode}`,
        assessmentId: entry.assessmentId || 'ASM_LEGACY',
        score: entry.reviewedScore || 0,
        auditHash: entry.entryHash,
        suspectReason: 'Bài chấm từ phiên bản OMR cũ (thiếu chữ ký HMAC máy chủ R3)',
        severity: 'WARNING',
        recommendation: 'Giáo viên đối chiếu lại bài thi giấy gốc trước khi công bố bảng điểm.'
      });
    }
  });

  // 3. Tạo báo cáo Markdown
  let markdownReport = `# BÁO CÁO ĐỐI SOÁT ĐIỂM THI EDUVIET AI GRADING (ĐỢT R3)
**Thời gian rà soát:** ${new Date().toISOString()}  
**Tổng số bản ghi kiểm tra:** ${totalScanned}  
**Số bản ghi cần lưu ý đối soát:** ${suspectEntries.length}  

> [!IMPORTANT]
> **NGUYÊN TẮC BẢO VỆ DỮ LIỆU CHÍNH THỨC:**  
> Hệ thống **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG SỬA HOẶC XÓA** bất kỳ điểm số nào của học sinh.  
> Báo cáo này được xuất để giáo viên đối chiếu với phiếu bài thi giấy gốc nhằm đảm bảo tính công bằng và chính xác.

## BẢNG DANH SÁCH BẢN GHI CẦN ĐỐI SOÁT

| Lớp | Mã HS | Bài thi | Điểm số | Mức độ | Lý do đối soát | Khuyến nghị xử lý |
|:---|:---|:---|:---:|:---:|:---|:---|
`;

  if (suspectEntries.length === 0) {
    markdownReport += `\n*Không phát hiện bản ghi điểm số nào vi phạm tính toàn vẹn hoặc nghi ngờ từ thuật toán OMR lỗi.*\n`;
  } else {
    suspectEntries.forEach(s => {
      markdownReport += `| ${s.className} | ${s.studentCode} | ${s.assessmentId} | ${s.score.toFixed(1)} | **${s.severity}** | ${s.suspectReason} | ${s.recommendation} |\n`;
    });
  }

  markdownReport += `\n---\n*Báo cáo được lập tự động bởi Công cụ Đối soát An toàn EduViet R3.*`;

  // 4. Tạo CSV Content
  let csvContent = 'SchoolId,Class,Subject,StudentCode,StudentName,AssessmentId,Score,AuditHash,Severity,SuspectReason,Recommendation\n';
  suspectEntries.forEach(s => {
    csvContent += `"${s.schoolId}","${s.className}","${s.subject}","${s.studentCode}","${s.studentName}","${s.assessmentId}",${s.score},"${s.auditHash}","${s.severity}","${s.suspectReason}","${s.recommendation}"\n`;
  });

  return {
    suspectCount: suspectEntries.length,
    totalScanned,
    suspectEntries,
    markdownReport,
    csvContent
  };
}

// Chạy trực tiếp nếu gọi từ CLI
if (require.main === module) {
  const result = runReconciliationScan();
  console.log(`Đã rà soát ${result.totalScanned} bản ghi. Phát hiện ${result.suspectCount} bản ghi cần đối soát.`);
  const outDir = path.join(process.cwd(), '..', '..', '..', '.local', 'state', 'huy-ai-hub', 'handoffs', 'EDUVIET_AI_GRADING_20261031', '13_independent_crosscheck_R3_20261031');
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, 'RECONCILIATION_AUDIT_REPORT.md'), result.markdownReport, 'utf8');
    fs.writeFileSync(path.join(outDir, 'RECONCILIATION_EXPORT.csv'), result.csvContent, 'utf8');
    console.log('Đã xuất báo cáo ra thư mục 13_independent_crosscheck_R3_20261031 thành công.');
  }
}
