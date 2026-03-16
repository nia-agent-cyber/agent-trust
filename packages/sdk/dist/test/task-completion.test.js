"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const task_completion_1 = require("../task-completion");
const VALID_ADDRESS = '0x' + 'a'.repeat(40);
(0, vitest_1.describe)('normalizeTaskCompletionRequest', () => {
    (0, vitest_1.it)('normalizes a full valid request', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'bounty-42',
            category: 'code',
            completedAt: 1700000000,
            reward: '500',
            rewardToken: 'USDC',
            taskRef: 'https://example.com/task/42',
        });
        (0, vitest_1.expect)(result.subjectAgent).toBe(VALID_ADDRESS);
        (0, vitest_1.expect)(result.outcome).toBe('completed');
        (0, vitest_1.expect)(result.outcomeCode).toBe(1);
        (0, vitest_1.expect)(result.taskId).toBe('bounty-42');
        (0, vitest_1.expect)(result.category).toBe('code');
        (0, vitest_1.expect)(result.completedAt).toBe(1700000000n);
        (0, vitest_1.expect)(result.reward).toBe(500n);
        (0, vitest_1.expect)(result.rewardToken).toBe('USDC');
        (0, vitest_1.expect)(result.taskRef).toBe('https://example.com/task/42');
    });
    (0, vitest_1.it)('applies defaults for optional fields (no reward, no taskRef)', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'failed',
            taskId: 'task-01',
            category: 'review',
            completedAt: 1700000000,
        });
        (0, vitest_1.expect)(result.outcome).toBe('failed');
        (0, vitest_1.expect)(result.outcomeCode).toBe(0);
        (0, vitest_1.expect)(result.reward).toBe(0n);
        (0, vitest_1.expect)(result.rewardToken).toBe('');
        (0, vitest_1.expect)(result.taskRef).toBe('');
    });
    (0, vitest_1.it)('maps disputed outcome to code 2', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'disputed',
            taskId: 'task-disputed',
            category: 'design',
            completedAt: 1700000000,
        });
        (0, vitest_1.expect)(result.outcome).toBe('disputed');
        (0, vitest_1.expect)(result.outcomeCode).toBe(2);
    });
    (0, vitest_1.it)('throws when subjectAgent is missing', () => {
        (0, vitest_1.expect)(() => (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: '',
            outcome: 'completed',
            taskId: 'task-1',
            category: 'code',
            completedAt: 1700000000,
        })).toThrow(/subjectAgent is required/i);
    });
    (0, vitest_1.it)('throws when subjectAgent is whitespace-only', () => {
        (0, vitest_1.expect)(() => (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: '   ',
            outcome: 'completed',
            taskId: 'task-1',
            category: 'code',
            completedAt: 1700000000,
        })).toThrow(/subjectAgent is required/i);
    });
    (0, vitest_1.it)('throws when taskId is missing', () => {
        (0, vitest_1.expect)(() => (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: '',
            category: 'code',
            completedAt: 1700000000,
        })).toThrow(/taskId is required/i);
    });
    (0, vitest_1.it)('throws when category is missing', () => {
        (0, vitest_1.expect)(() => (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'task-1',
            category: '',
            completedAt: 1700000000,
        })).toThrow(/category is required/i);
    });
    (0, vitest_1.it)('throws on invalid outcome', () => {
        (0, vitest_1.expect)(() => (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'unknown',
            taskId: 'task-1',
            category: 'code',
            completedAt: 1700000000,
        })).toThrow(/outcome must be one of/i);
    });
    (0, vitest_1.it)('normalizes completedAt from ISO string', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'task-iso',
            category: 'writing',
            completedAt: '2023-11-14T22:13:20.000Z',
        });
        (0, vitest_1.expect)(result.completedAt).toBe(1700000000n);
    });
    (0, vitest_1.it)('normalizes completedAt from milliseconds', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'task-ms',
            category: 'other',
            completedAt: 1700000000000,
        });
        (0, vitest_1.expect)(result.completedAt).toBe(1700000000n);
    });
    (0, vitest_1.it)('normalizes completedAt from Date object', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'task-date',
            category: 'code',
            completedAt: new Date('2023-11-14T22:13:20.000Z'),
        });
        (0, vitest_1.expect)(result.completedAt).toBe(1700000000n);
    });
    (0, vitest_1.it)('normalizes reward from string', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'task-r',
            category: 'code',
            completedAt: 1700000000,
            reward: '1000000',
        });
        (0, vitest_1.expect)(result.reward).toBe(1000000n);
    });
    (0, vitest_1.it)('normalizes reward from number', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'task-r2',
            category: 'code',
            completedAt: 1700000000,
            reward: 250,
        });
        (0, vitest_1.expect)(result.reward).toBe(250n);
    });
    (0, vitest_1.it)('normalizes reward from bigint', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'task-r3',
            category: 'code',
            completedAt: 1700000000,
            reward: 999n,
        });
        (0, vitest_1.expect)(result.reward).toBe(999n);
    });
    (0, vitest_1.it)('trims whitespace from string fields', () => {
        const result = (0, task_completion_1.normalizeTaskCompletionRequest)({
            subjectAgent: `  ${VALID_ADDRESS}  `,
            outcome: 'completed',
            taskId: '  bounty-whitespace  ',
            category: '  code  ',
            completedAt: 1700000000,
            rewardToken: '  GTC  ',
            taskRef: '  https://ref.example.com  ',
        });
        (0, vitest_1.expect)(result.subjectAgent).toBe(VALID_ADDRESS);
        (0, vitest_1.expect)(result.taskId).toBe('bounty-whitespace');
        (0, vitest_1.expect)(result.category).toBe('code');
        (0, vitest_1.expect)(result.rewardToken).toBe('GTC');
        (0, vitest_1.expect)(result.taskRef).toBe('https://ref.example.com');
    });
});
(0, vitest_1.describe)('encodeTaskCompletionAttestation', () => {
    (0, vitest_1.it)('returns a valid hex-encoded payload', () => {
        const encoded = (0, task_completion_1.encodeTaskCompletionAttestation)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'completed',
            taskId: 'bounty-encode-test',
            category: 'code',
            completedAt: 1700000000,
            reward: '500',
            rewardToken: 'USDC',
            taskRef: 'https://gitcoin.co/bounty/encode-test',
        });
        (0, vitest_1.expect)(encoded).toMatch(/^0x[0-9a-f]+$/i);
        (0, vitest_1.expect)(encoded.length).toBeGreaterThan(10);
    });
    (0, vitest_1.it)('encodes a minimal request (no reward, no taskRef)', () => {
        const encoded = (0, task_completion_1.encodeTaskCompletionAttestation)({
            subjectAgent: VALID_ADDRESS,
            outcome: 'failed',
            taskId: 'task-minimal',
            category: 'review',
            completedAt: 1700000000,
        });
        (0, vitest_1.expect)(encoded).toMatch(/^0x[0-9a-f]+$/i);
        (0, vitest_1.expect)(encoded.length).toBeGreaterThan(10);
    });
});
(0, vitest_1.describe)('parseTaskOutcome', () => {
    (0, vitest_1.it)('maps code 0 to failed', () => {
        (0, vitest_1.expect)((0, task_completion_1.parseTaskOutcome)(0)).toBe('failed');
    });
    (0, vitest_1.it)('maps code 1 to completed', () => {
        (0, vitest_1.expect)((0, task_completion_1.parseTaskOutcome)(1)).toBe('completed');
    });
    (0, vitest_1.it)('maps code 2 to disputed', () => {
        (0, vitest_1.expect)((0, task_completion_1.parseTaskOutcome)(2)).toBe('disputed');
    });
    (0, vitest_1.it)('throws on unknown code', () => {
        (0, vitest_1.expect)(() => (0, task_completion_1.parseTaskOutcome)(99)).toThrow(/unknown task outcome code/i);
    });
    (0, vitest_1.it)('throws on negative code', () => {
        (0, vitest_1.expect)(() => (0, task_completion_1.parseTaskOutcome)(-1)).toThrow(/unknown task outcome code/i);
    });
});
