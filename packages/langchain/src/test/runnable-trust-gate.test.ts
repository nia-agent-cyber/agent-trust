/**
 * Tests for RunnableTrustGate
 */

import { describe, it, expect, vi } from 'vitest';
import { RunnableTrustGate } from '../runnable-trust-gate.js';
import { TrustCheckFailedError } from '../types.js';
import type { AgentTrustLike } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMock(tier: number, score: number): AgentTrustLike {
  return {
    getTier: vi.fn().mockResolvedValue({ tier, name: 'n/a' }),
    getScore: vi.fn().mockResolvedValue({ score }),
  };
}

const AGENT = '0xDeadBeef0000000000000000000000000000DEAD';

// ---------------------------------------------------------------------------
// Basic invoke behaviour
// ---------------------------------------------------------------------------

describe('RunnableTrustGate', () => {
  describe('invoke — pass cases', () => {
    it('returns the input unchanged when trust check passes', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'bronze',
        agentTrust: makeMock(1, 40), // bronze
      });
      const input = { task: 'send-eth', amount: 100 };
      const output = await gate.invoke(input);
      expect(output).toEqual(input);
    });

    it('passes a string input through unchanged', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'bronze',
        agentTrust: makeMock(2, 60),
      });
      const output = await gate.invoke('hello world');
      expect(output).toBe('hello world');
    });

    it('passes a number input through unchanged', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'unverified',
        agentTrust: makeMock(0, 0),
      });
      const output = await gate.invoke(42);
      expect(output).toBe(42);
    });

    it('passes null input through unchanged', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'unverified',
        agentTrust: makeMock(0, 0),
      });
      const output = await gate.invoke(null);
      expect(output).toBeNull();
    });

    it('passes with platinum for any minTier', async () => {
      for (const minTier of ['unverified', 'bronze', 'silver', 'gold', 'platinum'] as const) {
        const gate = new RunnableTrustGate({
          agentAddress: AGENT,
          minTier,
          agentTrust: makeMock(4, 99),
        });
        const output = await gate.invoke({ x: 1 });
        expect(output).toEqual({ x: 1 });
      }
    });
  });

  describe('invoke — fail cases', () => {
    it('throws TrustCheckFailedError when tier is below minimum', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'gold',
        agentTrust: makeMock(1, 30), // bronze
      });
      await expect(gate.invoke({ x: 1 })).rejects.toThrow(TrustCheckFailedError);
    });

    it('throws for unverified when minTier is bronze', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'bronze',
        agentTrust: makeMock(0, 0), // unverified
      });
      await expect(gate.invoke('anything')).rejects.toThrow(TrustCheckFailedError);
    });

    it('error contains the agent address', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'platinum',
        agentTrust: makeMock(0, 0),
      });
      try {
        await gate.invoke({});
        expect.fail('should have thrown');
      } catch (err) {
        expect((err as TrustCheckFailedError).address).toBe(AGENT);
      }
    });

    it('error contains actual tier and required tier', async () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'platinum',
        agentTrust: makeMock(1, 30), // bronze
      });
      try {
        await gate.invoke({});
        expect.fail('should have thrown');
      } catch (err) {
        const e = err as TrustCheckFailedError;
        expect(e.tier).toBe('bronze');
        expect(e.requiredTier).toBe('platinum');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Constructor configuration
  // ---------------------------------------------------------------------------

  describe('configuration', () => {
    it('getAgentAddress() returns the configured address', () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'silver',
        agentTrust: makeMock(2, 60),
      });
      expect(gate.getAgentAddress()).toBe(AGENT);
    });

    it('getMinTier() returns the configured minTier', () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'gold',
        agentTrust: makeMock(3, 80),
      });
      expect(gate.getMinTier()).toBe('gold');
    });

    it('defaults minTier to "bronze" when not provided', () => {
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        agentTrust: makeMock(1, 30),
      });
      expect(gate.getMinTier()).toBe('bronze');
    });
  });

  // ---------------------------------------------------------------------------
  // .pipe() chaining
  // ---------------------------------------------------------------------------

  describe('chaining with .pipe()', () => {
    it('can be piped into another runnable', async () => {
      const { RunnableLambda } = await import('@langchain/core/runnables');
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'bronze',
        agentTrust: makeMock(2, 60), // silver — passes
      });
      const nextStep = RunnableLambda.from((input: unknown) => ({ processed: true, input }));
      const chain = gate.pipe(nextStep);
      const output = await chain.invoke({ query: 'test' });
      expect(output).toEqual({ processed: true, input: { query: 'test' } });
    });

    it('chain throws TrustCheckFailedError before reaching next step', async () => {
      const { RunnableLambda } = await import('@langchain/core/runnables');
      const nextStepFn = vi.fn().mockResolvedValue({ processed: true });
      const gate = new RunnableTrustGate({
        agentAddress: AGENT,
        minTier: 'platinum',
        agentTrust: makeMock(0, 0), // unverified — fails
      });
      const chain = gate.pipe(RunnableLambda.from(nextStepFn));
      await expect(chain.invoke({ query: 'test' })).rejects.toThrow(TrustCheckFailedError);
      // Next step should NOT have been called
      expect(nextStepFn).not.toHaveBeenCalled();
    });
  });
});
