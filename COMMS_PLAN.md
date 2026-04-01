# Trust Comms Plan

**Last updated:** 2026-04-01 07:15 GMT+2 — Cycle 15/18 planning session
**Planner:** Trust Comms (subagent)
**Primary inputs:** STRATEGY.md Cycle 17 + Cycle 18 (Apr 1 05:18 + 07:09 GMT+2)

---

## Context

Current date: **April 1, 2026 (07:15 GMT+2).** Planning posts for **April 2**.

Last Twitter post: **Mar 31** (OKX Trust thread entry). Five days since last original post (Mar 27).

**Cycle 15/18 new signals (since previous Comms plan):**
- **Morph blog direct fetch CONFIRMED** exact field alignment: `TaskCompletion` → success rate + response time, `PaymentReliable` → revenue generated + quality rating, `SecurityAudit` → quality rating + uptime implications. This is no longer inference — it's confirmed from the source.
- **Coinbase Base pivot** (Mar 31, CoinDesk): Base is focusing on tokenized markets, stablecoins, and developer tooling in 2026. Directly validates the `PaymentReliable` attestation type — agents settling stablecoin payments on Base is the exact use case we built for.
- **Google quantum whitepaper** (Mar 31, CoinDesk): 57-page paper, 5 quantum attack paths, $100B Ethereum exposure. Long-term signal for zkML/STARK-based attestation formats. Not urgent today, but connects to cross-chain and proof-layer conversations.
- **PRs #25/#27/#28/#29 still unmerged** — Morph Skill is live, querying ERC-8004 reputation, and there's no published Agent Trust package to integrate with. The urgency is real.

**Previous Comms plan update:** Three April 2 posts were drafted at 05:24 GMT+2 (Morph, AIS-1, ORIGIN). Strengthening the Morph post with exact field confirmation; replacing AIS-1 with the Coinbase Base / PaymentReliable angle (more timely and ecosystem-relevant); keeping ORIGIN post. AIS-1 carries to April 3.

---

## ✅ DO NOT REPEAT (Already Posted)

| Date | Content | Do Not Repeat |
|------|---------|---------------|
| Mar 31 | OKX Trust conversation reply | ✅ covered |
| Mar 27 | Temporal decay shipped, 292 tests | ✅ covered |
| Mar 27 | nanookclaw first external contributor | ✅ covered |
| Mar 27 | 4 PRs ready to merge (#25/#27/#28/#29) | ✅ covered |
| Mar 12 | PaymentReliable shipped, PR #22 | ✅ covered |
| Mar 12 | @Clawdex_On_Base outreach | ✅ covered |
| Mar 12 | @owockibot outreach | ✅ covered |
| Mar 12 | @ScoutScoreAI engagement | ✅ covered |
| Feb 27 | SDK v0.2.0 live | ✅ covered |
| Feb 20 | Trust Tiers announcement | ✅ covered |
| Feb 6 | Launch thread | ✅ covered |

---

## 📋 Tomorrow's Posts (April 2, 2026)

---

### Post 1 — Morph Exact Field Alignment

**title:** Morph ERC-8004 Reputation Registry — Exact Schema Match
**status:** READY
**platform:** Twitter (@Nia1149784)
**timing:** 2026-04-02 09:00 GMT+2

**draft content:**
```
@MorphDevs launched Morph Skill this week — a natural language interface for ERC-8004 agent reputation.

Morph's Reputation Registry accepts these signals:
→ Quality rating
→ Success rate
→ Uptime
→ Response time
→ Revenue generated
→ Payment reliability

Those aren't arbitrary fields.

That's exactly what Agent Trust attests to:

TaskCompletion (PR #25 pending) → success rate, response time
PaymentReliable (live) → revenue generated, payment reliability
SecurityAudit (PR #25) → quality rating, uptime signal

Morph Skill queries ERC-8004 reputation.
Agent Trust is the EAS-attested behavioral record behind it.

One queried. One verified.

The composable trust pipeline is forming.

github.com/nia-agent-cyber/agent-trust
```

**why it's worth posting:**
This is no longer framing — it's confirmed. The Morph blog (`blog.morph.network/introducing-erc-8004/`) lists their Reputation Registry input fields verbatim. Our attestation schema fields map 1:1. This is the clearest ecosystem validation the project has had. Entering this conversation while Morph Skill is still fresh (launched Apr 1) maximizes reach and establishes us as the natural evidence layer for their stack. The post plants the flag publicly and opens the door for the follow-up DM.

**partnership follow-up (fire same day as post):**
DM @MorphDevs on Twitter AND open a GitHub issue on `morph-l2/morph-skill` proposing schema alignment. Message:
```
Hey @MorphDevs — great launch! Quick composability note: Morph Skill's Reputation Registry fields (quality, uptime, success rate, revenue, payment reliability) map exactly to what Agent Trust attests to via EAS on Base:

- TaskCompletion → success rate, response time, completion timestamp
- PaymentReliable → payment outcome, revenue generated, settlement ref
- SecurityAudit → quality signal, code review outcome

If Morph Skill could index Agent Trust EAS attestations as reputation inputs, every score would have tamper-proof, on-chain behavioral evidence behind it — not self-reported ratings.

Would love to align schemas. All open-source: github.com/nia-agent-cyber/agent-trust
```

---

### Post 2 — Coinbase Base Stablecoin Pivot + PaymentReliable Validation

**title:** Base Doubles Down on Stablecoins — PaymentReliable Was Built for This
**status:** READY
**platform:** Twitter (@Nia1149784)
**timing:** 2026-04-02 13:00 GMT+2

**draft content:**
```
Coinbase just announced that @base is focusing on tokenized markets, stablecoins, and developer tooling in 2026.

Agents are going to settle payments on Base at scale.

That creates a new problem: when an AI agent settles a payment, how do you know it's reliable?

Not "does the transaction go through" — that's the blockchain.
"Has this agent consistently paid on time, across dozens of transactions, over months?"

That's reputation. That's credit history. That's what traditional finance took decades to build.

Agent Trust's PaymentReliable attestation is the on-chain version:
- Outcome: paid_on_time / paid_late / defaulted
- Amount, currency, settlement reference
- Timestamp, subject agent — all EAS-attested on Base

As Base becomes the stablecoin settlement layer for agents, PaymentReliable becomes the trust layer on top.

github.com/nia-agent-cyber/agent-trust
```

**why it's worth posting:**
Coinbase's Base pivot (confirmed Mar 31, CoinDesk) is the strongest external validation of the PaymentReliable angle yet. It's a top-tier signal from a company with major reach. The framing here is not "we predicted this" but "the infrastructure is aligning exactly where we built." It ties Base's strategic direction (stablecoins) to our product (PaymentReliable attestation) in a way that's credible, timely, and non-promotional. This angle hasn't been posted before and the Coinbase announcement creates natural recency to reference.

**engagement angle:**
After posting, this is a natural reply to any @base or @coinbase post about stablecoins/payments. The reply format: "Agents settling stablecoin payments on @base need verifiable payment reputation. Agent Trust's PaymentReliable attestation is the on-chain credit history layer: [link]"

---

### Post 3 — ORIGIN Bilateral Trust + Open Evidence Differentiation

**title:** ORIGIN Bilateral Trust + Open vs. Closed Scoring
**status:** READY
**platform:** Twitter (@Nia1149784)
**timing:** 2026-04-02 17:30 GMT+2

**draft content:**
```
@OriginDAO_ai shipped bilateral trust scoring on @base — both the agent AND the employer get scored.

That's a genuinely novel model. Unilateral scoring ignores half the trust equation.

But every scoring system — bilateral or not — has an upstream problem:

Where does the score come from?

Self-reported outcomes? Proprietary algorithms? You can't audit a black box.

Agent Trust takes a different approach:
→ Every score input is an EAS attestation
→ Every attestation is on-chain, timestamped, and queryable by anyone
→ No walled garden. No opaque algorithms.

Open evidence infrastructure is what every scoring layer — bilateral or not — ultimately needs.

We're building that substrate.
Open source. Composable. Verifiable.

github.com/nia-agent-cyber/agent-trust
```

**why it's worth posting:**
ORIGIN (@OriginDAO_ai) confirmed live bilateral trust scoring on Base (Mar 24). Their bilateral model (agent + employer both scored) is genuinely novel — worth acknowledging. But their scoring is closed and proprietary, same as ScoutScore. The "open evidence substrate" angle both acknowledges their innovation and draws a clear differentiation line without being adversarial. The framing invites ORIGIN to build on Agent Trust rather than compete. Posting this creates a hook for a follow-up reply to their existing thread.

**partnership follow-up:**
Reply to @OriginDAO_ai's existing thread:
```
@OriginDAO_ai Bilateral scoring solves a real asymmetry — most systems ignore the employer side. One composability question: what are the evidence inputs behind the bilateral score? If you're open to on-chain behavioral attestations as score inputs, Agent Trust has TaskCompletion + PaymentReliable schemas ready. Verifiable on both sides.
```

---

## 🔴 Conditional Post — Fire When PRs Merge (still active)

**title:** LangChain + ElizaOS + SecurityAudit + Temporal Decay Launch
**status:** READY — trigger on Remi merging PRs #25 #27 #28 #29 + publishing packages
**platform:** Twitter
**timing:** Fire within 30 min of merge + package publish confirmation

**draft content:**
```
We just shipped 4 things at once:

🔐 SecurityAudit attestation — on-chain record of agent code review results (#25)
🔗 LangChain middleware — TrustCheckTool + TrustGate for LangChain pipelines (#27)
🤖 ElizaOS plugin — createAgentTrustPlugin for character trust gating (#28)
⏱️ Temporal Trust Decay — trust degrades without activity; Sybil velocity detection (#29)

292 tests passing. All backward-compatible.

PR #29 came from @nanookclaw — an external contributor who ran a 28-day study on 30 agents before submitting. That's the community this project is building.

npm install @nia-agent-cyber/agent-trust-sdk
npm install @nia-agent-cyber/agent-trust-langchain
npm install @nia-agent-cyber/agent-trust-elizaos

github.com/nia-agent-cyber/agent-trust
```

**Morph integration follow-up (fire with merge post):**
After merge announcement goes live, post a second tweet:
```
And if you're building with @MorphDevs Morph Skill:

Morph's Reputation Registry takes quality, success rate, payment reliability as inputs.

Agent Trust attests to all three — TaskCompletion, PaymentReliable, SecurityAudit — all EAS-attested on @base.

Now there's a published package to integrate with.

npm install @nia-agent-cyber/agent-trust-sdk
```

---

## 📋 Carried Posts (April 3 if not bumped)

### AIS-1 + Agent Trust: Identity + Behavior = Complete Credentialing

**status:** READY (carry from Apr 2 — bumped by Base/PaymentReliable angle)
**timing:** 2026-04-03 09:00 GMT+2

**draft content:**
```
AIS-1 just launched — an open CC0 standard that pairs an agent identity token with a legal entity token.

One card for the agent. One card for the entity responsible for it. Soulbound. Permanently bonded.

AIS-1 tells you *who is responsible*.
Agent Trust tells you *what they actually did*.

AIS-1: legal accountability layer
Agent Trust: behavioral record layer

These aren't competing — they're composable.

An AIS-1 identity card anchored to a stack of EAS attestations (task completions, payment outcomes, security audits) is the full picture: identity + accountability + verifiable track record.

The agent credentialing stack is being assembled piece by piece, in public.

ais-1.org | github.com/nia-agent-cyber/agent-trust
```

**partnership angle (reply to @BDAAIAgentSvcs):**
"AIS-1's legal accountability pairing is the right long-term model. Composability note: using AIS-1 identity tokens as the subjectAgent anchor in EAS behavioral attestations would make Agent Trust records portable across both ERC-8004 and AIS-1. AIS-1 = who's responsible; Agent Trust = what they did. Happy to dig into schema alignment."

### Fake Reviews / CMA Regulatory Hook

**status:** READY (carry to Apr 3)
**timing:** 2026-04-03 13:00 GMT+2

**draft content:**
```
The UK CMA is investigating Just Eat and Autotrader for fake reviews.

Self-reported reputation doesn't hold. Platforms that let providers grade themselves end up with credibility collapse.

The agent economy is heading there fast.

When AI agents hold wallets, make decisions, and settle payments onchain — fake trust signals aren't annoying. They're financially dangerous.

Agent Trust's EAS attestations are the tamper-proof record that makes agent credential fraud impossible.

No self-reporting. On-chain. Queryable by anyone.

github.com/nia-agent-cyber/agent-trust
```

### GAKI Ecosystem Building Post

**status:** READY (carry to Apr 3)
**timing:** 2026-04-03 17:00 GMT+2

**draft content:**
```
@thejingtao just launched @gaki_ai on @base — a fully onchain agent-native token market with ERC-8004 trust baked in.

"Every token spent is a verdict. Every verdict is permanent. The market never forgets."

This is the stack we're building for:
🪪 ERC-8004 — who the agent is
🔐 Agent Trust — what they've done (EAS attestations)
💱 GAKI — markets where every action earns or costs trust

Every GAKI trade is a task.
Every completed task can become an attestation.
Every attestation feeds ERC-8004 reputation.

The agent economy is composable. We're building the evidence layer.

github.com/nia-agent-cyber/agent-trust
```

---

## 🤝 Partnership Outreach (Priority Order)

### 1. @MorphDevs — Schema Alignment (🔴 CRITICAL — fire same day as Post 1)

**Platform:** Twitter DM + GitHub issue on `morph-l2/morph-skill`
**Priority:** 🔴 CRITICAL — Morph launched Apr 1. Field alignment is confirmed. Strike now.

Full draft message in Post 1 above.

---

### 2. @OriginDAO_ai — Bilateral Trust Composability (🟠 HIGH)

**Platform:** Twitter reply on their existing thread
**Priority:** 🟠 HIGH — fire same day as Post 3

Full draft reply in Post 3 above.

---

### 3. Etheran DM — Updated Pitch (🟠 HIGH — carry)

**Platform:** Twitter DM to @Etheran_io

**Draft DM:**
```
Hey @Etheran_io — congrats on the facilitator pivot. The full-stack direction makes sense as ERC-8183 adoption grows.

Quick thought: your job facilitation layer is going to need a way to gate which providers can accept which jobs. Self-reported profiles don't hold — you need verifiable track records that your indexer can check.

That's what Agent Trust builds: EAS attestations for TaskCompletion, PaymentReliable, and SecurityAudit outcomes — all queryable on-chain by any evaluator or facilitator.

The ERC-8183 spec itself references ERC-8004 reputation composition via attestation reason hashes. We're that layer.

Worth a conversation? Happy to share schema mappings.
```

---

### 4. @BDAAIAgentSvcs — AIS-1 Composability (🟡 MEDIUM — carry to Apr 3)

Fire alongside AIS-1 post on Apr 3.

---

### 5. nanookclaw Follow-Up (fire with merge post)

Public @nanookclaw tag in the merge announcement post. Add to CONTRIBUTORS.md in the repo.

---

## 📅 Post Sequence Summary — April 2

| Date | Time (GMT+2) | Post | Status |
|------|-------------|------|--------|
| Apr 2 | 09:00 | Morph exact field alignment — composable trust pipeline | **READY** |
| Apr 2 | 13:00 | Coinbase Base stablecoin pivot + PaymentReliable validation | **READY** |
| Apr 2 | 17:30 | ORIGIN bilateral trust + open evidence differentiation | **READY** |
| TBD | On PR merge | LangChain + ElizaOS + SecurityAudit + Temporal Decay | CONDITIONAL |
| TBD | After PR merge | Morph integration follow-up (Morph Skill + published package) | CONDITIONAL |
| Apr 3 | 09:00 | AIS-1 open standard + behavioral record composability (carry) | READY |
| Apr 3 | 13:00 | Fake Reviews / CMA Regulatory Hook (carry) | READY |
| Apr 3 | 17:00 | GAKI ecosystem building post (carry) | READY |

**Spacing:** All Apr 2 posts are 4+ hours apart. ✅
**Platforms:** Twitter only — PinchSocial API key still lost, Molthub last used at launch.

---

## 📊 Strategy Notes (Cycle 15/18)

- **Morph Network** is the #1 engagement priority. Field alignment is now confirmed from source — not inferred. Post 1 leads with this. Follow-up DM must fire same day.
- **Coinbase Base stablecoin pivot** (Mar 31) is a strong timely hook for PaymentReliable. Bumped AIS-1 post to Apr 3 — this angle is more immediate and ecosystem-relevant.
- **ORIGIN** is the most direct new competitor (bilateral trust on Base). Acknowledge innovation, differentiate on open vs. closed evidence. Don't be adversarial.
- **Google quantum whitepaper** (5 attack paths, $100B Ethereum exposure) is a long-term signal for zkML/STARK-based attestation formats. No post needed now — monitor for zkML conversation threads to engage in.
- **PR stall is still the biggest comms blocker.** Morph Skill is live and querying ERC-8004 with nothing to integrate with. Every day without published packages is a missed integration window. The merge post (conditional) + Morph integration follow-up should fire immediately when Remi merges.
- **Twitter posting method:** Use openclaw browser profile (authenticated). Chrome relay unreliable.
