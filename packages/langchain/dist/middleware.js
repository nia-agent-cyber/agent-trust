"use strict";
/**
 * createTrustMiddleware — factory for quick setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrustMiddleware = createTrustMiddleware;
const trust_tool_js_1 = require("./trust-tool.js");
const trust_gate_js_1 = require("./trust-gate.js");
/**
 * Create a TrustCheckTool + TrustGate pair from a shared config.
 *
 * @example
 * const { tool, gate } = createTrustMiddleware({
 *   agentTrust,
 *   requiredTier: 'contributor',
 *   addressKey: 'counterpartyAddress',
 * });
 */
function createTrustMiddleware(config) {
    const tool = new trust_tool_js_1.TrustCheckTool({
        agentTrust: config.agentTrust,
        requiredTier: config.requiredTier,
    });
    const gate = new trust_gate_js_1.TrustGate({
        agentTrust: config.agentTrust,
        requiredTier: config.requiredTier ?? 'contributor',
        addressKey: config.addressKey,
    });
    return { tool, gate };
}
