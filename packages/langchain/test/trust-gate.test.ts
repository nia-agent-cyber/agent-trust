import { describe, it, expect, vi } from 'vitest';
import { TrustGate, TrustGateError } from '../src/trust-gate.js';
import { TrustGateConfig, AgentTrustLike, TierName } from '../src/types.js';

const VALID_ADDR = '0x' + 'b'.repeat(40);
const ZERO_ADDR = '0x' + '0'.repeat(40);

function makeMockTrust(tier = 1): AgentTrustLike {
  return {
    getTier: vi.fn().mockResolvedValue({ tier }),
    getScore: vi.fn().mockResolvedValue({ score: 50 }),
  };
}

function makeGate(opts: Partial<TrustGateConfig> = {}): TrustGate {
  return new TrustGate({
    agentTrust: makeMockTrust(2),
    requiredTier: 'contributor',
    ...opts,
  });
}

describe('TrustGate', () => {
  describe('pass-through when tier met', () => {
    it('returns state unchanged when tier meets required', async () => {
      const gate = makeGate({ agentTrust: makeMockTrust(2), requiredTier: 'contributor' });
      const state = { address: VALID_ADDR, payload: 'hello' };
      const result = await gate.invoke(state);
      expect(result).toEqual(state);
    });

    it('passes when tier exactly equals required', async () => {
      const gate = makeGate({ agentTrust: makeMockTrust(1), requiredTier: 'contributor' });
      const state = { address: VALID_ADDR };
      const result = await gate.invoke(state);
      expect(result).toEqual(state);
    });

    it('passes for unverified when required is unverified', async () => {
      const gate = makeGate({ agentTrust: makeMockTrust(0), requiredTier: 'unverified' });
      const result = await gate.invoke({ address: VALID_ADDR });
      expect(result.address).toBe(VALID_ADDR);
    });

    it('passes for expert when required is trusted', async () => {
      const gate = makeGate({ agentTrust: makeMockTrust(4), requiredTier: 'trusted' });
      const result = await gate.invoke({ address: VALID_ADDR });
      expect(result.address).toBe(VALID_ADDR);
    });
  });

  describe('blocking when tier not met', () => {
    it('throws TrustGateError when tier below required and no onBlocked', async () => {
      const gate = makeGate({ agentTrust: makeMockTrust(0), requiredTier: 'contributor' });
      await expect(gate.invoke({ address: VALID_ADDR })).rejects.toThrow(TrustGateError);
    });

    it('TrustGateError has correct fields', async () => {
      const gate = makeGate({ agentTrust: makeMockTrust(0), requiredTier: 'trusted' });
      let error!: TrustGateError;
      try {
        await gate.invoke({ address: VALID_ADDR });
      } catch (e) {
        error = e as TrustGateError;
      }
      expect(error).toBeInstanceOf(TrustGateError);
      expect(error.address).toBe(VALID_ADDR);
      expect(error.tier).toBe('unverified');
      expect(error.requiredTier).toBe('trusted');
      expect(error.message).toContain('unverified');
      expect(error.message).toContain('trusted');
    });

    it('TrustGateError.name is TrustGateError', async () => {
      const gate = makeGate({ agentTrust: makeMockTrust(0), requiredTier: 'contributor' });
      try {
        await gate.invoke({ address: VALID_ADDR });
      } catch (e: any) {
        expect(e.name).toBe('TrustGateError');
      }
    });
  });

  describe('onBlocked callback', () => {
    it('calls onBlocked instead of throwing when provided', async () => {
      const onBlocked = vi.fn((state) => ({ ...state, blocked: true }));
      const gate = makeGate({
        agentTrust: makeMockTrust(0),
        requiredTier: 'contributor',
        onBlocked,
      });
      const state = { address: VALID_ADDR, payload: 'data' };
      const result = await gate.invoke(state);
      expect(onBlocked).toHaveBeenCalledOnce();
      expect(onBlocked).toHaveBeenCalledWith(state);
      expect(result).toEqual({ ...state, blocked: true });
    });

    it('does not throw when onBlocked provided and tier not met', async () => {
      const gate = makeGate({
        agentTrust: makeMockTrust(0),
        requiredTier: 'expert',
        onBlocked: (s) => s,
      });
      await expect(gate.invoke({ address: VALID_ADDR })).resolves.toBeDefined();
    });

    it('onBlocked receives original state', async () => {
      const captured: Record<string, unknown>[] = [];
      const gate = makeGate({
        agentTrust: makeMockTrust(0),
        requiredTier: 'trusted',
        onBlocked: (s) => { captured.push(s); return s; },
      });
      const state = { address: VALID_ADDR, extra: 42 };
      await gate.invoke(state);
      expect(captured[0]).toEqual(state);
    });
  });

  describe('addressKey configuration', () => {
    it('reads address from custom addressKey', async () => {
      const trust = makeMockTrust(2);
      const gate = new TrustGate({
        agentTrust: trust,
        requiredTier: 'contributor',
        addressKey: 'counterpartyAddress',
      });
      const state = { counterpartyAddress: VALID_ADDR };
      const result = await gate.invoke(state);
      expect(result).toEqual(state);
      expect(trust.getTier).toHaveBeenCalledWith(VALID_ADDR);
    });

    it('defaults addressKey to address', async () => {
      const trust = makeMockTrust(2);
      const gate = new TrustGate({ agentTrust: trust, requiredTier: 'contributor' });
      await gate.invoke({ address: VALID_ADDR });
      expect(trust.getTier).toHaveBeenCalledWith(VALID_ADDR);
    });

    it('blocks when addressKey not present in state (no onBlocked)', async () => {
      const gate = makeGate({ requiredTier: 'contributor' });
      await expect(gate.invoke({ other: 'data' })).rejects.toThrow(TrustGateError);
    });

    it('calls onBlocked when addressKey missing and onBlocked provided', async () => {
      const onBlocked = vi.fn((s) => ({ ...s, blocked: true }));
      const gate = new TrustGate({
        agentTrust: makeMockTrust(2),
        requiredTier: 'contributor',
        onBlocked,
      });
      const state = { wrong_key: VALID_ADDR };
      const result = await gate.invoke(state);
      expect(onBlocked).toHaveBeenCalled();
      expect((result as any).blocked).toBe(true);
    });
  });

  describe('zero-address handling', () => {
    it('blocks zero address', async () => {
      const gate = makeGate({ requiredTier: 'unverified' });
      await expect(gate.invoke({ address: ZERO_ADDR })).rejects.toThrow(TrustGateError);
    });

    it('calls onBlocked for zero address', async () => {
      const onBlocked = vi.fn((s) => s);
      const gate = new TrustGate({
        agentTrust: makeMockTrust(0),
        requiredTier: 'unverified',
        onBlocked,
      });
      await gate.invoke({ address: ZERO_ADDR });
      expect(onBlocked).toHaveBeenCalled();
    });
  });

  describe('pipe composition', () => {
    it('passes gated state to next runnable', async () => {
      const trust = makeMockTrust(2);
      const gate = new TrustGate({ agentTrust: trust, requiredTier: 'contributor' });
      const next = {
        invoke: vi.fn().mockResolvedValue({ processed: true }),
      };
      const chain = gate.pipe(next);
      const result = await chain.invoke({ address: VALID_ADDR });
      expect(next.invoke).toHaveBeenCalledWith({ address: VALID_ADDR });
      expect(result).toEqual({ processed: true });
    });

    it('throws TrustGateError before reaching next in pipe', async () => {
      const trust = makeMockTrust(0);
      const gate = new TrustGate({ agentTrust: trust, requiredTier: 'trusted' });
      const next = { invoke: vi.fn() };
      const chain = gate.pipe(next);
      await expect(chain.invoke({ address: VALID_ADDR })).rejects.toThrow(TrustGateError);
      expect(next.invoke).not.toHaveBeenCalled();
    });
  });

  describe('all tier combinations', () => {
    const tiers: [number, TierName][] = [
      [0, 'unverified'],
      [1, 'contributor'],
      [2, 'trusted'],
      [3, 'verified'],
      [4, 'expert'],
    ];

    const required: TierName[] = ['unverified', 'contributor', 'trusted', 'verified', 'expert'];

    for (const [level, name] of tiers) {
      for (const req of required) {
        const shouldPass = level >= ['unverified', 'contributor', 'trusted', 'verified', 'expert'].indexOf(req);
        it(`tier ${name} (${level}) ${shouldPass ? 'passes' : 'blocks'} required ${req}`, async () => {
          const gate = new TrustGate({
            agentTrust: makeMockTrust(level),
            requiredTier: req,
          });
          if (shouldPass) {
            await expect(gate.invoke({ address: VALID_ADDR })).resolves.toBeDefined();
          } else {
            await expect(gate.invoke({ address: VALID_ADDR })).rejects.toThrow(TrustGateError);
          }
        });
      }
    }
  });
});

describe('createTrustMiddleware', () => {
  it('creates both tool and gate', async () => {
    const { createTrustMiddleware } = await import('../src/middleware.js');
    const { tool, gate } = createTrustMiddleware({
      agentTrust: makeMockTrust(2),
      requiredTier: 'contributor',
    });
    expect(tool).toBeDefined();
    expect(gate).toBeDefined();
    expect(tool.name).toBe('agent_trust_check');
  });

  it('gate uses provided requiredTier', async () => {
    const { createTrustMiddleware } = await import('../src/middleware.js');
    const trust = makeMockTrust(0);
    const { gate } = createTrustMiddleware({ agentTrust: trust, requiredTier: 'expert' });
    await expect(gate.invoke({ address: VALID_ADDR })).rejects.toThrow(TrustGateError);
  });

  it('defaults to contributor tier if not specified', async () => {
    const { createTrustMiddleware } = await import('../src/middleware.js');
    const trust = makeMockTrust(0);
    const { gate } = createTrustMiddleware({ agentTrust: trust });
    await expect(gate.invoke({ address: VALID_ADDR })).rejects.toThrow(TrustGateError);
  });

  it('uses custom addressKey in gate', async () => {
    const { createTrustMiddleware } = await import('../src/middleware.js');
    const trust = makeMockTrust(2);
    const { gate } = createTrustMiddleware({
      agentTrust: trust,
      addressKey: 'walletAddress',
    });
    const result = await gate.invoke({ walletAddress: VALID_ADDR });
    expect(trust.getTier).toHaveBeenCalledWith(VALID_ADDR);
    expect(result).toEqual({ walletAddress: VALID_ADDR });
  });
});
