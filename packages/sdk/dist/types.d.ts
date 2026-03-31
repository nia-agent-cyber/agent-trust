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
export type TaskOutcome = 'completed' | 'failed' | 'disputed';
export interface TaskCompletionRequest {
    /** Subject agent address to attest about */
    subjectAgent: string;
    /** Task outcome classification */
    outcome: TaskOutcome;
    /** Unique task/bounty identifier from the issuing platform */
    taskId: string;
    /** Task category (e.g. code, design, writing, review, other) */
    category: string;
    /** Completion timestamp (unix seconds/ms, Date, or ISO string) */
    completedAt: string | number | Date;
    /** Reward amount in base units (default 0) */
    reward?: string | number | bigint;
    /** Token/currency symbol (e.g. USDC, ETH, GTC) — empty string if no reward */
    rewardToken?: string;
    /** Optional external reference (bounty URL, PR link, IPFS CID) */
    taskRef?: string;
}
export interface NormalizedTaskCompletion {
    subjectAgent: string;
    outcome: TaskOutcome;
    outcomeCode: 0 | 1 | 2;
    taskId: string;
    category: string;
    completedAt: bigint;
    reward: bigint;
    rewardToken: string;
    taskRef: string;
}
export interface TaskCompletionResult {
    /** Whether attestation succeeded */
    success: boolean;
    /** Attestation UID (if successful) */
    attestationUid?: string;
    /** Transaction hash */
    txHash?: string;
    /** Error message (if failed) */
    error?: string;
}
export interface TaskCompletionAttestation {
    uid: string;
    attester: string;
    recipient: string;
    subjectAgent: string;
    outcome: TaskOutcome;
    taskId: string;
    category: string;
    completedAt: number;
    reward: string;
    rewardToken: string;
    taskRef: string;
    time: number;
    revoked: boolean;
}
/** Severity level for a security audit (matches uint8 on-chain) */
export type AuditSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';
export interface SecurityAuditRequest {
    /** Address of the auditor performing the audit */
    auditor: string;
    /** Address of the subject being audited */
    subject: string;
    /**
     * Type of audit performed.
     * Known values: "smart-contract", "dependency-scan", "penetration-test", "code-review", "fuzzing"
     */
    auditType: string;
    /** Severity of findings (number 0-4 or string like "high") */
    severity: number | AuditSeverity;
    /** Whether the subject passed the audit */
    passed: boolean;
    /** URI to the full audit report (IPFS CID, URL, etc.) */
    reportUri?: string;
    /** Audit timestamp (unix seconds/ms, Date, or ISO string). Defaults to now. */
    timestamp?: string | number | Date;
}
export interface NormalizedSecurityAudit {
    auditor: string;
    subject: string;
    auditType: string;
    severity: AuditSeverity;
    severityCode: 0 | 1 | 2 | 3 | 4;
    passed: boolean;
    reportUri: string;
    timestamp: bigint;
}
export interface SecurityAuditResult {
    /** Whether attestation succeeded */
    success: boolean;
    /** Attestation UID (if successful) */
    attestationUid?: string;
    /** Transaction hash */
    txHash?: string;
    /** Error message (if failed) */
    error?: string;
}
export interface SecurityAuditAttestation {
    uid: string;
    attester: string;
    recipient: string;
    auditor: string;
    subject: string;
    auditType: string;
    severity: AuditSeverity;
    passed: boolean;
    reportUri: string;
    timestamp: number;
    time: number;
    revoked: boolean;
}
export interface AgentTrustConfig {
    /** Network to use */
    network: 'base' | 'baseSepolia';
    /** Ethers provider or signer */
    provider: any;
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
