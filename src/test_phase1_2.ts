import { LEVEL_DEFINITIONS, generateQuestionForLevel } from './engine/generator';
import {
  checkAnswerMatches,
  createRational,
  parseRationalInput,
  rationalAdd,
  rationalDivide,
  rationalFromDecimal,
  rationalMultiply,
  rationalSubtract,
  rationalToString,
} from './engine/rational';
import { analyzeMistakes } from './engine/mistakes';
import { generateTrainingRecommendations } from './engine/recommendations';
import { INITIAL_ACHIEVEMENTS } from './utils/storage';
import { QuestionResult, SessionSummary, UserProfile } from './types';

function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CALCRUSH PHASE 1.2 — AUTOMATED VERIFICATION SUITE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${testName}${details ? ' - ' + details : ''}`);
    }
  }

  // 1. Rational Arithmetic & Parsing
  console.log('\n[1] Testing Rational Parsing & Arithmetic Engine...');
  const negDecimals = ['-.5', '-0.5', '-.75', '-0.75', '-.125', '-1.25'];
  negDecimals.forEach((str) => {
    const r = rationalFromDecimal(str);
    assert(r !== null && !isNaN(r.num) && !isNaN(r.den) && r.num < 0, `Parse negative decimal "${str}"`);
  });

  const unicodeMinuses = ['−1/2', '−0.75', '−.5', '–3/4', '—1/4', '- 1/2'];
  unicodeMinuses.forEach((str) => {
    const r = parseRationalInput(str);
    assert(r !== null && !isNaN(r.num) && !isNaN(r.den) && r.num < 0, `Parse unicode minus "${str}"`);
  });

  const mixedFractions = ['1 1/2', '2 3/4', '-1 1/4', '3 1/8'];
  mixedFractions.forEach((str) => {
    const r = parseRationalInput(str);
    assert(r !== null && !isNaN(r.num) && !isNaN(r.den), `Parse mixed number "${str}"`);
  });

  // 2. Generate 1,000 Questions across all 10 levels
  console.log('\n[2] Generating 1,000 Questions across all 10 levels...');
  let totalGenerated = 0;
  let validGenerated = 0;

  for (let lvl = 1; lvl <= 10; lvl++) {
    for (let i = 0; i < 100; i++) {
      totalGenerated++;
      const q = generateQuestionForLevel(lvl);
      if (
        q.expression &&
        q.correctAnswer &&
        q.rationalValue &&
        !isNaN(q.rationalValue.num) &&
        !isNaN(q.rationalValue.den) &&
        q.acceptableAnswers &&
        q.acceptableAnswers.length > 0 &&
        checkAnswerMatches(q.correctAnswer, q.rationalValue)
      ) {
        validGenerated++;
      } else {
        console.error(`Invalid question on level ${lvl}:`, q);
      }
    }
  }
  assert(
    validGenerated === 1000,
    `Generated and verified 1,000 valid questions (Valid: ${validGenerated}/1000)`
  );

  // 3. Competitive Level Qualification & Requirements Logic
  console.log('\n[3] Testing Level Qualification Logic...');
  const mockLevel1Def = LEVEL_DEFINITIONS[0];
  assert(mockLevel1Def.requirements.minAccuracy === 85, 'Level 1 requires 85% accuracy');
  assert(mockLevel1Def.requirements.maxAvgTime === 6.0, 'Level 1 requires <= 6.0s average time');
  assert(mockLevel1Def.requirements.minSessions === 2, 'Level 1 requires 2 qualifying sessions');

  // Verify qualifying session requires BOTH accuracy and speed in the SAME session
  const qualifyingSession: SessionSummary = {
    id: 's1',
    date: Date.now(),
    mode: 'competitive',
    level: 1,
    totalQuestions: 20,
    correctCount: 18,
    accuracy: 90,
    averageTime: 4.5,
    fastestTime: 2.1,
    slowestTime: 6.0,
    totalTime: 90,
    bestStreak: 12,
    ratingBefore: 1000,
    ratingAfter: 1032,
    ratingDelta: 32,
    xpEarned: 270,
    results: [],
  };

  const highAccSlowSession: SessionSummary = {
    ...qualifyingSession,
    accuracy: 95,
    averageTime: 8.5, // Fails time criteria
  };

  const fastLowAccSession: SessionSummary = {
    ...qualifyingSession,
    accuracy: 75, // Fails acc criteria
    averageTime: 3.0,
  };

  const isQualifying = (s: SessionSummary) =>
    s.accuracy >= mockLevel1Def.requirements.minAccuracy &&
    s.averageTime <= mockLevel1Def.requirements.maxAvgTime;

  assert(isQualifying(qualifyingSession) === true, 'Session with Acc 90% and Time 4.5s qualifies');
  assert(isQualifying(highAccSlowSession) === false, 'Session with Acc 95% and Time 8.5s does not qualify');
  assert(isQualifying(fastLowAccSession) === false, 'Session with Acc 75% and Time 3.0s does not qualify');

  // 4. Mistake Bank Intelligence & Analysis
  console.log('\n[4] Testing Mistake Bank Intelligence...');
  const mockMistakes = [
    {
      id: 'm1',
      question: { ...generateQuestionForLevel(1), category: 'addition' as const },
      userAnswer: '12',
      timestamp: Date.now(),
      timeTaken: 3.5,
      solvedCount: 0,
    },
    {
      id: 'm2',
      question: { ...generateQuestionForLevel(4), category: 'fractions' as const },
      userAnswer: '3/5',
      timestamp: Date.now(),
      timeTaken: 5.2,
      solvedCount: 0,
    },
    {
      id: 'm3',
      question: { ...generateQuestionForLevel(4), category: 'fractions' as const },
      userAnswer: '1/2',
      timestamp: Date.now(),
      timeTaken: 4.8,
      solvedCount: 0,
    },
  ];

  const mistakeInsights = analyzeMistakes(mockMistakes);
  assert(mistakeInsights.totalCount === 3, 'Total mistake count is 3');
  assert(mistakeInsights.byCategory['fractions'] === 2, 'Fractions mistake count is 2');
  assert(mistakeInsights.byCategory['addition'] === 1, 'Addition mistake count is 1');
  assert(
    mistakeInsights.mostFrequentCategory?.category === 'fractions' &&
      mistakeInsights.mostFrequentCategory.count === 2,
    'Identified top error pattern: fractions with 2 mistakes'
  );

  // 5. Rule-Based Personalized Training Recommendations
  console.log('\n[5] Testing Rule-Based Recommendations Engine...');
  const mockUser: UserProfile = {
    id: 'user_test',
    isGuest: true,
    name: 'Tester',
    createdAt: Date.now(),
    competitiveLevel: 2,
    competitiveRating: 1100,
    xp: 500,
    currentStreak: 5,
    bestStreak: 12,
    questionsSolved: 120,
    totalTimeTrained: 600,
    soundEnabled: true,
    hapticsEnabled: true,
    theme: 'dark',
    dailyGoal: 50,
    dailyStreak: 2,
  };

  const recs = generateTrainingRecommendations(
    mockUser,
    [qualifyingSession],
    mockMistakes,
    { category: 'decimals', accuracy: 72 },
    20, // 20 solved today out of 50
    50,
    2,
    {
      accuracyMet: false,
      timeMet: false,
      sessionsCompleted: 1,
      targetSessions: 2,
      bestAccuracy: 90,
      bestAvgTime: 4.5,
      canUnlock: false,
    }
  );

  assert(recs.length >= 2 && recs.length <= 3, `Recommendations returned 2-3 items (count: ${recs.length})`);
  assert(recs.some((r) => r.id === 'rec_level_progress'), 'Includes level progression recommendation');
  assert(recs.some((r) => r.id === 'rec_mistakes'), 'Includes mistake reinforcement recommendation');
  assert(recs.some((r) => r.id === 'rec_weak_area'), 'Includes weak area drill recommendation');

  // 6. Achievements System Validation
  console.log('\n[6] Testing Achievements System (14 Achievements)...');
  assert(INITIAL_ACHIEVEMENTS.length === 14, `All 14 achievements defined (count: ${INITIAL_ACHIEVEMENTS.length})`);
  const expectedAchIds = [
    'first_calc',
    'lightning',
    'perfect_session',
    'on_fire',
    'ten_sub_two',
    'scholar_100',
    'scholar_1000',
    'rational_master',
    'elite_tier',
    'daily_champion',
    'streak_master',
    'flawless_50',
    'mathlete',
    'mistake_eraser',
  ];
  expectedAchIds.forEach((id) => {
    assert(INITIAL_ACHIEVEMENTS.some((a) => a.id === id), `Achievement "${id}" is registered`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
