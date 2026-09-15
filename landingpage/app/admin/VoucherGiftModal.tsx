"use client";

import React, { useState, useMemo } from 'react';
import {
  X,
  Gift,
  Search,
  CheckCircle2,
  Copy,
  Send,
  User,
  School,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Voucher } from '@/app/lib/voucherStore';

interface UserItem {
  stCode: string;
  name: string;
  phone: string;
  school: string;
  role: string;
  plan: string;
}

interface VoucherGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  userList: UserItem[];
  onGiftSuccess: (updatedVoucher: Voucher) => void;
}

export const VoucherGiftModal: React.FC<VoucherGiftModalProps> = ({
  isOpen,
  onClose,
  voucher,
  userList,
  onGiftSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [manualSyncCode, setManualSyncCode] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualSchool, setManualSchool] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen || !voucher) return null;

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return userList.slice(0, 10);
    const term = searchTerm.toLowerCase();
    return userList.filter(
      u => u.stCode.toLowerCase().includes(term) ||
           u.name.toLowerCase().includes(term) ||
           u.phone.includes(term) ||
           u.school.toLowerCase().includes(term)
    ).slice(0, 15);
  }, [userList, searchTerm]);

  const targetSyncCode = selectedUser ? selectedUser.stCode : manualSyncCode.trim();
  const targetName = selectedUser ? selectedUser.name : (manualName.trim() || 'Thầy/Cô');
  const targetSchool = selectedUser ? selectedUser.school : manualSchool.trim();
  const targetPhone = selectedUser ? selectedUser.phone : manualPhone.trim();

  // Tin nhắn soạn sẵn đẹp mắt để gửi qua Zalo / SMS
  const zaloTemplate = `🎁 [MÓN QUÀ TRI ÂN ĐẶC BIỆT TỪ SMART TEACHER SCHEDULE AI]
Kính gửi Thầy/Cô: ${targetName} (${targetSchool || 'Quý Thầy/Cô'})

Ban Điều Hành trân trọng gửi tặng Thầy/Cô:
🎟️ MÃ VOUCHER: ${voucher.code}
⭐️ CHƯƠNG TRÌNH: ${voucher.title}
🎁 ĐẶC QUYỀN: ${voucher.discountType === 'PERCENT' ? `Giảm ${voucher.discountValue}%` : 'Bản quyền VIP Miễn phí'} (${voucher.grantDurationDays || 30} ngày)
💬 LỜI CHÚC: "${giftNote || voucher.giftMessage}"

👉 Hướng dẫn kích hoạt ngay:
1. Mở Cổng Giáo Viên: https://www.gvcncdsai.io.vn/app
2. Bấm vào biểu tượng Vương Miện (Nâng Cấp Gói) hoặc Cài Đặt
3. Nhập mã voucher "${voucher.code}" và bấm "Áp Dụng" để kích hoạt tức thì!

Kính chúc Thầy/Cô luôn tràn đầy nhiệt huyết và đổi mới sáng tạo trong giảng dạy!`;

  const handleCopyZalo = () => {
    navigator.clipboard.writeText(zaloTemplate);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  const handleSendGift = async () => {
    if (!targetSyncCode && !targetPhone) {
      setStatusMessage('⚠️ Vui lòng chọn giáo viên hoặc nhập Mã Sync Code / Số điện thoại');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GIFT_TEACHER',
          voucherId: voucher.id,
          teacher: {
            syncCode: targetSyncCode || `ST-${targetPhone.replace(/\D/g, '').slice(-6)}`,
            teacherName: targetName,
            schoolName: targetSchool,
            phone: targetPhone,
            giftNote: giftNote || voucher.giftMessage
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể tặng voucher');
      }

      onGiftSuccess(data.voucher);
      setStatusMessage(`✅ Đã gửi tặng thành công Voucher '${voucher.code}' cho ${targetName}!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setStatusMessage(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-emerald-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Tặng Voucher Cho Giáo Viên</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  {voucher.code}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gửi mã ưu đãi đích danh kèm lời chúc mừng và tin nhắn Zalo 1 chạm
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold">
              {statusMessage}
            </div>
          )}

          {/* Thông tin Voucher đang tặng */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{voucher.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                {voucher.discountType === 'PERCENT' ? `Giảm ${voucher.discountValue}%` : 'Bản Quyền VIP 100%'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">{voucher.description}</p>
          </div>

          {/* Chọn Giáo Viên từ hệ thống */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold flex items-center justify-between">
              <span>BƯỚC 1: CHỌN GIÁO VIÊN NHẬN QUÀ</span>
              <span className="text-[10px] text-slate-400">Tìm kiếm theo tên / SĐT / STCode</span>
            </label>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm giáo viên trong hệ thống..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* List nhanh */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 rounded-xl bg-slate-950/40 border border-slate-800">
              {filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-slate-500">
                  Không tìm thấy giáo viên khớp. Thầy/Cô có thể nhập thông tin thủ công bên dưới.
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.stCode}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setManualSyncCode(u.stCode);
                      setManualName(u.name);
                      setManualPhone(u.phone);
                      setManualSchool(u.school);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                      selectedUser?.stCode === u.stCode
                        ? 'bg-purple-600/20 border border-purple-500/50 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.school} • {u.phone}</div>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 shrink-0 ml-2">
                      {u.stCode}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Form nhập thủ công nếu không chọn từ list */}
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400">Thông tin giáo viên nhận:</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={manualName}
                onChange={(e) => { setManualName(e.target.value); setSelectedUser(null); }}
                placeholder="Tên Giáo Viên..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
              />
              <input
                type="text"
                value={manualSyncCode}
                onChange={(e) => { setManualSyncCode(e.target.value); setSelectedUser(null); }}
                placeholder="Mã SyncCode (ST-...)"
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
              />
              <input
                type="text"
                value={manualPhone}
                onChange={(e) => { setManualPhone(e.target.value); setSelectedUser(null); }}
                placeholder="Số điện thoại / Zalo..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
              />
              <input
                type="text"
                value={manualSchool}
                onChange={(e) => { setManualSchool(e.target.value); setSelectedUser(null); }}
                placeholder="Trường học..."
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Lời nhắn tặng */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold">BƯỚC 2: LỜI CHÚC MỪNG TẶNG QUÀ</label>
            <textarea
              rows={2}
              value={giftNote || voucher.giftMessage}
              onChange={(e) => setGiftNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Xem trước tin nhắn Zalo */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>BƯỚC 3: MẪU TIN NHẮN ZALO / SMS GỬI GIÁO VIÊN</span>
              <button
                type="button"
                onClick={handleCopyZalo}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedZalo ? 'Đã sao chép!' : 'Sao chép tin nhắn'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap font-sans max-h-28 overflow-y-auto leading-relaxed">
              {zaloTemplate}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopyZalo}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedZalo ? 'Đã sao chép Zalo' : 'Copy Tin Nhắn Zalo'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendGift}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-900/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Tặng & Lưu Vào Hồ Sơ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
