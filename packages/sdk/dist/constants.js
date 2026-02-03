"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMAS = exports.NETWORKS = void 0;
/**
 * Network configurations
 */
exports.NETWORKS = {
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
};
/**
 * EAS Schema UIDs (to be registered)
 * These will be populated after schema registration on Base
 */
exports.SCHEMAS = {
    // Agent Verification: "address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt"
    verification: {
        uid: '0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849', // Base Sepolia
        schema: 'address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt',
        revocable: true,
    },
    // Agent Vouch: "address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash"
    vouch: {
        uid: '0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c', // Base Sepolia
        schema: 'address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash',
        revocable: true,
    },
    // Agent Flag: "address flagged, uint8 severity, string reason, bytes32 evidenceHash"
    flag: {
        uid: '0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47', // Base Sepolia
        schema: 'address flagged, uint8 severity, string reason, bytes32 evidenceHash',
        revocable: true,
    },
};
