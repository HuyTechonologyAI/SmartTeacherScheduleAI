"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan?: (planName: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const handleChoosePlan = (plan: string) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
    const targetElement = document.getElementById("support");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-slate-950/60">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đăng Ký Lên Các Gói Trả Phí</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Đầu Tư Cho Sự Thảnh Thơi &{" "}
            <span className="text-gradient">Chính Xác Mỗi Giờ Giảng</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Trải nghiệm miễn phí trọn đời các tính năng cốt lõi hoặc nâng cấp gói Pro để giải phóng
            100% tiềm năng trợ lý AI thông minh.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1 rounded-2xl glass-panel border border-white/10 flex items-center space-x-2">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Thanh Toán Hàng Tháng
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Thanh Toán Hàng Năm</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">
                  Tiết Kiệm 32%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Starter Free */}
          <div className="glass-panel rounded-3xl p-8 space-y-6 flex flex-col justify-between border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Gói Miễn Phí</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                  Cơ Bản
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hoàn hảo cho giáo viên muốn giải pháp báo thức kép chuẩn xác và widget tiện lợi.
              </p>
              <div className="pt-2">
                <div className="text-4xl font-extrabold text-white">0 đ</div>
                <div className="text-xs text-slate-400 mt-1">Miễn phí trọn đời • Không cần thẻ</div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Báo thức kép 60 phút & 15 phút</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tiện ích Widget Màn hình chính 2-trong-1</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tự động làm mới lịch lúc 00:00 hằng ngày</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chống tắt ngầm khi dọn RAM thiết bị</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chạy 100% offline không cần mạng</span>
                </div>
              </div>
            </div>

            <a
              href="#download"
              className="mt-8 block w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm text-center border border-white/10 hover:border-indigo-500/40 transition-all"
            >
              Tải Bản Miễn Phí (APK v1.2.5)
            </a>
          </div>

          {/* Plan 2: Pro VIP (Highlighted) */}
          <div className="glass-panel rounded-3xl p-8 space-y-6 flex flex-col justify-between border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-950/60 to-slate-900/80 shadow-2xl shadow-indigo-500/20 relative">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-xs font-extrabold shadow-md uppercase tracking-wider">
              Khuyên Dùng Cho Giảng Viên
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Giáo Viên Pro (VIP)</span>
                  <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Cá Nhân
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tích hợp toàn diện AI Gemini, sao lưu đồng bộ đám mây và nhắc việc qua Bot Telegram.
              </p>
              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {billingCycle === "yearly" ? "33.000 đ" : "49.000 đ"}
                  </span>
                  <span className="text-xs text-slate-400">/ tháng</span>
                </div>
                <div className="text-xs text-emerald-400 mt-1 font-semibold">
                  {billingCycle === "yearly"
                    ? "Thanh toán 399.000 đ / năm (Tiết kiệm 189k)"
                    : "Thanh toán theo từng tháng linh hoạt"}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3 text-sm text-slate-200">
                <div className="flex items-center gap-2.5 font-semibold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Bao gồm mọi tính năng của Gói Miễn Phí</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Không giới hạn AI Gemini trích xuất lịch từ Zalo/ảnh</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Đồng bộ dữ liệu thời gian thực trên Cloud Supabase</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tích hợp Bot Telegram tự động gửi tin nhắn báo ca</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI phát hiện xung đột và chồng chéo lịch trình</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tặng kèm 20+ Prompt soạn giáo án theo chuẩn đầu ra</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleChoosePlan("Gói Giáo Viên Pro (VIP Cá Nhân)")}
              className="mt-8 w-full py-4 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm text-center shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Đăng Ký Gói Pro Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plan 3: School & Enterprise */}
          <div className="glass-panel rounded-3xl p-8 space-y-6 flex flex-col justify-between border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Tổ Bộ Môn / Trường</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Tổ Chức
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Giải pháp toàn diện cho Khoa, Tổ chuyên môn và Trường học quản lý giờ dạy tập trung.
              </p>
              <div className="pt-2">
                <div className="text-4xl font-extrabold text-white">1.490.000 đ</div>
                <div className="text-xs text-slate-400 mt-1">
                  / năm (Cho tối đa 30 giáo viên trong tổ/khoa)
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-2.5 font-semibold text-purple-300">
                  <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Toàn bộ quyền lợi gói VIP cho 30 giáo viên</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Phân công thời khóa biểu tự động theo khoa/tổ</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dashboard theo dõi tình trạng dạy bù, dạy thay</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Xuất bảng tổng hợp thanh toán giờ giảng theo chuẩn</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hỗ trợ kỹ thuật đào tạo tận nơi 1:1 qua Zalo</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleChoosePlan("Gói Tổ Bộ Môn / Nhà Trường")}
              className="mt-8 w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white font-bold text-sm text-center border border-purple-500/30 hover:border-purple-500 transition-all flex items-center justify-center gap-2"
            >
              <span>Nhận Tư Vấn Gói Trường Học</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
