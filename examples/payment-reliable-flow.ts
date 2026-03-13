/**
 * PaymentReliable flow example
 *
 * Demonstrates:
 * 1) Issuing a PaymentReliable attestation (requires signer/private key)
 * 2) Looking up PaymentReliable attestations for the subject agent
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
    console.log('Issuing PaymentReliable attestation...');
    const issueResult = await trust.issuePaymentReliable({
      subjectAgent: SUBJECT_AGENT,
      outcome: 'paid_on_time',
      amount: '1500000', // base units (e.g. 1.5 USDC if 6 decimals)
      currency: 'USDC',
      dueAt: Math.floor(Date.now() / 1000) + 3600,
      paidAt: Math.floor(Date.now() / 1000),
      settlementRef: 'invoice-2026-03-12-001',
    });

    if (!issueResult.success) {
      console.error('Issue failed:', issueResult.error);
    } else {
      console.log('Issued UID:', issueResult.attestationUid);
      console.log('Tx hash:', issueResult.txHash);
    }
  } else {
    console.log('Skipping issue step (set PRIVATE_KEY to enable write flow).');
  }

  console.log('\nLooking up PaymentReliable attestations...');
  const attestations = await trust.getPaymentReliability(SUBJECT_AGENT);

  if (attestations.length === 0) {
    console.log('No PaymentReliable attestations found.');
    return;
  }

  for (const att of attestations) {
    console.log(`- ${att.uid}`);
    console.log(`  outcome=${att.outcome} amount=${att.amount} ${att.currency}`);
    console.log(`  dueAt=${att.dueAt} paidAt=${att.paidAt}`);
    if (att.settlementRef) console.log(`  settlementRef=${att.settlementRef}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
