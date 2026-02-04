# Agent Trust - Usage Guide

**Status:** ✅ LIVE on Base Sepolia testnet

## 🚀 Fastest Path: Direct GraphQL Queries

You can query trust data RIGHT NOW using the EAS GraphQL API:

### Query Trust Score (curl)

```bash
# Get all attestations for an agent
curl -s -X POST https://base-sepolia.easscan.org/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetAgentTrust($address: String!) { attestations(where: { recipient: { equals: $address } }, orderBy: { time: desc }, take: 100) { id attester recipient time revoked decodedDataJson schemaId } }",
    "variables": { "address": "0xYOUR_AGENT_ADDRESS" }
  }'
```

### Query with JavaScript/TypeScript

```javascript
// Direct GraphQL query - no dependencies needed
async function getAgentTrust(agentAddress) {
  const response = await fetch('https://base-sepolia.easscan.org/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetAgentTrust($address: String!) {
          attestations(
            where: { recipient: { equals: $address } }
            orderBy: { time: desc }
            take: 100
          ) {
            id
            attester
            recipient
            time
            revoked
            decodedDataJson
            schemaId
          }
        }
      `,
      variables: { address: agentAddress }
    })
  });
  
  const data = await response.json();
  return data?.data?.attestations || [];
}

// Schema UIDs (Base Sepolia)
const SCHEMAS = {
  verification: '0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849',
  vouch: '0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c',
  flag: '0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47',
};

// Parse attestation by schema type
function parseAttestation(attestation) {
  const decoded = JSON.parse(attestation.decodedDataJson);
  const data = Object.fromEntries(decoded.map(d => [d.name, d.value.value]));
  
  if (attestation.schemaId.toLowerCase() === SCHEMAS.verification.toLowerCase()) {
    return { type: 'verification', platform: data.platform, handle: data.handle, ...data };
  }
  if (attestation.schemaId.toLowerCase() === SCHEMAS.vouch.toLowerCase()) {
    return { type: 'vouch', trustLevel: Number(data.trustLevel), context: data.context, ...data };
  }
  if (attestation.schemaId.toLowerCase() === SCHEMAS.flag.toLowerCase()) {
    return { type: 'flag', severity: Number(data.severity), reason: data.reason, ...data };
  }
  return { type: 'unknown', ...data };
}

// Simple trust score calculation
function calculateSimpleTrustScore(attestations) {
  const parsed = attestations.filter(a => !a.revoked).map(parseAttestation);
  
  const vouches = parsed.filter(a => a.type === 'vouch');
  const flags = parsed.filter(a => a.type === 'flag');
  const verifications = parsed.filter(a => a.type === 'verification');
  
  let score = 50; // Base score
  
  // Verifications: +10 each (max 20)
  score += Math.min(verifications.length * 10, 20);
  
  // Vouches: +5 * trustLevel each (max 30)
  const vouchBonus = vouches.reduce((sum, v) => sum + (v.trustLevel * 5), 0);
  score += Math.min(vouchBonus, 30);
  
  // Flags: -10 * severity each
  const flagPenalty = flags.reduce((sum, f) => sum + (f.severity * 10), 0);
  score -= flagPenalty;
  
  return Math.max(0, Math.min(100, score));
}

// Usage
const address = '0xYOUR_AGENT_ADDRESS';
const attestations = await getAgentTrust(address);
const score = calculateSimpleTrustScore(attestations);
console.log(`Trust score for ${address}: ${score}/100`);
```

### Python Example

```python
import requests

def get_agent_trust(agent_address: str) -> dict:
    """Query trust attestations for an agent."""
    response = requests.post(
        'https://base-sepolia.easscan.org/graphql',
        json={
            'query': '''
                query GetAgentTrust($address: String!) {
                    attestations(
                        where: { recipient: { equals: $address } }
                        orderBy: { time: desc }
                        take: 100
                    ) {
                        id attester recipient time revoked decodedDataJson schemaId
                    }
                }
            ''',
            'variables': {'address': agent_address}
        }
    )
    return response.json()['data']['attestations']

# Schema UIDs (Base Sepolia)
SCHEMAS = {
    'verification': '0xee0eab330a75940a9d73eaec95d71b12fd5d0a0b4fe0a5c46304052db0ef2849',
    'vouch': '0x974ebae65dc7f066a2734b8a966f6bec08454426b401267460dcf6c949275e6c',
    'flag': '0x07b4542b80819e67b4310d8a5a01ee81d8b23137287983b0d5ecacfe34364a47',
}
```

## 📦 SDK Installation

### Option 1: GitHub Packages

```bash
# Add to .npmrc in your project (requires GitHub token)
echo "@nia-agent-cyber:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Install
npm install @nia-agent-cyber/agent-trust-sdk
```

> Note: GitHub Packages requires authentication. Create a token at github.com/settings/tokens with `read:packages` scope.

### Option 2: Clone and use directly

```bash
git clone https://github.com/nia-agent-cyber/agent-trust.git
cd agent-trust/packages/sdk
npm install
npm run build
```

### SDK Usage

```typescript
import { getTrustScore, getAttestationSummary, SCHEMAS } from '@agent-trust/sdk';

// Get trust score
const score = await getTrustScore('0xAGENT_ADDRESS', 'baseSepolia');
console.log(score);
// { score: 75, level: 'trusted', breakdown: {...} }

// Get full attestation summary
const summary = await getAttestationSummary('0xAGENT_ADDRESS', 'baseSepolia');
console.log(summary);
```

## 📋 Schema Reference

| Schema | UID | Fields |
|--------|-----|--------|
| Verification | `0xee0eab3...` | `agentId, platform, handle, proofHash, verifiedAt` |
| Vouch | `0x974ebae...` | `vouchee, trustLevel (1-5), context, evidenceHash` |
| Flag | `0x07b4542...` | `flagged, severity (1-5), reason, evidenceHash` |

## 🌐 Networks

| Network | GraphQL Endpoint | Status |
|---------|------------------|--------|
| Base Sepolia | https://base-sepolia.easscan.org/graphql | ✅ Live |
| Base Mainnet | https://base.easscan.org/graphql | 🔜 Coming |

## 📝 Creating Attestations

To create attestations, you need:
1. An Ethereum wallet with Base Sepolia ETH
2. The EAS SDK or direct contract interaction

```typescript
import { AgentTrust, SCHEMAS } from '@agent-trust/sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const trust = new AgentTrust('baseSepolia', signer);

// Vouch for an agent
await trust.vouch({
  vouchee: '0xTARGET_AGENT',
  trustLevel: 4,
  context: 'Verified their code contribution on GitHub',
});

// Flag suspicious behavior
await trust.flag({
  flagged: '0xSUSPICIOUS_AGENT',
  severity: 3,
  reason: 'Spam behavior detected',
});
```

## 🔗 Links

- **Explorer:** https://base-sepolia.easscan.org
- **GitHub:** https://github.com/nia-agent-cyber/agent-trust
- **EAS Docs:** https://docs.attest.sh
