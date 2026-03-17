/**
 * Tier utility functions for mapping between SDK numeric tiers
 * and the LangChain integration's string tier names.
 */

import { TIER_ORDER, TierName } from './types.js';

/**
 * Maps SDK numeric tier (0–4) to our string tier name.
 *
 * SDK tiers:
 *   0 = New         → 'unverified'
 *   1 = Contributor → 'bronze'
 *   2 = Trusted     → 'silver'
 *   3 = Verified    → 'gold'
 *   4 = Expert      → 'platinum'
 */
export function sdkTierToName(numericTier: number): TierName {
  const index = Math.max(0, Math.min(numericTier, TIER_ORDER.length - 1));
  return TIER_ORDER[index];
}

/**
 * Returns the numeric index of a tier name within TIER_ORDER.
 * Higher index = higher trust.
 *
 * @throws if the tier name is not in TIER_ORDER
 */
export function tierIndex(tier: TierName): number {
  const idx = TIER_ORDER.indexOf(tier);
  if (idx === -1) {
    throw new Error(`Unknown tier: '${tier}'. Must be one of: ${TIER_ORDER.join(', ')}`);
  }
  return idx;
}

/**
 * Returns true if `actual` meets or exceeds `minimum`.
 */
export function tierMeetsMinimum(actual: TierName, minimum: TierName): boolean {
  return tierIndex(actual) >= tierIndex(minimum);
}

/**
 * Validates that a string is a valid TierName.
 */
export function isValidTierName(value: string): value is TierName {
  return (TIER_ORDER as readonly string[]).includes(value);
}
