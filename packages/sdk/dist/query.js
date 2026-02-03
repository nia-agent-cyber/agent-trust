"use strict";
/**
 * Query attestations from EAS GraphQL API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAttestationsForAgent = fetchAttestationsForAgent;
exports.getTrustScore = getTrustScore;
exports.getAttestationSummary = getAttestationSummary;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const trust_score_1 = require("./scoring/trust-score");
// EAS GraphQL endpoints
const GRAPHQL_ENDPOINTS = {
    base: 'https://base.easscan.org/graphql',
    baseSepolia: 'https://base-sepolia.easscan.org/graphql',
};
/**
 * Fetch all attestations for an agent
 */
async function fetchAttestationsForAgent(agentAddress, network = 'baseSepolia') {
    const endpoint = GRAPHQL_ENDPOINTS[network];
    // Query attestations where recipient is the agent
    // Note: EAS GraphQL is case-sensitive, so we query both attester and recipient
    const query = `
    query GetAttestations($address: String!, $addressLower: String!) {
      asRecipient: attestations(
        where: { 
          OR: [
            { recipient: { equals: $address } },
            { recipient: { equals: $addressLower } }
          ]
        }
        orderBy: { time: desc }
        take: 100
      ) {
        id
        attester
        recipient
        time
        revoked
        decodedDataJson
        schemaId
      }
    }
  `;
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            variables: {
                address: ethers_1.ethers.getAddress(agentAddress), // checksummed
                addressLower: agentAddress.toLowerCase(),
            },
        }),
    });
    const data = await response.json();
    const attestations = data?.data?.asRecipient || [];
    // Sort by schema type
    const verifications = [];
    const vouches = [];
    const flags = [];
    for (const att of attestations) {
        const base = {
            uid: att.id,
            attester: att.attester,
            recipient: att.recipient,
            time: att.time,
            revoked: att.revoked,
        };
        try {
            const decoded = JSON.parse(att.decodedDataJson);
            const dataMap = new Map(decoded.map((d) => [d.name, d.value.value]));
            if (att.schemaId.toLowerCase() === constants_1.SCHEMAS.verification.uid.toLowerCase()) {
                verifications.push({
                    ...base,
                    platform: dataMap.get('platform') || '',
                    handle: dataMap.get('handle') || '',
                });
            }
            else if (att.schemaId.toLowerCase() === constants_1.SCHEMAS.vouch.uid.toLowerCase()) {
                vouches.push({
                    ...base,
                    trustLevel: Number(dataMap.get('trustLevel')) || 0,
                    context: dataMap.get('context') || '',
                });
            }
            else if (att.schemaId.toLowerCase() === constants_1.SCHEMAS.flag.uid.toLowerCase()) {
                flags.push({
                    ...base,
                    severity: Number(dataMap.get('severity')) || 0,
                    reason: dataMap.get('reason') || '',
                });
            }
        }
        catch (e) {
            // Skip malformed attestations
        }
    }
    return { verifications, vouches, flags };
}
/**
 * Get trust score for an agent
 */
async function getTrustScore(agentAddress, network = 'baseSepolia') {
    try {
        const { verifications, vouches, flags } = await fetchAttestationsForAgent(agentAddress, network);
        // For now, use default weights for attesters
        // TODO: Recursively fetch attester scores (with caching/depth limit)
        const attesterScores = new Map();
        const inputs = {
            verifications,
            vouches,
            flags,
            attesterScores,
        };
        return (0, trust_score_1.calculateTrustScore)(inputs);
    }
    catch (error) {
        console.error('Error fetching trust score:', error);
        return (0, trust_score_1.getDefaultTrustScore)();
    }
}
/**
 * Get attestation summary for an agent (useful for debugging)
 */
async function getAttestationSummary(agentAddress, network = 'baseSepolia') {
    const { verifications, vouches, flags } = await fetchAttestationsForAgent(agentAddress, network);
    const trustScore = await getTrustScore(agentAddress, network);
    return {
        address: agentAddress,
        verifications: verifications.map(v => ({
            platform: v.platform,
            handle: v.handle,
            attester: v.attester,
        })),
        vouches: vouches.map(v => ({
            trustLevel: v.trustLevel,
            context: v.context,
            attester: v.attester,
        })),
        flags: flags.map(f => ({
            severity: f.severity,
            reason: f.reason,
            attester: f.attester,
        })),
        trustScore,
    };
}
