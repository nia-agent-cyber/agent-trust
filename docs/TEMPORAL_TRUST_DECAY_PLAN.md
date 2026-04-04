# Temporal Trust Decay Plan (Issue #23)

## Goal
Add longitudinal trust scoring so older attestations contribute less over time, while preserving explainability and deterministic outputs.

## Scope (v1)
Implement read-time trust decay in the SDK (no schema changes required):
- Decay model applied to attestation-derived trust signals
- Configurable half-life per attestation class
- Deterministic score output + score breakdown for debugging
- Backward-compatible defaults (decay off unless explicitly enabled)

## Design

### 1) New Types
Add in `packages/sdk/src/types.ts`:
- `TrustDecayConfig`
  - `enabled: boolean`
  - `defaultHalfLifeDays: number`
  - `halfLifeBySchema?: Record<string, number>`
  - `minWeight?: number` (default 0.05)
- `DecayedSignal`
  - `schemaUid: string`
  - `issuedAt: bigint`
  - `ageDays: number`
  - `baseWeight: number`
  - `decayedWeight: number`

### 2) New Module
Create `packages/sdk/src/temporal-trust.ts` with:
- `computeDecayWeight(ageDays, halfLifeDays, minWeight?)`
- `applyTemporalDecay(signals, config, now?)`
- `calculateDecayedTrustScore(signals, config, now?)`

Reference formula (simple exponential):
`weight = max(minWeight, 0.5 ^ (ageDays / halfLifeDays))`

### 3) AgentTrust Integration
In `packages/sdk/src/agent-trust.ts`:
- Add optional decay config to relevant trust-evaluation paths
- Add method `evaluateTemporalTrust(...)` that returns:
  - aggregate score
  - per-signal breakdown
  - config used

### 4) Docs + Example
- Add `examples/temporal-trust-flow.ts`
- Update SDK README + `docs/api-reference.md` with a small usage section

### 5) Tests
Add `packages/sdk/src/test/temporal-trust.test.ts`:
- Weight curve sanity checks
- Half-life behavior checks
- `minWeight` floor behavior
- Config override by schema
- Deterministic output for fixed `now`
- Backward-compatibility: default behavior unchanged when disabled

## Acceptance Criteria
- Build passes: `npm run build`
- Tests pass: `npm test -- --run`
- New temporal trust tests included and green
- No breaking changes to existing API usage
- PR opened with `Closes #23`

## Implementation Order
1. Types + temporal module
2. AgentTrust integration
3. Tests
4. Example + docs
5. PR + mergeability check

## Notes
- Start with read-time decay only; no on-chain state mutation.
- Keep strategy transparent: surface score breakdown for PM/QA/compliance visibility.
