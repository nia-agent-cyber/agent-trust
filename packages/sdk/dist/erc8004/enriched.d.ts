/**
 * ERC-8004 Enriched Profile
 *
 * Combines ERC-8004 registry data with Agent Trust reputation scoring
 * to produce a unified enriched agent profile.
 */
import { ethers } from 'ethers';
import { EnrichedAgentProfile, ERC8004Identity, ERC8004Reputation, ERC8004Validation, ERC8004Config } from './types';
import { TierInfo } from '../tier/tier-types';
import { TrustScore } from '../types';
import { NetworkName } from '../constants';
/**
 * Calculate a combined reputation score (0-100) from all data sources.
 *
 * Weights:
 * - Agent Trust tier: 40%
 * - ERC-8004 reputation signals: 30%
 * - Identity completeness: 15%
 * - Validation status: 15%
 */
export declare function calculateCombinedScore(tier: TierInfo, identity: ERC8004Identity | null, reputation: ERC8004Reputation | null, validation: ERC8004Validation | null): number;
/**
 * Generate a human-readable summary for the enriched profile.
 */
export declare function generateSummary(address: string, tier: TierInfo, identity: ERC8004Identity | null, reputation: ERC8004Reputation | null, combinedScore: number): string;
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
export declare function buildEnrichedProfile(address: string, provider: ethers.Provider, network: NetworkName, tierInfo: TierInfo, trustScore: TrustScore, attestationCount: number, config?: ERC8004Config): Promise<EnrichedAgentProfile>;
