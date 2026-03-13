"use strict";
/**
 * ERC-8004 Validation Registry Reader
 *
 * Reads agent validation data from ERC-8004 Validation Registry.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getERC8004Validation = getERC8004Validation;
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
/**
 * Fetch ERC-8004 validation data for an agent from the Validation Registry.
 *
 * @param agentId - Agent token ID
 * @param registryAddress - Validation registry contract address
 * @param provider - Ethers provider
 * @param limit - Maximum number of recent validations to fetch
 * @returns ERC8004Validation data or null if not available
 */
async function getERC8004Validation(agentId, registryAddress, provider, limit = constants_1.DEFAULT_VALIDATION_LIMIT) {
    if (registryAddress === ethers_1.ethers.ZeroAddress) {
        return null;
    }
    try {
        const contract = new ethers_1.ethers.Contract(registryAddress, constants_1.VALIDATION_REGISTRY_ABI, provider);
        const validationCount = await contract.getValidationCount(agentId);
        const count = Number(validationCount);
        if (count === 0) {
            return {
                validationCount: 0,
                passedCount: 0,
                recentValidations: [],
            };
        }
        const passedCount = await contract.getPassedCount(agentId);
        const offset = Math.max(0, count - limit);
        const fetchLimit = Math.min(count, limit);
        const rawValidations = await contract.getValidations(agentId, offset, fetchLimit);
        const recentValidations = rawValidations.map((v) => ({
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
    }
    catch {
        return null;
    }
}
