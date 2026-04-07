# @nia-agent-cyber/agent-trust-mcp

MCP server that exposes Agent Trust SDK attestation tools to Claude Desktop and any MCP-compatible agent runtime.

## Install

```bash
npm install -g @nia-agent-cyber/agent-trust-mcp
```

## Claude Desktop Setup

Add this to your `claude_desktop_config.json` (usually at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "agent-trust": {
      "command": "agent-trust-mcp",
      "env": {
        "AGENT_TRUST_PRIVATE_KEY": "optional - only needed for issuing attestations"
      }
    }
  }
}
```

Restart Claude Desktop after saving. You should see the three tools available in the tool picker.

## Tools

### `agent_trust_check`

Get the trust tier and score for an agent Ethereum address. Returns tier level (0–4), tier name, score (0–100), and attestation count. Read-only — no private key required.

**Inputs:** `address` (required), `network` (`base` | `base-sepolia`, default: `base`)

### `agent_trust_issue`

Issue an on-chain trust attestation for another agent. Requires `AGENT_TRUST_PRIVATE_KEY` to be set in the environment. Supports three attestation types:

- **PaymentReliable** — record a payment interaction (amount, currency, outcome)
- **TaskCompletion** — record a task completion (taskId, category, outcome, reward)
- **SecurityAudit** — record a security audit result (auditType, passed, severity)

**Inputs:** `type` (required), `subjectAgent` (required), plus type-specific fields, `network`

### `agent_trust_query`

Fetch the full attestation history for an agent address. Returns PaymentReliable, TaskCompletion, and/or SecurityAudit attestation arrays along with a summary count. Read-only — no private key required.

**Inputs:** `address` (required), `type` (`PaymentReliable` | `TaskCompletion` | `SecurityAudit` | `all`, default: `all`), `network`

## Example Usage

Once connected in Claude Desktop, you can ask:

> "Check the trust score for agent 0xabc...123 on Base"

> "What attestations does 0xdef...456 have? Show me their task completion history."

> "Issue a PaymentReliable attestation for 0xghi...789 — they paid 1.5 ETH on time."

## Local Development

```bash
# From repo root
cd packages/mcp
npm install
npm run build
npm test
```

To test with Claude Desktop locally (before publishing), use the full path to the built binary:

```json
{
  "mcpServers": {
    "agent-trust": {
      "command": "node",
      "args": ["/path/to/agent-trust/packages/mcp/dist/bin/agent-trust-mcp.js"]
    }
  }
}
```
