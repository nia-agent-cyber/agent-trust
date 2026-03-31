/**
 * TrustCheckTool — LangChain DynamicStructuredTool wrapping Agent Trust tier queries
 *
 * Extends DynamicStructuredTool from @langchain/core/tools.
 * Peer dependency: @langchain/core >=0.3.0
 */
import { TrustCheckToolConfig, TrustCheckToolInput, TrustCheckOutput } from './types.js';
/**
 * TrustCheckTool
 *
 * A LangChain-compatible tool that wraps AgentTrust.getTier() + getScore().
 *
 * Usage with LangChain:
 *   import { DynamicStructuredTool } from '@langchain/core/tools';
 *   // TrustCheckTool.toLangChainTool() returns a DynamicStructuredTool instance
 *
 * Usage standalone:
 *   const tool = new TrustCheckTool({ agentTrust });
 *   const result = await tool.invoke({ address: '0x...', requiredTier: 'contributor' });
 */
export declare class TrustCheckTool {
    readonly name: string;
    readonly description: string;
    private agentTrust;
    private defaultRequiredTier?;
    constructor(config: TrustCheckToolConfig);
    /**
     * Invoke the tool with an address (and optional requiredTier).
     * Returns a JSON string matching TrustCheckOutput.
     */
    invoke(input: TrustCheckToolInput): Promise<string>;
    /**
     * Internal implementation — returns structured output.
     */
    _run(input: TrustCheckToolInput): Promise<TrustCheckOutput>;
    /**
     * Returns a LangChain DynamicStructuredTool if @langchain/core is available.
     * Use this to register with a LangChain agent.
     */
    toLangChainTool(): unknown;
}
