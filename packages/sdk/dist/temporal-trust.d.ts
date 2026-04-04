/**
 * Temporal Trust Decay Module
 *
 * Provides explicit, deterministic temporal decay of trust scores and
 * trust velocity computation. Unlike the tier-level step decay in
 * tier/tier-calculation.ts (which drops tier by integer steps), this
 * module applies continuous exponential decay to raw trust scores and
 * exposes the rate-of-change (velocity) signal.
 *
 * Design rationale:
 * - λ between 0.01–0.03 per day gives 30–70% weight remaining after 30 days.
 *   λ > 0.05 produces false low-trust signals for agents not recently re-assessed.
 * - Trust velocity catches Sybil farming patterns: 15 vouches in 48h looks
 *   like an attack; the same total accumulated over 45 days is healthy.
 * - Tier floor enforcement: decayed score cannot push an agent below the
 *   minimum score implied by their attestation tier.
 *
 * References: agent-trust issue #23, pilot data across 30 agents (28 days)
 */
export type DecayType = 'exponential' | 'linear' | 'step';
export interface TemporalDecayConfig {
    /**
     * Decay function type.
     * - 'exponential': continuous exponential decay — recommended for most use cases
     * - 'linear': linear decay — simpler but underweights recent activity
     * - 'step': step-down every N days — integer tier drops (matches tier-constants.ts)
     */
    decayType?: DecayType;
    /**
     * Decay rate per day (λ). Default: 0.02.
     * Only used for exponential and linear types.
     * - 0.01–0.03: recommended range (30–70% weight after 30 days)
     * - > 0.05: too aggressive — penalizes agents not re-assessed recently
     */
    lambda?: number;
    /**
     * Grace period in days before decay begins. Default: 30.
     * Agent is not decayed if last attestation is within this window.
     */
    gracePeriodDays?: number;
    /**
     * Step size for 'step' decay type — tier drops per step period. Default: 1.
     * Only used when decayType='step'.
     */
    stepSize?: number;
    /**
     * Period in days for each step drop. Default: 90.
     * Only used when decayType='step'.
     */
    stepPeriodDays?: number;
    /**
     * Minimum score floor. Decayed score will not go below this value. Default: 0.
     * Useful when an agent holds a tier that guarantees a minimum base score.
     */
    scoreFloor?: number;
    /**
     * Window in days for velocity calculation. Default: 7.
     * Trust velocity is computed over this rolling window.
     */
    velocityWindowDays?: number;
}
export interface VouchEvent {
    /** Unix timestamp (seconds) when the vouch was created */
    timestamp: number;
    /** Trust level of the vouch (1–5) */
    trustLevel: number;
    /** Whether the vouch has been revoked */
    revoked?: boolean;
}
export interface TemporalTrustResult {
    /**
     * Decay-adjusted trust score (0–100).
     * Equals rawScore if within grace period, otherwise decayed.
     */
    adjustedScore: number;
    /**
     * Original undecayed score for comparison.
     */
    rawScore: number;
    /**
     * Decay multiplier applied (0–1). 1.0 = no decay (within grace period).
     * Useful for debugging and explaining score changes to operators.
     */
    decayMultiplier: number;
    /**
     * Trust velocity (vouches/day) over the configured velocity window.
     * Positive = gaining trust, negative = losing trust (revocations), 0 = stable.
     *
     * Spike detection: velocity > 5 vouches/day over a short window is a
     * potential Sybil farming signal. Gradual accumulation over weeks is healthy.
     */
    trustVelocity: number;
    /**
     * Number of days since the most recent positive attestation.
     * null if no attestation history exists.
     */
    daysSinceLastAttestation: number | null;
    /**
     * Whether the score is within the grace period (no decay applied).
     */
    withinGracePeriod: boolean;
    /**
     * Decay configuration used for this result (resolved defaults).
     */
    config: Required<TemporalDecayConfig>;
}
/**
 * Compute trust velocity (net vouch-level gain per day) over a rolling window.
 *
 * @param vouches - Array of vouch events with timestamps
 * @param windowDays - Rolling window size in days
 * @param nowMs - Current timestamp in milliseconds (defaults to Date.now())
 * @returns Net weighted vouches per day (can be negative if revocations exceed additions)
 */
export declare function computeTrustVelocity(vouches: VouchEvent[], windowDays?: number, nowMs?: number): number;
/**
 * Evaluate temporal trust for an agent.
 *
 * Given a raw trust score and the agent's vouch history, this function:
 * 1. Computes time-decay since last positive attestation
 * 2. Applies the selected decay function (exponential/linear/step)
 * 3. Computes trust velocity over a rolling window
 * 4. Returns an adjusted score with full diagnostic metadata
 *
 * This is a pure read-time function — it does not write to the blockchain
 * or modify any stored state. Call it to present a temporally-aware score
 * to consumers without altering the underlying attestation record.
 *
 * @param rawScore - Undecayed trust score (0–100), from AgentTrust.getScore()
 * @param lastPositiveAttestationTime - Unix timestamp (seconds) of the most
 *   recent non-revoked vouch or positive attestation. Pass null if unknown.
 * @param vouches - Vouch history for velocity calculation. Can be an empty
 *   array if velocity tracking is not needed.
 * @param config - Optional decay configuration overrides.
 * @param nowMs - Current time in milliseconds (injectable for testing).
 */
export declare function evaluateTemporalTrust(rawScore: number, lastPositiveAttestationTime: number | null, vouches?: VouchEvent[], config?: TemporalDecayConfig, nowMs?: number): TemporalTrustResult;
