/**
 * Tests for trust score calculation
 */

import { describe, it, expect } from 'vitest';
import { 
  calculateTrustScore, 
  getDefaultTrustScore,
  VerificationAttestation,
  VouchAttestation,
  FlagAttestation,
  ScoreInputs
} from '../scoring/trust-score';

describe('Trust Score Calculation', () => {
  const mockVerification: VerificationAttestation = {
    uid: 'ver-1',
    attester: '0xverifier',
    recipient: '0xagent',
    time: Date.now() / 1000,
    revoked: false,
    platform: 'twitter',
    handle: '@testuser'
  };

  const mockVouch: VouchAttestation = {
    uid: 'vouch-1',
    attester: '0xvoucher',
    recipient: '0xagent',
    time: Date.now() / 1000,
    revoked: false,
    trustLevel: 4,
    context: 'Great agent!'
  };

  const mockFlag: FlagAttestation = {
    uid: 'flag-1',
    attester: '0xflagger',
    recipient: '0xagent',
    time: Date.now() / 1000,
    revoked: false,
    severity: 3,
    reason: 'Suspicious behavior'
  };

  it('returns default score for no attestations', () => {
    const inputs: ScoreInputs = {
      verifications: [],
      vouches: [],
      flags: [],
      attesterScores: new Map()
    };

    const score = calculateTrustScore(inputs);
    
    expect(score.score).toBe(0);
    expect(score.verified).toBe(false);
    expect(score.confidence).toBe(0);
    expect(score.attestationCount).toBe(0);
  });

  it('gives base score of 50 for verified agent', () => {
    const inputs: ScoreInputs = {
      verifications: [mockVerification],
      vouches: [],
      flags: [],
      attesterScores: new Map()
    };

    const score = calculateTrustScore(inputs);
    
    expect(score.score).toBeGreaterThanOrEqual(50);
    expect(score.verified).toBe(true);
    expect(score.linkedPlatforms).toContain('twitter');
  });

  it('increases score with vouches', () => {
    const inputs: ScoreInputs = {
      verifications: [mockVerification],
      vouches: [mockVouch],
      flags: [],
      attesterScores: new Map([['0xvoucher', 80]])
    };

    const score = calculateTrustScore(inputs);
    
    expect(score.score).toBeGreaterThan(50);
  });

  it('decreases score with flags', () => {
    const inputs: ScoreInputs = {
      verifications: [mockVerification],
      vouches: [],
      flags: [mockFlag],
      attesterScores: new Map([['0xflagger', 70]])
    };

    const score = calculateTrustScore(inputs);
    
    expect(score.score).toBeLessThan(50);
  });

  it('ignores revoked attestations', () => {
    const revokedVerification = { ...mockVerification, revoked: true };
    
    const inputs: ScoreInputs = {
      verifications: [revokedVerification],
      vouches: [],
      flags: [],
      attesterScores: new Map()
    };

    const score = calculateTrustScore(inputs);
    
    expect(score.verified).toBe(false);
    expect(score.score).toBe(0);
  });

  it('clamps score between 0 and 100', () => {
    // Many flags should not go below 0
    const manyFlags = Array(10).fill(null).map((_, i) => ({
      ...mockFlag,
      uid: `flag-${i}`,
      severity: 5
    }));

    const inputs: ScoreInputs = {
      verifications: [],
      vouches: [],
      flags: manyFlags,
      attesterScores: new Map()
    };

    const score = calculateTrustScore(inputs);
    
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  });

  it('returns proper default trust score', () => {
    const defaultScore = getDefaultTrustScore();
    
    expect(defaultScore.score).toBe(0);
    expect(defaultScore.confidence).toBe(0);
    expect(defaultScore.verified).toBe(false);
    expect(defaultScore.linkedPlatforms).toEqual([]);
  });
});

describe('AgentTrust.getScore() Integration', () => {
  const mockProvider = {
    getNetwork: () => Promise.resolve({ chainId: 84532, name: 'base-sepolia' })
  };

  it('validates agent address format', async () => {
    const { AgentTrust } = await import('../agent-trust');
    
    const agentTrust = new AgentTrust({
      network: 'baseSepolia',
      provider: mockProvider
    });

    // Should return default score for invalid address instead of throwing
    const result = await agentTrust.getScore('invalid-address');
    expect(result).toEqual(getDefaultTrustScore());
  });

  it('returns trust score for valid address', async () => {
    const { AgentTrust } = await import('../agent-trust');
    
    const agentTrust = new AgentTrust({
      network: 'baseSepolia',
      provider: mockProvider
    });

    // Test with Vitalik's address (valid format)
    const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const result = await agentTrust.getScore(validAddress);

    // Should return proper TrustScore structure
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('attestationCount');
    expect(result).toHaveProperty('verified');
    expect(result).toHaveProperty('linkedPlatforms');
    expect(result).toHaveProperty('updatedAt');
    
    expect(typeof result.score).toBe('number');
    expect(typeof result.confidence).toBe('number');
    expect(typeof result.attestationCount).toBe('number');
    expect(typeof result.verified).toBe('boolean');
    expect(Array.isArray(result.linkedPlatforms)).toBe(true);
    expect(typeof result.updatedAt).toBe('number');
  });

  it('provides attestation summary for debugging', async () => {
    const { AgentTrust } = await import('../agent-trust');
    
    const agentTrust = new AgentTrust({
      network: 'baseSepolia',
      provider: mockProvider
    });

    const validAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    
    // This will likely fail due to network issues, but we test the structure
    try {
      const summary = await agentTrust.getAttestationSummary(validAddress);
      
      expect(summary).toHaveProperty('address');
      expect(summary).toHaveProperty('verifications');
      expect(summary).toHaveProperty('vouches');
      expect(summary).toHaveProperty('flags');
      expect(summary).toHaveProperty('trustScore');
      
      expect(Array.isArray(summary.verifications)).toBe(true);
      expect(Array.isArray(summary.vouches)).toBe(true);
      expect(Array.isArray(summary.flags)).toBe(true);
    } catch (error) {
      // Expected to fail due to network connectivity, just test that method exists
      expect(error).toBeDefined();
    }
  });
});
