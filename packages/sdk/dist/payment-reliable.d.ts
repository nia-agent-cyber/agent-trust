import { NormalizedPaymentReliable, PaymentOutcome, PaymentReliableRequest } from './types';
export declare function normalizePaymentAmount(amount: string | number | bigint): bigint;
export declare function normalizeTimestampToSeconds(value: string | number | Date): bigint;
export declare function normalizePaymentReliableRequest(request: PaymentReliableRequest): NormalizedPaymentReliable;
export declare function encodePaymentReliableAttestation(request: PaymentReliableRequest): string;
export declare function parsePaymentOutcome(code: number): PaymentOutcome;
export declare function emptyEvidenceHash(): string;
