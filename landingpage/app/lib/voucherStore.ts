// Quản lý Dữ liệu và Nghiệp vụ Mã Voucher Khuyến Mãi cho Smart Teacher Schedule AI
// Hệ thống hỗ trợ Admin toàn quyền tạo, chỉnh sửa nội dung, quyền hạn và tặng trực tiếp cho giáo viên.

import { supabase } from '@/lib/supabase';

export type VoucherDiscountType = 'PERCENT' | 'FIXED_AMOUNT' | 'FREE_TRIAL' | 'GRANT_TIER';
export type VoucherTargetTier = 'ALL' | 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO';

export interface AssignedTeacher {
  syncCode: string;
  teacherName: string;
  schoolName?: string;
  phone?: string;
  assignedAt: string;
  redeemedAt?: string;
  status: 'SENT' | 'REDEEMED';
  giftNote?: string;
}

export interface VoucherRedemption {
  id: string;
  voucherCode: string;
  syncCode: string;
  teacherName: string;
  schoolName?: string;
  phone?: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  appliedTier: string;
  redeemedAt: string;
}

export interface Voucher {
  id: string;
  code: string; // Mã voucher, ví dụ: 'TRIAN2026', 'GV_TIENPHONG'
  title: string; // Tên chương trình ưu đãi
  description: string; // Nội dung chi tiết chương trình
  discountType: VoucherDiscountType; // Loại giảm giá
  discountValue: number; // Giá trị: phần trăm (vd 30, 50, 100) hoặc số tiền VNĐ (vd 50000)
  targetTier: VoucherTargetTier; // Gói cước áp dụng
  grantTier: 'NONE' | 'VIP1' | 'VIP2' | 'SCHOOL'; // Gói bản quyền được cấp trực tiếp (nếu có)
  grantDurationDays: number; // Số ngày bản quyền được cấp (vd: 30, 90, 365 ngày)
  targetAudience: 'ALL' | 'NEW_TEACHERS' | 'INDIVIDUAL_TEACHER' | 'SCHOOL_ENTERPRISE';
  maxUsage: number; // Số lượt dùng tối đa (0 = không giới hạn)
  usedCount: number; // Số lượt đã dùng thực tế
  startDate: string; // Ngày bắt đầu (YYYY-MM-DD)
  endDate: string; // Ngày hết hạn (YYYY-MM-DD)
  isActive: boolean; // Trạng thái kích hoạt
  features: string[]; // Danh sách đặc quyền kèm theo
  giftMessage: string; // Lời chúc mừng mặc định khi Admin tặng quà
  assignedTeachers?: AssignedTeacher[]; // Danh sách giáo viên được chỉ định tặng
  createdAt: string;
  updatedAt: string;
}

// Dữ liệu mẫu ban đầu dành cho chiến dịch khuyến mãi thu hút giáo viên
const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vouch-trian-2026',
    code: 'TRIAN2026',
    title: 'Tri Ân Giáo Viên Tiên Phong - Tặng 100% Gói VIP 1 (1 Tháng)',
    description: 'Tặng trọn quyền trải nghiệm Trợ lý AI Sư Phạm CV 5512, xuất giáo án, đề thi và sơ đồ tư duy không giới hạn hoàn toàn miễn phí.',
    discountType: 'PERCENT',
    discountValue: 100,
    targetTier: 'VIP1',
    grantTier: 'VIP1',
    grantDurationDays: 30,
    targetAudience: 'ALL',
    maxUsage: 500,
    usedCount: 42,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    features: [
      'Miễn phí 100% bản quyền VIP 1 thời hạn 30 ngày',
      'Mở khóa AI Soạn bài giảng CV 5512 & CV 2634 không giới hạn',
      'Xuất bản PowerPoint .pptx và Word .doc chuẩn Bộ GD&ĐT',
      'Đồng bộ dữ liệu đám mây đa thiết bị PC & Điện thoại'
    ],
    giftMessage: 'Ban Quản Trị Smart Teacher Schedule AI trân trọng gửi tặng Thầy/Cô món quà tri ân: Miễn phí trọn vẹn 30 ngày Bản quyền VIP 1. Kính chúc Thầy/Cô giảng dạy thăng hoa và hạnh phúc!',
    assignedTeachers: [
      {
        syncCode: 'ST-882194',
        teacherName: 'Cô Nguyễn Thu Hà',
        schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
        phone: '0912.345.678',
        assignedAt: '2026-09-10T08:30:00Z',
        redeemedAt: '2026-09-10T09:15:00Z',
        status: 'REDEEMED',
        giftNote: 'Tặng giáo viên xuất sắc hội đồng bộ môn Toán'
      },
      {
        syncCode: 'ST-551203',
        teacherName: 'Thầy Trần Quốc Bảo',
        schoolName: 'THPT Lê Quý Đôn - TP.HCM',
        phone: '0988.112.233',
        assignedAt: '2026-09-14T14:20:00Z',
        status: 'SENT',
        giftNote: 'Tặng giáo viên tiên phong đổi mới số'
      }
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z'
  },
  {
    id: 'vouch-gv-tienphong',
    code: 'GV_TIENPHONG',
    title: 'Ưu Đãi Đặc Biệt 50% Gói VIP 1 (Trọn Năm Học)',
    description: 'Giảm trực tiếp 50% chi phí bản quyền 1 Năm cho giáo viên cá nhân, hỗ trợ đồng hành trọn năm học 2026-2027.',
    discountType: 'PERCENT',
    discountValue: 50,
    targetTier: 'VIP1',
    grantTier: 'VIP1',
    grantDurationDays: 365,
    targetAudience: 'ALL',
    maxUsage: 200,
    usedCount: 28,
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    isActive: true,
    features: [
      'Giảm trực tiếp 50% chỉ còn 199.500 đ / năm (Giá gốc 399.000 đ)',
      'Sử dụng trọn vẹn 365 ngày cho toàn bộ năm học',
      'Tặng kèm kho dữ liệu đề thi & ma trận 4 mức độ Thông tư 22',
      'Hỗ trợ kỹ thuật 1-1 ưu tiên từ đội ngũ kỹ sư'
    ],
    giftMessage: 'Huy Technology AI trân trọng gửi tặng Thầy/Cô mã ưu đãi 50% Bản quyền trọn năm học. Chúc Thầy/Cô có một năm học thành công rực rỡ!',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z'
  },
  {
    id: 'vouch-vip2-trainghiem',
    code: 'VIP2_TRAINGHIEM',
    title: 'Trải Nghiệm Đỉnh Cao Lớp Học Số VIP 2 (Tặng 30 Ngày)',
    description: 'Mở rộng quyền hạn kết nối liên thông 3 chiều: Giáo viên + Học sinh làm bài + Phụ huynh theo dõi chuyên cần & điểm số.',
    discountType: 'GRANT_TIER',
    discountValue: 100,
    targetTier: 'VIP2',
    grantTier: 'VIP2',
    grantDurationDays: 30,
    targetAudience: 'ALL',
    maxUsage: 100,
    usedCount: 15,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    isActive: true,
    features: [
      'Trải nghiệm miễn phí 30 ngày gói VIP 2 dành cho lớp học',
      'Kết nối 40-50 học sinh làm mini game và nộp bài trực tiếp',
      'Phụ huynh nhận thông báo tức thì, xin phép nghỉ và sổ liên lạc',
      'Báo cáo thống kê chuyên cần và đánh giá năng lực tự động'
    ],
    giftMessage: 'Món quà đặc biệt dành tặng Thầy/Cô: Trọn bộ tính năng VIP 2 kết nối Lớp học & Phụ huynh trong 30 ngày. Hãy để công nghệ hỗ trợ Thầy/Cô quản lý lớp thảnh thơi!',
    createdAt: '2026-09-05T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z'
  },
  {
    id: 'vouch-truonghoc-40',
    code: 'TRUONGHOC40',
    title: 'Ưu Đãi Khối Trường Học & Doanh Nghiệp Giáo Dục (-30%)',
    description: 'Dành cho các trường THCS, THPT, Trường Nghề & Trung tâm triển khai đồng bộ cho toàn thể Hội đồng Sư phạm.',
    discountType: 'PERCENT',
    discountValue: 30,
    targetTier: 'SCHOOL',
    grantTier: 'SCHOOL',
    grantDurationDays: 365,
    targetAudience: 'SCHOOL_ENTERPRISE',
    maxUsage: 50,
    usedCount: 6,
    startDate: '2026-08-15',
    endDate: '2026-12-31',
    isActive: true,
    features: [
      'Giảm 30% tổng báo giá hợp đồng bản quyền nhà trường',
      'Bảo lưu phân quyền 4 cổng: Ban Giám Hiệu, Giáo Viên, Phụ Huynh, Học Sinh',
      'Tập huấn trực tiếp cho giáo viên toàn trường và xuất hóa đơn VAT đầy đủ'
    ],
    giftMessage: 'Huy Technology AI đồng hành cùng nhà trường trên con đường chuyển đổi số giáo dục toàn diện.',
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z'
  }
];

// Lịch sử kích hoạt mẫu ban đầu
const INITIAL_REDEMPTIONS: VoucherRedemption[] = [
  {
    id: 'red-001',
    voucherCode: 'TRIAN2026',
    syncCode: 'ST-882194',
    teacherName: 'Cô Nguyễn Thu Hà',
    schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
    phone: '0912.345.678',
    originalPrice: 39000,
    discountAmount: 39000,
    finalPrice: 0,
    appliedTier: 'VIP1',
    redeemedAt: '2026-09-10T09:15:00Z'
  },
  {
    id: 'red-002',
    voucherCode: 'GV_TIENPHONG',
    syncCode: 'ST-991204',
    teacherName: 'Thầy Lê Hoàng Nam',
    schoolName: 'THCS Chu Văn An - Hà Nội',
    phone: '0903.222.111',
    originalPrice: 399000,
    discountAmount: 199500,
    finalPrice: 199500,
    appliedTier: 'VIP1',
    redeemedAt: '2026-09-12T16:45:00Z'
  }
];

// In-Memory Storage Cache để bảo đảm phản hồi siêu tốc và an toàn
let inMemoryVouchers: Voucher[] = [...INITIAL_VOUCHERS];
let inMemoryRedemptions: VoucherRedemption[] = [...INITIAL_REDEMPTIONS];

/**
 * Lấy toàn bộ danh sách voucher
 */
export async function getAllVouchers(): Promise<Voucher[]> {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      inMemoryVouchers = data.map((d: any) => ({
        id: d.id,
        code: d.code,
        title: d.title,
        description: d.description,
        discountType: d.discount_type,
        discountValue: Number(d.discount_value),
        targetTier: d.target_tier,
        grantTier: d.grant_tier,
        grantDurationDays: Number(d.grant_duration_days || 30),
        targetAudience: d.target_audience,
        maxUsage: Number(d.max_usage),
        usedCount: Number(d.used_count),
        startDate: d.start_date,
        endDate: d.end_date,
        isActive: d.is_active,
        features: Array.isArray(d.features) ? d.features : (d.features ? JSON.parse(d.features) : []),
        giftMessage: d.gift_message || '',
        assignedTeachers: Array.isArray(d.assigned_teachers) ? d.assigned_teachers : [],
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));
    }
  } catch (_) {}

  return inMemoryVouchers;
}

/**
 * Tìm voucher theo mã (Code)
 */
export async function getVoucherByCode(rawCode: string): Promise<Voucher | null> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) return null;

  const vouchers = await getAllVouchers();
  return vouchers.find(v => v.code.toUpperCase() === code) || null;
}

/**
 * Tạo mới Voucher
 */
export async function createVoucher(newVoucher: Omit<Voucher, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): Promise<Voucher> {
  const code = newVoucher.code.trim().toUpperCase();
  const existing = inMemoryVouchers.find(v => v.code.toUpperCase() === code);
  if (existing) {
    throw new Error(`Mã voucher '${code}' đã tồn tại trong hệ thống. Vui lòng chọn mã khác!`);
  }

  const voucher: Voucher = {
    ...newVoucher,
    id: `vouch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    code,
    usedCount: 0,
    assignedTeachers: newVoucher.assignedTeachers || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  inMemoryVouchers.unshift(voucher);

  try {
    await supabase.from('vouchers').insert({
      id: voucher.id,
      code: voucher.code,
      title: voucher.title,
      description: voucher.description,
      discount_type: voucher.discountType,
      discount_value: voucher.discountValue,
      target_tier: voucher.targetTier,
      grant_tier: voucher.grantTier,
      grant_duration_days: voucher.grantDurationDays,
      target_audience: voucher.targetAudience,
      max_usage: voucher.maxUsage,
      used_count: voucher.usedCount,
      start_date: voucher.startDate,
      end_date: voucher.endDate,
      is_active: voucher.isActive,
      features: voucher.features,
      gift_message: voucher.giftMessage,
      assigned_teachers: voucher.assignedTeachers,
      created_at: voucher.createdAt,
      updated_at: voucher.updatedAt
    });
  } catch (_) {}

  return voucher;
}

/**
 * Chỉnh sửa toàn diện Voucher (Nội dung, quyền hạn, mã, giá trị...)
 */
export async function updateVoucher(id: string, updates: Partial<Voucher>): Promise<Voucher> {
  const idx = inMemoryVouchers.findIndex(v => v.id === id);
  if (idx === -1) {
    throw new Error(`Không tìm thấy voucher với ID: ${id}`);
  }

  if (updates.code) {
    const cleanCode = updates.code.trim().toUpperCase();
    const duplicate = inMemoryVouchers.find(v => v.id !== id && v.code.toUpperCase() === cleanCode);
    if (duplicate) {
      throw new Error(`Mã voucher '${cleanCode}' đã được sử dụng bởi một chương trình khác!`);
    }
    updates.code = cleanCode;
  }

  const updated: Voucher = {
    ...inMemoryVouchers[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  inMemoryVouchers[idx] = updated;

  try {
    await supabase.from('vouchers').update({
      code: updated.code,
      title: updated.title,
      description: updated.description,
      discount_type: updated.discountType,
      discount_value: updated.discountValue,
      target_tier: updated.targetTier,
      grant_tier: updated.grantTier,
      grant_duration_days: updated.grantDurationDays,
      target_audience: updated.targetAudience,
      max_usage: updated.maxUsage,
      is_active: updated.isActive,
      features: updated.features,
      gift_message: updated.giftMessage,
      assigned_teachers: updated.assignedTeachers,
      updated_at: updated.updatedAt
    }).eq('id', id);
  } catch (_) {}

  return updated;
}

/**
 * Bật/Tắt trạng thái kích hoạt của voucher
 */
export async function toggleVoucherStatus(id: string): Promise<Voucher> {
  const v = inMemoryVouchers.find(x => x.id === id);
  if (!v) throw new Error(`Voucher không tồn tại`);
  return updateVoucher(id, { isActive: !v.isActive });
}

/**
 * Xóa Voucher
 */
export async function deleteVoucher(id: string): Promise<boolean> {
  inMemoryVouchers = inMemoryVouchers.filter(v => v.id !== id);
  try {
    await supabase.from('vouchers').delete().eq('id', id);
  } catch (_) {}
  return true;
}

/**
 * Tặng voucher trực tiếp cho một hoặc nhiều giáo viên
 */
export async function giftVoucherToUser(voucherId: string, teacher: {
  syncCode: string;
  teacherName: string;
  schoolName?: string;
  phone?: string;
  giftNote?: string;
}): Promise<Voucher> {
  const voucher = inMemoryVouchers.find(v => v.id === voucherId);
  if (!voucher) throw new Error('Không tìm thấy Voucher');

  const currentAssigned = voucher.assignedTeachers || [];
  const existingIdx = currentAssigned.findIndex(a => a.syncCode === teacher.syncCode);

  const newAssignment: AssignedTeacher = {
    syncCode: teacher.syncCode,
    teacherName: teacher.teacherName,
    schoolName: teacher.schoolName || '',
    phone: teacher.phone || '',
    assignedAt: new Date().toISOString(),
    status: 'SENT',
    giftNote: teacher.giftNote || voucher.giftMessage
  };

  let updatedAssigned: AssignedTeacher[];
  if (existingIdx >= 0) {
    updatedAssigned = [...currentAssigned];
    updatedAssigned[existingIdx] = newAssignment;
  } else {
    updatedAssigned = [newAssignment, ...currentAssigned];
  }

  try {
    const { data } = await supabase
      .from('teacher_sync_stores')
      .select('payload')
      .eq('sync_code', teacher.syncCode)
      .maybeSingle();

    if (data && data.payload) {
      const p = data.payload;
      const existingGifts = Array.isArray(p.voucherGifts) ? p.voucherGifts : [];
      const updatedGifts = [
        {
          id: `gift-${Date.now()}`,
          voucherCode: voucher.code,
          title: voucher.title,
          discountText: voucher.discountType === 'PERCENT' ? `Giảm ${voucher.discountValue}%` : 'Tặng Bản Quyền VIP',
          giftMessage: newAssignment.giftNote || voucher.giftMessage,
          expiresAt: voucher.endDate,
          grantedAt: new Date().toISOString()
        },
        ...existingGifts.filter((g: any) => g.voucherCode !== voucher.code)
      ];

      await supabase
        .from('teacher_sync_stores')
        .update({
          payload: {
            ...p,
            voucherGifts: updatedGifts
          }
        })
        .eq('sync_code', teacher.syncCode);
    }
  } catch (_) {}

  return updateVoucher(voucherId, { assignedTeachers: updatedAssigned });
}

/**
 * Kích hoạt và áp dụng Voucher khi người dùng nhập mã
 */
export async function redeemVoucher(params: {
  code: string;
  syncCode: string;
  teacherName?: string;
  schoolName?: string;
  phone?: string;
  planId: string;
  originalPrice: number;
}): Promise<{
  success: boolean;
  message: string;
  discountAmount: number;
  finalPrice: number;
  grantedTier?: 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO';
  grantedDays?: number;
  voucher?: Voucher;
}> {
  const voucher = await getVoucherByCode(params.code);

  if (!voucher) {
    return {
      success: false,
      message: 'Mã voucher không tồn tại. Vui lòng kiểm tra lại chính xác từng ký tự!',
      discountAmount: 0,
      finalPrice: params.originalPrice
    };
  }

  if (!voucher.isActive) {
    return {
      success: false,
      message: 'Mã voucher này hiện đang tạm dừng hoặc chưa được kích hoạt.',
      discountAmount: 0,
      finalPrice: params.originalPrice
    };
  }

  const nowStr = new Date().toISOString().split('T')[0];
  if (voucher.startDate && nowStr < voucher.startDate) {
    return {
      success: false,
      message: `Mã voucher chỉ có hiệu lực từ ngày ${new Date(voucher.startDate).toLocaleDateString('vi-VN')}.`,
      discountAmount: 0,
      finalPrice: params.originalPrice
    };
  }

  if (voucher.endDate && nowStr > voucher.endDate) {
    return {
      success: false,
      message: `Mã voucher đã hết hạn vào ngày ${new Date(voucher.endDate).toLocaleDateString('vi-VN')}.`,
      discountAmount: 0,
      finalPrice: params.originalPrice
    };
  }

  if (voucher.maxUsage > 0 && voucher.usedCount >= voucher.maxUsage) {
    return {
      success: false,
      message: 'Mã voucher này đã đạt giới hạn số lượt sử dụng tối đa.',
      discountAmount: 0,
      finalPrice: params.originalPrice
    };
  }

  // Tính toán số tiền giảm
  let discountAmount = 0;
  if (voucher.discountType === 'PERCENT') {
    discountAmount = Math.round((params.originalPrice * voucher.discountValue) / 100);
  } else if (voucher.discountType === 'FIXED_AMOUNT') {
    discountAmount = Math.min(voucher.discountValue, params.originalPrice);
  } else if (voucher.discountType === 'FREE_TRIAL' || voucher.discountType === 'GRANT_TIER') {
    discountAmount = params.originalPrice; // 100% Free
  }

  discountAmount = Math.min(discountAmount, params.originalPrice);
  const finalPrice = Math.max(0, params.originalPrice - discountAmount);

  // Nếu là voucher tặng trực tiếp gói hoặc giảm 100%, tự động nâng cấp quyền hạn giáo viên
  const grantedTier = voucher.grantTier !== 'NONE' ? voucher.grantTier : (finalPrice === 0 ? 'VIP1' : undefined);
  const grantedDays = voucher.grantDurationDays || 30;

  // Cập nhật lượt dùng
  await updateVoucher(voucher.id, {
    usedCount: voucher.usedCount + 1
  });

  // Ghi nhận lịch sử
  const redemption: VoucherRedemption = {
    id: `red-${Date.now()}`,
    voucherCode: voucher.code,
    syncCode: params.syncCode,
    teacherName: params.teacherName || 'Giáo viên',
    schoolName: params.schoolName || '',
    phone: params.phone || '',
    originalPrice: params.originalPrice,
    discountAmount,
    finalPrice,
    appliedTier: grantedTier || params.planId,
    redeemedAt: new Date().toISOString()
  };
  inMemoryRedemptions.unshift(redemption);

  // Nếu giáo viên có trong danh sách được tặng, cập nhật trạng thái REDEEMED
  if (voucher.assignedTeachers && voucher.assignedTeachers.length > 0) {
    const updatedTeachers = voucher.assignedTeachers.map(t => {
      if (t.syncCode === params.syncCode) {
        return {
          ...t,
          status: 'REDEEMED' as const,
          redeemedAt: new Date().toISOString()
        };
      }
      return t;
    });
    await updateVoucher(voucher.id, { assignedTeachers: updatedTeachers });
  }

  // Cập nhật thẳng vào teacher_sync_stores nếu được cấp bản quyền miễn phí 100%
  if (finalPrice === 0 && grantedTier) {
    try {
      const { data } = await supabase
        .from('teacher_sync_stores')
        .select('payload')
        .eq('sync_code', params.syncCode)
        .maybeSingle();

      const expiresAt = new Date(Date.now() + grantedDays * 24 * 60 * 60 * 1000).toISOString();

      if (data && data.payload) {
        const currentPayload = data.payload;
        const updatedPayload = {
          ...currentPayload,
          teacherProfile: {
            ...(currentPayload.teacherProfile || {}),
            subscriptionTier: grantedTier,
            tierExpiresAt: expiresAt,
            activatedVoucher: voucher.code,
            lastVoucherRedeemedAt: new Date().toISOString()
          }
        };

        await supabase
          .from('teacher_sync_stores')
          .update({ payload: updatedPayload })
          .eq('sync_code', params.syncCode);
      }
    } catch (_) {}
  }

  return {
    success: true,
    message: finalPrice === 0 
      ? `🎉 Tuyệt vời! Bạn được kích hoạt miễn phí 100% Bản quyền ${grantedTier || 'VIP 1'} (${grantedDays} ngày) từ Voucher '${voucher.code}'!`
      : `✅ Áp dụng thành công Voucher '${voucher.code}'! Đã giảm ${discountAmount.toLocaleString('vi-VN')} đ.`,
    discountAmount,
    finalPrice,
    grantedTier,
    grantedDays,
    voucher
  };
}

/**
 * Lấy lịch sử và KPI Voucher
 */
export async function getVoucherAnalytics() {
  const vouchers = await getAllVouchers();
  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter(v => v.isActive).length;
  const totalRedemptions = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);
  
  let totalAssignedTeachers = 0;
  vouchers.forEach(v => {
    if (v.assignedTeachers) totalAssignedTeachers += v.assignedTeachers.length;
  });

  const totalDiscountEstimated = inMemoryRedemptions.reduce((acc, r) => acc + r.discountAmount, 0);

  return {
    totalVouchers,
    activeVouchers,
    totalRedemptions,
    totalAssignedTeachers,
    totalDiscountEstimated,
    recentRedemptions: inMemoryRedemptions.slice(0, 20)
  };
}
