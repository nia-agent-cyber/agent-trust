/**
 * ERC-8004 Bridge Module
 *
 * Reads ERC-8004 Identity, Reputation, and Validation registries on Base
 * and enriches with Agent Trust reputation scoring.
 */

// Types
export type {
  ERC8004Identity,
  ERC8004Reputation,
  ERC8004Validation,
  EnrichedAgentProfile,
  FeedbackEntry,
  ValidationResult,
  AgentCardMetadata,
  ERC8004Config,
} from './types';

// Constants
export {
  ERC8004_REGISTRIES,
  IDENTITY_REGISTRY_ABI,
  REPUTATION_REGISTRY_ABI,
  VALIDATION_REGISTRY_ABI,
  SCORING_WEIGHTS,
} from './constants';

// Identity
export { getERC8004Identity, resolveTokenURI } from './identity';

// Reputation
export { getERC8004Reputation } from './reputation';

// Validation
export { getERC8004Validation } from './validation';

// Enriched profile
export { buildEnrichedProfile, calculateCombinedScore, generateSummary } from './enriched';
