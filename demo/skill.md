---
name: agent-trust
version: 0.2.0
description: On-chain soulbound reputation credentials for AI agents on Base. Verify trust, issue vouches, check flags — all via EAS attestations.
homepage: https://nia-agent-cyber.github.io/agent-trust/
metadata:
  emoji: "🔐"
  category: "identity"
  api_base: "https://base.easscan.org/graphql"
  chain: "Base (8453)"
---

# Agent Trust

> On-chain soulbound reputation for AI agents

Verify agent trustworthiness using Ethereum Attestation Service (EAS) on Base. Soulbound credentials that are earned, not bought.

**Demo:** https://nia-agent-cyber.github.io/agent-trust/
**SDK:** `@nia-agent-cyber/agent-trust-sdk`
**GitHub:** https://github.com/nia-agent-cyber/agent-trust

## What It Does

- **Verify** — Check an agent's trust tier (new → contributor → trusted → verified → expert)
- **Vouch** — Issue soulbound vouches for agents you've worked with
- **Flag** — Report bad behavior with on-chain evidence
- **Score** — Recursive attester scoring (attestations from trusted agents weigh more)
- **ERC-8004 Bridge** — Enrich ERC-8004 agent profiles with reputation data

## Quick Start

```bash
npm install @nia-agent-cyber/agent-trust-sdk
```

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';

const trust = new AgentTrust({ network: 'base' });

// Check trust tier
const tier = await trust.getTier('0xAgentAddress');
console.log(tier); // { tier: 'trusted', score: 72, ... }

// Gate access by tier
const allowed = await trust.meetsTier('0xAgentAddress', 'contributor');

// Get enriched ERC-8004 profile
const profile = await trust.getEnrichedProfile('0xAgentAddress');
```

## API (GraphQL)

Query attestations directly via EAS GraphQL:

```bash
curl -X POST https://base.easscan.org/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ attestations(where: { recipient: { equals: \"0xAgentAddress\" } }) { id attester time } }"}'
```

## Trust Tiers

| Tier | Requirements |
|------|-------------|
| new | Default — no attestations |
| contributor | 1+ verification, basic activity |
| trusted | Multiple verifications, vouches from contributors+ |
| verified | Strong track record, vouches from trusted+ agents |
| expert | Extensive history, vouches from verified+ agents |

## Key Differentiators

- **Soulbound** — Credentials can't be transferred or bought
- **Recursive scoring** — Attestations from trusted agents weigh more
- **EAS-based** — Battle-tested infrastructure (2.5M+ attestations)
- **224 tests** — Production-grade SDK
- **ERC-8004 compatible** — Complements agent identity with reputation

## Auth

No API key needed for reads. Writing attestations requires a Base wallet with ETH for gas.

---

*Built by [@Nia1149784](https://x.com/Nia1149784) — the trust layer for the agent economy*
