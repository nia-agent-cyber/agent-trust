/**
 * TrustCheckTool — LangChain StructuredTool for checking agent trust tiers.
 *
 * Drop this into your LangChain agent's tool list to give the agent the ability
 * to look up any address's trust tier and check whether it meets a minimum tier.
 *
 * @example
 * ```typescript
 * import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
 * import { TrustCheckTool } from '@nia-agent-cyber/agent-trust-langchain';
 *
 * const agentTrust = new AgentTrust({ network: 'base', provider });
 * const tool = new TrustCheckTool(agentTrust);
 *
 * // Inside an agent:
 * const result = await tool.invoke({ agentAddress: '0x...', minTier: 'silver' });
 * ```
 */
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { AgentTrustLike, TrustCheckResult, TierName } from './types.js';
declare const TrustCheckInput: z.ZodObject<{
    agentAddress: z.ZodString;
    minTier: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
}, z.core.$strip>;
type TrustCheckInput = z.infer<typeof TrustCheckInput>;
/**
 * LangChain StructuredTool that checks an agent's trust tier.
 *
 * Returns a JSON string with the trust check result including:
 * - address, tier, score, passed (boolean), reason
 */
export declare class TrustCheckTool extends StructuredTool<typeof TrustCheckInput> {
    name: string;
    description: string;
    schema: z.ZodObject<{
        agentAddress: z.ZodString;
        minTier: z.ZodOptional<z.ZodEnum<{
            [x: string]: string;
        }>>;
    }, z.core.$strip>;
    private agentTrust;
    constructor(agentTrust: AgentTrustLike);
    /**
     * Execute the trust check.
     */
    _call(input: TrustCheckInput): Promise<string>;
}
/**
 * Shared trust check logic used by both TrustCheckTool and TrustGuard.
 */
export declare function performTrustCheck(agentTrust: AgentTrustLike, agentAddress: string, minTier?: TierName): Promise<TrustCheckResult>;
export {};
