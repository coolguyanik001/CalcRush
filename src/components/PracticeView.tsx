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
  Target,
  Gauge,
  Layers,
  ArrowRight,
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
  const { user, startSession, bonusRecords, mistakes, setIsMistakeBankModalOpen, weakArea, setActiveView } = useApp();
  const currentRank = user?.competitiveLevel || 1;

  // Custom Practice Session Config
  const [selectedLevel, setSelectedLevel] = useState<number>(currentRank);
  const [sessionLength, setSessionLength] = useState<number>(20); // 10, 20, 50, 100, 0 (unlimited)
  const [timerMode, setTimerMode] = useState<'normal' | 'off' | 'pace_2' | 'pace_3' | 'pace_5'>('normal');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('normal');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');

  const handleStartCustomPractice = () => {
    let targetPace: number | undefined;
    let hasTimer = true;

    if (timerMode === 'off') {
      hasTimer = false;
    } else if (timerMode === 'pace_2') {
      targetPace = 2.0;
    } else if (timerMode === 'pace_3') {
      targetPace = 3.0;
    } else if (timerMode === 'pace_5') {
      targetPace = 5.0;
    }

    startSession({
      mode: 'practice',
      level: selectedLevel,
      questionCount: sessionLength,
      hasTimer,
      targetPace,
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

  // Quick Drill Presets Handlers
  const handleLaunchPreset = (type: 'speed_blitz' | 'precision_20' | 'fractions' | 'decimals' | 'weakest') => {
    if (type === 'speed_blitz') {
      startSession({
        mode: 'practice',
        level: currentRank,
        questionCount: 10,
        hasTimer: true,
        targetPace: 2.0,
      });
    } else if (type === 'precision_20') {
      startSession({
        mode: 'practice',
        level: currentRank,
        questionCount: 20,
        hasTimer: false,
      });
    } else if (type === 'fractions') {
      startSession({
        mode: 'practice',
        level: 4,
        questionCount: 20,
        hasTimer: true,
        category: 'fractions',
      });
    } else if (type === 'decimals') {
      startSession({
        mode: 'practice',
        level: 3,
        questionCount: 50,
        hasTimer: true,
        category: 'decimals',
      });
    } else if (type === 'weakest') {
      startSession({
        mode: 'practice',
        level: currentRank,
        questionCount: 20,
        hasTimer: false,
        category: (weakArea?.category as any) || 'all',
      });
    }
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
            Targeted skill drills, tempo tuning, and 8 bonus challenge modes. Zero rating pressure.
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

      {/* 🤖 AI Level Maker Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#111720] via-cyan-950/20 to-[#111720] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-base">🤖</span>
            <h3 className="font-bold text-sm sm:text-base text-[#F5F7FA]">AI Level Maker</h3>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider">
              Natural Language
            </span>
          </div>
          <p className="text-xs text-[#8B95A5] max-w-xl">
            Prompt any custom training drill—from Olympiad rational arithmetic to rapid mental math blitzes.
          </p>
        </div>
        <button
          onClick={() => setActiveView('ai-maker')}
          className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-cyan-500/20 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Open AI Level Maker</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* QUICK DRILL PRESETS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B95A5]">
            Quick Drill Presets
          </h2>
          <span className="text-[11px] text-[#8B95A5]">1-Click Launch</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Preset 1: Speed Blitz */}
          <button
            onClick={() => handleLaunchPreset('speed_blitz')}
            className="p-3.5 rounded-xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-lg">⚡</span>
              <h3 className="text-xs font-bold text-[#F5F7FA] mt-1.5 group-hover:text-cyan-300 transition-colors">
                Speed Blitz
              </h3>
              <p className="text-[10px] text-[#8B95A5] mt-0.5">10Q · 2.0s tempo</p>
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold mt-2.5 flex items-center space-x-1">
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Preset 2: Precision 20 */}
          <button
            onClick={() => handleLaunchPreset('precision_20')}
            className="p-3.5 rounded-xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-lg">🎯</span>
              <h3 className="text-xs font-bold text-[#F5F7FA] mt-1.5 group-hover:text-cyan-300 transition-colors">
                Precision 20
              </h3>
              <p className="text-[10px] text-[#8B95A5] mt-0.5">20Q · Untimed</p>
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold mt-2.5 flex items-center space-x-1">
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Preset 3: Fractions Workout */}
          <button
            onClick={() => handleLaunchPreset('fractions')}
            className="p-3.5 rounded-xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-lg">📐</span>
              <h3 className="text-xs font-bold text-[#F5F7FA] mt-1.5 group-hover:text-cyan-300 transition-colors">
                Fractions
              </h3>
              <p className="text-[10px] text-[#8B95A5] mt-0.5">20Q · L4 Fractions</p>
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold mt-2.5 flex items-center space-x-1">
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Preset 4: Decimals Marathon */}
          <button
            onClick={() => handleLaunchPreset('decimals')}
            className="p-3.5 rounded-xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-lg">🔢</span>
              <h3 className="text-xs font-bold text-[#F5F7FA] mt-1.5 group-hover:text-cyan-300 transition-colors">
                Decimals
              </h3>
              <p className="text-[10px] text-[#8B95A5] mt-0.5">50Q · L3 Decimals</p>
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold mt-2.5 flex items-center space-x-1">
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          {/* Preset 5: Weakest Area Drill */}
          <button
            onClick={() => handleLaunchPreset('weakest')}
            className="p-3.5 rounded-xl bg-[#111720] border border-amber-500/30 hover:border-amber-500/50 text-left transition-all group flex flex-col justify-between col-span-2 sm:col-span-1"
          >
            <div>
              <span className="text-lg">🩹</span>
              <h3 className="text-xs font-bold text-[#F5F7FA] mt-1.5 group-hover:text-amber-300 transition-colors">
                Weakest Area
              </h3>
              <p className="text-[10px] text-amber-400/90 capitalize mt-0.5">
                {weakArea ? `${weakArea.category} (${weakArea.accuracy}%)` : 'Targeted Drill'}
              </p>
            </div>
            <span className="text-[10px] text-amber-400 font-semibold mt-2.5 flex items-center space-x-1">
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 1: CUSTOM PRACTICE CONFIGURATOR */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-6">
        <div className="flex items-center justify-between border-b border-[#202833]/80 pb-3">
          <h2 className="text-base font-bold text-[#F5F7FA] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Custom Drill Configurator</span>
          </h2>
          <span className="text-xs text-[#8B95A5]">Full Parameter Control</span>
        </div>

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

        {/* 2. Operation / Category Filter */}
        <div>
          <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
            Operation / Focus Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { val: 'all', label: 'All Operations' },
              { val: 'addition', label: 'Addition' },
              { val: 'subtraction', label: 'Subtraction' },
              { val: 'multiplication', label: 'Multiplication' },
              { val: 'division', label: 'Division' },
              { val: 'decimals', label: 'Decimals' },
              { val: 'fractions', label: 'Fractions' },
              { val: 'negative', label: 'Negatives' },
              { val: 'multi-step', label: 'Multi-Step' },
            ].map((cat) => (
              <button
                key={cat.val}
                onClick={() => setCategoryFilter(cat.val as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === cat.val
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Session Length */}
        <div>
          <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
            Question Count
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

        {/* 4. Timer & Pace Selector */}
        <div>
          <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
            Timer & Target Tempo
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { val: 'normal', label: 'Free Timer' },
              { val: 'off', label: 'Untimed' },
              { val: 'pace_2', label: '2.0s Pace' },
              { val: 'pace_3', label: '3.0s Pace' },
              { val: 'pace_5', label: '5.0s Pace' },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setTimerMode(t.val as any)}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  timerMode === t.val
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Difficulty Engine */}
        <div>
          <label className="text-xs font-semibold text-[#8B95A5] uppercase tracking-wider block mb-2">
            Difficulty Dynamic
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal', title: 'Normal', desc: 'Standard level range' },
              { id: 'hard', title: 'Hard', desc: 'Upper complexity bounds' },
              { id: 'adaptive', title: 'Adaptive', desc: 'Real-time level adjustment' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id as DifficultyMode)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  difficulty === d.id
                    ? 'bg-cyan-500/10 border-cyan-500/40'
                    : 'bg-[#0D1219] border-[#202833] hover:border-[#2f3b4c]'
                }`}
              >
                <div
                  className={`text-xs font-bold ${
                    difficulty === d.id ? 'text-cyan-400' : 'text-[#F5F7FA]'
                  }`}
                >
                  {d.title}
                </div>
                <div className="text-[10px] text-[#8B95A5] mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartCustomPractice}
          className="w-full py-3.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START PRACTICE SESSION</span>
        </button>
      </div>

      {/* SECTION 2: 8 BONUS CHALLENGE MODES */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F7FA]">8 Bonus Challenge Modes</h2>
          <p className="text-xs text-[#8B95A5]">Specialized endurance and agility trials.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {BONUS_MODES.map((b) => {
            const rec = bonusRecords[b.id];
            const recordVal = renderBonusRecordValue(b.id, rec);

            return (
              <div
                key={b.id}
                onClick={() => handleStartBonus(b)}
                className="p-4 sm:p-5 rounded-2xl bg-[#111720] border border-[#202833] hover:border-cyan-500/40 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                          BONUS {b.id}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-[#F5F7FA] group-hover:text-cyan-300 transition-colors">
                          {b.title}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8B95A5] block">
                        {b.bestRecordLabel}
                      </span>
                      <span className="text-xs font-bold font-math text-[#F5F7FA]">
                        {recordVal}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#8B95A5] leading-relaxed mt-2">
                    {b.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#202833]/80 flex items-center justify-between text-xs">
                  <span className="text-[#8B95A5]">
                    {b.id === 'B6' || b.id === 'B7' || b.id === 'B8' ? 'Continuous stream' : '25 questions'}
                  </span>
                  <span className="font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                    <span>Play</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
