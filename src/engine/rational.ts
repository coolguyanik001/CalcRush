import { RationalNumber } from '../types';

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

export function simplifyRational(r: RationalNumber): RationalNumber {
  if (r.den === 0) return { num: 0, den: 1 };
  const sign = (r.num < 0 ? -1 : 1) * (r.den < 0 ? -1 : 1);
  const numAbs = Math.abs(Math.round(r.num));
  const denAbs = Math.abs(Math.round(r.den));
  const g = gcd(numAbs, denAbs);
  return {
    num: sign * (numAbs / g),
    den: denAbs / g,
  };
}

export function createRational(num: number, den: number = 1): RationalNumber {
  return simplifyRational({ num, den });
}

export function rationalFromDecimal(decStr: string | number): RationalNumber {
  let str = String(decStr)
    .trim()
    .replace(',', '.')
    .replace(/[\u2212\u2013\u2014]/g, '-');
  if (!str.includes('.')) {
    const n = parseInt(str, 10);
    return isNaN(n) ? { num: 0, den: 1 } : { num: n, den: 1 };
  }
  // Normalize "-.5" -> "-0.5", "+.5" -> "0.5", ".5" -> "0.5"
  if (str.startsWith('-.')) {
    str = '-0.' + str.slice(2);
  } else if (str.startsWith('+.')) {
    str = '0.' + str.slice(2);
  } else if (str.startsWith('.')) {
    str = '0.' + str.slice(1);
  }
  const parts = str.split('.');
  const sign = str.startsWith('-') ? -1 : 1;
  const absInt = parseInt(parts[0].replace('-', '') || '0', 10);
  const decDigits = parts[1] || '';
  const den = Math.pow(10, decDigits.length);
  const decNum = parseInt(decDigits, 10) || 0;
  const totalNum = absInt * den + decNum;
  return simplifyRational({ num: sign * totalNum, den });
}

export function parseRationalInput(input: string): RationalNumber | null {
  if (!input) return null;
  // Normalize unicode minus signs, commas, whitespace after minus, and whitespace around slashes
  let trimmed = input
    .trim()
    .replace(',', '.')
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/^-\s+/, '-')
    .replace(/\s*\/\s*/g, '/');

  // Check for mixed number format: e.g. "1 1/2" or "-2 3/4"
  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den === 0) return null;
    const sign = whole < 0 || mixedMatch[1].startsWith('-') ? -1 : 1;
    const absWhole = Math.abs(whole);
    return simplifyRational({
      num: sign * (absWhole * den + num),
      den,
    });
  }

  // Check for standard fraction: e.g. "3/4" or "-5/2"
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length !== 2) return null;
    const num = Number(parts[0].trim());
    const den = Number(parts[1].trim());
    if (isNaN(num) || isNaN(den) || den === 0) return null;
    return simplifyRational({
      num: Math.round(num),
      den: Math.round(den),
    });
  }

  // Decimal or integer
  if (trimmed.includes('.')) {
    return rationalFromDecimal(trimmed);
  }

  const intVal = parseInt(trimmed, 10);
  if (!isNaN(intVal)) {
    return { num: intVal, den: 1 };
  }

  return null;
}

export function rationalAdd(a: RationalNumber, b: RationalNumber): RationalNumber {
  return simplifyRational({
    num: a.num * b.den + b.num * a.den,
    den: a.den * b.den,
  });
}

export function rationalSubtract(a: RationalNumber, b: RationalNumber): RationalNumber {
  return simplifyRational({
    num: a.num * b.den - b.num * a.den,
    den: a.den * b.den,
  });
}

export function rationalMultiply(a: RationalNumber, b: RationalNumber): RationalNumber {
  return simplifyRational({
    num: a.num * b.num,
    den: a.den * b.den,
  });
}

export function rationalDivide(a: RationalNumber, b: RationalNumber): RationalNumber {
  if (b.num === 0) return { num: 0, den: 1 };
  return simplifyRational({
    num: a.num * b.den,
    den: a.den * b.num,
  });
}

export function rationalEquals(a: RationalNumber, b: RationalNumber): boolean {
  const sa = simplifyRational(a);
  const sb = simplifyRational(b);
  return sa.num === sb.num && sa.den === sb.den;
}

export function isTerminatingDecimal(r: RationalNumber): boolean {
  const s = simplifyRational(r);
  let d = s.den;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

export function rationalToDecimalString(r: RationalNumber): string | null {
  if (!isTerminatingDecimal(r)) return null;
  const val = r.num / r.den;
  // Format up to 10 decimal places, removing trailing zeros
  const rounded = parseFloat(val.toFixed(10));
  return String(rounded);
}

export function rationalToString(r: RationalNumber): string {
  const s = simplifyRational(r);
  if (s.den === 1) {
    return String(s.num);
  }
  return `${s.num}/${s.den}`;
}

export function generateCanonicalAndAcceptable(r: RationalNumber): {
  canonical: string;
  acceptable: string[];
} {
  const s = simplifyRational(r);
  const acceptable = new Set<string>();

  const fracStr = `${s.num}/${s.den}`;
  const decStr = rationalToDecimalString(s);

  if (s.den === 1) {
    const intStr = String(s.num);
    acceptable.add(intStr);
    acceptable.add(`${intStr}.0`);
    return { canonical: intStr, acceptable: Array.from(acceptable) };
  }

  // Both fraction and decimal representations
  acceptable.add(fracStr);
  if (decStr !== null) {
    acceptable.add(decStr);
    acceptable.add(decStr.replace('.', ',')); // comma decimal support
  }

  // Mixed number support if improper fraction
  if (Math.abs(s.num) > s.den) {
    const sign = s.num < 0 ? '-' : '';
    const whole = Math.floor(Math.abs(s.num) / s.den);
    const rem = Math.abs(s.num) % s.den;
    if (rem > 0) {
      acceptable.add(`${sign}${whole} ${rem}/${s.den}`);
    }
  }

  // Common unreduced fractions for easy entry
  acceptable.add(`${s.num * 2}/${s.den * 2}`);

  // Canonical is preferred decimal if simple terminating, or simplified fraction
  const canonical = (decStr !== null && decStr.length <= 4) ? decStr : fracStr;

  return { canonical, acceptable: Array.from(acceptable) };
}

export function checkAnswerMatches(userAnswer: string, targetRational: RationalNumber): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;
  const userRat = parseRationalInput(userAnswer);
  if (!userRat) return false;
  return rationalEquals(userRat, targetRational);
}
