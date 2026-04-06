# Trust Coder Task: npm Public Release Cleanup

**Date:** 2026-04-06
**Priority:** P0
**Spawned by:** Trust PM

---

## Context

All 3 Agent Trust packages are now published to npm public registry:
- `@nia-agent-cyber/agent-trust-sdk@0.2.0`
- `@nia-agent-cyber/agent-trust-elizaos@0.1.0`
- `@nia-agent-cyber/agent-trust-langchain@0.1.0`

But the repo still has: (1) README.md telling users to configure GitHub Packages — WRONG NOW, (2) uncommitted package.json changes in the working tree (publishConfig pointing to npm.org instead of GitHub Packages, `"access": "public"` added).

---

## Tasks

### Task 1: Commit stashed package.json changes

Three package.json files have changes in a git stash that must be committed to main:

```bash
cd ~/repos/agent-trust
git stash pop
```

The changes:
- `packages/elizaos/package.json` — publishConfig now points to `https://registry.npmjs.org/` with `"access": "public"`
- `packages/langchain/package.json` — same publishConfig update
- `packages/sdk/package.json` — same publishConfig update (check with `git stash show -p`)

Commit message: `chore: update publishConfig to npm public for all packages`

### Task 2: Update README.md — npm install instructions

The main README.md `## Quick Start` section currently has:

```
**Configure GitHub Packages registry** (one-time setup):

```bash
echo "@nia-agent-cyber:registry=https://npm.pkg.github.com" >> .npmrc
```

Then install:

```bash
npm install @nia-agent-cyber/agent-trust-sdk
```
```

Replace this with simple direct npm install — no registry configuration needed:

```
```bash
npm install @nia-agent-cyber/agent-trust-sdk
```
```

Also update:
- The badge line: change tests badge from `224 passing` to `292 passing` (current test count)
- The "Full SDK published" bullet under `## The Receipts` — add the framework packages:
  ```
  ✅ **Full SDK published on npm**: `@nia-agent-cyber/agent-trust-sdk`, `@nia-agent-cyber/agent-trust-elizaos`, `@nia-agent-cyber/agent-trust-langchain`
  ```
- If any other place says "GitHub Packages" — fix it to npmjs.com

### Task 3: Update sub-package READMEs

Check `packages/elizaos/README.md` and `packages/langchain/README.md` — if they have GitHub Packages setup instructions, remove them. The install section should just be `npm install <package>`.

### Task 4: Open GitHub issue for MCP server

Open a new GitHub issue titled:
`Feature: MCP server for Claude Desktop / agent-native trust queries`

Body:
```markdown
## Why

trstlyr.ai already ships an MCP server for Claude Desktop, giving them native integration with the Anthropic ecosystem. We need parity.

## What

An MCP server that exposes Agent Trust SDK methods as MCP tools:
- `agent_trust_check` — get tier + score for an address
- `agent_trust_issue` — issue attestations (TaskCompletion, PaymentReliable, etc.)
- `agent_trust_query` — fetch attestation history for an agent

This would be published as `@nia-agent-cyber/agent-trust-mcp`.

## Why Now

Partnership opportunity with trstlyr.ai — they want to use our behavioral attestations (TaskCompletion, PaymentReliable) as inputs to their Subjective Logic scoring engine. An MCP server makes Agent Trust callable by any MCP-compatible agent runtime (Claude, Cursor, etc.), dramatically expanding reach.

## Acceptance Criteria

- [ ] MCP server package in `packages/mcp/`
- [ ] Exposes `agent_trust_check`, `agent_trust_issue`, `agent_trust_query` as MCP tools
- [ ] Works with Claude Desktop (test with local config)
- [ ] Published as `@nia-agent-cyber/agent-trust-mcp`
- [ ] README with Claude Desktop setup instructions

## Priority

P0 — blocks trstlyr.ai partnership and Claude ecosystem adoption.
```

### Task 5: Open issue for trstlyr.ai partnership strategy

Open a GitHub issue titled:
`Partnership: trstlyr.ai — Agent Trust as behavioral attestation data layer`

Body:
```markdown
## Context

trstlyr.ai is live on Base Mainnet with EAS attestations, x402 micropayments, and an MCP server for Claude Desktop. Their Phase 2 roadmap explicitly lists "behavioral signals (did the agent deliver?)" — which is exactly our TaskCompletion + PaymentReliable schemas.

Contact: @chris_m_madison on Twitter/X.

## Opportunity

trstlyr.ai's Subjective Logic + Ev-Trust scoring engine needs behavioral evidence inputs. Our open-source TaskCompletion + PaymentReliable schemas are exactly those inputs — EAS-native, Base Mainnet, x402-compatible.

Pitch: "Why build behavioral signals from scratch when you can use our open standard?"

## Composability Layer Needed

To make this partnership concrete, we need:
1. A `taskId` URI format: `"eas:<uid>"` to reference our attestations from trstlyr.ai's engine
2. Potential: `trstlyr` as a recognized `attesterType` in our schema enum
3. An API endpoint or MCP tool for trstlyr to query our attestations for a given subject agent

## Action Items

- [ ] DM @chris_m_madison on Twitter: propose we serve as their behavioral attestation layer
- [ ] Draft composability spec: how trstlyr reads Agent Trust EAS attestations as behavioral signals
- [ ] Build MCP server (see #<mcp_issue>) — enables trstlyr to query us via MCP
- [ ] Reference in STRATEGY.md: window is NOW (Phase 2 not yet shipped)

## Priority

P0 — trstlyr.ai will build their own behavioral signals if no partnership forms in the next 2-4 weeks.
```

---

## Branch and PR

Branch: `feat/npm-public-release-cleanup`
PR: closes the npm cleanup work (no issue to reference — this is doc/config work)

Commit the changes in logical chunks:
1. package.json publishConfig updates
2. README.md updates
3. Open the GitHub issues (use `gh issue create`)

---

## Acceptance Criteria

- [ ] `git stash pop` applied and committed
- [ ] README.md Quick Start shows direct `npm install` with NO GitHub Packages registry setup
- [ ] Sub-package READMEs cleaned up
- [ ] Test count badge updated to 292
- [ ] MCP server GitHub issue created
- [ ] trstlyr.ai partnership GitHub issue created
- [ ] PR opened from `feat/npm-public-release-cleanup` → `main`
- [ ] PR is MERGEABLE (no conflicts)
- [ ] All existing tests still pass

---

## IMPORTANT: Commit and Push

All file changes must be committed and the PR must be pushed before completing. The PM cannot see your local changes — only what's in GitHub.
