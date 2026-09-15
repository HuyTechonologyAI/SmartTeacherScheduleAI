"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Save,
  Percent,
  Calendar,
  Layers,
  Award,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Gift,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Voucher, VoucherDiscountType, VoucherTargetTier } from '@/app/lib/voucherStore';

interface VoucherEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher?: Voucher | null;
  onSaveSuccess: (savedVoucher: Voucher, isNew: boolean) => void;
}

export const VoucherEditorModal: React.FC<VoucherEditorModalProps> = ({
  isOpen,
  onClose,
  voucher,
  onSaveSuccess
}) => {
  const isEditing = !!voucher;

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<VoucherDiscountType>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number>(50);
  const [targetTier, setTargetTier] = useState<VoucherTargetTier>('VIP1');
  const [grantTier, setGrantTier] = useState<'NONE' | 'VIP1' | 'VIP2' | 'SCHOOL'>('VIP1');
  const [grantDurationDays, setGrantDurationDays] = useState<number>(30);
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'NEW_TEACHERS' | 'INDIVIDUAL_TEACHER' | 'SCHOOL_ENTERPRISE'>('ALL');
  const [maxUsage, setMaxUsage] = useState<number>(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [giftMessage, setGiftMessage] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (voucher) {
      setCode(voucher.code);
      setTitle(voucher.title);
      setDescription(voucher.description);
      setDiscountType(voucher.discountType);
      setDiscountValue(voucher.discountValue);
      setTargetTier(voucher.targetTier);
      setGrantTier(voucher.grantTier || 'NONE');
      setGrantDurationDays(voucher.grantDurationDays || 30);
      setTargetAudience(voucher.targetAudience);
      setMaxUsage(voucher.maxUsage);
      setStartDate(voucher.startDate || '');
      setEndDate(voucher.endDate || '');
      setIsActive(voucher.isActive);
      setGiftMessage(voucher.giftMessage || '');
      setFeatures(voucher.features || []);
    } else {
      // Default new voucher
      setCode('');
      setTitle('');
      setDescription('');
      setDiscountType('PERCENT');
      setDiscountValue(50);
      setTargetTier('VIP1');
      setGrantTier('VIP1');
      setGrantDurationDays(30);
      setTargetAudience('ALL');
      setMaxUsage(100);
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      const oneYearLater = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setEndDate(oneYearLater);
      setIsActive(true);
      setGiftMessage('Ban Quản Trị Smart Teacher Schedule AI trân trọng gửi tặng Thầy/Cô món quà tri ân đặc quyền. Kính chúc Thầy/Cô công tác tốt!');
      setFeatures([
        'Mở khóa AI Sư Phạm soạn giáo án CV 5512 & CV 2634 không giới hạn',
        'Xuất file PowerPoint .pptx và Word .doc chuẩn Bộ GD&ĐT',
        'Đồng bộ đám mây đa thiết bị PC & Điện thoại thông minh'
      ]);
    }
    setErrorMessage('');
  }, [voucher, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!code.trim()) {
      setErrorMessage('Vui lòng nhập Mã Voucher (viết liền, không dấu, ví dụ: TRIAN2026)');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập Tên chương trình ưu đãi');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadVoucher = {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        targetTier,
        grantTier,
        grantDurationDays: Number(grantDurationDays),
        targetAudience,
        maxUsage: Number(maxUsage),
        startDate,
        endDate,
        isActive,
        giftMessage: giftMessage.trim(),
        features
      };

      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isEditing ? 'UPDATE' : 'CREATE',
          id: voucher?.id,
          voucher: payloadVoucher,
          updates: payloadVoucher
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi lưu voucher');
      }

      onSaveSuccess(data.voucher, !isEditing);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi không xác định');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isEditing ? 'Chỉnh Sửa Toàn Diện Voucher' : 'Tạo Mã Voucher Khuyến Mãi Mới'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  {code || 'NEW_CODE'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Toàn quyền tùy chỉnh mã, nội dung, quyền hạn bản quyền và hạn mức
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Thông tin cơ bản & Mã */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>1. Định Danh Mã Voucher & Tên Chương Trình</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span>MÃ VOUCHER (CODE) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tự động in hoa</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="VD: TRIAN2026, GV_TIENPHONG"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">TRẠNG THÁI HOẠT ĐỘNG</label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={isActive}
                      onChange={() => setIsActive(true)}
                      className="accent-emerald-500"
                    />
                    <span className="text-emerald-400 font-bold">🟢 Đang Phát Hành</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={!isActive}
                      onChange={() => setIsActive(false)}
                      className="accent-rose-500"
                    />
                    <span className="text-slate-400">🔴 Tạm Dừng</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">TÊN CHƯƠNG TRÌNH KHUYẾN MÃI *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Tri Ân Giáo Viên Tiên Phong - Tặng 100% Gói VIP 1 (1 Tháng)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">NỘI DUNG MÔ TẢ CHI TIẾT</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả mục đích và quyền lợi giáo viên nhận được khi áp dụng mã này..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Loại ưu đãi & Quyền hạn bản quyền */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>2. Quyền Hạn Bản Quyền & Giá Trị Ưu Đãi</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">LOẠI ƯU ĐÃI</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as VoucherDiscountType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="PERCENT">Giảm theo % (Phần trăm)</option>
                  <option value="FIXED_AMOUNT">Giảm số tiền VNĐ cố định</option>
                  <option value="GRANT_TIER">Tặng Trọn Gói VIP (Miễn phí)</option>
                  <option value="FREE_TRIAL">Dùng thử miễn phí</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">
                  {discountType === 'PERCENT' ? 'MỨC GIẢM (%):' : discountType === 'FIXED_AMOUNT' ? 'SỐ TIỀN GIẢM (VNĐ):' : 'TỶ LỆ GIẢM:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={0}
                    max={discountType === 'PERCENT' ? 100 : 10000000}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none pr-10"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">
                    {discountType === 'PERCENT' ? '%' : 'đ'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">GÓI ÁP DỤNG</label>
                <select
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value as VoucherTargetTier)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="ALL">Áp dụng Toàn bộ các gói</option>
                  <option value="VIP1">Chỉ Gói VIP 1 (Cá nhân GV)</option>
                  <option value="VIP2">Chỉ Gói VIP 2 (Lớp học 3 chiều)</option>
                  <option value="SCHOOL">Chỉ Gói Nhà Trường</option>
                </select>
              </div>
            </div>

            {/* Quyền cấp trực tiếp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <span>QUYỀN HẠN CẤP TRỰC TIẾP (NẾU GIẢM 100%)</span>
                </label>
                <select
                  value={grantTier}
                  onChange={(e) => setGrantTier(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="VIP1">Cấp Bản Quyền VIP 1 (Cá Nhân Giáo Viên)</option>
                  <option value="VIP2">Cấp Bản Quyền VIP 2 (Lớp Học Toàn Diện)</option>
                  <option value="SCHOOL">Cấp Bản Quyền Nhà Trường (Enterprise)</option>
                  <option value="NONE">Không cấp thẳng (Chỉ giảm giá thanh toán)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">THỜI HẠN BẢN QUYỀN ĐƯỢC CẤP (NGÀY)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={grantDurationDays}
                    onChange={(e) => setGrantDurationDays(Number(e.target.value))}
                    min={1}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setGrantDurationDays(30)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                    >
                      30N
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantDurationDays(90)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                    >
                      90N
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantDurationDays(365)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                    >
                      1Năm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Hạn mức & Thời hạn */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>3. Hạn Mức Số Lượng & Thời Gian Hiệu Lực</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">SỐ LƯỢT DÙNG TỐI ĐA</label>
                <input
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(Number(e.target.value))}
                  min={0}
                  placeholder="0 = Không giới hạn"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">0 = Vô hạn lượt dùng</span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">NGÀY BẮT ĐẦU</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">NGÀY HẾT HẠN</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Lời chúc & Đặc quyền hiển thị */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              <span>4. Thông Điệp Tặng Quà & Danh Sách Đặc Quyền Kèm Theo</span>
            </span>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold">LỜI CHÚC MỪNG TẶNG QUÀ TỪ BAN ĐIỀU HÀNH</label>
              <textarea
                rows={2}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Nội dung lời nhắn cá nhân hóa khi Admin gửi tặng mã voucher này tới Thầy/Cô..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-bold">CÁC ĐẶC QUYỀN ĐƯỢC MỞ KHÓA ({features.length})</label>
              <div className="space-y-1.5">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-700/60">
                    <span className="text-emerald-400">✓</span>
                    <span className="flex-1 text-slate-200">{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                  placeholder="Thêm đặc quyền mới (nhấn Enter)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : isEditing ? 'Lưu Thay Đổi Voucher' : 'Tạo & Phát Hành Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
