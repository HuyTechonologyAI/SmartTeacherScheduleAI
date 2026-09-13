"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Star,
  Award,
  CheckCircle2,
  RotateCcw,
  X,
  Play,
  Square,
  Globe,
  MessageSquare,
  VolumeX,
  HelpCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import {
  PRIMARY_ENGLISH_TOPICS,
  VoicePracticeLesson,
  PronunciationResult,
  speakEnglish,
  speakVietnamese,
  stopSpeaking,
  startVoiceRecognition,
  evaluatePronunciation,
  isSpeechRecognitionSupported
} from '@/lib/voiceAiService';
import { generatePedagogicalResponse } from '@/components/student/studentAiPedagogyBrain';

interface VoiceAiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass?: string;
  studentName?: string;
  isEn?: boolean;
}

export default function VoiceAiTutorModal({
  isOpen,
  onClose,
  currentClass = 'Lớp 3A1',
  studentName = 'Bảo An',
  isEn = false
}: VoiceAiTutorModalProps) {
  const [activeMode, setActiveMode] = useState<'english_coach' | 'vietnamese_qa'>('english_coach');
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [evalResult, setEvalResult] = useState<PronunciationResult | null>(null);
  const [totalEarnedStars, setTotalEarnedStars] = useState(5);

  // Vietnamese Voice Q&A states
  const [viQuestion, setViQuestion] = useState('');
  const [viAiAnswer, setViAiAnswer] = useState<string | null>(null);
  const [isViThinking, setIsViThinking] = useState(false);

  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const currentTopic = PRIMARY_ENGLISH_TOPICS[selectedTopicIdx] || PRIMARY_ENGLISH_TOPICS[0];
  const currentItem = currentTopic.items[selectedItemIdx] || currentTopic.items[0];

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    // Reset state when switching items
    setSpokenTranscript('');
    setEvalResult(null);
    stopSpeaking();
    setIsSpeaking(false);
    setIsListening(false);
  }, [selectedTopicIdx, selectedItemIdx, activeMode]);

  if (!isOpen) return null;

  // 1. Phát âm mẫu tiếng Anh
  const handlePlayEnglishSample = () => {
    stopSpeaking();
    setIsSpeaking(true);
    speakEnglish(currentItem.wordOrPhrase, {
      rate: 0.85,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handlePlaySentenceSample = () => {
    stopSpeaking();
    setIsSpeaking(true);
    speakEnglish(currentItem.exampleSentence, {
      rate: 0.85,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });
  };

  // 2. Thu âm và chấm điểm phát âm tiếng Anh
  const handleStartEnglishPractice = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setSpokenTranscript('');
    setEvalResult(null);
    stopSpeaking();
    setIsListening(true);

    recognitionRef.current = startVoiceRecognition({
      lang: 'en-US',
      onResult: (transcript) => {
        setSpokenTranscript(transcript);
        setIsListening(false);
        const res = evaluatePronunciation(currentItem.wordOrPhrase, transcript);
        setEvalResult(res);
        if (res.stars > 0) {
          setTotalEarnedStars(prev => prev + res.stars);
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  // 3. Chuyển sang từ tiếp theo
  const handleNextWord = () => {
    if (selectedItemIdx < currentTopic.items.length - 1) {
      setSelectedItemIdx(prev => prev + 1);
    } else if (selectedTopicIdx < PRIMARY_ENGLISH_TOPICS.length - 1) {
      setSelectedTopicIdx(prev => prev + 1);
      setSelectedItemIdx(0);
    } else {
      setSelectedTopicIdx(0);
      setSelectedItemIdx(0);
    }
  };

  // 4. Hỏi bài bằng giọng nói tiếng Việt
  const handleStartViRecording = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setViQuestion('');
    setViAiAnswer(null);
    stopSpeaking();
    setIsListening(true);

    recognitionRef.current = startVoiceRecognition({
      lang: 'vi-VN',
      onResult: (transcript) => {
        setViQuestion(transcript);
        setIsListening(false);
        processViQuestion(transcript);
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const processViQuestion = (qText: string) => {
    if (!qText.trim()) return;
    setIsViThinking(true);
    setTimeout(() => {
      const res = generatePedagogicalResponse(qText, currentClass, 'HINT_METHOD');
      const voiceSpeechText = `Chào bạn ${studentName}. ${res.title}. Cô có lời gợi ý cho em: ${res.stepByStepGuide[0]?.guidance || ''}. Hãy cùng cô làm tiếp bước tiếp theo nhé!`;
      setViAiAnswer(voiceSpeechText);
      setIsViThinking(false);
      
      // Tự động phát giọng đọc tiếng Việt ấm áp
      speakVietnamese(voiceSpeechText, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#101726] border border-amber-300 dark:border-amber-900/60 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        
        {/* Header with Avatar and Star Counter */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/20">
              🐱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isEn ? "Voice AI Tutor & Pronunciation Coach" : "Gia Sư Giọng Nói AI & Luyện Phát Âm"}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 text-[10px] font-black">
                  Tiểu học 🌟
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isEn 
                  ? "Native English practice • Warm Vietnamese audio explanations" 
                  : "Luyện phát âm Tiếng Anh chuẩn bản ngữ • Nghe cô giáo AI giảng bài truyền cảm"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-black flex items-center gap-1 shadow-2xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{totalEarnedStars} ⭐</span>
            </div>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('english_coach')}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'english_coach'
                ? 'bg-white dark:bg-[#171b2d] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>🇬🇧</span>
            <span>{isEn ? "English Pronunciation Coach" : "Luyện Phát Âm Tiếng Anh"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('vietnamese_qa')}
            className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'vietnamese_qa'
                ? 'bg-white dark:bg-[#171b2d] text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>🇻🇳</span>
            <span>{isEn ? "Vietnamese Voice Q&A" : "Hỏi Bài Bằng Giọng Nói"}</span>
          </button>
        </div>

        {/* ================= CHẾ ĐỘ 1: LUYỆN PHÁT ÂM TIẾNG ANH ================= */}
        {activeMode === 'english_coach' && (
          <div className="space-y-4 animate-fade-in text-xs">
            
            {/* Topic Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRIMARY_ENGLISH_TOPICS.map((top, idx) => (
                <button
                  key={top.id}
                  onClick={() => {
                    setSelectedTopicIdx(idx);
                    setSelectedItemIdx(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedTopicIdx === idx
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span>{top.icon}</span>
                  <span>{top.topic}</span>
                </button>
              ))}
            </div>

            {/* Flashcard Word Viewer */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 dark:from-[#131b2e] dark:via-[#111728] dark:to-[#171a33] border-2 border-indigo-200/80 dark:border-indigo-900/60 shadow-md space-y-4 text-center">
              
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Từ vựng {selectedItemIdx + 1} / {currentTopic.items.length}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentItem.wordOrPhrase}
                </h2>
                <div className="text-sm font-mono text-purple-600 dark:text-purple-400 font-bold">
                  {currentItem.phonetic}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  (Ý nghĩa: <strong>{currentItem.vietnameseMeaning}</strong>)
                </div>
              </div>

              {/* Example sentence */}
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currentItem.exampleSentence}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  {currentItem.exampleMeaning}
                </div>
              </div>

              {/* Controls: Listen Sample & Record */}
              <div className="flex items-center justify-center gap-3 pt-2">
                
                {/* Button: Listen Sample */}
                <button
                  type="button"
                  onClick={handlePlayEnglishSample}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-indigo-600' : ''}`} />
                  <span>{isSpeaking ? "Đang phát âm..." : "Nghe cô đọc mẫu 🔊"}</span>
                </button>

                {/* Button: Record Voice */}
                <button
                  type="button"
                  onClick={handleStartEnglishPractice}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? "Đang lắng nghe bé đọc..." : "Bấm Mic & Đọc theo 🎙️"}</span>
                </button>
              </div>

              {/* Sound Wave Animation when speaking/listening */}
              {(isSpeaking || isListening) && (
                <div className="flex items-center justify-center gap-1.5 py-1 animate-fade-in">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-6 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-4 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="w-1 h-7 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                  <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
                </div>
              )}

              {/* Evaluation Result Feedback */}
              {evalResult && (
                <div className={`p-4 rounded-2xl border text-left space-y-2 animate-fade-in ${
                  evalResult.accuracy === 'EXCELLENT'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : evalResult.accuracy === 'GOOD'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">
                        {evalResult.accuracy === 'EXCELLENT' ? '🏆' : evalResult.accuracy === 'GOOD' ? '👍' : '🌱'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Điểm phát âm: <strong className="text-indigo-600 dark:text-indigo-400">{evalResult.score} / 100</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: evalResult.stars }).map((_, sIdx) => (
                        <Star key={sIdx} className="w-4 h-4 fill-amber-400 text-amber-500 animate-bounce" />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {evalResult.feedback}
                  </p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    Âm thanh thu được từ bé: <span className="font-mono font-bold text-indigo-600">"{spokenTranscript}"</span>
                  </div>
                </div>
              )}

              {/* Next word button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleNextWord}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Từ tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= CHẾ ĐỘ 2: HỎI BÀI BẰNG GIỌNG NÓI TIẾNG VIỆT ================= */}
        {activeMode === 'vietnamese_qa' && (
          <div className="space-y-4 animate-fade-in text-xs">
            
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold">
                <Mic className="w-4 h-4 text-rose-600" />
                <span>Bé chỉ cần bấm Mic và đọc đề bài hoặc câu hỏi cho Cô giáo AI:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Ví dụ: <em>"Cô ơi chu vi hình chữ nhật tính như thế nào ạ?"</em> hoặc <em>"Vì sao có mưa rơi?"</em>
              </p>
            </div>

            {/* Mic Button Big */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <button
                type="button"
                onClick={handleStartViRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 animate-pulse ring-4 ring-rose-400/40'
                    : 'bg-gradient-to-tr from-rose-500 to-indigo-600 hover:scale-105 shadow-rose-500/30'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <div className="text-center space-y-0.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {isListening ? "Đang thu âm giọng nói của bé... Hãy đọc đề bài nào!" : "Bấm vào Micro để bắt đầu nói"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isListening ? "Bấm lại vào mic khi bé đã nói xong" : "Giọng đọc truyền cảm, ấm áp chuẩn SGK"}
                </span>
              </div>
            </div>

            {/* Spoken question preview */}
            {viQuestion && (
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Câu hỏi bé vừa nói:</span>
                <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  "{viQuestion}"
                </p>
              </div>
            )}

            {/* AI Voice Answer */}
            {isViThinking && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Cô giáo AI đang chuẩn bị câu trả lời sư phạm cho bé...</span>
              </div>
            )}

            {viAiAnswer && !isViThinking && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cô Giáo AI Hướng Dẫn:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                        setIsSpeaking(false);
                      } else {
                        speakVietnamese(viAiAnswer, {
                          onStart: () => setIsSpeaking(true),
                          onEnd: () => setIsSpeaking(false)
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isSpeaking ? "Tạm dừng" : "Nghe lại 🔊"}</span>
                  </button>
                </div>

                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                  {viAiAnswer}
                </p>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>✨ Tự động nhận diện và chọn giọng đọc Tiếng Việt ấm áp, truyền cảm.</span>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            {isEn ? "Done" : "Hoàn tất"}
          </button>
        </div>

      </div>
    </div>
  );
}
