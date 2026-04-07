/**
 * agent_trust_issue — issue a trust attestation for an agent
 */

import { ethers } from 'ethers';
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import type { IssueInput, IssueOutput, SdkNetworkName } from '../types.js';

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function rpcUrl(network: string): string {
  return network === 'base' ? 'https://mainnet.base.org' : 'https://sepolia.base.org';
}

function toSdkNetwork(network: string): SdkNetworkName {
  return network === 'base-sepolia' ? 'baseSepolia' : 'base';
}

export async function runIssue(input: IssueInput): Promise<IssueOutput> {
  const privateKey = process.env['AGENT_TRUST_PRIVATE_KEY'];
  if (!privateKey) {
    return {
      success: false,
      error: 'Set AGENT_TRUST_PRIVATE_KEY env var to enable attestation issuance.',
    };
  }

  const subjectAgent = (input.subjectAgent ?? '').trim();
  if (!ETH_ADDRESS_RE.test(subjectAgent)) {
    return { success: false, error: 'Invalid subjectAgent: must be a valid Ethereum address (0x...)' };
  }

  if (!input.type) {
    return { success: false, error: 'Missing required field: type (PaymentReliable | TaskCompletion | SecurityAudit)' };
  }

  const network = input.network ?? 'base';

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl(network));
    const wallet = new ethers.Wallet(privateKey, provider);
    const trust = new AgentTrust({ network: toSdkNetwork(network), provider: wallet });

    if (input.type === 'PaymentReliable') {
      const result = await trust.issuePaymentReliable({
        subjectAgent,
        amount: input.amount ?? 0,
        currency: input.currency ?? 'ETH',
        outcome: mapPaymentOutcome(input.outcome),
        dueAt: input.paidAt ?? Math.floor(Date.now() / 1000),
        paidAt: input.paidAt ?? Math.floor(Date.now() / 1000),
      });
      return {
        success: true,
        attestationUid: result.attestationUid,
        txHash: result.txHash,
      };
    }

    if (input.type === 'TaskCompletion') {
      const result = await trust.issueTaskCompletion({
        subjectAgent,
        taskId: input.taskId ?? '',
        category: input.category ?? 'general',
        outcome: mapTaskOutcome(input.taskOutcome),
        completedAt: input.completedAt ?? Math.floor(Date.now() / 1000),
        reward: input.reward,
        rewardToken: input.rewardToken,
        taskRef: input.taskRef,
      });
      return {
        success: true,
        attestationUid: result.attestationUid,
        txHash: result.txHash,
      };
    }

    if (input.type === 'SecurityAudit') {
      const result = await trust.issueSecurityAudit({
        auditor: wallet.address,
        subject: input.subject ?? subjectAgent,
        auditType: input.auditType ?? 'general',
        passed: input.passed ?? false,
        severity: mapSeverity(input.severity),
        reportUri: input.auditRef,
      });
      return {
        success: true,
        attestationUid: result.attestationUid,
        txHash: result.txHash,
      };
    }

    return { success: false, error: `Unknown attestation type: ${input.type}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function mapPaymentOutcome(outcome?: string): 'paid_on_time' | 'paid_late' | 'defaulted' {
  if (outcome === 'paid') return 'paid_on_time';
  if (outcome === 'partial') return 'paid_late';
  return 'defaulted';
}

function mapTaskOutcome(outcome?: string): 'completed' | 'failed' | 'disputed' {
  if (outcome === 'completed') return 'completed';
  if (outcome === 'disputed') return 'disputed';
  return 'failed';
}

function mapSeverity(severity?: number): 'none' | 'low' | 'medium' | 'high' | 'critical' {
  const map: Record<number, 'none' | 'low' | 'medium' | 'high' | 'critical'> = {
    0: 'none',
    1: 'low',
    2: 'medium',
    3: 'high',
    4: 'critical',
  };
  return (severity !== undefined && map[severity]) ? map[severity] : 'none';
}
