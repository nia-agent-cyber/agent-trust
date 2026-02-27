"use strict";
/**
 * AgentTrust - Main SDK class
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTrust = void 0;
const eas_sdk_1 = require("@ethereum-attestation-service/eas-sdk");
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const twitter_1 = require("./verification/twitter");
const github_1 = require("./verification/github");
const trust_score_1 = require("./scoring/trust-score");
const query_1 = require("./query");
const tier_1 = require("./tier");
class AgentTrust {
    eas;
    network;
    provider;
    twitterApiKey;
    constructor(config) {
        this.network = config.network;
        this.provider = config.provider;
        this.twitterApiKey = config.twitterApiKey;
        const networkConfig = constants_1.NETWORKS[this.network];
        const easAddress = config.easAddress || networkConfig.easAddress;
        this.eas = new eas_sdk_1.EAS(easAddress);
        this.eas.connect(this.provider);
    }
    /**
     * Get trust score for an agent
     */
    async getScore(agentId) {
        try {
            // Validate agent ID format (should be an Ethereum address)
            if (!ethers_1.ethers.isAddress(agentId)) {
                throw new Error('Invalid agent ID: must be a valid Ethereum address');
            }
            // Use the query module to fetch attestations and calculate trust score
            return await (0, query_1.getTrustScore)(agentId, this.network);
        }
        catch (error) {
            console.error(`Error fetching trust score for agent ${agentId}:`, error);
            // Return default score on error
            return (0, trust_score_1.getDefaultTrustScore)();
        }
    }
    /**
     * Get detailed attestation summary for an agent (useful for debugging)
     */
    async getAttestationSummary(agentId) {
        try {
            // Validate agent ID format (should be an Ethereum address)
            if (!ethers_1.ethers.isAddress(agentId)) {
                throw new Error('Invalid agent ID: must be a valid Ethereum address');
            }
            // Use the query module to get detailed attestation summary
            return await (0, query_1.getAttestationSummary)(agentId, this.network);
        }
        catch (error) {
            console.error(`Error fetching attestation summary for agent ${agentId}:`, error);
            throw error;
        }
    }
    /**
     * Verify an agent's identity on a platform
     */
    async verify(request) {
        try {
            // Validate agent ID format
            if (!ethers_1.ethers.isAddress(request.agentId)) {
                return { success: false, error: 'Invalid agent ID: must be a valid Ethereum address' };
            }
            // Step 1: Validate proof based on platform
            const proofValidation = await this.validateProof(request);
            if (!proofValidation.valid) {
                return { success: false, error: proofValidation.error };
            }
            // Step 2: Ensure schemas are registered
            if (!constants_1.SCHEMAS.verification.uid) {
                throw new Error('Verification schema not registered. Run registerSchemas() first.');
            }
            // Step 3: Create attestation on EAS
            const schemaEncoder = new eas_sdk_1.SchemaEncoder(constants_1.SCHEMAS.verification.schema);
            const encodedData = schemaEncoder.encodeData([
                { name: 'agentId', value: request.agentId, type: 'address' },
                { name: 'platform', value: request.platform, type: 'string' },
                { name: 'handle', value: request.handle, type: 'string' },
                { name: 'proofHash', value: this.hashProof(request.proof), type: 'bytes32' },
                { name: 'verifiedAt', value: BigInt(Math.floor(Date.now() / 1000)), type: 'uint64' },
            ]);
            const tx = await this.eas.attest({
                schema: constants_1.SCHEMAS.verification.uid,
                data: {
                    recipient: request.agentId,
                    expirationTime: BigInt(0), // No expiration
                    revocable: true,
                    data: encodedData,
                },
            });
            const attestationUid = await tx.wait();
            return {
                success: true,
                attestationUid,
                txHash: tx.tx.hash,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    /**
     * Vouch for another agent
     */
    async vouch(request) {
        try {
            if (!constants_1.SCHEMAS.vouch.uid) {
                throw new Error('Vouch schema not registered. Run registerSchemas() first.');
            }
            const schemaEncoder = new eas_sdk_1.SchemaEncoder(constants_1.SCHEMAS.vouch.schema);
            const encodedData = schemaEncoder.encodeData([
                { name: 'vouchee', value: request.agentId, type: 'address' },
                { name: 'trustLevel', value: request.trustLevel, type: 'uint8' },
                { name: 'context', value: request.context || '', type: 'string' },
                { name: 'evidenceHash', value: request.evidenceHash || '0x' + '0'.repeat(64), type: 'bytes32' },
            ]);
            const tx = await this.eas.attest({
                schema: constants_1.SCHEMAS.vouch.uid,
                data: {
                    recipient: request.agentId,
                    expirationTime: BigInt(0),
                    revocable: true,
                    data: encodedData,
                },
            });
            const attestationUid = await tx.wait();
            return {
                success: true,
                attestationUid,
                txHash: tx.tx.hash,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    /**
     * Flag a bad actor
     */
    async flag(request) {
        try {
            if (!constants_1.SCHEMAS.flag.uid) {
                throw new Error('Flag schema not registered. Run registerSchemas() first.');
            }
            const schemaEncoder = new eas_sdk_1.SchemaEncoder(constants_1.SCHEMAS.flag.schema);
            const encodedData = schemaEncoder.encodeData([
                { name: 'flagged', value: request.agentId, type: 'address' },
                { name: 'severity', value: request.severity, type: 'uint8' },
                { name: 'reason', value: request.reason, type: 'string' },
                { name: 'evidenceHash', value: request.evidenceHash || '0x' + '0'.repeat(64), type: 'bytes32' },
            ]);
            const tx = await this.eas.attest({
                schema: constants_1.SCHEMAS.flag.uid,
                data: {
                    recipient: request.agentId,
                    expirationTime: BigInt(0),
                    revocable: true,
                    data: encodedData,
                },
            });
            const attestationUid = await tx.wait();
            return {
                success: true,
                attestationUid,
                txHash: tx.tx.hash,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    /**
     * Hash a proof string to bytes32
     */
    hashProof(proof) {
        return ethers_1.ethers.keccak256(ethers_1.ethers.toUtf8Bytes(proof));
    }
    /**
     * Validate proof based on platform
     */
    async validateProof(request) {
        const { platform, agentId, handle, proof } = request;
        try {
            switch (platform) {
                case 'twitter': {
                    // For Twitter, proof should be a tweet URL
                    // We'll use the existing Twitter verification logic
                    const tweetId = this.extractTweetId(proof);
                    if (!tweetId) {
                        return { valid: false, error: 'Invalid Twitter proof: must be a valid tweet URL' };
                    }
                    // Check if proof contains agent ID and handle
                    // In a real implementation, this would fetch the tweet content via API
                    // For now, we validate the URL format and assume the tweet contains required data
                    if (!proof.toLowerCase().includes('twitter.com') && !proof.toLowerCase().includes('x.com')) {
                        return { valid: false, error: 'Invalid Twitter proof: must be a Twitter/X URL' };
                    }
                    return { valid: true };
                }
                case 'github': {
                    // For GitHub, proof should be a gist URL
                    if (!proof.includes('gist.github.com')) {
                        return { valid: false, error: 'Invalid GitHub proof: must be a GitHub gist URL' };
                    }
                    // Validate gist URL format
                    const gistMatch = proof.match(/gist\.github\.com\/[^\/]+\/([a-f0-9]+)/);
                    if (!gistMatch) {
                        return { valid: false, error: 'Invalid GitHub gist URL format' };
                    }
                    return { valid: true };
                }
                case 'email': {
                    // For email, proof should be a signed message
                    // This would require implementing email signature verification
                    // For now, just check if it looks like a signature or email
                    if (proof.length < 10) {
                        return { valid: false, error: 'Invalid email proof: too short' };
                    }
                    return { valid: true };
                }
                default:
                    return { valid: false, error: `Unsupported platform: ${platform}` };
            }
        }
        catch (error) {
            return { valid: false, error: `Proof validation failed: ${error.message}` };
        }
    }
    /**
     * Extract tweet ID from Twitter URL
     */
    extractTweetId(url) {
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
    // ============ Verification Challenges ============
    /**
     * Generate a Twitter verification challenge
     */
    generateTwitterChallenge(agentId, handle) {
        return (0, twitter_1.generateTwitterChallenge)(agentId, handle);
    }
    /**
     * Complete Twitter verification with proof
     */
    async completeTwitterVerification(proof) {
        // Verify the proof off-chain first using API if available
        const verifyResult = this.twitterApiKey
            ? await (0, twitter_1.verifyTwitterProof)(proof, this.twitterApiKey)
            : await (0, twitter_1.verifyTwitterProofWithFallback)(proof);
        if (!verifyResult.valid) {
            return { success: false, error: verifyResult.error };
        }
        // Create on-chain attestation
        return this.verify({
            agentId: proof.challenge.agentId,
            platform: 'twitter',
            handle: proof.challenge.handle,
            proof: proof.tweetUrl,
        });
    }
    /**
     * Generate a GitHub verification challenge
     */
    generateGitHubChallenge(agentId, username) {
        return (0, github_1.generateGitHubChallenge)(agentId, username);
    }
    /**
     * Complete GitHub verification with proof
     */
    async completeGitHubVerification(proof) {
        // Verify the proof off-chain first (calls GitHub API)
        const verifyResult = await (0, github_1.verifyGitHubProof)(proof);
        if (!verifyResult.valid) {
            return { success: false, error: verifyResult.error };
        }
        // Create on-chain attestation
        return this.verify({
            agentId: proof.challenge.agentId,
            platform: 'github',
            handle: proof.challenge.username,
            proof: proof.gistUrl,
        });
    }
    // ============ Tier Methods ============
    /**
     * Get the current tier for an agent
     * @param address Agent's wallet address
     * @returns TierInfo with tier level and progress
     */
    async getTier(address) {
        if (!ethers_1.ethers.isAddress(address)) {
            throw new Error('Invalid address: must be a valid Ethereum address');
        }
        return (0, tier_1.getTier)(address, this.network);
    }
    /**
     * Check if an agent meets a minimum tier requirement
     * @param address Agent's wallet address
     * @param minTier Minimum tier required (0-4)
     * @returns boolean
     */
    async meetsTier(address, minTier) {
        if (!ethers_1.ethers.isAddress(address)) {
            throw new Error('Invalid address: must be a valid Ethereum address');
        }
        return (0, tier_1.checkMeetsTier)(address, minTier, this.network);
    }
    /**
     * Get progress toward next tier
     * @param address Agent's wallet address
     * @returns TierProgress showing requirements vs current stats (null if at max tier)
     */
    async getTierProgress(address) {
        if (!ethers_1.ethers.isAddress(address)) {
            throw new Error('Invalid address: must be a valid Ethereum address');
        }
        return (0, tier_1.getTierProgress)(address, this.network);
    }
    // ============ Utility Methods ============
    /**
     * Get network configuration
     */
    getNetworkConfig() {
        return constants_1.NETWORKS[this.network];
    }
    /**
     * Check if schemas are registered
     */
    areSchemasRegistered() {
        return !!(constants_1.SCHEMAS.verification.uid && constants_1.SCHEMAS.vouch.uid && constants_1.SCHEMAS.flag.uid);
    }
}
exports.AgentTrust = AgentTrust;
