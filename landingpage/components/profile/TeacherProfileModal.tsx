"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  School, 
  BookOpen, 
  Plus, 
  Trash2, 
  Check, 
  Camera, 
  Sparkles, 
  Upload, 
  ShieldCheck, 
  Quote
} from 'lucide-react';
import { 
  TeacherProfile, 
  AVATAR_PRESETS, 
  POPULAR_SUBJECTS 
} from '@/app/app/teacherProfileData';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onSaveProfile: (updated: TeacherProfile) => void;
}

export default function TeacherProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}: TeacherProfileModalProps) {
  const [formData, setFormData] = useState<TeacherProfile>(profile);
  const [newSchoolInput, setNewSchoolInput] = useState('');
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setSavedSuccess(false);
      setNewSchoolInput('');
      setNewSubjectInput('');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Kích thước ảnh tối đa là 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setFormData(prev => ({ ...prev, avatar: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSchool = () => {
    const trimmed = newSchoolInput.trim();
    if (!trimmed) return;
    if (formData.schools.includes(trimmed)) return;
    setFormData(prev => ({
      ...prev,
      schools: [...prev.schools, trimmed]
    }));
    setNewSchoolInput('');
  };

  const handleRemoveSchool = (schoolToRemove: string) => {
    if (formData.schools.length <= 1) {
      alert("Hồ sơ giáo viên cần có ít nhất một trường giảng dạy.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      schools: prev.schools.filter(s => s !== schoolToRemove)
    }));
  };

  const handleAddSubject = (sub: string) => {
    const trimmed = sub.trim();
    if (!trimmed) return;
    if (formData.subjects.includes(trimmed)) return;
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, trimmed]
    }));
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    if (formData.subjects.length <= 1) {
      alert("Hồ sơ giáo viên cần có ít nhất một môn giảng dạy.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subjectToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert("Vui lòng nhập họ và tên giáo viên");
      return;
    }
    if (!formData.phone.trim()) {
      alert("Vui lòng nhập số điện thoại liên hệ");
      return;
    }
    if (!formData.email.trim()) {
      alert("Vui lòng nhập địa chỉ email");
      return;
    }

    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Hồ Sơ Cá Nhân Giáo Viên
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                  {formData.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thông tin sư phạm cá nhân, số liên hệ, trường và môn đang đảm nhiệm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          
          {/* 1. Avatar Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-750 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Ảnh Đại Diện Giáo Viên (Avatar)
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 dark:from-emerald-950/60 dark:to-teal-900/40 border-2 border-emerald-500 p-1 overflow-hidden shadow-md flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=EduVietTeacher"}
                    alt={formData.fullName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer transition-transform hover:scale-105"
                  title="Tải ảnh từ máy tính"
                >
                  <Camera className="w-3.5 h-3.5" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Avatar Presets */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Chọn nhanh từ bộ sưu tập Avatar sư phạm thân thiện hoặc tải ảnh lên:
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {AVATAR_PRESETS.map((p) => {
                    const isSelected = formData.avatar === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar: p.url }))}
                        className={`w-9 h-9 rounded-xl p-0.5 border transition-all cursor-pointer overflow-hidden ${
                          isSelected 
                            ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                        title={p.label}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover rounded-lg" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Basic Info Grid (Họ tên, SĐT, Ngày sinh, Giới tính, Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Họ và tên giáo viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ví dụ: 0961364600"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            {/* Email / Gmail */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Địa chỉ Email / Gmail <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ví dụ: minhanh.edu@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            {/* Ngày tháng năm sinh */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Ngày tháng năm sinh
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Giới tính
              </label>
              <div className="flex items-center gap-4">
                {(['Nam', 'Nữ', 'Khác'] as const).map(g => (
                  <label key={g} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={() => setFormData({ ...formData, gender: g })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Trường đang dạy (Multi-school support) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-750 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Trường đang giảng dạy
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  (Có thể dạy tại nhiều trường)
                </span>
              </label>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {formData.schools.length} trường
              </span>
            </div>

            {/* Existing Schools Badges */}
            <div className="flex flex-wrap gap-2">
              {formData.schools.map((sch, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
                >
                  <School className="w-3 h-3 text-slate-400" />
                  <span>{sch}</span>
                  {idx === 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveSchool(sch)}
                    className="p-0.5 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                    title="Xóa trường này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New School Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập thêm tên trường (Ví dụ: THPT Chuyên Sư Phạm)..."
                value={newSchoolInput}
                onChange={e => setNewSchoolInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSchool(); } }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={handleAddSchool}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm trường</span>
              </button>
            </div>
          </div>

          {/* 4. Môn đang dạy (Multi-subject support) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-750 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Môn đang giảng dạy
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  (Có thể đảm nhiệm nhiều môn)
                </span>
              </label>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {formData.subjects.length} môn
              </span>
            </div>

            {/* Current Subjects Badges */}
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map((sub, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub)}
                    className="p-0.5 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                    title="Xóa môn này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Pick Popular Subjects */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Gợi ý nhanh môn học theo chương trình GDPT 2018:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUBJECTS.map((ps) => {
                  const isAlreadyAdded = formData.subjects.includes(ps);
                  return (
                    <button
                      key={ps}
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleAddSubject(ps)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isAlreadyAdded
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 opacity-60'
                          : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isAlreadyAdded ? `✓ ${ps}` : `+ ${ps}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Subject Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Hoặc nhập tên môn học khác..."
                value={newSubjectInput}
                onChange={e => setNewSubjectInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubject(newSubjectInput); } }}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={() => handleAddSubject(newSubjectInput)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* 5. Châm ngôn sư phạm / Lời nhắn */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Châm ngôn sư phạm / Lời nhắn tâm huyết
            </label>
            <textarea
              rows={2}
              value={formData.bioQuote || ''}
              onChange={e => setFormData({ ...formData, bioQuote: e.target.value })}
              placeholder="Ví dụ: Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* 6. Account Status Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Tài khoản đăng nhập: {formData.loginType === 'phone' ? 'Số điện thoại' : formData.loginType === 'email' ? 'Gmail' : 'Tài khoản nhà trường cấp'}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                  {formData.loginIdentifier || formData.phone || formData.email}
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
              Đã xác thực
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white animate-bounce" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Lưu Hồ Sơ Giáo Viên</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}