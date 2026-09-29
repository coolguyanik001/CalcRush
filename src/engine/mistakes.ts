import { MistakeInsight, MistakeRecord } from '../types';

export function analyzeMistakes(mistakes: MistakeRecord[]): MistakeInsight {
  const byCategory: Record<string, number> = {};
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  let recentCount = 0;

  mistakes.forEach((m) => {
    const cat = m.question.category || 'mixed';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    if (m.timestamp >= oneDayAgo) {
      recentCount++;
    }
  });

  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const mostFrequentCategory = sortedCats.length > 0 ? { category: sortedCats[0][0], count: sortedCats[0][1] } : null;

  return {
    totalCount: mistakes.length,
    byCategory,
    mostFrequentCategory,
    recentCount,
  };
}

export function formatMistakeTimestamp(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
