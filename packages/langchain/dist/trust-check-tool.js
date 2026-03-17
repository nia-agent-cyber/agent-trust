"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustCheckTool = void 0;
exports.performTrustCheck = performTrustCheck;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const tier_utils_js_1 = require("./tier-utils.js");
const types_js_1 = require("./types.js");
const TrustCheckInput = zod_1.z.object({
    /** Ethereum wallet address of the agent to check */
    agentAddress: zod_1.z.string().describe('Ethereum wallet address of the agent to check (0x...)'),
    /** Minimum tier required. Defaults to "bronze". */
    minTier: zod_1.z
        .enum(types_js_1.TIER_ORDER)
        .optional()
        .describe('Minimum tier required. One of: unverified, bronze, silver, gold, platinum. Defaults to "bronze".'),
});
/**
 * LangChain StructuredTool that checks an agent's trust tier.
 *
 * Returns a JSON string with the trust check result including:
 * - address, tier, score, passed (boolean), reason
 */
class TrustCheckTool extends tools_1.StructuredTool {
    name = 'trust_check';
    description = 'Check the trust tier of an agent address. Returns the trust tier, score, and whether it meets the minimum requirement. ' +
        'Tier order (lowest to highest): unverified < bronze < silver < gold < platinum.';
    schema = TrustCheckInput;
    agentTrust;
    constructor(agentTrust) {
        super();
        this.agentTrust = agentTrust;
    }
    /**
     * Execute the trust check.
     */
    async _call(input) {
        const { agentAddress, minTier = 'bronze' } = input;
        const result = await performTrustCheck(this.agentTrust, agentAddress, minTier);
        return JSON.stringify(result);
    }
}
exports.TrustCheckTool = TrustCheckTool;
/**
 * Shared trust check logic used by both TrustCheckTool and TrustGuard.
 */
async function performTrustCheck(agentTrust, agentAddress, minTier = 'bronze') {
    // Fetch tier and score in parallel
    const [tierInfo, scoreInfo] = await Promise.all([
        agentTrust.getTier(agentAddress),
        agentTrust.getScore(agentAddress),
    ]);
    const tier = (0, tier_utils_js_1.sdkTierToName)(tierInfo.tier);
    const score = scoreInfo.score;
    const passed = (0, tier_utils_js_1.tierMeetsMinimum)(tier, minTier);
    const reason = passed
        ? `Agent ${agentAddress} has tier '${tier}' (score: ${score}), which meets the required '${minTier}' tier.`
        : `Agent ${agentAddress} has tier '${tier}' (score: ${score}), which is below the required '${minTier}' tier.`;
    return {
        address: agentAddress,
        tier,
        score,
        passed,
        reason,
    };
}
