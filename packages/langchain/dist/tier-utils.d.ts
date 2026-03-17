/**
 * Tier utility functions for mapping between SDK numeric tiers
 * and the LangChain integration's string tier names.
 */
import { TierName } from './types.js';
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
export declare function sdkTierToName(numericTier: number): TierName;
/**
 * Returns the numeric index of a tier name within TIER_ORDER.
 * Higher index = higher trust.
 *
 * @throws if the tier name is not in TIER_ORDER
 */
export declare function tierIndex(tier: TierName): number;
/**
 * Returns true if `actual` meets or exceeds `minimum`.
 */
export declare function tierMeetsMinimum(actual: TierName, minimum: TierName): boolean;
/**
 * Validates that a string is a valid TierName.
 */
export declare function isValidTierName(value: string): value is TierName;
