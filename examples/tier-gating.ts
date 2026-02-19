/**
 * Tier Gating Example
 *
 * Shows how to gate actions based on an agent's trust tier.
 * Use this pattern to restrict sensitive operations to reputable agents.
 */
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const agentTrust = new AgentTrust({ network: 'base', provider });

  const callerAddress = '0x...'; // The agent requesting access

  // Example: Only "trusted" or higher agents can execute trades
  if (!(await agentTrust.meetsTier(callerAddress, 'trusted'))) {
    console.error('Access denied: agent must be "trusted" tier or above');
    process.exit(1);
  }

  // Example: Get detailed tier progress
  const progress = await agentTrust.getTierProgress(callerAddress);
  console.log(`Current tier: ${progress.currentTier}`);
  console.log(`Next tier: ${progress.nextTier}`);
  console.log(`Progress: ${JSON.stringify(progress.requirements)}`);

  console.log('Access granted — executing action...');
}

main().catch(console.error);
