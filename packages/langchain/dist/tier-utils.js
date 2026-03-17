"use strict";
/**
 * Tier utility functions for mapping between SDK numeric tiers
 * and the LangChain integration's string tier names.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdkTierToName = sdkTierToName;
exports.tierIndex = tierIndex;
exports.tierMeetsMinimum = tierMeetsMinimum;
exports.isValidTierName = isValidTierName;
const types_js_1 = require("./types.js");
/**
 * Maps SDK numeric tier (0–4) to our string tier name.
 *
 * SDK tiers:
 *   0 = New         → 'unverified'
 *   1 = Contributor → 'bronze'
 *   2 = Trusted     → 'silver'
 *   3 = Verified    → 'gold'
 *   4 = Expert      → 'platinum'
 */
function sdkTierToName(numericTier) {
    const index = Math.max(0, Math.min(numericTier, types_js_1.TIER_ORDER.length - 1));
    return types_js_1.TIER_ORDER[index];
}
/**
 * Returns the numeric index of a tier name within TIER_ORDER.
 * Higher index = higher trust.
 *
 * @throws if the tier name is not in TIER_ORDER
 */
function tierIndex(tier) {
    const idx = types_js_1.TIER_ORDER.indexOf(tier);
    if (idx === -1) {
        throw new Error(`Unknown tier: '${tier}'. Must be one of: ${types_js_1.TIER_ORDER.join(', ')}`);
    }
    return idx;
}
/**
 * Returns true if `actual` meets or exceeds `minimum`.
 */
function tierMeetsMinimum(actual, minimum) {
    return tierIndex(actual) >= tierIndex(minimum);
}
/**
 * Validates that a string is a valid TierName.
 */
function isValidTierName(value) {
    return types_js_1.TIER_ORDER.includes(value);
}
