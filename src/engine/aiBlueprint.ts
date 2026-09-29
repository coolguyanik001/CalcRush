import { AILevelBlueprint } from '../types';

export const DEFAULT_BLUEPRINT: AILevelBlueprint = {
  title: 'Custom Calculation Drill',
  description: 'A customized mental arithmetic training set.',
  questionCount: 20,
  difficulty: 5,
  purpose: 'custom',
  topics: ['integers', 'decimals', 'fractions'],
  operations: ['addition', 'subtraction', 'multiplication'],
  features: {
    negativeNumbers: false,
    mixedNumbers: false,
    pemdas: false,
    parentheses: false,
    decimals: true,
    fractions: true,
  },
  timeMode: 'speed',
  recommendedLevelRange: [3, 6],
};

/**
 * Validates, sanitizes, and clamps an AI-produced level blueprint.
 */
export function validateAndSanitizeBlueprint(raw: any): {
  valid: boolean;
  blueprint: AILevelBlueprint;
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return {
      valid: false,
      blueprint: DEFAULT_BLUEPRINT,
      error: 'Invalid blueprint data structure',
    };
  }

  // Sanitize title and description
  const rawTitle = typeof raw.title === 'string' ? raw.title.trim() : 'Custom Calculation Drill';
  const cleanTitle = rawTitle.replace(/[<>{}[\]]/g, '').slice(0, 80) || 'Custom Calculation Drill';

  const rawDesc = typeof raw.description === 'string' ? raw.description.trim() : 'Tailored math drill';
  const cleanDesc = rawDesc.replace(/[<>{}[\]]/g, '').slice(0, 200) || 'Tailored math drill';

  // Clamp question count (5 - 50, standard maximum per spec)
  let questionCount = 20;
  if (typeof raw.questionCount === 'number' && !isNaN(raw.questionCount)) {
    questionCount = Math.max(5, Math.min(50, Math.round(raw.questionCount)));
  }

  // Clamp difficulty (1 - 10)
  let difficulty = 5;
  if (typeof raw.difficulty === 'number' && !isNaN(raw.difficulty)) {
    difficulty = Math.max(1, Math.min(10, Math.round(raw.difficulty)));
  }

  // Validate purpose
  const validPurposes: AILevelBlueprint['purpose'][] = [
    'school',
    'exam',
    'competitive',
    'olympiad',
    'speed',
    'mental_math',
    'custom',
  ];
  const purpose = validPurposes.includes(raw.purpose) ? raw.purpose : 'custom';

  // Validate operations
  const allowedOps: ('addition' | 'subtraction' | 'multiplication' | 'division')[] = [
    'addition',
    'subtraction',
    'multiplication',
    'division',
  ];
  let operations: ('addition' | 'subtraction' | 'multiplication' | 'division')[] = [];
  if (Array.isArray(raw.operations)) {
    operations = raw.operations.filter((op: any) => allowedOps.includes(op));
  }
  if (operations.length === 0) {
    operations = ['addition', 'subtraction', 'multiplication'];
  }

  // Validate features
  const rawFeatures = typeof raw.features === 'object' && raw.features !== null ? raw.features : {};
  const features = {
    negativeNumbers: Boolean(rawFeatures.negativeNumbers),
    mixedNumbers: Boolean(rawFeatures.mixedNumbers),
    pemdas: Boolean(rawFeatures.pemdas),
    parentheses: Boolean(rawFeatures.parentheses),
    decimals: Boolean(rawFeatures.decimals),
    fractions: Boolean(rawFeatures.fractions),
  };

  // Validate topics
  const topics: string[] = Array.isArray(raw.topics)
    ? raw.topics.map((t: unknown) => String(t).slice(0, 30).toLowerCase()).slice(0, 10)
    : ['general_arithmetic'];

  // Time mode & pace
  let timeMode: 'untimed' | 'speed' | 'timed' = 'speed';
  if (raw.timeMode === 'untimed' || raw.timeMode === 'timed' || raw.timeMode === 'speed') {
    timeMode = raw.timeMode;
  }

  let targetPace: number | undefined;
  if (typeof raw.targetPace === 'number' && !isNaN(raw.targetPace)) {
    targetPace = Math.max(1.0, Math.min(15.0, raw.targetPace));
  }

  const blueprint: AILevelBlueprint = {
    title: cleanTitle,
    description: cleanDesc,
    questionCount,
    difficulty,
    purpose,
    topics,
    operations,
    features,
    timeMode,
    targetPace,
    recommendedLevelRange: [Math.max(1, difficulty - 1), Math.min(10, difficulty + 1)],
  };

  return { valid: true, blueprint };
}

/**
 * Intelligent rule-based blueprint synthesizer.
 * Used for instant zero-latency processing or robust fallback when offline/no API key.
 */
export function synthesizeBlueprintFromPrompt(
  prompt: string,
  overrides?: {
    questionCount?: number;
    difficulty?: number;
    timeMode?: 'untimed' | 'speed' | 'timed';
    purpose?: AILevelBlueprint['purpose'];
    topics?: string[];
  }
): {
  blueprint: AILevelBlueprint;
  isOffTopic?: boolean;
} {
  const p = prompt.toLowerCase();

  // Safety check for non-math / prompt-injection attempts
  const offTopicTriggers = [
    'write me a story',
    'ignore all previous',
    'write code',
    'javascript',
    'python',
    'react component',
    'html',
    'translate to spanish',
  ];
  if (offTopicTriggers.some((t) => p.includes(t)) && !p.includes('math') && !p.includes('calculat')) {
    return {
      blueprint: DEFAULT_BLUEPRINT,
      isOffTopic: true,
    };
  }

  // Detect count
  let count = 20;
  const countMatch = p.match(/\b(\d{1,2})\s*(?:questions?|problems?|items?|q)\b/);
  if (countMatch) {
    count = Math.max(5, Math.min(50, parseInt(countMatch[1], 10)));
  } else if (p.includes('quick') || p.includes('blitz') || p.includes('10')) {
    count = 10;
  } else if (p.includes('marathon') || p.includes('50')) {
    count = 50;
  } else if (p.includes('30')) {
    count = 30;
  }

  // Detect difficulty
  let difficulty = 5;
  if (p.includes('easy') || p.includes('simple') || p.includes('basic') || p.includes('elementary')) {
    difficulty = 2;
  } else if (p.includes('hard') || p.includes('difficult') || p.includes('tough')) {
    difficulty = 7;
  } else if (p.includes('olympiad') || p.includes('extreme') || p.includes('master') || p.includes('elite')) {
    difficulty = 9;
  } else if (p.includes('class 10') || p.includes('grade 10') || p.includes('high school')) {
    difficulty = 7;
  } else if (p.includes('class 8') || p.includes('grade 8')) {
    difficulty = 5;
  } else if (p.includes('class 5') || p.includes('grade 5') || p.includes('primary')) {
    difficulty = 3;
  }

  // Detect purpose
  let purpose: AILevelBlueprint['purpose'] = 'custom';
  if (p.includes('olympiad') || p.includes('competition')) purpose = 'olympiad';
  else if (p.includes('exam') || p.includes('test')) purpose = 'exam';
  else if (p.includes('school') || p.includes('class') || p.includes('grade')) purpose = 'school';
  else if (p.includes('speed') || p.includes('fast') || p.includes('rapid') || p.includes('blitz')) purpose = 'speed';
  else if (p.includes('mental math') || p.includes('mental')) purpose = 'mental_math';
  else if (p.includes('competitive')) purpose = 'competitive';

  // Detect features
  const hasFractions = p.includes('fraction') || p.includes('rational') || p.includes('olympiad');
  const hasDecimals = p.includes('decimal') || p.includes('point');
  const hasNegatives = p.includes('negative') || p.includes('minus') || p.includes('signed');
  const hasMixed = p.includes('mixed') || p.includes('proper');
  const hasPemdas = p.includes('pemdas') || p.includes('order of operations') || p.includes('bracket') || p.includes('parenthes') || p.includes('multi-step');

  const operations: ('addition' | 'subtraction' | 'multiplication' | 'division')[] = [];
  if (p.includes('add') || p.includes('plus')) operations.push('addition');
  if (p.includes('subtract') || p.includes('minus')) operations.push('subtraction');
  if (p.includes('multipl') || p.includes('times')) operations.push('multiplication');
  if (p.includes('divid') || p.includes('division')) operations.push('division');

  if (operations.length === 0) {
    if (difficulty >= 6) {
      operations.push('addition', 'subtraction', 'multiplication', 'division');
    } else {
      operations.push('addition', 'subtraction', 'multiplication');
    }
  }

  const topics: string[] = [];
  if (hasFractions) topics.push('fractions');
  if (hasDecimals) topics.push('decimals');
  if (hasNegatives) topics.push('negative_numbers');
  if (hasPemdas) topics.push('pemdas');
  if (topics.length === 0) topics.push('integers', 'arithmetic');

  // Title generation
  let title = 'Custom Calculation Drill';
  if (purpose === 'olympiad') title = 'Olympiad Arithmetic Challenge';
  else if (purpose === 'school') title = 'Classroom Curriculum Drill';
  else if (purpose === 'speed') title = 'Speed Calculation Sprint';
  else if (hasFractions && hasDecimals) title = 'Mixed Rational Fluency Drill';
  else if (hasFractions) title = 'Fraction Calculation Mastery';
  else if (hasDecimals) title = 'Decimal Place Value Sprint';
  else if (hasNegatives) title = 'Signed Integers & Rational Drill';

  let description = `A ${difficulty >= 7 ? 'rigorous' : difficulty <= 3 ? 'foundational' : 'balanced'} ${count}-problem calculation set emphasizing ${topics.join(', ')}.`;

  // Apply explicit overrides if provided
  if (overrides?.questionCount) count = overrides.questionCount;
  if (overrides?.difficulty) difficulty = overrides.difficulty;
  if (overrides?.purpose) purpose = overrides.purpose;

  const blueprint: AILevelBlueprint = {
    title,
    description,
    questionCount: count,
    difficulty,
    purpose,
    topics,
    operations,
    features: {
      negativeNumbers: hasNegatives,
      mixedNumbers: hasMixed,
      pemdas: hasPemdas,
      parentheses: hasPemdas,
      decimals: hasDecimals,
      fractions: hasFractions,
    },
    timeMode: purpose === 'speed' ? 'speed' : 'timed',
    targetPace: purpose === 'speed' ? 2.5 : undefined,
    recommendedLevelRange: [Math.max(1, difficulty - 1), Math.min(10, difficulty + 1)],
  };

  return { blueprint };
}
