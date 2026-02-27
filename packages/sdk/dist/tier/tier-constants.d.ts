/**
 * Trust Tier Constants
 *
 * Configuration for trust tier thresholds and metadata.
 */
import { TierRequirements, TierMetadata } from './tier-types';
/**
 * Tier level constants
 */
export declare const TIER_NEW = 0;
export declare const TIER_CONTRIBUTOR = 1;
export declare const TIER_TRUSTED = 2;
export declare const TIER_VERIFIED = 3;
export declare const TIER_EXPERT = 4;
export declare const MIN_TIER = 0;
export declare const MAX_TIER = 4;
/**
 * Tier requirements by level
 */
export declare const TIER_REQUIREMENTS: Record<number, TierRequirements>;
/**
 * Tier metadata (name, emoji, description)
 */
export declare const TIER_METADATA: Record<number, TierMetadata>;
/**
 * Decay configuration
 */
export declare const DECAY_CONFIG: {
    /** Days of inactivity before decay starts */
    gracePeriodDays: number;
    /** Days per decay level */
    decayPeriodDays: number;
    /** Minimum trust level for a vouch to count */
    minVouchTrustLevel: number;
};
/**
 * Get tier name by level
 */
export declare function getTierName(tier: number): string;
/**
 * Get tier emoji by level
 */
export declare function getTierEmoji(tier: number): string;
/**
 * Get tier description by level
 */
export declare function getTierDescription(tier: number): string;
