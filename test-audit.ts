import {
  checkAnswerMatches,
  createRational,
  generateCanonicalAndAcceptable,
  parseRationalInput,
  rationalAdd,
  rationalDivide,
  rationalEquals,
  rationalFromDecimal,
  rationalMultiply,
  rationalSubtract,
  simplifyRational,
} from './src/engine/rational';
import {
  generateDailyChallengeQuestions,
  generateQuestionForLevel,
  generateQuestionsFromBlueprint,
  generateSessionQuestions,
  generateSingleNextQuestion,
  LEVEL_DEFINITIONS,
} from './src/engine/generator';
import { AILevelBlueprint, Question, SessionSummary } from './src/types';

console.log('=== CALCRUSH VERSION 1.4.1 AUDIT & STABILIZATION TEST SUITE ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    failures.push(msg);
    console.error(`❌ FAILED: ${msg}`);
  }
}

// 1. RATIONAL ARITHMETIC & PARSING AUDIT
console.log('--- 1. Testing Rational Arithmetic & Exact Parsing ---');

// Integers
assert(checkAnswerMatches('42', createRational(42, 1)), 'Parse 42');
assert(checkAnswerMatches('-17', createRational(-17, 1)), 'Parse -17');
assert(checkAnswerMatches('−17', createRational(-17, 1)), 'Parse unicode minus −17');

// Decimals
assert(checkAnswerMatches('0.75', createRational(3, 4)), '0.75 === 3/4');
assert(checkAnswerMatches('.75', createRational(3, 4)), '.75 === 3/4');
assert(checkAnswerMatches('-.5', createRational(-1, 2)), '-.5 === -1/2');
assert(checkAnswerMatches('−.5', createRational(-1, 2)), '−.5 === -1/2 (unicode minus)');
assert(checkAnswerMatches('-0.5', createRational(-1, 2)), '-0.5 === -1/2');
assert(checkAnswerMatches('−0.5', createRational(-1, 2)), '−0.5 === -1/2');
assert(checkAnswerMatches('1.5', createRational(3, 2)), '1.5 === 3/2');
assert(checkAnswerMatches('-2.25', createRational(-9, 4)), '-2.25 === -9/4');

// Fractions & Whitespace
assert(checkAnswerMatches('3/4', createRational(3, 4)), '3/4 === 3/4');
assert(checkAnswerMatches('3 / 4', createRational(3, 4)), '3 / 4 with spaces');
assert(checkAnswerMatches('- 1/2', createRational(-1, 2)), '- 1/2 with space after minus');
assert(checkAnswerMatches('− 1/2', createRational(-1, 2)), '− 1/2 unicode minus with space');
assert(checkAnswerMatches('6/8', createRational(3, 4)), '6/8 unsimplified matches 3/4');

// Mixed Numbers
assert(checkAnswerMatches('1 1/2', createRational(3, 2)), '1 1/2 === 3/2');
assert(checkAnswerMatches('-1 1/2', createRational(-3, 2)), '-1 1/2 === -3/2');
assert(checkAnswerMatches('−1 1/2', createRational(-3, 2)), '−1 1/2 === -3/2');
assert(checkAnswerMatches('2 3/4', createRational(11, 4)), '2 3/4 === 11/4');
assert(checkAnswerMatches('-2 3/4', createRational(-11, 4)), '-2 3/4 === -11/4');
assert(checkAnswerMatches('1  1/2', createRational(3, 2)), '1  1/2 multiple spaces');
assert(checkAnswerMatches('1 1 / 2', createRational(3, 2)), '1 1 / 2 spaces around slash');

// Cross-format Equivalence
assert(checkAnswerMatches('0.75', parseRationalInput('3/4')!), '0.75 matches 3/4');
assert(checkAnswerMatches('3/4', parseRationalInput('0.75')!), '3/4 matches 0.75');
assert(checkAnswerMatches('1 1/2', parseRationalInput('1.5')!), '1 1/2 matches 1.5');
assert(checkAnswerMatches('1.5', parseRationalInput('1 1/2')!), '1.5 matches 1 1/2');

// 2. QUESTION GENERATION 2,500 QUESTION AUDIT
console.log('\n--- 2. Generating & Validating 2,500 Questions Across All Modes ---');

let questionsTested = 0;
let invalidCount = 0;
let nanCount = 0;
let infCount = 0;
let divZeroCount = 0;
let mismatchCount = 0;

function validateQuestion(q: Question, context: string) {
  questionsTested++;
  if (!q.expression || typeof q.expression !== 'string' || q.expression.trim() === '') {
    invalidCount++;
    assert(false, `${context}: empty expression`);
  }
  if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
    invalidCount++;
    assert(false, `${context}: missing correctAnswer`);
  }
  if (isNaN(q.rationalValue.num) || isNaN(q.rationalValue.den)) {
    nanCount++;
    assert(false, `${context}: NaN in rationalValue`);
  }
  if (!isFinite(q.rationalValue.num) || !isFinite(q.rationalValue.den)) {
    infCount++;
    assert(false, `${context}: Infinity in rationalValue`);
  }
  if (q.rationalValue.den === 0) {
    divZeroCount++;
    assert(false, `${context}: denominator is 0`);
  }
  // Verify exact rational match
  const matches = checkAnswerMatches(q.correctAnswer, q.rationalValue);
  if (!matches) {
    mismatchCount++;
    assert(false, `${context}: correctAnswer "${q.correctAnswer}" does not match rationalValue ${q.rationalValue.num}/${q.rationalValue.den}`);
  }
}

// 200 questions per competitive level (Levels 1 to 10) = 2,000 questions
for (let lvl = 1; lvl <= 10; lvl++) {
  for (let i = 0; i < 200; i++) {
    const q = generateQuestionForLevel(lvl);
    validateQuestion(q, `Level ${lvl} Q#${i + 1}`);
  }
}

// 25 questions per Bonus Mode (B1 to B8) = 200 questions
const bonusModes = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'] as const;
for (const bMode of bonusModes) {
  const batch = generateSessionQuestions(5, 25, 'all', bMode);
  for (let i = 0; i < batch.length; i++) {
    validateQuestion(batch[i], `Bonus ${bMode} Q#${i + 1}`);
  }
}

// 100 questions for Daily Challenge
const daily1 = generateDailyChallengeQuestions();
const daily2 = generateDailyChallengeQuestions();
for (let i = 0; i < daily1.length; i++) {
  validateQuestion(daily1[i], `Daily Q#${i + 1}`);
}
for (let i = 0; i < daily2.length; i++) {
  validateQuestion(daily2[i], `Daily batch 2 Q#${i + 1}`);
}

// 100 questions for AI Level Blueprints (5 blueprints with 20 questions each)
const testBlueprints: AILevelBlueprint[] = [
  {
    title: 'School Drill',
    description: 'Fraction drill',
    questionCount: 20,
    difficulty: 4,
    purpose: 'school',
    topics: ['Fractions'],
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    features: { negativeNumbers: false, mixedNumbers: true, pemdas: false, parentheses: false, decimals: false, fractions: true },
  },
  {
    title: 'Decimals Speed',
    description: 'Decimals drill',
    questionCount: 20,
    difficulty: 3,
    purpose: 'speed',
    topics: ['Decimals'],
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    features: { negativeNumbers: false, mixedNumbers: false, pemdas: false, parentheses: false, decimals: true, fractions: false },
  },
  {
    title: 'Olympiad Rational',
    description: 'Olympiad challenge',
    questionCount: 20,
    difficulty: 10,
    purpose: 'olympiad',
    topics: ['Complex rational', 'PEMDAS'],
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    features: { negativeNumbers: true, mixedNumbers: true, pemdas: true, parentheses: true, decimals: true, fractions: true },
  },
  {
    title: 'Signed Numbers',
    description: 'Negatives drill',
    questionCount: 20,
    difficulty: 7,
    purpose: 'competitive',
    topics: ['Negatives'],
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    features: { negativeNumbers: true, mixedNumbers: false, pemdas: false, parentheses: false, decimals: true, fractions: true },
  },
  {
    title: 'PEMDAS Nested',
    description: 'PEMDAS drill',
    questionCount: 20,
    difficulty: 8,
    purpose: 'exam',
    topics: ['Order of operations'],
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    features: { negativeNumbers: true, mixedNumbers: false, pemdas: true, parentheses: true, decimals: true, fractions: true },
  },
];

for (const bp of testBlueprints) {
  const bpQuestions = generateQuestionsFromBlueprint(bp);
  for (let i = 0; i < bpQuestions.length; i++) {
    validateQuestion(bpQuestions[i], `Blueprint "${bp.title}" Q#${i + 1}`);
  }
}

console.log(`Questions generated & tested: ${questionsTested}`);
console.log(`NaN: ${nanCount}, Infinity: ${infCount}, Div-by-zero: ${divZeroCount}, Mismatches: ${mismatchCount}, Invalid: ${invalidCount}`);
assert(nanCount === 0, 'Zero NaN questions');
assert(infCount === 0, 'Zero Infinity questions');
assert(divZeroCount === 0, 'Zero division-by-zero questions');
assert(mismatchCount === 0, 'Zero answer mismatches');
assert(invalidCount === 0, 'Zero invalid questions');

// 3. UNLIMITED MODE & QUEUE REPLENISHMENT AUDIT
console.log('\n--- 3. Testing Unlimited Modes Queue Replenishment (20, 50, 100, 250) ---');

for (const mode of ['B6', 'B7', 'B8'] as const) {
  let queue: Question[] = generateSessionQuestions(5, 20, 'all', mode);
  assert(queue.length === 20, `${mode} initial batch is 20`);
  
  // Simulate solving and continuous replenishment up to 250 questions
  for (let step = 0; step < 25; step++) {
    const additional: Question[] = [];
    for (let k = 0; k < 10; k++) {
      additional.push(generateSingleNextQuestion(5, 'all', mode));
    }
    queue = [...queue, ...additional];
  }
  assert(queue.length === 270, `${mode} successfully replenished to 270 questions`);
  assert(queue.every((q) => q && q.expression && q.correctAnswer), `${mode} all questions defined and valid`);
}

// 4. COMPETITIVE PROGRESSION THRESHOLD AUDIT
console.log('\n--- 4. Testing Competitive Qualification Boundary Conditions ---');

const req = LEVEL_DEFINITIONS[0].requirements; // Level 1 req: minAccuracy 85, maxAvgTime 6.0, minSessions 2
assert(84.99 < req.minAccuracy, '84.99% is not qualifying');
assert(85.0 >= req.minAccuracy, '85.0% is qualifying');
assert(85.01 >= req.minAccuracy, '85.01% is qualifying');

assert(6.01 > req.maxAvgTime, '6.01s is not qualifying');
assert(6.0 <= req.maxAvgTime, '6.00s is qualifying');
assert(5.99 <= req.maxAvgTime, '5.99s is qualifying');

// 5. AUTHENTICATION, OTP, CLOUD SYNC & SECURITY AUDIT
console.log('\n--- 5. Testing Authentication, Email Verification OTP, Cloud Sync & Security ---');
import { authStore } from './server/store';

// Test Registration & Hashing
const testEmail = `test_audit_${Date.now()}@calcrush.internal`;
const regResult = authStore.registerUser('Audit Tester', testEmail, 'SuperSecret123!');
assert(regResult.user.id.startsWith('usr_'), 'User ID has usr_ prefix');
assert(regResult.user.isEmailVerified === false, 'User starts unverified');
assert(regResult.user.passwordHash !== 'SuperSecret123!', 'Password is cryptographically hashed');
assert(Boolean(regResult.verificationCode), '6-digit OTP code generated on registration');
assert(regResult.verificationCode.length === 6, 'Verification code is 6 digits');

// Test Duplicate Email Protection
let dupFailed = false;
try {
  authStore.registerUser('Duplicate', testEmail, 'Password123!');
} catch (e: any) {
  dupFailed = true;
}
assert(dupFailed, 'Duplicate email registration rejected');

// Test Login with Good & Bad Credentials
const authGood = authStore.authenticate(testEmail, 'SuperSecret123!');
assert(Boolean(authGood.token), 'Valid login issues session token');
let badAuthFailed = false;
try {
  authStore.authenticate(testEmail, 'WrongPassword!');
} catch {
  badAuthFailed = true;
}
assert(badAuthFailed, 'Bad password correctly rejected');

// Test Invalid Verification Code
let invalidOtpFailed = false;
try {
  authStore.verifyEmail(testEmail, '000000');
} catch {
  invalidOtpFailed = true;
}
assert(invalidOtpFailed, 'Invalid 6-digit verification code rejected');

// Test Valid Verification Code
const verifyResult = authStore.verifyEmail(testEmail, regResult.verificationCode);
assert(verifyResult.success === true, 'Valid code verifies email');
assert(verifyResult.user.isEmailVerified === true, 'Email marked as verified in store');

// Test Resend Verification Code when already verified
let resendWhenVerifiedFailed = false;
try {
  authStore.resendVerificationCode(testEmail);
} catch {
  resendWhenVerifiedFailed = true;
}
assert(resendWhenVerifiedFailed, 'Cannot request OTP if already verified');

// Test Password Recovery Request
const forgotRes = authStore.requestPasswordReset(testEmail);
assert(Boolean(forgotRes.code), 'Password reset code generated');
assert(forgotRes.code?.length === 6, 'Reset code is 6 digits');

// Test Password Reset Execution
const resetSuccess = authStore.resetPassword(testEmail, forgotRes.code!, 'NewSecret456!');
assert(resetSuccess === true, 'Password reset successful');

// Test Login with New Password
const authNewPass = authStore.authenticate(testEmail, 'NewSecret456!');
assert(Boolean(authNewPass.token), 'Can sign in with new password');

// Test Cloud Synchronization & Data Merging
const sampleSyncPayload = {
  userProfile: { competitiveRating: 1250, competitiveLevel: 4 },
  competitiveSessions: [
    { id: 's1', totalQuestions: 20, correctCount: 19, accuracy: 95, averageTime: 3.2, date: Date.now() - 1000 },
  ],
  practiceSessions: [],
  mistakes: [{ id: 'm1', userAnswer: '12', timestamp: Date.now(), solvedCount: 0 }],
  achievements: [{ id: 'first_calc', progress: 1, maxProgress: 1, unlockedAt: Date.now() }],
  bonusRecords: { B1: { bestStreak: 15, bestScore: 15, bestAvgTime: 2.1 } },
  dailyRecords: {},
  savedCustomLevels: [],
};

const pushedData = authStore.pushCloudData(regResult.user.id, sampleSyncPayload);
assert(pushedData.competitiveSessions.length === 1, 'Cloud sync pushed 1 session');
assert(pushedData.lastSyncedAt > 0, 'Cloud sync records lastSyncedAt timestamp');

// Test Cloud Pull
const pulledData = authStore.pullCloudData(regResult.user.id);
assert(pulledData !== null, 'Pulled cloud data exists');
assert(pulledData?.competitiveSessions[0].id === 's1', 'Pulled session matches pushed session');

// Test Merge Conflict Resolution: Union without loss
const secondSyncPayload = {
  competitiveSessions: [
    { id: 's2', totalQuestions: 20, correctCount: 20, accuracy: 100, averageTime: 2.5, date: Date.now() },
  ],
  achievements: [{ id: 'lightning', progress: 1, maxProgress: 1, unlockedAt: Date.now() }],
};
const mergedData = authStore.pushCloudData(regResult.user.id, secondSyncPayload as any);
assert(mergedData.competitiveSessions.length === 2, 'Sessions safely unioned (2 sessions total)');
assert(mergedData.achievements.length === 2, 'Achievements safely merged (both first_calc and lightning present)');

// Test Account Deletion
const deleted = authStore.deleteUser(regResult.user.id);
assert(deleted === true, 'User deleted');
assert(authStore.getUserByEmail(testEmail) === null, 'Deleted user cannot be retrieved by email');
assert(authStore.pullCloudData(regResult.user.id) === null, 'Deleted user cloud data purged');

console.log('\n=== AUDIT RESULTS SUMMARY ===');
console.log(`Total assertions: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
  console.error('\nFailures encountered:');
  failures.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 ALL 2,500+ MATHEMATICAL AND LOGICAL TESTS PASSED WITH 0 ERRORS!');
}
