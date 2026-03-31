import { describe, it, expect, vi } from 'vitest';
import { createAgentTrustPlugin } from '../src/plugin.js';
import type { AgentTrustLike } from '../src/types.js';

const VALID_ADDR = '0x' + 'd'.repeat(40);

function mockTrust(tier = 2): AgentTrustLike {
  return {
    getTier: vi.fn().mockResolvedValue({ tier }),
    getScore: vi.fn().mockResolvedValue({ score: 70 }),
  };
}

describe('createAgentTrustPlugin', () => {
  it('returns a plugin with name agent-trust', () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust() });
    expect(plugin.name).toBe('agent-trust');
  });

  it('has description', () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust(), requiredTier: 'trusted' });
    expect(plugin.description).toContain('trusted');
  });

  it('has exactly one action', () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust() });
    expect(plugin.actions).toHaveLength(1);
    expect(plugin.actions![0].name).toBe('CHECK_AGENT_TRUST');
  });

  it('has exactly one evaluator', () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust() });
    expect(plugin.evaluators).toHaveLength(1);
    expect(plugin.evaluators![0].name).toBe('TRUST_GUARD');
  });

  it('has exactly one provider', () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust() });
    expect(plugin.providers).toHaveLength(1);
  });

  it('action validates message with embedded address', async () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust() });
    const runtime = { agentId: 'x', character: { name: 'X' } };
    const message = { content: { text: `check ${VALID_ADDR}` } };
    expect(await plugin.actions![0].validate(runtime, message)).toBe(true);
  });

  it('action handler returns true for valid address', async () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust(2) });
    const runtime = { agentId: 'x', character: { name: 'X' } };
    const message = { content: { text: VALID_ADDR } };
    expect(await plugin.actions![0].handler(runtime, message)).toBe(true);
  });

  it('evaluator handler sets state.trustGuardResult', async () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust(2), requiredTier: 'contributor' });
    const runtime = { agentId: 'x', character: { name: 'X' } };
    const message = { content: { text: VALID_ADDR } };
    const state: Record<string, unknown> = {};
    await plugin.evaluators![0].handler(runtime, message, state);
    expect(state.trustGuardResult).toBeDefined();
    expect((state.trustGuardResult as any).passed).toBe(true);
  });

  it('provider returns trust context string', async () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust(2) });
    const runtime = { agentId: 'x', character: { name: 'X' } };
    const message = { content: { text: VALID_ADDR } };
    const result = await plugin.providers![0].get(runtime, message);
    expect(typeof result).toBe('string');
    expect(result).toContain('[Trust Context]');
  });

  it('defaults requiredTier to contributor', () => {
    const plugin = createAgentTrustPlugin({ agentTrust: mockTrust() });
    expect(plugin.description).toContain('contributor');
  });

  it('passes custom addressKey to all components', async () => {
    const trust = mockTrust(2);
    const plugin = createAgentTrustPlugin({
      agentTrust: trust,
      requiredTier: 'contributor',
      addressKey: 'senderWallet',
    });
    const runtime = { agentId: 'x', character: { name: 'X' } };
    const message = { content: { text: '', senderWallet: VALID_ADDR } };
    // Action should validate
    expect(await plugin.actions![0].validate(runtime, message)).toBe(true);
    // Trust should be called with the right address
    await plugin.actions![0].handler(runtime, message);
    expect(trust.getTier).toHaveBeenCalledWith(VALID_ADDR);
  });
});

describe('tier-utils standalone', () => {
  it('tierLevelToName handles out-of-range (fallback to unverified)', async () => {
    const { tierLevelToName } = await import('../src/tier-utils.js');
    expect(tierLevelToName(99)).toBe('unverified');
  });

  it('tierNameToLevel returns -1 for unknown name', async () => {
    const { tierNameToLevel } = await import('../src/tier-utils.js');
    expect(tierNameToLevel('bogus' as any)).toBe(-1);
  });

  it('isValidAddress rejects non-string', async () => {
    const { isValidAddress } = await import('../src/tier-utils.js');
    expect(isValidAddress(123)).toBe(false);
    expect(isValidAddress(null)).toBe(false);
    expect(isValidAddress(undefined)).toBe(false);
  });

  it('isValidAddress rejects short hex', async () => {
    const { isValidAddress } = await import('../src/tier-utils.js');
    expect(isValidAddress('0x123')).toBe(false);
  });

  it('isValidAddress accepts checksummed address', async () => {
    const { isValidAddress } = await import('../src/tier-utils.js');
    expect(isValidAddress('0xAbCd' + 'e'.repeat(36))).toBe(true);
  });

  it('extractScore handles plain number', async () => {
    const { extractScore } = await import('../src/tier-utils.js');
    expect(extractScore(88)).toBe(88);
  });

  it('extractScore handles object', async () => {
    const { extractScore } = await import('../src/tier-utils.js');
    expect(extractScore({ score: 42 })).toBe(42);
  });

  it('extractTierLevel handles plain number', async () => {
    const { extractTierLevel } = await import('../src/tier-utils.js');
    expect(extractTierLevel(3)).toBe(3);
  });

  it('extractTierLevel handles object', async () => {
    const { extractTierLevel } = await import('../src/tier-utils.js');
    expect(extractTierLevel({ tier: 2 })).toBe(2);
  });
});
