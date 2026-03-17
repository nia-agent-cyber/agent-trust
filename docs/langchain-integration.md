# Add Trust Checks to Your LangChain Agent

This guide shows you how to use `@nia-agent-cyber/agent-trust-langchain` to add trust-tier gating
to your LangChain agents and chains. Prevent untrusted agents from executing high-risk operations
with just a few lines of code.

---

## Table of Contents

1. [Installation](#installation)
2. [Tier Order](#tier-order)
3. [Quick Start: TrustCheckTool](#quick-start-trustchecktool)
4. [Gating Chains: RunnableTrustGate](#gating-chains-runnabletrustgate)
5. [Imperative Checks: TrustGuard](#imperative-checks-trustguard)
6. [Error Handling](#error-handling)
7. [Full Example](#full-example)
8. [API Reference](#api-reference)

---

## Installation

```bash
npm install @nia-agent-cyber/agent-trust-langchain \
            @nia-agent-cyber/agent-trust-sdk \
            @langchain/core \
            ethers
```

---

## Tier Order

The package uses five trust tiers (lowest to highest):

```
unverified < bronze < silver < gold < platinum
```

These map to the Agent Trust SDK's numeric tiers:

| Name       | SDK Level | Description |
|------------|-----------|-------------|
| unverified | 0 (New)   | No established reputation |
| bronze     | 1 (Contributor) | Active with basic reputation |
| silver     | 2 (Trusted) | Established with peer vouches |
| gold       | 3 (Verified) | Highly trusted, strong validation |
| platinum   | 4 (Expert) | Elite — exceptional track record |

---

## Quick Start: TrustCheckTool

`TrustCheckTool` is a LangChain `StructuredTool` you can add to any agent's tool list.
The agent can call it to look up an address's trust tier before proceeding.

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { TrustCheckTool } from '@nia-agent-cyber/agent-trust-langchain';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({ network: 'base', provider });

// Create the tool
const trustCheckTool = new TrustCheckTool(agentTrust);

// Use in a LangChain agent:
const agent = createReactAgent({
  llm: yourLLM,
  tools: [trustCheckTool, ...yourOtherTools],
});

// The tool can also be called directly:
const raw = await trustCheckTool._call({
  agentAddress: '0xYourAgentAddress...',
  minTier: 'silver',
});
const result = JSON.parse(raw);
// {
//   address: '0x...',
//   tier: 'silver',
//   score: 72,
//   passed: true,
//   reason: "Agent 0x... has tier 'silver' (score: 72), which meets the required 'silver' tier."
// }
```

### Tool Schema

Input fields:
- `agentAddress` (string, required) — Ethereum wallet address to check
- `minTier` (string, optional) — Minimum tier required. Defaults to `"bronze"`.
  One of: `unverified`, `bronze`, `silver`, `gold`, `platinum`.

Output: JSON string with `TrustCheckResult`:
```typescript
interface TrustCheckResult {
  address: string;   // the checked address
  tier: TierName;    // actual tier of the agent
  score: number;     // trust score (0–100)
  passed: boolean;   // true if tier >= minTier
  reason: string;    // human-readable explanation
}
```

---

## Gating Chains: RunnableTrustGate

`RunnableTrustGate` is a LangChain `Runnable` that blocks chain execution for untrusted agents.
Insert it at the start of a chain with `.pipe()`.

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import {
  RunnableTrustGate,
  TrustCheckFailedError,
} from '@nia-agent-cyber/agent-trust-langchain';
import { RunnableLambda } from '@langchain/core/runnables';

const agentTrust = new AgentTrust({ network: 'base', provider });

// The address of the agent whose trust to check
const agentToCheck = '0xCounterpartyAgent...';

const trustGate = new RunnableTrustGate({
  agentAddress: agentToCheck,
  minTier: 'silver',
  agentTrust,
});

// Downstream step (only runs if trust check passes)
const transferOperation = RunnableLambda.from(async (input) => {
  // ... execute transfer
  return { success: true };
});

// Build the chain
const chain = trustGate.pipe(transferOperation);

// Invoke the chain
try {
  const result = await chain.invoke({ amount: 1.5, to: '0xRecipient...' });
  console.log('Transfer executed:', result);
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.error(
      `Blocked: agent '${err.address}' has tier '${err.tier}', ` +
      `requires '${err.requiredTier}'`
    );
  }
}
```

### How it works

1. `trustGate.invoke(input)` is called
2. The gate checks `agentAddress` against the `minTier`
3. **If trusted** → `input` is passed through unchanged to the next step
4. **If not trusted** → `TrustCheckFailedError` is thrown immediately (chain halts)

### Constructor Options

```typescript
new RunnableTrustGate({
  agentAddress: string;   // address to check
  minTier?: TierName;     // defaults to 'bronze'
  agentTrust: AgentTrustLike; // AgentTrust instance
})
```

---

## Imperative Checks: TrustGuard

`TrustGuard` is a simple utility for non-chain contexts — middleware, REST APIs, webhooks, etc.
It throws `TrustCheckFailedError` on failure instead of returning `passed: false`.

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { TrustGuard, TrustCheckFailedError } from '@nia-agent-cyber/agent-trust-langchain';

const agentTrust = new AgentTrust({ network: 'base', provider });
const guard = new TrustGuard(agentTrust);

// Instance method — throws on failure
try {
  const result = await guard.check('0xAgentAddress...', { minTier: 'gold' });
  console.log(`Trusted! Tier: ${result.tier}, Score: ${result.score}`);
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.error(`Not trusted: ${err.message}`);
  }
}

// Static method — same behaviour, no constructor needed
try {
  const result = await TrustGuard.check(agentTrust, '0xAgentAddress...', { minTier: 'silver' });
  console.log(`Trusted! Tier: ${result.tier}`);
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.error(`Not trusted: tier '${err.tier}', requires '${err.requiredTier}'`);
  }
}
```

### Options

```typescript
interface TrustGuardOptions {
  minTier?: TierName;   // defaults to 'bronze'
  rpcUrl?: string;      // optional RPC override
  network?: string;     // optional network override
}
```

---

## Error Handling

All methods throw `TrustCheckFailedError` when the trust check fails:

```typescript
import { TrustCheckFailedError } from '@nia-agent-cyber/agent-trust-langchain';

try {
  await guard.check(address, { minTier: 'gold' });
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.log(err.address);      // '0x...'
    console.log(err.tier);         // 'bronze'
    console.log(err.requiredTier); // 'gold'
    console.log(err.message);      // "Trust check failed for 0x...: tier 'bronze' does not meet minimum 'gold'"
    console.log(err.name);         // 'TrustCheckFailedError'
  }
}
```

---

## Full Example

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import {
  TrustCheckTool,
  TrustGuard,
  RunnableTrustGate,
  TrustCheckFailedError,
  TIER_ORDER,
} from '@nia-agent-cyber/agent-trust-langchain';
import { RunnableLambda } from '@langchain/core/runnables';
import { ethers } from 'ethers';

// 1. Set up AgentTrust
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({ network: 'base', provider });

// 2. TrustCheckTool — add to agent's tools array
const trustCheckTool = new TrustCheckTool(agentTrust);

// 3. RunnableTrustGate — gate a chain
const counterparty = '0xCounterparty...';
const chain = new RunnableTrustGate({
  agentAddress: counterparty,
  minTier: 'silver',
  agentTrust,
}).pipe(
  RunnableLambda.from(async (input) => {
    // Only runs if counterparty has silver+ tier
    return { processed: true, ...input };
  })
);

try {
  const result = await chain.invoke({ operation: 'high-value-transfer' });
  console.log('Success:', result);
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.error(`Blocked — ${err.tier} tier, needs ${err.requiredTier}`);
  }
}

// 4. TrustGuard — imperative check
const guard = new TrustGuard(agentTrust);
const checkResult = await guard.check(counterparty, { minTier: 'bronze' });
console.log(`Tier: ${checkResult.tier}, Score: ${checkResult.score}`);

// 5. Tier order reference
console.log(`Tier order: ${TIER_ORDER.join(' < ')}`);
// → unverified < bronze < silver < gold < platinum
```

---

## API Reference

### `TrustCheckTool`

```typescript
class TrustCheckTool extends StructuredTool {
  constructor(agentTrust: AgentTrustLike)
  name: 'trust_check'
  description: string
  schema: ZodObject<{ agentAddress: string, minTier?: TierName }>
  _call(input: { agentAddress: string, minTier?: TierName }): Promise<string>
}
```

### `TrustGuard`

```typescript
class TrustGuard {
  constructor(agentTrust: AgentTrustLike)
  check(agentAddress: string, options?: TrustGuardOptions): Promise<TrustCheckResult>
  static check(agentTrust, agentAddress, options?): Promise<TrustCheckResult>
}
```

### `RunnableTrustGate`

```typescript
class RunnableTrustGate<TInput> extends RunnableLambda<TInput, TInput> {
  constructor(options: TrustGateOptions)
  getAgentAddress(): string
  getMinTier(): TierName
}
```

### `TrustCheckFailedError`

```typescript
class TrustCheckFailedError extends Error {
  address: string      // agent address that failed
  tier: TierName       // actual tier
  requiredTier: TierName  // minimum required
}
```

### `TIER_ORDER`

```typescript
const TIER_ORDER = ['unverified', 'bronze', 'silver', 'gold', 'platinum'] as const;
```

---

## See Also

- [Agent Trust SDK README](../README.md)
- [Full API Reference](./api-reference.md)
- [Example: langchain-trust-gated-agent.ts](../examples/langchain-trust-gated-agent.ts)
