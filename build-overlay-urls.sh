#!/usr/bin/env bash
# Parses mods/*.pw.toml, selects side=server and side=both,
# extracts the download URL, writes to dist/krestmc-overlay-urls.txt
set -euo pipefail
out="dist/krestmc-overlay-urls.txt"
mkdir -p dist
> "$out"
for f in mods/*.pw.toml; do
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
