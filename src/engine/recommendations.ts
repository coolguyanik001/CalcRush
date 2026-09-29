import { LEVEL_DEFINITIONS } from './generator';
import { MistakeRecord, SessionConfig, SessionSummary, TrainingRecommendation, UserProfile } from '../types';

export function generateTrainingRecommendations(
  user: UserProfile | null,
  competitiveSessions: SessionSummary[],
  mistakes: MistakeRecord[],
  weakArea: { category: string; accuracy: number } | null,
  questionsToday: number,
  dailyGoal: number,
  currentLevel: number,
  nextLevelProgress?: {
    accuracyMet: boolean;
    timeMet: boolean;
    sessionsCompleted: number;
    targetSessions: number;
    bestAccuracy: number;
    bestAvgTime: number;
    canUnlock: boolean;
  }
): TrainingRecommendation[] {
  const recommendations: TrainingRecommendation[] = [];
  const currentDef = LEVEL_DEFINITIONS.find((l) => l.level === currentLevel);
  const nextLevel = Math.min(10, currentLevel + 1);
  const nextDef = LEVEL_DEFINITIONS.find((l) => l.level === nextLevel);

  // 1. Level Progression & Qualification Recommendation
  if (currentLevel < 10 && nextDef && nextLevelProgress) {
    const remaining = Math.max(0, nextLevelProgress.targetSessions - nextLevelProgress.sessionsCompleted);
    if (remaining > 0) {
      recommendations.push({
        id: 'rec_level_progress',
        title: `Advance to Level ${nextLevel} (${nextDef.name})`,
        description: `You need ${remaining} more qualifying session${remaining > 1 ? 's' : ''} on Level ${currentLevel} (Acc ≥ ${currentDef?.requirements.minAccuracy}%, Time ≤ ${currentDef?.requirements.maxAvgTime}s) to unlock Level ${nextLevel}.`,
        badge: 'Progression',
        badgeType: 'cyan',
        actionLabel: 'Enter Qualifying Session',
        sessionConfig: {
          mode: 'competitive',
          level: currentLevel,
          questionCount: 20,
          hasTimer: true,
        },
      });
    } else {
      recommendations.push({
        id: 'rec_level_advance',
        title: `Level ${nextLevel} Ready to Master!`,
        description: `You met qualification standards! Push into ${nextDef.name} to continue climbing the competitive ladder.`,
        badge: 'Promotion',
        badgeType: 'emerald',
        actionLabel: `Start Level ${nextLevel}`,
        sessionConfig: {
          mode: 'competitive',
          level: nextLevel,
          questionCount: 20,
          hasTimer: true,
        },
      });
    }
  }

  // 2. Mistake Bank Clean-up Recommendation
  if (mistakes.length > 0) {
    const errorCategories: Record<string, number> = {};
    mistakes.forEach((m) => {
      errorCategories[m.question.category] = (errorCategories[m.question.category] || 0) + 1;
    });
    const sortedCats = Object.entries(errorCategories).sort((a, b) => b[1] - a[1]);
    const topErrorCat = sortedCats[0];

    recommendations.push({
      id: 'rec_mistakes',
      title: `Reinforce Mistake Bank (${mistakes.length} stored)`,
      description: topErrorCat
        ? `Primary error pattern: ${topErrorCat[0]} (${topErrorCat[1]} mistake${topErrorCat[1] > 1 ? 's' : ''}). Drilling these questions cements correct methods.`
        : `Drill your ${mistakes.length} recorded mistake${mistakes.length > 1 ? 's' : ''} to convert past slips into instant fluency.`,
      badge: 'Reinforcement',
      badgeType: 'amber',
      actionLabel: 'Drill Mistakes',
      sessionConfig: {
        mode: 'mistakes',
        level: currentLevel,
        questionCount: Math.min(20, mistakes.length),
        hasTimer: false,
      },
      targetView: 'mistakes',
    });
  }

  // 3. Weak Area Targeted Drill Recommendation
  if (weakArea && weakArea.accuracy < 88) {
    recommendations.push({
      id: 'rec_weak_area',
      title: `Target Weakest Skill: ${weakArea.category.toUpperCase()}`,
      description: `Your accuracy in ${weakArea.category} is currently ${weakArea.accuracy}%. Run a focused 20-problem drill to bring it above 90%.`,
      badge: 'Focus Drill',
      badgeType: 'rose',
      actionLabel: `Drill ${weakArea.category}`,
      sessionConfig: {
        mode: 'practice',
        level: currentLevel,
        questionCount: 20,
        hasTimer: false,
        category: weakArea.category as any,
      },
    });
  }

  // 4. Daily Training Goal Progress Recommendation
  if (questionsToday < dailyGoal) {
    const remainingQuestions = dailyGoal - questionsToday;
    recommendations.push({
      id: 'rec_daily_goal',
      title: `Daily Goal: ${questionsToday} / ${dailyGoal} Solved`,
      description: `${remainingQuestions} question${remainingQuestions > 1 ? 's' : ''} remaining today to maintain your training streak and build daily rhythm.`,
      badge: 'Daily Habit',
      badgeType: 'emerald',
      actionLabel: 'Train Daily Set',
      sessionConfig: {
        mode: 'practice',
        level: currentLevel,
        questionCount: Math.min(20, remainingQuestions),
        hasTimer: true,
      },
    });
  } else if (recommendations.length < 3) {
    // If daily goal already met, suggest Speed Blitz
    recommendations.push({
      id: 'rec_speed_blitz',
      title: 'Daily Goal Complete — Speed Blitz!',
      description: 'You smashed your daily target! Sharpen reaction tempo with a rapid 10-question sprint under a 2.0s tempo.',
      badge: 'Speed Drill',
      badgeType: 'purple',
      actionLabel: 'Launch Speed Blitz',
      sessionConfig: {
        mode: 'practice',
        level: currentLevel,
        questionCount: 10,
        hasTimer: true,
        targetPace: 2.0,
      },
    });
  }

  // 5. High-speed vs Accuracy Balance
  if (recommendations.length < 3) {
    const recentComp = competitiveSessions.slice(0, 3);
    const avgRecentAcc = recentComp.length > 0
      ? recentComp.reduce((acc, s) => acc + s.accuracy, 0) / recentComp.length
      : 100;
    const avgRecentTime = recentComp.length > 0
      ? recentComp.reduce((acc, s) => acc + s.averageTime, 0) / recentComp.length
      : 3.0;

    if (avgRecentAcc >= 90 && avgRecentTime > 4.5) {
      recommendations.push({
        id: 'rec_speed_demon',
        title: 'Tempo Push: Speed Demon (B2)',
        description: 'Your accuracy is rock-solid. Challenge yourself in Speed Demon with rapid calculations to build instinctual automaticity.',
        badge: 'Tempo',
        badgeType: 'cyan',
        actionLabel: 'Play Speed Demon',
        sessionConfig: {
          mode: 'bonus',
          level: currentLevel,
          questionCount: 25,
          hasTimer: true,
          bonusType: 'B2',
        },
      });
    } else {
      recommendations.push({
        id: 'rec_precision_drill',
        title: 'Accuracy Focus: Precision 20',
        description: 'Take your time without clock pressure. Build 100% calculation confidence with a untimed 20-problem set.',
        badge: 'Mastery',
        badgeType: 'emerald',
        actionLabel: 'Start Precision 20',
        sessionConfig: {
          mode: 'practice',
          level: currentLevel,
          questionCount: 20,
          hasTimer: false,
        },
      });
    }
  }

  // Limit to top 3 prioritized recommendations
  return recommendations.slice(0, 3);
}
