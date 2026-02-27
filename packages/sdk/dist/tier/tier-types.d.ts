/**
 * Trust Tier Type Definitions
 *
 * Tiers provide human-readable trust levels that map to underlying attestation data.
 * Tiers are computed on-read, not stored as attestations.
 */
/**
 * Tier requirement configuration
 */
export interface TierRequirements {
    /** Minimum total attestations received */
    minAttestations: number;
    /** Minimum qualified vouches */
    minVouches: number;
    /** Minimum tier of vouchers for vouches to count */
    minVouchTier: number;
    /** Minimum approval rate (0-100) */
    minApprovalRate: number;
    /** Minimum days since first attestation */
    minDaysActive: number;
}
/**
 * Tier metadata
 */
export interface TierMetadata {
    /** Tier name */
    name: string;
    /** Tier emoji */
    emoji: string;
    /** Tier description */
    description: string;
}
/**
 * Progress toward a requirement
 */
export interface RequirementProgress {
    /** Current value */
    current: number;
    /** Required value */
    required: number;
    /** Whether requirement is met */
    met: boolean;
}
/**
 * Progress toward next tier
 */
export interface TierProgress {
    /** Attestation count progress */
    attestations: RequirementProgress;
    /** Vouch count progress */
    vouches: RequirementProgress;
    /** Approval rate progress */
    approvalRate: RequirementProgress;
    /** Days active progress */
    daysActive: RequirementProgress;
}
/**
 * Complete tier information for an agent
 */
export interface TierInfo {
    /** Tier level (0-4) */
    tier: number;
    /** Tier name */
    name: string;
    /** Tier emoji */
    emoji: string;
    /** Tier requirements */
    requirements: TierRequirements;
    /** Progress toward next tier (null if at max tier) */
    progress: TierProgress | null;
    /** Next tier level (null if at max tier) */
    nextTier: number | null;
}
/**
 * Agent statistics used for tier calculation
 */
export interface AgentStats {
    /** Total attestations received (vouches + verifications) */
    totalAttestations: number;
    /** Number of qualified vouches */
    qualifiedVouches: number;
    /** Approval rate (0-100) */
    approvalRate: number;
    /** Days since first attestation */
    daysActive: number;
    /** Number of flags received */
    flags: number;
    /** Timestamp of first attestation */
    firstAttestationTime: number | null;
    /** Timestamp of last positive attestation */
    lastPositiveAttestationTime: number | null;
}
/**
 * Vouch information for tier qualification
 */
export interface VouchInfo {
    /** Trust level (1-5) */
    trustLevel: number;
    /** Whether the vouch is revoked */
    revoked: boolean;
    /** Tier of the voucher */
    voucherTier: number;
    /** Timestamp of the vouch */
    time: number;
}
