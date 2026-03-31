/**
 * Shared types for @nia-agent-cyber/agent-trust-langchain
 */
/** Tier name union — matches the SDK tier system */
export type TierName = 'unverified' | 'contributor' | 'trusted' | 'verified' | 'expert';
/** Ordered tier names from lowest to highest */
export declare const TIER_ORDER: TierName[];
/** Numeric tier → TierName */
export declare const TIER_NAMES: Record<number, TierName>;
/** Minimal AgentTrust interface used by this package — no hard SDK dependency at runtime */
export interface AgentTrustLike {
    getTier(address: string): Promise<{
        tier: number;
        tierName?: string;
    }>;
    getScore(agentId: string): Promise<{
        score: number;
    } | number>;
}
/** Structured tier info returned by TrustCheckTool */
export interface TierInfo {
    level: number;
    name: TierName;
    score: number;
}
/** Output of TrustCheckTool.invoke() */
export interface TrustCheckOutput {
    address: string;
    tier: TierInfo;
    meets: boolean;
    requiredTier?: TierName;
    error?: string;
}
/** Config for TrustCheckTool */
export interface TrustCheckToolConfig {
    agentTrust: AgentTrustLike;
    /** Default required tier (optional — can also be passed per-invocation) */
    requiredTier?: TierName;
    /** Tool name shown in LangChain (default: 'agent_trust_check') */
    name?: string;
    /** Tool description (default: provided) */
    description?: string;
}
/** Input schema for TrustCheckTool */
export interface TrustCheckToolInput {
    address: string;
    requiredTier?: TierName;
}
/** Config for TrustGate */
export interface TrustGateConfig {
    agentTrust: AgentTrustLike;
    /** Minimum tier required to pass */
    requiredTier: TierName;
    /** Key in state object that holds the address to check (default: 'address') */
    addressKey?: string;
    /** Optional fallback called when trust check fails (instead of throwing) */
    onBlocked?: (state: Record<string, unknown>) => Record<string, unknown>;
}
/** Config for createTrustMiddleware factory */
export interface TrustMiddlewareConfig {
    agentTrust: AgentTrustLike;
    requiredTier?: TierName;
    addressKey?: string;
}
