/**
 * Multi-Agent Reputation Check
 *
 * Compare trust scores across multiple agents to find the most
 * reputable one for a task. Useful for agent marketplaces and
 * orchestration systems.
 */
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

// Example agent addresses (replace with real ones)
const AGENTS = [
  { name: 'Agent Alpha', address: '0x1111111111111111111111111111111111111111' },
  { name: 'Agent Beta', address: '0x2222222222222222222222222222222222222222' },
  { name: 'Agent Gamma', address: '0x3333333333333333333333333333333333333333' },
];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const agentTrust = new AgentTrust({ network: 'base', provider });

  console.log('🔍 Checking reputation for candidate agents...\n');

  const results = await Promise.all(
    AGENTS.map(async (agent) => {
      const score = await agentTrust.getScore(agent.address);
      const tier = await agentTrust.getTier(agent.address);
      return { ...agent, score, tier };
    })
  );

  // Sort by trust score (highest first)
  results.sort((a, b) => b.score.score - a.score.score);

  console.log('Agent                Score   Tier         Verified  Vouches');
  console.log('─────────────────────────────────────────────────────────────');
  for (const r of results) {
    const verified = r.score.verified ? '✅' : '❌';
    console.log(
      `${r.name.padEnd(20)} ${String(r.score.score).padStart(3)}/100  ${r.tier.name.padEnd(12)} ${verified}        ${r.score.attestationCount}`
    );
  }

  // Pick the best agent
  const best = results[0];
  console.log(`\n🏆 Most reputable: ${best.name} (${best.tier.name}, score ${best.score.score}/100)`);

  // Gate: only use agents that are at least "contributor" tier
  const qualified = results.filter((r) => r.tier.name !== 'new');
  if (qualified.length === 0) {
    console.log('⚠️  No agents meet minimum reputation threshold');
  } else {
    console.log(`✅ ${qualified.length} agent(s) qualify for task assignment`);
  }
}

main().catch(console.error);
