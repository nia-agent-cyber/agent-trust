/**
 * Register TaskCompletion schema on Base Sepolia
 * Run with: PRIVATE_KEY=<key> npx ts-node scripts/register-task-completion.ts
 */

import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = 'https://sepolia.base.org';
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020';

const SCHEMA = {
  name: 'TaskCompletion',
  schema: 'address subjectAgent, uint8 outcome, string taskId, string category, uint64 completedAt, uint256 reward, string rewardToken, string taskRef',
  revocable: true,
};

async function main() {
  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🚀 Registering TaskCompletion schema on Base Sepolia...\n');

  // Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const balance = await provider.getBalance(signer.address);
  console.log(`📍 Address: ${signer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    console.error('❌ Insufficient balance. Please fund your address with Base Sepolia ETH.');
    console.error('   Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
    process.exit(1);
  }

  // Initialize Schema Registry
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  console.log(`📝 Registering: ${SCHEMA.name}`);
  console.log(`   Schema: ${SCHEMA.schema}`);
  console.log(`   Revocable: ${SCHEMA.revocable}\n`);

  try {
    const tx = await schemaRegistry.register({
      schema: SCHEMA.schema,
      resolverAddress: ethers.ZeroAddress, // No resolver for now
      revocable: SCHEMA.revocable,
    });

    const uid = await tx.wait();
    console.log(`   ✅ Registration complete!\n`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('            REGISTRATION SUCCESSFUL                ');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('Schema UID:', uid);
    console.log('\nUpdate packages/sdk/src/constants.ts:\n');
    console.log('  taskCompletion: {');
    console.log(`    uid: '${uid}',`);
    console.log(`    schema: '${SCHEMA.schema}',`);
    console.log(`    revocable: ${SCHEMA.revocable},`);
    console.log('  },\n');

    console.log(`View on Base Sepolia EAS: https://base-sepolia.easscan.org/schema/view/${uid}\n`);
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
