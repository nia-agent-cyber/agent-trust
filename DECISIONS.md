# Trust Skill Decisions

Architectural and design decisions. **Don't revisit these without good reason.**

---

## 2026-03-07: Organic Distribution First, Browser-Dependent Tactics Second

**Decision:** Focus on distribution tactics that don't require browser access until Remi unblocks browser + account creation.

**Why:**
- Browser has been unavailable for 2+ days (Chrome extension needs tab attachment — 10-second fix)
- Reddit/Dev.to accounts missing for 2+ days (30-minute fix)
- These blockers are preventing ALL social distribution
- Meanwhile, code sits unused (0 stars, 0 integrations)

**What we CAN do without browser:**
- GitHub optimization (issues, discussions, docs) — SEO benefits
- Tutorial creation — ranks in Google
- Drafting comms content — ready to execute when browser available
- Email outreach — no browser needed

**What we CANNOT do without browser:**
- Twitter/X posting and engagement
- Reddit posting
- Dev.to posting
- Molthub/PinchSocial posting
- Real-time ctxly approval monitoring

**Trade-offs:**
- Slower initial traction (can't execute full comms blitz)
- Focus on passive discovery (SEO, GitHub search) vs active promotion
- Comms execution delayed until Remi action

**Alternatives considered:**
- Wait for Remi to fix browser (passive, wasteful)
- Give up on distribution (not an option)
- Find alternative browser automation (none available in current setup)

**Success metric:**
- When browser available, execute COMMS_DRAFTS.md in <1 hour
- Track GitHub stars, tutorial views, SDK installs over 30 days

**Revisit when:**
- Browser access restored
- Reddit/Dev.to accounts created
- Reassess if organic tactics are gaining traction on their own

---

## 2026-02-03: Use EAS (Ethereum Attestation Service)

**Decision:** Build on EAS instead of custom smart contracts

**Why:**
- EAS provides proven attestation infrastructure
- GraphQL API for queries (no custom indexer needed)
- Ecosystem compatibility with other EAS-based systems
- Soulbound/non-transferable attestations supported natively

---

## 2026-02-03: Soulbound Credentials (Non-Transferable)

**Decision:** All trust credentials are soulbound (cannot be transferred or sold)

**Why:**
- Trust/reputation should be earned, not bought
- Prevents gaming the system through credential markets
- Aligns with the philosophy: "Trust is earned through demonstrated action"

**Credential Types:**
1. TrustedWorker
2. GoodJudge
3. EarlyBuilder
4. VerifiedAgent
5. CommunityPillar

---

## 2026-02-03: Base Mainnet (Not Ethereum L1)

**Decision:** Deploy to Base instead of Ethereum mainnet

**Why:**
- Lower gas costs for attestations
- Fast finality
- Growing agent/crypto ecosystem on Base
- Same security model (L2 on Ethereum)

---

## 2026-02-04: Ship Core First, Enhance Later

**Decision:** Launch with placeholder trust score algorithm, improve iteratively

**Why:**
- Core infrastructure (schemas, attestations, queries) is the foundation
- Advanced scoring is an enhancement, not a blocker
- Real usage will inform better algorithm design
- "Ship > Perfect"

**Result:** Mainnet live, can announce publicly. Algorithm refinement is ongoing.

---

## 2026-02-27: GitHub Packages as npm Publish Workaround (APPROVED)

**Decision:** Publish to GitHub Packages (`npm.pkg.github.com`) instead of npmjs.org

**Status:** APPROVED — repo configured, awaiting `write:packages` token scope

**Why:**
- npm auth has been blocked for 13 days (since Feb 14)
- We have working GitHub auth already
- GitHub Packages supports scoped npm packages (`@nia-agent-cyber/*`)
- Unblocks launch announcement and adoption

**Trade-offs:**
- Users must add `@nia-agent-cyber:registry=https://npm.pkg.github.com` to `.npmrc`
- Slightly more friction than npmjs.org
- Can always dual-publish to npmjs.org later when auth is resolved

**Alternatives considered:**
- Continue waiting for npm auth (13 days and counting — not viable)
- Create new npm account (requires email verification, 2FA — main agent action)

---

## 2026-02-03: SwampBots Integration

**Decision:** Partner with raven_nft on SwampBots "Verified Agent" credential

**Why:**
- NFT collection specifically for agents
- Adds visual identity layer to trust system
- Cross-project validation

**Contract:** `0x2C0C7D71bf30eaC0FaB5b12Ac64E8388bfac0B1d` (Base mainnet)
