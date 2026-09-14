/**
 * Deep-RAG Sư Phạm Semantic Parser Engine
 * Chuyên bóc tách và phân tích ngữ nghĩa tài liệu bài giảng giáo viên (.docx, .pdf, .txt, giáo trình)
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
 */
export function extractRelevantLessonText(fullDocText: string, lessonTitle: string): string {
  const cleanDoc = cleanRawDocumentText(fullDocText);
  if (!cleanDoc) return '';
  if (cleanDoc.length <= 4000) return cleanDoc;

  const cleanTitle = lessonTitle.toLowerCase().trim();
  const lessonNumMatch = cleanTitle.match(/(?:bài|tiết|chương|phần)\s*([0-9]+)/i);

  let targetIndex = -1;
  // 1. Tìm theo số hiệu bài (ví dụ "Bài 5", "Bài số 5")
  if (lessonNumMatch) {
    const regex = new RegExp(`(?:bài|tiết|chương)\\s*${lessonNumMatch[1]}\\b`, 'i');
    targetIndex = cleanDoc.search(regex);
  }

  // 2. Tìm theo tên bài nguyên bản
  if (targetIndex < 0) {
    targetIndex = cleanDoc.toLowerCase().indexOf(cleanTitle);
  }

  // 3. Tìm theo các từ khóa then chốt của tên bài
  if (targetIndex < 0) {
    const words = cleanTitle
      .split(/[\s,.:;_\-]+/)
      .filter(w => w.length > 3 && !w.match(/^(bài|tiết|chương|phần|khối|lớp|tìm|hiểu)$/i));

    for (const w of words) {
      const idx = cleanDoc.toLowerCase().indexOf(w);
      if (idx >= 0) {
        targetIndex = idx;
        break;
      }
    }
  }

  if (targetIndex >= 0) {
    // Lấy ngữ cảnh mở rộng trước 150 ký tự và sau 3500 ký tự
    const start = Math.max(0, targetIndex - 150);
    const end = Math.min(cleanDoc.length, targetIndex + 3800);
    return cleanDoc.substring(start, end).trim();
  }

  // Mặc định lấy 3500 ký tự đầu tiên nếu không xác định được vị trí cụ thể
  return cleanDoc.slice(0, 3500).trim();
}

/**
 * Trích xuất các khái niệm và câu định nghĩa cốt lõi trong văn bản
 */
export function extractCoreDefinitions(text: string, lessonTitle: string): DefinitionItem[] {
  const definitions: DefinitionItem[] = [];
  const lines = text.split('\n');

  // Mẫu câu định nghĩa tiếng Việt phổ biến trong sách giáo khoa & giáo trình
  const defPatterns = [
    /^([A-ZÀ-Ỹa-zà-ỹ0-9\s\-_]{3,45})\s+(?:là|được gọi là|được hiểu là|chính là|định nghĩa là)\s+(.+)$/i,
    /^(?:Khái niệm|Định nghĩa)\s*(?:về)?\s*([A-ZÀ-Ỹa-zà-ỹ0-9\s\-_]{3,45})[:\-]\s*(.+)$/i,
    /^([A-ZÀ-Ỹa-zà-ỹ0-9\s\-_]{3,45})\s*[:]\s*(.+)$/
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim().replace(/^[-*•]\s*/, '');
    if (line.length < 15 || line.length > 350) continue;

    for (const pattern of defPatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[2]) {
        const term = match[1].trim();
        const def = match[2].trim();
        // Lọc bỏ nếu term quá dài hoặc mang tính tiêu đề chung chung
        if (term.length >= 3 && term.length <= 40 && def.length >= 10 && !term.toLowerCase().startsWith('bài')) {
          if (!definitions.some(d => d.term.toLowerCase() === term.toLowerCase())) {
            definitions.push({ term, definition: def });
            if (definitions.length >= 6) return definitions;
          }
        }
      }
    }
  }

  // Nếu không trích xuất được dạng chuẩn, tìm các câu chứa từ khóa "là" quan trọng
  if (definitions.length === 0) {
    const sentences = text.split(/[.;\n]/);
    for (const s of sentences) {
      const trimmed = s.trim();
      if (trimmed.length > 20 && trimmed.length < 200 && /\b(là|được dùng để|có tác dụng|gồm có)\b/i.test(trimmed)) {
        const parts = trimmed.split(/\b(?:là|được dùng để|có tác dụng|gồm có)\b/i);
        if (parts.length >= 2 && parts[0].trim().length < 35 && parts[1].trim().length > 10) {
          definitions.push({
            term: parts[0].trim().replace(/^[-*•]\s*/, ''),
            definition: parts[1].trim()
          });
          if (definitions.length >= 4) break;
        }
      }
    }
  }

  return definitions;
}

/**
 * Trích xuất các đề mục lớn/nhỏ của bài học (I., II., 1., 2., a., b.)
 */
export function extractTopicSections(text: string): TopicSection[] {
  const sections: TopicSection[] = [];
  const lines = text.split('\n');

  let currentHeading = '';
  let currentLines: string[] = [];

  const headingRegex = /^(?:[I|V|X]+\.|\d+\.|\bPhần\b|\bMục\b|\bChương\b|[A-D]\.)\s+(.+)$/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (headingRegex.test(line) && line.length < 90) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          contentLines: currentLines.slice(0, 6)
        });
      }
      currentHeading = line;
      currentLines = [];
    } else if (currentHeading) {
      if (line.length > 8 && !line.startsWith('---')) {
        currentLines.push(line);
      }
    }
  }

  if (currentHeading && currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      contentLines: currentLines.slice(0, 6)
    });
  }

  return sections.slice(0, 5);
}

/**
 * Trích xuất công thức, nguyên lý, quy tắc toán học / khoa học
 */
export function extractFormulasAndRules(text: string): string[] {
  const formulas: string[] = [];
  const lines = text.split('\n');

  // Tìm các dòng chứa dấu =, công thức, hoặc bắt đầu bằng Công thức, Định lý, Quy tắc
  const formulaRegex = /(?:^|\s)(?:Công thức|Định lý|Quy tắc|Hệ thức|Đẳng thức)[:\-]?\s*(.+)$/i;
  const mathSymbolsRegex = /[=+\-*/^√∑∏∫≤≥±]/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length < 5 || line.length > 200) continue;

    if (formulaRegex.test(line)) {
      formulas.push(line);
    } else if (mathSymbolsRegex.test(line) && line.includes('=') && line.length < 100) {
      if (!formulas.includes(line)) {
        formulas.push(line);
      }
    }

    if (formulas.length >= 5) break;
  }

  return formulas;
}

/**
 * Trích xuất quy trình các bước thực hành / thao tác kỹ thuật
 */
export function extractPracticalSteps(text: string): PracticalStepItem[] {
  const steps: PracticalStepItem[] = [];
  const lines = text.split('\n');

  const stepRegex = /^(?:Bước\s*(\d+)|Thao tác\s*(\d+)|Giai đoạn\s*(\d+))[:.\-]?\s*(.+)$/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const match = line.match(stepRegex);
    if (match) {
      const stepNum = Number(match[1] || match[2] || match[3] || steps.length + 1);
      const rest = match[4].trim();

      // Tách title và chi tiết nếu có dấu gạch ngang hoặc hai chấm
      const parts = rest.split(/[:\-–—]/);
      const title = parts[0].trim();
      const desc = parts.slice(1).join(':').trim() || rest;

      steps.push({
        stepNumber: stepNum,
        stepTitle: title,
        description: desc,
        technicalRequirement: 'Tuân thủ đúng dung sai và quy trình an toàn lao động.',
        commonMistakes: 'Thao tác sai tư thế hoặc không kiểm tra thông số trước khi vận hành.'
      });

      if (steps.length >= 6) break;
    }
  }

  return steps;
}

/**
 * Trích xuất câu hỏi ôn tập, câu hỏi thảo luận hoặc bài tập từ tài liệu
 */
export function extractSampleExercises(text: string): ExtractedQuestionItem[] {
  const questions: ExtractedQuestionItem[] = [];
  const lines = text.split('\n');

  const qRegex = /^(?:Câu\s*(\d+)|Bài\s*tập\s*(\d+)|Câu\s*hỏi)[:.\-]?\s*(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(qRegex);
    if (match) {
      const qText = match[3].trim();
      if (qText.length > 10) {
        // Kiểm tra xem các dòng tiếp theo có phải đáp án trắc nghiệm A, B, C, D không
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
            explanation: 'Căn cứ theo nội dung trọng tâm bài học trong tài liệu.'
          });
          i = j - 1;
        } else {
          questions.push({
            question: qText,
            type: 'essay',
            explanation: 'Vận dụng kiến thức bài học để phân tích và trả lời chi tiết.'
          });
        }

        if (questions.length >= 6) break;
      }
    }
  }

  return questions;
}

/**
 * Trích xuất danh mục trang thiết bị, dụng cụ, máy móc từ tài liệu
 */
export function extractEquipment(text: string, subject: string = ''): { teacher: string[]; student: string[] } {
  const teacherEq: string[] = ['Kế hoạch bài dạy (Giáo án CV 5512)', 'Máy chiếu / Ti vi tương tác'];
  const studentEq: string[] = ['Sách giáo khoa / Tài liệu học tập', 'Vở ghi bài, bút viết'];

  const lines = text.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/(?:thiết bị|dụng cụ|phương tiện|trang thiết bị|vật tư|phôi|máy)[:\-]/i.test(line)) {
      const items = line.split(/[:,;]/).slice(1).map(s => s.trim()).filter(s => s.length > 2 && s.length < 50);
      for (const item of items) {
        if (!teacherEq.includes(item) && teacherEq.length < 6) {
          teacherEq.push(item);
        }
      }
    }
  }

  // Bổ sung thiết bị đặc trưng theo môn học nếu chưa có đủ
  const subLower = subject.toLowerCase();
  if (subLower.includes('công nghệ') || subLower.includes('cơ khí') || subLower.includes('tiện') || subLower.includes('kỹ thuật')) {
    if (!teacherEq.some(e => e.includes('mô hình') || e.includes('máy'))) {
      teacherEq.push('Mô hình chi tiết máy, phôi mẫu thực tế, thước cặp/panme');
    }
    if (!studentEq.some(e => e.includes('bảo hộ'))) {
      studentEq.push('Trang phục bảo hộ lao động đạt chuẩn, phiếu học tập');
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
    const cleanH = t.heading.replace(/^(?:[I|V|X]+\.|\d+\.|[A-D]\.)\s*/, '').trim();
    if (cleanH && cleanH.length < 35 && !keyTerms.includes(cleanH)) keyTerms.push(cleanH);
  });

  // Tóm tắt nội dung bài học
  let summary = '';
  if (coreDefinitions.length > 0) {
    summary = `Bài học tập trung vào các nội dung trọng tâm: ${coreDefinitions.map(d => d.term).join(', ')}.`;
  } else if (topicSections.length > 0) {
    summary = `Nội dung chính gồm các đề mục: ${topicSections.map(t => t.heading).join('; ')}.`;
  } else {
    summary = `Nội dung bài học '${cleanTitle}' môn ${subject || 'khoa học'} được xây dựng dựa trên tài liệu bài giảng chuyên ngành.`;
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
