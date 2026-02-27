/**
 * ERC-8004 Identity Registry Reader
 *
 * Reads agent identity data from ERC-8004 Identity Registry (ERC-721).
 */

import { ethers } from 'ethers';
import { ERC8004Identity, AgentCardMetadata } from './types';
import { IDENTITY_REGISTRY_ABI } from './constants';

/**
 * Fetch ERC-8004 identity for an address from the Identity Registry.
 *
 * @param address - Agent wallet address
 * @param registryAddress - Identity registry contract address
 * @param provider - Ethers provider
 * @returns ERC8004Identity or null if not registered
 */
export async function getERC8004Identity(
  address: string,
  registryAddress: string,
  provider: ethers.Provider,
): Promise<ERC8004Identity | null> {
  // Skip if registry is zero address (not deployed)
  if (registryAddress === ethers.ZeroAddress) {
    return null;
  }

  try {
    const contract = new ethers.Contract(registryAddress, IDENTITY_REGISTRY_ABI, provider);

    // Check if address owns any agent tokens
    const balance: bigint = await contract.balanceOf(address);
    if (balance === 0n) {
      return null;
    }

    // Get the first token (primary agent identity)
    const tokenId: bigint = await contract.tokenOfOwnerByIndex(address, 0n);
    const tokenURI: string = await contract.tokenURI(tokenId);

    // Try to resolve metadata from tokenURI
    const metadata = await resolveTokenURI(tokenURI);

    return {
      agentId: Number(tokenId),
      owner: address,
      registryAddress,
      tokenURI,
      metadata,
    };
  } catch (error) {
    // Contract call failed — registry may not be deployed or address not registered
    return null;
  }
}

/**
 * Resolve metadata from a tokenURI.
 * Supports HTTP(S) URLs and data URIs.
 *
 * @param tokenURI - URI to resolve
 * @returns AgentCardMetadata or null if not resolvable
 */
export async function resolveTokenURI(tokenURI: string): Promise<AgentCardMetadata | null> {
  try {
    // Handle data URIs (base64 or direct JSON)
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64 = tokenURI.slice('data:application/json;base64,'.length);
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json) as AgentCardMetadata;
    }

    if (tokenURI.startsWith('data:application/json,')) {
      const json = decodeURIComponent(tokenURI.slice('data:application/json,'.length));
      return JSON.parse(json) as AgentCardMetadata;
    }

    // Handle HTTP(S) URLs
    if (tokenURI.startsWith('http://') || tokenURI.startsWith('https://')) {
      const response = await fetch(tokenURI, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as AgentCardMetadata;
    }

    // Handle IPFS URIs
    if (tokenURI.startsWith('ipfs://')) {
      const cid = tokenURI.slice('ipfs://'.length);
      const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
      const response = await fetch(gatewayUrl, {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as AgentCardMetadata;
    }

    return null;
  } catch {
    return null;
  }
}
