/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { CompetitiveView } from './components/CompetitiveView';
import { PracticeView } from './components/PracticeView';
import { StatisticsView } from './components/StatisticsView';
import { ProfileView } from './components/ProfileView';
import { CalculationWorkspace } from './components/CalculationWorkspace';
import { SessionResults } from './components/SessionResults';
import { AuthModal } from './components/AuthModal';
import { MistakeBankModal } from './components/MistakeBankModal';
import { AILevelMakerView } from './components/AILevelMakerView';
import { DownloadModal } from './components/DownloadModal';
import { ChangelogModal } from './components/ChangelogModal';
import { SupportModal } from './components/SupportModal';
import { UpdateBanner } from './components/UpdateBanner';
import { QuestionResult } from './types';

const MainAppContent: React.FC = () => {
  const {
    activeSession,
    endSession,
    completeSession,
    lastSessionSummary,
    clearLastSessionSummary,
    startSession,
    activeView,
    setIsMistakeBankModalOpen,
  } = useApp();

  // Active Calculation Workspace Screen
  if (activeSession) {
    return (
      <CalculationWorkspace
        config={activeSession}
        onComplete={(results: QuestionResult[]) => {
          completeSession(results, activeSession);
        }}
        onExit={endSession}
      />
    );
  }

  // Session Results Screen
  if (lastSessionSummary) {
    return (
      <SessionResults
        summary={lastSessionSummary}
        onContinue={() => {
          clearLastSessionSummary();
        }}
        onPlayAgain={() => {
          const prev = lastSessionSummary;
          clearLastSessionSummary();
          startSession({
            mode: prev.mode,
            level: prev.level,
            questionCount: prev.totalQuestions,
            hasTimer: true,
            bonusType: prev.bonusType as any,
          });
        }}
        onPracticeMistakes={() => {
          clearLastSessionSummary();
          setIsMistakeBankModalOpen(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080B10] text-[#F5F7FA]">
      <UpdateBanner />
      <Navbar />

      <main className="transition-opacity duration-200">
        {activeView === 'home' && <HomeDashboard />}
        {activeView === 'competitive' && <CompetitiveView />}
        {activeView === 'practice' && <PracticeView />}
        {activeView === 'ai-maker' && <AILevelMakerView />}
        {activeView === 'statistics' && <StatisticsView />}
        {activeView === 'profile' && <ProfileView />}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <MistakeBankModal />
      <DownloadModal />
      <ChangelogModal />
      <SupportModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
