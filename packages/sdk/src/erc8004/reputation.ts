/**
 * ERC-8004 Reputation Registry Reader
 *
 * Reads agent reputation/feedback data from ERC-8004 Reputation Registry.
 */

import { ethers } from 'ethers';
import { ERC8004Reputation, FeedbackEntry } from './types';
import { REPUTATION_REGISTRY_ABI, DEFAULT_FEEDBACK_LIMIT } from './constants';

/**
 * Fetch ERC-8004 reputation for an agent from the Reputation Registry.
 *
 * @param agentId - Agent token ID in the Identity Registry
 * @param registryAddress - Reputation registry contract address
 * @param provider - Ethers provider
 * @param limit - Maximum number of recent feedback entries to fetch
 * @returns ERC8004Reputation data
 */
export async function getERC8004Reputation(
  agentId: number,
  registryAddress: string,
  provider: ethers.Provider,
  limit: number = DEFAULT_FEEDBACK_LIMIT,
): Promise<ERC8004Reputation | null> {
  // Skip if registry is zero address (not deployed)
  if (registryAddress === ethers.ZeroAddress) {
    return null;
  }

  try {
    const contract = new ethers.Contract(registryAddress, REPUTATION_REGISTRY_ABI, provider);

    const feedbackCount: bigint = await contract.getFeedbackCount(agentId);
    const count = Number(feedbackCount);

    if (count === 0) {
      return {
        feedbackCount: 0,
        averageRating: null,
        recentFeedback: [],
      };
    }

    const avgRating: bigint = await contract.getAverageRating(agentId);

    // Fetch recent feedback (last N entries)
    const offset = Math.max(0, count - limit);
    const fetchLimit = Math.min(count, limit);
    const rawFeedback = await contract.getFeedback(agentId, offset, fetchLimit);

    const recentFeedback: FeedbackEntry[] = rawFeedback.map((entry: any) => ({
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
  } catch {
    // Contract call failed — registry may not be deployed
    return null;
  }
}
