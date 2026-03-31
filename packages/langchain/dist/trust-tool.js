"use strict";
/**
 * TrustCheckTool — LangChain DynamicStructuredTool wrapping Agent Trust tier queries
 *
 * Extends DynamicStructuredTool from @langchain/core/tools.
 * Peer dependency: @langchain/core >=0.3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustCheckTool = void 0;
const tier_utils_js_1 = require("./tier-utils.js");
const ZERO_ADDRESS_RE = /^0x0{40}$/i;
const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const DEFAULT_DESCRIPTION = 'Check the trust tier of an agent wallet address on the Agent Trust network. ' +
    'Returns tier level, tier name, and whether the address meets an optional minimum tier.';
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
class TrustCheckTool {
    name;
    description;
    agentTrust;
    defaultRequiredTier;
    constructor(config) {
        this.agentTrust = config.agentTrust;
        this.defaultRequiredTier = config.requiredTier;
        this.name = config.name ?? 'agent_trust_check';
        this.description = config.description ?? DEFAULT_DESCRIPTION;
    }
    /**
     * Invoke the tool with an address (and optional requiredTier).
     * Returns a JSON string matching TrustCheckOutput.
     */
    async invoke(input) {
        const result = await this._run(input);
        return JSON.stringify(result);
    }
    /**
     * Internal implementation — returns structured output.
     */
    async _run(input) {
        const address = input.address?.trim() ?? '';
        // Validate address
        if (!ETH_ADDRESS_RE.test(address)) {
            return {
                address,
                tier: { level: 0, name: 'unverified', score: 0 },
                meets: false,
                error: 'invalid address',
            };
        }
        // Zero-address guard
        if (ZERO_ADDRESS_RE.test(address)) {
            return {
                address,
                tier: { level: 0, name: 'unverified', score: 0 },
                meets: false,
                error: 'invalid address',
            };
        }
        try {
            const [tierResult, scoreResult] = await Promise.all([
                this.agentTrust.getTier(address),
                this.agentTrust.getScore(address),
            ]);
            const level = (0, tier_utils_js_1.extractTierLevel)(tierResult);
            const score = (0, tier_utils_js_1.extractScore)(scoreResult);
            const name = (0, tier_utils_js_1.tierLevelToName)(level);
            const tierInfo = { level, name, score };
            const requiredTier = input.requiredTier ?? this.defaultRequiredTier;
            const meets = requiredTier ? (0, tier_utils_js_1.tierMeetsMinimum)(name, requiredTier) : true;
            const output = {
                address,
                tier: tierInfo,
                meets,
            };
            if (requiredTier) {
                output.requiredTier = requiredTier;
            }
            return output;
        }
        catch (error) {
            return {
                address,
                tier: { level: 0, name: 'unverified', score: 0 },
                meets: false,
                error: error?.message ?? 'unknown error',
            };
        }
    }
    /**
     * Returns a LangChain DynamicStructuredTool if @langchain/core is available.
     * Use this to register with a LangChain agent.
     */
    toLangChainTool() {
        // Dynamically import to avoid bundling LangChain
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { DynamicStructuredTool } = require('@langchain/core/tools');
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { z } = require('zod');
            return new DynamicStructuredTool({
                name: this.name,
                description: this.description,
                schema: z.object({
                    address: z.string().describe('Ethereum wallet address to check (0x...)'),
                    requiredTier: z
                        .enum(['unverified', 'contributor', 'trusted', 'verified', 'expert'])
                        .optional()
                        .describe('Minimum tier required (optional)'),
                }),
                func: async (input) => this.invoke(input),
            });
        }
        catch {
            throw new Error('Failed to create LangChain tool. Make sure @langchain/core is installed as a peer dependency.');
        }
    }
}
exports.TrustCheckTool = TrustCheckTool;
