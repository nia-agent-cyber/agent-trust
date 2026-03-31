/**
 * TrustGuardEvaluator — ElizaOS Evaluator that guards responses for trusted agents only.
 *
 * Called after the agent processes a message. If the sender's address does not meet
 * the required trust tier, the evaluator logs a warning (or can be used to suppress output).
 */

import type { Evaluator, IAgentRuntime, Memory, State } from './eliza-types.js';
import { TrustGuardEvaluatorConfig } from './types.js';
import { tierLevelToName, extractTierLevel, tierMeetsMinimum, isValidAddress } from './tier-utils.js';

const DEFAULT_NAME = 'TRUST_GUARD';

/**
 * Extract wallet address from message content.
 */
function extractAddress(message: Memory, addressKey: string): string | null {
  const explicit = (message.content as Record<string, unknown>)[addressKey];
  if (typeof explicit === 'string' && /^0x[0-9a-fA-F]{40}$/.test(explicit)) {
    return explicit;
  }
  const text = message.content.text ?? '';
  const match = text.match(/0x[0-9a-fA-F]{40}/);
  return match ? match[0] : null;
}

/**
 * Create a TrustGuardEvaluator ElizaOS Evaluator.
 *
 * The evaluator:
 * 1. Extracts an Ethereum address from the message
 * 2. Looks up its trust tier
 * 3. Compares against the configured requiredTier
 * 4. Adds `trustGuardResult` to the state for downstream use
 */
export function createTrustGuardEvaluator(config: TrustGuardEvaluatorConfig): Evaluator {
  const addressKey = config.addressKey ?? 'address';
  const name = config.name ?? DEFAULT_NAME;

  return {
    name,
    similes: ['TRUST_EVALUATOR', 'GUARD_EVALUATOR', 'AGENT_TRUST_GUARD'],
    description: `Guards agent execution by verifying the sender meets minimum trust tier: ${config.requiredTier}`,
    alwaysRun: false,

    async validate(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> {
      const address = extractAddress(message, addressKey);
      return isValidAddress(address);
    },

    async handler(runtime: IAgentRuntime, message: Memory, state?: State): Promise<void> {
      const address = extractAddress(message, addressKey);

      if (!isValidAddress(address)) {
        // Attach result to state for downstream actions
        if (state) {
          state.trustGuardResult = {
            address: null,
            passed: false,
            error: 'No valid address found',
          };
        }
        return;
      }

      try {
        const tierResult = await config.agentTrust.getTier(address);
        const level = extractTierLevel(tierResult);
        const tierName = tierLevelToName(level);
        const passed = tierMeetsMinimum(tierName, config.requiredTier);

        if (state) {
          state.trustGuardResult = {
            address,
            passed,
            tier: { level, name: tierName },
            requiredTier: config.requiredTier,
          };
        }

        if (!passed) {
          // Log warning — the consuming agent can check state.trustGuardResult.passed
          console.warn(
            `[TrustGuard][${runtime.agentId}] Address ${address} has tier '${tierName}' but requires '${config.requiredTier}'`
          );
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'unknown error';
        if (state) {
          state.trustGuardResult = {
            address,
            passed: false,
            error: msg,
          };
        }
      }
    },

    examples: [],
  };
}
