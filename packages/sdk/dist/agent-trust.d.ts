/**
 * AgentTrust - Main SDK class
 */
import { AgentTrustConfig, TrustScore, VerificationRequest, VerificationResult, VouchRequest, VouchResult, FlagRequest, FlagResult } from './types';
import { TwitterChallenge, TwitterProof } from './verification/twitter';
import { GitHubChallenge, GitHubProof } from './verification/github';
import { TierInfo, TierProgress } from './tier';
export declare class AgentTrust {
    private eas;
    private network;
    private provider;
    private twitterApiKey?;
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
     * Validate proof based on platform
     */
    private validateProof;
    /**
     * Extract tweet ID from Twitter URL
     */
    private extractTweetId;
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
     * Get the current tier for an agent
     * @param address Agent's wallet address
     * @returns TierInfo with tier level and progress
     */
    getTier(address: string): Promise<TierInfo>;
    /**
     * Check if an agent meets a minimum tier requirement
     * @param address Agent's wallet address
     * @param minTier Minimum tier required (0-4)
     * @returns boolean
     */
    meetsTier(address: string, minTier: number): Promise<boolean>;
    /**
     * Get progress toward next tier
     * @param address Agent's wallet address
     * @returns TierProgress showing requirements vs current stats (null if at max tier)
     */
    getTierProgress(address: string): Promise<TierProgress | null>;
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
