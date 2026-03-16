import { describe, it, expect } from 'vitest';
import {
  normalizeTaskCompletionRequest,
  encodeTaskCompletionAttestation,
  parseTaskOutcome,
} from '../task-completion';

const VALID_ADDRESS = '0x' + 'a'.repeat(40);

describe('normalizeTaskCompletionRequest', () => {
  it('normalizes a full valid request', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'bounty-42',
      category: 'code',
      completedAt: 1700000000,
      reward: '500',
      rewardToken: 'USDC',
      taskRef: 'https://example.com/task/42',
    });

    expect(result.subjectAgent).toBe(VALID_ADDRESS);
    expect(result.outcome).toBe('completed');
    expect(result.outcomeCode).toBe(1);
    expect(result.taskId).toBe('bounty-42');
    expect(result.category).toBe('code');
    expect(result.completedAt).toBe(1700000000n);
    expect(result.reward).toBe(500n);
    expect(result.rewardToken).toBe('USDC');
    expect(result.taskRef).toBe('https://example.com/task/42');
  });

  it('applies defaults for optional fields (no reward, no taskRef)', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'failed',
      taskId: 'task-01',
      category: 'review',
      completedAt: 1700000000,
    });

    expect(result.outcome).toBe('failed');
    expect(result.outcomeCode).toBe(0);
    expect(result.reward).toBe(0n);
    expect(result.rewardToken).toBe('');
    expect(result.taskRef).toBe('');
  });

  it('maps disputed outcome to code 2', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'disputed',
      taskId: 'task-disputed',
      category: 'design',
      completedAt: 1700000000,
    });

    expect(result.outcome).toBe('disputed');
    expect(result.outcomeCode).toBe(2);
  });

  it('throws when subjectAgent is missing', () => {
    expect(() =>
      normalizeTaskCompletionRequest({
        subjectAgent: '',
        outcome: 'completed',
        taskId: 'task-1',
        category: 'code',
        completedAt: 1700000000,
      })
    ).toThrow(/subjectAgent is required/i);
  });

  it('throws when subjectAgent is whitespace-only', () => {
    expect(() =>
      normalizeTaskCompletionRequest({
        subjectAgent: '   ',
        outcome: 'completed',
        taskId: 'task-1',
        category: 'code',
        completedAt: 1700000000,
      })
    ).toThrow(/subjectAgent is required/i);
  });

  it('throws when taskId is missing', () => {
    expect(() =>
      normalizeTaskCompletionRequest({
        subjectAgent: VALID_ADDRESS,
        outcome: 'completed',
        taskId: '',
        category: 'code',
        completedAt: 1700000000,
      })
    ).toThrow(/taskId is required/i);
  });

  it('throws when category is missing', () => {
    expect(() =>
      normalizeTaskCompletionRequest({
        subjectAgent: VALID_ADDRESS,
        outcome: 'completed',
        taskId: 'task-1',
        category: '',
        completedAt: 1700000000,
      })
    ).toThrow(/category is required/i);
  });

  it('throws on invalid outcome', () => {
    expect(() =>
      normalizeTaskCompletionRequest({
        subjectAgent: VALID_ADDRESS,
        outcome: 'unknown' as any,
        taskId: 'task-1',
        category: 'code',
        completedAt: 1700000000,
      })
    ).toThrow(/outcome must be one of/i);
  });

  it('normalizes completedAt from ISO string', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'task-iso',
      category: 'writing',
      completedAt: '2023-11-14T22:13:20.000Z',
    });
    expect(result.completedAt).toBe(1700000000n);
  });

  it('normalizes completedAt from milliseconds', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'task-ms',
      category: 'other',
      completedAt: 1700000000000,
    });
    expect(result.completedAt).toBe(1700000000n);
  });

  it('normalizes completedAt from Date object', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'task-date',
      category: 'code',
      completedAt: new Date('2023-11-14T22:13:20.000Z'),
    });
    expect(result.completedAt).toBe(1700000000n);
  });

  it('normalizes reward from string', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'task-r',
      category: 'code',
      completedAt: 1700000000,
      reward: '1000000',
    });
    expect(result.reward).toBe(1000000n);
  });

  it('normalizes reward from number', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'task-r2',
      category: 'code',
      completedAt: 1700000000,
      reward: 250,
    });
    expect(result.reward).toBe(250n);
  });

  it('normalizes reward from bigint', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'task-r3',
      category: 'code',
      completedAt: 1700000000,
      reward: 999n,
    });
    expect(result.reward).toBe(999n);
  });

  it('trims whitespace from string fields', () => {
    const result = normalizeTaskCompletionRequest({
      subjectAgent: `  ${VALID_ADDRESS}  `,
      outcome: 'completed',
      taskId: '  bounty-whitespace  ',
      category: '  code  ',
      completedAt: 1700000000,
      rewardToken: '  GTC  ',
      taskRef: '  https://ref.example.com  ',
    });
    expect(result.subjectAgent).toBe(VALID_ADDRESS);
    expect(result.taskId).toBe('bounty-whitespace');
    expect(result.category).toBe('code');
    expect(result.rewardToken).toBe('GTC');
    expect(result.taskRef).toBe('https://ref.example.com');
  });
});

describe('encodeTaskCompletionAttestation', () => {
  it('returns a valid hex-encoded payload', () => {
    const encoded = encodeTaskCompletionAttestation({
      subjectAgent: VALID_ADDRESS,
      outcome: 'completed',
      taskId: 'bounty-encode-test',
      category: 'code',
      completedAt: 1700000000,
      reward: '500',
      rewardToken: 'USDC',
      taskRef: 'https://gitcoin.co/bounty/encode-test',
    });

    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
    expect(encoded.length).toBeGreaterThan(10);
  });

  it('encodes a minimal request (no reward, no taskRef)', () => {
    const encoded = encodeTaskCompletionAttestation({
      subjectAgent: VALID_ADDRESS,
      outcome: 'failed',
      taskId: 'task-minimal',
      category: 'review',
      completedAt: 1700000000,
    });

    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
    expect(encoded.length).toBeGreaterThan(10);
  });
});

describe('parseTaskOutcome', () => {
  it('maps code 0 to failed', () => {
    expect(parseTaskOutcome(0)).toBe('failed');
  });

  it('maps code 1 to completed', () => {
    expect(parseTaskOutcome(1)).toBe('completed');
  });

  it('maps code 2 to disputed', () => {
    expect(parseTaskOutcome(2)).toBe('disputed');
  });

  it('throws on unknown code', () => {
    expect(() => parseTaskOutcome(99)).toThrow(/unknown task outcome code/i);
  });

  it('throws on negative code', () => {
    expect(() => parseTaskOutcome(-1)).toThrow(/unknown task outcome code/i);
  });
});
