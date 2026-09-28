import React, { createContext, useContext, useEffect, useState } from 'react';
import { LEVEL_DEFINITIONS } from '../engine/generator';
import {
  Achievement,
  MistakeRecord,
  QuestionResult,
  SessionConfig,
  SessionSummary,
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

interface AppContextType {
  user: UserProfile | null;
  activeView: 'home' | 'competitive' | 'practice' | 'statistics' | 'profile';
  setActiveView: (view: 'home' | 'competitive' | 'practice' | 'statistics' | 'profile') => void;
  activeSession: SessionConfig | null;
  startSession: (config: SessionConfig) => void;
  endSession: () => void;
  completeSession: (results: QuestionResult[], config: SessionConfig) => SessionSummary;
  lastSessionSummary: SessionSummary | null;
  clearLastSessionSummary: () => void;
  competitiveSessions: SessionSummary[];
  practiceSessions: SessionSummary[];
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
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'welcome' | 'signup' | 'signin' | 'guest' | 'save_progress';
  setAuthModalMode: (mode: 'welcome' | 'signup' | 'signin' | 'guest' | 'save_progress') => void;
  isSaveProgressModalOpen: boolean;
  setIsSaveProgressModalOpen: (open: boolean) => void;
  isMistakeBankModalOpen: boolean;
  setIsMistakeBankModalOpen: (open: boolean) => void;
  newLevelUnlocked: number | null;
  clearNewLevelUnlocked: () => void;
  continueAsGuest: (name: string) => void;
  createAccount: (name: string, email: string, password: string) => boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  solveMistake: (id: string) => void;
  exportData: () => void;
  resetAllProgress: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Hash function simulation for passwords (never plain text)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'calcrush_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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

  const [activeView, setActiveView] = useState<'home' | 'competitive' | 'practice' | 'statistics' | 'profile'>('home');
  const [activeSession, setActiveSession] = useState<SessionConfig | null>(null);
  const [lastSessionSummary, setLastSessionSummary] = useState<SessionSummary | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<
    'welcome' | 'signup' | 'signin' | 'guest' | 'save_progress'
  >('guest');
  const [isSaveProgressModalOpen, setIsSaveProgressModalOpen] = useState<boolean>(false);
  const [isMistakeBankModalOpen, setIsMistakeBankModalOpen] = useState<boolean>(false);
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

      const updatedUser: UserProfile = {
        ...user,
        competitiveLevel: newLevel,
        competitiveRating: ratingAfter,
        xp: user.xp + xpEarned,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        questionsSolved: user.questionsSolved + totalQ,
        totalTimeTrained: user.totalTimeTrained + Math.round(totalTime),
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

    hashPassword(password).then((hashed) => {
      storage.saveRegisteredAccount(sanitizedEmail, hashed, accountUser, {
        competitiveSessions,
        practiceSessions,
        mistakes,
        achievements,
        bonusRecords,
        dailyRecords,
      });
    });

    setUser(accountUser);
    storage.saveUser(accountUser);
    setIsAuthModalOpen(false);
    setIsSaveProgressModalOpen(false);
    return true;
  };

  const signIn = (email: string, password: string): boolean => {
    const sanitizedEmail = email.toLowerCase().trim();
    const accounts = storage.getRegisteredAccounts();
    const account = accounts[sanitizedEmail];

    if (!account) {
      return false;
    }

    hashPassword(password).then((hashed) => {
      if (account.passwordHash === hashed) {
        setUser(account.userData);
        storage.saveUser(account.userData);
        const savedData = account.allData as {
          competitiveSessions?: SessionSummary[];
          practiceSessions?: SessionSummary[];
          mistakes?: MistakeRecord[];
          achievements?: Achievement[];
          bonusRecords?: Record<string, { bestStreak: number; bestScore: number; bestAvgTime: number }>;
          dailyRecords?: Record<string, { completed: boolean; score: number; accuracy: number; avgTime: number }>;
        };
        if (savedData?.competitiveSessions) setCompetitiveSessions(savedData.competitiveSessions);
        if (savedData?.practiceSessions) setPracticeSessions(savedData.practiceSessions);
        if (savedData?.mistakes) setMistakes(savedData.mistakes);
        if (savedData?.achievements) setAchievements(savedData.achievements);
        if (savedData?.bonusRecords) setBonusRecords(savedData.bonusRecords);
        if (savedData?.dailyRecords) setDailyRecords(savedData.dailyRecords);
      }
    });

    setIsAuthModalOpen(false);
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
    setLastSessionSummary(null);
    setActiveSession(null);
    storage.saveCompetitiveSessions([]);
    storage.savePracticeSessions([]);
    storage.saveMistakes([]);
    storage.saveAchievements(INITIAL_ACHIEVEMENTS);
    storage.saveBonusRecords({});
    storage.saveDailyRecords({});
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
    setLastSessionSummary(null);
    setActiveSession(null);
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
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isSaveProgressModalOpen,
        setIsSaveProgressModalOpen,
        isMistakeBankModalOpen,
        setIsMistakeBankModalOpen,
        newLevelUnlocked,
        clearNewLevelUnlocked,
        continueAsGuest,
        createAccount,
        signIn,
        signOut,
        updateUser,
        solveMistake,
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
