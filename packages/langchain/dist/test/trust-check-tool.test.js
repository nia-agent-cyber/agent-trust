"use strict";
/**
 * Tests for TrustCheckTool
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const trust_check_tool_js_1 = require("../trust-check-tool.js");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeMockAgentTrust(overrides) {
    const { tier = 2, tierName = 'Trusted', score = 65 } = overrides;
    return {
        getTier: vitest_1.vi.fn().mockResolvedValue({ tier, name: tierName }),
        getScore: vitest_1.vi.fn().mockResolvedValue({ score }),
    };
}
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
// ---------------------------------------------------------------------------
// TrustCheckTool shape
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('TrustCheckTool', () => {
    (0, vitest_1.describe)('schema and metadata', () => {
        (0, vitest_1.it)('has the correct tool name', () => {
            const tool = new trust_check_tool_js_1.TrustCheckTool(makeMockAgentTrust({}));
            (0, vitest_1.expect)(tool.name).toBe('trust_check');
        });
        (0, vitest_1.it)('has a non-empty description', () => {
            const tool = new trust_check_tool_js_1.TrustCheckTool(makeMockAgentTrust({}));
            (0, vitest_1.expect)(tool.description.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('has a valid zod schema with agentAddress field', () => {
            const tool = new trust_check_tool_js_1.TrustCheckTool(makeMockAgentTrust({}));
            const parsed = tool.schema.safeParse({ agentAddress: TEST_ADDRESS });
            (0, vitest_1.expect)(parsed.success).toBe(true);
        });
        (0, vitest_1.it)('has an optional minTier field in schema', () => {
            const tool = new trust_check_tool_js_1.TrustCheckTool(makeMockAgentTrust({}));
            const withoutMinTier = tool.schema.safeParse({ agentAddress: TEST_ADDRESS });
            const withMinTier = tool.schema.safeParse({
                agentAddress: TEST_ADDRESS,
                minTier: 'silver',
            });
            (0, vitest_1.expect)(withoutMinTier.success).toBe(true);
            (0, vitest_1.expect)(withMinTier.success).toBe(true);
        });
        (0, vitest_1.it)('rejects invalid minTier values', () => {
            const tool = new trust_check_tool_js_1.TrustCheckTool(makeMockAgentTrust({}));
            const result = tool.schema.safeParse({
                agentAddress: TEST_ADDRESS,
                minTier: 'diamond', // not in TIER_ORDER
            });
            (0, vitest_1.expect)(result.success).toBe(false);
        });
    });
    // ---------------------------------------------------------------------------
    // _call — pass cases
    // ---------------------------------------------------------------------------
    (0, vitest_1.describe)('_call — pass cases', () => {
        (0, vitest_1.it)('returns passed:true when tier meets the required tier (exact match)', async () => {
            const mock = makeMockAgentTrust({ tier: 1, score: 40 }); // bronze
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'bronze' });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.passed).toBe(true);
            (0, vitest_1.expect)(result.tier).toBe('bronze');
        });
        (0, vitest_1.it)('returns passed:true when tier exceeds the required tier', async () => {
            const mock = makeMockAgentTrust({ tier: 3, score: 80 }); // gold
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'silver' });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.passed).toBe(true);
            (0, vitest_1.expect)(result.tier).toBe('gold');
        });
        (0, vitest_1.it)('defaults minTier to "bronze" when not provided', async () => {
            const mock = makeMockAgentTrust({ tier: 1, score: 30 }); // bronze
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.passed).toBe(true);
            (0, vitest_1.expect)(result.tier).toBe('bronze');
        });
        (0, vitest_1.it)('platinum always passes any minTier', async () => {
            const mock = makeMockAgentTrust({ tier: 4, score: 99 }); // platinum
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            for (const minTier of ['unverified', 'bronze', 'silver', 'gold', 'platinum']) {
                const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier });
                const result = JSON.parse(raw);
                (0, vitest_1.expect)(result.passed).toBe(true);
            }
        });
    });
    // ---------------------------------------------------------------------------
    // _call — fail cases
    // ---------------------------------------------------------------------------
    (0, vitest_1.describe)('_call — fail cases', () => {
        (0, vitest_1.it)('returns passed:false when tier is below the required tier', async () => {
            const mock = makeMockAgentTrust({ tier: 1, score: 25 }); // bronze
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'gold' });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.passed).toBe(false);
            (0, vitest_1.expect)(result.tier).toBe('bronze');
        });
        (0, vitest_1.it)('returns passed:false for unverified when minTier is bronze', async () => {
            const mock = makeMockAgentTrust({ tier: 0, score: 0 }); // unverified
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'bronze' });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.passed).toBe(false);
            (0, vitest_1.expect)(result.tier).toBe('unverified');
        });
    });
    // ---------------------------------------------------------------------------
    // _call — result shape
    // ---------------------------------------------------------------------------
    (0, vitest_1.describe)('_call — result shape', () => {
        (0, vitest_1.it)('returns address in the result', async () => {
            const mock = makeMockAgentTrust({ tier: 2, score: 70 });
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.address).toBe(TEST_ADDRESS);
        });
        (0, vitest_1.it)('returns score from getScore', async () => {
            const mock = makeMockAgentTrust({ tier: 2, score: 72 });
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.score).toBe(72);
        });
        (0, vitest_1.it)('returns a non-empty reason string', async () => {
            const mock = makeMockAgentTrust({ tier: 2, score: 70 });
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(typeof result.reason).toBe('string');
            (0, vitest_1.expect)(result.reason.length).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('reason includes the address', async () => {
            const mock = makeMockAgentTrust({ tier: 2, score: 70 });
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.reason).toContain(TEST_ADDRESS);
        });
        (0, vitest_1.it)('reason includes tier names on fail', async () => {
            const mock = makeMockAgentTrust({ tier: 0, score: 0 }); // unverified
            const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
            const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'gold' });
            const result = JSON.parse(raw);
            (0, vitest_1.expect)(result.reason).toContain('unverified');
            (0, vitest_1.expect)(result.reason).toContain('gold');
        });
    });
    // ---------------------------------------------------------------------------
    // Tier name mapping
    // ---------------------------------------------------------------------------
    (0, vitest_1.describe)('tier name mapping', () => {
        const tierMap = [
            [0, 'unverified'],
            [1, 'bronze'],
            [2, 'silver'],
            [3, 'gold'],
            [4, 'platinum'],
        ];
        for (const [numericTier, expectedName] of tierMap) {
            (0, vitest_1.it)(`maps SDK tier ${numericTier} to '${expectedName}'`, async () => {
                const mock = makeMockAgentTrust({ tier: numericTier, score: 50 });
                const tool = new trust_check_tool_js_1.TrustCheckTool(mock);
                const raw = await tool._call({ agentAddress: TEST_ADDRESS, minTier: 'unverified' });
                const result = JSON.parse(raw);
                (0, vitest_1.expect)(result.tier).toBe(expectedName);
            });
        }
    });
});
// ---------------------------------------------------------------------------
// performTrustCheck (shared utility)
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('performTrustCheck', () => {
    (0, vitest_1.it)('calls getTier and getScore with the agent address', async () => {
        const mock = makeMockAgentTrust({ tier: 2, score: 60 });
        await (0, trust_check_tool_js_1.performTrustCheck)(mock, TEST_ADDRESS, 'bronze');
        (0, vitest_1.expect)(mock.getTier).toHaveBeenCalledWith(TEST_ADDRESS);
        (0, vitest_1.expect)(mock.getScore).toHaveBeenCalledWith(TEST_ADDRESS);
    });
    (0, vitest_1.it)('returns a TrustCheckResult with all required fields', async () => {
        const mock = makeMockAgentTrust({ tier: 2, score: 60 });
        const result = await (0, trust_check_tool_js_1.performTrustCheck)(mock, TEST_ADDRESS, 'bronze');
        (0, vitest_1.expect)(result).toHaveProperty('address');
        (0, vitest_1.expect)(result).toHaveProperty('tier');
        (0, vitest_1.expect)(result).toHaveProperty('score');
        (0, vitest_1.expect)(result).toHaveProperty('passed');
        (0, vitest_1.expect)(result).toHaveProperty('reason');
    });
});
