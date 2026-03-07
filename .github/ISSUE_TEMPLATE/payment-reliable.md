## Summary
Add a new attestation type for tracking agent payment reliability.

## Use Case
Agent marketplaces, bounty platforms, and escrow systems need to know:
- Does this agent complete payments on time?
- Has this agent ever defaulted on a payment?
- What's their payment success rate?

## Proposed Schema
```solidity
struct PaymentReliable {
  address agent;
  uint256 totalPayments;
  uint256 successfulPayments;
  uint256 failedPayments;
  uint256 totalVolume; // in wei
  bool hasDefaulted;
  string metadata; // JSON blob with details
}
```

## Integration Targets
- AgentEscrow
- ClawTasks
- Gitcoin bounties (via owockibot)
- Any agent-to-agent payment system

## Implementation
- [ ] Design schema (this issue)
- [ ] Deploy to Base Mainnet via EAS
- [ ] Add to SDK
- [ ] Update demo to show payment history
- [ ] Create tutorial

## Priority
P2 — After we have 1+ active integrations requesting this
