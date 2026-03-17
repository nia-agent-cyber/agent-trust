"use strict";
/**
 * Tests for TrustGuard
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const trust_guard_js_1 = require("../trust-guard.js");
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
const ADDR = '0xaBcDef1234567890AbcDEF1234567890abCDeF12';
// ---------------------------------------------------------------------------
// Instance method: guard.check()
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('TrustGuard (instance)', () => {
    (0, vitest_1.it)('returns result when agent tier meets the minimum', async () => {
        const guard = new trust_guard_js_1.TrustGuard(makeMock(2, 65)); // silver
        const result = await guard.check(ADDR, { minTier: 'silver' });
        (0, vitest_1.expect)(result.passed).toBe(true);
        (0, vitest_1.expect)(result.tier).toBe('silver');
    });
    (0, vitest_1.it)('returns result when agent tier exceeds the minimum', async () => {
        const guard = new trust_guard_js_1.TrustGuard(makeMock(4, 95)); // platinum
        const result = await guard.check(ADDR, { minTier: 'bronze' });
        (0, vitest_1.expect)(result.passed).toBe(true);
        (0, vitest_1.expect)(result.tier).toBe('platinum');
    });
    (0, vitest_1.it)('throws TrustCheckFailedError when tier is below minimum', async () => {
        const guard = new trust_guard_js_1.TrustGuard(makeMock(0, 0)); // unverified
        await (0, vitest_1.expect)(guard.check(ADDR, { minTier: 'bronze' })).rejects.toThrow(types_js_1.TrustCheckFailedError);
    });
    (0, vitest_1.it)('defaults minTier to "bronze"', async () => {
        const guard = new trust_guard_js_1.TrustGuard(makeMock(0, 0)); // unverified
        await (0, vitest_1.expect)(guard.check(ADDR)).rejects.toThrow(types_js_1.TrustCheckFailedError);
    });
    (0, vitest_1.it)('passes with unverified when minTier is "unverified"', async () => {
        const guard = new trust_guard_js_1.TrustGuard(makeMock(0, 0)); // unverified
        const result = await guard.check(ADDR, { minTier: 'unverified' });
        (0, vitest_1.expect)(result.passed).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// Static method: TrustGuard.check()
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('TrustGuard.check() (static)', () => {
    (0, vitest_1.it)('returns result when tier meets the minimum', async () => {
        const mock = makeMock(3, 80); // gold
        const result = await trust_guard_js_1.TrustGuard.check(mock, ADDR, { minTier: 'silver' });
        (0, vitest_1.expect)(result.passed).toBe(true);
        (0, vitest_1.expect)(result.tier).toBe('gold');
    });
    (0, vitest_1.it)('throws TrustCheckFailedError when tier is below minimum', async () => {
        const mock = makeMock(1, 40); // bronze
        await (0, vitest_1.expect)(trust_guard_js_1.TrustGuard.check(mock, ADDR, { minTier: 'gold' })).rejects.toThrow(types_js_1.TrustCheckFailedError);
    });
    (0, vitest_1.it)('defaults minTier to "bronze"', async () => {
        const mock = makeMock(1, 40); // bronze — passes default
        const result = await trust_guard_js_1.TrustGuard.check(mock, ADDR);
        (0, vitest_1.expect)(result.passed).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// TrustCheckFailedError
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('TrustCheckFailedError', () => {
    (0, vitest_1.it)('is an instance of Error', async () => {
        const mock = makeMock(0, 0); // unverified
        const guard = new trust_guard_js_1.TrustGuard(mock);
        try {
            await guard.check(ADDR, { minTier: 'gold' });
            vitest_1.expect.fail('should have thrown');
        }
        catch (err) {
            (0, vitest_1.expect)(err instanceof Error).toBe(true);
        }
    });
    (0, vitest_1.it)('is an instance of TrustCheckFailedError', async () => {
        const mock = makeMock(0, 0); // unverified
        const guard = new trust_guard_js_1.TrustGuard(mock);
        try {
            await guard.check(ADDR, { minTier: 'gold' });
            vitest_1.expect.fail('should have thrown');
        }
        catch (err) {
            (0, vitest_1.expect)(err instanceof types_js_1.TrustCheckFailedError).toBe(true);
        }
    });
    (0, vitest_1.it)('has correct .address property', async () => {
        const mock = makeMock(0, 0);
        const guard = new trust_guard_js_1.TrustGuard(mock);
        try {
            await guard.check(ADDR, { minTier: 'bronze' });
            vitest_1.expect.fail('should have thrown');
        }
        catch (err) {
            (0, vitest_1.expect)(err.address).toBe(ADDR);
        }
    });
    (0, vitest_1.it)('has correct .tier property', async () => {
        const mock = makeMock(1, 30); // bronze
        const guard = new trust_guard_js_1.TrustGuard(mock);
        try {
            await guard.check(ADDR, { minTier: 'platinum' });
            vitest_1.expect.fail('should have thrown');
        }
        catch (err) {
            (0, vitest_1.expect)(err.tier).toBe('bronze');
        }
    });
    (0, vitest_1.it)('has correct .requiredTier property', async () => {
        const mock = makeMock(1, 30); // bronze
        const guard = new trust_guard_js_1.TrustGuard(mock);
        try {
            await guard.check(ADDR, { minTier: 'platinum' });
            vitest_1.expect.fail('should have thrown');
        }
        catch (err) {
            (0, vitest_1.expect)(err.requiredTier).toBe('platinum');
        }
    });
    (0, vitest_1.it)('has a descriptive error message', async () => {
        const mock = makeMock(1, 30); // bronze
        const guard = new trust_guard_js_1.TrustGuard(mock);
        try {
            await guard.check(ADDR, { minTier: 'gold' });
            vitest_1.expect.fail('should have thrown');
        }
        catch (err) {
            const e = err;
            (0, vitest_1.expect)(e.message).toContain(ADDR);
            (0, vitest_1.expect)(e.message).toContain('bronze');
            (0, vitest_1.expect)(e.message).toContain('gold');
        }
    });
    (0, vitest_1.it)('has name "TrustCheckFailedError"', async () => {
        const mock = makeMock(0, 0);
        const guard = new trust_guard_js_1.TrustGuard(mock);
        try {
            await guard.check(ADDR, { minTier: 'bronze' });
            vitest_1.expect.fail('should have thrown');
        }
        catch (err) {
            (0, vitest_1.expect)(err.name).toBe('TrustCheckFailedError');
        }
    });
    (0, vitest_1.it)('can be constructed directly with correct fields', () => {
        const err = new types_js_1.TrustCheckFailedError(ADDR, 'bronze', 'gold');
        (0, vitest_1.expect)(err.address).toBe(ADDR);
        (0, vitest_1.expect)(err.tier).toBe('bronze');
        (0, vitest_1.expect)(err.requiredTier).toBe('gold');
        (0, vitest_1.expect)(err.message).toContain('bronze');
        (0, vitest_1.expect)(err.message).toContain('gold');
        (0, vitest_1.expect)(err instanceof types_js_1.TrustCheckFailedError).toBe(true);
    });
});
// ---------------------------------------------------------------------------
// Tier ordering
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('tier ordering', () => {
    const tiers = ['unverified', 'bronze', 'silver', 'gold', 'platinum'];
    for (let i = 0; i < tiers.length; i++) {
        for (let j = i + 1; j < tiers.length; j++) {
            const agentTier = tiers[i];
            const requiredTier = tiers[j];
            (0, vitest_1.it)(`tier '${agentTier}' does NOT meet '${requiredTier}'`, async () => {
                const mock = makeMock(i, i * 20);
                const guard = new trust_guard_js_1.TrustGuard(mock);
                await (0, vitest_1.expect)(guard.check(ADDR, { minTier: requiredTier })).rejects.toThrow(types_js_1.TrustCheckFailedError);
            });
        }
    }
});
