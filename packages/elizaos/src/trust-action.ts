/**
 * TrustCheckAction — ElizaOS Action that looks up trust tier for a wallet address.
 */

import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from './eliza-types.js';
import { TrustCheckActionConfig, TrustCheckResult, TierName } from './types.js';
import { tierLevelToName, extractTierLevel, extractScore, tierMeetsMinimum, isValidAddress } from './tier-utils.js';

const DEFAULT_NAME = 'CHECK_AGENT_TRUST';
const DEFAULT_DESCRIPTION =
  'Check the on-chain trust tier of a wallet address using the Agent Trust network. ' +
  'Provide an Ethereum wallet address in the message to look up tier level and score.';

/**
 * Extract a wallet address from a message.
 * Checks message.content[addressKey] first, then scans content.text for 0x... patterns.
 */
function extractAddress(message: Memory, addressKey: string): string | null {
  // 1. Try explicit key
  const explicit = (message.content as Record<string, unknown>)[addressKey];
  if (typeof explicit === 'string' && /^0x[0-9a-fA-F]{40}$/.test(explicit)) {
    return explicit;
  }

  // 2. Scan the text for an Ethereum address
  const text = message.content.text ?? '';
  const match = text.match(/0x[0-9a-fA-F]{40}/);
  return match ? match[0] : null;
}

/**
 * Create a TrustCheckAction ElizaOS Action.
 */
export function createTrustCheckAction(config: TrustCheckActionConfig): Action {
  const addressKey = config.addressKey ?? 'address';
  const name = config.name ?? DEFAULT_NAME;
  const description = config.description ?? DEFAULT_DESCRIPTION;
  const requiredTier = config.requiredTier;

  return {
    name,
    similes: ['TRUST_CHECK', 'CHECK_TRUST', 'AGENT_TRUST', 'VERIFY_AGENT_TRUST'],
    description,

    async validate(_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> {
      const address = extractAddress(message, addressKey);
      return isValidAddress(address);
    },

    async handler(
      _runtime: IAgentRuntime,
      message: Memory,
      _state?: State,
      _options?: Record<string, unknown>,
      callback?: HandlerCallback
    ): Promise<boolean> {
      const address = extractAddress(message, addressKey);

      if (!isValidAddress(address)) {
        if (callback) {
          await callback({
            text: 'No valid Ethereum address found in the message.',
            trustCheck: { error: 'invalid address' },
          });
        }
        return false;
      }

      try {
        const [tierResult, scoreResult] = await Promise.all([
          config.agentTrust.getTier(address),
          config.agentTrust.getScore(address),
        ]);

        const level = extractTierLevel(tierResult);
        const score = extractScore(scoreResult);
        const tierName: TierName = tierLevelToName(level);

        const meets = requiredTier ? tierMeetsMinimum(tierName, requiredTier) : undefined;

        const result: TrustCheckResult = {
          address,
          tier: { level, name: tierName, score },
          meets,
          requiredTier,
        };

        const meetsText = meets !== undefined
          ? ` ${meets ? '✅ Meets' : '❌ Does not meet'} required tier: ${requiredTier}.`
          : '';

        if (callback) {
          await callback({
            text: `Agent ${address.slice(0, 10)}... has trust tier: ${tierName} (level ${level}, score ${score}).${meetsText}`,
            trustCheck: result,
          });
        }

        return true;
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        if (callback) {
          await callback({
            text: `Trust check failed: ${msg}`,
            trustCheck: { address, error: msg },
          });
        }
        return false;
      }
    },

    examples: [
      [
        { user: 'user', content: { text: 'Check trust for 0xabc123...1234' } },
        { user: 'agent', content: { text: 'Agent 0xabc123... has trust tier: contributor (level 1, score 45).' } },
      ],
    ],
  };
}
