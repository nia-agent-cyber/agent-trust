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
  PaymentReliableRequest,
  PaymentReliableResult,
  PaymentReliableAttestation,
  TaskCompletionRequest,
  TaskCompletionResult,
  TaskCompletionAttestation,
  SecurityAuditRequest,
  SecurityAuditResult,
  SecurityAuditAttestation,
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
import {
  getTrustScore,
  getAttestationSummary,
  fetchPaymentReliableAttestationsForSubject,
  fetchTaskCompletionAttestationsForSubject,
  fetchSecurityAuditAttestationsForSubject,
} from './query';
import { 
  getTier as queryGetTier, 
  checkMeetsTier, 
  getTierProgress as queryGetTierProgress,
  TierInfo,
  TierProgress,
} from './tier';
import { buildEnrichedProfile, EnrichedAgentProfile, ERC8004Config } from './erc8004';
import { encodePaymentReliableAttestation } from './payment-reliable';
import { encodeTaskCompletionAttestation } from './task-completion';
import { encodeSecurityAuditAttestation } from './security-audit';
import {
  evaluateTemporalTrust,
  computeTrustVelocity,
  TemporalDecayConfig,
  TemporalTrustResult,
  VouchEvent,
} from './temporal-trust';

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
        txHash: (tx as any).tx?.hash || (tx as any).hash,
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
        txHash: (tx as any).tx?.hash || (tx as any).hash,
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
        txHash: (tx as any).tx?.hash || (tx as any).hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Issue a PaymentReliable attestation for a subject agent.
   *
   * Validation + normalization are handled by encodePaymentReliableAttestation:
   * - required fields
   * - amount normalization to uint256-compatible integer
   * - timestamp normalization to unix seconds
   */
  async issuePaymentReliable(request: PaymentReliableRequest): Promise<PaymentReliableResult> {
    try {
      const encodedData = encodePaymentReliableAttestation(request);

      if (!SCHEMAS.paymentReliable.uid || /^0x0{64}$/i.test(SCHEMAS.paymentReliable.uid)) {
        throw new Error('PaymentReliable schema UID not configured. Register schema and update SCHEMAS.paymentReliable.uid.');
      }

      const tx = await this.eas.attest({
        schema: SCHEMAS.paymentReliable.uid,
        data: {
          recipient: request.subjectAgent,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });

      const attestationUid = await tx.wait();

      return {
        success: true,
        attestationUid,
        txHash: (tx as any).tx?.hash || (tx as any).hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lookup PaymentReliable attestations for a subject agent.
   */
  async getPaymentReliability(subjectAgent: string): Promise<PaymentReliableAttestation[]> {
    if (!ethers.isAddress(subjectAgent)) {
      throw new Error('Invalid subjectAgent: must be a valid Ethereum address');
    }
    return fetchPaymentReliableAttestationsForSubject(subjectAgent, this.network);
  }

  /**
   * Issue a TaskCompletion attestation for a subject agent.
   *
   * Validation + normalization are handled by encodeTaskCompletionAttestation:
   * - required fields (subjectAgent, taskId, category, outcome)
   * - completedAt normalization to unix seconds
   * - reward normalization to uint256-compatible integer
   */
  async issueTaskCompletion(request: TaskCompletionRequest): Promise<TaskCompletionResult> {
    try {
      const encodedData = encodeTaskCompletionAttestation(request);

      if (!SCHEMAS.taskCompletion.uid || /^0x0{64}$/i.test(SCHEMAS.taskCompletion.uid)) {
        throw new Error('TaskCompletion schema UID not configured. Register schema and update SCHEMAS.taskCompletion.uid.');
      }

      const tx = await this.eas.attest({
        schema: SCHEMAS.taskCompletion.uid,
        data: {
          recipient: request.subjectAgent,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });

      const attestationUid = await tx.wait();

      return {
        success: true,
        attestationUid,
        txHash: (tx as any).tx?.hash || (tx as any).hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lookup TaskCompletion attestations for a subject agent.
   */
  async getTaskCompletions(subjectAgent: string): Promise<TaskCompletionAttestation[]> {
    if (!ethers.isAddress(subjectAgent)) {
      throw new Error('Invalid subjectAgent: must be a valid Ethereum address');
    }
    return fetchTaskCompletionAttestationsForSubject(subjectAgent, this.network);
  }

  /**
   * Issue a SecurityAudit attestation for a subject address.
   *
   * Validation + normalization are handled by encodeSecurityAuditAttestation:
   * - required fields (auditor, subject, auditType, passed)
   * - auditType validated against known values
   * - severity normalized from number or string
   * - timestamp normalized to unix seconds (defaults to now)
   *
   * Guards:
   * - subject must not be the zero address
   */
  async issueSecurityAudit(request: SecurityAuditRequest): Promise<SecurityAuditResult> {
    try {
      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
      if (request.subject && request.subject.toLowerCase() === ZERO_ADDRESS) {
        throw new Error('Cannot issue SecurityAudit to the zero address');
      }

      const encodedData = encodeSecurityAuditAttestation(request);

      if (!SCHEMAS.securityAudit.uid || /^0x0{64}$/i.test(SCHEMAS.securityAudit.uid)) {
        throw new Error('SecurityAudit schema UID not configured. Register schema and update SCHEMAS.securityAudit.uid.');
      }

      const tx = await this.eas.attest({
        schema: SCHEMAS.securityAudit.uid,
        data: {
          recipient: request.subject,
          expirationTime: BigInt(0),
          revocable: true,
          data: encodedData,
        },
      });

      const attestationUid = await tx.wait();

      return {
        success: true,
        attestationUid,
        txHash: (tx as any).tx?.hash || (tx as any).hash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Lookup SecurityAudit attestations for a subject address.
   */
  async getSecurityAudits(subjectAddress: string): Promise<SecurityAuditAttestation[]> {
    if (!ethers.isAddress(subjectAddress)) {
      throw new Error('Invalid subjectAddress: must be a valid Ethereum address');
    }
    return fetchSecurityAuditAttestationsForSubject(subjectAddress, this.network);
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

  // ============ Temporal Trust Methods ============

  /**
   * Evaluate temporal trust decay for an agent.
   *
   * A pure, read-time function that applies time-based decay to a raw trust
   * score without modifying the blockchain or stored attestations.
   *
   * Recommended workflow:
   * 1. Call `getScore(agentId)` to retrieve the raw score
   * 2. Call `evaluateTemporalTrust(rawScore, lastAttestationTime, vouches)` to
   *    get a decay-adjusted score that reflects how recently the agent was attested
   *
   * @param rawScore - Undecayed trust score (0–100), from `getScore()`
   * @param lastPositiveAttestationTime - Unix timestamp (seconds) of the most
   *   recent non-revoked positive attestation. Pass null if unknown.
   * @param vouches - Vouch event history for trust velocity calculation.
   * @param config - Optional decay configuration overrides.
   * @returns Decay-adjusted score with diagnostic metadata.
   *
   * @example
   * ```typescript
   * const score = await trust.getScore(agentId);
   * const temporal = trust.evaluateTemporalTrust(
   *   score.score,
   *   score.updatedAt,
   *   vouchHistory,
   *   { lambda: 0.02, gracePeriodDays: 30 }
   * );
   * console.log(`Adjusted: ${temporal.adjustedScore} (velocity: ${temporal.trustVelocity}/day)`);
   * ```
   */
  evaluateTemporalTrust(
    rawScore: number,
    lastPositiveAttestationTime: number | null,
    vouches: VouchEvent[] = [],
    config?: TemporalDecayConfig,
  ): TemporalTrustResult {
    return evaluateTemporalTrust(rawScore, lastPositiveAttestationTime, vouches, config);
  }

  /**
   * Compute trust velocity for an agent — net weighted vouches per day over a
   * rolling window.
   *
   * Velocity is an additive signal alongside trust score:
   * - High velocity (> 5/day) over a short window may indicate Sybil farming
   * - Gradual velocity over weeks/months is a healthy trust-building trajectory
   * - Velocity = 0 for stable, established agents with no recent activity
   *
   * @param vouches - Vouch history with timestamps and trust levels
   * @param windowDays - Rolling window in days (default: 7)
   */
  computeTrustVelocity(vouches: VouchEvent[], windowDays?: number): number {
    return computeTrustVelocity(vouches, windowDays);
  }
}
