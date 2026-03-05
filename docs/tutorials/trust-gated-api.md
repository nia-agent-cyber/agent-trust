# Tutorial: Build a Trust-Gated Agent API in 10 Minutes

> Gate your API endpoints by on-chain reputation. Only agents with sufficient trust can access your service.

This tutorial walks you through building a simple Express API that checks an agent's trust tier on Base before allowing access. By the end, you'll have a working trust-gated endpoint that queries real on-chain attestation data.

## What You'll Build

A REST API with three endpoints:
- `GET /public` — Open to everyone
- `GET /trusted` — Requires `contributor` tier (basic reputation)
- `GET /premium` — Requires `verified` tier (high reputation)

Each protected endpoint checks the caller's Ethereum address against Agent Trust's on-chain reputation data before granting access.

## Prerequisites

- Node.js 18+
- Basic TypeScript knowledge
- No wallet or ETH needed (read-only queries are free)

## Step 1: Set Up the Project

```bash
mkdir trust-gated-api && cd trust-gated-api
npm init -y
npm install express @nia-agent-cyber/agent-trust-sdk ethers
npm install -D typescript @types/express @types/node ts-node
```

> **Note:** If installing from GitHub Packages, add this to `.npmrc` first:
> ```
> @nia-agent-cyber:registry=https://npm.pkg.github.com
> ```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  }
}
```

## Step 2: Create the Trust Middleware

This is the core pattern — a reusable middleware that checks trust tiers.

Create `src/trust-middleware.ts`:

```typescript
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';
import { Request, Response, NextFunction } from 'express';

// Initialize once at startup (read-only, no wallet needed)
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({ network: 'base', provider });

// Tier names for readability
type TierName = 'new' | 'contributor' | 'trusted' | 'verified' | 'expert';

/**
 * Express middleware that gates endpoints by Agent Trust tier.
 *
 * Reads the agent's Ethereum address from the `x-agent-address` header,
 * queries their on-chain trust tier, and rejects if insufficient.
 */
export function requireTier(minTier: TierName) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const address = req.headers['x-agent-address'] as string;

    if (!address) {
      return res.status(401).json({
        error: 'Missing x-agent-address header',
        hint: 'Send your Ethereum address in the x-agent-address header',
      });
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        error: 'Invalid Ethereum address',
        address,
      });
    }

    try {
      const meets = await agentTrust.meetsTier(address, minTier);

      if (!meets) {
        const tier = await agentTrust.getTier(address);
        return res.status(403).json({
          error: 'Insufficient trust tier',
          currentTier: tier.name,
          requiredTier: minTier,
          hint: `Build reputation through verifications and vouches. Current: ${tier.name}, Required: ${minTier}`,
        });
      }

      // Attach tier info to request for downstream use
      (req as any).agentTier = await agentTrust.getTier(address);
      next();
    } catch (err: any) {
      return res.status(500).json({
        error: 'Trust check failed',
        message: err.message,
      });
    }
  };
}

export { agentTrust };
```

## Step 3: Build the API

Create `src/server.ts`:

```typescript
import express from 'express';
import { requireTier, agentTrust } from './trust-middleware';

const app = express();
const PORT = 3000;

// Public endpoint — no trust required
app.get('/public', (req, res) => {
  res.json({
    message: 'Welcome! This endpoint is open to everyone.',
    docs: 'Add x-agent-address header to access gated endpoints.',
  });
});

// Contributor tier — basic reputation required
app.get('/trusted', requireTier('contributor'), (req, res) => {
  const tier = (req as any).agentTier;
  res.json({
    message: `Welcome, ${tier.name}-tier agent!`,
    data: 'This is trusted-only content.',
    yourTier: tier,
  });
});

// Verified tier — high reputation required
app.get('/premium', requireTier('verified'), (req, res) => {
  const tier = (req as any).agentTier;
  res.json({
    message: 'Premium access granted.',
    data: 'High-value content for verified agents only.',
    yourTier: tier,
  });
});

// Lookup any agent's trust profile
app.get('/agent/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const [score, tier] = await Promise.all([
      agentTrust.getScore(address),
      agentTrust.getTier(address),
    ]);

    res.json({
      address,
      score,
      tier: {
        name: tier.name,
        level: tier.tier,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 Trust-gated API running at http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  GET /public              — Open to all');
  console.log('  GET /trusted             — Requires contributor tier');
  console.log('  GET /premium             — Requires verified tier');
  console.log('  GET /agent/:address      — Lookup any agent');
  console.log('');
  console.log('Usage:');
  console.log('  curl http://localhost:3000/public');
  console.log('  curl -H "x-agent-address: 0x..." http://localhost:3000/trusted');
});
```

## Step 4: Run It

```bash
npx ts-node src/server.ts
```

## Step 5: Test It

```bash
# Public — works without any headers
curl http://localhost:3000/public

# Trusted — requires reputation
curl -H "x-agent-address: 0xC0D7CA6B3C1EF108696ced64F97729177F823189" \
  http://localhost:3000/trusted

# Lookup any agent
curl http://localhost:3000/agent/0xC0D7CA6B3C1EF108696ced64F97729177F823189
```

**Expected response when trust is insufficient:**

```json
{
  "error": "Insufficient trust tier",
  "currentTier": "new",
  "requiredTier": "contributor",
  "hint": "Build reputation through verifications and vouches. Current: new, Required: contributor"
}
```

## How It Works

```
Agent Request → x-agent-address header
     ↓
Trust Middleware → Queries Base mainnet via EAS GraphQL
     ↓
meetsTier() → Checks attestations (verifications, vouches, flags)
     ↓
Allow or Reject (with current tier + requirements)
```

All trust data lives on-chain as EAS attestations on Base. No centralized database, no API keys, no accounts to create. The middleware reads directly from the blockchain.

## Going Further

### Add Caching

Trust tiers don't change every second. Cache for performance:

```typescript
import NodeCache from 'node-cache';

const tierCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

export function requireTierCached(minTier: TierName) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const address = req.headers['x-agent-address'] as string;
    // ... validation ...

    const cacheKey = `${address}:${minTier}`;
    const cached = tierCache.get<boolean>(cacheKey);

    if (cached !== undefined) {
      if (!cached) return res.status(403).json({ error: 'Insufficient trust' });
      return next();
    }

    const meets = await agentTrust.meetsTier(address, minTier);
    tierCache.set(cacheKey, meets);

    if (!meets) return res.status(403).json({ error: 'Insufficient trust' });
    next();
  };
}
```

### Issue Vouches for Good Actors

After an agent completes work successfully, vouch for them:

```typescript
app.post('/complete-task', requireTier('contributor'), async (req, res) => {
  // ... task completion logic ...

  // Reward with a vouch
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  await agentTrust.vouch({
    agentId: req.headers['x-agent-address'] as string,
    trustLevel: 3,
    context: 'Completed task #123 successfully',
  });

  res.json({ message: 'Task complete, vouch issued!' });
});
```

### Use with Any Framework

The pattern works with any HTTP framework:

- **Fastify**: Use a `preHandler` hook
- **Hono**: Use middleware
- **tRPC**: Use a context middleware
- **Python (FastAPI)**: Use the CLI with `subprocess` or query EAS GraphQL directly

## Related

- [Getting Started Guide](../getting-started.md) — Full SDK reference
- [Integration Guide](../integration-guide.md) — LangChain, ElizaOS, AutoGPT patterns
- [API Reference](../api-reference.md) — Complete method documentation
- [Live Demo](https://nia-agent-cyber.github.io/agent-trust/) — Try it in your browser
