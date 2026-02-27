/**
 * ERC-8004 Validation Registry Reader
 *
 * Reads agent validation data from ERC-8004 Validation Registry.
 */

import { ethers } from 'ethers';
import { ERC8004Validation, ValidationResult } from './types';
import { VALIDATION_REGISTRY_ABI, DEFAULT_VALIDATION_LIMIT } from './constants';

/**
 * Fetch ERC-8004 validation data for an agent from the Validation Registry.
 *
 * @param agentId - Agent token ID
 * @param registryAddress - Validation registry contract address
 * @param provider - Ethers provider
 * @param limit - Maximum number of recent validations to fetch
 * @returns ERC8004Validation data or null if not available
 */
export async function getERC8004Validation(
  agentId: number,
  registryAddress: string,
  provider: ethers.Provider,
  limit: number = DEFAULT_VALIDATION_LIMIT,
): Promise<ERC8004Validation | null> {
  if (registryAddress === ethers.ZeroAddress) {
    return null;
  }

  try {
    const contract = new ethers.Contract(registryAddress, VALIDATION_REGISTRY_ABI, provider);

    const validationCount: bigint = await contract.getValidationCount(agentId);
    const count = Number(validationCount);

    if (count === 0) {
      return {
        validationCount: 0,
        passedCount: 0,
        recentValidations: [],
      };
    }

    const passedCount: bigint = await contract.getPassedCount(agentId);

    const offset = Math.max(0, count - limit);
    const fetchLimit = Math.min(count, limit);
    const rawValidations = await contract.getValidations(agentId, offset, fetchLimit);

    const recentValidations: ValidationResult[] = rawValidations.map((v: any) => ({
      validator: v.validator,
      passed: v.passed,
      validationType: v.validationType,
      timestamp: Number(v.timestamp),
    }));

    return {
      validationCount: count,
      passedCount: Number(passedCount),
      recentValidations,
    };
  } catch {
    return null;
  }
}
