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
