import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Zap,
  FlaskConical,
  Clock,
  Target,
  ChevronRight,
  Shield,
  Trophy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEVEL_DEFINITIONS } from '../engine/generator';

interface LevelMapProps {
  onSelectLevel?: (level: number) => void;
}

export const CompetitiveLevelMap: React.FC<LevelMapProps> = ({ onSelectLevel }) => {
  const { user, isLevelUnlocked, getLevelProgress, startSession, competitiveSessions } = useApp();
  const currentRank = user?.competitiveLevel || 1;

  const [filter, setFilter] = useState<'all' | 'unlocked' | 'current'>('all');

  const getDifficultyTier = (lvl: number): { label: string; color: string } => {
    if (lvl === 1) return { label: 'Elementary', color: 'text-cyan-400' };
    if (lvl === 2) return { label: 'Basic', color: 'text-cyan-400' };
    if (lvl <= 4) return { label: 'Intermediate', color: 'text-sky-400' };
    if (lvl <= 6) return { label: 'Advanced', color: 'text-indigo-400' };
    if (lvl <= 8) return { label: 'Master', color: 'text-amber-400' };
    if (lvl === 9) return { label: 'Grandmaster', color: 'text-rose-400' };
    return { label: 'Elite Grandmaster', color: 'text-purple-400' };
  };

  const getLevelBestStats = (lvl: number) => {
    const sessions = competitiveSessions.filter((s) => s.level === lvl);
    if (sessions.length === 0) return { bestAcc: null, bestTime: null, totalSessions: 0 };
    const bestAcc = Math.max(...sessions.map((s) => s.accuracy));
    const bestTime = Math.min(...sessions.map((s) => s.averageTime));
    return { bestAcc, bestTime, totalSessions: sessions.length };
  };

  const filteredLevels = LEVEL_DEFINITIONS.filter((def) => {
    const unlocked = isLevelUnlocked(def.level);
    const isCurrent = def.level === currentRank;
    if (filter === 'unlocked') return unlocked;
    if (filter === 'current') return isCurrent;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Interactive Visual Progression Node Map */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1219] border border-[#202833] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-[#F5F7FA] tracking-tight">Progression Roadmap</h2>
          </div>
          <span className="text-xs text-[#8B95A5] font-math">
            Current: Tier {currentRank} / 10
          </span>
        </div>

        {/* Step-chain track */}
        <div className="overflow-x-auto pb-2 pt-1 scrollbar-none">
          <div className="flex items-center min-w-[700px] justify-between relative px-2">
            {/* Background track line */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#202833] -z-0" />

            {LEVEL_DEFINITIONS.map((def) => {
              const unlocked = isLevelUnlocked(def.level);
              const isCurrent = def.level === currentRank;
              const isCompleted = def.level < currentRank;
              const req = getLevelProgress(def.level);

              let nodeBg = 'bg-[#111720] border-[#202833] text-[#8B95A5]';
              if (isCurrent) {
                nodeBg = 'bg-cyan-500 border-cyan-400 text-[#080B10] shadow-[0_0_15px_rgba(6,182,212,0.4)]';
              } else if (isCompleted) {
                nodeBg = 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400';
              } else if (unlocked) {
                nodeBg = 'bg-[#18202c] border-cyan-500/40 text-cyan-300';
              }

              return (
                <div key={def.level} className="flex flex-col items-center space-y-1.5 z-10 group">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center font-math font-bold text-xs transition-all ${nodeBg}`}
                    title={`Level ${def.level}: ${def.name}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Zap className="w-4 h-4 fill-current" />
                    ) : unlocked ? (
                      <span>{def.level}</span>
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-math whitespace-nowrap ${
                      isCurrent ? 'text-cyan-400 font-bold' : isCompleted ? 'text-emerald-400' : 'text-[#8B95A5]'
                    }`}
                  >
                    L{def.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Filter tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0D1219] rounded-xl border border-[#202833] w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#18202c] text-[#F5F7FA] shadow-sm'
              : 'text-[#8B95A5] hover:text-[#F5F7FA]'
          }`}
        >
          All 10 Tiers
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'unlocked'
              ? 'bg-[#18202c] text-[#F5F7FA] shadow-sm'
              : 'text-[#8B95A5] hover:text-[#F5F7FA]'
          }`}
        >
          Unlocked
        </button>
        <button
          onClick={() => setFilter('current')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'current'
              ? 'bg-[#18202c] text-[#F5F7FA] shadow-sm'
              : 'text-[#8B95A5] hover:text-[#F5F7FA]'
          }`}
        >
          Current Rank
        </button>
      </div>

      {/* 3. Detailed Level Cards */}
      <div className="space-y-4">
        {filteredLevels.map((def) => {
          const unlocked = isLevelUnlocked(def.level);
          const isCurrent = def.level === currentRank;
          const isCompleted = def.level < currentRank;
          const tier = getDifficultyTier(def.level);
          const stats = getLevelBestStats(def.level);

          // Requirements from previous level (or for this level if qualifying for next)
          const targetNext = def.level + 1;
          const nextDef = LEVEL_DEFINITIONS.find((l) => l.level === targetNext);
          const unlockProgress = getLevelProgress(targetNext);

          return (
            <div
              key={def.level}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-[#111720] border-cyan-500/50 shadow-[0_0_24px_rgba(6,182,212,0.08)]'
                  : unlocked
                  ? 'bg-[#111720]/80 border-[#202833] hover:border-[#2f3b4c]'
                  : 'bg-[#0D1219]/60 border-[#202833]/60 opacity-70'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Level Title & Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : unlocked
                          ? 'bg-zinc-800 text-zinc-300'
                          : 'bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      LEVEL {def.level}
                    </span>

                    <span className={`text-xs font-medium ${tier.color}`}>
                      {tier.label}
                    </span>

                    {isCurrent && (
                      <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                        Current Rank
                      </span>
                    )}

                    {isCompleted && (
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </span>
                    )}

                    {!unlocked && (
                      <span className="text-[11px] text-[#8B95A5] flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#F5F7FA]">
                      {def.name}
                    </h3>
                    <p className="text-xs text-[#8B95A5] leading-relaxed mt-0.5">
                      {def.description}
                    </p>
                  </div>

                  {/* Math Examples */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-[#8B95A5] mr-1">
                      Sample:
                    </span>
                    {def.examples.slice(0, 3).map((ex, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#080B10] border border-[#202833] text-[11px] font-math text-[#F5F7FA]"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>

                  {/* Best Performance on This Level */}
                  {stats.totalSessions > 0 && (
                    <div className="flex items-center space-x-4 pt-1 text-xs text-[#8B95A5]">
                      <span>
                        Best Acc:{' '}
                        <strong className="text-[#F5F7FA] font-math font-semibold">
                          {stats.bestAcc}%
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Best Speed:{' '}
                        <strong className="text-[#F5F7FA] font-math font-semibold">
                          {stats.bestTime?.toFixed(2)}s
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        Sessions:{' '}
                        <strong className="text-[#F5F7FA] font-math font-semibold">
                          {stats.totalSessions}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Right Side: Qualification Criteria & Direct CTAs */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 shrink-0 lg:min-w-[240px]">
                  {/* Unlock / Promotion Requirements */}
                  {isCurrent && nextDef && (
                    <div className="p-3 rounded-xl bg-[#0D1219] border border-[#202833] text-xs space-y-1.5 w-full">
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Qualify for Level {targetNext}</span>
                        <span className="font-math">
                          {unlockProgress.sessionsCompleted}/{unlockProgress.targetSessions}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-[#8B95A5]">
                        {unlockProgress.accuracyMet ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                        <span>Acc ≥ {def.requirements.minAccuracy}%</span>
                        <span>·</span>
                        {unlockProgress.timeMet ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                        <span>Time ≤ {def.requirements.maxAvgTime}s</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto lg:w-full">
                    {unlocked ? (
                      <>
                        <button
                          onClick={() =>
                            startSession({
                              mode: 'competitive',
                              level: def.level,
                              questionCount: 20,
                              hasTimer: true,
                            })
                          }
                          className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>{isCurrent ? 'Enter Qualifying' : 'Compete'}</span>
                        </button>

                        <button
                          onClick={() =>
                            startSession({
                              mode: 'practice',
                              level: def.level,
                              questionCount: 20,
                              hasTimer: false,
                            })
                          }
                          className="py-2.5 px-3.5 rounded-xl bg-[#0D1219] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                          title="Practice without rating stakes"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Practice</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center py-2 px-3 rounded-xl bg-[#0D1219] border border-[#202833] text-xs text-[#8B95A5] flex items-center justify-center space-x-1.5 opacity-60 cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Qualify on Level {def.level - 1} to Unlock</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
