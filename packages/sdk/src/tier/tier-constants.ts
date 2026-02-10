/**
 * Trust Tier Constants
 * 
 * Configuration for trust tier thresholds and metadata.
 */

import { TierRequirements, TierMetadata } from './tier-types';

/**
 * Tier level constants
 */
export const TIER_NEW = 0;
export const TIER_CONTRIBUTOR = 1;
export const TIER_TRUSTED = 2;
export const TIER_VERIFIED = 3;
export const TIER_EXPERT = 4;

export const MIN_TIER = TIER_NEW;
export const MAX_TIER = TIER_EXPERT;

/**
 * Tier requirements by level
 */
export const TIER_REQUIREMENTS: Record<number, TierRequirements> = {
  [TIER_NEW]: {
    minAttestations: 0,
    minVouches: 0,
    minVouchTier: 0,
    minApprovalRate: 0,
    minDaysActive: 0,
  },
  [TIER_CONTRIBUTOR]: {
    minAttestations: 3,
    minVouches: 0,
    minVouchTier: 0,
    minApprovalRate: 50,
    minDaysActive: 7,
  },
  [TIER_TRUSTED]: {
    minAttestations: 10,
    minVouches: 2,
    minVouchTier: 2,
    minApprovalRate: 70,
    minDaysActive: 30,
  },
  [TIER_VERIFIED]: {
    minAttestations: 25,
    minVouches: 5,
    minVouchTier: 2,
    minApprovalRate: 85,
    minDaysActive: 90,
  },
  [TIER_EXPERT]: {
    minAttestations: 50,
    minVouches: 10,
    minVouchTier: 3,
    minApprovalRate: 95,
    minDaysActive: 180,
  },
};

/**
 * Tier metadata (name, emoji, description)
 */
export const TIER_METADATA: Record<number, TierMetadata> = {
  [TIER_NEW]: {
    name: 'New',
    emoji: '🆕',
    description: 'New agent with no established reputation',
  },
  [TIER_CONTRIBUTOR]: {
    name: 'Contributor',
    emoji: '🔧',
    description: 'Active participant with basic reputation',
  },
  [TIER_TRUSTED]: {
    name: 'Trusted',
    emoji: '⭐',
    description: 'Established reputation with peer vouches',
  },
  [TIER_VERIFIED]: {
    name: 'Verified',
    emoji: '✅',
    description: 'Highly trusted agent with strong community validation',
  },
  [TIER_EXPERT]: {
    name: 'Expert',
    emoji: '👑',
    description: 'Elite status with exceptional track record',
  },
};

/**
 * Decay configuration
 */
export const DECAY_CONFIG = {
  /** Days of inactivity before decay starts */
  gracePeriodDays: 90,
  /** Days per decay level */
  decayPeriodDays: 90,
  /** Minimum trust level for a vouch to count */
  minVouchTrustLevel: 3,
};

/**
 * Get tier name by level
 */
export function getTierName(tier: number): string {
  return TIER_METADATA[tier]?.name ?? 'Unknown';
}

/**
 * Get tier emoji by level
 */
export function getTierEmoji(tier: number): string {
  return TIER_METADATA[tier]?.emoji ?? '❓';
}

/**
 * Get tier description by level
 */
export function getTierDescription(tier: number): string {
  return TIER_METADATA[tier]?.description ?? 'Unknown tier level';
}
