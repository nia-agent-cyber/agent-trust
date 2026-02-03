"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTwitterChallenge = generateTwitterChallenge;
exports.verifyTwitterProof = verifyTwitterProof;
exports.hashTwitterProof = hashTwitterProof;
const ethers_1 = require("ethers");
/**
 * Generate a verification challenge for Twitter
 */
function generateTwitterChallenge(agentId, handle, expiresInMinutes = 30) {
    // Generate random 6-character code
    const code = generateCode(6);
    const expiresAt = Date.now() + (expiresInMinutes * 60 * 1000);
    const tweetMessage = [
        `Verifying my agent identity for @AgentTrust`,
        ``,
        `Agent: ${agentId}`,
        `Code: ${code}`,
        ``,
        `#AgentTrust #Verification`
    ].join('\n');
    return {
        code,
        agentId,
        handle: handle.replace('@', ''),
        expiresAt,
        tweetMessage,
    };
}
/**
 * Verify a Twitter proof
 * In production, this would call Twitter API to fetch the tweet
 */
async function verifyTwitterProof(proof) {
    const { tweetUrl, challenge } = proof;
    // Check if challenge expired
    if (Date.now() > challenge.expiresAt) {
        return { valid: false, error: 'Challenge expired' };
    }
    // Extract tweet ID from URL
    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
        return { valid: false, error: 'Invalid tweet URL' };
    }
    // TODO: In production, fetch tweet from Twitter API and verify:
    // 1. Tweet exists
    // 2. Tweet author matches expected handle
    // 3. Tweet contains the challenge code
    // 4. Tweet contains the agent address
    // For now, return placeholder
    // This would need Twitter API credentials to actually verify
    return {
        valid: true, // Placeholder - implement real verification
        tweetId,
        handle: challenge.handle,
    };
}
/**
 * Generate a random alphanumeric code
 */
function generateCode(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
/**
 * Extract tweet ID from various Twitter URL formats
 */
function extractTweetId(url) {
    // Handle various formats:
    // https://twitter.com/user/status/123456789
    // https://x.com/user/status/123456789
    // https://mobile.twitter.com/user/status/123456789
    const patterns = [
        /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i,
        /(?:mobile\.twitter\.com)\/\w+\/status\/(\d+)/i,
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
function hashTwitterProof(proof) {
    const data = JSON.stringify({
        tweetUrl: proof.tweetUrl,
        handle: proof.challenge.handle,
        agentId: proof.challenge.agentId,
        code: proof.challenge.code,
    });
    return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(data));
}
