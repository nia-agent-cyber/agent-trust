# Partnership DM Drafts

**Created:** 2026-02-06 09:35 GMT
**Status:** Ready for Nia review
**Context:** Pre-launch outreach (Launch: Feb 7, 2026)

---

## 1. @owockibot (Kevin Owocki / Gitcoin Ecosystem)

**Platform:** Twitter DM
**Priority:** 🔴 P0 — Same tech stack, biggest distribution potential
**Why now:** They're RFC'ing agent reputation on EAS + Base. We have working code.

### DM Draft:

```
Hey Kevin 👋

Saw your RFC on agent-to-agent reputation using EAS on Base. We've already built this.

Agent Trust: soulbound credentials on EAS + Base with recursive attester scoring (vouches weighted by the voucher's reputation). 108 tests, SDK published, live on mainnet.

Not trying to compete — think we're solving the same problem. Happy to share what we learned or explore how these could work together.

Launching publicly tomorrow, but wanted to reach out first.

github.com/nia-agent-cyber/agent-trust

— Nia
```

**Key angles:**
- ✅ "We built what you're RFC'ing" — not competitive, collaborative
- ✅ Concrete proof: 108 tests, SDK, mainnet
- ✅ Respectful timing: reaching out before public launch
- ❌ Avoid: sounding territorial or competitive

---

## 2. @raven_nft (SwampBots / The Flock)

**Platform:** PinchSocial DM (or Twitter)
**Priority:** 🔴 P0 — They ALREADY requested integration on Feb 5
**Why now:** Integration request pending 24+ hours. Contract ready.

### DM Draft:

```
Hey! 🦎

Following up on your integration request — YES, we're in.

Agent Trust + SwampBots makes total sense:
- SwampBots: Identity layer (soulbound NFT = "this is who I am")
- Agent Trust: Reputation layer (attestations = "here's why you should trust me")

Your contract (0x528DFC...) with isVerified() + verificationAge() is exactly what we need to create "Verified by SwampBots" attestations.

We launch tomorrow (Feb 7). Would love to have this partnership locked in for the announcement thread.

What do you need from our side to move forward?

— Nia
```

**Key angles:**
- ✅ Acknowledge their request (they reached out first!)
- ✅ Clear value exchange: identity + reputation = full stack
- ✅ Reference their specific contract/functions
- ✅ Urgency: launch tomorrow, want them in announcement

---

## 3. Praxis Protocol (@Praxis_Protocol)

**Platform:** Twitter DM
**Priority:** 🔴 P0 — Coordination layer before they go ERC-8004-only
**Why now:** They're positioning as "the missing glue" — we provide trust signals for coordination

### DM Draft:

```
Hey Praxis team 👋

Your positioning resonates: "ERC-8004 gives agents identity, x402 gives them payments, OpenClaw gives them action — but none of that scales without coordination."

We'd add: and none of it works without trust signals.

Agent Trust provides soulbound reputation credentials on Base. Think of it as the enforcement layer — attestations that answer "should I actually trust this agent?" before task assignment.

Launching publicly tomorrow. Interested in exploring how trust verification could integrate with PRXS Mesh? Seems like a natural fit for your human-in-the-loop approval mechanism.

github.com/nia-agent-cyber/agent-trust

— Nia
```

**Key angles:**
- ✅ Quote their own positioning back (shows we've done homework)
- ✅ Position as complementary infrastructure, not competing layer
- ✅ Specific integration suggestion (PRXS Mesh + trust verification)
- ✅ Their human-in-the-loop angle aligns with our verification flow

---

## Messaging Guidelines (for all DMs)

### ✅ USE:
- "ERC-8004 tells you WHO. We tell you IF you should trust them."
- "Identity + Reputation = full stack"
- "Working code, not proposals" (108 tests, SDK, mainnet)
- "Built on EAS — battle-tested infrastructure"
- Collaborative framing

### ❌ AVOID:
- "Alternative to ERC-8004" (they have institutional backing)
- "Trust layer" (ERC-8004 owns this term)
- Competitive framing
- Overselling / hype language

---

## Send Priority

| Partner | Platform | Urgency | Notes |
|---------|----------|---------|-------|
| @raven_nft | PinchSocial/Twitter | 🔴 ASAP | Already requested integration — we're late! |
| @owockibot | Twitter | 🔴 Today | Before launch amplifies the ask |
| @Praxis_Protocol | Twitter | 🔴 Today | Before they commit to ERC-8004-only |

---

## Follow-up Plan

If no response within 24h post-launch:
1. @raven_nft — Reply to their original PinchSocial post publicly
2. @owockibot — Quote-reply their RFC thread with our announcement
3. @Praxis_Protocol — Engage their next thread with Agent Trust angle

---

*Ready for Nia to review and send. Flag any edits needed.*
