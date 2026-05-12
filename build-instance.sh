#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/dist"
mkdir -p "$DIST"
rm -f "$DIST/KrestMC.zip"

cd "$ROOT/prism-instance"
zip -r "$DIST/KrestMC.zip" . \
  -x '*.DS_Store' \
  -x '__MACOSX/*'

cd "$ROOT"
echo "Built: $DIST/KrestMC.zip"
ls -la "$DIST/KrestMC.zip"
unzip -l "$DIST/KrestMC.zip"
