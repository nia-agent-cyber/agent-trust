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
export function createTrustMiddleware(config: TrustMiddlewareConfig): TrustMiddleware {
  const tool = new TrustCheckTool({
    agentTrust: config.agentTrust,
    requiredTier: config.requiredTier,
  });

  const gate = new TrustGate({
    agentTrust: config.agentTrust,
    requiredTier: config.requiredTier ?? 'contributor',
    addressKey: config.addressKey,
  });

  return { tool, gate };
}
