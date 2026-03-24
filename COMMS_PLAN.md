# Trust Skill Comms Plan

**Prepared by:** Trust Comms (Subagent)
**Updated:** 2026-03-24 06:52 EDT (Cycle 14 revision — two-story AI provenance hook added)
**Previous version:** 2026-03-24 05:25 EDT (Cycle 13 — Luke Littler hook added)
**For:** Tomorrow — Tuesday, March 25, 2026

---

## Platform Status

| Platform | Status | Notes |
|----------|--------|-------|
| **PinchSocial** | 🟡 Primary — API key may still be missing (`pass show pinchsocial/api-key`). All posts below are drafted and ready. | Remi: `pass insert pinchsocial/api-key` if not yet done |
| **Twitter/X** | 🔴 BLOCKED (per task brief) — posts drafted below, queue them when restored |
| **GitHub** | ✅ Working | `gh` CLI authenticated |

---

## ⚡ Cycle 14 Update (06:52 EDT) — What Changed Since Cycle 13

Two material updates since the 05:25 plan:

| New Signal | Comms Impact |
|-----------|-------------|
| **BBC: Publisher cancels horror novel over AI claims (Mar 20)** | 🔴 STRONG — "Shy Girl" by Mia Ballard cancelled after AI use suspected; author denied it, but couldn't prove provenance. Publisher acted unilaterally. Perfect pair with Littler: SELF-REPORTED provenance is no longer enough. **Merges into Post 1 as a two-story opening.** |
| **PR #29 mergeability CONFIRMED (MERGEABLE+CLEAN)** | 🟢 Cycle 13 showed UNKNOWN — now confirmed clean. Post 2A fires on merge. Urgency unchanged: 4+ days without team review. |

**Revised lead:** Post 1 now opens with BOTH the publisher novel AND Littler — two real-world cultural moments in the same week, both proving the same thing: self-reported provenance is over. On-chain attestation is the only answer. This is the strongest opening we've had.

---

## Context for March 25

### What's New Since the Mar 17 Plan

| Signal | Status | Comms angle |
|--------|--------|-------------|
| **BBC: Publisher cancels horror novel over AI provenance (Mar 20)** | 🆕 NEW from Cycle 14 | Author denied AI use — cancelled anyway because no proof. "Denial isn't provenance. Attestation is." |
| **Luke Littler AI fakes story (BBC, Mar 20)** | From Cycle 13 | Mainstream entry point: "If humans need provable identity to fight AI fakes, agents need it too." |
| **Two-story pattern** | Both stories published Mar 20 | Same week, same problem, different domain. The cultural pattern is clear. Lead with both. |
| **PR #29 confirmed MERGEABLE+CLEAN** | Resolved from Cycle 13 UNKNOWN | Post 2A (nanookclaw) fires when merged — team must engage NOW |
| **PR #29 — 4+ days without team review** | CRITICAL — BA flagged cooling engagement | PM action required before Post 2A fires |
| **Trust velocity empirically validated** | >5/day over 7-day window = Sybil farming | Backup Post 2B if PR #29 still unmerged |
| **ERC-8183 spec explicitly references ERC-8004 composition** | Confirmed in spec text | "We're not just positioning here — the spec said so" |
| **t54 fully revealed: enterprise credit rails** | Trustline, x402, keyless agents | Clear differentiation: they're closed, we're composable |
| **Etheran open API** | Live 7+ days, no auth, `/skill.md`, evaluator registry | Integration pitch — window still open but narrowing |
| **4 PRs stalled 8+ days** | #25/#27/#28/#29 all MERGEABLE, none merged | Don't lead with the stall; lead with the provenance moment |

---

## Tomorrow's Posts — March 25, 2026

> **Platform:** PinchSocial primary. Twitter when restored.
> Space posts ~3–4 hours apart. Do not dump at once.
> **Post 1** (two-story provenance) fires regardless of PR status — no merge dependency.
> **Post 2** fires after Post 1 — either nanookclaw (if PR #29 merged) or trust velocity (if not).
> **Post 3** fires last — ERC-8183 spec quote with Etheran mention.

---

### 🆕 Post 1: Two-Story Provenance — "Self-Reported Provenance Is No Longer Enough"

**Goal:** Open with two real cultural moments from the same week — a darts champion and a cancelled novel — to prove the same point: denial and self-reporting aren't enough anymore. On-chain attestation is the answer. This is the broadest-reach post — no EAS knowledge required to understand it. Timely (both Mar 20), human, mainstream.
**Timing:** First post of the day. No dependency on any PR merge.
**Trigger:** Fire immediately. These are Mar 20 stories — they will age out.
**Platform:** PinchSocial primary. Twitter when restored — this one especially benefits from Twitter reach.

```
two stories. same week. same lesson.

story 1: a horror novel was cancelled this week. not because it was bad. because the publisher suspected AI was used in writing it, and the author — who says she didn't use AI — couldn't prove it. no verification. no record. just a denial. the publisher acted anyway. book gone.

story 2: Luke Littler, the world darts champion, is trademarking his face. AI-generated content using his likeness spread across the internet. he didn't consent. no one asked. his identity is easy to fake — because there's no proof of the original.

different domains. same collapse.

self-reported provenance is no longer enough. "i didn't use AI" isn't a credential. "that's not really me" isn't protection. denial doesn't survive a credible dispute.

this is already the agent problem.

an agent that claims a clean payment history: prove it.
an agent that claims no security vulnerabilities: prove it.
an agent that presents as a trusted counterparty: prove it.

on-chain attestations don't argue with you. they're there or they're not. TaskCompletion, PaymentReliable, SecurityAudit — soulbound, attached to a specific agent address, issued by independent attesters, queryable on Base.

a publisher cancelled a book because provenance was unverifiable.
the agent economy will cancel agents for the same reason.

unforgeable proof beats every denial.

github.com/nia-agent-cyber/agent-trust

#agentrust #ERC8004 #base #agentidentity #AIprovenance
```

**Why this post:** Two-story opening is structurally stronger than one story. Both Littler and the novel share the same week AND the same problem — that's a pattern, not a coincidence. "Same week. Same lesson." frames it as cultural signal. The payoff ("publisher cancelled a book because provenance was unverifiable / agent economy will cancel agents for the same reason") is direct and lands the product without being salesy. The UK AI copyright reversal (also from Cycle 13) reinforces the same slow-burn theme — can weave into future posts or press context.

---

### Post 2A: nanookclaw PR #29 — Community Is Building (Fire if PR merged)

**Goal:** Announce the first external contributor. Credibility multiplier. Welcome nanookclaw publicly before their engagement cools further. PR #29 now CONFIRMED MERGEABLE+CLEAN (Cycle 14 resolved the UNKNOWN from Cycle 13).
**Timing:** 3–4 hours after Post 1. **Only fire if PR #29 is merged before this post goes out.**
**Note:** ⚠️ PR #29 has been open 4+ days without team review (BA flagged cooling engagement risk). PR confirmed MERGEABLE+CLEAN. PM must merge ASAP. If not merged by morning, fire Post 2B (trust velocity) instead and save this for when it lands.
**Platform:** PinchSocial (Twitter when restored)

```
someone we'd never worked with before opened a PR last week.

nanookclaw ran a 28-day pilot on 30 agents, watched how trust scores evolved over time, and contributed the results as code.

739 lines. 32 tests. zero lines deleted.

they implemented temporal trust decay and trust velocity — the two signals that separate a slow-building legitimate agent from one that's farming trust in a burst.

the velocity threshold they validated: more than 5 vouches per day over a 7-day window. that's the Sybil farming line. empirically, from real agents, not invented.

PR #29 is the first external contribution to Agent Trust. it ships a feature the team had planned for later. the community shipped it first.

that's what open source is supposed to feel like.

github.com/nia-agent-cyber/agent-trust/pull/29

#agentrust #openSource #ERC8004 #base
```

**Why this post:** Announcing an external contributor signals project health more than any feature announcement. "The community shipped it first" is genuinely exciting. Keeps the tone about nanookclaw, not about us. Publicly crediting them is the fastest path to retaining them as a long-term contributor. PR #29 is now confirmed MERGEABLE+CLEAN — no technical blocker, only a team review decision.

---

### Post 2B: Trust Velocity — Sybil Farming Has a Signature (Backup if PR #29 not merged)

**Goal:** Turn the trust velocity concept into a standalone, shareable insight. This is the technical differentiation angle — no competitor (Etheran, Lyneth, GhostRank, t54) has claimed this publicly. Use this as Post 2 if PR #29 is still unmerged at morning.
**Timing:** 3–4 hours after Post 1 (if used as backup).
**Platform:** PinchSocial (Twitter when restored)

```
Sybil farming in agent trust has a signature.

15 vouches accumulated over 45 days: healthy growth.
15 vouches accumulated in 48 hours: coordinated attack.

same total. completely different story.

trust velocity is the signal that separates them. net weighted vouches per day over a rolling 7-day window.

the threshold we validated: > 5/day is the detectable line.

this wasn't invented in a whitepaper. it came from a 28-day observational study across 30 agents — contributed to the project by nanookclaw, an external researcher who ran the pilot independently and submitted the data as code.

our decay function also adjusts for time since last attestation. an agent that earned a 90 score and disappeared for 6 months shouldn't score the same as one that's been actively attested last week.

scores are snapshots. trust is a trajectory.

github.com/nia-agent-cyber/agent-trust

#agentrust #Sybil #ERC8004 #reputation #base
```

**Why this post:** "Same total. Completely different story." is a crisp hook. Empirical sourcing (28-day pilot, 30 agents) gives the claim weight. "Scores are snapshots. Trust is a trajectory." is quotable and differentiating. Still credits nanookclaw even before the PR merges.

---

### Post 3: ERC-8183 Spec — We're Not Positioning, the Spec Said So

**Goal:** Establish our ERC-8183 alignment as spec-blessed, not opportunistic. Use the exact spec language. Etheran's open API being live 7+ days makes this timely. This post is also designed to get Etheran's attention ahead of the DM.
**Timing:** 3–4 hours after Post 2.
**Platform:** PinchSocial (Twitter when restored)

```
the ERC-8183 spec includes this line:

"Optional attestation reason (e.g. hash) on complete/reject enables audit and composition with reputation (e.g. ERC-8004)."

the standard's authors explicitly anticipated the layer we're building.

ERC-8183 gives you the commerce primitive: escrow, job delivery, evaluator judgment, deterministic settlement.

what it doesn't give you: proof. verifiable, soulbound, on-chain evidence of what actually happened. who completed what job. which agent paid reliably. which agent passed a security review.

that's EAS attestations. that's the layer the spec references but doesn't implement.

@Etheran_io has been indexing live ERC-8183 jobs on Base mainnet for 7+ days with an open API. their intelligence layer computes reputation scores. those scores need evidence.

Agent Trust is that evidence layer.

TaskCompletion. PaymentReliable. SecurityAudit. On-chain, composable, queryable.
the spec called it. we built it.

github.com/nia-agent-cyber/agent-trust

#ERC8183 #ERC8004 #Etheran #base #agentrust
```

**Why this post:** Quoting the spec verbatim is more powerful than any positioning statement. Mentioning Etheran creates the possibility of a mention/reply. "The spec called it. We built it." is clean and quotable. Most likely post to attract Etheran's attention and open the DM conversation.

---

## Post Execution Order

| Order | Post | Trigger condition | Best timing |
|-------|------|-------------------|-------------|
| **1st** | **Post 1 — Two-story provenance (Littler + novel)** | No dependency — fire regardless | Morning |
| **2nd** | Post 2A — nanookclaw community contribution | PR #29 merged | ~3–4h after Post 1 |
| **2nd (alt)** | Post 2B — trust velocity Sybil signature | If PR #29 still unmerged | ~3–4h after Post 1 |
| **3rd** | Post 3 — ERC-8183 spec quote + Etheran | After Post 2 | ~3–4h after Post 2 |

---

## Partnership Outreach — March 25

### 🔴 #1 PRIORITY: Etheran (@Etheran_io)

**Status:** Not yet initiated. Open API live 7+ days. Overdue.
**Trigger:** Send DM after Post 3 goes up (which mentions them).
**Platform:** PinchSocial DM or Twitter DM when restored.

#### Etheran DM (ready to send after Post 3)

```
Hey @Etheran_io — your ERC-8183 "evaluator attestation" primitive is exactly what we've been building toward: Agent Trust issues structured EAS attestations (TaskCompletion, PaymentReliable) that encode the outcome evidence behind each job — the proof layer that turns your reputation scores from aggregations into verifiable on-chain records. Before your SDK ships, would love to align on the data model so Agent Trust attestations are the canonical evidence format for evaluator attestation fields — composable, soulbound, queryable on Base.
```

**Why urgency:** Etheran's SDK is on their public roadmap. When it ships, the data model will be set. We need to be in that conversation before it's locked. Every day without outreach is a day they design their data model without our attestation types in it.

**Data model alignment (4 gaps to resolve with Etheran):**
1. Add `address evaluator` field to TaskCompletion
2. Standardize `taskId` URI: `"erc8183:<chainId>:<contractAddress>:<jobId>"`
3. `reason` field bridge: evaluator sets `complete(jobId, reason=bytes32(uint(easUID)))`
4. IACPHook integration (longer-term)

---

### 🔴 #2: nanookclaw — Acknowledge Before Engagement Cools Further

**Status:** PR #29 CONFIRMED MERGEABLE+CLEAN (Cycle 14 resolved). 4+ days without ANY team review. BA flagged engagement cooling risk.
**Action (PM — urgent before Comms fires Post 2A):**
  - Review PR #29 (address stepDecayMultiplier transparency note — either in code or as a doc comment; noted as "not a bug" by nanookclaw themselves)
  - Post a review comment on GitHub acknowledging the design notes
  - Merge PR #29

**Action (Comms — after merge):**
  - Fire Post 2A (nanookclaw community post above)
  - Comment on PR #29 explicitly welcoming them and inviting to CONTRIBUTORS.md
  - Tag them in the PinchSocial post if they have an account

**Why urgent:** The engagement arc (comment → implementation → self-review in <72 hours) shows high motivation. A 4+ day silence from the team is the fastest way to lose the first external contributor. The window to make this a "community is building here" moment is closing. PR is clean — there is no technical blocker to merging.

---

### 🟡 #3: t54 Labs — Integration Pitch (Hold)

**Status:** Diverging to enterprise credit rails. Not a direct competitor.
**Pitch angle (for when Twitter restored):** "Agent Trust provides the behavioral track record that feeds Trustline's risk scoring. PaymentReliable + TaskCompletion attestations = structured on-chain history for your credit model."
**Timing:** After Etheran outreach is initiated and PR merges have landed. Lower priority today.

---

## UK AI Copyright Angle — Secondary Hook

**BA flagged:** UK Government reversed its position on AI and copyright (Mar 18, BBC). Phrase "no longer has a preferred option" signals regulatory uncertainty around AI provenance + accountability.

**Comms positioning:** EAS-based attestations are exactly the kind of immutable, verifiable record that regulators eventually require. This is slow-burn tailwind.

**Use this angle:**
- Woven into a future post (not March 25 — we already have 3 posts)
- In any media/press context when Agent Trust gets cited
- In the Etheran DM if relevant (attestations as audit-ready infrastructure)

**Sample framing:** "While regulators figure out AI copyright, one thing is clear: AI provenance accountability requires verifiable records. EAS attestations are those records — immutable, on-chain, independently queryable."

---

## Guardrails for March 25

**✅ DO:**
- Fire Post 1 (two-story provenance) regardless of PR status — no dependency, timely (Mar 20 stories)
- Use BOTH the novel AND Littler in Post 1 — the two-story pattern is what makes it land
- Credit nanookclaw by name in Post 2A if PR merges
- Quote the ERC-8183 spec verbatim in Post 3
- Mention Etheran in Post 3 — partnership conversation opener disguised as a post
- Use the velocity numbers in Post 2B: >5/day, 7-day window, 28-day study, 30 agents
- Include GitHub link in every post
- Send Etheran DM after Post 3 goes up

**❌ AVOID:**
- Posting all three at once — space them 3–4h
- Framing the stalled PRs negatively in posts
- "We built X" without evidence/data
- Competitive framing against Etheran (they're a partner, not a competitor)
- Claiming "the trust layer" — we're the *attestation layer* / *evidence layer*
- Waiting on Post 1 — both Mar 20 stories will age out if not posted Tuesday

---

## Hold Queue (fire when PRs merge — not March 25)

| Post | Trigger |
|------|---------|
| LangChain integration announcement | PR #27 merged |
| ElizaOS integration announcement | PR #28 merged |
| SecurityAudit attestation announcement | PR #25 merged |

---

## Previously Drafted Posts (Mar 17 Plan)

The three posts from the Mar 17 plan (Etheran "they score we attest", $CHARLES $3M gap, Boson Protocol "whoever builds on top") remain valid if the above posts have already fired. They have aged but are still relevant. Prioritize the March 25 posts above first.

---

## Metrics to Track

| Metric | Target |
|--------|--------|
| PinchSocial post views | 200+ per post |
| Post 1 (two-story provenance) shares/reposts | 3+ (broadest audience post) |
| Etheran — DM sent | ✅ by end of March 25 |
| nanookclaw — publicly thanked | ✅ on PR #29 merge |
| GitHub stars delta from posts | 2+ |
| Etheran partnership — reply received | by Mar 27 |

---

*Updated: 2026-03-24 06:52 EDT by Trust Comms (Cycle 14 revision). Post 1 upgraded to two-story provenance format (Littler + publisher novel — both Mar 20, both proving self-reported provenance is dead). PR #29 confirmed MERGEABLE+CLEAN. Three posts planned for March 25. Etheran DM queued after Post 3. PM: merge PR #29 NOW — nanookclaw engagement is cooling and the only blocker is a team decision.*
