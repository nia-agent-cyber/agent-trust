/**
 * Basic Trust Check Example
 *
 * Demonstrates how to check an agent's trust score and tier.
 */
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const agentTrust = new AgentTrust({ network: 'base', provider });

  const agentAddress = '0x...'; // Replace with target agent address

  // Get trust score
  const score = await agentTrust.getScore(agentAddress);
  console.log(`Trust score: ${score.score}/100`);
  console.log(`Verified: ${score.verified}`);
  console.log(`Vouches: ${score.attestationCount}`);

  // Get tier
  const tier = await agentTrust.getTier(agentAddress);
  console.log(`Tier: ${tier.name}`);

  // Check if agent meets a minimum tier
  const meetsContributor = await agentTrust.meetsTier(agentAddress, 'contributor');
  console.log(`Meets contributor tier: ${meetsContributor}`);
}

main().catch(console.error);
