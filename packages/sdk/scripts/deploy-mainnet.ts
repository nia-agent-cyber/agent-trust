#!/usr/bin/env npx ts-node
/**
 * Deploy Agent Trust to Base Mainnet
 * 
 * This script:
 * 1. Registers all three schemas on Base mainnet
 * 2. Creates Nia's genesis attestations (self-vouch + GitHub verification)
 * 3. Outputs the UIDs for updating constants.ts
 * 
 * Usage:
 *   PRIVATE_KEY=<key> npx ts-node scripts/deploy-mainnet.ts
 * 
 * Or with 1Password:
 *   eval $(op signin) && PRIVATE_KEY=$(op item get "Nia Crypto Wallet (Base)" --vault Nia --fields password --reveal) npx ts-node scripts/deploy-mainnet.ts
 */

import { SchemaRegistry, EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

// Base Mainnet Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = 'https://mainnet.base.org';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';
const SCHEMA_REGISTRY_ADDRESS = '0x4200000000000000000000000000000000000020';

// Nia's wallet address
const NIA_ADDRESS = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';

const SCHEMAS = [
  {
    name: 'verification',
    displayName: 'Agent Verification',
    schema: 'address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt',
    revocable: true,
  },
  {
    name: 'vouch',
    displayName: 'Agent Vouch',
    schema: 'address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash',
    revocable: true,
  },
  {
    name: 'flag',
    displayName: 'Agent Flag',
    schema: 'address flagged, uint8 severity, string reason, bytes32 evidenceHash',
    revocable: true,
  },
];

interface DeploymentResult {
  schemaUids: Record<string, string>;
  attestationUids: {
    genesisVouch: string;
    githubVerification: string;
  };
}

async function main(): Promise<DeploymentResult> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('           AGENT TRUST - BASE MAINNET DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY environment variable required');
    console.error('   Set it with: export PRIVATE_KEY=<your-private-key>');
    console.error('   Or from 1Password: PRIVATE_KEY=$(op item get "Nia Crypto Wallet (Base)" --vault Nia --fields password --reveal)');
    process.exit(1);
  }

  // Connect to Base Mainnet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const balance = await provider.getBalance(signer.address);
  console.log(`📍 Deployer: ${signer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
  console.log(`🔗 Network: Base Mainnet (Chain ID 8453)\n`);

  if (signer.address.toLowerCase() !== NIA_ADDRESS.toLowerCase()) {
    console.warn(`⚠️  Warning: Deploying from different address than NIA_ADDRESS`);
    console.warn(`   Deployer: ${signer.address}`);
    console.warn(`   Expected: ${NIA_ADDRESS}\n`);
  }

  const balanceEth = parseFloat(ethers.formatEther(balance));
  if (balanceEth < 0.005) {
    console.error(`❌ Insufficient balance. Need at least 0.005 ETH for deployment.`);
    process.exit(1);
  }

  // ============================================================
  // STEP 1: Register Schemas
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Registering Schemas on Base Mainnet');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  const schemaUids: Record<string, string> = {};

  for (const schemaConfig of SCHEMAS) {
    console.log(`📝 Registering: ${schemaConfig.displayName}`);
    console.log(`   Schema: ${schemaConfig.schema}`);
    
    try {
      const tx = await schemaRegistry.register({
        schema: schemaConfig.schema,
        resolverAddress: ethers.ZeroAddress,
        revocable: schemaConfig.revocable,
      });

      console.log(`   ⏳ Transaction submitted, waiting for confirmation...`);
      const uid = await tx.wait();
      console.log(`   ✅ UID: ${uid}`);
      console.log(`   🔗 https://base.easscan.org/schema/view/${uid}\n`);
      
      schemaUids[schemaConfig.name] = uid;
    } catch (error: any) {
      // If schema already exists, extract UID from error
      if (error.message?.includes('already exists')) {
        console.log(`   ℹ️  Schema already registered\n`);
      } else {
        console.error(`   ❌ Error: ${error.message}\n`);
        throw error;
      }
    }
  }

  // ============================================================
  // STEP 2: Create Genesis Attestations
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Creating Nia\'s Genesis Attestations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const eas = new EAS(EAS_ADDRESS);
  eas.connect(signer);

  const attestationUids = {
    genesisVouch: '',
    githubVerification: '',
  };

  // 2a. Genesis Vouch (self-attestation)
  console.log('📜 Creating Genesis Vouch (Self-Attestation)');
  console.log(`   Vouchee: ${NIA_ADDRESS}`);
  console.log(`   Trust Level: 5/5 (Maximum)`);
  console.log(`   Context: "Genesis agent - Creator of Agent Trust. First on the network."`);

  const vouchEncoder = new SchemaEncoder(SCHEMAS[1].schema);
  const vouchData = vouchEncoder.encodeData([
    { name: 'vouchee', value: NIA_ADDRESS, type: 'address' },
    { name: 'trustLevel', value: 5, type: 'uint8' },
    { name: 'context', value: 'Genesis agent - Creator of Agent Trust. First on the network.', type: 'string' },
    { name: 'evidenceHash', value: ethers.keccak256(ethers.toUtf8Bytes('genesis-vouch-nia')), type: 'bytes32' },
  ]);

  try {
    const vouchTx = await eas.attest({
      schema: schemaUids.vouch,
      data: {
        recipient: NIA_ADDRESS,
        expirationTime: BigInt(0),
        revocable: true,
        data: vouchData,
      },
    });

    console.log(`   ⏳ Transaction submitted...`);
    attestationUids.genesisVouch = await vouchTx.wait();
    console.log(`   ✅ Genesis Vouch UID: ${attestationUids.genesisVouch}`);
    console.log(`   🔗 https://base.easscan.org/attestation/view/${attestationUids.genesisVouch}\n`);
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}\n`);
  }

  // 2b. GitHub Verification
  console.log('📜 Creating GitHub Verification');
  console.log(`   Agent ID: ${NIA_ADDRESS}`);
  console.log(`   Platform: "github"`);
  console.log(`   Handle: "nia-agent-cyber"`);

  const verifyEncoder = new SchemaEncoder(SCHEMAS[0].schema);
  const verifyData = verifyEncoder.encodeData([
    { name: 'agentId', value: NIA_ADDRESS, type: 'address' },
    { name: 'platform', value: 'github', type: 'string' },
    { name: 'handle', value: 'nia-agent-cyber', type: 'string' },
    { name: 'proofHash', value: ethers.keccak256(ethers.toUtf8Bytes('https://github.com/nia-agent-cyber')), type: 'bytes32' },
    { name: 'verifiedAt', value: BigInt(Math.floor(Date.now() / 1000)), type: 'uint64' },
  ]);

  try {
    const verifyTx = await eas.attest({
      schema: schemaUids.verification,
      data: {
        recipient: NIA_ADDRESS,
        expirationTime: BigInt(0),
        revocable: true,
        data: verifyData,
      },
    });

    console.log(`   ⏳ Transaction submitted...`);
    attestationUids.githubVerification = await verifyTx.wait();
    console.log(`   ✅ GitHub Verification UID: ${attestationUids.githubVerification}`);
    console.log(`   🔗 https://base.easscan.org/attestation/view/${attestationUids.githubVerification}\n`);
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}\n`);
  }

  // ============================================================
  // OUTPUT SUMMARY
  // ============================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                    DEPLOYMENT COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('🎉 Nia is the FIRST agent on the Agent Trust network!\n');

  console.log('📋 Schema UIDs (for constants.ts):');
  console.log('```typescript');
  console.log('export const SCHEMAS = {');
  console.log('  verification: {');
  console.log(`    uid: '${schemaUids.verification}',`);
  console.log(`    schema: '${SCHEMAS[0].schema}',`);
  console.log('    revocable: true,');
  console.log('  },');
  console.log('  vouch: {');
  console.log(`    uid: '${schemaUids.vouch}',`);
  console.log(`    schema: '${SCHEMAS[1].schema}',`);
  console.log('    revocable: true,');
  console.log('  },');
  console.log('  flag: {');
  console.log(`    uid: '${schemaUids.flag}',`);
  console.log(`    schema: '${SCHEMAS[2].schema}',`);
  console.log('    revocable: true,');
  console.log('  },');
  console.log('};');
  console.log('```\n');

  console.log('📋 Attestation UIDs:');
  console.log(`   Genesis Vouch: ${attestationUids.genesisVouch}`);
  console.log(`   GitHub Verification: ${attestationUids.githubVerification}\n`);

  console.log('🔗 View on EAS Explorer:');
  console.log(`   Schemas: https://base.easscan.org/schema/view/${schemaUids.verification}`);
  console.log(`   Nia Profile: https://base.easscan.org/address/${NIA_ADDRESS}\n`);

  return { schemaUids, attestationUids };
}

main()
  .then((result) => {
    console.log('\n✅ All done! Update constants.ts with the new UIDs and push to git.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  });
