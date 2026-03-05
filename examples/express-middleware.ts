/**
 * Express Middleware Example
 *
 * Trust-gated API server that requires agents to have a minimum
 * reputation tier before accessing protected endpoints.
 *
 * Run: npx tsx express-middleware.ts
 * Test: curl -H "X-Agent-Address: 0x..." http://localhost:3000/api/protected
 */
import express from 'express';
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { ethers } from 'ethers';

const app = express();
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const agentTrust = new AgentTrust({ network: 'base', provider });

// Cache trust lookups for 5 minutes
const cache = new Map<string, { tier: string; score: number; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Middleware: require minimum trust tier
 */
function requireTier(minTier: string) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const agentAddress = req.headers['x-agent-address'] as string;

    if (!agentAddress) {
      return res.status(401).json({ error: 'Missing X-Agent-Address header' });
    }

    // Check cache
    const cached = cache.get(agentAddress);
    if (cached && cached.expires > Date.now()) {
      if (!(await agentTrust.meetsTier(agentAddress, minTier as any))) {
        return res.status(403).json({
          error: 'Insufficient trust tier',
          required: minTier,
          current: cached.tier,
          score: cached.score,
        });
      }
      return next();
    }

    try {
      const [tier, score] = await Promise.all([
        agentTrust.getTier(agentAddress),
        agentTrust.getScore(agentAddress),
      ]);

      // Update cache
      cache.set(agentAddress, {
        tier: tier.name,
        score: score.score,
        expires: Date.now() + CACHE_TTL,
      });

      if (!(await agentTrust.meetsTier(agentAddress, minTier as any))) {
        return res.status(403).json({
          error: 'Insufficient trust tier',
          required: minTier,
          current: tier.name,
          score: score.score,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: 'Trust verification failed' });
    }
  };
}

// Public endpoint — no trust required
app.get('/api/public', (_req, res) => {
  res.json({ message: 'This endpoint is open to all agents' });
});

// Protected endpoint — requires "contributor" tier or higher
app.get('/api/protected', requireTier('contributor'), (_req, res) => {
  res.json({ message: 'Welcome, trusted agent! Here is your sensitive data.' });
});

// High-security endpoint — requires "verified" tier
app.get('/api/admin', requireTier('verified'), (_req, res) => {
  res.json({ message: 'Admin access granted. Handle with care.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔐 Trust-gated API running on http://localhost:${PORT}`);
  console.log('');
  console.log('Try:');
  console.log(`  curl http://localhost:${PORT}/api/public`);
  console.log(`  curl -H "X-Agent-Address: 0x..." http://localhost:${PORT}/api/protected`);
  console.log(`  curl -H "X-Agent-Address: 0x..." http://localhost:${PORT}/api/admin`);
});
