'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Network,
  Eye,
  ChevronRight,
  Tv,
  FileImage,
  CheckCircle2
} from 'lucide-react';
import { LessonMindmapData } from './lessonPlanAi';

interface InteractiveMindMapProps {
  mindmap: LessonMindmapData;
  lessonTitle: string;
  subject?: string;
}

export const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({
  mindmap,
  lessonTitle,
  subject = 'Bộ môn'
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeBranchIdx, setActiveBranchIdx] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedMermaid, setCopiedMermaid] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'diagram' | 'cards' | 'code'>('diagram');

  const svgRef = useRef<SVGSVGElement>(null);

  const branches = mindmap?.branches || [];
  const centralTopic = mindmap?.centralTopic || lessonTitle || 'Chủ đề bài học';

  // Định nghĩa màu sắc cho 4 nhánh kiến thức
  const branchThemes = [
    {
      id: 0,
      name: 'Nhánh 1: Mục tiêu',
      color: '#0284c7',
      lightColor: '#38bdf8',
      bgColor: '#0c4a6e',
      border: '#0284c7',
      glow: 'rgba(56, 189, 248, 0.4)',
      textCol: '#e0f2fe'
    },
    {
      id: 1,
      name: 'Nhánh 2: Khái niệm',
      color: '#7c3aed',
      lightColor: '#c084fc',
      bgColor: '#4c1d95',
      border: '#7c3aed',
      glow: 'rgba(192, 132, 252, 0.4)',
      textCol: '#f3e8ff'
    },
    {
      id: 2,
      name: 'Nhánh 3: Quy trình',
      color: '#059669',
      lightColor: '#34d399',
      bgColor: '#064e3b',
      border: '#059669',
      glow: 'rgba(52, 211, 153, 0.4)',
      textCol: '#d1fae5'
    },
    {
      id: 3,
      name: 'Nhánh 4: Vận dụng',
      color: '#d97706',
      lightColor: '#fbbf24',
      bgColor: '#78350f',
      border: '#d97706',
      glow: 'rgba(251, 191, 36, 0.4)',
      textCol: '#fef3c7'
    }
  ];

  // Tải trực tiếp dạng ảnh PNG (chụp từ SVG với độ phân giải cao 2x)
  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2200;
        canvas.height = 1360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Tạo nền gradient sang trọng chuẩn công nghệ giáo dục
          const bgGrad = ctx.createLinearGradient(0, 0, 2200, 1360);
          bgGrad.addColorStop(0, '#0a1526');
          bgGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.download = `SoDoTuDuy_${(lessonTitle || 'Bai_Hoc').replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')}.png`;
          a.href = pngUrl;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch (err) {
      console.warn('Lỗi xuất PNG, chuyển sang tải SVG:', err);
      handleDownloadSvg();
    }
  };

  // Tải file SVG vector nguyên bản
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgString = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `SoDoTuDuy_${(lessonTitle || 'Bai_Hoc').replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')}.svg`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMermaid = () => {
    if (!mindmap?.mermaidCode) return;
    navigator.clipboard.writeText(mindmap.mermaidCode);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-auto flex flex-col' : ''}`}>
      {/* THANH ĐIỀU KHIỂN SƠ ĐỒ TƯ DUY */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 backdrop-blur shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Sơ Đồ Tư Duy Bài Học Trực Quan</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                4 Nhánh Chuẩn GDPT 2018
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Chiếu giảng dạy tương tác trên lớp hoặc tải ảnh độ nét cao chèn vào giáo án.
            </p>
          </div>
        </div>

        {/* NÚT CHỨC NĂNG */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chuyển chế độ xem */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewTab('diagram')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewTab === 'diagram' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trực Quan
            </button>
            <button
              type="button"
              onClick={() => setViewTab('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewTab === 'cards' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thẻ Nhánh
            </button>
            <button
              type="button"
              onClick={() => setViewTab('code')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewTab === 'code' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mã Mermaid
            </button>
          </div>

          {/* Phóng to / thu nhỏ */}
          {viewTab === 'diagram' && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1 font-bold">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { setZoomLevel(1); setActiveBranchIdx(null); }}
                className="p-1.5 hover:bg-slate-700 rounded-lg cursor-pointer text-slate-400 hover:text-white"
                title="Khôi phục góc nhìn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Nút Giảng dạy toàn màn hình */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
            }`}
            title="Bật/Tắt chế độ trình chiếu giảng dạy trên màn hình lớp học"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            <span>{isFullscreen ? 'Thoát Trình Chiếu' : '🖥️ Giảng Dạy Trên Lớp'}</span>
          </button>

          {/* Tải ảnh PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Tải ảnh sơ đồ tư duy sắc nét chuẩn in ấn & chèn giáo án"
          >
            <FileImage className="w-4 h-4" />
            <span>Tải Ảnh PNG</span>
          </button>

          {/* Tải file Vector SVG */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Tải định dạng Vector SVG để chèn trực tiếp vào PowerPoint"
          >
            <Download className="w-4 h-4" />
            <span>Tải SVG</span>
          </button>
        </div>
      </div>

      {/* KHU VỰC HIỂN THỊ CHÍNH */}
      {viewTab === 'diagram' && (
        <div className={`relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl transition-all ${isFullscreen ? 'flex-1 flex flex-col justify-center' : 'min-h-[560px]'}`}>
          {/* Thanh lọc/Focus từng nhánh khi giảng dạy */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-700 text-xs">
            <span className="text-slate-400 font-semibold px-2">Lấy nét nhánh:</span>
            <button
              type="button"
              onClick={() => setActiveBranchIdx(null)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeBranchIdx === null ? 'bg-teal-500 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Toàn Bộ
            </button>
            {branches.map((b, idx) => {
              const theme = branchThemes[idx % branchThemes.length];
              const isAct = activeBranchIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveBranchIdx(isAct ? null : idx)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isAct ? 'text-white shadow' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  style={{ backgroundColor: isAct ? theme.color : undefined }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.lightColor }} />
                  <span>Nhánh {idx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* SVG SƠ ĐỒ TƯ DUY TRỰC TIẾP */}
          <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1120 700"
                className="w-[1120px] h-[700px] select-none"
              >
                <defs>
                  {/* Gradient trung tâm */}
                  <linearGradient id="centerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>

                  {/* Gradient cho từng nhánh */}
                  <linearGradient id="grad0" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#5b21b6" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#065f46" />
                  </linearGradient>
                  <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>

                  {/* Filter đổ bóng Glow */}
                  <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* 1. ĐƯỜNG NỐI BEZIER TỪ TRUNG TÂM RA 4 NHÁNH CHÍNH */}
                {/* Đường nối sang Nhánh 0 (Top Left) */}
                <path
                  d="M 420 350 C 340 350, 360 160, 280 160"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={activeBranchIdx === 0 || activeBranchIdx === null ? "3.5" : "1.5"}
                  strokeOpacity={activeBranchIdx === 0 || activeBranchIdx === null ? "0.9" : "0.2"}
                  strokeLinecap="round"
                />
                {/* Đường nối sang Nhánh 1 (Top Right) */}
                <path
                  d="M 700 350 C 780 350, 760 160, 840 160"
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth={activeBranchIdx === 1 || activeBranchIdx === null ? "3.5" : "1.5"}
                  strokeOpacity={activeBranchIdx === 1 || activeBranchIdx === null ? "0.9" : "0.2"}
                  strokeLinecap="round"
                />
                {/* Đường nối sang Nhánh 2 (Bottom Left) */}
                <path
                  d="M 420 350 C 340 350, 360 540, 280 540"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={activeBranchIdx === 2 || activeBranchIdx === null ? "3.5" : "1.5"}
                  strokeOpacity={activeBranchIdx === 2 || activeBranchIdx === null ? "0.9" : "0.2"}
                  strokeLinecap="round"
                />
                {/* Đường nối sang Nhánh 3 (Bottom Right) */}
                <path
                  d="M 700 350 C 780 350, 760 540, 840 540"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={activeBranchIdx === 3 || activeBranchIdx === null ? "3.5" : "1.5"}
                  strokeOpacity={activeBranchIdx === 3 || activeBranchIdx === null ? "0.9" : "0.2"}
                  strokeLinecap="round"
                />

                {/* 2. KHỐI TRUNG TÂM (CENTRAL NODE) */}
                <g transform="translate(420, 305)" className="cursor-pointer" onClick={() => setActiveBranchIdx(null)}>
                  <rect
                    x="0"
                    y="0"
                    width="280"
                    height="90"
                    rx="20"
                    fill="url(#centerGrad)"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    filter="url(#nodeGlow)"
                  />
                  {/* Badge Môn Học */}
                  <rect x="20" y="10" width="130" height="20" rx="6" fill="#0f172a" fillOpacity="0.6" />
                  <text x="85" y="24" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="Arial">
                    {subject.toUpperCase()} • GDPT 2018
                  </text>

                  {/* Icon & Tiêu đề bài học */}
                  <text x="35" y="60" fill="#ffffff" fontSize="24">🧠</text>
                  <text
                    x="75"
                    y="52"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="Arial"
                  >
                    {centralTopic.length > 24 ? centralTopic.substring(0, 24) + '...' : centralTopic}
                  </text>
                  <text x="75" y="72" fill="#bae6fd" fontSize="10.5" fontFamily="Arial">
                    SƠ ĐỒ TỔNG HỢP KIẾN THỨC
                  </text>
                </g>

                {/* 3. VẼ 4 NHÁNH VÀ CÁC ĐIỂM KIẾN THỨC CON (SUB-ITEMS) */}
                {branches.slice(0, 4).map((b, idx) => {
                  const theme = branchThemes[idx % branchThemes.length];
                  const isDimmed = activeBranchIdx !== null && activeBranchIdx !== idx;
                  const isHighlighted = activeBranchIdx === idx;

                  // Tọa độ gốc của nhánh
                  const config = [
                    { bx: 80, by: 125, subDir: 'left', subYStart: 70 },   // Nhánh 0: Top-Left
                    { bx: 780, by: 125, subDir: 'right', subYStart: 70 }, // Nhánh 1: Top-Right
                    { bx: 80, by: 505, subDir: 'left', subYStart: 450 },  // Nhánh 2: Bottom-Left
                    { bx: 780, by: 505, subDir: 'right', subYStart: 450 } // Nhánh 3: Bottom-Right
                  ][idx];

                  return (
                    <g
                      key={idx}
                      opacity={isDimmed ? 0.25 : 1}
                      className="transition-all duration-300 cursor-pointer"
                      onClick={() => setActiveBranchIdx(isHighlighted ? null : idx)}
                    >
                      {/* Thẻ Tiêu Đề Nhánh */}
                      <rect
                        x={config.bx}
                        y={config.by}
                        width="260"
                        height="65"
                        rx="14"
                        fill={`url(#grad${idx})`}
                        stroke={theme.lightColor}
                        strokeWidth={isHighlighted ? "3" : "1.5"}
                        filter="url(#nodeGlow)"
                      />
                      <text
                        x={config.bx + 20}
                        y={config.by + 28}
                        fill="#ffffff"
                        fontSize="12.5"
                        fontWeight="bold"
                        fontFamily="Arial"
                      >
                        {b.title}
                      </text>
                      <text
                        x={config.bx + 20}
                        y={config.by + 48}
                        fill={theme.textCol}
                        fontSize="10"
                        fontFamily="Arial"
                      >
                        {b.subItems.length} nội dung trọng tâm cốt lõi
                      </text>

                      {/* Các node con (Sub-items) */}
                      {b.subItems.slice(0, 3).map((item, sIdx) => {
                        const subY = config.subYStart + sIdx * 54;
                        const subX = config.subDir === 'left' ? config.bx : config.bx + 40;

                        // Đường nối từ nhánh chính tới từng node con
                        const curvePath = config.subDir === 'left'
                          ? `M ${config.bx + 200} ${config.by + 32} C ${config.bx + 230} ${config.by + 32}, ${subX + 230} ${subY + 20}, ${subX + 220} ${subY + 20}`
                          : `M ${config.bx + 60} ${config.by + 32} C ${config.bx + 30} ${config.by + 32}, ${subX + 30} ${subY + 20}, ${subX + 40} ${subY + 20}`;

                        return (
                          <g key={sIdx}>
                            <path
                              d={curvePath}
                              fill="none"
                              stroke={theme.lightColor}
                              strokeWidth="1.5"
                              strokeOpacity="0.7"
                              strokeDasharray={isHighlighted ? undefined : "4 2"}
                            />
                            {/* Card Node Con */}
                            <rect
                              x={subX}
                              y={subY}
                              width="220"
                              height="40"
                              rx="10"
                              fill="#0f172a"
                              stroke={theme.border}
                              strokeWidth={isHighlighted ? "1.5" : "1"}
                            />
                            {/* Chấm tròn chỉ số */}
                            <circle cx={subX + 16} cy={subY + 20} r="6" fill={theme.lightColor} />
                            <text
                              x={subX + 30}
                              y={subY + 24}
                              fill="#f1f5f9"
                              fontSize="10"
                              fontFamily="Arial"
                            >
                              {item.length > 28 ? item.substring(0, 28) + '...' : item}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ XEM 2: THẺ NHÁNH CHI TIẾT (CARDS VIEW) */}
      {viewTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {branches.map((b, idx) => {
            const theme = branchThemes[idx % branchThemes.length];
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border-2 space-y-3 shadow-md transition-all hover:scale-[1.01]"
                style={{
                  backgroundColor: `${theme.bgColor}20`,
                  borderColor: `${theme.border}60`
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-white shadow"
                      style={{ backgroundColor: theme.color }}
                    >
                      {idx + 1}
                    </span>
                    <span>{b.title}</span>
                  </h4>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${theme.color}30`, color: theme.lightColor }}
                  >
                    Trọng tâm #{idx + 1}
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-200 pl-1">
                  {b.subItems.map((sub, sIdx) => (
                    <li
                      key={sIdx}
                      className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-700/50"
                    >
                      <CheckCircle2
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color: theme.lightColor }}
                      />
                      <span className="leading-relaxed">{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* CHẾ ĐỘ XEM 3: MÃ MERMAID GỐC (CODE VIEW) */}
      {viewTab === 'code' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-300 font-mono">
              Cú pháp Mermaid Mindmap tương thích với Notion, Obsidian, GitHub và Markdown Editor.
            </span>
            <button
              type="button"
              onClick={handleCopyMermaid}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedMermaid ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMermaid ? 'Đã chép mã!' : 'Sao chép mã Mermaid'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono text-teal-300 overflow-x-auto p-4 bg-slate-950 border border-slate-800 rounded-2xl leading-relaxed">
            {mindmap?.mermaidCode || '// Chưa có mã Mermaid'}
          </pre>
        </div>
      )}
    </div>
  );
};