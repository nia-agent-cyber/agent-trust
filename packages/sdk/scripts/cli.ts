#!/usr/bin/env npx ts-node
/**
 * Agent Trust CLI
 * 
 * Usage:
 *   npx ts-node scripts/cli.ts score <address>     - Get trust score
 *   npx ts-node scripts/cli.ts vouch <address> <level> [context]  - Vouch for agent
 *   npx ts-node scripts/cli.ts flag <address> <severity> <reason> - Flag bad actor
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { getAttestationSummary } from '../src/query';
import { SCHEMAS } from '../src/constants';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = 'https://sepolia.base.org';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';

async function score(address: string) {
  console.log(`\n🔍 Trust Score for ${address}\n`);
  
  const summary = await getAttestationSummary(address, 'baseSepolia');
  
  console.log(`📊 Score: ${summary.trustScore.score}/100`);
  console.log(`   Confidence: ${(summary.trustScore.confidence * 100).toFixed(0)}%`);
  console.log(`   Verified: ${summary.trustScore.verified ? '✅' : '❌'}`);
  console.log(`   Attestations: ${summary.trustScore.attestationCount}`);
  
  if (summary.vouches.length > 0) {
    console.log(`\n👍 Vouches: ${summary.vouches.length}`);
    summary.vouches.forEach(v => {
      console.log(`   • Level ${v.trustLevel}/5 from ${v.attester.slice(0,10)}...`);
    });
  }
  
  if (summary.flags.length > 0) {
    console.log(`\n🚩 Flags: ${summary.flags.length}`);
    summary.flags.forEach(f => {
      console.log(`   • Severity ${f.severity}/5: ${f.reason.slice(0,50)}`);
    });
  }
  
  console.log('');
}

async function vouch(address: string, level: number, context: string) {
  if (!PRIVATE_KEY) {
    console.error('❌ Set PRIVATE_KEY environment variable');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`\n👍 Vouching for ${address}`);
  console.log(`   From: ${signer.address}`);
  console.log(`   Trust Level: ${level}/5`);
  console.log(`   Context: ${context}\n`);
  
  const eas = new EAS(EAS_ADDRESS);
  eas.connect(signer);
  
  const schemaEncoder = new SchemaEncoder(SCHEMAS.vouch.schema);
  const encodedData = schemaEncoder.encodeData([
    { name: 'vouchee', value: address, type: 'address' },
    { name: 'trustLevel', value: level, type: 'uint8' },
    { name: 'context', value: context, type: 'string' },
    { name: 'evidenceHash', value: '0x' + '0'.repeat(64), type: 'bytes32' },
  ]);
  
  const tx = await eas.attest({
    schema: SCHEMAS.vouch.uid,
    data: {
      recipient: address,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });
  
  console.log('⏳ Submitting...');
  const uid = await tx.wait();
  
  console.log(`✅ Vouch created!`);
  console.log(`   UID: ${uid}`);
  console.log(`   View: https://base-sepolia.easscan.org/attestation/view/${uid}\n`);
}

async function flag(address: string, severity: number, reason: string) {
  if (!PRIVATE_KEY) {
    console.error('❌ Set PRIVATE_KEY environment variable');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`\n🚩 Flagging ${address}`);
  console.log(`   From: ${signer.address}`);
  console.log(`   Severity: ${severity}/5`);
  console.log(`   Reason: ${reason}\n`);
  
  const eas = new EAS(EAS_ADDRESS);
  eas.connect(signer);
  
  const schemaEncoder = new SchemaEncoder(SCHEMAS.flag.schema);
  const encodedData = schemaEncoder.encodeData([
    { name: 'flagged', value: address, type: 'address' },
    { name: 'severity', value: severity, type: 'uint8' },
    { name: 'reason', value: reason, type: 'string' },
    { name: 'evidenceHash', value: '0x' + '0'.repeat(64), type: 'bytes32' },
  ]);
  
  const tx = await eas.attest({
    schema: SCHEMAS.flag.uid,
    data: {
      recipient: address,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });
  
  console.log('⏳ Submitting...');
  const uid = await tx.wait();
  
  console.log(`✅ Flag created!`);
  console.log(`   UID: ${uid}`);
  console.log(`   View: https://base-sepolia.easscan.org/attestation/view/${uid}\n`);
}

async function main() {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'score':
      if (!args[0]) {
        console.error('Usage: cli.ts score <address>');
        process.exit(1);
      }
      await score(args[0]);
      break;
      
    case 'vouch':
      if (!args[0] || !args[1]) {
        console.error('Usage: cli.ts vouch <address> <level 1-5> [context]');
        process.exit(1);
      }
      await vouch(args[0], parseInt(args[1]), args.slice(2).join(' ') || 'Vouch');
      break;
      
    case 'flag':
      if (!args[0] || !args[1] || !args[2]) {
        console.error('Usage: cli.ts flag <address> <severity 1-5> <reason>');
        process.exit(1);
      }
      await flag(args[0], parseInt(args[1]), args.slice(2).join(' '));
      break;
      
    default:
      console.log(`
Agent Trust CLI

Commands:
  score <address>                    - Get trust score
  vouch <address> <level> [context]  - Vouch for agent (level 1-5)
  flag <address> <severity> <reason> - Flag bad actor (severity 1-5)

Environment:
  PRIVATE_KEY - Required for vouch/flag operations
`);
  }
}

main().catch(console.error);
