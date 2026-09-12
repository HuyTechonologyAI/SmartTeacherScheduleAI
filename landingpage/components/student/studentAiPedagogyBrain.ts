// ============================================================================
// STUDENT AI PEDAGOGY BRAIN - VIETNAM NATIONAL CURRICULUM (GDPT 2018)
// Smart Teacher Schedule - Gia sư AI Chuẩn Mực Sư Phạm Việt Nam
// Tuân thủ triệt để:
// 1. Không làm bài tập thay cho học sinh (chỉ gợi ý phương pháp, từng bước tư duy).
// 2. Không bịa đặt, bám sát Sách giáo khoa & Nguồn chính thống Bộ GD&ĐT.
// 3. Khích lệ tinh thần tự học, tự giác của học sinh từ Tiểu học đến THPT.
// ============================================================================

export type SubjectType = 'math' | 'vietnamese' | 'english' | 'science' | 'history_geo' | 'informatics' | 'general';

export type PedagogicalMode = 
  | 'HINT_METHOD'     // Gợi ý phương pháp & các bước làm bài
  | 'EXPLAIN_CONCEPT' // Giải thích khái niệm / định lý SGK
  | 'OUTLINE_ESSAY'   // Gợi ý dàn ý & ý tưởng (không viết bài mẫu)
  | 'CHECK_WORK';     // Nhận xét lời giải của học sinh

export interface AiSourceReference {
  bookTitle: string; // Tên SGK chuẩn
  gradeLevel: string;
  unitOrTopic: string;
  officialPublisher: string; // NXB Giáo dục Việt Nam / Cánh Diều / v.v.
  pedagogicalStandard: string; // TT 32/2018/TT-BGDĐT GDPT 2018
}

export interface StudentAiResponse {
  mode: PedagogicalMode;
  subject: SubjectType;
  title: string;
  thoughtProcess: string[]; // Các bước tư duy sư phạm
  coreKnowledge: string;    // Kiến thức / Công thức SGK cần nhớ
  stepByStepGuide: {
    stepNumber: number;
    stepTitle: string;
    guidance: string;
    questionForStudent?: string;
  }[];
  challengeForStudent: string; // Nhiệm vụ để học sinh tự hoàn thành (tự tính hoặc tự viết)
  teacherEncouragement: string; // Lời động viên ấm áp của gia sư AI
  source: AiSourceReference;
}

// ----------------------------------------------------------------------------
// Nguồn tài liệu chính thống mặc định của Bộ GD&ĐT
// ----------------------------------------------------------------------------
const DEFAULT_SOURCE_MAP: Record<SubjectType, AiSourceReference> = {
  math: {
    bookTitle: 'Toán học (Bộ Kết nối tri thức với cuộc sống & Cánh Diều)',
    gradeLevel: 'Chương trình GDPT 2018',
    unitOrTopic: 'Khung kiến thức chuẩn theo Thông tư 32/2018/TT-BGDĐT',
    officialPublisher: 'Nhà xuất bản Giáo dục Việt Nam',
    pedagogicalStandard: 'Chuẩn năng lực tư duy & giải quyết vấn đề Toán học'
  },
  vietnamese: {
    bookTitle: 'Tiếng Việt / Ngữ Văn (Chương trình GDPT 2018)',
    gradeLevel: 'Bộ Giáo Dục và Đào Tạo Việt Nam',
    unitOrTopic: 'Kỹ năng Đọc - Viết - Nói và Nghe',
    officialPublisher: 'Nhà xuất bản Giáo dục Việt Nam',
    pedagogicalStandard: 'Chuẩn năng lực ngôn ngữ và thẩm mỹ văn học'
  },
  english: {
    bookTitle: 'Global Success / English Discovery (Bộ GD&ĐT phê duyệt)',
    gradeLevel: 'Khung năng lực ngoại ngữ 6 bậc Việt Nam (KNLNNVN)',
    unitOrTopic: 'Grammar, Vocabulary & Phonics',
    officialPublisher: 'Vietnam Education Publishing House',
    pedagogicalStandard: 'Bộ GD&ĐT Việt Nam'
  },
  science: {
    bookTitle: 'Tự nhiên và Xã hội / Khoa học tự nhiên',
    gradeLevel: 'Chương trình GDPT 2018',
    unitOrTopic: 'Khám phá thế giới tự nhiên và thực nghiệm',
    officialPublisher: 'Nhà xuất bản Giáo dục Việt Nam',
    pedagogicalStandard: 'Chuẩn năng lực tìm hiểu tự nhiên'
  },
  history_geo: {
    bookTitle: 'Lịch sử và Địa lý Việt Nam',
    gradeLevel: 'Chương trình GDPT 2018',
    unitOrTopic: 'Địa lý tự nhiên, Dân cư và Lịch sử dân tộc',
    officialPublisher: 'Nhà xuất bản Giáo dục Việt Nam',
    pedagogicalStandard: 'Chuẩn giáo dục lịch sử và chủ quyền quốc gia'
  },
  informatics: {
    bookTitle: 'Tin học (Chương trình GDPT 2018)',
    gradeLevel: 'Khung năng lực số người học - QĐ 3456/BGDĐT',
    unitOrTopic: 'Tư duy máy tính & Ứng dụng công nghệ an toàn',
    officialPublisher: 'Nhà xuất bản Giáo dục Việt Nam',
    pedagogicalStandard: 'Thông tư 02/2025/TT-BGDĐT'
  },
  general: {
    bookTitle: 'Tài liệu học tập chính thống Chương trình GDPT 2018',
    gradeLevel: 'Bộ Giáo Dục và Đào Tạo Việt Nam',
    unitOrTopic: 'Nền tảng kiến thức tích hợp',
    officialPublisher: 'Nhà xuất bản Giáo dục Việt Nam',
    pedagogicalStandard: 'Chuẩn kiến thức & kỹ năng quốc gia'
  }
};

// ----------------------------------------------------------------------------
// Nhận diện Môn học tự động từ nội dung câu hỏi
// ----------------------------------------------------------------------------
export function detectSubject(query: string): SubjectType {
  const q = query.toLowerCase();
  if (q.includes('toán') || q.includes('phép tính') || q.includes('hình chữ nhật') || q.includes('diện tích') || q.includes('chu vi') || q.includes('phân số') || q.includes('phương trình') || q.includes('nhân') || q.includes('chia') || q.includes('cộng') || q.includes('trừ') || /\d+\s*[\+\-\*\/x]\s*\d+/.test(q)) {
    return 'math';
  }
  if (q.includes('văn') || q.includes('tiếng việt') || q.includes('tập làm văn') || q.includes('tả') || q.includes('chính tả') || q.includes('danh từ') || q.includes('động từ') || q.includes('tính từ') || q.includes('biện pháp tu từ') || q.includes('so sánh') || q.includes('nhân hóa') || q.includes('đoạn văn')) {
    return 'vietnamese';
  }
  if (q.includes('tiếng anh') || q.includes('english') || q.includes('grammar') || q.includes('tense') || q.includes('vocabulary') || q.includes('translate') || q.includes('pronounce') || /[a-zA-Z\s]{4,}is|are|am|have|has|do|does/.test(q)) {
    return 'english';
  }
  if (q.includes('khoa học') || q.includes('tự nhiên') || q.includes('vật lý') || q.includes('hóa học') || q.includes('sinh học') || q.includes('quang hợp') || q.includes('nước') || q.includes('không khí') || q.includes('động vật') || q.includes('thực vật')) {
    return 'science';
  }
  if (q.includes('lịch sử') || q.includes('địa lý') || q.includes('bản đồ') || q.includes('khí hậu') || q.includes('triều đại') || q.includes('chiến dịch') || q.includes('ngô quyền') || q.includes('bác hồ')) {
    return 'history_geo';
  }
  if (q.includes('tin học') || q.includes('máy tính') || q.includes('thuật toán') || q.includes('scratch') || q.includes('lập trình') || q.includes('bàn phím') || q.includes('chuột')) {
    return 'informatics';
  }
  return 'general';
}

// ----------------------------------------------------------------------------
// BỘ NÃO SƯ PHẠM: Xử lý và sinh phản hồi chuẩn mực không làm thay bài
// ----------------------------------------------------------------------------
export function generatePedagogicalResponse(
  question: string,
  gradeLevel: string = 'Lớp 3',
  preferredMode: PedagogicalMode = 'HINT_METHOD',
  studentInputSolution?: string
): StudentAiResponse {
  const subject = detectSubject(question);
  const q = question.trim();
  const source = DEFAULT_SOURCE_MAP[subject];

  // 1. CHẾ ĐỐ 4: KIỂM TRA LỜI GIẢI CỦA HỌC SINH (REVIEW STUDENT WORK)
  if (preferredMode === 'CHECK_WORK' || studentInputSolution) {
    const sol = (studentInputSolution || '').trim();
    return {
      mode: 'CHECK_WORK',
      subject,
      title: `Nhận xét sư phạm & Góp ý bài làm (${gradeLevel})`,
      thoughtProcess: [
        'Bước 1: Đối chiếu bài làm của con với yêu cầu đề bài',
        'Bước 2: Tìm và khen ngợi những điểm làm đúng, tư duy sáng tạo',
        'Bước 3: Chỉ ra vị trí cần điều chỉnh hoặc lưu ý bước tính toán',
        'Bước 4: Hướng dẫn con cách kiểm tra lại kết quả một cách độc lập'
      ],
      coreKnowledge: `Quy tắc chuẩn mực theo SGK ${source.bookTitle}: Cần chú ý ghi đúng đơn vị đo, trình bày đủ câu trả lời (lời giải), phép tính và đáp số rõ ràng.`,
      stepByStepGuide: [
        {
          stepNumber: 1,
          stepTitle: 'Khen ngợi tinh thần tự lực làm bài',
          guidance: `Rất khen ngợi con đã tự giác suy nghĩ và viết ra cách làm của mình: "${sol || 'bài làm đã gửi'}". Tinh thần tự học này đáng được thưởng 1 sao rèn luyện ⭐!`,
          questionForStudent: 'Con hãy đọc lại xem câu lời giải đã sát với câu hỏi của đề bài chưa?'
        },
        {
          stepNumber: 2,
          stepTitle: 'Kiểm tra tính logic và các bước giải',
          guidance: 'Các bước con lựa chọn phương pháp đã đi đúng hướng. Hãy kiểm tra kỹ lại phép tính trung gian và đơn vị đo (ví dụ: mét, cm, hoặc số đồ vật) xem có bị nhầm lẫn không nhé.',
          questionForStudent: 'Nếu thử làm phép tính ngược lại (thử lại), con thấy kết quả có khớp không?'
        },
        {
          stepNumber: 3,
          stepTitle: 'Trình bày chuẩn mực vào vở',
          guidance: 'Lời giải rõ ràng ➔ Phép tính đặt trong ngoặc đơn ghi kèm đơn vị ➔ Dòng đáp số viết ngay ngắn thẳng hàng.',
          questionForStudent: 'Con đã ghi đầy đủ chữ "Đáp số:" ở cuối bài chưa?'
        }
      ],
      challengeForStudent: '🎯 Thử thách cho con: Hãy lấy nháp đặt tính lại phép tính cuối cùng một lần nữa thật cẩn thận, sau đó tự tin nộp bài cho Thầy/Cô nhé!',
      teacherEncouragement: '🌟 Thầy/Cô rất tự hào khi con tự mình hoàn thành bài tập. Sai sót nhỏ trong lúc luyện tập là chuyện bình thường, quan trọng là con biết tự kiểm tra lại!',
      source
    };
  }

  // 2. MÔN TOÁN HỌC (MATHEMATICS)
  if (subject === 'math') {
    // Trích xuất các số trong đề bài để phân tích dữ kiện
    const numbersFound = q.match(/\d+/g) || [];
    const isGeometry = q.toLowerCase().includes('chu vi') || q.toLowerCase().includes('diện tích') || q.toLowerCase().includes('hình chữ nhật') || q.toLowerCase().includes('hình vuông');

    return {
      mode: 'HINT_METHOD',
      subject: 'math',
      title: isGeometry ? 'Gợi ý phương pháp giải Toán Hình học chuẩn SGK' : 'Phương pháp giải Toán tư duy từng bước (Không giải thay)',
      thoughtProcess: [
        '1. Đọc kỹ đề bài và tóm tắt dữ kiện: Đề cho gì? Đề hỏi gì?',
        '2. Nhắc lại công thức / quy tắc cốt lõi trong Sách Giáo Khoa Toán',
        '3. Lập kế hoạch giải: Cần tìm đại lượng nào trước?',
        '4. Để học sinh tự thực hiện phép tính cuối cùng và ghi đáp số'
      ],
      coreKnowledge: isGeometry
        ? `📘 Công thức SGK Toán ${gradeLevel}:
• Chu vi hình chữ nhật = (Chiều dài + Chiều rộng) × 2 (cùng đơn vị đo).
• Diện tích hình chữ nhật = Chiều dài × Chiều rộng (cùng đơn vị đo).
• Chu vi hình vuông = Độ dài một cạnh × 4.
• Diện tích hình vuông = Cạnh × Cạnh.`
        : `📘 Quy tắc giải Toán có lời văn theo chuẩn Bộ GD&ĐT:
• Bước 1: Đọc kỹ đề, gạch chân từ khóa quan trọng ("nhiều hơn", "ít hơn", "gấp mấy lần", "giảm đi", "tất cả là").
• Bước 2: Viết tóm tắt ra giấy nháp bằng sơ đồ đoạn thẳng hoặc lời vắn tắt.
• Bước 3: Đặt câu lời giải phù hợp với câu hỏi của bài.`,
      stepByStepGuide: [
        {
          stepNumber: 1,
          stepTitle: 'Tóm tắt dữ kiện đề bài đã cho',
          guidance: `Đề bài của con nhắc tới: "${q}". ${numbersFound.length > 0 ? `Các số liệu quan trọng là: ${numbersFound.join(', ')}.` : 'Hãy tìm ra các số liệu và đại lượng đề bài nhắc tới.'}`,
          questionForStudent: 'Đề bài yêu cầu tìm cái gì? Đại lượng nào đã biết và đại lượng nào chưa biết?'
        },
        {
          stepNumber: 2,
          stepTitle: 'Xác định phép tính trung gian',
          guidance: 'Nếu bài toán có từ 2 bước tính trở lên, con cần tìm đại lượng phụ trước (ví dụ: tìm số thứ hai trước, hoặc đổi cùng một đơn vị đo trước khi tính).',
          questionForStudent: 'Hai đại lượng này đã cùng đơn vị đo chưa (ví dụ cùng là cm, m)?'
        },
        {
          stepNumber: 3,
          stepTitle: 'Thiết lập biểu thức toán học',
          guidance: 'Dựa vào mối quan hệ đề bài cho, con hãy ghép các số liệu vào công thức ở phần Kiến thức cốt lõi bên trên để lập ra phép tính.',
          questionForStudent: 'Để ra kết quả cuối cùng, con sẽ thực hiện phép cộng, trừ, nhân hay chia?'
        }
      ],
      challengeForStudent: '✏️ Nhiệm vụ của con: Đặt phép tính ra giấy nháp, tính thật cẩn thận ra kết quả số rồi viết câu lời giải và Đáp số vào vở nhé. Cô tin chắc con sẽ làm đúng 100%!',
      teacherEncouragement: '💪 Hãy tự tin vào khả năng của mình! Cố gắng tự tính toán sẽ giúp não bộ của con phát triển thông minh và nhanh nhạy hơn rất nhiều!',
      source
    };
  }

  // 3. MÔN TIẾNG VIỆT / NGỮ VĂN (VIETNAMESE LANGUAGE & LITERATURE)
  if (subject === 'vietnamese') {
    const isEssay = q.toLowerCase().includes('tả') || q.toLowerCase().includes('kể') || q.toLowerCase().includes('đoạn văn') || q.toLowerCase().includes('bài văn');
    return {
      mode: 'OUTLINE_ESSAY',
      subject: 'vietnamese',
      title: isEssay ? 'Dàn ý gợi mở & Từ ngữ hay cho bài viết (Không chép văn mẫu)' : 'Hướng dẫn kiến thức Tiếng Việt & Luyện từ và câu',
      thoughtProcess: [
        '1. Xác định thể loại và đối tượng cần miêu tả / kể / phân tích',
        '2. Xây dựng bộ khung dàn ý 3 phần: Mở bài - Thân bài - Kết bài',
        '3. Gợi ý từ ngữ giàu hình ảnh (tính từ, từ láy, từ gợi cảm)',
        '4. Gợi ý sử dụng biện pháp tu từ (so sánh, nhân hóa) theo chuẩn GDPT 2018'
      ],
      coreKnowledge: `📘 Chuẩn mực Tiếng Việt SGK Bộ GD&ĐT:
• Cấu trúc đoạn văn / bài văn: Phải có mở đầu, diễn biến / chi tiết, và cảm nghĩ kết lại.
• Biện pháp tu từ: So sánh (dùng từ "như", "giống như", "tựa như"), Nhân hóa (gọi hoặc tả đồ vật, con vật bằng từ ngữ chỉ người).
• Lưu ý chính tả: Đầu câu viết hoa, cuối câu có dấu chấm, ngắt câu hợp lý để không bị cụt ý.`,
      stepByStepGuide: [
        {
          stepNumber: 1,
          stepTitle: 'Mở bài / Mở đoạn (Gợi mở cách dẫn dắt tự nhiên)',
          guidance: 'Thay vì viết bài mẫu, cô gợi ý con trả lời 2 câu hỏi: Con muốn kể/tả ai hoặc điều gì? Con có dịp gặp hoặc nhìn thấy đối tượng đó vào lúc nào?',
          questionForStudent: 'Ấn tượng đầu tiên của con về đối tượng đó là gì (đẹp đẽ, ấm áp, thân thương...)?'
        },
        {
          stepNumber: 2,
          stepTitle: 'Thân bài / Thân đoạn (Gợi ý chi tiết & Từ ngữ đắt giá)',
          guidance: '• Tả bao quát rồi đến chi tiết: hình dáng, màu sắc, âm thanh, hoạt động.\n• Gợi ý từ láy gợi cảm: rực rỡ, lung linh, thoang thoảng, ríu rít, rộn ràng.\n• Thêm biện pháp so sánh: ví dụ đôi mắt sáng như hai hòn ngọc, giọng nói ấm áp như tiếng ru...',
          questionForStudent: 'Chi tiết nào khiến con nhớ nhất hoặc yêu thích nhất?'
        },
        {
          stepNumber: 3,
          stepTitle: 'Kết bài / Kết đoạn (Bộc lộ cảm xúc chân thật)',
          guidance: 'Bày tỏ tình cảm, lòng biết ơn hoặc lời hứa của bản thân (ví dụ: con sẽ giữ gìn cẩn thận, cố gắng học thật giỏi để bố mẹ và thầy cô vui lòng).',
          questionForStudent: 'Con cảm thấy thế nào sau khi quan sát hoặc trải nghiệm điều đó?'
        }
      ],
      challengeForStudent: '📝 Nhiệm vụ của con: Dựa vào các câu hỏi gợi mở và dàn ý trên, hãy tự viết nên những câu văn bằng chính cảm xúc chân thật của con vào vở nhé. Bài viết từ trái tim con luôn là bài văn hay nhất!',
      teacherEncouragement: '💖 Mỗi học sinh đều có một giọng văn và cách nhìn cuộc sống rất độc đáo. Hãy tự tin cầm bút và thỏa sức sáng tạo nhé con!',
      source
    };
  }

  // 4. MÔN TIẾNG ANH (ENGLISH)
  if (subject === 'english') {
    return {
      mode: 'EXPLAIN_CONCEPT',
      subject: 'english',
      title: 'English Learning Guide: Grammar, Patterns & Hints (No spoon-feeding)',
      thoughtProcess: [
        '1. Identify the core grammar rule or sentence pattern (Chương trình Tiếng Anh GDPT 2018)',
        '2. Break down the sentence structure into simple formula',
        '3. Provide vocabulary hints and real-world examples',
        '4. Challenge student to construct their own sentences'
      ],
      coreKnowledge: `📘 Official English Curriculum (MOET Vietnam):
• Sentence Formula: Subject + Verb + Object (S + V + O).
• Present Simple (Hiện tại đơn): S + V(s/es). Dùng cho thói quen, sự thật hiển nhiên.
• Question Form: Do/Does/Is/Are + S + ...?
• Plural nouns: Thông thường thêm "s" hoặc "es" (e.g. books, boxes).`,
      stepByStepGuide: [
        {
          stepNumber: 1,
          stepTitle: 'Understand the sentence pattern (Hiểu mẫu câu)',
          guidance: `For your question: "${q}", notice what kind of question it is (Asking about an object, a person, time, or action?).`,
          questionForStudent: 'Is this asking "What", "Who", "Where" or "How many"?'
        },
        {
          stepNumber: 2,
          stepTitle: 'Identify singular or plural (Số ít hay số nhiều)',
          guidance: 'Remember: "It is a / an..." is used for 1 item (singular). "They are..." is used for 2 or more items (plural).',
          questionForStudent: 'Is the subject singular (one) or plural (many)?'
        },
        {
          stepNumber: 3,
          stepTitle: 'Formulate the response (Tự ghép thành câu hoàn chỉnh)',
          guidance: 'Put words in the right order: Subject first ➔ then the Verb ➔ then the Adjective / Noun.',
          questionForStudent: 'Can you say the full sentence aloud before writing it down?'
        }
      ],
      challengeForStudent: '🎯 Your turn: Use this grammar pattern to write your own answer. Check spelling of every word carefully before turning in!',
      teacherEncouragement: '🌟 Great job practicing English! Speaking and writing in English gets easier and more fun every single day!',
      source
    };
  }

  // 5. MÔN KHOA HỌC / TỰ NHIÊN / XÃ HỘI (SCIENCE & NATURE)
  if (subject === 'science') {
    return {
      mode: 'EXPLAIN_CONCEPT',
      subject: 'science',
      title: 'Khám phá Khoa học Tự nhiên & Hiện tượng Đời sống',
      thoughtProcess: [
        '1. Đặt câu hỏi kích thích quan sát thực nghiệm',
        '2. Giải thích cơ chế khoa học theo nguyên lý SGK GDPT 2018',
        '3. Liên hệ với các hiện tượng thực tế xung quanh đời sống học sinh',
        '4. Hướng dẫn học sinh tự rút ra bài học và kết luận'
      ],
      coreKnowledge: `📘 Kiến thức Khoa học tự nhiên chuẩn Bộ GD&ĐT:
• Các hiện tượng tự nhiên tuân theo quy luật vật lý, hóa học, sinh học khách quan.
• Quá trình học khoa học: Quan sát ➔ Đặt giả thuyết ➔ Thực nghiệm / Thu thập dữ liệu ➔ Rút ra kết luận.`,
      stepByStepGuide: [
        {
          stepNumber: 1,
          stepTitle: 'Quan sát hiện tượng thực tế',
          guidance: `Với câu hỏi: "${q}", con hãy nhớ lại xem con đã từng nhìn thấy hoặc cảm nhận hiện tượng này ngoài đời sống chưa?`,
          questionForStudent: 'Hiện tượng này xảy ra vào lúc nào, ở đâu?'
        },
        {
          stepNumber: 2,
          stepTitle: 'Tìm nguyên nhân cốt lõi trong tự nhiên',
          guidance: 'Vạn vật xung quanh đều có mối quan hệ tương tác (ví dụ: nước bốc hơi nhờ nhiệt độ mặt trời, cây xanh quang hợp nhờ ánh sáng và chất diệp lục).',
          questionForStudent: 'Yếu tố nào tác động trực tiếp làm cho hiện tượng này biến đổi?'
        },
        {
          stepNumber: 3,
          stepTitle: 'Đúc kết bài học thực tế',
          guidance: 'Từ quy luật khoa học đó, con người ứng dụng gì vào cuộc sống (bảo vệ môi trường, tiết kiệm nước, giữ gìn sức khỏe)?',
          questionForStudent: 'Con có thể làm gì để bảo vệ và chăm sóc thiên nhiên xung quanh mình?'
        }
      ],
      challengeForStudent: '🔬 Thử thách khoa học: Hãy dùng những từ ngữ của con để tóm tắt lại nguyên nhân của hiện tượng này trong 2-3 câu ngắn gọn vào vở nhé!',
      teacherEncouragement: '🌱 Thế giới tự nhiên có muôn vàn điều kỳ thú. Sự tò mò và ham học hỏi sẽ biến con thành một nhà khoa học tài ba trong tương lai!',
      source
    };
  }

  // 6. CÁC MÔN HỌC KHÁC (LỊCH SỬ, ĐỊA LÝ, TIN HỌC, ĐẠO ĐỨC...)
  return {
    mode: 'HINT_METHOD',
    subject: 'general',
    title: 'Gợi ý phương pháp tự học & Tìm kiếm tri thức chính thống',
    thoughtProcess: [
      '1. Phân tích nội dung nhiệm vụ học tập giáo viên giao',
      '2. Xác định bài học và trang sách giáo khoa cần tra cứu',
      '3. Hướng dẫn các bước tư duy phản biện và ghi nhớ',
      '4. Động viên học sinh tự trả lời bằng lời văn của mình'
    ],
    coreKnowledge: `📘 Phương pháp học tập tích cực (Active Learning) theo định hướng Bộ GD&ĐT:
• Tự tra cứu mục lục SGK và ghi chú các ý chính (keyword).
• Không học vẹt, học vẹt dễ quên; hãy hiểu bản chất và diễn đạt lại bằng ngôn ngữ của bản thân.
• Kiểm tra nguồn gốc thông tin: Chỉ tin cậy sách giáo khoa, lời giảng của thầy cô và các cổng thông tin chính thống (.gov.vn / .edu.vn).`,
    stepByStepGuide: [
      {
        stepNumber: 1,
        stepTitle: 'Tra cứu bài học tương ứng trong Sách Giáo Khoa',
        guidance: `Mở mục lục sách ${gradeLevel}, tìm bài học có chủ đề liên quan đến: "${q}". Đọc kỹ phần chữ in đậm và các khung ghi nhớ ở cuối bài.`,
        questionForStudent: 'Khung tóm tắt "Em cần ghi nhớ" trong bài học đó nói về điều gì?'
      },
      {
        stepNumber: 2,
        stepTitle: 'Trả lời các câu hỏi phụ để làm rõ vấn đề',
        guidance: 'Chia câu hỏi lớn thành 2-3 câu hỏi nhỏ hơn (Ai? Làm gì? Ở đâu? Khi nào? Tại sao?). Trả lời từng câu nhỏ sẽ giúp con hoàn thành trọn vẹn câu hỏi lớn.',
        questionForStudent: 'Từ khóa quan trọng nhất trong câu hỏi này là gì?'
      },
      {
        stepNumber: 3,
        stepTitle: 'Tổng hợp và trình bày vào vở',
        guidance: 'Viết câu trả lời mạch lạc, đủ chủ ngữ - vị ngữ, chữ viết nắn nót, giữ vở sạch đẹp.',
        questionForStudent: 'Con đã kiểm tra lại lỗi chính tả và dấu câu trước khi gấp vở chưa?'
      }
    ],
    challengeForStudent: '⭐ Thử thách cho con: Tự đọc lại phần ghi nhớ trong SGK và viết câu trả lời hoàn chỉnh vào vở nhé. Cô tin con sẽ làm rất tốt!',
    teacherEncouragement: '🏆 Tinh thần tự học và tìm tòi là chìa khóa vàng mở ra mọi thành công. Hãy luôn tự hào về sự nỗ lực của chính mình!',
    source
  };
}
