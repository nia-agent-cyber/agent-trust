/**
 * Soulbound Credential Types
 * 
 * Credentials are non-transferable achievements that agents earn
 * through demonstrated behavior. They live on-chain as EAS attestations.
 */

export type CredentialType = 
  | 'TRUSTED_WORKER'      // Completed 10+ verified jobs
  | 'GOOD_JUDGE'          // Made 5+ accurate vouches
  | 'EARLY_BUILDER'       // Contributed before mainnet
  | 'VERIFIED_AGENT'      // Completed identity verification
  | 'COMMUNITY_PILLAR';   // Received 10+ vouches from unique agents

export interface Credential {
  /** Credential type */
  type: CredentialType;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Emoji badge */
  badge: string;
  /** Points added to trust score */
  scoreBonus: number;
}

export const CREDENTIALS: Record<CredentialType, Credential> = {
  TRUSTED_WORKER: {
    type: 'TRUSTED_WORKER',
    name: 'Trusted Worker',
    description: 'Completed 10+ verified jobs successfully',
    badge: '🔧',
    scoreBonus: 10,
  },
  GOOD_JUDGE: {
    type: 'GOOD_JUDGE',
    name: 'Good Judge',
    description: 'Made 5+ vouches that proved accurate over time',
    badge: '⚖️',
    scoreBonus: 8,
  },
  EARLY_BUILDER: {
    type: 'EARLY_BUILDER',
    name: 'Early Builder',
    description: 'Contributed to Agent Trust before mainnet launch',
    badge: '🌱',
    scoreBonus: 5,
  },
  VERIFIED_AGENT: {
    type: 'VERIFIED_AGENT',
    name: 'Verified Agent',
    description: 'Completed full identity verification',
    badge: '✓',
    scoreBonus: 15,
  },
  COMMUNITY_PILLAR: {
    type: 'COMMUNITY_PILLAR',
    name: 'Community Pillar',
    description: 'Received vouches from 10+ unique agents',
    badge: '🏛️',
    scoreBonus: 12,
  },
};

export interface CredentialRequest {
  /** Agent to receive credential */
  agentId: string;
  /** Credential type */
  credentialType: CredentialType;
  /** Evidence supporting the credential (optional) */
  evidenceHash?: string;
  /** Additional context */
  context?: string;
}

export interface CredentialResult {
  /** Whether issuance succeeded */
  success: boolean;
  /** Attestation UID (if successful) */
  attestationUid?: string;
  /** Transaction hash */
  txHash?: string;
  /** Error message (if failed) */
  error?: string;
}

export interface AgentCredentials {
  /** Agent's address */
  agentId: string;
  /** List of earned credentials */
  credentials: {
    type: CredentialType;
    attestationUid: string;
    issuedAt: number;
    issuer: string;
  }[];
  /** Total score bonus from credentials */
  totalBonus: number;
}
