/**
 * Twitter Verification Flow
 *
 * 1. Agent requests verification with their Twitter handle
 * 2. We generate a challenge (unique code)
 * 3. Agent posts tweet containing the challenge + their agent address
 * 4. Agent submits tweet URL as proof
 * 5. We verify tweet exists and contains correct data
 * 6. Create EAS attestation
 */
export interface TwitterChallenge {
    /** Unique challenge code */
    code: string;
    /** Agent's address */
    agentId: string;
    /** Twitter handle to verify */
    handle: string;
    /** Expiration timestamp */
    expiresAt: number;
    /** Full message to tweet */
    tweetMessage: string;
}
export interface TwitterProof {
    /** URL of the tweet containing the challenge */
    tweetUrl: string;
    /** The challenge that was issued */
    challenge: TwitterChallenge;
}
export interface TwitterVerificationResult {
    valid: boolean;
    error?: string;
    tweetId?: string;
    handle?: string;
}
/**
 * Generate a verification challenge for Twitter
 */
export declare function generateTwitterChallenge(agentId: string, handle: string, expiresInMinutes?: number): TwitterChallenge;
/**
 * Verify a Twitter proof
 * Fetches tweet from Twitter API and verifies content
 */
export declare function verifyTwitterProof(proof: TwitterProof, twitterApiKey?: string): Promise<TwitterVerificationResult>;
/**
 * Verify Twitter proof with fallback to basic validation
 */
export declare function verifyTwitterProofWithFallback(proof: TwitterProof): Promise<TwitterVerificationResult>;
/**
 * Hash the proof for on-chain storage
 */
export declare function hashTwitterProof(proof: TwitterProof): string;
