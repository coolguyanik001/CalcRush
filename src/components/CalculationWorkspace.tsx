import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Pause,
  ArrowLeft,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Keyboard,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Question, QuestionResult, SessionConfig } from '../types';
import {
  generateDailyChallengeQuestions,
  generateSessionQuestions,
  generateSingleNextQuestion,
  LEVEL_DEFINITIONS,
} from '../engine/generator';
import { checkAnswerMatches } from '../engine/rational';
import { soundEngine } from '../utils/audio';
import { NumericKeypad } from './NumericKeypad';
import { PauseModal } from './PauseModal';

interface WorkspaceProps {
  config: SessionConfig;
  onComplete: (results: QuestionResult[]) => void;
  onExit: () => void;
}

export const CalculationWorkspace: React.FC<WorkspaceProps> = ({
  config,
  onComplete,
  onExit,
}) => {
  const { user, mistakes } = useApp();
  const soundEnabled = user?.soundEnabled ?? true;
  const hapticsEnabled = user?.hapticsEnabled ?? true;

  // Session question queue
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);

  // Adaptive difficulty tracking (Fix 5)
  const [adaptiveLevel, setAdaptiveLevel] = useState<number>(config.level);
  const [adaptiveTrend, setAdaptiveTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  // Input & Feedback state
  const [inputValue, setInputValue] = useState('');
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [feedbackData, setFeedbackData] = useState<{
    userAns: string;
    correctCanonical: string;
    explanation?: string;
    timeTaken: number;
    xp: number;
  } | null>(null);

  // Timer & Pause state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);

  // Survival mode timeout ref (Fix 8: prevents race conditions)
  const survivalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keypad visibility & tablet support (Fix 13 & 14)
  const [showKeypad, setShowKeypad] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fix 4 & Fix 1: Initialize questions properly
  const initQuestions = useCallback(() => {
    let qList: Question[] = [];
    if (config.mode === 'daily') {
      qList = generateDailyChallengeQuestions();
    } else if (config.mode === 'mistakes') {
      if (mistakes.length > 0) {
        qList = mistakes.map((m, idx) => ({
          ...m.question,
          id: `drill_${m.id}_${idx}_${Date.now()}`,
        }));
      }
    } else if (config.bonusType) {
      // Pre-fill 30 questions for continuous replenishment
      const batchCount = config.questionCount > 0 ? config.questionCount : 30;
      qList = generateSessionQuestions(config.level, batchCount, 'all', config.bonusType);
    } else {
      const batchCount = config.questionCount > 0 ? config.questionCount : 30;
      qList = generateSessionQuestions(config.level, batchCount, config.category);
    }

    setQuestions(qList);
    setCurrentIndex(0);
    setResults([]);
    setInputValue('');
    setFeedbackState('idle');
    setFeedbackData(null);
    setElapsedTime(0);
    setAdaptiveLevel(config.level);
    setAdaptiveTrend('neutral');
    questionStartTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  }, [config, mistakes]);

  useEffect(() => {
    initQuestions();
    return () => {
      if (survivalTimeoutRef.current) {
        clearTimeout(survivalTimeoutRef.current);
      }
    };
  }, [initQuestions]);

  // Focus input on desktop
  useEffect(() => {
    if (feedbackState === 'idle' && !isPaused && !showKeypad) {
      inputRef.current?.focus();
    }
  }, [currentIndex, feedbackState, isPaused, showKeypad]);

  // Live timer interval
  useEffect(() => {
    if (feedbackState !== 'idle' || isPaused) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const rawSecs = (now - questionStartTimeRef.current - pausedTimeRef.current) / 1000;
      setElapsedTime(Math.max(0, Math.round(rawSecs * 100) / 100));
    }, 50);

    return () => clearInterval(timer);
  }, [feedbackState, isPaused]);

  // Current question & metrics
  const currentQ = questions[currentIndex];
  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const currentAccuracy =
    results.length > 0 ? Math.round((totalCorrect / results.length) * 100) : 100;

  let currentStreak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].isCorrect) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Handle Pause
  const handlePause = () => {
    if (feedbackState !== 'idle') return;
    setIsPaused(true);
    pauseStartRef.current = Date.now();
  };

  const handleResume = () => {
    if (pauseStartRef.current > 0) {
      pausedTimeRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = 0;
    }
    setIsPaused(false);
  };

  const handleRestart = () => {
    setIsPaused(false);
    initQuestions();
  };

  // Keyboard navigation & global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isPaused && feedbackState === 'idle') {
          handlePause();
        } else if (isPaused) {
          handleResume();
        }
        return;
      }

      if (feedbackState === 'incorrect' && e.key === 'Enter') {
        e.preventDefault();
        advanceToNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, feedbackState]);

  // Submit Answer
  const handleSubmit = () => {
    if (!currentQ || feedbackState !== 'idle' || isPaused) return;

    const userAns = inputValue.trim();
    if (!userAns) return;

    const questionEndTime = Date.now();
    const duration = Math.max(
      0.1,
      (questionEndTime - questionStartTimeRef.current - pausedTimeRef.current) / 1000
    );
    const timeTaken = Math.round(duration * 100) / 100;

    const isCorrect = checkAnswerMatches(userAns, currentQ.rationalValue);

    const questionResult: QuestionResult = {
      question: currentQ,
      userAnswer: userAns,
      isCorrect,
      timeTaken,
      timestamp: Date.now(),
    };

    const newResults = [...results, questionResult];
    setResults(newResults);

    // Fix 5: Adaptive difficulty real-time adjustment
    if (config.difficulty === 'adaptive') {
      if (isCorrect) {
        const bump = timeTaken <= 3.5 ? 0.4 : 0.2;
        setAdaptiveLevel((prev) => Math.min(10.0, Math.round((prev + bump) * 10) / 10));
        setAdaptiveTrend('up');
      } else {
        setAdaptiveLevel((prev) => Math.max(1.0, Math.round((prev - 0.4) * 10) / 10));
        setAdaptiveTrend('down');
      }
    }

    // Audio & Haptic Feedback
    if (isCorrect) {
      soundEngine.playCorrect(soundEnabled);
      soundEngine.triggerHaptic('correct', hapticsEnabled);
      if ((currentStreak + 1) % 5 === 0) {
        soundEngine.playStreak(soundEnabled);
        soundEngine.triggerHaptic('streak', hapticsEnabled);
      }
    } else {
      soundEngine.playIncorrect(soundEnabled);
      soundEngine.triggerHaptic('incorrect', hapticsEnabled);
    }

    const xpEarned = isCorrect ? Math.round(10 * currentQ.level * 1.5) : 0;

    setFeedbackData({
      userAns,
      correctCanonical: currentQ.correctAnswer,
      explanation: currentQ.explanation,
      timeTaken,
      xp: xpEarned,
    });

    if (isCorrect) {
      setFeedbackState('correct');
      setTimeout(() => {
        advanceNext(newResults);
      }, 550);
    } else {
      setFeedbackState('incorrect');
      // Fix 8: Survival mode automatic end with race condition safety
      if (config.survivalMode || config.bonusType === 'B7') {
        survivalTimeoutRef.current = setTimeout(() => {
          onComplete(newResults);
        }, 1200);
      }
    }
  };

  // Fix 1 & Fix 5: Advance to next question with dynamic continuous streaming for unlimited modes
  const advanceNext = (updatedResults: QuestionResult[]) => {
    // If survival mode and mistake was made, stop immediately
    if (config.survivalMode || config.bonusType === 'B7') {
      const lastResult = updatedResults[updatedResults.length - 1];
      if (lastResult && !lastResult.isCorrect) {
        if (survivalTimeoutRef.current) {
          clearTimeout(survivalTimeoutRef.current);
          survivalTimeoutRef.current = null;
        }
        onComplete(updatedResults);
        return;
      }
    }

    const nextIndex = currentIndex + 1;
    const isLimitedSession = config.questionCount > 0;
    const isFinished = isLimitedSession && nextIndex >= config.questionCount;

    if (isFinished) {
      onComplete(updatedResults);
      return;
    }

    // Fix 1: Continuous Queue Generation for Endless / Unlimited Modes
    // Pre-generate and append questions whenever approaching queue end
    if (!isLimitedSession || questions.length - nextIndex <= 5) {
      const additional: Question[] = [];
      const appendCount = 10;
      for (let i = 0; i < appendCount; i++) {
        const genLevel = config.difficulty === 'adaptive' ? Math.round(adaptiveLevel) : config.level;
        additional.push(generateSingleNextQuestion(genLevel, config.category, config.bonusType));
      }
      setQuestions((prev) => [...prev, ...additional]);
    }

    setCurrentIndex(nextIndex);
    setInputValue('');
    setFeedbackState('idle');
    setFeedbackData(null);
    setElapsedTime(0);
    questionStartTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  };

  const advanceToNextQuestion = () => {
    // Fix 8: If in survival mode and user manually confirms mistake, exit cleanly to results immediately
    if (config.survivalMode || config.bonusType === 'B7') {
      if (survivalTimeoutRef.current) {
        clearTimeout(survivalTimeoutRef.current);
        survivalTimeoutRef.current = null;
      }
      onComplete(results);
      return;
    }
    advanceNext(results);
  };

  // Fix 7: Mobile keypad submit handler (advances on incorrect feedback)
  const handleKeypadSubmit = () => {
    if (feedbackState === 'incorrect') {
      advanceToNextQuestion();
    } else {
      handleSubmit();
    }
  };

  // Fix 15: Mobile keypad input handler with space key for mixed numbers
  const handleKeypadPress = (char: string) => {
    if (feedbackState !== 'idle') return;
    setInputValue((prev) => {
      if (char === '.' && prev.includes('.')) return prev;
      if (char === '/' && prev.includes('/')) return prev;
      if (char === '-' && prev.length > 0) return prev;
      if (char === ' ') {
        // Space only allowed after whole number and before fraction (e.g. "1 " before "1/2")
        if (prev.length === 0 || prev.includes(' ') || prev.includes('/')) return prev;
      }
      return prev + char;
    });
  };

  const handleKeypadBackspace = () => {
    if (feedbackState !== 'idle') return;
    setInputValue((prev) => prev.slice(0, -1));
  };

  // Empty state for Mistake Bank drill
  if (config.mode === 'mistakes' && mistakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080B10] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#111720] border border-[#202833] flex items-center justify-center text-3xl">
          🧠
        </div>
        <h2 className="text-xl font-bold text-[#F5F7FA]">No Mistakes to Practice Yet</h2>
        <p className="text-xs text-[#8B95A5] max-w-sm leading-relaxed">
          Complete some calculations and we'll automatically save your mistakes here for targeted drill reinforcement.
        </p>
        <button
          onClick={onExit}
          className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const levelInfo = LEVEL_DEFINITIONS.find((l) => l.level === config.level);
  const isUnlimitedMode = config.questionCount === 0;
  const totalQDisplay = isUnlimitedMode ? '∞' : config.mode === 'daily' ? 50 : config.questionCount;

  if (!currentQ) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080B10]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080B10] text-[#F5F7FA] selection:bg-cyan-500/20 select-none">
      {/* Top Workspace Header */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-[#202833] bg-[#080B10]">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handlePause}
            className="p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#111720] transition-colors"
            title="Pause (Esc)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              {/* Fix 10: Accurate Daily Challenge & Mode Header */}
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {config.mode === 'daily'
                  ? 'DAILY CHALLENGE'
                  : config.mode === 'mistakes'
                  ? 'MISTAKE BANK DRILL'
                  : config.bonusType
                  ? `Bonus ${config.bonusType}`
                  : `Level ${config.level} — ${levelInfo?.name || 'Calculation'}`}
              </span>

              {/* Fix 5: Adaptive difficulty badge */}
              {config.difficulty === 'adaptive' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>L{adaptiveLevel.toFixed(1)} {adaptiveTrend === 'up' ? '↑' : adaptiveTrend === 'down' ? '↓' : ''}</span>
                </span>
              )}

              {config.survivalMode && (
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                  Survival
                </span>
              )}
            </div>
            <p className="text-xs text-[#8B95A5]">
              Question {currentIndex + 1} / {totalQDisplay}
            </p>
          </div>
        </div>

        {/* Live Metrics & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Fix 1: Finish & Save button for endless / unlimited runs */}
          {isUnlimitedMode && results.length > 0 && (
            <button
              onClick={() => onComplete(results)}
              className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              title="Conclude endless training and record results"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish & Save</span>
              <span className="sm:hidden">Finish</span>
            </button>
          )}

          {/* Fix 13 & 14: Keyboard toggle button */}
          <button
            onClick={() => setShowKeypad(!showKeypad)}
            className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-medium text-[#8B95A5] hover:text-[#F5F7FA] bg-[#111720] border border-[#202833] flex items-center space-x-1"
            title="Toggle On-Screen Keypad"
          >
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">{showKeypad ? 'Keypad' : 'Typing'}</span>
          </button>

          <div className="flex items-center space-x-1 text-xs font-semibold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400/20" />
            <span className="font-math">{currentStreak}</span>
          </div>

          <div className="flex items-center space-x-1 text-xs font-semibold text-[#8B95A5]">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="font-math">{currentAccuracy}%</span>
          </div>

          <button
            onClick={handlePause}
            className="p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#111720] transition-colors"
            title="Pause session"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress Line (for finite sessions) */}
      {config.questionCount > 0 && (
        <div className="w-full bg-[#111720] h-1">
          <div
            className="h-full bg-cyan-400 transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(100, ((currentIndex + (feedbackState !== 'idle' ? 1 : 0)) / config.questionCount) * 100)}%`,
            }}
          />
        </div>
      )}

      {/* Main Calculation Workspace */}
      <main className="flex-1 flex flex-col justify-between max-w-2xl w-full mx-auto p-3 sm:p-6 pb-4">
        {/* Calculation Box & Input Area */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
          {/* Live Timer */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#111720] border border-[#202833] text-xs font-math text-[#8B95A5] mb-4 sm:mb-6">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{elapsedTime.toFixed(2)}s</span>
            {currentQ.timeLimit && (
              <span className="text-amber-400 text-[10px]">
                / {currentQ.timeLimit}s target
              </span>
            )}
          </div>

          {/* Mathematical Expression (Dominant Typography) */}
          <div className="text-center mb-5 sm:mb-7 transition-transform duration-200">
            <div className="font-math font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight text-[#F5F7FA] leading-tight drop-shadow-sm select-text">
              {currentQ.expression}
            </div>
          </div>

          {/* Answer Input Field (Fix 14: inputMode none prevents mobile native keyboard overlay when keypad is on) */}
          <div className="w-full max-w-xs sm:max-w-sm mb-3 sm:mb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="relative"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="?"
                disabled={feedbackState !== 'idle'}
                inputMode={showKeypad ? 'none' : 'text'}
                autoFocus={!showKeypad}
                className={`w-full text-center font-math font-bold text-2xl sm:text-3xl py-2.5 sm:py-4 px-4 rounded-xl bg-[#111720] border-2 text-[#F5F7FA] transition-all outline-none ${
                  feedbackState === 'correct'
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                    : feedbackState === 'incorrect'
                    ? 'border-rose-500 bg-rose-950/20 text-rose-400'
                    : 'border-[#202833] focus:border-cyan-400 focus:shadow-[0_0_16px_rgba(6,182,212,0.2)]'
                }`}
              />
            </form>
          </div>

          {/* Feedback Display Banner */}
          {feedbackState === 'correct' && feedbackData && (
            <div className="w-full max-w-sm p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-center space-x-1.5 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>CORRECT</span>
              </div>
              <p className="text-xs text-[#8B95A5] mt-1 font-math">
                {currentQ.expression} = <span className="text-emerald-300 font-semibold">{feedbackData.correctCanonical}</span>
              </p>
              <div className="flex items-center justify-center space-x-3 text-[11px] text-[#8B95A5] mt-1.5">
                <span className="text-emerald-400 font-semibold font-math">+{feedbackData.xp} XP</span>
                <span>•</span>
                <span className="font-math">{feedbackData.timeTaken.toFixed(2)}s</span>
              </div>
            </div>
          )}

          {feedbackState === 'incorrect' && feedbackData && (
            <div className="w-full max-w-sm p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-center animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-center space-x-1.5 text-rose-400 font-bold text-sm">
                <XCircle className="w-4 h-4" />
                <span>INCORRECT</span>
              </div>

              <div className="my-2 space-y-1 text-xs">
                <p className="text-[#8B95A5]">
                  Your answer:{' '}
                  <span className="line-through text-rose-400 font-math font-semibold">
                    {feedbackData.userAns || 'empty'}
                  </span>
                </p>
                <p className="text-[#F5F7FA]">
                  Correct answer:{' '}
                  <span className="text-emerald-400 font-math font-bold text-sm">
                    {feedbackData.correctCanonical}
                  </span>
                </p>
              </div>

              {feedbackData.explanation && (
                <div className="mt-2.5 p-2 rounded-lg bg-[#080B10]/70 text-[11px] text-[#8B95A5] font-math border border-[#202833]">
                  {feedbackData.explanation}
                </div>
              )}

              {/* Next Question Button */}
              <button
                onClick={advanceToNextQuestion}
                className="mt-3 w-full py-2.5 px-4 rounded-lg bg-[#111720] hover:bg-[#18202c] border border-[#202833] text-xs font-semibold text-[#F5F7FA] flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-[10px] text-[#8B95A5] ml-1">(Enter / ⏎)</span>
              </button>
            </div>
          )}

          {/* Desktop Submit Button (if idle and keypad hidden) */}
          {feedbackState === 'idle' && !showKeypad && (
            <div className="mt-3">
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-30 disabled:pointer-events-none text-[#080B10] font-bold text-sm transition-all shadow-md shadow-cyan-500/20"
              >
                Submit (Enter)
              </button>
            </div>
          )}
        </div>

        {/* Fix 13: Numeric Keypad visible on phones and tablets */}
        {showKeypad && (
          <div className="w-full mt-auto pt-1">
            <NumericKeypad
              onKeyPress={handleKeypadPress}
              onBackspace={handleKeypadBackspace}
              onSubmit={handleKeypadSubmit}
              soundEnabled={soundEnabled}
              hapticsEnabled={hapticsEnabled}
              disabled={feedbackState !== 'idle'}
              allowSubmitWhenDisabled={feedbackState === 'incorrect'}
            />
          </div>
        )}
      </main>

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={handleResume}
        onRestart={handleRestart}
        onExit={onExit}
      />
    </div>
  );
};
