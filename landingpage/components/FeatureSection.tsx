import {
  BellRing,
  LayoutGrid,
  RefreshCw,
  Cpu,
  BrainCircuit,
  CloudCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      icon: BellRing,
      color: "from-amber-500 to-orange-600",
      badge: "Đặc quyền Giáo viên",
      title: "Hệ Thống Báo Thức Kép 60m & 15m",
      description:
        "Tự động đặt 2 mốc chuông báo động: Nhắc trước 60 phút để Thầy/Cô chuẩn bị giáo án, phôi vật tư và nhắc trước 15 phút để di chuyển đến giảng đường, xưởng thực hành.",
    },
    {
      icon: LayoutGrid,
      color: "from-cyan-500 to-blue-600",
      badge: "Mới trong v1.2.5",
      title: "Tiện Ích Widget Màn Hình Chính 2-Trong-1",
      description:
        "Chỉ cần bật sáng màn hình điện thoại là Thầy/Cô thấy ngay tên môn học, phòng học, lớp dạy và các đầu việc cần giải quyết mà không cần bấm mở ứng dụng.",
    },
    {
      icon: RefreshCw,
      color: "from-emerald-500 to-teal-600",
      badge: "Độc quyền 00:00",
      title: "Tự Động Làm Mới 00:00 Hằng Ngày",
      description:
        "Vào đúng nửa đêm 00:00, ứng dụng tự động đọc thời khóa biểu tuần, tạo lịch dạy mới cho ngày hôm sau, chuyển tiếp việc tồn và kích hoạt chuông báo chính xác.",
    },
    {
      icon: Cpu,
      color: "from-purple-500 to-indigo-600",
      badge: "Chống Tắt Ngầm",
      title: "Kiến Trúc Bền Bỉ Trên Mọi Dòng Máy",
      description:
        "Sử dụng chuẩn AlarmClock và cơ chế tự phục hồi RescheduleWorker định kỳ 15 phút. Không bao giờ bị hệ điều hành Xiaomi, Samsung, Oppo, Vivo tắt ngầm khi dọn dẹp RAM.",
    },
    {
      icon: BrainCircuit,
      color: "from-pink-500 to-rose-600",
      badge: "Trí Tuệ Nhân Tạo",
      title: "Trợ Lý AI Gemini Nhập Lịch Trong 3s",
      description:
        "Dán đoạn văn bản lịch dạy từ tin nhắn Zalo, email hay thông báo của phòng đào tạo, AI sẽ tự động phân tích thứ, tiết dạy, phòng học và tạo sự kiện chuẩn xác.",
    },
    {
      icon: CloudCheck,
      color: "from-blue-500 to-indigo-700",
      badge: "Đồng Bộ Đám Mây",
      title: "Sao Lưu Supabase & Bot Telegram",
      description:
        "Dữ liệu được sao lưu bảo mật trên đám mây Supabase. Hỗ trợ kết nối Bot Telegram để nhận tin nhắn thông báo lớp học và cảnh báo công việc trực tiếp.",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Giới Thiệu Ứng Dụng</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Công Nghệ Đột Phá Giúp Thầy Cô{" "}
            <span className="text-gradient-cyan">Làm Chủ Thời Khóa Biểu</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Khác biệt hoàn toàn với các ứng dụng lịch thông thường, Smart Teacher Schedule AI
            được thiết kế tỉ mỉ dựa trên hành vi và đặc thù thực tế của giáo viên Việt Nam.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover p-7 rounded-3xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Checkmark */}
                <div className="pt-4 border-t border-white/5 flex items-center text-xs text-emerald-400 font-semibold gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã tối ưu trên bản v1.2.5</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary Visual Banner */}
        <div className="mt-16 p-8 rounded-3xl glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h4 className="text-2xl font-bold text-white">
              Đồng bộ thời gian thực theo từng giây với điện thoại
            </h4>
            <p className="text-sm text-slate-300 max-w-2xl">
              Không còn tình trạng mở app bị đứng giờ hay lịch hôm qua chưa nhảy. Khi đồng hồ
              điện thoại bước sang ngày mới, app tự động chuyển trang thái và cập nhật Widget tức thì.
            </p>
          </div>
          <a
            href="#download"
            className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shrink-0 shadow-lg hover:scale-105 transition-all"
          >
            Tải và Trải Nghiệm Ngay
          </a>
        </div>
      </div>
    </section>
  );
}
