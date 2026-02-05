#!/bin/bash
#
# Deploy Agent Trust to Base Mainnet
# 
# This script handles 1Password authentication and runs the deployment.
#
# Usage:
#   ./scripts/deploy-mainnet.sh
#
# Prerequisites:
#   - 1Password CLI installed and configured
#   - "Nia Crypto Wallet (Base)" item in Nia vault
#   - At least 0.01 ETH in wallet on Base mainnet
#

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "           AGENT TRUST - BASE MAINNET DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if already signed in
if ! op whoami &>/dev/null; then
    echo "🔐 1Password authentication required..."
    eval $(op signin)
fi

# Get private key from 1Password
echo "🔑 Retrieving private key from 1Password..."
PRIVATE_KEY=$(op item get "Nia Crypto Wallet (Base)" --vault Nia --fields password --reveal)

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Failed to retrieve private key"
    exit 1
fi

echo "✅ Private key retrieved"
echo ""

# Run deployment
cd "$(dirname "$0")/.."
echo "📦 Running deployment script..."
echo ""

PRIVATE_KEY="$PRIVATE_KEY" npx ts-node scripts/deploy-mainnet.ts

echo ""
echo "🎉 Deployment complete!"
