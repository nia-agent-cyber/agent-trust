"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOWN_AUDIT_TYPES = void 0;
exports.parseAuditSeverity = parseAuditSeverity;
exports.normalizeSecurityAuditRequest = normalizeSecurityAuditRequest;
exports.encodeSecurityAuditAttestation = encodeSecurityAuditAttestation;
const eas_sdk_1 = require("@ethereum-attestation-service/eas-sdk");
const constants_1 = require("./constants");
const payment_reliable_1 = require("./payment-reliable");
/** Known audit type values accepted by the schema */
exports.KNOWN_AUDIT_TYPES = new Set([
    'smart-contract',
    'dependency-scan',
    'penetration-test',
    'code-review',
    'fuzzing',
]);
const SEVERITY_STRING_TO_CODE = {
    none: 0,
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};
const SEVERITY_CODE_TO_STRING = {
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
function parseAuditSeverity(code) {
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
function normalizeSeverity(severity) {
    if (typeof severity === 'number') {
        const s = SEVERITY_CODE_TO_STRING[severity];
        if (s === undefined) {
            throw new Error(`Invalid severity code: ${severity}. Must be 0 (none), 1 (low), 2 (medium), 3 (high), or 4 (critical)`);
        }
        return { severity: s, severityCode: severity };
    }
    const code = SEVERITY_STRING_TO_CODE[severity];
    if (code === undefined) {
        throw new Error(`Invalid severity string: "${severity}". Must be one of: none, low, medium, high, critical`);
    }
    return { severity: severity, severityCode: code };
}
/**
 * Normalize and validate a SecurityAuditRequest.
 * Throws on invalid inputs.
 */
function normalizeSecurityAuditRequest(request) {
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
    if (!exports.KNOWN_AUDIT_TYPES.has(trimmedAuditType)) {
        throw new Error(`auditType "${trimmedAuditType}" is not a known value. Must be one of: ${[...exports.KNOWN_AUDIT_TYPES].join(', ')}`);
    }
    if (typeof request.passed !== 'boolean') {
        throw new Error('passed must be a boolean');
    }
    const { severity, severityCode } = normalizeSeverity(request.severity);
    const timestamp = request.timestamp !== undefined && request.timestamp !== null
        ? (0, payment_reliable_1.normalizeTimestampToSeconds)(request.timestamp)
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
function encodeSecurityAuditAttestation(request) {
    const normalized = normalizeSecurityAuditRequest(request);
    const schemaEncoder = new eas_sdk_1.SchemaEncoder(constants_1.SCHEMAS.securityAudit.schema);
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
