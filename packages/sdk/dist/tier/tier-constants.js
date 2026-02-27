"use strict";
/**
 * Trust Tier Constants
 *
 * Configuration for trust tier thresholds and metadata.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECAY_CONFIG = exports.TIER_METADATA = exports.TIER_REQUIREMENTS = exports.MAX_TIER = exports.MIN_TIER = exports.TIER_EXPERT = exports.TIER_VERIFIED = exports.TIER_TRUSTED = exports.TIER_CONTRIBUTOR = exports.TIER_NEW = void 0;
exports.getTierName = getTierName;
exports.getTierEmoji = getTierEmoji;
exports.getTierDescription = getTierDescription;
/**
 * Tier level constants
 */
exports.TIER_NEW = 0;
exports.TIER_CONTRIBUTOR = 1;
exports.TIER_TRUSTED = 2;
exports.TIER_VERIFIED = 3;
exports.TIER_EXPERT = 4;
exports.MIN_TIER = exports.TIER_NEW;
exports.MAX_TIER = exports.TIER_EXPERT;
/**
 * Tier requirements by level
 */
exports.TIER_REQUIREMENTS = {
    [exports.TIER_NEW]: {
        minAttestations: 0,
        minVouches: 0,
        minVouchTier: 0,
        minApprovalRate: 0,
        minDaysActive: 0,
    },
    [exports.TIER_CONTRIBUTOR]: {
        minAttestations: 3,
        minVouches: 0,
        minVouchTier: 0,
        minApprovalRate: 50,
        minDaysActive: 7,
    },
    [exports.TIER_TRUSTED]: {
        minAttestations: 10,
        minVouches: 2,
        minVouchTier: 2,
        minApprovalRate: 70,
        minDaysActive: 30,
    },
    [exports.TIER_VERIFIED]: {
        minAttestations: 25,
        minVouches: 5,
        minVouchTier: 2,
        minApprovalRate: 85,
        minDaysActive: 90,
    },
    [exports.TIER_EXPERT]: {
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
exports.TIER_METADATA = {
    [exports.TIER_NEW]: {
        name: 'New',
        emoji: '🆕',
        description: 'New agent with no established reputation',
    },
    [exports.TIER_CONTRIBUTOR]: {
        name: 'Contributor',
        emoji: '🔧',
        description: 'Active participant with basic reputation',
    },
    [exports.TIER_TRUSTED]: {
        name: 'Trusted',
        emoji: '⭐',
        description: 'Established reputation with peer vouches',
    },
    [exports.TIER_VERIFIED]: {
        name: 'Verified',
        emoji: '✅',
        description: 'Highly trusted agent with strong community validation',
    },
    [exports.TIER_EXPERT]: {
        name: 'Expert',
        emoji: '👑',
        description: 'Elite status with exceptional track record',
    },
};
/**
 * Decay configuration
 */
exports.DECAY_CONFIG = {
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
function getTierName(tier) {
    return exports.TIER_METADATA[tier]?.name ?? 'Unknown';
}
/**
 * Get tier emoji by level
 */
function getTierEmoji(tier) {
    return exports.TIER_METADATA[tier]?.emoji ?? '❓';
}
/**
 * Get tier description by level
 */
function getTierDescription(tier) {
    return exports.TIER_METADATA[tier]?.description ?? 'Unknown tier level';
}
