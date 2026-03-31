/**
 * LangChain Trust Gate Example
 *
 * Demonstrates:
 * 1) TrustCheckTool — look up trust tier of any wallet address
 * 2) TrustGate — block chain execution for addresses below 'contributor' tier
 * 3) createTrustMiddleware — factory for quick setup
 *
 * Runs in offline mode with a mock AgentTrust (no private key or RPC needed).
 * Replace `mockTrust` with a real `AgentTrust` instance for live use.
 */

import { TrustCheckTool, TrustGate, TrustGateError, createTrustMiddleware } from '@nia-agent-cyber/agent-trust-langchain';
import type { AgentTrustLike } from '@nia-agent-cyber/agent-trust-langchain';

// ---------------------------------------------------------------------------
// Mock AgentTrust for offline demo
// Replace with: new AgentTrust({ network: 'baseSepolia', provider })
// ---------------------------------------------------------------------------
const mockTrust: AgentTrustLike = {
  getTier: async (address: string) => {
    // Simulate tier 2 (trusted) for most addresses, 0 (unverified) for the test blocked address
    const isBlocked = address.endsWith('0000');
    return { tier: isBlocked ? 0 : 2 };
  },
  getScore: async (_address: string) => {
    return { score: 72 };
  },
};

// ---------------------------------------------------------------------------
// 1. TrustCheckTool — standalone lookup
// ---------------------------------------------------------------------------
async function demoTrustCheckTool() {
  console.log('\n─── TrustCheckTool Demo ───');

  const tool = new TrustCheckTool({ agentTrust: mockTrust });

  const trustedAddress = '0x' + 'a'.repeat(40);
  const result = await tool._run({ address: trustedAddress, requiredTier: 'contributor' });

  console.log('Checking address:', trustedAddress.slice(0, 10) + '...');
  console.log('Tier:', result.tier.name, `(level ${result.tier.level}, score ${result.tier.score})`);
  console.log('Meets contributor?', result.meets);

  // Also test via invoke (returns JSON string)
  const json = await tool.invoke({ address: trustedAddress });
  console.log('JSON output (first 100 chars):', json.slice(0, 100));
}

// ---------------------------------------------------------------------------
// 2. TrustGate — blocking execution
// ---------------------------------------------------------------------------
async function demoTrustGate() {
  console.log('\n─── TrustGate Demo ───');

  const gate = new TrustGate({
    agentTrust: mockTrust,
    requiredTier: 'contributor',
    addressKey: 'counterpartyAddress',
  });

  // Trusted address → passes through
  const trustedState = { counterpartyAddress: '0x' + 'a'.repeat(40), payload: 'execute trade' };
  const passedState = await gate.invoke(trustedState);
  console.log('Trusted address passed ✅:', (passedState as any).payload);

  // Blocked address (ends with 0000) → throws TrustGateError
  try {
    const blockedState = { counterpartyAddress: '0x' + 'a'.repeat(36) + '0000', payload: 'execute trade' };
    await gate.invoke(blockedState);
  } catch (e) {
    if (e instanceof TrustGateError) {
      console.log(`Blocked address ❌: tier='${e.tier}', required='${e.requiredTier}'`);
    }
  }

  // With onBlocked callback — returns fallback instead of throwing
  const softGate = new TrustGate({
    agentTrust: mockTrust,
    requiredTier: 'trusted',
    onBlocked: (state) => ({ ...state, blocked: true, reason: 'insufficient trust tier' }),
  });

  const softResult = await softGate.invoke({ address: '0x' + 'a'.repeat(36) + '0000' });
  console.log('Soft block result:', softResult);
}

// ---------------------------------------------------------------------------
// 3. createTrustMiddleware factory + pipe
// ---------------------------------------------------------------------------
async function demoMiddlewareFactory() {
  console.log('\n─── createTrustMiddleware + pipe Demo ───');

  const { tool, gate } = createTrustMiddleware({
    agentTrust: mockTrust,
    requiredTier: 'contributor',
  });

  console.log('Tool name:', tool.name);

  // Simulate a downstream tool
  const downstream = {
    invoke: async (state: Record<string, unknown>) => ({
      ...state,
      result: 'downstream processed',
    }),
  };

  const chain = gate.pipe(downstream);
  const result = await chain.invoke({ address: '0x' + 'b'.repeat(40) });
  console.log('Chain result:', result);
}

// ---------------------------------------------------------------------------
// Run all demos
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== LangChain Trust Gate Demo (offline mode) ===');
  try {
    await demoTrustCheckTool();
    await demoTrustGate();
    await demoMiddlewareFactory();
    console.log('\n✅ All demos complete.');
  } catch (e) {
    console.error('Demo error:', e);
    process.exit(1);
  }
}

main();
