import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { SCHEMAS } from './constants';
import {
  NormalizedPaymentReliable,
  PaymentOutcome,
  PaymentReliableRequest,
} from './types';

const ZERO_BYTES32 = `0x${'0'.repeat(64)}`;

const PAYMENT_OUTCOME_TO_CODE: Record<PaymentOutcome, 0 | 1 | 2> = {
  defaulted: 0,
  paid_late: 1,
  paid_on_time: 2,
};

const PAYMENT_CODE_TO_OUTCOME: Record<number, PaymentOutcome> = {
  0: 'defaulted',
  1: 'paid_late',
  2: 'paid_on_time',
};

export function normalizePaymentAmount(amount: string | number | bigint): bigint {
  if (typeof amount === 'bigint') {
    if (amount < 0n) throw new Error('amount must be >= 0');
    return amount;
  }

  if (typeof amount === 'number') {
    if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
      throw new Error('amount number must be a non-negative integer');
    }
    return BigInt(amount);
  }

  const normalized = amount.trim().replaceAll(',', '').replaceAll('_', '');
  if (!/^\d+$/.test(normalized)) {
    throw new Error('amount string must be a non-negative integer string');
  }
  return BigInt(normalized);
}

export function normalizeTimestampToSeconds(value: string | number | Date): bigint {
  if (value instanceof Date) {
    const ms = value.getTime();
    if (!Number.isFinite(ms)) throw new Error('invalid date timestamp');
    return BigInt(Math.floor(ms / 1000));
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error('timestamp must be a non-negative number');
    }

    // Heuristic: treat numbers >= 1e12 as milliseconds.
    return BigInt(Math.floor(value >= 1e12 ? value / 1000 : value));
  }

  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new Error('timestamp string must be a non-negative integer');
    }
    return BigInt(Math.floor(parsed >= 1e12 ? parsed / 1000 : parsed));
  }

  const parsedDate = Date.parse(trimmed);
  if (Number.isNaN(parsedDate)) {
    throw new Error('timestamp string must be unix seconds/ms or an ISO date');
  }
  return BigInt(Math.floor(parsedDate / 1000));
}

export function normalizePaymentReliableRequest(request: PaymentReliableRequest): NormalizedPaymentReliable {
  if (!request.subjectAgent) {
    throw new Error('subjectAgent is required');
  }

  if (!request.currency || !request.currency.trim()) {
    throw new Error('currency is required');
  }

  const amount = normalizePaymentAmount(request.amount);
  const dueAt = normalizeTimestampToSeconds(request.dueAt);
  const outcomeCode = PAYMENT_OUTCOME_TO_CODE[request.outcome];

  if (outcomeCode === undefined) {
    throw new Error('outcome must be one of: paid_on_time, paid_late, defaulted');
  }

  let paidAt = 0n;
  if (request.outcome !== 'defaulted') {
    if (request.paidAt === undefined || request.paidAt === null) {
      throw new Error('paidAt is required when outcome is paid_on_time or paid_late');
    }
    paidAt = normalizeTimestampToSeconds(request.paidAt);

    if (request.outcome === 'paid_on_time' && paidAt > dueAt) {
      throw new Error('paid_on_time requires paidAt <= dueAt');
    }

    if (request.outcome === 'paid_late' && paidAt <= dueAt) {
      throw new Error('paid_late requires paidAt > dueAt');
    }
  } else if (request.paidAt !== undefined && request.paidAt !== null) {
    throw new Error('paidAt must be omitted when outcome is defaulted');
  }

  return {
    subjectAgent: request.subjectAgent,
    outcome: request.outcome,
    outcomeCode,
    amount,
    currency: request.currency.trim(),
    dueAt,
    paidAt,
    settlementRef: request.settlementRef?.trim() || '',
  };
}

export function encodePaymentReliableAttestation(request: PaymentReliableRequest): string {
  const normalized = normalizePaymentReliableRequest(request);
  const schemaEncoder = new SchemaEncoder(SCHEMAS.paymentReliable.schema);

  return schemaEncoder.encodeData([
    { name: 'subjectAgent', value: normalized.subjectAgent, type: 'address' },
    { name: 'outcome', value: normalized.outcomeCode, type: 'uint8' },
    { name: 'amount', value: normalized.amount, type: 'uint256' },
    { name: 'currency', value: normalized.currency, type: 'string' },
    { name: 'dueAt', value: normalized.dueAt, type: 'uint64' },
    { name: 'paidAt', value: normalized.paidAt, type: 'uint64' },
    { name: 'settlementRef', value: normalized.settlementRef, type: 'string' },
  ]);
}

export function parsePaymentOutcome(code: number): PaymentOutcome {
  const parsed = PAYMENT_CODE_TO_OUTCOME[code];
  if (!parsed) {
    throw new Error(`Unknown payment outcome code: ${code}`);
  }
  return parsed;
}

export function emptyEvidenceHash(): string {
  return ZERO_BYTES32;
}
