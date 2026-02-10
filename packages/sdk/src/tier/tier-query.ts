/**
 * Trust Tier Query Functions
 * 
 * Functions for fetching attestation data and calculating tiers.
 */

import { ethers } from 'ethers';
import { NetworkName, NETWORKS } from '../constants';
import { fetchAttestationsForAgent } from '../query';
import {
  TierInfo,
  TierProgress,
  AgentStats,
  VouchInfo,
} from './tier-types';
import {
  calculateTier,
  calculateApprovalRate,
  calculateDaysActive,
  countQualifiedVouches,
  getTierInfo,
  getTierProgressToward,
  meetsTier as meetsTierFromStats,
  getDefaultAgentStats,
} from './tier-calculation';
import { TIER_REQUIREMENTS, MAX_TIER, DECAY_CONFIG } from './tier-constants';

// EAS GraphQL endpoints
const GRAPHQL_ENDPOINTS: Record<NetworkName, string> = {
  base: 'https://base.easscan.org/graphql',
  baseSepolia: 'https://base-sepolia.easscan.org/graphql',
};

/**
 * Cache for tier calculations to avoid duplicate API calls
 */
const tierCache = new Map<string, { tierInfo: TierInfo; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Get the trust tier for an agent
 * @param address Agent's wallet address
 * @param network Network to query
 * @returns Complete tier information
 */
export async function getTier(
  address: string,
  network: NetworkName = 'base'
): Promise<TierInfo> {
  // Validate address
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid address: must be a valid Ethereum address');
  }

  // Check cache
  const cacheKey = `${address.toLowerCase()}-${network}`;
  const cached = tierCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.tierInfo;
  }

  // Fetch attestations and calculate stats
  const stats = await fetchAgentStats(address, network);
  
  // Calculate tier info
  const tierInfo = getTierInfo(stats);
  
  // Cache result
  tierCache.set(cacheKey, { tierInfo, timestamp: Date.now() });
  
  return tierInfo;
}

/**
 * Check if an agent meets a minimum tier requirement
 * @param address Agent's wallet address
 * @param minTier Minimum tier required (0-4)
 * @param network Network to query
 * @returns Whether the agent meets the minimum tier
 */
export async function checkMeetsTier(
  address: string,
  minTier: number,
  network: NetworkName = 'base'
): Promise<boolean> {
  // Validate address
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid address: must be a valid Ethereum address');
  }

  // Validate tier
  if (minTier < 0 || minTier > MAX_TIER) {
    throw new Error(`Invalid tier: must be between 0 and ${MAX_TIER}`);
  }

  const stats = await fetchAgentStats(address, network);
  return meetsTierFromStats(stats, minTier);
}

/**
 * Get progress toward the next tier
 * @param address Agent's wallet address
 * @param network Network to query
 * @returns Progress toward next tier (null if at max tier)
 */
export async function getTierProgress(
  address: string,
  network: NetworkName = 'base'
): Promise<TierProgress | null> {
  // Validate address
  if (!ethers.isAddress(address)) {
    throw new Error('Invalid address: must be a valid Ethereum address');
  }

  const stats = await fetchAgentStats(address, network);
  const currentTier = calculateTier(stats);
  
  if (currentTier >= MAX_TIER) {
    return null; // Already at max tier
  }
  
  return getTierProgressToward(stats, currentTier + 1);
}

/**
 * Fetch and calculate agent statistics from attestations
 * @param address Agent's wallet address
 * @param network Network to query
 * @returns Agent statistics for tier calculation
 */
export async function fetchAgentStats(
  address: string,
  network: NetworkName = 'base'
): Promise<AgentStats> {
  try {
    const { verifications, vouches, flags } = await fetchAttestationsForAgent(
      address,
      network
    );

    // Filter out revoked attestations
    const activeVerifications = verifications.filter(v => !v.revoked);
    const activeVouches = vouches.filter(v => !v.revoked);
    const activeFlags = flags.filter(f => !f.revoked);

    // Total attestations = verifications + vouches
    const totalAttestations = activeVerifications.length + activeVouches.length;

    // Get all attestation times for activity calculation
    const allTimes = [
      ...activeVerifications.map(v => v.time),
      ...activeVouches.map(v => v.time),
    ];
    
    const firstAttestationTime = allTimes.length > 0 
      ? Math.min(...allTimes) 
      : null;
    
    // Last positive attestation = most recent verification or vouch
    const lastPositiveAttestationTime = allTimes.length > 0 
      ? Math.max(...allTimes) 
      : null;

    // Calculate days active
    const daysActive = calculateDaysActive(firstAttestationTime);

    // Calculate approval rate
    const approvalRate = calculateApprovalRate(totalAttestations, activeFlags.length);

    // Get voucher tiers for qualified vouch counting
    // Note: This is a simplified version - in production we'd recursively fetch voucher tiers
    const vouchInfos: VouchInfo[] = await Promise.all(
      activeVouches.map(async (v) => {
        // Simplified: Assume voucher tier is based on their own attestation count
        // In a full implementation, we'd recursively fetch voucher stats
        const voucherTier = await getVoucherTierSimplified(v.attester, network);
        return {
          trustLevel: v.trustLevel,
          revoked: v.revoked,
          voucherTier,
          time: v.time,
        };
      })
    );

    // Count qualified vouches for the highest possible tier
    // We check from current potential tier downward
    let qualifiedVouches = 0;
    for (let tier = MAX_TIER; tier >= 0; tier--) {
      qualifiedVouches = countQualifiedVouches(vouchInfos, tier);
      if (qualifiedVouches > 0) break;
    }

    return {
      totalAttestations,
      qualifiedVouches,
      approvalRate,
      daysActive,
      flags: activeFlags.length,
      firstAttestationTime,
      lastPositiveAttestationTime,
    };
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return getDefaultAgentStats();
  }
}

/**
 * Simplified voucher tier estimation
 * In production, this would recursively calculate the voucher's actual tier
 * @param voucherAddress Voucher's wallet address
 * @param network Network to query
 * @returns Estimated voucher tier
 */
async function getVoucherTierSimplified(
  voucherAddress: string,
  network: NetworkName
): Promise<number> {
  try {
    const { verifications, vouches, flags } = await fetchAttestationsForAgent(
      voucherAddress,
      network
    );

    const activeVer = verifications.filter(v => !v.revoked).length;
    const activeVouches = vouches.filter(v => !v.revoked).length;
    const activeFlags = flags.filter(f => !f.revoked).length;
    
    const total = activeVer + activeVouches;
    const approvalRate = calculateApprovalRate(total, activeFlags);
    
    // Simplified tier estimation based on attestation count and approval
    if (total >= 50 && approvalRate >= 95) return 4;
    if (total >= 25 && approvalRate >= 85) return 3;
    if (total >= 10 && approvalRate >= 70) return 2;
    if (total >= 3 && approvalRate >= 50) return 1;
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Clear the tier cache
 * Useful for testing or when fresh data is needed
 */
export function clearTierCache(): void {
  tierCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getTierCacheStats(): {
  size: number;
  entries: Array<{ address: string; tier: number; age: number }>;
} {
  const now = Date.now();
  const entries = Array.from(tierCache.entries()).map(([key, value]) => ({
    address: key,
    tier: value.tierInfo.tier,
    age: now - value.timestamp,
  }));

  return {
    size: tierCache.size,
    entries,
  };
}
