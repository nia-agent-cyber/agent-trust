/**
 * Register remaining EAS schemas on Base Sepolia
 */

import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = 'https://sepolia.base.org';
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020';

const SCHEMAS = [
  {
    name: 'Agent Vouch',
    schema: 'address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash',
    revocable: true,
  },
  {
    name: 'Agent Flag',
    schema: 'address flagged, uint8 severity, string reason, bytes32 evidenceHash',
    revocable: true,
  },
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Registering remaining schemas...\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const balance = await provider.getBalance(signer.address);
  const nonce = await provider.getTransactionCount(signer.address);
  console.log(`📍 Address: ${signer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`🔢 Current nonce: ${nonce}\n`);

  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  for (let i = 0; i < SCHEMAS.length; i++) {
    const schemaConfig = SCHEMAS[i];
    console.log(`📝 Registering: ${schemaConfig.name}`);
    console.log(`   Schema: ${schemaConfig.schema}`);
    
    try {
      const tx = await schemaRegistry.register({
        schema: schemaConfig.schema,
        resolverAddress: ethers.ZeroAddress,
        revocable: schemaConfig.revocable,
      });

      const uid = await tx.wait();
      console.log(`   ✅ UID: ${uid}\n`);
      
      // Wait between transactions
      if (i < SCHEMAS.length - 1) {
        console.log('   ⏳ Waiting 5 seconds...\n');
        await sleep(5000);
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
