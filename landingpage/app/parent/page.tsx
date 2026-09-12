"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  Send,
  User,
  Phone,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  FileText,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface StudentInfo {
  id: string;
  studentCode?: string;
  fullName: string;
  className: string;
  gender: string;
  kudosPoints: number;
  parentName: string;
  parentPhone: string;
}

interface AttendanceRecordItem {
  id: string;
  date: string;
  className: string;
  status: 'PRESENT' | 'ABSENT_EXCUSED' | 'ABSENT_UNEXCUSED' | 'LATE';
  note?: string;
  kudosDelta?: number;
  updatedAt?: number;
}

interface LeaveRequestItem {
  id: string;
  studentId: string;
  studentCode?: string;
  studentName: string;
  className: string;
  parentName: string;
  parentPhone: string;
  date: string;
  reason: string;
  type: 'SICK' | 'FAMILY' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
  teacherNote?: string;
}

export default function ParentPortalPage() {
  const [syncCode, setSyncCode] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecordItem[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Đơn xin phép nghỉ học
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveDate, setLeaveDate] = useState<string>('');
  const [leaveType, setLeaveType] = useState<'SICK' | 'FAMILY' | 'OTHER'>('SICK');
  const [leaveReason, setLeaveReason] = useState<string>('');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState<boolean>(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setLeaveDate(todayStr);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code') || localStorage.getItem('smart_parent_sync_code') || '';
      const phoneFromUrl = params.get('phone') || localStorage.getItem('smart_parent_phone') || '';
      const stCodeFromUrl = params.get('studentCode') || localStorage.getItem('smart_parent_st_code') || '';

      if (codeFromUrl) setSyncCode(codeFromUrl);
      if (phoneFromUrl) setParentPhone(phoneFromUrl);
      if (stCodeFromUrl) setStudentCode(stCodeFromUrl);

      if (codeFromUrl && (phoneFromUrl || stCodeFromUrl)) {
        fetchParentData(codeFromUrl, phoneFromUrl, stCodeFromUrl);
      }
    }
  }, [todayStr]);

  // Tra cứu dữ liệu con từ API Portal
  const fetchParentData = async (code: string, phone: string, stCode: string) => {
    if (!code || (!phone && !stCode)) {
      setErrorMessage('Vui lòng nhập Mã lớp/trường và Số điện thoại phụ huynh để tra cứu.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const url = `/api/portal?code=${encodeURIComponent(code)}${phone ? `&phone=${encodeURIComponent(phone)}` : ''}${stCode ? `&studentCode=${encodeURIComponent(stCode)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Không tìm thấy thông tin học sinh.');
        setStudent(null);
        setIsLoading(false);
        return;
      }

      setStudent(data.student || null);
      setAttendanceList(data.attendance || []);
      setLeaveRequests(data.leaveRequests || []);

      if (typeof window !== 'undefined') {
        localStorage.setItem('smart_parent_sync_code', code);
        if (phone) localStorage.setItem('smart_parent_phone', phone);
        if (stCode) localStorage.setItem('smart_parent_st_code', stCode);
      }
    } catch (err: any) {
      setErrorMessage('Lỗi kết nối máy chủ: ' + (err?.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Nộp đơn xin nghỉ học trực tuyến
  const handleSubmitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !syncCode || !leaveDate || !leaveReason.trim()) {
      alert('Vui lòng điền đầy đủ ngày nghỉ và lý do xin phép.');
      return;
    }

    setIsSubmittingLeave(true);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode,
          studentId: student.id,
          studentCode: student.studentCode,
          studentName: student.fullName,
          className: student.className,
          parentName: student.parentName,
          parentPhone: parentPhone || student.parentPhone,
          date: leaveDate,
          type: leaveType,
          reason: leaveReason.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || 'Đã gửi đơn xin phép thành công tới Giáo viên!');
        setShowLeaveModal(false);
        setLeaveReason('');
        // Thêm vào danh sách đơn hiển thị
        if (data.request) {
          setLeaveRequests(prev => [data.request, ...prev]);
        }
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        alert(data.error || 'Có lỗi xảy ra khi nộp đơn xin nghỉ.');
      }
    } catch (err: any) {
      alert('Lỗi kết nối mạng: ' + (err?.message || String(err)));
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Tính trạng thái hôm nay
  const todayRecord = useMemo(() => {
    return attendanceList.find(a => a.date === todayStr);
  }, [attendanceList, todayStr]);

  // Thống kê chuyên cần tháng
  const stats = useMemo(() => {
    const present = attendanceList.filter(a => a.status === 'PRESENT').length;
    const excused = attendanceList.filter(a => a.status === 'ABSENT_EXCUSED').length;
    const unexcused = attendanceList.filter(a => a.status === 'ABSENT_UNEXCUSED').length;
    const late = attendanceList.filter(a => a.status === 'LATE').length;
    return { present, excused, unexcused, late, total: attendanceList.length };
  }, [attendanceList]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Heart className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">Parent Link</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  Sổ Liên Lạc Điện Tử
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Đồng hành cùng nhà trường - Nắm bắt chuyên cần & nề nếp của con</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={syncCode ? `/student?code=${syncCode}` : '/student'}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <span>Cổng Học Sinh</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Lookup Box */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Tra cứu thông tin học sinh</span>
            </h2>
            <p className="text-xs text-slate-400">
              Nhập Số điện thoại phụ huynh đã đăng ký với GVCN để nhận báo cáo chuyên cần và gửi đơn xin phép trực tuyến.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mã trường / Lớp
              </label>
              <input
                type="text"
                placeholder="VD: ST-123456"
                value={syncCode}
                onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase tracking-wider focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Số điện thoại phụ huynh
              </label>
              <input
                type="tel"
                placeholder="VD: 0981234567"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fetchParentData(syncCode, parentPhone, studentCode)}
                disabled={isLoading || !syncCode || !parentPhone}
                className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50 cursor-pointer transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Tra cứu ngay</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-3 px-4 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-3 px-4 flex items-center gap-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </section>

        {/* Student Profile & Today Card */}
        {student && (
          <div className="space-y-6">
            {/* Student Badge Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner">
                  {student.fullName.split(' ').pop()?.[0] || 'E'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-white">{student.fullName}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                      {student.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Lớp: <strong className="text-white">{student.className}</strong></span>
                    <span>•</span>
                    <span>Mã HS: <strong className="text-blue-400 font-mono">{student.studentCode || 'HS'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action: Nộp đơn xin nghỉ */}
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Nộp đơn xin nghỉ học</span>
              </button>
            </div>

            {/* Today's Status & Kudos Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Today Attendance */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Điểm danh hôm nay</span>
                </span>
                {todayRecord ? (
                  <div className="pt-1">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border ${
                      todayRecord.status === 'PRESENT'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : todayRecord.status === 'ABSENT_EXCUSED'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : todayRecord.status === 'LATE'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {todayRecord.status === 'PRESENT' ? 'Đã có mặt tại lớp' :
                         todayRecord.status === 'ABSENT_EXCUSED' ? 'Nghỉ có phép' :
                         todayRecord.status === 'LATE' ? 'Đi trễ' : 'Vắng không phép'}
                      </span>
                    </span>
                    {todayRecord.note && (
                      <p className="text-[11px] text-slate-400 mt-2 italic">&ldquo;{todayRecord.note}&rdquo;</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 pt-1 italic">Chưa tới giờ điểm danh hoặc hôm nay không có ca học.</p>
                )}
              </div>

              {/* Card 2: Kudos Points */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Điểm rèn luyện nề nếp</span>
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-2xl font-black text-amber-300">
                    +{student.kudosPoints}đ
                  </span>
                  <span className="text-xs text-slate-400">điểm tích lũy</span>
                </div>
                <p className="text-[11px] text-slate-400">Được khen thưởng về ý thức phát biểu & 5S xưởng</p>
              </div>

              {/* Card 3: Monthly Attendance Summary */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tổng kết chuyên cần</span>
                </span>
                <div className="flex items-center gap-3 text-xs pt-1">
                  <span className="text-emerald-400 font-bold">{stats.present} Có mặt</span>
                  <span className="text-amber-400 font-bold">{stats.excused} Có phép</span>
                  {stats.late > 0 && <span className="text-orange-400 font-bold">{stats.late} Trễ</span>}
                  {stats.unexcused > 0 && <span className="text-red-400 font-bold">{stats.unexcused} Không phép</span>}
                </div>
                <p className="text-[11px] text-slate-400">Theo dõi {stats.total} buổi học gần nhất</p>
              </div>
            </div>

            {/* Leave Requests History */}
            {leaveRequests.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Đơn xin phép đã nộp gần đây ({leaveRequests.length})</span>
                </h3>
                <div className="divide-y divide-slate-800 text-xs">
                  {leaveRequests.map((req) => (
                    <div key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Xin nghỉ ngày: {req.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : req.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {req.status === 'APPROVED' ? 'Đã duyệt (Có phép)' :
                             req.status === 'REJECTED' ? 'Từ chối' : 'Đang chờ giáo viên duyệt'}
                          </span>
                        </div>
                        <p className="text-slate-400">Lý do: &ldquo;{req.reason}&rdquo;</p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance History Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                  Lịch sử điểm danh chi tiết
                </h3>
                <span className="text-xs font-mono text-slate-400">{attendanceList.length} buổi</span>
              </div>

              {attendanceList.length === 0 ? (
                <p className="text-xs text-slate-400 p-8 text-center italic">Chưa có bản ghi điểm danh nào được lưu.</p>
              ) : (
                <div className="divide-y divide-slate-800 text-xs">
                  {attendanceList.map((rec) => (
                    <div key={rec.id} className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-300 font-semibold">{rec.date}</span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : rec.status === 'ABSENT_EXCUSED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : rec.status === 'LATE'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {rec.status === 'PRESENT' ? 'Có mặt' :
                           rec.status === 'ABSENT_EXCUSED' ? 'Nghỉ có phép' :
                           rec.status === 'LATE' ? 'Đi trễ' : 'Nghỉ không phép'}
                        </span>
                      </div>

                      <div className="text-right">
                        {rec.note && <span className="text-slate-400 italic mr-2">{rec.note}</span>}
                        {rec.kudosDelta && rec.kudosDelta > 0 ? (
                          <span className="text-amber-400 font-bold font-mono">+{rec.kudosDelta}đ</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Nộp Đơn Xin Phép Nghỉ Học */}
      {showLeaveModal && student && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Đơn Xin Phép Nghỉ Học Trực Tuyến</span>
                </h3>
                <p className="text-xs text-slate-400">Học sinh: <strong className="text-white">{student.fullName}</strong> ({student.className})</p>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLeaveRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Ngày xin phép nghỉ</label>
                <input
                  type="date"
                  required
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Hình thức nghỉ</label>
                <select
                  value={leaveType}
                  onChange={(e: any) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="SICK">Nghỉ ốm / Sức khỏe không tốt</option>
                  <option value="FAMILY">Việc gia đình quan trọng</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Lý do chi tiết gửi Thầy/Cô</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Kính gửi Thầy/Cô, hôm nay cháu bị sốt nên gia đình xin phép cho cháu nghỉ 1 buổi học..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingLeave ? 'Đang gửi đơn...' : 'Gửi đơn tới Giáo viên'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
