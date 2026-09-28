import React from 'react';
import {
  Flame,
  Target,
  Clock,
  Zap,
  ArrowRight,
  Swords,
  FlaskConical,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Circle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEVEL_DEFINITIONS } from '../engine/generator';

export const HomeDashboard: React.FC = () => {
  const {
    user,
    setActiveView,
    startSession,
    getLevelProgress,
    overallStats,
    weakArea,
    competitiveSessions,
    dailyRecords,
    setIsSaveProgressModalOpen,
  } = useApp();

  const currentLevel = user?.competitiveLevel || 1;
  const currentDef = LEVEL_DEFINITIONS.find((l) => l.level === currentLevel);
  const nextLevel = Math.min(10, currentLevel + 1);
  const nextDef = LEVEL_DEFINITIONS.find((l) => l.level === nextLevel);

  // Next level unlock requirements
  const nextReqProgress = getLevelProgress(nextLevel);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Check if today's daily challenge is completed
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const isDailyCompleted = dailyRecords[dateKey]?.completed;

  // Mini performance trend for the last 7 sessions
  const recentSessions = competitiveSessions.slice(0, 7).reverse();

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* Top Greeting & Quick Training CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D1219] border border-[#202833]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
              {getGreeting()}, {user?.name || 'Anik'} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8B95A5]">
            Ready for today's calculation training?
          </p>
        </div>

        <button
          onClick={() =>
            startSession({
              mode: 'competitive',
              level: currentLevel,
              questionCount: 20,
              hasTimer: true,
            })
          }
          className="py-3 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 shrink-0 select-none active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>QUICK TRAINING</span>
        </button>
      </div>

      {/* Guest Progress Notice (unobtrusive conversion reminder) */}
      {user?.isGuest && user.questionsSolved >= 20 && (
        <div className="p-3.5 rounded-xl bg-[#111720] border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-xs text-[#8B95A5]">
              You've solved <span className="text-[#F5F7FA] font-bold font-math">{user.questionsSolved}</span> questions as a guest.
            </p>
          </div>
          <button
            onClick={() => setIsSaveProgressModalOpen(true)}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 shrink-0"
          >
            Save Progress
          </button>
        </div>
      )}

      {/* Primary 4-Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Rating */}
        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B95A5] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rating</span>
            <span className="text-cyan-400 text-sm">⚡</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-math text-[#F5F7FA]">
            {user?.competitiveRating || 1000}
          </div>
          <span className="text-[11px] text-[#8B95A5] mt-1">Competitive Elo</span>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B95A5] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Accuracy</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-math text-[#F5F7FA]">
            {overallStats.accuracy > 0 ? `${overallStats.accuracy}%` : '100%'}
          </div>
          <span className="text-[11px] text-[#8B95A5] mt-1">All calculations</span>
        </div>

        {/* Average Time */}
        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B95A5] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-math text-[#F5F7FA]">
            {overallStats.avgTime > 0 ? `${overallStats.avgTime}s` : '—'}
          </div>
          <span className="text-[11px] text-[#8B95A5] mt-1">Per question</span>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B95A5] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-math text-amber-400">
            {user?.currentStreak || 0}
          </div>
          <span className="text-[11px] text-[#8B95A5] mt-1">
            Best: {user?.bestStreak || 0}
          </span>
        </div>
      </div>

      {/* Current Level & Next Unlock Progression Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202833]/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                CURRENT LEVEL
              </span>
              <span className="text-xs font-medium text-[#8B95A5]">• Level {currentLevel} of 10</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] mt-0.5">
              {currentDef?.name}
            </h2>
            <p className="text-xs text-[#8B95A5]">{currentDef?.subtitle}</p>
          </div>

          <button
            onClick={() =>
              startSession({
                mode: 'competitive',
                level: currentLevel,
                questionCount: 20,
                hasTimer: true,
              })
            }
            className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all self-start sm:self-center"
          >
            <span>Continue Competitive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress towards Next Level Checklist */}
        {currentLevel < 10 && nextDef && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#F5F7FA]">
                Requirements to Unlock Level {nextLevel} ({nextDef.name})
              </span>
              <span className="text-[#8B95A5] font-math text-[11px]">
                {nextReqProgress.sessionsCompleted}/{nextReqProgress.targetSessions} sessions
              </span>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                  nextReqProgress.accuracyMet
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#0D1219] border-[#202833] text-[#8B95A5]'
                }`}
              >
                {nextReqProgress.accuracyMet ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[#8B95A5] shrink-0" />
                )}
                <span>Accuracy ≥ {currentDef?.requirements.minAccuracy}%</span>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                  nextReqProgress.timeMet
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#0D1219] border-[#202833] text-[#8B95A5]'
                }`}
              >
                {nextReqProgress.timeMet ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[#8B95A5] shrink-0" />
                )}
                <span>Avg time ≤ {currentDef?.requirements.maxAvgTime}s</span>
              </div>

              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                  nextReqProgress.canUnlock
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#0D1219] border-[#202833] text-[#8B95A5]'
                }`}
              >
                {nextReqProgress.canUnlock ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[#8B95A5] shrink-0" />
                )}
                <span>
                  Qualifying sessions: {nextReqProgress.sessionsCompleted} / {nextReqProgress.targetSessions}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Smart Recommendation Banner */}
      {weakArea ? (
        <div className="p-4 rounded-xl bg-[#111720] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                RECOMMENDED FOCUS
              </span>
              <p className="text-xs sm:text-sm font-medium text-[#F5F7FA]">
                Your {weakArea.category} accuracy is at {weakArea.accuracy}%.
              </p>
              <p className="text-xs text-[#8B95A5]">
                Targeted practice will elevate your overall competitive rating.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              startSession({
                mode: 'practice',
                level: currentLevel,
                questionCount: 20,
                hasTimer: false,
                category: weakArea.category as any,
              })
            }
            className="py-2 px-3.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/40 transition-colors shrink-0 self-start sm:self-center"
          >
            Start Practice
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#111720] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                RECOMMENDED
              </span>
              <p className="text-xs sm:text-sm font-medium text-[#F5F7FA]">
                Consistent 20-question sessions build speed & automaticity.
              </p>
              <p className="text-xs text-[#8B95A5]">
                Complete your next session to push towards Level {nextLevel}.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              startSession({
                mode: 'competitive',
                level: currentLevel,
                questionCount: 20,
                hasTimer: true,
              })
            }
            className="py-2 px-3.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-xs border border-cyan-500/40 transition-colors shrink-0 self-start sm:self-center"
          >
            Train Now
          </button>
        </div>
      )}

      {/* Quick Launch Cards: Daily Challenge & Practice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Daily Challenge Card */}
        <div
          onClick={() =>
            startSession({
              mode: 'daily',
              level: currentLevel,
              questionCount: 50,
              hasTimer: true,
            })
          }
          className="p-5 rounded-xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#0D1219] border border-[#202833] flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            {isDailyCompleted ? (
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-400">Today's 50 Questions</span>
            )}
          </div>
          <h3 className="font-bold text-base text-[#F5F7FA]">Daily Challenge</h3>
          <p className="text-xs text-[#8B95A5] mt-1">
            Deterministic 50-problem mixed calculation set. Compete for daily personal records.
          </p>
        </div>

        {/* Practice Mode Card */}
        <div
          onClick={() => setActiveView('practice')}
          className="p-5 rounded-xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#0D1219] border border-[#202833] flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
              <FlaskConical className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-cyan-400">All Unlocked</span>
          </div>
          <h3 className="font-bold text-base text-[#F5F7FA]">Practice & Bonus Levels</h3>
          <p className="text-xs text-[#8B95A5] mt-1">
            Custom session lengths, Speed Demon, Survival mode, and targeted skill drills.
          </p>
        </div>
      </div>

      {/* Recent Performance Minimal Trend Bar Chart */}
      {recentSessions.length > 0 && (
        <div className="p-5 rounded-xl bg-[#111720] border border-[#202833]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                Recent Competitive Sessions
              </h3>
            </div>
            <button
              onClick={() => setActiveView('statistics')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Full Stats →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 items-end h-24 pt-4">
            {recentSessions.map((s, idx) => {
              const heightPct = Math.max(20, s.accuracy);
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div
                    className="w-full rounded-t bg-cyan-500/30 group-hover:bg-cyan-400 transition-colors relative"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#0D1219] border border-[#202833] text-[10px] font-math text-[#F5F7FA] whitespace-nowrap pointer-events-none transition-opacity">
                      {s.accuracy}%
                    </div>
                  </div>
                  <span className="text-[10px] text-[#8B95A5] font-math mt-1">
                    L{s.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
