/**
 * TrustGate — LangChain Runnable that gates chain execution by trust tier
 *
 * Works as a step in a LangChain chain. Reads an address from chain state,
 * checks its trust tier, and either passes the state through or blocks it.
 */
import { TrustGateConfig, TierName } from './types.js';
/**
 * Error thrown when a TrustGate blocks execution and no onBlocked callback is provided.
 */
export declare class TrustGateError extends Error {
    readonly address: string;
    readonly tier: TierName;
    readonly requiredTier: TierName;
    constructor(address: string, tier: TierName, requiredTier: TierName);
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
export declare class TrustGate {
    private config;
    constructor(config: TrustGateConfig);
    /**
     * Invoke the gate with a state object.
     *
     * - Reads `state[addressKey]` as the address to check.
     * - If the address meets the required tier: returns the state unchanged.
     * - If not: calls `onBlocked(state)` if provided, otherwise throws `TrustGateError`.
     * - If address is missing/invalid: throws TrustGateError with tier='unverified'.
     */
    invoke(state: Record<string, unknown>): Promise<Record<string, unknown>>;
    private _block;
    /**
     * Compose this gate with another runnable (pipe).
     * Returns a simple composed function (no LangChain dependency required).
     */
    pipe<T>(next: {
        invoke(input: Record<string, unknown>): Promise<T>;
    }): {
        invoke(state: Record<string, unknown>): Promise<T>;
    };
    /**
     * Returns a LangChain Runnable wrapping this gate.
     * Use this to integrate with LangChain chains.
     */
    toLangChainRunnable(): unknown;
}
