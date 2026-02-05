/**
 * Integration Tests with Base Sepolia
 * 
 * These tests make real network calls to Base Sepolia testnet.
 * They verify the SDK works correctly with the actual EAS infrastructure.
 * 
 * Run with: npm test -- --run integration.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { AgentTrust } from '../agent-trust';
import { getTrustScore, getAttestationSummary, fetchAttestationsForAgent } from '../query';
import { SCHEMAS, NETWORKS } from '../constants';

// Test addresses - Nia's wallet (has real attestations on Sepolia)
const NIA_ADDRESS = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';

// Known attestation UID from testnet
const KNOWN_VOUCH_ATTESTER = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';

describe('Integration: Base Sepolia', () => {
  // ============ Network Configuration Tests ============

  describe('Network Configuration', () => {
    it('has valid schema UIDs for Base Sepolia', () => {
      expect(SCHEMAS.verification.uid).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(SCHEMAS.vouch.uid).toMatch(/^0x[a-f0-9]{64}$/i);
      expect(SCHEMAS.flag.uid).toMatch(/^0x[a-f0-9]{64}$/i);
    });

    it('has correct Base Sepolia network config', () => {
      const config = NETWORKS.baseSepolia;
      expect(config.chainId).toBe(84532);
      expect(config.name).toBe('Base Sepolia');
      expect(config.rpcUrl).toBe('https://sepolia.base.org');
      expect(config.easAddress).toBe('0x4200000000000000000000000000000000000021');
    });

    it('has correct Base Mainnet network config', () => {
      const config = NETWORKS.base;
      expect(config.chainId).toBe(8453);
      expect(config.name).toBe('Base');
      expect(config.rpcUrl).toBe('https://mainnet.base.org');
      expect(config.easAddress).toBe('0x4200000000000000000000000000000000000021');
    });
  });

  // ============ GraphQL Query Tests ============

  describe('GraphQL Queries (Live)', () => {
    it('successfully queries EAS GraphQL endpoint', async () => {
      // This makes a real network call to the testnet
      const result = await fetchAttestationsForAgent(NIA_ADDRESS, 'baseSepolia');
      
      // Should return valid structure even if empty
      expect(result).toHaveProperty('verifications');
      expect(result).toHaveProperty('vouches');
      expect(result).toHaveProperty('flags');
      expect(Array.isArray(result.verifications)).toBe(true);
      expect(Array.isArray(result.vouches)).toBe(true);
      expect(Array.isArray(result.flags)).toBe(true);
    }, 15000); // Extended timeout for network call

    it('handles checksummed addresses correctly', async () => {
      const checksummed = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
      const lowercase = '0xc0d7ca6b3c1ef108696ced64f97729177f823189';
      
      // Both should work and return same results
      const result1 = await fetchAttestationsForAgent(checksummed, 'baseSepolia');
      const result2 = await fetchAttestationsForAgent(lowercase, 'baseSepolia');
      
      expect(result1.verifications.length).toBe(result2.verifications.length);
      expect(result1.vouches.length).toBe(result2.vouches.length);
      expect(result1.flags.length).toBe(result2.flags.length);
    }, 15000);

    it('returns empty arrays for address with no attestations', async () => {
      // Random address that likely has no attestations
      const emptyAddress = '0x0000000000000000000000000000000000000001';
      
      const result = await fetchAttestationsForAgent(emptyAddress, 'baseSepolia');
      
      expect(result.verifications).toEqual([]);
      expect(result.vouches).toEqual([]);
      expect(result.flags).toEqual([]);
    }, 15000);
  });

  // ============ Trust Score Tests ============

  describe('Trust Score Calculation (Live)', () => {
    it('calculates trust score for known address', async () => {
      const score = await getTrustScore(NIA_ADDRESS, 'baseSepolia');
      
      // Should return valid TrustScore structure
      expect(score).toHaveProperty('score');
      expect(score).toHaveProperty('confidence');
      expect(score).toHaveProperty('attestationCount');
      expect(score).toHaveProperty('verified');
      expect(score).toHaveProperty('linkedPlatforms');
      expect(score).toHaveProperty('updatedAt');
      
      // Values should be within expected ranges
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
      expect(score.confidence).toBeGreaterThanOrEqual(0);
      expect(score.confidence).toBeLessThanOrEqual(1);
      expect(score.attestationCount).toBeGreaterThanOrEqual(0);
      expect(typeof score.verified).toBe('boolean');
      expect(Array.isArray(score.linkedPlatforms)).toBe(true);
    }, 15000);

    it('returns default score for unknown address', async () => {
      const unknownAddress = '0x0000000000000000000000000000000000000002';
      
      const score = await getTrustScore(unknownAddress, 'baseSepolia');
      
      expect(score.score).toBe(0);
      expect(score.verified).toBe(false);
      expect(score.confidence).toBe(0);
      expect(score.attestationCount).toBe(0);
      expect(score.linkedPlatforms).toEqual([]);
    }, 15000);
  });

  // ============ Attestation Summary Tests ============

  describe('Attestation Summary (Live)', () => {
    it('retrieves attestation summary for known address', async () => {
      const summary = await getAttestationSummary(NIA_ADDRESS, 'baseSepolia');
      
      expect(summary.address).toBe(NIA_ADDRESS);
      expect(Array.isArray(summary.verifications)).toBe(true);
      expect(Array.isArray(summary.vouches)).toBe(true);
      expect(Array.isArray(summary.flags)).toBe(true);
      expect(summary.trustScore).toBeDefined();
    }, 15000);

    it('summary verification entries have correct structure', async () => {
      const summary = await getAttestationSummary(NIA_ADDRESS, 'baseSepolia');
      
      for (const verification of summary.verifications) {
        expect(verification).toHaveProperty('platform');
        expect(verification).toHaveProperty('handle');
        expect(verification).toHaveProperty('attester');
        expect(typeof verification.platform).toBe('string');
        expect(typeof verification.handle).toBe('string');
        expect(verification.attester).toMatch(/^0x[a-fA-F0-9]{40}$/);
      }
    }, 15000);

    it('summary vouch entries have correct structure', async () => {
      const summary = await getAttestationSummary(NIA_ADDRESS, 'baseSepolia');
      
      for (const vouch of summary.vouches) {
        expect(vouch).toHaveProperty('trustLevel');
        expect(vouch).toHaveProperty('context');
        expect(vouch).toHaveProperty('attester');
        expect(vouch.trustLevel).toBeGreaterThanOrEqual(0);
        expect(vouch.trustLevel).toBeLessThanOrEqual(5);
        expect(typeof vouch.context).toBe('string');
        expect(vouch.attester).toMatch(/^0x[a-fA-F0-9]{40}$/);
      }
    }, 15000);
  });

  // ============ AgentTrust Class Tests ============

  describe('AgentTrust Class (Live)', () => {
    let agentTrust: AgentTrust;

    beforeAll(() => {
      const mockProvider = {
        getNetwork: () => Promise.resolve({ chainId: 84532, name: 'base-sepolia' })
      };
      
      agentTrust = new AgentTrust({
        network: 'baseSepolia',
        provider: mockProvider
      });
    });

    it('initializes with correct network', () => {
      const config = agentTrust.getNetworkConfig();
      expect(config.chainId).toBe(84532);
      expect(config.name).toBe('Base Sepolia');
    });

    it('reports schemas as registered', () => {
      const registered = agentTrust.areSchemasRegistered();
      expect(registered).toBe(true);
    });

    it('getScore returns valid trust score', async () => {
      const score = await agentTrust.getScore(NIA_ADDRESS);
      
      expect(score).toHaveProperty('score');
      expect(score).toHaveProperty('verified');
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
    }, 15000);

    it('getScore handles invalid addresses gracefully', async () => {
      const score = await agentTrust.getScore('invalid-address');
      
      // Should return default score for invalid address
      expect(score.score).toBe(0);
      expect(score.verified).toBe(false);
    });

    it('getAttestationSummary returns detailed info', async () => {
      const summary = await agentTrust.getAttestationSummary(NIA_ADDRESS);
      
      expect(summary.address).toBe(NIA_ADDRESS);
      expect(summary).toHaveProperty('verifications');
      expect(summary).toHaveProperty('vouches');
      expect(summary).toHaveProperty('flags');
      expect(summary).toHaveProperty('trustScore');
    }, 15000);

    it('generates valid Twitter challenge', () => {
      const challenge = agentTrust.generateTwitterChallenge(NIA_ADDRESS, 'testhandle');
      
      expect(challenge.code).toHaveLength(6);
      expect(challenge.agentId).toBe(NIA_ADDRESS);
      expect(challenge.handle).toBe('testhandle');
      expect(challenge.tweetMessage).toContain(NIA_ADDRESS);
      expect(challenge.tweetMessage).toContain(challenge.code);
    });

    it('generates valid GitHub challenge', () => {
      const challenge = agentTrust.generateGitHubChallenge(NIA_ADDRESS, 'testuser');
      
      expect(challenge.code).toHaveLength(8);
      expect(challenge.agentId).toBe(NIA_ADDRESS);
      expect(challenge.username).toBe('testuser');
      expect(challenge.gistContent).toContain(NIA_ADDRESS);
      expect(challenge.gistContent).toContain(challenge.code);
    });
  });
});

// ============ Mainnet Smoke Tests ============

describe('Integration: Base Mainnet (Smoke Tests)', () => {
  it('can query mainnet EAS endpoint', async () => {
    // Just verify the endpoint is reachable and returns valid structure
    const result = await fetchAttestationsForAgent(NIA_ADDRESS, 'base');
    
    expect(result).toHaveProperty('verifications');
    expect(result).toHaveProperty('vouches');
    expect(result).toHaveProperty('flags');
  }, 15000);

  it('mainnet trust score calculation works', async () => {
    const score = await getTrustScore(NIA_ADDRESS, 'base');
    
    expect(score).toHaveProperty('score');
    expect(score).toHaveProperty('verified');
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
  }, 15000);
});
