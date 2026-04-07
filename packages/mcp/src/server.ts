/**
 * MCP server setup — registers agent_trust_check, agent_trust_issue, agent_trust_query tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { runCheck } from './tools/check.js';
import { runIssue } from './tools/issue.js';
import { runQuery } from './tools/query.js';
import type { CheckInput, IssueInput, QueryInput } from './types.js';

export function createMcpServer(): Server {
  const server = new Server(
    { name: 'agent-trust', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'agent_trust_check',
        description:
          'Get the trust tier and score for an agent Ethereum address. Returns tier level (0-4), tier name, score (0-100), and attestation count. Use this to check if an agent is trustworthy before interacting with it.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Ethereum address of the agent to check (0x...)',
            },
            network: {
              type: 'string',
              enum: ['base', 'base-sepolia'],
              description: 'Network to query (default: base)',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'agent_trust_issue',
        description:
          'Issue a trust attestation for an agent. Requires AGENT_TRUST_PRIVATE_KEY env var. Supports three attestation types: PaymentReliable (payment history), TaskCompletion (task outcomes), SecurityAudit (audit results).',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['PaymentReliable', 'TaskCompletion', 'SecurityAudit'],
              description: 'Type of attestation to issue',
            },
            subjectAgent: {
              type: 'string',
              description: 'Ethereum address of the agent being attested (0x...)',
            },
            network: {
              type: 'string',
              enum: ['base', 'base-sepolia'],
              description: 'Network to write to (default: base)',
            },
            amount: { type: 'number', description: 'Payment amount (PaymentReliable)' },
            currency: { type: 'string', description: 'Payment currency, e.g. ETH (PaymentReliable)' },
            outcome: {
              type: 'string',
              enum: ['paid', 'partial', 'failed'],
              description: 'Payment outcome (PaymentReliable)',
            },
            paidAt: { type: 'number', description: 'Unix timestamp of payment (PaymentReliable)' },
            taskId: { type: 'string', description: 'Task identifier (TaskCompletion)' },
            category: { type: 'string', description: 'Task category (TaskCompletion)' },
            taskOutcome: {
              type: 'string',
              enum: ['completed', 'failed', 'disputed'],
              description: 'Task outcome (TaskCompletion)',
            },
            completedAt: { type: 'number', description: 'Unix timestamp of completion (TaskCompletion)' },
            reward: { type: 'number', description: 'Reward amount (TaskCompletion)' },
            rewardToken: { type: 'string', description: 'Reward token address (TaskCompletion)' },
            taskRef: { type: 'string', description: 'External task reference URL or ID (TaskCompletion)' },
            subject: { type: 'string', description: 'Subject address or contract (SecurityAudit)' },
            auditType: { type: 'string', description: 'Type of audit performed (SecurityAudit)' },
            passed: { type: 'boolean', description: 'Whether audit passed (SecurityAudit)' },
            severity: {
              type: 'number',
              description: 'Severity level 0-4: 0=none, 1=low, 2=medium, 3=high, 4=critical (SecurityAudit)',
            },
            auditRef: { type: 'string', description: 'Audit report reference URL (SecurityAudit)' },
          },
          required: ['type', 'subjectAgent'],
        },
      },
      {
        name: 'agent_trust_query',
        description:
          'Fetch full attestation history for an agent address. Returns PaymentReliable, TaskCompletion, and/or SecurityAudit attestations with a summary count. Use this to research an agent\'s track record in detail.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Agent address to query (0x...)',
            },
            type: {
              type: 'string',
              enum: ['PaymentReliable', 'TaskCompletion', 'SecurityAudit', 'all'],
              description: 'Attestation type to fetch (default: all)',
            },
            network: {
              type: 'string',
              enum: ['base', 'base-sepolia'],
              description: 'Network to query (default: base)',
            },
          },
          required: ['address'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'agent_trust_check') {
        const result = await runCheck(args as unknown as CheckInput);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }

      if (name === 'agent_trust_issue') {
        const result = await runIssue(args as unknown as IssueInput);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }

      if (name === 'agent_trust_query') {
        const result = await runQuery(args as unknown as QueryInput);
        return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  });

  return server;
}
