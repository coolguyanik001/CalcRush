import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authStore } from './server/store.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Auth Bearer Middleware
  const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    const token = authHeader.substring(7).trim();
    const user = authStore.getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
      return;
    }
    (req as any).user = user;
    (req as any).token = token;
    next();
  };

  // ==========================================
  // AUTHENTICATION & ACCOUNT ENDPOINTS
  // ==========================================

  // Google OAuth Configuration
  app.get('/api/auth/google/config', (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || null;
    res.json({
      enabled: Boolean(clientId),
      clientId: clientId,
    });
  });

  // Google Sign-In
  app.post('/api/auth/google', async (req: Request, res: Response) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(503).json({
        error: 'Google Sign-In is currently unavailable.',
        configured: false,
      });
      return;
    }

    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      res.status(400).json({ error: 'Invalid Google credential token.' });
      return;
    }

    try {
      // Verify token with Google TokenInfo API
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!googleRes.ok) {
        res.status(401).json({ error: 'Failed to verify Google token with Google servers.' });
        return;
      }

      const payload = await googleRes.json();
      if (payload.aud !== clientId) {
        res.status(401).json({ error: 'Google client ID mismatch.' });
        return;
      }

      const email = payload.email?.toLowerCase().trim();
      const name = payload.name || payload.given_name || email.split('@')[0];
      const googleId = payload.sub;

      if (!email) {
        res.status(400).json({ error: 'No email returned by Google account.' });
        return;
      }

      // Check if user exists
      let user = authStore.getUserByEmail(email);
      let token = '';

      if (user) {
        // Link Google if not connected
        user.isGoogleConnected = true;
        user.googleId = googleId;
        user.isEmailVerified = true;
        token = authStore.generateToken();
        user.tokens.push(token);
      } else {
        // Auto-register via Google
        const reg = authStore.registerUser(name, email, 'goog_' + authStore.generateToken());
        user = reg.user;
        user.isEmailVerified = true;
        user.isGoogleConnected = true;
        user.googleId = googleId;
        token = reg.token;
      }

      res.json({
        success: true,
        user: authStore.formatPublicUser(user),
        token,
      });
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      res.status(500).json({ error: 'Google Sign-In failed. Please try again.' });
    }
  });

  // Account Registration
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      res.status(400).json({ error: 'Valid email address is required.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    try {
      const { user, token, verificationCode } = authStore.registerUser(name, email, password);

      // Check email provider configuration
      const isSmtpConfigured = Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
      const emailStatus = isSmtpConfigured ? 'sent' : 'unconfigured_dev_preview';

      res.status(201).json({
        success: true,
        user: authStore.formatPublicUser(user),
        token,
        emailStatus,
        verificationCode: isSmtpConfigured ? undefined : verificationCode,
        message: isSmtpConfigured
          ? 'Account created. Verification code sent to your email.'
          : 'Account created. Verification code generated (Email service unconfigured / Preview mode).',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  // Account Sign In
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    try {
      const { user, token } = authStore.authenticate(email, password);
      res.json({
        success: true,
        user: authStore.formatPublicUser(user),
        token,
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid credentials.' });
    }
  });

  // Email Verification
  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
      return;
    }

    try {
      const { user } = authStore.verifyEmail(email, code);
      res.json({
        success: true,
        user: authStore.formatPublicUser(user),
        message: 'Email address verified successfully!',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Verification failed.' });
    }
  });

  // Resend Verification Code
  app.post('/api/auth/resend-code', (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    try {
      const { code, lastSentAt } = authStore.resendVerificationCode(email);
      const isSmtpConfigured = Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);

      res.json({
        success: true,
        emailStatus: isSmtpConfigured ? 'sent' : 'unconfigured_dev_preview',
        verificationCode: isSmtpConfigured ? undefined : code,
        lastSentAt,
        message: isSmtpConfigured
          ? 'New verification code sent to your email.'
          : 'New verification code generated (Preview mode).',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to resend code.' });
    }
  });

  // Forgot Password (Request Code)
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    try {
      const { code } = authStore.requestPasswordReset(email);
      const isSmtpConfigured = Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);

      res.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
        emailStatus: isSmtpConfigured ? 'sent' : 'unconfigured_dev_preview',
        resetCode: isSmtpConfigured ? undefined : code,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Password reset request failed.' });
    }
  });

  // Reset Password (Validate Code & Set New Password)
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'Email, verification code, and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      authStore.resetPassword(email, code, newPassword);
      res.json({
        success: true,
        message: 'Password has been successfully reset! You can now sign in with your new password.',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Password reset failed.' });
    }
  });

  // Get Current Authenticated User
  app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
    const user = (req as any).user;
    res.json({
      success: true,
      user: authStore.formatPublicUser(user),
    });
  });

  // Change Password
  app.post('/api/auth/change-password', authenticateToken, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      authStore.changePassword(user.id, oldPassword, newPassword);
      res.json({ success: true, message: 'Password updated successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to change password.' });
    }
  });

  // Update Profile Name
  app.post('/api/auth/update-profile', authenticateToken, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Valid name is required.' });
      return;
    }

    try {
      const updated = authStore.updateProfile(user.id, { name });
      res.json({
        success: true,
        user: authStore.formatPublicUser(updated),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update profile.' });
    }
  });

  // Delete Account
  app.post('/api/auth/delete-account', authenticateToken, (req: Request, res: Response) => {
    const user = (req as any).user;
    try {
      authStore.deleteUser(user.id);
      res.json({ success: true, message: 'Account permanently deleted.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete account.' });
    }
  });

  // Sign Out / Invalidate Token
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      authStore.logout(token);
    }
    res.json({ success: true, message: 'Signed out successfully.' });
  });

  // ==========================================
  // CLOUD SYNCHRONIZATION ENDPOINTS
  // ==========================================

  // Pull Cloud Data Snapshot
  app.get('/api/sync/pull', authenticateToken, (req: Request, res: Response) => {
    const user = (req as any).user;
    const data = authStore.pullCloudData(user.id);
    res.json({
      success: true,
      data,
      lastSyncedAt: data ? data.lastSyncedAt : null,
    });
  });

  // Push Local Data to Cloud
  app.post('/api/sync/push', authenticateToken, (req: Request, res: Response) => {
    const user = (req as any).user;
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Invalid sync payload.' });
      return;
    }

    try {
      const saved = authStore.pushCloudData(user.id, data);
      res.json({
        success: true,
        data: saved,
        lastSyncedAt: saved.lastSyncedAt,
      });
    } catch (err: any) {
      console.error('Cloud sync push error:', err);
      res.status(500).json({ error: 'Failed to synchronize with cloud.' });
    }
  });

  // ==========================================
  // GEMINI AI & UTILITY ENDPOINTS
  // ==========================================

  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for AI Level Blueprint generation
  app.post('/api/ai-level-maker', async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required and must be a string.' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. Falling back to local engine.',
        fallbackNeeded: true,
      });
      return;
    }

    try {
      const systemInstruction = `You are an expert mathematical curriculum engine for CalcRush, a mental arithmetic and calculation training application.
Interpret the user's natural language request to create a structured level configuration blueprint.
Do NOT generate mathematical solutions or answers. The mathematical questions and exact rational answers will be computed and validated deterministically by CalcRush's rational arithmetic engine.
Return a JSON object conforming strictly to the requested schema.`;

      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let lastError: any = null;
      let text = '';
      let successfulModel = '';

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: `Create a calculation drill blueprint for this user request: "${prompt}"`,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Engaging, concise title for this level (e.g. 'Class 10 Fraction & Decimal Mastery')",
                  },
                  description: {
                    type: Type.STRING,
                    description: '1-2 sentence description explaining what this drill focuses on and trains',
                  },
                  questionCount: {
                    type: Type.INTEGER,
                    description: 'Number of questions to solve, typically 10 to 30 (default 20, min 5, max 50)',
                  },
                  difficulty: {
                    type: Type.INTEGER,
                    description: 'Difficulty level from 1 (very basic) to 10 (olympiad/elite)',
                  },
                  purpose: {
                    type: Type.STRING,
                    enum: ['school', 'exam', 'competitive', 'olympiad', 'speed', 'mental_math', 'custom'],
                    description: 'Primary educational or training purpose',
                  },
                  topics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Key mathematical skills and topics included',
                  },
                  operations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                      enum: ['addition', 'subtraction', 'multiplication', 'division'],
                    },
                    description: 'Permitted arithmetic operations',
                  },
                  features: {
                    type: Type.OBJECT,
                    properties: {
                      negativeNumbers: { type: Type.BOOLEAN, description: 'Whether negative numbers should appear' },
                      mixedNumbers: { type: Type.BOOLEAN, description: 'Whether mixed numbers or mixed formats should appear' },
                      pemdas: { type: Type.BOOLEAN, description: 'Whether multi-step order of operations is required' },
                      parentheses: { type: Type.BOOLEAN, description: 'Whether brackets/parentheses should be used' },
                      decimals: { type: Type.BOOLEAN, description: 'Whether decimals should appear' },
                      fractions: { type: Type.BOOLEAN, description: 'Whether fractions should appear' },
                    },
                    required: ['negativeNumbers', 'mixedNumbers', 'pemdas', 'parentheses', 'decimals', 'fractions'],
                  },
                  timeMode: {
                    type: Type.STRING,
                    enum: ['untimed', 'speed', 'timed'],
                    description: 'Time constraint style',
                  },
                  targetPace: {
                    type: Type.NUMBER,
                    description: 'Recommended target pace per question in seconds (e.g. 2.0 to 10.0)',
                  },
                },
                required: ['title', 'description', 'questionCount', 'difficulty', 'purpose', 'topics', 'operations', 'features'],
              },
            },
          });

          if (response.text) {
            text = response.text;
            successfulModel = model;
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Model ${model} unavailable or busy, attempting candidate...`);
        }
      }

      if (!text) {
        throw lastError || new Error('No candidate Gemini model responded.');
      }

      const blueprint = JSON.parse(text);
      res.json({
        blueprint,
        engine: successfulModel,
        source: 'ai',
      });
    } catch (err: any) {
      console.error('Gemini API level generation error:', err);
      res.status(500).json({
        error: err.message || 'Failed to interpret prompt with Gemini API.',
        fallbackNeeded: true,
      });
    }
  });

  // Healthcheck endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      version: '1.5.0',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      hasGoogleAuth: Boolean(process.env.GOOGLE_CLIENT_ID),
      mode: process.env.NODE_ENV || 'development',
    });
  });

  // Serve release distribution artifacts
  app.use(
    '/releases',
    express.static(path.resolve(__dirname, 'releases'), {
      setHeaders: (res, filePath) => {
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      },
    })
  );

  // Frontend routing and Vite integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CalcRush Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
