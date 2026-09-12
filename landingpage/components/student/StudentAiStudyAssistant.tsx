"use client";

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Award,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Lightbulb,
  FileEdit,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Search
} from 'lucide-react';
import {
  generatePedagogicalResponse,
  detectSubject,
  PedagogicalMode,
  SubjectType,
  StudentAiResponse
} from './studentAiPedagogyBrain';
import { Language } from '@/app/app/i18n';

interface StudentAiStudyAssistantProps {
  lang: Language;
  currentClass: string;
  studentName: string;
  initialQuestion?: string;
  onCloseModal?: () => void;
}

const SAMPLE_QUESTIONS: { subject: SubjectType; label: string; question: string }[] = [
  {
    subject: 'math',
    label: '📐 Toán: Tìm chiều dài hình chữ nhật',
    question: 'Một mảnh vườn hình chữ nhật có chu vi 48m, chiều rộng 10m. Hỏi chiều dài của mảnh vườn đó là bao nhiêu mét?'
  },
  {
    subject: 'vietnamese',
    label: '✍️ Văn: Dàn ý tả cây bóng mát',
    question: 'Hãy lập dàn ý cho bài văn miêu tả một cây bóng mát trong sân trường em (ví dụ cây bàng hoặc cây phượng).'
  },
  {
    subject: 'english',
    label: '🌍 Tiếng Anh: Mẫu câu hỏi sở thích',
    question: 'Làm thế nào để hỏi và trả lời về sở thích bằng tiếng Anh với mẫu câu "What is your hobby?"'
  },
  {
    subject: 'science',
    label: '🔬 Khoa học: Vòng tuần hoàn của nước',
    question: 'Giải thích nguyên nhân vì sao nước mưa lại rơi từ trên trời xuống và nước trên mặt đất đi đâu?'
  }
];

export default function StudentAiStudyAssistant({
  lang,
  currentClass,
  studentName,
  initialQuestion = '',
  onCloseModal
}: StudentAiStudyAssistantProps) {
  const isEn = lang === 'en';
  const [question, setQuestion] = useState<string>(initialQuestion);
  const [studentSolution, setStudentSolution] = useState<string>('');
  const [mode, setMode] = useState<PedagogicalMode>('HINT_METHOD');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('math');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<StudentAiResponse | null>(() => {
    if (initialQuestion) {
      return generatePedagogicalResponse(initialQuestion, currentClass, 'HINT_METHOD');
    }
    return null;
  });

  const handleAsk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      const res = generatePedagogicalResponse(
        question.trim(),
        currentClass,
        mode,
        mode === 'CHECK_WORK' ? studentSolution : undefined
      );
      setResponse(res);
      setSelectedSubject(res.subject);
      setIsLoading(false);
    }, 450);
  };

  const handleSelectSample = (sample: typeof SAMPLE_QUESTIONS[0]) => {
    setQuestion(sample.question);
    setSelectedSubject(sample.subject);
    setIsLoading(true);
    setTimeout(() => {
      const res = generatePedagogicalResponse(sample.question, currentClass, mode);
      setResponse(res);
      setIsLoading(false);
    }, 350);
  };

  const handleReset = () => {
    setQuestion('');
    setStudentSolution('');
    setResponse(null);
  };

  return (
    <div className="bg-white dark:bg-[#111728] border-2 border-amber-300/80 dark:border-amber-900/60 rounded-3xl p-4 sm:p-6 shadow-md space-y-4 sm:space-y-5 transition-all">
      
      {/* Header Cam kết Sư phạm Việt Nam */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-2 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {isEn ? "AI Pedagogical Study Buddy" : "Gia Sư AI Học Tập Chuẩn Sư Phạm Việt Nam"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-white font-black text-[10px] tracking-wide shadow-xs">
                🇻🇳 GDPT 2018
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isEn 
                ? "Grounded in official curriculum • Guided step-by-step thinking • Never does homework for you" 
                : "Bám sát Sách giáo khoa chính thống • Gợi mở tư duy từng bước • Tuyệt đối không làm bài thay"}
            </p>
          </div>
        </div>

        {/* Badge Tuyên ngôn Sư phạm */}
        <div className="px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{isEn ? "Academic Integrity Standard" : "Chuẩn Mực Sư Phạm: Không Giải Bài Thay"}</span>
        </div>
      </div>

      {/* 4 Chế độ hỗ trợ Sư phạm */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          {
            id: 'HINT_METHOD' as const,
            icon: '💡',
            title: isEn ? 'Method Guidance' : 'Gợi Ý Phương Pháp',
            desc: isEn ? 'Step-by-step hints' : 'Từng bước tư duy'
          },
          {
            id: 'EXPLAIN_CONCEPT' as const,
            icon: '📖',
            title: isEn ? 'Explain Concept' : 'Giải Thích Khái Niệm',
            desc: isEn ? 'Textbook definitions' : 'Định lý & Quy tắc SGK'
          },
          {
            id: 'OUTLINE_ESSAY' as const,
            icon: '✍️',
            title: isEn ? 'Writing Outline' : 'Dàn Ý & Ý Tưởng Viết',
            desc: isEn ? 'No essay copying' : 'Không chép văn mẫu'
          },
          {
            id: 'CHECK_WORK' as const,
            icon: '🔍',
            title: isEn ? 'Review My Solution' : 'Góp Ý Lời Giải Của Em',
            desc: isEn ? 'Encouraging review' : 'Kiểm tra & nhận xét'
          }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              mode === item.id
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{item.icon}</span>
              <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                {item.title}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {item.desc}
            </span>
          </button>
        ))}
      </div>

      {/* Gợi ý câu hỏi nhanh */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>{isEn ? "Or try a sample textbook question:" : "Hoặc thử một nhiệm vụ học tập mẫu:"}</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {SAMPLE_QUESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(s)}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Nhập Câu Hỏi & Bài Tập Cần Hỗ Trợ */}
      <form onSubmit={handleAsk} className="space-y-3">
        <div>
          <label className="font-bold text-xs text-slate-700 dark:text-slate-300 block mb-1">
            {isEn 
              ? `Enter task/question given by your teacher (${currentClass}):` 
              : `Nhập đề bài hoặc nhiệm vụ học tập Thầy/Cô giao cho em (${currentClass}):`}
          </label>
          <textarea
            required
            rows={3}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={isEn 
              ? "Example: How to calculate the area of a rectangle when perimeter is 48m and width is 10m?..." 
              : "Ví dụ: Làm thế nào để giải bài toán: Chu vi hình chữ nhật là 48m, chiều rộng 10m, tính chiều dài?..."}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none leading-relaxed"
          />
        </div>

        {/* Trường nhập bài làm của em nếu ở chế độ Kiểm tra */}
        {mode === 'CHECK_WORK' && (
          <div className="animate-fade-in">
            <label className="font-bold text-xs text-indigo-700 dark:text-indigo-300 block mb-1">
              {isEn ? "Enter your own steps or answer here:" : "Nhập cách làm hoặc kết quả mà em đã làm được:"}
            </label>
            <textarea
              rows={2}
              value={studentSolution}
              onChange={e => setStudentSolution(e.target.value)}
              placeholder={isEn ? "E.g. Step 1: Half-perimeter = 48 : 2 = 24m..." : "VD: Bước 1 em tính nửa chu vi là 48 : 2 = 24m, sau đó em lấy 24 - 10..."}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEn ? "Clear" : "Làm mới"}</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-orange-500/25 disabled:opacity-50 cursor-pointer transition-transform active:scale-95"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {isLoading 
                ? (isEn ? "Consulting Textbook..." : "Đang Tra Cứu SGK...") 
                : (isEn ? "Get Guidance 💡" : "Nhận Hướng Dẫn Sư Phạm 💡")}
            </span>
          </button>
        </div>
      </form>

      {/* KHUNG KẾT QUẢ SƯ PHẠM TRỰC QUAN */}
      {response && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in text-xs">
          
          {/* Tiêu đề & Cảnh báo Sư phạm */}
          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase">
                {isEn ? "Pedagogical Solution Plan" : "Kế Hoạch Hướng Dẫn Sư Phạm"}
              </span>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {response.title}
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                {isEn 
                  ? `Friendly reminder for ${studentName}: Let's think together through each step. Write your final answer into your notebook with your own effort!` 
                  : `Lời dặn của Thầy/Cô dành cho bạn ${studentName}: Hãy cùng cô đi qua từng bước tư duy dưới đây và tự tay ghi kết quả vào vở nhé!`}
              </p>
            </div>
            <span className="text-2xl">👩‍🏫</span>
          </div>

          {/* Khung Kiến thức SGK cốt lõi cần nhớ */}
          <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{isEn ? "Textbook Core Knowledge & Formulas:" : "Kiến Thức Cốt Lõi & Công Thức SGK Cần Vận Dụng:"}</span>
            </div>
            <pre className="text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed bg-white/70 dark:bg-slate-900/50 p-3 rounded-xl border border-blue-100 dark:border-blue-900 font-medium">
              {response.coreKnowledge}
            </pre>
          </div>

          {/* Các bước hướng dẫn tư duy từng bước (Step-by-step guidance) */}
          <div className="space-y-2.5">
            <h5 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-xs sm:text-sm">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? "Step-by-step Guidance (Scaffolding):" : "Hướng Dẫn Từng Bước Giải (Phương Pháp Sư Phạm Gợi Mở):"}</span>
            </h5>

            <div className="space-y-2.5">
              {response.stepByStepGuide.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {step.stepNumber}
                    </span>
                    <h6 className="font-bold text-slate-900 dark:text-white">
                      {step.stepTitle}
                    </h6>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal pl-8 whitespace-pre-wrap">
                    {step.guidance}
                  </p>

                  {step.questionForStudent && (
                    <div className="ml-8 p-2 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold text-[11px] flex items-center gap-1.5">
                      <span>❓</span>
                      <span><strong>{isEn ? "Think about it:" : "Câu hỏi gợi mở cho em:"}</strong> {step.questionForStudent}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nhiệm vụ / Thử thách tự hoàn thành */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-black text-xs sm:text-sm">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? "Your Turn - Self-Complete Challenge:" : "Nhiệm Vụ Học Tập Em Cần Tự Hoàn Thành:"}</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {response.challengeForStudent}
            </p>
          </div>

          {/* Lời động viên của Gia sư AI */}
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 font-medium flex items-center gap-2 text-xs italic">
            <span>💌</span>
            <span>{response.teacherEncouragement}</span>
          </div>

          {/* Thước đo nguồn gốc & Sách giáo khoa chính thống */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-1 font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEn ? "Official Textbook Source:" : "Căn cứ nguồn tài liệu học thuật chính thống:"}</span>
              </span>
              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                {response.source.pedagogicalStandard}
              </span>
            </div>
            <p className="font-medium">
              📖 <strong>{response.source.bookTitle}</strong> • {response.source.officialPublisher} • {response.source.gradeLevel}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
