"use strict";
/**
 * TrustGuard — imperative utility for trust checks outside of LangChain chains.
 *
 * Use this when you want to gate any operation on trust tier without
 * wiring up a full LangChain chain.
 *
 * @example
 * ```typescript
 * import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
 * import { TrustGuard } from '@nia-agent-cyber/agent-trust-langchain';
 *
 * const agentTrust = new AgentTrust({ network: 'base', provider });
 * const guard = new TrustGuard(agentTrust);
 *
 * // Throws TrustCheckFailedError if tier < 'silver':
 * const result = await guard.check('0x...', { minTier: 'silver' });
 *
 * // Or static version (requires providing an agentTrust):
 * const result = await TrustGuard.check(agentTrust, '0x...', { minTier: 'gold' });
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustGuard = void 0;
const types_js_1 = require("./types.js");
const trust_check_tool_js_1 = require("./trust-check-tool.js");
/**
 * Imperative trust guard — wraps the trust check and throws on failure.
 */
class TrustGuard {
    agentTrust;
    constructor(agentTrust) {
        this.agentTrust = agentTrust;
    }
    /**
     * Check an agent's trust tier and throw if it does not meet the minimum.
     *
     * @param agentAddress - Ethereum wallet address to check
     * @param options - Check options (minTier, rpcUrl, network)
     * @returns TrustCheckResult if the check passes
     * @throws TrustCheckFailedError if the tier is below the minimum
     */
    async check(agentAddress, options = {}) {
        return TrustGuard.check(this.agentTrust, agentAddress, options);
    }
    /**
     * Static version: check an agent's trust tier and throw if it does not meet the minimum.
     *
     * @param agentTrust - AgentTrust instance to use for the check
     * @param agentAddress - Ethereum wallet address to check
     * @param options - Check options (minTier, rpcUrl, network)
     * @returns TrustCheckResult if the check passes
     * @throws TrustCheckFailedError if the tier is below the minimum
     */
    static async check(agentTrust, agentAddress, options = {}) {
        const minTier = options.minTier ?? 'bronze';
        const result = await (0, trust_check_tool_js_1.performTrustCheck)(agentTrust, agentAddress, minTier);
        if (!result.passed) {
            throw new types_js_1.TrustCheckFailedError(result.address, result.tier, minTier);
        }
        return result;
    }
}
exports.TrustGuard = TrustGuard;
