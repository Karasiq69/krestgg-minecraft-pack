#!/usr/bin/env bash
# Parses mods/*.pw.toml, selects side=server and side=both,
# extracts the download URL, writes to dist/krestmc-overlay-urls.txt
#
# SKIPLIST: mods listed here are excluded from server overlay because the
# base modpack (Prominence II: Hasturian Era) already bundles them. Pushing
# our own version triggers Fabric ModResolutionException: duplicate.
# Their .pw.toml entries stay in repo because the CLIENT-side build (KrestMC.zip)
# still benefits from them as transitive deps for plasmo-voice etc.
SERVER_SKIP=(
  "fabric-api"
  "fabric-language-kotlin"
)

set -euo pipefail
out="dist/krestmc-overlay-urls.txt"
mkdir -p dist
> "$out"

is_skipped() {
  local name="$1"
  for skip in "${SERVER_SKIP[@]}"; do
    [[ "$name" == "$skip" ]] && return 0
  done
  return 1
}

for f in mods/*.pw.toml; do
  base=$(basename "$f" .pw.toml)
  if is_skipped "$base"; then
    echo "SKIP $base (bundled by base modpack)" >&2
    continue
  fi
  side=$(grep -E '^side = ' "$f" | sed -E 's/side = "(.*)"/\1/')
  if [[ "$side" == "server" || "$side" == "both" ]]; then
    # URL lives in `[download]\nurl = "..."` block
    url=$(awk '/^\[download\]/{flag=1; next} flag && /^url = /{gsub(/^url = "|"$/, ""); print; exit}' "$f")
    if [[ -n "$url" ]]; then
      echo "$url" >> "$out"
    else
      echo "WARN: no url in $f" >&2
    fi
  fi
done
echo "Generated $(wc -l < "$out") URLs in $out"
cat "$out"
