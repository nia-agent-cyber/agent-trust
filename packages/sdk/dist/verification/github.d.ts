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
export declare function generateGitHubChallenge(agentId: string, username: string, expiresInMinutes?: number): GitHubChallenge;
/**
 * Verify a GitHub proof by fetching the gist
 */
export declare function verifyGitHubProof(proof: GitHubProof): Promise<GitHubVerificationResult>;
/**
 * Hash the proof for on-chain storage
 */
export declare function hashGitHubProof(proof: GitHubProof): string;
