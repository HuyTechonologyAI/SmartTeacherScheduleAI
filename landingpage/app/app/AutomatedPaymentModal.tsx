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
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PRICING_PLANS,
  PAYMENT_BENEFICIARY,
  PlanPackage,
  generateTransferSyntax,
  generateVietQrImageUrl
} from '@/app/lib/paymentConfig';

interface AutomatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
  teacherName?: string;
  initialPlanId?: 'PRO1M' | 'PRO1Y' | 'SCHOOL1Y';
  onPaymentSuccess?: (tier: 'PRO' | 'SCHOOL', expiresAt: string) => void;
}

export const AutomatedPaymentModal: React.FC<AutomatedPaymentModalProps> = ({
  isOpen,
  onClose,
  syncCode,
  teacherName = 'Giáo viên',
  initialPlanId = 'PRO1Y',
  onPaymentSuccess
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'PRO1M' | 'PRO1Y' | 'SCHOOL1Y'>(initialPlanId);
  const [activeStep, setActiveStep] = useState<'plan' | 'qr' | 'success' | 'receipt'>('qr');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(true);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paidLicense, setPaidLicense] = useState<{ tier: 'PRO' | 'SCHOOL'; expiresAt: string; receiptId: string; receiptHash: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

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

  const selectedPlan = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[1];
  const syntax = generateTransferSyntax(syncCode, selectedPlan.id);
  const vietQrUrl = generateVietQrImageUrl(selectedPlan.price, syntax);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sao chép thông tin chuyển khoản
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Kiểm tra trạng thái thanh toán định kỳ mỗi 2.5 giây
  useEffect(() => {
    if (!isOpen || isPaid) return;

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

          // Bắn pháo hoa rực rỡ
          confetti({
            particleCount: 120,
            spread: 80,
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
  }, [isOpen, syncCode, isPaid, onPaymentSuccess]);

  // Giả lập thanh toán tức thì (Dev mode sandbox test)
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

  // Gửi thông tin xuất hóa đơn VAT
  const handleSubmitVat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vatForm.companyName || !vatForm.taxCode || !vatForm.email) {
      alert('Vui lòng điền đủ Tên cơ quan, Mã số thuế và Email');
      return;
    }

    setIsSubmittingVat(true);
    try {
      const res = await fetch('/api/payment/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncCode,
          amount: selectedPlan.price,
          ...vatForm
        })
      });
      const data = await res.json();
      if (data.success) {
        setVatSubmitted(true);
      }
    } catch (err) {
      console.error('Lỗi lưu hóa đơn VAT:', err);
    } finally {
      setIsSubmittingVat(false);
    }
  };

  // In / Tải biên lai thu phí PDF
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
          <div class="row"><span>Mã kiểm tra tính toàn vẹn (SHA-256 Hash):</span><span style="font-family: monospace; font-size: 11px;">${paidLicense?.receiptHash || 'ACB-SEPAY-DIGITAL-KEY'}</span></div>

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
            Biên lai điện tử có giá trị pháp lý tra cứu tại cổng thanh toán Smart Teacher Schedule.<br/>
            Hotline hỗ trợ & Xuất hóa đơn VAT: 0961.364.600
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-teal-400 text-white flex items-center justify-center shadow-md font-bold">
              <Crown className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <span>Cổng Thanh Toán VietQR Tự Động</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ACB Napas 24/7
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Xác thực chuyển khoản trong 3 giây • Tự động kích hoạt bản quyền không cần duyệt tay
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh Điều Hướng Các Bước */}
        <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveStep('plan')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeStep === 'plan' ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>1. Chọn Gói Cước</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('qr')}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              activeStep === 'qr' ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>2. Quét Mã VietQR</span>
          </button>
          {isPaid && (
            <button
              type="button"
              onClick={() => setActiveStep('receipt')}
              className={`flex-1 py-3 px-4 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeStep === 'receipt' || activeStep === 'success' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Biên Lai & Hóa Đơn VAT</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* BƯỚC 1: CHỌN GÓI CƯỚC */}
          {activeStep === 'plan' && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Chọn Gói Bản Quyền Nâng Cấp
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mã đồng bộ của Thầy/Cô: <strong className="font-mono text-rose-600 dark:text-rose-400">{syncCode}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {PRICING_PLANS.map((plan) => {
                  const isSel = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setActiveStep('qr');
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                        isSel
                          ? 'border-rose-600 bg-rose-50/40 dark:bg-rose-950/20 shadow-lg'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[10px] font-bold shadow whitespace-nowrap">
                          KHUYÊN DÙNG ⭐
                        </span>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{plan.name}</div>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                            {plan.price.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-[11px] text-slate-400">{plan.durationLabel}</span>
                        </div>
                        {plan.originalPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {plan.originalPrice.toLocaleString('vi-VN')} đ
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {plan.tagline}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSel
                            ? 'bg-rose-600 text-white shadow'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isSel ? 'Đang Chọn' : 'Chọn Gói Này'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BƯỚC 2: QUÉT MÃ VIETQR ĐỘNG */}
          {activeStep === 'qr' && !isPaid && (
            <div className="space-y-4">
              {/* Box Tóm tắt đơn hàng */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/60 via-amber-50/40 to-slate-50 dark:from-rose-950/20 dark:via-amber-950/10 dark:to-slate-900 border border-rose-200/80 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Đơn hàng kích hoạt:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedPlan.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Mã đồng bộ: <strong className="font-mono text-slate-700 dark:text-slate-200">{syncCode}</strong></p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                    {selectedPlan.price.toLocaleString('vi-VN')} đ
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveStep('plan')}
                    className="block text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    Đổi gói cước
                  </button>
                </div>
              </div>

              {/* Phần quét mã QR & Thông tin ngân hàng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Ảnh QR VietQR Napas 24/7 */}
                <div className="bg-white p-3.5 rounded-3xl border-2 border-slate-200 shadow-md flex flex-col items-center justify-center space-y-2 text-center">
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

                {/* Chi tiết tài khoản ACB thụ hưởng */}
                <div className="space-y-2.5 text-xs">
                  {/* Ngân hàng */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ngân hàng thụ hưởng:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{PAYMENT_BENEFICIARY.bankFullName}</strong>
                      <span className="text-[10px] text-slate-500 block">{PAYMENT_BENEFICIARY.branch}</span>
                    </div>
                    <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs">ACB</span>
                  </div>

                  {/* Số tài khoản */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tài khoản:</span>
                      <strong className="text-base font-mono font-black text-rose-600 dark:text-rose-400">{PAYMENT_BENEFICIARY.accountNumber}</strong>
                      <span className="text-[10px] text-slate-500 block">Chủ TK: {PAYMENT_BENEFICIARY.accountName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(PAYMENT_BENEFICIARY.accountNumber, 'acc')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* Số tiền */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Số tiền chính xác:</span>
                      <strong className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedPlan.price.toLocaleString('vi-VN')} VNĐ</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(String(selectedPlan.price), 'amount')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'amount' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  {/* Nội dung chuyển khoản duy nhất */}
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block">Nội dung chuyển khoản (Bắt buộc):</span>
                        <strong className="text-xs sm:text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 select-all">{syntax}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(syntax, 'syntax')}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow"
                      >
                        {copiedField === 'syntax' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'syntax' ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                      ⚠️ Giữ nguyên cú pháp này để cổng Webhook nhận dạng và kích hoạt bản quyền trong 3 giây.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sóng radar theo dõi giao dịch */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-teal-500/40 text-teal-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                  </span>
                  <span>Đang kết nối Webhook SePay/ACB Napas 24/7... (Tự động kiểm tra mỗi 2.5 giây)</span>
                </div>
                {/* Nút Dev Sandbox Simulator */}
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow whitespace-nowrap active:scale-95 disabled:opacity-50"
                  title="Nhấn để kích hoạt ngay mà không cần chuyển khoản thật (Dành cho thử nghiệm)"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                  <span>{isSimulating ? 'Đang kích hoạt...' : '⚡ Thử Nghiệm Kích Hoạt (3s)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 3: MÀN HÌNH CHÚC MỪNG KÍCH HOẠT THÀNH CÔNG */}
          {(activeStep === 'success' || isPaid) && (
            <div className="space-y-4 text-center py-2 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  GIAO DỊCH HOÀN TẤT THÀNH CÔNG
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  🎉 Chúc Mừng Thầy/Cô Đã Kích Hoạt Bản Quyền!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Tài khoản giáo viên đã được tự động nâng hạng lên <strong>{paidLicense?.tier === 'SCHOOL' ? 'Gói Nhà Trường (SCHOOL)' : 'Gói Giáo Viên Pro (VIP)'}</strong>.
                </p>
              </div>

              {/* Thông tin bản quyền vừa kích hoạt */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2 text-left">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Mã đồng bộ:</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">{syncCode}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Hạng mức bản quyền:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px]">
                    {paidLicense?.tier === 'SCHOOL' ? 'SCHOOL LICENSE' : 'PRO LICENSE'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Thời hạn sử dụng:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {paidLicense?.expiresAt ? new Date(paidLicense.expiresAt).toLocaleDateString('vi-VN') : '1 Năm'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Mã biên lai điện tử:</span>
                  <strong className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{paidLicense?.receiptId}</strong>
                </div>
              </div>

              {/* Các nút hành động */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>In / Tải Biên Lai Thu Phí (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('receipt')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
                >
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Xuất Hóa Đơn GTGT (VAT)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Hoàn Tất & Bắt Đầu Dùng</span>
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 4: XUẤT HÓA ĐƠN GTGT (VAT) & BIÊN LAI */}
          {activeStep === 'receipt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>Hóa Đơn GTGT (VAT) & Biên Lai Điện Tử</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Phục vụ công tác thanh quyết toán của các trường học và cơ sở giáo dục
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Biên Lai PDF</span>
                </button>
              </div>

              {/* Form kê khai hóa đơn VAT */}
              <form onSubmit={handleSubmitVat} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-500" />
                  <span>Thông tin xuất hóa đơn điện tử cho Trường / Đơn vị:</span>
                </div>

                {vatSubmitted ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Đã gửi yêu cầu xuất hóa đơn GTGT thành công!</span>
                    </div>
                    <p className="text-[11px]">
                      Phòng kế toán Huy Technology AI sẽ phát hành hóa đơn điện tử và gửi về email <strong>{vatForm.email}</strong> trong vòng 24 giờ làm việc.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Tên trường học / Công ty / Đơn vị thụ hưởng (*):
                      </label>
                      <input
                        type="text"
                        required
                        value={vatForm.companyName}
                        onChange={(e) => setVatForm({ ...vatForm, companyName: e.target.value })}
                        placeholder="VD: Trường THPT Chuyên Sư Phạm / Trường THCS Nguyễn Trãi..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-rose-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Mã số thuế (MST) (*):
                        </label>
                        <input
                          type="text"
                          required
                          value={vatForm.taxCode}
                          onChange={(e) => setVatForm({ ...vatForm, taxCode: e.target.value })}
                          placeholder="VD: 0101234567"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-rose-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Email nhận hóa đơn điện tử (*):
                        </label>
                        <input
                          type="email"
                          required
                          value={vatForm.email}
                          onChange={(e) => setVatForm({ ...vatForm, email: e.target.value })}
                          placeholder="VD: ketoan.truong@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-rose-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Địa chỉ cơ quan ghi trên hóa đơn:
                      </label>
                      <input
                        type="text"
                        value={vatForm.address}
                        onChange={(e) => setVatForm({ ...vatForm, address: e.target.value })}
                        placeholder="VD: Số 123 Đường Sư Phạm, Quận Cầu Giấy, TP. Hà Nội"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-rose-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Ghi chú bổ sung (nếu có):
                      </label>
                      <input
                        type="text"
                        value={vatForm.notes}
                        onChange={(e) => setVatForm({ ...vatForm, notes: e.target.value })}
                        placeholder="VD: Xuất gói cước dịch vụ phần mềm quản lý lịch dạy..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-rose-500 text-xs"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingVat}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingVat ? 'Đang gửi...' : 'Gửi Yêu Cầu Xuất Hóa Đơn VAT'}</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hỗ trợ kỹ thuật: <strong>0961.364.600</strong></span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Chủ TK: <strong>NGO QUOC HUY (ACB 37780997)</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
