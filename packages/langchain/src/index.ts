/**
 * @nia-agent-cyber/agent-trust-langchain
 *
 * LangChain integration for Agent Trust SDK.
 * Add trust gating to your LangChain agents and chains.
 *
 * @example
 * ```typescript
 * import {
 *   TrustCheckTool,
 *   TrustGuard,
 *   RunnableTrustGate,
 *   TrustCheckFailedError,
 *   TIER_ORDER,
 * } from '@nia-agent-cyber/agent-trust-langchain';
 * ```
 */

// Types
export {
  TIER_ORDER,
  TrustCheckFailedError,
} from './types.js';

export type {
  TierName,
  AgentTrustLike,
  TrustCheckResult,
  TrustGuardOptions,
  TrustGateOptions,
} from './types.js';

// Tier utilities
export { sdkTierToName, tierIndex, tierMeetsMinimum, isValidTierName } from './tier-utils.js';

// Core: TrustCheckTool
export { TrustCheckTool, performTrustCheck } from './trust-check-tool.js';

// Core: TrustGuard
export { TrustGuard } from './trust-guard.js';

// Core: RunnableTrustGate
export { RunnableTrustGate } from './runnable-trust-gate.js';
