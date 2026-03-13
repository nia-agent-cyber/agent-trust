"use strict";
/**
 * ERC-8004 Identity Registry Reader
 *
 * Reads agent identity data from ERC-8004 Identity Registry (ERC-721).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getERC8004Identity = getERC8004Identity;
exports.resolveTokenURI = resolveTokenURI;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
/**
 * Fetch ERC-8004 identity for an address from the Identity Registry.
 *
 * @param address - Agent wallet address
 * @param registryAddress - Identity registry contract address
 * @param provider - Ethers provider
 * @returns ERC8004Identity or null if not registered
 */
async function getERC8004Identity(address, registryAddress, provider) {
    // Skip if registry is zero address (not deployed)
    if (registryAddress === ethers_1.ethers.ZeroAddress) {
        return null;
    }
    try {
        const contract = new ethers_1.ethers.Contract(registryAddress, constants_1.IDENTITY_REGISTRY_ABI, provider);
        // Check if address owns any agent tokens
        const balance = await contract.balanceOf(address);
        if (balance === 0n) {
            return null;
        }
        // Get the first token (primary agent identity)
        const tokenId = await contract.tokenOfOwnerByIndex(address, 0n);
        const tokenURI = await contract.tokenURI(tokenId);
        // Try to resolve metadata from tokenURI
        const metadata = await resolveTokenURI(tokenURI);
        return {
            agentId: Number(tokenId),
            owner: address,
            registryAddress,
            tokenURI,
            metadata,
        };
    }
    catch (error) {
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
async function resolveTokenURI(tokenURI) {
    try {
        // Handle data URIs (base64 or direct JSON)
        if (tokenURI.startsWith('data:application/json;base64,')) {
            const base64 = tokenURI.slice('data:application/json;base64,'.length);
            const json = Buffer.from(base64, 'base64').toString('utf-8');
            return JSON.parse(json);
        }
        if (tokenURI.startsWith('data:application/json,')) {
            const json = decodeURIComponent(tokenURI.slice('data:application/json,'.length));
            return JSON.parse(json);
        }
        // Handle HTTP(S) URLs
        if (tokenURI.startsWith('http://') || tokenURI.startsWith('https://')) {
            const response = await fetch(tokenURI, {
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                return null;
            }
            return (await response.json());
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
            return (await response.json());
        }
        return null;
    }
    catch {
        return null;
    }
}
