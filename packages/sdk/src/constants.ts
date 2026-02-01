/**
 * Network configurations
 */
export const NETWORKS = {
  base: {
    chainId: 8453,
    name: 'Base',
    easAddress: '0x4200000000000000000000000000000000000021', // Base EAS
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
    rpcUrl: 'https://mainnet.base.org',
  },
  baseSepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    easAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
    rpcUrl: 'https://sepolia.base.org',
  },
} as const;

/**
 * EAS Schema UIDs (to be registered)
 * These will be populated after schema registration on Base
 */
export const SCHEMAS = {
  // Agent Verification: "address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt"
  verification: {
    uid: '', // TODO: Register and populate
    schema: 'address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt',
    revocable: true,
  },
  
  // Agent Vouch: "address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash"
  vouch: {
    uid: '', // TODO: Register and populate
    schema: 'address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash',
    revocable: true,
  },
  
  // Agent Flag: "address flagged, uint8 severity, string reason, bytes32 evidenceHash"
  flag: {
    uid: '', // TODO: Register and populate
    schema: 'address flagged, uint8 severity, string reason, bytes32 evidenceHash',
    revocable: true,
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;
