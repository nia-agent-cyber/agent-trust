/**
 * TrustGate — LangChain Runnable that gates chain execution by trust tier
 *
 * Works as a step in a LangChain chain. Reads an address from chain state,
 * checks its trust tier, and either passes the state through or blocks it.
 */

import { TrustGateConfig, TierName } from './types.js';
import { tierLevelToName, tierMeetsMinimum, extractTierLevel } from './tier-utils.js';

/**
 * Error thrown when a TrustGate blocks execution and no onBlocked callback is provided.
 */
export class TrustGateError extends Error {
  readonly address: string;
  readonly tier: TierName;
  readonly requiredTier: TierName;

  constructor(address: string, tier: TierName, requiredTier: TierName) {
    super(
      `Trust gate blocked: address ${address} has tier '${tier}' but requires '${requiredTier}'`
    );
    this.name = 'TrustGateError';
    this.address = address;
    this.tier = tier;
    this.requiredTier = requiredTier;
  }
}

/**
 * TrustGate
 *
 * A LangChain-compatible Runnable that gates chain execution by trust tier.
 *
 * Usage in a chain:
 *   const chain = gate.pipe(myTool);
 *   const result = await chain.invoke({ address: '0x...', ...otherState });
 *
 * Usage with LangChain:
 *   gate.toLangChainRunnable() — returns a LangChain Runnable instance
 */
export class TrustGate {
  private config: Required<Omit<TrustGateConfig, 'onBlocked'>> & {
    onBlocked?: TrustGateConfig['onBlocked'];
  };

  constructor(config: TrustGateConfig) {
    this.config = {
      agentTrust: config.agentTrust,
      requiredTier: config.requiredTier,
      addressKey: config.addressKey ?? 'address',
      onBlocked: config.onBlocked,
    };
  }

  /**
   * Invoke the gate with a state object.
   *
   * - Reads `state[addressKey]` as the address to check.
   * - If the address meets the required tier: returns the state unchanged.
   * - If not: calls `onBlocked(state)` if provided, otherwise throws `TrustGateError`.
   * - If address is missing/invalid: throws TrustGateError with tier='unverified'.
   */
  async invoke(state: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { agentTrust, requiredTier, addressKey } = this.config;

    const address = state[addressKey];

    // Validate address
    if (typeof address !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return this._block(
        typeof address === 'string' ? address : '(missing)',
        'unverified',
        requiredTier,
        state,
        `Missing or invalid address at state key '${addressKey}'`
      );
    }

    // Zero-address guard
    if (/^0x0{40}$/i.test(address)) {
      return this._block(address, 'unverified', requiredTier, state);
    }

    const tierResult = await agentTrust.getTier(address);
    const level = extractTierLevel(tierResult);
    const tierName = tierLevelToName(level);

    if (tierMeetsMinimum(tierName, requiredTier)) {
      // Trust check passed — pass state through unchanged
      return state;
    }

    return this._block(address, tierName, requiredTier, state);
  }

  private _block(
    address: string,
    tier: TierName,
    requiredTier: TierName,
    state: Record<string, unknown>,
    _reason?: string
  ): Record<string, unknown> {
    if (this.config.onBlocked) {
      return this.config.onBlocked(state);
    }
    throw new TrustGateError(address, tier, requiredTier);
  }

  /**
   * Compose this gate with another runnable (pipe).
   * Returns a simple composed function (no LangChain dependency required).
   */
  pipe<T>(
    next: { invoke(input: Record<string, unknown>): Promise<T> }
  ): { invoke(state: Record<string, unknown>): Promise<T> } {
    return {
      invoke: async (state: Record<string, unknown>): Promise<T> => {
        const gated = await this.invoke(state);
        return next.invoke(gated);
      },
    };
  }

  /**
   * Returns a LangChain Runnable wrapping this gate.
   * Use this to integrate with LangChain chains.
   */
  toLangChainRunnable(): unknown {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { RunnableLambda } = require('@langchain/core/runnables');
      return RunnableLambda.from((state: Record<string, unknown>) => this.invoke(state));
    } catch {
      throw new Error(
        'Failed to create LangChain Runnable. Make sure @langchain/core is installed as a peer dependency.'
      );
    }
  }
}
