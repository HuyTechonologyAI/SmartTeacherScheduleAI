'use client';

import React from 'react';
import {
  X,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Award,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  Download,
  Layers
} from 'lucide-react';

interface EcosystemBrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EcosystemBrochureModal({ isOpen, onClose }: EcosystemBrochureModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Hồ Sơ Năng Lực & Hệ Sinh Thái Chuyển Đổi Số - Huy Technology AI</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 3px solid #0284c7; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
          .brand-title { font-size: 22px; font-weight: 900; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; }
          .brand-sub { font-size: 11px; color: #64748b; font-weight: 600; }
          .section-title { font-size: 14px; font-weight: 800; color: #0369a1; text-transform: uppercase; border-left: 4px solid #0284c7; padding-left: 8px; margin: 14px 0 8px 0; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px; }
          .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background-color: #f8fafc; }
          .card-title { font-weight: 800; font-size: 12px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
          .card-desc { font-size: 11px; color: #334155; }
          .card-link { font-family: monospace; font-size: 10px; color: #0284c7; font-weight: bold; margin-top: 6px; }
          .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
          .badge-red { background: #fee2e2; color: #b91c1c; }
          .badge-green { background: #dcfce7; color: #15803d; }
          .badge-blue { background: #e0f2fe; color: #0369a1; }
          .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: bold; }
          .seal-box { margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .seal { width: 130px; height: 130px; border: 3px double #b91c1c; border-radius: 50%; color: #b91c1c; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-weight: 900; font-size: 10px; line-height: 1.3; transform: rotate(-5deg); margin-right: 20px; }
          .footer-note { font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">⚡ HUY TECHNOLOGY AI HUB</div>
            <div class="brand-sub">VIỆN CÔNG NGHỆ & CHUYỂN ĐỔI SỐ DOANH NGHIỆP - GIÁO DỤC - TÀI CHÍNH</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569;">
            <div><strong>HỒ SƠ NĂNG LỰC HỆ SINH THÁI 4.0</strong></div>
            <div>Mã lưu trữ: <strong>HSNL-2026-HUYTECH</strong></div>
          </div>
        </div>

        <div class="section-title">1. TẦM NHÌN & THẾ CHÂN VẠC THƯƠNG HIỆU (TRI-ECOSYSTEM AUTHORITY)</div>
        <p style="margin: 4px 0 10px 0; font-size: 12px; color: #334155;">
          Huy Technology AI kiến tạo hệ sinh thái liên hoàn 3 nền tảng dẫn đầu tại Việt Nam, kết nối thông suốt từ Quản trị điều hành, Kê khai thuế tài chính đến Giảng dạy sư phạm thông minh:
        </p>

        <div class="grid-3">
          <div class="card">
            <div class="badge badge-red">MASTER HUB TỔNG BỘ</div>
            <div class="card-title" style="margin-top: 4px; color: #b91c1c;">🏢 Huy Technology AI</div>
            <div class="card-desc">Cổng điều hành, R&D trí tuệ nhân tạo và chuyển đổi số doanh nghiệp toàn diện.</div>
            <div class="card-link">https://huycncdsai.io.vn</div>
          </div>

          <div class="card">
            <div class="badge badge-green">THUẾ & HÓA ĐƠN ĐIỆN TỬ</div>
            <div class="card-title" style="margin-top: 4px; color: #15803d;">📊 SmartTax AI</div>
            <div class="card-desc">Trợ lý Kê khai Thuế & Hóa đơn điện tử AI có mã xác thực Tổng cục Thuế (NĐ 123/2020).</div>
            <div class="card-link">https://smarttax-ai.vercel.app</div>
          </div>

          <div class="card">
            <div class="badge badge-blue">SƯ PHẠM & GIÁO DỤC AI</div>
            <div class="card-title" style="margin-top: 4px; color: #0369a1;">🎓 Smart Teacher Schedule AI</div>
            <div class="card-desc">Trợ lý soạn bài CV 5512, Đề thi TT 22, Sơ đồ tư duy, Slide PPTX và Cổng liên thông 4 cấp.</div>
            <div class="card-link">Nền tảng Giáo dục Thông minh</div>
          </div>
        </div>

        <div class="section-title">2. NĂNG LỰC PHÁP LÝ & BẢO BẢO CHUẨN MỰC QUỐC GIA</div>
        <table class="table">
          <thead>
            <tr>
              <th>Tiêu Chuẩn / Quy Định</th>
              <th>Cơ Quan Ban Hành</th>
              <th>Mức Độ Tuân Thủ & Ứng Dụng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Công văn 5512/BGDĐT & 2634</strong></td>
              <td>Bộ Giáo dục & Đào tạo</td>
              <td>Soạn Kế hoạch bài dạy chuẩn 4 bước, xuất file Word offline 100%</td>
            </tr>
            <tr>
              <td><strong>Thông tư 22/2021/TT-BGDĐT</strong></td>
              <td>Bộ Giáo dục & Đào tạo</td>
              <td>Ma trận đặc tả đề thi 4 mức độ & Sổ điểm, học bạ số liên thông</td>
            </tr>
            <tr>
              <td><strong>Nghị định 123/2020/NĐ-CP</strong></td>
              <td>Chính Phủ & Tổng Cục Thuế</td>
              <td>Xuất Hóa đơn điện tử VAT có mã xác thực qua hệ thống SmartTax AI</td>
            </tr>
            <tr>
              <td><strong>Bảo Mật Dữ Liệu & Thanh Toán</strong></td>
              <td>Ngân hàng TMCP Á Châu (ACB)</td>
              <td>Cổng VietQR Napas 24/7, xác thực Webhook 3 giây, biên lai SHA-256</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">3. CHÍNH SÁCH ĐỒNG HÀNH & TÀI TRỢ TRƯỜNG HỌC 2026</div>
        <ul style="padding-left: 18px; margin: 4px 0 14px 0; font-size: 11.5px;">
          <li><strong>Tài trợ 100% bản quyền SmartTax AI Pro (3.500.000 đ)</strong> cho Phòng Kế toán / Tài vụ khi trường ký kết hợp đồng Gói Nhà Trường.</li>
          <li><strong>Tặng voucher ưu đãi 30% (mã HUYTECH-EDU)</strong> cho toàn bộ giáo viên luyện thi, dạy thêm kê khai thuế TNCN hợp pháp.</li>
          <li><strong>Hỗ trợ thủ tục nghiệm thu Kho bạc Nhà nước</strong> và xuất hóa đơn giá trị gia tăng hợp lệ theo đúng niên độ ngân sách.</li>
        </ul>

        <div class="seal-box">
          <div style="font-size: 11px;">
            <div>Đơn vị chủ quản: <strong>CÔNG TY CÔNG NGHỆ HUY TECHNOLOGY AI</strong></div>
            <div>Đại diện pháp lý: <strong>NGÔ QUỐC HUY</strong></div>
            <div>Tài khoản giao dịch: <strong>ACB - 37780997 (Tân Mai)</strong></div>
            <div>Hotline / Zalo: <strong>0961.364.600</strong></div>
          </div>
          <div class="seal">
            XÁC THỰC<br/>HỒ SƠ NĂNG LỰC<br/>★ HUY TECHNOLOGY AI ★<br/>ECOSYSTEM
          </div>
        </div>

        <div class="footer-note">
          Hồ sơ năng lực được phát hành chính thức bởi Huy Technology AI Hub • Website: huycncdsai.io.vn • smarttax-ai.vercel.app
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden text-slate-200 my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-rose-500/20">
              ⚡
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Hồ Sơ Năng Lực & Hệ Sinh Thái Chuyển Đổi Số</span>
              </h3>
              <p className="text-xs text-slate-300">
                Huy Technology AI Hub • Khẳng định thế chân vạc uy tín & chất lượng toàn quốc
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              title="In hoặc tải bản PDF A4 Hồ Sơ Năng Lực"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In / Tải PDF A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Thế chân vạc 3 Website */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>1. Mô Hình Hệ Sinh Thái Hợp Nhất (Tri-Ecosystem Architecture)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Huy Technology Hub */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-rose-500/60 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🏢</span>
                    <span>Huy Tech AI Hub</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Tổng Bộ AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Cổng viện nghiên cứu R&D, chuyển giao công nghệ AI và điều hành pháp nhân toàn bộ hệ sinh thái.
                </p>
                <a
                  href="https://huycncdsai.io.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 font-mono font-bold"
                >
                  <span>huycncdsai.io.vn</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Card 2: SmartTax AI */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/60 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>📊</span>
                    <span>SmartTax AI</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Thuế & HĐĐT
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Trợ lý Kê khai Thuế & Hóa đơn điện tử AI có mã xác thực Tổng cục Thuế (Nghị định 123/2020).
                </p>
                <a
                  href="https://smarttax-ai.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-mono font-bold"
                >
                  <span>smarttax-ai.vercel.app</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Card 3: Smart Teacher Schedule AI */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/60 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>🎓</span>
                    <span>Smart Teacher AI</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Sư Phạm AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Trợ lý Sư phạm Soạn bài CV 5512, Đề thi TT 22, Slide PPTX, Sơ đồ tư duy & Quản trị 4 cổng trường học.
                </p>
                <span className="text-[10px] text-indigo-300 font-mono font-bold block">
                  Đang hoạt động (v2.2.0)
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Chứng thực quy chuẩn & Pháp lý */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Chuẩn Hóa Theo Quy Định Của Bộ Giáo Dục & Bộ Tài Chính</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Công văn 5512/BGDĐT & CV 2634</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Chuẩn hóa cấu trúc 4 bước kế hoạch bài dạy; xuất file Word (.doc) 100% offline an toàn.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Thông tư 22/2021/TT-BGDĐT</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Xây dựng ma trận đặc tả đề thi 4 mức độ phân hóa học lực & sổ điểm số hóa liên thông.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Nghị định 123/2020/NĐ-CP về Hóa Đơn</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Phát hành hóa đơn điện tử có mã của cơ quan Thuế qua SmartTax AI phục vụ thanh quyết toán Kho bạc.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tài Khoản Giao Dịch Đồng Nhất</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Bảo chứng dòng tiền minh bạch: <strong>ACB - 37780997 (NGO QUOC HUY)</strong> - Tân Mai.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Cam kết đồng hành dành cho Ban Giám Hiệu & Nhà Trường */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-800 via-indigo-950/40 to-slate-800 border border-indigo-500/30 text-xs space-y-2">
            <span className="font-bold text-amber-300 block">
              ★ Chính Sách Ưu Đãi Hệ Sinh Thái Dành Cho Trường Học Năm Học 2026:
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px] pl-4 list-disc">
              <li>Tài trợ trọn gói 01 năm sử dụng phần mềm SmartTax AI Pro (3.500.000 đ) cho bộ phận Kế toán nhà trường khi kích hoạt Gói Nhà Trường.</li>
              <li>Hỗ trợ chuyển đổi số toàn bộ hồ sơ giáo án điện tử cho 100% giáo viên theo Công văn 5512.</li>
              <li>Hỗ trợ hợp đồng kinh tế đầy đủ pháp nhân và chứng từ thanh toán Kho bạc theo từng học kỳ.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Phone className="w-3.5 h-3.5 text-rose-400" />
            <span>Hotline Báo giá & Báo chí: <strong className="text-white font-mono">0961.364.600</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Bản PDF A4</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
