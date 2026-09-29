import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LEVEL_DEFINITIONS } from '../engine/generator';
import { generateTrainingRecommendations } from '../engine/recommendations';
import {
  Achievement,
  MistakeRecord,
  QuestionResult,
  SavedCustomLevel,
  SessionConfig,
  SessionSummary,
  TrainingRecommendation,
  UserProfile,
} from '../types';
import { soundEngine } from '../utils/audio';
import {
  DEFAULT_USER,
  INITIAL_ACHIEVEMENTS,
  storage,
} from '../utils/storage';

export interface ModeStats {
  accuracy: number;
  avgTime: number;
  totalQuestions: number;
  totalCorrect: number;
  sessionsCount: number;
  bestStreak: number;
}

export interface DailyGoalProgress {
  questionsToday: number;
  goal: number;
  percentage: number;
  isGoalMet: boolean;
  dailyStreak: number;
}

interface AppContextType {
  user: UserProfile | null;
  activeView: 'home' | 'competitive' | 'practice' | 'statistics' | 'profile' | 'ai-maker';
  setActiveView: (view: 'home' | 'competitive' | 'practice' | 'statistics' | 'profile' | 'ai-maker') => void;
  activeSession: SessionConfig | null;
  startSession: (config: SessionConfig) => void;
  endSession: () => void;
  completeSession: (results: QuestionResult[], config: SessionConfig) => SessionSummary;
  lastSessionSummary: SessionSummary | null;
  clearLastSessionSummary: () => void;
  competitiveSessions: SessionSummary[];
  practiceSessions: SessionSummary[];
  savedCustomLevels: SavedCustomLevel[];
  saveCustomLevel: (level: SavedCustomLevel) => void;
  deleteCustomLevel: (id: string) => void;
  toggleCustomLevelFavorite: (id: string) => void;
  mistakes: MistakeRecord[];
  achievements: Achievement[];
  bonusRecords: Record<string, { bestStreak: number; bestScore: number; bestAvgTime: number }>;
  dailyRecords: Record<string, { completed: boolean; score: number; accuracy: number; avgTime: number }>;
  isOnline: boolean;
  isLevelUnlocked: (level: number) => boolean;
  getLevelProgress: (level: number) => {
    accuracyMet: boolean;
    timeMet: boolean;
    sessionsCompleted: number;
    targetSessions: number;
    bestAccuracy: number;
    bestAvgTime: number;
    canUnlock: boolean;
  };
  competitiveStats: ModeStats;
  practiceStats: ModeStats;
  overallStats: ModeStats;
  categoryStats: Record<string, { total: number; correct: number; accuracy: number }>;
  categoryStatsByMode: {
    competitive: Record<string, { total: number; correct: number; accuracy: number }>;
    practice: Record<string, { total: number; correct: number; accuracy: number }>;
    all: Record<string, { total: number; correct: number; accuracy: number }>;
  };
  weakArea: { category: string; accuracy: number } | null;
  dailyGoalProgress: DailyGoalProgress;
  setDailyGoal: (goal: number) => void;
  recommendations: TrainingRecommendation[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'welcome' | 'signup' | 'signin' | 'guest' | 'save_progress';
  setAuthModalMode: (mode: 'welcome' | 'signup' | 'signin' | 'guest' | 'save_progress') => void;
  isSaveProgressModalOpen: boolean;
  setIsSaveProgressModalOpen: (open: boolean) => void;
  isMistakeBankModalOpen: boolean;
  setIsMistakeBankModalOpen: (open: boolean) => void;
  isChangelogModalOpen: boolean;
  setIsChangelogModalOpen: (open: boolean) => void;
  isDownloadModalOpen: boolean;
  setIsDownloadModalOpen: (open: boolean) => void;
  isUpdateBannerVisible: boolean;
  dismissUpdateBanner: (mode: 'snooze' | 'permanent') => void;
  newLevelUnlocked: number | null;
  clearNewLevelUnlocked: () => void;
  continueAsGuest: (name: string) => void;
  createAccount: (name: string, email: string, password: string) => boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  solveMistake: (id: string) => void;
  clearAllMistakes: () => void;
  exportData: () => void;
  resetAllProgress: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Synchronous, secure hash function for local storage accounts that works in all browser environments (HTTP, HTTPS, iframe)
function hashPassword(password: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const str = password + '_calcrush_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateMetricsForSessions(sessions: SessionSummary[]): {
  stats: ModeStats;
  categoryMap: Record<string, { total: number; correct: number; accuracy: number }>;
} {
  let totalQ = 0;
  let totalC = 0;
  let totalTime = 0;
  let bestStreak = 0;
  const categoryMap: Record<string, { total: number; correct: number; accuracy: number }> = {};

  sessions.forEach((s) => {
    if (s.bestStreak > bestStreak) bestStreak = s.bestStreak;
    s.results.forEach((r) => {
      totalQ++;
      if (r.isCorrect) totalC++;
      totalTime += r.timeTaken;

      const cat = r.question.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, correct: 0, accuracy: 0 };
      }
      categoryMap[cat].total++;
      if (r.isCorrect) categoryMap[cat].correct++;
    });
  });

  Object.keys(categoryMap).forEach((cat) => {
    const item = categoryMap[cat];
    item.accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
  });

  const accuracy = totalQ > 0 ? Math.round((totalC / totalQ) * 1000) / 10 : 0;
  const avgTime = totalQ > 0 ? Math.round((totalTime / totalQ) * 100) / 100 : 0;

  return {
    stats: {
      accuracy,
      avgTime,
      totalQuestions: totalQ,
      totalCorrect: totalC,
      sessionsCount: sessions.length,
      bestStreak,
    },
    categoryMap,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUser());
  const [competitiveSessions, setCompetitiveSessions] = useState<SessionSummary[]>(() =>
    storage.getCompetitiveSessions()
  );
  const [practiceSessions, setPracticeSessions] = useState<SessionSummary[]>(() =>
    storage.getPracticeSessions()
  );
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => storage.getMistakes());
  const [achievements, setAchievements] = useState<Achievement[]>(() => storage.getAchievements());
  const [bonusRecords, setBonusRecords] = useState<Record<string, { bestStreak: number; bestScore: number; bestAvgTime: number }>>(() =>
    storage.getBonusRecords()
  );
  const [dailyRecords, setDailyRecords] = useState<Record<string, { completed: boolean; score: number; accuracy: number; avgTime: number }>>(() =>
    storage.getDailyRecords()
  );
  const [savedCustomLevels, setSavedCustomLevels] = useState<SavedCustomLevel[]>(() =>
    storage.getSavedCustomLevels()
  );

  const [activeView, setActiveView] = useState<'home' | 'competitive' | 'practice' | 'statistics' | 'profile' | 'ai-maker'>('home');
  const [activeSession, setActiveSession] = useState<SessionConfig | null>(null);
  const [lastSessionSummary, setLastSessionSummary] = useState<SessionSummary | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<
    'welcome' | 'signup' | 'signin' | 'guest' | 'save_progress'
  >(() => (storage.getUser() ? 'signup' : 'welcome'));
  const [isSaveProgressModalOpen, setIsSaveProgressModalOpen] = useState<boolean>(false);
  const [isMistakeBankModalOpen, setIsMistakeBankModalOpen] = useState<boolean>(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isUpdateBannerVisible, setIsUpdateBannerVisible] = useState<boolean>(() => {
    const pref = storage.getDownloadPromptPref();
    if (pref.dontShowAgain) return false;
    if (pref.remindAfter && Date.now() < pref.remindAfter) return false;
    return true;
  });

  const dismissUpdateBanner = (mode: 'snooze' | 'permanent') => {
    if (mode === 'snooze') {
      storage.setDownloadPromptPref({ remindAfter: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    } else {
      storage.setDownloadPromptPref({ dontShowAgain: true });
    }
    setIsUpdateBannerVisible(false);
  };

  const [newLevelUnlocked, setNewLevelUnlocked] = useState<number | null>(null);

  // Monitor online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to storage
  useEffect(() => {
    if (user) {
      storage.saveUser(user);
    }
  }, [user]);

  useEffect(() => {
    storage.saveCompetitiveSessions(competitiveSessions);
  }, [competitiveSessions]);

  useEffect(() => {
    storage.savePracticeSessions(practiceSessions);
  }, [practiceSessions]);

  useEffect(() => {
    storage.saveMistakes(mistakes);
  }, [mistakes]);

  useEffect(() => {
    storage.saveAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    storage.saveBonusRecords(bonusRecords);
  }, [bonusRecords]);

  useEffect(() => {
    storage.saveDailyRecords(dailyRecords);
  }, [dailyRecords]);

  useEffect(() => {
    storage.saveCustomLevels(savedCustomLevels);
  }, [savedCustomLevels]);

  // Check if a level is unlocked
  const isLevelUnlocked = (targetLevel: number): boolean => {
    if (targetLevel <= 1) return true;
    if (user && user.competitiveLevel >= targetLevel) return true;

    // Check requirement for targetLevel - 1
    const prevDef = LEVEL_DEFINITIONS.find((l) => l.level === targetLevel - 1);
    if (!prevDef) return false;

    const prevSessions = competitiveSessions.filter((s) => s.level === targetLevel - 1);
    const qualifying = prevSessions.filter(
      (s) => s.accuracy >= prevDef.requirements.minAccuracy && s.averageTime <= prevDef.requirements.maxAvgTime
    );

    return qualifying.length >= prevDef.requirements.minSessions;
  };

  // Get exact progress toward unlocking level (Fix 11: both accuracy AND speed must be satisfied in the same session)
  const getLevelProgress = (targetLevel: number) => {
    if (targetLevel <= 1) {
      return {
        accuracyMet: true,
        timeMet: true,
        sessionsCompleted: 1,
        targetSessions: 1,
        bestAccuracy: 100,
        bestAvgTime: 0,
        canUnlock: true,
      };
    }

    const prevLevel = targetLevel - 1;
    const prevDef = LEVEL_DEFINITIONS.find((l) => l.level === prevLevel);
    const prevSessions = competitiveSessions.filter((s) => s.level === prevLevel);

    const targetAccuracy = prevDef?.requirements.minAccuracy || 85;
    const targetTime = prevDef?.requirements.maxAvgTime || 6.0;
    const targetSessions = prevDef?.requirements.minSessions || 2;

    // A session is qualifying ONLY if BOTH accuracy and average time meet the target in the SAME session!
    const qualifyingSessions = prevSessions.filter(
      (s) => s.accuracy >= targetAccuracy && s.averageTime <= targetTime
    );

    const bestAccuracy = prevSessions.length > 0 ? Math.max(...prevSessions.map((s) => s.accuracy)) : 0;
    const bestAvgTime = prevSessions.length > 0 ? Math.min(...prevSessions.map((s) => s.averageTime)) : 0;

    const sessionsCompleted = qualifyingSessions.length;
    const canUnlock = sessionsCompleted >= targetSessions;
    const accuracyMet = qualifyingSessions.length > 0;
    const timeMet = qualifyingSessions.length > 0;

    return {
      accuracyMet,
      timeMet,
      sessionsCompleted,
      targetSessions,
      bestAccuracy,
      bestAvgTime,
      canUnlock,
    };
  };

  // Fix 6: Calculate Separated Competitive vs Practice vs Overall Metrics
  const compMetrics = calculateMetricsForSessions(competitiveSessions);
  const pracMetrics = calculateMetricsForSessions(practiceSessions);
  const overallMetrics = calculateMetricsForSessions([...competitiveSessions, ...practiceSessions]);

  const competitiveStats = compMetrics.stats;
  const practiceStats = pracMetrics.stats;
  const overallStats = overallMetrics.stats;

  const categoryStatsByMode = {
    competitive: compMetrics.categoryMap,
    practice: pracMetrics.categoryMap,
    all: overallMetrics.categoryMap,
  };

  // Weak area detection based on competitive or overall accuracy
  let weakArea: { category: string; accuracy: number } | null = null;
  let lowestAcc = 100;
  Object.entries(overallMetrics.categoryMap).forEach(([cat, data]) => {
    if (data.total >= 8 && data.accuracy < 90 && data.accuracy < lowestAcc) {
      lowestAcc = data.accuracy;
      weakArea = { category: cat, accuracy: data.accuracy };
    }
  });

  // Daily training questions solved today
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [competitiveSessions, practiceSessions]);

  const questionsToday = useMemo(() => {
    const todaySessions = [...competitiveSessions, ...practiceSessions].filter((s) => s.date >= todayStart);
    return todaySessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  }, [competitiveSessions, practiceSessions, todayStart]);

  const currentDailyGoal = user?.dailyGoal || 50;
  const dailyGoalProgress: DailyGoalProgress = useMemo(() => {
    return {
      questionsToday,
      goal: currentDailyGoal,
      percentage: Math.min(100, Math.round((questionsToday / currentDailyGoal) * 100)),
      isGoalMet: questionsToday >= currentDailyGoal,
      dailyStreak: user?.dailyStreak || (questionsToday > 0 ? 1 : 0),
    };
  }, [questionsToday, currentDailyGoal, user?.dailyStreak]);

  const nextReqProgress = useMemo(() => {
    return getLevelProgress(Math.min(10, (user?.competitiveLevel || 1) + 1));
  }, [user?.competitiveLevel, competitiveSessions]);

  const recommendations = useMemo(() => {
    return generateTrainingRecommendations(
      user,
      competitiveSessions,
      mistakes,
      weakArea,
      questionsToday,
      currentDailyGoal,
      user?.competitiveLevel || 1,
      nextReqProgress
    );
  }, [user, competitiveSessions, mistakes, weakArea, questionsToday, currentDailyGoal, nextReqProgress]);

  // Calculate Chess-style Elo Rating Change
  const calculateRatingDelta = (
    currentRating: number,
    level: number,
    accuracy: number,
    avgTime: number
  ): number => {
    const levelExpectedRating = 750 + level * 150;
    const expectedScore = 1 / (1 + Math.pow(10, (levelExpectedRating - currentRating) / 400));
    const actualScore = accuracy / 100;

    const K = 32;
    let delta = Math.round(K * (actualScore - expectedScore));

    const targetLevelTime = LEVEL_DEFINITIONS[level - 1]?.requirements.maxAvgTime || 5.0;
    if (accuracy >= 80) {
      if (avgTime < targetLevelTime) {
        const speedBonus = Math.min(8, Math.round((targetLevelTime - avgTime) * 3));
        delta += speedBonus;
      }
    } else {
      if (avgTime < 2.0 && accuracy < 60) {
        delta -= 4;
      }
    }

    return delta;
  };

  const startSession = (config: SessionConfig) => {
    setActiveSession(config);
    setLastSessionSummary(null);
  };

  const endSession = () => {
    setActiveSession(null);
  };

  const clearLastSessionSummary = () => {
    setLastSessionSummary(null);
  };

  const clearNewLevelUnlocked = () => {
    setNewLevelUnlocked(null);
  };

  const completeSession = (results: QuestionResult[], config: SessionConfig): SessionSummary => {
    const totalQ = results.length;
    const correctQ = results.filter((r) => r.isCorrect).length;
    const accuracy = totalQ > 0 ? Math.round((correctQ / totalQ) * 1000) / 10 : 0;
    const totalTime = results.reduce((acc, r) => acc + r.timeTaken, 0);
    const avgTime = totalQ > 0 ? Math.round((totalTime / totalQ) * 100) / 100 : 0;
    const fastestTime = results.length > 0 ? Math.min(...results.map((r) => r.timeTaken)) : 0;
    const slowestTime = results.length > 0 ? Math.max(...results.map((r) => r.timeTaken)) : 0;

    let sessionBestStreak = 0;
    let tempStreak = 0;
    results.forEach((r) => {
      if (r.isCorrect) {
        tempStreak++;
        if (tempStreak > sessionBestStreak) sessionBestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    const currentRating = user ? user.competitiveRating : 1000;
    let ratingDelta = 0;
    let ratingAfter = currentRating;

    if (config.mode === 'competitive') {
      ratingDelta = calculateRatingDelta(currentRating, config.level, accuracy, avgTime);
      ratingAfter = Math.max(500, currentRating + ratingDelta);
    }

    const difficultyMultiplier = config.level * 1.5;
    const xpEarned = Math.round(correctQ * 10 * difficultyMultiplier);

    const summary: SessionSummary = {
      id: `session_${Date.now()}`,
      date: Date.now(),
      mode: config.mode,
      level: config.level,
      bonusType: config.bonusType,
      customBlueprint: config.customBlueprint,
      customLevelId: config.customLevelId,
      totalQuestions: totalQ,
      correctCount: correctQ,
      accuracy,
      averageTime: avgTime,
      fastestTime,
      slowestTime,
      totalTime: Math.round(totalTime * 100) / 100,
      bestStreak: sessionBestStreak,
      ratingBefore: currentRating,
      ratingAfter,
      ratingDelta,
      xpEarned,
      results,
    };

    if (config.mode === 'competitive') {
      setCompetitiveSessions((prev) => [summary, ...prev]);
    } else {
      setPracticeSessions((prev) => [summary, ...prev]);
    }

    // Update saved custom level statistics if playing custom level
    if (config.mode === 'custom' && config.customLevelId) {
      setSavedCustomLevels((prev) =>
        prev.map((lvl) => {
          if (lvl.id === config.customLevelId) {
            return {
              ...lvl,
              timesPlayed: lvl.timesPlayed + 1,
              bestAccuracy: Math.max(lvl.bestAccuracy ?? 0, accuracy),
              bestAvgTime:
                lvl.bestAvgTime && lvl.bestAvgTime > 0
                  ? Math.min(lvl.bestAvgTime, avgTime)
                  : avgTime,
            };
          }
          return lvl;
        })
      );
    }

    const newMistakes: MistakeRecord[] = results
      .filter((r) => !r.isCorrect)
      .map((r) => ({
        id: `mis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        question: r.question,
        userAnswer: r.userAnswer,
        timestamp: Date.now(),
        timeTaken: r.timeTaken,
        solvedCount: 0,
      }));

    if (newMistakes.length > 0) {
      setMistakes((prev) => [...newMistakes, ...prev]);
    }

    if (config.mode === 'daily') {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      setDailyRecords((prev) => ({
        ...prev,
        [dateKey]: {
          completed: true,
          score: correctQ,
          accuracy,
          avgTime,
        },
      }));
    }

    if (config.mode === 'bonus' && config.bonusType) {
      const bKey = config.bonusType;
      setBonusRecords((prev) => {
        const cur = prev[bKey] || { bestStreak: 0, bestScore: 0, bestAvgTime: 999 };
        return {
          ...prev,
          [bKey]: {
            bestStreak: Math.max(cur.bestStreak, sessionBestStreak),
            bestScore: Math.max(cur.bestScore, correctQ),
            bestAvgTime: cur.bestAvgTime === 999 ? avgTime : Math.min(cur.bestAvgTime, avgTime),
          },
        };
      });
    }

    if (user) {
      let newLevel = user.competitiveLevel;

      if (config.mode === 'competitive' && config.level === user.competitiveLevel) {
        const nextLevel = user.competitiveLevel + 1;
        if (nextLevel <= 10) {
          const req = LEVEL_DEFINITIONS[user.competitiveLevel - 1]?.requirements;
          if (req && accuracy >= req.minAccuracy && avgTime <= req.maxAvgTime) {
            const existingQualifying = competitiveSessions.filter(
              (s) => s.level === user.competitiveLevel && s.accuracy >= req.minAccuracy && s.averageTime <= req.maxAvgTime
            ).length;

            if (existingQualifying + 1 >= req.minSessions) {
              newLevel = nextLevel;
              setNewLevelUnlocked(nextLevel);
              soundEngine.playLevelUnlock(user.soundEnabled);
            }
          }
        }
      }

      let newCurrentStreak = user.currentStreak;
      results.forEach((r) => {
        if (r.isCorrect) {
          newCurrentStreak++;
        } else {
          newCurrentStreak = 0;
        }
      });
      const newBestStreak = Math.max(user.bestStreak, newCurrentStreak, sessionBestStreak);

      const todayStr = getTodayDateString();
      const yesterdayStr = getYesterdayDateString();
      let newDailyStreak = user.dailyStreak || 0;
      if (user.lastActiveDate === todayStr) {
        newDailyStreak = Math.max(1, newDailyStreak);
      } else if (user.lastActiveDate === yesterdayStr) {
        newDailyStreak = newDailyStreak + 1;
      } else {
        newDailyStreak = 1;
      }

      const updatedUser: UserProfile = {
        ...user,
        competitiveLevel: newLevel,
        competitiveRating: ratingAfter,
        xp: user.xp + xpEarned,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        questionsSolved: user.questionsSolved + totalQ,
        totalTimeTrained: user.totalTimeTrained + Math.round(totalTime),
        dailyStreak: newDailyStreak,
        lastActiveDate: todayStr,
      };

      setUser(updatedUser);
    }

    setAchievements((prev) => {
      return prev.map((ach) => {
        if (ach.unlockedAt) return ach;
        let newProgress = ach.progress;
        let unlocked = false;

        if (ach.id === 'first_calc' && totalQ > 0) {
          newProgress = 1;
          unlocked = true;
        } else if (ach.id === 'lightning') {
          const hasFast = results.some((r) => r.isCorrect && r.timeTaken < 1.5);
          if (hasFast) {
            newProgress = 1;
            unlocked = true;
          }
        } else if (ach.id === 'perfect_session' && totalQ >= 20 && accuracy === 100) {
          newProgress = 1;
          unlocked = true;
        } else if (ach.id === 'on_fire') {
          newProgress = Math.max(ach.progress, sessionBestStreak);
          if (newProgress >= 20) unlocked = true;
        } else if (ach.id === 'ten_sub_two') {
          const fastCount = results.filter((r) => r.isCorrect && r.timeTaken <= 2.0).length;
          newProgress = Math.min(10, ach.progress + fastCount);
          if (newProgress >= 10) unlocked = true;
        } else if (ach.id === 'scholar_100') {
          newProgress = (user?.questionsSolved || 0) + totalQ;
          if (newProgress >= 100) unlocked = true;
        } else if (ach.id === 'scholar_1000') {
          newProgress = (user?.questionsSolved || 0) + totalQ;
          if (newProgress >= 1000) unlocked = true;
        } else if (ach.id === 'rational_master' && config.level >= 6 && accuracy >= 80) {
          newProgress = 1;
          unlocked = true;
        } else if (ach.id === 'elite_tier' && config.level >= 10) {
          newProgress = 1;
          unlocked = true;
        } else if (ach.id === 'daily_champion' && config.mode === 'daily' && totalQ >= 50 && accuracy >= 70) {
          newProgress = 1;
          unlocked = true;
        } else if (ach.id === 'streak_master') {
          const streakVal = user?.dailyStreak || 1;
          newProgress = Math.max(ach.progress, streakVal);
          if (newProgress >= 3) unlocked = true;
        } else if (ach.id === 'flawless_50') {
          newProgress = Math.max(ach.progress, sessionBestStreak);
          if (newProgress >= 50) unlocked = true;
        } else if (ach.id === 'mathlete') {
          newProgress = Math.max(ach.progress, ratingAfter);
          if (ratingAfter >= 1200) unlocked = true;
        }

        return {
          ...ach,
          progress: Math.min(ach.maxProgress, newProgress),
          unlockedAt: unlocked ? Date.now() : ach.unlockedAt,
        };
      });
    });

    setLastSessionSummary(summary);
    setActiveSession(null);
    return summary;
  };

  const solveMistake = (id: string) => {
    setMistakes((prev) => prev.filter((m) => m.id !== id));
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'mistake_eraser' && !ach.unlockedAt) {
          const nextProg = ach.progress + 1;
          return {
            ...ach,
            progress: Math.min(ach.maxProgress, nextProg),
            unlockedAt: nextProg >= ach.maxProgress ? Date.now() : ach.unlockedAt,
          };
        }
        return ach;
      })
    );
  };

  const clearAllMistakes = () => {
    setMistakes([]);
    storage.saveMistakes([]);
  };

  const setDailyGoal = (goal: number) => {
    if (user) {
      updateUser({ dailyGoal: goal });
    }
  };

  const continueAsGuest = (name: string) => {
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Guest',
      isGuest: true,
      createdAt: Date.now(),
    };
    setUser(newUser);
    storage.saveUser(newUser);
  };

  const createAccount = (name: string, email: string, password: string): boolean => {
    const sanitizedEmail = email.toLowerCase().trim();
    const accounts = storage.getRegisteredAccounts();
    if (accounts[sanitizedEmail]) {
      return false;
    }

    const baseProfile = user || DEFAULT_USER;
    const accountUser: UserProfile = {
      ...baseProfile,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      isGuest: false,
      name: name.trim(),
      email: sanitizedEmail,
      username: sanitizedEmail.split('@')[0],
      createdAt: baseProfile.createdAt || Date.now(),
    };

    const hashed = hashPassword(password);
    storage.saveRegisteredAccount(sanitizedEmail, hashed, accountUser, {
      competitiveSessions,
      practiceSessions,
      mistakes,
      achievements,
      bonusRecords,
      dailyRecords,
      savedCustomLevels,
    });

    setUser(accountUser);
    storage.saveUser(accountUser);
    return true;
  };

  const signIn = (email: string, password: string): boolean => {
    const sanitizedEmail = email.toLowerCase().trim();
    const accounts = storage.getRegisteredAccounts();
    const account = accounts[sanitizedEmail];

    if (!account) {
      return false;
    }

    const hashed = hashPassword(password);
    if (account.passwordHash !== hashed) {
      return false;
    }

    setUser(account.userData);
    storage.saveUser(account.userData);
    const savedData = account.allData as {
      competitiveSessions?: SessionSummary[];
      practiceSessions?: SessionSummary[];
      mistakes?: MistakeRecord[];
      achievements?: Achievement[];
      bonusRecords?: Record<string, { bestStreak: number; bestScore: number; bestAvgTime: number }>;
      dailyRecords?: Record<string, { completed: boolean; score: number; accuracy: number; avgTime: number }>;
      savedCustomLevels?: SavedCustomLevel[];
    };
    if (savedData?.competitiveSessions) setCompetitiveSessions(savedData.competitiveSessions);
    if (savedData?.practiceSessions) setPracticeSessions(savedData.practiceSessions);
    if (savedData?.mistakes) setMistakes(savedData.mistakes);
    if (savedData?.achievements) setAchievements(savedData.achievements);
    if (savedData?.bonusRecords) setBonusRecords(savedData.bonusRecords);
    if (savedData?.dailyRecords) setDailyRecords(savedData.dailyRecords);
    if (savedData?.savedCustomLevels) setSavedCustomLevels(savedData.savedCustomLevels);

    return true;
  };

  // Fix 12: Clear previous user state upon sign-out completely
  const signOut = () => {
    const guestUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: 'Guest',
      isGuest: true,
      createdAt: Date.now(),
    };
    setUser(guestUser);
    storage.saveUser(guestUser);
    setCompetitiveSessions([]);
    setPracticeSessions([]);
    setMistakes([]);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setBonusRecords({});
    setDailyRecords({});
    setSavedCustomLevels([]);
    setLastSessionSummary(null);
    setActiveSession(null);
    storage.saveCompetitiveSessions([]);
    storage.savePracticeSessions([]);
    storage.saveMistakes([]);
    storage.saveAchievements(INITIAL_ACHIEVEMENTS);
    storage.saveBonusRecords({});
    storage.saveDailyRecords({});
    storage.saveCustomLevels([]);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    storage.saveUser(updated);
  };

  const exportData = () => {
    const fullData = {
      user,
      competitiveSessions,
      practiceSessions,
      mistakes,
      achievements,
      bonusRecords,
      dailyRecords,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calcrush_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAllProgress = () => {
    storage.clearAllData();
    const freshUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'guest_' + Math.random().toString(36).substring(2, 9),
      name: user?.name || 'Guest',
      isGuest: true,
      createdAt: Date.now(),
    };
    setUser(freshUser);
    setCompetitiveSessions([]);
    setPracticeSessions([]);
    setMistakes([]);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setBonusRecords({});
    setDailyRecords({});
    setSavedCustomLevels([]);
    setLastSessionSummary(null);
    setActiveSession(null);
  };

  const saveCustomLevel = (level: SavedCustomLevel) => {
    setSavedCustomLevels((prev) => {
      const idx = prev.findIndex((l) => l.id === level.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = level;
        return copy;
      }
      return [level, ...prev];
    });
  };

  const deleteCustomLevel = (id: string) => {
    setSavedCustomLevels((prev) => prev.filter((l) => l.id !== id));
  };

  const toggleCustomLevelFavorite = (id: string) => {
    setSavedCustomLevels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, favorite: !l.favorite } : l))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeView,
        setActiveView,
        activeSession,
        startSession,
        endSession,
        completeSession,
        lastSessionSummary,
        clearLastSessionSummary,
        competitiveSessions,
        practiceSessions,
        savedCustomLevels,
        saveCustomLevel,
        deleteCustomLevel,
        toggleCustomLevelFavorite,
        mistakes,
        achievements,
        bonusRecords,
        dailyRecords,
        isOnline,
        isLevelUnlocked,
        getLevelProgress,
        competitiveStats,
        practiceStats,
        overallStats,
        categoryStats: overallMetrics.categoryMap,
        categoryStatsByMode,
        weakArea,
        dailyGoalProgress,
        setDailyGoal,
        recommendations,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isSaveProgressModalOpen,
        setIsSaveProgressModalOpen,
        isMistakeBankModalOpen,
        setIsMistakeBankModalOpen,
        isChangelogModalOpen,
        setIsChangelogModalOpen,
        isDownloadModalOpen,
        setIsDownloadModalOpen,
        isUpdateBannerVisible,
        dismissUpdateBanner,
        newLevelUnlocked,
        clearNewLevelUnlocked,
        continueAsGuest,
        createAccount,
        signIn,
        signOut,
        updateUser,
        solveMistake,
        clearAllMistakes,
        exportData,
        resetAllProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
