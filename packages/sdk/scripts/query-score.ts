/**
 * Query an agent's trust score
 * Usage: npx ts-node scripts/query-score.ts [address]
 */

import { getAttestationSummary } from '../src/query';

const DEFAULT_ADDRESS = '0xC0D7CA6B3C1EF108696ced64F97729177F823189'; // Nia's address

async function main() {
  const address = process.argv[2] || DEFAULT_ADDRESS;
  
  console.log(`\n🔍 Querying trust score for: ${address}\n`);
  console.log('━'.repeat(60));

  try {
    const summary = await getAttestationSummary(address, 'baseSepolia');

    console.log(`\n📊 TRUST SCORE: ${summary.trustScore.score}/100`);
    console.log(`   Confidence: ${(summary.trustScore.confidence * 100).toFixed(0)}%`);
    console.log(`   Verified: ${summary.trustScore.verified ? '✅' : '❌'}`);
    console.log(`   Total attestations: ${summary.trustScore.attestationCount}`);

    if (summary.trustScore.linkedPlatforms.length > 0) {
      console.log(`   Linked platforms: ${summary.trustScore.linkedPlatforms.join(', ')}`);
    }

    console.log('\n' + '━'.repeat(60));

    if (summary.verifications.length > 0) {
      console.log(`\n✅ VERIFICATIONS (${summary.verifications.length}):`);
      for (const v of summary.verifications) {
        console.log(`   • ${v.platform}: @${v.handle}`);
        console.log(`     by ${v.attester.slice(0, 10)}...`);
      }
    }

    if (summary.vouches.length > 0) {
      console.log(`\n👍 VOUCHES (${summary.vouches.length}):`);
      for (const v of summary.vouches) {
        console.log(`   • Trust level: ${v.trustLevel}/5`);
        console.log(`     "${v.context}"`);
        console.log(`     by ${v.attester.slice(0, 10)}...`);
      }
    }

    if (summary.flags.length > 0) {
      console.log(`\n🚩 FLAGS (${summary.flags.length}):`);
      for (const f of summary.flags) {
        console.log(`   • Severity: ${f.severity}/5`);
        console.log(`     "${f.reason}"`);
        console.log(`     by ${f.attester.slice(0, 10)}...`);
      }
    }

    if (summary.trustScore.attestationCount === 0) {
      console.log('\n⚠️  No attestations found for this address.');
      console.log('   This agent has no trust history yet.');
    }

    console.log('\n');
  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}\n`);
  }
}

main();
