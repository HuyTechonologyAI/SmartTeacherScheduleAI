"use client";

import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Sparkles, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { LessonPlan5512Data, LessonPlan2634Data } from './lessonPlanAi';

interface LessonPlanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  standard: 5512 | 2634;
  plan5512?: LessonPlan5512Data | null;
  plan2634?: LessonPlan2634Data | null;
  onSave5512?: (updated: LessonPlan5512Data) => void;
  onSave2634?: (updated: LessonPlan2634Data) => void;
}

export function LessonPlanEditorModal({
  isOpen,
  onClose,
  standard,
  plan5512,
  plan2634,
  onSave5512,
  onSave2634
}: LessonPlanEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'act1' | 'act2' | 'act3' | 'act4'>('general');

  // Local state for 5512
  const [edit5512, setEdit5512] = useState<LessonPlan5512Data | null>(() => plan5512 ? JSON.parse(JSON.stringify(plan5512)) : null);

  // Local state for 2634
  const [edit2634, setEdit2634] = useState<LessonPlan2634Data | null>(() => plan2634 ? JSON.parse(JSON.stringify(plan2634)) : null);

  // Reset when opened
  React.useEffect(() => {
    if (plan5512) setEdit5512(JSON.parse(JSON.stringify(plan5512)));
    if (plan2634) setEdit2634(JSON.parse(JSON.stringify(plan2634)));
  }, [plan5512, plan2634, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (standard === 5512 && edit5512 && onSave5512) {
      onSave5512(edit5512);
    } else if (standard === 2634 && edit2634 && onSave2634) {
      onSave2634(edit2634);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-sky-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Chỉnh Sửa Kế Hoạch Bài Dạy (Giáo Án)</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-500/30">
                  {standard === 5512 ? 'CV 5512 GDPT' : 'CV 2634 GDNN'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Thầy/Cô có thể chủ động điều chỉnh mọi nội dung trước khi xuất bản file Word (.doc)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-4 pt-3 border-b border-slate-800 overflow-x-auto shrink-0 bg-slate-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'general'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Mục Tiêu & Thiết Bị</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('act1')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'act1'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>⚡ {standard === 5512 ? '2. HĐ 1: Khởi Động' : '2. Bước 1: Mở Đầu'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('act2')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'act2'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🔬 {standard === 5512 ? '3. HĐ 2: Kiến Thức Mới' : '3. Bước 2: Hướng Dẫn Mẫu'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('act3')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'act3'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>⚙️ {standard === 5512 ? '4. HĐ 3: Luyện Tập' : '4. Bước 3: Thực Hành'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('act4')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'act4'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🚀 {standard === 5512 ? '5. HĐ 4: Vận Dụng' : '5. Bước 4: Đánh Giá'}</span>
          </button>
        </div>

        {/* Tab Body Contents (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {standard === 5512 && edit5512 && (
            <>
              {/* TAB GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-bold mb-1">Tên bài dạy:</label>
                      <input
                        type="text"
                        value={edit5512.lessonTitle}
                        onChange={(e) => setEdit5512({ ...edit5512, lessonTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Thời lượng (tiết):</label>
                      <input
                        type="number"
                        value={edit5512.durationMinutes}
                        onChange={(e) => setEdit5512({ ...edit5512, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sky-400 uppercase text-xs">I. MỤC TIÊU BÀI DẠY:</h4>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">1. Về Kiến thức:</label>
                      <textarea
                        rows={2}
                        value={edit5512.objectives.knowledge}
                        onChange={(e) => setEdit5512({
                          ...edit5512,
                          objectives: { ...edit5512.objectives, knowledge: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">2. Về Năng lực:</label>
                      <textarea
                        rows={2}
                        value={edit5512.objectives.competencies}
                        onChange={(e) => setEdit5512({
                          ...edit5512,
                          objectives: { ...edit5512.objectives, competencies: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">3. Về Phẩm chất:</label>
                      <textarea
                        rows={2}
                        value={edit5512.objectives.qualities}
                        onChange={(e) => setEdit5512({
                          ...edit5512,
                          objectives: { ...edit5512.objectives, qualities: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-sky-400 uppercase text-xs">II. THIẾT BỊ DẠY HỌC & HỌC LIỆU SỐ:</h4>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Thiết bị của Giáo viên:</label>
                      <input
                        type="text"
                        value={edit5512.equipment.teacherEquipment}
                        onChange={(e) => setEdit5512({
                          ...edit5512,
                          equipment: { ...edit5512.equipment, teacherEquipment: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Dụng cụ của Học sinh:</label>
                      <input
                        type="text"
                        value={edit5512.equipment.studentEquipment}
                        onChange={(e) => setEdit5512({
                          ...edit5512,
                          equipment: { ...edit5512.equipment, studentEquipment: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB HOẠT ĐỘNG 1: MỞ ĐẦU */}
              {activeTab === 'act1' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tên hoạt động:</label>
                    <input
                      type="text"
                      value={edit5512.activity1Opening.name}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity1Opening: { ...edit5512.activity1Opening, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">a) Mục tiêu hoạt động:</label>
                    <textarea
                      rows={2}
                      value={edit5512.activity1Opening.objective}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity1Opening: { ...edit5512.activity1Opening, objective: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">b) Nội dung (Tình huống thực tiễn):</label>
                    <textarea
                      rows={3}
                      value={edit5512.activity1Opening.content}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity1Opening: { ...edit5512.activity1Opening, content: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">c) Sản phẩm học tập dự kiến:</label>
                    <input
                      type="text"
                      value={edit5512.activity1Opening.product}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity1Opening: { ...edit5512.activity1Opening, product: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">d) Tổ chức thực hiện (4 bước: Giao việc → Thực hiện → Báo cáo → Kết luận):</label>
                    <textarea
                      rows={4}
                      value={edit5512.activity1Opening.implementation}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity1Opening: { ...edit5512.activity1Opening, implementation: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 leading-relaxed font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* TAB HOẠT ĐỘNG 2: KIẾN THỨC MỚI */}
              {activeTab === 'act2' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tên hoạt động:</label>
                    <input
                      type="text"
                      value={edit5512.activity2Knowledge.name}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity2Knowledge: { ...edit5512.activity2Knowledge, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">a) Mục tiêu hoạt động:</label>
                    <textarea
                      rows={2}
                      value={edit5512.activity2Knowledge.objective}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity2Knowledge: { ...edit5512.activity2Knowledge, objective: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">b) Nội dung (Kiến thức cốt lõi & Quy luật):</label>
                    <textarea
                      rows={4}
                      value={edit5512.activity2Knowledge.content}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity2Knowledge: { ...edit5512.activity2Knowledge, content: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">c) Sản phẩm học tập dự kiến:</label>
                    <input
                      type="text"
                      value={edit5512.activity2Knowledge.product}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity2Knowledge: { ...edit5512.activity2Knowledge, product: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">d) Tổ chức thực hiện:</label>
                    <textarea
                      rows={4}
                      value={edit5512.activity2Knowledge.implementation}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity2Knowledge: { ...edit5512.activity2Knowledge, implementation: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 leading-relaxed font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* TAB HOẠT ĐỘNG 3: LUYỆN TẬP */}
              {activeTab === 'act3' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tên hoạt động:</label>
                    <input
                      type="text"
                      value={edit5512.activity3Practice.name}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity3Practice: { ...edit5512.activity3Practice, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">a) Mục tiêu hoạt động:</label>
                    <textarea
                      rows={2}
                      value={edit5512.activity3Practice.objective}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity3Practice: { ...edit5512.activity3Practice, objective: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">b) Nội dung (Bài tập / Thao tác kỹ thuật):</label>
                    <textarea
                      rows={3}
                      value={edit5512.activity3Practice.content}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity3Practice: { ...edit5512.activity3Practice, content: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">c) Sản phẩm học tập dự kiến:</label>
                    <input
                      type="text"
                      value={edit5512.activity3Practice.product}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity3Practice: { ...edit5512.activity3Practice, product: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">d) Tổ chức thực hiện:</label>
                    <textarea
                      rows={4}
                      value={edit5512.activity3Practice.implementation}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity3Practice: { ...edit5512.activity3Practice, implementation: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 leading-relaxed font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              {/* TAB HOẠT ĐỘNG 4: VẬN DỤNG */}
              {activeTab === 'act4' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tên hoạt động:</label>
                    <input
                      type="text"
                      value={edit5512.activity4Application.name}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity4Application: { ...edit5512.activity4Application, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">a) Mục tiêu hoạt động:</label>
                    <textarea
                      rows={2}
                      value={edit5512.activity4Application.objective}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity4Application: { ...edit5512.activity4Application, objective: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">b) Nội dung (Bài toán thực tế & Năng lực số):</label>
                    <textarea
                      rows={3}
                      value={edit5512.activity4Application.content}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity4Application: { ...edit5512.activity4Application, content: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">c) Sản phẩm học tập dự kiến:</label>
                    <input
                      type="text"
                      value={edit5512.activity4Application.product}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity4Application: { ...edit5512.activity4Application, product: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">d) Tổ chức thực hiện:</label>
                    <textarea
                      rows={4}
                      value={edit5512.activity4Application.implementation}
                      onChange={(e) => setEdit5512({
                        ...edit5512,
                        activity4Application: { ...edit5512.activity4Application, implementation: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 leading-relaxed font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {standard === 2634 && edit2634 && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tên bài dạy thực hành:</label>
                <input
                  type="text"
                  value={edit2634.moduleTitle}
                  onChange={(e) => setEdit2634({ ...edit2634, moduleTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Nghề đào tạo:</label>
                  <input
                    type="text"
                    value={edit2634.occupation}
                    onChange={(e) => setEdit2634({ ...edit2634, occupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Trình độ:</label>
                  <input
                    type="text"
                    value={edit2634.level}
                    onChange={(e) => setEdit2634({ ...edit2634, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Mục tiêu kỹ năng:</label>
                <textarea
                  rows={2}
                  value={edit2634.objectives.skills}
                  onChange={(e) => setEdit2634({
                    ...edit2634,
                    objectives: { ...edit2634.objectives, skills: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">An toàn và 5S:</label>
                <textarea
                  rows={2}
                  value={edit2634.objectives.autonomyAndSafety}
                  onChange={(e) => setEdit2634({
                    ...edit2634,
                    objectives: { ...edit2634.objectives, autonomyAndSafety: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/60 rounded-b-2xl">
          <span className="text-[11px] text-slate-400">
            💡 Sau khi lưu, nội dung mới sẽ được áp dụng ngay khi xuất bản file Word (.doc)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Cập Nhật Giáo Án</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
