export type SkillCategory = 
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'decimals'
  | 'fractions'
  | 'negative'
  | 'multi-step'
  | 'mixed';

export type DifficultyMode = 'normal' | 'hard' | 'adaptive';

export interface RationalNumber {
  num: number;
  den: number;
}

export interface Question {
  id: string;
  level: number;
  category: SkillCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  expression: string;
  displayExpression?: string; // Richer formatted expression
  correctAnswer: string; // Canonical string representation
  acceptableAnswers: string[]; // Normalized acceptable values (e.g. "1/2", "0.5", "2/4")
  rationalValue: RationalNumber;
  explanation?: string;
  timeLimit?: number; // In seconds (optional)
}

export interface QuestionResult {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // In seconds (e.g. 2.45)
  timestamp: number;
}

export interface AILevelBlueprint {
  title: string;
  description: string;
  questionCount: number; // 5 to 50
  difficulty: number; // 1 to 10
  purpose: 'school' | 'exam' | 'competitive' | 'olympiad' | 'speed' | 'mental_math' | 'custom';
  topics: string[];
  operations: ('addition' | 'subtraction' | 'multiplication' | 'division')[];
  features: {
    negativeNumbers: boolean;
    mixedNumbers: boolean;
    pemdas: boolean;
    parentheses: boolean;
    decimals: boolean;
    fractions: boolean;
  };
  timeMode?: 'untimed' | 'speed' | 'timed';
  targetPace?: number; // In seconds (e.g. 2.0s, 3.0s, 5.0s per question)
  recommendedLevelRange?: [number, number];
}

export interface SavedCustomLevel {
  id: string;
  blueprint: AILevelBlueprint;
  prompt: string;
  createdAt: number;
  favorite: boolean;
  timesPlayed: number;
  bestAccuracy?: number;
  bestAvgTime?: number;
}

export interface SessionConfig {
  mode: 'competitive' | 'practice' | 'bonus' | 'daily' | 'mistakes' | 'custom';
  level: number;
  questionCount: number; // 0 for unlimited / endless / survival
  hasTimer: boolean;
  category?: SkillCategory | 'all';
  difficulty?: DifficultyMode;
  bonusType?: 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8';
  survivalMode?: boolean; // 1 mistake ends
  targetTimePerQuestion?: number; // e.g. for Speed Demon
  targetPace?: number; // In seconds (e.g. 2.0s, 3.0s, 5.0s per question)
  customBlueprint?: AILevelBlueprint;
  customLevelId?: string;
}

export interface SessionSummary {
  id: string;
  date: number;
  mode: 'competitive' | 'practice' | 'bonus' | 'daily' | 'mistakes' | 'custom';
  level: number;
  bonusType?: string;
  customBlueprint?: AILevelBlueprint;
  customLevelId?: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number; // 0 - 100
  averageTime: number; // in seconds
  fastestTime: number;
  slowestTime: number;
  totalTime: number;
  bestStreak: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
  xpEarned: number;
  results: QuestionResult[];
}

export interface LevelRequirement {
  minAccuracy: number; // e.g. 85
  maxAvgTime: number; // e.g. 6.0
  minSessions: number; // e.g. 2
}

export interface LevelDef {
  level: number;
  name: string;
  subtitle: string;
  description: string;
  topics: string[];
  examples: string[];
  requirements: LevelRequirement;
}

export interface MistakeRecord {
  id: string;
  question: Question;
  userAnswer: string;
  timestamp: number;
  timeTaken: number;
  solvedCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

export interface UserProfile {
  id: string;
  isGuest: boolean;
  name: string;
  email?: string;
  username?: string;
  createdAt: number;
  competitiveLevel: number;
  competitiveRating: number;
  xp: number;
  currentStreak: number;
  bestStreak: number;
  questionsSolved: number;
  totalTimeTrained: number; // in seconds
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  theme: 'dark' | 'midnight';
  dailyGoal: number; // Daily target questions (default 50, customizable 20, 50, 100)
  dailyStreak: number; // Consecutive active days
  lastActiveDate?: string; // YYYY-MM-DD
  isEmailVerified?: boolean;
  isGoogleConnected?: boolean;
  lastSyncedAt?: number;
  token?: string;
}

export interface TrainingRecommendation {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeType: 'amber' | 'cyan' | 'emerald' | 'rose' | 'purple';
  actionLabel: string;
  sessionConfig?: SessionConfig;
  targetView?: 'competitive' | 'practice' | 'mistakes' | 'statistics';
}

export interface MistakeInsight {
  totalCount: number;
  byCategory: Record<string, number>;
  mostFrequentCategory: { category: string; count: number } | null;
  recentCount: number;
}

export interface BonusModeDef {
  id: 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8';
  title: string;
  icon: string;
  description: string;
  bestRecordLabel: string;
}
