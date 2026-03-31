/**
 * ElizaOS Agent Trust Plugin Example
 *
 * Demonstrates all three components:
 * 1) createAgentTrustPlugin — full plugin factory
 * 2) createTrustCheckAction — standalone action
 * 3) createTrustGuardEvaluator — standalone evaluator
 * 4) createTrustProvider — standalone provider
 *
 * Runs in offline mode (no RPC, no private key required).
 */

import {
  createAgentTrustPlugin,
  createTrustCheckAction,
  createTrustGuardEvaluator,
  createTrustProvider,
} from '@nia-agent-cyber/agent-trust-elizaos';
import type { AgentTrustLike, IAgentRuntime, Memory, State } from '@nia-agent-cyber/agent-trust-elizaos';

// ---------------------------------------------------------------------------
// Mock AgentTrust (replace with real AgentTrust instance for live use)
// ---------------------------------------------------------------------------
const mockTrust: AgentTrustLike = {
  getTier: async (address: string) => {
    const isBlocked = address.toLowerCase().endsWith('0'.repeat(4));
    return { tier: isBlocked ? 0 : 2 };
  },
  getScore: async (_address: string) => ({ score: 72 }),
};

const runtime: IAgentRuntime = { agentId: 'demo-agent', character: { name: 'DemoAgent' } };
const TRUSTED_ADDR = '0x' + 'a'.repeat(40);
const BLOCKED_ADDR = '0x' + 'a'.repeat(36) + '0000';

// ---------------------------------------------------------------------------
// 1. Full plugin via createAgentTrustPlugin
// ---------------------------------------------------------------------------
async function demoPlugin() {
  console.log('\n─── createAgentTrustPlugin ───');
  const plugin = createAgentTrustPlugin({
    agentTrust: mockTrust,
    requiredTier: 'contributor',
  });

  console.log('Plugin:', plugin.name);
  console.log('Actions:', plugin.actions?.map((a) => a.name));
  console.log('Evaluators:', plugin.evaluators?.map((e) => e.name));
  console.log('Providers:', plugin.providers?.length, 'provider(s)');
}

// ---------------------------------------------------------------------------
// 2. TrustCheckAction
// ---------------------------------------------------------------------------
async function demoAction() {
  console.log('\n─── TrustCheckAction ───');
  const action = createTrustCheckAction({ agentTrust: mockTrust, requiredTier: 'contributor' });

  const msg: Memory = { content: { text: `Check trust for ${TRUSTED_ADDR}` } };
  const valid = await action.validate(runtime, msg);
  console.log('Validate:', valid);

  await action.handler(runtime, msg, undefined, undefined, async (response) => {
    console.log('Response:', response.text);
    console.log('Trust result:', response.trustCheck);
  });

  // Blocked address
  const blockedMsg: Memory = { content: { text: `check ${BLOCKED_ADDR}` } };
  await action.handler(runtime, blockedMsg, undefined, undefined, async (response) => {
    console.log('Blocked agent meets contributor?', response.trustCheck?.meets);
  });
}

// ---------------------------------------------------------------------------
// 3. TrustGuardEvaluator
// ---------------------------------------------------------------------------
async function demoEvaluator() {
  console.log('\n─── TrustGuardEvaluator ───');
  const evaluator = createTrustGuardEvaluator({
    agentTrust: mockTrust,
    requiredTier: 'contributor',
  });

  const state: State = {};
  const msg: Memory = { content: { text: TRUSTED_ADDR } };
  await evaluator.handler(runtime, msg, state);
  console.log('Trust guard result:', state.trustGuardResult);
}

// ---------------------------------------------------------------------------
// 4. TrustProvider
// ---------------------------------------------------------------------------
async function demoProvider() {
  console.log('\n─── TrustProvider ───');
  const provider = createTrustProvider({ agentTrust: mockTrust });
  const msg: Memory = { content: { text: `Address: ${TRUSTED_ADDR}` } };
  const context = await provider.get(runtime, msg);
  console.log('Trust context:\n' + context);
}

// ---------------------------------------------------------------------------
// Run all demos
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== ElizaOS Agent Trust Plugin Demo (offline mode) ===');
  await demoPlugin();
  await demoAction();
  await demoEvaluator();
  await demoProvider();
  console.log('\n✅ All demos complete.');
}

main().catch(console.error);
