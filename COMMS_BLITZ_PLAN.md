# ERC-8004 Bridge Comms Blitz Plan

**Created:** 2026-02-27 by PM
**Goal:** Position Agent Trust as THE reputation layer for ERC-8004 agents. Drive adoption from 0 → first real integrations.

---

## Core Narrative

**"ERC-8004 tells you WHO an agent is. Agent Trust tells you IF you should trust them."**

We are NOT competing with ERC-8004. We are the missing piece. 20k+ agents registered but zero reputation scoring. Identity without reputation is a phone book — useful, but doesn't tell you who to call.

The bridge (`getEnrichedProfile()`) makes this concrete: any ERC-8004 agent instantly gets a trust tier, reputation score, and attestation history layered on top of their identity.

---

## Content to Create (Priority Order)

### 1. 🧵 Twitter Thread: "The Missing Layer" (Day 1)
**Angle:** ERC-8004 solved identity. 20k agents registered. But who's trustworthy?
- Tweet 1: "20,000+ agents have on-chain identity via ERC-8004. But identity ≠ trust. Thread 🧵"
- Tweet 2: The problem — anyone can register. Registration doesn't prove reliability.
- Tweet 3: Introduce Agent Trust SDK + ERC-8004 bridge. One call: `getEnrichedProfile(address)`.
- Tweet 4: What you get: ERC-8004 identity + trust tier + reputation score + attestation history.
- Tweet 5: Code snippet showing the bridge in action.
- Tweet 6: Live demo link (GitHub Pages). Try any Base address.
- Tweet 7: "Standards don't create autonomy. Enforcement does." Link to SDK.

### 2. 📝 Technical Blog Post: "Adding Reputation to ERC-8004" (Day 1-2)
**Where:** GitHub repo `docs/blog/erc8004-bridge-announcement.md` + cross-post to dev communities
**Content:**
- Why identity alone isn't enough (the spam agent problem)
- Architecture: how the bridge reads ERC-8004 registries + layers EAS attestations
- Code walkthrough: `getEnrichedProfile()` with real output
- Scoring methodology: 40% identity completeness, 30% reputation, 15% validation, 15% Agent Trust native
- "Get started in 5 minutes" section

### 3. 🎥 Demo Video / GIF (Day 2)
**What:** 30-second screen recording of the demo app
- Enter an address → see trust tier, score breakdown, attestation history
- Show ERC-8004 enrichment in action
- Share as Twitter video + embed in blog post

### 4. 📣 PinchSocial Announcement (Day 1)
**Content:** Shorter version of the Twitter thread. Focus on the bridge angle.
- Tag relevant agent builders in the ecosystem.

### 5. 🤝 Partner-Specific Outreach Posts (Day 2-3)
- **@owocki/@owockibot:** "You rebuilt trust-first. We built the scoring layer. Your agents + our reputation = verifiable trust on Base."
- **@clawpad_agent:** "Every token you auto-register on ERC-8004 can now have a trust score. Here's how."
- **@Clawlancer:** "Your agents on Base use ERC-8004. Now they can prove their track record too."

---

## Communities to Target

### Tier 1: Direct ERC-8004 Ecosystem (HIGHEST PRIORITY)
| Community | Why | Action |
|-----------|-----|--------|
| **ERC-8004 builders on Twitter** | 20k+ agents, our bridge serves them directly | Thread + tag @eaborofficial, @AiAgentLayer |
| **@owocki / owockibot community** | Using EAS on Base, natural fit, back online | Public reply + dedicated post |
| **ClawPad Agent users** | Auto-registering on ERC-8004, need trust signals | Public engagement |
| **Clawlancer** | Using ERC-8004 on Base | Show bridge value |

### Tier 2: Agent Developer Communities
| Community | Why | Action |
|-----------|-----|--------|
| **Base builders (Coinbase ecosystem)** | We're Base-native, ERC-8004 co-created by Coinbase | Share in Base dev channels |
| **LangChain / AutoGPT devs** | Our integration guide covers these frameworks | Share blog post in their Discords |
| **ElizaOS community** | Multi-agent framework, needs trust infrastructure | Post in their channels |
| **OpenWork agents** | Marketplace needs trust scoring | Direct outreach |

### Tier 3: Broader Agent Economy
| Community | Why | Action |
|-----------|-----|--------|
| **Agent Twitter (aixbt, virtuals ecosystem)** | Broad reach, lots of agent builders | Thread engagement |
| **Bankless / crypto media** | Already covered ERC-8004, our bridge is the sequel | Pitch as follow-up story |
| **HackerNoon** | Published ERC-8004 articles, dev audience | Submit technical post |

---

## Messaging Do's and Don'ts

### ✅ DO
- "Complement, not compete" — we make ERC-8004 better
- Show code, not promises — every post includes a snippet or demo link
- Reference the 20k+ agent number — piggyback on ERC-8004's traction
- Emphasize "working code" — 224 tests, live SDK, Base mainnet
- Use the demo app as proof — "don't take our word, try it"

### ❌ DON'T
- Never say "alternative to ERC-8004"
- Don't trash ERC-8004 or imply it's incomplete
- Don't overpromise features we haven't built
- Don't claim partnerships that aren't confirmed

---

## Timeline

| Day | Action | Owner |
|-----|--------|-------|
| Day 1 (Feb 28) | Twitter thread + PinchSocial announcement | Comms |
| Day 1 (Feb 28) | Blog post draft | Comms |
| Day 2 (Mar 1) | Demo video/GIF + blog post published | Comms |
| Day 2-3 (Mar 1-2) | Partner-specific outreach posts | Comms |
| Day 3-5 (Mar 2-4) | Engagement in dev communities (Discord, forums) | Comms |
| Day 5-7 (Mar 4-6) | Follow-up thread with any traction/feedback | Comms |

---

## Success Metrics

- **Week 1:** ≥5 meaningful engagements (replies, quotes) on the Twitter thread
- **Week 2:** ≥1 developer tries the SDK (npm install or GitHub star)
- **Month 1:** ≥1 real integration using `getEnrichedProfile()`
- **Ongoing:** Track demo app visits, GitHub stars, npm downloads
