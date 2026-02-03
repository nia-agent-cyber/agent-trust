/**
 * Query attestations from EAS GraphQL API
 */

import { ethers } from 'ethers';
import { SCHEMAS, NetworkName, NETWORKS } from './constants';
import { 
  VouchAttestation, 
  FlagAttestation, 
  VerificationAttestation,
  calculateTrustScore,
  getDefaultTrustScore,
  ScoreInputs 
} from './scoring/trust-score';
import { TrustScore } from './types';

// EAS GraphQL endpoints
const GRAPHQL_ENDPOINTS: Record<NetworkName, string> = {
  base: 'https://base.easscan.org/graphql',
  baseSepolia: 'https://base-sepolia.easscan.org/graphql',
};

interface GraphQLAttestation {
  id: string;
  attester: string;
  recipient: string;
  time: number;
  revoked: boolean;
  decodedDataJson: string;
  schemaId: string;
}

/**
 * Fetch all attestations for an agent
 */
export async function fetchAttestationsForAgent(
  agentAddress: string,
  network: NetworkName = 'baseSepolia'
): Promise<{
  verifications: VerificationAttestation[];
  vouches: VouchAttestation[];
  flags: FlagAttestation[];
}> {
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
        address: ethers.getAddress(agentAddress), // checksummed
        addressLower: agentAddress.toLowerCase(),
      },
    }),
  });

  const data = await response.json();
  const attestations: GraphQLAttestation[] = data?.data?.asRecipient || [];

  // Sort by schema type
  const verifications: VerificationAttestation[] = [];
  const vouches: VouchAttestation[] = [];
  const flags: FlagAttestation[] = [];

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
      const dataMap = new Map(decoded.map((d: any) => [d.name, d.value.value]));

      if (att.schemaId.toLowerCase() === SCHEMAS.verification.uid.toLowerCase()) {
        verifications.push({
          ...base,
          platform: dataMap.get('platform') as string || '',
          handle: dataMap.get('handle') as string || '',
        });
      } else if (att.schemaId.toLowerCase() === SCHEMAS.vouch.uid.toLowerCase()) {
        vouches.push({
          ...base,
          trustLevel: Number(dataMap.get('trustLevel')) || 0,
          context: dataMap.get('context') as string || '',
        });
      } else if (att.schemaId.toLowerCase() === SCHEMAS.flag.uid.toLowerCase()) {
        flags.push({
          ...base,
          severity: Number(dataMap.get('severity')) || 0,
          reason: dataMap.get('reason') as string || '',
        });
      }
    } catch (e) {
      // Skip malformed attestations
    }
  }

  return { verifications, vouches, flags };
}

/**
 * Cache for attester scores to avoid duplicate API calls
 */
const attesterScoreCache = new Map<string, { score: number; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Get trust score for an agent
 */
export async function getTrustScore(
  agentAddress: string,
  network: NetworkName = 'baseSepolia'
): Promise<TrustScore> {
  try {
    const { verifications, vouches, flags } = await fetchAttestationsForAgent(
      agentAddress,
      network
    );

    // Recursively fetch attester scores with caching and depth limit
    const attesterScores = await fetchAttesterScoresRecursively(
      [...verifications, ...vouches, ...flags],
      network,
      2 // max depth to prevent cycles and limit API calls
    );

    const inputs: ScoreInputs = {
      verifications,
      vouches,
      flags,
      attesterScores,
    };

    return calculateTrustScore(inputs);
  } catch (error) {
    console.error('Error fetching trust score:', error);
    return getDefaultTrustScore();
  }
}

/**
 * Recursively fetch trust scores for attesters
 * @param attestations All attestations to get attester scores for
 * @param network Network to query
 * @param maxDepth Maximum recursion depth (prevents cycles)
 * @param visited Set of already visited addresses (prevents cycles)
 * @param currentDepth Current recursion depth
 */
async function fetchAttesterScoresRecursively(
  attestations: (VerificationAttestation | VouchAttestation | FlagAttestation)[],
  network: NetworkName,
  maxDepth: number,
  visited: Set<string> = new Set(),
  currentDepth: number = 0
): Promise<Map<string, number>> {
  const scores = new Map<string, number>();
  
  if (currentDepth >= maxDepth) {
    // At max depth, assign default scores
    for (const att of attestations) {
      if (!scores.has(att.attester)) {
        scores.set(att.attester, 50); // Default score
      }
    }
    return scores;
  }

  // Get unique attesters
  const uniqueAttesters = [...new Set(attestations.map(att => att.attester))];
  
  // Process each attester
  for (const attester of uniqueAttesters) {
    try {
      // Skip if already visited (cycle prevention)
      if (visited.has(attester.toLowerCase())) {
        scores.set(attester, 50); // Default score for cycles
        continue;
      }

      // Check cache first
      const cacheKey = `${attester.toLowerCase()}-${network}`;
      const cached = attesterScoreCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        scores.set(attester, cached.score);
        continue;
      }

      // Mark as visited for cycle prevention
      const newVisited = new Set([...visited, attester.toLowerCase()]);

      // Fetch attester's attestations
      const attesterAttestations = await fetchAttestationsForAgent(attester, network);
      
      // If attester has no attestations, use default score
      if (attesterAttestations.verifications.length === 0 && 
          attesterAttestations.vouches.length === 0 && 
          attesterAttestations.flags.length === 0) {
        const defaultScore = 50;
        scores.set(attester, defaultScore);
        attesterScoreCache.set(cacheKey, { score: defaultScore, timestamp: Date.now() });
        continue;
      }

      // Recursively calculate attester's score
      const allAttesterAttestations = [
        ...attesterAttestations.verifications,
        ...attesterAttestations.vouches,
        ...attesterAttestations.flags,
      ];

      const nestedAttesterScores = await fetchAttesterScoresRecursively(
        allAttesterAttestations,
        network,
        maxDepth,
        newVisited,
        currentDepth + 1
      );

      // Calculate the attester's trust score
      const attesterScore = calculateTrustScore({
        verifications: attesterAttestations.verifications,
        vouches: attesterAttestations.vouches,
        flags: attesterAttestations.flags,
        attesterScores: nestedAttesterScores,
      });

      scores.set(attester, attesterScore.score);
      
      // Cache the result
      attesterScoreCache.set(cacheKey, { 
        score: attesterScore.score, 
        timestamp: Date.now() 
      });

    } catch (error) {
      // On error, assign default score
      console.warn(`Error fetching score for attester ${attester}:`, error);
      scores.set(attester, 50);
    }
  }

  return scores;
}

/**
 * Clear the attester score cache
 * Useful for testing or when fresh data is needed
 */
export function clearAttesterScoreCache(): void {
  attesterScoreCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getAttesterScoreCacheStats(): {
  size: number;
  entries: Array<{ address: string; score: number; age: number }>;
} {
  const now = Date.now();
  const entries = Array.from(attesterScoreCache.entries()).map(([key, value]) => ({
    address: key,
    score: value.score,
    age: now - value.timestamp,
  }));

  return {
    size: attesterScoreCache.size,
    entries,
  };
}

/**
 * Get attestation summary for an agent (useful for debugging)
 */
export async function getAttestationSummary(
  agentAddress: string,
  network: NetworkName = 'baseSepolia'
): Promise<{
  address: string;
  verifications: { platform: string; handle: string; attester: string }[];
  vouches: { trustLevel: number; context: string; attester: string }[];
  flags: { severity: number; reason: string; attester: string }[];
  trustScore: TrustScore;
}> {
  const { verifications, vouches, flags } = await fetchAttestationsForAgent(
    agentAddress,
    network
  );

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
