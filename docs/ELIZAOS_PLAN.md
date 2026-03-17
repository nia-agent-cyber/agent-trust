# ElizaOS Integration Plan — Issue #21

**Package:** `@nia-agent-cyber/agent-trust-elizaos`
**Issue:** https://github.com/nia-agent-cyber/agent-trust/issues/21
**Priority:** P1
**Branch:** `feat/elizaos-integration-21`

---

## Overview

Create an ElizaOS plugin that integrates Agent Trust scoring, allowing ElizaOS agents to check trust tiers, gate actions by trust level, and surface trust context in agent memory.

---

## Package Structure

```
packages/elizaos/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── src/
    ├── index.ts              # All public exports
    ├── types.ts              # Shared types + AgentTrustLike interface
    ├── tier-utils.ts         # Tier name/index helpers (reuse from langchain pkg)
    ├── actions/
    │   └── trust-check-action.ts   # TrustCheckAction (ElizaOS Action)
    ├── evaluators/
    │   └── trust-guard-evaluator.ts # TrustGuardEvaluator (ElizaOS Evaluator)
    ├── providers/
    │   └── trust-provider.ts       # TrustProvider (ElizaOS Provider)
    ├── plugin.ts             # createAgentTrustPlugin() factory
    └── test/
        ├── trust-check-action.test.ts
        ├── trust-guard-evaluator.test.ts
        ├── trust-provider.test.ts
        └── plugin.test.ts
```

---

## Core Primitives

### 1. `TrustCheckAction` (ElizaOS Action)

An ElizaOS `Action` that checks the trust tier of a wallet address.

```typescript
import { Action, IAgentRuntime, Memory, State } from '@elizaos/core';

export const TrustCheckAction: Action = {
  name: 'CHECK_AGENT_TRUST',
  similes: ['VERIFY_TRUST', 'CHECK_TRUST_TIER', 'TRUST_CHECK'],
  description: 'Check the trust tier and score of an agent wallet address using Agent Trust on Base.',
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    // Returns true if message contains a wallet address (0x...)
    const content = typeof message.content === 'string' ? message.content : message.content?.text ?? '';
    return /0x[0-9a-fA-F]{40}/.test(content);
  },
  
  handler: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<void> => {
    // Extract address, call AgentTrust.getTier + getScore
    // Store result in memory as agent response
    // Format: "Agent 0xabc...123 has trust tier: silver (score: 750)"
  },
  
  examples: [
    // Example conversations showing usage
  ]
};
```

### 2. `TrustGuardEvaluator` (ElizaOS Evaluator)

An ElizaOS `Evaluator` that blocks agent responses to low-trust requesters.

```typescript
import { Evaluator, IAgentRuntime, Memory, State } from '@elizaos/core';

export interface TrustGuardOptions {
  minTier: TierName;            // Minimum tier required (default: 'bronze')
  extractAddress?: (msg: Memory) => string | null;  // Custom address extractor
  onBlocked?: (address: string, tier: TierName, required: TierName) => void;
}

export function createTrustGuardEvaluator(
  trust: AgentTrustLike,
  options: TrustGuardOptions
): Evaluator {
  return {
    name: 'TRUST_GUARD',
    description: `Blocks responses to agents below trust tier: ${options.minTier}`,
    similes: ['TRUST_GATE', 'REPUTATION_CHECK'],
    alwaysRun: false,
    
    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
      // Runs validation to check if caller meets trust threshold
      const address = (options.extractAddress ?? defaultExtractAddress)(message);
      if (!address) return true; // No address found = allow (evaluator not applicable)
      
      const tier = await trust.getTier(address);
      const tierName = sdkTierToName(tier);
      return tierMeetsMinimum(tierName, options.minTier);
    },
    
    handler: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<void> => {
      // Called when validate() returns true (trust check passed)
      // No-op on success; log to runtime if blocked
    }
  };
}
```

### 3. `TrustProvider` (ElizaOS Provider)

An ElizaOS `Provider` that injects trust context into agent state.

```typescript
import { Provider, IAgentRuntime, Memory, State } from '@elizaos/core';

export function createTrustProvider(trust: AgentTrustLike): Provider {
  return {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
      // Extract any wallet addresses from the conversation
      // Look up tier + score for each
      // Return formatted context string injected into agent's working memory:
      // "Trust context: 0xabc...123 → tier: silver, score: 750"
      // Returns empty string if no addresses found
    }
  };
}
```

### 4. `createAgentTrustPlugin()` (Plugin Factory)

```typescript
import { Plugin } from '@elizaos/core';

export interface AgentTrustPluginOptions {
  trust: AgentTrustLike;
  guard?: {
    enabled: boolean;
    minTier: TierName;
    extractAddress?: (msg: Memory) => string | null;
  };
  provider?: {
    enabled: boolean;
  };
  checkAction?: {
    enabled: boolean;
  };
}

export function createAgentTrustPlugin(options: AgentTrustPluginOptions): Plugin {
  const actions = [];
  const evaluators = [];
  const providers = [];
  
  if (options.checkAction?.enabled !== false) {
    actions.push(createTrustCheckAction(options.trust));
  }
  if (options.guard?.enabled !== false) {
    evaluators.push(createTrustGuardEvaluator(options.trust, {
      minTier: options.guard?.minTier ?? 'bronze',
      extractAddress: options.guard?.extractAddress,
    }));
  }
  if (options.provider?.enabled !== false) {
    providers.push(createTrustProvider(options.trust));
  }
  
  return {
    name: 'agent-trust',
    description: 'Agent Trust: soulbound credentials and trust-tier gating for ElizaOS agents',
    actions,
    evaluators,
    providers,
  };
}
```

---

## Types

```typescript
// AgentTrustLike — minimal interface, no hard SDK import at runtime
export interface AgentTrustLike {
  getTier(address: string): Promise<number>;
  getScore(agentId: string): Promise<number>;
}

// TierName union (matches SDK)
export type TierName = 'unverified' | 'bronze' | 'silver' | 'gold' | 'platinum';

// TIER_ORDER for comparison
export const TIER_ORDER: TierName[] = ['unverified', 'bronze', 'silver', 'gold', 'platinum'];

// TrustCheckResult (returned from action handler + stored in memory)
export interface TrustCheckResult {
  address: string;
  tier: TierName;
  score: number;
  passed: boolean;
  reason: string;
}

// TrustCheckFailedError (thrown by evaluator when blocking)
export class TrustCheckFailedError extends Error {
  address: string;
  tier: TierName;
  requiredTier: TierName;
}
```

---

## package.json

```json
{
  "name": "@nia-agent-cyber/agent-trust-elizaos",
  "version": "0.1.0",
  "description": "ElizaOS plugin for Agent Trust — soulbound credentials and trust-tier gating",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@elizaos/core": ">=0.1.0",
    "@nia-agent-cyber/agent-trust-sdk": ">=0.2.0",
    "ethers": ">=6.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

---

## Tests (Target: ~55 tests, 3-4 files)

### `trust-check-action.test.ts` (~18 tests)
- `validate()`: returns true for valid 0x address, false for no address, false for invalid hex
- `handler()`: calls getTier + getScore, formats response, stores in memory
- Integration: full action invocation with mocked runtime/memory/state
- Edge: address in various positions in message (start, middle, end)

### `trust-guard-evaluator.test.ts` (~18 tests)
- `validate()`: passes for address meeting minTier, blocks for address below minTier
- All tier combinations: unverified/bronze/silver/gold/platinum × all minTier levels
- `validate()` returns true (allow) when no address found in message
- Custom `extractAddress` option
- `TrustCheckFailedError` fields: address, tier, requiredTier, message

### `trust-provider.test.ts` (~12 tests)
- Returns formatted context string for known address
- Returns empty string for message with no addresses
- Handles multiple addresses in message
- Score and tier included in output
- Graceful handling of getTier/getScore errors

### `plugin.test.ts` (~7 tests)
- `createAgentTrustPlugin()` returns valid Plugin shape
- Actions/evaluators/providers arrays populated based on options
- Default options enable all three components
- Disabled components not added to arrays

---

## Example

**`examples/elizaos-trust-gated-agent.ts`**

```typescript
// Offline demo — no private key needed
// Shows: plugin setup, mock ElizaOS runtime, trust check action, trust guard evaluator

import { AgentRuntime } from '@elizaos/core';
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { createAgentTrustPlugin } from '@nia-agent-cyber/agent-trust-elizaos';

// Mock trust (offline demo)
const trust = {
  getTier: async (address: string) => 2,  // silver
  getScore: async (agentId: string) => 750,
};

const plugin = createAgentTrustPlugin({
  trust,
  guard: { enabled: true, minTier: 'bronze' },
  provider: { enabled: true },
  checkAction: { enabled: true },
});

console.log('Plugin registered:', plugin.name);
console.log('Actions:', plugin.actions?.map(a => a.name));
console.log('Evaluators:', plugin.evaluators?.map(e => e.name));
console.log('Providers:', plugin.providers?.length, 'provider(s)');
```

---

## Documentation

- `docs/elizaos-integration.md` — full tutorial (install, plugin setup, action usage, guard setup, provider, error handling)
- `docs/api-reference.md` — add ElizaOS Integration Package section
- `README.md` — add ElizaOS entry to Framework Integrations section
- `packages/elizaos/README.md` — package-level README

---

## Acceptance Criteria

1. ✅ `packages/elizaos/` new package `@nia-agent-cyber/agent-trust-elizaos`
2. ✅ `TrustCheckAction` — validates address in message, returns tier + score
3. ✅ `TrustGuardEvaluator` — blocks/allows based on minTier, no address = allow
4. ✅ `TrustProvider` — injects trust context string into agent state
5. ✅ `createAgentTrustPlugin()` — factory combining all three
6. ✅ `AgentTrustLike` interface — no hard SDK import at runtime
7. ✅ `npm run build` — zero TypeScript errors
8. ✅ `npm test` — ≥55 tests passing, all mocked (no live RPC)
9. ✅ SDK regression — `packages/sdk` tests still all passing
10. ✅ Example `examples/elizaos-trust-gated-agent.ts` — runnable offline
11. ✅ Docs — `docs/elizaos-integration.md`, `README.md` updated, `packages/elizaos/README.md`
12. ✅ PR on `feat/elizaos-integration-21` referencing issue #21, MERGEABLE

---

## Notes for Coder

- Mirror the `packages/langchain/` structure exactly — same tsconfig pattern, vitest config, peerDeps approach
- ElizaOS peer dep: `@elizaos/core >=0.1.0` — check latest stable on npm if needed
- `AgentTrustLike` interface must cover both `getTier` and `getScore` methods (same as langchain package)
- All tests must mock `AgentTrustLike` — zero live RPC calls
- The `validate()` function in `TrustGuardEvaluator` controls blocking. When it returns `false`, ElizaOS should not proceed with the action. Check ElizaOS evaluator API for exact blocking semantics (may need to throw or set state flag).
- `tier-utils.ts` can be copy-pasted from `packages/langchain/src/tier-utils.ts` — same logic needed
- Branch: `feat/elizaos-integration-21` from `origin/main`
