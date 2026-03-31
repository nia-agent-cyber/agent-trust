/**
 * SecurityAudit flow example
 *
 * Demonstrates:
 * 1) Issuing a SecurityAudit attestation for a smart-contract audit (requires signer/private key)
 * 2) Issuing a SecurityAudit attestation for a passing dependency scan
 * 3) Looking up SecurityAudit attestations for a subject address
 */

import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL || 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SUBJECT = process.env.SUBJECT_ADDRESS || '0x0000000000000000000000000000000000000001';

async function run() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const trust = PRIVATE_KEY
    ? new AgentTrust({ network: 'baseSepolia', provider: new ethers.Wallet(PRIVATE_KEY, provider) })
    : new AgentTrust({ network: 'baseSepolia', provider });

  if (PRIVATE_KEY) {
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const auditorAddress = signer.address;

    // Example 1: Smart-contract audit with critical findings — FAILED
    console.log('Issuing SecurityAudit attestation (smart-contract, critical, failed)...');
    const criticalResult = await trust.issueSecurityAudit({
      auditor: auditorAddress,
      subject: SUBJECT,
      auditType: 'smart-contract',
      severity: 'critical',
      passed: false,
      reportUri: 'ipfs://QmExampleCriticalReport',
      timestamp: new Date(),
    });

    if (criticalResult.success) {
      console.log('✅ Critical audit attestation issued:', criticalResult.attestationUid);
    } else {
      console.error('❌ Failed to issue critical audit attestation:', criticalResult.error);
    }

    // Example 2: Dependency scan with no findings — PASSED
    console.log('\nIssuing SecurityAudit attestation (dependency-scan, none, passed)...');
    const cleanResult = await trust.issueSecurityAudit({
      auditor: auditorAddress,
      subject: SUBJECT,
      auditType: 'dependency-scan',
      severity: 'none',
      passed: true,
      reportUri: 'https://audit.example.com/dep-scan/2024-Q1',
      timestamp: new Date(),
    });

    if (cleanResult.success) {
      console.log('✅ Clean dependency-scan attestation issued:', cleanResult.attestationUid);
    } else {
      console.error('❌ Failed to issue clean audit attestation:', cleanResult.error);
    }

    // Example 3: Penetration test with high findings — FAILED
    console.log('\nIssuing SecurityAudit attestation (penetration-test, high, failed)...');
    const pentestResult = await trust.issueSecurityAudit({
      auditor: auditorAddress,
      subject: SUBJECT,
      auditType: 'penetration-test',
      severity: 3, // numeric "high"
      passed: false,
    });

    if (pentestResult.success) {
      console.log('✅ Penetration-test attestation issued:', pentestResult.attestationUid);
    } else {
      console.error('❌ Failed to issue penetration-test attestation:', pentestResult.error);
    }
  } else {
    console.log('ℹ️  Set PRIVATE_KEY env var to issue attestations on-chain.');
  }

  // Example 4: Query security audits for a subject address
  console.log(`\nFetching SecurityAudit attestations for ${SUBJECT}...`);
  const audits = await trust.getSecurityAudits(SUBJECT);

  if (audits.length === 0) {
    console.log('No security audit attestations found for this address.');
  } else {
    console.log(`Found ${audits.length} attestation(s):\n`);
    for (const audit of audits) {
      console.log(`  UID:        ${audit.uid}`);
      console.log(`  Auditor:    ${audit.auditor}`);
      console.log(`  Subject:    ${audit.subject}`);
      console.log(`  Audit Type: ${audit.auditType}`);
      console.log(`  Severity:   ${audit.severity}`);
      console.log(`  Passed:     ${audit.passed}`);
      console.log(`  Report URI: ${audit.reportUri || '(none)'}`);
      console.log(`  Timestamp:  ${new Date(audit.timestamp * 1000).toISOString()}`);
      console.log(`  Revoked:    ${audit.revoked}`);
      console.log('');
    }
  }
}

run().catch(console.error);
