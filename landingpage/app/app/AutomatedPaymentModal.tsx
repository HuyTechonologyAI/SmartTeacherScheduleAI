'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Crown,
  Check,
  CheckCheck,
  CreditCard,
  Copy,
  Sparkles,
  QrCode,
  ShieldCheck,
  Clock,
  Printer,
  FileText,
  Building,
  Mail,
  Send,
  RotateCcw,
  Zap,
  Phone,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  GraduationCap,
  HeartHandshake,
  Calculator,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PRICING_PLANS,
  PAYMENT_BENEFICIARY,
  PlanPackage,
  PlanId,
  generateTransferSyntax,
  generateVietQrImageUrl
} from '@/app/lib/paymentConfig';

interface AutomatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
  teacherName?: string;
  initialPlanId?: string;
  onPaymentSuccess?: (tier: 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO', expiresAt: string) => void;
}

export const AutomatedPaymentModal: React.FC<AutomatedPaymentModalProps> = ({
  isOpen,
  onClose,
  syncCode,
  teacherName = 'Giáo viên',
  initialPlanId = 'VIP1_1Y',
  onPaymentSuccess
}) => {
  // Tab phân loại: 'teacher' (Gói Giáo Viên) | 'school' (Gói Nhà Trường)
  const [categoryTab, setCategoryTab] = useState<'teacher' | 'school'>(
    initialPlanId?.includes('SCHOOL') ? 'school' : 'teacher'
  );

  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(
    (initialPlanId as PlanId) || 'VIP1_1Y'
  );

  const [activeStep, setActiveStep] = useState<'plan' | 'qr' | 'success' | 'receipt'>('plan');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paidLicense, setPaidLicense] = useState<{
    tier: 'VIP1' | 'VIP2' | 'SCHOOL' | 'PRO';
    expiresAt: string;
    receiptId: string;
    receiptHash: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Form Báo giá VIP 2 (Lớp học)
  const [vip2QuoteForm, setVip2QuoteForm] = useState({
    className: '',
    studentCount: 40,
    parentCount: 40,
    contactName: teacherName,
    phone: '',
    email: '',
    notes: ''
  });
  const [vip2QuoteSubmitted, setVip2QuoteSubmitted] = useState<boolean>(false);
  const [isSubmittingVip2, setIsSubmittingVip2] = useState<boolean>(false);

  // Form Báo giá Gói Nhà Trường (Enterprise)
  const [schoolScale, setSchoolScale] = useState({
    teacherCount: 45,
    studentCount: 1200,
    parentCount: 1200,
    schoolName: '',
    province: '',
    contactName: teacherName,
    position: 'Ban Giám Hiệu',
    phone: '',
    email: '',
    notes: ''
  });
  const [schoolQuoteSubmitted, setSchoolQuoteSubmitted] = useState<boolean>(false);
  const [isSubmittingSchool, setIsSubmittingSchool] = useState<boolean>(false);

  // Form Hóa đơn GTGT (VAT)
  const [vatForm, setVatForm] = useState({
    companyName: '',
    taxCode: '',
    address: '',
    email: '',
    notes: ''
  });
  const [vatSubmitted, setVatSubmitted] = useState<boolean>(false);
  const [isSubmittingVat, setIsSubmittingVat] = useState<boolean>(false);

  const selectedPlan =
    PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[1];
  const syntax = generateTransferSyntax(syncCode, selectedPlan.id);
  const effectivePrice = selectedPlan.price > 0 ? selectedPlan.price : 399000;
  const vietQrUrl = generateVietQrImageUrl(effectivePrice, syntax);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sao chép thông tin chuyển khoản
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Kiểm tra trạng thái thanh toán định kỳ mỗi 2.5 giây khi đang ở bước QR
  useEffect(() => {
    if (!isOpen || isPaid || activeStep !== 'qr') return;

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payment/check-status?syncCode=${encodeURIComponent(syncCode)}`);
        const data = await res.json();

        if (data.isPaid && data.tier) {
          setIsPaid(true);
          setPaidLicense({
            tier: data.tier,
            expiresAt: data.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            receiptId: data.receiptId || `BL-${Date.now()}`,
            receiptHash: data.receiptHash || 'ACB-VIETQR-VERIFIED'
          });
          setActiveStep('success');

          confetti({
            particleCount: 130,
            spread: 85,
            origin: { y: 0.6 }
          });

          if (onPaymentSuccess) {
            onPaymentSuccess(data.tier, data.expiresAt);
          }
        }
      } catch (err) {
        console.warn('Check payment status error:', err);
      }
    };

    pollTimerRef.current = setInterval(checkPaymentStatus, 2500);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, syncCode, isPaid, activeStep, onPaymentSuccess]);

  // Giả lập thanh toán tức thì (Sandbox test)
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncCode, planId: selectedPlan.id })
      });
      const data = await res.json();
      if (data.success) {
        setIsPaid(true);
        setPaidLicense({
          tier: data.tier,
          expiresAt: data.expiresAt,
          receiptId: data.receiptId,
          receiptHash: data.receiptHash
        });
        setActiveStep('success');

        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });

        if (onPaymentSuccess) {
          onPaymentSuccess(data.tier, data.expiresAt);
        }
      }
    } catch (err) {
      console.error('Lỗi giả lập:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Gửi form báo giá VIP 2 (Lớp học)
  const handleSubmitVip2Quote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVip2(true);
    try {
      const res = await fetch('/api/payment/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VIP2_CLASS',
          syncCode,
          contactName: vip2QuoteForm.contactName,
          phone: vip2QuoteForm.phone,
          email: vip2QuoteForm.email,
          organizationName: vip2QuoteForm.className,
          studentCount: vip2QuoteForm.studentCount,
          parentCount: vip2QuoteForm.parentCount,
          notes: vip2QuoteForm.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        setVip2QuoteSubmitted(true);
      }
    } catch (err) {
      console.error('Lỗi gửi báo giá VIP 2:', err);
    } finally {
      setIsSubmittingVip2(false);
    }
  };

  // Gửi form báo giá Gói Nhà Trường
  const handleSubmitSchoolQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSchool(true);
    try {
      const res = await fetch('/api/payment/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SCHOOL_SCALE',
          syncCode,
          contactName: schoolScale.contactName,
          phone: schoolScale.phone,
          email: schoolScale.email,
          organizationName: schoolScale.schoolName,
          teacherCount: schoolScale.teacherCount,
          studentCount: schoolScale.studentCount,
          parentCount: schoolScale.parentCount,
          notes: `Chức vụ: ${schoolScale.position}. Tỉnh/TP: ${schoolScale.province}. Ghi chú: ${schoolScale.notes}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setSchoolQuoteSubmitted(true);
      }
    } catch (err) {
      console.error('Lỗi gửi báo giá Nhà Trường:', err);
    } finally {
      setIsSubmittingSchool(false);
    }
  };

  // Gửi thông tin xuất Hóa đơn VAT
  const handleSubmitVat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVat(true);
    try {
      const res = await fetch('/api/payment/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode,
          companyName: vatForm.companyName,
          taxCode: vatForm.taxCode,
          address: vatForm.address,
          email: vatForm.email,
          notes: vatForm.notes,
          amount: selectedPlan.price
        })
      });
      const data = await res.json();
      if (data.success) {
        setVatSubmitted(true);
      }
    } catch (err) {
      console.error('Lỗi gửi VAT:', err);
    } finally {
      setIsSubmittingVat(false);
    }
  };

  // In / Tải PDF Biên lai thu tiền điện tử
  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Biên lai thu tiền điện tử - Huy Technology AI</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; color: #1e293b; }
          .receipt-box { max-width: 650px; margin: auto; border: 2px solid #0284c7; border-radius: 16px; padding: 30px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
          .logo { font-size: 20px; font-weight: bold; color: #0284c7; }
          .title { text-align: center; margin: 25px 0 15px; font-size: 22px; font-weight: bold; color: #0f172a; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
          .total { font-size: 18px; font-weight: bold; color: #e11d48; margin-top: 15px; border-top: 2px solid #0f172a; padding-top: 10px; }
          .seal-box { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .seal { border: 2px dashed #e11d48; border-radius: 50%; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; text-align: center; color: #e11d48; font-size: 11px; font-weight: bold; transform: rotate(-10deg); }
          .footer-note { margin-top: 25px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div>
              <div class="logo">⚡ HUY TECHNOLOGY AI</div>
              <div style="font-size: 12px; color: #64748b;">Nền tảng Giáo dục Thông minh Smart Teacher Schedule</div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <div><strong>Mã biên lai:</strong> ${paidLicense?.receiptId || 'BL-' + Date.now()}</div>
              <div><strong>Ngày:</strong> ${new Date().toLocaleDateString('vi-VN')}</div>
            </div>
          </div>

          <div class="title">BIÊN LAI THU PHÍ ĐIỆN TỬ</div>

          <div class="row"><span>Họ và tên khách hàng:</span><strong>${teacherName}</strong></div>
          <div class="row"><span>Mã đồng bộ giáo viên:</span><strong style="font-family: monospace;">${syncCode}</strong></div>
          <div class="row"><span>Gói dịch vụ bản quyền:</span><strong>${selectedPlan.name}</strong></div>
          <div class="row"><span>Thời hạn hiệu lực:</span><strong>${selectedPlan.durationDays} Ngày (đến ${paidLicense?.expiresAt ? new Date(paidLicense.expiresAt).toLocaleDateString('vi-VN') : '1 năm'})</strong></div>
          <div class="row"><span>Tài khoản thụ hưởng:</span><strong>ACB - 37780997 (NGO QUOC HUY)</strong></div>
          <div class="row"><span>Cổng thanh toán:</span><strong>VietQR Napas 24/7 / ACB</strong></div>
          <div class="row"><span>Mã tra cứu tính toàn vẹn (SHA-256 Hash):</span><span style="font-family: monospace; font-size: 11px;">${paidLicense?.receiptHash || 'ACB-SEPAY-DIGITAL-KEY'}</span></div>

          <div class="row total">
            <span>TỔNG TIỀN ĐÃ THANH TOÁN:</span>
            <span>${selectedPlan.price.toLocaleString('vi-VN')} VNĐ</span>
          </div>

          <div class="seal-box">
            <div style="font-size: 12px;">
              <div>Trạng thái: <strong style="color: #059669;">ĐÃ THANH TOÁN THÀNH CÔNG</strong></div>
              <div>Ký duyệt điện tử: <strong>Huy Technology AI System</strong></div>
            </div>
            <div class="seal">
              ĐÃ XÁC THỰC<br/>BẢN QUYỀN SỐ<br/>★ HUY TECH AI ★
            </div>
          </div>

          <div class="footer-note">
            Biên lai điện tử có giá trị tra cứu tại cổng thanh toán Smart Teacher Schedule.<br/>
            Hotline hỗ trợ & Hóa đơn VAT: 0961.364.600
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  // Lọc danh sách gói
  const vip1Plans = PRICING_PLANS.filter(p => p.category === 'TEACHER_VIP1');
  const vip2Plan = PRICING_PLANS.find(p => p.category === 'TEACHER_VIP2');
  const schoolPlan = PRICING_PLANS.find(p => p.category === 'SCHOOL');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-teal-400 text-white flex items-center justify-center shadow-lg font-bold">
              <Crown className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <span>Cổng Bản Quyền & Thanh Toán Tự Động</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ACB 37780997
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chủ TK: <strong>NGO QUOC HUY</strong> • Ngân hàng ACB (Chi nhánh Tân Mai) • Kích hoạt tự động
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

        {/* Thanh chuyển đổi Danh Mục Chính: GÓI GIÁO VIÊN vs GÓI NHÀ TRƯỜNG */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 gap-2 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setCategoryTab('teacher');
              setActiveStep('plan');
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              categoryTab === 'teacher'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>1. Gói Cho Giáo Viên (VIP 1 & VIP 2)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryTab('school');
              setActiveStep('plan');
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              categoryTab === 'school'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>2. Gói Nhà Trường (Theo Quy Mô User)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================================= */}
          {/* TAB 1: GÓI CHO GIÁO VIÊN (CHIA LÀM 2: VIP 1 & VIP 2) */}
          {/* ========================================================================= */}
          {categoryTab === 'teacher' && activeStep === 'plan' && (
            <div className="space-y-6">
              {/* Header Tab Giáo viên */}
              <div className="text-center max-w-xl mx-auto space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dành Riêng Cho Giáo Viên Sư Phạm 4.0</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Lựa Chọn Gói Phù Hợp Với Nhu Cầu Của Thầy/Cô
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mã giáo viên của Thầy/Cô: <strong className="font-mono text-rose-600 dark:text-rose-400">{syncCode}</strong>
                </p>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* PHẦN 1: GÓI VIP 1 - DÀNH CHO CÁ NHÂN GIÁO VIÊN */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 dark:from-slate-800/80 dark:via-slate-850 dark:to-slate-900 rounded-3xl p-4 sm:p-5 border-2 border-rose-200 dark:border-rose-900/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow">
                      VIP 1
                    </div>
                    <div>
                      <h5 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Gói VIP 1 (Dành Cho Cá Nhân Giáo Viên)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 font-bold">
                          Quét VietQR Tự Động
                        </span>
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Chuyên sâu cho cá nhân: Trợ lý AI soạn bài 5512, ma trận đề thi TT 22, sơ đồ tư duy & sổ điểm
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2 Lựa chọn thời hạn của VIP 1: 1 Tháng & 1 Năm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {vip1Plans.map((plan) => {
                    const isSel = selectedPlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                          isSel
                            ? 'border-rose-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-rose-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300'
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[10px] font-bold shadow">
                            TIẾT KIỆM 35% ⭐
                          </span>
                        )}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{plan.shortName}</span>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                              Kích hoạt 3s
                            </span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                              {plan.price.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="text-xs text-slate-400">{plan.durationLabel}</span>
                          </div>
                          {plan.originalPrice && (
                            <div className="text-[11px] text-slate-400 line-through">
                              {plan.originalPrice.toLocaleString('vi-VN')} đ
                            </div>
                          )}
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                            {plan.tagline}
                          </p>
                        </div>

                        <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                          {plan.features.slice(0, 4).map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanId(plan.id);
                            setActiveStep('qr');
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSel
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Quét VietQR Kích Hoạt Ngay</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* PHẦN 2: GÓI VIP 2 - DÀNH CHO LỚP HỌC (HỌC SINH & PHỤ HUYNH) */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-slate-850 dark:via-slate-900 dark:to-indigo-950/40 rounded-3xl p-4 sm:p-5 border-2 border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow">
                      VIP 2
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-base text-slate-900 dark:text-white">
                          Gói VIP 2 (Dành Cho Lớp Học)
                        </h5>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-bold">
                          Giáo Viên + Học Sinh + Phụ Huynh
                        </span>
                      </div>
                      <p className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold mt-0.5">
                        📢 {vip2Plan?.pricingNote || 'Sẽ có báo giá chi tiết sau theo sĩ số học sinh & phụ huynh'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <h6 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>Quyền Lợi Vượt Trội Của Gói VIP 2:</span>
                    </h6>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span><strong>Bao gồm toàn bộ quyền lợi VIP 1</strong> dành riêng cho Giáo viên chủ nhiệm & bộ môn.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span><strong>Tài khoản Học sinh:</strong> Làm bài tập, mini game, nộp bài tập về nhà, xem TKB và bảng điểm trực tuyến.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span><strong>Tài khoản Phụ huynh:</strong> Sổ liên lạc số, nộp đơn xin nghỉ học online, theo dõi sát sao điểm số và chuyên cần của con.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span><strong>Kênh bảng tin lớp học:</strong> Trao đổi thông báo đa chiều tức thì không lo trôi tin.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Form nhận báo giá chi tiết VIP 2 theo sĩ số */}
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-100 dark:border-slate-800 space-y-3">
                    <h6 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                      <Calculator className="w-4 h-4 text-indigo-600" />
                      <span>Nhận Báo Giá Chi Tiết Theo Lớp Học:</span>
                    </h6>

                    {vip2QuoteSubmitted ? (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h6 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                          Đã Gửi Yêu Cầu Báo Giá Thành Công!
                        </h6>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          Chuyên viên Huy Technology AI sẽ liên hệ gửi bảng báo giá chi tiết theo sĩ số lớp qua Số điện thoại/Zalo trong 15 phút.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitVip2Quote} className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                              Tên Trường / Lớp:
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="VD: Lớp 10A1 - Chu Văn An"
                              value={vip2QuoteForm.className}
                              onChange={(e) => setVip2QuoteForm({ ...vip2QuoteForm, className: e.target.value })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                              Sĩ số Học sinh:
                            </label>
                            <input
                              type="number"
                              min="10"
                              max="100"
                              value={vip2QuoteForm.studentCount}
                              onChange={(e) => setVip2QuoteForm({ ...vip2QuoteForm, studentCount: Number(e.target.value), parentCount: Number(e.target.value) })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                              Họ tên Thầy/Cô:
                            </label>
                            <input
                              type="text"
                              required
                              value={vip2QuoteForm.contactName}
                              onChange={(e) => setVip2QuoteForm({ ...vip2QuoteForm, contactName: e.target.value })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                              Số điện thoại / Zalo:
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="09xx xxx xxx"
                              value={vip2QuoteForm.phone}
                              onChange={(e) => setVip2QuoteForm({ ...vip2QuoteForm, phone: e.target.value })}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingVip2}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingVip2 ? 'Đang gửi...' : 'Nhận Báo Giá Chi Tiết Gói VIP 2'}</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GÓI NHÀ TRƯỜNG (PHỤ THUỘC SỐ LƯỢNG GIÁO VIÊN, HỌC SINH, PHỤ HUYNH) */}
          {/* ========================================================================= */}
          {categoryTab === 'school' && activeStep === 'plan' && (
            <div className="space-y-5">
              {/* Banner Gói Nhà Trường */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/40">
                  <Building className="w-3.5 h-3.5" />
                  <span>Cấp Cơ Sở Giáo Dục & Toàn Trường (Enterprise)</span>
                </div>

                <h4 className="text-xl sm:text-2xl font-black">
                  Gói Nhà Trường & Toàn Trường Liên Thông 4 Cổng
                </h4>

                <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs leading-relaxed font-semibold">
                  📌 <strong>Quy định báo giá:</strong> Gói nhà trường sẽ phụ thuộc vào số lượng user người dùng bao gồm số lượng <strong>Giáo viên</strong>, <strong>Học sinh</strong>, <strong>Phụ huynh</strong>. Hệ thống sẽ có bảng báo giá chi tiết theo quy mô thực tế của từng đơn vị!
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center text-xs">
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                    <Crown className="w-5 h-5 mx-auto text-amber-300 mb-1" />
                    <span className="font-bold block">100% Giáo Viên</span>
                    <span className="text-[10px] text-slate-300">Kích hoạt Pro trọn đời</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                    <Building className="w-5 h-5 mx-auto text-teal-300 mb-1" />
                    <span className="font-bold block">Cổng /school</span>
                    <span className="text-[10px] text-slate-300">Duyệt giáo án & TKB</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                    <Users className="w-5 h-5 mx-auto text-indigo-300 mb-1" />
                    <span className="font-bold block">Toàn Bộ HS & PH</span>
                    <span className="text-[10px] text-slate-300">Sổ liên lạc đa chiều</span>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
                    <FileText className="w-5 h-5 mx-auto text-rose-300 mb-1" />
                    <span className="font-bold block">Hóa Đơn GTGT</span>
                    <span className="text-[10px] text-slate-300">Quyết toán Kho bạc</span>
                  </div>
                </div>
              </div>

              {/* BỘ TÍNH TOÁN QUY MÔ USER & FORM BÁO GIÁ NHÀ TRƯỜNG */}
              <div className="bg-slate-50 dark:bg-slate-850 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-teal-600" />
                    <span>Ước Tính Quy Mô User Trường Học Của Bạn</span>
                  </h5>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                    Tổng User: {(schoolScale.teacherCount + schoolScale.studentCount + schoolScale.parentCount).toLocaleString('vi-VN')} người dùng
                  </span>
                </div>

                {/* 3 Thanh trượt điều chỉnh số lượng GV, HS, PH */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-rose-600" />
                        <span>Số Giáo viên:</span>
                      </span>
                      <span className="font-mono font-black text-rose-600 text-sm">{schoolScale.teacherCount} GV</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="5"
                      value={schoolScale.teacherCount}
                      onChange={(e) => setSchoolScale({ ...schoolScale, teacherCount: Number(e.target.value) })}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span>Số Học sinh:</span>
                      </span>
                      <span className="font-mono font-black text-indigo-600 text-sm">{schoolScale.studentCount} HS</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="4000"
                      step="50"
                      value={schoolScale.studentCount}
                      onChange={(e) => setSchoolScale({ ...schoolScale, studentCount: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4 text-teal-600" />
                        <span>Số Phụ huynh:</span>
                      </span>
                      <span className="font-mono font-black text-teal-600 text-sm">{schoolScale.parentCount} PH</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="4000"
                      step="50"
                      value={schoolScale.parentCount}
                      onChange={(e) => setSchoolScale({ ...schoolScale, parentCount: Number(e.target.value) })}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Form Đăng ký nhận bảng báo giá nhà trường */}
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h6 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span>Đăng Ký Nhận Dự Toán & Báo Giá Chi Tiết Theo Quy Mô Trường Học:</span>
                  </h6>

                  {schoolQuoteSubmitted ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h6 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                        Đã Tiếp Nhận Yêu Cầu Báo Giá Thành Công!
                      </h6>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                        Đội ngũ chuyên viên tư vấn chuyển đổi số của <strong>Huy Technology AI</strong> sẽ liên hệ Thầy/Cô để gửi bảng dự toán kinh phí, hợp đồng kinh tế mẫu và hồ sơ thẩm định qua Email & Zalo.
                      </p>
                      <div className="pt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                        Hotline Ban Giám Hiệu: <strong className="text-rose-600">0961.364.600</strong>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitSchoolQuote} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Tên Trường Học / Cơ Sở:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Trường THPT Chu Văn An"
                            value={schoolScale.schoolName}
                            onChange={(e) => setSchoolScale({ ...schoolScale, schoolName: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Tỉnh / Thành phố:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Hà Nội / TP. Hồ Chí Minh"
                            value={schoolScale.province}
                            onChange={(e) => setSchoolScale({ ...schoolScale, province: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Người đại diện:
                          </label>
                          <input
                            type="text"
                            required
                            value={schoolScale.contactName}
                            onChange={(e) => setSchoolScale({ ...schoolScale, contactName: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Số điện thoại / Zalo:
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="09xx xxx xxx"
                            value={schoolScale.phone}
                            onChange={(e) => setSchoolScale({ ...schoolScale, phone: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                            Email nhận báo giá:
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="hieutruong@truong.edu.vn"
                            value={schoolScale.email}
                            onChange={(e) => setSchoolScale({ ...schoolScale, email: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Ghi chú thêm (Yêu cầu hợp đồng, hóa đơn VAT, thanh toán Kho bạc):
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ví dụ: Trường cần xuất hóa đơn VAT và nghiệm thu theo học kỳ..."
                          value={schoolScale.notes}
                          onChange={(e) => setSchoolScale({ ...schoolScale, notes: e.target.value })}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingSchool}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-indigo-700 hover:from-teal-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmittingSchool ? 'Đang gửi...' : 'Gửi Yêu Cầu Nhận Báo Giá Chi Tiết Theo Quy Mô Trường'}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BƯỚC 2: QUÉT MÃ VIETQR ĐỘNG (CHO GÓI VIP 1 HOẶC KÍCH HOẠT TRỰC TIẾP) */}
          {/* ========================================================================= */}
          {activeStep === 'qr' && !isPaid && (
            <div className="space-y-4">
              {/* Box Tóm tắt đơn hàng */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-slate-50 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Đơn hàng kích hoạt:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedPlan.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Mã giáo viên: <strong className="font-mono text-slate-700 dark:text-slate-200">{syncCode}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                    {effectivePrice.toLocaleString('vi-VN')} đ
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveStep('plan')}
                    className="block text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    ← Chọn gói khác
                  </button>
                </div>
              </div>

              {/* Phần quét mã QR & Thông tin ngân hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Ảnh QR VietQR Napas 24/7 */}
                <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-md flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="w-52 h-52 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vietQrUrl}
                      alt="VietQR Napas 24/7"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Napas 24/7 • Chuyển liên ngân hàng 0đ</span>
                  </div>
                </div>

                {/* Bảng Chi tiết Chuyển khoản */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ngân hàng thụ hưởng:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{PAYMENT_BENEFICIARY.bankFullName}</strong>
                      <span className="text-[10px] text-slate-400 block">({PAYMENT_BENEFICIARY.branch})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_BENEFICIARY.bankName, 'bank')}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {copiedField === 'bank' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tài khoản:</span>
                      <strong className="text-base text-rose-600 dark:text-rose-400 font-black font-mono">
                        {PAYMENT_BENEFICIARY.accountNumber}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_BENEFICIARY.accountNumber, 'acc')}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    >
                      {copiedField === 'acc' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Chủ tài khoản:</span>
                      <strong className="text-slate-900 dark:text-white uppercase font-bold">
                        {PAYMENT_BENEFICIARY.accountName}
                      </strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">Nội dung chuyển khoản (bắt buộc chính xác):</span>
                      <strong className="text-sm font-mono text-slate-900 dark:text-amber-200 font-black">
                        {syntax}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(syntax, 'syntax')}
                      className="p-1.5 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded-lg cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    >
                      {copiedField === 'syntax' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedField === 'syntax' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Radar đang quét tiền về */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full absolute"></div>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-300">Hệ thống đang chờ thanh toán...</span>
                    <p className="text-[11px] text-slate-400">
                      Tự động kích hoạt bản quyền trong 3 giây sau khi Thầy/Cô chuyển khoản thành công.
                    </p>
                  </div>
                </div>

                {/* Nút thử nghiệm Sandbox */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSimulating ? 'Đang kích hoạt...' : '⚡ Thử nghiệm (Sandbox)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BƯỚC 3: MÀN HÌNH CHÚC MỪNG KÍCH HOẠT THÀNH CÔNG */}
          {/* ========================================================================= */}
          {activeStep === 'success' && (
            <div className="text-center py-6 space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  🎉 Chúc Mừng Thầy/Cô Đã Kích Hoạt Thành Công!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Hệ thống đã tự động nâng cấp hạn mức <strong className="text-rose-600 dark:text-rose-400 font-black">{paidLicense?.tier}</strong> cho mã đồng bộ <strong className="font-mono">{syncCode}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã biên lai:</span>
                  <strong className="font-mono">{paidLicense?.receiptId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời hạn hiệu lực:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {paidLicense?.expiresAt ? new Date(paidLicense.expiresAt).toLocaleDateString('vi-VN') : '1 Năm'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã tra cứu bảo mật:</span>
                  <span className="font-mono text-[10px] text-slate-600 truncate max-w-[160px]">{paidLicense?.receiptHash}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In / Tải Biên Lai PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('receipt')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xuất Hóa Đơn VAT</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* BƯỚC 4: FORM ĐĂNG KÝ HÓA ĐƠN GTGT (VAT) */}
          {/* ========================================================================= */}
          {activeStep === 'receipt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>Đăng Ký Xuất Hóa Đơn Điện Tử (VAT)</span>
                  </h5>
                  <p className="text-xs text-slate-500">Phục vụ công tác thanh quyết toán kinh phí cơ quan / trường học</p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Biên Lai</span>
                </button>
              </div>

              {vatSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h6 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    Đã Gửi Yêu Cầu Xuất Hóa Đơn VAT Thành Công!
                  </h6>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Hóa đơn điện tử hợp lệ theo quy định Tổng cục Thuế sẽ được gửi trực tiếp đến hòm thư <strong>{vatForm.email}</strong> trong vòng 24h làm việc.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitVat} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Tên Đơn vị / Trường học:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Trường THPT Chu Văn An"
                      value={vatForm.companyName}
                      onChange={(e) => setVatForm({ ...vatForm, companyName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Mã số thuế (MST):
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: 0101234567"
                        value={vatForm.taxCode}
                        onChange={(e) => setVatForm({ ...vatForm, taxCode: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Email nhận hóa đơn (Kế toán):
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ketoan@chuvanan.edu.vn"
                        value={vatForm.email}
                        onChange={(e) => setVatForm({ ...vatForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Địa chỉ đơn vị:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Số 10 Thụy Khuê, Tây Hồ, Hà Nội"
                      value={vatForm.address}
                      onChange={(e) => setVatForm({ ...vatForm, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingVat}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingVat ? 'Đang gửi...' : 'Gửi Thông Tin Xuất Hóa Đơn'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rose-600" />
            <span>Hotline / Zalo hỗ trợ: <strong>0961.364.600</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
