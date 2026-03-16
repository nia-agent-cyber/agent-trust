import { NormalizedTaskCompletion, TaskOutcome, TaskCompletionRequest } from './types';
/**
 * Normalize and validate a TaskCompletionRequest.
 * Throws on invalid inputs.
 */
export declare function normalizeTaskCompletionRequest(request: TaskCompletionRequest): NormalizedTaskCompletion;
/**
 * Encode a TaskCompletion attestation payload for EAS.
 */
export declare function encodeTaskCompletionAttestation(request: TaskCompletionRequest): string;
/**
 * Map a numeric outcome code to a TaskOutcome string.
 * Throws for unknown codes.
 */
export declare function parseTaskOutcome(code: number): TaskOutcome;
