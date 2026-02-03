/**
 * Soulbound Credentials Module
 * 
 * Issue and query non-transferable achievement credentials.
 * Built on EAS (Ethereum Attestation Service) — attestations are
 * inherently soulbound (non-transferable).
 */

import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { NETWORKS, SCHEMAS } from '../constants';
import type { 
  CredentialType, 
  CredentialRequest, 
  CredentialResult, 
  AgentCredentials,
  Credential,
} from './types';
import { CREDENTIALS } from './types';

// Re-export types
export * from './types';

/**
 * Issue a soulbound credential to an agent
 */
export async function issueCredential(
  signer: ethers.Signer,
  request: CredentialRequest,
  network: 'base' | 'baseSepolia' = 'baseSepolia'
): Promise<CredentialResult> {
  try {
    const networkConfig = NETWORKS[network];
    const eas = new EAS(networkConfig.easAddress);
    eas.connect(signer);

    const schemaEncoder = new SchemaEncoder(SCHEMAS.credential.schema);
    const encodedData = schemaEncoder.encodeData([
      { name: 'agentId', value: request.agentId, type: 'address' },
      { name: 'credentialType', value: request.credentialType, type: 'string' },
      { name: 'evidenceHash', value: request.evidenceHash || ethers.ZeroHash, type: 'bytes32' },
      { name: 'context', value: request.context || '', type: 'string' },
      { name: 'issuedAt', value: BigInt(Math.floor(Date.now() / 1000)), type: 'uint64' },
    ]);

    const tx = await eas.attest({
      schema: SCHEMAS.credential.uid,
      data: {
        recipient: request.agentId,
        expirationTime: 0n, // No expiration — credentials are permanent
        revocable: false,   // Non-revocable — true soulbound
        data: encodedData,
      },
    });

    const attestationUid = await tx.wait();

    return {
      success: true,
      attestationUid,
      txHash: tx.tx.hash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if an agent has a specific credential
 */
export async function hasCredential(
  provider: ethers.Provider,
  agentId: string,
  credentialType: CredentialType,
  network: 'base' | 'baseSepolia' = 'baseSepolia'
): Promise<boolean> {
  const credentials = await getAgentCredentials(provider, agentId, network);
  return credentials.credentials.some(c => c.type === credentialType);
}

/**
 * Get all credentials for an agent
 */
export async function getAgentCredentials(
  provider: ethers.Provider,
  agentId: string,
  network: 'base' | 'baseSepolia' = 'baseSepolia'
): Promise<AgentCredentials> {
  const networkConfig = NETWORKS[network];
  
  // Query EAS GraphQL for credential attestations
  const graphqlEndpoint = network === 'base' 
    ? 'https://base.easscan.org/graphql'
    : 'https://base-sepolia.easscan.org/graphql';

  const query = `
    query GetCredentials($recipient: String!, $schemaId: String!) {
      attestations(
        where: {
          recipient: { equals: $recipient }
          schemaId: { equals: $schemaId }
          revoked: { equals: false }
        }
        orderBy: { time: desc }
      ) {
        id
        attester
        time
        decodedDataJson
      }
    }
  `;

  try {
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: {
          recipient: agentId.toLowerCase(),
          schemaId: SCHEMAS.credential.uid,
        },
      }),
    });

    const result = await response.json();
    const attestations = result.data?.attestations || [];

    const credentials = attestations.map((att: any) => {
      const decoded = JSON.parse(att.decodedDataJson);
      const credentialTypeValue = decoded.find((d: any) => d.name === 'credentialType')?.value?.value;
      
      return {
        type: credentialTypeValue as CredentialType,
        attestationUid: att.id,
        issuedAt: att.time,
        issuer: att.attester,
      };
    });

    // Calculate total bonus
    const totalBonus = credentials.reduce((sum: number, cred: any) => {
      const credDef = CREDENTIALS[cred.type as CredentialType];
      return sum + (credDef?.scoreBonus || 0);
    }, 0);

    return {
      agentId,
      credentials,
      totalBonus,
    };
  } catch (error) {
    console.error('Failed to fetch credentials:', error);
    return {
      agentId,
      credentials: [],
      totalBonus: 0,
    };
  }
}

/**
 * Get credential definition by type
 */
export function getCredentialInfo(type: CredentialType): Credential {
  return CREDENTIALS[type];
}

/**
 * Get all available credential types
 */
export function getAllCredentialTypes(): Credential[] {
  return Object.values(CREDENTIALS);
}
