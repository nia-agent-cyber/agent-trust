/**
 * LangChain Trust-Gated Agent Example
 *
 * Demonstrates how to use @nia-agent-cyber/agent-trust-langchain to:
 *   1. Add TrustCheckTool to a LangChain agent's tool list
 *   2. Gate a "high-risk operation" with RunnableTrustGate in a chain
 *   3. Use TrustGuard.check() for imperative trust checks
 *
 * Runs in read-only mode — no private key required.
 *
 * Usage:
 *   npx tsx langchain-trust-gated-agent.ts
 */

import { ethers } from 'ethers';

// ─── Mock implementations for offline demonstration ───────────────────────────
// In production, use the real AgentTrust from @nia-agent-cyber/agent-trust-sdk

/**
 * A mock AgentTrust that returns preset tier/score data without network calls.
 * Replace with `new AgentTrust({ network: 'base', provider })` in production.
 */
class MockAgentTrust {
  private readonly agentDatabase: Record<string, { tier: number; score: number }> = {
    '0xGoldAgent000000000000000000000000000000000': { tier: 3, score: 85 },  // gold
    '0xBronzeAgent00000000000000000000000000000000': { tier: 1, score: 35 }, // bronze
    '0xNewAgent000000000000000000000000000000000000': { tier: 0, score: 5 }, // unverified
  };

  async getTier(address: string): Promise<{ tier: number; name: string }> {
    const names = ['New', 'Contributor', 'Trusted', 'Verified', 'Expert'];
    const data = this.agentDatabase[address] ?? { tier: 0, score: 0 };
    return { tier: data.tier, name: names[data.tier] ?? 'Unknown' };
  }

  async getScore(address: string): Promise<{ score: number }> {
    const data = this.agentDatabase[address] ?? { tier: 0, score: 0 };
    return { score: data.score };
  }
}

// ─── Import integration classes ───────────────────────────────────────────────
// In a real project these come from the installed package:
// import { TrustCheckTool, TrustGuard, RunnableTrustGate, TrustCheckFailedError }
//   from '@nia-agent-cyber/agent-trust-langchain';

import {
  TrustCheckTool,
  TrustGuard,
  RunnableTrustGate,
  TrustCheckFailedError,
  TIER_ORDER,
} from '../packages/langchain/src/index.js';

import { RunnableLambda } from '@langchain/core/runnables';

// ─── Setup ────────────────────────────────────────────────────────────────────

const agentTrust = new MockAgentTrust();

const GOLD_AGENT   = '0xGoldAgent000000000000000000000000000000000';
const BRONZE_AGENT = '0xBronzeAgent00000000000000000000000000000000';
const NEW_AGENT    = '0xNewAgent000000000000000000000000000000000000';

// ─── Part 1: TrustCheckTool ───────────────────────────────────────────────────

console.log('\n════════════════════════════════════════════');
console.log('  Part 1: TrustCheckTool');
console.log('════════════════════════════════════════════\n');

// The TrustCheckTool can be added to any LangChain agent's tool list.
// The agent uses it to look up trust tiers before proceeding with actions.
const trustCheckTool = new TrustCheckTool(agentTrust);

console.log(`Tool name:        ${trustCheckTool.name}`);
console.log(`Tool description: ${trustCheckTool.description}\n`);

// Check gold agent — should pass silver requirement
const goldResult = JSON.parse(
  await trustCheckTool._call({ agentAddress: GOLD_AGENT, minTier: 'silver' }),
);
console.log('Gold agent check (requires silver):');
console.log(`  address: ${goldResult.address.slice(0, 20)}...`);
console.log(`  tier:    ${goldResult.tier}`);
console.log(`  score:   ${goldResult.score}`);
console.log(`  passed:  ${goldResult.passed}`);
console.log(`  reason:  ${goldResult.reason}\n`);

// Check new agent — should fail bronze requirement
const newResult = JSON.parse(
  await trustCheckTool._call({ agentAddress: NEW_AGENT, minTier: 'bronze' }),
);
console.log('New agent check (requires bronze):');
console.log(`  tier:   ${newResult.tier}`);
console.log(`  passed: ${newResult.passed}`);
console.log(`  reason: ${newResult.reason}\n`);

// ─── Part 2: RunnableTrustGate in a chain ─────────────────────────────────────

console.log('════════════════════════════════════════════');
console.log('  Part 2: RunnableTrustGate in a chain');
console.log('════════════════════════════════════════════\n');

// A simulated "high-risk operation" runnable
const highRiskOperation = RunnableLambda.from(async (input: unknown) => {
  const inp = input as { operation: string };
  console.log(`  ✅ Executing high-risk operation: ${inp.operation}`);
  return { success: true, operation: inp.operation, executedAt: new Date().toISOString() };
});

// Chain for gold agent (will succeed)
const gatedChainForGold = new RunnableTrustGate({
  agentAddress: GOLD_AGENT,
  minTier: 'silver',
  agentTrust,
}).pipe(highRiskOperation);

console.log('Running chain with gold agent (requires silver)...');
try {
  const result = await gatedChainForGold.invoke({ operation: 'transfer-10-ETH' });
  console.log(`  Result: ${JSON.stringify(result)}\n`);
} catch (err) {
  console.log(`  ❌ Blocked: ${(err as Error).message}\n`);
}

// Chain for new agent (will be blocked)
const gatedChainForNew = new RunnableTrustGate({
  agentAddress: NEW_AGENT,
  minTier: 'bronze',
  agentTrust,
}).pipe(highRiskOperation);

console.log('Running chain with new agent (requires bronze)...');
try {
  const result = await gatedChainForNew.invoke({ operation: 'transfer-10-ETH' });
  console.log(`  Result: ${JSON.stringify(result)}\n`);
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.log(`  ❌ Trust gate blocked execution:`);
    console.log(`     Address:       ${err.address.slice(0, 20)}...`);
    console.log(`     Agent tier:    ${err.tier}`);
    console.log(`     Required tier: ${err.requiredTier}\n`);
  } else {
    throw err;
  }
}

// ─── Part 3: TrustGuard.check() — imperative ─────────────────────────────────

console.log('════════════════════════════════════════════');
console.log('  Part 3: TrustGuard.check() (imperative)');
console.log('════════════════════════════════════════════\n');

const guard = new TrustGuard(agentTrust);

// Bronze agent — gate at gold
console.log('Checking bronze agent against gold requirement...');
try {
  await guard.check(BRONZE_AGENT, { minTier: 'gold' });
  console.log('  ✅ Passed\n');
} catch (err) {
  if (err instanceof TrustCheckFailedError) {
    console.log(`  ❌ Blocked: ${err.message}\n`);
  }
}

// Gold agent — gate at bronze (should pass)
console.log('Checking gold agent against bronze requirement...');
try {
  const result = await guard.check(GOLD_AGENT, { minTier: 'bronze' });
  console.log(`  ✅ Passed! Tier: ${result.tier}, Score: ${result.score}\n`);
} catch (err) {
  console.log(`  ❌ Blocked: ${(err as Error).message}\n`);
}

// Static version
console.log('Using static TrustGuard.check() for a one-off check...');
try {
  const result = await TrustGuard.check(agentTrust, GOLD_AGENT, { minTier: 'silver' });
  console.log(`  ✅ Passed! Tier: ${result.tier}, Score: ${result.score}\n`);
} catch (err) {
  console.log(`  ❌ Blocked: ${(err as Error).message}\n`);
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('════════════════════════════════════════════');
console.log('  Summary: Tier Order');
console.log('════════════════════════════════════════════\n');
console.log(`Tier order (lowest → highest): ${TIER_ORDER.join(' < ')}\n`);
console.log('Done! ✅');
