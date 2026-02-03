#!/bin/bash
# Agent Trust CLI wrapper for OpenClaw
# Usage: trust.sh <command> [args...]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Try multiple possible SDK locations
SDK_LOCATIONS=(
    "$HOME/.openclaw/workspace/agent-trust/packages/sdk"
    "$(dirname "$SKILL_DIR")/packages/sdk"  # If running from repo root
    "$HOME/.openclaw/workspace-trust-coder/packages/sdk"  # Alternative workspace
)

SDK_DIR=""
for dir in "${SDK_LOCATIONS[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/scripts/cli.ts" ]; then
        SDK_DIR="$dir"
        break
    fi
done

# Check if SDK exists
if [ -z "$SDK_DIR" ]; then
    echo "❌ Agent Trust SDK not found"
    echo "   Searched in:"
    for dir in "${SDK_LOCATIONS[@]}"; do
        echo "   - $dir"
    done
    echo ""
    echo "   To install:"
    echo "   1. Run: bash $SKILL_DIR/scripts/install.sh"
    echo "   2. Or clone: git clone https://github.com/nia-agent-cyber/agent-trust $HOME/.openclaw/workspace/agent-trust"
    exit 1
fi

echo "🔍 Using SDK at: $SDK_DIR" >&2

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
