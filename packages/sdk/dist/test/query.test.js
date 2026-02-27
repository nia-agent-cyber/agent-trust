"use strict";
/**
 * Query Module Tests
 *
 * Tests for GraphQL queries and attestation fetching.
 * @see ../query.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const query_1 = require("../query");
const constants_1 = require("../constants");
(0, vitest_1.describe)('Query Module', () => {
    const testAddress = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
    (0, vitest_1.beforeEach)(() => {
        (0, query_1.clearAttesterScoreCache)();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.unstubAllGlobals();
    });
    // ============ Cache Tests ============
    (0, vitest_1.describe)('Attester Score Cache', () => {
        (0, vitest_1.it)('starts with empty cache', () => {
            const stats = (0, query_1.getAttesterScoreCacheStats)();
            (0, vitest_1.expect)(stats.size).toBe(0);
            (0, vitest_1.expect)(stats.entries).toEqual([]);
        });
        (0, vitest_1.it)('clears cache properly', () => {
            // First we need to populate the cache via a getTrustScore call
            // For now, just test the clear function works
            (0, query_1.clearAttesterScoreCache)();
            const stats = (0, query_1.getAttesterScoreCacheStats)();
            (0, vitest_1.expect)(stats.size).toBe(0);
        });
    });
    // ============ Fetch Attestations Tests (with mocks) ============
    (0, vitest_1.describe)('fetchAttestationsForAgent', () => {
        (0, vitest_1.it)('returns empty arrays for address with no attestations', async () => {
            const mockResponse = {
                data: {
                    asRecipient: []
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await (0, query_1.fetchAttestationsForAgent)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(result.verifications).toEqual([]);
            (0, vitest_1.expect)(result.vouches).toEqual([]);
            (0, vitest_1.expect)(result.flags).toEqual([]);
        });
        (0, vitest_1.it)('correctly categorizes verification attestations', async () => {
            const mockResponse = {
                data: {
                    asRecipient: [
                        {
                            id: 'ver-1',
                            attester: '0x' + 'a'.repeat(40),
                            recipient: testAddress,
                            time: 1700000000,
                            revoked: false,
                            schemaId: constants_1.SCHEMAS.verification.uid,
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
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await (0, query_1.fetchAttestationsForAgent)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(result.verifications).toHaveLength(1);
            (0, vitest_1.expect)(result.verifications[0].platform).toBe('twitter');
            (0, vitest_1.expect)(result.verifications[0].handle).toBe('@test');
            (0, vitest_1.expect)(result.vouches).toEqual([]);
            (0, vitest_1.expect)(result.flags).toEqual([]);
        });
        (0, vitest_1.it)('correctly categorizes vouch attestations', async () => {
            const mockResponse = {
                data: {
                    asRecipient: [
                        {
                            id: 'vouch-1',
                            attester: '0x' + 'b'.repeat(40),
                            recipient: testAddress,
                            time: 1700000000,
                            revoked: false,
                            schemaId: constants_1.SCHEMAS.vouch.uid,
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
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await (0, query_1.fetchAttestationsForAgent)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(result.vouches).toHaveLength(1);
            (0, vitest_1.expect)(result.vouches[0].trustLevel).toBe(4);
            (0, vitest_1.expect)(result.vouches[0].context).toBe('Great work!');
            (0, vitest_1.expect)(result.verifications).toEqual([]);
            (0, vitest_1.expect)(result.flags).toEqual([]);
        });
        (0, vitest_1.it)('correctly categorizes flag attestations', async () => {
            const mockResponse = {
                data: {
                    asRecipient: [
                        {
                            id: 'flag-1',
                            attester: '0x' + 'c'.repeat(40),
                            recipient: testAddress,
                            time: 1700000000,
                            revoked: false,
                            schemaId: constants_1.SCHEMAS.flag.uid,
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
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await (0, query_1.fetchAttestationsForAgent)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(result.flags).toHaveLength(1);
            (0, vitest_1.expect)(result.flags[0].severity).toBe(3);
            (0, vitest_1.expect)(result.flags[0].reason).toBe('Suspicious behavior');
            (0, vitest_1.expect)(result.verifications).toEqual([]);
            (0, vitest_1.expect)(result.vouches).toEqual([]);
        });
        (0, vitest_1.it)('handles mixed attestation types', async () => {
            const mockResponse = {
                data: {
                    asRecipient: [
                        {
                            id: 'ver-1',
                            attester: '0x' + 'a'.repeat(40),
                            recipient: testAddress,
                            time: 1700000000,
                            revoked: false,
                            schemaId: constants_1.SCHEMAS.verification.uid,
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
                            schemaId: constants_1.SCHEMAS.vouch.uid,
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
                            schemaId: constants_1.SCHEMAS.flag.uid,
                            decodedDataJson: JSON.stringify([
                                { name: 'severity', value: { value: 1 } },
                                { name: 'reason', value: { value: 'Minor issue' } }
                            ])
                        }
                    ]
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await (0, query_1.fetchAttestationsForAgent)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(result.verifications).toHaveLength(1);
            (0, vitest_1.expect)(result.vouches).toHaveLength(1);
            (0, vitest_1.expect)(result.flags).toHaveLength(1);
        });
        (0, vitest_1.it)('skips malformed attestations', async () => {
            const mockResponse = {
                data: {
                    asRecipient: [
                        {
                            id: 'ver-1',
                            attester: '0x' + 'a'.repeat(40),
                            recipient: testAddress,
                            time: 1700000000,
                            revoked: false,
                            schemaId: constants_1.SCHEMAS.verification.uid,
                            decodedDataJson: 'invalid json {'
                        }
                    ]
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await (0, query_1.fetchAttestationsForAgent)(testAddress, 'baseSepolia');
            // Should skip the malformed attestation without throwing
            (0, vitest_1.expect)(result.verifications).toEqual([]);
        });
        (0, vitest_1.it)('handles GraphQL errors gracefully', async () => {
            const mockResponse = {
                errors: [{ message: 'Query failed' }],
                data: null
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const result = await (0, query_1.fetchAttestationsForAgent)(testAddress, 'baseSepolia');
            // Should return empty arrays rather than throwing
            (0, vitest_1.expect)(result.verifications).toEqual([]);
            (0, vitest_1.expect)(result.vouches).toEqual([]);
            (0, vitest_1.expect)(result.flags).toEqual([]);
        });
    });
    // ============ Get Trust Score Tests ============
    (0, vitest_1.describe)('getTrustScore', () => {
        (0, vitest_1.it)('returns default score for address with no attestations', async () => {
            const mockResponse = {
                data: { asRecipient: [] }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const score = await (0, query_1.getTrustScore)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(score.score).toBe(0);
            (0, vitest_1.expect)(score.verified).toBe(false);
            (0, vitest_1.expect)(score.confidence).toBe(0);
            (0, vitest_1.expect)(score.attestationCount).toBe(0);
        });
        (0, vitest_1.it)('returns verified score for verified address', async () => {
            const mockResponse = {
                data: {
                    asRecipient: [
                        {
                            id: 'ver-1',
                            attester: '0x' + 'a'.repeat(40),
                            recipient: testAddress,
                            time: Math.floor(Date.now() / 1000),
                            revoked: false,
                            schemaId: constants_1.SCHEMAS.verification.uid,
                            decodedDataJson: JSON.stringify([
                                { name: 'platform', value: { value: 'twitter' } },
                                { name: 'handle', value: { value: '@test' } }
                            ])
                        }
                    ]
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const score = await (0, query_1.getTrustScore)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(score.verified).toBe(true);
            (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(50);
            (0, vitest_1.expect)(score.linkedPlatforms).toContain('twitter');
        });
        (0, vitest_1.it)('handles network errors gracefully', async () => {
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockRejectedValue(new Error('Network error')));
            const score = await (0, query_1.getTrustScore)(testAddress, 'baseSepolia');
            // Should return default score rather than throwing
            (0, vitest_1.expect)(score.score).toBe(0);
            (0, vitest_1.expect)(score.verified).toBe(false);
        });
    });
    // ============ Get Attestation Summary Tests ============
    (0, vitest_1.describe)('getAttestationSummary', () => {
        (0, vitest_1.it)('returns complete summary for address', async () => {
            const mockResponse = {
                data: {
                    asRecipient: [
                        {
                            id: 'ver-1',
                            attester: '0x' + 'a'.repeat(40),
                            recipient: testAddress,
                            time: Math.floor(Date.now() / 1000),
                            revoked: false,
                            schemaId: constants_1.SCHEMAS.verification.uid,
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
                            schemaId: constants_1.SCHEMAS.vouch.uid,
                            decodedDataJson: JSON.stringify([
                                { name: 'trustLevel', value: { value: 4 } },
                                { name: 'context', value: { value: 'Reliable agent' } }
                            ])
                        }
                    ]
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const summary = await (0, query_1.getAttestationSummary)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(summary.address).toBe(testAddress);
            (0, vitest_1.expect)(summary.verifications).toHaveLength(1);
            (0, vitest_1.expect)(summary.verifications[0].platform).toBe('github');
            (0, vitest_1.expect)(summary.vouches).toHaveLength(1);
            (0, vitest_1.expect)(summary.vouches[0].trustLevel).toBe(4);
            (0, vitest_1.expect)(summary.flags).toHaveLength(0);
            (0, vitest_1.expect)(summary.trustScore).toBeDefined();
            (0, vitest_1.expect)(summary.trustScore.verified).toBe(true);
        });
        (0, vitest_1.it)('includes all attestation details', async () => {
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
                            schemaId: constants_1.SCHEMAS.vouch.uid,
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
                            schemaId: constants_1.SCHEMAS.flag.uid,
                            decodedDataJson: JSON.stringify([
                                { name: 'severity', value: { value: 2 } },
                                { name: 'reason', value: { value: 'Minor concern' } }
                            ])
                        }
                    ]
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                json: () => Promise.resolve(mockResponse)
            }));
            const summary = await (0, query_1.getAttestationSummary)(testAddress, 'baseSepolia');
            (0, vitest_1.expect)(summary.vouches[0].attester).toBe(attester1);
            (0, vitest_1.expect)(summary.flags[0].attester).toBe(attester2);
            (0, vitest_1.expect)(summary.flags[0].severity).toBe(2);
            (0, vitest_1.expect)(summary.flags[0].reason).toBe('Minor concern');
        });
    });
});
// ============ Network Selection Tests ============
(0, vitest_1.describe)('Network Configuration', () => {
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.unstubAllGlobals();
    });
    (0, vitest_1.it)('uses correct endpoint for Base mainnet', async () => {
        let capturedUrl = '';
        vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockImplementation((url) => {
            capturedUrl = url;
            return Promise.resolve({
                json: () => Promise.resolve({ data: { asRecipient: [] } })
            });
        }));
        await (0, query_1.fetchAttestationsForAgent)('0x' + 'a'.repeat(40), 'base');
        (0, vitest_1.expect)(capturedUrl).toContain('base.easscan.org');
        (0, vitest_1.expect)(capturedUrl).not.toContain('sepolia');
    });
    (0, vitest_1.it)('uses correct endpoint for Base Sepolia', async () => {
        let capturedUrl = '';
        vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockImplementation((url) => {
            capturedUrl = url;
            return Promise.resolve({
                json: () => Promise.resolve({ data: { asRecipient: [] } })
            });
        }));
        await (0, query_1.fetchAttestationsForAgent)('0x' + 'a'.repeat(40), 'baseSepolia');
        (0, vitest_1.expect)(capturedUrl).toContain('base-sepolia.easscan.org');
    });
});
