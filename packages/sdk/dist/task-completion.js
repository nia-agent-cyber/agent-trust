"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTaskCompletionRequest = normalizeTaskCompletionRequest;
exports.encodeTaskCompletionAttestation = encodeTaskCompletionAttestation;
exports.parseTaskOutcome = parseTaskOutcome;
const eas_sdk_1 = require("@ethereum-attestation-service/eas-sdk");
const constants_1 = require("./constants");
const payment_reliable_1 = require("./payment-reliable");
const TASK_OUTCOME_TO_CODE = {
    failed: 0,
    completed: 1,
    disputed: 2,
};
const TASK_CODE_TO_OUTCOME = {
    0: 'failed',
    1: 'completed',
    2: 'disputed',
};
const VALID_OUTCOMES = new Set(['completed', 'failed', 'disputed']);
/**
 * Normalize and validate a TaskCompletionRequest.
 * Throws on invalid inputs.
 */
function normalizeTaskCompletionRequest(request) {
    if (!request.subjectAgent || !request.subjectAgent.trim()) {
        throw new Error('subjectAgent is required');
    }
    if (!request.taskId || !request.taskId.trim()) {
        throw new Error('taskId is required');
    }
    if (!request.category || !request.category.trim()) {
        throw new Error('category is required');
    }
    if (!VALID_OUTCOMES.has(request.outcome)) {
        throw new Error('outcome must be one of: completed, failed, disputed');
    }
    const outcomeCode = TASK_OUTCOME_TO_CODE[request.outcome];
    const completedAt = (0, payment_reliable_1.normalizeTimestampToSeconds)(request.completedAt);
    let reward = 0n;
    if (request.reward !== undefined && request.reward !== null) {
        reward = (0, payment_reliable_1.normalizePaymentAmount)(request.reward);
    }
    return {
        subjectAgent: request.subjectAgent.trim(),
        outcome: request.outcome,
        outcomeCode,
        taskId: request.taskId.trim(),
        category: request.category.trim(),
        completedAt,
        reward,
        rewardToken: request.rewardToken?.trim() || '',
        taskRef: request.taskRef?.trim() || '',
    };
}
/**
 * Encode a TaskCompletion attestation payload for EAS.
 */
function encodeTaskCompletionAttestation(request) {
    const normalized = normalizeTaskCompletionRequest(request);
    const schemaEncoder = new eas_sdk_1.SchemaEncoder(constants_1.SCHEMAS.taskCompletion.schema);
    return schemaEncoder.encodeData([
        { name: 'subjectAgent', value: normalized.subjectAgent, type: 'address' },
        { name: 'outcome', value: normalized.outcomeCode, type: 'uint8' },
        { name: 'taskId', value: normalized.taskId, type: 'string' },
        { name: 'category', value: normalized.category, type: 'string' },
        { name: 'completedAt', value: normalized.completedAt, type: 'uint64' },
        { name: 'reward', value: normalized.reward, type: 'uint256' },
        { name: 'rewardToken', value: normalized.rewardToken, type: 'string' },
        { name: 'taskRef', value: normalized.taskRef, type: 'string' },
    ]);
}
/**
 * Map a numeric outcome code to a TaskOutcome string.
 * Throws for unknown codes.
 */
function parseTaskOutcome(code) {
    const outcome = TASK_CODE_TO_OUTCOME[code];
    if (outcome === undefined) {
        throw new Error(`Unknown task outcome code: ${code}`);
    }
    return outcome;
}
