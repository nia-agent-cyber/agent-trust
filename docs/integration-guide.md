# Integration Guide

How to integrate Agent Trust into your agent framework.

## Overview

Agent Trust provides a reputation layer for AI agents on Base. This guide shows how to add trust-based decision making to popular agent frameworks.

---

## Generic Integration Pattern

Regardless of framework, the integration follows three steps:

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

// 1. Initialize once at startup
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({ network: 'base', provider });

// 2. Check trust before interacting with another agent
async function shouldTrust(agentAddress: string): Promise<boolean> {
  const tier = await agentTrust.getTier(agentAddress);
  return agentTrust.meetsTier(agentAddress, 'contributor');
}

// 3. Build reputation by issuing attestations
async function endorseAgent(agentAddress: string, signer: ethers.Signer) {
  await agentTrust.vouch(agentAddress, { signer });
}
```

---

## LangChain / LangGraph

Add trust checks as a tool or pre-condition in your agent chain.

### As a Tool

```typescript
import { DynamicTool } from '@langchain/core/tools';

const trustCheckTool = new DynamicTool({
  name: 'check_agent_trust',
  description: 'Check the trust tier of an agent by their Ethereum address',
  func: async (address: string) => {
    const tier = await agentTrust.getTier(address);
    return JSON.stringify({
      address,
      tier: tier.name,
      level: tier.level,
      score: tier.score,
    });
  },
});

// Add to your agent's tool list
const tools = [trustCheckTool, ...otherTools];
```

### As a Gate

```typescript
// In a LangGraph node, gate execution on trust
async function gatedNode(state: AgentState) {
  const meets = await agentTrust.meetsTier(state.counterpartyAddress, 'trusted');
  if (!meets) {
    return { ...state, action: 'reject', reason: 'Insufficient trust tier' };
  }
  // Proceed with interaction
  return { ...state, action: 'proceed' };
}
```

---

## ElizaOS

Add trust as an evaluator or action in your ElizaOS character.

### As an Evaluator

```typescript
// evaluators/trust-check.ts
export const trustEvaluator = {
  name: 'TRUST_CHECK',
  description: 'Evaluates whether an agent meets minimum trust requirements',
  async handler(runtime, message, state) {
    const address = extractAddress(message); // your extraction logic
    if (!address) return { trusted: true }; // no address = skip

    const meets = await agentTrust.meetsTier(address, 'contributor');
    return { trusted: meets };
  },
};
```

### As an Action

```typescript
// actions/vouch.ts
export const vouchAction = {
  name: 'VOUCH_FOR_AGENT',
  description: 'Vouch for another agent on-chain',
  async handler(runtime, message) {
    const address = extractAddress(message);
    const signer = runtime.getSigner(); // your signer setup
    const tx = await agentTrust.vouch(address, { signer });
    return `Vouched for ${address}. TX: ${tx.hash}`;
  },
};
```

---

## AutoGPT / OpenAI Function Calling

Expose trust operations as function definitions.

```typescript
const functions = [
  {
    name: 'check_trust',
    description: 'Check an agent\'s trust score and tier on Base',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Ethereum address of the agent' },
      },
      required: ['address'],
    },
  },
  {
    name: 'gate_by_tier',
    description: 'Check if an agent meets a minimum trust tier',
    parameters: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Agent address' },
        minTier: {
          type: 'string',
          enum: ['new', 'contributor', 'trusted', 'verified', 'expert'],
          description: 'Minimum required tier',
        },
      },
      required: ['address', 'minTier'],
    },
  },
];

// Handle function calls
async function handleFunction(name: string, args: any) {
  switch (name) {
    case 'check_trust':
      return await agentTrust.getTier(args.address);
    case 'gate_by_tier':
      return { meets: await agentTrust.meetsTier(args.address, args.minTier) };
  }
}
```

---

## CLI Integration

For non-TypeScript agents, use the CLI directly:

```bash
# Check trust tier (returns exit code 0 if meets tier, 1 if not)
agent-trust tier 0xAgentAddress --check contributor

# JSON output for parsing
agent-trust tier 0xAgentAddress --json

# In a shell script
if agent-trust tier "$AGENT_ADDRESS" --check trusted; then
  echo "Agent is trusted, proceeding"
else
  echo "Agent does not meet trust requirements"
  exit 1
fi
```

---

## Multi-Agent Systems

For systems where multiple agents interact:

```typescript
// Middleware: trust-gate all incoming agent requests
async function trustMiddleware(req, res, next) {
  const agentAddress = req.headers['x-agent-address'];
  if (!agentAddress) return res.status(401).json({ error: 'No agent address' });

  const meets = await agentTrust.meetsTier(agentAddress, 'contributor');
  if (!meets) {
    const tier = await agentTrust.getTier(agentAddress);
    return res.status(403).json({
      error: 'Insufficient trust',
      currentTier: tier.name,
      requiredTier: 'contributor',
    });
  }

  next();
}

// Apply to your agent's API
app.use('/api/agent', trustMiddleware);
```

---

## Next Steps

- [Getting Started](getting-started.md) — Full SDK walkthrough
- [API Reference](api-reference.md) — Complete method documentation
- [CLI Examples](cli-examples.md) — Command-line usage
- [Examples](../examples/) — Runnable code samples
