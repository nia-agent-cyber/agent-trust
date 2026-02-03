# Pricing Research & Recommendation

## Market Analysis

### Competitors

| Service | Model | Price |
|---------|-------|-------|
| Human Passport (Gitcoin) | Free API for queries | $0 |
| Worldcoin | Free (orb verification) | $0 |
| EAS | Gas only | ~$0.01/attestation |
| ENS | Registration fee | $5-640/year |
| Lens Protocol | Gas only | ~$1-5 to mint |

**Observation:** Most identity/verification services are free or near-free for basic use. Revenue comes from:
- Premium features
- Enterprise SLAs
- Data services (analytics, bulk queries)
- Protocol fees on transactions

### Value Chain Analysis

| Action | Value to User | Frequency | Who Benefits |
|--------|---------------|-----------|--------------|
| Get verified | High (unlocks access) | Once | The verified agent |
| Vouch for someone | Medium (builds network) | Occasional | Both parties |
| Query trust score | Low (quick check) | Frequent | The querier |
| Flag bad actor | High (protects ecosystem) | Rare | Everyone |

## Pricing Options

### Option A: Free Everything (Growth Play)
```
Verification: Free
Vouching: Free (gas only)
Queries: Free
Revenue: None direct — build user base first
```
**Pros:** Maximum adoption, builds network effects
**Cons:** No revenue, hard to sustain

### Option B: Freemium
```
Verification: Free (basic) / $5 (premium badge)
Vouching: Free (gas only)
Queries: Free (100/day) / $10/mo (unlimited)
Revenue: Premium subscriptions
```
**Pros:** Low barrier, revenue from power users
**Cons:** May not generate enough

### Option C: Transaction Fee
```
Verification: $1-5 one-time
Vouching: Free
Queries: Free
Revenue: Verification fees
```
**Pros:** Clear value exchange, sustainable
**Cons:** Friction for onboarding

### Option D: B2B/API Focus
```
Individual agents: Free (everything)
Platforms/Apps: $99-999/mo for API access
Revenue: Platform subscriptions
```
**Pros:** Big contracts, predictable revenue
**Cons:** Slow sales cycle, need enterprise features

### Option E: Hybrid (My Recommendation)
```
Verification: Free (Twitter) / $2 (premium platforms)
Vouching: Free (gas only, ~$0.01 on Base)
Queries: Free (1000/day) / $0.001/query over limit
Premium tier: $20/mo
  - Unlimited queries
  - Analytics dashboard
  - Priority verification
  - Custom badge
  - API access for integrations
```

## My Recommendation

**Start with Option E (Hybrid)** because:

1. **Low barrier to entry** — Free verification gets agents in the door
2. **Value-based pricing** — Pay for premium features, not basic access
3. **Sustainable** — Revenue from power users and platforms
4. **Sustainable revenue** — Transaction fees can integrate with AgentWallet

### Revenue Projections (Conservative)

Assuming 10,000 agents in year 1:
- 5% premium subscribers: 500 × $20/mo = $10,000/mo
- Overage queries: ~$1,000/mo
- **Total: ~$11,000/mo = $132,000/year**

Assuming 100,000 agents in year 2:
- 5% premium: 5,000 × $20 = $100,000/mo
- Overage + enterprise: ~$20,000/mo
- **Total: ~$120,000/mo = $1.44M/year**

### Integration with AgentWallet

**Synergy opportunity:**
- Verified agents get higher AgentWallet limits
- Trust score affects transaction fees (lower fees for trusted agents)
- Premium trust tier bundled with premium wallet tier

This creates a flywheel:
```
More verification → More wallet use → More transaction fees → More revenue
                ↑                                                    │
                └────────────────────────────────────────────────────┘
```

## Open Questions

1. Does this pricing direction make sense?
2. Should we bundle with AgentWallet from day 1?
3. What's our target for year 1? (agents, revenue)

---

*Last updated: 2026-02-01 21:30 GMT*
