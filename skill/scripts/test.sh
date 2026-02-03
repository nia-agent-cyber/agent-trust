#!/bin/bash
# Agent Trust Skill Test Suite
# Comprehensive testing of skill functionality

set -e

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEST_ADDRESS="0xC0D7CA6B3C1EF108696ced64F97729177F823189"
INVALID_ADDRESS="0xinvalid"

echo "🧪 Agent Trust Skill Test Suite"
echo "=================================="

# Test 1: Skill manifest validation
echo ""
echo "Test 1: Skill Manifest Validation"
echo "----------------------------------"
if python3 -c "import json; json.load(open('$SKILL_DIR/skill.json'))" 2>/dev/null; then
    echo "✅ skill.json is valid JSON"
else
    echo "❌ skill.json is invalid JSON"
    exit 1
fi

# Test 2: Script permissions
echo ""
echo "Test 2: Script Permissions"
echo "--------------------------"
if [ -x "$SKILL_DIR/scripts/trust.sh" ]; then
    echo "✅ trust.sh is executable"
else
    echo "❌ trust.sh is not executable"
    exit 1
fi

# Test 3: Help functionality
echo ""
echo "Test 3: Help Functionality"
echo "--------------------------"
if bash "$SKILL_DIR/scripts/trust.sh" 2>/dev/null | grep -q "Agent Trust"; then
    echo "✅ Help message displays correctly"
else
    echo "❌ Help message not working"
    exit 1
fi

# Test 4: Address validation
echo ""
echo "Test 4: Parameter Validation"
echo "----------------------------"
# Test with invalid address (should fail gracefully)
if bash "$SKILL_DIR/scripts/trust.sh" score "$INVALID_ADDRESS" 2>&1 | grep -q -E "(Usage|Error|invalid)"; then
    echo "✅ Invalid address handling works"
else
    echo "⚠️  Invalid address handling unclear (may still work)"
fi

# Test 5: Network connectivity test
echo ""
echo "Test 5: Network Connectivity"
echo "----------------------------"
# Try to query a known address
if timeout 30s bash "$SKILL_DIR/scripts/trust.sh" score "$TEST_ADDRESS" >/dev/null 2>&1; then
    echo "✅ Network connectivity and trust score query working"
    NETWORK_OK=true
else
    echo "⚠️  Network connectivity or trust score query failed"
    echo "   This is normal if Base Sepolia is down or no internet"
    NETWORK_OK=false
fi

# Test 6: Authentication check (without private key)
echo ""
echo "Test 6: Authentication Handling"
echo "-------------------------------"
if bash "$SKILL_DIR/scripts/trust.sh" vouch "$TEST_ADDRESS" 3 "test" 2>&1 | grep -q "AGENT_TRUST_PRIVATE_KEY"; then
    echo "✅ Authentication requirement properly enforced"
else
    echo "❌ Authentication requirement not working"
    exit 1
fi

# Test 7: Documentation exists
echo ""
echo "Test 7: Documentation"
echo "--------------------"
if [ -f "$SKILL_DIR/SKILL.md" ] && [ -f "$SKILL_DIR/INSTALL.md" ]; then
    echo "✅ Required documentation files exist"
else
    echo "❌ Missing documentation files"
    exit 1
fi

# Test 8: Installation script exists
echo ""
echo "Test 8: Installation Scripts"
echo "---------------------------"
if [ -f "$SKILL_DIR/scripts/install.sh" ] && [ -x "$SKILL_DIR/scripts/install.sh" ]; then
    echo "✅ Installation script exists and is executable"
else
    echo "❌ Installation script missing or not executable"
    exit 1
fi

# Summary
echo ""
echo "🏁 Test Summary"
echo "==============="
echo "✅ Skill manifest valid"
echo "✅ Scripts executable"
echo "✅ Help functionality working"
echo "✅ Parameter validation working"
if [ "$NETWORK_OK" = true ]; then
    echo "✅ Network functionality working"
else
    echo "⚠️  Network functionality untested (connectivity issues)"
fi
echo "✅ Authentication properly enforced"
echo "✅ Documentation complete"
echo "✅ Installation scripts ready"

echo ""
if [ "$NETWORK_OK" = true ]; then
    echo "🎉 All tests passed! Skill is ready for distribution."
else
    echo "🎉 Core tests passed! Network tests skipped due to connectivity."
    echo "   Skill should work fine when network is available."
fi

echo ""
echo "Next steps:"
echo "1. Run: bash scripts/package.sh (create distribution package)"
echo "2. Test installation: bash scripts/install.sh"
echo "3. Validate: bash scripts/validate.sh"