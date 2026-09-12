"use client";

import React, { useState } from 'react';
import EduVietHeader from './EduVietHeader';
import EduVietHeroBanner from './EduVietHeroBanner';
import EduVietIdentityCard from './EduVietIdentityCard';
import EduVietQuickGrid from './EduVietQuickGrid';
import EduVietTimelineToday, { TimelineSessionItem } from './EduVietTimelineToday';
import EduVietProgressCard from './EduVietProgressCard';
import EduVietFeaturedCards from './EduVietFeaturedCards';
import EduVietFooterDecoration from './EduVietFooterDecoration';
import EduVietBottomNav, { EduVietNavTab } from './EduVietBottomNav';
import { Language } from '@/app/app/i18n';

interface EduVietHomeViewProps {
  teacherName?: string;
  teacherAvatar?: string;
  schoolName?: string;
  teacherSchools?: string[];
  teacherSubjects?: string[];
  teacherPhone?: string;
  teacherEmail?: string;
  teacherQuote?: string;
  classNameOrSubject?: string;
  syncCode?: string;
  todaySessions?: TimelineSessionItem[];
  leaveRequestCount?: number;
  progressPercent?: number;
  stats?: {
    lessons: string;
    exercises: string;
    topics: string;
  };
  onSelectAction: (actionId: string) => void;
  onOpenSync?: () => void;
  onOpenPortalShare?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onSyncBothWays?: () => void;
  isSyncing?: boolean;
  totalEventsCount?: number;
  onViewAllSessions?: () => void;
  onSelectSession?: (session: TimelineSessionItem) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  lang?: Language;
  onToggleLanguage?: () => void;
}

export default function EduVietHomeView({
  teacherName = "Nguyễn Minh Anh",
  teacherAvatar,
  schoolName = "Trường THPT Việt Nam",
  teacherSchools,
  teacherSubjects,
  teacherPhone,
  teacherEmail,
  teacherQuote,
  classNameOrSubject = "Lớp 10A1",
  syncCode = "",
  todaySessions,
  leaveRequestCount = 0,
  progressPercent = 75,
  stats = {
    lessons: "8/10",
    exercises: "6/8",
    topics: "4/5"
  },
  onSelectAction,
  onOpenSync,
  onOpenPortalShare,
  onOpenNotifications,
  onOpenProfile,
  onOpenLogin,
  onLogout,
  onSyncBothWays,
  isSyncing,
  totalEventsCount,
  onViewAllSessions,
  onSelectSession,
  theme = 'light',
  onToggleTheme,
  lang = 'vi',
  onToggleLanguage
}: EduVietHomeViewProps) {
  const [activeNavTab, setActiveNavTab] = useState<EduVietNavTab>('home');

  const handleNavTabChange = (tab: EduVietNavTab) => {
    setActiveNavTab(tab);
    if (tab === 'classes') onSelectAction('calendar');
    if (tab === 'knowledge') onSelectAction('knowledge');
    if (tab === 'stats') onSelectAction('stats');
    if (tab === 'profile') {
      if (onOpenProfile) onOpenProfile();
      else onSelectAction('profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-rose-100 selection:text-rose-900 pb-16 transition-colors duration-200">
      {/* 1. Header (Brand EduViet + Slogan + Search bar + Actions) */}
      <EduVietHeader
        userName={teacherName}
        userAvatar={teacherAvatar}
        schoolName={schoolName}
        teacherSchools={teacherSchools}
        teacherSubjects={teacherSubjects}
        teacherPhone={teacherPhone}
        teacherEmail={teacherEmail}
        syncCode={syncCode}
        unreadCount={leaveRequestCount}
        onOpenSync={onOpenSync}
        onOpenPortalShare={onOpenPortalShare}
        onOpenNotifications={onOpenNotifications}
        onOpenProfile={onOpenProfile}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        onSyncBothWays={onSyncBothWays}
        isSyncing={isSyncing}
        totalEventsCount={totalEventsCount}
        theme={theme}
        onToggleTheme={onToggleTheme}
        lang={lang}
        onToggleLanguage={onToggleLanguage}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-3.5 sm:px-6 py-4 space-y-4 sm:space-y-5 flex-1">
        {/* 2. Hero Banner */}
        <EduVietHeroBanner
          onActionClick={() => onSelectAction('lesson_package')}
          lang={lang}
        />

        {/* 3. Identity Card */}
        <EduVietIdentityCard
          name={teacherName}
          avatar={teacherAvatar}
          schools={teacherSchools}
          subjects={teacherSubjects}
          classNameOrSubject={classNameOrSubject}
          schoolName={schoolName}
          role="teacher"
          quote={teacherQuote}
          lang={lang}
          onCardClick={() => {
            if (onOpenProfile) onOpenProfile();
            else onSelectAction('profile');
          }}
        />

        {/* 4. 8 Quick Action Cards Grid (4x2) */}
        <EduVietQuickGrid
          onSelectAction={onSelectAction}
          leaveRequestCount={leaveRequestCount}
          lang={lang}
        />

        {/* 5. Core 2 Columns Dashboard: Lịch học hôm nay (Timeline) & Tiến độ học tập (Progress Gauge) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
          {/* Left Column: Timeline */}
          <EduVietTimelineToday
            sessions={todaySessions}
            onViewAll={onViewAllSessions}
            onSelectSession={onSelectSession}
            lang={lang}
          />

          {/* Right Column: Circular Progress */}
          <EduVietProgressCard
            title={lang === 'en' ? "Academic Progress" : "Tiến độ học tập"}
            percent={progressPercent}
            encouragementTitle={lang === 'en' ? "Great teaching progress!" : "Bạn đang dạy và học rất tốt!"}
            encouragementSubtitle={lang === 'en' ? "Keep inspiring your classroom today!" : "Tiếp tục cố gắng để đạt mục tiêu nhé!"}
            lessonCount={stats.lessons}
            exerciseCount={stats.exercises}
            topicCount={stats.topics}
            onViewDetails={() => onSelectAction('stats')}
          />
        </div>

        {/* 6. Secondary 2 Columns: Lớp học nổi bật & Thông báo mới */}
        <EduVietFeaturedCards
          onViewAllClasses={() => onSelectAction('calendar')}
          onViewAllAnnouncements={onOpenNotifications}
          onSelectClass={() => onSelectAction('calendar')}
          lang={lang}
        />

        {/* 7. Footer Cultural Decoration */}
        <EduVietFooterDecoration />
      </main>

      {/* 8. Floating Bottom Navigation Bar */}
      <EduVietBottomNav
        activeTab={activeNavTab}
        onChangeTab={handleNavTabChange}
        lang={lang}
      />
    </div>
  );
}
