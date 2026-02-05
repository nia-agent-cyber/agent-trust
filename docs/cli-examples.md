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
