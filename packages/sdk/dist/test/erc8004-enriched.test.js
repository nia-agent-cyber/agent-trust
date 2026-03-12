"use strict";
/**
 * ERC-8004 Enriched Profile Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const enriched_1 = require("../erc8004/enriched");
// Mock sub-modules
vitest_1.vi.mock('../erc8004/identity', () => ({
    getERC8004Identity: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../erc8004/reputation', () => ({
    getERC8004Reputation: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../erc8004/validation', () => ({
    getERC8004Validation: vitest_1.vi.fn(),
}));
const identity_1 = require("../erc8004/identity");
const reputation_1 = require("../erc8004/reputation");
const validation_1 = require("../erc8004/validation");
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
function makeTierInfo(tier, name) {
    return {
        tier,
        name,
        emoji: '🔵',
        requirements: { minAttestations: 0, minVouches: 0, minVouchTier: 0, minApprovalRate: 0, minDaysActive: 0 },
        progress: null,
        nextTier: tier < 4 ? tier + 1 : null,
    };
}
function makeTrustScore(score, count) {
    return {
        score,
        confidence: 0.5,
        attestationCount: count,
        verified: true,
        linkedPlatforms: [],
        updatedAt: Date.now(),
    };
}
function makeIdentity(agentId, metadata = null) {
    return {
        agentId,
        owner: TEST_ADDRESS,
        registryAddress: '0xregistry',
        tokenURI: 'https://example.com/agent.json',
        metadata,
    };
}
function makeReputation(avg, count) {
    return {
        feedbackCount: count,
        averageRating: avg,
        recentFeedback: [],
    };
}
function makeValidation(total, passed) {
    return {
        validationCount: total,
        passedCount: passed,
        recentValidations: [],
    };
}
(0, vitest_1.describe)('calculateCombinedScore', () => {
    (0, vitest_1.it)('returns 0 for tier 0 with no ERC-8004 data', () => {
        const tier = makeTierInfo(0, 'New');
        const score = (0, enriched_1.calculateCombinedScore)(tier, null, null, null);
        (0, vitest_1.expect)(score).toBe(0);
    });
    (0, vitest_1.it)('returns max score for top tier with perfect ERC-8004 data', () => {
        const tier = makeTierInfo(4, 'Expert');
        const identity = makeIdentity(1, { name: 'Agent' });
        const reputation = makeReputation(5, 10);
        const validation = makeValidation(10, 10);
        const score = (0, enriched_1.calculateCombinedScore)(tier, identity, reputation, validation);
        (0, vitest_1.expect)(score).toBe(100);
    });
    (0, vitest_1.it)('weights Agent Trust tier at 40%', () => {
        // Tier 4 only, no ERC-8004 data
        const tier = makeTierInfo(4, 'Expert');
        const score = (0, enriched_1.calculateCombinedScore)(tier, null, null, null);
        (0, vitest_1.expect)(score).toBe(40); // 100 * 0.4
    });
    (0, vitest_1.it)('weights ERC-8004 reputation at 30%', () => {
        const tier = makeTierInfo(0, 'New');
        const reputation = makeReputation(5, 10); // Perfect rating
        const score = (0, enriched_1.calculateCombinedScore)(tier, null, reputation, null);
        (0, vitest_1.expect)(score).toBe(30); // 100 * 0.3
    });
    (0, vitest_1.it)('weights identity completeness at 15%', () => {
        const tier = makeTierInfo(0, 'New');
        const identity = makeIdentity(1, { name: 'Agent' }); // Full identity: 50+20+30=100
        const score = (0, enriched_1.calculateCombinedScore)(tier, identity, null, null);
        (0, vitest_1.expect)(score).toBe(15); // 100 * 0.15
    });
    (0, vitest_1.it)('gives partial identity score without metadata', () => {
        const tier = makeTierInfo(0, 'New');
        const identity = makeIdentity(1, null); // No metadata: 50+20=70
        const score = (0, enriched_1.calculateCombinedScore)(tier, identity, null, null);
        (0, vitest_1.expect)(score).toBe(Math.round(70 * 0.15)); // 10 or 11
    });
    (0, vitest_1.it)('weights validation at 15%', () => {
        const tier = makeTierInfo(0, 'New');
        const validation = makeValidation(10, 10); // 100% pass rate
        const score = (0, enriched_1.calculateCombinedScore)(tier, null, null, validation);
        (0, vitest_1.expect)(score).toBe(15); // 100 * 0.15
    });
    (0, vitest_1.it)('handles partial validation pass rate', () => {
        const tier = makeTierInfo(0, 'New');
        const validation = makeValidation(10, 5); // 50% pass rate
        const score = (0, enriched_1.calculateCombinedScore)(tier, null, null, validation);
        (0, vitest_1.expect)(score).toBe(Math.round(50 * 0.15));
    });
    (0, vitest_1.it)('clamps score to 0-100', () => {
        const tier = makeTierInfo(4, 'Expert');
        const identity = makeIdentity(1, { name: 'Agent' });
        const reputation = makeReputation(5, 100);
        const validation = makeValidation(100, 100);
        const score = (0, enriched_1.calculateCombinedScore)(tier, identity, reputation, validation);
        (0, vitest_1.expect)(score).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(score).toBeLessThanOrEqual(100);
    });
    (0, vitest_1.it)('handles null averageRating in reputation', () => {
        const tier = makeTierInfo(2, 'Trusted');
        const reputation = { feedbackCount: 0, averageRating: null, recentFeedback: [] };
        const score = (0, enriched_1.calculateCombinedScore)(tier, null, reputation, null);
        // Only tier contributes: (2/4)*100*0.4 = 20
        (0, vitest_1.expect)(score).toBe(20);
    });
});
(0, vitest_1.describe)('generateSummary', () => {
    (0, vitest_1.it)('includes ERC-8004 identity when registered', () => {
        const tier = makeTierInfo(2, 'Trusted');
        const identity = makeIdentity(1, { name: 'CoolBot' });
        const summary = (0, enriched_1.generateSummary)(TEST_ADDRESS, tier, identity, null, 50);
        (0, vitest_1.expect)(summary).toContain('CoolBot is registered on ERC-8004');
        (0, vitest_1.expect)(summary).toContain('Trusted');
        (0, vitest_1.expect)(summary).toContain('50/100');
    });
    (0, vitest_1.it)('shows truncated address when no identity', () => {
        const tier = makeTierInfo(0, 'New');
        const summary = (0, enriched_1.generateSummary)(TEST_ADDRESS, tier, null, null, 0);
        (0, vitest_1.expect)(summary).toContain('0x123456');
        (0, vitest_1.expect)(summary).toContain('no ERC-8004 identity');
    });
    (0, vitest_1.it)('includes rating when reputation exists', () => {
        const tier = makeTierInfo(1, 'Contributor');
        const reputation = makeReputation(4.5, 20);
        const summary = (0, enriched_1.generateSummary)(TEST_ADDRESS, tier, null, reputation, 30);
        (0, vitest_1.expect)(summary).toContain('4.5/5');
        (0, vitest_1.expect)(summary).toContain('20 reviews');
    });
    (0, vitest_1.it)('uses agent ID fallback when metadata has no name', () => {
        const tier = makeTierInfo(1, 'Contributor');
        const identity = makeIdentity(99, null);
        const summary = (0, enriched_1.generateSummary)(TEST_ADDRESS, tier, identity, null, 25);
        (0, vitest_1.expect)(summary).toContain('Agent #99');
    });
});
(0, vitest_1.describe)('buildEnrichedProfile', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('builds profile with no ERC-8004 data (not registered)', async () => {
        identity_1.getERC8004Identity.mockResolvedValue(null);
        const tier = makeTierInfo(1, 'Contributor');
        const score = makeTrustScore(45, 3);
        const provider = {};
        const profile = await (0, enriched_1.buildEnrichedProfile)(TEST_ADDRESS, provider, 'base', tier, score, 3);
        (0, vitest_1.expect)(profile.address).toBe(TEST_ADDRESS);
        (0, vitest_1.expect)(profile.erc8004.registered).toBe(false);
        (0, vitest_1.expect)(profile.erc8004.identity).toBeNull();
        (0, vitest_1.expect)(profile.erc8004.reputation).toBeNull();
        (0, vitest_1.expect)(profile.erc8004.validation).toBeNull();
        (0, vitest_1.expect)(profile.agentTrust.tier).toBe(tier);
        (0, vitest_1.expect)(profile.agentTrust.score).toBe(score);
        (0, vitest_1.expect)(profile.combined.hasOnChainIdentity).toBe(false);
        (0, vitest_1.expect)(profile.combined.trustTier).toBe('Contributor');
    });
    (0, vitest_1.it)('builds profile with full ERC-8004 data', async () => {
        const identity = makeIdentity(42, { name: 'TestBot' });
        const reputation = makeReputation(4.0, 10);
        const validation = makeValidation(5, 4);
        identity_1.getERC8004Identity.mockResolvedValue(identity);
        reputation_1.getERC8004Reputation.mockResolvedValue(reputation);
        validation_1.getERC8004Validation.mockResolvedValue(validation);
        const tier = makeTierInfo(3, 'Verified');
        const score = makeTrustScore(70, 15);
        const provider = {};
        const profile = await (0, enriched_1.buildEnrichedProfile)(TEST_ADDRESS, provider, 'base', tier, score, 15);
        (0, vitest_1.expect)(profile.erc8004.registered).toBe(true);
        (0, vitest_1.expect)(profile.erc8004.identity).toBe(identity);
        (0, vitest_1.expect)(profile.erc8004.reputation).toBe(reputation);
        (0, vitest_1.expect)(profile.erc8004.validation).toBe(validation);
        (0, vitest_1.expect)(profile.combined.hasOnChainIdentity).toBe(true);
        (0, vitest_1.expect)(profile.combined.reputationScore).toBeGreaterThan(0);
        (0, vitest_1.expect)(profile.combined.summary).toContain('TestBot');
    });
    (0, vitest_1.it)('uses custom registry addresses from config', async () => {
        identity_1.getERC8004Identity.mockResolvedValue(null);
        const tier = makeTierInfo(0, 'New');
        const score = makeTrustScore(0, 0);
        const provider = {};
        const config = {
            identityRegistry: '0xCustomRegistry',
        };
        await (0, enriched_1.buildEnrichedProfile)(TEST_ADDRESS, provider, 'base', tier, score, 0, config);
        (0, vitest_1.expect)(identity_1.getERC8004Identity).toHaveBeenCalledWith(TEST_ADDRESS, '0xCustomRegistry', provider);
    });
});
