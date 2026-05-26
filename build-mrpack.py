#!/usr/bin/env python3
"""Build KrestMC.mrpack by merging Prominence II: Hasturian Era base
with our packwiz client overlay (Plasmo Voice + Distant Horizons opt-in).

Output: dist/KrestMC.mrpack — a single-click .mrpack for Prism / Modrinth App.
Stdlib only (urllib, zipfile, hashlib, tomllib — requires Python 3.11+).
"""
import json
import hashlib
import os
import shutil
import sys
import tomllib
import zipfile
from pathlib import Path
from urllib.request import urlopen, urlretrieve

HASTURIAN_PROJECT = "EGs3lC8D"
HASTURIAN_VERSION = "9r2hKvJH"
SKIPLIST = {"fabric-api", "fabric-language-kotlin", "lithium", "ledger"}

REPO = Path(__file__).parent.resolve()
DIST = REPO / "dist"
DIST.mkdir(exist_ok=True)

WORK = Path("/tmp/krestmc-mrpack-build")
if WORK.exists():
    shutil.rmtree(WORK)
WORK.mkdir(parents=True)

# 1. Fetch Hasturian version metadata
api = f"https://api.modrinth.com/v2/version/{HASTURIAN_VERSION}"
print(f"Fetching version metadata from {api}", flush=True)
with urlopen(api) as resp:
    meta = json.load(resp)
mrpack_url = meta["files"][0]["url"]
size_mb = meta["files"][0]["size"] // (1024 * 1024)
print(f"Downloading {meta['name']} ({size_mb}MB) from {mrpack_url}", flush=True)

mrpack_path = WORK / "hasturian.mrpack"
urlretrieve(mrpack_url, mrpack_path)

# 2. Unpack base mrpack
unpacked = WORK / "unpacked"
unpacked.mkdir()
with zipfile.ZipFile(mrpack_path) as z:
    z.extractall(unpacked)
index_path = unpacked / "modrinth.index.json"
index = json.loads(index_path.read_text())
print(f"Base index: {len(index['files'])} files", flush=True)

existing_paths = {f["path"] for f in index["files"]}

# 3. Walk our overlay (mods/*.pw.toml)
mods_dir = REPO / "mods"
overlay_count = 0
for pw in sorted(mods_dir.glob("*.pw.toml")):
    base = pw.name[: -len(".pw.toml")]
    if base in SKIPLIST:
        print(f"  SKIP {base} (in SKIPLIST)", flush=True)
        continue
    with pw.open("rb") as f:
        data = tomllib.load(f)
    side = data.get("side", "both")
    if side == "server":
        print(f"  SKIP {base} (server-only)", flush=True)
        continue
    filename = data["filename"]
    path = f"mods/{filename}"
    if path in existing_paths:
        print(f"  SKIP {base} ({path} already in Hasturian)", flush=True)
        continue
    url = data["download"]["url"]
    print(f"  ADD {base} -> {filename}", flush=True)
    jar_path = WORK / filename
    urlretrieve(url, jar_path)
    contents = jar_path.read_bytes()
    sha1 = hashlib.sha1(contents).hexdigest()
    sha512 = hashlib.sha512(contents).hexdigest()
    size = len(contents)
    # env: opt-in client mods become "optional", required client mods "required" on client side,
    # mods with side="both" considered required on both client and server.
    if data.get("option", {}).get("optional"):
        env = {"client": "optional", "server": "unsupported"}
    elif side == "client":
        env = {"client": "required", "server": "unsupported"}
    else:  # both
        env = {"client": "required", "server": "required"}
    index["files"].append({
        "path": path,
        "hashes": {"sha1": sha1, "sha512": sha512},
        "env": env,
        "downloads": [url],
        "fileSize": size,
    })
    overlay_count += 1

# 4. Patch metadata so launchers show "KrestMC", not "Prominence II"
index["name"] = "KrestMC"
index["versionId"] = f"krestmc-{os.environ.get('GITHUB_RUN_NUMBER', 'local')}"
if not index.get("summary") and not index.get("description"):
    index["summary"] = "Prominence II: Hasturian Era + KrestMC server overlay"

print(f"Final index: {len(index['files'])} files (+{overlay_count} overlay)", flush=True)
index_path.write_text(json.dumps(index, indent=2))

# 5. Repack
out = DIST / "KrestMC.mrpack"
if out.exists():
    out.unlink()
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for f in sorted(unpacked.rglob("*")):
        if f.is_file():
            z.write(f, f.relative_to(unpacked))

size_kib = out.stat().st_size // 1024
print(f"Built {out} ({size_kib} KiB)", flush=True)
