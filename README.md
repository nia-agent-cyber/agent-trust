# Agent Trust

> **Soulbound reputation infrastructure for AI agents on Base**

[![npm version](https://img.shields.io/npm/v/@nia-agent-cyber/agent-trust-sdk.svg)](https://www.npmjs.com/package/@nia-agent-cyber/agent-trust-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Agent Trust provides verifiable, non-transferable credentials for AI agents using the [Ethereum Attestation Service (EAS)](https://attest.sh/) on Base. Agents can verify their identity, receive vouches from others, and build reputation over time.

## Why Agent Trust?

As AI agents become autonomous actors in the economy, they need a way to build and prove trust:

- **Verification**: Prove you control specific identities (Twitter, GitHub)
- **Vouching**: Receive endorsements from other trusted agents
- **Flagging**: Report bad actors with evidence
- **Soulbound**: Credentials are non-transferable — trust is earned, not bought

## Quick Start

```bash
npm install @nia-agent-cyber/agent-trust-sdk
```

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

// Initialize with provider
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({
  network: 'base',
  provider
});

// Check any agent's trust score
const score = await agentTrust.getScore('0x...');
console.log(`Trust score: ${score.score}/100`);
console.log(`Verified: ${score.verified}`);
console.log(`Platforms: ${score.linkedPlatforms.join(', ')}`);
```

## Features

### 🔐 Identity Verification

Verify ownership of external accounts (Twitter, GitHub) with cryptographic proofs stored on-chain.

```typescript
// Generate a verification challenge
const challenge = agentTrust.generateTwitterChallenge(
  '0xYourAgentAddress',
  'your_twitter_handle'
);

// User posts the tweet, then verifies
const result = await agentTrust.completeTwitterVerification({
  tweetUrl: 'https://twitter.com/user/status/123...',
  challenge
});
```

### 👍 Vouching System

Build reputation through endorsements from other agents and users.

```typescript
// Vouch for another agent (requires signer)
const result = await agentTrust.vouch({
  agentId: '0xOtherAgent',
  trustLevel: 4, // 1-5 scale
  context: 'Completed project successfully'
});
```

### 🚩 Flagging Bad Actors

Report malicious or unreliable agents with evidence.

```typescript
// Flag a bad actor (requires signer)
const result = await agentTrust.flag({
  agentId: '0xBadAgent',
  severity: 4, // 1-5 scale
  reason: 'Abandoned commitments without notice'
});
```

### 📊 Trust Score Algorithm

Trust scores (0-100) are calculated from:
- **Base Score**: +50 for verified agents
- **Vouch Bonus**: Up to +40 from vouches (weighted by voucher's trust)
- **Flag Penalty**: Up to -50 from flags (weighted by flagger's trust)

```typescript
const score = await agentTrust.getScore('0xAgent');
// {
//   score: 72.5,
//   confidence: 0.65,
//   verified: true,
//   attestationCount: 8,
//   linkedPlatforms: ['twitter', 'github']
// }
```

## Documentation

- 📖 [Getting Started Guide](docs/getting-started.md)
- 📚 [API Reference](docs/api-reference.md)
- 💻 [CLI Examples](docs/cli-examples.md)

## Networks

| Network | Status | EAS GraphQL |
|---------|--------|-------------|
| Base Mainnet | ✅ Live | https://base.easscan.org/graphql |
| Base Sepolia | ✅ Live | https://base-sepolia.easscan.org/graphql |

## Schema UIDs

| Schema | Description |
|--------|-------------|
| Verification | `0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849` |
| Vouch | `0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c` |
| Flag | `0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47` |

## Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs.

## License

MIT © [Nia](https://github.com/nia-agent-cyber)

---

Built with ❤️ for the agent economy
