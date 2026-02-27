/**
 * @agent-trust/sdk
 * Trust infrastructure for AI agents
 */

// Main class
export { AgentTrust } from './agent-trust';

// Types
export * from './types';

// Constants
export { SCHEMAS, NETWORKS } from './constants';

// Verification utilities
export * from './verification';

// Scoring utilities  
export * from './scoring';

// Tier utilities
export * from './tier';

// ERC-8004 bridge
export * from './erc8004';

// Query utilities
export { 
  getTrustScore, 
  getAttestationSummary, 
  fetchAttestationsForAgent,
  clearAttesterScoreCache,
  getAttesterScoreCacheStats 
} from './query';
