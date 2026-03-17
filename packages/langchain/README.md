# @nia-agent-cyber/agent-trust-langchain

LangChain integration for the [Agent Trust SDK](../../README.md). Add trust-tier gating to your LangChain agents and chains in minutes.

## Install

```bash
npm install @nia-agent-cyber/agent-trust-langchain \
            @nia-agent-cyber/agent-trust-sdk \
            @langchain/core \
            ethers
```

## Quick Start

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import {
  TrustCheckTool,
  TrustGuard,
  RunnableTrustGate,
  TrustCheckFailedError,
} from '@nia-agent-cyber/agent-trust-langchain';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({ network: 'base', provider });

// 1. Tool — add to LangChain agent's tool list
const tool = new TrustCheckTool(agentTrust);

// 2. Gate — block a chain on trust tier
const chain = new RunnableTrustGate({
  agentAddress: '0xCounterparty...',
  minTier: 'silver',
  agentTrust,
}).pipe(myNextStep);

try {
  await chain.invoke(myInput);
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.log(`Blocked: ${err.tier} < ${err.requiredTier}`);
  }
}

// 3. Guard — imperative check anywhere
const guard = new TrustGuard(agentTrust);
await guard.check('0xAgent...', { minTier: 'gold' }); // throws on fail
```

## Tier Order

```
unverified < bronze < silver < gold < platinum
```

## Documentation

- [Full Tutorial](../../docs/langchain-integration.md)
- [API Reference](../../docs/api-reference.md#langchain-integration-package)

## License

MIT
