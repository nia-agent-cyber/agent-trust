/**
 * Trust Tier Query Functions
 *
 * Functions for fetching attestation data and calculating tiers.
 */
import { NetworkName } from '../constants';
import { TierInfo, TierProgress, AgentStats } from './tier-types';
/**
 * Get the trust tier for an agent
 * @param address Agent's wallet address
 * @param network Network to query
 * @returns Complete tier information
 */
export declare function getTier(address: string, network?: NetworkName): Promise<TierInfo>;
/**
 * Check if an agent meets a minimum tier requirement
 * @param address Agent's wallet address
 * @param minTier Minimum tier required (0-4)
 * @param network Network to query
 * @returns Whether the agent meets the minimum tier
 */
export declare function checkMeetsTier(address: string, minTier: number, network?: NetworkName): Promise<boolean>;
/**
 * Get progress toward the next tier
 * @param address Agent's wallet address
 * @param network Network to query
 * @returns Progress toward next tier (null if at max tier)
 */
export declare function getTierProgress(address: string, network?: NetworkName): Promise<TierProgress | null>;
/**
 * Fetch and calculate agent statistics from attestations
 * @param address Agent's wallet address
 * @param network Network to query
 * @returns Agent statistics for tier calculation
 */
export declare function fetchAgentStats(address: string, network?: NetworkName): Promise<AgentStats>;
/**
 * Clear the tier cache
 * Useful for testing or when fresh data is needed
 */
export declare function clearTierCache(): void;
/**
 * Get cache statistics for debugging
 */
export declare function getTierCacheStats(): {
    size: number;
    entries: Array<{
        address: string;
        tier: number;
        age: number;
    }>;
};
