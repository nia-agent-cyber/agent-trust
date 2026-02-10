/**
 * Trust Tier Calculation
 * 
 * Core logic for calculating trust tiers from attestation data.
 * Tiers are computed on-read from existing attestations.
 */

import {
  TierRequirements,
  TierProgress,
  TierInfo,
  AgentStats,
  VouchInfo,
  RequirementProgress,
} from './tier-types';
import {
  TIER_REQUIREMENTS,
  TIER_METADATA,
  MAX_TIER,
  MIN_TIER,
  DECAY_CONFIG,
  getTierName,
  getTierEmoji,
} from './tier-constants';

/**
 * Calculate the tier for an agent based on their stats
 * @param stats Agent's attestation statistics
 * @returns Tier number (0-4)
 */
export function calculateTier(stats: AgentStats): number {
  // Calculate base tier from requirements
  let baseTier = MIN_TIER;
  
  // Start from highest tier, work down until requirements met
  for (let tier = MAX_TIER; tier >= MIN_TIER; tier--) {
    if (meetsTierRequirements(stats, TIER_REQUIREMENTS[tier])) {
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
export function meetsTierRequirements(stats: AgentStats, req: TierRequirements): boolean {
  return (
    stats.totalAttestations >= req.minAttestations &&
    stats.qualifiedVouches >= req.minVouches &&
    stats.approvalRate >= req.minApprovalRate &&
    stats.daysActive >= req.minDaysActive
  );
}

/**
 * Apply tier decay based on inactivity
 * @param baseTier The tier before decay
 * @param lastPositiveAttestationTime Timestamp of last positive attestation
 * @returns Decayed tier level
 */
export function applyDecay(baseTier: number, lastPositiveAttestationTime: number | null): number {
  if (baseTier === MIN_TIER || !lastPositiveAttestationTime) {
    return baseTier;
  }

  const now = Date.now();
  const daysSinceLastAttestation = Math.floor(
    (now - lastPositiveAttestationTime * 1000) / (24 * 60 * 60 * 1000)
  );

  if (daysSinceLastAttestation < DECAY_CONFIG.gracePeriodDays) {
    return baseTier;
  }

  const daysOverGrace = daysSinceLastAttestation - DECAY_CONFIG.gracePeriodDays;
  const decayLevels = Math.floor(daysOverGrace / DECAY_CONFIG.decayPeriodDays);
  
  return Math.max(MIN_TIER, baseTier - decayLevels);
}

/**
 * Count qualified vouches for a target tier
 * @param vouches Array of vouch information
 * @param targetTier The tier being calculated
 * @returns Number of vouches that qualify
 */
export function countQualifiedVouches(vouches: VouchInfo[], targetTier: number): number {
  const req = TIER_REQUIREMENTS[targetTier];
  if (!req) return 0;

  const minVoucherTier = req.minVouchTier;
  
  return vouches.filter(v => 
    v.trustLevel >= DECAY_CONFIG.minVouchTrustLevel &&
    !v.revoked &&
    v.voucherTier >= minVoucherTier
  ).length;
}

/**
 * Calculate approval rate from attestations and flags
 * @param totalAttestations Total attestations received
 * @param flags Number of flags received
 * @returns Approval rate as percentage (0-100)
 */
export function calculateApprovalRate(totalAttestations: number, flags: number): number {
  if (totalAttestations === 0) return 0;
  const positive = totalAttestations - flags;
  return Math.max(0, (positive / totalAttestations) * 100);
}

/**
 * Calculate days active since first attestation
 * @param firstAttestationTime Timestamp of first attestation (seconds)
 * @returns Number of days active
 */
export function calculateDaysActive(firstAttestationTime: number | null): number {
  if (!firstAttestationTime) return 0;
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
function calculateProgress(current: number, required: number): RequirementProgress {
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
export function getTierProgressToward(stats: AgentStats, targetTier: number): TierProgress {
  const req = TIER_REQUIREMENTS[targetTier] || TIER_REQUIREMENTS[MAX_TIER];
  
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
export function getTierInfo(stats: AgentStats): TierInfo {
  const tier = calculateTier(stats);
  const nextTier = tier < MAX_TIER ? tier + 1 : null;
  
  return {
    tier,
    name: getTierName(tier),
    emoji: getTierEmoji(tier),
    requirements: TIER_REQUIREMENTS[tier],
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
export function meetsTier(stats: AgentStats, minTier: number): boolean {
  const tier = calculateTier(stats);
  return tier >= minTier;
}

/**
 * Create empty/default agent stats
 * @returns Default agent stats for a new agent
 */
export function getDefaultAgentStats(): AgentStats {
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
