"use client";

import React, { useState } from 'react';
import { 
  X, 
  User, 
  IdCard, 
  School, 
  Check, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { 
  StudentProfile, 
  DEFAULT_STUDENT_PROFILE, 
  getStoredStudentAccounts, 
  saveStudentProfile,
  EDUCATION_LEVELS,
  EducationLevel
} from '@/app/student/studentProfileData';
import { Language } from '@/app/app/i18n';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile;
  onAuthSuccess: (profile: StudentProfile) => void;
  lang?: Language;
}

export default function StudentAuthModal({
  isOpen,
  onClose,
  currentProfile,
  onAuthSuccess,
  lang = 'vi'
}: StudentAuthModalProps) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'cccd' | 'school_code'>('cccd');

  // Login Input
  const [loginIdentifier, setLoginIdentifier] = useState(currentProfile.studentCode || '001208012345');

  // Register Inputs
  const [regFullName, setRegFullName] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regLevel, setRegLevel] = useState<EducationLevel>('primary');
  const [regClass, setRegClass] = useState('Lớp 3A1');
  const [regSchool, setRegSchool] = useState('Trường Tiểu Học Việt Nam');
  const [regParentPhone, setRegParentPhone] = useState('0961364600');

  const [savedAccounts, setSavedAccounts] = useState<StudentProfile[]>(() => getStoredStudentAccounts());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      alert(isEn ? "Please enter your Student ID or National Citizen ID number" : "Vui lòng nhập mã định danh hoặc số CCCD của học sinh");
      return;
    }

    // Check if matching saved profile
    const found = savedAccounts.find(a => 
      a.studentCode === cleanId || 
      a.id.toLowerCase() === cleanId.toLowerCase()
    );

    let loggedProfile: StudentProfile;
    if (found) {
      loggedProfile = {
        ...found,
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString()
      };
    } else {
      loggedProfile = {
        ...currentProfile,
        id: cleanId,
        studentCode: cleanId,
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString()
      };
    }

    saveStudentProfile(loggedProfile);
    setSuccessMsg(isEn ? `Welcome back, ${loggedProfile.fullName}!` : `Đăng nhập thành công! Chào mừng em ${loggedProfile.fullName}`);
    setTimeout(() => {
      setSuccessMsg(null);
      onAuthSuccess(loggedProfile);
      onClose();
    }, 700);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim()) {
      alert(isEn ? "Please enter student full name" : "Vui lòng nhập họ và tên học sinh");
      return;
    }
    if (!regCode.trim()) {
      alert(isEn ? "Please enter Student ID / National Citizen ID number" : "Vui lòng nhập số CCCD hoặc mã học sinh");
      return;
    }

    const cleanCode = regCode.trim();
    const newProfile: StudentProfile = {
      id: cleanCode,
      studentCode: cleanCode,
      fullName: regFullName.trim(),
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(cleanCode),
      birthDate: '2015-01-01',
      gender: 'Nam',
      educationLevel: regLevel,
      className: regClass.trim() || 'Lớp 1',
      schoolName: regSchool.trim() || (isEn ? 'Vietnam School' : 'Trường Phổ Thông Việt Nam'),
      parentPhone: regParentPhone.trim() || '0961364600',
      bioQuote: isEn ? 'Eager to learn, polite, and hardworking!' : 'Chăm ngoan, học giỏi, vâng lời thầy cô!',
      kudosPoints: 50,
      isLoggedIn: true,
      lastLoginAt: new Date().toISOString()
    };

    saveStudentProfile(newProfile);
    setSuccessMsg(isEn ? `Account created for ${newProfile.fullName}!` : `Tạo tài khoản học sinh thành công! Chào mừng em ${newProfile.fullName}`);
    setTimeout(() => {
      setSuccessMsg(null);
      onAuthSuccess(newProfile);
      onClose();
    }, 700);
  };

  const handleQuickSelect = (acc: StudentProfile) => {
    saveStudentProfile({ ...acc, isLoggedIn: true, lastLoginAt: new Date().toISOString() });
    setSuccessMsg(isEn ? `Switched to ${acc.fullName}!` : `Đã chuyển sang học sinh ${acc.fullName}!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onAuthSuccess(acc);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isEn ? "Student Account Login" : "Đăng Nhập Cổng Học Sinh"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? "Use your unique Student ID or Citizen ID number" : "Mỗi học sinh có mã riêng để đăng nhập không trùng lặp"}
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

        {/* Tab Switcher: Login vs Register */}
        <div className="p-2 mx-6 mt-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{isEn ? "Student Sign In" : "Đăng Nhập Mã Học Sinh"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{isEn ? "Register New" : "Đăng Ký Học Sinh Mới"}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-4 space-y-4">
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Method Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('cccd')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    authMethod === 'cccd'
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <IdCard className="w-4 h-4" />
                  <span>{isEn ? "Citizen ID (12 digits)" : "Mã định danh / Số CCCD"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('school_code')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    authMethod === 'school_code'
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <School className="w-4 h-4" />
                  <span>{isEn ? "School-Issued Code" : "Mã học sinh trường cấp"}</span>
                </button>
              </div>

              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {authMethod === 'cccd'
                      ? (isEn ? "National Citizen ID / Unique Student ID" : "Số Căn cước công dân / Mã số định danh cá nhân (12 số)")
                      : (isEn ? "School-Issued Student Code" : "Mã học sinh do trường cấp (Ví dụ: HS-3A1-05)")}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder={authMethod === 'cccd' ? 'Ví dụ: 001208012345' : 'Ví dụ: HS-3A1-05'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEn 
                    ? "💡 Each student is identified uniquely by their Citizen ID or School Code without duplicates."
                    : "💡 Dùng dãy số căn cước cá nhân hoặc mã định danh của học sinh để đảm bảo chính xác tuyệt đối và không bị trùng lặp."}
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>{isEn ? "Log In as Student" : "Đăng Nhập Vào Cổng Học Sinh"}</span>
              </button>

              {/* Saved Accounts */}
              {savedAccounts.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isEn ? "Saved student accounts on this device:" : "Học sinh đã lưu trên máy này:"}
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {savedAccounts.map((acc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleQuickSelect(acc)}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={acc.avatar}
                            alt={acc.fullName}
                            className="w-7 h-7 rounded-lg object-cover bg-white"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600">
                              {acc.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {acc.className} • {acc.studentCode}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          <span>{isEn ? "Select" : "Chọn"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              {/* Họ tên */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Student Full Name" : "Họ và tên học sinh"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder={isEn ? "e.g., Nguyen Bao An" : "Ví dụ: Nguyễn Bảo An"}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Số CCCD / Mã học sinh */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Citizen ID / Unique Student Code" : "Số CCCD / Mã định danh không trùng lặp"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regCode}
                  onChange={e => setRegCode(e.target.value)}
                  placeholder="001208012345"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>

              {/* Cấp học & Lớp */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isEn ? "Education Level" : "Cấp học"}
                  </label>
                  <select
                    value={regLevel}
                    onChange={e => {
                      const lvl = e.target.value as EducationLevel;
                      setRegLevel(lvl);
                      const target = EDUCATION_LEVELS.find(l => l.id === lvl);
                      if (target && target.grades.length > 0) setRegClass(target.grades[0]);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {EDUCATION_LEVELS.map(l => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isEn ? "Class / Code" : "Lớp / Mã lớp"}
                  </label>
                  <input
                    type="text"
                    value={regClass}
                    onChange={e => setRegClass(e.target.value)}
                    placeholder="Ví dụ: Lớp 3A1"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Trường */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "School / Institution Name" : "Tên trường đang theo học"}
                </label>
                <input
                  type="text"
                  value={regSchool}
                  onChange={e => setRegSchool(e.target.value)}
                  placeholder="Ví dụ: Trường Tiểu Học Việt Nam"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* SĐT Phụ huynh */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isEn ? "Parent Phone Number" : "Số điện thoại phụ huynh liên hệ"}
                </label>
                <input
                  type="tel"
                  value={regParentPhone}
                  onChange={e => setRegParentPhone(e.target.value)}
                  placeholder="0961364600"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isEn ? "Register & Enter Student Space" : "Đăng Ký & Vào Góc Học Sinh"}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
