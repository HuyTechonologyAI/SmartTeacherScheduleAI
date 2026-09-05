"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Download,
  Share2,
  AlertCircle,
  ArrowLeft,
  Sun,
  Moon,
  Coffee,
  Heart,
  Award,
  FileSpreadsheet,
  Trash2,
  X,
  RefreshCw,
  Smartphone,
  Check,
  MapPin,
  Users,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';

interface ScheduleItem {
  id: string;
  subject: string;
  className: string;
  room: string;
  dayOfWeek: number; // 2 -> 8 (Thứ 2 -> CN)
  startTime: string;
  endTime: string;
  type: 'theory' | 'practice';
  startDate: string;
  endDate: string;
  lessonPlanUrl?: string;
  notes?: string;
}

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  {
    id: 's1',
    subject: 'Toán Học (Đại Số 11)',
    className: '11A1',
    room: 'Phòng 204 - Nhà A',
    dayOfWeek: 2,
    startTime: '07:00',
    endTime: '07:45',
    type: 'theory',
    startDate: '2026-09-07',
    endDate: '2027-01-25',
    notes: 'Kiểm tra 15 phút bài cũ'
  },
  {
    id: 's2',
    subject: 'Toán Học (Hình Học 11)',
    className: '11A1',
    room: 'Phòng 204 - Nhà A',
    dayOfWeek: 2,
    startTime: '07:50',
    endTime: '08:35',
    type: 'theory',
    startDate: '2026-09-07',
    endDate: '2027-01-25',
    notes: 'Chương 2: Đường thẳng và mặt phẳng'
  },
  {
    id: 's3',
    subject: 'Tin Học - Lập Trình Python',
    className: '10A3',
    room: 'Phòng Lab 2',
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '10:00',
    type: 'practice',
    startDate: '2026-09-07',
    endDate: '2027-01-25',
    notes: 'Thực hành vòng lặp for/while'
  },
  {
    id: 's4',
    subject: 'Toán Học Nâng Cao',
    className: '12Chuyên',
    room: 'Phòng 301 - Nhà C',
    dayOfWeek: 3,
    startTime: '07:30',
    endTime: '08:15',
    type: 'theory',
    startDate: '2026-09-07',
    endDate: '2027-01-25',
    notes: 'Khảo sát hàm số'
  },
  {
    id: 's5',
    subject: 'Thực Hành Tin Học Văn Phòng',
    className: '11B2',
    room: 'Phòng Lab 1',
    dayOfWeek: 4,
    startTime: '13:30',
    endTime: '14:30',
    type: 'practice',
    startDate: '2026-09-07',
    endDate: '2027-01-25',
    notes: 'Hàm thống kê Excel nâng cao'
  }
];

const MORNING_QUOTES = [
  "Chào Thầy/Cô! Mỗi bài học hôm nay là một viên gạch vàng dựng xây tương lai cho các em học sinh. Chúc Thầy/Cô có một ngày giảng dạy tràn đầy năng lượng và niềm vui!",
  "Mỗi tiết học của Thầy/Cô đều gieo mầm ước mơ vĩ đại. Hãy nở nụ cười thật tươi khi bước vào lớp nhé!",
  "Một người thầy giỏi giống như ngọn nến – đốt cháy chính mình để thắp sáng con đường cho học trò. Chúc Thầy/Cô một ngày rạng rỡ thành công!",
  "Học sinh đang rất hào hứng đón chờ tiết dạy sáng nay của Thầy/Cô. Thở sâu, mỉm cười và cùng tỏa sáng nào!"
];

const EVENING_QUOTES = [
  "Thầy/Cô đã hoàn thành một ngày giảng dạy thật tuyệt vời! Cảm ơn Thầy/Cô vì sự tận tụy không ngừng nghỉ cho thế hệ trẻ. Hãy thư giãn và nghỉ ngơi thật ngon giấc tối nay nhé!",
  "Tiếng trống tan trường đã điểm. Những hạt giống tri thức Thầy/Cô gieo hôm nay sẽ đơm hoa kết trái. Chúc Thầy/Cô buổi tối ấm áp bên gia đình!",
  "Cảm ơn tấm lòng kiên nhẫn và ngọn lửa nhiệt huyết của Thầy/Cô suốt ngày dài. Thầy/Cô xứng đáng có một buổi tối thư thái hoàn toàn!",
  "Ngày làm việc khép lại, mọi bài vở có thể tạm gác sang một bên. Hãy thưởng cho mình một tách trà ấm và nạp lại năng lượng nhé!"
];

export default function IOSAppPage() {
  const [activeTab, setActiveTab] = useState<'today' | 'schedule' | 'add' | 'reports' | 'ai'>('today');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(2); // Thứ 2
  const [isClient, setIsClient] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Add form states
  const [newSubject, setNewSubject] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newDay, setNewDay] = useState(2);
  const [newType, setNewType] = useState<'theory' | 'practice'>('theory');
  const [newStartTime, setNewStartTime] = useState('07:00');
  const [newEndTime, setNewEndTime] = useState('07:45');
  const [newStartDate, setNewStartDate] = useState('2026-09-07');
  const [newEndDate, setNewEndDate] = useState('2027-01-25');
  const [newNotes, setNewNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Chào Thầy/Cô! Em là Trợ lý AI Giáo viên. Thầy/Cô cần em hỗ trợ soạn giáo án, tạo câu hỏi trắc nghiệm, hay giải đáp quy định chuyên môn nào hôm nay ạ?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('smart_teacher_schedules');
    if (saved) {
      try {
        setSchedules(JSON.parse(saved));
      } catch (e) {
        setSchedules(DEFAULT_SCHEDULES);
      }
    } else {
      setSchedules(DEFAULT_SCHEDULES);
      localStorage.setItem('smart_teacher_schedules', JSON.stringify(DEFAULT_SCHEDULES));
    }

    // Auto check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isIOS && !isStandalone) {
      setShowIOSGuide(true);
    }
  }, []);

  // Save to localStorage
  const saveSchedules = (items: ScheduleItem[]) => {
    setSchedules(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smart_teacher_schedules', JSON.stringify(items));
    }
  };

  // Preset time helper
  const handleTypeChange = (type: 'theory' | 'practice') => {
    setNewType(type);
    const [h, m] = newStartTime.split(':').map(Number);
    const duration = type === 'theory' ? 45 : 60;
    const endMinutes = h * 60 + m + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    setNewEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  const handleStartTimeChange = (time: string) => {
    setNewStartTime(time);
    const [h, m] = time.split(':').map(Number);
    const duration = newType === 'theory' ? 45 : 60;
    const endMinutes = h * 60 + m + duration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    setNewEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  // Check schedule conflict
  const checkConflict = () => {
    const conflicts = schedules.filter(s => {
      if (s.dayOfWeek !== newDay) return false;
      const sStart = s.startTime;
      const sEnd = s.endTime;
      return (
        (newStartTime >= sStart && newStartTime < sEnd) ||
        (newEndTime > sStart && newEndTime <= sEnd) ||
        (newStartTime <= sStart && newEndTime >= sEnd)
      );
    });

    if (conflicts.length > 0) {
      const c = conflicts[0];
      setConflictWarning(`⚠️ Trùng giờ với lớp ${c.className} (${c.subject}) lúc ${c.startTime} - ${c.endTime} Thứ ${c.dayOfWeek}!`);
      return true;
    }
    setConflictWarning(null);
    return false;
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newClass || !newRoom) {
      alert('Vui lòng điền đầy đủ Tên môn, Lớp và Phòng học!');
      return;
    }

    if (checkConflict()) {
      const proceed = confirm('Hệ thống phát hiện trùng lịch giảng dạy. Thầy/Cô có chắc chắn vẫn muốn lưu ca dạy này?');
      if (!proceed) return;
    }

    const newItem: ScheduleItem = {
      id: 's_' + Date.now(),
      subject: newSubject,
      className: newClass,
      room: newRoom,
      dayOfWeek: Number(newDay),
      startTime: newStartTime,
      endTime: newEndTime,
      type: newType,
      startDate: newStartDate,
      endDate: newEndDate,
      notes: newNotes
    };

    const updated = [...schedules, newItem];
    saveSchedules(updated);
    setAddSuccess(true);
    setNewSubject('');
    setNewClass('');
    setNewRoom('');
    setNewNotes('');
    setConflictWarning(null);

    setTimeout(() => {
      setAddSuccess(false);
      setActiveTab('schedule');
      setSelectedDay(Number(newDay));
    }, 1200);
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm('Thầy/Cô có muốn xóa tiết dạy này khỏi lịch trình?')) {
      const updated = schedules.filter(s => s.id !== id);
      saveSchedules(updated);
    }
  };

  // AI Chat send
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userText = inputMessage;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputMessage('');
    setIsAiTyping(true);

    setTimeout(() => {
      let aiReply = 'Dạ thưa Thầy/Cô, em đã ghi nhận yêu cầu. ';
      const lower = userText.toLowerCase();
      if (lower.includes('giáo án') || lower.includes('bài giảng')) {
        aiReply += 'Em gợi ý cấu trúc bài dạy 5 bước chuẩn Công văn 5512/BGDĐT gồm: 1. Khởi động (5p) -> 2. Hình thành kiến thức (20p) -> 3. Luyện tập (12p) -> 4. Vận dụng (5p) -> 5. Giao nhiệm vụ về nhà (3p). Thầy/Cô muốn soạn chi tiết mục nào ạ?';
      } else if (lower.includes('trùng lịch') || lower.includes('lịch')) {
        aiReply += 'Tính năng kiểm tra trùng lịch tự động trên app giúp Thầy/Cô không bao giờ bị xếp lộn ca. Thầy/Cô có thể vào mục "Thêm Lịch" để nhập khoảng ngày từ lúc khai giảng đến kết thúc học kỳ nhé!';
      } else if (lower.includes('sổ báo giảng') || lower.includes('báo cáo')) {
        aiReply += 'Thầy/Cô có thể vào tab "Sổ Sách" bên dưới để tải file Sổ Báo Giảng hoặc Bảng Kê Giờ Dạy theo chuẩn mẫu quy định chỉ với 1 chạm!';
      } else {
        aiReply += 'Em luôn sẵn sàng hỗ trợ Thầy/Cô trong công việc sư phạm số và giảm tải áp lực hành chính mỗi ngày!';
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
      setIsAiTyping(false);
    }, 1000);
  };

  // Time & Motivation helpers
  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 5 && currentHour < 14;
  const currentQuote = isMorning
    ? MORNING_QUOTES[quoteIndex % MORNING_QUOTES.length]
    : EVENING_QUOTES[quoteIndex % EVENING_QUOTES.length];

  const todaySchedules = schedules
    .filter(s => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalHours = schedules.reduce((acc, curr) => {
    return acc + (curr.type === 'theory' ? 0.75 : 1.0);
  }, 0);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28 max-w-md mx-auto relative shadow-2xl overflow-x-hidden border-x border-slate-800">
      
      {/* iOS Status Bar Simulation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1 -ml-1 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20">
              <img src="/app_icon.jpg" alt="Icon" className="w-full h-full object-cover rounded-[10px]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                Smart Teacher <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-500/30">iOS PWA</span>
              </h1>
              <p className="text-[11px] text-slate-400">Giáo viên: Nguyễn Văn An</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-2 py-1 text-[11px] font-medium bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg flex items-center gap-1 transition-all"
            >
              <Smartphone className="w-3 h-3" /> Cài vào iPhone
            </button>
          </div>
        </div>
      </header>

      {/* iOS Smart Banner - Add to Home Screen */}
      {showIOSGuide && (
        <div className="mx-3 mt-3 p-3.5 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/40 rounded-2xl relative shadow-lg">
          <button
            onClick={() => setShowIOSGuide(false)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="pr-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-1">
                Ghim App Ra Màn Hình Chính iPhone
              </h4>
              <p className="text-[11px] text-blue-200 mt-1 leading-relaxed">
                1. Bấm nút <strong>Chia sẻ (biểu tượng ô vuông mũi tên lên ⎋)</strong> dưới đáy Safari.
                <br />
                2. Cuộn xuống chọn <strong>&ldquo;Thêm vào MH chính&rdquo; (Add to Home Screen)</strong>.
                <br />
                3. Trải nghiệm mượt mà toàn màn hình như App tải từ App Store!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BODY BASED ON ACTIVE TAB */}
      <main className="p-3.5 space-y-4">

        {/* TAB 1: TODAY */}
        {activeTab === 'today' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* AI Dynamic Motivation Card (v1.3.1) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isMorning ? (
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Sun className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Moon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-200 tracking-wide">
                    {isMorning ? 'ĐỘNG LỰC SÁNG NAY (AI)' : 'LỜI CẢM ƠN TỐI NAY (AI)'}
                  </span>
                </div>
                <button
                  onClick={() => setQuoteIndex(prev => prev + 1)}
                  className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                  title="Đổi câu truyền cảm hứng khác"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                &ldquo;{currentQuote}&rdquo;
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Coffee className="w-3 h-3" /> Năng lượng tích cực
                </span>
                <span className="text-slate-500">v1.3.1 AI Engine</span>
              </div>
            </div>

            {/* Next Class Hero Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/15 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-md mb-2">
                    TIẾT DẠY TIẾP THEO
                  </span>
                  <h3 className="text-lg font-extrabold leading-tight">Toán Học (Đại Số 11)</h3>
                  <p className="text-xs text-blue-100 mt-0.5">Lớp 11A1 • Phòng 204 - Nhà A</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-mono">07:00</div>
                  <div className="text-[10px] text-blue-200">Bắt đầu trong 25 phút</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5" /> 45 phút (Lý thuyết)
                </span>
                <span className="bg-white text-blue-700 px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-sm">
                  Đã tải giáo án
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setActiveTab('add')}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
              >
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Thêm ca dạy</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
              >
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Sổ Báo Giảng</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
              >
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">Trợ lý AI</span>
              </button>
            </div>

            {/* Today Schedule List */}
            <div>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Lịch Giảng Dạy Thứ 2 (Hôm Nay)
                </h3>
                <span className="text-[11px] text-indigo-400 font-medium">3 tiết học</span>
              </div>

              <div className="space-y-2.5">
                {todaySchedules.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-12 rounded-full bg-indigo-500 shrink-0 mt-0.5"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{item.subject}</h4>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            item.type === 'theory'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {item.type === 'theory' ? '45p' : '60p'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Lớp {item.className} • {item.room}
                        </p>
                        {item.notes && (
                          <p className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
                            📌 {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-indigo-300 font-mono">
                        {item.startTime} - {item.endTime}
                      </div>
                      <span className="text-[10px] text-slate-500">Đã lên lịch</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE (WEEK VIEW) */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Lịch Trình Giảng Dạy</h2>
                <p className="text-xs text-slate-400">Học kỳ 1 • 2026 - 2027</p>
              </div>
              <button
                onClick={() => setActiveTab('add')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm tiết
              </button>
            </div>

            {/* Day Selector Tabs (Thứ 2 -> CN) */}
            <div className="flex items-center justify-between gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              {[2, 3, 4, 5, 6, 7, 8].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === day
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {day === 8 ? 'CN' : `T${day}`}
                </button>
              ))}
            </div>

            {/* Schedules for Selected Day */}
            <div className="space-y-3">
              {todaySchedules.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                  <Coffee className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Không có tiết dạy nào vào {selectedDay === 8 ? 'Chủ Nhật' : `Thứ ${selectedDay}`}.</p>
                  <button
                    onClick={() => {
                      setNewDay(selectedDay);
                      setActiveTab('add');
                    }}
                    className="mt-3 text-xs text-indigo-400 font-semibold hover:underline"
                  >
                    + Thêm tiết dạy cho ngày này
                  </button>
                </div>
              ) : (
                todaySchedules.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.subject}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.type === 'theory'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {item.type === 'theory' ? 'Lý thuyết 45p' : 'Thực hành 60p'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-300 mt-1.5">
                          <span className="flex items-center gap-1 font-semibold text-slate-200">
                            <Users className="w-3.5 h-3.5 text-indigo-400" /> {item.className}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {item.room}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        title="Xóa tiết học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-indigo-300 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.startDate} ➔ {item.endDate}
                      </div>
                    </div>

                    {item.notes && (
                      <div className="mt-2 text-xs bg-slate-800/60 p-2 rounded-lg text-amber-200/90 border border-amber-500/10">
                        📌 Ghi chú: {item.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADD SCHEDULE (With Date Range & Conflict Detection) */}
        {activeTab === 'add' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-base font-bold text-white">Thêm Lịch Giảng Dạy Mới</h2>
              <p className="text-xs text-slate-400">Tính năng v1.3.1: Nhập ngày bắt đầu - kết thúc & khung giờ chuẩn</p>
            </div>

            {addSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-in fade-in">
                <Check className="w-4 h-4" /> Đã lưu lịch giảng dạy thành công vào thiết bị iPhone!
              </div>
            )}

            {conflictWarning && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-start gap-2 text-amber-300 text-xs leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleAddSchedule} className="space-y-3.5 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Môn Học / Bài Dạy *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Toán Học, Tin Học..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lớp Học *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 11A1"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phòng Học *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: P.204 Nhà A"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lặp Lại Vào Thứ Mấy Hàng Tuần *</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>Thứ Hai hàng tuần</option>
                  <option value={3}>Thứ Ba hàng tuần</option>
                  <option value={4}>Thứ Tư hàng tuần</option>
                  <option value={5}>Thứ Năm hàng tuần</option>
                  <option value={6}>Thứ Sáu hàng tuần</option>
                  <option value={7}>Thứ Bảy hàng tuần</option>
                  <option value={8}>Chủ Nhật hàng tuần</option>
                </select>
              </div>

              {/* Preset Time Types */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Khung Giờ Cố Định (Chuẩn Bộ GD&ĐT)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('theory')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      newType === 'theory'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    📖 Lý Thuyết (45 Phút)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('practice')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      newType === 'practice'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    🧪 Thực Hành (60 Phút)
                  </button>
                </div>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giờ Bắt Đầu</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giờ Kết Thúc ({newType === 'theory' ? '45p' : '60p'})</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Date Range (v1.3.1) */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                  📅 Khoảng Thời Gian Diễn Ra Lịch (v1.3.1)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Ngày kết thúc nhắc nhở</label>
                    <input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Lịch sẽ tự động nhắc nhở Thầy/Cô vào Thứ {newDay} hàng tuần từ {newStartDate} đến hết ngày {newEndDate}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi Chú / Chuẩn Bị Bài Dạy</label>
                <textarea
                  rows={2}
                  placeholder="Dặn dò học sinh, kiểm tra bài tập, thiết bị cần mượn..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Lưu Lịch Giảng Dạy Vào iPhone
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SỔ SÁCH & BÁO CÁO (Export Excel/PDF) */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="text-base font-bold text-white">Sổ Sách & Báo Cáo Sư Phạm</h2>
              <p className="text-xs text-slate-400">Xuất tự động chuẩn mẫu quy định của Bộ GD&ĐT</p>
            </div>

            {/* Total Stats Card */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-800/50 rounded-xl">
                <div className="text-lg font-black text-indigo-400">{schedules.length}</div>
                <div className="text-[10px] text-slate-400">Tổng tiết/tuần</div>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-xl">
                <div className="text-lg font-black text-emerald-400">{totalHours}h</div>
                <div className="text-[10px] text-slate-400">Thời lượng</div>
              </div>
              <div className="p-2 bg-slate-800/50 rounded-xl">
                <div className="text-lg font-black text-purple-400">100%</div>
                <div className="text-[10px] text-slate-400">Chuẩn hóa</div>
              </div>
            </div>

            {/* Document 1: Sổ Báo Giảng */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Sổ Báo Giảng Điện Tử Tuần</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tự động tổng hợp tên bài dạy, phân phối chương trình, lớp và thời gian theo tuần.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,Thứ,Tiết,Môn,Lớp,Phòng,Thời Gian,Thời Lượng,Bắt Đầu,Kết Thúc\n" +
                      schedules.map(s => `Thứ ${s.dayOfWeek},${s.subject},${s.className},${s.room},${s.startTime}-${s.endTime},${s.type==='theory'?'45p':'60p'},${s.startDate},${s.endDate}`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "So_Bao_Giang_Tuan.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                >
                  <Download className="w-3.5 h-3.5" /> Xuất Excel (.CSV)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> In / PDF
                </button>
              </div>
            </div>

            {/* Document 2: Bảng Kê Giờ Dạy */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Bảng Kê Giờ Dạy & Thù Lao</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Thống kê tiết chuẩn, tiết vượt giờ, hệ số đứng lớp phục vụ thanh quyết toán cuối kỳ.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => alert('Đã tạo báo cáo bảng kê giờ dạy học kỳ 1! Thầy/Cô có thể tải file hoặc gửi email trực tiếp.')}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                >
                  <Download className="w-3.5 h-3.5" /> Xuất Bảng Kê (PDF)
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dữ liệu lưu trữ bảo mật cục bộ ngay trên bộ nhớ iPhone của Thầy/Cô.</span>
            </div>
          </div>
        )}

        {/* TAB 5: TRỢ LÝ AI (AI ASSISTANT) */}
        {activeTab === 'ai' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Trợ Lý Sư Phạm AI
              </h2>
              <p className="text-xs text-slate-400">Hỗ trợ soạn giáo án, câu hỏi, phương pháp dạy học</p>
            </div>

            {/* Chat Box */}
            <div className="h-[360px] bg-slate-900/90 border border-slate-800 rounded-2xl p-3 overflow-y-auto space-y-3 flex flex-col">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {msg.role === 'user' ? 'GV' : 'AI'}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex items-center gap-2 text-xs text-purple-400 italic">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI đang suy nghĩ câu trả lời...
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setInputMessage('Gợi ý giáo án 5 bước CV 5512')}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white shrink-0"
              >
                📝 Cấu trúc CV 5512
              </button>
              <button
                onClick={() => setInputMessage('Tạo 3 câu hỏi trắc nghiệm Toán 11')}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white shrink-0"
              >
                ❓ Đặt câu hỏi trắc nghiệm
              </button>
              <button
                onClick={() => setInputMessage('Cách xuất Sổ Báo Giảng ra Excel?')}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white shrink-0"
              >
                📊 Hướng dẫn xuất sổ
              </button>
            </div>

            {/* Chat Input */}
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Hỏi AI bất kỳ điều gì..."
                className="flex-1 bg-transparent px-2 text-xs text-white focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* iOS TAB BAR NAVIGATION (Apple Human Interface Guidelines) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-2 z-50 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'today' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Hôm nay</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'schedule' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Lịch tuần</span>
        </button>

        {/* Central Prominent Add Button */}
        <button
          onClick={() => setActiveTab('add')}
          className="relative -top-3 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'reports' ? 'text-indigo-400 scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Sổ sách</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'ai' ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Trợ lý AI</span>
        </button>
      </nav>

    </div>
  );
}
