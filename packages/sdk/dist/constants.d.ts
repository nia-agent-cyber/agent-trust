/**
 * Network configurations
 */
export declare const NETWORKS: {
    readonly base: {
        readonly chainId: 8453;
        readonly name: "Base";
        readonly easAddress: "0x4200000000000000000000000000000000000021";
        readonly schemaRegistryAddress: "0x4200000000000000000000000000000000000020";
        readonly rpcUrl: "https://mainnet.base.org";
    };
    readonly baseSepolia: {
        readonly chainId: 84532;
        readonly name: "Base Sepolia";
        readonly easAddress: "0x4200000000000000000000000000000000000021";
        readonly schemaRegistryAddress: "0x4200000000000000000000000000000000000020";
        readonly rpcUrl: "https://sepolia.base.org";
    };
};
/**
 * EAS Schema UIDs (to be registered)
 * These will be populated after schema registration on Base
 */
export declare const SCHEMAS: {
    readonly verification: {
        readonly uid: "0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849";
        readonly schema: "address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt";
        readonly revocable: true;
    };
    readonly vouch: {
        readonly uid: "0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c";
        readonly schema: "address vouchee, uint8 trustLevel, string context, bytes32 evidenceHash";
        readonly revocable: true;
    };
    readonly flag: {
        readonly uid: "0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47";
        readonly schema: "address flagged, uint8 severity, string reason, bytes32 evidenceHash";
        readonly revocable: true;
    };
};
export type NetworkName = keyof typeof NETWORKS;
