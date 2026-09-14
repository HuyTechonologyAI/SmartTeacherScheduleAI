// Cấu hình Cổng Thanh Toán VietQR & Webhook cho Smart Teacher Schedule
// Chủ tài khoản: NGO QUOC HUY - Ngân hàng ACB - STK: 37780997

export interface PlanPackage {
  id: 'PRO1M' | 'PRO1Y' | 'SCHOOL1Y';
  name: string;
  tagline: string;
  price: number; // VNĐ
  originalPrice?: number;
  durationDays: number;
  durationLabel: string;
  tier: 'PRO' | 'SCHOOL';
  isPopular?: boolean;
  features: string[];
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
  {
    id: 'PRO1M',
    name: 'Gói Giáo Viên Pro (1 Tháng)',
    tagline: 'Linh hoạt trải nghiệm trọn bộ trợ lý AI sư phạm',
    price: 39000,
    originalPrice: 49000,
    durationDays: 30,
    durationLabel: '/ tháng',
    tier: 'PRO',
    features: [
      'Trợ lý AI Gemini soạn bài CV 5512 & 2634 không giới hạn',
      'Ma trận đặc tả & Đề thi 4 mức độ Thông tư 22',
      'Voice AI Tutor luyện phát âm & gia sư giọng nói',
      'Sổ điểm điện tử tự động tính điểm & học lực',
      'Đồng bộ đám mây 2 chiều tức thì (PC & Điện thoại)'
    ]
  },
  {
    id: 'PRO1Y',
    name: 'Gói Giáo Viên Pro (1 Năm)',
    tagline: 'Tiết kiệm 35% - Lựa chọn tối ưu cho cả năm học',
    price: 399000,
    originalPrice: 588000,
    durationDays: 365,
    durationLabel: '/ năm',
    tier: 'PRO',
    isPopular: true,
    features: [
      'Toàn bộ quyền lợi của Gói Pro 1 Tháng',
      'Tiết kiệm đến 35% chi phí (chỉ ~33k/tháng)',
      'Tặng kho tài liệu bài giảng & ngân hàng câu hỏi chuẩn',
      'Hỗ trợ kỹ thuật 1-1 ưu tiên suốt năm học',
      'Cấp chứng nhận Bản quyền Giáo viên Tiên phong Số'
    ]
  },
  {
    id: 'SCHOOL1Y',
    name: 'Gói Nhà Trường & Tổ Bộ Môn',
    tagline: 'Quản trị giáo dục tập trung liên thông 4 cổng',
    price: 1990000,
    originalPrice: 2990000,
    durationDays: 365,
    durationLabel: '/ năm',
    tier: 'SCHOOL',
    features: [
      'Kích hoạt License PRO cho TẤT CẢ giáo viên trong trường',
      'Cổng Quản trị Nhà trường (/school): Phân công & duyệt giáo án',
      'Liên thông 4 cổng: Trường học - Giáo viên - Học sinh - Phụ huynh',
      'AI Phân tích rủi ro học tập dự báo học sinh yếu',
      'Hỗ trợ hợp đồng kinh tế và xuất hóa đơn GTGT (VAT) đầy đủ'
    ]
  }
];

// Cú pháp thanh toán duy nhất chuẩn hóa: ST <Mã_Đồng_Bộ> <Mã_Gói>
export function generateTransferSyntax(syncCode: string, planId: string): string {
  const cleanSyncCode = (syncCode || 'GV').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanPlanId = (planId || 'PRO1Y').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `ST ${cleanSyncCode} ${cleanPlanId}`;
}

// Sinh link ảnh VietQR động chuẩn Napas 24/7
export function generateVietQrImageUrl(amount: number, syntax: string, accountName = PAYMENT_BENEFICIARY.accountName): string {
  const bankCode = PAYMENT_BENEFICIARY.bankName; // ACB
  const accNum = PAYMENT_BENEFICIARY.accountNumber; // 37780997
  return `https://img.vietqr.io/image/${bankCode}-${accNum}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(syntax)}&accountName=${encodeURIComponent(accountName)}`;
}
