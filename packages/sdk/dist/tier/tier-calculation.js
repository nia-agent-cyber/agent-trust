"use strict";
/**
 * Trust Tier Calculation
 *
 * Core logic for calculating trust tiers from attestation data.
 * Tiers are computed on-read from existing attestations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTier = calculateTier;
exports.meetsTierRequirements = meetsTierRequirements;
exports.applyDecay = applyDecay;
exports.countQualifiedVouches = countQualifiedVouches;
exports.calculateApprovalRate = calculateApprovalRate;
exports.calculateDaysActive = calculateDaysActive;
exports.getTierProgressToward = getTierProgressToward;
exports.getTierInfo = getTierInfo;
exports.meetsTier = meetsTier;
exports.getDefaultAgentStats = getDefaultAgentStats;
const tier_constants_1 = require("./tier-constants");
/**
 * Calculate the tier for an agent based on their stats
 * @param stats Agent's attestation statistics
 * @returns Tier number (0-4)
 */
function calculateTier(stats) {
    // Calculate base tier from requirements
    let baseTier = tier_constants_1.MIN_TIER;
    // Start from highest tier, work down until requirements met
    for (let tier = tier_constants_1.MAX_TIER; tier >= tier_constants_1.MIN_TIER; tier--) {
        if (meetsTierRequirements(stats, tier_constants_1.TIER_REQUIREMENTS[tier])) {
            baseTier = tier;
            break;
        }
    }
    // Apply decay if applicable
    const decayedTier = applyDecay(baseTier, stats.lastPositiveAttestationTime);
    return decayedTier;
}
/**
 * Check if agent stats meet tier requirements
 * @param stats Agent's attestation statistics
 * @param req Tier requirements to check
 * @returns Whether all requirements are met
 */
function meetsTierRequirements(stats, req) {
    return (stats.totalAttestations >= req.minAttestations &&
        stats.qualifiedVouches >= req.minVouches &&
        stats.approvalRate >= req.minApprovalRate &&
        stats.daysActive >= req.minDaysActive);
}
/**
 * Apply tier decay based on inactivity
 * @param baseTier The tier before decay
 * @param lastPositiveAttestationTime Timestamp of last positive attestation
 * @returns Decayed tier level
 */
function applyDecay(baseTier, lastPositiveAttestationTime) {
    if (baseTier === tier_constants_1.MIN_TIER || !lastPositiveAttestationTime) {
        return baseTier;
    }
    const now = Date.now();
    const daysSinceLastAttestation = Math.floor((now - lastPositiveAttestationTime * 1000) / (24 * 60 * 60 * 1000));
    if (daysSinceLastAttestation < tier_constants_1.DECAY_CONFIG.gracePeriodDays) {
        return baseTier;
    }
    const daysOverGrace = daysSinceLastAttestation - tier_constants_1.DECAY_CONFIG.gracePeriodDays;
    const decayLevels = Math.floor(daysOverGrace / tier_constants_1.DECAY_CONFIG.decayPeriodDays);
    return Math.max(tier_constants_1.MIN_TIER, baseTier - decayLevels);
}
/**
 * Count qualified vouches for a target tier
 * @param vouches Array of vouch information
 * @param targetTier The tier being calculated
 * @returns Number of vouches that qualify
 */
function countQualifiedVouches(vouches, targetTier) {
    const req = tier_constants_1.TIER_REQUIREMENTS[targetTier];
    if (!req)
        return 0;
    const minVoucherTier = req.minVouchTier;
    return vouches.filter(v => v.trustLevel >= tier_constants_1.DECAY_CONFIG.minVouchTrustLevel &&
        !v.revoked &&
        v.voucherTier >= minVoucherTier).length;
}
/**
 * Calculate approval rate from attestations and flags
 * @param totalAttestations Total attestations received
 * @param flags Number of flags received
 * @returns Approval rate as percentage (0-100)
 */
function calculateApprovalRate(totalAttestations, flags) {
    if (totalAttestations === 0)
        return 0;
    const positive = totalAttestations - flags;
    return Math.max(0, (positive / totalAttestations) * 100);
}
/**
 * Calculate days active since first attestation
 * @param firstAttestationTime Timestamp of first attestation (seconds)
 * @returns Number of days active
 */
function calculateDaysActive(firstAttestationTime) {
    if (!firstAttestationTime)
        return 0;
    const now = Date.now();
    const firstTime = firstAttestationTime * 1000; // Convert to milliseconds
    return Math.floor((now - firstTime) / (24 * 60 * 60 * 1000));
}
/**
 * Calculate progress toward requirements
 * @param current Current value
 * @param required Required value
 * @returns Progress object
 */
function calculateProgress(current, required) {
    return {
        current,
        required,
        met: current >= required,
    };
}
/**
 * Get progress toward a specific tier
 * @param stats Agent's attestation statistics
 * @param targetTier The tier to check progress for
 * @returns Progress toward the tier
 */
function getTierProgressToward(stats, targetTier) {
    const req = tier_constants_1.TIER_REQUIREMENTS[targetTier] || tier_constants_1.TIER_REQUIREMENTS[tier_constants_1.MAX_TIER];
    return {
        attestations: calculateProgress(stats.totalAttestations, req.minAttestations),
        vouches: calculateProgress(stats.qualifiedVouches, req.minVouches),
        approvalRate: calculateProgress(stats.approvalRate, req.minApprovalRate),
        daysActive: calculateProgress(stats.daysActive, req.minDaysActive),
    };
}
/**
 * Get complete tier information for an agent
 * @param stats Agent's attestation statistics
 * @returns Complete tier info with progress
 */
function getTierInfo(stats) {
    const tier = calculateTier(stats);
    const nextTier = tier < tier_constants_1.MAX_TIER ? tier + 1 : null;
    return {
        tier,
        name: (0, tier_constants_1.getTierName)(tier),
        emoji: (0, tier_constants_1.getTierEmoji)(tier),
        requirements: tier_constants_1.TIER_REQUIREMENTS[tier],
        progress: nextTier !== null ? getTierProgressToward(stats, nextTier) : null,
        nextTier,
    };
}
/**
 * Check if an agent meets a minimum tier
 * @param stats Agent's attestation statistics
 * @param minTier Minimum tier required
 * @returns Whether the agent meets the minimum tier
 */
function meetsTier(stats, minTier) {
    const tier = calculateTier(stats);
    return tier >= minTier;
}
/**
 * Create empty/default agent stats
 * @returns Default agent stats for a new agent
 */
function getDefaultAgentStats() {
    return {
        totalAttestations: 0,
        qualifiedVouches: 0,
        approvalRate: 0,
        daysActive: 0,
        flags: 0,
        firstAttestationTime: null,
        lastPositiveAttestationTime: null,
    };
}
