# Agent Trust — Technical Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Agent Trust System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Verify     │    │    Vouch     │    │    Query     │      │
│  │   Service    │    │   Service    │    │   Service    │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                    │
│                    ┌────────▼────────┐                          │
│                    │   Trust Core    │                          │
│                    │   (SDK/API)     │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│              ┌──────────────┼──────────────┐                    │
│              │              │              │                    │
│       ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐             │
│       │    EAS      │ │  Indexer  │ │   Cache   │             │
│       │  (Base L2)  │ │ (TheGraph)│ │  (Redis)  │             │
│       └─────────────┘ └───────────┘ └───────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Trust Core SDK

TypeScript library that wraps EAS SDK with agent-specific logic.

```typescript
// Example API
import { AgentTrust } from '@agent-trust/sdk';

const trust = new AgentTrust({
  network: 'base',
  provider: provider,
});

// Verify an agent
await trust.verify({
  agentId: '0x...',
  platform: 'twitter',
  handle: '@example',
  proof: signedMessage,
});

// Vouch for another agent
await trust.vouch({
  agentId: '0x...',
  trustLevel: 3, // 1-5 scale
  context: 'Completed transaction successfully',
});

// Query trust score
const score = await trust.getScore('0x...');
// { score: 78, confidence: 0.85, attestations: 23 }
```

### 2. EAS Schemas

**Schema 1: Agent Verification**
```
UID: (to be registered)
Schema: "address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt"
Resolver: VerificationResolver (validates proof)
Revocable: true
```

**Schema 2: Agent Vouch**
```
UID: (to be registered)
Schema: "address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash"
Resolver: none (permissionless)
Revocable: true
```

**Schema 3: Agent Flag**
```
UID: (to be registered)  
Schema: "address flagged, uint8 severity, string reason, bytes32 evidenceHash"
Resolver: none (permissionless)
Revocable: true
```

### 3. Trust Score Algorithm

```
TrustScore = BaseScore + VouchBonus - FlagPenalty

Where:
- BaseScore = 50 (verified) or 0 (unverified)
- VouchBonus = Σ(vouch.trustLevel × voucher.weight) / normalization
- FlagPenalty = Σ(flag.severity × flagger.weight) / normalization
- weight = sqrt(attestor's own TrustScore) // recursive but bounded

Score range: 0-100
Confidence = f(number of attestations, age of attestations)
```

### 4. Verification Flow

```
Agent                    Trust Service                 Twitter/GitHub
  │                            │                            │
  │  1. Request verification   │                            │
  │  (platform, handle)        │                            │
  │ ──────────────────────────>│                            │
  │                            │                            │
  │  2. Challenge              │                            │
  │  (sign this message)       │                            │
  │ <──────────────────────────│                            │
  │                            │                            │
  │  3. Post/Tweet proof       │                            │
  │ ───────────────────────────┼───────────────────────────>│
  │                            │                            │
  │  4. Submit proof URL       │                            │
  │ ──────────────────────────>│                            │
  │                            │  5. Verify proof exists    │
  │                            │ ──────────────────────────>│
  │                            │ <──────────────────────────│
  │                            │                            │
  │                            │  6. Create EAS attestation │
  │                            │  (on Base L2)              │
  │                            │                            │
  │  7. Verification complete  │                            │
  │  (attestation UID)         │                            │
  │ <──────────────────────────│                            │
```

### 5. Integration Points

**OpenClaw Skill:**
```typescript
// In agent's skill
import { checkTrust } from '@agent-trust/openclaw';

const result = await checkTrust(otherAgentId);
if (result.score < 50) {
  return "I don't trust this agent enough to proceed.";
}
```

**AgentWallet Integration:**
```typescript
// Higher limits for trusted agents
const trustScore = await trust.getScore(agentId);
const limit = trustScore > 80 ? 1000 : trustScore > 50 ? 500 : 100;
```

## Data Storage

| Data | Storage | Reason |
|------|---------|--------|
| Attestations | EAS on Base | Permanent, verifiable |
| Trust scores | Computed on-read | Always fresh |
| Score cache | Redis (5 min TTL) | Performance |
| Agent profiles | Ceramic (optional) | Rich metadata |

## Cost Estimates (Base L2)

| Action | Gas | Cost (approx) |
|--------|-----|---------------|
| Register schema | ~150k | $0.01-0.05 |
| Create attestation | ~80k | $0.005-0.02 |
| Revoke attestation | ~50k | $0.003-0.01 |
| Read attestation | 0 | Free |

## MVP Scope

**Phase 1:** Core verification + vouching
- [ ] Register EAS schemas on Base testnet
- [ ] Build Trust Core SDK
- [ ] Twitter verification flow
- [ ] Basic trust score calculation
- [ ] Simple API

**Phase 2:** Integrations
- [ ] OpenClaw skill
- [ ] AgentWallet integration
- [ ] Moltbook verification

**Phase 3:** Advanced
- [ ] GitHub verification
- [ ] Dispute resolution
- [ ] Delegated attestations
- [ ] Analytics dashboard

---

*Last updated: 2026-02-01 21:15 GMT*
