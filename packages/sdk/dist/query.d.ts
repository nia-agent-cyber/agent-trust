/**
 * Query attestations from EAS GraphQL API
 */
import { NetworkName } from './constants';
import { VouchAttestation, FlagAttestation, VerificationAttestation } from './scoring/trust-score';
import { TrustScore } from './types';
/**
 * Fetch all attestations for an agent
 */
export declare function fetchAttestationsForAgent(agentAddress: string, network?: NetworkName): Promise<{
    verifications: VerificationAttestation[];
    vouches: VouchAttestation[];
    flags: FlagAttestation[];
}>;
/**
 * Get trust score for an agent
 */
export declare function getTrustScore(agentAddress: string, network?: NetworkName): Promise<TrustScore>;
/**
 * Get attestation summary for an agent (useful for debugging)
 */
export declare function getAttestationSummary(agentAddress: string, network?: NetworkName): Promise<{
    address: string;
    verifications: {
        platform: string;
        handle: string;
        attester: string;
    }[];
    vouches: {
        trustLevel: number;
        context: string;
        attester: string;
    }[];
    flags: {
        severity: number;
        reason: string;
        attester: string;
    }[];
    trustScore: TrustScore;
}>;
