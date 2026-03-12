"use strict";
/**
 * ERC-8004 Bridge Module
 *
 * Reads ERC-8004 Identity, Reputation, and Validation registries on Base
 * and enriches with Agent Trust reputation scoring.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSummary = exports.calculateCombinedScore = exports.buildEnrichedProfile = exports.getERC8004Validation = exports.getERC8004Reputation = exports.resolveTokenURI = exports.getERC8004Identity = exports.SCORING_WEIGHTS = exports.VALIDATION_REGISTRY_ABI = exports.REPUTATION_REGISTRY_ABI = exports.IDENTITY_REGISTRY_ABI = exports.ERC8004_REGISTRIES = void 0;
// Constants
var constants_1 = require("./constants");
Object.defineProperty(exports, "ERC8004_REGISTRIES", { enumerable: true, get: function () { return constants_1.ERC8004_REGISTRIES; } });
Object.defineProperty(exports, "IDENTITY_REGISTRY_ABI", { enumerable: true, get: function () { return constants_1.IDENTITY_REGISTRY_ABI; } });
Object.defineProperty(exports, "REPUTATION_REGISTRY_ABI", { enumerable: true, get: function () { return constants_1.REPUTATION_REGISTRY_ABI; } });
Object.defineProperty(exports, "VALIDATION_REGISTRY_ABI", { enumerable: true, get: function () { return constants_1.VALIDATION_REGISTRY_ABI; } });
Object.defineProperty(exports, "SCORING_WEIGHTS", { enumerable: true, get: function () { return constants_1.SCORING_WEIGHTS; } });
// Identity
var identity_1 = require("./identity");
Object.defineProperty(exports, "getERC8004Identity", { enumerable: true, get: function () { return identity_1.getERC8004Identity; } });
Object.defineProperty(exports, "resolveTokenURI", { enumerable: true, get: function () { return identity_1.resolveTokenURI; } });
// Reputation
var reputation_1 = require("./reputation");
Object.defineProperty(exports, "getERC8004Reputation", { enumerable: true, get: function () { return reputation_1.getERC8004Reputation; } });
// Validation
var validation_1 = require("./validation");
Object.defineProperty(exports, "getERC8004Validation", { enumerable: true, get: function () { return validation_1.getERC8004Validation; } });
// Enriched profile
var enriched_1 = require("./enriched");
Object.defineProperty(exports, "buildEnrichedProfile", { enumerable: true, get: function () { return enriched_1.buildEnrichedProfile; } });
Object.defineProperty(exports, "calculateCombinedScore", { enumerable: true, get: function () { return enriched_1.calculateCombinedScore; } });
Object.defineProperty(exports, "generateSummary", { enumerable: true, get: function () { return enriched_1.generateSummary; } });
