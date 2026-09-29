import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Server-side Gemini API client initialization
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
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
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
