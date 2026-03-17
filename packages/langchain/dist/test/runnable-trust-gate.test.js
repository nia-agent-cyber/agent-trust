"use strict";
/**
 * Tests for RunnableTrustGate
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const runnable_trust_gate_js_1 = require("../runnable-trust-gate.js");
const types_js_1 = require("../types.js");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeMock(tier, score) {
    return {
        getTier: vitest_1.vi.fn().mockResolvedValue({ tier, name: 'n/a' }),
        getScore: vitest_1.vi.fn().mockResolvedValue({ score }),
    };
}
const AGENT = '0xDeadBeef0000000000000000000000000000DEAD';
// ---------------------------------------------------------------------------
// Basic invoke behaviour
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('RunnableTrustGate', () => {
    (0, vitest_1.describe)('invoke — pass cases', () => {
        (0, vitest_1.it)('returns the input unchanged when trust check passes', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'bronze',
                agentTrust: makeMock(1, 40), // bronze
            });
            const input = { task: 'send-eth', amount: 100 };
            const output = await gate.invoke(input);
            (0, vitest_1.expect)(output).toEqual(input);
        });
        (0, vitest_1.it)('passes a string input through unchanged', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'bronze',
                agentTrust: makeMock(2, 60),
            });
            const output = await gate.invoke('hello world');
            (0, vitest_1.expect)(output).toBe('hello world');
        });
        (0, vitest_1.it)('passes a number input through unchanged', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'unverified',
                agentTrust: makeMock(0, 0),
            });
            const output = await gate.invoke(42);
            (0, vitest_1.expect)(output).toBe(42);
        });
        (0, vitest_1.it)('passes null input through unchanged', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'unverified',
                agentTrust: makeMock(0, 0),
            });
            const output = await gate.invoke(null);
            (0, vitest_1.expect)(output).toBeNull();
        });
        (0, vitest_1.it)('passes with platinum for any minTier', async () => {
            for (const minTier of ['unverified', 'bronze', 'silver', 'gold', 'platinum']) {
                const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                    agentAddress: AGENT,
                    minTier,
                    agentTrust: makeMock(4, 99),
                });
                const output = await gate.invoke({ x: 1 });
                (0, vitest_1.expect)(output).toEqual({ x: 1 });
            }
        });
    });
    (0, vitest_1.describe)('invoke — fail cases', () => {
        (0, vitest_1.it)('throws TrustCheckFailedError when tier is below minimum', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'gold',
                agentTrust: makeMock(1, 30), // bronze
            });
            await (0, vitest_1.expect)(gate.invoke({ x: 1 })).rejects.toThrow(types_js_1.TrustCheckFailedError);
        });
        (0, vitest_1.it)('throws for unverified when minTier is bronze', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'bronze',
                agentTrust: makeMock(0, 0), // unverified
            });
            await (0, vitest_1.expect)(gate.invoke('anything')).rejects.toThrow(types_js_1.TrustCheckFailedError);
        });
        (0, vitest_1.it)('error contains the agent address', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'platinum',
                agentTrust: makeMock(0, 0),
            });
            try {
                await gate.invoke({});
                vitest_1.expect.fail('should have thrown');
            }
            catch (err) {
                (0, vitest_1.expect)(err.address).toBe(AGENT);
            }
        });
        (0, vitest_1.it)('error contains actual tier and required tier', async () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'platinum',
                agentTrust: makeMock(1, 30), // bronze
            });
            try {
                await gate.invoke({});
                vitest_1.expect.fail('should have thrown');
            }
            catch (err) {
                const e = err;
                (0, vitest_1.expect)(e.tier).toBe('bronze');
                (0, vitest_1.expect)(e.requiredTier).toBe('platinum');
            }
        });
    });
    // ---------------------------------------------------------------------------
    // Constructor configuration
    // ---------------------------------------------------------------------------
    (0, vitest_1.describe)('configuration', () => {
        (0, vitest_1.it)('getAgentAddress() returns the configured address', () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'silver',
                agentTrust: makeMock(2, 60),
            });
            (0, vitest_1.expect)(gate.getAgentAddress()).toBe(AGENT);
        });
        (0, vitest_1.it)('getMinTier() returns the configured minTier', () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'gold',
                agentTrust: makeMock(3, 80),
            });
            (0, vitest_1.expect)(gate.getMinTier()).toBe('gold');
        });
        (0, vitest_1.it)('defaults minTier to "bronze" when not provided', () => {
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                agentTrust: makeMock(1, 30),
            });
            (0, vitest_1.expect)(gate.getMinTier()).toBe('bronze');
        });
    });
    // ---------------------------------------------------------------------------
    // .pipe() chaining
    // ---------------------------------------------------------------------------
    (0, vitest_1.describe)('chaining with .pipe()', () => {
        (0, vitest_1.it)('can be piped into another runnable', async () => {
            const { RunnableLambda } = await import('@langchain/core/runnables');
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'bronze',
                agentTrust: makeMock(2, 60), // silver — passes
            });
            const nextStep = RunnableLambda.from((input) => ({ processed: true, input }));
            const chain = gate.pipe(nextStep);
            const output = await chain.invoke({ query: 'test' });
            (0, vitest_1.expect)(output).toEqual({ processed: true, input: { query: 'test' } });
        });
        (0, vitest_1.it)('chain throws TrustCheckFailedError before reaching next step', async () => {
            const { RunnableLambda } = await import('@langchain/core/runnables');
            const nextStepFn = vitest_1.vi.fn().mockResolvedValue({ processed: true });
            const gate = new runnable_trust_gate_js_1.RunnableTrustGate({
                agentAddress: AGENT,
                minTier: 'platinum',
                agentTrust: makeMock(0, 0), // unverified — fails
            });
            const chain = gate.pipe(RunnableLambda.from(nextStepFn));
            await (0, vitest_1.expect)(chain.invoke({ query: 'test' })).rejects.toThrow(types_js_1.TrustCheckFailedError);
            // Next step should NOT have been called
            (0, vitest_1.expect)(nextStepFn).not.toHaveBeenCalled();
        });
    });
});
