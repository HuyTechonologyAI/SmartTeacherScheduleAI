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
  BookOpen,
  Award,
  Layers,
  Gamepad2,
  GitFork,
  Image as ImageIcon,
  Globe,
  Copy,
  Check,
  Download,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import {
  AiPedagogyMode,
  AiPedagogyResponse,
  processPedagogicalAiQuery,
  answerKnowledgeBaseQuery,
  generateExamAndMatrixPackage,
  generateSlideDeckPackage,
  generateMiniGamePackage,
  generateMindmapPackage,
  generateIllustrationPackage,
  searchOfficialVietnameseSources
} from "./aiPedagogyEngine";
import { getResolvedKnowledgeDocuments } from "../app/app/knowledgeBaseData";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  mode?: AiPedagogyMode;
  quickActions?: { label: string; action: string; mode?: AiPedagogyMode }[];
  svgContent?: string;
  mermaidCode?: string;
  wordExportableHtml?: string;
  sourceReferences?: {
    title: string;
    code?: string;
    url?: string;
    snippet?: string;
  }[];
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AiPedagogyMode>("ALL");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: `Xin chào Thầy/Cô! Em là **Trợ lý AI Sư phạm 24/7** của Smart Teacher Schedule AI (Made in Huy Technology AI).

Em đã được tích hợp **7 năng lực sư phạm chuyên sâu**:
1. 📚 **Tra cứu Kho tư liệu chuẩn**: CV 5512, CV 3456, QĐ 2422, CV 2634, TT 22, ATLĐ 5S và giáo trình của Thầy/Cô.
2. 📝 **Tạo đề thi & ma trận** chuẩn 4 mức độ theo Thông tư 22/2021/TT-BGDĐT.
3. 📊 **Tạo slide thuyết trình** bài giảng (10 slide kèm lời thoại giảng viên).
4. 🎮 **Tạo mini game** Kahoot / Quizizz / Rung chuông vàng tương tác.
5. 🧠 **Tạo sơ đồ tư duy** Mermaid và phân cấp tri thức trực quan.
6. 🎨 **Tạo hình ảnh minh hoạ & vẽ SVG** hiển thị trực tiếp.
7. 🇻🇳 **Tìm kiếm thông tin từ nguồn chính thống**: moet.gov.vn, gdnn.gov.vn, thuvienphapluat.vn.

Thầy/Cô hãy chọn nhanh chức năng bên dưới hoặc đặt câu hỏi bất kỳ ạ!`,
      timestamp: "Vừa xong",
      mode: "ALL",
      quickActions: [
        { label: "📚 Quy định 4 hoạt động CV 5512", action: "quy_dinh_5512", mode: "KNOWLEDGE" },
        { label: "📝 Tạo đề & ma trận chuẩn TT 22", action: "tao_de_tt22", mode: "EXAM_MATRIX" },
        { label: "📊 Tạo slide bài giảng 10 trang", action: "tao_slide_mau", mode: "SLIDES" },
        { label: "🎮 Tạo mini game tương tác", action: "tao_game_mau", mode: "MINI_GAME" },
        { label: "🧠 Tạo sơ đồ tư duy Mermaid", action: "tao_mindmap_mau", mode: "MINDMAP" },
        { label: "🎨 Tạo hình ảnh minh họa bài dạy", action: "tao_anh_mau", mode: "ILLUSTRATION" },
        { label: "🇻🇳 Định mức giờ dạy (TT 28 & TT 15)", action: "dinh_muc_gio_day", mode: "OFFICIAL_VN" },
        { label: "💻 Khung năng lực số CV 3456", action: "nang_luc_so_3456", mode: "KNOWLEDGE" },
        { label: "📱 Hướng dẫn cài app v1.5.0", action: "huong_dan_cai_dat", mode: "SCHEDULE" }
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
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ai-assistant", handleOpen);
    return () => window.removeEventListener("open-ai-assistant", handleOpen);
  }, []);

  // Xử lý sao chép văn bản
  const handleCopyText = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Xuất file Word (.doc) client-side
  const handleExportWord = (htmlContent: string, fileName: string = "Tai_Lieu_Smart_Teacher_AI") => {
    if (typeof window === "undefined") return;
    const blob = new Blob(["\ufeff", htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dispatch câu trả lời theo 7 chức năng
  const generateAIResponse = (userQuery: string, mode: AiPedagogyMode = selectedMode): AiPedagogyResponse => {
    const query = userQuery.toLowerCase().trim();

    // 1. Nếu là câu hỏi hướng dẫn cài đặt app, lockscreen, báo thức cũ
    if (query.includes("tecno") || query.includes("spark go") || query.includes("màn hình khóa") || query.includes("đồng hồ bục giảng") || query.includes("cài") || query.includes("tắt ngầm") || query.includes("widget")) {
      if (query.includes("tecno") || query.includes("spark go")) {
        return {
          mode: "SCHEDULE",
          text: "Dạ, với máy **Tecno Spark Go (HiOS Android 15)**:\n1️⃣ Vào **Cài đặt ➔ Trung tâm thông báo ➔ Màn hình khóa** ➔ Chọn **'Hiển thị thông báo và nội dung'**.\n2️⃣ Vào Cài đặt ➔ Ứng dụng ➔ Smart Teacher ➔ Thông báo ➔ Bật **'Hiển thị trên màn hình khóa'**.\n3️⃣ Bấm nút **'Đồng hồ bục giảng'** trong app để xem ca dạy đếm ngược to rõ ngay khi khóa máy!",
          quickActions: [
            { label: "📱 Màn hình khóa Tecno", action: "tecno_spark_go", mode: "SCHEDULE" },
            { label: "📥 Tải APK v1.5.0", action: "huong_dan_cai_dat", mode: "SCHEDULE" }
          ]
        };
      }
      if (query.includes("cài") || query.includes("tải") || query.includes("apk")) {
        return {
          mode: "SCHEDULE",
          text: "Dạ, để cài đặt bản v1.5.0:\n• **Android**: Bấm [TẢI APK v1.5.0] ở đầu trang hoặc quét mã QR ➔ Mở tệp vừa tải ➔ Cài đặt.\n• **Máy tính PC**: Dùng trực tiếp bản Web App v1.5.0 có đầy đủ tính năng soạn giáo án AI và đồng bộ 2 chiều qua mã đồng bộ!",
          quickActions: [
            { label: "🔋 Chống tắt ngầm Android", action: "chong_tat_ngam", mode: "SCHEDULE" },
            { label: "🖼️ Cách bật Widget", action: "bat_widget", mode: "SCHEDULE" }
          ]
        };
      }
    }

    // 2. Chạy qua Bộ máy AI Sư phạm trung tâm
    const resolvedDocs = getResolvedKnowledgeDocuments();
    return processPedagogicalAiQuery(userQuery, mode, resolvedDocs);
  };

  const handleSendMessage = (textToSend?: string, overrideMode?: AiPedagogyMode) => {
    const messageContent = textToSend || inputText;
    if (!messageContent.trim()) return;

    const activeMode = overrideMode || selectedMode;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageContent.trim(),
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      mode: activeMode
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateAIResponse(messageContent, activeMode);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.text,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        mode: response.mode,
        quickActions: response.quickActions,
        svgContent: response.svgContent,
        mermaidCode: response.mermaidCode,
        wordExportableHtml: response.wordExportableHtml,
        sourceReferences: response.sourceReferences
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickAction = (action: string, label: string, mode?: AiPedagogyMode) => {
    if (mode) setSelectedMode(mode);

    if (action === "open_zalo") {
      window.open("https://zalo.me/0961364600", "_blank");
      return;
    }
    if (action === "open_moet") {
      window.open("https://moet.gov.vn", "_blank");
      return;
    }
    if (action === "open_thuvienphapluat") {
      window.open("https://thuvienphapluat.vn", "_blank");
      return;
    }
    if (action === "xuat_word_de_thi" || action === "xuat_word_5512") {
      const lastAiMsg = [...messages].reverse().find(m => m.sender === "ai" && m.wordExportableHtml);
      if (lastAiMsg && lastAiMsg.wordExportableHtml) {
        handleExportWord(lastAiMsg.wordExportableHtml, "De_Thi_Ma_Tran_TT22");
        return;
      }
    }
    if (action === "copy_mermaid") {
      const lastAiMsg = [...messages].reverse().find(m => m.sender === "ai" && m.mermaidCode);
      if (lastAiMsg && lastAiMsg.mermaidCode) {
        handleCopyText(lastAiMsg.mermaidCode, "mermaid-" + lastAiMsg.id);
        return;
      }
    }

    handleSendMessage(label, mode);
  };

  // Danh mục 7 chức năng hiển thị trên thanh công cụ tab
  const modeTabs: { id: AiPedagogyMode; label: string; icon: any }[] = [
    { id: "ALL", label: "Tất cả", icon: Sparkles },
    { id: "KNOWLEDGE", label: "Kho tư liệu", icon: BookOpen },
    { id: "EXAM_MATRIX", label: "Đề thi & Ma trận", icon: Award },
    { id: "SLIDES", label: "Slide thuyết trình", icon: Layers },
    { id: "MINI_GAME", label: "Mini game", icon: Gamepad2 },
    { id: "MINDMAP", label: "Sơ đồ tư duy", icon: GitFork },
    { id: "ILLUSTRATION", label: "Hình minh họa", icon: ImageIcon },
    { id: "OFFICIAL_VN", label: "Nguồn chính thống", icon: Globe },
  ];

  return (
    <>
      {/* 1. NÚT NỔI GÓC DƯỚI PHẢI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
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
              Trợ lý AI Sư phạm 24/7 (7 Chức năng)
            </span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group flex items-center justify-center p-4 rounded-full shadow-2xl transition-all duration-300 ${
            isOpen
              ? "bg-slate-800 text-slate-300 rotate-90 scale-95 border border-white/20"
              : "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white hover:scale-110 shadow-indigo-500/50 hover:shadow-cyan-500/50"
          }`}
          aria-label="Mở Trợ lý AI Sư phạm 24/7"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Sparkles className="w-7 h-7 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
          )}
        </button>
      </div>

      {/* 2. CỬA SỔ CHAT ĐA NĂNG */}
      {isOpen && (
        <div
          className={`fixed z-50 rounded-3xl glass-panel border-2 border-indigo-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-black shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isExpanded
              ? "bottom-4 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[720px] h-[85vh]"
              : "bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[480px] h-[640px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-slate-950 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-cyan-400/50 shadow-md">
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
                    <span>Trợ Lý AI Sư Phạm</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online 24/7
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  CV 5512 • TT 22 • 6 Miền Năng Lực Số • Made by Huy Tech AI
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
                title={isExpanded ? "Thu nhỏ" : "Phóng to cửa sổ"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MODE SELECTOR BAR (7 CHỨC NĂNG SƯ PHẠM) */}
          <div className="px-3 py-2 bg-slate-950/70 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
            {modeTabs.map((tab) => {
              const IconComp = tab.icon;
              const isSelected = selectedMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMode(tab.id)}
                  className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 whitespace-nowrap font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* VÙNG CUỘN TIN NHẮN */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-start space-x-2 max-w-[94%]">
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

                    {/* Hiển thị đồ họa SVG vector trực quan nếu có */}
                    {msg.svgContent && (
                      <div className="mt-3.5 rounded-xl overflow-hidden border border-cyan-500/30 shadow-lg bg-slate-950 p-2">
                        <div
                          dangerouslySetInnerHTML={{ __html: msg.svgContent }}
                          className="w-full flex justify-center"
                        />
                      </div>
                    )}

                    {/* Hiển thị mã Mermaid cho sơ đồ tư duy nếu có */}
                    {msg.mermaidCode && (
                      <div className="mt-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-cyan-300 font-mono">
                          <span>MÃ NGUỒN MERMAID MINDMAP:</span>
                          <button
                            onClick={() => handleCopyText(msg.mermaidCode!, "mermaid-" + msg.id)}
                            className="flex items-center gap-1 hover:text-white px-2 py-0.5 rounded bg-white/5"
                          >
                            {copiedId === "mermaid-" + msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === "mermaid-" + msg.id ? "Đã chép" : "Chép mã"}</span>
                          </button>
                        </div>
                        <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto p-1.5 bg-black/40 rounded">
                          {msg.mermaidCode}
                        </pre>
                      </div>
                    )}

                    {/* Trích dẫn căn cứ pháp lý chính thống nếu có */}
                    {msg.sourceReferences && msg.sourceReferences.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                        <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span>CĂN CỨ VĂN BẢN CHÍNH THỐNG:</span>
                        </div>
                        {msg.sourceReferences.map((ref, idx) => (
                          <div key={idx} className="text-[10px] bg-indigo-950/30 rounded-lg p-1.5 border border-indigo-500/20 text-slate-300 flex items-center justify-between">
                            <span>🏛️ {ref.title} {ref.code ? `(${ref.code})` : ""}</span>
                            {ref.url && (
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                              >
                                <span>Tra cứu</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Thanh nút thao tác: Sao chép & Xuất Word */}
                    {msg.sender === "ai" && (
                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-end gap-2 text-[10px]">
                        {msg.wordExportableHtml && (
                          <button
                            onClick={() => handleExportWord(msg.wordExportableHtml!, "De_Thi_Ma_Tran_TT22")}
                            className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center gap-1 transition-all"
                          >
                            <Download className="w-3 h-3" />
                            <span>Xuất Word (.doc)</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyText(msg.text, "txt-" + msg.id)}
                          className="px-2 py-1 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 flex items-center gap-1 transition-all"
                        >
                          {copiedId === "txt-" + msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === "txt-" + msg.id ? "Đã chép" : "Sao chép"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Gợi ý thao tác nhanh (Quick Action Chips) */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 pl-8">
                    {msg.quickActions.map((qa, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(qa.action, qa.label, qa.mode)}
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
                  <span className="text-[11px] text-slate-400 ml-1">
                    AI Sư phạm đang phân tích và đối chiếu tài liệu chuẩn...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Banner Zalo hỗ trợ */}
          <div className="px-4 py-1.5 bg-indigo-950/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Phone className="w-3.5 h-3.5" />
              <span>Chuyên gia Zalo 24/7: 0961364600</span>
            </span>
            <a
              href="https://zalo.me/0961364600"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline font-bold"
            >
              Nhắn Zalo ngay
            </a>
          </div>

          {/* Input Bar */}
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
              placeholder={
                selectedMode === "EXAM_MATRIX"
                  ? "Nhập môn & khối để tạo đề thi ma trận (ví dụ: Công nghệ 10)..."
                  : selectedMode === "SLIDES"
                  ? "Nhập tên bài học để tạo 10 slide thuyết trình..."
                  : selectedMode === "MINI_GAME"
                  ? "Nhập chủ đề để tạo mini game Kahoot / Quizizz..."
                  : selectedMode === "MINDMAP"
                  ? "Nhập chủ đề để tạo sơ đồ tư duy Mermaid..."
                  : selectedMode === "ILLUSTRATION"
                  ? "Nhập bài học để tạo hình minh họa & prompt 3D..."
                  : selectedMode === "OFFICIAL_VN"
                  ? "Hỏi về thông tư, định mức giờ dạy, công văn Bộ GD&ĐT..."
                  : "Hỏi AI Sư phạm (CV 5512, TT 22, năng lực số, tạo slide, đề thi)..."
              }
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white disabled:opacity-40 transition-all shadow-md cursor-pointer"
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
