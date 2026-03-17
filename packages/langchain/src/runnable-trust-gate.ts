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
import { TrustCheckFailedError } from './types.js';
import { performTrustCheck } from './trust-check-tool.js';

/**
 * A LangChain Runnable that checks an agent's trust tier before passing
 * the input through to the next step in the chain.
 *
 * - If trust check passes → the input is returned unchanged
 * - If trust check fails → throws `TrustCheckFailedError`
 */
export class RunnableTrustGate<TInput = unknown> extends RunnableLambda<TInput, TInput> {
  lc_namespace = ['agent_trust', 'runnables'];

  private readonly agentAddress: string;
  private readonly minTier: TierName;
  private readonly agentTrustInstance: TrustGateOptions['agentTrust'];

  constructor(options: TrustGateOptions) {
    const { agentAddress, minTier = 'bronze', agentTrust } = options;

    // Pass a lambda that performs the trust check and passes the input through.
    // We capture the options via closure since we're calling super() before
    // the instance fields are assigned.
    super({
      func: async (input: TInput): Promise<TInput> => {
        const result = await performTrustCheck(agentTrust, agentAddress, minTier as TierName);
        if (!result.passed) {
          throw new TrustCheckFailedError(result.address, result.tier, minTier as TierName);
        }
        return input;
      },
    });

    this.agentAddress = agentAddress;
    this.minTier = (minTier ?? 'bronze') as TierName;
    this.agentTrustInstance = agentTrust;
  }

  /**
   * The agent address being checked by this gate.
   */
  getAgentAddress(): string {
    return this.agentAddress;
  }

  /**
   * The minimum tier required to pass through this gate.
   */
  getMinTier(): TierName {
    return this.minTier;
  }
}
