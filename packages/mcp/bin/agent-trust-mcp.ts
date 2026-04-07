#!/usr/bin/env node
/**
 * CLI entry point for Claude Desktop integration.
 * Uses stdio transport so Claude Desktop can spawn this as a subprocess.
 */
import { createMcpServer } from '../src/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = createMcpServer();
const transport = new StdioServerTransport();
server.connect(transport);
