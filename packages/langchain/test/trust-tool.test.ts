import { describe, it, expect, vi } from 'vitest';
import { TrustCheckTool } from '../src/trust-tool.js';
import { AgentTrustLike } from '../src/types.js';

const VALID_ADDR = '0x' + 'a'.repeat(40);
const ZERO_ADDR = '0x' + '0'.repeat(40);

function makeMockTrust(tier = 1, score = 55): AgentTrustLike {
  return {
    getTier: vi.fn().mockResolvedValue({ tier }),
    getScore: vi.fn().mockResolvedValue({ score }),
  };
}

describe('TrustCheckTool', () => {
  describe('construction', () => {
    it('uses default name and description when not specified', () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust() });
      expect(tool.name).toBe('agent_trust_check');
      expect(tool.description.length).toBeGreaterThan(10);
    });

    it('accepts custom name and description', () => {
      const tool = new TrustCheckTool({
        agentTrust: makeMockTrust(),
        name: 'custom_tool',
        description: 'My custom trust tool',
      });
      expect(tool.name).toBe('custom_tool');
      expect(tool.description).toBe('My custom trust tool');
    });
  });

  describe('_run', () => {
    it('returns tier info for a valid address', async () => {
      const trust = makeMockTrust(2, 72);
      const tool = new TrustCheckTool({ agentTrust: trust });
      const result = await tool._run({ address: VALID_ADDR });

      expect(result.address).toBe(VALID_ADDR);
      expect(result.tier.level).toBe(2);
      expect(result.tier.name).toBe('trusted');
      expect(result.tier.score).toBe(72);
      expect(result.meets).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('includes meets: true when tier exceeds required', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust(3, 90) });
      const result = await tool._run({ address: VALID_ADDR, requiredTier: 'contributor' });
      expect(result.meets).toBe(true);
      expect(result.requiredTier).toBe('contributor');
    });

    it('includes meets: true when tier exactly matches required', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust(1, 50) });
      const result = await tool._run({ address: VALID_ADDR, requiredTier: 'contributor' });
      expect(result.meets).toBe(true);
    });

    it('returns meets: false when below required tier', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust(0, 10) });
      const result = await tool._run({ address: VALID_ADDR, requiredTier: 'contributor' });
      expect(result.meets).toBe(false);
      expect(result.requiredTier).toBe('contributor');
    });

    it('returns meets: true with no requiredTier supplied', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust(0, 0) });
      const result = await tool._run({ address: VALID_ADDR });
      expect(result.meets).toBe(true);
      expect(result.requiredTier).toBeUndefined();
    });

    it('uses defaultRequiredTier from config when none supplied per-call', async () => {
      const tool = new TrustCheckTool({
        agentTrust: makeMockTrust(0, 0),
        requiredTier: 'trusted',
      });
      const result = await tool._run({ address: VALID_ADDR });
      expect(result.meets).toBe(false);
      expect(result.requiredTier).toBe('trusted');
    });

    it('per-call requiredTier overrides config default', async () => {
      const tool = new TrustCheckTool({
        agentTrust: makeMockTrust(2, 70),
        requiredTier: 'expert',
      });
      const result = await tool._run({ address: VALID_ADDR, requiredTier: 'contributor' });
      expect(result.meets).toBe(true);
      expect(result.requiredTier).toBe('contributor');
    });
  });

  describe('invalid / zero address handling', () => {
    it('returns error for zero address', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust() });
      const result = await tool._run({ address: ZERO_ADDR });
      expect(result.meets).toBe(false);
      expect(result.error).toBe('invalid address');
      expect(result.tier.level).toBe(0);
    });

    it('returns error for non-hex address', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust() });
      const result = await tool._run({ address: 'not-an-address' });
      expect(result.meets).toBe(false);
      expect(result.error).toBe('invalid address');
    });

    it('returns error for empty address', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust() });
      const result = await tool._run({ address: '' });
      expect(result.meets).toBe(false);
      expect(result.error).toBe('invalid address');
    });

    it('returns error for short hex address', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust() });
      const result = await tool._run({ address: '0xabc' });
      expect(result.meets).toBe(false);
      expect(result.error).toBe('invalid address');
    });

    it('does not call agentTrust for invalid address', async () => {
      const trust = makeMockTrust();
      const tool = new TrustCheckTool({ agentTrust: trust });
      await tool._run({ address: ZERO_ADDR });
      expect(trust.getTier).not.toHaveBeenCalled();
      expect(trust.getScore).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns error field when getTier rejects', async () => {
      const trust: AgentTrustLike = {
        getTier: vi.fn().mockRejectedValue(new Error('network error')),
        getScore: vi.fn().mockResolvedValue({ score: 0 }),
      };
      const tool = new TrustCheckTool({ agentTrust: trust });
      const result = await tool._run({ address: VALID_ADDR });
      expect(result.meets).toBe(false);
      expect(result.error).toBe('network error');
    });

    it('returns error field when getScore rejects', async () => {
      const trust: AgentTrustLike = {
        getTier: vi.fn().mockResolvedValue({ tier: 1 }),
        getScore: vi.fn().mockRejectedValue(new Error('score unavailable')),
      };
      const tool = new TrustCheckTool({ agentTrust: trust });
      const result = await tool._run({ address: VALID_ADDR });
      expect(result.meets).toBe(false);
      expect(result.error).toBe('score unavailable');
    });
  });

  describe('invoke (JSON output)', () => {
    it('returns valid JSON string', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust(1, 55) });
      const json = await tool.invoke({ address: VALID_ADDR });
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.tier.name).toBe('contributor');
    });

    it('JSON for invalid address contains meets: false', async () => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust() });
      const json = await tool.invoke({ address: ZERO_ADDR });
      const parsed = JSON.parse(json);
      expect(parsed.meets).toBe(false);
    });
  });

  describe('tier name mapping', () => {
    it.each([
      [0, 'unverified'],
      [1, 'contributor'],
      [2, 'trusted'],
      [3, 'verified'],
      [4, 'expert'],
    ])('tier level %i maps to name %s', async (level, name) => {
      const tool = new TrustCheckTool({ agentTrust: makeMockTrust(level, 50) });
      const result = await tool._run({ address: VALID_ADDR });
      expect(result.tier.name).toBe(name);
    });
  });

  describe('numeric score from getScore', () => {
    it('handles getScore returning a plain number', async () => {
      const trust: AgentTrustLike = {
        getTier: vi.fn().mockResolvedValue({ tier: 2 }),
        getScore: vi.fn().mockResolvedValue(88),
      };
      const tool = new TrustCheckTool({ agentTrust: trust });
      const result = await tool._run({ address: VALID_ADDR });
      expect(result.tier.score).toBe(88);
    });
  });

  describe('numeric tier from getTier', () => {
    it('handles getTier returning a plain number', async () => {
      const trust: AgentTrustLike = {
        getTier: vi.fn().mockResolvedValue(3),
        getScore: vi.fn().mockResolvedValue({ score: 90 }),
      };
      const tool = new TrustCheckTool({ agentTrust: trust });
      const result = await tool._run({ address: VALID_ADDR });
      expect(result.tier.level).toBe(3);
      expect(result.tier.name).toBe('verified');
    });
  });
});
