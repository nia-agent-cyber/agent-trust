"use strict";
/**
 * @agent-trust/sdk
 * Trust infrastructure for AI agents
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
exports.KNOWN_AUDIT_TYPES = exports.parseAuditSeverity = exports.encodeSecurityAuditAttestation = exports.normalizeSecurityAuditRequest = exports.parseTaskOutcome = exports.encodeTaskCompletionAttestation = exports.normalizeTaskCompletionRequest = exports.parsePaymentOutcome = exports.encodePaymentReliableAttestation = exports.normalizePaymentReliableRequest = exports.normalizeTimestampToSeconds = exports.normalizePaymentAmount = exports.getAttesterScoreCacheStats = exports.clearAttesterScoreCache = exports.parseSecurityAuditAttestation = exports.fetchSecurityAuditAttestationsForSubject = exports.parseTaskCompletionAttestation = exports.fetchTaskCompletionAttestationsForSubject = exports.parsePaymentReliableAttestation = exports.fetchPaymentReliableAttestationsForSubject = exports.fetchAttestationsForAgent = exports.getAttestationSummary = exports.getTrustScore = exports.NETWORKS = exports.SCHEMAS = exports.AgentTrust = void 0;
// Main class
var agent_trust_1 = require("./agent-trust");
Object.defineProperty(exports, "AgentTrust", { enumerable: true, get: function () { return agent_trust_1.AgentTrust; } });
// Types
__exportStar(require("./types"), exports);
// Constants
var constants_1 = require("./constants");
Object.defineProperty(exports, "SCHEMAS", { enumerable: true, get: function () { return constants_1.SCHEMAS; } });
Object.defineProperty(exports, "NETWORKS", { enumerable: true, get: function () { return constants_1.NETWORKS; } });
// Verification utilities
__exportStar(require("./verification"), exports);
// Scoring utilities  
__exportStar(require("./scoring"), exports);
// Tier utilities
__exportStar(require("./tier"), exports);
// ERC-8004 bridge
__exportStar(require("./erc8004"), exports);
// Query utilities
var query_1 = require("./query");
Object.defineProperty(exports, "getTrustScore", { enumerable: true, get: function () { return query_1.getTrustScore; } });
Object.defineProperty(exports, "getAttestationSummary", { enumerable: true, get: function () { return query_1.getAttestationSummary; } });
Object.defineProperty(exports, "fetchAttestationsForAgent", { enumerable: true, get: function () { return query_1.fetchAttestationsForAgent; } });
Object.defineProperty(exports, "fetchPaymentReliableAttestationsForSubject", { enumerable: true, get: function () { return query_1.fetchPaymentReliableAttestationsForSubject; } });
Object.defineProperty(exports, "parsePaymentReliableAttestation", { enumerable: true, get: function () { return query_1.parsePaymentReliableAttestation; } });
Object.defineProperty(exports, "fetchTaskCompletionAttestationsForSubject", { enumerable: true, get: function () { return query_1.fetchTaskCompletionAttestationsForSubject; } });
Object.defineProperty(exports, "parseTaskCompletionAttestation", { enumerable: true, get: function () { return query_1.parseTaskCompletionAttestation; } });
Object.defineProperty(exports, "fetchSecurityAuditAttestationsForSubject", { enumerable: true, get: function () { return query_1.fetchSecurityAuditAttestationsForSubject; } });
Object.defineProperty(exports, "parseSecurityAuditAttestation", { enumerable: true, get: function () { return query_1.parseSecurityAuditAttestation; } });
Object.defineProperty(exports, "clearAttesterScoreCache", { enumerable: true, get: function () { return query_1.clearAttesterScoreCache; } });
Object.defineProperty(exports, "getAttesterScoreCacheStats", { enumerable: true, get: function () { return query_1.getAttesterScoreCacheStats; } });
// PaymentReliable helpers
var payment_reliable_1 = require("./payment-reliable");
Object.defineProperty(exports, "normalizePaymentAmount", { enumerable: true, get: function () { return payment_reliable_1.normalizePaymentAmount; } });
Object.defineProperty(exports, "normalizeTimestampToSeconds", { enumerable: true, get: function () { return payment_reliable_1.normalizeTimestampToSeconds; } });
Object.defineProperty(exports, "normalizePaymentReliableRequest", { enumerable: true, get: function () { return payment_reliable_1.normalizePaymentReliableRequest; } });
Object.defineProperty(exports, "encodePaymentReliableAttestation", { enumerable: true, get: function () { return payment_reliable_1.encodePaymentReliableAttestation; } });
Object.defineProperty(exports, "parsePaymentOutcome", { enumerable: true, get: function () { return payment_reliable_1.parsePaymentOutcome; } });
// TaskCompletion helpers
var task_completion_1 = require("./task-completion");
Object.defineProperty(exports, "normalizeTaskCompletionRequest", { enumerable: true, get: function () { return task_completion_1.normalizeTaskCompletionRequest; } });
Object.defineProperty(exports, "encodeTaskCompletionAttestation", { enumerable: true, get: function () { return task_completion_1.encodeTaskCompletionAttestation; } });
Object.defineProperty(exports, "parseTaskOutcome", { enumerable: true, get: function () { return task_completion_1.parseTaskOutcome; } });
// SecurityAudit helpers
var security_audit_1 = require("./security-audit");
Object.defineProperty(exports, "normalizeSecurityAuditRequest", { enumerable: true, get: function () { return security_audit_1.normalizeSecurityAuditRequest; } });
Object.defineProperty(exports, "encodeSecurityAuditAttestation", { enumerable: true, get: function () { return security_audit_1.encodeSecurityAuditAttestation; } });
Object.defineProperty(exports, "parseAuditSeverity", { enumerable: true, get: function () { return security_audit_1.parseAuditSeverity; } });
Object.defineProperty(exports, "KNOWN_AUDIT_TYPES", { enumerable: true, get: function () { return security_audit_1.KNOWN_AUDIT_TYPES; } });
