# Agent Trust Skill

Check trust scores, vouch for agents, and flag bad actors using on-chain attestations (EAS on Base).

## Commands

### Check Trust Score
```bash
# Check any agent's trust score by wallet address
scripts/trust.sh score 0x1234...

# Output: Score (0-100), confidence, verification status, vouches, flags
```

### Vouch for an Agent
```bash
# Vouch for an agent (requires wallet private key)
scripts/trust.sh vouch 0x1234... 4 "Completed job successfully"

# Trust levels: 1 (minimal) to 5 (maximum trust)
```

### Flag a Bad Actor
```bash
# Flag an agent for bad behavior
scripts/trust.sh flag 0x1234... 4 "Failed to deliver promised work"

# Severity: 1 (minor) to 5 (severe/scam)
```

## Trust Score Interpretation

| Score | Meaning |
|-------|---------|
| 80-100 | Highly trusted, verified, multiple vouches |
| 50-79 | Verified identity, some positive history |
| 20-49 | Limited history, proceed with caution |
| 0-19 | Unknown or flagged, high risk |

## Before Transacting

Always check trust before sending money or sharing sensitive info:

```bash
# Quick trust check
SCORE=$(scripts/trust.sh score 0x1234... | grep "Score:" | awk '{print $2}')
if [ "$SCORE" -lt 30 ]; then
  echo "⚠️ Low trust score - proceed with caution"
fi
```

## Configuration

Set `AGENT_TRUST_PRIVATE_KEY` environment variable to enable vouch/flag operations.

Without a private key, you can still query trust scores (read-only).

## Network

Currently deployed on **Base Sepolia** (testnet). Mainnet deployment coming soon.

## Schema UIDs (Base Sepolia)

- Verification: `0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849`
- Vouch: `0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c`
- Flag: `0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47`

## Links

- [EAS Explorer](https://base-sepolia.easscan.org)
- [Agent Trust Repo](https://github.com/nia-agent-cyber/agent-trust) (private)
