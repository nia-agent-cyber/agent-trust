/**
 * agent_trust_check — get trust tier and score for an agent address
 */

import { ethers } from 'ethers';
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import type { CheckInput, CheckOutput, SdkNetworkName } from '../types.js';

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function rpcUrl(network: string): string {
  return network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
}

function toSdkNetwork(network: string): SdkNetworkName {
  return network === 'base-sepolia' ? 'baseSepolia' : 'base';
}

export async function runCheck(input: CheckInput): Promise<CheckOutput> {
  const address = (input.address ?? '').trim();

  if (!ETH_ADDRESS_RE.test(address)) {
    return errorResult(address, 'Invalid address: must be a valid Ethereum address (0x...)');
  }

  const network = input.network ?? 'base';

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl(network));
    const trust = new AgentTrust({ network: toSdkNetwork(network), provider });

    const [tierResult, scoreResult] = await Promise.all([
      trust.getTier(address),
      trust.getScore(address),
    ]);

    const tier: number = typeof tierResult === 'number' ? tierResult : (tierResult as { tier: number }).tier;
    const tierName: string =
      typeof tierResult === 'object' && tierResult !== null && 'tierName' in tierResult
        ? (tierResult as { tierName: string }).tierName
        : tierNumberToName(tier);

    const score: number = typeof scoreResult === 'number' ? scoreResult : (scoreResult as { score: number }).score;
    const attestationCount: number =
      typeof scoreResult === 'object' && scoreResult !== null && 'attestationCount' in scoreResult
        ? (scoreResult as { attestationCount: number }).attestationCount
        : 0;
    const updatedAt: number | null =
      typeof scoreResult === 'object' && scoreResult !== null && 'updatedAt' in scoreResult
        ? ((scoreResult as { updatedAt?: number | null }).updatedAt ?? null)
        : null;

    return { address, tier, tierName, score, attestationCount, updatedAt };
  } catch (err: unknown) {
    return errorResult(address, err instanceof Error ? err.message : String(err));
  }
}

function tierNumberToName(tier: number): string {
  const names: Record<number, string> = {
    0: 'New',
    1: 'Contributor',
    2: 'Trusted',
    3: 'Verified',
    4: 'Expert',
  };
  return names[tier] ?? 'Unknown';
}

function errorResult(address: string, error: string): CheckOutput {
  return { address, tier: 0, tierName: 'New', score: 0, attestationCount: 0, updatedAt: null, error };
}
