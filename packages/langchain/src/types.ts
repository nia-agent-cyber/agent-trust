/**
 * Type definitions for Agent Trust LangChain integration package.
 *
 * Tier order (ascending): unverified < bronze < silver < gold < platinum
 *
 * These map to the Agent Trust SDK numeric tiers:
 *   0 (New)         → 'unverified'
 *   1 (Contributor) → 'bronze'
 *   2 (Trusted)     → 'silver'
 *   3 (Verified)    → 'gold'
 *   4 (Expert)      → 'platinum'
 */

/**
 * Ordered list of trust tiers from lowest to highest.
 */
export const TIER_ORDER = [
  'unverified',
  'bronze',
  'silver',
  'gold',
  'platinum',
] as const;

/** String union of valid tier names */
export type TierName = (typeof TIER_ORDER)[number];

/**
 * Minimal interface for the AgentTrust instance passed to the integration classes.
 * This avoids a hard dependency on the SDK types — the real AgentTrust class satisfies this.
 */
export interface AgentTrustLike {
  getScore(agentId: string): Promise<{ score: number }>;
  getTier(address: string): Promise<{ tier: number; name: string }>;
}

/**
 * The result returned by a trust check operation.
 */
export interface TrustCheckResult {
  /** The agent wallet address that was checked */
  address: string;
  /** Current tier name (unverified | bronze | silver | gold | platinum) */
  tier: TierName;
  /** Numeric trust score (0–100) */
  score: number;
  /** Whether the tier meets or exceeds the minimum required tier */
  passed: boolean;
  /** Human-readable explanation of the result */
  reason: string;
}

/**
 * Options for TrustGuard.check()
 */
export interface TrustGuardOptions {
  /** Minimum tier required (default: 'bronze') */
  minTier?: TierName;
  /** RPC URL for the provider */
  rpcUrl?: string;
  /** Network to use (default: 'base') */
  network?: string;
}

/**
 * Options for RunnableTrustGate constructor
 */
export interface TrustGateOptions {
  /** Agent wallet address to check */
  agentAddress: string;
  /** Minimum tier required (default: 'bronze') */
  minTier?: TierName;
  /** An already-configured AgentTrust instance to use for checks */
  agentTrust: AgentTrustLike;
}

/**
 * Error thrown when a trust check fails (tier is below the minimum required).
 */
export class TrustCheckFailedError extends Error {
  /** The agent address that failed the check */
  public readonly address: string;
  /** The actual tier of the agent */
  public readonly tier: TierName;
  /** The minimum tier that was required */
  public readonly requiredTier: TierName;

  constructor(address: string, tier: TierName, requiredTier: TierName) {
    super(
      `Trust check failed for ${address}: tier '${tier}' does not meet minimum '${requiredTier}'`,
    );
    this.name = 'TrustCheckFailedError';
    this.address = address;
    this.tier = tier;
    this.requiredTier = requiredTier;

    // Maintain proper prototype chain in TypeScript
    Object.setPrototypeOf(this, TrustCheckFailedError.prototype);
  }
}
