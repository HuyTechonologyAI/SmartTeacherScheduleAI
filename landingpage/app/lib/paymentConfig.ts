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
    ]
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
    ]
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
    ]
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
