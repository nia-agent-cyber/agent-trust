/**
 * Query attestations from EAS GraphQL API
 */
import { NetworkName } from './constants';
import { VouchAttestation, FlagAttestation, VerificationAttestation } from './scoring/trust-score';
import { PaymentReliableAttestation, TaskCompletionAttestation, SecurityAuditAttestation, TrustScore } from './types';
export interface GraphQLAttestation {
    id: string;
    attester: string;
    recipient: string;
    time: number;
    revoked: boolean;
    decodedDataJson: string;
    schemaId: string;
}
/**
 * Parse a single PaymentReliable EAS GraphQL attestation.
 */
export declare function parsePaymentReliableAttestation(att: GraphQLAttestation): PaymentReliableAttestation;
/**
 * Fetch PaymentReliable attestations where recipient/subject is the target agent.
 */
export declare function fetchPaymentReliableAttestationsForSubject(subjectAgent: string, network?: NetworkName): Promise<PaymentReliableAttestation[]>;
/**
 * Parse a single TaskCompletion EAS GraphQL attestation.
 */
export declare function parseTaskCompletionAttestation(att: GraphQLAttestation): TaskCompletionAttestation;
/**
 * Fetch TaskCompletion attestations where recipient/subject is the target agent.
 */
export declare function fetchTaskCompletionAttestationsForSubject(subjectAgent: string, network?: NetworkName): Promise<TaskCompletionAttestation[]>;
/**
 * Parse a single SecurityAudit EAS GraphQL attestation.
 */
export declare function parseSecurityAuditAttestation(att: GraphQLAttestation): SecurityAuditAttestation;
/**
 * Fetch SecurityAudit attestations where recipient/subject is the target address.
 */
export declare function fetchSecurityAuditAttestationsForSubject(subjectAddress: string, network?: NetworkName): Promise<SecurityAuditAttestation[]>;
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
 * Clear the attester score cache
 * Useful for testing or when fresh data is needed
 */
export declare function clearAttesterScoreCache(): void;
/**
 * Get cache statistics for debugging
 */
export declare function getAttesterScoreCacheStats(): {
    size: number;
    entries: Array<{
        address: string;
        score: number;
        age: number;
    }>;
};
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
