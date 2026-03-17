"use strict";
/**
 * Tier utility helpers shared across langchain/elizaos packages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tierLevelToName = tierLevelToName;
exports.tierNameToLevel = tierNameToLevel;
exports.tierMeetsMinimum = tierMeetsMinimum;
exports.extractTierLevel = extractTierLevel;
exports.extractScore = extractScore;
const types_js_1 = require("./types.js");
/**
 * Convert a numeric tier level to a TierName string.
 */
function tierLevelToName(level) {
    return types_js_1.TIER_NAMES[level] ?? 'unverified';
}
/**
 * Convert a TierName string to its numeric level.
 */
function tierNameToLevel(name) {
    return types_js_1.TIER_ORDER.indexOf(name);
}
/**
 * Return true if `actual` meets or exceeds `required`.
 */
function tierMeetsMinimum(actual, required) {
    return tierNameToLevel(actual) >= tierNameToLevel(required);
}
/**
 * Extract the tier level from an SDK getTier() result (handles both number and object).
 */
function extractTierLevel(result) {
    if (typeof result === 'number')
        return result;
    return result.tier;
}
/**
 * Extract the score from an SDK getScore() result (handles both number and object).
 */
function extractScore(result) {
    if (typeof result === 'number')
        return result;
    return result.score;
}
