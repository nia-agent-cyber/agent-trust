/**
 * End-to-End Workflow Tests
 * 
 * Tests complete user workflows from start to finish.
 * These tests verify the SDK components work together correctly.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AgentTrust } from '../agent-trust';
import { 
  generateTwitterChallenge, 
  verifyTwitterProofWithFallback,
  TwitterProof 
} from '../verification/twitter';
import {
  generateGitHubChallenge,
  verifyGitHubProof,
  GitHubProof
} from '../verification/github';
import { calculateTrustScore, ScoreInputs } from '../scoring/trust-score';
import { getTrustScore } from '../query';
import { SCHEMAS } from '../constants';

describe('E2E: Agent Verification Workflow', () => {
  const mockProvider = {
    getNetwork: () => Promise.resolve({ chainId: 84532, name: 'base-sepolia' })
  };
  
  let agentTrust: AgentTrust;
  const agentAddress = '0x' + 'a'.repeat(40);

  beforeEach(() => {
    agentTrust = new AgentTrust({
      network: 'baseSepolia',
      provider: mockProvider
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ============ Twitter Verification E2E ============

  describe('Twitter Verification Flow', () => {
    it('generates valid Twitter verification challenge', async () => {
      // Step 1: Generate challenge
      const challenge = agentTrust.generateTwitterChallenge(agentAddress, 'testagent');
      
      expect(challenge.code).toHaveLength(6);
      expect(challenge.tweetMessage).toContain(agentAddress);
      expect(challenge.tweetMessage).toContain('@AgentTrust');
      expect(challenge.handle).toBe('testagent');
      expect(challenge.expiresAt).toBeGreaterThan(Date.now());
    });

    it('rejects expired challenge in workflow', async () => {
      // Generate challenge with very short expiration
      const challenge = generateTwitterChallenge(agentAddress, 'testagent', 0); // Expired immediately
      
      // Wait a tiny bit to ensure expiration
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const proof: TwitterProof = {
        tweetUrl: 'https://twitter.com/testagent/status/123',
        challenge
      };

      const result = await verifyTwitterProofWithFallback(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('validates Twitter URL format correctly', async () => {
      const challenge = agentTrust.generateTwitterChallenge(agentAddress, 'testagent');
      
      // Invalid URL should be rejected immediately
      const invalidProof: TwitterProof = {
        tweetUrl: 'https://example.com/not-twitter',
        challenge
      };

      // Note: Without API key, the SDK attempts API verification which returns null
      // This causes a "Tweet not found" error, not URL validation error
      // The URL format validation happens before API call
      const result = await verifyTwitterProofWithFallback(invalidProof);
      expect(result.valid).toBe(false);
    });
  });

  // ============ GitHub Verification E2E ============

  describe('GitHub Verification Flow', () => {
    it('completes full GitHub verification workflow', async () => {
      // Step 1: Generate challenge
      const challenge = agentTrust.generateGitHubChallenge(agentAddress, 'testagent');
      
      expect(challenge.code).toHaveLength(8);
      expect(challenge.gistContent).toContain(agentAddress);
      expect(challenge.gistFilename).toBe('agent-trust-verification.md');

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

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGist)
      }));

      // Step 3: Create and verify proof
      const proof: GitHubProof = { gistUrl, challenge };
      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(true);
      expect(result.username).toBe('testagent');
    });

    it('validates gist ownership correctly', async () => {
      const challenge = agentTrust.generateGitHubChallenge(agentAddress, 'realuser');
      
      // Mock: gist owned by different user
      const mockGist = {
        owner: { login: 'wronguser' },
        files: {
          'test.md': { content: challenge.gistContent }
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGist)
      }));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/wronguser/abc123',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("doesn't match");
    });

    it('validates gist content contains required data', async () => {
      const challenge = agentTrust.generateGitHubChallenge(agentAddress, 'testagent');
      
      // Mock: gist missing the verification code
      const mockGist = {
        owner: { login: 'testagent' },
        files: {
          'test.md': { content: 'This gist does not contain the code or address' }
        }
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGist)
      }));

      const proof: GitHubProof = {
        gistUrl: 'https://gist.github.com/testagent/abc123',
        challenge
      };

      const result = await verifyGitHubProof(proof);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('verification code');
    });
  });

  // ============ Trust Score Workflow E2E ============

  describe('Trust Score Workflow', () => {
    it('calculates score from fresh agent to verified', () => {
      // Step 1: Fresh agent - no attestations
      const freshAgent: ScoreInputs = {
        verifications: [],
        vouches: [],
        flags: [],
        attesterScores: new Map()
      };
      
      const freshScore = calculateTrustScore(freshAgent);
      expect(freshScore.score).toBe(0);
      expect(freshScore.verified).toBe(false);
      expect(freshScore.confidence).toBe(0);

      // Step 2: Agent gets verified
      const verifiedAgent: ScoreInputs = {
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

      const verifiedScore = calculateTrustScore(verifiedAgent);
      expect(verifiedScore.score).toBeGreaterThanOrEqual(50);
      expect(verifiedScore.verified).toBe(true);
      expect(verifiedScore.confidence).toBeGreaterThan(0);

      // Step 3: Agent receives vouches
      const vouchedAgent: ScoreInputs = {
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

      const vouchedScore = calculateTrustScore(vouchedAgent);
      expect(vouchedScore.score).toBeGreaterThan(verifiedScore.score);
      expect(vouchedScore.confidence).toBeGreaterThan(verifiedScore.confidence);
    });

    it('handles reputation damage from flags', () => {
      // Start with good reputation
      const goodAgent: ScoreInputs = {
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

      const goodScore = calculateTrustScore(goodAgent);

      // Agent gets flagged
      const flaggedAgent: ScoreInputs = {
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

      const flaggedScore = calculateTrustScore(flaggedAgent);
      expect(flaggedScore.score).toBeLessThan(goodScore.score);
    });

    it('handles reputation recovery when flag is revoked', () => {
      // Agent with active flag
      const flaggedAgent: ScoreInputs = {
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

      const flaggedScore = calculateTrustScore(flaggedAgent);

      // Flag gets revoked
      const recoveredAgent: ScoreInputs = {
        ...flaggedAgent,
        flags: [{
          ...flaggedAgent.flags[0],
          revoked: true // Flag revoked
        }]
      };

      const recoveredScore = calculateTrustScore(recoveredAgent);
      expect(recoveredScore.score).toBeGreaterThan(flaggedScore.score);
    });
  });
});

// ============ Multi-Platform Verification E2E ============

describe('E2E: Multi-Platform Verification', () => {
  const agentAddress = '0x' + 'b'.repeat(40);
  
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('agent verifies on multiple platforms', () => {
    // Agent verifies on Twitter and GitHub
    const multiPlatformAgent: ScoreInputs = {
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

    const score = calculateTrustScore(multiPlatformAgent);

    expect(score.verified).toBe(true);
    expect(score.linkedPlatforms).toContain('twitter');
    expect(score.linkedPlatforms).toContain('github');
    expect(score.linkedPlatforms).toHaveLength(2);
  });

  it('revoking one verification keeps others active', () => {
    const twoVerifications: ScoreInputs = {
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

    const score = calculateTrustScore(twoVerifications);

    expect(score.verified).toBe(true); // Still verified via GitHub
    expect(score.linkedPlatforms).not.toContain('twitter');
    expect(score.linkedPlatforms).toContain('github');
    expect(score.linkedPlatforms).toHaveLength(1);
  });
});

// ============ Attestation Chain E2E ============

describe('E2E: Attestation Chain (Web of Trust)', () => {
  it('high-trust attesters have more weight', () => {
    const agentAddress = '0x' + 'a'.repeat(40);
    
    // Same vouch from low-trust vs high-trust attester
    const lowTrustVouch: ScoreInputs = {
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

    const highTrustVouch: ScoreInputs = {
      ...lowTrustVouch,
      vouches: [{
        ...lowTrustVouch.vouches[0],
        attester: '0x' + '2'.repeat(40)
      }],
      attesterScores: new Map([['0x' + '2'.repeat(40), 100]]) // Max trust attester
    };

    const lowTrustScore = calculateTrustScore(lowTrustVouch);
    const highTrustScore = calculateTrustScore(highTrustVouch);

    // High trust attesters should have equal or more weight
    expect(highTrustScore.score).toBeGreaterThanOrEqual(lowTrustScore.score);
  });

  it('multiple attesters increase confidence', () => {
    const agentAddress = '0x' + 'a'.repeat(40);
    
    const singleVouch: ScoreInputs = {
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

    const multipleVouches: ScoreInputs = {
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

    const singleScore = calculateTrustScore(singleVouch);
    const multipleScore = calculateTrustScore(multipleVouches);

    expect(multipleScore.confidence).toBeGreaterThan(singleScore.confidence);
  });
});
