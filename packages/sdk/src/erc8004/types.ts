/**
 * ERC-8004 Bridge Type Definitions
 *
 * Types for reading ERC-8004 Identity, Reputation, and Validation registries
 * and enriching with Agent Trust data.
 */

import { TierInfo } from '../tier/tier-types';
import { TrustScore } from '../types';

/**
 * Agent card metadata resolved from tokenURI
 */
export interface AgentCardMetadata {
  name?: string;
  description?: string;
  capabilities?: string[];
  endpoints?: Record<string, string>;
  version?: string;
  [key: string]: unknown;
}

/**
 * ERC-8004 Identity data from the Identity Registry (ERC-721)
 */
export interface ERC8004Identity {
  /** ERC-721 tokenId */
  agentId: number;
  /** Owner address */
  owner: string;
  /** Identity registry contract address */
  registryAddress: string;
  /** tokenURI pointing to agent card JSON */
  tokenURI: string;
  /** Resolved metadata from tokenURI (null if not fetchable) */
  metadata: AgentCardMetadata | null;
}

/**
 * A single feedback entry from the Reputation Registry
 */
export interface FeedbackEntry {
  /** Address of the feedback giver */
  from: string;
  /** Rating (1-5) */
  rating: number;
  /** Feedback comment */
  comment: string;
  /** Unix timestamp */
  timestamp: number;
}

/**
 * ERC-8004 Reputation data from the Reputation Registry
 */
export interface ERC8004Reputation {
  /** Total feedback entries */
  feedbackCount: number;
  /** Average rating (null if no feedback) */
  averageRating: number | null;
  /** Most recent feedback entries */
  recentFeedback: FeedbackEntry[];
}

/**
 * Validation result from the Validation Registry
 */
export interface ValidationResult {
  /** Validator address */
  validator: string;
  /** Whether validation passed */
  passed: boolean;
  /** Validation type (e.g. "re-execution", "zkML", "TEE") */
  validationType: string;
  /** Unix timestamp */
  timestamp: number;
}

/**
 * ERC-8004 Validation data
 */
export interface ERC8004Validation {
  /** Total validations performed */
  validationCount: number;
  /** Number of validations that passed */
  passedCount: number;
  /** Recent validation results */
  recentValidations: ValidationResult[];
}

/**
 * Combined enriched agent profile
 */
export interface EnrichedAgentProfile {
  /** Agent wallet address */
  address: string;
  /** ERC-8004 data */
  erc8004: {
    /** Whether the agent is registered in ERC-8004 */
    registered: boolean;
    /** Identity data (null if not registered) */
    identity: ERC8004Identity | null;
    /** Reputation data (null if not registered or no reputation registry) */
    reputation: ERC8004Reputation | null;
    /** Validation data (null if not registered or no validation registry) */
    validation: ERC8004Validation | null;
  };
  /** Agent Trust data */
  agentTrust: {
    /** Trust tier info */
    tier: TierInfo;
    /** Trust score */
    score: TrustScore;
    /** Total attestation count */
    attestationCount: number;
  };
  /** Combined assessment */
  combined: {
    /** Whether the agent has on-chain ERC-8004 identity */
    hasOnChainIdentity: boolean;
    /** Agent Trust tier name */
    trustTier: string;
    /** Combined reputation score (0-100) */
    reputationScore: number;
    /** Human-readable summary */
    summary: string;
  };
}

/**
 * ERC-8004 bridge configuration
 */
export interface ERC8004Config {
  /** Identity registry contract address */
  identityRegistry?: string;
  /** Reputation registry contract address */
  reputationRegistry?: string;
  /** Validation registry contract address */
  validationRegistry?: string;
}
