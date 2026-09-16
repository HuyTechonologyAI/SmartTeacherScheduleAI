"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  RefreshCw,
  Gift,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Percent,
  Check,
  Power,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { Voucher } from '@/app/lib/voucherStore';
import { VoucherEditorModal } from './VoucherEditorModal';
import { VoucherGiftModal } from './VoucherGiftModal';

interface UserItem {
  stCode: string;
  name: string;
  phone: string;
  school: string;
  role: string;
  plan: string;
}

interface VouchersTabProps {
  userList: UserItem[];
}

export const VouchersTab: React.FC<VouchersTabProps> = ({ userList }) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [selectedVoucherForEdit, setSelectedVoucherForEdit] = useState<Voucher | null>(null);

  const [isGiftOpen, setIsGiftOpen] = useState<boolean>(false);
  const [selectedVoucherForGift, setSelectedVoucherForGift] = useState<Voucher | null>(null);

  const [actionMessage, setActionMessage] = useState<string>('');

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/vouchers');
      const data = await res.json();
      if (res.ok && data.success) {
        setVouchers(data.vouchers || []);
        setAnalytics(data.analytics || null);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách voucher:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_STATUS', id })
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(prev => prev.map(v => v.id === id ? data.voucher : v));
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Thầy/Cô có chắc chắn muốn xóa vĩnh viễn voucher '${code}' không?`)) return;
    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id })
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(prev => prev.filter(v => v.id !== id));
        setActionMessage(`Đã xóa voucher '${code}' thành công!`);
        setTimeout(() => setActionMessage(''), 3000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredVouchers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return vouchers.filter(v => {
      // Search
      const term = searchTerm.toLowerCase();
      const matchSearch = !term ||
        v.code.toLowerCase().includes(term) ||
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term);

      // Status
      let matchStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchStatus = v.isActive && (!v.endDate || v.endDate >= today);
      } else if (statusFilter === 'INACTIVE') {
        matchStatus = !v.isActive;
      } else if (statusFilter === 'EXPIRED') {
        matchStatus = !!v.endDate && v.endDate < today;
      }

      return matchSearch && matchStatus;
    });
  }, [vouchers, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Action toast message */}
      {actionMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tổng Voucher Phát Hành</span>
            <Tag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.totalVouchers ?? vouchers.length}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>{analytics?.activeVouchers ?? vouchers.filter(v => v.isActive).length} chương trình đang chạy</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tổng Lượt Kích Hoạt (Redeemed)</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.totalRedemptions ?? vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0)}
          </div>
          <div className="text-[11px] text-cyan-400">Giáo viên đã áp dụng thành công</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Giáo Viên Được Tặng Quà</span>
            <Gift className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.totalAssignedTeachers ?? 0}
          </div>
          <div className="text-[11px] text-purple-400">Admin đã chỉ định gửi quà trực tiếp</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Giá Trị Ưu Đãi Trao Tặng</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {(analytics?.totalDiscountEstimated ?? 0).toLocaleString('vi-VN')} đ
          </div>
          <div className="text-[11px] text-amber-400">Tổng chi phí hỗ trợ giáo viên</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Create Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã, tên chương trình, nội dung..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'ACTIVE', label: 'Đang chạy' },
              { id: 'INACTIVE', label: 'Tạm dừng' },
              { id: 'EXPIRED', label: 'Hết hạn' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchVouchers}
            title="Làm mới"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedVoucherForEdit(null);
            setIsEditorOpen(true);
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Voucher Mới</span>
        </button>
      </div>

      {/* Main Voucher Cards / Table */}
      <div className="space-y-4">
        {filteredVouchers.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Tag className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-slate-300 font-bold text-sm">Không tìm thấy voucher phù hợp</h4>
            <p className="text-slate-500 text-xs">Thầy/Cô có thể tạo voucher mới hoặc điều chỉnh bộ lọc tìm kiếm.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVouchers.map((v) => {
              const today = new Date().toISOString().split('T')[0];
              const isExpired = !!v.endDate && v.endDate < today;
              const isFull = v.maxUsage > 0 && v.usedCount >= v.maxUsage;
              const usagePct = v.maxUsage > 0 ? Math.min(100, Math.round((v.usedCount / v.maxUsage) * 100)) : 0;

              return (
                <div
                  key={v.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                    !v.isActive
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                      : isExpired
                      ? 'bg-slate-900/50 border-rose-900/30'
                      : 'bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border-slate-800 hover:border-emerald-500/40 shadow-lg'
                  }`}
                >
                  {/* Top Header Card */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Voucher Code Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm tracking-wider">
                          <span>{v.code}</span>
                          <button
                            onClick={() => handleCopyCode(v.code)}
                            title="Sao chép mã"
                            className="text-emerald-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedCode === v.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Discount Badge */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {v.discountType === 'PERCENT' ? `Giảm ${v.discountValue}%` : v.discountType === 'FIXED_AMOUNT' ? `Giảm ${(v.discountValue / 1000).toLocaleString()}K` : 'Tặng Gói 100%'}
                        </span>

                        {/* Grant Tier Badge */}
                        {v.grantTier && v.grantTier !== 'NONE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Cấp {v.grantTier} ({v.grantDurationDays}N)
                          </span>
                        )}
                      </div>

                      {/* Status switch */}
                      <button
                        onClick={() => handleToggleStatus(v.id)}
                        title={v.isActive ? 'Bấm để Tạm dừng voucher' : 'Bấm để Kích hoạt voucher'}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          v.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{v.isActive ? 'Đang chạy' : 'Tạm dừng'}</span>
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {v.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {v.description}
                    </p>
                  </div>

                  {/* Middle Stats: Usage & Expiry */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                    {/* Progress Bar Lượt dùng */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Lượt đã kích hoạt:</span>
                        <span className="font-bold text-slate-200">
                          {v.usedCount} {v.maxUsage > 0 ? `/ ${v.maxUsage} (${usagePct}%)` : '(Không giới hạn)'}
                        </span>
                      </div>
                      {v.maxUsage > 0 && (
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFull ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usagePct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Expiry & Audience */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {v.endDate ? `Hết hạn: ${new Date(v.endDate).toLocaleDateString('vi-VN')}` : 'Vô thời hạn'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Đã tặng: {v.assignedTeachers?.length || 0} giáo viên</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Nút Chỉnh sửa */}
                      <button
                        onClick={() => {
                          setSelectedVoucherForEdit(v);
                          setIsEditorOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-700/60"
                        title="Chỉnh sửa mọi nội dung, quyền hạn và mã voucher"
                      >
                        <Edit className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Chỉnh Sửa</span>
                      </button>

                      {/* Nút Tặng Giáo Viên */}
                      <button
                        onClick={() => {
                          setSelectedVoucherForGift(v);
                          setIsGiftOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-purple-500/30"
                        title="Gửi tặng trực tiếp cho giáo viên cụ thể"
                      >
                        <Gift className="w-3.5 h-3.5 text-purple-400" />
                        <span>Tặng Quà</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyCode(v.code)}
                        className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Sao chép mã voucher"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(v.id, v.code)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Xóa voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lịch Sử Giáo Viên Đã Nhận Quà & Đã Kích Hoạt */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              <span>Lịch Sử Giáo Viên Được Tặng Voucher & Đã Kích Hoạt</span>
            </h4>
            <p className="text-xs text-slate-400">Danh sách các tài khoản giáo viên đã nhận voucher từ Admin</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-3">Giáo Viên / Mã Sync</th>
                <th className="pb-3 px-3">Trường Học / SĐT</th>
                <th className="pb-3 px-3">Mã Voucher</th>
                <th className="pb-3 px-3">Thời Gian Tặng</th>
                <th className="pb-3 px-3 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {vouchers.flatMap(v => (v.assignedTeachers || []).map(t => ({ ...t, voucherCode: v.code }))).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Chưa có lượt tặng quà nào. Hãy bấm "Tặng Quà" trên thẻ Voucher để gửi tặng Thầy/Cô đầu tiên!
                  </td>
                </tr>
              ) : (
                vouchers.flatMap(v => (v.assignedTeachers || []).map(t => ({ ...t, voucherCode: v.code }))).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      <div>{item.teacherName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.syncCode}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{item.schoolName || 'Chưa liên kết'}</div>
                      <div className="text-[10px] text-slate-500">{item.phone || '-'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                        {item.voucherCode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {item.assignedAt ? new Date(item.assignedAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {item.status === 'REDEEMED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã kích hoạt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>Đã gửi (Chờ mở)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <VoucherEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        voucher={selectedVoucherForEdit}
        onSaveSuccess={(saved, isNew) => {
          if (isNew) {
            setVouchers(prev => [saved, ...prev]);
            setActionMessage(`Đã tạo thành công Voucher '${saved.code}'!`);
          } else {
            setVouchers(prev => prev.map(v => v.id === saved.id ? saved : v));
            setActionMessage(`Đã cập nhật Voucher '${saved.code}' thành công!`);
          }
          setTimeout(() => setActionMessage(''), 3000);
        }}
      />

      {/* Gift Modal */}
      <VoucherGiftModal
        isOpen={isGiftOpen}
        onClose={() => setIsGiftOpen(false)}
        voucher={selectedVoucherForGift}
        userList={userList}
        onGiftSuccess={(updatedVoucher) => {
          setVouchers(prev => prev.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));
          setActionMessage(`Đã tặng quà thành công từ Voucher '${updatedVoucher.code}'!`);
          setTimeout(() => setActionMessage(''), 3000);
        }}
      />
    </div>
  );
};
