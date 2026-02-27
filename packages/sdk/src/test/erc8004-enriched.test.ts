/**
 * ERC-8004 Enriched Profile Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ethers } from 'ethers';
import { calculateCombinedScore, generateSummary, buildEnrichedProfile } from '../erc8004/enriched';
import { SCORING_WEIGHTS, MAX_TIER } from '../erc8004/constants';
import { TierInfo } from '../tier/tier-types';
import { TrustScore } from '../types';
import { ERC8004Identity, ERC8004Reputation, ERC8004Validation } from '../erc8004/types';

// Mock sub-modules
vi.mock('../erc8004/identity', () => ({
  getERC8004Identity: vi.fn(),
}));
vi.mock('../erc8004/reputation', () => ({
  getERC8004Reputation: vi.fn(),
}));
vi.mock('../erc8004/validation', () => ({
  getERC8004Validation: vi.fn(),
}));

import { getERC8004Identity } from '../erc8004/identity';
import { getERC8004Reputation } from '../erc8004/reputation';
import { getERC8004Validation } from '../erc8004/validation';

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

function makeTierInfo(tier: number, name: string): TierInfo {
  return {
    tier,
    name,
    emoji: '🔵',
    requirements: { minAttestations: 0, minVouches: 0, minVouchTier: 0, minApprovalRate: 0, minDaysActive: 0 },
    progress: null,
    nextTier: tier < 4 ? tier + 1 : null,
  };
}

function makeTrustScore(score: number, count: number): TrustScore {
  return {
    score,
    confidence: 0.5,
    attestationCount: count,
    verified: true,
    linkedPlatforms: [],
    updatedAt: Date.now(),
  };
}

function makeIdentity(agentId: number, metadata: any = null): ERC8004Identity {
  return {
    agentId,
    owner: TEST_ADDRESS,
    registryAddress: '0xregistry',
    tokenURI: 'https://example.com/agent.json',
    metadata,
  };
}

function makeReputation(avg: number, count: number): ERC8004Reputation {
  return {
    feedbackCount: count,
    averageRating: avg,
    recentFeedback: [],
  };
}

function makeValidation(total: number, passed: number): ERC8004Validation {
  return {
    validationCount: total,
    passedCount: passed,
    recentValidations: [],
  };
}

describe('calculateCombinedScore', () => {
  it('returns 0 for tier 0 with no ERC-8004 data', () => {
    const tier = makeTierInfo(0, 'New');
    const score = calculateCombinedScore(tier, null, null, null);
    expect(score).toBe(0);
  });

  it('returns max score for top tier with perfect ERC-8004 data', () => {
    const tier = makeTierInfo(4, 'Expert');
    const identity = makeIdentity(1, { name: 'Agent' });
    const reputation = makeReputation(5, 10);
    const validation = makeValidation(10, 10);

    const score = calculateCombinedScore(tier, identity, reputation, validation);
    expect(score).toBe(100);
  });

  it('weights Agent Trust tier at 40%', () => {
    // Tier 4 only, no ERC-8004 data
    const tier = makeTierInfo(4, 'Expert');
    const score = calculateCombinedScore(tier, null, null, null);
    expect(score).toBe(40); // 100 * 0.4
  });

  it('weights ERC-8004 reputation at 30%', () => {
    const tier = makeTierInfo(0, 'New');
    const reputation = makeReputation(5, 10); // Perfect rating
    const score = calculateCombinedScore(tier, null, reputation, null);
    expect(score).toBe(30); // 100 * 0.3
  });

  it('weights identity completeness at 15%', () => {
    const tier = makeTierInfo(0, 'New');
    const identity = makeIdentity(1, { name: 'Agent' }); // Full identity: 50+20+30=100
    const score = calculateCombinedScore(tier, identity, null, null);
    expect(score).toBe(15); // 100 * 0.15
  });

  it('gives partial identity score without metadata', () => {
    const tier = makeTierInfo(0, 'New');
    const identity = makeIdentity(1, null); // No metadata: 50+20=70
    const score = calculateCombinedScore(tier, identity, null, null);
    expect(score).toBe(Math.round(70 * 0.15)); // 10 or 11
  });

  it('weights validation at 15%', () => {
    const tier = makeTierInfo(0, 'New');
    const validation = makeValidation(10, 10); // 100% pass rate
    const score = calculateCombinedScore(tier, null, null, validation);
    expect(score).toBe(15); // 100 * 0.15
  });

  it('handles partial validation pass rate', () => {
    const tier = makeTierInfo(0, 'New');
    const validation = makeValidation(10, 5); // 50% pass rate
    const score = calculateCombinedScore(tier, null, null, validation);
    expect(score).toBe(Math.round(50 * 0.15));
  });

  it('clamps score to 0-100', () => {
    const tier = makeTierInfo(4, 'Expert');
    const identity = makeIdentity(1, { name: 'Agent' });
    const reputation = makeReputation(5, 100);
    const validation = makeValidation(100, 100);
    const score = calculateCombinedScore(tier, identity, reputation, validation);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('handles null averageRating in reputation', () => {
    const tier = makeTierInfo(2, 'Trusted');
    const reputation: ERC8004Reputation = { feedbackCount: 0, averageRating: null, recentFeedback: [] };
    const score = calculateCombinedScore(tier, null, reputation, null);
    // Only tier contributes: (2/4)*100*0.4 = 20
    expect(score).toBe(20);
  });
});

describe('generateSummary', () => {
  it('includes ERC-8004 identity when registered', () => {
    const tier = makeTierInfo(2, 'Trusted');
    const identity = makeIdentity(1, { name: 'CoolBot' });
    const summary = generateSummary(TEST_ADDRESS, tier, identity, null, 50);
    expect(summary).toContain('CoolBot is registered on ERC-8004');
    expect(summary).toContain('Trusted');
    expect(summary).toContain('50/100');
  });

  it('shows truncated address when no identity', () => {
    const tier = makeTierInfo(0, 'New');
    const summary = generateSummary(TEST_ADDRESS, tier, null, null, 0);
    expect(summary).toContain('0x123456');
    expect(summary).toContain('no ERC-8004 identity');
  });

  it('includes rating when reputation exists', () => {
    const tier = makeTierInfo(1, 'Contributor');
    const reputation = makeReputation(4.5, 20);
    const summary = generateSummary(TEST_ADDRESS, tier, null, reputation, 30);
    expect(summary).toContain('4.5/5');
    expect(summary).toContain('20 reviews');
  });

  it('uses agent ID fallback when metadata has no name', () => {
    const tier = makeTierInfo(1, 'Contributor');
    const identity = makeIdentity(99, null);
    const summary = generateSummary(TEST_ADDRESS, tier, identity, null, 25);
    expect(summary).toContain('Agent #99');
  });
});

describe('buildEnrichedProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds profile with no ERC-8004 data (not registered)', async () => {
    (getERC8004Identity as any).mockResolvedValue(null);

    const tier = makeTierInfo(1, 'Contributor');
    const score = makeTrustScore(45, 3);
    const provider = {} as ethers.Provider;

    const profile = await buildEnrichedProfile(TEST_ADDRESS, provider, 'base', tier, score, 3);

    expect(profile.address).toBe(TEST_ADDRESS);
    expect(profile.erc8004.registered).toBe(false);
    expect(profile.erc8004.identity).toBeNull();
    expect(profile.erc8004.reputation).toBeNull();
    expect(profile.erc8004.validation).toBeNull();
    expect(profile.agentTrust.tier).toBe(tier);
    expect(profile.agentTrust.score).toBe(score);
    expect(profile.combined.hasOnChainIdentity).toBe(false);
    expect(profile.combined.trustTier).toBe('Contributor');
  });

  it('builds profile with full ERC-8004 data', async () => {
    const identity = makeIdentity(42, { name: 'TestBot' });
    const reputation = makeReputation(4.0, 10);
    const validation = makeValidation(5, 4);

    (getERC8004Identity as any).mockResolvedValue(identity);
    (getERC8004Reputation as any).mockResolvedValue(reputation);
    (getERC8004Validation as any).mockResolvedValue(validation);

    const tier = makeTierInfo(3, 'Verified');
    const score = makeTrustScore(70, 15);
    const provider = {} as ethers.Provider;

    const profile = await buildEnrichedProfile(TEST_ADDRESS, provider, 'base', tier, score, 15);

    expect(profile.erc8004.registered).toBe(true);
    expect(profile.erc8004.identity).toBe(identity);
    expect(profile.erc8004.reputation).toBe(reputation);
    expect(profile.erc8004.validation).toBe(validation);
    expect(profile.combined.hasOnChainIdentity).toBe(true);
    expect(profile.combined.reputationScore).toBeGreaterThan(0);
    expect(profile.combined.summary).toContain('TestBot');
  });

  it('uses custom registry addresses from config', async () => {
    (getERC8004Identity as any).mockResolvedValue(null);

    const tier = makeTierInfo(0, 'New');
    const score = makeTrustScore(0, 0);
    const provider = {} as ethers.Provider;
    const config = {
      identityRegistry: '0xCustomRegistry',
    };

    await buildEnrichedProfile(TEST_ADDRESS, provider, 'base', tier, score, 0, config);

    expect(getERC8004Identity).toHaveBeenCalledWith(TEST_ADDRESS, '0xCustomRegistry', provider);
  });
});
