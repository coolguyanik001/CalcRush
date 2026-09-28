import React from 'react';
import {
  Swords,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEVEL_DEFINITIONS } from '../engine/generator';

export const CompetitiveView: React.FC = () => {
  const { user, isLevelUnlocked, getLevelProgress, startSession } = useApp();
  const currentLevel = user?.competitiveLevel || 1;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* Competitive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D1219] border border-[#202833]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#111720] border border-[#202833] text-cyan-400">
              <Swords className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
              Competitive Progression
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8B95A5]">
            10 progressive tiers. Satisfy accuracy & speed criteria to advance.
          </p>
        </div>

        {/* Current Standing Pill */}
        <div className="flex items-center space-x-3 bg-[#111720] p-3 rounded-xl border border-[#202833] self-start sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Rating</span>
            <span className="text-lg font-bold font-math text-cyan-400">
              ⚡ {user?.competitiveRating || 1000}
            </span>
          </div>
          <div className="h-8 w-px bg-[#202833]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Tier</span>
            <span className="text-lg font-bold font-math text-[#F5F7FA]">
              L{currentLevel} / 10
            </span>
          </div>
        </div>
      </div>

      {/* Levels List (1 to 10) */}
      <div className="space-y-4">
        {LEVEL_DEFINITIONS.map((def) => {
          const unlocked = isLevelUnlocked(def.level);
          const isCurrent = user?.competitiveLevel === def.level;
          const reqProgress = getLevelProgress(def.level);

          return (
            <div
              key={def.level}
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-[#111720] border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
                  : unlocked
                  ? 'bg-[#111720]/80 border-[#202833] hover:border-[#2f3b4c]'
                  : 'bg-[#0D1219]/60 border-[#202833]/60 opacity-75'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Level Title & Description */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded ${
                        unlocked
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      LEVEL {def.level}
                    </span>

                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Current Rank
                      </span>
                    )}

                    {!unlocked && (
                      <span className="flex items-center space-x-1 text-xs text-[#8B95A5]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#F5F7FA]">
                    {def.name}
                  </h3>
                  <p className="text-xs text-[#8B95A5] leading-relaxed">
                    {def.description}
                  </p>

                  {/* Math Examples row */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-[#8B95A5] mr-1">
                      Examples:
                    </span>
                    {def.examples.map((ex, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#080B10] border border-[#202833] text-[11px] font-math text-[#F5F7FA]"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Action / Unlock Checklist */}
                <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                  {unlocked ? (
                    <button
                      onClick={() =>
                        startSession({
                          mode: 'competitive',
                          level: def.level,
                          questionCount: 20,
                          hasTimer: true,
                        })
                      }
                      className="w-full md:w-auto py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{isCurrent ? 'Play Session' : 'Train Level'}</span>
                    </button>
                  ) : (
                    <div className="w-full md:w-auto space-y-2">
                      <div className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider md:text-right">
                        Requirements from L{def.level - 1}:
                      </div>
                      <div className="flex flex-col space-y-1 text-xs">
                        <div
                          className={`flex items-center space-x-1.5 ${
                            reqProgress.accuracyMet ? 'text-emerald-400' : 'text-[#8B95A5]'
                          }`}
                        >
                          {reqProgress.accuracyMet ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                          <span>Accuracy ≥ {LEVEL_DEFINITIONS[def.level - 2]?.requirements.minAccuracy}%</span>
                        </div>

                        <div
                          className={`flex items-center space-x-1.5 ${
                            reqProgress.timeMet ? 'text-emerald-400' : 'text-[#8B95A5]'
                          }`}
                        >
                          {reqProgress.timeMet ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                          <span>Avg time ≤ {LEVEL_DEFINITIONS[def.level - 2]?.requirements.maxAvgTime}s</span>
                        </div>

                        <div
                          className={`flex items-center space-x-1.5 ${
                            reqProgress.canUnlock
                              ? 'text-emerald-400'
                              : 'text-[#8B95A5]'
                          }`}
                        >
                          {reqProgress.canUnlock ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                          <span>
                            Qualifying sessions: {reqProgress.sessionsCompleted} / {reqProgress.targetSessions}
                          </span>
                        </div>
                      </div>

                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-xl bg-[#0D1219] border border-[#202833] text-xs font-semibold text-[#8B95A5] opacity-60 cursor-not-allowed flex items-center justify-center space-x-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
