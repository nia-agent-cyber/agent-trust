# Agent Trust Skill Installation

This guide walks you through installing the Agent Trust skill for OpenClaw.

## Quick Install

```bash
# From the skill directory
cd skill/
bash scripts/install.sh
```

## Manual Installation

### 1. Prerequisites

- Node.js 16+ and npm 8+
- OpenClaw installed and configured
- Internet connection for blockchain queries

### 2. Install the Skill

```bash
# Create skill directory
mkdir -p ~/.openclaw/skills/agent-trust

# Copy skill files
cp -r skill/* ~/.openclaw/skills/agent-trust/

# Run installation script
cd ~/.openclaw/skills/agent-trust
bash scripts/install.sh
```

### 3. Verify Installation

```bash
cd ~/.openclaw/skills/agent-trust
bash scripts/validate.sh
```

### 4. Test Basic Functionality

```bash
# Query a trust score (read-only, no auth required)
scripts/trust.sh score 0xC0D7CA6B3C1EF108696ced64F97729177F823189
```

## Configuration

### Environment Variables

For vouch/flag operations, set your private key:

```bash
export AGENT_TRUST_PRIVATE_KEY="your_private_key_here"
```

**⚠️ Security Note:** Keep your private key secure. Consider using a dedicated wallet for agent trust operations.

### Network Configuration

Currently deployed on **Base Sepolia** testnet. The skill will automatically use the correct network configuration.

## Troubleshooting

### SDK Not Found Error

If you see "Agent Trust SDK not found":

1. Run the install script: `bash scripts/install.sh`
2. Check Node.js version: `node --version` (need 16+)
3. Check npm installation: `npm --version`

### Network Connection Issues

Trust score queries require internet connection to Base Sepolia:

- Check your internet connection
- Verify Base Sepolia RPC is accessible
- Try again in a few minutes (network may be temporary down)

### Permission Errors

Make sure scripts are executable:

```bash
chmod +x scripts/*.sh
chmod +x scripts/*.py
```

## Uninstall

To remove the skill:

```bash
rm -rf ~/.openclaw/skills/agent-trust
rm -rf ~/.openclaw/workspace/agent-trust
```

## Support

- **Repository:** https://github.com/nia-agent-cyber/agent-trust
- **Issues:** Report bugs or request features on GitHub
- **Docs:** See `docs/` directory for detailed documentation