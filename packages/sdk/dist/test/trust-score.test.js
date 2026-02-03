"use strict";
/**
 * Tests for trust score calculation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const trust_score_1 = require("../scoring/trust-score");
(0, vitest_1.describe)('Trust Score Calculation', () => {
    const mockVerification = {
        uid: 'ver-1',
        attester: '0xverifier',
        recipient: '0xagent',
        time: Date.now() / 1000,
        revoked: false,
        platform: 'twitter',
        handle: '@testuser'
    };
    const mockVouch = {
        uid: 'vouch-1',
        attester: '0xvoucher',
        recipient: '0xagent',
        time: Date.now() / 1000,
        revoked: false,
        trustLevel: 4,
        context: 'Great agent!'
    };
    const mockFlag = {
        uid: 'flag-1',
        attester: '0xflagger',
        recipient: '0xagent',
        time: Date.now() / 1000,
        revoked: false,
        severity: 3,
        reason: 'Suspicious behavior'
    };
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
    });
    (0, vitest_1.it)('gives base score of 50 for verified agent', () => {
        const inputs = {
            verifications: [mockVerification],
            vouches: [],
            flags: [],
            attesterScores: new Map()
        };
        const score = (0, trust_score_1.calculateTrustScore)(inputs);
        (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(50);
        (0, vitest_1.expect)(score.verified).toBe(true);
        (0, vitest_1.expect)(score.linkedPlatforms).toContain('twitter');
    });
    (0, vitest_1.it)('increases score with vouches', () => {
        const inputs = {
            verifications: [mockVerification],
            vouches: [mockVouch],
            flags: [],
            attesterScores: new Map([['0xvoucher', 80]])
        };
        const score = (0, trust_score_1.calculateTrustScore)(inputs);
        (0, vitest_1.expect)(score.score).toBeGreaterThan(50);
    });
    (0, vitest_1.it)('decreases score with flags', () => {
        const inputs = {
            verifications: [mockVerification],
            vouches: [],
            flags: [mockFlag],
            attesterScores: new Map([['0xflagger', 70]])
        };
        const score = (0, trust_score_1.calculateTrustScore)(inputs);
        (0, vitest_1.expect)(score.score).toBeLessThan(50);
    });
    (0, vitest_1.it)('ignores revoked attestations', () => {
        const revokedVerification = { ...mockVerification, revoked: true };
        const inputs = {
            verifications: [revokedVerification],
            vouches: [],
            flags: [],
            attesterScores: new Map()
        };
        const score = (0, trust_score_1.calculateTrustScore)(inputs);
        (0, vitest_1.expect)(score.verified).toBe(false);
        (0, vitest_1.expect)(score.score).toBe(0);
    });
    (0, vitest_1.it)('clamps score between 0 and 100', () => {
        // Many flags should not go below 0
        const manyFlags = Array(10).fill(null).map((_, i) => ({
            ...mockFlag,
            uid: `flag-${i}`,
            severity: 5
        }));
        const inputs = {
            verifications: [],
            vouches: [],
            flags: manyFlags,
            attesterScores: new Map()
        };
        const score = (0, trust_score_1.calculateTrustScore)(inputs);
        (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(score.score).toBeLessThanOrEqual(100);
    });
    (0, vitest_1.it)('returns proper default trust score', () => {
        const defaultScore = (0, trust_score_1.getDefaultTrustScore)();
        (0, vitest_1.expect)(defaultScore.score).toBe(0);
        (0, vitest_1.expect)(defaultScore.confidence).toBe(0);
        (0, vitest_1.expect)(defaultScore.verified).toBe(false);
        (0, vitest_1.expect)(defaultScore.linkedPlatforms).toEqual([]);
    });
});
