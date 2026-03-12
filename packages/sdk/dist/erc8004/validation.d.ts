/**
 * ERC-8004 Validation Registry Reader
 *
 * Reads agent validation data from ERC-8004 Validation Registry.
 */
import { ethers } from 'ethers';
import { ERC8004Validation } from './types';
/**
 * Fetch ERC-8004 validation data for an agent from the Validation Registry.
 *
 * @param agentId - Agent token ID
 * @param registryAddress - Validation registry contract address
 * @param provider - Ethers provider
 * @param limit - Maximum number of recent validations to fetch
 * @returns ERC8004Validation data or null if not available
 */
export declare function getERC8004Validation(agentId: number, registryAddress: string, provider: ethers.Provider, limit?: number): Promise<ERC8004Validation | null>;
