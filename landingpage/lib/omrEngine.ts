// ============================================================================
// EDUVIET AI GRADING - OPTICAL MARK RECOGNITION (OMR) ENGINE (REMEDIATION R3)
// Thuáº­t toÃ¡n nháº­n dáº¡ng quang há»c Ä‘iá»ƒm áº£nh thá»±c táº¿ (Pixel-Density OMR)
// Chuáº©n phiáº¿u thi Bá»™ GiÃ¡o Dá»¥c & ÄÃ o Táº¡o Viá»‡t Nam (GDPT 2025 / TT 22)
// Báº£n quyá»n: Huy Technology AI Hub (HAC-EDUVIET-R3-20261031)
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
  detected: boolean;
  isAligned: boolean;
  skewAngleDegrees: number;
}

export interface BubbleMeasurement {
  fillRatio: number;      // 0.0 -> 1.0 (Tá»· lá»‡ pixel tá»‘i so vá»›i toÃ n bá»™ diá»‡n tÃ­ch trong vÃ²ng)
  darkness: number;       // 0.0 -> 1.0 (Äá»™ tá»‘i trung bÃ¬nh)
  meanLuminance: number;  // 0 -> 255 (Äá»™ sÃ¡ng trung bÃ¬nh)
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
  detectedChoice: 'D' | 'S' | null; // D = ÄÃºng, S = Sai
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
  part2Key: Record<number, Record<'a' | 'b' | 'c' | 'd', boolean>>; // true = ÄÃºng, false = Sai
  part3Key: Record<number, string>; // GiÃ¡ trá»‹ Ä‘Ã¡p Ã¡n dáº¡ng chuá»—i sá»‘ ('2.5', '-15', '0.05')
}

export interface OmrSheetScanResult {
  isReadable: boolean;
  unreadableReason?: string;
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
  part1Score: number;     // Tá»‘i Ä‘a 40 x 0.25 = 10.0Ä‘ (náº¿u Ä‘á» chá»‰ cÃ³ P1) hoáº·c 4.0Ä‘
  part2Score: number;     // Biá»ƒu Ä‘iá»ƒm lÅ©y tiáº¿n THPT 2025: 1 Ã½ = 0.1Ä‘, 2 Ã½ = 0.25Ä‘, 3 Ã½ = 0.5Ä‘, 4 Ã½ = 1.0Ä‘
  part3Score: number;     // 6 cÃ¢u tráº£ lá»i ngáº¯n
  totalRawScore: number;
  totalScoreScaled: number; // Thang Ä‘iá»ƒm 10 lÃ m trÃ²n 2 chá»¯ sá»‘ tháº­p phÃ¢n theo TT22
  mcqCorrectCount: number;
  mcqTotal: number;
  part2CorrectCounts: number[]; // Sá»‘ Ã½ Ä‘Ãºng cho 8 cÃ¢u pháº§n II
  part3CorrectCount: number;
  flags: string[];
  passedPolicy: boolean;
}

// ----------------------------------------------------------------------------
// 1. KIá»‚M TRA MAGIC BYTES Tá»†P NHá»Š PHÃ‚N
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
      error: 'Tá»‡p rá»—ng hoáº·c kÃ­ch thÆ°á»›c quÃ¡ nhá» (< 8 bytes) Ä‘á»ƒ xÃ¡c Ä‘á»‹nh Ä‘á»‹nh dáº¡ng'
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
    error: 'Äá»‹nh dáº¡ng tá»‡p khÃ´ng há»£p lá»‡ hoáº·c cáº¥u trÃºc nhá»‹ phÃ¢n bá»‹ há»ng (KhÃ´ng khá»›p chá»¯ kÃ½ magic bytes chuáº©n)'
  };
}

// ----------------------------------------------------------------------------
// 2. TIá»€N Xá»¬ LÃ MA TRáº¬N ÄIá»‚M áº¢NH (PIXEL MATRIX PREPROCESSING)
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
  // CÃ´ng thá»©c chuáº©n nháº­n thá»©c Ä‘á»™ sÃ¡ng ITU-R BT.601
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
// 3. NHáº¬N DIá»†N ÄIá»‚M CHUáº¨N GÃ“C PHIáº¾U THI (FIDUCIAL CORNER DETECTION & ALIGNMENT)
// ----------------------------------------------------------------------------

export function detectCornerMarkers(matrix: PixelMatrix): SheetCornerMarkers {
  const w = matrix.width;
  const h = matrix.height;

  // VÃ¹ng biÃªn tÃ¬m kiáº¿m 4 dáº¥u chuáº©n Ä‘en gÃ³c phiáº¿u thi (khoáº£ng 10% kÃ­ch thÆ°á»›c)
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

  // TÃ­nh gÃ³c nghiÃªng (skew angle) dá»±a trÃªn cáº¡nh trÃªn
  const dx = tr.x - tl.x;
  const dy = tr.y - tl.y;
  const angleRad = Math.atan2(dy, dx);
  const skewAngleDegrees = Math.round((angleRad * 180 / Math.PI) * 100) / 100;

  // R4: fail-closed marker validation (all 4 present, plausible geometry) â€” no silent nominal fallback
  const minCount = Math.max(30, Math.round(0.0002 * (w * h) / 4));
  const allPresent = tl.count >= minCount && tr.count >= minCount && bl.count >= minCount && br.count >= minCount;
  const geometryOk =
    tl.x < w * 0.5 && bl.x < w * 0.5 && tr.x > w * 0.5 && br.x > w * 0.5 &&
    tl.y < h * 0.5 && tr.y < h * 0.5 && bl.y > h * 0.5 && br.y > h * 0.5 &&
    (tr.x - tl.x) >= 0.6 * w && (br.x - bl.x) >= 0.6 * w &&
    (bl.y - tl.y) >= 0.6 * h && (br.y - tr.y) >= 0.6 * h;
  const detected = allPresent && geometryOk;
  const isAligned = detected && Math.abs(skewAngleDegrees) <= 12.0;

  return {
    topLeft: { x: tl.x, y: tl.y },
    topRight: { x: tr.x, y: tr.y },
    bottomLeft: { x: bl.x, y: bl.y },
    bottomRight: { x: br.x, y: br.y },
    detected,
    isAligned,
    skewAngleDegrees
  };
}

export function transformNormalizedCoordinate(
  u: number,
  v: number,
  markers: SheetCornerMarkers
): { x: number; y: number } {
  // Tá»a Ä‘á»™ danh Ä‘á»‹nh cá»§a 4 dáº¥u chuáº©n gÃ³c (Nominal Fiducial Positions)
  const nomU1 = 0.0417; // 50 / 1200
  const nomU2 = 0.9583; // 1150 / 1200
  const nomV1 = 0.0294; // 50 / 1700
  const nomV2 = 0.9706; // 1650 / 1700

  // Chuáº©n hÃ³a tá»a Ä‘á»™ (u, v) vÃ o khoáº£ng [0, 1] giá»¯a 4 Ä‘iá»ƒm chuáº©n
  const nu = (u - nomU1) / (nomU2 - nomU1);
  const nv = (v - nomV1) / (nomV2 - nomV1);

  // PhÃ©p ná»™i suy song tuyáº¿n (Bilinear coordinate transform)
  const topX = (1 - nu) * markers.topLeft.x + nu * markers.topRight.x;
  const topY = (1 - nu) * markers.topLeft.y + nu * markers.topRight.y;

  const botX = (1 - nu) * markers.bottomLeft.x + nu * markers.bottomRight.x;
  const botY = (1 - nu) * markers.bottomLeft.y + nu * markers.bottomRight.y;

  const x = (1 - nv) * topX + nv * botX;
  const y = (1 - nv) * topY + nv * botY;

  return { x, y };
}

// ----------------------------------------------------------------------------
// 4. ÄO Máº¬T Äá»˜ QUANG Há»ŒC Ã” TÃ” CHÃŒ (BUBBLE OPTICAL DENSITY MEASUREMENT)
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
  // Bá» qua 20% vÃ²ng ngoÃ i Ä‘á»ƒ khÃ´ng tÃ­nh Ä‘Æ°á»ng in viá»n Ã´ trÃ²n
  const innerR = Math.max(2, Math.round(rPixels * 0.80));

  let totalLuminance = 0;
  let darkPixelCount = 0;
  let totalPixels = 0;

  const bgLum = sampleLocalBackground(matrix, pt.x, pt.y, rPixels * 2.2);
  // NgÆ°á»¡ng tá»‘i thÃ­ch nghi cá»¥c bá»™ (Adaptive Threshold)
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
// 5. THUáº¬T TOÃN ÄÃNH GIÃ PHáº¦N I (40 CÃ‚U TRáº®C NGHIá»†M KHÃCH QUAN)
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

  // 1. Äá»ƒ trá»‘ng
  if (topFill < BLANK_THRESH) {
    return {
      questionNumber,
      detectedOption: null,
      status: 'BLANK',
      confidence: Math.round((1.0 - topFill) * 100) / 100,
      candidates,
      flagMessage: `CÃ¢u ${questionNumber}: ThÃ­ sinh Ä‘á»ƒ trá»‘ng (chÆ°a tÃ´ Ä‘Ã¡p Ã¡n)`
    };
  }

  // 2. TÃ´ Ä‘Ã¨ nhiá»u phÆ°Æ¡ng Ã¡n
  if (topFill >= MULTI_THRESH && secondFill >= MULTI_THRESH && (topFill - secondFill) < MARGIN_THRESH) {
    return {
      questionNumber,
      detectedOption: null,
      status: 'MULTIPLE_MARKS',
      confidence: 0.30,
      candidates,
      flagMessage: `CÃ¢u ${questionNumber}: PhÃ¡t hiá»‡n tÃ´ Ä‘Ã¨ nhiá»u phÆ°Æ¡ng Ã¡n (${topOpt} vÃ  ${secondOpt})`
    };
  }

  // 3. NÃ©t chÃ¬ quÃ¡ má» hoáº·c nghi ngá»
  if (topFill >= BLANK_THRESH && topFill < FILLED_THRESH) {
    return {
      questionNumber,
      detectedOption: topOpt,
      status: 'UNCERTAIN',
      confidence: 0.50,
      candidates,
      flagMessage: `CÃ¢u ${questionNumber}: NÃ©t chÃ¬ má» (${topOpt}), cáº§n giÃ¡m kháº£o xÃ¡c thá»±c`
    };
  }

  // 4. Há»£p lá»‡
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
// 6. THUáº¬T TOÃN Äá»ŒC MÃƒ SBD (6 CHá»® Sá») VÃ€ MÃƒ Äá»€ (3 CHá»® Sá»)
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
// 7. QUÃ‰T TOÃ€N Bá»˜ PHIáº¾U BÃ€I THI Tá»ª MA TRáº¬N ÄIá»‚M áº¢NH THá»°C Táº¾
// ----------------------------------------------------------------------------

export function scanExamSheetPixelMatrix(
  matrix: PixelMatrix,
  format: SupportedFileFormat = 'PNG'
): OmrSheetScanResult {
  const cornerMarkers = detectCornerMarkers(matrix);
  const flags: string[] = [];

  // R4 FAIL-CLOSED: without 4 verified fiducials (or with extreme skew) we do NOT guess positions.
  if (!cornerMarkers.isAligned) {
    const reason = !cornerMarkers.detected
      ? 'KhÃ´ng phÃ¡t hiá»‡n Ä‘á»§ 4 dáº¥u chuáº©n gÃ³c phiáº¿u (áº£nh sai phiáº¿u/cáº¯t gÃ³c/quÃ¡ tá»‘i)'
      : `Phiáº¿u nghiÃªng ${cornerMarkers.skewAngleDegrees}Â° vÆ°á»£t giá»›i háº¡n Â±12Â°`;
    return {
      isReadable: false,
      unreadableReason: reason,
      format,
      detectedStudentCode: 'HS-UNKNOWN',
      detectedExamCode: 'UNKNOWN',
      part1Scans: [],
      part2Scans: [],
      part3Scans: [],
      overallConfidence: 0,
      flags: [`Tá»ª CHá»I QUÃ‰T: ${reason}`],
      processedAt: Date.now(),
      checksum: `chk_unreadable_${matrix.width}x${matrix.height}`,
      cornerMarkers
    };
  }

  // 1. Nháº­n dáº¡ng MÃ£ SBD (6 chá»¯ sá»‘)
  const sbdResult = decodeNumericBubbleGrid(
    matrix,
    0.52, 0.10, 0.038, 0.024, 6, 0.010, cornerMarkers
  );
  const detectedStudentCode = sbdResult.complete ? `HS-${sbdResult.code}` : `HS-UNKNOWN`;
  if (!sbdResult.complete) {
    flags.push(`KhÃ´ng nháº­n diá»‡n Ä‘Æ°á»£c Ä‘áº§y Ä‘á»§ Sá»‘ bÃ¡o danh (Ä‘á»c Ä‘Æ°á»£c: ${sbdResult.code})`);
  }

  // 2. Nháº­n dáº¡ng MÃ£ Ä‘á» thi (3 chá»¯ sá»‘)
  const examResult = decodeNumericBubbleGrid(
    matrix,
    0.80, 0.10, 0.038, 0.024, 3, 0.010, cornerMarkers
  );
  const detectedExamCode = examResult.complete ? examResult.code : 'UNKNOWN';
  if (!examResult.complete) {
    flags.push(`KhÃ´ng nháº­n diá»‡n Ä‘Æ°á»£c Ä‘áº§y Ä‘á»§ MÃ£ Ä‘á» thi (Ä‘á»c Ä‘Æ°á»£c: ${examResult.code})`);
  }

  // 3. QuÃ©t Pháº§n I: 40 cÃ¢u tráº¯c nghiá»‡m 4 lá»±a chá»n (A, B, C, D)
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
      flags.push(scan.flagMessage || `CÃ¢u ${q}: Cáº§n xÃ¡c thá»±c quang há»c`);
    }
  }

  // 4. QuÃ©t Pháº§n II: 8 cÃ¢u ÄÃºng / Sai (má»—i cÃ¢u 4 Ã½ a, b, c, d)
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

  // 5. QuÃ©t Pháº§n III: 6 cÃ¢u Tráº£ lá»i ngáº¯n
  const part3Scans: OmrPart3QuestionScan[] = [];
  for (let q = 1; q <= 6; q++) {
    const v = 0.72 + (q - 1) * 0.038;
    // Äá»c Ã´ dáº¥u Ã¢m '-' vÃ  4 chá»¯ sá»‘
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

  // Checksum toÃ n váº¹n
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
// 8. CHẤM ĐIỂM THEO ĐÁP ÁN CHUẨN ĐÃ DUYỆT TỪ MÁY CHỦ (R4: blueprint, fail-closed, không fallback)
// ----------------------------------------------------------------------------
import { validateAnswerKey, blueprintMaxPoints } from './gradingKey';
import type { Blueprint } from './gradingServer/types';

/** Key as delivered by the server for an APPROVED, versioned exam. Never construct this client-side for REAL mode. */
export interface ApprovedAnswerKey {
  examCode: string;
  version: number;
  status: 'APPROVED';
  blueprint: Blueprint;
  part1Key: Record<string, 'A' | 'B' | 'C' | 'D'>;
  part2Key: Record<string, Record<'a' | 'b' | 'c' | 'd', boolean>>;
  part3Key: Record<string, string>;
}

const PART2_SCHEME: Record<number, number> = { 0: 0, 1: 0.10, 2: 0.25, 3: 0.50, 4: 1.00 };

export class GradingRejection extends Error {
  constructor(public code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'GradingRejection';
  }
}

export function gradeExamSheet(scan: OmrSheetScanResult, key: ApprovedAnswerKey): ExamGradingResult {
  if (!key || key.status !== 'APPROVED') throw new GradingRejection('KEY_NOT_APPROVED', 'Thiếu đáp án chuẩn đã duyệt');
  const keyErrors = validateAnswerKey(key);
  if (keyErrors.length) throw new GradingRejection('KEY_INVALID', keyErrors.slice(0, 5).join('; '));
  if (!scan.isReadable) throw new GradingRejection('SHEET_UNREADABLE', scan.unreadableReason || 'Phiếu không đọc được');
  if (scan.detectedExamCode === 'UNKNOWN') throw new GradingRejection('EXAM_CODE_UNREADABLE', 'Không đọc được mã đề — không tự gán mã đề mặc định');
  if (scan.detectedStudentCode === 'HS-UNKNOWN') throw new GradingRejection('STUDENT_CODE_UNREADABLE', 'Không đọc được SBD');
  if (scan.detectedExamCode !== key.examCode) {
    throw new GradingRejection('EXAM_CODE_MISMATCH', `Phiếu mã đề ${scan.detectedExamCode} ≠ đáp án ${key.examCode}`);
  }

  const b = key.blueprint;
  const flags: string[] = [...scan.flags];

  let p1Correct = 0;
  for (let q = 1; q <= b.part1.count; q++) {
    const s = scan.part1Scans.find(x => x.questionNumber === q);
    if (!s) { flags.push(`Phần I câu ${q}: không có dữ liệu quét`); continue; }
    if (s.status === 'VALID' && s.detectedOption === key.part1Key[q]) p1Correct++;
    else if (s.status === 'UNCERTAIN' || s.status === 'MULTIPLE_MARKS') flags.push(`Phần I câu ${q}: ${s.status} — cần giáo viên xác thực`);
  }
  const part1Score = p1Correct * b.part1.pointsEach;

  const part2CorrectCounts: number[] = [];
  let part2Score = 0;
  for (let q = 1; q <= b.part2.count; q++) {
    const s = scan.part2Scans.find(x => x.questionNumber === q);
    let ok = 0;
    for (const sub of ['a', 'b', 'c', 'd'] as const) {
      const item = s?.items[sub];
      if (!item) { flags.push(`Phần II câu ${q}${sub}: không có dữ liệu quét`); continue; }
      if (item.status === 'VALID' && item.detectedChoice && (item.detectedChoice === 'D') === key.part2Key[q][sub]) ok++;
      else if (item.status === 'UNCERTAIN' || item.status === 'MULTIPLE_MARKS') flags.push(`Phần II câu ${q}${sub}: ${item.status} — cần xác thực`);
    }
    part2CorrectCounts.push(ok);
    part2Score += PART2_SCHEME[ok];
  }

  let p3Correct = 0;
  for (let q = 1; q <= b.part3.count; q++) {
    const s = scan.part3Scans.find(x => x.questionNumber === q);
    if (!s) { flags.push(`Phần III câu ${q}: không có dữ liệu quét`); continue; }
    if (s.status !== 'VALID') {
      if (s.status === 'UNCERTAIN') flags.push(`Phần III câu ${q}: đọc chưa chắc chắn ("${s.detectedText}") — cần xác thực`);
      continue; // BLANK or UNCERTAIN never scores
    }
    if (Number(s.detectedText) === Number(key.part3Key[q].replace(',', '.'))) p3Correct++;
  }
  const part3Score = p3Correct * b.part3.pointsEach;

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const total = round2(part1Score + part2Score + part3Score);
  if (total > blueprintMaxPoints(b) + 1e-9 || total < 0) {
    throw new GradingRejection('SCORE_OUT_OF_RANGE', `Tổng điểm ${total} vượt thang ${blueprintMaxPoints(b)}`);
  }

  return {
    studentCode: scan.detectedStudentCode,
    examCode: key.examCode,
    part1Score: round2(part1Score),
    part2Score: round2(part2Score),
    part3Score: round2(part3Score),
    totalRawScore: total,
    totalScoreScaled: total, // blueprint is validated to sum to exactly 10 => no clamping/rescaling
    mcqCorrectCount: p1Correct,
    mcqTotal: b.part1.count,
    part2CorrectCounts,
    part3CorrectCount: p3Correct,
    flags,
    passedPolicy: total >= 5.0
  };
}
