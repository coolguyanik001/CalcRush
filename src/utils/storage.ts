import {
  Achievement,
  MistakeRecord,
  SavedCustomLevel,
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
  SAVED_CUSTOM_LEVELS: 'calcrush_saved_custom_levels_v1',
  ACCOUNTS_DB: 'calcrush_accounts_store_v1', // Mock cloud accounts database for multi-account login/migration
  SEEN_VERSION: 'calcrush_seen_version_v1',
  DOWNLOAD_PROMPT: 'calcrush_download_prompt_pref_v1',
  AUTH_TOKEN: 'calcrush_auth_token_v1',
  SUPPORT_PROMPT: 'calcrush_support_prompt_pref_v1',
  LAST_SYNC: 'calcrush_last_sync_v1',
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
    description: 'Complete Level 6 (Multi-Operation Rational) with ≥ 80% accuracy.',
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
  {
    id: 'streak_master',
    title: 'Daily Habit',
    description: 'Maintain a 3-day daily training streak.',
    icon: '🌟',
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'flawless_50',
    title: 'Flawless Fifty',
    description: 'Reach an extraordinary 50-question streak without a single mistake.',
    icon: '✨',
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'mathlete',
    title: 'Mathlete 1200',
    description: 'Reach a competitive rating of 1,200 or higher.',
    icon: '🥇',
    progress: 1000,
    maxProgress: 1200,
  },
  {
    id: 'mistake_eraser',
    title: 'Mistake Eraser',
    description: 'Drill and resolve 10 mistakes in your Mistake Bank.',
    icon: '🧼',
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'cloud_sync',
    title: 'Cross-Device Ascendant',
    description: 'Connect your account and enable cross-device cloud sync.',
    icon: '☁️',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'architect',
    title: 'Level Architect',
    description: 'Create and save your first custom level with AI Level Maker.',
    icon: '🛠️',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'speed_demon_sub1',
    title: 'Sub-Second Sorcerer',
    description: 'Answer any calculation correctly in under 1.0 second.',
    icon: '⚡',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'century_streak',
    title: 'Century Run',
    description: 'Reach a phenomenal 100-question correct answer streak.',
    icon: '👑',
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'scholar_5000',
    title: 'Calculation Grandmaster',
    description: 'Solve 5,000 calculation questions in your training career.',
    icon: '🏛️',
    progress: 0,
    maxProgress: 5000,
  },
  {
    id: 'verified_mind',
    title: 'Verified Mind',
    description: 'Verify your account email address.',
    icon: '🛡️',
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
  dailyGoal: 50,
  dailyStreak: 0,
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

  getSavedCustomLevels(): SavedCustomLevel[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_CUSTOM_LEVELS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomLevels(levels: SavedCustomLevel[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_CUSTOM_LEVELS, JSON.stringify(levels));
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

  getSeenVersion(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.SEEN_VERSION);
    } catch {
      return null;
    }
  },

  setSeenVersion(version: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.SEEN_VERSION, version);
    } catch {
      // storage error
    }
  },

  getDownloadPromptPref(): { dontShowAgain: boolean; remindAfter?: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOAD_PROMPT);
      return data ? JSON.parse(data) : { dontShowAgain: false };
    } catch {
      return { dontShowAgain: false };
    }
  },

  setDownloadPromptPref(pref: { dontShowAgain?: boolean; remindAfter?: number }) {
    try {
      const current = this.getDownloadPromptPref();
      const updated = { ...current, ...pref };
      localStorage.setItem(STORAGE_KEYS.DOWNLOAD_PROMPT, JSON.stringify(updated));
    } catch {
      // storage error
    }
  },

  getAuthToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },

  setAuthToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    } catch {
      // storage error
    }
  },

  getSupportPromptPref(): { dontShowAgain: boolean; remindAfter?: number; sessionsCountAtLastPrompt?: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPORT_PROMPT);
      return data ? JSON.parse(data) : { dontShowAgain: false };
    } catch {
      return { dontShowAgain: false };
    }
  },

  setSupportPromptPref(pref: { dontShowAgain?: boolean; remindAfter?: number; sessionsCountAtLastPrompt?: number }) {
    try {
      const current = this.getSupportPromptPref();
      const updated = { ...current, ...pref };
      localStorage.setItem(STORAGE_KEYS.SUPPORT_PROMPT, JSON.stringify(updated));
    } catch {
      // storage error
    }
  },

  getLastSync(): number | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? Number(data) : null;
    } catch {
      return null;
    }
  },

  setLastSync(timestamp: number) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, String(timestamp));
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
      localStorage.removeItem(STORAGE_KEYS.SAVED_CUSTOM_LEVELS);
    } catch {
      // storage error
    }
  },
};
