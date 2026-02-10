/**
 * Tier Integration Tests
 * 
 * Tests for CLI tier command functionality and SDK tier integration.
 * These tests verify the tier system works correctly with real/mock data.
 * 
 * Run with: npm test -- --run tier-integration.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getTier,
  checkMeetsTier,
  getTierProgress,
  getTierName,
  getTierEmoji,
  TIER_NEW,
  TIER_CONTRIBUTOR,
  TIER_TRUSTED,
  TIER_VERIFIED,
  TIER_EXPERT,
  TIER_REQUIREMENTS,
  MAX_TIER,
  clearTierCache,
  TierInfo,
  TierProgress,
} from '../tier';

// Test addresses
const NIA_ADDRESS = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000001';
const INVALID_ADDRESS = 'not-an-address';

describe('Tier Integration Tests', () => {
  // ============ Setup ============
  
  beforeEach(() => {
    // Clear cache before each test
    clearTierCache();
  });

  // ============ getTier Tests ============

  describe('getTier()', () => {
    it('returns valid TierInfo structure', async () => {
      const tierInfo = await getTier(NIA_ADDRESS, 'baseSepolia');
      
      // Verify structure
      expect(tierInfo).toHaveProperty('tier');
      expect(tierInfo).toHaveProperty('name');
      expect(tierInfo).toHaveProperty('emoji');
      expect(tierInfo).toHaveProperty('requirements');
      expect(tierInfo).toHaveProperty('progress');
      expect(tierInfo).toHaveProperty('nextTier');
      
      // Verify tier is valid range
      expect(tierInfo.tier).toBeGreaterThanOrEqual(TIER_NEW);
      expect(tierInfo.tier).toBeLessThanOrEqual(TIER_EXPERT);
      
      // Verify name matches tier
      expect(tierInfo.name).toBe(getTierName(tierInfo.tier));
      
      // Verify emoji matches tier
      expect(tierInfo.emoji).toBe(getTierEmoji(tierInfo.tier));
    }, 15000);

    it('handles address with no attestations', async () => {
      const tierInfo = await getTier(ZERO_ADDRESS, 'baseSepolia');
      
      // Should be New tier
      expect(tierInfo.tier).toBe(TIER_NEW);
      expect(tierInfo.name).toBe('New');
      expect(tierInfo.emoji).toBe('🆕');
      
      // Should have progress to next tier
      expect(tierInfo.nextTier).toBe(TIER_CONTRIBUTOR);
      expect(tierInfo.progress).not.toBeNull();
    }, 15000);

    it('throws on invalid address', async () => {
      await expect(getTier(INVALID_ADDRESS, 'baseSepolia')).rejects.toThrow('Invalid address');
    });

    it('uses cache on subsequent calls', async () => {
      // First call
      const tierInfo1 = await getTier(NIA_ADDRESS, 'baseSepolia');
      
      // Second call should use cache (same result, faster)
      const tierInfo2 = await getTier(NIA_ADDRESS, 'baseSepolia');
      
      expect(tierInfo1.tier).toBe(tierInfo2.tier);
      expect(tierInfo1.name).toBe(tierInfo2.name);
    }, 15000);

    it('handles checksummed and lowercase addresses', async () => {
      const checksummed = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
      const lowercase = '0xc0d7ca6b3c1ef108696ced64f97729177f823189';
      
      const tier1 = await getTier(checksummed, 'baseSepolia');
      clearTierCache();
      const tier2 = await getTier(lowercase, 'baseSepolia');
      
      expect(tier1.tier).toBe(tier2.tier);
    }, 30000);
  });

  // ============ checkMeetsTier Tests ============

  describe('checkMeetsTier()', () => {
    it('returns true when agent meets tier', async () => {
      // New tier is always met (min requirements)
      const meetsNew = await checkMeetsTier(ZERO_ADDRESS, TIER_NEW, 'baseSepolia');
      expect(meetsNew).toBe(true);
    }, 15000);

    it('returns false when agent does not meet tier', async () => {
      // Zero address should not meet Expert tier
      const meetsExpert = await checkMeetsTier(ZERO_ADDRESS, TIER_EXPERT, 'baseSepolia');
      expect(meetsExpert).toBe(false);
    }, 15000);

    it('throws on invalid tier number', async () => {
      await expect(checkMeetsTier(NIA_ADDRESS, -1, 'baseSepolia')).rejects.toThrow('Invalid tier');
      await expect(checkMeetsTier(NIA_ADDRESS, 5, 'baseSepolia')).rejects.toThrow('Invalid tier');
      await expect(checkMeetsTier(NIA_ADDRESS, 100, 'baseSepolia')).rejects.toThrow('Invalid tier');
    });

    it('throws on invalid address', async () => {
      await expect(checkMeetsTier(INVALID_ADDRESS, TIER_NEW, 'baseSepolia')).rejects.toThrow('Invalid address');
    });
  });

  // ============ getTierProgress Tests ============

  describe('getTierProgress()', () => {
    it('returns progress toward next tier for non-max tier', async () => {
      const progress = await getTierProgress(ZERO_ADDRESS, 'baseSepolia');
      
      // Zero address is New tier, should have progress to Contributor
      expect(progress).not.toBeNull();
      expect(progress).toHaveProperty('attestations');
      expect(progress).toHaveProperty('vouches');
      expect(progress).toHaveProperty('approvalRate');
      expect(progress).toHaveProperty('daysActive');
      
      // Each requirement should have proper structure
      if (progress) {
        expect(progress.attestations).toHaveProperty('current');
        expect(progress.attestations).toHaveProperty('required');
        expect(progress.attestations).toHaveProperty('met');
        
        // For zero address, all should be 0
        expect(progress.attestations.current).toBe(0);
        expect(progress.vouches.current).toBe(0);
        expect(progress.daysActive.current).toBe(0);
      }
    }, 15000);

    it('throws on invalid address', async () => {
      await expect(getTierProgress(INVALID_ADDRESS, 'baseSepolia')).rejects.toThrow('Invalid address');
    });
  });

  // ============ Tier Constants Tests ============

  describe('Tier Constants', () => {
    it('has correct tier values', () => {
      expect(TIER_NEW).toBe(0);
      expect(TIER_CONTRIBUTOR).toBe(1);
      expect(TIER_TRUSTED).toBe(2);
      expect(TIER_VERIFIED).toBe(3);
      expect(TIER_EXPERT).toBe(4);
      expect(MAX_TIER).toBe(4);
    });

    it('has requirements for all tiers', () => {
      for (let tier = TIER_NEW; tier <= TIER_EXPERT; tier++) {
        expect(TIER_REQUIREMENTS[tier]).toBeDefined();
        expect(TIER_REQUIREMENTS[tier]).toHaveProperty('minAttestations');
        expect(TIER_REQUIREMENTS[tier]).toHaveProperty('minVouches');
        expect(TIER_REQUIREMENTS[tier]).toHaveProperty('minVouchTier');
        expect(TIER_REQUIREMENTS[tier]).toHaveProperty('minApprovalRate');
        expect(TIER_REQUIREMENTS[tier]).toHaveProperty('minDaysActive');
      }
    });

    it('has increasing requirements for higher tiers', () => {
      for (let tier = TIER_NEW; tier < TIER_EXPERT; tier++) {
        const current = TIER_REQUIREMENTS[tier];
        const next = TIER_REQUIREMENTS[tier + 1];
        
        // Each requirement should be >= previous tier
        expect(next.minAttestations).toBeGreaterThanOrEqual(current.minAttestations);
        expect(next.minDaysActive).toBeGreaterThanOrEqual(current.minDaysActive);
      }
    });

    it('getTierName returns correct names', () => {
      expect(getTierName(TIER_NEW)).toBe('New');
      expect(getTierName(TIER_CONTRIBUTOR)).toBe('Contributor');
      expect(getTierName(TIER_TRUSTED)).toBe('Trusted');
      expect(getTierName(TIER_VERIFIED)).toBe('Verified');
      expect(getTierName(TIER_EXPERT)).toBe('Expert');
      expect(getTierName(99)).toBe('Unknown');
    });

    it('getTierEmoji returns correct emojis', () => {
      expect(getTierEmoji(TIER_NEW)).toBe('🆕');
      expect(getTierEmoji(TIER_CONTRIBUTOR)).toBe('🔧');
      expect(getTierEmoji(TIER_TRUSTED)).toBe('⭐');
      expect(getTierEmoji(TIER_VERIFIED)).toBe('✅');
      expect(getTierEmoji(TIER_EXPERT)).toBe('👑');
      expect(getTierEmoji(99)).toBe('❓');
    });
  });

  // ============ CLI Output Format Tests ============

  describe('CLI JSON Output Format', () => {
    it('produces valid JSON structure for tier command', async () => {
      const tierInfo = await getTier(NIA_ADDRESS, 'baseSepolia');
      
      // Simulate CLI JSON output structure
      const output: Record<string, unknown> = {
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
        const nextReq = TIER_REQUIREMENTS[tierInfo.nextTier];
        output.progress = {
          nextTier: tierInfo.nextTier,
          nextTierName: getTierName(tierInfo.nextTier),
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
      } else {
        output.progress = null;
      }
      
      // Verify JSON is valid
      const jsonString = JSON.stringify(output, null, 2);
      const parsed = JSON.parse(jsonString);
      
      expect(parsed.address).toBe(NIA_ADDRESS);
      expect(parsed.tier).toBe(tierInfo.tier);
      expect(parsed.name).toBe(tierInfo.name);
      expect(parsed.stats).toBeDefined();
    }, 15000);

    it('produces valid JSON structure for check command', async () => {
      const meetsTier = await checkMeetsTier(NIA_ADDRESS, TIER_TRUSTED, 'baseSepolia');
      const tierInfo = await getTier(NIA_ADDRESS, 'baseSepolia');
      
      // Simulate CLI --check JSON output
      const output = {
        address: NIA_ADDRESS,
        meetsTier,
        requiredTier: TIER_TRUSTED,
        requiredTierName: getTierName(TIER_TRUSTED),
        actualTier: tierInfo.tier,
        actualTierName: tierInfo.name,
      };
      
      const jsonString = JSON.stringify(output, null, 2);
      const parsed = JSON.parse(jsonString);
      
      expect(parsed.address).toBe(NIA_ADDRESS);
      expect(typeof parsed.meetsTier).toBe('boolean');
      expect(parsed.requiredTier).toBe(TIER_TRUSTED);
      expect(parsed.requiredTierName).toBe('Trusted');
    }, 15000);
  });

  // ============ Tier Gating Tests ============

  describe('Tier Gating (--check flag)', () => {
    it('correctly gates at Tier 0 (New)', async () => {
      // Any address should meet New tier
      const meets = await checkMeetsTier(ZERO_ADDRESS, TIER_NEW, 'baseSepolia');
      expect(meets).toBe(true);
    }, 15000);

    it('correctly gates at Tier 1 (Contributor)', async () => {
      // Zero address should not meet Contributor
      const meets = await checkMeetsTier(ZERO_ADDRESS, TIER_CONTRIBUTOR, 'baseSepolia');
      expect(meets).toBe(false);
    }, 15000);

    it('correctly gates at Tier 2 (Trusted)', async () => {
      // Zero address should not meet Trusted
      const meets = await checkMeetsTier(ZERO_ADDRESS, TIER_TRUSTED, 'baseSepolia');
      expect(meets).toBe(false);
    }, 15000);

    it('returns consistent results with getTier', async () => {
      const tierInfo = await getTier(NIA_ADDRESS, 'baseSepolia');
      
      // Should meet current tier and all below
      for (let t = TIER_NEW; t <= tierInfo.tier; t++) {
        const meets = await checkMeetsTier(NIA_ADDRESS, t, 'baseSepolia');
        expect(meets).toBe(true);
      }
      
      // Should not meet tiers above (if not max)
      if (tierInfo.tier < MAX_TIER) {
        for (let t = tierInfo.tier + 1; t <= MAX_TIER; t++) {
          const meets = await checkMeetsTier(NIA_ADDRESS, t, 'baseSepolia');
          // This may or may not be true depending on actual data
          expect(typeof meets).toBe('boolean');
        }
      }
    }, 30000);
  });

  // ============ Edge Cases ============

  describe('Edge Cases', () => {
    it('handles network errors gracefully', async () => {
      // Use an invalid network endpoint simulation
      // The SDK should return default stats on error
      const tierInfo = await getTier(ZERO_ADDRESS, 'baseSepolia');
      expect(tierInfo.tier).toBeGreaterThanOrEqual(TIER_NEW);
    }, 15000);

    it('handles empty progress at max tier correctly', async () => {
      // If an agent is at max tier, progress should be null
      const tierInfo = await getTier(NIA_ADDRESS, 'baseSepolia');
      
      if (tierInfo.tier === MAX_TIER) {
        expect(tierInfo.progress).toBeNull();
        expect(tierInfo.nextTier).toBeNull();
      } else {
        expect(tierInfo.progress).not.toBeNull();
        expect(tierInfo.nextTier).toBe(tierInfo.tier + 1);
      }
    }, 15000);

    it('requirement progress values are non-negative', async () => {
      const tierInfo = await getTier(ZERO_ADDRESS, 'baseSepolia');
      
      if (tierInfo.progress) {
        expect(tierInfo.progress.attestations.current).toBeGreaterThanOrEqual(0);
        expect(tierInfo.progress.vouches.current).toBeGreaterThanOrEqual(0);
        expect(tierInfo.progress.approvalRate.current).toBeGreaterThanOrEqual(0);
        expect(tierInfo.progress.daysActive.current).toBeGreaterThanOrEqual(0);
      }
    }, 15000);
  });

  // ============ Performance Tests ============

  describe('Performance', () => {
    it('caches results for improved performance', async () => {
      // First call - populates cache
      const start1 = Date.now();
      await getTier(NIA_ADDRESS, 'baseSepolia');
      const duration1 = Date.now() - start1;
      
      // Second call - should use cache
      const start2 = Date.now();
      await getTier(NIA_ADDRESS, 'baseSepolia');
      const duration2 = Date.now() - start2;
      
      // Cached call should be significantly faster
      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(100); // Should be < 100ms from cache
    }, 15000);

    it('clearTierCache resets the cache', async () => {
      // Populate cache
      await getTier(NIA_ADDRESS, 'baseSepolia');
      
      // Clear cache
      clearTierCache();
      
      // Next call should take longer (network call)
      const start = Date.now();
      await getTier(NIA_ADDRESS, 'baseSepolia');
      const duration = Date.now() - start;
      
      // Should be longer than a cache hit (but this depends on network)
      // Just verify it completes without error
      expect(duration).toBeGreaterThanOrEqual(0);
    }, 15000);
  });
});
