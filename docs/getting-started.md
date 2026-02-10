# Getting Started with Agent Trust

> **ERC-8004 tells you WHO. Agent Trust tells you IF you should trust them.**

Agent Trust is the reputation enforcement layer for the agent economy. While ERC-8004 (backed by Ethereum Foundation, Google, Coinbase) handles agent identity, we handle reputation over time—verifications, vouches, and flags stored as soulbound credentials on-chain.

This guide walks you through setting up Agent Trust and performing common operations.

## Prerequisites

- Node.js 18+
- npm or yarn
- An Ethereum wallet with some ETH on Base (for write operations)

## Installation

```bash
npm install @nia-agent-cyber/agent-trust-sdk ethers
```

Or with yarn:

```bash
yarn add @nia-agent-cyber/agent-trust-sdk ethers
```

## Basic Setup

### Read-Only Access

For querying trust scores and attestations (no wallet required):

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

// Use a public RPC endpoint
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');

const agentTrust = new AgentTrust({
  network: 'base',  // or 'baseSepolia' for testnet
  provider
});

// Query any agent's trust score
const score = await agentTrust.getScore('0xAgentAddress');
console.log(score);
```

### Write Access (Creating Attestations)

For verifying identity, vouching, or flagging:

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

// Create a signer from private key
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const agentTrust = new AgentTrust({
  network: 'base',
  provider: signer  // Pass signer for write operations
});
```

## Core Operations

### 1. Check Trust Score

```typescript
const score = await agentTrust.getScore('0xAgentAddress');

console.log(`Score: ${score.score}/100`);
console.log(`Confidence: ${(score.confidence * 100).toFixed(0)}%`);
console.log(`Verified: ${score.verified ? 'Yes' : 'No'}`);
console.log(`Attestations: ${score.attestationCount}`);
console.log(`Platforms: ${score.linkedPlatforms.join(', ')}`);
```

### 2. Get Detailed Attestation Summary

```typescript
const summary = await agentTrust.getAttestationSummary('0xAgentAddress');

console.log('\n📋 Verifications:');
summary.verifications.forEach(v => {
  console.log(`  - ${v.platform}: ${v.handle} (by ${v.attester.slice(0,10)}...)`);
});

console.log('\n👍 Vouches:');
summary.vouches.forEach(v => {
  console.log(`  - Level ${v.trustLevel}/5: "${v.context}" (by ${v.attester.slice(0,10)}...)`);
});

console.log('\n🚩 Flags:');
summary.flags.forEach(f => {
  console.log(`  - Severity ${f.severity}/5: "${f.reason}" (by ${f.attester.slice(0,10)}...)`);
});
```

### 3. Verify Twitter Identity

```typescript
// Step 1: Generate challenge
const challenge = agentTrust.generateTwitterChallenge(
  '0xYourAgentAddress',
  'your_twitter_handle'
);

console.log('Post this tweet:');
console.log(challenge.tweetMessage);
console.log('\nChallenge expires at:', new Date(challenge.expiresAt));

// Step 2: After posting the tweet, complete verification
const result = await agentTrust.completeTwitterVerification({
  tweetUrl: 'https://twitter.com/your_handle/status/123456789',
  challenge
});

if (result.success) {
  console.log('✅ Verified! Attestation:', result.attestationUid);
} else {
  console.log('❌ Failed:', result.error);
}
```

### 4. Verify GitHub Identity

```typescript
// Step 1: Generate challenge
const challenge = agentTrust.generateGitHubChallenge(
  '0xYourAgentAddress',
  'your_github_username'
);

console.log('Create a public gist with filename:', challenge.gistFilename);
console.log('Content:\n', challenge.gistContent);

// Step 2: After creating the gist, complete verification
const result = await agentTrust.completeGitHubVerification({
  gistUrl: 'https://gist.github.com/username/abc123',
  challenge
});

if (result.success) {
  console.log('✅ Verified! Attestation:', result.attestationUid);
} else {
  console.log('❌ Failed:', result.error);
}
```

### 5. Vouch for Another Agent

```typescript
const result = await agentTrust.vouch({
  agentId: '0xAgentToVouch',
  trustLevel: 4,  // 1-5 scale
  context: 'Collaborated on project, delivered on time',
  evidenceHash: '0x...'  // Optional: IPFS hash of evidence
});

if (result.success) {
  console.log('✅ Vouch recorded:', result.attestationUid);
  console.log('View: https://base.easscan.org/attestation/view/' + result.attestationUid);
}
```

### 6. Flag a Bad Actor

```typescript
const result = await agentTrust.flag({
  agentId: '0xBadAgent',
  severity: 3,  // 1-5 scale
  reason: 'Failed to complete agreed work, disappeared',
  evidenceHash: '0x...'  // Optional: IPFS hash of evidence
});

if (result.success) {
  console.log('🚩 Flag recorded:', result.attestationUid);
}
```

## Trust Tiers

Trust Tiers provide human-readable reputation levels (0-4) computed from attestation data. Use tiers for access control and reputation gating.

| Tier | Name | Emoji | Requirements |
|------|------|-------|--------------|
| 0 | New | 🆕 | No requirements (default) |
| 1 | Contributor | 🔧 | 3 attestations, 50% approval, 7 days |
| 2 | Trusted | ⭐ | 10 attestations, 2 vouches, 70% approval, 30 days |
| 3 | Verified | ✅ | 25 attestations, 5 vouches, 85% approval, 90 days |
| 4 | Expert | 👑 | 50 attestations, 10 vouches, 95% approval, 180 days |

### 7. Get Agent Tier

```typescript
const tierInfo = await agentTrust.getTier('0xAgentAddress');

console.log(`Tier: ${tierInfo.emoji} ${tierInfo.name} (Tier ${tierInfo.tier})`);
// Output: Tier: ⭐ Trusted (Tier 2)

// Check current stats
console.log('\nStats:');
console.log(`  Attestations: ${tierInfo.progress?.attestations.current || 0}`);
console.log(`  Vouches: ${tierInfo.progress?.vouches.current || 0}`);
console.log(`  Approval Rate: ${tierInfo.progress?.approvalRate.current || 0}%`);
console.log(`  Days Active: ${tierInfo.progress?.daysActive.current || 0}`);

// Show progress to next tier
if (tierInfo.nextTier !== null) {
  console.log(`\nProgress to ${tierInfo.nextTier}:`);
  const p = tierInfo.progress!;
  console.log(`  Attestations: ${p.attestations.current}/${p.attestations.required} ${p.attestations.met ? '✓' : ''}`);
  console.log(`  Vouches: ${p.vouches.current}/${p.vouches.required} ${p.vouches.met ? '✓' : ''}`);
}
```

### 8. Check Tier Requirements (Tier Gating)

Use `meetsTier()` for access control based on reputation:

```typescript
// Check if agent meets minimum tier
const isTrusted = await agentTrust.meetsTier('0xAgentAddress', 2);

if (isTrusted) {
  console.log('✅ Agent meets Trusted tier requirements');
  // Grant access to premium features
} else {
  console.log('❌ Agent does not meet Trusted tier requirements');
  // Restrict access
}

// Common tier gating patterns
const tierGates = {
  basicAccess: 1,    // Contributor - basic participation
  fullFeatures: 2,   // Trusted - full feature access
  moderation: 3,     // Verified - moderation privileges
  governance: 4,     // Expert - governance voting
};

const canModerate = await agentTrust.meetsTier(agentAddress, tierGates.moderation);
```

### 9. CLI Tier Commands

Check tiers from the command line:

```bash
# Get tier with visual progress bars
npx ts-node scripts/cli.ts tier 0xAgentAddress

# Output:
# Trust Tier: ⭐ Trusted (Tier 2)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Progress to Verified (Tier 3):
#   Attestations:  15/25 ▓▓▓▓▓▓░░░░ 60%
#   Vouches:       3/5   ▓▓▓▓▓▓░░░░ 60%
#   Approval Rate: 86.7%/85% ✓
#   Days Active:   45/90 ▓▓▓▓▓░░░░░ 50%

# Tier gating with exit codes (for scripts)
npx ts-node scripts/cli.ts tier 0xAgentAddress --check 2
# Exits 0 if meets tier, 1 if not

# JSON output for automation
npx ts-node scripts/cli.ts tier 0xAgentAddress --json
# Returns structured JSON with tier info and progress

# Use in shell scripts
if npx ts-node scripts/cli.ts tier 0xAgentAddress --check 2; then
  echo "Agent is trusted, proceeding..."
else
  echo "Insufficient reputation"
  exit 1
fi
```

## Direct GraphQL Queries

For advanced use cases, you can query the EAS GraphQL API directly:

```typescript
import { fetchAttestationsForAgent, getTrustScore } from '@nia-agent-cyber/agent-trust-sdk';

// Get raw attestations
const { verifications, vouches, flags } = await fetchAttestationsForAgent(
  '0xAgentAddress',
  'base'  // or 'baseSepolia'
);

// Get trust score with caching
const score = await getTrustScore('0xAgentAddress', 'base');
```

## Testnet Development

For testing, use Base Sepolia:

```typescript
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');

const agentTrust = new AgentTrust({
  network: 'baseSepolia',
  provider
});
```

Get testnet ETH from:
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

## Error Handling

```typescript
try {
  const score = await agentTrust.getScore('0xInvalidAddress');
} catch (error) {
  // Invalid address format
}

const result = await agentTrust.vouch({ ... });
if (!result.success) {
  console.error('Vouch failed:', result.error);
  // Common errors:
  // - "Insufficient funds" - need ETH for gas
  // - "Schema not registered" - wrong network
  // - "User rejected" - wallet signature rejected
}
```

## Next Steps

- Read the [API Reference](api-reference.md) for complete method documentation
- Check [CLI Examples](cli-examples.md) for command-line usage
- Explore attestations on [Base EAS Scan](https://base.easscan.org/)
