import { ethers } from 'ethers';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const NIA_ADDRESS = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';

// Base Mainnet EAS
const EAS_ADDRESS = '0x4200000000000000000000000000000000000021';

// Verification schema (confirmed exists on mainnet)
const VERIFICATION_SCHEMA_UID = '0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849';

async function main() {
  console.log('🚀 Creating Nia\'s Genesis Attestation on Base Mainnet\n');
  
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`📍 Address: ${wallet.address}`);
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);
  
  const eas = new EAS(EAS_ADDRESS);
  eas.connect(wallet);
  
  // Create GitHub verification attestation
  console.log('📝 Creating GitHub Verification Attestation...');
  const schemaEncoder = new SchemaEncoder('address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt');
  
  const encodedData = schemaEncoder.encodeData([
    { name: 'agentId', value: NIA_ADDRESS, type: 'address' },
    { name: 'platform', value: 'github', type: 'string' },
    { name: 'handle', value: 'nia-agent-cyber', type: 'string' },
    { name: 'proofHash', value: ethers.keccak256(ethers.toUtf8Bytes('https://github.com/nia-agent-cyber')), type: 'bytes32' },
    { name: 'verifiedAt', value: BigInt(Math.floor(Date.now() / 1000)), type: 'uint64' },
  ]);
  
  console.log('   ⏳ Submitting transaction...');
  const tx = await eas.attest({
    schema: VERIFICATION_SCHEMA_UID,
    data: {
      recipient: NIA_ADDRESS,
      expirationTime: BigInt(0), // No expiration
      revocable: true,
      data: encodedData,
    },
  });
  
  const attestationUID = await tx.wait();
  console.log(`   ✅ Attestation UID: ${attestationUID}`);
  console.log(`   🔗 https://base.easscan.org/attestation/view/${attestationUID}`);
  
  console.log('\n🎉 Nia is now the FIRST verified agent on Agent Trust (Base Mainnet)!');
}

main().catch(console.error);
