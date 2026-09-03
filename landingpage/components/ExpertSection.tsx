import Image from "next/image";
import {
  Award,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  ExternalLink,
} from "lucide-react";

export default function ExpertSection() {
  return (
    <section id="expert" className="py-24 relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Expert Card & Badges */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl glass-panel border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 shadow-2xl relative space-y-6 text-center">
              {/* Profile Avatar / Tech AI Symbol */}
              <div className="relative mx-auto w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-indigo-500/40 shadow-xl shadow-indigo-500/30">
                <Image
                  src="/app_icon.jpg"
                  alt="Huy Technology AI"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Expert Name & Title */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Xác thực bởi Hệ sinh thái Giáo dục</span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  Huy Technology AI
                </h3>
                <p className="text-sm text-cyan-400 font-semibold mt-1">
                  Chuyên Gia Giải Pháp AI & Chuyển Đổi Số Giáo Dục
                </p>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href="tel:0961364600"
                  className="flex items-center justify-center space-x-3 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi / Zalo: 0961364600</span>
                </a>

                <a
                  href="mailto:huytechnologyai2025@gmail.com"
                  className="flex items-center justify-center space-x-3 w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 transition-all"
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>huytechnologyai2025@gmail.com</span>
                </a>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-around">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">100%</div>
                  <div className="text-[10px]">Tận tâm hỗ trợ</div>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-lg font-bold text-white">24/7</div>
                  <div className="text-[10px]">Đồng hành 1:1</div>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-lg font-bold text-white">Android 15</div>
                  <div className="text-[10px]">Chuẩn công nghệ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story, Philosophy & Commitment */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chuyên Gia Tạo App</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sứ Mệnh Phục Vụ Hàng Triệu Giờ Giảng{" "}
              <span className="text-gradient">Chính Xác & Thảnh Thơi</span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Xuất phát từ sự thấu hiểu sâu sắc những áp lực vô hình của người thầy: lịch giảng dạy
              phức tạp, luân chuyển giữa các phòng học và xưởng thực hành, việc chấm bài, chuẩn bị
              vật tư đến việc gia hạn giáo án...{" "}
              <strong className="text-white">Huy Technology AI</strong> đã phát triển ứng dụng
              chuyên biệt này để trở thành trợ thủ đắc lực nhất trên điện thoại của Thầy/Cô.
            </p>

            {/* Core Commitments */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-1 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    Chất lượng kỹ thuật chuẩn quốc tế
                  </h4>
                  <p className="text-sm text-slate-400">
                    Ứng dụng được lập trình bằng 100% mã nguồn Kotlin hiện đại, Jetpack Compose và
                    kiến trúc Clean Architecture, đảm bảo máy chạy mượt, tiết kiệm pin tối đa.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-1 shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    Hỗ trợ kỹ thuật trực tiếp qua Zalo 0961364600
                  </h4>
                  <p className="text-sm text-slate-400">
                    Bất kỳ khi nào Thầy/Cô gặp khó khăn trong việc cài đặt, cấu hình báo thức trên máy
                    hoặc muốn tích hợp riêng cho trường học, chuyên gia luôn sẵn sàng hỗ trợ trực tiếp.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mt-1 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">
                    Bảo mật tuyệt đối thông tin giáo án & dữ liệu cá nhân
                  </h4>
                  <p className="text-sm text-slate-400">
                    Dữ liệu thời khóa biểu được lưu mã hóa cục bộ trên máy và đồng bộ bảo mật lên
                    hệ thống đám mây Supabase tiêu chuẩn Châu Âu.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Consultation CTA */}
            <div className="pt-4">
              <a
                href="#support"
                className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm group"
              >
                <span>Thầy/Cô muốn nhận Prompt AI soạn bài giảng độc quyền?</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
