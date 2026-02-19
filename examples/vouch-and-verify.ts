/**
 * Vouch and Verify Example
 *
 * Demonstrates the full flow: verify identity, vouch for an agent,
 * then check updated reputation.
 */
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

async function main() {
  // Use a signer for write operations
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const agentTrust = new AgentTrust({ network: 'base', provider, signer });

  // Step 1: Generate a Twitter verification challenge
  const myAddress = await signer.getAddress();
  const challenge = agentTrust.generateTwitterChallenge(myAddress, 'my_twitter');
  console.log(`Post this tweet: "${challenge.message}"`);

  // Step 2: After posting, complete verification
  // const verification = await agentTrust.completeTwitterVerification({
  //   tweetUrl: 'https://twitter.com/my_twitter/status/...',
  //   challenge,
  // });

  // Step 3: Vouch for another agent
  const vouchResult = await agentTrust.vouch({
    agentId: '0xOtherAgent',
    trustLevel: 4,
    context: 'Reliable collaborator on DeFi project',
  });
  console.log(`Vouch attestation: ${vouchResult.uid}`);

  // Step 4: Check the other agent's updated score
  const score = await agentTrust.getScore('0xOtherAgent');
  console.log(`Their trust score: ${score.score}/100`);
}

main().catch(console.error);
