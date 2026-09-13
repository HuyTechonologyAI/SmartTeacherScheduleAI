// ============================================================================
// AI EXAM SPECIFICATION MATRIX ENGINE - SMART TEACHER SCHEDULE
// Soạn Đề Thi Chuẩn Ma Trận Đặc Tả Bộ GD&ĐT (Thông tư 22/2021/TT-BGDĐT)
// Hỗ trợ: Đề 15 phút, 1 tiết (45-60p), Học kỳ (60-90p) kèm ma trận 4 mức độ & biểu điểm
// ============================================================================

export type CognitiveLevel = 'NHAN_BIET' | 'THONG_HIEU' | 'VAN_DUNG' | 'VAN_DUNG_CAO';
export type QuestionFormat = 'TRAC_NGHIEM' | 'TU_LUAN' | 'DUNG_SAI' | 'TRA_LOI_NGAN';
export type ExamDurationType = '15_MIN' | '45_MIN_MIDTERM' | 'SEMESTER_FINAL';

export interface ExamSpecificationTopic {
  topicName: string;
  curriculumStandard: string; // Yêu cầu cần đạt chuẩn GDPT 2018
  recognitionQuestions: number;     // Nhận biết
  comprehensionQuestions: number;   // Thông hiểu
  applicationQuestions: number;     // Vận dụng
  advancedApplicationQuestions: number; // Vận dụng cao
  totalQuestions: number;
  totalScore: number;
  percentage: number;
}

export interface ExamQuestion {
  id: string;
  order: number;
  level: CognitiveLevel;
  levelLabel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  format: QuestionFormat;
  points: number;
  topic: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  gradingSteps?: { content: string; score: number }[];
}

export interface ExamPackage {
  id: string;
  title: string;
  schoolName: string;
  departmentName: string;
  subject: string;
  grade: string;
  schoolYear: string;
  semester: string;
  durationType: ExamDurationType;
  durationMinutes: number;
  totalScore: number;
  matrix: {
    topics: ExamSpecificationTopic[];
    totalRecognition: number;
    totalComprehension: number;
    totalApplication: number;
    totalAdvanced: number;
    recognitionPercent: number;
    comprehensionPercent: number;
    applicationPercent: number;
    advancedPercent: number;
  };
  studentExam: {
    instructions: string;
    partA_MultipleChoice: ExamQuestion[];
    partB_Essay: ExamQuestion[];
  };
  answerKeyAndRubric: {
    multipleChoiceAnswers: { order: number; answer: string; points: number }[];
    essayRubrics: { order: number; questionText: string; steps: { content: string; score: number }[]; totalPoints: number }[];
  };
  createdAt: number;
}

// ----------------------------------------------------------------------------
// SUBJECT QUESTION TEMPLATES & PEDAGOGICAL GENERATORS
// ----------------------------------------------------------------------------

interface QuestionBankTemplate {
  subject: string;
  topics: {
    name: string;
    standard: string;
    questions: {
      level: CognitiveLevel;
      levelLabel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
      format: QuestionFormat;
      points: number;
      questionText: string;
      options?: string[];
      correctAnswer: string;
      explanation: string;
      gradingSteps?: { content: string; score: number }[];
    }[];
  }[];
}

const QUESTION_BANK: Record<string, QuestionBankTemplate> = {
  math: {
    subject: 'Toán học',
    topics: [
      {
        name: 'Đại số & Biểu thức đại số / Phương trình',
        standard: 'Nhận biết, biến đổi đồng nhất biểu thức đại số, giải phương trình và hệ phương trình theo chuẩn GDPT 2018',
        questions: [
          {
            level: 'NHAN_BIET',
            levelLabel: 'Nhận biết',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Trong phương trình bậc hai ax² + bx + c = 0 (a ≠ 0), biệt thức Delta (Δ) được tính theo công thức nào sau đây?',
            options: [
              'A. Δ = b² - 4ac',
              'B. Δ = b² + 4ac',
              'C. Δ = 4ac - b²',
              'D. Δ = b - 4ac'
            ],
            correctAnswer: 'A',
            explanation: 'Theo SGK Toán học: Công thức tính biệt thức Delta là Δ = b² - 4ac.'
          },
          {
            level: 'NHAN_BIET',
            levelLabel: 'Nhận biết',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Căn bậc hai số học của số 81 là số nào?',
            options: ['A. 9', 'B. -9', 'C. ±9', 'D. 81'],
            correctAnswer: 'A',
            explanation: 'Căn bậc hai số học của số thực dương a là số không âm x sao cho x² = a. Với a = 81 thì x = 9.'
          },
          {
            level: 'THONG_HIEU',
            levelLabel: 'Thông hiểu',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Phương trình x² - 5x + 6 = 0 có tập nghiệm là gì?',
            options: [
              'A. S = {2; 3}',
              'B. S = {-2; -3}',
              'C. S = {1; 6}',
              'D. S = {-1; -6}'
            ],
            correctAnswer: 'A',
            explanation: 'Phân tích đa thức thành nhân tử: (x - 2)(x - 3) = 0 <=> x = 2 hoặc x = 3.'
          },
          {
            level: 'THONG_HIEU',
            levelLabel: 'Thông hiểu',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Điều kiện xác định của phân thức đại số (2x + 1) / (x - 3) là:',
            options: ['A. x ≠ 3', 'B. x ≠ -3', 'C. x ≠ 1/2', 'D. x ≠ -1/2'],
            correctAnswer: 'A',
            explanation: 'Phân thức đại số xác định khi và chỉ khi mẫu thức khác 0: x - 3 ≠ 0 <=> x ≠ 3.'
          },
          {
            level: 'VAN_DUNG',
            levelLabel: 'Vận dụng',
            format: 'TU_LUAN',
            points: 1.5,
            questionText: 'Một khu vườn hình chữ nhật có chiều dài hơn chiều rộng 8m. Biết diện tích khu vườn là 180 m². Hãy tính chu vi của khu vườn đó.',
            correctAnswer: 'Chu vi khu vườn là 56m',
            explanation: 'Gọi chiều rộng khu vườn là x (m, x > 0). Chiều dài là x + 8 (m). Phương trình: x(x + 8) = 180 <=> x² + 8x - 180 = 0. Giải ra x = 10 (thỏa mãn) hoặc x = -18 (loại). Chiều dài: 18m. Chu vi: (18 + 10) * 2 = 56m.',
            gradingSteps: [
              { content: 'Chọn ẩn số, đơn vị và điều kiện hợp lý cho ẩn (x > 0)', score: 0.25 },
              { content: 'Biểu diễn chiều dài và lập phương trình diện tích x(x + 8) = 180', score: 0.5 },
              { content: 'Giải phương trình tìm được x = 10 (nhận), x = -18 (loại)', score: 0.5 },
              { content: 'Tính đúng chu vi: (18 + 10) x 2 = 56 mét và kết luận', score: 0.25 }
            ]
          },
          {
            level: 'VAN_DUNG_CAO',
            levelLabel: 'Vận dụng cao',
            format: 'TU_LUAN',
            points: 1.0,
            questionText: 'Tìm giá trị nhỏ nhất của biểu thức P = x² - 4x + y² + 2y + 2026 với mọi số thực x, y.',
            correctAnswer: 'Giá trị nhỏ nhất P_min = 2021 đạt được khi x = 2, y = -1',
            explanation: 'Biến đổi: P = (x² - 4x + 4) + (y² + 2y + 1) + 2021 = (x - 2)² + (y + 1)² + 2021. Vì (x - 2)² ≥ 0 và (y + 1)² ≥ 0 với mọi x, y nên P ≥ 2021. Dấu "=" xảy ra khi x = 2 và y = -1.',
            gradingSteps: [
              { content: 'Tách biểu thức thành bình phương đúng: (x - 2)² + (y + 1)² + 2021', score: 0.5 },
              { content: 'Lập luận đánh giá tính không âm của các bình phương: P ≥ 2021', score: 0.25 },
              { content: 'Chỉ ra dấu đẳng thức xảy ra khi x = 2, y = -1 và kết luận P_min = 2021', score: 0.25 }
            ]
          }
        ]
      },
      {
        name: 'Hình học phẳng & Hệ thức lượng',
        standard: 'Hiểu và vận dụng các định lý hình học, định lý Pytago và tỉ số lượng giác trong giải quyết bài toán thực tế',
        questions: [
          {
            level: 'NHAN_BIET',
            levelLabel: 'Nhận biết',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Trong tam giác ABC vuông tại A, theo định lý Pytago ta có hệ thức nào sau đây?',
            options: [
              'A. BC² = AB² + AC²',
              'B. AB² = BC² + AC²',
              'C. AC² = AB² + BC²',
              'D. BC = AB + AC'
            ],
            correctAnswer: 'A',
            explanation: 'Trong tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông: BC² = AB² + AC².'
          },
          {
            level: 'THONG_HIEU',
            levelLabel: 'Thông hiểu',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Cho tam giác DEF vuông tại D, có DE = 6cm, DF = 8cm. Độ dài cạnh huyền EF bằng:',
            options: ['A. 10 cm', 'B. 14 cm', 'C. 12 cm', 'D. √28 cm'],
            correctAnswer: 'A',
            explanation: 'Áp dụng định lý Pytago: EF² = DE² + DF² = 6² + 8² = 36 + 64 = 100 => EF = 10 cm.'
          },
          {
            level: 'VAN_DUNG',
            levelLabel: 'Vận dụng',
            format: 'TU_LUAN',
            points: 1.5,
            questionText: 'Một chiếc thang dài 4m được dựng dựa vào một bức tường thẳng đứng. Chân thang cách chân tường 1.5m. Hỏi đầu trên của chiếc thang chạm tới vị trí cao bao nhiêu mét trên bức tường? (Làm tròn đến chữ số thập phân thứ nhất).',
            correctAnswer: 'Độ cao chiếc thang chạm tường xấp xỉ 3.7 mét',
            explanation: 'Tam giác tạo bởi thang, tường và mặt đất là tam giác vuông. Cạnh huyền là chiếc thang (4m), cạnh góc vuông thứ nhất là khoảng cách chân thang đến tường (1.5m). Cạnh góc vuông thứ hai là độ cao h. Ta có: h² = 4² - 1.5² = 16 - 2.25 = 13.75 => h ≈ 3.71m ≈ 3.7m.',
            gradingSteps: [
              { content: 'Mô hình hóa tình huống thực tế thành tam giác vuông chuẩn xác', score: 0.25 },
              { content: 'Áp dụng định lý Pytago: h² = 4² - 1.5² = 13.75', score: 0.5 },
              { content: 'Tính căn bậc hai và làm tròn đúng yêu cầu: h ≈ 3.7m', score: 0.5 },
              { content: 'Kết luận lời giải có kèm đơn vị đo hợp lý', score: 0.25 }
            ]
          }
        ]
      }
    ]
  },
  literature: {
    subject: 'Ngữ văn',
    topics: [
      {
        name: 'Đọc hiểu văn bản & Tiếng Việt',
        standard: 'Nhận biết phương thức biểu đạt, biện pháp tu từ, thông điệp ý nghĩa văn bản theo chuẩn GDPT 2018',
        questions: [
          {
            level: 'NHAN_BIET',
            levelLabel: 'Nhận biết',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Phương thức biểu đạt chính của một đoạn trích truyện ngắn giàu yếu tố cốt truyện và nhân vật là gì?',
            options: ['A. Tự sự', 'B. Miêu tả', 'C. Biểu cảm', 'D. Thuyết minh'],
            correctAnswer: 'A',
            explanation: 'Phương thức tự sự dùng để trình bày diễn biến chuỗi sự việc, cốt truyện và hành động nhân vật.'
          },
          {
            level: 'THONG_HIEU',
            levelLabel: 'Thông hiểu',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Biện pháp tu từ nào được sử dụng trong câu: "Tre giữ làng, giữ nước, giữ mái nhà tranh, giữ đồng lúa chín"?',
            options: ['A. Điệp từ (Điệp ngữ)', 'B. So sánh', 'C. Hoán dụ', 'D. Nói quá'],
            correctAnswer: 'A',
            explanation: 'Từ "giữ" được lặp lại 4 lần liên tiếp nhằm nhấn mạnh vai trò kiên cường, chở che của cây tre Việt Nam.'
          },
          {
            level: 'VAN_DUNG',
            levelLabel: 'Vận dụng',
            format: 'TU_LUAN',
            points: 2.0,
            questionText: 'Viết đoạn văn ngắn (khoảng 8 đến 10 câu) nêu suy nghĩ của em về ý nghĩa của tinh thần tự học và đọc sách đối với học sinh thời đại số.',
            correctAnswer: 'Đoạn văn hoàn chỉnh có mở đoạn, thân đoạn và kết đoạn rõ ràng.',
            explanation: 'Học sinh nêu được: Khái niệm tự học, vai trò của việc đọc sách giúp mở rộng nhãn quan, rèn luyện tư duy phản biện, cách chọn lọc thông tin trên không gian mạng và rút ra bài học hành động cho bản thân.',
            gradingSteps: [
              { content: 'Hình thức đoạn văn chuẩn quy cách (8-10 câu), diễn đạt trôi chảy, không sai chính tả', score: 0.5 },
              { content: 'Nêu được luận điểm trọng tâm: Ý nghĩa to lớn của tinh thần tự học và đọc sách', score: 0.5 },
              { content: 'Liên hệ thực tiễn thời đại số: Tự chủ kiến thức, phòng tránh sự phụ thuộc vào mạng xã hội', score: 0.5 },
              { content: 'Rút ra bài học nhận thức và hành động thiết thực cho học sinh', score: 0.5 }
            ]
          }
        ]
      }
    ]
  },
  english: {
    subject: 'Tiếng Anh',
    topics: [
      {
        name: 'Language Focus (Phonetics, Vocabulary & Grammar)',
        standard: 'Grasp tenses, prepositions, sentence structures and pronunciation based on CEFR / GDPT 2018',
        questions: [
          {
            level: 'NHAN_BIET',
            levelLabel: 'Nhận biết',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Choose the word whose underlined part is pronounced differently: A. wanted  B. decided  C. played  D. needed',
            options: ['A. wanted', 'B. decided', 'C. played', 'D. needed'],
            correctAnswer: 'C',
            explanation: '"played" has the "-ed" ending pronounced as /d/, while the others are pronounced as /ɪd/ after /t/ or /d/.'
          },
          {
            level: 'THONG_HIEU',
            levelLabel: 'Thông hiểu',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'My brother usually ________ basketball with his classmates after school.',
            options: ['A. plays', 'B. play', 'C. is playing', 'D. played'],
            correctAnswer: 'A',
            explanation: 'Subject "My brother" is third-person singular and the adverb of frequency "usually" indicates the Present Simple tense -> "plays".'
          },
          {
            level: 'VAN_DUNG',
            levelLabel: 'Vận dụng',
            format: 'TU_LUAN',
            points: 1.5,
            questionText: 'Rewrite the following sentence so that it means the same as the first one: "I have never seen such a beautiful painting before." -> This is the first time ____________________.',
            correctAnswer: 'This is the first time I have ever seen such a beautiful painting.',
            explanation: 'Transformation structure: Never... before <=> This is the first time + S + have/has + (ever) + V3/ed.',
            gradingSteps: [
              { content: 'Correct subject and auxiliary verb: "I have"', score: 0.5 },
              { content: 'Correct past participle and adverb: "(ever) seen"', score: 0.5 },
              { content: 'Correct object phrase: "such a beautiful painting."', score: 0.5 }
            ]
          }
        ]
      }
    ]
  },
  science: {
    subject: 'Khoa học tự nhiên',
    topics: [
      {
        name: 'Chất và sự biến đổi của chất & Năng lượng',
        standard: 'Nắm vững các hiện tượng vật lý, hóa học cơ bản, nguyên lý bảo toàn năng lượng và cấu tạo chất',
        questions: [
          {
            level: 'NHAN_BIET',
            levelLabel: 'Nhận biết',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Hiện tượng nào sau đây là hiện tượng hóa học?',
            options: [
              'A. Cơm bị ôi thiu bốc mùi chua',
              'B. Nước lỏng đóng băng thành nước đá',
              'C. Hòa tan đường vào nước',
              'D. Cắt nhỏ sợi dây đồng'
            ],
            correctAnswer: 'A',
            explanation: 'Cơm bị ôi thiu sinh ra chất mới có mùi chua và thay đổi thành phần hóa học, đây là hiện tượng hóa học.'
          },
          {
            level: 'THONG_HIEU',
            levelLabel: 'Thông hiểu',
            format: 'TRAC_NGHIEM',
            points: 0.5,
            questionText: 'Quá trình quang hợp ở thực vật có vai trò quan trọng nhất là gì đối với sự sống trên Trái Đất?',
            options: [
              'A. Tổng hợp chất hữu cơ và giải phóng khí Oxi (O₂)',
              'B. Hút toàn bộ lượng nước trên mặt đất',
              'C. Làm nhiệt độ khí quyển tăng cao liên tục',
              'D. Giảm bớt lượng khoáng chất trong đất'
            ],
            correctAnswer: 'A',
            explanation: 'Quang hợp biến đổi năng lượng ánh sáng Mặt Trời thành năng lượng hóa học, tạo chất hữu cơ nuôi cây và cung cấp khí Oxi cho sinh quyển.'
          },
          {
            level: 'VAN_DUNG',
            levelLabel: 'Vận dụng',
            format: 'TU_LUAN',
            points: 2.0,
            questionText: 'Tại sao khi đun nước bằng ấm siêu tốc hoặc nồi trên bếp, người ta thường thấy hơi nước bốc lên mù mịt ở miệng vòi, nhưng ở vị trí sát miệng vòi khoảng 1-2cm lại không thấy hơi nước?',
            correctAnswer: 'Vì hơi nước ở sát miệng vòi là hơi nước thể khí vô hình; khi ra xa gặp không khí lạnh mới ngưng tụ thành các hạt sương li ti (hơi nước nhìn thấy được).',
            explanation: 'Sát miệng ấm là hơi nước có nhiệt độ rất cao (thể khí không màu, mắt thường không nhìn thấy). Khi hơi nước thoát ra xa 1-2cm gặp không khí mát hơn bên ngoài liền ngưng tụ thành vô số giọt nước cực nhỏ tạo thành làn sương trắng mù mịt.',
            gradingSteps: [
              { content: 'Giải thích đúng tính chất của hơi nước sát miệng vòi: Thể khí trong suốt, nhiệt độ cao nên không nhìn thấy', score: 1.0 },
              { content: 'Giải thích đúng hiện tượng ngưng tụ khi ra xa: Gặp nhiệt độ thấp hơn ngoài môi trường ngưng tụ thành giọt nước li ti', score: 1.0 }
            ]
          }
        ]
      }
    ]
  }
};

// ----------------------------------------------------------------------------
// EXAM GENERATOR ENGINE
// ----------------------------------------------------------------------------

export interface GenerateExamOptions {
  topic: string;
  subject: string;
  grade: string;
  schoolName?: string;
  departmentName?: string;
  schoolYear?: string;
  semester?: string;
  durationType: ExamDurationType;
  questionFormatPreference?: 'MULTIPLE_CHOICE_ONLY' | 'HYBRID_MC_ESSAY';
}

export function generateExamSpecificationPackage(options: GenerateExamOptions): ExamPackage {
  const {
    topic,
    subject = 'Toán học',
    grade = 'Lớp 9',
    schoolName = 'TRƯỜNG THCS & THPT NGUYỄN TẤT THÀNH',
    departmentName = 'TỔ KHOA HỌC TỰ NHIÊN',
    schoolYear = '2025 - 2026',
    semester = 'HỌC KỲ I',
    durationType = '45_MIN_MIDTERM',
    questionFormatPreference = 'HYBRID_MC_ESSAY'
  } = options;

  // 1. Phân bổ cấu hình theo thời lượng đề
  let durationMinutes = 45;
  let examTitle = '';
  let mcCount = 12;
  let essayCount = 2;
  let mcPointsPerQuestion = 0.5;

  if (durationType === '15_MIN') {
    durationMinutes = 15;
    examTitle = `BÀI KIỂM TRA THƯỜNG XUYÊN (15 PHÚT) - MÔN ${subject.toUpperCase()}`;
    if (questionFormatPreference === 'MULTIPLE_CHOICE_ONLY') {
      mcCount = 10;
      essayCount = 0;
      mcPointsPerQuestion = 1.0;
    } else {
      mcCount = 8;
      essayCount = 1;
      mcPointsPerQuestion = 1.0;
    }
  } else if (durationType === '45_MIN_MIDTERM') {
    durationMinutes = 45;
    examTitle = `ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA ${semester} - MÔN ${subject.toUpperCase()}`;
    if (questionFormatPreference === 'MULTIPLE_CHOICE_ONLY') {
      mcCount = 20;
      essayCount = 0;
      mcPointsPerQuestion = 0.5;
    } else {
      mcCount = 12; // 6.0 điểm
      essayCount = 2; // 4.0 điểm
      mcPointsPerQuestion = 0.5;
    }
  } else {
    durationMinutes = 90;
    examTitle = `ĐỀ KIỂM TRA CUỐI ${semester} (HỌC KỲ) - MÔN ${subject.toUpperCase()}`;
    if (questionFormatPreference === 'MULTIPLE_CHOICE_ONLY') {
      mcCount = 28;
      essayCount = 0;
      mcPointsPerQuestion = 0.357;
    } else {
      mcCount = 14; // 7.0 điểm
      essayCount = 3; // 3.0 điểm
      mcPointsPerQuestion = 0.5;
    }
  }

  // 2. Tìm câu hỏi phù hợp từ kho dữ liệu
  const subKey = subject.toLowerCase().includes('toán') ? 'math'
    : (subject.toLowerCase().includes('văn') || subject.toLowerCase().includes('tiếng việt')) ? 'literature'
    : (subject.toLowerCase().includes('anh') || subject.toLowerCase().includes('english')) ? 'english'
    : 'science';

  const bank = QUESTION_BANK[subKey] || QUESTION_BANK.math;

  // Lập danh sách câu hỏi trắc nghiệm và tự luận
  const mcQuestions: ExamQuestion[] = [];
  const essayQuestions: ExamQuestion[] = [];

  let qOrder = 1;

  // Duyệt ngân hàng câu hỏi
  bank.topics.forEach(tItem => {
    tItem.questions.forEach(q => {
      if (q.format === 'TRAC_NGHIEM' && mcQuestions.length < mcCount) {
        mcQuestions.push({
          id: `q_${qOrder}`,
          order: qOrder++,
          level: q.level,
          levelLabel: q.levelLabel,
          format: 'TRAC_NGHIEM',
          points: mcPointsPerQuestion,
          topic: tItem.name,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        });
      } else if (q.format === 'TU_LUAN' && essayQuestions.length < essayCount) {
        essayQuestions.push({
          id: `q_${qOrder}`,
          order: qOrder++,
          level: q.level,
          levelLabel: q.levelLabel,
          format: 'TU_LUAN',
          points: q.points || 2.0,
          topic: tItem.name,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          gradingSteps: q.gradingSteps
        });
      }
    });
  });

  // Nếu chưa đủ số lượng, sinh thêm câu hỏi tự động bám sát chủ đề nhập vào
  while (mcQuestions.length < mcCount) {
    const isEven = mcQuestions.length % 2 === 0;
    const level: CognitiveLevel = isEven ? 'NHAN_BIET' : 'THONG_HIEU';
    const levelLabel = isEven ? 'Nhận biết' : 'Thông hiểu';
    mcQuestions.push({
      id: `q_${qOrder}`,
      order: qOrder++,
      level,
      levelLabel,
      format: 'TRAC_NGHIEM',
      points: mcPointsPerQuestion,
      topic: topic || 'Kiến thức bài học cốt lõi',
      questionText: isEven
        ? `Nội dung / Quy luật cốt lõi nào sau đây phản ánh chính xác nhất về '${topic || 'chủ đề kiểm tra'}'?`
        : `Khi phân tích hoặc vận dụng '${topic || 'kiến thức bài học'}', nhận định nào sau đây là hoàn toàn đúng?`,
      options: [
        'A. Đảm bảo tính khoa học, quy chuẩn và liên hệ thực tiễn chính xác',
        'B. Chỉ áp dụng cho các trường hợp ngẫu nhiên không có tính hệ thống',
        'C. Không tuân theo các quy luật sư phạm và thực nghiệm thông thường',
        'D. Luôn có kết quả bằng 0 trong mọi điều kiện khảo sát'
      ],
      correctAnswer: 'A',
      explanation: `Phương án A thể hiện đúng bản chất khoa học chuẩn mực theo chương trình ${grade}.`
    });
  }

  while (essayQuestions.length < essayCount) {
    const isAdv = essayQuestions.length === essayCount - 1 && durationType !== '15_MIN';
    const level: CognitiveLevel = isAdv ? 'VAN_DUNG_CAO' : 'VAN_DUNG';
    const levelLabel = isAdv ? 'Vận dụng cao' : 'Vận dụng';
    const pts = isAdv ? 1.0 : 2.0;

    essayQuestions.push({
      id: `q_${qOrder}`,
      order: qOrder++,
      level,
      levelLabel,
      format: 'TU_LUAN',
      points: pts,
      topic: topic || 'Giải quyết vấn đề thực tiễn',
      questionText: isAdv
        ? `Vận dụng sáng tạo kiến thức '${topic || 'bài học'}' để đề xuất giải pháp tối ưu cho một tình huống thực tiễn phức tạp trong cuộc sống hoặc học tập.`
        : `Trình bày các bước giải quyết bài toán/nhiệm vụ liên quan đến '${topic || 'nội dung kiểm tra'}' và giải thích ý nghĩa của từng bước thực hiện.`,
      correctAnswer: 'Lời giải chi tiết từng bước có lập luận logic và kết luận đầy đủ.',
      explanation: 'Học sinh trình bày rõ ràng, đủ các bước biến đổi, có căn cứ lý thuyết và kết luận kèm đơn vị phù hợp.',
      gradingSteps: [
        { content: 'Nêu đúng cơ sở lý thuyết và hướng tiếp cận bài toán', score: pts * 0.25 },
        { content: 'Thực hiện các bước tính toán/lập luận mạch lạc, chính xác', score: pts * 0.5 },
        { content: 'Biện luận, thử lại và đưa ra kết luận chuẩn xác', score: pts * 0.25 }
      ]
    });
  }

  // 3. Tính toán Bảng Ma Trận Đặc Tả (Thông tư 22)
  const allQuestions = [...mcQuestions, ...essayQuestions];
  let nRec = 0, nCom = 0, nApp = 0, nAdv = 0;
  let sRec = 0, sCom = 0, sApp = 0, sAdv = 0;

  allQuestions.forEach(q => {
    if (q.level === 'NHAN_BIET') { nRec++; sRec += q.points; }
    else if (q.level === 'THONG_HIEU') { nCom++; sCom += q.points; }
    else if (q.level === 'VAN_DUNG') { nApp++; sApp += q.points; }
    else if (q.level === 'VAN_DUNG_CAO') { nAdv++; sAdv += q.points; }
  });

  const totalCalcScore = sRec + sCom + sApp + sAdv || 10;

  const topicsList: ExamSpecificationTopic[] = [
    {
      topicName: topic || `Chủ đề trọng tâm: ${subject} ${grade}`,
      curriculumStandard: 'Nắm vững kiến thức, rèn luyện phẩm chất và phát triển năng lực đặc thù theo chuẩn GDPT 2018',
      recognitionQuestions: nRec,
      comprehensionQuestions: nCom,
      applicationQuestions: nApp,
      advancedApplicationQuestions: nAdv,
      totalQuestions: allQuestions.length,
      totalScore: Number(totalCalcScore.toFixed(1)),
      percentage: 100
    }
  ];

  const packageResult: ExamPackage = {
    id: `exam_${Date.now()}`,
    title: examTitle,
    schoolName,
    departmentName,
    subject,
    grade,
    schoolYear,
    semester,
    durationType,
    durationMinutes,
    totalScore: 10,
    matrix: {
      topics: topicsList,
      totalRecognition: nRec,
      totalComprehension: nCom,
      totalApplication: nApp,
      totalAdvanced: nAdv,
      recognitionPercent: Math.round((sRec / totalCalcScore) * 100),
      comprehensionPercent: Math.round((sCom / totalCalcScore) * 100),
      applicationPercent: Math.round((sApp / totalCalcScore) * 100),
      advancedPercent: Math.round((sAdv / totalCalcScore) * 100)
    },
    studentExam: {
      instructions: 'Thí sinh không được sử dụng tài liệu. Cán bộ coi thi không giải thích gì thêm.',
      partA_MultipleChoice: mcQuestions,
      partB_Essay: essayQuestions
    },
    answerKeyAndRubric: {
      multipleChoiceAnswers: mcQuestions.map(q => ({
        order: q.order,
        answer: q.correctAnswer,
        points: q.points
      })),
      essayRubrics: essayQuestions.map(q => ({
        order: q.order,
        questionText: q.questionText,
        steps: q.gradingSteps || [{ content: q.explanation, score: q.points }],
        totalPoints: q.points
      }))
    },
    createdAt: Date.now()
  };

  return packageResult;
}

// ----------------------------------------------------------------------------
// EXPORT TO STANDARDIZED VIETNAM WORD DOCUMENT (.DOC)
// ----------------------------------------------------------------------------

export function exportExamPackageToDocHtml(pkg: ExamPackage): string {
  const mcAnswersHtml = pkg.answerKeyAndRubric.multipleChoiceAnswers
    .map(a => `<tr><td style="text-align:center;padding:6px;border:1px solid #000;">Câu ${a.order}</td><td style="text-align:center;font-weight:bold;padding:6px;border:1px solid #000;">${a.answer}</td><td style="text-align:center;padding:6px;border:1px solid #000;">${a.points} đ</td></tr>`)
    .join('');

  const essayRubricHtml = pkg.answerKeyAndRubric.essayRubrics
    .map(e => {
      const stepsRows = e.steps
        .map((s, sIdx) => `<tr><td style="padding:5px;border:1px solid #000;">Bước ${sIdx + 1}: ${s.content}</td><td style="text-align:center;font-weight:bold;padding:5px;border:1px solid #000;width:80px;">${s.score} đ</td></tr>`)
        .join('');
      return `
        <div style="margin-top:12px;margin-bottom:12px;">
          <p style="font-weight:bold;margin-bottom:4px;">Câu ${e.order} (${e.totalPoints} điểm):</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:6px;">
            <thead>
              <tr style="background-color:#f2f2f2;">
                <th style="padding:6px;border:1px solid #000;text-align:left;">Nội dung / Yêu cầu đáp án</th>
                <th style="padding:6px;border:1px solid #000;text-align:center;width:80px;">Điểm</th>
              </tr>
            </thead>
            <tbody>
              ${stepsRows}
            </tbody>
          </table>
        </div>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${pkg.title}</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.35; color: #000; margin: 20px; }
  h1, h2, h3, h4 { font-family: "Times New Roman", Times, serif; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #000; padding: 6px; }
  .page-break { page-break-before: always; }
  .text-center { text-align: center; }
  .bold { font-weight: bold; }
  .italic { font-style: italic; }
</style>
</head>
<body>

<!-- PHẦN 1: BẢNG MA TRẬN ĐẶC TẢ ĐỀ KIỂM TRA (THÔNG TƯ 22/2021/TT-BGDĐT) -->
<table style="border:none;margin-bottom:15px;">
  <tr style="border:none;">
    <td style="border:none;width:45%;text-align:center;">
      <div class="bold" style="font-size:12pt;">${pkg.schoolName.toUpperCase()}</div>
      <div class="bold" style="font-size:12pt;">${pkg.departmentName.toUpperCase()}</div>
      <div style="margin:2px 0;">-------------------</div>
    </td>
    <td style="border:none;width:55%;text-align:center;">
      <div class="bold" style="font-size:12pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="bold" style="font-size:12pt;text-decoration:underline;">Độc lập - Tự do - Hạnh phúc</div>
    </td>
  </tr>
</table>

<div class="text-center bold" style="font-size:15pt;margin-top:10px;">
  MA TRẬN VÀ BẢN ĐẶC TẢ ĐỀ KIỂM TRA ${pkg.durationType === '15_MIN' ? '15 PHÚT' : pkg.durationType === '45_MIN_MIDTERM' ? 'GIỮA HỌC KỲ' : 'CUỐI HỌC KỲ'}
</div>
<div class="text-center italic" style="font-size:12pt;margin-bottom:15px;">
  Môn: ${pkg.subject} - ${pkg.grade} | Năm học: ${pkg.schoolYear}
</div>

<h3 style="font-size:13pt;text-transform:uppercase;">I. KHUNG MA TRẬN ĐỀ KIỂM TRA (CHUẨN 4 MỨC ĐỘ NHẬN THỨC)</h3>
<table>
  <thead>
    <tr style="background-color:#e8f0fe;">
      <th rowspan="2" style="width:5%;">TT</th>
      <th rowspan="2" style="width:35%;">Chủ đề / Đơn vị kiến thức</th>
      <th colspan="4">Mức độ nhận thức (Số câu / Tỷ lệ %)</th>
      <th rowspan="2" style="width:12%;">Tổng câu</th>
      <th rowspan="2" style="width:12%;">Tổng điểm</th>
    </tr>
    <tr style="background-color:#f1f5f9;">
      <th style="width:9%;">Nhận biết</th>
      <th style="width:9%;">Thông hiểu</th>
      <th style="width:9%;">Vận dụng</th>
      <th style="width:9%;">VD cao</th>
    </tr>
  </thead>
  <tbody>
    ${pkg.matrix.topics.map((t, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>
          <div class="bold">${t.topicName}</div>
          <div class="italic" style="font-size:11pt;color:#333;">${t.curriculumStandard}</div>
        </td>
        <td class="text-center">${t.recognitionQuestions} câu</td>
        <td class="text-center">${t.comprehensionQuestions} câu</td>
        <td class="text-center">${t.applicationQuestions} câu</td>
        <td class="text-center">${t.advancedApplicationQuestions} câu</td>
        <td class="text-center bold">${t.totalQuestions}</td>
        <td class="text-center bold">${t.totalScore} đ</td>
      </tr>
    `).join('')}
    <tr style="background-color:#f8fafc;font-weight:bold;">
      <td colspan="2" class="text-center">TỔNG SỐ CÂU / TỔNG ĐIỂM:</td>
      <td class="text-center">${pkg.matrix.totalRecognition} câu</td>
      <td class="text-center">${pkg.matrix.totalComprehension} câu</td>
      <td class="text-center">${pkg.matrix.totalApplication} câu</td>
      <td class="text-center">${pkg.matrix.totalAdvanced} câu</td>
      <td class="text-center">${pkg.studentExam.partA_MultipleChoice.length + pkg.studentExam.partB_Essay.length} câu</td>
      <td class="text-center">${pkg.totalScore}.0 đ</td>
    </tr>
    <tr style="background-color:#f1f5f9;font-weight:bold;">
      <td colspan="2" class="text-center">TỶ LỆ PHẦN TRĂM (%):</td>
      <td class="text-center">${pkg.matrix.recognitionPercent}%</td>
      <td class="text-center">${pkg.matrix.comprehensionPercent}%</td>
      <td class="text-center">${pkg.matrix.applicationPercent}%</td>
      <td class="text-center">${pkg.matrix.advancedPercent}%</td>
      <td colspan="2" class="text-center">100%</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PHẦN 2: TỜ ĐỀ BÀI THI DÀNH CHO HỌC SINH -->
<table style="border:none;margin-bottom:10px;">
  <tr style="border:none;">
    <td style="border:none;width:45%;text-align:center;">
      <div class="bold" style="font-size:12pt;">${pkg.schoolName.toUpperCase()}</div>
      <div class="bold" style="font-size:12pt;">LỚP: ....................</div>
      <div>Họ và tên: .......................................</div>
    </td>
    <td style="border:none;width:55%;text-align:center;">
      <div class="bold" style="font-size:13pt;">${pkg.title}</div>
      <div class="italic" style="font-size:11pt;">Năm học: ${pkg.schoolYear} | Thời gian: ${pkg.durationMinutes} phút</div>
      <div class="italic" style="font-size:10pt;">(Không kể thời gian phát đề)</div>
    </td>
  </tr>
</table>

<table style="margin-bottom:15px;">
  <tr>
    <td style="width:25%;height:45px;" class="bold text-center">Điểm số:</td>
    <td style="width:75%;" class="bold text-center">Lời nhận xét của Thầy / Cô giáo:</td>
  </tr>
</table>

<div class="italic text-center" style="font-size:11pt;margin-bottom:12px;">${pkg.studentExam.instructions}</div>

<!-- PHẦN A: TRẮC NGHIỆM -->
${pkg.studentExam.partA_MultipleChoice.length > 0 ? `
  <h4 style="font-size:12pt;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid #000;padding-bottom:3px;">
    PHẦN I. CÂU HỎI TRẮC NGHIỆM KHÁCH QUAN (${pkg.studentExam.partA_MultipleChoice.length} CÂU)
  </h4>
  <div style="margin-bottom:15px;">
    ${pkg.studentExam.partA_MultipleChoice.map(q => `
      <div style="margin-bottom:10px;">
        <div style="font-weight:bold;">Câu ${q.order} (${q.points} điểm) [${q.levelLabel}]: ${q.questionText}</div>
        <table style="border:none;width:100%;margin-top:4px;">
          <tr style="border:none;">
            ${(q.options || []).map(opt => `<td style="border:none;width:25%;padding:2px 4px;">${opt}</td>`).join('')}
          </tr>
        </table>
      </div>
    `).join('')}
  </div>
` : ''}

<!-- PHẦN B: TỰ LUẬN -->
${pkg.studentExam.partB_Essay.length > 0 ? `
  <h4 style="font-size:12pt;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid #000;padding-bottom:3px;">
    PHẦN II. CÂU HỎI TỰ LUẬN (${pkg.studentExam.partB_Essay.length} CÂU)
  </h4>
  <div>
    ${pkg.studentExam.partB_Essay.map(q => `
      <div style="margin-bottom:14px;">
        <div style="font-weight:bold;">Câu ${q.order} (${q.points} điểm) [${q.levelLabel}]:</div>
        <div style="margin-top:2px;text-align:justify;">${q.questionText}</div>
      </div>
    `).join('')}
  </div>
` : ''}

<div class="text-center italic" style="margin-top:20px;font-size:11pt;">
  ----------------------- HẾT -----------------------
</div>

<div class="page-break"></div>

<!-- PHẦN 3: ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM BÀI CHI TIẾT -->
<div class="text-center bold" style="font-size:14pt;margin-bottom:10px;">
  ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM CHI TIẾT
</div>
<div class="text-center italic" style="font-size:12pt;margin-bottom:15px;">
  Môn: ${pkg.subject} | ${pkg.grade} - Thời gian: ${pkg.durationMinutes} phút
</div>

${pkg.studentExam.partA_MultipleChoice.length > 0 ? `
  <h4 style="font-size:12pt;text-transform:uppercase;">1. BẢNG ĐÁP ÁN TRẮC NGHIỆM KHÁCH QUAN</h4>
  <table style="width:60%;margin-bottom:15px;">
    <thead>
      <tr style="background-color:#f2f2f2;">
        <th style="width:30%;">Câu số</th>
        <th style="width:40%;">Đáp án đúng</th>
        <th style="width:30%;">Điểm</th>
      </tr>
    </thead>
    <tbody>
      ${mcAnswersHtml}
    </tbody>
  </table>
` : ''}

${pkg.studentExam.partB_Essay.length > 0 ? `
  <h4 style="font-size:12pt;text-transform:uppercase;">2. HƯỚNG DẪN CHẤM VÀ BIỂU ĐIỂM TỰ LUẬN</h4>
  ${essayRubricHtml}
` : ''}

<table style="border:none;margin-top:30px;">
  <tr style="border:none;">
    <td style="border:none;width:50%;text-align:center;">
      <div class="bold">TỔ TRƯỞNG CHUYÊN MÔN</div>
      <div class="italic">(Ký và ghi rõ họ tên)</div>
    </td>
    <td style="border:none;width:50%;text-align:center;">
      <div class="bold">GIÁO VIÊN RA ĐỀ</div>
      <div class="italic">(Ký và ghi rõ họ tên)</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}

export function downloadWordExamDoc(filename: string, htmlContent: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
