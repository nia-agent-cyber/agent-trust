# Examples

Runnable code examples for `@nia-agent-cyber/agent-trust-sdk`.

## Setup

```bash
cd examples/
npm install
```

> **Note:** You need a `.npmrc` with `@nia-agent-cyber:registry=https://npm.pkg.github.com` in the repo root or your home directory.

## Examples

| Example | Description | Command |
|---------|-------------|---------|
| [basic-trust-check.ts](basic-trust-check.ts) | Check an agent's trust score and tier | `npm run basic` |
| [tier-gating.ts](tier-gating.ts) | Gate actions based on trust tier | `npm run tier-gating` |
| [vouch-and-verify.ts](vouch-and-verify.ts) | Full flow: verify → vouch → check reputation | `npm run vouch` |
| [multi-agent-reputation.ts](multi-agent-reputation.ts) | Compare trust across multiple agents | `npm run multi-agent` |
| [express-middleware.ts](express-middleware.ts) | Trust-gated Express API with caching | `npm run middleware` |

## Running Individual Examples

```bash
# Read-only (no wallet needed)
npx tsx basic-trust-check.ts
npx tsx multi-agent-reputation.ts
npx tsx tier-gating.ts

# Write operations (needs private key)
PRIVATE_KEY=0x... npx tsx vouch-and-verify.ts

# Starts a server on :3000
npx tsx express-middleware.ts
```

## What Each Example Teaches

### basic-trust-check.ts
The simplest starting point. Query any address for its trust score, tier, and verification status.

### tier-gating.ts
Pattern for restricting access based on reputation. Shows `meetsTier()` and `getTierProgress()`.

### vouch-and-verify.ts
End-to-end workflow: generate a Twitter verification challenge, vouch for another agent, and check the updated score.

### multi-agent-reputation.ts
Agent marketplace pattern: compare multiple candidates and pick the most reputable one. Shows batch querying and sorting.

### express-middleware.ts
Production-ready pattern: Express middleware that gates API endpoints by trust tier, with 5-minute cache to avoid redundant lookups. Three tiers of access (public / contributor / verified).
