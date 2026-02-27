/**
 * Trust Tier Calculation
 *
 * Core logic for calculating trust tiers from attestation data.
 * Tiers are computed on-read from existing attestations.
 */
import { TierRequirements, TierProgress, TierInfo, AgentStats, VouchInfo } from './tier-types';
/**
 * Calculate the tier for an agent based on their stats
 * @param stats Agent's attestation statistics
 * @returns Tier number (0-4)
 */
export declare function calculateTier(stats: AgentStats): number;
/**
 * Check if agent stats meet tier requirements
 * @param stats Agent's attestation statistics
 * @param req Tier requirements to check
 * @returns Whether all requirements are met
 */
export declare function meetsTierRequirements(stats: AgentStats, req: TierRequirements): boolean;
/**
 * Apply tier decay based on inactivity
 * @param baseTier The tier before decay
 * @param lastPositiveAttestationTime Timestamp of last positive attestation
 * @returns Decayed tier level
 */
export declare function applyDecay(baseTier: number, lastPositiveAttestationTime: number | null): number;
/**
 * Count qualified vouches for a target tier
 * @param vouches Array of vouch information
 * @param targetTier The tier being calculated
 * @returns Number of vouches that qualify
 */
export declare function countQualifiedVouches(vouches: VouchInfo[], targetTier: number): number;
/**
 * Calculate approval rate from attestations and flags
 * @param totalAttestations Total attestations received
 * @param flags Number of flags received
 * @returns Approval rate as percentage (0-100)
 */
export declare function calculateApprovalRate(totalAttestations: number, flags: number): number;
/**
 * Calculate days active since first attestation
 * @param firstAttestationTime Timestamp of first attestation (seconds)
 * @returns Number of days active
 */
export declare function calculateDaysActive(firstAttestationTime: number | null): number;
/**
 * Get progress toward a specific tier
 * @param stats Agent's attestation statistics
 * @param targetTier The tier to check progress for
 * @returns Progress toward the tier
 */
export declare function getTierProgressToward(stats: AgentStats, targetTier: number): TierProgress;
/**
 * Get complete tier information for an agent
 * @param stats Agent's attestation statistics
 * @returns Complete tier info with progress
 */
export declare function getTierInfo(stats: AgentStats): TierInfo;
/**
 * Check if an agent meets a minimum tier
 * @param stats Agent's attestation statistics
 * @param minTier Minimum tier required
 * @returns Whether the agent meets the minimum tier
 */
export declare function meetsTier(stats: AgentStats, minTier: number): boolean;
/**
 * Create empty/default agent stats
 * @returns Default agent stats for a new agent
 */
export declare function getDefaultAgentStats(): AgentStats;
