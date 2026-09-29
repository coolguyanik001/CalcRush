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
  RotateCcw,
  MapPin,
  Trophy,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEVEL_DEFINITIONS } from '../engine/generator';
import { CURRENT_VERSION } from '../data/changelog';

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
    dailyGoalProgress,
    recommendations,
    mistakes,
    setIsMistakeBankModalOpen,
    setIsSaveProgressModalOpen,
    setIsDownloadModalOpen,
    setIsChangelogModalOpen,
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
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* 1. Top Greeting & Daily Goal Progress Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1219] border border-[#202833] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
              {getGreeting()}, {user?.name || 'Anik'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#8B95A5]">
              Train your calculation speed and mental agility with deliberate practice.
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
            <span>TRAIN TIER {currentLevel}</span>
          </button>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="pt-3 border-t border-[#202833]/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#F5F7FA]">Daily Training Goal</span>
              <span className="text-[#8B95A5] font-math">
                {dailyGoalProgress.questionsToday} / {dailyGoalProgress.goal} questions
              </span>
              {dailyGoalProgress.isGoalMet && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Goal Met!
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 text-amber-400 font-math font-semibold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{dailyGoalProgress.dailyStreak} day streak</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-[#111720] border border-[#202833] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                dailyGoalProgress.isGoalMet ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]' : 'bg-cyan-400'
              }`}
              style={{ width: `${dailyGoalProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Guest Progress Notice */}
      {user?.isGuest && user.questionsSolved >= 20 && (
        <div className="p-3.5 rounded-xl bg-[#111720] border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-xs text-[#8B95A5]">
              You've solved <span className="text-[#F5F7FA] font-bold font-math">{user.questionsSolved}</span> calculations as a guest.
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

      {/* 2. Primary 4-Metric Grid */}
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
          <span className="text-[11px] text-[#8B95A5] mt-1">Per problem</span>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8B95A5] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Session Streak</span>
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

      {/* 3. PERSONALIZED TRAINING RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">
                Tailored Training Recommendations
              </h2>
            </div>
            <span className="text-[11px] text-[#8B95A5]">Rule-Based Guidance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => {
              let badgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
              let btnStyle = 'bg-cyan-500 hover:bg-cyan-400 text-[#080B10]';
              if (rec.badgeType === 'amber') {
                badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                btnStyle = 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40';
              } else if (rec.badgeType === 'rose') {
                badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                btnStyle = 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40';
              } else if (rec.badgeType === 'emerald') {
                badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                btnStyle = 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40';
              } else if (rec.badgeType === 'purple') {
                badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                btnStyle = 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40';
              }

              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-[#111720] border border-[#202833] flex flex-col justify-between space-y-3 hover:border-[#2f3b4c] transition-colors"
                >
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${badgeStyle}`}>
                      {rec.badge}
                    </span>
                    <h3 className="text-sm font-bold text-[#F5F7FA]">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-[#8B95A5] leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (rec.sessionConfig) {
                        startSession(rec.sessionConfig);
                      } else if (rec.targetView === 'mistakes') {
                        setIsMistakeBankModalOpen(true);
                      } else if (rec.targetView) {
                        setActiveView(rec.targetView);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${btnStyle}`}
                  >
                    <span>{rec.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Current Level & Progression Map Preview Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202833]/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                CURRENT TIER
              </span>
              <span className="text-xs font-medium text-[#8B95A5]">• Level {currentLevel} of 10</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] mt-0.5">
              {currentDef?.name}
            </h2>
            <p className="text-xs text-[#8B95A5]">{currentDef?.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setActiveView('competitive')}
              className="py-2.5 px-3.5 rounded-xl bg-[#0D1219] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] font-semibold text-xs flex items-center space-x-1.5 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Progression Map</span>
            </button>

            <button
              onClick={() =>
                startSession({
                  mode: 'competitive',
                  level: currentLevel,
                  questionCount: 20,
                  hasTimer: true,
                })
              }
              className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <span>Continue Competitive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
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

      {/* 5. Quick Launch Cards: Daily Challenge & Practice */}
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
            <span className="text-[11px] font-semibold text-cyan-400">All 10 Tiers Unlocked</span>
          </div>
          <h3 className="font-bold text-base text-[#F5F7FA]">Practice Laboratory</h3>
          <p className="text-xs text-[#8B95A5] mt-1">
            Custom session lengths, Speed Demon, Survival mode, and targeted skill drills.
          </p>
        </div>
      </div>

      {/* AI Level Maker Secondary Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#111720] via-[#0D1219] to-[#111720] border border-[#202833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/40 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#080B10] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 text-base">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-[#F5F7FA]">AI LEVEL MAKER</h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">Custom Drills</span>
            </div>
            <p className="text-xs text-[#8B95A5] mt-0.5">
              Create a custom calculation drill using your own natural language instructions.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('ai-maker')}
          className="py-2 px-4 rounded-lg bg-[#111720] hover:bg-cyan-500 hover:text-[#080B10] text-cyan-400 border border-cyan-500/30 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>CREATE LEVEL</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. Recent Performance Minimal Trend Bar Chart */}
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

      {/* Multi-Platform Releases Footer Card */}
      <div className="p-4 rounded-xl bg-[#0D1219] border border-[#202833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#F5F7FA]">CalcRush Multi-Platform Release</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111720] text-cyan-400 border border-[#202833]">
                v{CURRENT_VERSION}
              </span>
            </div>
            <p className="text-[#8B95A5] mt-0.5">
              Install standalone native versions for Windows, Linux, and Android with offline persistence.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setIsChangelogModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#111720] transition-colors"
          >
            Changelog
          </button>
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
