"use strict";
/**
 * Trust Score Unit Tests
 *
 * Tests for the core trust score calculation algorithm.
 * @see ../scoring/trust-score.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const trust_score_1 = require("../scoring/trust-score");
(0, vitest_1.describe)('Trust Score Calculation', () => {
    // ============ Test Fixtures ============
    const createVerification = (overrides) => ({
        uid: 'ver-' + Math.random().toString(36).slice(2),
        attester: '0x' + 'a'.repeat(40),
        recipient: '0x' + 'b'.repeat(40),
        time: Math.floor(Date.now() / 1000),
        revoked: false,
        platform: 'twitter',
        handle: '@testuser',
        ...overrides
    });
    const createVouch = (overrides) => ({
        uid: 'vouch-' + Math.random().toString(36).slice(2),
        attester: '0x' + 'c'.repeat(40),
        recipient: '0x' + 'b'.repeat(40),
        time: Math.floor(Date.now() / 1000),
        revoked: false,
        trustLevel: 4,
        context: 'Great agent!',
        ...overrides
    });
    const createFlag = (overrides) => ({
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
    (0, vitest_1.describe)('Basic Score Calculation', () => {
        (0, vitest_1.it)('returns default score for no attestations', () => {
            const inputs = {
                verifications: [],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.score).toBe(0);
            (0, vitest_1.expect)(score.verified).toBe(false);
            (0, vitest_1.expect)(score.confidence).toBe(0);
            (0, vitest_1.expect)(score.attestationCount).toBe(0);
            (0, vitest_1.expect)(score.linkedPlatforms).toEqual([]);
        });
        (0, vitest_1.it)('gives base score of 50 for verified agent', () => {
            const inputs = {
                verifications: [createVerification()],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(50);
            (0, vitest_1.expect)(score.verified).toBe(true);
        });
        (0, vitest_1.it)('tracks linked platforms from verifications', () => {
            const inputs = {
                verifications: [
                    createVerification({ platform: 'twitter' }),
                    createVerification({ platform: 'github' }),
                ],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.linkedPlatforms).toContain('twitter');
            (0, vitest_1.expect)(score.linkedPlatforms).toContain('github');
            (0, vitest_1.expect)(score.linkedPlatforms).toHaveLength(2);
        });
        (0, vitest_1.it)('deduplicates linked platforms', () => {
            const inputs = {
                verifications: [
                    createVerification({ platform: 'twitter' }),
                    createVerification({ platform: 'twitter', handle: '@different' }),
                ],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.linkedPlatforms).toHaveLength(1);
            (0, vitest_1.expect)(score.linkedPlatforms[0]).toBe('twitter');
        });
    });
    // ============ Vouch Tests ============
    (0, vitest_1.describe)('Vouch Bonus', () => {
        (0, vitest_1.it)('increases score with vouches', () => {
            const baseInputs = {
                verifications: [createVerification()],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const baseScore = (0, trust_score_1.calculateTrustScore)(baseInputs);
            const withVouch = {
                ...baseInputs,
                vouches: [createVouch()],
                attesterScores: new Map([['0x' + 'c'.repeat(40), 80]])
            };
            const vouchedScore = (0, trust_score_1.calculateTrustScore)(withVouch);
            (0, vitest_1.expect)(vouchedScore.score).toBeGreaterThan(baseScore.score);
        });
        (0, vitest_1.it)('weighs vouches by attester trust score', () => {
            const lowTrustVouch = {
                verifications: [createVerification()],
                vouches: [createVouch({ attester: '0x' + '1'.repeat(40) })],
                flags: [],
                attesterScores: new Map([['0x' + '1'.repeat(40), 10]]) // Very low trust
            };
            const highTrustVouch = {
                verifications: [createVerification()],
                vouches: [createVouch({ attester: '0x' + '2'.repeat(40) })],
                flags: [],
                attesterScores: new Map([['0x' + '2'.repeat(40), 100]]) // Max trust
            };
            const lowScore = (0, trust_score_1.calculateTrustScore)(lowTrustVouch);
            const highScore = (0, trust_score_1.calculateTrustScore)(highTrustVouch);
            // High trust attester should have more impact
            (0, vitest_1.expect)(highScore.score).toBeGreaterThanOrEqual(lowScore.score);
        });
        (0, vitest_1.it)('weighs vouches by trust level', () => {
            const lowLevelVouch = {
                verifications: [createVerification()],
                vouches: [createVouch({ trustLevel: 1, attester: '0x' + '1'.repeat(40) })],
                flags: [],
                attesterScores: new Map([['0x' + '1'.repeat(40), 50]])
            };
            const highLevelVouch = {
                verifications: [createVerification()],
                vouches: [createVouch({ trustLevel: 5, attester: '0x' + '2'.repeat(40) })],
                flags: [],
                attesterScores: new Map([['0x' + '2'.repeat(40), 50]])
            };
            const lowScore = (0, trust_score_1.calculateTrustScore)(lowLevelVouch);
            const highScore = (0, trust_score_1.calculateTrustScore)(highLevelVouch);
            (0, vitest_1.expect)(highScore.score).toBeGreaterThan(lowScore.score);
        });
        (0, vitest_1.it)('caps vouch bonus at 40 points', () => {
            // Many high-level vouches from high-trust attesters
            const manyVouches = Array(20).fill(null).map((_, i) => createVouch({
                uid: `vouch-${i}`,
                trustLevel: 5,
                attester: `0x${i.toString().padStart(40, '0')}`
            }));
            const attesterScores = new Map(manyVouches.map(v => [v.attester, 100]));
            const inputs = {
                verifications: [createVerification()],
                vouches: manyVouches,
                flags: [],
                attesterScores
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            // Base 50 + max 40 vouch bonus = 90 max
            (0, vitest_1.expect)(score.score).toBeLessThanOrEqual(90);
        });
    });
    // ============ Flag Tests ============
    (0, vitest_1.describe)('Flag Penalty', () => {
        (0, vitest_1.it)('decreases score with flags', () => {
            const baseInputs = {
                verifications: [createVerification()],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const baseScore = (0, trust_score_1.calculateTrustScore)(baseInputs);
            const withFlag = {
                ...baseInputs,
                flags: [createFlag()],
                attesterScores: new Map([['0x' + 'd'.repeat(40), 70]])
            };
            const flaggedScore = (0, trust_score_1.calculateTrustScore)(withFlag);
            (0, vitest_1.expect)(flaggedScore.score).toBeLessThan(baseScore.score);
        });
        (0, vitest_1.it)('weighs flags by attester trust score', () => {
            const lowTrustFlag = {
                verifications: [createVerification()],
                vouches: [],
                flags: [createFlag({ attester: '0x' + '1'.repeat(40), severity: 5 })],
                attesterScores: new Map([['0x' + '1'.repeat(40), 10]]) // Very low trust
            };
            const highTrustFlag = {
                verifications: [createVerification()],
                vouches: [],
                flags: [createFlag({ attester: '0x' + '2'.repeat(40), severity: 5 })],
                attesterScores: new Map([['0x' + '2'.repeat(40), 100]]) // Max trust
            };
            const lowScore = (0, trust_score_1.calculateTrustScore)(lowTrustFlag);
            const highScore = (0, trust_score_1.calculateTrustScore)(highTrustFlag);
            // High trust flagger has more impact (lower final score)
            (0, vitest_1.expect)(highScore.score).toBeLessThanOrEqual(lowScore.score);
        });
        (0, vitest_1.it)('weighs flags by severity', () => {
            const lowSeverityFlag = {
                verifications: [createVerification()],
                vouches: [],
                flags: [createFlag({ severity: 1, attester: '0x' + '1'.repeat(40) })],
                attesterScores: new Map([['0x' + '1'.repeat(40), 50]])
            };
            const highSeverityFlag = {
                verifications: [createVerification()],
                vouches: [],
                flags: [createFlag({ severity: 5, attester: '0x' + '2'.repeat(40) })],
                attesterScores: new Map([['0x' + '2'.repeat(40), 50]])
            };
            const lowScore = (0, trust_score_1.calculateTrustScore)(lowSeverityFlag);
            const highScore = (0, trust_score_1.calculateTrustScore)(highSeverityFlag);
            // Higher severity = more penalty (lower score)
            (0, vitest_1.expect)(highScore.score).toBeLessThan(lowScore.score);
        });
        (0, vitest_1.it)('caps flag penalty at 50 points', () => {
            const manyFlags = Array(10).fill(null).map((_, i) => createFlag({
                uid: `flag-${i}`,
                severity: 5,
                attester: `0x${i.toString().padStart(40, '0')}`
            }));
            const attesterScores = new Map(manyFlags.map(f => [f.attester, 100]));
            const inputs = {
                verifications: [createVerification()],
                vouches: [],
                flags: manyFlags,
                attesterScores
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            // Base 50 - max 50 flag penalty = 0 min
            (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(0);
        });
    });
    // ============ Combined Tests ============
    (0, vitest_1.describe)('Combined Vouches and Flags', () => {
        (0, vitest_1.it)('balances vouches and flags correctly', () => {
            const inputs = {
                verifications: [createVerification()],
                vouches: [createVouch({ trustLevel: 4 })],
                flags: [createFlag({ severity: 2 })],
                attesterScores: new Map([
                    ['0x' + 'c'.repeat(40), 60],
                    ['0x' + 'd'.repeat(40), 60]
                ])
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            // Should be around base (50) + moderate vouch bonus - moderate flag penalty
            (0, vitest_1.expect)(score.score).toBeGreaterThan(30);
            (0, vitest_1.expect)(score.score).toBeLessThan(70);
        });
        (0, vitest_1.it)('multiple vouches can overcome single flag', () => {
            const vouches = Array(5).fill(null).map((_, i) => createVouch({
                uid: `vouch-${i}`,
                trustLevel: 4,
                attester: `0x${(i + 10).toString().padStart(40, '0')}`
            }));
            const inputs = {
                verifications: [createVerification()],
                vouches,
                flags: [createFlag({ severity: 2 })],
                attesterScores: new Map([
                    ...vouches.map(v => [v.attester, 70]),
                    ['0x' + 'd'.repeat(40), 50]
                ])
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            // With enough vouches, should still be above base score
            (0, vitest_1.expect)(score.score).toBeGreaterThan(50);
        });
    });
    // ============ Revoked Attestations ============
    (0, vitest_1.describe)('Revoked Attestations', () => {
        (0, vitest_1.it)('ignores revoked verifications', () => {
            const inputs = {
                verifications: [createVerification({ revoked: true })],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.verified).toBe(false);
            (0, vitest_1.expect)(score.score).toBe(0);
            (0, vitest_1.expect)(score.attestationCount).toBe(0);
        });
        (0, vitest_1.it)('ignores revoked vouches', () => {
            const baseInputs = {
                verifications: [createVerification()],
                vouches: [createVouch({ revoked: true })],
                flags: [],
                attesterScores: new Map([['0x' + 'c'.repeat(40), 80]])
            };
            const withRevokedVouch = (0, trust_score_1.calculateTrustScore)(baseInputs);
            const noVouchInputs = {
                verifications: [createVerification()],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const noVouch = (0, trust_score_1.calculateTrustScore)(noVouchInputs);
            // Revoked vouch should have no effect
            (0, vitest_1.expect)(Math.abs(withRevokedVouch.score - noVouch.score)).toBeLessThan(0.1);
        });
        (0, vitest_1.it)('ignores revoked flags', () => {
            const baseInputs = {
                verifications: [createVerification()],
                vouches: [],
                flags: [createFlag({ revoked: true })],
                attesterScores: new Map([['0x' + 'd'.repeat(40), 80]])
            };
            const withRevokedFlag = (0, trust_score_1.calculateTrustScore)(baseInputs);
            const noFlagInputs = {
                verifications: [createVerification()],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const noFlag = (0, trust_score_1.calculateTrustScore)(noFlagInputs);
            // Revoked flag should have no effect
            (0, vitest_1.expect)(Math.abs(withRevokedFlag.score - noFlag.score)).toBeLessThan(0.1);
        });
    });
    // ============ Score Bounds ============
    (0, vitest_1.describe)('Score Bounds', () => {
        (0, vitest_1.it)('clamps score minimum at 0', () => {
            const manyFlags = Array(10).fill(null).map((_, i) => createFlag({ uid: `flag-${i}`, severity: 5 }));
            const inputs = {
                verifications: [],
                vouches: [],
                flags: manyFlags,
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(0);
        });
        (0, vitest_1.it)('clamps score maximum at 100', () => {
            const manyVouches = Array(50).fill(null).map((_, i) => createVouch({
                uid: `vouch-${i}`,
                trustLevel: 5,
                attester: `0x${i.toString().padStart(40, '0')}`
            }));
            const attesterScores = new Map(manyVouches.map(v => [v.attester, 100]));
            const inputs = {
                verifications: [createVerification()],
                vouches: manyVouches,
                flags: [],
                attesterScores
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.score).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('rounds score to one decimal place', () => {
            const inputs = {
                verifications: [createVerification()],
                vouches: [createVouch()],
                flags: [],
                attesterScores: new Map([['0x' + 'c'.repeat(40), 77]])
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            // Check that score has at most 1 decimal place
            const decimalPlaces = (score.score.toString().split('.')[1] || '').length;
            (0, vitest_1.expect)(decimalPlaces).toBeLessThanOrEqual(1);
        });
    });
    // ============ Confidence Tests ============
    (0, vitest_1.describe)('Confidence Calculation', () => {
        (0, vitest_1.it)('has zero confidence with no attestations', () => {
            const inputs = {
                verifications: [],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            (0, vitest_1.expect)(score.confidence).toBe(0);
        });
        (0, vitest_1.it)('increases confidence with verification', () => {
            const withoutVerification = {
                verifications: [],
                vouches: [createVouch()],
                flags: [],
                attesterScores: new Map()
            };
            const withVerification = {
                verifications: [createVerification()],
                vouches: [createVouch()],
                flags: [],
                attesterScores: new Map()
            };
            const noVerifScore = (0, trust_score_1.calculateTrustScore)(withoutVerification);
            const verifScore = (0, trust_score_1.calculateTrustScore)(withVerification);
            (0, vitest_1.expect)(verifScore.confidence).toBeGreaterThan(noVerifScore.confidence);
        });
        (0, vitest_1.it)('increases confidence with more vouches', () => {
            const oneVouch = {
                verifications: [createVerification()],
                vouches: [createVouch()],
                flags: [],
                attesterScores: new Map()
            };
            const manyVouches = {
                verifications: [createVerification()],
                vouches: Array(5).fill(null).map((_, i) => createVouch({ uid: `v-${i}` })),
                flags: [],
                attesterScores: new Map()
            };
            const oneScore = (0, trust_score_1.calculateTrustScore)(oneVouch);
            const manyScore = (0, trust_score_1.calculateTrustScore)(manyVouches);
            (0, vitest_1.expect)(manyScore.confidence).toBeGreaterThanOrEqual(oneScore.confidence);
        });
        (0, vitest_1.it)('caps confidence at 1.0', () => {
            const maxAttestations = {
                verifications: Array(10).fill(null).map((_, i) => createVerification({ uid: `v-${i}` })),
                vouches: Array(20).fill(null).map((_, i) => createVouch({ uid: `vo-${i}` })),
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(maxAttestations);
            (0, vitest_1.expect)(score.confidence).toBeLessThanOrEqual(1);
        });
        (0, vitest_1.it)('rounds confidence to two decimal places', () => {
            const inputs = {
                verifications: [createVerification()],
                vouches: [createVouch()],
                flags: [],
                attesterScores: new Map()
            };
            const score = (0, trust_score_1.calculateTrustScore)(inputs);
            const decimalPlaces = (score.confidence.toString().split('.')[1] || '').length;
            (0, vitest_1.expect)(decimalPlaces).toBeLessThanOrEqual(2);
        });
    });
    // ============ Default Trust Score ============
    (0, vitest_1.describe)('Default Trust Score', () => {
        (0, vitest_1.it)('returns correct default values', () => {
            const defaultScore = (0, trust_score_1.getDefaultTrustScore)();
            (0, vitest_1.expect)(defaultScore.score).toBe(0);
            (0, vitest_1.expect)(defaultScore.confidence).toBe(0);
            (0, vitest_1.expect)(defaultScore.verified).toBe(false);
            (0, vitest_1.expect)(defaultScore.attestationCount).toBe(0);
            (0, vitest_1.expect)(defaultScore.linkedPlatforms).toEqual([]);
            (0, vitest_1.expect)(typeof defaultScore.updatedAt).toBe('number');
        });
        (0, vitest_1.it)('has recent updatedAt timestamp', () => {
            const before = Date.now();
            const defaultScore = (0, trust_score_1.getDefaultTrustScore)();
            const after = Date.now();
            (0, vitest_1.expect)(defaultScore.updatedAt).toBeGreaterThanOrEqual(before);
            (0, vitest_1.expect)(defaultScore.updatedAt).toBeLessThanOrEqual(after);
        });
    });
});
