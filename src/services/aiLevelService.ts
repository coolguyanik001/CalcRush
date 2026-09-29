import { AILevelBlueprint } from '../types';
import { interpretPromptFallback } from '../engine/aiFallback';

export interface GenerationResult {
  blueprint: AILevelBlueprint;
  source: 'ai' | 'fallback';
  engine: string;
}

export const PRESET_PROMPTS = [
  {
    id: 'school',
    icon: '🏫',
    label: 'School Grade',
    prompt: 'Make a Class 8 calculation practice drill with fractions, decimals and mixed numbers.',
  },
  {
    id: 'exam',
    icon: '📝',
    label: 'Exam Prep',
    prompt: 'Fast mental calculation drill for competitive exams with two-digit multiplication and quick division.',
  },
  {
    id: 'olympiad',
    icon: '🧠',
    label: 'Olympiad',
    prompt: 'Challenging olympiad calculation level with nested brackets, fractions and negative integers.',
  },
  {
    id: 'speed',
    icon: '⚡',
    label: 'Speed Drill',
    prompt: 'Rapid mental arithmetic drill with 20 basic addition and subtraction questions at 2.5s pace.',
  },
  {
    id: 'weakness',
    icon: '🎯',
    label: 'Signed Rational',
    prompt: 'Targeted drill on negative decimals, signed fractions, and mixed rational subtraction.',
  },
  {
    id: 'pemdas',
    icon: '✏️',
    label: 'PEMDAS Order',
    prompt: 'Order of operations drill with parentheses, mixed operations, and exact rational arithmetic.',
  },
] as const;

export async function generateLevelBlueprint(prompt: string): Promise<GenerationResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error('Please enter instructions for your level.');
  }

  try {
    const response = await fetch('/api/ai-level-maker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: trimmed }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.blueprint && data.blueprint.title) {
        return {
          blueprint: data.blueprint,
          source: 'ai',
          engine: data.engine || 'Gemini 3.8 Flash',
        };
      }
    }
  } catch (error) {
    console.warn('Network or server error calling AI Level Maker endpoint, using intelligent fallback:', error);
  }

  // Resilient fallback to local heuristic engine
  const fallbackBlueprint = interpretPromptFallback(trimmed);
  return {
    blueprint: fallbackBlueprint,
    source: 'fallback',
    engine: 'CalcRush Heuristic Engine',
  };
}
