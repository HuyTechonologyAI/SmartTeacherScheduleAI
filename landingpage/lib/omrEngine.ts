// ============================================================================
// EDUVIET AI GRADING - OPTICAL MARK RECOGNITION (OMR) ENGINE (REMEDIATION R3)
// Thuật toán nhận dạng quang học điểm ảnh thực tế (Pixel-Density OMR)
// Chuẩn phiếu thi Bộ Giáo Dục & Đào Tạo Việt Nam (GDPT 2025 / TT 22)
// Bản quyền: Huy Technology AI Hub (HAC-EDUVIET-R3-20261031)
// ============================================================================

export type SupportedFileFormat = 'PNG' | 'JPEG' | 'WEBP' | 'PDF' | 'UNKNOWN';

export interface FileValidationResult {
  valid: boolean;
  format: SupportedFileFormat;
  byteLength: number;
  mimeType: string;
  error?: string;
}

export interface PixelMatrix {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
  channels: 1 | 4; // 1 = Grayscale, 4 = RGBA
}

export interface SheetCornerMarkers {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
  isAligned: boolean;
  skewAngleDegrees: number;
}

export interface BubbleMeasurement {
  fillRatio: number;      // 0.0 -> 1.0 (Tỷ lệ pixel tối so với toàn bộ diện tích trong vòng)
  darkness: number;       // 0.0 -> 1.0 (Độ tối trung bình)
  meanLuminance: number;  // 0 -> 255 (Độ sáng trung bình)
  totalPixels: number;
  darkPixelCount: number;
}

export interface OmrQuestionScan {
  questionNumber: number;
  detectedOption: 'A' | 'B' | 'C' | 'D' | null;
  status: 'VALID' | 'MULTIPLE_MARKS' | 'BLANK' | 'UNCERTAIN';
  confidence: number;
  candidates: Record<'A' | 'B' | 'C' | 'D', number>;
  flagMessage?: string;
}

export interface OmrPart2SubItemScan {
  item: 'a' | 'b' | 'c' | 'd';
  detectedChoice: 'D' | 'S' | null; // D = Đúng, S = Sai
  status: 'VALID' | 'MULTIPLE_MARKS' | 'BLANK' | 'UNCERTAIN';
  confidence: number;
}

export interface OmrPart2QuestionScan {
  questionNumber: number;
  items: Record<'a' | 'b' | 'c' | 'd', OmrPart2SubItemScan>;
  status: 'VALID' | 'HAS_BLANK' | 'HAS_AMBIGUITY';
  correctCount?: number;
}

export interface OmrPart3QuestionScan {
  questionNumber: number;
  detectedText: string;
  status: 'VALID' | 'BLANK' | 'UNCERTAIN';
  confidence: number;
}

export interface OfficialAnswerKeyTemplate {
  examCode: string;
  subject: string;
  teacherApproved: boolean;
  approvedBy: string;
  approvedAt: number;
  part1Key: Record<number, 'A' | 'B' | 'C' | 'D'>;
  part2Key: Record<number, Record<'a' | 'b' | 'c' | 'd', boolean>>; // true = Đúng, false = Sai
  part3Key: Record<number, string>; // Giá trị đáp án dạng chuỗi số ('2.5', '-15', '0.05')
}

export interface OmrSheetScanResult {
  isReadable: boolean;
  format: SupportedFileFormat;
  detectedStudentCode: string;
  detectedExamCode: string;
  part1Scans: OmrQuestionScan[];
  part2Scans: OmrPart2QuestionScan[];
  part3Scans: OmrPart3QuestionScan[];
  overallConfidence: number;
  flags: string[];
  processedAt: number;
  checksum: string;
  cornerMarkers?: SheetCornerMarkers;
}

export interface ExamGradingResult {
  studentCode: string;
  examCode: string;
  part1Score: number;     // Tối đa 40 x 0.25 = 10.0đ (nếu đề chỉ có P1) hoặc 4.0đ
  part2Score: number;     // Biểu điểm lũy tiến THPT 2025: 1 ý = 0.1đ, 2 ý = 0.25đ, 3 ý = 0.5đ, 4 ý = 1.0đ
  part3Score: number;     // 6 câu trả lời ngắn
  totalRawScore: number;
  totalScoreScaled: number; // Thang điểm 10 làm tròn 2 chữ số thập phân theo TT22
  mcqCorrectCount: number;
  mcqTotal: number;
  part2CorrectCounts: number[]; // Số ý đúng cho 8 câu phần II
  part3CorrectCount: number;
  flags: string[];
  passedPolicy: boolean;
}

// ----------------------------------------------------------------------------
// 1. KIỂM TRA MAGIC BYTES TỆP NHỊ PHÂN
// ----------------------------------------------------------------------------

export function validateFileMagicBytes(
  buffer: Uint8Array | ArrayBuffer,
  declaredMime: string = ''
): FileValidationResult {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const len = bytes.length;

  if (len < 8) {
    return {
      valid: false,
      format: 'UNKNOWN',
      byteLength: len,
      mimeType: declaredMime,
      error: 'Tệp rỗng hoặc kích thước quá nhỏ (< 8 bytes) để xác định định dạng'
    };
  }

  // 1. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
  ) {
    return { valid: true, format: 'PNG', byteLength: len, mimeType: 'image/png' };
  }

  // 2. JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { valid: true, format: 'JPEG', byteLength: len, mimeType: 'image/jpeg' };
  }

  // 3. WebP: 52 49 46 46 (RIFF) .... 57 45 42 50 (WEBP)
  if (
    len >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { valid: true, format: 'WEBP', byteLength: len, mimeType: 'image/webp' };
  }

  // 4. PDF: 25 50 44 46 (%PDF)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { valid: true, format: 'PDF', byteLength: len, mimeType: 'application/pdf' };
  }

  return {
    valid: false,
    format: 'UNKNOWN',
    byteLength: len,
    mimeType: declaredMime,
    error: 'Định dạng tệp không hợp lệ hoặc cấu trúc nhị phân bị hỏng (Không khớp chữ ký magic bytes chuẩn)'
  };
}

// ----------------------------------------------------------------------------
// 2. TIỀN XỬ LÝ MA TRẬN ĐIỂM ẢNH (PIXEL MATRIX PREPROCESSING)
// ----------------------------------------------------------------------------

export function getPixelLuminance(matrix: PixelMatrix, x: number, y: number): number {
  const px = Math.max(0, Math.min(matrix.width - 1, Math.floor(x)));
  const py = Math.max(0, Math.min(matrix.height - 1, Math.floor(y)));

  if (matrix.channels === 1) {
    return matrix.data[py * matrix.width + px];
  }

  const idx = (py * matrix.width + px) * 4;
  const r = matrix.data[idx];
  const g = matrix.data[idx + 1];
  const b = matrix.data[idx + 2];
  // Công thức chuẩn nhận thức độ sáng ITU-R BT.601
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function sampleLocalBackground(
  matrix: PixelMatrix,
  cx: number,
  cy: number,
  radius: number
): number {
  let sum = 0;
  let count = 0;
  const samples = [
    { x: cx - radius, y: cy - radius },
    { x: cx + radius, y: cy - radius },
    { x: cx - radius, y: cy + radius },
    { x: cx + radius, y: cy + radius },
    { x: cx, y: cy - radius },
    { x: cx, y: cy + radius },
    { x: cx - radius, y: cy },
    { x: cx + radius, y: cy }
  ];

  for (const s of samples) {
    if (s.x >= 0 && s.x < matrix.width && s.y >= 0 && s.y < matrix.height) {
      sum += getPixelLuminance(matrix, s.x, s.y);
      count++;
    }
  }

  return count > 0 ? sum / count : 250;
}

// ----------------------------------------------------------------------------
// 3. NHẬN DIỆN ĐIỂM CHUẨN GÓC PHIẾU THI (FIDUCIAL CORNER DETECTION & ALIGNMENT)
// ----------------------------------------------------------------------------

export function detectCornerMarkers(matrix: PixelMatrix): SheetCornerMarkers {
  const w = matrix.width;
  const h = matrix.height;

  // Vùng biên tìm kiếm 4 dấu chuẩn đen góc phiếu thi (khoảng 10% kích thước)
  const marginX = Math.floor(w * 0.12);
  const marginY = Math.floor(h * 0.12);

  function findDarkCenter(startX: number, endX: number, startY: number, endY: number) {
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (let y = startY; y < endY; y += 2) {
      for (let x = startX; x < endX; x += 2) {
        const lum = getPixelLuminance(matrix, x, y);
        if (lum < 90) {
          sumX += x;
          sumY += y;
          count++;
        }
      }
    }

    if (count > 0) {
      return { x: Math.round(sumX / count), y: Math.round(sumY / count), count };
    }
    return { x: Math.floor((startX + endX) / 2), y: Math.floor((startY + endY) / 2), count: 0 };
  }

  const tl = findDarkCenter(0, marginX, 0, marginY);
  const tr = findDarkCenter(w - marginX, w, 0, marginY);
  const bl = findDarkCenter(0, marginX, h - marginY, h);
  const br = findDarkCenter(w - marginX, w, h - marginY, h);

  // Tính góc nghiêng (skew angle) dựa trên cạnh trên
  const dx = tr.x - tl.x;
  const dy = tr.y - tl.y;
  const angleRad = Math.atan2(dy, dx);
  const skewAngleDegrees = Math.round((angleRad * 180 / Math.PI) * 100) / 100;

  const isAligned = Math.abs(skewAngleDegrees) <= 12.0 && tl.count > 0 && tr.count > 0;

  return {
    topLeft: { x: tl.x, y: tl.y },
    topRight: { x: tr.x, y: tr.y },
    bottomLeft: { x: bl.x, y: bl.y },
    bottomRight: { x: br.x, y: br.y },
    isAligned,
    skewAngleDegrees
  };
}

export function transformNormalizedCoordinate(
  u: number,
  v: number,
  markers: SheetCornerMarkers
): { x: number; y: number } {
  // Tọa độ danh định của 4 dấu chuẩn góc (Nominal Fiducial Positions)
  const nomU1 = 0.0417; // 50 / 1200
  const nomU2 = 0.9583; // 1150 / 1200
  const nomV1 = 0.0294; // 50 / 1700
  const nomV2 = 0.9706; // 1650 / 1700

  // Chuẩn hóa tọa độ (u, v) vào khoảng [0, 1] giữa 4 điểm chuẩn
  const nu = (u - nomU1) / (nomU2 - nomU1);
  const nv = (v - nomV1) / (nomV2 - nomV1);

  // Phép nội suy song tuyến (Bilinear coordinate transform)
  const topX = (1 - nu) * markers.topLeft.x + nu * markers.topRight.x;
  const topY = (1 - nu) * markers.topLeft.y + nu * markers.topRight.y;

  const botX = (1 - nu) * markers.bottomLeft.x + nu * markers.bottomRight.x;
  const botY = (1 - nu) * markers.bottomLeft.y + nu * markers.bottomRight.y;

  const x = (1 - nv) * topX + nv * botX;
  const y = (1 - nv) * topY + nv * botY;

  return { x, y };
}

// ----------------------------------------------------------------------------
// 4. ĐO MẬT ĐỘ QUANG HỌC Ô TÔ CHÌ (BUBBLE OPTICAL DENSITY MEASUREMENT)
// ----------------------------------------------------------------------------

export function measureBubbleOpticalDensity(
  matrix: PixelMatrix,
  centerU: number,
  centerV: number,
  radiusU: number,
  markers?: SheetCornerMarkers
): BubbleMeasurement {
  const pt = markers && markers.isAligned
    ? transformNormalizedCoordinate(centerU, centerV, markers)
    : { x: centerU * matrix.width, y: centerV * matrix.height };

  const rPixels = Math.max(3, Math.round(radiusU * matrix.width));
  // Bỏ qua 20% vòng ngoài để không tính đường in viền ô tròn
  const innerR = Math.max(2, Math.round(rPixels * 0.80));

  let totalLuminance = 0;
  let darkPixelCount = 0;
  let totalPixels = 0;

  const bgLum = sampleLocalBackground(matrix, pt.x, pt.y, rPixels * 2.2);
  // Ngưỡng tối thích nghi cục bộ (Adaptive Threshold)
  const adaptiveThreshold = Math.max(40, Math.min(210, bgLum * 0.72));

  for (let dy = -innerR; dy <= innerR; dy++) {
    for (let dx = -innerR; dx <= innerR; dx++) {
      if (dx * dx + dy * dy <= innerR * innerR) {
        const px = Math.floor(pt.x + dx);
        const py = Math.floor(pt.y + dy);
        if (px >= 0 && px < matrix.width && py >= 0 && py < matrix.height) {
          const lum = getPixelLuminance(matrix, px, py);
          totalLuminance += lum;
          if (lum < adaptiveThreshold) {
            darkPixelCount++;
          }
          totalPixels++;
        }
      }
    }
  }

  const meanLum = totalPixels > 0 ? totalLuminance / totalPixels : 255;
  const fillRatio = totalPixels > 0 ? darkPixelCount / totalPixels : 0;
  const darkness = Math.max(0, Math.min(1, 1 - (meanLum / 255)));

  return {
    fillRatio: Math.round(fillRatio * 1000) / 1000,
    darkness: Math.round(darkness * 1000) / 1000,
    meanLuminance: Math.round(meanLum * 10) / 10,
    totalPixels,
    darkPixelCount
  };
}

// ----------------------------------------------------------------------------
// 5. THUẬT TOÁN ĐÁNH GIÁ PHẦN I (40 CÂU TRẮC NGHIỆM KHÁCH QUAN)
// ----------------------------------------------------------------------------

export function evaluateMcqQuestionRow(
  measurements: Record<'A' | 'B' | 'C' | 'D', BubbleMeasurement>,
  questionNumber: number
): OmrQuestionScan {
  const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const candidates: Record<'A' | 'B' | 'C' | 'D', number> = {
    A: Math.max(measurements.A.fillRatio, measurements.A.darkness),
    B: Math.max(measurements.B.fillRatio, measurements.B.darkness),
    C: Math.max(measurements.C.fillRatio, measurements.C.darkness),
    D: Math.max(measurements.D.fillRatio, measurements.D.darkness)
  };

  const sorted = [...options].sort((a, b) => candidates[b] - candidates[a]);
  const [topOpt, secondOpt] = sorted;
  const topFill = candidates[topOpt];
  const secondFill = candidates[secondOpt];

  const BLANK_THRESH = 0.18;
  const FILLED_THRESH = 0.40;
  const MULTI_THRESH = 0.35;
  const MARGIN_THRESH = 0.12;

  // 1. Để trống
  if (topFill < BLANK_THRESH) {
    return {
      questionNumber,
      detectedOption: null,
      status: 'BLANK',
      confidence: Math.round((1.0 - topFill) * 100) / 100,
      candidates,
      flagMessage: `Câu ${questionNumber}: Thí sinh để trống (chưa tô đáp án)`
    };
  }

  // 2. Tô đè nhiều phương án
  if (topFill >= MULTI_THRESH && secondFill >= MULTI_THRESH && (topFill - secondFill) < MARGIN_THRESH) {
    return {
      questionNumber,
      detectedOption: null,
      status: 'MULTIPLE_MARKS',
      confidence: 0.30,
      candidates,
      flagMessage: `Câu ${questionNumber}: Phát hiện tô đè nhiều phương án (${topOpt} và ${secondOpt})`
    };
  }

  // 3. Nét chì quá mờ hoặc nghi ngờ
  if (topFill >= BLANK_THRESH && topFill < FILLED_THRESH) {
    return {
      questionNumber,
      detectedOption: topOpt,
      status: 'UNCERTAIN',
      confidence: 0.50,
      candidates,
      flagMessage: `Câu ${questionNumber}: Nét chì mờ (${topOpt}), cần giám khảo xác thực`
    };
  }

  // 4. Hợp lệ
  const margin = topFill - secondFill;
  const confidence = Math.min(0.99, Math.round((0.75 + margin * 0.25) * 100) / 100);
  return {
    questionNumber,
    detectedOption: topOpt,
    status: 'VALID',
    confidence,
    candidates
  };
}

// ----------------------------------------------------------------------------
// 6. THUẬT TOÁN ĐỌC MÃ SBD (6 CHỮ SỐ) VÀ MÃ ĐỀ (3 CHỮ SỐ)
// ----------------------------------------------------------------------------

export function decodeNumericBubbleGrid(
  matrix: PixelMatrix,
  startU: number,
  startV: number,
  colPitchU: number,
  rowPitchV: number,
  numCols: number,
  radiusU: number,
  markers?: SheetCornerMarkers
): { code: string; confidence: number; complete: boolean; details: number[][] } {
  const digits: string[] = [];
  const details: number[][] = [];
  let totalConfidence = 0;
  let complete = true;

  for (let c = 0; c < numCols; c++) {
    const colU = startU + c * colPitchU;
    const colMeasurements: number[] = [];
    let maxIdx = -1;
    let maxFill = -1;
    let secondFill = -1;

    for (let r = 0; r < 10; r++) {
      const rowV = startV + r * rowPitchV;
      const m = measureBubbleOpticalDensity(matrix, colU, rowV, radiusU, markers);
      colMeasurements.push(m.fillRatio);

      if (m.fillRatio > maxFill) {
        secondFill = maxFill;
        maxFill = m.fillRatio;
        maxIdx = r;
      } else if (m.fillRatio > secondFill) {
        secondFill = m.fillRatio;
      }
    }

    details.push(colMeasurements);

    if (maxFill >= 0.38 && (maxFill - secondFill) >= 0.12) {
      digits.push(maxIdx.toString());
      totalConfidence += Math.min(1.0, 0.70 + (maxFill - secondFill) * 0.30);
    } else {
      digits.push('?');
      complete = false;
    }
  }

  const avgConfidence = numCols > 0 ? Math.round((totalConfidence / numCols) * 100) / 100 : 0;
  return {
    code: digits.join(''),
    confidence: avgConfidence,
    complete,
    details
  };
}

// ----------------------------------------------------------------------------
// 7. QUÉT TOÀN BỘ PHIẾU BÀI THI TỪ MA TRẬN ĐIỂM ẢNH THỰC TẾ
// ----------------------------------------------------------------------------

export function scanExamSheetPixelMatrix(
  matrix: PixelMatrix,
  format: SupportedFileFormat = 'PNG'
): OmrSheetScanResult {
  const cornerMarkers = detectCornerMarkers(matrix);
  const flags: string[] = [];

  if (!cornerMarkers.isAligned) {
    flags.push(`CẢNH BÁO: Phiếu thi bị lệch góc (${cornerMarkers.skewAngleDegrees}°). Đã kích hoạt căn chỉnh phối cảnh tự động.`);
  }

  // 1. Nhận dạng Mã SBD (6 chữ số)
  const sbdResult = decodeNumericBubbleGrid(
    matrix,
    0.52, 0.10, 0.038, 0.024, 6, 0.010, cornerMarkers
  );
  const detectedStudentCode = sbdResult.complete ? `HS-${sbdResult.code}` : `HS-UNKNOWN`;
  if (!sbdResult.complete) {
    flags.push(`Không nhận diện được đầy đủ Số báo danh (đọc được: ${sbdResult.code})`);
  }

  // 2. Nhận dạng Mã đề thi (3 chữ số)
  const examResult = decodeNumericBubbleGrid(
    matrix,
    0.80, 0.10, 0.038, 0.024, 3, 0.010, cornerMarkers
  );
  const detectedExamCode = examResult.complete ? examResult.code : 'UNKNOWN';
  if (!examResult.complete) {
    flags.push(`Không nhận diện được đầy đủ Mã đề thi (đọc được: ${examResult.code})`);
  }

  // 3. Quét Phần I: 40 câu trắc nghiệm 4 lựa chọn (A, B, C, D)
  const part1Scans: OmrQuestionScan[] = [];
  const radiusU = 0.010;

  for (let q = 1; q <= 40; q++) {
    const isCol1 = q <= 20;
    const row = isCol1 ? q - 1 : q - 21;
    const v = 0.40 + row * 0.025;
    const baseU = isCol1 ? 0.08 : 0.28;
    const optPitch = 0.040;

    const measA = measureBubbleOpticalDensity(matrix, baseU, v, radiusU, cornerMarkers);
    const measB = measureBubbleOpticalDensity(matrix, baseU + optPitch, v, radiusU, cornerMarkers);
    const measC = measureBubbleOpticalDensity(matrix, baseU + optPitch * 2, v, radiusU, cornerMarkers);
    const measD = measureBubbleOpticalDensity(matrix, baseU + optPitch * 3, v, radiusU, cornerMarkers);

    const scan = evaluateMcqQuestionRow({ A: measA, B: measB, C: measC, D: measD }, q);
    part1Scans.push(scan);

    if (scan.status === 'MULTIPLE_MARKS' || scan.status === 'UNCERTAIN') {
      flags.push(scan.flagMessage || `Câu ${q}: Cần xác thực quang học`);
    }
  }

  // 4. Quét Phần II: 8 câu Đúng / Sai (mỗi câu 4 ý a, b, c, d)
  const part2Scans: OmrPart2QuestionScan[] = [];
  const subOptions: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];

  for (let q = 1; q <= 8; q++) {
    const itemsRecord: Partial<Record<'a' | 'b' | 'c' | 'd', OmrPart2SubItemScan>> = {};
    let hasBlank = false;
    let hasAmbiguity = false;

    for (let sIdx = 0; sIdx < 4; sIdx++) {
      const subItem = subOptions[sIdx];
      const itemRow = (q - 1) * 4 + sIdx;
      const v = 0.40 + itemRow * 0.015;
      const uTrue = 0.52;
      const uFalse = 0.56;

      const measD = measureBubbleOpticalDensity(matrix, uTrue, v, radiusU, cornerMarkers);
      const measS = measureBubbleOpticalDensity(matrix, uFalse, v, radiusU, cornerMarkers);

      let detectedChoice: 'D' | 'S' | null = null;
      let status: 'VALID' | 'MULTIPLE_MARKS' | 'BLANK' | 'UNCERTAIN' = 'VALID';
      let confidence = 0.95;

      if (measD.fillRatio < 0.18 && measS.fillRatio < 0.18) {
        status = 'BLANK';
        hasBlank = true;
        confidence = 0.5;
      } else if (measD.fillRatio >= 0.35 && measS.fillRatio >= 0.35 && Math.abs(measD.fillRatio - measS.fillRatio) < 0.12) {
        status = 'MULTIPLE_MARKS';
        hasAmbiguity = true;
        confidence = 0.3;
      } else if (measD.fillRatio > measS.fillRatio) {
        detectedChoice = 'D';
        confidence = Math.min(0.99, 0.70 + (measD.fillRatio - measS.fillRatio) * 0.3);
      } else {
        detectedChoice = 'S';
        confidence = Math.min(0.99, 0.70 + (measS.fillRatio - measD.fillRatio) * 0.3);
      }

      itemsRecord[subItem] = {
        item: subItem,
        detectedChoice,
        status,
        confidence
      };
    }

    part2Scans.push({
      questionNumber: q,
      items: itemsRecord as Record<'a' | 'b' | 'c' | 'd', OmrPart2SubItemScan>,
      status: hasAmbiguity ? 'HAS_AMBIGUITY' : hasBlank ? 'HAS_BLANK' : 'VALID'
    });
  }

  // 5. Quét Phần III: 6 câu Trả lời ngắn
  const part3Scans: OmrPart3QuestionScan[] = [];
  for (let q = 1; q <= 6; q++) {
    const v = 0.72 + (q - 1) * 0.038;
    // Đọc ô dấu âm '-' và 4 chữ số
    const measMinus = measureBubbleOpticalDensity(matrix, 0.50, v, radiusU, cornerMarkers);
    const hasMinus = measMinus.fillRatio >= 0.40;

    const numScan = decodeNumericBubbleGrid(matrix, 0.54, v, 0.030, 0.015, 3, radiusU, cornerMarkers);
    const textVal = `${hasMinus ? '-' : ''}${numScan.code.replace(/\?/g, '')}`;

    part3Scans.push({
      questionNumber: q,
      detectedText: textVal,
      status: numScan.complete ? 'VALID' : textVal ? 'UNCERTAIN' : 'BLANK',
      confidence: numScan.confidence
    });
  }

  const validP1 = part1Scans.filter(s => s.status === 'VALID').length;
  const overallConfidence = Math.round((validP1 / 40) * 100) / 100;

  // Checksum toàn vẹn
  let hash = 0;
  for (let i = 0; i < Math.min(matrix.data.length, 2048); i += 4) {
    hash = ((hash << 5) - hash) + matrix.data[i];
    hash |= 0;
  }
  const checksum = `chk_omr_r3_${Math.abs(hash).toString(16)}_${matrix.width}x${matrix.height}`;

  return {
    isReadable: true,
    format,
    detectedStudentCode,
    detectedExamCode,
    part1Scans,
    part2Scans,
    part3Scans,
    overallConfidence,
    flags,
    processedAt: Date.now(),
    checksum,
    cornerMarkers
  };
}

// ----------------------------------------------------------------------------
// 8. ĐỐI SOÁT VÀ CHẤM ĐIỂM THEO ĐÁP ÁN CHUẨN ĐƯỢC GIÁO VIÊN PHÊ DUYỆT (GDPT 2025)
// ----------------------------------------------------------------------------

export function gradeExamSheet(
  scanResult: OmrSheetScanResult,
  approvedKey: OfficialAnswerKeyTemplate
): ExamGradingResult {
  // NGUYÊN TẮC FAIL-CLOSED: Bắt buộc có đáp án chuẩn đã được giáo viên ký duyệt
  if (!approvedKey) {
    throw new Error('FAIL-CLOSED: Thiếu bộ đáp án chuẩn được giáo viên phê duyệt. Không thể chấm bài!');
  }
  if (!approvedKey.teacherApproved) {
    throw new Error(`FAIL-CLOSED: Bộ đáp án cho mã đề ${approvedKey.examCode} chưa được phê duyệt bởi giáo viên.`);
  }
  if (scanResult.detectedExamCode !== 'UNKNOWN' && approvedKey.examCode !== scanResult.detectedExamCode) {
    throw new Error(`MÃ ĐỀ KHÔNG KHỚP: Phiếu thi nhận diện mã đề [${scanResult.detectedExamCode}] nhưng bộ đáp án được chọn là [${approvedKey.examCode}].`);
  }

  const flags: string[] = [...scanResult.flags];

  // 1. Chấm Phần I (Trắc nghiệm 4 lựa chọn)
  let mcqCorrectCount = 0;
  const mcqTotal = 40;

  scanResult.part1Scans.forEach(scan => {
    const expected = approvedKey.part1Key[scan.questionNumber];
    if (expected && scan.detectedOption === expected && scan.status === 'VALID') {
      mcqCorrectCount++;
    }
  });

  // Thang điểm Phần I: Mỗi câu 0.25đ nếu đề 40 câu
  const part1Score = Math.round((mcqCorrectCount * 0.25) * 100) / 100;

  // 2. Chấm Phần II (Đúng / Sai 4 ý theo biểu điểm lũy tiến Thông tư 22 & GDPT 2025)
  // Quy tắc: 1 ý đúng = 0.1đ; 2 ý đúng = 0.25đ; 3 ý đúng = 0.5đ; 4 ý đúng = 1.0đ
  const part2CorrectCounts: number[] = [];
  let part2Score = 0;

  scanResult.part2Scans.forEach(scan => {
    const expectedObj = approvedKey.part2Key[scan.questionNumber];
    let correctInQ = 0;

    if (expectedObj) {
      (['a', 'b', 'c', 'd'] as const).forEach(sub => {
        const itemScan = scan.items[sub];
        const expBool = expectedObj[sub];
        const isExpTrue = expBool === true;
        const studentChoiceTrue = itemScan.detectedChoice === 'D';

        if (itemScan.status === 'VALID' && itemScan.detectedChoice && (studentChoiceTrue === isExpTrue)) {
          correctInQ++;
        }
      });
    }

    part2CorrectCounts.push(correctInQ);

    // Biểu điểm lũy tiến chính thức của Bộ GD&ĐT
    if (correctInQ === 1) part2Score += 0.10;
    else if (correctInQ === 2) part2Score += 0.25;
    else if (correctInQ === 3) part2Score += 0.50;
    else if (correctInQ === 4) part2Score += 1.00;
  });

  part2Score = Math.round(part2Score * 100) / 100;

  // 3. Chấm Phần III (Trả lời ngắn)
  let part3CorrectCount = 0;
  scanResult.part3Scans.forEach(scan => {
    const expected = approvedKey.part3Key[scan.questionNumber];
    if (expected && scan.detectedText) {
      // Chuẩn hóa so sánh số học (ví dụ: '2.5' === '2,50' === '2.5')
      const normExp = expected.trim().replace(',', '.');
      const normDet = scan.detectedText.trim().replace(',', '.');

      const numExp = parseFloat(normExp);
      const numDet = parseFloat(normDet);

      if (!isNaN(numExp) && !isNaN(numDet) && Math.abs(numExp - numDet) < 0.001) {
        part3CorrectCount++;
      } else if (normExp.toLowerCase() === normDet.toLowerCase()) {
        part3CorrectCount++;
      }
    }
  });

  // Phần III: 0.25đ / câu (tối đa 1.5đ)
  const part3Score = Math.round((part3CorrectCount * 0.25) * 100) / 100;

  // Tổng điểm thô & Điểm quy đổi thang 10
  const totalRawScore = Math.round((part1Score + part2Score + part3Score) * 100) / 100;
  // Làm tròn chuẩn TT22 (1 hoặc 2 chữ số thập phân)
  const totalScoreScaled = Math.min(10.0, Math.round(totalRawScore * 10) / 10);

  return {
    studentCode: scanResult.detectedStudentCode,
    examCode: approvedKey.examCode,
    part1Score,
    part2Score,
    part3Score,
    totalRawScore,
    totalScoreScaled,
    mcqCorrectCount,
    mcqTotal,
    part2CorrectCounts,
    part3CorrectCount,
    flags,
    passedPolicy: totalScoreScaled >= 5.0
  };
}
