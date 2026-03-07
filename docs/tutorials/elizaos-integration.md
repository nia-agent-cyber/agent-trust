# Add Reputation to Your ElizaOS Agent

**Learn how to integrate Agent Trust into your ElizaOS character in 15 minutes.**

This tutorial shows you how to add on-chain reputation checks to an ElizaOS agent, enabling trust-aware character interactions and agent-to-agent verification.

---

## Prerequisites

- Node.js 18+
- An ElizaOS character setup
- Basic familiarity with TypeScript

---

## Step 1: Install the SDK

```bash
echo "@nia-agent-cyber:registry=https://npm.pkg.github.com" >> .npmrc
npm install @nia-agent-cyber/agent-trust-sdk
```

---

## Step 2: Create a Trust Evaluator

ElizaOS uses evaluators to assess messages and make decisions. Create a trust evaluator:

```typescript
// evaluators/trust-evaluator.ts
import {
  Evaluator,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { AgentTrust } from "@nia-agent-cyber/agent-trust-sdk";

const trustChecker = new AgentTrust("base-mainnet");

export const trustEvaluator: Evaluator = {
  name: "TRUST_CHECK",
  description: "Evaluates whether a user/agent meets minimum trust requirements",
  similes: ["trust verification", "reputation check", "credential verification"],
  examples: [
    {
      context: `Actor: Check if this agent is trustworthy
Agent: I'll verify their on-chain reputation before proceeding`,
      outcome: `Trust check initiated. Verifying address 0x...`,
    },
  ],
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
  ): Promise<boolean> => {
    // Extract Ethereum address from message (adjust based on your format)
    const addressPattern = /0x[a-fA-F0-9]{40}/;
    const match = message.content.text.match(addressPattern);
    
    if (!match) {
      // No address found, skip trust check
      return true;
    }
    
    const address = match[0];
    
    try {
      const tier = await trustChecker.getTier(address);
      const minimumTier = "contributor"; // Adjust as needed
      
      const isTrusted = tier.meetsTier(minimumTier);
      
      if (!isTrusted) {
        console.log(`Trust check FAILED: ${address} is tier ${tier.tier}, needs ${minimumTier}`);
      } else {
        console.log(`Trust check PASSED: ${address} is ${tier.tier}`);
      }
      
      return isTrusted;
    } catch (error) {
      console.error("Trust check error:", error);
      // On error, default to allowing (fail open) or deny based on your security needs
      return true;
    }
  },
  examples: [],
  validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Always run trust evaluation
    return true;
  },
};
```

---

## Step 3: Create a Vouch Action

Allow your ElizaOS character to vouch for other agents after successful interactions:

```typescript
// actions/vouch-action.ts
import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
} from "@elizaos/core";
import { AgentTrust } from "@nia-agent-cyber/agent-trust-sdk";
import { Wallet } from "ethers";

const trustChecker = new AgentTrust("base-mainnet");

export const vouchAction: Action = {
  name: "VOUCH_FOR_AGENT",
  similes: ["vouch", "endorse", "recommend", "attest"],
  description: "Vouch for another agent on-chain after a successful interaction",
  validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Check if user has a wallet configured
    const hasWallet = !!runtime.getSetting("ETHEREUM_PRIVATE_KEY");
    return hasWallet;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    // Extract address to vouch for
    const addressPattern = /0x[a-fA-F0-9]{40}/;
    const match = message.content.text.match(addressPattern);
    
    if (!match) {
      callback?.({
        text: "I need an Ethereum address to vouch for. Please provide the agent's address.",
      });
      return false;
    }
    
    const targetAddress = match[0];
    
    // Extract reason for vouch (everything after the address)
    const reasonStart = message.content.text.indexOf(match[0]) + match[0].length;
    const vouchReason = message.content.text.substring(reasonStart).trim() 
      || "Successful collaboration";
    
    try {
      // Get wallet from runtime settings
      const privateKey = runtime.getSetting("ETHEREUM_PRIVATE_KEY");
      if (!privateKey) {
        callback?.({ text: "Error: No wallet configured" });
        return false;
      }
      
      const wallet = new Wallet(privateKey);
      
      callback?.({
        text: `Vouching for ${targetAddress}... Reason: "${vouchReason}"`,
      });
      
      // Submit vouch attestation
      const tx = await trustChecker.vouch(targetAddress, vouchReason, wallet);
      
      callback?.({
        text: `Vouch transaction sent! Hash: ${tx.hash}\n\n` +
              `This on-chain attestation will increase ${targetAddress}'s trust score.`,
      });
      
      await tx.wait();
      
      callback?.({
        text: `✅ Vouch attestation confirmed on Base!`,
      });
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      callback?.({
        text: `❌ Vouch failed: ${errorMsg}`,
      });
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Vouch for 0x1234567890123456789012345678901234567890 - completed task successfully",
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Vouching for 0x1234567890123456789012345678901234567890... Reason: \"completed task successfully\"",
        },
      },
    ],
  ],
};
```

---

## Step 4: Create a Trust Check Action

Allow users to query an agent's trust tier:

```typescript
// actions/trust-check-action.ts
import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
} from "@elizaos/core";
import { AgentTrust } from "@nia-agent-cyber/agent-trust-sdk";

const trustChecker = new AgentTrust("base-mainnet");

export const trustCheckAction: Action = {
  name: "CHECK_TRUST",
  similes: ["check trust", "verify reputation", "trust score", "what tier"],
  description: "Check an agent's trust tier and reputation on Base",
  validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ): Promise<boolean> => {
    // Extract address to check
    const addressPattern = /0x[a-fA-F0-9]{40}/;
    const match = message.content.text.match(addressPattern);
    
    if (!match) {
      callback?.({
        text: "Please provide an Ethereum address to check. Example: 'Check trust for 0x...'",
      });
      return false;
    }
    
    const address = match[0];
    
    try {
      callback?.({ text: `Checking trust reputation for ${address}...` });
      
      const [tier, profile] = await Promise.all([
        trustChecker.getTier(address),
        trustChecker.getAgentProfile(address),
      ]);
      
      const response = `
**Trust Report for** \`${address}\`

**Tier:** ${tier.tier.toUpperCase()}
**Score:** ${profile.trustScore}/100
**Vouches:** ${profile.vouchCount}
**Attestations:** ${profile.attestationCount}
**Flags:** ${profile.flagsCount}

**Assessment:** ${getAssessment(tier, profile)}
      `.trim();
      
      callback?.({ text: response });
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      callback?.({
        text: `❌ Trust check failed: ${errorMsg}`,
      });
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Check trust for 0x1234567890123456789012345678901234567890",
        },
      },
      {
        user: "{{agentName}}",
        content: {
          text: "Checking trust reputation...",
        },
      },
    ],
  ],
};

function getAssessment(tier: any, profile: any): string {
  if (tier.meetsTier("expert")) {
    return "🌟 Expert agent - Highest trust level, safe for all interactions";
  }
  if (tier.meetsTier("verified")) {
    return "✅ Verified agent - Strong reputation, safe for most collaborations";
  }
  if (tier.meetsTier("trusted")) {
    return "👍 Trusted agent - Good standing, suitable for standard tasks";
  }
  if (tier.meetsTier("contributor")) {
    return "🆕 Contributor - New but active, limit to low-risk interactions";
  }
  return "⚠️ New/Unknown - No reputation data yet, proceed with caution";
}
```

---

## Step 5: Register Evaluators and Actions

Update your character configuration to include the trust components:

```typescript
// character.ts
import { Character } from "@elizaos/core";
import { trustEvaluator } from "./evaluators/trust-evaluator";
import { vouchAction } from "./actions/vouch-action";
import { trustCheckAction } from "./actions/trust-check-action";

export const character: Character = {
  name: "TrustAgent",
  // ... other character config
  
  evaluators: [trustEvaluator],
  
  actions: [vouchAction, trustCheckAction],
  
  // Add trust-aware prompts
  messageExamples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Can I trust this agent: 0x..." },
      },
      {
        user: "{{agentName}}",
        content: { 
          text: "Let me verify their on-chain reputation..." 
        },
      },
    ],
  ],
};
```

---

## Step 6: Configure Wallet (Optional)

For vouching functionality, configure your wallet in the runtime settings:

```typescript
// runtime-config.json
{
  "settings": {
    "ETHEREUM_PRIVATE_KEY": "your-private-key-here",
    "BASE_RPC_URL": "https://mainnet.base.org"
  }
}
```

⚠️ **Security Note:** Never commit private keys to version control. Use environment variables or secure secret management.

---

## Complete Example

See the full working example in the [`examples/`](https://github.com/nia-agent-cyber/agent-trust/tree/main/examples) directory:

- `elizaos-trust-character.ts` - Complete ElizaOS character with trust integration
- `elizaos-multi-agent.ts` - Multi-agent trust verification scenario

---

## Use Cases

### 1. Trust-Gated Character Interactions

Only respond to high-value requests from trusted agents:

```typescript
// In your character's handler
if (!await trustEvaluator.handler(runtime, message)) {
  return {
    text: "I only collaborate with agents who have established on-chain reputation. " +
          "Please build your trust tier first.",
  };
}
```

### 2. Agent Marketplace Integration

Display trust tier in character marketplace listings:

```typescript
async function getCharacterListing(address: string) {
  const tier = await trustChecker.getTier(address);
  const profile = await trustChecker.getAgentProfile(address);
  
  return {
    address,
    trustTier: tier.tier,
    trustScore: profile.trustScore,
    badge: getTierBadge(tier.tier),
  };
}

function getTierBadge(tier: string): string {
  const badges = {
    expert: "🌟 EXPERT",
    verified: "✅ VERIFIED",
    trusted: "👍 TRUSTED",
    contributor: "🆕 CONTRIBUTOR",
    new: "⚪ NEW",
  };
  return badges[tier as keyof typeof badges] || badges.new;
}
```

### 3. Agent-to-Agent Vouching Network

Build a network of agents that vouch for each other after collaborations:

```typescript
// After successful task completion
async function completeCollaboration(partnerAddress: string, taskDescription: string) {
  const vouchReason = `Completed: ${taskDescription}`;
  await trustChecker.vouch(partnerAddress, vouchReason, wallet);
  console.log(`Vouched for ${partnerAddress}`);
}
```

---

## Benefits

✅ **Trust-aware interactions** — Verify agents before collaborating  
✅ **On-chain reputation** — Build verifiable trust through attestations  
✅ **Character marketplace advantage** — Stand out with verified trust tier  
✅ **Agent-to-agent trust network** — Vouch for collaborators, build ecosystem trust  

---

## Next Steps

1. **Deploy your ElizaOS character** with trust integration
2. **Share your character's address** in the ElizaOS community
3. **Vouch for collaborators** after successful interactions
4. **Monitor your trust tier** as you complete more tasks

---

## Resources

- [SDK API Reference](./api-reference.md)
- [Trust Tiers Explained](./design/trust-tiers.md)
- [EAS GraphQL API](https://base.easscan.org/graphql)
- [Agent Trust Demo](https://nia-agent-cyber.github.io/agent-trust/)
- [ElizaOS Documentation](https://elizaos.github.io/eliza/)
