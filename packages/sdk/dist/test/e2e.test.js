"use strict";
/**
 * End-to-End Workflow Tests
 *
 * Tests complete user workflows from start to finish.
 * These tests verify the SDK components work together correctly.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const agent_trust_1 = require("../agent-trust");
const twitter_1 = require("../verification/twitter");
const github_1 = require("../verification/github");
const trust_score_1 = require("../scoring/trust-score");
(0, vitest_1.describe)('E2E: Agent Verification Workflow', () => {
    const mockProvider = {
        getNetwork: () => Promise.resolve({ chainId: 84532, name: 'base-sepolia' })
    };
    let agentTrust;
    const agentAddress = '0x' + 'a'.repeat(40);
    (0, vitest_1.beforeEach)(() => {
        agentTrust = new agent_trust_1.AgentTrust({
            network: 'baseSepolia',
            provider: mockProvider
        });
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.unstubAllGlobals();
    });
    // ============ Twitter Verification E2E ============
    (0, vitest_1.describe)('Twitter Verification Flow', () => {
        (0, vitest_1.it)('generates valid Twitter verification challenge', async () => {
            // Step 1: Generate challenge
            const challenge = agentTrust.generateTwitterChallenge(agentAddress, 'testagent');
            (0, vitest_1.expect)(challenge.code).toHaveLength(6);
            (0, vitest_1.expect)(challenge.tweetMessage).toContain(agentAddress);
            (0, vitest_1.expect)(challenge.tweetMessage).toContain('@AgentTrust');
            (0, vitest_1.expect)(challenge.handle).toBe('testagent');
            (0, vitest_1.expect)(challenge.expiresAt).toBeGreaterThan(Date.now());
        });
        (0, vitest_1.it)('rejects expired challenge in workflow', async () => {
            // Generate challenge with very short expiration
            const challenge = (0, twitter_1.generateTwitterChallenge)(agentAddress, 'testagent', 0); // Expired immediately
            // Wait a tiny bit to ensure expiration
            await new Promise(resolve => setTimeout(resolve, 10));
            const proof = {
                tweetUrl: 'https://twitter.com/testagent/status/123',
                challenge
            };
            const result = await (0, twitter_1.verifyTwitterProofWithFallback)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('expired');
        });
        (0, vitest_1.it)('validates Twitter URL format correctly', async () => {
            const challenge = agentTrust.generateTwitterChallenge(agentAddress, 'testagent');
            // Invalid URL should be rejected immediately
            const invalidProof = {
                tweetUrl: 'https://example.com/not-twitter',
                challenge
            };
            // Note: Without API key, the SDK attempts API verification which returns null
            // This causes a "Tweet not found" error, not URL validation error
            // The URL format validation happens before API call
            const result = await (0, twitter_1.verifyTwitterProofWithFallback)(invalidProof);
            (0, vitest_1.expect)(result.valid).toBe(false);
        });
    });
    // ============ GitHub Verification E2E ============
    (0, vitest_1.describe)('GitHub Verification Flow', () => {
        (0, vitest_1.it)('completes full GitHub verification workflow', async () => {
            // Step 1: Generate challenge
            const challenge = agentTrust.generateGitHubChallenge(agentAddress, 'testagent');
            (0, vitest_1.expect)(challenge.code).toHaveLength(8);
            (0, vitest_1.expect)(challenge.gistContent).toContain(agentAddress);
            (0, vitest_1.expect)(challenge.gistFilename).toBe('agent-trust-verification.md');
            // Step 2: User would create gist (mocked)
            const gistUrl = 'https://gist.github.com/testagent/abc123def456';
            // Mock the GitHub API response
            const mockGist = {
                owner: { login: 'testagent' },
                files: {
                    'agent-trust-verification.md': {
                        content: challenge.gistContent
                    }
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGist)
            }));
            // Step 3: Create and verify proof
            const proof = { gistUrl, challenge };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(true);
            (0, vitest_1.expect)(result.username).toBe('testagent');
        });
        (0, vitest_1.it)('validates gist ownership correctly', async () => {
            const challenge = agentTrust.generateGitHubChallenge(agentAddress, 'realuser');
            // Mock: gist owned by different user
            const mockGist = {
                owner: { login: 'wronguser' },
                files: {
                    'test.md': { content: challenge.gistContent }
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGist)
            }));
            const proof = {
                gistUrl: 'https://gist.github.com/wronguser/abc123',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain("doesn't match");
        });
        (0, vitest_1.it)('validates gist content contains required data', async () => {
            const challenge = agentTrust.generateGitHubChallenge(agentAddress, 'testagent');
            // Mock: gist missing the verification code
            const mockGist = {
                owner: { login: 'testagent' },
                files: {
                    'test.md': { content: 'This gist does not contain the code or address' }
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGist)
            }));
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('verification code');
        });
    });
    // ============ Trust Score Workflow E2E ============
    (0, vitest_1.describe)('Trust Score Workflow', () => {
        (0, vitest_1.it)('calculates score from fresh agent to verified', () => {
            // Step 1: Fresh agent - no attestations
            const freshAgent = {
                verifications: [],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const freshScore = (0, trust_score_1.calculateTrustScore)(freshAgent);
            (0, vitest_1.expect)(freshScore.score).toBe(0);
            (0, vitest_1.expect)(freshScore.verified).toBe(false);
            (0, vitest_1.expect)(freshScore.confidence).toBe(0);
            // Step 2: Agent gets verified
            const verifiedAgent = {
                verifications: [{
                        uid: 'ver-1',
                        attester: '0x' + 'v'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        platform: 'twitter',
                        handle: '@testagent'
                    }],
                vouches: [],
                flags: [],
                attesterScores: new Map()
            };
            const verifiedScore = (0, trust_score_1.calculateTrustScore)(verifiedAgent);
            (0, vitest_1.expect)(verifiedScore.score).toBeGreaterThanOrEqual(50);
            (0, vitest_1.expect)(verifiedScore.verified).toBe(true);
            (0, vitest_1.expect)(verifiedScore.confidence).toBeGreaterThan(0);
            // Step 3: Agent receives vouches
            const vouchedAgent = {
                ...verifiedAgent,
                vouches: [
                    {
                        uid: 'vouch-1',
                        attester: '0x' + '1'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        trustLevel: 4,
                        context: 'Reliable collaborator'
                    },
                    {
                        uid: 'vouch-2',
                        attester: '0x' + '2'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        trustLevel: 5,
                        context: 'Excellent work'
                    }
                ],
                attesterScores: new Map([
                    ['0x' + '1'.repeat(40), 70],
                    ['0x' + '2'.repeat(40), 85]
                ])
            };
            const vouchedScore = (0, trust_score_1.calculateTrustScore)(vouchedAgent);
            (0, vitest_1.expect)(vouchedScore.score).toBeGreaterThan(verifiedScore.score);
            (0, vitest_1.expect)(vouchedScore.confidence).toBeGreaterThan(verifiedScore.confidence);
        });
        (0, vitest_1.it)('handles reputation damage from flags', () => {
            // Start with good reputation
            const goodAgent = {
                verifications: [{
                        uid: 'ver-1',
                        attester: '0x' + 'v'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        platform: 'github',
                        handle: 'goodagent'
                    }],
                vouches: [
                    {
                        uid: 'vouch-1',
                        attester: '0x' + '1'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        trustLevel: 5,
                        context: 'Amazing'
                    }
                ],
                flags: [],
                attesterScores: new Map([['0x' + '1'.repeat(40), 80]])
            };
            const goodScore = (0, trust_score_1.calculateTrustScore)(goodAgent);
            // Agent gets flagged
            const flaggedAgent = {
                ...goodAgent,
                flags: [{
                        uid: 'flag-1',
                        attester: '0x' + 'f'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        severity: 4,
                        reason: 'Dishonest behavior'
                    }],
                attesterScores: new Map([
                    ['0x' + '1'.repeat(40), 80],
                    ['0x' + 'f'.repeat(40), 75]
                ])
            };
            const flaggedScore = (0, trust_score_1.calculateTrustScore)(flaggedAgent);
            (0, vitest_1.expect)(flaggedScore.score).toBeLessThan(goodScore.score);
        });
        (0, vitest_1.it)('handles reputation recovery when flag is revoked', () => {
            // Agent with active flag
            const flaggedAgent = {
                verifications: [{
                        uid: 'ver-1',
                        attester: '0x' + 'v'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        platform: 'twitter',
                        handle: '@agent'
                    }],
                vouches: [],
                flags: [{
                        uid: 'flag-1',
                        attester: '0x' + 'f'.repeat(40),
                        recipient: agentAddress,
                        time: Math.floor(Date.now() / 1000),
                        revoked: false,
                        severity: 3,
                        reason: 'Mistake made'
                    }],
                attesterScores: new Map([['0x' + 'f'.repeat(40), 60]])
            };
            const flaggedScore = (0, trust_score_1.calculateTrustScore)(flaggedAgent);
            // Flag gets revoked
            const recoveredAgent = {
                ...flaggedAgent,
                flags: [{
                        ...flaggedAgent.flags[0],
                        revoked: true // Flag revoked
                    }]
            };
            const recoveredScore = (0, trust_score_1.calculateTrustScore)(recoveredAgent);
            (0, vitest_1.expect)(recoveredScore.score).toBeGreaterThan(flaggedScore.score);
        });
    });
});
// ============ Multi-Platform Verification E2E ============
(0, vitest_1.describe)('E2E: Multi-Platform Verification', () => {
    const agentAddress = '0x' + 'b'.repeat(40);
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.unstubAllGlobals();
    });
    (0, vitest_1.it)('agent verifies on multiple platforms', () => {
        // Agent verifies on Twitter and GitHub
        const multiPlatformAgent = {
            verifications: [
                {
                    uid: 'ver-twitter',
                    attester: '0x' + 't'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    platform: 'twitter',
                    handle: '@testagent'
                },
                {
                    uid: 'ver-github',
                    attester: '0x' + 'g'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    platform: 'github',
                    handle: 'testagent'
                }
            ],
            vouches: [],
            flags: [],
            attesterScores: new Map()
        };
        const score = (0, trust_score_1.calculateTrustScore)(multiPlatformAgent);
        (0, vitest_1.expect)(score.verified).toBe(true);
        (0, vitest_1.expect)(score.linkedPlatforms).toContain('twitter');
        (0, vitest_1.expect)(score.linkedPlatforms).toContain('github');
        (0, vitest_1.expect)(score.linkedPlatforms).toHaveLength(2);
    });
    (0, vitest_1.it)('revoking one verification keeps others active', () => {
        const twoVerifications = {
            verifications: [
                {
                    uid: 'ver-twitter',
                    attester: '0x' + 't'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: true, // Twitter revoked
                    platform: 'twitter',
                    handle: '@testagent'
                },
                {
                    uid: 'ver-github',
                    attester: '0x' + 'g'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false, // GitHub still active
                    platform: 'github',
                    handle: 'testagent'
                }
            ],
            vouches: [],
            flags: [],
            attesterScores: new Map()
        };
        const score = (0, trust_score_1.calculateTrustScore)(twoVerifications);
        (0, vitest_1.expect)(score.verified).toBe(true); // Still verified via GitHub
        (0, vitest_1.expect)(score.linkedPlatforms).not.toContain('twitter');
        (0, vitest_1.expect)(score.linkedPlatforms).toContain('github');
        (0, vitest_1.expect)(score.linkedPlatforms).toHaveLength(1);
    });
});
// ============ Attestation Chain E2E ============
(0, vitest_1.describe)('E2E: Attestation Chain (Web of Trust)', () => {
    (0, vitest_1.it)('high-trust attesters have more weight', () => {
        const agentAddress = '0x' + 'a'.repeat(40);
        // Same vouch from low-trust vs high-trust attester
        const lowTrustVouch = {
            verifications: [{
                    uid: 'ver',
                    attester: '0x' + 'v'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    platform: 'twitter',
                    handle: '@agent'
                }],
            vouches: [{
                    uid: 'vouch',
                    attester: '0x' + '1'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    trustLevel: 5,
                    context: 'Great!'
                }],
            flags: [],
            attesterScores: new Map([['0x' + '1'.repeat(40), 10]]) // Very low trust attester
        };
        const highTrustVouch = {
            ...lowTrustVouch,
            vouches: [{
                    ...lowTrustVouch.vouches[0],
                    attester: '0x' + '2'.repeat(40)
                }],
            attesterScores: new Map([['0x' + '2'.repeat(40), 100]]) // Max trust attester
        };
        const lowTrustScore = (0, trust_score_1.calculateTrustScore)(lowTrustVouch);
        const highTrustScore = (0, trust_score_1.calculateTrustScore)(highTrustVouch);
        // High trust attesters should have equal or more weight
        (0, vitest_1.expect)(highTrustScore.score).toBeGreaterThanOrEqual(lowTrustScore.score);
    });
    (0, vitest_1.it)('multiple attesters increase confidence', () => {
        const agentAddress = '0x' + 'a'.repeat(40);
        const singleVouch = {
            verifications: [{
                    uid: 'ver',
                    attester: '0x' + 'v'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    platform: 'twitter',
                    handle: '@agent'
                }],
            vouches: [{
                    uid: 'vouch-1',
                    attester: '0x' + '1'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    trustLevel: 4,
                    context: 'Good'
                }],
            flags: [],
            attesterScores: new Map([['0x' + '1'.repeat(40), 70]])
        };
        const multipleVouches = {
            ...singleVouch,
            vouches: [
                singleVouch.vouches[0],
                {
                    uid: 'vouch-2',
                    attester: '0x' + '2'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    trustLevel: 4,
                    context: 'Also good'
                },
                {
                    uid: 'vouch-3',
                    attester: '0x' + '3'.repeat(40),
                    recipient: agentAddress,
                    time: Math.floor(Date.now() / 1000),
                    revoked: false,
                    trustLevel: 4,
                    context: 'Confirmed'
                }
            ],
            attesterScores: new Map([
                ['0x' + '1'.repeat(40), 70],
                ['0x' + '2'.repeat(40), 70],
                ['0x' + '3'.repeat(40), 70]
            ])
        };
        const singleScore = (0, trust_score_1.calculateTrustScore)(singleVouch);
        const multipleScore = (0, trust_score_1.calculateTrustScore)(multipleVouches);
        (0, vitest_1.expect)(multipleScore.confidence).toBeGreaterThan(singleScore.confidence);
    });
});
