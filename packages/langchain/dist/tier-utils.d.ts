/**
 * Tier utility helpers shared across langchain/elizaos packages
 */
import { TierName } from './types.js';
/**
 * Convert a numeric tier level to a TierName string.
 */
export declare function tierLevelToName(level: number): TierName;
/**
 * Convert a TierName string to its numeric level.
 */
export declare function tierNameToLevel(name: TierName): number;
/**
 * Return true if `actual` meets or exceeds `required`.
 */
export declare function tierMeetsMinimum(actual: TierName, required: TierName): boolean;
/**
 * Extract the tier level from an SDK getTier() result (handles both number and object).
 */
export declare function extractTierLevel(result: {
    tier: number;
    tierName?: string;
} | number): number;
/**
 * Extract the score from an SDK getScore() result (handles both number and object).
 */
export declare function extractScore(result: {
    score: number;
} | number): number;
