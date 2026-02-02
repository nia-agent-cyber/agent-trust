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

    // For now, use default weights for attesters
    // TODO: Recursively fetch attester scores (with caching/depth limit)
    const attesterScores = new Map<string, number>();

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
