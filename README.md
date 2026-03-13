# Agent Trust

> **Reputation enforcement for verified agents. ERC-8004 tells you WHO. We tell you IF you should trust them.**

[![npm version](https://img.shields.io/npm/v/@nia-agent-cyber/agent-trust-sdk.svg)](https://www.npmjs.com/package/@nia-agent-cyber/agent-trust-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-224%20passing-brightgreen.svg)]()
[![Demo](https://img.shields.io/badge/🔗_try_the_demo-live-orange.svg)](https://nia-agent-cyber.github.io/agent-trust/)

## ERC-8004 + Agent Trust = Identity + Reputation

ERC-8004 (backed by Ethereum Foundation, Google, Coinbase) is becoming the standard for **agent identity**—a directory that tells you WHO an agent is.

But identity isn't trust. You need to know IF you should trust them.

| Layer | ERC-8004 | Agent Trust |
|-------|----------|-------------|
| **Purpose** | Identity verification | Reputation over time |
| **Question answered** | "Who is this agent?" | "Can I trust this agent?" |
| **Data type** | Registry entries | Attestation graph |
| **Infrastructure** | New ERC standard | EAS (battle-tested, 2.5M+ attestations) |

**Agent Trust is the reputation enforcement layer.** We track verifications, vouches, flags, and payment reliability—soulbound credentials that build (or destroy) an agent's reputation over time.

> "Standards don't create autonomy. Enforcement does." — [@GoKiteAI](https://twitter.com/GoKiteAI)

## Why Agent Trust?

As AI agents become autonomous actors in the economy, identity alone isn't enough. Agents need verifiable reputation:

- **Verification**: Prove you control specific identities (Twitter, GitHub)
- **Vouching**: Receive endorsements from other trusted agents (weighted by their reputation)
- **Flagging**: Report bad actors with evidence
- **Payment reliability**: Track on-time, late, and defaulted payments
- **Soulbound**: Credentials are non-transferable—trust is earned, not bought
- **Recursive Attester Scoring**: Novel approach to "who watches the watchers"

## The Receipts

We ship working code, not specs:

- ✅ **185 tests passing** (unit, integration, E2E)
- ✅ **Trust Tiers**: 5-level reputation system (new → expert)
- ✅ **Live on Base Mainnet** since Feb 2026
- ✅ **Full SDK published**: `@nia-agent-cyber/agent-trust-sdk`
- ✅ **Built on EAS**: Battle-tested infrastructure with 2.5M+ attestations

## Quick Start

**Configure GitHub Packages registry** (one-time setup):

```bash
echo "@nia-agent-cyber:registry=https://npm.pkg.github.com" >> .npmrc
```

Then install:

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

### 💸 Payment Reliability Attestations

Record payment outcomes for agents in marketplaces, escrow, and bounty systems.

```typescript
const issue = await agentTrust.issuePaymentReliable({
  subjectAgent: '0xCounterparty',
  outcome: 'paid_on_time',
  amount: '1500000', // base units
  currency: 'USDC',
  dueAt: 1710000000,
  paidAt: 1709999000,
  settlementRef: 'invoice-42'
});

const history = await agentTrust.getPaymentReliability('0xCounterparty');
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

### 🏆 Trust Tiers

Agents progress through reputation tiers based on verifications, vouches, and history:

| Tier | Requirements |
|------|-------------|
| **new** | Default for all agents |
| **contributor** | 1+ verification, 1+ vouch received |
| **trusted** | 3+ vouches from contributor+ agents, 30+ day history |
| **verified** | 5+ vouches from trusted+ agents, 90+ day history |
| **expert** | 10+ vouches from verified+ agents, 180+ day history |

```typescript
// Check an agent's tier
const tier = await agentTrust.getTier('0xAgent');
console.log(`Tier: ${tier.name}`); // "trusted"

// Gate actions by tier
if (await agentTrust.meetsTier('0xAgent', 'contributor')) {
  // Allow action
}
```

Tiers decay after 90 days of inactivity. See [Getting Started](docs/getting-started.md) for details.

## Use Cases

- **Multi-agent marketplaces** — Gate access to high-value tasks by trust tier
- **Agent-to-agent payments** — Check reputation before sending funds
- **Autonomous hiring** — Agents verify each other before collaboration
- **DeFi guardrails** — Only trusted agents can execute trades on behalf of users
- **AI safety** — Flag and isolate agents exhibiting harmful behavior
- **Platform onboarding** — Replace CAPTCHAs with on-chain reputation

## Documentation

- 📖 [Getting Started Guide](docs/getting-started.md)
- 🔌 [Integration Guide](docs/integration-guide.md) — LangChain, ElizaOS, AutoGPT, multi-agent systems
- 📚 [API Reference](docs/api-reference.md)
- 💻 [CLI Examples](docs/cli-examples.md)
- 🏗️ [Architecture](docs/ARCHITECTURE.md)
- 📁 [Examples](examples/) — runnable code samples (trust checks, tier gating, Express middleware)

### Tutorials

- 🛡️ [Build a Trust-Gated Agent API](docs/tutorials/trust-gated-api.md) — Gate API endpoints by on-chain reputation in 10 minutes
- 🤖 [Add Trust to Your LangChain Agent](docs/tutorials/langchain-integration.md) — Trust-gated tool access and agent-to-agent verification in 15 minutes
- 🎭 [Add Reputation to Your ElizaOS Agent](docs/tutorials/elizaos-integration.md) — Trust-aware character interactions and vouching in 15 minutes

## Roadmap

### v0.2.0 (Current) — Trust Tiers + ERC-8004 Bridge
- ✅ 5-level tier system (new → expert)
- ✅ Tier gating (`meetsTier`)
- ✅ CLI tier command with progress bars
- ✅ ERC-8004 identity bridge (`getEnrichedProfile`)
- ✅ Interactive demo app ([live](https://nia-agent-cyber.github.io/agent-trust/))
- ✅ 224 tests passing
- ✅ Published to GitHub Packages

### v0.3.0 (Planned) — Cross-Platform Trust
- 🔜 Trust delegation (agents vouch on behalf of organizations)
- 🔜 Batch attestation queries (reduce RPC calls)
- 🔜 Webhook/event subscriptions for tier changes
- 🔜 New attestation types (SecurityAudit, TaskCompletion)

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
| PaymentReliable | `0x0000000000000000000000000000000000000000000000000000000000000000` (placeholder, update after registration) |

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

Contributions welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## License

MIT © [Nia](https://github.com/nia-agent-cyber)

---

**The trust layer for the agent economy is live.** Identity verification (ERC-8004) + Reputation enforcement (Agent Trust) = agents you can actually trust.

Built with ❤️ for the agent economy
