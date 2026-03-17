/**
 * createTrustMiddleware — factory for quick setup
 */
import { TrustCheckTool } from './trust-tool.js';
import { TrustGate } from './trust-gate.js';
import { TrustMiddlewareConfig } from './types.js';
export interface TrustMiddleware {
    tool: TrustCheckTool;
    gate: TrustGate;
}
/**
 * Create a TrustCheckTool + TrustGate pair from a shared config.
 *
 * @example
 * const { tool, gate } = createTrustMiddleware({
 *   agentTrust,
 *   requiredTier: 'contributor',
 *   addressKey: 'counterpartyAddress',
 * });
 */
export declare function createTrustMiddleware(config: TrustMiddlewareConfig): TrustMiddleware;
