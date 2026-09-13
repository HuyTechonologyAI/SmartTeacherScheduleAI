"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  School, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  AuthSession, 
  DEFAULT_PRINCIPAL_SESSION, 
  DEFAULT_TEACHER_SESSION, 
  setAuthSession, 
  UserRole 
} from '@/lib/authRbac';

interface SchoolAuthGateModalProps {
  isOpen: boolean;
  onSuccess: (session: AuthSession) => void;
  isEn?: boolean;
}

export default function SchoolAuthGateModal({
  isOpen,
  onSuccess,
  isEn = false
}: SchoolAuthGateModalProps) {
  const [schoolCode, setSchoolCode] = useState('BGH-EDUVIET');
  const [passcode, setPasscode] = useState('888888');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Kiểm tra xác thực mẫu: Chấp nhận BGH-EDUVIET / 888888 hoặc admin123
      const cleanCode = schoolCode.trim().toUpperCase();
      if ((cleanCode.includes('BGH') || cleanCode.includes('CHU-VAN-AN') || cleanCode.includes('ADMIN')) &&
          (passcode === '888888' || passcode === 'admin123' || passcode === '666666')) {
        const session: AuthSession = {
          ...DEFAULT_PRINCIPAL_SESSION,
          schoolCode: cleanCode,
          fullName: cleanCode.includes('PHO') ? 'Cô Trần Thị Mai - Phó Hiệu Trưởng' : 'Thầy Nguyễn Văn An - Hiệu Trưởng'
        };
        setAuthSession(session);
        onSuccess(session);
      } else {
        setErrorMsg(
          isEn 
            ? 'Invalid School Code or Administrative Passcode. Try BGH-EDUVIET / 888888' 
            : 'Mã trường hoặc Mật khẩu BGH không chính xác. Thử mã mẫu: BGH-EDUVIET / 888888'
        );
      }
    }, 400);
  };

  const handleQuickDemoPrincipal = () => {
    setSchoolCode('BGH-EDUVIET');
    setPasscode('888888');
    const session = DEFAULT_PRINCIPAL_SESSION;
    setAuthSession(session);
    onSuccess(session);
  };

  const handleQuickDemoVicePrincipal = () => {
    setSchoolCode('BGH-PHO-CM');
    setPasscode('666666');
    const session: AuthSession = {
      ...DEFAULT_PRINCIPAL_SESSION,
      userId: 'vice_principal_002',
      schoolCode: 'BGH-PHO-CM',
      fullName: 'Cô Trần Thị Mai',
      departmentOrClass: 'Ban Giám Hiệu (Phó Hiệu Trưởng Chuyên Môn)'
    };
    setAuthSession(session);
    onSuccess(session);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0E1526] border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        
        {/* Security Shield Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEn ? 'School Executive Auth Gate' : 'Xác Thực Quyền Hạn Ban Giám Hiệu'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEn 
              ? 'Role-Based Security Gate • Restricted to Principals & School Board' 
              : 'Hệ thống bảo mật RBAC • Dành riêng cho Ban Giám Hiệu & Hội Đồng Trường'}
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-500" />
              <span>{isEn ? 'School Unit Code / BGH ID' : 'Mã Đơn Vị Trường / Mã BGH'}</span>
            </label>
            <input
              type="text"
              required
              value={schoolCode}
              onChange={e => setSchoolCode(e.target.value)}
              placeholder="VD: BGH-EDUVIET hoặc THPT-CHU-VAN-AN"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              <span>{isEn ? 'Master Passcode / 6-Digit PIN' : 'Mật Khẩu Quản Trị / Mã PIN 6 Số'}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Nhập mã PIN hoặc mật khẩu..."
                className="w-full px-4 py-2.5 pr-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono font-bold tracking-wider focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>{isEn ? 'Verifying Credentials...' : 'Đang xác thực bảo mật...'}</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{isEn ? 'Unlock School Executive Portal' : 'Mở Khóa Cổng Điều Hành Nhà Trường'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Access */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{isEn ? '⚡ 1-Click Demo Testing Credentials' : '⚡ Tài Khoản Thử Nghiệm Nhanh'}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoPrincipal}
              className="p-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 text-left transition-colors cursor-pointer group"
            >
              <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 block">
                🏛️ Hiệu Trưởng
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate block">
                Thầy Nguyễn Văn An
              </span>
              <span className="text-[10px] text-slate-400 font-mono">PIN: 888888</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoVicePrincipal}
              className="p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 text-left transition-colors cursor-pointer group"
            >
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 block">
                👩‍🏫 Phó Hiệu Trưởng
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate block">
                Cô Trần Thị Mai
              </span>
              <span className="text-[10px] text-slate-400 font-mono">PIN: 666666</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          {isEn 
            ? 'Protected by Next.js Edge Middleware & JWT Session Guard' 
            : 'Được bảo vệ bởi Next.js Edge Middleware & Khung phân quyền RBAC'}
        </p>

      </div>
    </div>
  );
}
