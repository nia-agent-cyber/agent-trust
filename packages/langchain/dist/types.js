"use strict";
/**
 * Type definitions for Agent Trust LangChain integration package.
 *
 * Tier order (ascending): unverified < bronze < silver < gold < platinum
 *
 * These map to the Agent Trust SDK numeric tiers:
 *   0 (New)         → 'unverified'
 *   1 (Contributor) → 'bronze'
 *   2 (Trusted)     → 'silver'
 *   3 (Verified)    → 'gold'
 *   4 (Expert)      → 'platinum'
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustCheckFailedError = exports.TIER_ORDER = void 0;
/**
 * Ordered list of trust tiers from lowest to highest.
 */
exports.TIER_ORDER = [
    'unverified',
    'bronze',
    'silver',
    'gold',
    'platinum',
];
/**
 * Error thrown when a trust check fails (tier is below the minimum required).
 */
class TrustCheckFailedError extends Error {
    /** The agent address that failed the check */
    address;
    /** The actual tier of the agent */
    tier;
    /** The minimum tier that was required */
    requiredTier;
    constructor(address, tier, requiredTier) {
        super(`Trust check failed for ${address}: tier '${tier}' does not meet minimum '${requiredTier}'`);
        this.name = 'TrustCheckFailedError';
        this.address = address;
        this.tier = tier;
        this.requiredTier = requiredTier;
        // Maintain proper prototype chain in TypeScript
        Object.setPrototypeOf(this, TrustCheckFailedError.prototype);
    }
}
exports.TrustCheckFailedError = TrustCheckFailedError;
