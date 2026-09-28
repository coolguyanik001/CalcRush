import React, { useState } from 'react';
import { X, RotateCcw, Trash2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MistakeRecord } from '../types';

export const MistakeBankModal: React.FC = () => {
  const {
    mistakes,
    isMistakeBankModalOpen,
    setIsMistakeBankModalOpen,
    solveMistake,
    startSession,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isMistakeBankModalOpen) return null;

  const filteredMistakes =
    selectedCategory === 'all'
      ? mistakes
      : mistakes.filter((m) => m.question.category === selectedCategory);

  const categories = Array.from(new Set(mistakes.map((m) => m.question.category)));

  // Practice similar questions
  const handlePracticeSimilar = (mistake: MistakeRecord) => {
    setIsMistakeBankModalOpen(false);
    startSession({
      mode: 'practice',
      level: mistake.question.level,
      questionCount: 15,
      hasTimer: false,
      category: mistake.question.category,
    });
  };

  // Practice all mistakes in a dedicated drill session
  const handlePracticeAll = () => {
    setIsMistakeBankModalOpen(false);
    startSession({
      mode: 'mistakes',
      level: 1,
      questionCount: Math.min(20, mistakes.length),
      hasTimer: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#111720] border border-[#202833] p-5 sm:p-7 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#202833]">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧠</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#F5F7FA]">Mistake Bank</h2>
              <p className="text-xs text-[#8B95A5]">
                {mistakes.length} calculations stored for targeted reinforcement.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMistakeBankModalOpen(false)}
            className="p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#0D1219] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 py-3 border-b border-[#202833]/60">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA]'
              }`}
            >
              All ({mistakes.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {filteredMistakes.length === 0 ? (
            <div className="py-12 text-center text-[#8B95A5] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-medium text-[#F5F7FA]">Mistake Bank is clean!</p>
              <p className="text-xs">No unresolved errors in this category.</p>
            </div>
          ) : (
            filteredMistakes.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#0D1219] border border-[#202833] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#111720] border border-[#202833] text-cyan-400">
                      Level {m.question.level}
                    </span>
                    <span className="text-xs capitalize text-[#8B95A5]">
                      {m.question.category}
                    </span>
                  </div>

                  <div className="font-math font-bold text-base sm:text-lg text-[#F5F7FA] pt-0.5">
                    {m.question.expression}
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-math">
                    <span className="text-rose-400">
                      Your answer: <span className="line-through">{m.userAnswer || 'empty'}</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Correct: {m.question.correctAnswer}
                    </span>
                  </div>

                  {m.question.explanation && (
                    <p className="text-[11px] text-[#8B95A5] font-math pt-1">
                      {m.question.explanation}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handlePracticeSimilar(m)}
                    className="py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Practice Similar</span>
                  </button>

                  <button
                    onClick={() => solveMistake(m.id)}
                    className="p-2 rounded-lg text-[#8B95A5] hover:text-emerald-400 hover:bg-[#111720] transition-colors"
                    title="Mark resolved"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions */}
        {mistakes.length > 0 && (
          <div className="pt-3 border-t border-[#202833] flex justify-end">
            <button
              onClick={handlePracticeAll}
              className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
            >
              <span>Drill Mistakes Set</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
