/**
 * TrustProvider — ElizaOS Provider that enriches agent state with trust tier context.
 *
 * Returns a formatted string describing the trust status of an agent address,
 * which ElizaOS injects into the system prompt / state context for each turn.
 */

import type { Provider, IAgentRuntime, Memory, State } from './eliza-types.js';
import { TrustProviderConfig } from './types.js';
import { tierLevelToName, extractTierLevel, extractScore, isValidAddress } from './tier-utils.js';

/**
 * Extract wallet address from message content or state.
 */
function extractAddress(message: Memory, state: State | undefined, addressKey: string): string | null {
  // 1. Check message content
  const explicit = (message.content as Record<string, unknown>)[addressKey];
  if (typeof explicit === 'string' && /^0x[0-9a-fA-F]{40}$/.test(explicit)) {
    return explicit;
  }

  // 2. Check state
  if (state?.[addressKey] && typeof state[addressKey] === 'string') {
    if (/^0x[0-9a-fA-F]{40}$/.test(state[addressKey])) {
      return state[addressKey] as string;
    }
  }

  // 3. Scan message text
  const text = message.content.text ?? '';
  const match = text.match(/0x[0-9a-fA-F]{40}/);
  return match ? match[0] : null;
}

/**
 * Create a TrustProvider ElizaOS Provider.
 */
export function createTrustProvider(config: TrustProviderConfig): Provider {
  const addressKey = config.addressKey ?? 'address';

  return {
    async get(_runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> {
      const address = extractAddress(message, state, addressKey);

      if (!isValidAddress(address)) {
        return '[Trust] No wallet address found — cannot determine trust tier.';
      }

      try {
        const [tierResult, scoreResult] = await Promise.all([
          config.agentTrust.getTier(address),
          config.agentTrust.getScore(address),
        ]);

        const level = extractTierLevel(tierResult);
        const score = extractScore(scoreResult);
        const tierName = tierLevelToName(level);

        return [
          `[Trust Context]`,
          `Address: ${address}`,
          `Tier: ${tierName} (level ${level})`,
          `Score: ${score}`,
          `Verified: ${level >= 3 ? 'yes' : 'no'}`,
        ].join('\n');
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'unknown error';
        return `[Trust] Error fetching trust data for ${address}: ${msg}`;
      }
    },
  };
}
