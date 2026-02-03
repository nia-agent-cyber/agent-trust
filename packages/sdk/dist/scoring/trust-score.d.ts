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
    trustLevel: number;
    context: string;
}
export interface FlagAttestation extends Attestation {
    severity: number;
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
export declare function calculateTrustScore(inputs: ScoreInputs): TrustScore;
/**
 * Get default/empty trust score for unknown agents
 */
export declare function getDefaultTrustScore(): TrustScore;
