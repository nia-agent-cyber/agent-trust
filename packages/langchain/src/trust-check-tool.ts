/**
 * TrustCheckTool — LangChain StructuredTool for checking agent trust tiers.
 *
 * Drop this into your LangChain agent's tool list to give the agent the ability
 * to look up any address's trust tier and check whether it meets a minimum tier.
 *
 * @example
 * ```typescript
 * import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
 * import { TrustCheckTool } from '@nia-agent-cyber/agent-trust-langchain';
 *
 * const agentTrust = new AgentTrust({ network: 'base', provider });
 * const tool = new TrustCheckTool(agentTrust);
 *
 * // Inside an agent:
 * const result = await tool.invoke({ agentAddress: '0x...', minTier: 'silver' });
 * ```
 */

import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { AgentTrustLike, TrustCheckResult, TierName } from './types.js';
import { sdkTierToName, tierMeetsMinimum } from './tier-utils.js';
import { TIER_ORDER } from './types.js';

const TrustCheckInput = z.object({
  /** Ethereum wallet address of the agent to check */
  agentAddress: z.string().describe('Ethereum wallet address of the agent to check (0x...)'),
  /** Minimum tier required. Defaults to "bronze". */
  minTier: z
    .enum(TIER_ORDER as unknown as [string, ...string[]])
    .optional()
    .describe(
      'Minimum tier required. One of: unverified, bronze, silver, gold, platinum. Defaults to "bronze".',
    ),
});

type TrustCheckInput = z.infer<typeof TrustCheckInput>;

/**
 * LangChain StructuredTool that checks an agent's trust tier.
 *
 * Returns a JSON string with the trust check result including:
 * - address, tier, score, passed (boolean), reason
 */
export class TrustCheckTool extends StructuredTool<typeof TrustCheckInput> {
  name = 'trust_check';
  description =
    'Check the trust tier of an agent address. Returns the trust tier, score, and whether it meets the minimum requirement. ' +
    'Tier order (lowest to highest): unverified < bronze < silver < gold < platinum.';
  schema = TrustCheckInput;

  private agentTrust: AgentTrustLike;

  constructor(agentTrust: AgentTrustLike) {
    super();
    this.agentTrust = agentTrust;
  }

  /**
   * Execute the trust check.
   */
  async _call(input: TrustCheckInput): Promise<string> {
    const { agentAddress, minTier = 'bronze' } = input;
    const result = await performTrustCheck(this.agentTrust, agentAddress, minTier as TierName);
    return JSON.stringify(result);
  }
}

/**
 * Shared trust check logic used by both TrustCheckTool and TrustGuard.
 */
export async function performTrustCheck(
  agentTrust: AgentTrustLike,
  agentAddress: string,
  minTier: TierName = 'bronze',
): Promise<TrustCheckResult> {
  // Fetch tier and score in parallel
  const [tierInfo, scoreInfo] = await Promise.all([
    agentTrust.getTier(agentAddress),
    agentTrust.getScore(agentAddress),
  ]);

  const tier = sdkTierToName(tierInfo.tier);
  const score = scoreInfo.score;
  const passed = tierMeetsMinimum(tier, minTier);

  const reason = passed
    ? `Agent ${agentAddress} has tier '${tier}' (score: ${score}), which meets the required '${minTier}' tier.`
    : `Agent ${agentAddress} has tier '${tier}' (score: ${score}), which is below the required '${minTier}' tier.`;

  return {
    address: agentAddress,
    tier,
    score,
    passed,
    reason,
  };
}
