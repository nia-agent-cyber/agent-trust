/**
 * ERC-8004 Reputation Registry Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ethers } from 'ethers';
import { getERC8004Reputation } from '../erc8004/reputation';

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

const TEST_REGISTRY = '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01';

function createMockProvider() {
  return {} as ethers.Provider;
}

function setupContractMock(overrides: Record<string, any> = {}) {
  const mock = {
    getFeedbackCount: vi.fn().mockResolvedValue(5n),
    getAverageRating: vi.fn().mockResolvedValue(420n), // 4.20 * 100
    getFeedback: vi.fn().mockResolvedValue([
      { from: '0xaaa', rating: 5, comment: 'Great agent', timestamp: 1700000000n },
      { from: '0xbbb', rating: 3, comment: 'Okay', timestamp: 1700001000n },
    ]),
    ...overrides,
  };
  (ethers.Contract as any).mockImplementation(() => mock);
  return mock;
}

describe('ERC-8004 Reputation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for zero address registry', async () => {
    const result = await getERC8004Reputation(42, ethers.ZeroAddress, createMockProvider());
    expect(result).toBeNull();
  });

  it('returns empty reputation when feedback count is 0', async () => {
    setupContractMock({ getFeedbackCount: vi.fn().mockResolvedValue(0n) });
    const result = await getERC8004Reputation(42, TEST_REGISTRY, createMockProvider());
    expect(result).toEqual({
      feedbackCount: 0,
      averageRating: null,
      recentFeedback: [],
    });
  });

  it('returns reputation data with feedback', async () => {
    setupContractMock();
    const result = await getERC8004Reputation(42, TEST_REGISTRY, createMockProvider());

    expect(result).not.toBeNull();
    expect(result!.feedbackCount).toBe(5);
    expect(result!.averageRating).toBe(4.20);
    expect(result!.recentFeedback).toHaveLength(2);
    expect(result!.recentFeedback[0]).toEqual({
      from: '0xaaa',
      rating: 5,
      comment: 'Great agent',
      timestamp: 1700000000,
    });
  });

  it('returns null when contract call fails', async () => {
    setupContractMock({ getFeedbackCount: vi.fn().mockRejectedValue(new Error('revert')) });
    const result = await getERC8004Reputation(42, TEST_REGISTRY, createMockProvider());
    expect(result).toBeNull();
  });

  it('respects custom feedback limit', async () => {
    const mock = setupContractMock();
    await getERC8004Reputation(42, TEST_REGISTRY, createMockProvider(), 3);
    // Should call getFeedback with offset 2 (5-3), limit 3
    expect(mock.getFeedback).toHaveBeenCalledWith(42, 2, 3);
  });

  it('handles limit larger than total count', async () => {
    const mock = setupContractMock();
    await getERC8004Reputation(42, TEST_REGISTRY, createMockProvider(), 20);
    // offset should be 0, limit should be 5 (total count)
    expect(mock.getFeedback).toHaveBeenCalledWith(42, 0, 5);
  });
});
