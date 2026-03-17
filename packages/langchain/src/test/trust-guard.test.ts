/**
 * Tests for TrustGuard
 */

import { describe, it, expect, vi } from 'vitest';
import { TrustGuard } from '../trust-guard.js';
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

const ADDR = '0xaBcDef1234567890AbcDEF1234567890abCDeF12';

// ---------------------------------------------------------------------------
// Instance method: guard.check()
// ---------------------------------------------------------------------------

describe('TrustGuard (instance)', () => {
  it('returns result when agent tier meets the minimum', async () => {
    const guard = new TrustGuard(makeMock(2, 65)); // silver
    const result = await guard.check(ADDR, { minTier: 'silver' });
    expect(result.passed).toBe(true);
    expect(result.tier).toBe('silver');
  });

  it('returns result when agent tier exceeds the minimum', async () => {
    const guard = new TrustGuard(makeMock(4, 95)); // platinum
    const result = await guard.check(ADDR, { minTier: 'bronze' });
    expect(result.passed).toBe(true);
    expect(result.tier).toBe('platinum');
  });

  it('throws TrustCheckFailedError when tier is below minimum', async () => {
    const guard = new TrustGuard(makeMock(0, 0)); // unverified
    await expect(guard.check(ADDR, { minTier: 'bronze' })).rejects.toThrow(TrustCheckFailedError);
  });

  it('defaults minTier to "bronze"', async () => {
    const guard = new TrustGuard(makeMock(0, 0)); // unverified
    await expect(guard.check(ADDR)).rejects.toThrow(TrustCheckFailedError);
  });

  it('passes with unverified when minTier is "unverified"', async () => {
    const guard = new TrustGuard(makeMock(0, 0)); // unverified
    const result = await guard.check(ADDR, { minTier: 'unverified' });
    expect(result.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Static method: TrustGuard.check()
// ---------------------------------------------------------------------------

describe('TrustGuard.check() (static)', () => {
  it('returns result when tier meets the minimum', async () => {
    const mock = makeMock(3, 80); // gold
    const result = await TrustGuard.check(mock, ADDR, { minTier: 'silver' });
    expect(result.passed).toBe(true);
    expect(result.tier).toBe('gold');
  });

  it('throws TrustCheckFailedError when tier is below minimum', async () => {
    const mock = makeMock(1, 40); // bronze
    await expect(TrustGuard.check(mock, ADDR, { minTier: 'gold' })).rejects.toThrow(
      TrustCheckFailedError,
    );
  });

  it('defaults minTier to "bronze"', async () => {
    const mock = makeMock(1, 40); // bronze — passes default
    const result = await TrustGuard.check(mock, ADDR);
    expect(result.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TrustCheckFailedError
// ---------------------------------------------------------------------------

describe('TrustCheckFailedError', () => {
  it('is an instance of Error', async () => {
    const mock = makeMock(0, 0); // unverified
    const guard = new TrustGuard(mock);
    try {
      await guard.check(ADDR, { minTier: 'gold' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err instanceof Error).toBe(true);
    }
  });

  it('is an instance of TrustCheckFailedError', async () => {
    const mock = makeMock(0, 0); // unverified
    const guard = new TrustGuard(mock);
    try {
      await guard.check(ADDR, { minTier: 'gold' });
      expect.fail('should have thrown');
    } catch (err) {
      expect(err instanceof TrustCheckFailedError).toBe(true);
    }
  });

  it('has correct .address property', async () => {
    const mock = makeMock(0, 0);
    const guard = new TrustGuard(mock);
    try {
      await guard.check(ADDR, { minTier: 'bronze' });
      expect.fail('should have thrown');
    } catch (err) {
      expect((err as TrustCheckFailedError).address).toBe(ADDR);
    }
  });

  it('has correct .tier property', async () => {
    const mock = makeMock(1, 30); // bronze
    const guard = new TrustGuard(mock);
    try {
      await guard.check(ADDR, { minTier: 'platinum' });
      expect.fail('should have thrown');
    } catch (err) {
      expect((err as TrustCheckFailedError).tier).toBe('bronze');
    }
  });

  it('has correct .requiredTier property', async () => {
    const mock = makeMock(1, 30); // bronze
    const guard = new TrustGuard(mock);
    try {
      await guard.check(ADDR, { minTier: 'platinum' });
      expect.fail('should have thrown');
    } catch (err) {
      expect((err as TrustCheckFailedError).requiredTier).toBe('platinum');
    }
  });

  it('has a descriptive error message', async () => {
    const mock = makeMock(1, 30); // bronze
    const guard = new TrustGuard(mock);
    try {
      await guard.check(ADDR, { minTier: 'gold' });
      expect.fail('should have thrown');
    } catch (err) {
      const e = err as TrustCheckFailedError;
      expect(e.message).toContain(ADDR);
      expect(e.message).toContain('bronze');
      expect(e.message).toContain('gold');
    }
  });

  it('has name "TrustCheckFailedError"', async () => {
    const mock = makeMock(0, 0);
    const guard = new TrustGuard(mock);
    try {
      await guard.check(ADDR, { minTier: 'bronze' });
      expect.fail('should have thrown');
    } catch (err) {
      expect((err as TrustCheckFailedError).name).toBe('TrustCheckFailedError');
    }
  });

  it('can be constructed directly with correct fields', () => {
    const err = new TrustCheckFailedError(ADDR, 'bronze', 'gold');
    expect(err.address).toBe(ADDR);
    expect(err.tier).toBe('bronze');
    expect(err.requiredTier).toBe('gold');
    expect(err.message).toContain('bronze');
    expect(err.message).toContain('gold');
    expect(err instanceof TrustCheckFailedError).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tier ordering
// ---------------------------------------------------------------------------

describe('tier ordering', () => {
  const tiers = ['unverified', 'bronze', 'silver', 'gold', 'platinum'] as const;

  for (let i = 0; i < tiers.length; i++) {
    for (let j = i + 1; j < tiers.length; j++) {
      const agentTier = tiers[i];
      const requiredTier = tiers[j];
      it(`tier '${agentTier}' does NOT meet '${requiredTier}'`, async () => {
        const mock = makeMock(i, i * 20);
        const guard = new TrustGuard(mock);
        await expect(guard.check(ADDR, { minTier: requiredTier })).rejects.toThrow(
          TrustCheckFailedError,
        );
      });
    }
  }
});
