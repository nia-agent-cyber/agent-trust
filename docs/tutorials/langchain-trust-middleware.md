# LangChain Trust Middleware Tutorial

Add on-chain trust-tier gating to your LangChain agent chains using the Agent Trust SDK.

---

## 1. Installation & Setup

```bash
npm install @nia-agent-cyber/agent-trust-langchain \
            @nia-agent-cyber/agent-trust-sdk \
            @langchain/core \
            ethers
```

Initialize the SDK:

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const agentTrust = new AgentTrust({ network: 'baseSepolia', provider });
```

For read-only usage (no wallet), omit the signer from the provider. Tier lookups don't require signing.

---

## 2. Adding TrustCheckTool to a LangChain Agent

`TrustCheckTool` lets your agent look up the trust tier of any wallet address.

```typescript
import { TrustCheckTool } from '@nia-agent-cyber/agent-trust-langchain';

const tool = new TrustCheckTool({
  agentTrust,
  requiredTier: 'contributor', // optional default
});

// As a LangChain DynamicStructuredTool (requires @langchain/core):
const langChainTool = tool.toLangChainTool();

// Add to your agent's tools array:
const agent = await createToolCallingAgent({
  llm,
  tools: [langChainTool, ...otherTools],
  prompt,
});
```

The tool input schema:
```
{ address: string, requiredTier?: 'unverified' | 'contributor' | 'trusted' | 'verified' | 'expert' }
```

The tool returns a JSON string:
```json
{
  "address": "0xabc...",
  "tier": { "level": 2, "name": "trusted", "score": 72 },
  "meets": true,
  "requiredTier": "contributor"
}
```

---

## 3. Using TrustGate in a Chain

`TrustGate` blocks chain execution when an address doesn't meet the required tier. It reads the address from the chain state and either passes the state through or throws a `TrustGateError`.

```typescript
import { TrustGate, TrustGateError } from '@nia-agent-cyber/agent-trust-langchain';

const gate = new TrustGate({
  agentTrust,
  requiredTier: 'contributor',
  addressKey: 'counterpartyAddress', // which key in state holds the address
});

// Build a chain: gate → downstream tool
const chain = gate.pipe(myDownstreamTool);

// Invoke the chain
try {
  const result = await chain.invoke({
    counterpartyAddress: '0xabc...',
    payload: 'execute payment',
  });
} catch (e) {
  if (e instanceof TrustGateError) {
    console.log(`Blocked: ${e.address} has tier '${e.tier}', requires '${e.requiredTier}'`);
  }
}
```

### Soft blocking with `onBlocked`

Instead of throwing, provide an `onBlocked` callback to return a fallback state:

```typescript
const gate = new TrustGate({
  agentTrust,
  requiredTier: 'trusted',
  onBlocked: (state) => ({
    ...state,
    blocked: true,
    reason: 'Address does not meet minimum trust tier',
  }),
});

const result = await gate.invoke({ address: '0x...' });
// result.blocked === true if tier not met (no throw)
```

---

## 4. Quick Setup with `createTrustMiddleware`

For the common case of needing both a tool and a gate:

```typescript
import { createTrustMiddleware } from '@nia-agent-cyber/agent-trust-langchain';

const { tool, gate } = createTrustMiddleware({
  agentTrust,
  requiredTier: 'contributor',
  addressKey: 'callerAddress',
});

// tool → register with LangChain agent
// gate → use as chain step
```

---

## 5. Testing with Mock Providers

All components accept any `AgentTrustLike` object — no real RPC needed for tests:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TrustGate, TrustGateError } from '@nia-agent-cyber/agent-trust-langchain';

const mockTrust = {
  getTier: vi.fn().mockResolvedValue({ tier: 0 }), // unverified
  getScore: vi.fn().mockResolvedValue({ score: 0 }),
};

const gate = new TrustGate({ agentTrust: mockTrust, requiredTier: 'contributor' });

it('blocks unverified address', async () => {
  await expect(
    gate.invoke({ address: '0x' + 'a'.repeat(40) })
  ).rejects.toThrow(TrustGateError);
});
```

---

## 6. Common Patterns

### Per-request tier check

```typescript
const tool = new TrustCheckTool({ agentTrust });
// Override requiredTier per invocation:
const result = await tool._run({ address: '0x...', requiredTier: 'trusted' });
```

### Multi-tier gates (use pipe)

```typescript
const bronzeGate = new TrustGate({ agentTrust, requiredTier: 'contributor' });
const silverGate = new TrustGate({ agentTrust, requiredTier: 'trusted' });

// Both must pass:
const chain = bronzeGate.pipe(silverGate).pipe(finalStep);
```

### LangChain Runnable integration

```typescript
import { RunnableSequence } from '@langchain/core/runnables';

const trustRunnable = gate.toLangChainRunnable();
const sequence = RunnableSequence.from([trustRunnable, myLLMChain]);
```

---

## Tier Reference

| Level | Name | Requirements |
|-------|------|-------------|
| 0 | `unverified` | Default |
| 1 | `contributor` | 1+ verification, 1+ vouch |
| 2 | `trusted` | 3+ vouches from contributor+ |
| 3 | `verified` | 5+ vouches from trusted+ |
| 4 | `expert` | Elite, 10+ expert vouches |

For a full Agent Trust setup, see the [main README](../../README.md).
