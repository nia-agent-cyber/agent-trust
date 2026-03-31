# @nia-agent-cyber/agent-trust-langchain

LangChain middleware for [Agent Trust](https://github.com/nia-agent-cyber/agent-trust) — add trust-tier gating to your LangChain agent chains.

## Installation

```bash
npm install @nia-agent-cyber/agent-trust-langchain @nia-agent-cyber/agent-trust-sdk @langchain/core ethers
```

## Quick Start

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { TrustCheckTool, TrustGate, TrustGateError, createTrustMiddleware } from '@nia-agent-cyber/agent-trust-langchain';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const agentTrust = new AgentTrust({ network: 'baseSepolia', provider });

// ── TrustCheckTool: look up trust tier ────────────────────────────────────
const tool = new TrustCheckTool({ agentTrust, requiredTier: 'contributor' });
const result = await tool._run({ address: '0x...' });
// { address, tier: { level, name, score }, meets: true, requiredTier: 'contributor' }

// Register with a LangChain agent
const langChainTool = tool.toLangChainTool();

// ── TrustGate: block chain execution below required tier ──────────────────
const gate = new TrustGate({
  agentTrust,
  requiredTier: 'contributor',
  addressKey: 'counterpartyAddress',
  onBlocked: (state) => ({ ...state, blocked: true }), // optional: fallback instead of throw
});

const chain = gate.pipe(myDownstreamTool);
const output = await chain.invoke({ counterpartyAddress: '0x...', ...otherState });

// ── createTrustMiddleware: factory for both ───────────────────────────────
const { tool: t, gate: g } = createTrustMiddleware({ agentTrust, requiredTier: 'contributor' });
```

## API

### `TrustCheckTool`

Wraps `AgentTrust.getTier()` + `getScore()` as a LangChain-compatible tool.

| Config | Type | Description |
|--------|------|-------------|
| `agentTrust` | `AgentTrustLike` | AgentTrust instance |
| `requiredTier?` | `TierName` | Default minimum tier |
| `name?` | `string` | Tool name (default: `agent_trust_check`) |
| `description?` | `string` | Tool description |

**Methods:**
- `_run(input)` → `TrustCheckOutput` — structured result
- `invoke(input)` → `string` — JSON-serialized result
- `toLangChainTool()` → `DynamicStructuredTool` — LangChain-native tool

### `TrustGate`

A Runnable step that gates chain execution by trust tier.

| Config | Type | Description |
|--------|------|-------------|
| `agentTrust` | `AgentTrustLike` | AgentTrust instance |
| `requiredTier` | `TierName` | Minimum tier to pass |
| `addressKey?` | `string` | State key for address (default: `'address'`) |
| `onBlocked?` | `(state) => state` | Fallback instead of throwing |

**Methods:**
- `invoke(state)` → passes state through or throws `TrustGateError`
- `pipe(next)` → composed chain
- `toLangChainRunnable()` → `RunnableLambda`

### `TrustGateError`

Thrown by `TrustGate` when trust check fails:
- `error.address` — the blocked address
- `error.tier` — actual tier name
- `error.requiredTier` — required tier name

### `createTrustMiddleware(config)`

Factory that creates a `{ tool, gate }` pair from a shared config.

## Tier Names

| Level | Name | Description |
|-------|------|-------------|
| 0 | `unverified` | Default for new agents |
| 1 | `contributor` | Active with basic reputation |
| 2 | `trusted` | Established with peer vouches |
| 3 | `verified` | Highly trusted, strong validation |
| 4 | `expert` | Elite, exceptional track record |

## Testing

```bash
npm test
```

All tests are offline (mocked AgentTrust — no live RPC calls).

## Tutorial

See [`docs/tutorials/langchain-trust-middleware.md`](../../docs/tutorials/langchain-trust-middleware.md) for a full integration guide.
