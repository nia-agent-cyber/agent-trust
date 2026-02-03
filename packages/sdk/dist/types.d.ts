/**
 * Type definitions for Agent Trust SDK
 */
export interface TrustScore {
    /** Overall trust score (0-100) */
    score: number;
    /** Confidence level (0-1) */
    confidence: number;
    /** Number of attestations contributing to score */
    attestationCount: number;
    /** Whether the agent is verified */
    verified: boolean;
    /** Linked platforms (twitter, github, etc.) */
    linkedPlatforms: string[];
    /** Last updated timestamp */
    updatedAt: number;
}
export interface VerificationResult {
    /** Whether verification succeeded */
    success: boolean;
    /** Attestation UID (if successful) */
    attestationUid?: string;
    /** Transaction hash */
    txHash?: string;
    /** Error message (if failed) */
    error?: string;
}
export interface VouchResult {
    /** Whether vouch succeeded */
    success: boolean;
    /** Attestation UID (if successful) */
    attestationUid?: string;
    /** Transaction hash */
    txHash?: string;
    /** Error message (if failed) */
    error?: string;
}
export interface FlagResult {
    /** Whether flag succeeded */
    success: boolean;
    /** Attestation UID (if successful) */
    attestationUid?: string;
    /** Transaction hash */
    txHash?: string;
    /** Error message (if failed) */
    error?: string;
}
export interface VerificationRequest {
    /** Agent's address or identifier */
    agentId: string;
    /** Platform to verify (twitter, github, etc.) */
    platform: 'twitter' | 'github' | 'email';
    /** Handle on the platform */
    handle: string;
    /** Proof of ownership (signed message, tweet URL, etc.) */
    proof: string;
}
export interface VouchRequest {
    /** Agent to vouch for */
    agentId: string;
    /** Trust level (1-5) */
    trustLevel: 1 | 2 | 3 | 4 | 5;
    /** Context/reason for vouch */
    context?: string;
    /** Evidence hash (IPFS, etc.) */
    evidenceHash?: string;
}
export interface FlagRequest {
    /** Agent to flag */
    agentId: string;
    /** Severity (1-5) */
    severity: 1 | 2 | 3 | 4 | 5;
    /** Reason for flag */
    reason: string;
    /** Evidence hash (IPFS, etc.) */
    evidenceHash?: string;
}
export interface AgentTrustConfig {
    /** Network to use */
    network: 'base' | 'baseSepolia';
    /** Ethers provider or signer */
    provider: any;
    /** Optional: custom EAS address */
    easAddress?: string;
}
