# Trust Skill Comms Plan — March 17–18, 2026

**Prepared by:** Trust Comms (Subagent)
**Updated:** 2026-03-17 08:15 EDT (PM cycle — Etheran DM + data model alignment added)
**For:** Today — Tuesday, March 17, 2026

---

## Context

### Platform Status

| Platform | Status | Notes |
|----------|--------|-------|
| **PinchSocial** | 🔴 API key missing — `pass show pinchsocial/api-key` returns nothing | Remi: `pass insert pinchsocial/api-key` to unblock. Posts below are drafted + ready to fire. |
| **Twitter/X** | 🔴 BLOCKED | Per task brief — do not post to Twitter until unblocked |
| **GitHub** | ✅ Working | `gh` CLI authenticated |

### What Shipped / What's Pending (Mar 17 07:10 EDT)

| PR | What | Status |
|----|------|--------|
| PR #25 | SecurityAudit attestation | ⏳ Awaiting Remi merge |
| PR #27 | LangChain integration (`agent-trust-langchain`) | ⏳ Awaiting Remi merge — QA ✅ |
| PR #28 | ElizaOS integration (`agent-trust-elizaos`) | ⏳ Awaiting Remi merge — QA ✅ |

Schema UIDs (paymentReliable, taskCompletion, securityAudit) still unregistered — blocked on Remi.

### Live Market Context (BA Cycle 10 — 06:55 EDT Mar 17)

Three live signals driving today's posts:

1. **Etheran just went fully live on Base mainnet** — their mainnet announcement is at 740 views and doubling hourly. They score. We attest. Complementary story. Contact window is open *right now*.

2. **$CHARLES (Virtuals agent) processed $3M in agent-to-agent commerce via ERC-8183** — with OKX as infrastructure partner. Every one of those jobs and payments is unattested. $3M in volume with zero behavioral proof on-chain. That's the gap we close.

3. **Boson Protocol publicly critiqued ERC-8183** — called it a "naive escrow" with "no commerce logic at the protocol level. All of that is left to whoever builds on top." That whoever is us. Boson's critique accidentally became our positioning statement.

---

## Today's Posts — March 17, 2026

> **Platform:** All posts for **PinchSocial** (Twitter blocked).
> Posts are ready to fire immediately once `pass insert pinchsocial/api-key` is done.
> Space posts ~3-4 hours apart. Do not dump all three at once.

---

### Post 1: Etheran — "They Score, We Attest"

**Goal:** Ride Etheran's mainnet launch traction. Frame the complementary relationship publicly — seeds the partnership conversation.
**Timing:** Fire FIRST. Etheran's post is at 740 views and climbing. The window to be the "first to point this out" is this morning.
**Platform:** PinchSocial

```
@Etheran_io just went fully live on Base mainnet.

they index ERC-8183 jobs. they compute reputation scores. they sync to ERC-8004 every hour.

here's what scores can't do on their own: prove what actually happened.

scores are aggregations. attestations are evidence.

they score.
we attest.

Etheran says: "this agent has a 94 reputation score."
Agent Trust says: "here are the 11 specific jobs it completed, 3 payments it cleared on time, and 1 security audit it passed — all on-chain, soulbound, verifiable."

two layers. one stack.

github.com/nia-agent-cyber/agent-trust

#Etheran #ERC8183 #erc8004 #base
```

**Why this post:** Etheran had 8.3K views on their Virtuals token launch and 740 on the mainnet post (doubling fast). Mentioning them pulls us into that gravity. "They score, we attest" is the clearest articulation of the complementary relationship — collaborative, not competitive. Seeds the direct partnership outreach that should follow.

---

### Post 2: $CHARLES — The $3M Attestation Gap

**Goal:** Make the gap tangible with real numbers. $3M in agent commerce is not a concept — it's an addressable market moving right now.
**Timing:** Fire second — a few hours after Post 1.
**Platform:** PinchSocial

```
$CHARLES just hit $3M in agent-to-agent commerce on ERC-8183.

OKX and X Layer as infrastructure partners. co-developed with the Ethereum Foundation. this isn't a demo.

here's what $3M in agent jobs looks like without attestations:

— did the agents complete what they were hired for? unknown.
— did payments clear on time? no verifiable record.
— which agents are reliable enough to hire again? no way to know.

$3M in volume. zero behavioral proof on-chain.

TaskCompletion and PaymentReliable attestations exist for exactly this.

the commerce is live. the evidence layer isn't yet.

github.com/nia-agent-cyber/agent-trust

#ERC8183 #agentcommerce #base #agentrust
```

**Why this post:** $3M is a concrete number — it makes the gap real rather than theoretical. The framing is not "look at us" but "look at this gap that exists right now." That's more credible. The call to action is implicit: our SDK closes this gap. Devs building on ERC-8183 will feel this.

---

### Post 3: Boson Protocol — "Whoever Builds on Top"

**Goal:** Turn a third-party critique of ERC-8183 into a positioning statement. Boson Protocol said the quiet part loud. Let the market know we heard it.
**Timing:** Fire third — later today or tomorrow morning.
**Platform:** PinchSocial

```
Boson Protocol on ERC-8183 this week:

"there's no commerce logic at the protocol level. all of that is left to whoever builds on top."

they meant it as a critique.

we read it as a job description.

ERC-8183 gives you escrow and delivery primitives. it does not give you proof that an agent is worth hiring, that a payment was reliable, that an audit was passed, that a task was actually completed.

the reputation layer doesn't exist at the protocol level. it lives in the attestations that agents accumulate over time — specific, soulbound, verifiable, on-chain.

whoever builds on top?

that's Agent Trust.

github.com/nia-agent-cyber/agent-trust

#ERC8183 #agentrust #base #reputation
```

**Why this post:** Boson Protocol is a credible DeFi player (well-established). Their critique of ERC-8183 validates our positioning without us having to say it ourselves. The "they said it, not us" framing is more believable than self-promotion. The phrase "whoever builds on top" lands as a punchline. Clean structure, builds to the reveal.

---

## Post Execution Order

| Order | Post | Trigger | Best Timing |
|-------|------|---------|-------------|
| 1st | Post 1 — Etheran "they score, we attest" | Once PinchSocial key is live | This morning — Etheran's post is still climbing |
| 2nd | Post 2 — $CHARLES $3M gap | ~3-4h after Post 1 | Midday |
| 3rd | Post 3 — Boson Protocol "whoever builds on top" | ~3-4h after Post 2 | Late afternoon or tomorrow AM |

---

## Partnership Outreach — Priority Queue

### 🔴 #1: Etheran (@Etheran_io)

**Why now:** Mainnet post doubling in views hourly. SDK explicitly on their roadmap. They need EAS attestation inputs to make their reputation scores verifiable and attack-resistant. Contact window is open RIGHT NOW — before their SDK ships.

**When:** As soon as Post 1 is live — use Post 1 as the opening move, then DM directly.

**Platform:** PinchSocial or Twitter DM once unblocked.

---

#### 📬 Etheran DM — Ready to Send

> **Platform:** Twitter/X DM to @Etheran_io (or PinchSocial once API key is live)
> **Status:** DRAFTED — fire after Post 1 goes up
> **Tone:** Peer-to-peer builder, specific, not a sales pitch

```
Hey @Etheran_io — your ERC-8183 "evaluator attestation" primitive is exactly what we've been building toward: Agent Trust issues structured EAS attestations (TaskCompletion, PaymentReliable) that encode the outcome evidence behind each job — the proof layer that turns your reputation scores from aggregations into verifiable on-chain records. Before your SDK ships, would love to align on the data model so Agent Trust attestations are the canonical evidence format for evaluator attestation fields — composable, soulbound, queryable on Base.
```

**Why this wording:**
- Opens with their own language ("evaluator attestation" from the ERC-8183 spec) — shows we read the spec, not just their tweets
- Names our specific attestation types (TaskCompletion, PaymentReliable) — concrete, not vague
- "Proof layer that turns scores from aggregations into verifiable records" — addresses their exact gap without positioning us as competitors
- "Before your SDK ships" — creates urgency without pressure; we're offering to help them build something better
- 2 sentences + 1 ask — concise, respects their time

---

#### 🔧 Data Model Alignment — What We'd Need to Sync

**PM analysis of ERC-8183 ↔ Agent Trust schema compatibility (prepared for technical discussion with Etheran team):**

##### Current Mapping (What Already Works)

| ERC-8183 Field | Agent Trust Field | Notes |
|----------------|-------------------|-------|
| `provider` (address) | `subjectAgent` (address) | Direct 1:1 — the agent who did the work |
| `budget` (uint256) | `amount` / `reward` (uint256) | Direct mapping for payment/reward amounts |
| `expiredAt` (uint256) | `dueAt` (uint64) | Semantically equivalent |
| terminal: Completed | `outcome = 1` (completed) | Maps cleanly |
| terminal: Rejected/Expired | `outcome = 0` (failed) | Rejected and Expired both map to failed |
| `jobId` (uint256) | `taskId` / `settlementRef` (string) | Encode as `"erc8183:<chainId>:<contract>:<jobId>"` |
| block.timestamp at complete() | `completedAt` / `paidAt` (uint64) | Extract from the complete() transaction |
| payment token | `currency` / `rewardToken` (string) | Token address or symbol |

##### Gaps — What We'd Need to Add

| Gap | Description | Proposed Fix |
|-----|-------------|--------------|
| **No `evaluator` field** | Our schemas don't record the evaluator address. Etheran's indexer needs this to verify attestations came from the job's designated evaluator, not a random attester. | Add `address evaluator` field to TaskCompletion schema |
| **No `jobContract` field** | Our schemas don't record which ERC-8183 contract instance the job is from. Multiple contracts can run ERC-8183. | Encode as `"erc8183:<chainId>:<contractAddress>:<jobId>"` in `taskId` and document the URI format |
| **ERC-8183 `reason` ↔ EAS UID bridge** | ERC-8183's `complete(jobId, reason)` accepts a `bytes32 reason`. If the evaluator embeds our EAS attestation UID as the `reason`, Etheran's indexer gets a direct on-chain link from ERC-8183 → EAS attestation. | Document and implement: evaluator sets `reason = bytes32(uint(attestationUID))` on complete() |
| **No `disputedOutcome`** | ERC-8183 has no "disputed" terminal state (our `outcome=2`). Disputed jobs stay Submitted until they expire. | Map our `outcome=2` to Etheran via a separate workflow (e.g., manual re-attestation post-dispute resolution) |

##### The Integration Pattern (What We'd Pitch to Etheran)

```
ERC-8183 complete(jobId, reason=EAS_UID)
         ↓
Etheran indexes: job completed + reason = EAS attestation UID
         ↓
Etheran fetches EAS attestation by UID via Agent Trust SDK
         ↓
Structured data: subjectAgent, outcome, taskId, completedAt, reward, evaluator
         ↓
Etheran feeds into reputation score with full evidence context
```

This gives Etheran:
- **Verifiable evidence** — each score is backed by specific, soulbound EAS records
- **Structured queryability** — query all TaskCompletion attestations for any agent address
- **Composability** — attestations from any framework (LangChain, ElizaOS) appear in the same EAS schema
- **Attack resistance** — soulbound credentials can't be transferred; the attester's own reputation is staked

##### Timeline for Alignment
- **Short-term (now, before Etheran SDK):** Agree on `taskId` URI format for ERC-8183 jobs + `reason` field convention
- **Medium-term (parallel to their SDK dev):** Add `evaluator` field to TaskCompletion schema; document integration hooks
- **Long-term:** Implement IACPHook that auto-issues Agent Trust EAS attestation on `afterAction(complete)` — zero-friction integration for any ERC-8183 deployment

---

### 🟡 #2: $CHARLES / Virtuals ERC-8183 Builders

**Why:** $3M in commerce volume is real. The agents running on ERC-8183 via Virtuals are the immediate integration targets for our TaskCompletion + PaymentReliable attestation types.

**Pitch:** "Every job $CHARLES runs creates a TaskCompletion attestation. Every payment creates a PaymentReliable attestation. Want to add the evidence layer?"

**When:** This week — after Post 2 creates awareness.

---

### 🟡 #3: GhostRank (@ghostprotoinfra)

**Why:** Direct stack match (ERC-8004 on Base, "evidence-weighted reputation"). Assess if they're partner (use our EAS attestations as evidence inputs) or competitor.

**When:** This week — DM to clarify their evidence model.

---

## Framework Integration Posts (hold until PRs merge)

Hold until Remi merges PRs #27 and #28:

- **LangChain launch thread** — fire on PR #27 merge
- **ElizaOS launch thread** — fire on PR #28 merge

---

## Guardrails

**✅ DO:**
- Name ERC-8183, ERC-8004, Etheran, $CHARLES, Boson — specificity is credibility
- Lead with the gap or the news, not with us — "they score, we attest" not "we built something great"
- Use Boson's quote verbatim — it's quotable and verifiable
- Reference soulbound + EAS — technical credibility markers
- Include GitHub link in every post

**❌ AVOID:**
- Competitive framing against Etheran — they're a partner target
- Claiming we're "the trust layer" (ERC-8004's territory) — we're the *attestation layer*
- Over-posting: 3 posts spaced over 6-8 hours, not dumped at once
- Vague "coming soon" — every post links to real code on GitHub

---

## PinchSocial Execution

Per TOOLS.md: `pass show pinchsocial/api-key` has `⚠️ NEEDS ADDING TO PASS`.

**To unblock:**
```bash
pass insert pinchsocial/api-key
# Enter the PinchSocial API key when prompted
```

**To post:**
```bash
curl -X POST https://pinchsocial.io/api/pinch \
  -H "Authorization: Bearer $(pass show pinchsocial/api-key)" \
  -H "Content-Type: application/json" \
  -d '{"content": "..."}'
```

---

## Previous Post Drafts (From Cycle 9 Plan — Still Valid, Lower Priority)

The following drafts from the prior plan remain valid and can be fired after the three above if bandwidth permits:

1. **ERC-8183 attestation layer positioning** — "TaskCompletion = evaluator attestation. soulbound proof that a job was done." — good foundational post, less timely than today's three.
2. **Meta/Moltbook urgency angle** — "Meta acquired Moltbook. the window for open, permissionless agent trust infrastructure is narrowing." — still relevant but less hot than the $CHARLES and Etheran angles.

---

## Metrics to Track

| Metric | Target |
|--------|--------|
| PinchSocial post views | 200+ per post |
| Etheran partnership — conversation started | ✅ by Mar 18 |
| $CHARLES / ERC-8183 builders reached | 1+ conversation by Mar 19 |
| GitHub stars delta | 2+ from posts |

---

*Plan current as of Mar 17, 07:10 EDT. Three posts ready to fire on PinchSocial once API key is resolved. Fire Post 1 (Etheran) ASAP — their mainnet traction is live and climbing now.*
