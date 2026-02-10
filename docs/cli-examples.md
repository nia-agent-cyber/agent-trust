# CLI Examples

The Agent Trust SDK includes a CLI tool for common operations.

## Setup

```bash
# Clone the repo
git clone https://github.com/nia-agent-cyber/agent-trust.git
cd agent-trust/packages/sdk

# Install dependencies
npm install

# Build
npm run build
```

## Available Commands

```bash
npx ts-node scripts/cli.ts <command> [options]
```

### Check Trust Tier

Query the trust tier for any agent address with visual progress indicators:

```bash
# Basic usage - shows tier and progress to next level
npx ts-node scripts/cli.ts tier 0xC0D7CA6B3C1EF108696ced64F97729177F823189

# Output:
# Trust Tier: ⭐ Trusted (Tier 2)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Current Stats:
#   Attestations:  15 ✓
#   Vouches:       3 ✓
#   Approval Rate: 86.7% ✓
#   Days Active:   45 ✓
#
# Progress to Verified (Tier 3):
#   Attestations:  15/25 ▓▓▓▓▓▓░░░░ 60%
#   Vouches:       3/5   ▓▓▓▓▓▓░░░░ 60%
#   Approval Rate: 86.7%/85% ✓
#   Days Active:   45/90 ▓▓▓▓▓░░░░░ 50%
```

### Tier Gating (--check flag)

Use the `--check` flag for automated tier verification in scripts:

```bash
# Check if agent meets minimum tier (exits 0 if yes, 1 if no)
npx ts-node scripts/cli.ts tier 0xAgentAddress --check 2

# Output (if meets tier):
# ✓ Agent meets Tier 2 (Trusted) requirements

# Output (if doesn't meet tier):
# ✗ Agent does not meet Tier 2 (Trusted) requirements
#   Current tier: 1 (Contributor)
#   Missing: 5 attestations, 2 vouches, 20 days

# Use in scripts:
if npx ts-node scripts/cli.ts tier 0xAgentAddress --check 2; then
  echo "Agent is trusted, proceeding..."
else
  echo "Agent does not meet trust requirements"
  exit 1
fi
```

### JSON Output (--json flag)

Get machine-readable output for integration with other tools:

```bash
npx ts-node scripts/cli.ts tier 0xAgentAddress --json

# Output:
# {
#   "address": "0x1234...",
#   "tier": 2,
#   "name": "Trusted",
#   "emoji": "⭐",
#   "stats": {
#     "attestations": 15,
#     "vouches": 3,
#     "approvalRate": 86.7,
#     "daysActive": 45
#   },
#   "progress": {
#     "nextTier": 3,
#     "nextTierName": "Verified",
#     "attestations": { "current": 15, "required": 25, "met": false },
#     "vouches": { "current": 3, "required": 5, "met": false },
#     "approvalRate": { "current": 86.7, "required": 85, "met": true },
#     "daysActive": { "current": 45, "required": 90, "met": false }
#   }
# }

# Combine with --check for JSON gating output:
npx ts-node scripts/cli.ts tier 0xAgentAddress --check 2 --json

# Output:
# {
#   "address": "0x1234...",
#   "meetsTier": true,
#   "requiredTier": 2,
#   "requiredTierName": "Trusted",
#   "actualTier": 2,
#   "actualTierName": "Trusted"
# }
```

### Tier Levels Reference

| Tier | Name | Emoji | Requirements |
|------|------|-------|--------------|
| 0 | New | 🆕 | No requirements (default) |
| 1 | Contributor | 🔧 | 3 attestations, 50% approval, 7 days |
| 2 | Trusted | ⭐ | 10 attestations, 2 vouches, 70% approval, 30 days |
| 3 | Verified | ✅ | 25 attestations, 5 vouches, 85% approval, 90 days |
| 4 | Expert | 👑 | 50 attestations, 10 vouches, 95% approval, 180 days |

### Check Trust Score

Query the trust score for any agent address:

```bash
# Basic usage
npx ts-node scripts/cli.ts score 0xC0D7CA6B3C1EF108696ced64F97729177F823189

# Output:
# 🔍 Trust Score for 0xC0D7CA6B3C1EF108696ced64F97729177F823189
#
# 📊 Score: 65/100
#    Confidence: 42%
#    Verified: ✅
#    Attestations: 3
#
# 👍 Vouches: 2
#    • Level 4/5 from 0xabc123...
#    • Level 3/5 from 0xdef456...
```

### Vouch for an Agent

Create a vouch attestation (requires private key):

```bash
# Set your private key (Base Sepolia)
export PRIVATE_KEY=your_private_key_here

# Vouch with trust level 1-5
npx ts-node scripts/cli.ts vouch 0xAgentAddress 4 "Reliable collaborator"

# Output:
# 👍 Vouching for 0xAgentAddress
#    From: 0xYourAddress
#    Trust Level: 4/5
#    Context: Reliable collaborator
#
# ⏳ Submitting...
# ✅ Vouch created!
#    UID: 0xabc123...
#    View: https://base-sepolia.easscan.org/attestation/view/0xabc123...
```

### Flag a Bad Actor

Create a flag attestation (requires private key):

```bash
export PRIVATE_KEY=your_private_key_here

# Flag with severity 1-5 and reason
npx ts-node scripts/cli.ts flag 0xBadAgent 4 "Scam attempt, fake credentials"

# Output:
# 🚩 Flagging 0xBadAgent
#    From: 0xYourAddress
#    Severity: 4/5
#    Reason: Scam attempt, fake credentials
#
# ⏳ Submitting...
# ✅ Flag created!
#    UID: 0xdef456...
#    View: https://base-sepolia.easscan.org/attestation/view/0xdef456...
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PRIVATE_KEY` | Ethereum private key for signing transactions | For vouch/flag |

## Network Configuration

The CLI defaults to Base Sepolia testnet. To use mainnet, modify `scripts/cli.ts`:

```typescript
// Change these constants
const RPC_URL = 'https://mainnet.base.org';
// Update schema UIDs for mainnet if different
```

## Examples in Practice

### Check Multiple Agents

```bash
# Create a simple script
for addr in 0xAgent1 0xAgent2 0xAgent3; do
  echo "=== $addr ==="
  npx ts-node scripts/cli.ts score $addr
done
```

### Batch Vouch

```bash
# Vouch for multiple agents
export PRIVATE_KEY=your_key

for addr in 0xTrusted1 0xTrusted2; do
  npx ts-node scripts/cli.ts vouch $addr 4 "Trusted partner"
  sleep 2  # Wait for transaction
done
```

### Programmatic Usage

For more complex scripts, use the SDK directly:

```typescript
// scripts/batch-check.ts
import { getAttestationSummary } from '../src/query';

const addresses = [
  '0xAddress1',
  '0xAddress2',
  '0xAddress3'
];

async function main() {
  for (const addr of addresses) {
    const summary = await getAttestationSummary(addr, 'baseSepolia');
    console.log(`${addr}: Score ${summary.trustScore.score}, ${summary.trustScore.attestationCount} attestations`);
  }
}

main();
```

Run with:

```bash
npx ts-node scripts/batch-check.ts
```

## Troubleshooting

### "Schema not registered"

The schema UIDs in `constants.ts` must match the network. Verify you're using the correct network.

### "Insufficient funds"

You need ETH on the network for gas. Get testnet ETH from:
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)

### "Invalid address"

Ensure addresses are valid Ethereum addresses (0x + 40 hex characters).

### Network timeout

The EAS GraphQL endpoint may be slow. Try again or check https://base.easscan.org/ status.

## Advanced Usage

### Direct GraphQL Queries

Query the EAS GraphQL API directly:

```bash
# Using curl
curl -X POST https://base-sepolia.easscan.org/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { attestations(where: { recipient: { equals: \"0xYourAddress\" } }) { id attester time } }"
  }'
```

### Custom Scripts

Create custom scripts in `packages/sdk/scripts/`:

```typescript
// scripts/my-custom-script.ts
import { AgentTrust } from '../src';
import { ethers } from 'ethers';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  const agentTrust = new AgentTrust({
    network: 'baseSepolia',
    provider: signer
  });
  
  // Your custom logic here
}

main().catch(console.error);
```

## See Also

- [API Reference](api-reference.md) - Full SDK documentation
- [Getting Started](getting-started.md) - Setup guide
- [EAS Scan](https://base.easscan.org/) - View attestations on-chain
