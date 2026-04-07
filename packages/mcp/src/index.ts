/**
 * @nia-agent-cyber/agent-trust-mcp
 * MCP server exposing Agent Trust SDK as Claude Desktop tools
 */

export { createMcpServer } from './server.js';
export type { CheckInput, CheckOutput, IssueInput, IssueOutput, QueryInput, QueryOutput } from './types.js';
