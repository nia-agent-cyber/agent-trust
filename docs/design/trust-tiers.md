# Trust Tiers — Technical Design Spec

**Issue:** #12  
**Author:** Trust PM  
**Created:** 2026-02-10  
**Status:** Ready for Implementation

---

## Overview

Implement tiered trust levels (0-4) for nuanced reputation signals beyond binary verified/unverified. Tiers provide human-readable trust levels that map to the underlying numeric trust score.

## Motivation

- **Market demand:** MoltThreat/PromptIntel uses tiered trust (BA research)
- **User need:** "Trust tiers/levels (not just binary)" — P1 feature request
- **Competitive:** ERC-8004 has reputation scoring; we need granularity
- **UX:** Tiers are more intuitive than raw scores (78 vs "Trusted ⭐")

---

## Tier Definitions

| Tier | Name | Emoji | Requirements |
|------|------|-------|--------------|
| 0 | **New** | 🆕 | Default for all agents |
| 1 | **Contributor** | 🔧 | 3+ attestations, 50%+ approval, 7+ days active |
| 2 | **Trusted** | ⭐ | 10+ attestations, 2+ vouches from Tier 2+, 70%+ approval, 30+ days |
| 3 | **Verified** | ✅ | 25+ attestations, 5+ vouches from Tier 2+, 85%+ approval, 90+ days |
| 4 | **Expert** | 👑 | 50+ attestations, 10+ vouches from Tier 3+, 95%+ approval, 180+ days |

### Requirement Details

| Metric | Definition |
|--------|------------|
| **Attestations** | Total attestations received (vouches + verifications) |
| **Vouches** | VouchFor attestations where `trustLevel >= 3` |
| **Approval Rate** | `(positive_attestations - flags) / total_attestations × 100` |
| **Days Active** | Time since first attestation (not wallet creation) |

---

## Schema Design

### Option A: No New Schema (Recommended)

Tiers are **computed on-read** from existing attestation data. No new EAS schema needed.

**Rationale:**
- Reduces gas costs (no tier attestations to create/update)
- Tiers automatically update as attestations accumulate
- Consistent with current "computed on-read" trust score approach
- Simpler implementation

### Option B: Explicit Tier Attestation (Not Recommended)

Create a TrustTier schema for explicit tier attestations.

```
Schema: "address agent, uint8 tier, uint64 calculatedAt, bytes32 evidenceHash"
```

**Rejected because:**
- Requires maintaining tier attestations as scores change
- Gas costs for tier updates
- Complexity of deciding who creates/updates tier attestations

---

## Tier Calculation Algorithm

```typescript
interface TierRequirements {
  minAttestations: number;
  minVouches: number;
  minVouchTier: number;      // Minimum tier of vouchers
  minApprovalRate: number;   // Percentage (0-100)
  minDaysActive: number;
}

const TIER_REQUIREMENTS: Record<number, TierRequirements> = {
  0: { minAttestations: 0,  minVouches: 0,  minVouchTier: 0, minApprovalRate: 0,  minDaysActive: 0 },
  1: { minAttestations: 3,  minVouches: 0,  minVouchTier: 0, minApprovalRate: 50, minDaysActive: 7 },
  2: { minAttestations: 10, minVouches: 2,  minVouchTier: 2, minApprovalRate: 70, minDaysActive: 30 },
  3: { minAttestations: 25, minVouches: 5,  minVouchTier: 2, minApprovalRate: 85, minDaysActive: 90 },
  4: { minAttestations: 50, minVouches: 10, minVouchTier: 3, minApprovalRate: 95, minDaysActive: 180 },
};

function calculateTier(agent: AgentStats): number {
  // Start from highest tier, work down until requirements met
  for (let tier = 4; tier >= 0; tier--) {
    if (meetsTierRequirements(agent, TIER_REQUIREMENTS[tier])) {
      return tier;
    }
  }
  return 0; // Default: New
}

function meetsTierRequirements(agent: AgentStats, req: TierRequirements): boolean {
  return (
    agent.totalAttestations >= req.minAttestations &&
    agent.qualifiedVouches >= req.minVouches &&
    agent.approvalRate >= req.minApprovalRate &&
    agent.daysActive >= req.minDaysActive
  );
}
```

### Vouch Qualification

A vouch counts toward tier requirements if:
1. The voucher's tier >= `minVouchTier` for the target tier
2. The vouch `trustLevel >= 3` (out of 5)
3. The vouch is not revoked

```typescript
function countQualifiedVouches(
  vouches: Vouch[],
  targetTier: number
): number {
  const minVoucherTier = TIER_REQUIREMENTS[targetTier].minVouchTier;
  return vouches.filter(v => 
    v.trustLevel >= 3 && 
    !v.revoked && 
    v.voucherTier >= minVoucherTier
  ).length;
}
```

### Approval Rate Calculation

```typescript
function calculateApprovalRate(agent: AgentStats): number {
  const positive = agent.totalAttestations - agent.flags;
  if (agent.totalAttestations === 0) return 0;
  return (positive / agent.totalAttestations) * 100;
}
```

---

## SDK Interface

### New Methods

```typescript
// packages/sdk/src/tier.ts

export interface TierInfo {
  tier: number;              // 0-4
  name: string;              // "New", "Contributor", etc.
  emoji: string;             // 🆕, 🔧, ⭐, ✅, 👑
  requirements: TierRequirements;
  progress: TierProgress;    // How close to next tier
}

export interface TierProgress {
  attestations: { current: number; required: number; met: boolean };
  vouches: { current: number; required: number; met: boolean };
  approvalRate: { current: number; required: number; met: boolean };
  daysActive: { current: number; required: number; met: boolean };
}

export interface AgentTrust {
  // ... existing methods ...
  
  /**
   * Get the current tier for an agent
   * @param address Agent's wallet address
   * @returns TierInfo with tier level and progress
   */
  getTier(address: string): Promise<TierInfo>;
  
  /**
   * Calculate what tier an agent would have given stats
   * @param stats AgentStats object
   * @returns Tier number (0-4)
   */
  calculateTier(stats: AgentStats): number;
  
  /**
   * Check if an agent meets a minimum tier requirement
   * @param address Agent's wallet address
   * @param minTier Minimum tier required (0-4)
   * @returns boolean
   */
  meetsTier(address: string, minTier: number): Promise<boolean>;
  
  /**
   * Get progress toward next tier
   * @param address Agent's wallet address
   * @returns TierProgress showing requirements vs current stats
   */
  getTierProgress(address: string): Promise<TierProgress>;
}
```

### Example Usage

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';

const trust = new AgentTrust({ network: 'base' });

// Get current tier
const tierInfo = await trust.getTier('0x1234...');
console.log(`${tierInfo.emoji} ${tierInfo.name} (Tier ${tierInfo.tier})`);
// Output: ⭐ Trusted (Tier 2)

// Check if agent meets minimum tier
if (await trust.meetsTier('0x1234...', 2)) {
  console.log('Agent is Trusted or higher');
}

// Get progress toward next tier
const progress = await trust.getTierProgress('0x1234...');
console.log(`Attestations: ${progress.attestations.current}/${progress.attestations.required}`);
```

---

## CLI Commands

### `agent-trust tier <address>`

Display tier information for an agent.

```bash
$ agent-trust tier 0x1234...

Trust Tier: ⭐ Trusted (Tier 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Stats:
  Attestations:  15 ✓
  Vouches:       3 ✓ (from Tier 2+)
  Approval Rate: 86.7% ✓
  Days Active:   45 ✓

Progress to Verified (Tier 3):
  Attestations:  15/25 ▓▓▓▓▓▓░░░░ 60%
  Vouches:       3/5   ▓▓▓▓▓▓░░░░ 60%
  Approval Rate: 86.7%/85% ✓
  Days Active:   45/90 ▓▓▓▓▓░░░░░ 50%
```

### `agent-trust tier --check <address> <min-tier>`

Check if agent meets minimum tier.

```bash
$ agent-trust tier --check 0x1234... 2
✓ Agent meets Tier 2 (Trusted) requirements

$ agent-trust tier --check 0x1234... 3
✗ Agent does not meet Tier 3 (Verified) requirements
  Missing: 10 attestations, 2 vouches, 45 days
```

### Output Formats

```bash
# JSON output for scripting
$ agent-trust tier 0x1234... --json
{
  "tier": 2,
  "name": "Trusted",
  "emoji": "⭐",
  "stats": {
    "attestations": 15,
    "vouches": 3,
    "approvalRate": 86.7,
    "daysActive": 45
  },
  "progress": { ... }
}
```

---

## Open Questions — Resolutions

### Q1: Who can attest tiers?

**Resolution: Automated calculation (no attestation needed)**

Tiers are computed on-read from existing attestation data. No special "tier attestor" role is needed. This:
- Eliminates centralization concerns
- Removes gas costs for tier updates
- Ensures tiers always reflect current state

### Q2: Should inactive tiers decay over time?

**Resolution: Yes, with grace period**

If an agent has no new positive attestations for 90+ days, their tier drops by one level per 90-day period of inactivity.

```typescript
function applyDecay(baseTier: number, daysSinceLastAttestation: number): number {
  if (daysSinceLastAttestation < 90) return baseTier;
  const decayLevels = Math.floor((daysSinceLastAttestation - 90) / 90);
  return Math.max(0, baseTier - decayLevels);
}
```

**Rationale:**
- Incentivizes continued participation
- Prevents stale high-tier agents from misleading others
- Matches real-world reputation dynamics

### Q3: Platform-specific vs. universal tiers?

**Resolution: Universal first, platform-specific later**

Phase 1: Single universal tier per agent across all platforms.

Phase 2 (future): Platform-weighted tiers where attestations from specific platforms (e.g., financial transactions vs social vouches) contribute differently.

---

## Migration Path

### Existing Agents

All existing agents with attestations will automatically have tiers calculated based on their current attestation history. No migration action needed.

### Compatibility

- Existing `getScore()` continues to return numeric 0-100 score
- New `getTier()` provides tier-based view
- Both use same underlying attestation data

---

## Test Plan

### Unit Tests

| Test Case | Expected Result |
|-----------|-----------------|
| Agent with 0 attestations | Tier 0 (New) |
| Agent with 3 attestations, 60% approval, 10 days | Tier 1 (Contributor) |
| Agent with 10 attestations, 2 vouches, 75% approval, 35 days | Tier 2 (Trusted) |
| Agent with 25 attestations, 5 vouches, 90% approval, 100 days | Tier 3 (Verified) |
| Agent with 50 attestations, 10 vouches, 98% approval, 200 days | Tier 4 (Expert) |
| Agent meets all requirements except vouches | Lower tier |
| Agent meets all requirements except days | Lower tier |
| Agent with 95 days inactive from Tier 3 | Tier 2 (decayed) |
| Agent with vouches from Tier 1 agents | Vouches don't count for Tier 2+ |

### Integration Tests

| Test Case | Expected Result |
|-----------|-----------------|
| `getTier()` matches `calculateTier()` | Consistent results |
| `meetsTier()` returns correct boolean | Correct gating |
| CLI output matches SDK output | Consistent display |
| Tier updates after new attestation | Real-time calculation |

### E2E Tests

| Test Case | Expected Result |
|-----------|-----------------|
| New agent → receives attestations → tier increases | Tier progression works |
| High-tier agent → inactive 90+ days → tier decreases | Decay works |
| Vouch from low-tier agent → doesn't count | Vouch qualification works |

---

## Implementation Phases

### Phase 1: SDK + Core (Feb 10-12)

- [ ] Add tier constants and types to SDK
- [ ] Implement `calculateTier()` function
- [ ] Implement `getTier()` with GraphQL query
- [ ] Implement `meetsTier()` helper
- [ ] Implement `getTierProgress()` for UX
- [ ] Unit tests (100% coverage on tier logic)

### Phase 2: CLI + Integration (Feb 12-13)

- [ ] Add `tier` command to CLI
- [ ] Add `--check` flag for tier gating
- [ ] Add `--json` output format
- [ ] Integration tests
- [ ] Update API documentation

### Phase 3: Mainnet Deployment (Feb 14)

- [ ] Deploy updated SDK to npm
- [ ] Verify tier calculations on mainnet data
- [ ] Update docs/getting-started.md with tier examples
- [ ] E2E tests on mainnet

---

## Future Enhancements (Out of Scope)

- Platform-weighted tiers
- Tier badges (visual NFTs)
- Tier leaderboards
- Custom tier requirements per use case
- Tier history/timeline view

---

*Design approved by Trust PM. Ready for Coder implementation.*
