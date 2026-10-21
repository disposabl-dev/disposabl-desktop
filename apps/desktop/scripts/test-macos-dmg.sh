#!/usr/bin/env bash
set -euo pipefail

dmg="${1:?Pass the path to the built DMG}"
test_dir="$(mktemp -d)"
mount_dir="$test_dir/mounted"
app="$test_dir/Disposabl Desktop.app"
mkdir "$mount_dir"

cleanup() {
  hdiutil detach "$mount_dir" -quiet || true
  rm -rf "$test_dir"
}
trap cleanup EXIT

hdiutil verify "$dmg"
hdiutil attach "$dmg" -readonly -nobrowse -mountpoint "$mount_dir"
ditto "$mount_dir/Disposabl Desktop.app" "$app"
codesign --verify --deep --strict --verbose=2 "$app"
codesign --display --verbose=2 "$app"
APP_EXECUTABLE="$app/Contents/MacOS/Disposabl Desktop" bun run test:smoke
