// Cấu hình Cổng Thanh Toán & Bảng Giá Dịch Vụ cho Smart Teacher Schedule
// Chủ tài khoản: NGO QUOC HUY - Ngân hàng ACB - STK: 37780997

export type PlanCategory = 'TEACHER_VIP1' | 'TEACHER_VIP2' | 'SCHOOL';
export type PlanTier = 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO';
export type PlanId = 'VIP1_1M' | 'VIP1_1Y' | 'VIP2' | 'SCHOOL' | 'PRO1M' | 'PRO1Y' | 'SCHOOL1Y';

export interface PlanPackage {
  id: PlanId;
  category: PlanCategory;
  name: string;
  shortName: string;
  tagline: string;
  price: number; // VNĐ (0 nếu báo giá theo quy mô)
  originalPrice?: number;
  durationDays: number;
  durationLabel: string;
  tier: PlanTier;
  isPopular?: boolean;
  pricingType: 'FIXED' | 'QUOTE';
  pricingNote?: string;
  features: string[];
  ecosystemBonus?: string;
  ecosystemPerkTitle?: string;
  userScope: string;
}

export const PAYMENT_BENEFICIARY = {
  bankName: 'ACB', // Ngân hàng TMCP Á Châu
  bankFullName: 'Ngân hàng TMCP Á Châu (ACB)',
  bankBin: '970416', // ACB Napas BIN
  accountNumber: '37780997',
  accountName: 'NGO QUOC HUY',
  branch: 'Chi nhánh Tân Mai'
};

export const PRICING_PLANS: PlanPackage[] = [
  // 1. GÓI CHO GIÁO VIÊN: VIP 1 (DÀNH CHO CÁ NHÂN GIÁO VIÊN)
  {
    id: 'VIP1_1M',
    category: 'TEACHER_VIP1',
    name: 'Gói VIP 1 (Cá Nhân Giáo Viên - 1 Tháng)',
    shortName: 'VIP 1 (1 Tháng)',
    tagline: 'Linh hoạt trải nghiệm trọn bộ trợ lý AI sư phạm cá nhân',
    price: 39000,
    originalPrice: 49000,
    durationDays: 30,
    durationLabel: '/ tháng',
    tier: 'VIP1',
    pricingType: 'FIXED',
    userScope: '1 Giáo viên',
    features: [
      'Trợ lý AI Gemini soạn bài CV 5512 & 2634 không giới hạn',
      'Ma trận đặc tả & Đề thi 4 mức độ Thông tư 22',
      'Thiết kế & Trình chiếu Sơ đồ tư duy kéo thả tương tác',
      'Mini Game bài giảng tương tác trực tiếp học sinh',
      'Voice AI Tutor luyện phát âm & trợ lý giọng nói',
      'Sổ điểm điện tử tự động tính điểm & xếp loại học lực',
      'Đồng bộ đám mây 2 chiều tức thì (PC & Điện thoại)'
    ]
  },
  {
    id: 'VIP1_1Y',
    category: 'TEACHER_VIP1',
    name: 'Gói VIP 1 (Cá Nhân Giáo Viên - 1 Năm)',
    shortName: 'VIP 1 (1 Năm)',
    tagline: 'Tiết kiệm 35% - Lựa chọn tối ưu cho trọn vẹn cả năm học',
    price: 399000,
    originalPrice: 588000,
    durationDays: 365,
    durationLabel: '/ năm',
    tier: 'VIP1',
    isPopular: true,
    pricingType: 'FIXED',
    userScope: '1 Giáo viên',
    features: [
      'Toàn bộ quyền lợi của Gói VIP 1 (1 Tháng)',
      'Tiết kiệm đến 35% chi phí (chỉ ~33.000 đ/tháng)',
      'Tặng kho tài liệu bài giảng & ngân hàng câu hỏi chuẩn',
      'Hỗ trợ kỹ thuật 1-1 ưu tiên suốt năm học',
      'Cấp chứng nhận Bản quyền Giáo viên Tiên phong Số'
    ],
    ecosystemPerkTitle: 'Tặng Voucher SmartTax AI',
    ecosystemBonus: 'Tặng voucher giảm 30% gói Kê khai Thuế cá nhân & Lớp dạy thêm trên SmartTax AI (Mã: HUYTECH-EDU)'
  },

  // 2. GÓI CHO GIÁO VIÊN: VIP 2 (DÀNH CHO LỚP HỌC: GIÁO VIÊN + HỌC SINH + PHỤ HUYNH)
  {
    id: 'VIP2',
    category: 'TEACHER_VIP2',
    name: 'Gói VIP 2 (Dành Cho Lớp Học Toàn Diện)',
    shortName: 'VIP 2 (Lớp Học)',
    tagline: 'Kết nối Giáo viên + Toàn bộ Học sinh & Phụ huynh trong lớp học',
    price: 0,
    durationDays: 365,
    durationLabel: '/ năm học',
    tier: 'VIP2',
    pricingType: 'QUOTE',
    pricingNote: 'Sẽ có báo giá chi tiết sau theo sĩ số học sinh và phụ huynh trong lớp',
    userScope: '1 Giáo viên + 30-50 Học sinh + 30-50 Phụ huynh',
    features: [
      'Toàn bộ quyền lợi VIP 1 dành cho cá nhân Giáo viên',
      'User Học sinh trong lớp: Làm bài tập, mini game, nộp bài & xem điểm số',
      'User Phụ huynh học sinh: Sổ liên lạc số, đơn xin phép nghỉ, xem chuyên cần',
      'Kênh bảng tin & thông báo lớp học tương tác 3 chiều tức thì',
      'AI Đánh giá tiến độ học tập & gợi ý bài tập nâng cao cho từng học sinh',
      'Báo cáo tổng kết học kỳ lớp học tự động xuất PDF/Excel'
    ],
    ecosystemPerkTitle: 'Voucher Kê Khai Thuế Dạy Thêm 30%',
    ecosystemBonus: 'Tặng voucher ưu đãi 30% bản quyền SmartTax AI phục vụ thu học phí & xuất hóa đơn điện tử cho phụ huynh'
  },

  // 3. GÓI NHÀ TRƯỜNG: QUY MÔ THEO USER (GIÁO VIÊN, HỌC SINH, PHỤ HUYNH)
  {
    id: 'SCHOOL',
    category: 'SCHOOL',
    name: 'Gói Nhà Trường & Toàn Trường (Enterprise)',
    shortName: 'Gói Nhà Trường',
    tagline: 'Quản trị giáo dục liên thông 4 cổng toàn diện cho Ban Giám Hiệu & Hội đồng Sư phạm',
    price: 0,
    durationDays: 365,
    durationLabel: '/ năm học',
    tier: 'SCHOOL',
    pricingType: 'QUOTE',
    pricingNote: 'Phụ thuộc vào số lượng người dùng (Giáo viên, Học sinh, Phụ huynh) - Sẽ có báo giá chi tiết sau',
    userScope: 'Toàn bộ Giáo viên + Học sinh + Phụ huynh theo quy mô trường',
    features: [
      'Kích hoạt License VIP cho 100% Giáo viên trong toàn trường',
      'Cổng Quản trị Nhà trường (/school): Phân công & duyệt giáo án tập trung',
      'Liên thông 4 cổng toàn diện: Ban Giám Hiệu - Giáo Viên - Học Sinh - Phụ Huynh',
      'Cấp tài khoản Học sinh & Phụ huynh theo danh sách trường (không giới hạn)',
      'AI Phân tích dữ liệu học tập & cảnh báo sớm học sinh có nguy cơ học lực yếu',
      'Hỗ trợ hợp đồng kinh tế, thủ tục Kho bạc & xuất hóa đơn GTGT (VAT) đầy đủ'
    ],
    ecosystemPerkTitle: 'Tài Trợ 1 Năm SmartTax AI (3.500.000 đ)',
    ecosystemBonus: 'ĐẶC QUYỀN HỆ SINH THÁI: Tặng kèm 01 năm Phần mềm Kê khai Thuế & Hóa đơn điện tử SmartTax AI Pro (trị giá 3.500.000 đ) cho Phòng Kế toán / Tài vụ nhà trường'
  }
];

// Cú pháp thanh toán duy nhất chuẩn hóa: ST <Mã_Đồng_Bộ> <Mã_Gói>
export function generateTransferSyntax(syncCode: string, planId: string): string {
  const cleanSyncCode = (syncCode || 'GV').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanPlanId = (planId || 'VIP1_1Y').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `ST ${cleanSyncCode} ${cleanPlanId}`;
}

// Sinh link ảnh VietQR động chuẩn Napas 24/7
export function generateVietQrImageUrl(amount: number, syntax: string, accountName = PAYMENT_BENEFICIARY.accountName): string {
  const bankCode = PAYMENT_BENEFICIARY.bankName; // ACB
  const accNum = PAYMENT_BENEFICIARY.accountNumber; // 37780997
  return `https://img.vietqr.io/image/${bankCode}-${accNum}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(syntax)}&accountName=${encodeURIComponent(accountName)}`;
}

// =========================================================================
// CƠ CHẾ SINH DỰ TOÁN BÁO GIÁ TỰ ĐỘNG (AI DETAILED QUOTATION ENGINE)
// =========================================================================

export interface QuoteLineItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  note: string;
}

export interface DetailedQuoteResult {
  quoteCode: string;
  quoteDate: string;
  validUntil: string;
  type: 'VIP2_CLASS' | 'SCHOOL_SCALE';
  organizationName: string;
  contactName: string;
  phone: string;
  email: string;
  userCounts: {
    teachers: number;
    students: number;
    parents: number;
    totalUsers: number;
  };
  pricingTier: string;
  unitPricePerUserMonth: number;
  unitPricePerUserYear: number;
  items: QuoteLineItem[];
  subtotal: number;
  discountRate: number; // %
  discountAmount: number;
  totalAmount: number;
  monthlyAveragePerStudent: number;
  vatRate: number; // 0% hoặc 8%
  vatAmount: number;
  grandTotal: number;
  terms: string[];
}

export function calculateDetailedQuote(params: {
  type: 'VIP2_CLASS' | 'SCHOOL_SCALE';
  organizationName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  teacherCount?: number;
  studentCount?: number;
  parentCount?: number;
  hasVat?: boolean;
}): DetailedQuoteResult {
  const now = new Date();
  const validUntilDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Hiệu lực 30 ngày
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const quoteCode = `DT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;

  const hasVat = !!params.hasVat;
  const vatRate = hasVat ? 0.08 : 0; // 8% VAT dịch vụ phần mềm

  if (params.type === 'VIP2_CLASS') {
    const students = Math.max(1, params.studentCount || 40);
    const parents = Math.max(1, params.parentCount || students);
    const teachers = 1;
    const totalUsers = teachers + students + parents;

    // Định giá theo lớp chuẩn:
    // Dưới 35 HS: 1.490.000 đ
    // 35 - 45 HS: 1.890.000 đ
    // Trên 45 HS: 1.890.000 + (HS - 45) * 35.000 đ
    let packageBasePrice = 1890000;
    if (students <= 30) {
      packageBasePrice = 1490000;
    } else if (students > 45) {
      packageBasePrice = 1890000 + (students - 45) * 35000;
    }

    // Giá niêm yết lẻ nếu mua riêng (để tính mức tiết kiệm cho lớp)
    const originalTeacherValue = 399000; // VIP 1
    const originalStudentValue = students * 120000; // 120k/HS/năm
    const originalParentValue = parents * 99000; // 99k/PH/năm
    const listedSubtotal = originalTeacherValue + originalStudentValue + originalParentValue;

    const discountAmount = listedSubtotal - packageBasePrice;
    const discountRate = Math.round((discountAmount / listedSubtotal) * 100);

    const vatAmount = Math.round(packageBasePrice * vatRate);
    const grandTotal = packageBasePrice + vatAmount;
    const monthlyAveragePerStudent = Math.round(packageBasePrice / students / 9); // 9 tháng học

    const items: QuoteLineItem[] = [
      {
        name: 'Tài khoản Giáo viên Chủ nhiệm (Bản quyền VIP 1 Trọn năm)',
        quantity: 1,
        unit: 'Tài khoản',
        unitPrice: 399000,
        totalPrice: 0,
        note: 'Đã bao gồm trọn gói trong giải pháp lớp học'
      },
      {
        name: `Tài khoản Học sinh Lớp học (${students} em làm bài tập & thi online)`,
        quantity: students,
        unit: 'Học sinh',
        unitPrice: Math.round(packageBasePrice / students),
        totalPrice: packageBasePrice,
        note: `Bình quân chỉ ~${monthlyAveragePerStudent.toLocaleString('vi-VN')} đ / học sinh / tháng`
      },
      {
        name: `Tài khoản Phụ huynh Học sinh (${parents} phụ huynh - Sổ liên lạc số)`,
        quantity: parents,
        unit: 'Phụ huynh',
        unitPrice: 0,
        totalPrice: 0,
        note: 'Tài trợ miễn phí 100% kèm theo tài khoản học sinh'
      }
    ];

    return {
      quoteCode,
      quoteDate: now.toLocaleDateString('vi-VN'),
      validUntil: validUntilDate.toLocaleDateString('vi-VN'),
      type: 'VIP2_CLASS',
      organizationName: params.organizationName || 'Lớp học tiêu chuẩn',
      contactName: params.contactName || 'Thầy/Cô Chủ nhiệm',
      phone: params.phone || '',
      email: params.email || '',
      userCounts: {
        teachers,
        students,
        parents,
        totalUsers
      },
      pricingTier: `Gói Lớp Học Toàn Diện (${students} Học sinh + ${parents} Phụ huynh)`,
      unitPricePerUserMonth: monthlyAveragePerStudent,
      unitPricePerUserYear: Math.round(packageBasePrice / students),
      items,
      subtotal: packageBasePrice,
      discountRate,
      discountAmount,
      totalAmount: packageBasePrice,
      monthlyAveragePerStudent,
      vatRate: vatRate * 100,
      vatAmount,
      grandTotal,
      terms: [
        'Hiệu lực bản quyền: Trọn vẹn 1 năm học (12 tháng kể từ ngày kích hoạt).',
        'Bao gồm hỗ trợ tạo danh sách lớp và cấp mã đăng nhập tự động cho học sinh/phụ huynh.',
        'Hỗ trợ kỹ thuật 1-1 qua Zalo & Hotline trong suốt năm học.',
        'Bảo lưu dữ liệu học tập và sổ điểm an toàn 100% trên đám mây.'
      ]
    };
  } else {
    // GÓI NHÀ TRƯỜNG (SCHOOL ENTERPRISE)
    const teachers = Math.max(5, params.teacherCount || 40);
    const students = Math.max(50, params.studentCount || 1000);
    const parents = Math.max(50, params.parentCount || students);
    const totalUsers = teachers + students + parents;

    // Số user tính phí cấp phép (tính trên tổng số HS + GV toàn trường):
    const billedUsers = teachers + students;

    let unitMonthly = 6000;
    let unitYearly = 55000;
    let tierLabel = 'Quy mô Tiêu chuẩn (500 - 1.500 users)';

    if (billedUsers < 500) {
      unitMonthly = 8000;
      unitYearly = 75000;
      tierLabel = 'Quy mô Dưới 500 users';
    } else if (billedUsers > 1500) {
      unitMonthly = 4500;
      unitYearly = 40000;
      tierLabel = 'Quy mô Lớn (Trên 1.500 users)';
    }

    const listedAnnualPrice = billedUsers * (unitMonthly * 10); // 10 tháng năm học
    const packageBasePrice = billedUsers * unitYearly;
    const discountAmount = listedAnnualPrice - packageBasePrice;
    const discountRate = Math.round((discountAmount / listedAnnualPrice) * 100);

    const vatAmount = Math.round(packageBasePrice * vatRate);
    const grandTotal = packageBasePrice + vatAmount;
    const monthlyAveragePerStudent = Math.round(unitYearly / 9);

    const items: QuoteLineItem[] = [
      {
        name: `Cấp bản quyền License PRO cho toàn bộ Hội đồng Giáo viên (${teachers} GV)`,
        quantity: teachers,
        unit: 'Giáo viên',
        unitPrice: 0,
        totalPrice: 0,
        note: `Tài trợ 100% bản quyền PRO (Trị giá ${(teachers * 399000).toLocaleString('vi-VN')} đ)`
      },
      {
        name: `Bản quyền Hệ sinh thái Học tập Toàn trường (${students} Học sinh)`,
        quantity: billedUsers,
        unit: 'User (HS + GV)',
        unitPrice: unitYearly,
        totalPrice: packageBasePrice,
        note: `Đơn giá ${unitYearly.toLocaleString('vi-VN')} đ/user/năm (~${unitMonthly.toLocaleString('vi-VN')} đ/tháng)`
      },
      {
        name: `Cổng Sổ Liên Lạc Số Toàn Diện Cho Phụ Huynh (${parents} Phụ huynh)`,
        quantity: parents,
        unit: 'Phụ huynh',
        unitPrice: 0,
        totalPrice: 0,
        note: 'Miễn phí liên thông dữ liệu 4 cổng cho 100% phụ huynh học sinh'
      },
      {
        name: 'Cổng Quản Trị Nhà Trường (/school) & Báo Cáo AI Dự Báo Học Lực',
        quantity: 1,
        unit: 'Gói trường',
        unitPrice: 0,
        totalPrice: 0,
        note: 'Tích hợp miễn phí theo hợp đồng giải pháp số toàn trường'
      },
      {
        name: '[ĐẶC QUYỀN HỆ SINH THÁI] Bản Quyền 01 Năm Phần Mềm Kê Khai Thuế & Hóa Đơn Điện Tử SmartTax AI (smarttax-ai.vercel.app)',
        quantity: 1,
        unit: 'Gói Kế toán',
        unitPrice: 3500000,
        totalPrice: 0,
        note: 'Tài trợ 100% bản quyền SmartTax AI Pro trị giá 3.500.000 đ/năm cho Phòng Kế toán / Tài vụ nhà trường'
      }
    ];

    return {
      quoteCode,
      quoteDate: now.toLocaleDateString('vi-VN'),
      validUntil: validUntilDate.toLocaleDateString('vi-VN'),
      type: 'SCHOOL_SCALE',
      organizationName: params.organizationName || 'Trường học đối tác',
      contactName: params.contactName || 'Ban Giám Hiệu Nhà Trường',
      phone: params.phone || '',
      email: params.email || '',
      userCounts: {
        teachers,
        students,
        parents,
        totalUsers
      },
      pricingTier: tierLabel,
      unitPricePerUserMonth: unitMonthly,
      unitPricePerUserYear: unitYearly,
      items,
      subtotal: packageBasePrice,
      discountRate,
      discountAmount,
      totalAmount: packageBasePrice,
      monthlyAveragePerStudent,
      vatRate: vatRate * 100,
      vatAmount,
      grandTotal,
      terms: [
        'Hợp đồng kinh tế và hóa đơn điện tử GTGT (VAT) đầy đủ theo quy định của Bộ Tài chính.',
        'Hỗ trợ thanh toán qua Kho bạc Nhà nước hoặc chuyển khoản Ngân hàng theo học kỳ / cả năm.',
        'Miễn phí cài đặt, tập huấn trực tuyến cho toàn bộ Ban Giám hiệu và Giáo viên.',
        'Cam kết an toàn dữ liệu và hỗ trợ kỹ thuật bảo đảm 24/7 suốt năm học.',
        'ĐẶC QUYỀN HỆ SINH THÁI: Tặng kèm 01 năm bản quyền phần mềm SmartTax AI (smarttax-ai.vercel.app) hỗ trợ kê khai thuế và phát hành hóa đơn điện tử cho bộ phận Kế toán nhà trường.'
      ]
    };
  }
}
