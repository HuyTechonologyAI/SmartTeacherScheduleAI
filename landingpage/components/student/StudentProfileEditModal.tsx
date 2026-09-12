"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  IdCard,
  School,
  Save,
  Sparkles,
  Calendar,
  Phone,
  Quote,
  Check,
  GraduationCap,
  Layers,
  UploadCloud
} from 'lucide-react';
import {
  StudentProfile,
  EDUCATION_LEVELS,
  EducationLevel,
  saveStudentProfile
} from '@/app/student/studentProfileData';
import { Language } from '@/app/app/i18n';

interface StudentProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updatedProfile: StudentProfile) => void;
  lang?: Language;
}

const AVATAR_OPTIONS = [
  { id: 'cat', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidCat', name: 'Mèo Thông Thái' },
  { id: 'bear', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidBear', name: 'Gấu Chăm Chỉ' },
  { id: 'fox', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidFox', name: 'Cáo Nhanh Trí' },
  { id: 'bunny', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidBunny', name: 'Thỏ Hoạt Bát' },
  { id: 'astro', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidAstro', name: 'Phi Hành Gia' },
  { id: 'owl', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KidOwl', name: 'Cú Học Giỏi' },
  { id: 'boy1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&mouth=smile', name: 'Học sinh Nam' },
  { id: 'girl1', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&mouth=smile', name: 'Học sinh Nữ' }
];

export default function StudentProfileEditModal({
  isOpen,
  onClose,
  profile,
  onSave,
  lang = 'vi'
}: StudentProfileEditModalProps) {
  const isEn = lang === 'en';

  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const currentLevelConfig = EDUCATION_LEVELS.find(l => l.id === formData.educationLevel) || EDUCATION_LEVELS[0];

  const handleLevelChange = (level: EducationLevel) => {
    const config = EDUCATION_LEVELS.find(l => l.id === level);
    const defaultGrade = config?.grades[0] || 'Lớp 1';
    setFormData(prev => ({
      ...prev,
      educationLevel: level,
      className: defaultGrade
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert(isEn ? 'Please enter student full name' : 'Vui lòng nhập họ và tên học sinh');
      return;
    }

    if (!formData.studentCode.trim()) {
      alert(isEn ? 'Please enter Citizen ID or Student Code' : 'Vui lòng nhập số CCCD hoặc mã học sinh');
      return;
    }

    const updated: StudentProfile = {
      ...formData,
      id: formData.studentCode.trim(),
      fullName: formData.fullName.trim(),
      studentCode: formData.studentCode.trim(),
      className: formData.className.trim() || 'Lớp 3A1',
      schoolName: formData.schoolName.trim() || (isEn ? 'Vietnam School' : 'Trường Tiểu Học Việt Nam')
    };

    saveStudentProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onSave(updated);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#101726] rounded-3xl shadow-2xl border-2 border-amber-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {isEn ? "Update Student Profile" : "Cập Nhật Hồ Sơ Học Sinh"}
              </h3>
              <p className="text-xs text-white/90 font-medium">
                {isEn ? "Keep your information and class code up to date" : "Chỉnh sửa thông tin định danh, cấp học và lớp học"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* 1. Avatar Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>🎨</span>
              <span>{isEn ? "Student Avatar" : "Hình đại diện học sinh"}</span>
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {AVATAR_OPTIONS.map(av => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setFormData(prev => ({ ...prev, avatar: av.url }))}
                  className={`p-1 rounded-2xl border-2 transition-all hover:scale-105 cursor-pointer flex flex-col items-center ${
                    formData.avatar === av.url
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 shadow-md ring-2 ring-amber-400'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                  }`}
                  title={av.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={av.url} alt={av.name} className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover bg-white" />
                  <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5 truncate max-w-[55px]">
                    {av.name}
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                className="h-14 px-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-500 dark:hover:border-amber-400 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-amber-500" />
                <span>{isEn ? "Custom URL" : "Dán link ảnh"}</span>
              </button>
            </div>

            {showCustomUrlInput && (
              <div className="flex items-center gap-2 pt-1 animate-fade-in">
                <input
                  type="text"
                  placeholder={isEn ? "Paste direct image URL (https://...)" : "Dán địa chỉ link ảnh (https://...)"}
                  value={customAvatarUrl}
                  onChange={e => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl.trim()) {
                      setFormData(prev => ({ ...prev, avatar: customAvatarUrl.trim() }));
                      setShowCustomUrlInput(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isEn ? "Apply" : "Áp dụng"}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 2. Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEn ? "Student Full Name *" : "Họ và tên học sinh *"}</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder={isEn ? "e.g. Nguyen Bao An" : "Ví dụ: Nguyễn Bảo An"}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 3. National Citizen ID / Student Code (CCCD 12 số) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <IdCard className="w-3.5 h-3.5 text-rose-500" />
                <span>{isEn ? "Citizen ID (12 digits) / Student Code *" : "Số CCCD / Mã định danh (12 số) *"}</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={formData.studentCode}
                onChange={e => setFormData(prev => ({ ...prev, studentCode: e.target.value }))}
                placeholder="001208012345"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {isEn 
                  ? "Unique 12-digit Citizen ID or School ID prevents duplicate accounts across Vietnam" 
                  : "Dãy 12 số CCCD / Mã định danh đảm bảo mã duy nhất không trùng lặp toàn quốc"}
              </p>
            </div>

            {/* 4. Birth Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isEn ? "Date of Birth" : "Ngày tháng năm sinh"}</span>
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 5. Gender */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isEn ? "Gender" : "Giới tính"}
              </label>
              <div className="flex items-center gap-2 pt-0.5">
                {(['Nam', 'Nữ', 'Khác'] as const).map(g => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.gender === g
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {g === 'Nam' ? (isEn ? '👦 Male' : '👦 Nam') : g === 'Nữ' ? (isEn ? '👧 Female' : '👧 Nữ') : (isEn ? 'Other' : 'Khác')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Education Level Selector (Tiểu học / THCS / THPT / Trung cấp & Đại học) */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? "Education Level (From Grade 1 to 12 & Vocational/College)" : "Cấp học (Từ lớp 1 đến lớp 12 & Trung cấp trở lên)"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EDUCATION_LEVELS.map(lvl => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => handleLevelChange(lvl.id)}
                  className={`p-2.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    formData.educationLevel === lvl.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 shadow-xs ring-1 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {lvl.shortLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {lvl.id === 'primary' && (isEn ? 'Grades 1 to 5' : 'Lớp 1 - Lớp 5')}
                    {lvl.id === 'secondary' && (isEn ? 'Grades 6 to 9' : 'Lớp 6 - Lớp 9')}
                    {lvl.id === 'high_school' && (isEn ? 'Grades 10 to 12' : 'Lớp 10 - Lớp 12')}
                    {lvl.id === 'college' && (isEn ? 'Specialized Class Codes' : 'Mã lớp trung cấp/CĐ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 7. Class Selection: K-12 Grade Pills or College Class Code */}
          <div className="space-y-2 bg-amber-50/60 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-amber-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {formData.educationLevel === 'college' 
                    ? (isEn ? "Specialized Class Code (Vocational / College / University)" : "Mã lớp chuyên ngành (Trung cấp / CĐ / ĐH)")
                    : (isEn ? "Select Grade & Class (Grade 1 - 12)" : "Chọn Khối lớp & Tên lớp (Lớp 1 đến Lớp 12)")}
                </span>
              </label>
            </div>

            {formData.educationLevel !== 'college' ? (
              <div className="space-y-2">
                {/* Standard Grades Pills for this level */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentLevelConfig.grades.map(grade => (
                    <button
                      type="button"
                      key={grade}
                      onClick={() => setFormData(prev => ({ ...prev, className: grade }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.className.startsWith(grade)
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>

                {/* Specific Class Name Input (e.g., Lớp 3A1, Lớp 10 Chuyên Tin) */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    {isEn ? "Precise Class Name:" : "Tên lớp cụ thể:"}
                  </span>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={e => setFormData(prev => ({ ...prev, className: e.target.value }))}
                    placeholder={isEn ? "e.g. Class 3A1, Class 10A2" : "Ví dụ: Lớp 3A1, Lớp 10 Chuyên Tin"}
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            ) : (
              /* College / Vocational Class Code */
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                    {isEn ? "Class Code:" : "Mã lớp:"}
                  </span>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={e => setFormData(prev => ({ ...prev, className: e.target.value.toUpperCase() }))}
                    placeholder="CNTT-K24, QTKD-01, DTVT-A..."
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    {isEn ? "Common samples:" : "Mã gợi ý phổ biến:"}
                  </span>
                  {currentLevelConfig.grades.map(sampleCode => (
                    <button
                      type="button"
                      key={sampleCode}
                      onClick={() => setFormData(prev => ({ ...prev, className: sampleCode }))}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 cursor-pointer"
                    >
                      {sampleCode}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 8. School Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-blue-500" />
                <span>{isEn ? "School / College Name" : "Tên Trường / Viện Đào Tạo"}</span>
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder={isEn ? "Vietnam Elementary School" : "Trường Tiểu Học Việt Nam"}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 9. Parent Contact Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isEn ? "Parent Phone Number" : "Số điện thoại phụ huynh"}</span>
              </label>
              <input
                type="tel"
                value={formData.parentPhone}
                onChange={e => setFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                placeholder="0961364600"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* 10. Bio Quote / Motto */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Quote className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? "Student Learning Motto" : "Châm ngôn / Lời hứa học tập"}</span>
            </label>
            <input
              type="text"
              value={formData.bioQuote}
              onChange={e => setFormData(prev => ({ ...prev, bioQuote: e.target.value }))}
              placeholder={isEn ? "Work hard, stay curious!" : "Chăm ngoan, học giỏi, vâng lời thầy cô và cha mẹ!"}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium italic focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Success Notification */}
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{isEn ? "Profile updated successfully!" : "Đã cập nhật thông tin học sinh thành công!"}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isEn ? "Cancel" : "Hủy bỏ"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEn ? "Save Profile" : "Lưu Thông Tin"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
