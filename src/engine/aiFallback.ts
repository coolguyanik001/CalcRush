import { AILevelBlueprint } from '../types';

/**
 * Intelligent rule-based NLP fallback engine that interprets user requests into a valid
 * AILevelBlueprint when the server-side Gemini API is offline or unreachable.
 */
export function interpretPromptFallback(prompt: string): AILevelBlueprint {
  const p = prompt.toLowerCase();

  // 1. Question count detection (default 20, min 5, max 50)
  let questionCount = 20;
  const countMatch = p.match(/(\d+)\s*(?:questions?|problems?|items?|drills?|calcs?)/);
  if (countMatch) {
    const parsed = parseInt(countMatch[1], 10);
    if (!isNaN(parsed)) {
      questionCount = Math.max(5, Math.min(50, parsed));
    }
  }

  // 2. Feature detection
  const hasFractions = /fraction|rational|half|third|quarter|numerator|denominator|\//.test(p);
  const hasDecimals = /decimal|point|float|\.|\b0\./.test(p);
  const hasNegatives = /negative|minus|signed|\-|\bneg\b/.test(p);
  const hasPemdas = /pemdas|bodmas|order of operations|compound|nested|multi-step/.test(p);
  const hasParentheses = /parenthes|bracket|\(|\)|\[|\]/.test(p) || hasPemdas;
  const hasMixedNumbers = /mixed|mixed number|improper/.test(p);

  // 3. Difficulty estimation (1 to 10)
  let difficulty = 5;
  if (/olympiad|grandmaster|hardest|genius|insane/.test(p)) {
    difficulty = 10;
  } else if (/class 10|grade 10|advanced mixed|elite/.test(p)) {
    difficulty = 9;
  } else if (/class 9|grade 9|nested|expert/.test(p)) {
    difficulty = 8;
  } else if (/class 8|grade 8|hard|challenging/.test(p)) {
    difficulty = 7;
  } else if (/class 7|grade 7|multi-operation|moderate/.test(p)) {
    difficulty = 6;
  } else if (/class 6|grade 6|intermediate/.test(p)) {
    difficulty = 5;
  } else if (/class 5|grade 5|fractions?/.test(p)) {
    difficulty = 4;
  } else if (/easy|elementary|beginner|basic|starter|speed drill/.test(p)) {
    difficulty = 2;
  }

  const explicitLevel = p.match(/level\s*(\d+)/);
  if (explicitLevel) {
    const l = parseInt(explicitLevel[1], 10);
    if (!isNaN(l)) difficulty = Math.max(1, Math.min(10, l));
  }

  // 4. Operations detection
  const operations: ('addition' | 'subtraction' | 'multiplication' | 'division')[] = [];
  if (/add|addition|sum|\+/.test(p)) operations.push('addition');
  if (/subtract|subtraction|minus|difference|\-/.test(p)) operations.push('subtraction');
  if (/multipl|times|product|\*|×/.test(p)) operations.push('multiplication');
  if (/divid|quotient|\/|÷/.test(p)) operations.push('division');

  // If no explicit operations detected, default to all four
  if (operations.length === 0) {
    operations.push('addition', 'subtraction', 'multiplication', 'division');
  }

  // 5. Purpose determination
  let purpose: AILevelBlueprint['purpose'] = 'custom';
  if (/olympiad/.test(p)) purpose = 'olympiad';
  else if (/exam|test|sat|act|cat|gre|aptitude/.test(p)) purpose = 'exam';
  else if (/school|class|grade|curriculum/.test(p)) purpose = 'school';
  else if (/speed|fast|rapid|tempo|blitz|lightning/.test(p)) purpose = 'speed';
  else if (/mental|head|mind/.test(p)) purpose = 'mental_math';
  else if (/competitive|ranked|contest/.test(p)) purpose = 'competitive';

  // 6. Time and pacing
  const isSpeed = purpose === 'speed' || /fast|rapid|quick|tempo|seconds?/.test(p);
  const timeMode = isSpeed ? 'speed' : 'timed';
  const targetPace = isSpeed ? 2.5 : difficulty >= 8 ? 6.0 : difficulty >= 5 ? 4.5 : 3.5;

  // 7. Topics and title generation
  const topics: string[] = [];
  if (hasFractions) topics.push('Fraction Arithmetic');
  if (hasDecimals) topics.push('Decimals & Place Value');
  if (hasNegatives) topics.push('Signed & Negative Numbers');
  if (hasPemdas) topics.push('PEMDAS Order of Operations');
  if (hasMixedNumbers) topics.push('Mixed Number Equivalences');
  if (topics.length === 0) topics.push('Mental Calculation Fluency', 'Rational Arithmetic');

  let title = 'Custom Calculation Drill';
  if (purpose === 'olympiad') title = 'Olympiad Rational Challenge';
  else if (purpose === 'school') title = `Class ${difficulty >= 8 ? '9-10' : '6-8'} Mathematical Practice`;
  else if (purpose === 'exam') title = 'Aptitude & Exam Speed Drill';
  else if (purpose === 'speed') title = 'Rapid Mental Arithmetic Blitz';
  else if (hasFractions && hasDecimals) title = 'Fractions & Decimals Synthesis';
  else if (hasPemdas) title = 'Multi-Step Order of Operations';

  const description = `Tailored calculation drill focusing on ${topics.join(', ')} with ${operations.join(', ')} at difficulty level ${difficulty}/10.`;

  return {
    title,
    description,
    questionCount,
    difficulty,
    purpose,
    topics,
    operations,
    features: {
      negativeNumbers: hasNegatives || difficulty >= 7,
      mixedNumbers: hasMixedNumbers,
      pemdas: hasPemdas || difficulty >= 6,
      parentheses: hasParentheses || difficulty >= 8,
      decimals: hasDecimals || difficulty === 3 || difficulty >= 5,
      fractions: hasFractions || difficulty === 4 || difficulty >= 5,
    },
    timeMode,
    targetPace,
    recommendedLevelRange: [Math.max(1, difficulty - 1), Math.min(10, difficulty + 1)],
  };
}
