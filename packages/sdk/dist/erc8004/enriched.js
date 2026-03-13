"use strict";
/**
 * ERC-8004 Enriched Profile
 *
 * Combines ERC-8004 registry data with Agent Trust reputation scoring
 * to produce a unified enriched agent profile.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCombinedScore = calculateCombinedScore;
exports.generateSummary = generateSummary;
exports.buildEnrichedProfile = buildEnrichedProfile;
const constants_1 = require("./constants");
const identity_1 = require("./identity");
const reputation_1 = require("./reputation");
const validation_1 = require("./validation");
/**
 * Calculate a combined reputation score (0-100) from all data sources.
 *
 * Weights:
 * - Agent Trust tier: 40%
 * - ERC-8004 reputation signals: 30%
 * - Identity completeness: 15%
 * - Validation status: 15%
 */
function calculateCombinedScore(tier, identity, reputation, validation) {
    // Agent Trust tier component (0-100)
    const tierScore = (tier.tier / constants_1.MAX_TIER) * 100;
    // ERC-8004 reputation component (0-100)
    let reputationScore = 0;
    if (reputation && reputation.averageRating !== null) {
        reputationScore = (reputation.averageRating / constants_1.MAX_RATING) * 100;
    }
    // Identity completeness component (0-100)
    let identityScore = 0;
    if (identity) {
        identityScore += 50; // Has identity NFT
        if (identity.tokenURI)
            identityScore += 20; // Has tokenURI
        if (identity.metadata)
            identityScore += 30; // Metadata resolves
    }
    // Validation component (0-100)
    let validationScore = 0;
    if (validation && validation.validationCount > 0) {
        validationScore = (validation.passedCount / validation.validationCount) * 100;
    }
    const combined = tierScore * constants_1.SCORING_WEIGHTS.agentTrustTier +
        reputationScore * constants_1.SCORING_WEIGHTS.erc8004Reputation +
        identityScore * constants_1.SCORING_WEIGHTS.identityCompleteness +
        validationScore * constants_1.SCORING_WEIGHTS.validationStatus;
    return Math.round(Math.min(100, Math.max(0, combined)));
}
/**
 * Generate a human-readable summary for the enriched profile.
 */
function generateSummary(address, tier, identity, reputation, combinedScore) {
    const parts = [];
    // Identity status
    if (identity) {
        const name = identity.metadata?.name || `Agent #${identity.agentId}`;
        parts.push(`${name} is registered on ERC-8004`);
    }
    else {
        parts.push(`${address.slice(0, 8)}...${address.slice(-6)} has no ERC-8004 identity`);
    }
    // Trust tier
    parts.push(`Trust tier: ${tier.emoji} ${tier.name}`);
    // Reputation
    if (reputation && reputation.averageRating !== null) {
        parts.push(`ERC-8004 rating: ${reputation.averageRating.toFixed(1)}/5 (${reputation.feedbackCount} reviews)`);
    }
    // Combined score
    parts.push(`Combined score: ${combinedScore}/100`);
    return parts.join('. ') + '.';
}
/**
 * Build an enriched agent profile combining ERC-8004 and Agent Trust data.
 *
 * @param address - Agent wallet address
 * @param provider - Ethers provider for on-chain reads
 * @param network - Network name (base or baseSepolia)
 * @param tierInfo - Pre-fetched TierInfo from Agent Trust
 * @param trustScore - Pre-fetched TrustScore from Agent Trust
 * @param attestationCount - Total attestation count from Agent Trust
 * @param config - Optional ERC-8004 registry address overrides
 */
async function buildEnrichedProfile(address, provider, network, tierInfo, trustScore, attestationCount, config) {
    const registries = constants_1.ERC8004_REGISTRIES[network] || constants_1.ERC8004_REGISTRIES.base;
    const identityRegistry = config?.identityRegistry || registries.identityRegistry;
    const reputationRegistry = config?.reputationRegistry || registries.reputationRegistry;
    const validationRegistry = config?.validationRegistry || registries.validationRegistry;
    // Fetch ERC-8004 data in parallel
    const identity = await (0, identity_1.getERC8004Identity)(address, identityRegistry, provider);
    let reputation = null;
    let validation = null;
    if (identity) {
        [reputation, validation] = await Promise.all([
            (0, reputation_1.getERC8004Reputation)(identity.agentId, reputationRegistry, provider),
            (0, validation_1.getERC8004Validation)(identity.agentId, validationRegistry, provider),
        ]);
    }
    const combinedScore = calculateCombinedScore(tierInfo, identity, reputation, validation);
    const summary = generateSummary(address, tierInfo, identity, reputation, combinedScore);
    return {
        address,
        erc8004: {
            registered: identity !== null,
            identity,
            reputation,
            validation,
        },
        agentTrust: {
            tier: tierInfo,
            score: trustScore,
            attestationCount,
        },
        combined: {
            hasOnChainIdentity: identity !== null,
            trustTier: tierInfo.name,
            reputationScore: combinedScore,
            summary,
        },
    };
}
