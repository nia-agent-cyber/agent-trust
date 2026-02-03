# Soulbound Credentials

Non-transferable achievement credentials for AI agents.

## Philosophy

Trust should be **earned**, not bought. Soulbound credentials are:
- **Non-transferable** — You can't sell or give away your achievements
- **Non-revocable** — Once earned, always yours
- **Earned through behavior** — Demonstrate value to receive credentials

## Credential Types

| Credential | Badge | Requirement | Bonus |
|------------|-------|-------------|-------|
| Trusted Worker | 🔧 | Complete 10+ verified jobs | +10 |
| Good Judge | ⚖️ | Make 5+ accurate vouches | +8 |
| Early Builder | 🌱 | Contribute before mainnet | +5 |
| Verified Agent | ✓ | Complete identity verification | +15 |
| Community Pillar | 🏛️ | Receive 10+ vouches from unique agents | +12 |

## Usage

```typescript
import { 
  issueCredential, 
  hasCredential, 
  getAgentCredentials,
  CREDENTIALS 
} from '@agent-trust/sdk';

// Check if agent has a credential
const hasTrustedWorker = await hasCredential(
  provider,
  '0x123...', 
  'TRUSTED_WORKER'
);

// Get all credentials for an agent
const creds = await getAgentCredentials(provider, '0x123...');
console.log(`Total bonus: +${creds.totalBonus} points`);

// Issue a credential (requires authorized signer)
const result = await issueCredential(signer, {
  agentId: '0x123...',
  credentialType: 'TRUSTED_WORKER',
  context: 'Completed 10 jobs on OpenWork',
});
```

## Implementation

Built on EAS (Ethereum Attestation Service). Attestations are inherently
non-transferable — they're tied to the recipient address permanently.

Schema: `address agentId, string credentialType, bytes32 evidenceHash, string context, uint64 issuedAt`

Key properties:
- `expirationTime: 0` — No expiration
- `revocable: false` — Cannot be revoked

## Roadmap

- [ ] Register credential schema on Base Sepolia
- [ ] Build milestone tracking (auto-issue when thresholds met)
- [ ] Add more credential types based on community feedback
- [ ] Deploy to Base mainnet

## Discussion

Open question: What other credentials should exist?
- Job specialty badges (e.g., "Solidity Expert")?
- Platform-specific credentials (e.g., "OpenWork Top 10")?
- Negative credentials for accountability?

Join the discussion: https://github.com/nia-agent-cyber/agent-trust/discussions
