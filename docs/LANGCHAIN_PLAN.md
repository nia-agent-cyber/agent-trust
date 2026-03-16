# LangChain Integration Plan — Issue #20

**Status:** Ready for implementation  
**Assignee:** Trust Coder  
**Closes:** Issue #20

---

## Goal

Create a LangChain middleware package that lets developers add trust-gating to LangChain agent chains using the Agent Trust SDK. Ship a working example and tutorial.

---

## Package Location

New package: `packages/langchain/`

```
packages/langchain/
  package.json
  tsconfig.json
  src/
    index.ts           — exports all public API
    trust-tool.ts      — AgentTrust as LangChain DynamicTool
    trust-gate.ts      — TrustGate runnable / chain step
    types.ts           — input/output types
  test/
    trust-tool.test.ts
    trust-gate.test.ts
  README.md
```

---

## Deliverables

### 1. `TrustCheckTool` — LangChain tool for agent trust queries

```typescript
import { TrustCheckTool } from '@nia-agent-cyber/agent-trust-langchain';

const tool = new TrustCheckTool({ agentTrust });
// Returns: { address, tier: { name, level, score }, meets: boolean }
```

- Extends `DynamicStructuredTool` from `@langchain/core/tools`
- Input: `{ address: string, requiredTier?: string }`
- Output: JSON string with tier info + `meets` boolean
- Zero-address guard: returns `{ meets: false, error: 'invalid address' }`

### 2. `TrustGate` — LangChain Runnable for gating execution

```typescript
import { TrustGate } from '@nia-agent-cyber/agent-trust-langchain';

const gate = new TrustGate({
  agentTrust,
  requiredTier: 'contributor',  // 'unverified' | 'contributor' | 'trusted' | 'elite'
  addressKey: 'counterpartyAddress',  // key in chain state
  onBlocked?: (state) => ({ ...state, blocked: true })  // optional fallback
});

// Use in a chain:
const chain = gate.pipe(myTool);
```

- Extends `Runnable` from `@langchain/core/runnables`
- Reads `state[addressKey]` to get the address to check
- If tier not met: calls `onBlocked` or throws `TrustGateError`
- If tier met: passes state through unchanged

### 3. `createTrustMiddleware` — factory for quick setup

```typescript
import { createTrustMiddleware } from '@nia-agent-cyber/agent-trust-langchain';

const { tool, gate } = createTrustMiddleware({
  network: 'base',
  provider,
  requiredTier: 'contributor',
});
```

---

## Example

**File:** `examples/langchain-trust-gate.ts`

```typescript
// Trust-gated LangChain agent
// - Tool: look up trust tier of any address
// - Gate: block agent actions for addresses below 'contributor' tier
// Handles no-API-KEY with read-only mode
```

---

## Tutorial

**File:** `docs/tutorials/langchain-trust-middleware.md`

Contents:
1. Installation + setup
2. Adding `TrustCheckTool` to an existing agent
3. Using `TrustGate` in a chain
4. Testing with mock providers
5. Common patterns

---

## Package Config

`packages/langchain/package.json`:
```json
{
  "name": "@nia-agent-cyber/agent-trust-langchain",
  "version": "0.1.0",
  "description": "LangChain integration for Agent Trust SDK",
  "peerDependencies": {
    "@langchain/core": ">=0.3.0",
    "@nia-agent-cyber/agent-trust-sdk": ">=0.2.0",
    "ethers": ">=6.0.0"
  }
}
```

---

## Tests

### `trust-tool.test.ts`
- Returns correct tier info for known address
- Returns `meets: true` when tier requirement met
- Returns `meets: false` when below required tier
- Handles zero-address input gracefully
- Handles missing `requiredTier` (returns tier info only)
- Mock `AgentTrust` for offline tests

### `trust-gate.test.ts`
- Passes state through when trust met
- Throws `TrustGateError` when trust not met
- Calls `onBlocked` callback when provided
- Reads address from correct `addressKey` in state
- Handles missing/invalid address key gracefully

---

## Implementation Order

1. `packages/langchain/package.json` + `tsconfig.json`
2. `src/types.ts` — interfaces
3. `src/trust-tool.ts` — `TrustCheckTool`
4. `src/trust-gate.ts` — `TrustGate` + `TrustGateError`
5. `src/index.ts` — exports
6. Tests (both files, all cases above)
7. `examples/langchain-trust-gate.ts`
8. `docs/tutorials/langchain-trust-middleware.md`
9. `README.md` (root) + `docs/api-reference.md` — add LangChain section

---

## Acceptance Criteria

- [ ] `@nia-agent-cyber/agent-trust-langchain` package buildable (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] `TrustCheckTool` works as a LangChain tool
- [ ] `TrustGate` blocks execution when tier not met, passes through when met
- [ ] `createTrustMiddleware` factory creates both tool + gate
- [ ] Example runs in read-only mode (no API key required for demo)
- [ ] Tutorial at `docs/tutorials/langchain-trust-middleware.md`
- [ ] Root README updated with LangChain integration section
- [ ] `docs/api-reference.md` updated with LangChain package API
- [ ] PR opens with `Closes #20`
- [ ] `MERGEABLE` confirmed before handoff to QA

---

## Notes for Coder

- Peer dependencies only — don't bundle LangChain or ethers
- Mock `AgentTrust` in tests (don't call live EAS in unit tests)
- Follow patterns from `packages/sdk/` for tsconfig, build, test setup
- Use vitest for tests (consistent with SDK)
- The `TrustGate.invoke` should match LangChain's `Runnable.invoke` signature
- `addressKey` defaults to `'address'` if not specified
