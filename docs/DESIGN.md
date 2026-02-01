# Agent Trust — Design Document

## Problem Statement

In the emerging agent economy, agents need to:
1. **Verify other agents** — Is this agent who they claim to be?
2. **Assess reputation** — Has this agent behaved well in the past?
3. **Establish credentials** — Prove their own legitimacy to others
4. **Make trust decisions** — Should I transact with this agent?

Currently, there's no standardized infrastructure for this.

## Product Direction (from Remi, 2026-02-01)

- ✅ **Reputation from day 1** — Not just verification, full reputation system
- ✅ **Decentralized storage** — Blockchain for reputation data (investigate options)
- ✅ **Human identity linking** — Bootstrap trust via Twitter/GitHub/etc.
- 🔍 **Pricing** — Research and form opinion

## Core Features (MVP)

### 1. Identity Verification
- Link agent to human identity (Twitter, GitHub, email)
- Prove agent is controlled by verified human
- Optional: anonymous but verified (ZK proofs?)

### 2. Reputation Tracking
- Record of agent interactions/transactions
- Positive/negative signals from other agents
- Decentralized storage (can't be censored/manipulated)

### 3. Trust Queries
- "Is this agent verified?"
- "What's this agent's reputation score?"
- "Has this agent interacted with known-good agents?"

## Technical Architecture

### Storage Options (TO RESEARCH)

| Option | Pros | Cons |
|--------|------|------|
| **Ethereum/L2** | Decentralized, established | Gas costs, speed |
| **Solana** | Fast, cheap | Less decentralized? |
| **Ceramic/IPFS** | Content-addressed, flexible | Less proven |
| **Arweave** | Permanent storage | Cost for lots of data |
| **Custom L2/Rollup** | Full control | Complex to build |
| **Hybrid** | Best of both | Complexity |

### Data Model (draft)

```
Agent {
  id: string (unique identifier)
  linkedIdentities: [{platform, handle, proof}]
  createdAt: timestamp
  verificationLevel: enum
}

ReputationEvent {
  agentId: string
  type: "vouch" | "flag" | "transaction" | "review"
  fromAgentId: string
  weight: number
  evidence: string (IPFS hash?)
  timestamp: timestamp
}

TrustScore {
  agentId: string
  score: number (computed)
  confidence: number
  lastUpdated: timestamp
}
```

## Open Questions

### Answered
- [x] MVP scope? → Full reputation from day 1
- [x] Decentralized? → Yes, blockchain-based
- [x] Bootstrap? → Link to human identities

### Still Open
- [ ] Which blockchain/storage layer?
- [ ] Pricing model? (researching)
- [ ] How to compute trust scores? (algorithm)
- [ ] Privacy — what's public vs private?
- [ ] Dispute resolution?

## Research Tasks

1. [ ] **Blockchain comparison** — Ethereum L2s vs Solana vs Ceramic vs Arweave
2. [ ] **Existing solutions** — What's already out there? (Gitcoin Passport, Worldcoin, etc.)
3. [ ] **Pricing models** — How do similar services charge? What would agents pay?
4. [ ] **Customer interviews** — Post to Moltbook when API works

## Integration Points

- **OpenClaw** — Skill for trust checks before agent interactions
- **Moltbook** — Verify Moltbook agents, track reputation
- **AgentWallet** — Higher limits for high-reputation agents?

---

*Last updated: 2026-02-01 20:35 GMT*
