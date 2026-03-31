import { AuditSeverity, NormalizedSecurityAudit, SecurityAuditRequest } from './types';
/** Known audit type values accepted by the schema */
export declare const KNOWN_AUDIT_TYPES: Set<string>;
/**
 * Parse a uint8 severity code back to a typed AuditSeverity string.
 * Throws on unknown codes.
 */
export declare function parseAuditSeverity(code: number): AuditSeverity;
/**
 * Normalize and validate a SecurityAuditRequest.
 * Throws on invalid inputs.
 */
export declare function normalizeSecurityAuditRequest(request: SecurityAuditRequest): NormalizedSecurityAudit;
/**
 * ABI-encode a SecurityAudit attestation payload for EAS.
 */
export declare function encodeSecurityAuditAttestation(request: SecurityAuditRequest): string;
