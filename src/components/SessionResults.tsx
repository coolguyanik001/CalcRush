import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SessionSummary } from '../types';
import { useApp } from '../context/AppContext';
import { LEVEL_DEFINITIONS } from '../engine/generator';

interface SessionResultsProps {
  summary: SessionSummary;
  onContinue: () => void;
  onPlayAgain: () => void;
  onPracticeMistakes?: () => void;
}

export const SessionResults: React.FC<SessionResultsProps> = ({
  summary,
  onContinue,
  onPlayAgain,
  onPracticeMistakes,
}) => {
  const { newLevelUnlocked, isLevelUnlocked } = useApp();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const levelInfo = LEVEL_DEFINITIONS.find((l) => l.level === summary.level);
  const incorrectCount = summary.totalQuestions - summary.correctCount;

  return (
    <div className="min-h-screen bg-[#080B10] text-[#F5F7FA] px-4 py-8 max-w-2xl mx-auto flex flex-col justify-between">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#111720] border border-[#202833] text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            <span>{summary.mode} Session Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {summary.accuracy >= 90 ? 'Outstanding Calculation!' : summary.accuracy >= 70 ? 'Solid Session' : 'Keep Training'}
          </h1>
          <p className="text-xs text-[#8B95A5]">
            Level {summary.level}: {levelInfo?.name || 'Calculation'}
          </p>
        </div>

        {/* Level Unlock Announcement Banner if newly unlocked */}
        {newLevelUnlocked && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#111720] to-cyan-950/40 border border-cyan-500/40 text-center animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center space-x-2 text-cyan-400 font-bold text-sm">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>🎉 LEVEL {newLevelUnlocked} UNLOCKED</span>
            </div>
            <p className="text-xs text-[#8B95A5] mt-1">
              You fulfilled all requirements to advance to {LEVEL_DEFINITIONS[newLevelUnlocked - 1]?.name}!
            </p>
          </div>
        )}

        {/* Rating & XP Primary Banner */}
        <div className="grid grid-cols-2 gap-3">
          {summary.mode === 'competitive' ? (
            <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] text-center">
              <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Competitive Rating
              </span>
              <div className="flex items-center justify-center space-x-2 font-math">
                <span className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
                  {summary.ratingBefore}
                </span>
                <span className="text-xs text-[#8B95A5]">→</span>
                <span className="text-xl sm:text-2xl font-bold text-cyan-400">
                  {summary.ratingAfter}
                </span>
              </div>
              <span
                className={`text-xs font-math font-semibold inline-block mt-1 ${
                  summary.ratingDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {summary.ratingDelta >= 0 ? `+${summary.ratingDelta}` : summary.ratingDelta}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] text-center">
              <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                Score
              </span>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-math">
                {summary.correctCount} / {summary.totalQuestions}
              </div>
              <span className="text-xs text-[#8B95A5] inline-block mt-1">
                Practice Session
              </span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#111720] border border-[#202833] text-center">
            <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
              XP Earned
            </span>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-math">
              +{summary.xpEarned}
            </div>
            <span className="text-xs text-[#8B95A5] inline-block mt-1">
              Proficiency XP
            </span>
          </div>
        </div>

        {/* Performance Metrics 4-Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#111720] border border-[#202833] text-center">
            <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-semibold text-[#8B95A5]">Accuracy</span>
            </div>
            <p className="text-lg font-bold font-math text-[#F5F7FA]">{summary.accuracy}%</p>
          </div>

          <div className="p-3 rounded-xl bg-[#111720] border border-[#202833] text-center">
            <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-semibold text-[#8B95A5]">Avg Time</span>
            </div>
            <p className="text-lg font-bold font-math text-[#F5F7FA]">{summary.averageTime}s</p>
          </div>

          <div className="p-3 rounded-xl bg-[#111720] border border-[#202833] text-center">
            <div className="flex items-center justify-center space-x-1 text-amber-400 mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-semibold text-[#8B95A5]">Best Streak</span>
            </div>
            <p className="text-lg font-bold font-math text-amber-400">{summary.bestStreak}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#111720] border border-[#202833] text-center">
            <div className="flex items-center justify-center space-x-1 text-emerald-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-semibold text-[#8B95A5]">Fastest</span>
            </div>
            <p className="text-lg font-bold font-math text-emerald-400">{summary.fastestTime}s</p>
          </div>
        </div>

        {/* Mistake Bank Notification if errors occurred */}
        {incorrectCount > 0 && (
          <div className="p-3.5 rounded-xl bg-[#111720] border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#F5F7FA]">
                  {incorrectCount} {incorrectCount === 1 ? 'calculation saved' : 'calculations saved'} to Mistake Bank
                </p>
                <p className="text-[11px] text-[#8B95A5]">
                  Targeted drills available to master these patterns.
                </p>
              </div>
            </div>
            {onPracticeMistakes && (
              <button
                onClick={onPracticeMistakes}
                className="py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-semibold text-xs border border-amber-500/30 transition-colors shrink-0"
              >
                Practice
              </button>
            )}
          </div>
        )}

        {/* Detailed Question Review Dropdown */}
        <div className="rounded-xl bg-[#111720] border border-[#202833] overflow-hidden">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full p-3.5 flex items-center justify-between text-left text-xs font-semibold text-[#8B95A5] hover:text-[#F5F7FA] transition-colors"
          >
            <span>Review All {summary.results.length} Calculations</span>
            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showBreakdown && (
            <div className="border-t border-[#202833] divide-y divide-[#202833]/50 max-h-64 overflow-y-auto p-2">
              {summary.results.map((r, idx) => (
                <div key={idx} className="p-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {r.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-math font-medium text-[#F5F7FA]">
                      {r.question.expression}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 font-math text-[11px]">
                    {!r.isCorrect && (
                      <span className="line-through text-rose-400/80">
                        {r.userAnswer || 'empty'}
                      </span>
                    )}
                    <span className="text-emerald-400 font-semibold">
                      {r.question.correctAnswer}
                    </span>
                    <span className="text-[#8B95A5]">{r.timeTaken}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-4 border-t border-[#202833] grid grid-cols-2 gap-3">
        <button
          onClick={onPlayAgain}
          className="py-3 px-4 rounded-xl bg-[#111720] hover:bg-[#18202c] active:bg-[#202833] border border-[#202833] text-xs sm:text-sm font-semibold text-[#F5F7FA] flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-[#8B95A5]" />
          <span>Play Again</span>
        </button>

        <button
          onClick={onContinue}
          className="py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
