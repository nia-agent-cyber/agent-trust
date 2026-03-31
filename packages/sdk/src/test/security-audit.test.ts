import { describe, it, expect } from 'vitest';
import {
  normalizeSecurityAuditRequest,
  encodeSecurityAuditAttestation,
  parseAuditSeverity,
  KNOWN_AUDIT_TYPES,
} from '../security-audit';

const AUDITOR = '0x' + 'a'.repeat(40);
const SUBJECT = '0x' + 'b'.repeat(40);
const FIXED_TS = 1700000000;

// ============ normalizeSecurityAuditRequest ============

describe('normalizeSecurityAuditRequest', () => {
  it('normalizes a full valid request with string severity', () => {
    const result = normalizeSecurityAuditRequest({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'smart-contract',
      severity: 'high',
      passed: false,
      reportUri: 'ipfs://QmFoo',
      timestamp: FIXED_TS,
    });

    expect(result.auditor).toBe(AUDITOR);
    expect(result.subject).toBe(SUBJECT);
    expect(result.auditType).toBe('smart-contract');
    expect(result.severity).toBe('high');
    expect(result.severityCode).toBe(3);
    expect(result.passed).toBe(false);
    expect(result.reportUri).toBe('ipfs://QmFoo');
    expect(result.timestamp).toBe(BigInt(FIXED_TS));
  });

  it('normalizes a full valid request with numeric severity', () => {
    const result = normalizeSecurityAuditRequest({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'dependency-scan',
      severity: 2,
      passed: true,
      timestamp: FIXED_TS,
    });

    expect(result.severity).toBe('medium');
    expect(result.severityCode).toBe(2);
    expect(result.passed).toBe(true);
  });

  it('maps all severity strings correctly', () => {
    const pairs: [string, number][] = [
      ['none', 0],
      ['low', 1],
      ['medium', 2],
      ['high', 3],
      ['critical', 4],
    ];

    for (const [str, code] of pairs) {
      const result = normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: SUBJECT,
        auditType: 'code-review',
        severity: str as any,
        passed: true,
        timestamp: FIXED_TS,
      });
      expect(result.severity).toBe(str);
      expect(result.severityCode).toBe(code);
    }
  });

  it('maps all numeric severity codes correctly', () => {
    const pairs: [number, string][] = [
      [0, 'none'],
      [1, 'low'],
      [2, 'medium'],
      [3, 'high'],
      [4, 'critical'],
    ];

    for (const [code, str] of pairs) {
      const result = normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: SUBJECT,
        auditType: 'fuzzing',
        severity: code,
        passed: false,
        timestamp: FIXED_TS,
      });
      expect(result.severity).toBe(str);
      expect(result.severityCode).toBe(code);
    }
  });

  it('applies defaults for optional fields', () => {
    const result = normalizeSecurityAuditRequest({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'penetration-test',
      severity: 0,
      passed: true,
      timestamp: FIXED_TS,
    });

    expect(result.reportUri).toBe('');
  });

  it('defaults timestamp to ~now when omitted', () => {
    const before = BigInt(Math.floor(Date.now() / 1000)) - 2n;
    const result = normalizeSecurityAuditRequest({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'code-review',
      severity: 'none',
      passed: true,
    });
    const after = BigInt(Math.floor(Date.now() / 1000)) + 2n;

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });

  it('normalizes timestamp from ISO string', () => {
    const result = normalizeSecurityAuditRequest({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'smart-contract',
      severity: 'low',
      passed: true,
      timestamp: '2023-11-14T22:13:20.000Z',
    });
    expect(result.timestamp).toBe(BigInt(FIXED_TS));
  });

  it('normalizes timestamp from milliseconds', () => {
    const result = normalizeSecurityAuditRequest({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'smart-contract',
      severity: 'low',
      passed: true,
      timestamp: FIXED_TS * 1000,
    });
    expect(result.timestamp).toBe(BigInt(FIXED_TS));
  });

  it('normalizes timestamp from Date object', () => {
    const result = normalizeSecurityAuditRequest({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'fuzzing',
      severity: 'critical',
      passed: false,
      timestamp: new Date('2023-11-14T22:13:20.000Z'),
    });
    expect(result.timestamp).toBe(BigInt(FIXED_TS));
  });

  it('trims whitespace from string fields', () => {
    const result = normalizeSecurityAuditRequest({
      auditor: `  ${AUDITOR}  `,
      subject: `  ${SUBJECT}  `,
      auditType: '  smart-contract  ',
      severity: 'none',
      passed: true,
      reportUri: '  https://example.com/report  ',
      timestamp: FIXED_TS,
    });

    expect(result.auditor).toBe(AUDITOR);
    expect(result.subject).toBe(SUBJECT);
    expect(result.auditType).toBe('smart-contract');
    expect(result.reportUri).toBe('https://example.com/report');
  });

  it('throws when auditor is missing', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: '',
        subject: SUBJECT,
        auditType: 'smart-contract',
        severity: 0,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/auditor is required/i);
  });

  it('throws when auditor is whitespace-only', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: '   ',
        subject: SUBJECT,
        auditType: 'smart-contract',
        severity: 0,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/auditor is required/i);
  });

  it('throws when subject is missing', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: '',
        auditType: 'smart-contract',
        severity: 0,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/subject is required/i);
  });

  it('throws when auditType is missing', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: SUBJECT,
        auditType: '',
        severity: 0,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/auditType is required/i);
  });

  it('throws on unknown auditType', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: SUBJECT,
        auditType: 'quantum-audit',
        severity: 0,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/not a known value/i);
  });

  it('throws on invalid numeric severity (out of range)', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: SUBJECT,
        auditType: 'fuzzing',
        severity: 99,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/invalid severity code/i);
  });

  it('throws on negative numeric severity', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: SUBJECT,
        auditType: 'fuzzing',
        severity: -1,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/invalid severity code/i);
  });

  it('throws on invalid string severity', () => {
    expect(() =>
      normalizeSecurityAuditRequest({
        auditor: AUDITOR,
        subject: SUBJECT,
        auditType: 'code-review',
        severity: 'extreme' as any,
        passed: true,
        timestamp: FIXED_TS,
      })
    ).toThrow(/invalid severity string/i);
  });

  it('accepts all known auditType values', () => {
    for (const auditType of KNOWN_AUDIT_TYPES) {
      expect(() =>
        normalizeSecurityAuditRequest({
          auditor: AUDITOR,
          subject: SUBJECT,
          auditType,
          severity: 0,
          passed: true,
          timestamp: FIXED_TS,
        })
      ).not.toThrow();
    }
  });
});

// ============ encodeSecurityAuditAttestation ============

describe('encodeSecurityAuditAttestation', () => {
  it('returns a valid hex-encoded payload', () => {
    const encoded = encodeSecurityAuditAttestation({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'smart-contract',
      severity: 'critical',
      passed: false,
      reportUri: 'ipfs://QmEncode',
      timestamp: FIXED_TS,
    });

    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
    expect(encoded.length).toBeGreaterThan(10);
  });

  it('encodes a minimal request (no reportUri, default timestamp)', () => {
    const encoded = encodeSecurityAuditAttestation({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'dependency-scan',
      severity: 1,
      passed: true,
      timestamp: FIXED_TS,
    });

    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
    expect(encoded.length).toBeGreaterThan(10);
  });

  it('encodes with numeric severity', () => {
    const encoded = encodeSecurityAuditAttestation({
      auditor: AUDITOR,
      subject: SUBJECT,
      auditType: 'penetration-test',
      severity: 4,
      passed: false,
      timestamp: FIXED_TS,
    });

    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
  });
});

// ============ parseAuditSeverity ============

describe('parseAuditSeverity', () => {
  it('maps code 0 to none', () => {
    expect(parseAuditSeverity(0)).toBe('none');
  });

  it('maps code 1 to low', () => {
    expect(parseAuditSeverity(1)).toBe('low');
  });

  it('maps code 2 to medium', () => {
    expect(parseAuditSeverity(2)).toBe('medium');
  });

  it('maps code 3 to high', () => {
    expect(parseAuditSeverity(3)).toBe('high');
  });

  it('maps code 4 to critical', () => {
    expect(parseAuditSeverity(4)).toBe('critical');
  });

  it('throws on unknown code', () => {
    expect(() => parseAuditSeverity(99)).toThrow(/unknown audit severity code/i);
  });

  it('throws on negative code', () => {
    expect(() => parseAuditSeverity(-1)).toThrow(/unknown audit severity code/i);
  });

  it('throws on code 5', () => {
    expect(() => parseAuditSeverity(5)).toThrow(/unknown audit severity code/i);
  });
});

// ============ KNOWN_AUDIT_TYPES ============

describe('KNOWN_AUDIT_TYPES', () => {
  it('contains all expected audit types', () => {
    expect(KNOWN_AUDIT_TYPES.has('smart-contract')).toBe(true);
    expect(KNOWN_AUDIT_TYPES.has('dependency-scan')).toBe(true);
    expect(KNOWN_AUDIT_TYPES.has('penetration-test')).toBe(true);
    expect(KNOWN_AUDIT_TYPES.has('code-review')).toBe(true);
    expect(KNOWN_AUDIT_TYPES.has('fuzzing')).toBe(true);
  });

  it('does not contain unknown types', () => {
    expect(KNOWN_AUDIT_TYPES.has('quantum-audit')).toBe(false);
    expect(KNOWN_AUDIT_TYPES.has('')).toBe(false);
  });
});
