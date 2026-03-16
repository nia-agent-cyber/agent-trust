/**
 * TaskCompletion flow example
 *
 * Demonstrates:
 * 1) Issuing a TaskCompletion attestation for a completed bounty (requires signer/private key)
 * 2) Issuing a TaskCompletion attestation for a failed task
 * 3) Looking up TaskCompletion attestations for a subject agent
 */

import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SUBJECT_AGENT = process.env.SUBJECT_AGENT || '0x0000000000000000000000000000000000000001';

async function run() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const trust = PRIVATE_KEY
    ? new AgentTrust({ network: 'baseSepolia', provider: new ethers.Wallet(PRIVATE_KEY, provider) })
    : new AgentTrust({ network: 'baseSepolia', provider });

  if (PRIVATE_KEY) {
    // Example 1: Completed bounty with reward
    console.log('Issuing TaskCompletion attestation (completed)...');
    const completedResult = await trust.issueTaskCompletion({
      subjectAgent: SUBJECT_AGENT,
      outcome: 'completed',
      taskId: 'gitcoin-bounty-1234',
      category: 'code',
      completedAt: new Date(),
      reward: '500000000', // 500 USDC (6 decimals)
      rewardToken: 'USDC',
      taskRef: 'https://gitcoin.co/bounty/1234',
    });

    if (completedResult.success) {
      console.log('✅ Completed attestation issued:', completedResult.attestationUid);
    } else {
      console.error('❌ Failed to issue completed attestation:', completedResult.error);
    }

    // Example 2: Failed task (no reward)
    console.log('\nIssuing TaskCompletion attestation (failed)...');
    const failedResult = await trust.issueTaskCompletion({
      subjectAgent: SUBJECT_AGENT,
      outcome: 'failed',
      taskId: 'openwork-task-5678',
      category: 'design',
      completedAt: new Date(),
      taskRef: 'https://openwork.com/task/5678',
    });

    if (failedResult.success) {
      console.log('✅ Failed-task attestation issued:', failedResult.attestationUid);
    } else {
      console.error('❌ Failed to issue failed-task attestation:', failedResult.error);
    }
  } else {
    console.log('ℹ️  Set PRIVATE_KEY env var to issue attestations on-chain.');
  }

  // Example 3: Query completions for a subject agent
  console.log(`\nFetching TaskCompletion attestations for ${SUBJECT_AGENT}...`);
  const completions = await trust.getTaskCompletions(SUBJECT_AGENT);

  if (completions.length === 0) {
    console.log('No task completion attestations found for this agent.');
  } else {
    console.log(`Found ${completions.length} attestation(s):\n`);
    for (const att of completions) {
      console.log(`  UID:        ${att.uid}`);
      console.log(`  Outcome:    ${att.outcome}`);
      console.log(`  Task ID:    ${att.taskId}`);
      console.log(`  Category:   ${att.category}`);
      console.log(`  Reward:     ${att.reward} ${att.rewardToken}`);
      console.log(`  Completed:  ${new Date(att.completedAt * 1000).toISOString()}`);
      console.log(`  Ref:        ${att.taskRef || '(none)'}`);
      console.log(`  Revoked:    ${att.revoked}`);
      console.log('');
    }
  }
}

run().catch(console.error);
