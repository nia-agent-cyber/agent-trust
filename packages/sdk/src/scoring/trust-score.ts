/**
 * Trust Score Calculation
 * 
 * Algorithm:
 * TrustScore = BaseScore + VouchBonus - FlagPenalty
 * 
 * Where:
 * - BaseScore = 50 if verified, 0 if not
 * - VouchBonus = weighted sum of vouches
 * - FlagPenalty = weighted sum of flags
 * - Weights based on voucher/flagger's own trust score (recursive but bounded)
 */

import { TrustScore } from '../types';

export interface Attestation {
  uid: string;
  attester: string;
  recipient: string;
  time: number;
  revoked: boolean;
}

export interface VerificationAttestation extends Attestation {
  platform: string;
  handle: string;
}

export interface VouchAttestation extends Attestation {
  trustLevel: number; // 1-5
  context: string;
}

export interface FlagAttestation extends Attestation {
  severity: number; // 1-5
  reason: string;
}

export interface ScoreInputs {
  verifications: VerificationAttestation[];
  vouches: VouchAttestation[];
  flags: FlagAttestation[];
  /** Trust scores of attesters (for weighting) */
  attesterScores: Map<string, number>;
}

/**
 * Calculate trust score from attestations
 */
export function calculateTrustScore(inputs: ScoreInputs): TrustScore {
  const { verifications, vouches, flags, attesterScores } = inputs;

  // Filter out revoked attestations
  const activeVerifications = verifications.filter(v => !v.revoked);
  const activeVouches = vouches.filter(v => !v.revoked);
  const activeFlags = flags.filter(f => !f.revoked);

  // Base score: 50 if verified, 0 if not
  const isVerified = activeVerifications.length > 0;
  const baseScore = isVerified ? 50 : 0;

  // Calculate vouch bonus (max +40)
  const vouchBonus = calculateVouchBonus(activeVouches, attesterScores);

  // Calculate flag penalty (max -50)
  const flagPenalty = calculateFlagPenalty(activeFlags, attesterScores);

  // Final score (clamped 0-100)
  const rawScore = baseScore + vouchBonus - flagPenalty;
  const score = Math.max(0, Math.min(100, rawScore));

  // Calculate confidence based on attestation count and recency
  const confidence = calculateConfidence(
    activeVerifications.length,
    activeVouches.length,
    activeFlags.length,
    [...activeVerifications, ...activeVouches, ...activeFlags]
  );

  // Get linked platforms
  const linkedPlatforms = [...new Set(activeVerifications.map(v => v.platform))];

  return {
    score: Math.round(score * 10) / 10, // 1 decimal place
    confidence: Math.round(confidence * 100) / 100, // 2 decimal places
    attestationCount: activeVerifications.length + activeVouches.length + activeFlags.length,
    verified: isVerified,
    linkedPlatforms,
    updatedAt: Date.now(),
  };
}

/**
 * Calculate bonus from vouches (max +40)
 */
function calculateVouchBonus(
  vouches: VouchAttestation[],
  attesterScores: Map<string, number>
): number {
  if (vouches.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const vouch of vouches) {
    // Weight based on voucher's trust score (default 50 if unknown)
    const voucherScore = attesterScores.get(vouch.attester) ?? 50;
    const weight = Math.sqrt(voucherScore) / 10; // sqrt to dampen extremes

    // Vouch value: trustLevel (1-5) normalized to 0-8
    const vouchValue = (vouch.trustLevel / 5) * 8;

    totalWeightedScore += vouchValue * weight;
    totalWeight += weight;
  }

  // Normalize and cap at 40
  const avgWeightedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  
  // Logarithmic scaling for multiple vouches (diminishing returns)
  const multiplier = Math.log2(vouches.length + 1);
  
  return Math.min(40, avgWeightedScore * multiplier);
}

/**
 * Calculate penalty from flags (max -50)
 */
function calculateFlagPenalty(
  flags: FlagAttestation[],
  attesterScores: Map<string, number>
): number {
  if (flags.length === 0) return 0;

  let totalWeightedPenalty = 0;
  let totalWeight = 0;

  for (const flag of flags) {
    // Weight based on flagger's trust score (default 50 if unknown)
    const flaggerScore = attesterScores.get(flag.attester) ?? 50;
    const weight = Math.sqrt(flaggerScore) / 10;

    // Flag value: severity (1-5) normalized to 0-10
    const flagValue = (flag.severity / 5) * 10;

    totalWeightedPenalty += flagValue * weight;
    totalWeight += weight;
  }

  // Normalize and cap at 50
  const avgWeightedPenalty = totalWeight > 0 ? totalWeightedPenalty / totalWeight : 0;
  
  // Linear scaling for flags (no diminishing returns - multiple flags are bad)
  const multiplier = Math.min(flags.length, 5);
  
  return Math.min(50, avgWeightedPenalty * multiplier);
}

/**
 * Calculate confidence level (0-1)
 * Based on: number of attestations, recency, diversity of attesters
 */
function calculateConfidence(
  verificationCount: number,
  vouchCount: number,
  flagCount: number,
  allAttestations: Attestation[]
): number {
  // Factor 1: Has verification (big confidence boost)
  const verificationFactor = verificationCount > 0 ? 0.4 : 0;

  // Factor 2: Number of vouches (log scale, max 0.3)
  const vouchFactor = Math.min(0.3, Math.log2(vouchCount + 1) * 0.1);

  // Factor 3: Recency of attestations (max 0.2)
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const recentAttestations = allAttestations.filter(a => (now - a.time * 1000) < 30 * dayMs);
  const recencyFactor = Math.min(0.2, (recentAttestations.length / Math.max(allAttestations.length, 1)) * 0.2);

  // Factor 4: Diversity of attesters (max 0.1)
  const uniqueAttesters = new Set(allAttestations.map(a => a.attester)).size;
  const diversityFactor = Math.min(0.1, (uniqueAttesters / 10) * 0.1);

  return Math.min(1, verificationFactor + vouchFactor + recencyFactor + diversityFactor);
}

/**
 * Get default/empty trust score for unknown agents
 */
export function getDefaultTrustScore(): TrustScore {
  return {
    score: 0,
    confidence: 0,
    attestationCount: 0,
    verified: false,
    linkedPlatforms: [],
    updatedAt: Date.now(),
  };
}
