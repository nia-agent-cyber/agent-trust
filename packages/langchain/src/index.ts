/**
 * @nia-agent-cyber/agent-trust-langchain
 * LangChain integration for Agent Trust SDK
 */

// Types
export type {
  TierName,
  AgentTrustLike,
  TierInfo,
  TrustCheckOutput,
  TrustCheckToolConfig,
  TrustCheckToolInput,
  TrustGateConfig,
  TrustMiddlewareConfig,
} from './types.js';

export { TIER_ORDER, TIER_NAMES } from './types.js';

// Tier utilities
export {
  tierLevelToName,
  tierNameToLevel,
  tierMeetsMinimum,
  extractTierLevel,
  extractScore,
} from './tier-utils.js';

// TrustCheckTool
export { TrustCheckTool } from './trust-tool.js';

// TrustGate + TrustGateError
export { TrustGate, TrustGateError } from './trust-gate.js';

// Factory
export { createTrustMiddleware } from './middleware.js';
