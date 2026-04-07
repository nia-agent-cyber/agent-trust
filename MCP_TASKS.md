# MCP Server Implementation — Issue #31

**Created by:** Trust PM  
**Date:** 2026-04-07  
**Priority:** P0

---

## Goal

Implement `@nia-agent-cyber/agent-trust-mcp` — an MCP server package that exposes Agent Trust SDK methods as MCP tools, enabling Claude Desktop and any MCP-compatible agent runtime to query and issue trust attestations.

## Package Location

`packages/mcp/` (new package in the monorepo)

---

## Acceptance Criteria (from Issue #31)

- [ ] MCP server package in `packages/mcp/`
- [ ] Exposes `agent_trust_check`, `agent_trust_issue`, `agent_trust_query` as MCP tools
- [ ] Works with Claude Desktop (test with local config)
- [ ] Published as `@nia-agent-cyber/agent-trust-mcp`
- [ ] README with Claude Desktop setup instructions

---

## Technical Spec

### Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@nia-agent-cyber/agent-trust-sdk": "^0.2.0",
    "ethers": "^6.0.0"
  }
}
```

Use `@modelcontextprotocol/sdk` (the official MCP TypeScript SDK). This is `@modelcontextprotocol/sdk` on npm.

### Package Structure

```
packages/mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Entry point — exports createMcpServer()
│   ├── server.ts         # MCP server setup + tool registration
│   ├── tools/
│   │   ├── check.ts      # agent_trust_check tool
│   │   ├── issue.ts      # agent_trust_issue tool
│   │   └── query.ts      # agent_trust_query tool
│   └── types.ts          # Shared types for tool inputs/outputs
├── bin/
│   └── agent-trust-mcp.ts  # CLI entry point (stdio transport)
└── README.md
```

### MCP Tools to Implement

#### 1. `agent_trust_check`

Get the trust tier and score for an agent address.

**Input schema:**
```typescript
{
  address: string,          // Ethereum address of the agent
  network?: string          // "base" | "base-sepolia" (default: "base")
}
```

**Output:**
```typescript
{
  address: string,
  tier: number,             // 0-4 (Unverified → Elite)
  tierName: string,         // "Unverified" | "Verified" | "Established" | "Trusted" | "Elite"
  score: number,            // 0-100
  attestationCount: number,
  updatedAt: number | null  // Unix timestamp
}
```

**Implementation:** Use `AgentTrust.getScore()` + `AgentTrust.getTier()` from the SDK (read-only, no signer needed).

#### 2. `agent_trust_issue`

Issue a trust attestation for an agent. Requires a private key in env.

**Input schema:**
```typescript
{
  type: "PaymentReliable" | "TaskCompletion" | "SecurityAudit",
  subjectAgent: string,     // Address of the agent being attested
  // For PaymentReliable:
  amount?: number,
  currency?: string,
  outcome?: "paid" | "partial" | "failed",
  paidAt?: number,
  // For TaskCompletion:
  taskId?: string,
  category?: string,
  taskOutcome?: "completed" | "failed" | "disputed",
  completedAt?: number,
  reward?: number,
  rewardToken?: string,
  taskRef?: string,
  // For SecurityAudit:
  subject?: string,
  auditType?: string,
  passed?: boolean,
  severity?: number,
  auditRef?: string,
  // Common:
  network?: string
}
```

**Output:**
```typescript
{
  success: boolean,
  attestationUid?: string,
  txHash?: string,
  error?: string
}
```

**Implementation:** Uses `AgentTrust` with signer from `AGENT_TRUST_PRIVATE_KEY` env var. Call the appropriate `issue*` method based on `type`.

**Guard:** If `AGENT_TRUST_PRIVATE_KEY` is not set, return a helpful error: "Set AGENT_TRUST_PRIVATE_KEY env var to enable attestation issuance."

#### 3. `agent_trust_query`

Fetch attestation history for an agent.

**Input schema:**
```typescript
{
  address: string,          // Agent address to query
  type?: "PaymentReliable" | "TaskCompletion" | "SecurityAudit" | "all",  // default "all"
  network?: string          // default "base"
}
```

**Output:**
```typescript
{
  address: string,
  paymentReliable?: PaymentReliableAttestation[],
  taskCompletion?: TaskCompletionAttestation[],
  securityAudit?: SecurityAuditAttestation[],
  summary: {
    totalAttestations: number,
    byType: Record<string, number>
  }
}
```

**Implementation:** Use `AgentTrust.getPaymentReliability()`, `getTaskCompletions()`, `getSecurityAudits()` from the SDK.

---

### Server Entry Point (bin/agent-trust-mcp.ts)

```typescript
#!/usr/bin/env node
// CLI entry for Claude Desktop integration
// Uses stdio transport
import { createMcpServer } from '../src/index';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = createMcpServer();
const transport = new StdioServerTransport();
server.connect(transport);
```

The `bin` script should be listed in package.json:
```json
"bin": {
  "agent-trust-mcp": "dist/bin/agent-trust-mcp.js"
}
```

---

### AgentTrust Initialization (no signer for read ops)

For `agent_trust_check` and `agent_trust_query`, use a read-only provider:

```typescript
import { ethers } from 'ethers';
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';

const network = input.network || 'base';
const rpcUrl = network === 'base' 
  ? 'https://mainnet.base.org' 
  : 'https://sepolia.base.org';

const provider = new ethers.JsonRpcProvider(rpcUrl);
const trust = new AgentTrust({ network, provider });
```

For `agent_trust_issue`, add signer:

```typescript
const privateKey = process.env.AGENT_TRUST_PRIVATE_KEY;
if (!privateKey) {
  return { success: false, error: 'Set AGENT_TRUST_PRIVATE_KEY env var to enable attestation issuance.' };
}
const wallet = new ethers.Wallet(privateKey, provider);
const trust = new AgentTrust({ network, provider: wallet });
```

---

### README Requirements

Must include:

1. **What it is** — one sentence
2. **Install** — `npm install -g @nia-agent-cyber/agent-trust-mcp`
3. **Claude Desktop config** (claude_desktop_config.json snippet):
```json
{
  "mcpServers": {
    "agent-trust": {
      "command": "agent-trust-mcp",
      "env": {
        "AGENT_TRUST_PRIVATE_KEY": "optional - only for issuing attestations"
      }
    }
  }
}
```
4. **Tool descriptions** — one paragraph each for the 3 tools
5. **Example usage** — 2-3 natural language examples Claude can use

---

### Tests

Write tests in `src/test/` using vitest. Test:
- Tool input validation (bad address, missing required fields)
- Tool output shape (mock the SDK calls)
- `agent_trust_check` happy path with mocked AgentTrust
- `agent_trust_query` happy path with mocked AgentTrust

No live blockchain calls in tests.

---

## PR Instructions

1. Create branch: `feature/issue-31-mcp-server`
2. Implement everything above
3. Run: `cd packages/mcp && npm install && npm run build && npm test`
4. Fix any TypeScript errors before opening PR
5. Open PR against `main` with title: `feat: MCP server for Claude Desktop (#31)`
6. PR description should include:
   - What was built
   - How to test locally
   - Claude Desktop config snippet

## Notes

- Mirror the `packages/langchain/` pattern for package setup (separate package, peer deps, publishConfig public)
- `@modelcontextprotocol/sdk` version: check what's latest on npm, use `^1.0.0` or latest stable
- Don't worry about the placeholder schema UIDs — the check/query tools work read-only against the real chain
- Keep error messages helpful — Claude users will see them directly
