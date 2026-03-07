# Add Trust Verification to Your LangChain Agent

**Learn how to add on-chain reputation checks to your LangChain agent in 15 minutes.**

This tutorial shows you how to integrate Agent Trust into a LangChain agent, enabling trust-gated tool access and agent-to-agent verification.

---

## Prerequisites

- Node.js 18+
- A LangChain agent (JavaScript/TypeScript)
- Basic familiarity with EAS attestations

---

## Step 1: Install the SDK

```bash
echo "@nia-agent-cyber:registry=https://npm.pkg.github.com" >> .npmrc
npm install @nia-agent-cyber/agent-trust-sdk
```

---

## Step 2: Create a Trust Verification Tool

Create a new LangChain tool that checks an agent's trust tier before allowing access to sensitive operations:

```typescript
// trust-verification-tool.ts
import { AgentTrust, TrustTier } from '@nia-agent-cyber/agent-trust-sdk';
import { DynamicTool } from 'langchain/tools';

const trustChecker = new AgentTrust('base-mainnet');

export const createTrustVerificationTool = () => {
  return new DynamicTool({
    name: 'verify_agent_trust',
    description: 'Verify an agent\'s trust tier before allowing access to sensitive operations. Returns the trust tier and score.',
    func: async (agentAddress: string) => {
      try {
        const profile = await trustChecker.getAgentProfile(agentAddress);
        const tier = await trustChecker.getTier(agentAddress);
        
        return JSON.stringify({
          address: agentAddress,
          tier: tier.tier, // 'new' | 'contributor' | 'trusted' | 'verified' | 'expert'
          score: profile.trustScore,
          vouches: profile.vouchCount,
          attestations: profile.attestationCount,
          isTrusted: tier.meetsTier('trusted'),
        });
      } catch (error) {
        return JSON.stringify({
          error: 'Failed to verify trust',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
};
```

---

## Step 3: Add Trust-Gated Tool Access

Wrap sensitive tools with a trust check. Only agents with `trusted` tier or higher can access them:

```typescript
// trust-gated-tools.ts
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { DynamicTool } from 'langchain/tools';

const trustChecker = new AgentTrust('base-mainnet');

export const createTrustGatedTool = (
  innerTool: DynamicTool,
  minimumTier: 'contributor' | 'trusted' | 'verified' | 'expert' = 'trusted'
) => {
  return new DynamicTool({
    name: `gated_${innerTool.name}`,
    description: `${innerTool.description} (requires ${minimumTier} tier or higher)`,
    func: async (input: string, callbacks?: any) => {
      // Extract caller address from context (you'll need to pass this from your agent)
      const callerAddress = callbacks?.metadata?.callerAddress;
      
      if (!callerAddress) {
        return 'Error: Caller address not provided. Cannot verify trust tier.';
      }
      
      const tier = await trustChecker.getTier(callerAddress);
      
      if (!tier.meetsTier(minimumTier)) {
        return `Access denied: Trust tier '${tier.tier}' is below required '${minimumTier}' tier. ` +
               `Current score: ${tier.score}, required: ${tier.requiredScore}.`;
      }
      
      // Trust check passed, execute the inner tool
      return innerTool.func(input, callbacks);
    },
  });
};
```

---

## Step 4: Integrate into Your Agent

```typescript
// agent.ts
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { createTrustVerificationTool } from './trust-verification-tool';
import { createTrustGatedTool } from './trust-gated-tools';
import { SerpAPI } from 'langchain/tools';

// Create base tools
const searchTool = new SerpAPI(process.env.SERPAPI_KEY);

// Create trust-gated version of sensitive tools
const gatedSearch = createTrustGatedTool(searchTool, 'trusted');

// Create trust verification tool
const trustTool = createTrustVerificationTool();

// Build agent with tools
const tools = [gatedSearch, trustTool];

const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0,
});

const agent = await createOpenAIFunctionsAgent({
  llm: model,
  tools,
  prompt: /* your prompt */
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

// Run with caller address in metadata
const result = await agentExecutor.invoke({
  input: 'Search for the latest news on Ethereum attestations',
}, {
  metadata: {
    callerAddress: '0x1234567890123456789012345678901234567890',
  },
});

console.log(result.output);
```

---

## Step 5: Agent-to-Agent Trust Verification

For multi-agent systems, verify other agents before collaboration:

```typescript
// multi-agent-trust.ts
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';

const trustChecker = new AgentTrust('base-mainnet');

export class TrustAwareAgent {
  private minimumCollaboratorTier = 'trusted';
  
  async canCollaborate(collaboratorAddress: string): Promise<{
    allowed: boolean;
    reason: string;
    tier: any;
  }> {
    const tier = await trustChecker.getTier(collaboratorAddress);
    
    if (!tier.meetsTier(this.minimumCollaboratorTier)) {
      return {
        allowed: false,
        reason: `Agent tier '${tier.tier}' is below required '${this.minimumCollaboratorTier}'`,
        tier,
      };
    }
    
    return {
      allowed: true,
      reason: `Agent meets ${this.minimumCollaboratorTier} tier requirements`,
      tier,
    };
  }
  
  async getCollaboratorReport(address: string) {
    const profile = await trustChecker.getAgentProfile(address);
    const tier = await trustChecker.getTier(address);
    
    return {
      address,
      trustTier: tier.tier,
      trustScore: profile.trustScore,
      vouchCount: profile.vouchCount,
      attestationCount: profile.attestationCount,
      flags: profile.flagsCount,
      recommendation: this.generateRecommendation(profile, tier),
    };
  }
  
  private generateRecommendation(profile: any, tier: any): string {
    if (tier.meetsTier('expert')) {
      return 'Highly trusted agent - safe for all collaborations';
    }
    if (tier.meetsTier('verified')) {
      return 'Verified agent - safe for most collaborations';
    }
    if (tier.meetsTier('trusted')) {
      return 'Trusted agent - suitable for standard collaborations';
    }
    if (tier.meetsTier('contributor')) {
      return 'New contributor - limit to low-risk tasks';
    }
    return 'Unverified agent - proceed with caution';
  }
}
```

---

## Step 6: Vouch After Successful Collaboration

After a successful collaboration, vouch for the other agent:

```typescript
// vouch-after-collaboration.ts
import { AgentTrust } from '@nia-agent-cyber/agent-trust-sdk';
import { Wallet } from 'ethers';

const trustChecker = new AgentTrust('base-mainnet');

export async function vouchForCollaborator(
  collaboratorAddress: string,
  vouchReason: string,
  signerWallet: Wallet
) {
  const tx = await trustChecker.vouch(
    collaboratorAddress,
    vouchReason,
    signerWallet
  );
  
  console.log(`Vouch transaction sent: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`Vouch attestation created: ${receipt.attestationId}`);
  
  return receipt;
}

// Example usage after successful collaboration
// await vouchForCollaborator(
//   '0x...',
//   'Successfully completed data analysis task with high accuracy',
//   myWallet
// );
```

---

## Complete Example

See the full working example in the [`examples/`](https://github.com/nia-agent-cyber/agent-trust/tree/main/examples) directory:

- `langchain-agent.ts` - Complete LangChain agent with trust verification
- `multi-agent-collaboration.ts` - Multi-agent trust verification and vouching

---

## Benefits

✅ **Trust-gated tool access** — Prevent malicious agents from accessing sensitive operations  
✅ **Agent-to-agent verification** — Verify collaborators before working together  
✅ **On-chain reputation** — Trust is earned and verifiable, not self-reported  
✅ **Automatic vouching** — Build reputation through successful collaborations  

---

## Next Steps

1. **Deploy your agent** with trust verification enabled
2. **Share your agent's address** so others can verify your trust tier
3. **Vouch for collaborators** after successful interactions
4. **Monitor your trust score** as you complete more tasks

---

## Resources

- [SDK API Reference](./api-reference.md)
- [Trust Tiers Explained](./design/trust-tiers.md)
- [EAS GraphQL API](https://base.easscan.org/graphql)
- [Agent Trust Demo](https://nia-agent-cyber.github.io/agent-trust/)
