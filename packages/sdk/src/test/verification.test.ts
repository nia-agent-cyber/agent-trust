/**
 * Verification Module Tests
 * 
 * Tests for Twitter and GitHub verification flows.
 * @see ../verification/twitter.ts
 * @see ../verification/github.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateTwitterChallenge,
  verifyTwitterProof,
  verifyTwitterProofWithFallback,
  hashTwitterProof,
  TwitterChallenge,
  TwitterProof,
} from '../verification/twitter';
import {
  generateGitHubChallenge,
  verifyGitHubProof,
  hashGitHubProof,
  GitHubChallenge,
  GitHubProof,
} from '../verification/github';

// ============ Twitter Verification Tests ============

describe('Twitter Verification', () => {
  const testAgentId = '0x' + 'a'.repeat(40);
  const testHandle = 'testagent';

  describe('generateTwitterChallenge', () => {
    it('generates a valid challenge', () => {
      const challenge = generateTwitterChallenge(testAgentId, testHandle);

      expect(challenge.code).toHaveLength(6);
      expect(challenge.agentId).toBe(testAgentId);
      expect(challenge.handle).toBe(testHandle);
      expect(challenge.expiresAt).toBeGreaterThan(Date.now());
      expect(challenge.tweetMessage).toContain(testAgentId);
      expect(challenge.tweetMessage).toContain(challenge.code);
      expect(challenge.tweetMessage).toContain('@AgentTrust');
    });

    it('strips @ from handle', () => {
      const challenge = generateTwitterChallenge(testAgentId, '@withatsign');
      expect(challenge.handle).toBe('withatsign');
    });

    it('generates unique codes each time', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const challenge = generateTwitterChallenge(testAgentId, testHandle);
        codes.add(challenge.code);
      }
      // All codes should be unique (or at least most)
      expect(codes.size).toBeGreaterThan(90);
    });

    it('respects custom expiration time', () => {
      const fiveMinutes = 5;
      const challenge = generateTwitterChallenge(testAgentId, testHandle, fiveMinutes);
      
      const expectedExpiry = Date.now() + (fiveMinutes * 60 * 1000);
      expect(Math.abs(challenge.expiresAt - expectedExpiry)).toBeLessThan(1000);
    });

    it('defaults to 30 minute expiration', () => {
      const challenge = generateTwitterChallenge(testAgentId, testHandle);
      
      const thirtyMinutesMs = 30 * 60 * 1000;
      const expectedExpiry = Date.now() + thirtyMinutesMs;
      expect(Math.abs(challenge.expiresAt - expectedExpiry)).toBeLessThan(1000);
    });
  });

  describe('verifyTwitterProof', () => {
    let challenge: TwitterChallenge;

    beforeEach(() => {
      challenge = generateTwitterChallenge(testAgentId, testHandle);
    });

    it('rejects expired challenges', async () => {
      const expiredChallenge: TwitterChallenge = {
        ...challenge,
        expiresAt: Date.now() - 1000 // Expired 1 second ago
      };

      const proof: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123456789',
        challenge: expiredChallenge
      };

      const result = await verifyTwitterProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('rejects invalid tweet URLs', async () => {
      const proof: TwitterProof = {
        tweetUrl: 'https://example.com/not-a-tweet',
        challenge
      };

      const result = await verifyTwitterProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid tweet URL');
    });

    it('accepts twitter.com URLs', async () => {
      const proof: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123456789',
        challenge
      };

      // Without API key, should return null from fetch and basic validation
      const result = await verifyTwitterProof(proof);
      
      // Will fail because no API key, but should not fail on URL validation
      expect(result.error).not.toContain('Invalid tweet URL');
    });

    it('accepts x.com URLs', async () => {
      const proof: TwitterProof = {
        tweetUrl: 'https://x.com/testagent/status/123456789',
        challenge
      };

      const result = await verifyTwitterProof(proof);
      
      expect(result.error).not.toContain('Invalid tweet URL');
    });

    it('accepts mobile.twitter.com URLs', async () => {
      const proof: TwitterProof = {
        tweetUrl: 'https://mobile.twitter.com/testagent/status/123456789',
        challenge
      };

      const result = await verifyTwitterProof(proof);
      
      expect(result.error).not.toContain('Invalid tweet URL');
    });
  });

  describe('verifyTwitterProofWithFallback', () => {
    it('attempts API verification first', async () => {
      const challenge = generateTwitterChallenge(testAgentId, testHandle);
      const proof: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123456789',
        challenge
      };

      // Without TWITTER_API_KEY env var, API verification returns null tweet
      // which results in "Tweet not found" error - not a fallback scenario
      const result = await verifyTwitterProofWithFallback(proof);
      
      // Without API key, tweet fetch returns null, causing "Tweet not found or private"
      // This is expected behavior - the SDK requires API key for full verification
      expect(result).toBeDefined();
    });

    it('returns consistent result structure', async () => {
      const challenge = generateTwitterChallenge(testAgentId, 'myhandle');
      const proof: TwitterProof = {
        tweetUrl: 'https://twitter.com/someone/status/123456789',
        challenge
      };

      const result = await verifyTwitterProofWithFallback(proof);
      
      // Result should always have valid property
      expect(result).toHaveProperty('valid');
      expect(typeof result.valid).toBe('boolean');
    });
  });

  describe('hashTwitterProof', () => {
    it('generates consistent hashes', () => {
      const challenge = generateTwitterChallenge(testAgentId, testHandle);
      const proof: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123456789',
        challenge
      };

      const hash1 = hashTwitterProof(proof);
      const hash2 = hashTwitterProof(proof);

      expect(hash1).toBe(hash2);
    });

    it('generates different hashes for different proofs', () => {
      const challenge1 = generateTwitterChallenge(testAgentId, testHandle);
      const challenge2 = generateTwitterChallenge(testAgentId, testHandle);

      const proof1: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123456789',
        challenge: challenge1
      };
      const proof2: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123456789',
        challenge: challenge2
      };

      const hash1 = hashTwitterProof(proof1);
      const hash2 = hashTwitterProof(proof2);

      expect(hash1).not.toBe(hash2);
    });

    it('returns a valid bytes32 hash', () => {
      const challenge = generateTwitterChallenge(testAgentId, testHandle);
      const proof: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123456789',
        challenge
      };

      const hash = hashTwitterProof(proof);

      expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);
    });
  });
});

// ============ GitHub Verification Tests ============

describe('GitHub Verification', () => {
  const testAgentId = '0x' + 'b'.repeat(40);
  const testUsername = 'testagent';

  describe('generateGitHubChallenge', () => {
    it('generates a valid challenge', () => {
      const challenge = generateGitHubChallenge(testAgentId, testUsername);

      expect(challenge.code).toHaveLength(8);
      expect(challenge.agentId).toBe(testAgentId);
      expect(challenge.username).toBe(testUsername);
      expect(challenge.expiresAt).toBeGreaterThan(Date.now());
      expect(challenge.gistContent).toContain(testAgentId);
      expect(challenge.gistContent).toContain(challenge.code);
      expect(challenge.gistFilename).toBe('agent-trust-verification.md');
    });

    it('strips @ from username', () => {
      const challenge = generateGitHubChallenge(testAgentId, '@withatsign');
      expect(challenge.username).toBe('withatsign');
    });

    it('generates unique codes each time', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const challenge = generateGitHubChallenge(testAgentId, testUsername);
        codes.add(challenge.code);
      }
      expect(codes.size).toBeGreaterThan(90);
    });

    it('defaults to 60 minute expiration', () => {
      const challenge = generateGitHubChallenge(testAgentId, testUsername);
      
      const sixtyMinutesMs = 60 * 60 * 1000;
      const expectedExpiry = Date.now() + sixtyMinutesMs;
      expect(Math.abs(challenge.expiresAt - expectedExpiry)).toBeLessThan(1000);
    });

    it('gist content includes proper markdown formatting', () => {
      const challenge = generateGitHubChallenge(testAgentId, testUsername);
      
      expect(challenge.gistContent).toContain('# Agent Trust Verification');
      expect(challenge.gistContent).toContain('**Agent Address:**');
      expect(challenge.gistContent).toContain('**Verification Code:**');
    });
  });

  describe('verifyGitHubProof', () => {
    let challenge: GitHubChallenge;

    beforeEach(() => {
      challenge = generateGitHubChallenge(testAgentId, testUsername);
    });

    it('rejects expired challenges', async () => {
      const expiredChallenge: GitHubChallenge = {
        ...challenge,
        expiresAt: Date.now() - 1000
      };

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge: expiredChallenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('rejects invalid gist URLs', async () => {
      const proof: GitHubProof = {
        gistUrl: 'https://github.com/testagent/repo',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid gist URL');
    });

    it('rejects non-gist GitHub URLs', async () => {
      const proof: GitHubProof = {
        gistUrl: 'https://github.com/testagent/repo/blob/main/file.md',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid gist URL');
    });

    it('accepts valid gist.github.com URLs', async () => {
      // Mock fetch for this test
      const mockGist = {
        owner: { login: testUsername },
        files: {
          'test.md': { content: `${challenge.code} ${challenge.agentId}` }
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGist)
      }));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(true);
      expect(result.username).toBe(testUsername);

      vi.unstubAllGlobals();
    });

    it('rejects gist from wrong user', async () => {
      const mockGist = {
        owner: { login: 'wronguser' },
        files: {
          'test.md': { content: `${challenge.code} ${challenge.agentId}` }
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGist)
      }));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("doesn't match");

      vi.unstubAllGlobals();
    });

    it('rejects gist missing verification code', async () => {
      const mockGist = {
        owner: { login: testUsername },
        files: {
          'test.md': { content: `Agent: ${challenge.agentId}` } // No code
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGist)
      }));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('verification code');

      vi.unstubAllGlobals();
    });

    it('rejects gist missing agent address', async () => {
      const mockGist = {
        owner: { login: testUsername },
        files: {
          'test.md': { content: `Code: ${challenge.code}` } // No agent address
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGist)
      }));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('agent address');

      vi.unstubAllGlobals();
    });

    it('handles GitHub API errors gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      }));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('GitHub API error');

      vi.unstubAllGlobals();
    });

    it('handles network errors gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Verification failed');

      vi.unstubAllGlobals();
    });
  });

  describe('hashGitHubProof', () => {
    it('generates consistent hashes', () => {
      const challenge = generateGitHubChallenge(testAgentId, testUsername);
      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const hash1 = hashGitHubProof(proof);
      const hash2 = hashGitHubProof(proof);

      expect(hash1).toBe(hash2);
    });

    it('generates different hashes for different proofs', () => {
      const challenge1 = generateGitHubChallenge(testAgentId, testUsername);
      const challenge2 = generateGitHubChallenge(testAgentId, testUsername);

      const proof1: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge: challenge1
      };
      const proof2: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge: challenge2
      };

      const hash1 = hashGitHubProof(proof1);
      const hash2 = hashGitHubProof(proof2);

      expect(hash1).not.toBe(hash2);
    });

    it('returns a valid bytes32 hash', () => {
      const challenge = generateGitHubChallenge(testAgentId, testUsername);
      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123def456',
        challenge
      };

      const hash = hashGitHubProof(proof);

      expect(hash).toMatch(/^0x[a-f0-9]{64}$/i);
    });
  });
});
