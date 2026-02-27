/**
 * AgentTrust - Main SDK class
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { NETWORKS, SCHEMAS, NetworkName } from './constants';
import {
  AgentTrustConfig,
  TrustScore,
  VerificationRequest,
  VerificationResult,
  VouchRequest,
  VouchResult,
  FlagRequest,
  FlagResult,
} from './types';
import { 
  generateTwitterChallenge, 
  verifyTwitterProof,
  verifyTwitterProofWithFallback,
  hashTwitterProof,
  TwitterChallenge,
  TwitterProof,
} from './verification/twitter';
import {
  generateGitHubChallenge,
  verifyGitHubProof,
  hashGitHubProof,
  GitHubChallenge,
  GitHubProof,
} from './verification/github';
import { calculateTrustScore, getDefaultTrustScore, ScoreInputs } from './scoring/trust-score';
import { getTrustScore, getAttestationSummary } from './query';
import { 
  getTier as queryGetTier, 
  checkMeetsTier, 
  getTierProgress as queryGetTierProgress,
  TierInfo,
  TierProgress,
} from './tier';
import { buildEnrichedProfile, EnrichedAgentProfile, ERC8004Config } from './erc8004';

export class AgentTrust {
  private eas: EAS;
  private network: NetworkName;
  private provider: any;
  private twitterApiKey?: string;
  private erc8004Config?: ERC8004Config;

  constructor(config: AgentTrustConfig) {
    this.network = config.network;
    this.provider = config.provider;
    this.twitterApiKey = config.twitterApiKey;
    this.erc8004Config = config.erc8004;

    const networkConfig = NETWORKS[this.network];
    const easAddress = config.easAddress || networkConfig.easAddress;

    this.eas = new EAS(easAddress);
    this.eas.connect(this.provider);
  }

  /**
   * Get trust score for an agent
   */
  async getScore(agentId: string): Promise<TrustScore> {
    try {
      // Validate agent ID format (should be an Ethereum address)
      if (!ethers.isAddress(agentId)) {
        throw new Error('Invalid agent ID: must be a valid Ethereum address');
      }

      // Use the query module to fetch attestations and calculate trust score
      return await getTrustScore(agentId, this.network);
    } catch (error: any) {
      console.error(`Error fetching trust score for agent ${agentId}:`, error);
      // Return default score on error
      return getDefaultTrustScore();
    }
  }

  /**
   * Get detailed attestation summary for an agent (useful for debugging)
   */
  async getAttestationSummary(agentId: string) {
    try {
      // Validate agent ID format (should be an Ethereum address)
      if (!ethers.isAddress(agentId)) {
        throw new Error('Invalid agent ID: must be a valid Ethereum address');
      }

      // Use the query module to get detailed attestation summary
      return await getAttestationSummary(agentId, this.network);
    } catch (error: any) {
      console.error(`Error fetching attestation summary for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Verify an agent's identity on a platform
   */
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    try {
      // Validate agent ID format
      if (!ethers.isAddress(request.agentId)) {
        return { success: false, error: 'Invalid agent ID: must be a valid Ethereum address' };
      }

      // Step 1: Validate proof based on platform
      const proofValidation = await this.validateProof(request);
      if (!proofValidation.valid) {
        return { success: false, error: proofValidation.error };
      }

      // Step 2: Ensure schemas are registered
      if (!SCHEMAS.verification.uid) {
        throw new Error('Verification schema not registered. Run registerSchemas() first.');
      }

      // Step 3: Create attestation on EAS
      const schemaEncoder = new SchemaEncoder(SCHEMAS.verification.schema);
      const encodedData = schemaEncoder.encodeData([
        { name: 'agentId', value: request.agentId, type: 'address' },
        { name: 'platform', value: request.platform, type: 'string' },
        { name: 'handle', value: request.handle, type: 'string' },
        { name: 'proofHash', value: this.hashProof(request.proof), type: 'bytes32' },
        { name: 'verifiedAt', value: BigInt(Math.floor(Date.now() / 1000)), type: 'uint64' },
      ]);

      const tx = await this.eas.attest({
        schema: SCHEMAS.verification.uid,
        data: {
          recipient: request.agentId,
          expirationTime: BigInt(0), // No expiration
          revocable: true,
          data: encodedData,
        },
      });

      const attestationUid = await tx.wait();

      return {
        success: true,
        attestationUid,
        txHash: tx.tx.hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Vouch for another agent
   */
  async vouch(request: VouchRequest): Promise<VouchResult> {
    try {
      if (!SCHEMAS.vouch.uid) {
        throw new Error('Vouch schema not registered. Run registerSchemas() first.');
      }

      const schemaEncoder = new SchemaEncoder(SCHEMAS.vouch.schema);
      const encodedData = schemaEncoder.encodeData([
        { name: 'vouchee', value: request.agentId, type: 'address' },
        { name: 'trustLevel', value: request.trustLevel, type: 'uint8' },
        { name: 'context', value: request.context || '', type: 'string' },
        { name: 'evidenceHash', value: request.evidenceHash || '0x' + '0'.repeat(64), type: 'bytes32' },
      ]);

      const tx = await this.eas.attest({
        schema: SCHEMAS.vouch.uid,
        data: {
          recipient: request.agentId,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });

      const attestationUid = await tx.wait();

      return {
        success: true,
        attestationUid,
        txHash: tx.tx.hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Flag a bad actor
   */
  async flag(request: FlagRequest): Promise<FlagResult> {
    try {
      if (!SCHEMAS.flag.uid) {
        throw new Error('Flag schema not registered. Run registerSchemas() first.');
      }

      const schemaEncoder = new SchemaEncoder(SCHEMAS.flag.schema);
      const encodedData = schemaEncoder.encodeData([
        { name: 'flagged', value: request.agentId, type: 'address' },
        { name: 'severity', value: request.severity, type: 'uint8' },
        { name: 'reason', value: request.reason, type: 'string' },
        { name: 'evidenceHash', value: request.evidenceHash || '0x' + '0'.repeat(64), type: 'bytes32' },
      ]);

      const tx = await this.eas.attest({
        schema: SCHEMAS.flag.uid,
        data: {
          recipient: request.agentId,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });

      const attestationUid = await tx.wait();

      return {
        success: true,
        attestationUid,
        txHash: tx.tx.hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Hash a proof string to bytes32
   */
  private hashProof(proof: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(proof));
  }

  /**
   * Validate proof based on platform
   */
  private async validateProof(request: VerificationRequest): Promise<{ valid: boolean; error?: string }> {
    const { platform, agentId, handle, proof } = request;

    try {
      switch (platform) {
        case 'twitter': {
          // For Twitter, proof should be a tweet URL
          // We'll use the existing Twitter verification logic
          const tweetId = this.extractTweetId(proof);
          if (!tweetId) {
            return { valid: false, error: 'Invalid Twitter proof: must be a valid tweet URL' };
          }

          // Check if proof contains agent ID and handle
          // In a real implementation, this would fetch the tweet content via API
          // For now, we validate the URL format and assume the tweet contains required data
          if (!proof.toLowerCase().includes('twitter.com') && !proof.toLowerCase().includes('x.com')) {
            return { valid: false, error: 'Invalid Twitter proof: must be a Twitter/X URL' };
          }

          return { valid: true };
        }

        case 'github': {
          // For GitHub, proof should be a gist URL
          if (!proof.includes('gist.github.com')) {
            return { valid: false, error: 'Invalid GitHub proof: must be a GitHub gist URL' };
          }

          // Validate gist URL format
          const gistMatch = proof.match(/gist\.github\.com\/[^\/]+\/([a-f0-9]+)/);
          if (!gistMatch) {
            return { valid: false, error: 'Invalid GitHub gist URL format' };
          }

          return { valid: true };
        }

        case 'email': {
          // For email, proof should be a signed message
          // This would require implementing email signature verification
          // For now, just check if it looks like a signature or email
          if (proof.length < 10) {
            return { valid: false, error: 'Invalid email proof: too short' };
          }

          return { valid: true };
        }

        default:
          return { valid: false, error: `Unsupported platform: ${platform}` };
      }
    } catch (error: any) {
      return { valid: false, error: `Proof validation failed: ${error.message}` };
    }
  }

  /**
   * Extract tweet ID from Twitter URL
   */
  private extractTweetId(url: string): string | null {
    const patterns = [
      /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i,
      /(?:mobile\.twitter\.com)\/\w+\/status\/(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  // ============ Verification Challenges ============

  /**
   * Generate a Twitter verification challenge
   */
  generateTwitterChallenge(agentId: string, handle: string): TwitterChallenge {
    return generateTwitterChallenge(agentId, handle);
  }

  /**
   * Complete Twitter verification with proof
   */
  async completeTwitterVerification(proof: TwitterProof): Promise<VerificationResult> {
    // Verify the proof off-chain first using API if available
    const verifyResult = this.twitterApiKey 
      ? await verifyTwitterProof(proof, this.twitterApiKey)
      : await verifyTwitterProofWithFallback(proof);
      
    if (!verifyResult.valid) {
      return { success: false, error: verifyResult.error };
    }

    // Create on-chain attestation
    return this.verify({
      agentId: proof.challenge.agentId,
      platform: 'twitter',
      handle: proof.challenge.handle,
      proof: proof.tweetUrl,
    });
  }

  /**
   * Generate a GitHub verification challenge
   */
  generateGitHubChallenge(agentId: string, username: string): GitHubChallenge {
    return generateGitHubChallenge(agentId, username);
  }

  /**
   * Complete GitHub verification with proof
   */
  async completeGitHubVerification(proof: GitHubProof): Promise<VerificationResult> {
    // Verify the proof off-chain first (calls GitHub API)
    const verifyResult = await verifyGitHubProof(proof);
    if (!verifyResult.valid) {
      return { success: false, error: verifyResult.error };
    }

    // Create on-chain attestation
    return this.verify({
      agentId: proof.challenge.agentId,
      platform: 'github',
      handle: proof.challenge.username,
      proof: proof.gistUrl,
    });
  }

  // ============ Tier Methods ============

  /**
   * Get the current tier for an agent
   * @param address Agent's wallet address
   * @returns TierInfo with tier level and progress
   */
  async getTier(address: string): Promise<TierInfo> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address: must be a valid Ethereum address');
    }
    return queryGetTier(address, this.network);
  }

  /**
   * Check if an agent meets a minimum tier requirement
   * @param address Agent's wallet address
   * @param minTier Minimum tier required (0-4)
   * @returns boolean
   */
  async meetsTier(address: string, minTier: number): Promise<boolean> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address: must be a valid Ethereum address');
    }
    return checkMeetsTier(address, minTier, this.network);
  }

  /**
   * Get progress toward next tier
   * @param address Agent's wallet address
   * @returns TierProgress showing requirements vs current stats (null if at max tier)
   */
  async getTierProgress(address: string): Promise<TierProgress | null> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address: must be a valid Ethereum address');
    }
    return queryGetTierProgress(address, this.network);
  }

  // ============ ERC-8004 Bridge Methods ============

  /**
   * Get an enriched agent profile combining ERC-8004 identity/reputation
   * with Agent Trust tier and scoring data.
   *
   * @param address - Agent wallet address
   * @returns EnrichedAgentProfile with combined assessment
   */
  async getEnrichedProfile(address: string): Promise<EnrichedAgentProfile> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address: must be a valid Ethereum address');
    }

    // Fetch Agent Trust data in parallel
    const [tierInfo, trustScore] = await Promise.all([
      this.getTier(address),
      this.getScore(address),
    ]);

    return buildEnrichedProfile(
      address,
      this.provider,
      this.network,
      tierInfo,
      trustScore,
      trustScore.attestationCount,
      this.erc8004Config,
    );
  }

  // ============ Utility Methods ============

  /**
   * Get network configuration
   */
  getNetworkConfig() {
    return NETWORKS[this.network];
  }

  /**
   * Check if schemas are registered
   */
  areSchemasRegistered(): boolean {
    return !!(SCHEMAS.verification.uid && SCHEMAS.vouch.uid && SCHEMAS.flag.uid);
  }
}
