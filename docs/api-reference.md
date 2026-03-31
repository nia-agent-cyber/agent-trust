# API Reference

Complete API documentation for the Agent Trust SDK.

## Table of Contents

- [AgentTrust Class](#agenttrust-class)
- [Types](#types)
- [Constants](#constants)
- [Query Functions](#query-functions)
- [Verification Functions](#verification-functions)
- [Scoring Functions](#scoring-functions)

---

## AgentTrust Class

Main SDK class for interacting with the Agent Trust system.

### Constructor

```typescript
new AgentTrust(config: AgentTrustConfig)
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config.network` | `'base' \| 'baseSepolia'` | Yes | Network to connect to |
| `config.provider` | `Provider \| Signer` | Yes | ethers.js provider or signer |
| `config.easAddress` | `string` | No | Custom EAS contract address |
| `config.twitterApiKey` | `string` | No | Twitter API bearer token for tweet verification |

**Example:**

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({
  network: 'base',
  provider
});
```

---

### Methods

#### `getScore(agentId: string): Promise<TrustScore>`

Get the trust score for an agent.

**Parameters:**
- `agentId` - Ethereum address of the agent

**Returns:** `TrustScore` object

**Example:**

```typescript
const score = await agentTrust.getScore('0xC0D7CA6B3C1EF108696ced64F97729177F823189');
// {
//   score: 72.5,
//   confidence: 0.65,
//   attestationCount: 8,
//   verified: true,
//   linkedPlatforms: ['twitter', 'github'],
//   updatedAt: 1707134400000
// }
```

---

#### `getAttestationSummary(agentId: string): Promise<AttestationSummary>`

Get detailed attestation breakdown for an agent.

**Parameters:**
- `agentId` - Ethereum address of the agent

**Returns:** `AttestationSummary` object with verifications, vouches, flags, and trust score

**Example:**

```typescript
const summary = await agentTrust.getAttestationSummary('0x...');
// {
//   address: '0x...',
//   verifications: [{ platform: 'twitter', handle: '@user', attester: '0x...' }],
//   vouches: [{ trustLevel: 4, context: 'Great work', attester: '0x...' }],
//   flags: [],
//   trustScore: { score: 72.5, ... }
// }
```

---

#### `verify(request: VerificationRequest): Promise<VerificationResult>`

Create a verification attestation for an agent.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `request.agentId` | `string` | Agent's Ethereum address |
| `request.platform` | `'twitter' \| 'github' \| 'email'` | Platform being verified |
| `request.handle` | `string` | Handle/username on the platform |
| `request.proof` | `string` | Proof of ownership (tweet URL, gist URL, etc.) |

**Returns:** `VerificationResult`

**Example:**

```typescript
const result = await agentTrust.verify({
  agentId: '0xMyAgent',
  platform: 'twitter',
  handle: 'myhandle',
  proof: 'https://twitter.com/myhandle/status/123456789'
});
```

---

#### `vouch(request: VouchRequest): Promise<VouchResult>`

Vouch for another agent's trustworthiness.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `request.agentId` | `string` | Agent to vouch for |
| `request.trustLevel` | `1 \| 2 \| 3 \| 4 \| 5` | Trust level (1=low, 5=high) |
| `request.context` | `string` | (Optional) Reason for vouch |
| `request.evidenceHash` | `string` | (Optional) IPFS hash of evidence |

**Returns:** `VouchResult`

**Example:**

```typescript
const result = await agentTrust.vouch({
  agentId: '0xTrustedAgent',
  trustLevel: 4,
  context: 'Completed project on time and within budget'
});
```

---

#### `flag(request: FlagRequest): Promise<FlagResult>`

Flag a bad actor.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `request.agentId` | `string` | Agent to flag |
| `request.severity` | `1 \| 2 \| 3 \| 4 \| 5` | Severity (1=minor, 5=critical) |
| `request.reason` | `string` | Reason for flag |
| `request.evidenceHash` | `string` | (Optional) IPFS hash of evidence |

**Returns:** `FlagResult`

**Example:**

```typescript
const result = await agentTrust.flag({
  agentId: '0xBadActor',
  severity: 4,
  reason: 'Scam attempt with fake credentials'
});
```

---

#### `issuePaymentReliable(request: PaymentReliableRequest): Promise<PaymentReliableResult>`

Issue a PaymentReliable attestation for a subject agent.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `request.subjectAgent` | `string` | Subject agent wallet address |
| `request.outcome` | `'paid_on_time' \| 'paid_late' \| 'defaulted'` | Payment outcome |
| `request.amount` | `string \| number \| bigint` | Amount in base units (normalized to uint256 integer) |
| `request.currency` | `string` | Currency/token symbol |
| `request.dueAt` | `string \| number \| Date` | Due timestamp |
| `request.paidAt` | `string \| number \| Date` | Paid timestamp (required unless defaulted) |
| `request.settlementRef` | `string` | Optional settlement reference |

**Returns:** `PaymentReliableResult`

#### `getPaymentReliability(subjectAgent: string): Promise<PaymentReliableAttestation[]>`

Lookup parsed PaymentReliable attestations where the subject agent is recipient.

---

#### `issueTaskCompletion(request: TaskCompletionRequest): Promise<TaskCompletionResult>`

Issue a TaskCompletion attestation for a subject agent.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `request.subjectAgent` | `string` | Subject agent wallet address |
| `request.outcome` | `'completed' \| 'failed' \| 'disputed'` | Task outcome |
| `request.taskId` | `string` | Unique task/bounty identifier from the issuing platform |
| `request.category` | `string` | Task category (e.g. `code`, `design`, `writing`, `review`, `other`) |
| `request.completedAt` | `string \| number \| Date` | Completion timestamp |
| `request.reward` | `string \| number \| bigint` | Reward in base units (default `0`) |
| `request.rewardToken` | `string` | Token/currency symbol (e.g. `USDC`, `ETH`, `GTC`) |
| `request.taskRef` | `string` | Optional external reference (bounty URL, PR link, IPFS CID) |

**Returns:** `TaskCompletionResult`

**Example:**

```typescript
const result = await agentTrust.issueTaskCompletion({
  subjectAgent: '0xBountyHunter',
  outcome: 'completed',
  taskId: 'gitcoin-bounty-1234',
  category: 'code',
  completedAt: new Date(),
  reward: '500000000',
  rewardToken: 'USDC',
  taskRef: 'https://gitcoin.co/bounty/1234',
});
```

---

#### `getTaskCompletions(subjectAgent: string): Promise<TaskCompletionAttestation[]>`

Lookup parsed TaskCompletion attestations where the subject agent is recipient.

**Parameters:**
- `subjectAgent` - Agent wallet address (must be a valid Ethereum address)

**Returns:** Array of `TaskCompletionAttestation`

**Example:**

```typescript
const completions = await agentTrust.getTaskCompletions('0xBountyHunter');
for (const att of completions) {
  console.log(att.outcome, att.taskId, att.reward, att.rewardToken);
}
```

---

#### `issueSecurityAudit(request: SecurityAuditRequest): Promise<SecurityAuditResult>`

Issue a SecurityAudit attestation for a subject address.

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `auditor` | `string` | ✅ | Address of the auditor performing the audit |
| `subject` | `string` | ✅ | Address of the subject being audited (must not be zero address) |
| `auditType` | `string` | ✅ | Type of audit: `"smart-contract"`, `"dependency-scan"`, `"penetration-test"`, `"code-review"`, `"fuzzing"` |
| `severity` | `number \| AuditSeverity` | ✅ | Severity level: `0-4` or `"none"/"low"/"medium"/"high"/"critical"` |
| `passed` | `boolean` | ✅ | Whether the subject passed the audit |
| `reportUri` | `string` | — | URI to the full audit report (IPFS CID, URL, etc.) |
| `timestamp` | `string \| number \| Date` | — | Audit timestamp (defaults to now) |

**Returns:** `SecurityAuditResult`

**Example:**

```typescript
const result = await agentTrust.issueSecurityAudit({
  auditor: '0xAuditorAddress',
  subject: '0xSubjectAddress',
  auditType: 'smart-contract',
  severity: 'critical',
  passed: false,
  reportUri: 'ipfs://QmAuditReport',
  timestamp: new Date(),
});

if (result.success) {
  console.log('SecurityAudit attestation UID:', result.attestationUid);
}
```

---

#### `getSecurityAudits(subjectAddress: string): Promise<SecurityAuditAttestation[]>`

Lookup parsed SecurityAudit attestations where the subject is recipient.

**Parameters:**
- `subjectAddress` - Ethereum address to look up (must be a valid Ethereum address)

**Returns:** Array of `SecurityAuditAttestation`

**Example:**

```typescript
const audits = await agentTrust.getSecurityAudits('0xSubjectAddress');
for (const audit of audits) {
  console.log(audit.auditType, audit.severity, audit.passed, audit.reportUri);
}
```

---

#### `generateTwitterChallenge(agentId: string, handle: string): TwitterChallenge`

Generate a Twitter verification challenge.

**Parameters:**
- `agentId` - Agent's Ethereum address
- `handle` - Twitter handle (with or without @)

**Returns:** `TwitterChallenge` with code, tweet message, and expiration

**Example:**

```typescript
const challenge = agentTrust.generateTwitterChallenge('0xMyAgent', 'myhandle');
console.log(challenge.tweetMessage); // Post this tweet
console.log(challenge.expiresAt);    // Challenge expiration
```

---

#### `completeTwitterVerification(proof: TwitterProof): Promise<VerificationResult>`

Complete Twitter verification with proof.

**Parameters:**
- `proof.tweetUrl` - URL of the verification tweet
- `proof.challenge` - The challenge object from `generateTwitterChallenge`

**Returns:** `VerificationResult`

---

#### `generateGitHubChallenge(agentId: string, username: string): GitHubChallenge`

Generate a GitHub verification challenge.

**Parameters:**
- `agentId` - Agent's Ethereum address
- `username` - GitHub username

**Returns:** `GitHubChallenge` with code, gist content, and expiration

---

#### `completeGitHubVerification(proof: GitHubProof): Promise<VerificationResult>`

Complete GitHub verification with proof.

**Parameters:**
- `proof.gistUrl` - URL of the verification gist
- `proof.challenge` - The challenge object from `generateGitHubChallenge`

**Returns:** `VerificationResult`

---

#### `getNetworkConfig(): NetworkConfig`

Get current network configuration.

**Returns:** Network configuration object

---

#### `areSchemasRegistered(): boolean`

Check if all required schemas are registered.

**Returns:** `true` if all schemas have UIDs

---

## Types

### TrustScore

```typescript
interface TrustScore {
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
```

### VerificationResult / VouchResult / FlagResult

```typescript
interface VerificationResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Attestation UID (if successful) */
  attestationUid?: string;
  /** Transaction hash */
  txHash?: string;
  /** Error message (if failed) */
  error?: string;
}
```

### SecurityAuditRequest

```typescript
type AuditSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

interface SecurityAuditRequest {
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
```

### SecurityAuditResult

```typescript
interface SecurityAuditResult {
  success: boolean;
  attestationUid?: string;
  txHash?: string;
  error?: string;
}
```

### SecurityAuditAttestation

```typescript
interface SecurityAuditAttestation {
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
```

### AuditSeverity

```typescript
type AuditSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';
// Maps to uint8 on-chain: none=0, low=1, medium=2, high=3, critical=4
```

---

### AgentTrustConfig

```typescript
interface AgentTrustConfig {
  /** Network to use */
  network: 'base' | 'baseSepolia';
  /** Ethers provider or signer */
  provider: any;
  /** Optional: custom EAS address */
  easAddress?: string;
  /** Optional: Twitter API Bearer token */
  twitterApiKey?: string;
}
```

### TwitterChallenge

```typescript
interface TwitterChallenge {
  /** Unique challenge code */
  code: string;
  /** Agent's address */
  agentId: string;
  /** Twitter handle */
  handle: string;
  /** Expiration timestamp */
  expiresAt: number;
  /** Full message to tweet */
  tweetMessage: string;
}
```

### GitHubChallenge

```typescript
interface GitHubChallenge {
  /** Unique challenge code */
  code: string;
  /** Agent's address */
  agentId: string;
  /** GitHub username */
  username: string;
  /** Expiration timestamp */
  expiresAt: number;
  /** Content to put in gist */
  gistContent: string;
  /** Suggested gist filename */
  gistFilename: string;
}
```

---

## Constants

### NETWORKS

```typescript
import { NETWORKS } from '@nia-agent-cyber/agent-trust-sdk';

NETWORKS.base       // { chainId: 8453, name: 'Base', rpcUrl: '...', easAddress: '...' }
NETWORKS.baseSepolia // { chainId: 84532, name: 'Base Sepolia', ... }
```

### SCHEMAS

```typescript
import { SCHEMAS } from '@nia-agent-cyber/agent-trust-sdk';

SCHEMAS.verification.uid    // '0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849'
SCHEMAS.verification.schema // 'address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt'

SCHEMAS.vouch.uid           // '0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c'
SCHEMAS.vouch.schema        // 'address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash'

SCHEMAS.flag.uid            // '0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47'
SCHEMAS.flag.schema         // 'address flagged, uint8 severity, string reason, bytes32 evidenceHash'

SCHEMAS.paymentReliable.uid    // '0x000...000' (placeholder until schema registration)
SCHEMAS.paymentReliable.schema // 'address subjectAgent, uint8 outcome, uint256 amount, string currency, uint64 dueAt, uint64 paidAt, string settlementRef'

SCHEMAS.taskCompletion.uid    // '0x000...000' (placeholder until schema registration)
SCHEMAS.taskCompletion.schema // 'address subjectAgent, uint8 outcome, string taskId, string category, uint64 completedAt, uint256 reward, string rewardToken, string taskRef'

SCHEMAS.securityAudit.uid    // '0x000...000' (placeholder until schema registration)
SCHEMAS.securityAudit.schema // 'address auditor, address subject, string auditType, uint8 severity, bool passed, string reportUri, uint64 timestamp'
```

---

## Query Functions

Standalone functions for querying attestations without instantiating AgentTrust.

### fetchAttestationsForAgent

```typescript
import { fetchAttestationsForAgent } from '@nia-agent-cyber/agent-trust-sdk';

const { verifications, vouches, flags } = await fetchAttestationsForAgent(
  '0xAgentAddress',
  'base'  // or 'baseSepolia'
);
```

### getTrustScore

```typescript
import { getTrustScore } from '@nia-agent-cyber/agent-trust-sdk';

const score = await getTrustScore('0xAgentAddress', 'base');
```

### getAttestationSummary

```typescript
import { getAttestationSummary } from '@nia-agent-cyber/agent-trust-sdk';

const summary = await getAttestationSummary('0xAgentAddress', 'base');
```

### fetchPaymentReliableAttestationsForSubject

```typescript
import { fetchPaymentReliableAttestationsForSubject } from '@nia-agent-cyber/agent-trust-sdk';

const payments = await fetchPaymentReliableAttestationsForSubject('0xAgentAddress', 'base');
```

### fetchTaskCompletionAttestationsForSubject

Fetch TaskCompletion attestations for a subject agent from EAS GraphQL.

```typescript
import { fetchTaskCompletionAttestationsForSubject } from '@nia-agent-cyber/agent-trust-sdk';

const completions = await fetchTaskCompletionAttestationsForSubject('0xAgentAddress', 'base');
```

### parseTaskCompletionAttestation

Parse a raw EAS GraphQL attestation object into a typed `TaskCompletionAttestation`.

```typescript
import { parseTaskCompletionAttestation } from '@nia-agent-cyber/agent-trust-sdk';

const parsed = parseTaskCompletionAttestation(rawGraphQLAttestation);
// { uid, attester, recipient, subjectAgent, outcome, taskId, category, completedAt, reward, rewardToken, taskRef, time, revoked }
```

### parseTaskOutcome

Map a numeric outcome code to a `TaskOutcome` string. Throws on unknown codes.

```typescript
import { parseTaskOutcome } from '@nia-agent-cyber/agent-trust-sdk';

parseTaskOutcome(0); // 'failed'
parseTaskOutcome(1); // 'completed'
parseTaskOutcome(2); // 'disputed'
```

### fetchSecurityAuditAttestationsForSubject

Fetch SecurityAudit attestations for a subject address from EAS GraphQL.

```typescript
import { fetchSecurityAuditAttestationsForSubject } from '@nia-agent-cyber/agent-trust-sdk';

const audits = await fetchSecurityAuditAttestationsForSubject('0xSubjectAddress', 'base');
```

### parseSecurityAuditAttestation

Parse a raw EAS GraphQL attestation object into a typed `SecurityAuditAttestation`.

```typescript
import { parseSecurityAuditAttestation } from '@nia-agent-cyber/agent-trust-sdk';

const parsed = parseSecurityAuditAttestation(rawGraphQLAttestation);
// { uid, attester, recipient, auditor, subject, auditType, severity, passed, reportUri, timestamp, time, revoked }
```

### parseAuditSeverity

Map a numeric severity code to a typed `AuditSeverity` string. Throws on unknown codes.

```typescript
import { parseAuditSeverity } from '@nia-agent-cyber/agent-trust-sdk';

parseAuditSeverity(0); // 'none'
parseAuditSeverity(1); // 'low'
parseAuditSeverity(2); // 'medium'
parseAuditSeverity(3); // 'high'
parseAuditSeverity(4); // 'critical'
```

### normalizeSecurityAuditRequest

Normalize and validate a `SecurityAuditRequest`. Throws on invalid inputs.

```typescript
import { normalizeSecurityAuditRequest } from '@nia-agent-cyber/agent-trust-sdk';

const normalized = normalizeSecurityAuditRequest({
  auditor: '0xAuditor',
  subject: '0xSubject',
  auditType: 'smart-contract',
  severity: 'high',
  passed: false,
  timestamp: new Date(),
});
// { auditor, subject, auditType, severity: 'high', severityCode: 3, passed, reportUri, timestamp }
```

### encodeSecurityAuditAttestation

ABI-encode a SecurityAudit attestation payload for EAS.

```typescript
import { encodeSecurityAuditAttestation } from '@nia-agent-cyber/agent-trust-sdk';

const encoded = encodeSecurityAuditAttestation({
  auditor: '0xAuditor',
  subject: '0xSubject',
  auditType: 'dependency-scan',
  severity: 1,
  passed: true,
  timestamp: Date.now(),
});
// '0x...' — hex-encoded ABI payload
```

### clearAttesterScoreCache

Clear the internal cache for attester scores (useful for testing).

```typescript
import { clearAttesterScoreCache } from '@nia-agent-cyber/agent-trust-sdk';

clearAttesterScoreCache();
```

### getAttesterScoreCacheStats

Get cache statistics for debugging.

```typescript
import { getAttesterScoreCacheStats } from '@nia-agent-cyber/agent-trust-sdk';

const stats = getAttesterScoreCacheStats();
// { size: 5, entries: [{ address: '...', score: 72, age: 30000 }] }
```

---

## Verification Functions

Low-level verification utilities.

### Twitter

```typescript
import {
  generateTwitterChallenge,
  verifyTwitterProof,
  verifyTwitterProofWithFallback,
  hashTwitterProof
} from '@nia-agent-cyber/agent-trust-sdk';

// Generate challenge
const challenge = generateTwitterChallenge('0xAgent', 'handle', 30); // 30 min expiry

// Verify with API (requires Twitter API key)
const result = await verifyTwitterProof(proof, 'TWITTER_API_KEY');

// Verify with fallback (basic URL validation if no API key)
const result = await verifyTwitterProofWithFallback(proof);

// Hash proof for on-chain storage
const hash = hashTwitterProof(proof);
```

### GitHub

```typescript
import {
  generateGitHubChallenge,
  verifyGitHubProof,
  hashGitHubProof
} from '@nia-agent-cyber/agent-trust-sdk';

// Generate challenge
const challenge = generateGitHubChallenge('0xAgent', 'username', 60); // 60 min expiry

// Verify by fetching gist
const result = await verifyGitHubProof(proof);

// Hash proof for on-chain storage
const hash = hashGitHubProof(proof);
```

---

## Scoring Functions

Low-level trust score calculation.

```typescript
import {
  calculateTrustScore,
  getDefaultTrustScore,
  ScoreInputs
} from '@nia-agent-cyber/agent-trust-sdk';

// Calculate score from attestation data
const inputs: ScoreInputs = {
  verifications: [...],
  vouches: [...],
  flags: [...],
  attesterScores: new Map([['0xAttester', 75]])
};

const score = calculateTrustScore(inputs);

// Get default (empty) score
const empty = getDefaultTrustScore();
```

---

## Tier Functions

Trust tiers provide human-readable reputation levels (0-4) computed from attestation data.

### getTier

Get complete tier information for an agent.

```typescript
import { getTier } from '@nia-agent-cyber/agent-trust-sdk';

const tierInfo = await getTier('0xAgentAddress', 'base');
// {
//   tier: 2,
//   name: 'Trusted',
//   emoji: '⭐',
//   requirements: { minAttestations: 10, minVouches: 2, ... },
//   progress: {
//     attestations: { current: 15, required: 25, met: false },
//     vouches: { current: 3, required: 5, met: false },
//     approvalRate: { current: 86.7, required: 85, met: true },
//     daysActive: { current: 45, required: 90, met: false }
//   },
//   nextTier: 3
// }
```

### checkMeetsTier

Check if an agent meets a minimum tier requirement. Useful for tier gating.

```typescript
import { checkMeetsTier } from '@nia-agent-cyber/agent-trust-sdk';

const meetsTrusted = await checkMeetsTier('0xAgentAddress', 2, 'base');
// true if agent is Tier 2 (Trusted) or higher

// Use for access control
if (await checkMeetsTier(agentAddress, 2)) {
  // Allow access to Trusted+ features
}
```

### getTierProgress

Get progress toward the next tier (null if at max tier).

```typescript
import { getTierProgress } from '@nia-agent-cyber/agent-trust-sdk';

const progress = await getTierProgress('0xAgentAddress', 'base');
// {
//   attestations: { current: 15, required: 25, met: false },
//   vouches: { current: 3, required: 5, met: false },
//   approvalRate: { current: 86.7, required: 85, met: true },
//   daysActive: { current: 45, required: 90, met: false }
// }
```

### getTierName / getTierEmoji

Get metadata for a tier level.

```typescript
import { getTierName, getTierEmoji } from '@nia-agent-cyber/agent-trust-sdk';

getTierName(2);  // 'Trusted'
getTierEmoji(2); // '⭐'
```

### clearTierCache

Clear the tier calculation cache (useful for testing).

```typescript
import { clearTierCache } from '@nia-agent-cyber/agent-trust-sdk';

clearTierCache();
```

### Tier Constants

```typescript
import {
  TIER_NEW,        // 0
  TIER_CONTRIBUTOR, // 1
  TIER_TRUSTED,    // 2
  TIER_VERIFIED,   // 3
  TIER_EXPERT,     // 4
  MAX_TIER,        // 4
  TIER_REQUIREMENTS,
  TIER_METADATA,
} from '@nia-agent-cyber/agent-trust-sdk';

// Requirements for each tier
TIER_REQUIREMENTS[TIER_TRUSTED];
// {
//   minAttestations: 10,
//   minVouches: 2,
//   minVouchTier: 2,
//   minApprovalRate: 70,
//   minDaysActive: 30
// }
```

### Tier Types

```typescript
interface TierInfo {
  /** Tier level (0-4) */
  tier: number;
  /** Tier name */
  name: string;
  /** Tier emoji */
  emoji: string;
  /** Tier requirements */
  requirements: TierRequirements;
  /** Progress toward next tier (null if at max tier) */
  progress: TierProgress | null;
  /** Next tier level (null if at max tier) */
  nextTier: number | null;
}

interface TierProgress {
  attestations: RequirementProgress;
  vouches: RequirementProgress;
  approvalRate: RequirementProgress;
  daysActive: RequirementProgress;
}

interface RequirementProgress {
  /** Current value */
  current: number;
  /** Required value */
  required: number;
  /** Whether requirement is met */
  met: boolean;
}

interface TierRequirements {
  minAttestations: number;
  minVouches: number;
  minVouchTier: number;
  minApprovalRate: number;
  minDaysActive: number;
}

interface AgentStats {
  totalAttestations: number;
  qualifiedVouches: number;
  approvalRate: number;
  daysActive: number;
  flags: number;
  firstAttestationTime: number | null;
  lastPositiveAttestationTime: number | null;
}
```

### Tier Levels Reference

| Tier | Name | Emoji | Attestations | Vouches | Approval | Days |
|------|------|-------|--------------|---------|----------|------|
| 0 | New | 🆕 | 0 | 0 | 0% | 0 |
| 1 | Contributor | 🔧 | 3 | 0 | 50% | 7 |
| 2 | Trusted | ⭐ | 10 | 2 | 70% | 30 |
| 3 | Verified | ✅ | 25 | 5 | 85% | 90 |
| 4 | Expert | 👑 | 50 | 10 | 95% | 180 |


---

## LangChain Integration Package

Package: `@nia-agent-cyber/agent-trust-langchain`

### TrustCheckTool

```typescript
import { TrustCheckTool } from '@nia-agent-cyber/agent-trust-langchain';

const tool = new TrustCheckTool({ agentTrust, requiredTier: 'contributor' });
```

**Config:**

| Property | Type | Description |
|----------|------|-------------|
| `agentTrust` | `AgentTrustLike` | AgentTrust instance |
| `requiredTier?` | `TierName` | Default minimum tier |
| `name?` | `string` | Tool name (default: `agent_trust_check`) |
| `description?` | `string` | Tool description |

**Methods:**
- `_run(input: TrustCheckToolInput): Promise<TrustCheckOutput>` — structured result
- `invoke(input): Promise<string>` — JSON-serialized result
- `toLangChainTool(): DynamicStructuredTool` — native LangChain tool

**Output shape:**
```typescript
interface TrustCheckOutput {
  address: string;
  tier: { level: number; name: TierName; score: number };
  meets: boolean;
  requiredTier?: TierName;
  error?: string;
}
```

### TrustGate

```typescript
import { TrustGate, TrustGateError } from '@nia-agent-cyber/agent-trust-langchain';

const gate = new TrustGate({
  agentTrust,
  requiredTier: 'contributor',
  addressKey: 'counterpartyAddress',
  onBlocked: (state) => ({ ...state, blocked: true }),
});
```

**Config:**

| Property | Type | Description |
|----------|------|-------------|
| `agentTrust` | `AgentTrustLike` | AgentTrust instance |
| `requiredTier` | `TierName` | Minimum tier required |
| `addressKey?` | `string` | State key for address (default: `'address'`) |
| `onBlocked?` | `(state) => state` | Fallback instead of throwing |

**Methods:**
- `invoke(state): Promise<Record<string, unknown>>` — passes or blocks
- `pipe(next): ComposedChain` — compose with next step
- `toLangChainRunnable(): RunnableLambda` — native LangChain Runnable

### TrustGateError

Thrown when TrustGate blocks and no `onBlocked` is provided.

```typescript
error.address       // blocked address
error.tier          // actual tier name
error.requiredTier  // required tier name
error.message       // human-readable description
```

### createTrustMiddleware

```typescript
import { createTrustMiddleware } from '@nia-agent-cyber/agent-trust-langchain';

const { tool, gate } = createTrustMiddleware({
  agentTrust,
  requiredTier: 'contributor',
  addressKey: 'walletAddress',
});
```

Returns `{ tool: TrustCheckTool, gate: TrustGate }`.

### Tier Names (LangChain package)

| Level | Name |
|-------|------|
| 0 | `unverified` |
| 1 | `contributor` |
| 2 | `trusted` |
| 3 | `verified` |
| 4 | `expert` |
