"use strict";
/**
 * ERC-8004 Reputation Registry Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ethers_1 = require("ethers");
const reputation_1 = require("../erc8004/reputation");
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
        getFeedbackCount: vitest_1.vi.fn().mockResolvedValue(5n),
        getAverageRating: vitest_1.vi.fn().mockResolvedValue(420n), // 4.20 * 100
        getFeedback: vitest_1.vi.fn().mockResolvedValue([
            { from: '0xaaa', rating: 5, comment: 'Great agent', timestamp: 1700000000n },
            { from: '0xbbb', rating: 3, comment: 'Okay', timestamp: 1700001000n },
        ]),
        ...overrides,
    };
    ethers_1.ethers.Contract.mockImplementation(() => mock);
    return mock;
}
(0, vitest_1.describe)('ERC-8004 Reputation', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('returns null for zero address registry', async () => {
        const result = await (0, reputation_1.getERC8004Reputation)(42, ethers_1.ethers.ZeroAddress, createMockProvider());
        (0, vitest_1.expect)(result).toBeNull();
    });
    (0, vitest_1.it)('returns empty reputation when feedback count is 0', async () => {
        setupContractMock({ getFeedbackCount: vitest_1.vi.fn().mockResolvedValue(0n) });
        const result = await (0, reputation_1.getERC8004Reputation)(42, TEST_REGISTRY, createMockProvider());
        (0, vitest_1.expect)(result).toEqual({
            feedbackCount: 0,
            averageRating: null,
            recentFeedback: [],
        });
    });
    (0, vitest_1.it)('returns reputation data with feedback', async () => {
        setupContractMock();
        const result = await (0, reputation_1.getERC8004Reputation)(42, TEST_REGISTRY, createMockProvider());
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.feedbackCount).toBe(5);
        (0, vitest_1.expect)(result.averageRating).toBe(4.20);
        (0, vitest_1.expect)(result.recentFeedback).toHaveLength(2);
        (0, vitest_1.expect)(result.recentFeedback[0]).toEqual({
            from: '0xaaa',
            rating: 5,
            comment: 'Great agent',
            timestamp: 1700000000,
        });
    });
    (0, vitest_1.it)('returns null when contract call fails', async () => {
        setupContractMock({ getFeedbackCount: vitest_1.vi.fn().mockRejectedValue(new Error('revert')) });
        const result = await (0, reputation_1.getERC8004Reputation)(42, TEST_REGISTRY, createMockProvider());
        (0, vitest_1.expect)(result).toBeNull();
    });
    (0, vitest_1.it)('respects custom feedback limit', async () => {
        const mock = setupContractMock();
        await (0, reputation_1.getERC8004Reputation)(42, TEST_REGISTRY, createMockProvider(), 3);
        // Should call getFeedback with offset 2 (5-3), limit 3
        (0, vitest_1.expect)(mock.getFeedback).toHaveBeenCalledWith(42, 2, 3);
    });
    (0, vitest_1.it)('handles limit larger than total count', async () => {
        const mock = setupContractMock();
        await (0, reputation_1.getERC8004Reputation)(42, TEST_REGISTRY, createMockProvider(), 20);
        // offset should be 0, limit should be 5 (total count)
        (0, vitest_1.expect)(mock.getFeedback).toHaveBeenCalledWith(42, 0, 5);
    });
});
