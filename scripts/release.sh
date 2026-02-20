#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load Apple credentials from .env.local if present
if [[ -f "$REPO_ROOT/.env.local" ]]; then
  set -a
  source "$REPO_ROOT/.env.local"
  set +a
fi

# Validate required env vars
missing=()
[[ -z "${APPLE_ID:-}" ]]       && missing+=("APPLE_ID")
[[ -z "${APPLE_PASSWORD:-}" ]] && missing+=("APPLE_PASSWORD")
[[ -z "${APPLE_TEAM_ID:-}" ]]  && missing+=("APPLE_TEAM_ID")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Error: missing required environment variables: ${missing[*]}"
  echo "Add them to $REPO_ROOT/.env.local — see .env.local.example"
  exit 1
fi

APP_NAME="Pedal Editor"
VERSION=$(node -p "require('./tauri/tauri.conf.json').version" 2>/dev/null || echo "0.1.0")
PKG_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.1.0")

if [[ "$VERSION" != "$PKG_VERSION" ]]; then
  echo "Warning: version mismatch — tauri.conf.json ($VERSION) vs package.json ($PKG_VERSION)"
  echo "Update both to the same version before releasing."
  exit 1
fi
BUNDLE_DIR="$REPO_ROOT/tauri/target/release/bundle"
APP_PATH="$BUNDLE_DIR/macos/$APP_NAME.app"
DMG_DIR="$BUNDLE_DIR/dmg"
DMG_PATH="$DMG_DIR/${APP_NAME}_${VERSION}_aarch64.dmg"

echo "Building $APP_NAME v$VERSION..."
echo ""

# Clean stale bundle to avoid signing conflicts
rm -rf "$BUNDLE_DIR"

# Build and sign/notarize the .app (CI env var breaks Tauri's --ci flag)
cd "$REPO_ROOT"
env -u CI \
  APPLE_ID="$APPLE_ID" \
  APPLE_PASSWORD="$APPLE_PASSWORD" \
  APPLE_TEAM_ID="$APPLE_TEAM_ID" \
  pnpm tauri build --bundles app

echo ""
echo "Creating DMG..."

# Create DMG using hdiutil (avoids Finder/AppleScript permission issues)
STAGING=$(mktemp -d)
cp -R "$APP_PATH" "$STAGING/"
ln -s /Applications "$STAGING/Applications"

mkdir -p "$DMG_DIR"
hdiutil create \
  -volname "$APP_NAME" \
  -srcfolder "$STAGING" \
  -ov \
  -format UDZO \
  "$DMG_PATH"

rm -rf "$STAGING"

echo ""
echo "Done! Distributable DMG:"
echo "  $DMG_PATH"
echo "  $(du -sh "$DMG_PATH" | cut -f1)"
