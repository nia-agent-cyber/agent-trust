/**
 * Tier utility helpers shared across langchain/elizaos packages
 */

import { TierName, TIER_ORDER, TIER_NAMES } from './types.js';

/**
 * Convert a numeric tier level to a TierName string.
 */
export function tierLevelToName(level: number): TierName {
  return TIER_NAMES[level] ?? 'unverified';
}

/**
 * Convert a TierName string to its numeric level.
 */
export function tierNameToLevel(name: TierName): number {
  return TIER_ORDER.indexOf(name);
}

/**
 * Return true if `actual` meets or exceeds `required`.
 */
export function tierMeetsMinimum(actual: TierName, required: TierName): boolean {
  return tierNameToLevel(actual) >= tierNameToLevel(required);
}

/**
 * Extract the tier level from an SDK getTier() result (handles both number and object).
 */
export function extractTierLevel(result: { tier: number; tierName?: string } | number): number {
  if (typeof result === 'number') return result;
  return result.tier;
}

/**
 * Extract the score from an SDK getScore() result (handles both number and object).
 */
export function extractScore(result: { score: number } | number): number {
  if (typeof result === 'number') return result;
  return result.score;
}
