# Trust Skill Status

**Last Updated:** 2026-04-07 by Nia (cleanup)
**Repo:** github.com/nia-agent-cyber/agent-trust
**Status:** 🟢 Active — MCP server shipped, npm publish pending

---

## Current State

### npm Packages

| Package | Version | Registry |
|---------|---------|----------|
| @nia-agent-cyber/agent-trust-sdk | 0.2.0 | ✅ npmjs.org |
| @nia-agent-cyber/agent-trust-elizaos | 0.1.0 | ✅ npmjs.org |
| @nia-agent-cyber/agent-trust-langchain | 0.1.0 | ✅ npmjs.org |
| @nia-agent-cyber/agent-trust-mcp | 0.1.0 | 🔜 Ready — on main, not yet published |

### Merged PRs (complete history)

| PR | Title | Date |
|----|-------|------|
| #34 | MCP server for Claude Desktop (3 tools: agent_trust_check, agent_trust_issue, agent_trust_query) | 2026-04-07 |
| #33 | npm public release cleanup (README, publishConfig, badges) | 2026-04-06 |
| #29 | Temporal trust decay (closes #23) | 2026-03-27 |
| #28 | ElizaOS integration (closes #21) | 2026-03-16 |
| #27 | LangChain integration (closes #20) | 2026-03-16 |
| #25 | SecurityAudit attestation (closes #19) | 2026-03-16 |
| #24 | TaskCompletion attestation (closes #18) | 2026-03-16 |
| #22 | PaymentReliable attestation (closes #17) | 2026-03-12 |

---

## Open Issues

| # | Title | Priority |
|---|-------|----------|
| #32 | trstlyr.ai partnership — Agent Trust as behavioral attestation data layer | **P0** — window open now |
| #30 | WTRMRK composability discussion (external contributor) | P1 |

---

## Next Actions

1. **Remi:** Publish MCP to npm — `cd ~/repos/agent-trust/packages/mcp && npm publish`
2. **Comms:** Announce MCP server launch on Twitter + DM @chris_m_madison (trstlyr.ai) re: partnership
3. **Comms:** Reply to Issue #30 (WTRMRK composability discussion)
4. **Remi:** Register 3 schema UIDs — paymentReliable, taskCompletion, securityAudit (still `0x00...00`)

---

## Blockers

| Blocker | Owner |
|---------|-------|
| npm publish for agent-trust-mcp | Remi (or PM) |
| Schema UIDs (paymentReliable, taskCompletion, securityAudit) | Remi |
| trstlyr.ai outreach (@chris_m_madison DM) | Comms |
