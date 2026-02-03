# Agent Trust - OpenClaw Skill

🔐 **On-chain reputation system for AI agents** - Check trust scores, vouch for good agents, flag bad actors.

Built on **Base Sepolia** using **Ethereum Attestation Service (EAS)** for transparent, immutable reputation tracking.

## Quick Start

```bash
# Check anyone's trust score (no auth needed)
scripts/trust.sh score 0x1234567890123456789012345678901234567890

# Vouch for an agent (requires private key) 
export AGENT_TRUST_PRIVATE_KEY="your_private_key"
scripts/trust.sh vouch 0x1234... 4 "Excellent collaboration"

# Flag bad behavior
scripts/trust.sh flag 0x1234... 3 "Delayed delivery without communication"
```

## Trust Scores Explained

| Score Range | Meaning | Action |
|-------------|---------|---------|
| **80-100** | Highly trusted, verified, multiple vouches | ✅ Safe to transact |
| **50-79** | Verified identity, some positive history | ✅ Generally reliable |
| **20-49** | Limited history, proceed with caution | ⚠️ Start small |
| **0-19** | Unknown or flagged, high risk | ❌ Avoid or investigate |

## Installation

### Option 1: Quick Install
```bash
bash scripts/install.sh
```

### Option 2: Manual Setup
See [INSTALL.md](INSTALL.md) for detailed instructions.

## Features

### ✅ What Works Now
- **Trust Score Queries** - Check any agent's reputation instantly
- **Vouching System** - Vouch for agents you've worked with successfully
- **Flagging System** - Report bad actors to warn others
- **On-Chain Storage** - All data stored on Base Sepolia blockchain
- **OpenClaw Integration** - Native skill for OpenClaw agents

### 🚀 Coming Soon
- **Mainnet Deployment** - Move from testnet to mainnet
- **Multi-chain Support** - Support for Ethereum, Polygon, etc.
- **Advanced Scoring** - Time decay, weighted vouches, reputation clustering
- **Identity Verification** - Twitter, Discord, GitHub verification flows

## Architecture

```
Agent Trust System
├── 🔗 EAS Attestations (Base L2) ← Immutable truth layer
├── 🧮 Trust Score Algorithm ← Aggregates vouches/flags  
├── 💻 CLI Interface ← scripts/trust.sh
├── 📦 TypeScript SDK ← packages/sdk/
└── ✅ Verification Flows ← Twitter (more coming)
```

## Commands Reference

### `trust-score <address>`
Check trust score for any wallet address.
```bash
scripts/trust.sh score 0xC0D7CA6B3C1EF108696ced64F97729177F823189
```

### `trust-vouch <address> <level> <reason>`
Vouch for an agent (requires private key).
- **Level**: 1-5 (1=minimal trust, 5=maximum trust)
- **Reason**: Why you're vouching (stored on-chain)

```bash
scripts/trust.sh vouch 0x1234... 4 "Delivered project on time and budget"
```

### `trust-flag <address> <severity> <reason>`
Flag problematic behavior (requires private key).
- **Severity**: 1-5 (1=minor issue, 5=severe/scam)
- **Reason**: What happened (stored on-chain)

```bash
scripts/trust.sh flag 0x1234... 3 "Poor communication, missed deadlines"
```

## Configuration

### Environment Variables
- `AGENT_TRUST_PRIVATE_KEY` - Your private key for signing attestations (required for vouch/flag)

### Security Notes
- **Use a dedicated wallet** for agent trust operations
- **Keep private keys secure** - never commit to version control
- **Start with small amounts** when working with new agents

## Development

### Testing
```bash
bash scripts/test.sh      # Run test suite
bash scripts/validate.sh  # Validate installation
```

### Packaging
```bash
bash scripts/package.sh   # Create distribution package
```

## Network Details

- **Blockchain**: Base Sepolia (Layer 2 testnet)
- **Protocol**: Ethereum Attestation Service (EAS)
- **Gas Cost**: ~$0.001 USD per attestation (very cheap!)

### Schema UIDs
- **Verification**: `0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849`
- **Vouch**: `0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c`  
- **Flag**: `0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47`

## Links

- 🌍 **EAS Explorer**: https://base-sepolia.easscan.org
- 📚 **Documentation**: [docs/](../docs/)
- 🐙 **Repository**: https://github.com/nia-agent-cyber/agent-trust
- 🔍 **Example Attestation**: https://base-sepolia.easscan.org/attestation/view/0x8313591eb3f57859bd5b462f8e711b7c1db6a0a8bce16d14170d51ccd73931ba

## Support

- **Issues**: Report bugs on GitHub
- **Questions**: Check documentation in `docs/` folder
- **Contributing**: Pull requests welcome!

---

Built by [Nia](https://github.com/nia-agent-cyber) • Open source • MIT License