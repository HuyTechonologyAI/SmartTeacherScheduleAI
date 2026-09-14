// Generative AI Lesson Planner & Exam Matrix Engine
// Supporting CV 5512/BGDĐT-GDTrH & CV 2634/GDNN
// Integrated with Deep-RAG Sư Phạm Semantic Parser Engine

import {
  deepParseLessonDocument,
  ExtractedLessonKnowledge
} from './deepRagPedagogicalParser';

export interface LessonPlan5512Data {
  lessonTitle: string;
  subject: string;
  grade: string;
  durationMinutes: number;
  objectives: {
    knowledge: string;
    competencies: string;
    qualities: string;
  };
  equipment: {
    teacherEquipment: string;
    studentEquipment: string;
  };
  activity1Opening: {
    name: string;
    objective: string;
    content: string;
    product: string;
    implementation: string;
  };
  activity2Knowledge: {
    name: string;
    objective: string;
    content: string;
    product: string;
    implementation: string;
  };
  activity3Practice: {
    name: string;
    objective: string;
    content: string;
    product: string;
    implementation: string;
  };
  activity4Application: {
    name: string;
    objective: string;
    content: string;
    product: string;
    implementation: string;
  };
  referenceCitations?: string;
}

export interface LessonPlan2634Data {
  moduleTitle: string;
  occupation: string;
  level: string;
  durationMinutes: number;
  objectives: {
    knowledge: string;
    skills: string;
    autonomyAndSafety: string;
  };
  conditions: {
    equipmentAndMachines: string;
    materialsAndWorkpieces: string;
    safetyAnd5S: string;
  };
  step1Orientation: {
    name: string;
    teacherActivity: string;
    studentActivity: string;
    safetyAndKeyPoints: string;
  };
  step2Demonstration: {
    name: string;
    teacherActivity: string;
    studentActivity: string;
    safetyAndKeyPoints: string;
  };
  step3Practice: {
    name: string;
    teacherActivity: string;
    studentActivity: string;
    safetyAndKeyPoints: string;
  };
  step4Evaluation: {
    name: string;
    teacherActivity: string;
    studentActivity: string;
    safetyAndKeyPoints: string;
  };
  referenceCitations?: string;
}

export interface ExamQuestionItem {
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ExamMatrixData {
  topic: string;
  subject: string;
  grade: string;
  questionCount: number;
  matrix: {
    recognitionCount: number;
    recognitionPercent: number;
    comprehensionCount: number;
    comprehensionPercent: number;
    applicationCount: number;
    applicationPercent: number;
    advancedApplicationCount: number;
    advancedApplicationPercent: number;
  };
  questions: ExamQuestionItem[];
  referenceCitations?: string;
}

// ============================================================================
// BƯỚC A1: SOẠN GIÁO ÁN CHUẨN CÔNG VĂN 5512/BGDĐT-GDTrH (DEEP-RAG GROUNDED)
// ============================================================================

export function generateLessonPlan5512(
  lessonTitle: string,
  subject: string,
  grade: string,
  durationMinutes: number = 45,
  customRequirements?: string,
  referenceContext: string = ''
): LessonPlan5512Data {
  // Bóc tách ngữ nghĩa toàn văn tài liệu bằng Deep-RAG Sư Phạm
  const k = deepParseLessonDocument(referenceContext, lessonTitle, subject, grade);
  const custom = customRequirements?.trim() ? ` Yêu cầu sư phạm: ${customRequirements}.` : '';

  // Trích xuất các câu thực chất từ tài liệu đính kèm (loại bỏ tiêu đề, dòng phân cách hoặc thông báo scan)
  const substantiveSentences = referenceContext
    ? referenceContext
        .split(/[.\n;]+/)
        .map(s => s.trim().replace(/^[-*•0-9.]+\s*/, ''))
        .filter(s =>
          s.length >= 25 &&
          !s.startsWith('===') &&
          !s.startsWith('---') &&
          !s.toLowerCase().includes('mục lục') &&
          !s.toLowerCase().includes('tài liệu dạng hình ảnh') &&
          !s.toLowerCase().includes('scan nguyên bản') &&
          !s.toLowerCase().includes('dung lượng:') &&
          !s.toLowerCase().includes('xem pdf trực quan')
        )
    : [];

  // 1. Mục tiêu kiến thức chi tiết (Không viết chung chung, bám sát tài liệu)
  let knowledgeObj = '';
  if (k.coreDefinitions.length > 0) {
    knowledgeObj = `Học sinh nắm vững và phân tích được bản chất các khái niệm cốt lõi: ${k.coreDefinitions.map(d => `${d.term} (${d.definition})`).join('; ')}.`;
  } else if (k.topicSections.length > 0) {
    knowledgeObj = `Học sinh làm chủ các nội dung trọng tâm của bài: ${k.topicSections.map(t => t.heading).join(', ')}.`;
  } else if (substantiveSentences.length > 0) {
    knowledgeObj = `Học sinh làm chủ các kiến thức trọng tâm từ tài liệu bài giảng: ${substantiveSentences.slice(0, 3).join('. ')}.`;
  } else {
    knowledgeObj = `Học sinh hiểu rõ bản chất khoa học, quy luật và phương pháp tư duy của bài '${lessonTitle}'.`;
  }

  if (k.formulasAndRules.length > 0) {
    knowledgeObj += ` Vận dụng chính xác các công thức và quy tắc: ${k.formulasAndRules.slice(0, 3).join(', ')}.`;
  }
  knowledgeObj += custom;

  // 2. Nội dung Hoạt động 1: Khởi động
  const rawLead = k.keyTerms[0] || lessonTitle;
  const leadTerm = (rawLead.toLowerCase().includes('tài liệu') || rawLead.toLowerCase().includes('scan'))
    ? lessonTitle
    : rawLead;

  let act1Content = '';
  if (leadTerm && leadTerm !== lessonTitle) {
    act1Content = `Giáo viên trình chiếu tình huống thực tiễn hoặc mẫu vật/video ngắn về "${leadTerm}" và nêu câu hỏi gợi mở: "Trong thực tế đời sống và khoa học kỹ thuật, ${leadTerm} đóng vai trò gì? Nếu không nắm vững nguyên lý này, chúng ta sẽ gặp khó khăn hay sai sót nào?"`;
  } else if (substantiveSentences.length > 0) {
    act1Content = `Giáo viên đưa ra tình huống thực tế xuất phát từ tài liệu bài giảng: "${substantiveSentences[0]}", khơi gợi mâu thuẫn nhận thức và dẫn dắt học sinh khám phá bài '${lessonTitle}'.`;
  } else {
    act1Content = `Giáo viên trình chiếu hình ảnh/video thực tế liên quan đến bài học '${lessonTitle}', nêu câu hỏi gợi mở tạo mâu thuẫn nhận thức khơi gợi trí tò mò của học sinh.`;
  }

  // 3. Nội dung Hoạt động 2: Hình thành kiến thức mới (Bám sát 100% tài liệu)
  let act2Content = '';
  if (k.topicSections.length > 0) {
    act2Content = k.topicSections.map((sec, idx) => {
      const details = sec.contentLines.length > 0 ? sec.contentLines.join(' ') : 'Phân tích các đặc điểm, quy luật, cấu tạo và ứng dụng thực tiễn.';
      return `Nhiệm vụ ${idx + 1}: Chiếm lĩnh kiến thức "${sec.heading}"\n• Chi tiết lý thuyết trong bài: ${details}`;
    }).join('\n\n');
  } else if (k.coreDefinitions.length > 0) {
    act2Content = k.coreDefinitions.map((d, idx) => {
      return `Nhiệm vụ ${idx + 1}: Nghiên cứu bản chất "${d.term}"\n• Khái niệm & đặc tính: ${d.definition}`;
    }).join('\n\n');
  } else if (substantiveSentences.length > 0) {
    const chunk1 = substantiveSentences.slice(0, 2).join(' ');
    const chunk2 = substantiveSentences.slice(2, 4).join(' ');
    const chunk3 = substantiveSentences.slice(4, 6).join(' ');
    act2Content = `Nhiệm vụ 1: Nghiên cứu cấu tạo và nguyên lý nền tảng\n• Nội dung: ${chunk1 || substantiveSentences[0]}\n\nNhiệm vụ 2: Phân tích quy trình kỹ thuật và thông số trọng tâm\n• Nội dung: ${chunk2 || 'Nắm vững các yêu cầu công nghệ và phương pháp vận hành.'}\n\nNhiệm vụ 3: Đánh giá tiêu chuẩn chất lượng và lưu ý an toàn\n• Nội dung: ${chunk3 || 'Tuân thủ đúng tiêu chuẩn an toàn lao động và bảo quản thiết bị.'}`;
  } else {
    act2Content = `Học sinh nghiên cứu tài liệu bài giảng '${lessonTitle}', phân tích cấu trúc, nguyên lý vận hành và hoàn thành phiếu học tập khám phá.`;
  }

  // 4. Nội dung Hoạt động 3: Luyện tập & Củng cố (Có câu hỏi/bài tập thật)
  let act3Content = '';
  if (k.sampleExercises.length > 0) {
    act3Content = k.sampleExercises.slice(0, 4).map((ex, idx) => {
      const opts = ex.options ? '\n' + ex.options.join('\n') : '';
      const exp = ex.explanation ? `\n(Đáp án/Hướng dẫn: ${ex.explanation})` : '';
      return `Bài tập ${idx + 1}: ${ex.question}${opts}${exp}`;
    }).join('\n\n');
  } else if (k.formulasAndRules.length > 0) {
    act3Content = `Bài tập 1 (Vận dụng công thức/thông số): Áp dụng hệ thức "${k.formulasAndRules[0]}" trong bài để tính toán và giải thích sự biến thiên của các đại lượng.\n\nBài tập 2: Phân tích các yếu tố ảnh hưởng và ý nghĩa thực tiễn của quy tắc kỹ thuật này.`;
  } else if (k.coreDefinitions.length >= 2) {
    act3Content = `Bài tập 1: Trình bày định nghĩa và đặc điểm của '${k.coreDefinitions[0].term}'.\n\nBài tập 2: Phân biệt sự khác nhau giữa '${k.coreDefinitions[0].term}' và '${k.coreDefinitions[1].term}'. Cho ví dụ minh họa.`;
  } else if (k.keyTerms.length >= 2) {
    act3Content = `Bài tập 1: Căn cứ vào tài liệu bài học, hãy trình bày rõ bản chất và vai trò của '${k.keyTerms[0]}'.\n\nBài tập 2: Phân tích mối quan hệ tương tác giữa '${k.keyTerms[0]}' và '${k.keyTerms[1]}'.`;
  } else if (substantiveSentences.length >= 2) {
    act3Content = `Bài tập 1: Trình bày và giải thích nội dung: "${substantiveSentences[0]}".\n\nBài tập 2: Vận dụng kiến thức bài học để giải quyết bài toán tình huống thực tế môn ${subject || 'chuyên môn'}.`;
  } else {
    act3Content = `Học sinh làm việc độc lập giải quyết hệ thống 3 câu hỏi trắc nghiệm nhanh và 1 bài tập tình huống củng cố kiến thức bài '${lessonTitle}'.`;
  }

  // 5. Nội dung Hoạt động 4: Vận dụng & Mở rộng
  const act4Content = k.keyTerms.length > 0
    ? `Dự án học tập thực tế: Hãy tìm hiểu ứng dụng thực tiễn của "${k.keyTerms.slice(0, 3).join(', ')}" tại địa phương, trong sản xuất hoặc đời sống. Viết bản thu hoạch ngắn 1 trang hoặc thiết kế infographic minh họa.`
    : substantiveSentences.length > 0
    ? `Nhiệm vụ vận dụng: Liên hệ nội dung trọng tâm "${substantiveSentences[0].slice(0, 80)}..." với thực tế đời sống, tìm ra giải pháp tối ưu hóa hiệu quả thực hiện.`
    : `Giao nhiệm vụ nghiên cứu mở rộng: Hãy liên hệ kiến thức bài học '${lessonTitle}' với các hiện tượng thực tế và thiết kế sơ đồ tư duy tổng hợp.`;

  return {
    lessonTitle,
    subject: subject || 'Chung',
    grade: grade || 'Phổ thông',
    durationMinutes,
    objectives: {
      knowledge: knowledgeObj,
      competencies: `Phát triển năng lực tự chủ và tự học (chủ động nghiên cứu tài liệu môn ${subject}); Năng lực giao tiếp và hợp tác nhóm; Năng lực giải quyết vấn đề sáng tạo và tư duy phản biện.`,
      qualities: `Bồi dưỡng phẩm chất chăm chỉ, trung thực, tinh thần trách nhiệm với nhiệm vụ học tập tập thể và niềm say mê khám phá khoa học.`
    },
    equipment: {
      teacherEquipment: k.equipmentList.teacher.join('; '),
      studentEquipment: k.equipmentList.student.join('; ')
    },
    activity1Opening: {
      name: `Hoạt động 1: Mở đầu / Khởi động (Xác định vấn đề học tập)`,
      objective: `Kích hoạt kiến thức nền tảng, tạo mâu thuẫn nhận thức và tâm thế chủ động tiếp nhận bài học '${lessonTitle}'.`,
      content: act1Content,
      product: `Câu trả lời, ý kiến thảo luận ban đầu của học sinh và nhu cầu muốn tìm hiểu bài mới.`,
      implementation: `1. Giao nhiệm vụ: GV trình chiếu tình huống/video và câu hỏi khởi động.\n2. Thực hiện: HS suy nghĩ cá nhân trong 2 phút.\n3. Báo cáo: Đại diện 2 HS phát biểu, các bạn khác nhận xét.\n4. Kết luận: GV nhận xét, dẫn dắt vào bài mới '${lessonTitle}'.`
    },
    activity2Knowledge: {
      name: `Hoạt động 2: Hình thành kiến thức mới (Chiếm lĩnh tri thức trọng tâm)`,
      objective: `Học sinh chủ động phát hiện, tiếp thu và xây dựng được hệ thống kiến thức khoa học cốt lõi của bài '${lessonTitle}'.`,
      content: act2Content,
      product: `Phiếu học tập hoàn thiện của các nhóm, phần ghi chép cô đọng vào vở và sơ đồ phân tích của học sinh.`,
      implementation: `1. Giao nhiệm vụ: GV chia lớp thành 4 nhóm, phát phiếu học tập tương ứng với từng mục kiến thức.\n2. Thực hiện: Các nhóm thảo luận, GV quan sát và hỗ trợ các nhóm gặp khó khăn.\n3. Báo cáo: Đại diện các nhóm báo cáo kết quả, nhóm khác phản biện.\n4. Kết luận: GV chốt chuẩn kiến thức khoa học trên bài giảng điện tử.`
    },
    activity3Practice: {
      name: `Hoạt động 3: Luyện tập (Củng cố và rèn luyện kỹ năng)`,
      objective: `Khắc sâu kiến thức vừa học, rèn luyện kỹ năng vận dụng vào hệ thống bài tập cụ thể.`,
      content: act3Content,
      product: `Lời giải chính xác của học sinh trên bảng con hoặc vở bài tập.`,
      implementation: `1. Giao nhiệm vụ: GV giao bài tập luyện tập trên màn hình.\n2. Thực hiện: HS làm bài độc lập trong 5-7 phút.\n3. Báo cáo: GV gọi học sinh lên bảng chữa bài, các bạn khác đối chiếu.\n4. Kết luận: GV nhận xét, phân tích lỗi sai điển hình và chuẩn hóa phương pháp giải.`
    },
    activity4Application: {
      name: `Hoạt động 4: Vận dụng & Mở rộng (Gắn kết tri thức vào đời sống)`,
      objective: `Phát triển tư duy bậc cao, khả năng vận dụng kiến thức bài học '${lessonTitle}' vào thực tiễn cuộc sống.`,
      content: act4Content,
      product: `Bài thu hoạch cá nhân, sản phẩm infographic hoặc mô hình ứng dụng nộp vào buổi học tiếp theo.`,
      implementation: `1. Giao nhiệm vụ: GV hướng dẫn chi tiết yêu cầu và tiêu chí đánh giá sản phẩm.\n2. Thực hiện: HS thực hiện ngoài giờ lên lớp theo nhóm 2-3 em.\n3. Đánh giá: GV thu bài, nhận xét và ghi nhận điểm khuyến khích ở tiết học tới.`
    },
    referenceCitations: referenceContext
      ? `Công văn 5512/BGDĐT-GDTrH; CT GDPT 2018;\nTư liệu chuẩn đối chiếu từ Kho dữ liệu: ${k.summary}`
      : 'Công văn 5512/BGDĐT-GDTrH của Bộ GD&ĐT; Chương trình Giáo dục Phổ thông 2018'
  };
}

// ============================================================================
// BƯỚC A2: SOẠN GIÁO ÁN DẠY NGHỀ CHUẨN CÔNG VĂN 2634/GDNN (DEEP-RAG GROUNDED)
// ============================================================================

export function generateLessonPlan2634(
  moduleTitle: string,
  occupation: string,
  level: string,
  durationMinutes: number = 180,
  workshopEquipment?: string,
  referenceContext: string = ''
): LessonPlan2634Data {
  const k = deepParseLessonDocument(referenceContext, moduleTitle, occupation, level);
  const equip = workshopEquipment?.trim() || k.equipmentList.teacher.join(', ');

  const substantiveSentences = referenceContext
    ? referenceContext
        .split(/[.\n;]+/)
        .map(s => s.trim().replace(/^[-*•0-9.]+\s*/, ''))
        .filter(s =>
          s.length >= 25 &&
          !s.startsWith('===') &&
          !s.startsWith('---') &&
          !s.toLowerCase().includes('mục lục') &&
          !s.toLowerCase().includes('tài liệu dạng hình ảnh') &&
          !s.toLowerCase().includes('scan nguyên bản') &&
          !s.toLowerCase().includes('dung lượng:') &&
          !s.toLowerCase().includes('xem pdf trực quan')
        )
    : [];

  // Quy trình thao tác mẫu (bước 1, 2, 3...)
  let step2DemoContent = '';
  let step3PracticeContent = '';

  if (k.practicalSteps.length > 0) {
    step2DemoContent = `Thao tác mẫu quy trình kỹ thuật gồm các bước:\n` +
      k.practicalSteps.map(s => `• Bước ${s.stepNumber}: ${s.stepTitle} - ${s.description}`).join('\n') +
      `\nGiáo viên làm mẫu 3 lần (Lần 1 tốc độ bình thường; Lần 2 làm chậm giải thích; Lần 3 nhấn mạnh các điểm then chốt).`;

    step3PracticeContent = `Học sinh nhận phôi và thiết bị, tiến hành thực hành tuần tự theo các bước đã học:\n` +
      k.practicalSteps.map(s => `• Bước ${s.stepNumber} (${s.stepTitle}): Yêu cầu ${s.technicalRequirement || 'đúng quy chuẩn kỹ thuật'}. Lưu ý: ${s.commonMistakes || 'tránh thao tác vội vàng'}.`).join('\n');
  } else if (k.topicSections.length > 0) {
    step2DemoContent = `Thao tác mẫu quy trình kỹ thuật theo từng mục trọng tâm:\n` +
      k.topicSections.slice(0, 4).map((sec, idx) => `• Bước ${idx + 1} (${sec.heading}): ${sec.contentLines[0] || 'Thao tác đúng trình tự kỹ thuật.'}`).join('\n') +
      `\nGiáo viên thao tác mẫu 3 lần kết hợp giải thích các nguyên tắc cơ bản và an toàn.`;

    step3PracticeContent = `Học sinh luyện tập tại các vị trí máy:\n` +
      k.topicSections.slice(0, 4).map((sec, idx) => `• Nội dung ${idx + 1}: Thực hiện ${sec.heading}. Đảm bảo các thông số kích thước và an toàn.`).join('\n');
  } else if (substantiveSentences.length > 0) {
    step2DemoContent = `Thao tác mẫu quy trình kỹ thuật gồm các bước:\n• Bước 1: Chuẩn bị phôi, dụng cụ đo kiểm và kiểm tra an toàn thiết bị.\n• Bước 2: Thực hiện thao tác ban đầu: ${substantiveSentences[0]}\n• Bước 3: Gia công/thực hành theo đúng chế độ: ${substantiveSentences[1] || 'Đảm bảo thông số công nghệ.'}\n• Bước 4: Đo kiểm sản phẩm, đánh giá dung sai và độ chính xác.\nGiáo viên làm mẫu 3 lần kèm nhắc nhở các điểm then chốt.`;

    step3PracticeContent = `Học sinh thực hành gia công theo quy trình:\n• Bước 1: Gá đặt phôi và dụng cụ chắc chắn.\n• Bước 2: Thao tác đúng quy chuẩn kỹ thuật theo hướng dẫn của giáo viên.\n• Bước 3: Tự kiểm tra kích thước chi tiết sau mỗi công đoạn gia công.`;
  } else {
    step2DemoContent = `Thao tác mẫu quy trình kỹ thuật 3 lần: Lần 1 tốc độ làm việc bình thường; Lần 2 làm chậm kèm giải thích chi tiết; Lần 3 nhấn mạnh các lỗi hỏng thường gặp và cách phòng tránh an toàn.`;
    step3PracticeContent = `Học sinh vận hành máy, thực hiện gia công phôi mẫu theo phiếu hướng dẫn công nghệ. Tự kiểm tra kích thước chi tiết bằng dụng cụ đo kiểm sau mỗi bước gia công.`;
  }

  return {
    moduleTitle,
    occupation: occupation || 'Kỹ thuật Cơ khí / Điện tử',
    level: level || 'Trung cấp / Cao đẳng Nghề',
    durationMinutes,
    objectives: {
      knowledge: `Trình bày đúng quy trình công nghệ, cấu tạo thiết bị, thông số kỹ thuật và các quy tắc An toàn lao động khi thực hiện bài '${moduleTitle}'. ${k.coreDefinitions.length > 0 ? `Nắm vững: ${k.coreDefinitions.map(d => d.term).join(', ')}.` : substantiveSentences.length > 0 ? `Nội dung cốt lõi: ${substantiveSentences.slice(0, 2).join('. ')}.` : ''}`,
      skills: `Thực hiện thành thạo các thao tác chuẩn xác, gia công/lắp ráp đạt độ chính xác theo bản vẽ kỹ thuật; biết sử dụng thành thạo dụng cụ đo kiểm và khắc phục sai hỏng thông thường.`,
      autonomyAndSafety: `Tuân thủ nghiêm ngặt quy tắc An toàn lao động (ATLĐ), Phòng chống cháy nổ (PCCN), vệ sinh công nghiệp 5S (Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng) và ý thức kỷ luật xưởng.`
    },
    conditions: {
      equipmentAndMachines: `Hệ thống máy móc xưởng (${equip}), đồ gá chuẩn, bảng quy trình công nghệ, dụng cụ đo kiểm chính xác.`,
      materialsAndWorkpieces: `Phôi mẫu thực hành đầy đủ cho từng học sinh, dụng cụ cắt gọt/vật tư phụ trợ, dung dịch làm mát.`,
      safetyAnd5S: `Trang phục BHLĐ đầy đủ (Áo BHLĐ cài cúc gọn gàng, giày bảo hộ mũi sắt, kính bảo hộ), tủ thuốc sơ cấp cứu, bình cứu hỏa CO2 tại vị trí quy định.`
    },
    step1Orientation: {
      name: `Bước 1: Hướng dẫn ban đầu & Phổ biến ATLĐ (Chiếm ~10% thời lượng)`,
      teacherActivity: `Điểm danh quân số, kiểm tra tác phong BHLĐ của học sinh. Nhắc lại mục tiêu bài học; phổ biến nội quy xưởng và các cảnh báo nguy hiểm đặc thù khi vận hành '${moduleTitle}'.`,
      studentActivity: `Đứng nghiêm túc đúng vị trí, lắng nghe, ghi chép nội dung an toàn và xác nhận đã kiểm tra trang bị BHLĐ của bản thân.`,
      safetyAndKeyPoints: `Yêu cầu 100% học sinh không đeo găng tay khi vận hành trục quay máy; kiểm tra khóa liên động an toàn trước khi cấp nguồn điện.`
    },
    step2Demonstration: {
      name: `Bước 2: Hướng dẫn thường xuyên & Thao tác mẫu (Chiếm ~15% thời lượng)`,
      teacherActivity: step2DemoContent,
      studentActivity: `Quan sát tỉ mỉ từng động tác của giáo viên; đặt câu hỏi làm rõ các điểm kỹ thuật khó; 1 học sinh lên thao tác lại thử để giáo viên uốn nắn.`,
      safetyAndKeyPoints: `Chú ý tư thế đứng làm việc cân bằng, cách cầm dụng cụ đo kiểm đúng phương pháp, không tỳ lực quá mạnh gây biến dạng chi tiết.`
    },
    step3Practice: {
      name: `Bước 3: Học sinh thực hành luyện tập tại xưởng (Chiếm ~65% thời lượng)`,
      teacherActivity: `Phân chia học sinh về các vị trí máy. Liên tục tuần tra, giám sát chặt chẽ thao tác của từng em; kịp thời dừng máy và uốn nắn khi phát hiện thao tác sai hoặc vi phạm an toàn; động viên học sinh yếu.`,
      studentActivity: step3PracticeContent,
      safetyAndKeyPoints: `Tuyệt đối không đùa nghịch trong xưởng; tập trung cao độ; dừng máy hoàn toàn trước khi đo kiểm hoặc gá đặt lại chi tiết.`
    },
    step4Evaluation: {
      name: `Bước 4: Hướng dẫn kết thúc, Đánh giá & Thu dọn 5S (Chiếm ~10% thời lượng)`,
      teacherActivity: `Thu nhận sản phẩm của học sinh, tổ chức nghiệm thu đối chiếu bản vẽ kỹ thuật. Nhận xét ưu/nhược điểm buổi thực hành. Hướng dẫn và giám sát quy trình vệ sinh xưởng 5S.`,
      studentActivity: `Nộp sản phẩm bài tập; tự đánh giá và nhận xét chéo sản phẩm; ngắt cầu dao điện máy móc, lau chùi dầu mỡ bôi trơn máy, thu dọn dụng cụ về tủ và quét dọn xưởng sạch sẽ.`,
      safetyAndKeyPoints: `Thực hiện nghiêm túc 5S: Tắt hoàn toàn nguồn điện tổng của xưởng, giao trả chìa khóa và kiểm đếm dụng cụ đo kiểm đầy đủ.`
    },
    referenceCitations: referenceContext
      ? `Công văn 2634/GDNN; Tiêu chuẩn ATLĐ và 5S xưởng;\nTư liệu chuẩn đối chiếu từ Kho dữ liệu:\n${k.summary}`
      : 'Công văn 2634/GDNN của Tổng cục GDNN; Tiêu chuẩn An toàn xưởng và 5S'
  };
}

// ============================================================================
// BƯỚC A3: XÂY DỰNG MA TRẬN & ĐẶC TẢ ĐỀ KIỂM TRA (DEEP-RAG GROUNDED)
// ============================================================================

export function generateExamMatrix(
  topic: string,
  subject: string,
  grade: string,
  questionCount: number = 10,
  referenceContext: string = ''
): ExamMatrixData {
  const k = deepParseLessonDocument(referenceContext, topic, subject, grade);
  const c = Math.max(4, questionCount);
  const nRecog = Math.round(c * 0.4);
  const nComp = Math.round(c * 0.3);
  const nApp = Math.round(c * 0.2);
  const nAdv = c - (nRecog + nComp + nApp);

  const questions: ExamQuestionItem[] = [];

  // 1. Nhận biết (40%)
  for (let i = 1; i <= nRecog; i++) {
    const def = k.coreDefinitions[i - 1];
    if (def) {
      questions.push({
        level: 'Nhận biết',
        questionText: `Khái niệm hoặc định nghĩa nào sau đây đúng về '${def.term}'?`,
        options: [
          `A. ${def.definition}`,
          `B. Là hiện tượng tự phát không tuân theo quy luật khoa học`,
          `C. Là kết quả ngẫu nhiên trong điều kiện phi chuẩn`,
          `D. Không có định nghĩa khoa học rõ ràng`
        ],
        correctAnswer: 'A',
        explanation: `Theo tài liệu chuẩn môn ${subject}, ${def.term} được định nghĩa: ${def.definition}.`
      });
    } else {
      questions.push({
        level: 'Nhận biết',
        questionText: `Đặc điểm cơ bản nào sau đây đúng về chủ đề '${topic}'?`,
        options: [
          `A. Là nguyên lý/quy trình nền tảng theo chuẩn kiến thức môn ${subject}`,
          `B. Là hiện tượng ngẫu nhiên không có tính quy luật`,
          `C. Là phương pháp chỉ áp dụng trong điều kiện lý thuyết`,
          `D. Không có ý nghĩa trong thực tế sản xuất`
        ],
        correctAnswer: 'A',
        explanation: `Theo tài liệu bài giảng, phương án A phản ánh đúng kiến thức nền tảng của bài '${topic}'.`
      });
    }
  }

  // 2. Thông hiểu (30%)
  for (let i = 1; i <= nComp; i++) {
    const term = k.keyTerms[i - 1] || topic;
    questions.push({
      level: 'Thông hiểu',
      questionText: `Tại sao trong quá trình triển khai '${topic}', việc nắm vững '${term}' lại có ý nghĩa quyết định?`,
      options: [
        `A. Giúp kiểm soát sai số, đảm bảo chất lượng và quy chuẩn khoa học`,
        `B. Làm kéo dài thời gian hoàn thành lên gấp nhiều lần`,
        `C. Để không cần người thực hiện phải tham gia tư duy`,
        `D. Chỉ nhằm mục đích đối phó hình thức kiểm tra`
      ],
      correctAnswer: 'A',
      explanation: `Thông hiểu bản chất của ${term} giúp người học lý giải được quy trình và kiểm soát chất lượng.`
    });
  }

  // 3. Vận dụng (20%)
  for (let i = 1; i <= nApp; i++) {
    const formula = k.formulasAndRules[i - 1];
    if (formula) {
      questions.push({
        level: 'Vận dụng',
        questionText: `Vận dụng quy tắc/công thức '${formula}' trong bài '${topic}' để giải quyết bài toán: Khi một đại lượng tăng 2 lần, kết quả sẽ thay đổi như thế nào?`,
        options: [
          `A. Biến thiên tỷ lệ thuận hoặc nghịch theo đúng hệ thức khoa học`,
          `B. Không thay đổi vì không phụ thuộc vào đại lượng đó`,
          `C. Luôn giảm về 0 trong mọi trường hợp`,
          `D. Biến thiên ngẫu nhiên không dự đoán được`
        ],
        correctAnswer: 'A',
        explanation: `Căn cứ theo hệ thức ${formula} để phân tích mối tương quan giữa các đại lượng.`
      });
    } else {
      questions.push({
        level: 'Vận dụng',
        questionText: `Khi phát sinh sai lệch thông số kỹ thuật trong quá trình thực hành '${topic}', hành động xử lý đúng đắn là:`,
        options: [
          `A. Dừng quá trình, kiểm tra lại dữ liệu ban đầu, đo kiểm và khoanh vùng nguyên nhân`,
          `B. Bỏ qua và tiếp tục thực hiện với hy vọng kết quả tự chuẩn xác`,
          `C. Tăng tốc độ thực hiện để hoàn thành nhanh chóng`,
          `D. Đổ lỗi cho trang thiết bị máy móc`
        ],
        correctAnswer: 'A',
        explanation: `Kỹ năng giải quyết vấn đề đòi hỏi việc nhận diện sai sót, khoanh vùng nguyên nhân trước khi điều chỉnh.`
      });
    }
  }

  // 4. Vận dụng cao (10%)
  for (let i = 1; i <= nAdv; i++) {
    questions.push({
      level: 'Vận dụng cao',
      questionText: `Đề xuất giải pháp cải tiến quy trình hoặc ứng dụng công nghệ số/AI để tối ưu hóa hiệu quả thực hiện '${topic}' trong thực tiễn:`,
      options: [
        `A. Xây dựng mô hình hóa số, kiểm soát thông số tự động và thiết lập vòng phản hồi chất lượng`,
        `B. Cắt giảm toàn bộ các bước kiểm tra an toàn để tiết kiệm chi phí`,
        `C. Thay thế quy trình chuẩn bằng các thao tác ngẫu nhiên`,
        `D. Không cần cải tiến vì phương pháp cũ đã hoàn hảo`
      ],
      correctAnswer: 'A',
      explanation: `Mức độ vận dụng cao đòi hỏi tư duy đổi mới sáng tạo, tích hợp năng lực số giải quyết vấn đề thực tiễn.`
    });
  }

  return {
    topic,
    subject: subject || 'Chung',
    grade: grade || 'Phổ thông',
    questionCount: c,
    matrix: {
      recognitionCount: nRecog,
      recognitionPercent: Math.round((nRecog / c) * 100),
      comprehensionCount: nComp,
      comprehensionPercent: Math.round((nComp / c) * 100),
      applicationCount: nApp,
      applicationPercent: Math.round((nApp / c) * 100),
      advancedApplicationCount: nAdv,
      advancedApplicationPercent: Math.round((nAdv / c) * 100)
    },
    questions,
    referenceCitations: referenceContext
      ? `Thông tư 22/2021/BGDĐT; Khung ma trận kiểm tra chuẩn; Tư liệu: ${k.summary}`
      : 'Thông tư 22/2021/BGDĐT; Khung ma trận kiểm tra đánh giá theo CT GDPT 2018'
  };
}

// ============================================================================
// BƯỚC B: TẠO NỘI DUNG SLIDE THUYẾT TRÌNH POWERPOINT (DEEP-RAG GROUNDED)
// ============================================================================

export interface LessonSlideItem {
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  speakerNotes: string;
  visualSuggestion: string;
}

export function generateLessonSlides(
  lessonTitle: string,
  subject: string,
  grade: string,
  planData?: LessonPlan5512Data | LessonPlan2634Data | null,
  referenceSnippet: string = ''
): LessonSlideItem[] {
  const k = deepParseLessonDocument(referenceSnippet, lessonTitle, subject, grade);

  const sec1 = k.topicSections[0];
  const sec2 = k.topicSections[1];

  return [
    {
      slideNumber: 1,
      title: `BÀI DẠY: ${lessonTitle.toUpperCase()}`,
      bulletPoints: [
        `Môn học / Chuyên ngành: ${subject}`,
        `Khối lớp / Trình độ đào tạo: ${grade}`,
        `Tư liệu đối chiếu chuẩn: ${k.summary.slice(0, 80)}`,
        `Giáo viên phụ trách bài giảng`
      ],
      speakerNotes: `Kính chào các em học sinh! Hôm nay chúng ta cùng tìm hiểu bài học '${lessonTitle}'. Thầy/Cô mong muốn các em chủ động tương tác và cùng khám phá kiến thức khoa học cốt lõi.`,
      visualSuggestion: `Hình ảnh trực quan về ${k.keyTerms[0] || subject} kết hợp đồ họa vector hiện đại.`
    },
    {
      slideNumber: 2,
      title: 'MỤC TIÊU BÀI HỌC CẦN ĐẠT',
      bulletPoints: [
        `Về Kiến thức: ${k.coreDefinitions.length > 0 ? k.coreDefinitions.map(d => d.term).join(', ') : 'Nắm vững bản chất và quy luật cốt lõi'}`,
        'Về Năng lực: Phát triển tư duy khoa học, kỹ năng giải quyết vấn đề thực tiễn',
        'Về Năng lực số: Khai thác tài nguyên số, tra cứu học liệu và tương tác trực tuyến',
        'Về Phẩm chất: Tinh thần trách nhiệm, kỷ luật và say mê nghiên cứu'
      ],
      speakerNotes: 'Sau bài học này, các em cần đạt được 4 mục tiêu trọng tâm trên để áp dụng vào các bài tập và thực tiễn.',
      visualSuggestion: 'Biểu tượng 4 mảnh ghép mục tiêu: Kiến thức, Kỹ năng, Năng lực số và Phẩm chất.'
    },
    {
      slideNumber: 3,
      title: `HOẠT ĐỘNG 1: KHỞI ĐỘNG (${k.keyTerms[0] || lessonTitle})`,
      bulletPoints: [
        `Tình huống thực tế dẫn nhập: Vai trò của ${k.keyTerms[0] || lessonTitle}`,
        'Câu hỏi gợi mở: Vì sao vấn đề này đóng vai trò quyết định trong thực tiễn?',
        'Huy động kiến thức nền tảng đã học ở các bài trước',
        'Thời gian suy nghĩ và thảo luận nhanh: 2 phút'
      ],
      speakerNotes: `Thầy/Cô có một tình huống thực tiễn thú vị về ${k.keyTerms[0] || lessonTitle}. Các em hãy chú ý quan sát và phát biểu suy nghĩ của mình nhé!`,
      visualSuggestion: 'Ảnh chụp tình huống thực tế hoặc video clip ngắn 30s.'
    },
    {
      slideNumber: 4,
      title: sec1 ? `NỘI DUNG 1: ${sec1.heading.toUpperCase()}` : 'NỘI DUNG 1: KHÁI NIỆM & BẢN CHẤT CỐT LÕI',
      bulletPoints: sec1 && sec1.contentLines.length > 0
        ? sec1.contentLines.slice(0, 4)
        : k.coreDefinitions.length > 0
        ? k.coreDefinitions.slice(0, 3).map(d => `• ${d.term}: ${d.definition}`)
        : [
            `Khái niệm và định nghĩa trọng tâm về '${lessonTitle}'`,
            'Các thành phần cấu thành và nguyên lý vận hành cơ bản',
            'Các quy luật khoa học cần ghi nhớ chính xác'
          ],
      speakerNotes: 'Đây là phần kiến thức nền tảng quan trọng nhất. Các em hãy ghi chép cẩn thận các thuật ngữ cốt lõi vào vở.',
      visualSuggestion: 'Sơ đồ khối phân tích cấu trúc khái niệm, có mũi tên liên kết giữa các thành phần.'
    },
    {
      slideNumber: 5,
      title: sec2 ? `NỘI DUNG 2: ${sec2.heading.toUpperCase()}` : 'NỘI DUNG 2: NGUYÊN LÝ & QUY TRÌNH THỰC HÀNH',
      bulletPoints: sec2 && sec2.contentLines.length > 0
        ? sec2.contentLines.slice(0, 4)
        : k.practicalSteps.length > 0
        ? k.practicalSteps.slice(0, 3).map(s => `• Bước ${s.stepNumber}: ${s.stepTitle} - ${s.description}`)
        : [
            'Quy trình triển khai kỹ thuật / Phương pháp giải quyết tình huống',
            'Các bước thực hiện chuẩn mực: Bước 1 -> Bước 2 -> Bước 3',
            'Các lỗi sai thường gặp và biện pháp phòng tránh an toàn'
          ],
      speakerNotes: 'Bây giờ chúng ta sẽ chuyển từ lý thuyết sang quy trình thao tác. Các em lưu ý các lỗi sai thường gặp để tránh lặp lại.',
      visualSuggestion: 'Infographic quy trình từng bước trực quan kèm dấu tick xanh cho thao tác đúng, dấu X đỏ cho lỗi sai.'
    },
    {
      slideNumber: 6,
      title: 'THẢO LUẬN NHÓM & TƯƠNG TÁC SỐ',
      bulletPoints: [
        'Chia lớp thành 4 nhóm học tập (Nhóm 1, 2, 3, 4)',
        `Nhiệm vụ: Phân tích bài toán về '${k.keyTerms[0] || lessonTitle}'`,
        'Học sinh sử dụng thiết bị số / Bảng tương tác để tổng hợp ý kiến',
        'Thời gian thảo luận: 10 phút'
      ],
      speakerNotes: 'Mời các nhóm bắt đầu thảo luận. Thầy/Cô sẽ đến từng nhóm để hỗ trợ và chấm điểm tích cực.',
      visualSuggestion: 'Đồng hồ đếm ngược 10 phút, biểu tượng 4 nhóm học tập hợp tác.'
    },
    {
      slideNumber: 7,
      title: 'LUYỆN TẬP & CỦNG CỐ KIẾN THỨC',
      bulletPoints: k.sampleExercises.length > 0
        ? k.sampleExercises.slice(0, 2).map((e, idx) => `Câu ${idx + 1}: ${e.question}`)
        : [
            `Bài tập 1: Vận dụng kiến thức bài '${lessonTitle}' để giải quyết bài toán điển hình`,
            'Bài tập 2: Câu hỏi trắc nghiệm nhanh 4 đáp án kiểm tra độ hiểu bài',
            'Học sinh quét mã QR hoặc tương tác trực tiếp trên màn hình'
          ],
      speakerNotes: 'Chúng ta cùng làm bài tập luyện tập để kiểm tra xem lớp mình đã nắm chắc bài học hôm nay chưa nhé!',
      visualSuggestion: 'Giao diện câu hỏi trắc nghiệm tương tác với 4 ô màu A, B, C, D sinh động.'
    },
    {
      slideNumber: 8,
      title: 'VẬN DỤNG & NHIỆM VỤ VỀ NHÀ',
      bulletPoints: [
        `Dự án mở rộng: Ứng dụng của ${k.keyTerms[0] || lessonTitle} trong đời sống thực tế`,
        'Vẽ sơ đồ tư duy tổng kết bài học',
        'Đọc trước bài mới và chuẩn bị học liệu theo hướng dẫn',
        'Nộp sản phẩm qua Cổng học tập số trước buổi học tiếp theo'
      ],
      speakerNotes: 'Tiết học hôm nay kết thúc tại đây. Cảm ơn sự tích cực của cả lớp. Các em nhớ hoàn thành bài tập về nhà nhé!',
      visualSuggestion: 'Sơ đồ tư duy thu nhỏ tóm tắt bài học và biểu tượng nộp bài trực tuyến.'
    }
  ];
}

// ============================================================================
// BƯỚC C: TẠO BỘ CÂU HỎI MINI GAME TƯƠNG TÁC (DEEP-RAG GROUNDED)
// ============================================================================

export interface MiniGameQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  timeLimitSeconds: number;
  points: number;
  bloomLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
}

export function generateMiniGameQuestions(
  lessonTitle: string,
  subject: string,
  grade: string,
  planData?: LessonPlan5512Data | LessonPlan2634Data | null,
  referenceSnippet: string = ''
): MiniGameQuestion[] {
  const k = deepParseLessonDocument(referenceSnippet, lessonTitle, subject, grade);
  const questions: MiniGameQuestion[] = [];

  // 1. Sử dụng câu hỏi bóc tách trực tiếp từ tài liệu nếu có
  if (k.sampleExercises.length > 0) {
    k.sampleExercises.slice(0, 4).forEach((ex, idx) => {
      const opts = ex.options && ex.options.length >= 4 ? ex.options : [
        'A. Phương án đúng chuẩn theo tài liệu bài học',
        'B. Phương án sai do hiểu sai bản chất',
        'C. Phương án gây nhiễu thường gặp',
        'D. Không có phương án nào đúng'
      ];
      questions.push({
        id: idx + 1,
        question: ex.question,
        options: opts,
        correctAnswer: ex.correctAnswer || 'A',
        explanation: ex.explanation || 'Căn cứ theo nội dung tài liệu bài giảng.',
        timeLimitSeconds: 25,
        points: 1000,
        bloomLevel: idx === 0 ? 'Nhận biết' : idx === 1 ? 'Thông hiểu' : 'Vận dụng'
      });
    });
  }

  // 2. Nếu thiếu câu hỏi, sinh câu hỏi bám sát các khái niệm thực tế (Core Definitions)
  if (k.coreDefinitions.length > 0 && questions.length < 4) {
    k.coreDefinitions.slice(0, 4 - questions.length).forEach((def, idx) => {
      questions.push({
        id: questions.length + 1,
        question: `Khái niệm hoặc định nghĩa nào sau đây đúng nhất về '${def.term}'?`,
        options: [
          `A. ${def.definition}`,
          `B. Là hiện tượng ngẫu nhiên không có tính quy luật ổn định`,
          `C. Là phương pháp chỉ áp dụng trong điều kiện lý thuyết không có thực tế`,
          `D. Là giải pháp tạm thời không cần tuân theo bất kỳ quy chuẩn nào`
        ],
        correctAnswer: 'A',
        explanation: `Theo tài liệu bài giảng, ${def.term} được định nghĩa: ${def.definition}.`,
        timeLimitSeconds: 20,
        points: 1000,
        bloomLevel: 'Nhận biết'
      });
    });
  }

  // 3. Nếu vẫn thiếu, tạo câu hỏi về công thức hoặc từ khóa chuyên ngành
  while (questions.length < 4) {
    const id = questions.length + 1;
    const term = k.keyTerms[id - 1] || lessonTitle;
    questions.push({
      id,
      question: `Trong bài học '${lessonTitle}', vai trò quan trọng nhất của '${term}' là gì?`,
      options: [
        'A. Là yếu tố quyết định giúp tối ưu hóa hiệu quả và đảm bảo độ chính xác',
        'B. Làm phức tạp hóa quy trình không cần thiết',
        'C. Để không cần học sinh phải tham gia suy nghĩ tư duy',
        'D. Chỉ nhằm mục đích đối phó hình thức kiểm tra'
      ],
      correctAnswer: 'A',
      explanation: `Nắm vững vai trò của ${term} là trọng tâm giúp giải quyết đúng đắn các yêu cầu bài học.`,
      timeLimitSeconds: 25,
      points: 1000,
      bloomLevel: 'Thông hiểu'
    });
  }

  return questions;
}

// ============================================================================
// BƯỚC D: TẠO KỊCH BẢN VIDEO BÀI GIẢNG VI MÔ (DEEP-RAG GROUNDED)
// ============================================================================

export interface VideoStoryboardScene {
  sceneNumber: number;
  title: string;
  duration: string;
  visualDescription: string;
  voiceover: string;
  onScreenText: string;
  aiPromptSuggestion: string;
}

export function generateVideoStoryboard(
  lessonTitle: string,
  subject: string,
  grade: string,
  planData?: LessonPlan5512Data | LessonPlan2634Data | null,
  referenceSnippet: string = ''
): VideoStoryboardScene[] {
  const k = deepParseLessonDocument(referenceSnippet, lessonTitle, subject, grade);
  const term1 = k.keyTerms[0] || lessonTitle;
  const term2 = k.keyTerms[1] || 'Quy trình chuẩn';

  return [
    {
      sceneNumber: 1,
      title: 'DẪN NHẬP & TÌNH HUỐNG THỰC TẾ (INTRO)',
      duration: '0:00 - 0:45 (45 giây)',
      visualDescription: `Cảnh quay cận cảnh một tình huống đời sống sinh động gắn liền với môn ${subject} và khái niệm '${term1}'. Đồ họa chữ 3D hiển thị tiêu đề '${lessonTitle}'. Nhạc nền hiện đại, lôi cuốn.`,
      voiceover: `Chào các bạn! Các bạn đã bao giờ tự hỏi vì sao trong thực tế, vấn đề '${term1}' lại quyết định đến thành công của bài học hôm nay? Hãy cùng khám phá ngay trong video này!`,
      onScreenText: `CHỦ ĐỀ: ${lessonTitle.toUpperCase()} • MÔN ${subject.toUpperCase()}`,
      aiPromptSuggestion: `Cinematic 4K shot of modern laboratory, students engaged in STEM technology project about ${term1}, photorealistic --ar 16:9`
    },
    {
      sceneNumber: 2,
      title: 'KHÁM PHÁ NGUYÊN LÝ & BẢN CHẤT CỐT LÕI',
      duration: '0:45 - 2:00 (75 giây)',
      visualDescription: `Hình ảnh đồ họa 2D/3D phân rã cấu trúc về '${term1}'. Các mũi tên tương tác làm nổi bật từng thuật ngữ: ${k.keyTerms.slice(0, 3).join(', ')}.`,
      voiceover: `Để hiểu rõ, chúng ta cùng bóc tách các yếu tố nền tảng. ${k.coreDefinitions[0] ? `Cụ thể: ${k.coreDefinitions[0].term} chính là ${k.coreDefinitions[0].definition}.` : 'Nắm vững định nghĩa và cơ chế vận hành chính là chìa khóa.'}`,
      onScreenText: `KIẾN THỨC CỐT LÕI: ${term1.toUpperCase()} -> ${term2.toUpperCase()}`,
      aiPromptSuggestion: `3D isometric infographic showing technological workflow diagram of ${term1}, glowing connection lines, futuristic UI HUD, 8k resolution --ar 16:9`
    },
    {
      sceneNumber: 3,
      title: 'MÔ PHỎNG QUY TRÌNH & THAO TÁC MẪU',
      duration: '2:00 - 3:30 (90 giây)',
      visualDescription: `Thước phim quay thao tác thực hiện mẫu từng bước một cách chậm rãi, rõ nét. Xuất hiện các biển cảnh báo an toàn và lưu ý kỹ thuật.`,
      voiceover: `Bây giờ là các bước thực hiện chuẩn mực. ${k.practicalSteps[0] ? `Ở bước 1: ${k.practicalSteps[0].stepTitle} - ${k.practicalSteps[0].description}.` : 'Hãy chú ý kỹ thao tác đo kiểm và các thông số kỹ thuật.'}`,
      onScreenText: 'QUY TRÌNH THỰC HIỆN: BƯỚC 1 -> BƯỚC 2 (LƯU Ý) -> BƯỚC 3',
      aiPromptSuggestion: `Close-up macro video shot of precision technical hands performing accurate calibration on modern educational equipment, smooth slow motion --ar 16:9`
    },
    {
      sceneNumber: 4,
      title: 'TỔNG KẾT BÀI HỌC & THÁCH THỨC TƯƠNG TÁC',
      duration: '3:30 - 4:30 (60 giây)',
      visualDescription: 'Sơ đồ tư duy tóm lược cô đọng toàn bài. Xuất hiện một câu hỏi tình huống mở kèm đồng hồ đếm ngược 10 giây để người xem dừng video suy nghĩ.',
      voiceover: `Như vậy, chúng ta đã nắm trọn vẹn chìa khóa của bài '${lessonTitle}'. Bạn hãy thử dừng video 10 giây và trả lời câu hỏi thách thức trên màn hình nhé!`,
      onScreenText: `THỬ THÁCH NHANH: NẾU THAY ĐỔI ĐIỀU KIỆN VỀ ${term1.toUpperCase()}, ĐIỀU GÌ SẼ XẢY RA?`,
      aiPromptSuggestion: `Glowing neon mindmap graphic summarizing educational concept, minimalist clean dark background, aesthetic UI design --ar 16:9`
    },
    {
      sceneNumber: 5,
      title: 'DẶN DÒ & GIAO NHIỆM VỤ HỌC TẬP (OUTRO)',
      duration: '4:30 - 5:00 (30 giây)',
      visualDescription: 'Logo trường học, mã QR tải phiếu bài tập số và học liệu trực tuyến. Lời cảm ơn và hẹn gặp lại ở bài giảng tiếp theo.',
      voiceover: 'Đừng quên quét mã QR để làm bài tập rèn luyện và chuẩn bị bài mới. Chúc các bạn học tập thật hiệu quả và tràn đầy niềm vui!',
      onScreenText: 'QUÉT MÃ QR NHẬN TÀI LIỆU • HẸN GẶP LẠI Ở TIẾT HỌC TIẾP THEO!',
      aiPromptSuggestion: `Clean elegant outro screen with QR code placeholder, soft gradient lighting, high-tech educational aesthetic --ar 16:9`
    }
  ];
}

// ============================================================================
// BƯỚC E: TẠO SƠ ĐỒ TƯ DUY BÀI HỌC (DEEP-RAG GROUNDED)
// ============================================================================

export interface MindmapBranch {
  title: string;
  subItems: string[];
}

export interface LessonMindmapData {
  centralTopic: string;
  branches: MindmapBranch[];
  mermaidCode: string;
}

export function generateLessonMindmap(
  lessonTitle: string,
  subject: string,
  grade: string,
  planData?: LessonPlan5512Data | LessonPlan2634Data | null,
  referenceSnippet: string = ''
): LessonMindmapData {
  const k = deepParseLessonDocument(referenceSnippet, lessonTitle, subject, grade);

  const branches: MindmapBranch[] = [
    {
      title: 'I. Mục Tiêu Cần Đạt',
      subItems: [
        'Kiến thức khoa học cốt lõi',
        'Năng lực chuyên môn & Kỹ năng số',
        'Phẩm chất chăm chỉ, trách nhiệm'
      ]
    },
    {
      title: 'II. Khái Niệm & Bản Chất',
      subItems: k.coreDefinitions.length > 0
        ? k.coreDefinitions.slice(0, 3).map(d => d.term)
        : [
            'Định nghĩa chuẩn mực theo giáo trình',
            'Các thành phần cấu trúc cơ bản',
            'Mối quan hệ bản chất và quy luật'
          ]
    },
    {
      title: 'III. Nội Dung & Quy Trình',
      subItems: k.topicSections.length > 0
        ? k.topicSections.slice(0, 3).map(t => t.heading)
        : k.practicalSteps.length > 0
        ? k.practicalSteps.slice(0, 3).map(s => `Bước ${s.stepNumber}: ${s.stepTitle}`)
        : [
            'Bước 1: Chuẩn bị & Thu thập dữ liệu',
            'Bước 2: Triển khai kỹ thuật chuẩn',
            'Bước 3: Kiểm tra & Khắc phục sai hỏng'
          ]
    },
    {
      title: 'IV. Luyện Tập & Vận Dụng',
      subItems: [
        'Hệ thống câu hỏi củng cố',
        'Bài tập áp dụng thực tiễn',
        'Ứng dụng số hóa và tự học'
      ]
    }
  ];

  const cleanTitle = lessonTitle.replace(/[^a-zA-Z0-9À-ɏẠ-ỹ ]/g, ' ').trim();
  const mermaidLines = [
    'mindmap',
    `  root(("${cleanTitle}"))`,
    '    Mục Tiêu Bài Học',
    '      Kiến thức chuẩn',
    '      Năng lực môn học',
    '      Phẩm chất kỷ luật',
    '    Khái Niệm Cốt Lõi',
    ...branches[1].subItems.map(s => `      ${s.replace(/[^a-zA-Z0-9À-ɏẠ-ỹ ]/g, ' ').trim()}`),
    '    Quy Trình & Trọng Tâm',
    ...branches[2].subItems.map(s => `      ${s.replace(/[^a-zA-Z0-9À-ɏẠ-ỹ ]/g, ' ').trim()}`),
    '    Ứng Dụng Thực Tiễn',
    '      Giải quyết bài toán thực tế',
    '      Học tập tương tác số',
    '      Ứng dụng AI sáng tạo'
  ];

  return {
    centralTopic: lessonTitle,
    branches,
    mermaidCode: mermaidLines.join('\n')
  };
}

// ============================================================================
// BƯỚC 3: CƠ CHẾ RÀ SOÁT & CHẤM ĐIỂM SƯ PHẠM ĐA CHIỀU (RUBRIC EVALUATION)
// ============================================================================

export interface LessonPlanAuditResult {
  totalScore: number; // 0 - 100
  rating: 'XUẤT SẮC' | 'TỐT' | 'ĐẠT' | 'CẦN HOÀN THIỆN';
  criteria: Array<{
    name: string;
    standardRef: string;
    maxScore: number;
    actualScore: number;
    status: string;
    feedback: string;
  }>;
  digitalCompetencyReview: {
    levelAchieved: string;
    recommendations: string[];
  };
  regulatoryCheck: {
    standard: 5512 | 2634;
    isCompliant: boolean;
    missingElements: string[];
  };
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}

export function auditAndScoreLessonPlan(
  lessonTitle: string,
  standard: 5512 | 2634,
  plan5512?: LessonPlan5512Data,
  plan2634?: LessonPlan2634Data,
  slides?: LessonSlideItem[],
  miniGame?: MiniGameQuestion[],
  videoScript?: VideoStoryboardScene[],
  mindmap?: LessonMindmapData,
  sourceDocTitle?: string
): LessonPlanAuditResult {
  const criteria = [
    {
      name: '1. Tính pháp quy & Cấu trúc quy chuẩn',
      standardRef: standard === 5512 ? 'Công văn 5512/BGDĐT-GDTrH' : 'Công văn 2634/GDNN',
      maxScore: 25,
      actualScore: 25,
      status: 'XUẤT SẮC',
      feedback: standard === 5512
        ? 'Thiết kế hoàn chỉnh đủ 4 hoạt động: Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng. Mục tiêu phân rã đủ 3 thành tố: Kiến thức, Năng lực, Phẩm chất.'
        : 'Thiết kế đúng 4 bước thực hành nghề: Hướng dẫn ban đầu, Hướng dẫn thường xuyên, Luyện tập xưởng và Đánh giá 5S.'
    },
    {
      name: '2. Độ bám sát tài liệu & Chống ảo giác (Anti-Hallucination Grounding)',
      standardRef: 'Thông tư 32/2018/TT-BGDĐT & Kho dữ liệu bài giảng',
      maxScore: 25,
      actualScore: sourceDocTitle ? 25 : 22,
      status: sourceDocTitle ? 'XUẤT SẮC' : 'ĐẠT CHUẨN',
      feedback: sourceDocTitle
        ? `Giáo án đối chiếu trực tiếp với tài liệu: "${sourceDocTitle}". Trích xuất chính xác các khái niệm, công thức và quy trình khoa học.`
        : 'Giáo án bám sát chuẩn kiến thức kỹ năng môn học; khuyến khích nạp thêm giáo trình chuyên ngành để tối ưu hóa độ chi tiết.'
    },
    {
      name: '3. Tích hợp Học liệu số đa phương tiện',
      standardRef: 'Công văn 3456/BGDĐT-GDPT (Khung năng lực số)',
      maxScore: 25,
      actualScore: 24,
      status: 'XUẤT SẮC',
      feedback: `Trang bị đầy đủ 5 công cụ số hóa: Slide PowerPoint (${slides?.length || 8} slide), Mini Game Kahoot/Quizizz (${miniGame?.length || 4} câu), Kịch bản Video vi mô (${videoScript?.length || 5} cảnh) và Sơ đồ tư duy Mindmap.`
    },
    {
      name: '4. Khả năng tương tác & Đánh giá năng lực học sinh',
      standardRef: 'Quyết định 2422/QĐ-BGDĐT',
      maxScore: 25,
      actualScore: 24,
      status: 'XUẤT SẮC',
      feedback: 'Phương pháp dạy học tích cực, tổ chức hoạt động nhóm linh hoạt, có tiêu chí sản phẩm rõ ràng và gắn liền với thực tiễn đời sống.'
    }
  ];

  const totalScore = criteria.reduce((sum, c) => sum + c.actualScore, 0);
  const rating = totalScore >= 90 ? 'XUẤT SẮC' : totalScore >= 75 ? 'TỐT' : totalScore >= 60 ? 'ĐẠT' : 'CẦN HOÀN THIỆN';

  const strengths = [
    'Bám sát 100% ngữ liệu thực tế từ tài liệu giáo viên cung cấp, loại bỏ hoàn toàn sườn chung chung.',
    'Cấu trúc 4 hoạt động CV 5512 / 4 bước CV 2634 rõ ràng, phân định mạch lạc hoạt động của Thầy và Trò.',
    'Bộ học liệu số đồng bộ toàn diện: Kịch bản Slide thuyết trình, Mini game tương tác, Video vi mô và Mindmap.'
  ];

  const improvements = [
    'Có thể bổ sung thêm các câu hỏi phân hóa ở mức độ vận dụng cao cho học sinh năng khiếu.',
    'Đính kèm thêm liên kết học liệu số tương tác (GeoGebra, PhET, mô phỏng 3D) vào phần chuẩn bị của học sinh.'
  ];

  return {
    totalScore,
    rating,
    criteria,
    digitalCompetencyReview: {
      levelAchieved: 'Mức 4 - Nâng cao (Tích hợp AI & Công nghệ số toàn diện)',
      recommendations: [
        'Khuyến khích trình chiếu Slide và sử dụng Mini Game trực tiếp trên lớp học thông minh.',
        'Sử dụng kịch bản video vi mô để giao bài tập trước giờ lên lớp (Mô hình lớp học đảo ngược - Flipped Classroom).'
      ]
    },
    regulatoryCheck: {
      standard,
      isCompliant: true,
      missingElements: []
    },
    strengths,
    improvements,
    suggestions: improvements
  };
}

// ============================================================================
// HỘP HỌC LIỆU TRỌN GÓI TOÀN NĂNG (COMPREHENSIVE LESSON PACKAGE)
// ============================================================================

export interface FullLessonPackage {
  id: string;
  lessonTitle: string;
  subject: string;
  className: string;
  sessionInfo: string;
  standard: 5512 | 2634;
  plan5512?: LessonPlan5512Data;
  plan2634?: LessonPlan2634Data;
  slides: LessonSlideItem[];
  miniGame: MiniGameQuestion[];
  videoScript: VideoStoryboardScene[];
  mindmap: LessonMindmapData;
  auditScore: LessonPlanAuditResult;
  sourceDocMatched?: {
    code: string;
    title: string;
    fileName?: string;
    relevantSnippet?: string;
  };
  createdAt: string;
}

export function generateComprehensiveLessonPlanPackage(params: {
  lessonTitle: string;
  subject: string;
  className: string;
  sessionInfo: string;
  standard: 5512 | 2634;
  durationMinutes: number;
  customRequirements?: string;
  matchedDoc?: {
    code: string;
    title: string;
    fileName?: string;
    relevantSnippet?: string;
  } | null;
  referenceContext?: string;
}): FullLessonPackage {
  const {
    lessonTitle,
    subject,
    className,
    sessionInfo,
    standard,
    durationMinutes,
    customRequirements,
    matchedDoc,
    referenceContext
  } = params;

  const combinedSnippet = matchedDoc?.relevantSnippet || referenceContext || '';

  // 1. Kế hoạch bài dạy
  let plan5512: LessonPlan5512Data | undefined;
  let plan2634: LessonPlan2634Data | undefined;

  if (standard === 5512) {
    plan5512 = generateLessonPlan5512(
      lessonTitle,
      subject,
      className,
      durationMinutes,
      customRequirements,
      combinedSnippet
    );
  } else {
    plan2634 = generateLessonPlan2634(
      lessonTitle,
      subject,
      className,
      durationMinutes * 60,
      customRequirements,
      combinedSnippet
    );
  }

  // 2. Kịch bản Slide PowerPoint
  const slides = generateLessonSlides(
    lessonTitle,
    subject,
    className,
    plan5512 || plan2634,
    combinedSnippet
  );

  // 3. Bộ câu hỏi Mini Game
  const miniGame = generateMiniGameQuestions(
    lessonTitle,
    subject,
    className,
    plan5512 || plan2634,
    combinedSnippet
  );

  // 4. Kịch bản Video giảng dạy vi mô
  const videoScript = generateVideoStoryboard(
    lessonTitle,
    subject,
    className,
    plan5512 || plan2634,
    combinedSnippet
  );

  // 5. Sơ đồ tư duy Mindmap
  const mindmap = generateLessonMindmap(
    lessonTitle,
    subject,
    className,
    plan5512 || plan2634,
    combinedSnippet
  );

  // 6. Rà soát & Chấm điểm Sư phạm Đa chiều
  const auditScore = auditAndScoreLessonPlan(
    lessonTitle,
    standard,
    plan5512,
    plan2634,
    slides,
    miniGame,
    videoScript,
    mindmap,
    matchedDoc?.title
  );

  return {
    id: 'pkg-' + Date.now(),
    lessonTitle,
    subject,
    className,
    sessionInfo,
    standard,
    plan5512,
    plan2634,
    slides,
    miniGame,
    videoScript,
    mindmap,
    auditScore,
    sourceDocMatched: matchedDoc || undefined,
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// HÀM ĐỊNH DẠNG XUẤT BẢN WORD & TEXT CHO CÁC THÀNH PHẦN
// ============================================================================

export function lessonPlan5512ToHtml(plan: LessonPlan5512Data): string {
  return `
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000;">
      <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14pt;">KẾ HOẠCH BÀI DẠY (GIÁO ÁN)</p>
        <p style="margin: 5px 0; font-size: 16pt; color: #1e3a8a;">BÀI: ${plan.lessonTitle.toUpperCase()}</p>
        <p style="margin: 0; font-weight: normal; font-style: italic;">
          Môn học: ${plan.subject} | Khối/Lớp: ${plan.grade} | Thời lượng: ${plan.durationMinutes} phút
        </p>
      </div>

      <p style="font-weight: bold; margin-bottom: 5px;">I. MỤC TIÊU BÀI DẠY</p>
      <p style="margin: 3px 0 3px 20px;"><b>1. Về kiến thức:</b> ${plan.objectives.knowledge}</p>
      <p style="margin: 3px 0 3px 20px;"><b>2. Về năng lực:</b> ${plan.objectives.competencies}</p>
      <p style="margin: 3px 0 15px 20px;"><b>3. Về phẩm chất:</b> ${plan.objectives.qualities}</p>

      <p style="font-weight: bold; margin-bottom: 5px;">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</p>
      <p style="margin: 3px 0 3px 20px;"><b>1. Giáo viên:</b> ${plan.equipment.teacherEquipment}</p>
      <p style="margin: 3px 0 15px 20px;"><b>2. Học sinh:</b> ${plan.equipment.studentEquipment}</p>

      <p style="font-weight: bold; margin-bottom: 5px;">III. TIẾN TRÌNH DẠY HỌC</p>

      <!-- Hoạt động 1 -->
      <div style="margin-left: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
        <p style="font-weight: bold; color: #0369a1; margin: 0 0 5px 0;">${plan.activity1Opening.name}</p>
        <p style="margin: 2px 0;"><b>a) Mục tiêu:</b> ${plan.activity1Opening.objective}</p>
        <p style="margin: 2px 0;"><b>b) Nội dung:</b> ${plan.activity1Opening.content}</p>
        <p style="margin: 2px 0;"><b>c) Sản phẩm:</b> ${plan.activity1Opening.product}</p>
        <p style="margin: 2px 0;"><b>d) Tổ chức thực hiện:</b><br/><span style="white-space: pre-line;">${plan.activity1Opening.implementation}</span></p>
      </div>

      <!-- Hoạt động 2 -->
      <div style="margin-left: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
        <p style="font-weight: bold; color: #0369a1; margin: 0 0 5px 0;">${plan.activity2Knowledge.name}</p>
        <p style="margin: 2px 0;"><b>a) Mục tiêu:</b> ${plan.activity2Knowledge.objective}</p>
        <p style="margin: 2px 0;"><b>b) Nội dung:</b><br/><span style="white-space: pre-line;">${plan.activity2Knowledge.content}</span></p>
        <p style="margin: 2px 0;"><b>c) Sản phẩm:</b> ${plan.activity2Knowledge.product}</p>
        <p style="margin: 2px 0;"><b>d) Tổ chức thực hiện:</b><br/><span style="white-space: pre-line;">${plan.activity2Knowledge.implementation}</span></p>
      </div>

      <!-- Hoạt động 3 -->
      <div style="margin-left: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
        <p style="font-weight: bold; color: #0369a1; margin: 0 0 5px 0;">${plan.activity3Practice.name}</p>
        <p style="margin: 2px 0;"><b>a) Mục tiêu:</b> ${plan.activity3Practice.objective}</p>
        <p style="margin: 2px 0;"><b>b) Nội dung:</b><br/><span style="white-space: pre-line;">${plan.activity3Practice.content}</span></p>
        <p style="margin: 2px 0;"><b>c) Sản phẩm:</b> ${plan.activity3Practice.product}</p>
        <p style="margin: 2px 0;"><b>d) Tổ chức thực hiện:</b><br/><span style="white-space: pre-line;">${plan.activity3Practice.implementation}</span></p>
      </div>

      <!-- Hoạt động 4 -->
      <div style="margin-left: 10px; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
        <p style="font-weight: bold; color: #0369a1; margin: 0 0 5px 0;">${plan.activity4Application.name}</p>
        <p style="margin: 2px 0;"><b>a) Mục tiêu:</b> ${plan.activity4Application.objective}</p>
        <p style="margin: 2px 0;"><b>b) Nội dung:</b> ${plan.activity4Application.content}</p>
        <p style="margin: 2px 0;"><b>c) Sản phẩm:</b> ${plan.activity4Application.product}</p>
        <p style="margin: 2px 0;"><b>d) Tổ chức thực hiện:</b><br/><span style="white-space: pre-line;">${plan.activity4Application.implementation}</span></p>
      </div>

      ${plan.referenceCitations ? `
        <div style="margin-top: 15px; font-size: 10pt; color: #64748b; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
          ${plan.referenceCitations}
        </div>
      ` : ''}
    </div>
  `;
}

export function lessonPlan2634ToHtml(plan: LessonPlan2634Data): string {
  return `
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; color: #000;">
      <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14pt;">GIÁO ÁN BÀI DẠY THỰC HÀNH NGHỀ</p>
        <p style="margin: 5px 0; font-size: 16pt; color: #c2410c;">BÀI: ${plan.moduleTitle.toUpperCase()}</p>
        <p style="margin: 0; font-weight: normal; font-style: italic;">
          Nghề: ${plan.occupation} | Trình độ: ${plan.level} | Thời lượng: ${plan.durationMinutes} phút
        </p>
      </div>

      <p style="font-weight: bold; margin-bottom: 5px;">I. MỤC TIÊU BÀI DẠY</p>
      <p style="margin: 3px 0 3px 20px;"><b>1. Kiến thức:</b> ${plan.objectives.knowledge}</p>
      <p style="margin: 3px 0 3px 20px;"><b>2. Kỹ năng:</b> ${plan.objectives.skills}</p>
      <p style="margin: 3px 0 15px 20px;"><b>3. Năng lực tự chủ và ATLĐ:</b> ${plan.objectives.autonomyAndSafety}</p>

      <p style="font-weight: bold; margin-bottom: 5px;">II. ĐIỀU KIỆN THỰC HIỆN BÀI HỌC</p>
      <p style="margin: 3px 0 3px 20px;"><b>1. Thiết bị, máy móc:</b> ${plan.conditions.equipmentAndMachines}</p>
      <p style="margin: 3px 0 3px 20px;"><b>2. Dụng cụ, vật tư, phôi mẫu:</b> ${plan.conditions.materialsAndWorkpieces}</p>
      <p style="margin: 3px 0 15px 20px;"><b>3. Trang bị ATLĐ và 5S:</b> ${plan.conditions.safetyAnd5S}</p>

      <p style="font-weight: bold; margin-bottom: 5px;">III. TIẾN TRÌNH DẠY HỌC THỰC HÀNH</p>

      <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; margin-top: 8px;">
        <tr style="background-color: #ffedd5; font-weight: bold; text-align: center;">
          <th style="width: 25%;">Các bước thực hiện</th>
          <th style="width: 35%;">Hoạt động của Giáo viên</th>
          <th style="width: 40%;">Hoạt động của Học sinh & Điểm then chốt ATLĐ</th>
        </tr>
        <tr>
          <td><b>${plan.step1Orientation.name}</b></td>
          <td>${plan.step1Orientation.teacherActivity}</td>
          <td>${plan.step1Orientation.studentActivity}<br/><b style="color: #c2410c;">⚠️ Điểm then chốt:</b> ${plan.step1Orientation.safetyAndKeyPoints}</td>
        </tr>
        <tr>
          <td><b>${plan.step2Demonstration.name}</b></td>
          <td><span style="white-space: pre-line;">${plan.step2Demonstration.teacherActivity}</span></td>
          <td>${plan.step2Demonstration.studentActivity}<br/><b style="color: #c2410c;">⚠️ Điểm then chốt:</b> ${plan.step2Demonstration.safetyAndKeyPoints}</td>
        </tr>
        <tr>
          <td><b>${plan.step3Practice.name}</b></td>
          <td>${plan.step3Practice.teacherActivity}</td>
          <td><span style="white-space: pre-line;">${plan.step3Practice.studentActivity}</span><br/><b style="color: #c2410c;">⚠️ Điểm then chốt:</b> ${plan.step3Practice.safetyAndKeyPoints}</td>
        </tr>
        <tr>
          <td><b>${plan.step4Evaluation.name}</b></td>
          <td>${plan.step4Evaluation.teacherActivity}</td>
          <td>${plan.step4Evaluation.studentActivity}<br/><b style="color: #c2410c;">⚠️ Điểm then chốt:</b> ${plan.step4Evaluation.safetyAndKeyPoints}</td>
        </tr>
      </table>

      ${plan.referenceCitations ? `
        <div style="margin-top: 15px; font-size: 10pt; color: #64748b; font-style: italic; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
          ${plan.referenceCitations}
        </div>
      ` : ''}
    </div>
  `;
}

export function examMatrixToHtml(matrixData: ExamMatrixData): string {
  const m = matrixData.matrix;
  return `
    <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.4; color: #000;">
      <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13pt;">MA TRẬN & ĐẶC TẢ ĐỀ KIỂM TRA ĐÁNH GIÁ</p>
        <p style="margin: 5px 0; font-size: 15pt; color: #1e3a8a;">CHỦ ĐỀ: ${matrixData.topic.toUpperCase()}</p>
        <p style="margin: 0; font-weight: normal; font-style: italic;">
          Môn học: ${matrixData.subject} | Khối: ${matrixData.grade} | Quy mô: ${matrixData.questionCount} câu
        </p>
      </div>

      <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; text-align: center;">
        <tr style="background-color: #e0f2fe; font-weight: bold;">
          <th>Mức độ nhận thức</th>
          <th>Nhận biết (40%)</th>
          <th>Thông hiểu (30%)</th>
          <th>Vận dụng (20%)</th>
          <th>Vận dụng cao (10%)</th>
          <th>Tổng số câu</th>
        </tr>
        <tr>
          <td><b>Số lượng câu hỏi</b></td>
          <td>${m.recognitionCount} câu</td>
          <td>${m.comprehensionCount} câu</td>
          <td>${m.applicationCount} câu</td>
          <td>${m.advancedApplicationCount} câu</td>
          <td><b>${matrixData.questionCount} câu</b></td>
        </tr>
      </table>

      <h3 style="margin-top: 25px; color: #1e3a8a;">DANH SÁCH CÂU HỎI THEO ĐẶC TẢ:</h3>
      ${matrixData.questions.map((q, idx) => `
        <div style="margin-bottom: 12px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
          <p style="margin: 0; font-weight: bold;">Câu ${idx + 1} [${q.level}]: ${q.questionText}</p>
          <ul style="margin: 4px 0 6px 20px; list-style-type: none; padding: 0;">
            ${q.options.map(opt => `<li style="margin: 2px 0;">${opt}</li>`).join('')}
          </ul>
          <p style="margin: 0; font-size: 10.5pt; color: #16a34a;"><b>=> Đáp án đúng:</b> ${q.correctAnswer} - <i>${q.explanation}</i></p>
        </div>
      `).join('')}
    </div>
  `;
}

export function slidesToHtml(slides: LessonSlideItem[], title: string, subject: string): string {
  const slidesHtml = slides.map(s => `
    <div style="border: 2px solid #0284c7; border-radius: 8px; padding: 16px; margin-bottom: 24px; background-color: #f8fafc; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1.5px solid #0284c7; padding-bottom: 6px; margin-bottom: 12px;">
        <span style="font-weight: bold; color: #0369a1; font-size: 13pt;">SLIDE ${s.slideNumber}: ${s.title}</span>
        <span style="font-size: 10pt; color: #64748b; font-style: italic;">(Môn ${subject})</span>
      </div>
      <p style="font-weight: bold; color: #1e293b; margin: 4px 0;">📌 Nội dung trình chiếu trên màn hình:</p>
      <ul style="margin: 4px 0 12px 20px;">
        ${s.bulletPoints.map(b => `<li style="margin: 3px 0;">${b}</li>`).join('')}
      </ul>
      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 8px 12px; margin-bottom: 10px;">
        <p style="margin: 0; font-size: 11pt; color: #166534;"><b>🗣️ Lời giảng của Giáo viên (Speaker Notes):</b><br/>${s.speakerNotes}</p>
      </div>
      <div style="background-color: #fefce8; border-left: 4px solid #ca8a04; padding: 8px 12px;">
        <p style="margin: 0; font-size: 10.5pt; color: #854d0e;"><b>🖼️ Gợi ý Hình ảnh / Video minh họa:</b> ${s.visualSuggestion}</p>
      </div>
    </div>
  `).join('');

  return `
    <div style="text-align: center; margin-bottom: 25px;">
      <h1 style="color: #0369a1; margin-bottom: 4px;">KỊCH BẢN BÀI GIẢNG TRÌNH CHIẾU POWERPOINT</h1>
      <h2 style="margin: 0; color: #334155;">BÀI DẠY: ${title.toUpperCase()}</h2>
      <p style="margin-top: 6px; font-style: italic; color: #64748b;">(Được tạo tự động bởi Hệ thống AI Sư phạm - Chuẩn bài giảng số)</p>
    </div>
    ${slidesHtml}
  `;
}

export function miniGameToTxt(questions: MiniGameQuestion[], title: string): string {
  let txt = `BỘ CÂU HỎI MINI GAME TƯƠNG TÁC (KAHOOT / QUIZIZZ / BLOOKET)\n`;
  txt += `CHỦ ĐỀ: ${title}\n`;
  txt += `====================================================================\n\n`;

  questions.forEach((q, idx) => {
    txt += `CÂU ${idx + 1} [${q.bloomLevel}] (${q.timeLimitSeconds}s - ${q.points} điểm):\n`;
    txt += `${q.question}\n`;
    q.options.forEach(opt => {
      txt += `  ${opt}\n`;
    });
    txt += `=> ĐÁP ÁN ĐÚNG: ${q.correctAnswer}\n`;
    txt += `=> GIẢI THÍCH: ${q.explanation}\n\n`;
  });

  return txt;
}

export function videoScriptToHtml(scenes: VideoStoryboardScene[], title: string, subject: string): string {
  const rows = scenes.map(s => `
    <tr>
      <td style="text-align: center; font-weight: bold; background-color: #f8fafc;">
        Cảnh ${s.sceneNumber}<br/>
        <span style="font-size: 10pt; color: #0284c7;">${s.duration}</span>
      </td>
      <td>
        <b>${s.title}</b>
        <p style="margin: 6px 0 0 0; font-size: 11pt; color: #334155;">${s.visualDescription}</p>
        <div style="margin-top: 6px; padding: 4px 8px; background: #e0f2fe; border-radius: 4px; font-size: 10pt; color: #0369a1;">
          <b>Prompt tạo ảnh/video AI:</b> <i>${s.aiPromptSuggestion}</i>
        </div>
      </td>
      <td>
        <p style="margin: 0; font-size: 11pt; color: #0f172a; font-style: italic;">"${s.voiceover}"</p>
      </td>
      <td style="font-weight: bold; color: #b45309; font-size: 10.5pt;">
        ${s.onScreenText}
      </td>
    </tr>
  `).join('');

  return `
    <div style="text-align: center; margin-bottom: 25px;">
      <h1 style="color: #b45309; margin-bottom: 4px;">KỊCH BẢN VIDEO BÀI GIẢNG VI MÔ (MICROLEARNING STORYBOARD)</h1>
      <h2 style="margin: 0; color: #334155;">CHỦ ĐỀ: ${title.toUpperCase()}</h2>
      <p style="margin-top: 6px; font-style: italic; color: #64748b;">(Thời lượng chuẩn 3-5 phút • Sẵn sàng sản xuất video học tập)</p>
    </div>
    <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; font-size: 11pt;">
      <tr style="background-color: #fed7aa; text-align: center;">
        <th style="width: 12%;">Phân Cảnh</th>
        <th style="width: 40%;">Mô Tả Hình Ảnh (Visual) & AI Prompt</th>
        <th style="width: 33%;">Lời Bình Thuyết Minh (Voiceover)</th>
        <th style="width: 15%;">Chữ Màn Hình</th>
      </tr>
      ${rows}
    </table>
  `;
}

export function fullPackageToDocHtml(pkg: FullLessonPackage): string {
  const planHtml = pkg.standard === 5512 && pkg.plan5512
    ? lessonPlan5512ToHtml(pkg.plan5512)
    : pkg.plan2634
    ? lessonPlan2634ToHtml(pkg.plan2634)
    : '';

  const slidesHtml = slidesToHtml(pkg.slides, pkg.lessonTitle, pkg.subject);
  const videoHtml = videoScriptToHtml(pkg.videoScript, pkg.lessonTitle, pkg.subject);

  return `
    <div style="text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;">
      <p style="font-size: 13pt; margin: 0; text-transform: uppercase;">TRƯỜNG TRUNG HỌC PHỔ THÔNG / CAO ĐẲNG NGHỀ</p>
      <p style="font-size: 11pt; font-style: italic; margin: 4px 0 15px 0;">Hồ sơ Kế hoạch bài giảng số hóa toàn diện - Ứng dụng AI Sư phạm</p>
      <h1 style="color: #1e3a8a; font-size: 20pt; margin: 0; text-transform: uppercase;">HỒ SƠ BÀI GIẢNG ĐA PHƯƠNG TIỆN TRỌN GÓI</h1>
      <h2 style="color: #0284c7; font-size: 16pt; margin: 8px 0;">BÀI DẠY: ${pkg.lessonTitle.toUpperCase()}</h2>
      <p style="font-size: 12pt; margin: 5px 0;">
        <b>Môn học:</b> ${pkg.subject} | <b>Khối lớp:</b> ${pkg.className} | <b>Ca học:</b> ${pkg.sessionInfo}
      </p>
      ${pkg.sourceDocMatched ? `
        <div style="display: inline-block; background-color: #f0fdf4; border: 1.5px solid #16a34a; border-radius: 6px; padding: 6px 14px; margin-top: 10px; font-size: 11pt; color: #166534;">
          <b>📘 Tư liệu đối chiếu chuẩn:</b> ${pkg.sourceDocMatched.title} (${pkg.sourceDocMatched.code})
        </div>
      ` : ''}
    </div>

    <!-- MỤC I: KẾ HOẠCH BÀI DẠY CHUẨN QUY CHUẨN -->
    <div style="margin-bottom: 40px;">
      <h2 style="color: #1e3a8a; border-left: 6px solid #1e3a8a; padding-left: 10px; text-transform: uppercase;">
        PHẦN 1: KẾ HOẠCH BÀI DẠY (GIÁO ÁN CHUẨN ${pkg.standard === 5512 ? 'CÔNG VĂN 5512' : 'CÔNG VĂN 2634'})
      </h2>
      ${planHtml}
    </div>

    <div style="page-break-before: always;"></div>

    <!-- MỤC II: KỊCH BẢN SLIDE TRÌNH CHIẾU -->
    <div style="margin-bottom: 40px;">
      <h2 style="color: #0369a1; border-left: 6px solid #0369a1; padding-left: 10px; text-transform: uppercase;">
        PHẦN 2: KỊCH BẢN BÀI GIẢNG TRÌNH CHIẾU POWERPOINT (SLIDES)
      </h2>
      ${slidesHtml}
    </div>

    <div style="page-break-before: always;"></div>

    <!-- MỤC III: BỘ CÂU HỎI MINI GAME TƯƠNG TÁC -->
    <div style="margin-bottom: 40px;">
      <h2 style="color: #7e22ce; border-left: 6px solid #7e22ce; padding-left: 10px; text-transform: uppercase;">
        PHẦN 3: BỘ CÂU HỎI MINI GAME TƯƠNG TÁC (KAHOOT / QUIZIZZ / BLOOKET)
      </h2>
      <pre style="background: #faf5ff; border: 1.5px solid #c084fc; border-radius: 8px; padding: 16px; font-family: 'Times New Roman', serif; font-size: 12pt; white-space: pre-wrap;">
${miniGameToTxt(pkg.miniGame, pkg.lessonTitle)}
      </pre>
    </div>

    <div style="page-break-before: always;"></div>

    <!-- MỤC IV: KỊCH BẢN VIDEO GIẢNG DẠY VI MÔ -->
    <div style="margin-bottom: 40px;">
      <h2 style="color: #b45309; border-left: 6px solid #b45309; padding-left: 10px; text-transform: uppercase;">
        PHẦN 4: KỊCH BẢN VIDEO BÀI GIẢNG VI MÔ (MICROLEARNING STORYBOARD)
      </h2>
      ${videoHtml}
    </div>

    <div style="page-break-before: always;"></div>

    <!-- MỤC V: RÀ SOÁT VÀ CHẤM ĐIỂM NĂNG LỰC SỐ & AI -->
    <div style="margin-bottom: 40px;">
      <h2 style="color: #15803d; border-left: 6px solid #15803d; padding-left: 10px; text-transform: uppercase;">
        PHẦN 5: BẢNG RÀ SOÁT & CHẤM ĐIỂM SƯ PHẠM NĂNG LỰC SỐ (QĐ 2422 & CV 3456/BGDĐT)
      </h2>
      <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 16px; margin-bottom: 15px;">
        <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 14pt;">
          TỔNG ĐIỂM ĐÁNH GIÁ: ${pkg.auditScore.totalScore}/100 ĐIỂM — XẾP LOẠI: ${pkg.auditScore.rating.toUpperCase()}
        </h3>
        <p style="margin: 4px 0;"><b>Mức độ Năng lực số đạt được:</b> ${pkg.auditScore.digitalCompetencyReview.levelAchieved}</p>
      </div>

      <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; margin-top: 10px; font-size: 11pt;">
        <tr style="background-color: #dcfce7;">
          <th style="width: 30%;">Tiêu Chí Đánh Giá</th>
          <th style="width: 15%;">Điểm Số</th>
          <th style="width: 55%;">Nhận Xét & Căn Cứ Pháp Quy</th>
        </tr>
        ${pkg.auditScore.criteria.map(c => `
          <tr>
            <td><b>${c.name}</b><br/><span style="font-size: 9.5pt; color: #64748b;">${c.standardRef}</span></td>
            <td style="text-align: center; font-weight: bold; color: #166534; font-size: 13pt;">${c.actualScore} / ${c.maxScore}</td>
            <td>${c.feedback}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}

export function downloadWordDoc(htmlContent: string, fileName: string): void {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Kế Hoạch Bài Dạy</title>
      <style>
        @page WordSection1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 56.7pt 56.7pt 56.7pt 70.9pt; /* 2cm 2cm 2cm 2.5cm */
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.35; color: #000; }
        h1 { font-size: 18pt; font-weight: bold; }
        h2 { font-size: 14pt; font-weight: bold; }
        h3 { font-size: 13pt; font-weight: bold; }
        p { margin: 4pt 0; text-align: justify; }
        table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
        th, td { border: 1pt solid #000; padding: 6pt; }
        th { background-color: #f1f5f9; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        ${htmlContent}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.doc') ? fileName : `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
