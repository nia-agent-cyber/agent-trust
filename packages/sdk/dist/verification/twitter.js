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
exports.verifyTwitterProofWithFallback = verifyTwitterProofWithFallback;
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
 * Fetches tweet from Twitter API and verifies content
 */
async function verifyTwitterProof(proof, twitterApiKey) {
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
    try {
        // Fetch tweet content from Twitter API
        const tweetData = await fetchTweetData(tweetId, twitterApiKey);
        if (!tweetData) {
            return { valid: false, error: 'Tweet not found or private' };
        }
        // Verify tweet author matches expected handle
        const actualHandle = tweetData.author_username.toLowerCase();
        const expectedHandle = challenge.handle.replace('@', '').toLowerCase();
        if (actualHandle !== expectedHandle) {
            return {
                valid: false,
                error: `Tweet author (@${actualHandle}) does not match expected handle (@${expectedHandle})`
            };
        }
        // Verify tweet contains the challenge code
        if (!tweetData.text.includes(challenge.code)) {
            return { valid: false, error: 'Tweet does not contain the challenge code' };
        }
        // Verify tweet contains the agent address
        if (!tweetData.text.includes(challenge.agentId)) {
            return { valid: false, error: 'Tweet does not contain the agent address' };
        }
        // Additional verification: check for required AgentTrust hashtag/mention
        if (!tweetData.text.includes('@AgentTrust') && !tweetData.text.includes('#AgentTrust')) {
            return { valid: false, error: 'Tweet must mention @AgentTrust or include #AgentTrust hashtag' };
        }
        return {
            valid: true,
            tweetId,
            handle: actualHandle,
        };
    }
    catch (error) {
        return {
            valid: false,
            error: `Failed to verify tweet: ${error.message}`
        };
    }
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
 * Fetch tweet data from Twitter API v2
 */
async function fetchTweetData(tweetId, apiKey) {
    // If no API key provided, return null (fallback to basic validation)
    if (!apiKey) {
        console.warn('No Twitter API key provided. Skipping tweet content verification.');
        return null;
    }
    try {
        // Twitter API v2 endpoint for single tweet lookup
        const url = `https://api.twitter.com/2/tweets/${tweetId}?expansions=author_id&user.fields=username&tweet.fields=created_at,public_metrics`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) {
                return null; // Tweet not found
            }
            throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Handle Twitter API v2 response structure
        if (!data.data || !data.includes?.users?.[0]) {
            return null;
        }
        const tweet = data.data;
        const author = data.includes.users[0];
        return {
            id: tweet.id,
            text: tweet.text,
            author_id: tweet.author_id,
            author_username: author.username,
            created_at: tweet.created_at,
            public_metrics: tweet.public_metrics,
        };
    }
    catch (error) {
        console.error('Error fetching tweet data:', error);
        throw new Error(`Failed to fetch tweet: ${error.message}`);
    }
}
/**
 * Verify Twitter proof with fallback to basic validation
 */
async function verifyTwitterProofWithFallback(proof) {
    // Try full API verification first
    const apiResult = await verifyTwitterProof(proof, process.env.TWITTER_API_KEY);
    // If API verification failed due to missing API key, fall back to basic validation
    if (!apiResult.valid && apiResult.error?.includes('No Twitter API key')) {
        return verifyTwitterProofBasic(proof);
    }
    return apiResult;
}
/**
 * Basic Twitter proof validation (without API call)
 * Used as fallback when Twitter API is not available
 */
function verifyTwitterProofBasic(proof) {
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
    // Basic URL validation - ensure it's a Twitter/X URL
    if (!tweetUrl.match(/(twitter\.com|x\.com)/i)) {
        return { valid: false, error: 'URL must be from twitter.com or x.com' };
    }
    console.warn('Using basic Twitter verification - tweet content not verified');
    return {
        valid: true,
        tweetId,
        handle: challenge.handle,
    };
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
