# TaskCompletion Attestation — Implementation Plan

**Issue:** #18  
**Priority:** P0 (parallel to schema registration)  
**Owner:** Trust Coder  
**Status:** Ready for implementation  
**Created:** 2026-03-16 by Trust PM

---

## Summary

Implement the `TaskCompletion` attestation type in the Agent Trust SDK. This enables bounty platforms (Gitcoin, ClawTasks, OpenWork) to issue verifiable on-chain proof that an agent completed a task.

Follow the same pattern as `PaymentReliable` (Issue #17 / PR #22).

---

## Schema Definition

**Schema string:**
```
address subjectAgent, uint8 outcome, string taskId, string category, uint64 completedAt, uint256 reward, string rewardToken, string taskRef
```

**Field semantics:**

| Field | Type | Description |
|-------|------|-------------|
| `subjectAgent` | `address` | The agent that completed the task |
| `outcome` | `uint8` | Task outcome code (see below) |
| `taskId` | `string` | Unique task/bounty identifier from the issuing platform |
| `category` | `string` | Task category (e.g. `code`, `design`, `writing`, `review`, `other`) |
| `completedAt` | `uint64` | Unix timestamp of task completion |
| `reward` | `uint256` | Reward amount in base units (0 if no reward) |
| `rewardToken` | `string` | Token/currency symbol (e.g. `USDC`, `ETH`, `GTC`) — empty string if no reward |
| `taskRef` | `string` | Optional external reference (bounty URL, PR link, IPFS CID) |

**Outcome codes:**
| Code | Value | Meaning |
|------|-------|---------|
| 0 | `failed` | Task was not completed or rejected |
| 1 | `completed` | Task successfully completed |
| 2 | `disputed` | Task completion is contested |

**Schema config:**
- `revocable: true` (allows issuers to revoke if outcome is disputed/reversed)

---

## Acceptance Criteria

### 1. Schema + Constants
- [ ] Add `SCHEMAS.taskCompletion` to `packages/sdk/src/constants.ts`:
  ```ts
  taskCompletion: {
    uid: '0x0000000000000000000000000000000000000000000000000000000000000000', // TODO: register
    schema: 'address subjectAgent, uint8 outcome, string taskId, string category, uint64 completedAt, uint256 reward, string rewardToken, string taskRef',
    revocable: true,
  }
  ```
- [ ] Use placeholder UID (same pattern as `paymentReliable` — will be registered separately)

### 2. Types (`packages/sdk/src/types.ts`)
Add:
```ts
export type TaskOutcome = 'completed' | 'failed' | 'disputed';

export interface TaskCompletionRequest {
  subjectAgent: string;
  outcome: TaskOutcome;
  taskId: string;
  category: string;
  completedAt: string | number | Date;
  reward?: string | number | bigint;      // defaults to 0
  rewardToken?: string;                    // defaults to ''
  taskRef?: string;                        // optional
}

export interface NormalizedTaskCompletion {
  subjectAgent: string;
  outcome: TaskOutcome;
  outcomeCode: 0 | 1 | 2;
  taskId: string;
  category: string;
  completedAt: bigint;
  reward: bigint;
  rewardToken: string;
  taskRef: string;
}

export interface TaskCompletionResult {
  success: boolean;
  attestationUid?: string;
  txHash?: string;
  error?: string;
}

export interface TaskCompletionAttestation {
  uid: string;
  attester: string;
  recipient: string;
  subjectAgent: string;
  outcome: TaskOutcome;
  taskId: string;
  category: string;
  completedAt: number;
  reward: string;
  rewardToken: string;
  taskRef: string;
  time: number;
  revoked: boolean;
}
```

### 3. SDK Helpers (`packages/sdk/src/task-completion.ts`)
New file. Implement:

- `normalizeTaskCompletionRequest(request: TaskCompletionRequest): NormalizedTaskCompletion`
  - Validate `subjectAgent` required
  - Validate `taskId` non-empty
  - Validate `category` non-empty
  - Normalize `completedAt` via existing `normalizeTimestampToSeconds()`
  - Normalize `reward` via existing `normalizePaymentAmount()` (or inline equivalent), defaulting to `0n`
  - Validate `outcome` is one of the valid values
  - Map outcome to code: `failed=0`, `completed=1`, `disputed=2`
  - Strip/trim string fields
  
- `encodeTaskCompletionAttestation(request: TaskCompletionRequest): string`
  - Use `SchemaEncoder` with `SCHEMAS.taskCompletion.schema`
  - Encode all fields from normalized request

- `parseTaskOutcome(code: number): TaskOutcome`
  - Map code → string; throw on unknown

### 4. AgentTrust Class (`packages/sdk/src/agent-trust.ts`)
Add methods:
```ts
async issueTaskCompletion(request: TaskCompletionRequest): Promise<TaskCompletionResult>
async getTaskCompletions(subjectAgent: string): Promise<TaskCompletionAttestation[]>
```
Follow the same pattern as `issuePaymentReliable()` / `getPaymentReliability()`.

### 5. Query Support (`packages/sdk/src/query.ts`)
Add:
- `parseTaskCompletionAttestation(att: GraphQLAttestation): TaskCompletionAttestation`
- `fetchTaskCompletionAttestationsForSubject(subjectAgent: string, network: NetworkName): Promise<TaskCompletionAttestation[]>`

Query by `schemaId: SCHEMAS.taskCompletion.uid` and `where.decodedDataJson contains subjectAgent`.

### 6. Tests (`packages/sdk/src/test/task-completion.test.ts`)
Cover:
- `normalizeTaskCompletionRequest`:
  - Valid request with all fields
  - Valid request with defaults (no reward, no taskRef)
  - Missing `subjectAgent` → throws
  - Missing `taskId` → throws
  - Missing `category` → throws
  - Invalid outcome → throws
  - `completed` with various timestamp formats
  - `reward` normalization (string, number, bigint)
- `encodeTaskCompletionAttestation`: round-trip encoding
- `parseTaskOutcome`: valid codes + unknown code throws

Extend `query.test.ts` with:
- `parseTaskCompletionAttestation` unit test with fixture data

### 7. Exports (`packages/sdk/src/index.ts`)
Export all new types, helpers, and query functions.

### 8. Example (`examples/task-completion-flow.ts`)
Runnable example demonstrating:
- Issuing a `TaskCompletion` attestation (completed bounty)
- Querying completions for a subject agent
- A failed-task example
Add script to `examples/package.json`: `"task-completion": "ts-node task-completion-flow.ts"`
Update `examples/README.md`.

### 9. Docs
- Add `taskCompletion` to schema table in `README.md`
- Add `TaskCompletion` to attestation type list in `README.md`
- Add API docs in `docs/api-reference.md`

---

## PR Requirements

- Branch: `feat/task-completion`
- Link: closes #18
- Rebase on `origin/main` before marking ready
- All tests pass: `npm test` at repo root
- `gh pr view <n> --json mergeable` must show `MERGEABLE` before tagging for QA

---

## Schema Registration

After implementation, Remi registers the schema on Base Sepolia:
```bash
cd /Users/nia/repos/agent-trust/packages/sdk
PRIVATE_KEY=<key> npx ts-node scripts/register-task-completion.ts
```
(Script to be added as part of this PR, following `register-payment-reliable.ts` pattern.)

---

## Notes

- **Reuse existing utilities** — `normalizeTimestampToSeconds()` and `normalizePaymentAmount()` from `payment-reliable.ts` should be imported, not duplicated. Consider extracting to `utils.ts` if not already done.
- **Category is open-ended** — don't enforce a fixed enum; let issuers provide any string. This avoids schema churn as new task types emerge.
- **`disputed` outcome** — attestation is revocable, so issuers can update via revoke + re-issue if dispute resolves.
