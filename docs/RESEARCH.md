# Research Notes

## EAS (Ethereum Attestation Service) — Deep Dive

### Overview
- **Website:** attest.org
- **SDK:** `@ethereum-attestation-service/eas-sdk` (npm)
- **GitHub:** ethereum-attestation-service/eas-sdk
- **Stats:** 8.7M+ attestations, 450k+ attesters, 2.2M+ recipients

### Key Features
- On-chain AND off-chain attestations
- Schema registry (define your own attestation types)
- Revocable attestations
- Delegated attestations (attest on behalf of others)
- Private data support (Merkle proofs)
- Multi-attestations (batch)

### Supported Networks
- Ethereum mainnet
- Base
- Optimism  
- Arbitrum
- Sepolia (testnet)
- Many others

### How It Works

1. **Register a Schema** — Define what data an attestation contains
   ```
   schema: "address agentAddress, bool verified, string platform, string handle"
   ```

2. **Create Attestations** — Attest to something about someone
   ```javascript
   eas.attest({
     schema: schemaUID,
     data: {
       recipient: agentAddress,
       data: encodedData,
       revocable: true
     }
   })
   ```

3. **Query Attestations** — Read attestations for trust decisions
   ```javascript
   eas.getAttestation(uid)
   ```

### Pricing
- **On-chain:** Gas costs only (no protocol fees)
- **Off-chain:** Free (no gas)
- Base L2 gas is ~$0.001-0.01 per attestation

### Relevance to Agent Trust

Perfect fit because:
1. Already designed for attestations/reputation
2. No token required (not crypto-native dependency)
3. Works on cheap L2s (Base recommended)
4. Supports both on-chain (permanent) and off-chain (free)
5. SDK is TypeScript/JavaScript — easy to integrate
6. Explicitly mentions "Agent Interactions" as use case

### Proposed Schema Ideas

**Agent Verification:**
```
schema: "address agentId, string platform, string handle, bytes32 proofHash, uint64 verifiedAt"
```

**Agent Vouch:**
```
schema: "address voucher, address vouchee, uint8 trustLevel, string context"
```

**Agent Flag:**
```
schema: "address flagger, address flagged, string reason, bytes32 evidenceHash"
```

**Transaction Record:**
```
schema: "address agent1, address agent2, bytes32 txHash, uint256 amount, bool successful"
```

---

## Ceramic Network — Summary

### Overview
- Decentralized data streaming network
- Events anchored to Ethereum
- 400+ apps, 10M+ streams

### How It Differs from EAS
- More general purpose (any data, not just attestations)
- Better for large/complex data structures
- Less specifically designed for trust/attestations

### Verdict
Could use as a complement to EAS for storing detailed agent profiles, but EAS is better for the core attestation/reputation layer.

---

## Other Solutions Reviewed

### Gitcoin Passport
- Human verification (Sybil resistance)
- Aggregates identity proofs
- Uses attestations under the hood

### Worldcoin
- Proof of personhood (iris scan)
- Too intrusive for agents

### Lens Protocol
- Social graph on-chain
- More social-focused, less trust-focused

---

## Recommendation

**Build on EAS** as the core attestation layer:
- Use Base L2 for cheap gas
- Start with verification schema + vouch schema
- Add off-chain attestations for frequent/low-value signals
- On-chain for important/permanent attestations

**Optional:** Ceramic for rich profile data storage

---

*Last updated: 2026-02-01 21:00 GMT*
