import { status } from 'minecraft-server-util';
import { HOST, SLP_PORT, SLP_CACHE_TTL_MS } from './config.js';

export type SlpResult = {
  online: number;
  max: number;
  version: string;
  motd: string;
  latencyMs: number;
};

let cache: { value: SlpResult | null; expiresAt: number } = {
  value: null,
  expiresAt: 0,
};

export async function pingServer(): Promise<SlpResult | null> {
  const now = Date.now();
  if (now < cache.expiresAt) {
    return cache.value;
  }

  try {
    const r = await status(HOST, SLP_PORT, { timeout: 5000 });
    const result: SlpResult = {
      online: r.players.online,
      max: r.players.max,
      version: r.version.name,
      motd: r.motd.clean,
      latencyMs: r.roundTripLatency,
    };
    cache = { value: result, expiresAt: now + SLP_CACHE_TTL_MS };
    return result;
  } catch {
    cache = { value: null, expiresAt: now + SLP_CACHE_TTL_MS };
    return null;
  }
}
