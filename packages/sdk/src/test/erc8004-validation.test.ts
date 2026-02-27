/**
 * ERC-8004 Validation Registry Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ethers } from 'ethers';
import { getERC8004Validation } from '../erc8004/validation';

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
    getValidationCount: vi.fn().mockResolvedValue(3n),
    getPassedCount: vi.fn().mockResolvedValue(2n),
    getValidations: vi.fn().mockResolvedValue([
      { validator: '0xval1', passed: true, validationType: 'zkML', timestamp: 1700000000n },
      { validator: '0xval2', passed: false, validationType: 'TEE', timestamp: 1700001000n },
    ]),
    ...overrides,
  };
  (ethers.Contract as any).mockImplementation(() => mock);
  return mock;
}

describe('ERC-8004 Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for zero address registry', async () => {
    const result = await getERC8004Validation(42, ethers.ZeroAddress, createMockProvider());
    expect(result).toBeNull();
  });

  it('returns empty validation when count is 0', async () => {
    setupContractMock({ getValidationCount: vi.fn().mockResolvedValue(0n) });
    const result = await getERC8004Validation(42, TEST_REGISTRY, createMockProvider());
    expect(result).toEqual({
      validationCount: 0,
      passedCount: 0,
      recentValidations: [],
    });
  });

  it('returns validation data', async () => {
    setupContractMock();
    const result = await getERC8004Validation(42, TEST_REGISTRY, createMockProvider());

    expect(result).not.toBeNull();
    expect(result!.validationCount).toBe(3);
    expect(result!.passedCount).toBe(2);
    expect(result!.recentValidations).toHaveLength(2);
    expect(result!.recentValidations[0]).toEqual({
      validator: '0xval1',
      passed: true,
      validationType: 'zkML',
      timestamp: 1700000000,
    });
  });

  it('returns null when contract call fails', async () => {
    setupContractMock({ getValidationCount: vi.fn().mockRejectedValue(new Error('revert')) });
    const result = await getERC8004Validation(42, TEST_REGISTRY, createMockProvider());
    expect(result).toBeNull();
  });
});
