"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTrustVelocity = computeTrustVelocity;
exports.evaluateTemporalTrust = evaluateTemporalTrust;
/** Default decay configuration values */
const DEFAULT_CONFIG = {
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
function resolveConfig(config) {
    return { ...DEFAULT_CONFIG, ...config };
}
/**
 * Compute exponential decay multiplier.
 * f(t) = e^(-λ * t)  where t is days over grace period
 */
function exponentialDecayMultiplier(daysOverGrace, lambda) {
    return Math.exp(-lambda * daysOverGrace);
}
/**
 * Compute linear decay multiplier.
 * f(t) = max(0, 1 - λ * t)  where t is days over grace period
 */
function linearDecayMultiplier(daysOverGrace, lambda) {
    return Math.max(0, 1 - lambda * daysOverGrace);
}
/**
 * Compute step decay multiplier based on integer tier drops.
 * Each stepPeriodDays of inactivity drops score by (stepSize / 100) fractionally.
 */
function stepDecayMultiplier(daysOverGrace, stepSize, stepPeriodDays, rawScore) {
    if (rawScore === 0)
        return 1;
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
function computeTrustVelocity(vouches, windowDays = DEFAULT_CONFIG.velocityWindowDays, nowMs = Date.now()) {
    const windowMs = windowDays * 24 * 60 * 60 * 1000;
    const cutoff = nowMs - windowMs;
    const windowVouches = vouches.filter(v => v.timestamp * 1000 >= cutoff);
    if (windowVouches.length === 0)
        return 0;
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
function evaluateTemporalTrust(rawScore, lastPositiveAttestationTime, vouches = [], config, nowMs = Date.now()) {
    const resolved = resolveConfig(config);
    // Clamp raw score to valid range
    const clampedRaw = Math.max(0, Math.min(100, rawScore));
    // Compute days since last attestation
    let daysSinceLastAttestation = null;
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
                    decayMultiplier = stepDecayMultiplier(daysOverGrace, resolved.stepSize, resolved.stepPeriodDays, clampedRaw);
                    break;
            }
        }
    }
    else {
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
