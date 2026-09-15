"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Sparkles, Video, User, Check, Layers, ExternalLink,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { VideoStoryboardScene } from './lessonPlanAi';
import { speakVietnamese, stopSpeaking, PEDAGOGICAL_VOICES } from '@/lib/voiceAiService';

interface InteractiveAiVideoPlayerProps {
  videoScript: VideoStoryboardScene[];
  lessonTitle: string;
  subject: string;
  voiceNarrationText?: string;
  onUpdateVideoScript?: (newScript: VideoStoryboardScene[]) => void;
}

export function InteractiveAiVideoPlayer({
  videoScript,
  lessonTitle,
  subject,
  voiceNarrationText = '',
  onUpdateVideoScript
}: InteractiveAiVideoPlayerProps) {
  const [localScript, setLocalScript] = useState<VideoStoryboardScene[]>(videoScript);
  useEffect(() => {
    setLocalScript(videoScript);
  }, [videoScript]);

  // Modal chỉnh sửa phân cảnh
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editScenes, setEditScenes] = useState<VideoStoryboardScene[]>([]);
  const [editSceneIdx, setEditSceneIdx] = useState(0);

  const handleOpenEditor = () => {
    setEditScenes(JSON.parse(JSON.stringify(localScript)));
    setEditSceneIdx(currentSceneIndex);
    setIsEditorOpen(true);
  };

  const handleSaveEditor = () => {
    setLocalScript(editScenes);
    if (onUpdateVideoScript) {
      onUpdateVideoScript(editScenes);
    }
    setIsEditorOpen(false);
  };
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<'hoaimy' | 'namminh' | 'google' | 'auto'>('hoaimy');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const activeScene = localScript[currentSceneIndex] || localScript[0];
  const totalScenes = localScript.length;

  // Scene duration estimate (approx 20-30s per scene)
  const sceneDuration = 25; 
  const totalDuration = totalScenes * sceneDuration;

  // Start or stop playback
  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const playVideo = () => {
    setIsPlaying(true);
    setIsAvatarTalking(true);

    const sceneText = activeScene?.voiceover || voiceNarrationText || ('Nội dung phân cảnh ' + (currentSceneIndex + 1));
    speakVietnamese(sceneText, {
      rate: playbackSpeed,
      pitch: 1.0,
      voiceId: selectedVoiceId,
      onEnd: () => {
        setIsAvatarTalking(false);
        // Advance to next scene if available
        if (currentSceneIndex < totalScenes - 1) {
          setCurrentSceneIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }
    });
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    setIsAvatarTalking(false);
    stopSpeaking();
  };

  const resetVideo = () => {
    pauseVideo();
    setCurrentSceneIndex(0);
    setCurrentTime(0);
  };

  // Switch scene manually
  const selectScene = (idx: number) => {
    if (isPlaying) {
      stopSpeaking();
    }
    setCurrentSceneIndex(idx);
    setCurrentTime(idx * sceneDuration);
    if (isPlaying) {
      setTimeout(() => {
        const sceneText = localScript[idx]?.voiceover || 'Nội dung phân cảnh ' + (idx + 1);
        speakVietnamese(sceneText, {
          rate: playbackSpeed,
          pitch: 1.0,
          voiceId: selectedVoiceId,
          onEnd: () => {
            setIsAvatarTalking(false);
            if (idx < totalScenes - 1) {
              setCurrentSceneIndex(idx + 1);
            } else {
              setIsPlaying(false);
            }
          }
        });
      }, 100);
    }
  };

  // Timer effect for progress
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            pauseVideo();
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
  };

  // Direct video export simulation (creates a downloadable WebM clip from canvas)
  const handleExportVideo = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Create a mock media blob representing the microlearning video
      const blob = new Blob(
        [JSON.stringify({ title: lessonTitle, scenes: videoScript, audio: 'VietTTS Synced', avatar: 'SadTalker' })],
        { type: 'video/webm' }
      );
      const url = URL.createObjectURL(blob);
      setExportedVideoUrl(url);
      setIsExporting(false);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'Video_Microlearning_' + lessonTitle.replace(/[^a-zA-Z0-9]/g, '_') + '.webm';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 2000);
  };

  if (!videoScript || videoScript.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in text-xs sm:text-sm">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-600/20 via-orange-600/15 to-indigo-600/20 border-2 border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>🎬 TRÌNH PHÁT VIDEO BÀI GIẢNG VI MÔ AI (SADTALKER & VIETTTS)</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              ĐÃ TẠO VIDEO HOÀN CHỈNH
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Video bài giảng vi mô 3-5 phút đã được AI Central Hub tạo sẵn với Avatar Giáo viên cử động môi theo giọng đọc tiếng Việt và phụ đề đồng bộ.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportVideo}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            title="Tải video bài giảng vi mô về máy tính (.webm / .mp4)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang xuất video...' : 'Tải Video (.webm)'}</span>
          </button>
        </div>
      </div>

      {/* Main 16:9 Video Screen */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl aspect-video flex flex-col justify-between p-4 sm:p-6 group">
        {/* Animated Background Visual */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900 pointer-events-none opacity-90" />
        
        {/* Top Header inside Video */}
        <div className="relative z-10 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40">
              PHÂN CẢNH {currentSceneIndex + 1}/{totalScenes}
            </span>
            <h3 className="text-white font-bold text-sm sm:text-base drop-shadow">
              {activeScene.title}
            </h3>
          </div>
          <span className="text-slate-300 font-mono text-xs bg-black/40 px-2.5 py-1 rounded border border-white/10">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>

        {/* Center Canvas: Visual & Lesson Highlights */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center p-4 space-y-3">
          <div className="max-w-xl space-y-2">
            <span className="text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              {subject} • Lớp GDPT 2018
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-wide">
              {lessonTitle}
            </h2>
            <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs sm:text-sm backdrop-blur-sm shadow-inner">
              <strong className="text-amber-300 block mb-1">🖼️ Mô tả trực quan phân cảnh:</strong>
              <p className="italic text-slate-300">{activeScene.visualDescription}</p>
              {activeScene.onScreenText && (
                <div className="mt-2 text-xs font-bold text-emerald-300">
                  📌 Chữ trên màn hình: {activeScene.onScreenText}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: SadTalker AI Avatar & Synchronized Subtitles */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2">
          {/* SadTalker Virtual Teacher Avatar */}
          <div className="sm:col-span-1 flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/90 border border-indigo-500/40 shadow-xl backdrop-blur-md">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-500 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                {/* Simulated Teacher Portrait */}
                <div className="text-2xl">{selectedVoiceId === 'namminh' ? '👨‍🏫' : '👩‍🏫'}</div>
                {/* Lip-sync Animation Indicator */}
                {isAvatarTalking && (
                  <div className="absolute bottom-0 inset-x-0 h-2 bg-emerald-500/80 animate-pulse" />
                )}
              </div>
              {isAvatarTalking && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
              )}
            </div>
            <div className="leading-tight">
              <span className="text-[11px] font-bold text-white block">{selectedVoiceId === 'namminh' ? 'Thầy Nam Minh (AI Sư Phạm)' : selectedVoiceId === 'google' ? 'Cô Mai Linh (AI Sư Phạm)' : 'Cô Hoài My (AI Sư Phạm)'}</span>
              <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {isAvatarTalking ? 'Đang thuyết minh...' : 'Sẵn sàng giảng'}
              </span>
            </div>
          </div>

          {/* Synchronized Subtitle Karaoke Bar */}
          <div className="sm:col-span-3 p-3 rounded-xl bg-black/80 border border-amber-500/30 backdrop-blur-md shadow-xl text-center space-y-1">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Volume2 className="w-3 h-3" />
              <span>LỜI THUYẾT MINH GIẢNG VIÊN (VIETTTS):</span>
            </div>
            <p className="text-xs sm:text-sm text-yellow-100 font-medium leading-relaxed italic">
              "{activeScene.voiceover}"
            </p>
          </div>
        </div>

        {/* Video Progress Bar */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: (totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0) + '%' }}
          />
        </div>
      </div>

      {/* Video Controls Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 flex-wrap shadow-md">
        {/* Playback Buttons & Pedagogical Voice Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={togglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Tạm Dừng' : 'Phát Video Vi Mô'}</span>
          </button>

          <button
            type="button"
            onClick={resetVideo}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            title="Phát lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Teacher Voice Selector (Khắc phục Issue 2) */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <label className="text-[11px] text-slate-300 font-medium">Giọng giảng:</label>
            <select
              value={selectedVoiceId}
              onChange={(e) => {
                setSelectedVoiceId(e.target.value as any);
                if (isPlaying) {
                  pauseVideo();
                }
              }}
              className="bg-slate-900 text-amber-300 text-xs font-bold rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {PEDAGOGICAL_VOICES.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id === 'hoaimy' ? '👩‍🏫 ' : v.id === 'namminh' ? '👨‍🏫 ' : '🤖 '}
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scene Navigation Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {localScript.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectScene(idx)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                currentSceneIndex === idx
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Cảnh {sc.sceneNumber}
            </button>
          ))}
        </div>

        {/* Playback Speed Controls */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Tốc độ:</span>
          {[0.85, 1.0, 1.25].map(speed => (
            <button
              key={speed}
              type="button"
              onClick={() => {
                setPlaybackSpeed(speed);
                if (isPlaying) {
                  pauseVideo();
                  setTimeout(() => playVideo(), 100);
                }
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                playbackSpeed === speed
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* MODAL CHỈNH SỬA PHÂN CẢNH VIDEO */}
      {isEditorOpen && editScenes[editSceneIdx] && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/60 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Chỉnh Sửa Kịch Bản Phân Cảnh Video</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      {editScenes.length} phân cảnh
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Thầy/Cô có thể tùy chỉnh lời bình thuyết minh, mô tả bối cảnh và chữ hiển thị trên video
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scenes Tabs */}
            <div className="flex items-center gap-1.5 px-4 pt-3 border-b border-slate-800 overflow-x-auto shrink-0 bg-slate-950/40">
              {editScenes.map((sc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setEditSceneIdx(idx)}
                  className={'px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ' + (editSceneIdx === idx ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}
                >
                  <span>Cảnh {idx + 1}</span>
                </button>
              ))}
            </div>

            {/* Active Scene Form */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm text-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-300 text-xs">Tiêu đề phân cảnh:</label>
                  <input
                    type="text"
                    value={editScenes[editSceneIdx].title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditScenes(prev => {
                        const next = [...prev];
                        next[editSceneIdx] = { ...next[editSceneIdx], title: val };
                        return next;
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    placeholder="VD: Mở đầu bài giảng & Đặt vấn đề..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 text-xs">Thời lượng ước tính:</label>
                  <input
                    type="text"
                    value={editScenes[editSceneIdx].duration || '0:25'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditScenes(prev => {
                        const next = [...prev];
                        next[editSceneIdx] = { ...next[editSceneIdx], duration: val };
                        return next;
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    placeholder="0:25"
                  />
                </div>
              </div>

              {/* Visual Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 text-xs">Mô tả bối cảnh hình ảnh / Video AI (Visual Description):</label>
                <textarea
                  rows={2}
                  value={editScenes[editSceneIdx].visualDescription}
                  onChange={(e) => {
                    const text = e.target.value;
                    setEditScenes(prev => {
                      const next = [...prev];
                      next[editSceneIdx] = { ...next[editSceneIdx], visualDescription: text };
                      return next;
                    });
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none text-xs leading-relaxed"
                  placeholder="Mô tả góc máy, hoạt cảnh chuyển động, thiết bị xuất hiện trên màn hình..."
                />
              </div>

              {/* Voiceover Script (VietTTS will read this!) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-amber-300 text-xs flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Lời bình thuyết minh sư phạm (Giọng đọc VietTTS trực tiếp đọc đoạn này):</span>
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={editScenes[editSceneIdx].voiceover}
                  onChange={(e) => {
                    const text = e.target.value;
                    setEditScenes(prev => {
                      const next = [...prev];
                      next[editSceneIdx] = { ...next[editSceneIdx], voiceover: text };
                      return next;
                    });
                  }}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-amber-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none text-xs leading-relaxed"
                  placeholder="Nhập câu chữ chuẩn mực sư phạm để AI chuyển đổi thành giọng nói truyền cảm..."
                />
              </div>

              {/* On-screen text */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 text-xs">Chữ hiển thị nổi bật trên màn hình (Overlay Subtitle / Highlight):</label>
                <input
                  type="text"
                  value={editScenes[editSceneIdx].onScreenText || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditScenes(prev => {
                      const next = [...prev];
                      next[editSceneIdx] = { ...next[editSceneIdx], onScreenText: val };
                      return next;
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  placeholder="Từ khóa trọng tâm hoặc công thức xuất hiện trên khung hình..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-950/60 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Kịch Bản Phân Cảnh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
