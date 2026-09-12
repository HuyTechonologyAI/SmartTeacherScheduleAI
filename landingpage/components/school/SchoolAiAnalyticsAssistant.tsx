"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Send,
  RefreshCw,
  Users,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import {
  TeacherStaffItem,
  SchoolLessonPlanItem,
  SchoolClassroomItem
} from '@/app/school/schoolManagementData';
import { Language } from '@/app/app/i18n';

interface SchoolAiAnalyticsAssistantProps {
  lang: Language;
  staffList: TeacherStaffItem[];
  lessonPlans: SchoolLessonPlanItem[];
  classList: SchoolClassroomItem[];
}

export default function SchoolAiAnalyticsAssistant({
  lang,
  staffList,
  lessonPlans,
  classList
}: SchoolAiAnalyticsAssistantProps) {
  const isEn = lang === 'en';
  const [activeSubTab, setActiveSubTab] = useState<'risk_detection' | 'workload_analytics' | 'auto_reports'>('risk_detection');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [selectedReportType, setSelectedReportType] = useState<'MONTHLY_SUMMARY' | 'SAFETY_INSPECTION' | 'PARENT_ANNOUNCEMENT'>('MONTHLY_SUMMARY');

  // Tính toán chỉ số phân tích dữ liệu tự động
  const totalStaff = staffList.length;
  const tenuredCount = staffList.filter(s => s.category === 'TENURED_TEACHER').length;
  const contractCount = staffList.filter(s => s.category === 'CONTRACT_TEACHER').length;
  const totalStudents = classList.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  
  const pendingPlans = lessonPlans.filter(p => p.status === 'PENDING').length;
  const approvedPlans = lessonPlans.filter(p => p.status === 'APPROVED').length;
  const revisionPlans = lessonPlans.filter(p => p.status === 'NEEDS_REVISION').length;
  const planApprovalRate = lessonPlans.length > 0 ? Math.round((approvedPlans / lessonPlans.length) * 100) : 100;

  // Giáo viên có nguy cơ quá tải hoặc thiếu tiết
  const overloadedTeachers = staffList.filter(s => s.weeklyTeachingHours > 20);
  const underloadedTeachers = staffList.filter(s => s.category.includes('TEACHER') && s.weeklyTeachingHours < 12 && !s.department.includes('Ban Giám Hiệu'));

  const handleCopyReport = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    }
  };

  const getGeneratedReportText = () => {
    const today = new Date().toLocaleDateString('vi-VN');
    if (selectedReportType === 'MONTHLY_SUMMARY') {
      return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n-------------------------\nBÁO CÁO NHANH CÔNG TÁC CHUYÊN MÔN & KỶ CƯƠNG TRƯỜNG HỌC\n(Trích xuất từ Hệ thống Quản trị Nhà trường EduViet)\nNgày báo cáo: ${today}\n\nI. TÌNH HÌNH ĐỘI NGŨ CÁN BỘ, GIÁO VIÊN & HỌC SINH:\n- Tổng số cán bộ, giáo viên, nhân viên: ${totalStaff} đồng chí (Biên chế cơ hữu: ${tenuredCount}, Hợp đồng: ${contractCount}).\n- Tổng số lớp học: ${classList.length} lớp. Tổng số học sinh toàn trường: ${totalStudents} em.\n- Tỷ lệ chuyên cần bình quân toàn trường đạt: 98.4% (Không có trường hợp học sinh bỏ học).\n\nII. TIẾN ĐỘ THỰC HIỆN KẾ HOẠCH BÀI DẠY (GIÁO ÁN CV 5512):\n- Tổng số giáo án nộp kiểm duyệt: ${lessonPlans.length} kế hoạch bài dạy.\n- Đã phê duyệt đạt chuẩn chất lượng: ${approvedPlans} giáo án (${planApprovalRate}%).\n- Kế hoạch bài dạy đang chờ duyệt hoặc yêu cầu bổ sung: ${pendingPlans + revisionPlans} bài.\n\nIII. ĐÁNH GIÁ VÀ KIẾN NGHỊ BAN GIÁM HIỆU:\n1. Nề nếp dạy và học ổn định, các tổ chuyên môn thực hiện đúng khung thời khóa biểu.\n2. Đề nghị các Tổ trưởng chuyên môn hoàn tất ký số giáo án tuần tới trước 17h00 thứ Sáu.\n\nHIỆU TRƯỞNG NHÀ TRƯỜNG\n(Ký và đóng dấu điện tử)`;
    }
    if (selectedReportType === 'SAFETY_INSPECTION') {
      return `TRƯỜNG TIỂU HỌC VIỆT NAM\nBAN AN TOÀN TRƯỜNG HỌC & Y TẾ HỌC ĐƯỜNG\n-------------------------\nBIÊN BẢN RÀ SOÁT CẢNH BÁO AN TOÀN & SỨC KHỎE HỌC SINH\nThời gian: ${today}\n\n1. Công tác y tế & Phòng chống dịch bệnh:\n- Phòng Y tế đã kiểm tra tủ thuốc sơ cứu tại các phòng chức năng.\n- Không phát hiện ca sốt xuất huyết hoặc ngộ độc thực phẩm bán trú.\n\n2. Cảnh báo chuyên cần & An toàn học đường (AI Risk Alert):\n- Phát hiện 01 trường hợp học sinh nghỉ học có phép do cảm cúm (Lớp 3A1), nhân viên y tế đã liên hệ phụ huynh hướng dẫn cách ly chăm sóc.\n- Toàn bộ hệ thống bình chữa cháy tại Phòng Tin học và Thư viện số đảm bảo áp suất hoạt động.\n\nCÁN BỘ Y TẾ PHỤ TRÁCH\nBác sĩ Vũ Hoài Nam`;
    }
    return `THÔNG BÁO TỪ BAN GIÁM HIỆU NHÀ TRƯỜNG\nKính gửi: Toàn thể Quý Phụ huynh và Cán bộ Giáo viên\nV/v: Kế hoạch tổ chức Hội thảo Đổi mới Phương pháp Giáo dục & Hoạt động Ngoại khóa\n\nNhà trường xin trân trọng thông báo kế hoạch hoạt động tuần tới:\n1. Thời gian học tập của các con vẫn diễn ra bình thường theo Thời khóa biểu đã công bố.\n2. Khuyến khích phụ huynh theo dõi điểm danh thời gian thực và nộp đơn xin phép nghỉ trực tuyến qua Sổ Liên Lạc Điện Tử.\n3. Mọi thông tin đóng góp ý kiến hoặc phản ánh, kính mời quý phụ huynh gửi trực tiếp tại mục "Đề xuất & Kiến nghị" trên Cổng thông tin.\n\nTrân trọng cảm ơn sự đồng hành của Quý Phụ huynh!\nBAN GIÁM HIỆU NHÀ TRƯỜNG`;
  };

  return (
    <div className="bg-white dark:bg-[#111728] border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
      
      {/* Header AI Analytics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-2.5 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isEn ? "School Executive AI Analytics & Early Risk Warning" : "Trợ Lý AI Quản Trị Giáo Dục & Cảnh Báo Rủi Ro Sớm"}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                QĐ 2422/BGDĐT ✨
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isEn 
                ? "Real-time institutional health scan • Workload distribution • Automated executive reporting" 
                : "Quét dữ liệu vận hành toàn trường • Cân bằng tải sư phạm • Cảnh báo sớm rủi ro bỏ học / trễ giáo án"}
            </p>
          </div>
        </div>

        {/* 3 Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveSubTab('risk_detection')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'risk_detection'
                ? 'bg-white dark:bg-[#171b2d] text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🚨 {isEn ? "Risk Alerts" : "Cảnh Báo Rủi Ro"}
          </button>
          <button
            onClick={() => setActiveSubTab('workload_analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'workload_analytics'
                ? 'bg-white dark:bg-[#171b2d] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📊 {isEn ? "Workload Scan" : "Định Mức Giờ Dạy"}
          </button>
          <button
            onClick={() => setActiveSubTab('auto_reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'auto_reports'
                ? 'bg-white dark:bg-[#171b2d] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📝 {isEn ? "Auto Reports" : "Soạn Thảo Báo Cáo"}
          </button>
        </div>
      </div>

      {/* 1. TAB CẢNH BÁO RỦI RO SỚM (EARLY WARNING SYSTEM) */}
      {activeSubTab === 'risk_detection' && (
        <div className="space-y-3 animate-fade-in text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Alert 1: Chuyên cần học sinh */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>{isEn ? "Attendance Risk Alert" : "Rủi Ro Chuyên Cần Học Sinh"}</span>
                </span>
                <span className="px-2 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-[10px] font-black">
                  Theo dõi sát
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Tỷ lệ chuyên cần toàn trường hôm nay đạt <strong>98.4%</strong>. Lớp 3A1 có 1 học sinh (Nguyễn Bảo An) nghỉ ốm có đơn phép trực tuyến. Không có học sinh vắng không phép quá 2 buổi.
              </p>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mức độ an toàn: Xanh (Bình thường)</span>
              </div>
            </div>

            {/* Alert 2: Kiểm duyệt Kế hoạch bài dạy */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-rose-600" />
                  <span>{isEn ? "Lesson Plan Deadline" : "Kỷ Cương Tiến Độ Giáo Án"}</span>
                </span>
                <span className="px-2 py-0.2 rounded-full bg-rose-200 dark:bg-rose-900 text-[10px] font-black">
                  Cần duyệt: {pendingPlans}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Hiện có <strong>{pendingPlans} giáo án</strong> mới nộp đang chờ BGH phê duyệt và <strong>{revisionPlans} giáo án</strong> cần chỉnh sửa tiêu chí năng lực CV 5512 trước giờ lên lớp thứ Hai.
              </p>
              <div className="text-[11px] text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1 pt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Nhắc nhở: Tổ Ngoại ngữ cần hoàn thiện sớm</span>
              </div>
            </div>

            {/* Alert 3: Xung đột phòng chức năng */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between text-indigo-800 dark:text-indigo-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>{isEn ? "Smart Rooms Schedule" : "Phòng Học Chức Năng"}</span>
                </span>
                <span className="px-2 py-0.2 rounded-full bg-indigo-200 dark:bg-indigo-900 text-[10px] font-black">
                  Sẵn sàng
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Phòng Lab Ngoại ngữ đang có tiết học của Lớp 3A1 (Cô Sarah Nguyen). Phòng Tin học Smart Lab 1 và Nhà đa năng trống tiết chiều nay, không phát hiện trùng lặp lịch đặt phòng.
              </p>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% thiết bị CNTT vận hành bình thường</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. TAB PHÂN TÍCH ĐỊNH MỨC GIỜ DẠY GIÁO VIÊN (WORKLOAD ANALYTICS) */}
      {activeSubTab === 'workload_analytics' && (
        <div className="space-y-3 animate-fade-in text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900 dark:text-white">
                {isEn ? "Teaching Hours Balance Analysis" : "Phân Tích Cân Bằng Định Mức Tiết Dạy Của Giáo Viên Toàn Trường"}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Căn cứ Thông tư 15/2017/TT-BGDĐT: Định mức giáo viên tiểu học là 23 tiết/tuần, giáo viên THCS là 19 tiết/tuần, giáo viên THPT là 17 tiết/tuần.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                Tải trung bình: 18 tiết/tuần
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {staffList.filter(s => s.category.includes('TEACHER')).map(t => {
              const isOver = t.weeklyTeachingHours > 20;
              const isUnder = t.weeklyTeachingHours < 12 && !t.department.includes('Ban Giám Hiệu');
              return (
                <div key={t.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.avatar} alt={t.fullName} className="w-8 h-8 rounded-full bg-slate-100 object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">{t.fullName}</span>
                        <span className="text-[10px] text-slate-400">({t.department})</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Môn: {t.teachingSubjects.join(', ')} • Phụ trách: {t.assignedClasses.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {t.weeklyTeachingHours} tiết/tuần
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isOver 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300' 
                        : isUnder 
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300' 
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                    }`}>
                      {isOver ? '⚠️ Quá tải' : isUnder ? '⚠️ Thiếu tiết' : '✅ Đạt chuẩn'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TAB SOẠN THẢO BÁO CÁO TỰ ĐỘNG (AUTO REPORTS & MEMOS) */}
      {activeSubTab === 'auto_reports' && (
        <div className="space-y-3 animate-fade-in text-xs">
          
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">Chọn loại văn bản cần tạo:</span>
              <select
                value={selectedReportType}
                onChange={(e: any) => setSelectedReportType(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="MONTHLY_SUMMARY">📄 Báo cáo chuyên môn định kỳ gửi Phòng/Sở GD&ĐT</option>
                <option value="SAFETY_INSPECTION">🛡️ Biên bản rà soát an toàn & sức khỏe học đường</option>
                <option value="PARENT_ANNOUNCEMENT">📢 Thông báo của Ban Giám Hiệu gửi Phụ huynh</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyReport(getGeneratedReportText())}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? (isEn ? "Copied!" : "Đã sao chép!") : (isEn ? "Copy Report" : "Sao chép báo cáo")}</span>
              </button>
            </div>
          </div>

          {/* Report Viewer */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text shadow-inner">
            {getGeneratedReportText()}
          </div>
        </div>
      )}

    </div>
  );
}
