/**
 * agent_trust_query — fetch attestation history for an agent
 */

import { ethers } from 'ethers';
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import type { QueryInput, QueryOutput, SdkNetworkName } from '../types.js';

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function rpcUrl(network: string): string {
  return network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
}

function toSdkNetwork(network: string): SdkNetworkName {
  return network === 'base-sepolia' ? 'baseSepolia' : 'base';
}

export async function runQuery(input: QueryInput): Promise<QueryOutput> {
  const address = (input.address ?? '').trim();

  if (!ETH_ADDRESS_RE.test(address)) {
    return errorResult(address, 'Invalid address: must be a valid Ethereum address (0x...)');
  }

  const network = input.network ?? 'base';
  const type = input.type ?? 'all';

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl(network));
    const trust = new AgentTrust({ network: toSdkNetwork(network), provider });

    let paymentReliable: unknown[] | undefined;
    let taskCompletion: unknown[] | undefined;
    let securityAudit: unknown[] | undefined;

    if (type === 'all' || type === 'PaymentReliable') {
      paymentReliable = await trust.getPaymentReliability(address);
    }
    if (type === 'all' || type === 'TaskCompletion') {
      taskCompletion = await trust.getTaskCompletions(address);
    }
    if (type === 'all' || type === 'SecurityAudit') {
      securityAudit = await trust.getSecurityAudits(address);
    }

    const byType: Record<string, number> = {};
    if (paymentReliable !== undefined) byType['PaymentReliable'] = paymentReliable.length;
    if (taskCompletion !== undefined) byType['TaskCompletion'] = taskCompletion.length;
    if (securityAudit !== undefined) byType['SecurityAudit'] = securityAudit.length;

    const totalAttestations = Object.values(byType).reduce((a, b) => a + b, 0);

    return {
      address,
      paymentReliable,
      taskCompletion,
      securityAudit,
      summary: { totalAttestations, byType },
    };
  } catch (err: unknown) {
    return errorResult(address, err instanceof Error ? err.message : String(err));
  }
}

function errorResult(address: string, error: string): QueryOutput {
  return {
    address,
    summary: { totalAttestations: 0, byType: {} },
    error,
  };
}
