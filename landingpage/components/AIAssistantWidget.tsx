"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Phone,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  ShieldAlert,
  Zap,
  ChevronDown,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào Thầy/Cô! Em là Trợ lý AI hỗ trợ 24/7 của Smart Teacher Schedule AI (Made in Huy Technology AI). Em có thể hướng dẫn Thầy/Cô cài đặt app, bật chuông báo kép, ghim Widget ra màn hình chính, hoặc tư vấn các gói Pro. Thầy/Cô cần em hỗ trợ điều gì ạ?",
      timestamp: "Vừa xong",
      quickActions: [
        { label: "🚀 Tính năng mới bản v1.2.6?", action: "tinh_nang_moi" },
        { label: "⚠️ Cảnh báo trùng lịch dạy?", action: "canh_bao_trung_lich" },
        { label: "⏰ Khung giờ cố định (45p & 60p)?", action: "khung_gio_chuan" },
        { label: "📅 Lịch trình tổng thể (Không bấm từng ngày)?", action: "lich_trinh_tong_the" },
        { label: "🔄 Đồng bộ Google Calendar & Smartwatch?", action: "dong_bo_google" },
        { label: "📱 Cách cài đặt APK trên máy?", action: "huong_dan_cai_dat" },
        { label: "📞 Gặp trực tiếp chuyên gia Zalo", action: "lien_he_chuyen_gia" },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ai-assistant", handleOpen);
    return () => window.removeEventListener("open-ai-assistant", handleOpen);
  }, []);

  // AI Knowledge Base answering engine
  const generateAIResponse = (userQuery: string): { text: string; quickActions?: { label: string; action: string }[] } => {
    const query = userQuery.toLowerCase();

    // v1.2.6 New Features
    if (query.includes("mới") || query.includes("v1.2.6") || query.includes("tinh_nang_moi")) {
      return {
        text: `Dạ, phiên bản **v1.2.6** vừa phát hành mang đến 4 cải tiến đột phá theo đúng đóng góp của quý Thầy/Cô:\n\n1️⃣ **Cảnh báo trùng lịch dạy & phòng học**: Hệ thống tự động phát hiện khi ca dạy mới bị trùng giờ hoặc trùng phòng với môn khác, cảnh báo màu cam nổi bật tức thì.\n2️⃣ **Khung giờ cố định chuẩn 1-chạm**: Có sẵn các tiết Lý thuyết chuẩn 45 phút (Tiết 1-2, 3-4, 5-6, 7-8...) và ca Thực hành 60 phút (Ca xưởng 4 tiếng 07:30-11:30, 13:00-17:00), kèm các nút cộng nhanh +45p, +90p, +60p, +120p, +240p.\n3️⃣ **Xem Lịch trình tổng thể liên tục (Agenda)**: Nhấp vào tab Lịch là thấy ngay dòng thời gian tất cả các ca dạy sắp tới cuộn một mạch, không cần phải bấm từng ngày như trước!\n4️⃣ **Đồng bộ Google Calendar 2 chiều**: Xuất toàn bộ ca dạy sang Google Calendar trên máy và rung chuông nhắc nhở trực tiếp trên Đồng hồ thông minh (Smartwatch).\n5️⃣ **Đổi ngày trực tiếp trên lịch cũ**: Cho phép dời lịch sang Hôm nay, Ngày mai, +7 ngày hoặc chọn Thứ trong tuần chỉ với 1 chạm!`,
        quickActions: [
          { label: "⚠️ Cảnh báo trùng lịch hoạt động ra sao?", action: "canh_bao_trung_lich" },
          { label: "🔄 Cách đồng bộ Google Calendar?", action: "dong_bo_google" },
          { label: "📥 Tải ngay bản v1.2.6 (15.1 MB)", action: "huong_dan_cai_dat" }
        ],
      };
    }

    if (query.includes("trùng") || query.includes("xung đột") || query.includes("canh_bao_trung_lich")) {
      return {
        text: `Dạ, trong bản v1.2.6, tính năng **Cảnh báo trùng lịch** bảo vệ Thầy/Cô tuyệt đối khỏi sai sót khi nhập thời khóa biểu:\n\n• **Tự động quét thời gian thực**: Ngay khi Thầy/Cô chọn Thứ, Giờ vào lớp - Giờ tan lớp và Phòng học, ứng dụng sẽ so sánh với toàn bộ lịch dạy hiện có.\n• **Phân loại rõ ràng**: Báo rõ là **Trùng giờ dạy** (Thầy/Cô đã có ca khác cùng giờ) hay **Trùng phòng học** (phòng đó đã có lớp khác học).\n• **Cảnh báo trực quan**: Thẻ màu cam xuất hiện nêu rõ tên môn và phòng đang bị trùng.\n• **Quyền chủ động**: Thầy/Cô có thể điều chỉnh lại giờ, hoặc nếu là chủ đích (ví dụ dạy ghép 2 lớp) thì chỉ cần bật công tắc *"Vẫn lưu dù trùng lịch"* là xong ạ!`,
        quickActions: [
          { label: "⏰ Khung giờ chuẩn 45p và 60p?", action: "khung_gio_chuan" },
          { label: "📅 Lịch trình tổng thể liên tục?", action: "lich_trinh_tong_the" }
        ],
      };
    }

    if (query.includes("khung giờ") || query.includes("tiết") || query.includes("45") || query.includes("60") || query.includes("khung_gio_chuan")) {
      return {
        text: `Dạ, để Thầy/Cô không phải quay số chọn từng phút khi nhập lịch, bản v1.2.6 tích hợp sẵn hệ thống **Khung giờ cố định chuẩn sư phạm**:\n\n📘 **Tiết Lý Thuyết (45 phút / tiết):**\n• Tiết 1-2: 07:00 - 08:30 (Sáng)\n• Tiết 3-4: 08:45 - 10:15 (Sáng)\n• Tiết 5-6: 10:30 - 12:00 (Trưa)\n• Tiết 7-8: 13:00 - 14:30 (Chiều)\n• Tiết 9-10: 14:45 - 16:15 (Chiều)\n• Tiết 11-12: 16:30 - 18:00 (Tối)\n\n🛠️ **Tiết Thực Hành / Xưởng (60 phút / tiết):**\n• Ca Sáng (4 tiết): 07:30 - 11:30 (4 tiếng)\n• Ca Chiều (4 tiết): 13:00 - 17:00 (4 tiếng)\n• Ca Tối (3 tiết): 18:00 - 21:00 (3 tiếng)\n\n⚡ **Cộng nhanh thời lượng:** Chỉ cần chọn giờ bắt đầu, Thầy/Cô bấm nút: \`+45p\`, \`+90p\`, \`+60p\`, \`+120p\`, \`+240p\` là máy tự động tính giờ kết thúc chuẩn xác 100%!`,
        quickActions: [
          { label: "📅 Lịch trình tổng thể ra sao?", action: "lich_trinh_tong_the" },
          { label: "🔄 Đồng bộ Google Calendar?", action: "dong_bo_google" }
        ],
      };
    }

    if (query.includes("lịch trình") || query.includes("tổng thể") || query.includes("từng ngày") || query.includes("lich_trinh_tong_the")) {
      return {
        text: `Dạ, bắt đầu từ bản v1.2.6, khi Thầy/Cô nhấp vào tab **Lịch**, màn hình sẽ hiển thị ngay **Dòng thời gian Lịch trình tổng thể (Agenda)** mà không bắt Thầy/Cô phải bấm từng ngày nữa ạ!\n\n✨ **Những điểm tiện lợi:**\n• **Hiển thị cuộn một mạch**: Danh sách tất cả các ca dạy từ Hôm nay, Ngày mai, Thứ Sáu, Thứ Bảy... cuộn xem mượt mà cả tuần, cả tháng.\n• **Gom nhóm theo ngày sắc nét**: Phân biệt rõ HÔM NAY (xanh nổi bật), NGÀY MAI và các ngày tiếp theo.\n• **Bộ lọc 1-chạm**: Lọc nhanh ca dạy *"Tuần này"*, *"Tuần tới"*, *"Lý thuyết"* hoặc *"Thực hành"*.\n• **Thao tác nhanh trên từng ca**: Có sẵn nút ✏️ Sửa / Đổi ngày, 🗑️ Xóa và 🔄 Đồng bộ Google Calendar ngay trên thẻ lịch!`,
        quickActions: [
          { label: "🔄 Đồng bộ Google Calendar & Smartwatch?", action: "dong_bo_google" },
          { label: "📥 Tải APK v1.2.6 ngay", action: "huong_dan_cai_dat" }
        ],
      };
    }

    if (query.includes("google") || query.includes("calendar") || query.includes("đồng bộ") || query.includes("smartwatch") || query.includes("dong_bo_google")) {
      return {
        text: `Dạ, tính năng liên kết **Google Calendar** trong bản v1.2.6 đã được kích hoạt hoàn hảo:\n\n1. **Đồng bộ toàn bộ lịch dạy sang Google Calendar**:\n• Vào mục **Cài đặt ➔ Google Calendar** ➔ Bấm **"Đồng bộ toàn bộ lịch dạy ngay"**.\n• Tất cả các ca dạy sẽ được đưa vào Google Calendar trên điện thoại kèm 2 mốc nhắc nhở (60m & 15m).\n2. **Rung báo trên Đồng hồ thông minh (Smartwatch)**:\n• Nhờ đồng bộ với Google Calendar, khi đến giờ báo thức 60m & 15m, đồng hồ thông minh (Apple Watch, Samsung Galaxy Watch, Xiaomi Band) của Thầy/Cô sẽ rung và hiện tên môn, phòng học ngay trên cổ tay!\n3. **Đồng bộ từng ca dạy riêng lẻ**: Ngay trên từng thẻ lịch dạy có biểu tượng đồng bộ 🔄 để đưa nhanh ca dạy đó vào Google Calendar.`,
        quickActions: [
          { label: "📥 Tải bản cài đặt v1.2.6", action: "huong_dan_cai_dat" },
          { label: "📞 Gặp chuyên gia hỗ trợ", action: "lien_he_chuyen_gia" }
        ],
      };
    }

    if (query.includes("cài") || query.includes("tải") || query.includes("apk") || query.includes("huong_dan_cai_dat")) {
      return {
        text: `Dạ, để cài đặt bản v1.2.6 trên điện thoại Android, Thầy/Cô làm theo 3 bước đơn giản sau ạ:\n\n1️⃣ **Bước 1: Tải file APK**: Bấm nút **[TẢI FILE APK v1.2.6 (15.1 MB)]** ở đầu trang hoặc quét mã QR.\n2️⃣ **Bước 2: Cho phép tải xuống**: Nếu trình duyệt báo "Tệp có thể gây hại", Thầy/Cô chọn **"Vẫn tải xuống"** (đây là cảnh báo mặc định của Android khi cài file ngoài CH Play, ứng dụng đã được ký số SHA-256 an toàn 100%).\n3️⃣ **Bước 3: Cài đặt**: Mở tệp vừa tải ➔ Chọn **Cài đặt (Install)** ➔ Mở app là trải nghiệm được ngay!`,
        quickActions: [
          { label: "🔋 Làm sao để app không bị tắt ngầm?", action: "chong_tat_ngam" },
          { label: "🖼️ Cách bật Widget màn hình chính?", action: "bat_widget" },
        ],
      };
    }

    if (query.includes("tắt ngầm") || query.includes("pin") || query.includes("xiaomi") || query.includes("samsung") || query.includes("oppo") || query.includes("vivo") || query.includes("chong_tat_ngam")) {
      return {
        text: `Dạ, các dòng điện thoại Android (đặc biệt là Xiaomi, Samsung, Oppo, Realme, Vivo) có tính năng tiết kiệm pin rất gắt gao. Để đảm bảo chuông báo thức kép 60m & 15m reo đúng 100%, Thầy/Cô cấu hình 2 bước sau:\n\n1. **Cho phép Báo thức chính xác (Exact Alarm)**: Vào Cài đặt máy ➔ Ứng dụng ➔ Smart Teacher Schedule ➔ Quyền ➔ Cho phép "Báo thức và lời nhắc".\n2. **Tắt Tối ưu hóa pin**: Nhấn giữ biểu tượng app trên màn hình chính ➔ Chọn "Thông tin ứng dụng (i)" ➔ Tiết kiệm pin / Pin ➔ Chọn **"Không giới hạn" (No restrictions)**.\n3. **Khóa ứng dụng trong đa nhiệm (Đặc biệt với Xiaomi)**: Mở màn hình đa nhiệm (Recent Apps) ➔ Nhấn giữ thẻ Smart Teacher ➔ Bấm vào biểu tượng **Khóa (Ổ khóa)** để máy không tự xóa app khi dọn RAM.\n\nTrong app cũng có mục **Cài đặt ➔ Trung tâm tin cậy thông báo (OEM)** hướng dẫn chi tiết từng dòng máy ạ!`,
        quickActions: [
          { label: "🖼️ Hướng dẫn ghim Widget 2-trong-1", action: "bat_widget" },
          { label: "📞 Cần chuyên gia hỗ trợ qua Zalo", action: "lien_he_chuyen_gia" },
        ],
      };
    }

    if (query.includes("widget") || query.includes("tiện ích") || query.includes("màn hình chính") || query.includes("bat_widget")) {
      return {
        text: `Dạ, tiện ích Widget 2-trong-1 là tính năng cực kỳ tiện lợi giúp Thầy/Cô chỉ cần bật sáng điện thoại là thấy ngay ca dạy kế tiếp và việc cần làm!\n\n**Cách thêm Widget ra màn hình:**\n1. Ra màn hình chính của điện thoại, nhấn và giữ tay vào một vùng trống khoảng 2 giây.\n2. Chọn mục **Tiện ích (Widgets)** xuất hiện ở dưới màn hình.\n3. Tìm ứng dụng **Smart Teacher Schedule** ➔ Chọn widget kích thước **4x2** hoặc **Next Class**.\n4. Kéo thả ra vị trí Thầy/Cô ưng ý trên màn hình chính.\n\n💡 *Bật mí*: Widget hiển thị đếm ngược thời gian (ví dụ: "Còn 25 phút", "Còn 1h 30p"), phòng học, lớp học và có nút bấm làm mới tức thì ạ!`,
        quickActions: [
          { label: "⏰ Cơ chế làm mới 00:00 hoạt động ra sao?", action: "bao_thuc_kep" },
          { label: "💎 Xem tính năng Gói Pro", action: "goi_pro" },
        ],
      };
    }

    if (query.includes("báo thức") || query.includes("nhắc") || query.includes("60") || query.includes("15") || query.includes("00:00") || query.includes("bao_thuc_kep")) {
      return {
        text: `Dạ, hệ thống nhắc lịch của Smart Teacher Schedule AI được tối ưu riêng cho nghề giáo:\n\n🔔 **Báo thức kép 2 mốc thời gian:**\n• **Trước 60 phút**: Phát chuông thông báo để Thầy/Cô kiểm tra lại giáo án, bài giảng điện tử hoặc chuẩn bị phôi vật tư xưởng thực hành.\n• **Trước 15 phút**: Báo thức nhắc nhở Thầy/Cô di chuyển đến giảng đường, xưởng máy để không bao giờ bị trễ giờ lên lớp.\n\n🔄 **Tự động làm mới lúc 00:00 hàng ngày (Bản v1.2.5):**\nVào đúng nửa đêm 00:00, app tự động đọc thời khóa biểu của ngày mới, lập chuông báo cho tất cả các ca dạy, chuyển tiếp các việc chưa hoàn thành của hôm trước sang hôm nay và làm mới Widget mà Thầy/Cô không cần thao tác gì thêm!`,
        quickActions: [
          { label: "🤖 AI Gemini trích xuất lịch ra sao?", action: "gemini_ai" },
          { label: "📱 Tải ngay bản v1.2.5", action: "huong_dan_cai_dat" },
        ],
      };
    }

    if (query.includes("pro") || query.includes("giá") || query.includes("phí") || query.includes("gói") || query.includes("mua") || query.includes("goi_pro")) {
      return {
        text: `Dạ, Smart Teacher Schedule AI có 3 gói phù hợp với từng nhu cầu của Thầy/Cô:\n\n1. 🟢 **Gói Miễn Phí (0 đ)**: Dùng trọn đời với đầy đủ báo thức kép 60m/15m, widget màn hình chính và chạy hoàn toàn offline.\n2. 💎 **Gói Giáo Viên Pro (VIP Cá Nhân) - 49.000 đ/tháng (hoặc 399.000 đ/năm - Tiết kiệm 32%)**:\n• Không giới hạn Gemini AI trích xuất lịch từ tin nhắn Zalo, email.\n• Tự động đồng bộ thời gian thực đa thiết bị trên Cloud Supabase.\n• Kết nối Bot Telegram tự động gửi tin nhắn báo giờ dạy.\n• Tặng bộ 20+ Prompt AI soạn giáo án chuẩn đầu ra.\n3. 🏢 **Gói Tổ Bộ Môn / Nhà Trường (1.490.000 đ/năm)**: Cho tối đa 30 giáo viên, phân công lịch dạy tự động và xuất báo cáo thanh toán giờ giảng.\n\nThầy/Cô có thể kéo xuống mục **Bảng Giá** hoặc **Điền Form Hỗ Trợ** ở dưới để nhận ưu đãi ngay hôm nay ạ!`,
        quickActions: [
          { label: "🎁 Nhận bộ Prompt AI soạn giáo án", action: "nhan_prompt" },
          { label: "📞 Gặp chuyên gia Zalo 0961364600", action: "lien_he_chuyen_gia" },
        ],
      };
    }

    if (query.includes("gemini") || query.includes("ai") || query.includes("trích xuất") || query.includes("zalo") || query.includes("gemini_ai")) {
      return {
        text: `Dạ, tính năng Trợ lý AI Gemini là "vũ khí bí mật" giúp Thầy/Cô tiết kiệm hàng giờ nhập lịch dạy thủ công:\n\nChỉ cần sao chép đoạn tin nhắn Zalo phân công dạy (ví dụ: *"Thứ 2 từ 8h đến 11h dạy Phay CNC lớp CĐCK02 phòng Xưởng A1"*), sau đó vào màn hình **AI Assistant** trong app và bấm **"Phân tích"**.\n\nAI sẽ tự động nhận diện:\n• Thứ và ngày diễn ra\n• Thời gian bắt đầu & kết thúc\n• Tên môn học, tên lớp, số phòng\n• Tự tạo sự kiện và lên lịch báo thức kép 60m & 15m ngay lập tức!`,
        quickActions: [
          { label: "💎 Nâng cấp Gói Pro để dùng AI", action: "goi_pro" },
          { label: "📞 Nhờ chuyên gia hỗ trợ", action: "lien_he_chuyen_gia" },
        ],
      };
    }

    if (query.includes("chuyên gia") || query.includes("liên hệ") || query.includes("sđt") || query.includes("zalo") || query.includes("huy") || query.includes("lien_he_chuyen_gia")) {
      return {
        text: `Dạ, Thầy/Cô có thể liên hệ trực tiếp với chuyên gia phát triển ứng dụng:\n\n👨‍💻 **Huy Technology AI**\n📞 Hotline / Zalo: **0961364600** (Chạm để gọi hoặc kết bạn Zalo)\n📧 Email: **huytechnologyai2025@gmail.com**\n🏢 Sứ mệnh: Đồng hành cùng Thầy/Cô giáo viên toàn quốc 24/7.\n\nChuyên gia luôn sẵn sàng hỗ trợ từ xa cài đặt qua Zalo hoặc TeamViewer/UltraViewer cho Thầy/Cô ạ!`,
        quickActions: [
          { label: "💬 Nhắn tin Zalo ngay", action: "open_zalo" },
          { label: "📋 Điền form nhận hỗ trợ tại chỗ", action: "scroll_form" },
        ],
      };
    }

    // Default polite comprehensive fallback
    return {
      text: `Dạ, em đã ghi nhận thắc mắc: "${userQuery}".\n\nSmart Teacher Schedule AI phiên bản v1.2.5 hiện đã có sẵn đầy đủ tính năng: Báo thức kép 60m & 15m, Tiện ích Widget 2-trong-1, tự động làm mới 00:00 và hỗ trợ chống tắt ngầm khi dọn RAM.\n\nThầy/Cô muốn em hỗ trợ cụ thể về vấn đề nào dưới đây ạ?`,
      quickActions: [
        { label: "📱 Hướng dẫn cài đặt APK", action: "huong_dan_cai_dat" },
        { label: "🔋 Chống tắt ngầm trên điện thoại", action: "chong_tat_ngam" },
        { label: "🖼️ Cách thêm Widget màn hình chính", action: "bat_widget" },
        { label: "💎 Bảng giá Gói Pro VIP", action: "goi_pro" },
        { label: "📞 Gặp trực tiếp chuyên gia Zalo", action: "lien_he_chuyen_gia" },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageContent = textToSend || inputText;
    if (!messageContent.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageContent.trim(),
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const response = generateAIResponse(messageContent);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.text,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        quickActions: response.quickActions,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickAction = (action: string, label: string) => {
    if (action === "open_zalo") {
      window.open("https://zalo.me/0961364600", "_blank");
      return;
    }
    if (action === "scroll_form") {
      document.getElementById("support")?.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }
    handleSendMessage(label);
  };

  return (
    <>
      {/* 1. Floating AI Button (Fixed at Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
        {/* Floating Tooltip if chat is closed */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer mb-1 hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 text-xs text-white shadow-xl backdrop-blur-md hover:scale-105 transition-all group animate-bounce"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-indigo-300 group-hover:text-white">
              Cần trợ giúp? Hỏi AI 24/7 ngay!
            </span>
          </div>
        )}

        {/* The Main Round Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex items-center justify-center p-4 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen
              ? "bg-slate-800 text-slate-300 rotate-90 scale-95 border border-white/20"
              : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white hover:scale-110 shadow-indigo-500/50 hover:shadow-cyan-500/50"
          }`}
          aria-label="Mở Trợ lý AI 24/7"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Sparkles className="w-7 h-7 animate-pulse" />
              {/* Online Indicator Badge */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
          )}
        </button>
      </div>

      {/* 2. Interactive AI Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[82vh] rounded-3xl glass-panel border-2 border-indigo-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Chat Window Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-cyan-400/50 shadow-md">
                <Image
                  src="/app_icon.jpg"
                  alt="AI Assistant"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>Trợ Lý AI 24/7</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Made in Huy Technology AI • SĐT 0961364600
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Message Scrollable Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-start space-x-2 max-w-[88%]">
                  {msg.sender === "ai" && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shrink-0 mt-0.5 text-cyan-300">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none shadow-md font-medium"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Quick Action Chips if provided */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8">
                    {msg.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(qa.action, qa.label)}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-[11px] font-semibold text-cyan-300 hover:text-white transition-all text-left"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-400 pl-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-cyan-300">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-200"></span>
                  <span className="text-[11px] text-slate-400 ml-1">AI đang soạn câu trả lời...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Zalo Direct Connection Banner inside Chat */}
          <div className="px-4 py-2 bg-indigo-950/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Phone className="w-3.5 h-3.5" />
              <span>Zalo hỗ trợ trực tiếp: 0961364600</span>
            </span>
            <a
              href="https://zalo.me/0961364600"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline font-bold"
            >
              Nhắn ngay
            </a>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-white/10 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập câu hỏi về app (ví dụ: cách ghim widget)..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white disabled:opacity-40 transition-all shadow-md"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
