# Trust Skill Comms Plan — March 17, 2026

**Prepared by:** Trust Comms (Subagent)
**Date:** 2026-03-16 23:55 EDT
**For:** Tomorrow — Tuesday, March 17, 2026

---

## Context

### Current State (Mar 16, 23:55 EDT)

**PRs awaiting Remi merge:**
- ⏳ **PR #25** — SecurityAudit attestation. MERGEABLE. PM+QA approved.
- ⏳ **PR #27** — LangChain integration (`@nia-agent-cyber/agent-trust-langchain`). MERGEABLE. PM approved. QA reviewing.
- ⏳ **PR #28** — ElizaOS integration (`@nia-agent-cyber/agent-trust-elizaos`). MERGEABLE. PM approved. QA reviewing.

**Platform status:**
- ✅ **Twitter/X** — Working via openclaw browser profile (confirmed live posts Mar 12)
- 🔴 **PinchSocial** — API key missing. `pass show pinchsocial/api-key` returns nothing. `~/.config/pinchsocial/credentials.json` missing. BLOCKED.
- ✅ **GitHub** — `gh` CLI authenticated

**Strategic context (from BA Cycle 6, Mar 16 23:45 EDT):**
- LangChain + ElizaOS integrations = **biggest distribution unlock to date**
- MetaMask publicly discussing agent delegation + trust — our `TrustGate` (PR #27) is the exact pattern they described
- Helixa.xyz (Base, ERC-8004 + human cred hybrid) = partnership angle
- SAID Protocol accelerating on Solana — don't cede cross-framework narrative
- AI provenance (BBC "AI-free logo" signal) = new positioning axis for SecurityAudit

**Last posts (Mar 12):**
- PaymentReliable distribution post (Twitter ✅)
- @Clawdex_On_Base reply (Twitter ✅)
- @owockibot reply (Twitter ✅)
- @ScoutScoreAI reply (Twitter ✅)

---

## Tomorrow's Posts (March 17, 2026)

### 🚨 TIMING NOTE

PRs #27 + #28 are awaiting QA final approval + Remi merge. Post timing strategy:

| Phase | Trigger | Posts |
|-------|---------|-------|
| **Pre-merge** (morning) | Now / early AM | Post 1 — teaser/build hype |
| **On PR #27 merge** | When Remi merges | Post 2 — LangChain launch |
| **On PR #28 merge** | When Remi merges | Post 3 — ElizaOS launch |
| **Any time** | Parallel | Partnership outreach (MetaMask, Helixa) |

---

### Post 1: 🧵 Pre-Merge Teaser — "Framework integrations incoming"

**Goal:** Build anticipation before merges land. Signal to developer community.
**Timing:** Morning (fire regardless of merge status)
**Platform:** Twitter/X (primary)

#### Twitter Thread (3 tweets)

**Tweet 1/3:**
```
Something big dropping this week for the agent developer ecosystem. 🔐

Two framework integrations in final review — one for the largest agent dev community, one for the leading open-source agent framework.

Built on Agent Trust. Soulbound reputation gating for your AI pipelines.

🧵
```

**Tweet 2/3:**
```
What does reputation-gated AI actually look like in practice?

Before an agent calls a tool, delegate a task, or route a request — it checks on-chain trust first.

No trust score? Blocked.
Below threshold? Blocked.
Untrusted attester? Weighted down.

All via EAS on @base. All open source.
```

**Tweet 3/3:**
```
The frameworks are where developers live. That's where trust needs to live too.

Announcement dropping soon.

github.com/nia-agent-cyber/agent-trust

#agentrust #base #ethereum #AI
```

---

### Post 2: 🚀 LangChain Integration Launch — `@nia-agent-cyber/agent-trust-langchain`

**Goal:** Announce the LangChain package to the developer community. LangChain has the largest AI agent dev following.
**Timing:** Fire IMMEDIATELY when PR #27 merges
**Platform:** Twitter/X (primary)

#### Twitter Thread (4 tweets)

**Tweet 1/4 (Hook):**
```
🔐 Agent Trust × LangChain is LIVE.

Reputation-gated AI pipelines, built on EAS on @base.

@nia-agent-cyber/agent-trust-langchain — now available on GitHub Packages.

Thread 🧵
```

**Tweet 2/4 (What it does):**
```
What shipped:

• TrustCheckTool — drop-in LangChain tool that checks agent trust before any action
• TrustGate — a Runnable that blocks execution below a trust threshold
• createTrustMiddleware — middleware for trust-gating entire agent chains
• TrustGateError — typed error for downstream error handling

72 tests. TypeScript. Fully open source.
```

**Tweet 3/4 (Why it matters):**
```
Before your agent calls a tool, delegates a task, or routes a request — it now checks on-chain trust first.

Identity (ERC-8004) tells you WHO the agent is.
Agent Trust tells you IF you should work with them.

Now your LangChain pipeline can enforce that boundary. Automatically.
```

**Tweet 4/4 (CTA):**
```
Install:
echo "@nia-agent-cyber:registry=https://npm.pkg.github.com" >> .npmrc
npm install @nia-agent-cyber/agent-trust-langchain

github.com/nia-agent-cyber/agent-trust

#langchain #agentrust #base #AI #buildingInPublic
```

---

### Post 3: 🚀 ElizaOS Integration Launch — `@nia-agent-cyber/agent-trust-elizaos`

**Goal:** Announce the ElizaOS plugin to the agent framework community. ElizaOS is the dominant open-source agent framework.
**Timing:** Fire IMMEDIATELY when PR #28 merges (can be same day as Post 2 or next morning)
**Platform:** Twitter/X (primary)

#### Twitter Thread (4 tweets)

**Tweet 1/4 (Hook):**
```
🔐 Agent Trust × ElizaOS is LIVE.

Soulbound reputation enforcement for the leading open-source agent framework.

@nia-agent-cyber/agent-trust-elizaos — now on GitHub Packages.

Thread 🧵
```

**Tweet 2/4 (What it does):**
```
What shipped:

• createTrustCheckAction — ElizaOS action that checks trust before execution
• createTrustGuardEvaluator — evaluator that scores trust at runtime
• createTrustProvider — ElizaOS provider injecting trust context into agents
• createAgentTrustPlugin — one-liner plugin: drop into any ElizaOS character config

74 tests. TypeScript. Fully open source.
```

**Tweet 3/4 (Why it matters):**
```
ElizaOS is where a huge portion of the agent ecosystem is building.

Your character config can now declare:
"Only interact with agents that meet trust threshold X."
"Evaluate partner agents at runtime."
"Gate actions by on-chain reputation."

All verified on-chain. None of it staked or gamed.
```

**Tweet 4/4 (CTA):**
```
Install:
echo "@nia-agent-cyber:registry=https://npm.pkg.github.com" >> .npmrc
npm install @nia-agent-cyber/agent-trust-elizaos

github.com/nia-agent-cyber/agent-trust

#elizaos #agentrust #base #AI #buildingInPublic
```

---

## Partnership Outreach (March 17, 2026)

### 🎯 Priority 1: MetaMask — TrustGate Engagement

**Why now:** On Mar 15, @MetaMaskDev and @synthesis_md publicly discussed "combine scoped delegation with on-chain trust validation — before an agent gets delegated to, another agent checks its identity and reputation." Our `TrustGate` Runnable (PR #27) implements **exactly this pattern**.

**Strategy:** Public reply to their trust/delegation thread, demonstrating TrustGate as reference implementation. Don't pitch — show.

**Target accounts:** `@MetaMaskDev`, `@synthesis_md`

**Timing:** After PR #27 merges (so we have a real package to point to)

**Reply Draft (to their recent delegation/trust thread):**
```
@MetaMaskDev @synthesis_md We built exactly this pattern as part of our LangChain integration.

TrustGate: a Runnable that checks on-chain EAS reputation before an agent gets delegated to.

Before delegation → trust threshold check → block or allow.

All open source, Base mainnet. Would love your thoughts.
github.com/nia-agent-cyber/agent-trust
```

**If no recent thread to reply to — standalone tweet:**
```
.@MetaMaskDev is thinking about trust checks as a prerequisite for agent delegation.

We shipped it.

TrustGate: checks on-chain EAS reputation BEFORE delegation fires.

@nia-agent-cyber/agent-trust-langchain — now in final review.

Tagging for awareness: @MetaMaskDev @synthesis_md

github.com/nia-agent-cyber/agent-trust
```

---

### 🎯 Priority 2: Helixa.xyz — Partnership DM / Reply

**Why:** Helixa.xyz is on Base, blending ERC-8004 + human credentialing inputs (Ethos Network, Talent Protocol, Coinbase EAS). Their quote: "Bridging the agent/human identity & credibility is the future we are building for." Our attestation types (SecurityAudit, TaskCompletion, PaymentReliable) are exactly the kind of on-chain agent behavior signals that would enrich their cred scores.

**Strategy:** Complement framing — "our behavioral attestations as input signals for your cred scores."

**Target:** `@helixaxyz` (check their handle) or `@helixa_xyz`

**Reply/DM Draft:**
```
@helixaxyz Your hybrid agent+human credentialing approach on Base is exactly the right direction.

We're building the behavioral attestation layer: TaskCompletion, PaymentReliable, SecurityAudit — all soulbound, all on EAS on Base.

Our attestations = verified behavior signal. Could feed directly into your cred scores.

Complement not compete. Want to explore?

github.com/nia-agent-cyber/agent-trust
```

**Action:** Find their recent tweets and reply to one. Also look for their GitHub or Discord.

---

### 🟡 Watch: SAID Protocol

**Why:** SAID is accelerating (multiple platform integrations, 5.5K view posts). They're Solana-only but building fast. We should stay visible in cross-framework / cross-chain trust conversations before they expand to Base.

**Action:** Monitor their posts. If they post anything about cross-chain expansion or Base — engage immediately.

**Prepped reply (hold for right moment):**
```
@saidinfra Great momentum on Solana. Agent trust infrastructure is becoming the baseline.

We're doing the same on Base — soulbound attestations via EAS, LangChain + ElizaOS integrations landing this week.

Different chains, same thesis. Agent economies need verifiable reputation.
```

---

## Execution Order for March 17

| Time | Action | Platform | Contingency |
|------|--------|----------|-------------|
| AM (early) | Post 1 — Pre-merge teaser | Twitter | Always fire |
| On PR #27 merge | Post 2 — LangChain launch thread | Twitter | Hold if not merged |
| On PR #28 merge | Post 3 — ElizaOS launch thread | Twitter | Hold if not merged; fire next AM |
| After PR #27 | MetaMask outreach reply | Twitter | Find their thread or standalone tweet |
| Any time | Helixa.xyz reply/DM | Twitter | Find recent tweet to reply to |
| Ongoing | Monitor SAID Protocol, SelfClaw, ERC-8004 | Twitter | Engage if relevant |

---

## Content Guardrails

**✅ DO:**
- Lead with what's shipped — code, tests, package names
- Use concrete install commands (developers respect this)
- Reference EAS on Base — our technical credibility marker
- Complement ERC-8004 — "identity + reputation = complete"
- Tag partners/targets in outreach tweets
- Keep threads ≤4 tweets for engagement

**❌ AVOID:**
- Vague "coming soon" without substance
- "Trust layer for the agent economy" — ERC-8004 owns this phrase
- Posting before PR merges (no package to point to)
- Competing framing with ERC-8004

---

## Platform Status Reminder

| Platform | Status | Action |
|----------|--------|--------|
| **Twitter/X** | ✅ WORKING — use openclaw browser | Execute all posts |
| **PinchSocial** | 🔴 BLOCKED — API key missing | Remi: `pass insert pinchsocial/api-key` |
| **GitHub** | ✅ Working | Tag issues in posts |
| **LangChain Hub** | ⏳ Explore after PR #27 merge | Potential new distribution channel |
| **ElizaOS plugin registry** | ⏳ Explore after PR #28 merge | Potential new distribution channel |

---

## Metrics to Track

| Metric | Current | Target (Mar 17) |
|--------|---------|-----------------|
| Twitter impressions (launch posts) | — | 200+ per post |
| MetaMask engagement | ❌ Not started | ✅ Reply sent |
| Helixa.xyz engagement | ❌ Not started | ✅ Reply/DM sent |
| LangChain community mention | ❌ None | ✅ 1+ organic mention |
| GitHub stars | 0 | 3+ (realistic post-announcement) |

---

## Notes

- **Merge-gated posts are the priority.** Post 2 + 3 are the big ones. Post 1 fires regardless.
- **MetaMask is the highest-signal outreach.** They're publicly discussing exactly what we built.
- **Helixa.xyz is the most natural partnership fit.** Same chain, complementary not competing.
- **Don't over-post.** Two post 2+3 in the same day is fine; space them 3-4 hours apart.
- **LangChain Discord + ElizaOS GitHub Discussions** — worth posting there on merge day too (browser-based, no API needed).

---

*Comms plan for Mar 17. Three posts + two partnership sequences. Execute on merge signals from Remi.*
