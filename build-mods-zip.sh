#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/dist"
BUILD="$(mktemp -d -t krestmc-mods-XXXX)"
trap "rm -rf $BUILD" EXIT

# Берём пак из ЛОКАЛЬНОГО чекаута, а не с GH Pages: Pages деплоится отдельным
# workflow параллельно с этим, и сборка успевала прочитать прошлую версию —
# KrestMC-mods.zip отставал на один релиз. Переопределить можно через PACK_URL.
PACK_URL="${PACK_URL:-$ROOT/pack.toml}"
BOOTSTRAP="$ROOT/prism-instance/.minecraft/packwiz-installer-bootstrap.jar"
JAVA_BIN="${JAVA:-java}"

mkdir -p "$DIST"
rm -f "$DIST/KrestMC-mods.zip"

if [[ ! -f "$BOOTSTRAP" ]]; then
  echo "ERROR: packwiz-installer-bootstrap.jar not found at $BOOTSTRAP" >&2
  exit 1
fi

cd "$BUILD"
"$JAVA_BIN" -jar "$BOOTSTRAP" -g -s client "$PACK_URL"

if [[ ! -d "mods" ]] || [[ -z "$(ls -A mods 2>/dev/null)" ]]; then
  echo "ERROR: no mods downloaded — check pack URL and side filter" >&2
  exit 1
fi

# packwiz-installer в CLI-режиме тянет опциональные моды ВСЕГДА, игнорируя
# `default = false` ("option choosing is not implemented in the CLI"), поэтому
# выкидываем их сами: ручная установка должна ставить только базовый набор.
for meta in "$ROOT"/mods/*.pw.toml; do
  grep -q '^optional = true' "$meta" || continue
  fn="$(sed -n 's/^filename = "\(.*\)"/\1/p' "$meta")"
  if [[ -n "$fn" && -f "mods/$fn" ]]; then
    rm -f "mods/$fn"
    echo "Опциональный мод исключён из zip: $fn"
  fi
done

cd mods
zip -r "$DIST/KrestMC-mods.zip" . -x '*.DS_Store'

echo
echo "Built: $DIST/KrestMC-mods.zip"
unzip -l "$DIST/KrestMC-mods.zip"
