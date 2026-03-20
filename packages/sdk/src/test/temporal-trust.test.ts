/**
 * Tests for temporal-trust.ts
 *
 * Covers:
 * - Exponential, linear, and step decay types
 * - Grace period boundary conditions
 * - Trust velocity computation
 * - Score floor enforcement
 * - Config defaults and overrides
 * - Sybil farming velocity signal
 * - Tier-floor mechanics under rapid decay
 * - Null/unknown attestation history
 */

import { describe, expect, it } from 'vitest';
import {
  evaluateTemporalTrust,
  computeTrustVelocity,
  VouchEvent,
} from '../temporal-trust';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const NOW_MS = 1742476800000; // 2025-03-20T08:00:00Z (deterministic)
const DAY_MS = 24 * 60 * 60 * 1000;

/** Return a unix timestamp (seconds) N days before NOW_MS */
function daysAgo(days: number): number {
  return Math.floor((NOW_MS - days * DAY_MS) / 1000);
}

/** Build a vouch event N days ago */
function vouch(daysAgo_: number, trustLevel = 3, revoked = false): VouchEvent {
  return {
    timestamp: daysAgo(daysAgo_),
    trustLevel,
    revoked,
  };
}

// ─── Grace Period ─────────────────────────────────────────────────────────────

describe('grace period', () => {
  it('no decay within grace period', () => {
    const result = evaluateTemporalTrust(75, daysAgo(15), [], {}, NOW_MS);
    expect(result.withinGracePeriod).toBe(true);
    expect(result.decayMultiplier).toBe(1.0);
    expect(result.adjustedScore).toBe(75);
  });

  it('no decay at 29 days (within 30-day grace)', () => {
    const almostExpired = daysAgo(29); // 29 days — still within 30-day grace
    const result = evaluateTemporalTrust(80, almostExpired, [], { gracePeriodDays: 30 }, NOW_MS);
    expect(result.withinGracePeriod).toBe(true);
    expect(result.adjustedScore).toBe(80);
  });

  it('decay begins exactly at grace period boundary (30 days)', () => {
    // 30 days elapsed >= gracePeriodDays (30) → decay begins
    const result = evaluateTemporalTrust(80, daysAgo(30), [], { gracePeriodDays: 30 }, NOW_MS);
    // 0 days over grace → daysOverGrace=0 → e^0 = 1.0, but withinGracePeriod=false
    expect(result.withinGracePeriod).toBe(false);
    expect(result.decayMultiplier).toBeCloseTo(1.0, 4); // e^(-0.02*0) = 1
    expect(result.adjustedScore).toBe(80); // score unchanged at exact boundary
  });

  it('decay reduces score after grace period expires (31 days)', () => {
    const result = evaluateTemporalTrust(80, daysAgo(31), [], { gracePeriodDays: 30 }, NOW_MS);
    expect(result.withinGracePeriod).toBe(false);
    expect(result.decayMultiplier).toBeLessThan(1.0);
    expect(result.adjustedScore).toBeLessThan(80);
  });

  it('custom grace period of 60 days — no decay at 50 days', () => {
    const result = evaluateTemporalTrust(70, daysAgo(50), [], { gracePeriodDays: 60 }, NOW_MS);
    expect(result.withinGracePeriod).toBe(true);
    expect(result.adjustedScore).toBe(70);
  });
});

// ─── Exponential Decay ────────────────────────────────────────────────────────

describe('exponential decay', () => {
  it('λ=0.02, 30 days over grace → ~55% remaining', () => {
    // e^(-0.02 * 30) ≈ 0.549
    const result = evaluateTemporalTrust(
      100,
      daysAgo(60), // 30 days over grace
      [],
      { decayType: 'exponential', lambda: 0.02, gracePeriodDays: 30 },
      NOW_MS,
    );
    expect(result.decayMultiplier).toBeCloseTo(0.549, 2);
    expect(result.adjustedScore).toBeCloseTo(54.9, 0);
  });

  it('λ=0.02, exactly at grace boundary → multiplier = 1.0 (daysOverGrace=0)', () => {
    const result = evaluateTemporalTrust(
      100,
      daysAgo(30), // 30 days elapsed = exactly at grace boundary, daysOverGrace=0
      [],
      { decayType: 'exponential', lambda: 0.02, gracePeriodDays: 30 },
      NOW_MS,
    );
    // withinGracePeriod is false (elapsed >= grace), but decay = e^(-λ*0) = 1.0
    expect(result.withinGracePeriod).toBe(false);
    expect(result.decayMultiplier).toBeCloseTo(1.0, 4);
  });

  it('λ=0.02, 90 days over grace → ~17% remaining', () => {
    // e^(-0.02 * 90) ≈ 0.165
    const result = evaluateTemporalTrust(
      100,
      daysAgo(120),
      [],
      { decayType: 'exponential', lambda: 0.02, gracePeriodDays: 30 },
      NOW_MS,
    );
    expect(result.decayMultiplier).toBeCloseTo(0.165, 2);
  });

  it('aggressive λ=0.1 loses 90%+ after 30 days over grace', () => {
    const result = evaluateTemporalTrust(
      100,
      daysAgo(60),
      [],
      { decayType: 'exponential', lambda: 0.1, gracePeriodDays: 30 },
      NOW_MS,
    );
    // e^(-0.1 * 30) ≈ 0.050
    expect(result.decayMultiplier).toBeCloseTo(0.050, 2);
  });

  it('score never goes below zero', () => {
    const result = evaluateTemporalTrust(
      10,
      daysAgo(500),
      [],
      { decayType: 'exponential', lambda: 0.1, gracePeriodDays: 0 },
      NOW_MS,
    );
    expect(result.adjustedScore).toBeGreaterThanOrEqual(0);
  });
});

// ─── Linear Decay ─────────────────────────────────────────────────────────────

describe('linear decay', () => {
  it('λ=0.02, 25 days over grace → 50% remaining', () => {
    // 1 - 0.02 * 25 = 0.50
    const result = evaluateTemporalTrust(
      100,
      daysAgo(55),
      [],
      { decayType: 'linear', lambda: 0.02, gracePeriodDays: 30 },
      NOW_MS,
    );
    expect(result.decayMultiplier).toBeCloseTo(0.50, 2);
    expect(result.adjustedScore).toBeCloseTo(50, 0);
  });

  it('linear decay does not go below 0 (floors at 0)', () => {
    const result = evaluateTemporalTrust(
      100,
      daysAgo(200),
      [],
      { decayType: 'linear', lambda: 0.02, gracePeriodDays: 30 },
      NOW_MS,
    );
    expect(result.decayMultiplier).toBe(0);
    expect(result.adjustedScore).toBe(0);
  });
});

// ─── Step Decay ───────────────────────────────────────────────────────────────

describe('step decay', () => {
  it('no step drop within first step period', () => {
    const result = evaluateTemporalTrust(
      80,
      daysAgo(89), // 59 days over 30-day grace = 59 days < 90-day step period
      [],
      { decayType: 'step', stepSize: 10, stepPeriodDays: 90, gracePeriodDays: 30 },
      NOW_MS,
    );
    expect(result.adjustedScore).toBe(80);
  });

  it('one step drop after first step period', () => {
    const result = evaluateTemporalTrust(
      80,
      daysAgo(121), // 91 days over grace → 1 step drop
      [],
      { decayType: 'step', stepSize: 10, stepPeriodDays: 90, gracePeriodDays: 30 },
      NOW_MS,
    );
    // 80 - 10 = 70
    expect(result.adjustedScore).toBe(70);
  });

  it('two step drops after two step periods', () => {
    const result = evaluateTemporalTrust(
      80,
      daysAgo(211), // 181 days over grace → 2 step drops
      [],
      { decayType: 'step', stepSize: 10, stepPeriodDays: 90, gracePeriodDays: 30 },
      NOW_MS,
    );
    // 80 - 20 = 60
    expect(result.adjustedScore).toBe(60);
  });

  it('step decay respects score floor', () => {
    const result = evaluateTemporalTrust(
      20,
      daysAgo(500),
      [],
      { decayType: 'step', stepSize: 10, stepPeriodDays: 90, gracePeriodDays: 30, scoreFloor: 10 },
      NOW_MS,
    );
    expect(result.adjustedScore).toBeGreaterThanOrEqual(10);
  });
});

// ─── Score Floor ─────────────────────────────────────────────────────────────

describe('score floor enforcement', () => {
  it('decayed score is bounded by scoreFloor', () => {
    const result = evaluateTemporalTrust(
      50,
      daysAgo(500),
      [],
      { decayType: 'exponential', lambda: 0.1, gracePeriodDays: 0, scoreFloor: 20 },
      NOW_MS,
    );
    expect(result.adjustedScore).toBeGreaterThanOrEqual(20);
  });

  it('scoreFloor=0 is the default (no artificial floor)', () => {
    const result = evaluateTemporalTrust(
      100,
      daysAgo(1000),
      [],
      { decayType: 'exponential', lambda: 0.1, gracePeriodDays: 0 },
      NOW_MS,
    );
    // Very low but above 0
    expect(result.adjustedScore).toBeGreaterThanOrEqual(0);
    expect(result.adjustedScore).toBeLessThan(1);
  });
});

// ─── No Attestation History ────────────────────────────────────────────────────

describe('null attestation history', () => {
  it('no decay when lastPositiveAttestationTime is null', () => {
    const result = evaluateTemporalTrust(60, null, [], {}, NOW_MS);
    expect(result.withinGracePeriod).toBe(true);
    expect(result.decayMultiplier).toBe(1.0);
    expect(result.adjustedScore).toBe(60);
    expect(result.daysSinceLastAttestation).toBeNull();
  });
});

// ─── Trust Velocity ───────────────────────────────────────────────────────────

describe('trust velocity', () => {
  it('zero velocity with no vouches', () => {
    const velocity = computeTrustVelocity([], 7, NOW_MS);
    expect(velocity).toBe(0);
  });

  it('zero velocity when all vouches are outside the window', () => {
    const oldVouches = [vouch(30), vouch(20), vouch(15)]; // all outside 7-day window
    const velocity = computeTrustVelocity(oldVouches, 7, NOW_MS);
    expect(velocity).toBe(0);
  });

  it('positive velocity with recent vouches', () => {
    const recentVouches = [vouch(1, 3), vouch(2, 4), vouch(3, 5)];
    const velocity = computeTrustVelocity(recentVouches, 7, NOW_MS);
    // (3+4+5) / 7 = 1.71...
    expect(velocity).toBeCloseTo((3 + 4 + 5) / 7, 2);
  });

  it('negative velocity when recent vouches are revoked', () => {
    const revokedVouches = [
      vouch(1, 3, true),  // revoked = negative
      vouch(2, 5, true),  // revoked = negative
    ];
    const velocity = computeTrustVelocity(revokedVouches, 7, NOW_MS);
    // -(3+5) / 7 = -1.14
    expect(velocity).toBeCloseTo(-(3 + 5) / 7, 2);
  });

  it('Sybil farming signal: high velocity in short window', () => {
    // 15 vouches in 2 days = suspicious
    const fastVouches = Array.from({ length: 15 }, (_, i) =>
      vouch(i < 7 ? 1 : 2, 3),
    );
    const velocity = computeTrustVelocity(fastVouches, 7, NOW_MS);
    // 15 * 3 / 7 ≈ 6.4 — above 5/day threshold from issue discussion
    expect(velocity).toBeGreaterThan(5);
  });

  it('healthy organic velocity: slow accumulation below threshold', () => {
    // 10 vouches over 30 days = healthy
    const organicVouches = Array.from({ length: 10 }, (_, i) =>
      vouch(i * 3, 3), // spread over 0–27 days
    );
    const velocity = computeTrustVelocity(organicVouches, 30, NOW_MS);
    // Most within window: 10 * 3 / 30 = 1.0/day
    expect(velocity).toBeLessThanOrEqual(5);
    expect(velocity).toBeGreaterThan(0);
  });

  it('velocity is available in evaluateTemporalTrust result', () => {
    const vouches = [vouch(1, 3), vouch(2, 4)];
    const result = evaluateTemporalTrust(75, daysAgo(10), vouches, {}, NOW_MS);
    expect(result.trustVelocity).toBeCloseTo((3 + 4) / 7, 2);
  });
});

// ─── Raw Score Clamping ────────────────────────────────────────────────────────

describe('raw score clamping', () => {
  it('clamps raw score above 100 to 100', () => {
    const result = evaluateTemporalTrust(150, daysAgo(5), [], {}, NOW_MS);
    expect(result.rawScore).toBe(100);
  });

  it('clamps negative raw score to 0', () => {
    const result = evaluateTemporalTrust(-10, daysAgo(5), [], {}, NOW_MS);
    expect(result.rawScore).toBe(0);
    expect(result.adjustedScore).toBe(0);
  });
});

// ─── Config Defaults ─────────────────────────────────────────────────────────

describe('config defaults', () => {
  it('returns default config in result', () => {
    const result = evaluateTemporalTrust(80, daysAgo(10), [], {}, NOW_MS);
    expect(result.config.decayType).toBe('exponential');
    expect(result.config.lambda).toBe(0.02);
    expect(result.config.gracePeriodDays).toBe(30);
    expect(result.config.scoreFloor).toBe(0);
    expect(result.config.velocityWindowDays).toBe(7);
  });

  it('partial config overrides merge with defaults', () => {
    const result = evaluateTemporalTrust(80, daysAgo(10), [], { lambda: 0.03 }, NOW_MS);
    expect(result.config.lambda).toBe(0.03);
    expect(result.config.decayType).toBe('exponential'); // default preserved
  });
});

// ─── daysSinceLastAttestation ─────────────────────────────────────────────────

describe('daysSinceLastAttestation', () => {
  it('reports correct days since attestation', () => {
    const result = evaluateTemporalTrust(75, daysAgo(45), [], {}, NOW_MS);
    expect(result.daysSinceLastAttestation).toBeCloseTo(45, 0);
  });

  it('zero days for very recent attestation', () => {
    const justNow = Math.floor(NOW_MS / 1000) - 60; // 60 seconds ago
    const result = evaluateTemporalTrust(75, justNow, [], {}, NOW_MS);
    expect(result.daysSinceLastAttestation).toBeCloseTo(0, 2);
    expect(result.withinGracePeriod).toBe(true);
  });
});
