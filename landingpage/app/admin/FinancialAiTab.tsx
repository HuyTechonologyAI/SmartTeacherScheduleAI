'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Building,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  PieChart,
  Calculator,
  ArrowUpRight,
  Shield,
  Sparkles,
  BarChart3,
  Award,
  HelpCircle,
  Clock,
  Coins
} from 'lucide-react';

export const FinancialAiTab: React.FC = () => {
  // Simulator State
  const [simTeachers, setSimTeachers] = useState<number>(500);
  const [simSchools, setSimSchools] = useState<number>(3);
  const [simAvgSchoolUsers, setSimAvgSchoolUsers] = useState<number>(800);
  const [simParents, setSimParents] = useState<number>(1000);

  // School Fee Quick Calculator State
  const [calcSchoolUsers, setCalcSchoolUsers] = useState<number>(1200);

  // Tính đơn giá trường học theo quy mô
  const getSchoolPricing = (users: number) => {
    if (users < 500) {
      return { monthly: 8000, yearly: 75000, tierLabel: 'Dưới 500 users' };
    } else if (users <= 1500) {
      return { monthly: 6000, yearly: 55000, tierLabel: '500 - 1.500 users' };
    } else {
      return { monthly: 4500, yearly: 40000, tierLabel: 'Trên 1.500 users' };
    }
  };

  const schoolPrice = getSchoolPricing(calcSchoolUsers);
  const schoolTotalMonthly = calcSchoolUsers * schoolPrice.monthly;
  const schoolTotalYearly = calcSchoolUsers * schoolPrice.yearly;

  // Tính toán Mô phỏng Tài chính (Simulator)
  const teacherRevenue = simTeachers * 199000; // 199k/năm
  const schoolPriceSim = getSchoolPricing(simAvgSchoolUsers);
  const schoolRevenue = simSchools * (simAvgSchoolUsers * schoolPriceSim.yearly);
  const parentRevenue = simParents * 99000; // 99k/năm
  const totalRevenue = teacherRevenue + schoolRevenue + parentRevenue;

  // Chi phí OPEX
  const opexYearly = 80000000; // 80 triệu/năm
  const netProfit = totalRevenue - opexYearly;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';
  const breakEvenTeachersNeeded = Math.ceil(opexYearly / 199000); // 402 hoặc theo tháng ~34
  const breakEvenMultiplier = (totalRevenue / opexYearly).toFixed(1);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Top Banner: Trụ Cột 6 */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Trụ Cột 6: Chiến Lược Kinh Doanh & Kế Hoạch Tài Chính</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mô Hình Định Giá Theo User & Dự Phóng Kinh Doanh
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Chiến lược thâm nhập thị trường giáo dục Việt Nam với mức định giá theo quy mô người dùng (User-based Pricing), tối ưu chi phí OPEX chỉ 6.65 Tr/tháng và đạt biên lợi nhuận ròng vượt trội 75.8% – 90%.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
              <Coins className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Dự phóng Năm 1:</span>
                <span className="text-base font-black text-emerald-400">330.5 Triệu đ</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Dự phóng Năm 2:</span>
                <span className="text-base font-black text-indigo-300">~2.04 Tỷ đồng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 1: PHÂN TÍCH ĐỐI THỦ CẠNH TRANH TẠI VIỆT NAM */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Phân Tích Đối Thủ Cạnh Tranh Tại Việt Nam</h3>
              <p className="text-xs text-slate-400">Định vị điểm mạnh, điểm yếu và khoảng trống thị trường EdTech</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            4 Nền Tảng Phổ Biến
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Đối thủ 1: VnEdu & SMAS */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-400">VnEdu & SMAS</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">VNPT / Viettel</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mạng lưới phổ cập trường công lập rộng nhất, nhưng giao diện cồng kềnh, thiếu hẳn AI sư phạm, không có tính năng soạn giáo án 5512 hay Voice AI.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-700/50 space-y-1.5 text-xs">
              <div className="text-slate-400">Chi phí: <strong className="text-slate-200">15.000 - 30.000 đ/tháng/HS</strong></div>
              <div className="text-rose-400 text-[11px]">⚠️ Không hỗ trợ việc soạn bài & giảng dạy hàng ngày của GV</div>
            </div>
          </div>

          {/* Đối thủ 2: K12Online & OLM */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400">K12Online & OLM</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">Thi & Học Trực Tuyến</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tập trung vào tổ chức thi cử và học trực tuyến. Chi phí theo trường đắt đỏ (20 - 50 triệu/năm), không phục vụ nhu cầu thường nhật của giáo viên.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-700/50 space-y-1.5 text-xs">
              <div className="text-slate-400">Chi phí: <strong className="text-slate-200">20 - 50 Triệu đ/trường/năm</strong></div>
              <div className="text-rose-400 text-[11px]">⚠️ Thiếu tiện ích lập lịch, sổ báo giảng, trợ lý 5512</div>
            </div>
          </div>

          {/* Đối thủ 3: Shub Classroom & Azota */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-4 hover:border-slate-600 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-400">Shub & Azota</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">Giao Bài & Chấm Thi</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tập trung tính năng giao bài tập và chấm thi trắc nghiệm. Thiếu hệ sinh thái 4 cổng (GV, Học sinh, Phụ huynh, Nhà trường) và không có công cụ sư phạm chuyên sâu.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-700/50 space-y-1.5 text-xs">
              <div className="text-slate-400">Định vị: <strong className="text-slate-200">Công cụ chấm thi đơn lẻ</strong></div>
              <div className="text-rose-400 text-[11px]">⚠️ Thiếu đồng bộ liên thông và quản trị trường học</div>
            </div>
          </div>

          {/* Đối thủ 4: Smart Teacher Schedule AI (Ưu Thế) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border-2 border-emerald-500/50 flex flex-col justify-between space-y-4 shadow-lg ring-2 ring-emerald-500/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Smart Teacher AI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">VƯỢT TRỘI 6-IN-1</span>
              </div>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Giá thành cực kỳ cạnh tranh, trải nghiệm mượt mà đa nền tảng, độc quyền công nghệ <strong>AI Sư phạm 6-in-1</strong> kết nối liền mạch 4 đối tượng.
              </p>
            </div>
            <div className="pt-3 border-t border-emerald-800/60 space-y-1.5 text-xs">
              <div className="text-emerald-300 font-bold">Chỉ từ: <strong>4.000 - 8.000 đ/user/tháng</strong></div>
              <div className="text-teal-300 text-[11px]">✅ Đầy đủ AI 5512, Đề thi TT 22, Voice AI, Sơ đồ tư duy</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHẦN 2: BẢNG ĐỊNH GIÁ DỊCH VỤ THEO USER NGƯỜI DÙNG */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bảng Định Giá Dịch Vụ Theo User Người Dùng</h3>
              <p className="text-xs text-slate-400">Cơ chế linh hoạt, chi phí vi mô theo từng nhóm đối tượng</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
            3 Nhóm User • 3 Cấp Độ
          </span>
        </div>

        {/* Bảng Định Giá Ma Trận */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-800/80 text-slate-200 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-4 border-b border-slate-700">Nhóm User</th>
                <th className="p-4 border-b border-slate-700">Gói Miễn Phí (Starter)</th>
                <th className="p-4 border-b border-slate-700 text-rose-300">Gói Cá Nhân VIP (Pro)</th>
                <th className="p-4 border-b border-slate-700 text-teal-300">Gói Trường Học (School Enterprise)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-rose-400" />
                  <span>👨‍🏫 Giáo Viên</span>
                </td>
                <td className="p-4">
                  <strong className="text-slate-400 block">0 đ</strong>
                  <span className="text-[11px] text-slate-500">Lịch dạy cơ bản, 1 lớp học, AI cơ bản</span>
                </td>
                <td className="p-4 bg-rose-950/10">
                  <strong className="text-rose-400 block text-sm">29.000 đ / tháng</strong>
                  <span className="text-xs text-amber-300 font-semibold">hoặc 199.000 đ / năm</span>
                  <p className="text-[11px] text-slate-400 mt-1">Trọn bộ AI 5512, Đề thi TT 22, Voice AI, Sơ đồ tư duy, Mini game</p>
                </td>
                <td className="p-4 bg-teal-950/10">
                  <strong className="text-teal-400 block">Cấp Trọn Bộ Pro</strong>
                  <span className="text-[11px] text-slate-400">Kích hoạt tài khoản Pro cho 100% giáo viên trong trường</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-indigo-400" />
                  <span>👨‍👩‍👧 Phụ Huynh & Học Sinh</span>
                </td>
                <td className="p-4">
                  <strong className="text-slate-400 block">0 đ</strong>
                  <span className="text-[11px] text-slate-500">Xem TKB, gửi đơn xin nghỉ trực tuyến</span>
                </td>
                <td className="p-4 bg-rose-950/10">
                  <strong className="text-rose-400 block text-sm">15.000 đ / tháng</strong>
                  <span className="text-xs text-amber-300 font-semibold">hoặc 99.000 đ / năm</span>
                  <p className="text-[11px] text-slate-400 mt-1">Báo cáo AI phân tích năng lực, SMS & thông báo học tập chuyên sâu</p>
                </td>
                <td className="p-4 bg-teal-950/10">
                  <strong className="text-teal-400 block">Nằm Trong Gói Trường</strong>
                  <span className="text-[11px] text-slate-400">Được tài trợ trọn gói từ ngân sách trường học</span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-bold text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-400" />
                  <span>🏫 Nhà Trường & Cơ Sở GD</span>
                </td>
                <td className="p-4">
                  <span className="text-slate-400 font-semibold block">Dùng thử 30 ngày</span>
                  <span className="text-[11px] text-slate-500">Áp dụng thử nghiệm cho 1 khối</span>
                </td>
                <td className="p-4 bg-rose-950/10 text-slate-500 text-center font-mono">
                  ──────────────
                </td>
                <td className="p-4 bg-teal-950/10">
                  <strong className="text-teal-400 block text-sm font-black">4.000 - 8.000 đ / USER / THÁNG</strong>
                  <span className="text-[11px] text-slate-300">Tính theo tổng số HS & GV toàn trường (Liên thông 4 cổng)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Thang Mức Phí Linh Hoạt Theo Quy Mô Trường Học */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-slate-400">Quy mô Dưới 500 Users:</span>
            <div className="text-lg font-black text-teal-400">8.000 đ <span className="text-xs text-slate-400 font-normal">/ user / tháng</span></div>
            <div className="text-xs text-slate-300">Khoảng <strong>75.000 đ</strong> / user / năm học</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-slate-400">Quy mô 500 - 1.500 Users (Tiêu chuẩn):</span>
            <div className="text-lg font-black text-teal-400">6.000 đ <span className="text-xs text-slate-400 font-normal">/ user / tháng</span></div>
            <div className="text-xs text-slate-300">Khoảng <strong>55.000 đ</strong> / user / năm học</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
            <span className="text-xs font-bold text-slate-400">Quy mô Trên 1.500 Users (Lớn):</span>
            <div className="text-lg font-black text-teal-400">4.500 đ <span className="text-xs text-slate-400 font-normal">/ user / tháng</span></div>
            <div className="text-xs text-slate-300">Khoảng <strong>40.000 đ</strong> / user / năm học</div>
          </div>
        </div>

        {/* Live School Fee Calculator */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">Công Cụ Tính Nhanh Doanh Thu Hợp Đồng Nhà Trường</h4>
            </div>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800">
              Khung giá: {schoolPrice.tierLabel} ({schoolPrice.monthly.toLocaleString('vi-VN')} đ/tháng)
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Số lượng User toàn trường (Giáo viên + Học sinh):</span>
              <strong className="text-indigo-400 text-sm font-mono">{calcSchoolUsers.toLocaleString('vi-VN')} Users</strong>
            </div>
            <input
              type="range"
              min="200"
              max="3500"
              step="50"
              value={calcSchoolUsers}
              onChange={(e) => setCalcSchoolUsers(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Doanh thu Trường học Hàng Tháng:</span>
              <span className="text-lg font-black text-emerald-400">{schoolTotalMonthly.toLocaleString('vi-VN')} đ / tháng</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-slate-400 block text-[11px]">Hợp đồng Trọn Gói 1 Năm Học:</span>
              <span className="text-lg font-black text-teal-400">{schoolTotalYearly.toLocaleString('vi-VN')} đ / năm</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHẦN 3: KẾ HOẠCH TÀI CHÍNH & DỰ PHÓNG KINH DOANH */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kế Hoạch Tài Chính & Dự Phóng Kinh Doanh</h3>
              <p className="text-xs text-slate-400">Chi phí vận hành OPEX, phân tích hòa vốn và biên lợi nhuận ròng</p>
            </div>
          </div>
        </div>

        {/* Thẻ Chi Phí Vận Hành Hàng Tháng (OPEX) */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-400" />
              <span>Cơ Cấu Chi Phí Vận Hành Hàng Tháng (OPEX): ~6.650.000 đ / tháng (~80 Triệu đ / năm)</span>
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800 font-bold">
              Cực Kỳ Tối Ưu
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Supabase Database Pro</span>
              <strong className="text-slate-200">650.000 đ</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Hosting Vercel Pro</span>
              <strong className="text-slate-200">500.000 đ</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Gemini AI API Token</span>
              <strong className="text-slate-200">4.000.000 đ</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Webhook & Banking</span>
              <strong className="text-slate-200">1.000.000 đ</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">Bảo trì & Dự phòng</span>
              <strong className="text-slate-200">500.000 đ</strong>
            </div>
          </div>
        </div>

        {/* 2 Kịch Bản Dự Phóng Doanh Thu: Khởi Động vs Mở Rộng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kịch bản 1: Khởi động 6 tháng đầu */}
          <div className="p-5 rounded-3xl bg-slate-850 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Kịch Bản Khởi Động (6 Tháng Đầu)</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                Biên Lợi Nhuận: 75.8%
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between">
                <span>500 Giáo viên Pro (199k/năm):</span>
                <strong className="font-mono text-white">99.500.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>3 Trường học đối tác (2.400 users - 55k/năm):</span>
                <strong className="font-mono text-white">132.000.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>1.000 Phụ huynh VIP (99k/năm):</span>
                <strong className="font-mono text-white">99.000.000 đ</strong>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tổng Doanh Thu Năm:</span>
                <strong className="text-base font-black text-amber-400">330.500.000 đ</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tổng Chi phí OPEX Năm:</span>
                <span className="font-mono">80.000.000 đ</span>
              </div>
              <div className="flex justify-between text-emerald-400 text-sm font-black pt-1">
                <span>Lợi Nhuận Ròng (Net Profit):</span>
                <span>~250.500.000 đ</span>
              </div>
            </div>
          </div>

          {/* Kịch bản 2: Mở rộng Năm thứ 2 */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-teal-950/40 border-2 border-indigo-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">Kịch Bản Mở Rộng (Năm Thứ 2)</span>
              <span className="text-xs font-bold text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800">
                Biên Lợi Nhuận: &gt; 90%
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between">
                <span>2.500 Giáo viên Pro:</span>
                <strong className="font-mono text-white">~497.500.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>15 Trường học đối tác (15.000 users):</span>
                <strong className="font-mono text-white">~750.000.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>8.000 Phụ huynh VIP:</span>
                <strong className="font-mono text-white">~792.000.000 đ</strong>
              </li>
            </ul>

            <div className="pt-3 border-t border-indigo-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-200">
                <span>Tổng Doanh Thu Dự Phóng:</span>
                <strong className="text-base font-black text-teal-300">~2.04 Tỷ đồng</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tổng Chi phí Vận hành (Mở rộng):</span>
                <span className="font-mono">~200.000.000 đ</span>
              </div>
              <div className="flex justify-between text-teal-400 text-sm font-black pt-1">
                <span>Lợi Nhuận Ròng (Net Profit):</span>
                <span>~1.84 Tỷ đồng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thẻ Phân Tích Điểm Hòa Vốn (Break-Even Point) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h4 className="font-black text-sm text-white">Điểm Hòa Vốn (Break-even Point) Cực Thấp:</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hệ thống chỉ cần <strong>34 giáo viên Pro</strong> (gói năm) hoặc đúng <strong>1 trường học quy mô 1.200 học sinh</strong> là đã trang trải 100% chi phí máy chủ, cơ sở dữ liệu và AI cả năm. Tất cả người dùng từ mốc này trở đi đem lại lợi nhuận ròng trực tiếp.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Điểm hòa vốn tối thiểu:</span>
            <span className="text-2xl font-black text-emerald-400">34 GV Pro</span>
            <span className="text-[10px] text-emerald-300 block">hoặc 1 Trường học (1.2k HS)</span>
          </div>
        </div>

        {/* BỘ MÔ PHỎNG KỊCH BẢN TÀI CHÍNH TRỰC TIẾP (LIVE SIMULATOR) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-indigo-500/30 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-base text-white">Bộ Mô Phỏng Kịch Bản Tài Chính Tương Tác (Live Financial Simulator)</h4>
            </div>
            <span className="text-xs text-slate-400">Kéo thanh trượt để thử nghiệm các mốc tăng trưởng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Số Giáo viên Pro:</span>
                <strong className="text-rose-400 font-mono text-sm">{simTeachers.toLocaleString('vi-VN')} GV</strong>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={simTeachers}
                onChange={(e) => setSimTeachers(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block text-right">Doanh thu: {teacherRevenue.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Số Trường Học Đối Tác:</span>
                <strong className="text-teal-400 font-mono text-sm">{simSchools} Trường ({simAvgSchoolUsers} users/trường)</strong>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={simSchools}
                onChange={(e) => setSimSchools(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block text-right">Doanh thu: {schoolRevenue.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Số Phụ Huynh VIP:</span>
                <strong className="text-indigo-400 font-mono text-sm">{simParents.toLocaleString('vi-VN')} PH</strong>
              </div>
              <input
                type="range"
                min="100"
                max="15000"
                step="200"
                value={simParents}
                onChange={(e) => setSimParents(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block text-right">Doanh thu: {parentRevenue.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* Kết quả mô phỏng tức thì */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tổng Doanh Thu Dự Phóng</span>
              <span className="text-xl font-black text-amber-300">{totalRevenue.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Chi Phí Vận Hành (OPEX)</span>
              <span className="text-xl font-black text-slate-300">{opexYearly.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Lợi Nhuận Ròng Dự Kiến</span>
              <span className="text-xl font-black text-emerald-400">{netProfit.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40">
              <span className="text-[10px] text-indigo-300 uppercase font-bold block">Biên Lợi Nhuận Ròng</span>
              <span className="text-xl font-black text-teal-300">{profitMargin}% ({breakEvenMultiplier}x Hòa Vốn)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
