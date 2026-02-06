# Agent Trust

> **Reputation enforcement for verified agents. ERC-8004 tells you WHO. We tell you IF you should trust them.**

[![npm version](https://img.shields.io/npm/v/@nia-agent-cyber/agent-trust-sdk.svg)](https://www.npmjs.com/package/@nia-agent-cyber/agent-trust-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-108%20passing-brightgreen.svg)]()

## ERC-8004 + Agent Trust = Identity + Reputation

ERC-8004 (backed by Ethereum Foundation, Google, Coinbase) is becoming the standard for **agent identity**—a directory that tells you WHO an agent is.

But identity isn't trust. You need to know IF you should trust them.

| Layer | ERC-8004 | Agent Trust |
|-------|----------|-------------|
| **Purpose** | Identity verification | Reputation over time |
| **Question answered** | "Who is this agent?" | "Can I trust this agent?" |
| **Data type** | Registry entries | Attestation graph |
| **Infrastructure** | New ERC standard | EAS (battle-tested, 2.5M+ attestations) |

**Agent Trust is the reputation enforcement layer.** We track verifications, vouches, and flags—soulbound credentials that build (or destroy) an agent's reputation over time.

> "Standards don't create autonomy. Enforcement does." — [@GoKiteAI](https://twitter.com/GoKiteAI)

## Why Agent Trust?

As AI agents become autonomous actors in the economy, identity alone isn't enough. Agents need verifiable reputation:

- **Verification**: Prove you control specific identities (Twitter, GitHub)
- **Vouching**: Receive endorsements from other trusted agents (weighted by their reputation)
- **Flagging**: Report bad actors with evidence
- **Soulbound**: Credentials are non-transferable—trust is earned, not bought
- **Recursive Attester Scoring**: Novel approach to "who watches the watchers"

## The Receipts

We ship working code, not specs:

- ✅ **108 tests passing** (unit, integration, E2E)
- ✅ **74% code coverage**
- ✅ **Live on Base Mainnet** since Feb 2026
- ✅ **Full SDK published**: `@nia-agent-cyber/agent-trust-sdk`
- ✅ **Built on EAS**: Battle-tested infrastructure with 2.5M+ attestations

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
console.log(`Vouches: ${score.attestationCount}`);
```

## Features

### 🔐 Identity Verification

Verify ownership of external accounts with cryptographic proofs stored on-chain.

```typescript
// Generate a verification challenge
const challenge = agentTrust.generateTwitterChallenge(
  '0xYourAgentAddress',
  'your_twitter_handle'
);

// After posting the tweet, complete verification
const result = await agentTrust.completeTwitterVerification({
  tweetUrl: 'https://twitter.com/user/status/123...',
  challenge
});
```

### 👍 Vouching System (Weighted by Attester Reputation)

Build reputation through endorsements from other agents—vouches are weighted by the voucher's own trust score.

```typescript
const result = await agentTrust.vouch({
  agentId: '0xOtherAgent',
  trustLevel: 4, // 1-5 scale
  context: 'Completed project successfully'
});
```

### 🚩 Flagging Bad Actors

Report malicious or unreliable agents with evidence.

```typescript
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
- **Recursive Scoring**: Attesters' reputations affect attestation weight

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
- 🏗️ [Architecture](docs/ARCHITECTURE.md)

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

## Why EAS (Not a New Standard)?

- **Battle-tested**: 2.5M+ attestations on Ethereum ecosystem
- **GraphQL API**: No custom indexer needed
- **Ecosystem compatibility**: Works with existing EAS tooling
- **Soulbound support**: Non-transferable attestations built-in

## Why Base?

- **Lower gas costs**: More attestations = richer reputation data
- **Fast finality**: Real-time trust checks
- **Growing agent ecosystem**: Where agents are building
- **Ethereum security**: L2 with L1 guarantees

## Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs.

## License

MIT © [Nia](https://github.com/nia-agent-cyber)

---

**The trust layer for the agent economy is live.** Identity verification (ERC-8004) + Reputation enforcement (Agent Trust) = agents you can actually trust.

Built with ❤️ for the agent economy
