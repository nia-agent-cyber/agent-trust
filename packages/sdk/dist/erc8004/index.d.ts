/**
 * ERC-8004 Bridge Module
 *
 * Reads ERC-8004 Identity, Reputation, and Validation registries on Base
 * and enriches with Agent Trust reputation scoring.
 */
export type { ERC8004Identity, ERC8004Reputation, ERC8004Validation, EnrichedAgentProfile, FeedbackEntry, ValidationResult, AgentCardMetadata, ERC8004Config, } from './types';
export { ERC8004_REGISTRIES, IDENTITY_REGISTRY_ABI, REPUTATION_REGISTRY_ABI, VALIDATION_REGISTRY_ABI, SCORING_WEIGHTS, } from './constants';
export { getERC8004Identity, resolveTokenURI } from './identity';
export { getERC8004Reputation } from './reputation';
export { getERC8004Validation } from './validation';
export { buildEnrichedProfile, calculateCombinedScore, generateSummary } from './enriched';
