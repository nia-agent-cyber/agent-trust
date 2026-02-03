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

// Query utilities
export { getTrustScore, getAttestationSummary, fetchAttestationsForAgent } from './query';

// Soulbound Credentials
export * from './credentials';
