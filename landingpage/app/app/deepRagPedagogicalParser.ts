/**
 * Deep-RAG Sư Phạm Semantic Parser Engine v2.0
 * Chuyên bóc tách và phân tích ngữ nghĩa tài liệu bài giảng giáo viên (.docx, .pdf, .txt, giáo trình, chuyên đề)
 * Nhằm cung cấp dữ liệu thực tế cho AI soạn giáo án chuẩn CV 5512 và CV 2634, loại bỏ hoàn toàn khung sườn chung chung.
 */

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface TopicSection {
  heading: string;
  contentLines: string[];
}

export interface PracticalStepItem {
  stepNumber: number;
  stepTitle: string;
  description: string;
  technicalRequirement?: string;
  commonMistakes?: string;
  safetyNote?: string;
}

export interface ExtractedQuestionItem {
  question: string;
  options?: string[]; // A, B, C, D nếu trắc nghiệm
  correctAnswer?: string;
  explanation?: string;
  type: 'mcq' | 'essay';
}

export interface ExtractedLessonKnowledge {
  lessonTitle: string;
  subject: string;
  grade: string;
  summary: string;
  coreDefinitions: DefinitionItem[];
  topicSections: TopicSection[];
  formulasAndRules: string[];
  practicalSteps: PracticalStepItem[];
  sampleExercises: ExtractedQuestionItem[];
  equipmentList: {
    teacher: string[];
    student: string[];
  };
  keyTerms: string[];
  rawContextSnippet: string;
}

/**
 * Chuẩn hóa và làm sạch văn bản thô từ tài liệu
 */
export function cleanRawDocumentText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[\uFFFD\?]+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Trích xuất phân đoạn văn bản bám sát nhất với bài học cần soạn
 * Tối ưu hóa: Bỏ qua Mục lục (Table of Contents trap), mở rộng dung lượng bóc tách lên tới 40.000 ký tự.
 */
export function extractRelevantLessonText(fullDocText: string, lessonTitle: string): string {
  const cleanDoc = cleanRawDocumentText(fullDocText);
  if (!cleanDoc) return '';
  // Nếu tài liệu có độ dài dưới 40.000 ký tự (~15-20 trang sách), giữ lại toàn văn để Deep-RAG phân tích toàn diện
  if (cleanDoc.length <= 40000) return cleanDoc;

  const cleanTitle = lessonTitle.toLowerCase().trim();
  const lessonNumMatch = cleanTitle.match(/(?:bài|tiết|chương|chủ đề|module|mục)\s*([0-9]+)/i);

  // 1. Xác định vị trí kết thúc của Mục Lục (TOC) nếu có, tránh bẫy match trúng dòng mục lục
  let tocCutoff = 0;
  const tocMatches = [...cleanDoc.matchAll(/(?:mục\s*lục|table\s*of\s*contents)/gi)];
  if (tocMatches.length > 0) {
    const lastToc = tocMatches[tocMatches.length - 1];
    if (lastToc.index !== undefined && lastToc.index < 12000) {
      // Tìm điểm kết thúc của các dòng có chấm chấm ... trang số
      const afterToc = cleanDoc.slice(lastToc.index);
      const dotPageMatches = [...afterToc.matchAll(/\.{3,}\s*(?:trang)?\s*\d+/g)];
      if (dotPageMatches.length > 0) {
        const lastDot = dotPageMatches[dotPageMatches.length - 1];
        if (lastDot.index !== undefined) {
          tocCutoff = lastToc.index + lastDot.index + lastDot[0].length + 50;
        }
      } else {
        tocCutoff = lastToc.index + 2000;
      }
    }
  }

  const searchableText = tocCutoff > 0 && tocCutoff < cleanDoc.length - 1000
    ? cleanDoc.slice(tocCutoff)
    : cleanDoc;
  const offset = cleanDoc.length - searchableText.length;

  let targetIndex = -1;

  // 2. Tìm theo số hiệu bài cụ thể (ví dụ "Bài 5:", "Chương 2:", "Bài số 5") trong phần nội dung chính
  if (lessonNumMatch) {
    const num = lessonNumMatch[1];
    const regexList = [
      new RegExp(`(?:bài|tiết|chương|chủ đề)\\s*${num}\\b[\\s:.-–—]`, 'i'),
      new RegExp(`\\b${num}\\.\\s+[A-ZÀ-Ỹ]`, 'i')
    ];
    for (const rg of regexList) {
      const idx = searchableText.search(rg);
      if (idx >= 0) {
        targetIndex = offset + idx;
        break;
      }
    }
  }

  // 3. Tìm theo tên bài nguyên bản
  if (targetIndex < 0 && cleanTitle.length > 4) {
    const idx = searchableText.toLowerCase().indexOf(cleanTitle);
    if (idx >= 0) {
      targetIndex = offset + idx;
    }
  }

  // 4. Tìm theo cụm từ khóa then chốt của tên bài
  if (targetIndex < 0) {
    const words = cleanTitle
      .split(/[\s,.:;_\-]+/)
      .filter(w => w.length > 3 && !w.match(/^(bài|tiết|chương|phần|khối|lớp|tìm|hiểu|tổng|quan)$/i));

    for (const w of words) {
      const idx = searchableText.toLowerCase().indexOf(w);
      if (idx >= 0) {
        targetIndex = offset + idx;
        break;
      }
    }
  }

  if (targetIndex >= 0) {
    // Lấy ngữ cảnh mở rộng trước 250 ký tự và sau 35.000 ký tự
    const start = Math.max(0, targetIndex - 250);
    const end = Math.min(cleanDoc.length, targetIndex + 35000);
    return cleanDoc.substring(start, end).trim();
  }

  // Mặc định lấy 35.000 ký tự đầu tiên nếu không xác định được vị trí cụ thể
  return cleanDoc.slice(0, 35000).trim();
}

/**
 * Trích xuất các khái niệm và câu định nghĩa cốt lõi trong văn bản
 */
export function extractCoreDefinitions(text: string, lessonTitle: string = ''): DefinitionItem[] {
  const definitions: DefinitionItem[] = [];
  if (!text) return definitions;

  const lines = text.split('\n');

  // Mẫu câu định nghĩa tiếng Việt phong phú trong SGK, tài liệu kỹ thuật & giáo trình
  const defPatterns = [
    /^([A-ZÀ-Ỹa-zà-ỹ0-9\s\-_/()]{3,50})\s+(?:là|được gọi là|được hiểu là|chính là|định nghĩa là|nghĩa là|dùng để|có chức năng|bao gồm|được cấu tạo bởi)\s+(.+)$/i,
    /^(?:Khái niệm|Định nghĩa|Ý nghĩa|Nguyên lý|Bản chất|Cấu tạo|Chức năng)\s*(?:về)?\s*([A-ZÀ-Ỹa-zà-ỹ0-9\s\-_/()]{3,50})[:\-]\s*(.+)$/i,
    /^([A-ZÀ-Ỹa-zà-ỹ0-9\s\-_/()]{3,45})\s*[:]\s*(.+)$/,
    /^[0-9•\-\*]+\.?\s*([A-ZÀ-Ỹa-zà-ỹ0-9\s\-_/()]{3,45})[:\-]\s*(.+)$/
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim().replace(/^[-*•]\s*/, '');
    if (line.length < 12 || line.length > 400) continue;

    for (const pattern of defPatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[2]) {
        const term = match[1].trim().replace(/^[0-9.]+\s*/, '');
        const def = match[2].trim();
        // Lọc bỏ nếu term quá dài hoặc mang tính tiêu đề hành chính chung chung
        if (
          term.length >= 3 &&
          term.length <= 45 &&
          def.length >= 10 &&
          !term.toLowerCase().startsWith('bài') &&
          !term.toLowerCase().startsWith('tiết') &&
          !term.toLowerCase().startsWith('trang') &&
          !term.toLowerCase().startsWith('câu hỏi')
        ) {
          if (!definitions.some(d => d.term.toLowerCase() === term.toLowerCase())) {
            definitions.push({ term, definition: def });
            if (definitions.length >= 8) return definitions;
          }
        }
      }
    }
  }

  // Nếu không trích xuất được dạng chuẩn, tìm các câu chứa từ khóa quan trọng
  if (definitions.length === 0) {
    const sentences = text.split(/[.;\n]/);
    for (const s of sentences) {
      const trimmed = s.trim();
      if (
        trimmed.length > 20 &&
        trimmed.length < 250 &&
        /\b(là|được dùng để|có tác dụng|gồm có|có nhiệm vụ|hoạt động dựa trên)\b/i.test(trimmed)
      ) {
        const parts = trimmed.split(/\b(?:là|được dùng để|có tác dụng|gồm có|có nhiệm vụ|hoạt động dựa trên)\b/i);
        if (parts.length >= 2 && parts[0].trim().length >= 3 && parts[0].trim().length < 40 && parts[1].trim().length > 10) {
          const termCandidate = parts[0].trim().replace(/^[-*•0-9.]+\s*/, '');
          if (!definitions.some(d => d.term.toLowerCase() === termCandidate.toLowerCase())) {
            definitions.push({
              term: termCandidate,
              definition: parts[1].trim()
            });
            if (definitions.length >= 6) break;
          }
        }
      }
    }
  }

  return definitions;
}

/**
 * Trích xuất các đề mục lớn/nhỏ của bài học (I., II., 1., 2., 1.1, A., B., a, b...)
 */
export function extractTopicSections(text: string): TopicSection[] {
  const sections: TopicSection[] = [];
  if (!text) return sections;

  const lines = text.split('\n');
  let currentHeading = '';
  let currentLines: string[] = [];

  // Nhận diện linh hoạt các kiểu đề mục tiếng Việt
  const headingRegex = /^(?:[I|V|X]+\.|\d+[\./]|\bPhần\b|\bMục\b|\bChương\b|\bChủ đề\b|[A-D]\.|\d+\.\d+|\b[a-d]\))\s+(.+)$/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isMatch = headingRegex.test(line) || (
      line.length >= 6 &&
      line.length <= 70 &&
      line === line.toUpperCase() &&
      /[A-ZÀ-Ỹ]/.test(line) &&
      !line.includes('CỘNG HÒA') &&
      !line.includes('BỘ GIÁO DỤC')
    );

    if (isMatch && line.length < 100) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          contentLines: currentLines.slice(0, 10)
        });
      }
      currentHeading = line;
      currentLines = [];
    } else if (currentHeading) {
      if (line.length > 8 && !line.startsWith('---') && !line.startsWith('===') && !line.startsWith('...')) {
        currentLines.push(line);
      }
    }
  }

  if (currentHeading && currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      contentLines: currentLines.slice(0, 10)
    });
  }

  // Fallback nếu tài liệu không dùng heading chuẩn: gom các đoạn văn bản dài thành các chủ đề nội dung
  if (sections.length === 0) {
    const paragraphs = text
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p.length > 40 && !p.startsWith('===') && !p.startsWith('---'));

    paragraphs.slice(0, 4).forEach((p, idx) => {
      const firstSentence = p.split(/[.:\n]/)[0].trim();
      sections.push({
        heading: `Nội dung ${idx + 1}: ${firstSentence.slice(0, 60)}...`,
        contentLines: [p.slice(0, 300)]
      });
    });
  }

  return sections.slice(0, 8);
}

/**
 * Trích xuất công thức, nguyên lý, thông số kỹ thuật, quy tắc toán học / khoa học
 */
export function extractFormulasAndRules(text: string): string[] {
  const formulas: string[] = [];
  if (!text) return formulas;

  const lines = text.split('\n');
  const formulaRegex = /(?:^|\s)(?:Công thức|Định lý|Quy tắc|Hệ thức|Đẳng thức|Nguyên lý|Tiêu chuẩn|Dung sai|Thông số)[:\-]?\s*(.+)$/i;
  const mathSymbolsRegex = /[=+\-*/^√∑∏∫≤≥±≈]/;
  const techUnitsRegex = /\b(?:mm|cm|m\/s|vòng\/phút|RPM|MPa|kW|Hz|V|A|bar|kg|%)\b/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length < 5 || line.length > 250) continue;

    if (formulaRegex.test(line)) {
      if (!formulas.includes(line)) formulas.push(line);
    } else if ((mathSymbolsRegex.test(line) && line.includes('=')) || (techUnitsRegex.test(line) && /\d+/.test(line))) {
      if (!formulas.includes(line) && line.length < 120) {
        formulas.push(line);
      }
    }

    if (formulas.length >= 8) break;
  }

  return formulas;
}

/**
 * Trích xuất quy trình các bước thực hành / thao tác kỹ thuật
 */
export function extractPracticalSteps(text: string): PracticalStepItem[] {
  const steps: PracticalStepItem[] = [];
  if (!text) return steps;

  const lines = text.split('\n');
  const stepRegex = /^(?:Bước\s*(\d+)|Thao tác\s*(\d+)|Giai đoạn\s*(\d+)|\b(\d+)[\.)]\s*(?:Tiến hành|Thực hiện|Chuẩn bị|Kiểm tra|Gia công|Vận hành|Đo|Cắt|Lắp|Cài đặt))[:.\-]?\s*(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(stepRegex);
    if (match) {
      const stepNum = Number(match[1] || match[2] || match[3] || match[4] || steps.length + 1);
      const rest = (match[5] || line).trim();

      const parts = rest.split(/[:\-–—]/);
      const title = parts[0].trim();
      const desc = parts.slice(1).join(':').trim() || rest;

      // Tìm câu lưu ý an toàn hoặc yêu cầu kỹ thuật ở dòng tiếp theo nếu có
      let nextDetail = '';
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith('-') || nextLine.startsWith('•') || nextLine.startsWith('*')) {
          nextDetail = nextLine.replace(/^[-*•]\s*/, '');
        }
      }

      steps.push({
        stepNumber: stepNum,
        stepTitle: title,
        description: desc,
        technicalRequirement: nextDetail || 'Đảm bảo đúng kích thước, thông số công nghệ và yêu cầu kỹ thuật bản vẽ.',
        commonMistakes: 'Thao tác sai trình tự hoặc không kiểm tra an toàn trước khi vận hành.',
        safetyNote: 'Luôn mang đầy đủ BHLĐ, không đứng trực diện vùng văng phôi hoặc bộ phận chuyển động.'
      });

      if (steps.length >= 8) break;
    }
  }

  return steps;
}

/**
 * Trích xuất câu hỏi ôn tập, câu hỏi thảo luận hoặc bài tập từ tài liệu
 */
export function extractSampleExercises(text: string): ExtractedQuestionItem[] {
  const questions: ExtractedQuestionItem[] = [];
  if (!text) return questions;

  const lines = text.split('\n');
  const qRegex = /^(?:Câu\s*(\d+)|Bài\s*tập\s*(\d+)|Câu\s*hỏi|Vấn\s*đề\s*thảo\s*luận)[:.\-]?\s*(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(qRegex);
    if (match) {
      const qText = (match[3] || match[0]).trim();
      if (qText.length > 10) {
        const options: string[] = [];
        let j = i + 1;
        while (j < lines.length && j <= i + 5) {
          const nextLine = lines[j].trim();
          if (/^[A-D][.)\-]\s*.+/.test(nextLine)) {
            options.push(nextLine);
            j++;
          } else {
            break;
          }
        }

        if (options.length >= 3) {
          questions.push({
            question: qText,
            options,
            correctAnswer: options[0] ? options[0].charAt(0) : 'A',
            type: 'mcq',
            explanation: 'Căn cứ theo nội dung trọng tâm bài học trong tài liệu bài giảng.'
          });
          i = j - 1;
        } else {
          questions.push({
            question: qText,
            type: 'essay',
            explanation: 'Vận dụng kiến thức bài học trong tài liệu để phân tích và trả lời chi tiết.'
          });
        }

        if (questions.length >= 8) break;
      }
    }
  }

  return questions;
}

/**
 * Trích xuất danh mục trang thiết bị, dụng cụ, máy móc từ tài liệu
 */
export function extractEquipment(text: string, subject: string = ''): { teacher: string[]; student: string[] } {
  const teacherEq: string[] = ['Kế hoạch bài dạy (Giáo án CV 5512/2634)', 'Máy chiếu / Ti vi tương tác'];
  const studentEq: string[] = ['Sách giáo khoa / Tài liệu học tập chuyên ngành', 'Vở ghi chép, bút viết'];

  if (!text) return { teacher: teacherEq, student: studentEq };

  const lines = text.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/(?:thiết bị|dụng cụ|phương tiện|trang thiết bị|vật tư|phôi|máy|đồ gá)[:\-]/i.test(line)) {
      const items = line.split(/[:,;]/).slice(1).map(s => s.trim()).filter(s => s.length > 2 && s.length < 60);
      for (const item of items) {
        if (!teacherEq.includes(item) && teacherEq.length < 8) {
          teacherEq.push(item);
        }
      }
    }
  }

  // Bổ sung thiết bị đặc thù môn học
  const subLower = (subject || '').toLowerCase();
  if (subLower.includes('công nghệ') || subLower.includes('cơ khí') || subLower.includes('tiện') || subLower.includes('kỹ thuật')) {
    if (!teacherEq.some(e => e.includes('máy') || e.includes('mô hình'))) {
      teacherEq.push('Mô hình chi tiết máy thực tế, phôi mẫu, dụng cụ đo kiểm (thước cặp/panme)');
    }
    if (!studentEq.some(e => e.includes('bảo hộ'))) {
      studentEq.push('Trang phục bảo hộ lao động đạt chuẩn xưởng, phiếu thực hành');
    }
  }

  return { teacher: teacherEq, student: studentEq };
}

/**
 * Hàm phân tích tổng thể Deep-RAG Sư Phạm (Main Deep-RAG Parsing Pipeline)
 */
export function deepParseLessonDocument(
  docContent: string,
  lessonTitle: string,
  subject: string = '',
  grade: string = ''
): ExtractedLessonKnowledge {
  const cleanTitle = lessonTitle.trim() || 'Bài học chuyên đề';
  const snippet = extractRelevantLessonText(docContent, cleanTitle);

  const coreDefinitions = extractCoreDefinitions(snippet, cleanTitle);
  const topicSections = extractTopicSections(snippet);
  const formulasAndRules = extractFormulasAndRules(snippet);
  const practicalSteps = extractPracticalSteps(snippet);
  const sampleExercises = extractSampleExercises(snippet);
  const equipmentList = extractEquipment(snippet, subject);

  // Tạo danh sách từ khóa chuyên ngành (Key Terms)
  const keyTerms: string[] = [];
  coreDefinitions.forEach(d => {
    if (!keyTerms.includes(d.term)) keyTerms.push(d.term);
  });
  topicSections.forEach(t => {
    const cleanH = t.heading.replace(/^(?:[I|V|X]+\.|\d+[\./]|\bPhần\b|\bMục\b|\bChương\b|[A-D]\.|\d+\.\d+|\b[a-d]\))\s*/, '').trim();
    if (cleanH && cleanH.length < 40 && !keyTerms.includes(cleanH)) keyTerms.push(cleanH);
  });

  // Tóm tắt nội dung bài học
  let summary = '';
  if (coreDefinitions.length > 0) {
    summary = `Bài học tập trung vào các nội dung trọng tâm: ${coreDefinitions.map(d => d.term).slice(0, 5).join(', ')}.`;
  } else if (topicSections.length > 0) {
    summary = `Nội dung chính gồm các đề mục: ${topicSections.map(t => t.heading).slice(0, 4).join('; ')}.`;
  } else {
    summary = `Nội dung bài học '${cleanTitle}' môn ${subject || 'chuyên môn'} được trích xuất trực tiếp từ tài liệu bài giảng của giáo viên.`;
  }

  return {
    lessonTitle: cleanTitle,
    subject: subject || 'Chung',
    grade: grade || 'Phổ thông',
    summary,
    coreDefinitions,
    topicSections,
    formulasAndRules,
    practicalSteps,
    sampleExercises,
    equipmentList,
    keyTerms,
    rawContextSnippet: snippet
  };
}

export const extractPedagogicalKnowledge = deepParseLessonDocument;
export type PedagogicalKnowledge = ExtractedLessonKnowledge;
