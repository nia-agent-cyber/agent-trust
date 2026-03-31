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

/** Default decay configuration values */
const DEFAULT_CONFIG: Required<TemporalDecayConfig> = {
  decayType: 'exponential',
  lambda: 0.02,
  gracePeriodDays: 30,
  stepSize: 1,
  stepPeriodDays: 90,
  scoreFloor: 0,
  velocityWindowDays: 7,
};

/**
 * Resolve partial config with defaults.
 */
function resolveConfig(config?: TemporalDecayConfig): Required<TemporalDecayConfig> {
  return { ...DEFAULT_CONFIG, ...config };
}

/**
 * Compute exponential decay multiplier.
 * f(t) = e^(-λ * t)  where t is days over grace period
 */
function exponentialDecayMultiplier(daysOverGrace: number, lambda: number): number {
  return Math.exp(-lambda * daysOverGrace);
}

/**
 * Compute linear decay multiplier.
 * f(t) = max(0, 1 - λ * t)  where t is days over grace period
 */
function linearDecayMultiplier(daysOverGrace: number, lambda: number): number {
  return Math.max(0, 1 - lambda * daysOverGrace);
}

/**
 * Compute step decay multiplier based on integer tier drops.
 * Each stepPeriodDays of inactivity drops score by (stepSize / 100) fractionally.
 */
function stepDecayMultiplier(
  daysOverGrace: number,
  stepSize: number,
  stepPeriodDays: number,
  rawScore: number,
): number {
  if (rawScore === 0) return 1;
  const steps = Math.floor(daysOverGrace / stepPeriodDays);
  const penaltyPerStep = stepSize; // points, not fraction
  const totalPenalty = steps * penaltyPerStep;
  return Math.max(0, (rawScore - totalPenalty) / rawScore);
}

/**
 * Compute trust velocity (net vouch-level gain per day) over a rolling window.
 *
 * @param vouches - Array of vouch events with timestamps
 * @param windowDays - Rolling window size in days
 * @param nowMs - Current timestamp in milliseconds (defaults to Date.now())
 * @returns Net weighted vouches per day (can be negative if revocations exceed additions)
 */
export function computeTrustVelocity(
  vouches: VouchEvent[],
  windowDays: number = DEFAULT_CONFIG.velocityWindowDays,
  nowMs: number = Date.now(),
): number {
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const cutoff = nowMs - windowMs;

  const windowVouches = vouches.filter(v => v.timestamp * 1000 >= cutoff);

  if (windowVouches.length === 0) return 0;

  // Net weighted trust accumulation in window
  let netTrust = 0;
  for (const v of windowVouches) {
    const weight = v.trustLevel; // 1–5
    netTrust += v.revoked ? -weight : weight;
  }

  // Velocity = net trust units per day
  return netTrust / windowDays;
}

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
export function evaluateTemporalTrust(
  rawScore: number,
  lastPositiveAttestationTime: number | null,
  vouches: VouchEvent[] = [],
  config?: TemporalDecayConfig,
  nowMs: number = Date.now(),
): TemporalTrustResult {
  const resolved = resolveConfig(config);

  // Clamp raw score to valid range
  const clampedRaw = Math.max(0, Math.min(100, rawScore));

  // Compute days since last attestation
  let daysSinceLastAttestation: number | null = null;
  let withinGracePeriod = true;
  let decayMultiplier = 1.0;

  if (lastPositiveAttestationTime !== null) {
    const elapsedMs = nowMs - lastPositiveAttestationTime * 1000;
    daysSinceLastAttestation = Math.max(0, elapsedMs / (24 * 60 * 60 * 1000));

    if (daysSinceLastAttestation >= resolved.gracePeriodDays) {
      withinGracePeriod = false;
      const daysOverGrace = daysSinceLastAttestation - resolved.gracePeriodDays;

      switch (resolved.decayType) {
        case 'exponential':
          decayMultiplier = exponentialDecayMultiplier(daysOverGrace, resolved.lambda);
          break;
        case 'linear':
          decayMultiplier = linearDecayMultiplier(daysOverGrace, resolved.lambda);
          break;
        case 'step':
          decayMultiplier = stepDecayMultiplier(
            daysOverGrace,
            resolved.stepSize,
            resolved.stepPeriodDays,
            clampedRaw,
          );
          break;
      }
    }
  } else {
    // No attestation history — no decay (insufficient data)
    withinGracePeriod = true;
    decayMultiplier = 1.0;
  }

  // Apply decay with floor enforcement
  const decayedScore = clampedRaw * decayMultiplier;
  const adjustedScore = Math.max(resolved.scoreFloor, Math.round(decayedScore * 10) / 10);

  // Compute trust velocity
  const trustVelocity = computeTrustVelocity(vouches, resolved.velocityWindowDays, nowMs);

  return {
    adjustedScore,
    rawScore: clampedRaw,
    decayMultiplier,
    trustVelocity,
    daysSinceLastAttestation,
    withinGracePeriod,
    config: resolved,
  };
}
