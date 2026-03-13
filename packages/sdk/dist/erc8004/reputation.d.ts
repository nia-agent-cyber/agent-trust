/**
 * ERC-8004 Reputation Registry Reader
 *
 * Reads agent reputation/feedback data from ERC-8004 Reputation Registry.
 */
import { ethers } from 'ethers';
import { ERC8004Reputation } from './types';
/**
 * Fetch ERC-8004 reputation for an agent from the Reputation Registry.
 *
 * @param agentId - Agent token ID in the Identity Registry
 * @param registryAddress - Reputation registry contract address
 * @param provider - Ethers provider
 * @param limit - Maximum number of recent feedback entries to fetch
 * @returns ERC8004Reputation data
 */
export declare function getERC8004Reputation(agentId: number, registryAddress: string, provider: ethers.Provider, limit?: number): Promise<ERC8004Reputation | null>;
