"use strict";
/**
 * Integration Tests with Base Sepolia
 *
 * These tests make real network calls to Base Sepolia testnet.
 * They verify the SDK works correctly with the actual EAS infrastructure.
 *
 * Run with: npm test -- --run integration.test.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const agent_trust_1 = require("../agent-trust");
const query_1 = require("../query");
const constants_1 = require("../constants");
// Test addresses - Nia's wallet (has real attestations on Sepolia)
const NIA_ADDRESS = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
// Known attestation UID from testnet
const KNOWN_VOUCH_ATTESTER = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
(0, vitest_1.describe)('Integration: Base Sepolia', () => {
    // ============ Network Configuration Tests ============
    (0, vitest_1.describe)('Network Configuration', () => {
        (0, vitest_1.it)('has valid schema UIDs for Base Sepolia', () => {
            (0, vitest_1.expect)(constants_1.SCHEMAS.verification.uid).toMatch(/^0x[a-f0-9]{64}$/i);
            (0, vitest_1.expect)(constants_1.SCHEMAS.vouch.uid).toMatch(/^0x[a-f0-9]{64}$/i);
            (0, vitest_1.expect)(constants_1.SCHEMAS.flag.uid).toMatch(/^0x[a-f0-9]{64}$/i);
        });
        (0, vitest_1.it)('has correct Base Sepolia network config', () => {
            const config = constants_1.NETWORKS.baseSepolia;
            (0, vitest_1.expect)(config.chainId).toBe(84532);
            (0, vitest_1.expect)(config.name).toBe('Base Sepolia');
            (0, vitest_1.expect)(config.rpcUrl).toBe('https://sepolia.base.org');
            (0, vitest_1.expect)(config.easAddress).toBe('0x4200000000000000000000000000000000000021');
        });
        (0, vitest_1.it)('has correct Base Mainnet network config', () => {
            const config = constants_1.NETWORKS.base;
            (0, vitest_1.expect)(config.chainId).toBe(8453);
            (0, vitest_1.expect)(config.name).toBe('Base');
            (0, vitest_1.expect)(config.rpcUrl).toBe('https://mainnet.base.org');
            (0, vitest_1.expect)(config.easAddress).toBe('0x4200000000000000000000000000000000000021');
        });
    });
    // ============ GraphQL Query Tests ============
    (0, vitest_1.describe)('GraphQL Queries (Live)', () => {
        (0, vitest_1.it)('successfully queries EAS GraphQL endpoint', async () => {
            // This makes a real network call to the testnet
            const result = await (0, query_1.fetchAttestationsForAgent)(NIA_ADDRESS, 'baseSepolia');
            // Should return valid structure even if empty
            (0, vitest_1.expect)(result).toHaveProperty('verifications');
            (0, vitest_1.expect)(result).toHaveProperty('vouches');
            (0, vitest_1.expect)(result).toHaveProperty('flags');
            (0, vitest_1.expect)(Array.isArray(result.verifications)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(result.vouches)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(result.flags)).toBe(true);
        }, 15000); // Extended timeout for network call
        (0, vitest_1.it)('handles checksummed addresses correctly', async () => {
            const checksummed = '0xC0D7CA6B3C1EF108696ced64F97729177F823189';
            const lowercase = '0xc0d7ca6b3c1ef108696ced64f97729177f823189';
            // Both should work and return same results
            const result1 = await (0, query_1.fetchAttestationsForAgent)(checksummed, 'baseSepolia');
            const result2 = await (0, query_1.fetchAttestationsForAgent)(lowercase, 'baseSepolia');
            (0, vitest_1.expect)(result1.verifications.length).toBe(result2.verifications.length);
            (0, vitest_1.expect)(result1.vouches.length).toBe(result2.vouches.length);
            (0, vitest_1.expect)(result1.flags.length).toBe(result2.flags.length);
        }, 15000);
        (0, vitest_1.it)('returns empty arrays for address with no attestations', async () => {
            // Random address that likely has no attestations
            const emptyAddress = '0x0000000000000000000000000000000000000001';
            const result = await (0, query_1.fetchAttestationsForAgent)(emptyAddress, 'baseSepolia');
            (0, vitest_1.expect)(result.verifications).toEqual([]);
            (0, vitest_1.expect)(result.vouches).toEqual([]);
            (0, vitest_1.expect)(result.flags).toEqual([]);
        }, 15000);
    });
    // ============ Trust Score Tests ============
    (0, vitest_1.describe)('Trust Score Calculation (Live)', () => {
        (0, vitest_1.it)('calculates trust score for known address', async () => {
            const score = await (0, query_1.getTrustScore)(NIA_ADDRESS, 'baseSepolia');
            // Should return valid TrustScore structure
            (0, vitest_1.expect)(score).toHaveProperty('score');
            (0, vitest_1.expect)(score).toHaveProperty('confidence');
            (0, vitest_1.expect)(score).toHaveProperty('attestationCount');
            (0, vitest_1.expect)(score).toHaveProperty('verified');
            (0, vitest_1.expect)(score).toHaveProperty('linkedPlatforms');
            (0, vitest_1.expect)(score).toHaveProperty('updatedAt');
            // Values should be within expected ranges
            (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(score.score).toBeLessThanOrEqual(100);
            (0, vitest_1.expect)(score.confidence).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(score.confidence).toBeLessThanOrEqual(1);
            (0, vitest_1.expect)(score.attestationCount).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(typeof score.verified).toBe('boolean');
            (0, vitest_1.expect)(Array.isArray(score.linkedPlatforms)).toBe(true);
        }, 15000);
        (0, vitest_1.it)('returns default score for unknown address', async () => {
            const unknownAddress = '0x0000000000000000000000000000000000000002';
            const score = await (0, query_1.getTrustScore)(unknownAddress, 'baseSepolia');
            (0, vitest_1.expect)(score.score).toBe(0);
            (0, vitest_1.expect)(score.verified).toBe(false);
            (0, vitest_1.expect)(score.confidence).toBe(0);
            (0, vitest_1.expect)(score.attestationCount).toBe(0);
            (0, vitest_1.expect)(score.linkedPlatforms).toEqual([]);
        }, 15000);
    });
    // ============ Attestation Summary Tests ============
    (0, vitest_1.describe)('Attestation Summary (Live)', () => {
        (0, vitest_1.it)('retrieves attestation summary for known address', async () => {
            const summary = await (0, query_1.getAttestationSummary)(NIA_ADDRESS, 'baseSepolia');
            (0, vitest_1.expect)(summary.address).toBe(NIA_ADDRESS);
            (0, vitest_1.expect)(Array.isArray(summary.verifications)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(summary.vouches)).toBe(true);
            (0, vitest_1.expect)(Array.isArray(summary.flags)).toBe(true);
            (0, vitest_1.expect)(summary.trustScore).toBeDefined();
        }, 15000);
        (0, vitest_1.it)('summary verification entries have correct structure', async () => {
            const summary = await (0, query_1.getAttestationSummary)(NIA_ADDRESS, 'baseSepolia');
            for (const verification of summary.verifications) {
                (0, vitest_1.expect)(verification).toHaveProperty('platform');
                (0, vitest_1.expect)(verification).toHaveProperty('handle');
                (0, vitest_1.expect)(verification).toHaveProperty('attester');
                (0, vitest_1.expect)(typeof verification.platform).toBe('string');
                (0, vitest_1.expect)(typeof verification.handle).toBe('string');
                (0, vitest_1.expect)(verification.attester).toMatch(/^0x[a-fA-F0-9]{40}$/);
            }
        }, 15000);
        (0, vitest_1.it)('summary vouch entries have correct structure', async () => {
            const summary = await (0, query_1.getAttestationSummary)(NIA_ADDRESS, 'baseSepolia');
            for (const vouch of summary.vouches) {
                (0, vitest_1.expect)(vouch).toHaveProperty('trustLevel');
                (0, vitest_1.expect)(vouch).toHaveProperty('context');
                (0, vitest_1.expect)(vouch).toHaveProperty('attester');
                (0, vitest_1.expect)(vouch.trustLevel).toBeGreaterThanOrEqual(0);
                (0, vitest_1.expect)(vouch.trustLevel).toBeLessThanOrEqual(5);
                (0, vitest_1.expect)(typeof vouch.context).toBe('string');
                (0, vitest_1.expect)(vouch.attester).toMatch(/^0x[a-fA-F0-9]{40}$/);
            }
        }, 15000);
    });
    // ============ AgentTrust Class Tests ============
    (0, vitest_1.describe)('AgentTrust Class (Live)', () => {
        let agentTrust;
        (0, vitest_1.beforeAll)(() => {
            const mockProvider = {
                getNetwork: () => Promise.resolve({ chainId: 84532, name: 'base-sepolia' })
            };
            agentTrust = new agent_trust_1.AgentTrust({
                network: 'baseSepolia',
                provider: mockProvider
            });
        });
        (0, vitest_1.it)('initializes with correct network', () => {
            const config = agentTrust.getNetworkConfig();
            (0, vitest_1.expect)(config.chainId).toBe(84532);
            (0, vitest_1.expect)(config.name).toBe('Base Sepolia');
        });
        (0, vitest_1.it)('reports schemas as registered', () => {
            const registered = agentTrust.areSchemasRegistered();
            (0, vitest_1.expect)(registered).toBe(true);
        });
        (0, vitest_1.it)('getScore returns valid trust score', async () => {
            const score = await agentTrust.getScore(NIA_ADDRESS);
            (0, vitest_1.expect)(score).toHaveProperty('score');
            (0, vitest_1.expect)(score).toHaveProperty('verified');
            (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(score.score).toBeLessThanOrEqual(100);
        }, 15000);
        (0, vitest_1.it)('getScore handles invalid addresses gracefully', async () => {
            const score = await agentTrust.getScore('invalid-address');
            // Should return default score for invalid address
            (0, vitest_1.expect)(score.score).toBe(0);
            (0, vitest_1.expect)(score.verified).toBe(false);
        });
        (0, vitest_1.it)('getAttestationSummary returns detailed info', async () => {
            const summary = await agentTrust.getAttestationSummary(NIA_ADDRESS);
            (0, vitest_1.expect)(summary.address).toBe(NIA_ADDRESS);
            (0, vitest_1.expect)(summary).toHaveProperty('verifications');
            (0, vitest_1.expect)(summary).toHaveProperty('vouches');
            (0, vitest_1.expect)(summary).toHaveProperty('flags');
            (0, vitest_1.expect)(summary).toHaveProperty('trustScore');
        }, 15000);
        (0, vitest_1.it)('generates valid Twitter challenge', () => {
            const challenge = agentTrust.generateTwitterChallenge(NIA_ADDRESS, 'testhandle');
            (0, vitest_1.expect)(challenge.code).toHaveLength(6);
            (0, vitest_1.expect)(challenge.agentId).toBe(NIA_ADDRESS);
            (0, vitest_1.expect)(challenge.handle).toBe('testhandle');
            (0, vitest_1.expect)(challenge.tweetMessage).toContain(NIA_ADDRESS);
            (0, vitest_1.expect)(challenge.tweetMessage).toContain(challenge.code);
        });
        (0, vitest_1.it)('generates valid GitHub challenge', () => {
            const challenge = agentTrust.generateGitHubChallenge(NIA_ADDRESS, 'testuser');
            (0, vitest_1.expect)(challenge.code).toHaveLength(8);
            (0, vitest_1.expect)(challenge.agentId).toBe(NIA_ADDRESS);
            (0, vitest_1.expect)(challenge.username).toBe('testuser');
            (0, vitest_1.expect)(challenge.gistContent).toContain(NIA_ADDRESS);
            (0, vitest_1.expect)(challenge.gistContent).toContain(challenge.code);
        });
    });
});
// ============ Mainnet Smoke Tests ============
(0, vitest_1.describe)('Integration: Base Mainnet (Smoke Tests)', () => {
    (0, vitest_1.it)('can query mainnet EAS endpoint', async () => {
        // Just verify the endpoint is reachable and returns valid structure
        const result = await (0, query_1.fetchAttestationsForAgent)(NIA_ADDRESS, 'base');
        (0, vitest_1.expect)(result).toHaveProperty('verifications');
        (0, vitest_1.expect)(result).toHaveProperty('vouches');
        (0, vitest_1.expect)(result).toHaveProperty('flags');
    }, 15000);
    (0, vitest_1.it)('mainnet trust score calculation works', async () => {
        const score = await (0, query_1.getTrustScore)(NIA_ADDRESS, 'base');
        (0, vitest_1.expect)(score).toHaveProperty('score');
        (0, vitest_1.expect)(score).toHaveProperty('verified');
        (0, vitest_1.expect)(score.score).toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(score.score).toBeLessThanOrEqual(100);
    }, 15000);
});
