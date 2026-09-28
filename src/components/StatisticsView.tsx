import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Flame,
  AlertTriangle,
  RotateCcw,
  Zap,
  Swords,
  FlaskConical,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

type ModeFilter = 'competitive' | 'practice' | 'all';
type TimeRange = '7d' | '30d' | 'all';
type MetricTab = 'rating' | 'accuracy' | 'time' | 'volume';

export const StatisticsView: React.FC = () => {
  const {
    user,
    competitiveSessions,
    practiceSessions,
    competitiveStats,
    practiceStats,
    overallStats,
    categoryStatsByMode,
    weakArea,
    mistakes,
    setIsMistakeBankModalOpen,
    startSession,
  } = useApp();

  const [modeFilter, setModeFilter] = useState<ModeFilter>('competitive');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [metricTab, setMetricTab] = useState<MetricTab>('rating');

  // Filter sessions based on modeFilter and timeRange
  const now = Date.now();
  const filterByTime = (date: number) => {
    if (timeRange === '7d') return now - date <= 7 * 86400 * 1000;
    if (timeRange === '30d') return now - date <= 30 * 86400 * 1000;
    return true;
  };

  const activeSessions =
    modeFilter === 'competitive'
      ? competitiveSessions
      : modeFilter === 'practice'
      ? practiceSessions
      : [...competitiveSessions, ...practiceSessions].sort((a, b) => b.date - a.date);

  const filteredSessions = activeSessions.filter((s) => filterByTime(s.date)).reverse();

  // Active stats depending on selected mode
  const currentStats =
    modeFilter === 'competitive'
      ? competitiveStats
      : modeFilter === 'practice'
      ? practiceStats
      : overallStats;

  const currentCategoryMap = categoryStatsByMode[modeFilter];

  const SKILL_CATEGORIES = [
    { key: 'addition', label: 'Addition', defaultAcc: 98 },
    { key: 'subtraction', label: 'Subtraction', defaultAcc: 96 },
    { key: 'multiplication', label: 'Multiplication', defaultAcc: 94 },
    { key: 'division', label: 'Division', defaultAcc: 91 },
    { key: 'decimals', label: 'Decimals', defaultAcc: 89 },
    { key: 'fractions', label: 'Fractions', defaultAcc: 84 },
    { key: 'negative', label: 'Negative Numbers', defaultAcc: 82 },
    { key: 'multi-step', label: 'Multi-Step / Nested', defaultAcc: 80 },
  ];

  // Prepare chart data points
  const chartPoints = filteredSessions.map((s, idx) => {
    let val = 0;
    if (metricTab === 'rating') val = s.ratingAfter || user?.competitiveRating || 1000;
    else if (metricTab === 'accuracy') val = s.accuracy;
    else if (metricTab === 'time') val = s.averageTime;
    else if (metricTab === 'volume') val = s.totalQuestions;

    return {
      label: `S${idx + 1}`,
      value: val,
      session: s,
    };
  });

  const values = chartPoints.map((p) => p.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  const valRange = maxVal - minVal || 1;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D1219] border border-[#202833]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#111720] border border-[#202833] text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
              Performance Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8B95A5]">
            Separated performance tracking for competitive rank, practice speed, and skill mastery.
          </p>
        </div>

        {/* Total Questions Solved Badge */}
        <div className="bg-[#111720] p-3 rounded-xl border border-[#202833] self-start sm:self-auto">
          <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Questions Solved</span>
          <span className="text-lg font-bold font-math text-cyan-400">
            {user?.questionsSolved || 0}
          </span>
        </div>
      </div>

      {/* Fix 6: Prominent Mode Segmented Control (COMPETITIVE | PRACTICE | ALL) */}
      <div className="flex p-1 rounded-xl bg-[#0D1219] border border-[#202833] max-w-md">
        <button
          onClick={() => {
            setModeFilter('competitive');
            setMetricTab('rating');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            modeFilter === 'competitive'
              ? 'bg-[#111720] text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-[#8B95A5] hover:text-[#F5F7FA]'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Competitive</span>
        </button>

        <button
          onClick={() => {
            setModeFilter('practice');
            if (metricTab === 'rating') setMetricTab('accuracy');
          }}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            modeFilter === 'practice'
              ? 'bg-[#111720] text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-[#8B95A5] hover:text-[#F5F7FA]'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>

        <button
          onClick={() => setModeFilter('all')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
            modeFilter === 'all'
              ? 'bg-[#111720] text-cyan-400 border border-cyan-500/30 shadow-sm'
              : 'text-[#8B95A5] hover:text-[#F5F7FA]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Activity</span>
        </button>
      </div>

      {/* Weak Skill Detection Alert */}
      {weakArea && (
        <div className="p-4 sm:p-5 rounded-xl bg-[#111720] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                WEAK AREA DETECTED
              </span>
              <h3 className="text-base font-bold text-[#F5F7FA] capitalize">
                {weakArea.category}: {weakArea.accuracy}% Accuracy
              </h3>
              <p className="text-xs text-[#8B95A5] mt-0.5">
                Targeted drills will boost your overall calculation index.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              startSession({
                mode: 'practice',
                level: user?.competitiveLevel || 1,
                questionCount: 20,
                hasTimer: false,
                category: weakArea.category as any,
              })
            }
            className="py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors shrink-0 self-start sm:self-center"
          >
            Start Targeted Practice
          </button>
        </div>
      )}

      {/* Primary Metrics 4-Grid based on Mode Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833]">
          <span className="text-xs font-medium text-[#8B95A5] block mb-1">
            {modeFilter === 'competitive' ? 'Competitive Elo' : modeFilter === 'practice' ? 'Practice Questions' : 'Total Questions'}
          </span>
          <div className="text-2xl font-bold font-math text-cyan-400">
            {modeFilter === 'competitive'
              ? `⚡ ${user?.competitiveRating || 1000}`
              : currentStats.totalQuestions}
          </div>
          <span className="text-[11px] text-[#8B95A5] mt-1 block">
            {modeFilter === 'competitive'
              ? `Tier L${user?.competitiveLevel || 1}`
              : `${currentStats.sessionsCount} sessions`}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833]">
          <span className="text-xs font-medium text-[#8B95A5] block mb-1">
            {modeFilter === 'competitive' ? 'Comp Accuracy' : modeFilter === 'practice' ? 'Practice Accuracy' : 'Overall Accuracy'}
          </span>
          <div className="text-2xl font-bold font-math text-[#F5F7FA]">
            {currentStats.accuracy > 0 ? `${currentStats.accuracy}%` : '100%'}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {currentStats.totalCorrect} correct
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833]">
          <span className="text-xs font-medium text-[#8B95A5] block mb-1">Average Speed</span>
          <div className="text-2xl font-bold font-math text-[#F5F7FA]">
            {currentStats.avgTime > 0 ? `${currentStats.avgTime}s` : '—'}
          </div>
          <span className="text-[11px] text-[#8B95A5] mt-1 block">Per question</span>
        </div>

        <div className="p-4 rounded-xl bg-[#111720] border border-[#202833]">
          <span className="text-xs font-medium text-[#8B95A5] block mb-1">
            {modeFilter === 'competitive' ? 'Best Streak' : 'Best Run Streak'}
          </span>
          <div className="text-2xl font-bold font-math text-amber-400">
            🔥 {modeFilter === 'competitive' ? user?.bestStreak || 0 : currentStats.bestStreak || 0}
          </div>
          <span className="text-[11px] text-[#8B95A5] mt-1 block">Consecutive correct</span>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE PERFORMANCE GRAPHS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA]">
              {modeFilter === 'competitive'
                ? 'Competitive Trends'
                : modeFilter === 'practice'
                ? 'Practice Velocity'
                : 'Activity Trends'}
            </h2>
            <p className="text-xs text-[#8B95A5]">Historical progression over completed sessions.</p>
          </div>

          <div className="flex items-center space-x-1 p-1 rounded-lg bg-[#0D1219] border border-[#202833] self-start sm:self-auto">
            {(['7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  timeRange === r
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-[#8B95A5] hover:text-[#F5F7FA]'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#202833]/80 pb-3">
          {[
            ...(modeFilter === 'competitive' ? [{ id: 'rating', label: 'Rating', icon: Zap }] : []),
            { id: 'accuracy', label: 'Accuracy (%)', icon: Target },
            { id: 'time', label: 'Avg Time (s)', icon: Clock },
            { id: 'volume', label: 'Questions Solved', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = metricTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMetricTab(tab.id as MetricTab)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Minimalist Chart Canvas */}
        <div className="h-48 w-full pt-4 flex flex-col justify-end">
          {chartPoints.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#8B95A5] space-y-1">
              <TrendingUp className="w-6 h-6 text-[#202833]" />
              <p className="text-xs">No {modeFilter} sessions in this time window.</p>
            </div>
          ) : (
            <div className="h-full flex items-end justify-between gap-1.5 sm:gap-3 px-2">
              {chartPoints.map((pt, i) => {
                const heightPercent = Math.max(15, Math.min(100, Math.round(((pt.value - minVal) / valRange) * 80 + 15)));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#0D1219] border border-[#202833] text-[10px] font-math text-[#F5F7FA] whitespace-nowrap pointer-events-none transition-opacity z-10 shadow-lg">
                      {pt.value} {metricTab === 'accuracy' ? '%' : metricTab === 'time' ? 's' : ''} (L{pt.session.level})
                    </div>

                    <div
                      className="w-full max-w-[28px] rounded-t bg-cyan-500/30 group-hover:bg-cyan-400 transition-colors"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] text-[#8B95A5] font-math mt-1 truncate">
                      {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: SKILL BREAKDOWN PROGRESS BARS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA]">Skill Category Breakdown</h2>
          <p className="text-xs text-[#8B95A5]">
            Fluency index for {modeFilter === 'competitive' ? 'competitive' : modeFilter === 'practice' ? 'practice' : 'all'} calculations.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {SKILL_CATEGORIES.map((cat) => {
            const data = currentCategoryMap[cat.key];
            const acc = data && data.total > 0 ? data.accuracy : cat.defaultAcc;
            const total = data ? data.total : 0;

            return (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-[#F5F7FA]">{cat.label}</span>
                    {total > 0 && (
                      <span className="text-[10px] text-[#8B95A5]">({total} solved)</span>
                    )}
                  </div>
                  <span className="font-math font-bold text-[#F5F7FA]">{acc}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-[#0D1219] border border-[#202833] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      acc >= 90
                        ? 'bg-emerald-400'
                        : acc >= 80
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${acc}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MISTAKE BANK PREVIEW */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧠</span>
            <h3 className="text-base font-bold text-[#F5F7FA]">Mistake Bank</h3>
          </div>
          <p className="text-xs text-[#8B95A5]">
            {mistakes.length === 0
              ? 'No errors recorded. Your mistake bank is completely clear!'
              : `${mistakes.length} calculations stored for targeted repetition.`}
          </p>
        </div>

        {mistakes.length > 0 && (
          <button
            onClick={() => setIsMistakeBankModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all self-start sm:self-center shrink-0 shadow-md shadow-cyan-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Open Mistake Bank ({mistakes.length})</span>
          </button>
        )}
      </div>
    </div>
  );
};
