/**
 * Tests for TrustCheckTool
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrustCheckTool, performTrustCheck } from '../trust-check-tool.js';
import type { AgentTrustLike } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockAgentTrust(overrides: {
  tier?: number;
  tierName?: string;
  score?: number;
}): AgentTrustLike {
  const { tier = 2, tierName = 'Trusted', score = 65 } = overrides;
  return {
    getTier: vi.fn().mockResolvedValue({ tier, name: tierName }),
    getScore: vi.fn().mockResolvedValue({ score }),
  };
}

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

// ---------------------------------------------------------------------------
// TrustCheckTool shape
// ---------------------------------------------------------------------------

describe('TrustCheckTool', () => {
  describe('schema and metadata', () => {
    it('has the correct tool name', () => {
      const tool = new TrustCheckTool(makeMockAgentTrust({}));
      expect(tool.name).toBe('trust_check');
    });

    it('has a non-empty description', () => {
      const tool = new TrustCheckTool(makeMockAgentTrust({}));
      expect(tool.description.length).toBeGreaterThan(0);
    });

    it('has a valid zod schema with agentAddress field', () => {
      const tool = new TrustCheckTool(makeMockAgentTrust({}));
      const parsed = tool.schema.safeParse({ agentAddress: TEST_ADDRESS });
      expect(parsed.success).toBe(true);
    });

    it('has an optional minTier field in schema', () => {
      const tool = new TrustCheckTool(makeMockAgentTrust({}));
      const withoutMinTier = tool.schema.safeParse({ agentAddress: TEST_ADDRESS });
      const withMinTier = tool.schema.safeParse({
        agentAddress: TEST_ADDRESS,
        minTier: 'silver',
      });
      expect(withoutMinTier.success).toBe(true);
      expect(withMinTier.success).toBe(true);
    });

    it('rejects invalid minTier values', () => {
      const tool = new TrustCheckTool(makeMockAgentTrust({}));
      const result = tool.schema.safeParse({
        agentAddress: TEST_ADDRESS,
        minTier: 'diamond', // not in TIER_ORDER
      });
      expect(result.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // _call — pass cases
  // ---------------------------------------------------------------------------

  describe('_call — pass cases', () => {
    it('returns passed:true when tier meets the required tier (exact match)', async () => {
      const mock = makeMockAgentTrust({ tier: 1, score: 40 }); // bronze
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'bronze' });
      const result = JSON.parse(raw);
      expect(result.passed).toBe(true);
      expect(result.tier).toBe('bronze');
    });

    it('returns passed:true when tier exceeds the required tier', async () => {
      const mock = makeMockAgentTrust({ tier: 3, score: 80 }); // gold
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'silver' });
      const result = JSON.parse(raw);
      expect(result.passed).toBe(true);
      expect(result.tier).toBe('gold');
    });

    it('defaults minTier to "bronze" when not provided', async () => {
      const mock = makeMockAgentTrust({ tier: 1, score: 30 }); // bronze
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS });
      const result = JSON.parse(raw);
      expect(result.passed).toBe(true);
      expect(result.tier).toBe('bronze');
    });

    it('platinum always passes any minTier', async () => {
      const mock = makeMockAgentTrust({ tier: 4, score: 99 }); // platinum
      const tool = new TrustCheckTool(mock);
      for (const minTier of ['unverified', 'bronze', 'silver', 'gold', 'platinum'] as const) {
        const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier });
        const result = JSON.parse(raw);
        expect(result.passed).toBe(true);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // _call — fail cases
  // ---------------------------------------------------------------------------

  describe('_call — fail cases', () => {
    it('returns passed:false when tier is below the required tier', async () => {
      const mock = makeMockAgentTrust({ tier: 1, score: 25 }); // bronze
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'gold' });
      const result = JSON.parse(raw);
      expect(result.passed).toBe(false);
      expect(result.tier).toBe('bronze');
    });

    it('returns passed:false for unverified when minTier is bronze', async () => {
      const mock = makeMockAgentTrust({ tier: 0, score: 0 }); // unverified
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'bronze' });
      const result = JSON.parse(raw);
      expect(result.passed).toBe(false);
      expect(result.tier).toBe('unverified');
    });
  });

  // ---------------------------------------------------------------------------
  // _call — result shape
  // ---------------------------------------------------------------------------

  describe('_call — result shape', () => {
    it('returns address in the result', async () => {
      const mock = makeMockAgentTrust({ tier: 2, score: 70 });
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS });
      const result = JSON.parse(raw);
      expect(result.address).toBe(TEST_ADDRESS);
    });

    it('returns score from getScore', async () => {
      const mock = makeMockAgentTrust({ tier: 2, score: 72 });
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS });
      const result = JSON.parse(raw);
      expect(result.score).toBe(72);
    });

    it('returns a non-empty reason string', async () => {
      const mock = makeMockAgentTrust({ tier: 2, score: 70 });
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS });
      const result = JSON.parse(raw);
      expect(typeof result.reason).toBe('string');
      expect(result.reason.length).toBeGreaterThan(0);
    });

    it('reason includes the address', async () => {
      const mock = makeMockAgentTrust({ tier: 2, score: 70 });
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS });
      const result = JSON.parse(raw);
      expect(result.reason).toContain(TEST_ADDRESS);
    });

    it('reason includes tier names on fail', async () => {
      const mock = makeMockAgentTrust({ tier: 0, score: 0 }); // unverified
      const tool = new TrustCheckTool(mock);
      const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'gold' });
      const result = JSON.parse(raw);
      expect(result.reason).toContain('unverified');
      expect(result.reason).toContain('gold');
    });
  });

  // ---------------------------------------------------------------------------
  // Tier name mapping
  // ---------------------------------------------------------------------------

  describe('tier name mapping', () => {
    const tierMap: [number, string][] = [
      [0, 'unverified'],
      [1, 'bronze'],
      [2, 'silver'],
      [3, 'gold'],
      [4, 'platinum'],
    ];

    for (const [numericTier, expectedName] of tierMap) {
      it(`maps SDK tier ${numericTier} to '${expectedName}'`, async () => {
        const mock = makeMockAgentTrust({ tier: numericTier, score: 50 });
        const tool = new TrustCheckTool(mock);
        const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'unverified' });
        const result = JSON.parse(raw);
        expect(result.tier).toBe(expectedName);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// performTrustCheck (shared utility)
// ---------------------------------------------------------------------------

describe('performTrustCheck', () => {
  it('calls getTier and getScore with the agent address', async () => {
    const mock = makeMockAgentTrust({ tier: 2, score: 60 });
    await performTrustCheck(mock, TEST_ADDRESS, 'bronze');
    expect(mock.getTier).toHaveBeenCalledWith(TEST_ADDRESS);
    expect(mock.getScore).toHaveBeenCalledWith(TEST_ADDRESS);
  });

  it('returns a TrustCheckResult with all required fields', async () => {
    const mock = makeMockAgentTrust({ tier: 2, score: 60 });
    const result = await performTrustCheck(mock, TEST_ADDRESS, 'bronze');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('reason');
  });
});
