/**
 * Trust Score Unit Tests
 * 
 * Tests for the core trust score calculation algorithm.
 * @see ../scoring/trust-score.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  calculateTrustScore, 
  getDefaultTrustScore,
  VerificationAttestation,
  VouchAttestation,
  FlagAttestation,
  ScoreInputs
} from '../scoring/trust-score';

describe('Trust Score Calculation', () => {
  // ============ Test Fixtures ============
  
  const createVerification = (overrides?: Partial<VerificationAttestation>): VerificationAttestation => ({
    uid: 'ver-' + Math.random().toString(36).slice(2),
    attester: '0x' + 'a'.repeat(40),
    recipient: '0x' + 'b'.repeat(40),
    time: Math.floor(Date.now() / 1000),
    revoked: false,
    platform: 'twitter',
    handle: '@testuser',
    ...overrides
  });

  const createVouch = (overrides?: Partial<VouchAttestation>): VouchAttestation => ({
    uid: 'vouch-' + Math.random().toString(36).slice(2),
    attester: '0x' + 'c'.repeat(40),
    recipient: '0x' + 'b'.repeat(40),
    time: Math.floor(Date.now() / 1000),
    revoked: false,
    trustLevel: 4,
    context: 'Great agent!',
    ...overrides
  });

  const createFlag = (overrides?: Partial<FlagAttestation>): FlagAttestation => ({
    uid: 'flag-' + Math.random().toString(36).slice(2),
    attester: '0x' + 'd'.repeat(40),
    recipient: '0x' + 'b'.repeat(40),
    time: Math.floor(Date.now() / 1000),
    revoked: false,
    severity: 3,
    reason: 'Suspicious behavior',
    ...overrides
  });

  // ============ Basic Score Tests ============

  describe('Basic Score Calculation', () => {
    it('returns default score for no attestations', () => {
      const inputs: ScoreInputs = {
        verifications: [],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.score).toBe(0);
      expect(score.verified).toBe(false);
      expect(score.confidence).toBe(0);
      expect(score.attestationCount).toBe(0);
      expect(score.linkedPlatforms).toEqual([]);
    });

    it('gives base score of 50 for verified agent', () => {
      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.score).toBeGreaterThanOrEqual(50);
      expect(score.verified).toBe(true);
    });

    it('tracks linked platforms from verifications', () => {
      const inputs: ScoreInputs = {
        verifications: [
          createVerification({ platform: 'twitter' }),
          createVerification({ platform: 'github' }),
        ],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.linkedPlatforms).toContain('twitter');
      expect(score.linkedPlatforms).toContain('github');
      expect(score.linkedPlatforms).toHaveLength(2);
    });

    it('deduplicates linked platforms', () => {
      const inputs: ScoreInputs = {
        verifications: [
          createVerification({ platform: 'twitter' }),
          createVerification({ platform: 'twitter', handle: '@different' }),
        ],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.linkedPlatforms).toHaveLength(1);
      expect(score.linkedPlatforms[0]).toBe('twitter');
    });
  });

  // ============ Vouch Tests ============

  describe('Vouch Bonus', () => {
    it('increases score with vouches', () => {
      const baseInputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };
      const baseScore = calculateTrustScore(baseInputs);

      const withVouch: ScoreInputs = {
        ...baseInputs,
        vouches: [createVouch()],
        attesterScores: new Map([['0x' + 'c'.repeat(40), 80]])
      };
      const vouchedScore = calculateTrustScore(withVouch);

      expect(vouchedScore.score).toBeGreaterThan(baseScore.score);
    });

    it('weighs vouches by attester trust score', () => {
      const lowTrustVouch: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch({ attester: '0x' + '1'.repeat(40) })],
        flags: [],
        attesterScores: new Map([['0x' + '1'.repeat(40), 10]]) // Very low trust
      };

      const highTrustVouch: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch({ attester: '0x' + '2'.repeat(40) })],
        flags: [],
        attesterScores: new Map([['0x' + '2'.repeat(40), 100]]) // Max trust
      };

      const lowScore = calculateTrustScore(lowTrustVouch);
      const highScore = calculateTrustScore(highTrustVouch);

      // High trust attester should have more impact
      expect(highScore.score).toBeGreaterThanOrEqual(lowScore.score);
    });

    it('weighs vouches by trust level', () => {
      const lowLevelVouch: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch({ trustLevel: 1, attester: '0x' + '1'.repeat(40) })],
        flags: [],
        attesterScores: new Map([['0x' + '1'.repeat(40), 50]])
      };

      const highLevelVouch: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch({ trustLevel: 5, attester: '0x' + '2'.repeat(40) })],
        flags: [],
        attesterScores: new Map([['0x' + '2'.repeat(40), 50]])
      };

      const lowScore = calculateTrustScore(lowLevelVouch);
      const highScore = calculateTrustScore(highLevelVouch);

      expect(highScore.score).toBeGreaterThan(lowScore.score);
    });

    it('caps vouch bonus at 40 points', () => {
      // Many high-level vouches from high-trust attesters
      const manyVouches = Array(20).fill(null).map((_, i) => 
        createVouch({ 
          uid: `vouch-${i}`, 
          trustLevel: 5, 
          attester: `0x${i.toString().padStart(40, '0')}` 
        })
      );
      
      const attesterScores = new Map(
        manyVouches.map(v => [v.attester, 100])
      );

      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: manyVouches,
        flags: [],
        attesterScores
      };

      const score = calculateTrustScore(inputs);
      
      // Base 50 + max 40 vouch bonus = 90 max
      expect(score.score).toBeLessThanOrEqual(90);
    });
  });

  // ============ Flag Tests ============

  describe('Flag Penalty', () => {
    it('decreases score with flags', () => {
      const baseInputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };
      const baseScore = calculateTrustScore(baseInputs);

      const withFlag: ScoreInputs = {
        ...baseInputs,
        flags: [createFlag()],
        attesterScores: new Map([['0x' + 'd'.repeat(40), 70]])
      };
      const flaggedScore = calculateTrustScore(withFlag);

      expect(flaggedScore.score).toBeLessThan(baseScore.score);
    });

    it('weighs flags by attester trust score', () => {
      const lowTrustFlag: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [createFlag({ attester: '0x' + '1'.repeat(40), severity: 5 })],
        attesterScores: new Map([['0x' + '1'.repeat(40), 10]]) // Very low trust
      };

      const highTrustFlag: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [createFlag({ attester: '0x' + '2'.repeat(40), severity: 5 })],
        attesterScores: new Map([['0x' + '2'.repeat(40), 100]]) // Max trust
      };

      const lowScore = calculateTrustScore(lowTrustFlag);
      const highScore = calculateTrustScore(highTrustFlag);

      // High trust flagger has more impact (lower final score)
      expect(highScore.score).toBeLessThanOrEqual(lowScore.score);
    });

    it('weighs flags by severity', () => {
      const lowSeverityFlag: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [createFlag({ severity: 1, attester: '0x' + '1'.repeat(40) })],
        attesterScores: new Map([['0x' + '1'.repeat(40), 50]])
      };

      const highSeverityFlag: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [createFlag({ severity: 5, attester: '0x' + '2'.repeat(40) })],
        attesterScores: new Map([['0x' + '2'.repeat(40), 50]])
      };

      const lowScore = calculateTrustScore(lowSeverityFlag);
      const highScore = calculateTrustScore(highSeverityFlag);

      // Higher severity = more penalty (lower score)
      expect(highScore.score).toBeLessThan(lowScore.score);
    });

    it('caps flag penalty at 50 points', () => {
      const manyFlags = Array(10).fill(null).map((_, i) => 
        createFlag({ 
          uid: `flag-${i}`, 
          severity: 5, 
          attester: `0x${i.toString().padStart(40, '0')}` 
        })
      );
      
      const attesterScores = new Map(
        manyFlags.map(f => [f.attester, 100])
      );

      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: manyFlags,
        attesterScores
      };

      const score = calculateTrustScore(inputs);
      
      // Base 50 - max 50 flag penalty = 0 min
      expect(score.score).toBeGreaterThanOrEqual(0);
    });
  });

  // ============ Combined Tests ============

  describe('Combined Vouches and Flags', () => {
    it('balances vouches and flags correctly', () => {
      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch({ trustLevel: 4 })],
        flags: [createFlag({ severity: 2 })],
        attesterScores: new Map([
          ['0x' + 'c'.repeat(40), 60],
          ['0x' + 'd'.repeat(40), 60]
        ])
      };

      const score = calculateTrustScore(inputs);
      
      // Should be around base (50) + moderate vouch bonus - moderate flag penalty
      expect(score.score).toBeGreaterThan(30);
      expect(score.score).toBeLessThan(70);
    });

    it('multiple vouches can overcome single flag', () => {
      const vouches = Array(5).fill(null).map((_, i) => 
        createVouch({ 
          uid: `vouch-${i}`, 
          trustLevel: 4, 
          attester: `0x${(i + 10).toString().padStart(40, '0')}` 
        })
      );

      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches,
        flags: [createFlag({ severity: 2 })],
        attesterScores: new Map([
          ...vouches.map(v => [v.attester, 70] as [string, number]),
          ['0x' + 'd'.repeat(40), 50]
        ])
      };

      const score = calculateTrustScore(inputs);
      
      // With enough vouches, should still be above base score
      expect(score.score).toBeGreaterThan(50);
    });
  });

  // ============ Revoked Attestations ============

  describe('Revoked Attestations', () => {
    it('ignores revoked verifications', () => {
      const inputs: ScoreInputs = {
        verifications: [createVerification({ revoked: true })],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.verified).toBe(false);
      expect(score.score).toBe(0);
      expect(score.attestationCount).toBe(0);
    });

    it('ignores revoked vouches', () => {
      const baseInputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch({ revoked: true })],
        flags: [],
        attesterScores: new Map([['0x' + 'c'.repeat(40), 80]])
      };
      const withRevokedVouch = calculateTrustScore(baseInputs);

      const noVouchInputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };
      const noVouch = calculateTrustScore(noVouchInputs);

      // Revoked vouch should have no effect
      expect(Math.abs(withRevokedVouch.score - noVouch.score)).toBeLessThan(0.1);
    });

    it('ignores revoked flags', () => {
      const baseInputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [createFlag({ revoked: true })],
        attesterScores: new Map([['0x' + 'd'.repeat(40), 80]])
      };
      const withRevokedFlag = calculateTrustScore(baseInputs);

      const noFlagInputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };
      const noFlag = calculateTrustScore(noFlagInputs);

      // Revoked flag should have no effect
      expect(Math.abs(withRevokedFlag.score - noFlag.score)).toBeLessThan(0.1);
    });
  });

  // ============ Score Bounds ============

  describe('Score Bounds', () => {
    it('clamps score minimum at 0', () => {
      const manyFlags = Array(10).fill(null).map((_, i) => 
        createFlag({ uid: `flag-${i}`, severity: 5 })
      );

      const inputs: ScoreInputs = {
        verifications: [],
        vouches: [],
        flags: manyFlags,
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.score).toBeGreaterThanOrEqual(0);
    });

    it('clamps score maximum at 100', () => {
      const manyVouches = Array(50).fill(null).map((_, i) => 
        createVouch({ 
          uid: `vouch-${i}`, 
          trustLevel: 5, 
          attester: `0x${i.toString().padStart(40, '0')}` 
        })
      );
      
      const attesterScores = new Map(
        manyVouches.map(v => [v.attester, 100])
      );

      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: manyVouches,
        flags: [],
        attesterScores
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.score).toBeLessThanOrEqual(100);
    });

    it('rounds score to one decimal place', () => {
      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch()],
        flags: [],
        attesterScores: new Map([['0x' + 'c'.repeat(40), 77]])
      };

      const score = calculateTrustScore(inputs);
      
      // Check that score has at most 1 decimal place
      const decimalPlaces = (score.score.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  // ============ Confidence Tests ============

  describe('Confidence Calculation', () => {
    it('has zero confidence with no attestations', () => {
      const inputs: ScoreInputs = {
        verifications: [],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      expect(score.confidence).toBe(0);
    });

    it('increases confidence with verification', () => {
      const withoutVerification: ScoreInputs = {
        verifications: [],
        vouches: [createVouch()],
        flags: [],
        attesterScores: new Map()
      };

      const withVerification: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch()],
        flags: [],
        attesterScores: new Map()
      };

      const noVerifScore = calculateTrustScore(withoutVerification);
      const verifScore = calculateTrustScore(withVerification);

      expect(verifScore.confidence).toBeGreaterThan(noVerifScore.confidence);
    });

    it('increases confidence with more vouches', () => {
      const oneVouch: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch()],
        flags: [],
        attesterScores: new Map()
      };

      const manyVouches: ScoreInputs = {
        verifications: [createVerification()],
        vouches: Array(5).fill(null).map((_, i) => createVouch({ uid: `v-${i}` })),
        flags: [],
        attesterScores: new Map()
      };

      const oneScore = calculateTrustScore(oneVouch);
      const manyScore = calculateTrustScore(manyVouches);

      expect(manyScore.confidence).toBeGreaterThanOrEqual(oneScore.confidence);
    });

    it('caps confidence at 1.0', () => {
      const maxAttestations: ScoreInputs = {
        verifications: Array(10).fill(null).map((_, i) => createVerification({ uid: `v-${i}` })),
        vouches: Array(20).fill(null).map((_, i) => createVouch({ uid: `vo-${i}` })),
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(maxAttestations);
      
      expect(score.confidence).toBeLessThanOrEqual(1);
    });

    it('rounds confidence to two decimal places', () => {
      const inputs: ScoreInputs = {
        verifications: [createVerification()],
        vouches: [createVouch()],
        flags: [],
        attesterScores: new Map()
      };

      const score = calculateTrustScore(inputs);
      
      const decimalPlaces = (score.confidence.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  // ============ Default Trust Score ============

  describe('Default Trust Score', () => {
    it('returns correct default values', () => {
      const defaultScore = getDefaultTrustScore();
      
      expect(defaultScore.score).toBe(0);
      expect(defaultScore.confidence).toBe(0);
      expect(defaultScore.verified).toBe(false);
      expect(defaultScore.attestationCount).toBe(0);
      expect(defaultScore.linkedPlatforms).toEqual([]);
      expect(typeof defaultScore.updatedAt).toBe('number');
    });

    it('has recent updatedAt timestamp', () => {
      const before = Date.now();
      const defaultScore = getDefaultTrustScore();
      const after = Date.now();
      
      expect(defaultScore.updatedAt).toBeGreaterThanOrEqual(before);
      expect(defaultScore.updatedAt).toBeLessThanOrEqual(after);
    });
  });
});
