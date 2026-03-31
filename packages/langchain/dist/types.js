"use strict";
/**
 * Shared types for @nia-agent-cyber/agent-trust-langchain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIER_NAMES = exports.TIER_ORDER = void 0;
/** Ordered tier names from lowest to highest */
exports.TIER_ORDER = [
    'unverified',
    'contributor',
    'trusted',
    'verified',
    'expert',
];
/** Numeric tier → TierName */
exports.TIER_NAMES = {
    0: 'unverified',
    1: 'contributor',
    2: 'trusted',
    3: 'verified',
    4: 'expert',
};
