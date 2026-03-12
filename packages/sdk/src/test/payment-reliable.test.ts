import { describe, it, expect, vi } from 'vitest';
import {
  encodePaymentReliableAttestation,
  normalizePaymentAmount,
  normalizePaymentReliableRequest,
  normalizeTimestampToSeconds,
} from '../payment-reliable';
import { AgentTrust } from '../agent-trust';
import { SCHEMAS } from '../constants';

describe('PaymentReliable helpers', () => {
  it('normalizes amount input variants', () => {
    expect(normalizePaymentAmount(42)).toBe(42n);
    expect(normalizePaymentAmount('1_000,000')).toBe(1000000n);
    expect(normalizePaymentAmount(5n)).toBe(5n);
  });

  it('normalizes unix timestamps from ms/seconds/date', () => {
    expect(normalizeTimestampToSeconds(1700000000)).toBe(1700000000n);
    expect(normalizeTimestampToSeconds(1700000000000)).toBe(1700000000n);
    expect(normalizeTimestampToSeconds(new Date('2023-11-14T22:13:20.000Z'))).toBe(1700000000n);
  });

  it('validates required paidAt by outcome', () => {
    expect(() =>
      normalizePaymentReliableRequest({
        subjectAgent: '0x' + 'a'.repeat(40),
        outcome: 'paid_on_time',
        amount: '100',
        currency: 'USDC',
        dueAt: 1700000000,
      })
    ).toThrow(/paidAt is required/i);
  });

  it('encodes attestation payload', () => {
    const encoded = encodePaymentReliableAttestation({
      subjectAgent: '0x' + 'a'.repeat(40),
      outcome: 'paid_late',
      amount: '1000',
      currency: 'USDC',
      dueAt: 1700000000,
      paidAt: 1700000600,
      settlementRef: 'escrow-11',
    });

    expect(encoded).toMatch(/^0x[0-9a-f]+$/i);
    expect(encoded.length).toBeGreaterThan(10);
  });
});

describe('AgentTrust.issuePaymentReliable', () => {
  it('returns validation error for invalid payload', async () => {
    const agentTrust = new AgentTrust({
      network: 'baseSepolia',
      provider: { getNetwork: vi.fn() },
    });

    const result = await agentTrust.issuePaymentReliable({
      subjectAgent: '0x' + 'a'.repeat(40),
      outcome: 'defaulted',
      amount: 100,
      currency: 'USDC',
      dueAt: 1700000000,
      paidAt: 1700000001,
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/paidAt must be omitted/i);
  });

  it('attests when schema UID and payload are valid', async () => {
    const originalUid = SCHEMAS.paymentReliable.uid;
    (SCHEMAS.paymentReliable as any).uid = `0x${'1'.repeat(64)}`;

    try {
      const agentTrust = new AgentTrust({
        network: 'baseSepolia',
        provider: { getNetwork: vi.fn() },
      });

      const attestMock = vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue('0xattuid'),
        tx: { hash: '0xtxhash' },
      });

      (agentTrust as any).eas = { attest: attestMock };

      const result = await agentTrust.issuePaymentReliable({
        subjectAgent: '0x' + 'a'.repeat(40),
        outcome: 'paid_on_time',
        amount: '100',
        currency: 'USDC',
        dueAt: 1700000000,
        paidAt: 1699999999,
      });

      expect(attestMock).toHaveBeenCalledOnce();
      expect(result.success).toBe(true);
      expect(result.attestationUid).toBe('0xattuid');
      expect(result.txHash).toBe('0xtxhash');
    } finally {
      (SCHEMAS.paymentReliable as any).uid = originalUid;
    }
  });
});
