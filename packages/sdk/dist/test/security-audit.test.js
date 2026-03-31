"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const security_audit_1 = require("../security-audit");
const AUDITOR = '0x' + 'a'.repeat(40);
const SUBJECT = '0x' + 'b'.repeat(40);
const FIXED_TS = 1700000000;
// ============ normalizeSecurityAuditRequest ============
(0, vitest_1.describe)('normalizeSecurityAuditRequest', () => {
    (0, vitest_1.it)('normalizes a full valid request with string severity', () => {
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'smart-contract',
            severity: 'high',
            passed: false,
            reportUri: 'ipfs://QmFoo',
            timestamp: FIXED_TS,
        });
        (0, vitest_1.expect)(result.auditor).toBe(AUDITOR);
        (0, vitest_1.expect)(result.subject).toBe(SUBJECT);
        (0, vitest_1.expect)(result.auditType).toBe('smart-contract');
        (0, vitest_1.expect)(result.severity).toBe('high');
        (0, vitest_1.expect)(result.severityCode).toBe(3);
        (0, vitest_1.expect)(result.passed).toBe(false);
        (0, vitest_1.expect)(result.reportUri).toBe('ipfs://QmFoo');
        (0, vitest_1.expect)(result.timestamp).toBe(BigInt(FIXED_TS));
    });
    (0, vitest_1.it)('normalizes a full valid request with numeric severity', () => {
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'dependency-scan',
            severity: 2,
            passed: true,
            timestamp: FIXED_TS,
        });
        (0, vitest_1.expect)(result.severity).toBe('medium');
        (0, vitest_1.expect)(result.severityCode).toBe(2);
        (0, vitest_1.expect)(result.passed).toBe(true);
    });
    (0, vitest_1.it)('maps all severity strings correctly', () => {
        const pairs = [
            ['none', 0],
            ['low', 1],
            ['medium', 2],
            ['high', 3],
            ['critical', 4],
        ];
        for (const [str, code] of pairs) {
            const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
                auditor: AUDITOR,
                subject: SUBJECT,
                auditType: 'code-review',
                severity: str,
                passed: true,
                timestamp: FIXED_TS,
            });
            (0, vitest_1.expect)(result.severity).toBe(str);
            (0, vitest_1.expect)(result.severityCode).toBe(code);
        }
    });
    (0, vitest_1.it)('maps all numeric severity codes correctly', () => {
        const pairs = [
            [0, 'none'],
            [1, 'low'],
            [2, 'medium'],
            [3, 'high'],
            [4, 'critical'],
        ];
        for (const [code, str] of pairs) {
            const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
                auditor: AUDITOR,
                subject: SUBJECT,
                auditType: 'fuzzing',
                severity: code,
                passed: false,
                timestamp: FIXED_TS,
            });
            (0, vitest_1.expect)(result.severity).toBe(str);
            (0, vitest_1.expect)(result.severityCode).toBe(code);
        }
    });
    (0, vitest_1.it)('applies defaults for optional fields', () => {
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'penetration-test',
            severity: 0,
            passed: true,
            timestamp: FIXED_TS,
        });
        (0, vitest_1.expect)(result.reportUri).toBe('');
    });
    (0, vitest_1.it)('defaults timestamp to ~now when omitted', () => {
        const before = BigInt(Math.floor(Date.now() / 1000)) - 2n;
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'code-review',
            severity: 'none',
            passed: true,
        });
        const after = BigInt(Math.floor(Date.now() / 1000)) + 2n;
        (0, vitest_1.expect)(result.timestamp).toBeGreaterThanOrEqual(before);
        (0, vitest_1.expect)(result.timestamp).toBeLessThanOrEqual(after);
    });
    (0, vitest_1.it)('normalizes timestamp from ISO string', () => {
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'smart-contract',
            severity: 'low',
            passed: true,
            timestamp: '2023-11-14T22:13:20.000Z',
        });
        (0, vitest_1.expect)(result.timestamp).toBe(BigInt(FIXED_TS));
    });
    (0, vitest_1.it)('normalizes timestamp from milliseconds', () => {
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'smart-contract',
            severity: 'low',
            passed: true,
            timestamp: FIXED_TS * 1000,
        });
        (0, vitest_1.expect)(result.timestamp).toBe(BigInt(FIXED_TS));
    });
    (0, vitest_1.it)('normalizes timestamp from Date object', () => {
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'fuzzing',
            severity: 'critical',
            passed: false,
            timestamp: new Date('2023-11-14T22:13:20.000Z'),
        });
        (0, vitest_1.expect)(result.timestamp).toBe(BigInt(FIXED_TS));
    });
    (0, vitest_1.it)('trims whitespace from string fields', () => {
        const result = (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: `  ${AUDITOR}  `,
            subject: `  ${SUBJECT}  `,
            auditType: '  smart-contract  ',
            severity: 'none',
            passed: true,
            reportUri: '  https://example.com/report  ',
            timestamp: FIXED_TS,
        });
        (0, vitest_1.expect)(result.auditor).toBe(AUDITOR);
        (0, vitest_1.expect)(result.subject).toBe(SUBJECT);
        (0, vitest_1.expect)(result.auditType).toBe('smart-contract');
        (0, vitest_1.expect)(result.reportUri).toBe('https://example.com/report');
    });
    (0, vitest_1.it)('throws when auditor is missing', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: '',
            subject: SUBJECT,
            auditType: 'smart-contract',
            severity: 0,
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/auditor is required/i);
    });
    (0, vitest_1.it)('throws when auditor is whitespace-only', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: '   ',
            subject: SUBJECT,
            auditType: 'smart-contract',
            severity: 0,
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/auditor is required/i);
    });
    (0, vitest_1.it)('throws when subject is missing', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: '',
            auditType: 'smart-contract',
            severity: 0,
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/subject is required/i);
    });
    (0, vitest_1.it)('throws when auditType is missing', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: '',
            severity: 0,
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/auditType is required/i);
    });
    (0, vitest_1.it)('throws on unknown auditType', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'quantum-audit',
            severity: 0,
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/not a known value/i);
    });
    (0, vitest_1.it)('throws on invalid numeric severity (out of range)', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'fuzzing',
            severity: 99,
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/invalid severity code/i);
    });
    (0, vitest_1.it)('throws on negative numeric severity', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'fuzzing',
            severity: -1,
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/invalid severity code/i);
    });
    (0, vitest_1.it)('throws on invalid string severity', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'code-review',
            severity: 'extreme',
            passed: true,
            timestamp: FIXED_TS,
        })).toThrow(/invalid severity string/i);
    });
    (0, vitest_1.it)('accepts all known auditType values', () => {
        for (const auditType of security_audit_1.KNOWN_AUDIT_TYPES) {
            (0, vitest_1.expect)(() => (0, security_audit_1.normalizeSecurityAuditRequest)({
                auditor: AUDITOR,
                subject: SUBJECT,
                auditType,
                severity: 0,
                passed: true,
                timestamp: FIXED_TS,
            })).not.toThrow();
        }
    });
});
// ============ encodeSecurityAuditAttestation ============
(0, vitest_1.describe)('encodeSecurityAuditAttestation', () => {
    (0, vitest_1.it)('returns a valid hex-encoded payload', () => {
        const encoded = (0, security_audit_1.encodeSecurityAuditAttestation)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'smart-contract',
            severity: 'critical',
            passed: false,
            reportUri: 'ipfs://QmEncode',
            timestamp: FIXED_TS,
        });
        (0, vitest_1.expect)(encoded).toMatch(/^0x[0-9a-f]+$/i);
        (0, vitest_1.expect)(encoded.length).toBeGreaterThan(10);
    });
    (0, vitest_1.it)('encodes a minimal request (no reportUri, default timestamp)', () => {
        const encoded = (0, security_audit_1.encodeSecurityAuditAttestation)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'dependency-scan',
            severity: 1,
            passed: true,
            timestamp: FIXED_TS,
        });
        (0, vitest_1.expect)(encoded).toMatch(/^0x[0-9a-f]+$/i);
        (0, vitest_1.expect)(encoded.length).toBeGreaterThan(10);
    });
    (0, vitest_1.it)('encodes with numeric severity', () => {
        const encoded = (0, security_audit_1.encodeSecurityAuditAttestation)({
            auditor: AUDITOR,
            subject: SUBJECT,
            auditType: 'penetration-test',
            severity: 4,
            passed: false,
            timestamp: FIXED_TS,
        });
        (0, vitest_1.expect)(encoded).toMatch(/^0x[0-9a-f]+$/i);
    });
});
// ============ parseAuditSeverity ============
(0, vitest_1.describe)('parseAuditSeverity', () => {
    (0, vitest_1.it)('maps code 0 to none', () => {
        (0, vitest_1.expect)((0, security_audit_1.parseAuditSeverity)(0)).toBe('none');
    });
    (0, vitest_1.it)('maps code 1 to low', () => {
        (0, vitest_1.expect)((0, security_audit_1.parseAuditSeverity)(1)).toBe('low');
    });
    (0, vitest_1.it)('maps code 2 to medium', () => {
        (0, vitest_1.expect)((0, security_audit_1.parseAuditSeverity)(2)).toBe('medium');
    });
    (0, vitest_1.it)('maps code 3 to high', () => {
        (0, vitest_1.expect)((0, security_audit_1.parseAuditSeverity)(3)).toBe('high');
    });
    (0, vitest_1.it)('maps code 4 to critical', () => {
        (0, vitest_1.expect)((0, security_audit_1.parseAuditSeverity)(4)).toBe('critical');
    });
    (0, vitest_1.it)('throws on unknown code', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.parseAuditSeverity)(99)).toThrow(/unknown audit severity code/i);
    });
    (0, vitest_1.it)('throws on negative code', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.parseAuditSeverity)(-1)).toThrow(/unknown audit severity code/i);
    });
    (0, vitest_1.it)('throws on code 5', () => {
        (0, vitest_1.expect)(() => (0, security_audit_1.parseAuditSeverity)(5)).toThrow(/unknown audit severity code/i);
    });
});
// ============ KNOWN_AUDIT_TYPES ============
(0, vitest_1.describe)('KNOWN_AUDIT_TYPES', () => {
    (0, vitest_1.it)('contains all expected audit types', () => {
        (0, vitest_1.expect)(security_audit_1.KNOWN_AUDIT_TYPES.has('smart-contract')).toBe(true);
        (0, vitest_1.expect)(security_audit_1.KNOWN_AUDIT_TYPES.has('dependency-scan')).toBe(true);
        (0, vitest_1.expect)(security_audit_1.KNOWN_AUDIT_TYPES.has('penetration-test')).toBe(true);
        (0, vitest_1.expect)(security_audit_1.KNOWN_AUDIT_TYPES.has('code-review')).toBe(true);
        (0, vitest_1.expect)(security_audit_1.KNOWN_AUDIT_TYPES.has('fuzzing')).toBe(true);
    });
    (0, vitest_1.it)('does not contain unknown types', () => {
        (0, vitest_1.expect)(security_audit_1.KNOWN_AUDIT_TYPES.has('quantum-audit')).toBe(false);
        (0, vitest_1.expect)(security_audit_1.KNOWN_AUDIT_TYPES.has('')).toBe(false);
    });
});
