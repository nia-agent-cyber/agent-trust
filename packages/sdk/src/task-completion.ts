import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { SCHEMAS } from './constants';
import {
  NormalizedTaskCompletion,
  TaskOutcome,
  TaskCompletionRequest,
} from './types';
import { normalizeTimestampToSeconds, normalizePaymentAmount } from './payment-reliable';

const TASK_OUTCOME_TO_CODE: Record<TaskOutcome, 0 | 1 | 2> = {
  failed: 0,
  completed: 1,
  disputed: 2,
};

const TASK_CODE_TO_OUTCOME: Record<number, TaskOutcome> = {
  0: 'failed',
  1: 'completed',
  2: 'disputed',
};

const VALID_OUTCOMES = new Set<string>(['completed', 'failed', 'disputed']);

/**
 * Normalize and validate a TaskCompletionRequest.
 * Throws on invalid inputs.
 */
export function normalizeTaskCompletionRequest(request: TaskCompletionRequest): NormalizedTaskCompletion {
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
  const completedAt = normalizeTimestampToSeconds(request.completedAt);

  let reward = 0n;
  if (request.reward !== undefined && request.reward !== null) {
    reward = normalizePaymentAmount(request.reward);
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
export function encodeTaskCompletionAttestation(request: TaskCompletionRequest): string {
  const normalized = normalizeTaskCompletionRequest(request);
  const schemaEncoder = new SchemaEncoder(SCHEMAS.taskCompletion.schema);

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
export function parseTaskOutcome(code: number): TaskOutcome {
  const outcome = TASK_CODE_TO_OUTCOME[code];
  if (outcome === undefined) {
    throw new Error(`Unknown task outcome code: ${code}`);
  }
  return outcome;
}
