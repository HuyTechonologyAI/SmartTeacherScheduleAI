import Image from "next/image";
import { Download, Phone, Mail, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/60 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Slogan */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-indigo-500/40">
                <Image
                  src="/app_icon.jpg"
                  alt="Smart Teacher Schedule AI"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-xl text-white">
                Smart Teacher Schedule AI
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Giải pháp quản lý thời khóa biểu thông minh, báo thức kép 60m & 15m, chống tắt ngầm
              khi dọn RAM và trợ lý AI Gemini đồng hành cùng Thầy/Cô.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>
                Được phát triển và bảo trợ bởi:{" "}
                <strong className="text-white">Huy Technology AI</strong>
              </p>
              <p>
                Hotline / Zalo hỗ trợ:{" "}
                <a href="tel:0961364600" className="text-emerald-400 font-bold hover:underline">
                  0961364600
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:huytechnologyai2025@gmail.com"
                  className="text-indigo-400 hover:underline"
                >
                  huytechnologyai2025@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Liên Kết Nhanh
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#download" className="hover:text-white transition-colors">
                  Tải Bản Cài Đặt APK v1.3.1
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Tính Năng Nổi Bật
                </a>
              </li>
              <li>
                <a href="#expert" className="hover:text-white transition-colors">
                  Chuyên Gia Huy Technology AI
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Đăng Ký Gói Pro VIP
                </a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">
                  Nhận Hỗ Trợ Kỹ Thuật 1:1
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Releases */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Kho Lưu Trữ & Bản Quyền
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>Mã Nguồn GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/HuyTechonologyAI/SmartTeacherScheduleAI/releases/tag/v1.3.1"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Phiên Bản v1.3.1 (Release)
                </a>
              </li>
              <li>
                <span className="text-emerald-400 font-semibold">
                  ✓ Chuẩn Android 15 Ready
                </span>
              </li>
              <li>
                <span className="text-cyan-400 font-semibold">
                  ✓ Cơ sở dữ liệu Cloud Supabase
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Made in Huy Technology AI. Toàn bộ bản quyền được bảo hộ.</p>
          <p className="flex items-center gap-1">
            Thiết kế bằng cả tâm huyết dành tặng Thầy/Cô Việt Nam
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
