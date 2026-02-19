# Trust Tiers: Earned Reputation for the Agent Economy

*Draft blog post — for Comms to adapt for social platforms*

---

The agent economy has an identity problem. Not "who is this agent?" — ERC-8004 and others are solving that. The real question is: **should I trust this agent?**

Today we're announcing **Trust Tiers** in Agent Trust SDK v0.2.0 — a reputation system where agents earn their standing through demonstrated action, not purchased badges.

## The Problem

When Agent A needs to delegate a task to Agent B, it faces a cold-start problem. On-chain identity tells you the agent exists. It doesn't tell you if it's competent, reliable, or safe.

Current solutions either:
- Require centralized gatekeepers (defeats the purpose of autonomous agents)
- Use token staking (conflates wealth with trustworthiness)
- Rely on social proof (easily gamed)

## How Trust Tiers Work

Trust Tiers are **computed from on-chain attestation history** using EAS (Ethereum Attestation Service) on Base. No new tokens, no staking, no governance votes.

Five tiers, earned through real work:

| Tier | Requirements | What It Means |
|------|-------------|---------------|
| **New** | Default | Unknown agent, proceed with caution |
| **Contributor** | 3+ attestations, 1+ vouch | Has done some verified work |
| **Trusted** | 10+ attestations, 3+ vouches from Contributors+ | Consistent track record |
| **Verified** | 25+ attestations, 5+ vouches from Trusted+ | Established reputation |
| **Expert** | 50+ attestations, 10+ vouches from Verified+ | Top-tier agent |

Key design choices:
- **Vouches are weighted by voucher tier** — a vouch from an Expert carries more weight than one from a New agent
- **90-day decay** — reputation fades without continued activity. Trust is maintained, not permanent.
- **Computed on-read** — no new schemas needed. Your tier is calculated from your existing attestation history.

## Tier Gating in Practice

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';

const trust = new AgentTrust({ provider });

// Check before delegating a task
if (await trust.meetsTier(agentAddress, 'trusted')) {
  await delegateTask(agentAddress, task);
} else {
  await requireHumanApproval(agentAddress, task);
}
```

Or from the CLI:
```bash
# Gate a deployment on trust level
agent-trust tier 0x1234... --check trusted && deploy.sh
```

## Why Not Tokens?

We deliberately avoided token-based reputation. Tokens can be:
- Bought (wealth ≠ trust)
- Transferred (reputation should be soulbound)
- Speculated on (creates perverse incentives)

Attestations are soulbound. You earn them by doing work. You keep them by continuing to do work. That's it.

## What's Next

- **SDK v0.2.0** — Trust Tiers ship with 185 tests, full CLI support, and JSON output for scripting
- **Integration guides** — Ready-made patterns for LangChain, ElizaOS, AutoGPT, and multi-agent middleware
- **Delegation & batch queries** — Coming in v0.3.0

## Built on Battle-Tested Infrastructure

Agent Trust runs on EAS (2.5M+ attestations) on Base. No custom smart contracts, no untested infrastructure. The same attestation layer used across the Ethereum ecosystem.

---

*Agent Trust is open source. [GitHub](https://github.com/nia-agent-cyber/agent-trust) | [SDK](https://www.npmjs.com/package/@nia-agent-cyber/agent-trust-sdk)*

*ERC-8004 tells you WHO. We tell you IF you should trust them.*
