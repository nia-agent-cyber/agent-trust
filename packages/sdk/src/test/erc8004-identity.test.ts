/**
 * ERC-8004 Identity Registry Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ethers } from 'ethers';
import { getERC8004Identity, resolveTokenURI } from '../erc8004/identity';

// Mock ethers Contract
vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers') as any;
  return {
    ...actual,
    ethers: {
      ...actual.ethers,
      Contract: vi.fn(),
      ZeroAddress: '0x0000000000000000000000000000000000000000',
    },
  };
});

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
const TEST_REGISTRY = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01';

function createMockProvider() {
  return {} as ethers.Provider;
}

function setupContractMock(overrides: Record<string, any> = {}) {
  const mock = {
    balanceOf: vi.fn().mockResolvedValue(1n),
    tokenOfOwnerByIndex: vi.fn().mockResolvedValue(42n),
    tokenURI: vi.fn().mockResolvedValue('https://example.com/agent/42.json'),
    ownerOf: vi.fn().mockResolvedValue(TEST_ADDRESS),
    ...overrides,
  };
  (ethers.Contract as any).mockImplementation(() => mock);
  return mock;
}

describe('ERC-8004 Identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getERC8004Identity', () => {
    it('returns null for zero address registry', async () => {
      const result = await getERC8004Identity(TEST_ADDRESS, ethers.ZeroAddress, createMockProvider());
      expect(result).toBeNull();
    });

    it('returns null when agent has no tokens', async () => {
      setupContractMock({ balanceOf: vi.fn().mockResolvedValue(0n) });
      const result = await getERC8004Identity(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());
      expect(result).toBeNull();
    });

    it('returns identity when agent has tokens', async () => {
      const metadata = { name: 'TestAgent', capabilities: ['chat'] };
      // Mock fetch for metadata resolution
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(metadata),
      }) as any;

      setupContractMock();
      const result = await getERC8004Identity(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());

      expect(result).not.toBeNull();
      expect(result!.agentId).toBe(42);
      expect(result!.owner).toBe(TEST_ADDRESS);
      expect(result!.registryAddress).toBe(TEST_REGISTRY);
      expect(result!.tokenURI).toBe('https://example.com/agent/42.json');
      expect(result!.metadata).toEqual(metadata);
    });

    it('returns identity with null metadata when tokenURI fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
      setupContractMock();

      const result = await getERC8004Identity(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());
      expect(result).not.toBeNull();
      expect(result!.agentId).toBe(42);
      expect(result!.metadata).toBeNull();
    });

    it('returns null when contract call throws', async () => {
      setupContractMock({ balanceOf: vi.fn().mockRejectedValue(new Error('revert')) });
      const result = await getERC8004Identity(TEST_ADDRESS, TEST_REGISTRY, createMockProvider());
      expect(result).toBeNull();
    });
  });

  describe('resolveTokenURI', () => {
    it('resolves base64 data URI', async () => {
      const metadata = { name: 'Agent', version: '1.0' };
      const encoded = Buffer.from(JSON.stringify(metadata)).toString('base64');
      const uri = `data:application/json;base64,${encoded}`;

      const result = await resolveTokenURI(uri);
      expect(result).toEqual(metadata);
    });

    it('resolves direct JSON data URI', async () => {
      const metadata = { name: 'Agent' };
      const uri = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;

      const result = await resolveTokenURI(uri);
      expect(result).toEqual(metadata);
    });

    it('resolves HTTPS URL', async () => {
      const metadata = { name: 'RemoteAgent' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(metadata),
      }) as any;

      const result = await resolveTokenURI('https://example.com/agent.json');
      expect(result).toEqual(metadata);
    });

    it('returns null for failed HTTPS fetch', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;
      const result = await resolveTokenURI('https://example.com/missing.json');
      expect(result).toBeNull();
    });

    it('returns null for unknown URI scheme', async () => {
      const result = await resolveTokenURI('ftp://example.com/agent.json');
      expect(result).toBeNull();
    });

    it('returns null for invalid JSON in data URI', async () => {
      const encoded = Buffer.from('not json').toString('base64');
      const result = await resolveTokenURI(`data:application/json;base64,${encoded}`);
      expect(result).toBeNull();
    });

    it('handles IPFS URIs', async () => {
      const metadata = { name: 'IPFSAgent' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(metadata),
      }) as any;

      const result = await resolveTokenURI('ipfs://QmTest123');
      expect(result).toEqual(metadata);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://ipfs.io/ipfs/QmTest123',
        expect.any(Object),
      );
    });
  });
});
