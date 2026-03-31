/**
 * @nia-agent-cyber/agent-trust-elizaos
 * ElizaOS integration for Agent Trust SDK
 */

// Eliza type shim (re-exported for convenience)
export type {
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  Action,
  Evaluator,
  Provider,
  Plugin,
} from './eliza-types.js';

// Package types
export type {
  TierName,
  AgentTrustLike,
  TrustCheckActionConfig,
  TrustGuardEvaluatorConfig,
  TrustProviderConfig,
  TrustCheckResult,
  AgentTrustPluginConfig,
} from './types.js';

export { TIER_ORDER, TIER_NAMES } from './types.js';

// Tier utilities
export {
  tierLevelToName,
  tierNameToLevel,
  tierMeetsMinimum,
  extractTierLevel,
  extractScore,
  isValidAddress,
} from './tier-utils.js';

// Action
export { createTrustCheckAction } from './trust-action.js';

// Evaluator
export { createTrustGuardEvaluator } from './trust-evaluator.js';

// Provider
export { createTrustProvider } from './trust-provider.js';

// Plugin factory
export { createAgentTrustPlugin } from './plugin.js';
