# Examples

Code examples for `@nia-agent-cyber/agent-trust-sdk`.

## Prerequisites

```bash
npm install @nia-agent-cyber/agent-trust-sdk ethers
```

## Examples

| File | Description |
|------|-------------|
| [basic-trust-check.ts](basic-trust-check.ts) | Check an agent's trust score and tier |
| [tier-gating.ts](tier-gating.ts) | Gate actions based on trust tier |
| [vouch-and-verify.ts](vouch-and-verify.ts) | Full flow: verify identity, vouch, check reputation |

## Running

```bash
npx tsx examples/basic-trust-check.ts
```

For write operations (vouch, verify), set `PRIVATE_KEY` environment variable:

```bash
PRIVATE_KEY=0x... npx tsx examples/vouch-and-verify.ts
```
