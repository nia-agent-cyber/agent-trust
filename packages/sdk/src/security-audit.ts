import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { SCHEMAS } from './constants';
import { AuditSeverity, NormalizedSecurityAudit, SecurityAuditRequest } from './types';
import { normalizeTimestampToSeconds } from './payment-reliable';

/** Known audit type values accepted by the schema */
export const KNOWN_AUDIT_TYPES = new Set<string>([
  'smart-contract',
  'dependency-scan',
  'penetration-test',
  'code-review',
  'fuzzing',
]);

const SEVERITY_STRING_TO_CODE: Record<AuditSeverity, 0 | 1 | 2 | 3 | 4> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const SEVERITY_CODE_TO_STRING: Record<number, AuditSeverity> = {
  0: 'none',
  1: 'low',
  2: 'medium',
  3: 'high',
  4: 'critical',
};

/**
 * Parse a uint8 severity code back to a typed AuditSeverity string.
 * Throws on unknown codes.
 */
export function parseAuditSeverity(code: number): AuditSeverity {
  const severity = SEVERITY_CODE_TO_STRING[code];
  if (severity === undefined) {
    throw new Error(`Unknown audit severity code: ${code}`);
  }
  return severity;
}

/**
 * Normalize a severity value (number 0-4 or string like "high") to a typed AuditSeverity.
 * Throws if invalid.
 */
function normalizeSeverity(
  severity: number | AuditSeverity
): { severity: AuditSeverity; severityCode: 0 | 1 | 2 | 3 | 4 } {
  if (typeof severity === 'number') {
    const s = SEVERITY_CODE_TO_STRING[severity];
    if (s === undefined) {
      throw new Error(`Invalid severity code: ${severity}. Must be 0 (none), 1 (low), 2 (medium), 3 (high), or 4 (critical)`);
    }
    return { severity: s, severityCode: severity as 0 | 1 | 2 | 3 | 4 };
  }

  const code = SEVERITY_STRING_TO_CODE[severity as AuditSeverity];
  if (code === undefined) {
    throw new Error(`Invalid severity string: "${severity}". Must be one of: none, low, medium, high, critical`);
  }
  return { severity: severity as AuditSeverity, severityCode: code };
}

/**
 * Normalize and validate a SecurityAuditRequest.
 * Throws on invalid inputs.
 */
export function normalizeSecurityAuditRequest(request: SecurityAuditRequest): NormalizedSecurityAudit {
  if (!request.auditor || !request.auditor.trim()) {
    throw new Error('auditor is required');
  }

  if (!request.subject || !request.subject.trim()) {
    throw new Error('subject is required');
  }

  if (!request.auditType || !request.auditType.trim()) {
    throw new Error('auditType is required');
  }

  const trimmedAuditType = request.auditType.trim();
  if (!KNOWN_AUDIT_TYPES.has(trimmedAuditType)) {
    throw new Error(
      `auditType "${trimmedAuditType}" is not a known value. Must be one of: ${[...KNOWN_AUDIT_TYPES].join(', ')}`
    );
  }

  if (typeof request.passed !== 'boolean') {
    throw new Error('passed must be a boolean');
  }

  const { severity, severityCode } = normalizeSeverity(request.severity);

  const timestamp =
    request.timestamp !== undefined && request.timestamp !== null
      ? normalizeTimestampToSeconds(request.timestamp as string | number | Date)
      : BigInt(Math.floor(Date.now() / 1000));

  return {
    auditor: request.auditor.trim(),
    subject: request.subject.trim(),
    auditType: trimmedAuditType,
    severity,
    severityCode,
    passed: request.passed,
    reportUri: request.reportUri?.trim() || '',
    timestamp,
  };
}

/**
 * ABI-encode a SecurityAudit attestation payload for EAS.
 */
export function encodeSecurityAuditAttestation(request: SecurityAuditRequest): string {
  const normalized = normalizeSecurityAuditRequest(request);
  const schemaEncoder = new SchemaEncoder(SCHEMAS.securityAudit.schema);

  return schemaEncoder.encodeData([
    { name: 'auditor', value: normalized.auditor, type: 'address' },
    { name: 'subject', value: normalized.subject, type: 'address' },
    { name: 'auditType', value: normalized.auditType, type: 'string' },
    { name: 'severity', value: normalized.severityCode, type: 'uint8' },
    { name: 'passed', value: normalized.passed, type: 'bool' },
    { name: 'reportUri', value: normalized.reportUri, type: 'string' },
    { name: 'timestamp', value: normalized.timestamp, type: 'uint64' },
  ]);
}
