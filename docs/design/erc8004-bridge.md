# ERC-8004 Bridge — Design Spec

**Created:** 2026-02-27 by PM
**Status:** Ready for implementation

---

## Overview

SDK module that reads ERC-8004 registry data (Identity, Reputation, Validation) on Base and enriches it with Agent Trust reputation scoring. This positions Agent Trust as "the reputation layer FOR ERC-8004 agents."

## ERC-8004 Background

ERC-8004 ("Trustless Agents") defines three on-chain registries:

1. **Identity Registry** — ERC-721 NFTs. Each agent gets a `tokenId` (agentId) and `tokenURI` pointing to a registration file (agent card with capabilities, endpoints, etc.)
2. **Reputation Registry** — Standard interface for posting/fetching feedback signals (ratings, reviews)
3. **Validation Registry** — Hooks for independent validator checks (re-execution, zkML, TEE oracles)

Each agent is globally identified by `{namespace}:{chainId}:{identityRegistry}:{agentId}`.

## What We're Building

A new `erc8004/` module in the SDK that:

1. **Reads ERC-8004 Identity Registry** — resolve agent NFTs, fetch tokenURI metadata
2. **Reads ERC-8004 Reputation Registry** — fetch on-chain feedback for an agent
3. **Enriches with Agent Trust data** — combine ERC-8004 identity + our trust tier/score
4. **Exposes a unified `getEnrichedProfile(address)`** method on AgentTrust class

## SDK Interface

```typescript
// New types
interface ERC8004Identity {
  agentId: number;           // ERC-721 tokenId
  owner: string;             // Owner address
  registryAddress: string;   // Identity registry contract
  tokenURI: string;          // Points to agent card JSON
  metadata?: AgentCardMetadata; // Resolved metadata (if fetchable)
}

interface ERC8004Reputation {
  feedbackCount: number;
  averageRating: number | null;
  recentFeedback: FeedbackEntry[];
}

interface FeedbackEntry {
  from: string;
  rating: number;
  comment: string;
  timestamp: number;
}

interface EnrichedAgentProfile {
  address: string;
  // ERC-8004 data
  erc8004: {
    registered: boolean;
    identity: ERC8004Identity | null;
    reputation: ERC8004Reputation | null;
  };
  // Agent Trust data
  agentTrust: {
    tier: TierInfo;
    score: TrustScore;
    attestationCount: number;
  };
  // Combined assessment
  combined: {
    hasOnChainIdentity: boolean;
    trustTier: string;         // Our tier name
    reputationScore: number;   // 0-100 combined score
    summary: string;           // Human-readable summary
  };
}

// New method on AgentTrust class
async getEnrichedProfile(address: string): Promise<EnrichedAgentProfile>

// Standalone helpers
async getERC8004Identity(address: string, registryAddress: string, provider: Provider): Promise<ERC8004Identity | null>
async getERC8004Reputation(agentId: number, registryAddress: string, provider: Provider): Promise<ERC8004Reputation>
```

## Configuration

```typescript
interface AgentTrustConfig {
  // ... existing fields
  erc8004?: {
    identityRegistry?: string;   // Override registry address
    reputationRegistry?: string; // Override registry address
    validationRegistry?: string; // Override registry address
  };
}
```

Default registry addresses should be constants for Base mainnet (to be discovered — check ERC-8004 deployments on Base).

## Implementation Plan

### Files to Create

```
packages/sdk/src/erc8004/
├── index.ts          # Re-exports
├── types.ts          # ERC8004-specific types
├── constants.ts      # Registry addresses, ABIs
├── identity.ts       # Read Identity Registry (ERC-721)
├── reputation.ts     # Read Reputation Registry
├── enriched.ts       # Combine ERC-8004 + Agent Trust data
└── __tests__/
    ├── identity.test.ts
    ├── reputation.test.ts
    └── enriched.test.ts
```

### Files to Modify

- `packages/sdk/src/agent-trust.ts` — Add `getEnrichedProfile()` method
- `packages/sdk/src/types.ts` — Export new types
- `packages/sdk/src/index.ts` — Export erc8004 module

## Contract ABIs (Minimal)

The coder needs to create minimal ABIs for:

1. **Identity Registry (ERC-721 + URIStorage)**:
   - `balanceOf(address)` → uint256
   - `tokenOfOwnerByIndex(address, uint256)` → uint256
   - `tokenURI(uint256)` → string
   - `ownerOf(uint256)` → address

2. **Reputation Registry** (interface TBD — check ERC-8004 spec for exact function signatures):
   - `getFeedback(uint256 agentId)` → feedback entries
   - `getAverageRating(uint256 agentId)` → rating

## Scoring Algorithm

The combined score should weight:
- **Agent Trust tier** (40%) — our recursive attester scoring
- **ERC-8004 reputation signals** (30%) — on-chain feedback
- **Identity completeness** (15%) — has metadata, tokenURI resolves
- **Validation status** (15%) — any validator checks passed

## Edge Cases

1. **Agent not in ERC-8004 registry** → `erc8004.registered = false`, still return Agent Trust data
2. **Agent in ERC-8004 but no Agent Trust attestations** → return ERC-8004 data + default trust score
3. **No ERC-8004 registry deployed on Base yet** → gracefully handle with try/catch, return null for ERC-8004 fields
4. **tokenURI not fetchable** → `metadata: null`, don't fail

## Testing Strategy

- Unit tests with mocked contract calls (ethers mock provider)
- Test all edge cases above
- Test combined scoring weights
- Integration test structure (for when registry is live)

## Notes

- ERC-8004 is still DRAFT status. The contract interfaces may change.
- If no ERC-8004 registry is deployed on Base yet, implement against the spec and use mock addresses. The code should be ready to plug in real addresses when available.
- Keep the module loosely coupled — it should work independently of whether ERC-8004 contracts exist.
