'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
  Move,
  Lock,
  Unlock,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  Sliders,
  HelpCircle,
  Pencil
} from 'lucide-react';
import { LessonMindmapData } from './lessonPlanAi';

interface InteractiveMindMapProps {
  mindmap: LessonMindmapData;
  lessonTitle: string;
  subject?: string;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MindmapPositions {
  center: NodePosition;
  branches: NodePosition[];
  subItems: Record<string, NodePosition>;
}

interface DragState {
  type: 'center' | 'branch' | 'sub';
  branchIdx?: number;
  subIdx?: number;
  startX: number;
  startY: number;
  initialNodeX: number;
  initialNodeY: number;
}

interface EditModalState {
  isOpen: boolean;
  type: 'center' | 'branch' | 'sub';
  branchIdx?: number;
  subIdx?: number;
  title: string;
  value: string;
}

export const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({
  mindmap,
  lessonTitle,
  subject = 'Bộ môn'
}) => {
  // 1. Quản lý trạng thái nội dung (Có thể chỉnh sửa)
  const [editableMindmap, setEditableMindmap] = useState<LessonMindmapData>(() => mindmap || {
    centralTopic: lessonTitle || 'Chủ đề bài học',
    branches: [],
    mermaidCode: ''
  });

  useEffect(() => {
    if (mindmap) {
      setEditableMindmap(mindmap);
    }
  }, [mindmap]);

  const branches = editableMindmap?.branches || [];
  const centralTopic = editableMindmap?.centralTopic || lessonTitle || 'Chủ đề bài học';

  // 2. Trạng thái hiển thị & Chế độ
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeBranchIdx, setActiveBranchIdx] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedMermaid, setCopiedMermaid] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'diagram' | 'cards' | 'code'>('diagram');
  const [isDragMode, setIsDragMode] = useState<boolean>(true); // Bật chế độ di chuyển mặc định
  const [showHelpHint, setShowHelpHint] = useState<boolean>(true);

  // 3. Quản lý Toạ độ động của các khung nội dung
  const generateDefaultPositions = (bList: typeof branches): MindmapPositions => {
    const defaultSubSlots = [
      [70, 142, 214, 286, 358],   // Nhánh 0: Top-Left
      [70, 142, 214, 286, 358],   // Nhánh 1: Top-Right
      [530, 602, 674, 746, 818],  // Nhánh 2: Bottom-Left
      [530, 602, 674, 746, 818]   // Nhánh 3: Bottom-Right
    ];

    const subPos: Record<string, NodePosition> = {};
    bList.slice(0, 4).forEach((b, bIdx) => {
      const isLeft = bIdx === 0 || bIdx === 2;
      const subX = isLeft ? 30 : 1300;
      const slots = defaultSubSlots[bIdx] || [70, 142, 214, 286];
      (b.subItems || []).forEach((_, sIdx) => {
        const subY = slots[sIdx] ?? (slots[slots.length - 1] + (sIdx - slots.length + 1) * 72);
        subPos[`${bIdx}_${sIdx}`] = { x: subX, y: subY, width: 290, height: 56 };
      });
    });

    return {
      center: { x: 670, y: 415, width: 280, height: 90 },
      branches: [
        { x: 360, y: 190, width: 270, height: 74 },
        { x: 990, y: 190, width: 270, height: 74 },
        { x: 360, y: 650, width: 270, height: 74 },
        { x: 990, y: 650, width: 270, height: 74 }
      ],
      subItems: subPos
    };
  };

  const [positions, setPositions] = useState<MindmapPositions>(() =>
    generateDefaultPositions(editableMindmap?.branches || [])
  );

  // Cập nhật toạ độ khi số lượng nhánh thay đổi
  useEffect(() => {
    setPositions(prev => {
      const def = generateDefaultPositions(branches);
      return {
        center: prev.center || def.center,
        branches: prev.branches.length === 4 ? prev.branches : def.branches,
        subItems: { ...def.subItems, ...prev.subItems }
      };
    });
  }, [branches.length]);

  const handleResetPositions = () => {
    setPositions(generateDefaultPositions(branches));
  };

  // 4. Cơ chế Kéo thả di chuyển (Drag & Drop)
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Helper chuyển đổi toạ độ màn hình sang toạ độ SVG 1620x920
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const screenCTM = svg.getScreenCTM();
    if (screenCTM) {
      const svgPoint = pt.matrixTransform(screenCTM.inverse());
      return { x: svgPoint.x, y: svgPoint.y };
    }
    const rect = svg.getBoundingClientRect();
    const scaleX = 1620 / (rect.width || 1);
    const scaleY = 920 / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStartDrag = (
    e: React.MouseEvent | React.TouchEvent,
    type: 'center' | 'branch' | 'sub',
    branchIdx?: number,
    subIdx?: number
  ) => {
    if (!isDragMode) return;
    if ((e.target as HTMLElement)?.closest?.('.no-drag')) return;
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const svgCoord = getSvgCoordinates(clientX, clientY);

    let initialX = 0;
    let initialY = 0;
    if (type === 'center') {
      initialX = positions.center.x;
      initialY = positions.center.y;
    } else if (type === 'branch' && branchIdx !== undefined) {
      initialX = positions.branches[branchIdx]?.x ?? 360;
      initialY = positions.branches[branchIdx]?.y ?? 190;
    } else if (type === 'sub' && branchIdx !== undefined && subIdx !== undefined) {
      const pos = positions.subItems[`${branchIdx}_${subIdx}`];
      initialX = pos?.x ?? 30;
      initialY = pos?.y ?? 70;
    }

    setDragState({
      type,
      branchIdx,
      subIdx,
      startX: svgCoord.x,
      startY: svgCoord.y,
      initialNodeX: initialX,
      initialNodeY: initialY
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      const svgCoord = getSvgCoordinates(clientX, clientY);
      const dx = svgCoord.x - dragState.startX;
      const dy = svgCoord.y - dragState.startY;

      setPositions(prev => {
        if (dragState.type === 'center') {
          return {
            ...prev,
            center: {
              ...prev.center,
              x: Math.round(Math.max(10, Math.min(1330, dragState.initialNodeX + dx))),
              y: Math.round(Math.max(10, Math.min(820, dragState.initialNodeY + dy)))
            }
          };
        } else if (dragState.type === 'branch' && dragState.branchIdx !== undefined) {
          const newBranches = [...prev.branches];
          newBranches[dragState.branchIdx] = {
            ...newBranches[dragState.branchIdx],
            x: Math.round(Math.max(10, Math.min(1340, dragState.initialNodeX + dx))),
            y: Math.round(Math.max(10, Math.min(830, dragState.initialNodeY + dy)))
          };
          return { ...prev, branches: newBranches };
        } else if (
          dragState.type === 'sub' &&
          dragState.branchIdx !== undefined &&
          dragState.subIdx !== undefined
        ) {
          const key = `${dragState.branchIdx}_${dragState.subIdx}`;
          const current = prev.subItems[key] || { x: 30, y: 70, width: 290, height: 56 };
          return {
            ...prev,
            subItems: {
              ...prev.subItems,
              [key]: {
                ...current,
                x: Math.round(Math.max(10, Math.min(1320, dragState.initialNodeX + dx))),
                y: Math.round(Math.max(10, Math.min(850, dragState.initialNodeY + dy)))
              }
            }
          };
        }
        return prev;
      });
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [dragState]);

  // 5. Đường cong Bézier kết nối động theo toạ độ mới nhất
  const calculateConnectingPath = (fromRect: NodePosition, toRect: NodePosition) => {
    if (!fromRect || !toRect) return '';
    const fromCenter = { x: fromRect.x + fromRect.width / 2, y: fromRect.y + fromRect.height / 2 };
    const toCenter = { x: toRect.x + toRect.width / 2, y: toRect.y + toRect.height / 2 };

    let startX: number, startY: number, endX: number, endY: number;

    if (toCenter.x > fromCenter.x) {
      startX = fromRect.x + fromRect.width;
      startY = fromCenter.y;
      endX = toRect.x;
      endY = toCenter.y;
    } else {
      startX = fromRect.x;
      startY = fromCenter.y;
      endX = toRect.x + toRect.width;
      endY = toCenter.y;
    }

    const deltaX = Math.abs(endX - startX);
    const controlOffsetX = Math.max(30, Math.min(130, deltaX * 0.45));
    const cp1X = toCenter.x > fromCenter.x ? startX + controlOffsetX : startX - controlOffsetX;
    const cp2X = toCenter.x > fromCenter.x ? endX - controlOffsetX : endX + controlOffsetX;

    return `M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`;
  };

  // 6. Quản lý Chỉnh sửa Nội dung
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    type: 'center',
    title: '',
    value: ''
  });

  const openEditModal = (
    type: 'center' | 'branch' | 'sub',
    branchIdx?: number,
    subIdx?: number
  ) => {
    let initialVal = '';
    let modalTitle = '';

    if (type === 'center') {
      initialVal = centralTopic;
      modalTitle = 'Chủ đề bài học (Khối Trung Tâm)';
    } else if (type === 'branch' && branchIdx !== undefined) {
      initialVal = branches[branchIdx]?.title || '';
      modalTitle = `Tiêu đề Nhánh ${branchIdx + 1}`;
    } else if (type === 'sub' && branchIdx !== undefined && subIdx !== undefined) {
      initialVal = branches[branchIdx]?.subItems?.[subIdx] || '';
      modalTitle = `Nội dung kiến thức con (#${subIdx + 1} - Nhánh ${branchIdx + 1})`;
    }

    setEditModal({
      isOpen: true,
      type,
      branchIdx,
      subIdx,
      title: modalTitle,
      value: initialVal
    });
  };

  const handleSaveEdit = () => {
    const trimmed = editModal.value.trim();
    if (!trimmed) return;

    setEditableMindmap(prev => {
      const next = { ...prev };
      if (editModal.type === 'center') {
        next.centralTopic = trimmed;
      } else if (editModal.type === 'branch' && editModal.branchIdx !== undefined) {
        next.branches = [...prev.branches];
        next.branches[editModal.branchIdx] = {
          ...next.branches[editModal.branchIdx],
          title: trimmed
        };
      } else if (
        editModal.type === 'sub' &&
        editModal.branchIdx !== undefined &&
        editModal.subIdx !== undefined
      ) {
        next.branches = [...prev.branches];
        const newSubItems = [...next.branches[editModal.branchIdx].subItems];
        newSubItems[editModal.subIdx] = trimmed;
        next.branches[editModal.branchIdx] = {
          ...next.branches[editModal.branchIdx],
          subItems: newSubItems
        };
      }
      return next;
    });

    setEditModal(prev => ({ ...prev, isOpen: false }));
  };

  // Thêm nội dung con mới vào nhánh
  const handleAddSubItem = (bIdx: number) => {
    setEditableMindmap(prev => {
      const next = { ...prev };
      next.branches = [...prev.branches];
      const currentSubs = next.branches[bIdx].subItems || [];
      next.branches[bIdx] = {
        ...next.branches[bIdx],
        subItems: [...currentSubs, `Ý kiến thức mới #${currentSubs.length + 1}`]
      };
      return next;
    });
  };

  // Xóa nội dung con
  const handleDeleteSubItem = (bIdx: number, sIdx: number) => {
    setEditableMindmap(prev => {
      const next = { ...prev };
      next.branches = [...prev.branches];
      const newSubs = next.branches[bIdx].subItems.filter((_, idx) => idx !== sIdx);
      next.branches[bIdx] = {
        ...next.branches[bIdx],
        subItems: newSubs
      };
      return next;
    });
  };

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

  // Helper bẻ dòng SVG nhiều dòng tránh bị cắt chữ
  const wrapSvgText = (text: string, maxCharsPerLine = 32): string[] => {
    if (!text) return [];
    const words = text.trim().split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length > 2) {
      const line2 = lines.slice(1).join(' ');
      lines.splice(1, lines.length - 1, line2.length > maxCharsPerLine ? line2.substring(0, maxCharsPerLine - 3) + '...' : line2);
    }
    return lines;
  };

  // Tải trực tiếp dạng ảnh PNG với độ phân giải cao 2x: 3240 x 1840 (Phản ánh chính xác vị trí & nội dung mới nhất)
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
        canvas.width = 3240;
        canvas.height = 1840;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bgGrad = ctx.createLinearGradient(0, 0, 3240, 1840);
          bgGrad.addColorStop(0, '#0a1526');
          bgGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.download = `SoDoTuDuy_${(centralTopic || 'Bai_Hoc').replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')}.png`;
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
    a.download = `SoDoTuDuy_${(centralTopic || 'Bai_Hoc').replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')}.svg`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMermaid = () => {
    if (!editableMindmap?.mermaidCode) return;
    navigator.clipboard.writeText(editableMindmap.mermaidCode);
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
              <span>Sơ Đồ Tư Duy Tương Tác & Chỉnh Sửa</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Kéo Thả • Soạn Thảo Tự Do
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Kéo thả di chuyển khung, nhấp đúp để sửa chữ, tải ảnh PNG sắc nét sau khi tùy biến.
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
              Soạn Thảo Thẻ
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

          {/* BẬT / TẮT CHẾ ĐỘ DI CHUYỂN KÉO THẢ */}
          {viewTab === 'diagram' && (
            <button
              type="button"
              onClick={() => setIsDragMode(!isDragMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isDragMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={isDragMode ? 'Đang bật chế độ kéo thả di chuyển vị trí các ô' : 'Đã khóa vị trí, bấm để bật di chuyển'}
            >
              {isDragMode ? <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isDragMode ? '🖐️ Di Chuyển: BẬT' : '🔒 Đã Khóa Vị Trí'}</span>
            </button>
          )}

          {/* KHÔI PHỤC BỐ CỤC CHUẨN */}
          {viewTab === 'diagram' && (
            <button
              type="button"
              onClick={handleResetPositions}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Khôi phục lại vị trí các khung về bố cục 5 cột chuẩn mực ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bố Cục Chuẩn</span>
            </button>
          )}

          {/* Phóng to / thu nhỏ */}
          {viewTab === 'diagram' && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1 font-bold">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.1))}
                className="p-1.5 hover:bg-slate-700 rounded-lg cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
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
            <span>{isFullscreen ? 'Thoát' : '🖥️ Trình Chiếu'}</span>
          </button>

          {/* Tải ảnh PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Tải ảnh sơ đồ tư duy sắc nét chuẩn in ấn & chèn giáo án (Lưu đúng vị trí & nội dung vừa chỉnh)"
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

      {/* BANNER HƯỚNG DẪN TƯƠNG TÁC NHANH */}
      {viewTab === 'diagram' && showHelpHint && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-200 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              💡 <strong>Mẹo giảng dạy & tùy biến:</strong> Nhấp giữ chuột để <strong>kéo thả di chuyển</strong> bất kỳ ô nào theo ý Thầy/Cô. <strong>Nhấp đúp chuột</strong> (hoặc bấm icon bút ✏️) trên ô bất kỳ để chỉnh sửa trực tiếp nội dung!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHelpHint(false)}
            className="text-teal-400 hover:text-white p-1 rounded-lg"
            title="Đóng gợi ý"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KHU VỰC HIỂN THỊ CHÍNH (DIAGRAM VIEW) */}
      {viewTab === 'diagram' && (
        <div className={`relative rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl transition-all ${isFullscreen ? 'flex-1 flex flex-col justify-center' : 'min-h-[620px]'}`}>
          {/* Thanh lọc/Focus từng nhánh khi giảng dạy */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/85 backdrop-blur border border-slate-700 text-xs">
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
                transition: dragState ? 'none' : 'transform 0.2s ease-out'
              }}
            >
              <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1620 920"
                className={`w-[1620px] h-[920px] select-none ${isDragMode ? 'cursor-default' : ''}`}
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
                  <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#38bdf8" floodOpacity="0.7" />
                  </filter>
                </defs>

                {/* 1. CÁC ĐƯỜNG NỐI BEZIER ĐỘNG TỪ TRUNG TÂM RA CÁC NHÁNH CHÍNH */}
                {branches.slice(0, 4).map((_, idx) => {
                  const theme = branchThemes[idx % branchThemes.length];
                  const branchPos = positions.branches[idx] || { x: 360, y: 190, width: 270, height: 74 };
                  const pathD = calculateConnectingPath(positions.center, branchPos);
                  const isAct = activeBranchIdx === idx || activeBranchIdx === null;

                  return (
                    <path
                      key={`center-branch-${idx}`}
                      d={pathD}
                      fill="none"
                      stroke={theme.lightColor}
                      strokeWidth={isAct ? "3.5" : "1.5"}
                      strokeOpacity={isAct ? "0.9" : "0.2"}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* 2. CÁC ĐƯỜNG NỐI TỪ NHÁNH CHÍNH TỚI CÁC SUB-ITEMS */}
                {branches.slice(0, 4).map((b, bIdx) => {
                  const theme = branchThemes[bIdx % branchThemes.length];
                  const branchPos = positions.branches[bIdx] || { x: 360, y: 190, width: 270, height: 74 };
                  const isHighlighted = activeBranchIdx === bIdx;

                  return (b.subItems || []).slice(0, 4).map((_, sIdx) => {
                    const subPos = positions.subItems[`${bIdx}_${sIdx}`] || { x: 30, y: 70, width: 290, height: 56 };
                    const curvePath = calculateConnectingPath(branchPos, subPos);

                    return (
                      <path
                        key={`branch-sub-${bIdx}-${sIdx}`}
                        d={curvePath}
                        fill="none"
                        stroke={theme.lightColor}
                        strokeWidth="1.5"
                        strokeOpacity="0.75"
                        strokeDasharray={isHighlighted ? undefined : "4 2"}
                      />
                    );
                  });
                })}

                {/* 3. KHỐI TRUNG TÂM (CENTRAL NODE) - CÓ THỂ KÉO THẢ & CHỈNH SỬA */}
                <g
                  transform={`translate(${positions.center.x}, ${positions.center.y})`}
                  className={isDragMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                  onMouseDown={(e) => handleStartDrag(e, 'center')}
                  onTouchStart={(e) => handleStartDrag(e, 'center')}
                  onDoubleClick={() => openEditModal('center')}
                >
                  <rect
                    x="0"
                    y="0"
                    width={positions.center.width}
                    height={positions.center.height}
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

                  {/* Nút chỉnh sửa nhỏ */}
                  <g
                    className="no-drag cursor-pointer hover:opacity-80"
                    onClick={(e) => { e.stopPropagation(); openEditModal('center'); }}
                    transform="translate(242, 10)"
                  >
                    <rect x="0" y="0" width="24" height="20" rx="5" fill="#0f172a" fillOpacity="0.6" stroke="#38bdf8" strokeWidth="1" />
                    <text x="12" y="14" textAnchor="middle" fill="#38bdf8" fontSize="11">✏️</text>
                  </g>

                  {/* Icon & Tiêu đề bài học */}
                  <text x="32" y="60" fill="#ffffff" fontSize="24">🧠</text>
                  {(() => {
                    const centerLines = wrapSvgText(centralTopic, 25);
                    if (centerLines.length <= 1) {
                      return (
                        <>
                          <text x="70" y="52" fill="#ffffff" fontSize="13.5" fontWeight="bold" fontFamily="Arial">
                            {centerLines[0] || centralTopic}
                          </text>
                          <text x="70" y="70" fill="#bae6fd" fontSize="10" fontFamily="Arial">
                            SƠ ĐỒ TỔNG HỢP KIẾN THỨC
                          </text>
                        </>
                      );
                    }
                    return (
                      <>
                        <text x="70" y="46" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="Arial">
                          {centerLines[0]}
                        </text>
                        <text x="70" y="62" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="Arial">
                          {centerLines[1]}
                        </text>
                        <text x="70" y="76" fill="#bae6fd" fontSize="9.5" fontFamily="Arial">
                          SƠ ĐỒ TỔNG HỢP KIẾN THỨC
                        </text>
                      </>
                    );
                  })()}
                </g>

                {/* 4. VẼ 4 NHÁNH VÀ CÁC SUB-ITEMS - TỰ DO DI CHUYỂN & SỬA CHỮ */}
                {branches.slice(0, 4).map((b, bIdx) => {
                  const theme = branchThemes[bIdx % branchThemes.length];
                  const isDimmed = activeBranchIdx !== null && activeBranchIdx !== bIdx;
                  const isHighlighted = activeBranchIdx === bIdx;
                  const branchPos = positions.branches[bIdx] || { x: 360, y: 190, width: 270, height: 74 };

                  return (
                    <g
                      key={`branch-group-${bIdx}`}
                      opacity={isDimmed ? 0.25 : 1}
                      className="transition-opacity duration-300"
                    >
                      {/* THẺ NHÁNH CHÍNH */}
                      <g
                        transform={`translate(${branchPos.x}, ${branchPos.y})`}
                        className={isDragMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                        onMouseDown={(e) => handleStartDrag(e, 'branch', bIdx)}
                        onTouchStart={(e) => handleStartDrag(e, 'branch', bIdx)}
                        onDoubleClick={() => openEditModal('branch', bIdx)}
                        onClick={() => {
                          if (!isDragMode) setActiveBranchIdx(isHighlighted ? null : bIdx);
                        }}
                      >
                        <rect
                          x="0"
                          y="0"
                          width={branchPos.width}
                          height={branchPos.height}
                          rx="16"
                          fill={`url(#grad${bIdx})`}
                          stroke={theme.lightColor}
                          strokeWidth={isHighlighted ? "3" : "1.5"}
                          filter={isHighlighted ? "url(#activeGlow)" : "url(#nodeGlow)"}
                        />

                        {/* Badge số thứ tự nhánh */}
                        <circle cx="26" cy="37" r="14" fill="#0f172a" fillOpacity="0.4" />
                        <text
                          x="26"
                          y="42"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="bold"
                          fontFamily="Arial"
                        >
                          {bIdx + 1}
                        </text>

                        {/* Nút sửa bút chì góc phải */}
                        <g
                          className="no-drag cursor-pointer hover:opacity-80"
                          onClick={(e) => { e.stopPropagation(); openEditModal('branch', bIdx); }}
                          transform="translate(236, 10)"
                        >
                          <rect x="0" y="0" width="22" height="18" rx="4" fill="#0f172a" fillOpacity="0.4" stroke={theme.lightColor} strokeWidth="0.8" />
                          <text x="11" y="13" textAnchor="middle" fill="#ffffff" fontSize="9.5">✏️</text>
                        </g>

                        {/* Tiêu đề nhánh */}
                        <text
                          x="48"
                          y="33"
                          fill="#ffffff"
                          fontSize="13"
                          fontWeight="bold"
                          fontFamily="Arial"
                        >
                          {b.title.length > 23 ? b.title.substring(0, 23) + '...' : b.title}
                        </text>
                        <text
                          x="48"
                          y="53"
                          fill={theme.textCol}
                          fontSize="10.5"
                          fontFamily="Arial"
                        >
                          {(b.subItems || []).length} nội dung trọng tâm cốt lõi
                        </text>
                      </g>

                      {/* CÁC THẺ CON (SUB-ITEMS) CỦA NHÁNH NÀY */}
                      {(b.subItems || []).slice(0, 4).map((item, sIdx) => {
                        const subPos = positions.subItems[`${bIdx}_${sIdx}`] || { x: 30, y: 70, width: 290, height: 56 };
                        const subLines = wrapSvgText(item, 32);

                        return (
                          <g
                            key={`sub-node-${bIdx}-${sIdx}`}
                            transform={`translate(${subPos.x}, ${subPos.y})`}
                            className={isDragMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                            onMouseDown={(e) => handleStartDrag(e, 'sub', bIdx, sIdx)}
                            onTouchStart={(e) => handleStartDrag(e, 'sub', bIdx, sIdx)}
                            onDoubleClick={() => openEditModal('sub', bIdx, sIdx)}
                          >
                            <rect
                              x="0"
                              y="0"
                              width={subPos.width}
                              height={subPos.height}
                              rx="12"
                              fill="#0f172a"
                              stroke={theme.border}
                              strokeWidth={isHighlighted ? "2" : "1"}
                            />

                            {/* Nút sửa bút chì góc phải */}
                            <g
                              className="no-drag cursor-pointer hover:opacity-80"
                              onClick={(e) => { e.stopPropagation(); openEditModal('sub', bIdx, sIdx); }}
                              transform="translate(262, 8)"
                            >
                              <rect x="0" y="0" width="18" height="16" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="0.8" />
                              <text x="9" y="12" textAnchor="middle" fill="#94a3b8" fontSize="8.5">✏️</text>
                            </g>

                            {/* Chấm tròn số thứ tự */}
                            <circle cx="18" cy="28" r="8" fill={theme.color} />
                            <text
                              x="18"
                              y="32"
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="bold"
                              fontFamily="Arial"
                            >
                              {sIdx + 1}
                            </text>

                            {/* Văn bản hiển thị bẻ dòng 2 hàng */}
                            {subLines.length <= 1 ? (
                              <text
                                x="34"
                                y="33"
                                fill="#f1f5f9"
                                fontSize="11"
                                fontWeight="500"
                                fontFamily="Arial"
                              >
                                {subLines[0]}
                              </text>
                            ) : (
                              <text
                                x="34"
                                y="23"
                                fill="#f1f5f9"
                                fontSize="10.5"
                                fontWeight="500"
                                fontFamily="Arial"
                              >
                                <tspan x="34" dy="0">{subLines[0]}</tspan>
                                <tspan x="34" dy="16">{subLines[1]}</tspan>
                              </text>
                            )}
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

      {/* CHẾ ĐỘ XEM 2: SOẠN THẢO THẺ CHI TIẾT (CARDS VIEW) */}
      {viewTab === 'cards' && (
        <div className="space-y-4 animate-fade-in">
          {/* Sửa chủ đề bài học trung tâm */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-teal-300 mb-1 block">
                🧠 Chủ Đề Bài Học Trung Tâm (Central Topic):
              </label>
              <input
                type="text"
                value={centralTopic}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditableMindmap(prev => ({ ...prev, centralTopic: val }));
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-teal-500"
                placeholder="Nhập chủ đề trọng tâm bài dạy..."
              />
            </div>
            <button
              type="button"
              onClick={handleResetPositions}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Bố Cục Chuẩn</span>
            </button>
          </div>

          {/* Danh sách 4 nhánh có thể soạn thảo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b, idx) => {
              const theme = branchThemes[idx % branchThemes.length];
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border-2 space-y-3 shadow-md transition-all"
                  style={{
                    backgroundColor: `${theme.bgColor}20`,
                    borderColor: `${theme.border}60`
                  }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${theme.color}30`, color: theme.lightColor }}>
                        Nhánh #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddSubItem(idx)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1 cursor-pointer shadow"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm Ý</span>
                      </button>
                    </div>
                    {/* Sửa tiêu đề nhánh */}
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-white shadow shrink-0"
                        style={{ backgroundColor: theme.color }}
                      >
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={b.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditableMindmap(prev => {
                            const next = { ...prev };
                            next.branches = [...prev.branches];
                            next.branches[idx] = { ...next.branches[idx], title: val };
                            return next;
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-teal-500"
                        placeholder="Tiêu đề nhánh..."
                      />
                    </div>
                  </div>

                  {/* Danh sách các sub-items */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/40">
                    {(b.subItems || []).map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-700/60"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={sub}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditableMindmap(prev => {
                              const next = { ...prev };
                              next.branches = [...prev.branches];
                              const newSubs = [...next.branches[idx].subItems];
                              newSubs[sIdx] = val;
                              next.branches[idx] = { ...next.branches[idx], subItems: newSubs };
                              return next;
                            });
                          }}
                          className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none focus:text-white"
                          placeholder="Nội dung kiến thức..."
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteSubItem(idx, sIdx)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                          title="Xóa ý này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
            {editableMindmap?.mermaidCode || '// Chưa có mã Mermaid'}
          </pre>
        </div>
      )}

      {/* MODAL CHỈNH SỬA NHANH KHI DOUBLE CLICK HOẶC BẤM ICON BÚT */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-bold">
                  ✏️
                </span>
                <span>Chỉnh Sửa Nội Dung Ô</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                {editModal.title}
              </label>
              <textarea
                value={editModal.value}
                onChange={(e) => setEditModal(prev => ({ ...prev, value: e.target.value }))}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-teal-500/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Nhập nội dung mới..."
                autoFocus
              />
              <p className="text-[11px] text-slate-500">
                Chữ sẽ tự động bẻ dòng thông minh khi hiển thị trên sơ đồ tư duy và khi xuất ảnh.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
