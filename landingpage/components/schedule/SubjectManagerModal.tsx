"use client";

import React, { useState } from 'react';
import { BookOpen, Edit2, Trash2, Plus, AlertCircle, Check, X } from 'lucide-react';

export interface SubjectStats {
  name: string;
  count: number;
}

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectStats[];
  onRenameSubject: (oldName: string, newName: string) => void;
  onDeleteSubject: (subjectName: string, action: 'delete_events' | 'keep_and_reassign', fallbackSubject?: string) => void;
  onAddSubject?: (newSubjectName: string) => void;
}

export default function SubjectManagerModal({
  isOpen,
  onClose,
  subjects,
  onRenameSubject,
  onDeleteSubject,
  onAddSubject
}: SubjectManagerModalProps) {
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  
  const [deletingSubject, setDeletingSubject] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<'delete_events' | 'keep_and_reassign'>('delete_events');
  const [fallbackSubject, setFallbackSubject] = useState<string>('');

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newSubjectInput, setNewSubjectInput] = useState<string>('');

  if (!isOpen) return null;

  const handleStartEdit = (name: string) => {
    setEditingSubject(name);
    setEditName(name);
    setDeletingSubject(null);
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      alert('Tên môn học không được để trống!');
      return;
    }
    if (trimmed !== oldName) {
      onRenameSubject(oldName, trimmed);
    }
    setEditingSubject(null);
  };

  const handleStartDelete = (name: string) => {
    setDeletingSubject(name);
    setEditingSubject(null);
    setDeleteAction('delete_events');
    const others = subjects.filter(s => s.name !== name);
    setFallbackSubject(others.length > 0 ? others[0].name : '');
  };

  const handleConfirmDelete = () => {
    if (!deletingSubject) return;
    onDeleteSubject(deletingSubject, deleteAction, fallbackSubject);
    setDeletingSubject(null);
  };

  const handleCreateNewSubject = () => {
    const trimmed = newSubjectInput.trim();
    if (!trimmed) {
      alert('Vui lòng nhập tên môn học!');
      return;
    }
    if (onAddSubject) {
      onAddSubject(trimmed);
    }
    setNewSubjectInput('');
    setIsAdding(false);
  };

  const currentDeletingStats = subjects.find(s => s.name === deletingSubject);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Quản Lý & Điều Chỉnh Môn Học</h3>
              <p className="text-xs text-rose-100">Chỉnh sửa tên hoặc xoá các môn học trong bộ lọc và lịch dạy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Add Section */}
          {!isAdding ? (
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Tổng cộng: <strong className="text-slate-800 dark:text-slate-200">{subjects.length}</strong> môn học đang phụ trách
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200/50 dark:border-rose-800/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm môn mới</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/60 space-y-2">
              <label className="text-xs font-semibold text-rose-700 dark:text-rose-300">Tên môn học mới:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: Khoa học tự nhiên, Tin học, Mỹ thuật..."
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNewSubject(); }}
                  autoFocus
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <button
                  onClick={handleCreateNewSubject}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Thêm
                </button>
                <button
                  onClick={() => { setIsAdding(false); setNewSubjectInput(''); }}
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Box (when deleting) */}
          {deletingSubject && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Xác nhận xoá môn: <span className="text-rose-600 dark:text-rose-400 underline">{deletingSubject}</span>
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 mt-0.5">
                    Hiện có <strong className="font-bold">{currentDeletingStats?.count || 0}</strong> ca dạy đang thuộc môn này. Thầy/Cô vui lòng chọn cách xử lý:
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteAction"
                    value="delete_events"
                    checked={deleteAction === 'delete_events'}
                    onChange={() => setDeleteAction('delete_events')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span><strong>Xoá vĩnh viễn</strong> tất cả {currentDeletingStats?.count || 0} ca dạy của môn này</span>
                </label>

                {subjects.filter(s => s.name !== deletingSubject).length > 0 && (
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteAction"
                        value="keep_and_reassign"
                        checked={deleteAction === 'keep_and_reassign'}
                        onChange={() => setDeleteAction('keep_and_reassign')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span><strong>Giữ nguyên ca dạy</strong> và chuyển sang môn:</span>
                    </label>

                    {deleteAction === 'keep_and_reassign' && (
                      <div className="pl-6 pt-1">
                        <select
                          value={fallbackSubject}
                          onChange={(e) => setFallbackSubject(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          {subjects
                            .filter(s => s.name !== deletingSubject)
                            .map(s => (
                              <option key={s.name} value={s.name}>
                                {s.name} ({s.count} ca dạy)
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200 dark:border-amber-800/50">
                <button
                  type="button"
                  onClick={() => setDeletingSubject(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xác nhận xoá môn</span>
                </button>
              </div>
            </div>
          )}

          {/* Subject List */}
          <div className="space-y-2">
            {subjects.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có môn học nào trong danh sách.
              </div>
            ) : (
              subjects.map((s) => {
                const isEditing = editingSubject === s.name;

                return (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2 pr-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(s.name);
                            if (e.key === 'Escape') setEditingSubject(null);
                          }}
                          autoFocus
                          className="flex-1 bg-white dark:bg-slate-900 border border-rose-400 dark:border-rose-500 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(s.name)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs cursor-pointer"
                          title="Lưu tên mới"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSubject(null)}
                          className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-600 dark:text-slate-300 rounded-lg text-xs cursor-pointer"
                          title="Huỷ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>{s.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {s.count > 0 ? `${s.count} ca dạy đã xếp lịch` : 'Chưa có ca dạy nào'}
                          </p>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(s.name)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Đổi tên môn học này"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartDelete(s.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Xoá môn học này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
            <span className="font-bold shrink-0">💡 Lưu ý:</span>
            <span>
              Mọi thay đổi về tên môn hoặc xoá môn sẽ tự động cập nhật ngay trên máy tính, lưu vào bộ đệm IndexedDB và đồng bộ lên Đám mây để điện thoại nhận được dữ liệu mới nhất.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Đóng bảng quản lý
          </button>
        </div>

      </div>
    </div>
  );
}
