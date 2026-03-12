/**
 * Type definitions for Agent Trust SDK
 */

export interface TrustScore {
  /** Overall trust score (0-100) */
  score: number;
  /** Confidence level (0-1) */
  confidence: number;
  /** Number of attestations contributing to score */
  attestationCount: number;
  /** Whether the agent is verified */
  verified: boolean;
  /** Linked platforms (twitter, github, etc.) */
  linkedPlatforms: string[];
  /** Last updated timestamp */
  updatedAt: number;
}

export interface VerificationResult {
  /** Whether verification succeeded */
  success: boolean;
  /** Attestation UID (if successful) */
  attestationUid?: string;
  /** Transaction hash */
  txHash?: string;
  /** Error message (if failed) */
  error?: string;
}

export interface VouchResult {
  /** Whether vouch succeeded */
  success: boolean;
  /** Attestation UID (if successful) */
  attestationUid?: string;
  /** Transaction hash */
  txHash?: string;
  /** Error message (if failed) */
  error?: string;
}

export interface FlagResult {
  /** Whether flag succeeded */
  success: boolean;
  /** Attestation UID (if successful) */
  attestationUid?: string;
  /** Transaction hash */
  txHash?: string;
  /** Error message (if failed) */
  error?: string;
}

export interface VerificationRequest {
  /** Agent's address or identifier */
  agentId: string;
  /** Platform to verify (twitter, github, etc.) */
  platform: 'twitter' | 'github' | 'email';
  /** Handle on the platform */
  handle: string;
  /** Proof of ownership (signed message, tweet URL, etc.) */
  proof: string;
}

export interface VouchRequest {
  /** Agent to vouch for */
  agentId: string;
  /** Trust level (1-5) */
  trustLevel: 1 | 2 | 3 | 4 | 5;
  /** Context/reason for vouch */
  context?: string;
  /** Evidence hash (IPFS, etc.) */
  evidenceHash?: string;
}

export interface FlagRequest {
  /** Agent to flag */
  agentId: string;
  /** Severity (1-5) */
  severity: 1 | 2 | 3 | 4 | 5;
  /** Reason for flag */
  reason: string;
  /** Evidence hash (IPFS, etc.) */
  evidenceHash?: string;
}

export type PaymentOutcome = 'paid_on_time' | 'paid_late' | 'defaulted';

export interface PaymentReliableRequest {
  /** Subject agent address to attest about */
  subjectAgent: string;
  /** Payment outcome classification */
  outcome: PaymentOutcome;
  /** Amount in smallest/base units (non-negative integer) */
  amount: string | number | bigint;
  /** Currency or token symbol (e.g. USD, USDC, ETH) */
  currency: string;
  /** Due timestamp (unix seconds/ms, Date, or ISO string) */
  dueAt: string | number | Date;
  /** Paid timestamp (required unless outcome=defaulted) */
  paidAt?: string | number | Date | null;
  /** Optional settlement reference (invoice ID, tx hash, escrow ref) */
  settlementRef?: string;
}

export interface NormalizedPaymentReliable {
  subjectAgent: string;
  outcome: PaymentOutcome;
  outcomeCode: 0 | 1 | 2;
  amount: bigint;
  currency: string;
  dueAt: bigint;
  paidAt: bigint;
  settlementRef: string;
}

export interface PaymentReliableResult {
  /** Whether attestation succeeded */
  success: boolean;
  /** Attestation UID (if successful) */
  attestationUid?: string;
  /** Transaction hash */
  txHash?: string;
  /** Error message (if failed) */
  error?: string;
}

export interface PaymentReliableAttestation {
  uid: string;
  attester: string;
  recipient: string;
  subjectAgent: string;
  outcome: PaymentOutcome;
  amount: string;
  currency: string;
  dueAt: number;
  paidAt: number;
  settlementRef: string;
  time: number;
  revoked: boolean;
}

export interface AgentTrustConfig {
  /** Network to use */
  network: 'base' | 'baseSepolia';
  /** Ethers provider or signer */
  provider: any; // ethers.Provider | ethers.Signer
  /** Optional: custom EAS address */
  easAddress?: string;
  /** Optional: Twitter API Bearer token for tweet verification */
  twitterApiKey?: string;
  /** Optional: ERC-8004 registry address overrides */
  erc8004?: {
    identityRegistry?: string;
    reputationRegistry?: string;
    validationRegistry?: string;
  };
}
