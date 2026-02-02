/**
 * Register EAS schemas on Base Sepolia
 * Run with: npx ts-node scripts/register-schemas.ts
 */

import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = 'https://sepolia.base.org';
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020';

const SCHEMAS = [
  {
    name: 'Agent Verification',
    schema: 'address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt',
    revocable: true,
  },
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

async function main() {
  console.log('🚀 Registering Agent Trust schemas on Base Sepolia...\n');

  // Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const balance = await provider.getBalance(signer.address);
  console.log(`📍 Address: ${signer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Initialize Schema Registry
  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  const registeredSchemas: { name: string; uid: string }[] = [];

  for (const schemaConfig of SCHEMAS) {
    console.log(`📝 Registering: ${schemaConfig.name}`);
    console.log(`   Schema: ${schemaConfig.schema}`);
    
    try {
      const tx = await schemaRegistry.register({
        schema: schemaConfig.schema,
        resolverAddress: ethers.ZeroAddress, // No resolver for now
        revocable: schemaConfig.revocable,
      });

      const uid = await tx.wait();
      console.log(`   ✅ UID: ${uid}\n`);
      
      registeredSchemas.push({ name: schemaConfig.name, uid });
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Output results
  console.log('\n═══════════════════════════════════════════════════');
  console.log('                 REGISTRATION COMPLETE              ');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log('Add these to constants.ts:\n');
  console.log('export const SCHEMAS = {');
  
  for (const schema of registeredSchemas) {
    const varName = schema.name.toLowerCase().replace(' ', '').replace('agent', '');
    console.log(`  ${varName}: {`);
    console.log(`    uid: '${schema.uid}',`);
    console.log(`    // ...`);
    console.log(`  },`);
  }
  
  console.log('};\n');
}

main().catch(console.error);
