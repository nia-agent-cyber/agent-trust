/**
 * createAgentTrustPlugin — factory that creates a complete ElizaOS Plugin
 * bundling TrustCheckAction, TrustGuardEvaluator, and TrustProvider.
 */

import type { Plugin } from './eliza-types.js';
import { AgentTrustPluginConfig } from './types.js';
import { createTrustCheckAction } from './trust-action.js';
import { createTrustGuardEvaluator } from './trust-evaluator.js';
import { createTrustProvider } from './trust-provider.js';

/**
 * Create a complete Agent Trust ElizaOS plugin.
 *
 * @example
 * ```typescript
 * const plugin = createAgentTrustPlugin({
 *   agentTrust,
 *   requiredTier: 'contributor',
 *   addressKey: 'callerAddress',
 * });
 * const runtime = new AgentRuntime({ plugins: [plugin], ... });
 * ```
 */
export function createAgentTrustPlugin(config: AgentTrustPluginConfig): Plugin {
  const addressKey = config.addressKey ?? 'address';
  const requiredTier = config.requiredTier ?? 'contributor';

  const action = createTrustCheckAction({
    agentTrust: config.agentTrust,
    addressKey,
    requiredTier,
  });

  const evaluator = createTrustGuardEvaluator({
    agentTrust: config.agentTrust,
    requiredTier,
    addressKey,
  });

  const provider = createTrustProvider({
    agentTrust: config.agentTrust,
    addressKey,
  });

  return {
    name: 'agent-trust',
    description: `Agent Trust plugin — trust-gated actions and tier verification (required: ${requiredTier})`,
    actions: [action],
    evaluators: [evaluator],
    providers: [provider],
  };
}
