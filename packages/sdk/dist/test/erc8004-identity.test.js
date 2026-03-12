"use strict";
/**
 * ERC-8004 Identity Registry Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ethers_1 = require("ethers");
const identity_1 = require("../erc8004/identity");
// Mock ethers Contract
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
const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
const TEST_REGISTRY = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01';
function createMockProvider() {
    return {};
}
function setupContractMock(overrides = {}) {
    const mock = {
        balanceOf: vitest_1.vi.fn().mockResolvedValue(1n),
        tokenOfOwnerByIndex: vitest_1.vi.fn().mockResolvedValue(42n),
        tokenURI: vitest_1.vi.fn().mockResolvedValue('https://example.com/agent/42.json'),
        ownerOf: vitest_1.vi.fn().mockResolvedValue(TEST_ADDRESS),
        ...overrides,
    };
    ethers_1.ethers.Contract.mockImplementation(() => mock);
    return mock;
}
(0, vitest_1.describe)('ERC-8004 Identity', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('getERC8004Identity', () => {
        (0, vitest_1.it)('returns null for zero address registry', async () => {
            const result = await (0, identity_1.getERC8004Identity)(TEST_ADDRESS, ethers_1.ethers.ZeroAddress, createMockProvider());
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('returns null when agent has no tokens', async () => {
            setupContractMock({ balanceOf: vitest_1.vi.fn().mockResolvedValue(0n) });
            const result = await (0, identity_1.getERC8004Identity)(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('returns identity when agent has tokens', async () => {
            const metadata = { name: 'TestAgent', capabilities: ['chat'] };
            // Mock fetch for metadata resolution
            global.fetch = vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(metadata),
            });
            setupContractMock();
            const result = await (0, identity_1.getERC8004Identity)(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());
            (0, vitest_1.expect)(result).not.toBeNull();
            (0, vitest_1.expect)(result.agentId).toBe(42);
            (0, vitest_1.expect)(result.owner).toBe(TEST_ADDRESS);
            (0, vitest_1.expect)(result.registryAddress).toBe(TEST_REGISTRY);
            (0, vitest_1.expect)(result.tokenURI).toBe('https://example.com/agent/42.json');
            (0, vitest_1.expect)(result.metadata).toEqual(metadata);
        });
        (0, vitest_1.it)('returns identity with null metadata when tokenURI fetch fails', async () => {
            global.fetch = vitest_1.vi.fn().mockResolvedValue({ ok: false });
            setupContractMock();
            const result = await (0, identity_1.getERC8004Identity)(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());
            (0, vitest_1.expect)(result).not.toBeNull();
            (0, vitest_1.expect)(result.agentId).toBe(42);
            (0, vitest_1.expect)(result.metadata).toBeNull();
        });
        (0, vitest_1.it)('returns null when contract call throws', async () => {
            setupContractMock({ balanceOf: vitest_1.vi.fn().mockRejectedValue(new Error('revert')) });
            const result = await (0, identity_1.getERC8004Identity)(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('resolveTokenURI', () => {
        (0, vitest_1.it)('resolves base64 data URI', async () => {
            const metadata = { name: 'Agent', version: '1.0' };
            const encoded = Buffer.from(JSON.stringify(metadata)).toString('base64');
            const uri = `data:application/json;base64,${encoded}`;
            const result = await (0, identity_1.resolveTokenURI)(uri);
            (0, vitest_1.expect)(result).toEqual(metadata);
        });
        (0, vitest_1.it)('resolves direct JSON data URI', async () => {
            const metadata = { name: 'Agent' };
            const uri = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;
            const result = await (0, identity_1.resolveTokenURI)(uri);
            (0, vitest_1.expect)(result).toEqual(metadata);
        });
        (0, vitest_1.it)('resolves HTTPS URL', async () => {
            const metadata = { name: 'RemoteAgent' };
            global.fetch = vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(metadata),
            });
            const result = await (0, identity_1.resolveTokenURI)('https://example.com/agent.json');
            (0, vitest_1.expect)(result).toEqual(metadata);
        });
        (0, vitest_1.it)('returns null for failed HTTPS fetch', async () => {
            global.fetch = vitest_1.vi.fn().mockResolvedValue({ ok: false });
            const result = await (0, identity_1.resolveTokenURI)('https://example.com/missing.json');
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('returns null for unknown URI scheme', async () => {
            const result = await (0, identity_1.resolveTokenURI)('ftp://example.com/agent.json');
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('returns null for invalid JSON in data URI', async () => {
            const encoded = Buffer.from('not json').toString('base64');
            const result = await (0, identity_1.resolveTokenURI)(`data:application/json;base64,${encoded}`);
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('handles IPFS URIs', async () => {
            const metadata = { name: 'IPFSAgent' };
            global.fetch = vitest_1.vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(metadata),
            });
            const result = await (0, identity_1.resolveTokenURI)('ipfs://QmTest123');
            (0, vitest_1.expect)(result).toEqual(metadata);
            (0, vitest_1.expect)(global.fetch).toHaveBeenCalledWith('https://ipfs.io/ipfs/QmTest123', vitest_1.expect.any(Object));
        });
    });
});
