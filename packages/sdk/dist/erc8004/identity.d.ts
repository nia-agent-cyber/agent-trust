/**
 * ERC-8004 Identity Registry Reader
 *
 * Reads agent identity data from ERC-8004 Identity Registry (ERC-721).
 */
import { ethers } from 'ethers';
import { ERC8004Identity, AgentCardMetadata } from './types';
/**
 * Fetch ERC-8004 identity for an address from the Identity Registry.
 *
 * @param address - Agent wallet address
 * @param registryAddress - Identity registry contract address
 * @param provider - Ethers provider
 * @returns ERC8004Identity or null if not registered
 */
export declare function getERC8004Identity(address: string, registryAddress: string, provider: ethers.Provider): Promise<ERC8004Identity | null>;
/**
 * Resolve metadata from a tokenURI.
 * Supports HTTP(S) URLs and data URIs.
 *
 * @param tokenURI - URI to resolve
 * @returns AgentCardMetadata or null if not resolvable
 */
export declare function resolveTokenURI(tokenURI: string): Promise<AgentCardMetadata | null>;
