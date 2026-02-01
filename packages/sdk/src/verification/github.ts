/**
 * GitHub Verification Flow
 * 
 * 1. Agent requests verification with their GitHub username
 * 2. We generate a challenge (unique code)
 * 3. Agent creates a public gist containing the challenge + their agent address
 * 4. Agent submits gist URL as proof
 * 5. We verify gist exists and contains correct data
 * 6. Create EAS attestation
 */

import { ethers } from 'ethers';

export interface GitHubChallenge {
  /** Unique challenge code */
  code: string;
  /** Agent's address */
  agentId: string;
  /** GitHub username to verify */
  username: string;
  /** Expiration timestamp */
  expiresAt: number;
  /** Content to put in gist */
  gistContent: string;
  /** Suggested gist filename */
  gistFilename: string;
}

export interface GitHubProof {
  /** URL of the gist containing the challenge */
  gistUrl: string;
  /** The challenge that was issued */
  challenge: GitHubChallenge;
}

export interface GitHubVerificationResult {
  valid: boolean;
  error?: string;
  gistId?: string;
  username?: string;
}

/**
 * Generate a verification challenge for GitHub
 */
export function generateGitHubChallenge(
  agentId: string,
  username: string,
  expiresInMinutes: number = 60
): GitHubChallenge {
  const code = generateCode(8);
  const expiresAt = Date.now() + (expiresInMinutes * 60 * 1000);
  
  const gistContent = [
    `# Agent Trust Verification`,
    ``,
    `This gist verifies ownership of this GitHub account for Agent Trust.`,
    ``,
    `## Verification Details`,
    ``,
    `- **Agent Address:** ${agentId}`,
    `- **Verification Code:** ${code}`,
    `- **Timestamp:** ${new Date().toISOString()}`,
    ``,
    `## What is Agent Trust?`,
    ``,
    `Agent Trust is a reputation system for AI agents.`,
    `Learn more: https://github.com/nia-agent-cyber/agent-trust`,
    ``,
    `---`,
    `*Do not delete this gist until verification is complete.*`,
  ].join('\n');

  return {
    code,
    agentId,
    username: username.replace('@', ''),
    expiresAt,
    gistContent,
    gistFilename: 'agent-trust-verification.md',
  };
}

/**
 * Verify a GitHub proof by fetching the gist
 */
export async function verifyGitHubProof(
  proof: GitHubProof
): Promise<GitHubVerificationResult> {
  const { gistUrl, challenge } = proof;

  // Check if challenge expired
  if (Date.now() > challenge.expiresAt) {
    return { valid: false, error: 'Challenge expired' };
  }

  // Extract gist ID from URL
  const gistId = extractGistId(gistUrl);
  if (!gistId) {
    return { valid: false, error: 'Invalid gist URL' };
  }

  try {
    // Fetch gist from GitHub API (no auth needed for public gists)
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AgentTrust-SDK',
      },
    });

    if (!response.ok) {
      return { valid: false, error: `GitHub API error: ${response.status}` };
    }

    const gist = await response.json();

    // Verify owner matches expected username
    if (gist.owner?.login?.toLowerCase() !== challenge.username.toLowerCase()) {
      return { 
        valid: false, 
        error: `Gist owner (${gist.owner?.login}) doesn't match expected username (${challenge.username})` 
      };
    }

    // Get gist content (from any file)
    const files = Object.values(gist.files) as any[];
    const content = files.map((f: any) => f.content).join('\n');

    // Verify content contains the challenge code
    if (!content.includes(challenge.code)) {
      return { valid: false, error: 'Gist does not contain verification code' };
    }

    // Verify content contains the agent address
    if (!content.toLowerCase().includes(challenge.agentId.toLowerCase())) {
      return { valid: false, error: 'Gist does not contain agent address' };
    }

    return {
      valid: true,
      gistId,
      username: gist.owner.login,
    };
  } catch (error: any) {
    return { valid: false, error: `Verification failed: ${error.message}` };
  }
}

/**
 * Generate a random alphanumeric code
 */
function generateCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Extract gist ID from various GitHub gist URL formats
 */
function extractGistId(url: string): string | null {
  // Handle various formats:
  // https://gist.github.com/username/abc123
  // https://gist.github.com/abc123
  
  const patterns = [
    /gist\.github\.com\/\w+\/([a-f0-9]+)/i,
    /gist\.github\.com\/([a-f0-9]+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Hash the proof for on-chain storage
 */
export function hashGitHubProof(proof: GitHubProof): string {
  const data = JSON.stringify({
    gistUrl: proof.gistUrl,
    username: proof.challenge.username,
    agentId: proof.challenge.agentId,
    code: proof.challenge.code,
  });
  
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}
