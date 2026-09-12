"use client";

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Check, 
  XCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  User, 
  Phone, 
  Trash2, 
  Filter,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { LeaveRequest } from '@/app/app/studentRosterData';

interface LeaveRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequests: LeaveRequest[];
  onApprove: (request: LeaveRequest, note?: string) => Promise<void> | void;
  onReject: (request: LeaveRequest, note?: string) => Promise<void> | void;
  onDelete: (requestId: string) => Promise<void> | void;
  onTriggerSync?: () => void;
}

export default function LeaveRequestsModal({
  isOpen,
  onClose,
  leaveRequests,
  onApprove,
  onReject,
  onDelete,
  onTriggerSync
}: LeaveRequestsModalProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [teacherNoteInput, setTeacherNoteInput] = useState<{ [id: string]: string }>({});

  if (!isOpen) return null;

  const pendingCount = leaveRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'REJECTED').length;

  const filteredRequests = leaveRequests.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const handleApprove = async (req: LeaveRequest) => {
    setProcessingId(req.id);
    try {
      await onApprove(req, teacherNoteInput[req.id]);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: LeaveRequest) => {
    setProcessingId(req.id);
    try {
      await onReject(req, teacherNoteInput[req.id]);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Đơn xin nghỉ học trực tuyến
                {pendingCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    {pendingCount} đơn chờ duyệt
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Phụ huynh gửi đơn từ Sổ liên lạc điện tử. Duyệt đơn sẽ tự động cập nhật Điểm danh Nghỉ có phép.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({leaveRequests.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Chờ duyệt ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'APPROVED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã duyệt ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'REJECTED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Từ chối ({rejectedCount})
            </button>
          </div>

          {onTriggerSync && (
            <button
              onClick={onTriggerSync}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
            >
              Đồng bộ dữ liệu mới nhất
            </button>
          )}
        </div>

        {/* Request List */}
        <div className="p-6 space-y-4 flex-1">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Không có đơn xin nghỉ học nào {filter !== 'ALL' ? 'trong mục này' : ''}</p>
              <p className="text-xs mt-1 text-slate-600">
                Khi phụ huynh nộp đơn từ Cổng Phụ huynh, đơn sẽ hiển thị tại đây để Thầy/Cô xét duyệt.
              </p>
            </div>
          ) : (
            filteredRequests.map(req => {
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';
              const isBusy = processingId === req.id;

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-amber-950/10 border-amber-600/40 shadow-sm shadow-amber-900/10'
                      : isApproved
                      ? 'bg-emerald-950/10 border-emerald-600/30'
                      : 'bg-slate-800/40 border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{req.studentName}</span>
                        {req.studentCode && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {req.studentCode}
                          </span>
                        )}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {req.className}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          PH: <strong className="text-slate-300">{req.parentName}</strong>
                        </span>
                        <a
                          href={`tel:${req.parentPhone}`}
                          className="flex items-center gap-1 text-indigo-400 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {req.parentPhone}
                        </a>
                        <span className="text-slate-500">
                          Gửi lúc: {new Date(req.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start">
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Chờ Thầy/Cô duyệt
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đã duyệt có phép
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          Không duyệt
                        </span>
                      )}

                      <button
                        onClick={() => onDelete(req.id)}
                        title="Xóa đơn này"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date & Reason Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>
                        Thời gian nghỉ: Từ <strong>{req.fromDate}</strong> đến <strong>{req.toDate}</strong>
                        {req.fromDate === req.toDate && <span className="text-slate-400 ml-1">(1 ngày)</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Lý do từ Phụ huynh: </span>
                      <span className="text-slate-200 italic">"{req.reason}"</span>
                    </div>
                    {req.teacherNote && (
                      <div className="pt-1 text-slate-400 border-t border-slate-800/80">
                        <span className="text-indigo-400 font-medium">Ghi chú của Thầy/Cô: </span>
                        <span>{req.teacherNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Requests */}
                  {isPending && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Ghi chú phản hồi cho phụ huynh (tuỳ chọn)..."
                        value={teacherNoteInput[req.id] || ''}
                        onChange={(e) => setTeacherNoteInput({ ...teacherNoteInput, [req.id]: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(req)}
                          disabled={isBusy}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Từ chối</span>
                        </button>
                        <button
                          onClick={() => handleApprove(req)}
                          disabled={isBusy}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>✓ Duyệt có phép</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between rounded-b-3xl">
          <p className="text-xs text-slate-500">
            Duyệt đơn sẽ tự động đồng bộ lên Đám mây để phụ huynh theo dõi được ngay kết quả.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
