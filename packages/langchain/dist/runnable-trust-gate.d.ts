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
import { RunnableLambda } from '@langchain/core/runnables';
import type { TrustGateOptions, TierName } from './types.js';
/**
 * A LangChain Runnable that checks an agent's trust tier before passing
 * the input through to the next step in the chain.
 *
 * - If trust check passes → the input is returned unchanged
 * - If trust check fails → throws `TrustCheckFailedError`
 */
export declare class RunnableTrustGate<TInput = unknown> extends RunnableLambda<TInput, TInput> {
    lc_namespace: string[];
    private readonly agentAddress;
    private readonly minTier;
    private readonly agentTrustInstance;
    constructor(options: TrustGateOptions);
    /**
     * The agent address being checked by this gate.
     */
    getAgentAddress(): string;
    /**
     * The minimum tier required to pass through this gate.
     */
    getMinTier(): TierName;
}
