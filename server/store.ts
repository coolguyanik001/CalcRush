import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  isEmailVerified: boolean;
  isGoogleConnected: boolean;
  googleId?: string | null;
  createdAt: number;
  updatedAt: number;
  emailVerification?: {
    code: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
  } | null;
  passwordReset?: {
    code: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
  } | null;
  tokens: string[]; // Active session bearer tokens
}

export interface CloudDataSnapshot {
  userId: string;
  userProfile: any;
  competitiveSessions: any[];
  practiceSessions: any[];
  mistakes: any[];
  achievements: any[];
  bonusRecords: Record<string, any>;
  dailyRecords: Record<string, any>;
  savedCustomLevels: any[];
  lastSyncedAt: number;
}

interface ServerDatabase {
  users: Record<string, ServerUser>; // email (lowercase) -> user
  usersById: Record<string, string>; // userId -> email
  tokenToUser: Record<string, string>; // token -> userId
  cloudData: Record<string, CloudDataSnapshot>; // userId -> data
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'calcrush_db.json');

class AuthStore {
  private db: ServerDatabase = {
    users: {},
    usersById: {},
    tokenToUser: {},
    cloudData: {},
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading server DB, initializing fresh:', err);
      this.db = {
        users: {},
        usersById: {},
        tokenToUser: {},
        cloudData: {},
      };
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving server DB:', err);
    }
  }

  public hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: s };
  }

  public generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  public generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public getUserByEmail(email: string): ServerUser | null {
    const key = email.toLowerCase().trim();
    return this.db.users[key] || null;
  }

  public getUserById(userId: string): ServerUser | null {
    const email = this.db.usersById[userId];
    if (!email) return null;
    return this.db.users[email] || null;
  }

  public getUserByToken(token: string): ServerUser | null {
    const userId = this.db.tokenToUser[token];
    if (!userId) return null;
    return this.getUserById(userId);
  }

  public registerUser(
    name: string,
    email: string,
    password: string
  ): { user: ServerUser; token: string; verificationCode: string } {
    const sanitizedEmail = email.toLowerCase().trim();
    if (this.db.users[sanitizedEmail]) {
      throw new Error('An account with this email already exists.');
    }

    const { hash, salt } = this.hashPassword(password);
    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const token = this.generateToken();
    const verificationCode = this.generateOtp();
    const now = Date.now();

    const user: ServerUser = {
      id: userId,
      email: sanitizedEmail,
      name: name.trim(),
      passwordHash: hash,
      salt,
      isEmailVerified: false,
      isGoogleConnected: false,
      createdAt: now,
      updatedAt: now,
      emailVerification: {
        code: verificationCode,
        expiresAt: now + 15 * 60 * 1000, // 15 mins
        attempts: 0,
        lastSentAt: now,
      },
      passwordReset: null,
      tokens: [token],
    };

    this.db.users[sanitizedEmail] = user;
    this.db.usersById[userId] = sanitizedEmail;
    this.db.tokenToUser[token] = userId;
    this.save();

    return { user, token, verificationCode };
  }

  public authenticate(
    email: string,
    password: string
  ): { user: ServerUser; token: string } {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = this.db.users[sanitizedEmail];
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const { hash } = this.hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken();
    user.tokens.push(token);
    user.updatedAt = Date.now();
    this.db.tokenToUser[token] = user.id;
    this.save();

    return { user, token };
  }

  public verifyEmail(
    email: string,
    code: string
  ): { success: boolean; user: ServerUser } {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = this.db.users[sanitizedEmail];
    if (!user) {
      throw new Error('Account not found.');
    }

    if (user.isEmailVerified) {
      return { success: true, user };
    }

    if (!user.emailVerification) {
      throw new Error('No active verification request found. Please request a new code.');
    }

    if (Date.now() > user.emailVerification.expiresAt) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (user.emailVerification.attempts >= 5) {
      throw new Error('Too many invalid attempts. Please request a new verification code.');
    }

    if (user.emailVerification.code !== code.trim()) {
      user.emailVerification.attempts += 1;
      this.save();
      throw new Error('Invalid verification code. Please check and try again.');
    }

    user.isEmailVerified = true;
    user.emailVerification = null;
    user.updatedAt = Date.now();
    this.save();

    return { success: true, user };
  }

  public resendVerificationCode(email: string): { code: string; lastSentAt: number } {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = this.db.users[sanitizedEmail];
    if (!user) {
      throw new Error('Account not found.');
    }

    if (user.isEmailVerified) {
      throw new Error('Account email is already verified.');
    }

    const now = Date.now();
    if (user.emailVerification && now - user.emailVerification.lastSentAt < 60 * 1000) {
      const waitSec = Math.ceil((60 * 1000 - (now - user.emailVerification.lastSentAt)) / 1000);
      throw new Error(`Please wait ${waitSec}s before requesting another code.`);
    }

    const code = this.generateOtp();
    user.emailVerification = {
      code,
      expiresAt: now + 15 * 60 * 1000,
      attempts: 0,
      lastSentAt: now,
    };
    user.updatedAt = now;
    this.save();

    return { code, lastSentAt: now };
  }

  public requestPasswordReset(email: string): { code: string | null } {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = this.db.users[sanitizedEmail];
    if (!user) {
      // Don't leak whether email exists
      return { code: null };
    }

    const now = Date.now();
    const code = this.generateOtp();
    user.passwordReset = {
      code,
      expiresAt: now + 15 * 60 * 1000,
      attempts: 0,
      lastSentAt: now,
    };
    user.updatedAt = now;
    this.save();

    return { code };
  }

  public resetPassword(email: string, code: string, newPassword: string): boolean {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = this.db.users[sanitizedEmail];
    if (!user || !user.passwordReset) {
      throw new Error('Invalid or expired password reset request.');
    }

    if (Date.now() > user.passwordReset.expiresAt) {
      throw new Error('Password reset code has expired. Please request a new one.');
    }

    if (user.passwordReset.attempts >= 5) {
      throw new Error('Too many failed attempts. Please request a new reset code.');
    }

    if (user.passwordReset.code !== code.trim()) {
      user.passwordReset.attempts += 1;
      this.save();
      throw new Error('Invalid password reset code.');
    }

    const { hash, salt } = this.hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;
    user.passwordReset = null;
    user.updatedAt = Date.now();
    // Invalidate existing tokens except current
    this.save();

    return true;
  }

  public changePassword(userId: string, oldPass: string, newPass: string): boolean {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const { hash } = this.hashPassword(oldPass, user.salt);
    if (hash !== user.passwordHash) {
      throw new Error('Incorrect current password.');
    }

    const { hash: newHash, salt: newSalt } = this.hashPassword(newPass);
    user.passwordHash = newHash;
    user.salt = newSalt;
    user.updatedAt = Date.now();
    this.save();
    return true;
  }

  public updateProfile(userId: string, updates: { name?: string }): ServerUser {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    if (updates.name && updates.name.trim()) {
      user.name = updates.name.trim();
    }
    user.updatedAt = Date.now();
    this.save();
    return user;
  }

  public deleteUser(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    // Remove tokens
    user.tokens.forEach((t) => delete this.db.tokenToUser[t]);
    delete this.db.users[user.email];
    delete this.db.usersById[userId];
    delete this.db.cloudData[userId];
    this.save();
    return true;
  }

  public logout(token: string): boolean {
    const userId = this.db.tokenToUser[token];
    if (userId) {
      delete this.db.tokenToUser[token];
      const user = this.getUserById(userId);
      if (user) {
        user.tokens = user.tokens.filter((t) => t !== token);
      }
      this.save();
      return true;
    }
    return false;
  }

  public pullCloudData(userId: string): CloudDataSnapshot | null {
    return this.db.cloudData[userId] || null;
  }

  public pushCloudData(userId: string, data: Partial<CloudDataSnapshot>): CloudDataSnapshot {
    const existing = this.db.cloudData[userId] || {
      userId,
      userProfile: null,
      competitiveSessions: [],
      practiceSessions: [],
      mistakes: [],
      achievements: [],
      bonusRecords: {},
      dailyRecords: {},
      savedCustomLevels: [],
      lastSyncedAt: 0,
    };

    // Safe merging logic: ensure no loss of sessions or higher achievements
    const mergedCompetitive = this.mergeSessions(
      existing.competitiveSessions || [],
      data.competitiveSessions || []
    );
    const mergedPractice = this.mergeSessions(
      existing.practiceSessions || [],
      data.practiceSessions || []
    );
    const mergedMistakes = this.mergeMistakes(
      existing.mistakes || [],
      data.mistakes || []
    );
    const mergedAchievements = this.mergeAchievements(
      existing.achievements || [],
      data.achievements || []
    );
    const mergedSavedLevels = this.mergeCustomLevels(
      existing.savedCustomLevels || [],
      data.savedCustomLevels || []
    );

    const mergedSnapshot: CloudDataSnapshot = {
      userId,
      userProfile: data.userProfile ? { ...existing.userProfile, ...data.userProfile } : existing.userProfile,
      competitiveSessions: mergedCompetitive,
      practiceSessions: mergedPractice,
      mistakes: mergedMistakes,
      achievements: mergedAchievements,
      bonusRecords: { ...(existing.bonusRecords || {}), ...(data.bonusRecords || {}) },
      dailyRecords: { ...(existing.dailyRecords || {}), ...(data.dailyRecords || {}) },
      savedCustomLevels: mergedSavedLevels,
      lastSyncedAt: Date.now(),
    };

    this.db.cloudData[userId] = mergedSnapshot;
    this.save();
    return mergedSnapshot;
  }

  private mergeSessions(existing: any[], incoming: any[]): any[] {
    const map = new Map<string, any>();
    existing.forEach((s) => map.set(s.id, s));
    incoming.forEach((s) => {
      if (!map.has(s.id)) {
        map.set(s.id, s);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.date - a.date);
  }

  private mergeMistakes(existing: any[], incoming: any[]): any[] {
    const map = new Map<string, any>();
    existing.forEach((m) => map.set(m.id, m));
    incoming.forEach((m) => map.set(m.id, m));
    return Array.from(map.values());
  }

  private mergeAchievements(existing: any[], incoming: any[]): any[] {
    const map = new Map<string, any>();
    existing.forEach((a) => map.set(a.id, a));
    incoming.forEach((a) => {
      const prev = map.get(a.id);
      if (!prev) {
        map.set(a.id, a);
      } else {
        map.set(a.id, {
          ...prev,
          progress: Math.max(prev.progress || 0, a.progress || 0),
          unlockedAt: prev.unlockedAt || a.unlockedAt || undefined,
        });
      }
    });
    return Array.from(map.values());
  }

  private mergeCustomLevels(existing: any[], incoming: any[]): any[] {
    const map = new Map<string, any>();
    existing.forEach((l) => map.set(l.id, l));
    incoming.forEach((l) => map.set(l.id, l));
    return Array.from(map.values());
  }

  public formatPublicUser(user: ServerUser) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isGoogleConnected: user.isGoogleConnected,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authStore = new AuthStore();
