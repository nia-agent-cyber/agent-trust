import { describe, it, expect, vi } from 'vitest';
import { createTrustGuardEvaluator } from '../src/trust-evaluator.js';
import type { AgentTrustLike } from '../src/types.js';
import type { IAgentRuntime, Memory, State } from '../src/eliza-types.js';

const VALID_ADDR = '0x' + 'b'.repeat(40);
const ZERO_ADDR = '0x' + '0'.repeat(40);

function mockRuntime(): IAgentRuntime {
  return { agentId: 'eval-agent', character: { name: 'Eval' } };
}

function mockMessage(text = '', extra: Record<string, unknown> = {}): Memory {
  return { content: { text, ...extra } };
}

function mockTrust(tier = 2): AgentTrustLike {
  return {
    getTier: vi.fn().mockResolvedValue({ tier }),
    getScore: vi.fn().mockResolvedValue({ score: 60 }),
  };
}

describe('createTrustGuardEvaluator — metadata', () => {
  it('uses default name TRUST_GUARD', () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(), requiredTier: 'contributor' });
    expect(ev.name).toBe('TRUST_GUARD');
  });

  it('accepts custom name', () => {
    const ev = createTrustGuardEvaluator({
      agentTrust: mockTrust(),
      requiredTier: 'contributor',
      name: 'MY_GUARD',
    });
    expect(ev.name).toBe('MY_GUARD');
  });

  it('has description mentioning requiredTier', () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(), requiredTier: 'trusted' });
    expect(ev.description).toContain('trusted');
  });

  it('alwaysRun is false', () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(), requiredTier: 'contributor' });
    expect(ev.alwaysRun).toBe(false);
  });
});

describe('createTrustGuardEvaluator — validate', () => {
  it('returns true for message with valid address', async () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(), requiredTier: 'contributor' });
    expect(await ev.validate(mockRuntime(), mockMessage(VALID_ADDR))).toBe(true);
  });

  it('returns false for message with no address', async () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(), requiredTier: 'contributor' });
    expect(await ev.validate(mockRuntime(), mockMessage('no address'))).toBe(false);
  });

  it('returns false for zero address', async () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(), requiredTier: 'contributor' });
    expect(await ev.validate(mockRuntime(), mockMessage(ZERO_ADDR))).toBe(false);
  });

  it('reads address from custom addressKey', async () => {
    const ev = createTrustGuardEvaluator({
      agentTrust: mockTrust(),
      requiredTier: 'contributor',
      addressKey: 'sender',
    });
    const msg = mockMessage('', { sender: VALID_ADDR });
    expect(await ev.validate(mockRuntime(), msg)).toBe(true);
  });
});

describe('createTrustGuardEvaluator — handler', () => {
  it('sets state.trustGuardResult.passed = true when tier met', async () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(2), requiredTier: 'contributor' });
    const state: State = {};
    await ev.handler(mockRuntime(), mockMessage(VALID_ADDR), state);
    expect(state.trustGuardResult.passed).toBe(true);
    expect(state.trustGuardResult.address).toBe(VALID_ADDR);
    expect(state.trustGuardResult.tier.name).toBe('trusted');
    expect(state.trustGuardResult.requiredTier).toBe('contributor');
  });

  it('sets state.trustGuardResult.passed = false when tier not met', async () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(0), requiredTier: 'trusted' });
    const state: State = {};
    await ev.handler(mockRuntime(), mockMessage(VALID_ADDR), state);
    expect(state.trustGuardResult.passed).toBe(false);
    expect(state.trustGuardResult.tier.name).toBe('unverified');
  });

  it('sets error when no address found', async () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(), requiredTier: 'contributor' });
    const state: State = {};
    await ev.handler(mockRuntime(), mockMessage('no addr'), state);
    expect(state.trustGuardResult.passed).toBe(false);
    expect(state.trustGuardResult.error).toBeDefined();
  });

  it('sets error when getTier rejects', async () => {
    const trust: AgentTrustLike = {
      getTier: vi.fn().mockRejectedValue(new Error('network down')),
      getScore: vi.fn().mockResolvedValue({ score: 0 }),
    };
    const ev = createTrustGuardEvaluator({ agentTrust: trust, requiredTier: 'contributor' });
    const state: State = {};
    await ev.handler(mockRuntime(), mockMessage(VALID_ADDR), state);
    expect(state.trustGuardResult.passed).toBe(false);
    expect(state.trustGuardResult.error).toContain('network down');
  });

  it('does not throw when state is undefined', async () => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(2), requiredTier: 'contributor' });
    await expect(ev.handler(mockRuntime(), mockMessage(VALID_ADDR))).resolves.toBeUndefined();
  });

  it('calls getTier with the correct address', async () => {
    const trust = mockTrust(1);
    const ev = createTrustGuardEvaluator({ agentTrust: trust, requiredTier: 'contributor' });
    await ev.handler(mockRuntime(), mockMessage(VALID_ADDR), {});
    expect(trust.getTier).toHaveBeenCalledWith(VALID_ADDR);
  });

  it.each([
    [0, 'unverified'],
    [1, 'contributor'],
    [2, 'trusted'],
    [3, 'verified'],
    [4, 'expert'],
  ])('tier level %i maps to name %s in state', async (level, name) => {
    const ev = createTrustGuardEvaluator({ agentTrust: mockTrust(level), requiredTier: 'unverified' });
    const state: State = {};
    await ev.handler(mockRuntime(), mockMessage(VALID_ADDR), state);
    expect(state.trustGuardResult.tier.name).toBe(name);
  });

  it('all 5x5 tier combos set passed correctly', async () => {
    const tiers = [0, 1, 2, 3, 4];
    const names = ['unverified', 'contributor', 'trusted', 'verified', 'expert'] as const;
    for (const actualLevel of tiers) {
      for (const reqLevel of tiers) {
        const ev = createTrustGuardEvaluator({
          agentTrust: mockTrust(actualLevel),
          requiredTier: names[reqLevel],
        });
        const state: State = {};
        await ev.handler(mockRuntime(), mockMessage(VALID_ADDR), state);
        const expected = actualLevel >= reqLevel;
        expect(state.trustGuardResult.passed).toBe(expected);
      }
    }
  });
});
