#!/usr/bin/env bash
set -euo pipefail

# Собирает отдельный Prism-инстанс для ОДИНОЧНОЙ игры: моды тянутся из
# общего пака через packwiz при запуске (client-сторона, включая Inventory Sorting).

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/dist"
mkdir -p "$DIST"
rm -f "$DIST/KrestMC-SP.zip"

cd "$ROOT/prism-instance-sp"
zip -r "$DIST/KrestMC-SP.zip" . \
  -x '*.DS_Store' \
  -x '__MACOSX/*'

cd "$ROOT"
echo "Built: $DIST/KrestMC-SP.zip"
ls -la "$DIST/KrestMC-SP.zip"
unzip -l "$DIST/KrestMC-SP.zip"
