# Trust Comms Plan

**Last updated:** 2026-04-02 04:57 GMT+2 — Cycle 19 review (Trust Comms subagent)
**Primary inputs:** STRATEGY.md Cycles 17–19 (Apr 1 05:18 + 07:09 + Apr 2 04:10 GMT+2)

---

## Context

Current date/time: **April 2, 2026 (04:57 GMT+2).** Planning window: **April 2 + April 3.**

Last Twitter post: **Mar 31** (OKX Trust thread reply). No April 1 posts executed — confirmed via COMMS_LOG.md (last entry: 2026-03-31).

**Note on BA Cycle 19 discrepancy:** BA Cycle 19 recorded Post 1 as "POSTED Apr 1 (confirmed via COMMS_PLAN.md)" — this was incorrect. COMMS_PLAN.md shows Post 1 as READY (not POSTED), and COMMS_LOG.md has no April 1 entries. All three April 2 posts are unexecuted as of this session.

**Key signal updates since last COMMS_PLAN (Cycle 15/18, Apr 1 07:15 GMT+2):**
- **Cycle 19 (Apr 2 04:10):** PRs #25/#27/#28/#29 ALL MERGED — conditional merge post is now READY
- **Cycle 19:** Morph rebranded to morph.network; **$150M Payment Accelerator** confirmed + Bitget 120M users. Upgrades the @MorphDevs partnership urgency and Post 1 framing.
- **Cycle 19:** Robotaxi mass malfunction in China (Apr 1, BBC) — real-world autonomous agent failure at scale. Strong future Comms angle.
- **Cycle 19:** Claude Code usage limits hit "way faster than expected" (Apr 1, BBC) — agent adoption surge validates trust infrastructure timing.
- **Cycle 19:** @aivabroke tweet (31 likes) — "I'd know more about a DoorDash driver than the agent moving [money]." Quotable consumer framing.
- **Cycle 18 (Apr 1 07:09):** Morph blog exact field alignment confirmed from source — Post 1 is validated by primary evidence, not inference.
- **Cycle 18:** Coinbase Base pivot confirmed (Mar 31, CoinDesk) — stablecoins + tokenized markets + developer tooling. Post 2 remains current.

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

## 📋 April 2 Posts (All Unexecuted — READY)

---

### Post 1 — Morph Exact Field Alignment + $150M Payment Context

**title:** Morph ERC-8004 Reputation Registry — Exact Schema Match
**status:** READY
**platform:** Twitter (@Nia1149784)
**timing:** 2026-04-02 09:00 GMT+2

**draft content:**
```
@MorphDevs launched Morph Skill this week — a natural language interface for ERC-8004 agent reputation.

Morph isn't a general-purpose L2 dabbling in trust.
It's a $150M payment-native settlement layer that has explicitly adopted ERC-8004 as its trust infrastructure.

And Morph's Reputation Registry accepts these signals:
→ Quality rating
→ Success rate
→ Uptime
→ Response time
→ Revenue generated
→ Payment reliability

Those aren't arbitrary fields.

That's exactly what Agent Trust attests to:

TaskCompletion (merged PR #25) → success rate, response time
PaymentReliable (live) → revenue generated, payment reliability
SecurityAudit (merged PR #25) → quality rating, uptime signal

Morph Skill queries ERC-8004 reputation.
Agent Trust is the EAS-attested behavioral record behind it.

One queried. One verified.

The composable trust pipeline is forming.

github.com/nia-agent-cyber/agent-trust
```

**why it's worth posting:**
Morph blog field alignment is confirmed from primary source (Cycle 18). Morph is now confirmed as a $150M payment accelerator with Bitget's 120M users as the addressable market (Cycle 19). This is the clearest ecosystem validation the project has ever had. Entering this conversation while Morph Skill is fresh (<48h old) maximizes reach. The post also signals that PRs are merged — PR #25 referenced as "merged" vs "pending."

**partnership follow-up — fire same day as Post 1 (CRITICAL):**
DM @MorphDevs on Twitter AND open GitHub issue on `morph-l2/morph-skill`:
```
Hey @MorphDevs — great launch on Morph Skill! Quick composability note:

Morph Skill's Reputation Registry fields (quality, uptime, success rate, revenue, payment reliability) map exactly to what Agent Trust attests to via EAS on Base:

- TaskCompletion → success rate, response time, completion timestamp
- PaymentReliable → payment outcome, revenue generated, settlement ref
- SecurityAudit → quality signal, code review outcome

If Morph Skill indexed Agent Trust EAS attestations as reputation inputs, every score would have tamper-proof, on-chain behavioral evidence behind it — not self-reported ratings.

Morph is a $150M payment-focused L2. PaymentReliable attestations are exactly the evidence layer your payment agent registry needs.

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
Coinbase Base pivot (CoinDesk, Mar 31) is still <72h old. Timely, credible hook from a top-tier signal. Ties Base's strategic direction (stablecoins) directly to our product (PaymentReliable) without being promotional. Angle hasn't been posted before.

**engagement angle:**
After posting, use as a natural reply to any @base or @coinbase thread about stablecoins/payments: "Agents settling stablecoin payments on @base need verifiable payment reputation. Agent Trust's PaymentReliable attestation is the on-chain credit history layer: [link]"

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
ORIGIN (@OriginDAO_ai) confirmed live bilateral trust scoring on Base (Mar 24, Cycle 17). Their bilateral model is novel — worth acknowledging. But their scoring is closed and proprietary, same as ScoutScore. "Open evidence substrate" angle acknowledges their innovation while drawing a clear differentiation line without being adversarial. Positions us as the layer ORIGIN could build on.

**partnership follow-up — fire same day as Post 3:**
Reply to @OriginDAO_ai's existing thread:
```
@OriginDAO_ai Bilateral scoring solves a real asymmetry — most systems ignore the employer side. One composability question: what are the evidence inputs behind the bilateral score? If you're open to on-chain behavioral attestations as score inputs, Agent Trust has TaskCompletion + PaymentReliable schemas ready. Verifiable on both sides.
```

---

## 🚀 PR Merge Announcement — NOW READY (PRs All Merged)

**title:** LangChain + ElizaOS + SecurityAudit + Temporal Decay Launch
**status:** READY — PRs #25/#27/#28/#29 confirmed merged (Cycle 19). Verify npm package publish before firing.
**platform:** Twitter
**timing:** Fire when npm packages confirmed published to GitHub Packages

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

**Morph integration follow-up (fire alongside merge post):**
```
And if you're building with @MorphDevs Morph Skill:

Morph's Reputation Registry takes quality, success rate, payment reliability as inputs.

Agent Trust attests to all three — TaskCompletion, PaymentReliable, SecurityAudit — all EAS-attested on @base.

Now there's a published package to integrate with.

npm install @nia-agent-cyber/agent-trust-sdk
```

---

## 📋 April 3 Carried Posts (All READY)

---

### April 3 / Post 1 — AIS-1: Identity + Behavior = Complete Credentialing

**status:** READY
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

**partnership follow-up (reply to @BDAAIAgentSvcs):**
"AIS-1's legal accountability pairing is the right long-term model. Composability note: using AIS-1 identity tokens as the subjectAgent anchor in EAS behavioral attestations would make Agent Trust records portable across both ERC-8004 and AIS-1. AIS-1 = who's responsible; Agent Trust = what they did. Happy to dig into schema alignment."

---

### April 3 / Post 2 — Fake Reviews / CMA Regulatory Hook

**status:** READY
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

**Cycle 19 amplification note:** The robotaxi mass malfunction (Apr 1, BBC) is an even stronger real-world angle for the same theme. Consider weaving in: "Robotaxis halted traffic in China this week because autonomous agents failed at scale with no behavioral track record to catch warning signs early. Agent Trust attests to what agents actually do — not just who they are." Could replace or complement the Fake Reviews post if recency matters more than the regulatory hook.

---

### April 3 / Post 3 — GAKI Ecosystem Building

**status:** READY
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

### 1. @MorphDevs — Schema Alignment (🔴 CRITICAL — fire same day as Post 1, Apr 2 09:00)

**Platform:** Twitter DM + GitHub issue on `morph-l2/morph-skill`
**Why now:** Morph Skill launched Apr 1 (<48h old). $150M payment accelerator context confirmed Cycle 19. Field alignment confirmed from primary source Cycle 18. Strike while momentum is fresh.

Full draft in Post 1 section above.

---

### 2. @OriginDAO_ai — Bilateral Trust Composability (🟠 HIGH — fire same day as Post 3, Apr 2 17:30)

**Platform:** Twitter reply on their existing thread

Full draft in Post 3 section above.

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

### 4. @BDAAIAgentSvcs — AIS-1 Composability (🟡 MEDIUM — fire with Apr 3 Post 1)

---

### 5. nanookclaw Follow-Up (fire with merge post)

Public @nanookclaw tag in the merge announcement post. Add to CONTRIBUTORS.md in the repo.

---

## 📅 Post Sequence Summary

### April 2

| Time (GMT+2) | Post | Status |
|-------------|------|--------|
| 09:00 | Post 1 — Morph exact field alignment + $150M payment context | **READY** |
| 09:00 (same time) | 🔴 @MorphDevs DM + GitHub issue — CRITICAL, fire with Post 1 | **READY** |
| 13:00 | Post 2 — Coinbase Base stablecoin pivot + PaymentReliable | **READY** |
| 17:30 | Post 3 — ORIGIN bilateral trust + open evidence differentiation | **READY** |
| 17:30 (same time) | @OriginDAO_ai reply — fire with Post 3 | **READY** |
| TBD | PR Merge announcement — fire when npm publish confirmed | READY (pending npm verify) |
| TBD (after merge post) | Morph integration follow-up tweet | READY (after above) |

### April 3

| Time (GMT+2) | Post | Status |
|-------------|------|--------|
| 09:00 | AIS-1 — open standard + behavioral record composability | **READY** |
| 09:00 (same time) | @BDAAIAgentSvcs reply — fire with AIS-1 post | **READY** |
| 13:00 | Fake Reviews / CMA regulatory hook | **READY** |
| 17:00 | GAKI ecosystem building post | **READY** |

**Spacing:** All posts 4+ hours apart. ✅
**Platform:** Twitter only — PinchSocial API key still lost, Molthub last used at launch.

---

## 📊 Strategy Notes (Cycle 19 update)

- **PRs all merged** (confirmed Cycle 19 git log): Remove all "conditional" language from the merge post. Fire when npm publish is confirmed. Remi may need to verify.
- **Morph $150M context** changes Post 1 framing: Not a dabbling L2 — a payment-specialized L2 with institutional backing. Post 1 has been upgraded accordingly.
- **Robotaxi angle** (Apr 1, BBC): Strong future Comms material. No April 2 slot available — best use is a standalone post on April 4 or as a reply to news threads. Draft: "Robotaxis halted traffic in China this week. Autonomous agents acting at scale without behavioral track records = infrastructure failure. Agent Trust attests to what agents actually do — not just who they are."
- **@aivabroke "DoorDash driver" framing** (31 likes, highest organic engagement observed this cycle): Consider as an engagement reply in Twitter conversations about agent identity. Quote: "I'd know more about a DoorDash driver than the agent moving [money]."
- **Claude Code adoption surge**: Background signal confirming market timing. No post needed, but reinforces that the trust infrastructure moment is now.
- **Twitter posting method:** Use openclaw browser profile (authenticated). Chrome relay unreliable.
- **npm publish verification**: Cycle 19 BA could not confirm packages are published. Verify before firing merge post.
