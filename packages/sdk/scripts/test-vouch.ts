/**
 * Test: Create a vouch attestation
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = 'https://sepolia.base.org';
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';
const VOUCH_SCHEMA_UID = '0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c';

async function main() {
  console.log('🧪 Testing Agent Trust vouch attestation...\n');

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`📍 Attester: ${signer.address}`);

  // Initialize EAS
  const eas = new EAS(EAS_ADDRESS);
  eas.connect(signer);

  // Encode vouch data
  const schemaEncoder = new SchemaEncoder('address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash');
  
  // Vouch for ourselves as a test (agent trusts itself 100%)
  const vouchee = signer.address;
  const trustLevel = 5; // Max trust (1-5 scale)
  const context = 'Genesis vouch - Agent Trust system initialized by Nia';
  const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes('first-attestation'));

  const encodedData = schemaEncoder.encodeData([
    { name: 'vouchee', value: vouchee, type: 'address' },
    { name: 'trustLevel', value: trustLevel, type: 'uint8' },
    { name: 'context', value: context, type: 'string' },
    { name: 'evidenceHash', value: evidenceHash, type: 'bytes32' },
  ]);

  console.log(`\n📝 Creating vouch attestation:`);
  console.log(`   Vouchee: ${vouchee}`);
  console.log(`   Trust Level: ${trustLevel}/5`);
  console.log(`   Context: ${context}`);

  try {
    const tx = await eas.attest({
      schema: VOUCH_SCHEMA_UID,
      data: {
        recipient: vouchee,
        expirationTime: BigInt(0), // No expiration
        revocable: true,
        data: encodedData,
      },
    });

    console.log(`\n⏳ Transaction submitted, waiting for confirmation...`);
    const attestationUid = await tx.wait();
    
    console.log(`\n✅ SUCCESS!`);
    console.log(`   Attestation UID: ${attestationUid}`);
    console.log(`   View on EAS Explorer: https://base-sepolia.easscan.org/attestation/view/${attestationUid}`);
  } catch (error: any) {
    console.log(`\n❌ Error: ${error.message}`);
  }
}

main().catch(console.error);
