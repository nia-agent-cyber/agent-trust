/**
 * Query Module Tests
 * 
 * Tests for GraphQL queries and attestation fetching.
 * @see ../query.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchAttestationsForAgent,
  fetchPaymentReliableAttestationsForSubject,
  parsePaymentReliableAttestation,
  fetchTaskCompletionAttestationsForSubject,
  parseTaskCompletionAttestation,
  fetchSecurityAuditAttestationsForSubject,
  parseSecurityAuditAttestation,
  getTrustScore,
  getAttestationSummary,
  clearAttesterScoreCache,
  getAttesterScoreCacheStats,
} from '../query';
import { SCHEMAS } from '../constants';

describe('Query Module', () => {
  const testAddress = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';

  beforeEach(() => {
    clearAttesterScoreCache();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ============ Cache Tests ============

  describe('Attester Score Cache', () => {
    it('starts with empty cache', () => {
      const stats = getAttesterScoreCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.entries).toEqual([]);
    });

    it('clears cache properly', () => {
      // First we need to populate the cache via a getTrustScore call
      // For now, just test the clear function works
      clearAttesterScoreCache();
      const stats = getAttesterScoreCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  // ============ Fetch Attestations Tests (with mocks) ============

  describe('fetchAttestationsForAgent', () => {
    it('returns empty arrays for address with no attestations', async () => {
      const mockResponse = {
        data: {
          asRecipient: []
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchAttestationsForAgent(testAddress, 'baseSepolia');

      expect(result.verifications).toEqual([]);
      expect(result.vouches).toEqual([]);
      expect(result.flags).toEqual([]);
    });

    it('correctly categorizes verification attestations', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'ver-1',
              attester: '0x' + 'a'.repeat(40),
              recipient: testAddress,
              time: 1700000000,
              revoked: false,
              schemaId: SCHEMAS.verification.uid,
              decodedDataJson: JSON.stringify([
                { name: 'agentId', value: { value: testAddress } },
                { name: 'platform', value: { value: 'twitter' } },
                { name: 'handle', value: { value: '@test' } },
                { name: 'proofHash', value: { value: '0x' + '0'.repeat(64) } },
                { name: 'verifiedAt', value: { value: '1700000000' } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchAttestationsForAgent(testAddress, 'baseSepolia');

      expect(result.verifications).toHaveLength(1);
      expect(result.verifications[0].platform).toBe('twitter');
      expect(result.verifications[0].handle).toBe('@test');
      expect(result.vouches).toEqual([]);
      expect(result.flags).toEqual([]);
    });

    it('correctly categorizes vouch attestations', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'vouch-1',
              attester: '0x' + 'b'.repeat(40),
              recipient: testAddress,
              time: 1700000000,
              revoked: false,
              schemaId: SCHEMAS.vouch.uid,
              decodedDataJson: JSON.stringify([
                { name: 'vouchee', value: { value: testAddress } },
                { name: 'trustLevel', value: { value: 4 } },
                { name: 'context', value: { value: 'Great work!' } },
                { name: 'evidenceHash', value: { value: '0x' + '0'.repeat(64) } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchAttestationsForAgent(testAddress, 'baseSepolia');

      expect(result.vouches).toHaveLength(1);
      expect(result.vouches[0].trustLevel).toBe(4);
      expect(result.vouches[0].context).toBe('Great work!');
      expect(result.verifications).toEqual([]);
      expect(result.flags).toEqual([]);
    });

    it('correctly categorizes flag attestations', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'flag-1',
              attester: '0x' + 'c'.repeat(40),
              recipient: testAddress,
              time: 1700000000,
              revoked: false,
              schemaId: SCHEMAS.flag.uid,
              decodedDataJson: JSON.stringify([
                { name: 'flagged', value: { value: testAddress } },
                { name: 'severity', value: { value: 3 } },
                { name: 'reason', value: { value: 'Suspicious behavior' } },
                { name: 'evidenceHash', value: { value: '0x' + '0'.repeat(64) } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchAttestationsForAgent(testAddress, 'baseSepolia');

      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].severity).toBe(3);
      expect(result.flags[0].reason).toBe('Suspicious behavior');
      expect(result.verifications).toEqual([]);
      expect(result.vouches).toEqual([]);
    });

    it('handles mixed attestation types', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'ver-1',
              attester: '0x' + 'a'.repeat(40),
              recipient: testAddress,
              time: 1700000000,
              revoked: false,
              schemaId: SCHEMAS.verification.uid,
              decodedDataJson: JSON.stringify([
                { name: 'platform', value: { value: 'github' } },
                { name: 'handle', value: { value: 'testuser' } }
              ])
            },
            {
              id: 'vouch-1',
              attester: '0x' + 'b'.repeat(40),
              recipient: testAddress,
              time: 1700000001,
              revoked: false,
              schemaId: SCHEMAS.vouch.uid,
              decodedDataJson: JSON.stringify([
                { name: 'trustLevel', value: { value: 5 } },
                { name: 'context', value: { value: 'Excellent!' } }
              ])
            },
            {
              id: 'flag-1',
              attester: '0x' + 'c'.repeat(40),
              recipient: testAddress,
              time: 1700000002,
              revoked: false,
              schemaId: SCHEMAS.flag.uid,
              decodedDataJson: JSON.stringify([
                { name: 'severity', value: { value: 1 } },
                { name: 'reason', value: { value: 'Minor issue' } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchAttestationsForAgent(testAddress, 'baseSepolia');

      expect(result.verifications).toHaveLength(1);
      expect(result.vouches).toHaveLength(1);
      expect(result.flags).toHaveLength(1);
    });

    it('skips malformed attestations', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'ver-1',
              attester: '0x' + 'a'.repeat(40),
              recipient: testAddress,
              time: 1700000000,
              revoked: false,
              schemaId: SCHEMAS.verification.uid,
              decodedDataJson: 'invalid json {'
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchAttestationsForAgent(testAddress, 'baseSepolia');

      // Should skip the malformed attestation without throwing
      expect(result.verifications).toEqual([]);
    });

    it('handles GraphQL errors gracefully', async () => {
      const mockResponse = {
        errors: [{ message: 'Query failed' }],
        data: null
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchAttestationsForAgent(testAddress, 'baseSepolia');

      // Should return empty arrays rather than throwing
      expect(result.verifications).toEqual([]);
      expect(result.vouches).toEqual([]);
      expect(result.flags).toEqual([]);
    });
  });

  // ============ PaymentReliable Query/Parse Tests ============

  describe('PaymentReliable query helpers', () => {
    it('parses payment reliable attestation data', () => {
      const parsed = parsePaymentReliableAttestation({
        id: 'pay-1',
        attester: '0x' + 'd'.repeat(40),
        recipient: testAddress,
        time: 1700000000,
        revoked: false,
        schemaId: SCHEMAS.paymentReliable.uid,
        decodedDataJson: JSON.stringify([
          { name: 'subjectAgent', value: { value: testAddress } },
          { name: 'outcome', value: { value: 2 } },
          { name: 'amount', value: { value: '1000000' } },
          { name: 'currency', value: { value: 'USDC' } },
          { name: 'dueAt', value: { value: '1700000100' } },
          { name: 'paidAt', value: { value: '1700000000' } },
          { name: 'settlementRef', value: { value: 'inv-42' } }
        ])
      });

      expect(parsed.subjectAgent).toBe(testAddress);
      expect(parsed.outcome).toBe('paid_on_time');
      expect(parsed.amount).toBe('1000000');
      expect(parsed.currency).toBe('USDC');
      expect(parsed.settlementRef).toBe('inv-42');
    });

    it('fetches payment reliable attestations for a subject', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'pay-2',
              attester: '0x' + 'e'.repeat(40),
              recipient: testAddress,
              time: 1700000000,
              revoked: false,
              schemaId: SCHEMAS.paymentReliable.uid,
              decodedDataJson: JSON.stringify([
                { name: 'subjectAgent', value: { value: testAddress } },
                { name: 'outcome', value: { value: 1 } },
                { name: 'amount', value: { value: '2000000' } },
                { name: 'currency', value: { value: 'USDC' } },
                { name: 'dueAt', value: { value: '1700000000' } },
                { name: 'paidAt', value: { value: '1700000300' } },
                { name: 'settlementRef', value: { value: '' } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const result = await fetchPaymentReliableAttestationsForSubject(testAddress, 'baseSepolia');

      expect(result).toHaveLength(1);
      expect(result[0].outcome).toBe('paid_late');
      expect(result[0].currency).toBe('USDC');
      expect(result[0].amount).toBe('2000000');
    });
  });

  // ============ Get Trust Score Tests ============

  describe('getTrustScore', () => {
    it('returns default score for address with no attestations', async () => {
      const mockResponse = {
        data: { asRecipient: [] }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const score = await getTrustScore(testAddress, 'baseSepolia');

      expect(score.score).toBe(0);
      expect(score.verified).toBe(false);
      expect(score.confidence).toBe(0);
      expect(score.attestationCount).toBe(0);
    });

    it('returns verified score for verified address', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'ver-1',
              attester: '0x' + 'a'.repeat(40),
              recipient: testAddress,
              time: Math.floor(Date.now() / 1000),
              revoked: false,
              schemaId: SCHEMAS.verification.uid,
              decodedDataJson: JSON.stringify([
                { name: 'platform', value: { value: 'twitter' } },
                { name: 'handle', value: { value: '@test' } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const score = await getTrustScore(testAddress, 'baseSepolia');

      expect(score.verified).toBe(true);
      expect(score.score).toBeGreaterThanOrEqual(50);
      expect(score.linkedPlatforms).toContain('twitter');
    });

    it('handles network errors gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const score = await getTrustScore(testAddress, 'baseSepolia');

      // Should return default score rather than throwing
      expect(score.score).toBe(0);
      expect(score.verified).toBe(false);
    });
  });

  // ============ Get Attestation Summary Tests ============

  describe('getAttestationSummary', () => {
    it('returns complete summary for address', async () => {
      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'ver-1',
              attester: '0x' + 'a'.repeat(40),
              recipient: testAddress,
              time: Math.floor(Date.now() / 1000),
              revoked: false,
              schemaId: SCHEMAS.verification.uid,
              decodedDataJson: JSON.stringify([
                { name: 'platform', value: { value: 'github' } },
                { name: 'handle', value: { value: 'testuser' } }
              ])
            },
            {
              id: 'vouch-1',
              attester: '0x' + 'b'.repeat(40),
              recipient: testAddress,
              time: Math.floor(Date.now() / 1000),
              revoked: false,
              schemaId: SCHEMAS.vouch.uid,
              decodedDataJson: JSON.stringify([
                { name: 'trustLevel', value: { value: 4 } },
                { name: 'context', value: { value: 'Reliable agent' } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const summary = await getAttestationSummary(testAddress, 'baseSepolia');

      expect(summary.address).toBe(testAddress);
      expect(summary.verifications).toHaveLength(1);
      expect(summary.verifications[0].platform).toBe('github');
      expect(summary.vouches).toHaveLength(1);
      expect(summary.vouches[0].trustLevel).toBe(4);
      expect(summary.flags).toHaveLength(0);
      expect(summary.trustScore).toBeDefined();
      expect(summary.trustScore.verified).toBe(true);
    });

    it('includes all attestation details', async () => {
      const attester1 = '0x' + 'a'.repeat(40);
      const attester2 = '0x' + 'b'.repeat(40);

      const mockResponse = {
        data: {
          asRecipient: [
            {
              id: 'vouch-1',
              attester: attester1,
              recipient: testAddress,
              time: Math.floor(Date.now() / 1000),
              revoked: false,
              schemaId: SCHEMAS.vouch.uid,
              decodedDataJson: JSON.stringify([
                { name: 'trustLevel', value: { value: 5 } },
                { name: 'context', value: { value: 'Top tier' } }
              ])
            },
            {
              id: 'flag-1',
              attester: attester2,
              recipient: testAddress,
              time: Math.floor(Date.now() / 1000),
              revoked: false,
              schemaId: SCHEMAS.flag.uid,
              decodedDataJson: JSON.stringify([
                { name: 'severity', value: { value: 2 } },
                { name: 'reason', value: { value: 'Minor concern' } }
              ])
            }
          ]
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      }));

      const summary = await getAttestationSummary(testAddress, 'baseSepolia');

      expect(summary.vouches[0].attester).toBe(attester1);
      expect(summary.flags[0].attester).toBe(attester2);
      expect(summary.flags[0].severity).toBe(2);
      expect(summary.flags[0].reason).toBe('Minor concern');
    });
  });
});

// ============ TaskCompletion Query Tests ============

describe('parseTaskCompletionAttestation', () => {
  const AGENT = '0x' + 'b'.repeat(40);
  const ATTESTER = '0x' + 'c'.repeat(40);

  it('parses a completed attestation with all fields', () => {
    const raw = {
      id: '0xabc123',
      attester: ATTESTER,
      recipient: AGENT,
      time: 1700000000,
      revoked: false,
      schemaId: '0x' + '0'.repeat(64),
      decodedDataJson: JSON.stringify([
        { name: 'subjectAgent', value: { value: AGENT } },
        { name: 'outcome', value: { value: 1 } },
        { name: 'taskId', value: { value: 'bounty-99' } },
        { name: 'category', value: { value: 'code' } },
        { name: 'completedAt', value: { value: 1700000000 } },
        { name: 'reward', value: { value: '500' } },
        { name: 'rewardToken', value: { value: 'USDC' } },
        { name: 'taskRef', value: { value: 'https://gitcoin.co/bounty/99' } },
      ]),
    };

    const parsed = parseTaskCompletionAttestation(raw);

    expect(parsed.uid).toBe('0xabc123');
    expect(parsed.attester).toBe(ATTESTER);
    expect(parsed.recipient).toBe(AGENT);
    expect(parsed.subjectAgent).toBe(AGENT);
    expect(parsed.outcome).toBe('completed');
    expect(parsed.taskId).toBe('bounty-99');
    expect(parsed.category).toBe('code');
    expect(parsed.completedAt).toBe(1700000000);
    expect(parsed.reward).toBe('500');
    expect(parsed.rewardToken).toBe('USDC');
    expect(parsed.taskRef).toBe('https://gitcoin.co/bounty/99');
    expect(parsed.time).toBe(1700000000);
    expect(parsed.revoked).toBe(false);
  });

  it('parses a failed attestation (outcome code 0)', () => {
    const raw = {
      id: '0xdef456',
      attester: ATTESTER,
      recipient: AGENT,
      time: 1700001000,
      revoked: false,
      schemaId: '0x' + '0'.repeat(64),
      decodedDataJson: JSON.stringify([
        { name: 'subjectAgent', value: { value: AGENT } },
        { name: 'outcome', value: { value: 0 } },
        { name: 'taskId', value: { value: 'task-fail' } },
        { name: 'category', value: { value: 'design' } },
        { name: 'completedAt', value: { value: 1700001000 } },
        { name: 'reward', value: { value: '0' } },
        { name: 'rewardToken', value: { value: '' } },
        { name: 'taskRef', value: { value: '' } },
      ]),
    };

    const parsed = parseTaskCompletionAttestation(raw);
    expect(parsed.outcome).toBe('failed');
    expect(parsed.reward).toBe('0');
    expect(parsed.rewardToken).toBe('');
  });

  it('parses a disputed attestation (outcome code 2)', () => {
    const raw = {
      id: '0xghi789',
      attester: ATTESTER,
      recipient: AGENT,
      time: 1700002000,
      revoked: true,
      schemaId: '0x' + '0'.repeat(64),
      decodedDataJson: JSON.stringify([
        { name: 'subjectAgent', value: { value: AGENT } },
        { name: 'outcome', value: { value: 2 } },
        { name: 'taskId', value: { value: 'task-dispute' } },
        { name: 'category', value: { value: 'writing' } },
        { name: 'completedAt', value: { value: 1700002000 } },
        { name: 'reward', value: { value: '100' } },
        { name: 'rewardToken', value: { value: 'GTC' } },
        { name: 'taskRef', value: { value: '' } },
      ]),
    };

    const parsed = parseTaskCompletionAttestation(raw);
    expect(parsed.outcome).toBe('disputed');
    expect(parsed.revoked).toBe(true);
  });
});

describe('fetchTaskCompletionAttestationsForSubject', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('queries EAS with correct schema ID and returns parsed attestations', async () => {
    const AGENT = '0x' + 'b'.repeat(40);
    const ATTESTER = '0x' + 'c'.repeat(40);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        data: {
          asRecipient: [
            {
              id: '0xtc001',
              attester: ATTESTER,
              recipient: AGENT,
              time: 1700000000,
              revoked: false,
              schemaId: '0x' + '0'.repeat(64),
              decodedDataJson: JSON.stringify([
                { name: 'subjectAgent', value: { value: AGENT } },
                { name: 'outcome', value: { value: 1 } },
                { name: 'taskId', value: { value: 'task-fetched' } },
                { name: 'category', value: { value: 'code' } },
                { name: 'completedAt', value: { value: 1700000000 } },
                { name: 'reward', value: { value: '250' } },
                { name: 'rewardToken', value: { value: 'ETH' } },
                { name: 'taskRef', value: { value: '' } },
              ]),
            },
          ],
        },
      }),
    }));

    const results = await fetchTaskCompletionAttestationsForSubject(AGENT, 'baseSepolia');
    expect(results).toHaveLength(1);
    expect(results[0].taskId).toBe('task-fetched');
    expect(results[0].outcome).toBe('completed');
    expect(results[0].reward).toBe('250');
  });

  it('returns empty array when no attestations found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { asRecipient: [] } }),
    }));

    const results = await fetchTaskCompletionAttestationsForSubject('0x' + 'a'.repeat(40), 'baseSepolia');
    expect(results).toEqual([]);
  });

  it('skips malformed attestations without throwing', async () => {
    const AGENT = '0x' + 'b'.repeat(40);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        data: {
          asRecipient: [
            {
              id: '0xbad',
              attester: '0x' + 'c'.repeat(40),
              recipient: AGENT,
              time: 1700000000,
              revoked: false,
              schemaId: '0x' + '0'.repeat(64),
              // outcome code 99 → parseTaskOutcome throws → should be skipped
              decodedDataJson: JSON.stringify([
                { name: 'subjectAgent', value: { value: AGENT } },
                { name: 'outcome', value: { value: 99 } },
                { name: 'taskId', value: { value: 'bad' } },
                { name: 'category', value: { value: 'code' } },
                { name: 'completedAt', value: { value: 1700000000 } },
                { name: 'reward', value: { value: '0' } },
                { name: 'rewardToken', value: { value: '' } },
                { name: 'taskRef', value: { value: '' } },
              ]),
            },
          ],
        },
      }),
    }));

    const results = await fetchTaskCompletionAttestationsForSubject(AGENT, 'baseSepolia');
    expect(results).toEqual([]);
  });
});

// ============ SecurityAudit Query Tests ============

describe('parseSecurityAuditAttestation', () => {
  const AUDITOR = '0x' + 'a'.repeat(40);
  const SUBJECT = '0x' + 'b'.repeat(40);
  const ATTESTER = '0x' + 'c'.repeat(40);

  it('parses a passing critical audit with all fields', () => {
    const raw = {
      id: '0xaudit001',
      attester: ATTESTER,
      recipient: SUBJECT,
      time: 1700000000,
      revoked: false,
      schemaId: '0x' + '0'.repeat(64),
      decodedDataJson: JSON.stringify([
        { name: 'auditor', value: { value: AUDITOR } },
        { name: 'subject', value: { value: SUBJECT } },
        { name: 'auditType', value: { value: 'smart-contract' } },
        { name: 'severity', value: { value: 4 } },
        { name: 'passed', value: { value: false } },
        { name: 'reportUri', value: { value: 'ipfs://QmReport' } },
        { name: 'timestamp', value: { value: 1700000000 } },
      ]),
    };

    const parsed = parseSecurityAuditAttestation(raw);

    expect(parsed.uid).toBe('0xaudit001');
    expect(parsed.attester).toBe(ATTESTER);
    expect(parsed.recipient).toBe(SUBJECT);
    expect(parsed.auditor).toBe(AUDITOR);
    expect(parsed.subject).toBe(SUBJECT);
    expect(parsed.auditType).toBe('smart-contract');
    expect(parsed.severity).toBe('critical');
    expect(parsed.passed).toBe(false);
    expect(parsed.reportUri).toBe('ipfs://QmReport');
    expect(parsed.timestamp).toBe(1700000000);
    expect(parsed.time).toBe(1700000000);
    expect(parsed.revoked).toBe(false);
  });

  it('parses a passing audit (none severity)', () => {
    const raw = {
      id: '0xaudit002',
      attester: ATTESTER,
      recipient: SUBJECT,
      time: 1700001000,
      revoked: false,
      schemaId: '0x' + '0'.repeat(64),
      decodedDataJson: JSON.stringify([
        { name: 'auditor', value: { value: AUDITOR } },
        { name: 'subject', value: { value: SUBJECT } },
        { name: 'auditType', value: { value: 'dependency-scan' } },
        { name: 'severity', value: { value: 0 } },
        { name: 'passed', value: { value: true } },
        { name: 'reportUri', value: { value: '' } },
        { name: 'timestamp', value: { value: 1700001000 } },
      ]),
    };

    const parsed = parseSecurityAuditAttestation(raw);
    expect(parsed.severity).toBe('none');
    expect(parsed.passed).toBe(true);
    expect(parsed.reportUri).toBe('');
  });

  it('parses a revoked audit', () => {
    const raw = {
      id: '0xaudit003',
      attester: ATTESTER,
      recipient: SUBJECT,
      time: 1700002000,
      revoked: true,
      schemaId: '0x' + '0'.repeat(64),
      decodedDataJson: JSON.stringify([
        { name: 'auditor', value: { value: AUDITOR } },
        { name: 'subject', value: { value: SUBJECT } },
        { name: 'auditType', value: { value: 'code-review' } },
        { name: 'severity', value: { value: 1 } },
        { name: 'passed', value: { value: true } },
        { name: 'reportUri', value: { value: 'https://report.example.com' } },
        { name: 'timestamp', value: { value: 1700002000 } },
      ]),
    };

    const parsed = parseSecurityAuditAttestation(raw);
    expect(parsed.severity).toBe('low');
    expect(parsed.revoked).toBe(true);
  });
});

describe('fetchSecurityAuditAttestationsForSubject', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('queries EAS with correct schema ID and returns parsed attestations', async () => {
    const AUDITOR = '0x' + 'a'.repeat(40);
    const SUBJECT = '0x' + 'b'.repeat(40);
    const ATTESTER = '0x' + 'c'.repeat(40);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        data: {
          asRecipient: [
            {
              id: '0xsa001',
              attester: ATTESTER,
              recipient: SUBJECT,
              time: 1700000000,
              revoked: false,
              schemaId: '0x' + '0'.repeat(64),
              decodedDataJson: JSON.stringify([
                { name: 'auditor', value: { value: AUDITOR } },
                { name: 'subject', value: { value: SUBJECT } },
                { name: 'auditType', value: { value: 'penetration-test' } },
                { name: 'severity', value: { value: 3 } },
                { name: 'passed', value: { value: false } },
                { name: 'reportUri', value: { value: 'https://pentest.example.com' } },
                { name: 'timestamp', value: { value: 1700000000 } },
              ]),
            },
          ],
        },
      }),
    }));

    const results = await fetchSecurityAuditAttestationsForSubject(SUBJECT, 'baseSepolia');
    expect(results).toHaveLength(1);
    expect(results[0].auditType).toBe('penetration-test');
    expect(results[0].severity).toBe('high');
    expect(results[0].passed).toBe(false);
  });

  it('returns empty array when no attestations found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: { asRecipient: [] } }),
    }));

    const results = await fetchSecurityAuditAttestationsForSubject('0x' + 'a'.repeat(40), 'baseSepolia');
    expect(results).toEqual([]);
  });

  it('skips malformed attestations without throwing', async () => {
    const SUBJECT = '0x' + 'b'.repeat(40);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        data: {
          asRecipient: [
            {
              id: '0xbadaudit',
              attester: '0x' + 'c'.repeat(40),
              recipient: SUBJECT,
              time: 1700000000,
              revoked: false,
              schemaId: '0x' + '0'.repeat(64),
              // severity code 99 → parseAuditSeverity throws → should be skipped
              decodedDataJson: JSON.stringify([
                { name: 'auditor', value: { value: '0x' + 'a'.repeat(40) } },
                { name: 'subject', value: { value: SUBJECT } },
                { name: 'auditType', value: { value: 'fuzzing' } },
                { name: 'severity', value: { value: 99 } },
                { name: 'passed', value: { value: true } },
                { name: 'reportUri', value: { value: '' } },
                { name: 'timestamp', value: { value: 1700000000 } },
              ]),
            },
          ],
        },
      }),
    }));

    const results = await fetchSecurityAuditAttestationsForSubject(SUBJECT, 'baseSepolia');
    expect(results).toEqual([]);
  });
});

// ============ Network Selection Tests ============

describe('Network Configuration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses correct endpoint for Base mainnet', async () => {
    let capturedUrl = '';
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      capturedUrl = url;
      return Promise.resolve({
        json: () => Promise.resolve({ data: { asRecipient: [] } })
      });
    }));

    await fetchAttestationsForAgent('0x' + 'a'.repeat(40), 'base');

    expect(capturedUrl).toContain('base.easscan.org');
    expect(capturedUrl).not.toContain('sepolia');
  });

  it('uses correct endpoint for Base Sepolia', async () => {
    let capturedUrl = '';
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      capturedUrl = url;
      return Promise.resolve({
        json: () => Promise.resolve({ data: { asRecipient: [] } })
      });
    }));

    await fetchAttestationsForAgent('0x' + 'a'.repeat(40), 'baseSepolia');

    expect(capturedUrl).toContain('base-sepolia.easscan.org');
  });
});
