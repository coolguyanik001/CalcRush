import {
  Achievement,
  MistakeRecord,
  SessionSummary,
  UserProfile,
} from '../types';

const STORAGE_KEYS = {
  USER: 'calcrush_user_v1',
  COMPETITIVE_SESSIONS: 'calcrush_comp_sessions_v1',
  PRACTICE_SESSIONS: 'calcrush_prac_sessions_v1',
  MISTAKE_BANK: 'calcrush_mistakes_v1',
  ACHIEVEMENTS: 'calcrush_achievements_v1',
  BONUS_RECORDS: 'calcrush_bonus_records_v1',
  DAILY_RECORDS: 'calcrush_daily_records_v1',
  ACCOUNTS_DB: 'calcrush_accounts_store_v1', // Mock cloud accounts database for multi-account login/migration
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_calc',
    title: 'First Calculation',
    description: 'Complete your first calculation question.',
    icon: '🏁',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'lightning',
    title: 'Lightning Speed',
    description: 'Answer any calculation in under 1.5 seconds.',
    icon: '⚡',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'perfect_session',
    title: 'Flawless Accuracy',
    description: 'Achieve 100% accuracy in a 20-question session.',
    icon: '💯',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'on_fire',
    title: 'On Fire',
    description: 'Reach a 20-question correct streak.',
    icon: '🔥',
    progress: 0,
    maxProgress: 20,
  },
  {
    id: 'ten_sub_two',
    title: 'Quick Thinker',
    description: 'Answer 10 questions in under 2.0 seconds each.',
    icon: '⏱️',
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'scholar_100',
    title: 'Centurion',
    description: 'Solve 100 calculation questions.',
    icon: '🎯',
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'scholar_1000',
    title: 'Scholar',
    description: 'Solve 1,000 calculation questions.',
    icon: '🧠',
    progress: 0,
    maxProgress: 1000,
  },
  {
    id: 'rational_master',
    title: 'Rational Master',
    description: 'Complete Level 6 (Multi-Operation Rational).',
    icon: '📐',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'elite_tier',
    title: 'Grandmaster Elite',
    description: 'Unlock and reach Level 10.',
    icon: '🏆',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'daily_champion',
    title: 'Daily Warrior',
    description: 'Complete the 50-question Daily Challenge.',
    icon: '📅',
    progress: 0,
    maxProgress: 1,
  },
];

export const DEFAULT_USER: UserProfile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  isGuest: true,
  name: 'Anik',
  createdAt: Date.now(),
  competitiveLevel: 1,
  competitiveRating: 1000,
  xp: 0,
  currentStreak: 0,
  bestStreak: 0,
  questionsSolved: 0,
  totalTimeTrained: 0,
  soundEnabled: true,
  hapticsEnabled: true,
  theme: 'dark',
};

export const storage = {
  getUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveUser(user: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // storage error
    }
  },

  getCompetitiveSessions(): SessionSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPETITIVE_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCompetitiveSessions(sessions: SessionSummary[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPETITIVE_SESSIONS, JSON.stringify(sessions));
    } catch {
      // storage error
    }
  },

  getPracticeSessions(): SessionSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  savePracticeSessions(sessions: SessionSummary[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, JSON.stringify(sessions));
    } catch {
      // storage error
    }
  },

  getMistakes(): MistakeRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKE_BANK);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMistakes(mistakes: MistakeRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MISTAKE_BANK, JSON.stringify(mistakes));
    } catch {
      // storage error
    }
  },

  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        const parsed = JSON.parse(data);
        // Merge with initial in case new achievements were added
        return INITIAL_ACHIEVEMENTS.map((a) => {
          const found = parsed.find((p: Achievement) => p.id === a.id);
          return found || a;
        });
      }
      return INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },

  saveAchievements(achievements: Achievement[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {
      // storage error
    }
  },

  getBonusRecords(): Record<string, { bestStreak: number; bestScore: number; bestAvgTime: number }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BONUS_RECORDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveBonusRecords(records: Record<string, { bestStreak: number; bestScore: number; bestAvgTime: number }>) {
    try {
      localStorage.setItem(STORAGE_KEYS.BONUS_RECORDS, JSON.stringify(records));
    } catch {
      // storage error
    }
  },

  getDailyRecords(): Record<string, { completed: boolean; score: number; accuracy: number; avgTime: number }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveDailyRecords(records: Record<string, { completed: boolean; score: number; accuracy: number; avgTime: number }>) {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(records));
    } catch {
      // storage error
    }
  },

  // Accounts database simulation for authentic cross-device accounts & login
  getRegisteredAccounts(): Record<string, { passwordHash: string; userData: UserProfile; allData: unknown }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_DB);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveRegisteredAccount(email: string, passwordHash: string, userData: UserProfile, allData: unknown) {
    try {
      const db = this.getRegisteredAccounts();
      db[email.toLowerCase().trim()] = { passwordHash, userData, allData };
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS_DB, JSON.stringify(db));
    } catch {
      // storage error
    }
  },

  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.COMPETITIVE_SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.PRACTICE_SESSIONS);
      localStorage.removeItem(STORAGE_KEYS.MISTAKE_BANK);
      localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      localStorage.removeItem(STORAGE_KEYS.BONUS_RECORDS);
      localStorage.removeItem(STORAGE_KEYS.DAILY_RECORDS);
    } catch {
      // storage error
    }
  },
};
