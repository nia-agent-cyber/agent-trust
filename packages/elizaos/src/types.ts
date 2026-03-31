/**
 * Types for @nia-agent-cyber/agent-trust-elizaos
 */

export type { IAgentRuntime, Memory, State, HandlerCallback, Action, Evaluator, Provider, Plugin } from './eliza-types.js';

/** Tier name union — matches the SDK tier system */
export type TierName = 'unverified' | 'contributor' | 'trusted' | 'verified' | 'expert';

/** Ordered tier names from lowest to highest */
export const TIER_ORDER: TierName[] = [
  'unverified',
  'contributor',
  'trusted',
  'verified',
  'expert',
];

export const TIER_NAMES: Record<number, TierName> = {
  0: 'unverified',
  1: 'contributor',
  2: 'trusted',
  3: 'verified',
  4: 'expert',
};

/** Minimal AgentTrust interface */
export interface AgentTrustLike {
  getTier(address: string): Promise<{ tier: number; tierName?: string }>;
  getScore(agentId: string): Promise<{ score: number } | number>;
}

/** Configuration for TrustCheckAction */
export interface TrustCheckActionConfig {
  agentTrust: AgentTrustLike;
  /** Key in message.content that contains the wallet address to check */
  addressKey?: string;
  /** Minimum required tier (optional — just looks up tier if not set) */
  requiredTier?: TierName;
  /** Name override */
  name?: string;
  /** Description override */
  description?: string;
}

/** Configuration for TrustGuardEvaluator */
export interface TrustGuardEvaluatorConfig {
  agentTrust: AgentTrustLike;
  /** Minimum tier required to pass */
  requiredTier: TierName;
  /** Key in message.content that contains the address to check */
  addressKey?: string;
  /** Evaluator name */
  name?: string;
}

/** Configuration for TrustProvider */
export interface TrustProviderConfig {
  agentTrust: AgentTrustLike;
  /** Key in message.content for the address to look up */
  addressKey?: string;
}

/** Result object embedded in state/callbacks */
export interface TrustCheckResult {
  address: string;
  tier: {
    level: number;
    name: TierName;
    score: number;
  };
  meets?: boolean;
  requiredTier?: TierName;
  error?: string;
}

/** Plugin configuration */
export interface AgentTrustPluginConfig {
  agentTrust: AgentTrustLike;
  requiredTier?: TierName;
  addressKey?: string;
}
