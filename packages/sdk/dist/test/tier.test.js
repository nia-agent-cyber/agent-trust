"use strict";
/**
 * Trust Tier Unit Tests
 *
 * Tests for tier calculation, decay, and vouch qualification.
 * @see ../tier/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tier_1 = require("../tier");
(0, vitest_1.describe)('Trust Tier Calculation', () => {
    // ============ Test Fixtures ============
    const createStats = (overrides) => ({
        totalAttestations: 0,
        qualifiedVouches: 0,
        approvalRate: 0,
        daysActive: 0,
        flags: 0,
        firstAttestationTime: null,
        lastPositiveAttestationTime: null,
        ...overrides,
    });
    const createVouchInfo = (overrides) => ({
        trustLevel: 4,
        revoked: false,
        voucherTier: 2,
        time: Math.floor(Date.now() / 1000),
        ...overrides,
    });
    // ============ Basic Tier Tests ============
    (0, vitest_1.describe)('calculateTier', () => {
        (0, vitest_1.it)('returns Tier 0 (New) for agent with no attestations', () => {
            const stats = createStats();
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_NEW);
        });
        (0, vitest_1.it)('returns Tier 1 (Contributor) for agent with 3 attestations, 60% approval, 10 days', () => {
            const stats = createStats({
                totalAttestations: 3,
                qualifiedVouches: 0,
                approvalRate: 60,
                daysActive: 10,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
        (0, vitest_1.it)('returns Tier 2 (Trusted) for agent with 10 attestations, 2 vouches, 75% approval, 35 days', () => {
            const stats = createStats({
                totalAttestations: 10,
                qualifiedVouches: 2,
                approvalRate: 75,
                daysActive: 35,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_TRUSTED);
        });
        (0, vitest_1.it)('returns Tier 3 (Verified) for agent with 25 attestations, 5 vouches, 90% approval, 100 days', () => {
            const stats = createStats({
                totalAttestations: 25,
                qualifiedVouches: 5,
                approvalRate: 90,
                daysActive: 100,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_VERIFIED);
        });
        (0, vitest_1.it)('returns Tier 4 (Expert) for agent with 50 attestations, 10 vouches, 98% approval, 200 days', () => {
            const stats = createStats({
                totalAttestations: 50,
                qualifiedVouches: 10,
                approvalRate: 98,
                daysActive: 200,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_EXPERT);
        });
        (0, vitest_1.it)('returns lower tier when missing attestations requirement', () => {
            const stats = createStats({
                totalAttestations: 5, // Not enough for Tier 2 (needs 10)
                qualifiedVouches: 3,
                approvalRate: 80,
                daysActive: 45,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
        (0, vitest_1.it)('returns lower tier when missing vouches requirement', () => {
            const stats = createStats({
                totalAttestations: 15,
                qualifiedVouches: 1, // Not enough for Tier 2 (needs 2)
                approvalRate: 80,
                daysActive: 45,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
        (0, vitest_1.it)('returns lower tier when missing days active requirement', () => {
            const stats = createStats({
                totalAttestations: 15,
                qualifiedVouches: 3,
                approvalRate: 80,
                daysActive: 20, // Not enough for Tier 2 (needs 30)
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
        (0, vitest_1.it)('returns lower tier when missing approval rate requirement', () => {
            const stats = createStats({
                totalAttestations: 15,
                qualifiedVouches: 3,
                approvalRate: 55, // Not enough for Tier 2 (needs 70)
                daysActive: 45,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
    });
    // ============ Tier Requirements Tests ============
    (0, vitest_1.describe)('meetsTierRequirements', () => {
        (0, vitest_1.it)('returns true when all requirements met for Tier 1', () => {
            const stats = createStats({
                totalAttestations: 3,
                qualifiedVouches: 0,
                approvalRate: 50,
                daysActive: 7,
            });
            (0, vitest_1.expect)((0, tier_1.meetsTierRequirements)(stats, tier_1.TIER_REQUIREMENTS[tier_1.TIER_CONTRIBUTOR])).toBe(true);
        });
        (0, vitest_1.it)('returns false when any requirement not met', () => {
            const stats = createStats({
                totalAttestations: 2, // Need 3
                qualifiedVouches: 0,
                approvalRate: 50,
                daysActive: 7,
            });
            (0, vitest_1.expect)((0, tier_1.meetsTierRequirements)(stats, tier_1.TIER_REQUIREMENTS[tier_1.TIER_CONTRIBUTOR])).toBe(false);
        });
        (0, vitest_1.it)('returns true for Tier 0 with no stats', () => {
            const stats = createStats();
            (0, vitest_1.expect)((0, tier_1.meetsTierRequirements)(stats, tier_1.TIER_REQUIREMENTS[tier_1.TIER_NEW])).toBe(true);
        });
    });
    // ============ Decay Tests ============
    (0, vitest_1.describe)('applyDecay', () => {
        (0, vitest_1.beforeEach)(() => {
            vitest_1.vi.useFakeTimers();
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.useRealTimers();
        });
        (0, vitest_1.it)('returns same tier when within grace period', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // 80 days ago (within 90 day grace period)
            const lastAttestation = Math.floor((now - 80 * 24 * 60 * 60 * 1000) / 1000);
            (0, vitest_1.expect)((0, tier_1.applyDecay)(tier_1.TIER_VERIFIED, lastAttestation)).toBe(tier_1.TIER_VERIFIED);
        });
        (0, vitest_1.it)('decays by one level after grace period expires', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // 181 days ago (90 grace + 91 = 181, which gives floor(91/90) = 1 decay level)
            const lastAttestation = Math.floor((now - 181 * 24 * 60 * 60 * 1000) / 1000);
            (0, vitest_1.expect)((0, tier_1.applyDecay)(tier_1.TIER_VERIFIED, lastAttestation)).toBe(tier_1.TIER_TRUSTED);
        });
        (0, vitest_1.it)('decays by two levels after 270+ days of inactivity', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // 275 days ago (90 grace + 185 = 275, which gives floor(185/90) = 2 decay levels)
            const lastAttestation = Math.floor((now - 275 * 24 * 60 * 60 * 1000) / 1000);
            (0, vitest_1.expect)((0, tier_1.applyDecay)(tier_1.TIER_VERIFIED, lastAttestation)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
        (0, vitest_1.it)('does not decay below Tier 0', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // 365 days ago - should decay but not below 0
            const lastAttestation = Math.floor((now - 365 * 24 * 60 * 60 * 1000) / 1000);
            (0, vitest_1.expect)((0, tier_1.applyDecay)(tier_1.TIER_CONTRIBUTOR, lastAttestation)).toBe(tier_1.TIER_NEW);
        });
        (0, vitest_1.it)('returns Tier 0 unchanged', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // Even ancient activity shouldn't decay below 0
            const lastAttestation = Math.floor((now - 1000 * 24 * 60 * 60 * 1000) / 1000);
            (0, vitest_1.expect)((0, tier_1.applyDecay)(tier_1.TIER_NEW, lastAttestation)).toBe(tier_1.TIER_NEW);
        });
        (0, vitest_1.it)('handles null lastPositiveAttestationTime', () => {
            (0, vitest_1.expect)((0, tier_1.applyDecay)(tier_1.TIER_TRUSTED, null)).toBe(tier_1.TIER_TRUSTED);
        });
    });
    // ============ Vouch Qualification Tests ============
    (0, vitest_1.describe)('countQualifiedVouches', () => {
        (0, vitest_1.it)('counts vouches meeting trust level requirement', () => {
            const vouches = [
                createVouchInfo({ trustLevel: 4 }),
                createVouchInfo({ trustLevel: 3 }),
                createVouchInfo({ trustLevel: 2 }), // Too low
            ];
            (0, vitest_1.expect)((0, tier_1.countQualifiedVouches)(vouches, tier_1.TIER_TRUSTED)).toBe(2);
        });
        (0, vitest_1.it)('excludes revoked vouches', () => {
            const vouches = [
                createVouchInfo({ trustLevel: 4 }),
                createVouchInfo({ trustLevel: 4, revoked: true }),
            ];
            (0, vitest_1.expect)((0, tier_1.countQualifiedVouches)(vouches, tier_1.TIER_TRUSTED)).toBe(1);
        });
        (0, vitest_1.it)('excludes vouches from low-tier vouchers for Tier 3+', () => {
            const vouches = [
                createVouchInfo({ trustLevel: 4, voucherTier: 3 }), // Qualifies
                createVouchInfo({ trustLevel: 4, voucherTier: 1 }), // Voucher too low for Tier 4
            ];
            // Tier 4 requires vouchers to be Tier 3+
            (0, vitest_1.expect)((0, tier_1.countQualifiedVouches)(vouches, tier_1.TIER_EXPERT)).toBe(1);
        });
        (0, vitest_1.it)('accepts vouches from Tier 2+ vouchers for Tier 2', () => {
            const vouches = [
                createVouchInfo({ trustLevel: 4, voucherTier: 2 }),
                createVouchInfo({ trustLevel: 4, voucherTier: 1 }), // Voucher too low
            ];
            (0, vitest_1.expect)((0, tier_1.countQualifiedVouches)(vouches, tier_1.TIER_TRUSTED)).toBe(1);
        });
        (0, vitest_1.it)('returns 0 for empty vouches array', () => {
            (0, vitest_1.expect)((0, tier_1.countQualifiedVouches)([], tier_1.TIER_TRUSTED)).toBe(0);
        });
    });
    // ============ Approval Rate Tests ============
    (0, vitest_1.describe)('calculateApprovalRate', () => {
        (0, vitest_1.it)('returns 0 for no attestations', () => {
            (0, vitest_1.expect)((0, tier_1.calculateApprovalRate)(0, 0)).toBe(0);
        });
        (0, vitest_1.it)('returns 100 for no flags', () => {
            (0, vitest_1.expect)((0, tier_1.calculateApprovalRate)(10, 0)).toBe(100);
        });
        (0, vitest_1.it)('calculates correct rate with flags', () => {
            // 10 total, 2 flags = 8 positive = 80%
            (0, vitest_1.expect)((0, tier_1.calculateApprovalRate)(10, 2)).toBe(80);
        });
        (0, vitest_1.it)('returns 0 when all attestations are flags', () => {
            (0, vitest_1.expect)((0, tier_1.calculateApprovalRate)(5, 5)).toBe(0);
        });
        (0, vitest_1.it)('handles more flags than attestations gracefully', () => {
            // Should clamp at 0 (not negative)
            (0, vitest_1.expect)((0, tier_1.calculateApprovalRate)(3, 5)).toBe(0);
        });
    });
    // ============ Days Active Tests ============
    (0, vitest_1.describe)('calculateDaysActive', () => {
        (0, vitest_1.beforeEach)(() => {
            vitest_1.vi.useFakeTimers();
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.useRealTimers();
        });
        (0, vitest_1.it)('returns 0 for null timestamp', () => {
            (0, vitest_1.expect)((0, tier_1.calculateDaysActive)(null)).toBe(0);
        });
        (0, vitest_1.it)('calculates correct days since first attestation', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // 30 days ago
            const firstAttestation = Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000);
            (0, vitest_1.expect)((0, tier_1.calculateDaysActive)(firstAttestation)).toBe(30);
        });
        (0, vitest_1.it)('returns negative for future timestamp (edge case)', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // 1 day in the future - edge case, would return negative
            const futureTime = Math.floor((now + 24 * 60 * 60 * 1000) / 1000);
            // This is an edge case - in practice timestamps should always be in the past
            (0, vitest_1.expect)((0, tier_1.calculateDaysActive)(futureTime)).toBeLessThan(0);
        });
    });
    // ============ Tier Progress Tests ============
    (0, vitest_1.describe)('getTierProgressToward', () => {
        (0, vitest_1.it)('shows progress toward Tier 1', () => {
            const stats = createStats({
                totalAttestations: 1,
                qualifiedVouches: 0,
                approvalRate: 40,
                daysActive: 3,
            });
            const progress = (0, tier_1.getTierProgressToward)(stats, tier_1.TIER_CONTRIBUTOR);
            (0, vitest_1.expect)(progress.attestations.current).toBe(1);
            (0, vitest_1.expect)(progress.attestations.required).toBe(3);
            (0, vitest_1.expect)(progress.attestations.met).toBe(false);
            (0, vitest_1.expect)(progress.approvalRate.current).toBe(40);
            (0, vitest_1.expect)(progress.approvalRate.required).toBe(50);
            (0, vitest_1.expect)(progress.approvalRate.met).toBe(false);
        });
        (0, vitest_1.it)('shows all requirements met when qualifying', () => {
            const stats = createStats({
                totalAttestations: 5,
                qualifiedVouches: 0,
                approvalRate: 60,
                daysActive: 10,
            });
            const progress = (0, tier_1.getTierProgressToward)(stats, tier_1.TIER_CONTRIBUTOR);
            (0, vitest_1.expect)(progress.attestations.met).toBe(true);
            (0, vitest_1.expect)(progress.vouches.met).toBe(true);
            (0, vitest_1.expect)(progress.approvalRate.met).toBe(true);
            (0, vitest_1.expect)(progress.daysActive.met).toBe(true);
        });
    });
    // ============ Tier Info Tests ============
    (0, vitest_1.describe)('getTierInfo', () => {
        (0, vitest_1.it)('returns complete tier info for new agent', () => {
            const stats = createStats();
            const info = (0, tier_1.getTierInfo)(stats);
            (0, vitest_1.expect)(info.tier).toBe(tier_1.TIER_NEW);
            (0, vitest_1.expect)(info.name).toBe('New');
            (0, vitest_1.expect)(info.emoji).toBe('🆕');
            (0, vitest_1.expect)(info.nextTier).toBe(tier_1.TIER_CONTRIBUTOR);
            (0, vitest_1.expect)(info.progress).not.toBeNull();
        });
        (0, vitest_1.it)('returns null progress for max tier', () => {
            const stats = createStats({
                totalAttestations: 50,
                qualifiedVouches: 10,
                approvalRate: 98,
                daysActive: 200,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            const info = (0, tier_1.getTierInfo)(stats);
            (0, vitest_1.expect)(info.tier).toBe(tier_1.TIER_EXPERT);
            (0, vitest_1.expect)(info.name).toBe('Expert');
            (0, vitest_1.expect)(info.emoji).toBe('👑');
            (0, vitest_1.expect)(info.nextTier).toBeNull();
            (0, vitest_1.expect)(info.progress).toBeNull();
        });
    });
    // ============ meetsTier Tests ============
    (0, vitest_1.describe)('meetsTier', () => {
        (0, vitest_1.it)('returns true when tier meets minimum', () => {
            const stats = createStats({
                totalAttestations: 15,
                qualifiedVouches: 3,
                approvalRate: 75,
                daysActive: 45,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.meetsTier)(stats, tier_1.TIER_NEW)).toBe(true);
            (0, vitest_1.expect)((0, tier_1.meetsTier)(stats, tier_1.TIER_CONTRIBUTOR)).toBe(true);
            (0, vitest_1.expect)((0, tier_1.meetsTier)(stats, tier_1.TIER_TRUSTED)).toBe(true);
        });
        (0, vitest_1.it)('returns false when tier below minimum', () => {
            const stats = createStats({
                totalAttestations: 15,
                qualifiedVouches: 3,
                approvalRate: 75,
                daysActive: 45,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.meetsTier)(stats, tier_1.TIER_VERIFIED)).toBe(false);
            (0, vitest_1.expect)((0, tier_1.meetsTier)(stats, tier_1.TIER_EXPERT)).toBe(false);
        });
    });
    // ============ Helper Function Tests ============
    (0, vitest_1.describe)('getTierName', () => {
        (0, vitest_1.it)('returns correct names for all tiers', () => {
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_NEW)).toBe('New');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_CONTRIBUTOR)).toBe('Contributor');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_TRUSTED)).toBe('Trusted');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_VERIFIED)).toBe('Verified');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_EXPERT)).toBe('Expert');
        });
        (0, vitest_1.it)('returns Unknown for invalid tier', () => {
            (0, vitest_1.expect)((0, tier_1.getTierName)(99)).toBe('Unknown');
        });
    });
    (0, vitest_1.describe)('getTierEmoji', () => {
        (0, vitest_1.it)('returns correct emojis for all tiers', () => {
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_NEW)).toBe('🆕');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_CONTRIBUTOR)).toBe('🔧');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_TRUSTED)).toBe('⭐');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_VERIFIED)).toBe('✅');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_EXPERT)).toBe('👑');
        });
        (0, vitest_1.it)('returns ❓ for invalid tier', () => {
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(99)).toBe('❓');
        });
    });
    (0, vitest_1.describe)('getDefaultAgentStats', () => {
        (0, vitest_1.it)('returns correct default values', () => {
            const stats = (0, tier_1.getDefaultAgentStats)();
            (0, vitest_1.expect)(stats.totalAttestations).toBe(0);
            (0, vitest_1.expect)(stats.qualifiedVouches).toBe(0);
            (0, vitest_1.expect)(stats.approvalRate).toBe(0);
            (0, vitest_1.expect)(stats.daysActive).toBe(0);
            (0, vitest_1.expect)(stats.flags).toBe(0);
            (0, vitest_1.expect)(stats.firstAttestationTime).toBeNull();
            (0, vitest_1.expect)(stats.lastPositiveAttestationTime).toBeNull();
        });
    });
    // ============ Edge Cases ============
    (0, vitest_1.describe)('Edge Cases', () => {
        (0, vitest_1.it)('handles extremely high attestation counts', () => {
            const stats = createStats({
                totalAttestations: 10000,
                qualifiedVouches: 100,
                approvalRate: 99,
                daysActive: 1000,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_EXPERT);
        });
        (0, vitest_1.it)('handles exact boundary values for Tier 1', () => {
            const stats = createStats({
                totalAttestations: 3,
                qualifiedVouches: 0,
                approvalRate: 50,
                daysActive: 7,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
        (0, vitest_1.it)('handles exact boundary values for Tier 2', () => {
            const stats = createStats({
                totalAttestations: 10,
                qualifiedVouches: 2,
                approvalRate: 70,
                daysActive: 30,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_TRUSTED);
        });
        (0, vitest_1.it)('handles just below boundary values', () => {
            const stats = createStats({
                totalAttestations: 9, // Just below 10 needed for Tier 2
                qualifiedVouches: 2,
                approvalRate: 70,
                daysActive: 30,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
    });
    // ============ Scenario Tests ============
    (0, vitest_1.describe)('Real-World Scenarios', () => {
        (0, vitest_1.beforeEach)(() => {
            vitest_1.vi.useFakeTimers();
        });
        (0, vitest_1.afterEach)(() => {
            vitest_1.vi.useRealTimers();
        });
        (0, vitest_1.it)('new agent progresses through tiers', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // Day 0: New agent
            let stats = createStats();
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_NEW);
            // Day 10: Got some attestations
            stats = createStats({
                totalAttestations: 5,
                qualifiedVouches: 0,
                approvalRate: 80,
                daysActive: 10,
                lastPositiveAttestationTime: Math.floor(now / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
            // Day 35: More attestations and vouches
            stats = createStats({
                totalAttestations: 12,
                qualifiedVouches: 3,
                approvalRate: 83,
                daysActive: 35,
                lastPositiveAttestationTime: Math.floor(now / 1000),
            });
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_TRUSTED);
        });
        (0, vitest_1.it)('inactive high-tier agent decays', () => {
            const now = Date.now();
            vitest_1.vi.setSystemTime(now);
            // Agent was Tier 3 (Verified) but inactive for 185 days (90 grace + 95 = 185)
            // floor(95/90) = 1 decay level, so Tier 3 → Tier 2
            const lastActive = Math.floor((now - 185 * 24 * 60 * 60 * 1000) / 1000);
            const stats = createStats({
                totalAttestations: 30,
                qualifiedVouches: 6,
                approvalRate: 90,
                daysActive: 120,
                lastPositiveAttestationTime: lastActive,
            });
            // Should decay from Tier 3 to Tier 2
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_TRUSTED);
        });
        (0, vitest_1.it)('agent with many flags has low approval rate', () => {
            const stats = createStats({
                totalAttestations: 20,
                qualifiedVouches: 5,
                approvalRate: (0, tier_1.calculateApprovalRate)(20, 8), // 60%
                daysActive: 60,
                flags: 8,
                lastPositiveAttestationTime: Math.floor(Date.now() / 1000),
            });
            // Should only be Tier 1 due to low approval rate (60%)
            (0, vitest_1.expect)((0, tier_1.calculateTier)(stats)).toBe(tier_1.TIER_CONTRIBUTOR);
        });
        (0, vitest_1.it)('vouches from low-tier vouchers do not count for high tiers', () => {
            // Agent has many vouches but all from Tier 0/1 vouchers
            const vouches = Array(10).fill(null).map(() => createVouchInfo({ trustLevel: 5, voucherTier: 1 }));
            // For Tier 2, need vouches from Tier 2+ vouchers
            (0, vitest_1.expect)((0, tier_1.countQualifiedVouches)(vouches, tier_1.TIER_TRUSTED)).toBe(0);
            // For Tier 1, no vouch tier requirement
            (0, vitest_1.expect)((0, tier_1.countQualifiedVouches)(vouches, tier_1.TIER_CONTRIBUTOR)).toBe(10);
        });
    });
});
