import { sendCommand } from './rcon.js';

export type PlayerList = { count: number; max: number; players: string[] };

/**
 * Parse the RCON `/list` output into a player list.
 *
 * The server runs EssentialsX, which overrides `/list`. Its RCON output carries
 * Minecraft section-sign (§) colour codes and groups players by permission group
 * on separate lines, e.g.:
 *   "§6There are §c13§6 out of maximum §c40§6 players online.\n§6default§r: a, b, c"
 * The vanilla format ("There are 2 of a max of 30 players online: Notch, Herobrine")
 * is still handled. Strip colour codes (§-codes and any ANSI escapes) before parsing.
 */
export function parsePlayerList(raw: string): PlayerList {
  const clean = raw
    .replace(/\[[0-9;]*m/g, '')
    .replace(/§./g, '');

  // Count line: matches both "of a max of" (vanilla) and "out of maximum" (EssentialsX).
  const countMatch = clean.match(/There are (\d+)\D+?(\d+) players online/i);
  const count = countMatch ? parseInt(countMatch[1], 10) : 0;
  const max = countMatch ? parseInt(countMatch[2], 10) : 0;

  // Names follow a colon: inline after "online:" (vanilla) or on per-group lines
  // like "default: a, b" (EssentialsX). The bare count line has no colon and is
  // skipped. Minecraft usernames never contain ':', so this split is safe.
  const players: string[] = [];
  for (const line of clean.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    for (const part of line.slice(idx + 1).split(',')) {
      const name = part.trim();
      if (name && !players.includes(name)) players.push(name);
    }
  }
  return { count, max, players };
}

// Short cache so many concurrent landing visitors don't each trigger an RCON
// round-trip. The landing polls every 60s, but each browser polls independently.
const CACHE_TTL_MS = 10_000;
let cache: { value: PlayerList; expiresAt: number } | null = null;

/** Fetch the live player list over RCON, cached briefly. Throws if RCON is down. */
export async function getPlayerList(now = Date.now()): Promise<PlayerList> {
  if (cache && now < cache.expiresAt) return cache.value;
  const raw = await sendCommand('list');
  const value = parsePlayerList(raw);
  cache = { value, expiresAt: now + CACHE_TTL_MS };
  return value;
}
