import { describe, it, expect, vi } from 'vitest';
import { createTrustCheckAction } from '../src/trust-action.js';
import type { AgentTrustLike } from '../src/types.js';
import type { IAgentRuntime, Memory, State } from '../src/eliza-types.js';

const VALID_ADDR = '0x' + 'a'.repeat(40);
const ZERO_ADDR = '0x' + '0'.repeat(40);

function mockRuntime(): IAgentRuntime {
  return { agentId: 'test-agent', character: { name: 'TestAgent' } };
}

function mockMessage(text = '', extra: Record<string, unknown> = {}): Memory {
  return { content: { text, ...extra } };
}

function mockTrust(tier = 2, score = 70): AgentTrustLike {
  return {
    getTier: vi.fn().mockResolvedValue({ tier }),
    getScore: vi.fn().mockResolvedValue({ score }),
  };
}

describe('createTrustCheckAction — metadata', () => {
  it('uses default name CHECK_AGENT_TRUST', () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    expect(action.name).toBe('CHECK_AGENT_TRUST');
  });

  it('accepts custom name', () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(), name: 'MY_TRUST_ACTION' });
    expect(action.name).toBe('MY_TRUST_ACTION');
  });

  it('has similes array', () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    expect(Array.isArray(action.similes)).toBe(true);
    expect(action.similes!.length).toBeGreaterThan(0);
  });

  it('has description', () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    expect(typeof action.description).toBe('string');
    expect(action.description.length).toBeGreaterThan(10);
  });

  it('has examples array', () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    expect(Array.isArray(action.examples)).toBe(true);
  });
});

describe('createTrustCheckAction — validate', () => {
  it('returns true for message with address in text', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    const msg = mockMessage(`Check trust for ${VALID_ADDR}`);
    expect(await action.validate(mockRuntime(), msg)).toBe(true);
  });

  it('returns true for address in content key', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(), addressKey: 'wallet' });
    const msg = mockMessage('any text', { wallet: VALID_ADDR });
    expect(await action.validate(mockRuntime(), msg)).toBe(true);
  });

  it('returns false for message with no address', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    const msg = mockMessage('no address here');
    expect(await action.validate(mockRuntime(), msg)).toBe(false);
  });

  it('returns false for zero address', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    const msg = mockMessage(ZERO_ADDR);
    expect(await action.validate(mockRuntime(), msg)).toBe(false);
  });

  it('returns false for empty message', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    expect(await action.validate(mockRuntime(), mockMessage())).toBe(false);
  });
});

describe('createTrustCheckAction — handler', () => {
  it('calls getTier and getScore for valid address', async () => {
    const trust = mockTrust(2, 70);
    const action = createTrustCheckAction({ agentTrust: trust });
    const msg = mockMessage(`check ${VALID_ADDR}`);
    const cb = vi.fn().mockResolvedValue(undefined);
    await action.handler(mockRuntime(), msg, undefined, undefined, cb);
    expect(trust.getTier).toHaveBeenCalledWith(VALID_ADDR);
    expect(trust.getScore).toHaveBeenCalledWith(VALID_ADDR);
  });

  it('returns true on success', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(2, 70) });
    const msg = mockMessage(`check ${VALID_ADDR}`);
    const result = await action.handler(mockRuntime(), msg);
    expect(result).toBe(true);
  });

  it('returns false when no address found', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust() });
    const result = await action.handler(mockRuntime(), mockMessage('no address'));
    expect(result).toBe(false);
  });

  it('calls callback with tier info on success', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(2, 72) });
    const msg = mockMessage(VALID_ADDR);
    const cb = vi.fn().mockResolvedValue(undefined);
    await action.handler(mockRuntime(), msg, undefined, undefined, cb);
    expect(cb).toHaveBeenCalledOnce();
    const response = cb.mock.calls[0][0];
    expect(response.text).toContain('trusted');
    expect(response.trustCheck.tier.level).toBe(2);
    expect(response.trustCheck.tier.name).toBe('trusted');
  });

  it('callback includes meets when requiredTier configured', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(2, 70), requiredTier: 'contributor' });
    const msg = mockMessage(VALID_ADDR);
    const cb = vi.fn().mockResolvedValue(undefined);
    await action.handler(mockRuntime(), msg, undefined, undefined, cb);
    const response = cb.mock.calls[0][0];
    expect(response.trustCheck.meets).toBe(true);
    expect(response.trustCheck.requiredTier).toBe('contributor');
  });

  it('meets is false when tier below required', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(0, 0), requiredTier: 'trusted' });
    const msg = mockMessage(VALID_ADDR);
    const cb = vi.fn().mockResolvedValue(undefined);
    await action.handler(mockRuntime(), msg, undefined, undefined, cb);
    const response = cb.mock.calls[0][0];
    expect(response.trustCheck.meets).toBe(false);
  });

  it('callback includes error text when getTier fails', async () => {
    const trust: AgentTrustLike = {
      getTier: vi.fn().mockRejectedValue(new Error('rpc error')),
      getScore: vi.fn().mockResolvedValue({ score: 0 }),
    };
    const action = createTrustCheckAction({ agentTrust: trust });
    const msg = mockMessage(VALID_ADDR);
    const cb = vi.fn().mockResolvedValue(undefined);
    const result = await action.handler(mockRuntime(), msg, undefined, undefined, cb);
    expect(result).toBe(false);
    expect(cb.mock.calls[0][0].text).toContain('rpc error');
  });

  it('works without callback (no throw)', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(1, 50) });
    const msg = mockMessage(VALID_ADDR);
    await expect(action.handler(mockRuntime(), msg)).resolves.toBe(true);
  });

  it('reads address from custom addressKey', async () => {
    const trust = mockTrust(3, 90);
    const action = createTrustCheckAction({ agentTrust: trust, addressKey: 'counterparty' });
    const msg = mockMessage('no inline addr', { counterparty: VALID_ADDR });
    const result = await action.handler(mockRuntime(), msg);
    expect(result).toBe(true);
    expect(trust.getTier).toHaveBeenCalledWith(VALID_ADDR);
  });

  it('tier names are correct for all levels', async () => {
    const levels: [number, string][] = [[0,'unverified'],[1,'contributor'],[2,'trusted'],[3,'verified'],[4,'expert']];
    for (const [level, name] of levels) {
      const action = createTrustCheckAction({ agentTrust: mockTrust(level, 50) });
      const cb = vi.fn().mockResolvedValue(undefined);
      await action.handler(mockRuntime(), mockMessage(VALID_ADDR), undefined, undefined, cb);
      expect(cb.mock.calls[0][0].trustCheck.tier.name).toBe(name);
    }
  });
});

describe('createTrustCheckAction — state param', () => {
  it('passes state to handler without error', async () => {
    const action = createTrustCheckAction({ agentTrust: mockTrust(1, 55) });
    const state: State = { extra: 'data' };
    const result = await action.handler(mockRuntime(), mockMessage(VALID_ADDR), state);
    expect(result).toBe(true);
  });
});
