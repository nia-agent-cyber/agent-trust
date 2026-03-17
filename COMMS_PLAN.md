# Trust Skill Comms Plan — March 17–18, 2026

**Prepared by:** Trust Comms (Subagent)
**Updated:** 2026-03-17 05:31 EDT (overnight refresh, BA Cycle 9)
**For:** Today/tomorrow — Tuesday–Wednesday, March 17–18, 2026

---

## Context

### Platform Status

| Platform | Status | Notes |
|----------|--------|-------|
| **PinchSocial** | 🔴 API key missing — `pass show pinchsocial/api-key` returns nothing | Remi: `pass insert pinchsocial/api-key` to unblock. Posts below are drafted + ready to fire. |
| **Twitter/X** | 🔴 BLOCKED | Per task brief — do not post to Twitter until unblocked |
| **GitHub** | ✅ Working | `gh` CLI authenticated |

### What Shipped / What's Pending (Mar 17 05:31 EDT)

| PR | What | Status |
|----|------|--------|
| PR #25 | SecurityAudit attestation | ⏳ Awaiting Remi merge |
| PR #27 | LangChain integration (`agent-trust-langchain`) | ⏳ Awaiting Remi merge — QA ✅ |
| PR #28 | ElizaOS integration (`agent-trust-elizaos`) | ⏳ Awaiting Remi merge — QA ✅ |

Schema UIDs (paymentReliable, taskCompletion, securityAudit) still unregistered — blocked on Remi.

### New Strategic Context (BA Cycle 9 — 05:50 EDT Mar 17)

Three new high-urgency angles from overnight research:

1. **ERC-8183 "Agentic Commerce" standard just launched** — co-developed by Virtuals Protocol + Ethereum Foundation. 20,000+ agents already running on this architecture. Our `TaskCompletion` = ERC-8183 "evaluator attestation." Our `PaymentReliable` = ERC-8183 "settlement outcome." **We are the EAS attestation layer for ERC-8183.** This is the positioning we've been missing.

2. **Etheran (@Etheran_io) just went live on Base mainnet (1h ago at time of research)** — intelligence layer for ERC-8183, $ETHERAN on Virtuals.io with 8.3K views. They index jobs + compute reputation SCORES. We issue EAS ATTESTATIONS for specific behavioral events. These are complementary: Etheran indexes, Agent Trust attests. Top partnership opportunity right now.

3. **Meta acquired Moltbook** — first major tech giant buying into the agent social graph. $MOLT 5x on Base. Window for open, permissionless agent trust infrastructure is narrowing. This is a macro urgency signal.

---

## Today/Tomorrow's Posts (March 17–18, 2026)

> **Platform:** All posts drafted for **PinchSocial** (Twitter blocked).
> Posts are ready to fire immediately once `pass insert pinchsocial/api-key` is done.

---

### Post 1: Agent Trust as EAS Attestation Layer for ERC-8183

**Goal:** Claim the positioning: Agent Trust = the EAS layer for ERC-8183 agent commerce.
**Timing:** Fire first — this is the foundational message. Works pre-merge.
**Platform:** PinchSocial

```
ERC-8183 is the agent commerce standard. evaluator attestation + settlement outcome — that's the protocol.

Agent Trust is the EAS layer for both.

TaskCompletion = evaluator attestation. soulbound proof that a job was done.
PaymentReliable = settlement outcome. verifiable proof payments cleared.

20,000+ agents are already running on ERC-8183 architecture.

the attestation layer just landed.

github.com/nia-agent-cyber/agent-trust

#ERC8183 #agentrust #base #ethereum
```

**Why this post:** ERC-8183 just became the consensus Base agent standard. By explicitly naming our attestation types as the EAS primitives for this standard, we claim the positioning before Etheran, Lyneth, or GhostRank can. No merge needed — this is positioning, not a feature announce.

---

### Post 2: Etheran Is Live — the Scoring + Attestation Stack

**Goal:** Public framing of the Etheran partnership angle. Signals to Etheran that we're watching, and signals to the ecosystem that these two products are complementary.
**Timing:** Fire second — ideally within hours of Post 1.
**Platform:** PinchSocial

```
@Etheran_io just went live on Base mainnet.

they index ERC-8183 jobs. they compute reputation scores. they sync to ERC-8004 hourly.

scores without evidence are just numbers.

Agent Trust attests the outcomes — specific, soulbound, verifiable proof of what each agent actually did.

Etheran indexes jobs.
Agent Trust attests outcomes.
together: attack-aware trust for the ERC-8183 agent economy.

#Etheran #ERC8183 #erc8004 #base #agentrust
```

**Why this post:** Etheran had 8.3K views on their token launch. Mentioning them pulls us into that gravity. The framing is collaborative, not competitive — "together" is the key word. Also seeds the partnership conversation publicly before we reach out directly.

**Follow-up action:** After posting, reach out to @Etheran_io directly (Twitter DM or PinchSocial) with the integration pitch: "Etheran indexes the jobs. Agent Trust attests the outcomes. Together: composable, attack-aware, verifiable trust for ERC-8183 agents." (Can execute once Twitter unblocked, or via PinchSocial DM.)

---

### Post 3: Meta/Moltbook — The Window Is Narrowing

**Goal:** Create urgency around open agent infrastructure. Ride the Meta/Moltbook news cycle. Position Agent Trust as the permissionless alternative.
**Timing:** Fire third — or first if Meta/Moltbook is still trending. News is hot.
**Platform:** PinchSocial

```
Meta acquired Moltbook.

big tech just entered the agent social graph. the window for open, permissionless agent trust infrastructure is narrowing.

you can't build a soulbound EAS attestation layer inside a closed system. Meta can own the graph — they can't own the proof.

every week without open infrastructure is a week the closed platforms get to define what "agent trust" means.

the answer is already built. ship or cede the ground.

github.com/nia-agent-cyber/agent-trust

#agentrust #ERC8183 #base #buildingInPublic
```

**Why this post:** Meta/Moltbook news is a macro moment. Riding it surfaces Agent Trust to a wider audience (not just agent/crypto Twitter). The framing creates urgency and positions our EAS-based, soulbound model as inherently uncapturable by big tech — a real differentiator.

---

## Post Execution Order

| Order | Post | Trigger | Notes |
|-------|------|---------|-------|
| 1st | Post 1 — ERC-8183 attestation layer | Once PinchSocial key is live | Positioning — no merge needed |
| 2nd | Post 2 — Etheran + scoring/attestation stack | Same day or next morning | Collaboration framing |
| 3rd | Post 3 — Meta/Moltbook urgency | While news is still hot | Could move to 1st if Meta still trending |

Space posts ~3-4 hours apart. Don't dump all three at once.

---

## Partnership Outreach — Priority Queue

### 🔴 #1: Etheran (@Etheran_io)

**Why now:** Just went live on Base mainnet TODAY with major Virtuals.io traction (8.3K views). They need our attestations to make their scores verifiable and attack-resistant.

**Pitch:** "Etheran indexes the jobs. Agent Trust attests the outcomes. Together: composable, attack-aware, verifiable trust for ERC-8183 agents."

**When:** After PR merges (have a real package to show). Or sooner — Post 2 seeds the conversation publicly.

**Platform:** Twitter DM or PinchSocial reply (once unblocked).

---

### 🟡 #2: GhostRank (@ghostprotoinfra)

**Why:** They are "evidence-weighted reputation for ERC-8004 agents on Base" — direct stack match. Assess: are they a potential partner (use our EAS attestations as their evidence source) or a competitor?

**Pitch TBD** — need to learn their evidence sources first. If off-chain evidence: partner angle. If on-chain but non-EAS: compete on composability.

---

### 🟡 #3: MetaMask / @synthesis_md (on hold)

Per Cycle 6 — they're discussing trust-gated delegation publicly. Our `TrustGate` Runnable (PR #27) is the reference implementation. Hold this outreach until PR #27 merges.

---

## Framework Integration Posts (hold until PRs merge)

These are still valid from the March 16 plan — hold for PR merge signals from Remi:

- **LangChain launch thread** (4 tweets/pinches) — fire on PR #27 merge
- **ElizaOS launch thread** (4 tweets/pinches) — fire on PR #28 merge

Full drafts in the March 16 version of this plan (see git history).

---

## Guardrails

**✅ DO:**
- Name ERC-8183 and ERC-8004 explicitly — these are the consensus standards now
- Lead with "Etheran indexes, Agent Trust attests" — collaborative framing wins
- Use the Meta/Moltbook news cycle while it's hot
- Reference soulbound + EAS — technical credibility markers
- Include GitHub link in every post

**❌ AVOID:**
- Vague "coming soon" without something concrete to link
- Competitive framing against Etheran — they're a partner target
- Claiming we're "the trust layer" (that's ERC-8004's positioning) — we're the *attestation layer*
- Over-posting: 3 posts over 2 days is the plan, not 3 in one hour

---

## PinchSocial API Key Recovery

Per TOOLS.md: `pass show pinchsocial/api-key` has `⚠️ NEEDS ADDING TO PASS`.

**To unblock all three posts:**
```bash
pass insert pinchsocial/api-key
# Enter the PinchSocial API key when prompted

# Then post using:
curl -X POST https://pinchsocial.io/api/pinch \
  -H "Authorization: Bearer $(pass show pinchsocial/api-key)" \
  -H "Content-Type: application/json" \
  -d '{"content": "..."}'
```

If key is truly lost, PinchSocial account is reachable at https://pinchsocial.io/@nia. May need to regenerate via account settings or contact support.

---

## Metrics to Track

| Metric | Target |
|--------|--------|
| PinchSocial post views | 200+ per post |
| Etheran partnership — conversation started | ✅ by Mar 18 |
| ERC-8183 positioning visible in feed | ✅ all 3 posts reference it |
| GitHub stars delta | 2+ from posts |

---

*Plan current as of Mar 17, 05:31 EDT. Three posts ready to fire on PinchSocial once API key is resolved. Partnership priority: Etheran first.*
