#!/bin/bash
# Agent Trust CLI wrapper
# Usage: trust.sh <command> [args...]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="$HOME/.openclaw/workspace/agent-trust/packages/sdk"

# Check if SDK exists
if [ ! -d "$SDK_DIR" ]; then
    echo "❌ Agent Trust SDK not found at $SDK_DIR"
    echo "   Clone the repo first: git clone https://github.com/nia-agent-cyber/agent-trust"
    exit 1
fi

COMMAND="$1"
shift || true

case "$COMMAND" in
    score)
        ADDRESS="$1"
        if [ -z "$ADDRESS" ]; then
            echo "Usage: trust.sh score <address>"
            exit 1
        fi
        cd "$SDK_DIR"
        npx ts-node scripts/cli.ts score "$ADDRESS"
        ;;
        
    vouch)
        ADDRESS="$1"
        LEVEL="$2"
        CONTEXT="${@:3}"
        
        if [ -z "$ADDRESS" ] || [ -z "$LEVEL" ]; then
            echo "Usage: trust.sh vouch <address> <level 1-5> [context]"
            exit 1
        fi
        
        if [ -z "$AGENT_TRUST_PRIVATE_KEY" ]; then
            echo "❌ Set AGENT_TRUST_PRIVATE_KEY environment variable"
            exit 1
        fi
        
        cd "$SDK_DIR"
        PRIVATE_KEY="$AGENT_TRUST_PRIVATE_KEY" npx ts-node scripts/cli.ts vouch "$ADDRESS" "$LEVEL" "$CONTEXT"
        ;;
        
    flag)
        ADDRESS="$1"
        SEVERITY="$2"
        REASON="${@:3}"
        
        if [ -z "$ADDRESS" ] || [ -z "$SEVERITY" ] || [ -z "$REASON" ]; then
            echo "Usage: trust.sh flag <address> <severity 1-5> <reason>"
            exit 1
        fi
        
        if [ -z "$AGENT_TRUST_PRIVATE_KEY" ]; then
            echo "❌ Set AGENT_TRUST_PRIVATE_KEY environment variable"
            exit 1
        fi
        
        cd "$SDK_DIR"
        PRIVATE_KEY="$AGENT_TRUST_PRIVATE_KEY" npx ts-node scripts/cli.ts flag "$ADDRESS" "$SEVERITY" "$REASON"
        ;;
        
    *)
        echo "Agent Trust - On-chain reputation for AI agents"
        echo ""
        echo "Commands:"
        echo "  score <address>                     Check trust score"
        echo "  vouch <address> <level> [context]   Vouch for an agent (1-5)"
        echo "  flag <address> <severity> <reason>  Flag bad behavior (1-5)"
        echo ""
        echo "Environment:"
        echo "  AGENT_TRUST_PRIVATE_KEY   Required for vouch/flag"
        echo ""
        echo "Examples:"
        echo "  trust.sh score 0xC0D7CA6B3C1EF108696ced64F97729177F823189"
        echo "  trust.sh vouch 0x... 4 'Great collaboration'"
        echo "  trust.sh flag 0x... 5 'Attempted scam'"
        ;;
esac
