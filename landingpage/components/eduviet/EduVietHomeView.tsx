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

interface EduVietHomeViewProps {
  teacherName?: string;
  schoolName?: string;
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
  onSyncBothWays?: () => void;
  isSyncing?: boolean;
  totalEventsCount?: number;
  onViewAllSessions?: () => void;
  onSelectSession?: (session: TimelineSessionItem) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function EduVietHomeView({
  teacherName = "Nguyễn Minh Anh",
  schoolName = "Trường THPT Việt Nam",
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
  onSyncBothWays,
  isSyncing,
  totalEventsCount,
  onViewAllSessions,
  onSelectSession,
  theme = 'light',
  onToggleTheme
}: EduVietHomeViewProps) {
  const [activeNavTab, setActiveNavTab] = useState<EduVietNavTab>('home');

  const handleNavTabChange = (tab: EduVietNavTab) => {
    setActiveNavTab(tab);
    if (tab === 'classes') onSelectAction('calendar');
    if (tab === 'knowledge') onSelectAction('knowledge');
    if (tab === 'stats') onSelectAction('stats');
    if (tab === 'profile') onSelectAction('profile');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-rose-100 selection:text-rose-900 pb-16 transition-colors duration-200">
      {/* 1. Header (Brand EduViet + Slogan + Search bar + Actions) */}
      <EduVietHeader
        userName={teacherName}
        schoolName={schoolName}
        syncCode={syncCode}
        unreadCount={leaveRequestCount > 0 ? leaveRequestCount : 3}
        onOpenSync={onOpenSync}
        onOpenPortalShare={onOpenPortalShare}
        onOpenNotifications={onOpenNotifications}
        onSyncBothWays={onSyncBothWays}
        isSyncing={isSyncing}
        totalEventsCount={totalEventsCount}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-3.5 sm:px-6 py-4 space-y-4 sm:space-y-5 flex-1">
        {/* 2. Hero Banner: Tri thức hôm nay - Tương lai ngày mai */}
        <EduVietHeroBanner
          onActionClick={() => onSelectAction('lesson_package')}
        />

        {/* 3. Identity Card: Nguyễn Minh Anh - Lớp 10A1 */}
        <EduVietIdentityCard
          name={teacherName}
          classNameOrSubject={classNameOrSubject}
          schoolName={schoolName}
          role="teacher"
          quote="Nỗ lực hôm nay để chạm tới ước mơ!"
          onCardClick={() => onSelectAction('profile')}
        />

        {/* 4. 8 Quick Action Cards Grid (4x2) */}
        <EduVietQuickGrid
          onSelectAction={onSelectAction}
          leaveRequestCount={leaveRequestCount}
        />

        {/* 5. Core 2 Columns Dashboard: Lịch học hôm nay (Timeline) & Tiến độ học tập (Progress Gauge) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
          {/* Left Column: Timeline */}
          <EduVietTimelineToday
            title="Lịch học hôm nay"
            sessions={todaySessions}
            onViewAll={onViewAllSessions}
            onSelectSession={onSelectSession}
          />

          {/* Right Column: Circular Progress */}
          <EduVietProgressCard
            title="Tiến độ học tập"
            percent={progressPercent}
            encouragementTitle="Bạn đang học rất tốt!"
            encouragementSubtitle="Tiếp tục cố gắng để đạt mục tiêu nhé!"
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
          onSelectClass={(cls) => onSelectAction('calendar')}
        />

        {/* 7. Footer Cultural Decoration: Cờ đỏ sao vàng + Chữ ký thư pháp */}
        <EduVietFooterDecoration />
      </main>

      {/* 8. Floating Bottom Navigation Bar */}
      <EduVietBottomNav
        activeTab={activeNavTab}
        onChangeTab={handleNavTabChange}
      />
    </div>
  );
}
