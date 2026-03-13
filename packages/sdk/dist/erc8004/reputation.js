"use strict";
/**
 * ERC-8004 Reputation Registry Reader
 *
 * Reads agent reputation/feedback data from ERC-8004 Reputation Registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getERC8004Reputation = getERC8004Reputation;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
/**
 * Fetch ERC-8004 reputation for an agent from the Reputation Registry.
 *
 * @param agentId - Agent token ID in the Identity Registry
 * @param registryAddress - Reputation registry contract address
 * @param provider - Ethers provider
 * @param limit - Maximum number of recent feedback entries to fetch
 * @returns ERC8004Reputation data
 */
async function getERC8004Reputation(agentId, registryAddress, provider, limit = constants_1.DEFAULT_FEEDBACK_LIMIT) {
    // Skip if registry is zero address (not deployed)
    if (registryAddress === ethers_1.ethers.ZeroAddress) {
        return null;
    }
    try {
        const contract = new ethers_1.ethers.Contract(registryAddress, constants_1.REPUTATION_REGISTRY_ABI, provider);
        const feedbackCount = await contract.getFeedbackCount(agentId);
        const count = Number(feedbackCount);
        if (count === 0) {
            return {
                feedbackCount: 0,
                averageRating: null,
                recentFeedback: [],
            };
        }
        const avgRating = await contract.getAverageRating(agentId);
        // Fetch recent feedback (last N entries)
        const offset = Math.max(0, count - limit);
        const fetchLimit = Math.min(count, limit);
        const rawFeedback = await contract.getFeedback(agentId, offset, fetchLimit);
        const recentFeedback = rawFeedback.map((entry) => ({
            from: entry.from,
            rating: Number(entry.rating),
            comment: entry.comment,
            timestamp: Number(entry.timestamp),
        }));
        return {
            feedbackCount: count,
            averageRating: Number(avgRating) / 100, // Assume 2 decimal places on-chain
            recentFeedback,
        };
    }
    catch {
        // Contract call failed — registry may not be deployed
        return null;
    }
}
