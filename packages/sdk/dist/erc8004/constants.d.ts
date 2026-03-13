/**
 * ERC-8004 Bridge Constants
 *
 * Registry addresses and minimal ABIs for interacting with ERC-8004 contracts.
 * Note: ERC-8004 is still DRAFT. These addresses are placeholders for Base mainnet
 * and will be updated when official deployments are available.
 */
/**
 * Default registry addresses on Base mainnet.
 * These are placeholder/zero addresses until ERC-8004 is officially deployed.
 */
export declare const ERC8004_REGISTRIES: {
    readonly base: {
        readonly identityRegistry: "0x0000000000000000000000000000000000000000";
        readonly reputationRegistry: "0x0000000000000000000000000000000000000000";
        readonly validationRegistry: "0x0000000000000000000000000000000000000000";
    };
    readonly baseSepolia: {
        readonly identityRegistry: "0x0000000000000000000000000000000000000000";
        readonly reputationRegistry: "0x0000000000000000000000000000000000000000";
        readonly validationRegistry: "0x0000000000000000000000000000000000000000";
    };
};
/**
 * Minimal ABI for ERC-8004 Identity Registry (ERC-721 + URI Storage)
 */
export declare const IDENTITY_REGISTRY_ABI: readonly ["function balanceOf(address owner) view returns (uint256)", "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)", "function tokenURI(uint256 tokenId) view returns (string)", "function ownerOf(uint256 tokenId) view returns (address)"];
/**
 * Minimal ABI for ERC-8004 Reputation Registry
 */
export declare const REPUTATION_REGISTRY_ABI: readonly ["function getFeedbackCount(uint256 agentId) view returns (uint256)", "function getAverageRating(uint256 agentId) view returns (uint256)", "function getFeedback(uint256 agentId, uint256 offset, uint256 limit) view returns (tuple(address from, uint8 rating, string comment, uint64 timestamp)[])"];
/**
 * Minimal ABI for ERC-8004 Validation Registry
 */
export declare const VALIDATION_REGISTRY_ABI: readonly ["function getValidationCount(uint256 agentId) view returns (uint256)", "function getPassedCount(uint256 agentId) view returns (uint256)", "function getValidations(uint256 agentId, uint256 offset, uint256 limit) view returns (tuple(address validator, bool passed, string validationType, uint64 timestamp)[])"];
/**
 * Scoring weights for combined reputation calculation
 */
export declare const SCORING_WEIGHTS: {
    /** Agent Trust tier weight (40%) */
    readonly agentTrustTier: 0.4;
    /** ERC-8004 reputation signals weight (30%) */
    readonly erc8004Reputation: 0.3;
    /** Identity completeness weight (15%) */
    readonly identityCompleteness: 0.15;
    /** Validation status weight (15%) */
    readonly validationStatus: 0.15;
};
/** Maximum tier level */
export declare const MAX_TIER = 4;
/** Maximum rating in ERC-8004 reputation (1-5) */
export declare const MAX_RATING = 5;
/** Default number of recent feedback entries to fetch */
export declare const DEFAULT_FEEDBACK_LIMIT = 10;
/** Default number of recent validation results to fetch */
export declare const DEFAULT_VALIDATION_LIMIT = 10;
