# @nia-agent-cyber/agent-trust-elizaos

ElizaOS plugin for [Agent Trust](https://github.com/nia-agent-cyber/agent-trust) — add on-chain trust-tier gating to AI agents built with ElizaOS.

## Installation

```bash
npm install @nia-agent-cyber/agent-trust-elizaos @nia-agent-cyber/agent-trust-sdk @elizaos/core ethers
```

## Quick Start

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { createAgentTrustPlugin } from '@nia-agent-cyber/agent-trust-elizaos';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const agentTrust = new AgentTrust({ network: 'baseSepolia', provider });

const plugin = createAgentTrustPlugin({
  agentTrust,
  requiredTier: 'contributor',   // minimum trust tier required
  addressKey: 'callerAddress',   // where to find the address in message.content
});

const runtime = new AgentRuntime({
  plugins: [plugin],
  // ...
});
```

## Components

### TrustCheckAction (`CHECK_AGENT_TRUST`)

An ElizaOS Action that looks up the on-chain trust tier of a wallet address mentioned in a message.

```typescript
import { createTrustCheckAction } from '@nia-agent-cyber/agent-trust-elizaos';

const action = createTrustCheckAction({
  agentTrust,
  requiredTier: 'contributor',   // optional: check against minimum
  addressKey: 'address',         // content key or fallback to text scan
});
```

The action:
- **validate**: returns `true` if a valid Ethereum address is found
- **handler**: calls `getTier()` + `getScore()`, invokes callback with result
- **callback payload**: `{ text: "...", trustCheck: TrustCheckResult }`

### TrustGuardEvaluator (`TRUST_GUARD`)

An ElizaOS Evaluator that post-processes messages and writes trust results to state.

```typescript
import { createTrustGuardEvaluator } from '@nia-agent-cyber/agent-trust-elizaos';

const evaluator = createTrustGuardEvaluator({
  agentTrust,
  requiredTier: 'trusted',
  addressKey: 'address',
});
```

Writes `state.trustGuardResult` after each turn:
```typescript
{
  address: '0x...',
  passed: true,                    // whether tier requirement was met
  tier: { level: 2, name: 'trusted' },
  requiredTier: 'trusted',
}
```

### TrustProvider

An ElizaOS Provider that enriches agent state with trust tier context.

```typescript
import { createTrustProvider } from '@nia-agent-cyber/agent-trust-elizaos';

const provider = createTrustProvider({ agentTrust, addressKey: 'address' });
```

Returns a formatted string injected into the agent's context:
```
[Trust Context]
Address: 0x...
Tier: trusted (level 2)
Score: 72
Verified: no
```

### `createAgentTrustPlugin`

Factory that bundles all three components into a single ElizaOS plugin:

```typescript
const plugin = createAgentTrustPlugin({
  agentTrust,
  requiredTier: 'contributor',
  addressKey: 'address',
});
// plugin.actions   → [TrustCheckAction]
// plugin.evaluators → [TrustGuardEvaluator]
// plugin.providers  → [TrustProvider]
```

## Tier Reference

| Level | Name | Description |
|-------|------|-------------|
| 0 | `unverified` | Default |
| 1 | `contributor` | Active with basic reputation |
| 2 | `trusted` | Established with peer vouches |
| 3 | `verified` | Highly trusted, strong validation |
| 4 | `expert` | Elite, exceptional track record |

## Testing

All tests are offline (no live RPC calls):

```bash
cd packages/elizaos && npm test
# 74 tests passing
```

## ElizaOS Type Shim

This package includes a minimal type shim for `@elizaos/core` types in `src/eliza-types.ts`. Real ElizaOS types are resolved at consumer install time via `peerDependencies`.
