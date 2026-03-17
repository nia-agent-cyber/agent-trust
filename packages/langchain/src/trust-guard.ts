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

import type { AgentTrustLike, TrustCheckResult, TrustGuardOptions, TierName } from './types.js';
import { TrustCheckFailedError } from './types.js';
import { performTrustCheck } from './trust-check-tool.js';

// Re-export for convenience (avoids needing to import from ./types separately)
export type { AgentTrustLike };

/**
 * Imperative trust guard — wraps the trust check and throws on failure.
 */
export class TrustGuard {
  private agentTrust: AgentTrustLike;

  constructor(agentTrust: AgentTrustLike) {
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
  async check(agentAddress: string, options: TrustGuardOptions = {}): Promise<TrustCheckResult> {
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
  static async check(
    agentTrust: AgentTrustLike,
    agentAddress: string,
    options: TrustGuardOptions = {},
  ): Promise<TrustCheckResult> {
    const minTier: TierName = options.minTier ?? 'bronze';
    const result = await performTrustCheck(agentTrust, agentAddress, minTier);

    if (!result.passed) {
      throw new TrustCheckFailedError(result.address, result.tier, minTier);
    }

    return result;
  }
}
