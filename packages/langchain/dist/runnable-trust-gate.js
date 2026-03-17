"use strict";
/**
 * RunnableTrustGate — LangChain Runnable that gates chain execution on trust tier.
 *
 * Insert this into a LangChain chain (using .pipe()) to automatically block
 * execution for agents that do not meet the minimum trust requirement.
 *
 * @example
 * ```typescript
 * import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
 * import { RunnableTrustGate } from '@nia-agent-cyber/agent-trust-langchain';
 *
 * const agentTrust = new AgentTrust({ network: 'base', provider });
 *
 * const trustGate = new RunnableTrustGate({
 *   agentAddress: '0xAgentToCheck...',
 *   minTier: 'silver',
 *   agentTrust,
 * });
 *
 * // Gate then pipe to next step:
 * const chain = trustGate.pipe(myNextRunnable);
 *
 * // On invoke: checks trust, passes input through if trusted, throws if not.
 * const output = await chain.invoke(myInput);
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnableTrustGate = void 0;
const runnables_1 = require("@langchain/core/runnables");
const types_js_1 = require("./types.js");
const trust_check_tool_js_1 = require("./trust-check-tool.js");
/**
 * A LangChain Runnable that checks an agent's trust tier before passing
 * the input through to the next step in the chain.
 *
 * - If trust check passes → the input is returned unchanged
 * - If trust check fails → throws `TrustCheckFailedError`
 */
class RunnableTrustGate extends runnables_1.RunnableLambda {
    lc_namespace = ['agent_trust', 'runnables'];
    agentAddress;
    minTier;
    agentTrustInstance;
    constructor(options) {
        const { agentAddress, minTier = 'bronze', agentTrust } = options;
        // Pass a lambda that performs the trust check and passes the input through.
        // We capture the options via closure since we're calling super() before
        // the instance fields are assigned.
        super({
            func: async (input) => {
                const result = await (0, trust_check_tool_js_1.performTrustCheck)(agentTrust, agentAddress, minTier);
                if (!result.passed) {
                    throw new types_js_1.TrustCheckFailedError(result.address, result.tier, minTier);
                }
                return input;
            },
        });
        this.agentAddress = agentAddress;
        this.minTier = (minTier ?? 'bronze');
        this.agentTrustInstance = agentTrust;
    }
    /**
     * The agent address being checked by this gate.
     */
    getAgentAddress() {
        return this.agentAddress;
    }
    /**
     * The minimum tier required to pass through this gate.
     */
    getMinTier() {
        return this.minTier;
    }
}
exports.RunnableTrustGate = RunnableTrustGate;
