// Pedagogical Skills & Teaching Styles Framework (Hệ thống Bộ Skill Sư Phạm & Phong Cách Giảng Dạy)
// Dành cho Kế hoạch bài dạy chuẩn CV 5512/BGDĐT-GDTrH (GDPT 2018) & CV 2634/GDNN

export interface PedagogicalSkill {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  badgeColor: string;
  applicableStandards: Array<5512 | 2634>;
  methodologySteps: string[];
  promptDirectives: string;
}

export interface TeachingStyle {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  tonePrompt: string;
}

export interface PedagogicalSkillConfig {
  selectedSkillId: string;
  teachingStyleId: string;
  customStyleNote?: string;
}

// 1. Danh mục 7 Bộ Skill Sư Phạm cốt lõi
export const PEDAGOGICAL_SKILLS: PedagogicalSkill[] = [
  {
    id: 'SKILL_5E',
    name: 'Mô hình Dạy học 5E Khám phá',
    shortName: 'Mô hình 5E',
    tagline: 'Gắn kết (Engage) • Khám phá (Explore) • Giải thích (Explain) • Áp dụng (Elaborate) • Đánh giá (Evaluate)',
    description: 'Quy trình học tập kiến tạo hiện đại, kích thích học sinh tự phát hiện quy luật thông qua trải nghiệm trực tiếp trước khi giáo viên chuẩn hóa kiến thức.',
    icon: '🔬',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    applicableStandards: [5512],
    methodologySteps: [
      'Pha 1 (Engage): Khởi động bằng hiện tượng thực tế mâu thuẫn nhận thức.',
      'Pha 2 (Explore): Học sinh thao tác khám phá tài liệu/thí nghiệm/phiếu học tập tìm dữ liệu.',
      'Pha 3 (Explain): Học sinh trình bày cách hiểu, giáo viên chuẩn hóa thuật ngữ và công thức.',
      'Pha 4 (Elaborate): Áp dụng mở rộng vào các tình huống thực tiễn mới phức tạp hơn.',
      'Pha 5 (Evaluate): Đánh giá quá trình và mức độ đạt được mục tiêu học tập.'
    ],
    promptDirectives: `
ÁP DỤNG TRIỆT ĐỂ MÔ HÌNH DẠY HỌC 5E (ENGAGE - EXPLORE - EXPLAIN - ELABORATE - EVALUATE):
- Hoạt động 1 (Engage - Gắn kết): Tạo tình huống gợi mở xuất phát từ hiện tượng thực tế, nêu câu hỏi khơi dậy tò mò khoa học.
- Hoạt động 2 (Explore & Explain - Khám phá & Giải thích): 
  + HS là trung tâm khám phá tài liệu/phiếu học tập để tìm ra bản chất khái niệm, cấu tạo, định lý.
  + Sau khi HS thảo luận, GV mới kết luận chuẩn hóa và phân tích sâu bản chất khoa học.
- Hoạt động 3 (Elaborate - Áp dụng sâu): Đưa ra bài tập/tình huống nâng cấp đòi hỏi suy luận logic, không chỉ là áp dụng rập khuôn.
- Hoạt động 4 (Evaluate - Đánh giá mở rộng): Đánh giá đa chiều, liên hệ thực tế đời sống và chuyển giao nhiệm vụ dự án nhỏ về nhà.
`
  },
  {
    id: 'SKILL_PBL',
    name: 'Dạy học Giải quyết Vấn đề (PBL)',
    shortName: 'Giải quyết vấn đề (PBL)',
    tagline: 'Phát hiện vấn đề -> Xây dựng giả thuyết -> Thu thập chứng cứ -> Giải quyết vấn đề',
    description: 'Tổ chức cho học sinh đối diện với các bài toán/tình huống thực tiễn hóc búa, tự xây dựng phương án và tranh biện giải pháp tối ưu.',
    icon: '💡',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    applicableStandards: [5512, 2634],
    methodologySteps: [
      'Tạo tình huống có vấn đề mâu thuẫn giữa kiến thức đã biết và yêu cầu mới.',
      'Học sinh đề xuất các giả thuyết và con đường giải quyết.',
      'Nghiên cứu tài liệu SGK/giáo trình và phân tích dữ liệu để kiểm chứng.',
      'Tổng kết giải pháp tối ưu và rút ra bài học kinh nghiệm.'
    ],
    promptDirectives: `
ÁP DỤNG TRIỆT ĐỂ PHƯƠNG PHÁP DẠY HỌC GIẢI QUYẾT VẤN ĐỀ (PROBLEM-BASED LEARNING):
- Mở đầu bằng một "Tình huống có vấn đề" (Problem Scenario) thực tế, có số liệu hoặc nghịch lý rõ ràng.
- Giao nhiệm vụ cho học sinh dưới dạng "Thử thách giải quyết vấn đề" thay vì đọc sách thông thường.
- Chia nhỏ vấn đề thành các câu hỏi gợi ý dẫn dắt, yêu cầu các nhóm tìm kiếm câu trả lời từ tài liệu bài học.
- Luyện tập và vận dụng phải là việc giải quyết các sự cố/tình huống thực tiễn nảy sinh trong cuộc sống hoặc công nghiệp.
`
  },
  {
    id: 'SKILL_STEM',
    name: 'Dạy học Dự án & Tích hợp STEM / STEAM',
    shortName: 'Dự án STEM/STEAM',
    tagline: 'Quy trình thiết kế kỹ thuật (EDP) • Tích hợp Khoa học - Công nghệ - Kỹ thuật - Toán',
    description: 'Gắn kiến thức bài học với việc thiết kế chế tạo sản phẩm, mô hình kỹ thuật hoặc giải pháp công nghệ phục vụ đời sống.',
    icon: '🚀',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    applicableStandards: [5512, 2634],
    methodologySteps: [
      'Xác định yêu cầu thiết kế sản phẩm hoặc giải pháp kỹ thuật STEM.',
      'Nghiên cứu kiến thức nền từ bài học và đề xuất các phương án thiết kế.',
      'Lựa chọn giải pháp, lập bản vẽ/sơ đồ và chế tạo thử nghiệm mô hình.',
      'Thử nghiệm, đánh giá tiêu chí sản phẩm và điều chỉnh hoàn thiện.'
    ],
    promptDirectives: `
ÁP DỤNG QUY TRÌNH THIẾT KẾ KỸ THUẬT STEM / DẠY HỌC DỰ ÁN:
- Xác định rõ sản phẩm STEM đầu ra của bài học (mô hình, sơ đồ nguyên lý, thiết bị thử nghiệm, phần mềm/giải pháp).
- Kiến thức mới được học sinh tiếp thu để phục vụ trực tiếp cho việc hoàn thiện bản thiết kế sản phẩm.
- Nhiệm vụ luyện tập là tính toán các thông số kỹ thuật, lập dự toán vật liệu hoặc tối ưu hóa sơ đồ nguyên lý.
- Vận dụng là hoàn thiện sản phẩm thực tế và thuyết trình báo cáo sản phẩm trước lớp.
`
  },
  {
    id: 'SKILL_FLIPPED',
    name: 'Lớp học Đảo ngược & Chuyển đổi số',
    shortName: 'Lớp học đảo ngược',
    tagline: 'Nhiệm vụ tự học trước giờ lên lớp • Tối ưu hóa thời gian tương tác giải quyết nhiệm vụ khó',
    description: 'Học sinh tiếp cận kiến thức lý thuyết nền tảng trước qua video/tài liệu; thời gian trên lớp dành 100% cho thực hành, tranh biện và ứng dụng số.',
    icon: '🔄',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    applicableStandards: [5512],
    methodologySteps: [
      'Giao nhiệm vụ nghiên cứu tài liệu/video tương tác trước giờ lên lớp.',
      'Khởi động bằng bài kiểm tra đánh giá nhanh (Kahoot/Quizizz/Padlet).',
      'Giải đáp thắc mắc, phân tích các điểm nghẽn nhận thức của học sinh.',
      'Dành trọn vẹn thời lượng trên lớp để làm bài tập nâng cao và dự án.'
    ],
    promptDirectives: `
ÁP DỤNG MÔ HÌNH LỚP HỌC ĐẢO NGƯỢC (FLIPPED CLASSROOM) & CHUYỂN ĐỔI SỐ:
- Phần Giao nhiệm vụ nêu rõ sản phẩm tự học ở nhà trước tiết học (ghi chép tóm tắt, sơ đồ tư duy, xem bài giảng số).
- Hoạt động 1 kiểm tra nhanh mức độ chuẩn bị bài qua câu hỏi trắc nghiệm tương tác số.
- Hoạt động 2 tập trung sâu vào các câu hỏi phân hóa, các nội dung khó mà học sinh chưa tự giải quyết được ở nhà.
- Hoạt động 3 & 4 dành tối đa thời gian cho học sinh hợp tác giải quyết các bài toán phân hóa bậc cao.
`
  },
  {
    id: 'SKILL_INQUIRY',
    name: 'Phương pháp Bàn tay nặn bột (Inquiry / Thực nghiệm)',
    shortName: 'Bàn tay nặn bột',
    tagline: 'Tình huống xuất phát -> Bộc lộ biểu tượng ban đầu -> Đề xuất thí nghiệm -> Kết luận khoa học',
    description: 'Phương pháp dạy học tìm tòi - nghiên cứu khoa học thực nghiệm, khuyến khích học sinh bộc lộ suy nghĩ ban đầu và tự làm thí nghiệm chứng minh.',
    icon: '🖐️',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    applicableStandards: [5512],
    methodologySteps: [
      'Tình huống xuất phát và câu hỏi nêu vấn đề khoa học.',
      'Bộc lộ quan niệm ban đầu của học sinh (vẽ hình, ghi dự đoán).',
      'Đề xuất câu hỏi nghiên cứu và phương án thí nghiệm kiểm chứng.',
      'Tiến hành thí nghiệm, quan sát thu thập số liệu và đối chiếu giả thuyết.',
      'Kết luận và hợp thức hóa kiến thức khoa học.'
    ],
    promptDirectives: `
ÁP DỤNG PHƯƠNG PHÁP BÀN TAY NẶN BỘT (INQUIRY-BASED LEARNING):
- Hoạt động Khởi động: Nêu rõ hiện tượng quan sát và yêu cầu học sinh bộc lộ quan niệm/biểu tượng ban đầu bằng hình vẽ hoặc dự đoán.
- Hoạt động Hình thành kiến thức: Học sinh tự đề xuất các giả thuyết và phương án thực nghiệm kiểm chứng; tiến hành quan sát/đo đạc và đối chiếu số liệu.
- GV đóng vai trò trọng tài khoa học, dẫn dắt học sinh tự rút ra kết luận chuẩn xác từ kết quả thực nghiệm.
`
  },
  {
    id: 'SKILL_STATION',
    name: 'Dạy học theo Trạm (Station Rotation & Phân hóa)',
    shortName: 'Dạy học theo Trạm',
    tagline: 'Trạm Đọc hiểu SGK • Trạm Thực hành Thí nghiệm • Trạm Công nghệ Số • Luân chuyển trạm',
    description: 'Tổ chức không gian lớp học thành các trạm học tập độc lập với nhiệm vụ đa dạng, tạo điều kiện cá nhân hóa và phân hóa năng lực học sinh.',
    icon: '🚉',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    applicableStandards: [5512],
    methodologySteps: [
      'Thiết lập các trạm học tập độc lập (Trạm Lý thuyết, Trạm Thực hành, Trạm Ứng dụng số).',
      'Giao phiếu học tập chuyên biệt và quy định thời gian tại mỗi trạm.',
      'Các nhóm học sinh luân chuyển nhịp nhàng giữa các trạm theo hiệu lệnh.',
      'Tổng kết, chia sẻ sản phẩm thu hoạch của các trạm và chốt kiến thức.'
    ],
    promptDirectives: `
ÁP DỤNG PHƯƠNG PHÁP DẠY HỌC THEO TRẠM (STATION ROTATION):
- Thiết kế rõ ràng nội dung ít nhất 3 trạm học tập trong hoạt động hình thành kiến thức và luyện tập:
  + Trạm 1 (Khám phá lý thuyết & thuật ngữ trọng tâm trong tài liệu).
  + Trạm 2 (Bài tập tính toán, thí nghiệm hoặc giải quyết tình huống chuyên môn).
  + Trạm 3 (Ứng dụng thực tiễn, số hóa hoặc sơ đồ tư duy tổng hợp).
- Nêu rõ thời gian quy định tại mỗi trạm (ví dụ: 10 phút/trạm) và cách thức luân chuyển trạm của các nhóm.
`
  },
  {
    id: 'SKILL_WORKSHOP',
    name: 'Sư phạm Thực hành Xưởng Nghề 4 Bước Chuẩn 5S',
    shortName: 'Thực hành Xưởng 5S',
    tagline: 'Hướng dẫn ban đầu & Làm mẫu -> Thực hành phân đoạn -> Thực hành tổng hợp -> Nghiệm thu & 5S',
    description: 'Quy trình sư phạm dạy nghề chuẩn mực theo CV 2634/GDNN, rèn luyện kỹ năng thao tác chuẩn xác, tác phong công nghiệp và kỷ luật ATLĐ.',
    icon: '🛠️',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    applicableStandards: [2634, 5512],
    methodologySteps: [
      'Bước 1: Hướng dẫn mở đầu, giải thích bản vẽ kỹ thuật và thao tác mẫu chuẩn xác có điểm dừng.',
      'Bước 2: Học sinh thực hành phân đoạn, giáo viên uốn nắn sai hỏng từng thao tác.',
      'Bước 3: Học sinh thực hành độc lập toàn bộ quy trình, kiểm soát dung sai kích thước.',
      'Bước 4: Nghiệm thu sản phẩm bằng phiếu kiểm tra, tổng kết an toàn và vệ sinh xưởng 5S.'
    ],
    promptDirectives: `
ÁP DỤNG QUY TRÌNH SƯ PHẠM THỰC HÀNH NGHỀ 4 BƯỚC CHUẨN 5S (CV 2634/GDNN):
- Bước Hướng dẫn ban đầu: Nêu rõ thao tác làm mẫu của giáo viên (Làm mẫu tốc độ bình thường -> Làm mẫu chậm kèm giải thích điểm dừng then chốt -> Học sinh thao tác thử để kiểm tra nhận thức).
- Bước Thực hành: Chỉ rõ từng bước gia công/lắp ráp, thông số máy, dụng cụ đo kiểm và các sai hỏng thường gặp kèm nguyên nhân, biện pháp phòng tránh.
- Đánh giá & Kết thúc: Xây dựng bảng tiêu chí chấm điểm định lượng (kích thước, độ bóng, thời gian) và quy trình thực hiện vệ sinh công nghiệp 5S (Sàng lọc, Sắp xếp, Sạch sẽ, Săn sóc, Sẵn sàng).
`
  }
];

// 2. Danh mục 4 Phong cách Giảng dạy Cá nhân hóa
export const TEACHING_STYLES: TeachingStyle[] = [
  {
    id: 'STYLE_INTERACTIVE',
    name: 'Tương tác, Gợi mở & Truyền cảm hứng (Socrates)',
    shortName: 'Gợi mở & Truyền cảm hứng',
    description: 'Dẫn dắt bằng chuỗi câu hỏi gợi mở liên hoàn, khơi dậy đam mê khám phá và kích thích tư duy tự thân của học sinh.',
    icon: '✨',
    tonePrompt: `
PHONG CÁCH GIẢNG DẠY CỦA GIÁO VIÊN: TƯƠNG TÁC, GỢI MỞ & TRUYỀN CẢM HỨNG (SOCRATES)
- Sử dụng nghệ thuật phát vấn gợi mở: GV không đưa ra câu trả lời ngay mà đặt chuỗi câu hỏi phụ dẫn dắt HS tự phát hiện ra bản chất.
- Ngôn ngữ truyền cảm, giàu năng lượng tích cực, khích lệ học sinh phát biểu và không sợ sai sót.
- Tạo không khí lớp học sôi nổi, dân chủ, tôn trọng ý kiến sáng tạo độc đáo của học sinh.
`
  },
  {
    id: 'STYLE_HANDSON',
    name: 'Thực nghiệm & Trực quan Sinh động (Visual & Hands-on)',
    shortName: 'Thực nghiệm & Trực quan',
    description: 'Lấy mẫu vật thật, thí nghiệm trực quan, sơ đồ hình ảnh và thao tác thực hành làm trung tâm bài giảng.',
    icon: '🔍',
    tonePrompt: `
PHONG CÁCH GIẢNG DẠY CỦA GIÁO VIÊN: THỰC NGHIỆM & TRỰC QUAN SINH ĐỘNG (HANDS-ON & VISUAL)
- Mọi khái niệm lý thuyết đều phải gắn với vật mẫu quan sát, hình ảnh giải phẫu, video mô phỏng hoặc thao tác trực tiếp.
- Giáo viên hướng dẫn tỉ mỉ các bước quan sát, đo đạc, ghi chép vào phiếu thực nghiệm.
- Ưu tiên tối đa các hoạt động "học đi đôi với hành", "mắt thấy - tai nghe - tay làm".
`
  },
  {
    id: 'STYLE_CRITICAL',
    name: 'Hàn lâm, Chặt chẽ & Tư duy Phản biện (Critical Thinking)',
    shortName: 'Hàn lâm & Tư duy phản biện',
    description: 'Chú trọng lập luận logic chặt chẽ, chứng minh khoa học, phản biện đa chiều và liên kết lý thuyết sâu sắc.',
    icon: '📐',
    tonePrompt: `
PHONG CÁCH GIẢNG DẠY CỦA GIÁO VIÊN: HÀN LÂM, CHẶT CHẼ & TƯ DUY PHẢN BIỆN (CRITICAL THINKING)
- Ngôn từ khoa học chuẩn mực, định nghĩa rõ ràng, chứng minh công thức và bản chất sự vật hiện tượng một cách thuyết phục.
- Đặt câu hỏi phản biện: "Tại sao lại có hiện tượng này?", "Nếu thay đổi điều kiện X thì hệ thống biến thiên thế nào?", "Giải pháp này có nhược điểm gì?".
- Khuyến khích học sinh tranh biện khoa học, đối chiếu chéo các giải pháp của nhau.
`
  },
  {
    id: 'STYLE_INDUSTRIAL',
    name: 'Kỷ luật Công nghiệp & Kỹ thuật Chính xác (Industrial 5S)',
    shortName: 'Kỷ luật kỹ thuật & 5S',
    description: 'Rèn luyện tác phong công nghiệp chuyên nghiệp, tuân thủ nghiêm ngặt quy trình kỹ thuật, dung sai và an toàn lao động.',
    icon: '⚙️',
    tonePrompt: `
PHONG CÁCH GIẢNG DẠY CỦA GIÁO VIÊN: KỶ LUẬT CÔNG NGHIỆP & KỸ THUẬT CHÍNH XÁC (INDUSTRIAL PRECISION & 5S)
- Mệnh lệnh sư phạm dứt khoát, chuẩn xác, định lượng cụ thể (thời gian làm bài tính bằng phút, dung sai kỹ thuật, tiêu chuẩn đo kiểm).
- Nhấn mạnh tuyệt đối ý thức An toàn lao động, Phòng chống cháy nổ và quy trình 5S xưởng/phòng học.
- Đánh giá học sinh dựa trên tiêu chí định lượng minh bạch: chất lượng kỹ thuật, tính thẩm mỹ, tốc độ và tác phong làm việc.
`
  }
];

// 3. Hàm xây dựng chỉ thị sư phạm tích hợp sâu cho AI Prompt
export function buildPedagogicalSkillPrompt(config?: PedagogicalSkillConfig): string {
  const skillId = config?.selectedSkillId || 'SKILL_5E';
  const styleId = config?.teachingStyleId || 'STYLE_INTERACTIVE';
  const customNote = config?.customStyleNote?.trim() || '';

  const skill = PEDAGOGICAL_SKILLS.find(s => s.id === skillId) || PEDAGOGICAL_SKILLS[0];
  const style = TEACHING_STYLES.find(t => t.id === styleId) || TEACHING_STYLES[0];

  let prompt = `
========================================================================
BỘ SKILL SƯ PHẠM VÀ PHONG CÁCH GIẢNG DẠY BẮT BUỘC (STRICT PEDAGOGICAL SKILL COMPLIANCE):
1. BỘ KỸ NĂNG SƯ PHẠM ÁP DỤNG: ${skill.name.toUpperCase()} (${skill.tagline})
${skill.promptDirectives}

2. PHONG CÁCH GIẢNG DẠY CỦA GIÁO VIÊN: ${style.name.toUpperCase()}
${style.tonePrompt}
`;

  if (customNote) {
    prompt += `
3. GHI CHÚ PHONG CÁCH RIÊNG CỦA THẦY/CÔ (CÁ NHÂN HÓA NÂNG CAO):
- "${customNote}"
- Hãy hòa trộn phong cách trên vào toàn bộ lời thoại dẫn dắt, câu hỏi gợi ý và cách tổ chức các hoạt động học tập.
`;
  }

  prompt += `
4. QUY TẮC CHỐNG CÂU CHUNG CHUNG (STRICT ANTI-GENERIC BAN):
- NGHIÊM CẤM tuyệt đối việc viết các câu sáo rỗng như: "GV yêu cầu HS đọc SGK", "GV chia nhóm thảo luận", "Đại diện nhóm báo cáo", "GV nhận xét đánh giá", "HS làm bài tập SGK".
- TẤT CẢ các hoạt động phải ghi rõ:
  + ĐỀ BÀI CỤ THỂ của câu hỏi tình huống hoặc bài tập với số liệu/thuật ngữ thật từ giáo trình.
  + CÂU NÓI DẪN DẮT CỤ THỂ của giáo viên (ví dụ: "Thầy/Cô đặt câu hỏi: '...'").
  + CÁC BƯỚC HÀNH ĐỘNG CỤ THỂ của học sinh (ví dụ: "Đo điện áp tại điểm A", "Lập bảng so sánh 3 tiêu chí: ...", "Giải hệ phương trình ...").
  + SẢN PHẨM HỌC TẬP THẬT: Nêu rõ kết quả học sinh phải hoàn thành (ví dụ: Bảng kết quả gồm ..., Lời giải ra đáp số ..., Sơ đồ khối gồm 4 thành phần ...).
========================================================================
`;

  return prompt;
}

// 4. Hàm làm giàu kế hoạch bài dạy offline dựa trên Skill Sư phạm & Phong cách
export function getSkillImplementationSteps(
  stepType: 'opening' | 'knowledge' | 'practice' | 'application',
  skillId: string,
  styleId: string,
  lessonTitle: string,
  subject: string,
  leadConcept: string = ''
): { implementation: string; product: string; objective: string } {
  const concept = leadConcept || lessonTitle;
  const isSocrates = styleId === 'STYLE_INTERACTIVE';

  switch (skillId) {
    case 'SKILL_5E': {
      if (stepType === 'opening') {
        return {
          objective: `Pha 1 (Engage): Kích hoạt tâm thế khám phá, tạo mâu thuẫn nhận thức về ${concept} trong thực tế đời sống.`,
          product: `Câu trả lời dự đoán ban đầu của học sinh ghi trên bảng KWL/phiếu nháp và các câu hỏi tò mò đặt lại cho giáo viên.`,
          implementation: isSocrates
            ? `1. Giao nhiệm vụ (Pha Engage): GV trình chiếu video ngắn/vật thể về "${concept}" và đặt chuỗi câu hỏi gợi mở: "Tại sao hiện tượng này diễn ra? Nếu đảo ngược điều kiện thì điều gì xảy ra?".\n2. Thực hiện: HS suy nghĩ cá nhân 2 phút, ghi nhanh 2 ý tưởng mâu thuẫn vào phiếu học tập cá nhân.\n3. Báo cáo: GV gọi 3 HS đại diện cho 3 quan điểm khác nhau phát biểu, khơi gợi cuộc tranh biện ngắn.\n4. Kết luận: GV không vội chốt đúng/sai, mà kết luận: "Để tìm lời giải đáp khoa học chính xác nhất, chúng ta cùng bước vào bài '${lessonTitle}'."`
            : `1. Giao nhiệm vụ (Pha Engage): GV trình chiếu bảng số liệu/hiện tượng thực nghiệm về "${concept}".\n2. Thực hiện: HS đối chiếu và tìm ra điểm bất thường trong 2 phút.\n3. Báo cáo: Đại diện HS nêu phát hiện về sự biến thiên của ${concept}.\n4. Kết luận: GV chốt vấn đề trọng tâm và dẫn dắt vào bài mới '${lessonTitle}'.`
        };
      }
      if (stepType === 'knowledge') {
        return {
          objective: `Pha 2 & 3 (Explore & Explain): Học sinh chủ động khám phá ngữ liệu SGK/giáo trình, tự chiết xuất bản chất của ${concept} trước khi GV chuẩn hóa.`,
          product: `Phiếu học tập khám phá số 1 của các nhóm chứa bảng phân tích cấu tạo, nguyên lý, công thức và bản vẽ sơ đồ tóm tắt kiến thức.`,
          implementation: `1. Giao nhiệm vụ (Pha Explore): GV chia lớp thành 4 nhóm chuyên sâu, phát Phiếu khám phá tri thức yêu cầu giải mã cấu trúc và bản chất của "${concept}".\n2. Thực hiện: Các nhóm nghiên cứu tài liệu bài học, thảo luận ghi nhận chứng cứ vào giấy A0/bảng phụ. GV luân phiên hướng dẫn gợi ý các nhóm gặp vướng mắc.\n3. Báo cáo (Pha Explain): Đại diện nhóm 1 và 3 lên thuyết trình sơ đồ tư duy; nhóm 2 và 4 đặt câu hỏi phản biện khoa học.\n4. Kết luận: GV chuẩn hóa định nghĩa, phân tích sâu các sai lầm nhận thức thường gặp và chốt hệ thống kiến thức khoa học cốt lõi lên bài giảng điện tử.`
        };
      }
      if (stepType === 'practice') {
        return {
          objective: `Pha 4 (Elaborate): Áp dụng tri thức về ${concept} vào chuỗi bài tập suy luận và tính toán định lượng chuyên sâu.`,
          product: `Bản giải chi tiết các câu hỏi luyện tập có lập luận, công thức và đáp số chuẩn xác của học sinh trên vở ghi.`,
          implementation: `1. Giao nhiệm vụ (Pha Elaborate): GV trình chiếu hệ thống bài tập rèn luyện (gồm 1 bài toán tính toán định lượng và 1 tình huống giải thích hiện tượng thực tế về ${concept}).\n2. Thực hiện: HS làm việc độc lập trong 7 phút; sau đó đổi chéo vở kiểm tra cặp đôi theo đáp án định hướng.\n3. Báo cáo: GV gọi 2 HS lên bảng trình bày 2 cách tiếp cận khác nhau; cả lớp thảo luận tối ưu hóa lời giải.\n4. Kết luận: GV phân tích lỗi sai điển hình về bản chất khái niệm và chốt phương pháp giải chuẩn.`
        };
      }
      return {
        objective: `Pha 5 (Evaluate): Đánh giá năng lực tự chủ vận dụng kiến thức bài '${lessonTitle}' vào bài toán thực tiễn cuộc sống.`,
        product: `Bản thiết kế giải pháp thực tế hoặc bài thu hoạch phân tích ứng dụng của ${concept} nộp vào tiết học sau.`,
        implementation: `1. Giao nhiệm vụ (Pha Evaluate): GV giao thử thách thực tiễn: "Vận dụng nguyên lý ${concept} để đề xuất giải pháp cải tiến một vấn đề cụ thể tại gia đình hoặc địa phương".\n2. Thực hiện: HS lập kế hoạch thực hiện ngoài giờ lên lớp theo nhóm 2-3 em.\n3. Đánh giá: GV công bố Rubric tiêu chí đánh giá sản phẩm và ghi nhận điểm đánh giá thường xuyên ở buổi học tới.`
      };
    }

    case 'SKILL_PBL': {
      if (stepType === 'opening') {
        return {
          objective: `Xác định tình huống có vấn đề thực tế đòi hỏi phải vận dụng kiến thức bài '${lessonTitle}' để giải quyết.`,
          product: `Bảng phát biểu vấn đề (Problem Statement) và danh sách các giả thuyết ban đầu của học sinh.`,
          implementation: `1. Giao nhiệm vụ: GV nêu tình huống sự cố/bài toán thực tế: "Một hệ thống gặp trục trặc liên quan đến ${concept}. Làm thế nào để khắc phục tối ưu?".\n2. Thực hiện: HS thảo luận nhanh cặp đôi, liệt kê các nguyên nhân có thể xảy ra.\n3. Báo cáo: 2 cặp phát biểu giả thuyết, các bạn khác bổ sung mâu thuẫn.\n4. Kết luận: GV đúc kết: "Để giải quyết thấu đáo vấn đề này, chúng ta cần nắm vững kiến thức nền tảng trong bài hôm nay."`
        };
      }
      if (stepType === 'knowledge') {
        return {
          objective: `Chiếm lĩnh tri thức tài liệu bài học thông qua con đường giải mã từng nhánh của vấn đề trọng tâm.`,
          product: `Bản phân tích các luận cứ khoa học từ SGK/giáo trình và phương án giải quyết vấn đề của từng nhóm.`,
          implementation: `1. Giao nhiệm vụ: GV chia nhỏ vấn đề thành 3 nhánh nhiệm vụ nghiên cứu tài liệu tương ứng với cấu trúc bài học.\n2. Thực hiện: HS nghiên cứu tài liệu, đối chiếu số liệu và công thức để tìm giải pháp cho từng nhánh.\n3. Báo cáo: Từng nhóm báo cáo kết quả nghiên cứu giải pháp nhánh; đối chứng với giả thuyết ban đầu.\n4. Kết luận: GV chốt kiến thức chuẩn mực, làm rõ quy luật chi phối của ${concept}.`
        };
      }
      if (stepType === 'practice') {
        return {
          objective: `Rèn luyện kỹ năng giải quyết tình huống tương tự và tính toán các thông số kỹ thuật then chốt.`,
          product: `Phương án xử lý tình huống có số liệu chứng minh cụ thể trên phiếu bài tập.`,
          implementation: `1. Giao nhiệm vụ: GV đưa ra 2 bài toán tình huống biến thể với các thông số thay đổi.\n2. Thực hiện: HS áp dụng kiến thức vừa học để tính toán và đưa ra quyết định kỹ thuật.\n3. Báo cáo: Gọi HS trình bày quy trình ra quyết định và kết quả tính toán.\n4. Kết luận: GV nhận xét tính khả thi, chuẩn hóa quy trình giải quyết vấn đề.`
        };
      }
      return {
        objective: `Vận dụng giải quyết bài toán phức hợp trong thực tiễn nghề nghiệp hoặc đời sống xã hội.`,
        product: `Báo cáo đề án giải quyết vấn đề hoàn chỉnh kèm sơ đồ phân tích SWOT hoặc kế hoạch hành động.`,
        implementation: `1. Giao nhiệm vụ: GV giao bài toán thực tiễn mở: "Tối ưu hóa quy trình áp dụng ${concept} trong bối cảnh thực tế".\n2. Thực hiện: HS làm việc nhóm ngoài giờ lên lớp, thu thập thêm dữ liệu thực tế.\n3. Đánh giá: GV đánh giá qua báo cáo và khả năng bảo vệ giải pháp trước tập thể.`
      };
    }

    case 'SKILL_STEM': {
      if (stepType === 'opening') {
        return {
          objective: `Tiếp nhận thử thách kỹ thuật/chế tạo sản phẩm STEM gắn liền với bài học '${lessonTitle}'.`,
          product: `Bản tiêu chí yêu cầu kỹ thuật của sản phẩm STEM cần đạt được (về kích thước, chức năng, chi phí).`,
          implementation: `1. Giao nhiệm vụ: GV giới thiệu bối cảnh thực tiễn và giao thử thách thiết kế mô hình/giải pháp STEM liên quan đến "${concept}".\n2. Thực hiện: HS đọc tiêu chí sản phẩm, thảo luận các giới hạn kỹ thuật và vật liệu.\n3. Báo cáo: Đại diện HS nhắc lại các tiêu chí bắt buộc của sản phẩm.\n4. Kết luận: GV nhấn mạnh: "Để thiết kế thành công mô hình này, chúng ta cần làm chủ các nguyên lý khoa học của bài học."`
        };
      }
      if (stepType === 'knowledge') {
        return {
          objective: `Nghiên cứu kiến thức nền tảng trong tài liệu để xây dựng cơ sở lý thuyết cho bản thiết kế kỹ thuật.`,
          product: `Bản phác thảo sơ đồ thiết kế kỹ thuật của mô hình kèm công thức tính toán thông số từ bài học.`,
          implementation: `1. Giao nhiệm vụ: GV hướng dẫn HS nghiên cứu các phần kiến thức cốt lõi trong tài liệu bài giảng về ${concept}.\n2. Thực hiện: Các nhóm làm việc với phiếu kỹ thuật: giải thích nguyên lý hoạt động, tính toán kích thước/thông số vật lý.\n3. Báo cáo: Các nhóm treo bản vẽ phác thảo sơ đồ thiết kế, thuyết minh nguyên lý hoạt động.\n4. Kết luận: GV chuẩn hóa kiến thức nền tảng, góp ý tính khả thi của bản vẽ thiết kế.`
        };
      }
      if (stepType === 'practice') {
        return {
          objective: `Chế tạo thử nghiệm mô hình mẫu hoặc giải các bài tập tính toán tối ưu hóa thông số thiết kế.`,
          product: `Mô hình thử nghiệm sơ bộ hoặc bảng tính toán thông số kỹ thuật chuẩn xác theo yêu cầu.`,
          implementation: `1. Giao nhiệm vụ: GV cung cấp vật liệu thử nghiệm/phiếu tính toán chi tiết cho các nhóm.\n2. Thực hiện: Các nhóm tiến hành lắp ráp/tính toán, thử nghiệm vận hành và ghi nhận sai lệch.\n3. Báo cáo: Đại diện các nhóm báo cáo thông số thử nghiệm ban đầu và các điểm nghẽn gặp phải.\n4. Kết luận: GV hướng dẫn các mẹo kỹ thuật và biện pháp an toàn để cải tiến sản phẩm.`
        };
      }
      return {
        objective: `Hoàn thiện sản phẩm STEM thực tế, thử nghiệm tải trọng/hiệu năng và chia sẻ trước cộng đồng.`,
        product: `Sản phẩm STEM hoàn thiện, video quá trình vận hành và phiếu đánh giá đồng đẳng giữa các nhóm.`,
        implementation: `1. Giao nhiệm vụ: GV hướng dẫn các nhóm hoàn thiện sản phẩm tại không gian sáng chế/ở nhà.\n2. Thực hiện: Các nhóm thử nghiệm thực tế, quay video minh chứng hoạt động của mô hình.\n3. Đánh giá: Trưng bày triển lãm sản phẩm STEM vào tiết học sau, chấm điểm theo Rubric 4 tiêu chí.`
      };
    }

    case 'SKILL_WORKSHOP': {
      if (stepType === 'opening') {
        return {
          objective: `Định hướng mục tiêu thực hành nghề, nhận thức tầm quan trọng của bài '${lessonTitle}' và tiêu chuẩn ATLĐ.`,
          product: `Phiếu kiểm tra chuẩn bị đồ nghề, phôi mẫu, trang bị BHLĐ cá nhân đúng quy định 5S.`,
          implementation: `1. Ổn định & Kiểm tra: GV kiểm tra quân số, trang bị BHLĐ (quần áo xưởng, kính, giày bảo hộ), nhắc nhở nội quy an toàn xưởng.\n2. Định hướng: GV trình chiếu bản vẽ kỹ thuật chi tiết của bài '${lessonTitle}' và mẫu gia công chuẩn.\n3. Gợi mở: Đặt câu hỏi về tầm quan trọng của việc kiểm soát dung sai và các nguy cơ mất an toàn tại vị trí làm việc.\n4. Chuyển tiếp: Dẫn dắt sang phần hướng dẫn ban đầu và thao tác mẫu.`
        };
      }
      if (stepType === 'knowledge') {
        return {
          objective: `Nắm vững quy trình công nghệ, thông số máy và các bước thao tác mẫu chuẩn xác của giáo viên.`,
          product: `Bản ghi chép các điểm dừng an toàn, thứ tự bước thao tác và thông số công nghệ vào sổ tay thực hành.`,
          implementation: `1. Hướng dẫn lý thuyết quy trình: GV phân tích từng bước công nghệ trên phiếu hướng dẫn thực hành.\n2. Thao tác mẫu 3 cấp độ: \n  - Lần 1: GV thao tác với tốc độ bình thường để HS nắm hình dung tổng quan.\n  - Lần 2: GV thao tác chậm, dừng lại ở các vị trí then chốt (điểm gá đặt, chỉnh chiều sâu cắt, kiểm tra cữ an toàn) và giải thích kỹ.\n  - Lần 3: Gọi 1 HS khá lên thao tác thử dưới sự giám sát của GV để uốn nắn sai sót ngay từ đầu.\n3. Kết luận: Nhấn mạnh 3 lỗi hỏng nguy hiểm nhất cần tuyệt đối tránh và phát lệnh bắt đầu thực hành.`
        };
      }
      if (stepType === 'practice') {
        return {
          objective: `Rèn luyện kỹ năng thực hành phân đoạn và toàn phần, uốn nắn sai sót và đạt dung sai kỹ thuật.`,
          product: `Sản phẩm gia công/thực hành đạt yêu cầu kích thước, hình dáng hình học và độ nhám bề mặt theo bản vẽ.`,
          implementation: `1. Phân công vị trí: HS về các vị trí máy/bàn nguội, kiểm tra tình trạng thiết bị trước khi vận hành.\n2. Thực hành phân đoạn: HS thực hành từng bước, GV đi từng vị trí quan sát tư thế thao tác, cách cầm dụng cụ đo.\n3. Uốn nắn thường xuyên: GV nhắc nhở cá nhân các lỗi sai sót tư thế; nếu có lỗi mang tính phổ biến, bấm chuông tạm dừng cả xưởng để uốn nắn tập trung.\n4. Thực hành độc lập: HS tự kiểm tra kích thước bằng panme/thước cặp và tự đánh giá chất lượng sản phẩm.`
        };
      }
      return {
        objective: `Nghiệm thu chất lượng sản phẩm theo tiêu chí định lượng, tổng kết kỹ năng và thực hiện nghiêm túc 5S xưởng.`,
        product: `Phiếu nghiệm thu sản phẩm có chữ ký của GV và khu vực xưởng thực hành được dọn dẹp sạch sẽ theo chuẩn 5S.`,
        implementation: `1. Nghiệm thu sản phẩm: HS nộp sản phẩm kèm phiếu tự kiểm tra; GV đo kiểm công khai các kích thước dung sai then chốt.\n2. Đánh giá tổng kết: GV nhận xét ưu điểm, phân tích nguyên nhân các phế phẩm và tuyên dương các học sinh có tác phong chuẩn.\n3. Thực hiện 5S: HS thực hiện 5S tại vị trí: Tắt nguồn máy, lau chùi dầu mỡ, quét dọn phoi vụn, xếp đặt đồ nghề đúng ngăn nắp.\n4. Bàn giao: GV nghiệm thu tình trạng xưởng và cho giải tán lớp học an toàn.`
      };
    }

    default: {
      if (stepType === 'opening') {
        return {
          objective: `Kích hoạt kiến thức nền tảng, tạo tâm thế chủ động tiếp nhận nội dung trọng tâm bài '${lessonTitle}'.`,
          product: `Câu trả lời và ghi chép nhanh nhận thức ban đầu của học sinh trên phiếu học tập.`,
          implementation: `1. Giao nhiệm vụ: GV nêu tình huống thực tiễn có liên quan trực tiếp đến "${concept}".\n2. Thực hiện: HS suy nghĩ cá nhân trong 2 phút và trao đổi cặp đôi.\n3. Báo cáo: Đại diện 2 HS phát biểu, các bạn khác nhận xét bổ sung.\n4. Kết luận: GV nhận xét, tạo điểm nối dẫn dắt vào bài học '${lessonTitle}'.`
        };
      }
      if (stepType === 'knowledge') {
        return {
          objective: `Chiếm lĩnh tri thức khoa học cốt lõi từ tài liệu bài học thông qua hoạt động hợp tác nhóm.`,
          product: `Sơ đồ tóm tắt kiến thức và câu trả lời hoàn thiện trên phiếu học tập của các nhóm.`,
          implementation: `1. Giao nhiệm vụ: GV chia nhóm và giao nhiệm vụ nghiên cứu từng mục kiến thức trong tài liệu bài giảng.\n2. Thực hiện: Các nhóm đọc tài liệu, trao đổi ghi chép vào bảng phụ. GV quan sát hỗ trợ.\n3. Báo cáo: Đại diện các nhóm báo cáo, nhóm khác nhận xét và đặt câu hỏi.\n4. Kết luận: GV chuẩn hóa kiến thức khoa học, phân tích các điểm mấu chốt trên bài giảng điện tử.`
        };
      }
      if (stepType === 'practice') {
        return {
          objective: `Củng cố và khắc sâu kiến thức vừa học qua hệ thống bài tập trắc nghiệm và tự luận chọn lọc.`,
          product: `Bài giải chi tiết và đáp số chính xác trên vở bài tập của học sinh.`,
          implementation: `1. Giao nhiệm vụ: GV giao hệ thống câu hỏi bài tập từ tài liệu bài giảng.\n2. Thực hiện: HS làm việc độc lập trong 5-7 phút, sau đó đổi chéo vở kiểm tra.\n3. Báo cáo: GV gọi học sinh lên bảng chữa bài, hướng dẫn cả lớp phân tích cách giải.\n4. Kết luận: GV chuẩn hóa đáp án và nhấn mạnh phương pháp tư duy giải bài tập.`
        };
      }
      return {
        objective: `Phát triển năng lực vận dụng tri thức bài '${lessonTitle}' vào giải quyết các vấn đề thực tiễn.`,
        product: `Bản thu hoạch cá nhân hoặc sản phẩm ứng dụng nộp vào buổi học tiếp theo.`,
        implementation: `1. Giao nhiệm vụ: GV hướng dẫn yêu cầu nhiệm vụ vận dụng thực tế tại nhà.\n2. Thực hiện: HS thực hiện ngoài giờ lên lớp theo cá nhân hoặc nhóm nhỏ.\n3. Đánh giá: GV thu bài, đánh giá và ghi nhận điểm khuyến khích ở buổi học tới.`
      };
    }
  }
}