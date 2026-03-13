"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const payment_reliable_1 = require("../payment-reliable");
const agent_trust_1 = require("../agent-trust");
const constants_1 = require("../constants");
(0, vitest_1.describe)('PaymentReliable helpers', () => {
    (0, vitest_1.it)('normalizes amount input variants', () => {
        (0, vitest_1.expect)((0, payment_reliable_1.normalizePaymentAmount)(42)).toBe(42n);
        (0, vitest_1.expect)((0, payment_reliable_1.normalizePaymentAmount)('1_000,000')).toBe(1000000n);
        (0, vitest_1.expect)((0, payment_reliable_1.normalizePaymentAmount)(5n)).toBe(5n);
    });
    (0, vitest_1.it)('normalizes unix timestamps from ms/seconds/date', () => {
        (0, vitest_1.expect)((0, payment_reliable_1.normalizeTimestampToSeconds)(1700000000)).toBe(1700000000n);
        (0, vitest_1.expect)((0, payment_reliable_1.normalizeTimestampToSeconds)(1700000000000)).toBe(1700000000n);
        (0, vitest_1.expect)((0, payment_reliable_1.normalizeTimestampToSeconds)(new Date('2023-11-14T22:13:20.000Z'))).toBe(1700000000n);
    });
    (0, vitest_1.it)('validates required paidAt by outcome', () => {
        (0, vitest_1.expect)(() => (0, payment_reliable_1.normalizePaymentReliableRequest)({
            subjectAgent: '0x' + 'a'.repeat(40),
            outcome: 'paid_on_time',
            amount: '100',
            currency: 'USDC',
            dueAt: 1700000000,
        })).toThrow(/paidAt is required/i);
    });
    (0, vitest_1.it)('encodes attestation payload', () => {
        const encoded = (0, payment_reliable_1.encodePaymentReliableAttestation)({
            subjectAgent: '0x' + 'a'.repeat(40),
            outcome: 'paid_late',
            amount: '1000',
            currency: 'USDC',
            dueAt: 1700000000,
            paidAt: 1700000600,
            settlementRef: 'escrow-11',
        });
        (0, vitest_1.expect)(encoded).toMatch(/^0x[0-9a-f]+$/i);
        (0, vitest_1.expect)(encoded.length).toBeGreaterThan(10);
    });
});
(0, vitest_1.describe)('AgentTrust.issuePaymentReliable', () => {
    (0, vitest_1.it)('returns validation error for invalid payload', async () => {
        const agentTrust = new agent_trust_1.AgentTrust({
            network: 'baseSepolia',
            provider: { getNetwork: vitest_1.vi.fn() },
        });
        const result = await agentTrust.issuePaymentReliable({
            subjectAgent: '0x' + 'a'.repeat(40),
            outcome: 'defaulted',
            amount: 100,
            currency: 'USDC',
            dueAt: 1700000000,
            paidAt: 1700000001,
        });
        (0, vitest_1.expect)(result.success).toBe(false);
        (0, vitest_1.expect)(result.error).toMatch(/paidAt must be omitted/i);
    });
    (0, vitest_1.it)('attests when schema UID and payload are valid', async () => {
        const originalUid = constants_1.SCHEMAS.paymentReliable.uid;
        constants_1.SCHEMAS.paymentReliable.uid = `0x${'1'.repeat(64)}`;
        try {
            const agentTrust = new agent_trust_1.AgentTrust({
                network: 'baseSepolia',
                provider: { getNetwork: vitest_1.vi.fn() },
            });
            const attestMock = vitest_1.vi.fn().mockResolvedValue({
                wait: vitest_1.vi.fn().mockResolvedValue('0xattuid'),
                tx: { hash: '0xtxhash' },
            });
            agentTrust.eas = { attest: attestMock };
            const result = await agentTrust.issuePaymentReliable({
                subjectAgent: '0x' + 'a'.repeat(40),
                outcome: 'paid_on_time',
                amount: '100',
                currency: 'USDC',
                dueAt: 1700000000,
                paidAt: 1699999999,
            });
            (0, vitest_1.expect)(attestMock).toHaveBeenCalledOnce();
            (0, vitest_1.expect)(result.success).toBe(true);
            (0, vitest_1.expect)(result.attestationUid).toBe('0xattuid');
            (0, vitest_1.expect)(result.txHash).toBe('0xtxhash');
        }
        finally {
            constants_1.SCHEMAS.paymentReliable.uid = originalUid;
        }
    });
});
