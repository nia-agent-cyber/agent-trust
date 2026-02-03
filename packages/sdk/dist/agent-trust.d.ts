/**
 * AgentTrust - Main SDK class
 */
import { AgentTrustConfig, TrustScore, VerificationRequest, VerificationResult, VouchRequest, VouchResult, FlagRequest, FlagResult } from './types';
import { TwitterChallenge, TwitterProof } from './verification/twitter';
import { GitHubChallenge, GitHubProof } from './verification/github';
export declare class AgentTrust {
    private eas;
    private network;
    private provider;
    constructor(config: AgentTrustConfig);
    /**
     * Get trust score for an agent
     */
    getScore(agentId: string): Promise<TrustScore>;
    /**
     * Get detailed attestation summary for an agent (useful for debugging)
     */
    getAttestationSummary(agentId: string): Promise<{
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
    /**
     * Verify an agent's identity on a platform
     */
    verify(request: VerificationRequest): Promise<VerificationResult>;
    /**
     * Vouch for another agent
     */
    vouch(request: VouchRequest): Promise<VouchResult>;
    /**
     * Flag a bad actor
     */
    flag(request: FlagRequest): Promise<FlagResult>;
    /**
     * Hash a proof string to bytes32
     */
    private hashProof;
    /**
     * Generate a Twitter verification challenge
     */
    generateTwitterChallenge(agentId: string, handle: string): TwitterChallenge;
    /**
     * Complete Twitter verification with proof
     */
    completeTwitterVerification(proof: TwitterProof): Promise<VerificationResult>;
    /**
     * Generate a GitHub verification challenge
     */
    generateGitHubChallenge(agentId: string, username: string): GitHubChallenge;
    /**
     * Complete GitHub verification with proof
     */
    completeGitHubVerification(proof: GitHubProof): Promise<VerificationResult>;
    /**
     * Get network configuration
     */
    getNetworkConfig(): {
        readonly chainId: 8453;
        readonly name: "Base";
        readonly easAddress: "0x4200000000000000000000000000000000000021";
        readonly schemaRegistryAddress: "0x4200000000000000000000000000000000000020";
        readonly rpcUrl: "https://mainnet.base.org";
    } | {
        readonly chainId: 84532;
        readonly name: "Base Sepolia";
        readonly easAddress: "0x4200000000000000000000000000000000000021";
        readonly schemaRegistryAddress: "0x4200000000000000000000000000000000000020";
        readonly rpcUrl: "https://sepolia.base.org";
    };
    /**
     * Check if schemas are registered
     */
    areSchemasRegistered(): boolean;
}
