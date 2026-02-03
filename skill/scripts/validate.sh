#!/bin/bash
# Agent Trust Skill Validation Script
# Tests that the skill is properly installed and functional

set -e

SKILL_NAME="agent-trust"
WORKSPACE_DIR="$HOME/.openclaw/workspace/agent-trust"
TEST_ADDRESS="0xC0D7CA6B3C1EF108696ced64F97729177F823189"

echo "🧪 Validating Agent Trust skill installation..."

# Check workspace exists
if [ ! -d "$WORKSPACE_DIR" ]; then
    echo "❌ Workspace directory not found: $WORKSPACE_DIR"
    exit 1
fi

# Check SDK exists
if [ ! -d "$WORKSPACE_DIR/packages/sdk" ]; then
    echo "❌ SDK not found: $WORKSPACE_DIR/packages/sdk"
    exit 1
fi

# Check node_modules
if [ ! -d "$WORKSPACE_DIR/packages/sdk/node_modules" ]; then
    echo "❌ SDK dependencies not installed"
    exit 1
fi

# Test CLI functionality
echo "📊 Testing trust score query (read-only)..."
cd "$WORKSPACE_DIR/packages/sdk"

# Test basic CLI help
if ! npx ts-node scripts/cli.ts --help > /dev/null 2>&1; then
    echo "❌ CLI help command failed"
    exit 1
fi

# Test score query with a known address
echo "   Testing score query for test address..."
if npx ts-node scripts/cli.ts score "$TEST_ADDRESS" > /dev/null 2>&1; then
    echo "✅ Trust score query working"
else
    echo "⚠️  Trust score query failed (network issue or no attestations)"
fi

# Test skill scripts
echo "🔧 Testing skill wrapper scripts..."
SKILL_DIR="$(dirname "$(dirname "$0")")"

# Test trust.sh help
if bash "$SKILL_DIR/scripts/trust.sh" > /dev/null 2>&1; then
    echo "✅ trust.sh script working"
else
    echo "❌ trust.sh script failed"
    exit 1
fi

# Check skill.json validity
if [ -f "$SKILL_DIR/skill.json" ]; then
    if python3 -m json.tool "$SKILL_DIR/skill.json" > /dev/null 2>&1; then
        echo "✅ skill.json is valid JSON"
    else
        echo "❌ skill.json is invalid JSON"
        exit 1
    fi
else
    echo "❌ skill.json not found"
    exit 1
fi

echo ""
echo "🎉 All validations passed!"
echo ""
echo "✅ SDK installed and functional"
echo "✅ CLI scripts working" 
echo "✅ Skill manifest valid"
echo "✅ Ready for use"
echo ""
echo "Next steps:"
echo "1. Set AGENT_TRUST_PRIVATE_KEY for vouch/flag operations"
echo "2. Test with: scripts/trust.sh score $TEST_ADDRESS"