#!/bin/bash
# OpenClaw Skill Packaging Script for Agent Trust
# Creates a distributable skill package

set -e

SKILL_NAME="agent-trust"
VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(dirname "$SKILL_DIR")"
BUILD_DIR="/tmp/openclaw-skill-$SKILL_NAME-$VERSION"

echo "📦 Packaging OpenClaw skill: $SKILL_NAME v$VERSION"

# Clean up any previous build
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Copy skill files
echo "📋 Copying skill files..."
cp -r "$SKILL_DIR"/* "$BUILD_DIR/"

# Copy necessary dependencies from repo
echo "📥 Including dependencies..."
mkdir -p "$BUILD_DIR/dependencies"
cp -r "$REPO_ROOT/packages" "$BUILD_DIR/dependencies/"
cp -r "$REPO_ROOT/docs" "$BUILD_DIR/dependencies/"
cp "$REPO_ROOT/README.md" "$BUILD_DIR/dependencies/"
cp "$REPO_ROOT/PROGRESS.md" "$BUILD_DIR/dependencies/"

# Create package info
echo "📄 Creating package metadata..."
cat > "$BUILD_DIR/PACKAGE_INFO.json" << EOF
{
  "name": "$SKILL_NAME",
  "version": "$VERSION",
  "type": "openclaw-skill",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "repository": "https://github.com/nia-agent-cyber/agent-trust",
  "dependencies": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0",
    "openclaw": ">=1.0.0"
  },
  "files": {
    "skill.json": "Skill configuration and commands",
    "SKILL.md": "Skill documentation",
    "INSTALL.md": "Installation instructions",
    "scripts/": "Executable scripts",
    "dependencies/": "Required SDK and documentation"
  }
}
EOF

# Update install script to handle bundled dependencies
echo "🔧 Configuring bundled installation..."
cat > "$BUILD_DIR/scripts/install-bundled.sh" << 'EOF'
#!/bin/bash
# Bundled installation script for Agent Trust skill

set -e

SKILL_NAME="agent-trust"
INSTALL_DIR="$HOME/.openclaw/skills/$SKILL_NAME"
WORKSPACE_DIR="$HOME/.openclaw/workspace/agent-trust"
BUNDLE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔧 Installing Agent Trust skill for OpenClaw (bundled version)..."

# Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$WORKSPACE_DIR"

# Copy skill files (excluding dependencies)
echo "📋 Installing skill..."
cp "$BUNDLE_DIR/skill.json" "$INSTALL_DIR/"
cp "$BUNDLE_DIR/SKILL.md" "$INSTALL_DIR/"
cp "$BUNDLE_DIR/INSTALL.md" "$INSTALL_DIR/"
mkdir -p "$INSTALL_DIR/scripts"
cp "$BUNDLE_DIR/scripts/"* "$INSTALL_DIR/scripts/"

# Set up SDK from bundle
echo "📦 Setting up SDK from bundle..."
cp -r "$BUNDLE_DIR/dependencies/"* "$WORKSPACE_DIR/"

# Install dependencies
cd "$WORKSPACE_DIR/packages/sdk"
echo "📥 Installing SDK dependencies..."
npm install

# Validate
echo "✅ Validating installation..."
cd "$INSTALL_DIR"
bash scripts/validate.sh

echo "🎉 Agent Trust skill installed successfully!"
EOF

chmod +x "$BUILD_DIR/scripts/install-bundled.sh"

# Create archive
ARCHIVE_NAME="openclaw-skill-$SKILL_NAME-$VERSION.tar.gz"
echo "🗜️  Creating archive: $ARCHIVE_NAME"
cd "$(dirname "$BUILD_DIR")"
tar -czf "$ARCHIVE_NAME" "$(basename "$BUILD_DIR")"

echo ""
echo "✅ Package created successfully!"
echo "📦 Archive: $(dirname "$BUILD_DIR")/$ARCHIVE_NAME"
echo "📁 Build directory: $BUILD_DIR"
echo ""
echo "Distribution:"
echo "1. Share the .tar.gz file with other OpenClaw users"
echo "2. To install: extract and run scripts/install-bundled.sh"
echo "3. Or use the regular install script for development"