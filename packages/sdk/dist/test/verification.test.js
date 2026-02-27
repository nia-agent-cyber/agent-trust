"use strict";
/**
 * Verification Module Tests
 *
 * Tests for Twitter and GitHub verification flows.
 * @see ../verification/twitter.ts
 * @see ../verification/github.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const twitter_1 = require("../verification/twitter");
const github_1 = require("../verification/github");
// ============ Twitter Verification Tests ============
(0, vitest_1.describe)('Twitter Verification', () => {
    const testAgentId = '0x' + 'a'.repeat(40);
    const testHandle = 'testagent';
    (0, vitest_1.describe)('generateTwitterChallenge', () => {
        (0, vitest_1.it)('generates a valid challenge', () => {
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
            (0, vitest_1.expect)(challenge.code).toHaveLength(6);
            (0, vitest_1.expect)(challenge.agentId).toBe(testAgentId);
            (0, vitest_1.expect)(challenge.handle).toBe(testHandle);
            (0, vitest_1.expect)(challenge.expiresAt).toBeGreaterThan(Date.now());
            (0, vitest_1.expect)(challenge.tweetMessage).toContain(testAgentId);
            (0, vitest_1.expect)(challenge.tweetMessage).toContain(challenge.code);
            (0, vitest_1.expect)(challenge.tweetMessage).toContain('@AgentTrust');
        });
        (0, vitest_1.it)('strips @ from handle', () => {
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, '@withatsign');
            (0, vitest_1.expect)(challenge.handle).toBe('withatsign');
        });
        (0, vitest_1.it)('generates unique codes each time', () => {
            const codes = new Set();
            for (let i = 0; i < 100; i++) {
                const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
                codes.add(challenge.code);
            }
            // All codes should be unique (or at least most)
            (0, vitest_1.expect)(codes.size).toBeGreaterThan(90);
        });
        (0, vitest_1.it)('respects custom expiration time', () => {
            const fiveMinutes = 5;
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle, fiveMinutes);
            const expectedExpiry = Date.now() + (fiveMinutes * 60 * 1000);
            (0, vitest_1.expect)(Math.abs(challenge.expiresAt - expectedExpiry)).toBeLessThan(1000);
        });
        (0, vitest_1.it)('defaults to 30 minute expiration', () => {
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
            const thirtyMinutesMs = 30 * 60 * 1000;
            const expectedExpiry = Date.now() + thirtyMinutesMs;
            (0, vitest_1.expect)(Math.abs(challenge.expiresAt - expectedExpiry)).toBeLessThan(1000);
        });
    });
    (0, vitest_1.describe)('verifyTwitterProof', () => {
        let challenge;
        (0, vitest_1.beforeEach)(() => {
            challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
        });
        (0, vitest_1.it)('rejects expired challenges', async () => {
            const expiredChallenge = {
                ...challenge,
                expiresAt: Date.now() - 1000 // Expired 1 second ago
            };
            const proof = {
                tweetUrl: 'https://twitter.com/testagent/status/123456789',
                challenge: expiredChallenge
            };
            const result = await (0, twitter_1.verifyTwitterProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('expired');
        });
        (0, vitest_1.it)('rejects invalid tweet URLs', async () => {
            const proof = {
                tweetUrl: 'https://example.com/not-a-tweet',
                challenge
            };
            const result = await (0, twitter_1.verifyTwitterProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Invalid tweet URL');
        });
        (0, vitest_1.it)('accepts twitter.com URLs', async () => {
            const proof = {
                tweetUrl: 'https://twitter.com/testagent/status/123456789',
                challenge
            };
            // Without API key, should return null from fetch and basic validation
            const result = await (0, twitter_1.verifyTwitterProof)(proof);
            // Will fail because no API key, but should not fail on URL validation
            (0, vitest_1.expect)(result.error).not.toContain('Invalid tweet URL');
        });
        (0, vitest_1.it)('accepts x.com URLs', async () => {
            const proof = {
                tweetUrl: 'https://x.com/testagent/status/123456789',
                challenge
            };
            const result = await (0, twitter_1.verifyTwitterProof)(proof);
            (0, vitest_1.expect)(result.error).not.toContain('Invalid tweet URL');
        });
        (0, vitest_1.it)('accepts mobile.twitter.com URLs', async () => {
            const proof = {
                tweetUrl: 'https://mobile.twitter.com/testagent/status/123456789',
                challenge
            };
            const result = await (0, twitter_1.verifyTwitterProof)(proof);
            (0, vitest_1.expect)(result.error).not.toContain('Invalid tweet URL');
        });
    });
    (0, vitest_1.describe)('verifyTwitterProofWithFallback', () => {
        (0, vitest_1.it)('attempts API verification first', async () => {
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
            const proof = {
                tweetUrl: 'https://twitter.com/testagent/status/123456789',
                challenge
            };
            // Without TWITTER_API_KEY env var, API verification returns null tweet
            // which results in "Tweet not found" error - not a fallback scenario
            const result = await (0, twitter_1.verifyTwitterProofWithFallback)(proof);
            // Without API key, tweet fetch returns null, causing "Tweet not found or private"
            // This is expected behavior - the SDK requires API key for full verification
            (0, vitest_1.expect)(result).toBeDefined();
        });
        (0, vitest_1.it)('returns consistent result structure', async () => {
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, 'myhandle');
            const proof = {
                tweetUrl: 'https://twitter.com/someone/status/123456789',
                challenge
            };
            const result = await (0, twitter_1.verifyTwitterProofWithFallback)(proof);
            // Result should always have valid property
            (0, vitest_1.expect)(result).toHaveProperty('valid');
            (0, vitest_1.expect)(typeof result.valid).toBe('boolean');
        });
    });
    (0, vitest_1.describe)('hashTwitterProof', () => {
        (0, vitest_1.it)('generates consistent hashes', () => {
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
            const proof = {
                tweetUrl: 'https://twitter.com/testagent/status/123456789',
                challenge
            };
            const hash1 = (0, twitter_1.hashTwitterProof)(proof);
            const hash2 = (0, twitter_1.hashTwitterProof)(proof);
            (0, vitest_1.expect)(hash1).toBe(hash2);
        });
        (0, vitest_1.it)('generates different hashes for different proofs', () => {
            const challenge1 = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
            const challenge2 = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
            const proof1 = {
                tweetUrl: 'https://twitter.com/testagent/status/123456789',
                challenge: challenge1
            };
            const proof2 = {
                tweetUrl: 'https://twitter.com/testagent/status/123456789',
                challenge: challenge2
            };
            const hash1 = (0, twitter_1.hashTwitterProof)(proof1);
            const hash2 = (0, twitter_1.hashTwitterProof)(proof2);
            (0, vitest_1.expect)(hash1).not.toBe(hash2);
        });
        (0, vitest_1.it)('returns a valid bytes32 hash', () => {
            const challenge = (0, twitter_1.generateTwitterChallenge)(testAgentId, testHandle);
            const proof = {
                tweetUrl: 'https://twitter.com/testagent/status/123456789',
                challenge
            };
            const hash = (0, twitter_1.hashTwitterProof)(proof);
            (0, vitest_1.expect)(hash).toMatch(/^0x[a-f0-9]{64}$/i);
        });
    });
});
// ============ GitHub Verification Tests ============
(0, vitest_1.describe)('GitHub Verification', () => {
    const testAgentId = '0x' + 'b'.repeat(40);
    const testUsername = 'testagent';
    (0, vitest_1.describe)('generateGitHubChallenge', () => {
        (0, vitest_1.it)('generates a valid challenge', () => {
            const challenge = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
            (0, vitest_1.expect)(challenge.code).toHaveLength(8);
            (0, vitest_1.expect)(challenge.agentId).toBe(testAgentId);
            (0, vitest_1.expect)(challenge.username).toBe(testUsername);
            (0, vitest_1.expect)(challenge.expiresAt).toBeGreaterThan(Date.now());
            (0, vitest_1.expect)(challenge.gistContent).toContain(testAgentId);
            (0, vitest_1.expect)(challenge.gistContent).toContain(challenge.code);
            (0, vitest_1.expect)(challenge.gistFilename).toBe('agent-trust-verification.md');
        });
        (0, vitest_1.it)('strips @ from username', () => {
            const challenge = (0, github_1.generateGitHubChallenge)(testAgentId, '@withatsign');
            (0, vitest_1.expect)(challenge.username).toBe('withatsign');
        });
        (0, vitest_1.it)('generates unique codes each time', () => {
            const codes = new Set();
            for (let i = 0; i < 100; i++) {
                const challenge = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
                codes.add(challenge.code);
            }
            (0, vitest_1.expect)(codes.size).toBeGreaterThan(90);
        });
        (0, vitest_1.it)('defaults to 60 minute expiration', () => {
            const challenge = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
            const sixtyMinutesMs = 60 * 60 * 1000;
            const expectedExpiry = Date.now() + sixtyMinutesMs;
            (0, vitest_1.expect)(Math.abs(challenge.expiresAt - expectedExpiry)).toBeLessThan(1000);
        });
        (0, vitest_1.it)('gist content includes proper markdown formatting', () => {
            const challenge = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
            (0, vitest_1.expect)(challenge.gistContent).toContain('# Agent Trust Verification');
            (0, vitest_1.expect)(challenge.gistContent).toContain('**Agent Address:**');
            (0, vitest_1.expect)(challenge.gistContent).toContain('**Verification Code:**');
        });
    });
    (0, vitest_1.describe)('verifyGitHubProof', () => {
        let challenge;
        (0, vitest_1.beforeEach)(() => {
            challenge = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
        });
        (0, vitest_1.it)('rejects expired challenges', async () => {
            const expiredChallenge = {
                ...challenge,
                expiresAt: Date.now() - 1000
            };
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge: expiredChallenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('expired');
        });
        (0, vitest_1.it)('rejects invalid gist URLs', async () => {
            const proof = {
                gistUrl: 'https://github.com/testagent/repo',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Invalid gist URL');
        });
        (0, vitest_1.it)('rejects non-gist GitHub URLs', async () => {
            const proof = {
                gistUrl: 'https://github.com/testagent/repo/blob/main/file.md',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Invalid gist URL');
        });
        (0, vitest_1.it)('accepts valid gist.github.com URLs', async () => {
            // Mock fetch for this test
            const mockGist = {
                owner: { login: testUsername },
                files: {
                    'test.md': { content: `${challenge.code} ${challenge.agentId}` }
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGist)
            }));
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(true);
            (0, vitest_1.expect)(result.username).toBe(testUsername);
            vitest_1.vi.unstubAllGlobals();
        });
        (0, vitest_1.it)('rejects gist from wrong user', async () => {
            const mockGist = {
                owner: { login: 'wronguser' },
                files: {
                    'test.md': { content: `${challenge.code} ${challenge.agentId}` }
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGist)
            }));
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain("doesn't match");
            vitest_1.vi.unstubAllGlobals();
        });
        (0, vitest_1.it)('rejects gist missing verification code', async () => {
            const mockGist = {
                owner: { login: testUsername },
                files: {
                    'test.md': { content: `Agent: ${challenge.agentId}` } // No code
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGist)
            }));
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('verification code');
            vitest_1.vi.unstubAllGlobals();
        });
        (0, vitest_1.it)('rejects gist missing agent address', async () => {
            const mockGist = {
                owner: { login: testUsername },
                files: {
                    'test.md': { content: `Code: ${challenge.code}` } // No agent address
                }
            };
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockGist)
            }));
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('agent address');
            vitest_1.vi.unstubAllGlobals();
        });
        (0, vitest_1.it)('handles GitHub API errors gracefully', async () => {
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockResolvedValue({
                ok: false,
                status: 500
            }));
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('GitHub API error');
            vitest_1.vi.unstubAllGlobals();
        });
        (0, vitest_1.it)('handles network errors gracefully', async () => {
            vitest_1.vi.stubGlobal('fetch', vitest_1.vi.fn().mockRejectedValue(new Error('Network error')));
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const result = await (0, github_1.verifyGitHubProof)(proof);
            (0, vitest_1.expect)(result.valid).toBe(false);
            (0, vitest_1.expect)(result.error).toContain('Verification failed');
            vitest_1.vi.unstubAllGlobals();
        });
    });
    (0, vitest_1.describe)('hashGitHubProof', () => {
        (0, vitest_1.it)('generates consistent hashes', () => {
            const challenge = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const hash1 = (0, github_1.hashGitHubProof)(proof);
            const hash2 = (0, github_1.hashGitHubProof)(proof);
            (0, vitest_1.expect)(hash1).toBe(hash2);
        });
        (0, vitest_1.it)('generates different hashes for different proofs', () => {
            const challenge1 = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
            const challenge2 = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
            const proof1 = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge: challenge1
            };
            const proof2 = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge: challenge2
            };
            const hash1 = (0, github_1.hashGitHubProof)(proof1);
            const hash2 = (0, github_1.hashGitHubProof)(proof2);
            (0, vitest_1.expect)(hash1).not.toBe(hash2);
        });
        (0, vitest_1.it)('returns a valid bytes32 hash', () => {
            const challenge = (0, github_1.generateGitHubChallenge)(testAgentId, testUsername);
            const proof = {
                gistUrl: 'https://gist.github.com/testagent/abc123def456',
                challenge
            };
            const hash = (0, github_1.hashGitHubProof)(proof);
            (0, vitest_1.expect)(hash).toMatch(/^0x[a-f0-9]{64}$/i);
        });
    });
});
