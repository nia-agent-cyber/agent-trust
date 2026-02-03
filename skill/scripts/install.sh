#!/bin/bash
# OpenClaw Agent Trust Skill Installation Script
# This script sets up the Agent Trust skill with all dependencies

set -e

SKILL_NAME="agent-trust"
INSTALL_DIR="$HOME/.openclaw/skills/$SKILL_NAME"
WORKSPACE_DIR="$HOME/.openclaw/workspace/agent-trust"

echo "🔧 Installing Agent Trust skill for OpenClaw..."

# Create directories if they don't exist
mkdir -p "$INSTALL_DIR"
mkdir -p "$WORKSPACE_DIR"

# Copy skill files
echo "📋 Copying skill files..."
cp -r "$(dirname "$0")/.." "$INSTALL_DIR/"

# Set up SDK workspace
echo "📦 Setting up Agent Trust SDK..."
if [ ! -d "$WORKSPACE_DIR/packages" ]; then
    mkdir -p "$WORKSPACE_DIR"
    cp -r packages "$WORKSPACE_DIR/"
    cp -r docs "$WORKSPACE_DIR/"
    cp README.md "$WORKSPACE_DIR/"
    cp PROGRESS.md "$WORKSPACE_DIR/"
fi

# Install SDK dependencies
cd "$WORKSPACE_DIR/packages/sdk"
if [ ! -d "node_modules" ]; then
    echo "📥 Installing SDK dependencies..."
    npm install
fi

# Verify installation
echo "✅ Verifying installation..."
cd "$WORKSPACE_DIR/packages/sdk"
if npx ts-node scripts/cli.ts --help > /dev/null 2>&1; then
    echo "✅ Agent Trust SDK is working correctly"
else
    echo "❌ SDK verification failed"
    exit 1
fi

# Make scripts executable
chmod +x "$INSTALL_DIR/scripts/"*.sh
chmod +x "$INSTALL_DIR/scripts/"*.py

echo ""
echo "🎉 Agent Trust skill installed successfully!"
echo ""
echo "Usage examples:"
echo "  scripts/trust.sh score 0xYourAddress"
echo "  scripts/trust.sh vouch 0xAgentAddress 4 'Great work'"
echo "  scripts/trust.sh flag 0xBadAddress 3 'Delayed delivery'"
echo ""
echo "Configuration:"
echo "  Set AGENT_TRUST_PRIVATE_KEY for vouch/flag operations"
echo ""
echo "📚 Documentation: $WORKSPACE_DIR/docs/"