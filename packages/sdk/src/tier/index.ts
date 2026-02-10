/**
 * Trust Tier Module
 * 
 * Provides tier-based trust levels (0-4) for nuanced reputation signals.
 */

// Types
export * from './tier-types';

// Constants
export {
  TIER_NEW,
  TIER_CONTRIBUTOR,
  TIER_TRUSTED,
  TIER_VERIFIED,
  TIER_EXPERT,
  MIN_TIER,
  MAX_TIER,
  TIER_REQUIREMENTS,
  TIER_METADATA,
  DECAY_CONFIG,
  getTierName,
  getTierEmoji,
  getTierDescription,
} from './tier-constants';

// Calculation functions (pure, no network calls)
export {
  calculateTier,
  meetsTierRequirements,
  applyDecay,
  countQualifiedVouches,
  calculateApprovalRate,
  calculateDaysActive,
  getTierProgressToward,
  getTierInfo,
  meetsTier,
  getDefaultAgentStats,
} from './tier-calculation';

// Query functions (with network calls)
export {
  getTier,
  checkMeetsTier,
  getTierProgress,
  fetchAgentStats,
  clearTierCache,
  getTierCacheStats,
} from './tier-query';
