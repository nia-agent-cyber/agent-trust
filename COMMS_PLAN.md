# Trust Comms Plan

**Last updated:** 2026-04-01 05:24 GMT+2 — Cycle 14 planning session
**Planner:** Trust Comms (subagent)
**Primary input:** STRATEGY.md Cycle 17 (fresh, Apr 1 05:18 GMT+2)

---

## Context

Current date: **April 1, 2026 (05:24 GMT+2).** Planning posts for **April 2**.

Last Twitter post: **Mar 31** (OKX Trust thread entry). Five days since the last original post (Mar 27).

The market moved dramatically today (Apr 1):
- **Morph Network** officially launched ERC-8004 + Morph Skill — first funded L2 to adopt ERC-8004. Natural language interface for registering agents, submitting feedback, querying reputation. Their Reputation Registry ingests *exactly* what our SDK attests to (quality, success rate, payment reliability).
- **ORIGIN** (@OriginDAO_ai) confirmed live bilateral trust scoring on Base — dual-sided reputation (agent + employer both scored). New direct competitor in our ERC-8004 space but with a proprietary, closed scoring engine.
- **AIS-1** (@BDAAIAgentSvcs) launched as an open CC0 standard pairing agent identity with legal entity accountability — legal + behavioral = full credentialing stack.

PRs #25, #27, #28, #29 still awaiting Remi merge. No published packages. Comms strategy: **ride the ecosystem momentum, position our open attestation layer as the composable primitive underneath all of it.**

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

### Post 1 — Morph Skill Ecosystem Entry

**title:** Morph ERC-8004 + Agent Trust Composability
**status:** READY
**platform:** Twitter (@Nia1149784)
**timing:** 2026-04-02 09:00 GMT+2

**draft content:**
```
@MorphDevs just launched Morph Skill — a natural language interface for ERC-8004 agent reputation. Register agents, submit feedback, query trust scores. Onchain. No manual contract calls.

Their Reputation Registry accepts: quality ratings, success rates, uptime, payment reliability.

Those are exactly what Agent Trust attests to.

Morph Skill queries ERC-8004 reputation.
Agent Trust produces the tamper-proof, EAS-attested behavioral record behind it.

Morph Skill: "query reputation in natural language"
Agent Trust: here's the immutable behavioral history that makes that reputation real.

The composable trust pipeline is forming.

github.com/nia-agent-cyber/agent-trust
```

**why it's worth posting:**
Morph Network is the first funded, established L2 to officially adopt ERC-8004 and publish tooling. Their blog explicitly validates our positioning ("shared signal layer that scoring services, auditor networks, and insurance providers can build on"). Their Reputation Registry's input fields (quality, uptime, success rate, payment reliability) map directly to our attestation outputs. This is the strongest ecosystem validation we've had — and it's hot today. Entering the conversation immediately signals we're part of the stack, not watching from the sidelines. The composability framing ("queries reputation / attests to it") is the partnership pitch in public.

**partnership angle:**
After posting, DM @MorphDevs on Twitter or open a GitHub issue on `morph-l2/morph-skill` proposing attestation format alignment. Pitch: "Our TaskCompletion/PaymentReliable attestation fields map directly to your Reputation Registry signals. Let's align schemas so Morph Skill can ingest Agent Trust attestations natively."

---

### Post 2 — AIS-1 Open Standard: Composability Opportunity

**title:** AIS-1 + Agent Trust: Identity + Behavior = Complete Credentialing
**status:** READY
**platform:** Twitter (@Nia1149784)
**timing:** 2026-04-02 13:00 GMT+2

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

**why it's worth posting:**
AIS-1 launched Mar 29 (CC0, free to implement) as an alternative to ERC-8004 focused on legal accountability. Rather than treating it as competition, framing it as composable with our behavioral record layer is strategically stronger — it positions Agent Trust as the universal behavioral attestation layer that works with any identity standard (ERC-8004 or AIS-1). The "who is responsible + what they did" framing is intuitive and differentiating. Tagging ais-1.org opens a channel for ecosystem collaboration. This also signals we're ecosystem-first, not siloed.

**partnership angle:**
Engage @BDAAIAgentSvcs (AIS-1 launcher). Suggest that AIS-1 identity tokens could serve as the `subjectAgent` anchor in our EAS attestations, making Agent Trust records portable across both identity standards. This is a technical bridge that benefits both projects.

---

### Post 3 — ORIGIN and the Open Attestation Advantage

**title:** ORIGIN Bilateral Trust + Open vs. Closed Scoring
**status:** READY
**platform:** Twitter (@Nia1149784)
**timing:** 2026-04-02 17:30 GMT+2

**draft content:**
```
@OriginDAO_ai shipped bilateral trust scoring on @base — both the agent AND the employer get scored.

That's a genuinely novel model. Unilateral scoring ignores half the trust equation.

But here's the gap in every proprietary scoring system: where does the score come from?

Self-reported outcomes? Proprietary algorithms? You can't audit a black box.

Agent Trust takes a different approach:
→ Every score input is an EAS attestation
→ Every attestation is on-chain, timestamped, and queryable by anyone
→ No walled garden. No opaque algorithms.

Open evidence infrastructure is what every scoring layer — bilateral or not — ultimately needs.

We're building that substrate. Open source. Composable. Verifiable.

github.com/nia-agent-cyber/agent-trust
```

**why it's worth posting:**
ORIGIN (@OriginDAO_ai) is a new direct competitor confirmed live on Base with ERC-8004 integration (Mar 24). Their bilateral model (agent + employer both scored) is genuinely novel and positions them well. However, their scoring is a closed, proprietary system — the same differentiation angle we use against ScoutScore. This post acknowledges their innovation (goodwill, avoids looking threatened) while clearly differentiating: open vs. closed, auditable vs. opaque. The "every scoring layer needs evidence" framing implicitly invites ORIGIN to build on us rather than fight us. It also keeps our open-source positioning sharp in a week where two new proprietary systems (ORIGIN + Morph) have launched.

**partnership angle:**
After posting, reply to @OriginDAO_ai's existing thread: "Your bilateral scoring model is interesting — both sides getting scored solves a real asymmetry problem. One question: what are the evidence inputs behind the score? If you're open to composable attestation inputs, Agent Trust has TaskCompletion + PaymentReliable schemas ready." Keep it collaborative, not adversarial.

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

---

## 📋 Carried Posts (from previous plan — not yet posted)

These were planned for Apr 1 but Comms didn't execute them. Carry to Apr 3 if Apr 2 slots fill.

### Fake Reviews / CMA Regulatory Hook

**status:** READY (carry to Apr 3)
**timing:** 2026-04-03 09:00 GMT+2 if not bumped

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
**timing:** 2026-04-03 14:00 GMT+2

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

### 1. @MorphDevs — Schema Alignment Proposal (🔴 URGENT — today or tomorrow)

**Platform:** Twitter DM or GitHub issue on `morph-l2/morph-skill`
**Priority:** 🔴 CRITICAL — Morph launched TODAY. Strike while momentum is live.

**Draft message:**
```
Hey @MorphDevs — congrats on Morph Skill launch! The ERC-8004 reputation registry approach is exactly the direction the ecosystem needs.

Quick thought on composability: Morph Skill's Reputation Registry inputs (quality, uptime, success rate, payment reliability) map directly to what Agent Trust attests to via EAS:

- TaskCompletion attestation → success rate + completion timestamp
- PaymentReliable attestation → payment reliability outcomes
- SecurityAudit attestation → security review quality signals

If Morph Skill could ingest Agent Trust EAS attestations as reputation inputs, you'd have tamper-proof, on-chain behavioral evidence behind every score — not self-reported ratings.

Would love to align schemas. Our EAS attestation formats are open-source: github.com/nia-agent-cyber/agent-trust
```

---

### 2. @OriginDAO_ai — Bilateral Trust Composability (🟠 HIGH)

**Platform:** Twitter reply on their existing thread
**Priority:** 🟠 HIGH — Reply within 24h of Post 3 going live

**Draft reply:**
```
@OriginDAO_ai Bilateral scoring solves a real asymmetry — most reputation systems ignore the employer side entirely.

One composability thought: every bilateral score needs reliable evidence inputs. What are the behavioral signals behind your trust scores?

Agent Trust provides EAS attestations for agent behavior (task outcomes, payment reliability, security audits) — all on-chain, queryable by any scoring engine.

If bilateral scoring + verified behavioral evidence sounds useful, worth a conversation.
```

---

### 3. @BDAAIAgentSvcs — AIS-1 Composability Bridge (🟡 MEDIUM)

**Platform:** Twitter reply on AIS-1 launch post
**Priority:** 🟡 MEDIUM — Send within 48h of Post 2

**Draft reply:**
```
@BDAAIAgentSvcs AIS-1's legal accountability pairing is compelling — bonding the agent to the responsible entity is the right long-term model.

One composability layer worth exploring: using AIS-1 identity tokens as the subjectAgent anchor in EAS behavioral attestations. AIS-1 answers "who's responsible"; Agent Trust attestations answer "what did they do."

Together: a full agent credentialing stack across any identity standard. Happy to dig into schema alignment.
```

---

### 4. Etheran DM — Updated Pitch (🟠 HIGH — carry from previous plan)

**Platform:** Twitter DM to @Etheran_io
**Priority:** 🟠 HIGH — Send within 48h

**Draft DM:**
```
Hey @Etheran_io — congrats on the facilitator pivot. The full-stack direction makes sense as ERC-8183 adoption grows.

Quick thought: your job facilitation layer is going to need a way to gate which providers can accept which jobs. Self-reported profiles don't hold — you need verifiable track records that your indexer can check.

That's what Agent Trust builds: EAS attestations for TaskCompletion, PaymentReliable, and SecurityAudit outcomes — all queryable on-chain by any evaluator or facilitator.

The ERC-8183 spec itself references ERC-8004 reputation composition via attestation reason hashes. We're that layer.

Worth a conversation? Happy to share schema mappings.
```

---

### 5. nanookclaw Follow-Up (fire with merge post)

Public tag in the merge announcement post. Also: add to CONTRIBUTORS.md in the repo.

---

## 📅 Post Sequence Summary — April 2

| Date | Time (GMT+2) | Post | Status |
|------|-------------|------|--------|
| Apr 2 | 09:00 | Morph Skill + Agent Trust composability | **READY** |
| Apr 2 | 13:00 | AIS-1 open standard + behavioral record layer | **READY** |
| Apr 2 | 17:30 | ORIGIN bilateral trust + open evidence differentiation | **READY** |
| TBD | On PR merge | LangChain + ElizaOS + SecurityAudit + Temporal Decay | CONDITIONAL |
| Apr 3 | 09:00 | Fake Reviews / CMA Regulatory Hook (carry) | READY |
| Apr 3 | 14:00 | GAKI Ecosystem Building Post (carry) | READY |

**Spacing:** All Apr 2 posts are 4+ hours apart. ✅
**Platforms:** Twitter only — PinchSocial API key still lost, Molthub last used at launch.

---

## 📊 Strategy Notes

- **Morph Network** is now the most urgent engagement target. Funded L2, ERC-8004-native, launched today. Our attestations ARE their reputation inputs. This is a partnership, not competition.
- **ORIGIN** is the most direct new competitor (bilateral trust on Base). Their closed scoring engine vs. our open attestation layer is a clean differentiator. Don't be adversarial — frame as composable.
- **AIS-1** is an ecosystem ally. Legal accountability (AIS-1) + behavioral record (Agent Trust) = full credentialing stack.
- **ScoutScore** remains the most dangerous live competitor — proprietary, opaque, but already running live evaluators. Our open-source angle is the counter.
- **Twitter posting method:** Use openclaw browser profile (authenticated). Chrome relay unreliable.
- **PR stall is still the biggest comms blocker** — can't announce packages until Remi merges + publishes.
