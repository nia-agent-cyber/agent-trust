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
import type { AgentTrustLike, TrustCheckResult, TrustGuardOptions } from './types.js';
export type { AgentTrustLike };
/**
 * Imperative trust guard — wraps the trust check and throws on failure.
 */
export declare class TrustGuard {
    private agentTrust;
    constructor(agentTrust: AgentTrustLike);
    /**
     * Check an agent's trust tier and throw if it does not meet the minimum.
     *
     * @param agentAddress - Ethereum wallet address to check
     * @param options - Check options (minTier, rpcUrl, network)
     * @returns TrustCheckResult if the check passes
     * @throws TrustCheckFailedError if the tier is below the minimum
     */
    check(agentAddress: string, options?: TrustGuardOptions): Promise<TrustCheckResult>;
    /**
     * Static version: check an agent's trust tier and throw if it does not meet the minimum.
     *
     * @param agentTrust - AgentTrust instance to use for the check
     * @param agentAddress - Ethereum wallet address to check
     * @param options - Check options (minTier, rpcUrl, network)
     * @returns TrustCheckResult if the check passes
     * @throws TrustCheckFailedError if the tier is below the minimum
     */
    static check(agentTrust: AgentTrustLike, agentAddress: string, options?: TrustGuardOptions): Promise<TrustCheckResult>;
}
