"use strict";
/**
 * ERC-8004 Validation Registry Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ethers_1 = require("ethers");
const validation_1 = require("../erc8004/validation");
vitest_1.vi.mock('ethers', async () => {
    const actual = await vitest_1.vi.importActual('ethers');
    return {
        ...actual,
        ethers: {
            ...actual.ethers,
            Contract: vitest_1.vi.fn(),
            ZeroAddress: '0x0000000000000000000000000000000000000000',
        },
    };
});
const TEST_REGISTRY = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01';
function createMockProvider() {
    return {};
}
function setupContractMock(overrides = {}) {
    const mock = {
        getValidationCount: vitest_1.vi.fn().mockResolvedValue(3n),
        getPassedCount: vitest_1.vi.fn().mockResolvedValue(2n),
        getValidations: vitest_1.vi.fn().mockResolvedValue([
            { validator: '0xval1', passed: true, validationType: 'zkML', timestamp: 1700000000n },
            { validator: '0xval2', passed: false, validationType: 'TEE', timestamp: 1700001000n },
        ]),
        ...overrides,
    };
    ethers_1.ethers.Contract.mockImplementation(() => mock);
    return mock;
}
(0, vitest_1.describe)('ERC-8004 Validation', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('returns null for zero address registry', async () => {
        const result = await (0, validation_1.getERC8004Validation)(42, ethers_1.ethers.ZeroAddress, createMockProvider());
        (0, vitest_1.expect)(result).toBeNull();
    });
    (0, vitest_1.it)('returns empty validation when count is 0', async () => {
        setupContractMock({ getValidationCount: vitest_1.vi.fn().mockResolvedValue(0n) });
        const result = await (0, validation_1.getERC8004Validation)(42, TEST_REGISTRY, createMockProvider());
        (0, vitest_1.expect)(result).toEqual({
            validationCount: 0,
            passedCount: 0,
            recentValidations: [],
        });
    });
    (0, vitest_1.it)('returns validation data', async () => {
        setupContractMock();
        const result = await (0, validation_1.getERC8004Validation)(42, TEST_REGISTRY, createMockProvider());
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.validationCount).toBe(3);
        (0, vitest_1.expect)(result.passedCount).toBe(2);
        (0, vitest_1.expect)(result.recentValidations).toHaveLength(2);
        (0, vitest_1.expect)(result.recentValidations[0]).toEqual({
            validator: '0xval1',
            passed: true,
            validationType: 'zkML',
            timestamp: 1700000000,
        });
    });
    (0, vitest_1.it)('returns null when contract call fails', async () => {
        setupContractMock({ getValidationCount: vitest_1.vi.fn().mockRejectedValue(new Error('revert')) });
        const result = await (0, validation_1.getERC8004Validation)(42, TEST_REGISTRY, createMockProvider());
        (0, vitest_1.expect)(result).toBeNull();
    });
});
