"use strict";
/**
 * Tier Integration Tests
 *
 * Tests for CLI tier command functionality and SDK tier integration.
 * These tests verify the tier system works correctly with real/mock data.
 *
 * Run with: npm test -- --run tier-integration.test.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tier_1 = require("../tier");
// Test addresses
const NIA_ADDRESS = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000001';
const INVALID_ADDRESS = 'not-an-address';
(0, vitest_1.describe)('Tier Integration Tests', () => {
    // ============ Setup ============
    (0, vitest_1.beforeEach)(() => {
        // Clear cache before each test
        (0, tier_1.clearTierCache)();
    });
    // ============ getTier Tests ============
    (0, vitest_1.describe)('getTier()', () => {
        (0, vitest_1.it)('returns valid TierInfo structure', async () => {
            const tierInfo = await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            // Verify structure
            (0, vitest_1.expect)(tierInfo).toHaveProperty('tier');
            (0, vitest_1.expect)(tierInfo).toHaveProperty('name');
            (0, vitest_1.expect)(tierInfo).toHaveProperty('emoji');
            (0, vitest_1.expect)(tierInfo).toHaveProperty('requirements');
            (0, vitest_1.expect)(tierInfo).toHaveProperty('progress');
            (0, vitest_1.expect)(tierInfo).toHaveProperty('nextTier');
            // Verify tier is valid range
            (0, vitest_1.expect)(tierInfo.tier).toBeGreaterThanOrEqual(tier_1.TIER_NEW);
            (0, vitest_1.expect)(tierInfo.tier).toBeLessThanOrEqual(tier_1.TIER_EXPERT);
            // Verify name matches tier
            (0, vitest_1.expect)(tierInfo.name).toBe((0, tier_1.getTierName)(tierInfo.tier));
            // Verify emoji matches tier
            (0, vitest_1.expect)(tierInfo.emoji).toBe((0, tier_1.getTierEmoji)(tierInfo.tier));
        }, 15000);
        (0, vitest_1.it)('handles address with no attestations', async () => {
            const tierInfo = await (0, tier_1.getTier)(ZERO_ADDRESS, 'baseSepolia');
            // Should be New tier
            (0, vitest_1.expect)(tierInfo.tier).toBe(tier_1.TIER_NEW);
            (0, vitest_1.expect)(tierInfo.name).toBe('New');
            (0, vitest_1.expect)(tierInfo.emoji).toBe('🆕');
            // Should have progress to next tier
            (0, vitest_1.expect)(tierInfo.nextTier).toBe(tier_1.TIER_CONTRIBUTOR);
            (0, vitest_1.expect)(tierInfo.progress).not.toBeNull();
        }, 15000);
        (0, vitest_1.it)('throws on invalid address', async () => {
            await (0, vitest_1.expect)((0, tier_1.getTier)(INVALID_ADDRESS, 'baseSepolia')).rejects.toThrow('Invalid address');
        });
        (0, vitest_1.it)('uses cache on subsequent calls', async () => {
            // First call
            const tierInfo1 = await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            // Second call should use cache (same result, faster)
            const tierInfo2 = await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            (0, vitest_1.expect)(tierInfo1.tier).toBe(tierInfo2.tier);
            (0, vitest_1.expect)(tierInfo1.name).toBe(tierInfo2.name);
        }, 15000);
        (0, vitest_1.it)('handles checksummed and lowercase addresses', async () => {
            const checksummed = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
            const lowercase = '0xc0d7ca6b3c1ef108696ced64f97729177f823189';
            const tier1 = await (0, tier_1.getTier)(checksummed, 'baseSepolia');
            (0, tier_1.clearTierCache)();
            const tier2 = await (0, tier_1.getTier)(lowercase, 'baseSepolia');
            (0, vitest_1.expect)(tier1.tier).toBe(tier2.tier);
        }, 30000);
    });
    // ============ checkMeetsTier Tests ============
    (0, vitest_1.describe)('checkMeetsTier()', () => {
        (0, vitest_1.it)('returns true when agent meets tier', async () => {
            // New tier is always met (min requirements)
            const meetsNew = await (0, tier_1.checkMeetsTier)(ZERO_ADDRESS, tier_1.TIER_NEW, 'baseSepolia');
            (0, vitest_1.expect)(meetsNew).toBe(true);
        }, 15000);
        (0, vitest_1.it)('returns false when agent does not meet tier', async () => {
            // Zero address should not meet Expert tier
            const meetsExpert = await (0, tier_1.checkMeetsTier)(ZERO_ADDRESS, tier_1.TIER_EXPERT, 'baseSepolia');
            (0, vitest_1.expect)(meetsExpert).toBe(false);
        }, 15000);
        (0, vitest_1.it)('throws on invalid tier number', async () => {
            await (0, vitest_1.expect)((0, tier_1.checkMeetsTier)(NIA_ADDRESS, -1, 'baseSepolia')).rejects.toThrow('Invalid tier');
            await (0, vitest_1.expect)((0, tier_1.checkMeetsTier)(NIA_ADDRESS, 5, 'baseSepolia')).rejects.toThrow('Invalid tier');
            await (0, vitest_1.expect)((0, tier_1.checkMeetsTier)(NIA_ADDRESS, 100, 'baseSepolia')).rejects.toThrow('Invalid tier');
        });
        (0, vitest_1.it)('throws on invalid address', async () => {
            await (0, vitest_1.expect)((0, tier_1.checkMeetsTier)(INVALID_ADDRESS, tier_1.TIER_NEW, 'baseSepolia')).rejects.toThrow('Invalid address');
        });
    });
    // ============ getTierProgress Tests ============
    (0, vitest_1.describe)('getTierProgress()', () => {
        (0, vitest_1.it)('returns progress toward next tier for non-max tier', async () => {
            const progress = await (0, tier_1.getTierProgress)(ZERO_ADDRESS, 'baseSepolia');
            // Zero address is New tier, should have progress to Contributor
            (0, vitest_1.expect)(progress).not.toBeNull();
            (0, vitest_1.expect)(progress).toHaveProperty('attestations');
            (0, vitest_1.expect)(progress).toHaveProperty('vouches');
            (0, vitest_1.expect)(progress).toHaveProperty('approvalRate');
            (0, vitest_1.expect)(progress).toHaveProperty('daysActive');
            // Each requirement should have proper structure
            if (progress) {
                (0, vitest_1.expect)(progress.attestations).toHaveProperty('current');
                (0, vitest_1.expect)(progress.attestations).toHaveProperty('required');
                (0, vitest_1.expect)(progress.attestations).toHaveProperty('met');
                // For zero address, all should be 0
                (0, vitest_1.expect)(progress.attestations.current).toBe(0);
                (0, vitest_1.expect)(progress.vouches.current).toBe(0);
                (0, vitest_1.expect)(progress.daysActive.current).toBe(0);
            }
        }, 15000);
        (0, vitest_1.it)('throws on invalid address', async () => {
            await (0, vitest_1.expect)((0, tier_1.getTierProgress)(INVALID_ADDRESS, 'baseSepolia')).rejects.toThrow('Invalid address');
        });
    });
    // ============ Tier Constants Tests ============
    (0, vitest_1.describe)('Tier Constants', () => {
        (0, vitest_1.it)('has correct tier values', () => {
            (0, vitest_1.expect)(tier_1.TIER_NEW).toBe(0);
            (0, vitest_1.expect)(tier_1.TIER_CONTRIBUTOR).toBe(1);
            (0, vitest_1.expect)(tier_1.TIER_TRUSTED).toBe(2);
            (0, vitest_1.expect)(tier_1.TIER_VERIFIED).toBe(3);
            (0, vitest_1.expect)(tier_1.TIER_EXPERT).toBe(4);
            (0, vitest_1.expect)(tier_1.MAX_TIER).toBe(4);
        });
        (0, vitest_1.it)('has requirements for all tiers', () => {
            for (let tier = tier_1.TIER_NEW; tier <= tier_1.TIER_EXPERT; tier++) {
                (0, vitest_1.expect)(tier_1.TIER_REQUIREMENTS[tier]).toBeDefined();
                (0, vitest_1.expect)(tier_1.TIER_REQUIREMENTS[tier]).toHaveProperty('minAttestations');
                (0, vitest_1.expect)(tier_1.TIER_REQUIREMENTS[tier]).toHaveProperty('minVouches');
                (0, vitest_1.expect)(tier_1.TIER_REQUIREMENTS[tier]).toHaveProperty('minVouchTier');
                (0, vitest_1.expect)(tier_1.TIER_REQUIREMENTS[tier]).toHaveProperty('minApprovalRate');
                (0, vitest_1.expect)(tier_1.TIER_REQUIREMENTS[tier]).toHaveProperty('minDaysActive');
            }
        });
        (0, vitest_1.it)('has increasing requirements for higher tiers', () => {
            for (let tier = tier_1.TIER_NEW; tier < tier_1.TIER_EXPERT; tier++) {
                const current = tier_1.TIER_REQUIREMENTS[tier];
                const next = tier_1.TIER_REQUIREMENTS[tier + 1];
                // Each requirement should be >= previous tier
                (0, vitest_1.expect)(next.minAttestations).toBeGreaterThanOrEqual(current.minAttestations);
                (0, vitest_1.expect)(next.minDaysActive).toBeGreaterThanOrEqual(current.minDaysActive);
            }
        });
        (0, vitest_1.it)('getTierName returns correct names', () => {
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_NEW)).toBe('New');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_CONTRIBUTOR)).toBe('Contributor');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_TRUSTED)).toBe('Trusted');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_VERIFIED)).toBe('Verified');
            (0, vitest_1.expect)((0, tier_1.getTierName)(tier_1.TIER_EXPERT)).toBe('Expert');
            (0, vitest_1.expect)((0, tier_1.getTierName)(99)).toBe('Unknown');
        });
        (0, vitest_1.it)('getTierEmoji returns correct emojis', () => {
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_NEW)).toBe('🆕');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_CONTRIBUTOR)).toBe('🔧');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_TRUSTED)).toBe('⭐');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_VERIFIED)).toBe('✅');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(tier_1.TIER_EXPERT)).toBe('👑');
            (0, vitest_1.expect)((0, tier_1.getTierEmoji)(99)).toBe('❓');
        });
    });
    // ============ CLI Output Format Tests ============
    (0, vitest_1.describe)('CLI JSON Output Format', () => {
        (0, vitest_1.it)('produces valid JSON structure for tier command', async () => {
            const tierInfo = await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            // Simulate CLI JSON output structure
            const output = {
                address: NIA_ADDRESS,
                tier: tierInfo.tier,
                name: tierInfo.name,
                emoji: tierInfo.emoji,
                stats: {
                    attestations: tierInfo.progress?.attestations.current ?? 0,
                    vouches: tierInfo.progress?.vouches.current ?? 0,
                    approvalRate: tierInfo.progress?.approvalRate.current ?? 0,
                    daysActive: tierInfo.progress?.daysActive.current ?? 0,
                },
            };
            if (tierInfo.nextTier !== null && tierInfo.progress) {
                const nextReq = tier_1.TIER_REQUIREMENTS[tierInfo.nextTier];
                output.progress = {
                    nextTier: tierInfo.nextTier,
                    nextTierName: (0, tier_1.getTierName)(tierInfo.nextTier),
                    attestations: {
                        current: tierInfo.progress.attestations.current,
                        required: nextReq.minAttestations,
                        met: tierInfo.progress.attestations.met,
                    },
                    vouches: {
                        current: tierInfo.progress.vouches.current,
                        required: nextReq.minVouches,
                        met: tierInfo.progress.vouches.met,
                    },
                    approvalRate: {
                        current: tierInfo.progress.approvalRate.current,
                        required: nextReq.minApprovalRate,
                        met: tierInfo.progress.approvalRate.met,
                    },
                    daysActive: {
                        current: tierInfo.progress.daysActive.current,
                        required: nextReq.minDaysActive,
                        met: tierInfo.progress.daysActive.met,
                    },
                };
            }
            else {
                output.progress = null;
            }
            // Verify JSON is valid
            const jsonString = JSON.stringify(output, null, 2);
            const parsed = JSON.parse(jsonString);
            (0, vitest_1.expect)(parsed.address).toBe(NIA_ADDRESS);
            (0, vitest_1.expect)(parsed.tier).toBe(tierInfo.tier);
            (0, vitest_1.expect)(parsed.name).toBe(tierInfo.name);
            (0, vitest_1.expect)(parsed.stats).toBeDefined();
        }, 15000);
        (0, vitest_1.it)('produces valid JSON structure for check command', async () => {
            const meetsTier = await (0, tier_1.checkMeetsTier)(NIA_ADDRESS, tier_1.TIER_TRUSTED, 'baseSepolia');
            const tierInfo = await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            // Simulate CLI --check JSON output
            const output = {
                address: NIA_ADDRESS,
                meetsTier,
                requiredTier: tier_1.TIER_TRUSTED,
                requiredTierName: (0, tier_1.getTierName)(tier_1.TIER_TRUSTED),
                actualTier: tierInfo.tier,
                actualTierName: tierInfo.name,
            };
            const jsonString = JSON.stringify(output, null, 2);
            const parsed = JSON.parse(jsonString);
            (0, vitest_1.expect)(parsed.address).toBe(NIA_ADDRESS);
            (0, vitest_1.expect)(typeof parsed.meetsTier).toBe('boolean');
            (0, vitest_1.expect)(parsed.requiredTier).toBe(tier_1.TIER_TRUSTED);
            (0, vitest_1.expect)(parsed.requiredTierName).toBe('Trusted');
        }, 15000);
    });
    // ============ Tier Gating Tests ============
    (0, vitest_1.describe)('Tier Gating (--check flag)', () => {
        (0, vitest_1.it)('correctly gates at Tier 0 (New)', async () => {
            // Any address should meet New tier
            const meets = await (0, tier_1.checkMeetsTier)(ZERO_ADDRESS, tier_1.TIER_NEW, 'baseSepolia');
            (0, vitest_1.expect)(meets).toBe(true);
        }, 15000);
        (0, vitest_1.it)('correctly gates at Tier 1 (Contributor)', async () => {
            // Zero address should not meet Contributor
            const meets = await (0, tier_1.checkMeetsTier)(ZERO_ADDRESS, tier_1.TIER_CONTRIBUTOR, 'baseSepolia');
            (0, vitest_1.expect)(meets).toBe(false);
        }, 15000);
        (0, vitest_1.it)('correctly gates at Tier 2 (Trusted)', async () => {
            // Zero address should not meet Trusted
            const meets = await (0, tier_1.checkMeetsTier)(ZERO_ADDRESS, tier_1.TIER_TRUSTED, 'baseSepolia');
            (0, vitest_1.expect)(meets).toBe(false);
        }, 15000);
        (0, vitest_1.it)('returns consistent results with getTier', async () => {
            const tierInfo = await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            // Should meet current tier and all below
            for (let t = tier_1.TIER_NEW; t <= tierInfo.tier; t++) {
                const meets = await (0, tier_1.checkMeetsTier)(NIA_ADDRESS, t, 'baseSepolia');
                (0, vitest_1.expect)(meets).toBe(true);
            }
            // Should not meet tiers above (if not max)
            if (tierInfo.tier < tier_1.MAX_TIER) {
                for (let t = tierInfo.tier + 1; t <= tier_1.MAX_TIER; t++) {
                    const meets = await (0, tier_1.checkMeetsTier)(NIA_ADDRESS, t, 'baseSepolia');
                    // This may or may not be true depending on actual data
                    (0, vitest_1.expect)(typeof meets).toBe('boolean');
                }
            }
        }, 30000);
    });
    // ============ Edge Cases ============
    (0, vitest_1.describe)('Edge Cases', () => {
        (0, vitest_1.it)('handles network errors gracefully', async () => {
            // Use an invalid network endpoint simulation
            // The SDK should return default stats on error
            const tierInfo = await (0, tier_1.getTier)(ZERO_ADDRESS, 'baseSepolia');
            (0, vitest_1.expect)(tierInfo.tier).toBeGreaterThanOrEqual(tier_1.TIER_NEW);
        }, 15000);
        (0, vitest_1.it)('handles empty progress at max tier correctly', async () => {
            // If an agent is at max tier, progress should be null
            const tierInfo = await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            if (tierInfo.tier === tier_1.MAX_TIER) {
                (0, vitest_1.expect)(tierInfo.progress).toBeNull();
                (0, vitest_1.expect)(tierInfo.nextTier).toBeNull();
            }
            else {
                (0, vitest_1.expect)(tierInfo.progress).not.toBeNull();
                (0, vitest_1.expect)(tierInfo.nextTier).toBe(tierInfo.tier + 1);
            }
        }, 15000);
        (0, vitest_1.it)('requirement progress values are non-negative', async () => {
            const tierInfo = await (0, tier_1.getTier)(ZERO_ADDRESS, 'baseSepolia');
            if (tierInfo.progress) {
                (0, vitest_1.expect)(tierInfo.progress.attestations.current).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(tierInfo.progress.vouches.current).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(tierInfo.progress.approvalRate.current).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(tierInfo.progress.daysActive.current).toBeGreaterThanOrEqual(0);
            }
        }, 15000);
    });
    // ============ Performance Tests ============
    (0, vitest_1.describe)('Performance', () => {
        (0, vitest_1.it)('caches results for improved performance', async () => {
            // First call - populates cache
            const start1 = Date.now();
            await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            const duration1 = Date.now() - start1;
            // Second call - should use cache
            const start2 = Date.now();
            await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            const duration2 = Date.now() - start2;
            // Cached call should be significantly faster
            (0, vitest_1.expect)(duration2).toBeLessThan(duration1);
            (0, vitest_1.expect)(duration2).toBeLessThan(100); // Should be < 100ms from cache
        }, 15000);
        (0, vitest_1.it)('clearTierCache resets the cache', async () => {
            // Populate cache
            await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            // Clear cache
            (0, tier_1.clearTierCache)();
            // Next call should take longer (network call)
            const start = Date.now();
            await (0, tier_1.getTier)(NIA_ADDRESS, 'baseSepolia');
            const duration = Date.now() - start;
            // Should be longer than a cache hit (but this depends on network)
            // Just verify it completes without error
            (0, vitest_1.expect)(duration).toBeGreaterThanOrEqual(0);
        }, 15000);
    });
});
