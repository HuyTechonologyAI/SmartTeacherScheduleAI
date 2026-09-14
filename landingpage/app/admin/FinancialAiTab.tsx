'use client';

import React, { useState, useEffect } from 'react';
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
  Coins,
  FileText,
  Printer,
  Search,
  Phone,
  Mail,
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react';
import { PRICING_PLANS, PAYMENT_BENEFICIARY, DetailedQuoteResult } from '@/app/lib/paymentConfig';

export const FinancialAiTab: React.FC = () => {
  // Simulator State based on Pillar 5 pricing
  const [simVip1Teachers, setSimVip1Teachers] = useState<number>(500); // 399.000 đ/năm
  const [simVip2Classes, setSimVip2Classes] = useState<number>(100); // 1.890.000 đ/lớp/năm
  const [simSchools, setSimSchools] = useState<number>(3);
  const [simAvgSchoolUsers, setSimAvgSchoolUsers] = useState<number>(800);

  // School Fee Quick Calculator State
  const [calcSchoolUsers, setCalcSchoolUsers] = useState<number>(1200);

  // Danh sách yêu cầu báo giá từ khách hàng
  const [quotesList, setQuotesList] = useState<any[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState<boolean>(false);
  const [selectedQuoteForView, setSelectedQuoteForView] = useState<DetailedQuoteResult | null>(null);

  // Nạp danh sách yêu cầu báo giá thực tế
  const fetchQuotes = async () => {
    setIsLoadingQuotes(true);
    try {
      const res = await fetch('/api/payment/quote');
      const data = await res.json();
      if (data.success && data.quotes) {
        setQuotesList(data.quotes);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách báo giá:', err);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  // Tính đơn giá trường học theo quy mô (Trụ cột 5)
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

  // Tính toán Tài chính Dựa trên Trụ cột 5 Gốc
  // 1. VIP 1 Giáo viên cá nhân: 399.000 đ/năm (hoặc 39k/tháng)
  const vip1Revenue = simVip1Teachers * 399000;
  // 2. VIP 2 Lớp học toàn diện (GV + HS + PH): 1.890.000 đ/lớp/năm
  const vip2Revenue = simVip2Classes * 1890000;
  // 3. Gói Nhà trường: theo số user thực tế
  const schoolPriceSim = getSchoolPricing(simAvgSchoolUsers);
  const schoolRevenue = simSchools * (simAvgSchoolUsers * schoolPriceSim.yearly);

  const totalRevenue = vip1Revenue + vip2Revenue + schoolRevenue;

  // Chi phí OPEX hàng năm (~6.650.000 đ/tháng = 80 triệu/năm)
  const opexYearly = 80000000;
  const netProfit = totalRevenue - opexYearly;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Điểm hòa vốn:
  // Cần 80.000.000 / 399.000 = ~201 GV VIP 1 HOẶC 80.000.000 / 1.890.000 = ~43 Lớp học VIP 2 HOẶC 1 Trường học 1.500 users
  const breakEvenTeachersNeeded = Math.ceil(opexYearly / 399000);
  const breakEvenClassesNeeded = Math.ceil(opexYearly / 1890000);
  const breakEvenMultiplier = (totalRevenue / opexYearly).toFixed(1);

  // In Bảng Báo Giá Dự Toán Chính Thức
  const handlePrintQuoteDocument = (quote: DetailedQuoteResult) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = quote.items
      .map(
        (it, idx) => `
        <tr>
          <td style="text-align: center; padding: 10px; border: 1px solid #cbd5e1;">${idx + 1}</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1;">
            <strong>${it.name}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">${it.note}</div>
          </td>
          <td style="text-align: center; padding: 10px; border: 1px solid #cbd5e1;">${it.quantity.toLocaleString('vi-VN')}</td>
          <td style="text-align: center; padding: 10px; border: 1px solid #cbd5e1;">${it.unit}</td>
          <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1;">${it.unitPrice > 0 ? it.unitPrice.toLocaleString('vi-VN') + ' đ' : 'Tài trợ 100%'}</td>
          <td style="text-align: right; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${it.totalPrice > 0 ? it.totalPrice.toLocaleString('vi-VN') + ' đ' : '0 đ'}</td>
        </tr>
      `
      )
      .join('');

    const termsHtml = quote.terms
      .map((t) => `<li style="margin-bottom: 5px;">${t}</li>`)
      .join('');

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Bảng Báo Giá Dự Toán - ${quote.quoteCode}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.5; }
          .container { max-width: 800px; margin: auto; border: 1px solid #cbd5e1; border-radius: 16px; padding: 35px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 20px; }
          .company-name { font-size: 20px; font-weight: 900; color: #0284c7; }
          .company-sub { font-size: 12px; color: #475569; margin-top: 4px; }
          .quote-title { text-align: center; font-size: 22px; font-weight: 900; color: #0f172a; margin: 25px 0 5px; text-transform: uppercase; }
          .quote-code { text-align: center; font-size: 12px; font-weight: bold; color: #e11d48; margin-bottom: 25px; }
          .client-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 20px; margin-bottom: 25px; font-size: 13px; }
          .client-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th { background-color: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; text-align: left; }
          .summary-box { float: right; width: 340px; margin-bottom: 25px; font-size: 13px; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; }
          .grand-total { font-size: 16px; font-weight: 900; color: #e11d48; border-top: 2px solid #0f172a; border-bottom: none; margin-top: 5px; padding-top: 8px; }
          .clear { clear: both; }
          .bank-box { background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 15px; margin: 20px 0; font-size: 12px; }
          .terms { font-size: 11px; color: #475569; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          .seal-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
          .seal { border: 2px dashed #e11d48; border-radius: 50%; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; text-align: center; color: #e11d48; font-size: 10px; font-weight: bold; transform: rotate(-8deg); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="company-name">⚡ CÔNG TY CÔNG NGHỆ HUY TECHNOLOGY AI</div>
              <div class="company-sub">Nền Tảng Giáo Dục Thông Minh Smart Teacher Schedule AI</div>
              <div class="company-sub">Hotline & Zalo: 0961.364.600 • Email: contact@huytech.ai</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #475569;">
              <div><strong>Mã dự toán:</strong> ${quote.quoteCode}</div>
              <div><strong>Ngày lập:</strong> ${quote.quoteDate}</div>
              <div><strong>Hiệu lực:</strong> ${quote.validUntil} (30 ngày)</div>
            </div>
          </div>

          <div class="quote-title">BẢNG BÁO GIÁ DỰ TOÁN KINH PHÍ</div>
          <div class="quote-code">DỰ ÁN SỐ HÓA GIÁO DỤC THEO MÔ HÌNH TRỤ CỘT 5</div>

          <div class="client-box">
            <div class="client-row">
              <span>Đơn vị / Cơ sở giáo dục: <strong>${quote.organizationName}</strong></span>
              <span>Người đại diện: <strong>${quote.contactName}</strong></span>
            </div>
            <div class="client-row">
              <span>Số điện thoại: <strong>${quote.phone}</strong></span>
              <span>Email: <strong>${quote.email || 'Chưa cung cấp'}</strong></span>
            </div>
            <div class="client-row" style="margin-bottom: 0;">
              <span>Phân loại giải pháp: <strong style="color: #0284c7;">${quote.type === 'VIP2_CLASS' ? 'Gói VIP 2 (Lớp học toàn diện)' : 'Gói Nhà Trường (School Enterprise)'}</strong></span>
              <span>Tổng quy mô: <strong>${quote.userCounts.totalUsers} người dùng</strong></span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">STT</th>
                <th>Hạng Mục Giải Pháp & Quyền Lợi Bản Quyền</th>
                <th style="width: 60px; text-align: center;">SL</th>
                <th style="width: 60px; text-align: center;">ĐVT</th>
                <th style="width: 100px; text-align: right;">Đơn Giá</th>
                <th style="width: 120px; text-align: right;">Thành Tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-row">
              <span>Tổng kinh phí niêm yết:</span>
              <span>${(quote.subtotal + quote.discountAmount).toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="summary-row" style="color: #059669;">
              <span>Chiết khấu quy mô (${quote.discountRate}%):</span>
              <span>- ${quote.discountAmount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="summary-row">
              <span>Chi phí bình quân / học sinh:</span>
              <strong style="color: #0284c7;">~${quote.monthlyAveragePerStudent.toLocaleString('vi-VN')} đ/tháng</strong>
            </div>
            <div class="summary-row">
              <span>Thuế GTGT (VAT ${quote.vatRate}%):</span>
              <span>${quote.vatAmount > 0 ? quote.vatAmount.toLocaleString('vi-VN') + ' đ' : 'Miễn thuế PM'}</span>
            </div>
            <div class="summary-row grand-total">
              <span>TỔNG THANH TOÁN (1 Năm):</span>
              <span>${quote.grandTotal.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
          <div class="clear"></div>

          <div class="bank-box">
            <strong>THÔNG TIN THANH TOÁN & THỤ HƯỞNG CHÍNH THỨC:</strong><br/>
            • Ngân hàng: <strong>Ngân hàng TMCP Á Châu (ACB)</strong> • Chi nhánh: <strong>Tân Mai</strong><br/>
            • Số tài khoản: <strong style="font-family: monospace; font-size: 14px; color: #b91c1c;">37780997</strong> • Chủ tài khoản: <strong>NGO QUOC HUY</strong><br/>
            • Cú pháp chuyển khoản: <strong style="font-family: monospace; color: #0284c7;">ST ${quote.quoteCode.replace(/[^A-Za-z0-9]/g, '')}</strong>
          </div>

          <div class="terms">
            <strong>ĐIỀU KHOẢN HỢP ĐỒNG & BẢO HÀNH DỊCH VỤ:</strong>
            <ul>${termsHtml}</ul>
          </div>

          <div class="seal-section">
            <div style="font-size: 12px;">
              <div>Người lập bảng dự toán: <strong>AI Smart Financial System</strong></div>
              <div>Đại diện kinh doanh: <strong>Huy Technology AI</strong></div>
              <div style="font-size: 11px; color: #64748b; margin-top: 5px;">Bản quyền phần mềm giáo dục hợp lệ</div>
            </div>
            <div class="seal">
              XÁC THỰC<br/>DỰ TOÁN HỢP LỆ<br/>★ HUY TECH AI ★
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(docHtml);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Top Banner: Trụ Cột 6 Dựa Trên Trụ Cột 5 Gốc */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Trụ Cột 6: Tích Hợp Cơ Sở Dữ Liệu Giá Gốc Trụ Cột 5</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hệ Thống Tài Chính & Sinh Báo Giá Dự Toán Tự Động
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Toàn bộ hệ thống tài chính được tính toán đồng bộ theo bảng giá gốc của Trụ Cột 5: <strong>VIP 1 (39k/tháng, 399k/năm)</strong>, <strong>VIP 2 Lớp học</strong>, và <strong>Gói Nhà trường theo quy mô user</strong> (8k - 6k - 4.5k/tháng). Tích hợp động cơ AI tự động xuất bảng báo giá dự toán cho khách hàng!
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
              <Coins className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Dự phóng Năm 1 (Khởi động):</span>
                <span className="text-base font-black text-emerald-400">520.5 Triệu đ</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Dự phóng Năm 2 (Mở rộng):</span>
                <span className="text-base font-black text-indigo-300">~2.88 Tỷ đồng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHẦN 1: QUẢN LÝ & XUẤT BÁO GIÁ DỰ TOÁN CỦA KHÁCH HÀNG (QUOTATIONS ENGINE) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Hồ Sơ Yêu Cầu Báo Giá & Bảng Dự Toán Của Khách Hàng</h3>
              <p className="text-xs text-slate-400">Dữ liệu thực tế khách hàng gửi form yêu cầu báo giá để AI sinh dự toán</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchQuotes}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuotes ? 'animate-spin' : ''}`} />
            <span>Làm Mới Danh Sách</span>
          </button>
        </div>

        {/* Bảng danh sách yêu cầu báo giá */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-800/80 text-slate-200 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3.5 border-b border-slate-700">Mã / Ngày</th>
                <th className="p-3.5 border-b border-slate-700">Loại Gói</th>
                <th className="p-3.5 border-b border-slate-700">Cơ Sở / Trường / Lớp</th>
                <th className="p-3.5 border-b border-slate-700">Người Đại Diện & SĐT</th>
                <th className="p-3.5 border-b border-slate-700">Quy Mô User</th>
                <th className="p-3.5 border-b border-slate-700 text-right">Dự Toán AI Tính</th>
                <th className="p-3.5 border-b border-slate-700 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {quotesList && quotesList.length > 0 ? (
                quotesList.map((q, idx) => {
                  const details: DetailedQuoteResult | undefined = q.quoteDetails;
                  return (
                    <tr key={q.id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono text-indigo-400 font-bold block">{details?.quoteCode || q.id}</span>
                        <span className="text-[10px] text-slate-500">{new Date(q.createdAt).toLocaleDateString('vi-VN')}</span>
                      </td>
                      <td className="p-3.5">
                        {q.type === 'VIP2_CLASS' ? (
                          <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
                            VIP 2 (Lớp học)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-bold">
                            Nhà Trường (Enterprise)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {q.organizationName}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{q.contactName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{q.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="text-xs font-bold text-emerald-400">
                          {q.studentCount ? `${q.studentCount} HS` : ''}
                          {q.teacherCount ? ` • ${q.teacherCount} GV` : ''}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-rose-400">
                        {details?.grandTotal ? `${details.grandTotal.toLocaleString('vi-VN')} đ` : 'Đang tính'}
                      </td>
                      <td className="p-3.5 text-center">
                        {details && (
                          <button
                            type="button"
                            onClick={() => handlePrintQuoteDocument(details)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1 mx-auto cursor-pointer shadow transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            <span>In Báo Giá</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 text-xs">
                    Chưa có yêu cầu báo giá mới từ khách hàng. Dữ liệu sẽ tự động xuất hiện khi giáo viên hoặc trường học gửi biểu mẫu báo giá trên Modal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHẦN 2: BẢNG ĐỊNH GIÁ GỐC THEO TRỤ CỘT 5 */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bảng Định Giá Dịch Vụ Gốc Chuẩn Trụ Cột 5</h3>
              <p className="text-xs text-slate-400">Làm cơ sở dữ liệu tính toán dự toán cho toàn bộ khách hàng</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
            ACB STK: 37780997 • NGO QUOC HUY
          </span>
        </div>

        {/* 3 Thẻ Gói Cước Chuẩn Trụ Cột 5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gói VIP 1 */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-2 border-rose-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400 uppercase">Gói VIP 1 (Cá Nhân Giáo Viên)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">VIETQR 24/7</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">399.000 đ <span className="text-xs font-normal text-slate-400">/ năm (~33k/tháng)</span></div>
              <div className="text-xs text-slate-400">Gói tháng: <strong className="text-rose-300">39.000 đ / tháng</strong></div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-rose-900/40">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Trợ lý AI Gemini soạn bài CV 5512 & 2634</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ma trận đặc tả & Ngân hàng đề thi TT 22</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Sơ đồ tư duy kéo thả & Mini Game bài giảng</span>
              </li>
            </ul>
          </div>

          {/* Gói VIP 2 */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border-2 border-purple-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-400 uppercase">Gói VIP 2 (Lớp Học Toàn Diện)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">GIÁO VIÊN + HS + PH</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">1.890.000 đ <span className="text-xs font-normal text-slate-400">/ lớp / năm học</span></div>
              <div className="text-xs text-purple-300 font-semibold">Chỉ bình quân ~3.800 đ - 4.500 đ / học sinh / tháng</div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-purple-900/40">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bao gồm trọn gói quyền lợi VIP 1 của Giáo viên</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tài khoản 35 - 50 Học sinh làm bài tập & thi online</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tài khoản Phụ huynh: Sổ liên lạc số & xin nghỉ online</span>
              </li>
            </ul>
          </div>

          {/* Gói Nhà Trường */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900 border-2 border-teal-500/40 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-teal-400 uppercase">Gói Nhà Trường (Enterprise)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">LIÊN THÔNG 4 CỔNG</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">4.500 - 8.000 đ <span className="text-xs font-normal text-slate-400">/ user / tháng</span></div>
              <div className="text-xs text-teal-300 font-semibold">40.000 - 75.000 đ / user / năm học (tùy quy mô)</div>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-teal-900/40">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Kích hoạt 100% tài khoản Pro cho giáo viên toàn trường</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cổng /school duyệt giáo án & thời khóa biểu tập trung</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hợp đồng kinh tế, thanh toán Kho bạc & xuất hóa đơn VAT</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Live School Fee Calculator */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">Công Cụ Ước Tính Kinh Phí Hợp Đồng Trường Học Tức Thì</h4>
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
      {/* PHẦN 3: TÍNH TOÁN LẠI TOÀN BỘ KẾ HOẠCH TÀI CHÍNH (THEO GIÁ TRỤ CỘT 5) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kế Hoạch Tài Chính & Dự Phóng Kinh Doanh (Tính Lại Chuẩn Trụ Cột 5)</h3>
              <p className="text-xs text-slate-400">Chi phí OPEX, phân tích hòa vốn và biên lợi nhuận ròng với bảng giá mới</p>
            </div>
          </div>
        </div>

        {/* 2 Kịch Bản Dự Phóng Doanh Thu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kịch bản 1: Khởi động 6 tháng đầu */}
          <div className="p-5 rounded-3xl bg-slate-850 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Kịch Bản Khởi Động Năm 1</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                Biên Lợi Nhuận: 84.6%
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between">
                <span>500 Giáo viên VIP 1 (399.000 đ/năm):</span>
                <strong className="font-mono text-white">199.500.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>3 Trường học đối tác (2.400 users x 55.000 đ):</span>
                <strong className="font-mono text-white">132.000.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>100 Lớp học VIP 2 (1.890.000 đ/lớp):</span>
                <strong className="font-mono text-white">189.000.000 đ</strong>
              </li>
            </ul>

            <div className="pt-3 border-t border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tổng Doanh Thu Năm 1:</span>
                <strong className="text-base font-black text-amber-400">520.500.000 đ</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tổng Chi phí OPEX Năm:</span>
                <span className="font-mono">80.000.000 đ</span>
              </div>
              <div className="flex justify-between text-emerald-400 text-sm font-black pt-1">
                <span>Lợi Nhuận Ròng (Net Profit):</span>
                <span>~440.500.000 đ</span>
              </div>
            </div>
          </div>

          {/* Kịch bản 2: Mở rộng Năm thứ 2 */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-teal-950/40 border-2 border-indigo-500/40 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-300 uppercase tracking-wider">Kịch Bản Mở Rộng Năm 2</span>
              <span className="text-xs font-bold text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800">
                Biên Lợi Nhuận: &gt; 93%
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between">
                <span>2.500 Giáo viên VIP 1 (399.000 đ):</span>
                <strong className="font-mono text-white">~997.500.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>15 Trường học đối tác (15.000 users x 50.000 đ):</span>
                <strong className="font-mono text-white">~750.000.000 đ</strong>
              </li>
              <li className="flex justify-between">
                <span>600 Lớp học VIP 2 (1.890.000 đ/lớp):</span>
                <strong className="font-mono text-white">~1.134.000.000 đ</strong>
              </li>
            </ul>

            <div className="pt-3 border-t border-indigo-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-200">
                <span>Tổng Doanh Thu Dự Phóng:</span>
                <strong className="text-base font-black text-teal-300">~2.88 Tỷ đồng</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tổng Chi phí Vận hành (Mở rộng):</span>
                <span className="font-mono">~200.000.000 đ</span>
              </div>
              <div className="flex justify-between text-teal-400 text-sm font-black pt-1">
                <span>Lợi Nhuận Ròng (Net Profit):</span>
                <span>~2.68 Tỷ đồng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thẻ Phân Tích Điểm Hòa Vốn Chuẩn Trụ Cột 5 */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h4 className="font-black text-sm text-white">Điểm Hòa Vốn (Break-even Point) Với Giá Trụ Cột 5:</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Với chi phí vận hành chỉ <strong>80 triệu đ / năm</strong>, hệ thống chỉ cần đạt được 1 trong 3 mốc sau là hòa vốn 100%:
              <br/>• Hoặc <strong>201 giáo viên VIP 1</strong> đăng ký gói năm (399.000 đ).
              <br/>• Hoặc chỉ <strong>43 lớp học VIP 2</strong> (1.890.000 đ/lớp).
              <br/>• Hoặc đúng <strong>1 trường học đối tác quy mô 1.500 users</strong>.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Hòa vốn tức thì với:</span>
            <span className="text-xl font-black text-emerald-400">201 GV VIP 1</span>
            <span className="text-[10px] text-emerald-300 block">hoặc 43 Lớp VIP 2 • 1 Trường học</span>
          </div>
        </div>

        {/* BỘ MÔ PHỎNG KỊCH BẢN TÀI CHÍNH TRỰC TIẾP */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-indigo-500/30 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-base text-white">Bộ Mô Phỏng Kịch Bản Tài Chính Trực Tiếp (Live Financial Simulator)</h4>
            </div>
            <span className="text-xs text-slate-400">Kéo thanh trượt để thử nghiệm quy mô tăng trưởng theo giá Trụ Cột 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Số Giáo viên VIP 1 (399k/năm):</span>
                <strong className="text-rose-400 font-mono text-sm">{simVip1Teachers.toLocaleString('vi-VN')} GV</strong>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={simVip1Teachers}
                onChange={(e) => setSimVip1Teachers(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block text-right">Doanh thu: {vip1Revenue.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Số Lớp học VIP 2 (1.89Tr/lớp):</span>
                <strong className="text-purple-400 font-mono text-sm">{simVip2Classes.toLocaleString('vi-VN')} Lớp</strong>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={simVip2Classes}
                onChange={(e) => setSimVip2Classes(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block text-right">Doanh thu: {vip2Revenue.toLocaleString('vi-VN')} đ</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Số Trường học ({simAvgSchoolUsers} users/trường):</span>
                <strong className="text-teal-400 font-mono text-sm">{simSchools} Trường</strong>
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
