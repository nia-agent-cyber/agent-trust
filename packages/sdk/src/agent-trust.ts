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

export class AgentTrust {
  private eas: EAS;
  private network: NetworkName;
  private provider: any;

  constructor(config: AgentTrustConfig) {
    this.network = config.network;
    this.provider = config.provider;

    const networkConfig = NETWORKS[this.network];
    const easAddress = config.easAddress || networkConfig.easAddress;

    this.eas = new EAS(easAddress);
    this.eas.connect(this.provider);
  }

  /**
   * Get trust score for an agent
   */
  async getScore(agentId: string): Promise<TrustScore> {
    // TODO: Implement score calculation
    // 1. Fetch verification attestations
    // 2. Fetch vouch attestations
    // 3. Fetch flag attestations
    // 4. Calculate weighted score

    // Placeholder implementation
    return {
      score: 0,
      confidence: 0,
      attestationCount: 0,
      verified: false,
      linkedPlatforms: [],
      updatedAt: Date.now(),
    };
  }

  /**
   * Verify an agent's identity on a platform
   */
  async verify(request: VerificationRequest): Promise<VerificationResult> {
    try {
      // TODO: Implement verification flow
      // 1. Validate proof (check tweet exists, signature valid, etc.)
      // 2. Create attestation on EAS
      // 3. Return result

      if (!SCHEMAS.verification.uid) {
        throw new Error('Verification schema not registered. Run registerSchemas() first.');
      }

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
    // Verify the proof off-chain first
    const verifyResult = await verifyTwitterProof(proof);
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
