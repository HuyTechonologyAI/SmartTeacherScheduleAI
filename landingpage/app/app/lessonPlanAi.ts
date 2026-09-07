// Generative AI Lesson Planner & Exam Matrix Engine
// Supporting CV 5512/BGDĐT-GDTrH & CV 2634/GDNN

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
}

export function generateLessonPlan5512(
  lessonTitle: string,
  subject: string,
  grade: string,
  durationMinutes: number = 45,
  customRequirements?: string
): LessonPlan5512Data {
  const custom = customRequirements?.trim() ? ` Yêu cầu sư phạm: ${customRequirements}.` : '';

  return {
    lessonTitle,
    subject: subject || 'Chung',
    grade: grade || 'Phổ thông',
    durationMinutes,
    objectives: {
      knowledge: `Học sinh nắm vững các khái niệm, quy luật và bản chất cốt lõi của bài học '${lessonTitle}'. Biết phân tích và liên hệ kiến thức với thực tiễn.${custom}`,
      competencies: `Phát triển năng lực tự chủ và tự học, năng lực giao tiếp và hợp tác nhóm, năng lực giải quyết vấn đề sáng tạo và tư duy phản biện trong môn ${subject}.`,
      qualities: `Rèn luyện phẩm chất chăm chỉ, trung thực, tinh thần trách nhiệm với nhiệm vụ học tập tập thể và niềm say mê khám phá khoa học.`
    },
    equipment: {
      teacherEquipment: `Kế hoạch bài dạy (Giáo án), bài giảng trình chiếu điện tử PowerPoint, máy chiếu/Tivi tương tác, phiếu học tập số 1 & số 2, tranh ảnh/video minh họa trực quan.`,
      studentEquipment: `Sách giáo khoa, vở ghi bài, bút viết, bảng nhóm, đọc trước tài liệu bài mới theo hướng dẫn của giáo viên.`
    },
    activity1Opening: {
      name: `Khởi động (Xác định vấn đề / Nhiệm vụ học tập)`,
      objective: `Kích hoạt kiến thức nền tảng của học sinh, tạo hứng thú và tâm thế chủ động tiếp nhận bài học '${lessonTitle}'.`,
      content: `Giáo viên chiếu video/tình huống thực tế hoặc tổ chức trò chơi nhanh 'Ai nhanh hơn' với 3 câu hỏi gợi mở liên quan đến bài học.`,
      product: `Câu trả lời hào hứng của học sinh, sự tò mò và nhu cầu muốn tìm hiểu nội dung mới.`,
      implementation: `GV nêu tình huống và câu hỏi. HS suy nghĩ cá nhân trong 1 phút và xung phong phát biểu. GV nhận xét, tạo cầu nối dẫn dắt vào bài mới '${lessonTitle}'.`
    },
    activity2Knowledge: {
      name: `Hình thành kiến thức mới`,
      objective: `Học sinh chủ động phát hiện, tiếp thu và xây dựng được hệ thống kiến thức trọng tâm của bài học '${lessonTitle}'.`,
      content: `Chia lớp thành 4 nhóm học tập, giao phiếu bài tập khám phá. Yêu cầu học sinh đọc tài liệu, trao đổi nhóm để hoàn thành phiếu học tập.`,
      product: `Bản trình bày kết quả thảo luận trên bảng phụ hoặc giấy A0 của các nhóm; phần ghi chép cô đọng vào vở của học sinh.`,
      implementation: `GV giao nhiệm vụ rõ ràng, quy định thời gian thảo luận (10-15 phút). GV di chuyển quanh lớp quan sát, hỗ trợ kịp thời các nhóm gặp khó khăn. Đại diện nhóm 1 và nhóm 3 báo cáo; nhóm 2 và nhóm 4 nhận xét, phản biện. GV chốt chuẩn kiến thức khoa học.`
    },
    activity3Practice: {
      name: `Luyện tập & Củng cố`,
      objective: `Giúp học sinh củng cố, khắc sâu kiến thức vừa học thông qua hệ thống bài tập rèn luyện kỹ năng.`,
      content: `Học sinh thực hiện bài tập trắc nghiệm nhanh 4 đáp án và 1 bài tập tự luận nhỏ giải quyết tình huống điển hình.`,
      product: `Bài làm chính xác của học sinh trên bảng con hoặc vở bài tập.`,
      implementation: `GV trình chiếu câu hỏi luyện tập. HS làm bài cá nhân. GV gọi học sinh lên bảng trình bày, gọi bạn khác nhận xét, sau đó GV chuẩn hóa phương pháp giải.`
    },
    activity4Application: {
      name: `Vận dụng & Mở rộng`,
      objective: `Phát triển khả năng vận dụng kiến thức bài học '${lessonTitle}' vào đời sống thực tiễn và định hướng tìm tòi nghiên cứu tiếp theo.`,
      content: `Giao nhiệm vụ nghiên cứu mở rộng về nhà: Hãy tìm 2 ví dụ thực tế liên quan đến bài học hoặc thiết kế một sơ đồ tư duy tóm tắt toàn bộ bài.`,
      product: `Bài thu hoạch cá nhân hoặc sản phẩm sơ đồ tư duy nộp vào đầu tiết học tiếp theo.`,
      implementation: `GV hướng dẫn chi tiết yêu cầu, tiêu chí đánh giá sản phẩm và dặn dò học sinh chuẩn bị bài mới.`
    }
  };
}

export function generateLessonPlan2634(
  moduleTitle: string,
  occupation: string,
  level: string,
  durationMinutes: number = 180,
  workshopEquipment?: string
): LessonPlan2634Data {
  const equip = workshopEquipment?.trim() ? workshopEquipment.trim() : 'Máy móc gia công chuyên dụng, trang bị đo kiểm, trang bị BHLĐ cá nhân';

  return {
    moduleTitle,
    occupation: occupation || 'Kỹ thuật Cơ khí / Điện',
    level: level || 'Trung cấp / Cao đẳng Nghề',
    durationMinutes,
    objectives: {
      knowledge: `Trình bày đúng quy trình công nghệ, cấu tạo thiết bị, thông số kỹ thuật và các quy tắc An toàn lao động khi thực hiện bài thực hành '${moduleTitle}'.`,
      skills: `Thực hiện thành thạo các thao tác chuẩn xác, gia công/lắp ráp đạt độ chính xác theo bản vẽ kỹ thuật; biết sử dụng thành thạo dụng cụ đo kiểm và khắc phục sai hỏng thông thường.`,
      autonomyAndSafety: `Tuân thủ nghiêm ngặt quy tắc An toàn lao động (ATLĐ), Phòng chống cháy nổ (PCCN), vệ sinh công nghiệp 5S (Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng) và ý thức kỷ luật xưởng.`
    },
    conditions: {
      equipmentAndMachines: `Hệ thống máy móc xưởng thực hành (${equip}), đồ gá chuẩn, bảng quy trình hướng dẫn thao tác, dụng cụ đo kiểm (Thước cặp, Panme, Đồng hồ so...).`,
      materialsAndWorkpieces: `Phôi mẫu thực hành đầy đủ cho từng học sinh/nhóm máy, dao cụ cắt gọt, vật tư tiêu hao, dung dịch bôi trơn làm mát.`,
      safetyAnd5S: `Trang phục BHLĐ đầy đủ (Áo BHLĐ cài cúc gọn gàng, giày bảo hộ mũi sắt, kính bảo hộ mắt), tủ thuốc y tế sơ cấp cứu, bình cứu hỏa CO2 tại vị trí quy định.`
    },
    step1Orientation: {
      name: `Bước 1: Hướng dẫn ban đầu & Phổ biến ATLĐ (Chiếm ~10% thời lượng)`,
      teacherActivity: `Điểm danh quân số, kiểm tra tác phong BHLĐ của học sinh. Nhắc lại mục tiêu bài học; phổ biến nội quy xưởng và các cảnh báo nguy hiểm đặc thù khi vận hành '${moduleTitle}'.`,
      studentActivity: `Đứng nghiêm túc đúng vị trí, lắng nghe, ghi chép nội dung an toàn và xác nhận đã kiểm tra trang bị BHLĐ của bản thân.`,
      safetyAndKeyPoints: `Yêu cầu 100% học sinh không đeo găng tay khi vận hành trục quay máy tiện/phay; kiểm tra khóa liên động an toàn trước khi cấp nguồn điện.`
    },
    step2Demonstration: {
      name: `Bước 2: Hướng dẫn thường xuyên & Thao tác mẫu (Chiếm ~15% thời lượng)`,
      teacherActivity: `Thao tác mẫu quy trình 3 lần: Lần 1 tốc độ làm việc bình thường; Lần 2 làm chậm kèm giải thích chi tiết từng bước kỹ thuật; Lần 3 nhấn mạnh các lỗi hỏng thường gặp và cách phòng tránh.`,
      studentActivity: `Quan sát tỉ mỉ từng động tác của giáo viên; đặt câu hỏi làm rõ các điểm kỹ thuật khó; 1 học sinh lên thao tác lại thử để giáo viên uốn nắn.`,
      safetyAndKeyPoints: `Chú ý tư thế đứng làm việc cân bằng, cách cầm dụng cụ đo kiểm đúng phương pháp, không tỳ lực quá mạnh gây biến dạng chi tiết.`
    },
    step3Practice: {
      name: `Bước 3: Học sinh thực hành luyện tập tại xưởng (Chiếm ~65% thời lượng)`,
      teacherActivity: `Phân chia học sinh về các vị trí máy. Liên tục tuần tra, giám sát chặt chẽ thao tác của từng em; kịp thời dừng máy và uốn nắn khi phát hiện thao tác sai hoặc vi phạm an toàn; động viên học sinh yếu.`,
      studentActivity: `Vận hành máy, thực hiện gia công phôi mẫu theo phiếu hướng dẫn công nghệ. Tự kiểm tra kích thước chi tiết bằng dụng cụ đo kiểm sau mỗi bước gia công.`,
      safetyAndKeyPoints: `Tuyệt đối không đùa nghịch trong xưởng; tập trung cao độ; dừng máy hoàn toàn trước khi đo kiểm hoặc gá đặt lại chi tiết.`
    },
    step4Evaluation: {
      name: `Bước 4: Hướng dẫn kết thúc, Đánh giá & Thu dọn 5S (Chiếm ~10% thời lượng)`,
      teacherActivity: `Thu nhận sản phẩm của học sinh, tổ chức nghiệm thu đối chiếu bản vẽ kỹ thuật. Nhận xét ưu/nhược điểm buổi thực hành. Hướng dẫn và giám sát quy trình vệ sinh xưởng 5S.`,
      studentActivity: `Nộp sản phẩm bài tập; tự đánh giá và nhận xét chéo sản phẩm; ngắt cầu dao điện máy móc, lau chùi dầu mỡ bôi trơn máy, thu dọn dụng cụ về tủ và quét dọn xưởng sạch sẽ.`,
      safetyAndKeyPoints: `Thực hiện nghiêm túc 5S: Tắt hoàn toàn nguồn điện tổng của xưởng, giao trả chìa khóa và kiểm đếm dụng cụ đo kiểm đầy đủ.`
    }
  };
}

export function generateExamMatrix(
  topic: string,
  subject: string,
  grade: string,
  questionCount: number = 10
): ExamMatrixData {
  const c = Math.max(4, questionCount);
  const nRecog = Math.round(c * 0.4);
  const nComp = Math.round(c * 0.3);
  const nApp = Math.round(c * 0.2);
  const nAdv = c - (nRecog + nComp + nApp);

  const questions: ExamQuestionItem[] = [];

  for (let i = 1; i <= nRecog; i++) {
    questions.push({
      level: 'Nhận biết',
      questionText: `Khái niệm cơ bản hoặc định nghĩa chính xác nào sau đây đúng về '${topic}'?`,
      options: [
        `A. Là quy trình/nguyên lý nền tảng được định nghĩa chuẩn xác theo tài liệu khoa học`,
        `B. Là hiện tượng ngẫu nhiên không có tính quy luật`,
        `C. Là kết quả của việc áp dụng sai quy chuẩn kỹ thuật`,
        `D. Chỉ xuất hiện trong môi trường phòng thí nghiệm đặc biệt`
      ],
      correctAnswer: 'A',
      explanation: `Theo tài liệu giảng dạy chuẩn môn ${subject}, phương án A thể hiện đúng định nghĩa cốt lõi của bài học.`
    });
  }

  for (let i = 1; i <= nComp; i++) {
    questions.push({
      level: 'Thông hiểu',
      questionText: `Tại sao trong quá trình triển khai '${topic}', việc tuân thủ nguyên tắc kỹ thuật lại quyết định đến chất lượng sản phẩm?`,
      options: [
        `A. Vì giúp giảm thiểu sai số, đảm bảo tính liên tục và độ tin cậy của hệ thống`,
        `B. Vì làm tăng thời gian vận hành lên gấp đôi`,
        `C. Vì không cần sự giám sát của giáo viên hướng dẫn`,
        `D. Vì chỉ có tác dụng về mặt hình thức lý thuyết`
      ],
      correctAnswer: 'A',
      explanation: `Bản chất của phương pháp khoa học là chuẩn hóa quy trình nhằm loại bỏ sai số và kiểm soát chất lượng đầu ra.`
    });
  }

  for (let i = 1; i <= nApp; i++) {
    questions.push({
      level: 'Vận dụng',
      questionText: `Cho một tình huống thực tế liên quan đến '${topic}', nếu xuất hiện sai lệch thông số ở bước đầu tiên, giải pháp xử lý kỹ thuật tối ưu là:`,
      options: [
        `A. Dừng hệ thống, đo kiểm lại chuẩn kích thước/thông số và bù sai số trước khi tiếp tục`,
        `B. Tiếp tục vận hành với hy vọng các bước sau sẽ tự bù trừ sai lệch`,
        `C. Tăng tốc độ làm việc để hoàn thành bài tập nhanh hơn`,
        `D. Thay thế toàn bộ thiết bị mới mà không cần phân tích nguyên nhân`
      ],
      correctAnswer: 'A',
      explanation: `Kỹ năng vận dụng đòi hỏi người học nhận diện sai hỏng kịp thời và khắc phục ngay từ nguồn gốc để tránh hỏng hàng loạt.`
    });
  }

  for (let i = 1; i <= nAdv; i++) {
    questions.push({
      level: 'Vận dụng cao',
      questionText: `Đề xuất một giải pháp sáng tạo nhằm tối ưu hóa hiệu suất hoặc giảm thiểu lãng phí vật tư/năng lượng trong chủ đề '${topic}':`,
      options: [
        `A. Tích hợp công nghệ đo lường kỹ thuật số tự động và quy chuẩn hóa quy trình 5S kết hợp Kaizen`,
        `B. Bỏ qua các bước kiểm tra an toàn trung gian để rút ngắn thời gian`,
        `C. Giảm bớt số lượng chi tiết trong bản vẽ mà không cần thẩm định`,
        `D. Sử dụng vật tư giá rẻ không rõ nguồn gốc xuất xứ`
      ],
      correctAnswer: 'A',
      explanation: `Mức độ vận dụng cao đòi hỏi khả năng tư duy giải pháp tổng thể, kết hợp cải tiến liên tục (Kaizen) và công nghệ số.`
    });
  }

  return {
    topic,
    subject: subject || 'Chung',
    grade: grade || 'Phổ thông / Dạy nghề',
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
    questions
  };
}

export function lessonPlan5512ToHtml(plan: LessonPlan5512Data): string {
  return `
  <div style="text-align: center; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 12pt; text-transform: uppercase;">SỞ GIÁO DỤC VÀ ĐÀO TẠO • TRƯỜNG PHỔ THÔNG</p>
    <p style="margin: 0; font-size: 11pt; font-style: italic;">Khung Kế hoạch bài dạy chuẩn Công văn 5512/BGDĐT-GDTrH</p>
    <h1 style="margin: 15px 0 5px 0; font-size: 17pt; color: #1e3a8a; text-transform: uppercase;">KẾ HOẠCH BÀI DẠY</h1>
    <h2 style="margin: 0; font-size: 14pt; color: #0284c7;">BÀI: ${plan.lessonTitle}</h2>
    <p style="margin-top: 6px; font-size: 12pt;"><b>Môn:</b> ${plan.subject} | <b>Khối/Lớp:</b> ${plan.grade} | <b>Thời lượng:</b> ${plan.durationMinutes} phút</p>
  </div>

  <h3 style="color: #1e3a8a; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 3px;">I. MỤC TIÊU BÀI DẠY</h3>
  <p><b>1. Kiến thức:</b> ${plan.objectives.knowledge}</p>
  <p><b>2. Năng lực:</b> ${plan.objectives.competencies}</p>
  <p><b>3. Phẩm chất:</b> ${plan.objectives.qualities}</p>

  <h3 style="color: #1e3a8a; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 3px; margin-top: 18px;">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
  <p><b>1. Giáo viên:</b> ${plan.equipment.teacherEquipment}</p>
  <p><b>2. Học sinh:</b> ${plan.equipment.studentEquipment}</p>

  <h3 style="color: #1e3a8a; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 3px; margin-top: 18px;">III. TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG BẮT BUỘC)</h3>
  
  <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; margin-top: 10px;">
    <tr style="background-color: #f1f5f9;">
      <th style="width: 25%;">Hoạt động</th>
      <th style="width: 75%;">Nội dung chi tiết & Tổ chức thực hiện</th>
    </tr>
    <tr>
      <td><b>1. ${plan.activity1Opening.name}</b></td>
      <td>
        <p><b>• Mục tiêu:</b> ${plan.activity1Opening.objective}</p>
        <p><b>• Nội dung:</b> ${plan.activity1Opening.content}</p>
        <p><b>• Sản phẩm:</b> ${plan.activity1Opening.product}</p>
        <p><b>• Tổ chức thực hiện:</b> ${plan.activity1Opening.implementation}</p>
      </td>
    </tr>
    <tr>
      <td><b>2. ${plan.activity2Knowledge.name}</b></td>
      <td>
        <p><b>• Mục tiêu:</b> ${plan.activity2Knowledge.objective}</p>
        <p><b>• Nội dung:</b> ${plan.activity2Knowledge.content}</p>
        <p><b>• Sản phẩm:</b> ${plan.activity2Knowledge.product}</p>
        <p><b>• Tổ chức thực hiện:</b> ${plan.activity2Knowledge.implementation}</p>
      </td>
    </tr>
    <tr>
      <td><b>3. ${plan.activity3Practice.name}</b></td>
      <td>
        <p><b>• Mục tiêu:</b> ${plan.activity3Practice.objective}</p>
        <p><b>• Nội dung:</b> ${plan.activity3Practice.content}</p>
        <p><b>• Sản phẩm:</b> ${plan.activity3Practice.product}</p>
        <p><b>• Tổ chức thực hiện:</b> ${plan.activity3Practice.implementation}</p>
      </td>
    </tr>
    <tr>
      <td><b>4. ${plan.activity4Application.name}</b></td>
      <td>
        <p><b>• Mục tiêu:</b> ${plan.activity4Application.objective}</p>
        <p><b>• Nội dung:</b> ${plan.activity4Application.content}</p>
        <p><b>• Sản phẩm:</b> ${plan.activity4Application.product}</p>
        <p><b>• Tổ chức thực hiện:</b> ${plan.activity4Application.implementation}</p>
      </td>
    </tr>
  </table>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; text-align: center;">
    <div style="width: 45%; float: left; text-align: center;">
      <p><b>TỔ TRƯỞNG CHUYÊN MÔN</b></p>
      <p style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</p>
    </div>
    <div style="width: 45%; float: right; text-align: center;">
      <p><b>GIÁO VIÊN SOẠN BÀI</b></p>
      <p style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</p>
    </div>
    <div style="clear: both;"></div>
  </div>
  `;
}

export function lessonPlan2634ToHtml(plan: LessonPlan2634Data): string {
  return `
  <div style="text-align: center; margin-bottom: 20px;">
    <p style="margin: 0; font-size: 12pt; text-transform: uppercase;">TỔNG CỤC GIÁO DỤC NGHỀ NGHIỆP • TRƯỜNG CAO ĐẲNG / TRUNG CẤP</p>
    <p style="margin: 0; font-size: 11pt; font-style: italic;">Khung Giáo án Bài giảng Thực hành chuẩn Công văn 2634/GDNN</p>
    <h1 style="margin: 15px 0 5px 0; font-size: 17pt; color: #b45309; text-transform: uppercase;">GIÁO ÁN BÀI DẠY THỰC HÀNH NGHỀ</h1>
    <h2 style="margin: 0; font-size: 14pt; color: #d97706;">BÀI THỰC HÀNH: ${plan.moduleTitle}</h2>
    <p style="margin-top: 6px; font-size: 12pt;"><b>Nghề:</b> ${plan.occupation} | <b>Trình độ:</b> ${plan.level} | <b>Thời lượng:</b> ${plan.durationMinutes} phút (Tại xưởng)</p>
  </div>

  <h3 style="color: #b45309; border-bottom: 1.5px solid #b45309; padding-bottom: 3px;">I. MỤC TIÊU ĐÀO TẠO</h3>
  <p><b>1. Kiến thức nghề:</b> ${plan.objectives.knowledge}</p>
  <p><b>2. Kỹ năng thực hành:</b> ${plan.objectives.skills}</p>
  <p><b>3. Năng lực tự chủ, An toàn lao động & 5S:</b> ${plan.objectives.autonomyAndSafety}</p>

  <h3 style="color: #b45309; border-bottom: 1.5px solid #b45309; padding-bottom: 3px; margin-top: 18px;">II. ĐIỀU KIỆN THỰC HIỆN BÀI DẠY (XƯỞNG THỰC HÀNH)</h3>
  <p><b>1. Thiết bị máy móc & Dụng cụ:</b> ${plan.conditions.equipmentAndMachines}</p>
  <p><b>2. Vật tư, phôi mẫu gia công:</b> ${plan.conditions.materialsAndWorkpieces}</p>
  <p><b>3. Trang bị BHLĐ & Quy chuẩn 5S:</b> ${plan.conditions.safetyAnd5S}</p>

  <h3 style="color: #b45309; border-bottom: 1.5px solid #b45309; padding-bottom: 3px; margin-top: 18px;">III. TIẾN TRÌNH THỰC HIỆN TẠI XƯỞNG (4 BƯỚC THỰC HÀNH NGHỀ)</h3>
  
  <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%; margin-top: 10px;">
    <tr style="background-color: #fef3c7;">
      <th style="width: 25%;">Các bước thực hiện</th>
      <th style="width: 50%;">Hoạt động của GV & Học sinh</th>
      <th style="width: 25%;">Trọng tâm Kỹ năng, ATLĐ & 5S</th>
    </tr>
    <tr>
      <td><b>${plan.step1Orientation.name}</b></td>
      <td>
        <p><b>• GV:</b> ${plan.step1Orientation.teacherActivity}</p>
        <p><b>• HS:</b> ${plan.step1Orientation.studentActivity}</p>
      </td>
      <td><span style="color: #b91c1c; font-weight: bold;">⚠️ ATLĐ:</span> ${plan.step1Orientation.safetyAndKeyPoints}</td>
    </tr>
    <tr>
      <td><b>${plan.step2Demonstration.name}</b></td>
      <td>
        <p><b>• GV:</b> ${plan.step2Demonstration.teacherActivity}</p>
        <p><b>• HS:</b> ${plan.step2Demonstration.studentActivity}</p>
      </td>
      <td><span style="color: #b45309; font-weight: bold;">🔍 Kỹ năng mẫu:</span> ${plan.step2Demonstration.safetyAndKeyPoints}</td>
    </tr>
    <tr>
      <td><b>${plan.step3Practice.name}</b></td>
      <td>
        <p><b>• GV:</b> ${plan.step3Practice.teacherActivity}</p>
        <p><b>• HS:</b> ${plan.step3Practice.studentActivity}</p>
      </td>
      <td><span style="color: #047857; font-weight: bold;">🛠️ Giám sát:</span> ${plan.step3Practice.safetyAndKeyPoints}</td>
    </tr>
    <tr>
      <td><b>${plan.step4Evaluation.name}</b></td>
      <td>
        <p><b>• GV:</b> ${plan.step4Evaluation.teacherActivity}</p>
        <p><b>• HS:</b> ${plan.step4Evaluation.studentActivity}</p>
      </td>
      <td><span style="color: #4338ca; font-weight: bold;">🧹 5S Xưởng:</span> ${plan.step4Evaluation.safetyAndKeyPoints}</td>
    </tr>
  </table>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; text-align: center;">
    <div style="width: 45%; float: left; text-align: center;">
      <p><b>TRƯỞNG KHOA / TRƯỞNG BỘ MÔN</b></p>
      <p style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</p>
    </div>
    <div style="width: 45%; float: right; text-align: center;">
      <p><b>GIÁO VIÊN HƯỚNG DẪN XƯỞNG</b></p>
      <p style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</p>
    </div>
    <div style="clear: both;"></div>
  </div>
  `;
}

export function examMatrixToHtml(data: ExamMatrixData): string {
  let questionsHtml = '';
  data.questions.forEach((q, idx) => {
    questionsHtml += `
    <div style="margin-bottom: 16px; page-break-inside: avoid;">
      <p style="margin: 4px 0; font-weight: bold;">Câu ${idx + 1} (${q.level}): <span style="font-weight: normal;">${q.questionText}</span></p>
      <div style="padding-left: 15px; margin: 4px 0;">
        ${q.options.map(opt => `<p style="margin: 2px 0;">${opt}</p>`).join('')}
      </div>
      <p style="margin: 3px 0; color: #047857; font-weight: bold; font-size: 11pt;">• Đáp án đúng: ${q.correctAnswer}</p>
      <p style="margin: 2px 0; font-style: italic; font-size: 10.5pt; color: #555;">• Giải thích: ${q.explanation}</p>
    </div>
    `;
  });

  return `
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 16pt; color: #7e22ce; text-transform: uppercase;">MA TRẬN & ĐỀ KIỂM TRA 4 MỨC ĐỘ NHẬN THỨC</h1>
    <h2 style="margin: 5px 0; font-size: 13pt;">CHỦ ĐỀ: ${data.topic}</h2>
    <p style="margin: 4px 0; font-size: 11pt;"><b>Môn:</b> ${data.subject} | <b>Khối lớp:</b> ${data.grade} | <b>Tổng số câu:</b> ${data.questionCount}</p>
  </div>

  <h3 style="color: #7e22ce; border-bottom: 1.5px solid #7e22ce; padding-bottom: 3px;">I. BẢNG MA TRẬN ĐỀ THI 4 MỨC ĐỘ</h3>
  <table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; margin: 10px 0; text-align: center;">
    <tr style="background-color: #f3e8ff;">
      <th>Mức độ nhận thức</th>
      <th>Số lượng câu</th>
      <th>Tỉ lệ %</th>
      <th>Ghi chú</th>
    </tr>
    <tr>
      <td style="text-align: left; font-weight: bold;">1. Nhận biết</td>
      <td>${data.matrix.recognitionCount}</td>
      <td>${data.matrix.recognitionPercent}%</td>
      <td>Tái hiện khái niệm cốt lõi</td>
    </tr>
    <tr>
      <td style="text-align: left; font-weight: bold;">2. Thông hiểu</td>
      <td>${data.matrix.comprehensionCount}</td>
      <td>${data.matrix.comprehensionPercent}%</td>
      <td>Giải thích nguyên lý, bản chất</td>
    </tr>
    <tr>
      <td style="text-align: left; font-weight: bold;">3. Vận dụng</td>
      <td>${data.matrix.applicationCount}</td>
      <td>${data.matrix.applicationPercent}%</td>
      <td>Giải quyết tình huống thực tế</td>
    </tr>
    <tr>
      <td style="text-align: left; font-weight: bold;">4. Vận dụng cao</td>
      <td>${data.matrix.advancedApplicationCount}</td>
      <td>${data.matrix.advancedApplicationPercent}%</td>
      <td>Tư duy sáng tạo, tối ưu hóa</td>
    </tr>
    <tr style="font-weight: bold; background-color: #faf5ff;">
      <td>TỔNG CỘNG</td>
      <td>${data.questionCount} câu</td>
      <td>100%</td>
      <td>Đạt chuẩn kiểm tra đánh giá</td>
    </tr>
  </table>

  <h3 style="color: #7e22ce; border-bottom: 1.5px solid #7e22ce; padding-bottom: 3px; margin-top: 20px;">II. NỘI DUNG ĐỀ THI & ĐÁP ÁN CHI TIẾT</h3>
  ${questionsHtml}
  `;
}

export function downloadWordDoc(filename: string, htmlContent: string) {
  const fullHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${filename}</title>
<style>
body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.35; margin: 2cm 2cm 2cm 2.5cm; }
h1 { font-size: 16pt; text-align: center; font-weight: bold; margin-bottom: 8px; }
h2 { font-size: 13pt; font-weight: bold; margin-top: 12px; margin-bottom: 6px; }
h3 { font-size: 12.5pt; font-weight: bold; margin-top: 10px; margin-bottom: 4px; }
p { margin: 4px 0; text-align: justify; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; }
th, td { border: 1px solid #333; padding: 6px 8px; font-size: 12pt; }
th { background-color: #f2f2f2; font-weight: bold; }
</style>
</head>
<body>${htmlContent}</body></html>`;

  const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
