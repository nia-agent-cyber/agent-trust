/**
 * Shared types for MCP tool inputs and outputs
 */

// User-facing network names (mapped to SDK names internally)
export type NetworkName = 'base' | 'base-sepolia';
// SDK internal network name
export type SdkNetworkName = 'base' | 'baseSepolia';

export type AttestationType = 'PaymentReliable' | 'TaskCompletion' | 'SecurityAudit';

// ─── agent_trust_check ────────────────────────────────────────────────────────

export interface CheckInput {
  address: string;
  network?: NetworkName;
}

export interface CheckOutput {
  address: string;
  tier: number;
  tierName: string;
  score: number;
  attestationCount: number;
  updatedAt: number | null;
  error?: string;
}

// ─── agent_trust_issue ────────────────────────────────────────────────────────

export interface IssueInput {
  type: AttestationType;
  subjectAgent: string;
  network?: NetworkName;
  // PaymentReliable
  amount?: number;
  currency?: string;
  outcome?: 'paid' | 'partial' | 'failed';
  paidAt?: number;
  // TaskCompletion
  taskId?: string;
  category?: string;
  taskOutcome?: 'completed' | 'failed' | 'disputed';
  completedAt?: number;
  reward?: number;
  rewardToken?: string;
  taskRef?: string;
  // SecurityAudit
  subject?: string;
  auditType?: string;
  passed?: boolean;
  severity?: number;
  auditRef?: string;
}

export interface IssueOutput {
  success: boolean;
  attestationUid?: string;
  txHash?: string;
  error?: string;
}

// ─── agent_trust_query ────────────────────────────────────────────────────────

export interface QueryInput {
  address: string;
  type?: AttestationType | 'all';
  network?: NetworkName;
}

export interface QueryOutput {
  address: string;
  paymentReliable?: unknown[];
  taskCompletion?: unknown[];
  securityAudit?: unknown[];
  summary: {
    totalAttestations: number;
    byType: Record<string, number>;
  };
  error?: string;
}
