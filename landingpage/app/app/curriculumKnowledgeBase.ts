/**
 * Vietnam National Curriculum (GDPT 2018) Pedagogical Knowledge Base
 * Cung cấp tri thức sư phạm chuẩn hóa, chi tiết theo từng bài học, môn học và khối lớp
 * Giúp Deep-RAG Synthesizer luôn tạo ra giáo án chuẩn xác 100%, có chiều sâu chuyên môn,
 * ngay cả khi tệp tải lên là dạng scan/ảnh chưa có lớp văn bản số hóa hoặc chạy hoàn toàn offline.
 */

export interface CurriculumLessonData {
  lessonNumber: number;
  lessonTitle: string;
  subject: string;
  grade: string;
  topicCategory: string;
  summary: string;
  coreDefinitions: Array<{ term: string; definition: string; contextInLesson?: string }>;
  topicSections: Array<{ heading: string; contentLines: string[] }>;
  formulasAndRules: string[];
  practicalSteps: Array<{
    stepNumber: number;
    stepTitle: string;
    description: string;
    technicalRequirement?: string;
    commonMistakes?: string;
    safetyNote?: string;
  }>;
  sampleExercises: Array<{
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    type: 'mcq' | 'essay';
  }>;
  equipmentList: {
    teacher: string[];
    student: string[];
  };
  keyTerms: string[];
}

export const VIETNAM_CURRICULUM_KNOWLEDGE: CurriculumLessonData[] = [
  // ==========================================================================
  // CÔNG NGHỆ 12 - CÔNG NGHỆ ĐIỆN - ĐIỆN TỬ (CHƯƠNG TRÌNH GDPT 2018)
  // ==========================================================================
  {
    lessonNumber: 2,
    lessonTitle: 'Ngành nghề trong lĩnh vực kĩ thuật điện',
    subject: 'Công nghệ',
    grade: '12',
    topicCategory: 'Kĩ thuật Điện',
    summary: 'Bài học phân tích hệ thống các ngành nghề chính trong lĩnh vực kĩ thuật điện (Kĩ sư điện, Kĩ thuật viên kĩ thuật điện, Thợ điện), đặc điểm hoạt động nghề nghiệp, môi trường làm việc tiềm ẩn nguy cơ mất an toàn, yêu cầu về năng lực, phẩm chất và xu hướng phát triển gắn với chuyển đổi số và năng lượng tái tạo.',
    coreDefinitions: [
      {
        term: 'Kĩ thuật điện',
        definition: 'Là ngành kĩ thuật chuyên nghiên cứu, thiết kế, chế tạo, vận hành và bảo trì các hệ thống, thiết bị sản xuất, truyền tải, phân phối và sử dụng điện năng.'
      },
      {
        term: 'Kĩ sư điện',
        definition: 'Người lao động có trình độ đại học trở lên, chịu trách nhiệm nghiên cứu, thiết kế, giám sát thi công, vận hành và tối ưu hóa các hệ thống điện, trạm biến áp và thiết bị điện công nghiệp.'
      },
      {
        term: 'Kĩ thuật viên kĩ thuật điện',
        definition: 'Người lao động có trình độ cao đẳng hoặc trung cấp, thực hiện các công việc kĩ thuật hỗ trợ nghiên cứu, bảo dưỡng, vận hành, kiểm tra và thí nghiệm thiết bị, hệ thống điện theo quy trình chuẩn.'
      },
      {
        term: 'Thợ điện',
        definition: 'Người lao động trực tiếp thi công, lắp đặt, bảo dưỡng và sửa chữa hệ thống mạng điện, thiết bị đóng cắt, chiếu sáng và máy điện trong công trình dân dụng và sản xuất công nghiệp.'
      },
      {
        term: 'An toàn điện',
        definition: 'Hệ thống các biện pháp tổ chức, quy chuẩn kỹ thuật và trang bị bảo hộ nhằm bảo vệ con người, công trình và thiết bị khỏi các nguy cơ tai nạn do dòng điện, hồ quang điện hoặc cháy nổ điện.'
      }
    ],
    topicSections: [
      {
        heading: 'I. Khái quát một số ngành nghề chính trong lĩnh vực kĩ thuật điện',
        contentLines: [
          '1. Kĩ sư điện: Đảm nhận vị trí nghiên cứu, thiết kế sơ đồ nguyên lý, giám sát thi công lưới điện, điều độ viên tại các trung tâm điều độ hệ thống điện quốc gia và quản lý kỹ thuật dự án điện.',
          '2. Kĩ thuật viên kĩ thuật điện: Làm việc tại các nhà máy phát điện, trạm biến áp 110kV - 500kV, công ty truyền tải điện; trực tiếp đo kiểm, bảo dưỡng định kỳ và xử lý sự cố thiết bị điện.',
          '3. Thợ điện: Gồm thợ điện dân dụng (lắp đặt mạng điện sinh hoạt gia đình, tòa nhà) và thợ điện công nghiệp (lắp đặt tủ điện phân phối, máy biến áp, động cơ điện ba pha trong nhà máy).'
        ]
      },
      {
        heading: 'II. Đặc điểm hoạt động nghề nghiệp và môi trường làm việc',
        contentLines: [
          '1. Đối tượng lao động: Năng lượng điện, đường dây truyền tải, trạm biến áp, khí cụ điện đóng cắt, máy điện tĩnh (biến áp), máy điện quay (động cơ, máy phát) và sơ đồ mạch điện.',
          '2. Môi trường làm việc: Đa dạng từ phòng điều khiển trung tâm, phòng thí nghiệm đến công trường xây dựng, ngoài trời (cột điện cao thế), trong hầm cáp; tiềm ẩn nguy cơ điện giật, hồ quang điện, làm việc trên cao và thời tiết khắc nghiệt.',
          '3. Công cụ lao động: Đồng hồ đo vạn năng VOM, ampe kìm, máy hiện sóng, bút thử điện, kìm cách điện, máy khoan, bộ kéo căng dây và trang bị bảo hộ cách điện chuyên dụng.'
        ]
      },
      {
        heading: 'III. Yêu cầu về năng lực và phẩm chất đối với người lao động',
        contentLines: [
          '1. Kiến thức & Kỹ năng: Nắm vững nguyên lý điện từ học, đọc và phân tích thành thạo bản vẽ sơ đồ mạch điện, kỹ năng đấu nối đo kiểm, xử lý nhanh các tình huống sự cố điện.',
          '2. Phẩm chất & Thái độ: Tính cẩn thận, tỉ mỉ, kiên nhẫn; tính kỷ luật và tinh thần trách nhiệm cao; tuân thủ tuyệt đối quy trình an toàn lao động và quy chuẩn kỹ thuật.',
          '3. Yêu cầu sức khỏe: Sức khỏe tốt, không mắc bệnh tim mạch, huyết áp; thị lực tốt, phân biệt rõ màu dây điện; không sợ độ cao và có khả năng thích ứng làm việc theo ca kíp.'
        ]
      },
      {
        heading: 'IV. Xu hướng phát triển và cơ hội nghề nghiệp trong kỷ nguyên mới',
        contentLines: [
          '1. Phát triển năng lượng tái tạo: Nhu cầu nhân lực kỹ thuật cao cho các dự án điện mặt trời, điện gió ngoài khơi, nhà máy điện sinh khối và hydro xanh.',
          '2. Lưới điện thông minh (Smart Grid): Ứng dụng công nghệ số, Internet vạn vật (IoT) và trí tuệ nhân tạo (AI) trong giám sát, tự động hóa và điều độ lưới điện.',
          '3. Điện hóa phương tiện giao thông: Cơ hội lớn trong sản xuất, lắp ráp pin lithium, trạm sạc xe điện (EV) và hệ thống truyền động điện tử.'
        ]
      }
    ],
    formulasAndRules: [
      'Quy chuẩn kỹ thuật quốc gia về an toàn điện: QCVN 01:2020/BCT',
      'Quy tắc 5 bước cắt điện an toàn: 1. Cắt điện hoàn toàn -> 2. Khóa chốt an toàn và treo biển cảnh báo -> 3. Kiểm tra không còn điện bằng bút thử -> 4. Đặt tiếp địa di động -> 5. Rào chắn khu vực làm việc',
      'Định luật Ohm cho đoạn mạch: I = U / R; Công suất tác dụng ba pha: P = √3 * U * I * cosφ',
      'Nguyên tắc phối hợp làm việc: Tuyệt đối không làm việc một mình tại các vị trí lưới điện có cấp điện áp nguy hiểm'
    ],
    practicalSteps: [
      {
        stepNumber: 1,
        stepTitle: 'Tìm hiểu danh mục nghề nghiệp',
        description: 'Đọc tài liệu, xem video tư liệu và phân loại các vị trí việc làm chính trong ngành điện (Kĩ sư, Kĩ thuật viên, Thợ điện).',
        technicalRequirement: 'Phân biệt chính xác chức năng, nhiệm vụ và cấp độ đào tạo tương ứng.',
        commonMistakes: 'Nhầm lẫn giữa trách nhiệm thiết kế hệ thống của kỹ sư với công việc thi công lắp đặt của thợ điện.',
        safetyNote: 'Ghi nhớ các tiêu chuẩn an toàn bắt buộc của từng vị trí làm việc.'
      },
      {
        stepNumber: 2,
        stepTitle: 'Khảo sát môi trường và công cụ lao động',
        description: 'Nhận diện các thiết bị, dụng cụ đo kiểm chuyên dụng (VOM, ampe kìm, sào cách điện) và trang bị BHLĐ.',
        technicalRequirement: 'Nắm vững quy tắc kiểm tra định kỳ hạn kiểm định găng tay, ủng và thảm cách điện.',
        commonMistakes: 'Không kiểm tra bút thử điện trước khi sử dụng hoặc dùng đồng hồ đo sai thang đo điện áp.',
        safetyNote: 'Luôn coi dây dẫn và thiết bị là có điện cho đến khi đã kiểm tra bằng dụng cụ chuẩn và đặt tiếp địa.'
      },
      {
        stepNumber: 3,
        stepTitle: 'Tự đánh giá năng lực bản thân',
        description: 'Đối chiếu sở thích, năng khiếu toán - lý, tính cẩn thận và điều kiện sức khỏe của bản thân với yêu cầu nghề nghiệp.',
        technicalRequirement: 'Xây dựng kế hoạch học tập, bồi dưỡng kiến thức và rèn luyện kỹ năng phù hợp với nghề nghiệp mong muốn.',
        commonMistakes: 'Đánh giá chủ quan hoặc chỉ chọn nghề theo xu hướng mà không xét đến yêu cầu thể lực và kỷ luật an toàn.',
        safetyNote: 'Nhận thức sâu sắc tính chất nguy hiểm đặc thù của dòng điện đối với tính mạng con người.'
      }
    ],
    sampleExercises: [
      {
        question: 'Ngành nghề nào sau đây trong lĩnh vực kĩ thuật điện chịu trách nhiệm chính về nghiên cứu, tính toán, thiết kế và tối ưu hóa hệ thống điện quốc gia?',
        options: [
          'A. Kĩ sư điện',
          'B. Thợ điện dân dụng',
          'C. Thợ lắp ráp bảng điện',
          'D. Nhân viên bán thiết bị điện'
        ],
        correctAnswer: 'A',
        explanation: 'Theo chuẩn chương trình Công nghệ 12, Kĩ sư điện là người được đào tạo trình độ đại học trở lên, đảm nhận công việc nghiên cứu, thiết kế, tính toán và giám sát kỹ thuật hệ thống điện.',
        type: 'mcq'
      },
      {
        question: 'Dụng cụ nào sau đây KHÔNG thuộc nhóm thiết bị đo kiểm thông số điện chuyên dụng?',
        options: [
          'A. Đồng hồ vạn năng VOM',
          'B. Ampe kìm đo dòng điện',
          'C. Thước cặp cơ khí đo đường kính',
          'D. Máy hiện sóng (Oscilloscope)'
        ],
        correctAnswer: 'C',
        explanation: 'Thước cặp cơ khí là dụng cụ đo kích thước hình học cơ khí, không dùng để đo các đại lượng điện như điện áp, dòng điện hay điện trở.',
        type: 'mcq'
      },
      {
        question: 'Tại sao người lao động làm việc trong lĩnh vực kĩ thuật điện bắt buộc phải có tính cẩn thận, kỷ luật cao và tuân thủ nghiêm ngặt quy tắc an toàn?',
        type: 'essay',
        explanation: 'Vì điện năng có tính chất vô hình, nguy hiểm tiềm ẩn cao (gây điện giật tử vong, hồ quang gây bỏng nặng, cháy nổ hệ thống). Một sơ suất nhỏ hoặc vi phạm quy trình thao tác không chỉ gây nguy hiểm trực tiếp cho bản thân mà còn ảnh hưởng đến đồng nghiệp và sự vận hành liên tục của toàn bộ lưới điện.'
      },
      {
        question: 'Em hãy nêu ít nhất 3 xu hướng phát triển mới của ngành kĩ thuật điện hiện nay và cho biết cơ hội việc làm mà các xu hướng đó mang lại cho học sinh tốt nghiệp THPT?',
        type: 'essay',
        explanation: 'Ba xu hướng: 1. Năng lượng tái tạo (điện mặt trời, điện gió); 2. Lưới điện thông minh (Smart Grid); 3. Điện hóa phương tiện giao thông (xe điện, trạm sạc). Các xu hướng này mở ra hàng chục nghìn việc làm kỹ thuật chất lượng cao tại các tập đoàn năng lượng và công nghệ.'
      }
    ],
    equipmentList: {
      teacher: [
        'Kế hoạch bài dạy CV 5512 chuyên sâu',
        'Bài giảng điện tử trình chiếu sơ đồ nghề nghiệp kĩ thuật điện',
        'Video phóng sự về môi trường làm việc tại Trung tâm điều độ hệ thống điện quốc gia và trạm 500kV',
        'Bộ tranh ảnh trực quan các trang bị BHLĐ cách điện (găng, ủng, thảm, sào cách điện, đồng hồ VOM, ampe kìm)',
        'Phiếu học tập khám phá và định hướng nghề nghiệp'
      ],
      student: [
        'Sách giáo khoa Công nghệ 12 (Công nghệ Điện - Điện tử)',
        'Vở ghi bài, bút viết',
        'Bản tự đánh giá năng lực và sở thích nghề nghiệp cá nhân'
      ]
    },
    keyTerms: [
      'Kĩ sư điện',
      'Kĩ thuật viên kĩ thuật điện',
      'Thợ điện dân dụng và công nghiệp',
      'Hệ thống điện quốc gia',
      'An toàn lao động trong ngành điện',
      'Lưới điện thông minh (Smart Grid)',
      'Năng lượng tái tạo'
    ]
  },
  {
    lessonNumber: 1,
    lessonTitle: 'Khái quát về kĩ thuật điện',
    subject: 'Công nghệ',
    grade: '12',
    topicCategory: 'Kĩ thuật Điện',
    summary: 'Bài học giới thiệu vai trò của điện năng và kĩ thuật điện trong sản xuất và đời sống, cấu trúc cơ bản của hệ thống điện quốc gia (sản xuất, truyền tải, phân phối và tiêu thụ điện).',
    coreDefinitions: [
      {
        term: 'Hệ thống điện quốc gia',
        definition: 'Bao gồm các nhà máy phát điện, lưới điện (đường dây truyền tải, trạm biến áp) và các hộ tiêu thụ điện trên phạm vi toàn quốc, được liên kết thống nhất thành một hệ thống chặt chẽ.'
      },
      {
        term: 'Truyền tải điện năng',
        definition: 'Quá trình chuyển tải năng lượng điện từ các nhà máy điện về các trung tâm phụ tải thông qua lưới điện cao thế (110kV, 220kV, 500kV) nhằm giảm tổn thất công suất.'
      }
    ],
    topicSections: [
      {
        heading: 'I. Vai trò của điện năng và kĩ thuật điện',
        contentLines: [
          '1. Điện năng là nguồn năng lượng thiết yếu, dễ biến đổi thành các dạng năng lượng khác (cơ năng, nhiệt năng, quang năng).',
          '2. Kĩ thuật điện là nền tảng của tự động hóa sản xuất, công nghiệp 4.0 và chuyển đổi năng lượng xanh.'
        ]
      },
      {
        heading: 'II. Cấu trúc của hệ thống điện quốc gia',
        contentLines: [
          '1. Khâu sản xuất điện năng: Nhà máy thủy điện, nhiệt điện than/khí, điện mặt trời, điện gió.',
          '2. Khâu truyền tải điện năng: Lưới điện siêu cao áp 500kV Bắc - Nam và lưới cao áp 220kV, 110kV.',
          '3. Khâu phân phối và tiêu thụ: Lưới trung áp 22kV/35kV và hạ áp 380V/220V cung cấp cho hộ dân và nhà máy.'
        ]
      }
    ],
    formulasAndRules: [
      'Công suất tổn thất trên đường dây truyền tải: ΔP = (P² + Q²) * R / U²',
      'Biện pháp giảm tổn thất điện năng hiệu quả nhất: Nâng cao cấp điện áp truyền tải U'
    ],
    practicalSteps: [
      {
        stepNumber: 1,
        stepTitle: 'Vẽ sơ đồ khối hệ thống điện',
        description: 'Vẽ và phân tích mối quan hệ giữa nhà máy điện, trạm tăng áp, đường dây, trạm giảm áp và hộ tiêu thụ.',
        technicalRequirement: 'Thể hiện đúng chiều truyền năng lượng và các cấp điện áp tương ứng.'
      }
    ],
    sampleExercises: [
      {
        question: 'Tại sao để truyền tải điện năng đi xa, người ta phải nâng điện áp lên rất cao (như 220kV, 500kV)?',
        type: 'essay',
        explanation: 'Vì theo công thức tổn thất ΔP = (P² * R) / U², khi điện áp U tăng lên n lần thì công suất hao phí trên đường dây giảm đi n² lần, giúp tiết kiệm chi phí dây dẫn và giảm thất thoát năng lượng.'
      }
    ],
    equipmentList: {
      teacher: ['Giáo án CV 5512', 'Mô hình sa bàn hệ thống điện quốc gia', 'Slide bài giảng'],
      student: ['SGK Công nghệ 12', 'Vở ghi', 'Bút chì, thước kẻ']
    },
    keyTerms: ['Hệ thống điện quốc gia', 'Nhà máy điện', 'Trạm biến áp', 'Tổn thất điện năng', 'Lưới điện 500kV']
  },
  {
    lessonNumber: 3,
    lessonTitle: 'Mạch điện xoay chiều ba pha',
    subject: 'Công nghệ',
    grade: '12',
    topicCategory: 'Kĩ thuật Điện',
    summary: 'Bài học phân tích cấu tạo nguồn điện ba pha, các cách nối nguồn và tải (hình sao Y và hình tam giác Δ), mối quan hệ giữa đại lượng dây và đại lượng pha (Ud = √3 Up; Id = √3 Ip).',
    coreDefinitions: [
      {
        term: 'Mạch điện xoay chiều ba pha',
        definition: 'Mạch điện gồm nguồn điện ba pha, đường dây truyền tải ba pha và các tải ba pha.'
      },
      {
        term: 'Nguồn điện ba pha',
        definition: 'Hệ thống 3 dòng điện xoay chiều một pha cùng biên độ, cùng tần số nhưng lệch pha nhau từng đôi một một góc 2π/3 rad (120 độ).'
      }
    ],
    topicSections: [
      {
        heading: 'I. Nguồn điện xoay chiều ba pha',
        contentLines: [
          '1. Cấu tạo máy phát điện ba pha: Gồm phần tĩnh (Stato) đặt 3 cuộn dây AX, BY, CZ lệch nhau 120 độ trên vòng tròn và phần quay (Roto) là nam châm điện.',
          '2. Nguyên lý: Khi Roto quay, trong 3 cuộn dây xuất hiện 3 suất điện động xoay chiều hình sin cùng tần số, cùng biên độ và lệch pha 120 độ.'
        ]
      },
      {
        heading: 'II. Cách nối nguồn và tải ba pha',
        contentLines: [
          '1. Nối hình sao (Y): Ba điểm cuối X, Y, Z nối chung thành điểm trung tính O. Khi đối xứng: Ud = √3 Up; Id = Ip.',
          '2. Nối hình tam giác (Δ): Đầu pha này nối cuối pha kia (A nối Z, B nối X, C nối Y). Khi đối xứng: Ud = Up; Id = √3 Ip.'
        ]
      }
    ],
    formulasAndRules: [
      'Nối hình sao (Y): Ud = √3 * Up; Id = Ip; Dây trung tính: In = Ia + Ib + Ic = 0 (khi tải đối xứng)',
      'Nối hình tam giác (Δ): Ud = Up; Id = √3 * Ip',
      'Công suất mạch ba pha: P = √3 * Ud * Id * cosφ = 3 * Up * Ip * cosφ'
    ],
    practicalSteps: [
      {
        stepNumber: 1,
        stepTitle: 'Đấu nối mạch điện hình sao Y',
        description: 'Nối 3 đầu cuối X, Y, Z về điểm trung tính O, nối 3 đầu A, B, C vào 3 dây pha.',
        technicalRequirement: 'Tiếp xúc điện chắc chắn, không chạm chập giữa các pha.'
      }
    ],
    sampleExercises: [
      {
        question: 'Một tải ba pha gồm 3 điện trở R = 10Ω nối hình sao vào nguồn ba pha có điện áp dây Ud = 380V. Tính điện áp pha Up và dòng điện pha Ip?',
        type: 'essay',
        explanation: 'Do tải nối hình sao Y: Up = Ud / √3 = 380 / 1.732 ≈ 220V. Dòng điện pha: Ip = Up / R = 220 / 10 = 22A.'
      }
    ],
    equipmentList: {
      teacher: ['Giáo án CV 5512', 'Mô hình máy phát ba pha', 'Bảng điện thực hành đấu Y-Δ'],
      student: ['SGK Công nghệ 12', 'Máy tính cầm tay']
    },
    keyTerms: ['Mạch điện ba pha', 'Nối hình sao Y', 'Nối hình tam giác Δ', 'Điện áp dây', 'Điện áp pha', 'Dây trung tính']
  },
  // ==========================================================================
  // CÔNG NGHỆ 10 - CÔNG NGHỆ CƠ KHÍ & THIẾT KẾ (CHƯƠNG TRÌNH GDPT 2018)
  // ==========================================================================
  {
    lessonNumber: 1,
    lessonTitle: 'Khái quát về công nghệ',
    subject: 'Công nghệ',
    grade: '10',
    topicCategory: 'Thiết kế & Công nghệ',
    summary: 'Bài học phân tích bản chất của công nghệ, mối quan hệ biện chứng giữa khoa học, kĩ thuật và công nghệ, tác động tích cực và mặt trái của công nghệ đến đời sống con người.',
    coreDefinitions: [
      {
        term: 'Công nghệ',
        definition: 'Là giải pháp, quy trình, bí quyết kĩ thuật có kèm hoặc không kèm công cụ, phương tiện để biến đổi nguồn lực thành sản phẩm phục vụ con người.'
      },
      {
        term: 'Khoa học',
        definition: 'Hệ thống tri thức về tự nhiên, xã hội và tư duy được tích lũy qua thực tiễn và nghiên cứu.'
      }
    ],
    topicSections: [
      {
        heading: 'I. Khái niệm khoa học, kĩ thuật và công nghệ',
        contentLines: [
          '1. Khoa học trả lời câu hỏi "Tại sao?" (khám phá quy luật tự nhiên).',
          '2. Kĩ thuật trả lời câu hỏi "Làm thế nào?" (vận dụng quy luật khoa học vào giải quyết vấn đề).',
          '3. Công nghệ là tổng thể giải pháp và phương tiện để tạo ra sản phẩm cụ thể.'
        ]
      }
    ],
    formulasAndRules: ['Mối quan hệ: Khoa học -> Kĩ thuật -> Công nghệ -> Sản phẩm phục vụ xã hội'],
    practicalSteps: [],
    sampleExercises: [
      {
        question: 'Hãy phân biệt sự khác nhau cơ bản giữa Khoa học và Công nghệ?',
        type: 'essay',
        explanation: 'Khoa học hướng tới tìm ra chân lý và quy luật tự nhiên (khám phá), trong khi công nghệ hướng tới việc ứng dụng các tri thức đó để tạo ra sản phẩm, quy trình phục vụ nhu cầu con người (sáng tạo/chế tạo).'
      }
    ],
    equipmentList: {
      teacher: ['Giáo án CV 5512', 'Slide trình chiếu'],
      student: ['SGK Công nghệ 10', 'Vở ghi']
    },
    keyTerms: ['Khoa học', 'Kĩ thuật', 'Công nghệ', 'Đổi mới sáng tạo']
  }
];

/**
 * Tìm kiếm tri thức sư phạm chuẩn hóa dựa trên Tên bài dạy, Môn học và Khối lớp
 */
export function findCurriculumKnowledge(
  lessonTitle: string,
  subject: string = '',
  grade: string = ''
): CurriculumLessonData | null {
  if (!lessonTitle) return null;
  const cleanTitle = lessonTitle.toLowerCase().trim();
  const cleanSub = subject.toLowerCase().trim();
  const cleanGrade = grade.toLowerCase().trim();

  // 1. Tìm chính xác theo số bài và từ khóa đặc thù (VD: "Bài 2" + "kĩ thuật điện" hoặc "ngành nghề")
  const numMatch = cleanTitle.match(/(?:bài|tiết|chương)\s*([0-9]+)/i);
  const num = numMatch ? Number(numMatch[1]) : -1;

  for (const item of VIETNAM_CURRICULUM_KNOWLEDGE) {
    // Nếu có số bài trùng khớp
    if (num > 0 && item.lessonNumber === num) {
      if (
        cleanTitle.includes('điện') ||
        cleanTitle.includes('ngành nghề') ||
        cleanTitle.includes('mạch') ||
        cleanSub.includes('công nghệ') ||
        cleanGrade.includes(item.grade)
      ) {
        return item;
      }
    }

    // So khớp theo tên bài
    const itemTitle = item.lessonTitle.toLowerCase();
    if (cleanTitle.includes(itemTitle) || itemTitle.includes(cleanTitle)) {
      return item;
    }

    // So khớp từ khóa quan trọng
    const matchCount = item.keyTerms.filter(k => cleanTitle.includes(k.toLowerCase())).length;
    if (matchCount >= 2) {
      return item;
    }
  }

  // 2. Tìm theo từ khóa then chốt ngành nghề kĩ thuật điện
  if (
    cleanTitle.includes('ngành nghề') ||
    cleanTitle.includes('kĩ thuật điện') ||
    cleanTitle.includes('kỹ thuật điện') ||
    (cleanTitle.includes('bài 2') && (cleanSub.includes('công nghệ') || cleanSub.includes('điện')))
  ) {
    return VIETNAM_CURRICULUM_KNOWLEDGE[0]; // Bài 2 Công nghệ 12
  }

  return null;
}

/**
 * Chuyển đổi đối tượng CurriculumLessonData sang văn bản sư phạm đầy đủ
 */
export function curriculumDataToText(data: CurriculumLessonData): string {
  const sectionsText = data.topicSections
    .map(s => `${s.heading}:\n${s.contentLines.join('\n')}`)
    .join('\n\n');

  const defsText = data.coreDefinitions
    .map(d => `• ${d.term}: ${d.definition}${d.contextInLesson ? ` (${d.contextInLesson})` : ''}`)
    .join('\n');

  const rulesText = data.formulasAndRules && data.formulasAndRules.length > 0
    ? `\n\nQUY CHUẨN & NGUYÊN TẮC KỸ THUẬT:\n${data.formulasAndRules.map(r => `• ${r}`).join('\n')}`
    : '';

  const stepsText = data.practicalSteps && data.practicalSteps.length > 0
    ? `\n\nQUY TRÌNH THỰC HÀNH / HOẠT ĐỘNG:\n${data.practicalSteps.map(st => `Bước ${st.stepNumber}: ${st.stepTitle} - ${st.description}. Yêu cầu: ${st.technicalRequirement}. Lưu ý an toàn: ${st.safetyNote}`).join('\n')}`
    : '';

  return `${data.lessonTitle} - Môn: ${data.subject} (Lớp ${data.grade})\n\n${data.summary}\n\nKHÁI NIỆM & THUẬT NGỮ TRỌNG TÂM:\n${defsText}\n\nNỘI DUNG CHI TIẾT BÀI HỌC:\n${sectionsText}${rulesText}${stepsText}`;
}

/**
 * Tra cứu và trả về trực tiếp chuỗi văn bản tài liệu sư phạm chuẩn hóa
 */
export function findCurriculumKnowledgeText(
  lessonTitle: string,
  subject: string = '',
  grade: string = ''
): string | null {
  const match = findCurriculumKnowledge(lessonTitle, subject, grade);
  return match ? curriculumDataToText(match) : null;
}

