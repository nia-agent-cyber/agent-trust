/**
 * Query Module Tests
 * 
 * Tests for GraphQL queries and attestation fetching.
 * @see ../query.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchAttestationsForAgent,
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
