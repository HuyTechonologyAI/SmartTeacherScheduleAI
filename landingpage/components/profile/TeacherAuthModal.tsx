"use client";

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  School, 
  Lock, 
  Check, 
  LogIn, 
  UserPlus, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { 
  TeacherProfile, 
  getStoredTeacherAccounts, 
  saveTeacherProfile 
} from '@/app/app/teacherProfileData';
import { Language, t } from '@/app/app/i18n';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: TeacherProfile;
  onAuthSuccess: (profile: TeacherProfile) => void;
  lang?: Language;
}

export default function TeacherAuthModal({
  isOpen,
  onClose,
  currentProfile,
  onAuthSuccess,
  lang = 'vi'
}: TeacherAuthModalProps) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email' | 'school_code'>('phone');
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState(currentProfile.phone || '0961364600');
  const [loginPassword, setLoginPassword] = useState('******');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regSubject, setRegSubject] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [savedAccounts, setSavedAccounts] = useState<TeacherProfile[]>(() => getStoredTeacherAccounts());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      alert(isEn ? "Please enter phone number, Gmail, or school teacher code" : "Vui lòng nhập số điện thoại, Gmail hoặc mã trường cấp");
      return;
    }

    // Check if matching an existing profile in saved list
    const found = savedAccounts.find(a => 
      a.phone === cleanId || 
      a.email.toLowerCase() === cleanId.toLowerCase() || 
      a.id.toLowerCase() === cleanId.toLowerCase() ||
      a.loginIdentifier.toLowerCase() === cleanId.toLowerCase()
    );

    let loggedProfile: TeacherProfile;
    if (found) {
      loggedProfile = {
        ...found,
        isLoggedIn: true,
        loginType: loginMethod,
        loginIdentifier: cleanId,
        lastLoginAt: new Date().toISOString()
      };
    } else {
      // Create new session with this identifier
      loggedProfile = {
        ...currentProfile,
        id: loginMethod === 'school_code' ? cleanId.toUpperCase() : ('GV-' + Date.now().toString().slice(-4)),
        loginType: loginMethod,
        loginIdentifier: cleanId,
        phone: loginMethod === 'phone' ? cleanId : currentProfile.phone,
        email: loginMethod === 'email' ? cleanId : currentProfile.email,
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString()
      };
    }

    saveTeacherProfile(loggedProfile);
    setSuccessMsg(isEn ? `Signed in successfully! Welcome Teacher ${loggedProfile.fullName}` : `Đăng nhập thành công! Chào mừng thầy/cô ${loggedProfile.fullName}`);
    setTimeout(() => {
      setSuccessMsg(null);
      onAuthSuccess(loggedProfile);
      onClose();
    }, 700);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim()) {
      alert(isEn ? "Please enter teacher full name" : "Vui lòng nhập họ tên giáo viên");
      return;
    }
    if (!regIdentifier.trim()) {
      alert(isEn ? "Please enter phone number, email, or school code" : "Vui lòng nhập số điện thoại, email hoặc mã trường cấp");
      return;
    }

    const newId = loginMethod === 'school_code' 
      ? regIdentifier.trim().toUpperCase() 
      : ('GV-' + Math.floor(1000 + Math.random() * 9000));

    const newProfile: TeacherProfile = {
      id: newId,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(regFullName.trim()),
      fullName: regFullName.trim(),
      phone: loginMethod === 'phone' ? regIdentifier.trim() : "0961364600",
      birthDate: "1990-01-01",
      gender: "Nữ",
      email: loginMethod === 'email' ? regIdentifier.trim() : (newId.toLowerCase() + "@edu.vn"),
      schools: [regSchool.trim() || (isEn ? "Vietnam High School" : "Trường THPT Việt Nam")],
      subjects: [regSubject.trim() || (isEn ? "Mathematics" : "Toán học")],
      loginType: loginMethod,
      loginIdentifier: regIdentifier.trim(),
      bioQuote: isEn ? "Every teaching hour is a journey of inspiring young minds!" : "Mỗi giờ lên lớp là một hành trình gieo hạt yêu thương!",
      isLoggedIn: true,
      lastLoginAt: new Date().toISOString()
    };

    saveTeacherProfile(newProfile);
    setSuccessMsg(isEn ? `Teacher account registered successfully! Welcome ${newProfile.fullName}` : `Đăng ký tài khoản giáo viên thành công! Chào mừng thầy/cô ${newProfile.fullName}`);
    setTimeout(() => {
      setSuccessMsg(null);
      onAuthSuccess(newProfile);
      onClose();
    }, 700);
  };

  const handleQuickSelectAccount = (acc: TeacherProfile) => {
    saveTeacherProfile({ ...acc, isLoggedIn: true, lastLoginAt: new Date().toISOString() });
    setSuccessMsg(isEn ? `Switched to account ${acc.fullName}!` : `Đã chuyển sang tài khoản ${acc.fullName}!`);
    setTimeout(() => {
      setSuccessMsg(null);
      onAuthSuccess(acc);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#111827]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('auth_modal_title', lang)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('auth_modal_subtitle', lang)}
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
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{t('tab_login', lang)}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('tab_register', lang)}</span>
          </button>
        </div>

        {/* Method Switcher: 1. Phone | 2. Gmail | 3. School ID */}
        <div className="px-6 pt-4 space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('choose_method', lang)} ({activeTab === 'login' ? t('tab_login', lang) : t('tab_register', lang)}):
          </label>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Phone */}
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                loginMethod === 'phone'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="text-[11px] font-bold">{t('method_phone', lang)}</span>
            </button>

            {/* Gmail */}
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                loginMethod === 'email'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="text-[11px] font-bold">{t('method_email', lang)}</span>
            </button>

            {/* School Code */}
            <button
              type="button"
              onClick={() => setLoginMethod('school_code')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                loginMethod === 'school_code'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <School className="w-4 h-4" />
              <span className="text-[11px] font-bold">{t('method_school_code', lang)}</span>
            </button>

          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 pt-4 space-y-4">
          
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* ================= LOGIN TAB ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Dynamic Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  {loginMethod === 'phone' && <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                  {loginMethod === 'email' && <Mail className="w-3.5 h-3.5 text-emerald-600" />}
                  {loginMethod === 'school_code' && <School className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>
                    {loginMethod === 'phone' ? t('login_id_phone', lang) : loginMethod === 'email' ? t('login_id_email', lang) : t('login_id_school', lang)}
                  </span>
                </label>
                <input
                  type={loginMethod === 'email' ? 'email' : 'text'}
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder={
                    loginMethod === 'phone' 
                      ? '0961364600' 
                      : loginMethod === 'email' 
                      ? 'minhanh.edu@gmail.com' 
                      : 'GV-THPT-01'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('password', lang)}</span>
                  </label>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                    {t('forgot_password', lang)}
                  </span>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="******"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('login_submit', lang)}</span>
              </button>

              {/* Quick Saved Accounts */}
              {savedAccounts.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {t('saved_accounts_title', lang)}
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {savedAccounts.map((acc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleQuickSelectAccount(acc)}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={acc.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=EduVietTeacher"}
                            alt={acc.fullName}
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                              {acc.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {acc.schools?.[0] || 'Trường THPT'} • {acc.subjects?.join(', ') || t('teacher_role', lang)}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span>{t('select_account', lang)}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* ================= REGISTER TAB ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Họ tên */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('full_name', lang)}</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder={isEn ? "e.g., John Smith" : "Ví dụ: Nguyễn Minh Anh"}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Dynamic Identifier Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  {loginMethod === 'phone' && <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                  {loginMethod === 'email' && <Mail className="w-3.5 h-3.5 text-emerald-600" />}
                  {loginMethod === 'school_code' && <School className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>
                    {loginMethod === 'phone' ? t('login_id_phone', lang) : loginMethod === 'email' ? t('login_id_email', lang) : t('login_id_school', lang)} <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type={loginMethod === 'email' ? 'email' : 'text'}
                  required
                  value={regIdentifier}
                  onChange={e => setRegIdentifier(e.target.value)}
                  placeholder={
                    loginMethod === 'phone' 
                      ? '0961364600' 
                      : loginMethod === 'email' 
                      ? 'minhanh.edu@gmail.com' 
                      : 'GV-THPT-01'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Trường đang dạy */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('register_school', lang)}</span>
                </label>
                <input
                  type="text"
                  value={regSchool}
                  onChange={e => setRegSchool(e.target.value)}
                  placeholder={isEn ? "e.g., Vietnam International School" : "Ví dụ: Trường THPT Việt Nam"}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Môn đang dạy */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('register_subject', lang)}</span>
                </label>
                <input
                  type="text"
                  value={regSubject}
                  onChange={e => setRegSubject(e.target.value)}
                  placeholder={isEn ? "e.g., Mathematics, Computer Science" : "Ví dụ: Toán học, Tin học"}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('register_password', lang)}</span>
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="******"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer pt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('register_submit', lang)}</span>
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}