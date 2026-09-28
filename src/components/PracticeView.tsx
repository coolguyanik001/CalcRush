import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  Sparkles,
  Zap,
  RotateCcw,
  Clock,
  Shuffle,
  ShieldAlert,
  Flame,
  Infinity,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BonusModeDef, DifficultyMode, SkillCategory } from '../types';
import { LEVEL_DEFINITIONS } from '../engine/generator';

const BONUS_MODES: BonusModeDef[] = [
  {
    id: 'B1',
    title: 'Random Mix',
    icon: '🌀',
    description: 'Dynamic mix across all 10 normal levels in random succession.',
    bestRecordLabel: 'Best Score',
  },
  {
    id: 'B2',
    title: 'Speed Demon',
    icon: '⚡',
    description: 'Rapid elementary calculations with a tight 2.5s target tempo.',
    bestRecordLabel: 'Fastest Average',
  },
  {
    id: 'B3',
    title: 'Chaos',
    icon: '🔀',
    description: 'Unpredictable blends of percentages, signed numbers, decimals & fractions.',
    bestRecordLabel: 'Best Streak',
  },
  {
    id: 'B4',
    title: 'Multi-Step',
    icon: '🧠',
    description: 'Long nested expressions demanding multi-layered mental reduction.',
    bestRecordLabel: 'High Score',
  },
  {
    id: 'B5',
    title: 'Precision',
    icon: '🎯',
    description: 'Decimal place value and precision arithmetic without approximations.',
    bestRecordLabel: 'Accuracy',
  },
  {
    id: 'B6',
    title: 'Endless',
    icon: '🔥',
    description: 'Non-stop calculations. Continue until you choose to conclude the session.',
    bestRecordLabel: 'Most Solved',
  },
  {
    id: 'B7',
    title: 'Survival',
    icon: '💀',
    description: 'Zero margin for error. A single mistake immediately terminates the run.',
    bestRecordLabel: 'Highest Streak',
  },
  {
    id: 'B8',
    title: 'Infinite',
    icon: '♾️',
    description: 'Unlimited mixed calculations across all mathematical categories.',
    bestRecordLabel: 'High Streak',
  },
];

export const PracticeView: React.FC = () => {
  const { startSession, bonusRecords, mistakes, setIsMistakeBankModalOpen } = useApp();

  // Custom Practice Session Config
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [sessionLength, setSessionLength] = useState<number>(20); // 10, 20, 50, 100, 0 (unlimited)
  const [hasTimer, setHasTimer] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('normal');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');

  const handleStartCustomPractice = () => {
    startSession({
      mode: 'practice',
      level: selectedLevel,
      questionCount: sessionLength,
      hasTimer,
      difficulty,
      category: categoryFilter,
    });
  };

  const handleStartBonus = (bonus: BonusModeDef) => {
    startSession({
      mode: 'bonus',
      level: selectedLevel,
      questionCount: bonus.id === 'B6' || bonus.id === 'B7' || bonus.id === 'B8' ? 0 : 25,
      hasTimer: true,
      bonusType: bonus.id,
      survivalMode: bonus.id === 'B7',
    });
  };

  const renderBonusRecordValue = (
    bId: string,
    rec?: { bestStreak: number; bestScore: number; bestAvgTime: number }
  ) => {
    if (!rec) return '—';
    if (bId === 'B2') {
      return rec.bestAvgTime && rec.bestAvgTime < 900 ? `${rec.bestAvgTime.toFixed(2)}s` : '—';
    }
    if (bId === 'B5') {
      const pct = rec.bestScore > 0 ? Math.min(100, Math.round((rec.bestScore / 25) * 100)) : 100;
      return `${pct}%`;
    }
    if (bId === 'B7') {
      return `${rec.bestStreak || rec.bestScore || 0}`;
    }
    return `${rec.bestScore || rec.bestStreak || 0}`;
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* Practice Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D1219] border border-[#202833]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#111720] border border-[#202833] text-cyan-400">
              <FlaskConical className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
              Practice Laboratory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8B95A5]">
            All 10 levels and 8 bonus modes unlocked. Zero rating pressure.
          </p>
        </div>

        {/* Mistake Bank Quick Trigger */}
        {mistakes.length > 0 && (
          <button
            onClick={() => setIsMistakeBankModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center space-x-2 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Mistakes ({mistakes.length})</span>
          </button>
        )}
      </div>

      {/* SECTION 1: CUSTOM PRACTICE CONFIGURATOR */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-6">
        <h2 className="text-base font-bold text-[#F5F7FA] flex items-center space-x-2">
          <span>Custom Training Session</span>
        </h2>

        {/* 1. Level Selector (L1 - L10) */}
        <div>
          <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
            Target Level: <span className="text-cyan-400 font-bold">L{selectedLevel} — {LEVEL_DEFINITIONS[selectedLevel - 1]?.name}</span>
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-math font-bold transition-all ${
                  selectedLevel === lvl
                    ? 'bg-cyan-500 text-[#080B10] shadow-md shadow-cyan-500/20'
                    : 'bg-[#0D1219] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833]'
                }`}
              >
                L{lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Session Length */}
        <div>
          <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
            Questions Count
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { val: 10, label: '10' },
              { val: 20, label: '20' },
              { val: 50, label: '50' },
              { val: 100, label: '100' },
              { val: 0, label: '∞ Endless' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setSessionLength(opt.val)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  sessionLength === opt.val
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Settings Grid: Timer, Difficulty, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Timer */}
          <div>
            <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
              Timer
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setHasTimer(true)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  hasTimer
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#0D1219] text-[#8B95A5] border border-[#202833]'
                }`}
              >
                On
              </button>
              <button
                onClick={() => setHasTimer(false)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  !hasTimer
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#0D1219] text-[#8B95A5] border border-[#202833]'
                }`}
              >
                Off (Calm)
              </button>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
              Difficulty Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'hard', 'adaptive'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 rounded-lg text-[11px] font-medium capitalize transition-all ${
                    difficulty === diff
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#0D1219] text-[#8B95A5] border border-[#202833]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
              Skill Focus
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full py-2 px-3 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] outline-none focus:border-cyan-400 capitalize"
            >
              <option value="all">All Topics (Default)</option>
              <option value="addition">Addition</option>
              <option value="subtraction">Subtraction</option>
              <option value="multiplication">Multiplication</option>
              <option value="division">Division</option>
              <option value="decimals">Decimals</option>
              <option value="fractions">Fractions</option>
              <option value="negative">Negative Numbers</option>
              <option value="multi-step">Multi-Step</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartCustomPractice}
          className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Practice Session</span>
        </button>
      </div>

      {/* SECTION 2: MIXED BONUS LEVELS */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA]">Mixed Bonus Levels</h2>
          <p className="text-xs text-[#8B95A5]">
            Specialized challenges to test endurance, speed, and complex rational calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {BONUS_MODES.map((bonus) => {
            const record = bonusRecords[bonus.id];
            return (
              <div
                key={bonus.id}
                className="p-4 rounded-xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{bonus.icon}</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#0D1219] border border-[#202833] text-cyan-400 font-math">
                      {bonus.id}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#F5F7FA] group-hover:text-cyan-300 transition-colors">
                    {bonus.title}
                  </h3>
                  <p className="text-[11px] text-[#8B95A5] mt-1 leading-relaxed">
                    {bonus.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#202833]/60 mt-3 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-[#8B95A5]">
                    <span>{bonus.bestRecordLabel}</span>
                    <span className="font-math font-semibold text-[#F5F7FA]">
                      {renderBonusRecordValue(bonus.id, record)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartBonus(bonus)}
                    className="w-full py-2 rounded-lg bg-[#0D1219] hover:bg-cyan-500 text-[#F5F7FA] hover:text-[#080B10] border border-[#202833] hover:border-cyan-400 text-xs font-semibold flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>Play</span>
                    <Zap className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
