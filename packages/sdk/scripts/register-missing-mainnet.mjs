/**
 * Register 3 missing EAS schemas on Base Mainnet
 * paymentReliable, taskCompletion, securityAudit
 */

import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = 'https://mainnet.base.org';
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020';

const SCHEMAS = [
  {
    name: 'paymentReliable',
    schema: 'address subjectAgent, uint8 outcome, uint256 amount, string currency, uint64 dueAt, uint64 paidAt, string settlementRef',
    revocable: true,
  },
  {
    name: 'taskCompletion',
    schema: 'address subjectAgent, uint8 outcome, string taskId, string category, uint64 completedAt, uint256 reward, string rewardToken, string taskRef',
    revocable: true,
  },
  {
    name: 'securityAudit',
    schema: 'address auditor, address subject, string auditType, uint8 severity, bool passed, string reportUri, uint64 timestamp',
    revocable: true,
  },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Registering 3 missing schemas on Base Mainnet...\n');

  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY required');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const balance = await provider.getBalance(signer.address);
  console.log(`📍 Address: ${signer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`🔗 Network: Base Mainnet\n`);

  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  const results = {};

  for (let i = 0; i < SCHEMAS.length; i++) {
    const s = SCHEMAS[i];
    console.log(`📝 Registering: ${s.name}`);
    console.log(`   Schema: ${s.schema}`);

    try {
      const tx = await schemaRegistry.register({
        schema: s.schema,
        resolverAddress: ethers.ZeroAddress,
        revocable: s.revocable,
      });

      const uid = await tx.wait();
      console.log(`   ✅ UID: ${uid}`);
      console.log(`   🔗 https://base.easscan.org/schema/view/${uid}\n`);
      results[s.name] = uid;

      if (i < SCHEMAS.length - 1) {
        console.log('   ⏳ Waiting 5s before next...\n');
        await sleep(5000);
      }
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\n✅ All schemas registered!\n');
  console.log('Update constants.ts with these UIDs:');
  for (const [name, uid] of Object.entries(results)) {
    console.log(`  ${name}: '${uid}'`);
  }
}

main().catch(console.error);
