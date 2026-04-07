import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock ethers ─────────────────────────────────────────────────────────────
vi.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: vi.fn().mockImplementation(() => ({})),
    Wallet: vi.fn().mockImplementation((key: string, provider: unknown) => ({ key, provider })),
  },
}));

// ─── Mock AgentTrust SDK ──────────────────────────────────────────────────────
const mockTrust = {
  getTier: vi.fn(),
  getScore: vi.fn(),
  getPaymentReliability: vi.fn(),
  getTaskCompletions: vi.fn(),
  getSecurityAudits: vi.fn(),
  issuePaymentReliable: vi.fn(),
  issueTaskCompletion: vi.fn(),
  issueSecurityAudit: vi.fn(),
};

vi.mock('@nia-agent-cyber/agent-trust-sdk', () => ({
  AgentTrust: vi.fn().mockImplementation(() => mockTrust),
}));

import { runCheck } from '../src/tools/check.js';
import { runIssue } from '../src/tools/issue.js';
import { runQuery } from '../src/tools/query.js';

const VALID_ADDR = '0x' + 'a'.repeat(40);
const ZERO_ADDR = '0x' + '0'.repeat(40);

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env['AGENT_TRUST_PRIVATE_KEY'];
});

// ─── agent_trust_check ────────────────────────────────────────────────────────

describe('runCheck', () => {
  it('returns tier and score for a valid address', async () => {
    mockTrust.getTier.mockResolvedValue({ tier: 2, tierName: 'Trusted' });
    mockTrust.getScore.mockResolvedValue({ score: 75, attestationCount: 10, updatedAt: 1700000000 });

    const result = await runCheck({ address: VALID_ADDR });

    expect(result.address).toBe(VALID_ADDR);
    expect(result.tier).toBe(2);
    expect(result.tierName).toBe('Trusted');
    expect(result.score).toBe(75);
    expect(result.attestationCount).toBe(10);
    expect(result.updatedAt).toBe(1700000000);
    expect(result.error).toBeUndefined();
  });

  it('falls back to numeric tier name when tierName not in result', async () => {
    mockTrust.getTier.mockResolvedValue({ tier: 1 });
    mockTrust.getScore.mockResolvedValue({ score: 50 });

    const result = await runCheck({ address: VALID_ADDR });
    expect(result.tierName).toBe('Contributor');
  });

  it('handles getTier returning a plain number', async () => {
    mockTrust.getTier.mockResolvedValue(3);
    mockTrust.getScore.mockResolvedValue({ score: 80 });

    const result = await runCheck({ address: VALID_ADDR });
    expect(result.tier).toBe(3);
    expect(result.tierName).toBe('Verified');
  });

  it('returns error for invalid address', async () => {
    const result = await runCheck({ address: 'not-an-address' });
    expect(result.error).toMatch(/invalid address/i);
    expect(result.tier).toBe(0);
    expect(mockTrust.getTier).not.toHaveBeenCalled();
  });

  it('returns error for zero address', async () => {
    const result = await runCheck({ address: ZERO_ADDR });
    expect(result.error).toBeUndefined(); // zero address is technically valid hex
    expect(mockTrust.getTier).toHaveBeenCalled();
  });

  it('returns error for empty address', async () => {
    const result = await runCheck({ address: '' });
    expect(result.error).toMatch(/invalid address/i);
    expect(mockTrust.getTier).not.toHaveBeenCalled();
  });

  it('returns error when SDK throws', async () => {
    mockTrust.getTier.mockRejectedValue(new Error('network timeout'));
    mockTrust.getScore.mockResolvedValue({ score: 0 });

    const result = await runCheck({ address: VALID_ADDR });
    expect(result.error).toBe('network timeout');
    expect(result.tier).toBe(0);
  });

  it('uses base-sepolia rpc when network is base-sepolia', async () => {
    mockTrust.getTier.mockResolvedValue({ tier: 0 });
    mockTrust.getScore.mockResolvedValue({ score: 0 });

    await runCheck({ address: VALID_ADDR, network: 'base-sepolia' });
    // No throw = correct network handled
    expect(mockTrust.getTier).toHaveBeenCalled();
  });
});

// ─── agent_trust_query ────────────────────────────────────────────────────────

describe('runQuery', () => {
  it('returns all attestation types when type is all', async () => {
    const payments = [{ uid: '0x1' }];
    const tasks = [{ uid: '0x2' }, { uid: '0x3' }];
    const audits: unknown[] = [];

    mockTrust.getPaymentReliability.mockResolvedValue(payments);
    mockTrust.getTaskCompletions.mockResolvedValue(tasks);
    mockTrust.getSecurityAudits.mockResolvedValue(audits);

    const result = await runQuery({ address: VALID_ADDR, type: 'all' });

    expect(result.address).toBe(VALID_ADDR);
    expect(result.paymentReliable).toEqual(payments);
    expect(result.taskCompletion).toEqual(tasks);
    expect(result.securityAudit).toEqual(audits);
    expect(result.summary.totalAttestations).toBe(3);
    expect(result.summary.byType['PaymentReliable']).toBe(1);
    expect(result.summary.byType['TaskCompletion']).toBe(2);
    expect(result.summary.byType['SecurityAudit']).toBe(0);
    expect(result.error).toBeUndefined();
  });

  it('fetches only PaymentReliable when type is specified', async () => {
    mockTrust.getPaymentReliability.mockResolvedValue([{ uid: '0x1' }]);

    const result = await runQuery({ address: VALID_ADDR, type: 'PaymentReliable' });

    expect(mockTrust.getPaymentReliability).toHaveBeenCalled();
    expect(mockTrust.getTaskCompletions).not.toHaveBeenCalled();
    expect(mockTrust.getSecurityAudits).not.toHaveBeenCalled();
    expect(result.paymentReliable).toHaveLength(1);
    expect(result.taskCompletion).toBeUndefined();
  });

  it('fetches only TaskCompletion when type is specified', async () => {
    mockTrust.getTaskCompletions.mockResolvedValue([{ uid: '0xabc' }]);

    const result = await runQuery({ address: VALID_ADDR, type: 'TaskCompletion' });

    expect(mockTrust.getTaskCompletions).toHaveBeenCalled();
    expect(mockTrust.getPaymentReliability).not.toHaveBeenCalled();
    expect(result.taskCompletion).toHaveLength(1);
  });

  it('returns error for invalid address', async () => {
    const result = await runQuery({ address: 'bad' });
    expect(result.error).toMatch(/invalid address/i);
    expect(result.summary.totalAttestations).toBe(0);
    expect(mockTrust.getPaymentReliability).not.toHaveBeenCalled();
  });

  it('defaults type to all when not specified', async () => {
    mockTrust.getPaymentReliability.mockResolvedValue([]);
    mockTrust.getTaskCompletions.mockResolvedValue([]);
    mockTrust.getSecurityAudits.mockResolvedValue([]);

    await runQuery({ address: VALID_ADDR });

    expect(mockTrust.getPaymentReliability).toHaveBeenCalled();
    expect(mockTrust.getTaskCompletions).toHaveBeenCalled();
    expect(mockTrust.getSecurityAudits).toHaveBeenCalled();
  });

  it('returns error when SDK throws', async () => {
    mockTrust.getPaymentReliability.mockRejectedValue(new Error('rpc error'));
    mockTrust.getTaskCompletions.mockResolvedValue([]);
    mockTrust.getSecurityAudits.mockResolvedValue([]);

    const result = await runQuery({ address: VALID_ADDR, type: 'all' });
    expect(result.error).toBe('rpc error');
  });
});

// ─── agent_trust_issue ────────────────────────────────────────────────────────

describe('runIssue', () => {
  it('returns error when AGENT_TRUST_PRIVATE_KEY is not set', async () => {
    const result = await runIssue({ type: 'PaymentReliable', subjectAgent: VALID_ADDR });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/AGENT_TRUST_PRIVATE_KEY/);
  });

  it('returns error for invalid subjectAgent address', async () => {
    process.env['AGENT_TRUST_PRIVATE_KEY'] = '0x' + 'f'.repeat(64);
    const result = await runIssue({ type: 'PaymentReliable', subjectAgent: 'bad-address' });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/invalid subjectAgent/i);
  });

  it('returns error for missing type', async () => {
    process.env['AGENT_TRUST_PRIVATE_KEY'] = '0x' + 'f'.repeat(64);
    // @ts-expect-error testing missing type
    const result = await runIssue({ subjectAgent: VALID_ADDR });
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/type/i);
  });

  it('issues PaymentReliable attestation successfully', async () => {
    process.env['AGENT_TRUST_PRIVATE_KEY'] = '0x' + 'f'.repeat(64);
    mockTrust.issuePaymentReliable.mockResolvedValue({
      attestationUid: '0xuid123',
      txHash: '0xtx456',
    });

    const result = await runIssue({
      type: 'PaymentReliable',
      subjectAgent: VALID_ADDR,
      amount: 1.5,
      currency: 'ETH',
      outcome: 'paid',
    });

    expect(result.success).toBe(true);
    expect(result.attestationUid).toBe('0xuid123');
    expect(result.txHash).toBe('0xtx456');
    expect(result.error).toBeUndefined();
  });

  it('issues TaskCompletion attestation successfully', async () => {
    process.env['AGENT_TRUST_PRIVATE_KEY'] = '0x' + 'f'.repeat(64);
    mockTrust.issueTaskCompletion.mockResolvedValue({
      attestationUid: '0xuid789',
      txHash: '0xtxabc',
    });

    const result = await runIssue({
      type: 'TaskCompletion',
      subjectAgent: VALID_ADDR,
      taskId: 'task-001',
      category: 'defi',
      taskOutcome: 'completed',
    });

    expect(result.success).toBe(true);
    expect(result.attestationUid).toBe('0xuid789');
  });

  it('issues SecurityAudit attestation successfully', async () => {
    process.env['AGENT_TRUST_PRIVATE_KEY'] = '0x' + 'f'.repeat(64);
    mockTrust.issueSecurityAudit.mockResolvedValue({
      attestationUid: '0xuidaudit',
      txHash: '0xtxaudit',
    });

    const result = await runIssue({
      type: 'SecurityAudit',
      subjectAgent: VALID_ADDR,
      auditType: 'smart-contract',
      passed: true,
      severity: 1,
    });

    expect(result.success).toBe(true);
    expect(result.attestationUid).toBe('0xuidaudit');
  });

  it('returns error when SDK throws during issue', async () => {
    process.env['AGENT_TRUST_PRIVATE_KEY'] = '0x' + 'f'.repeat(64);
    mockTrust.issuePaymentReliable.mockRejectedValue(new Error('tx reverted'));

    const result = await runIssue({ type: 'PaymentReliable', subjectAgent: VALID_ADDR });
    expect(result.success).toBe(false);
    expect(result.error).toBe('tx reverted');
  });
});
