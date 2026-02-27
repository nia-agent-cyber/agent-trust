"use strict";
/**
 * Trust Tier Module
 *
 * Provides tier-based trust levels (0-4) for nuanced reputation signals.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTierCacheStats = exports.clearTierCache = exports.fetchAgentStats = exports.getTierProgress = exports.checkMeetsTier = exports.getTier = exports.getDefaultAgentStats = exports.meetsTier = exports.getTierInfo = exports.getTierProgressToward = exports.calculateDaysActive = exports.calculateApprovalRate = exports.countQualifiedVouches = exports.applyDecay = exports.meetsTierRequirements = exports.calculateTier = exports.getTierDescription = exports.getTierEmoji = exports.getTierName = exports.DECAY_CONFIG = exports.TIER_METADATA = exports.TIER_REQUIREMENTS = exports.MAX_TIER = exports.MIN_TIER = exports.TIER_EXPERT = exports.TIER_VERIFIED = exports.TIER_TRUSTED = exports.TIER_CONTRIBUTOR = exports.TIER_NEW = void 0;
// Types
__exportStar(require("./tier-types"), exports);
// Constants
var tier_constants_1 = require("./tier-constants");
Object.defineProperty(exports, "TIER_NEW", { enumerable: true, get: function () { return tier_constants_1.TIER_NEW; } });
Object.defineProperty(exports, "TIER_CONTRIBUTOR", { enumerable: true, get: function () { return tier_constants_1.TIER_CONTRIBUTOR; } });
Object.defineProperty(exports, "TIER_TRUSTED", { enumerable: true, get: function () { return tier_constants_1.TIER_TRUSTED; } });
Object.defineProperty(exports, "TIER_VERIFIED", { enumerable: true, get: function () { return tier_constants_1.TIER_VERIFIED; } });
Object.defineProperty(exports, "TIER_EXPERT", { enumerable: true, get: function () { return tier_constants_1.TIER_EXPERT; } });
Object.defineProperty(exports, "MIN_TIER", { enumerable: true, get: function () { return tier_constants_1.MIN_TIER; } });
Object.defineProperty(exports, "MAX_TIER", { enumerable: true, get: function () { return tier_constants_1.MAX_TIER; } });
Object.defineProperty(exports, "TIER_REQUIREMENTS", { enumerable: true, get: function () { return tier_constants_1.TIER_REQUIREMENTS; } });
Object.defineProperty(exports, "TIER_METADATA", { enumerable: true, get: function () { return tier_constants_1.TIER_METADATA; } });
Object.defineProperty(exports, "DECAY_CONFIG", { enumerable: true, get: function () { return tier_constants_1.DECAY_CONFIG; } });
Object.defineProperty(exports, "getTierName", { enumerable: true, get: function () { return tier_constants_1.getTierName; } });
Object.defineProperty(exports, "getTierEmoji", { enumerable: true, get: function () { return tier_constants_1.getTierEmoji; } });
Object.defineProperty(exports, "getTierDescription", { enumerable: true, get: function () { return tier_constants_1.getTierDescription; } });
// Calculation functions (pure, no network calls)
var tier_calculation_1 = require("./tier-calculation");
Object.defineProperty(exports, "calculateTier", { enumerable: true, get: function () { return tier_calculation_1.calculateTier; } });
Object.defineProperty(exports, "meetsTierRequirements", { enumerable: true, get: function () { return tier_calculation_1.meetsTierRequirements; } });
Object.defineProperty(exports, "applyDecay", { enumerable: true, get: function () { return tier_calculation_1.applyDecay; } });
Object.defineProperty(exports, "countQualifiedVouches", { enumerable: true, get: function () { return tier_calculation_1.countQualifiedVouches; } });
Object.defineProperty(exports, "calculateApprovalRate", { enumerable: true, get: function () { return tier_calculation_1.calculateApprovalRate; } });
Object.defineProperty(exports, "calculateDaysActive", { enumerable: true, get: function () { return tier_calculation_1.calculateDaysActive; } });
Object.defineProperty(exports, "getTierProgressToward", { enumerable: true, get: function () { return tier_calculation_1.getTierProgressToward; } });
Object.defineProperty(exports, "getTierInfo", { enumerable: true, get: function () { return tier_calculation_1.getTierInfo; } });
Object.defineProperty(exports, "meetsTier", { enumerable: true, get: function () { return tier_calculation_1.meetsTier; } });
Object.defineProperty(exports, "getDefaultAgentStats", { enumerable: true, get: function () { return tier_calculation_1.getDefaultAgentStats; } });
// Query functions (with network calls)
var tier_query_1 = require("./tier-query");
Object.defineProperty(exports, "getTier", { enumerable: true, get: function () { return tier_query_1.getTier; } });
Object.defineProperty(exports, "checkMeetsTier", { enumerable: true, get: function () { return tier_query_1.checkMeetsTier; } });
Object.defineProperty(exports, "getTierProgress", { enumerable: true, get: function () { return tier_query_1.getTierProgress; } });
Object.defineProperty(exports, "fetchAgentStats", { enumerable: true, get: function () { return tier_query_1.fetchAgentStats; } });
Object.defineProperty(exports, "clearTierCache", { enumerable: true, get: function () { return tier_query_1.clearTierCache; } });
Object.defineProperty(exports, "getTierCacheStats", { enumerable: true, get: function () { return tier_query_1.getTierCacheStats; } });
