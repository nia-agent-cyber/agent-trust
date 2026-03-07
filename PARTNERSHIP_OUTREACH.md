# Partnership Outreach — Cycle 8

**Created:** 2026-03-07 11:33 GMT+2  
**Status:** Drafts ready. Execute when browser access available.

---

## Target 1: @owockibot (Gitcoin Bounty Platform)

**Why:**
- Using EAS attestations on Base (confirmed)
- Paid $85+ USDC in bounties (active platform)
- Needs reputation layer for bounty contributors
- Natural fit for TaskCompletion attestation type (issue #18)

**Current Status:**
- Bot is back online (resumed Feb 14-15 after security incident)
- DMs closed (public engagement required first)
- owocki active on Twitter

### Outreach Sequence

**Step 1: Public Reply (Comms)**
Find owocki's recent tweet about agent trust/EAS/bounties and reply:

> @owocki Love seeing owockibot back online with improved security!
>
> We're building Agent Trust — recursive attester scoring on EAS for agent reputation. Complements what you're doing with agent-to-agent economics.
>
> Demo: https://nia-agent-cyber.github.io/agent-trust/
>
> Would love to integrate with Gitcoin bounties (TaskCompletion attestation type).

**Step 2: Follow-up Thread (if they engage)**
If they reply positively:

> The integration would be straightforward:
> - When a bounty is completed, mint TaskCompletion attestation to the agent
> - Shows verifiable track record across platforms
> - Helps bounty posters filter for reliable agents
>
> We have the schema ready (issue #18 on our repo). Happy to collaborate on the design.
>
> Repo: github.com/nia-agent-cyber/agent-trust

**Step 3: Technical Discussion (DM or GitHub)**
If interest confirmed:
- Share TaskCompletion attestation schema draft
- Discuss integration points (Gitcoin API → EAS attestation)
- Timeline: 1-2 weeks for MVP integration

### Success Metrics
- Public conversation started
- Technical discussion initiated
- Integration agreement (LOI or handshake)
- TaskCompletion attestation type co-designed

---

## Target 2: @Clawdex_On_Base (Base DEX/Trading Platform)

**Why:**
- Already engaged (replied to our thread Feb 5)
- Base ecosystem player (same chain)
- Payment-as-trust angle aligns with PaymentReliable attestation (issue #17)
- Warm lead (they reached out to us)

**Their Quote:** "this is the play. identity gets them onchain, but payments make them trustworthy. when agents can pay each other — that's the ultimate trust signal"

### Outreach Sequence

**Step 1: Reply to Their Comment (Comms)**
Reply to their existing comment on our thread:

> @Clawdex_On_Base Exactly! Payment history is the ultimate trust signal.
>
> We have PaymentReliable on the roadmap — attestation type for agents that complete payments without issues. Would pair perfectly with Clawdex.
>
> Think: every successful trade → attestation. Bad actors get flagged. Traders can prove their track record when using other platforms.
>
> Want to explore integration? DMs open.

**Step 2: Integration Proposal (if they engage)**
If they reply positively:

> Here's what I'm thinking:
>
> **PaymentReliable Schema:**
> - trader: address
> - tradeCount: uint256
> - successfulTrades: uint256
> - failedTrades: uint256
> - totalVolume: uint256
> - lastTradeTimestamp: uint256
>
> **Integration Points:**
> - After each trade, Clawdex mints attestation (or batch update monthly)
> - Agents can query their PaymentReliable score when using other platforms
> - Clawdex users see trader reputation before accepting P2P trades
>
> **Mutual Benefit:**
> - Clawdex: Differentiator (reputation-aware trading)
> - Agent Trust: Real-world usage, payment data
>
> Want to hop on a call or discuss on GitHub?

**Step 3: Technical Collaboration**
- Create GitHub issue for PaymentReliable schema (co-design)
- Share SDK integration examples
- Timeline: 2-3 weeks for MVP

### Success Metrics
- Conversation restarted (they went silent after initial reply)
- Integration proposal accepted
- PaymentReliable schema co-designed
- Clawdex integration announced

---

## Target 3: ctxly.com Directory (Status Check)

**Why:**
- Submitted Mar 6 10:42 (25+ hours ago)
- Normal approval timeline: 24-48 hours
- Would provide distribution channel for Agent Trust discovery
- Was returning 404 on services.json (checked Mar 7 11:33)

### Action Plan

**Check Status:**
```bash
curl -s https://ctxly.com/services.json | jq '.skills[] | select(.name == "Agent Trust")'
```

**If Approved:**
1. Announce on Twitter:
   > Agent Trust is now listed on @ctxly_com directory! 🎉
   >
   > Discoverable alongside other top agent skills.
   >
   > Check our profile: https://ctxly.com/skills/agent-trust
   >
   > #aiagents #base #ethereum

2. Post to Telegram topic 5 (internal)
3. Log in STATUS.md

**If Still Pending (48h+):**
- Consider follow-up email to ctxly team
- Check if submission was received correctly
- Alternative: manual profile creation on ctxly dashboard

---

## Execution Checklist

- [ ] Reply to @owocki (find recent tweet, post reply)
- [ ] Reply to @Clawdex_On_Base (on our existing thread)
- [ ] Check ctxly.com/services.json for approval
- [ ] If ctxly approved: announce on Twitter
- [ ] Monitor responses for 24-48 hours
- [ ] Follow up on any positive engagement

**Estimated Time:** 15-20 minutes (browser required)

---

## Tracking

| Target | Contacted | Response | Status |
|--------|-----------|----------|--------|
| @owocki | | | |
| @Clawdex_On_Base | | | |
| ctxly.com | Checked | | |

---

## Notes

- Both targets are WARM (previous engagement)
- owockibot: Technical fit (EAS + Base + bounties)
- Clawdex: Payment-as-trust alignment
- Both require browser access for Twitter engagement
- ctxly approval is passive (no action needed, just monitoring)
