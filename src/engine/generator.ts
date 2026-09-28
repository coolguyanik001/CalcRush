import { LevelDef, Question, SkillCategory } from '../types';
import {
  createRational,
  generateCanonicalAndAcceptable,
  rationalAdd,
  rationalDivide,
  rationalFromDecimal,
  rationalMultiply,
  rationalSubtract,
  rationalToString,
  simplifyRational,
} from './rational';

// Level definitions with criteria
export const LEVEL_DEFINITIONS: LevelDef[] = [
  {
    level: 1,
    name: 'Basic Integer',
    subtitle: 'Foundation arithmetic with small integers',
    description: 'Addition, subtraction, basic multiplication tables, and clean division with small positive integers.',
    topics: ['Addition', 'Subtraction', 'Basic multiplication', 'Basic division', 'Small integers'],
    examples: ['27 + 36', '84 − 29', '7 × 8', '72 ÷ 9'],
    requirements: { minAccuracy: 85, maxAvgTime: 6.0, minSessions: 2 },
  },
  {
    level: 2,
    name: 'Large Integer',
    subtitle: 'Multi-digit mental calculations',
    description: 'Calculations with larger integers, double-digit multiplication, and exact division.',
    topics: ['Larger addition', 'Larger subtraction', 'Larger multiplication', 'Division', 'Mixed integer operations'],
    examples: ['347 + 586', '936 − 478', '72 × 14', '936 ÷ 18'],
    requirements: { minAccuracy: 88, maxAvgTime: 5.5, minSessions: 2 },
  },
  {
    level: 3,
    name: 'Decimals',
    subtitle: 'Decimal place value and operations',
    description: 'Fast addition, subtraction, multiplication, and clean division involving single and multi-decimal numbers.',
    topics: ['Decimal addition', 'Decimal subtraction', 'Decimal multiplication', 'Decimal division'],
    examples: ['4.7 + 8.35', '12.6 × 0.4', '7.2 ÷ 0.6', '15.75 − 8.625'],
    requirements: { minAccuracy: 88, maxAvgTime: 5.0, minSessions: 3 },
  },
  {
    level: 4,
    name: 'Fractions',
    subtitle: 'Fraction arithmetic & common denominators',
    description: 'Fraction addition, subtraction, multiplication, division, and simplification.',
    topics: ['Fraction addition', 'Fraction subtraction', 'Fraction multiplication', 'Fraction division', 'Simplification'],
    examples: ['3/4 + 2/5', '7/8 × 4/7', '5/6 − 1/3', '3/5 ÷ 9/10'],
    requirements: { minAccuracy: 90, maxAvgTime: 5.0, minSessions: 3 },
  },
  {
    level: 5,
    name: 'Mixed Rational',
    subtitle: 'Fractions, decimals & signed numbers',
    description: 'Seamlessly converting and calculating between decimals, fractions, and integers.',
    topics: ['Integers', 'Decimals', 'Fractions', 'Positive & Negative', 'Equivalence'],
    examples: ['2.5 + 3/4', '7/3 − 1.25', '−2.5 + 7/4', '3/5 × 1.25'],
    requirements: { minAccuracy: 90, maxAvgTime: 4.5, minSessions: 3 },
  },
  {
    level: 6,
    name: 'Multi-Operation Rational',
    subtitle: 'Compound calculations and PEMDAS',
    description: 'Order of operations combining fractions, decimals, and mixed arithmetic.',
    topics: ['Compound operations', 'Order of operations', 'Parentheses', 'Mixed formats'],
    examples: ['(5/6 × 3/10) + 0.25', '2.5 − 3/4 + 1.2', '(7/8 + 0.5) × 2'],
    requirements: { minAccuracy: 92, maxAvgTime: 4.5, minSessions: 4 },
  },
  {
    level: 7,
    name: 'Negative Rational Numbers',
    subtitle: 'Mastering signs and negative fractions',
    description: 'Operations where negative values, signs, and rational fractions interact directly.',
    topics: ['Negative decimals', 'Negative fractions', 'Sign rules', 'Rational division'],
    examples: ['−3.75 + 5/2', '7/4 − 2.8', '−1.25 × 3/5', '(−7/8) ÷ 1.75'],
    requirements: { minAccuracy: 92, maxAvgTime: 4.0, minSessions: 4 },
  },
  {
    level: 8,
    name: 'Nested Calculations',
    subtitle: 'Multi-layered bracketed expressions',
    description: 'Nested brackets, fractional scaling, and precision rational evaluation.',
    topics: ['Brackets & parentheses', 'Multi-step reduction', 'Cross operations'],
    examples: ['(7/8 − 0.35) × 2.4', '[(3/4 + 1.25) ÷ 0.5]', '(2.5 − 3/8) × (4/5)'],
    requirements: { minAccuracy: 93, maxAvgTime: 4.0, minSessions: 5 },
  },
  {
    level: 9,
    name: 'Advanced Mixed',
    subtitle: 'High-speed complex expressions',
    description: 'Challenging fractions, decimals, negative signs, multiple steps, and larger terms.',
    topics: ['Advanced fractions', 'Nested negatives', 'Fast multi-step conversion'],
    examples: ['[(−5/4 + 2.75) × 4/3] − 1.5', '(3.6 − 14/5) ÷ 0.4 + 1/2'],
    requirements: { minAccuracy: 94, maxAvgTime: 3.5, minSessions: 5 },
  },
  {
    level: 10,
    name: 'Elite',
    subtitle: 'The pinnacle of calculation mastery',
    description: 'Extremely challenging multi-step rational expressions requiring absolute fluency and speed.',
    topics: ['Complex rational expressions', 'Multi-step reductions', 'Elite mental arithmetic'],
    examples: ['{[(7/6 − 0.25) × 12/11] + 1.5} ÷ 2', '[(−2.4 + 9/5) × (−5/3)] − 0.75'],
    requirements: { minAccuracy: 95, maxAvgTime: 3.0, minSessions: 5 },
  },
];

// Random helper
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Friendly fraction generators with clean denominators
const CLEAN_DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];
const SIMPLE_DECIMALS = [0.25, 0.5, 0.75, 1.25, 1.5, 1.75, 2.25, 2.5, 0.2, 0.4, 0.6, 0.8, 0.125, 0.375];

export function generateQuestionForLevel(level: number, categoryOverride?: SkillCategory): Question {
  const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  switch (level) {
    case 1:
      return generateLevel1(id, categoryOverride);
    case 2:
      return generateLevel2(id, categoryOverride);
    case 3:
      return generateLevel3(id);
    case 4:
      return generateLevel4(id);
    case 5:
      return generateLevel5(id);
    case 6:
      return generateLevel6(id);
    case 7:
      return generateLevel7(id);
    case 8:
      return generateLevel8(id);
    case 9:
      return generateLevel9(id);
    case 10:
    default:
      return generateLevel10(id);
  }
}

// LEVEL 1: Basic Integer (+, -, small *, small /)
function generateLevel1(id: string, categoryOverride?: SkillCategory): Question {
  const opType = categoryOverride || pickRandom(['addition', 'subtraction', 'multiplication', 'division'] as SkillCategory[]);

  if (opType === 'addition') {
    const a = randInt(12, 69);
    const b = randInt(11, 49);
    const val = createRational(a + b, 1);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
    return {
      id,
      level: 1,
      category: 'addition',
      difficulty: 'easy',
      expression: `${a} + ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: val,
      explanation: `${a} + ${b} = ${a + b}`,
    };
  }

  if (opType === 'subtraction') {
    const b = randInt(11, 49);
    const a = randInt(b + 5, b + 60);
    const val = createRational(a - b, 1);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
    return {
      id,
      level: 1,
      category: 'subtraction',
      difficulty: 'easy',
      expression: `${a} − ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: val,
      explanation: `${a} − ${b} = ${a - b}`,
    };
  }

  if (opType === 'multiplication') {
    const a = randInt(3, 12);
    const b = randInt(3, 12);
    const val = createRational(a * b, 1);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
    return {
      id,
      level: 1,
      category: 'multiplication',
      difficulty: 'easy',
      expression: `${a} × ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: val,
      explanation: `${a} × ${b} = ${a * b}`,
    };
  }

  // Division
  const divisor = randInt(2, 9);
  const quotient = randInt(3, 12);
  const dividend = divisor * quotient;
  const val = createRational(quotient, 1);
  const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
  return {
    id,
    level: 1,
    category: 'division',
    difficulty: 'easy',
    expression: `${dividend} ÷ ${divisor}`,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: val,
    explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
  };
}

// LEVEL 2: Large Integer
function generateLevel2(id: string, categoryOverride?: SkillCategory): Question {
  const opType = categoryOverride || pickRandom(['addition', 'subtraction', 'multiplication', 'division'] as SkillCategory[]);

  if (opType === 'addition') {
    const a = randInt(125, 789);
    const b = randInt(142, 687);
    const val = createRational(a + b, 1);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
    return {
      id,
      level: 2,
      category: 'addition',
      difficulty: 'medium',
      expression: `${a} + ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: val,
      explanation: `${a} + ${b} = ${a + b}`,
    };
  }

  if (opType === 'subtraction') {
    const b = randInt(150, 650);
    const a = randInt(b + 50, b + 500);
    const val = createRational(a - b, 1);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
    return {
      id,
      level: 2,
      category: 'subtraction',
      difficulty: 'medium',
      expression: `${a} − ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: val,
      explanation: `${a} − ${b} = ${a - b}`,
    };
  }

  if (opType === 'multiplication') {
    const a = randInt(24, 85);
    const b = randInt(11, 25);
    const val = createRational(a * b, 1);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
    return {
      id,
      level: 2,
      category: 'multiplication',
      difficulty: 'medium',
      expression: `${a} × ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: val,
      explanation: `${a} × ${b} = ${a * b}`,
    };
  }

  // Division
  const divisor = randInt(12, 35);
  const quotient = randInt(14, 55);
  const dividend = divisor * quotient;
  const val = createRational(quotient, 1);
  const { canonical, acceptable } = generateCanonicalAndAcceptable(val);
  return {
    id,
    level: 2,
    category: 'division',
    difficulty: 'medium',
    expression: `${dividend} ÷ ${divisor}`,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: val,
    explanation: `${dividend} ÷ ${divisor} = ${quotient}`,
  };
}

// LEVEL 3: Decimals
function generateLevel3(id: string): Question {
  const op = pickRandom(['+', '−', '×', '÷']);

  if (op === '+') {
    const a = +(randInt(15, 95) * 0.1).toFixed(1);
    const b = +(randInt(11, 89) * 0.05).toFixed(2);
    const rA = rationalFromDecimal(a);
    const rB = rationalFromDecimal(b);
    const res = rationalAdd(rA, rB);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    return {
      id,
      level: 3,
      category: 'decimals',
      difficulty: 'medium',
      expression: `${a} + ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${a} + ${b} = ${canonical}`,
    };
  }

  if (op === '−') {
    const b = +(randInt(12, 60) * 0.1).toFixed(1);
    const diff = +(randInt(15, 80) * 0.1).toFixed(1);
    const a = +((b + diff).toFixed(1));
    const rA = rationalFromDecimal(a);
    const rB = rationalFromDecimal(b);
    const res = rationalSubtract(rA, rB);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    return {
      id,
      level: 3,
      category: 'decimals',
      difficulty: 'medium',
      expression: `${a} − ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${a} − ${b} = ${canonical}`,
    };
  }

  if (op === '×') {
    const a = +(randInt(12, 45) * 0.2).toFixed(1);
    const b = pickRandom([0.2, 0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.5]);
    const rA = rationalFromDecimal(a);
    const rB = rationalFromDecimal(b);
    const res = rationalMultiply(rA, rB);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    return {
      id,
      level: 3,
      category: 'decimals',
      difficulty: 'medium',
      expression: `${a} × ${b}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${a} × ${b} = ${canonical}`,
    };
  }

  // Division
  const b = pickRandom([0.2, 0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.5]);
  const quotient = randInt(4, 25);
  const a = +((b * quotient).toFixed(2));
  const rA = rationalFromDecimal(a);
  const rB = rationalFromDecimal(b);
  const res = rationalDivide(rA, rB);
  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
  return {
    id,
    level: 3,
    category: 'decimals',
    difficulty: 'medium',
    expression: `${a} ÷ ${b}`,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: `${a} ÷ ${b} = ${canonical}`,
  };
}

// LEVEL 4: Fractions
function generateLevel4(id: string): Question {
  const op = pickRandom(['+', '−', '×', '÷']);
  const den1 = pickRandom(CLEAN_DENOMINATORS);
  const num1 = randInt(1, den1 - 1);
  const den2 = pickRandom(CLEAN_DENOMINATORS);
  const num2 = randInt(1, den2 - 1);

  const r1 = simplifyRational({ num: num1, den: den1 });
  const r2 = simplifyRational({ num: num2, den: den2 });

  if (op === '+') {
    const res = rationalAdd(r1, r2);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    return {
      id,
      level: 4,
      category: 'fractions',
      difficulty: 'medium',
      expression: `${rationalToString(r1)} + ${rationalToString(r2)}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${rationalToString(r1)} + ${rationalToString(r2)} = ${canonical}`,
    };
  }

  if (op === '−') {
    // Ensure positive result for standard level 4
    let first = r1;
    let second = r2;
    if (r1.num * r2.den < r2.num * r1.den) {
      first = r2;
      second = r1;
    }
    const res = rationalSubtract(first, second);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    return {
      id,
      level: 4,
      category: 'fractions',
      difficulty: 'medium',
      expression: `${rationalToString(first)} − ${rationalToString(second)}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${rationalToString(first)} − ${rationalToString(second)} = ${canonical}`,
    };
  }

  if (op === '×') {
    const res = rationalMultiply(r1, r2);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    return {
      id,
      level: 4,
      category: 'fractions',
      difficulty: 'medium',
      expression: `${rationalToString(r1)} × ${rationalToString(r2)}`,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${rationalToString(r1)} × ${rationalToString(r2)} = ${canonical}`,
    };
  }

  // Division
  const res = rationalDivide(r1, r2);
  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
  return {
    id,
    level: 4,
    category: 'fractions',
    difficulty: 'medium',
    expression: `${rationalToString(r1)} ÷ ${rationalToString(r2)}`,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: `${rationalToString(r1)} ÷ ${rationalToString(r2)} = ${canonical}`,
  };
}

// LEVEL 5: Mixed Rational Numbers (decimals, fractions, signed)
function generateLevel5(id: string): Question {
  const op = pickRandom(['+', '−', '×']);
  const dec = pickRandom(SIMPLE_DECIMALS);
  const fracDen = pickRandom([2, 3, 4, 5, 8]);
  const fracNum = randInt(1, fracDen * 2);
  const rFrac = simplifyRational({ num: fracNum, den: fracDen });
  const rDec = rationalFromDecimal(dec);

  const isSigned = Math.random() > 0.6;
  const signedDec = isSigned ? -dec : dec;
  const rSignedDec = rationalFromDecimal(signedDec);

  let res;
  let expr;
  let expl;

  if (op === '+') {
    res = rationalAdd(rSignedDec, rFrac);
    expr = `${signedDec} + ${rationalToString(rFrac)}`;
    expl = `${signedDec} + ${rationalToString(rFrac)} = ${rationalToString(res)}`;
  } else if (op === '−') {
    res = rationalSubtract(rFrac, rSignedDec);
    expr = `${rationalToString(rFrac)} − ${signedDec < 0 ? `(${signedDec})` : signedDec}`;
    expl = `${expr} = ${rationalToString(res)}`;
  } else {
    res = rationalMultiply(rFrac, rSignedDec);
    expr = `${rationalToString(rFrac)} × ${signedDec < 0 ? `(${signedDec})` : signedDec}`;
    expl = `${expr} = ${rationalToString(res)}`;
  }

  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
  return {
    id,
    level: 5,
    category: 'mixed',
    difficulty: 'medium',
    expression: expr,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: expl,
  };
}

// LEVEL 6: Multi-Operation Rational (PEMDAS)
function generateLevel6(id: string): Question {
  // Pattern 1: (a * b) + c
  // Pattern 2: a - b + c
  // Pattern 3: (a + b) * c
  const pattern = pickRandom([1, 2, 3]);

  if (pattern === 1) {
    const f1 = pickRandom([
      { num: 1, den: 2 },
      { num: 3, den: 4 },
      { num: 5, den: 6 },
      { num: 2, den: 3 },
    ]);
    const f2 = pickRandom([
      { num: 1, den: 3 },
      { num: 3, den: 10 },
      { num: 2, den: 5 },
      { num: 4, den: 5 },
    ]);
    const dec = pickRandom([0.25, 0.5, 0.75, 1.25]);
    const r1 = simplifyRational(f1);
    const r2 = simplifyRational(f2);
    const rDec = rationalFromDecimal(dec);
    const mult = rationalMultiply(r1, r2);
    const res = rationalAdd(mult, rDec);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    const expr = `(${rationalToString(r1)} × ${rationalToString(r2)}) + ${dec}`;
    return {
      id,
      level: 6,
      category: 'multi-step',
      difficulty: 'hard',
      expression: expr,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${expr} = ${rationalToString(mult)} + ${dec} = ${canonical}`,
    };
  }

  if (pattern === 2) {
    const dec1 = pickRandom([2.5, 3.5, 1.75, 2.25]);
    const f = pickRandom([
      { num: 1, den: 2 },
      { num: 3, den: 4 },
      { num: 1, den: 4 },
    ]);
    const dec2 = pickRandom([0.5, 1.2, 0.8, 1.5]);
    const r1 = rationalFromDecimal(dec1);
    const r2 = simplifyRational(f);
    const r3 = rationalFromDecimal(dec2);
    const step1 = rationalSubtract(r1, r2);
    const res = rationalAdd(step1, r3);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    const expr = `${dec1} − ${rationalToString(r2)} + ${dec2}`;
    return {
      id,
      level: 6,
      category: 'multi-step',
      difficulty: 'hard',
      expression: expr,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${expr} = ${rationalToString(step1)} + ${dec2} = ${canonical}`,
    };
  }

  // Pattern 3: (a + b) * c
  const f = pickRandom([
    { num: 3, den: 4 },
    { num: 7, den: 8 },
    { num: 1, den: 2 },
    { num: 3, den: 8 },
  ]);
  const dec = pickRandom([0.5, 0.25, 0.75, 1.25]);
  const multFactor = pickRandom([2, 3, 4]);
  const rF = simplifyRational(f);
  const rD = rationalFromDecimal(dec);
  const sum = rationalAdd(rF, rD);
  const res = rationalMultiply(sum, createRational(multFactor, 1));
  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
  const expr = `(${rationalToString(rF)} + ${dec}) × ${multFactor}`;
  return {
    id,
    level: 6,
    category: 'multi-step',
    difficulty: 'hard',
    expression: expr,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: `${expr} = ${rationalToString(sum)} × ${multFactor} = ${canonical}`,
  };
}

// LEVEL 7: Negative Rational Numbers
function generateLevel7(id: string): Question {
  const type = pickRandom([1, 2, 3, 4]);

  if (type === 1) {
    // e.g. -3.75 + 5/2
    const dec = pickRandom([1.5, 2.25, 2.75, 3.5, 3.75]);
    const f = pickRandom([
      { num: 3, den: 2 },
      { num: 5, den: 2 },
      { num: 7, den: 4 },
      { num: 9, den: 4 },
    ]);
    const rDec = rationalFromDecimal(-dec);
    const rF = simplifyRational(f);
    const res = rationalAdd(rDec, rF);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    const expr = `−${dec} + ${rationalToString(rF)}`;
    return {
      id,
      level: 7,
      category: 'negative',
      difficulty: 'hard',
      expression: expr,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${expr} = ${canonical}`,
    };
  }

  if (type === 2) {
    // e.g. 7/4 - 2.8
    const f = pickRandom([
      { num: 7, den: 4 },
      { num: 5, den: 4 },
      { num: 3, den: 2 },
      { num: 9, den: 5 },
    ]);
    const dec = pickRandom([2.2, 2.5, 2.8, 3.4]);
    const rF = simplifyRational(f);
    const rDec = rationalFromDecimal(dec);
    const res = rationalSubtract(rF, rDec);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    const expr = `${rationalToString(rF)} − ${dec}`;
    return {
      id,
      level: 7,
      category: 'negative',
      difficulty: 'hard',
      expression: expr,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${expr} = ${canonical}`,
    };
  }

  if (type === 3) {
    // e.g. -1.25 * 3/5
    const dec = pickRandom([0.75, 1.25, 1.5, 2.5]);
    const f = pickRandom([
      { num: 3, den: 5 },
      { num: 2, den: 3 },
      { num: 4, den: 5 },
      { num: 1, den: 4 },
    ]);
    const rDec = rationalFromDecimal(-dec);
    const rF = simplifyRational(f);
    const res = rationalMultiply(rDec, rF);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    const expr = `−${dec} × ${rationalToString(rF)}`;
    return {
      id,
      level: 7,
      category: 'negative',
      difficulty: 'hard',
      expression: expr,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${expr} = ${canonical}`,
    };
  }

  // e.g. (-7/8) / 1.75
  const f = pickRandom([
    { num: -7, den: 8 },
    { num: -3, den: 4 },
    { num: -5, den: 2 },
    { num: -9, den: 4 },
  ]);
  const dec = pickRandom([0.5, 0.75, 1.25, 1.75, 2.5]);
  const rF = simplifyRational(f);
  const rDec = rationalFromDecimal(dec);
  const res = rationalDivide(rF, rDec);
  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
  const expr = `(${rationalToString(rF)}) ÷ ${dec}`;
  return {
    id,
    level: 7,
    category: 'negative',
    difficulty: 'hard',
    expression: expr,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: `${expr} = ${canonical}`,
  };
}

// LEVEL 8: Nested Calculations
function generateLevel8(id: string): Question {
  const type = pickRandom([1, 2, 3]);

  if (type === 1) {
    // (7/8 - 0.35) * 2.4 or [(3/4 + 1.25) ÷ 0.5]
    const f = pickRandom([
      { num: 3, den: 4 },
      { num: 1, den: 2 },
      { num: 5, den: 4 },
    ]);
    const dec1 = pickRandom([0.25, 0.75, 1.25, 1.5]);
    const div = pickRandom([0.5, 0.25, 2]);
    const rF = simplifyRational(f);
    const rD = rationalFromDecimal(dec1);
    const sum = rationalAdd(rF, rD);
    const rDiv = rationalFromDecimal(div);
    const res = rationalDivide(sum, rDiv);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    const expr = `[(${rationalToString(rF)} + ${dec1}) ÷ ${div}]`;
    return {
      id,
      level: 8,
      category: 'multi-step',
      difficulty: 'hard',
      expression: expr,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${expr} = ${rationalToString(sum)} ÷ ${div} = ${canonical}`,
    };
  }

  if (type === 2) {
    // (2.5 - 3/8) * (4/5)
    const dec = pickRandom([1.5, 2.5, 3.25]);
    const f1 = pickRandom([
      { num: 1, den: 4 },
      { num: 3, den: 8 },
      { num: 1, den: 2 },
    ]);
    const f2 = pickRandom([
      { num: 2, den: 3 },
      { num: 4, den: 5 },
      { num: 1, den: 2 },
    ]);
    const rDec = rationalFromDecimal(dec);
    const rF1 = simplifyRational(f1);
    const rF2 = simplifyRational(f2);
    const sub = rationalSubtract(rDec, rF1);
    const res = rationalMultiply(sub, rF2);
    const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
    const expr = `(${dec} − ${rationalToString(rF1)}) × (${rationalToString(rF2)})`;
    return {
      id,
      level: 8,
      category: 'multi-step',
      difficulty: 'hard',
      expression: expr,
      correctAnswer: canonical,
      acceptableAnswers: acceptable,
      rationalValue: res,
      explanation: `${expr} = ${rationalToString(sub)} × ${rationalToString(rF2)} = ${canonical}`,
    };
  }

  // (7/8 - 0.375) * 4
  const f = simplifyRational({ num: 7, den: 8 });
  const dec = 0.375;
  const factor = 4;
  const sub = rationalSubtract(f, rationalFromDecimal(dec));
  const res = rationalMultiply(sub, createRational(factor, 1));
  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
  const expr = `(${rationalToString(f)} − ${dec}) × ${factor}`;
  return {
    id,
    level: 8,
    category: 'multi-step',
    difficulty: 'hard',
    expression: expr,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: `${expr} = 0.5 × 4 = ${canonical}`,
  };
}

// LEVEL 9: Advanced Mixed
function generateLevel9(id: string): Question {
  const dec1 = pickRandom([1.5, 2.25, 2.75, 3.5]);
  const f1 = pickRandom([
    { num: 3, den: 4 },
    { num: 5, den: 4 },
    { num: 7, den: 4 },
  ]);
  const f2 = pickRandom([
    { num: 2, den: 3 },
    { num: 4, den: 3 },
    { num: 3, den: 5 },
  ]);
  const subDec = pickRandom([0.5, 1.25, 1.5, 2.0]);

  const rF1 = simplifyRational({ num: -f1.num, den: f1.den });
  const rD1 = rationalFromDecimal(dec1);
  const innerSum = rationalAdd(rF1, rD1);
  const rF2 = simplifyRational(f2);
  const mult = rationalMultiply(innerSum, rF2);
  const res = rationalSubtract(mult, rationalFromDecimal(subDec));
  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);

  const expr = `[(−${f1.num}/${f1.den} + ${dec1}) × ${f2.num}/${f2.den}] − ${subDec}`;
  return {
    id,
    level: 9,
    category: 'mixed',
    difficulty: 'hard',
    expression: expr,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: `${expr} = [${rationalToString(innerSum)} × ${f2.num}/${f2.den}] − ${subDec} = ${canonical}`,
  };
}

// LEVEL 10: Elite
function generateLevel10(id: string): Question {
  const f1 = pickRandom([
    { num: 7, den: 6 },
    { num: 8, den: 5 },
    { num: 9, den: 4 },
  ]);
  const dec = pickRandom([0.25, 0.5, 0.75]);
  const scale = pickRandom([
    { num: 6, den: 5 },
    { num: 12, den: 11 },
    { num: 4, den: 3 },
  ]);
  const addTerm = pickRandom([1.5, 2.25, 2.5]);
  const divTerm = pickRandom([2, 3]);

  const rF1 = simplifyRational(f1);
  const rDec = rationalFromDecimal(dec);
  const step1 = rationalSubtract(rF1, rDec);
  const rScale = simplifyRational(scale);
  const step2 = rationalMultiply(step1, rScale);
  const rAdd = rationalFromDecimal(addTerm);
  const step3 = rationalAdd(step2, rAdd);
  const res = rationalDivide(step3, createRational(divTerm, 1));
  const { canonical, acceptable } = generateCanonicalAndAcceptable(res);

  const expr = `{ [(${rationalToString(rF1)} − ${dec}) × ${rationalToString(rScale)}] + ${addTerm} } ÷ ${divTerm}`;
  return {
    id,
    level: 10,
    category: 'mixed',
    difficulty: 'hard',
    expression: expr,
    correctAnswer: canonical,
    acceptableAnswers: acceptable,
    rationalValue: res,
    explanation: `Step-by-step elite reduction = ${canonical}`,
  };
}

// BONUS MODES QUESTION GENERATORS
export function generateBonusQuestion(bonusType: string): Question {
  const id = `bonus_${bonusType}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  switch (bonusType) {
    case 'B1': {
      // Random Mix across all 10 levels
      const lvl = randInt(1, 10);
      return generateQuestionForLevel(lvl);
    }
    case 'B2': {
      // Speed Demon: Simple calculations, tight 2s target
      const q = generateQuestionForLevel(1);
      q.timeLimit = 2.5;
      return q;
    }
    case 'B3': {
      // Chaos: Random combination of percentages, signed numbers, decimals
      const usePercent = Math.random() > 0.5;
      if (usePercent) {
        const pct = pickRandom([10, 20, 25, 50, 75]);
        const val = randInt(20, 240);
        const res = createRational((pct * val), 100);
        const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
        return {
          id,
          level: 5,
          category: 'mixed',
          difficulty: 'medium',
          expression: `${pct}% of ${val}`,
          correctAnswer: canonical,
          acceptableAnswers: acceptable,
          rationalValue: res,
          explanation: `${pct}% of ${val} = (${pct}/100) × ${val} = ${canonical}`,
        };
      }
      return generateLevel7(id);
    }
    case 'B4': {
      // Multi-Step: Longer expressions
      return generateLevel8(id);
    }
    case 'B5': {
      // Precision: Decimal precision (e.g. 0.125 + 0.0375)
      const a = pickRandom([0.125, 0.375, 0.625, 0.875, 0.05, 0.025]);
      const b = pickRandom([0.0375, 0.0625, 0.0125, 0.05, 0.125]);
      const rA = rationalFromDecimal(a);
      const rB = rationalFromDecimal(b);
      const res = rationalAdd(rA, rB);
      const { canonical, acceptable } = generateCanonicalAndAcceptable(res);
      return {
        id,
        level: 4,
        category: 'decimals',
        difficulty: 'hard',
        expression: `${a} + ${b}`,
        correctAnswer: canonical,
        acceptableAnswers: acceptable,
        rationalValue: res,
        explanation: `${a} + ${b} = ${canonical}`,
      };
    }
    case 'B6': // Endless
    case 'B7': // Survival
    case 'B8': // Infinite
    default: {
      const lvl = randInt(2, 8);
      return generateQuestionForLevel(lvl);
    }
  }
}

// Generate a single question dynamically for continuous / endless queues
export function generateSingleNextQuestion(
  level: number,
  category?: SkillCategory | 'all',
  bonusType?: string
): Question {
  if (bonusType) {
    return generateBonusQuestion(bonusType);
  }
  const cat = category && category !== 'all' ? category : undefined;
  return generateQuestionForLevel(level, cat);
}

// Generate questions for a full session ensuring minimal repetition
export function generateSessionQuestions(
  level: number,
  count: number,
  category?: SkillCategory | 'all',
  bonusType?: string
): Question[] {
  const questions: Question[] = [];
  const seenExpressions = new Set<string>();
  const effectiveCount = count > 0 ? count : 20;

  for (let i = 0; i < effectiveCount; i++) {
    let q: Question;
    let attempts = 0;
    do {
      if (bonusType) {
        q = generateBonusQuestion(bonusType);
      } else {
        const cat = category && category !== 'all' ? category : undefined;
        q = generateQuestionForLevel(level, cat);
      }
      attempts++;
    } while (seenExpressions.has(q.expression) && attempts < 10);

    seenExpressions.add(q.expression);
    questions.push(q);
  }

  return questions;
}

// Deterministic Daily Challenge generator for current date
export function generateDailyChallengeQuestions(): Question[] {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  // Deterministic seed based on date string
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) % 100000;
  }

  const questions: Question[] = [];
  for (let i = 0; i < 50; i++) {
    // Distribute levels across 1 to 9
    const level = (i % 9) + 1;
    const q = generateQuestionForLevel(level);
    q.id = `daily_${dateStr}_${i + 1}`;
    questions.push(q);
  }
  return questions;
}
